/* LORE & INTERCONNECTION — the city's history, its places and its quiet language, and the threads
   that tie divisions, chapters and duties together:
   - new codex records, unlocked where the player first meets the thing they describe;
   - the canal cells' chalk language, which turns up all over the game and is explained here;
   - rumours: what happened in the other divisions' stories reaches you as talk in the mess;
   - echoes: your own chapter-two choices come back in chapters three and four. */
(function () {
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  G.addCodex({
    war: {
      title: 'The Seven Hour War',
      body: `<p>The war lasted seven hours. Every adult in City 9 can tell you where they were when the broadcasts stopped, and none of them will tell you willingly.</p>
      <p>City 9 surrendered in the fourth hour. The dam was the reason: the Union needed it intact, and the city council needed it not to be blown. The Administrator who signed the surrender still governs the city from the Nexus. Citizens born after that morning are called <i>dam children</i>, and there are none younger than the suppression field.</p>
      <p>Old Town, east of the canal, did not surrender. Three years later, on a night nobody names, it was quarantined. The 404 wall went up in a week.</p>`,
    },
    dam: {
      title: 'The Sevrin Dam',
      body: `<img src="assets/img/env/e01-city.webp" alt="The dam and the Spire" loading="lazy"><p>Five concrete arches across the river, built before the war, rebuilt by the Union to feed the Spire. Its hum can be felt in every building in City 9. Children born after the war think silence sounds like it.</p>
      <table>
        <tr><td>Output</td><td>The Spire first, the Nexus second, the forcefields third, the Stacks with what is left.</td></tr>
        <tr><td>Junction 7</td><td>The conduit vault inside the dam where the trunk to the Spire crosses the river. GRID inspects it weekly; RAZOR guards the crest.</td></tr>
        <tr><td>Pump houses</td><td>Old stations along the spillway and the D3 canals, mostly disused. The canal cells use them as doors.</td></tr>
      </table>`,
    },
    nexus: {
      title: 'The Nexus',
      body: `<img src="assets/img/env/e04-nexus.webp" alt="The Nexus" loading="lazy"><p>The old district council building in D1, rebuilt around the Civil Protection headquarters. Units speak of it by level:</p>
      <table>
        <tr><td>Roof</td><td>Airwatch landing pads; two Shrikes and a transport flight since the sociostatus.</td></tr>
        <tr><td>Top floor</td><td>Field Commander Vigil's office, which has no chair for visitors.</td></tr>
        <tr><td>Level 2</td><td>Biosignal screening. A steel chair, a cable, a JURY clerk.</td></tr>
        <tr><td>Muster</td><td>The briefing hall and the armoury cage.</td></tr>
        <tr><td>Level 3</td><td>The HELIX ward. White light that never dims.</td></tr>
        <tr><td>Level 4</td><td>JURY's cells and archive, below the river line. The walls sweat.</td></tr>
        <tr><td>—</td><td>A floor without a number, below Level 4. VECTOR's laboratories.</td></tr>
      </table>`,
    },
    works: {
      title: 'The Works (District 2)',
      body: `<p>Textile mills and the ration-packing plant along the river, behind a wall with one gate. The shift siren goes at 05:40 and 17:40 and the whole city sets its day by it.</p>
      <p>The warehouse behind the packing plant holds the city's ration reserve: six weeks, by the Union's arithmetic. The Civil Workers' Union runs the plant floor; HELIX certifies who is fit to work it; UNION guards the gate; GRID keeps the lights on.</p>`,
    },
    rations: {
      title: 'Ration tiers',
      body: `<table>
        <tr><td>Standard</td><td>One grey packet a day: nutrient bar, sector water, a sachet that claims to be coffee.</td></tr>
        <tr><td>CWU</td><td>A second packet and a canteen meal. Exempt from food contraband rules.</td></tr>
        <tr><td>Commended</td><td>Priority allocation, a new-issue jacket, a gold pin. Neighbours notice.</td></tr>
        <tr><td>Units</td><td>Precinct mess, three meals, real tea on Sundays. The first thing most recruits notice; the reason most of them came.</td></tr>
      </table>
      <p>Ration cards are tied to a CID. A card that outlives its holder is fraud; a card that is suspended is a sentence. Productivity adjustments are announced by broadcast and measured in grams.</p>`,
    },
    chalk: {
      title: 'Chalk (canal signs)',
      body: `<p>The canal cells write on the city at knee height, where a citizen kneeling to tie a shoe can see it and a masked unit walking past cannot. JURY has catalogued the signs:</p>
      <table>
        <tr><td>λ</td><td>We were here. On a door: this door is safe.</td></tr>
        <tr><td>λ with an arrow</td><td>A route. Follow it.</td></tr>
        <tr><td>Circle with a line</td><td>Do not trust this place, or this person.</td></tr>
        <tr><td>Tally lines</td><td>Somebody from here was taken. One line each.</td></tr>
        <tr><td>Empty circle</td><td>Unknown. JURY believes it is not a canal sign at all.</td></tr>
      </table>`,
    },
    oldtown: {
      title: 'Old Town (404)',
      body: `<p>East of the canal: the old cathedral quarter, the tram depots, fourteen blocks of flats with tables still laid. Quarantined since the night the Stacks still do not talk about.</p>
      <p>Officially nothing lives there. SPEAR walks its wall; VECTOR burns what crosses it; scavengers bring back tins from before the war and sometimes do not come back. Somewhere in it, people say, there is a block with glass in its windows and a garden.</p>`,
    },
  });
  G.CODEX_GROUPS[0].ids.push('war', 'dam', 'works', 'rations', 'oldtown', 'chalk');
  G.CODEX_GROUPS[2].ids.splice(1, 0, 'nexus');

  /* where each record is first met */
  const UNLOCK = {
    p_morning: 'war',
    u_start: 'rations',
    bt_intro: 'nexus',
    d_ration_1: 'works',
    c3_start: 'dam',
    c3_4: 'dam',
    dd_sprobe: 'oldtown',
    dd_sclear: 'oldtown',
    x2_spear_0: 'oldtown',
    dd_hcert: 'works',
    c4_start: 'works',
    dd_vsample: 'chalk',
    ev_canal: 'chalk',
    ev_canal_res: 'chalk',
    w_event: 'chalk',
  };
  Object.keys(UNLOCK).forEach((id) => G.extend(id, { after: (s) => G.unlock(s, UNLOCK[id]) }));
  /* chalk is learnt the first time the resistance trusts you a little */
  G.extend('u_board', { after: (s) => s.res >= 15 && G.unlock(s, 'chalk') });

  /* ===================================================== RUMOURS
     What happens in the other divisions' stories reaches the mess as talk. Rumours about your
     own division are skipped: you know better. */
  const RUMOURS = [
    { div: 'HELIX', t: 'They say a canal courier died on the HELIX ward and his body walked out of the morgue on its own.' },
    { div: 'HELIX', t: 'A HELIX medic in the queue for the urn says the Works failed forty people for fitness last cycle. Forty. She says it like a weight.' },
    { div: 'RAZOR', t: 'Somebody tried something on a man from City 1 on Bazaar Row. RAZOR says it was a tin with a wire. The wire went nowhere.' },
    { div: 'RAZOR', t: 'A RAZOR 03 called Sallow has been moved to the rail-yard gates. Nobody in a gold band will say why.' },
    { div: 'SPEAR', t: 'SPEAR came back from Old Town with one deserter and a story about potatoes. Nobody believes the potatoes.' },
    { div: 'SPEAR', t: 'Somebody keeps leaving a single potato on a fence post along the 404 wall. SPEAR has stopped reporting it.' },
    { div: 'VECTOR', t: 'VECTOR has a woman downstairs the infection will not take. They call her Nine. They let her have books.' },
    { div: 'VECTOR', t: 'A VECTOR suit came up from the floor without a number with the faceplate cracked from the inside.' },
    { div: 'GRID', t: 'GRID drew the blackout list for winter. One of the Stacks goes dark for six weeks. The Nexus upper floors stay warm.' },
    { div: 'GRID', t: 'Someone chalked the dam’s output figures on the end wall of a dark Stack. Every number. JURY scrubbed them off. They came back.' },
    { div: 'JURY', t: 'JURY found its leak, or found someone to call the leak. There is a new grey box on the Magistrate’s wall.' },
    { div: 'JURY', t: 'The Magistrate has stopped writing during tribunals. Nobody on Level 4 knows if that is good.' },
    { div: 'UNION', t: 'UNION delivered its two hundred for the relocation train. Granite has not smiled since. Granite never smiled before either.' },
    { div: 'UNION', t: 'A UNION 05 walked at the Overwatch line on relocation day saying his brother’s name. There is a new tally above the urn.' },
  ];
  G.rumour = (s) => {
    const pool = RUMOURS.filter((r) => r.div !== s.div && (s.chapter || 1) >= 2);
    if (!pool.length) return null;
    return pick(pool).t;
  };
  /* in the mess at cards, and as an occasional evening line */
  G.extend('ev_cards', { text: (lines, s) => (G.rumour(s) && (s.chapter || 1) >= 2 && Math.random() < 0.6 ? lines.concat('@say A unit at the next table|' + G.rumour(s)) : lines) });
  G.extend('u_evening', {
    text: (lines, s) => {
      if ((s.chapter || 1) >= 2 && Math.random() < 0.3) {
        const r = G.rumour(s);
        if (r) lines.splice(Math.max(0, lines.length - 1), 0, `In the locker room, somebody says: *“${r}”*`);
      }
      return lines;
    },
  });

  /* ===================================================== ECHOES of your own chapter two */
  const ECHO3 = (s) => {
    const c = s.c2 || {};
    if (s.div === 'HELIX' && c.end === 'smuggled') return 'In the stairwell of Stack 9 a woman in a red headscarf passes you and says, without stopping: *“He walks with a stick now. He says thank you for the stitches.”* Dana.';
    if (s.div === 'RAZOR' && c.end) return 'Overseer Strand’s report is pinned in the RAZOR briefing room now, one line underlined in red: *ration to be aligned with output*.';
    if (s.div === 'SPEAR' && c.end === 'spared') return 'There is a potato on the sill of the SPEAR locker room window this morning. Nobody admits to putting it there.';
    if (s.div === 'VECTOR' && c.end === 'kept') return 'On the floor without a number, tank 1 has a stack of books beside it now, and Nine reads with one hand flat against the glass.';
    if (s.div === 'VECTOR' && c.end === 'vial') return 'A HELIX medic mentions, puzzled, that a canal family in Stack 9 recovered from a bite last week. VECTOR has asked for the family’s address.';
    if (s.div === 'GRID' && c.dark) return 'The blackout block still has candlelight in its windows at night. GRID’s board shows it as dark. Both are true.';
    if (s.div === 'JURY' && s.flags.rook_amputated) return 'Rook’s locker in the D5 precinct has a new name on it. Somebody has scratched a small tally line under the old one.';
    if (s.div === 'UNION' && s.flags.mira_saved) return 'A JURY clerk asks you, on the stairs, about a hold on a citizen called Mira that she cannot find in the system. You tell her it is in the system.';
    return null;
  };
  G.extend('c3_0', {
    text: (lines, s) => {
      const e = ECHO3(s);
      if (e) lines.splice(1, 0, e);
      return lines;
    },
  });
  G.extend('c4_start', {
    text: (lines, s) => {
      const out = lines.slice();
      if (s.c3 && s.c3.result === 'open') out.push('Everybody at muster knows the ration cut is the price of the long night. Eleven minutes of darkness, paid for in grams.');
      if (s.c3 && s.c3.result === 'held') out.push('The canal cells were broken on the spillway. The ration cut comes anyway. Nobody at muster says *so what was it for*.');
      if (s.div === 'RAZOR' && s.c2 && s.c2.end) out.push('You recognise the phrase in the broadcast. It is from Overseer Strand’s report. You stood next to him while he wrote it.');
      if (s.div === 'GRID' && s.c2 && s.c2.dark) out.push('Sixty grams, and the blackout list still in your drawer. Winter is going to be very long in the Stacks.');
      return out;
    },
  });

  /* ===================================================== CHALK in the margins */
  const CHALK = [
    'Low on the wall by the precinct door, a small circle with a line through it. Somebody inside is not to be trusted. You wonder who chalked it, and about whom.',
    'Three tally lines on the door frame of a flat in Stack 22. Three taken. The door is painted over every week; the lines are back every Monday.',
    'A lambda with an arrow at knee height on a lamp post, pointing toward the canal.',
    'An empty circle, chalked very neatly on the step of the Nexus, where no citizen is allowed to walk.',
  ];
  G.extend('u_board', {
    text: (lines, s) => {
      if (s.codex && s.codex.includes('chalk') && Math.random() < 0.18) lines.splice(Math.min(2, lines.length), 0, pick(CHALK));
      return lines;
    },
  });
})();

