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
