/* CAREER — making rank matter.
   - Every grade unlocks something real (G.RANK_PERKS): pay, kit that changes the odds, a bigger
     team, private quarters, more health, command authority.
   - A promotion opens a ceremony card on the next board or evening: new insignia, what it unlocks,
     and where you now stand in your division's roster.
   - The officer ranks are long and hard: OfC after chapter four, SqL after chapter six, DvL after
     chapter eight, each through a stricter board. (Chapters past four are not written yet, so for
     now SqL and DvL are goals on the roster.)
   - A ROSTER tab lists every unit in your division by rank, with you among them. */
(function () {
  /* ================================================================ PERKS */
  const PERKS = {
    '05': ['Stun baton and standard kit', 'Unit rations: three meals a day'],
    '04': ['USP-Match issued to you personally: Firearms checks +5', 'Pay +1 token per shift'],
    '03': ['Transfer to a division of your choice', 'Pay +2 tokens per shift'],
    '02': ['Dependants exempt from relocation', 'Private quarters: rest heals 20 instead of 10', 'Authority checks +3'],
    '01': ['MP7A1 issued: Firearms checks +10', 'Protection team grows to four', 'Authority checks +5', 'Pay +3 tokens per shift'],
    EpU: ['Plasteel mask inserts: maximum health 120', 'Command of the team in crisis: Authority checks +7', 'Pay +4 tokens per shift'],
    OfC: ['Officer crest stripe and a star', 'Protection team grows to five', 'Authority checks +10', 'Pay +6 tokens per shift', 'Your reports are no longer audited by your partner'],
    SqL: ['Command of a squadron', 'Authority checks +12', 'Pay +8 tokens per shift'],
    DvL: ['Command of the division', 'Authority checks +15', 'Pay +10 tokens per shift'],
  };
  G.RANK_PERKS = PERKS;
  const at = (s, r) => G.rankIdx(s.rank) >= G.rankIdx(r);
  const PAY = { '04': 1, '03': 2, '02': 2, '01': 3, EpU: 4, OfC: 6, SqL: 8, DvL: 10 };
  const AUTH = { '02': 3, '01': 5, EpU: 7, OfC: 10, SqL: 12, DvL: 15 };
  const best = (s, table) => Object.keys(table).reduce((v, r) => (at(s, r) ? Math.max(v, table[r]) : v), 0);

  G.chanceMods.push((s, skill) => {
    if (s.phase !== 'union') return 0;
    if (skill === 'firearms') return at(s, '01') ? 10 : at(s, '04') ? 5 : 0;
    if (skill === 'authority') return best(s, AUTH);
    return 0;
  });
  G.squadSize = (s) => (at(s, 'OfC') ? 5 : at(s, '01') ? 4 : 3);
  G.extend('u_duty_end', {
    before: (s) => {
      const p = best(s, PAY);
      if (p) G.fx(s, { tokens: p });
    },
  });
  /* teams grow with rank: a new unit reports for duty */
  G.extend('u_board', {
    before: (s) => {
      if (!s.squad || !s.squad.formed || !G.squadActive) return;
      const n = s.squad.members.filter((m) => m.status === 'active' || m.status === 'hurt').length;
      if (n < G.squadSize(s)) {
        const m = G.squadRecruit(s);
        s.mem.squadLines = (s.mem.squadLines || []).concat(`Your team grows with your rank: ${m.name}, ${m.rank}, reports to your locker this morning. ${m.bio}`);
      }
    },
  });

  /* ================================================================ OFFICER GATES */
  const discClean = (s) => !s.disc || (!s.disc.final && !s.disc.w);
  Object.assign(G.PROMO, {
    EpU: { next: 'OfC', merit: 260, board: true, gate: 'Chapter four complete · Loyalty +20 · no active strikes or final warning', if: (s) => !!(s.c4 && s.c4.done) && s.lp >= 20 && discClean(s) },
    OfC: { next: 'SqL', merit: 360, board: true, gate: 'Chapter six complete · Loyalty +30 · clean record', if: (s) => (s.chapter || 1) >= 7 && s.lp >= 30 && discClean(s) },
    SqL: { next: 'DvL', merit: 480, board: true, gate: 'Chapter eight complete · Loyalty +35 · never demoted · suspicion low', if: (s) => (s.chapter || 1) >= 9 && s.lp >= 35 && discClean(s) && !(s.disc && s.disc.demotions) && s.susp < 30 },
  });
  const GATES = {
    '05': 'Field evaluation (25 merit)',
    '04': 'Field evaluation (60 merit), then a division',
    '03': 'Your division’s chapter-two story',
    '02': 'Chapter three, or a promotion board (130 merit)',
    '01': 'Chapter four, or a promotion board (190 merit)',
  };

  /* ================================================================ CEREMONY */
  const oldPromote = G.promote;
  G.promote = (s, rank) => {
    const before = s.rank;
    oldPromote(s, rank);
    if (s.rank !== before && G.rankIdx(s.rank) > G.rankIdx(before)) {
      s.mem.promoCard = s.rank;
      if (s.rank === 'EpU') s.maxhp = Math.max(s.maxhp, 120);
    }
  };
  const ceremony = (s) => {
    if (s.mem.promoCard && s.phase === 'union') return 'promo_card';
  };
  G.extend('u_board', { before: ceremony });
  G.extend('u_evening', { before: ceremony });

  /* ================================================================ ROSTER */
  /* deterministic per save: the same division looks the same every time you open it */
  const seeded = (seed) => () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const NICK = ['Anvil', 'Birch', 'Cobble', 'Dray', 'Ember', 'Flint', 'Gauge', 'Harrow', 'Ingot', 'Jolt', 'Keel', 'Lantern', 'Mallet', 'Nettle', 'Oxide', 'Patch', 'Quarry', 'Rivet', 'Slate', 'Tallow', 'Umber', 'Vane', 'Wicket', 'Yarrow', 'Zinc', 'Brine', 'Cinder', 'Dusk', 'Furrow', 'Grit', 'Hasp', 'Ledger', 'Moth', 'Pike', 'Quill', 'Salt', 'Sorrel', 'Thatch', 'Weir'];
  const SHAPE = { DvL: 1, SqL: 2, OfC: 4, EpU: 3, '01': 4, '02': 5, '03': 6, '04': 7, '05': 8 };
  const named = (s) => {
    const div = s.div || 'UNION';
    const out = [];
    if (div === 'UNION') out.push({ name: '"Granite"', rank: 'SqL', note: 'Your squadron leader', key: 'granite' });
    if (div === 'JURY') out.push({ name: 'The Magistrate', rank: 'DvL', note: 'Division Leader', key: 'magistrate' });
    if (div === 'UNION' && s.rel.rook !== undefined) out.push({ name: '"Rook"', rank: '02', note: s.flags.rook_amputated ? 'Amputated' : 'Your old field trainer', key: 'rook', gone: s.flags.rook_amputated });
    if (div === 'UNION' && s.rel.wick !== undefined) out.push({ name: '"Wick"', rank: '05', note: s.flags.wick_dead ? 'Deserviced, D4 yard' : s.flags.wick_alive ? 'Transferred to D2' : 'Your trainee', key: 'wick', gone: s.flags.wick_dead || s.flags.wick_alive });
    if (div === 'JURY' && s.rel.vesna !== undefined) out.push({ name: 'Vesna', rank: '02', note: 'Your partner on Level 4', key: 'vesna' });
    const dc = G.DIV_CAST && G.DIV_CAST[div];
    if (dc) {
      out.push({ name: G.PEOPLE[dc.chief.key].name, rank: 'OfC', note: 'Your officer', key: dc.chief.key });
      out.push({ name: G.PEOPLE[dc.partner.key].name, rank: dc.partner.rank, note: 'Your partner', key: dc.partner.key });
    }
    (s.squad && s.squad.members ? s.squad.members : []).forEach((m) => {
      if (out.some((o) => o.key && o.key === m.key)) return;
      out.push({ name: m.name, rank: m.rank, note: m.status === 'dead' ? `Killed in service${m.lost ? ', ' + m.lost : ''}` : m.status === 'transferred' ? `Transferred${m.lost ? ': ' + m.lost : ''}` : 'Your protection team', team: true, gone: m.status === 'dead' || m.status === 'transferred' });
    });
    return out;
  };
  G.roster = (s) => {
    const div = s.div || 'UNION';
    const rnd = seeded([...(s.uid + div)].reduce((n, c) => n * 31 + c.charCodeAt(0), 7));
    const list = named(s).map((x) => Object.assign({}, x));
    const taken = new Set(list.map((x) => x.name.replace(/"/g, '')));
    const count = (r) => list.filter((x) => x.rank === r && !x.gone).length;
    Object.keys(SHAPE).forEach((r) => {
      while (count(r) < SHAPE[r]) {
        let n;
        do n = NICK[Math.floor(rnd() * NICK.length)] + (rnd() < 0.3 ? ' ' + (2 + Math.floor(rnd() * 7)) : '');
        while (taken.has(n));
        taken.add(n);
        list.push({ name: `"${n}"`, rank: r, uid: String(10000 + Math.floor(rnd() * 89999)) });
      }
    });
    if (div === 'UNION' && !list.some((x) => x.rank === 'DvL')) list.push({ name: '"Bulwark"', rank: 'DvL', note: 'Division Leader, D5' });
    list.push({ name: s.name, rank: s.rank, you: true, note: G.desig(s) });
    const order = (x) => -G.rankIdx(x.rank);
    list.sort((a, b) => order(a) - order(b) || (a.you ? -1 : b.you ? 1 : 0));
    return list;
  };

  const RANK_ORDER = ['05', '04', '03', '02', '01', 'EpU', 'OfC', 'SqL', 'DvL'];
  const nextRank = (s) => RANK_ORDER[RANK_ORDER.indexOf(s.rank) + 1];
  const reqLine = (s) => {
    const n = nextRank(s);
    if (!n) return 'There is no higher rank in a division.';
    const p = G.PROMO[s.rank];
    if (p && p.gate) return `${p.gate} · ${p.merit} merit · officer board (pass at ${n === 'DvL' ? 7 : 6})`;
    return GATES[s.rank] || '—';
  };

  function rosterHtml(s) {
    const list = G.roster(s).filter((x) => !x.gone || x.team || x.key);
    const active = list.filter((x) => !x.gone);
    const pos = active.findIndex((x) => x.you) + 1;
    const div = s.div || 'UNION';
    const ladder = RANK_ORDER.map((r) => {
      const st = G.rankIdx(s.rank) > G.rankIdx(r) ? 'done' : s.rank === r ? 'now' : 'todo';
      return `<div class="rl-step ${st}"><b>${r}</b><small>${(PERKS[r] || [])[0] || ''}</small></div>`;
    }).join('');
    let rows = '';
    let last = null;
    list.forEach((x) => {
      if (x.rank !== last) {
        rows += `<div class="ro-rank">${G.RANK_NAMES[x.rank] || x.rank}</div>`;
        last = x.rank;
      }
      rows += `<div class="ro-row${x.you ? ' you' : ''}${x.gone ? ' gone' : ''}"><span>${x.name}${x.you ? ' <em>(you)</em>' : ''}</span><small>${x.note || `CCA.C9.D${s.district || 5}-${div}-${x.rank}-${x.uid || ''}`}</small></div>`;
    });
    const n = nextRank(s);
    const p = G.PROMO[s.rank];
    const meritBar = p ? `<div class="bar"><span style="width:${Math.min(100, (s.merit / p.merit) * 100)}%"></span></div><div class="sub">${s.merit} / ${p.merit} merit</div>` : '';
    return `<div class="ro-head"><div><b>${div}</b> · ${active.length} units</div><div>You are <b>#${pos}</b> of ${active.length}</div></div>
      <div class="rank-ladder">${ladder}</div>
      ${
        n
          ? `<div class="ro-next"><div class="ro-k">Next: ${G.RANK_NAMES[n]}</div><div class="sub">${reqLine(s)}</div>${meritBar}<ul>${(PERKS[n] || []).map((x) => `<li>${x}</li>`).join('')}</ul></div>`
          : ''
      }
      <div class="ro-k">Your rank gives you</div><ul class="ro-perks">${RANK_ORDER.filter((r) => at(s, r))
        .flatMap((r) => PERKS[r] || [])
        .map((x) => `<li>${x}</li>`)
        .join('')}</ul>
      <div class="ro-list">${rows}</div>`;
  }
  G.showRoster = () => {
    const s = G.state();
    if (!s || s.phase === 'creation' || s.phase === 'prologue') return G.openModal('Roster', '<p class="sub">You are not a unit yet.</p>', 'roster');
    G.openModal(`Roster // ${s.div || 'UNION'}`, rosterHtml(s), 'roster');
  };
  G.ICONS.roster = '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10"/><circle cx="19" cy="18" r="2"/></svg>';
  G.NAV.splice(2, 0, { id: 'roster', label: 'Roster', icon: G.ICONS.roster, act: () => G.showRoster(), if: (s) => s.phase !== 'creation' && s.phase !== 'prologue' });
  const bind = () => {
    const b = document.getElementById('btn-roster');
    if (b) b.onclick = () => G.showRoster();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();

  /* ================================================================ CEREMONY SCENE */
  G.addScenes({
    promo_card: {
      title: 'Promotion',
      enter: (s) => {
        s.mem.promoNow = s.mem.promoCard;
        s.mem.promoCard = null;
        s.mem.promoRet = s.time === 'Evening' ? 'u_evening' : 'u_board';
        s.mem.promoRetDay = s.day;
      },
      text: (s) => {
        const r = s.mem.promoNow;
        const list = G.roster(s).filter((x) => !x.gone);
        const pos = list.findIndex((x) => x.you) + 1;
        const sup = G.superiorOf ? G.superiorOf(s) : { name: 'Your officer' };
        const insignia = ['05', '04', '03', '02', '01'].includes(r) ? `${{ '05': 'one', '04': 'two', '03': 'three', '02': 'four', '01': 'five' }[r]} thin silver bar${r === '05' ? '' : 's'}` : r === 'EpU' ? 'one wide silver bar, and polished steel rings around your lenses' : r === 'OfC' ? 'one wide bar and a silver star, and a crest stripe painted down your helmet in your division’s colour' : r === 'SqL' ? 'one wide bar and two stars' : 'one wide bar and three stars';
        return [
          '@big ' + (G.RANK_NAMES[r] || r).toUpperCase(),
          `${sup.name} hands you a new armband in front of the muster: ${insignia}. Somebody at the back starts to clap and thinks better of it.`,
          r === 'OfC' ? 'The crest stripe goes on that night, in the paint shop, under a lamp. You watch the brush the whole time. Officers are not units. Units watch you differently by morning.' : r === 'EpU' ? 'The armoury fits plasteel inserts into your mask. It is heavier, and quieter. The world sounds further away.' : r === '01' ? 'The armoury clerk signs an MP7 out to your designation permanently and counts the rounds in front of you, twice.' : r === '02' ? 'You get a room of your own: a bunk, a locker, a window that looks at the Stacks. The first night you cannot sleep for the quiet.' : null,
          `@doc ${G.desig(s)}\nROSTER POSITION: #${pos} OF ${list.length} (${s.div || 'UNION'})`,
          '@sys Unlocked: ' + (PERKS[r] || []).join(' · ') + '.',
        ];
      },
      choices: [{ t: 'Continue.', go: (s) => s.mem.promoRet || 'u_board' }],
    },
  });

  /* codex */
  G.addCodex({
    career: {
      title: 'Grades and what they bring',
      body: `<table>${RANK_ORDER.map((r) => `<tr><td>${r}</td><td>${(PERKS[r] || []).join('<br>')}<br><small>${GATES[r] || (G.PROMO[r] && G.PROMO[r].gate) || ''}</small></td></tr>`).join('')}</table>
      <p>Officer grades are earned slowly: <b>Field Officer</b> only after the events of chapter four, <b>Squadron Leader</b> after chapter six, <b>Division Leader</b> after chapter eight, each through an officer board that is harder to pass than any before it. Most units retire as an 02. A few become 01. Almost nobody becomes DvL.</p>`,
    },
  });
  G.CODEX_GROUPS.find((g) => g.title === 'Service record').ids.unshift('career');
  G.extend('u_board', { after: (s) => G.unlock(s, 'career') });
})();
