/* CHAPTER TEN — "The Coast Road". All divisions. Outside the city for the first time.
   The Sector wants the old coast road north of City 9 cleared before its convoys run to City 17.
   You lead a Civil Protection task force into eight sectors of ruins along the road, where three
   kinds of people live: refugees who fled the cities, deserters from Civil Protection, and armed
   fighters of the Lambda Resistance. You do not know who is where until you look.
   THE SECTOR MAP (fog of war): every day in the field you choose ONE sector and ONE action —
   SCOUT (reveal who is there), NEGOTIATE (move them on; rebels withdraw), RAID (clear it; people get
   hurt), or BURN (clear it completely; nobody forgets). Rebels left standing raid your camp at night.
   Between the field days: a deserter you know, the refugee column at the toll plaza, a captured
   Lambda fighter who says the name the Union will not, an ambush in the rail cutting, and the church
   where refugees and rebels shelter together.
   Freeman is NAMED here for the first time — only by the resistance. The Union still says
   Anticitizen One. The player stays Civil Protection throughout. */
(function () {
  const { adv, set } = G.chapter({ n: 10, stages: [[1, 'evening', 'c10_1'], [2, 'morning', 'c10_2'], [3, 'evening', 'c10_3'], [4, 'morning', 'c10_4'], [5, 'evening', 'c10_5']] });
  const pick = G.pick;
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  G.COAST_MAP_IMG = 'assets/img/coast-map.webp'; /* the painted coast-road map; null draws a schematic */
  const W = 1600, H = 900;

  /* the eight sectors: [x, y, w, h] in map space, and who tends to live there */
  const SECTORS = [
    { k: 's1', code: 'S1', name: 'Toll Plaza', rect: [150, 612, 330, 288], mix: [10, 18, 0, 2, 0, 2] },
    { k: 's2', code: 'S2', name: 'Fuel Station', rect: [316, 478, 200, 140], mix: [4, 10, 0, 2, 1, 4] },
    { k: 's3', code: 'S3', name: 'Roadside Motel', rect: [650, 545, 280, 135], mix: [8, 16, 1, 3, 0, 2] },
    { k: 's4', code: 'S4', name: 'Fishing Village', rect: [975, 530, 320, 195], mix: [12, 24, 0, 1, 1, 3] },
    { k: 's5', code: 'S5', name: 'The Lighthouse', rect: [1320, 320, 260, 220], mix: [0, 3, 0, 1, 4, 7] },
    { k: 's6', code: 'S6', name: 'Rail Cutting', rect: [440, 60, 190, 400], mix: [0, 4, 1, 3, 3, 6] },
    { k: 's7', code: 'S7', name: 'The Quarry', rect: [38, 90, 370, 400], mix: [2, 8, 3, 6, 0, 2] },
    { k: 's8', code: 'S8', name: 'The Church', rect: [810, 175, 380, 225], mix: [14, 28, 0, 2, 2, 5] },
  ];
  G.COAST_SECTORS = SECTORS;
  const C = (s) => s.c10;
  const sec = (s, k) => C(s).sec[k];
  const nameOf = (k) => SECTORS.find((x) => x.k === k).name;
  const left = (s) => SECTORS.filter((x) => !sec(s, x.k).cleared);
  const status = (x) => (x.cleared ? 'cleared' : x.known ? (x.reb >= 4 ? 'hostile' : x.reb ? 'armed' : 'civil') : 'unknown');
  const COL = { cleared: '#7a8b92', hostile: '#d9534a', armed: '#e2a83f', civil: '#6fbf73', unknown: '#3f5a66' };
  const WORD = { cleared: 'Cleared', hostile: 'Lambda in force', armed: 'Armed', civil: 'Civilians', unknown: 'Unknown' };
  const who = (x) => `${x.ref} refugee${x.ref === 1 ? '' : 's'}, ${x.des} deserter${x.des === 1 ? '' : 's'}, ${x.reb} Lambda fighter${x.reb === 1 ? '' : 's'}`;

  function mapSvg(s, sel) {
    let g = `<svg viewBox="0 0 ${W} ${H}" class="cm-svg" role="img" aria-label="Map of the coast road">`;
    if (G.COAST_MAP_IMG) g += `<image href="${G.COAST_MAP_IMG}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>`;
    else {
      g += `<rect width="${W}" height="${H}" fill="#17201f"/>`;
      g += `<path d="M1150 0 C 1250 300, 1450 420, 1600 520 L1600 0 Z" fill="#0f1c24"/>`;
      g += `<path d="M0 900 L0 0 L1100 0 C 1180 260, 1380 420, 1600 520 L1600 900 Z" fill="#1b2421"/>`;
      g += `<path d="M0 760 C 400 700, 800 760, 1200 700 S 1500 640, 1600 640" stroke="#4a4f4a" stroke-width="26" fill="none"/>`;
      g += `<path d="M0 760 C 400 700, 800 760, 1200 700 S 1500 640, 1600 640" stroke="#8a8a6a" stroke-width="2" fill="none" stroke-dasharray="22 18"/>`;
      g += `<path d="M560 900 L560 560 L580 0" stroke="#3a3f3a" stroke-width="8" fill="none" stroke-dasharray="14 8"/>`;
      g += `<path d="M0 900 L80 860" stroke="#5fc8dd" stroke-width="3" opacity=".4"/>`;
      for (let i = 0; i < 60; i++) g += `<circle cx="${(i * 197) % 1600}" cy="${(i * 113) % 900}" r="${6 + (i % 5) * 3}" fill="#1f2b25" opacity=".8"/>`;
    }
    SECTORS.forEach((z) => {
      const x = sec(s, z.k);
      const st = status(x);
      const c = COL[st];
      const [rx, ry, rw, rh] = z.rect;
      g += `<g class="cm-zone${sel === z.k ? ' sel' : ''}">`;
      g += `<rect x="${rx + 4}" y="${ry + 4}" width="${rw - 8}" height="${rh - 8}" rx="6" fill="${c}" fill-opacity="${st === 'unknown' ? 0.28 : 0.14}" stroke="${c}" stroke-width="${sel === z.k ? 6 : 3}" ${st === 'unknown' ? 'stroke-dasharray="14 10"' : ''}/>`;
      g += `<text x="${rx + rw / 2}" y="${ry + rh / 2 - 6}" class="cm-code" fill="${c}">${z.code}</text>`;
      g += `<text x="${rx + rw / 2}" y="${ry + rh / 2 + 26}" class="cm-name">${z.name.toUpperCase()}</text>`;
      if (st === 'unknown') g += `<text x="${rx + rw / 2}" y="${ry + rh / 2 + 58}" class="cm-name" opacity=".7">?</text>`;
      g += '</g>';
    });
    g += `<g><circle cx="95" cy="700" r="16" fill="#5fc8dd"/><text x="95" y="746" class="cm-name">CAMP</text></g>`;
    return g + '</svg>';
  }
  G.coastMapSvg = mapSvg;

  /* the field day: a sector, then an action */
  G.extend('u_board', {
    before: (s) => {
      const c = C(s);
      if (!c || !c.on || c.done || c.fieldDay === s.day) return;
      /* a story beat due this morning plays first; the field day follows from its own u_board */
      if (G.beats.some((b) => b.time === 'morning' && !s.flags['beat_' + b.id] && b.when(s))) return;
      return 'cr_pick';
    },
  });

  const camp = (s, lines) => {
    const reb = left(s).reduce((a, x) => a + sec(s, x.k).reb, 0);
    if (reb >= 8 && Math.random() < 0.35) {
      lines.push('@sys NIGHT RAID — Lambda fighters hit the camp after dark. Tracer over the tents, a truck burning, someone shouting your designation from the trees.');
      G.fx(s, { hp: -10 });
      if (s.squad && s.squad.formed && G.squadHit) G.squadHit(s, true, 'the camp on the coast road');
      C(s).raids++;
    }
  };
  const tally = (s, x, how) => {
    const c = C(s);
    x.cleared = true;
    x.known = true;
    x.how = how;
    c.cleared++;
  };

  G.addScenes({
    cr_pick: {
      title: (s) => `The coast road — Day ${s.day - C(s).startDay + 1} in the field`,
      enter: (s) => {
        C(s).fieldDay = s.day;
      },
      text: (s) => [
        `@html <div class="citymap">${mapSvg(s, null)}<div class="cm-legend">${['unknown', 'civil', 'armed', 'hostile', 'cleared'].map((k) => `<span style="color:${COL[k]}">■ ${WORD[k]}</span>`).join('')}</div></div>`,
        `@sys Cleared ${C(s).cleared} of ${SECTORS.length}. The Sector wants six. One sector a day.`,
      ],
      choices: (s) =>
        left(s)
          .map((z) => {
            const x = sec(s, z.k);
            return { t: `**${z.code} ${z.name}** — ${x.known ? who(x) : 'unknown'}`, fx: (st) => ((C(st).target = z.k), null), go: 'cr_act' };
          })
          .concat([{ t: 'Stay in camp. Rest the teams.', fx: { hp: 10 }, go: 'u_duty_end' }]),
    },
    cr_act: {
      title: (s) => `${sec(s, C(s).target).known ? '' : '? '}${nameOf(C(s).target)}`,
      text: (s) => {
        const x = sec(s, C(s).target);
        return [
          x.known ? `@sys ${who(x)}.` : '@sys You do not know who is here. Smoke from one chimney. Washing on a line. Or a trap.',
          { s1: 'A toll plaza of the old motorway, cars rusted nose to tail in every lane, a sheet-metal village grown between them.', s2: 'A fuel station with the canopy collapsed over the pumps. Somebody has painted the pumps white, very carefully.', s3: 'A two-storey roadside motel, every door numbered, half of them boarded. A child’s bicycle outside room 12.', s4: 'A fishing village where the road meets the sea: upturned boats, nets drying on the old bus shelter, smoke from three chimneys.', s5: 'The lighthouse on the point, its lamp long dead. An antenna wire runs from the gallery down into the rocks.', s6: 'A deep cutting where the freight line runs through the hill. Good ground for an ambush, and everybody knows it.', s7: 'The old quarry, terraced into the hill, its machinery sheds patched with Union tarpaulins somebody stole.', s8: 'A stone church on the hill above the road. The bell has been taken down and is sitting in the grass by the door.' }[C(s).target],
        ];
      },
      choices: (s) => {
        const x = sec(s, C(s).target);
        const out = [];
        if (!x.known) out.push({ t: 'Scout it. Look before you act.', tag: 'SCOUT', tagCls: 'duty', check: { skill: 'perception', diff: 5, pass: 'cr_scout', fail: 'cr_scout_bad' } });
        out.push({ t: 'Negotiate: everyone moves on, nobody gets hurt.', tag: 'MERCY', tagCls: 'mercy', check: { skill: 'authority', diff: 5 + x.reb * 3, pass: 'cr_neg_ok', fail: 'cr_neg_bad' } });
        out.push({ t: 'Raid it. Doors, rooms, hands where we can see them.', tag: 'RAID', tagCls: 'duty', check: { skill: 'firearms', diff: Math.max(0, x.reb * 3 - 2), pass: 'cr_raid_ok', fail: 'cr_raid_bad' } });
        out.push({ t: 'Burn it. Nothing for them to come back to.', tag: 'BY THE BOOK', tagCls: 'loyal', go: 'cr_burn' });
        out.push({ t: 'Back to the map.', go: 'cr_pick_again' });
        return out;
      },
    },
    cr_pick_again: { enter: (s) => { C(s).fieldDay = -1; return 'cr_pick'; }, text: [] },
    cr_scout: {
      enter: (s) => {
        sec(s, C(s).target).known = true;
      },
      text: (s) => {
        const x = sec(s, C(s).target);
        return [`Two hours on your belly in the wet grass with field glasses. ${who(x)}.`, x.reb ? 'The fighters wear a hand-painted lambda on cloth over their hearts, white on whatever colour they had. Nobody in the city wears it where it can be seen.' : x.des ? 'Two of the men still wear civil police boots. One of them still walks like a unit.' : 'Families. A queue at a water butt. Someone singing.'];
      },
      choices: [{ t: 'Back to camp.', fx: { xp: { perception: 1 } }, go: 'cr_day_end' }],
    },
    cr_scout_bad: {
      enter: (s) => {
        sec(s, C(s).target).known = true;
      },
      text: (s) => [`They see you first. A shot cracks off the rocks a metre from your head. You count what you can on the way back down: ${who(sec(s, C(s).target))}.`],
      choices: [{ t: 'Back to camp.', fx: { hp: -6 }, go: 'cr_day_end' }],
    },
    cr_neg_ok: {
      enter: (s) => {
        const c = C(s);
        const x = sec(s, c.target);
        c.moved += x.ref;
        c.desLet += x.des;
        if (x.reb) {
          const next = left(s).find((z) => z.k !== c.target);
          if (next) sec(s, next.k).reb += x.reb;
        }
        tally(s, x, 'negotiated');
      },
      text: (s) => {
        const x = sec(s, C(s).target);
        return [`You walk in with your mask on and your hands empty and talk for an hour. By dusk ${nameOf(C(s).target)} is empty: ${x.ref ? 'the families walking north with their bundles' : 'the last of them gone over the hill'}${x.reb ? ', the fighters slipping away into the next ruin along the road with their rifles' : ''}${x.des ? ', the deserters among them, not looking at your armband' : ''}.`];
      },
      choices: [{ t: 'Back to camp.', fx: { cons: 3, merit: 2 }, go: 'cr_day_end' }],
    },
    cr_neg_bad: {
      text: ['Somebody fires before you have finished the first sentence. It does not matter who. Your team goes in the way it was trained to.'],
      choices: [{ t: 'Go in.', go: 'cr_raid_ok' }],
    },
    cr_raid_ok: {
      enter: (s) => {
        const c = C(s);
        const x = sec(s, c.target);
        const hurt = x.ref ? Math.max(1, Math.round(x.ref * (0.1 + Math.random() * 0.2))) : 0;
        c.harmed += hurt;
        c.detained += x.ref - hurt + x.reb;
        c.desHeld += x.des;
        x.hurt = hurt;
        if (x.reb >= 4 && s.squad && s.squad.formed && Math.random() < 0.5) G.squadHit(s, true, nameOf(c.target));
        tally(s, x, 'raided');
      },
      text: (s) => {
        const x = sec(s, C(s).target);
        return [`Room by room. It takes until noon. ${x.reb ? `${x.reb} Lambda fighters taken or dead.` : 'No fighters.'} ${x.des ? `${x.des} deserters, kneeling in the road with their hands on their heads.` : ''} ${x.ref ? `${x.ref} refugees detained for the convoy back to the city. ${x.hurt} of them are hurt, and one of the hurt is a child.` : ''}`];
      },
      choices: [{ t: 'Back to camp.', fx: (s) => ({ merit: 5, lp: 2, cons: -(2 + Math.min(6, sec(s, C(s).target).hurt * 2)) }), go: 'cr_day_end' }],
    },
    cr_raid_bad: {
      text: (s) => [`${nameOf(C(s).target)} was ready for you. You pull back under fire with a unit over each shoulder. The sector is still theirs.`],
      choices: [{ t: 'Back to camp.', fx: (s) => (sec(s, C(s).target).known = true, s.squad && s.squad.formed && G.squadHit(s, true, nameOf(C(s).target)), { hp: -14, merit: -2 }), go: 'cr_day_end' }],
    },
    cr_burn: {
      enter: (s) => {
        const c = C(s);
        const x = sec(s, c.target);
        c.burned++;
        c.harmed += x.ref + x.des;
        x.hurt = x.ref + x.des;
        tally(s, x, 'burned');
      },
      text: (s) => [`The incendiaries go in at dusk. ${nameOf(C(s).target)} burns all night. ${sec(s, C(s).target).known ? '' : 'You never learn who was inside. '}In the morning there is nothing to come back to, and smoke on the coast road that can be seen from City 9.`],
      choices: [{ t: 'Back to camp.', fx: { merit: 6, lp: 4, cons: -15, res: -10 }, go: 'cr_day_end' }],
    },
    cr_day_end: {
      safe: true,
      enter: (s) => {
        const lines = [];
        camp(s, lines);
        C(s).night = lines;
        if (C(s).cleared >= SECTORS.length) C(s).allClear = true;
        return lines.length ? undefined : 'u_duty_end';
      },
      text: (s) => C(s).night,
      choices: [{ t: 'Morning.', go: 'u_duty_end' }],
    },

    /* ========================================================= STORY */
    c10_start: {
      checkpoint: true,
      safe: true,
      title: 'Chapter Ten',
      enter: (s) => {
        s.chapter = 10;
        const secs = {};
        SECTORS.forEach((z) => {
          const [r0, r1, d0, d1, b0, b1] = z.mix;
          secs[z.k] = { ref: rint(r0, r1), des: rint(d0, d1), reb: rint(b0, b1), known: false, cleared: false };
        });
        s.c10 = { stage: 0, next: s.day, startDay: s.day, on: false, sec: secs, cleared: 0, moved: 0, harmed: 0, detained: 0, burned: 0, desLet: 0, desHeld: 0, raids: 0, fieldDay: -1, done: false };
        G.unlock(s, 'lambda');
      },
      text: [
        '@big CHAPTER TEN',
        '@sys ALL DIVISIONS · THE COAST ROAD',
        'For the first time since the Academy you leave the city. A column of six PT-Vs and two trucks goes out through the north gate at dawn, past the last checkpoint, onto the old coast road: four lanes of broken motorway running north along the sea towards City 17, full of rust and grass and people who are not supposed to exist.',
        '@say Vigil|The Sector will run convoys up this road within the month. Morow wants it clear. Refugees, deserters, the Lambda people. Clear means nobody between City 9 and the bridge at the county line. Six sectors at least. I do not care how. Yes, I do. Do it in a way you can write down.',
      ],
      choices: [{ t: 'Pitch the camp at the toll plaza.', fx: adv(0, set({ on: true })), go: 'u_board' }],
    },

    /* 1 — a deserter you know */
    c10_1: {
      title: 'The camp — evening',
      text: (s) => {
        const k = s.rel.rook !== undefined && !s.flags.rook_amputated ? 'Rook' : s.rel.wick !== undefined && !s.flags.wick_dead ? 'Wick' : 'a 03 from your first precinct';
        C(s).deserter = k;
        return [
          `The sentries bring in a man they caught stealing fuel from the trucks. Thin, bearded, in a citizen jacket over civil police boots. When the lamp comes up you know him before he speaks. ${k}.`,
          `@say ${k}|I put the mask down on the Plaza 5 steps the night the screens went dark and walked out of the city. There are thirty of us on this road. Units. We just stopped.`,
          `@say ${k}|You are going to clear the road. I know. Let me get the others out ahead of you. Or don’t. Your call, five. It always was going to be.`,
        ];
      },
      choices: [
        { t: 'Arrest him. He goes back on the convoy.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: adv(2, set({ desFate: 'arrested' }, { merit: 5, lp: 3, cons: -8 })), go: 'u_night' },
        { t: 'Let him go before the sentries change.', tag: 'MERCY', tagCls: 'mercy', fx: adv(2, set({ desFate: 'freed' }, (st) => (Object.values(st.c10.sec).forEach((x) => !x.cleared && (x.des = Math.max(0, x.des - 1))), { cons: 6, susp: 6 }))), go: 'u_night' },
        { t: 'Make him show you where the Lambda people are first.', tag: 'RISK', tagCls: 'risk', fx: adv(2, set({ desFate: 'used' }, (st) => (Object.values(st.c10.sec).forEach((x) => x.reb >= 3 && (x.known = true)), { merit: 3, cons: -3 }))), go: 'u_night' },
      ],
    },

    /* 2 — the refugee column */
    c10_2: {
      checkpoint: true,
      title: 'The toll plaza — the refugee column',
      text: ['A column comes down the road at first light: two hundred people walking south, away from City 17, with handcarts and children. They have no papers, or papers from cities that no longer answer. Somewhere in the column, the Sector says, are Lambda couriers.', '@sys Check their papers. Find the couriers. Everyone else goes back on the convoy to City 9, or north again.'],
      choices: [
        { t: 'Check the papers yourself.', tag: 'INSPECT', tagCls: 'duty', go: 'c10_2_docs' },
        { t: 'Wave the column north. Let City 17 have them.', tag: 'MERCY', tagCls: 'mercy', fx: adv(2, set({ column: 'north' }, { cons: 4, merit: -2 })), go: 'u_board' },
        { t: 'Everyone on the convoy. Sort them in the city.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: adv(2, set({ column: 'convoy' }, (st) => ((st.c10.detained += 200), { merit: 4, cons: -6 }))), go: 'u_board' },
      ],
    },
    c10_2_docs: {
      title: 'The toll plaza — papers',
      text: ['@sys Inspect the papers. Wrong photos, expired stamps, forged cities.'],
      mini: { type: 'docs', opts: { count: 4 }, pass: 'c10_2_ok', fail: 'c10_2_bad', skill: 'perception', diff: 5 },
    },
    c10_2_ok: { text: ['Two couriers, both with perfect papers from City 11 that City 11 never issued. The rest of the column you send back down the road with the convoy, in order, and nobody is hurt.'], choices: [{ t: 'Back to the board.', fx: adv(2, set({ column: 'sorted' }, (st) => (Object.values(st.c10.sec).forEach((x) => !x.cleared && x.reb && Math.random() < 0.5 && (x.known = true)), { merit: 5, xp: { perception: 1 } }))), go: 'u_board' }] },
    c10_2_bad: { text: ['You miss them. A day later a truck in your column blows a tyre on a nail board that was not there yesterday.'], choices: [{ t: 'Back to the board.', fx: adv(2, set({ column: 'missed' }, { merit: -1 })), go: 'u_board' }] },

    /* 3 — the captured fighter: the name */
    c10_3: {
      checkpoint: true,
      title: 'The camp — the prisoner',
      text: [
        'They bring in a Lambda fighter taken in the rail cutting: a woman of about thirty in a padded vest over a citizen jacket, a medic’s white cloth tied round her arm, and over her heart a lambda painted by hand on a square of canvas. Her hands are tied. She is not frightened of you, which is new.',
        '@say The prisoner|You keep saying Anticitizen One, like a number. He has a name. Everybody north of the river knows it. They have known it since the train.',
        '@say The prisoner|Gordon Freeman.',
        'She says it the way people in the Stacks used to say the names of the dead: carefully, so nobody could take it off them.',
        '@say The prisoner|He was in Nova Prospekt. He came out. City 17 is burning because of one man in an orange suit who would not stop walking. And you are out here clearing a road for the Union’s trucks.',
      ],
      choices: [
        { t: '“That name goes in my report as an anticitizen designation.” Have her taken to the convoy.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: adv(2, set({ prisoner: 'convoy' }, { merit: 4, lp: 3 })), go: 'u_night' },
        { t: 'Question her: where is the Lambda command on this road?', tag: 'AUTHORITY', tagCls: 'duty', check: { skill: 'authority', diff: 15, pass: 'c10_3_talk', fail: 'c10_3_silent' } },
        { t: 'Ask her what he looks like.', fx: adv(2, set({ prisoner: 'asked' }, { cons: 2 })), go: 'c10_3_ask' },
      ],
    },
    c10_3_talk: { text: ['She tells you about the lighthouse, because she knows you will find it anyway and wants you to know she chose to say it. *“There is a radio there. It talks to City 17 every night. Go and listen to it before you burn it.”*'], choices: [{ t: 'Go to sleep.', fx: adv(2, set({ prisoner: 'talked' }, (st) => (st.c10.sec.s5.known = true, { merit: 3 }))), go: 'u_night' }] },
    c10_3_silent: { text: ['She looks at your lenses and says the name again, once, and then nothing at all for the rest of the night.'], choices: [{ t: 'Go to sleep.', fx: adv(2, set({ prisoner: 'silent' }, {})), go: 'u_night' }] },
    c10_3_ask: { text: ['@say The prisoner|Glasses. A beard. He never says anything. That is what everybody says: he never says anything. He just keeps coming.', 'She laughs, very quietly, at your mask. *“A bit like you.”*'], choices: [{ t: 'Go to sleep.', go: 'u_night' }] },

    /* 4 — the ambush in the cutting */
    c10_4: {
      checkpoint: true,
      title: 'The rail cutting — ambush',
      text: ['The convoy taking your detainees back to City 9 goes through the rail cutting at 07:30. At 07:31 the hillside opens up on both sides. The lead PT-V stops dead with a burning tyre, and the cutting fills with smoke and shouting and the hard flat sound of rifles.'],
      choices: [
        { t: 'Take the point. Clear the cutting door by door.', tag: 'BREACH', tagCls: 'duty', go: 'c10_4_breach' },
        { t: 'Hold the convoy and wait them out.', check: { skill: 'authority', diff: 15, pass: 'c10_4_hold', fail: 'c10_4_lost' } },
      ],
    },
    c10_4_breach: { title: 'The rail cutting', text: ['@sys Through the smoke, culvert by culvert. FIRE at fighters. HOLD on the detainees who ran.'], mini: { type: 'breach', opts: { title: 'The rail cutting', doors: 6 }, pass: 'c10_4_ok', fail: 'c10_4_lost', skill: 'firearms', diff: 15 } },
    c10_4_ok: { text: ['The cutting is yours by 08:15. Four fighters down, two taken. Not one detainee lost. The rail cutting is cleared, whether the map says so or not.'], choices: [{ t: 'To the board.', fx: adv(2, set({ ambush: 'won' }, (st) => (!st.c10.sec.s6.cleared && tally(st, st.c10.sec.s6, 'raided'), { merit: 6, xp: { firearms: 1 } }))), go: 'u_board' }] },
    c10_4_hold: { text: ['You keep the convoy under its own armour and let the fighters spend their ammunition on steel. At 09:00 they melt back into the hill. One truck lost. Nobody you can name.'], choices: [{ t: 'To the board.', fx: adv(2, set({ ambush: 'held' }, { merit: 3 })), go: 'u_board' }] },
    c10_4_lost: { text: ['The second truck burns. Half the detainees in it run into the hill, and some of your team do not come back up the cutting.'], choices: [{ t: 'To the board.', fx: adv(2, set({ ambush: 'lost' }, (st) => (st.squad && st.squad.formed && G.squadHit(st, true, 'the rail cutting'), (st.c10.detained = Math.max(0, st.c10.detained - 20)), { hp: -20, merit: -3 }))), go: 'u_board' }] },

    /* 5 — the church */
    c10_5: {
      checkpoint: true,
      title: 'The church on the hill',
      text: (s) => {
        const x = s.c10.sec.s8;
        return [
          x.cleared ? 'The church is already empty. But the refugees you moved from the rest of the road have gone somewhere, and the scouts say: up the hill, behind the old seminary, a second camp, with fighters among them.' : `The last place on the road with people in it: the stone church, ${x.known ? who(x) : 'more people than any other sector'}. Refugees in the pews. Lambda fighters in the bell tower. A deserter on the door. They all know you are coming.`,
          '@say Vigil|(on the radio) Morow wants it finished tonight. Your choice how. Write it down.',
        ];
      },
      choices: [
        { t: 'Negotiate a passage north for the refugees; the fighters go with them or fight.', tag: 'MERCY', tagCls: 'mercy', check: { skill: 'authority', diff: 15, pass: 'c10_5_pass', fail: 'c10_5_storm' } },
        { t: 'Storm it at dawn.', tag: 'RAID', tagCls: 'duty', go: 'c10_5_storm' },
        { t: 'Burn it with everyone inside who will not come out by midnight.', tag: 'BY THE BOOK', tagCls: 'loyal', go: 'c10_5_burn' },
      ],
    },
    c10_5_pass: { enter: (s) => { const x = s.c10.sec.s8; if (!x.cleared) (s.c10.moved += x.ref), tally(s, x, 'negotiated'); s.c10.church = 'passage'; }, text: ['At 02:00 a line of people walks out of the church into the dark with lamps, north along the road towards the county line. The fighters walk at the back of the line with their rifles reversed. One of them stops in front of you, looks at your lenses, and says the name again, very quietly, as a goodbye.'], choices: [{ t: 'Dawn.', fx: adv(1, { cons: 8, merit: 2 }), go: 'c10_end0' }] },
    c10_5_storm: { enter: (s) => { const x = s.c10.sec.s8; const h = Math.max(2, Math.round((x.ref || 10) * 0.25)); s.c10.harmed += h; s.c10.detained += x.ref; if (!x.cleared) tally(s, x, 'raided'); s.c10.church = 'stormed'; }, text: ['Dawn, smoke grenades, the doors. The bell tower holds out for twenty minutes. When it is over the pews are full of people lying flat with their hands on their heads, and some who are not moving.'], choices: [{ t: 'Morning.', fx: adv(1, (st) => (st.squad && st.squad.formed && G.squadHit(st, true, 'the church on the hill'), { merit: 6, lp: 3, cons: -10 })), go: 'c10_end0' }] },
    c10_5_burn: { enter: (s) => { const x = s.c10.sec.s8; s.c10.harmed += Math.round(x.ref / 2) + x.reb; s.c10.burned++; if (!x.cleared) tally(s, x, 'burned'); s.c10.church = 'burned'; }, text: ['Some come out before midnight. Not all. The church burns until morning, and the bell sits in the grass by the door with the fire reflected in it.'], choices: [{ t: 'Morning.', fx: adv(1, { merit: 8, lp: 5, cons: -25, res: -20 }), go: 'c10_end0' }] },

    c10_end0: {
      checkpoint: true,
      title: 'The coast road — the report',
      enter: (s) => {
        const c = s.c10;
        c.on = false;
        c.verdict = c.cleared >= 6 ? 'cleared' : c.cleared >= 4 ? 'partial' : 'failed';
        if (c.verdict === 'cleared') G.fx(s, { merit: 15, lp: 3 });
        else if (c.verdict === 'partial') G.fx(s, { merit: 6 });
        c.done = true;
        c.stage = 9;
      },
      text: (s) => {
        const c = s.c10;
        return [
          `@doc TASK FORCE COAST ROAD — REPORT\nSECTORS CLEARED: ${c.cleared} / ${SECTORS.length}\nMOVED ON: ${c.moved}\nDETAINED FOR CONVOY: ${c.detained}\nHARMED: ${c.harmed}\nSECTORS BURNED: ${c.burned}\nNIGHT RAIDS ON CAMP: ${c.raids}\nVERDICT: ${c.verdict === 'cleared' ? 'ROAD CLEAR' : c.verdict === 'partial' ? 'ROAD PARTIALLY CLEAR' : 'ROAD NOT CLEAR'}`,
          c.verdict === 'cleared' ? '@say Vigil|The road is clear. The convoys run on Monday. Morow has your report on her desk, and so do I. I read the harmed column first.' : '@say Vigil|The Sector will send its convoys up that road anyway. With Overwatch, when Overwatch comes back. You have given them a reason.',
          c.harmed > 20 ? 'On the drive back to City 9 nobody in your PT-V speaks. Smoke still stands over the coast road behind you.' : c.moved > 60 ? 'On the drive back you pass them on the hard shoulder: a long, slow line of people walking north, who stop and watch the column go by.' : null,
        ];
      },
      choices: [{ t: 'Continue.', go: 'c10_end' }],
    },
    c10_end: {
      checkpoint: true,
      title: 'End of Chapter Ten',
      enter: (s) => {
        if (s.c10.endDay === undefined) s.c10.endDay = s.day;
      },
      text: (s) => [
        'Back in City 9, the mess hall radio says what it has said for a week: Anticitizen One, Anticitizen One. Nobody at your table says the other name. You notice that you have started to hear it anyway, under the designation, every time.',
        `@doc ${G.desig(s)}\nDIVISION: ${s.div}\nRANK: ${G.RANK_NAMES[s.rank].toUpperCase()}\nDAYS IN SERVICE: ${s.day}`,
        '@sys CHAPTER TEN COMPLETE. You can keep serving on the duty board. City 9’s story goes on.',
      ],
      choices: [{ t: 'Return to duty.', go: 'u_duty_end' }],
    },
  });

  G.addCodex({
    lambda: {
      title: 'The Lambda Resistance',
      body: `<img src="assets/img/lambda-sheet.webp" alt="The Lambda Resistance" loading="lazy"><p>Outside the cities the resistance is not a scatter of cells. It is an army of the dispossessed: refugees, deserters, mill workers, medics, people who walked out of a city one night and did not stop. They wear civilian clothes under padded vests and scavenged webbing, and over the heart a lambda painted by hand, white on whatever cloth they had.</p>
      <p>Inside City 9 the canal cells sew the lambda inside the collar. On the coast road nobody hides it.</p>
      <p>Union broadcasts refer to the individual sought since City 17 as Anticitizen One. Lambda fighters use a name. Units are reminded that the Union has issued a designation, and that designations are what the Union uses.</p>`,
    },
  });
  G.CODEX_GROUPS.find((g) => g.title === 'City 9').ids.push('lambda');
})();
