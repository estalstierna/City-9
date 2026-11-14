/* PROTECTION TEAM — your own squad from grade 03 upward.
   Mixed: people from your history (Rook, Wick, Tomas, Vesna) plus units assigned to you.
   Each member has a trait (a small bonus to one skill and an opinion about how you work),
   loyalty to you, and a status. They can be hurt, transferred, file statements against you,
   cover for you — and, in scenes marked RISK, die. A replacement arrives the next morning. */
(function () {
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  const TRAITS = {
    steady: { label: 'Steady', skill: 'authority', likes: 'loyal', note: 'never raises the voice; crowds calm down around them' },
    hothead: { label: 'Hothead', skill: 'melee', likes: 'risk', note: 'first through the door, first to the baton' },
    medic: { label: 'Medic', skill: 'medical', likes: 'mercy', note: 'a HELIX washout who still carries biogel' },
    book: { label: 'By the book', skill: 'comms', likes: 'loyal', note: 'writes everything down; the kind JURY likes' },
    eyes: { label: 'Eyes', skill: 'perception', likes: null, note: 'quiet, and sees everything' },
    soft: { label: 'Soft', skill: 'deception', likes: 'mercy', note: 'too gentle for the street, and good at hiding it' },
  };
  G.SQUAD_TRAITS = TRAITS;

  /* new units — names are the nicknames the precinct gives them */
  const POOL = [
    { name: '"Salt"', rank: '04', trait: 'steady', bio: 'An ex-dock worker in his forties who joined late. He hums under the mask.' },
    { name: '"Pike"', rank: '03', trait: 'hothead', bio: 'Young, fast, and proud of both. Keeps a tally of stops on the inside of his locker door.' },
    { name: '"Ember"', rank: '04', trait: 'medic', bio: 'Washed out of HELIX for treating a citizen before a unit. Still carries the kit.' },
    { name: '"Ledger"', rank: '03', trait: 'book', bio: 'Files every report in triplicate. Has a cousin on Level 4 and mentions it.' },
    { name: '"Hush"', rank: '04', trait: 'eyes', bio: 'Says almost nothing. Noticed your bootlace was untied from across the muster hall.' },
    { name: '"Moth"', rank: '05', trait: 'soft', bio: 'Nineteen. Joined for the rations, like most. Shares them, unlike most.' },
    { name: '"Cinder"', rank: '03', trait: 'hothead', bio: 'Survived a 404 sweep with SPEAR and was sent back to UNION afterwards. Nobody says why.' },
    { name: '"Quill"', rank: '04', trait: 'book', bio: 'Former records clerk. Reads designations off shoulders faster than the scanner.' },
  ];

  const ensure = (s) => (s.squad = s.squad || { formed: false, members: [], n: 0, news: [], last: -1 });
  const active = (s) => ensure(s).members.filter((m) => m.status === 'active');
  const present = (s) => ensure(s).members.filter((m) => m.status === 'active' || m.status === 'hurt');
  G.squadActive = active;

  function make(s, base) {
    const sq = ensure(s);
    const m = Object.assign({ id: ++sq.n, loyal: 45, status: 'active', until: 0, since: s.day, uid: String(rint(10000, 99999)) }, base);
    sq.members.push(m);
    return m;
  }
  function newUnit(s) {
    const used = ensure(s).members.map((m) => m.name);
    const free = POOL.filter((p) => !used.includes(p.name));
    return make(s, Object.assign({}, pick(free.length ? free : POOL)));
  }

  /* who from your story can stand in your team */
  function known(s) {
    const out = [];
    const above = (r) => G.rankIdx(s.rank) > G.rankIdx(r);
    if (s.div === 'JURY' && s.rel.vesna !== undefined && s.rel.vesna > -30) out.push({ key: 'vesna', name: 'Vesna', rank: '02', trait: 'book', bio: 'Your partner from the Leak. She files everything — including you.', loyal: 40 + Math.round((s.rel.vesna || 0) / 3) });
    if ((s.div === 'UNION' || !s.div) && s.rel.rook !== undefined && !s.flags.rook_amputated && above('02')) out.push({ key: 'rook', name: '"Rook"', rank: '02', trait: 'steady', bio: 'Your old field trainer, now in your team. He finds this funnier than you do.', loyal: 45 + Math.round((s.rel.rook || 0) / 3) });
    if (s.div === 'UNION' && s.rel.wick !== undefined && !s.flags.wick_dead && !s.flags.wick_alive) out.push({ key: 'wick', name: '"Wick"', rank: '05', trait: 'eyes', bio: 'Your trainee from the Quota. He walks a half-step behind you, still.', loyal: 45 + Math.round((s.rel.wick || 0) / 3) });
    const dc = G.DIV_CAST && G.DIV_CAST[s.div];
    if (dc && dc.partner && s.rel[dc.partner.key] !== undefined && s.rel[dc.partner.key] > -30 && !s.flags[dc.partner.key + '_lost'])
      out.push({ key: dc.partner.key, name: dc.partner.squadName, rank: dc.partner.rank, trait: dc.partner.trait, bio: dc.partner.bio, loyal: 45 + Math.round((s.rel[dc.partner.key] || 0) / 3) });
    if (s.rel.tomas !== undefined && !s.flags.tomas_gone && s.rel.tomas > -20) out.push({ key: 'tomas', name: 'Tomas Vey', rank: '04', trait: 'soft', bio: 'Your friend from training. Still owes you, or you owe him; neither of you is sure any more.', loyal: 50 + Math.round((s.rel.tomas || 0) / 3) });
    return out;
  }

  G.formSquad = (s) => {
    const sq = ensure(s);
    if (sq.formed) return;
    sq.formed = true;
    sq.formedDay = s.day;
    known(s)
      .slice(0, 2)
      .forEach((k) => make(s, k));
    while (active(s).length < 3) newUnit(s);
    G.unlock(s, 'squad');
  };

  /* assigned units wear their division's generic portrait: enlisted (05–01) or officer (OfC+). VEIL has none. */
  const UNIT_DIVS = ['union', 'helix', 'jury', 'razor', 'spear', 'vector', 'grid'];
  const unitImg = (s, m) => {
    const d = (s.div || 'UNION').toLowerCase();
    const div = UNIT_DIVS.includes(d) ? d : 'union';
    const off = G.rankIdx(m.rank) >= G.rankIdx('OfC');
    return `unit-${div}-${off ? 'ofc' : '04'}`;
  };
  G.unitImg = unitImg;
  const face = (m) => (m.key && G.PEOPLE[m.key] && G.PEOPLE[m.key].img ? `assets/img/portraits/${G.PEOPLE[m.key].img}-thumb.webp` : `assets/img/portraits/${unitImg(G.state(), m)}-thumb.webp`);
  const portrait = (m) => (m.key && G.PEOPLE[m.key] && G.PEOPLE[m.key].img ? `assets/img/portraits/${G.PEOPLE[m.key].img}.webp` : `assets/img/portraits/${unitImg(G.state(), m)}.webp`);
  const loyalWord = (v) => (v >= 75 ? 'Devoted' : v >= 55 ? 'Loyal' : v >= 35 ? 'Steady' : v >= 18 ? 'Doubtful' : 'Hostile');
  G.squadFace = face;

  /* the member who stands next to you: the most loyal active one */
  G.squadPartner = (s) => {
    const a = s.squad && s.squad.formed ? active(s) : [];
    if (!a.length) return null;
    const m = a.slice().sort((x, y) => y.loyal - x.loyal)[0];
    return { key: m.key || null, name: m.name.replace(/"/g, ''), rel: m.loyal, member: m };
  };

  /* +6 per active member whose trait matches the skill, at most +12 */
  G.chanceMods.push((s, skill) => {
    if (!s.squad || !s.squad.formed || s.phase !== 'union') return 0;
    return Math.min(12, active(s).filter((m) => TRAITS[m.trait].skill === skill).length * 6);
  });

  /* how the team reads your choices */
  const HARSH = /AMPUTATE|BRUTAL|BURN/;
  G.onChoose.push((s, c) => {
    if (!s.squad || !s.squad.formed || s.phase !== 'union' || !c.tagCls) return;
    const kind = HARSH.test(c.tag || '') ? 'harsh' : c.tagCls;
    if (!['loyal', 'mercy', 'risk', 'harsh'].includes(kind)) return;
    active(s).forEach((m) => {
      const t = TRAITS[m.trait];
      let d = 0;
      if (kind === 'harsh') d = m.trait === 'hothead' ? 2 : m.trait === 'soft' || m.trait === 'medic' ? -6 : -2;
      else if (t.likes === kind) d = 3;
      else if ((t.likes === 'loyal' && kind === 'mercy') || (t.likes === 'mercy' && kind === 'loyal')) d = -2;
      m.loyal = G.clamp(m.loyal + d, 0, 100);
      if (m.trait === 'book' && kind === 'mercy' && m.loyal < 25 && Math.random() < 0.4) {
        G.discipline(s, 'minor', `Statement filed by ${m.name.replace(/"/g, '')}: leniency on duty`);
        m.loyal = Math.max(0, m.loyal - 5);
      }
    });
  });

  /* someone in the team takes the hit. risk=true allows death. */
  G.squadHit = (s, risk, where) => {
    const a = active(s);
    if (!a.length) return null;
    const m = pick(a);
    const medic = a.some((x) => x !== m && x.trait === 'medic');
    const r = Math.random();
    let out = 'hurt';
    if (risk && r < (medic ? 0.04 : 0.14)) out = 'dead';
    else if (r < (medic ? 0.12 : 0.24)) out = 'transferred';
    if (out === 'hurt') {
      m.status = 'hurt';
      m.until = s.day + rint(2, 4);
    } else m.status = out;
    m.lost = where || '';
    ensure(s).news.push({ id: m.id, out, day: s.day });
    s.mem.squadHit = { name: m.name, out };
    if (out === 'dead') G.fx(s, { cons: -4 });
    return { member: m, out };
  };

  /* mornings: the hurt come back, the lost are replaced, the unhappy ask to leave */
  G.extend('u_board', {
    before: (s) => {
      if (!s.squad || !s.squad.formed || s.squad.last === s.day) return;
      const sq = s.squad;
      sq.last = s.day;
      const lines = [];
      sq.members.forEach((m) => {
        if (m.status === 'hurt' && s.day >= m.until) {
          m.status = 'active';
          lines.push(`${m.name} is back from the HELIX ward, moving carefully.`);
        }
        if (m.status === 'active' && m.loyal < 10 && Math.random() < 0.5) {
          m.status = 'transferred';
          m.lost = 'requested a transfer';
          lines.push(`${m.name} has requested a transfer out of your team. It was granted before you heard about it.`);
        }
      });
      const gone = sq.members.filter((m) => (m.status === 'dead' || m.status === 'transferred') && !m.replaced);
      gone.forEach((m) => {
        m.replaced = true;
        const n = newUnit(s);
        lines.push(`A new unit is waiting at your locker this morning: ${n.name}, ${n.rank}. ${n.bio}`);
      });
      s.mem.squadLines = lines;
    },
    text: (lines, s) => {
      if (s.mem.squadLines && s.mem.squadLines.length) lines.splice(Math.max(0, lines.length - 1), 0, ...s.mem.squadLines);
      s.mem.squadLines = [];
      return lines;
    },
  });

  /* teams form at grade 03 — chapter four makes it official; older saves get one on arrival */
  G.extend('u_board', {
    before: (s) => {
      if (s.phase === 'union' && !(s.squad && s.squad.formed) && s.div && G.rankIdx(s.rank) >= G.rankIdx('03') && (s.c3 && s.c3.done)) {
        G.formSquad(s);
        return 'sq_formed';
      }
    },
  });

  /* evenings with the team: a vignette per member, chosen by who they are */
  const VIGNETTES = {
    steady: [
      (m) => [`${m.name} talks about the docks before the war: the cranes, the gulls, a canteen that served soup with real fish in it. He tells it like a report. It is the most beautiful thing you have heard in a month.`],
      (m) => [`${m.name} asks you, very calmly, how you decide who to stop. He is not judging. He wants to know if there is a way to do it that he can live with.`],
    ],
    hothead: [
      (m) => [`${m.name} shows you the tally on the inside of his locker door. It has gone up. He wants you to be impressed, and he wants you to tell him to stop, and he does not know which.`],
      (m) => [`${m.name} gets into a shoving match with a JURY unit over a seat in the mess. You get between them before it becomes a statement.`],
    ],
    medic: [
      (m) => [`${m.name} restitches a cut on your forearm you had not noticed, without asking, and tells you which citizen in Stack 22 has a child with a fever nobody has reported.`],
      (m) => [`${m.name} is counting biogel vials under the table. There are more than were issued. You do not ask where the extra ones came from. ${m.name} does not offer.`],
    ],
    book: [
      (m) => [`${m.name} reads you a line from your own last report and asks, politely, whether it is accurate. It is a test. You both know it is a test.`],
      (m) => [`${m.name} has a cousin on Level 4 who says JURY is reviewing every team lead in D5 this month. ${m.name} says this as if it were weather.`],
    ],
    eyes: [
      (m) => [`${m.name} says, without looking up from the cards: “The man who sells batteries on Bazaar Row has started wearing a second watch. It was his brother’s. His brother was relocated in spring.” Then nothing else all evening.`],
      (m) => [`${m.name} has noticed that the scanner drone over Stack 9 flies the same loop every night except Thursdays. ${m.name} wants you to know that someone else has noticed too.`],
    ],
    soft: [
      (m) => [`${m.name} has been leaving half a ration bar on the same windowsill in Stack 14 every morning. It is always gone by noon. ${m.name} asks you not to put it in a report.`],
      (m) => [`${m.name} asks if you ever think about the people on your case files once they are off the street. Then laughs, too quickly, and changes the subject.`],
    ],
  };

  G.addScenes({
    sq_formed: {
      checkpoint: true,
      title: 'Your protection team',
      text: (s) => {
        const sup = G.superiorOf ? G.superiorOf(s).name : 'Your SqL';
        return [
          `@say ${sup}|You have a team now. Three units. They ride with you, they stand with you, and what they do is on your file as much as theirs.`,
          ...active(s).flatMap((m) => [`@portrait ${portrait(m)}|${m.name} — ${m.rank}`, `**${m.name}**, ${m.rank}. ${m.bio} *(${TRAITS[m.trait].label}: ${TRAITS[m.trait].note}.)*`]),
          '@sys Your team is listed in the Dossier. Each member helps with one kind of check, has an opinion about how you work, and can be hurt, transferred or worse. The most loyal one stands next to you as your partner, and is the witness on your reports.',
        ];
      },
      choices: [{ t: 'Muster.', go: 'u_board' }],
    },

    ev_team: {
      title: 'The precinct mess — your team',
      enter: (s) => {
        const a = active(s);
        const m = pick(a);
        s.mem.vig = { id: m.id, i: Math.floor(Math.random() * VIGNETTES[m.trait].length) };
      },
      text: (s) => {
        const m = s.squad.members.find((x) => x.id === s.mem.vig.id);
        return [
          'Your team takes the corner table in the mess, the one under the tally on the wall. Masks off. Nobody looks at anyone else’s face for long; it is still strange.',
          `@portrait ${portrait(m)}|${m.name}`,
          ...VIGNETTES[m.trait][s.mem.vig.i](m),
        ];
      },
      choices: (s) => {
        const m = s.squad.members.find((x) => x.id === s.mem.vig.id);
        const bump = (d) => (st) => {
          const mm = st.squad.members.find((x) => x.id === st.mem.vig.id);
          mm.loyal = G.clamp(mm.loyal + d, 0, 100);
          return null;
        };
        return [
          { t: 'Listen. Say very little. Let them have the evening.', fx: (st) => (bump(5)(st), { hp: 5 }), go: 'u_night' },
          { t: 'Tell them something true about yourself.', check: { skill: 'authority', diff: 0, pass: 'u_night', fail: 'u_night', okFx: (st) => (bump(10)(st), { cons: 2 }), failFx: bump(-2) } },
          { t: `Remind ${m.name} who leads this team.`, tag: 'COLD', fx: (st) => (bump(-6)(st), { lp: 1 }), go: 'u_night' },
        ];
      },
    },
  });

  /* the team as an evening option */
  G.extend('u_evening', {
    choices: (list, s) => {
      if (s.squad && s.squad.formed && active(s).length) list.splice(Math.max(0, list.length - 1), 0, { t: 'Eat with your team in the mess.', tag: 'TEAM', tagCls: 'duty', go: 'ev_team' });
      return list;
    },
  });

  /* scenes where the team can get hurt */
  const HITS = {
    raid_trap_hurt: [false, 'the stairwell fire'],
    d_rail_ambush: [true, 'the rail yard ambush'],
    c3_hold_hurt: [true, 'the spillway'],
    raid_breach_bad: [false, 'a breached door'],
  };
  Object.keys(HITS).forEach((id) =>
    G.extend(id, {
      after: (s) => {
        if (s.squad && s.squad.formed && Math.random() < 0.6) G.squadHit(s, HITS[id][0], HITS[id][1]);
      },
      text: (lines, s) => {
        const h = s.mem.squadHit;
        if (h && s.squad && s.squad.formed) {
          lines.push(h.out === 'dead' ? `@radio 11-99. ${h.name} is down. ${h.name} is not getting up.` : h.out === 'transferred' ? `${h.name} goes down hard and does not get up for a long time. HELIX will not send ${h.name} back to the street.` : `${h.name} takes a hit beside you. HELIX will have ${h.name} for a few days.`);
          s.mem.squadHit = null;
        }
        return lines;
      },
    })
  );

  /* side panel */
  G.sideExtras = G.sideExtras || [];
  G.sideExtras.push((S) => {
    if (!S.squad || !S.squad.formed) return '';
    return `<section><h3>Protection team</h3>${S.squad.members
      .filter((m) => m.status === 'active' || m.status === 'hurt')
      .map((m) => `<div class="kv contact"><img class="face" src="${face(m)}" alt=""><span>${m.name}<small>${m.rank} · ${TRAITS[m.trait].label}${m.status === 'hurt' ? ' · HELIX ward' : ''}</small></span><b>${loyalWord(m.loyal)}</b></div>`)
      .join('')}${
      S.squad.members.some((m) => m.status === 'dead')
        ? `<div class="sub">Lost: ${S.squad.members
            .filter((m) => m.status === 'dead')
            .map((m) => m.name)
            .join(', ')}</div>`
        : ''
    }</section>`;
  });

  G.addCodex({
    squad: {
      title: 'Protection teams',
      body: `<p>From grade 03 a unit may lead a <b>protection team</b> (PT) of three. The team lead is responsible for the team's conduct; a team member's statement carries weight at any hearing.</p>
      <table>
        <tr><td>Steady</td><td>Authority. Likes procedure.</td></tr>
        <tr><td>Hothead</td><td>Melee & Restraint. Likes risk; does not mind force.</td></tr>
        <tr><td>Medic</td><td>Field Medicine. Likes mercy; makes injuries in the team less deadly.</td></tr>
        <tr><td>By the book</td><td>Radio & Protocol. Likes procedure; may file statements about leniency.</td></tr>
        <tr><td>Eyes</td><td>Perception. Has no opinion that anyone has heard.</td></tr>
        <tr><td>Soft</td><td>Deception. Likes mercy; hates cruelty.</td></tr>
      </table>
      <p>The most loyal member serves as the lead's partner and witness. Members can be hurt, transferred, or lost in action; replacements are assigned the next morning.</p>`,
    },
  });
})();
