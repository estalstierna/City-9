/* CHECKPOINT DUTY — a standing duty that is always on the board. You man the booth at a checkpoint; a
   queue of citizens comes to the window, one at a time, and the shift has a budget of minutes.
   For each one you can read the ID CARD, run a LOOKUP on the terminal (the same as typing
   `query <cid>` on the CCA terminal), ASK three questions (purpose, home, work) and compare the answers
   with the card and the record, FRISK them and SEARCH THEIR BAG; then you decide: PASS, TURN BACK with a
   warning (confiscate), or DETAIN. Behind every citizen there is a truth: clear, bad papers (expired, forged,
   a face that is not theirs), contraband, or wanted. Detaining the innocent costs conscience;
   passing the guilty costs merit and draws attention; the queue does not wait.
   Scenes: cp_start → cp_shift (minigame) → cp_end. Minigame: G.MINIGAMES.checkpoint. */
(function () {
  G.MINIGAMES = G.MINIGAMES || {};
  const pick = G.pick;
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const WORK = ['the ration plant', 'the weaving halls', 'the rail yards', 'the canal gate crew', 'the dye floor', 'the Nexus kitchens', 'a Bazaar loading gang'];
  const PURPOSE = ['To my sister’s, past the canal.', 'The ration queue at Plaza 5.', 'Shift change. I am late.', 'Fetching medicine for a neighbour.', 'Home. I live just there.', 'The clinic, for my knee.'];
  const EVASIVE = ['Just walking. Is that against something?', 'Visiting. A friend. You would not know him.', 'Nothing. Nowhere. The usual.'];
  const blocks = () => Object.keys(G.BLOCKS || {}).filter((k) => G.BLOCKS[k].name);
  const bname = (k) => (G.BLOCKS[k] ? G.BLOCKS[k].name : k);

  /* the four painted cards (assets/img/idcard-*.jpg), with the boxes measured on each: coordinates on the 1536 × 1024 picture */
  const CARDS = {
    standard: { src: 'assets/img/idcard-standard.webp', photo: [62, 178, 463, 716], f: [[962, 173, 1483, 293], [962, 319, 1483, 441], [962, 466, 1483, 586], [962, 611, 1483, 730]], strip: [291, 763, 1484, 892] },
    cwu: { src: 'assets/img/idcard-cwu.webp', photo: [69, 179, 466, 714], f: [[961, 174, 1480, 295], [961, 320, 1480, 441], [961, 467, 1480, 584], [961, 609, 1481, 727]], strip: [298, 759, 1481, 889] },
    commended: { src: 'assets/img/idcard-commended.webp', photo: [60, 178, 461, 711], f: [[952, 174, 1478, 295], [953, 321, 1478, 442], [952, 466, 1478, 585], [952, 610, 1478, 728]], strip: [290, 761, 1478, 890] },
    watch: { src: 'assets/img/idcard-watch.webp', photo: [76, 188, 470, 710], f: [[955, 186, 1468, 306], [954, 330, 1468, 447], [955, 471, 1468, 586], [955, 611, 1468, 725]], strip: [305, 757, 1468, 882] },
  };
  const make = (s) => {
    const c = G.makeCitizen(s);
    const r = Math.random();
    const harder = Math.min(0.1, (s.day || 0) / 2500);
    const kind = r < 0.06 + harder ? 'wanted' : r < 0.22 + harder ? 'papers' : r < 0.42 + harder ? 'contra' : 'clear';
    const home = pick(blocks());
    const work = c.type === 'cwu' ? 'the CWU depot' : pick(WORK);
    c.kind = kind;
    c.home = home;
    c.work = work;
    c.rec = { status: kind === 'wanted' ? 'WANTED' : c.type === 'watch' ? 'WATCH' : 'ACTIVE', home, work, ration: pick(['Tier 1', 'Tier 2', 'Tier 3']), photo: c.face };
    c.card = { cid: c.cid, face: c.face, home, work, issued: Math.max(1, s.day - rint(40, 400)), expires: s.day + rint(20, 300) };
    c.items = kind === 'contra' ? (c.items.length ? c.items : [{ ...pick(G.ssItems.filter((x) => x.grade !== 'black')), hidden: false, found: false }]) : [];
    c.items.forEach((it) => (it.hidden = Math.random() < 0.55));
    if (kind === 'papers') {
      c.paper = pick(['expired', 'forged', 'photo']);
      if (c.paper === 'expired') c.card.expires = s.day - rint(1, 30);
      if (c.paper === 'forged') c.rec = null;
      if (c.paper === 'photo') c.card.face = (c.face + rint(1, Math.max(1, G.DOC_FACES.length - 1))) % G.DOC_FACES.length;
    }
    c.liar = kind === 'wanted' || c.paper === 'forged' || (kind === 'contra' && c.items.some((x) => x.hidden));
    c.did = {};
    c.patience = 9;
    c.said = {};
    return c;
  };
  const answer = (c, q) => {
    const bad = (alt) => ({ text: alt, tell: true });
    if (q === 'purpose') return c.liar && c.kind !== 'wanted' ? bad(pick(EVASIVE) + ' (their eyes go to the bag)') : c.liar ? bad(pick(EVASIVE)) : { text: pick(PURPOSE) };
    const other = pick(blocks().filter((b) => b !== c.home));
    if (q === 'home') return c.kind === 'wanted' || c.paper === 'forged' ? bad(`${bname(other)}. (A beat too fast.)`) : { text: `${bname(c.home)}.` };
    return c.kind === 'wanted' ? bad(`${pick(WORK.filter((w) => w !== c.work))}. (They look at the wall.)`) : { text: `${c.work[0].toUpperCase()}${c.work.slice(1)}.` };
  };
  const lookup = (c, s) => {
    if (!c.rec) return [`CID ${c.cid}`, 'NO RECORD OF THIS CID IN THE REGISTRY.', 'CARD CHIP: NOT ISSUED BY THIS CITY.'];
    const l = [`CID ${c.cid}`, `STATUS   ${c.rec.status}${c.rec.status === 'WANTED' ? ' — DETAIN, CALL JURY' : ''}`, `HOME     ${bname(c.rec.home)}`, `WORK     ${c.rec.work}`, `RATION   ${c.rec.ration}`, `POINTS   ${c.points} / 20`];
    if (c.paper === 'expired') l.push(`CARD     EXPIRED (day ${c.card.expires})`);
    if (s.files && s.files[c.cid]) l.push('PRIOR    stopped by this unit');
    return l;
  };

  G.MINIGAMES.checkpoint = (block, opts, done) => {
    const S = G.state();
    const total = opts.count || 10;
    let ticks = opts.ticks || 34;
    const st = { processed: 0, correct: 0, missed: 0, harsh: 0, mercy: 0, left: 0, merit: 0, cons: 0, susp: 0, tokens: 0 };
    let queue = total, cur = null, over = false;
    const root = document.createElement('div');
    root.className = 'mini cp';
    root.innerHTML = `<div class="cr-head"><span class="cr-title">${opts.title || 'Checkpoint'}</span><span class="cr-clock"></span></div>
      <div class="cp-grid"><div class="cp-person"><div class="cp-face"></div><div class="cp-say"></div></div>
      <div class="cp-desk"><div class="cp-card"></div><pre class="cp-screen"></pre></div></div>
      <div class="cp-actions"></div><div class="cp-verdict"></div><div class="m3-log"></div>
      <div class="cr-help">Read the card, look the number up, ask, frisk: whatever you can afford in minutes. Then decide. Compare the answers with the card and the record.</div>`;
    block.append(root);
    const $ = (q) => root.querySelector(q);
    const log = (t) => ($('.m3-log').textContent = t);
    const clock = () => ($('.cr-clock').textContent = `${ticks} min · queue ${queue + (cur ? 1 : 0)}`);
    const spend = (n) => {
      ticks -= n;
      if (cur) cur.patience -= n;
      clock();
    };
    const face = (i) => (G.DOC_FACES && G.DOC_FACES[i] ? `<img src="${G.DOC_FACES[i].img}" alt="">` : '');
    const pc = (x, y, x2, y2) => `left:${(x / 15.36).toFixed(2)}%;top:${(y / 10.24).toFixed(2)}%;width:${((x2 - x) / 15.36).toFixed(2)}%;height:${((y2 - y) / 10.24).toFixed(2)}%`;
    const cardHtml = (c) => {
      const k = CARDS[c.type === 'cwu' ? 'cwu' : c.type === 'commended' ? 'commended' : c.type === 'watch' ? 'watch' : 'standard'];
      const vals = [['CID', c.card.cid], ['HOME', bname(c.card.home)], ['WORK', c.card.work], ['ISSUED', `day ${c.card.issued}`]];
      const fld = vals.map(([l, v], i) => `<div class="cid-f" style="${pc(...k.f[i])}"><b>${l}</b><span class="${String(v).length > 14 ? 'long' : ''}">${v}</span></div>`).join('');
      return `<div class="cp-idc" style="background-image:url('${k.src}')"><div class="cid-ph" style="${pc(...k.photo)}">${c.card.face !== undefined && G.DOC_FACES[c.card.face] ? `<img src="${G.DOC_FACES[c.card.face].img}" alt="">` : ''}</div>${fld}<div class="cid-s" style="${pc(...k.strip)}"><b>VALID TO</b><span>day ${c.card.expires}</span><i>C9&lt;&lt;${c.card.cid}&lt;&lt;${String(c.card.home).toUpperCase().slice(0, 6)}&lt;${String(c.card.issued).padStart(4, '0')}&lt;${String(c.card.expires).padStart(4, '0')}</i></div></div>`;
    };
    const sayLine = (who, t) => {
      const d = document.createElement('div');
      d.innerHTML = who ? `<b>${who}</b> ${t}` : t;
      $('.cp-say').append(d);
      $('.cp-say').scrollTop = 1e6;
    };
    const mood = () => (cur.patience <= 1 ? 'furious' : cur.patience <= 3 ? 'restless' : 'waiting');
    const draw = () => {
      if (!cur) return;
      $('.cp-face').innerHTML = face(cur.face) + `<small>${mood()}</small>`;
      $('.cp-card').innerHTML = cardHtml(cur);
      const acts = [
        ['lookup', 'LOOKUP', 2, 'run the CID on the terminal'],
        ['purpose', 'ASK: where to?', 1],
        ['home', 'ASK: where do you live?', 1],
        ['work', 'ASK: where do you work?', 1],
        ['frisk', 'FRISK', 2, 'pat them down'],
        ['bag', 'SEARCH BAG', 1],
      ];
      $('.cp-actions').innerHTML = acts.map(([k, t, n, h]) => `<button type="button" data-a="${k}" ${cur.did[k] || over ? 'disabled' : ''} title="${h || ''}">${t} <i>${n}m</i></button>`).join('');
      $('.cp-verdict').innerHTML = `<button type="button" data-v="pass" class="ok">PASS</button><button type="button" data-v="warn" class="mid">TURN BACK · WARN</button><button type="button" data-v="detain" class="bad">DETAIN</button>`;
    };
    const next = () => {
      if (over) return;
      if (queue <= 0 || ticks <= 0) return finish();
      queue--;
      cur = make(S);
      G.cp.cur = cur;
      $('.cp-say').innerHTML = '';
      $('.cp-screen').textContent = '';
      sayLine('', `<i>${cur.desc[0].toUpperCase()}${cur.desc.slice(1)} steps up to the window and puts a card on the counter.</i>`);
      spend(1);
      draw();
    };
    const doLookup = () => {
      cur.did.lookup = true;
      const l = lookup(cur, S);
      $('.cp-screen').textContent = 'CCA> query ' + cur.cid + '\n' + l.join('\n');
      if (cur.rec && cur.paper === 'photo') $('.cp-screen').textContent += '\nPHOTO ON FILE: see below';
      spend(2);
      draw();
      return l;
    };
    G.cp = { cur: null, lookup: () => (cur && !over ? (cur.did.lookup ? lookup(cur, S) : doLookup()) : ['NO CITIZEN AT THE WINDOW.']) };
    const act = (k) => {
      if (!cur || cur.did[k] || over) return;
      if (k === 'lookup') return doLookup();
      cur.did[k] = true;
      if (k === 'purpose' || k === 'home' || k === 'work') {
        const a = answer(cur, k);
        sayLine('You:', { purpose: 'Where are you going?', home: 'Where do you live?', work: 'Where do you work?' }[k]);
        sayLine('Them:', a.text);
        spend(1);
      } else if (k === 'frisk') {
        const f = cur.items.filter((x) => x.hidden && !x.found);
        f.forEach((x) => (x.found = true));
        sayLine('', f.length ? `<em>Under the jacket: ${f.map((x) => `${x.name} (${x.grade.toUpperCase()})`).join(', ')}.</em>` : '<em>Nothing. They stand rigid, and look at the wall.</em>');
        if (!f.length) cur.patience -= 1;
        spend(2);
      } else {
        const f = cur.items.filter((x) => !x.hidden && !x.found);
        f.forEach((x) => (x.found = true));
        sayLine('', f.length ? `<em>In the bag: ${f.map((x) => `${x.name} (${x.grade.toUpperCase()})`).join(', ')}.</em>` : '<em>A loaf of bread, a rag, a clean cup. Nothing.</em>');
        spend(1);
      }
      draw();
      if (cur.patience <= 0 && !cur.snapped) {
        cur.snapped = true;
        sayLine('Them:', 'I have been standing here for an hour! Let me through or arrest me.');
      }
    };
    const decide = (v) => {
      const c = cur;
      const found = c.items.filter((x) => x.found);
      const worst = found.reduce((m, x) => Math.max(m, { green: 1, yellow: 2, red: 3, black: 4 }[x.grade]), 0);
      const guilty = c.kind === 'wanted' || c.kind === 'papers' || (c.kind === 'contra' && c.items.some((x) => x.grade !== 'green'));
      const minor = c.kind === 'contra' && !guilty;
      let ok = false, text = '';
      if (v === 'pass') {
        if (c.kind === 'clear') ((ok = true), (text = 'They go through without a word.'), (st.merit += 1));
        else if (c.kind === 'wanted') ((st.missed++), (st.merit -= 5), (st.susp += 4), (text = 'You wave them through. At 17:00 a JURY bulletin names the face you saw today.'));
        else if (c.kind === 'papers') ((st.missed++), (st.merit -= 3), (st.susp += 2), (text = 'You let bad papers through. The booth supervisor logs it at the end of the shift.'));
        else if (minor) ((ok = true), (st.mercy++), (st.cons += 2), (st.merit -= 1), (text = 'A scrap of something kind, in a booth where nothing is. You do not look at the bag.'));
        else ((st.missed++), (st.merit -= 3), (st.susp += 1), (text = 'You pass them with the contraband still on them.' + (found.length ? '' : ' You never found it.')));
      } else if (v === 'warn') {
        if (c.kind === 'clear') ((st.harsh++), (st.cons -= 1), (text = 'Turned back for nothing. They stand there for a moment, then go the long way round.'));
        else if (c.kind === 'wanted') ((st.missed++), (st.merit -= 3), (st.susp += 2), (text = 'You send a wanted person away with a warning. They walk, not fast.'));
        else ((ok = true), (st.merit += 2), (text = c.kind === 'papers' ? 'Turned back to renew their papers. They take it as a mercy.' : 'Confiscated and warned. The ' + (found[0] ? found[0].name.replace(/^an? /, '') : 'bag') + ' goes in the tray.'));
      } else {
        if (c.kind === 'clear') ((st.harsh++), (st.cons -= 4), (st.merit += 0), (text = 'Detained. At the cells they ask what they did. You do not have an answer.'));
        else if (c.kind === 'wanted') ((ok = true), (st.merit += 5), (text = 'JURY takes them from the booth in four minutes. You never learn the name.'));
        else if (minor) ((st.harsh++), (st.cons -= 3), (st.merit += 1), (text = 'Detained for a vial of biogel. The paperwork has a heading for that.'));
        else ((ok = true), (st.merit += 3), (text = 'Detained and logged.'));
      }
      if (ok) st.correct++;
      st.processed++;
      if (v !== 'pass' && G.fileCitizen) G.fileCitizen(S, c, c.kind === 'clear' ? 0 : 2, v === 'detain' ? 'DETAINED' : 'WARNED');
      sayLine('', `<b>${v === 'pass' ? 'PASS' : v === 'warn' ? 'TURNED BACK' : 'DETAINED'}.</b> ${text}`);
      cur = null;
      G.cp.cur = null;
      spend(1);
      $('.cp-actions').innerHTML = '';
      $('.cp-verdict').innerHTML = '';
      log(`Processed ${st.processed} · correct ${st.correct} · missed ${st.missed} · wrongly stopped ${st.harsh}`);
      setTimeout(next, 700);
    };
    root.addEventListener('click', (e) => {
      if (over || G.state() !== S) return;
      const a = e.target.closest('[data-a]');
      const v = e.target.closest('[data-v]');
      if (a) act(a.dataset.a);
      else if (v && cur) decide(v.dataset.v);
    });
    const finish = () => {
      if (over) return;
      over = true;
      st.left = queue + (cur ? 1 : 0);
      G.cp = null;
      if (st.left) st.merit -= Math.min(4, st.left);
      const ok = st.processed >= 3 && st.correct / Math.max(1, st.processed) >= 0.6;
      root.classList.add(ok ? 'won' : 'lost');
      $('.cp-actions').innerHTML = '';
      $('.cp-verdict').innerHTML = '';
      log(`${st.processed} processed, ${st.correct} right, ${st.missed} missed, ${st.harsh} wrongly stopped${st.left ? `, ${st.left} left in the queue` : ''}.`);
      done(ok, st);
    };
    next();
  };

  G.addScenes({
    cp_start: {
      title: 'Checkpoint duty',
      enter: (s) => {
        G.unlock(s, 'checkpoint');
        s.time = 'Day';
        s.duty.current = 'checkpoint';
      },
      text: (s) => [
        '@img assets/img/env/e59-checkpoint-booth.webp|Window two, Canal Gate 3',
        `@say ${G.superiorOf ? G.superiorOf(s).name : 'Granite'}|Window two. A card, a look, a lookup if you have the minutes, a decision. The queue does not stop for you to be sure. Neither does the Union.`,
        '@sys CHECKPOINT: you have a budget of minutes for the shift. Each question, lookup and search costs some. Citizens lose patience.',
      ],
      choices: [{ t: 'Take the booth.', go: 'cp_shift' }],
    },
    cp_shift: {
      title: 'Checkpoint',
      text: ['@sys The first citizen is already at the window.'],
      mini: { type: 'checkpoint', opts: (s) => ({ count: 10, ticks: 34 }), pass: 'cp_end', fail: 'cp_end', skill: 'perception', diff: 0 },
    },
    cp_end: {
      title: 'End of shift — checkpoint',
      text: (s) => {
        const d = s.lastMini || {};
        return [`@doc CHECKPOINT REPORT\nPROCESSED: ${d.processed === undefined ? '—' : d.processed}\nCORRECT: ${d.correct === undefined ? '—' : d.correct}\nMISSED: ${d.missed === undefined ? '—' : d.missed}\nWRONGLY STOPPED: ${d.harsh === undefined ? '—' : d.harsh}`, d.missed ? '@sys A supervisor reads the sheet, and then reads it again.' : d.harsh > 2 ? '@sys Three people went to the cells today who did nothing. The supervisor says “good numbers”.' : 'The queue is gone. So is the light.'];
      },
      choices: [{ t: 'End of shift.', fx: (st) => { const d = st.lastMini || { merit: 3, correct: 4 }; return { merit: Math.max(-12, d.merit || 0) + 1, cons: d.cons || 0, susp: d.susp || 0 }; }, go: 'u_duty_end' }],
    },
  });

  G.extend('u_board', {
    choices: (list, s) => {
      if (s.phase !== 'union' || G.rankIdx(s.rank) < G.rankIdx('05')) return list;
      const mine = { t: '**Checkpoint duty.** The booth at Canal Gate 3: cards, lookups on the terminal, questions, a frisk. Always open.', tag: 'DUTY', tagCls: 'duty', fx: (st) => ((st.duty.current = 'checkpoint'), (st.time = 'Day'), null), go: 'cp_start' };
      let at = -1;
      list.forEach((c, i) => c.tag === 'PATROL' && (at = i));
      if (at < 0) at = list.findIndex((c) => c.tag === 'NEW' || c.tag === 'ROUTINE') - 1;
      list.splice(at < 0 ? list.length : at + 1, 0, mine);
      return list;
    },
  });

  G.addCodex({
    checkpoint: {
      title: 'Manning a checkpoint',
      body: '<img src="assets/img/env/e60-checkpoint-gate.webp" alt="Canal Gate 3" loading="lazy"><p>A checkpoint is a booth, a counter, a terminal and a queue. A card is only a claim: the lookup says whether the city agrees. A citizen who answers too fast, or looks at their bag, is telling you something. Time is the real shortage: every question and every search is a minute taken from the person behind them.</p><p>Wanted persons are detained and passed to JURY. Bad papers are turned back or detained. Contraband is confiscated. Innocents are passed. A unit who cannot tell the difference will learn it from the file.</p>',
    },
  });
  G.CODEX_GROUPS.find((g) => g.title === 'Procedure').ids.push('checkpoint');
})();
