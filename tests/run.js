/* City 9 test suite.
   Run from the repository root:   node tests/run.js            (full, a few minutes)
                                   node tests/run.js --quick    (about a minute)
   Needs Playwright with Chromium (npm i -D playwright && npx playwright install chromium).
   Exit code 0 = all suites passed. */
const fs = require('fs');
const path = require('path');
const { chromium, devices } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const URL = 'file://' + path.join(ROOT, 'index.html');
const QUICK = process.argv.includes('--quick');
const ONLY = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7);
const results = [];
const log = (...a) => console.log(...a);

function suite(name, fn) {
  results.push({ name, fn });
}

/* -------------------------------------------------------------- helpers */
async function openGame(browser, opts) {
  const page = await browser.newPage(opts || {});
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/fonts|Failed to load resource: net::ERR_(NAME|INTERNET|CONNECTION)/.test(m.text())) errors.push('CONSOLE ' + m.text());
  });
  page.on('requestfailed', (r) => {
    if (!/fonts\.(googleapis|gstatic)/.test(r.url())) errors.push('REQFAIL ' + r.url().replace('file://' + ROOT, ''));
  });
  await page.goto(URL);
  await page.evaluate(() => (G.CHECK_DELAY = 0));
  return { page, errors };
}

/* start straight in the duty loop, skipping prologue and training */
const SERVICE = (o) => {
  try {
    localStorage.clear();
  } catch (e) {}
  G.newGame();
  const s = G.state();
  Object.assign(s, { name: 'Tester', phase: 'union', rank: o.rank || '05', merit: o.merit || 10 });
  s.mem.grade = 'Graded with distinction';
  Object.keys(s.skills).forEach((k) => (s.skills[k] = o.skill || 1));
  s.rel.rook = 30;
  if (o.div) {
    s.div = o.div;
    s.flags.passed_04 = s.flags.passed_03 = s.flags.pb_03 = true;
  }
  G.goto('u_start');
};

async function randomWalk(page, steps, opts) {
  opts = opts || {};
  const seen = {};
  const problems = [];
  let ended = null;
  for (let step = 0; step < steps; step++) {
    const info = await page.evaluate(() => {
      const s = G.state();
      const cur = document.querySelector('#story .block.current');
      const btns = [...document.querySelectorAll('#story .block.current .choices .choice:not(:disabled), #story .block.current .mini-skip')];
      const txt = cur ? cur.innerText : '';
      return { scene: s.scene, phase: s.phase, n: btns.length, labels: btns.map((b) => b.innerText), nf: txt.includes('not found'), bad: (txt.match(/\bundefined\b|\bNaN\b|\[object \w+\]/) || [])[0] };
    });
    seen[info.scene] = (seen[info.scene] || 0) + 1;
    if (info.nf) problems.push('scene not found, reached from ' + info.scene);
    if (info.bad && !(opts.ignoreBad || []).includes(info.scene)) problems.push(`"${info.bad}" in text of ${info.scene}`);
    if (info.phase === 'ended' || (opts.stopAt && opts.stopAt.includes(info.scene))) {
      ended = info.scene;
      break;
    }
    const inp = await page.$('#story .block.current .input-row input');
    if (inp) {
      await inp.fill('Tester');
      await page.click('#story .block.current .input-row .choice');
      continue;
    }
    if (!info.n) {
      await page.waitForTimeout(400);
      const n2 = await page.evaluate(() => document.querySelectorAll('#story .block.current .choices .choice:not(:disabled), #story .block.current .mini-skip').length);
      if (!n2) {
        problems.push('dead end at ' + info.scene);
        break;
      }
      continue;
    }
    let i = Math.floor(Math.random() * info.n);
    if (opts.prefer) {
      const p = info.labels.findIndex((l) => opts.prefer.test(l));
      if (p >= 0 && Math.random() < 0.6) i = p;
    }
    await page.evaluate((i) => {
      const b = [...document.querySelectorAll('#story .block.current .choices .choice:not(:disabled), #story .block.current .mini-skip')];
      if (b[i]) b[i].click();
    }, i);
    await page.waitForTimeout(2);
    if (opts.each) await page.evaluate(opts.each, step);
  }
  return { seen, problems, ended };
}

/* ------------------------------------------------------------- suites */

suite('static: every scene, check and duty target exists', async (browser) => {
  const { page, errors } = await openGame(browser);
  const missing = await page.evaluate(() => {
    const out = [];
    const ids = new Set(Object.keys(G.scenes));
    const chk = (from, id) => typeof id === 'string' && !ids.has(id) && out.push(from + ' -> ' + id);
    for (const [id, sc] of Object.entries(G.scenes)) {
      if (Array.isArray(sc.choices))
        sc.choices.forEach((c) => {
          chk(id, c.go);
          if (c.check) chk(id, c.check.pass), chk(id, c.check.fail);
        });
      if (sc.input) chk(id, sc.input.go);
      if (sc.mini) chk(id, sc.mini.pass), chk(id, sc.mini.fail);
    }
    for (const [k, d] of Object.entries(G.duties)) chk('duty ' + k, d.first), chk('duty ' + k, d.routine);
    G.beats.forEach((b) => chk('beat ' + b.id, b.scene));
    return out;
  });
  return missing.concat(errors);
});

