/* CHAPTER SEVEN — "Anticitizen One". All divisions.
   The Union gives the man from City 17 a designation and puts a blurred figure on every screen.
   Overwatch pulls most of its City 9 garrison to City 17. Civil Protection holds the city alone,
   and the canal cells see the night they have waited for. You decide where your teams stand,
   what you do on the day the screens chant, and which side you are on when D5 rises.
   He is named only by his Union designation: Anticitizen One. No name, no face. */
(function () {
  const { adv, set } = G.chapter({ n: 7, stages: [[1, 'evening', 'c7_1'], [2, 'morning', 'c7_2'], [3, 'evening', 'c7_3']] });
  const sup = (s) => (G.superiorOf ? G.superiorOf(s).name : 'Your officer');
  const veil = (s) => !!s.flags.veil_shadow;
  const contact = (s) => {
    if (s.c6 && s.c6.kin && s.c6.kinPart !== 'arrested' && s.rel[s.c6.kin.key] > -50) return s.c6.kin;
    if (s.rel.ilse !== undefined && !s.flags.ilse_gone && !s.flags.ilse_arrested) return { key: 'ilse', name: 'Ilse', img: 'ilse' };
    return { key: 'katya', name: 'Katya', img: 'katya' };
  };

  G.extend('u_board', {
    text: (lines, s) => {
      if (s.c7 && !s.c7.done && s.c7.stage >= 1) lines.splice(1, 0, '@dispatch ANTICITIZEN ONE. Any information to Civil Protection. Overwatch garrison C9 at reduced strength. Civil Protection holds.');
      return lines;
    },
  });

  G.addScenes({
    c7_start: {
      checkpoint: true,
      safe: true,
      title: 'Chapter Seven',
      enter: (s) => {
        s.chapter = 7;
        s.c7 = { stage: 0, next: s.day, posture: null, side: null, plaza: null, night: null, done: false, who: contact(s) };
        G.unlock(s, 'anticitizen');
      },
      text: [
        '@big CHAPTER SEVEN',
        '@sys ALL DIVISIONS · ANTICITIZEN ONE',
        '@img assets/img/env/e39-screens.webp|Plaza 5, 06:00',
        'At 06:00 every broadcast screen in City 9 goes white, then shows a single still image: a blurred figure in a doorway, too far from the camera to have a face. Beneath it, in the Union’s plain type, a designation.',
        '@doc ANTICITIZEN ONE\nWANTED FOR CRIMES AGAINST THE UNIVERSAL UNION.\nANY CITIZEN WITH INFORMATION WILL BE REWARDED.\nANY CITIZEN WHO SHELTERS THIS INDIVIDUAL WILL BE AMPUTATED.',
        'By 06:20 the first chalk lambda has appeared under the screen on Plaza 5. By 07:00 there is one under every screen in District 5.',
        'In the precinct mess, nobody says the designation out loud. Everybody looks at the screen when they think nobody is watching them look.',
      ],
      choices: [{ t: 'Report to the Nexus.', go: 'c7_0' }],
    },
    c7_0: {
      title: 'The Nexus — briefing hall',
      text: (s) => [
        '@portrait assets/img/portraits/vigil.webp|Field Commander Vigil',
        '@say Vigil|Overwatch is taking two thirds of the City 9 garrison to City 17 tonight, and one of the Shrikes. For the first time since the war, Civil Protection holds this city alone.',
        '@say Vigil|The canal cells know it. They have known it since the screens went white. They will try something. I want every officer’s teams placed by tonight. Your call.',
        s.squad && s.squad.formed ? `@sys Your team: ${G.squadActive(s).map((m) => m.name).join(', ')}.` : null,
      ],
      choices: [
        { t: 'Harden the Nexus. If the Nexus stands, the city stands.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: adv(0, set({ posture: 'nexus' }, { lp: 2 })), go: 'u_board' },
        { t: 'Put your teams in the Stacks, on the stairs, where people can see them.', fx: adv(0, set({ posture: 'stacks' }, (st) => (G.distFx && G.distFx(st, 's14', 4, -4), { cons: 2 }))), go: 'u_board' },
        { t: 'Hold the armoury and the RDTs. Whoever controls guns and food controls the night.', fx: adv(0, set({ posture: 'armoury' }, { merit: 2 })), go: 'u_board' },
      ],
    },

    c7_1: {
      title: (s) => `Evening — Day ${s.day}`,
      text: (s) => {
        const w = s.c7.who;
        if (veil(s))
          return [
            '@portrait assets/img/portraits/veil-ofc.webp|VEIL',
            '@say VEIL|The canal cells will rise in D5 the night the screens go dark. We want it to happen. We want it to fail. Slowly, and with names. You will be inside it.',
            `@say VEIL|${w.name} will ask you to stand with them. Say yes. Then tell us everything.`,
          ];
        if (s.res >= 25 || (s.c6 && ['ran', 'shielded'].includes(s.c6.train)))
          return [
            `@portrait assets/img/portraits/${w.img}.webp|${w.name}`,
            `@say ${w.name}|The screens go dark on Sunday at 21:00. GRID cannot stop it; we have the substation. When the screens go dark, D5 rises: every stairwell, every block, at once.`,
            `@say ${w.name}|With Overwatch gone, there are more of us than there are of you. But not many more. If you and your teams stand aside — or stand with us — nobody on the stairs has to die tonight.`,
          ];
        return [
          `@say ${sup(s)}|An informant in Stack 9 says “Sunday, when the screens go dark.” That is all. Sleep with your boots on.`,
        ];
      },
      choices: (s) =>
        veil(s) || s.res >= 25 || (s.c6 && ['ran', 'shielded'].includes(s.c6.train))
          ? [
              { t: '“I will stand with you.”', tag: 'RESISTANCE', tagCls: 'mercy', fx: adv(1, set({ side: 'cells' }, { res: 15, cons: 5, susp: 4 })), go: 'u_night' },
              { t: '“I will stand aside. That is all I can give.”', fx: adv(1, set({ side: 'aside' }, { res: 5 })), go: 'u_night' },
              { t: 'Report the time and the substation to Vigil tonight.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: adv(1, set({ side: 'union' }, { merit: 8, lp: 6, res: -40, cons: -8 })), go: 'u_night' },
            ]
          : [{ t: 'Sleep with your boots on.', fx: adv(1, set({ side: 'union' })), go: 'u_night' }],
    },

    c7_2: {
      checkpoint: true,
      title: 'Plaza 5 — the screens',
      text: (s) => [
        '@img assets/img/env/e39-screens.webp|Plaza 5 — the screens',
        'Sunday noon. The screens on Plaza 5 show the blurred figure for the hundredth time, and today the plaza does something it has never done: it starts to chant. Not words. One syllable, over and over, under its breath, so that no single mouth can be blamed. *Lam. Bda. Lam. Bda.*',
        'There is no Overwatch on the cinema roof. There is you, your teams, and three hundred people who have realised the same thing.',
      ],
      choices: [
        { t: 'Hold the plaza until the screens are switched off.', tag: 'CROWD', tagCls: 'duty', go: 'c7_2_crowd' },
        { t: 'Have GRID cut the screens now. Take away the face.', check: { skill: 'comms', diff: 10, pass: 'c7_2_cut', fail: 'c7_2_crowd' } },
        { t: 'Let them chant. Pull your teams back to the cinema steps.', tag: 'MERCY', tagCls: 'mercy', fx: set({ plaza: 'let' }, (st) => (G.distFx && G.distFx(st, 'plaza', -10, -10), { cons: 4, susp: 4, res: 5 })), go: 'c7_2_end' },
      ],
    },
    c7_2_crowd: {
      text: ['@sys Crowd control. Keep the plaza under the boil until the screens go off.'],
      mini: {
        type: 'crowd',
        opts: (s) => {
          const o = G.crowdOpts(s, { block: 'plaza', title: 'Plaza 5 — the chant', seconds: 45, events: ['The chant gets louder in the back rows', 'Somebody chalks a lambda on the barrier in front of you', 'A woman holds up a child to see the screen', 'The figure on the screen is replaced by the dam, and the chant gets louder', 'A stone hits the screen and cracks it'] });
          o.rate += 0.15;
          return o;
        },
        pass: 'c7_2_held',
        fail: 'c7_2_lost',
        skill: 'authority',
        diff: 20,
      },
    },
    c7_2_held: { enter: (s) => { s.c7.plaza = 'held'; }, text: ['At 13:10 the screens go dark. The chant goes on for a minute without them, then thins, then stops. Everyone goes home. Nobody forgets.'], choices: [{ t: 'Continue.', fx: { merit: 5, xp: { authority: 1 } }, go: 'c7_2_end' }] },
    c7_2_lost: { enter: (s) => { s.c7.plaza = 'lost'; G.distFx && G.distFx(s, 'plaza', -15, 15); }, text: ['The barrier goes over. Nobody attacks your teams; the crowd simply walks through them, chanting, and up onto the cinema steps, and stands there under the screens with its hands in the air. It is the most frightening thing you have ever seen.'], choices: [{ t: 'Continue.', fx: { hp: -8, merit: -2 }, go: 'c7_2_end' }] },
    c7_2_cut: { enter: (s) => { s.c7.plaza = 'cut'; }, text: ['The screens die mid-frame. The chant stops as if somebody had cut its throat, and three hundred faces turn from the dark screens to you. Then, slowly, they go home.'], choices: [{ t: 'Continue.', fx: { merit: 4, lp: 2 }, go: 'c7_2_end' }] },
    c7_2_end: { safe: true, enter: (s) => ((s.c7.stage = 3), (s.c7.next = s.day), 'u_duty_end'), text: [] },

    c7_3: {
      checkpoint: true,
      title: 'Sunday, 21:00 — the screens go dark',
      enter: (s) => {
        s.time = 'Night';
      },
      text: (s) => [
        '@img assets/img/env/e40-dark-stairs.webp|Stack 14, 21:00',
        'At 21:00 every screen in City 9 goes dark at once, and then every light in District 5. In the silence you hear it start: doors opening on every landing of every Stack, feet on the stairs, a single voice shouting a single syllable, and then a thousand.',
        s.c7.posture === 'nexus' ? 'Your teams are on the Nexus steps, behind sandbags, facing a city that has gone dark.' : s.c7.posture === 'stacks' ? 'Your teams are on the stairs of Stack 14 when the lights go. The people coming down the stairs know your teams’ faces.' : 'Your teams hold the armoury cage and the Plaza 5 hatches. Whatever happens tonight, it will have to come through you to get guns or bread.',
        s.c7.side === 'cells' ? `On your radio, on a channel that is not a Union channel, ${s.c7.who.name}’s voice: *Now.*` : veil(s) ? 'In your earpiece, VEIL: *Let it begin. Then give us names.*' : '@radio All C9 units: civil disorder, all districts. Officers hold. Repeat, officers hold.',
      ],
      choices: (s) => [
        { t: 'Hold. Every door, every stair, until dawn.', tag: 'BY THE BOOK', tagCls: 'loyal', check: { skill: 'authority', diff: s.c7.posture === 'stacks' ? 0 : 10, pass: 'c7_3_hold', fail: 'c7_3_hold_bad' } },
        { t: 'Open the armoury to the cells.', tag: 'RESISTANCE', tagCls: 'mercy', if: (st) => st.c7.side === 'cells' && st.c7.posture === 'armoury', go: 'c7_3_open' },
        { t: 'Order your teams to stand down and let D5 have its night.', tag: 'RESISTANCE', tagCls: 'mercy', if: (st) => st.c7.side === 'cells' || st.c7.side === 'aside', check: { skill: 'authority', diff: 10, pass: 'c7_3_aside', fail: 'c7_3_split' } },
        { t: 'Go out between the lines and talk. Get a truce till dawn.', tag: 'RISK', tagCls: 'risk', check: { skill: 'authority', diff: 20, pass: 'c7_3_truce', fail: 'c7_3_hold_bad' } },
        veil(s) ? { t: 'Walk among them in a citizen jacket and learn the names VEIL wants.', tag: 'VEIL', tagCls: 'duty', check: { skill: 'deception', diff: 10, pass: 'c7_3_veil', fail: 'c7_3_hold_bad' } } : null,
      ].filter(Boolean),
    },
    c7_3_hold: {
      enter: (s) => {
        s.c7.night = 'held';
        ['s9', 's14', 's22', 'bazaar', 'plaza'].forEach((k) => G.distFx && G.distFx(s, k, 15, 15));
      },
      text: ['You hold. All night, every landing, every door. Bottles, stones, a petrol bomb that burns out on the wet concrete. At 04:00 the power comes back, and the Stacks go quiet the way a held breath goes quiet.', 'At dawn, the Overwatch transports come back from City 17 early. They were never far away.'],
      choices: [{ t: 'Dawn.', fx: (s) => (s.squad && s.squad.formed && Math.random() < 0.5 && G.squadHit(s, true, 'the night the screens went dark'), { merit: 12, lp: 8, cons: -10, res: -30 }), go: 'c7_4' }],
    },
    c7_3_hold_bad: {
      enter: (s) => {
        s.c7.night = 'broken';
        ['s9', 's14', 's22', 'bazaar'].forEach((k) => G.distFx && G.distFx(s, k, -20, 20));
      },
      text: ['Your line breaks on the third landing, and then the second. Your teams fall back to the Nexus with the injured over their shoulders. By midnight District 5 belongs to whoever is on its stairs.', 'At 03:30 the Overwatch transports come back from City 17, and the Shrikes, and you hear what happens next from the Nexus steps.'],
      choices: [{ t: 'Dawn.', fx: (s) => (s.squad && s.squad.formed && G.squadHit(s, true, 'the stairwells of D5'), { hp: -25, merit: 2, cons: -6 }), go: 'c7_4' }],
    },
    c7_3_open: {
      enter: (s) => {
        s.c7.night = 'armed';
        Object.assign(s.c7, { done: true, stage: 9, endDay: s.day });
        G.discipline(s, 'grave', 'Opened the precinct armoury to anticitizens', 'collab');
      },
      text: (s) => [`You swing the cage door open. ${s.c7.who.name}’s people go past you into the armoury without a word, and come out armed. For six hours District 5 is free.`, 'At 03:30 the Overwatch transports come back from City 17. Somebody tells them who opened the cage.'],
      choices: [{ t: 'They come for you before dawn.', fx: { res: 40, cons: 10 }, go: 'disc_tribunal' }],
    },
    c7_3_aside: {
      enter: (s) => {
        s.c7.night = 'aside';
        ['s9', 's14', 's22', 'bazaar', 'plaza'].forEach((k) => G.distFx && G.distFx(s, k, -10, -20));
      },
      text: (s) => ['You give the order. Your teams look at you, and then, one by one, take their masks off and sit down on the steps. District 5 has its night: bonfires of ration wrappers, the screens smashed, singing on the landings, a canal-cell flag on the roof of Stack 14.', `${s.c7.who.name} finds you at 02:00, out of breath, and says only: *thank you. Now run.*`, 'At 03:30 the Overwatch transports come back.'],
      choices: [{ t: 'Dawn.', fx: { res: 25, cons: 12, susp: 25 }, go: 'c7_4' }],
    },
    c7_3_split: {
      enter: (s) => {
        s.c7.night = 'split';
        G.discipline(s, 'serious', 'Ordered units to stand down during civil disorder');
      },
      text: ['You give the order. Half your team obeys. The other half does not, and goes up the stairs without you. You spend the night not knowing which half was right.'],
      choices: [{ t: 'Dawn.', fx: (s) => (s.squad && s.squad.formed && G.squadHit(s, true, 'the stairs, without you'), { cons: 4, susp: 10 }), go: 'c7_4' }],
    },
    c7_3_truce: {
      enter: (s) => {
        s.c7.night = 'truce';
        ['s9', 's14', 's22', 'bazaar', 'plaza'].forEach((k) => G.distFx && G.distFx(s, k, 5, -10));
      },
      text: (s) => ['You walk out onto the landing of Stack 14 with your hands open and your mask off. It takes forty minutes and every word you have. At 22:10, on the third floor, between a line of your units and a line of people with pipes, a truce: nobody goes up, nobody comes down, until dawn.', `${s.c7.who.name} is on the other side of the landing. Neither of you says the other’s name.`, 'At 03:30 the Overwatch transports come back, and the truce is the first thing they ask about.'],
      choices: [{ t: 'Dawn.', fx: { cons: 10, merit: 4, susp: 8, rel: { vigil: 10 } }, go: 'c7_4' }],
    },
    c7_3_veil: {
      enter: (s) => {
        s.c7.night = 'veil';
      },
      text: ['In a citizen jacket, in the dark, you are nobody. You walk the landings of Stack 9 with the crowd, and you listen, and you remember. By 03:00 you have forty names, three addresses and the shape of the canal cells’ command.', 'At 03:30 the Overwatch transports come back. VEIL has your forty names by 03:35.'],
      choices: [{ t: 'Dawn.', fx: { cons: -12, susp: -10, res: -20, rel: { veilc: 20 } }, go: 'c7_4' }],
    },

    c7_4: {
      title: 'Dawn — the Nexus',
      enter: (s) => {
        s.time = 'Morning';
        s.day++;
        const n = s.c7.night;
        s.c7.pass = s.susp < 80 && n !== 'aside';
        const before = s.rank;
        if (s.c7.pass) {
          if (G.rankIdx(s.rank) < G.rankIdx('OfC')) G.promote(s, G.RANKS[G.rankIdx(s.rank) + 1]);
          G.fx(s, { merit: 10, lp: 3 });
        }
        s.c7.promoted = s.rank !== before;
        s.c7.done = true;
        s.c7.stage = 9;
      },
      text: (s) => {
        const n = s.c7.night;
        return [
          '@portrait assets/img/portraits/vigil.webp|Field Commander Vigil',
          n === 'held' ? '@say Vigil|You held. Overwatch came back to a city that had not needed it. I want you to understand how rarely that happens, and how much Overwatch dislikes it.' : n === 'truce' ? '@say Vigil|A truce. On a landing. With anticitizens. Overwatch wants your designation. I have told them you were following my orders. You were not. Now you are.' : n === 'veil' ? '@say Vigil|Forty arrests at dawn, all of them the right people, none of them from my lists. Somebody did very good work last night. I do not know who, and I have been told not to ask.' : n === 'aside' ? '@say Vigil|Your teams sat on the steps. Overwatch has photographs. There is nothing I can do for you except tell you to your face.' : '@say Vigil|District 5 broke. Overwatch mended it. That is the report City 17 will read.',
          s.c7.promoted ? `@doc PROMOTION: ${G.desig(s)}` : s.c7.pass ? '@sys Commended.' : '@sys No commendation. JURY has asked for your file.',
        ];
      },
      choices: [{ t: 'Continue.', go: 'c7_end' }],
    },
    c7_end: {
      checkpoint: true,
      title: 'End of Chapter Seven',
      enter: (s) => {
        if (s.c7.endDay === undefined) s.c7.endDay = s.day;
      },
      text: (s) => {
        const n = s.c7.night;
        return [
          n === 'aside' ? '@img assets/img/env/e41-stack-flag.webp|Stack 14, dawn' : null,
          n === 'aside' ? 'There is a canal-cell flag on the roof of Stack 14 for nineteen hours before a Shrike burns it off. Somebody photographs it. By the end of the week the photograph is in every city on the freight line.' : n === 'held' ? 'District 5 is quiet. The chalk under the screens is scrubbed every morning and back every night.' : 'District 5 is quiet in the way a bruise is quiet.',
          '@radio …relayed from City 17: Anticitizen One has been sighted at the prison complex known as Nova Prospekt. All units on the freight lines north of City 9 are to report any train that does not keep its schedule…',
          'In the mess, a 05 nobody knows asks out loud what Anticitizen One looks like. Nobody answers. The screen above the urn shows the blurred figure in the doorway, and everyone looks at it, and nobody sees a face.',
          `@doc ${G.desig(s)}\nDIVISION: ${s.div}\nRANK: ${G.RANK_NAMES[s.rank].toUpperCase()}\nDAYS IN SERVICE: ${s.day}`,
          '@sys CHAPTER SEVEN COMPLETE. You can keep serving on the duty board. Chapter Eight is coming.',
        ];
      },
      choices: [{ t: 'Return to duty.', go: 'u_duty_end' }],
    },
  });

  G.addCodex({
    anticitizen: {
      title: 'Anticitizen One',
      body: `<img src="assets/img/env/e39-screens.webp" alt="Anticitizen One" loading="lazy"><p>The Union's designation for the individual sought since the incident in City 17. Broadcast to every city with a single blurred image — a figure in a doorway, too far from the camera for a face — and a reward.</p>
      <p>No name has been released. Units who repeat names they have heard in the canals are reminded that the Union has issued a designation, and that designations are what the Union uses.</p>
      <p>The lambda chalked beneath the screens is the same mark the canal cells have used for years. Since the broadcast, JURY no longer catalogues it. There are too many.</p>`,
    },
  });
  G.CODEX_GROUPS.find((g) => g.title === 'The Universal Union').ids.push('anticitizen');
})();
