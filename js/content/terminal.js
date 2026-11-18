/* CCA TERMINAL — the Union's own console. A real command line: type, or tap a command. A wall of
   screens round it shows your unit, the signal, your files and the log, and the main screen answers.
   Open it from the top bar once you wear the mask. Commands (help lists them):
     whoami, units, files, query <cid>, roster, orders, city, jury, np, log, clear, exit
   and a few the Union would rather you did not try. G.TERMINAL_IMG, when an image of a blank console
   exists (assets/img/terminal.webp), is laid behind the screens.
   HACK (minigame, G.MINIGAMES.hack): a memory dump of candidate words; pick the password, and each wrong
   try tells you how many letters it shares, in place. Scene usage: mini: { type: 'hack', opts: { title,
   words, answer, tries, hint }, pass, fail }. */
(function () {
  G.TERMINAL_IMG = G.TERMINAL_IMG || '';
  const esc = (x) => String(x).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const word = (v) => (v >= 45 ? 'TRUSTS' : v >= 15 ? 'FRIENDLY' : v > -15 ? 'NEUTRAL' : v > -45 ? 'WARY' : 'HOSTILE');
  const files = (s) => Object.values(s.files || {});
  const bar = (v, n = 20) => '█'.repeat(Math.round((Math.max(0, Math.min(100, v)) / 100) * n)).padEnd(n, '░');

  const CMD = {
    help: () => ['COMMANDS', '  whoami          your designation and grade', '  units           your squad', '  files           your case files, newest first', '  query <cid>     look up a citizen by CID', '  roster          people on record and how they stand', '  orders          what the board offers', '  city            city status', '  jury            what JURY holds on you', '  np              Nova Prospekt incident report (after Chapter 12)', '  log             this terminal’s session log', '  clear · exit'],
    whoami: (s) => [`${G.desig(s)}`, `GRADE   ${G.RANK_NAMES[s.rank]}`, `DIV     ${s.div || 'UNION'}`, `DAY     ${s.day}`, `HEALTH  ${bar(s.hp)} ${s.hp}`, `MERIT   ${s.merit}`, `LOYALTY ${s.lp > 0 ? '+' : ''}${s.lp}`],
    units: (s) => {
      const m = s.squad && s.squad.formed && G.squadActive ? G.squadActive(s) : [];
      return m.length ? ['SQUAD', ...m.map((u) => `  ${u.name}${u.hurt ? ' (wounded)' : ''}`)] : ['NO SQUAD FORMED.'];
    },
    files: (s) => {
      const f = files(s).slice(-8).reverse();
      return f.length ? ['CASE FILES (newest first)', ...f.map((x) => `  CID ${x.cid}  ${x.amputated ? 'AMPUTATED' : x.lastVerdict || 'stopped'}`)] : ['NO CASE FILES.'];
    },
    query: (s, a) => {
      const cid = (a[0] || '').replace(/\D/g, '');
      if (!cid) return ['USAGE: query <cid>'];
      const f = files(s).find((x) => String(x.cid) === cid);
      return f ? [`CID ${f.cid}`, `DESC   ${f.desc || '—'}`, `LAST   day ${f.last} — ${f.lastVerdict || 'stopped'}`, f.amputated ? 'STATUS AMPUTATED' : 'STATUS ACTIVE'] : [`CID ${cid}: NO RECORD HELD BY THIS UNIT.`];
    },
    roster: (s) => {
      const l = Object.keys(s.rel || {}).filter((k) => G.PEOPLE && G.PEOPLE[k]).sort((a, b) => Math.abs(s.rel[b]) - Math.abs(s.rel[a])).slice(0, 8);
      return l.length ? ['ON RECORD', ...l.map((k) => `  ${G.PEOPLE[k].name.padEnd(22)} ${word(s.rel[k])}`)] : ['NOBODY ON RECORD.'];
    },
    orders: (s) => ((s.duty && s.duty.offers) || []).filter((k) => G.duties && G.duties[k]).map((k) => `  ${G.duties[k].name}`).concat(['', 'Open the duty board for details.']),
    city: (s) => [`DAY ${s.day} · ${s.time || ''}`, `WATCH LEVEL  ${bar(s.susp || 0)} ${s.susp || 0}`, s.c11 && s.c11.done ? 'NEXUS: ' + (s.c11.outcome || '—').toUpperCase() : 'NEXUS: HELD', s.c12 && s.c12.done ? 'NOVA PROSPEKT: ' + (s.c12.out || '—').toUpperCase() : null].filter(Boolean),
    jury: (s) => (s.jf && s.jf.ev ? [`JURY FILE: ${s.jf.ev.length} page${s.jf.ev.length === 1 ? '' : 's'}.`, 'Contents are not displayed on this terminal.'] : ['JURY FILE: THIN.']),
    np: (s) => (s.c12 && s.c12.out ? ['NOVA PROSPEKT — INCIDENT REPORT', `  HANDLED   ${s.c12.handled}`, `  MISSED    ${s.c12.missed}`, `  ORDER     ${s.c12.order}%`, `  RELEASED  ${s.c12.freed}`, `  OUTCOME   ${s.c12.out.toUpperCase()}`] : ['NO INCIDENT REPORT HELD.']),
    lambda: (s) => (G.fx(s, { susp: 1 }), ['COMMAND NOT RECOGNISED.', 'THIS TERMINAL IS LOGGED.']),
    freeman: () => ['DESIGNATION: ANTICITIZEN ONE.', 'NO OTHER NAME IS ON FILE.'],
  };
  const hist = [];
  let el = null;
  const run = (s, line) => {
    const [c, ...a] = line.trim().split(/\s+/);
    const k = (c || '').toLowerCase();
    if (!k) return [];
    hist.push(k);
    if (k === 'clear') return null;
    if (k === 'exit' || k === 'quit') return 'exit';
    return CMD[k] ? CMD[k](s, a) : [`${esc(c)}: COMMAND NOT RECOGNISED.`];
  };
  G.termRun = (line) => run(G.state(), line);

  const panels = (s) => {
    const m = s.squad && s.squad.formed && G.squadActive ? G.squadActive(s).length : 0;
    return {
      unit: `<b>UNIT</b>${esc(G.desig(s))}<br>${esc(G.RANK_NAMES[s.rank])}<br>HP ${bar(s.hp, 12)}`,
      city: `<b>CITY</b>DAY ${s.day}<br>WATCH ${bar(s.susp || 0, 12)}<br>SQUAD ${m}`,
      files: `<b>FILES</b>${files(s).length} held<br>${files(s).filter((f) => f.amputated).length} amputated`,
      sig: `<b>SIGNAL</b><span class="tm-wave">${'<i></i>'.repeat(14)}</span>`,
      time: `<b>CLOCK</b>${esc(s.time || '')}<br>${s.chapter ? 'CH ' + s.chapter : ''}`,
      log: `<b>LOG</b>${hist.slice(-3).map(esc).join('<br>') || '—'}`,
    };
  };
  const open = () => {
    if (el) return;
    const S = G.state();
    el = document.createElement('div');
    el.id = 'term';
    el.innerHTML = `<div class="tm-frame">
      <div class="tm-wall">
        <div class="tm-side l"><div class="tm-p" data-p="unit"></div><div class="tm-p" data-p="files"></div><div class="tm-p" data-p="time"></div></div>
        <div class="tm-main"><div class="tm-out" role="log" aria-live="polite"></div><form class="tm-in"><span>CCA&gt;</span><input autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terminal command"></form>
          <div class="tm-keys">${['help', 'whoami', 'files', 'roster', 'city', 'exit'].map((c) => `<button type="button" data-c="${c}">${c}</button>`).join('')}</div></div>
        <div class="tm-side r"><div class="tm-p" data-p="city"></div><div class="tm-p" data-p="sig"></div><div class="tm-p" data-p="log"></div></div>
      </div>
      <div class="tm-desk"><span>CCA · CITY 09 · OPERATOR CONSOLE</span><button type="button" class="tm-x">Close</button></div></div>`;
    if (G.TERMINAL_IMG) el.style.setProperty('--tm-img', `url('${G.TERMINAL_IMG}')`), el.classList.add('img');
    document.body.append(el);
    const out = el.querySelector('.tm-out');
    const inp = el.querySelector('input');
    const refresh = () => {
      const p = panels(G.state());
      el.querySelectorAll('[data-p]').forEach((n) => (n.innerHTML = p[n.dataset.p]));
    };
    const print = (lines) => {
      lines.forEach((l) => out.insertAdjacentHTML('beforeend', `<div>${esc(l) || '&nbsp;'}</div>`));
      out.scrollTop = out.scrollHeight;
    };
    const exec = (line) => {
      print([`CCA> ${line}`]);
      const r = run(G.state(), line);
      if (r === 'exit') return close();
      if (r === null) out.innerHTML = '';
      else print(r);
      refresh();
    };
    el.querySelector('form').onsubmit = (e) => {
      e.preventDefault();
      const v = inp.value;
      inp.value = '';
      exec(v);
    };
    el.querySelectorAll('[data-c]').forEach((b) => (b.onclick = () => exec(b.dataset.c)));
    el.querySelector('.tm-x').onclick = close;
    el.addEventListener('keydown', (e) => e.key === 'Escape' && close());
    print(['CITY 09 — CIVIL PROTECTION — OPERATOR CONSOLE', `LOGGED IN: ${G.desig(S)}`, 'TYPE help FOR COMMANDS.', '']);
    refresh();
    el._t = setInterval(() => (document.body.contains(el) ? refresh() : clearInterval(el._t)), 2000);
    setTimeout(() => inp.focus(), 50);
  };
  function close() {
    if (!el) return;
    clearInterval(el._t);
    el.remove();
    el = null;
  }
  G.openTerminal = open;
  G.closeTerminal = close;

  const addButton = () => {
    const bar = document.querySelector('.tb-right');
    if (!bar || document.getElementById('btn-term')) return;
    const b = document.createElement('button');
    b.id = 'btn-term';
    b.title = 'CCA terminal';
    b.textContent = 'Terminal';
    b.onclick = () => (el ? close() : open());
    bar.insertBefore(b, document.getElementById('btn-roster'));
  };
  (G.afterRender = G.afterRender || []).push(() => {
    addButton();
    const s = G.state && G.state();
    const b = document.getElementById('btn-term');
    if (b) b.style.display = s && s.phase === 'union' ? '' : 'none';
  });

  /* ================================================================ HACK */
  G.MINIGAMES = G.MINIGAMES || {};
  const JUNK = '!@#$%^&*()-_=+[]{};:<>?/\\|~'.split('');
  const like = (a, b) => a.split('').filter((ch, i) => b[i] === ch).length;
  G.MINIGAMES.hack = (block, opts, done) => {
    const S = G.state();
    const words = opts.words.slice();
    const answer = opts.answer;
    let tries = opts.tries || 4;
    let over = false;
    const root = document.createElement('div');
    root.className = 'mini hack';
    root.innerHTML = `<div class="cr-head"><span class="cr-title">${opts.title || 'Archive terminal'}</span><span class="cr-clock"></span></div>
      <div class="hk-body"><div class="hk-dump"></div><div class="hk-log"></div></div>
      <div class="cr-help">${opts.hint ? esc(opts.hint) + ' ' : ''}Pick the password from the dump. A wrong word shows how many letters are in the right place. The terminal locks after ${tries} tries.</div>`;
    block.append(root);
    const dump = root.querySelector('.hk-dump');
    const lg = root.querySelector('.hk-log');
    const clock = root.querySelector('.cr-clock');
    const rj = () => Array.from({ length: 6 + Math.floor(Math.random() * 6) }, () => JUNK[Math.floor(Math.random() * JUNK.length)]).join('');
    const hex = () => '0x' + Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
    words.sort(() => Math.random() - 0.5);
    dump.innerHTML = words.map((w, i) => `<div><span class="hx">${hex()}</span> ${esc(rj())}<button type="button" data-i="${i}">${w}</button>${esc(rj())}</div>`).join('');
    const upd = () => (clock.textContent = '▮'.repeat(tries) + '▯'.repeat(Math.max(0, (opts.tries || 4) - tries)));
    upd();
    const end = (ok) => {
      over = true;
      dump.querySelectorAll('button').forEach((b) => (b.disabled = true));
      root.classList.add(ok ? 'won' : 'lost');
      lg.insertAdjacentHTML('beforeend', `<div class="${ok ? 'ok' : 'bad'}">${ok ? 'ACCESS GRANTED.' : 'TERMINAL LOCKED. THE ATTEMPT IS LOGGED.'}</div>`);
      done(ok, { tries });
    };
    dump.onclick = (e) => {
      const b = e.target.closest('button[data-i]');
      if (!b || over || G.state() !== S) return;
      const w = words[+b.dataset.i];
      b.disabled = true;
      if (w === answer) {
        lg.insertAdjacentHTML('beforeend', `<div>&gt; ${w}</div>`);
        return end(true);
      }
      tries--;
      lg.insertAdjacentHTML('beforeend', `<div>&gt; ${w}<br>ENTRY DENIED. LIKENESS ${like(w, answer)}/${answer.length}.</div>`);
      upd();
      if (tries <= 0) end(false);
    };
  };
})();