suite('engine: an enter hook returning a non-scene string is reported, not followed', async (browser) => {
  const { page, errors } = await openGame(browser);
  const r = await page.evaluate(() => {
    G.addScenes({ t_guard: { enter: (s) => (s.flags.t_guard = 'held'), text: ['guard ok'], choices: [{ t: 'Back', go: 'title' }] } });
    G.newGame();
    G.goto('t_guard');
    return { scene: G.state().scene, text: document.querySelector('#story .block.current').textContent };
  });
  const out = [];
  if (r.scene !== 't_guard' || !/guard ok/.test(r.text)) out.push('scene did not render: ' + JSON.stringify(r));
  const reported = errors.filter((e) => /Ignored non-scene return "held"/.test(e));
  if (!reported.length) out.push('no console error for the stray return value');
  return out.concat(errors.filter((e) => !/Ignored non-scene return "held"/.test(e)));
});

suite('quality of life: undo, keys, odds, orders, day summary', async (browser) => {
  const { page, errors } = await openGame(browser);
  const out = [];
  await page.evaluate(() => {
    G.addScenes({
      t_a: { text: ['A'], choices: [{ t: 'Plain', fx: { merit: 7 }, go: 't_b' }, { t: 'Roll', check: { skill: 'authority', diff: 0, pass: 't_b', fail: 't_b' } }] },
      t_b: { text: ['B'], choices: [{ t: 'Only way on', go: 't_c' }] },
      t_c: { text: ['C'], choices: [{ t: 'Back', go: 't_a' }] },
    });
  });
  await page.evaluate(SERVICE, {});
  await page.evaluate(() => G.goto('t_a'));
  const odds = await page.evaluate(() => document.querySelector('#story .block.current .tag.chk').title);
  if (!/^Base 40/.test(odds)) out.push('check tag has no odds breakdown: ' + odds);
  const m0 = await page.evaluate(() => G.state().merit);
  await page.keyboard.press('1');
  await page.waitForTimeout(50);
  let r = await page.evaluate(() => ({ scene: G.state().scene, can: G.canUndo() }));
  if (r.scene !== 't_b' || !r.can) out.push('plain choice should be undoable: ' + JSON.stringify(r));
  await page.keyboard.press('u');
  await page.waitForTimeout(50);
  r = await page.evaluate(() => ({ scene: G.state().scene, merit: G.state().merit, blocks: document.querySelectorAll('#story .block.current').length }));
  if (r.scene !== 't_a' || r.merit !== m0 || r.blocks !== 1) out.push('undo did not restore the scene and state: ' + JSON.stringify(r) + ' merit before ' + m0);
  await page.keyboard.press('2');
  await page.waitForTimeout(1500);
  r = await page.evaluate(() => ({ scene: G.state().scene, can: G.canUndo() }));
  if (r.scene !== 't_b' || r.can) out.push('a skill check must not be undoable: ' + JSON.stringify(r));
  await page.keyboard.press('Space');
  await page.waitForTimeout(50);
  r = await page.evaluate(() => G.state().scene);
  if (r !== 't_c') out.push('Space should take the only choice, scene is ' + r);
  const side = await page.evaluate(() => {
    const s = G.state();
    s.pb = { retry: s.day + 2 };
    G.goto('t_a');
    return document.querySelector('#side-content').innerText;
  });
  if (!/Current orders/i.test(side) || !/Board retry from day/.test(side)) out.push('dossier has no current orders: ' + side.slice(0, 200));
  const sum = await page.evaluate(() => {
    const s = G.state();
    s.mem.baseDay = s.day;
    s.mem.dayBase = { merit: s.merit - 5, lp: s.lp, tokens: s.tokens, hp: s.hp + 3, rel: Object.assign({}, s.rel, { rook: s.rel.rook - 10 }) };
    let lines = [];
    G.ext.u_evening.forEach((e) => e.text && (lines = e.text(lines, s, G) || lines));
    return lines.join('|');
  });
  if (!/DAY \d+: Merit \+5 · Health −3 · .*▲/.test(sum)) out.push('evening summary wrong: ' + sum);
  return out.concat(errors);
});

