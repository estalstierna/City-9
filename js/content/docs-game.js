/* DOCUMENT INSPECTION minigame — replaces the dice roll where a scene uses `mini: { type: 'docs', ... }` */
(function () {
  G.MINIGAMES = G.MINIGAMES || {};

  const SURNAMES = ['Orlova', 'Halek', 'Brodsky', 'Vey', 'Kessel', 'Marek', 'Danek', 'Sokol', 'Petrak', 'Lind', 'Havel', 'Novak', 'Ruzek', 'Frank', 'Koval', 'Zeman', 'Bartos', 'Mraz'];
  /* the twelve ID photos (assets/img/docs/faces/fNN.webp) and what an officer can see */
  const FACES = [
    { m: true, age: 'man in his thirties', look: 'short dark hair' },
    { m: true, age: 'man in his fifties', look: 'grey hair and wire glasses' },
    { m: true, age: 'young man', look: 'fair hair and a thin face' },
    { m: true, age: 'man in his forties', look: 'a shaved head and a scar across his cheek' },
    { m: true, age: 'old man', look: 'a bald head, white stubble and heavy black glasses' },
    { m: true, age: 'man in his late thirties', look: 'dark hair and a full beard' },
    { m: false, age: 'young woman', look: 'dark hair tied back' },
    { m: false, age: 'woman in her forties', look: 'grey hair in a bun and glasses' },
    { m: false, age: 'woman in her thirties', look: 'short fair hair' },
    { m: false, age: 'woman in her fifties', look: 'a grey headscarf' },
    { m: false, age: 'old woman', look: 'short white hair' },
    { m: false, age: 'young woman', look: 'a red-brown braid' },
  ].map((f, i) => ({ ...f, img: `assets/img/docs/faces/f${String(i + 1).padStart(2, '0')}.webp` }));
  /* twelve CWU members (assets/img/docs/faces-cwu/cNN.webp), indices 12–23 */
  FACES.push(
    ...[
      { m: true, age: 'man in his forties', look: 'short brown hair and a broad face' },
      { m: true, age: 'man in his fifties', look: 'a grey crew cut and a thick moustache' },
      { m: true, age: 'young man', look: 'dark curly hair and stubble' },
      { m: true, age: 'old man', look: 'white swept-back hair and glasses pushed up on his forehead' },
      { m: true, age: 'man in his thirties', look: 'red hair and a red beard' },
      { m: true, age: 'heavy man in his fifties', look: 'a flat cap and a double chin' },
      { m: false, age: 'woman in her thirties', look: 'a dark ponytail and hoop earrings' },
      { m: false, age: 'woman in her fifties', look: 'a grey bob and square glasses' },
      { m: false, age: 'young woman', look: 'light brown hair under a cloth cap' },
      { m: false, age: 'woman in her forties', look: 'cropped black hair' },
      { m: false, age: 'old woman', look: 'white hair in a bun' },
      { m: false, age: 'woman in her thirties', look: 'fair braids and freckles' },
    ].map((f, i) => ({ ...f, cwu: true, img: `assets/img/docs/faces-cwu/c${String(i + 1).padStart(2, '0')}.webp` }))
  );
  /* twelve commended citizens (faces-commended/mNN, indices 24–35) and twelve canal-cell members
     (faces-rebel/rNN, indices 36–47) */
  const extra = (dir, p, kind, list) => FACES.push(...list.map((x, i) => ({ m: x[0], age: x[1], look: x[2], kind, img: `assets/img/docs/${dir}/${p}${String(i + 1).padStart(2, '0')}.webp` })));
  extra('faces-commended', 'm', 'commended', [
    [true, 'man in his forties', 'neat side-parted hair and round spectacles'], [false, 'woman in her fifties', 'silver hair in a precise bun'], [true, 'man in his thirties', 'clean-cut blond hair'], [false, 'woman in her thirties', 'a dark bob'],
    [true, 'man in his sixties', 'a white moustache'], [false, 'young woman', 'auburn hair pinned up and pearl earrings'], [true, 'heavy man in his fifties', 'a bald head and a satisfied smile'], [false, 'woman in her forties', 'rimless glasses and a warden’s whistle'],
    [true, 'young man', 'slicked-back dark hair and a foreman’s chevron pin'], [false, 'old woman', 'white curls and a brooch'], [true, 'man in his thirties', 'neatly combed red hair'], [false, 'woman in her forties', 'a long black braid'],
  ]);
  extra('faces-rebel', 'r', 'rebel', [
    [false, 'woman in her thirties', 'a faded red headscarf and a scar through one eyebrow'], [true, 'man in his fifties', 'a grey beard, a knitted cap and a key on a string'], [true, 'man in his thirties', 'a police crew cut and a scar on his neck'], [false, 'old woman', 'cracked glasses and a teal-striped scarf'],
    [true, 'young man', 'a shaved head and a bruised cheek'], [false, 'young woman', 'black hair in a knot and goggles round her neck'], [true, 'man in his forties', 'long dark hair and a gold tooth'], [false, 'woman in her forties', 'a burn scar on her jaw'],
    [true, 'old man', 'a bald head and a mark behind one ear'], [false, 'woman in her thirties', 'cropped fair hair and a black eye'], [true, 'teenage boy', 'curly hair and a missing tooth'], [false, 'woman in her fifties', 'a grey braid and wader straps'],
  ]);
  /* kind: true or 'cwu' → CWU; 'commended'; 'rebel'; anything else → ordinary citizens */
  const facePool = (kind) => {
    const k = kind === true ? 'cwu' : kind || 'citizen';
    return FACES.map((f, i) => i).filter((i) => (FACES[i].cwu ? 'cwu' : FACES[i].kind || 'citizen') === k);
  };
  G.pickFace = (kind) => pick(facePool(kind));
  G.DOC_FACES = FACES;
  G.faceDesc = (i) => `${/^[aeiou]/.test(FACES[i].age) ? 'an' : 'a'} ${FACES[i].age} with ${FACES[i].look}${FACES[i].cwu ? ' in the ochre CWU jacket' : ''}`;

  const STAMPS = [
    { shape: 'round', col: 'blue' },
    { shape: 'round', col: 'red' },
    { shape: 'hex', col: 'blue' },
    { shape: 'hex', col: 'red' },
  ];
  const STAMP_HEX = { blue: '#2f6fb5', red: '#a3262a' };

  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = G.pick;
  const mutateCid = (cid) => {
    const i = rint(0, 4);
    const d = String((+cid[i] + rint(1, 8)) % 10);
    return cid.slice(0, i) + d + cid.slice(i + 1);
  };

  /* calendar: the Union counts service cycles since the city was rebuilt */
  G.cycle = (s) => 2140 + (s.day || 0);

  /* rules for the current cycle — stable per day */
  function rulesFor(s) {
    s.mem.docRules = s.mem.docRules || {};
    if (s.mem.docRules.day !== s.day) {
      s.mem.docRules = { day: s.day, stamp: pick(STAMPS), obsBanned: Math.random() < 0.6, cwuNoPermit: Math.random() < 0.5 };
    }
    return s.mem.docRules;
  }

  /* opts.force = issue id; opts.person = { faceIdx, cwu, obs } */
  function makeCase(s, opts) {
    const R = rulesFor(s);
    const today = G.cycle(s);
    const o = (opts && opts.person) || {};
    const isCwu = o.cwu !== undefined ? o.cwu : o.faceIdx !== undefined ? !!FACES[o.faceIdx].cwu : Math.random() < 0.18;
    const faceIdx = o.faceIdx !== undefined && !!FACES[o.faceIdx].cwu === isCwu ? o.faceIdx : G.pickFace(isCwu);
    const person = { face: FACES[faceIdx], faceIdx, cwu: isCwu, obs: o.obs !== undefined ? o.obs : !isCwu && Math.random() < 0.15 };
    const cid = String(rint(10000, 99999));
    const card = { cid, name: pick(SURNAMES), district: 'D5', expires: today + rint(2, 40), photo: faceIdx, obs: person.obs, cwu: person.cwu };
    const cardOnly = !!(opts && opts.cardOnly);
    let permit = cardOnly || (person.cwu && R.cwuNoPermit) ? null : { cid, dest: 'D3', valid: today + rint(0, 3), stamp: { ...R.stamp } };
    const scan = { cid, obs: person.obs, cwu: person.cwu };

    let issue;
    if (cardOnly) {
      issue = opts.force !== undefined ? opts.force : Math.random() < 0.55 ? null : pick(['expired', 'photo', 'cid', 'obs']);
      if (issue === 'obs') {
        scan.obs = true;
        card.obs = false;
      }
      if (issue === 'cid') scan.cid = mutateCid(cid);
      if (issue === 'cid' || issue === 'obs') issue = issue + 'chip';
    } else {
      const possible = ['expired', 'cid', 'photo', 'stamp', 'dest', 'nopermit'];
      if (R.obsBanned) possible.push('obs');
      issue = opts && opts.force !== undefined ? opts.force : Math.random() < 0.38 ? null : pick(possible);
      if (person.obs && R.obsBanned) issue = issue || 'obs';
      if (!permit && ['cid', 'dest', 'nopermit', 'stamp'].includes(issue)) issue = 'expired';
    }

    switch (issue) {
      case 'expired':
        card.expires = today - rint(1, 9);
        break;
      case 'cid':
        permit.cid = mutateCid(cid);
        break;
      case 'photo': {
        const same = facePool(person.cwu).filter((i) => i !== faceIdx && FACES[i].m === person.face.m);
        card.photo = pick(same);
        break;
      }
      case 'stamp': {
        const bad = STAMPS.filter((x) => !(x.shape === R.stamp.shape && x.col === R.stamp.col));
        permit.stamp = { ...pick(bad), forged: true };
        break;
      }
      case 'dest':
        permit.dest = pick(['D1', 'D4', '404']);
        break;
      case 'nopermit':
        permit = null;
        break;
      case 'obs':
        card.obs = true;
        break;
    }
    return { person, card, permit, scan, cardOnly, issue, rules: R, today, field: fieldOf(issue) };
  }

  function fieldOf(issue) {
    return { expired: 'card.expires', cid: 'permit.cid', photo: 'card.photo', stamp: 'stamp', dest: 'permit.dest', nopermit: 'permit.missing', obs: 'card.obs', cidchip: 'card.cid', obschip: 'card.obs' }[issue] || null;
  }

  const ISSUE_TEXT = {
    expired: 'the ID card had expired',
    cid: 'the CID on the permit did not match the card',
    photo: 'the photograph was of someone else',
    stamp: 'the stamp was not today’s valid stamp',
    dest: 'the permit was for the wrong district',
    nopermit: 'there was no transit permit',
    obs: 'citizens under observation are barred today',
    cidchip: 'the printed CID did not match the chip — a forged card',
    obschip: 'the card hid an OBS flag that the database shows — an altered card',
  };
  G.DOC_ISSUE_TEXT = ISSUE_TEXT;

  function describe(p) {
    const f = p.face;
    const art = /^[aeiou]/.test(f.age) ? 'An' : 'A';
    return `${art} ${f.age} with ${f.look}${p.cwu ? ', in the ochre CWU jacket' : ''}.`;
  }

  function barcode(cid) {
    let x = 0;
    let bars = '';
    const base = (cid + cid.split('').reverse().join('') + '7').split('').map(Number);
    const digits = [].concat(base, base.map((d) => (d * 7 + 3) % 10), base.map((d) => (d * 3 + 1) % 10), base);
    digits.forEach((d, i) => {
      const w = 1 + (d % 3);
      bars += `<rect x="${x}" y="0" width="${w}" height="20" fill="#1d2227"/>`;
      x += w + 1 + ((d + i) % 2);
    });
    return `<svg class="barcode" viewBox="0 0 ${x} 20" preserveAspectRatio="none">${bars}</svg>`;
  }

  function stampSvg(st) {
    const c = STAMP_HEX[st.col];
    const shape = st.shape === 'round' ? `<circle cx="22" cy="22" r="18" fill="none" stroke="${c}" stroke-width="2.4"/><circle cx="22" cy="22" r="13" fill="none" stroke="${c}" stroke-width="1"/>` : `<path d="M22 4l16 9v18l-16 9-16-9V13z" fill="none" stroke="${c}" stroke-width="2.4"/>`;
    return `<svg viewBox="0 0 44 44" class="stamp">${shape}<path d="M15 18l7 8 7-8" fill="none" stroke="${c}" stroke-width="2.2"/><circle cx="22" cy="17" r="2" fill="${c}"/><text x="22" y="36" fill="${c}" font-size="5" text-anchor="middle" font-family="monospace">C9·D5</text></svg>`;
  }

  /* ---------------------------------------------------------- renderer */
  G.MINIGAMES.docs = (block, opts, done) => {
    const s = G.state();
    const count = opts.count || 1;
    const timed = !!opts.timed;
    const perc = s.skills.perception || 0;
    const seconds = timed ? 16 + perc * 4 : 0;
    let idx = 0;
    let correct = 0;
    const results = [];

    const wrap = document.createElement('div');
    wrap.className = 'mini docs';
    block.append(wrap);

    function next() {
      if (idx >= count) {
        const ok = correct >= Math.ceil(count * (opts.need || 0.6));
        done(ok, { correct, count, results });
        return;
      }
      const c = makeCase(s, { ...(idx === 0 && opts.first ? opts.first : {}), cardOnly: !!opts.cardOnly });
      idx++;
      let flagged = null;
      let timer = null;
      let left = seconds;
      const R = c.rules;
      const hint = perc >= 3 && c.field;
      /* F(key, style, inner, label) — a clickable hot zone positioned in % over the template */
      const F = (key, pos, inner, label) =>
        `<button class="hz${hint && c.field === key ? ' hint' : ''}" data-f="${key}" style="${pos}">${label ? `<i class="lab">${label}</i>` : ''}${inner}</button>`;
      const box = (l, t, w, h) => `left:${l}%;top:${t}%;width:${w}%;height:${h}%`;

      const idHtml = `
        <div class="dcard idcard ${c.card.cwu ? 'cwu' : ''}">
          <img class="tpl" src="assets/img/docs/id-card.webp" alt="">
          <span class="hdr">UNIVERSAL UNION · CITIZEN IDENTIFICATION</span>
          ${F('card.photo', box(3.2, 16.8, 26.8, 54.6), `<img class="face" src="${FACES[c.card.photo].img}" alt="">`)}
          ${F('card.cid', box(63, 16.8, 34.2, 11.4), `<b>${c.card.cid}</b>`, 'CID')}
          ${F('card.name', box(63, 31.4, 34.2, 11.4), `<b>${c.card.name.toUpperCase()}</b>`, 'SURNAME')}
          ${F('card.district', box(63, 45.9, 34.2, 11.3), `<b>${c.card.district}</b>`, 'DISTRICT')}
          ${F('card.expires', box(63, 60.4, 34.2, 11), `<b>${c.card.expires}</b>`, 'EXPIRES')}
          <span class="bc" style="${box(19.5, 76.5, 77, 10)}">${barcode(c.card.cid)}</span>
          ${F('card.obs', box(0, 90.5, 100, 8.5), `<b class="st">${c.card.obs ? '<span class="obs">OBS — UNDER OBSERVATION</span>' : c.card.cwu ? '<span class="cwu-s">CWU — CIVIL WORKERS’ UNION</span>' : 'STANDARD CITIZEN'}</b>`)}
        </div>`;

      const scanHtml = `<div class="dcard scanner">
          <div class="sc-h">◈ CHIP SCAN · CID LABEL READER</div>
          <div class="sc-r"><span>CHIP CID</span><b>${c.scan.cid}</b></div>
          <div class="sc-r"><span>DATABASE STATUS</span><b class="${c.scan.obs ? 'red' : c.scan.cwu ? 'och' : ''}">${c.scan.obs ? 'OBS — UNDER OBSERVATION' : c.scan.cwu ? 'CWU' : 'STANDARD'}</b></div>
          <div class="sc-r"><span>READ</span><b>OK · ${c.today}</b></div>
        </div>`;
      const permitHtml = c.cardOnly ? scanHtml : c.permit
        ? `<div class="dcard permit">
            <img class="tpl" src="assets/img/docs/permit.webp" alt="">
            <span class="hdr">TRANSIT PERMIT · CANAL GATE 3</span>
            ${F('permit.cid', box(4.4, 18.7, 42.4, 15.4), `<b>${c.permit.cid}</b>`, 'CID')}
            ${F('permit.dest', box(4.4, 38.4, 42.4, 15.4), `<b>${c.permit.dest}</b>`, 'DEST.')}
            ${F('permit.valid', box(4.4, 57.8, 42.4, 15.3), `<b>${c.permit.valid}</b>`, 'VALID TO')}
            ${F('stamp', box(67.1, 19.8, 29.3, 51.8), stampSvg(c.permit.stamp))}
            <span class="sig">${c.card.name.charAt(0)}. ${c.card.name}</span>
          </div>`
        : `<div class="dcard permit nopermit">${F('permit.missing', box(0, 0, 100, 100), `<b>NO TRANSIT PERMIT PRESENTED</b>${c.card.cwu ? '<small>The citizen points at the CWU stripe on the card.</small>' : '<small>Only the ID card was handed through the slot.</small>'}`)}</div>`;

      wrap.innerHTML = `
        <div class="bulletin">
          <div class="bh">${c.cardOnly ? 'FIELD ID CHECK' : 'CHECKPOINT BULLETIN'} · CYCLE ${c.today}${count > 1 ? ` · CITIZEN ${idx} OF ${count}` : ''}</div>
          <div class="rules">${
            c.cardOnly
              ? `<span>ID expires cycle ${c.today} or later</span><span>Photo must match the subject</span><span>Printed CID = chip CID</span><span>Card status = database status</span>`
              : `
            <span>Valid stamp: ${stampSvg(R.stamp)} <b>${R.stamp.shape === 'hex' ? 'hexagonal' : 'round'}, ${R.stamp.col}</b></span>
            <span>ID expires cycle ${c.today} or later</span>
            <span>Permit CID = card CID · destination D3</span>
            <span>${R.obsBanned ? '<b>OBS: DENY</b>' : 'OBS: permitted'}</span>
            <span>${R.cwuNoPermit ? 'CWU: no permit needed' : 'CWU: permit required'}</span>`
          }</div>
          ${timed ? '<div class="tbar"><span></span></div>' : ''}
        </div>
        ${opts.showFace ? `<div class="subject"><img src="${c.person.face.img}" alt=""><span>THE SUBJECT<br><small>${describe(c.person)}</small></span></div>` : `<p class="who">${describe(c.person)}</p>`}
        <div class="docs-row">${idHtml}${permitHtml}</div>
        <p class="sub hintline">Tap the field that is wrong, then deny. Or approve if everything checks out.</p>
        <div class="mini-act">
          <button class="choice approve"><span class="num">✓</span><span class="lbl">APPROVE<span class="long"> — let them through</span></span></button>
          <button class="choice danger deny"><span class="num">✕</span><span class="lbl">DENY<span class="long"> — <span class="reason">select the faulty field first</span></span></span></button>
        </div>`;

      const finish = (verdict) => {
        clearInterval(timer);
        let ok;
        if (verdict === 'timeout') ok = false;
        else if (!c.issue) ok = verdict === 'approve';
        else ok = verdict === 'deny' && flagged === c.field;
        if (ok) correct++;
        results.push({ ok, issue: c.issue, verdict, flagged });
        wrap.querySelectorAll('button').forEach((b) => (b.disabled = true));
        if (c.field) {
          const t = wrap.querySelector(`[data-f="${c.field}"]`);
          if (t) t.classList.add('truth');
        }
        const msg = document.createElement('div');
        msg.className = 'roll ' + (ok ? 'ok' : 'fail');
        msg.innerHTML =
          verdict === 'timeout'
            ? `<b>TOO SLOW</b> — the queue pushes forward. ${c.issue ? 'They slip through: ' + ISSUE_TEXT[c.issue] + '.' : ''}`
            : ok
            ? `<b>CORRECT</b> — ${c.issue ? ISSUE_TEXT[c.issue] + '.' : 'their papers were in order.'}`
            : `<b>MISTAKE</b> — ${c.issue ? (verdict === 'approve' ? 'you let them through, but ' + ISSUE_TEXT[c.issue] + '.' : 'right call, wrong reason: ' + ISSUE_TEXT[c.issue] + '.') : 'their papers were in order. You turned away an innocent citizen.'}`;
        wrap.append(msg);
        setTimeout(next, count > 1 ? 1400 : 1100);
      };

      wrap.querySelectorAll('.hz').forEach((b) =>
        b.addEventListener('click', () => {
          wrap.querySelectorAll('.hz').forEach((x) => x.classList.remove('flag'));
          if (flagged === b.dataset.f) flagged = null;
          else {
            flagged = b.dataset.f;
            b.classList.add('flag');
          }
          const r = wrap.querySelector('.reason');
          if (r) r.textContent = flagged ? 'cite the flagged field' : 'select the faulty field first';
        })
      );
      wrap.querySelector('.approve').onclick = () => finish('approve');
      wrap.querySelector('.deny').onclick = () => finish('deny');

      if (timed) {
        const bar = wrap.querySelector('.tbar span');
        bar.style.width = '100%';
        left = seconds + 0.6;
        timer = setInterval(() => {
          left -= 0.1;
          bar.style.width = Math.max(0, (left / seconds) * 100) + '%';
          if (left < 5) bar.classList.add('low');
          if (left <= 0) finish('timeout');
        }, 100);
      }
      setTimeout(() => {
        if (window.innerWidth <= 860) window.scrollTo({ top: wrap.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
        else wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 350);
    }
    next();
  };

  /* ------------------------------------------------------------ scenes */
  G.addScenes({
    /* first checkpoint shift: the old man's forged permit (calm, one case, forced stamp forgery) */
    d_check_docs: {
      title: 'Canal Gate 3 — inspection',
      text: ['You take the papers through the slot. Card and permit. His hands are shaking so badly the permit rattles.', '@sys Inspect the documents. Your Perception skill gives you more time and, from level 3, a hint.'],
      mini: { type: 'docs', opts: { count: 1, first: { force: 'stamp', person: { faceIdx: 4, obs: false, cwu: false } } }, pass: 'd_check_spot', fail: 'd_check_miss', skill: 'perception', diff: 0 },
    },

    /* routine: work the queue, timed */
    d_check_queue: {
      title: 'Canal Gate 3 — the queue',
      text: ['Rook leans out of the booth. *"Three in a row, five. Fast and right. Dispatch counts the throughput."*', '@sys Three citizens, against the clock. Get at least two right.'],
      mini: { type: 'docs', opts: { count: 3, timed: true, need: 0.66 }, pass: 'd_check_queue_ok', fail: 'd_check_queue_bad', skill: 'perception', diff: 10 },
    },
    d_check_queue_ok: {
      text: (s) => {
        const r = s.lastMini || { correct: 3, count: 3 };
        return [`${r.correct} of ${r.count}. The queue moves, the scanner hums, nobody gets through who shouldn’t.`, '@say Rook|Clean. Dispatch likes clean.'];
      },
      choices: [{ t: 'End of shift.', fx: (s) => ({ merit: 2 + (s.lastMini ? s.lastMini.correct : 2), xp: { perception: 1 } }), go: 'u_duty_end' }],
    },
    d_check_queue_bad: {
      text: (s) => {
        const r = s.lastMini || { correct: 0, count: 3 };
        return [`${r.correct} of ${r.count}. Somewhere in the Canal Quarter tonight, someone is walking around on papers you passed.`, '@say Rook|Happens. Don’t let it happen twice.'];
      },
      choices: [{ t: 'End of shift.', fx: { merit: 1, susp: 2 }, go: 'u_duty_end' }],
    },
  });

  G.addCodex({
    docs: {
      title: 'Document inspection',
      body: `<p>At every hardpoint the bulletin for the current cycle lists the valid stamp, who may pass and what papers they need. Check, in order:</p>
      <table>
        <tr><td>PHOTO</td><td>Does the face on the card belong to the citizen in front of you? Age, hair, glasses, beard, scars.</td></tr>
        <tr><td>EXPIRY</td><td>The card must be valid through today’s cycle or later.</td></tr>
        <tr><td>CID</td><td>The permit’s CID must match the card exactly, digit for digit.</td></tr>
        <tr><td>DESTINATION</td><td>Canal Gate 3 admits to D3 only.</td></tr>
        <tr><td>STAMP</td><td>Shape and colour must match today’s bulletin. Forgeries use yesterday’s stamp.</td></tr>
        <tr><td>STATUS</td><td>OBS and CWU rules change by cycle. Read the bulletin.</td></tr>
      </table>
      <p>Deny only with a cited reason. A denial without cause is wasted time; an approval of forged papers is worse.</p>`,
    },
  });
})();
