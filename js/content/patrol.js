/* PATROL — a shift you walk yourself, on the painted map of District 5.
   From the duty board: "Walk District 5". The shift runs 08:00–18:00, an hour a move. Eight places
   on the map; things happen at them while the clock runs (a queue turning, a runner, a Lantern
   alert, chalk, a collapse, a whisper). Each has a timer. Go there and deal with it — every one a
   small choice — or let it lapse, and the block remembers. Tap a place on the map to walk there. */
(function () {
  const pick = G.pick;
  /* the map: a crop of the city map until a close-up District 5 map exists (G.PT_MAP.img) */
  G.PT_MAP = G.PT_MAP || { img: 'assets/img/d5-map.webp', vb: [0, 0, 1600, 900] };
  const VB = G.PT_MAP.vb;
  const NODES = {
    precinct: { name: 'Precinct D5', x: 165, y: 560, block: null },
    plaza: { name: 'Plaza 5', x: 390, y: 160, block: 'plaza' },
    s9: { name: 'Stack 9', x: 480, y: 360, block: 's9' },
    s14: { name: 'Stack 14', x: 840, y: 330, block: 's14' },
    s22: { name: 'Stack 22', x: 1250, y: 370, block: 's22' },
    bazaar: { name: 'Bazaar Row', x: 790, y: 790, block: 'bazaar' },
    gate: { name: 'Canal Gate 3', x: 1470, y: 610, block: 'bazaar' },
    bridge: { name: 'Lock Bridge', x: 1120, y: 70, block: 'plaza' },
  };
  const NK = Object.keys(NODES);
  const sup = (s) => (G.superiorOf ? G.superiorOf(s).name : 'Granite');
  const P = (s) => s.pt;
  const clock = (h) => `${String(h % 24).padStart(2, '0')}:00`;

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
  /* events that open the game's bigger systems, and night events */
  Object.assign(EVENTS, {
    suspect: { at: ['bazaar', 'plaza', 'gate', 'bridge'], ttl: 2, icon: '⚑', name: 'A citizen avoiding your eyes', text: 'Someone in a faded jacket turns too quickly when your lenses come round the corner, and keeps one hand in a pocket.', opts: [
      { t: 'Stop and search.', tag: 'STOP', cls: 'duty', go: 'ss', out: ['', {}, [1, 1]] },
      { t: 'Let them go about their day.', out: ['They walk on. At the corner they look back once.', { cons: 1 }, [0, -1]] },
    ] },
    lead: { at: ['s9', 's14', 's22'], ttl: 2, icon: '⌧', name: 'A door with a new padlock', text: 'A cellar door that was rotten last week has a new steel padlock on it. Boot prints in, none out. A Lantern logged movement here at 04:00.', opts: [
      { t: 'Break the lock. Raid it now.', tag: 'RAID', cls: 'duty', go: 'raid', out: ['', {}, [3, 4]] },
      { t: 'Log it as a raid lead for the night squad.', out: ['A line in the night squad’s book. Somebody else’s door to kick.', { merit: 2 }, [1, 1]] },
    ] },
    crowd: { at: ['plaza'], ttl: 2, icon: '‼', name: 'A crowd gathering', text: 'A broadcast screen on Plaza 5 has frozen mid-speech, and a crowd is gathering under it to watch it not work. The mood is turning into something else.', opts: [
      { t: 'Take command of the plaza.', tag: 'CROWD', cls: 'duty', go: 'crowd', out: ['', {}, [0, 0]] },
      { t: 'Call GRID and stay at the edge.', out: ['GRID restarts the screen. The crowd stays, watching the Administrator speak, saying nothing.', {}, [0, 2]] },
    ] },
    face: { at: ['s9', 's14', 's22', 'bazaar', 'plaza'], ttl: 3, icon: '☺', name: 'A face you know', when: (s) => Object.values(s.files || {}).some((f) => f.face !== undefined && !f.amputated), text: (s) => {
      const f = s.pt.faceFile;
      return `@portrait ${G.DOC_FACES[f.face].img}|CID ${f.cid}
On the corner, someone from your files: CID ${f.cid}, ${f.desc}. Day ${f.last}: ${f.lastVerdict || 'stopped'}. They have seen you.`;
    }, opts: [
      { t: 'Nod and walk on.', tag: 'MERCY', cls: 'mercy', out: ['They nod back. It is almost nothing. In the Stacks it is not nothing.', { cons: 2 }, [0, -2]] },
      { t: 'Stop them again. Papers.', tag: 'BY THE BOOK', cls: 'loyal', out: ['They hand the card over before you ask, and stand very still while you read it.', { merit: 1, cons: -2 }, [2, 3]] },
    ] },
    curfew: { at: ['s9', 's14', 's22', 'bazaar', 'bridge'], ttl: 1, night: true, icon: '☾', name: 'Curfew breaker', text: 'A figure on the street after 20:00, walking fast, close to the walls, carrying something wrapped in a blanket.', opts: [
      { t: 'Run them down.', check: ['fitness', 10], ok: ['A woman with a sick child in the blanket, going to a neighbour who has medicine. Level 2: curfew.', { merit: 2 }, [2, 2]], bad: ['They are gone round a corner you do not know.', {}, [-1, 0]] },
      { t: 'Shine your lamp, then lower it.', tag: 'MERCY', cls: 'mercy', out: ['The figure stops, sees the light go down, and is gone.', { cons: 2 }, [-1, -2]] },
    ] },
    searchlight: { at: ['plaza', 's14', 'bridge'], ttl: 1, night: true, icon: '✦', name: 'Shrike searchlight', text: 'The knock of rotors over the Stacks. A Shrike’s searchlight comes down the street and stops on you. Airwatch wants an armband.', opts: [
      { t: 'Stand still and show your armband.', out: ['The light holds on you for ten seconds, and moves on. Somewhere behind you, a door closes softly.', { lp: 1 }, [1, 0]] },
      { t: 'Wave it towards the canal, away from the Stacks.', tag: 'RISK', cls: 'risk', out: ['The light swings to the canal. Whatever it was looking for in the Stacks, it does not find tonight.', { cons: 3, susp: 2 }, [0, -2]] },
    ] },
    lights: { at: ['s9', 's14', 's22'], ttl: 2, night: true, icon: '▤', name: 'Lights in an empty flat', text: 'A flat the register says has been empty since the relocation in spring. There is a candle in the window, and shadows on the curtain.', opts: [
      { t: 'Go in.', tag: 'RAID', cls: 'duty', go: 'raid', out: ['', {}, [3, 4]] },
      { t: 'Note it and walk on.', out: ['The candle goes out as you pass.', {}, [0, 0]] },
    ] },
    canal: { at: ['gate', 'bridge'], ttl: 2, night: true, icon: '≈', name: 'Something in the canal', text: 'A bundle against the lock gate, turning slowly in the black water. A coat. A sleeve. A hand.', opts: [
      { t: 'Pull it out and call HELIX.', check: ['fitness', 5], ok: ['A citizen, cold, not breathing. HELIX takes the body. JURY will take the file.', { merit: 2 }, [0, 0]], bad: ['The current takes it under the gate before you can reach it.', { hp: -4 }, [0, 0]] },
      { t: 'Push it on with your boot. Not your district.', out: ['It goes under the gate and away towards the Works.', { cons: -3 }, [0, 0]] },
    ] },
  });
  /* the division's work comes to you: an assignment from today's board, at a place that fits it */
  const DIV_NODE = { UNION: 'plaza', HELIX: 'precinct', JURY: 'precinct', RAZOR: 'bridge', SPEAR: 'gate', VECTOR: 's9', GRID: 'bazaar' };
  const offered = (s) => (s.duty.offers || []).filter((k) => G.duties[k] && k !== 'patrol');
  EVENTS.assign = {
    at: ['plaza', 'precinct', 'bridge', 'gate', 's9', 'bazaar'], ttl: 5, icon: '✎', name: 'An assignment', manual: true,
    when: (s) => !!offered(s).length,
    text: (s) => {
      const k = P(s).assignKey;
      const d = G.duties[k];
      return `${d ? d.name : 'An assignment'}\n${d ? d.desc : ''}`;
    },
    opts: [{ t: 'Take it.', tag: 'DUTY', cls: 'duty', go: 'assign', out: ['', {}, [0, 0]] }, { t: 'Let someone else have it.', out: ['It goes to the next unit on the roster.', { merit: -1 }, [0, 0]] }],
  };
  const EK = Object.keys(EVENTS);

  const spawn = (s) => {
    const p = P(s);
    const pool = EK.filter((k) => !EVENTS[k].manual && !!EVENTS[k].night === !!p.night && (!EVENTS[k].when || EVENTS[k].when(s)));
    const k = pick(pool);
    const free = EVENTS[k].at.filter((n) => !p.ev.some((e) => e.node === n));
    if (!free.length) return;
    p.ev.push({ k, node: pick(free), ttl: EVENTS[k].ttl, id: ++p.n });
  };
  /* one assignment per hour-block while the board has any left, never at night */
  const assign = (s) => {
    const p = P(s);
    if (p.night || p.ev.some((e) => e.k === 'assign') || p.assigned >= 3) return;
    const left = offered(s).filter((k) => !(p.takenKeys || []).includes(k));
    if (!left.length) return;
    const key = pick(left);
    const home = DIV_NODE[s.div || 'UNION'];
    const node = EVENTS.assign.at.includes(home) && !p.ev.some((e) => e.node === home) ? home : pick(EVENTS.assign.at.filter((n) => !p.ev.some((e) => e.node === n)));
    if (!node) return;
    p.ev.push({ k: 'assign', node, ttl: 5, id: ++p.n, key });
    p.assigned = (p.assigned || 0) + 1;
  };
  const dist = (a, b) => Math.hypot(NODES[a].x - NODES[b].x, NODES[a].y - NODES[b].y);
  const cost = (a, b) => (dist(a, b) > 700 ? 2 : 1);
  const tick = (s, n) => {
    for (let i = 1; i < (n || 1); i++) tickOne(s);
    tickOne(s);
  };
  const tickOne = (s) => {
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
    if (!p.night && (p.hour - 8) % 3 === 0 && p.ev.length < 5) assign(s);
  };

  function mapSvg(s) {
    const p = P(s);
    let g = `<svg viewBox="${VB.join(' ')}" class="pt-svg${p.night ? ' night' : ''}" role="img" aria-label="District 5 patrol map">`;
    g += G.PT_MAP.img ? `<image href="${G.PT_MAP.img}" x="${VB[0]}" y="${VB[1]}" width="${VB[2]}" height="${VB[3]}" preserveAspectRatio="xMidYMid slice"/>` : G.CITY_MAP_IMG ? `<image href="${G.CITY_MAP_IMG}" x="0" y="0" width="1600" height="900"/>` : `<rect x="${VB[0]}" y="${VB[1]}" width="${VB[2]}" height="${VB[3]}" fill="#141d22"/>`;
    g += `<rect x="${VB[0]}" y="${VB[1]}" width="${VB[2]}" height="${VB[3]}" fill="${p.night ? 'rgba(2,6,14,.62)' : 'rgba(6,10,13,.35)'}"/>`;
    const here = NODES[p.at];
    NK.forEach((k) => k !== p.at && (g += `<line x1="${here.x}" y1="${here.y}" x2="${NODES[k].x}" y2="${NODES[k].y}" class="pt-path"/>`));
    NK.forEach((k) => {
      const n = NODES[k];
      const e = p.ev.find((x) => x.node === k);
      g += `<g class="pt-node${k === p.at ? ' here' : ''}${e ? ' hot' : ''}" data-pt="${k}" tabindex="0" role="button" aria-label="${n.name}">`;
      g += `<circle cx="${n.x}" cy="${n.y}" r="${e ? 26 : 18}"/>`;
      if (e) g += `<text x="${n.x}" y="${n.y + 9}" class="pt-ico">${EVENTS[e.k].icon}</text><text x="${n.x + 30}" y="${n.y - 18}" class="pt-ttl">${e.ttl}h</text>`;
      g += `<text x="${n.x}" y="${n.y + 48}" class="pt-name">${n.name.toUpperCase()}</text></g>`;
    });
    g += `<g class="pt-you"><circle cx="${here.x}" cy="${here.y}" r="9"/></g>`;
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
      const mine = [{ t: '**Walk District 5.** Your day is on the map: where you are decides what you handle, and your division’s work finds you there.', tag: 'PATROL', tagCls: 'duty', fx: (st) => ((st.duty.current = 'patrol'), (st.time = 'Day'), null), go: 'pt_start' }];
      if (G.rankIdx(s.rank) >= G.rankIdx('04')) mine.push({ t: '**Night patrol.** The curfew shift, 20:00 to 02:00, on the map.', tag: 'PATROL', tagCls: 'duty', fx: (st) => ((st.duty.current = 'patrol'), (st.mem.ptNight = true), (st.time = 'Day'), null), go: 'pt_start' });
      /* the map comes first; the old board duties stay below it as the other way to spend a day */
      const first = list.findIndex((c) => c.tag === 'NEW' || c.tag === 'ROUTINE');
      list.forEach((c) => (c.tag === 'NEW' || c.tag === 'ROUTINE') && !/^Board duty/.test(c.t) && (c.t = 'Board duty: ' + c.t));
      list.splice(first < 0 ? list.length : first, 0, ...mine);
      return list;
    },
  });

  /* while a patrol shift runs, every 'end of shift' from a stop, a raid or a report leads back to
     the map (first in line, so pay and duty counts happen once, at the real end) */
  (G.ext.u_duty_end = G.ext.u_duty_end || []).unshift({ before: (s) => (s.pt && s.pt.active ? 'pt_back' : undefined) });

  const scenes = {
    pt_start: {
      title: 'District 5 — patrol',
      enter: (s) => {
        G.worldEnsure && G.worldEnsure(s);
        const night = !!s.mem.ptNight;
        s.mem.ptNight = false;
        s.pt = { active: true, hour: night ? 20 : 8, end: night ? 26 : 18, night, at: 'precinct', ev: [], n: 0, done: 0, missed: 0, log: [] };
        if (night) s.time = 'Night';
        spawn(s);
        spawn(s);
        assign(s);
        G.unlock(s, 'patrol');
      },
      text: (s) => [P(s).night ? `@say ${sup(s)}|Curfew shift. Anyone on the street is either breaking the law or about to. Lamps, not batons, until you know which. Back at 02:00.` : `@say ${sup(s)}|District 5 is yours until 18:00. Be where things happen. You cannot be everywhere, so choose.`, G.partnerOf && G.partnerOf(s).key ? `${G.partnerOf(s).name} walks with you.` : null],
      choices: [{ t: 'Step out of the precinct.', go: 'pt_map' }],
    },
    pt_map: {
      title: (s) => `District 5 — ${clock(P(s).hour)}`,
      enter: (s) => (P(s).hour >= P(s).end ? 'pt_end' : undefined),
      text: (s) => {
        const p = P(s);
        return [
          '@html <div class="pt-wrap">' + mapSvg(s) + '</div>',
          `@sys ${clock(p.hour)} · You are at ${NODES[p.at].name}. Shift ends ${clock(p.end)}. Far places take two hours to reach.`,
          G.partnerOf && G.partnerOf(s).key && Math.random() < 0.3 ? `@say ${G.partnerOf(s).name}|${pick(p.night ? ['Quiet. Too quiet, or just quiet?', 'Lamp low. Let them see us before we see them.', 'There is a light on in 14. There is always a light on in 14.'] : ['You can’t be everywhere. Pick the one that bites first.', 'Plaza’s getting loud. Or I’m getting old.', 'Lantern’s been circling Stack 9 all morning.'])}` : null,
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
            const h = cost(p.at, k);
            list.push({ t: `Walk to ${NODES[k].name}${h > 1 ? ' (2h)' : ''}${e ? ` — ${EVENTS[e.k].name.toLowerCase()} (${e.ttl}h left)` : ''}.`, fx: (st) => { const from = P(st).at; P(st).at = k; tick(st, cost(from, k)); return null; }, go: 'pt_map' });
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
      enter: (s) => {
        const p = P(s);
        const e = p.ev.find((x) => x.id === p.cur);
        if (!e) return 'pt_map';
        if (e.k === 'assign') p.assignKey = e.key;
        if (e.k === 'face' && !p.faceFile) p.faceFile = pick(Object.values(s.files || {}).filter((f) => f.face !== undefined && !f.amputated));
      },
      text: (s) => {
        const e = EVENTS[P(s).ev.find((x) => x.id === P(s).cur).k];
        if (typeof e.text !== 'function') return [e.text];
        const [a, b] = e.text(s).split('\n');
        return [a, b];
      },
      choices: (s) => {
        const p = P(s);
        const e = p.ev.find((x) => x.id === p.cur);
        const fin = (res) => (st) => {
          const q = P(st);
          q.res = res[0];
          q.ev = q.ev.filter((x) => x.id !== q.cur);
          q.faceFile = null;
          q.done++;
          const b = NODES[q.at].block;
          if (b && res[2]) G.distFx(st, b, res[2][0], res[2][1]);
          tick(st);
          return res[1];
        };
        const launch = (o) => (st) => {
          fin(o.out)(st);
          const q = P(st);
          if (o.go === 'ss') st.mem.ssRet = 'pt_back';
          if (o.go === 'assign') {
            const k = q.assignKey;
            (q.takenKeys = q.takenKeys || []).push(k);
            st.duty.current = k;
            q.launch = (st.duty.done[k] ? G.duties[k].routine : G.duties[k].first);
            st.duty.done[k] = (st.duty.done[k] || 0) + 1;
          }
          if (o.go === 'raid') {
            st.raid = G.makeRaid(st, { addr: `${NODES[q.at].name}, ${pick(['cellar', 'flat 4C', 'flat 9A', 'the boiler room'])}` });
            st.raid.ret = 'pt_back';
          }
          return null;
        };
        return EVENTS[e.k].opts.map((o) =>
          o.go
            ? { t: o.t, tag: o.tag, tagCls: o.cls, fx: launch(o), go: o.go === 'assign' ? (st) => P(st).launch : { ss: 'ss_start', raid: 'raid_start', crowd: 'pt_crowd' }[o.go] }
            : o.check
            ? { t: o.t, check: { skill: o.check[0], diff: o.check[1], pass: 'pt_res', fail: 'pt_res', okFx: fin(o.ok), failFx: fin(o.bad) } }
            : { t: o.t, tag: o.tag, tagCls: o.cls, fx: fin(o.out), go: 'pt_res' }
        );
      },
    },
    pt_res: { text: (s) => [P(s).res], choices: [{ t: 'Back on the street.', go: 'pt_map' }] },
    pt_back: { safe: true, enter: (s) => (s.pt && s.pt.active ? ((s.mem.ssRet = null), tick(s, 1), 'pt_map') : 'u_evening'), text: [] },
    pt_crowd: {
      title: 'Plaza 5 — the frozen screen',
      text: ['@sys Crowd control. Keep the plaza under the boil until GRID gets the screen back.'],
      mini: { type: 'crowd', opts: (s) => G.crowdOpts(s, { block: 'plaza', title: 'Plaza 5 — the frozen screen', seconds: 30 }), pass: 'pt_crowd_ok', fail: 'pt_crowd_bad', skill: 'authority', diff: 10 },
    },
    pt_crowd_ok: { text: ['The screen flickers back. The crowd thins into the Stacks, slowly, in pieces.'], choices: [{ t: 'Back on the street.', fx: (s) => (G.distFx(s, 'plaza', 3, (s.lastMini && s.lastMini.force) ? 6 : -2), { merit: 3, xp: { authority: 1 } }), go: 'pt_back' }] },
    pt_crowd_bad: { text: ['The barrier goes over. Nobody is badly hurt. Everybody remembers.'], choices: [{ t: 'Back on the street.', fx: (s) => (G.distFx(s, 'plaza', -6, 8), { hp: -6, merit: -1 }), go: 'pt_back' }] },
    pt_end: {
      title: 'District 5 — end of shift',
      enter: (s) => {
        const p = P(s);
        p.active = false;
        s.mem.ssRet = null;
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