/* ===================================================== PLACES ON SCREEN
   Each division's places get their own image: the first image in a scene is replaced, or one is
   added at the top if the scene had none. */
(function () {
  const IMG = {
    dd_hward: ['e26-helix-ward', 'The HELIX ward'],
    dd_hward_r0: ['e26-helix-ward', 'The HELIX ward'],
    dd_hmorgue: ['e26-helix-ward', 'Beneath the ward'],
    x2_helix_0: ['e26-helix-ward', 'The HELIX ward, bed 12'],
    x2_helix_2: ['e26-helix-ward', 'The third day'],
    dd_vlab: ['e27-vector-lab', 'The floor without a number'],
    dd_varch: ['e27-vector-lab', 'The floor without a number'],
    x2_vector_0: ['e27-vector-lab', 'Specimen Nine'],
    x2_vector_2: ['e27-vector-lab', 'Sectioning day'],
    dd_sprobe: ['e28-404-wall', 'The 404 wall'],
    dd_swall: ['e28-404-wall', 'Tower 6'],
    dd_sscav: ['e28-404-wall', 'The 404 wall at dawn'],
    x2_spear_0: ['e28-404-wall', 'Beyond the canal'],
    dd_rgate: ['e29-hardpoint', 'Hardpoint D1-3'],
    dd_rgate_r0: ['e29-hardpoint', 'Hardpoint D1-3'],
    dd_rlobby: ['e29-hardpoint', 'The road to the Nexus'],
    dd_hcert: ['e30-works', 'The Works — screening'],
    dd_hblood: ['e30-works', 'The Works'],
    dd_rstrike: ['e30-works', 'The Works at 05:40'],
    dd_sdepot: ['e31-tram-depot', 'The tram depot'],
    dd_stags: ['e31-tram-depot', 'The tram depot'],
    dd_gspire: ['e32-spire-base', 'The foot of the Spire'],
    x2_spear_2: ['e33-block11', 'Block 11'],
  };
  Object.keys(IMG).forEach((id) =>
    G.extend(id, {
      text: (lines) => {
        const tag = `@img assets/img/env/${IMG[id][0]}.webp|${IMG[id][1]}`;
        const i = lines.findIndex((l) => typeof l === 'string' && l.startsWith('@img '));
        if (i === 0 || i === 1) lines[i] = tag;
        else lines.unshift(tag);
        return lines;
      },
    })
  );
  const C = G.codexEntries;
  const addImg = (id, file, alt) => C[id] && !C[id].body.includes(file) && (C[id].body = `<img src="assets/img/env/${file}.webp" alt="${alt}" loading="lazy">` + C[id].body);
  addImg('oldtown', 'e28-404-wall', 'The 404 wall and Old Town');
  addImg('works', 'e30-works', 'The Works');
  addImg('helix', 'e26-helix-ward', 'The HELIX ward');
  addImg('vector', 'e27-vector-lab', 'The floor without a number');
  if (C.nexus) C.nexus.body = C.nexus.body.replace('</table>', '</table><img src="assets/img/env/e27-vector-lab.webp" alt="Below Level 4" loading="lazy">');
  if (C.spire) C.spire.body += '<img src="assets/img/env/e32-spire-base.webp" alt="The foot of the Spire" loading="lazy"><p>At its foot the conduits from the dam go into the alloy like roots into rock. GRID engineers who work there say the wall is warm.</p>';
})();

