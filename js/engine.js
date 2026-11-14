/* =========================================================================
   CITY 9 // CIVIL PROTECTION — text RP engine
   Plain script (no modules) so the game runs straight from file://
   ========================================================================= */
(function () {
  'use strict';

  const G = (window.G = window.G || {});
  G.scenes = {};
  G.codexEntries = {};
  G.duties = {};
  G.beats = [];
  G.CHECK_DELAY = 450;

  G.addScenes = (obj) => Object.assign(G.scenes, obj);

  /* Scene extensions: a later file can add behaviour to an existing scene without rewriting it.
       G.extend('u_board', {
         before: (s, G) => 'other_scene' | undefined,   // runs before the scene's own enter; may redirect
         after:  (s, G) => 'other_scene' | undefined,   // runs after it
         text:   (lines, s, G) => lines,                // receives the resolved paragraphs
         choices:(list, s, G) => list,                  // receives the resolved choices
       });
     Extensions run in the order they were registered. G.ext lists them per scene. */
  G.ext = {};
  G.extend = (id, e) => (G.ext[id] = G.ext[id] || []).push(e);
  const exts = (id) => G.ext[id] || [];
  G.addCodex = (obj) => Object.assign(G.codexEntries, obj);

  /* ---------------------------------------------------------------- data */

  G.SKILLS = {
    firearms: 'Firearms',
    melee: 'Melee & Restraint',
    medical: 'Field Medicine',
    fitness: 'Conditioning',
    perception: 'Perception',
    comms: 'Radio & Protocol',
    authority: 'Authority',
    deception: 'Deception',
  };

  G.RANKS = ['RcT', '05', '04', '03', '02', '01', 'EpU', 'OfC', 'SqL', 'DvL', 'AdC', 'CmD', 'SeC', 'EA'];
  G.RANK_NAMES = {
    RcT: 'Recruit',
    '05': '05 Protection Unit',
    '04': '04 Protection Unit',
    '03': '03 Protection Unit',
    '02': '02 Protection Unit',
    '01': '01 Protection Unit',
    EpU: 'Elite Protection Unit',
    OfC: 'Field Officer',
    SqL: 'Squadron Leader',
    DvL: 'Division Leader',
    AdC: 'Adjutant Commander',
    CmD: 'Field Commander',
    SeC: 'Sectorial Commander',
    EA: 'Earth Administrator',
  };

  /* merit needed while holding a rank before the next evaluation unlocks */
  G.PROMO = {
    '05': { next: '04', merit: 25 },
    '04': { next: '03', merit: 60 },
  };

  /* the promotion that is open to this unit right now, or null (systems.js adds boards and probation) */
  G.promoFor = (s) => {
    const p = G.PROMO[s.rank];
    if (!p || (p.if && !p.if(s))) return null;
    if (G.promoBlocked && G.promoBlocked(s)) return null;
    return p;
  };

  G.ITEMS = {
    leaflet: { name: 'Rebel leaflet', desc: 'A hand-printed sheet with a lambda in the corner. Seditious print.', contraband: true, grade: 'red' },
    drawing: { name: "Mira's drawing", desc: 'A ration wrapper with a pencil sketch on the inside: two kids on a rooftop, looking at a sky with no Citadel in it.' },
    ration: { name: 'Spare ration pack', desc: 'Grey nutrient bar, a can of sector water. Worth more than tokens in the Stacks.' },
    medkit: { name: 'HELIX field kit', desc: 'Biogel, sutures, a coagulant injector. Issued property. Logged by serial number.' },
    cigarettes: { name: 'Pre-war cigarettes', desc: 'Half a pack, brand worn off. Black-market currency. Unregistered tobacco.', contraband: true, grade: 'green' },
    keycard: { name: 'Canal Gate 3 keycard', desc: 'A maintenance card. It should not be in your pocket. Non-authorised access card.', contraband: true, grade: 'yellow' },
    photo: { name: 'Old photograph', desc: 'Your parents, before the war. The colours have gone the shade of weak tea.' },
  };

  G.PEOPLE = {
    mira: { name: 'Mira', role: 'Your sister · D5, Stack 14', img: 'mira' },
    tomas: { name: 'Tomas Vey', role: 'Fellow recruit', img: 'tomas' },
    ilse: { name: 'Ilse Marek', role: 'Fellow recruit', img: 'ilse' },
    rook: { name: '"Rook"', role: 'UNION 02 · your field trainer', img: 'rook' },
    granite: { name: '"Granite"', role: 'UNION SqL · D5 squadron', img: 'granite' },
    halloran: { name: 'Old Halloran', role: 'Neighbour · Stack 14', img: 'halloran' },
    tinker: { name: 'The Tinker', role: 'Repairman · Bazaar Row', img: 'tinker' },
  };

  /* Bump SAVE_VERSION when the shape of the state changes, and push a migration that
     upgrades older saves: G.MIGRATIONS.push({ to: 3, fn: (s) => { ... } }). Fields that simply
     appear in G.fresh() need no migration: loading merges every saved object over its default. */
  G.SAVE_VERSION = 4;
  G.MIGRATIONS = [
    {
      to: 2,
      fn: (s) => {
        /* v1 → v2: shared systems (discipline, informants, reports, boards) — defaults come from G.fresh */
        if (s.rank && G.RANKS && G.rankIdx(s.rank) >= 2) s.flags['passed_' + s.rank] = true;
      },
    },
    {
      to: 3,
      fn: (s) => {
        /* v2 → v3: codex tracks unread entries; everything unlocked before counts as read */
        s.codexSeen = (s.codex || []).slice();
      },
    },
    {
      to: 4,
      fn: (s) => {
        /* v3 → v4: field notes; a unit already in service has learnt the basics the hard way */
        if (s.phase === 'union' && (s.day || 0) > 3 && G.HINTS) s.hintsSeen = G.HINTS.map((h) => h.id);
      },
    },
  ];
  /* Save slots: each slot has its own autosave, checkpoint and manual save. Slot 1 uses the
     original keys, so saves from before slots existed live there. */
  G.SLOTS = 4;
  let slot = 1;
  try {
    slot = Math.min(G.SLOTS, Math.max(1, parseInt(localStorage.getItem('c9rp_slot'), 10) || 1));
  } catch (e) {}
  const sk = (base, n) => base + ((n || slot) === 1 ? '' : '_s' + (n || slot));
  const SAVE = (n) => sk('c9rp_auto_v1', n);
  const CP = (n) => sk('c9rp_checkpoint_v1', n);
  const MANUAL = (n) => sk('c9rp_manual_v1', n);
  G.slot = () => slot;
  G.setSlot = (n) => {
    slot = n;
    try {
      localStorage.setItem('c9rp_slot', String(n));
    } catch (e) {}
  };

  let S = null;
  let notes = [];
  let busy = false;

  G.fresh = () => ({
    v: G.SAVE_VERSION,
    scene: 'title',
    name: 'Citizen',
    bg: null,
    motive: null,
    uid: String(10000 + Math.floor(Math.random() * 89999)),
    district: 5,
    rank: 'RcT',
    div: null,
    skills: { firearms: 0, melee: 0, medical: 0, fitness: 0, perception: 0, comms: 0, authority: 0, deception: 0 },
    xp: { firearms: 0, melee: 0, medical: 0, fitness: 0, perception: 0, comms: 0, authority: 0, deception: 0 },
    hp: 100,
    maxhp: 100,
    merit: 0,
    lp: 0, // loyalty rating (visible)
    tokens: 15,
    susp: 0, // hidden: suspicion in your file
    cons: 50, // hidden: conscience
    res: 0, // hidden: resistance trust
    rel: { mira: 60 },
    items: ['photo'],
    phase: 'prologue',
    day: 0,
    time: 'Morning',
    bt: { done: [], count: 0, score: 0 },
    duty: { offers: [], day: -1, done: {} },
    flags: {},
    codex: [],
    codexSeen: [],
    visits: {},
    mem: {},
    files: {},
  });

  /* ------------------------------------------------------------- helpers */

  G.rand = (n) => Math.floor(Math.random() * n);
  G.pick = (arr) => arr[G.rand(arr.length)];
  G.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = G.rand(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  G.clamp = clamp;
  const resolve = (v, ...args) => (typeof v === 'function' ? v(S, G, ...args) : v);

  G.state = () => S;
  G.rankIdx = (r) => G.RANKS.indexOf(r);
  G.atLeast = (s, r) => G.rankIdx(s.rank) >= G.rankIdx(r);
  G.has = (s, item) => s.items.includes(item);
  G.flag = (s, f) => !!s.flags[f];

  G.desig = (s) => {
    s = s || S;
    if (s.rank === 'RcT') return `CCA.C9.D${s.district}-RcT-${s.uid}`;
    return `CCA.C9.D${s.district}-${s.div || 'UNION'}-${s.rank}-${s.uid}`;
  };
  G.short = (s) => {
    s = s || S;
    return s.rank === 'RcT' ? `RcT-${s.uid}` : `${s.rank}-${s.uid}`;
  };

  /* G.chanceMods: functions (s, skill) => number added to every check of that skill
     (e.g. a squad member with the right trait). Kept small; the dice still decide. */
  G.chanceMods = [];
  G.chance = (s, skill, diff) => {
    const lvl = s.skills[skill] || 0;
    let c = 40 + lvl * 12 - (diff || 0);
    if (s.hp < 40) c -= 10;
    G.chanceMods.forEach((m) => (c += m(s, skill) || 0));
    return clamp(c, 5, 95);
  };

  G.xpNeed = (lvl) => 2 + lvl * 2;
  G.gainXP = (s, skill, n) => {
    if (!G.SKILLS[skill]) return;
    s.xp[skill] = (s.xp[skill] || 0) + n;
    while (s.skills[skill] < 6 && s.xp[skill] >= G.xpNeed(s.skills[skill])) {
      s.xp[skill] -= G.xpNeed(s.skills[skill]);
      s.skills[skill]++;
      note(`${G.SKILLS[skill].toUpperCase()} → ${s.skills[skill]}`, 'skill');
    }
  };

  function note(text, cls) {
    notes.push({ text, cls: cls || '' });
  }
  G.note = note;

  /* Apply an effects object. Visible stats produce small notes. */
  G.fx = (s, e) => {
    if (!e) return;
    const num = (k, label, cls, min, max) => {
      if (typeof e[k] !== 'number' || e[k] === 0) return;
      s[k] = clamp(s[k] + e[k], min, max);
      if (label) note(`${e[k] > 0 ? '+' : ''}${e[k]} ${label}`, cls + (e[k] < 0 ? ' neg' : ''));
    };
    num('merit', 'MERIT', 'merit', -999, 9999);
    num('lp', 'LOYALTY', 'loyal', -100, 100);
    num('tokens', 'TOKENS', 'tokens', 0, 9999);
    if (typeof e.hp === 'number' && e.hp !== 0) {
      s.hp = clamp(s.hp + e.hp, 0, s.maxhp);
      note(`${e.hp > 0 ? '+' : ''}${e.hp} HEALTH`, e.hp < 0 ? 'hurt' : 'heal');
    }
    if (typeof e.susp === 'number' && e.susp !== 0) {
      s.susp = clamp(s.susp + e.susp, 0, 100);
      if (e.susp >= 3) note('[ OBSERVED ]', 'observed');
    }
    if (typeof e.cons === 'number') s.cons = clamp(s.cons + e.cons, 0, 100);
    if (typeof e.res === 'number') s.res = clamp(s.res + e.res, 0, 100);
    if (e.skill)
      for (const k in e.skill) {
        s.skills[k] = clamp((s.skills[k] || 0) + e.skill[k], 0, 6);
        note(`${G.SKILLS[k].toUpperCase()} ${e.skill[k] > 0 ? '+' : ''}${e.skill[k]}`, 'skill');
      }
    if (e.xp) for (const k in e.xp) G.gainXP(s, k, e.xp[k]);
    if (e.rel)
      for (const k in e.rel) {
        const had = k in s.rel;
        s.rel[k] = clamp((s.rel[k] || 0) + e.rel[k], -100, 100);
        if (!had) note(`CONTACT: ${G.PEOPLE[k] ? G.PEOPLE[k].name : k}`, 'contact');
        else if (Math.abs(e.rel[k]) >= 5) note(`${G.PEOPLE[k].name} ${e.rel[k] > 0 ? '▲' : '▼'}`, e.rel[k] > 0 ? 'contact' : 'contact neg');
      }
    if (e.flag) for (const k in e.flag) s.flags[k] = e.flag[k];
    if (e.give)
      [].concat(e.give).forEach((it) => {
        if (!s.items.includes(it)) {
          s.items.push(it);
          note(`+ ${G.ITEMS[it].name}`, 'item');
        }
      });
    if (e.take)
      [].concat(e.take).forEach((it) => {
        const i = s.items.indexOf(it);
        if (i >= 0) {
          s.items.splice(i, 1);
          note(`− ${G.ITEMS[it].name}`, 'item neg');
        }
      });
    if (e.codex) [].concat(e.codex).forEach((c) => G.unlock(s, c));
  };

  G.unlock = (s, id) => {
    if (!G.codexEntries[id] || s.codex.includes(id)) return;
    s.codex.push(id);
    note(`CODEX: ${G.codexEntries[id].title}`, 'codex');
  };

  G.promote = (s, rank) => {
    /* never jump more than one grade (a demoted unit climbs back one step at a time) */
    const cur = G.rankIdx(s.rank);
    if (G.rankIdx(rank) > cur + 1 && cur >= 1) rank = G.RANKS[cur + 1];
    s.rank = rank;
    s.flags['exam_' + rank] = false;
    note(`PROMOTED → ${G.RANK_NAMES[rank].toUpperCase()}`, 'promo');
  };

  /* ---------------------------------------------------------- rendering */

  const $ = (q) => document.querySelector(q);
  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function inline(t) {
    return String(t)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  }

  function para(p) {
    if (p == null || p === false || p === '') return null;
    p = String(p);
    if (p.startsWith('@dispatch ')) {
      return el('div', 'dispatch', `<span class="lbl">DISPATCH</span><div>${inline(p.slice(10))}</div>`);
    }
    if (p.startsWith('@radio ')) {
      return el('div', 'radio', `<span class="lbl">RADIO</span><div>${inline(p.slice(7))}</div>`);
    }
    if (p.startsWith('@sys ')) return el('div', 'sys', inline(p.slice(5)));
    if (p.startsWith('@say ')) {
      const body = p.slice(5);
      const i = body.indexOf('|');
      const who = body.slice(0, i);
      const line = body.slice(i + 1);
      return el('div', 'say', `<span class="speaker">${who}</span><span class="line">${inline(line)}</span>`);
    }
    if (p.startsWith('@doc ')) return el('div', 'doc', inline(p.slice(5)));
    if (p.startsWith('@law ')) return el('div', 'law', `<span class="lbl">VERDICT</span>${inline(p.slice(5))}`);
    if (p.startsWith('@img ') || p.startsWith('@portrait ')) {
      const isP = p.startsWith('@portrait ');
      const parts = p.slice(isP ? 10 : 5).split('|');
      const src = parts[0].trim();
      const cap = parts[1] ? parts[1].trim() : '';
      const f = el('figure', isP ? 'pic portrait' : 'pic', `<img src="${src}" alt="${cap.replace(/"/g, '')}" loading="lazy">${cap ? `<figcaption>${inline(cap)}</figcaption>` : ''}`);
      const im = f.querySelector('img');
      const shown = () => f.classList.add('loaded');
      if (im.complete && im.naturalWidth) shown();
      else (im.onload = shown), (im.onerror = shown);
      f.onclick = () => openModal(cap || 'Reference', `<img class="full" src="${src}" alt="">`);
      return f;
    }
    if (p === '@hr') return el('hr', 'sep');
    if (p.startsWith('@big ')) return el('div', 'big', inline(p.slice(5)));
    return el('p', null, inline(p));
  }

  function archiveCurrent() {
    const prev = $('#story .block.current');
    if (!prev) return;
    prev.classList.remove('current');
    prev.classList.add('past');
    prev.querySelectorAll('.choices, .input-row').forEach((c) => c.remove());
    const blocks = document.querySelectorAll('#story .block');
    if (blocks.length > 25) blocks[0].remove();
  }

  function render(sc, id) {
    if (view === 'dossier') setView('story');
    archiveCurrent();
    const story = $('#story');
    const block = el('div', 'block current');
    const title = resolve(sc.title);
    if (title) block.append(el('div', 'scene-title', inline(title)));
    if (notes.length) {
      const n = el('div', 'notes');
      notes.forEach((x) => n.append(el('span', 'note ' + x.cls, x.text)));
      block.append(n);
      notes = [];
    }
    let text = [].concat(resolve(sc.text) || []);
    exts(id).forEach((e) => e.text && (text = [].concat(e.text(text, S, G) || [])));
    let i = 0;
    text.forEach((p) => {
      const node = para(p);
      if (!node) return;
      node.style.animationDelay = i++ * 90 + 'ms';
      block.append(node);
    });

    if (sc.input) {
      const row = el('div', 'input-row');
      const inp = el('input');
      inp.type = 'text';
      inp.maxLength = sc.input.max || 24;
      inp.placeholder = sc.input.placeholder || '';
      inp.value = S[sc.input.key] && S[sc.input.key] !== 'Citizen' ? S[sc.input.key] : '';
      const btn = el('button', 'choice', '<span class="num">›</span> ' + (sc.input.button || 'Confirm'));
      const submit = () => {
        let v = inp.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ' \-]/g, '').trim().slice(0, sc.input.max || 24);
        if (!v) v = sc.input.fallback || 'Citizen';
        S[sc.input.key] = v;
        appendChosen(v);
        go(sc.input.go);
      };
      btn.onclick = submit;
      inp.onkeydown = (e) => {
        if (e.key === 'Enter') submit();
      };
      row.append(inp, btn);
      block.append(row);
      setTimeout(() => inp.focus(), 50);
    }

    if (sc.mini && G.MINIGAMES && G.MINIGAMES[sc.mini.type]) {
      const m = sc.mini;
      let settled = false;
      const ownScene = S.scene;
      const settle = (ok, data) => {
        if (settled || S.scene !== ownScene) return;
        settled = true;
        S.lastMini = data || null;
        S.lastCheck = ok;
        if (m.skill) G.gainXP(S, m.skill, ok ? 1 : 0.5);
        const sk = block.querySelector('.mini-skip');
        if (sk) sk.remove();
        const mine = S;
        setTimeout(() => S === mine && go(ok ? m.pass : m.fail), 250);
      };
      G.MINIGAMES[m.type](block, resolve(m.opts) || {}, settle);
      if (m.skill) {
        const pct = G.chance(S, m.skill, (m.diff || 0) + 10);
        const sk = el('button', 'mini-skip', `Let instinct decide instead — ${G.SKILLS[m.skill].toUpperCase()} ${pct}%`);
        sk.onclick = () => {
          const roll = 1 + G.rand(100);
          appendRoll(m.skill, pct, roll, roll <= pct);
          const mg = block.querySelector('.mini');
          if (mg) mg.remove();
          settle(roll <= pct, null);
        };
        block.append(sk);
      }
    }

    const list = el('div', 'choices');
    let n = 0;
    let choiceList = [].concat(resolve(sc.choices) || []);
    exts(id).forEach((e) => e.choices && (choiceList = [].concat(e.choices(choiceList, S, G) || [])));
    choiceList.forEach((c) => {
      if (c.if && !c.if(S, G)) return;
      const locked = c.lock ? c.lock(S, G) : null;
      const label = resolve(c.t);
      const btn = el('button', 'choice' + (c.style ? ' ' + c.style : ''));
      let tags = '';
      if (c.check) {
        const pct = G.chance(S, c.check.skill, c.check.diff);
        tags += `<span class="tag chk">${G.SKILLS[c.check.skill].toUpperCase()} ${pct}%</span>`;
      }
      if (c.tag) tags += `<span class="tag ${c.tagCls || ''}">${c.tag}</span>`;
      n++;
      btn.innerHTML = `<span class="num">${n}</span><span class="lbl">${tags}${inline(label)}${locked ? `<span class="why">${locked}</span>` : ''}</span>`;
      if (locked) btn.disabled = true;
      else
        btn.onclick = () => {
          if (busy) return;
          list.classList.add('picked');
          btn.classList.add('chosen-btn');
          choose(c, label);
        };
      btn.dataset.n = n;
      list.append(btn);
    });
    if (n) block.append(list);
    story.append(block);
    (G.afterRender || []).forEach((f) => {
      try {
        f(sc, id, block);
      } catch (e) {
        console.error(e);
      }
    });
    requestAnimationFrame(() => block.scrollIntoView({ behavior: G.reducedMotion() ? 'auto' : 'smooth', block: 'start' }));
    updateSidebar();
  }

  function appendChosen(label) {
    const cur = $('#story .block.current');
    if (cur) cur.append(el('div', 'chosen', '› ' + inline(label)));
  }
  function appendRoll(skill, pct, roll, ok) {
    const cur = $('#story .block.current');
    if (cur)
      cur.append(
        el(
          'div',
          'roll ' + (ok ? 'ok' : 'fail'),
          `${G.SKILLS[skill].toUpperCase()} CHECK · need ≤${pct} · rolled ${roll} — <b>${ok ? 'SUCCESS' : 'FAILURE'}</b>`
        )
      );
  }

  /* G.onChoose: functions (s, choice, sceneId) run whenever the player picks a choice, before
     its effects — used by systems that react to the *kind* of choice (its tag), such as district
     stability. They must not change the scene. */
  G.onChoose = [];
  function choose(c, label) {
    if (busy) return;
    busy = true;
    appendChosen(label);
    G.onChoose.forEach((h) => {
      try {
        h(S, c, S.scene);
      } catch (e) {
        console.error(e);
      }
    });
    if (c.act) {
      busy = false;
      c.act(S, G);
      return;
    }
    if (c.fx) {
      const r = typeof c.fx === 'function' ? c.fx(S, G) : c.fx;
      if (r && typeof r === 'object') G.fx(S, r);
    }
    if (c.check) {
      const pct = G.chance(S, c.check.skill, c.check.diff);
      const roll = 1 + G.rand(100);
      const ok = roll <= pct;
      S.lastCheck = ok;
      G.gainXP(S, c.check.skill, ok ? 1 : 0.5);
      appendRoll(c.check.skill, pct, roll, ok);
      if (ok && c.check.okFx) G.fx(S, resolve(c.check.okFx));
      if (!ok && c.check.failFx) G.fx(S, resolve(c.check.failFx));
      const mine = S;
      setTimeout(() => {
        busy = false;
        if (S === mine) go(ok ? c.check.pass : c.check.fail);
      }, G.CHECK_DELAY);
      return;
    }
    busy = false;
    go(c.go);
  }

  function go(target) {
    const id = resolve(target);
    G.goto(id);
  }

  G.goto = (id, depth) => {
    depth = depth || 0;
    if (depth > 20) throw new Error('Scene redirect loop at ' + id);
    const sc = G.scenes[id];
    if (!sc) {
      console.error('Missing scene', id);
      render({ text: [`@sys ERROR: scene "${id}" not found. This branch is not written yet.`], choices: [{ t: 'Return to duty', go: S.phase === 'union' ? 'u_board' : 'title' }] });
      return;
    }
    S.scene = id;
    S.visits[id] = (S.visits[id] || 0) + 1;
    const redirect = (r) => typeof r === 'string' && r !== id;
    for (const e of exts(id)) {
      const r = e.before && e.before(S, G);
      if (redirect(r)) return G.goto(r, depth + 1);
    }
    if (sc.enter) {
      const r = sc.enter(S, G);
      if (redirect(r)) return G.goto(r, depth + 1);
    }
    for (const e of exts(id)) {
      const r = e.after && e.after(S, G);
      if (redirect(r)) return G.goto(r, depth + 1);
    }
    if (!sc.safe && !sc.ending) {
      if (S.susp >= 100) return G.goto('end_amputated', depth + 1);
      if (S.hp <= 0) return G.goto('infirmary', depth + 1);
    }
    render(sc, id);
    if (sc.nosave) return;
    if (sc.checkpoint) store(CP());
    store(SAVE());
  };

  /* ---------------------------------------------------------------- save */

  function store(key) {
    try {
      localStorage.setItem(key, JSON.stringify(S));
    } catch (e) {
      /* storage unavailable: play continues without saves */
    }
  }
  function readSave(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      const base = G.fresh();
      const out = Object.assign({}, base, obj);
      /* one level deep: a saved object is merged over its default, so new sub-fields get values */
      for (const k in base) {
        const b = base[k];
        if (b && typeof b === 'object' && !Array.isArray(b) && obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k])) out[k] = Object.assign({}, b, obj[k]);
      }
      const from = out.v || 1;
      G.MIGRATIONS.filter((m) => m.to > from && m.to <= G.SAVE_VERSION).sort((a, b) => a.to - b.to).forEach((m) => m.fn(out));
      out.v = G.SAVE_VERSION;
      return out;
    } catch (e) {
      return null;
    }
  }
  G.hasSave = (key) => !!readSave(key || SAVE());
  G.hasCheckpoint = () => !!readSave(CP());

  function loadFrom(key, label) {
    const data = readSave(key);
    if (!data) {
      toast('No record found.');
      return false;
    }
    S = data;
    $('#story').innerHTML = '';
    notes = [];
    note(label || 'RECORD RESTORED', 'codex');
    const sc = G.scenes[S.scene] || G.scenes.title;
    render(sc, G.scenes[S.scene] ? S.scene : 'title');
    store(SAVE());
    return true;
  }
  G.continueGame = () => loadFrom(SAVE(), 'RECORD RESTORED');
  /* a short summary of what is in a slot, or null */
  G.slotInfo = (n) => {
    const d = readSave(SAVE(n));
    if (!d) return null;
    const pre = d.phase === 'prologue' || d.phase === 'creation';
    return {
      name: d.name,
      rank: pre ? 'Citizen' : G.RANK_NAMES[d.rank] || d.rank,
      div: d.div || (pre ? '' : d.phase === 'training' ? 'Training' : 'UNION'),
      day: d.day || 0,
      chapter: d.chapter || 1,
      ended: d.phase === 'ended',
    };
  };
  G.continueSlot = (n) => {
    G.setSlot(n);
    return G.continueGame();
  };
  G.newGameInSlot = (n) => {
    G.setSlot(n);
    G.newGame();
  };
  G.clearSlot = (n) => {
    try {
      [SAVE(n), CP(n), MANUAL(n)].forEach((k) => localStorage.removeItem(k));
    } catch (e) {}
  };
  G.loadCheckpoint = () => loadFrom(CP(), 'CHECKPOINT RESTORED');
  G.newGame = () => {
    S = G.fresh();
    $('#story').innerHTML = '';
    G.goto('cc_name');
  };
  G.manualSave = () => {
    store(MANUAL());
    toast('Record saved to manual slot.');
  };
  G.manualLoad = () => loadFrom(MANUAL(), 'MANUAL RECORD RESTORED');
  G.exportSave = () => {
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(S))));
    } catch (e) {
      return '';
    }
  };
  G.importSave = (code) => {
    try {
      const obj = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
      localStorage.setItem(MANUAL(), JSON.stringify(obj));
      return G.manualLoad();
    } catch (e) {
      toast('That code is corrupted.');
      return false;
    }
  };

  /* ------------------------------------------------------------- sidebar */

  function relWord(v) {
    if (v >= 75) return 'Devoted';
    if (v >= 45) return 'Trusting';
    if (v >= 15) return 'Friendly';
    if (v > -15) return 'Neutral';
    if (v > -45) return 'Wary';
    return 'Hostile';
  }
  function pips(lvl) {
    let h = '';
    for (let i = 0; i < 6; i++) h += `<i class="${i < lvl ? 'on' : ''}"></i>`;
    return h;
  }

  function updateSidebar() {
    if (!S) return;
    const inGame = S.scene !== 'title';
    $('#app').classList.toggle('pregame', !inGame || S.phase === 'creation');
    $('#tb-desig').textContent = inGame && S.phase !== 'creation' && S.phase !== 'prologue' ? G.desig(S) : !inGame || S.phase === 'creation' ? 'CITIZEN TERMINAL' : `CITIZEN ${S.name.toUpperCase()} // D5`;
    $('#tb-time').textContent = S.phase === 'union' ? `DAY ${S.day} · ${S.time.toUpperCase()}` : S.phase === 'training' ? `TRAINING · WEEK ${Math.min(4, S.bt.count + 1)}` : S.time.toUpperCase();

    const promo = G.PROMO[S.rank] && (!G.PROMO[S.rank].if || G.PROMO[S.rank].if(S)) ? G.PROMO[S.rank] : null;
    const meritLine = promo
      ? `<div class="bar"><span style="width:${clamp((S.merit / promo.merit) * 100, 0, 100)}%"></span></div><div class="sub">${S.merit} / ${promo.merit} toward ${promo.next} evaluation</div>`
      : `<div class="sub">${S.merit} merit</div>`;

    const hpPct = (S.hp / S.maxhp) * 100;
    let html = `
      <section>
        <h3>Dossier</h3>
        ${S.div ? `<img class="emblem" src="assets/img/emblems/${S.div.toLowerCase()}.png" alt="${S.div} emblem" onerror="this.remove()">` : ''}
        <div class="kv"><span>Name</span><b>${S.name}</b></div>
        <div class="kv"><span>Designation</span><b class="mono">${S.phase === 'prologue' || S.phase === 'creation' ? '— unassigned —' : G.desig(S)}</b></div>
        <div class="kv"><span>Rank</span><b>${S.phase === 'prologue' || S.phase === 'creation' ? 'Citizen' : G.RANK_NAMES[S.rank]}</b></div>
        <div class="kv"><span>Division</span><b>${S.div || '—'}</b></div>
      </section>
      <section>
        <h3>Status</h3>
        <div class="kv"><span>Health</span><b>${S.hp} / ${S.maxhp}</b></div>
        <div class="bar hp ${hpPct < 40 ? 'low' : ''}"><span style="width:${hpPct}%"></span></div>
        <div class="kv"><span>Merit</span><b>${S.merit}</b></div>
        ${meritLine}
        <div class="kv"><span>Loyalty rating</span><b>${S.lp > 0 ? '+' : ''}${S.lp}</b></div>
        <div class="kv"><span>Tokens</span><b>${S.tokens}</b></div>
      </section>
      <section>
        <h3>Skills</h3>
        ${Object.keys(G.SKILLS)
          .map(
            (k) => `<div class="skill"><span>${G.SKILLS[k]}</span><span class="pips">${pips(S.skills[k])}</span>
            <div class="xp"><span style="width:${S.skills[k] >= 6 ? 100 : clamp((S.xp[k] / G.xpNeed(S.skills[k])) * 100, 0, 100)}%"></span></div></div>`
          )
          .join('')}
      </section>
      <section>
        <h3>Contacts</h3>
        ${Object.keys(S.rel)
          .map((k) => {
            const pp = G.PEOPLE[k];
            const face = pp.img ? `<img class="face" src="assets/img/portraits/${pp.img}-thumb.webp" alt="">` : '<i class="face none"></i>';
            return `<div class="kv contact">${face}<span>${pp.name}<small>${pp.role}</small></span><b>${relWord(S.rel[k])}</b></div>`;
          })
          .join('')}
      </section>
      ${
        G.kitFor && S.phase !== 'creation'
          ? `<section><h3>Issued kit</h3>${
              S.phase === 'prologue'
                ? '<div class="sub">Nothing yet. You are a citizen.</div>'
                : G.kitFor(S)
                    .map((e) => `<details class="kit"><summary>${e.name}</summary><small>${e.desc}</small></details>`)
                    .join('')
            }</section>`
          : ''
      }
      ${(G.sideExtras || []).map((f) => f(S) || '').join('')}
      ${
        S.files && Object.keys(S.files).length
          ? `<section><h3>Case files</h3>${Object.values(S.files)
              .sort((a, b) => (b.last || 0) - (a.last || 0))
              .slice(0, 6)
              .map((f) => {
                const pts = Math.min(20, f.points);
                const cls = f.amputated ? 'dead' : pts >= 15 ? 'hot' : pts >= 8 ? 'warm' : '';
                return `<div class="case ${cls}"><div class="kv"><span>CID ${f.cid}<small>${f.amputated ? 'AMPUTATED' : f.lastVerdict || ''} · ${f.stops} stop${f.stops > 1 ? 's' : ''}</small></span><b>${f.amputated ? '—' : pts + ' / 20'}</b></div><div class="bar"><span style="width:${(pts / 20) * 100}%"></span></div></div>`;
              })
              .join('')}${
              Object.keys(S.files).length > 6 ? `<div class="sub">${Object.keys(S.files).length - 6} older files</div>` : ''
            }</section>`
          : ''
      }
      <section>
        <h3>Carried</h3>
        ${
          S.items.length
            ? S.items
                .map((k) => {
                  const it = G.ITEMS[k];
                  const g = it.grade && G.CONTRA_GRADES ? G.CONTRA_GRADES[it.grade] : null;
                  const chip = g ? `<span class="grade" style="color:${g.colour};border-color:${g.colour}">${g.label}</span>` : '';
                  return `<div class="item ${it.contraband ? 'contra' : ''}" title="${it.desc}">${chip}${it.name}<small>${it.desc}</small></div>`;
                })
                .join('')
            : '<div class="sub">Nothing of note.</div>'
        }
      </section>`;
    $('#side-content').innerHTML = html;
    const shut = prefs().collapsed || [];
    $('#side-content')
      .querySelectorAll('section > h3')
      .forEach((h) => {
        const sec = h.parentElement;
        const key = h.textContent.trim();
        sec.classList.add('fold');
        if (shut.includes(key)) sec.classList.add('collapsed');
        h.setAttribute('role', 'button');
        h.tabIndex = 0;
        h.onclick = () => {
          const p = prefs();
          p.collapsed = p.collapsed || [];
          sec.classList.toggle('collapsed');
          p.collapsed = sec.classList.contains('collapsed') ? p.collapsed.concat(key) : p.collapsed.filter((k) => k !== key);
          savePrefs(p);
        };
      });
    $('#codex-count').textContent = S.codex.length ? `(${S.codex.length})` : '';
    renderNav();
  }

  /* -------------------------------------------------------------- modals */

  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 2200);
  }
  G.toast = toast;

  /* ---------------------------------------------------------- navigation
     The mobile bottom bar is built from G.NAV. To add a feature tab later,
     push an entry: { id, label, icon (svg string), act(s, G), badge?(s), if?(s) }. */

  const ICONS = {
    story: '<svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z"/><path d="M9 10h7M9 14h7M9 18h4"/></svg>',
    dossier: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.5"/><path d="M5.5 17c.8-2 2-3 3.5-3s2.7 1 3.5 3M14.5 10h4M14.5 13.5h4"/></svg>',
    codex: '<svg viewBox="0 0 24 24"><path d="M3.5 5.5c3-1 5.5-1 8.5 1 3-2 5.5-2 8.5-1v13c-3-1-5.5-1-8.5 1-3-2-5.5-2-8.5-1z"/><path d="M12 6.5v13"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  };
  G.ICONS = ICONS;
  let view = 'story';

  G.NAV = [
    { id: 'story', label: 'Story', icon: ICONS.story, act: () => setView('story') },
    { id: 'dossier', label: 'Dossier', icon: ICONS.dossier, act: () => setView(view === 'dossier' ? 'story' : 'dossier') },
    { id: 'codex', label: 'Codex', icon: ICONS.codex, badge: (s) => s.codex.filter((c) => !(s.codexSeen || []).includes(c)).length || '', act: () => (view === 'codex' ? setView('story') : showCodex()) },
    { id: 'menu', label: 'Menu', icon: ICONS.menu, act: () => (view === 'menu' ? setView('story') : showMenu()) },
  ];

  function setView(v) {
    view = v;
    $('#app').classList.toggle('side-open', v === 'dossier');
    if (v === 'story' || v === 'dossier') $('#modal').classList.remove('open');
    if (v === 'dossier') $('#sidebar').scrollTop = 0;
    renderNav();
  }
  G.setView = setView;

  function renderNav() {
    const nav = $('#bottomnav');
    if (!nav || !S) return;
    nav.innerHTML = '';
    G.NAV.forEach((n) => {
      if (n.if && !n.if(S)) return;
      const badge = n.badge ? n.badge(S) : '';
      const b = el(
        'button',
        'nav-btn' + (view === n.id ? ' active' : ''),
        `<span class="ico">${n.icon}</span><span class="nl">${n.label}</span>${badge !== '' && badge != null ? `<span class="badge">${badge}</span>` : ''}`
      );
      b.setAttribute('aria-label', n.label);
      b.onclick = () => n.act(S, G);
      nav.append(b);
    });
  }
  G.renderNav = renderNav;

  G.openModal = (t, h, k) => openModal(t, h, k);
  function openModal(title, html, kind) {
    $('#modal-title').textContent = title;
    $('#modal-body').innerHTML = html;
    $('#modal-body').onclick = null;
    $('#modal').classList.add('open');
    view = kind || 'modal';
    $('#app').classList.remove('side-open');
    renderNav();
  }
  function closeModal() {
    $('#modal').classList.remove('open');
    if (view !== 'story' && view !== 'dossier') {
      view = 'story';
      renderNav();
    }
  }

  /* Codex: entries grouped by G.CODEX_GROUPS (content decides the order), unread marked NEW,
     a filter box for long lists. Entries in no group fall under "Other records". */
  function showCodex() {
    if (!S.codex.length) return openModal('Codex', '<p class="sub">No records unlocked yet.</p>', 'codex');
    S.codexSeen = S.codexSeen || [];
    const unread = new Set(S.codex.filter((c) => !S.codexSeen.includes(c)));
    const newest = S.codex[S.codex.length - 1];
    const groups = (G.CODEX_GROUPS || []).map((g) => ({ title: g.title, ids: g.ids.filter((id) => S.codex.includes(id) && G.codexEntries[id]) }));
    const placed = new Set(groups.flatMap((g) => g.ids));
    const rest = S.codex.filter((id) => !placed.has(id) && G.codexEntries[id]);
    if (rest.length) groups.push({ title: 'Other records', ids: rest });
    const entry = (id) => {
      const e = G.codexEntries[id];
      const isNew = unread.has(id);
      return `<details class="cx-entry" data-id="${id}" ${id === newest && isNew ? 'open' : ''}><summary>${e.title}${isNew ? '<span class="cx-new">NEW</span>' : ''}</summary><div class="codex-body">${e.body}</div></details>`;
    };
    const html =
      `<input class="cx-search" type="search" placeholder="Search the records…" aria-label="Search the codex">` +
      groups
        .filter((g) => g.ids.length)
        .map((g) => {
          const n = g.ids.filter((id) => unread.has(id)).length;
          const open = g.ids.includes(newest) && unread.has(newest);
          return `<details class="cx-group" ${open ? 'open' : ''}><summary><span>${g.title}</span><small>${g.ids.length}${n ? ` · <b>${n} new</b>` : ''}</small></summary>${g.ids.map(entry).join('')}</details>`;
        })
        .join('');
    openModal('Codex // Union Records', html, 'codex');
    S.codexSeen = S.codex.slice();
    store(SAVE());
    renderNav();
    const body = $('#modal-body');
    body.onclick = (e) => {
      if (e.target.tagName === 'IMG' && !e.target.classList.contains('full')) window.open(e.target.src, '_blank');
    };
    const search = body.querySelector('.cx-search');
    search.oninput = () => {
      const q = search.value.trim().toLowerCase();
      body.querySelectorAll('.cx-group').forEach((g) => {
        let any = false;
        g.querySelectorAll('.cx-entry').forEach((d) => {
          const hit = !q || d.textContent.toLowerCase().includes(q);
          d.hidden = !hit;
          any = any || hit;
        });
        g.hidden = !any;
        if (q) g.open = any;
      });
    };
  }

  function showMenu() {
    openModal(
      'Terminal',
      `<p class="sub">You are playing record ${slot} of ${G.SLOTS}. Every record keeps its own autosave, checkpoint and manual save.</p><div class="menu">
        <button data-a="save">Save to manual slot</button>
        <button data-a="load" ${G.hasSave(MANUAL()) ? '' : 'disabled'}>Load manual slot</button>
        <button data-a="cp" ${G.hasCheckpoint() ? '' : 'disabled'}>Load last checkpoint</button>
        <button data-a="export">Export save code</button>
        <button data-a="import">Import save code</button>
        <button data-a="new">Records &amp; new game</button>
      </div>
      <div class="menu textsize"><span>Text size</span><button data-a="fs-">A−</button><button data-a="fs+">A+</button></div>
      <div class="menu textsize"><span>Tips</span><button data-a="tips">${prefs().tips === false ? 'Off' : 'On'}</button></div>
      <div class="menu textsize"><span>Sound</span><button data-a="snd">${G.audio && G.audio.on() ? 'On' : 'Off'}</button>
      </div>
      <textarea id="save-code" placeholder="Save code appears / goes here" rows="4"></textarea>
      <p class="sub">The game autosaves after every scene in this browser. Checkpoints are written at the start of each day and at key story moments.</p>`,
      'menu'
    );
    $('#modal-body').onclick = (e) => {
      const a = e.target.dataset && e.target.dataset.a;
      if (!a) return;
      if (a === 'save') G.manualSave();
      if (a === 'load' && G.manualLoad()) closeModal();
      if (a === 'cp' && G.loadCheckpoint()) closeModal();
      if (a === 'export') {
        $('#save-code').value = G.exportSave();
        $('#save-code').select();
        toast('Copy the code to keep your record.');
      }
      if (a === 'import' && G.importSave($('#save-code').value)) closeModal();
      if (a === 'tips') {
        const p = prefs();
        p.tips = p.tips === false;
        savePrefs(p);
        e.target.textContent = p.tips ? 'On' : 'Off';
        return;
      }
      if (a === 'snd' && G.audio) {
        e.target.textContent = G.audio.toggle() ? 'On' : 'Off';
        return;
      }
      if (a === 'fs-' || a === 'fs+') {
        toast(`Text size ${G.setTextSize(a === 'fs+' ? 1 : -1)}`);
        return;
      }
      if (a === 'new') {
        closeModal();
        $('#story').innerHTML = '';
        G.goto('title');
      }
    };
  }

  /* ------------------------------------------------------------- prefs
     Per-device conveniences (not part of any save): text size, folded dossier sections. */
  function prefs() {
    try {
      return JSON.parse(localStorage.getItem('c9rp_prefs') || '{}');
    } catch (e) {
      return {};
    }
  }
  function savePrefs(p) {
    try {
      localStorage.setItem('c9rp_prefs', JSON.stringify(p));
    } catch (e) {}
  }
  G.prefs = prefs;
  G.savePrefs = savePrefs;
  G.afterRender = G.afterRender || [];
  G.TEXT_SIZES = [15, 17, 19, 21];
  G.applyTextSize = () => {
    const n = prefs().text || 17;
    document.documentElement.style.setProperty('--fs', n + 'px');
  };
  G.setTextSize = (dir) => {
    const p = prefs();
    const i = G.TEXT_SIZES.indexOf(p.text || 17);
    p.text = G.TEXT_SIZES[Math.max(0, Math.min(G.TEXT_SIZES.length - 1, i + dir))];
    savePrefs(p);
    G.applyTextSize();
    return p.text;
  };
  G.reducedMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------------------------------------------------------------- boot */

  G.boot = () => {
    G.applyTextSize();
    S = G.fresh();
    $('#btn-codex').onclick = showCodex;
    $('#btn-menu').onclick = showMenu;
    $('#btn-side').onclick = () => setView(view === 'dossier' ? 'story' : 'dossier');
    $('#modal-close').onclick = closeModal;
    $('#modal').onclick = (e) => {
      if (e.target.id === 'modal') closeModal();
    };
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'Escape') return closeModal();
      if ($('#modal').classList.contains('open')) return;
      const k = parseInt(e.key, 10);
      if (k >= 1 && k <= 9) {
        const b = document.querySelector(`#story .block.current .choice[data-n="${k}"]`);
        if (b && !b.disabled) b.click();
      }
    });
    G.goto('title');
  };
})();
