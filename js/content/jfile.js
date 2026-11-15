/* YOUR FILE — JURY builds a case against you. Suspicion used to be a hidden number; now every act
   that raises it by 3 or more leaves a page in a JURY file: the day, what you did (the words of the
   choice you made), where, and the kind of evidence — Lantern footage, a witness statement, an
   informant report, an access log.
   - The case's strength IS your suspicion. When suspicion falls, the oldest pages go cold.
   - Inspector "Ledger" (JURY SqL, internal files) reads it. The first time the file has weight she
     stops you in a corridor and quotes a page back to you. At 60 suspicion she interviews you.
   - You see the file itself only with access: a resistance contact who leaks pages (resistance 20+),
     VEIL's shadow, or JURY at Elite rank and above. With access you can try to make pages disappear,
     each kind its own way, every few days. Getting caught writes a new page. */
(function () {
  const pick = G.pick;
  const KINDS = {
    lantern: { name: 'LANTERN FOOTAGE', how: 'Wipe the archive segment', skill: 'comms', diff: 10 },
    witness: { name: 'WITNESS STATEMENT', how: 'Find the witness and change their mind', skill: 'authority', diff: 10, pay: true },
    informant: { name: 'INFORMANT REPORT', how: 'Discredit the informant', skill: 'deception', diff: 10 },
    log: { name: 'ACCESS LOG', how: 'Edit the log', skill: 'comms', diff: 5 },
  };
  G.PEOPLE.ledger = { name: '"Ledger"', role: 'JURY SqL · internal files', img: 'ledger' };
  const LEDGER = '@portrait assets/img/portraits/ledger.webp|CCA.C9.D1-JURY-SqL-20488 — "Ledger"';

  const J = (s) => {
    s.jf = s.jf || { ev: [], n: 0, met: false, open: false, burnDay: -99 };
    return s.jf;
  };
  const active = (s) => J(s).ev.filter((e) => e.st === 'active');
  const weight = (s) => active(s).reduce((a, e) => a + e.w, 0);
  G.jfile = J;
  G.jfAccess = (s) => s.phase === 'union' && (s.res >= 20 || !!s.flags.veil_shadow || (s.div === 'JURY' && G.rankIdx(s.rank) >= G.rankIdx('EpU')));

  /* what the last choice was, so a page can quote it */
  G.onChoose.push((s, c, sceneId) => {
    const sc = G.scenes[sceneId];
    let title = sc && sc.title;
    try {
      title = typeof title === 'function' ? title(s, G) : title;
    } catch (e) {
      title = null;
    }
    s.mem.lastPick = { t: String(typeof c.t === 'function' ? c.t(s, G) : c.t || '').replace(/\*\*/g, '').slice(0, 90), scene: sceneId, title: title || null, day: s.day };
  });

  const kindFor = (id) => {
    if (/^(ss_|echo_more|echo_traded)/.test(id)) return 'witness';
    if (/^(raid_|inf_)/.test(id)) return 'informant';
    if (/^(glan_|dd_g|desk_|dd_j|xfer_)/.test(id)) return 'log';
    if (/^(echo_cells|echo_shrine|c\d_|w_|ev_)/.test(id)) return pick(['lantern', 'lantern', 'witness']);
    return pick(['lantern', 'witness', 'informant', 'log']);
  };

  function addPage(s, w) {
    const j = J(s);
    const lp = s.mem.lastPick && s.mem.lastPick.day === s.day ? s.mem.lastPick : null;
    const scene = (lp && lp.scene) || s.scene;
    const dup = j.ev.find((e) => e.day === s.day && e.scene === scene && e.st === 'active');
    if (dup) return (dup.w += w);
    j.n++;
    j.ev.push({ id: j.n, day: s.day, w, st: 'active', kind: kindFor(scene), scene, what: lp ? lp.t : null, where: (lp && lp.title) || null, block: G.blockFor ? G.blockFor(s, scene) : null });
  }
  /* pages go cold, oldest first, when suspicion falls below what the file says */
  function settle(s) {
    const j = J(s);
    let over = weight(s) - Math.max(0, s.susp);
    for (const e of j.ev) {
      if (over <= 0) break;
      if (e.st !== 'active') continue;
      e.st = 'cold';
      over -= e.w;
    }
  }
  const oldFx = G.fx;
  G.fx = (s, e) => {
    oldFx(s, e);
    if (!s || s.phase !== 'union' || !e) return;
    if (e.susp >= 3) addPage(s, e.susp);
    if (e.susp < 0) settle(s);
  };

  const pageLine = (e) => `DAY ${e.day} · ${KINDS[e.kind].name}${e.where ? ' · ' + String(e.where).toUpperCase() : ''}${e.what ? `\n  “${e.what}”` : ''}${e.st === 'cold' ? '\n  [COLD]' : e.st === 'burned' ? '\n  [MISSING]' : ''}`;
  const heaviest = (s) => active(s).sort((a, b) => b.w - a.w || b.day - a.day)[0];

  /* ---------------------------------------------------------- beats */
  G.beats.push({ id: 'jf_corridor', time: 'morning', when: (s) => s.phase === 'union' && active(s).length >= 2 && weight(s) >= 12 && s.susp >= 15, scene: 'jf_corridor' });
  G.beats.push({ id: 'jf_leak', time: 'evening', when: (s) => J(s).met && G.jfAccess(s) && active(s).length >= 1, scene: 'jf_leak' });
  G.beats.push({ id: 'jf_int1', time: 'morning', when: (s) => J(s).met && s.susp >= 60 && active(s).length >= 1, scene: 'jf_interview' });
  G.beats.push({ id: 'jf_int2', time: 'morning', when: (s) => s.flags.beat_jf_int1 && s.susp >= 80 && active(s).length >= 1 && s.day >= (J(s).intDay || 0) + 5, scene: 'jf_interview' });

  /* on the duty board: work on the file */
  G.extend('u_board', {
    choices: (list, s) => {
      const j = J(s);
      if (!j.open || !G.jfAccess(s) || !active(s).length) return list;
      list.push({ t: '**Your JURY file.** Make a page disappear.', tag: 'RISK', tagCls: 'risk', lock: (st) => (J(st).burnDay > st.day - 3 ? `Too soon — try again on day ${J(st).burnDay + 3}` : null), go: 'jf_burn' });
      return list;
    },
  });

  G.addScenes({
    jf_corridor: {
      title: 'The Nexus — Level 2 corridor',
      enter: (s) => {
        const j = J(s);
        j.met = true;
        j.quote = (heaviest(s) || {}).id;
        G.unlock(s, 'jfile');
      },
      text: (s) => {
        const e = J(s).ev.find((x) => x.id === J(s).quote);
        return [
          LEDGER,
          'A JURY officer you have never spoken to falls into step beside you on the way to muster. Crimson crest stripe, a slate under one arm, a voice like someone reading aloud.',
          `@say Ledger|Day ${e.day}. ${e.where ? e.where + '. ' : ''}${e.what ? `You chose: “${e.what}”` : 'You know what you did.'} I am not asking you about it. I am telling you that I read it.`,
          '@say Ledger|Internal files. My name is Ledger. Everybody has a file. Most files are thin. Yours is getting thicker. Have a good shift.',
        ];
      },
      choices: [
        { t: '“I don’t know what you mean.”', fx: { susp: 1 }, go: 'u_board' },
        { t: 'Say nothing. Keep walking.', go: 'u_board' },
      ],
    },

    jf_leak: {
      title: (s) => `Evening — Day ${s.day}`,
      enter: (s) => {
        J(s).open = true;
      },
      text: (s) => {
        const veil = !!s.flags.veil_shadow;
        const jury = s.div === 'JURY';
        const pages = J(s).ev.slice(-5);
        return [
          veil
            ? '@say VEIL|Ledger has a file on you. We would like you to see it, so that you understand what we can make disappear, and what we can make appear.'
            : jury
            ? 'Elite clearance opens doors on Level 4 that it was never meant to. At 22:00 the internal-files room is empty, and the cabinet with your designation on it is not locked.'
            : 'A carbon copy, folded small, inside your ration packet. Three pages. Someone in the Nexus copies things for the canal cells, and tonight they copied you.',
          `@doc JURY — INTERNAL FILE · ${G.desig(s)}\nINVESTIGATING OFFICER: "LEDGER"\n\n${pages.map(pageLine).join('\n\n')}`,
          '@sys Your JURY file is now in your Dossier. From the duty board you can try to make pages disappear.',
        ];
      },
      choices: [{ t: 'Burn the copy. Remember every word.', go: 'u_night' }],
    },

    jf_interview: {
      title: 'Level 4 — interview room 2',
      enter: (s) => {
        const j = J(s);
        j.intDay = s.day;
        j.quote = (heaviest(s) || {}).id;
      },
      text: (s) => {
        const e = J(s).ev.find((x) => x.id === J(s).quote);
        return [
          LEDGER,
          'Ledger has a slate, a cup of real tea, and a stress probe that goes on the base of your skull. The probe is cold. The tea is for her.',
          `@say Ledger|${KINDS[e.kind].name.toLowerCase().replace(/^./, (c) => c.toUpperCase())}, day ${e.day}. ${e.what ? `“${e.what}.” ` : ''}Tell me about it. Take your time. The probe will.`,
          `@sys Your file: ${active(s).length} active page${active(s).length > 1 ? 's' : ''}.`,
        ];
      },
      choices: (s) => {
        const e = J(s).ev.find((x) => x.id === J(s).quote);
        return [
          { t: 'Deny it. Calmly. Every word.', tag: 'DECEPTION', tagCls: 'risk', check: { skill: 'deception', diff: Math.min(30, 5 + e.w * 2), pass: 'jf_int_ok', fail: 'jf_int_bad' } },
          { t: 'Admit a smaller version. A mistake, not a choice.', fx: (st) => (G.discipline(st, 'minor', 'Irregularity admitted to internal files'), { susp: -Math.ceil(e.w / 2) }), go: 'jf_int_admit' },
          { t: 'Give her your partner instead.', tag: 'BETRAYAL', tagCls: 'risk', fx: (st) => {
              e.st = 'cold';
              const p = G.partnerOf(st);
              if (p.key && st.rel[p.key] !== undefined) st.rel[p.key] -= 30;
              else if (p.loyal !== undefined) p.loyal = Math.max(0, p.loyal - 40);
              return { susp: -e.w, cons: -10 };
            },
            go: 'jf_int_partner',
          },
        ];
      },
    },
    jf_int_ok: {
      enter: (s) => {
        const e = J(s).ev.find((x) => x.id === J(s).quote);
        e.st = 'cold';
        G.fx(s, { susp: -Math.ceil(e.w / 2) });
      },
      text: ['The probe’s needle lies down and stays down. Ledger watches it for a long time, then writes one word on her slate and turns it face down.', '@say Ledger|Thank you. That will be all. For now.'],
      choices: [{ t: 'Go to your shift.', go: 'u_board' }],
    },
    jf_int_bad: {
      text: ['On the third answer the needle jumps, and keeps jumping. Ledger does not look at it. She looks at you, and sips her tea, and lets the silence write the page for her.'],
      choices: [{ t: 'Go to your shift.', fx: { susp: 6 }, go: 'u_board' }],
    },
    jf_int_admit: {
      text: ['@say Ledger|A mistake. Yes. I will write *mistake*. It is a better word than the one I had.', 'The probe comes off. A minor irregularity is logged. The page stays in the file, but it is lighter.'],
      choices: [{ t: 'Go to your shift.', go: 'u_board' }],
    },
    jf_int_partner: {
      text: (s) => [`You tell her it was ${G.partnerOf(s).name}’s call, that you only went along. Ledger writes it down without surprise. People always give her someone.`, `At muster ${G.partnerOf(s).name} is called to Level 4. They look at you on the way out. They know.`],
      choices: [{ t: 'Go to your shift.', go: 'u_board' }],
    },

    jf_burn: {
      title: 'Your JURY file',
      text: (s) => [`@doc JURY — INTERNAL FILE · ${G.desig(s)}\n\n${active(s).slice(-4).map(pageLine).join('\n\n')}`, '@sys Choose a page. Each kind of evidence disappears its own way. If you are caught, the attempt becomes a page of its own.'],
      choices: (s) =>
        active(s)
          .slice(-4)
          .map((e) => {
            const k = KINDS[e.kind];
            const diff = Math.max(0, k.diff + e.w - (s.div === 'GRID' && (e.kind === 'lantern' || e.kind === 'log') ? 15 : 0));
            return { t: `${k.how}: day ${e.day}${e.where ? ', ' + e.where : ''}.`, fx: (st) => ((J(st).target = e.id), (J(st).burnDay = st.day), null), check: { skill: k.skill, diff, pass: 'jf_burn_ok', fail: 'jf_burn_bad' } };
          })
          .concat(
            active(s)
              .filter((e) => KINDS[e.kind].pay)
              .slice(-1)
              .map((e) => ({ t: `Pay the witness from day ${e.day}: ${e.w * 2} tokens.`, lock: (st) => (st.tokens < e.w * 2 ? 'Not enough tokens' : null), fx: (st) => ((J(st).target = e.id), (J(st).burnDay = st.day), { tokens: -e.w * 2 }), go: 'jf_burn_ok' }))
          )
          .concat([{ t: 'Leave it.', go: 'u_board' }]),
    },
    jf_burn_ok: {
      enter: (s) => {
        const e = J(s).ev.find((x) => x.id === J(s).target);
        e.st = 'burned';
        G.fx(s, { susp: -e.w });
      },
      text: (s) => {
        const e = J(s).ev.find((x) => x.id === J(s).target);
        return [
          e.kind === 'lantern' ? 'Eleven minutes of archive become eleven minutes of static, logged as a collar-motor fault. Nobody will ever look at a fault.' : e.kind === 'witness' ? 'The witness remembers it differently now. They are very sure. They will sign whatever says so.' : e.kind === 'informant' ? 'You put two contradictory tips under the informant’s code in one week. JURY stops trusting their reports, including the old ones.' : 'The log line is still there. It just says something else now, in the same font, with the same timestamp.',
          '@sys One page of your file is missing.',
        ];
      },
      choices: [{ t: 'Back to the board.', go: 'u_board' }],
    },
    jf_burn_bad: {
      text: ['Halfway through, you hear the cabinet’s second lock, the one you did not know about, click shut behind you. Somebody will have logged that too.'],
      choices: [{ t: 'Back to the board.', fx: { susp: 5 }, go: 'u_board' }],
    },
  });

  /* ---------------------------------------------------------- dossier */
  G.sideTop = G.sideTop || [];
  G.sideTop.push((s) => {
    const j = J(s);
    if (s.phase !== 'union' || !j.met) return '';
    if (!j.open || !G.jfAccess(s))
      return `<section class="jfile"><h3>JURY file</h3><div class="kv"><span>Investigator</span><b>"Ledger"</b></div><div class="sub">Your file is open. You have not seen it.</div></section>`;
    const pct = G.clamp(s.susp, 0, 100);
    const pages = j.ev.slice(-6).reverse();
    return `<section class="jfile"><h3>JURY file</h3><div class="kv"><span>Case strength</span><b class="${pct >= 60 ? 'warn' : ''}">${pct >= 80 ? 'Critical' : pct >= 60 ? 'Strong' : pct >= 30 ? 'Building' : 'Thin'}</b></div><div class="bar jf"><span style="width:${pct}%"></span></div>
      ${pages.map((e) => `<div class="jf-page ${e.st}"><b>Day ${e.day} · ${KINDS[e.kind].name}</b>${e.what ? `<small>“${e.what}”</small>` : ''}<i>${e.st === 'active' ? 'ACTIVE' : e.st === 'cold' ? 'COLD' : 'MISSING'}</i></div>`).join('')}</section>`;
  });

  G.addCodex({
    jfile: {
      title: 'Internal files',
      body: `<p>JURY's internal-files section keeps a file on every unit. Most are thin. A file grows by pages: Lantern footage, witness statements, informant reports, access logs. Each page carries a day and a line describing what the unit did.</p>
      <p>The investigating officer for District 5 is a JURY Squadron Leader known as <i>Ledger</i>. Units who have been interviewed by Ledger describe the interview as polite. Some of them describe it as the most frightening hour of their service.</p>
      <p>Files are not destroyed. Pages, occasionally, go missing.</p>`,
    },
  });
  G.CODEX_GROUPS.find((g) => g.title === 'Service record').ids.push('jfile');
})();
