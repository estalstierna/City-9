/* UNION SERVICE — the daily loop: duty board, duties, evenings, promotions, endings */
(function () {
  const BRIEFS = [
    'Sociostability in D5 is rated *amber*. Ration fraud is up four percent. Preserve, document, and do not let it reach five.',
    'Overwatch has a squad moving through D4 tonight. Stay off their channel and out of their way.',
    'Deservicement in D3 overnight — a unit found in the canal, biosignal cut at 02:14. Policide is Level 7. Somebody in the Canal Quarter is going to be amputated. Make sure it is the right somebody.',
    'The Administrator broadcasts at noon. Every screen in the district will be watched. By citizens, and by us.',
    'Lambda graffiti on Bazaar Row, six new marks overnight. Somebody is getting brave. Make them less brave.',
    'Relocation train departs D4 at 18:00. Two hundred citizens. Expect families at the gates. Expect tears. Do not expect to care.',
    'Dispatch reports a power fault in Stack 9. Citizens will blame us. Let them, quietly.',
  ];

  /* pick today's duty offers */
  function genOffers(s) {
    const pool = Object.keys(G.duties).filter((k) => {
      const d = G.duties[k];
      return !d.if || d.if(s);
    });
    // fresh duties first, then routine ones
    const fresh = G.shuffle(pool.filter((k) => !s.duty.done[k]));
    const old = G.shuffle(pool.filter((k) => s.duty.done[k]));
    const offers = fresh.slice(0, 2).concat(old).concat(fresh.slice(2)).slice(0, 3);
    s.duty.offers = G.shuffle(offers);
    s.duty.day = s.day;
    s.mem.brief = G.pick(BRIEFS);
  }

  function dueBeat(s, when) {
    for (const b of G.beats) {
      if (b.time !== when) continue;
      if (s.flags['beat_' + b.id]) continue;
      if (b.when(s)) {
        s.flags['beat_' + b.id] = true;
        return b.scene;
      }
    }
    return null;
  }

  G.addScenes({
    u_start: {
      title: 'District 5 Precinct — 06:00',
      enter: (s) => {
        s.phase = 'union';
        s.day = 1;
        s.time = 'Morning';
        s.rel.rook = s.rel.rook || 0;
        s.rel.granite = s.rel.granite || 0;
        ['terms', 'crimes', 'contraband', 'equipment'].forEach((c) => G.unlock(s, c));
      },
      text: (s) => [
        '@img assets/img/env/e09-precinct.jpg|District 5 Precinct, the old tram depot',
        'The District 5 precinct is a converted tram depot at the edge of the Stacks. The old rails still run through the floor of the muster hall, polished by boots. Twenty units in masks stand in loose rows under the strip lights, smoking through their filters, checking weapons, ignoring you.',
        'The squadron leader stands on a loading platform with a slate in one hand. Big. Slow-moving. A broad blue officer\'s stripe down the crown of his mask, scratched almost to grey. **CCA.C9.D5-UNION-SqL-11902.** The squadron calls him *Granite*, and when he speaks you understand why.',
        '@portrait assets/img/portraits/granite.jpg|CCA.C9.D5-UNION-SqL-11902 — "Granite"',
        '@say Granite|New fives. Welcome to D5. Forty thousand citizens. Twenty-two units. You can do the arithmetic. They outnumber us two thousand to one, and the only reason they don\'t tear us apart is that they believe we can\'t be torn.',
        '@say Granite|Don\'t ever let them stop believing it.',
        `He reads names — designations — off the slate. When he reaches yours he pauses. "${s.mem.grade}." His mask turns a few degrees toward you. You can\'t tell what he thinks of that.`,
        'You are paired with a field trainer for your first weeks: a lean, restless UNION 02 with a cracked left lens and a habit of tapping his stick against his thigh like a metronome. **CCA.C9.D5-UNION-02-48151.** He tells you to call him *Rook*.',
        '@portrait assets/img/portraits/rook.jpg|CCA.C9.D5-UNION-02-48151 — "Rook"',
        '@say Rook|Three rules. One: you don\'t take off the mask on the street, not even to scratch your nose. Two: you don\'t say a citizen\'s name out loud. Three: when I say run, you\'ve already been running for a second. Questions? Good. Board\'s over there.',
        '@img assets/img/uniform-union.jpg|UNION patrol uniform — your kit from today',
        '@sys Each day you choose a duty from the board. Duties earn merit, which unlocks your next field evaluation. Evenings are yours: rest, train, visit people, or go where you shouldn\'t.',
      ],
      choices: [{ t: 'Check the duty board.', fx: { rel: { rook: 5 } }, go: 'u_board' }],
    },

    u_board: {
      checkpoint: true,
      title: (s) => `Muster hall — Day ${s.day}`,
      enter: (s) => {
        s.time = 'Morning';
        if (s.duty.day !== s.day) genOffers(s);
        const b = dueBeat(s, 'morning');
        if (b) return b;
      },
      text: (s) => {
        const promo = G.PROMO[s.rank];
        return [
          '@say Granite|' + s.mem.brief,
          s.hp < 50 ? 'Your ribs ache under the vest. Rook watches you strap it on and says nothing, which from Rook is concern.' : null,
          promo && s.merit >= promo.merit && !s.flags['passed_' + promo.next]
            ? `@sys Your merit qualifies you for the ${promo.next} field evaluation. Request it from Granite when you are ready.`
            : null,
          '@sys Choose today\'s duty.',
        ];
      },
      choices: (s) => {
        const promo = G.PROMO[s.rank];
        const list = s.duty.offers.map((k) => {
          const d = G.duties[k];
          const isNew = !s.duty.done[k];
          return {
            t: `**${d.name}** — ${d.desc}`,
            tag: isNew ? 'NEW' : 'ROUTINE',
            tagCls: isNew ? 'duty' : '',
            fx: (st) => {
              st.duty.current = k;
              st.time = 'Day';
              return null;
            },
            go: (st) => (st.duty.done[k] ? d.routine : d.first),
          };
        });
        if (promo && s.merit >= promo.merit) {
          list.unshift({ t: `**Request your ${promo.next} field evaluation from Granite.**`, tag: 'EVALUATION', tagCls: 'loyal', go: 'exam_' + promo.next });
        }
        return list;
      },
    },

    /* shared end of any duty: pay, then evening */
    u_duty_end: {
      safe: true,
      enter: (s) => {
        if (s.duty.current) s.duty.done[s.duty.current] = (s.duty.done[s.duty.current] || 0) + 1;
        s.duty.current = null;
        G.fx(s, { tokens: 4 });
        return 'u_evening';
      },
      text: [],
    },

    u_evening: {
      title: (s) => `Evening — Day ${s.day}`,
      enter: (s) => {
        s.time = 'Evening';
        const b = dueBeat(s, 'evening');
        if (b) return b;
      },
      text: (s) => [
        G.pick([
          'The shift siren goes at 18:00. You stand in the locker room with your mask in your hands and look at it for a while before you put it in the locker.',
          (s.rank === '05' ? 'You hand your stun baton in at the armoury cage. The clerk checks the battery, logs the voltage setting and hangs it on a numbered hook, the same way every night.' : 'You hand in your USP-Match at the armoury cage. The clerk counts the rounds back in one at a time, the same way every night.'),
          'The precinct mess smells of boiled protein and wet wool. Somebody has scratched a tally of days on the wall above the urn. It goes to four hundred and stops.',
          'Outside the precinct windows the Stacks light up one by one, grey squares in grey walls. Somewhere out there is the window with the plastic over it.',
        ]),
        s.hp < s.maxhp ? `@sys Health ${s.hp}/${s.maxhp}. Rest heals more than anything else.` : null,
        '@sys The evening is yours.',
      ],
      choices: (s) => [
        { t: 'Visit Mira in Stack 14.', go: 'ev_mira' },
        { t: 'Find Tomas in the precinct mess.', if: (s) => s.rel.tomas !== undefined && !s.flags.tomas_gone, go: 'ev_tomas' },
        { t: 'Train at the precinct — range, gym or study.', go: 'ev_train' },
        { t: 'Walk Bazaar Row out of uniform.', go: 'ev_bazaar' },
        { t: 'Rest. Sleep while you can.', fx: (st) => ({ hp: Math.min(30, st.maxhp - st.hp) }), go: 'u_night' },
      ],
    },

    u_night: {
      safe: true,
      enter: (s) => {
        s.day++;
        s.time = 'Morning';
        if (s.hp < s.maxhp) s.hp = Math.min(s.maxhp, s.hp + 10);
        return 'u_board';
      },
      text: [],
    },

    /* --------------------------------------------------------- evenings */

    ev_train: {
      title: 'Precinct — after hours',
      text: ['The range is open until 22:00. The gym is a cellar full of rust and sweat. The dispatch archive has a terminal and a chair, and nobody ever uses either.'],
      choices: [
        { t: 'The range. Two hundred rounds.', fx: { xp: { firearms: 2 } }, go: 'ev_train_done' },
        { t: 'The gym. Stick drills with whoever is around.', fx: { xp: { melee: 2 }, hp: -3 }, go: 'ev_train_done' },
        { t: 'Run the Stacks perimeter in kit.', fx: { xp: { fitness: 2 }, hp: -3 }, go: 'ev_train_done' },
        { t: 'Listen to old dispatch recordings in the archive.', fx: { xp: { comms: 2 } }, go: 'ev_train_done' },
        { t: 'Review scanner footage and learn to read crowds.', fx: { xp: { perception: 2 } }, go: 'ev_train_done' },
        { t: 'Sit in on a JURY session at the precinct cells.', fx: { xp: { authority: 2 }, cons: -1 }, go: 'ev_train_done' },
        { t: 'Volunteer at the HELIX aid station.', fx: { xp: { medical: 2 }, cons: 1 }, go: 'ev_train_done' },
      ],
    },

    ev_train_done: {
      text: [
        G.pick([
          'By the end your arms are shaking and your head is full of noise. It is a good kind of exhaustion, the kind that leaves no room for thinking.',
          'An 01 from another squadron watches you for a while, then leaves without comment. You decide to take that as a compliment.',
          'When you finish, the precinct is quiet. A single unit sits in the mess staring at a cup of sector water. You leave him to it.',
        ]),
      ],
      choices: [{ t: 'Sleep.', go: 'u_night' }],
    },

    ev_tomas: {
      title: 'Precinct mess',
      enter: (s) => {
        s.mem.tomasVisits = (s.mem.tomasVisits || 0) + 1;
      },
      text: (s) => {
        const v = s.mem.tomasVisits;
        if (v === 1)
          return [
            'Tomas is at the corner table with two cups of something that smells like engine solvent and an expression of enormous satisfaction.',
            '@say Tomas|Pre-war vodka. Confiscated. By me. From a man who will not be needing it, because he is in a cell for having it. Sit.',
            '@say Tomas|My ma got her first HELIX visit today. Real medicine. A real medic, with gloves. She asked him if he was my friend and he didn\'t know what to say.',
            'He laughs, and then for a moment he doesn\'t, and then he drinks.',
          ];
        return [
          'Tomas is where he always is, at the corner table, telling a story to two 04s from the night shift that is clearly at least half invented.',
          G.pick([
            '@say Tomas|— and the citizen says, *I didn\'t know it was a curfew, I thought it was just dark* — sit, sit, you\'ll like this one.',
            '@say Tomas|You hear JURY took a unit from D2 last night? Out of his own bunk. Nobody knows why. That\'s the part that gets me. *Nobody knows why.*',
            '@say Tomas|My ma asked if I\'m happy. I said I eat every day. She said that wasn\'t what she asked. Mothers, eh?',
            '@say Tomas|Rook says you\'ve got good instincts. Rook has never said that about anyone. I think he might be dying.',
          ]),
        ];
      },
      choices: [
        { t: 'Drink with him. Laugh. Forget the mask for an hour.', fx: { rel: { tomas: 6 }, hp: 5 }, go: 'u_night' },
        { t: 'Ask him how he\'s really holding up.', fx: { rel: { tomas: 8 }, cons: 1 }, go: 'ev_tomas_real' },
      ],
    },

    ev_tomas_real: {
      text: (s) => [
        'He looks at the cup for a long time.',
        s.cons < 40
          ? '@say Tomas|Honestly? Better than I thought. You stop noticing after a while. The faces. They all look the same through the lenses. You know?'
          : '@say Tomas|Honestly? I hit a man today because he was slow. Not because he did anything. Because he was *slow*, and Rook was watching, and I wanted Rook to see me do it. I keep thinking about my ma watching.',
        '@say Tomas|Don\'t tell anyone I said that.',
      ],
      choices: [
        { t: '"I won\'t. And you\'re still you, Tomas."', fx: { rel: { tomas: 6 }, cons: 2 }, go: 'u_night' },
        { t: '"Then stop thinking about it. That\'s how you survive in here."', fx: { cons: -2 }, go: 'u_night' },
      ],
    },

    ev_bazaar: {
      title: 'Bazaar Row — after curfew bell',
      text: (s) => [
        'Out of uniform, nobody looks at you twice, which is its own kind of strange. Bazaar Row at dusk is crates and tarpaulins and low voices, everything for sale that isn\'t officially for sale. People go quiet when a unit walks by. When *you* walk by, they don\'t. They don\'t know.',
        `@sys Tokens: ${s.tokens}.`,
      ],
      choices: (s) => [
        { t: 'Buy a spare ration pack (6 tokens).', if: (s) => !G.has(s, 'ration'), lock: (s) => (s.tokens < 6 ? 'Not enough tokens' : null), fx: { tokens: -6, give: 'ration' }, go: 'ev_bazaar' },
        { t: 'Buy half a pack of pre-war cigarettes (10 tokens).', if: (s) => !G.has(s, 'cigarettes'), lock: (s) => (s.tokens < 10 ? 'Not enough tokens' : null), fx: { tokens: -10, give: 'cigarettes' }, go: 'ev_bazaar' },
        { t: 'Sell the cigarettes to a dealer (14 tokens).', if: (s) => G.has(s, 'cigarettes'), fx: { tokens: 14, take: 'cigarettes' }, go: 'ev_bazaar' },
        { t: 'Drop the rebel leaflet down a storm drain.', if: (s) => G.has(s, 'leaflet'), fx: { take: 'leaflet' }, go: 'ev_bazaar' },
        { t: 'Visit the repairman\'s stall at the end of the row.', if: (s) => s.flags.know_tinker || s.flags.know_tinker_res, go: 'ev_tinker' },
        { t: 'Head back.', go: 'u_night' },
      ],
    },

    ev_tinker: {
      title: 'The repairman\'s stall',
      enter: (s) => {
        s.rel.tinker = s.rel.tinker || 0;
        s.mem.tinkerVisits = (s.mem.tinkerVisits || 0) + 1;
      },
      text: (s) => [
        '@img assets/img/env/e16-tinker.jpg|The repairman\'s stall, Bazaar Row',
        'The stall is a wooden booth with a hinged counter, crowded with gutted radios, coils of copper, and a single lamp clamped to a shelf. Behind the counter sits a bald man with heavy spectacles and burned fingertips. He is soldering something with surgical care and does not look up.',
        '@portrait assets/img/portraits/tinker.jpg|The Tinker — CID 07731, Bazaar Row',
        '@say Tinker|Closed. Unless you have something that needs fixing.',
        s.mem.tinkerVisits > 1 ? 'He glances up. Recognises you. Goes back to his soldering, a little more slowly.' : null,
      ],
      choices: (s) => [
        {
          t: '"My radio\'s been crackling. They say the river remembers."',
          if: (s) => s.flags.know_tinker_res && !s.flags.tinker_contact,
          fx: { res: 10, rel: { tinker: 25 }, flag: { tinker_contact: true } },
          go: 'ev_tinker_contact',
        },
        { t: 'Ask what he has heard on the Row lately.', if: (s) => s.flags.tinker_contact, go: 'ev_tinker_news' },
        {
          t: '"I know about the paint, old man. The boy on level 4 told us everything."',
          if: (s) => s.flags.know_tinker && !s.flags.tinker_shaken,
          check: { skill: 'authority', diff: 5, pass: 'ev_tinker_shake_ok', fail: 'ev_tinker_shake_bad' },
        },
        { t: 'Nothing. Walk on.', go: 'u_night' },
      ],
    },

    ev_tinker_contact: {
      text: [
        'The soldering iron stops. For a moment the only sound is the hiss of the lamp.',
        '@say Tinker|Does it. Well. Bring your radio in sometime, and I\'ll see what I can do about the crackle.',
        'He looks at you over his spectacles, and you understand that you have just been examined more thoroughly than by any JURY officer.',
        '@say Tinker|You come here in plain clothes. You don\'t come twice in one week. You don\'t write anything down. If someone approaches you saying they\'re from me and they don\'t know about your sister\'s drawings, you break their nose and report them. Understood?',
        'You never told anyone about Mira\'s drawings.',
      ],
      choices: [{ t: 'Nod. Walk away slowly.', go: 'u_night' }],
    },

    ev_tinker_news: {
      text: (s) => [
        '@say Tinker|' +
          G.pick([
            'Overwatch moved a squad into D4. They don\'t tell your people anything, do they? You\'re all just furniture to them.',
            'Ration truck runs through the Canal Quarter on Thursdays. Everybody knows. Even the people who aren\'t supposed to.',
            'There\'s a unit in your precinct who sells confiscated batteries back to the Row. Thought you\'d want to know who your friends are.',
            'JURY has a list. I don\'t know who\'s on it. I know it got longer this week.',
          ]),
        s.res >= 35 ? '@say Tinker|Ilse says you\'re doing well. Says you\'re boring. That\'s high praise, from her.' : null,
      ],
      choices: [{ t: 'Head home.', fx: { res: 2 }, go: 'u_night' }],
    },

    ev_tinker_shake_ok: {
      text: [
        'The old man\'s hands stop. Slowly he sets the iron in its stand.',
        '@say Tinker|I don\'t know what you mean.',
        'But his hands are shaking now. You have him.',
      ],
      choices: [
        { t: 'Report him to JURY. Let them have him.', tag: 'REPORT', tagCls: 'loyal', fx: { merit: 6, lp: 5, cons: -8, res: -40, flag: { tinker_arrested: true, tinker_shaken: true } }, go: 'ev_tinker_arrest' },
        { t: '"Then you\'d better stop painting the walls. Next time I won\'t be in plain clothes."', fx: { flag: { tinker_shaken: true }, rel: { tinker: -10 }, cons: 2 }, go: 'u_night' },
        { t: '"Fifteen tokens a week and I forget I know you."', tag: 'EXTORT', tagCls: 'risk', fx: { tokens: 15, cons: -6, susp: 3, flag: { tinker_shaken: true, extort_tinker: true }, rel: { tinker: -30 } }, go: 'u_night' },
      ],
    },

    ev_tinker_shake_bad: {
      text: [
        'The old man looks at you over his spectacles for a long, unhurried moment.',
        '@say Tinker|Boys say all sorts of things on level 4. They say whatever stops the pain. You\'d know, wouldn\'t you? Good night, officer.',
        'He goes back to his soldering. He called you *officer*. You are not in uniform.',
      ],
      choices: [{ t: 'Walk away.', fx: { flag: { tinker_shaken: true }, susp: 2 }, go: 'u_night' }],
    },

    ev_tinker_arrest: {
      text: [
        'JURY takes him at 04:00. You are not there. You hear it from Rook at muster: an old man, a stall full of radio parts, a crate of lambda paint under the floor.',
        '@say Rook|Your tip? Huh. Granite\'s happy. The Magistrate\'s happy. Somebody on the Row is very unhappy.',
        'Bazaar Row is quieter after that. When you walk it in plain clothes, people stop talking.',
      ],
      choices: [{ t: 'Morning.', go: 'u_night' }],
    },

    /* -------------------------------------------------------------- Mira */

    ev_mira: {
      title: 'Stack 14, Unit 14-C',
      enter: (s) => {
        s.mem.miraStage = s.mem.miraStage || 0;
        const st = s.mem.miraStage;
        if (st === 0) return 'ev_mira_0';
        if (st === 1 && s.day >= 2) return 'ev_mira_1';
        if (st === 2 && s.day >= 4) return 'ev_mira_2';
        return 'ev_mira_gen';
      },
      text: [],
    },

    ev_mira_0: {
      enter: (s) => {
        s.mem.miraStage = 1;
      },
      text: (s) => {
        const f = s.flags.halloran_fate;
        const cold = s.rel.mira < 40;
        return [
          'You climb the stairs in your civilian coat with your mask in a bag. On the third-floor landing you pass a neighbour, Mrs Orlova, who has known you since you were four. She flattens herself against the wall until you\'re past.',
          'Mira opens the door before you knock.',
          f === 'beaten'
            ? 'She looks at you for a long time. Then she steps aside to let you in, the way she would for any unit. *Yes, officer. Of course, officer.*'
            : f === 'spared'
            ? 'She grabs you by the coat and pulls you inside and hugs you, hard, and whispers into your shoulder: *"He\'s still here. Halloran\'s still here. Whatever you did — "* and then she stops, because the walls are thin.'
            : 'She hesitates on the threshold, then lets you in.',
          cold ? '@say Mira|You look tired. Do they feed you, at least? They said they\'d feed you.' : '@say Mira|You look ridiculous in that coat. You look like you\'re trying to look like a citizen.',
          'The room is warmer than you remember. There is a new ration voucher on the table — family-of-service rate. Twice what she used to get.',
        ];
      },
      choices: (s) => [
        { t: 'Give her your spare ration pack.', if: (s) => G.has(s, 'ration'), fx: { take: 'ration', rel: { mira: 10 }, cons: 2 }, go: 'ev_mira_0b' },
        { t: 'Give her 10 tokens.', if: (s) => s.tokens >= 10, fx: { tokens: -10, rel: { mira: 6 } }, go: 'ev_mira_0b' },
        { t: 'Sit with her and tell her about training — the parts you can tell.', fx: { rel: { mira: 5 } }, go: 'ev_mira_0b' },
        { t: 'Tell her the truth about what the raid on 14-F was.', if: (s) => s.flags.halloran_fate === 'beaten', go: 'ev_mira_truth' },
      ],
    },

    ev_mira_truth: {
      text: [
        'You tell her. Not all of it. Enough.',
        'Mira listens with her hands around a cup of sector water. When you finish, she is quiet for so long that the radiator knocks four times.',
        '@say Mira|I heard it. Through the wall. I heard him say your name.',
        '@say Mira|I\'m not going to forgive you tonight. Maybe not for a long time. But I\'m glad you told me instead of pretending. Pretending would\'ve been worse.',
      ],
      choices: [{ t: 'Leave her the voucher and go.', fx: { rel: { mira: 8 }, cons: 4 }, go: 'u_night' }],
    },

    ev_mira_0b: {
      text: (s) => [
        'She shows you her new drawings. A dog that she saw in the Canal Quarter before the units shot it. A tram. A face that might be your mother\'s.',
        '@say Mira|The foreman at the mill — Brask — he asked me if my brother was the new unit. He was nicer after. Everyone\'s nicer. It\'s horrible.',
        s.rel.mira >= 60 ? 'When you leave, she touches the back of your neck, very lightly, where the implant is. As if checking you are still warm.' : 'When you leave, she says goodnight to the door, not to you.',
      ],
      choices: [{ t: 'Walk back to the precinct.', go: 'u_night' }],
    },

    ev_mira_1: {
      enter: (s) => {
        s.mem.miraStage = 2;
      },
      text: [
        'Mira is sitting on the floor with her back to the radiator when you come in. She has a split lip and she is trying to hide it with her hand.',
        '@say Mira|It\'s nothing. It\'s — it\'s not nothing. It\'s Brask. The foreman. He wasn\'t nicer for long.',
        'It comes out slowly. Brask is the CWU supervisor on the dye floor — ochre jacket, flat cap, a gold chevron on his union badge — and he controls the shift rosters. He puts girls who refuse him on the dye vats, where the fumes take your lungs in a year. Mira refused him. He hit her. Tomorrow she starts on the vats.',
        '@say Mira|I\'m not asking you to do anything. I know what you\'d have to do. I just — I needed to tell someone who wasn\'t scared of him.',
      ],
      choices: [
        { t: '"I\'ll deal with Brask." Go to the mill tomorrow in uniform.', check: { skill: 'authority', diff: 0, pass: 'ev_mira_brask_ok', fail: 'ev_mira_brask_bad' } },
        { t: 'File a malcompliance report on Brask — through proper channels.', check: { skill: 'comms', diff: 5, pass: 'ev_mira_report_ok', fail: 'ev_mira_report_bad' } },
        { t: '"Keep your head down. It\'s a year. I\'ll get you transferred before then."', fx: { rel: { mira: -15 }, cons: -3 }, go: 'u_night' },
      ],
    },

    ev_mira_brask_ok: {
      text: [
        'You visit the dye floor the next morning during your patrol, mask on, Rook a step behind you. You find Brask in his glass office above the vats.',
        'You don\'t touch him. You don\'t have to. You stand very close, and you say his name — which units never do — and you tell him the exact address of his apartment, and the name of his wife, and the number of the ration window she uses.',
        'Then you tell him that a girl called Mira will be on the inspection line from now on, and that if her name ever appears on the vat roster you will come back.',
        'Brask is sweating through his shirt by the time you leave. Rook doesn\'t say anything until you\'re outside.',
        '@say Rook|Personal?',
        '@say Rook|...Fair. Don\'t make a habit of it. Habits get noticed.',
      ],
      choices: [{ t: 'Continue.', fx: { rel: { mira: 20, rook: 5 }, cons: 2, susp: 2, xp: { authority: 1 }, flag: { brask_done: 'scared' } }, go: 'u_night' }],
    },

    ev_mira_brask_bad: {
      text: [
        'You find Brask in his glass office. You tell him to leave Mira alone. You say her name.',
        'Brask smiles. He is a fat man with small, wet eyes, and he has been bullied by units before.',
        '@say Brask|Mira. Your sister, is it? Funny. I file reports too, officer. On workers who get special treatment. On units who abuse their position for family. JURY loves those reports.',
        'Mira goes on the vats anyway. Rook, who heard everything, shakes his head slowly.',
      ],
      choices: [{ t: 'Continue.', fx: { rel: { mira: 5 }, susp: 6, flag: { brask_done: 'failed' } }, go: 'u_night' }],
    },

    ev_mira_report_ok: {
      text: [
        'You write it the way the manual likes: dates, rosters, ration irregularities. You don\'t mention Mira at all. You mention that Brask\'s shift output is four percent under quota and that he has been logging girls on the vats who are not certified for chemical work, which is a waste of Union labour.',
        'Two days later Brask is reassigned to a loading dock in D4. Nobody connects it to you. Mira never goes on the vats.',
      ],
      choices: [{ t: 'Continue.', fx: { rel: { mira: 15 }, lp: 2, xp: { comms: 1 }, flag: { brask_done: 'reported' } }, go: 'u_night' }],
    },

    ev_mira_report_bad: {
      text: [
        'You file the report. It disappears into the Nexus like a stone into the canal. A week later it comes back stamped *INSUFFICIENT GROUNDS*, with a handwritten note: *Personal interest suspected?*',
        'Mira is on the vats. She coughs, now, when she laughs.',
      ],
      choices: [{ t: 'Continue.', fx: { rel: { mira: -5 }, susp: 3, flag: { brask_done: 'failed' } }, go: 'u_night' }],
    },

    ev_mira_2: {
      enter: (s) => {
        s.mem.miraStage = 3;
      },
      text: [
        'Mira isn\'t home. Unit 14-C is dark and cold. You wait.',
        'She comes in at 22:40 — forty minutes after curfew — with wet boots and canal mud on the hem of her overalls. She stops dead when she sees you sitting at the table.',
        '@say Mira|I was at Katya\'s.',
        'Katya lives in Stack 9. Stack 9 is dry. Mira\'s boots are soaked to the ankle. The only water between here and anywhere is in the Canal Quarter.',
        'And peeking out of her coat pocket is a folded square of mill paper, hand-printed. You know what it is. You have read one before, or you have seen a hundred on Granite\'s confiscation table.',
      ],
      choices: [
        { t: '"Give me the leaflet. Now. Do you know what JURY does to people who have those?"', fx: { rel: { mira: -10 }, lp: 1 }, go: 'ev_mira_2_hard' },
        { t: '"I won\'t ask where you were. But you need to tell me who you were with."', check: { skill: 'perception', diff: 5, pass: 'ev_mira_2_read', fail: 'ev_mira_2_hard' } },
        { t: 'Say nothing about it. Make her tea. Ask about her day.', fx: { rel: { mira: 10 }, cons: 3, res: 4, flag: { mira_rebel: true } }, go: 'ev_mira_2_soft' },
      ],
    },

    ev_mira_2_hard: {
      text: [
        'Mira\'s chin comes up. For a moment she looks exactly like your mother.',
        '@say Mira|Yes. I know what they do. I live in Stack 14. I heard what they did to Halloran through the wall. Do *you* know what they do? Or do they not tell you, when you\'re the one doing it?',
        'She takes the leaflet out of her pocket and puts it on the table between you. *Take it*, her face says. *Report me. See if you can.*',
      ],
      choices: [
        { t: 'Burn the leaflet in the stove. "Never again, Mira. Promise me."', fx: { rel: { mira: -5 }, flag: { mira_warned: true } }, go: 'u_night' },
        { t: 'Take it and walk out. You don\'t know what you will do with it yet.', fx: { give: 'leaflet', rel: { mira: -15 }, flag: { mira_rebel: true } }, go: 'u_night' },
        {
          t: 'Report her — for her own good. A juvenile warning is better than what\'s coming.',
          tag: 'INFORM',
          tagCls: 'loyal',
          fx: { lp: 8, merit: 3, cons: -20, rel: { mira: -80 }, flag: { reported_mira: true } },
          go: 'ev_mira_reported',
        },
      ],
    },

    ev_mira_2_read: {
      text: [
        'You watch her the way you have learned to watch people on the street. The mud on her boots is the grey clay of the lower locks — not the canals by the pump houses, but further down, near the dam spillway. Her hands are clean but her nails aren\'t: copper filings. Somebody was building something. A radio, probably.',
        '@say You|You were down by the spillway. With someone who builds radios.',
        'Mira goes white.',
        '@say Mira|...How do you — no. *No.* You don\'t get to do that to me. You don\'t get to *read* me like I\'m one of them.',
        'But she sits down. She tells you a little. A group of mill girls. A man who teaches them to read pre-war books. Someone called Wren.',
      ],
      choices: [
        { t: '"Wren? Mira — I know Wren."', if: (s) => s.flags.sleeper, fx: { rel: { mira: 25 }, res: 8, flag: { mira_rebel: true, mira_knows: true } }, go: 'ev_mira_2_wren' },
        { t: '"Be careful. Please. I can\'t protect you from everything."', fx: { rel: { mira: 10 }, flag: { mira_rebel: true } }, go: 'u_night' },
        { t: '"Stop going. Or next time it won\'t be me who finds out."', fx: { rel: { mira: -5 }, flag: { mira_warned: true } }, go: 'u_night' },
      ],
    },

    ev_mira_2_wren: {
      text: [
        'Mira stares at you. Then, very slowly, she starts to laugh — a cracked, exhausted sound that turns, halfway through, into something else.',
        '@say Mira|All this time. All this time I thought you\'d *gone over*. I\'ve been hating you for weeks.',
        '@say Mira|You absolute idiot. You should have told me.',
        '@say You|You know why I couldn\'t.',
        'She does. She holds onto your coat for a long time without saying anything else.',
      ],
      choices: [{ t: 'Stay until she falls asleep.', fx: { cons: 4 }, go: 'u_night' }],
    },

    ev_mira_2_soft: {
      text: [
        'You make tea, the bitter grey leaves from the family-of-service ration. You ask about the mill. She tells you, cautiously at first, and then less cautiously.',
        'The leaflet stays in her pocket. Neither of you mentions it. When you leave she says, at the door:',
        '@say Mira|Thank you for not asking.',
      ],
      choices: [{ t: 'Go.', go: 'u_night' }],
    },

    ev_mira_reported: {
      text: [
        'They take her at dawn. Seditious print is RED contraband — Level 5. Because the report came from her own brother, JURY records it as a juvenile first offence and reduces it.',
        '@law POSSESSION OF SEDITIOUS PRINT · REDUCED TO LEVEL 3 — 3 penalty points · 1 detainment cycle · re-education',
        'Three days in the D5 holding cells. Three points on a file that will follow her for the rest of her life. Seventeen more and the Union stops counting.',
        'When she comes home she doesn\'t speak to you. She doesn\'t open the door. You stand on the landing in your civilian coat and listen to her not open it.',
        'Mrs Orlova on the third floor no longer flattens herself against the wall when you pass. She turns her back.',
        '@say Granite|Your own sister. That\'s commitment. The Union notices commitment.',
      ],
      choices: [{ t: 'Continue.', go: 'u_night' }],
    },

    ev_mira_gen: {
      text: (s) => {
        const r = s.rel.mira;
        if (s.flags.reported_mira) return ['You climb to the fourth floor. The door to 14-C stays closed. After a while you go back down.'];
        return [
          r >= 50
            ? G.pick([
                'Mira is drawing at the table. She doesn\'t look up but she pushes a cup of tea toward your side. You sit and watch her draw until the curfew bell.',
                'Mira has saved a piece of real chocolate from somewhere and insists on splitting it with you exactly in half, measured with a ruler.',
                'You fix the radiator together. It still knocks. It just knocks a little quieter.',
              ])
            : G.pick([
                'Mira lets you in. You talk about nothing for half an hour. Neither of you mentions anything that matters.',
                'Mira is asleep, or pretending to be. You leave a ration voucher on the table and go.',
              ]),
        ];
      },
      choices: (s) => [
        { t: 'Leave her your spare ration pack.', if: (s) => G.has(s, 'ration') && !s.flags.reported_mira, fx: { take: 'ration', rel: { mira: 6 } }, go: 'u_night' },
        { t: 'Go home.', fx: (s) => (s.flags.reported_mira ? null : { rel: { mira: 2 }, hp: 5 }), go: 'u_night' },
      ],
    },

    /* --------------------------------------------------------- infirmary */

    infirmary: {
      safe: true,
      title: 'HELIX infirmary — beneath the Nexus',
      enter: (s) => {
        s.hp = 60;
        s.merit = Math.max(0, s.merit - 3);
        if (s.phase === 'union') s.day += 1;
      },
      text: (s) => [
        'You wake under white light with a taste of copper in your mouth. There is a tube in your arm and someone has cut away half your uniform.',
        '@portrait assets/img/portraits/helix-77301.jpg|HELIX-02-77301',
        '@say HELIX 02|Ah. Awake. Good. I dislike filling out the other form.',
        'It is the instructor from training — **HELIX-02-77301**, green lens, tired voice. She checks something on a slate.',
        '@say HELIX 02|Biogel, sutures, two units of synthetic blood. You will be on light duty for a day. Your squadron leader has been informed that you were careless. I was asked to put it in those words.',
        '@sys You lost 3 merit. Health restored to 60.',
      ],
      choices: (s) => [{ t: 'Get up. Slowly.', go: s.phase === 'training' ? 'bt_after' : 'u_board' }],
    },

    /* ----------------------------------------------------------- endings */

    end_amputated: {
      ending: true,
      title: 'File status: RED',
      enter: (s) => {
        s.phase = 'ended';
      },
      text: (s) => [
        'They come for you at 03:15. Not UNION. JURY, four of them, with the Magistrate at the back in his crimson armband, hands folded behind him.',
        '@portrait assets/img/portraits/magistrate.jpg|JURY-DvL-02842',
        '@say Magistrate|Your file, Protection Unit. It has been turning a colour for some time. Tonight it became the colour.',
        'You do not reach for your sidearm. You were trained well enough to know it would not matter.',
        'They take you down to level 4. Below the river line. The walls sweat. A ventilation fan ticks like a clock.',
        `@doc ${G.desig(s)}\nSTATUS: AMPUTATED\nBIOSIGNAL: TERMINATED 04:02\nNOTE: Malcompliance. Collaboration suspected. File closed.`,
        s.rel.mira >= 40 ? 'Somewhere in Stack 14, a girl draws a rooftop with two kids sitting on the edge of it. She draws it again the next night. And the next.' : 'In Stack 14, a door stays closed.',
        '@sys ENDING — AMPUTATED. Your suspicion rose too high. Every choice that put a little more in your file added up.',
      ],
      choices: () => [
        { t: 'Return to last checkpoint', if: () => G.hasCheckpoint(), act: () => G.loadCheckpoint() },
        { t: 'Begin a new life', act: () => G.newGame() },
      ],
    },

    end_defect: {
      ending: true,
      title: 'Beneath the dam',
      enter: (s) => {
        s.phase = 'ended';
      },
      text: (s) => [
        'You leave the mask in your locker. That is the last thing you do as a Protection Unit: hang it on the hook, lenses facing the wall, so it cannot watch you go.',
        s.flags.mira_with_you ? 'Mira is waiting on the towpath by the pump house, a bag over her shoulder with everything she owns. It isn\'t much. Her drawings. A coat. Halloran\'s bread knife.' : 'You go alone. Mira stays — you could not ask her to come into the dark with you, and you could not leave her a reason to be questioned. You leave her a voucher and a drawing of your own, badly done: a rooftop.',
        'The Tinker meets you at the spillway. Ilse is with him, out of uniform for the first time, her hair loose. She looks younger. She looks angrier.',
        '@say Ilse|Your biosignal goes dead in ninety seconds. The Tinker\'s going to cut the implant out with a soldering iron and a prayer. It\'s going to hurt more than anything they ever did to you.',
        '@say Ilse|After that you\'re nobody. No rations. No name. Just the river.',
        'The water under the dam roars like a crowd. Beyond the spillway, the tunnels go down into the dark, toward the Outlands, toward whatever is left out there.',
        `@doc ${G.desig(s)}\nSTATUS: BIOSIGNAL LOST\nLAST POSITION: D3, SPILLWAY 2\nNOTE: Presumed deserted. Classify ANTICITIZEN.`,
        '@sys ENDING — THE RIVER REMEMBERS. You left the Civil Protection behind. Chapter 1 complete on the resistance path.',
      ],
      choices: () => [
        { t: 'Return to last checkpoint', if: () => G.hasCheckpoint(), act: () => G.loadCheckpoint() },
        { t: 'Begin a new life', act: () => G.newGame() },
      ],
    },
  });
})();
