/* CHAPTER THIRTEEN — "The Hearing". All divisions. Four acts, one long day and a night.
   ACT I — DIRECTION FINDING. An unregistered transmitter has been talking on the Sector band since Nova
   Prospekt. Three listening posts, a dial, a map: you find it (minigame "dfind").
   ACT II — THE RAID. You reach the operator, or a decoy. Arrest her, let her go, or listen to the tape.
   ACT III — THE SUMMONS. JURY charges you with aiding the resistance. The charges are built from what you
   actually did: the canal cells, the coast road, Nova Prospekt, the operator.
   ACT IV — THE HEARING (minigame "trial"). Three witnesses give statements; one of each is false. Press them,
   and present evidence from your own record: service record, case files, the Nova Prospekt report, the tape.
   A wrong accusation costs credibility. Outcome: acquitted, reprimanded or convicted, then a deal.
   You remain Civil Protection throughout. Freeman is never named here. */
(function () {
  G.chapter({ n: 13, stages: [] });
  const pick = G.pick;
  const C = (s) => s.c13;
  const VIGIL = '@portrait assets/img/portraits/vigil.webp|Field Commander Vigil';
  const MAG = '@portrait assets/img/portraits/magistrate.webp|The Magistrate — JURY';
  const LEDGER = '@portrait assets/img/portraits/ledger.webp|"Ledger" — JURY';
  const files = (s) => Object.values(s.files || {});
  const freedFiles = (s) => files(s).filter((f) => /WARNING|RELEASED|NO FINDINGS|reduced|WARNED/.test(f.lastVerdict || '')).length;
  const c12 = (s) => s.c12 || {};

  /* ---------------------------------------------------------- the charges, built from your record */
  const charges = (s) => {
    const l = [];
    const a = c12(s), c10 = s.c10 || {};
    if (a.report === 'lambda') l.push('Passing a copy of a Nova Prospekt inquiry to a resistance courier.');
    if (a.freed >= 1) l.push(`Permitting the release of ${a.freed} detainee${a.freed > 1 ? 's' : ''} at Nova Prospekt.`);
    if (c10.desFate === 'freed') l.push('Allowing a deserter to walk away on the coast road.');
    if (c10.prisoner && c10.prisoner !== 'convoy') l.push('Conversation with a Lambda prisoner, unrecorded.');
    if (s.c13 && s.c13.op === 'freed') l.push('Releasing a radio operator who was transmitting on the Sector band.');
    if ((s.rel || {}).ostrova >= 25) l.push('Association with Warden Ostrova beyond what her duties require.');
    if (s.res >= 30) l.push('Unreported contact with the canal cells.');
    if (freedFiles(s) >= 6) l.push(`A pattern of leniency: ${freedFiles(s)} citizens released or warned.`);
    while (l.length < 2) l.push(pick(['Failure to report a contact in the Nexus corridor, as noted by JURY.', 'Negligence in the keeping of a day-book.', 'Unexplained time at Stack 14.']));
    return l.slice(0, 5);
  };

  /* ---------------------------------------------------------- the hearing: witnesses and the court record */
  const record = (s) => {
    const a = c12(s), f = files(s);
    const R = [{ id: 'service', label: 'SERVICE RECORD', desc: `${s.day} days in service · ${f.length} case files · merit ${s.merit}${s.c11 && s.c11.done ? ' · the siege of the Nexus: at your post for the whole night' : ''}` }];
    R.push({ id: 'files', label: 'CASE FILES', desc: `${f.length} files · ${freedFiles(s)} released or warned · ${f.filter((x) => x.amputated).length} amputated` });
    R.push({ id: 'np', label: 'NOVA PROSPEKT REPORT', desc: `HANDLED ${a.handled || 0} · MISSED ${a.missed || 0} · ORDER ${a.order === undefined ? '—' : a.order + '%'} · RELEASED ${a.freed || 0}` });
    if (s.c13 && s.c13.op) R.push({ id: 'tape', label: 'RADIO TAPE', desc: 'The operator’s tape, recovered at the raid.' });
    if (a.clues >= 3 && a.report !== 'truth') R.push({ id: 'pages', label: 'RESTORED LEDGER PAGES', desc: 'Pages 40–44 of the Nova Prospekt transfer log.' });
    return R;
  };
  const witnesses = (s) => {
    const a = c12(s);
    const hasNp = (a.handled || 0) > 0;
    const hasFiles = files(s).length >= 1;
    const W = [];
    W.push({
      name: 'Commandant Dorn', role: 'Nova Prospekt', img: 'dorn', stm: [
        { t: 'This unit arrived at my gate on the day of the uprising. Correctly dressed. Correctly armed. I have no complaint of its manners.', press: 'Dorn: A statement of fact. I am not asking the Court to find anything in it.' },
        { t: hasNp ? 'In my opinion this unit did nothing at Nova Prospekt but walk. Nothing was handled. Nothing was held. It was a tourist with a rank.' : 'In my opinion this unit never once held a line under fire. A paper unit. A pencil.', press: 'Dorn: I was in the tower, Magistrate. I saw the yard. I saw very little that this unit did.', contra: hasNp ? 'np' : 'service', hit: hasNp ? 'Dorn: …Handled. The report says handled. I was in the tower, Magistrate, and the tower has a small window.' : 'Dorn: …The Nexus. Yes. I heard about the Nexus. I was told it held.' },
        { t: a.report === 'truth' ? 'And I will add that this unit filed an official report naming my key. A report I am sure is full of errors.' : 'And when the cells opened, this unit was nowhere I could see. I would say nowhere at all.', press: 'Dorn: I would say what I have said. I would say it again.' },
      ],
    });
    W.push({
      name: 'Sergeant Kell', role: 'Prospekt Warden', img: 'kell', stm: [
        { t: 'This unit asked me for the gate log, and I gave it. A Warden gives a unit its log. Six years I have kept that gate.', press: 'Kell: I have kept it in order. Whatever is in the book is in the book.' },
        { t: 'This unit has never held a line under fire. It writes reports. It stands where it is told to stand and it goes home.', press: 'Kell: Some units are made for the street. This unit was made for a desk.', contra: 'service', hit: 'Kell: The Nexus. Yes. I… heard about the Nexus. Twelve hours, they say. I will withdraw the word never.' },
        { t: 'At the yard, I saw it step out in front of a crowd. I did not call that discipline. I did not call it anything.', press: 'Kell: I will say only that it was a great many people, and one unit, and nobody fired.' },
      ],
    });
    W.push({
      name: 'Ledger', role: 'JURY', img: 'ledger', stm: [
        { t: 'JURY has watched this unit for a long time. A very long time. It is all in my notes.', press: 'Ledger: Notes, Magistrate. Dates. Names. A handwriting I would know anywhere.' },
        { t: hasFiles ? 'And in all those notes, I find no stop. Not one citizen this unit has filed against. Not one name on a case sheet.' : 'And in all those notes, I find no case that this unit brought to a conclusion. Nothing of its own.', press: 'Ledger: I read it twice, Magistrate. I do not like to read things twice.', contra: hasFiles ? 'files' : 'np', hit: hasFiles ? 'Ledger: (turning a page) …Then I will correct my notes.' : 'Ledger: (turning a page) …The report. Yes. I will correct my notes.' },
        { t: 'I will say only that this unit passed through the Nexus corridor on the night of the siege, and that it had, I think, an expression.', press: 'Ledger: An expression, Magistrate. I wrote it down. I do not know what it meant.' },
      ],
    });
    return W;
  };

  /* ---------------------------------------------------------- minigame: the hearing */
  G.MINIGAMES = G.MINIGAMES || {};
  G.MINIGAMES.trial = (block, opts, done) => {
    const S = G.state();
    const W = opts.witnesses, R = opts.record;
    let wi = 0, si = 0, hearts = 5, found = 0, over = false, struck = {};
    const root = document.createElement('div');
    root.className = 'mini trial';
    root.innerHTML = `<div class="cr-head"><span class="cr-title">The hearing</span><span class="cr-clock"></span></div>
      <div class="tr-wit"></div><div class="tr-stmt"></div><div class="tr-resp"></div><div class="tr-btns"></div><div class="tr-ev" hidden></div>
      <div class="cr-help">One statement from each witness is false. PRESS a statement to learn more. PRESENT evidence from your record when it contradicts what is said. A wrong accusation costs credibility.</div>`;
    block.append(root);
    const $ = (q) => root.querySelector(q);
    const hearts_ = () => '♥'.repeat(hearts) + '♡'.repeat(5 - hearts);
    const face = (k) => `<img src="assets/img/portraits/${k}-thumb.webp" alt="">`;
    const draw = () => {
      if (over) return;
      const w = W[wi], st = w.stm[si];
      $('.cr-clock').textContent = `${hearts_()} · found ${found}/${W.length}`;
      $('.tr-wit').innerHTML = `${face(w.img)}<div><b>${w.name}</b><small>${w.role} · witness ${wi + 1} of ${W.length} · statement ${si + 1} of ${w.stm.length}</small></div>`;
      $('.tr-stmt').innerHTML = `<q>${st.t}</q>${struck[`${wi}.${si}`] ? '<em> — STRUCK</em>' : ''}`;
      const caught = w.stm.some((x, i) => struck[`${wi}.${i}`]);
      $('.tr-btns').innerHTML = `<button type="button" data-b="press">Press</button><button type="button" data-b="present" ${caught ? 'disabled' : ''}>Present evidence</button><button type="button" data-b="next">${si + 1 < w.stm.length ? 'Next statement' : wi + 1 < W.length ? 'Next witness' : 'Close the hearing'}</button>`;
      $('.tr-ev').hidden = true;
    };
    const say = (t) => ($('.tr-resp').innerHTML = t);
    const finish = () => {
      if (over) return;
      over = true;
      root.classList.add(found >= 2 && hearts > 0 ? 'won' : 'lost');
      $('.tr-btns').innerHTML = '';
      $('.tr-ev').hidden = true;
      $('.cr-clock').textContent = `${hearts_()} · found ${found}/${W.length}`;
      say(hearts <= 0 ? 'The Magistrate raises one hand. <em>“The Court has heard enough.”</em>' : `The hearing is closed. You caught ${found} of ${W.length} false statements.`);
      done(found >= 2 && hearts > 0, { found, hearts });
    };
    root.addEventListener('click', (e) => {
      if (over || G.state() !== S) return;
      const b = e.target.closest('[data-b]');
      const ev = e.target.closest('[data-ev]');
      const w = W[wi], st = w.stm[si];
      if (b) {
        if (b.dataset.b === 'press') say(st.press);
        else if (b.dataset.b === 'present') {
          $('.tr-ev').innerHTML = R.map((r) => `<button type="button" data-ev="${r.id}"><b>${r.label}</b><small>${r.desc}</small></button>`).join('');
          $('.tr-ev').hidden = false;
        } else {
          say('');
          if (si + 1 < w.stm.length) si++;
          else if (wi + 1 < W.length) ((wi++), (si = 0));
          else return finish();
          draw();
        }
      } else if (ev) {
        $('.tr-ev').hidden = true;
        if (st.contra && st.contra === ev.dataset.ev) {
          found++;
          struck[`${wi}.${si}`] = true;
          say(`<b>OBJECTION SUSTAINED.</b> ${st.hit}`);
          draw();
          root.querySelector('.tr-stmt').insertAdjacentHTML('beforeend', '');
        } else {
          hearts--;
          say(`<b>The Magistrate:</b> <em>“That has no bearing on what the witness has said, unit.”</em>`);
          $('.cr-clock').textContent = `${hearts_()} · found ${found}/${W.length}`;
          if (hearts <= 0) finish();
        }
      }
    });
    draw();
  };

  /* ---------------------------------------------------------- the scenes */
  const verdictOf = (d, s) => {
    if (!d) return s.lastCheck ? 'reprimand' : 'convicted';
    const heavy = C(s).charges.length;
    if (d.hearts > 0 && d.found >= 3 && heavy <= 4) return 'acquitted';
    if (d.hearts > 0 && d.found >= 2) return 'reprimand';
    return 'convicted';
  };
  G.addScenes({
    c13_start: {
      checkpoint: true,
      safe: true,
      title: 'Chapter Thirteen',
      enter: (s) => {
        s.chapter = 13;
        s.c13 = { stage: 0, startDay: s.day, site: pick(G.DF_SITES).id, op: null, tape: false, listened: false, escaped: false, charges: [], deal: null, verdict: null };
      },
      text: [
        '@big CHAPTER THIRTEEN',
        '@sys ALL DIVISIONS · THE HEARING',
        'Nine days after Nova Prospekt, a signal comes up on the Sector band at 03:10 and stays for eleven minutes. A woman’s voice, reading a list of numbers. It is not in any Union code. It is not a transmitter that is on any register.',
        'At 06:00 the dispatch is on your desk. It carries no name and the order is one line: find it.',
      ],
      choices: [{ t: 'Report to Vigil.', go: 'c13_brief' }],
    },
    c13_brief: {
      title: 'The Nexus — Vigil’s office',
      text: (s) => {
        const r = c12(s).report;
        return [
          VIGIL,
          '@say Vigil|The transmitter is somewhere in the city. It talks for eleven minutes and then it does not. Three of our posts can hear it. Three bearings make a place. You have an hour.',
          r === 'lambda' ? '@say Vigil|(a pause) I would like you to be the one who does this, unit. I would like to see how you do it.' : r === 'truth' ? '@say Vigil|And after Nova Prospekt, I would rather it were you than somebody who does not read reports.' : '@say Vigil|Quietly. Do not turn it into a parade.',
          '@sys Three listening posts. A dial. A map. The signal comes in bursts: lock the bearing where it peaks. Radio & Protocol cuts the noise.',
        ];
      },
      choices: [{ t: 'Go to the receivers.', go: 'c13_df' }],
    },
    c13_df: {
      title: 'The receivers — direction finding',
      enter: (s) => G.unlock(s, 'dfinding'),
      text: ['@sys The headphones fill with surf and a thin female voice, counting. The dial in front of you turns as easily as a doorknob.'],
      mini: { type: 'dfind', opts: (s) => ({ site: C(s).site, title: 'Direction finding' }), pass: 'c13_df_ok', fail: 'c13_df_bad', skill: 'comms', diff: 0 },
    },
    c13_df_ok: {
      title: 'The transmitter',
      text: (s) => [`Three lines, one place. ${G.DF_SITES.find((x) => x.id === C(s).site).name[0].toUpperCase()}${G.DF_SITES.find((x) => x.id === C(s).site).name.slice(1)}. You send nobody ahead of you.`, 'You go up the stairs with your lens dark and your hand off the baton, which the training manual does not mention.'],
      choices: [{ t: 'Open the door.', go: 'c13_raid' }],
    },
    c13_df_bad: {
      title: 'The wrong place',
      enter: (s) => (C(s).escaped = true),
      text: ['You send a team to the place your lines crossed. It is an empty room with a tape recorder on a loop and a note: “KEEP LISTENING.” Whoever the voice was, she has been somewhere else for hours.', 'Vigil does not shout. Vigil says: “So we do not have her.”'],
      choices: [{ t: 'Go back to the Nexus.', go: 'c13_summons' }],
    },
    c13_raid: {
      title: 'The room',
      text: (s) => [
        'A girl of about nineteen sits at a table in a coat too large for her, with a microphone and a tin of boiled sweets. She stops reading numbers the moment you come in. She does not stand. She says, in a flat voice: “I thought it would be later.”',
        c12(s).report === 'lambda' ? 'She looks at your armband, then at your face. She says: “It was you. At Nova Prospekt. The paper.” And is quiet.' : null,
      ],
      choices: [
        { t: 'Arrest her. Take the tape.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: (st) => ((C(st).op = 'arrested'), (C(st).tape = true), { merit: 5, lp: 3, cons: -4 }), go: 'c13_summons' },
        { t: 'Let her go. Keep the tape.', tag: 'MERCY', tagCls: 'mercy', fx: (st) => ((C(st).op = 'freed'), (C(st).tape = true), { cons: 4, res: 3, susp: 3 }), go: 'c13_summons' },
        { t: 'Sit down and listen to the tape first.', tag: 'RISK', tagCls: 'risk', fx: (st) => ((C(st).listened = true), null), go: 'c13_raid_tape' },
      ],
    },
    c13_raid_tape: {
      title: 'The tape',
      text: (s) => [
        'She presses the key. Numbers, then a short message in plain Russian-flat English: “To the one in the gate yard who held the door. We know your name. We will not use it. Thank you.” Then eleven minutes of nothing.',
        c12(s).freed >= 1 ? 'It is not addressed to you by name. It does not need to be.' : 'It could be about anyone. It is not.',
      ],
      choices: [
        { t: 'Arrest her. The tape goes to JURY.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: (st) => ((C(st).op = 'arrested'), (C(st).tape = true), { merit: 4, lp: 2, cons: -5 }), go: 'c13_summons' },
        { t: 'Let her go. Wipe the tape and keep the room.', tag: 'MERCY', tagCls: 'mercy', fx: (st) => ((C(st).op = 'freed'), (C(st).tape = false), { cons: 5, res: 4, susp: 4 }), go: 'c13_summons' },
      ],
    },
    c13_summons: {
      title: 'The Nexus — Level 4',
      enter: (s) => {
        C(s).charges = charges(s);
        G.unlock(s, 'tribunal');
      },
      text: (s) => [
        MAG,
        '@say The Magistrate|You are summoned to the Court of the Nexus at 18:00 to answer charges laid before JURY. You may bring evidence. You may not bring a defender. There is no defender.',
        '@sys THE CHARGES · ' + C(s).charges.map((c, i) => `${i + 1}. ${c}`).join(' · '),
      ],
      choices: [{ t: 'Go to the hearing.', go: 'c13_trial_intro' }],
    },
    c13_trial_intro: {
      title: 'The Court of the Nexus',
      text: (s) => [
        '@img assets/img/env/e17-magistrate.webp|The Court of the Nexus',
        LEDGER,
        `@say Ledger|The charges against this unit are ${C(s).charges.length}. I will read them once. ${C(s).charges.map((c, i) => `${i + 1}: ${c}`).join(' ')}`,
        '@say The Magistrate|Three witnesses. Each will speak. This unit may press them and may present what it has. I will remind the unit that the Court does not like to be wrong, and likes even less to be told so.',
      ],
      choices: [{ t: 'Take your place.', go: 'c13_trial' }],
    },
    c13_trial: {
      title: 'The hearing',
      text: ['@sys The Court sits. The first witness is called.'],
      mini: { type: 'trial', opts: (s) => ({ witnesses: witnesses(s), record: record(s) }), pass: 'c13_verdict', fail: 'c13_verdict', skill: 'authority', diff: 0 },
    },
    c13_verdict: {
      checkpoint: true,
      title: 'The verdict',
      enter: (s) => {
        C(s).verdict = verdictOf(s.lastMini, s);
      },
      text: (s) => {
        const v = C(s).verdict;
        return [
          MAG,
          {
            acquitted: '@say The Magistrate|Not proven. The Court dismisses the charges. The Court notes, for the record, that Ledger’s notes will be corrected. The Court does not expect the unit to be grateful.',
            reprimand: '@say The Magistrate|Some of it is proven and some of it is not. The Court finds a reprimand. A note on the file. The unit will understand that a note is how the Court says: we are watching.',
            convicted: '@say The Magistrate|Proven. The Court has heard enough. The sentence will be read in the morning. The unit may, if it wishes, speak to Ledger tonight.',
          }[v],
        ];
      },
      choices: (s) => {
        const v = C(s).verdict;
        const fx = { acquitted: { merit: 8, lp: 4, cons: 2, susp: -10 }, reprimand: { merit: -4, susp: 6 }, convicted: { merit: -10, susp: 14, lp: -5 } }[v];
        return [{ t: v === 'acquitted' ? 'Leave the Court.' : 'Ask to speak to Ledger.', fx, go: v === 'acquitted' ? 'c13_end' : 'c13_deal' }];
      },
    },
    c13_deal: {
      title: 'Ledger — the corridor',
      text: (s) => [
        LEDGER,
        '@say Ledger|There is a way this goes a little better. It requires that I have something to write down. A name. I do not mind whose. I will not think less of you. I will think exactly as much of you as I do now.',
      ],
      choices: (s) => {
        const c = C(s);
        const l = [];
        if (c.op === 'freed' || c12(s).freed >= 1) l.push({ t: 'Give them the operator, or someone from the yard.', tag: 'BETRAY', tagCls: 'risk', fx: (st) => ((C(st).deal = 'betrayed'), (C(st).verdict = C(st).verdict === 'convicted' ? 'reprimand' : C(st).verdict), { merit: 6, cons: -8, lp: 2 }), go: 'c13_end' });
        if (c12(s).report !== 'truth') l.push({ t: 'Give them Commandant Dorn’s key.', tag: 'RISK', tagCls: 'risk', fx: (st) => ((C(st).deal = 'dorn'), (C(st).verdict = C(st).verdict === 'convicted' ? 'reprimand' : C(st).verdict), { merit: 4, cons: -1, susp: 3 }), go: 'c13_end' });
        l.push({ t: 'Say nothing. Take what the Court has given.', fx: (st) => ((C(st).deal = 'silent'), { cons: 3 }), go: 'c13_end' });
        l.push({ t: 'Take all of it on yourself: “I acted alone.”', tag: 'MERCY', tagCls: 'mercy', fx: (st) => ((C(st).deal = 'alone'), { cons: 6, res: 3, lp: -3 }), go: 'c13_end' });
        return l;
      },
    },
    c13_end: {
      checkpoint: true,
      title: 'End of Chapter Thirteen',
      enter: (s) => {
        const c = C(s);
        c.done = true;
        if (c.endDay === undefined) c.endDay = s.day;
        c.outcome = c.verdict;
      },
      text: (s) => [
        { acquitted: 'You walk out of the Court into a corridor that is exactly as long as it was. Nobody speaks to you. Several people look.', reprimand: 'A note on the file. The corridor is the same corridor. It feels longer.', convicted: 'They do not take your armband. They take the thing that was holding it on.' }[C(s).verdict],
        `@doc ${G.desig(s)}\nDIVISION: ${s.div}\nRANK: ${G.RANK_NAMES[s.rank].toUpperCase()}\nVERDICT: ${C(s).verdict.toUpperCase()}\nDAYS IN SERVICE: ${s.day}`,
        '@sys CHAPTER THIRTEEN COMPLETE. The road to City 17 is open. Somebody on it is waiting.',
      ],
      choices: [{ t: 'Return to duty.', go: 'u_duty_end' }],
    },
  });

  G.addCodex({
    tribunal: {
      title: 'The Court of the Nexus',
      body: '<p>JURY sits in the old courthouse hall behind the Nexus forecourt. A unit is brought before the Court with the charges read once and without a defender. It may bring what it has: its service record, its case files, its reports. The Court weighs them against the testimony of witnesses, and the Court does not like to be told it is wrong. Witnesses speak in statements. Statements can be pressed, and statements can be contradicted.</p>',
    },
    dfinding: {
      title: 'Direction finding',
      body: '<p>A transmitter can be found by listening from three places. At each post the operator turns the dial until the signal peaks and locks a bearing; three bearings make a triangle, and the transmitter is in it. Signals arrive in bursts and the noise moves, so an operator who knows the band is faster than one who does not.</p>',
    },
  });
  G.CODEX_GROUPS.find((g) => g.title === 'Procedure').ids.push('tribunal', 'dfinding');
})();
