/* DIVISIONS — cast, daily duties and duty rules for every division beyond UNION.
   - G.DIV_CAST: the chief (your superior) and partner of each division. systems.js and squad.js
     read it, so hearings, reports and teams use the right faces.
   - G.divDuty(def): builds a duty (first-time scene + rotating routine variants) from data.
   - UNION street duties are UNION's; every other division gets its own board.
   Chapter-two arcs for these divisions live in arcs.js. */
(function () {
  const END = 'u_duty_end';
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  /* ================================================================ CAST */
  const P = (key, name, role, img) => (G.PEOPLE[key] = { name, role, img });
  G.DIV_CAST = {
    HELIX: {
      chief: { key: 'matron', short: 'Matron', img: 'unit-helix-ofc', cap: 'CCA.C9.D5-HELIX-OfC-40377 — "Matron"' },
      partner: { key: 'lark', short: 'Lark', squadName: '"Lark"', rank: '04', trait: 'medic', bio: 'Your HELIX partner. Hums hymns nobody else remembers while she stitches.' },
    },
    RAZOR: {
      chief: { key: 'bastion', short: 'Bastion', img: 'unit-razor-ofc', cap: 'CCA.C9.D5-RAZOR-OfC-81922 — "Bastion"' },
      partner: { key: 'brace', short: 'Brace', squadName: '"Brace"', rank: '04', trait: 'steady', bio: 'Your RAZOR partner. Can stand still for nine hours and remember every face that passed.' },
    },
    SPEAR: {
      chief: { key: 'kiln', short: 'Kiln', img: 'unit-spear-ofc', cap: 'CCA.C9.D5-SPEAR-OfC-67014 — "Kiln"' },
      partner: { key: 'rasp', short: 'Rasp', squadName: '"Rasp"', rank: '04', trait: 'hothead', bio: 'Your SPEAR partner. Laughs in the drains. Nobody knows if it is nerves.' },
    },
    VECTOR: {
      chief: { key: 'archivist', short: 'the Archivist', img: 'unit-vector-ofc', cap: 'CCA.C9.D1-VECTOR-OfC-33580 — "the Archivist"' },
      partner: { key: 'gauze', short: 'Gauze', squadName: '"Gauze"', rank: '04', trait: 'eyes', bio: 'Your VECTOR partner. Labels everything, including, once, you.' },
    },
    GRID: {
      chief: { key: 'foreman', short: 'Foreman', img: 'unit-grid-ofc', cap: 'CCA.C9.D1-GRID-OfC-26683 — "Foreman"' },
      partner: { key: 'solder', short: 'Solder', squadName: '"Solder"', rank: '04', trait: 'book', bio: 'Your GRID partner. Carries a notebook of every fault in D1, in pencil, in order.' },
    },
  };
  P('matron', '"Matron"', 'HELIX OfC · Nexus infirmary', 'unit-helix-ofc');
  P('lark', '"Lark"', 'HELIX 04 · your partner', 'unit-helix-04');
  P('bastion', '"Bastion"', 'RAZOR OfC · hardpoint command', 'unit-razor-ofc');
  P('brace', '"Brace"', 'RAZOR 04 · your partner', 'unit-razor-04');
  P('kiln', '"Kiln"', 'SPEAR OfC · 404 operations', 'unit-spear-ofc');
  P('rasp', '"Rasp"', 'SPEAR 04 · your partner', 'unit-spear-04');
  P('archivist', '"The Archivist"', 'VECTOR OfC · containment labs', 'unit-vector-ofc');
  P('gauze', '"Gauze"', 'VECTOR 04 · your partner', 'unit-vector-04');
  P('foreman', '"Foreman"', 'GRID OfC · D1 works', 'unit-grid-ofc');
  P('solder', '"Solder"', 'GRID 04 · your partner', 'unit-grid-04');

  /* the cast joins your contacts the day you join the division (and on load for older saves) */
  const meet = (s, note) => {
    const dc = G.DIV_CAST[s.div];
    if (!dc) return;
    const add = {};
    if (s.rel[dc.chief.key] === undefined) add[dc.chief.key] = 0;
    if (s.rel[dc.partner.key] === undefined) add[dc.partner.key] = 20;
    if (!Object.keys(add).length) return;
    if (note) G.fx(s, { rel: add });
    else Object.assign(s.rel, add);
  };
  G.extend('ch1_end', { after: (s) => meet(s, true) });
  G.extend('u_board', { before: (s) => meet(s, false) });
  /* the chief introduces the division on the first board after the transfer */
  G.extend('ch1_end', {
    text: (lines, s) => {
      const dc = G.DIV_CAST[s.div];
      if (dc) lines.splice(2, 0, `@portrait assets/img/portraits/${dc.chief.img}.webp|${dc.chief.cap}`, `Your new officer is **${G.PEOPLE[dc.chief.key].name}**; your partner, **${G.PEOPLE[dc.partner.key].name}**.`);
      return lines;
    },
  });

  /* ================================================================ DUTY RULES */
  /* UNION street duties belong to UNION (and to recruits who have no division yet) */
  ['ration', 'checkpoint', 'market', 'inspection', 'broadcast', 'escort', 'railyard'].forEach((k) => {
    const d = G.duties[k];
    if (!d) return;
    const old = d.if;
    d.if = (s) => (!s.div || s.div === 'UNION') && (!old || old(s));
  });

  /* ================================================================ BUILDER */
  const scenes = {};
  const DD_BLOCK = {};
  const lines = (v, s) => [].concat((typeof v === 'function' ? v(s) : v) || []);
  function build(id, def) {
    scenes[id] = {
      title: def.title,
      text: (s) => [def.img ? `@img ${def.img}` : null, ...lines(def.text, s)],
      choices: (s) =>
        def.choices
          .map((c, i) => [c, i])
          .filter(([c]) => !c.if || c.if(s))
          .map(([c, i]) => {
            const o = { t: c.t, tag: c.tag, tagCls: c.tagCls, lock: c.lock };
            if (c.go) return Object.assign(o, { fx: c.fx, go: c.go });
            if (c.check) return Object.assign(o, { check: { skill: c.check.skill, diff: c.check.diff, pass: `${id}_c${i}_ok`, fail: `${id}_c${i}_bad` } });
            return Object.assign(o, { go: `${id}_c${i}` });
          }),
    };
    def.choices.forEach((c, i) => {
      if (c.go) return;
      const out = (txt, fx) => ({ text: (s) => lines(txt, s), choices: [{ t: 'End of shift.', fx, go: END }] });
      if (c.check) {
        scenes[`${id}_c${i}_ok`] = out(c.check.ok, c.check.okFx);
        scenes[`${id}_c${i}_bad`] = out(c.check.bad, c.check.badFx);
      } else scenes[`${id}_c${i}`] = out(c.out, c.fx);
    });
  }
  G.divDuty = (d) => {
    const base = 'dd_' + d.key;
    G.duties[d.key] = { name: d.name, desc: d.desc, first: base, routine: base + '_r', if: (s) => s.div === d.div && (!d.if || d.if(s)) };
    build(base, d.first);
    d.routine.forEach((r, i) => build(`${base}_r${i}`, r));
    scenes[base + '_r'] = {
      safe: true,
      enter: (s) => {
        s.mem.ddLast = s.mem.ddLast || {};
        const n = d.routine.length;
        let i = Math.floor(Math.random() * n);
        if (n > 1 && i === s.mem.ddLast[d.key]) i = (i + 1) % n;
        s.mem.ddLast[d.key] = i;
        return `${base}_r${i}`;
      },
      text: [],
    };
    if (d.block) DD_BLOCK[d.key] = d.block;
  };
  /* district stability: division duties count toward the block they happen in */
  const oldBlockFor = G.blockFor;
  if (oldBlockFor)
    G.blockFor = (s, id) => {
      id = id || s.scene;
      const m = /^dd_([a-z0-9]+?)(?:_|$)/.exec(id || '');
      if (m && DD_BLOCK[m[1]]) return DD_BLOCK[m[1]];
      return oldBlockFor(s, id);
    };

  const img = (n) => `assets/img/env/${n}.webp`;
  const sup = (s) => G.superiorOf(s).name;
  const mate = (s) => G.partnerOf(s).name;

  /* ================================================================ HELIX */
  G.divDuty({
    key: 'hward',
    div: 'HELIX',
    name: 'Infirmary night shift',
    desc: 'The HELIX ward beneath the Nexus, 20:00 to 06:00.',
    first: {
      title: 'The HELIX ward — 23:10',
      img: img('e07-level4'),
      text: (s) => [
        'Twenty beds under white light that never dims. Units on the left, by regulation. Citizens on the right, when there is room, which there usually is not.',
        `@say ${sup(s)}|Bed 6 is a citizen from Level 4. JURY wants him able to talk by morning. Bed 7 is a 05 with a stab wound who wants his mother. You have one unit of synthetic blood. Good night.`,
      ],
      choices: [
        { t: 'Bed 6. JURY asked first.', tag: 'BY THE BOOK', tagCls: 'loyal', check: { skill: 'medical', diff: 5, ok: ['The citizen from Level 4 is awake by dawn, and looks at you as if you had done something unforgivable. The 05 in bed 7 lives anyway, barely.'], okFx: { merit: 4, lp: 2, cons: -3, xp: { medical: 1 } }, bad: ['The citizen in bed 6 dies at 04:00 with the blood still running into him. JURY will want to know why.'], badFx: (s) => (G.discipline(s, 'minor', 'Loss of a JURY subject in HELIX care'), { merit: -1 }) } },
        { t: 'Bed 7. Units first; that is the rule too.', check: { skill: 'medical', diff: 0, ok: ['The 05 lives. He holds your glove until he falls asleep. Bed 6 makes it to morning on his own, which surprises everyone.'], okFx: { merit: 3, cons: 2, xp: { medical: 1 } }, bad: ['The 05 lives. Bed 6 does not. Nobody from JURY comes to collect the body; they send a form.'], badFx: { merit: 1, cons: -2 } } },
        { t: 'Split the unit between them and work through the night.', tag: 'MERCY', tagCls: 'mercy', check: { skill: 'medical', diff: 15, ok: ['Half a unit each, and eight hours of your hands. Both of them are breathing at shift change. Matron reads the chart and says nothing at all, which from Matron is applause.'], okFx: { merit: 5, cons: 5, rel: { matron: 8 }, xp: { medical: 2 } }, bad: ['Half a unit is not enough for either of them. You learn exactly how much it is not enough.'], badFx: { cons: -4, hp: -5 } } },
      ],
    },
    routine: [
      {
        title: 'The HELIX ward — night',
        text: ['A quiet night. Two units with burns from a ration-hatch fire, a CWU crewman with crushed fingers, and the fluorescent tube over bed 12 that buzzes like a trapped wasp.'],
        choices: [
          { t: 'Do the rounds properly.', out: ['Dressings changed, charts updated, the buzzing tube replaced at 03:00 from the store cupboard. A good night is a night nobody remembers.'], fx: { merit: 2, xp: { medical: 1 } } },
          { t: 'Sit with the CWU crewman. He is frightened of losing the hand.', tag: 'MERCY', tagCls: 'mercy', out: ['You tell him about splinting and nerve damage in plain words. He listens like a child at a broadcast. He keeps the hand.'], fx: { cons: 3, merit: 1 } },
        ],
      },
      {
        title: 'The HELIX ward — an extra patient',
        text: (s) => [`At 01:40 ${mate(s)} wheels in a citizen nobody has logged: a girl with a fever, brought down by a unit who will not give his designation. "My sister's girl," he says, and leaves.`],
        choices: [
          { t: 'Log her properly. Unregistered admissions are a JURY matter.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['You log her. In the morning a JURY clerk comes for the name of the unit. You give it.'], fx: { merit: 3, cons: -5 } },
          { t: 'Treat her and log her as a CWU dependant.', tag: 'MERCY', tagCls: 'mercy', check: { skill: 'deception', diff: 5, ok: ['The fever breaks at dawn. The log says what you wrote. Nobody checks the log.'], okFx: { cons: 5, res: 2 }, bad: ['Matron reads the log at shift change and taps the line with one finger. "CWU dependants have CWU cards."'], badFx: (s) => (G.discipline(s, 'minor', 'False admission record'), { cons: 3 }) } },
        ],
      },
      {
        title: 'The HELIX ward — the drug cabinet',
        text: ['The morphine count is two ampoules short at the 04:00 check. Your key, the night clerk’s key, and Matron’s are the only three.'],
        choices: [
          { t: 'Report the shortfall at once.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['JURY interviews the night clerk for six hours. The ampoules turn up in a laundry bag. Nobody says whose.'], fx: { merit: 3 } },
          { t: 'Correct the count. Somebody needed them more than the cabinet.', tag: 'MERCY', tagCls: 'mercy', out: ['You change a 2 to a 0 in a careful hand. It is the easiest lie you have ever told and you hate how easy.'], fx: { susp: 3, cons: 1 } },
        ],
      },
    ],
  });

  G.divDuty({
    key: 'hfield',
    div: 'HELIX',
    name: 'Field medic, UNION patrol',
    desc: 'Walk the Stacks with a UNION protection team. Treat whoever falls.',
    block: 's14',
    first: {
      title: 'Stack 14 — with a UNION team',
      img: img('e03-bazaar'),
      text: ['A UNION protection team takes a stairwell in Stack 14 at a run. You follow with the kit. At the top, a man is on the landing with a split scalp, and a 04 is standing over him with a bloody baton, breathing hard.', '@say UNION 04|He fell.'],
      choices: [
        { t: 'Treat him. Write “fell”.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['Six stitches and a lie. The 04 nods to you on the way down, the way units nod to units.'], fx: { merit: 3, cons: -4 } },
        { t: 'Treat him and write what you see.', tag: 'MERCY', tagCls: 'mercy', out: ['Your report says *injuries consistent with a baton*. It goes up the chain. Two days later the 04 is reassigned to the rail yards, and units on the stairs stop nodding to you.'], fx: { cons: 4, merit: 1, lp: -1 } },
        { t: 'Ask the 04 what really happened, quietly, off the record.', check: { skill: 'authority', diff: 5, ok: ['He tells you: the man spat at him. That is all. He is ashamed, which is more than you expected.'], okFx: { cons: 2, xp: { authority: 1 } }, bad: ['He tells you to mind your kit, and walks away.'], badFx: {} } },
      ],
    },
    routine: [
      { title: 'Stack 14 — a stairwell', text: ['A fall on the stairs, a real one: an old woman with a broken wrist and a bag of ration packets spilled down two flights.'], choices: [{ t: 'Splint the wrist and pick up the packets.', tag: 'MERCY', tagCls: 'mercy', out: ['She counts the packets twice before she lets you go.'], fx: { cons: 2, merit: 1 } }, { t: 'Splint the wrist. The packets are not your job.', out: ['The packets are gone by the time she can stand.'], fx: { merit: 2 } }] },
      { title: 'Bazaar Row — a crush', text: ['A ration rumour sends Bazaar Row into a stampede for ninety seconds. Afterwards: a crushed foot, a child with a nosebleed, and a UNION 05 who took a stall pole to the face.'], choices: [{ t: 'Triage by regulation: the 05 first.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['The 05 will keep the eye. The child stops bleeding on his own.'], fx: { merit: 3 } }, { t: 'The worst first, whoever it is.', tag: 'MERCY', tagCls: 'mercy', out: ['The crushed foot was the worst. The 05 waits, swearing. His squad leader writes your designation down.'], fx: { cons: 3, lp: -1 } }] },
      { title: 'Stack 9 — a door that will not open', text: (s) => [`A neighbour says nobody has come out of 5D in four days. ${mate(s)} looks at you. The door is locked from inside.`], choices: [{ t: 'Break it down.', check: { skill: 'fitness', diff: 5, ok: ['An old man on the floor, alive, dehydrated, ashamed. You get water into him. He will live.'], okFx: { merit: 3, cons: 3 }, bad: ['The door holds; by the time the warden brings the key, it is too late.'], badFx: { cons: -3 } } }, { t: 'Log it and call the warden.', out: ['The warden comes at noon. You do not stay to see what he finds.'], fx: { merit: 1 } }] },
    ],
  });

  G.divDuty({
    key: 'hcert',
    div: 'HELIX',
    name: 'Fitness certification',
    desc: 'Medical screening at the Works. FIT or UNFIT — UNFIT goes on a list.',
    block: 'plaza',
    first: {
      title: 'The Works — screening hall',
      text: ['Three hundred mill workers in a line, stripped to the waist, coughing. You have a stamp that says FIT and a stamp that says UNFIT. UNFIT workers are *reassigned*. Everyone in the line knows what that word means.', 'The woman in front of you has a cough that is going to kill her within the year. She has two children waiting outside the hall.'],
      choices: [
        { t: 'UNFIT. The cough is real.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['She takes the slip without a word. Outside, through the window, you watch her not tell her children.'], fx: { merit: 3, cons: -6 } },
        { t: 'FIT. She has a year. Let her have it at home.', tag: 'MERCY', tagCls: 'mercy', check: { skill: 'deception', diff: 5, ok: ['FIT. She looks at you as if she had misheard. Then she goes, very fast.'], okFx: { cons: 6, res: 2 }, bad: ['FIT. The HELIX auditor at the end of the line takes the card from her hand and stamps it again, red, and writes your number.'], badFx: (s) => (G.discipline(s, 'minor', 'Falsified fitness certification'), { cons: 3 }) } },
        { t: 'Refer her to the infirmary for “further tests”. Buy her time.', check: { skill: 'comms', diff: 10, ok: ['Further tests take three weeks in HELIX. Three weeks is something.'], okFx: { cons: 3, merit: 1 }, bad: ['The referral comes back the same afternoon: UNFIT, confirmed.'], badFx: { cons: -2 } } },
      ],
    },
    routine: [
      { title: 'The Works — screening', text: ['A young man in the line has a bad leg he hides by standing very straight. He is very good at it. You are better.'], choices: [{ t: 'UNFIT.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['He does not argue. That is somehow the worst part.'], fx: { merit: 2, cons: -4 } }, { t: 'FIT. You did not see the leg.', tag: 'MERCY', tagCls: 'mercy', out: ['He walks out of the hall without limping until the door closes.'], fx: { cons: 4, susp: 1 } }] },
      { title: 'The Works — screening', text: ['A clean day. Three hundred FIT stamps. Your wrist aches by noon. Somewhere a list stays short because of a good harvest of healthy lungs.'], choices: [{ t: 'Stamp, stamp, stamp.', out: ['Nobody thanks you, because nobody needs to.'], fx: { merit: 2 } }] },
      { title: 'The Works — a quota', text: (s) => [`@say ${sup(s)}|The Works needs forty fewer mouths this cycle. Forty UNFIT by the end of the day. I don’t care which forty.`], choices: [{ t: 'Find forty.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['You find forty. By the end you are not looking at faces any more, only lungs.'], fx: { merit: 5, lp: 3, cons: -12 } }, { t: 'Find twenty honest ones and say that is all there are.', tag: 'MERCY', tagCls: 'mercy', check: { skill: 'authority', diff: 15, ok: ['Matron reads your list, looks at you for a long time, and signs it.'], okFx: { cons: 6, merit: 1 }, bad: ['Matron finds the other twenty herself.'], badFx: (s) => (G.discipline(s, 'minor', 'Certification quota not met'), { cons: 2 }) } }] },
    ],
  });

  /* ================================================================ RAZOR */
  G.divDuty({
    key: 'rgate',
    div: 'RAZOR',
    name: 'Hardpoint watch',
    desc: 'The forcefield gate between D1 and the Stacks. Nobody passes without a reason.',
    first: {
      title: 'Hardpoint D1-3 — the forcefield gate',
      img: img('e11-gate'),
      text: ['The hardpoint is a concrete box with a forcefield across the road and a scanner over the gap. On one side, the Nexus. On the other, the Stacks. You decide who exists on which side.', 'A CWU courier arrives with a sealed box for the Administrator’s staff. His pass is valid. The box hums.'],
      choices: [
        { t: 'Open the box.', tag: 'BY THE BOOK', tagCls: 'loyal', check: { skill: 'perception', diff: 5, ok: ['A portable heater. For the Administrator’s cat. You close the box and the courier and you never speak of it again.'], okFx: { merit: 3, xp: { perception: 1 } }, bad: ['The seal breaks and the box is just a heater, and the courier’s supervisor files a complaint about a broken seal.'], badFx: { merit: -1 } } },
        { t: 'The pass is valid. Let it through.', out: ['The field drops for four seconds. The courier walks into the Nexus with a humming box. You will never know.'], fx: { merit: 1 } },
        { t: 'Call it up the chain and make the courier wait.', check: { skill: 'comms', diff: 0, ok: ['Bastion clears it in nine minutes. Bastion notes that you asked.'], okFx: { merit: 2, rel: { bastion: 4 } }, bad: ['Nobody answers for an hour. The courier misses his slot and is docked a ration.'], badFx: { cons: -1 } } },
      ],
    },
    routine: [
      { title: 'Hardpoint D1-3 — morning traffic', text: ['Six hundred CWU passes in two hours. Your scanner reads every one. One of them is a dead woman’s.'], choices: [{ t: 'Stop the card. Detain the holder.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['Her daughter. Using the card to keep the job. JURY collects her at ten.'], fx: { merit: 3, cons: -4 } }, { t: 'Confiscate the card. Let her go back.', tag: 'MERCY', tagCls: 'mercy', out: ['She goes back into the Stacks without a job, which in City 9 is its own sentence.'], fx: { cons: 1, merit: 1 } }] },
      { title: 'Hardpoint D1-3 — a child', text: ['A boy of six walks up to the forcefield and puts his hand on it to see what it does. It does what it does.'], choices: [{ t: 'Drop the field and pull him back.', tag: 'MERCY', tagCls: 'mercy', out: ['Three seconds without a field at a RAZOR hardpoint. It will be in the log. The boy’s hand will heal.'], fx: (s) => (G.discipline(s, 'minor', 'Unscheduled field drop'), { cons: 4 }) }, { t: 'Shout at him through the amplifier.', out: ['He runs. His hand is red to the wrist. He will not do it again.'], fx: { merit: 1 } }] },
      { title: 'Hardpoint D1-3 — inspection', text: (s) => [`Bastion walks the hardpoint at dawn with a white glove, touching every surface. ${mate(s)} has left a cup on the scanner housing.`], choices: [{ t: 'Take the blame for the cup.', tag: 'MERCY', tagCls: 'mercy', out: ['Bastion looks at the cup, then at you. “Twice is a pattern.”'], fx: (s) => ({ merit: -1, rel: { brace: 8 } }) }, { t: 'Say nothing.', out: (s) => [`Bastion writes ${mate(s)}’s designation down.`], fx: { rel: { brace: -6 } } }] },
    ],
  });

  G.divDuty({
    key: 'rvip',
    div: 'RAZOR',
    name: 'VIP escort',
    desc: 'Walk beside a Union official through the city. Nothing touches them.',
    block: 'bazaar',
    first: {
      title: 'Bazaar Row — escort',
      img: img('e03-bazaar'),
      text: ['The Deputy Distribution Commissioner wants to *see the people*. Four RAZOR units walk him down Bazaar Row in a diamond. He shakes hands with stall holders who do not want to shake hands.', 'A girl steps out of the crowd with something in her fist and walks straight at him.'],
      choices: [
        { t: 'Put her on the ground. Now.', tag: 'BY THE BOOK', tagCls: 'loyal', check: { skill: 'melee', diff: 0, ok: ['She is on the ground before she finishes her step. In her fist: a paper flower made from a ration wrapper. The Commissioner laughs and asks for her name.'], okFx: { merit: 4, cons: -3 }, bad: ['You trip her too hard and she cracks her head on the cobbles. The flower blows away.'], badFx: { merit: 2, cons: -6 } } },
        { t: 'Step between them and take her wrist.', check: { skill: 'perception', diff: 5, ok: ['A paper flower. You let her give it to him. He pins it to his coat and talks about it for a week.'], okFx: { merit: 3, cons: 3 }, bad: ['A paper flower, crushed in your glove. She cries. The Commissioner looks away, embarrassed for you.'], badFx: { merit: 1 } } },
      ],
    },
    routine: [
      { title: 'Escort — the Works', text: ['The Commissioner visits the textile mills. The mill hands stand at their looms and do not look up. He says the word *productivity* eleven times.'], choices: [{ t: 'Watch the exits.', out: ['Nothing happens. In RAZOR that is the job done.'], fx: { merit: 2 } }, { t: 'Watch the mill hands.', check: { skill: 'perception', diff: 5, ok: ['A woman at loom 9 has a file hidden in her sleeve. You do not know what for. You report it, or you do not; you have time to decide.'], okFx: { merit: 2, xp: { perception: 1 } }, bad: ['Faces. Just faces.'], badFx: {} } }] },
      { title: 'Escort — the Nexus steps', text: ['An Overwatch squad shoulders past your diamond on the Nexus steps as if it were not there. The Commissioner pretends he did not notice. So do you.'], choices: [{ t: 'Hold the diamond.', out: ['You hold it. The Overwatch squad does not care either way.'], fx: { merit: 2 } }] },
      { title: 'Escort — a long night', text: (s) => [`The official you are guarding tonight drinks until 03:00 and talks to ${mate(s)} about his daughter in City 1. Then he asks what you think of him.`], choices: [{ t: '“I think you are under my protection, sir.”', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['He laughs and says that is the best answer he has had all year.'], fx: { merit: 2, lp: 1 } }, { t: 'Tell him the truth.', tag: 'RISK', tagCls: 'risk', check: { skill: 'authority', diff: 15, ok: ['He listens, and goes quiet, and in the morning he does not remember. You do.'], okFx: { cons: 3 }, bad: ['He remembers.'], badFx: (s) => (G.discipline(s, 'minor', 'Insubordinate remark to a Union official'), { lp: -2 }) } }] },
    ],
  });

  G.divDuty({
    key: 'rarmory',
    div: 'RAZOR',
    name: 'Armoury audit',
    desc: 'Count every weapon in the Nexus armoury against the register.',
    first: {
      title: 'The Nexus armoury',
      text: ['Four hundred USP-Matches, sixty MP7s, crates of rounds. Your count comes out at three hundred and ninety-eight pistols. The quartermaster has a pencil behind his ear and a twitch under his eye.'],
      choices: [
        { t: 'Report two missing sidearms.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['JURY seals the armoury for a day. Two pistols turn up in a D3 basement a week later, and the quartermaster does not turn up anywhere.'], fx: { merit: 5, lp: 3, cons: -4 } },
        { t: 'Count again, slowly, in front of him.', check: { skill: 'perception', diff: 10, ok: ['On the second count you find them: two pistols misfiled in the MP7 racks. The quartermaster nearly weeps.'], okFx: { merit: 3, cons: 2 }, bad: ['Three hundred and ninety-eight, again.'], badFx: { merit: 1 } } },
        { t: '“Four hundred.” Sign it.', tag: 'RISK', tagCls: 'risk', out: ['You sign. The quartermaster shakes your hand for too long. Somewhere in the canals, two pistols are loaded.'], fx: { res: 6, susp: 4, tokens: 5 } },
      ],
    },
    routine: [
      { title: 'The armoury — rounds', text: ['Counting 9mm rounds by the thousand. Your eyes go strange after the first hour.'], choices: [{ t: 'Count every one.', out: ['Correct to the round. Nobody notices correctness.'], fx: { merit: 2 } }] },
      { title: 'The armoury — a request', text: ['A UNION 02 asks you, off the record, to sign out an extra magazine for the night sweep. He is frightened of the rail yards.'], choices: [{ t: 'Sign it.', tag: 'MERCY', tagCls: 'mercy', out: ['He brings it back unfired. He brings you a cigarette too.'], fx: { cons: 2, susp: 1 } }, { t: 'Refuse.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['He nods. He expected nothing else.'], fx: { merit: 1 } }] },
    ],
  });

  /* ================================================================ SPEAR */
  G.divDuty({
    key: 'sprobe',
    div: 'SPEAR',
    name: '404 perimeter probe',
    desc: 'Walk the quarantine wall beyond the eastern canal. Find the breaches.',
    first: {
      title: 'The 404 wall — east canal',
      img: img('e12-railyard'),
      text: (s) => [
        'The quarantine wall runs along the eastern canal: concrete slabs, wire, warning signs that nobody needs to read. Behind it, Old Town is quiet the way a held breath is quiet.',
        `Halfway along, ${mate(s)} finds a gap under the wire, freshly dug, and small footprints in the mud going *out* of the zone, not in.`,
      ],
      choices: [
        { t: 'Follow the footprints into the Stacks.', check: { skill: 'perception', diff: 10, ok: ['They lead to a stairwell in Stack 22 and a family of four who came out of the 404 zone with a pram full of tinned food from before the war. Nobody is infected. Everybody is terrified.'], okFx: { merit: 3, xp: { perception: 1 } }, bad: ['They vanish on the paving.'], badFx: {} } },
        { t: 'Seal the gap and report it.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['Concrete in the hole, a pin on the map, a line in the log.'], fx: { merit: 3 } },
        { t: 'Look through the gap first.', tag: 'RISK', tagCls: 'risk', check: { skill: 'fitness', diff: 10, ok: ['On the other side: a garden. Somebody is growing potatoes in the courtyard of a dead block. You stand there for a long time.'], okFx: { cons: 4, xp: { fitness: 1 } }, bad: ['Something on the other side moves toward the sound of you. You get out. Barely.'], badFx: { hp: -15 } } },
      ],
    },
    routine: [
      { title: 'The 404 wall', text: ['A long walk along the wire. A crow on a sign. A smell from the other side that you will taste in your sleep.'], choices: [{ t: 'Walk it.', out: ['Fourteen kilometres. No breaches.'], fx: { merit: 2, xp: { fitness: 1 } } }] },
      { title: 'The 404 wall — a voice', text: ['Someone on the other side of the wall is calling for help in a clear, educated voice. Over and over. The same words, the same rhythm.'], choices: [{ t: 'Answer.', tag: 'RISK', tagCls: 'risk', check: { skill: 'perception', diff: 15, ok: ['You listen longer before you answer, and hear it: the breath does not change. It is not a person. You walk away.'], okFx: { xp: { perception: 1 } }, bad: ['You answer. The voice stops. Something climbs.'], badFx: { hp: -20 } } }, { t: 'Log it and walk on.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['SPEAR has a code for voices. You use it.'], fx: { merit: 2 } }] },
      { title: 'The 404 wall — a body', text: (s) => [`${mate(s)} finds a CWU worker dead at the foot of the wall, inside the city, with a sack of scrap from the zone.`], choices: [{ t: 'Call VECTOR.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['VECTOR comes in suits and takes the body and the sack and the soil under both.'], fx: { merit: 2 } }, { t: 'Check his pockets first.', out: ['A photograph, a ration card, and a hand-drawn map of a safe route through Old Town.'], fx: { xp: { perception: 1 }, res: 2 } }] },
    ],
  });

  G.divDuty({
    key: 'sclear',
    div: 'SPEAR',
    name: 'Building clearance',
    desc: 'Go into Old Town with a squad. Clear one block, floor by floor.',
    first: {
      title: 'Old Town — Block 6',
      text: ['Six storeys of dead flats beyond the canal. SPEAR goes in by floors: shotgun, lamp, door, room, mark the door with a cross. The third floor smells of something sweet.', 'Behind the fourth door: a man who used to be a man, standing in the corner, facing the wall, very still. And behind him, a child’s cot.'],
      choices: [
        { t: 'Fire.', tag: 'BY THE BOOK', tagCls: 'loyal', check: { skill: 'firearms', diff: 5, ok: ['It goes down. The cot is empty. It has been empty for a long time.'], okFx: { merit: 4, xp: { firearms: 1 } }, bad: ['It turns before you fire. It is fast.'], badFx: (s) => (s.squad && s.squad.formed && G.squadHit(s, true, 'Old Town'), { hp: -20, merit: 2 }) } },
        { t: 'Back out. Mark the door. Let VECTOR have it.', out: ['VECTOR burns the floor that afternoon. You watch the smoke from the canal.'], fx: { merit: 2 } },
      ],
    },
    routine: [
      { title: 'Old Town — clearance', text: ['A block of empty flats: furniture, photographs, a table laid for a dinner nobody came back for. You mark forty doors.'], choices: [{ t: 'Mark the doors.', out: ['Forty crosses in red paint.'], fx: { merit: 2 } }, { t: 'Take one photograph from the table.', out: ['A family on a beach. You do not know why you took it.'], fx: { cons: 2, give: 'photo' } }] },
      { title: 'Old Town — survivors', text: ['On the top floor of Block 9: a woman and an old man, alive, thin, with a rain barrel and a pigeon trap. They have lived here since the war.'], choices: [{ t: 'Bring them in. The zone is quarantined.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['They come without a fight. VECTOR takes them for testing. You do not see them again.'], fx: { merit: 4, cons: -5 } }, { t: 'Mark the floor as clear.', tag: 'MERCY', tagCls: 'mercy', out: ['The old man salutes you, wrongly, with the wrong hand.'], fx: { cons: 6, susp: 3 } }] },
      { title: 'Old Town — a nest', text: ['The basement of Block 4 is a nest. You hear it before you see it.'], choices: [{ t: 'Go in with fire.', check: { skill: 'firearms', diff: 10, ok: ['It is over in three minutes and you will smell it for three weeks.'], okFx: { merit: 5 }, bad: ['It is over in three minutes and one of the squad does not come up the stairs.'], badFx: (s) => (s.squad && s.squad.formed && G.squadHit(s, true, 'a basement in Old Town'), { merit: 2, hp: -10 }) } }, { t: 'Seal the basement.', out: ['Concrete and a warning sign. Somebody else’s problem, next year.'], fx: { merit: 2 } }] },
    ],
  });

  G.divDuty({
    key: 'stags',
    div: 'SPEAR',
    name: 'Tag recovery',
    desc: 'Bring back the designation tags of units lost in the zone.',
    first: {
      title: 'Old Town — the lost squad',
      text: ['A UNION squad went into Old Town eight months ago chasing a cell and never came out. SPEAR wants their tags. The families want nothing; families of units are not told.', 'You find them in a tram depot. Four of them. One is still wearing his mask.'],
      choices: [
        { t: 'Take the tags. Leave the rest.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['Four tags in a pouch, light as nothing.'], fx: { merit: 4 } },
        { t: 'Take the mask too, for whoever had him.', tag: 'MERCY', tagCls: 'mercy', out: ['Inside the mask: a pencil note to someone called Ada. You find her a month later on Bazaar Row and do not know what to say.'], fx: { cons: 5, merit: 1 } },
      ],
    },
    routine: [{ title: 'Old Town — tags', text: ['Another tag in a ditch by the wall. 05, UNION. A boy, by the number.'], choices: [{ t: 'Pocket it.', out: ['It goes into the box at the precinct with the others.'], fx: { merit: 2 } }] }],
  });

  /* ================================================================ VECTOR */
  G.divDuty({
    key: 'vdecon',
    div: 'VECTOR',
    name: 'Decontamination shift',
    desc: 'Scrub units and citizens coming back over the quarantine line.',
    first: {
      title: 'Decon station — the east bridge',
      text: ['Everyone who crosses back from the 404 zone comes through your tent: foam, scrubbers, a scanner arch that turns red for infection. A SPEAR unit walks through and it turns red.', '@say SPEAR 02|It’s a cut. A cut. I’ve had it a week. Scan again.'],
      choices: [
        { t: 'Hold him for testing.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['He goes to the labs. The test says clean. The labs keep him a week anyway, to be sure.'], fx: { merit: 3 } },
        { t: 'Scan again.', check: { skill: 'medical', diff: 5, ok: ['Green. A faulty arch. You write it up and save a man a week in a cell.'], okFx: { merit: 3, cons: 2 }, bad: ['Red again. His face behind the mask changes.'], badFx: { cons: -2 } } },
      ],
    },
    routine: [
      { title: 'Decon station', text: ['Forty crossings. Forty foam showers. Forty green lights. Your gloves wear through by noon.'], choices: [{ t: 'Work the line.', out: ['Nobody turns red today.'], fx: { merit: 2 } }] },
      { title: 'Decon station — a smuggler', text: ['A CWU scrap crew comes through with a cart. The arch is green. The cart is very heavy for scrap.'], choices: [{ t: 'Search the cart.', check: { skill: 'perception', diff: 5, ok: ['Tinned food from before the war, two hundred tins under the scrap. Contraband, and uncontaminated, and worth a fortune in the Stacks.'], okFx: { merit: 4 }, bad: ['Scrap.'], badFx: {} } }, { t: 'Wave it through.', tag: 'MERCY', tagCls: 'mercy', out: ['The cart goes through. A tin of peaches turns up on your bunk that night.'], fx: { cons: 1, susp: 2, give: 'ration' } }] },
    ],
  });

  G.divDuty({
    key: 'vlab',
    div: 'VECTOR',
    name: 'Containment labs',
    desc: 'Beneath the Nexus. Specimens, samples, and things that were people.',
    first: {
      title: 'Containment lab 3 — beneath the Nexus',
      img: img('e07-level4'),
      text: (s) => [
        'Glass tanks, a smell of formalin and ozone, and the Archivist moving between them with a slate like a librarian between shelves.',
        '@say The Archivist|Tank 4 is a citizen from the canal raids, early stage. We are measuring progression. Your task is to record, every hour, for twelve hours. Only to record.',
        'The citizen in tank 4 is awake. She has written something on the glass in condensation: a name, and a stack number.',
      ],
      choices: [
        { t: 'Record. Only record.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['Twelve entries in a neat hand. You do not record the name on the glass.'], fx: { merit: 4, cons: -8 } },
        { t: 'Record the name too, and find the stack afterwards.', tag: 'MERCY', tagCls: 'mercy', out: ['Stack 9, flat 2B: a man and two children who were told she was relocated. You do not tell them anything different. You just know, now.'], fx: { cons: 4, xp: { perception: 1 } } },
        { t: 'Ask the Archivist what happens at the end of the twelve hours.', check: { skill: 'authority', diff: 10, ok: ['“Then we will know,” the Archivist says, and for the first time looks at you properly. “You ask good questions. Do not ask them in front of anyone else.”'], okFx: { rel: { archivist: 8 }, merit: 2 }, bad: ['“Then you will go home.”'], badFx: {} } },
      ],
    },
    routine: [
      { title: 'Containment lab 3', text: ['Samples in, samples out. Jars of grey tissue labelled in the Archivist’s tiny hand.'], choices: [{ t: 'Label the jars.', out: ['Three hundred labels. Not one wrong.'], fx: { merit: 2, xp: { medical: 1 } } }] },
      { title: 'Containment lab 3 — a breach', text: ['A tank seal fails at 02:00. Something in it is trying to get out of the gap.'], choices: [{ t: 'Burn it.', tag: 'BY THE BOOK', tagCls: 'loyal', check: { skill: 'firearms', diff: 5, ok: ['The incinerator wand does its work. The alarm stops.'], okFx: { merit: 4 }, bad: ['It gets an arm out before you get it.'], badFx: { hp: -20, merit: 2 } } }, { t: 'Reseal it by hand.', tag: 'RISK', tagCls: 'risk', check: { skill: 'fitness', diff: 15, ok: ['You hold the seal with both gauntlets until the foam sets. The specimen survives. The Archivist is grateful in a way that frightens you.'], okFx: { merit: 5, rel: { archivist: 6 } }, bad: ['You hold it. Then you do not.'], badFx: { hp: -30 } } }] },
    ],
  });

  G.divDuty({
    key: 'vsample',
    div: 'VECTOR',
    name: 'Canal sampling',
    desc: 'Take water and silt samples along the D3 canals.',
    block: 's9',
    first: {
      title: 'The D3 canals — sampling run',
      img: img('e13-pumphouse'),
      text: (s) => ['Twelve sample points along the canals, a jar at each. At point 7, under the lock bridge, the water is warm and smells of iron, and there is a pump-house door that has been opened recently.', `${mate(s)} points at the chalk mark beside it: a small lambda.`],
      choices: [
        { t: 'Report the door. Take your sample.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['A pin on a JURY map. Your jar is very slightly warm.'], fx: { merit: 3, res: -3 } },
        { t: 'Take your sample. Nothing else.', out: ['Twelve jars. A clean run.'], fx: { merit: 2 } },
        { t: 'Look inside.', tag: 'RISK', tagCls: 'risk', check: { skill: 'deception', diff: 5, ok: ['A field hospital: three cots, a stolen HELIX kit, blood on the floor. Nobody there. You close the door.'], okFx: { cons: 2, res: 4 }, bad: ['Somebody inside sees your suit and runs out of the far door. Now they know you saw.'], badFx: { susp: 2 } } },
      ],
    },
    routine: [{ title: 'The D3 canals — sampling', text: ['Twelve jars, twelve labels, rain the whole way. The water at point 3 is the colour of weak tea.'], choices: [{ t: 'Finish the run.', out: ['Back by dusk, filters clogged.'], fx: { merit: 2 } }] }],
  });

  /* ================================================================ GRID */
  G.divDuty({
    key: 'gfield',
    div: 'GRID',
    name: 'Forcefield repair',
    desc: 'A field generator is failing somewhere in D5. Usually because someone made it fail.',
    block: 's22',
    first: {
      title: 'Stack 22 — field generator 4',
      img: img('e20-junction'),
      text: (s) => ['Generator 4 seals the alley behind Stack 22 after curfew. Tonight it flickers: on, off, on. Someone has bridged two of its terminals with a ration-tin strip. Neat work. Clean solder.', `@say ${mate(s)}|That’s a bypass. Somebody wants to walk through here at a particular time.`],
      choices: [
        { t: 'Repair it and report the tamper.', tag: 'BY THE BOOK', tagCls: 'loyal', check: { skill: 'comms', diff: 0, ok: ['The field steadies. JURY gets a photograph of the solder joints.'], okFx: { merit: 4, xp: { comms: 1 } }, bad: ['A spark. The generator dies completely until morning.'], badFx: { hp: -8, merit: 1 } } },
        { t: 'Repair it so it fails again tomorrow night, at the same time.', tag: 'RISK', tagCls: 'risk', check: { skill: 'comms', diff: 10, ok: ['Nobody but you will ever know which joint you left weak.'], okFx: { res: 8, susp: 2 }, bad: ['You get it wrong; it fails now, with you standing in it.'], badFx: { hp: -15 } } },
        { t: 'Leave the bypass. Stake out the alley.', check: { skill: 'perception', diff: 10, ok: ['At 23:40 a man with a sack comes down the alley. Contraband. You take him.'], okFx: { merit: 5 }, bad: ['Nobody comes. Somebody saw you waiting.'], badFx: {} } },
      ],
    },
    routine: [
      { title: 'D5 — a dead field', text: ['A field generator in Bazaar Row has simply worn out. Old Union hardware, older than you.'], choices: [{ t: 'Rebuild the coil.', check: { skill: 'comms', diff: 5, ok: ['It hums again. Good as new; better, honestly.'], okFx: { merit: 3, xp: { comms: 1 } }, bad: ['It hums for an hour and dies. Tomorrow, again.'], badFx: { merit: 1 } } }] },
      { title: 'D5 — a child in the field', text: ['A field in Stack 14 has trapped a child half through it at curfew. She is crying and not moving, because moving hurts.'], choices: [{ t: 'Drop the whole sector.', tag: 'MERCY', tagCls: 'mercy', out: ['Thirty seconds without a field in Stack 14. It will be in the log.'], fx: (s) => (G.discipline(s, 'minor', 'Unscheduled field drop'), { cons: 5 }) }, { t: 'Tune the field down to nothing around her.', check: { skill: 'comms', diff: 15, ok: ['A delicate job. She steps out on her own. Nobody logs anything.'], okFx: { cons: 4, xp: { comms: 2 } }, bad: ['You get it wrong. She steps out. It hurts her.'], badFx: { cons: -2 } } }] },
    ],
  });

  G.divDuty({
    key: 'gscan',
    div: 'GRID',
    name: 'Scanner maintenance',
    desc: 'Climb the masts. Keep the drones and fixed scanners seeing.',
    first: {
      title: 'Scanner mast 9 — the Stacks',
      img: img('e15-roof'),
      text: ['Mast 9 has been blind for two days. At the top, forty metres up in the wind, you find out why: a sock pulled over the lens. A child’s sock, knitted, blue.'],
      choices: [
        { t: 'Remove it and report vandalism.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['JURY dusts the mast for prints. Forty metres up, in the wind.'], fx: { merit: 3 } },
        { t: 'Remove it. Keep the sock.', tag: 'MERCY', tagCls: 'mercy', out: ['It stays in your locker. You never decide why.'], fx: { cons: 2, merit: 2 } },
      ],
    },
    routine: [
      { title: 'Scanner mast — routine', text: ['Lens cleaning, firmware, a bird’s nest in the housing.'], choices: [{ t: 'Clear the nest.', out: ['The scanner sees again. The bird circles.'], fx: { merit: 2 } }, { t: 'Leave the nest and angle the lens around it.', tag: 'MERCY', tagCls: 'mercy', check: { skill: 'comms', diff: 5, ok: ['It sees everything except one balcony. Nobody notices.'], okFx: { cons: 2 }, bad: ['The angle is off; the whole sector is blurred. Foreman notices.'], badFx: { merit: -1 } } }] },
      { title: 'Scanner logs', text: (s) => [`Downloading a week of drone footage, ${mate(s)} pauses on a frame: a unit in a D5 alley, unmasked, kissing a citizen.`], choices: [{ t: 'Flag it.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['Level 4 for both of them.'], fx: { merit: 3, cons: -5 } }, { t: 'Corrupt the frame.', tag: 'MERCY', tagCls: 'mercy', check: { skill: 'deception', diff: 10, ok: ['A data fault. Twelve frames lost. These things happen.'], okFx: { cons: 4, susp: 2 }, bad: ['Solder watches you do it.'], badFx: { rel: { solder: -8 }, susp: 4 } } }] },
    ],
  });

  G.divDuty({
    key: 'glock',
    div: 'GRID',
    name: 'Combine lock calibration',
    desc: 'Every Union lock in D1 is checked by hand. Every one.',
    first: {
      title: 'D1 — lock calibration',
      text: ['Combine locks hum when they are healthy and click when they are not. The lock on a Nexus service door clicks. Inside the housing: a second, smaller device, not Union, very well made, recording every code entered.'],
      choices: [
        { t: 'Remove it and take it to Foreman.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['Foreman turns it over in his gloves for a long time. “Canal work,” he says. “Good canal work.”'], fx: { merit: 5, rel: { foreman: 5 } } },
        { t: 'Leave it. Somebody is listening, and now you know where.', tag: 'RISK', tagCls: 'risk', out: ['You close the housing. The lock clicks. The listener goes on listening.'], fx: { res: 6, susp: 3 } },
      ],
    },
    routine: [{ title: 'D1 — locks', text: ['Two hundred locks. Two hundred hums.'], choices: [{ t: 'Check them all.', out: ['Your ears ring all evening.'], fx: { merit: 2, xp: { comms: 1 } } }] }],
  });

  /* ================================================================ JURY (more) */
  G.divDuty({
    key: 'jtail',
    div: 'JURY',
    name: 'Surveillance',
    desc: 'Follow a citizen through D5 out of uniform. Do not be seen.',
    block: 'bazaar',
    first: {
      title: 'Bazaar Row — out of uniform',
      img: img('e03-bazaar'),
      text: ['Out of uniform you are just another tired citizen with good boots. Your subject is a CWU clerk who has been meeting someone on Bazaar Row every Thursday. Today is Thursday.', 'He buys nothing, talks to no one, and stops at the battery stall twice.'],
      choices: [
        { t: 'Stay close. Hear what is said.', check: { skill: 'deception', diff: 10, ok: ['At the stall he says one word: *Thursday*. The stall holder gives him a battery with a paper wrapped round it.'], okFx: { merit: 4, xp: { deception: 1 } }, bad: ['He turns and looks straight at you. Then he buys a battery and goes home, and will never come back to the Row.'], badFx: { merit: -1 } } },
        { t: 'Stay far back. Watch who watches him.', check: { skill: 'perception', diff: 5, ok: ['Someone else is following him too: a woman in a red headscarf. You follow her instead, and she leads you to a pump house.'], okFx: { merit: 5, xp: { perception: 1 } }, bad: ['You lose him in the crowd at the cinema.'], badFx: {} } },
      ],
    },
    routine: [
      { title: 'Surveillance — a doorway', text: ['Six hours in a doorway watching a door that does not open.'], choices: [{ t: 'Watch.', out: ['At 22:00 a light goes on. That is the whole report.'], fx: { merit: 2 } }] },
      { title: 'Surveillance — a familiar face', if: (s) => s.rel.mira !== undefined, text: ['Your subject today meets, briefly, on a corner, someone you know very well: Mira.'], choices: [{ t: 'Log it.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['You write her CID in your own hand.'], fx: { merit: 4, cons: -10, rel: { mira: -10 } } }, { t: 'Log a different corner.', tag: 'MERCY', tagCls: 'mercy', out: ['Your report says Stack 22. The clerk will never know why the JURY van went to the wrong place.'], fx: { cons: 4, susp: 4, rel: { mira: 5 } } }] },
    ],
  });

  G.divDuty({
    key: 'jclerk',
    div: 'JURY',
    name: 'Tribunal clerk',
    desc: 'Record verdicts at the Level 4 tribunal. Every word.',
    first: {
      title: 'Level 4 — the tribunal room',
      img: img('e07-level4'),
      text: ['You sit at a small desk beside the Magistrate and write down what is said. Today: nine cases in four hours. The eighth is a 05 accused of selling his baton.', 'The 05 says he lost it. The Magistrate looks at you and says, “Write: *the subject confessed*.” The subject did not.'],
      choices: [
        { t: 'Write it.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['Three words in a neat hand. The 05 is amputated on Thursday.'], fx: { merit: 4, lp: 2, cons: -10 } },
        { t: 'Write what he actually said.', tag: 'RISK', tagCls: 'risk', check: { skill: 'authority', diff: 15, ok: ['The Magistrate reads the line, then reads it again, then smiles very slightly. “Very well. Re-education.”'], okFx: { cons: 6, rel: { magistrate: 5 } }, bad: ['The Magistrate takes the pen out of your hand and writes it himself.'], badFx: (s) => (G.discipline(s, 'minor', 'Refused to record a tribunal finding'), { cons: 3 }) } },
      ],
    },
    routine: [
      { title: 'Level 4 — verdicts', text: ['Twelve cases. Twelve verdicts. Your hand cramps on the ninth.'], choices: [{ t: 'Write every word.', out: ['The record is perfect. The record is always perfect.'], fx: { merit: 2, xp: { comms: 1 } } }] },
      { title: 'Level 4 — a name you know', text: (s) => {
        const f = Object.values(s.files || {}).find((x) => !x.amputated);
        return [f ? `Case six is CID ${f.cid} — ${f.desc} — from your own case files. The charge rests on your old report.` : 'Case six is a citizen you stopped once, months ago. The charge rests on your old report.'];
      }, choices: [{ t: 'Say nothing. Write.', out: ['The verdict rests on your words. They hold.'], fx: { merit: 2, cons: -3 } }, { t: 'Tell the Magistrate the report was incomplete.', tag: 'MERCY', tagCls: 'mercy', out: ['He adjourns the case. He also opens your file and makes a note.'], fx: { cons: 4, susp: 2 } }] },
    ],
  });

  G.divDuty({
    key: 'jarchive',
    div: 'JURY',
    name: 'The archive',
    desc: 'The wall of grey boxes. Reopen a cold case.',
    first: {
      title: 'Level 4 — the archive',
      text: ['The Magistrate’s wall of grey boxes goes back to the war. You are told to pick a cold case and *warm it*. One box is labelled only with a date: the night the first relocation train left City 9.'],
      choices: [
        { t: 'Open it.', check: { skill: 'perception', diff: 5, ok: ['Inside: the list of the first train, and a second list, of the people who were on the platform and not on the train. Your parents are on the second list.'], okFx: { cons: 2, xp: { perception: 1 }, flag: { saw_first_list: true } }, bad: ['Mould. Unreadable pages. A dead end.'], badFx: {} } },
        { t: 'Pick something ordinary. A ration fraud.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['A ration fraud from three years ago, solved by lunch. The Magistrate seems disappointed in you.'], fx: { merit: 3 } },
      ],
    },
    routine: [{ title: 'Level 4 — the archive', text: ['Boxes, dust, the ticking fan.'], choices: [{ t: 'Read until your eyes ache.', out: ['Nothing today. The archive keeps its secrets on bad days and gives them away on worse ones.'], fx: { merit: 2 } }] }],
  });

  G.addScenes(scenes);
  G.DD_BLOCK = DD_BLOCK;
})();