suite('static: every image the code names exists on disk', async () => {
  const files = ['index.html', 'manifest.json', 'css/style.css', 'sw.js', ...fs.readdirSync(path.join(ROOT, 'js')).filter((f) => f.endsWith('.js')).map((f) => 'js/' + f), ...fs.readdirSync(path.join(ROOT, 'js/content')).map((f) => 'js/content/' + f)];
  const out = [];
  for (const f of files) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    for (const m of src.matchAll(/assets\/[\w\-./]+\.(?:jpg|png|webp|svg)/g)) {
      if (/NN\./.test(m[0])) continue;
      if (!fs.existsSync(path.join(ROOT, m[0]))) out.push(`${f}: ${m[0]}`);
    }
  }
  /* the game loads .webp; a .jpg path in code means tools/optimize-images.py was not run or a path was missed */
  for (const f of files) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    for (const m of src.matchAll(/assets\/img\/(?!ref\/)[\w\-./]+\.jpg/g)) out.push(`${f}: ${m[0]} should be .webp`);
  }
  for (const f of ['portraits/rook-thumb', 'portraits/granite', 'docs/faces/f01', 'docs/faces-cwu/c12', 'docs/id-card']) if (!fs.existsSync(path.join(ROOT, `assets/img/${f}.webp`))) out.push('missing ' + f + '.webp');
  /* templated names */
  for (const d of ['union', 'helix', 'jury', 'razor', 'spear', 'vector', 'grid', 'oa']) if (!fs.existsSync(path.join(ROOT, `assets/img/uniform-${d}.webp`))) out.push('uniform-' + d);
  for (const d of ['union', 'helix', 'jury', 'razor', 'spear', 'vector', 'grid']) for (const r of ['04', 'ofc']) for (const t of ['', '-thumb']) if (!fs.existsSync(path.join(ROOT, `assets/img/portraits/unit-${d}-${r}${t}.webp`))) out.push(`unit portrait ${d}-${r}${t}`);
  for (const d of ['union', 'helix', 'jury', 'razor', 'spear', 'oa', 'vector', 'grid', 'veil']) if (!fs.existsSync(path.join(ROOT, `assets/img/emblems/${d}.png`))) out.push('emblem ' + d);
  return out;
});

suite('static: every codex entry belongs to a codex chapter', async (browser) => {
  const { page, errors } = await openGame(browser);
  const loose = await page.evaluate(() => {
    const placed = new Set((G.CODEX_GROUPS || []).flatMap((g) => g.ids));
    return Object.keys(G.codexEntries).filter((id) => !placed.has(id)).map((id) => 'codex entry not in G.CODEX_GROUPS: ' + id);
  });
  return loose.concat(errors);
});

suite('static: every division has ten duties of its own', async (browser) => {
  const { page, errors } = await openGame(browser);
  const out = await page.evaluate(() => {
    const res = [];
    for (const div of ['UNION', 'JURY', 'HELIX', 'RAZOR', 'SPEAR', 'VECTOR', 'GRID']) {
      const s = G.fresh();
      Object.assign(s, { div, rank: 'OfC', phase: 'union', day: 30, c2: { stage: 3 }, c3: { stage: 2, done: false } });
      const own = Object.keys(G.duties).filter((k) => !['raid', 'owsweep'].includes(k) && G.duties[k].if && G.duties[k].if(s));
      if (own.length < 10) res.push(`${div} has ${own.length} duties of its own`);
    }
    return res;
  });
  return out.concat(errors);
});

suite('static: service worker caches every script index.html loads', async () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  return [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]).filter((s) => !sw.includes(`'./${s}'`)).map((s) => 'sw.js SHELL lacks ' + s);
});

suite('static: service worker VERSION matches the code it caches', async () => {
  const { execFileSync } = require('child_process');
  try {
    execFileSync('python3', [path.join(ROOT, 'tools/bump-sw.py'), '--check'], { stdio: 'pipe' });
    return [];
  } catch (e) {
    return [String(e.stdout || e.message).trim()];
  }
});

suite('full game from a new character (random play)', async (browser) => {
  const { page, errors } = await openGame(browser);
  const out = [];
  const runs = QUICK ? 2 : 5;
  for (let r = 0; r < runs; r++) {
    await page.evaluate(() => {
      try {
        localStorage.clear();
      } catch (e) {}
      G.newGame();
    });
    const w = await randomWalk(page, QUICK ? 250 : 450, { stopAt: ['ch1_end'] });
    out.push(...w.problems);
  }
  return out.concat(errors);
});

suite('service loop and shared systems (raids, reports, informants, boards, discipline)', async (browser) => {
  const { page, errors } = await openGame(browser);
  const out = [];
  const seen = {};
  const runs = QUICK ? 5 : 10;
  for (let r = 0; r < runs; r++) {
    const o = [{}, { rank: '04', merit: 70 }, { div: 'JURY', rank: '03', merit: 140 }, { div: 'GRID', rank: '03' }][r % 4];
    await page.evaluate(SERVICE, o);
    const w = await randomWalk(page, QUICK ? 300 : 600, {
      prefer: /Apartment raid|Raid on a tip|ASSET|informants|EVALUATION|promotion board|Sign and file/i,
      ignoreBad: ['u_start'],
      each: (step) => {
        if (step % 120 === 60) G.state().susp = Math.min(95, G.state().susp + 15);
      },
    });
    out.push(...w.problems);
    Object.entries(w.seen).forEach(([k, v]) => (seen[k] = (seen[k] || 0) + v));
  }
  for (const must of ['raid_search', 'raid_verdict', 'rep_draft', 'rep_file', 'inf_meet', 'pb_q', 'pb_result', 'disc_hearing']) if (!seen[must]) out.push('never reached ' + must);
  return out.concat(errors);
});

