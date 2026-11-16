/* PATROL — a shift you walk yourself, on the painted map of District 5.
   From the duty board: "Walk District 5". The shift runs 08:00–18:00, an hour a move. Eight places
   on the map; things happen at them while the clock runs (a queue turning, a runner, a Lantern
   alert, chalk, a collapse, a whisper). Each has a timer. Go there and deal with it — every one a
   small choice — or let it lapse, and the block remembers. Tap a place on the map to walk there. */
(function () {
  const pick = G.pick;
  const VB = [1033, 470, 317, 430]; /* District 5 on the 1600 × 900 city map */
  const NODES = {
    precinct: { name: 'Precinct D5', x: 1062, y: 690, block: null },
    plaza: { name: 'Plaza 5', x: 1120, y: 525, block: 'plaza' },
    s9: { name: 'Stack 9', x: 1105, y: 620, block: 's9' },
    s14: { name: 'Stack 14', x: 1195, y: 600, block: 's14' },
    s22: { name: 'Stack 22', x: 1290, y: 625, block: 's22' },
    bazaar: { name: 'Bazaar Row', x: 1190, y: 855, block: 'bazaar' },
    gate: { name: 'Canal Gate 3', x: 1325, y: 760, block: 'bazaar' },
    bridge: { name: 'Lock Bridge', x: 1255, y: 500, block: 'plaza' },
  };
  const NK = Object.keys(NODES);
  const sup = (s) => (G.superiorOf ? G.superiorOf(s).name : 'Granite');
  const P = (s) => s.pt;
  const clock = (h) => `${String(h).padStart(2, '0')}:00`;

  /* what can happen: where, how long it waits, and how it can go */
  const EVENTS = {
    queue: { at: ['plaza'], ttl: 3, icon: '!', name: 'A queue turning', text: 'The ration queue has stopped moving and started talking. Somebody at the front is holding up an empty packet.', opts: [
      { t: 'Walk the line. Slow voice, mask on.', check: ['authority', 5], ok: ['The queue starts moving again. Nobody thanks you. Nobody throws anything.', { merit: 2 }, [3, -3]], bad: ['Your voice cracks through the encoder. Somebody laughs. The queue gets louder.', {}, [-2, 4]] },
      { t: 'Pull the man with the packet out of the line.', tag: 'BY THE BOOK', cls: 'loyal', out: ['He goes without a fight. The queue watches him go.', { merit: 2, cons: -2 }, [4, 5]] },
    ] },
    runner: { at: ['bazaar', 's9', 's14', 'bridge'], ttl: 2, icon: '»', name: 'A runner', text: 'A boy breaks out of a doorway with a bundle under his coat and goes down the street like a thrown stone.', opts: [
      { t: 'Run him down.', check: ['fitness', 10], ok: ['You catch him at the corner. In the bundle: three loaves and a radio valve.', { merit: 3, xp: { fitness: 1 } }, [3, 3]], bad: ['He goes over a wall you cannot. You stand there breathing through the filter.', {}, [-1, 0]] },
      { t: 'Let him run. Note the doorway.', tag: 'MERCY', cls: 'mercy', out: ['You write the door number in your notebook and do not write the boy.', { cons: 2 }, [0, -2]] },
    ] },
    lantern: { at: ['s9', 's14', 's22'], ttl: 2, icon: '◉', name: 'Lantern alert', text: 'A Lantern is hanging outside a fourth-floor window with its collar gone red, strobing. Dispatch wants a unit to look.', opts: [
      { t: 'Go up and knock.', check: ['perception', 5], ok: ['A family round a table, and under the table a second radio. You see it. They see you see it.', { merit: 3 }, [3, 4]], bad: ['An old woman and a kettle. The Lantern goes back to cyan, embarrassed.', {}, [0, 2]] },
      { t: 'Report a sensor fault.', tag: 'MERCY', cls: 'mercy', out: ['GRID logs a collar fault on Lantern 0207. The window stays dark all night.', { cons: 2, susp: 1 }, [0, -3]] },
    ] },
    chalk: { at: ['s9', 's14', 's22', 'bazaar', 'bridge'], ttl: 4, icon: 'λ', name: 'Fresh chalk', text: 'A lambda on the wall at knee height, still wet with the rain. Whoever drew it had to kneel.', opts: [
      { t: 'Scrub it off with your sleeve.', out: ['Grey smear on grey wall. It will be back by morning.', { merit: 1 }, [1, 0]] },
      { t: 'Photograph it for JURY and canvass the landing.', tag: 'BY THE BOOK', cls: 'loyal', out: ['Six doors, six people who saw nothing. JURY gets a photograph and a list of six names.', { merit: 3, lp: 1 }, [3, 5]] },
      { t: 'Walk past.', out: ['You did not see it. Neither did your lenses, officially.', { cons: 1 }, [-1, -1]] },
    ] },
    collapse: { at: ['plaza', 'bazaar', 's22'], ttl: 2, icon: '+', name: 'A citizen down', text: 'An old man is lying on the wet stones with a ring of people standing round him at exactly the distance people stand when they are afraid to help.', opts: [
      { t: 'Kneel down and work on him.', check: ['medical', 5], ok: ['A pulse, then a cough. Two citizens carry him home on a door. One of them nods at you.', { cons: 3, xp: { medical: 1 } }, [0, -5]], bad: ['You do everything the manual says. It is not enough. Somebody covers his face with his own cap.', { cons: -1 }, [0, -1]] },
      { t: 'Call HELIX and keep the crowd back.', out: ['HELIX takes forty minutes. He is alive when they come.', { merit: 1 }, [1, 0]] },
    ] },
    smuggle: { at: ['gate'], ttl: 3, icon: '▣', name: 'A cart at the gate', text: 'A handcart of laundry at Canal Gate 3, and the woman pushing it will not look at the scanner.', opts: [
      { t: 'Search the cart.', check: ['perception', 5], ok: ['Under the sheets: coagulant, bandages, a child’s shoes. Medical contraband, green grade.', { merit: 3 }, [3, 4]], bad: ['Sheets. Only sheets. She thanks you for your diligence in a voice like a closed door.', {}, [0, 2]] },
      { t: 'Wave her through.', tag: 'MERCY', cls: 'mercy', out: ['The cart rattles away over the cobbles towards the canals.', { cons: 2, res: 2, susp: 1 }, [-1, -2]] },
    ] },
    whisper: { at: ['bazaar', 'plaza', 'bridge'], ttl: 2, icon: '?', name: 'A whisper', text: 'A stall holder catches your eye and looks, deliberately, at the alley behind the fish stall. Then back at his scales.', opts: [
      { t: 'Go and look in the alley.', out: ['A cellar door, a new padlock, and boot prints going in but not out. You write it up as a raid lead.', { merit: 3 }, [2, 1]] },
      { t: 'Buy a fish and move on. You owe him nothing.', out: ['Two tokens for a fish that is mostly bones.', { tokens: -2 }, [0, 0]] },
    ] },
    domestic: { at: ['s9', 's14', 's22'], ttl: 2, icon: '⌂', name: 'Shouting on a landing', text: 'Two families on one landing, one ration card between them, and a great deal of shouting about whose it is.', opts: [
      { t: 'Split the ration in front of them, by the gram.', check: ['authority', 5], ok: ['Nobody is happy. Nobody is hungry tonight either.', { cons: 2 }, [2, -4]], bad: ['Both families turn on you instead. A door slams on your boot.', { hp: -3 }, [-1, 3]] },
      { t: 'Confiscate the card as disputed property.', tag: 'BY THE BOOK', cls: 'loyal', out: ['The card goes in your pouch. The landing goes very quiet.', { merit: 2, cons: -3 }, [3, 6]] },
    ] },
  };
  const EK = Object.keys(EVENTS);

  const spawn = (s) => {
    const p = P(s);
    const k = pick(EK);
    const free = EVENTS[k].at.filter((n) => !p.ev.some((e) => e.node === n));
    if (!free.length) return;
    p.ev.push({ k, node: pick(free), ttl: EVENTS[k].ttl, id: ++p.n });
  };
  const tick = (s) => {
    const p = P(s);
    p.hour++;
    p.ev.forEach((e) => e.ttl--);
    p.ev.filter((e) => e.ttl <= 0).forEach((e) => {
      p.missed++;
      const b = NODES[e.node].block;
      if (b) G.distFx(s, b, -2, 2);
      p.log.push(`${clock(p.hour)} — ${EVENTS[e.k].name.toLowerCase()} at ${NODES[e.node].name}: nobody came.`);
    });
    p.ev = p.ev.filter((e) => e.ttl > 0);
    if (Math.random() < 0.6 && p.ev.length < 4) spawn(s);
  };

  function mapSvg(s) {
    const p = P(s);
    let g = `<svg viewBox="${VB.join(' ')}" class="pt-svg" role="img" aria-label="District 5 patrol map">`;
    g += G.CITY_MAP_IMG ? `<image href="${G.CITY_MAP_IMG}" x="0" y="0" width="1600" height="900"/>` : `<rect x="${VB[0]}" y="${VB[1]}" width="${VB[2]}" height="${VB[3]}" fill="#141d22"/>`;
    g += `<rect x="${VB[0]}" y="${VB[1]}" width="${VB[2]}" height="${VB[3]}" fill="rgba(6,10,13,.35)"/>`;
    const here = NODES[p.at];
    NK.forEach((k) => k !== p.at && (g += `<line x1="${here.x}" y1="${here.y}" x2="${NODES[k].x}" y2="${NODES[k].y}" class="pt-path"/>`));
    NK.forEach((k) => {
      const n = NODES[k];
      const e = p.ev.find((x) => x.node === k);
      g += `<g class="pt-node${k === p.at ? ' here' : ''}${e ? ' hot' : ''}" data-pt="${k}" tabindex="0" role="button" aria-label="${n.name}">`;
      g += `<circle cx="${n.x}" cy="${n.y}" r="${e ? 13 : 9}"/>`;
      if (e) g += `<text x="${n.x}" y="${n.y + 5}" class="pt-ico">${EVENTS[e.k].icon}</text><text x="${n.x + 16}" y="${n.y - 10}" class="pt-ttl">${e.ttl}h</text>`;
      g += `<text x="${n.x}" y="${n.y + 26}" class="pt-name">${n.name.toUpperCase()}</text></g>`;
    });
    g += `<g class="pt-you"><circle cx="${here.x}" cy="${here.y}" r="5"/></g>`;
    return g + '</svg>';
  }
  document.addEventListener('click', (e) => {
    const n = e.target.closest && e.target.closest('#story .block.current [data-pt]');
    if (!n) return;
    const b = document.querySelector(`#story .block.current .choice[data-ptgo="${n.dataset.pt}"]`);
    if (b && !b.disabled) b.click();
  });
  G.afterRender.push((sc, id, block) => {
    if (id !== 'pt_map') return;
    const s = G.state();
    block.querySelectorAll('.choice').forEach((b) => {
      const m = NK.find((k) => b.textContent.includes('Walk to ' + NODES[k].name));
      if (m) b.dataset.ptgo = m;
      else if (/Deal with it/.test(b.textContent)) b.dataset.ptgo = P(s).at;
    });
  });

  G.extend('u_board', {
    choices: (list, s) => {
      if (s.phase !== 'union' || G.rankIdx(s.rank) < G.rankIdx('05')) return list;
      list.push({ t: '**Walk District 5.** A patrol shift on the map: you choose where to be.', tag: 'PATROL', tagCls: 'duty', fx: (st) => ((st.duty.current = 'patrol'), (st.time = 'Day'), null), go: 'pt_start' });
      return list;
    },
  });

  const scenes = {
    pt_start: {
      title: 'District 5 — patrol',
      enter: (s) => {
        G.worldEnsure && G.worldEnsure(s);
        s.pt = { hour: 8, at: 'precinct', ev: [], n: 0, done: 0, missed: 0, log: [] };
        spawn(s);
        spawn(s);
        G.unlock(s, 'patrol');
      },
      text: (s) => [`@say ${sup(s)}|District 5 is yours until 18:00. Be where things happen. You cannot be everywhere, so choose.`],
      choices: [{ t: 'Step out of the precinct.', go: 'pt_map' }],
    },
    pt_map: {
      title: (s) => `District 5 — ${clock(P(s).hour)}`,
      enter: (s) => (P(s).hour >= 18 ? 'pt_end' : undefined),
      text: (s) => {
        const p = P(s);
        return [
          '@html <div class="pt-wrap">' + mapSvg(s) + '</div>',
          `@sys ${clock(p.hour)} · You are at ${NODES[p.at].name}. Shift ends 18:00.`,
          p.ev.length ? '@sys ' + p.ev.map((e) => `${EVENTS[e.k].icon} ${EVENTS[e.k].name} — ${NODES[e.node].name} (${e.ttl}h)`).join(' · ') : '@sys The district is quiet. For now.',
        ];
      },
      choices: (s) => {
        const p = P(s);
        const here = p.ev.find((e) => e.node === p.at);
        const list = [];
        if (here) list.push({ t: `**Deal with it:** ${EVENTS[here.k].name.toLowerCase()}.`, tag: 'HERE', tagCls: 'duty', fx: (st) => ((P(st).cur = here.id), null), go: 'pt_ev' });
        NK.filter((k) => k !== p.at)
          .sort((a, b) => (p.ev.some((e) => e.node === b) ? 1 : 0) - (p.ev.some((e) => e.node === a) ? 1 : 0))
          .forEach((k) => {
            const e = p.ev.find((x) => x.node === k);
            list.push({ t: `Walk to ${NODES[k].name}${e ? ` — ${EVENTS[e.k].name.toLowerCase()} (${e.ttl}h)` : ''}.`, fx: (st) => ((P(st).at = k), tick(st), null), go: 'pt_map' });
          });
        list.push({ t: 'Stand here for an hour and watch.', fx: (st) => (tick(st), null), go: 'pt_map' });
        return list;
      },
    },
    pt_ev: {
      title: (s) => {
        const e = P(s).ev.find((x) => x.id === P(s).cur);
        return `${NODES[P(s).at].name} — ${e ? EVENTS[e.k].name.toLowerCase() : ''}`;
      },
      enter: (s) => (P(s).ev.some((x) => x.id === P(s).cur) ? undefined : 'pt_map'),
      text: (s) => [EVENTS[P(s).ev.find((x) => x.id === P(s).cur).k].text],
      choices: (s) => {
        const p = P(s);
        const e = p.ev.find((x) => x.id === p.cur);
        const fin = (res) => (st) => {
          const q = P(st);
          q.res = res[0];
          q.ev = q.ev.filter((x) => x.id !== q.cur);
          q.done++;
          const b = NODES[q.at].block;
          if (b && res[2]) G.distFx(st, b, res[2][0], res[2][1]);
          tick(st);
          return res[1];
        };
        return EVENTS[e.k].opts.map((o) =>
          o.check
            ? { t: o.t, check: { skill: o.check[0], diff: o.check[1], pass: 'pt_res', fail: 'pt_res', okFx: fin(o.ok), failFx: fin(o.bad) } }
            : { t: o.t, tag: o.tag, tagCls: o.cls, fx: fin(o.out), go: 'pt_res' }
        );
      },
    },
    pt_res: { text: (s) => [P(s).res], choices: [{ t: 'Back on the street.', go: 'pt_map' }] },
    pt_end: {
      title: 'District 5 — end of shift',
      enter: (s) => {
        const p = P(s);
        G.fx(s, { merit: 2 + Math.round(p.done * 1.5) - (p.missed >= 3 ? 1 : 0) });
      },
      text: (s) => {
        const p = P(s);
        return [`@doc PATROL REPORT — D5\nHANDLED: ${p.done}\nMISSED: ${p.missed}`, ...p.log.slice(-4), p.missed === 0 && p.done >= 3 ? `@say ${sup(s)}|Nothing got past you today. That will not last. Enjoy it.` : null];
      },
      choices: [{ t: 'End of shift.', go: 'u_duty_end' }],
    },
  };
  G.addScenes(scenes);
  G.addCodex({
    patrol: {
      title: 'Walking a patrol',
      body: '<p>A patrol shift runs from 08:00 to 18:00. Dispatch marks incidents on the district map with the hours they will wait: a queue, a runner, a Lantern alert, chalk. A unit cannot be everywhere. What it does not reach, the block remembers.</p>',
    },
  });
  G.CODEX_GROUPS.find((g) => g.title === 'Procedure').ids.push('patrol');
})();
