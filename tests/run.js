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
    const inp = await page.$('#story .block.current input');
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
  /* templated names */
  for (const d of ['union', 'helix', 'jury', 'razor', 'spear', 'vector', 'grid', 'oa']) if (!fs.existsSync(path.join(ROOT, `assets/img/uniform-${d}.jpg`))) out.push('uniform-' + d);
  for (const d of ['union', 'helix', 'jury', 'razor', 'spear', 'oa', 'vector', 'grid', 'veil']) if (!fs.existsSync(path.join(ROOT, `assets/img/emblems/${d}.png`))) out.push('emblem ' + d);
  return out;
});

suite('static: service worker caches every script index.html loads', async () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  return [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]).filter((s) => !sw.includes(`'./${s}'`)).map((s) => 'sw.js SHELL lacks ' + s);
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
  const runs = QUICK ? 3 : 8;
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