suite('chapter 2 arcs (UNION and JURY)', async (browser) => {
  const { page, errors } = await openGame(browser);
  const out = [];
  for (const div of ['UNION', 'JURY', 'UNION', 'JURY'].slice(0, QUICK ? 2 : 4)) {
    await page.evaluate((div) => {
      try {
        localStorage.clear();
      } catch (e) {}
      G.newGame();
      const s = G.state();
      Object.assign(s, { name: 'Tester', phase: 'union', rank: '03', div, day: 20, merit: 80, lp: 15 });
      Object.keys(s.skills).forEach((k) => (s.skills[k] = 3));
      Object.assign(s.rel, { rook: 30, granite: 20, tomas: 10 });
      s.mem.grade = 'Graded';
      s.flags.passed_04 = s.flags.passed_03 = s.flags.pb_03 = true;
      G.goto('c2_start');
    }, div);
    const w = await randomWalk(page, QUICK ? 300 : 500, { stopAt: ['c2_end_union', 'c2_end_jury'] });
    out.push(...w.problems);
  }
  return out.concat(errors);
});

suite('chapter 2 arcs for HELIX, RAZOR, SPEAR, VECTOR and GRID', async (browser) => {
  const { page, errors } = await openGame(browser);
  const out = [];
  const divs = ['HELIX', 'RAZOR', 'SPEAR', 'VECTOR', 'GRID'];
  for (const div of QUICK ? divs : divs.concat(divs)) {
    await page.evaluate((div) => {
      try {
        localStorage.clear();
      } catch (e) {}
      G.newGame();
      const s = G.state();
      Object.assign(s, { name: 'Tester', phase: 'union', rank: '03', div, day: 20, merit: 80, lp: 12, res: 25 });
      Object.keys(s.skills).forEach((k) => (s.skills[k] = 3));
      Object.assign(s.rel, { rook: 20, granite: 10 });
      s.mem.grade = 'Graded';
      s.flags.passed_04 = s.flags.passed_03 = s.flags.pb_03 = true;
      G.goto('ch1_end');
    }, div);
    const w = await randomWalk(page, QUICK ? 300 : 450, { stopAt: ['x2_' + div.toLowerCase() + '_end'] });
    out.push(...w.problems.map((p) => div + ': ' + p));
    if (!w.seen['x2_' + div.toLowerCase() + '_intro']) out.push(div + ': arc never started');
    if (w.ended !== 'x2_' + div.toLowerCase() + '_end' && w.ended !== 'end_deserviced' && w.ended !== 'end_amputated') out.push(div + ': arc did not finish (' + (w.ended || 'none') + ')');
    const street = Object.keys(w.seen).filter((k) => /^d_(ration|check|market|insp|cast|escort|rail)/.test(k)).length;
    if (street) out.push(div + ': played UNION street duties');
  }
  return out.concat(errors);
});

suite('save slots: two records side by side', async (browser) => {
  const { page, errors } = await openGame(browser);
  const r = await page.evaluate(() => {
    localStorage.clear();
    G.newGameInSlot(1);
    G.state().name = 'Alpha';
    G.goto('cc_bg');
    G.newGameInSlot(2);
    G.state().name = 'Bravo';
    G.goto('cc_bg');
    const a = G.slotInfo(1), b = G.slotInfo(2);
    G.continueSlot(1);
    const n1 = G.state().name;
    G.continueSlot(2);
    const n2 = G.state().name;
    G.goto('title');
    const titleChoices = document.querySelectorAll('#story .block.current .choice').length;
    G.clearSlot(2);
    return { a: a && a.name, b: b && b.name, n1, n2, titleChoices, gone: !G.slotInfo(2), kept: !!G.slotInfo(1) };
  });
  const out = [];
  if (r.a !== 'Alpha' || r.b !== 'Bravo') out.push('slots did not keep separate records: ' + JSON.stringify(r));
  if (r.n1 !== 'Alpha' || r.n2 !== 'Bravo') out.push('continuing a slot loaded the wrong record');
  if (r.titleChoices < 3) out.push('title screen does not list both records');
  if (!r.gone || !r.kept) out.push('clearing a slot touched the wrong record');
  await page.evaluate(() => localStorage.clear());
  return out.concat(errors);
});

