/* CHAPTER EIGHT — "The Inspection". All divisions. The road to Squadron Leader.
   After the night D5 rose, the Sector sends its Administrator to decide whether City 9 can keep
   itself. Sector Administrator Morow arrives by train with a retinue and an Overwatch escort and
   will grade the city in ten days. A city that cannot keep order is "consolidated": a block of it
   is put on the trains north.
   Vigil gives you three teams and the district board: THE COMMAND MAP (command.js). Every morning
   you post your teams; every evening the city answers. Between the command days:
   1 the reception in the Upper Town: Morow wants the names of the night;
   2 the consolidation list: which block goes north, unless you stop it;
   3 the winter allocation: which district goes dark, signed by GRID's Division Leader;
   4 City 17 on the radio, Overwatch thinner still, and one of your teams cut off;
   5 your own Division Leader, who wants to know what you are;
   6 the verdict.
   The man from City 17 is only on the radio, by designation. */
(function () {
  const { adv, set } = G.chapter({ n: 8, stages: [[1, 'evening', 'c8_1'], [2, 'morning', 'c8_2'], [3, 'evening', 'c8_3'], [4, 'morning', 'c8_4'], [5, 'evening', 'c8_5'], [6, 'morning', 'c8_6']] });
  const MOROW = 'Sector Administrator Morow';
  const sup = (s) => (G.superiorOf ? G.superiorOf(s).name : 'Your officer');
  const C = (s) => s.c8;
  const worstBlock = (s) => ['s9', 's14', 's22'].sort((a, b) => s.dist[b].r - s.dist[b].o - (s.dist[a].r - s.dist[a].o))[0];
  const contact = (s) => (s.c7 && s.c7.who) || { key: 'katya', name: 'Katya', img: 'katya' };
  const dvl = (s) => {
    if (s.div === 'JURY') return { name: 'The Magistrate', img: 'magistrate', desig: 'CCA.C9.D5-JURY-DvL-02842' };
    const d = G.DVL && G.DVL[s.div || 'UNION'];
    return d ? { name: d.name, img: d.img, desig: `CCA.C9.D1-${s.div || 'UNION'}-DvL-${d.id}` } : { name: 'Your Division Leader', img: null, desig: '' };
  };

  G.PEOPLE.morow = { name: 'Sector Administrator Morow', role: 'Earth Administration · Sector 4', img: 'morow' };
  const MOROW_P = '@portrait assets/img/portraits/morow.webp|Sector Administrator Morow — Sector 4';

  G.extend('u_board', {
    text: (lines, s) => {
      if (s.c8 && !s.c8.done && s.c8.stage >= 1) lines.splice(1, 0, `@dispatch SECTOR INSPECTION IN PROGRESS. Day ${Math.max(1, s.day - s.c8.startDay + 1)} of 10. All districts to be kept in order.`);
      return lines;
    },
  });

  G.addScenes({
    c8_start: {
      checkpoint: true,
      safe: true,
      title: 'Chapter Eight',
      enter: (s) => {
        s.chapter = 8;
        s.c8 = { stage: 0, next: s.day, startDay: s.day, score: 50, named: null, consol: null, consolBlock: null, dark: null, ambush: null, dvl: null, done: false };
        G.unlock(s, 'administration');
        if (s.rel.morow === undefined) s.rel.morow = 0;
      },
      text: (s) => [
        '@big CHAPTER EIGHT',
        '@sys ALL DIVISIONS · THE INSPECTION',
        '@img assets/img/env/e42-sector-train.webp|D4 — the Sector train, 07:00',
        'The train from the Sector comes into the D4 yards at 07:00 with its blinds down. Three passenger cars, an Overwatch car front and back, and a flatbed with a black car lashed to it. The yard has been swept. The relocation platform has been swept twice.',
        `${MOROW} steps down first: a woman in her sixties in a long slate coat with the citizen’s own stand collar, cut from better cloth, and a silver chain of office with a laurel wreath on the medallion. Behind her, clerks with ledgers, two Overwatch soldiers, and the City Administrator, who has come down from the Nexus to meet her and looks, in daylight, very old.`,
        MOROW_P,
        `@say ${MOROW}|City 9 had a night. The Sector has read about it. I am here for ten days. At the end of them I will tell the Sector whether City 9 can keep itself, or whether parts of it should be consolidated with cities that can.`,
        '@sys Consolidated: relocated north, by train, a block at a time.',
      ],
      choices: [{ t: 'Report to Vigil.', go: 'c8_0' }],
    },
    c8_0: {
      title: 'The Nexus — operations room',
      enter: (s) => {
        G.cmdStart(s);
      },
      text: (s) => [
        '@portrait assets/img/portraits/vigil.webp|Field Commander Vigil',
        '@say Vigil|Overwatch has given me nothing for ten days and an Administrator who reads incident reports for pleasure. You have three teams. The district board is yours. Every morning before your own duty, you post them. Every evening, the city tells you whether you were right.',
        `@say Vigil|She will grade the city every day. She weighs the Upper Town double, because she sleeps there. Keep it quiet. Keep the Stacks from boiling. If you have to choose, choose where the incident reports will be read.`,
        `@sys THE COMMAND MAP: you command three teams (${s.cmd.teams.map((t) => t.id + ' — ' + t.lead).join(', ')}). Each morning: a district and an order for each. Each evening: a report, and the inspection assessment.`,
      ],
      choices: [{ t: 'Take the grease pencil.', fx: adv(0), go: 'u_board' }],
    },

    /* 1 — the reception */
    c8_1: {
      title: 'The Upper Town — the Administration residence, 20:00',
      text: (s) => {
        const n = s.c7 && s.c7.night;
        return [
          '@img assets/img/env/e43-reception.webp|The Upper Town — the reception',
          'A reception in the Upper Town for the Sector: real candles, a string trio of commended citizens, wine in glasses nobody in the Stacks has seen since the war. You stand by the wall in uniform with the other officers, and are looked at like furniture.',
          `${MOROW} finds you anyway. She knows your designation without asking.`,
          MOROW_P,
          `@say ${MOROW}|${n === 'aside' ? 'Your teams sat on the steps the night D5 rose. I have the photographs. I do not want you. I want the people who made the night.' : n === 'truce' ? 'A truce, on a landing. With anticitizens. Clever. Somebody on the other side of that landing organised the night. I want their names.' : n === 'veil' ? 'Forty arrests at dawn, all the right people. I want the ones who were not on the list.' : 'District 5 rose. Somebody organised it. I want their names, and I want them from someone who was there.'}`,
          `@say ${MOROW}|Names, by the end of the reception. The Sector will remember who helped.`,
        ];
      },
      choices: (s) => [
        { t: `Give her real names. ${contact(s).name}’s among them.`, tag: 'BY THE BOOK', tagCls: 'loyal', fx: adv(2, set({ named: 'cells' }, (st) => (st.rel[contact(st).key] !== undefined && (st.rel[contact(st).key] -= 100), (st.c8.score += 10), { merit: 8, lp: 5, res: -30, cons: -15 }))), go: 'u_night' },
        { t: 'Give her a unit instead: someone who failed that night, who is already finished.', tag: 'BETRAYAL', tagCls: 'risk', fx: adv(2, set({ named: 'unit' }, (st) => ((st.c8.score += 5), { merit: 3, cons: -10 }))), go: 'u_night' },
        { t: '“The ones who organised it are already dead.” Make it true enough.', tag: 'DECEPTION', tagCls: 'risk', check: { skill: 'deception', diff: 15, pass: 'c8_1_dead_ok', fail: 'c8_1_dead_bad' } },
        { t: '“I don’t know any names, Administrator.”', tag: 'MERCY', tagCls: 'mercy', fx: adv(2, set({ named: 'none' }, (st) => ((st.c8.score -= 8), { lp: -3, cons: 4, susp: 4 }))), go: 'u_night' },
      ],
    },
    c8_1_dead_ok: { text: [`She looks at you over the rim of her glass for a long moment, then nods. *“The dead are very convenient. The Sector likes convenience.”* She moves on to the next officer.`], choices: [{ t: 'Go home.', fx: adv(2, set({ named: 'dead' }, (st) => ((st.c8.score += 4), { cons: 2 }))), go: 'u_night' }] },
    c8_1_dead_bad: { text: [`@say ${MOROW}|Dead people do not chalk walls, officer. Somebody chalked the wall of my residence last night.`, 'She writes something in a small notebook with a silver pencil, and moves on.'], choices: [{ t: 'Go home.', fx: adv(2, set({ named: 'lied' }, (st) => ((st.c8.score -= 5), { susp: 6 }))), go: 'u_night' }] },

    /* 2 — the consolidation list */
    c8_2: {
      checkpoint: true,
      title: 'The Nexus — the Administrator’s office',
      enter: (s) => {
        s.c8.consolBlock = worstBlock(s);
      },
      text: (s) => [
        `A list on the City Administrator’s desk with the Sector seal at the top. One line on it: **${G.BLOCKS[s.c8.consolBlock].name}** — four thousand citizens — *for consolidation*. The trains are booked for the morning after the verdict.`,
        `@say ${MOROW}|The worst-kept block in the city. If the city passes, I may tear this up. If it does not, it goes north anyway, and I add another.`,
        'The City Administrator does not look at you. His hands are shaking very slightly on the blotter.',
        `@sys Inspection assessment: ${s.c8.score} / 100.`,
      ],
      choices: (s) => [
        { t: 'Accept it. Organise it properly, so nobody dies on the platform.', fx: adv(2, set({ consol: 'accepted' }, (st) => ((st.c8.score += 4), { merit: 4, cons: -8 }))), go: 'u_board' },
        { t: 'Argue with her numbers: the block’s order, its quotas, its output.', tag: 'AUTHORITY', tagCls: 'duty', check: { skill: 'authority', diff: Math.max(0, 25 - Math.round((s.c8.score - 50) / 2)), pass: 'c8_2_argue_ok', fail: 'c8_2_argue_bad' } },
        { t: 'Leave the Nexus and warn the block tonight.', tag: 'RESISTANCE', tagCls: 'mercy', fx: adv(2, set({ consol: 'warned' }, (st) => (G.distFx(st, st.c8.consolBlock, -10, -10), { res: 10, cons: 8, susp: 8 }))), go: 'u_board' },
      ],
    },
    c8_2_argue_ok: { text: (s) => [`You put the block’s own figures in front of her: quotas met, ration losses below the city average, three commendations this year. She reads them all, which nobody expected.`, `@say ${MOROW}|Fine. ${G.BLOCKS[s.c8.consolBlock].name} is withdrawn. Pending the verdict. Do not make me regret your arithmetic.`], choices: [{ t: 'Back to work.', fx: adv(2, set({ consol: 'withdrawn' }, { merit: 4, cons: 4 })), go: 'u_board' }] },
    c8_2_argue_bad: { text: [`@say ${MOROW}|You are arguing for four thousand people you have never met with numbers you have never checked. Sit down, officer.`], choices: [{ t: 'Sit down.', fx: adv(2, set({ consol: 'accepted' }, (st) => ((st.c8.score -= 3), { lp: -2 }))), go: 'u_board' }] },

    /* 3 — the winter allocation */
    c8_3: {
      title: 'Hydro — the distribution hall, 21:00',
      text: (s) => [
        G.DVL && G.DVL.GRID && G.DVL.GRID.img ? `@portrait assets/img/portraits/${G.DVL.GRID.img}.webp|"Dynamo" — GRID Division Leader` : null,
        'The winter allocation, two months early. The Sector wants the Upper Town lit through the inspection and the winter after it. The dam cannot do it and keep everything else.',
        '@say Dynamo|Somebody goes dark for the winter. The Administrator wants a unit to sign the list, so that it is a policing decision and not hers. She asked for you by name.',
      ],
      choices: (s) => [
        { t: 'Sign the Stacks. They are dark half the time anyway.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: adv(1, set({ dark: 'd5' }, (st) => (Object.keys(st.dist).forEach((k) => G.distFx(st, k, 0, 6)), (st.c8.score += 3), { merit: 4, cons: -8 }))), go: 'u_night' },
        { t: 'Sign the Works. Production drops; the Sector will notice.', fx: adv(1, set({ dark: 'd2' }, (st) => (st.cmd && (st.cmd.d.d2.r += 10), (st.c8.score -= 4), { cons: 2 }))), go: 'u_night' },
        { t: 'Sign the Upper Town. Let the commended be cold for once.', tag: 'RISK', tagCls: 'risk', fx: adv(1, set({ dark: 'd7' }, (st) => (st.cmd && (st.cmd.d.d7.r += 25), (st.c8.score -= 12), { cons: 8, res: 6, susp: 6 }))), go: 'u_night' },
        { t: 'Ask Dynamo to cook the meters so nobody goes fully dark.', tag: 'RADIO & PROTOCOL', tagCls: 'duty', check: { skill: 'comms', diff: s.div === 'GRID' ? 0 : 15, pass: 'c8_3_meters_ok', fail: 'c8_3_meters_bad' } },
      ],
    },
    c8_3_meters_ok: { text: ['Dynamo looks at you for a long time, then pulls a ledger across the desk and starts writing numbers that are almost true. *“Ninety percent, everywhere. Nobody dark. Nobody warm, either.”*'], choices: [{ t: 'Go home.', fx: adv(1, set({ dark: 'none' }, { cons: 4, susp: 3, merit: 2 })), go: 'u_night' }] },
    c8_3_meters_bad: { text: ['@say Dynamo|The Administrator’s clerks check meters. That is what clerks are for. Sign a district, or I will sign one for you, and it will be the Stacks.'], choices: [{ t: 'Let Dynamo sign the Stacks.', fx: adv(1, set({ dark: 'd5' }, (st) => (Object.keys(st.dist).forEach((k) => G.distFx(st, k, 0, 6)), { cons: -4 }))), go: 'u_night' }] },

    /* 4 — City 17 on the radio; a team cut off */
    c8_4: {
      checkpoint: true,
      title: (s) => `Morning — Day ${s.day}`,
      enter: (s) => {
        const ts = s.cmd ? s.cmd.teams : [];
        const t = ts.find((x) => x.o !== 'rest') || ts[0];
        s.c8.ambush = t ? { id: t.id, lead: t.lead, d: t.d } : { id: 'BLUE-1', lead: 'your team', d: 'd5' };
      },
      text: (s) => {
        const a = s.c8.ambush;
        const where = (G.CMD_DISTS.find((d) => d.k === a.d) || { name: 'the Stacks' }).name;
        return [
          '@radio …all cities: civil disorder in City 17. Anticitizen One has been sighted inside City 17. All Overwatch reserves north of Sector 4 are to proceed to City 17. Civil Protection in every city will hold…',
          'By 08:00 the last Overwatch car on Morow’s train has gone north. She has two soldiers left, and you.',
          `@radio BLUE command, BLUE command, this is ${a.id}. We are cut off in ${where}. A crowd at both ends of the street. They know Overwatch is gone. Request instructions.`,
        ];
      },
      choices: (s) => [
        { t: 'Send your other teams to pull them out.', fx: adv(2, set({ ambushR: 'teams' }, (st) => (st.cmd && st.cmd.teams.forEach((t) => (t.fat = Math.min(6, t.fat + 2))), { merit: 3 }))), go: 'c8_4_teams' },
        { t: 'Go yourself.', tag: 'AUTHORITY', tagCls: 'duty', check: { skill: 'authority', diff: 10, pass: 'c8_4_me_ok', fail: 'c8_4_me_bad' } },
        { t: 'Call the Sector’s two Overwatch soldiers.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: adv(2, set({ ambushR: 'ow' }, (st) => (st.cmd && (st.c8.ambush.d === 'd5' ? Object.keys(st.dist).forEach((k) => G.distFx(st, k, 6, 10)) : ((st.cmd.d[st.c8.ambush.d] || {}).r += 12)), (st.c8.score += 2), { lp: 2, cons: -6, res: -5 }))), go: 'c8_4_ow' },
        { t: '“Pull back. Leave the street to them.”', tag: 'MERCY', tagCls: 'mercy', fx: adv(2, set({ ambushR: 'pulled' }, (st) => ((st.c8.score -= 6), { cons: 3 }))), go: 'c8_4_pull' },
      ],
    },
    c8_4_teams: { text: (s) => [`Two teams converge on the street from both ends. The crowd thins into doorways before the batons are out. ${s.c8.ambush.id} walks out between them, all of them, very tired.`], choices: [{ t: 'To the board.', go: 'u_board' }] },
    c8_4_me_ok: { text: (s) => [`You walk into the street with your mask on and your hands empty and talk to the front row until the back row gets bored. ${s.c8.ambush.id} walks out behind you. Somebody in a window says your designation out loud, not unkindly.`], choices: [{ t: 'To the board.', fx: adv(2, set({ ambushR: 'me' }, (st) => ((st.c8.score += 4), { merit: 5, cons: 3 }))), go: 'u_board' }] },
    c8_4_me_bad: { text: (s) => [`A stone, then many. You and ${s.c8.ambush.id} come out of that street at a run, carrying someone. Morow’s clerk is waiting at the Nexus with the incident form already filled in.`], choices: [{ t: 'To the board.', fx: adv(2, set({ ambushR: 'me_bad' }, (st) => (st.squad && st.squad.formed && G.squadHit(st, true, 'a street with no Overwatch'), (st.c8.score -= 4), { hp: -15 }))), go: 'u_board' }] },
    c8_4_ow: { text: ['The two soldiers go in without a word. You hear it over the radio: a short, flat sequence of sounds, then nothing. The street is clear by 08:40. Nobody in it will forget who called them.'], choices: [{ t: 'To the board.', go: 'u_board' }] },
    c8_4_pull: { text: (s) => [`${s.c8.ambush.id} pulls back. The street keeps itself for a day: a barricade of bed frames, a chalk lambda the size of a door. Morow reads the incident report at breakfast.`], choices: [{ t: 'To the board.', go: 'u_board' }] },

    /* 5 — your Division Leader */
    c8_5: {
      title: 'The Nexus — upper floors, 22:00',
      text: (s) => {
        const d = dvl(s);
        return [
          d.img ? `@portrait assets/img/portraits/${d.img}.webp|${d.desig} — ${d.name}` : null,
          `An office on the upper floors you have never been allowed into. ${d.name}, ${s.div || 'UNION'}'s Division Leader, three stars on the armband, does not get up.`,
          `@say ${d.name.replace(/"/g, '')}|When the Administrator leaves, there will be a board for my deputy. The board will ask what you did this week. I already know. I want to know what you are.`,
        ];
      },
      choices: [
        { t: '“I am what the Union needs me to be.”', tag: 'BY THE BOOK', tagCls: 'loyal', fx: adv(2, set({ dvl: 'loyal' }, { lp: 4, merit: 3 })), go: 'u_night' },
        { t: '“I kept four thousand people off a train if I could, and I would do it again.”', tag: 'MERCY', tagCls: 'mercy', fx: adv(2, set({ dvl: 'honest' }, { cons: 4 })), go: 'u_night' },
        { t: '“What happens to the block if the city fails?”', fx: adv(2, set({ dvl: 'asked' }, {})), go: 'c8_5_ask' },
      ],
    },
    c8_5_ask: { text: (s) => [`@say ${dvl(s).name.replace(/"/g, '')}|It goes north. Then the Sector sends someone to keep the rest, and that someone is not from here. You would be taking orders from a stranger. So would I.`], choices: [{ t: 'Go home.', go: 'u_night' }] },

    /* 6 — the verdict */
    c8_6: {
      checkpoint: true,
      title: 'D4 — the Sector train, 07:00',
      enter: (s) => {
        const c = s.c8;
        c.score = Math.max(0, Math.min(100, c.score));
        c.verdict = c.score >= 60 ? 'pass' : c.score >= 40 ? 'probation' : 'fail';
        c.consolDone = c.consol === 'accepted' || (c.consol === 'withdrawn' && c.verdict === 'fail') || (c.consol === 'warned' && c.verdict !== 'pass');
        if (c.consolDone) {
          G.distFx(s, c.consolBlock, -20, c.consol === 'warned' ? 10 : 25);
          s.flags['consolidated_' + c.consolBlock] = s.day;
        }
        const before = s.rank;
        c.pass = c.verdict !== 'fail' && s.susp < 80;
        if (c.pass) {
          if (G.rankIdx(s.rank) < G.rankIdx('SqL')) G.promote(s, G.RANKS[G.rankIdx(s.rank) + 1]);
          G.fx(s, { merit: c.verdict === 'pass' ? 15 : 6, lp: 3 });
        }
        c.promoted = s.rank !== before;
        if (s.cmd) s.cmd.on = false;
        c.done = true;
        c.stage = 9;
      },
      text: (s) => {
        const c = s.c8;
        return [
          '@img assets/img/env/e42-sector-train.webp|D4 — the Sector train',
          `@doc SECTOR 4 — INSPECTION OF CITY 9\nASSESSMENT: ${c.score} / 100\nINCIDENTS: ${s.cmd ? s.cmd.incidents : 0}\nVERDICT: ${c.verdict === 'pass' ? 'CITY RETAINED' : c.verdict === 'probation' ? 'CITY RETAINED ON PROBATION' : 'PARTIAL CONSOLIDATION'}`,
          `@say ${MOROW}|${c.verdict === 'pass' ? 'City 9 keeps itself. For now. I will tell the Sector it was an officer who kept it, and the Sector will remember your designation. That is not always a kindness.' : c.verdict === 'probation' ? 'City 9 keeps itself, on paper, until I come back. I will come back.' : 'City 9 cannot keep itself. The Sector will send someone who can.'}`,
          c.consolDone ? `${G.BLOCKS[c.consolBlock].name} goes north on the same train. ${c.consol === 'warned' ? 'Half its flats are empty when the units knock: the canals took them in the night.' : c.consol === 'accepted' ? 'You organised it. Nobody died on the platform. You will hear that sentence in your head for a long time.' : 'Your arithmetic did not save it in the end.'}` : c.consol ? `The consolidation list goes back into Morow’s case, unsigned.` : null,
          c.promoted ? `@doc PROMOTION: ${G.desig(s)}` : c.pass ? '@sys Commended.' : '@sys No commendation.',
        ];
      },
      choices: [{ t: 'Watch the train leave.', go: 'c8_end' }],
    },
    c8_end: {
      checkpoint: true,
      title: 'End of Chapter Eight',
      enter: (s) => {
        if (s.c8.endDay === undefined) s.c8.endDay = s.day;
      },
      text: (s) => [
        'The district board in the operations room is wiped clean. Your three magnetic markers go back in the drawer. For ten days you held a city, or part of one, and the city held you back.',
        '@radio …City 17: fighting in the streets. All units north of the river are to consider every freight train a threat. Anticitizen One has not been located…',
        G.rankIdx(s.rank) >= G.rankIdx('SqL') ? '@sys Squadron Leader: the highest rank open to you. Your division already has its Division Leader.' : null,
        `@doc ${G.desig(s)}\nDIVISION: ${s.div}\nRANK: ${G.RANK_NAMES[s.rank].toUpperCase()}\nDAYS IN SERVICE: ${s.day}`,
        '@sys CHAPTER EIGHT COMPLETE. You can keep serving on the duty board. Chapter Nine is coming.',
      ],
      choices: [{ t: 'Return to duty.', go: 'u_duty_end' }],
    },
  });

  G.addCodex({
    inspection: {
      title: 'Sector inspections',
      body: `<p>A city that has had a night is inspected by its <b>Sector Administrator</b>: ten days, a train, clerks with ledgers, and an assessment out of a hundred, written every evening. The Upper Town counts double, because that is where inspectors sleep.</p>
      <p>A city that fails is <b>consolidated</b>: its worst-kept block is put on the trains north, to a city that can keep it. A city on probation is inspected again. A city that passes is told that it has passed, which is not the same thing as being left alone.</p>`,
    },
  });
  G.CODEX_GROUPS.find((g) => g.title === 'The Universal Union').ids.push('inspection');
  G.afterRender.push((sc, id) => {
    if (/^c8_/.test(id)) G.unlock(G.state(), 'inspection');
  });
})();
