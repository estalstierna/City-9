/* SHARED SYSTEMS — discipline, promotion boards, informants, apartment raids, incident reports,
   and the subtle signs of a file that is turning. Loaded after every chapter file: it hooks into
   existing scenes instead of rewriting them. Applies to every division. */
(function () {
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  /* ------------------------------------------------------------ state */
  const ensure = (s) => {
    s.disc = s.disc || { w: 0, final: false, demotions: 0, pending: [], queue: [], log: [], grave: null, heard: -1, last: 0, probation: 0 };
    s.inf = s.inf || { list: [], tip: null, news: [], cur: null, n: 0 };
    s.rep = s.rep || { filed: 0, flagged: 0, cur: null, seen: false };
    s.pb = s.pb || { retry: 0 };
    return s;
  };
  G.sysEnsure = ensure;
  const oldFresh = G.fresh;
  G.fresh = () => ensure(oldFresh());

  /* who stands next to you, and who you answer to */
  const partner = (s) => {
    if (s.div === 'JURY' && s.rel.vesna !== undefined) return { key: 'vesna', name: 'Vesna' };
    if (s.div === 'UNION' && s.rel.wick !== undefined && s.c2 && s.c2.stage >= 1) return { key: 'wick', name: 'Wick' };
    if ((!s.div || s.div === 'UNION') && s.rel.rook !== undefined) return { key: 'rook', name: 'Rook' };
    return { key: null, name: 'your partner' };
  };
  const partnerRel = (s) => {
    const p = partner(s);
    return p.key ? s.rel[p.key] || 0 : 20;
  };
  const superior = (s) => {
    if (s.div === 'JURY') return { name: 'Magistrate', key: 'magistrate', img: 'magistrate', cap: 'JURY-DvL-02842 — the Magistrate' };
    if (!s.div || s.div === 'UNION') return { name: 'Granite', key: 'granite', img: 'granite', cap: 'CCA.C9.D5-UNION-SqL-11902 — "Granite"' };
    return { name: `${s.div} SqL`, key: null, img: null, cap: '' };
  };
  G.partnerOf = partner;
  G.superiorOf = superior;

  const wrapPre = (id, fn) => {
    const sc = G.scenes[id];
    if (!sc) return;
    const old = sc.enter;
    sc.enter = (s, g) => {
      const r = fn(s, g);
      if (r) return r;
      return old ? old(s, g) : undefined;
    };
  };
  const wrapPost = (id, fn) => {
    const sc = G.scenes[id];
    if (!sc) return;
    const old = sc.enter;
    sc.enter = (s, g) => {
      const r = old ? old(s, g) : undefined;
      const r2 = fn(s, g);
      return r2 || r;
    };
  };
  const textOf = (sc, s, g) => [].concat((typeof sc === 'function' ? sc(s, g) : sc) || []);

  /* ======================================================= DISCIPLINE
     minor = 1 strike, serious = 2. 1: warning · 2: written reprimand · 3: demotion + final warning.
     Three more after a final warning, or one grave act, and the tribunal decides. */
  const SEV = { minor: 1, serious: 2 };
  G.discipline = (s, sev, reason, kind) => {
    ensure(s);
    if (s.phase !== 'union') return;
    if (sev === 'grave') {
      s.disc.grave = { reason, kind: kind || 'strip' };
      return;
    }
    s.disc.pending.push({ sev, reason });
    G.note(sev === 'serious' ? '[ REPRIMAND LOGGED ]' : '[ WARNING LOGGED ]', 'observed');
  };
  /* a discrepancy that will be found later, if it is found at all */
  const queueAudit = (s, sev, reason, kind) => {
    ensure(s).disc.queue.push({ day: s.day + rint(1, 3), sev, reason, kind });
  };

  const discWord = (s) => {
    const d = ensure(s).disc;
    if (d.final) return d.w ? `FINAL WARNING · ${d.w} strike${d.w > 1 ? 's' : ''}` : 'FINAL WARNING';
    if (d.w >= 2) return 'Written reprimand';
    if (d.w === 1) return 'Verbal warning';
    return 'Clean';
  };

  /* morning: due audits, expiring strikes, hearings and tribunals come before the duty board */
  function morning(s) {
    ensure(s);
    const d = s.disc;
    if (s.phase !== 'union') return null;
    d.queue = d.queue.filter((q) => {
      if (q.day > s.day) return true;
      if (q.sev === 'grave') d.grave = { reason: q.reason, kind: q.kind || 'strip' };
      else d.pending.push({ sev: q.sev, reason: q.reason });
      return false;
    });
    if (d.w > 0 && s.day - d.last >= 8 && !d.pending.length) {
      d.w--;
      d.last = s.day;
      G.note('DISCIPLINARY STRIKE EXPIRED', 'codex');
    } else if (d.final && !d.w && s.day - d.last >= 20) {
      d.final = false;
      d.last = s.day;
      G.note('FINAL WARNING LIFTED', 'codex');
    }
    if (d.grave) return 'disc_tribunal';
    if (d.pending.length && d.heard !== s.day) return 'disc_hearing';
    return null;
  }

  /* ==================================================== PROMOTION BOARD */
  Object.assign(G.PROMO, {
    '03': { next: '02', merit: 100, board: true, if: (s) => !!s.flags.passed_02 },
    '02': { next: '01', merit: 130, board: true },
    '01': { next: 'EpU', merit: 190, board: true },
  });
  G.promoBlocked = (s) => {
    ensure(s);
    return s.disc.probation > s.day || s.pb.retry > s.day;
  };
  G.promoRoute = (s) => {
    const p = G.promoFor(s);
    if (!p) return 'u_board';
    if (p.board || s.flags['passed_' + p.next] || (p.next === '03' && !s.flags.pb_03)) return 'pb_start';
    return 'exam_' + p.next;
  };
  const oldPromote = G.promote;
  G.promote = (s, rank) => {
    oldPromote(s, rank);
    s.flags['passed_' + s.rank] = true;
  };

  const QS = [
    { q: 'Radio code **10-15** means:', a: 'Detainee in custody', w: ['Unit down', 'Location', 'Out of service'] },
    { q: 'Radio code **11-99** means:', a: 'Unit down', w: ['Unit requests assistance', 'Respond immediately', 'Acknowledged'] },
    { q: 'Radio code **10-78** means:', a: 'Unit requests assistance', w: ['Pick up / transport required', 'Emergency traffic only', 'In service / on patrol'] },
    { q: 'A citizen file is amputated at how many penalty points?', a: 'Twenty', w: ['Twelve', 'Fifteen', 'Thirty'] },
    { q: 'Possession of **RED** contraband is a violation of level:', a: 'Level 5', w: ['Level 3', 'Level 4', 'Level 7'] },
    { q: 'Zip-ties found in a citizen’s pocket are graded:', a: 'YELLOW', w: ['GREEN', 'RED', 'Not contraband'] },
    { q: 'Which rank wears a single **wide** bar on the armband?', a: 'Elite Protection Unit', w: ['01 Protection Unit', 'Field Officer', 'Squadron Leader'] },
    { q: 'How many stars does a **Squadron Leader** wear?', a: 'Two', w: ['One', 'Three', 'None'] },
    { q: 'Who is exempt from food and medical contraband rules?', a: 'Members of the CWU', w: ['Commended citizens', 'Citizens over sixty', 'Nobody'] },
    { q: '**Deservicement** is:', a: 'The death of a Union agent', w: ['Removal from a district', 'A demotion of two grades', 'A closed ration terminal'] },
    { q: '**Policide** is a violation of level:', a: 'Level 7', w: ['Level 5', 'Level 6', 'Level 4'] },
    { q: 'To **inject** is to:', a: 'Breach into a room', w: ['Administer biogel', 'Interrogate a subject', 'Enter a 404 zone'] },
    { q: '**Viscon** means:', a: 'Visual confirmation', w: ['Audio confirmation', 'A vice-commander', 'Visitor control'] },
    { q: 'When may Overwatch give orders to CCA units?', a: 'When a sociostatus is active', w: ['Always', 'Never', 'Only inside the Nexus'] },
    { q: 'At which grade is the USP-Match issued as personal kit?', a: '04', w: ['05', '03', '01'] },
    { q: 'Fleeing from an officer is a violation of level:', a: 'Level 3', w: ['Level 1', 'Level 2', 'Level 5'] },
    { q: '**UPA** stands for:', a: 'Unauthorised procreative activity', w: ['Unidentified person of interest', 'Union patrol area', 'Unable to locate'] },
    { q: 'A **Midnight** order means:', a: 'Enter quietly, then ambush', w: ['Curfew begins', 'Withdraw all units', 'Cut district power'] },
  ];

  function buildOral(s) {
    ensure(s);
    const sup = superior(s).name;
    const out = [];
    const d = s.disc;
    const lastR = d.log.length ? d.log[d.log.length - 1].reason : null;
    if (lastR) {
      out.push({
        say: [`@say ${sup}|Your file carries ${d.log.length} disciplinary entr${d.log.length > 1 ? 'ies' : 'y'}. The most recent reads: *${lastR}*. Explain it to the board.`],
        opts: [
          { t: 'Own it. Say what you did and what you changed afterwards.', check: { skill: 'authority', diff: 10 } },
          { t: 'Explain the circumstances until it sounds like procedure.', check: { skill: 'deception', diff: 15, failFx: { susp: 2 } } },
          { t: 'Say nothing. Let the file speak.', score: 0 },
        ],
      });
    } else {
      out.push({
        say: ['@say OA Officer|A clean file. Clean files make me curious. Either you are very good, or very careful. Which?'],
        opts: [
          { t: '"Both, Officer."', check: { skill: 'authority', diff: 0 } },
          { t: '"I follow procedure. Procedure keeps files clean."', score: (st) => (st.lp >= 10 ? 1 : 0) },
          { t: 'Read what she wants to hear, and say exactly that.', check: { skill: 'perception', diff: 10 } },
        ],
      });
    }
    const amps = Object.values(s.files || {}).filter((f) => f.amputated).length;
    if (amps) {
      out.push({
        say: [`@say OA Officer|Your case files show ${amps} amputation${amps > 1 ? 's' : ''}. Describe the last one.`],
        opts: [
          { t: '"Procedure. The file reached twenty. I administered the verdict."', score: 1 },
          { t: '"I remember every one of them."', score: 0, fx: { cons: 3 } },
          { t: 'Describe it precisely, without colour, the way a report would.', check: { skill: 'comms', diff: 5 } },
        ],
      });
    } else {
      out.push({
        say: ['@say OA Officer|A woman at an RDT presents a dead man’s ration card. She has two children with her. Your verdict?'],
        opts: [
          { t: '"Detain her. Ration fraud is theft — Level 3."', score: 1 },
          { t: '"Confiscate the card. Warn her. Keep the line moving."', score: 0, fx: { cons: 2 } },
          { t: '"Let her through. Nobody gains from two orphans."', score: -1, fx: { susp: 3, cons: 4 } },
        ],
      });
    }
    const unreg = s.inf.list.filter((x) => x.status === 'active' && !x.registered).length;
    if (s.rep.flagged) {
      out.push({
        say: [`@say ${sup}|${s.rep.flagged} of your incident reports did not match your lens footage when they were audited. Why?`],
        opts: [
          { t: 'Blame the scanner. Quote the fault code from memory.', check: { skill: 'comms', diff: 10 } },
          { t: '"I wrote them too fast. It will not happen again."', score: 0 },
        ],
      });
    } else if (unreg) {
      out.push({
        say: ['@say OA Officer|We hear you run assets on Bazaar Row. None of them is registered with Dispatch.'],
        opts: [
          { t: '"Rumour, Officer. Citizens talk to masks. That is not an asset."', check: { skill: 'deception', diff: 10, failFx: { susp: 3 } } },
          { t: '"An unregistered asset talks more. I take responsibility."', check: { skill: 'authority', diff: 15 } },
        ],
      });
    } else {
      out.push({
        say: ['@say OA Officer|Last question. What is Civil Protection *for*?'],
        opts: [
          { t: '"To preserve sociostability."', score: 1 },
          { t: '"To keep people alive until things get better."', score: 0, fx: { cons: 2 } },
          { t: '"To keep the Union in power. Everything else is a consequence."', check: { skill: 'authority', diff: 15, failFx: { susp: 3 } } },
        ],
      });
    }
    return out;
  }
  /* oral answers cannot keep functions in the save, so they are rebuilt from the save on demand */
  const oralQ = (s) => buildOral(s)[s.pb.oi];

  /* ======================================================= INFORMANTS */
  const FIRST_M = ['Pavel', 'Jiri', 'Anton', 'Oskar', 'Viktor', 'Lev', 'Emil', 'Karel', 'Milan', 'Bohdan'];
  const FIRST_F = ['Hana', 'Irena', 'Olga', 'Vera', 'Dana', 'Zofia', 'Alena', 'Marie', 'Klara', 'Nadia'];
  const SURN = ['Kral', 'Dvorak', 'Horak', 'Benes', 'Cerny', 'Pokorny', 'Hajek', 'Jelinek', 'Ruzicka', 'Kolar', 'Machek', 'Vlcek', 'Stastny', 'Urban'];
  const nameFor = (face) => {
    const f = G.DOC_FACES && G.DOC_FACES[face];
    return `${pick(f && !f.m ? FIRST_F : FIRST_M)} ${pick(SURN)}`;
  };
  const PLACES = ['the back of the laundry in Stack 9', 'the stairwell of the old cinema', 'the pump room under Plaza 5', 'a broken tram shelter on Bazaar Row', 'the roof of the ration-packing plant'];
  const trustWord = (t) => (t >= 70 ? 'Loyal' : t >= 45 ? 'Cooperative' : t >= 20 ? 'Wary' : 'Scared');
  const activeInf = (s) => ensure(s).inf.list.filter((x) => x.status === 'active' || x.status === 'suspect');
  const infById = (s, id) => ensure(s).inf.list.find((x) => x.id === id);

  function recruit(s, c, registered) {
    ensure(s);
    const base = { standard: [40, 75], watch: [30, 60], cwu: [55, 85], commended: [70, 90] }[c.type] || [40, 70];
    const x = {
      id: ++s.inf.n,
      name: c.name || nameFor(c.face),
      cid: c.cid,
      face: c.face,
      type: c.type,
      rel: rint(base[0], base[1]),
      plant: c.type === 'watch' ? Math.random() < 0.35 : c.type === 'standard' ? Math.random() < 0.12 : false,
      trust: c.type === 'commended' ? 45 : 25,
      good: 0,
      bad: 0,
      status: 'active',
      registered,
      since: s.day,
      place: pick(PLACES),
    };
    s.inf.list.push(x);
    G.unlock(s, 'informants');
    G.note(`ASSET: ${x.name.toUpperCase()}`, 'contact');
    return x;
  }

  /* ========================================================== RAIDS */
  const GRADE_LEVEL = { green: 2, yellow: 4, red: 5, black: 7 };
  const LEVEL_POINTS = { 1: 0, 2: 2, 3: 3, 4: 5, 5: 7, 6: 12, 7: 99 };
  const RITEMS = {
    leaflets: { name: 'a bundle of lambda leaflets', grade: 'red', give: 'leaflet' },
    plates: { name: 'printing plates with a lambda cut into them', grade: 'red' },
    transmitter: { name: 'a handheld transmitter', grade: 'red' },
    receiver: { name: 'an unregistered radio receiver', grade: 'yellow' },
    biogel: { name: 'a shoebox of biogel vials', grade: 'yellow' },
    rounds: { name: 'a tin of 9mm rounds', grade: 'red' },
    pistol: { name: 'a pistol wrapped in oilcloth', grade: 'black' },
    cards: { name: 'a bundle of blank access cards', grade: 'yellow' },
    breach: { name: 'a door breach charge', grade: 'red' },
    food: { name: 'a stack of priority-tier ration bars', grade: 'green' },
    vodka: { name: 'a bottle of pre-war vodka', grade: 'green' },
    tobacco: { name: 'unregistered tobacco in a tin', grade: 'green' },
  };
  const CLAIMS = [
    { id: 'radio', claim: 'keeps a transmitter under the floor', items: ['transmitter'], spot: 'floor' },
    { id: 'print', claim: 'prints leaflets at night', items: ['leaflets', 'plates'] },
    { id: 'hide', claim: 'is hiding a nephew from the relocation list', person: 'runner' },
    { id: 'gel', claim: 'sells biogel stolen from the Nexus', items: ['biogel'] },
    { id: 'guns', claim: 'is holding weapons for a cell', items: ['rounds', 'pistol'] },
    { id: 'cards', claim: 'forges access cards', items: ['cards'] },
    { id: 'wounded', claim: 'is hiding a wounded man', person: 'wounded' },
    { id: 'breach', claim: 'has been seen carrying something heavy up from the canal', items: ['breach', 'rounds'] },
  ];
  const PERSONS = {
    runner: 'a boy of about fifteen with his knees pulled up to his chin. His CID is on the list for tomorrow’s relocation train.',
    wounded: 'a man with a stitched gunshot wound in his side, grey with fever. There is a small lambda tattooed on the inside of his wrist.',
    deserter: 'a man with a CCA crew cut and a raw, badly healed scar at the base of his skull, where a biosignal implant used to be.',
  };
  const SPOTS = {
    mattress: { t: 'Slit the mattress seams.', n: 'mattress', find: 'Inside the stuffing, wrapped in a pillowcase:', none: 'Horsehair and damp. Nothing else.' },
    floor: { t: 'Lift the floorboards by the stove.', n: 'floorboards', find: 'Under the third board, in the dust between the joists:', none: 'Joists, dust, a dead mouse. The boards go back down crooked.' },
    vent: { t: 'Unscrew the ventilation grille.', n: 'vent', find: 'Taped to the inside of the duct:', none: 'Grey fluff, and the sound of the whole Stack breathing.' },
    stove: { t: 'Open the stove and reach up the flue.', n: 'stove', find: 'On the smoke shelf, black with soot:', none: 'Soot to the elbow. Nothing.' },
    wardrobe: { t: 'Empty the wardrobe and knock on the back panel.', n: 'wardrobe', find: 'The back panel is hollow. Behind it:', none: 'Two jackets, both citizen issue. The panel is solid.' },
    toys: { t: 'Tip out the child’s toy box.', n: 'toy box', find: 'Under the wooden blocks and a one-eyed bear:', none: 'Blocks, a bear with one eye, a drawing of a sun. The child watches you put them back wrong.' },
    occupant: { t: 'Search the occupant.', n: 'occupant', find: 'Sewn into the waistband of their trousers:', none: 'They stand with their arms out, shaking. Nothing on them.' },
  };
  const STACKS = [3, 7, 9, 11, 14, 17, 22];

  function makeOcc(s) {
    const known = Object.values(s.files || {}).filter((f) => !f.amputated && f.type !== 'commended');
    if (known.length && Math.random() < 0.25) {
      const f = pick(known);
      const face = f.face !== undefined ? f.face : G.pickFace(f.type === 'cwu');
      return { cid: f.cid, type: f.type, face, desc: f.desc, points: f.points, name: f.name || nameFor(face), known: true };
    }
    const r = Math.random();
    const type = r < 0.6 ? 'standard' : r < 0.8 ? 'watch' : 'cwu';
    const face = G.pickFace(type === 'cwu');
    return { cid: String(rint(10000, 99999)), type, face, desc: G.faceDesc(face), points: type === 'watch' ? rint(7, 15) : rint(0, 6), name: nameFor(face) };
  }

  function makeRaid(s, src) {
    src = src || {};
    const claim = src.claim ? CLAIMS.find((c) => c.id === src.claim) : pick(CLAIMS);
    const guilty = src.guilty !== undefined ? src.guilty : Math.random() < 0.6;
    const comp = pick(['kids', 'kids', 'elder', 'neighbour', null, null]);
    const spots = ['mattress', 'floor', 'vent', 'stove', 'wardrobe'].concat(comp === 'kids' ? ['toys'] : []);
    const stash = {};
    const put = (spot, it) => (stash[spot] = (stash[spot] || []).concat(it));
    let person = null;
    if (guilty) {
      (claim.items || []).forEach((it, i) => put(i === 0 && claim.spot ? claim.spot : pick(spots.concat(['occupant'])), it));
      if (claim.person) person = { kind: claim.person, spot: pick(['wardrobe', 'floor']), found: false, fate: null };
      if (Math.random() < 0.08 && !person) person = { kind: 'deserter', spot: 'wardrobe', found: false, fate: null };
      if (Math.random() < 0.4) put(pick(spots), pick(['food', 'vodka', 'tobacco']));
    } else if (Math.random() < 0.5) put(pick(spots.concat(['occupant'])), pick(['food', 'vodka', 'tobacco']));
    return {
      src: src.inf ? 'tip' : 'warrant',
      inf: src.inf || null,
      claim: claim.id,
      claimText: claim.claim,
      guilty,
      trap: !!src.trap,
      occ: src.occ || makeOcc(s),
      addr: src.addr || `Stack ${pick(STACKS)}, flat ${rint(1, 12)}${pick(['A', 'B', 'C', 'D'])}`,
      comp,
      spots,
      stash,
      person,
      searched: {},
      found: [],
      time: 4,
      noise: 0,
      did: {},
      hint: null,
      last: [],
      entry: null,
      result: null,
    };
  }
  G.makeRaid = makeRaid;

  const R = (s) => s.raid;
  const itemLine = (id) => `**${RITEMS[id].name}** — ${RITEMS[id].grade.toUpperCase()}`;

  function searchSpot(s, spot, toss) {
    const r = R(s);
    r.searched[spot] = true;
    const here = r.stash[spot] || [];
    const chance = toss || r.hint === spot ? 1 : 0.55 + 0.08 * (s.skills.perception || 0);
    const got = here.filter(() => Math.random() < chance);
    r.stash[spot] = here.filter((x) => !got.includes(x));
    got.forEach((x) => r.found.push({ id: x, spot }));
    const lines = [];
    const sp = SPOTS[spot];
    if (got.length) lines.push(`${sp.find} ${got.map(itemLine).join('; ')}.`);
    else if (!(r.person && r.person.spot === spot)) lines.push(spot === 'mattress' && r.comp === 'elder' ? 'You have to lift the old woman off the mattress to search it. She weighs nothing. ' + sp.none : sp.none);
    if (r.person && !r.person.found && r.person.spot === spot) {
      r.person.found = true;
      lines.push(spot === 'floor' ? 'Under the boards is not a cavity. It is a crawlspace. Something in it breathes.' : 'Behind the back panel is not a cavity. It is a person.');
    }
    if (got.length) G.gainXP(s, 'perception', 1);
    return lines;
  }

  const raidCharges = (s) => {
    const r = R(s);
    const list = r.found.map((f) => ({ name: `Possession of ${RITEMS[f.id].grade.toUpperCase()} contraband (${RITEMS[f.id].name.replace(/^an? /, '')})`, lvl: GRADE_LEVEL[RITEMS[f.id].grade] }));
    if (r.person && r.person.found && (r.person.fate === 'detained' || r.person.fate === 'amputated')) list.push({ name: 'Rebel conspiracy (harbouring)', lvl: 6 });
    return list;
  };

  /* =========================================================== REPORTS
     A fact can be struck (omitted); an addition can be added (a lie, or a confession).
     Discrepancies are checked against witnesses later — the player never sees the roll. */
  G.startReport = (s, rep) => {
    ensure(s).rep.cur = rep;
    G.unlock(s, 'reports');
    return 'rep_draft';
  };
  const witP = (s, w) => {
    if (w === 'scanner') return Math.max(0.12, 0.4 - 0.04 * (s.skills.comms || 0));
    if (w === 'partner') {
      const rel = partnerRel(s);
      return rel >= 60 ? 0.05 : rel >= 30 ? 0.2 : 0.45;
    }
    if (w === 'citizen') return 0.15;
    return 0;
  };
  const detectP = (s, wits) => 1 - (wits || []).filter(Boolean).reduce((p, w) => p * (1 - witP(s, w)), 1);
  const ORDER = { minor: 1, serious: 2, grave: 3 };

  function ssReport(s) {
    const c = s.ss;
    const p = partner(s);
    const found = c.items.filter((x) => x.found);
    const facts = [{ id: 'stop', lock: true, text: `Stop: CID ${c.cid}. Grounds: ${c.obs ? c.obs.name.toLowerCase() : 'routine check'}.` }];
    found.forEach((x, i) => {
      const lvl = GRADE_LEVEL[x.grade];
      facts.push({
        id: 'it' + i,
        text: `Recovered: ${x.name} (${x.grade.toUpperCase()})${x.exempt ? ' — CWU exempt' : ''}.`,
        short: x.name,
        wit: ['scanner', p.key ? 'partner' : null],
        sev: lvl >= 5 ? 'serious' : 'minor',
        omitFx: { cons: 2, res: lvl >= 5 ? 3 : 1 },
        onRisk: c.result === 'bribe' ? { sev: 'minor', reason: 'Contraband logged with no verdict entered' } : null,
      });
    });
    if (c.bribe && c.result !== 'bribe')
      facts.push({ id: 'bribe', text: `Subject offered a bribe of ${c.bribe} tokens. Refused.`, short: 'the bribe offer', wit: ['citizen'], sev: 'minor', omitFx: { cons: 1 } });
    facts.push({ id: 'verdict', lock: true, text: `Verdict: ${c.status}.` });
    const adds = [];
    if ((c.result === 'full' || c.result === 'top') && c.status !== 'AMPUTATED')
      adds.push({ id: 'resist', text: 'Subject resisted search (Level 4, 5 penalty points).', short: '“Subject resisted search.”', lie: true, wit: [p.key ? 'partner' : null, 'citizen'], sev: 'minor', onFx: { merit: 2 }, addPts: 5 });
    if (c.result === 'bribe') adds.push({ id: 'confess', text: `Unit accepted ${c.bribe} tokens from the subject.`, short: 'that you took the tokens', confess: true, onFx: { tokens: -c.bribe }, reason: 'Self-reported: accepted a bribe during a stop' });
    return { title: `Stop & search · CID ${c.cid}`, cid: c.cid, facts, adds, ret: 'u_duty_end' };
  }

  function raidReport(s) {
    const r = R(s);
    const p = partner(s);
    const facts = [{ id: 'entry', lock: true, text: `Warrant served: ${r.addr}. Occupant CID ${r.occ.cid}. Entry: ${r.entry}.` }];
    r.found.forEach((f, i) => {
      const lvl = GRADE_LEVEL[RITEMS[f.id].grade];
      facts.push({ id: 'it' + i, text: `Recovered from the ${SPOTS[f.spot].n}: ${RITEMS[f.id].name} (${RITEMS[f.id].grade.toUpperCase()}).`, short: RITEMS[f.id].name, wit: ['scanner', p.key ? 'partner' : null], sev: lvl >= 5 ? 'serious' : 'minor', omitFx: { cons: 2, res: lvl >= 5 ? 3 : 1 } });
    });
    const adds = [];
    if (r.person && r.person.found) {
      const fate = r.person.fate;
      const released = fate === 'released';
      facts.push({
        id: 'viscon',
        lock: !released,
        text: `Viscon: second individual concealed behind the ${SPOTS[r.person.spot].n}. ${fate === 'detained' ? 'Detained, 10-15.' : fate === 'amputated' ? 'Anticitizen. Amputated on site.' : 'Not detained.'}`,
        short: 'the second individual',
        wit: ['scanner', r.person.covered ? 'partner' : null],
        sev: 'grave',
        kind: 'collab',
        omitFx: { res: 6, cons: 3 },
        onRisk: released ? { sev: 'serious', reason: 'Concealed individual sighted and not detained', unless: 'fled' } : null,
      });
      if (released) adds.push({ id: 'fled', text: 'The individual fled through the rear window before they could be secured.', short: '“The individual fled.”', lie: true, wit: [r.person.covered ? 'partner' : null], sev: 'serious' });
    }
    if (r.noise >= 4) facts.push({ id: 'damage', text: 'Property damage during search: extensive.', short: 'the damage', wit: ['citizen'], sev: 'minor', omitFx: {} });
    facts.push({ id: 'verdict', lock: true, text: `Verdict: ${r.status}.` });
    if ((r.result === 'full' || r.result === 'top') && r.status !== 'AMPUTATED')
      adds.push({ id: 'resist', text: 'Occupant resisted entry (Level 4, 5 penalty points).', short: '“Occupant resisted entry.”', lie: true, wit: [p.key ? 'partner' : null, 'scanner'], sev: 'minor', onFx: { merit: 2 }, addPts: 5 });
    if (r.planted) adds.push({ id: 'confess', text: 'The recovered leaflets were placed by the reporting unit.', short: 'that you planted the leaflets', confess: true, reason: 'Self-reported: planted evidence during a raid', sev: 'serious' });
    return { title: `Raid · ${r.addr}`, cid: r.occ.cid, facts, adds, ret: 'u_duty_end' };
  }

  /* ======================================================= SUBTLE TELLS */
  const TELLS = [
    [20, [
      'Your locker latch is turned to the left. You always leave it to the right.',
      'Someone has refiled your last three reports in date order. You never file them in order.',
      'The duty clerk writes your designation on the board in a slightly different hand than everyone else’s.',
    ]],
    [40, [
      (s) => `${partner(s).name === 'your partner' ? 'Your partner' : partner(s).name} stops talking when you come into the locker room. Then starts again, about the weather.`,
      (s) => `${superior(s).name} reads your designation off the slate half a beat slower than the others.`,
      'The armoury clerk counts your rounds back in twice tonight.',
    ]],
    [60, [
      'There is a JURY unit in the mess at breakfast. Not eating. Facing your table.',
      'Your lens footage uploads twice overnight. The second upload does not go to Dispatch.',
      'Dispatch asks for your 10-20 three times in one shift. Nobody else’s.',
    ]],
    [80, [
      'The bunk next to yours is stripped, the mattress rolled. Nobody says where he went. Nobody looks at you when they don’t say it.',
      'Your biosignal implant itches at the base of your skull. It has never itched before.',
      'Your access card takes two tries at the precinct door this morning. Then it works, as if nothing happened.',
    ]],
  ];
  function tell(s) {
    if (s.mem.tellDay === s.day + (s.time === 'Evening' ? 0.5 : 0)) return null;
    const tier = TELLS.filter((t) => s.susp >= t[0]).pop();
    if (!tier || Math.random() > 0.45) return null;
    s.mem.tellDay = s.day + (s.time === 'Evening' ? 0.5 : 0);
    const l = pick(tier[1]);
    return typeof l === 'function' ? l(s) : l;
  }
  G.tellLine = tell;

  /* ==================================================== DUTY + HUB HOOKS */
  G.duties.raid = { name: 'Apartment raid', desc: 'A warrant for a flat in the Stacks, sworn on a neighbour’s report.', first: 'raid_new', routine: 'raid_new', if: (s) => s.day >= 2 };

  wrapPre('u_board', (s) => morning(s));
  const board = G.scenes.u_board;
  const boardText = board.text;
  board.text = (s, g) => {
    ensure(s);
    const lines = textOf(boardText, s, g);
    const extra = [];
    s.inf.news = s.inf.news.filter((n) => {
      if (n.day > s.day) return true;
      const x = infById(s, n.id);
      if (!x || x.status === 'dead' || x.status === 'gone') return false;
      x.status = n.kind === 'dead' ? 'dead' : 'burned';
      extra.push(n.kind === 'dead' ? `@dispatch DB recovered, D3 canal, lock 2. CID ${x.cid}. Identified as ${x.name}. Somebody has carved a word into the lock gate beside it: RAT.` : `@sys Your asset ${x.name} did not come to the last meeting place. Their door in the Stacks has the word RAT painted across it. They will not speak to a mask again.`);
      if (n.kind === 'dead') G.fx(s, { cons: -3 });
      return false;
    });
    if (s.inf.tip && s.day > s.inf.tip.day + 3) {
      extra.push('@sys The tip on ' + s.inf.tip.addr + ' has gone cold. Whatever was there has been moved.');
      s.inf.tip = null;
    }
    if (s.disc.probation > s.day) extra.push(`@sys PROBATION: no promotion request until day ${s.disc.probation}.`);
    const t = tell(s);
    if (t) extra.push(t);
    lines.splice(Math.max(0, lines.length - 1), 0, ...extra);
    return lines;
  };
  const boardChoices = board.choices;
  board.choices = (s, g) => {
    const list = textOf(boardChoices, s, g);
    const tip = s.inf && s.inf.tip;
    if (tip && tip.day < s.day)
      list.splice(list.length, 0, {
        t: `**Raid on a tip** — ${tip.addr}. ${infById(s, tip.inf).name} says the occupant ${CLAIMS.find((c) => c.id === tip.claim).claim}.`,
        tag: 'TIP',
        tagCls: 'duty',
        fx: (st) => ((st.duty.current = null), (st.time = 'Day'), null),
        go: 'raid_tip',
      });
    return list;
  };

  const ev = G.scenes.u_evening;
  const evText = ev.text;
  ev.text = (s, g) => {
    const lines = textOf(evText, s, g);
    const t = tell(s);
    if (t) lines.splice(Math.max(0, lines.length - 1), 0, t);
    return lines;
  };
  const evChoices = ev.choices;
  ev.choices = (s, g) => {
    const list = textOf(evChoices, s, g);
    if (activeInf(s).length) list.splice(Math.max(0, list.length - 1), 0, { t: 'Meet one of your informants.', tag: 'ASSET', tagCls: 'duty', go: 'inf_pick' });
    return list;
  };

  /* stop & search: recruit, report, discipline */
  const ssv = G.scenes.ss_verdict;
  const ssvChoices = ssv.choices;
  ssv.choices = (s, g) => {
    const list = textOf(ssvChoices, s, g);
    const c = s.ss;
    const found = c.items.filter((x) => x.found && !x.exempt);
    const lethal = list.some((o) => o.tag === 'AMPUTATE');
    if (found.length && !lethal && activeInf(s).length < 4)
      list.splice(Math.max(0, list.length - 1), 0, { t: 'Drop it — if they report to you from now on.', tag: 'ASSET', tagCls: 'duty', fx: (st) => ((st.ss.result = 'recruit'), null), go: 'inf_recruit' });
    return list;
  };
  wrapPost('ss_result', (s) => {
    const c = s.ss;
    if (c.result === 'falsify_caught') G.discipline(s, 'serious', 'Evidence grade mismatch on a stop & search (flagged by slate)');
    if (c.result === 'warn' && c.items.some((x) => x.found && !x.exempt && GRADE_LEVEL[x.grade] >= 5)) G.discipline(s, 'minor', 'RED contraband released with a warning');
  });
  const ssr = G.scenes.ss_result;
  const ssrChoices = ssr.choices;
  const ssNotable = (c) => c.items.some((x) => x.found) || c.bribe;
  ssr.choices = (s, g) => (ssNotable(s.ss) && s.phase === 'union' ? [{ t: 'Write the incident report.', tag: 'REPORT', tagCls: 'duty', go: (st) => G.startReport(st, ssReport(st)) }] : textOf(ssrChoices, s, g));

  /* existing failures that now land on your disciplinary record */
  const HOOKS = {
    d_ration_1_blind_bad: ['minor', 'Failed to act on an RDT fraud flag (Plaza 5, hatch 4)'],
    d_check_res_bad: ['minor', 'Attempted to clear a flagged item at Canal Gate 3'],
    d_market_tinker_caught: ['serious', 'Concealed contraband during a market inspection'],
    exam_04_free_bad: ['serious', 'Detainee escape during field evaluation'],
    c2_j2_wipe_fail: ['serious', 'Attempted alteration of a detention record'],
  };
  Object.keys(HOOKS).forEach((id) => wrapPost(id, (s) => G.discipline(s, HOOKS[id][0], HOOKS[id][1])));

  /* ============================================================ SCENES */
  G.addScenes({
    /* ------------------------------------------------ discipline */
    disc_hearing: {
      title: 'Disciplinary hearing',
      enter: (s) => {
        ensure(s);
        const d = s.disc;
        const items = d.pending.slice();
        d.pending = [];
        d.heard = s.day;
        d.last = s.day;
        items.forEach((x) => d.log.push({ day: s.day, reason: x.reason, sev: x.sev }));
        d.w += items.reduce((n, x) => n + SEV[x.sev], 0);
        let out;
        if (d.w >= 3) {
          if (d.final) {
            d.grave = { reason: 'Repeated malcompliance after a final warning', kind: 'strip' };
            return 'disc_tribunal';
          }
          const i = G.rankIdx(s.rank);
          d.final = true;
          d.w = 0;
          if (i <= 1) {
            out = 'final05';
            G.fx(s, { merit: -10, lp: -3 });
          } else {
            out = 'demote';
            s.mem.demFrom = s.rank;
            s.rank = G.RANKS[i - 1];
            d.demotions++;
            d.probation = s.day + 4;
            s.merit = Math.max(0, s.merit - 15);
            G.note(`DEMOTED → ${G.RANK_NAMES[s.rank].toUpperCase()}`, 'neg');
          }
        } else if (d.w === 2) {
          out = 'reprimand';
          G.fx(s, { merit: -3, lp: -2 });
        } else {
          out = 'warning';
          G.fx(s, { lp: -1 });
        }
        s.mem.hear = { items, out };
        G.unlock(s, 'discipline');
      },
      text: (s) => {
        const sup = superior(s);
        const h = s.mem.hear;
        const L = [];
        if (sup.img) L.push(`@portrait assets/img/portraits/${sup.img}.webp|${sup.cap}`);
        L.push(`@doc DISCIPLINARY NOTICE — ${G.short(s)}\n${h.items.map((x) => `${x.sev === 'serious' ? 'SERIOUS' : 'MINOR'}: ${x.reason}`).join('\n')}`);
        const say = (t) => L.push(`@say ${sup.name}|${t}`);
        if (h.out === 'warning') {
          L.push(`${sup.name} does not ask you to sit. The notice lies on the desk between you, face up.`);
          say('Verbal warning. It goes in your file and it stays there for a while. Do not make me write the next one.');
        } else if (h.out === 'reprimand') {
          L.push(`${sup.name} reads the notice aloud, all of it, in a flat voice, and then signs the bottom of it in front of you.`);
          say('Written reprimand. That is two. You know what three is. Everybody in this precinct knows what three is.');
        } else if (h.out === 'demote') {
          L.push(`There is a second unit in the room this time, from the armoury. ${sup.name} holds out a hand for your armband without a word.`);
          say(`Three strikes. You are ${G.RANK_NAMES[s.rank]} again as of this morning. The stripe comes off today; the kit that goes with it goes back to the cage.`);
          say('And this is a *final warning*. There is no fourth conversation. The next one is with JURY, and it is not a conversation.');
          L.push(`@sys DEMOTED: ${s.mem.demFrom} → ${s.rank}. Merit −15. Probation for four days. Every strike from now on counts toward a tribunal.`);
        } else {
          L.push('There is no lower grade to send you to.');
          say('You are an 05. There is no stripe to take. So I am taking the next best thing: your margin. This is a final warning. The next one goes to JURY.');
          L.push('@sys FINAL WARNING. Merit −10.');
        }
        return L;
      },
      choices: [{ t: 'Muster.', go: 'u_board' }],
    },

    disc_tribunal: {
      title: 'Tribunal — level 4',
      enter: (s) => {
        ensure(s);
        s.mem.trib = s.disc.grave || { reason: 'Malcompliance', kind: 'strip' };
        s.disc.grave = null;
        G.unlock(s, 'discipline');
      },
      text: (s) => [
        'They do not knock. Two JURY units in crimson bands collect you from the locker room and walk you down, below the river line, to a room with one table, one chair and a ventilation fan that ticks like a clock.',
        '@portrait assets/img/portraits/magistrate.webp|JURY-DvL-02842 — the Magistrate',
        `@doc TRIBUNAL — ${G.desig(s)}\nCHARGE: ${s.mem.trib.reason.toUpperCase()}\nPRIOR RECORD: ${s.disc.log.length} entr${s.disc.log.length === 1 ? 'y' : 'ies'} · ${s.disc.demotions} demotion${s.disc.demotions === 1 ? '' : 's'}`,
        s.mem.trib.kind === 'collab'
          ? '@say Magistrate|Aiding an anticitizen. There is no level for that in the book you were trained on, Protection Unit, because the book was not written for us. It was written for them.'
          : '@say Magistrate|Your file has been asking for this room for some time. Today it got its wish.',
      ],
      choices: (s) => {
        const first = !s.disc.final && !s.disc.demotions && s.mem.trib.kind !== 'collab';
        return [
          first ? { t: 'Plead your record. A clean file until now. Ask for the stripe, not the mask.', check: { skill: 'authority', diff: 25, pass: 'disc_trib_spared', fail: 'end_deserviced' } } : null,
          { t: 'Stand at attention and say nothing.', go: 'end_deserviced' },
        ].filter(Boolean);
      },
    },
    disc_trib_spared: {
      enter: (s) => {
        const i = G.rankIdx(s.rank);
        s.rank = G.RANKS[Math.max(1, i - 2)];
        s.disc.final = true;
        s.disc.w = 0;
        s.disc.demotions++;
        s.disc.probation = s.day + 6;
        s.disc.log.push({ day: s.day, reason: s.mem.trib.reason, sev: 'grave' });
        s.merit = Math.max(0, s.merit - 25);
        G.fx(s, { lp: -5, susp: 10 });
        G.note(`DEMOTED → ${G.RANK_NAMES[s.rank].toUpperCase()}`, 'neg');
      },
      text: (s) => [
        'The Magistrate lets the fan tick for a long time.',
        '@say Magistrate|Once. A clean file buys exactly once. I am taking two grades and every scrap of goodwill you ever earned, and I am keeping the file open on my desk where I can see it.',
        `@sys Spared. Demoted to ${G.RANK_NAMES[s.rank]}. Final warning. Probation for six days.`,
      ],
      choices: [{ t: 'Walk back up into the light.', go: 'u_duty_end' }],
    },

    end_deserviced: {
      ending: true,
      title: (s) => (s.mem.trib && s.mem.trib.kind === 'collab' ? 'Deservicement' : 'Deserviced'),
      enter: (s) => {
        s.phase = 'ended';
      },
      text: (s) =>
        s.mem.trib && s.mem.trib.kind === 'collab'
          ? [
              'There is no appeal. There is not even a second question.',
              'They take your mask off for the first time since training. The air in the room is cold and smells of river water. The Magistrate looks at your face for a long moment, as if memorising something he expects to need.',
              `@doc ${G.desig(s)}\nSTATUS: DESERVICED\nBIOSIGNAL: TERMINATED\nNOTE: Collaboration. Anticitizen. File closed.`,
              'Upstairs, at muster, your designation is read out once, and then struck from the slate.',
              '@sys ENDING — DESERVICED. You were caught helping the people you were sent to hunt.',
            ]
          : [
              'They take the armband first, then the mask, then the boots. They let you keep the grey undershirt.',
              'A HELIX technician switches off the biosignal implant at the base of your skull with a device like a staple gun. Dispatch loses you with a soft click you will hear for the rest of your life.',
              'By evening you are standing in the queue at an RDT in the Works, in a faded blue jacket with a white label on the chest. Somebody has printed **OBS** across it in red. The unit at the hatch looks straight through you.',
              `@doc CID ${s.uid}\nCLASS: CITIZEN — UNDER OBSERVATION\nFORMER DESIGNATION: ${G.desig(s)}\nNOTE: Deserviced for malcompliance. Assigned D2 textile mill, night shift.`,
              '@sys ENDING — DESERVICED. Your record ran out of chances.',
            ],
      choices: () => [
        { t: 'Return to last checkpoint', if: () => G.hasCheckpoint(), act: () => G.loadCheckpoint() },
        { t: 'Begin a new life', act: () => G.newGame() },
      ],
    },

    /* ------------------------------------------------ promotion board */
    pb_start: {
      checkpoint: true,
      title: 'Promotion board — the Nexus, fourth floor',
      enter: (s) => {
        ensure(s);
        const p = G.promoFor(s);
        if (!p) return 'u_board';
        s.pb = { retry: s.pb.retry || 0, next: p.next, need: p.merit, i: 0, score: 0, wrong: [], qs: G.shuffle(QS.map((q, i) => i)).slice(0, 5), oi: 0, os: 0 };
        s.time = 'Day';
        G.unlock(s, 'board');
      },
      text: (s) => [
        `Three chairs behind a steel table. In the middle, ${superior(s).name}. On the left, a Field Officer from the Academy with a violet armband and a slate she never looks at. On the right, a JURY observer who writes continuously and does not speak at all.`,
        `@say ${superior(s).name}|Grade ${s.pb.next}. The board will examine your knowledge of procedure, then your record. Sit.`,
        '@sys The written part has five questions. The oral part asks about your own file. Your merit, disciplinary record and case files all count.',
      ],
      choices: [{ t: 'Sit down.', go: 'pb_q' }],
    },
    pb_q: {
      title: (s) => `Promotion board — written ${s.pb.i + 1} / 5`,
      text: (s) => [`@doc ${QS[s.pb.qs[s.pb.i]].q}`],
      choices: (s) => {
        const q = QS[s.pb.qs[s.pb.i]];
        return G.shuffle([q.a, ...q.w]).map((ans) => ({
          t: ans,
          fx: (st) => {
            if (ans === q.a) st.pb.score++;
            else st.pb.wrong.push(st.pb.qs[st.pb.i]);
            st.pb.i++;
            return null;
          },
          go: (st) => (st.pb.i < 5 ? 'pb_q' : 'pb_oral'),
        }));
      },
    },
    pb_oral: {
      title: (s) => `Promotion board — oral ${s.pb.oi + 1} / 3`,
      text: (s) => oralQ(s).say,
      choices: (s) =>
        oralQ(s).opts.map((o) => {
          const next = (st) => (st.pb.oi < 3 ? 'pb_oral' : 'pb_result');
          const adv = (st) => {
            st.pb.oi++;
            return null;
          };
          if (o.check)
            return {
              t: o.t,
              fx: adv,
              check: { skill: o.check.skill, diff: o.check.diff, pass: next, fail: next, okFx: (st) => ((st.pb.os += 1), null), failFx: o.check.failFx || null },
            };
          return {
            t: o.t,
            fx: (st) => {
              const sc = typeof o.score === 'function' ? o.score(st) : o.score || 0;
              st.pb.os += sc;
              adv(st);
              return o.fx || null;
            },
            go: next,
          };
        }),
    },
    pb_result: {
      enter: (s) => {
        const pb = s.pb;
        const d = s.disc;
        const mods = [];
        if (s.merit >= pb.need + 20) mods.push(['Merit surplus', 1]);
        if (d.w) mods.push(['Active disciplinary strikes', -d.w]);
        if (d.final) mods.push(['Final warning on file', -1]);
        if (d.demotions) mods.push(['Prior demotion', -1]);
        if (s.susp >= 50) mods.push(['JURY observer annotation', -1]);
        pb.mods = mods;
        pb.total = pb.score + Math.max(0, pb.os) + mods.reduce((n, m) => n + m[1], 0);
        pb.pass = pb.total >= 5;
        if (pb.pass) {
          if (pb.next === '03' && !s.flags.passed_03) {
            s.flags.pb_03 = true;
            pb.exam = true;
          } else {
            G.promote(s, pb.next);
            G.fx(s, { merit: 3, lp: 2 });
          }
        } else {
          pb.retry = s.day + 3;
          G.fx(s, { merit: -8 });
        }
      },
      title: 'Board decision',
      text: (s) => {
        const pb = s.pb;
        const wrong = pb.wrong.map((i) => `✗ ${QS[i].q.replace(/\*\*/g, '')} — ${QS[i].a}`);
        return [
          `@doc BOARD SCORESHEET — ${G.short(s)} → ${pb.next}\nWRITTEN: ${pb.score} / 5\nORAL: ${Math.max(0, pb.os)} / 3\n${pb.mods.map((m) => `${m[0].toUpperCase()}: ${m[1] > 0 ? '+' : ''}${m[1]}`).join('\n')}${pb.mods.length ? '\n' : ''}TOTAL: ${pb.total} — PASS AT 5`,
          wrong.length ? '@sys Corrections: ' + wrong.join(' · ') : null,
          s.susp >= 50 ? 'The JURY observer hands the Field Officer a single folded sheet. She reads it, folds it again, and does not look at you.' : null,
          pb.pass
            ? pb.exam
              ? `@say ${superior(s).name}|The board is satisfied. The field evaluation follows. Now.`
              : `@say ${superior(s).name}|${G.RANK_NAMES[s.rank]}. The board has spoken. Try to deserve it.`
            : `@say ${superior(s).name}|Not today. Come back in three days with a better file, or a better memory.`,
          pb.pass && !pb.exam ? `@doc PROMOTION: ${G.desig(s)}` : null,
        ];
      },
      choices: (s) => [s.pb.exam && s.pb.pass ? { t: 'The field evaluation.', fx: (st) => ((st.pb.exam = false), null), go: 'exam_03' } : { t: 'Evening.', go: 'u_duty_end' }],
    },
  });

  /* expose for part two */
  G._sys = { ensure, partner, partnerRel, superior, queueAudit, detectP, ORDER, activeInf, infById, recruit, nameFor, trustWord, RITEMS, GRADE_LEVEL, LEVEL_POINTS, SPOTS, PERSONS, CLAIMS, R, searchSpot, raidCharges, ssReport, raidReport, makeOcc, rint, pick, discWord };
})();
