/* CHAPTER FOURTEEN — "The Northbound". All divisions. One train, seven cars, six hours.
   The transport that left Nova Prospekt for "reprocessing" is going north to City 17 with a hundred and
   eighty names on its manifest, and you are put aboard as its escort. The train is shown in cross-section:
   each car is a room with one person and one problem. You can only reach six of the seven before Tunnel 9.
   What you find becomes what you have in the dark: allies, clues, a way to stop the train.
   THE TUNNEL: the Lambda stop the train. You choose a side, with costs: DEFEND it, OPEN the wagons and
   help them (the uncoupling minigame), or HOLD it in the dark with the emergency brake. Nothing is free.
   You remain Civil Protection throughout. Freeman is never named here. */
(function () {
  G.chapter({ n: 14, stages: [] });
  const pick = G.pick;
  const C = (s) => s.c14;
  const VIGIL = '@portrait assets/img/portraits/vigil.webp|Field Commander Vigil';
  const clock = (h) => `${String(h % 24).padStart(2, '0')}:00`;
  /* the train, left to right: engine at the right, brake van at the left */
  const CARS = {
    brake: { name: 'Brake van', who: 'Brakeman Pell' },
    envoy: { name: 'Envoy car', who: 'Delegate Maren' },
    w3: { name: 'Wagon 3 — sealed', who: 'the sealed cell' },
    w2: { name: 'Wagon 2 — fever', who: 'the sick' },
    w1: { name: 'Wagon 1', who: 'the quiet ones' },
    guard: { name: 'Warden car', who: 'Captain Voss' },
    engine: { name: 'Locomotive', who: 'the driver' },
  };
  const CK = Object.keys(CARS);
  const apply = (s, e) => {
    const c = C(s);
    if (!e) return;
    if (e.clue) c.clues += e.clue;
    if (e.ready) c.ready += e.ready;
    if (e.saved) c.saved += e.saved;
    if (e.lost) c.lost += e.lost;
    if (e.flag) c.flags[e.flag] = true;
  };

  /* ---------------------------------------------------------- what is in each car */
  const INS = {
    engine: { icon: '?', text: [
      'The driver is an old man named Halvorsen with a hand on the regulator that has not moved in an hour. He has driven this line for thirty years, and tells you so before you ask.',
    ], opts: [
      { t: 'Ask about Tunnel 9. Ask what he knows about the signal there.', check: ['comms', 5], ok: ['*“The lamp at Tunnel 9 has been green for six nights running. It is never green. Somebody is keeping it green.”* He does not say who. He does not need to.', {}, { clue: 1, flag: 'tunnel' }], bad: ['He talks about the weather, the grade and his knee. Nothing about the lamp.', {}, {}] },
      { t: 'Win him over. He is on the train too.', check: ['authority', 5], ok: ['*“If you ask me to stop her in the dark, I will. I have done it once. It is a long way down.”*', { cons: 1 }, { flag: 'engineer' }], bad: ['He looks at your armband, then at the track.', {}, {}] },
      { t: 'Remind him whose train it is.', tag: 'BY THE BOOK', cls: 'loyal', out: ['He nods and says nothing for the next ten miles.', { merit: 2, cons: -1 }, { ready: 1 }] },
    ] },
    guard: { icon: '?', text: [
      '@say Captain Voss|Do not look at the door at the end of the car, unit. It is not on your manifest. It is not on mine.',
      'Captain Voss of the Prospekt garrison has a thin face and a fine tremor in his hand that he is trying to hide by holding the strap of his rifle. There are twelve Wardens in the car and none of them are talking.',
    ], opts: [
      { t: 'Demand the sealed order.', check: ['authority', 5], ok: ['The order is one line: *Wagon 3 delivered in silence. No transfers en route.* It is signed with a key you have seen before.', {}, { clue: 1, flag: 'order' }], bad: ['He puts a hand flat on the envelope. *“I do not think so.”*', { susp: 1 }, {}] },
      { t: 'Sit with the Wardens. Share the tin of tea. Listen.', check: ['perception', 5], ok: ['They are afraid. Not of the Lambda: of what the train carries. Two of them would not fire on an unarmed wagon. Voss knows it, and so do you.', { cons: 1 }, { flag: 'wardens', ready: 1 }], bad: ['They go quiet when you sit down, and stay quiet.', {}, {}] },
      { t: 'Take command of the guard.', tag: 'BY THE BOOK', cls: 'loyal', out: ['Twelve Wardens look at you, then at Voss, then at you. Voss nods. It costs him something.', { merit: 3 }, { ready: 2 }] },
    ] },
    w1: { icon: '?', text: [
      'Wagon 1: sixty people on benches, cuffed in pairs, in the charcoal jackets with the numbers. The boy from the intake yard, NP-04117, looks up and then very hard at the floor.',
    ], opts: [
      { t: 'Sit beside the boy. Say nothing.', tag: 'MERCY', cls: 'mercy', out: ['After a time he taps the bench three times with one finger, a pause, then once. *“That is how you say it,”* he whispers. *“If you are one of ours.”*', { cons: 2 }, { flag: 'code' }] },
      { t: 'Walk the wagon with the manifest and count heads.', check: ['perception', 5], ok: ['Four names on the list are not in the wagon. Four faces in the wagon are not on the list. Somebody has been swapping them since Nova Prospekt.', {}, { clue: 1 }], bad: ['The numbers match. The faces do not mean anything to you.', {}, {}] },
      { t: 'Keep order. Silence in the wagon.', tag: 'BY THE BOOK', cls: 'loyal', out: ['Sixty people go still. It is not quiet. It is the other thing.', { merit: 1, cons: -2 }, { ready: 1 }] },
    ] },
    w2: { icon: '?', text: [
      'Wagon 2 smells of sweat and illness. Fever has gone through it like a draught: half of them are down, one is not breathing the way a person breathes, and the Wardens have shut the vents because of the cold.',
    ], opts: [
      { t: 'Work the wagon.', tag: 'MEDICAL', cls: 'duty', mini: true },
      { t: 'Order the vents opened and the wagon split into two.', check: ['authority', 5], ok: ['The air moves. Two of the worst are carried to the wagon’s far end. Nobody dies in the next hour.', { cons: 2 }, { saved: 6 }], bad: ['The Warden refuses. There is a short argument. Two people are worse by the end of it.', {}, { lost: 2 }] },
      { t: 'Move on. It is not your wagon.', out: ['You walk through. Somebody says a name behind you.', { cons: -3 }, { lost: 4 }] },
    ] },
    w3: { icon: '?', text: [
      'The door of Wagon 3 is welded shut at the lock and sealed with a strip of paper stamped with the Nova Prospekt key. Behind it, through the slats, you can hear one person breathing. Only one.',
    ], opts: [
      { t: 'Break the seal and open it.', check: ['melee', 5], ok: ['A man in an olive clerk’s coat is sitting on the floor with his hands folded. He looks up. *“I did not burn it,”* he says. *“I only watched. They said I would not arrive.”* It is the clerk from the records room.', {}, { flag: 'clerk', clue: 1 }], bad: ['The weld holds. A guard looks down the car. You walk away from the door.', { susp: 2 }, {}] },
      { t: 'Ask Voss why the wagon is sealed.', out: ['Voss looks at the floor, and then at you. *“Because the man in it knows where the pages went.”* He does not say any more.', {}, { clue: 1 }] },
      { t: 'Leave the seal alone. It is an order.', tag: 'BY THE BOOK', cls: 'loyal', out: ['The paper strip stays. So does the breathing.', { merit: 2, cons: -3 }, {}] },
    ] },
    envoy: { icon: '?', text: [
      'The envoy car has a carpet, a samovar and a delegate of the Sector named Maren, in a travelling coat the colour of ash. She has not looked up from her papers in ten minutes. A small steel case sits on the seat beside her.',
    ], opts: [
      { t: 'Listen to what she is offering.', out: ['*“I need an escort who reads the reports,”* she says. *“Hand me the clerk and your Nova Prospekt file, and I will see your hearing record closed. And your next grade. A person who can be useful is a person who can be promoted.”*', {}, { flag: 'deal' }] },
      { t: 'Read her face. What is in the case?', check: ['deception', 5], ok: ['She is lying about nothing, and that is the problem. In the case: reprocessing orders for six thousand more people, signed, waiting for a train.', {}, { clue: 1, flag: 'case' }], bad: ['She offers you tea.', {}, {}] },
      { t: 'Decline politely. You are an escort, not a courier.', out: ['*“Of course,”* Maren says, in a voice that has decided something.', { susp: 1 }, {}] },
    ] },
    brake: { icon: '?', text: [
      'The brake van is a cold wooden box with a stove and a window at the back. Brakeman Pell, a man in his forties with a flask and a small lantern, is watching the track slide away behind the train. He does not turn round.',
    ], opts: [
      { t: 'Tap the bench three times, pause, once.', out: ['He turns round. He does not smile. *“At the lamp,”* he says. *“Do not shoot. We will not shoot the Wardens who do not shoot us. Be at the couplings by the third bell.”*', { cons: 1, res: 3 }, { flag: 'brakeman', clue: 1 }], needs: 'code' },
      { t: 'Say nothing. Ask for a light.', check: ['deception', 5], ok: ['He gives it. His hand shakes. *“I am only a man who keeps the van,”* he says, a little too fast. You write down what he did not say.', {}, { clue: 1 }], bad: ['He gives it, and says nothing, and looks at the window.', {}, {}] },
      { t: 'Arrest him. He is the one who knows.', tag: 'BY THE BOOK', cls: 'loyal', out: ['He goes without a word. You have the brake van. You do not have what he knew.', { merit: 3, cons: -4 }, { ready: 1, flag: 'pellDown' }] },
    ] },
  };

  /* ---------------------------------------------------------- the train map */
  function trainSvg(s) {
    const c = C(s);
    let g = '<svg viewBox="0 110 1600 340" class="tr-svg" role="img" aria-label="The train in cross-section">';
    g += '<defs><linearGradient id="trsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1418"/><stop offset="1" stop-color="#1a252b"/></linearGradient></defs>';
    g += '<rect width="1600" height="440" fill="url(#trsky)"/>';
    g += '<g class="tr-far"><path d="M0 330 L120 290 L260 330 L400 270 L560 330 L720 300 L900 330 L1060 280 L1240 330 L1400 290 L1600 330 V440 H0z" fill="#10191d"/></g>';
    g += '<line x1="0" y1="372" x2="1600" y2="372" stroke="#2c3b42" stroke-width="3"/>';
    g += '<g class="tr-ties">' + Array.from({ length: 40 }, (_, i) => `<rect x="${i * 44}" y="372" width="18" height="10" fill="#202c31"/>`).join('') + '</g>';
    CK.forEach((k, i) => {
      const x = 70 + i * 215, y = 190, w = 196, h = 170;
      const here = c.at === k, seen = c.seen[k];
      const open = !seen;
      const body = k === 'engine' ? '#2b3a42' : k === 'guard' ? '#2d3430' : k === 'envoy' ? '#37302c' : k === 'brake' ? '#33302a' : '#262d31';
      g += `<g class="tr-car${here ? ' here' : ''}${open ? ' hot' : ''}" data-pt="${k}" tabindex="0" role="button" aria-label="${CARS[k].name}">`;
      g += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${body}" stroke="${here ? '#ffbe5a' : '#44565e'}" stroke-width="${here ? 4 : 2}"/>`;
      if (k === 'engine') g += `<rect x="${x + 120}" y="${y - 40}" width="50" height="45" fill="#202b30"/><circle cx="${x + 145}" cy="${y - 52}" r="14" fill="#33414a"/>`;
      for (let wn = 0; wn < 3; wn++) g += `<rect x="${x + 16 + wn * 56}" y="${y + 22}" width="42" height="40" rx="3" fill="${seen ? '#1b2429' : '#d9a441'}" opacity="${seen ? 0.7 : 0.85}"/>`;
      g += `<rect x="${x + 70}" y="${y + 104}" width="56" height="60" rx="3" fill="#161e22"/>`;
      g += `<circle cx="${x + 34}" cy="${y + h + 8}" r="14" fill="#1a2226" stroke="#44565e" stroke-width="2"/><circle cx="${x + w - 34}" cy="${y + h + 8}" r="14" fill="#1a2226" stroke="#44565e" stroke-width="2"/>`;
      if (open) g += `<circle cx="${x + w - 24}" cy="${y + 24}" r="16" fill="rgba(6,12,15,.9)" stroke="#ffbe5a" stroke-width="3"/><text x="${x + w - 24}" y="${y + 31}" class="tr-q">?</text>`;
      g += `<text x="${x + w / 2}" y="${y + h + 52}" class="tr-name">${CARS[k].name.toUpperCase()}</text></g>`;
      if (i < CK.length - 1) g += `<rect x="${x + w}" y="${y + 120}" width="19" height="8" fill="#44565e"/>`;
    });
    return g + '</svg>';
  }
  G.afterRender.push((sc, id, block) => {
    if (id !== 'tr_map') return;
    const s = G.state();
    block.querySelectorAll('.choice').forEach((b) => {
      const m = CK.find((k) => b.textContent.includes('Walk to ' + CARS[k].name));
      if (m) b.dataset.ptgo = m;
      else if (/Look into it/.test(b.textContent)) b.dataset.ptgo = C(s).at;
    });
  });

  /* ---------------------------------------------------------- minigame: uncouple the wagons */
  G.MINIGAMES = G.MINIGAMES || {};
  G.MINIGAMES.uncouple = (block, opts, done) => {
    const S = G.state();
    const steps = ['Pull the brake valve', 'Knock out the coupling pin', 'Lift the safety chain'];
    let stage = 0, hits = 0, over = false, pos = 0, dir = 1;
    const speed = 1.35 + (opts.hard ? 0.5 : 0);
    const root = document.createElement('div');
    root.className = 'mini uncouple';
    root.innerHTML = `<div class="cr-head"><span class="cr-title">Uncoupling in the dark</span><span class="cr-clock"></span></div>
      <div class="uc-step"></div><div class="uc-bar"><i class="uc-zone"></i><b class="uc-mark"></b></div><button type="button" class="uc-go">NOW</button><div class="m3-log"></div>
      <div class="cr-help">Press NOW when the marker is in the lit zone. Three tasks, each faster than the last. A miss leaves the wagon half-coupled.</div>`;
    block.append(root);
    const $ = (q) => root.querySelector(q);
    const zoneW = 22;
    let zoneAt = 40;
    const setStage = () => {
      $('.uc-step').textContent = `${stage + 1} of 3 — ${steps[stage]}`;
      zoneAt = 15 + Math.random() * (100 - zoneW - 30);
      $('.uc-zone').style.cssText = `left:${zoneAt}%;width:${zoneW - stage * 3}%`;
      $('.cr-clock').textContent = '●'.repeat(hits) + '○'.repeat(3 - hits);
    };
    const finish = () => {
      over = true;
      clearInterval(timer);
      const ok = hits >= 2;
      root.classList.add(ok ? 'won' : 'lost');
      $('.m3-log').textContent = ok ? (hits === 3 ? 'The wagons let go cleanly and roll on, silent, into the dark.' : 'One pin sticks, and the wagon lurches. It gets away, with a bang and some screaming.') : 'The coupling holds. The train does not stop, and the wagons do not leave.';
      done(ok, { hits });
    };
    $('.uc-go').onclick = () => {
      if (over || G.state() !== S) return;
      const z = zoneW - stage * 3;
      if (pos >= zoneAt && pos <= zoneAt + z) hits++;
      stage++;
      if (stage >= 3) return finish();
      setStage();
    };
    const timer = setInterval(() => {
      if (!document.body.contains(root) || !root.closest('.block.current') || G.state() !== S) return clearInterval(timer);
      if (over || document.hidden) return;
      pos += dir * (speed + stage * 0.5);
      if (pos >= 100) ((pos = 100), (dir = -1));
      if (pos <= 0) ((pos = 0), (dir = 1));
      $('.uc-mark').style.left = pos + '%';
    }, 16);
    setStage();
  };

  /* ---------------------------------------------------------- scenes */
  const tick = (s) => {
    const c = C(s);
    c.hour++;
    if (c.hour >= c.end) c.phase = 'tunnel';
  };
  const fin = (res, k) => (st) => {
    const c = C(st);
    c.res = res[0];
    c.seen[k] = true;
    c.done_n++;
    apply(st, res[2]);
    tick(st);
    return res[1];
  };
  const side = (s) => C(s).side;
  G.addScenes({
    c14_start: {
      checkpoint: true,
      safe: true,
      title: 'Chapter Fourteen',
      enter: (s) => {
        s.chapter = 14;
        s.c14 = { stage: 0, startDay: s.day, phase: 'brief', hour: 6, end: 12, at: 'guard', seen: {}, flags: {}, clues: 0, ready: 0, saved: 0, lost: 0, done_n: 0, side: null, prep: null, res: '' };
      },
      text: [
        '@big CHAPTER FOURTEEN',
        '@sys ALL DIVISIONS · THE NORTHBOUND',
        'The road to City 17 is open. The last transport out of Nova Prospekt, a hundred and eighty names on a manifest, is going north on the morning train. The Sector wants an escort from City 9 who can read.',
        'It is the first time anyone has said, to your face, that you can read.',
      ],
      choices: [{ t: 'Report to Vigil.', go: 'c14_brief' }],
    },
    c14_brief: {
      title: 'The Nexus — Vigil’s office',
      text: (s) => [
        VIGIL,
        '@say Vigil|The train leaves D4 at six. Twelve Wardens, a driver, a brakeman, a Sector envoy and a hundred and eighty prisoners. You will be in command of nothing and responsible for everything. That is what an escort is.',
        '@say Vigil|It passes Tunnel 9 at noon. I cannot tell you what is in the tunnel. I can tell you that the Sector does not tell me either, and that when the Sector does not tell me, it is because it would like me to find out.',
        '@sys You have a little time before the train leaves. What do you bring?',
      ],
      choices: [
        { t: 'A medical kit from HELIX: bandages, biogel, a fever drug.', fx: (st) => ((C(st).prep = 'med'), (C(st).saved += 3), null), go: 'c14_board' },
        { t: 'Two extra Wardens from the precinct, loyal ones.', fx: (st) => ((C(st).prep = 'guard'), (C(st).ready += 2), null), go: 'c14_board' },
        { t: 'A portable radio with the Sector’s own frequency.', fx: (st) => ((C(st).prep = 'radio'), (C(st).clues += 1), null), go: 'c14_board' },
      ],
    },
    c14_board: {
      title: 'D4 — the platform at dawn',
      enter: (s) => G.unlock(s, 'northbound'),
      text: [
        '@img assets/img/env/e42-sector-train.webp|The Northbound at the D4 platform',
        'Rain on the platform and on the roof of the train. A queue of people in grey canvas is being counted into the wagons by Wardens in olive and amber. Nobody speaks. At 06:00 the whistle goes, and the platform slides away.',
      ],
      choices: [{ t: 'Walk the train.', fx: (st) => ((C(st).phase = 'journey'), (C(st).at = 'guard'), null), go: 'tr_map' }],
    },
    tr_map: {
      checkpoint: true,
      title: (s) => `The Northbound — ${clock(C(s).hour)}`,
      enter: (s) => (C(s).phase === 'tunnel' ? 'c14_tunnel' : undefined),
      text: (s) => {
        const c = C(s);
        return [
          '@html <div class="pt-wrap tr-wrap">' + trainSvg(s) + '</div>',
          `@sys ${clock(c.hour)} · You are in the ${CARS[c.at].name.toLowerCase()}. Tunnel 9 is at ${clock(c.end)}. You can reach ${c.end - c.hour} more car${c.end - c.hour === 1 ? '' : 's'} before it. Tap a car to walk to it.`,
          `@sys Clues: ${c.clues} · Readiness: ${c.ready}`,
        ];
      },
      choices: (s) => {
        const c = C(s);
        const list = [];
        if (!c.seen[c.at]) list.push({ t: `**Look into it:** ${CARS[c.at].name.toLowerCase()}.`, tag: 'HERE', tagCls: 'duty', go: 'tr_ins' });
        CK.filter((k) => k !== c.at).forEach((k) => list.push({ t: `Walk to ${CARS[k].name}${c.seen[k] ? ' (done)' : ` — ${CARS[k].who}`}.`, fx: (st) => ((C(st).at = k), null), go: 'tr_map' }));
        list.push({ t: 'Sit down and let the train carry you to the tunnel.', fx: (st) => ((C(st).hour = C(st).end), (C(st).phase = 'tunnel'), null), go: 'tr_map' });
        return list;
      },
    },
    tr_ins: {
      title: (s) => `${CARS[C(s).at].name}`,
      text: (s) => INS[C(s).at].text,
      choices: (s) => {
        const c = C(s), k = c.at;
        return INS[k].opts
          .filter((o) => !o.needs || c.flags[o.needs])
          .map((o) =>
            o.mini
              ? { t: o.t, tag: o.tag, tagCls: o.cls, go: 'tr_triage' }
              : o.check
              ? { t: o.t, tag: o.tag, tagCls: o.cls, check: { skill: o.check[0], diff: o.check[1], pass: 'tr_res', fail: 'tr_res', okFx: fin(o.ok, k), failFx: fin(o.bad, k) } }
              : { t: o.t, tag: o.tag, tagCls: o.cls, fx: fin(o.out, k), go: 'tr_res' }
          );
      },
    },
    tr_res: { text: (s) => [C(s).res], choices: [{ t: 'Back to the train.', go: 'tr_map' }] },
    tr_triage: {
      title: 'Wagon 2 — the fever',
      text: ['@sys The wagon is hot and close and everyone in it is watching your hands.'],
      mini: { type: 'triage', opts: { count: 5, seconds: 32, allow: 1, title: 'The fever wagon' }, pass: 'tr_triage_ok', fail: 'tr_triage_bad', skill: 'medical', diff: 0 },
    },
    tr_triage_ok: { text: ['By the time the train has done another twenty miles, nobody is on the floor. A woman holds your sleeve for a moment, and lets go.'], choices: [{ t: 'Back to the train.', fx: (st) => ((C(st).res = 'The fever is broken. Some of them will remember who stayed.'), (C(st).seen.w2 = true), (C(st).done_n++), apply(st, { saved: 12, ready: 0, flag: 'medic' }), tick(st), { cons: 3, xp: { medical: 1 } }), go: 'tr_res' }] },
    tr_triage_bad: { text: ['You do what you can. It is not enough, and the wagon knows it. Two of them are covered with their own coats.'], choices: [{ t: 'Back to the train.', fx: (st) => ((C(st).res = 'You lose two of them. The wagon does not look at you after that.'), (C(st).seen.w2 = true), (C(st).done_n++), apply(st, { lost: 2, saved: 6 }), tick(st), { cons: -1 }), go: 'tr_res' }] },

    c14_tunnel: {
      checkpoint: true,
      title: 'Tunnel 9',
      text: (s) => {
        const c = C(s);
        return [
          '@sys 12:00. THE TUNNEL.',
          'The train slows. In the grey light, a green lamp on a post at the mouth of Tunnel 9 swings once, twice, and goes dark. The driver’s whistle falters.',
          c.flags.tunnel ? 'Halvorsen was right: it was never meant to be green.' : 'Somebody is on the track, and has been for some time.',
          c.flags.brakeman ? 'In the brake van, a lantern goes on. Pell has told the others you are not going to shoot.' : null,
          'The Wardens have their weapons up. The wagons have gone very quiet. Somebody in the dark outside starts to sing.',
        ];
      },
      choices: (s) => {
        const c = C(s);
        const l = [{ t: 'Defend the train. Hold the line.', tag: 'BY THE BOOK', tagCls: 'loyal', go: 'c14_union' }];
        l.push({ t: 'Open the wagons. Let the Lambda have what they came for.', tag: 'RESISTANCE', tagCls: 'mercy', go: 'c14_lambda' });
        l.push({ t: 'Pull the emergency brake and hold the train in the dark.', tag: 'RISK', tagCls: 'risk', go: 'c14_neutral' });
        return l;
      },
    },
    c14_union: {
      title: 'Tunnel 9 — the line',
      text: (s) => {
        const c = C(s);
        const good = c.ready >= 4 || (c.flags.wardens && c.ready >= 3);
        return [
          '@img assets/img/env/e50-cutting.webp|Tunnel 9',
          good ? 'You put the Wardens in two lines at the doors and a gun in every window. The ambush comes in from the cutting, in the old way: voices, a flare, a shot. It breaks on the lines like water on stone. They go back into the dark carrying their wounded and their dead.' : 'Twelve Wardens and not enough of them look at you. When the ambush comes, half of them fire into the cutting and half do not fire at all. It takes twenty minutes and it is not clean.',
          good ? 'The train goes on. In the wagons, a hundred and sixty people are still alive, and you have not asked yourself what you are protecting.' : 'The train goes on. Some of the wagons are quiet in the wrong way.',
        ];
      },
      choices: [{ t: 'Ride on.', fx: (st) => { const g = C(st).ready >= 4 || (C(st).flags.wardens && C(st).ready >= 3); C(st).side = 'union'; C(st).outcome = g ? 'held' : 'bloody'; apply(st, { saved: g ? 0 : 0, lost: g ? 4 : 14 }); return { merit: g ? 8 : 3, lp: 4, cons: g ? -3 : -6, susp: -4 }; }, go: 'c14_after' }],
    },
    c14_lambda: {
      title: 'Tunnel 9 — the couplings',
      text: (s) => [
        'You tell Voss to take the guard into the front car and not to look back. He looks at you for a long time. Then he goes. Two of his men do not follow, and one of them smiles.',
        C(s).flags.brakeman ? 'Pell is waiting at the couplings with a lantern and a wrench. He does not say anything. He hands you the wrench.' : 'You walk back along the roof of the train in the dark, with the Lambda’s torches closing in on the cutting, and no one to tell you which pin.',
      ],
      mini: { type: 'uncouple', opts: (s) => ({ hard: !C(s).flags.brakeman }), pass: 'c14_lambda_ok', fail: 'c14_lambda_bad', skill: 'fitness', diff: 0 },
    },
    c14_lambda_ok: {
      text: ['The wagons let go and roll on, quiet, into the dark. At the cutting, a line of torches comes down to meet them, and people in grey canvas are walking up the slope into the arms of people in padded vests. Someone is saying a number. Someone is saying a name that is not a number.', 'The locomotive does not slow. Voss, in the front car, does not open his eyes.'],
      choices: [{ t: 'Ride on.', fx: (st) => ((C(st).side = 'lambda'), (C(st).outcome = 'freed'), apply(st, { saved: 160 }), { cons: 8, res: 8, susp: 12, merit: -8, lp: -6 }), go: 'c14_after' }],
    },
    c14_lambda_bad: {
      text: ['You are too slow, or too clumsy, or too late. The couplings hold, and a Warden at the door sees what you are doing. The shooting starts before you can say anything. The Lambda go back into the cutting with their wounded, and the wagons roll on.'],
      choices: [{ t: 'Ride on.', fx: (st) => ((C(st).side = 'lambda'), (C(st).outcome = 'caught'), apply(st, { lost: 8 }), { cons: 2, res: 2, susp: 22, merit: -12, lp: -10 }), go: 'c14_after' }],
    },
    c14_neutral: {
      title: 'Tunnel 9 — the brake',
      text: (s) => {
        const c = C(s);
        const can = c.flags.engineer || c.flags.medic;
        return [
          can ? 'Halvorsen has the brake lever in both hands before you reach the cab. *“Thirty years,”* he says. *“I have only done this once.”* The train shrieks, and slides, and stops with the locomotive just inside the mouth of the tunnel and the last wagon still in the light.' : 'You reach the brake and pull. Nothing happens for a long second, and then the train shudders and lurches and stops, hard, with a noise from the wagons that you will hear for years.',
          'It is dark. It is very quiet. At the mouth of the tunnel, on both sides, lamps are coming on: on one side, amber, and on the other, white. Nobody is shooting. Nobody knows who is supposed to.',
          'You stand on the footplate with your hands in the air, and the two sides both begin, slowly, to talk.',
        ];
      },
      choices: (s) => [{ t: 'Open the vents, and the doors, and wait.', fx: (st) => { const can = C(st).flags.engineer || C(st).flags.medic; C(st).side = 'neutral'; C(st).outcome = can ? 'parley' : 'stalled'; apply(st, { saved: can ? 80 : 30, lost: can ? 0 : 6 }); return { cons: 6, susp: 10, merit: can ? 1 : -6, lp: -2, res: 2 }; }, go: 'c14_after' }],
    },
    c14_after: {
      checkpoint: true,
      title: 'Tunnel 9 — afterwards',
      text: (s) => {
        const c = C(s);
        const o = {
          held: 'The Northbound goes on to City 17, and arrives on time. Maren signs the manifest without looking at you. The clerk, if there is one, is taken off in the station by two men who do not give their names.',
          bloody: 'The train arrives at City 17 with fewer people than it left with, and fewer Wardens than that. Maren signs the manifest.',
          freed: 'The train arrives at City 17 with twelve Wardens, a driver, a brakeman and an envoy. It is missing three wagons, and nobody at the station says anything about it. They look at you, and at the envoy, and at the empty rails.',
          caught: 'The train arrives at City 17 with all of its wagons and a Warden in the front car who saw what you did. Maren says nothing at all, which is worse.',
          parley: 'The train stands in the tunnel mouth until dawn. At first light, the Lambda go, quietly, taking some of the people with them who chose to go. The rest of the people choose the train. The driver starts the engine and does not speak for fifty miles.',
          stalled: 'The train stands in the tunnel mouth for four hours while two sides argue about whose it is. By the time anyone fires a shot, the shot is a relief.',
        }[c.outcome];
        return [o, c.flags.clerk ? (c.side === 'union' ? 'The clerk looks at you across the platform at City 17 once, over a Warden’s shoulder, before he is taken away.' : 'The clerk is gone before the light is up. Somebody had him out of the wagon in the dark. He did not say goodbye.') : null, c.flags.deal ? 'Maren catches your eye on the platform and shrugs, politely. The offer was only good until the tunnel.' : null];
      },
      choices: [{ t: 'Get off the train.', go: 'c14_end' }],
    },
    c14_end: {
      checkpoint: true,
      title: 'End of Chapter Fourteen',
      enter: (s) => {
        const c = C(s);
        c.done = true;
        if (c.endDay === undefined) c.endDay = s.day;
      },
      text: (s) => [
        `@doc ${G.desig(s)}\nDIVISION: ${s.div}\nRANK: ${G.RANK_NAMES[s.rank].toUpperCase()}\nTHE TUNNEL: ${C(s).outcome.toUpperCase()}\nSAVED: ${C(s).saved} · LOST: ${C(s).lost}`,
        '@sys CHAPTER FOURTEEN COMPLETE. City 17 is a day closer, and so is whatever is waiting in it.',
      ],
      choices: [{ t: 'Return to duty.', go: 'u_duty_end' }],
    },
  });

  G.addCodex({
    northbound: {
      title: 'The Northbound',
      body: '<p>The Union’s transport trains run to a schedule the Union keeps. A prisoner train is escorted by the garrison that loads it, with a driver, a brakeman and a Sector envoy aboard. An escort is responsible for everything on it and in command of nothing. Tunnel 9 is a mile of unlit track with a signal at each end, and a cutting on the north side where a train can be stopped from the hillside.</p>',
    },
  });
  G.CODEX_GROUPS.find((g) => g.title === 'City 9').ids.push('northbound');
})();
