/* CHAPTER SIX — "Collection". All divisions. Grade: officer's work.
   Overwatch now collects Civil Protection reserves every week, and the ones it collects do not come
   back as units. In City 9 a "railway" moves people north along the freight line toward City 17 —
   the people who help the man nobody names. Someone you love is part of it.
   You are senior enough now that others die of what you decide.
   VEIL, if you are in its shadow, wants the railway alive so it can follow it north.
   The man from City 17 is still never named or seen. */
(function () {
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const adv = (gap, extra) => (s) => {
    s.c6.stage++;
    s.c6.next = s.day + (gap === undefined ? 1 : gap);
    return extra ? (typeof extra === 'function' ? extra(s) : extra) : null;
  };
  const set = (o, fx) => (s) => (Object.assign(s.c6, o), typeof fx === 'function' ? fx(s) : fx || null);
  const team = (s) => (s.squad && s.squad.formed ? G.squadActive(s) : []);
  const sup = (s) => (G.superiorOf ? G.superiorOf(s).name : 'Your officer');
  const veil = (s) => !!s.flags.veil_shadow;

  /* who from your own life is on the railway */
  const kin = (s) => {
    if (s.rel.mira !== undefined && !s.flags.mira_relocated) return { key: 'mira', name: 'Mira', img: 'mira', who: 'your sister' };
    if (s.rel.dana !== undefined) return { key: 'dana', name: 'Dana', img: 'dana', who: 'the woman in the red headscarf' };
    if (s.rel.halloran !== undefined && !s.flags.halloran_relocated) return { key: 'halloran', name: 'Old Halloran', img: 'halloran', who: 'your neighbour from Stack 14' };
    return { key: 'katya', name: 'Katya', img: 'katya', who: 'the girl from the lock culvert' };
  };

  G.extend('c5_end', {
    after: (s) => {
      if (s.c5 && s.c5.endDay === undefined) s.c5.endDay = s.day;
    },
    text: (lines) => lines.map((l) => (typeof l === 'string' && l.startsWith('@sys CHAPTER FIVE COMPLETE') ? '@sys CHAPTER FIVE COMPLETE. Chapter Six begins in a few days.' : l)),
  });
  const ready = (s) => s.phase === 'union' && s.c5 && s.c5.done && !s.c6 && s.day >= (s.c5.endDay !== undefined ? s.c5.endDay : -99) + 2;
  G.beats.push({ id: 'c6_go', time: 'morning', when: ready, scene: 'c6_start' });
  const stage = (id, n, time, scene) => G.beats.push({ id, time, when: (s) => s.c6 && s.c6.stage === n && s.day >= s.c6.next, scene });
  stage('c6s1', 1, 'evening', 'c6_1');
  stage('c6s2', 2, 'morning', 'c6_2');
  stage('c6s3', 3, 'evening', 'c6_3');
  stage('c6s4', 4, 'evening', 'c6_4');

  G.extend('u_board', {
    text: (lines, s) => {
      if (s.c6 && !s.c6.done && s.c6.stage >= 1) lines.splice(1, 0, '@dispatch WEEKLY RESERVE COLLECTION in effect. Officers will select. Overwatch will collect. Transport departs the Nexus roof on Sunday, 05:00.');
      return lines;
    },
  });

  G.addScenes({
    /* ============================================ the collection */
    c6_start: {
      checkpoint: true,
      safe: true,
      title: 'Chapter Six',
      enter: (s) => {
        s.chapter = 6;
        s.c6 = { stage: 0, next: s.day, picked: null, method: null, found: false, kinPart: null, train: null, done: false, kin: kin(s) };
        if (G.formSquad) G.formSquad(s);
      },
      text: (s) => [
        '@img assets/img/env/e36-collection.webp|Collection, the Nexus roof',
        '@big CHAPTER SIX',
        '@sys ALL DIVISIONS · COLLECTION',
        'The first collection transport lands on the Nexus roof on a Sunday at 05:00. An Overwatch soldier walks down the ramp with a slate, reads eleven designations aloud, and eleven units walk up the ramp without their masks, because they will not need them.',
        'A JURY clerk who processed the list tells the mess, in a whisper, what the slate said under the heading: *candidates for conversion*.',
        `@say ${sup(s)}|From this week you select. One unit from your team, every week, until the quota changes. I do not envy you. I envy anyone who is not you.`,
        `@sys Your team: ${team(s).map((m) => `${m.name} (${G.SQUAD_TRAITS[m.trait].label}, ${m.loyal >= 55 ? 'loyal' : m.loyal >= 35 ? 'steady' : 'doubtful'})`).join(' · ') || 'none'}.`,
      ],
      choices: (s) => [
        ...team(s).map((m) => ({ t: `Name ${m.name}.`, fx: (st) => ((st.c6.picked = m.id), null), go: 'c6_0_named' })),
        { t: 'Ask for a volunteer, and wait.', check: { skill: 'authority', diff: 10, pass: 'c6_0_vol', fail: 'c6_0_novol' } },
        { t: 'Put a name from the discipline list instead: a unit from another team with three strikes.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: set({ picked: 'other' }, { cons: -6, lp: 2 }), go: 'c6_0_other' },
      ],
    },
    c6_0_vol: {
      enter: (s) => {
        const m = team(s).slice().sort((a, b) => b.loyal - a.loyal)[0];
        s.c6.picked = m ? m.id : 'other';
      },
      text: (s) => {
        const m = s.squad && s.squad.members.find((x) => x.id === s.c6.picked);
        return m ? [`You stand in front of your team and say what the slate says. After a long silence ${m.name} takes one step forward.`, `@say ${m.name.replace(/"/g, '')}|Better me than someone who has people here.`] : ['Nobody steps forward. You put down a name from the discipline list.'];
      },
      choices: [{ t: 'Continue.', fx: (s) => (team(s).forEach((x) => (x.loyal = Math.min(100, x.loyal + 6))), null), go: 'c6_0_named' }],
    },
    c6_0_novol: {
      text: ['Nobody steps forward. Nobody looks at anybody. In the end you have to choose, and they all watch you do it.'],
      choices: (s) => team(s).map((m) => ({ t: `Name ${m.name}.`, fx: (st) => ((st.c6.picked = m.id), (team(st).forEach((x) => (x.loyal = Math.max(0, x.loyal - 4)))), null), go: 'c6_0_named' })).concat(team(s).length ? [] : [{ t: 'Continue.', go: 'c6_0_other' }]),
    },
    c6_0_other: {
      text: ['You put down a unit from another team, a 03 with three strikes and a habit of hitting citizens on the stairs. You tell yourself that is a reason. On Sunday he walks up the ramp without his mask. His face is younger than you expected.'],
      choices: [{ t: 'To the duty board.', fx: adv(0), go: 'u_board' }],
    },
    c6_0_named: {
      enter: (s) => {
        const m = s.squad && s.squad.members.find((x) => x.id === s.c6.picked);
        if (!m) return 'c6_0_other';
        m.status = 'transferred';
        m.lost = 'Overwatch collection';
        s.c6.pickedName = m.name;
      },
      text: (s) => [`On Sunday ${s.c6.pickedName} walks up the ramp without a mask. At the top they turn round, once, and look for you in the crowd on the roof. You make sure they find you.`, 'The transport lifts off toward City 17. Somewhere between here and there, the slate says, a unit becomes something else.'],
      choices: [{ t: 'To the duty board.', fx: adv(0, { cons: -4 }), go: 'u_board' }],
    },

    /* ============================================ the railway */
    c6_1: {
      title: (s) => `Evening — Day ${s.day}`,
      text: (s) =>
        veil(s)
          ? [
              'The black armband in your locker has a note pinned to it tonight. *The railway. People are going north on the freight line, to City 17, to help him. We want to know who runs it. We do not want it stopped. Not yet.*',
              '@portrait assets/img/portraits/veil-ofc.webp|VEIL',
              'Under the note, in a different hand: *You have a week.*',
            ]
          : [
              `@say ${sup(s)}|JURY has a directive for every officer and senior unit. Somebody in City 9 is moving people north on the freight line: smugglers, deserters, people with skills City 17 needs. Overwatch calls it the railway. Overwatch wants it closed by Sunday.`,
              `@say ${sup(s)}|You have sources. Use them.`,
            ],
      choices: [{ t: 'Go home and think about where to start.', fx: adv(1), go: 'u_night' }],
    },
    c6_2: {
      title: 'The railway — where to start',
      text: ['A freight line runs north from the D4 yards: coal out, scrap back, relocation trains on Thursdays. Somewhere along it, people are getting on who are not on any list.'],
      choices: (s) => [
        { t: 'Follow a signalman from the yards after his shift.', tag: 'TAIL', tagCls: 'duty', go: 'c6_2_tail' },
        s.inf && s.inf.list.some((x) => x.status === 'active') ? { t: 'Lean on your informants.', check: { skill: 'authority', diff: 5, pass: 'c6_2_found', fail: 'c6_2_cold' } } : null,
        { t: 'Read the yard manifests in the archive for loads that weigh too much.', check: { skill: 'perception', diff: 10, pass: 'c6_2_found', fail: 'c6_2_cold' } },
        { t: 'Raid a flat in Stack 9 where the canal cells used to meet.', tag: 'RAID', tagCls: 'duty', fx: (st) => ((st.c6.method = 'raid'), (st.raid = G.makeRaid(st, { claim: 'hide', guilty: true, addr: 'Stack 9, flat 2B' })), (st.raid.ret = 'c6_2_found'), null), go: 'raid_start' },
      ].filter(Boolean),
    },
    c6_2_tail: {
      text: ['@sys Follow the signalman without being seen.'],
      mini: { type: 'tail', opts: { title: 'The railway — the signalman', steps: 8, success: 'He walks past his own block, past the canal, to a lock-keeper’s hut on the freight line, and knocks: twice, then once.' }, pass: 'c6_2_found', fail: 'c6_2_cold', skill: 'perception', diff: 15 },
    },
    c6_2_found: {
      enter: (s) => {
        s.c6.found = true;
      },
      text: (s) => [
        '@img assets/img/env/e38-coal-wagon.webp|Inside the coal wagon',
        'The railway is a lock-keeper’s hut on the freight line north of the D4 yards, a signalman who switches a coal train onto a siding for six minutes every Thursday night, and a list of names chalked on the inside of a coal wagon.',
        `One of the names on the wagon is written in a hand you know. ${s.c6.kin.name}.`,
      ],
      choices: [{ t: 'Continue.', fx: adv(1, { xp: { perception: 1 } }), go: 'u_duty_end' }],
    },
    c6_2_cold: {
      text: (s) => ['Nothing. A cold trail and a long day. But that evening a ration wrapper is pushed under your door, in a hand you know: *Thursday. The coal siding. Come alone, or do not come.*', `It is signed with a small ${s.c6.kin.key === 'mira' ? 'drawing of two kids on a roof' : 'lambda'}.`],
      choices: [{ t: 'Continue.', fx: adv(1, set({ found: true })), go: 'u_duty_end' }],
    },

    /* ============================================ kin */
    c6_3: {
      title: (s) => `${s.c6.kin.name} — the coal siding`,
      text: (s) => {
        const k = s.c6.kin;
        return [
          '@img assets/img/env/e12-railyard.webp|The D4 freight line',
          `@portrait assets/img/portraits/${k.img}.webp|${k.name}`,
          `${k.name} is waiting by the coal siding at dusk with a lamp turned low. ${k.who.charAt(0).toUpperCase() + k.who.slice(1)}, in a borrowed CWU jacket, with coal dust to the elbows.`,
          k.key === 'mira'
            ? '@say Mira|Don’t. Don’t say it in that voice. I know what you are. I’ve known since the day you came home with the mask in a bag. I chose this anyway. Somebody has to put people on trains that go somewhere.'
            : `@say ${k.name}|You found us. Of course you did. They made you good at this.`,
          `@say ${k.name}|Thursday night, the coal train stops for six minutes. Forty people get on. Doctors, engineers, a woman who can fix a Combine lock with a hairpin. City 17 needs them. He needs them.`,
          `@say ${k.name}|You can stop it. You can stop me. Or you can be somewhere else on Thursday night.`,
        ];
      },
      choices: (s) => [
        { t: '“I will be somewhere else.”', tag: 'MERCY', tagCls: 'mercy', fx: adv(1, (st) => ((st.c6.kinPart = 'promise'), G.fx(st, { rel: { [st.c6.kin.key]: 20 } }), { res: 10, cons: 5 })), go: 'u_night' },
        { t: '“Get off the list. Tonight. Whatever else happens, not you.”', check: { skill: 'authority', diff: 10, pass: 'c6_3_off', fail: 'c6_3_stay' } },
        { t: 'Arrest them here.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: adv(1, (st) => ((st.c6.kinPart = 'arrested'), G.fx(st, { rel: { [st.c6.kin.key]: -100 } }), { merit: 8, lp: 6, cons: -20, res: -40 })), go: 'c6_3_arrest' },
      ],
    },
    c6_3_off: { text: (s) => [`${s.c6.kin.name} looks at you for a long time, and then nods, once, the way you nod when you are too tired to argue. The name on the coal wagon will be scrubbed out tonight.`], choices: [{ t: 'Go home.', fx: adv(1, (st) => ((st.c6.kinPart = 'off'), { cons: 3 })), go: 'u_night' }] },
    c6_3_stay: { text: (s) => [`@say ${s.c6.kin.name}|No. You don’t get to save me and nobody else. Not any more.`], choices: [{ t: 'Go home.', fx: adv(1, (st) => ((st.c6.kinPart = 'stays'), null)), go: 'u_night' }] },
    c6_3_arrest: { text: (s) => [`${s.c6.kin.name} does not fight. They hold out their wrists for the zip-ties and look at you the whole time, and you take them to Level 4 yourself, because you could not stand for anyone else to.`], choices: [{ t: 'Go home.', go: 'u_night' }] },

    /* ============================================ Thursday night */
    c6_4: {
      checkpoint: true,
      title: 'Thursday night — the coal siding',
      enter: (s) => {
        s.time = 'Night';
      },
      text: (s) => [
        '@img assets/img/env/e37-coal-siding.webp|The coal siding, Thursday night',
        `${s.c6.kinPart === 'arrested' ? 'Without its organiser the railway runs anyway, ragged and late.' : 'The railway runs.'} At 23:40 the coal train slows into the siding. Shapes come out of the lock-keeper’s hut and the culverts, carrying children, carrying bags. Forty people, more.`,
        'High over the river a Shrike turns its searchlight along the line, slowly, toward the siding.',
        veil(s) ? 'In your earpiece, on a channel that should not exist, a flat voice: *Let it run. Tag the wagon. We follow it north.*' : `@radio All LOCK units, ${sup(s)}. Contact on the freight line. Officers on scene have command.`,
        'You are the officer on scene.',
      ],
      choices: (s) => [
        { t: 'Stop the train. Everyone off. Everyone processed.', tag: 'BY THE BOOK', tagCls: 'loyal', go: 'c6_4_stop' },
        { t: 'Hold your teams at the yard gate. Let the six minutes run out.', tag: 'MERCY', tagCls: 'mercy', check: { skill: 'deception', diff: 10, pass: 'c6_4_let', fail: 'c6_4_let_bad' } },
        { t: 'Request 10-78 AIR on the siding.', tag: 'BRUTAL', tagCls: 'risk', go: 'c6_4_air' },
        veil(s) ? { t: 'Let it run — and press a VEIL tracer into the frame of the last wagon.', tag: 'VEIL', tagCls: 'duty', check: { skill: 'deception', diff: 5, pass: 'c6_4_tag', fail: 'c6_4_let_bad' } } : null,
        { t: 'Call the Shrike off: report the contact as a coal crew, and stand between it and the line.', tag: 'RISK', tagCls: 'risk', check: { skill: 'comms', diff: 15, pass: 'c6_4_shield', fail: 'c6_4_air' } },
      ].filter(Boolean),
    },
    c6_4_stop: {
      enter: (s) => {
        s.c6.train = 'stopped';
        if (s.c6.kinPart === 'stays' || s.c6.kinPart === 'promise') s.c6.kinFate = 'taken';
      },
      text: (s) => [
        'Your teams go down the line with lamps and batons and take the wagons one by one. Forty-three people sit on the gravel with their hands on their heads while the coal train pulls out empty.',
        s.c6.kinFate === 'taken' ? `${s.c6.kin.name} is in the third wagon. They do not look at you when your teams bring them past. That is worse than if they had.` : null,
      ],
      choices: [{ t: 'Dawn.', fx: { merit: 10, lp: 6, cons: -15, res: -30 }, go: 'c6_5' }],
    },
    c6_4_let: {
      enter: (s) => {
        s.c6.train = 'ran';
      },
      text: ['You keep your teams at the gate checking each other’s kit for six minutes, in the cold, while somebody on the radio asks for your status twice. At 23:46 the coal train pulls out heavy, and the siding is empty.', 'Your report says the contact was a coal crew. Your team’s reports say the same. One of them looks at you a moment too long while they write it.'],
      choices: [{ t: 'Dawn.', fx: (s) => (team(s).forEach((m) => (m.loyal = G.clamp(m.loyal + (m.trait === 'book' ? -10 : 4), 0, 100))), { res: 20, cons: 10, susp: 8 }), go: 'c6_5' }],
    },
    c6_4_let_bad: {
      enter: (s) => {
        s.c6.train = 'stopped';
        G.discipline(s, 'serious', 'Held teams back from a confirmed contact on the freight line');
      },
      text: ['You hold your teams at the gate. The Shrike does not wait for you. Its searchlight finds the siding, and Overwatch takes the train without you.'],
      choices: [{ t: 'Dawn.', fx: { susp: 10, cons: -4 }, go: 'c6_5' }],
    },
    c6_4_air: {
      enter: (s) => {
        s.c6.train = 'air';
        G.unlock(s, 'airwatch');
      },
      text: ['The Shrike answers in four seconds. You hear the chin turret from the yard gate. The coal train does not leave the siding.', 'In the morning a CWU crew hoses down the gravel and does not look at the stains. The list chalked inside the coal wagon is still there. Nobody has crossed anything out.'],
      choices: [{ t: 'Dawn.', fx: { merit: 12, lp: 8, cons: -30, res: -50 }, go: 'c6_5' }],
    },
    c6_4_tag: {
      enter: (s) => {
        s.c6.train = 'tagged';
      },
      text: ['You walk along the train as it moves, a hand on each wagon as if counting, and press a small black disc into the frame of the last one. It blinks once and goes dark.', 'In your earpiece: *Received.* Somewhere, VEIL now knows exactly where the railway goes. So, now, does everyone VEIL tells.'],
      choices: [{ t: 'Dawn.', fx: { cons: -4, res: 5, susp: -6, rel: { veilc: 15 } }, go: 'c6_5' }],
    },
    c6_4_shield: {
      enter: (s) => {
        s.c6.train = 'shielded';
      },
      text: ['You key Airwatch in your flattest voice: *coal crew, siding 4, nothing to see*, and walk out onto the line in the searchlight with your officer’s stripe catching the light. For eleven seconds the Shrike hangs there deciding. Then it turns away up the river.', 'The coal train pulls out heavy at 23:46.'],
      choices: [{ t: 'Dawn.', fx: { res: 25, cons: 12, susp: 10 }, go: 'c6_5' }],
    },

    /* ============================================ after */
    c6_5: {
      title: 'Vigil’s office',
      enter: (s) => {
        s.time = 'Morning';
        s.day++;
        const ok = s.susp < 80;
        s.c6.pass = ok;
        if (ok && G.rankIdx(s.rank) < G.rankIdx('OfC')) {
          G.promote(s, G.RANKS[G.rankIdx(s.rank) + 1]);
          G.fx(s, { merit: 8, lp: 3 });
        } else if (ok) G.fx(s, { merit: 12, lp: 3 });
        s.c6.done = true;
        s.c6.stage = 9;
      },
      text: (s) => {
        const t = s.c6.train;
        return [
          '@portrait assets/img/portraits/vigil.webp|Field Commander Vigil',
          t === 'stopped' ? '@say Vigil|Forty-three detained. Overwatch has taken them for “assessment”. I would like you to remember that you delivered them, and that Overwatch said thank you.' : t === 'air' ? '@say Vigil|You called the Shrike on a coal siding. Overwatch has written to City 17 about you. I want you to understand that this is not a compliment.' : t === 'tagged' ? '@say Vigil|The railway ran. Somebody tagged it. Not on my orders. I find that I do not want to know on whose.' : '@say Vigil|A coal crew, your report says. Forty people missing from the Stacks this morning, says JURY. I have chosen to believe your report. I will not choose twice.',
          s.c6.pass && G.rankIdx(s.rank) <= G.rankIdx('OfC') && s.rank !== 'OfC' ? `@doc PROMOTION: ${G.desig(s)}` : s.c6.pass ? '@sys Commended. Squadron Leader is now within reach — an officer board, when your record allows.' : '@sys No commendation. Your file is being read on Level 4.',
        ];
      },
      choices: [{ t: 'Continue.', go: 'c6_end' }],
    },
    c6_end: {
      checkpoint: true,
      title: 'End of Chapter Six',
      text: (s) => {
        const k = s.c6.kin;
        const t = s.c6.train;
        return [
          k.key === 'mira' && (t === 'ran' || t === 'shielded' || t === 'tagged') && s.c6.kinPart !== 'off' && s.c6.kinPart !== 'arrested'
            ? 'Mira’s window in Stack 14 is dark the next night, and the night after. A month later a ration wrapper arrives with no stamp, carried by hand across two cities. Inside, a pencil drawing: two kids on a rooftop, and behind them, very small, a train going north.'
            : s.c6.kinPart === 'arrested'
            ? `${k.name} is on the next Thursday relocation train, the official one. You are on the platform. You are in command of the platform.`
            : `${k.name} is still in City 9. Neither of you mentions Thursday again.`,
          t === 'tagged' ? 'Three weeks later, the radio reports a raid in City 17: a safe house on the canals, eleven anticitizens detained. You do not know whether it was the railway. You know you will never stop wondering.' : null,
          '@radio …all cities: the anticitizen sought since the City 17 incident has been sighted moving along the canals. Civil Protection in every city will watch its railways. Description unchanged.',
          `@doc ${G.desig(s)}\nDIVISION: ${s.div}\nRANK: ${G.RANK_NAMES[s.rank].toUpperCase()}\nDAYS IN SERVICE: ${s.day}`,
          '@sys CHAPTER SIX COMPLETE. You can keep serving on the duty board. Chapter Seven is coming.',
        ];
      },
      choices: [{ t: 'Return to duty.', go: 'u_duty_end' }],
    },
  });

  G.addCodex({
    collection: {
      title: 'Reserve collection',
      body: `<img src="assets/img/env/e36-collection.webp" alt="Collection" loading="lazy"><p>From the City 17 incident onward, Overwatch draws Civil Protection reserves from every city by weekly quota. Officers select. Overwatch collects. The units are flown out without their masks.</p>
      <p>The collection slates list them as <i>candidates for conversion</i>. Overwatch soldiers were once something else. Nobody in Civil Protection says aloud what.</p>`,
    },
    railway: {
      title: 'The railway',
      body: `<img src="assets/img/env/e38-coal-wagon.webp" alt="The names in the wagon" loading="lazy"><p>Overwatch's name for the network that moves people north along the freight lines toward City 17: doctors, engineers, deserters, anyone the resistance there needs. In City 9 it runs on the D4 coal line, through a signalman's six-minute siding on Thursday nights.</p>
      <p>The names of the passengers are chalked inside the wagons. Nobody has ever crossed one out.</p>`,
    },
  });
  G.CODEX_GROUPS.find((g) => g.title === 'The Universal Union').ids.push('collection');
  G.CODEX_GROUPS.find((g) => g.title === 'City 9').ids.push('railway');
  ['c6_start'].forEach((id) => G.extend(id, { after: (s) => G.unlock(s, 'collection') }));
  ['c6_2_found', 'c6_2_cold'].forEach((id) => G.extend(id, { after: (s) => G.unlock(s, 'railway') }));
})();
