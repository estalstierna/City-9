/* DIVISION TRANSFER — at grade 01 (the last grade before Elite) a unit may apply to change division.
   The application is an exam set by the target division: a written question, a practical in that
   division's own minigame, and an interview with its officer. Three points of four pass.
   Pass: you change division (rank, file and history kept; a new officer, partner and team).
   Fail: that division will not consider you again for 14 days. One application per day. */
(function () {
  const DIVS = ['UNION', 'JURY', 'HELIX', 'RAZOR', 'SPEAR', 'VECTOR', 'GRID'];
  const BLOCK_DAYS = 14;
  const REQ = {
    UNION: () => null,
    HELIX: (s) => (s.skills.medical < 3 ? 'Requires Field Medicine 3' : null),
    JURY: (s) => (s.skills.authority < 3 ? 'Requires Authority 3' : s.lp < 10 ? 'Requires Loyalty rating +10' : null),
    RAZOR: (s) => (s.skills.firearms < 3 ? 'Requires Firearms 3' : s.lp < 15 ? 'Requires Loyalty rating +15' : null),
    SPEAR: (s) => (s.skills.firearms < 3 ? 'Requires Firearms 3' : s.skills.fitness < 3 ? 'Requires Conditioning 3' : null),
    VECTOR: (s) => (s.skills.medical < 2 ? 'Requires Field Medicine 2' : s.skills.fitness < 2 ? 'Requires Conditioning 2' : null),
    GRID: (s) => (s.skills.comms < 3 ? 'Requires Radio & Protocol 3' : null),
  };
  const PITCH = {
    UNION: 'the street, the Stacks, the people you were sent to keep in line',
    JURY: 'Level 4, the files, the policing of your own',
    HELIX: 'the white band, the ward, the three days',
    RAZOR: 'the gold band, the hardpoints, the people who matter',
    SPEAR: 'the 404 zones, the drains, the doors nobody else opens',
    VECTOR: 'the sealed suits, the labs, the floor without a number',
    GRID: 'the conduits, the fields, every light in the city',
  };
  const QUIZ = {
    UNION: { q: 'A citizen at a ration hatch presents a dead man’s card. What is the violation?', a: 'Theft — Level 3', w: ['Loitering — Level 1', 'Rebel conspiracy — Level 6', 'Nothing; the card is valid'] },
    JURY: { q: 'In an interrogation, which approach can produce a FALSE confession from an innocent subject?', a: 'Enough fear', w: ['Enough trust', 'Enough insight', 'Listening'] },
    HELIX: { q: 'Doctrine for HELIX triage, in order?', a: 'Units, then VIPs, then citizens if ordered', w: ['The worst injured first', 'Citizens, then units', 'VIPs, then units, then citizens'] },
    RAZOR: { q: 'A pass is valid but the box it covers hums. RAZOR doctrine?', a: 'Open it, or call it up the chain — never pass it unseen', w: ['The pass is the box', 'Send it to VECTOR', 'Drop the field and wave it through'] },
    SPEAR: { q: 'A voice from behind the 404 wall calls for help, the same words over and over. Doctrine?', a: 'Log it with the voice code and do not answer', w: ['Answer and go over', 'Call HELIX', 'Shoot at the wall'] },
    VECTOR: { q: 'What is the first stage of the necrotic infection called in the specimen file?', a: 'Early', w: ['Mimic', 'Bloom', 'Virome'] },
    GRID: { q: 'In the winter allocation, which gets the dam’s output first?', a: 'The Spire', w: ['The Nexus', 'The Stacks', 'The Works'] },
  };
  const PRAC = {
    UNION: { type: 'crowd', opts: (s) => G.crowdOpts(s, { block: 'plaza', title: 'UNION practical — Plaza 5', seconds: 35 }) },
    JURY: { type: 'tail', opts: { title: 'JURY practical — surveillance', steps: 6 } },
    HELIX: { type: 'triage', opts: { title: 'HELIX practical — triage', count: 5, seconds: 35 } },
    RAZOR: { type: 'watch', opts: { title: 'RAZOR practical — hardpoint watch', need: 4, seconds: 35 } },
    SPEAR: { type: 'breach', opts: { title: 'SPEAR practical — the kill house', doors: 5 } },
    VECTOR: { type: 'sample', opts: { title: 'VECTOR practical — sampling', target: 4 } },
    GRID: { type: 'circuit', opts: { title: 'GRID practical — field generator', seconds: 45 } },
  };
  const SKILL = { UNION: 'authority', JURY: 'perception', HELIX: 'medical', RAZOR: 'perception', SPEAR: 'firearms', VECTOR: 'medical', GRID: 'comms' };
  const chiefOf = (d) => {
    if (d === 'UNION') return { name: 'Granite', img: 'granite' };
    if (d === 'JURY') return { name: 'Magistrate', img: 'magistrate' };
    const c = G.DIV_CAST && G.DIV_CAST[d];
    return c ? { name: c.chief.short, img: c.chief.img } : { name: d + ' officer', img: null };
  };
  const X = (s) => s.xfer;
  const blockedUntil = (s, d) => (s.flags['xfer_block_' + d] || 0);

  /* on the duty board, for grade 01 */
  G.extend('u_board', {
    choices: (list, s) => {
      if (s.phase !== 'union' || s.rank !== '01' || !s.div || s.mem.xferDay === s.day) return list;
      list.push({ t: '**Apply for a transfer to another division.** An exam, set by them.', tag: 'TRANSFER', tagCls: 'duty', go: 'xfer_pick' });
      return list;
    },
  });

  const scenes = {
    xfer_pick: {
      title: 'Transfer application',
      enter: (s) => G.unlock(s, 'transfer'),
      text: (s) => [
        `@say ${G.superiorOf(s).name}|A transfer, at 01. You know what it costs. You start again with people who do not know you, and I lose a unit I trained. Which division?`,
        '@sys Each division sets its own exam: a written question, a practical, and an interview. Fail, and that division will not consider you again for fourteen days.',
      ],
      choices: (s) =>
        DIVS.filter((d) => d !== s.div)
          .map((d) => ({
            t: `**${d}** — ${PITCH[d]}.`,
            lock: (st) => REQ[d](st) || (blockedUntil(st, d) > st.day ? `Refused — may reapply on day ${blockedUntil(st, d)}` : null),
            fx: (st) => ((st.xfer = { to: d, from: st.div, pts: 0, q: null, prac: null, int: null }), (st.mem.xferDay = st.day), (st.time = 'Day'), null),
            go: 'xfer_q',
          }))
          .concat([{ t: 'Not today.', go: 'u_board' }]),
    },
    xfer_q: {
      title: (s) => `${X(s).to} transfer exam — written`,
      text: (s) => {
        const c = chiefOf(X(s).to);
        return [c.img ? `@portrait assets/img/portraits/${c.img}.webp|${c.name}` : null, `${c.name} pushes a single sheet across the desk.`, `@doc ${QUIZ[X(s).to].q}`];
      },
      choices: (s) => {
        const q = QUIZ[X(s).to];
        return G.shuffle([q.a, ...q.w]).map((a) => ({ t: a, fx: (st) => ((st.xfer.q = a === q.a), a === q.a && (st.xfer.pts += 1), null), go: 'xfer_p_' + X(s).to }));
      },
    },
    xfer_int: {
      title: (s) => `${X(s).to} transfer exam — interview`,
      text: (s) => [`@say ${chiefOf(X(s).to).name}|One question. Why leave ${X(s).from} for us?`],
      choices: (s) => [
        { t: '“Because I am better at your work than at theirs.”', check: { skill: SKILL[X(s).to], diff: 5, pass: 'xfer_res', fail: 'xfer_res', okFx: (st) => ((st.xfer.pts += 1), (st.xfer.int = true), null) } },
        { t: '“Because the Union is better served if I am.”', tag: 'BY THE BOOK', tagCls: 'loyal', check: { skill: 'authority', diff: 10, pass: 'xfer_res', fail: 'xfer_res', okFx: (st) => ((st.xfer.pts += 1), (st.xfer.int = true), null) } },
        { t: 'Tell the truth about why.', tag: 'RISK', tagCls: 'risk', fx: (st) => ((st.xfer.int = st.cons >= 55 || st.lp >= 20), st.xfer.int && (st.xfer.pts += 1), null), go: 'xfer_res' },
      ],
    },
    xfer_res: {
      title: 'Transfer board',
      enter: (s) => {
        const x = X(s);
        x.pass = x.pts >= 3;
        if (x.pass) {
          x.oldSquad = s.squad ? s.squad.members.filter((m) => m.status === 'active' || m.status === 'hurt').map((m) => m.name) : [];
          s.div = x.to;
          if (s.squad && s.squad.formed) {
            s.squad.members.forEach((m) => {
              if (m.status === 'active' || m.status === 'hurt') (m.status = 'transferred'), (m.lost = 'stayed in ' + x.from), (m.replaced = true);
            });
            s.squad.formed = false;
            G.formSquad(s);
          }
          const dc = G.DIV_CAST && G.DIV_CAST[x.to];
          if (dc) ['chief', 'partner'].forEach((r) => s.rel[dc[r].key] === undefined && (s.rel[dc[r].key] = r === 'partner' ? 20 : 0));
          if (x.to === 'JURY' && s.rel.magistrate === undefined) s.rel.magistrate = 0;
          G.unlock(s, x.to.toLowerCase());
          G.fx(s, { merit: 5 });
          s.flags['xfer_to_' + x.to] = s.day;
        } else {
          s.flags['xfer_block_' + x.to] = s.day + BLOCK_DAYS;
          G.fx(s, { merit: -3 });
        }
      },
      text: (s) => {
        const x = X(s);
        const lines = [`@doc TRANSFER EXAM — ${G.short(s)} → ${x.to}\nWRITTEN: ${x.q ? 'PASS' : 'FAIL'}\nPRACTICAL: ${x.prac ? 'PASS (2)' : 'FAIL'}\nINTERVIEW: ${x.int ? 'PASS' : 'FAIL'}\nTOTAL: ${x.pts} / 4 — PASS AT 3`];
        if (x.pass) {
          lines.push(
            `@img assets/img/uniform-${x.to.toLowerCase()}.webp|${x.to} — your new uniform`,
            `@say ${chiefOf(x.to).name}|Welcome to ${x.to}. Your armband is in the stores. Your old one goes back to ${x.from}.`,
            x.oldSquad && x.oldSquad.length ? `Your old team — ${x.oldSquad.join(', ')} — stays in ${x.from}. ${x.oldSquad[0]} shakes your hand in the locker room and does not let go for a moment too long.` : null,
            `@doc ${G.desig(s)}`
          );
        } else lines.push(`@say ${chiefOf(x.to).name}|Not good enough. Not yet. ${x.to} will not read your name again for ${BLOCK_DAYS} days.`, `@sys You may reapply to ${x.to} on day ${s.flags['xfer_block_' + x.to]}.`);
        return lines;
      },
      choices: [{ t: 'Evening.', go: 'u_duty_end' }],
    },
  };
  DIVS.forEach((d) => {
    scenes['xfer_p_' + d] = {
      title: `${d} transfer exam — practical`,
      text: [`@sys The practical. ${d} wants to see you do the work.`],
      mini: { type: PRAC[d].type, opts: PRAC[d].opts, pass: 'xfer_p_ok', fail: 'xfer_p_bad', skill: SKILL[d], diff: 15 },
    };
  });
  scenes.xfer_p_ok = { enter: (s) => ((s.xfer.prac = true), (s.xfer.pts += 2), 'xfer_int'), text: [] };
  scenes.xfer_p_bad = { enter: (s) => ((s.xfer.prac = false), 'xfer_int'), text: [] };
  G.addScenes(scenes);

  G.addCodex({
    transfer: {
      title: 'Division transfers',
      body: `<p>A unit of grade 01 may apply to change division. The division applied to sets the exam: a written question on its doctrine, a practical in its own work, and an interview with its officer. Three of four points pass. A unit who fails is not considered by that division again for ${BLOCK_DAYS} days.</p>
      <p>A transfer keeps the unit's grade, file and history. It does not keep their team.</p>`,
    },
  });
  G.CODEX_GROUPS.find((g) => g.title === 'Service record').ids.push('transfer');
})();