suite('chapter 3 for every division', async (browser) => {
  const { page, errors } = await openGame(browser);
  const out = [];
  const ends = {};
  const divs = ['UNION', 'JURY', 'HELIX', 'RAZOR', 'SPEAR', 'VECTOR', 'GRID'];
  for (const [i, div] of (QUICK ? divs : divs.concat(divs)).entries()) {
    await page.evaluate(
      ({ div, i }) => {
        try {
          localStorage.clear();
        } catch (e) {}
        G.newGame();
        const s = G.state();
        Object.assign(s, { name: 'Tester', phase: 'union', rank: div === 'UNION' || div === 'JURY' ? '02' : '03', div, day: 30, merit: 120, lp: 12, res: i % 2 ? 35 : 5 });
        Object.keys(s.skills).forEach((k) => (s.skills[k] = 3));
        Object.assign(s.rel, { rook: 30, granite: 20, ilse: 10, tinker: 10 });
        s.mem.grade = 'Graded';
        s.flags.passed_04 = s.flags.passed_03 = s.flags.pb_03 = s.flags.passed_02 = true;
        s.c2 = { div, stage: 9, next: 20 };
        s.flags.c2_end_day = 20;
        G.goto('u_board');
      },
      { div, i }
    );
    const w = await randomWalk(page, QUICK ? 250 : 400, { stopAt: ['c3_end'] });
    out.push(...w.problems.map((p) => div + ': ' + p));
    if (!w.seen.c3_start) out.push(div + ': chapter 3 never started');
    ends[w.ended || 'none'] = (ends[w.ended || 'none'] || 0) + 1;
  }
  if (!ends.c3_end) out.push('no run reached c3_end: ' + JSON.stringify(ends));
  return out.concat(errors);
});

/* Chapters 4 onward share one setup: a Union unit with every earlier chapter done, two days
   after the last one ended. `tweak(s, div, i)` runs in the page (it is sent as source, so it
   can use G but not variables from this file) to set rank, resistance, relations and flags. */
const CH_END = { 3: 46, 4: 66, 5: 86, 6: 106 };
async function chapterSuite(browser, { n, steps, prefer, stopAt, runs, tweak }) {
  const { page, errors } = await openGame(browser);
  const out = [];
  const ends = {};
  const divs = ['UNION', 'JURY', 'HELIX', 'RAZOR', 'SPEAR', 'VECTOR', 'GRID'];
  for (const [i, div] of (runs || (QUICK ? divs : divs.concat(divs))).entries()) {
    await page.evaluate(
      ({ n, div, i, src, CH_END }) => {
        try { localStorage.clear(); } catch (e) {}
        G.newGame();
        const s = G.state();
        Object.assign(s, { name: 'Tester', phase: 'union', div, day: CH_END[n - 1] + 4, chapter: n - 1 });
        Object.keys(s.skills).forEach((k) => (s.skills[k] = 3));
        Object.assign(s.rel, { rook: 30, granite: 20, tomas: 10 });
        s.mem.grade = 'Graded';
        s.flags.passed_04 = s.flags.passed_03 = s.flags.pb_03 = s.flags.passed_02 = true;
        s.c2 = { div, stage: 9, next: 20, arc: true, done: true };
        s.flags.c2_end_day = 20;
        if (n > 3) s.c3 = { stage: 5, done: true, endDay: CH_END[3], result: 'held', intel: 3 };
        if (n > 4) s.c4 = { stage: 9, done: true, endDay: CH_END[4], sentName: '"Salt"' };
        if (n > 5) s.c5 = { stage: 9, done: true, endDay: CH_END[5], veil: 'accepted' };
        if (n > 6) s.c6 = { stage: 9, done: true, endDay: CH_END[6], train: 'stopped', kinPart: 'promise', kin: { key: 'mira', name: 'Mira', img: 'mira' } };
        new Function('return ' + src)()(s, div, i);
        G.goto('u_board');
      },
      { n, div, i, src: tweak.toString(), CH_END }
    );
    const w = await randomWalk(page, steps, { stopAt: stopAt || ['c' + n + '_end'], prefer });
    out.push(...w.problems.map((p) => div + ': ' + p));
    if (!w.seen['c' + n + '_start']) out.push(div + ': chapter ' + n + ' never started');
    ends[w.ended || 'none'] = (ends[w.ended || 'none'] || 0) + 1;
  }
  if (!(stopAt || ['c' + n + '_end']).some((e) => ends[e])) out.push('no run reached c' + n + '_end: ' + JSON.stringify(ends));
  return { out: out.concat(errors), page };
}

suite('chapter 4 for every division (squad, district, crowd)', async (browser) =>
  (await chapterSuite(browser, {
    n: 4,
    steps: QUICK ? 300 : 450,
    tweak: (s, div, i) => {
      Object.assign(s, { rank: div === 'UNION' || div === 'JURY' ? '01' : '02', merit: 150, lp: 12, res: i % 2 ? 35 : 5 });
      Object.assign(s.rel, { ilse: 10, tinker: 10 });
      s.c2 = { div, stage: 9, next: 20 };
      if (i % 3 === 0) G._sys.recruit(s, { cid: '12345', type: 'standard', face: 2 }, true).trust = 50;
    },
  })).out
);

suite('chapter 5 for every division (Academy, VEIL)', async (browser) =>
  (await chapterSuite(browser, {
    n: 5,
    steps: QUICK ? 350 : 500,
    prefer: /VEIL|Go\.|Follow her|COMMAND/,
    tweak: (s, div, i) => {
      Object.assign(s, { rank: i % 2 ? 'EpU' : '01', merit: 200, lp: 22, res: i % 3 ? 35 : 5 });
      G.formSquad(s);
    },
  })).out
);

