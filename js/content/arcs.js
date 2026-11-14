/* CHAPTER TWO for HELIX, RAZOR, SPEAR, VECTOR and GRID — one arc each, grade 03 → 02.
   Structure (same as UNION and JURY): a title card, then four stages fired by morning/evening
   beats between duties, then the officer's verdict and an end card that hands over to chapter 3.
     HELIX  "The Ward"            a resistance courier kept alive for JURY
     RAZOR  "The Guest"           an auditor from City 1, and a leak in your own squad
     SPEAR  "Beyond the Canal"    a lost squad, and the people living in the zone
     VECTOR "Specimen Nine"       a woman the infection does not take
     GRID   "The Blackout List"   whose lights go out this winter */
(function () {
  const ARCS = {};
  G.DIV_ARCS = ARCS;
  const lc = (d) => d.toLowerCase();
  const cast = (s) => G.DIV_CAST[s.div];
  const chief = (s) => G.PEOPLE[cast(s).chief.key].name.replace(/"/g, '');
  const mate = (s) => G.PEOPLE[cast(s).partner.key].name.replace(/"/g, '');
  const chiefPic = (s) => `@portrait assets/img/portraits/${cast(s).chief.img}.webp|${cast(s).chief.cap}`;
  const matePic = (s) => `@portrait assets/img/portraits/${G.PEOPLE[cast(s).partner.key].img}.webp|${G.PEOPLE[cast(s).partner.key].name}`;
  const next = (gap, fx) => (s) => {
    s.c2.stage++;
    s.c2.next = s.day + (gap === undefined ? 1 : gap);
    return typeof fx === 'function' ? fx(s) : fx || null;
  };
  const F = (k) => (s) => !!s.c2[k];
  const set = (o, fx) => (s) => (Object.assign(s.c2, o), typeof fx === 'function' ? fx(s) : fx || null);

  /* entry: new chapter-two players are redirected from the old placeholder; existing saves catch up */
  G.extend('c2_other', { before: (s) => (ARCS[s.div] ? `x2_${lc(s.div)}_intro` : undefined) });
  G.beats.push({ id: 'x2_late', time: 'morning', when: (s) => !!ARCS[s.div] && !!s.c2 && !s.c2.arc && !s.c3 && s.phase === 'union', scene: 'x2_any_intro' });
  ['HELIX', 'RAZOR', 'SPEAR', 'VECTOR', 'GRID'].forEach((d) => {
    ARCS[d] = true;
    for (let n = 0; n < 4; n++) G.beats.push({ id: `x2_${lc(d)}_${n}`, time: n === 1 ? 'evening' : 'morning', when: (s) => s.div === d && s.c2 && s.c2.arc && s.c2.stage === n && s.day >= s.c2.next, scene: `x2_${lc(d)}_${n}` });
  });

  const TITLES = { HELIX: 'THE WARD', RAZOR: 'THE GUEST', SPEAR: 'BEYOND THE CANAL', VECTOR: 'SPECIMEN NINE', GRID: 'THE BLACKOUT LIST' };
  const INTRO = {
    HELIX: ['The HELIX ward is under the Nexus, where the river can be heard through the walls. White light. White bands. Units on the left, citizens on the right.', 'You have a key to the drug cabinet now, and a name on the duty roster, and a patient nobody else wants.'],
    RAZOR: ['RAZOR stands closest to the people who matter: the Administrator’s staff, the hardpoints, the gates of the Nexus. You stand very still now, for many hours, and see everything.', 'Next week someone important is coming from City 1. Everyone in a gold band already knows the name.'],
    SPEAR: ['Beyond the eastern canal, Old Town has been quarantined since the war. SPEAR is the only division that goes in on purpose.', 'You have a shotgun now, and a lamp, and a squad that laughs too loudly in the drains.'],
    VECTOR: ['Beneath the Nexus, past HELIX, past the cells of Level 4, there is a floor without a number. VECTOR keeps its laboratories there.', 'You wear the sealed suit eleven hours a day now. You have stopped noticing the smell. You were warned about that.'],
    GRID: ['Every light in City 9 runs through GRID’s hands: the forcefields, the scanners, the conduits from the dam to the Spire. Winter is coming, and winter is always a question of power.', 'You have a calibration key now, and a notebook of faults, and a seat in Foreman’s office.'],
  };

  const scenes = {
    x2_any_intro: { safe: true, enter: (s) => `x2_${lc(s.div)}_intro`, text: [] },
  };
  Object.keys(INTRO).forEach((d) => {
    scenes[`x2_${lc(d)}_intro`] = {
      checkpoint: true,
      safe: true,
      title: 'Chapter Two',
      enter: (s) => {
        if (!s.c2) s.c2 = { div: d, stage: 0, next: s.day + 1, ev: {} };
        s.c2.arc = true;
        s.c2.stage = 0;
        s.c2.next = s.day + 1;
        s.chapter = 2;
        const dc = G.DIV_CAST[d];
        ['chief', 'partner'].forEach((r) => {
          if (s.rel[dc[r].key] === undefined) s.rel[dc[r].key] = r === 'partner' ? 20 : 0;
        });
      },
      text: (s) => ['@big CHAPTER TWO', `@sys ${d} · ${TITLES[d]}`, ...INTRO[d], chiefPic(s)],
      choices: () => [{ t: 'Begin.', go: (s) => (s.time === 'Morning' ? 'u_board' : 'u_duty_end') }],
    };
  });

  /* shared finale: the officer's verdict and the end card */
  const verdict = (d, lines) => ({
    title: (s) => `${chief(s)}’s office`,
    enter: (s) => {
      s.mem.c2pass = s.susp < 70;
      if (s.mem.c2pass && G.rankIdx(s.rank) < G.rankIdx('02')) {
        G.promote(s, G.RANKS[G.rankIdx(s.rank) + 1]);
        G.fx(s, { merit: 8, lp: 3 });
      }
    },
    text: (s) => [chiefPic(s), ...lines(s), s.mem.c2pass ? `@doc PROMOTION: ${G.desig(s)}` : '@sys Promotion withheld. JURY has a query about you. Keep serving, and keep your file clean.'],
    choices: [{ t: 'Continue.', go: `x2_${lc(d)}_end` }],
  });
  const endCard = (d, lines) => ({
    checkpoint: true,
    title: `End of Chapter Two — ${d}`,
    enter: (s) => {
      if (s.flags.c2_end_day === undefined) s.flags.c2_end_day = s.day;
      s.c2.done = true;
    },
    text: (s) => [
      ...lines(s),
      '@radio …all C9 units, BOLO, priority one, relayed from City 17: person of interest, male, description to follow…',
      'Nobody pays much attention. City 17 is a long way away.',
      `@doc ${G.desig(s)}\nDIVISION: ${s.div}\nRANK: ${G.RANK_NAMES[s.rank].toUpperCase()}\nDAYS IN SERVICE: ${s.day}`,
      `@sys CHAPTER TWO COMPLETE (${d}). Chapter Three begins in a few days.`,
    ],
    choices: [{ t: 'Return to duty.', go: 'u_duty_end' }],
  });

  /* ================================================================== HELIX */
  Object.assign(scenes, {
    x2_helix_0: {
      title: 'The HELIX ward — bed 12',
      text: (s) => [
        chiefPic(s),
        `@say ${chief(s)}|Bed 12. Overwatch brought him in at 04:00: a canal courier with two rounds in him and a radio code in his head. JURY wants him able to talk in three days. You will keep him alive for three days. Not four. Three.`,
        matePic(s),
        `@say ${mate(s)}|He keeps asking for water and saying a woman’s name. I’ve been told not to write the name down.`,
      ],
      choices: [
        { t: '“Three days. Understood.”', tag: 'BY THE BOOK', tagCls: 'loyal', fx: next(0, { merit: 2, lp: 1 }), go: 'u_board' },
        { t: '“And on the fourth day?”', check: { skill: 'authority', diff: 5, pass: 'x2_helix_0_ask', fail: 'x2_helix_0_ask_bad' } },
      ],
    },
    x2_helix_0_ask: { text: (s) => [`@say ${chief(s)}|On the fourth day he belongs to Level 4 and we never think about him again. That is what HELIX is, three. We are the three days.`], choices: [{ t: 'To the duty board.', fx: next(0, { cons: 2, rel: { matron: 4 } }), go: 'u_board' }] },
    x2_helix_0_ask_bad: { text: (s) => [`@say ${chief(s)}|On the fourth day you will still have a white band, if you stop asking questions like that one.`], choices: [{ t: 'To the duty board.', fx: next(0, { susp: 2 }), go: 'u_board' }] },

    x2_helix_1: {
      title: 'The HELIX ward — 23:50',
      text: (s) => [
        'The courier in bed 12 wakes at midnight while you change his dressing. He looks at your face — your actual face, mask off on the night shift — and his eyes go wide.',
        s.rel.mira !== undefined ? '@say Courier|You’re Mira’s. From 14-C. She showed me a photograph once. God. They made you one of them.' : '@say Courier|You grew up in the Stacks. I can hear it. They made you one of them.',
        '@say Courier|Her name is Dana. Stack 9, 2B. Tell her I’m alive. Just that. Please.',
      ],
      choices: [
        { t: 'Carry the message.', tag: 'MERCY', tagCls: 'mercy', fx: next(1, set({ msg: true }, { res: 8, cons: 4, susp: 2 })), go: 'u_night' },
        { t: 'Report what he said to Matron.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: next(1, set({ reported: true }, { merit: 4, cons: -4 })), go: 'u_night' },
        { t: 'Finish the dressing and say nothing.', fx: next(1), go: 'u_night' },
      ],
    },

    x2_helix_2: {
      title: 'The HELIX ward — the third day',
      text: (s) => [
        'At 09:00 two JURY units arrive with a gurney and a form. The courier’s fever is at forty. Moving him will kill him in the van. Everyone in the room knows it.',
        `@say JURY 03|Sign him fit, HELIX. We have a schedule.`,
        s.c2.msg ? `Last night a woman left a ration wrapper at the infirmary gate addressed to you. Inside, in pencil: *Thank you. — D.* And below it: *If he is moved, we can be at the morgue door at 02:00.*` : null,
      ],
      choices: (s) => [
        { t: 'Sign him fit.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: set({ end: 'signed' }, { merit: 5, lp: 3, cons: -10 }), go: 'x2_helix_2_out' },
        { t: '“He is not fit. HELIX authority. Twenty-four hours.”', check: { skill: 'authority', diff: 10, pass: 'x2_helix_2_delay', fail: 'x2_helix_2_overruled' } },
        s.c2.msg ? { t: 'Log him dead at 01:50, and have the morgue door open at 02:00.', tag: 'RISK', tagCls: 'risk', check: { skill: 'deception', diff: 15, pass: 'x2_helix_2_out_ok', fail: 'x2_helix_2_out_bad' } } : null,
      ].filter(Boolean),
    },
    x2_helix_2_out: { text: ['You sign. They lift him onto the gurney. He does not look at you. He dies in the van on the bridge, and JURY sends HELIX a complaint about the quality of its work.'], choices: [{ t: 'Continue.', fx: next(1), go: 'u_duty_end' }] },
    x2_helix_2_delay: { text: ['The JURY units look at each other, then at your white band, and leave without him. The fever breaks that night. On the fourth day they take him anyway — alive, which is the most HELIX can ever promise.'], choices: [{ t: 'Continue.', fx: next(1, set({ end: 'delayed' }, { cons: 5, merit: 2 })), go: 'u_duty_end' }] },
    x2_helix_2_overruled: { text: ['The JURY 03 takes the pen out of your hand and signs the form himself. Matron, in the doorway, says nothing. He dies in the van.'], choices: [{ t: 'Continue.', fx: next(1, set({ end: 'signed' }, { cons: -4 })), go: 'u_duty_end' }] },
    x2_helix_2_out_ok: { text: ['01:50: time of death, in your hand. 02:00: the morgue door, a CWU laundry cart, a woman with a red headscarf who does not look at you. 02:04: an empty drawer.', 'The courier is somewhere in the canals now, with your stitches in him.'], choices: [{ t: 'Continue.', fx: next(1, set({ end: 'smuggled' }, { res: 20, cons: 10, susp: 10 })), go: 'u_duty_end' }] },
    x2_helix_2_out_bad: {
      enter: (s) => (next(1)(s), G.discipline(s, 'grave', 'Falsified a death record to release a JURY subject', 'collab')),
      text: ['At 02:00 the morgue door opens on a JURY unit, not a laundry cart. Somebody in the canals talked, or somebody on the ward listened.'],
      choices: [{ t: 'They come for you at dawn.', go: 'disc_tribunal' }],
    },

    x2_helix_3: verdict('HELIX', (s) => [
      s.c2.end === 'smuggled' ? `@say ${chief(s)}|A subject died on your ward and his body went missing from my morgue. I have decided that the morgue clerk is incompetent. I will not decide anything else, three, so do not give me cause.` : s.c2.end === 'delayed' ? `@say ${chief(s)}|You stood between JURY and a patient with nothing but a white band. JURY complained. I framed the complaint.` : `@say ${chief(s)}|The subject was delivered as ordered. JURY is satisfied. HELIX is what it is.`,
    ]),
    x2_helix_end: endCard('HELIX', (s) => [
      s.c2.end === 'smuggled' ? 'Weeks later a ration wrapper is pushed under your barracks door. Inside, a pencil drawing of a man asleep in a bed with clean sheets. No name.' : s.c2.end === 'delayed' ? 'You never learn what happened to him on Level 4. You do not ask.' : 'Bed 12 has a new patient by noon. The sheets are changed. That is all it takes.',
    ]),
  });

  /* ================================================================== RAZOR */
  Object.assign(scenes, {
    x2_razor_0: {
      title: 'RAZOR command — the route',
      text: (s) => [
        chiefPic(s),
        `@say ${chief(s)}|Overseer Strand of the City 1 Productivity Office arrives on Thursday. Four hours in City 9. He wants to see a market, a mill and a ration line, in that order. You plan the route.`,
        `@say ${chief(s)}|Route one: Bazaar Row on foot. He sees the people; the people see him. Route two: the service tunnels under D1 and a closed viewing gallery over the Works. Safe. Dull. He will be disappointed.`,
      ],
      choices: [
        { t: 'Bazaar Row. Let him see the people.', fx: next(0, set({ route: 'row' }, { merit: 2 })), go: 'u_board' },
        { t: 'The tunnels. Nothing reaches him underground.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: next(0, set({ route: 'tunnel' }, { merit: 1 })), go: 'u_board' },
      ],
    },
    x2_razor_1: {
      title: 'RAZOR barracks — evening',
      text: (s) => [
        matePic(s),
        `@say ${mate(s)}|Sallow asked me for the route today. Casual, like asking the time. He owes tokens all over the Row — gambling, they say. I didn’t tell him. I thought you should know he asked.`,
      ],
      choices: [
        { t: 'Report Sallow to Bastion tonight.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: next(1, set({ sallow: 'reported' }, { merit: 3, rel: { brace: 4 } })), go: 'u_night' },
        { t: 'Change the route at the last minute. Tell no one.', fx: next(1, set({ switched: true }, { xp: { deception: 1 } })), go: 'u_night' },
        { t: 'Find Sallow and ask him why.', check: { skill: 'authority', diff: 10, pass: 'x2_razor_1_ask', fail: 'x2_razor_1_ask_bad' } },
      ],
    },
    x2_razor_1_ask: { text: ['Sallow cracks in four sentences. A man on Bazaar Row holds his debts. He wanted the route, and the hour. Sallow does not know what for. He says he does not want to know. He is crying by the end.'], choices: [{ t: '“Then you will tell him a route. The one I give you.”', fx: next(1, set({ sallow: 'turned', switched: true }, { merit: 2, cons: 1 })), go: 'u_night' }, { t: 'Take him to Bastion.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: next(1, set({ sallow: 'reported' }, { merit: 4, cons: -2 })), go: 'u_night' }] },
    x2_razor_1_ask_bad: { text: ['Sallow laughs and says he was curious, and walks off. You do not believe him. You do not know what to do about that.'], choices: [{ t: 'Go to bed.', fx: next(1), go: 'u_night' }] },

    x2_razor_2: {
      checkpoint: true,
      title: (s) => (s.c2.route === 'row' && !s.c2.switched ? 'Bazaar Row — the visit' : 'The service tunnels — the visit'),
      text: (s) => {
        const real = s.c2.switched ? (s.c2.route === 'row' ? 'tunnel' : 'row') : s.c2.route;
        s.c2.real = real;
        const warned = s.c2.sallow === 'reported' || s.c2.sallow === 'turned' || s.c2.switched;
        s.c2.warned = warned;
        return [
          'Overseer Strand is small, grey and polite, and asks every unit he meets for their productivity figures.',
          real === 'row' ? 'On Bazaar Row the crowd parts for the RAZOR diamond. Halfway along, a boy steps out holding a ration tin with a wire coming out of it.' : 'In the service tunnels the lights flicker. Ahead, at the junction, a CWU maintenance man is kneeling by a junction box with his back to you, and he is not on the schedule.',
          warned ? 'You were expecting something. Your hand is already moving.' : 'Nobody was expecting anything.',
        ];
      },
      choices: (s) => [
        { t: 'Cover the Overseer with your body.', check: { skill: 'fitness', diff: s.c2.warned ? 0 : 15, pass: 'x2_razor_2_shield', fail: 'x2_razor_2_hurt' } },
        { t: 'Take the shot.', tag: 'BY THE BOOK', tagCls: 'loyal', check: { skill: 'firearms', diff: s.c2.warned ? 0 : 10, pass: 'x2_razor_2_shot', fail: 'x2_razor_2_hurt' } },
        { t: 'Shout — make him drop it.', tag: 'MERCY', tagCls: 'mercy', check: { skill: 'authority', diff: 15, pass: 'x2_razor_2_talk', fail: 'x2_razor_2_hurt' } },
      ],
    },
    x2_razor_2_shield: { text: ['You put the Overseer on the ground and yourself on top of him. The tin does not go off — the wire was never connected. Somebody wanted to see what RAZOR would do.', 'Strand gets up, brushes his coat and asks for your designation, warmly.'], choices: [{ t: 'Continue.', fx: next(1, set({ end: 'shield' }, { merit: 5, rel: { bastion: 6 } })), go: 'u_duty_end' }] },
    x2_razor_2_shot: { text: ['One round. The attacker goes down. The tin rolls across the stones and does nothing; the wire was never connected.', 'Strand looks at the body for a long time, then writes something on his slate.'], choices: [{ t: 'Continue.', fx: next(1, set({ end: 'shot' }, { merit: 6, lp: 3, cons: -8 })), go: 'u_duty_end' }] },
    x2_razor_2_talk: { text: ['Your amplified voice fills the street. The attacker freezes, then drops the tin, and it is only a tin: the wire goes nowhere. He is sixteen. He was paid six tokens to stand there.', 'Strand says he finds that *very interesting*.'], choices: [{ t: 'Continue.', fx: next(1, set({ end: 'talk' }, { merit: 4, cons: 5 })), go: 'u_duty_end' }] },
    x2_razor_2_hurt: { text: ['You are a second too slow. The attacker shoves past and is gone; the Overseer is knocked down and cuts his hand on the cobbles. The tin was never armed. That is not the point.'], choices: [{ t: 'Continue.', fx: next(1, (s) => (G.discipline(s, 'serious', 'VIP injured under RAZOR protection'), set({ end: 'hurt' }, { hp: -10 })(s))), go: 'u_duty_end' }] },

    x2_razor_3: verdict('RAZOR', (s) => [
      s.c2.end === 'hurt' ? `@say ${chief(s)}|The Overseer bled on Bazaar Row. One drop. His report will mention it on every page.` : `@say ${chief(s)}|The Overseer is safe and pleased with City 9. Pleased men write reports. His says our city is *under-utilised*.`,
      s.c2.sallow === 'reported' ? 'Sallow has been transferred to the rail-yard gates. He does not speak to you.' : s.c2.sallow === 'turned' ? 'Sallow nods to you every morning now, the way people nod to the person who knows.' : null,
    ]),
    x2_razor_end: endCard('RAZOR', (s) => ['Overseer Strand’s report reaches City 9 three weeks later: a single page recommending that the ration be *aligned with output*. Nobody in the Stacks has read it. Everybody will feel it.']),
  });

  /* ================================================================== SPEAR */
  Object.assign(scenes, {
    x2_spear_0: {
      title: 'SPEAR briefing — the lost squad',
      text: (s) => [
        chiefPic(s),
        `@say ${chief(s)}|UNION squad Thistle went into Old Town after a cell eight months ago. Biosignals cut on the second night. Last week, one of those biosignals came back on. For forty seconds. Block 11.`,
        `@say ${chief(s)}|SPEAR goes in at dawn. Lights or no lights is your call; you lead the point.`,
      ],
      choices: [
        { t: 'Lights. Fast and loud. Nothing hides from a lamp.', fx: next(0, set({ quiet: false }, { merit: 2 })), go: 'u_board' },
        { t: 'No lights. Slow. Let us see them before they see us.', fx: next(0, set({ quiet: true }, { xp: { perception: 1 } })), go: 'u_board' },
      ],
    },
    x2_spear_1: {
      title: 'SPEAR barracks — evening',
      text: (s) => [matePic(s), `@say ${mate(s)}|Took this off a dead scavenger at the wall last month. Never showed anyone.`, 'It is a map of Old Town drawn on a ration sack: a safe route, marked water, and a block circled twice with a word beside it — *home*. Block 11.'],
      choices: [
        { t: 'Hand the map to Kiln.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: next(1, set({ map: 'kiln' }, { merit: 3 })), go: 'u_night' },
        { t: 'Keep it between the two of you.', fx: next(1, set({ map: 'kept' }, { rel: { rasp: 6 } })), go: 'u_night' },
      ],
    },
    x2_spear_2: {
      checkpoint: true,
      title: 'Old Town — Block 11',
      text: (s) => [
        s.c2.quiet ? 'You go in dark, the way the map said, and the zone lets you through.' : 'You go in with the lamps, and things in the ruins turn toward the light. You lose an hour and nearly a man getting through.',
        'Block 11 has glass in its windows. Smoke from one chimney. A courtyard garden: potatoes, cabbages, a rain barrel. Thirty people, children among them, standing very still, looking at your shotguns.',
        'And among them, in a patched UNION jacket with the armband cut off, a man with a CCA crew cut. Squad Thistle, 03. The one whose biosignal came back on.',
        '@say Thistle 03|Please. They’re not infected. None of them. We tested. We’re just — living.',
        '@radio SPEAR point, Kiln. Report contact. Remember the order: anything alive in 404 is infected until VECTOR says otherwise.',
      ],
      choices: (s) => [
        { t: 'Report the settlement. Call VECTOR.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: set({ end: 'burned' }, { merit: 6, lp: 4, cons: -20 }), go: 'x2_spear_2_burn' },
        { t: 'Bring back the deserter only. Report the block as empty.', check: { skill: 'deception', diff: s.c2.map === 'kiln' ? 20 : 5, pass: 'x2_spear_2_half', fail: 'x2_spear_2_caught' } },
        { t: '“Block 11 is empty. Nothing alive.” Take everyone back out.', tag: 'MERCY', tagCls: 'mercy', check: { skill: 'deception', diff: s.c2.map === 'kiln' ? 25 : 10, pass: 'x2_spear_2_spare', fail: 'x2_spear_2_caught' } },
      ],
    },
    x2_spear_2_burn: { text: ['VECTOR arrives at noon in sealed suits. You are ordered back over the canal. You see the smoke from the east bridge, and then you do not look again.'], choices: [{ t: 'Continue.', fx: next(1), go: 'u_duty_end' }] },
    x2_spear_2_half: { text: ['You bring back one deserter in zip-ties and a report that says Block 11 was empty. Thistle 03 does not say a word about the garden all the way to Level 4. He is amputated on Friday.', 'Block 11 stays on the map as empty.'], choices: [{ t: 'Continue.', fx: next(1, set({ end: 'half' }, { merit: 4, cons: -4, res: 4 })), go: 'u_duty_end' }] },
    x2_spear_2_spare: { text: ['“Empty,” you say into the radio. Your squad looks at you, and then at each other, and then they say it too. On the way out, a child gives you a potato. You eat it raw in the drains and it is the best thing you have eaten in a year.'], choices: [{ t: 'Continue.', fx: next(1, set({ end: 'spared' }, { cons: 12, res: 10, susp: 6 })), go: 'u_duty_end' }] },
    x2_spear_2_caught: {
      text: (s) => [`“Empty,” you say. Kiln’s voice comes back flat: *“The scanner on your lamp says otherwise, point.”* ${s.c2.map === 'kiln' ? 'Kiln had the map. Kiln always had the map.' : ''}`, 'VECTOR arrives at noon.'],
      choices: [{ t: 'Continue.', fx: next(1, (s) => (G.discipline(s, 'serious', 'False contact report in a 404 zone'), set({ end: 'burned' }, { susp: 8, cons: -6 })(s))), go: 'u_duty_end' }],
    },
    x2_spear_3: verdict('SPEAR', (s) => [
      s.c2.end === 'spared' ? `@say ${chief(s)}|Block 11 is empty. Your report says so, and so does your squad’s. I have a feeling about that block, point. I am going to keep the feeling to myself.` : s.c2.end === 'half' ? `@say ${chief(s)}|One deserter recovered. One block empty. Tidy.` : `@say ${chief(s)}|VECTOR thanks SPEAR for its diligence. Thirty-one specimens.`,
    ]),
    x2_spear_end: endCard('SPEAR', (s) => [s.c2.end === 'spared' ? 'Months later, on the 404 wall, you find a potato on top of a fence post. Just one. It keeps happening, every few weeks, all winter.' : 'Block 11 is a black square on the SPEAR map now. Somebody has drawn a small cross on it in pencil.']),
  });

  /* ================================================================== VECTOR */
  Object.assign(scenes, {
    x2_vector_0: {
      title: 'Containment — the floor without a number',
      text: (s) => [
        chiefPic(s),
        `@say ${chief(s)}|Specimen Nine. A woman from the canal raids. Bitten, twice, eleven days ago. Nothing. No progression. She is perfectly well, which is impossible, which makes her the most important thing in this building.`,
        'Behind the glass a woman of about forty sits on a steel bench with her knees pulled up. She looks at your suit and says, through the speaker: *“Do you have a name, or only a number like me?”*',
      ],
      choices: [
        { t: 'Tell her your name.', tag: 'MERCY', tagCls: 'mercy', fx: next(0, set({ named: true }, { cons: 3 })), go: 'u_board' },
        { t: 'Say nothing and take the bloods.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: next(0, { merit: 2, xp: { medical: 1 } }), go: 'u_board' },
      ],
    },
    x2_vector_1: {
      title: 'VECTOR decontamination — evening',
      text: (s) => [
        matePic(s),
        `@say ${mate(s)}|The Archivist has her on the schedule for sectioning the day after tomorrow. They want the tissue, all of it, at once.`,
        `@say ${mate(s)}|And I hear things in the decon queue. The canal cells know about her. They would give anything for a vial of that blood. Anything.`,
      ],
      choices: [
        { t: '“Then we report the leak.”', tag: 'BY THE BOOK', tagCls: 'loyal', fx: next(1, set({ leak: 'reported' }, { merit: 3, res: -5 })), go: 'u_night' },
        { t: '“Find out who is asking.”', fx: next(1, set({ leak: 'asked' }, { res: 4, susp: 1 })), go: 'u_night' },
        { t: 'Say nothing.', fx: next(1), go: 'u_night' },
      ],
    },
    x2_vector_2: {
      checkpoint: true,
      title: 'Containment — sectioning day',
      text: (s) => [
        'The theatre is prepared at 08:00: steel table, restraints, the saws laid out in order of size. Specimen Nine is brought in on a trolley, sedated, still awake.',
        s.c2.named ? `She says your name. Just once, quietly, as if checking it still works.` : 'She looks at your faceplate and finds nothing there.',
        `@say ${chief(s)}|You will assist. Hand me what I ask for, when I ask for it.`,
      ],
      choices: (s) => [
        { t: 'Assist.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: set({ end: 'sectioned' }, { merit: 6, lp: 3, cons: -18 }), go: 'x2_vector_2_out' },
        { t: '“Archivist — alive, she is a source. Dead, she is a sample. One sample.”', check: { skill: 'authority', diff: 15, pass: 'x2_vector_2_argue', fail: 'x2_vector_2_out' } },
        { t: 'Draw three vials of her blood before the first cut, and pocket one.', tag: 'RISK', tagCls: 'risk', check: { skill: 'deception', diff: 10, pass: 'x2_vector_2_vial', fail: 'x2_vector_2_vial_bad' } },
      ],
    },
    x2_vector_2_out: { enter: (s) => { s.c2.end = s.c2.end || 'sectioned'; }, text: ['You hand the Archivist what is asked for, when it is asked for. It takes four hours. Afterwards there are two hundred jars, each with a label in the Archivist’s tiny hand, and none of them is her.'], choices: [{ t: 'Continue.', fx: next(1, { cons: -4 }), go: 'u_duty_end' }] },
    x2_vector_2_argue: { text: ['The Archivist puts the saw down. For a long moment there is only the hum of the ventilation.', '@say The Archivist|One sample. Yes. You are right, and you are the first person in this room to say so. She stays. She stays forever, three. You understand that is what you have bought her.'], choices: [{ t: 'Continue.', fx: next(1, set({ end: 'kept' }, { merit: 4, cons: 6, rel: { archivist: 10 } })), go: 'u_duty_end' }] },
    x2_vector_2_vial: { text: (s) => ['Three vials, labelled, racked. One of them goes up your sleeve between two layers of suit. Then the sectioning, which you assist with, because you must.', s.c2.leak === 'asked' ? 'That night the vial goes into a drainage grate behind the decon tent, where a hand you never see takes it.' : 'That night you hide the vial in your locker and do not know who to give it to.'], choices: [{ t: 'Continue.', fx: next(1, set({ end: 'vial' }, (st) => (st.c2.leak === 'asked' ? { res: 25, cons: 2, susp: 8 } : { cons: 2, susp: 4, flag: { nine_vial: true } }))), go: 'u_duty_end' }] },
    x2_vector_2_vial_bad: {
      enter: (s) => (next(1)(s), G.discipline(s, 'grave', 'Theft of a priority specimen', 'collab')),
      text: ['The Archivist counts the vials. Then counts them again.', '@say The Archivist|Three drawn. Two racked. Gauze, the door.'],
      choices: [{ t: 'They take your suit off you in the corridor.', go: 'disc_tribunal' }],
    },
    x2_vector_3: verdict('VECTOR', (s) => [
      s.c2.end === 'kept' ? `@say ${chief(s)}|Specimen Nine is in tank 1 now, awake, reading. I let her have books. She asked for you by name. I said no.` : s.c2.end === 'vial' ? `@say ${chief(s)}|The tissue was disappointing. Whatever she had, it was in the blood, and the blood has been counted twice since.` : `@say ${chief(s)}|Specimen Nine has been very useful. VECTOR thanks you.`,
    ]),
    x2_vector_end: endCard('VECTOR', (s) => [s.c2.end === 'vial' && s.c2.leak === 'asked' ? 'In the Canal Quarter, someone in a pump house is looking at blood under a stolen microscope. You will never know what they see.' : 'The floor without a number goes on without one.']),
  });

  /* ================================================================== GRID */
  const BL = { s9: 'Stack 9', s14: 'Stack 14', s22: 'Stack 22', bazaar: 'Bazaar Row' };
  Object.assign(scenes, {
    x2_grid_0: {
      title: 'GRID works — the blackout list',
      text: (s) => [
        chiefPic(s),
        `@say ${chief(s)}|Winter allocation. The dam’s output goes to the Spire first, the Nexus second, and the Stacks get what is left. What is left is not enough. One block goes dark for six weeks. You draw the list.`,
        '@sys Stack 9 is where the canal cells live. Stack 14 is home. Stack 22 has the clinic and the old. Bazaar Row is the market everyone depends on.',
      ],
      choices: (s) =>
        Object.keys(BL).map((k) => ({
          t: `${BL[k]}.`,
          tag: k === 's9' ? 'BY THE BOOK' : k === 's22' ? 'BRUTAL' : '',
          tagCls: k === 's9' ? 'loyal' : k === 's22' ? 'risk' : '',
          fx: next(0, (st) => {
            st.c2.dark = k;
            if (G.distFx) G.distFx(st, k, -4, 20);
            return k === 's22' ? { cons: -10, merit: 2 } : k === 's14' ? { cons: -6, rel: st.rel.mira !== undefined ? { mira: -10 } : {} } : { merit: 2 };
          }),
          go: 'u_board',
        })),
    },
    x2_grid_1: {
      title: 'GRID works — evening',
      text: (s) => [
        matePic(s),
        `@say ${mate(s)}|I ran the numbers again. The Spire doesn’t need it. The Spire draws the same every winter. The extra goes to the Nexus: heating for the upper floors. Six weeks of ${BL[s.c2.dark]} in the dark so the Administrator’s staff are warm.`,
      ],
      choices: [
        { t: '“File the numbers with Foreman. Officially.”', check: { skill: 'comms', diff: 10, pass: 'x2_grid_1_file', fail: 'x2_grid_1_file_bad' } },
        { t: '“Burn your notebook. We never ran them.”', tag: 'BY THE BOOK', tagCls: 'loyal', fx: next(1, { merit: 1, cons: -3, rel: { solder: -6 } }), go: 'u_night' },
        { t: 'Give the numbers to someone on Bazaar Row.', tag: 'RISK', tagCls: 'risk', fx: next(1, set({ leaked: true }, { res: 10, susp: 4 })), go: 'u_night' },
      ],
    },
    x2_grid_1_file: { text: ['Foreman reads the figures twice, then puts them in a drawer and locks it. “Correct,” he says. “And irrelevant. But correct.” He shortens the blackout by two weeks.'], choices: [{ t: 'Go home.', fx: next(1, set({ shortened: true }, { merit: 2, cons: 3, rel: { foreman: 6 } })), go: 'u_night' }] },
    x2_grid_1_file_bad: { text: ['Foreman does not read the figures. He tells you GRID does not do politics, and to go home.'], choices: [{ t: 'Go home.', fx: next(1), go: 'u_night' }] },
    x2_grid_2: {
      checkpoint: true,
      title: 'Substation 4 — the bypass',
      text: (s) => [
        `Two weeks into the blackout, substation 4 shows a load where there should be none. Somebody has run a cable from the Nexus feed into ${BL[s.c2.dark]}. You follow it to a basement.`,
        'At the end of the cable: a CWU electrician in his sixties, kneeling at a junction box with a torch in his teeth. Behind him, through a grating, you can see windows in the dark block lit, one by one, very dimly.',
        '@say Electrician|Clinic lights and the stair lamps. Nothing else. Nobody will ever notice. Except you, apparently.',
      ],
      choices: [
        { t: 'Arrest him and cut the bypass.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: set({ end: 'cut' }, { merit: 6, lp: 3, cons: -8 }), go: 'x2_grid_2_out' },
        { t: 'Rebalance it so it never shows on the board. Let him go.', tag: 'MERCY', tagCls: 'mercy', check: { skill: 'comms', diff: 10, pass: 'x2_grid_2_hide', fail: 'x2_grid_2_hide_bad' } },
        { t: 'Cut the bypass. Let him go.', fx: set({ end: 'half' }, { merit: 3, cons: 2 }), go: 'x2_grid_2_out' },
      ],
    },
    x2_grid_2_out: { text: (s) => [s.c2.end === 'cut' ? 'He goes quietly to Level 4. The clinic lights in the dark block go out one by one.' : 'He goes, without thanking you. The clinic lights go out. You did half a thing, which in City 9 is most things.'], choices: [{ t: 'Continue.', fx: next(1, (st) => (G.distFx && G.distFx(st, st.c2.dark, 4, 8), null)), go: 'u_duty_end' }] },
    x2_grid_2_hide: { text: (s) => [`You spend an hour in the basement making the load look like line loss. When you climb out, ${BL[s.c2.dark]} has stair lamps and a clinic, and the board in Foreman’s office shows nothing at all.`], choices: [{ t: 'Continue.', fx: next(1, (st) => (st.c2.end = 'hidden', G.distFx && G.distFx(st, st.c2.dark, 0, -12), { cons: 8, res: 6, susp: 3 })), go: 'u_duty_end' }] },
    x2_grid_2_hide_bad: { text: ['You get the balance wrong. Substation 4 trips, and the alarm goes to Foreman’s office before you are out of the basement.'], choices: [{ t: 'Continue.', fx: next(1, (st) => (st.c2.end = 'cut', G.discipline(st, 'serious', 'Unauthorised load on the Nexus feed'), { susp: 6 })), go: 'u_duty_end' }] },
    x2_grid_3: verdict('GRID', (s) => [
      s.c2.end === 'hidden' ? `@say ${chief(s)}|Substation 4 shows a line loss I cannot explain. You will not explain it either. Good.` : `@say ${chief(s)}|The winter allocation held. The Nexus is warm. The Spire is lit. That is the whole job.`,
      s.c2.shortened ? `${BL[s.c2.dark]} gets its lights back two weeks early. Nobody there will ever know why.` : null,
    ]),
    x2_grid_end: endCard('GRID', (s) => [s.c2.leaked ? `The blackout figures turn up chalked on the end wall of ${BL[s.c2.dark]}, every number, in a neat hand. JURY scrubs them off. They are back the next morning.` : 'The dam roars all winter. The Spire never flickers. The Stacks are cold.']),
  });

  G.addScenes(scenes);
})();
