/* DUTIES IN THE NEW DISTRICTS — D6 Cathedral Ward, D7 Upper Town, D8 Hydro — and the Earth
   Administration as people you meet: District Prefect Sallow of D5, block wardens, the clerks of
   the Upper Town. One new duty for each division. */
(function () {
  const sup = (s) => G.superiorOf(s).name;
  const img = (n) => `assets/img/env/${n}.webp`;
  const ensure = (s, k) => s.rel[k] === undefined && (s.rel[k] = 0);
  G.PEOPLE.sallow = G.PEOPLE.sallow || { name: 'Prefect Sallow', role: 'District Prefect · D5 · bronze medallion', img: null };
  G.PEOPLE.ostrova = G.PEOPLE.ostrova || { name: 'Warden Ostrova', role: 'Block Warden · Stack 9 · grey sash', img: null };

  /* UNION — the Upper Town beat */
  G.divDuty({
    key: 'uupper', div: 'UNION', minRank: '02',
    name: 'Upper Town beat', desc: 'D7, across the river. Lit windows, full rations, and people who know your Prefect by name.',
    first: {
      title: 'D7 — the Upper Town, 10:00',
      img: img('e43-reception'),
      text: (s) => [
        'Across the bridge the streets are swept and the windows have glass in them. A commended citizen in a pressed jacket stops you to complain that a Stacks child has been seen begging at the bridgehead. He wants the child removed. He gives you his CID without being asked, so that you will know whose complaint it is.',
        `@say ${sup(s)}|The Upper Town files complaints with the Prefect, not with us. Whatever you do will be in Sallow’s inbox by noon.`,
      ],
      choices: [
        { t: 'Walk the child back across the bridge, gently.', out: ['The boy goes with you without arguing. At the far end he runs. The commended citizen watches the whole way, and seems satisfied.'], fx: { merit: 2, cons: 1 } },
        { t: 'Log it and do nothing. The bridge is public.', tag: 'MERCY', tagCls: 'mercy', out: ['Prefect Sallow’s clerk calls the precinct at 12:05 to ask which unit was on the Upper Town beat this morning.'], fx: (s) => (ensure(s, 'sallow'), (s.rel.sallow -= 5), { cons: 3, lp: -1 }) },
        { t: 'Arrest the child for vagrancy.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['A Level 1 entry. The boy is eleven. The commended citizen sends a note of thanks to your SqL.'], fx: (s) => (ensure(s, 'sallow'), (s.rel.sallow += 5), { merit: 4, lp: 2, cons: -6 }) },
      ],
    },
    routine: [
      { title: 'Upper Town beat', text: ['Swept streets, glass windows, a man walking a real dog.'], choices: [{ t: 'Walk it.', out: ['Nobody looks at you. Here, that is respect.'], fx: { merit: 2 } }] },
      { title: 'Upper Town — the bridgehead', text: ['Stacks citizens queue at the bridge for day passes to work in Upper Town kitchens. The pass clerk is slow, on purpose.'], choices: [{ t: 'Hurry the clerk along.', out: ['Thirty passes in ten minutes. The clerk files a complaint about you.'], fx: { cons: 2 } }, { t: 'Leave it. Not your queue.', out: ['The queue is still there at noon.'], fx: { merit: 1 } }] },
    ],
  });

  /* RAZOR — the Cathedral Ward checkpoint */
  G.divDuty({
    key: 'rcathedral', div: 'RAZOR', minRank: '01',
    name: 'Cathedral Ward checkpoint', desc: 'D6, the outer gate at the foot of the Spire. Overwatch on one side of you, nothing on the other.',
    first: {
      title: 'D6 — the outer checkpoint',
      img: img('e32-spire-base'),
      text: [
        'The outer gate of the Cathedral Ward: a forcefield across the old nave, an Overwatch soldier on the far side, you on this one. A High Command car arrives with its windows dark. The pass is correct. The car is heavier on its springs than an empty car should be.',
      ],
      choices: [
        { t: 'Wave it through. High Command is not searched.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['The field drops and closes. You never learn what was in the back. Nobody at this gate ever does.'], fx: { merit: 3, lp: 1 } },
        { t: 'Ask, politely, for the boot to be opened.', tag: 'RISK', tagCls: 'risk', check: { skill: 'authority', diff: 20, ok: ['The boot opens. Archive boxes, sealed, dozens of them, stamped with a city number that is not 9. The driver closes it again and thanks you for your diligence, and takes your designation.'], okFx: { merit: 2, susp: 4, cons: 2 }, bad: ['The window comes down two centimetres. A voice says your designation, all of it, and the window goes up again.'], badFx: { susp: 8 } } },
      ],
    },
    routine: [{ title: 'Cathedral Ward gate', text: ['The field hums. The Overwatch soldier on the far side has not moved in four hours.'], choices: [{ t: 'Hold the gate.', out: ['Two cars, a clerk on foot, a pigeon that hits the field.'], fx: { merit: 3 } }] }],
  });

  /* GRID — the turbine hall at Hydro */
  G.divDuty({
    key: 'ghydro', div: 'GRID',
    name: 'Hydro turbine hall', desc: 'D8, inside the dam. Five turbines, one allocation board, and a city that wants all of it.',
    first: {
      title: 'D8 — the turbine hall',
      img: img('e21-damcrest'),
      text: [
        'Inside the dam the noise is something you feel in your teeth. The allocation board has four switches the Spire owns, two the Upper Town owns, and one for the Stacks. Turbine 3 is running hot. Taking it down for an hour means somebody goes dark for an hour.',
      ],
      choices: [
        { t: 'Take the Stacks’ switch off for the hour.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['The Stacks go dark at 14:00. Nobody notices but the Stacks.'], fx: (s) => (G.distFx && ['s9', 's14', 's22'].forEach((k) => G.distFx(s, k, 0, 3)), { merit: 3 }) },
        { t: 'Take one of the Upper Town’s.', tag: 'RISK', tagCls: 'risk', out: ['The Upper Town goes dark at 14:00. Prefect Sallow’s office calls GRID within four minutes.'], fx: (s) => (ensure(s, 'sallow'), (s.rel.sallow -= 8), { cons: 4, susp: 3 }) },
        { t: 'Run turbine 3 hot and nurse it through the hour.', check: { skill: 'comms', diff: 15, ok: ['Sixty minutes of watching a needle. The turbine holds. Nobody goes dark.'], okFx: { merit: 4, xp: { comms: 1 } }, bad: ['The turbine trips. Everybody goes dark for twenty minutes, including the Spire, which notices.'], badFx: (s) => (G.discipline(s, 'minor', 'Turbine trip at Hydro'), { merit: -2 }) } },
      ],
    },
    routine: [{ title: 'Hydro turbine hall', text: ['Five turbines, all green.'], choices: [{ t: 'Log the readings.', out: ['Every needle where it should be.'], fx: { merit: 2 } }] }],
  });

  /* HELIX — the Upper Town clinic */
  G.divDuty({
    key: 'hclinic', div: 'HELIX',
    name: 'Upper Town clinic', desc: 'D7. Clean sheets, real medicine, and a waiting list that starts across the river.',
    first: {
      title: 'D7 — the Administration clinic',
      text: [
        'The Upper Town clinic has a cupboard of real antibiotics and a waiting room with chairs. A Stacks mother has come across the bridge on a kitchen pass with a feverish child in a blanket. The clinic is for Administration families. The receptionist is already reaching for the phone.',
      ],
      choices: [
        { t: 'Send them back to the HELIX ward in the Nexus.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['A three-hour walk with a fever. You write the referral very neatly.'], fx: { merit: 2, cons: -3 } },
        { t: 'Treat the child in the back room before anyone asks.', tag: 'MERCY', tagCls: 'mercy', check: { skill: 'medical', diff: 10, ok: ['One ampoule, eight hours, and a fever that breaks. The mother does not say thank you; she does not dare to speak in this building.'], okFx: { cons: 5, susp: 3, xp: { medical: 1 } }, bad: ['The Prefect’s wife comes in for her appointment and sees the blanket.'], badFx: (s) => (ensure(s, 'sallow'), (s.rel.sallow -= 10), G.discipline(s, 'minor', 'Administration clinic resources used without authorisation'), {}) } },
      ],
    },
    routine: [{ title: 'Upper Town clinic', text: ['A Prefect’s clerk with a sprained wrist. A commended citizen who would like more sleeping tablets.'], choices: [{ t: 'Treat them.', out: ['Clean sheets, warm water, thanks.'], fx: { merit: 2 } }] }],
  });

  /* JURY — the Prefect’s ledger */
  G.divDuty({
    key: 'jprefect', div: 'JURY',
    name: 'The Prefect’s ledger', desc: 'An audit of D5’s ration ledger for the District Prefect.',
    first: {
      title: 'The Nexus — the Prefect’s office',
      text: [
        'Prefect Sallow wants D5’s ration ledger audited before the month closes. He touches the bronze medallion on his ribbon while he explains that he expects to find a block warden stealing.',
        'You find one. Warden Ostrova of Stack 9 has been drawing rations for four people who died in the winter. She has been giving them to two orphans in flat 12 who are not on any list.',
      ],
      choices: [
        { t: 'Report it to the Prefect. Names, flats, figures.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['Sallow nods as if he had written the answer himself. The orphans go to the Nexus. Ostrova goes to Level 4.'], fx: (s) => (ensure(s, 'sallow'), ensure(s, 'ostrova'), (s.rel.sallow += 10), (s.rel.ostrova = -100), { merit: 6, lp: 3, cons: -10 }) },
        { t: 'Report the theft. Leave out the orphans.', out: ['Ostrova loses her sash. The orphans stay hidden, and now nobody is feeding them.'], fx: (s) => (ensure(s, 'ostrova'), (s.rel.ostrova -= 30), { merit: 3, cons: -4 }) },
        { t: 'Find the ledger correct.', tag: 'DECEPTION', tagCls: 'risk', check: { skill: 'deception', diff: 15, ok: ['Sallow reads your audit twice and signs it. Ostrova never learns how close it was.'], okFx: (s) => (ensure(s, 'ostrova'), (s.rel.ostrova += 15), { cons: 4, susp: 3 }), bad: ['Sallow has his own copy of the ledger. He has had it all along.'], badFx: (s) => (ensure(s, 'sallow'), (s.rel.sallow -= 15), G.discipline(s, 'serious', 'False audit submitted to the District Prefect'), {}) } },
      ],
    },
    routine: [{ title: 'The Prefect’s ledger', text: ['Columns of rations, flats, CIDs. The Prefect wants the figures by Friday.'], choices: [{ t: 'Audit it.', out: ['Eleven discrepancies, all small. You file them all.'], fx: { merit: 3 } }] }],
  });

  /* SPEAR — the culverts under the wall */
  G.divDuty({
    key: 'sculvert', div: 'SPEAR',
    name: 'Culvert sweep', desc: 'D3, the drowned basements and the tunnels that run under the 404 wall.',
    first: {
      title: 'D3 — the culverts',
      img: img('e13-pumphouse'),
      text: ['Waist-deep water, a rope, a lamp. The culvert under Lock 3 runs east, towards the wall. Somebody has stacked sandbags across it, and somebody else has cut a gap through the sandbags just big enough for a person.'],
      choices: [
        { t: 'Rebuild the wall of sandbags and report the gap.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['Two hours of sandbags. VECTOR comes to look at the gap and says nothing at all.'], fx: { merit: 3 } },
        { t: 'Follow the gap east.', tag: 'RISK', tagCls: 'risk', check: { skill: 'fitness', diff: 15, ok: ['Three hundred metres under the wall, a dry chamber with a mattress, tins and a child’s drawing. Somebody lives down here, between the city and the dead town.'], okFx: { merit: 3, xp: { fitness: 1 } }, bad: ['The water rises behind you. You come back up the rope with the lamp dead and something in the dark repeating your breathing.'], badFx: { hp: -12 } } },
      ],
    },
    routine: [{ title: 'Culvert sweep', text: ['Rope, lamp, water.'], choices: [{ t: 'Sweep it.', out: ['Rats. A boot. Nothing that moves when it should not.'], fx: { merit: 3 } }] }],
  });

  /* VECTOR — the Upper Town screening */
  G.divDuty({
    key: 'vupper', div: 'VECTOR',
    name: 'Upper Town screening', desc: 'D7. A monthly bite screening for Administration households, conducted with discretion.',
    first: {
      title: 'D7 — a household screening',
      text: ['An Administration flat with carpets. The Prefect’s eldest son has a bandage on his ankle he says is from a fall. The lamp says otherwise: grey threads, two centimetres. Early stage. His mother is standing in the doorway with her hand on her medallion ribbon.'],
      choices: [
        { t: 'Log it. He goes to the floor without a number, like anyone else.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['The mother does not say anything. The Prefect sends a car for you at 18:00 and nothing happens in it except a very long silence.'], fx: (s) => (ensure(s, 'sallow'), (s.rel.sallow -= 20), { merit: 6, lp: 3 }) },
        { t: 'Write “abrasion”. Leave a vial of suppressant with the mother.', tag: 'RISK', tagCls: 'risk', out: ['The mother takes the vial with both hands. The Prefect will remember this, one way or the other.'], fx: (s) => (ensure(s, 'sallow'), (s.rel.sallow += 20), { susp: 8, cons: -4 }) },
      ],
    },
    routine: [{ title: 'Upper Town screening', text: ['Carpets, lamps, clean ankles.'], choices: [{ t: 'Screen the household.', out: ['Clear.'], fx: { merit: 2 } }] }],
  });
})();
