/* CHAPTER TWELVE — "Nova Prospekt". All divisions. One long day on one map.
   Rumours say Anticitizen One passed through Nova Prospekt, the Union's prison fortress on the
   coast. Vigil sends a detachment from City 9. You are not the garrison and the garrison knows it.
   ACT I (08:00–14:00, one hour a move): INSPECTION. Nine places on the painted map. Each holds one
   thing to look into: a gate log, a frightened intake, an old prisoner, an empty cell, torn records,
   an interrogation, a short armoury count, a transport train, a tampered breaker. Each gives you
   something (a clue, an ally, a price). You cannot do everything before the bell.
   ACT II (14:00–22:00): THE UPRISING. The cells open. Incidents flare at the same nine places, each
   with a clock. Force it, parley, or look the other way. What you leave burning, burns.
   EPILOGUE: what you found, and who you tell. Outcome: held / held at a cost / the cells open / lost.
   You remain Civil Protection throughout. Freeman is never named here by the Union: only the
   designation, and what people say in corridors. */
(function () {
  G.chapter({ n: 12, stages: [] });
  const pick = G.pick;
  const clamp = (v) => Math.max(0, Math.min(100, v));
  const C = (s) => s.c12;
  const VIGIL = '@portrait assets/img/portraits/vigil.webp|Field Commander Vigil';
  const MAP = 'assets/img/np-map.webp';
  const DORN = '@portrait assets/img/portraits/dorn.webp|Commandant Isak Dorn';
  const KELL = '@portrait assets/img/portraits/kell.webp|Sergeant Kell, NPG';
  const OLDMAN = '@portrait assets/img/portraits/np02386.webp|Prisoner NP-02386';
  const mk = (n, px, py, kind) => ({ name: n, x: Math.round(px * 16), y: Math.round(py * 9), kind });
  const NODES = {
    gate: mk('Main Gate', 11, 50),
    yard: mk('Processing Yard', 17, 29),
    cella: mk('Cellblock A', 45, 22),
    cellb: mk('Cellblock B', 45, 45),
    tower: mk('Control Tower', 63, 33),
    interro: mk('Interrogation Wing', 31, 66),
    armoury: mk('Armoury & Motor Pool', 66, 68),
    rail: mk('Rail Dock', 87, 51),
    power: mk('Power Plant', 81, 22),
  };
  const NK = Object.keys(NODES);
  const clock = (h) => `${String(h % 24).padStart(2, '0')}:00`;
  const dist = (a, b) => Math.hypot(NODES[a].x - NODES[b].x, NODES[a].y - NODES[b].y);
  const cost = (a, b) => (dist(a, b) > 700 ? 2 : 1);
  const warden = (s) => (G.partnerOf && G.partnerOf(s).key ? G.partnerOf(s).name : null);

  /* ---------------------------------------------------------- ACT I: what is at each place.
     an option is { t, tag, cls, check:[skill,diff], ok, bad, out } and a result is [text, fx, eff];
     eff changes the prison: clue, order, blood, freed, flag */
  const INS = {
    gate: { name: 'The gate log', icon: '?', text: [
      KELL,
      'Sergeant Kell keeps the gate book himself. NPG: Nova Prospekt Garrison, olive and amber, and not one of the Wardens at the gate has looked you in the face since you arrived. The book is on a shelf behind his head.',
    ], opts: [
      { t: 'Demand the book. You are here on Vigil’s authority.', check: ['authority', 5], ok: ['A transport from City 17 on the night of the train, no manifest, one prisoner, signed in at 03:10 and signed out at 03:40. Cell 7-C. Thirty minutes.', {}, { clue: 1 }], bad: ['Kell hands it over, politely, with the pages for that week glued together. You are not meant to notice the glue.', {}, {}] },
      { t: 'Ask for tea. Watch which Wardens leave the room.', check: ['perception', 5], ok: ['Two leave when you say “City 17”. Both of them go the same way, to the tower. You write it down.', {}, { clue: 1 }], bad: ['Tea. Nothing else. Kell is better at this than you are.', {}, {}] },
      { t: 'Leave the log. You are not here to audit a gatehouse.', out: ['Kell nods, almost grateful.', { merit: 1 }, {}] },
    ] },
    yard: { name: 'Intake', icon: '?', text: [
      '@img assets/img/env/e53-np-intake.webp|The processing yard, 08:00',
      'The processing yard. A shaved boy in grey canvas, NP-04117, is being cuffed to a rail by a Warden who is not looking at him. When you stop, the boy looks at your armband and then very hard at his own feet.',
    ], opts: [
      { t: 'Take him aside, gently. Ask what he saw at the intake desk.', tag: 'MERCY', cls: 'mercy', out: ['*“A man came through on his own, sir. Nobody cuffed him. The Wardens walked beside him like he was somebody else’s.”* He stops. *“He had a crowbar in his hand. Nobody took it off him.”*', { cons: 2 }, { clue: 1 }] },
      { t: 'Lean on him. He knows something and you will have it.', tag: 'BY THE BOOK', cls: 'loyal', check: ['authority', 5], ok: ['He tells you everything in one breath: the man, the crowbar, cell 7-C, a Warden holding a door. Then he is sick on your boots.', { cons: -2 }, { clue: 1 }], bad: ['He says nothing, very loudly. A Warden takes him away.', { cons: -2 }, {}] },
      { t: 'Leave him. Prisoners say things.', out: ['The Warden finishes the cuffs. The boy does not look up again.', {}, {}] },
    ] },
    cella: { name: 'The old man', icon: '?', text: [
      OLDMAN,
      'Cellblock A, long-term. The galleries are quiet in a way that costs effort. In a cell near the stair an old man, NP-02386, is mending his sleeve with a thread he has pulled out of his own blanket. He does not stand when you come.',
    ], opts: [
      { t: 'Talk to him. He has been here longer than the Wardens.', out: ['*“Six years. Do you know what I have learned? That they are afraid of the night shift. Come back before the third bell, unit, and stand somewhere with a wall behind you.”* He does not say what happens at the third bell.', { cons: 1 }, { flag: 'warned', clue: 1 }] },
      { t: 'Report the old man to Dorn. A warning is a plan.', tag: 'BY THE BOOK', cls: 'loyal', out: ['Dorn thanks you for your vigilance. By evening NP-02386 has been moved to the isolation cells, and the galleries are noisier.', { merit: 3, cons: -3 }, { order: -5 }] },
      { t: 'Nod and move on.', out: ['He goes back to his sleeve.', {}, {}] },
    ] },
    cellb: { name: 'Cell 7-C', icon: '?', text: [
      '@img assets/img/env/e54-np-cell7c.webp|Cell 7-C',
      'Cellblock B, third gallery. Cell 7-C is empty and has been scrubbed. Scrubbed recently: the floor is still damp at the edges. On the inside of the door someone has scratched a tally, and next to it a bar-shaped dent in the steel.',
    ], opts: [
      { t: 'Search it properly.', check: ['perception', 5], ok: ['The lock was never forced. It was opened from the outside with a Warden’s key, from the gallery side, and shut again behind a man who walked out of here. The tally has twelve marks and then stops.', {}, { clue: 1 }], bad: ['You find the damp, the dent and nothing else.', {}, {}] },
      { t: 'Photograph the door and send it to JURY.', tag: 'BY THE BOOK', cls: 'loyal', out: ['JURY will have a file by tonight. Dorn will hear about it by tonight.', { merit: 2, lp: 1 }, { clue: 1 }] },
      { t: 'Leave it. It is a cell.', out: ['A cell. A dent. You close the door.', {}, {}] },
    ] },
    tower: { name: 'The records room', icon: '?', text: [
      '@img assets/img/env/e55-np-records.webp|The records room',
      'The control tower records room is a tidy, airless room with a clerk in it. He has the look of a man who has been waiting all day for someone to ask him the one question.',
    ], opts: [
      { t: 'Ask for the transfer log for the night of the train.', check: ['perception', 5], ok: ['Pages 40 to 44 are missing from the ledger, cut with a razor, and the clerk’s eyes go to the stove. In the stove: ash, and half a page. “By order of the Commandant.”', {}, { clue: 1 }], bad: ['The ledger is whole. Too whole. It has been rewritten in one hand.', {}, {}] },
      { t: 'Put your hand flat on the ledger and say nothing.', tag: 'RISK', cls: 'risk', out: ['Silence works on clerks. *“I did not burn it. I only watched.”* He gives you a name: a Warden, an officer, a key.', {}, { clue: 1 }] },
      { t: 'Thank him and go.', out: ['He looks, for a moment, disappointed.', {}, {}] },
    ] },
    interro: { name: 'The interrogation wing', icon: '?', text: [
      'A Warden with a JURY-style slate is working on a prisoner in a chair under a lamp. The prisoner is saying a name over and over, softly, the way you say a prayer you do not believe. It is not the Union’s designation.',
    ], opts: [
      { t: 'Stop it. You are inspecting this wing.', tag: 'MERCY', cls: 'mercy', check: ['authority', 5], ok: ['The Warden stops. The prisoner is led away. In the doorway he says, to nobody: *“He was let out. Not broken out. Let out, by somebody who had a key and wanted to see where he went.”*', { cons: 3, susp: 2 }, { clue: 1 }], bad: ['The Warden stops until you leave the room, and then starts again.', { cons: 1 }, {}] },
      { t: 'Watch. See what he says.', out: ['Nothing you can use. You also do not stop it.', { cons: -2 }, {}] },
      { t: 'Take over the interrogation yourself.', tag: 'BY THE BOOK', cls: 'loyal', out: ['He tells you about the key. He tells you the officer’s rank. He tells you much more by the end, and you will remember it.', { merit: 3, cons: -5 }, { clue: 1 }] },
    ] },
    armoury: { name: 'The armoury count', icon: '?', text: [
      'The armoury is orderly. The shelves, though, have been arranged to hide an absence: forty carbines short and three crates of grenades not where the book says. Nobody has reported it.',
    ], opts: [
      { t: 'Log the shortage. It goes to Dorn and to Vigil.', tag: 'BY THE BOOK', cls: 'loyal', out: ['The shortage is on paper now. The Wardens at the doors look at their boots.', { merit: 3, lp: 1 }, {}] },
      { t: 'Count the weapons in the Wardens’ hands. Not the ones on the shelves.', check: ['perception', 5], ok: ['The Wardens at the cellblock doors are carrying batons. Only batons. Whoever has the carbines is not guarding the cells.', {}, { clue: 1 }], bad: ['Everyone is armed exactly as they should be, and you learn nothing.', {}, {}] },
      { t: 'Say nothing, and take a carbine yourself.', tag: 'RISK', cls: 'risk', out: ['A spare weapon is a spare weapon. Nobody comments.', { susp: 1 }, {}] },
    ] },
    rail: { name: 'The transport train', icon: '?', text: [
      '@img assets/img/env/e56-np-raildock.webp|The transport dock',
      'A transport train waits at the dock with its doors open and a hundred and eighty names on the manifest, due north at 15:00 to “reprocessing”. The Wardens loading it will not say where north is.',
    ], opts: [
      { t: 'Walk the wagons. Check who is on the manifest.', check: ['medical', 5], ok: ['Half of them are sick. Four are very sick. You mark them for HELIX and hold the train until they are off it.', { cons: 4, xp: { medical: 1 } }, { order: -3 }], bad: ['You see a lot of grey faces and cannot tell the sick from the afraid.', {}, {}] },
      { t: 'Sign the manifest. It is not your train.', tag: 'BY THE BOOK', cls: 'loyal', out: ['The train leaves on time. Nobody tells you where north is.', { merit: 1, cons: -3 }, { order: 3 }] },
      { t: 'Delay the train. A signature with the wrong date.', tag: 'MERCY', cls: 'mercy', out: ['The train stays at the dock another three hours, and when the cells open it will still be here.', { cons: 2, susp: 2 }, { flag: 'train' }] },
    ] },
    power: { name: 'The breaker panel', icon: '?', text: [
      'A GRID technician is kneeling at a breaker panel, watching you come with the look of a man who would like to be somewhere else. The panel has been opened and closed so many times the screws have gone bright.',
    ], opts: [
      { t: 'Reseal it. Sweep the cabinet for tampering.', check: ['perception', 5], ok: ['A second feed, wired round the main breaker, ready for a hand on a lever. Whoever uses it can put the whole fortress in the dark at once. You cut it.', { merit: 2 }, { flag: 'power', clue: 1 }], bad: ['The cabinet looks like any cabinet. You close it and hope.', {}, {}] },
      { t: 'Ask the technician what he is afraid of.', tag: 'MERCY', cls: 'mercy', out: ['*“That the lights go out at three bells, unit.”* He will say no more. You note the hour.', { cons: 1 }, { flag: 'warned' }] },
      { t: 'Leave it. Not your department.', out: ['The technician lets out a breath.', {}, {}] },
    ] },
  };

  /* ---------------------------------------------------------- ACT II: the same places, on fire */
  const RIOT = {
    gate: { name: 'Reinforcements at the gate', icon: '‼', text: 'The gate is shut from the inside. Wardens on the wall are shouting down to a column of Prospekt reinforcements who cannot get in, because someone does not trust the gate to the sergeant.', opts: [
      { t: 'Open the gate and let them in. Take command.', tag: 'BY THE BOOK', cls: 'loyal', out: ['Forty Wardens in amber and olive go through the gate at the run.', { merit: 3 }, { order: 8, blood: 1 }] },
      { t: 'Hold the gate shut and talk to the column.', check: ['authority', 10], ok: ['They stop at the gate. They put their weapons down. It will be remembered.', { cons: 3, merit: 2 }, { order: 5 }], bad: ['They think you are a mutineer. The first shots are on the gate.', { hp: -4 }, { order: -4, blood: 1 }] },
    ] },
    yard: { name: 'The yard is turning', icon: '‼', img: 'e58-np-yard-turns', text: 'The processing yard is full of prisoners and the queue has broken. A few hundred people in grey canvas are walking, not running, towards the main gate. The Wardens on the wall are not shooting yet.', opts: [
      { t: 'Close the yard gates and fire over their heads.', tag: 'BY THE BOOK', cls: 'loyal', out: ['The crowd stops. A few people on the ground, not many. The rest go back to the sheds.', { merit: 3, cons: -4 }, { order: 9, blood: 1 }] },
      { t: 'Walk out in front of them with your hands open.', tag: 'RISK', cls: 'risk', check: ['authority', 10], ok: ['Nobody has done that here in six years. The crowd stops at your feet, and an old woman says: “Where do you want us?”', { cons: 5, merit: 2 }, { order: 6 }], bad: ['A thrown boot, then the sound a crowd makes when it has chosen.', { hp: -5 }, { order: -6, blood: 1 }] },
      { t: 'Open the yard gate and let them through to the road.', tag: 'MERCY', cls: 'mercy', out: ['They go through the gate in a long grey line, walking, not running, and the Wardens on the wall do not fire.', { cons: 5, susp: 6, res: 3 }, { freed: 2, order: -6 }] },
    ] },
    cella: { name: 'The cells are open', icon: '‼', img: 'e57-np-blackout', text: 'On Cellblock A every door has sprung at once, and the galleries are filling. The old man is standing in the middle of the ground floor, perfectly still, and the Wardens have backed against the far wall.', opts: [
      { t: 'Push the Wardens in and clear the galleries.', tag: 'BY THE BOOK', cls: 'loyal', out: ['It takes forty minutes and every Warden on the floor. Cells close one at a time.', { merit: 4, cons: -5 }, { order: 10, blood: 2 }] },
      { t: 'Go and stand beside the old man. Ask what he wants.', tag: 'MERCY', cls: 'mercy', out: ['*“The same as you. To go home. Give us the stairs, unit, and we will give you the floor.”* It is a better offer than most.', { cons: 4, susp: 3, res: 2 }, { order: 3, freed: 1 }] },
    ] },
    cellb: { name: 'The collapsed gallery', icon: '‼', text: 'The third gallery of Cellblock B has come down, taking half the cells with it. There are Wardens under it, and prisoners under it, and nobody can tell which are which.', opts: [
      { t: 'Dig. All of them. In the order you find them.', tag: 'MERCY', cls: 'mercy', check: ['fitness', 10], ok: ['Eleven out of seventeen. Wardens and prisoners side by side on the ground. Nobody asks which.', { cons: 5, merit: 2 }, { order: 4 }], bad: ['The slab shifts. You save three, and watch the rest.', { hp: -5, cons: 1 }, { blood: 2 }] },
      { t: 'Wardens first. They are yours.', tag: 'BY THE BOOK', cls: 'loyal', out: ['Nine Wardens come out alive. Whoever is left under the slab is left.', { merit: 3, cons: -4 }, { order: 3, blood: 2 }] },
    ] },
    tower: { name: 'The tower is barricaded', icon: '‼', text: 'The control tower has been shut from the inside: Wardens, a handful, the clerk among them, firing down on the yard with whatever came to hand. They have Dorn, and they have the comms.', opts: [
      { t: 'Storm the tower stair.', tag: 'BY THE BOOK', cls: 'loyal', out: ['Six minutes of noise on a spiral stair. When it ends, the comms are yours.', { merit: 4, hp: -4 }, { order: 8, blood: 1 }] },
      { t: 'Call up and parley. Offer them the room.', tag: 'RISK', cls: 'risk', check: ['deception', 10], ok: ['They come down. The clerk is crying. Dorn is white and silent and unhurt.', { merit: 3, cons: 2 }, { order: 6 }], bad: ['They do not believe you. Neither would you.', {}, { order: -4 }] },
    ] },
    interro: { name: 'The wing is held', icon: '‼', text: 'The interrogation wing is quiet in a way that is wrong. The prisoners have the building. The Wardens inside have been tied to their own chairs, under their own lamp.', opts: [
      { t: 'Go in with a team and take the wing.', tag: 'BY THE BOOK', cls: 'loyal', out: ['Eleven prisoners in the corridor, nine alive when you leave.', { merit: 3, cons: -5 }, { order: 7, blood: 2 }] },
      { t: 'Negotiate. Trade the Wardens for safe passage to the yard.', tag: 'RISK', cls: 'risk', check: ['authority', 10], ok: ['The Wardens walk out, bruised, with their dignity. The prisoners walk out the other way, to the yard, to the others.', { cons: 4, merit: 1 }, { order: 3 }], bad: ['They want more than you have to give.', { hp: -3 }, { order: -4 }] },
      { t: 'Cut the Wardens loose and step back from the door.', tag: 'MERCY', cls: 'mercy', out: ['Nobody tells you not to.', { cons: 3, susp: 3 }, { freed: 1, order: -2 }] },
    ] },
    armoury: { name: 'The armoury is open', icon: '‼', text: 'The armoury doors are standing open and the carbines are gone. Whoever took them is moving across the compound in good order, in twos. These are not rioters.', opts: [
      { t: 'Seal the motor pool and hold the vehicles.', tag: 'BY THE BOOK', cls: 'loyal', out: ['The trucks stay where they are. So does everyone who needs them.', { merit: 3 }, { order: 6, blood: 1 }] },
      { t: 'Let them go. You cannot stop trained people with what you have.', tag: 'RISK', cls: 'risk', out: ['They go. Not towards you.', { cons: 1, susp: 2 }, { freed: 1 }] },
    ] },
    rail: { name: 'The transport dock', icon: '‼', img: 'e56-np-raildock', text: 'Prisoners are pouring across the dock to the train. Some want to leave on it. Some are pulling others off. A Warden at the lift is being shouted down by a woman holding a child.', opts: [
      { t: 'Clear the dock and send the train out empty.', tag: 'BY THE BOOK', cls: 'loyal', out: ['The train goes north with no one in it. The dock empties at gunpoint.', { merit: 3, cons: -4 }, { order: 7, blood: 1 }] },
      { t: 'Get the sick and the children onto it, and let it go.', tag: 'MERCY', cls: 'mercy', out: ['It leaves with a hundred and twenty people. You do not ask where north is. You write “reprocessed” in the book.', { cons: 6, susp: 5, res: 3 }, { freed: 2, order: -2 }] },
      { t: 'Hold the dock until Wardens arrive.', out: ['Eight minutes. Eight long minutes. Then the Wardens.', { hp: -3, merit: 2 }, { order: 4 }] },
    ] },
    power: { name: 'Fire in the plant', icon: '‼', text: 'The generator hall is on fire, and the GRID technician from the breaker panel is the only person inside it. The lights in the compound are brown and flickering.', opts: [
      { t: 'Go in and help him.', tag: 'MERCY', cls: 'mercy', check: ['fitness', 10], ok: ['Two of you, a hose and a wrench. The lights come back, one sector at a time.', { cons: 4, merit: 2 }, { order: 6 }], bad: ['You get him out. The lights do not come back for an hour.', { hp: -5, cons: 2 }, { order: -4 }] },
      { t: 'Seal the hall. The fire is not your problem.', tag: 'BY THE BOOK', cls: 'loyal', out: ['The hall burns out. So does he.', { cons: -5, merit: 1 }, { order: -4, blood: 1 }] },
    ] },
  };

  /* ---------------------------------------------------------- state */
  const apply = (s, e) => {
    const c = C(s);
    if (!e) return;
    if (e.clue) c.clues += e.clue;
    if (e.order) c.order = clamp(c.order + e.order);
    if (e.blood) c.blood += e.blood;
    if (e.freed) c.freed += e.freed;
    if (e.flag) c.flags[e.flag] = true;
  };
  const riotStart = (s) => {
    const c = C(s);
    c.phase = 'riot';
    const pool = NK.slice();
    const n = c.flags.power ? 5 : 7;
    c.ev = [];
    while (c.ev.length < n && pool.length) {
      const k = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      c.ev.push({ node: k, ttl: 3 + Math.floor(Math.random() * 3) + (c.flags.warned ? 2 : 0) });
    }
    c.end = 22;
    c.order = clamp(c.order - (c.flags.power ? 5 : 18));
  };
  const tick = (s, n) => {
    const c = C(s);
    for (let i = 0; i < n; i++) {
      c.hour++;
      if (c.phase === 'riot') {
        c.ev.forEach((e) => e.ttl--);
        c.ev.filter((e) => e.ttl <= 0).forEach((e) => {
          c.missed++;
          c.order = clamp(c.order - 10);
          c.blood += 1;
          c.log.push(`${clock(c.hour)} — ${RIOT[e.node].name.toLowerCase()}: nobody came.`);
        });
        c.ev = c.ev.filter((e) => e.ttl > 0);
      }
    }
    if (c.phase === 'inspect' && c.hour >= 14) riotStart(s);
  };
  const outcome = (c) => (c.freed >= 4 ? 'open' : c.order < 30 ? 'lost' : c.blood >= 4 ? 'bloody' : 'held');

  /* ---------------------------------------------------------- the map */
  function mapSvg(s) {
    const c = C(s);
    const riot = c.phase === 'riot';
    let g = `<svg viewBox="0 0 1600 900" class="pt-svg${riot ? ' night' : ''}" role="img" aria-label="Nova Prospekt map">`;
    g += `<image href="${MAP}" x="0" y="0" width="1600" height="900" preserveAspectRatio="xMidYMid slice"/>`;
    g += `<rect x="0" y="0" width="1600" height="900" fill="${riot ? 'rgba(30,6,4,.5)' : 'rgba(6,10,13,.3)'}"/>`;
    const here = NODES[c.at];
    NK.forEach((k) => k !== c.at && (g += `<line x1="${here.x}" y1="${here.y}" x2="${NODES[k].x}" y2="${NODES[k].y}" class="pt-path"/>`));
    NK.forEach((k) => {
      const n = NODES[k];
      const e = riot ? c.ev.find((x) => x.node === k) : null;
      const open = !riot && !c.seen[k];
      g += `<g class="pt-node${k === c.at ? ' here' : ''}${e || open ? ' hot' : ''}" data-pt="${k}" tabindex="0" role="button" aria-label="${n.name}">`;
      g += `<circle cx="${n.x}" cy="${n.y}" r="${e || open ? 26 : 18}"/>`;
      if (e) g += `<text x="${n.x}" y="${n.y + 9}" class="pt-ico">${RIOT[k].icon}</text><text x="${n.x + 30}" y="${n.y - 18}" class="pt-ttl">${e.ttl}h</text>`;
      else if (open) g += `<text x="${n.x}" y="${n.y + 9}" class="pt-ico">?</text>`;
      g += `<text x="${n.x}" y="${n.y + 48}" class="pt-name">${n.name.toUpperCase()}</text></g>`;
    });
    g += `<g class="pt-you"><circle cx="${here.x}" cy="${here.y}" r="9"/></g>`;
    return g + '</svg>';
  }
  G.afterRender.push((sc, id, block) => {
    if (id !== 'np_map') return;
    const s = G.state();
    block.querySelectorAll('.choice').forEach((b) => {
      const m = NK.find((k) => b.textContent.includes('Walk to ' + NODES[k].name));
      if (m) b.dataset.ptgo = m;
      else if (/Deal with it|Look into it/.test(b.textContent)) b.dataset.ptgo = C(s).at;
    });
  });

  const scenes = {
    c12_start: {
      checkpoint: true,
      safe: true,
      title: 'Chapter Twelve',
      enter: (s) => {
        s.chapter = 12;
        s.c12 = { stage: 0, startDay: s.day, phase: 'brief', seen: {}, flags: {}, clues: 0, order: 60, blood: 0, freed: 0, missed: 0, handled: 0, log: [], ev: [], at: 'gate', hour: 8, end: 22, report: null};
      },
      text: [
        '@big CHAPTER TWELVE',
        '@sys ALL DIVISIONS · NOVA PROSPEKT',
        '@img assets/img/env/e52-nova-prospekt.webp|Nova Prospekt, from the approach road',
        'Four days after the siege, the dispatch comes on the Sector radio and not on the Union’s. It is addressed to no one in particular. It says that a prisoner was seen leaving Nova Prospekt who had not been entered into its books.',
        'It uses the designation: Anticitizen One. It uses it three times.',
      ],
      choices: [{ t: 'Report to Vigil.', go: 'c12_brief' }],
    },
    c12_brief: {
      title: 'The Nexus — operations room',
      text: (s) => [
        VIGIL,
        '@say Vigil|Nova Prospekt is not ours. It is the Sector’s, and the Sector has stopped answering. A prisoner walked out of it, or was let out. The books do not say. I want to know which.',
        '@say Vigil|Take a detachment. Go there, look at everything, and do not make a scene. And, unit: the garrison is not City 9’s. They will smile at you. Keep your back to a wall.',
        warden(s) ? `${warden(s)} will go with you.` : null,
        '@sys One day on site. Eight hours of inspection, then whatever comes after. The inspection is the thing you are good at. The rest is up to you.',
      ],
      choices: [{ t: 'Board the convoy.', go: 'c12_travel' }],
    },
    c12_travel: {
      title: 'The coast road — dusk',
      text: [
        'Two hours north in a convoy of three trucks, along the coast road you have already cleared once. The sea is on the left, the colour of a wet slate. The checkpoints on the way are staffed by people who have not slept.',
        '@img assets/img/env/e52-nova-prospekt.webp|Nova Prospekt',
        'The fortress rises out of the plateau long before you reach it, a stepped concrete quarry with a searchlight on top. Under the gate tower, in the rain, a line of Wardens stands without moving. Olive coats. Amber visors. They look nothing like the police you know.',
      ],
      choices: [{ t: 'Present your papers at the gate.', go: 'c12_dorn' }],
    },
    c12_dorn: {
      title: 'Nova Prospekt — the Commandant',
      enter: (s) => {
        G.unlock(s, 'nova');
        G.unlock(s, 'wardens');
        G.unlock(s, 'detainees');
      },
      text: (s) => [
        '@img assets/img/uniform-npg.webp|Prospekt Wardens, garrison uniform',
        DORN,
        'Commandant Isak Dorn is a tall, grey, careful man with a Warden’s olive collar and a CP officer’s hands. He receives you in an office whose window looks onto the yard. He does not stand.',
        '@say Dorn|The City 9 detachment. Vigil sent you. How kind. We have a prison to run, unit, and a night coming that I do not think you will enjoy. You have my permission to walk the compound until the bell. Sergeant Kell will not follow you.',
        '@say Dorn|If you find anything, I would like to hear it first. That is not a request.',
        '@sys NOVA PROSPEKT · INSPECTION. Eight hours. Nine places. Tap one on the map, or use the list below. Far places cost two hours.',
      ],
      choices: [{ t: 'Leave the office.', fx: (st) => ((C(st).phase = 'inspect'), (C(st).at = 'gate'), (C(st).hour = 8), (st.time = 'Day'), null), go: 'np_map' }],
    },
    np_map: {
      checkpoint: true,
      title: (s) => `Nova Prospekt — ${clock(C(s).hour)}`,
      enter: (s) => {
        const c = C(s);
        if (c.phase === 'riot' && !c.alarmed) {
          c.alarmed = true;
          return 'np_alarm';
        }
        if (c.phase === 'riot' && (c.hour >= c.end || !c.ev.length)) return 'np_after';
      },
      text: (s) => {
        const c = C(s);
        const riot = c.phase === 'riot';
        return [
          '@html <div class="pt-wrap">' + mapSvg(s) + '</div>',
          riot ? `@sys ${clock(c.hour)} · THE UPRISING. Order ${c.order}% · Handled ${c.handled}. It ends at ${clock(c.end)}, or when nothing is left burning. Far places take two hours.` : `@sys ${clock(c.hour)} · INSPECTION. You are at ${NODES[c.at].name}. The bell is at 14:00. Clues: ${c.clues}.`,
          riot && c.ev.length ? '@sys ' + c.ev.map((e) => `${RIOT[e.node].icon} ${RIOT[e.node].name} — ${NODES[e.node].name} (${e.ttl}h)`).join(' · ') : null,
        ];
      },
      choices: (s) => {
        const c = C(s);
        const riot = c.phase === 'riot';
        const list = [];
        const here = riot ? c.ev.find((e) => e.node === c.at) : !c.seen[c.at] ? { node: c.at } : null;
        if (here) list.push({ t: riot ? `**Deal with it:** ${RIOT[c.at].name.toLowerCase()}.` : `**Look into it:** ${INS[c.at].name.toLowerCase()}.`, tag: 'HERE', tagCls: 'duty', go: riot ? 'np_ev' : 'np_ins' });
        NK.filter((k) => k !== c.at).forEach((k) => {
          const e = riot ? c.ev.find((x) => x.node === k) : null;
          const open = !riot && !c.seen[k];
          const h = cost(c.at, k);
          list.push({ t: `Walk to ${NODES[k].name}${h > 1 ? ' (2h)' : ''}${e ? ` — ${RIOT[k].name.toLowerCase()} (${e.ttl}h left)` : open ? ` — ${INS[k].name.toLowerCase()}` : ''}.`, fx: (st) => { const from = C(st).at; C(st).at = k; tick(st, cost(from, k)); return null; }, go: 'np_map' });
        });
        list.push({ t: riot ? 'Hold position for an hour.' : 'Stand here for an hour and watch the Wardens.', fx: (st) => (tick(st, 1), null), go: 'np_map' });
        return list;
      },
    },
    np_ins: {
      title: (s) => `${NODES[C(s).at].name} — ${INS[C(s).at].name.toLowerCase()}`,
      text: (s) => INS[C(s).at].text,
      choices: (s) => {
        const c = C(s);
        const k = c.at;
        const fin = (res) => (st) => {
          const q = C(st);
          q.res = res[0];
          q.seen[k] = true;
          q.handled++;
          apply(st, res[2]);
          tick(st, 1);
          return res[1];
        };
        return INS[k].opts.map((o) =>
          o.check
            ? { t: o.t, tag: o.tag, tagCls: o.cls, check: { skill: o.check[0], diff: o.check[1], pass: 'np_res', fail: 'np_res', okFx: fin(o.ok), failFx: fin(o.bad) } }
            : { t: o.t, tag: o.tag, tagCls: o.cls, fx: fin(o.out), go: 'np_res' }
        );
      },
    },
    np_ev: {
      title: (s) => `${NODES[C(s).at].name} — ${RIOT[C(s).at].name.toLowerCase()}`,
      enter: (s) => (C(s).ev.some((e) => e.node === C(s).at) ? undefined : 'np_map'),
      text: (s) => [RIOT[C(s).at].img ? `@img assets/img/env/${RIOT[C(s).at].img}.webp|${NODES[C(s).at].name}` : null, RIOT[C(s).at].text],
      choices: (s) => {
        const c = C(s);
        const k = c.at;
        const fin = (res) => (st) => {
          const q = C(st);
          q.res = res[0];
          q.ev = q.ev.filter((e) => e.node !== k);
          q.handled++;
          apply(st, res[2]);
          tick(st, 1);
          return res[1];
        };
        return RIOT[k].opts.map((o) =>
          o.check
            ? { t: o.t, tag: o.tag, tagCls: o.cls, check: { skill: o.check[0], diff: o.check[1], pass: 'np_res', fail: 'np_res', okFx: fin(o.ok), failFx: fin(o.bad) } }
            : { t: o.t, tag: o.tag, tagCls: o.cls, fx: fin(o.out), go: 'np_res' }
        );
      },
    },
    np_res: { text: (s) => [C(s).res], choices: [{ t: 'Back to the compound.', go: 'np_map' }] },
    np_alarm: {
      checkpoint: true,
      title: 'Nova Prospekt — 14:00',
      enter: (s) => G.unlock(s, 'detainees'),
      text: (s) => [
        '@img assets/img/env/e57-np-blackout.webp|Cellblock A, 14:00',
        '@sys 14:00. THE BELL.',
        C(s).flags.power ? 'The third bell goes. The lights do not. You cut the second feed that morning, and the compound stays lit, and somewhere inside Cellblock A a door that was meant to open in the dark opens in the light instead.' : 'The third bell goes. And then, all at once, the lights go out in every building in Nova Prospekt. In the dark you can hear every cell door in the fortress spring open at the same moment, like a single sound.',
        'Wardens are shouting on the walls. Somewhere a siren starts, and stops, as if someone has pulled the wire. Whatever was waiting for you to be inside the fortress has begun.',
        C(s).flags.warned ? 'The old man’s words are in your head: stand somewhere with a wall behind you.' : null,
      ],
      choices: [{ t: 'Move.', go: 'np_map' }],
    },
    np_after: {
      checkpoint: true,
      title: 'Nova Prospekt — 22:00',
      enter: (s) => {
        const c = C(s);
        c.out = outcome(c);
        G.fx(s, { merit: 2 + c.handled });
      },
      text: (s) => {
        const c = C(s);
        const lines = {
          held: 'By ten the lights are back, the cells are shut and the galleries are quiet. Nova Prospekt is a prison again. A thing that has been held can be counted, and the count is short.',
          bloody: 'By ten the cells are shut. The floors on Cellblock A and the yard are not clean, and will not be before morning. Nova Prospekt is a prison again, and every Warden in it knows what it cost.',
          open: 'By ten, most of Cellblock A is empty, and so is the yard. Four hundred people are on the coast road in the dark, walking inland, and nobody is shooting at them. Nova Prospekt still stands. It no longer holds anyone.',
          lost: 'By ten, the compound is not yours. The prisoners hold the galleries and the Wardens hold the walls, and nobody holds the middle. Vigil will have to send more than a detachment.',
        }[c.out];
        return [`@doc NOVA PROSPEKT — INCIDENT REPORT\nHANDLED: ${c.handled}\nMISSED: ${c.missed}\nORDER: ${c.order}%\nRELEASED: ${c.freed}\nCASUALTIES: ${c.blood}`, lines, ...c.log.slice(-3)];
      },
      choices: [{ t: 'Go to Dorn’s office.', go: 'c12_final' }],
    },
    c12_final: {
      title: 'The Commandant’s office — night',
      text: (s) => {
        const c = C(s);
        const know = c.clues >= 3;
        return [
          '@say Dorn|You are alive. So am I. I would like to know what you think happened here today, and what you think happened here four nights ago. Please be honest. It is, as they say, late.',
          know ? 'You know. A man was brought in at 03:10, no manifest, no cuffs, a crowbar in his hand, and put in cell 7-C. He was let out at 03:40 by an officer with a key who did not report it, and the pages were cut out of the ledger afterwards. Someone wanted him out, and someone wanted him followed.' : 'You have fragments: a gate log with the pages glued together, a boy who saw a man with a crowbar, a cell scrubbed too clean. Not enough to say who opened the door. Enough to say it was opened.',
          c.clues >= 5 ? 'And you know whose key. The one on the Commandant’s own ring.' : null,
        ];
      },
      choices: (s) => {
        const c = C(s);
        const fin = (rep, fx) => (st) => ((C(st).report = rep), fx);
        const list = [{ t: 'Give Dorn’s account to Vigil, with what you have. Name the key.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: fin('truth', { merit: 6, lp: 3, cons: -2 }), go: 'c12_end' }, { t: 'Say it was a prison riot and nothing more. Keep the cell, the log and the key out of it.', tag: 'RISK', tagCls: 'risk', fx: fin('buried', { merit: 2, cons: -2, susp: -2 }), go: 'c12_end' }];
        if (c.flags.warned || c.freed >= 1) list.push({ t: 'Give a copy to the old man’s people, so someone else can use it.', tag: 'RESISTANCE', tagCls: 'mercy', fx: fin('lambda', { res: 6, lp: -3, cons: 4, susp: 5 }), go: 'c12_end' });
        return list;
      },
    },
    c12_end: {
      checkpoint: true,
      title: 'End of Chapter Twelve',
      enter: (s) => {
        const c = C(s);
        c.done = true;
        if (c.endDay === undefined) c.endDay = s.day;
        s.phase = 'union';
      },
      text: (s) => {
        const c = C(s);
        const rep = { truth: 'Vigil reads your report standing up, and when he is done he asks for it to be read again. The name on the key goes into a file that is not kept in the Nexus.', buried: 'Vigil reads your report and asks no questions. You are not sure whether that is a compliment.', lambda: 'You hand a copy to nobody. A week from now a copy of it will be on a wall in the Stacks, under a chalked lambda, and Vigil will ask you, one afternoon, very quietly, what you know about that.' }[c.report || 'buried'];
        return [rep, `@doc ${G.desig(s)}\nDIVISION: ${s.div}\nRANK: ${G.RANK_NAMES[s.rank].toUpperCase()}\nDAYS IN SERVICE: ${s.day}`, '@sys CHAPTER TWELVE COMPLETE. The road to City 17 is open now, and the question of who opened it has not been answered.'];
      },
      choices: [{ t: 'Return to duty.', go: 'u_duty_end' }],
    },
  };
  G.addScenes(scenes);

  G.addCodex({
    nova: {
      title: 'Nova Prospekt',
      body: '<img src="assets/img/env/e52-nova-prospekt.webp" alt="Nova Prospekt" loading="lazy"><p>A prison fortress on the coast, run for the Union by its own garrison and answering to the Sector, not to any city. Four round watchtowers, a gate tower with a forcefield, tiered cellblocks stepping up like a quarry, a control tower with a searchlight. Rail sidings run straight into the wall. Prisoners go in through the gate. Most are not recorded as coming out.</p>',
    },
    wardens: {
      title: 'Prospekt Wardens',
      body: '<img src="assets/img/uniform-npg.webp" alt="Prospekt Wardens" loading="lazy"><p>The garrison of Nova Prospekt: NPG. Not Civil Protection, though they wear its collar. A matte olive-black plasteel helmet with one wide amber visor, an armoured apron with the octagonal portcullis, a ring of keys on the belt. Wardens, Cellblock Assault and Block Wardens. Their armband is ash olive; their patch reads CCA.NP.</p><p><img src="assets/img/emblem-npg.webp" alt="Warden emblem" loading="lazy" style="max-width:160px"></p>',
    },
    detainees: {
      title: 'Detainees',
      body: '<img src="assets/img/npg-prisoners.webp" alt="Detainee clothing" loading="lazy"><p>Grey-brown canvas, a number on the chest and the back, slip-on shoes, a steel collar with a barcode tag. Detainees are known by their number. NP-04117 is not a name. It is the thing the Wardens call him.</p>',
    },
  });
  G.CODEX_GROUPS.find((g) => g.title === 'City 9').ids.push('nova', 'wardens', 'detainees');
})();
