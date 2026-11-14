/* THE WORLD BETWEEN THE DAYS — district stability, mornings, evenings, and echoes.
   - District 5 has five blocks, each with hidden ORDER and RESENTMENT. Hard choices raise both;
     mercy lowers both. Resentment boils over into revenge; low order lets the canal cells in.
     The Dossier shows a colour map, never numbers.
   - Mornings: a line of the city on the way to muster, sometimes an encounter.
   - Evenings: a rotating choice of places, sometimes a knock at the door first.
   - Echoes: people from your case files come back. */
(function () {
  const pick = G.pick;
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  /* ========================================================== BLOCKS */
  const BLOCKS = {
    s9: { name: 'Stack 9', short: 'S9' },
    s14: { name: 'Stack 14', short: 'S14' },
    s22: { name: 'Stack 22', short: 'S22' },
    bazaar: { name: 'Bazaar Row', short: 'BAZ' },
    plaza: { name: 'Plaza 5', short: 'P5' },
  };
  G.BLOCKS = BLOCKS;
  const ensure = (s) => {
    if (!s.dist) {
      s.dist = {};
      Object.keys(BLOCKS).forEach((k) => (s.dist[k] = { o: 55, r: 30 }));
    }
    s.world = s.world || { ev: null, seen: {}, mDay: -1, eDay: -1, line: -1 };
    return s;
  };
  G.worldEnsure = ensure;
  const oldFresh = G.fresh;
  G.fresh = () => ensure(oldFresh());

  const colour = (b) => (b.o < 35 || b.r >= 75 ? 'red' : b.o < 50 || b.r >= 55 ? 'amber' : 'green');
  G.blockColour = (s, k) => colour(ensure(s).dist[k]);

  const DUTY_BLOCK = { ration: 'plaza', broadcast: 'plaza', market: 'bazaar', inspection: 's22', ulead: 'bazaar', owsweep: 'bazaar', raid: 's9' };
  const stackBlock = (addr) => {
    const n = +((addr || '').match(/Stack (\d+)/) || [])[1];
    if (!n) return null;
    return n <= 9 ? 's9' : n <= 14 ? 's14' : 's22';
  };
  G.blockFor = (s, id) => {
    id = id || s.scene;
    if (/^raid_/.test(id) && s.raid) return stackBlock(s.raid.addr);
    if (/^(d_ration|d_cast|c4_)/.test(id)) return 'plaza';
    if (/^(d_market|c3_sweep|ev_bazaar)/.test(id)) return 'bazaar';
    if (/^d_insp/.test(id)) return 's22';
    const rv = id.match(/^rv_([a-z]+)_/);
    if (rv) return DUTY_BLOCK[rv[1]] || null;
    if (/^(ss_|inf_recruit)/.test(id)) return DUTY_BLOCK[s.duty && s.duty.current] || 'bazaar';
    if (/^w_/.test(id) && s.world && s.world.ev) return s.world.ev.block;
    return null;
  };
  G.distFx = (s, k, o, r) => {
    ensure(s);
    if (!k || !s.dist[k]) return;
    s.dist[k].o = G.clamp(s.dist[k].o + o, 0, 100);
    s.dist[k].r = G.clamp(s.dist[k].r + r, 0, 100);
  };

  const HARSH = /AMPUTATE|BRUTAL|BURN|PLANT/;
  G.onChoose.push((s, c, id) => {
    if (s.phase !== 'union' || !c.tagCls) return;
    const k = G.blockFor(s, id);
    if (!k) return;
    if (HARSH.test(c.tag || '')) G.distFx(s, k, 4, 7);
    else if (c.tagCls === 'loyal') G.distFx(s, k, 2, 3);
    else if (c.tagCls === 'mercy') G.distFx(s, k, -2, -3);
  });

  /* nights: tempers cool a little, order drifts back, and pressure becomes events */
  G.extend('u_night', {
    before: (s) => {
      ensure(s);
      if (s.phase !== 'union') return;
      let ev = null;
      Object.keys(BLOCKS).forEach((k) => {
        const b = s.dist[k];
        b.r = Math.max(15, b.r - 1);
        b.o += b.o < 50 ? 1 : b.o > 60 ? -1 : 0;
        if (!ev && b.r >= 70 && Math.random() < 0.35) ev = { kind: 'rev', block: k };
        else if (!ev && b.o <= 30 && Math.random() < 0.35) ev = { kind: 'res', block: k };
      });
      if (ev && !s.world.ev) s.world.ev = ev;
    },
  });

  /* ========================================================== MORNINGS */
  /* one line of the city on the way to muster; conditions keep it true to the world state */
  const LINES = [
    () => 'Rain overnight. The Stacks smell of wet concrete and paraffin, and the gutters of Bazaar Row run grey.',
    () => 'Frost on the inside of the barracks windows. The radiators knock all the way to muster and stay cold.',
    () => 'The broadcast screens on Plaza 5 show the dam this morning: slow, beautiful footage of water, with no sound.',
    () => 'A new poster on the precinct wall: a smiling family under the Spire. Someone has drawn a fourth figure in pencil, very small, behind them.',
    () => 'A scanner drone follows you for half a block on the way in, photographs your shoulder designation, and loses interest.',
    () => 'The ration queue at Plaza 5 has already formed at 05:50. It goes around the plaza once, which counts as short.',
    () => 'The tram rails in the muster hall have been polished again. Nobody knows who does it.',
    () => 'The Works siren goes at 05:40 across the river. Ten thousand people get up at the same time, quietly.',
    (s) => (s.c3 && !s.c3.done ? 'Overwatch soldiers stand at the corners of the precinct yard in the grey light, not moving. Their breath does not show.' : null),
    (s) => (s.c3 && s.c3.done ? 'A Shrike crosses the river low on its way back to the Nexus roof. The windows of the Stacks hum as it goes.' : null),
    (s) => (s.c3 ? 'The relay from City 17 is on in the dispatch room: priority codes, then static, then priority codes. The duty clerk turns it down when you pass.' : null),
    (s) => (s.chapter >= 4 ? 'The ration hatches at Plaza 5 carry a new printed notice: PRODUCTIVITY ADJUSTMENT IN EFFECT. Somebody has scratched the word PRODUCTIVITY out.' : null),
    (s) => (s.rel.mira !== undefined && !s.flags.mira_relocated ? 'You pass under the window of 14-C. The plastic over the cracked pane has been replaced with newspaper.' : null),
    (s) => (s.flags.mira_relocated ? 'You still look up at 14-C on the way in. A stranger’s laundry hangs in the window now.' : null),
    (s) => (s.squad && s.squad.formed ? `${pick(G.squadActive(s)).name} is already at your locker, waiting, mask on.` : null),
    (s) => (Object.values(s.files || {}).some((f) => f.amputated) ? 'In the ration queue, a woman looks at your armband and then very carefully at the ground. You think you know which file she belongs to.' : null),
    (s) => {
      const red = Object.keys(BLOCKS).filter((k) => colour(ensure(s).dist[k]) === 'red');
      return red.length ? `${BLOCKS[red[0]].name} is marked red on the precinct board this morning. Units going there draw an extra magazine.` : null;
    },
    (s) => {
      const g = Object.keys(BLOCKS).filter((k) => colour(ensure(s).dist[k]) === 'green');
      return g.length >= 4 ? 'D5 is quiet on the board. Granite calls that dangerous. Quiet means nobody is telling you anything.' : null;
    },
    (s) => (s.inf && s.inf.list.some((x) => x.status === 'active') ? 'A ration wrapper is tucked into the grille of your locker. Nothing written on it. Your asset wants a meeting.' : null),
    (s) => (s.res >= 30 ? 'A chalk lambda on the lamp post outside the barracks, at knee height, is fresh this morning. It points toward the canal.' : null),
  ];
  const morningLine = (s) => {
    ensure(s);
    const pool = LINES.map((f, i) => [i, f(s)]).filter((x) => x[1] && x[0] !== s.world.line);
    const p = pick(pool);
    s.world.line = p[0];
    return p[1];
  };

  /* morning encounters: short choices on the way in */
  const MORNINGS = [
    {
      id: 'ball',
      text: ['A child’s rag ball rolls across the pavement and stops against your boot. The child stands ten metres away, frozen. Her mother is already running.'],
      choices: [
        { t: 'Kick it back to her.', tag: 'MERCY', tagCls: 'mercy', fx: { cons: 2 } },
        { t: 'Leave it. Walk on.', fx: {} },
        { t: 'Pick it up and hand it to the mother. Ask her name.', fx: { lp: 1, cons: -1 } },
      ],
    },
    {
      id: 'cwu',
      text: ['A CWU worker in an ochre jacket stops you outside the RDT with a slate. A ration correction needs a unit’s signature: twelve packets “lost in transit”. She does not meet your lenses.'],
      choices: [
        { t: 'Sign it. Not your problem.', fx: { tokens: 3, susp: 2 } },
        { t: 'Refuse and report the discrepancy.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 2, cons: -2 } },
        { t: 'Ask where the twelve packets went.', check: { skill: 'authority', diff: 0, okFx: { merit: 1, cons: 1 }, failFx: {} } },
      ],
    },
    {
      id: 'kneel',
      text: ['A man in his sixties steps into your path and goes down on his knees on the wet pavement. His son was relocated in spring. Does the Civil Protection know where the trains go? Could you ask? He has written the CID on a scrap of paper.'],
      choices: [
        { t: 'Take the paper. Say you will ask.', tag: 'MERCY', tagCls: 'mercy', fx: { cons: 3, susp: 1 } },
        { t: '“Get up. You are blocking the pavement.”', fx: { cons: -2 } },
        { t: 'Log him for a Level 1 disturbance.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 1, cons: -5 } },
      ],
    },
    {
      id: 'ow',
      if: (s) => !!s.c3,
      text: ['An Overwatch soldier steps out of a doorway and blocks the pavement in front of you. It holds out a gauntlet: identification. It does not matter that you are in uniform.'],
      choices: [
        { t: 'Present your designation without a word.', fx: { lp: 1 } },
        { t: '“Civil Protection. Step aside.”', check: { skill: 'authority', diff: 15, okFx: { merit: 1 }, failFx: { hp: -5, susp: 3 } } },
      ],
    },
    {
      id: 'glitch',
      text: ['The broadcast screen on the corner of Bazaar Row stutters. For one second, between two frames of the Administrator, there is a white lambda on a black field. Then the Administrator again. Everyone on the street saw it. Everyone looks at you.'],
      choices: [
        { t: 'Call it in. Code LAMBDA, broadcast screen, Bazaar Row.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 2 } },
        { t: 'Keep walking as if you saw nothing.', tag: 'MERCY', tagCls: 'mercy', fx: { res: 2 } },
      ],
    },
    {
      id: 'cover',
      text: (s) => [`@say ${G.superiorOf ? G.superiorOf(s).name : 'Your SqL'}|A unit on the night squad went down with fever. I need someone to cover the end of his shift before muster. You look awake.`],
      choices: [
        { t: 'Take the extra hours.', fx: { merit: 3, hp: -8 } },
        { t: '“I’m on the board today. Find someone else.”', fx: {} },
      ],
    },
    {
      id: 'warned',
      if: (s) => Object.values(s.files || {}).some((f) => !f.amputated && /WARNING|RELEASED/.test(f.lastVerdict || '')),
      text: (s) => {
        const f = Object.values(s.files).find((x) => !x.amputated && /WARNING|RELEASED/.test(x.lastVerdict || ''));
        s.mem.echoCid = f.cid;
        return [`A citizen passes close enough to brush your sleeve. You know the face: CID ${f.cid}, ${f.desc}, the one you let go with a warning. A folded ration wrapper is suddenly in your glove. Inside, in pencil: *the man with the battery stall is selling to the canals.*`];
      },
      choices: [
        { t: 'Pass it to Dispatch as an anonymous tip.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 3 } },
        { t: 'Burn it. A warning was not a contract.', tag: 'MERCY', tagCls: 'mercy', fx: { cons: 2, res: 2 } },
      ],
    },
    {
      id: 'neighbour',
      if: (s) => Object.values(s.files || {}).some((f) => f.amputated),
      text: (s) => {
        const f = Object.values(s.files).find((x) => x.amputated);
        return [`An old woman from Stack 14 stops you on the stairs. She wants to know if her neighbour is coming back — CID ${f.cid}, ${f.desc}. She says the flat is cold and nobody has come for the cat.`];
      },
      choices: [
        { t: '“No.”', fx: { cons: -2 } },
        { t: '“I don’t know.” Let her keep the hope.', tag: 'MERCY', tagCls: 'mercy', fx: { cons: 1 } },
        { t: 'Take the cat to the CWU canteen yourself.', tag: 'MERCY', tagCls: 'mercy', fx: { cons: 4, merit: -1 } },
      ],
    },
  ];

  /* district events: what pressure turns into */
  const EV_TEXT = {
    rev: {
      s9: 'Overnight someone dropped a breeze block from the roof of Stack 9 onto a parked PT-V. It went through the cupola shield. There is a crowd on the balconies, watching the units look up.',
      s14: 'The stairwell lights in Stack 14 have been smashed on every floor. Two units on the night patrol were pelted with something from the dark. Nobody in Stack 14 saw anything.',
      s22: 'Stack 22’s census registers were stolen from the block warden’s office and burned in the courtyard. The ash spells nothing. It does not need to.',
      bazaar: 'A unit on Bazaar Row was knocked down from behind with a length of pipe and robbed of his stun baton. He lived. The stall holders are very busy this morning.',
      plaza: 'Somebody poured paraffin into hatch 2 of the Plaza 5 RDT and lit it. The machine is dead. The queue is three times longer at the other hatches, and it is not quiet.',
    },
    res: {
      s9: 'Stack 9 has a lambda painted three storeys tall on its end wall overnight, in blue ration-tin paint, neatly. Somebody had a ladder and an hour.',
      s14: 'Leaflets in every letterbox of Stack 14: a list of the names on the last relocation train, and the words *where are they*.',
      s22: 'A pirate transmission cut into the Stack 22 broadcast speakers at 05:00 for ninety seconds: a woman reading the ration figures from before the war.',
      bazaar: 'Every stall on Bazaar Row has the same chalk mark on its shutter this morning: a small circle with a line through it. The stall holders say it was there yesterday.',
      plaza: 'The Administrator’s face on the Plaza 5 screen has been sprayed over with a single black stripe across the eyes, like a mask.',
    },
  };

  G.addScenes({
    w_event: {
      title: (s) => `${BLOCKS[(s.world.evNow || s.world.ev).block].name} — this morning`,
      enter: (s) => {
        s.world.evNow = s.world.ev;
        s.world.ev = null;
        s.world.mDay = s.day;
      },
      text: (s) => {
        const e = s.world.evNow;
        return [
          e.block === 'plaza' ? '@img assets/img/env/e10-ration.webp|Plaza 5' : e.block === 'bazaar' ? '@img assets/img/env/e03-bazaar.webp|Bazaar Row' : null,
          EV_TEXT[e.kind][e.block],
          e.kind === 'rev' ? '@sys Resentment in this block has boiled over.' : '@sys Order in this block has slipped. The canal cells are filling the gap.',
        ];
      },
      choices: (s) => {
        const e = s.world.evNow;
        const k = e.block;
        const back = 'u_board';
        if (e.kind === 'rev')
          return [
            { t: 'Find whoever did it. Door by door, today.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: (st) => (G.distFx(st, k, 6, 6), { merit: 3, cons: -3 }), go: back },
            { t: 'Request 10-78 AIR. Let Overwatch make the point.', tag: 'BRUTAL', tagCls: 'risk', fx: (st) => (G.distFx(st, k, 12, 12), G.unlock(st, 'airwatch'), { lp: 3, cons: -10 }), go: back },
            { t: 'Log it, clear it up, and leave the block alone for a few days.', tag: 'MERCY', tagCls: 'mercy', fx: (st) => (G.distFx(st, k, -4, -12), { merit: -1 }), go: back },
          ];
        return [
          { t: 'Scrub it out and search the block.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: (st) => (G.distFx(st, k, 8, 5), { merit: 2 }), go: back },
          { t: 'Photograph it for JURY and leave it up as bait.', fx: (st) => (G.distFx(st, k, 2, 0), { merit: 3, xp: { perception: 1 } }), go: back },
          { t: 'Walk past it. Some things are better unnoticed.', tag: 'MERCY', tagCls: 'mercy', fx: (st) => (G.distFx(st, k, -3, -2), { res: st.res >= 20 ? 4 : 0, susp: 1 }), go: back },
        ];
      },
    },

    w_morning: {
      title: 'On the way to muster',
      enter: (s) => {
        s.world.mDay = s.day;
      },
      text: (s) => {
        const m = MORNINGS.find((x) => x.id === s.world.mNow);
        return [].concat(typeof m.text === 'function' ? m.text(s) : m.text);
      },
      choices: (s) => {
        const m = MORNINGS.find((x) => x.id === s.world.mNow);
        return m.choices.map((c) => {
          const o = { t: c.t, tag: c.tag, tagCls: c.tagCls };
          if (c.check) o.check = { skill: c.check.skill, diff: c.check.diff, pass: 'u_board', fail: 'u_board', okFx: c.check.okFx, failFx: c.check.failFx };
          else (o.fx = c.fx), (o.go = 'u_board');
          return o;
        });
      },
    },
  });

  /* morning order: hearings and story beats run first (they are registered earlier); then the city */
  G.extend('u_board', {
    before: (s) => {
      ensure(s);
      if (s.phase !== 'union' || s.world.mDay === s.day || s.day < 2) return;
      if (s.world.ev) return 'w_event';
      if (Math.random() < 0.3) {
        const pool = MORNINGS.filter((m) => (!m.if || m.if(s)) && m.id !== s.world.mLast);
        const m = pick(pool);
        s.world.mNow = m.id;
        s.world.mLast = m.id;
        return 'w_morning';
      }
      s.world.mDay = s.day;
    },
    after: (s) => {
      if (s.phase === 'union' && s.day >= 2) G.unlock(s, 'district5');
      if (s.phase === 'union' && s.world.lineDay !== s.day) {
        s.world.lineDay = s.day;
        s.world.lineNow = morningLine(s);
      }
    },
    text: (lines, s) => {
      if (s.world && s.world.lineNow) lines.splice(Math.min(1, lines.length), 0, s.world.lineNow);
      return lines;
    },
  });

  /* ========================================================== EVENINGS */
  const EVE_POOL = [
    { id: 'ev_cards', t: 'Cards in the precinct mess. Tokens on the table.' },
    { id: 'ev_roof', t: 'Go up on the precinct roof for an hour.' },
    { id: 'ev_canal', t: 'Walk the canal towpath out of uniform.' },
    { id: 'ev_letter', t: 'Write a letter you may never send.' },
    { id: 'ev_cast', t: 'Watch the night broadcast with the others.' },
    { id: 'ev_halloran', t: 'Knock on old Halloran’s door in Stack 14.', if: (s) => s.rel.halloran !== undefined && !s.flags.halloran_relocated },
    { id: 'ev_echo', t: 'Look in on someone from your case files.', if: (s) => Object.values(s.files || {}).length >= 2 },
  ];
  /* two per evening, the same pair all evening, a different pair tomorrow */
  const evePick = (s) => {
    ensure(s);
    if (s.world.eveDay !== s.day) {
      s.world.eveDay = s.day;
      const pool = EVE_POOL.filter((e) => !e.if || e.if(s));
      s.world.eve = G.shuffle(pool.map((e) => e.id)).slice(0, 2);
    }
    return s.world.eve.map((id) => EVE_POOL.find((e) => e.id === id)).filter(Boolean);
  };

  const KNOCKS = [
    { id: 'neighbour', text: ['A knock at your door in the barracks. It is the night clerk: a citizen is at the gate asking for “the unit who helped on Bazaar Row”. She will not give her name. She is holding a jar of something.'], choices: [{ t: 'Go down and take the jar.', fx: { cons: 2, susp: 1, hp: 3 } }, { t: 'Send her away.', fx: {} }] },
    { id: 'owcheck', if: (s) => s.c3 && !s.c3.done, text: ['An Overwatch soldier walks the barracks corridor opening every locker with a single key. It opens yours, looks at the inside of the door for a long time, and closes it again.'], choices: [{ t: 'Stand at attention until it leaves.', fx: { lp: 1 } }] },
    { id: 'power', text: ['The power goes out across the whole precinct at 21:10. For eleven seconds the only light is the cyan of your own lenses on the locker in front of you. Then the generator. Somebody down the corridor laughs, much too loudly.'], choices: [{ t: 'Go on.', fx: {} }] },
    { id: 'note', if: (s) => s.res >= 20, text: ['Somebody slides a folded ration wrapper under your door. Inside, in pencil, a time and a place, and a small lambda. You do not know whether it is an invitation or a test.'], choices: [{ t: 'Burn it in the stove.', fx: { susp: -1 } }, { t: 'Keep it.', tag: 'RISK', tagCls: 'risk', fx: { res: 3, susp: 2 } }, { t: 'Hand it to the duty officer.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 3, res: -5 } }] },
    { id: 'seller', text: ['A CWU worker you half recognise is selling real coffee out of a canvas bag in the barracks stairwell, two tokens a cup. Three units are already in the queue, masks off.'], choices: [{ t: 'Buy a cup. 2 tokens.', lock: (s) => (s.tokens < 2 ? 'Not enough tokens' : null), fx: { tokens: -2, hp: 4 } }, { t: 'Break it up. Confiscate the bag.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 2, tokens: 3 } }, { t: 'Walk past.', fx: {} }] },
    { id: 'squadknock', if: (s) => s.squad && s.squad.formed && G.squadActive(s).length, text: (s) => [`${pick(G.squadActive(s)).name} knocks at your door with a bottle of something clear and illegal. “Five minutes,” the bottle says.`], choices: [{ t: 'Five minutes.', fx: (s) => (G.squadActive(s).forEach((m) => (m.loyal = Math.min(100, m.loyal + 3))), { hp: -2, cons: 1 }) }, { t: '“Not tonight.”', fx: {} }] },
  ];

  G.extend('u_evening', {
    before: (s) => {
      ensure(s);
      if (s.phase !== 'union' || s.world.eDay === s.day || s.day < 2) return;
      s.world.eDay = s.day;
      if (Math.random() < 0.25) {
        const pool = KNOCKS.filter((k) => !k.if || k.if(s));
        s.world.kNow = pick(pool).id;
        return 'w_knock';
      }
    },
    choices: (list, s) => {
      const extra = evePick(s).map((e) => ({ t: e.t, tag: 'TONIGHT', tagCls: 'duty', go: e.id }));
      list.splice(Math.max(0, list.length - 1), 0, ...extra);
      return list;
    },
  });

  const knock = (s) => KNOCKS.find((k) => k.id === s.world.kNow);
  G.addScenes({
    w_knock: {
      title: (s) => `Evening — Day ${s.day}`,
      text: (s) => [].concat(typeof knock(s).text === 'function' ? knock(s).text(s) : knock(s).text),
      choices: (s) => knock(s).choices.map((c) => Object.assign({}, c, { go: 'u_evening' })),
    },

    ev_cards: {
      title: 'The precinct mess — cards',
      text: (s) => [
        'Four units, a deck with the queens missing, and a pile of ration tokens in the middle of the table. The game is called *Verdict*: you bet on whether the next card is higher or lower, and the loser has to tell the table one true thing.',
        pick([
          'The talk is about City 17. Somebody’s cousin is on the transfer list. Somebody else says the trains from there have stopped running both ways.',
          'The talk is about JURY. Nobody says anything specific, which is how you know it is about JURY.',
          'The talk is about the Shrike pilots. A unit from GRID swears he saw one out of the cockpit once, and it had no legs. Nobody believes him. Everybody listens.',
          'The talk is about a 05 who got amputated last spring for selling his stun baton. Everybody at the table knew him. Nobody at the table liked him. Everybody stops talking for a moment anyway.',
        ]),
      ],
      choices: (s) => [
        { t: 'Play carefully. Read the table.', lock: (st) => (st.tokens < 3 ? 'Requires 3 tokens' : null), check: { skill: 'perception', diff: 5, pass: 'ev_cards_win', fail: 'ev_cards_lose' } },
        { t: 'Bluff. Big.', lock: (st) => (st.tokens < 5 ? 'Requires 5 tokens' : null), check: { skill: 'deception', diff: 10, pass: 'ev_cards_big', fail: 'ev_cards_bust' } },
        { t: 'Just watch.', go: 'u_night' },
      ],
    },
    ev_cards_win: { text: ['You win a little and lose a little and come out ahead. Nobody has to tell you anything true. That is the real prize.'], choices: [{ t: 'Bed.', fx: { tokens: 3, xp: { perception: 1 } }, go: 'u_night' }] },
    ev_cards_lose: { text: ['You lose, and have to tell the table one true thing. You tell them you were afraid at your first stop. They laugh, kindly, because everyone was.'], choices: [{ t: 'Bed.', fx: { tokens: -3, cons: 1 }, go: 'u_night' }] },
    ev_cards_big: { text: ['You push everything in on a five. The 03 across from you folds with a king in his hand and swears about it for ten minutes.'], choices: [{ t: 'Bed.', fx: { tokens: 8, xp: { deception: 1 } }, go: 'u_night' }] },
    ev_cards_bust: { text: ['You push everything in on a five. It is a five. The table goes very quiet and then explodes. You have to tell them two true things.'], choices: [{ t: 'Bed.', fx: { tokens: -5 }, go: 'u_night' }] },

    ev_roof: {
      title: 'The precinct roof',
      text: (s) => [
        '@img assets/img/env/e19-roof.webp|The roof',
        'The precinct roof is flat tar and old ventilation stacks. From here you can see the whole of District 5: the Stacks in rows, the plaza, the canal catching the light, and across the river the Spire, humming.',
        pick([
          'You count the lit windows in Stack 14. There are fewer than last month.',
          'A Shrike drifts along the river with its searchlight down, slow as a fish.',
          'Somewhere below, a citizen is singing in a stairwell, badly, for nobody.',
          s.squad && s.squad.formed ? `${pick(G.squadActive(s)).name} comes up after a while and sits on the other side of the ventilation stack without saying anything.` : 'Rook used to come up here. You think about whether he still does, somewhere.',
        ]),
      ],
      choices: [{ t: 'Stay until you are cold.', fx: { hp: 8, cons: 1 }, go: 'u_night' }],
    },

    ev_canal: {
      title: 'The canal towpath — out of uniform',
      text: ['Out of uniform you are just a tall citizen with good boots. The towpath is dark between the lamps. Barges sit low in the water. Somebody on one of them is cooking something with real onions in it.'],
      choices: (s) => [
        { t: 'Watch the barges. Learn who moves at night.', check: { skill: 'perception', diff: 5, pass: 'ev_canal_see', fail: 'ev_canal_nothing' } },
        s.res >= 20 ? { t: 'Follow the chalk lambdas at knee height.', tag: 'RISK', tagCls: 'risk', go: 'ev_canal_res' } : null,
        { t: 'Just walk.', fx: { hp: 4 }, go: 'u_night' },
      ].filter(Boolean),
    },
    ev_canal_see: { text: ['Two barges swap something heavy in sacking at the third lock, quickly, without lights. You know the faces now, and the time.'], choices: [{ t: 'Report it in the morning.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 3, xp: { perception: 1 } }, go: 'u_night' }, { t: 'Keep it to yourself. Leverage is worth more than merit.', fx: { xp: { perception: 1 }, susp: 1 }, go: 'u_night' }] },
    ev_canal_nothing: { text: ['The barges are dark and quiet and you see nothing. Maybe that is what there is to see. Maybe they saw you first.'], choices: [{ t: 'Home.', go: 'u_night' }] },
    ev_canal_res: { text: ['The lambdas lead you to a pump-house door with a candle behind it. Somebody inside says, without opening, “Not tonight, unit. But thank you for coming alone.”'], choices: [{ t: 'Go home.', fx: { res: 4, susp: 2 }, go: 'u_night' }] },

    ev_letter: {
      title: 'A letter',
      text: (s) => [
        s.flags.mira_relocated ? 'You write to Mira, at an address that does not exist, in a city nobody will name. You tell her about the radiator in 14-C. You do not tell her anything that would matter to JURY, out of habit.' : s.rel.mira !== undefined ? 'You write to Mira, two streets away, a letter you could hand her tomorrow. You know you will not. Some things are easier to say to a page that stays in a drawer.' : 'You write to your parents, who are a photograph the colour of weak tea. You tell them what grade you are. You are not sure they would have been proud.',
      ],
      choices: [
        { t: 'Put it in the drawer with the others.', fx: { cons: 3, hp: 3 }, go: 'u_night' },
        { t: 'Burn it in the stove.', fx: { cons: -1, susp: -1 }, go: 'u_night' },
      ],
    },

    ev_cast: {
      title: 'The night broadcast',
      text: (s) => [
        'The mess falls quiet for the night broadcast. The Administrator speaks for nine minutes about the benefits of the suppression field, the efficiency of the ration programme and the wonder of the Spire.',
        s.c3 ? 'At the end there is a new segment: a list of cities that are *performing within parameters*. City 9 is on it. City 17 is not mentioned at all, which every unit in the room notices.' : 'At the end, a citizen of the month: a woman from the Works who reported her own brother. She smiles at the camera the whole time.',
        'Afterwards nobody speaks for a while. Then somebody switches the screen to the dam footage and everyone goes back to their food.',
      ],
      choices: [
        { t: 'Watch the dam footage with the others.', fx: { hp: 3, lp: 1 }, go: 'u_night' },
        { t: 'Watch the others watching.', fx: { xp: { perception: 1 } }, go: 'u_night' },
      ],
    },

    ev_halloran: {
      title: 'Stack 14 — Halloran’s door',
      text: (s) => [
        '@portrait assets/img/portraits/halloran.webp|Old Halloran',
        s.flags.halloran_fate === 'beaten' ? 'Halloran opens the door on the chain. His face has healed crooked. He looks at you for a long time, then takes the chain off anyway.' : 'Halloran opens the door before you knock, as if he had been waiting. He probably had.',
        pick([
          '@say Halloran|They put the ration down again. Sixty grams. I weighed it on the old scale. Sixty grams is a slice of bread, unit. Tell your Administrator that.',
          '@say Halloran|Your sister came by. She brought soup. Tell her not to do that; people talk. Tell her thank you, too.',
          '@say Halloran|I fixed radios, before. Did you know? I could fix yours. I won’t. But I could.',
        ]),
      ],
      choices: [
        { t: 'Sit with him for an hour.', fx: { cons: 3, rel: { halloran: 5 } }, go: 'u_night' },
        { t: 'Check his flat for the transmitter. Habit.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 1, rel: { halloran: -15 }, cons: -3 }, go: 'u_night' },
      ],
    },

    ev_echo: {
      title: 'Your case files',
      enter: (s) => {
        const files = Object.values(s.files || {});
        const f = pick(files);
        s.mem.echo = f.cid;
      },
      text: (s) => {
        const f = s.files[s.mem.echo];
        if (f.amputated) return [`You go to the flat of CID ${f.cid}, ${f.desc}. Somebody else lives there now. On the door frame, at the height of a child, someone has scratched a small mark you have seen before on the files of amputated citizens: a tally line. There are four.`];
        if (f.points >= 15) return [`You find CID ${f.cid}, ${f.desc}, in the stairwell of their block. ${f.points} points. They see you and stop dead, and you watch them do the arithmetic: one more stop, any stop.`];
        if (/WARNING|RELEASED/.test(f.lastVerdict || '')) return [`You pass the flat of CID ${f.cid}, ${f.desc}. The door opens before you can walk on. They do not say anything. They hold out a ration bar, and when you do not take it, they put it on the windowsill and close the door.`];
        return [`You walk past the flat of CID ${f.cid}, ${f.desc}. A light is on. Somebody is laughing inside. That is all. You do not know why you came.`];
      },
      choices: (s) => {
        const f = s.files[s.mem.echo];
        if (f.amputated) return [{ t: 'Go home.', fx: { cons: -2 }, go: 'u_night' }];
        if (f.points >= 15)
          return [
            { t: '“I am not here for you.” Walk on.', tag: 'MERCY', tagCls: 'mercy', fx: (st) => (G.distFx(st, 's14', -1, -3), { cons: 2 }), go: 'u_night' },
            {
              t: 'Stop them anyway. Loitering in a stairwell after 20:00: two more points.',
              tag: 'BY THE BOOK',
              tagCls: 'loyal',
              fx: (st) => {
                const ff = st.files[st.mem.echo];
                ff.points += 2;
                ff.stops = (ff.stops || 0) + 1;
                ff.lastVerdict = '+2 PTS';
                ff.last = st.day;
                if (ff.points >= 20) (ff.amputated = true), (ff.lastVerdict = 'AMPUTATED');
                return { merit: 1, cons: -4 };
              },
              go: 'u_night',
            },
          ];
        return [{ t: 'Go home.', fx: { cons: 1 }, go: 'u_night' }];
      },
    },
  });

  /* ========================================================== DOSSIER MAP */
  const COL = { green: '#6fbf73', amber: '#e2a83f', red: '#d9534a' };
  G.sideExtras = G.sideExtras || [];
  G.sideExtras.push((S) => {
    if (S.phase !== 'union' || !S.dist) return '';
    const cell = (k, cls) => {
      const c = colour(S.dist[k]);
      return `<div class="dmap-cell ${cls}" style="border-color:${COL[c]};color:${COL[c]}" title="${BLOCKS[k].name}"><b>${BLOCKS[k].short}</b><small>${BLOCKS[k].name}</small></div>`;
    };
    return `<section><h3>District 5</h3><div class="dmap">${cell('s9', 'a')}${cell('s14', 'b')}${cell('s22', 'c')}${cell('bazaar', 'd')}${cell('plaza', 'e')}</div><div class="sub">Green: calm. Amber: tense. Red: trouble. Hard choices bring order and resentment; mercy brings neither.</div></section>`;
  });

  G.addCodex({
    district5: {
      title: 'District 5 sociostability',
      body: `<p>The precinct board rates every block of District 5 by colour each morning: <b style="color:#6fbf73">green</b>, <b style="color:#e2a83f">amber</b>, <b style="color:#d9534a">red</b>. The rating combines two things the Nexus measures and units feel: <b>order</b> (how much a block obeys) and <b>resentment</b> (how much it remembers).</p>
      <p>Hard verdicts and force raise both. Leniency lowers both. Resentment boils over into attacks on units and property. Low order is where the canal cells move in. The board is updated every night.</p>`,
    },
  });
})();
