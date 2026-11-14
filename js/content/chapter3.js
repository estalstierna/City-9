/* CHAPTER THREE — "The Long Night". All divisions.
   City 17 has gone quiet on the relay and the Union tightens every city it owns. In City 9,
   Overwatch declares sociostatus and takes command. The canal cells plan one night without
   power: cut the dam conduit, drop the forcefields at the D4 rail yards, stop a relocation train.
   Every division gets its own assignment in the middle; the night itself is shared.
   (The man from City 17 is never named or seen here. The relay only gets noisier.) */
(function () {
  const pick = G.pick;
  const DIVS = ['UNION', 'JURY', 'HELIX', 'RAZOR', 'SPEAR', 'VECTOR', 'GRID'];

  G.PEOPLE.vigil = { name: '"Vigil"', role: 'OA CmD · Task Force LOCK', img: 'vigil' };
  G.PEOPLE.katya = G.PEOPLE.katya || { name: 'Katya', role: 'Canal Quarter', img: 'katya' };
  G.PEOPLE.tinker = G.PEOPLE.tinker || { name: 'The Tinker', role: 'Repairman · Bazaar Row', img: 'tinker' };
  G.PEOPLE.ilse = G.PEOPLE.ilse || { name: 'Ilse Marek', role: 'Fellow recruit', img: 'ilse' };

  /* ------------------------------------------------------------ state */
  const C = (s) => s.c3;
  const adv = (gap, extra) => (s) => {
    s.c3.stage++;
    s.c3.next = s.day + (gap === undefined ? 1 : gap);
    return extra ? (typeof extra === 'function' ? extra(s) : extra) : null;
  };
  const c2Done = (s) => {
    if (s.flags.c2_end_day !== undefined) return s.flags.c2_end_day;
    if (s.visits && (s.visits.c2_end_union || s.visits.c2_end_jury)) return -99;
    return null;
  };
  const ready = (s) => {
    if (s.c3 || s.phase !== 'union' || !s.div) return false;
    if (s.div === 'UNION' || s.div === 'JURY') {
      const d = c2Done(s);
      return d !== null && s.day >= d + 2;
    }
    if (s.flags.c2_end_day !== undefined) return s.day >= s.flags.c2_end_day + 2;
    return !!s.c2 && !(G.DIV_ARCS && G.DIV_ARCS[s.div]) && s.day >= s.c2.next + 3;
  };
  /* who from the canals still has a face you know */
  const contact = (s) => {
    if (s.flags.ilse_arrested || s.flags.betrayed_cell) return s.flags.tinker_arrested ? { key: 'katya', name: 'Katya', img: 'katya' } : { key: 'tinker', name: 'The Tinker', img: 'tinker' };
    if (s.rel.ilse !== undefined && !s.flags.ilse_gone) return { key: 'ilse', name: 'Ilse', img: 'ilse' };
    if (!s.flags.tinker_arrested && s.rel.tinker !== undefined) return { key: 'tinker', name: 'The Tinker', img: 'tinker' };
    return { key: 'katya', name: 'Katya', img: 'katya' };
  };
  const secrets = (s) => !!(s.flags.mole || s.flags.jury_double || C(s).promise || s.res >= 40 || s.flags.shielded || s.flags.mira_saved);
  const miraHere = (s) => s.rel.mira !== undefined && !s.flags.mira_relocated;
  const post = (s) =>
    ({
      UNION: 'the spillway gate below pump house 2',
      JURY: 'the spillway gate below pump house 2, with a JURY detention van',
      HELIX: 'the field station at the lock bridge',
      RAZOR: 'the hardpoint on the dam crest',
      SPEAR: 'the tunnel mouth under the spillway',
      VECTOR: 'the sealed culvert under the spillway',
      GRID: 'conduit junction 7, inside the dam',
    })[s.div] || 'the spillway';

  G.beats.push({ id: 'c3_go', time: 'morning', when: ready, scene: 'c3_start' });
  const stage = (id, n, time, scene) => G.beats.push({ id, time, when: (s) => s.c3 && s.c3.stage === n && s.day >= s.c3.next, scene });
  stage('c3s1', 1, 'evening', 'c3_1');
  stage('c3s2', 2, 'morning', 'c3_2');
  stage('c3s3', 3, 'evening', 'c3_3');
  stage('c3s4', 4, 'morning', 'c3_4');

  /* the end of chapter two now records its day, so chapter three can follow it */
  ['c2_end_union', 'c2_end_jury'].forEach((id) =>
    G.extend(id, {
      after: (s) => {
        if (s.flags.c2_end_day === undefined) s.flags.c2_end_day = s.day;
      },
      text: (lines) => lines.map((l) => (typeof l === 'string' && l.startsWith('@sys CHAPTER TWO COMPLETE') ? l.replace('Chapter Three is coming.', 'Chapter Three begins in a few days.') : l)),
    })
  );
  G.extend('c2_other', {
    text: (lines, s) => [`@sys The ${s.div} storyline continues in Chapter Three, which begins in a few days. Until then you serve on the duty board.`],
  });

  /* while sociostatus holds, the board says so */
  G.extend('u_board', {
    text: (lines, s) => {
      if (s.c3 && s.c3.stage >= 1 && !s.c3.done) lines.splice(1, 0, '@dispatch SOCIOSTATUS ACTIVE — CITY 9. Overwatch holds command authority. Curfew 20:00. Two-unit protection teams only.');
      return lines;
    },
  });

  /* a duty that only exists under sociostatus */
  G.duties.owsweep = {
    name: 'Curfew sweep with Overwatch',
    desc: 'Walk D5 after 20:00 beside an OTA squad. They have command.',
    first: 'c3_sweep',
    routine: 'c3_sweep_r',
    if: (s) => !!(s.c3 && s.c3.stage >= 1 && !s.c3.done),
  };

  G.addScenes({
    /* ================================================== OPENING */
    c3_start: {
      checkpoint: true,
      safe: true,
      title: 'Chapter Three',
      enter: (s) => {
        s.chapter = 3;
        s.c3 = { stage: 0, next: s.day, div: s.div, intel: 0, promise: false, silent: false, betray: false, flagged: false, result: null, done: false, startRank: s.rank };
        G.unlock(s, 'sociostatus');
      },
      text: (s) => [
        '@big CHAPTER THREE',
        '@sys ALL DIVISIONS · THE LONG NIGHT',
        'For three days the relay from City 17 has carried nothing but priority codes and static. Nobody in the precinct says the name of the city out loud. Everybody listens to the static.',
        'On the fourth morning, Airwatch transports come down over the river in the dark, one after another, and settle on the Nexus roof like crows on a wire. Behind them, slower, two gunships with a cyan line across their noses. By noon the whole city has learned the sound of their rotors.',
        s.div === 'JURY' ? 'Level 4 hears it through the ceiling. The Magistrate stops writing for the first time you can remember.' : s.div === 'UNION' ? 'Granite watches them from the muster hall window with his mask in his hands.' : `Your ${s.div} squadron watches them from the yard, and nobody makes a joke about it.`,
        '@radio All C9 units. Sociostatus is declared. Overwatch assumes command authority as of 06:00. Report to the Nexus briefing hall by division.',
      ],
      choices: [{ t: 'Report to the Nexus.', go: 'c3_0' }],
    },

    c3_0: {
      title: 'The Nexus — briefing hall',
      enter: (s) => {
        if (s.rel.vigil === undefined) s.rel.vigil = 0;
      },
      text: (s) => [
        '@img assets/img/env/e04-nexus.webp|The Nexus',
        'Every division in City 9 is in the hall at once, which you have never seen: the white bands of HELIX, the gold of RAZOR, crimson, orange, chemical green, copper. And along the back wall, not in rows, not at ease, a squad of Overwatch soldiers in grey armour with a single cyan slit for a face.',
        '@img assets/img/ota-soldier.webp|Overwatch infantry, C9 deployment',
        'On the platform stands a unit you have only seen in photographs. Graphite mask with a gold crest. A black armband trimmed in gold: one wide gold bar, two gold stars. **CCA.C9.D1-OA-CmD-00417.** The Academy calls the Field Commander *Vigil*, because nobody has ever seen the Commander sleep.',
        '@portrait assets/img/portraits/vigil.webp|CCA.C9.D1-OA-CmD-00417 — "Vigil"',
        '@say Vigil|You will have heard rumours about City 17. Forget them. City 17 is not your concern. *This* city is. When one city coughs, the Union checks the others for fever.',
        '@say Vigil|The canal cells have a phrase on their frequencies this week: *the long night*. They intend one night without power. We intend that they do not get it. You are Task Force LOCK. Every division. One chain of command, and at the top of it, until sociostatus is lifted, Overwatch.',
        `@sys Your division’s post on the night: **${post(s)}**.`,
        s.div === 'JURY' ? '@say Magistrate|*(quietly, beside you)* A Field Commander who answers to Overwatch. Write down everything you see this month. You will need it later, or someone will.' : s.div === 'UNION' ? '@say Granite|*(quietly)* I saw a sociostatus once, in my first year. Keep your people inside. Keep your head down. And never, ever turn your back on the grey ones.' : null,
      ],
      choices: [
        { t: 'Salute and say nothing. That is what the hall wants.', fx: adv(0, { lp: 2 }), go: 'c3_0_end' },
        { t: '"What happens to the districts if the long night comes anyway, Commander?"', check: { skill: 'authority', diff: 5, pass: 'c3_0_ask', fail: 'c3_0_ask_bad' } },
        { t: '"With respect — why does Overwatch need Civil Protection at all?"', tag: 'BOLD', tagCls: 'risk', check: { skill: 'authority', diff: 15, pass: 'c3_0_bold', fail: 'c3_0_bold_bad' } },
      ],
    },
    c3_0_ask: {
      text: ['The hall goes still. Vigil’s graphite mask turns toward you, slowly.', '@say Vigil|Reprisal. Proportional, documented, and administered by Civil Protection, under Overwatch observation. That is why you will make sure it does not come.', 'It is the most honest answer anyone in a gold crest has ever given you. That is what frightens you about it.'],
      choices: [{ t: 'Muster.', fx: adv(0, { merit: 1, cons: 1 }), go: 'c3_0_end' }],
    },
    c3_0_ask_bad: {
      text: ['Your voice comes out too loud through the amplifier. Vigil does not answer you. An Overwatch soldier at the back of the hall turns its slit toward you, and something on its armour clicks, once.'],
      choices: [{ t: 'Muster.', fx: adv(0, { susp: 3 }), go: 'c3_0_end' }],
    },
    c3_0_bold: {
      text: ['A murmur, cut off. Vigil walks to the edge of the platform and looks down at you for a long time.', '@say Vigil|Because Overwatch cannot tell a frightened citizen from a guilty one. You can. For now. Name and designation, Protection Unit — no. I see it. I will remember it.', 'After the briefing, a gold-banded RAZOR aide finds you in the corridor and tells you the Commander has asked for your file. In a good way, the aide thinks. Probably.'],
      choices: [{ t: 'Muster.', fx: adv(0, { merit: 3, flag: { vigil_noticed: true }, rel: { vigil: 15 } }), go: 'c3_0_end' }],
    },
    c3_0_bold_bad: {
      text: ['The hall goes silent in a way that has weight. Vigil says nothing at all. Two Overwatch soldiers detach from the back wall, walk the length of the hall, and stand behind you for the rest of the briefing.', 'They do not touch you. They do not need to.'],
      choices: [{ t: 'Muster.', fx: adv(0, { susp: 8, lp: -3 }), go: 'c3_0_end' }],
    },
    c3_0_end: {
      safe: true,
      text: ['@sys Chapter Three runs alongside the duty board. Under sociostatus there is a new duty: curfew sweeps with Overwatch.'],
      choices: [{ t: 'To the duty board.', go: 'u_board' }],
    },

    /* ================================================== STAGE 1 — the approach */
    c3_1: {
      title: (s) => `Evening — Day ${s.day}`,
      enter: (s) => {
        s.c3.who = contact(s);
        s.c3.approach = s.res >= 20 && !s.flags.betrayed_cell;
        const asset = (s.inf ? s.inf.list : []).find((x) => x.status === 'active');
        s.c3.assetNote = asset ? asset.name : null;
        if (asset) s.c3.intel += 1;
      },
      text: (s) => {
        const w = s.c3.who;
        if (!s.c3.approach)
          return [
            'The curfew siren goes at 20:00 and the Stacks go dark window by window, faster than they ever have.',
            s.div === 'UNION' || !s.div ? '@say Granite|They’ve put an Overwatch squad in the precinct yard. Sleeping in their armour. Do they sleep? Never mind. Get some rest.' : '@say Your SqL|Rest while you can. Nobody knows what the long night is. That is the problem with it.',
            miraHere(s) ? 'Mira catches you at the door of Stack 14 on your way past. “They’ve moved my shift,” she says. “Night shift at the mill, all week. Is that — is that because of you lot?” You tell her it isn’t. You don’t know if that’s true.' : null,
            s.c3.assetNote ? `@sys Your asset ${s.c3.assetNote} slips a folded ration wrapper into your glove at the stairwell: *something on the long night — the pump houses — not the Stacks*.` : null,
          ];
        return [
          `@portrait assets/img/portraits/${w.img}.webp|${w.name}`,
          w.key === 'ilse'
            ? 'Ilse is waiting for you in the stairwell of your barracks, out of uniform, as if she had never left. Maybe, on paper, she never did.'
            : w.key === 'tinker'
            ? 'The Tinker’s lamp is still burning on Bazaar Row after curfew, which is impossible. He waves you in with burned fingertips and closes the shutter behind you.'
            : 'A girl you last saw bleeding in a lock culvert steps out of a doorway on your way home. Katya. She is thinner, and she is not afraid of you any more.',
          `@say ${w.name}|You know what the long night is. You’ve guessed. One night without the conduit. The Spire goes dark over the river, and the forcefields at the D4 rail yards drop with it.`,
          `@say ${w.name}|There’s a train in the yards. Three hundred people, relocation north, to the prison they don’t name on the boards. When the fields drop, we stop the train.`,
          `@say ${w.name}|Your post on the night is ${post(s)}. We need ten minutes where you are not looking. That’s all. Ten minutes.`,
          s.c3.assetNote ? `@sys Separately, your asset ${s.c3.assetNote} has left you a note: *the pump houses, not the Stacks*.` : null,
        ];
      },
      choices: (s) =>
        !s.c3.approach
          ? [{ t: 'Go home.', fx: adv(1), go: 'u_night' }]
          : [
              { t: '"Ten minutes. You have them."', tag: 'RESISTANCE', tagCls: 'mercy', fx: adv(1, (st) => ((st.c3.promise = true), { res: 12, cons: 4, susp: 2, rel: { [st.c3.who.key]: 15 } })), go: 'u_night' },
              { t: '"I didn’t hear any of this. That is all you get."', fx: adv(1, (st) => ((st.c3.silent = true), { res: 2 })), go: 'u_night' },
              { t: 'Report it. Tonight. Every word.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: adv(1, (st) => ((st.c3.betray = true), (st.c3.intel += 3), { merit: 6, lp: 5, res: -60, cons: -10, rel: { [st.c3.who.key]: -100 } })), go: 'c3_1_report' },
            ],
    },
    c3_1_report: {
      text: (s) => [
        'You walk straight to the Nexus with your mask on and ask for the Commander’s duty officer. You give it all: the conduit, the train, the ten minutes.',
        '@say Duty officer|Noted. The Commander thanks you. Go home, Protection Unit. Do not speak to that person again. We would like them to believe you are still theirs.',
        `On the way back you pass the place where ${s.c3.who.name} was standing. There is nobody there now. There will be, on the night.`,
      ],
      choices: [{ t: 'Go home.', go: 'u_night' }],
    },

    /* ================================================== STAGE 2 — assignments */
    c3_2: {
      title: (s) => `Task Force LOCK — ${s.div} assignment`,
      enter: (s) => {
        const map = { UNION: 'c3_union', JURY: 'c3_jury', HELIX: 'c3_helix', RAZOR: 'c3_razor', SPEAR: 'c3_spear', VECTOR: 'c3_vector', GRID: 'c3_grid' };
        return map[s.div] || 'c3_union';
      },
      text: [],
    },
    c3_2_done: {
      safe: true,
      enter: (s) => {
        if (s.c3.stage === 2) {
          s.c3.stage = 3;
          s.c3.next = s.day;
        }
        return 'u_duty_end';
      },
      text: [],
    },

    /* UNION — the Stack 9 raid, under an Overwatch lens */
    c3_union: {
      title: 'Stack 9 — with Overwatch',
      text: [
        '@img assets/img/env/e22-ptv-night.webp|PT-V D5-07 outside Stack 9',
        '@dispatch Task Force LOCK, UNION element: warrant, Stack 9, flat 3C. Suspected relay operator for the canal frequencies. Overwatch will observe.',
        'An Overwatch soldier walks up the stairwell behind you. It does not need the handrail. It does not need anything. It stops on the landing and watches you with its slit, and you understand that today the raid is not what is being examined.',
      ],
      choices: [
        {
          t: 'Serve the warrant.',
          fx: (s) => {
            s.raid = G.makeRaid(s, { claim: 'radio', guilty: Math.random() < 0.8, addr: 'Stack 9, flat 3C' });
            s.raid.ret = 'c3_union_after';
            s.raid.c3 = true;
            return null;
          },
          go: 'raid_start',
        },
      ],
    },
    c3_union_after: {
      title: 'Stack 9 — the landing',
      enter: (s) => {
        const r = s.raid;
        s.mem.c3radio = !!(r && r.found.some((f) => f.id === 'transmitter' && !f.planted));
        if (s.mem.c3radio) s.c3.intel += 2;
        s.mem.c3fake = !!(r && r.planted);
      },
      text: (s) => [
        s.mem.c3radio ? 'The Overwatch soldier takes the transmitter out of your hands, turns it over once, and reads the frequency off the dial in a burst of clicks. Somewhere in the Nexus, a map gets a new pin.' : 'The Overwatch soldier looks at the empty evidence pouch, then at you, for a long time.',
        s.mem.c3fake ? 'It does not look at the leaflets at all. You are not sure whether that is better.' : null,
        '@radio Stack 9 element, LOCK. Acknowledged. Return to precinct.',
      ],
      choices: [{ t: 'End of shift.', go: 'c3_2_done' }],
    },

    /* JURY — a courier from the canals */
    c3_jury: {
      title: 'Level 4 — a courier',
      enter: (s) => {
        G.unlock(s, 'interrogation');
        G.startIq(
          s,
          {
            name: 'Marek Dusil',
            desc: 'a canal boatman caught at the D3 locks with a sealed ration tin full of wire and a hand-drawn map of the dam',
            guilty: !s.c3.betray || Math.random() < 0.7,
            knows: 'the map is for pump house 2, and the night is the night the relocation train leaves the yards',
            hard: 3,
          },
          'c3_jury_after'
        );
      },
      text: [
        '@img assets/img/env/e07-level4.webp|Level 4',
        'The Magistrate brings the file down himself, which he never does. There is an Overwatch soldier standing in the corner of the interrogation room. It was not asked.',
        '@say Magistrate|Three cycles. Overwatch would like to see how JURY works. Show them, three — or show them nothing at all.',
      ],
      choices: [{ t: 'Go in.', go: 'iq_round' }],
    },
    c3_jury_after: {
      title: 'Level 4 — after',
      enter: (s) => {
        const r = s.iq.result;
        if (r === 'true') s.c3.intel += 2;
        if (r === 'false') s.c3.intel -= 1;
      },
      text: (s) => {
        const r = s.iq.result;
        return [
          r === 'true' ? 'The map is real. Pump house 2. The night the train leaves. The Overwatch soldier in the corner transmits something in clicks the moment the subject says it.' : r === 'false' ? 'The confession names three pump houses, a mill and the Administrator’s broadcast. It is everything and therefore nothing. Overwatch files it as truth anyway, and sends men to the wrong places.' : 'Nothing. The Overwatch soldier leaves the room before you do.',
          '@say Magistrate|Overwatch writes faster than I do. That is a thing I never expected to say.',
        ];
      },
      choices: [{ t: 'End of shift.', fx: (s) => (s.iq.result === 'true' ? { merit: 4, lp: 2 } : { merit: 1 }), go: 'c3_2_done' }],
    },

    /* HELIX — a bombed ration terminal */
    c3_helix: {
      title: 'Plaza 5 — the RDT',
      text: [
        '@img assets/img/env/e10-ration.webp|Plaza 5',
        'Somebody packed a ration tin with nails and wedged it into hatch 4. Three units are down. So are eleven citizens, and a CWU worker from behind the wall who is holding her own arm on.',
        'You have one field kit, biogel for maybe three, and an Overwatch soldier at your shoulder relaying a single instruction in clicks: *units first. The CWU worker is to be preserved for questioning.*',
        'At your feet, a girl of about nine is very quiet in a way you were trained to recognise.',
      ],
      choices: [
        { t: 'Units first. Then the CWU worker. Protocol.', tag: 'PROTOCOL', tagCls: 'loyal', check: { skill: 'medical', diff: 5, pass: 'c3_helix_protocol', fail: 'c3_helix_protocol' } },
        { t: 'The girl. Now. Protocol can file a complaint.', tag: 'MERCY', tagCls: 'mercy', check: { skill: 'medical', diff: 10, pass: 'c3_helix_girl', fail: 'c3_helix_girl_bad' } },
        { t: 'The CWU worker first — she saw who did it.', check: { skill: 'medical', diff: 0, pass: 'c3_helix_cwu', fail: 'c3_helix_protocol' } },
      ],
    },
    c3_helix_protocol: {
      text: ['You work down the line the way the Nexus wants it. Three units live. The CWU worker lives long enough to be carried to Level 4. The girl is under a ration sack by the time you look again, and a block warden is writing her CID on a slate.', 'The Overwatch soldier transmits *efficient*.'],
      choices: [{ t: 'End of shift.', fx: { merit: 4, lp: 3, cons: -10, xp: { medical: 1 } }, go: 'c3_2_done' }],
    },
    c3_helix_girl: {
      text: ['You kneel in the glass and work on the girl with both hands and the whole kit. She comes back. She looks at your white band and asks if you are an angel, and you say no, and she says *oh* as if that were a disappointment.', 'Behind you, one of the units bleeds out waiting. The Overwatch soldier transmits your designation.'],
      choices: [{ t: 'End of shift.', fx: (s) => (G.discipline(s, 'minor', 'Triage order disregarded under sociostatus'), { cons: 12, res: 5, xp: { medical: 1 } }), go: 'c3_2_done' }],
    },
    c3_helix_girl_bad: {
      text: ['You kneel in the glass and work on the girl with both hands and the whole kit, and it is not enough. It was never going to be enough. You knew that. Behind you, one of the units bleeds out waiting.'],
      choices: [{ t: 'End of shift.', fx: (s) => (G.discipline(s, 'minor', 'Triage order disregarded under sociostatus'), { cons: 2, hp: -5 }), go: 'c3_2_done' }],
    },
    c3_helix_cwu: {
      text: ['You clamp the CWU worker’s arm and pump coagulant into her before Overwatch can object. She grabs your sleeve with her good hand.', '“A man with a lock key,” she says. “Pump house key. On a string round his neck. He laughed.”', 'The Overwatch soldier records every word. Two of the units die waiting. So does the girl.'],
      choices: [{ t: 'End of shift.', fx: (s) => ((s.c3.intel += 2), { merit: 3, cons: -6 }), go: 'c3_2_done' }],
    },

    /* RAZOR — the dam crest hardpoint */
    c3_razor: {
      title: 'The dam crest — hardpoint',
      text: [
        '@img assets/img/env/e21-damcrest.webp|The dam crest, broadcast at dawn',
        'The Administrator records a broadcast on the dam crest at dawn: the river behind, the Spire in the distance, a message to the city about *gratitude*. RAZOR holds the hardpoint.',
        'In the gold-banded line beside you stands an 03 from your own squadron, Sallow. His access card, clipped to his vest, is the wrong shade of white by a hair. You have stared at enough cards at Canal Gate 3 to know what a forged laminate looks like.',
      ],
      choices: [
        { t: 'Look again. Be sure before you ruin him.', check: { skill: 'perception', diff: 5, pass: 'c3_razor_sure', fail: 'c3_razor_unsure' } },
        { t: 'Say nothing. The broadcast is what matters.', go: 'c3_razor_quiet' },
      ],
    },
    c3_razor_sure: {
      text: ['It is forged: good work, Canal Quarter work, a lambda pressed into the laminate where only a lens can see it. Sallow sees you looking. He does not move. He just says, very quietly, *the train*, as if that were an explanation. Maybe it is.'],
      choices: [
        { t: 'Detain him on the crest, in front of the Administrator.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: (s) => ((s.c3.intel += 2), { merit: 6, lp: 4, cons: -6 }), go: 'c3_razor_detain' },
        { t: '“Take it off. Go home sick. I never saw it.”', tag: 'MERCY', tagCls: 'mercy', fx: { res: 8, cons: 5, susp: 3 }, go: 'c3_razor_spare' },
      ],
    },
    c3_razor_unsure: {
      text: ['The light is wrong, the wind is in your lenses, the Administrator is speaking. You cannot be sure. You let it go. Later you will wonder whether you wanted to be sure.'],
      choices: [{ t: 'End of shift.', go: 'c3_2_done' }],
    },
    c3_razor_quiet: {
      text: ['The Administrator thanks the city for its patience. The river roars. Sallow stands beside you the whole time and never once looks at you.'],
      choices: [{ t: 'End of shift.', go: 'c3_2_done' }],
    },
    c3_razor_detain: {
      text: ['You take his arm. The broadcast does not stop; the Administrator does not even glance down. Sallow goes to Level 4 with the card still clipped to his vest. By evening there is a map pin on pump house 2.'],
      choices: [{ t: 'End of shift.', go: 'c3_2_done' }],
    },
    c3_razor_spare: {
      text: ['Sallow peels the card off, folds it twice and swallows it, right there on the crest with the Administrator talking about gratitude. Then he coughs, and asks to be relieved for illness. You sign the slip.'],
      choices: [{ t: 'End of shift.', go: 'c3_2_done' }],
    },

    /* SPEAR — the tunnels */
    c3_spear: {
      title: 'Under the spillway — the old drains',
      text: [
        'SPEAR goes down into the drains under the eastern canal with lamps and shotguns. Overwatch does not come. Overwatch considers the drains beneath its notice, the way it considers you.',
        'Two hundred metres in, something that used to be a man comes at your lamp out of a side culvert, and your squad leader puts it down. Three hundred metres in, you find chalk on the wall at knee height: small lambdas, each with an arrow, leading up toward the dam.',
      ],
      choices: [
        { t: 'Photograph every mark for Overwatch.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: (s) => ((s.c3.intel += 2), { merit: 4, lp: 2 }), go: 'c3_spear_mark' },
        { t: 'Scuff the arrows out as you pass. Point them at a dead end.', tag: 'RESISTANCE', tagCls: 'mercy', check: { skill: 'deception', diff: 10, pass: 'c3_spear_erase', fail: 'c3_spear_erase_bad' } },
        { t: 'Push on to the end of the route, whatever is there.', check: { skill: 'fitness', diff: 10, pass: 'c3_spear_deep', fail: 'c3_spear_hurt' } },
      ],
    },
    c3_spear_mark: { text: ['Your lens takes forty-one photographs of chalk. Somewhere above you, a map gets an arrow of its own, pointing at the dam.'], choices: [{ t: 'End of shift.', go: 'c3_2_done' }] },
    c3_spear_erase: { text: ['You drag your glove through each lambda as you pass and redraw three arrows, very quickly, toward a collapsed culvert. Nobody in your squad looks at the wall. Nobody in your squad ever looks at walls.'], choices: [{ t: 'End of shift.', fx: { res: 10, cons: 3, susp: 2 }, go: 'c3_2_done' }] },
    c3_spear_erase_bad: {
      text: ['Your squad leader’s lamp catches your glove halfway through a lambda.', '@say SPEAR DvL|Cleaning up after them, three?'],
      choices: [{ t: 'End of shift.', fx: (s) => (G.discipline(s, 'serious', 'Defacing anticitizen route markings before documentation'), { susp: 6 }), go: 'c3_2_done' }],
    },
    c3_spear_deep: { text: ['The arrows end at a steel hatch in the dam’s foundations, freshly greased, with a padlock that is not Union issue. Pump house 2 is directly above it.'], choices: [{ t: 'End of shift.', fx: (s) => ((s.c3.intel += 3), { merit: 5, xp: { fitness: 1 } }), go: 'c3_2_done' }] },
    c3_spear_hurt: { text: ['A culvert collapses under your boots and the river takes you twenty metres before your squad gets a rope on you.'], choices: [{ t: 'End of shift.', fx: { hp: -20, merit: 1 }, go: 'c3_2_done' }] },

    /* VECTOR — the sealed culvert */
    c3_vector: {
      title: 'Culvert 9 — decontamination',
      text: [
        'VECTOR is sent to seal culvert 9 under the spillway: an infested drain the canal cells have been using as a road. Sealed suits, twin filters, incinerator wands, foam.',
        'Halfway down the culvert your lamp finds a family. A man, a woman, two children, sitting on a ledge above the waterline with their knees pulled up. Their CIDs are on tomorrow’s relocation list. The man has a cough you recognise, from the files, as early infection.',
        '@say VECTOR DvL|*(over the suit radio)* Anything biological in culvert 9 is to be treated as infested. That is the order. That is all the order says.',
      ],
      choices: [
        { t: 'Report them. Let the order decide.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: (s) => ((s.c3.intel += 1), { merit: 4, lp: 3, cons: -14 }), go: 'c3_vector_report' },
        { t: 'Take them out through the old service hatch. Log the culvert as clear.', tag: 'MERCY', tagCls: 'mercy', check: { skill: 'deception', diff: 10, pass: 'c3_vector_save', fail: 'c3_vector_caught' } },
        { t: 'Treat the man. Biogel and a filter mask. Then decide.', check: { skill: 'medical', diff: 10, pass: 'c3_vector_treat', fail: 'c3_vector_report' } },
      ],
    },
    c3_vector_report: { text: ['You key the report. You do not watch the rest. The foam goes in after you come out, and the culvert is sealed, and the log says clear.'], choices: [{ t: 'End of shift.', go: 'c3_2_done' }] },
    c3_vector_save: { text: ['You walk them out through a hatch nobody has opened since the war and leave them in a pump room with your spare filter. The woman says the name of a lock and a time: *pump house 2, when the lights go*. Then they are gone.'], choices: [{ t: 'End of shift.', fx: (s) => ((s.mem.c3vec = true), { res: 10, cons: 8, susp: 3 }), go: 'c3_2_done' }] },
    c3_vector_caught: {
      text: ['You are halfway to the service hatch when your DvL’s lamp comes round the bend of the culvert.'],
      choices: [{ t: 'End of shift.', fx: (s) => (G.discipline(s, 'serious', 'Concealing biological contacts during decontamination'), { susp: 8, cons: 3 }), go: 'c3_2_done' }],
    },
    c3_vector_treat: {
      text: ['The cough is not infection. It is the river and the cold. You could write that down. The order says *anything biological*. You write down the truth, and the truth goes up the chain, and the family goes to the train instead of the foam, which is the best thing you can do for them today.'],
      choices: [{ t: 'End of shift.', fx: { merit: 2, cons: 4, xp: { medical: 1 } }, go: 'c3_2_done' }],
    },

    /* GRID — junction 7 */
    c3_grid: {
      title: 'Conduit junction 7 — inside the dam',
      text: [
        '@img assets/img/env/e20-junction.webp|Junction 7',
        'Junction 7 is a vault inside the dam where the conduit to the Spire crosses the river: a trunk of cable as thick as a tram, humming so loudly you feel it in your teeth. GRID inspects it every week. This week, Overwatch watches the inspection.',
        'Behind an access panel, taped to the cable sheath where only an engineer would look, you find a flat grey box with a clock in it, and a wire, and very neat soldering. Somebody with burned fingertips did that soldering.',
      ],
      choices: [
        { t: 'Make it safe and hand it to Overwatch.', tag: 'BY THE BOOK', tagCls: 'loyal', check: { skill: 'comms', diff: 5, pass: 'c3_grid_defuse', fail: 'c3_grid_burn' } },
        { t: 'Close the panel. Log junction 7 as nominal.', tag: 'RESISTANCE', tagCls: 'mercy', check: { skill: 'deception', diff: 10, pass: 'c3_grid_leave', fail: 'c3_grid_caught' } },
        { t: 'Cut one wire. It will look armed and never fire. Tell no one.', tag: 'DOUBLE GAME', tagCls: 'risk', check: { skill: 'comms', diff: 15, pass: 'c3_grid_dud', fail: 'c3_grid_burn' } },
      ],
    },
    c3_grid_defuse: { text: ['You lift the clock out of the circuit with a pair of insulated pliers and your heart in your mouth. The Overwatch soldier takes the box from you like a man taking a cup of tea.'], choices: [{ t: 'End of shift.', fx: (s) => ((s.c3.intel += 3), (s.c3.device = 'found'), { merit: 6, lp: 3 }), go: 'c3_2_done' }] },
    c3_grid_burn: { text: ['Something arcs. The vault goes white, then dark, then white again, and you are on your back with your gloves smoking. The device is a melted lump. Nobody will ever know what it was meant to do.'], choices: [{ t: 'End of shift.', fx: (s) => ((s.c3.device = 'burned'), { hp: -18, merit: 2 }), go: 'c3_2_done' }] },
    c3_grid_leave: { text: ['You close the panel, tighten every screw to torque, and log junction 7 as nominal. The Overwatch soldier watches your hands the whole time. Your hands do not shake. You will think about that later.'], choices: [{ t: 'End of shift.', fx: (s) => ((s.c3.device = 'left'), { res: 15, susp: 4 }), go: 'c3_2_done' }] },
    c3_grid_caught: {
      text: ['You reach for the panel. The Overwatch soldier’s gauntlet gets there first. It opens the panel again, very slowly, and looks inside.'],
      choices: [{ t: 'End of shift.', fx: (s) => ((s.c3.device = 'found'), (s.c3.intel += 2), G.discipline(s, 'serious', 'Failure to report a device on the Spire conduit'), { susp: 10 }), go: 'c3_2_done' }],
    },
    c3_grid_dud: { text: ['One wire, behind the clock, where only someone who knew would ever look. The box will tick all night and do nothing. Both sides will think it was theirs that failed.'], choices: [{ t: 'End of shift.', fx: (s) => ((s.c3.device = 'dud'), { merit: 1, xp: { comms: 1 } }), go: 'c3_2_done' }] },

    /* ================================================== STAGE 3 — screening */
    c3_3: {
      title: 'Biosignal screening — Nexus, level 2',
      enter: (s) => {
        s.c3.sq = 0;
        s.c3.sfail = 0;
        G.unlock(s, 'screening');
      },
      text: (s) => [
        'Every unit on Task Force LOCK is screened before the night. You sit in a steel chair with a cable clipped to the implant at the base of your skull. An Overwatch soldier stands behind the chair. A JURY clerk sits at the desk and reads your heart rate off a screen you cannot see.',
        s.div === 'JURY' ? 'The clerk is from your own floor. She does not look at you.' : null,
        secrets(s) ? 'You have things to hide. Your heart knows it before you do: the clerk taps the screen once, and writes.' : 'You have nothing to hide. That has never once made a screening feel shorter.',
      ],
      choices: [{ t: 'Begin.', go: 'c3_3_q' }],
    },
    c3_3_q: {
      title: (s) => `Screening — question ${s.c3.sq + 1} / 3`,
      text: (s) => {
        const q = s.c3.sq;
        if (q === 0) return ['@say Overwatch|*(through the clerk’s speaker)* Your heart rate rose eleven beats when the Commander said *long night*. Explain.'];
        if (q === 1) return ['@say Overwatch|Name a citizen of District 5 you would amputate tonight without a verdict.'];
        return secrets(s) ? ['@say Overwatch|A canal contact was observed within forty metres of your residence block on two evenings this week. Explain.'] : ['@say Overwatch|Would you discharge your weapon at a unit of your own division on Overwatch command?'];
      },
      choices: (s) => {
        const q = s.c3.sq;
        const sec = secrets(s);
        const next = (st) => (st.c3.sq < 3 ? 'c3_3_q' : 'c3_3_end');
        const step = (fx) => (st) => {
          st.c3.sq += 1;
          return typeof fx === 'function' ? fx(st) : fx || null;
        };
        const fail = (st) => ((st.c3.sfail += 1), null);
        if (q === 0)
          return [
            { t: '“Fatigue. Three double shifts.”', fx: step(), check: { skill: 'deception', diff: sec ? 10 : -20, pass: next, fail: next, failFx: fail } },
            { t: '“I have family in District 5.”', fx: step({ cons: 2 }), check: { skill: 'authority', diff: miraHere(s) ? 0 : 15, pass: next, fail: next, failFx: fail } },
            { t: 'Say nothing. Let the screen talk.', fx: (st) => (step()(st), sec ? fail(st) : null), go: next },
          ];
        if (q === 1) {
          const asset = (s.inf ? s.inf.list : []).find((x) => x.status === 'active');
          const hot = Object.values(s.files || {}).filter((f) => !f.amputated).sort((a, b) => b.points - a.points)[0];
          return [
            hot ? { t: `Give the highest file you know: CID ${hot.cid}, ${Math.min(19, hot.points)} points.`, fx: step({ lp: 2, cons: -6 }), go: next } : null,
            asset ? { t: `Give them your asset: ${asset.name}. Prove you hold nothing back.`, tag: 'BURN', tagCls: 'risk', fx: step((st) => ((asset.status = 'dead'), (st.c3.intel += 1), { lp: 4, cons: -12 })), go: next } : null,
            { t: '“No citizen. A verdict is what separates us from them.”', fx: step(), check: { skill: 'authority', diff: 10, pass: next, fail: next, failFx: fail } },
          ].filter(Boolean);
        }
        if (sec)
          return [
            { t: '“My block has four hundred residents. Forty metres is a stairwell.”', fx: step(), check: { skill: 'deception', diff: s.flags.mole || s.c3.promise ? 15 : 5, pass: next, fail: next, failFx: fail } },
            { t: '“I was running an asset. It is in my reports.”', fx: step(), check: { skill: 'comms', diff: 10, pass: next, fail: next, failFx: fail } },
          ];
        return [
          { t: '“Yes.”', fx: step({ lp: 3, cons: -4 }), go: next },
          { t: '“If the order was lawful.”', fx: step(), check: { skill: 'authority', diff: 5, pass: next, fail: next, failFx: fail } },
        ];
      },
    },
    c3_3_end: {
      enter: (s) => {
        const f = s.c3.sfail;
        s.c3.flagged = f >= 2 || (f >= 1 && secrets(s) && s.susp >= 50);
        G.fx(s, { susp: f * 4 + (s.c3.flagged ? 6 : 0) });
        s.c3.stage = 4;
        s.c3.next = s.day + 1;
      },
      text: (s) => [
        'The cable comes out of your neck with a sound like a stamp.',
        s.c3.flagged ? 'The clerk writes for a long time. Then she peels a small red sticker off a sheet and presses it onto the back of your file, where you can see it. On the night, an Overwatch soldier will be assigned to your post. Not to the post. To you.' : s.c3.sfail ? 'The clerk writes a line and closes the file. Not a red sticker. Not nothing, either.' : 'The clerk closes the file without writing anything. That is the best a screening ever goes.',
        '@sys The long night is tomorrow.',
      ],
      choices: [{ t: 'Go home.', go: 'u_night' }],
    },

    /* ================================================== STAGE 4 — the long night */
    c3_4: {
      checkpoint: true,
      title: 'The long night',
      enter: (s) => {
        s.time = 'Night';
        s.c3.watched = s.c3.flagged;
      },
      text: (s) => {
        const intel = s.c3.intel;
        return [
          '@img assets/img/env/e13-pumphouse.webp|Pump house 2, the spillway',
          'The day goes in briefings and checks of kit nobody needs to check. Nobody eats much.',
          `At 21:40 you take your post at ${post(s)}. The relocation train is lit up in the D4 yards across the river like a long, patient animal. The Spire hums. The dam roars. High over the river a Shrike gunship circles, its searchlight sweeping the water, the spillway, your post, and moving on.`,
          '@img assets/img/env/e23-shrike-stacks.webp|The Shrike over the Stacks, 21:50',
          s.c3.watched ? 'An Overwatch soldier takes position four metres behind you and does not move again. Your red sticker, it seems, has a body.' : null,
          intel >= 5
            ? 'Overwatch knows everything: the pump house, the hatch, the time. There are soldiers in the dark on both banks with their slits dimmed, waiting. Whoever comes through that door tonight is walking into a closed fist.'
            : intel >= 2
            ? 'Overwatch knows some of it. Patrols on the spillway, a squad at the yards. Not enough to close every door. Enough to make the night expensive.'
            : 'Overwatch knows almost nothing. The task force is spread thin across the city, guarding mills and broadcast screens. The spillway has you.',
          s.c3.device === 'dud' ? 'Somewhere inside the dam, a grey box is ticking toward nothing.' : null,
          'At 23:58 a pump house door you have been told not to watch opens. Shapes come out of it, low and fast, carrying something heavy between them.',
          s.c3.who && s.c3.approach ? `One of them is ${s.c3.who.name}. You would know that walk anywhere.` : null,
        ];
      },
      choices: (s) => {
        const list = [
          { t: 'Hold your post. Stop them.', tag: 'LOYAL', tagCls: 'loyal', go: 'c3_hold' },
          (s.c3.promise || s.res >= 30) && s.c3.device !== 'found'
            ? { t: s.c3.promise ? 'Keep your promise. Turn your back for ten minutes.' : 'Turn your back. Let the night happen.', tag: 'RESISTANCE', tagCls: 'mercy', check: { skill: 'deception', diff: s.c3.watched ? 25 : 5, pass: 'c3_open', fail: 'c3_open_caught' } }
            : null,
          { t: 'Fire a flare and call a false contact on the far bank. Scatter everyone.', tag: 'NEITHER', tagCls: '', check: { skill: 'comms', diff: s.c3.watched ? 15 : 5, pass: 'c3_warn', fail: 'c3_warn_bad' } },
          miraHere(s) && !s.flags.mira_saved ? { t: 'Leave the post. Mira is on night shift at the mill, and the mill is where Overwatch will sweep.', tag: 'DESERT POST', tagCls: 'risk', go: 'c3_leave' } : null,
          s.flags.mira_saved ? { t: 'Leave the post. Mira lives under a JURY hold that does not exist; tonight someone will check it.', tag: 'DESERT POST', tagCls: 'risk', go: 'c3_leave' } : null,
        ];
        return list.filter(Boolean);
      },
    },
    c3_hold: {
      text: (s) => [
        '@say You|Civil Protection! Drop it! *Drop it!*',
        s.c3.intel >= 5 ? 'You barely finish the word before the far bank lights up, and the Shrike drops out of the dark over the spillway with its chin turret already turning. Overwatch was always going to do this part. Your part was to be standing here when it did.' : 'They do not drop it. Somebody fires first; it does not matter who. You go forward into it.',
      ],
      choices: (s) => [
        {
          t: s.div === 'HELIX' ? 'Go in low and pull the wounded out of the line of fire — theirs and ours.' : 'Fight for the door.',
          check: { skill: s.div === 'HELIX' ? 'medical' : s.div === 'GRID' ? 'comms' : s.div === 'JURY' ? 'authority' : 'firearms', diff: s.c3.intel >= 5 ? -10 : s.c3.intel >= 2 ? 5 : 15, pass: 'c3_hold_win', fail: 'c3_hold_hurt' },
        },
      ],
    },
    c3_hold_win: {
      enter: (s) => {
        s.c3.result = 'held';
      },
      text: (s) => [
        'It is over in under four minutes. The heavy thing they carried is a charge with a clock and a wire, and it never reaches the conduit. The Spire hums on over the river, untroubled.',
        s.c3.who && s.c3.approach ? (s.c3.intel >= 5 ? `${s.c3.who.name} is on the spillway with the others. Overwatch does not take prisoners on the spillway.` : `${s.c3.who.name} is kneeling in the spray, hands on head, looking at you. Not at your mask. At you.`) : 'Five bodies on the spillway, two in custody. None of the faces mean anything to you. That is something.',
        'Across the river, the relocation train pulls out of the D4 yards on time.',
      ],
      choices: [{ t: 'Dawn.', fx: { merit: 10, lp: 6, cons: -10, res: -30 }, go: 'c3_5' }],
    },
    c3_hold_hurt: {
      enter: (s) => {
        s.c3.result = 'held';
      },
      text: ['Something hits you in the chest plate and you sit down in the spray without deciding to. By the time you are up, it is over: Overwatch on the spillway, the charge in a squad leader’s hands, the conduit humming. Across the river the train leaves on time.'],
      choices: [{ t: 'Dawn.', fx: { merit: 6, lp: 4, hp: -30, cons: -6, res: -20 }, go: 'c3_5' }],
    },
    c3_open: {
      enter: (s) => {
        s.c3.result = 'open';
      },
      text: (s) => [
        'You turn and look at the river. You count. You make yourself count slowly.',
        s.c3.device === 'left' ? 'At four hundred, junction 7 goes off inside the dam with a sound like a door slamming in the next street, and every light in City 9 goes out at once.' : 'At five hundred and ten, the pump house shudders, and every light in City 9 goes out at once.',
        'The Spire goes dark over the river for the first time since the war. Without its hum the dam sounds different: just water. The Shrike swings hard toward the yards, its searchlight the only light left in the city, and it is still turning when the fields fall. Across the river, the forcefields at the D4 yards collapse with a sigh you can hear from here, and then there are torches running along the train, and doors opening, and people.',
        'When the emergency lighting comes back, eleven minutes later, there is nobody on the spillway but you. The Overwatch soldiers on the far bank are moving toward the yards, too late.',
      ],
      choices: [{ t: 'Dawn.', fx: { res: 30, cons: 12, susp: 8 }, go: 'c3_5' }],
    },
    c3_open_caught: {
      enter: (s) => {
        s.c3.result = 'caught';
        G.discipline(s, 'grave', 'Collaboration: abandoned a sociostatus post to admit anticitizens to the dam', 'collab');
      },
      text: (s) => [
        'You turn your back on the pump house. A gauntlet closes on your shoulder from behind.',
        s.c3.watched ? 'The Overwatch soldier with your red sticker has been four metres away all night. It is not four metres away now.' : 'Overwatch was on the bank all along. You simply never saw it.',
        'The spillway lights up. The people from the pump house never reach the conduit. Neither, in the end, do you reach morning as a Protection Unit.',
      ],
      choices: [{ t: 'They take you down to level 4.', go: 'disc_tribunal' }],
    },
    c3_warn: {
      enter: (s) => {
        s.c3.result = 'warned';
      },
      text: ['The flare goes up red over the far bank and you shout a contact into the radio that does not exist. Every Overwatch slit on the spillway turns away from the pump house. The shapes at the door freeze, then vanish back inside it.', 'Nobody dies at the spillway tonight. Nobody stops a train, either. In the morning, both sides will want to know who fired the flare.'],
      choices: [{ t: 'Dawn.', fx: { cons: 6, susp: 5, xp: { comms: 1 } }, go: 'c3_5' }],
    },
    c3_warn_bad: {
      enter: (s) => {
        s.c3.result = 'held';
        G.discipline(s, 'serious', 'False contact report during sociostatus');
      },
      text: ['The flare goes up. Nobody believes it. The Overwatch soldiers on the bank do not even turn their heads. The shapes from the pump house walk straight into the lights.'],
      choices: [{ t: 'Dawn.', fx: { cons: -4, merit: 2, res: -15 }, go: 'c3_5' }],
    },
    c3_leave: {
      enter: (s) => {
        s.c3.result = 'left';
        G.discipline(s, 'serious', 'Abandoned post during sociostatus');
      },
      text: (s) => [
        'You walk away from the spillway. Then you run.',
        s.flags.mira_saved
          ? 'A JURY van is outside Stack 14 when you get there, doors open. You walk up to it with your designation on your shoulder and say *material witness, my hold*, and this time you say it in the voice of someone who will not move. They check nothing. Tonight, nobody has time to check anything.'
          : 'The mill is already being swept when you get there, Overwatch going down the looms with lamps. You find Mira under a dye vat, pull her out by the collar like a detainee, and walk her past the soldiers saying *mine, mine, JURY hold*. Tonight, nobody has time to check anything.',
        'Behind you, across the city, the night happens without you, however it happens.',
      ],
      choices: [{ t: 'Dawn.', fx: { rel: { mira: 25 }, cons: 8, susp: 6 }, go: 'c3_5' }],
    },

    /* ================================================== STAGE 5 — aftermath */
    c3_5: {
      title: 'The morning after',
      enter: (s) => {
        s.time = 'Morning';
        s.day++;
        const r = s.c3.result;
        if (r === 'left') s.c3.reprisal = s.c3.intel < 2;
        else s.c3.reprisal = r === 'open';
      },
      text: (s) => {
        const r = s.c3.result;
        return [
          r === 'open' || (r === 'left' && s.c3.intel < 2)
            ? 'The Spire was dark for eleven minutes. In the D4 yards, the relocation train stands open and empty except for two Overwatch soldiers counting the bodies of the ones who did not run fast enough. Two hundred and sixty-one people are somewhere in the canals.'
            : r === 'warned'
            ? 'The night came and went. The conduit is intact. The train left on time. And Task Force LOCK has spent the morning asking every unit on the spillway about a red flare.'
            : 'The conduit is intact. The train left on time. The Commander’s report calls the night *a demonstration of what Civil Protection is for*.',
          s.c3.reprisal ? '@dispatch Sociostability failure in District 3 and District 5. Reprisal is authorised. Civil Protection will administer. Overwatch will observe.' : null,
        ];
      },
      choices: (s) => (s.c3.reprisal ? [{ t: 'Report to Plaza 5.', go: 'c3_reprisal' }] : [{ t: 'Report to the Commander.', go: 'c3_6' }]),
    },
    c3_reprisal: {
      title: 'Plaza 5 — reprisal',
      text: [
        'They have emptied Stack 9 and Stack 14 into the plaza. A hundred citizens stand in ten rows under the broadcast screens. The screens show a slow, beautiful film of the dam.',
        'An Overwatch soldier walks you to the front row and clicks a single instruction, which your mask translates into flat Union speech: *one in ten. Civil Protection selects. Civil Protection administers.*',
        'Behind you, Vigil watches from the steps of the old cinema with hands folded behind the back.',
      ],
      choices: (s) => [
        { t: 'Let the files choose. The ten highest penalty counts.', tag: 'PROCEDURE', tagCls: 'loyal', fx: { lp: 4, cons: -25, merit: 3 }, go: 'c3_rep_files' },
        { t: 'Walk the rows and choose with your own eyes.', fx: { cons: -30, lp: 2 }, go: 'c3_rep_eyes' },
        { t: 'Turn to the Commander. “Commander. This is not proportional.”', tag: 'REFUSE', tagCls: 'risk', check: { skill: 'authority', diff: s.flags.vigil_noticed ? 5 : 20, pass: 'c3_rep_spared', fail: 'c3_rep_overruled' } },
      ],
    },
    c3_rep_files: {
      text: ['You stand in front of each row with your slate and read the highest number out loud. Your voice does it. You listen to your voice do it. Ten people walk to the cinema wall.', 'Afterwards, the plaza is very quiet, and the film of the dam goes on.'],
      choices: [{ t: 'Report to the Commander.', go: 'c3_6' }],
    },
    c3_rep_eyes: {
      text: ['You walk the rows. You look at faces. You find that you can tell which ones would forgive you and which ones would not, and you choose the ones who would not, and you will never be able to explain to anyone why that seemed fairer.'],
      choices: [{ t: 'Report to the Commander.', go: 'c3_6' }],
    },
    c3_rep_spared: {
      text: ['The plaza waits. Vigil comes down the cinema steps, one at a time, and stands beside you, and looks at the rows.', '@say Vigil|Proportional. Yes. The Protection Unit is correct. The reprisal is administered to the pump house crew already in custody, and to no one in this plaza.', 'The Overwatch soldier clicks something long. Vigil does not answer it. The citizens are sent home. Many of them look back at you on the way out. You do not know what their faces mean.'],
      choices: [{ t: 'Report to the Commander.', fx: { cons: 10, merit: 2, susp: 6, flag: { vigil_noticed: true }, rel: { vigil: 10 } }, go: 'c3_6' }],
    },
    c3_rep_overruled: {
      text: ['Vigil does not move from the cinema steps. The Overwatch soldier puts a gauntlet on your shoulder and turns you back to the rows.', 'Another unit does the choosing. You stand beside it, because you were ordered to.'],
      choices: [{ t: 'Report to the Commander.', fx: (s) => (G.discipline(s, 'minor', 'Questioned a reprisal order under sociostatus'), { cons: 4, susp: 8 }), go: 'c3_6' }],
    },

    c3_6: {
      title: 'The Commander’s office',
      enter: (s) => {
        const r = s.c3.result;
        const ok = r !== 'left' && s.susp < 75 && !(r === 'open' && s.c3.watched);
        s.c3.pass = ok;
        if (ok) {
          const i = G.rankIdx(s.rank);
          if (i < G.rankIdx('01')) {
            G.promote(s, G.RANKS[i + 1]);
            G.fx(s, { merit: 8, lp: 3 });
          }
        }
        s.c3.done = true;
        s.c3.stage = 5;
      },
      text: (s) => {
        const r = s.c3.result;
        return [
          'Vigil’s office is on the top floor of the Nexus and has no chair for visitors. The Commander stands at a window that looks at the Spire.',
          '@portrait assets/img/portraits/vigil.webp|Field Commander Vigil',
          r === 'held'
            ? '@say Vigil|You stood where you were put and did what you were for. Overwatch has noted it. So have I. Those are not the same thing.'
            : r === 'open'
            ? '@say Vigil|Eleven minutes. Somebody on the spillway looked away. Overwatch believes it was one of the dead. I have decided to believe Overwatch.'
            : r === 'warned'
            ? '@say Vigil|A flare. Nobody dead, nothing gained, everyone embarrassed. I have read the reports of everyone on that spillway, Protection Unit. Yours is the most interesting.'
            : '@say Vigil|You left your post during sociostatus. I know why. I do not care why. Your file will carry it.',
          s.c3.pass ? `@doc PROMOTION: ${G.desig(s)}` : '@sys Promotion withheld.',
          s.c3.pass && s.rank === '01' ? 'Your 01 stripe comes with an MP7 from the armoury cage, signed out to your designation permanently. The clerk counts the rounds in twice, the way he does for everyone now.' : null,
        ];
      },
      choices: [{ t: 'Continue.', go: 'c3_end' }],
    },

    c3_end: {
      checkpoint: true,
      title: 'End of Chapter Three',
      text: (s) => {
        const r = s.c3.result;
        const w = s.c3.who;
        return [
          r === 'open' ? 'Two hundred and sixty-one names are struck off the relocation list as *expired*. Some of them are. Most of them are somewhere under the city, learning to live without rations.' : r === 'held' ? 'The canal cells go quiet. For a week there is no new chalk anywhere in District 3. Then, one morning, there is a single lambda on the precinct door, very small, at the height of a child.' : r === 'warned' ? 'Both sides are a little more afraid of the spillway than they were. Nobody knows that you are the reason. Nobody will, unless you tell them.' : 'Mira sleeps in Stack 14. You do not sleep at all.',
          w && s.c3.approach && r === 'held' ? `${w.name} does not come to Bazaar Row again. ${s.c3.intel >= 5 ? 'You know why.' : 'You do not let yourself find out why.'}` : null,
          w && s.c3.approach && r === 'open' ? `A ration wrapper is pushed under your barracks door one night. On the inside, in pencil: *ten minutes. thank you. — ${w.name === 'The Tinker' ? 'T' : w.name[0]}*. You burn it in the stove.` : null,
          'Sociostatus is not lifted. Overwatch stays in the precinct yards. The curfew stays at 20:00.',
          '@radio …relayed from City 17, all cities: sociostability failure across the canal sectors. Overwatch requests Civil Protection reserves for transfer. Volunteers to be named by squadron leaders…',
          s.div === 'UNION' ? 'Granite reads the request twice and puts it face down on his desk.' : s.div === 'JURY' ? 'The Magistrate reads the request twice and files it under a letter you cannot see.' : 'Your squadron leader reads the request aloud at muster. Nobody volunteers. Nobody is surprised.',
          `@doc ${G.desig(s)}\nDIVISION: ${s.div}\nRANK: ${G.RANK_NAMES[s.rank].toUpperCase()}\nDAYS IN SERVICE: ${s.day}`,
          '@sys CHAPTER THREE COMPLETE. You can keep serving on the duty board. Chapter Four is coming.',
        ];
      },
      choices: [{ t: 'Return to duty.', go: 'u_duty_end' }],
    },

    /* ================================================== sociostatus duty */
    c3_sweep: {
      title: 'Curfew sweep — D5, 21:00',
      text: [
        '@img assets/img/env/e23-shrike-stacks.webp|AW-S 09-2 over the Stacks',
        'You walk Bazaar Row after curfew beside an Overwatch squad. The shutters are all down. The squad moves the way water moves, without talking.',
        'In a doorway you find a boy of perhaps twelve with a ration bag and a ration card that is not his. The squad leader’s slit turns toward him, then toward you. It clicks. Your mask translates: *Civil Protection: process.*',
      ],
      choices: [
        { t: 'Process him by the book. Level 3 theft, curfew violation.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 3, lp: 2, cons: -5 }, go: 'c3_sweep_book' },
        { t: '“Mine. JURY wants this one.” Walk him round the corner and let him go.', tag: 'MERCY', tagCls: 'mercy', check: { skill: 'deception', diff: 15, pass: 'c3_sweep_free', fail: 'c3_sweep_caught' } },
        { t: 'Stand aside and let Overwatch process him.', fx: { cons: -10, lp: 1 }, go: 'c3_sweep_ow' },
      ],
    },
    c3_sweep_book: { text: ['You cuff him with the zip-ties from your belt and call a 10-91. He does not cry. Children in City 9 stopped crying at curfew stops years ago.'], choices: [{ t: 'End of shift.', go: 'u_duty_end' }] },
    c3_sweep_free: { text: ['Round the corner you cut the zip-tie and tell him to run, and he does, and you stand in the doorway for a moment listening to the squad not following you.'], choices: [{ t: 'End of shift.', fx: { cons: 6, res: 4, susp: 3 }, go: 'u_duty_end' }] },
    c3_sweep_caught: {
      text: ['Round the corner, an Overwatch soldier is already waiting. It takes the boy by the collar. It takes your designation.'],
      choices: [{ t: 'End of shift.', fx: (s) => (G.discipline(s, 'minor', 'Interference with an Overwatch curfew detention'), { susp: 5 }), go: 'u_duty_end' }],
    },
    c3_sweep_ow: { text: ['You step back. The squad leader steps forward. You do not watch. You hear it anyway.'], choices: [{ t: 'End of shift.', go: 'u_duty_end' }] },
    c3_sweep_r: {
      title: 'Curfew sweep — routine',
      text: (s) => [pick(['Three hours of empty streets and closed shutters. The squad does not speak to you once.', 'A man is caught on a roof after curfew. The squad deals with him before you reach the ladder.', 'You find a lambda chalked on a ration hatch and scrub it off while the squad watches you scrub.', 'A Shrike passes low over Bazaar Row. Every shutter on the street rattles. The squad does not look up, so neither do you.']), s.susp >= 50 ? 'The squad leader keeps you in front of it the whole night, never behind.' : null],
      choices: [{ t: 'End of shift.', fx: { merit: 2 }, go: 'u_duty_end' }],
    },
  });

  G.addCodex({
    sociostatus: {
      title: 'Sociostatus',
      body: `<p>When sociostability in a city fails, Overwatch may declare <b>sociostatus</b>. Under sociostatus, Overwatch holds command authority over most CCA personnel; curfew is set by Overwatch; Civil Protection may be assigned to joint task forces under an Overwatch-appointed commander.</p>
      <p>Reprisals under sociostatus are proportional by doctrine — the proportion is decided by Overwatch — and are administered by Civil Protection, so that citizens remember whose faces were in front of them.</p>`,
    },
    screening: {
      title: 'Biosignal screening',
      body: `<p>Before high-risk operations, every unit is screened: the biosignal implant is read directly while an Overwatch interviewer asks prepared questions. Heart rate, skin conductance and response latency are recorded against the unit's file.</p>
      <p>A unit that fails screening is not removed from duty. It is <b>accompanied</b>.</p>`,
    },
  });
})();
