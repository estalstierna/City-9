/* STOP & SEARCH — procedural citizen encounters with verdicts and persistent case files */
(function () {
  const END = 'u_duty_end';
  const LEVEL_POINTS = { 1: 0, 2: 2, 3: 3, 4: 5, 5: 7, 6: 12, 7: 99 };
  const GRADE_LEVEL = { green: 2, yellow: 4, red: 5, black: 7 };

  const TYPES = [
    { id: 'standard', w: 55, label: 'Citizen', prior: [0, 6] },
    { id: 'watch', w: 15, label: 'Citizen — under observation (OBS)', prior: [7, 15] },
    { id: 'cwu', w: 18, label: 'CWU worker', prior: [0, 3] },
    { id: 'commended', w: 12, label: 'Commended citizen', prior: [0, 0] },
  ];

  const LOOKS = [
    'a man in his fifties with a grey stubbled jaw and a cough he tries to swallow',
    'a woman of about thirty, hair tied back with wire, eyes fixed on your boots',
    'a thin young man with ink-stained fingers and a jacket two sizes too big',
    'an old woman carrying a string bag, moving as if every step costs her',
    'a broad mill worker with blue dye up to the elbows',
    'a girl of perhaps nineteen who keeps smoothing the front of her jacket',
    'a man with a bandaged hand and a face that has been hit before',
    'a middle-aged woman with a clipboard and the brisk walk of someone with somewhere to be',
    'a quiet man whose eyes keep going to the alley behind you',
    'a heavy man who smiles too much and talks before you ask',
  ];

  const ITEMS = [
    { id: 'spray', name: 'a can of blue spray paint', grade: 'green', w: 6 },
    { id: 'tobacco', name: 'a twist of unregistered tobacco', grade: 'green', w: 8 },
    { id: 'vodka', name: 'a flat bottle of pre-war vodka', grade: 'green', w: 5 },
    { id: 'ration', name: 'a priority-tier ration bar', grade: 'green', w: 6, cat: 'food' },
    { id: 'gel', name: 'a single vial of biogel', grade: 'green', w: 4, cat: 'med' },
    { id: 'pills', name: 'a twist of paper with antidepressant pills', grade: 'yellow', w: 4, cat: 'med' },
    { id: 'card', name: 'a forged access card', grade: 'yellow', w: 4 },
    { id: 'zip', name: 'a bundle of zip-ties', grade: 'yellow', w: 3 },
    { id: 'receiver', name: 'a gutted radio receiver', grade: 'yellow', w: 3 },
    { id: 'knife', name: 'a kitchen knife ground to a point', grade: 'red', w: 3 },
    { id: 'rounds', name: 'a paper twist of 9mm rounds', grade: 'red', w: 2 },
    { id: 'leaflets', name: 'a bundle of lambda leaflets', grade: 'red', w: 3, give: 'leaflet' },
    { id: 'radio', name: 'a handheld transmitter', grade: 'red', w: 2 },
    { id: 'pistol', name: 'a pistol wrapped in oilcloth', grade: 'black', w: 1 },
  ];

  const BEHAVIOUR = [
    { name: 'Running', lvl: 1, text: 'They were running when you called out. They stopped at once.' },
    { name: 'Loitering', lvl: 1, text: 'They had been standing in the same doorway for twenty minutes.' },
    { name: 'Yelling', lvl: 1, text: 'They were shouting at someone across the street when you arrived.' },
    { name: 'Fleeing from an officer', lvl: 3, text: 'They ran when they saw your mask. Rook caught them at the corner.' },
  ];

  const STORIES = [
    'I was only going to my sister’s. She has a fever. Please.',
    'Shift change at the Works. I’m late already, they’ll dock me.',
    'I don’t have anything. I swear on my ration card.',
    'Ask the block warden. He knows me. Everybody knows me.',
    'I have papers for everything. Everything. Look.',
    'I’m CWU — I’m allowed to be out. Check the stripe.',
    'I’ve done nothing. I never do anything. That’s the point of me.',
  ];

  const wpick = (arr) => {
    const total = arr.reduce((n, x) => n + x.w, 0);
    let r = Math.random() * total;
    for (const x of arr) if ((r -= x.w) < 0) return x;
    return arr[0];
  };
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  function makeCitizen(s) {
    s.files = s.files || {};
    const known = Object.values(s.files).filter((f) => !f.amputated);
    if (known.length && Math.random() < 0.3) {
      const f = G.pick(known);
      return newEncounter(s, f.type, f.cid, f.desc, f.points);
    }
    const t = wpick(TYPES);
    return newEncounter(s, t.id, String(rint(10000, 99999)), G.pick(LOOKS), rint(t.prior[0], t.prior[1]));
  }

  function newEncounter(s, type, cid, desc, points) {
    const items = [];
    let n = Math.random() < 0.35 ? 0 : Math.random() < 0.7 ? 1 : 2;
    if (type === 'commended') n = Math.min(n, 1);
    for (let i = 0; i < n; i++) {
      const it = wpick(ITEMS.filter((x) => (type === 'commended' ? x.grade === 'green' : true)));
      if (items.find((x) => x.id === it.id)) continue;
      items.push({ ...it, hidden: Math.random() < 0.5, found: false, exempt: type === 'cwu' && (it.cat === 'food' || it.cat === 'med') });
    }
    const obs = Math.random() < 0.4 ? G.pick(BEHAVIOUR) : null;
    return {
      cid,
      type,
      desc,
      points,
      items,
      obs,
      story: type === 'cwu' ? STORIES[5] : G.pick(STORIES.filter((x, i) => i !== 5)),
      liar: items.some((x) => x.hidden),
      bribe: type !== 'commended' && items.some((x) => GRADE_LEVEL[x.grade] >= 4) && Math.random() < 0.5 ? rint(6, 14) : 0,
      did: {},
      record: !!(s.files && s.files[cid]),
    };
  }

  const E = (s) => s.ss;
  const typeLabel = (t) => TYPES.find((x) => x.id === t).label;
  const foundItems = (c) => c.items.filter((x) => x.found);
  const chargeable = (c) => {
    const list = [];
    if (c.obs) list.push({ name: c.obs.name, lvl: c.obs.lvl });
    foundItems(c)
      .filter((x) => !x.exempt)
      .forEach((x) => list.push({ name: `Possession of ${x.grade.toUpperCase()} contraband (${x.name.replace(/^an? /, '')})`, lvl: GRADE_LEVEL[x.grade] }));
    return list;
  };
  const pointsFor = (charges) => charges.reduce((n, c) => n + LEVEL_POINTS[c.lvl], 0);

  function fileCitizen(s, c, add, status) {
    s.files = s.files || {};
    const f = s.files[c.cid] || { cid: c.cid, type: c.type, desc: c.desc, points: c.points, stops: 0 };
    f.points = Math.min(99, c.points + add);
    f.stops = (f.stops || 0) + 1;
    f.last = s.day;
    f.lastVerdict = status;
    if (status === 'AMPUTATED') f.amputated = true;
    s.files[c.cid] = f;
    s.stats = s.stats || { stops: 0 };
    s.stats.stops++;
  }
  G.fileCitizen = fileCitizen;

  function summary(c) {
    const lines = [];
    lines.push(`@doc CID ${c.cid}\nCLASS: ${typeLabel(c.type).toUpperCase()}${c.did.id ? `\nPENALTY POINTS ON FILE: ${c.points} / 20` : '\nPENALTY POINTS: — (not yet checked)'}${c.record ? '\nPRIOR STOPS: on record' : ''}`);
    if (c.obs) lines.push(`@sys OBSERVED: ${c.obs.name} (Level ${c.obs.lvl}).`);
    const f = foundItems(c);
    if (f.length) lines.push('@sys FOUND: ' + f.map((x) => `${x.name} — ${x.grade.toUpperCase()}${x.exempt ? ' (CWU exempt)' : ''}`).join('; ') + '.');
    else if (c.did.search) lines.push('@sys FOUND: nothing.');
    return lines;
  }

  G.addScenes({
    ss_start: {
      title: 'Stop & search',
      enter: (s) => {
        s.ss = makeCitizen(s);
        G.unlock(s, 'stopsearch');
      },
      text: (s) => {
        const c = E(s);
        return [
          c.record
            ? `You know this one. CID ${c.cid} — ${c.desc}. Your lenses chime softly: the file is already open.`
            : `You stop ${c.desc}. The jacket says *${typeLabel(c.type)}*.`,
          c.obs ? c.obs.text : 'Nothing about them stands out. That is never a reason not to look.',
          '@say You|Civil Protection. Stand still. Hands where I can see them.',
          ...summary(c),
        ];
      },
      choices: (s, g) => G.scenes.ss_hub.choices(s, g),
    },

    ss_hub: {
      text: (s) => [...summary(E(s)), '@sys What next?'],
      choices: (s) => {
        const c = E(s);
        return [
          { t: 'Scan their CID and pull the file.', if: () => !c.did.id, check: { skill: 'comms', diff: -20, pass: 'ss_id', fail: 'ss_id_slow' } },
          { t: 'Search them — pockets, lining, boots.', if: () => !c.did.search, check: { skill: 'perception', diff: 0, pass: 'ss_search_ok', fail: 'ss_search_bad' } },
          { t: 'Question them. Where are they going, and why?', if: () => !c.did.q, check: { skill: 'authority', diff: 0, pass: 'ss_q_ok', fail: 'ss_q_bad' } },
          { t: '**Pass verdict.**', tag: 'VERDICT', tagCls: 'duty', if: () => c.did.id || c.did.search || c.did.q, go: 'ss_verdict' },
        ];
      },
    },

    ss_id: {
      enter: (s) => {
        E(s).did.id = true;
      },
      text: (s) => {
        const c = E(s);
        return [
          'The scanner chirps green. The file scrolls across the inside of your lens.',
          c.points >= 15 ? `**${c.points} penalty points.** Five more and this file stops being a file.` : c.points >= 8 ? `${c.points} penalty points. A pattern.` : c.points ? `${c.points} penalty points. Minor.` : 'Clean file. Not one point.',
          c.type === 'cwu' ? 'CWU registration valid. Food and medical contraband rules do not apply.' : c.type === 'commended' ? 'A gold commendation flag. Priority allocation. Someone upstairs likes this citizen.' : c.type === 'watch' ? 'An amber OBS flag. Under observation. Report irregularities.' : null,
        ];
      },
      choices: () => [{ t: 'Continue.', go: 'ss_hub' }],
    },

    ss_id_slow: {
      enter: (s) => {
        E(s).did.id = true;
      },
      text: (s) => ['The scanner struggles with the label — rain, grime, a creased barcode. On the third pass it reads.', `${E(s).points} penalty points on file.`],
      choices: () => [{ t: 'Continue.', go: 'ss_hub' }],
    },

    ss_search_ok: {
      enter: (s) => {
        const c = E(s);
        c.did.search = true;
        c.items.forEach((x) => (x.found = true));
      },
      text: (s) => {
        const c = E(s);
        const f = foundItems(c);
        return f.length
          ? ['You pat down the jacket, turn out the pockets, run your gloved fingers along the seams and inside the boots.', ...f.map((x) => `You find **${x.name}**${x.hidden ? ', sewn into the lining' : ''}.`)]
          : ['You search them thoroughly. Lint. A ration card. A button. Nothing else.', 'They let out a breath they did not know they were holding.'];
      },
      choices: () => [{ t: 'Continue.', go: 'ss_hub' }],
    },

    ss_search_bad: {
      enter: (s) => {
        const c = E(s);
        c.did.search = true;
        c.items.forEach((x) => (x.found = !x.hidden));
      },
      text: (s) => {
        const f = foundItems(E(s));
        return f.length
          ? ['You search them quickly. Too quickly.', ...f.map((x) => `In a pocket: **${x.name}**.`), 'If there is more, it is somewhere you did not look.']
          : ['You pat them down. Nothing obvious. They are very still while you do it.'];
      },
      choices: () => [{ t: 'Continue.', go: 'ss_hub' }],
    },

    ss_q_ok: {
      enter: (s) => {
        const c = E(s);
        c.did.q = true;
        const h = c.items.find((x) => x.hidden && !x.found);
        if (h && Math.random() < 0.6) {
          h.found = true;
          c.confessed = h.name;
        }
      },
      text: (s) => {
        const c = E(s);
        return [
          `@say Citizen|${c.story}`,
          c.confessed ? `You let the silence do the work. It cracks them. *"In my — in my boot. It isn't mine. It's ${c.confessed}. Please."*` : c.liar ? 'You can hear the lie in it. You cannot yet see where it is.' : 'It sounds true. Most of the time, it is.',
          c.bribe ? `Then, very quietly, almost without moving their lips: *"${c.bribe} tokens. If you forget you stopped me."*` : null,
        ];
      },
      choices: () => [{ t: 'Continue.', go: 'ss_hub' }],
    },

    ss_q_bad: {
      enter: (s) => {
        E(s).did.q = true;
      },
      text: (s) => [`@say Citizen|${E(s).story}`, 'They look at your lenses, not at you. You can’t read anything in it. Maybe there is nothing to read.'],
      choices: () => [{ t: 'Continue.', go: 'ss_hub' }],
    },

    ss_verdict: {
      title: 'Verdict',
      text: (s) => {
        const c = E(s);
        const ch = chargeable(c);
        const total = c.points + pointsFor(ch);
        const black = ch.some((x) => x.lvl >= 7);
        return [
          ...summary(c),
          ch.length ? '@sys Chargeable violations: ' + ch.map((x) => `${x.name} (L${x.lvl}, ${x.lvl >= 7 ? 'amputation' : LEVEL_POINTS[x.lvl] + ' pts'})`).join(' · ') : '@sys No chargeable violation found.',
          foundItems(c).some((x) => x.exempt) ? '@sys CWU exemption applies to food and medical items. Charging them would be an unjustified verdict.' : null,
          black || total >= 20 ? `@law A full verdict brings this file to ${black ? 'LEVEL 7' : total + ' penalty points'}. **The citizen will be amputated.**` : null,
        ];
      },
      choices: (s) => {
        const c = E(s);
        const ch = chargeable(c);
        const total = c.points + pointsFor(ch);
        const lethal = ch.some((x) => x.lvl >= 7) || total >= 20;
        const top = ch.reduce((m, x) => (x.lvl > m.lvl ? x : m), { lvl: 0 });
        const opts = [];
        if (ch.length)
          opts.push({
            t: lethal ? '**Full verdict. Administer.** The file turns red.' : `**Full verdict:** all violations, +${pointsFor(ch)} points.`,
            tag: lethal ? 'AMPUTATE' : 'BY THE BOOK',
            tagCls: lethal ? 'risk' : 'loyal',
            fx: (st) => ((st.ss.result = lethal ? 'amputate' : 'full'), null),
            go: 'ss_result',
          });
        if (ch.length > 1 && !(top.lvl >= 7) && c.points + LEVEL_POINTS[top.lvl] < 20)
          opts.push({ t: `Charge the most serious only: ${top.name} (+${LEVEL_POINTS[top.lvl]}).`, fx: (st) => ((st.ss.result = 'top'), null), go: 'ss_result' });
        if (lethal)
          opts.push({
            t: 'Downgrade the charge in the log so the file stays under twenty.',
            tag: 'FALSIFY',
            tagCls: 'mercy',
            check: { skill: 'deception', diff: 10, pass: 'ss_falsify_ok', fail: 'ss_falsify_bad' },
          });
        opts.push({ t: ch.length ? 'Confiscate what you found. Warning only. No points.' : 'Release them with a warning.', tag: ch.length ? 'LENIENT' : '', tagCls: 'mercy', fx: (st) => ((st.ss.result = 'warn'), null), go: 'ss_result' });
        if (c.bribe && foundItems(c).length) opts.push({ t: `Take the ${c.bribe} tokens and forget you stopped them.`, tag: 'BRIBE', tagCls: 'risk', fx: (st) => ((st.ss.result = 'bribe'), null), go: 'ss_result' });
        return opts;
      },
    },

    ss_falsify_ok: {
      enter: (s) => {
        s.ss.result = 'falsified';
      },
      text: ['You key the violations in one level lower, one by one, in the dull rhythm of a unit doing paperwork. The total stops at nineteen.', 'The citizen will never know how close it was.'],
      choices: () => [{ t: 'Continue.', go: 'ss_result' }],
    },
    ss_falsify_bad: {
      enter: (s) => {
        s.ss.result = 'falsify_caught';
      },
      text: ['You start to key in a lower level. The slate flags it before you finish: **EVIDENCE GRADE MISMATCH — FORWARDED TO JURY.**', 'The verdict goes through at full weight anyway. Now there is a second file being updated, and it has your designation on it.'],
      choices: () => [{ t: 'Continue.', go: 'ss_result' }],
    },

    ss_result: {
      enter: (s) => {
        const c = s.ss;
        const ch = chargeable(c);
        const top = ch.reduce((m, x) => (x.lvl > m.lvl ? x : m), { lvl: 0, name: '' });
        const r = c.result;
        let add = 0;
        let status = 'WARNING';
        const fx = {};
        const redFound = foundItems(c).some((x) => GRADE_LEVEL[x.grade] >= 5 && !x.exempt);
        if (r === 'full' || r === 'falsify_caught' || r === 'amputate') {
          add = pointsFor(ch);
          status = r === 'amputate' || r === 'falsify_caught' && (ch.some((x) => x.lvl >= 7) || c.points + add >= 20) ? 'AMPUTATED' : `+${add} PTS`;
          Object.assign(fx, { merit: 2 + Math.ceil(top.lvl / 2), lp: 1 + (top.lvl >= 5 ? 2 : 0), cons: -(top.lvl >= 5 ? 4 : 1) });
          if (status === 'AMPUTATED') Object.assign(fx, { merit: 6, lp: 4, cons: -12 });
          if (r === 'falsify_caught') Object.assign(fx, { susp: 10 });
        } else if (r === 'top') {
          add = LEVEL_POINTS[top.lvl];
          status = `+${add} PTS`;
          Object.assign(fx, { merit: 2, cons: 1 });
        } else if (r === 'falsified') {
          add = Math.max(0, 19 - c.points);
          status = `+${add} PTS (reduced)`;
          Object.assign(fx, { merit: 1, cons: 6, res: 3, susp: 3 });
        } else if (r === 'warn') {
          status = ch.length ? 'WARNING (confiscated)' : 'RELEASED';
          Object.assign(fx, ch.length ? { cons: 3, merit: redFound ? -1 : 0, susp: redFound ? 4 : 0, lp: redFound ? -2 : 0 } : { merit: 1 });
        } else if (r === 'bribe') {
          status = 'NO RECORD';
          Object.assign(fx, { tokens: c.bribe, susp: 5, cons: -3 });
        }
        if (r === 'full' || r === 'top' || r === 'warn') {
          const lf = foundItems(c).find((x) => x.give);
          if (lf && Math.random() < 0.5) fx.give = lf.give;
        }
        c.add = add;
        c.status = status;
        fileCitizen(s, c, add, status);
        G.fx(s, fx);
      },
      text: (s) => {
        const c = s.ss;
        const r = c.result;
        const f = s.files[c.cid];
        const lines = [];
        if (c.status === 'AMPUTATED') {
          lines.push(
            'You key the verdict in. The slate thinks about it for exactly one second. Then the citizen’s label, the one on their chest, turns from white to red under your scanner light.',
            'They understand before you say anything. Most of them do.',
            '@radio Dispatch, 10-15. Request 10-91 for an amputation verdict, my 10-20.',
            'The van comes in four minutes. You do not watch it leave.'
          );
        } else if (r === 'full' || r === 'top' || r === 'falsified' || r === 'falsify_caught') {
          lines.push(`You log the verdict. **CID ${c.cid}: ${f.points} / 20.**`, f.points >= 15 ? 'They look at the number on your slate the way people look at the edge of a roof.' : 'They take the receipt slip with both hands, as though it were something valuable.');
        } else if (r === 'warn') {
          lines.push(foundItems(c).length ? 'You take what you found, drop it in the confiscation pouch, and tell them to go. They go — fast, before you can change your mind.' : 'You tell them to move along. They do, without looking back.');
          if (foundItems(c).some((x) => GRADE_LEVEL[x.grade] >= 5 && !x.exempt)) lines.push('Rook watches the citizen disappear into the crowd. *"RED contraband and a warning. Your call, five. It’s also your file."*');
        } else if (r === 'bribe') {
          lines.push(`The tokens pass from their glove to yours in a handshake that isn’t one. ${c.bribe} tokens. You did not stop anyone today.`);
        }
        lines.push(`@doc CASE FILE CID ${c.cid} — ${c.status}\nPENALTY POINTS: ${Math.min(f.points, 20)} / 20 · STOPS: ${f.stops}`);
        return lines;
      },
      choices: () => [{ t: 'End of shift.', go: END }],
    },
  });

  G.addCodex({
    stopsearch: {
      title: 'Stop & search procedure',
      body: `<p>Any unit may stop any citizen at any time. Procedure, in any order:</p>
      <table>
        <tr><td>SCAN</td><td>Read the CID label. The file shows class (standard, OBS, CWU, commended) and penalty points on record.</td></tr>
        <tr><td>SEARCH</td><td>Pockets, lining, boots. A careless search finds only what is in plain sight.</td></tr>
        <tr><td>INQUIRE</td><td>Question the subject. Pressure sometimes produces a confession — and sometimes an offer.</td></tr>
        <tr><td>VERDICT</td><td>Charge every violation found, the most serious only, or release with a warning. Points are permanent. <b>At 20 points, or on any Level 7 violation, the verdict is amputation.</b></td></tr>
      </table>
      <p>CWU members are exempt from food and medical contraband rules. Charging them for it is an unjustified verdict. Every stop is filed under your designation; your case files are listed in your dossier.</p>`,
    },
  });
})();
