/* CHAPTER NINE — "Drowned Basements". All divisions. The necrotic comes inside the wall.
   A week of rain. The canals rise into the drowned basements of the Canal Quarter, and the old
   tunnels under the 404 wall open into them. Something comes through. Overwatch is in City 17.
   City 9 has its Civil Protection, VECTOR's jars and furnaces, and you.
   The COMMAND MAP returns in OUTBREAK MODE: infection per district, a CONTAIN order, blooms where
   it reaches 60. Between the command days:
   1 Block Warden Ostrova of Stack 9 is hiding a bitten family;
   2 bite screening at Plaza 5 (the watch minigame);
   3 District Prefect Sallow wants Stack 9 sealed with its people inside;
   4 the drowned basement, and a voice you know calling from it (the breach minigame);
   5 Formalin wants a live specimen;
   6 the source under Pump House 4: flood, burn, seal, or empty it first;
   7 the morning after.
   City 9's fate stays open. Freeman is not here: only the radio, and only by designation. */
(function () {
  const { adv, set } = G.chapter({ n: 9, stages: [[1, 'evening', 'c9_1'], [2, 'morning', 'c9_2'], [3, 'evening', 'c9_3'], [4, 'morning', 'c9_4'], [5, 'evening', 'c9_5'], [6, 'morning', 'c9_6']] });
  const C = (s) => s.c9;
  const FORMALIN = G.DVL && G.DVL.VECTOR ? `@portrait assets/img/portraits/${G.DVL.VECTOR.img}.webp|CCA.C9.D1-VECTOR-DvL-${G.DVL.VECTOR.id} — "Formalin"` : null;
  const voice = (s) => (s.c7 && s.c7.who ? s.c7.who.name : s.rel.mira !== undefined ? 'Mira' : 'Halloran');
  const inf = (s, k, v) => s.cmd && s.cmd.inf && (s.cmd.inf[k] = Math.max(0, Math.min(100, s.cmd.inf[k] + v)));

  G.PEOPLE.ostrova = { name: 'Warden Ostrova', role: 'Block Warden · Stack 9 · grey sash', img: null };
  G.PEOPLE.sallow = { name: 'Prefect Sallow', role: 'District Prefect · D5 · bronze medallion', img: null };

  G.extend('u_board', {
    text: (lines, s) => {
      if (s.c9 && !s.c9.done && s.c9.stage >= 1) lines.splice(1, 0, '@dispatch QUARANTINE PROTOCOL. Report bites, fevers and grey discoloration. Do not enter flooded basements. VECTOR has authority in D3.');
      return lines;
    },
  });

  G.addScenes({
    c9_start: {
      checkpoint: true,
      safe: true,
      title: 'Chapter Nine',
      enter: (s) => {
        s.chapter = 9;
        s.c9 = { stage: 0, next: s.day, startDay: s.day, score: 50, warden: null, screen: null, seal: null, basement: null, specimen: null, source: null, done: false };
        G.unlock(s, 'necrotic');
        if (s.rel.ostrova === undefined) s.rel.ostrova = 0;
      },
      text: [
        '@big CHAPTER NINE',
        '@sys ALL DIVISIONS · DROWNED BASEMENTS',
        '@img assets/img/env/e13-pumphouse.webp|Canal Quarter — the rain',
        'It rains for eight days. The canals come up over the towpaths and into the cellars of the Canal Quarter, the old drowned basements that run under half of D3 and, nobody likes to say, under the 404 wall.',
        'On the ninth morning a HELIX unit brings a boy of eleven to the Nexus with a bite on his forearm the shape of a mouth. The skin around it has gone the grey of wet ash. He keeps asking the unit what her name is, in her own voice.',
      ],
      choices: [{ t: 'Report to the operations room.', go: 'c9_0' }],
    },
    c9_0: {
      title: 'The Nexus — operations room',
      enter: (s) => {
        G.cmdStart(s, { chap: 'c9', inf: { d1: 0, d2: 10, d3: 45, d4: 12, d5: 28, d7: 0 } });
      },
      text: (s) => [
        FORMALIN,
        '@say Formalin|It came through the tunnels under the wall. It is in the basements of D3 and it has a foothold in the Stacks. Overwatch is in City 17. VECTOR has forty units, two furnaces and a great many jars.',
        '@portrait assets/img/portraits/vigil.webp|Field Commander Vigil',
        '@say Vigil|The district board is yours again. The rules have changed. You will see a number for every district. Keep it down. CONTAIN is VECTOR procedure: it works, and the blocks will hate you for it. Where nobody stands, it grows. Where it reaches forty, it spreads.',
        `@sys THE COMMAND MAP — OUTBREAK: infection per district (☣). New order: CONTAIN. Your teams: ${s.cmd.teams.map((t) => t.id + ' ' + t.lead).join(', ')}.`,
      ],
      choices: [{ t: 'Take the grease pencil.', fx: adv(0), go: 'u_board' }],
    },

    /* 1 — the warden */
    c9_1: {
      title: 'Stack 9 — the warden’s flat, 21:00',
      text: [
        'Block Warden Ostrova of Stack 9 is a citizen like any other, except for the grey sash across her jacket and the grey enamel badge on it. She has kept the block’s register for nine years. Tonight she opens her door before you knock.',
        '@say Ostrova|Fourth floor, flat 12. The Ilić family. The father was bitten in the cellar on Tuesday, carrying up coal. He is in the back room. His wife and two girls are sitting with him. I did not report it. You may write that down.',
        '@say Ostrova|He is still himself. Mostly. He asked me to take the girls if it gets worse. I said yes. Now I am asking you what yes means, officer.',
      ],
      choices: [
        { t: 'Call VECTOR. The whole flat goes to the Nexus tonight.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: adv(2, set({ warden: 'reported' }, (st) => (inf(st, 'd5', -8), (st.rel.ostrova -= 30), { merit: 5, lp: 3, cons: -8 }))), go: 'u_night' },
        { t: 'VECTOR takes the father. The girls stay with the warden.', fx: adv(2, set({ warden: 'split' }, (st) => (inf(st, 'd5', -5), (st.rel.ostrova += 10), { merit: 2, cons: 2 }))), go: 'u_night' },
        { t: 'Leave them tonight. Post a unit on the landing. Look again in the morning.', tag: 'MERCY', tagCls: 'mercy', fx: adv(2, set({ warden: 'waited' }, (st) => (inf(st, 'd5', 6), (st.rel.ostrova += 20), { cons: 4, susp: 3 }))), go: 'u_night' },
        { t: 'Report the warden as well. She hid a bite.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: adv(2, set({ warden: 'warden' }, (st) => (inf(st, 'd5', -8), (st.rel.ostrova = -100), G.distFx(st, 's9', 6, 10), { merit: 7, lp: 4, cons: -12 }))), go: 'u_night' },
      ],
    },

    /* 2 — bite screening */
    c9_2: {
      checkpoint: true,
      title: 'Plaza 5 — bite screening',
      text: [
        '@img assets/img/env/e10-ration.webp|Plaza 5',
        'The ration queue goes through a screening line before the hatches: sleeves up, collars down, a VECTOR unit with a lamp. Early-stage infection looks like a bruise that has forgotten to heal: grey threads under the skin, a fever the lamp can read. The queue is a thousand people long and it knows why it is standing there.',
      ],
      choices: [
        { t: 'Work the line yourself.', tag: 'SCREENING', tagCls: 'duty', go: 'c9_2_watch' },
        { t: 'Leave it to VECTOR and keep the queue calm.', check: { skill: 'authority', diff: 10, pass: 'c9_2_calm', fail: 'c9_2_panic' } },
      ],
    },
    c9_2_watch: {
      title: 'Bite screening',
      text: ['@sys Watch the line. One face at a time shows a tell: a sleeve pulled down, a hand that will not open, a fever sweat. Catch the bitten, spare the rest.'],
      mini: { type: 'watch', opts: { title: 'Plaza 5 — the screening line', need: 4, seconds: 40 }, pass: 'c9_2_ok', fail: 'c9_2_bad', skill: 'perception', diff: 10 },
    },
    c9_2_ok: { text: ['Four bitten out of a thousand, taken quietly out of the line and walked to the VECTOR van with a hand on the shoulder. The queue sees it done properly. That is the most you can give it.'], choices: [{ t: 'Back to the board.', fx: adv(2, set({ screen: 'good' }, (st) => (inf(st, 'd5', -10), (st.c9.score += 5), { merit: 4, xp: { perception: 1 } }))), go: 'u_board' }] },
    c9_2_bad: { text: ['You stop the wrong people and miss a man with his hand wrapped in a ration sack. He is three hatches down when he falls, and the queue breaks in every direction at once.'], choices: [{ t: 'Back to the board.', fx: adv(2, set({ screen: 'bad' }, (st) => (inf(st, 'd5', 8), G.distFx(st, 'plaza', -8, 10), (st.c9.score -= 4), { merit: -1 }))), go: 'u_board' }] },
    c9_2_calm: { text: ['You walk the line talking, the whole morning, mask on, voice low. Nobody runs. VECTOR finds three. The queue lets them be taken.'], choices: [{ t: 'Back to the board.', fx: adv(2, set({ screen: 'calm' }, (st) => (inf(st, 'd5', -6), (st.c9.score += 3), { cons: 2 }))), go: 'u_board' }] },
    c9_2_panic: { text: ['Somebody shouts *they are taking everyone*, and it is nearly true. The queue empties into the Stacks before the hatches open, taking whatever it was carrying with it.'], choices: [{ t: 'Back to the board.', fx: adv(2, set({ screen: 'panic' }, (st) => (inf(st, 'd5', 10), (st.c9.score -= 5), {}))), go: 'u_board' }] },

    /* 3 — the prefect */
    c9_3: {
      title: 'The Nexus — the Prefect’s office',
      text: (s) => [
        'The District Prefect of D5 has an office on the second floor of the Nexus and a bronze medallion on a ribbon that he touches when he is thinking. Prefect Sallow has governed the Stacks for six years from three kilometres away.',
        `@say Sallow|Stack 9 is ${G.cmdInf(s, 'd5') >= 35 ? 'lost' : 'at risk'}. The Upper Town is asking why the Stacks are allowed to breathe on it. I want the Stack 9 stairwells welded shut at every landing and the block held for fourteen days. Food through the windows. VECTOR at the doors.`,
        '@say Sallow|Four thousand people. Most of them will be fine. The ones who are not will not be in the Upper Town. That is the arithmetic. Will you carry it out, or shall I ask Overwatch when it comes back?',
      ],
      choices: (s) => [
        { t: 'Weld it shut.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: adv(2, set({ seal: 'welded' }, (st) => (inf(st, 'd5', -15), inf(st, 'd7', -5), G.distFx(st, 's9', 10, 30), (st.c9.score += 6), { merit: 6, lp: 4, cons: -15, res: 6 }))), go: 'u_night' },
        { t: 'Screen the block floor by floor instead. Slower. Nobody locked in.', tag: 'AUTHORITY', tagCls: 'duty', check: { skill: 'authority', diff: 15, pass: 'c9_3_screen_ok', fail: 'c9_3_screen_bad' } },
        { t: 'Agree, and leave the canal-side cellar door unwelded.', tag: 'RISK', tagCls: 'risk', if: (st) => st.res >= 15 || (st.c7 && st.c7.side === 'cells'), fx: adv(2, set({ seal: 'door' }, (st) => (inf(st, 'd5', -8), inf(st, 'd3', 6), (st.c9.score += 2), { cons: 6, res: 8, susp: 6 }))), go: 'u_night' },
      ],
    },
    c9_3_screen_ok: { text: ['Sallow gives you three days. You use them all. Floor by floor, flat by flat, a VECTOR lamp and your voice on every landing. Eleven taken. Four thousand still with a door they can open.'], choices: [{ t: 'Go home.', fx: adv(2, set({ seal: 'screened' }, (st) => (inf(st, 'd5', -12), (st.c9.score += 4), { merit: 4, cons: 6 }))), go: 'u_night' }] },
    c9_3_screen_bad: { text: ['@say Sallow|No. You are asking me to bet the Upper Town on your bedside manner. The welders go in at midnight. You will be there.'], choices: [{ t: 'Be there.', fx: adv(2, set({ seal: 'welded' }, (st) => (inf(st, 'd5', -15), G.distFx(st, 's9', 10, 30), { cons: -10 }))), go: 'u_night' }] },

    /* 4 — the drowned basement */
    c9_4: {
      checkpoint: true,
      title: 'Canal Quarter — the drowned basement',
      text: (s) => [
        '@img assets/img/env/e28-404-wall.webp|Under the wall',
        'SPEAR maps the drowned basements with ropes and lamps. At 06:10 their radio picks something up from under Pump House 4: a voice, very calm, repeating the same few words over and over in the dark water.',
        `It is ${voice(s)}’s voice. Saying your name.`,
        '@say SPEAR point|Mimic stage. It has heard that voice somewhere. Or it has heard the person. We can go down and find out which.',
      ],
      choices: [
        { t: 'Go down with SPEAR. Door by door.', tag: 'BREACH', tagCls: 'duty', go: 'c9_4_breach' },
        { t: 'Log the voice code. Do not answer. Seal the basement stair.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: adv(2, set({ basement: 'sealed' }, (st) => (inf(st, 'd3', -6), { lp: 2, cons: -3 }))), go: 'c9_4_sealed' },
      ],
    },
    c9_4_breach: {
      title: 'Under Pump House 4',
      text: ['@sys Six doors in waist-deep water. FIRE at what is not a person any more. HOLD on what still is.'],
      mini: { type: 'breach', opts: { title: 'Under Pump House 4', doors: 6 }, pass: 'c9_4_ok', fail: 'c9_4_bad', skill: 'firearms', diff: 15 },
    },
    c9_4_ok: { text: (s) => [`Behind the fifth door, on a shelf above the water, a radio on a loop, and beside it the thing that has been listening to it: grey, split down the back, mouthing ${voice(s)}’s words a beat behind the speaker. SPEAR burns it on the shelf.`, `${voice(s)} is not down here. ${voice(s)} was never down here. Somebody recorded them, a long time ago, and the basement kept the tape.`], choices: [{ t: 'Back up into the rain.', fx: adv(2, set({ basement: 'cleared' }, (st) => (inf(st, 'd3', -20), (st.c9.score += 6), { merit: 6, xp: { firearms: 1 } }))), go: 'u_board' }] },
    c9_4_bad: { text: ['The water is too deep and the lamp too small. You come back up the stair with one SPEAR unit carried between two others and the voice still calling behind you, patient, in a voice you love.'], choices: [{ t: 'Back up into the rain.', fx: adv(2, set({ basement: 'lost' }, (st) => (st.squad && st.squad.formed && G.squadHit(st, true, 'the drowned basement'), inf(st, 'd3', 8), (st.c9.score -= 4), { hp: -18 }))), go: 'u_board' }] },
    c9_4_sealed: { text: ['The stair is bricked up by noon. You can still hear it if you put your ear to the bricks. Several units do. Nobody admits it.'], choices: [{ t: 'Back to the board.', go: 'u_board' }] },

    /* 5 — the specimen */
    c9_5: {
      title: 'The floor without a number — VECTOR, 22:00',
      text: (s) => [
        FORMALIN,
        `@say Formalin|${s.c9.warden === 'waited' ? 'The Ilić father in Stack 9 — the one you left on his landing. He has reached Mimic. He is still in the flat.' : 'One of the bitten from your screening line has reached Mimic stage in our cells.'} I want him alive. Early to Bloom in one host, under glass, so that the next city does not have to learn it the way we are learning it.`,
        '@say Formalin|Sign the transfer and he comes to my floor. Do not sign and he goes to the furnace tonight, which is kinder, and teaches nobody anything.',
      ],
      choices: [
        { t: 'Sign the transfer.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: adv(2, set({ specimen: 'signed' }, (st) => ((st.c9.score += 3), (st.rel.formalin = (st.rel.formalin || 0) + 10), { merit: 4, lp: 2, cons: -10 }))), go: 'u_night' },
        { t: 'The furnace. Tonight.', tag: 'MERCY', tagCls: 'mercy', fx: adv(2, set({ specimen: 'furnace' }, { cons: 4 })), go: 'u_night' },
        { t: 'Ask to see him first.', fx: adv(2, set({ specimen: 'seen' }, { cons: 2 })), go: 'c9_5_see' },
      ],
    },
    c9_5_see: { text: ['Behind the glass a man in a citizen jacket sits on a steel bench, very straight, the back of the jacket split by something grey. When you come close he stands up and says, in your own voice, the last thing you said in the corridor outside.', 'You do not remember deciding. Formalin writes down whatever you said next.'], choices: [{ t: 'Go home.', go: 'u_night' }] },

    /* 6 — the source */
    c9_6: {
      checkpoint: true,
      title: 'Pump House 4 — the source',
      text: (s) => [
        '@img assets/img/env/e13-pumphouse.webp|Pump House 4',
        'VECTOR has found it: a chamber under Pump House 4 where the drowned basements meet the tunnels from the old town. The walls are grown over, floor to ceiling, grey and fibrous, like wet ash and lichen. It never glows. It breathes.',
        `@sys Infection now: ${G.CMD_DISTS.map((d) => d.code + ' ' + G.cmdInf(s, d.k)).join(' · ')}. Containment assessment: ${s.c9.score} / 100.`,
        '@say Vigil|Your decision, and your name on it.',
      ],
      choices: (s) => [
        { t: 'Flood the Canal Quarter from the dam. All of it, tonight.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: adv(1, set({ source: 'flood' }, (st) => (st.cmd && ((st.cmd.inf.d3 = 0), (st.cmd.inf.d4 = Math.max(0, st.cmd.inf.d4 - 10)), (st.cmd.d.d3.o = 10), (st.cmd.d.d3.r = 95)), (st.c9.score += 10), { merit: 8, lp: 5, cons: -20 }))), go: 'c9_7' },
        { t: 'Burn the chamber with VECTOR’s incinerators. Go down with them.', tag: 'RISK', tagCls: 'risk', check: { skill: 'fitness', diff: 15, pass: 'c9_6_burn_ok', fail: 'c9_6_burn_bad' } },
        { t: 'Empty the Canal Quarter first, through the canals, with the cells’ boats. Then flood it.', tag: 'RESISTANCE', tagCls: 'mercy', if: (st) => st.res >= 15 || (st.c7 && st.c7.side === 'cells') || st.c9.seal === 'door', check: { skill: 'authority', diff: 10, pass: 'c9_6_evac_ok', fail: 'c9_6_evac_bad' } },
        { t: 'Seal the tunnels and hold the line at the canal. No flooding.', fx: adv(1, set({ source: 'seal' }, (st) => (st.cmd && (st.cmd.inf.d3 = Math.max(0, st.cmd.inf.d3 - 15)), (st.c9.score -= 2), { cons: 4 }))), go: 'c9_7' },
      ],
    },
    c9_6_burn_ok: { text: ['Four hours in the chamber in a sealed suit, an incinerator lance in your hands, VECTOR on either side of you. The grey curls and blackens and the smell comes through the filters anyway. When you come up the stair it is dawn and the pump house is a shell.'], choices: [{ t: 'Dawn.', fx: adv(1, set({ source: 'burned' }, (st) => (st.cmd && ((st.cmd.inf.d3 = 5), (st.cmd.inf.d5 = Math.max(0, st.cmd.inf.d5 - 15))), (st.c9.score += 12), { merit: 10, hp: -10, xp: { fitness: 1 } }))), go: 'c9_7' }] },
    c9_6_burn_bad: { text: ['Halfway through, the chamber answers. Something in the walls moves toward the heat. The VECTOR unit beside you goes down, and the lance in your hands is the only reason the rest of you come back up the stair.'], choices: [{ t: 'Dawn.', fx: adv(1, set({ source: 'burned_bad' }, (st) => (st.squad && st.squad.formed && G.squadHit(st, true, 'Pump House 4'), st.cmd && (st.cmd.inf.d3 = 20), (st.c9.score += 4), { hp: -30, merit: 5 }))), go: 'c9_7' }] },
    c9_6_evac_ok: { text: (s) => [`${s.c7 && s.c7.who ? s.c7.who.name : 'The canal cells'} bring the boats. Through the night, lock by lock, the Canal Quarter empties into the Works and the rail yards: families, old men, a woman carrying a sewing machine. At 05:00 the last boat is out, and the dam opens.`, 'Nobody in the Nexus asks where the boats came from. Somebody will.'], choices: [{ t: 'Dawn.', fx: adv(1, set({ source: 'evacuated' }, (st) => (st.cmd && ((st.cmd.inf.d3 = 0), (st.cmd.d.d3.o = 30), (st.cmd.d.d3.r = 50)), (st.c9.score += 8), { merit: 6, cons: 10, res: 15, susp: 10 }))), go: 'c9_7' }] },
    c9_6_evac_bad: { text: ['The boats are too few and the night too short. At 05:00 Vigil gives the order anyway. You stand on the dam and do not count the lights still on in the Canal Quarter when the water goes in.'], choices: [{ t: 'Dawn.', fx: adv(1, set({ source: 'flood_late' }, (st) => (st.cmd && (st.cmd.inf.d3 = 0), (st.c9.score += 6), { cons: -12, res: 5 }))), go: 'c9_7' }] },

    /* 7 — the morning after */
    c9_7: {
      checkpoint: true,
      title: 'The Nexus — the morning after',
      enter: (s) => {
        s.time = 'Morning';
        s.day++;
        const c = s.c9;
        const avg = s.cmd ? G.CMD_DISTS.reduce((a, d) => a + G.cmdInf(s, d.k), 0) / G.CMD_DISTS.length : 0;
        c.avgInf = Math.round(avg);
        c.score = Math.max(0, Math.min(100, c.score - Math.round(avg / 3)));
        c.verdict = c.score >= 65 ? 'contained' : c.score >= 40 ? 'held' : 'spread';
        if (c.verdict !== 'spread') G.fx(s, { merit: c.verdict === 'contained' ? 15 : 6, lp: 3 });
        if (c.verdict === 'spread') s.flags.quarantine_d3 = s.day;
        if (s.cmd) s.cmd.on = false;
        c.done = true;
        c.stage = 9;
      },
      text: (s) => {
        const c = s.c9;
        return [
          FORMALIN,
          `@doc VECTOR — CONTAINMENT REPORT, CITY 9\nASSESSMENT: ${c.score} / 100\nAVERAGE INFECTION: ${c.avgInf}\nBLOOMS: ${s.cmd ? s.cmd.incidents : 0}\nVERDICT: ${c.verdict === 'contained' ? 'CONTAINED' : c.verdict === 'held' ? 'HELD — WATCH' : 'SPREAD — D3 QUARANTINED'}`,
          c.verdict === 'contained' ? '@say Formalin|Contained. I will write that word in the catalogue, and under it your designation. It is the first time I have written that word about this city.' : c.verdict === 'held' ? '@say Formalin|Held. Not contained. There will be another rain.' : '@say Formalin|It is in the Canal Quarter now the way it is in the old town. We will build a second wall. We are very good at walls.',
          c.source === 'flood' || c.source === 'flood_late' ? 'The Canal Quarter stands in two metres of water. The locks are open. Things float in the streets that nobody will name in a report.' : c.source === 'evacuated' ? 'The Canal Quarter stands in two metres of water, empty. Its people sleep in the Works, in the rail sheds, on the floors of strangers.' : c.source === 'burned' || c.source === 'burned_bad' ? 'Pump House 4 is a black shell. The Canal Quarter is still there, and so are its people, and so, under it, are the tunnels.' : 'The tunnels are bricked up. The bricks are watched day and night by units who say they cannot hear anything.',
          c.warden === 'warden' ? 'Warden Ostrova is not at the Stack 9 door any more. Someone else wears the grey sash, and keeps a very careful register.' : c.warden === 'waited' || c.warden === 'split' ? 'Warden Ostrova sends a message through the block: the Ilić girls are with her. She does not say thank you. She says they are eating.' : null,
        ];
      },
      choices: [{ t: 'Continue.', go: 'c9_end' }],
    },
    c9_end: {
      checkpoint: true,
      title: 'End of Chapter Nine',
      enter: (s) => {
        if (s.c9.endDay === undefined) s.c9.endDay = s.day;
      },
      text: (s) => [
        'The rain stops on the fourteenth day. The canals go down. The Canal Quarter smells of the river for a month, and of something else for longer.',
        '@radio …relayed: City 17 is not answering on any Union frequency. All cities will hold. Anticitizen One…',
        'The broadcast cuts out in the middle of the designation. Nobody in the mess says anything. Somebody switches the set off and on again, and it says nothing at all.',
        `@doc ${G.desig(s)}\nDIVISION: ${s.div}\nRANK: ${G.RANK_NAMES[s.rank].toUpperCase()}\nDAYS IN SERVICE: ${s.day}`,
        '@sys CHAPTER NINE COMPLETE. You can keep serving on the duty board. City 9’s story goes on.',
      ],
      choices: [{ t: 'Return to duty.', go: 'u_duty_end' }],
    },
  });

  G.addCodex({
    quarantine: {
      title: 'Quarantine protocol',
      body: `<p>When the necrotic crosses a wall, VECTOR has authority in the district it reaches. Bites, fevers and grey discoloration are reported; flooded basements are not entered; queues are screened before the ration hatches.</p>
      <p>An acting commander holds the district board in outbreak mode: every district carries an infection figure. <b>Contain</b> is VECTOR procedure — sealed suits, lamps and furnaces — and it is the only order that brings the figure down quickly. Where nobody stands, the figure grows. From forty, it spreads to the districts next door. From sixty, there are blooms.</p>
      <p>Block wardens are required to report bites in their blocks. Some do.</p>`,
    },
  });
  G.CODEX_GROUPS.find((g) => g.title === 'Procedure').ids.push('quarantine');
  G.afterRender.push((sc, id) => {
    if (/^c9_/.test(id)) G.unlock(G.state(), 'quarantine');
  });
})();