/* ===================================================== FACES
   Side characters: portraits, and contact cards where the player gets to know them. */
(function () {
  const P = (key, name, role) => (G.PEOPLE[key] = { name, role, img: key });
  P('nine', 'Specimen Nine', 'VECTOR · tank 1, the floor without a number');
  P('dana', 'Dana', 'Stack 9, 2B · red headscarf');
  P('strand', 'Overseer Strand', 'City 1 Productivity Office');
  P('administrator', 'The Administrator', 'City 9 · the residence above the Nexus');
  const pic = (key, cap) => `@portrait assets/img/portraits/${key}.webp|${cap}`;
  const after = (re, line) => (lines) => {
    const i = lines.findIndex((l) => typeof l === 'string' && re.test(l));
    lines.splice(i >= 0 ? i + 1 : lines.length, 0, line);
    return lines;
  };
  G.extend('x2_vector_0', { text: after(/Behind the glass/, pic('nine', 'Specimen Nine')), after: (s) => s.rel.nine === undefined && G.fx(s, { rel: { nine: 0 } }) });
  G.extend('x2_vector_2_argue', { after: (s) => G.fx(s, { rel: { nine: 25 } }) });
  G.extend('x2_vector_0', { choices: (list) => list.map((c) => (c.tag === 'MERCY' ? Object.assign({}, c, { fx: (s, g) => (G.fx(s, { rel: { nine: 15 } }), typeof c.fx === 'function' ? c.fx(s, g) : c.fx) }) : c)) });
  G.extend('x2_helix_2_out_ok', { text: after(/red headscarf/, pic('dana', 'Dana — CID 61094')), after: (s) => G.fx(s, { rel: { dana: 30 } }) });
  G.extend('c3_0', { text: (lines, s) => (s.div === 'HELIX' && s.c2 && s.c2.end === 'smuggled' ? after(/Dana\./, pic('dana', 'Dana'))(lines) : lines) });
  G.extend('x2_razor_2', { text: after(/Overseer Strand is small/, pic('strand', 'Overseer Strand, City 1')), after: (s) => s.rel.strand === undefined && G.fx(s, { rel: { strand: 0 } }) });
  G.extend('x2_razor_2_shield', { after: (s) => G.fx(s, { rel: { strand: 15 } }) });
  G.extend('dd_rresidence', { text: after(/dressing gown/, pic('administrator', 'The Administrator of City 9, 03:00')), after: (s) => s.rel.administrator === undefined && G.fx(s, { rel: { administrator: 0 } }) });
  if (G.codexEntries.war) G.codexEntries.war.body = G.codexEntries.war.body.replace('</p>', '</p><img src="assets/img/portraits/administrator.webp" alt="The Administrator" loading="lazy">');
})();