suite('chapter 6 for every division (Collection, the railway)', async (browser) =>
  (await chapterSuite(browser, {
    n: 6,
    steps: QUICK ? 350 : 500,
    tweak: (s, div, i) => {
      Object.assign(s, { rank: i % 2 ? 'OfC' : 'EpU', merit: 260, lp: 25, res: i % 3 ? 35 : 5 });
      if (i % 2) s.rel.mira = 40;
      if (i % 3 === 0) s.flags.veil_shadow = true;
      G.formSquad(s);
    },
  })).out
);

suite('chapter 7 for every division (Anticitizen One)', async (browser) => {
  const divs = ['UNION', 'JURY', 'HELIX', 'RAZOR', 'SPEAR', 'VECTOR', 'GRID'];
  const { out, page } = await chapterSuite(browser, {
    n: 7,
    steps: QUICK ? 350 : 500,
    runs: QUICK ? divs.concat(divs.slice(0, 3)) : divs.concat(divs, divs),
    stopAt: ['c7_end', 'disc_tribunal'],
    tweak: (s, div, i) => {
      Object.assign(s, { rank: i % 2 ? 'OfC' : 'EpU', merit: 300, lp: 30, res: i % 3 ? 35 : 5 });
      s.rel.mira = 40;
      if (i % 3 === 0) s.flags.veil_shadow = true;
      s.c6.train = i % 2 ? 'ran' : 'stopped';
      G.formSquad(s);
    },
  });
  return out;
});

suite('division transfer exam at grade 01', async (browser) => {
  const { page, errors } = await openGame(browser);
  const out = [];
  const res = { pass: 0, fail: 0 };
  for (let i = 0; i < (QUICK ? 6 : 12); i++) {
    const from = ['UNION', 'JURY', 'HELIX', 'RAZOR', 'SPEAR', 'VECTOR', 'GRID'][i % 7];
    await page.evaluate((from) => {
      try { localStorage.clear(); } catch (e) {}
      G.newGame();
      const s = G.state();
      Object.assign(s, { name: 'T', phase: 'union', rank: '01', div: from, day: 40, merit: 150, lp: 20 });
      Object.keys(s.skills).forEach((k) => (s.skills[k] = 3));
      s.mem.grade = 'G';
      s.flags.passed_04 = s.flags.passed_03 = s.flags.pb_03 = s.flags.passed_02 = true;
      G.formSquad(s);
      s.mem.xferDay = -1;
      s.world.mDay = s.day;
      G.goto('xfer_pick');
    }, from);
    const w = await randomWalk(page, 120, { stopAt: ['xfer_res'] });
    out.push(...w.problems.map((p) => from + ': ' + p));
    const r = await page.evaluate(() => ({ div: G.state().div, x: G.state().xfer, flags: G.state().flags }));
    if (!r.x) { out.push(from + ': no exam taken'); continue; }
    if (r.x.pass) {
      res.pass++;
      if (r.div !== r.x.to) out.push(from + ': passed but division did not change');
    } else {
      res.fail++;
      if (r.div !== from) out.push(from + ': failed but division changed');
      if (!(r.flags['xfer_block_' + r.x.to] > 40)) out.push(from + ': failed but no reapply block');
    }
  }
  /* blocked division cannot be chosen */
  const locked = await page.evaluate(() => {
    const s = G.state();
    s.flags.xfer_block_GRID = s.day + 14;
    s.div = 'UNION';
    G.goto('xfer_pick');
    return [...document.querySelectorAll('#story .block.current .choice')].some((b) => /GRID/.test(b.innerText) && b.disabled);
  });
  if (!locked) out.push('a blocked division could still be applied for');
  return out.concat(errors);
});

suite('district events fire from high resentment and low order', async (browser) => {
  const { page, errors } = await openGame(browser);
  const out = [];
  for (const kind of ['r', 'o']) {
    const r = await page.evaluate((kind) => {
      G.newGame();
      const s = G.state();
      Object.assign(s, { name: 'T', phase: 'union', rank: '03', div: 'UNION', day: 9 });
      s.mem.grade = 'G';
      let hit = null;
      for (let i = 0; i < 20 && !hit; i++) {
        Object.keys(s.dist).forEach((k) => (s.dist[k] = kind === 'r' ? { o: 60, r: 95 } : { o: 10, r: 20 }));
        s.world.ev = null;
        s.world.mDay = -1;
        G.goto('u_night');
        if (s.scene === 'w_event') hit = s.world.evNow.kind;
      }
      const btn = document.querySelector('#story .block.current .choice');
      if (btn) btn.click();
      return hit;
    }, kind);
    if (r !== (kind === 'r' ? 'rev' : 'res')) out.push('district event did not fire for ' + kind + ': ' + r);
  }
  return out.concat(errors);
});

