/* CHAPTER TWO — UNION: "The Quota"  ·  JURY: "The Leak"
   Grade 03 → 02. Story beats are staged per division and interleave with the duty board. */
(function () {
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  G.PEOPLE.wick = { name: '"Wick"', role: 'UNION 05 · your trainee', img: 'wick' };
  G.PEOPLE.vesna = { name: 'Vesna', role: 'JURY 02 · your partner', img: 'vesna' };
  G.PEOPLE.magistrate = { name: 'The Magistrate', role: 'JURY DvL-02842', img: 'magistrate' };

  /* advance the chapter-two stage; `gap` days until the next beat may fire */
  const adv = (gap, extra) => (s) => {
    s.c2.stage++;
    s.c2.next = s.day + (gap === undefined ? 1 : gap);
    return extra ? (typeof extra === 'function' ? extra(s) : extra) : null;
  };
  const stageBeat = (id, div, stage, time, scene) => ({
    id,
    time,
    when: (s) => s.c2 && s.c2.div === div && s.c2.stage === stage && s.day >= s.c2.next,
    scene,
  });

  G.beats.push(
    { id: 'c2_late', time: 'morning', when: (s) => s.flags.passed_03 && !s.c2 && (s.div === 'UNION' || s.div === 'JURY'), scene: 'c2_start' },
    stageBeat('c2u0', 'UNION', 0, 'morning', 'c2_u0'),
    stageBeat('c2u1', 'UNION', 1, 'evening', 'c2_u1'),
    stageBeat('c2u2', 'UNION', 2, 'morning', 'c2_u2'),
    stageBeat('c2u3', 'UNION', 3, 'evening', 'c2_u3'),
    stageBeat('c2u4', 'UNION', 4, 'morning', 'c2_u4'),
    stageBeat('c2j0', 'JURY', 0, 'morning', 'c2_j0'),
    stageBeat('c2j1', 'JURY', 1, 'morning', 'c2_j1'),
    stageBeat('c2j2', 'JURY', 2, 'evening', 'c2_j2'),
    stageBeat('c2j3', 'JURY', 3, 'morning', 'c2_j3'),
    stageBeat('c2j4', 'JURY', 4, 'evening', 'c2_j4'),
    stageBeat('c2j5', 'JURY', 5, 'morning', 'c2_j5')
  );

  /* JURY units do not stand ration lines or walk Bazaar Row */
  const UNION_ONLY = ['ration', 'checkpoint', 'market', 'inspection', 'railyard'];
  UNION_ONLY.forEach((k) => {
    const d = G.duties[k];
    if (!d) return;
    const old = d.if;
    d.if = (s) => s.div !== 'JURY' && (!old || old(s));
  });

  /* ---------------------------------------------------- interrogation */
  /* s.iq = { name, desc, guilty, knows, hard, ret, round, fear, trust, insight, said } */
  const SUBJECTS = [
    { name: 'Marta Halek', desc: 'a mill hand caught with a roll of leaflets in her coat lining', guilty: true, knows: 'the leaflets came off a press in a pump house cellar in D3' },
    { name: 'Josef Danek', desc: 'a ration clerk accused of selling spare cards', guilty: true, knows: 'he sold the cards to a man who pays in batteries on Bazaar Row' },
    { name: 'Ilja Sokol', desc: 'a labourer picked up near the rail yards after curfew', guilty: false, knows: 'he was looking for his son, who was relocated last spring' },
    { name: 'Anna Ruzek', desc: 'a widow whose neighbour reported "anti-citizen talk"', guilty: false, knows: 'the neighbour wants her apartment' },
    { name: 'Tomasz Bartos', desc: 'a dock worker found with a forged transit permit', guilty: true, knows: 'the permit was made by someone in the Canal Quarter who signs with a lambda' },
    { name: 'Eva Lind', desc: 'a schoolteacher accused of teaching pre-war history', guilty: false, knows: 'she only read the children a poem her mother taught her' },
  ];

  G.startIq = (s, subj, ret) => {
    s.iq = Object.assign({ hard: 3, round: 0, fear: 0, trust: 0, insight: 0, said: [] }, subj, { ret });
  };

  const iqApproach = (kind) => {
    const map = {
      press: { skill: 'authority', diff: 0, ok: { fear: 2 }, bad: { fear: 1, trust: -1 }, fx: { cons: -1 } },
      lie: { skill: 'deception', diff: 5, ok: { insight: 2 }, bad: { trust: -1 }, fx: {} },
      listen: { skill: 'perception', diff: 0, ok: { trust: 2, insight: 1 }, bad: { trust: 1 }, fx: { cons: 1 } },
      apply: { skill: 'melee', diff: -10, ok: { fear: 3 }, bad: { fear: 2 }, fx: { cons: -5 } },
    };
    return map[kind];
  };

  const IQ_TEXT = {
    press: ['You stand over the table and let your shadow fall across the subject. You tell them exactly how long a night on Level 4 is.', 'Your voice drops through the mask’s amplifier like a weight.'],
    lie: ['You tell them someone has already talked. You let them guess who.', 'You slide a blank form across the table and say it is a confession with their name on it.'],
    listen: ['You sit down. You let them talk. You watch their hands, their eyes, the pulse in their neck.', 'You ask about their family, and wait.'],
    apply: ['You set your stunstick to LOW and lay it on the table where they can see it. Then you pick it up.', 'You do what the room is for.'],
  };

  /* unit audit variants — `if` limits a variant to certain saves */
  const AUDITS = [
    { id: 'batteries', who: 'a UNION 04 from the night squad', find: 'a carton of confiscated batteries with the evidence tags cut off', lvl: 'theft of seized property', note: 'The same batteries turn up on Bazaar Row every week at half the ration price. Now you know where from.' },
    { id: 'biogel', who: 'a HELIX 03', find: 'six vials of biogel rolled in a sock', lvl: 'diversion of medical stock', note: 'Her hands shake slightly while you count them. Not fear. Withdrawal, maybe, or exhaustion.', say: 'There are children in Stack 6 with the cough. Six vials. The infirmary has six hundred.', sayWho: 'HELIX 03' },
    { id: 'photo', who: 'a UNION 05 barely out of training', find: 'a photograph of a girl in a pre-war dress, and a lock of dark hair tied with thread', lvl: 'unregistered personal effects', note: 'He goes very red under the collar of his mask. On the back of the photograph: a name and a Stack number.' },
    { id: 'brandy', who: 'a RAZOR 02 from the Nexus hardpoint', find: 'a sealed bottle of pre-war brandy and an envelope with forty tokens', lvl: 'bribery', note: 'The envelope is addressed in a careful hand to "the gentleman at Gate 3". Someone is paying for passage.' },
    { id: 'leaflet', who: 'a UNION 03 with a spotless file', find: 'a lambda leaflet folded small inside a glove', lvl: 'possession of seditious print', note: 'He swears he confiscated it on patrol and forgot to log it. His face says he believes it. His heart rate says otherwise.', refer: { merit: 6, cons: -5 }, favour: { res: 4 } },
    { id: 'pills', who: 'an EpU with nineteen years of service', find: 'a tin of unlabelled sleeping pills', lvl: 'unregistered pharmaceuticals', note: 'Nineteen years in the mask. The tin is nearly empty. You do not need to ask why.', say: 'I don\u2019t sleep, three. Not since the first year. Write it how you want.', sayWho: 'EpU' },
    { id: 'drawings', who: 'a UNION 04', find: 'a sketchbook full of pencil drawings of citizens in the ration line — faces, hands, a child asleep on a bag', lvl: 'unauthorised documentation of citizens', note: 'They are good. Better than good. Every face has a CID written underneath it in tiny letters.' },
    { id: 'radio', who: 'a UNION 02 on the checkpoint rota', find: 'a pre-war shortwave receiver tuned to a frequency that only plays static', lvl: 'unregistered receiver (YELLOW)', note: 'You turn it on. Static, and under it, very faint, a woman reading numbers in a language you half-recognise.', refer: { merit: 6, res: -3 }, favour: { res: 5, susp: 2 } },
    { id: 'tokens', who: 'a HELIX 04 who works the infirmary night shift', find: 'a ration-card printing plate wrapped in a towel', lvl: 'forgery of Union documents', note: 'Not a few tokens on the side. A plate. Someone in this precinct has been printing citizens extra food for months.', refer: { merit: 8, lp: 3, cons: -6 }, favour: { cons: 4, susp: 5 } },
    { id: 'mask', who: 'a UNION 05 on his second week', find: 'a cracked mask lens wrapped in cloth, and a dead unit\u2019s designation tag', lvl: 'retention of deserviced unit property', note: 'The tag reads 05-61207. You know the number.', if: (s) => s.flags.wick_dead, say: 'He trained with me. I wanted something of his. That\u2019s all.', sayWho: '05' },
    { id: 'tomas', who: 'Tomas Vey', find: 'three ampoules of HELIX respiratory serum and a letter from his mother, folded so many times it is soft as cloth', lvl: 'diversion of medical stock', note: 'He does not stand at attention. He just looks at you.', if: (s) => s.rel.tomas !== undefined && !s.flags.tomas_gone, say: 'You going to do it, then? You of all people?', sayWho: 'Tomas', refer: { rel: { tomas: -100 }, flag: { tomas_gone: true }, cons: -15 }, warn: { rel: { tomas: -10 } }, favour: { rel: { tomas: 20 } } },
    { id: 'granite', who: 'Granite himself, who requested the audit of his own locker', find: 'nothing but a spare filter, a slate, and a list of every unit he has lost in twelve years, written by hand', lvl: 'no violation', note: 'He watches you read the list. There are thirty-one names. The last one is recent.', if: (s) => s.rel.granite !== undefined, say: 'Write that I\u2019m clean, three. Then come back tomorrow and do it again. That\u2019s how this works.', sayWho: 'Granite', refer: { merit: 0, lp: 0, cons: 0, rel: { granite: -20 } }, warn: { merit: 1, cons: 0 }, favour: { rel: { granite: 10 }, susp: 0 } },
    { id: 'jury', who: 'a JURY 04 from your own floor', find: 'copies of three Level 4 interrogation files, the confessions crossed out in red ink', lvl: 'removal of classified records', note: 'In the margin of each, in the same red ink: *false*.', refer: { merit: 6, lp: 2 }, favour: { res: 6, susp: 4 } },
    { id: 'child', who: 'a UNION 03 with a gentle voice', find: 'a child\u2019s knitted mitten and a page torn from a ration ledger with one name circled', lvl: 'unregistered personal effects', note: 'The circled name belongs to a family on the D5 relocation list. The mitten is very small.' },
  ];

  G.addScenes({
    iq_round: {
      title: (s) => `Interrogation — ${s.iq.name}`,
      text: (s) => {
        const q = s.iq;
        return [
          q.round === 0 ? `@doc SUBJECT: ${q.name.toUpperCase()}\nALLEGATION: ${q.desc}\nCYCLES REMAINING: 3` : `@sys Cycle ${q.round + 1} of 3.`,
          q.round === 0 ? 'The bulb hums. The fan ticks. The subject looks at your lenses and finds nothing there to look at.' : q.fear >= 4 ? 'The subject is shaking now. Not all of it is fear of you. Some of it is fear of what they might say.' : q.trust >= 3 ? 'The subject is leaning toward you a little, the way people do with someone they have decided might be human.' : 'The subject waits. They have learned that waiting is all a citizen is allowed to do.',
          `@sys FEAR ${'▮'.repeat(Math.max(0, q.fear))}${'▯'.repeat(Math.max(0, 6 - q.fear))} · TRUST ${'▮'.repeat(Math.max(0, q.trust))}${'▯'.repeat(Math.max(0, 6 - q.trust))} · INSIGHT ${'▮'.repeat(Math.max(0, q.insight))}${'▯'.repeat(Math.max(0, 6 - q.insight))}`,
        ];
      },
      choices: (s) =>
        ['press', 'lie', 'listen', 'apply'].map((k) => {
          const a = iqApproach(k);
          const label = { press: 'Press them. Intimidate.', lie: 'Lie to them. Make them think it is already over.', listen: 'Listen. Read them.', apply: 'Apply force.' }[k];
          return {
            t: label,
            tag: k === 'apply' ? 'FORCE' : undefined,
            tagCls: k === 'apply' ? 'risk' : undefined,
            fx: (st) => ((st.iq.last = k), a.fx),
            check: { skill: a.skill, diff: a.diff + (s.iq.hard - 3) * 5, pass: 'iq_step_ok', fail: 'iq_step_bad' },
          };
        }),
    },
    iq_step_ok: {
      enter: (s) => {
        const a = iqApproach(s.iq.last);
        Object.keys(a.ok).forEach((k) => (s.iq[k] += a.ok[k]));
        s.iq.round++;
        if (s.iq.round >= 3) return 'iq_end';
      },
      text: (s) => [pick(IQ_TEXT[s.iq.last]), 'It lands.'],
      choices: () => [{ t: 'Continue.', go: 'iq_round' }],
    },
    iq_step_bad: {
      enter: (s) => {
        const a = iqApproach(s.iq.last);
        Object.keys(a.bad).forEach((k) => (s.iq[k] += a.bad[k]));
        s.iq.round++;
        if (s.iq.round >= 3) return 'iq_end';
      },
      text: (s) => [pick(IQ_TEXT[s.iq.last]), 'It does not land the way you meant it to.'],
      choices: () => [{ t: 'Continue.', go: 'iq_round' }],
    },
    iq_end: {
      enter: (s) => {
        const q = s.iq;
        const breaks = q.fear >= q.hard + 1 || q.trust >= q.hard || q.insight >= q.hard - 1;
        if (q.guilty && breaks) q.result = 'true';
        else if (!q.guilty && q.fear >= q.hard + 2) q.result = 'false';
        else if (!q.guilty && (q.trust >= q.hard || q.insight >= q.hard)) q.result = 'innocent';
        else q.result = 'nothing';
        q.seen = q.result === 'false' && (s.skills.perception >= 3 || q.insight >= 2);
      },
      text: (s) => {
        const q = s.iq;
        if (q.result === 'true') return [`It comes out all at once, the way it always does. *"${q.knows[0].toUpperCase() + q.knows.slice(1)}."*`, 'It holds up. You can feel it holding up — details nobody would think to invent.'];
        if (q.result === 'false') return ['They confess. To everything. To more than you asked.', q.seen ? 'And you can see it: none of it is true. They are telling you what they think will make the stick stop.' : 'It is a good confession. Clean, complete, signed. The Magistrate will like it.'];
        if (q.result === 'innocent') return [`In the end you believe them. *"${q.knows[0].toUpperCase() + q.knows.slice(1)}."*`, 'Nothing about this one is a threat to sociostability. Only the file says otherwise.'];
        return ['Three cycles. Nothing. They stare at the drain in the floor and wait for you to give up.', 'You do, eventually. There is always another subject.'];
      },
      choices: (s) => [{ t: 'Close the session.', go: s.iq.ret }],
    },

    /* ---------------------------------------------------- JURY duties */
    j_cells: {
      title: 'Level 4 — interrogation cycle',
      enter: (s) => {
        G.startIq(s, pick(SUBJECTS), 'j_cells_end');
        G.unlock(s, 'interrogation');
      },
      text: (s) => [`@img assets/img/env/e07-level4.webp|Level 4`, `Vesna drops a file on the table: ${s.iq.name}, ${s.iq.desc}.`, '@say Vesna|Three cycles. Bring me something I can file.'],
      choices: () => [{ t: 'Go in.', go: 'iq_round' }],
    },
    j_cells_end: {
      text: (s) => {
        const q = s.iq;
        return [
          q.result === 'true' ? '@say Vesna|Filed. That is a real one. You can tell, can’t you? They’re never as tidy.' : q.result === 'false' ? (q.seen ? 'You hold the false confession in your hand. You could file it. Nobody would ever check.' : '@say Vesna|Clean confession. Clean file. Well done.') : q.result === 'innocent' ? '@say Vesna|You’re recommending release? The Magistrate reads every release.' : '@say Vesna|Nothing. It happens. It shouldn’t happen often.',
        ];
      },
      choices: (s) => {
        const q = s.iq;
        if (q.result === 'false' && q.seen)
          return [
            { t: 'File it anyway. A confession is a confession.', tag: 'FALSE VERDICT', tagCls: 'risk', fx: { merit: 4, lp: 2, cons: -10 }, go: 'u_duty_end' },
            { t: 'Tear it up and recommend release.', tag: 'MERCY', tagCls: 'mercy', fx: { merit: 1, cons: 6, susp: 2 }, go: 'u_duty_end' },
          ];
        if (q.result === 'innocent')
          return [
            { t: 'Recommend release.', tag: 'MERCY', tagCls: 'mercy', fx: { merit: 1, cons: 4, lp: -1 }, go: 'u_duty_end' },
            { t: 'Keep them for another cycle anyway. The file wants a verdict.', fx: { merit: 2, cons: -4 }, go: 'u_duty_end' },
          ];
        return [{ t: 'End of shift.', fx: q.result === 'true' ? { merit: 5, lp: 2, xp: { authority: 1 } } : q.result === 'false' ? { merit: 4, lp: 1, cons: -6 } : { merit: 1 }, go: 'u_duty_end' }];
      },
    },
    j_cells_r: { enter: () => 'j_cells', text: [] },

    j_audit: {
      title: 'Unit audit — precinct lockers',
      enter: (s) => {
        const all = AUDITS.filter((a) => !a.if || a.if(s));
        s.mem.jaUsed = s.mem.jaUsed || [];
        let pool = all.filter((a) => !s.mem.jaUsed.includes(a.id));
        if (!pool.length) {
          s.mem.jaUsed = [];
          pool = all;
        }
        const a = pick(pool);
        s.mem.jaUsed.push(a.id);
        s.mem.ja = a.id;
      },
      text: (s) => {
        const a = AUDITS.find((x) => x.id === s.mem.ja);
        return [
          'JURY audits its own. Twice a week, without warning, a crimson armband walks into a precinct locker room and everyone stops talking.',
          `Today it is ${a.who}. They stand at attention while you open the locker. Inside: **${a.find}**.`,
          a.note,
          a.say ? `@say ${a.sayWho || 'The unit'}|${a.say}` : null,
          `@law ${a.lvl.toUpperCase()} · UNIT MALCOMPLIANCE — referral to the Magistrate`,
        ];
      },
      choices: (s) => {
        const a = AUDITS.find((x) => x.id === s.mem.ja);
        return [
          { t: 'Refer them. JURY watches the watchers.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: Object.assign({ merit: 4, lp: 2, cons: -3 }, a.refer || {}), go: 'u_duty_end' },
          { t: 'Log a warning and confiscate. No referral.', fx: Object.assign({ merit: 2, cons: 2 }, a.warn || {}), go: 'u_duty_end' },
          { t: 'Close the locker. "Clean." They owe you now.', tag: 'FAVOUR', tagCls: 'mercy', fx: Object.assign({ merit: 1, susp: 3, flag: { owed_favour: true } }, a.favour || {}), go: 'u_duty_end' },
        ];
      },
    },
    j_audit_r: { enter: () => 'j_audit', text: [] },

    /* ---------------------------------------------------- UNION duty */
    u_lead: {
      title: 'Protection team — on patrol with Wick',
      text: (s) => [
        G.pick([
          'Wick walks half a step behind you, the way you walked behind Rook. His stick hand will not stop moving.',
          'A citizen spits on the pavement behind you as you pass. Wick turns. You put a hand on his shoulder.',
          'Wick asks you how many people you have hit. You realise you do not know.',
        ]),
        '@say Wick|What do I do, three? When they look at us like that?',
      ],
      choices: [
        { t: '"You make them look away." Show him.', fx: { merit: 2, rel: { wick: 3 }, cons: -2 }, go: 'u_duty_end' },
        { t: '"Nothing. You let them look. It costs us nothing."', fx: { merit: 1, rel: { wick: 5 }, cons: 2 }, go: 'u_duty_end' },
        { t: 'Teach him a stop and search, properly.', tag: 'SEARCH', tagCls: 'duty', fx: { rel: { wick: 4 } }, go: 'ss_start' },
      ],
    },
  });

  G.duties.jcells = { name: 'Interrogation cycle', desc: 'Level 4. Three cycles with a subject.', first: 'j_cells', routine: 'j_cells_r', if: (s) => s.div === 'JURY' };
  G.duties.jaudit = { name: 'Unit audit', desc: 'A precinct locker room. JURY polices its own.', first: 'j_audit', routine: 'j_audit_r', if: (s) => s.div === 'JURY' };
  G.duties.ulead = { name: 'Lead protection team', desc: 'Patrol D5 with your trainee.', first: 'u_lead', routine: 'u_lead', if: (s) => s.div === 'UNION' && !!s.c2 && s.c2.stage >= 1 };

  /* --------------------------------------------------- side panel */
  G.sideExtras = G.sideExtras || [];
  G.sideExtras.push((S) => {
    if (!S.c2 || S.c2.div !== 'JURY' || !S.c2.ev) return '';
    const sus = [
      ['rook', '"Rook" — UNION 02'],
      ['halvorsen', 'Halvorsen — armoury clerk'],
    ];
    const pips = (n) => '●'.repeat(Math.min(5, n)) + '○'.repeat(Math.max(0, 5 - n));
    return `<section><h3>Case board · The Leak</h3>${sus
      .map((x) => `<div class="kv"><span>${x[1]}</span><b class="mono" style="color:var(--amber)">${pips(S.c2.ev[x[0]] || 0)}</b></div>`)
      .join('')}<div class="sub">Evidence collected against each suspect. The Magistrate wants three.</div></section>`;
  });
  G.sideExtras.push((S) => {
    if (!S.c2 || S.c2.div !== 'UNION' || !S.c2.list) return '';
    return `<section><h3>Relocation list · Stacks 9 & 14</h3>${S.c2.list.map((id) => `<div class="item">${(S.c2.cands.find((c) => c.id === id) || { name: id }).name}</div>`).join('')}</section>`;
  });

  /* ----------------------------------------------------- entry */
  G.addScenes({
    c2_start: {
      safe: true,
      enter: (s) => {
        if (!s.c2) s.c2 = { div: s.div, stage: 0, next: s.day + 1, ev: { rook: 0, halvorsen: 0, tomas: 0, you: 0 } };
        s.chapter = 2;
        if (s.div !== 'UNION' && s.div !== 'JURY') return 'c2_other';
      },
      title: 'Chapter Two',
      text: (s) =>
        s.div === 'UNION'
          ? ['@big CHAPTER TWO', '@sys UNION · THE QUOTA', 'Autumn turns in City 9 the way it always does: the river rises, the dam roars louder, and the broadcasts start talking about *efficiency*.', 'Somewhere above Granite’s office, in a part of the Nexus no 03 ever sees, someone is counting the population of District 5. They do not like the number.']
          : ['@big CHAPTER TWO', '@sys JURY · THE LEAK', 'Level 4 is below the river line. The walls sweat. You have been here before, on the other side of the glass.', 'Now you have a desk, a crimson armband, and a key to every door on the floor.'],
      choices: () => [{ t: 'Begin.', go: (s) => (s.time === 'Morning' ? 'u_board' : 'u_duty_end') }],
    },
    c2_other: {
      safe: true,
      text: (s) => [`@sys The ${s.div} storyline for Chapter Two is still being written. You continue on the duty board for now.`],
      choices: () => [{ t: 'Return to duty.', go: (s) => (s.time === 'Morning' ? 'u_board' : 'u_duty_end') }],
    },
  });

  /* ======================================================= UNION ARC */
  const candList = (s) => {
    const c = [];
    c.push({ id: 'mira', name: 'Mira — 17, mill hand, Stack 14', note: s.flags.reported_mira ? '3 penalty points. Dependant of a grade-03 unit — exemption withdrawn.' : s.flags.mira_rebel ? 'Clean file. Seen near the canals after curfew. Dependant of a grade-03 unit — exemption withdrawn.' : 'Clean file. Dependant of a grade-03 unit — exemption withdrawn.', cons: -30 });
    if (s.flags.halloran_fate !== 'beaten') c.push({ id: 'halloran', name: 'Edvard Halloran — 71, Stack 14', note: s.flags.halloran_fate === 'detained' ? '7 penalty points. Transmitter. On watch.' : 'On watch since the transmitter raid.', cons: -12 });
    c.push({ id: 'ander', name: 'Ander Wick — 16, Stack 9', note: '2 penalty points (loitering). Brother of 05-61207.', cons: -8 });
    c.push({ id: 'orlova', name: 'Mrs Orlova — 68, Stack 14', note: 'Clean file. Arthritis. Productivity rated low.', cons: -6 });
    c.push({ id: 'pavel', name: 'Pavel Brodsky — 41, Stack 9', note: 'Clean file. Crushed hand, mill output halved.', cons: -6 });
    c.push({ id: 'petrak', name: 'Old Petrak — 80, Stack 9', note: 'Clean file. Bedridden. Ration consumption without labour.', cons: -4 });
    c.push({ id: 'sokol', name: 'Ilja Sokol — 44, Stack 9', note: '9 penalty points. Habitual loitering near the rail yards.', cons: -2 });
    c.push({ id: 'danek', name: 'The Danek family (3) — Stack 9', note: '4 penalty points between them. Father, mother, grandmother.', cons: -8, size: 3 });
    const files = Object.values(s.files || {})
      .filter((f) => !f.amputated && f.points >= 5)
      .sort((a, b) => b.points - a.points)
      .slice(0, 3);
    files.forEach((f) => c.push({ id: 'cid' + f.cid, name: `CID ${f.cid} — your case file`, note: `${f.points} penalty points. You stopped them ${f.stops} time${f.stops > 1 ? 's' : ''}.`, cons: -2 }));
    return c;
  };
  const listCount = (s) => s.c2.list.reduce((n, id) => n + ((s.c2.cands.find((c) => c.id === id) || {}).size || 1), 0);

  G.addScenes({
    c2_u0: {
      title: 'Granite’s office',
      enter: (s) => {
        s.rel.wick = s.rel.wick || 0;
      },
      text: (s) => [
        '@portrait assets/img/portraits/granite.webp|Granite',
        '@say Granite|Three stripes. That means you get somebody to keep alive.',
        '@portrait assets/img/portraits/wick.webp|CCA.C9.D5-UNION-05-61207 — "Wick"',
        'Standing at attention beside his desk is a 05 so new his armband still has fold lines in it. Thin, eighteen, a Stack 9 face. **CCA.C9.D5-UNION-05-61207.** He has a habit of touching his mask seal, as if checking it is still there.',
        '@say Granite|Your trainee. The squad calls him Wick, because he burns down fast. Make him last.',
        s.flags.tomas_gone ? 'Your protection team is two now: you and Wick.' : '@say Granite|Vey goes with you as your second. Try not to let him teach the boy any songs.',
        'Then, as you turn to go:',
        '@say Granite|Something is coming down from the Nexus. A quota. I don’t know the number yet. When I do, you’ll wish I didn’t.',
      ],
      choices: [
        { t: 'Train Wick the way Thirty trained you. Hard. Now.', fx: adv(1, { rel: { wick: -5 }, lp: 2, cons: -2 }), go: 'c2_u0_hard' },
        { t: 'Train him the way Rook trained you. Rules first, the rest later.', fx: adv(1, { rel: { wick: 8 }, xp: { authority: 1 } }), go: 'c2_u0_rook' },
        { t: 'Ask him why he joined.', fx: adv(1, { rel: { wick: 10 }, cons: 2 }), go: 'c2_u0_why' },
      ],
    },
    c2_u0_hard: {
      text: ['You take him to the gym and put him on the mat in eleven seconds. Then again. Then again, until he stops getting up fast and starts getting up smart.', '@say Wick|...Yes, three.', 'He does not look at you the way you used to look at Rook. He looks at you the way you used to look at Thirty.'],
      choices: [{ t: 'Muster.', go: 'u_board' }],
    },
    c2_u0_rook: {
      text: ['@say You|Three rules. One: you don’t take off the mask on the street. Two: you don’t say a citizen’s name out loud. Three: when I say run, you’ve already been running for a second.', 'You hear Rook’s voice coming out of your mask and it is the strangest thing that has happened to you in months.', '@say Wick|Yes, three. Thank you, three.'],
      choices: [{ t: 'Muster.', go: 'u_board' }],
    },
    c2_u0_why: {
      text: ['He takes a long time to answer.', '@say Wick|My brother. Ander. He’s sixteen and he can’t keep his mouth shut, and he’s already got points. I thought — family of a unit. They leave you alone, don’t they?', 'You think about Mira. You don’t say anything.'],
      choices: [{ t: 'Muster.', go: 'u_board' }],
    },

    c2_u1: {
      title: 'Stack 14 — the stairwell',
      text: (s) => [
        'The rumour reaches the Stacks before it reaches the precinct. It always does.',
        s.flags.reported_mira
          ? 'Mira’s door stays shut. But when you turn to go, a folded ration wrapper slides out under it. On the back, in pencil: *They say it’s 200. They say the list is made by units. Is it you?*'
          : 'Mira is waiting on the landing in her coat, as if she has been waiting all evening.',
        s.flags.reported_mira ? null : '@say Mira|Two hundred, they’re saying. Out of D5. On the train to the north. Mrs Orlova’s been crying since noon. Halloran says it’s always the old and the sick and the ones with points. Is that true?',
        s.flags.reported_mira ? null : '@say Mira|Who makes the list?',
      ],
      choices: (s) =>
        s.flags.reported_mira
          ? [
              { t: 'Write "No" on the wrapper and slide it back.', fx: adv(1, { rel: { mira: 5 } }), go: 'u_night' },
              { t: 'Pocket the wrapper and leave.', fx: adv(1, { rel: { mira: -5 } }), go: 'u_night' },
            ]
          : [
              { t: '"I don’t know yet. But your name won’t be on it. I promise."', fx: adv(1, { rel: { mira: 10 }, flag: { promised_mira: true } }), go: 'c2_u1_promise' },
              { t: '"Keep your head down, Mira. Keep your file clean. That’s all I can tell you."', fx: adv(1, { rel: { mira: -3 } }), go: 'u_night' },
              { t: '"Units make it." Tell her the truth.', fx: adv(1, { rel: { mira: 4 }, cons: 2 }), go: 'c2_u1_truth' },
            ],
    },
    c2_u1_promise: { text: ['She looks at you for a long moment. She does not believe you. She wants to so badly that it looks the same.'], choices: [{ t: 'Walk back.', go: 'u_night' }] },
    c2_u1_truth: { text: ['@say Mira|Units. So someone like you will sit at a desk and pick two hundred of us.', '@say Mira|Then pick well.', 'She goes inside. The radiator knocks through the door.'], choices: [{ t: 'Walk back.', go: 'u_night' }] },

    c2_u2: {
      title: 'The quota',
      checkpoint: true,
      enter: (s) => {
        s.c2.cands = candList(s);
        s.c2.list = [];
        s.c2.need = 6;
      },
      text: [
        'Granite does not sit down. He hands you a slate with the Nexus seal on its header.',
        '@doc DIRECTIVE 9-D5-114 · LABOUR REALLOCATION\nDISTRICT 5 QUOTA: 200 CITIZENS\nDESTINATION: CITY 22 (INDUSTRIAL)\nCOMPILATION: BY SECTOR, BY PROTECTION TEAM\nNOTE: DEPENDANT EXEMPTIONS WITHDRAWN BELOW GRADE 02',
        '@say Granite|Every team leader gets a block. You get Stacks 9 and 14. Your share is six. Six names by tonight.',
        '@say Granite|Read the last line again. Then stop reading it.',
        'Dependant exemptions withdrawn below grade 02. You are an 03. Mira is no longer protected by your mask.',
      ],
      choices: [{ t: 'Open the census for Stacks 9 and 14.', go: 'c2_u_list' }],
    },
    c2_u_list: {
      title: (s) => `Relocation list — ${listCount(s)} of ${s.c2.need}`,
      text: (s) => {
        const left = s.c2.cands.filter((c) => !s.c2.list.includes(c.id));
        return [
          s.c2.list.length ? '@doc ON THE LIST:\n' + s.c2.list.map((id) => '— ' + s.c2.cands.find((c) => c.id === id).name).join('\n') : 'The census scrolls past: names, CIDs, penalty points, productivity ratings. Every one of them is a door you have walked past.',
          `@sys Choose ${s.c2.need - listCount(s)} more. Each name is a person on a train.`,
          ...left.map((c) => `@sys · ${c.name}: ${c.note}`),
        ];
      },
      choices: (s) => {
        const out = [];
        if (listCount(s) >= s.c2.need) {
          out.push({ t: '**Submit the list.**', tag: 'SUBMIT', tagCls: 'duty', go: 'c2_u_list_done' });
          return out;
        }
        s.c2.cands
          .filter((c) => !s.c2.list.includes(c.id) && (c.size || 1) <= s.c2.need - listCount(s))
          .forEach((c) =>
            out.push({
              t: `Add **${c.name}**`,
              tag: c.id === 'mira' ? 'YOUR SISTER' : undefined,
              tagCls: c.id === 'mira' ? 'risk' : undefined,
              fx: (st) => (st.c2.list.push(c.id), { cons: c.cons }),
              go: 'c2_u_list',
            })
          );
        if (!s.c2.padded)
          out.push({
            t: 'Pad the list with two CIDs from the death register. The dead do not mind travelling.',
            tag: 'FALSIFY',
            tagCls: 'mercy',
            check: { skill: 'deception', diff: 10, pass: 'c2_u_pad_ok', fail: 'c2_u_pad_bad' },
          });
        return out;
      },
    },
    c2_u_pad_ok: {
      enter: (s) => {
        s.c2.padded = true;
        s.c2.need = Math.max(listCount(s), s.c2.need - 2);
      },
      text: ['You pull two CIDs from last winter’s mortality log — a stoker and a seamstress, both dead of the cough — and key them in with fresh labour ratings. The slate accepts them without a blink.', 'Two fewer names. Two people who will never know.'],
      choices: [{ t: 'Back to the list.', fx: { susp: 6, res: 4, cons: 4 }, go: 'c2_u_list' }],
    },
    c2_u_pad_bad: {
      enter: (s) => {
        s.c2.padded = true;
      },
      text: ['You key in a CID from the mortality log. The slate flashes amber: **SUBJECT DECEASED — DISCREPANCY FORWARDED.**', 'Granite reads the flag on his own slate across the room. He does not look up. He doesn’t have to.'],
      choices: [{ t: 'Back to the list.', fx: { susp: 12, rel: { granite: -10 } }, go: 'c2_u_list' }],
    },
    c2_u_list_done: {
      text: (s) => {
        const L = s.c2.list;
        return [
          'You submit it. Six names. It takes less than a second for the Nexus to acknowledge.',
          L.includes('mira') ? 'Your sister’s name is on it. You put it there. You will tell yourself reasons for this for the rest of your life.' : null,
          L.includes('ander') ? 'Ander Wick is on it. His brother is in your protection team, and does not know yet.' : null,
          L.includes('halloran') ? 'Halloran is on it. He carried you out of a burning building once.' : null,
          '@say Granite|Done? ... Done. Go home. Don’t drink.',
        ];
      },
      choices: [{ t: 'Muster.', fx: adv(1, (s) => ({ merit: 4, lp: 3 })), go: 'u_board' }],
    },

    c2_u3: {
      title: 'The night before',
      text: (s) => {
        const L = s.c2.list;
        const res = s.flags.mole || s.res >= 30;
        return [
          '@portrait assets/img/portraits/wick.webp|Wick',
        L.includes('ander') ? 'Wick finds you in the locker room. He has his mask in his hands and his face is wet.' : 'Wick finds you in the locker room. He is grinning, which you have never seen.',
          L.includes('ander') ? '@say Wick|Ander’s on the list. You — you had Stack 9. You had the list. Three. Tell me it wasn’t you.' : '@say Wick|Ander isn’t on it. I checked twice. I don’t know what you did, three. Thank you.',
          res ? 'Later, on the way home, a man with burned fingertips falls into step beside you for exactly ten paces.' : null,
          res ? '@say Tinker|The train leaves the D4 yard at dawn. We want the departure track and the escort strength. That’s all. Nobody has to die.' : null,
        ];
      },
      choices: (s) => {
        const A = s.c2.list.includes('ander');
        const res = s.flags.mole || s.res >= 30;
        const wl = A
          ? [
              { t: '"It was me. It was him or someone else\u2019s brother."', fx: { rel: { wick: -40 }, cons: 2 } },
              { t: '"It wasn\u2019t me. Granite overruled me."', lie: true },
            ]
          : [{ t: '"Don\u2019t thank me. Just don\u2019t make me regret it."', fx: { rel: { wick: 15 } } }];
        const rc = res
          ? [
              { suffix: ' Then give the Tinker the departure track.', leak: true, fx: { res: 15, susp: 6 } },
              { suffix: ' Then walk past the Tinker without a word.', fx: { res: -5 } },
            ]
          : [{ suffix: '', fx: {} }];
        const out = [];
        wl.forEach((w) =>
          rc.forEach((r) => {
            const o = {
              t: w.t + r.suffix,
              tag: r.leak ? 'RESISTANCE' : undefined,
              tagCls: r.leak ? 'mercy' : undefined,
              fx: (st) => {
                if (r.leak) st.c2.leaked = true;
                return Object.assign({}, w.fx || {}, r.fx);
              },
            };
            if (w.lie) o.check = { skill: 'deception', diff: 5, pass: 'c2_u3_go', fail: 'c2_u3_go', okFx: { rel: { wick: -5 } }, failFx: { rel: { wick: -30 } } };
            else o.go = 'c2_u3_go';
            out.push(o);
          })
        );
        return out;
      },
    },
    c2_u3_go: { enter: (s) => (adv(1)(s), 'u_night'), text: [] },

    c2_u4: {
      title: 'D4 Rail Yards — 05:40',
      checkpoint: true,
      text: (s) => [
        '@img assets/img/env/e18-relocation.webp|D4 — the relocation train',
        'The train is twelve cars long and painted the grey of everything else. Overwatch stands at the doors of every car, white armour beaded with drizzle. Their lenses do not move.',
        'Two hundred citizens stand behind a rope line in the cold with one bag each. Behind them, behind a second line held by UNION, the families who were not chosen are watching the ones who were.',
        '@dispatch Citizens of District 5. Your reassignment is a privilege. City 22 needs your hands. The Union thanks you for your service.',
        '@say Granite|PTs, interlock. Wick, stay on my three. Nobody touches Overwatch. Nobody.',
        s.c2.list.includes('mira') ? 'You see her before she sees you. Mira, third in the line for car seven, holding a bag that has her drawings in it. She is not crying. She is looking for you.' : s.c2.list.includes('halloran') ? 'Halloran is near the front, leaning on a stick you have never seen him use, in his old herringbone coat.' : s.c2.list.includes('ander') ? 'Near car four, a skinny sixteen-year-old with a loud mouth is very quiet. Beside you, Wick has stopped breathing.' : 'You recognise faces in the line. Not from the Stacks. From your own case files.',
      ],
      choices: [{ t: 'Hold your position.', go: (s) => (s.c2.leaked ? 'c2_u4_blast' : 'c2_u4_surge') }],
    },
    c2_u4_blast: {
      text: ['At 05:52 the signal box at the end of the yard turns into a ball of orange light. The sound arrives a heartbeat later, enormous, and every window in D4 shatters at once.', '@radio Contact, contact, signal box — Sword, Sword, Sword —', 'The rope line breaks. Two hundred people scatter between the freight cars like water through fingers. Overwatch opens fire into the smoke.'],
      choices: [
        { t: 'Shield the fleeing families. Stand between them and the Overwatch guns.', tag: 'RISK', tagCls: 'risk', check: { skill: 'authority', diff: 15, pass: 'c2_u4_shield_ok', fail: 'c2_u4_shield_bad' } },
        { t: 'Converge on the signal box. Catch the bombers.', check: { skill: 'fitness', diff: 5, pass: 'c2_u4_chase', fail: 'c2_u4_chase' } },
        { t: 'Grab Wick and get down. Survive this.', go: 'c2_u4_personal' },
      ],
    },
    c2_u4_shield_ok: {
      text: ['You step into the open with your arms out and your stick down, and you shout the only thing Overwatch might respect: your designation, over and over, into the noise.', 'For three seconds the guns turn toward you. Then away. Forty citizens get into the dark between the cars behind your back.', 'Nobody will ever be able to prove it was on purpose. Granite saw it anyway.'],
      choices: [{ t: 'Find your people.', fx: { cons: 10, res: 10, susp: 10, rel: { granite: 5 }, flag: { shielded: true } }, go: 'c2_u4_personal' }],
    },
    c2_u4_shield_bad: {
      text: ['You step into the open and an Overwatch elite steps into you, lens burning red, and drives the butt of its rifle into your chest plate. You land on the gravel. The firing goes on over you.'],
      choices: [{ t: 'Get up.', fx: { hp: -25, cons: 6 }, go: 'c2_u4_personal' }],
    },
    c2_u4_chase: {
      text: ['@portrait assets/img/portraits/lida.webp|The woman in the red headscarf', 'You run toward the fire. In the smoke behind the signal box there is a ladder, and at the top of the ladder a woman in a red headscarf, who looks down at you, recognises your mask, and does not shoot.', 'Then she is gone over the wall.'],
      choices: [{ t: 'Let her go. Find your people.', fx: { res: 6, cons: 3 }, go: 'c2_u4_personal' }, { t: 'Report her description to Dispatch.', fx: { merit: 5, lp: 3, res: -15 }, go: 'c2_u4_personal' }],
    },
    c2_u4_surge: {
      text: ['At 05:55 car seven’s doors open and the line is told to move. For a moment nothing happens. Then a woman at the front sits down on the gravel and refuses to stand, and the whole line stops with her.', '@say Granite|Isolate. Now.', 'Overwatch begins to walk toward the line.'],
      choices: [
        { t: 'Get there first. Talk them onto the train before Overwatch arrives.', check: { skill: 'authority', diff: 10, pass: 'c2_u4_talk', fail: 'c2_u4_force' } },
        { t: 'Drag her up yourself. Fast is merciful.', go: 'c2_u4_force' },
      ],
    },
    c2_u4_talk: {
      text: ['You crouch beside the woman and tell her, quietly, that the people in white armour will shoot her and then the next one and then the next one, and that you will not be able to stop them. You tell her that her neighbours are watching her to see if she lives.', 'She stands up. The line moves. Overwatch stops walking.'],
      choices: [{ t: 'Continue.', fx: { merit: 4, cons: 2 }, go: 'c2_u4_personal' }],
    },
    c2_u4_force: {
      text: ['You put her on her feet with your stick across her back. The line moves. It moves because of you, and because of what everyone just watched you do.', 'Overwatch stops walking.'],
      choices: [{ t: 'Continue.', fx: { merit: 5, lp: 3, cons: -6 }, go: 'c2_u4_personal' }],
    },

    c2_u4_personal: {
      title: 'Car seven',
      text: (s) => {
        const L = s.c2.list;
        if (L.includes('mira'))
          return [
            '@portrait assets/img/portraits/mira.webp|Mira',
            'Mira reaches the ramp of car seven. She stops. She turns her head and finds your lenses in the crowd, among a hundred identical lenses, and she knows which ones are yours.',
            '@say Mira|Did you do this?',
            'The Overwatch at the door raises its rifle a few centimetres. *Move.*',
          ];
        if (L.includes('halloran'))
          return [
            '@portrait assets/img/portraits/halloran.webp|Halloran',
            'Halloran reaches the ramp and cannot climb it. His stick slides on the wet steel. The Overwatch at the door watches him without moving.',
            '@say Halloran|Give an old man a hand, officer?',
            'He says *officer*. He knows exactly who you are.',
          ];
        if (L.includes('ander'))
          return ['Ander Wick reaches the ramp of car four. Behind you, Wick takes a step forward out of the PT line. Then another.', '@say Granite|Five! Lock!', 'Wick does not lock.'];
        return ['The cars fill. The doors close one by one, a sound like a hammer on a coffin lid, twelve times.', 'You stood there. That is all. That is what the job was today.'];
      },
      choices: (s) => {
        const L = s.c2.list;
        if (L.includes('mira'))
          return [
            { t: 'Say nothing. Let her board.', tag: 'LOYAL', tagCls: 'loyal', fx: { lp: 8, merit: 6, cons: -25, rel: { mira: -100 }, flag: { mira_relocated: true } }, go: 'c2_u5' },
            { t: 'Pull her out of the line: "This citizen is a material witness. JURY wants her."', check: { skill: 'deception', diff: 20, pass: 'c2_u_mira_saved', fail: 'c2_u_mira_caught' } },
            { t: 'Walk up the ramp and tell the Overwatch she is your sister.', tag: 'RISK', tagCls: 'risk', go: 'c2_u_mira_plea' },
          ];
        if (L.includes('halloran'))
          return [
            { t: 'Help him up the ramp. Gently.', fx: { cons: 3, rel: { halloran: 10 }, flag: { halloran_relocated: true } }, go: 'c2_u5' },
            { t: 'Look away. Let the Overwatch do it.', fx: { cons: -5, flag: { halloran_relocated: true } }, go: 'c2_u5' },
          ];
        if (L.includes('ander'))
          return [
            { t: 'Tackle Wick before he reaches the Overwatch line.', check: { skill: 'melee', diff: 5, pass: 'c2_u_wick_saved', fail: 'c2_u_wick_lost' } },
            { t: 'Let him go.', go: 'c2_u_wick_lost' },
          ];
        return [{ t: 'Continue.', go: 'c2_u5' }];
      },
    },
    c2_u_mira_saved: {
      text: ['You take her arm in front of the Overwatch and say it in the flat voice of a unit doing paperwork: *material witness, JURY hold, designation such-and-such.* You key a JURY request code into your slate that you once saw Vesna use.', 'The Overwatch lens looks at you. Then at the slate. Then it steps back.', 'You walk Mira out of the yard with your hand on her arm, past Granite, who says nothing, past the families, past the end of the rope line, and you do not let go until you are three streets away. Then you let go, and she hits you, once, hard, in the chest plate, and starts crying.'],
      choices: [{ t: 'Continue.', fx: { cons: 12, susp: 18, rel: { mira: 30 }, flag: { mira_saved: true } }, go: 'c2_u5' }],
    },
    c2_u_mira_caught: {
      text: ['You take her arm and say it — *material witness, JURY hold.* The Overwatch lens looks at you, at the slate, at your designation. Its radio clicks.', '@radio C9 Dispatch. JURY has no hold on record for that CID.', 'Mira boards car seven. You are escorted out of the yard by two of your own squad. Granite does not look at you.'],
      choices: [{ t: 'Continue.', fx: { susp: 30, lp: -10, merit: -6, rel: { mira: -20, granite: -15 }, flag: { mira_relocated: true } }, go: 'c2_u5' }],
    },
    c2_u_mira_plea: {
      text: ['You walk up the ramp and say it. *She is my sister.* You do not know why you thought it would matter.', 'The Overwatch looks at you for a long time. Then it says, in its dry clicking voice:', '@say Overwatch|Then she will be productive. As you are.', 'It closes the door.'],
      choices: [{ t: 'Continue.', fx: { cons: 6, susp: 8, rel: { mira: -10 }, flag: { mira_relocated: true } }, go: 'c2_u5' }],
    },
    c2_u_wick_saved: {
      text: ['You hit Wick at the hip and take him down on the gravel two metres from the Overwatch line. He fights you. He is strong, for a boy who burns down fast. You hold him there until car four’s doors close.', 'When you let him up he does not say anything. He will never say anything to you again that is not a code.'],
      choices: [{ t: 'Continue.', fx: { rel: { wick: -20 }, merit: 3, cons: -2, flag: { wick_alive: true } }, go: 'c2_u5' }],
    },
    c2_u_wick_lost: {
      text: ['Wick walks toward the Overwatch line with his hands out, saying his brother’s name. They do not wait for him to reach it.', '@radio 11-99, D4 yard. Deservicement. 05-61207.', 'Granite stands over the body for a while. Then he looks at you. *Make him last*, he had said.'],
      choices: [{ t: 'Continue.', fx: { cons: -4, rel: { granite: -10 }, flag: { wick_dead: true } }, go: 'c2_u5' }],
    },

    c2_u5: {
      title: 'Granite’s office — that evening',
      enter: (s) => {
        const bad = s.susp >= 70 || s.flags.mira_saved && s.rel.granite < 10;
        s.mem.c2pass = !bad;
        if (!bad) {
          G.promote(s, '02');
          G.fx(s, { merit: 8, lp: 3 });
        }
      },
      text: (s) =>
        s.mem.c2pass
          ? [
              '@portrait assets/img/portraits/granite.webp|Granite',
              '@say Granite|Two hundred. Delivered. The Nexus is pleased with D5. I’m told to tell you that.',
              'He takes the stencil and the white paint out of his drawer and paints a fourth stripe on your armour himself, the way he did the second.',
              '@say Granite|02. Exemptions apply from grade 02, you’ll have read. Whoever you have left is safe now. For now.',
              `@doc PROMOTION: ${G.desig(s)}`,
            ]
          : ['@say Granite|JURY has a query about you again. A long one. I’m not putting your name forward this cycle. I’m sorry. That’s not a thing I say.', '@sys Promotion withheld. Keep serving, and keep your file clean.'],
      choices: [{ t: 'Continue.', go: 'c2_end_union' }],
    },
    c2_end_union: {
      checkpoint: true,
      title: 'End of Chapter Two — UNION',
      text: (s) => [
        s.flags.mira_saved ? 'Mira lives in Stack 14 again, under a JURY hold that does not exist, in a file you will have to keep feeding lies for as long as you both live.' : s.flags.mira_relocated ? 'Unit 14-C is empty. A month later a new family moves in. The radiator still knocks.' : 'Mira was never on the list. She will never know what it cost to keep her off it, and you will never tell her.',
        s.flags.wick_dead ? 'There is a new tally on the wall above the urn in the precinct mess. It says WICK. Somebody scratched it with a service knife.' : s.flags.wick_alive ? 'Wick asks for a transfer to D2. It is granted.' : s.rel.wick >= 10 ? 'Wick walks a half-step behind you on patrol. Ander writes to him once a week from Stack 9.' : null,
        s.flags.shielded ? 'In the Canal Quarter, forty people who should be on a train north are not. Someone has chalked a small lambda on the door of your locker. Someone else has scrubbed it off.' : null,
        '@radio ...all C9 units, BOLO, priority one, relayed from City 17: unscheduled arrival at the City 17 rail terminus, person of interest, male, description to follow...',
        'Nobody in the precinct pays much attention. City 17 is a long way away.',
        '@sys CHAPTER TWO COMPLETE (UNION). You can keep serving on the duty board. Chapter Three is coming.',
      ],
      choices: [{ t: 'Return to duty.', go: 'u_duty_end' }],
    },
  });

  /* ======================================================== JURY ARC */
  const playerLeak = (s) => !!(s.flags.mole || s.flags.res_task_done || s.res >= 40 || s.flags.shielded);

  G.addScenes({
    c2_j0: {
      title: 'Level 4 — the Magistrate’s office',
      enter: (s) => {
        s.rel.vesna = s.rel.vesna || 0;
        s.rel.magistrate = s.rel.magistrate || 0;
        s.c2.truth = playerLeak(s) ? 'you' : 'halvorsen';
        G.unlock(s, 'interrogation');
      },
      text: (s) => [
        '@img assets/img/env/e17-magistrate.webp|Level 4 — the Magistrate’s office',
        'The Magistrate’s office has no window. It has a desk, two chairs, and one wall covered from floor to ceiling in grey file boxes, each stencilled with a CID.',
        '@say Magistrate|You read files. Good. Here is yours.',
        'He slides a thin folder across the desk. Your own designation on the tab. He does not let go of it.',
        '@say Magistrate|Not today. Today I need you to read someone else’s. Someone in the District 5 precinct is talking to the canals. Baskets cleared at Gate 3 that should not have been. A raid on block 2-11 that found forty empty beds. A roster that walked out of the armoury and turned up on Bazaar Row.',
        '@say Magistrate|Find the mouth. Bring me three pieces of evidence and a name. You will work with 02 Vesna.',
        'In the corner, a JURY 02 you did not notice was there looks up from a slate. Narrow, very still. The recruits upstairs say she once interrogated her own brother and filed it in under an hour.',
        '@portrait assets/img/portraits/vesna.webp|CCA.C9.D5-JURY-02-30961 — Vesna',
        '@say Vesna|Don’t worry. I only bite the guilty.',
        playerLeak(s) ? 'Your heart rate is very steady. You make sure of it. Every one of those things the Magistrate just listed, you know more about than he does.' : null,
        '@sys A case board has been added to your dossier.',
      ],
      choices: [
        { t: '"Three pieces. A name. Understood, sir."', fx: adv(1, { rel: { magistrate: 5 } }), go: 'u_board' },
        { t: 'Ask Vesna what she already knows.', fx: adv(1, { rel: { vesna: 6 } }), go: 'c2_j0_vesna' },
      ],
    },
    c2_j0_vesna: {
      text: ['@say Vesna|What I know? That the leak has access to Gate 3 logs and the armoury roster. That narrows it to about thirty people. Including, as it happens, you.', 'She says it lightly. Her eyes are not light at all.'],
      choices: [{ t: 'Muster.', go: 'u_board' }],
    },

    c2_j1: {
      title: 'Level 4 — the courier',
      enter: (s) => {
        G.startIq(s, { name: 'Lida Koval', desc: 'the courier in the red headscarf, taken at Gate 3 with a basket of coagulant', guilty: true, knows: s.c2.truth === 'you' ? 'a unit at Gate 3 marks the baskets "linen, cleared" — I never saw his face, only his armband' : 'a clerk in your armoury sells the duty rosters for tokens, and we buy them', hard: 4 }, 'c2_j1_end');
      },
      text: (s) => [
        '@img assets/img/env/e07-level4.webp|Level 4',
        '@portrait assets/img/portraits/lida.webp|Lida Koval — CID 58210 · OBS',
        'They bring her in with a sack over her head. When they take it off, she looks at your lenses for a long time.',
        s.flags.res_task_failed ? 'You know her. You arrested her yourself, at Gate 3, with Rook watching. She knows you too.' : 'A woman in her thirties with a red headscarf, an old burn on her wrist, and nothing at all in her face.',
        '@say Vesna|Your subject. Three cycles. I’ll be behind the glass.',
      ],
      choices: [{ t: 'Begin.', go: 'iq_round' }],
    },
    c2_j1_end: {
      text: (s) => {
        const q = s.iq;
        if (q.result === 'true') return ['@say Vesna|Got it. That’s a real one.', s.c2.truth === 'you' ? 'A unit at Gate 3. An armband. Vesna writes it down. You watch her write it down.' : 'An armoury clerk who sells rosters. Vesna is already pulling the armoury staff list.'];
        if (q.fear >= 5) return ['At the end, shaking, she gives you a name to make it stop. *"Rook. The one called Rook. He looks the other way."*', '@say Vesna|Hm. Fear names are cheap. Still — a name.'];
        return ['@say Vesna|Nothing. She’s good. Better than us, maybe.'];
      },
      choices: (s) => {
        const q = s.iq;
        return [
          {
            t: 'Write it up.',
            fx: adv(1, (st) => {
              if (q.result === 'true') {
                st.c2.ev[st.c2.truth] = (st.c2.ev[st.c2.truth] || 0) + 2;
                return { merit: 3 };
              }
              if (q.fear >= 5) {
                st.c2.ev.rook += 1;
                return { cons: -3 };
              }
              return null;
            }),
            go: 'u_board',
          },
        ];
      },
    },

    c2_j2: {
      title: 'The records room — after hours',
      text: (s) => [
        'The precinct records room is a cage of steel shelving in the basement under the tram depot. Vesna has given you the key and gone home. *"Bring me something by morning."*',
        'Three sets of records could help: the Gate 3 basket logs, the armoury sign-out ledger, and Rook’s locker, which JURY is allowed to open without asking.',
        s.c2.truth === 'you' ? 'And somewhere in those Gate 3 logs, under your own designation, is a basket entry marked *linen, cleared*.' : null,
      ],
      choices: (s) => {
        const out = [
          { t: 'The armoury ledger.', check: { skill: 'comms', diff: 0, pass: 'c2_j2_ledger', fail: 'c2_j2_nothing' } },
          { t: 'The Gate 3 basket logs.', check: { skill: 'perception', diff: 5, pass: 'c2_j2_gate', fail: 'c2_j2_nothing' } },
          { t: 'Rook’s locker.', go: 'c2_j2_rook' },
        ];
        if (s.c2.truth === 'you') out.push({ t: 'Plant a lambda leaflet in someone else’s locker.', tag: 'FRAME', tagCls: 'risk', go: 'c2_j2_plant' });
        return out;
      },
    },
    c2_j2_nothing: {
      text: ['You read until your lenses ache. Columns of numbers, initials, cycle stamps. If there is something here, it is hiding better than you are looking.', 'The clock above the cage says 03:10.'],
      choices: [
        { t: 'Try another set of records.', fx: { hp: -3 }, go: 'c2_j2' },
        { t: 'Go home with nothing.', fx: adv(1), go: 'u_night' },
      ],
    },
    c2_j2_ledger: {
      text: (s) => [
        '@portrait assets/img/portraits/halvorsen.webp|Halvorsen — CWU armoury clerk · CID 47715',
        'You go through the ledger line by line. Sign-outs, returns, discrepancies. A clerk named **Halvorsen** has signed for the duty roster binder eleven times this month. The binder is supposed to leave the cage twice.',
        s.c2.truth === 'halvorsen' ? 'And three of those eleven sign-outs fall on the nights before the raids that went wrong.' : 'He has also been selling confiscated batteries back to Bazaar Row. He is a thief. Whether he is the leak is another question.',
      ],
      choices: (s) => [{ t: 'Copy it into the case file.', fx: adv(1, (st) => ((st.c2.ev.halvorsen += st.c2.truth === 'halvorsen' ? 2 : 1), { merit: 2 })), go: 'u_night' }],
    },
    c2_j2_gate: {
      text: (s) =>
        s.c2.truth === 'you'
          ? ['You pull the Gate 3 logs for the last thirty cycles. There it is. *Linen, cleared.* Your own designation beside it. The scanner flag overridden by hand.', 'Nobody has noticed yet. Somebody will.']
          : ['The Gate 3 logs are clean, mostly. A few overrides, all with plausible notes. One of them is Rook’s: *child’s medication, cleared, compassionate.* Not a leak. Not exactly regulation, either.'],
      choices: (s) =>
        s.c2.truth === 'you'
          ? [
              { t: 'Wipe the entry.', check: { skill: 'deception', diff: 15, pass: 'c2_j2_wiped', fail: 'c2_j2_wipe_fail' } },
              { t: 'Leave it. Wiping it would leave a bigger mark.', fx: adv(1, (st) => ((st.c2.ev.you += 1), null)), go: 'u_night' },
            ]
          : [
              { t: 'Log Rook’s override as evidence.', fx: adv(1, (st) => ((st.c2.ev.rook += 1), { cons: -3 })), go: 'u_night' },
              { t: 'Leave Rook’s override out of it.', fx: adv(1, { cons: 2 }), go: 'u_night' },
            ],
    },
    c2_j2_wiped: { text: ['You replace the entry with a routine scanner fault and back-date the correction. The log rebuilds itself around the lie without a seam.'], choices: [{ t: 'Go home.', fx: adv(1, { susp: -8, res: 4 }), go: 'u_night' }] },
    c2_j2_wipe_fail: { text: ['You start to change the entry. The terminal logs the edit attempt under your key. In the morning, Vesna will see it.'], choices: [{ t: 'Go home.', fx: adv(1, (s) => ((s.c2.ev.you += 2), { susp: 12 })), go: 'u_night' }] },
    c2_j2_rook: {
      text: ['Rook’s locker smells of tobacco. Inside: a spare filter, a real pre-war cigarette packet with three left, a photograph of a young unit with his mask pushed up, grinning. On the back, in Rook’s handwriting: *Feliks. First week.*', 'Nothing else. Nothing that matters to JURY.'],
      choices: [
        { t: 'Log the cigarettes. GREEN contraband is still contraband.', fx: adv(1, (st) => ((st.c2.ev.rook += 1), { cons: -4 })), go: 'u_night' },
        { t: 'Close the locker.', fx: adv(1, { cons: 2 }), go: 'u_night' },
      ],
    },
    c2_j2_plant: {
      text: ['You have a leaflet. You always have a leaflet. The question is whose locker gets it.'],
      choices: [
        { t: 'Rook’s.', check: { skill: 'deception', diff: 10, pass: 'c2_j2_plant_rook', fail: 'c2_j2_plant_fail' } },
        { t: 'Halvorsen’s. He is a thief anyway.', check: { skill: 'deception', diff: 5, pass: 'c2_j2_plant_hal', fail: 'c2_j2_plant_fail' } },
        { t: 'Nobody’s. Put it back in your pocket.', go: 'c2_j2' },
      ],
    },
    c2_j2_plant_rook: { text: ['You fold it into the photograph of Feliks. It will look like it was always there. It will look like Rook.'], choices: [{ t: 'Go home.', fx: adv(1, (s) => ((s.c2.ev.rook += 3), { cons: -15, susp: -6 })), go: 'u_night' }] },
    c2_j2_plant_hal: { text: ['You slide it under the battery cartons in Halvorsen’s locker. A thief with a leaflet is a traitor. That is how files work.'], choices: [{ t: 'Go home.', fx: adv(1, (s) => ((s.c2.ev.halvorsen += 3), { cons: -8, susp: -6 })), go: 'u_night' }] },
    c2_j2_plant_fail: { text: ['A door bangs upstairs. You freeze with the locker open and the leaflet in your hand for ten long seconds. Nobody comes. But your hands are shaking too much to finish, and you leave with it still in your pocket.'], choices: [{ t: 'Go home.', fx: adv(1, { susp: 4 }), go: 'u_night' }] },

    c2_j3: {
      title: 'Level 4 — Rook',
      enter: (s) => {
        G.startIq(s, { name: '"Rook" — UNION 02-48151', desc: 'a suspected leak in the D5 precinct', guilty: false, knows: s.c2.truth === 'halvorsen' ? 'Halvorsen sells the rosters. Everyone on the night squad knows. Nobody says, because he sells batteries cheap' : s.rel.rook >= 20 ? 'I know who it is, five. I’m not going to say it. Not to you, of all people' : 'I don’t know who it is. I know it isn’t me', hard: 5 }, 'c2_j3_end');
      },
      text: (s) => [
        '@portrait assets/img/portraits/rook-unmasked.webp|Rook, unmasked',
        'They have taken his mask. Without it, under the caged bulb, he looks older than he did on the roof. He looks at your lenses and laughs, once, without any humour in it.',
        '@say Rook|Five. Well. Three now. Look at you. Crimson suits you.',
        '@say Vesna|Three cycles. He’s a veteran. He knows the room.',
      ],
      choices: [{ t: 'Begin.', go: 'iq_round' }],
    },
    c2_j3_end: {
      text: (s) => {
        const q = s.iq;
        if (q.result === 'false') return ['Rook breaks. You did not think he could. He tells you he is the leak, in a flat voice, looking at the drain, and signs where Vesna points.', q.seen ? 'None of it is true. You know it, and he knows you know it.' : '@say Vesna|Well. That’s that, then.'];
        if (q.result === 'innocent') return [`@say Rook|${q.knows[0].toUpperCase() + q.knows.slice(1)}.`, 'He looks at you a long time.', '@say Rook|Feliks would’ve hated this room. You know that?'];
        return ['Three cycles. Rook gives you nothing but his designation and, at the very end, a look you will remember.'];
      },
      choices: (s) => [
        {
          t: 'Close the session.',
          fx: adv(1, (st) => {
            const q = st.iq;
            if (q.result === 'false') {
              st.c2.ev.rook += 3;
              st.c2.rookFalse = true;
              return { cons: -10, rel: { rook: -40 } };
            }
            if (q.result === 'innocent') {
              if (st.c2.truth === 'halvorsen') st.c2.ev.halvorsen += 2;
              return { rel: { rook: 5 } };
            }
            return { rel: { rook: -10 } };
          }),
          go: 'u_board',
        },
      ],
    },

    c2_j4: {
      title: 'The roof of the Nexus',
      text: (s) => {
        const suspected = s.c2.ev.you >= 2 || s.susp >= 40;
        return suspected
          ? [
              '@img assets/img/env/e19-roof.webp|The roof of the Nexus',
              'Vesna asks you to come up to the roof. It is the first time she has asked you anything.',
              'The wind up here is strong enough to lean on. The Spire fills half the sky.',
              '@say Vesna|Gate 3 logs. Your key. A basket marked linen. You know what I think.',
              '@say Vesna|Here’s what I don’t know. Why I haven’t told him yet.',
            ]
          : [
              '@img assets/img/env/e19-roof.webp|The roof of the Nexus',
              'Vesna asks you to come up to the roof. The wind is strong enough to lean on.',
              '@say Vesna|You should know something about the Magistrate before tomorrow. He doesn’t need the truth. He needs a name, and a file thick enough to hold it. If you give him the right name, good. If you give him a name, also good. If you give him nothing — that is the only wrong answer.',
              '@say Vesna|I’m telling you because I think you’d try to give him the truth. And I think that’s going to get you killed one day.',
            ];
      },
      choices: (s) => {
        const suspected = s.c2.ev.you >= 2 || s.susp >= 40;
        if (!suspected)
          return [
            { t: '"Then I’ll give him the right one."', fx: adv(1, { rel: { vesna: 8 } }), go: 'u_night' },
            { t: '"Thank you. I mean it."', fx: adv(1, { rel: { vesna: 12 }, cons: 1 }), go: 'u_night' },
          ];
        return [
          { t: 'Deny it. Calmly, completely.', check: { skill: 'deception', diff: 20, pass: 'c2_j4_deny_ok', fail: 'c2_j4_deny_bad' } },
          { t: 'Tell her the truth. All of it.', go: 'c2_j4_truth' },
          { t: '"If you tell him, I’ll tell him what you did to your brother."', tag: 'THREAT', tagCls: 'risk', go: 'c2_j4_threat' },
        ];
      },
    },
    c2_j4_deny_ok: { text: ['You tell her about scanner faults and manual overrides and the time Rook cleared a child’s medicine. You tell it dull. She listens to all of it.', '@say Vesna|...Fine. I believe you. Mostly. Mostly is enough, up here.'], choices: [{ t: 'Go home.', fx: adv(1, (s) => ((s.c2.ev.you = Math.max(0, s.c2.ev.you - 1)), { susp: -5, rel: { vesna: 4 } })), go: 'u_night' }] },
    c2_j4_deny_bad: { text: ['You deny it. She watches your hands the whole time, the way you were taught to watch other people’s hands.', '@say Vesna|You’re good. You’re not that good.'], choices: [{ t: 'Go home.', fx: adv(1, (s) => ((s.c2.ev.you += 1), { susp: 8, rel: { vesna: -10 } })), go: 'u_night' }] },
    c2_j4_truth: {
      text: ['You tell her. Wren. The Tinker. The baskets. It comes out of you like something you have been holding under your tongue for months.', 'Vesna listens without moving. When you finish she looks at the Spire for a long time.', '@say Vesna|My brother was in a cell in the canals. I filed him in under an hour so the Magistrate would never look at me. I’ve never told anyone that.', '@say Vesna|I won’t tell him. But tomorrow you’ll have to give him someone. Choose carefully. Whoever you choose, I’ll back you.'],
      choices: [{ t: 'Go home.', fx: adv(1, { rel: { vesna: 30 }, flag: { vesna_ally: true }, res: 5 }), go: 'u_night' }],
    },
    c2_j4_threat: { text: ['Vesna smiles. It is the worst thing you have ever seen her do.', '@say Vesna|He already knows. He’s the one who told me to do it. Good night, three.'], choices: [{ t: 'Go home.', fx: adv(1, (s) => ((s.c2.ev.you += 2), { susp: 12, rel: { vesna: -30 } })), go: 'u_night' }] },

    c2_j5: {
      title: 'The tribunal',
      checkpoint: true,
      text: (s) => [
        '@img assets/img/env/e17-magistrate.webp|The tribunal',
        'The Magistrate’s office. Two chairs. The wall of grey boxes. Vesna stands by the door. On the desk, open, your case file — every scrap you have gathered, laid out in order.',
        `@doc CASE: THE LEAK · D5 PRECINCT\nROOK — evidence ${s.c2.ev.rook}\nHALVORSEN — evidence ${s.c2.ev.halvorsen}${s.c2.ev.you ? '\nUNASSIGNED (Gate 3 key entries) — ' + s.c2.ev.you : ''}`,
        '@say Magistrate|A name, three.',
      ],
      choices: (s) => {
        const out = [
          { t: 'Name **Halvorsen**, the armoury clerk.', fx: (st) => ((st.c2.named = 'halvorsen'), null), go: 'c2_j5_verdict' },
          { t: 'Name **Rook**.', fx: (st) => ((st.c2.named = 'rook'), null), go: 'c2_j5_verdict' },
          { t: '"The evidence is insufficient, sir. I won’t give you a name I can’t stand behind."', tag: 'HONEST', tagCls: 'mercy', fx: (st) => ((st.c2.named = 'none'), null), go: 'c2_j5_verdict' },
        ];
        if (s.c2.truth === 'you') out.push({ t: '"It’s me, sir."', tag: 'CONFESS', tagCls: 'risk', fx: (st) => ((st.c2.named = 'you'), null), go: 'c2_j5_confess' });
        return out;
      },
    },
    c2_j5_verdict: {
      enter: (s) => {
        const n = s.c2.named;
        const ev = n === 'none' ? 0 : s.c2.ev[n] || 0;
        s.c2.accepted = n !== 'none' && (ev >= 3 || (ev >= 2 && s.flags.vesna_ally) || (ev >= 2 && s.lp >= 20));
        s.c2.correct = n === s.c2.truth;
        s.mem.c2pass = s.c2.accepted || (n === 'none' && Math.max(s.c2.ev.rook, s.c2.ev.halvorsen) < 3);
        if (s.mem.c2pass) {
          G.promote(s, '02');
          G.fx(s, { merit: 10, lp: s.c2.accepted ? 4 : 1 });
        } else G.fx(s, { susp: 12, merit: -4 });
        if (s.c2.accepted && n === 'rook') G.fx(s, { cons: -15, rel: { rook: -100 }, flag: { rook_amputated: true } });
        if (s.c2.accepted && n === 'halvorsen') G.fx(s, { cons: s.c2.correct ? 0 : -8 });
        if (s.c2.accepted && !s.c2.correct && s.c2.truth === 'you') G.fx(s, { susp: -20 });
      },
      text: (s) => {
        const n = s.c2.named;
        if (n === 'none')
          return s.mem.c2pass
            ? ['The Magistrate looks at you for a long time.', '@say Magistrate|Insufficient. Yes. It is. Most of my units would have given me a name anyway, to be done with it. You understand what it means that you did not?', '@say Magistrate|It means I can use you on the files that matter.', `@doc PROMOTION: ${G.desig(s)}`]
            : ['@say Magistrate|Insufficient? There are three pieces on Halvorsen and you will not stand behind three? Then what will you stand behind, three?', 'He closes your file. He opens the other one — the thin one with your designation on the tab.'];
        if (!s.c2.accepted) return ['@say Magistrate|That is not a file. That is a feeling. Bring me a file.', 'He does not raise his voice. He never does. You leave the office without a promotion and with a new note in your own folder.'];
        const lines = [
          '@say Magistrate|Good. It holds.',
          n === 'rook'
            ? 'They take Rook at 04:00 from his bunk. You are not there. Two days later his file comes back up to Level 4 stamped AMPUTATED, and is boxed and stencilled and put on the wall with all the others.'
            : '@portrait assets/img/portraits/halvorsen.webp|Halvorsen',
          n === 'rook'
            ? ''
            : 'They take Halvorsen at the armoury cage in front of the night squad. He screams that he only sold batteries. Nobody on the night squad says anything.',
          !s.c2.correct ? (s.c2.truth === 'you' ? 'The leaks stop for a while. They stop because you stop. It is the only reason, and only you and perhaps Vesna know it.' : 'The leaks do not stop. Three weeks later, another raid finds empty beds.') : 'The leaks stop. You were right. It does not feel the way you expected being right would feel.',
          `@doc PROMOTION: ${G.desig(s)}`,
        ];
        return lines;
      },
      choices: [{ t: 'Continue.', go: 'c2_end_jury' }],
    },
    c2_j5_confess: {
      text: ['You say it. The Magistrate does not move. Vesna, by the door, closes her eyes.', '@say Magistrate|I know.', 'He reaches into the wall of grey boxes without looking and pulls one out. Your CID is stencilled on it. It is much thicker than the folder he showed you on the first day.', '@say Magistrate|I have known since the baskets. I wanted to see what you would do with the room once you had the key. Most people use it to lock someone else inside.', '@say Magistrate|So. You will keep talking to the canals. Everything the canals tell you, you will tell me. And you will be the best JURY unit in City 9, because you will be two of them.'],
      choices: [
        { t: 'Accept. Become his double.', tag: 'DOUBLE', tagCls: 'loyal', fx: (s) => (G.promote(s, '02'), { flag: { jury_double: true }, susp: -30, cons: -10, merit: 6 }), go: 'c2_end_jury' },
        { t: 'Refuse.', tag: 'REFUSE', tagCls: 'risk', fx: { susp: 100 }, go: 'end_amputated' },
      ],
    },
    c2_end_jury: {
      checkpoint: true,
      title: 'End of Chapter Two — JURY',
      text: (s) => [
        s.flags.jury_double ? 'You walk out of the Magistrate’s office with a crimson armband, a fourth stripe and a second master. On Bazaar Row, the Tinker’s lamp is still burning. He does not know yet that every word he says to you now goes up the stairs.' : s.flags.rook_amputated ? 'There is a new grey box on the wall of the Magistrate’s office. You know the CID on it by heart. Somewhere in the D5 precinct, a photograph of a grinning boy called Feliks is being thrown away with the rest of a locker.' : s.c2.correct ? 'Halvorsen’s file goes up on the wall. The night squad buys its batteries somewhere else now.' : 'The wall of grey boxes is a little fuller. It is always a little fuller.',
        s.flags.vesna_ally ? 'Vesna nods to you in the corridor every morning. It is the closest thing to a friend you have on Level 4.' : null,
        '@radio ...JURY all units, priority BOLO relayed from City 17: a person of interest has escaped processing at the City 17 terminus. Description: male, approximately thirty, spectacles. Detain on sight. Do not engage alone...',
        '@say Vesna|City 17. Not our problem.',
        'She says it the way people say things they are not sure of.',
        '@sys CHAPTER TWO COMPLETE (JURY). You can keep serving on the duty board. Chapter Three is coming.',
      ],
      choices: [{ t: 'Return to duty.', go: 'u_duty_end' }],
    },
  });

  G.addCodex({
    interrogation: {
      title: 'JURY interrogation procedure',
      body: `<p>An interrogation lasts three cycles. In each cycle the interrogator chooses an approach:</p>
      <table>
        <tr><td>PRESS</td><td>Authority. Raises fear.</td></tr>
        <tr><td>LIE</td><td>Deception. Raises insight — the subject believes the game is already lost.</td></tr>
        <tr><td>LISTEN</td><td>Perception. Raises trust and a little insight.</td></tr>
        <tr><td>APPLY</td><td>Force. Raises fear sharply. Costs the interrogator something too.</td></tr>
      </table>
      <p>The guilty break under enough fear, trust or insight. <b>The innocent break too, under enough fear — and confess to anything.</b> A false confession looks exactly like a true one, unless you know how to read the subject. JURY files both.</p>`,
    },
  });

  /* chapter one now leads into chapter two */
  const ch1 = G.scenes.ch1_end;
  if (ch1) {
    ch1.choices = [{ t: 'Continue to Chapter Two.', go: 'c2_start' }];
    const oldText = ch1.text;
    ch1.text = (s, g) => (typeof oldText === 'function' ? oldText(s, g) : oldText).map((l) => (typeof l === 'string' && l.startsWith('@sys CHAPTER ONE COMPLETE') ? '@sys CHAPTER ONE COMPLETE.' : l));
  }
})();