/* chapter four: the loading dock */
(function () {
  const dock = '@img assets/img/env/e25-warehouse.webp|The loading dock behind the packing plant, D2';
  ['c4_wh_stop', 'c4_wh_let'].forEach((id) => G.extend(id, { text: (lines) => [dock].concat(lines) }));
  if (G.codexEntries.works) G.codexEntries.works.body += '<img src="assets/img/env/e25-warehouse.webp" alt="The loading dock" loading="lazy">';
})();

/* ===================================================== the canal cells and the necrotic */
(function () {
  const C = G.codexEntries;
  if (C.resistance)
    C.resistance.body =
      '<img src="assets/img/resistance-sheet.webp" alt="The canal cells" loading="lazy">' +
      C.resistance.body +
      '<p>JURY sorts them by what they do: <b>couriers</b> who carry messages, food and forged cards through the stairwells; <b>lockmen</b> who know the canals and the pump houses; and <b>deserters</b> — former units who cut the tracking implant out of the back of their own skull. Their mark is stitched inside the collar, or chalked at knee height. Never worn.</p>';
  G.addCodex({
    necrotic: {
      title: 'The necrotic',
      body: `<img src="assets/img/necrotic-sheet.webp" alt="Necrotic progression" loading="lazy"><p>VECTOR's file on the infection of the quarantined districts. It enters through a bite and grows along the spine: grey, fibrous, like wet ash and lichen. It never glows.</p>
      <table>
        <tr><td>Early</td><td>Grey threads spread from the bite. The host still talks, still walks home. Bite screening exists for this stage.</td></tr>
        <tr><td>Mimic</td><td>The growth splits the back. The host repeats the last voice it heard, in that voice. SPEAR has a radio code for voices on the 404 wall.</td></tr>
        <tr><td>Bloom</td><td>Head and shoulders fuse into a hood of grey plates. It stands still, listening. VECTOR burns what it can reach.</td></tr>
      </table>
      <p>Specimen V-301 is the first sample in the Archivist's catalogue. Its label gives a source the Archivist will not discuss.</p>`,
    },
  });
  G.CODEX_GROUPS.find((g) => g.title === 'City 9').ids.push('necrotic');
  ['dd_sclear', 'dd_vtest', 'dd_vburn', 'x2_vector_0', 'x2_spear_2', 'mg_breach', 'mg_sample', 'dd_sprobe'].forEach((id) => G.extend(id, { after: (s) => G.unlock(s, 'necrotic') }));
  const top = (img, cap) => (lines) => {
    const tag = `@img ${img}|${cap}`;
    const i = lines.findIndex((l) => typeof l === 'string' && l.startsWith('@img '));
    if (i === 0) lines[0] = tag;
    else lines.unshift(tag);
    return lines;
  };
  G.extend('dd_sclear', { text: top('assets/img/necrotic-sheet.webp', 'VECTOR specimen file: what lives in Old Town') });
  G.extend('dd_vtest', { text: top('assets/img/necrotic-sheet.webp', 'What a bite becomes') });
  G.extend('c3_1', { text: (lines, s) => (s.c3 && s.c3.approach ? lines.concat('@img assets/img/resistance-sheet.webp|The canal cells') : lines) });
})();