suite('crowd control minigame: winnable by play, losable by neglect', async (browser) => {
  const out = [];
  for (const [label, play] of [['played', true], ['ignored', false]]) {
    const { page, errors } = await openGame(browser, devices['iPhone 13']);
    await page.evaluate(SERVICE, {});
    await page.evaluate(() => {
      G.state().day = 5;
      G.goto('cr_ration');
    });
    const t0 = Date.now();
    while (Date.now() - t0 < 60000) {
      const st = await page.evaluate(() => G.state().scene);
      if (st !== 'cr_ration') break;
      if (play)
        await page.evaluate(() => {
          const secs = [...document.querySelectorAll('#story .block.current .cr-sec')];
          const val = (el) => parseFloat(el.querySelector('.cr-bar span').style.width) || 0;
          secs.sort((a, b) => val(b) - val(a));
          const free = document.querySelector('#story .block.current .cr-units small');
          if (free && !free.textContent.startsWith('0')) secs[0].querySelector('.cr-post').click();
          const sp = document.querySelector('#story .block.current .cr-speak');
          if (sp && !sp.disabled && val(secs[0]) < 75) sp.click();
          const pull = secs[0].querySelector('.cr-pull');
          if (val(secs[0]) > 70 && !pull.disabled) pull.click();
          const bt = document.querySelector('#story .block.current .cr-baton');
          if (val(secs[0]) > 88 && bt && !bt.disabled) bt.click();
        });
      await page.waitForTimeout(400);
    }
    const end = await page.evaluate(() => G.state().scene);
    if (play && end !== 'cr_ration_ok') out.push('a played crowd should be winnable, ended at ' + end);
    if (!play && end !== 'cr_ration_bad') out.push('an ignored crowd should riot, ended at ' + end);
    const ovf = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    if (ovf) out.push('crowd minigame overflows on phone');
    out.push(...errors);
  }
  return out;
});

suite('circuit and tail minigames', async (browser) => {
  const out = [];
  const { page, errors } = await openGame(browser, devices['iPhone 13']);
  const solv = await page.evaluate(() => {
    const T = G._circuitTest;
    let bad = 0;
    for (let i = 0; i < 300; i++) {
      const b = T.makeBoard(4 + (i % 2), 5 + (i % 2));
      if (!b) { bad++; continue; }
      const g = b.grid;
      b.grid = b.sol;
      if (!T.powered(b).done) bad++;
      b.grid = g;
    }
    return bad;
  });
  if (solv) out.push(solv + ' of 300 circuit boards were unsolvable');
  /* play the circuit by setting the solution through rotations */
  await page.evaluate(SERVICE, { div: 'GRID', rank: '03' });
  await page.evaluate(() => G.goto('mg_grid'));
  await page.waitForTimeout(300);
  const solved = await page.evaluate(async () => {
    const tiles = [...document.querySelectorAll('#story .block.current .ci-tile')];
    for (let k = 0; k < 4 * tiles.length && G.state().scene === 'mg_grid'; k++) {
      tiles[k % tiles.length].click();
    }
    return G.state().scene;
  });
  await page.waitForTimeout(600);
  const sc = await page.evaluate(() => G.state().scene);
  if (!/^mg_grid/.test(sc)) out.push('circuit scene left unexpectedly: ' + sc);
  /* tail: always hang back -> lose; mostly keep pace -> some result */
  await page.evaluate(() => G.goto('mg_tail'));
  await page.waitForTimeout(300);
  for (let i = 0; i < 12; i++) {
    const done = await page.evaluate(() => {
      const b = document.querySelector('#story .block.current .tl-btns [data-d="far"]');
      if (!b || b.disabled) return true;
      b.click();
      return false;
    });
    if (done) break;
  }
  await page.waitForTimeout(500);
  const t = await page.evaluate(() => G.state().scene);
  if (t !== 'mg_tail_bad') out.push('hanging back every block should lose the subject, got ' + t);
  const ovf = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  if (ovf) out.push('minigame overflows on phone');
  return out.concat(errors);
});

