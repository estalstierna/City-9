/* MINIGAMES II
   - circuit: GRID. A grid of conduit tiles; tap to rotate. Bring power from the left edge to the
     right edge before the clock runs out. Radio & Protocol buys time.
   - tail: JURY. Follow a subject down Bazaar Row, one block at a time. Read the street, choose
     your distance. Too close and they make you; too far and you lose them. Perception helps.
   Scene usage: mini: { type: 'circuit' | 'tail', opts, pass, fail, skill } */
(function () {
  G.MINIGAMES = G.MINIGAMES || {};
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  /* ================================================================ CIRCUIT */
  const N = 1, E = 2, S = 4, W = 8;
  const rot = (m) => ((m << 1) | (m >> 3)) & 15;
  const DIRS = [[N, -1, 0, S], [E, 0, 1, W], [S, 1, 0, N], [W, 0, -1, E]];

  function makeBoard(rows, cols) {
    for (let tries = 0; tries < 200; tries++) {
      const start = rint(0, rows - 1);
      const path = [[start, 0]];
      const seen = new Set([start + ',0']);
      let ok = false;
      while (path.length < rows * cols) {
        const [r, c] = path[path.length - 1];
        if (c === cols - 1 && path.length >= cols + 1) {
          ok = true;
          break;
        }
        const opts = DIRS.filter(([, dr, dc]) => {
          const nr = r + dr, nc = c + dc;
          return nr >= 0 && nr < rows && nc >= 0 && nc < cols && !seen.has(nr + ',' + nc) && !(dc < 0 && Math.random() < 0.7);
        });
        if (!opts.length) break;
        const [, dr, dc] = pick(opts);
        path.push([r + dr, c + dc]);
        seen.add(r + dr + ',' + (c + dc));
      }
      if (!ok) continue;
      const grid = Array.from({ length: rows }, () => Array(cols).fill(0));
      path.forEach(([r, c], i) => {
        let m = 0;
        const link = (o) => {
          if (!o) return;
          DIRS.forEach(([bit, dr, dc]) => o[0] === r + dr && o[1] === c + dc && (m |= bit));
        };
        link(path[i - 1]);
        link(path[i + 1]);
        if (i === 0) m |= W;
        if (i === path.length - 1) m |= E;
        grid[r][c] = m;
      });
      const shapes = [N | S, N | E, N | E | S, N | E];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (!grid[r][c]) grid[r][c] = pick(shapes);
      const sol = grid.map((row) => row.slice());
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) for (let k = rint(1, 3); k > 0; k--) grid[r][c] = rot(grid[r][c]);
      return { grid, sol, start, end: path[path.length - 1][0], rows, cols };
    }
    return null;
  }
  function powered(b) {
    const on = new Set();
    if (!(b.grid[b.start][0] & W)) return { on, done: false };
    const q = [[b.start, 0]];
    on.add(b.start + ',0');
    let done = false;
    while (q.length) {
      const [r, c] = q.shift();
      const m = b.grid[r][c];
      if (c === b.cols - 1 && r === b.end && m & E) done = true;
      DIRS.forEach(([bit, dr, dc, back]) => {
        const nr = r + dr, nc = c + dc;
        if (!(m & bit) || nr < 0 || nr >= b.rows || nc < 0 || nc >= b.cols) return;
        if (!(b.grid[nr][nc] & back) || on.has(nr + ',' + nc)) return;
        on.add(nr + ',' + nc);
        q.push([nr, nc]);
      });
    }
    return { on, done };
  }
  const tileSvg = (m, lit) => {
    const col = lit ? '#5fd3e6' : '#4a5a62';
    const seg = { [N]: 'M50 50 V0', [E]: 'M50 50 H100', [S]: 'M50 50 V100', [W]: 'M50 50 H0' };
    const d = [N, E, S, W].filter((b) => m & b).map((b) => seg[b]).join(' ');
    return `<svg viewBox="0 0 100 100"><path d="${d}" stroke="${col}" stroke-width="16" stroke-linecap="square" fill="none"/><circle cx="50" cy="50" r="11" fill="${col}"/></svg>`;
  };

  G.MINIGAMES.circuit = (block, opts, done) => {
    const S = G.state();
    const rows = opts.rows || 4, cols = opts.cols || 5;
    const b = makeBoard(rows, cols);
    const secs = (opts.seconds || 40) + 4 * ((S.skills && S.skills.comms) || 0);
    let left = secs, over = false;
    const root = document.createElement('div');
    root.className = 'mini circuit';
    root.innerHTML = `<div class="cr-head"><span class="cr-title">${opts.title || 'Rewire the conduit'}</span><span class="cr-clock"></span></div>
      <div class="ci-log">${opts.intro || 'Tap a tile to rotate it. Bring power from the source on the left to the load on the right.'}</div>
      <div class="ci-grid" style="grid-template-columns:22px repeat(${cols},1fr) 22px"></div>`;
    const grid = root.querySelector('.ci-grid');
    const cells = [];
    const side = (on, sym, cls) => {
      const d = document.createElement('div');
      d.className = 'ci-side ' + cls;
      d.textContent = on ? sym : '';
      return d;
    };
    for (let r = 0; r < rows; r++) {
      grid.append(side(r === b.start, '⚡', 'src'));
      for (let c = 0; c < cols; c++) {
        const t = document.createElement('button');
        t.className = 'ci-tile';
        t.setAttribute('aria-label', `tile ${r + 1}-${c + 1}`);
        t.onclick = () => {
          if (over) return;
          b.grid[r][c] = rot(b.grid[r][c]);
          draw();
        };
        grid.append(t);
        cells.push([t, r, c]);
      }
      grid.append(side(r === b.end, '◉', 'dst'));
    }
    const finish = (ok) => {
      if (over) return;
      over = true;
      clearInterval(timer);
      root.classList.add(ok ? 'won' : 'lost');
      root.querySelector('.ci-log').textContent = ok ? 'The load takes the power. The hum steadies.' : 'Out of time. Somewhere upstream a breaker trips.';
      done(ok, { left: Math.round(left) });
    };
    function draw() {
      const p = powered(b);
      cells.forEach(([t, r, c]) => {
        t.innerHTML = tileSvg(b.grid[r][c], p.on.has(r + ',' + c));
        t.classList.toggle('lit', p.on.has(r + ',' + c));
      });
      root.querySelector('.cr-clock').textContent = Math.ceil(left) + 's';
      if (p.done) finish(true);
    }
    const timer = setInterval(() => {
      if (!document.body.contains(root) || !root.closest('.block.current') || G.state() !== S) return clearInterval(timer);
      if (document.hidden || over) return;
      left -= 0.25;
      root.querySelector('.cr-clock').textContent = Math.ceil(left) + 's';
      if (left <= 0) finish(false);
    }, 250);
    block.append(root);
    draw();
  };
  G._circuitTest = { makeBoard, powered };

  /* ================================================================ TAIL */
  const STREETS = [
    { cue: 'Bazaar Row at noon, shoulder to shoulder.', crowd: 3, look: 0 },
    { cue: 'The subject slows at a stall and studies its reflection in a cracked mirror.', crowd: 1, look: 2 },
    { cue: 'A narrow empty alley between two Stacks.', crowd: 0, look: 1 },
    { cue: 'A ration queue across the pavement. The subject cuts straight through it.', crowd: 3, look: 0 },
    { cue: 'A tram stop. The subject stops, waits, does not get on.', crowd: 1, look: 2 },
    { cue: 'A crossroads with four ways out and a broadcast screen.', crowd: 2, look: 1 },
    { cue: 'The subject turns into a stairwell and the door swings shut behind them.', crowd: 0, look: 0, door: true },
    { cue: 'A Shrike passes low; everyone on the street looks up except the subject.', crowd: 2, look: 2 },
    { cue: 'A market square with a dozen exits and a crowd around a fight.', crowd: 3, look: 0 },
    { cue: 'The subject ties a shoelace that was not untied.', crowd: 1, look: 3 },
  ];
  G.MINIGAMES.tail = (block, opts, done) => {
    const S = G.state();
    const steps = opts.steps || 7;
    const per = 6 + Math.floor(((S.skills && S.skills.perception) || 0) / 2);
    const st = { i: 0, heat: 0, contact: 100, over: false, t: per, cue: null };
    const root = document.createElement('div');
    root.className = 'mini tail';
    root.innerHTML = `<div class="cr-head"><span class="cr-title">${opts.title || 'Surveillance'}</span><span class="cr-clock"></span></div>
      <div class="tl-step"></div><div class="tl-cue"></div>
      <div class="tl-bars"><div><span>Seen</span><div class="cr-bar heat"><span></span></div></div><div><span>Contact</span><div class="cr-bar contact"><span></span></div></div></div>
      <div class="tl-btns"><button class="cr-btn" data-d="close">Close in</button><button class="cr-btn" data-d="mid">Keep pace</button><button class="cr-btn" data-d="far">Hang back</button></div>
      <div class="cr-help">Crowds hide you but lose them. Quiet streets and a subject who looks back punish you for being close. Hesitate and they gain distance.</div>`;
    const $ = (q) => root.querySelector(q);
    const next = () => {
      st.cue = Object.assign({}, pick(STREETS.filter((x) => x !== st.cue)));
      st.t = per;
      $('.tl-step').textContent = `Block ${st.i + 1} of ${steps}`;
      $('.tl-cue').textContent = st.cue.cue;
      draw();
    };
    const draw = () => {
      $('.heat span').style.width = Math.min(100, st.heat) + '%';
      $('.contact span').style.width = Math.max(0, st.contact) + '%';
      $('.cr-clock').textContent = Math.ceil(st.t) + 's';
    };
    const finish = (ok, why) => {
      if (st.over) return;
      st.over = true;
      clearInterval(timer);
      root.querySelectorAll('button').forEach((x) => (x.disabled = true));
      $('.tl-cue').textContent = why;
      root.classList.add(ok ? 'won' : 'lost');
      done(ok, { heat: Math.round(st.heat), contact: Math.round(st.contact), outcome: ok ? 'tailed' : st.heat >= 100 ? 'made' : 'lost' });
    };
    const act = (d) => {
      if (st.over) return;
      const c = st.cue;
      const look = c.look, crowd = c.crowd;
      if (d === 'close') {
        st.heat += 6 + look * 12 + (crowd === 0 ? 14 : 0) - crowd * 3;
        st.contact = Math.min(100, st.contact + 20);
      } else if (d === 'mid') {
        st.heat += 2 + look * 6 + (crowd === 0 ? 6 : 0);
        st.contact -= crowd * 8 + (c.door ? 25 : 0);
        st.contact = Math.min(100, st.contact + 6);
      } else {
        st.heat = Math.max(0, st.heat - 6);
        st.contact -= 10 + crowd * 12 + (c.door ? 40 : 0);
      }
      st.i++;
      if (st.heat >= 100) return finish(false, 'The subject turns round and looks straight at you. Then walks away, unhurried. They know your face now.');
      if (st.contact <= 0) return finish(false, 'You come round the corner and the street is empty. They are gone.');
      if (st.i >= steps) return finish(true, opts.success || 'The subject stops at a door, knocks twice, and goes in. You have the address.');
      next();
    };
    root.querySelectorAll('.tl-btns button').forEach((bt) => (bt.onclick = () => act(bt.dataset.d)));
    const timer = setInterval(() => {
      if (!document.body.contains(root) || !root.closest('.block.current') || G.state() !== S) return clearInterval(timer);
      if (document.hidden || st.over) return;
      st.t -= 0.25;
      if (st.t <= 0) {
        st.contact -= 18;
        st.t = per;
        if (st.contact <= 0) return finish(false, 'You hesitate too long. The street swallows them.');
      }
      draw();
    }, 250);
    block.append(root);
    next();
  };

  /* ================================================================ USE IN PLAY */
  const END = 'u_duty_end';
  G.addScenes({
    mg_grid: {
      title: 'Field generator — live rewire',
      text: ['You strip the casing off the generator. Inside, the conduit block has been scrambled — by sabotage or age, it does not matter now. The field is down and the street is dark.', '@sys Rewire the conduit. Tap a tile to rotate it.'],
      mini: { type: 'circuit', opts: { title: 'Field generator', seconds: 40 }, pass: 'mg_grid_ok', fail: 'mg_grid_bad', skill: 'comms', diff: 10 },
    },
    mg_grid_ok: { text: (s) => [`The field snaps back on with a sound like a held breath let out. ${s.lastMini ? `${s.lastMini.left} seconds to spare.` : ''}`], choices: [{ t: 'End of shift.', fx: { merit: 4, xp: { comms: 1 } }, go: END }] },
    mg_grid_bad: { text: ['A spark jumps the gap and the block goes black. The field stays down until the morning crew. Foreman will read about it.'], choices: [{ t: 'End of shift.', fx: { merit: -1, hp: -6 }, go: END }] },

    mg_conduit: {
      title: 'Junction 7 — under pressure',
      text: ['Someone has pulled half the couplings in the junction block. The Spire’s draw is climbing on your meter, and if the trunk trips, the whole of D1 goes dark.', '@sys Rewire it before the trunk trips.'],
      mini: { type: 'circuit', opts: { title: 'Junction 7', rows: 5, cols: 6, seconds: 55 }, pass: 'mg_conduit_ok', fail: 'mg_conduit_bad', skill: 'comms', diff: 20 },
    },
    mg_conduit_ok: { text: ['The meter settles. The hum in your teeth goes back to the hum you are used to.'], choices: [{ t: 'End of shift.', fx: { merit: 6, xp: { comms: 2 }, rel: { foreman: 4 } }, go: END }] },
    mg_conduit_bad: { text: ['The trunk trips. For four seconds every light in D1 goes out, and the Spire flickers over the river. Overwatch asks for your designation.'], choices: [{ t: 'End of shift.', fx: (s) => (G.discipline(s, 'minor', 'Trunk trip at junction 7'), { merit: -2 }), go: END }] },

    mg_tail: {
      title: 'Bazaar Row — out of uniform',
      text: ['Your subject is a CWU clerk who meets someone on Bazaar Row every Thursday. Today is Thursday. You are in a borrowed citizen jacket, which itches.', '@sys Follow without being seen. Read each street and choose your distance.'],
      mini: { type: 'tail', opts: { title: 'Surveillance — Bazaar Row', steps: 7 }, pass: 'mg_tail_ok', fail: 'mg_tail_bad', skill: 'perception', diff: 10 },
    },
    mg_tail_ok: {
      text: ['Stack 9, flat 2B. You note the address, the time, and the second knock. Then you walk home a different way.'],
      choices: [
        { t: 'File the address.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 5, xp: { perception: 1 } }, go: END },
        { t: 'Keep it to yourself for now.', fx: { xp: { perception: 1 }, susp: 1 }, go: END },
      ],
    },
    mg_tail_bad: {
      text: (s) => [s.lastMini && s.lastMini.outcome === 'made' ? 'They made you. They will change their route, and their Thursday, and possibly their name.' : 'You lost them. Tomorrow there will be another Thursday.'],
      choices: [{ t: 'End of shift.', fx: { merit: 1 }, go: END }],
    },
  });

  /* offered inside existing duties */
  const offer = (ids, choice) =>
    ids.forEach((id) =>
      G.extend(id, {
        choices: (list) => [choice].concat(list),
      })
    );
  offer(['dd_gfield', 'dd_gfield_r0', 'dd_gfield_r1'], { t: 'Strip the casing and rewire it by hand.', tag: 'REWIRE', tagCls: 'duty', go: 'mg_grid' });
  offer(['dd_gjunction', 'dd_gjunction_r0'], { t: 'The couplings are loose. Rewire the block now, live.', tag: 'REWIRE', tagCls: 'duty', go: 'mg_conduit' });
  offer(['dd_jtail', 'dd_jtail_r0', 'dd_jtail_r1'], { t: 'Follow the subject yourself, block by block.', tag: 'TAIL', tagCls: 'duty', go: 'mg_tail' });
})();
