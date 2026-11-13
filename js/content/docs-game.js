/* DOCUMENT INSPECTION minigame — replaces the dice roll where a scene uses `mini: { type: 'docs', ... }` */
(function () {
  G.MINIGAMES = G.MINIGAMES || {};

  const SURNAMES = ['Orlova', 'Halek', 'Brodsky', 'Vey', 'Kessel', 'Marek', 'Danek', 'Sokol', 'Petrak', 'Lind', 'Havel', 'Novak', 'Ruzek', 'Frank', 'Koval', 'Zeman', 'Bartos', 'Mraz'];
  const HAIR = [
    { id: 'dark', label: 'dark hair', col: '#2b2420' },
    { id: 'grey', label: 'grey hair', col: '#9a9a96' },
    { id: 'fair', label: 'fair hair', col: '#b89a62' },
    { id: 'shaved', label: 'a shaved head', col: null },
  ];
  const STAMPS = [
    { shape: 'round', col: 'blue' },
    { shape: 'round', col: 'red' },
    { shape: 'hex', col: 'blue' },
    { shape: 'hex', col: 'red' },
  ];
  const STAMP_HEX = { blue: '#2f6fb5', red: '#a3262a' };

  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const mutateCid = (cid) => {
    const i = rint(0, 4);
    let d = String((+cid[i] + rint(1, 8)) % 10);
    return cid.slice(0, i) + d + cid.slice(i + 1);
  };

  /* calendar: the Union counts service cycles since the city was rebuilt */
  G.cycle = (s) => 2140 + (s.day || 0);

  /* rules for the current cycle — stable per day */
  function rulesFor(s) {
    s.mem.docRules = s.mem.docRules || {};
    if (s.mem.docRules.day !== s.day) {
      s.mem.docRules = {
        day: s.day,
        stamp: pick(STAMPS),
        obsBanned: Math.random() < 0.6,
        cwuNoPermit: Math.random() < 0.5,
      };
    }
    return s.mem.docRules;
  }

  /* build one case. opts.force = issue id to force, opts.person = description override */
  function makeCase(s, opts) {
    const R = rulesFor(s);
    const today = G.cycle(s);
    const person = {
      male: Math.random() < 0.5,
      hair: pick(HAIR),
      glasses: Math.random() < 0.35,
      scar: Math.random() < 0.3,
      age: pick(['young', 'middle-aged', 'old']),
      cwu: Math.random() < 0.18,
      obs: Math.random() < 0.15,
    };
    if (opts && opts.person) Object.assign(person, opts.person);
    const cid = String(rint(10000, 99999));
    const card = {
      cid,
      name: pick(SURNAMES),
      district: 'D5',
      expires: today + rint(2, 30),
      photo: { hair: person.hair, glasses: person.glasses, scar: person.scar },
      obs: person.obs,
      cwu: person.cwu,
      stamp: { ...R.stamp },
    };
    const permit = person.cwu && R.cwuNoPermit ? null : { cid, dest: 'D3', valid: today + rint(0, 3), stamp: { ...R.stamp } };

    /* which issues are possible */
    const possible = ['expired', 'cid', 'photo', 'stamp', 'dest', 'nopermit'];
    if (R.obsBanned) possible.push('obs');
    let issue = opts && opts.force !== undefined ? opts.force : Math.random() < 0.38 ? null : pick(possible);
    if (person.obs && R.obsBanned) issue = issue || 'obs';
    if (!permit && ['cid', 'dest', 'nopermit', 'stamp'].includes(issue)) issue = 'expired';

    switch (issue) {
      case 'expired':
        card.expires = today - rint(1, 9);
        break;
      case 'cid':
        permit.cid = mutateCid(cid);
        break;
      case 'photo': {
        const other = HAIR.filter((h) => h.id !== person.hair.id);
        card.photo = { ...card.photo, hair: pick(other) };
        if (Math.random() < 0.5) card.photo.glasses = !card.photo.glasses;
        break;
      }
      case 'stamp': {
        const bad = STAMPS.filter((x) => !(x.shape === R.stamp.shape && x.col === R.stamp.col));
        (permit || card).stamp = { ...pick(bad), forged: true };
        break;
      }
      case 'dest':
        permit.dest = pick(['D1', 'D4', '404']);
        break;
      case 'nopermit':
        if (permit) card._permitMissing = true;
        break;
      case 'obs':
        card.obs = true;
        break;
    }
    const hasPermit = permit && !card._permitMissing;
    return { person, card, permit: hasPermit ? permit : null, issue, rules: R, today, field: fieldOf(issue) };
  }

  function fieldOf(issue) {
    return { expired: 'card.expires', cid: 'permit.cid', photo: 'card.photo', stamp: 'stamp', dest: 'permit.dest', nopermit: 'permit.missing', obs: 'card.obs' }[issue] || null;
  }

  const ISSUE_TEXT = {
    expired: 'the ID card had expired',
    cid: 'the CID on the permit did not match the card',
    photo: 'the photograph was of someone else',
    stamp: 'the stamp was not today’s valid stamp',
    dest: 'the permit was for the wrong district',
    nopermit: 'there was no transit permit',
    obs: 'citizens under observation are barred today',
  };
  G.DOC_ISSUE_TEXT = ISSUE_TEXT;

  function describe(p) {
    const bits = [p.age, p.male ? 'man' : 'woman', 'with ' + p.hair.label];
    if (p.glasses) bits.push('glasses');
    if (p.scar) bits.push('a scar across one cheek');
    let t = (/^[aeiou]/.test(bits[0]) ? 'An ' : 'A ') + bits[0] + ' ' + bits[1] + ' ' + bits.slice(2).join(', ');
    if (p.cwu) t += ', in an ochre CWU jacket';
    return t + '.';
  }

  function face(photo) {
    const h = photo.hair;
    const hair = h.col ? `<path d="M14 26c0-12 8-18 18-18s18 6 18 18c-4-5-10-7-18-7s-14 2-18 7z" fill="${h.col}"/>` : '';
    const glasses = photo.glasses ? '<g fill="none" stroke="#222" stroke-width="1.6"><circle cx="25" cy="32" r="4.5"/><circle cx="39" cy="32" r="4.5"/><path d="M29.5 32h5"/></g>' : '';
    const scar = photo.scar ? '<path d="M40 38l6 5" stroke="#8a3b36" stroke-width="1.6"/>' : '';
    return `<svg viewBox="0 0 64 72" class="photo"><rect width="64" height="72" fill="#cfd3d1"/><ellipse cx="32" cy="34" rx="15" ry="18" fill="#d9b9a0"/>${hair}<circle cx="25" cy="32" r="1.6" fill="#222"/><circle cx="39" cy="32" r="1.6" fill="#222"/><path d="M27 44q5 3 10 0" stroke="#7a5446" stroke-width="1.5" fill="none"/>${glasses}${scar}<path d="M8 72c4-12 13-16 24-16s20 4 24 16z" fill="#3e5f6e"/></svg>`;
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
      const c = idx === 0 && opts.first ? makeCase(s, opts.first) : makeCase(s, {});
      idx++;
      let flagged = null;
      let timer = null;
      let left = seconds;
      const R = c.rules;
      const hint = perc >= 3 && c.field;
      const F = (key, inner, extra) => `<button class="fld${hint && c.field === key ? ' hint' : ''}" data-f="${key}" ${extra || ''}>${inner}</button>`;
      const stampKey = 'stamp';
      const permitHtml = c.permit
        ? `<div class="doc-card permit">
            <div class="dh">TRANSIT PERMIT · CANAL GATE 3</div>
            ${F('permit.cid', `<small>CID</small><b>${c.permit.cid}</b>`)}
            ${F('permit.dest', `<small>DESTINATION</small><b>${c.permit.dest}</b>`)}
            ${F('permit.valid', `<small>VALID UNTIL CYCLE</small><b>${c.permit.valid}</b>`)}
            ${F(stampKey, stampSvg(c.permit.stamp), 'aria-label="stamp"')}
          </div>`
        : `<div class="doc-card permit empty">${F('permit.missing', '<small>TRANSIT PERMIT</small><b>— none presented —</b>')}</div>`;

      wrap.innerHTML = `
        <div class="bulletin">
          <div class="bh">CHECKPOINT BULLETIN · CYCLE ${c.today}${count > 1 ? ` · CITIZEN ${idx} OF ${count}` : ''}</div>
          <div class="rules">
            <span>Valid stamp today: ${stampSvg(R.stamp)} <b>${R.stamp.shape === 'hex' ? 'hexagonal' : 'round'}, ${R.stamp.col}</b></span>
            <span>ID must not be expired</span>
            <span>Permit CID must match card · destination D3 only</span>
            <span>${R.obsBanned ? '<b>OBS citizens: DENY</b>' : 'OBS citizens: permitted'}</span>
            <span>${R.cwuNoPermit ? 'CWU: no permit required' : 'CWU: permit required'}</span>
          </div>
          ${timed ? '<div class="tbar"><span></span></div>' : ''}
        </div>
        <p class="who">${describe(c.person)}</p>
        <div class="docs-row">
          <div class="doc-card id ${c.card.cwu ? 'cwu' : ''}">
            <div class="dh">UNIVERSAL UNION · CITIZEN IDENTIFICATION</div>
            <div class="idgrid">
              ${F('card.photo', face(c.card.photo), 'aria-label="photo"')}
              <div class="idf">
                ${F('card.cid', `<small>CID</small><b>${c.card.cid}</b>`)}
                ${F('card.name', `<small>SURNAME</small><b>${c.card.name.toUpperCase()}</b>`)}
                ${F('card.expires', `<small>VALID THROUGH CYCLE</small><b>${c.card.expires}</b>`)}
              </div>
            </div>
            ${F('card.obs', `<small>STATUS</small><b>${c.card.obs ? '<span class="obs">OBS</span>' : c.card.cwu ? '<span class="cwu-s">CWU</span>' : 'STANDARD'}</b>`)}
          </div>
          ${permitHtml}
        </div>
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
        else ok = verdict === 'deny' && flagged && (flagged === c.field || (c.field === 'stamp' && flagged === 'stamp'));
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
        setTimeout(next, count > 1 ? 1300 : 1100);
      };

      wrap.querySelectorAll('.fld').forEach((b) =>
        b.addEventListener('click', () => {
          wrap.querySelectorAll('.fld').forEach((x) => x.classList.remove('flag'));
          if (flagged === b.dataset.f) {
            flagged = null;
          } else {
            flagged = b.dataset.f;
            b.classList.add('flag');
          }
          wrap.querySelector('.reason').textContent = flagged ? 'cite the flagged field' : 'select the faulty field first';
        })
      );
      wrap.querySelector('.approve').onclick = () => finish('approve');
      wrap.querySelector('.deny').onclick = () => finish('deny');

      if (timed) {
        const bar = wrap.querySelector('.tbar span');
        bar.style.width = '100%';
        left = seconds + 0.6; // grace while the view scrolls into place
        timer = setInterval(() => {
          left -= 0.1;
          bar.style.width = Math.max(0, (left / seconds) * 100) + '%';
          if (left < 5) bar.classList.add('low');
          if (left <= 0) finish('timeout');
        }, 100);
      }
      setTimeout(() => {
        const top = wrap.getBoundingClientRect().top + window.scrollY - (window.innerWidth <= 860 ? 70 : 20);
        const main = document.getElementById('main');
        if (window.innerWidth <= 860) window.scrollTo({ top, behavior: 'smooth' });
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
      mini: { type: 'docs', opts: { count: 1, first: { force: 'stamp', person: { male: true, age: 'old', obs: false, cwu: false } } }, pass: 'd_check_spot', fail: 'd_check_miss', skill: 'perception', diff: 0 },
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
        <tr><td>PHOTO</td><td>Hair, glasses, scars — does the face match the citizen in front of you?</td></tr>
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