suite('division minigames: triage, watch, breach, sample', async (browser) => {
  const out = [];
  const { page, errors } = await openGame(browser, devices['iPhone 13']);
  await page.evaluate(SERVICE, { div: 'HELIX', rank: '03', skill: 3 });
  const play = async (scene, step, ms) => {
    await page.evaluate((sc) => G.goto(sc), scene);
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      const sc = await page.evaluate(() => G.state().scene);
      if (sc !== scene) return sc;
      await page.evaluate(step);
      await page.waitForTimeout(120);
    }
    return await page.evaluate(() => G.state().scene);
  };
  /* good play wins */
  let r = await play('mg_triage', () => {
    const pts = [...document.querySelectorAll('#story .block.current .tri-pt')].filter((b) => !b.disabled);
    const working = pts.filter((b) => b.classList.contains('work'));
    if (working.length < 2) {
      const low = pts.filter((b) => !b.classList.contains('work')).sort((a, b) => parseFloat(a.querySelector('.cr-bar span').style.width) - parseFloat(b.querySelector('.cr-bar span').style.width))[0];
      if (low) low.click();
    }
  }, 50000);
  if (r !== 'mg_triage_ok') out.push('triage played well ended at ' + r);
  r = await play('mg_watch', () => {
    const h = document.querySelector('#story .block.current .wt-face.hot');
    if (h) h.click();
  }, 50000);
  if (r !== 'mg_watch_ok') out.push('watch played well ended at ' + r);
  r = await play('mg_breach', () => {
    const f = document.querySelector('#story .block.current .br-fig.show');
    if (!f) return;
    const hostile = /wrench|pistol|lunging|crowbar/.test(f.textContent);
    const btn = document.querySelector(`#story .block.current [data-a="${hostile ? 'fire' : 'hold'}"]`);
    if (btn) btn.click();
  }, 50000);
  if (r !== 'mg_breach_ok') out.push('breach played well ended at ' + r);
  r = await play('mg_sample', () => {
    const b = document.querySelector('#story .block.current [data-a="out"]');
    const nEl = document.querySelector('#story .block.current .sm-n');
    if (!b || !nEl) return;
    const n = +nEl.textContent;
    const risk = parseFloat(document.querySelector('#story .block.current .risk span').style.width);
    if (b && !b.disabled) (n >= 3 && risk > 45 ? b : document.querySelector('#story .block.current [data-a="take"]')).click();
  }, 30000);
  if (!/^mg_sample_(ok|bad)$/.test(r)) out.push('sample did not finish: ' + r);
  /* neglect loses */
  r = await play('mg_triage', () => {}, 50000);
  if (r !== 'mg_triage_bad') out.push('ignored triage should lose, got ' + r);
  r = await play('mg_breach', () => {}, 50000);
  if (r !== 'mg_breach_bad') out.push('frozen breach should lose, got ' + r);
  const ovf = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  if (ovf) out.push('overflow on phone');
  return out.concat(errors);
});

suite('document inspection minigame on phone and desktop', async (browser) => {
  const out = [];
  for (const opts of [{ viewport: { width: 1300, height: 950 } }, devices['iPhone 13']]) {
    const { page, errors } = await openGame(browser, opts);
    await page.evaluate(SERVICE, {});
    for (const sc of ['d_check_docs', 'd_check_queue', 'ss_start']) {
      await page.evaluate((sc) => G.goto(sc), sc);
      await page.waitForTimeout(300);
      if (sc === 'ss_start') continue;
      const ok = await page.evaluate(() => !!document.querySelector('#story .block.current .mini'));
      if (!ok) out.push('no minigame rendered in ' + sc);
      await page.evaluate(() => {
        const a = document.querySelector('#story .block.current .approve');
        if (a) a.click();
      });
      await page.waitForTimeout(1500);
    }
    const ovf = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    if (ovf) out.push('horizontal overflow at ' + JSON.stringify(opts.viewport));
    out.push(...errors);
  }
  return out;
});

suite('saves: autosave, export and import round-trip', async (browser) => {
  const { page, errors } = await openGame(browser);
  await page.evaluate(SERVICE, {});
  await randomWalk(page, 40, {});
  const r = await page.evaluate(() => {
    const before = JSON.stringify(G.state());
    const code = G.exportSave();
    const ok = G.importSave(code);
    const after = JSON.stringify(G.state());
    const cont = G.continueGame();
    return { ok, same: before === after, cont, scene: G.state().scene };
  });
  const out = [];
  if (!r.ok) out.push('import failed');
  if (!r.same) out.push('state changed through export/import');
  if (!r.cont) out.push('continue from autosave failed');
  /* a save from before the shared systems existed must still load and play */
  const old = await page.evaluate(() => {
    G.goto('u_board');
    const s = JSON.parse(JSON.stringify(G.state()));
    ['disc', 'inf', 'rep', 'pb', 'raid', 'ss', 'iq', 'c2', 'stats'].forEach((k) => delete s[k]);
    s.v = 1;
    delete s.mem.boardExtra;
    localStorage.setItem('c9rp_auto_v1', JSON.stringify(s));
    return G.continueGame();
  });
  if (!old) out.push('old save did not load');
  const w = await randomWalk(page, 60, {});
  return out.concat(w.problems, errors);
});

/* ---------------------------------------------------------------- run */
(async () => {
  const browser = await chromium.launch();
  let failed = 0;
  for (const s of results) {
    if (ONLY && !s.name.includes(ONLY)) continue;
    const t0 = Date.now();
    let problems;
    try {
      problems = [...new Set(await s.fn(browser))];
    } catch (e) {
      problems = ['suite crashed: ' + e.message];
    }
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    if (problems.length) {
      failed++;
      log(`✗ ${s.name} (${secs}s)`);
      problems.slice(0, 15).forEach((p) => log('    ' + p));
      if (problems.length > 15) log(`    … ${problems.length - 15} more`);
    } else log(`✓ ${s.name} (${secs}s)`);
  }
  await browser.close();
  log(failed ? `\n${failed} suite(s) failed` : '\nall suites passed');
  process.exit(failed ? 1 : 0);
})();
