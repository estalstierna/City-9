/* PATROL — a shift you walk yourself, on the painted map of District 5.
   From the duty board: "Walk District 5". The shift runs 08:00–18:00, an hour a move. Eight places
   on the map; things happen at them while the clock runs (a queue turning, a runner, a Lantern
   alert, chalk, a collapse, a whisper). Each has a timer. Go there and deal with it — every one a
   small choice — or let it lapse, and the block remembers. Tap a place on the map to walk there. */
(function () {
  const pick = G.pick;
  /* the maps: one painted map per district. A node has a kind (stack, square, market, gate, bridge,
     precinct); an event may happen wherever its kind exists. Only District 5 has blocks that remember. */
  G.PT_MAP = G.PT_MAP || { img: 'assets/img/d5-map.webp', vb: [0, 0, 1600, 900] };
  const VB = G.PT_MAP.vb;
  const mk = (sc, list) => {
    const o = {};
    list.forEach(([k, name, x, y, kind]) => (o[k] = { name, x: Math.round(x * sc), y: Math.round(y * sc), kinds: [kind], block: null }));
    return o;
  };
  const S = 0.957;
  const d5n = {
    precinct: { name: 'Precinct D5', x: 165, y: 560, block: null, kinds: ['precinct'] },
    plaza: { name: 'Plaza 5', x: 390, y: 160, block: 'plaza', kinds: ['square'] },
    s9: { name: 'Stack 9', x: 480, y: 360, block: 's9', kinds: ['stack'] },
    s14: { name: 'Stack 14', x: 840, y: 330, block: 's14', kinds: ['stack'] },
    s22: { name: 'Stack 22', x: 1250, y: 370, block: 's22', kinds: ['stack'] },
    bazaar: { name: 'Bazaar Row', x: 790, y: 790, block: 'bazaar', kinds: ['market'] },
    gate: { name: 'Canal Gate 3', x: 1470, y: 610, block: 'bazaar', kinds: ['gate'] },
    bridge: { name: 'Lock Bridge', x: 1120, y: 70, block: 'plaza', kinds: ['bridge'] },
  };
  const DISTRICTS = {
    d5: { id: 'd5', name: 'District 5', short: 'D5', img: G.PT_MAP.img, start: 'precinct', nodes: d5n, blurb: 'Home. The Stacks, the plaza, the canal gate.' },
    d1: { id: 'd1', name: 'The Nexus', short: 'D1', img: 'assets/img/d1-map.webp', start: 'gate', blurb: 'The Union’s own ground: forecourt, hall, motor pool, the tunnel mouth.', nodes: mk(S, [['gate', 'Nexus Gate', 838, 705, 'gate'], ['forecourt', 'Forecourt', 838, 790, 'square'], ['hall', 'Main Hall', 838, 380, 'stack'], ['tunnel', 'Tunnel Mouth', 232, 585, 'gate'], ['roof', 'Roof Mast', 838, 130, 'stack'], ['motor', 'Motor Pool', 1425, 440, 'stack'], ['fountain', 'Fountain Square', 1400, 120, 'square']]) },
    d2: { id: 'd2', name: 'The Works', short: 'D2', img: 'assets/img/d2-map.webp', start: 'millgate', blurb: 'Plant, vats and weaving halls. Loud, wet, watched.', nodes: mk(S, [['packing', 'Packing Plant', 370, 320, 'stack'], ['warehouse', 'Warehouse', 350, 640, 'stack'], ['dye', 'Dye Floor', 1060, 200, 'stack'], ['vats', 'The Vats', 1060, 330, 'stack'], ['weaving', 'Weaving Halls', 1090, 620, 'stack'], ['millgate', 'Mill Gate', 715, 490, 'gate'], ['lock', 'Works Lock', 1500, 200, 'bridge']]) },
    d3: { id: 'd3', name: 'Canal Quarter', short: 'D3', img: 'assets/img/d3-map.webp', start: 'lock3', blurb: 'Water, pumps and a wall with a number on it.', nodes: mk(S, [['pump', 'Pump House 4', 330, 260, 'stack'], ['lock3', 'Lock 3', 840, 195, 'gate'], ['basement', 'Drowned Stair', 1290, 320, 'stack'], ['boatyard', 'Boat Yard', 300, 745, 'stack'], ['lowbridge', 'Low Bridge', 895, 655, 'bridge'], ['wall404', 'The 404 Wall', 1300, 760, 'gate'], ['houses', 'Canal Houses', 560, 480, 'stack']]) },
    d4: { id: 'd4', name: 'Rail Yards', short: 'D4', img: 'assets/img/d4-map.webp', start: 'platform', blurb: 'Sidings, signals and freight that is not on the manifest.', nodes: mk(S, [['platform', 'Platform', 220, 380, 'square'], ['coal', 'Coal Siding', 860, 250, 'stack'], ['signal', 'Signal Box', 665, 560, 'stack'], ['scrap', 'Scrap Yard', 1350, 290, 'stack'], ['shed', 'Engine Shed', 130, 600, 'stack'], ['turntable', 'Turntable', 350, 690, 'stack'], ['footbridge', 'Footbridge', 1430, 690, 'bridge']]) },
    d7: { id: 'd7', name: 'Upper Town', short: 'D7', img: 'assets/img/d7-map.webp', start: 'bridgehead', rank: '02', blurb: 'Clean streets. Everyone here has something to lose, and tells you so.', nodes: mk(S, [['residence', 'Residence', 670, 330, 'stack'], ['prefect', 'Prefect’s Office', 340, 560, 'stack'], ['clinic', 'Clinic', 1340, 470, 'stack'], ['bridgehead', 'Bridgehead', 250, 790, 'gate'], ['park', 'The Park', 1410, 180, 'square'], ['church', 'Church Square', 1050, 590, 'square'], ['cafe', 'Café Street', 870, 170, 'market']]) },
    d8: { id: 'd8', name: 'Hydro', short: 'D8', img: 'assets/img/d8-map.webp', start: 'depot', blurb: 'The dam, the turbines and the cable that feeds the city.', nodes: mk(S, [['dam', 'Dam Crest', 840, 235, 'bridge'], ['turbine', 'Turbine Hall', 380, 530, 'stack'], ['junction', 'Junction 7', 1280, 350, 'stack'], ['trench', 'Conduit Trench', 1390, 775, 'stack'], ['depot', 'GRID Depot', 320, 780, 'stack'], ['houses', 'Workers’ Houses', 1390, 140, 'stack']]) },
  };
  let D = DISTRICTS.d5;
  let NODES = D.nodes;
  let NK = Object.keys(NODES);
  const setDist = (id) => {
    if (D.id === id || !DISTRICTS[id]) return;
    D = DISTRICTS[id];
    NODES = D.nodes;
    NK = Object.keys(NODES);
  };
  const sup = (s) => (G.superiorOf ? G.superiorOf(s).name : 'Granite');
  const P = (s) => (s.pt && setDist(s.pt.d || 'd5'), s.pt);
  const clock = (h) => `${String(h % 24).padStart(2, '0')}:00`;

  /* what can happen: where, how long it waits, and how it can go */
  const EVENTS = {
    queue: { d5: true, at: ['plaza'], ttl: 3, icon: '!', name: 'A queue turning', text: 'The ration queue has stopped moving and started talking. Somebody at the front is holding up an empty packet.', opts: [
      { t: 'Walk the line. Slow voice, mask on.', check: ['authority', 5], ok: ['The queue starts moving again. Nobody thanks you. Nobody throws anything.', { merit: 2 }, [3, -3]], bad: ['Your voice cracks through the encoder. Somebody laughs. The queue gets louder.', {}, [-2, 4]] },
      { t: 'Pull the man with the packet out of the line.', tag: 'BY THE BOOK', cls: 'loyal', out: ['He goes without a fight. The queue watches him go.', { merit: 2, cons: -2 }, [4, 5]] },
    ] },
    runner: { at: ['bazaar', 's9', 's14', 'bridge'], ttl: 2, icon: '»', name: 'A runner', text: 'A boy breaks out of a doorway with a bundle under his coat and goes down the street like a thrown stone.', opts: [
      { t: 'Run him down.', check: ['fitness', 10], ok: ['You catch him at the corner. In the bundle: three loaves and a radio valve.', { merit: 3, xp: { fitness: 1 } }, [3, 3]], bad: ['He goes over a wall you cannot. You stand there breathing through the filter.', {}, [-1, 0]] },
      { t: 'Let him run. Note the doorway.', tag: 'MERCY', cls: 'mercy', out: ['You write the door number in your notebook and do not write the boy.', { cons: 2 }, [0, -2]] },
    ] },
    lantern: { at: ['s9', 's14', 's22'], ttl: 2, icon: '◉', name: 'Lantern alert', text: 'A Lantern is hanging outside a fourth-floor window with its collar gone red, strobing. Dispatch wants a unit to look.', opts: [
      { t: 'Go up and knock.', check: ['perception', 5], ok: ['A family round a table, and under the table a second radio. You see it. They see you see it.', { merit: 3 }, [3, 4]], bad: ['An old woman and a kettle. The Lantern goes back to cyan, embarrassed.', {}, [0, 2]] },
      { t: 'Report a sensor fault.', tag: 'MERCY', cls: 'mercy', out: ['GRID logs a collar fault on Lantern 0207. The window stays dark all night.', { cons: 2, susp: 1 }, [0, -3]] },
    ] },
    chalk: { at: ['s9', 's14', 's22', 'bazaar', 'bridge'], ttl: 4, icon: 'λ', name: 'Fresh chalk', text: 'A lambda on the wall at knee height, still wet with the rain. Whoever drew it had to kneel.', opts: [
      { t: 'Scrub it off with your sleeve.', out: ['Grey smear on grey wall. It will be back by morning.', { merit: 1 }, [1, 0]] },
      { t: 'Photograph it for JURY and canvass the landing.', tag: 'BY THE BOOK', cls: 'loyal', out: ['Six doors, six people who saw nothing. JURY gets a photograph and a list of six names.', { merit: 3, lp: 1 }, [3, 5]] },
      { t: 'Walk past.', out: ['You did not see it. Neither did your lenses, officially.', { cons: 1 }, [-1, -1]] },
    ] },
    collapse: { at: ['plaza', 'bazaar', 's22'], ttl: 2, icon: '+', name: 'A citizen down', text: 'An old man is lying on the wet stones with a ring of people standing round him at exactly the distance people stand when they are afraid to help.', opts: [
      { t: 'Kneel down and work on him.', check: ['medical', 5], ok: ['A pulse, then a cough. Two citizens carry him home on a door. One of them nods at you.', { cons: 3, xp: { medical: 1 } }, [0, -5]], bad: ['You do everything the manual says. It is not enough. Somebody covers his face with his own cap.', { cons: -1 }, [0, -1]] },
      { t: 'Call HELIX and keep the crowd back.', out: ['HELIX takes forty minutes. He is alive when they come.', { merit: 1 }, [1, 0]] },
    ] },
    smuggle: { d5: true, at: ['gate'], ttl: 3, icon: '▣', name: 'A cart at the gate', text: 'A handcart of laundry at Canal Gate 3, and the woman pushing it will not look at the scanner.', opts: [
      { t: 'Search the cart.', check: ['perception', 5], ok: ['Under the sheets: coagulant, bandages, a child’s shoes. Medical contraband, green grade.', { merit: 3 }, [3, 4]], bad: ['Sheets. Only sheets. She thanks you for your diligence in a voice like a closed door.', {}, [0, 2]] },
      { t: 'Wave her through.', tag: 'MERCY', cls: 'mercy', out: ['The cart rattles away over the cobbles towards the canals.', { cons: 2, res: 2, susp: 1 }, [-1, -2]] },
    ] },
    whisper: { at: ['bazaar', 'plaza', 'bridge'], ttl: 2, icon: '?', name: 'A whisper', text: 'A stall holder catches your eye and looks, deliberately, at the alley behind the fish stall. Then back at his scales.', opts: [
      { t: 'Go and look in the alley.', out: ['A cellar door, a new padlock, and boot prints going in but not out. You write it up as a raid lead.', { merit: 3 }, [2, 1]] },
      { t: 'Buy a fish and move on. You owe him nothing.', out: ['Two tokens for a fish that is mostly bones.', { tokens: -2 }, [0, 0]] },
    ] },
    domestic: { d5: true, at: ['s9', 's14', 's22'], ttl: 2, icon: '⌂', name: 'Shouting on a landing', text: 'Two families on one landing, one ration card between them, and a great deal of shouting about whose it is.', opts: [
      { t: 'Split the ration in front of them, by the gram.', check: ['authority', 5], ok: ['Nobody is happy. Nobody is hungry tonight either.', { cons: 2 }, [2, -4]], bad: ['Both families turn on you instead. A door slams on your boot.', { hp: -3 }, [-1, 3]] },
      { t: 'Confiscate the card as disputed property.', tag: 'BY THE BOOK', cls: 'loyal', out: ['The card goes in your pouch. The landing goes very quiet.', { merit: 2, cons: -3 }, [3, 6]] },
    ] },
  };
  /* events that open the game's bigger systems, and night events */
  Object.assign(EVENTS, {
    suspect: { at: ['bazaar', 'plaza', 'gate', 'bridge'], ttl: 2, icon: '⚑', name: 'A citizen avoiding your eyes', text: 'Someone in a faded jacket turns too quickly when your lenses come round the corner, and keeps one hand in a pocket.', opts: [
      { t: 'Stop and search.', tag: 'STOP', cls: 'duty', go: 'ss', out: ['', {}, [1, 1]] },
      { t: 'Let them go about their day.', out: ['They walk on. At the corner they look back once.', { cons: 1 }, [0, -1]] },
    ] },
    lead: { at: ['s9', 's14', 's22'], ttl: 2, icon: '⌧', name: 'A door with a new padlock', text: 'A cellar door that was rotten last week has a new steel padlock on it. Boot prints in, none out. A Lantern logged movement here at 04:00.', opts: [
      { t: 'Break the lock. Raid it now.', tag: 'RAID', cls: 'duty', go: 'raid', out: ['', {}, [3, 4]] },
      { t: 'Log it as a raid lead for the night squad.', out: ['A line in the night squad’s book. Somebody else’s door to kick.', { merit: 2 }, [1, 1]] },
    ] },
    crowd: { d5: true, at: ['plaza'], ttl: 2, icon: '‼', name: 'A crowd gathering', text: 'A broadcast screen on Plaza 5 has frozen mid-speech, and a crowd is gathering under it to watch it not work. The mood is turning into something else.', opts: [
      { t: 'Take command of the plaza.', tag: 'CROWD', cls: 'duty', go: 'crowd', out: ['', {}, [0, 0]] },
      { t: 'Call GRID and stay at the edge.', out: ['GRID restarts the screen. The crowd stays, watching the Administrator speak, saying nothing.', {}, [0, 2]] },
    ] },
    face: { at: ['s9', 's14', 's22', 'bazaar', 'plaza'], ttl: 3, icon: '☺', name: 'A face you know', when: (s) => Object.values(s.files || {}).some((f) => f.face !== undefined && !f.amputated), text: (s) => {
      const f = s.pt.faceFile;
      return `@portrait ${G.DOC_FACES[f.face].img}|CID ${f.cid}
On the corner, someone from your files: CID ${f.cid}, ${f.desc}. Day ${f.last}: ${f.lastVerdict || 'stopped'}. They have seen you.`;
    }, opts: [
      { t: 'Nod and walk on.', tag: 'MERCY', cls: 'mercy', out: ['They nod back. It is almost nothing. In the Stacks it is not nothing.', { cons: 2 }, [0, -2]] },
      { t: 'Stop them again. Papers.', tag: 'BY THE BOOK', cls: 'loyal', out: ['They hand the card over before you ask, and stand very still while you read it.', { merit: 1, cons: -2 }, [2, 3]] },
    ] },
    curfew: { at: ['s9', 's14', 's22', 'bazaar', 'bridge'], ttl: 1, night: true, icon: '☾', name: 'Curfew breaker', text: 'A figure on the street after 20:00, walking fast, close to the walls, carrying something wrapped in a blanket.', opts: [
      { t: 'Run them down.', check: ['fitness', 10], ok: ['A woman with a sick child in the blanket, going to a neighbour who has medicine. Level 2: curfew.', { merit: 2 }, [2, 2]], bad: ['They are gone round a corner you do not know.', {}, [-1, 0]] },
      { t: 'Shine your lamp, then lower it.', tag: 'MERCY', cls: 'mercy', out: ['The figure stops, sees the light go down, and is gone.', { cons: 2 }, [-1, -2]] },
    ] },
    searchlight: { at: ['plaza', 's14', 'bridge'], ttl: 1, night: true, icon: '✦', name: 'Shrike searchlight', text: 'The knock of rotors over the Stacks. A Shrike’s searchlight comes down the street and stops on you. Airwatch wants an armband.', opts: [
      { t: 'Stand still and show your armband.', out: ['The light holds on you for ten seconds, and moves on. Somewhere behind you, a door closes softly.', { lp: 1 }, [1, 0]] },
      { t: 'Wave it towards the canal, away from the Stacks.', tag: 'RISK', cls: 'risk', out: ['The light swings to the canal. Whatever it was looking for in the Stacks, it does not find tonight.', { cons: 3, susp: 2 }, [0, -2]] },
    ] },
    lights: { at: ['s9', 's14', 's22'], ttl: 2, night: true, icon: '▤', name: 'Lights in an empty flat', text: 'A flat the register says has been empty since the relocation in spring. There is a candle in the window, and shadows on the curtain.', opts: [
      { t: 'Go in.', tag: 'RAID', cls: 'duty', go: 'raid', out: ['', {}, [3, 4]] },
      { t: 'Note it and walk on.', out: ['The candle goes out as you pass.', {}, [0, 0]] },
    ] },
    canal: { at: ['gate', 'bridge'], ttl: 2, night: true, icon: '≈', name: 'Something in the canal', text: 'A bundle against the lock gate, turning slowly in the black water. A coat. A sleeve. A hand.', opts: [
      { t: 'Pull it out and call HELIX.', check: ['fitness', 5], ok: ['A citizen, cold, not breathing. HELIX takes the body. JURY will take the file.', { merit: 2 }, [0, 0]], bad: ['The current takes it under the gate before you can reach it.', { hp: -4 }, [0, 0]] },
      { t: 'Push it on with your boot. Not your district.', out: ['It goes under the gate and away towards the Works.', { cons: -3 }, [0, 0]] },
    ] },
  });
  /* the division's work comes to you: an assignment from today's board, at a place that fits it */
  const DIV_NODE = { UNION: 'plaza', HELIX: 'precinct', JURY: 'precinct', RAZOR: 'bridge', SPEAR: 'gate', VECTOR: 's9', GRID: 'bazaar' };
  const offered = (s) => (s.duty.offers || []).filter((k) => G.duties[k] && k !== 'patrol');
  EVENTS.assign = {
    at: ['plaza', 'precinct', 'bridge', 'gate', 's9', 'bazaar'], ttl: 5, icon: '✎', name: 'An assignment', manual: true,
    when: (s) => !!offered(s).length,
    text: (s) => {
      const k = P(s).assignKey;
      const d = G.duties[k];
      return `${d ? d.name : 'An assignment'}\n${d ? d.desc : ''}`;
    },
    opts: [{ t: 'Take it.', tag: 'DUTY', cls: 'duty', go: 'assign', out: ['', {}, [0, 0]] }, { t: 'Let someone else have it.', out: ['It goes to the next unit on the roster.', { merit: -1 }, [0, 0]] }],
  };
  /* one scene of local colour per district */
  Object.assign(EVENTS, {
    courier: { d: 'd1', at: ['gate'], ttl: 3, icon: '✉', name: 'A courier at the gate', text: 'A courier in Union grey stands at the Nexus gate with a sealed envelope addressed to nobody on the roster. The seal is the Administrator’s office, the handwriting is not.', opts: [
      { t: 'Take it to the duty officer, unopened.', tag: 'BY THE BOOK', cls: 'loyal', out: ['The duty officer weighs it in his hand, then in his face, and tells you to forget the courier.', { merit: 2 }, [0, 0]] },
      { t: 'Check the seal against the registry.', check: ['perception', 5], ok: ['The seal is real. The envelope is a week old. Someone has been carrying it round the building, looking for a desk that will take it.', { merit: 3 }, [0, 0]], bad: ['You hold it to the light and learn nothing, except that the courier has gone.', {}, [0, 0]] },
    ] },
    siren: { d: 'd2', at: ['millgate'], ttl: 3, icon: '≋', name: 'The siren is wrong', text: 'The shift siren has gone off forty minutes early. The Mill Gate is full of workers who do not know whether to go in or out, and the foreman is nowhere.', opts: [
      { t: 'Hold the gate. Count them in, one at a time.', check: ['authority', 5], ok: ['The line forms. The foreman reappears, out of breath, and takes the credit.', { merit: 2 }, [0, 0]], bad: ['Nobody listens. Half the shift goes through the side door while you argue with the other half.', {}, [0, 0]] },
      { t: 'Let them sort it out. Report the siren as a GRID fault.', tag: 'MERCY', cls: 'mercy', out: ['Nobody is fined for the forty minutes. GRID writes it up as a relay error.', { cons: 2 }, [0, 0]] },
    ] },
    cellar: { d: 'd3', at: ['basement'], ttl: 2, icon: '≈', name: 'Water on the stair', text: 'Brown water is coming up the stair of a basement flat, slowly and without hurry. A child’s coat is hanging on the third step.', opts: [
      { t: 'Wade down and look.', check: ['fitness', 5], ok: ['Upstairs shelf, back wall: an old woman, a cat and a radio. You carry her out. She does not mention the radio.', { cons: 3 }, [0, 0]], bad: ['The water is colder than the manual says. You come up with nothing but wet boots.', { hp: -2 }, [0, 0]] },
      { t: 'Call the pumps and mark the door.', out: ['Pump House 4 says forty minutes. It always says forty minutes.', { merit: 1 }, [0, 0]] },
    ] },
    wagon: { d: 'd4', at: ['coal'], ttl: 3, icon: '▣', name: 'A wagon with its door open', text: 'A freight wagon on the coal siding has its door open an inch. The lock has been cut clean, the way you cut it when you know the lock.', opts: [
      { t: 'Climb in and look.', check: ['perception', 5], ok: ['Crates stamped CWU Medical, green grade, going nowhere the manifest says. Somebody wanted them found by someone, or lost by everyone.', { merit: 3 }, [0, 0]], bad: ['Coal dust and an empty floor. Whatever was here left before you came.', {}, [0, 0]] },
      { t: 'Close the door. Log the lock as worn.', tag: 'MERCY', cls: 'mercy', out: ['One line in the yard book. The wagon rolls out on the 17:40.', { cons: 2, susp: 1 }, [0, 0]] },
    ] },
    complaint: { d: 'd7', at: ['cafe'], ttl: 3, icon: '☎', name: 'A complaint', text: 'A citizen in a good coat stops you outside the café. She was commended last month and would like it noted that the street smells of the Stacks.', opts: [
      { t: 'Note it, politely, and promise a patrol.', out: ['She thanks you as if you were an elevator.', { merit: 1 }, [0, 0]] },
      { t: 'Tell her where the Stacks are, in case she wants to compare.', out: ['She finds that very funny. A man at the next table does not.', { cons: 1, susp: 1 }, [0, 0]] },
    ] },
    meter: { d: 'd8', at: ['junction'], ttl: 3, icon: '↯', name: 'The meter is wrong', text: 'Junction 7’s meter says the district is drawing twice what the dam gives it. Somebody is taking power off the line, and not for a light bulb.', opts: [
      { t: 'Trace the cable.', check: ['perception', 5], ok: ['Down the trench, under a lid: a tap feeding a clinic cellar that is not on any register. You find it. The patients find you.', { cons: 2, merit: 1 }, [0, 0]], bad: ['Four hundred metres of cable, and all of it going somewhere reasonable.', {}, [0, 0]] },
      { t: 'Log a meter fault and move on.', tag: 'MERCY', cls: 'mercy', out: ['GRID recalibrates it by morning. The tap, wherever it is, keeps drawing.', { cons: 2 }, [0, 0]] },
    ] },
  });
  const EK = Object.keys(EVENTS);
  /* where an event can happen in the district being walked: District 5 uses its own list, the others by node kind */
  const D5K = (k) => d5n[k].kinds[0];
  const atFor = (k) => {
    const e = EVENTS[k];
    if (e.d) return e.d === D.id ? e.at : [];
    if (e.d5) return D.id === 'd5' ? e.at : [];
    if (D.id === 'd5') return e.at;
    const kinds = e.at.map(D5K);
    return NK.filter((n) => NODES[n].kinds.some((x) => kinds.includes(x)));
  };

  const spawn = (s) => {
    const p = P(s);
    const pool = EK.filter((k) => !EVENTS[k].manual && atFor(k).length && !!EVENTS[k].night === !!p.night && (!EVENTS[k].when || EVENTS[k].when(s)));
    const k = pick(pool);
    const free = atFor(k).filter((n) => !p.ev.some((e) => e.node === n));
    if (!free.length) return;
    p.ev.push({ k, node: pick(free), ttl: EVENTS[k].ttl, id: ++p.n });
  };
  /* one assignment per hour-block while the board has any left, never at night */
  const assign = (s) => {
    const p = P(s);
    if (p.night || p.ev.some((e) => e.k === 'assign') || p.assigned >= 3) return;
    const left = offered(s).filter((k) => !(p.takenKeys || []).includes(k));
    if (!left.length) return;
    const key = pick(left);
    const home = DIV_NODE[s.div || 'UNION'];
    const homeKind = d5n[home].kinds[0];
    const spots = NK.filter((n) => !p.ev.some((e) => e.node === n));
    const homes = spots.filter((n) => NODES[n].kinds.includes(homeKind));
    const node = homes.length ? pick(homes) : pick(spots);
    if (!node) return;
    p.ev.push({ k: 'assign', node, ttl: 5, id: ++p.n, key });
    p.assigned = (p.assigned || 0) + 1;
  };
  const dist = (a, b) => Math.hypot(NODES[a].x - NODES[b].x, NODES[a].y - NODES[b].y);
  const cost = (a, b) => (dist(a, b) > 700 ? 2 : 1);
  const tick = (s, n) => {
    for (let i = 1; i < (n || 1); i++) tickOne(s);
    tickOne(s);
  };
  const tickOne = (s) => {
    const p = P(s);
    p.hour++;
    p.ev.forEach((e) => e.ttl--);
    p.ev.filter((e) => e.ttl <= 0).forEach((e) => {
      p.missed++;
      const b = NODES[e.node].block;
      if (b && D.id === 'd5') G.distFx(s, b, -2, 2);
      p.log.push(`${clock(p.hour)} — ${EVENTS[e.k].name.toLowerCase()} at ${NODES[e.node].name}: nobody came.`);
    });
    p.ev = p.ev.filter((e) => e.ttl > 0);
    if (Math.random() < 0.6 && p.ev.length < 4) spawn(s);
    if (!p.night && (p.hour - 8) % 3 === 0 && p.ev.length < 5) assign(s);
  };

  function mapSvg(s) {
    const p = P(s);
    let g = `<svg viewBox="${VB.join(' ')}" class="pt-svg${p.night ? ' night' : ''}" role="img" aria-label="${D.name} patrol map">`;
    g += D.img ? `<image href="${D.img}" x="${VB[0]}" y="${VB[1]}" width="${VB[2]}" height="${VB[3]}" preserveAspectRatio="xMidYMid slice"/>` : G.CITY_MAP_IMG ? `<image href="${G.CITY_MAP_IMG}" x="0" y="0" width="1600" height="900"/>` : `<rect x="${VB[0]}" y="${VB[1]}" width="${VB[2]}" height="${VB[3]}" fill="#141d22"/>`;
    g += `<rect x="${VB[0]}" y="${VB[1]}" width="${VB[2]}" height="${VB[3]}" fill="${p.night ? 'rgba(2,6,14,.62)' : 'rgba(6,10,13,.35)'}"/>`;
    const here = NODES[p.at];
    NK.forEach((k) => k !== p.at && (g += `<line x1="${here.x}" y1="${here.y}" x2="${NODES[k].x}" y2="${NODES[k].y}" class="pt-path"/>`));
    NK.forEach((k) => {
      const n = NODES[k];
      const e = p.ev.find((x) => x.node === k);
      g += `<g class="pt-node${k === p.at ? ' here' : ''}${e ? ' hot' : ''}" data-pt="${k}" tabindex="0" role="button" aria-label="${n.name}">`;
      g += `<circle cx="${n.x}" cy="${n.y}" r="${e ? 26 : 18}"/>`;
      if (e) g += `<text x="${n.x}" y="${n.y + 9}" class="pt-ico">${EVENTS[e.k].icon}</text><text x="${n.x + 30}" y="${n.y - 18}" class="pt-ttl">${e.ttl}h</text>`;
      g += `<text x="${n.x}" y="${n.y + 48}" class="pt-name">${n.name.toUpperCase()}</text></g>`;
    });
    g += `<g class="pt-you"><circle cx="${here.x}" cy="${here.y}" r="9"/></g>`;
    return g + '</svg>';
  }
  document.addEventListener('click', (e) => {
    const n = e.target.closest && e.target.closest('#story .block.current [data-pt]');
    if (!n) return;
    const b = document.querySelector(`#story .block.current .choice[data-ptgo="${n.dataset.pt}"]`);
    if (b && !b.disabled) b.click();
  });
  G.afterRender.push((sc, id, block) => {
    if (id !== 'pt_map') return;
    const s = G.state();
    block.querySelectorAll('.choice').forEach((b) => {
      const m = NK.find((k) => b.textContent.includes('Walk to ' + NODES[k].name));
      if (m) b.dataset.ptgo = m;
      else if (/Deal with it/.test(b.textContent)) b.dataset.ptgo = P(s).at;
    });
  });

  G.extend('u_board', {
    choices: (list, s) => {
      if (s.phase !== 'union' || G.rankIdx(s.rank) < G.rankIdx('05')) return list;
      const mine = [{ t: '**Walk the city.** Your day is on the map: pick a district, and where you stand decides what you handle. Your division’s work finds you there.', tag: 'PATROL', tagCls: 'duty', fx: (st) => ((st.duty.current = 'patrol'), (st.time = 'Day'), null), go: 'pt_pick' }];
      if (G.rankIdx(s.rank) >= G.rankIdx('04')) mine.push({ t: '**Night patrol.** The curfew shift, 20:00 to 02:00, on the map.', tag: 'PATROL', tagCls: 'duty', fx: (st) => ((st.duty.current = 'patrol'), (st.mem.ptNight = true), (st.time = 'Day'), null), go: 'pt_pick' });
      /* the map comes first; the old board duties stay below it as the other way to spend a day */
      const first = list.findIndex((c) => c.tag === 'NEW' || c.tag === 'ROUTINE');
      list.forEach((c) => (c.tag === 'NEW' || c.tag === 'ROUTINE') && !/^Board duty/.test(c.t) && (c.t = 'Board duty: ' + c.t));
      list.splice(first < 0 ? list.length : first, 0, ...mine);
      return list;
    },
  });

  /* while a patrol shift runs, every 'end of shift' from a stop, a raid or a report leads back to
     the map (first in line, so pay and duty counts happen once, at the real end) */
  (G.ext.u_duty_end = G.ext.u_duty_end || []).unshift({ before: (s) => (s.pt && s.pt.active ? 'pt_back' : undefined) });

  const scenes = {
    pt_pick: {
      title: 'Where to?',
      text: (s) => [`@sys ${s.mem.ptNight ? 'Night patrol.' : 'Day patrol.'} Choose a district to walk. Each is its own map, with its own people, and nobody else will cover the ones you do not.`],
      choices: (s) => {
        const list = Object.values(DISTRICTS).filter((d) => !d.rank || G.rankIdx(s.rank) >= G.rankIdx(d.rank)).map((d) => ({ t: `**${d.name}.** ${d.blurb}`, tag: d.id === 'd5' ? 'HOME' : 'PATROL', tagCls: 'duty', fx: (st) => ((st.mem.ptDist = d.id), null), go: 'pt_start' }));
        list.push({ t: 'Not today.', go: 'u_board' });
        return list;
      },
    },
    pt_start: {
      title: (s) => `${DISTRICTS[(s.pt && s.pt.d) || 'd5'].name} — patrol`,
      enter: (s) => {
        G.worldEnsure && G.worldEnsure(s);
        const night = !!s.mem.ptNight;
        s.mem.ptNight = false;
        const d = DISTRICTS[s.mem.ptDist] ? s.mem.ptDist : 'd5';
        s.mem.ptDist = null;
        setDist(d);
        s.pt = { active: true, d, hour: night ? 20 : 8, end: night ? 26 : 18, night, at: DISTRICTS[d].start, ev: [], n: 0, done: 0, missed: 0, log: [] };
        if (night) s.time = 'Night';
        spawn(s);
        spawn(s);
        assign(s);
        G.unlock(s, 'patrol');
      },
      text: (s) => [P(s).night ? `@say ${sup(s)}|Curfew shift. Anyone on the street is either breaking the law or about to. Lamps, not batons, until you know which. Back at 02:00.` : `@say ${sup(s)}|${D.name} is yours until 18:00. Be where things happen. You cannot be everywhere, so choose.`, G.partnerOf && G.partnerOf(s).key ? `${G.partnerOf(s).name} walks with you.` : null],
      choices: [{ t: 'Step out of the precinct.', go: 'pt_map' }],
    },
    pt_map: {
      title: (s) => `${DISTRICTS[(s.pt && s.pt.d) || 'd5'].name} — ${clock(P(s).hour)}`,
      enter: (s) => (P(s).hour >= P(s).end ? 'pt_end' : undefined),
      text: (s) => {
        const p = P(s);
        return [
          '@html <div class="pt-wrap">' + mapSvg(s) + '</div>',
          `@sys ${clock(p.hour)} · You are at ${NODES[p.at].name}. Shift ends ${clock(p.end)}. Far places take two hours to reach.`,
          G.partnerOf && G.partnerOf(s).key && Math.random() < 0.3 ? `@say ${G.partnerOf(s).name}|${pick(p.night ? ['Quiet. Too quiet, or just quiet?', 'Lamp low. Let them see us before we see them.', 'There is a light on in 14. There is always a light on in 14.'] : ['You can’t be everywhere. Pick the one that bites first.', 'Plaza’s getting loud. Or I’m getting old.', 'Lantern’s been circling Stack 9 all morning.'])}` : null,
          p.ev.length ? '@sys ' + p.ev.map((e) => `${EVENTS[e.k].icon} ${EVENTS[e.k].name} — ${NODES[e.node].name} (${e.ttl}h)`).join(' · ') : '@sys The district is quiet. For now.',
        ];
      },
      choices: (s) => {
        const p = P(s);
        const here = p.ev.find((e) => e.node === p.at);
        const list = [];
        if (here) list.push({ t: `**Deal with it:** ${EVENTS[here.k].name.toLowerCase()}.`, tag: 'HERE', tagCls: 'duty', fx: (st) => ((P(st).cur = here.id), null), go: 'pt_ev' });
        NK.filter((k) => k !== p.at)
          .sort((a, b) => (p.ev.some((e) => e.node === b) ? 1 : 0) - (p.ev.some((e) => e.node === a) ? 1 : 0))
          .forEach((k) => {
            const e = p.ev.find((x) => x.node === k);
            const h = cost(p.at, k);
            list.push({ t: `Walk to ${NODES[k].name}${h > 1 ? ' (2h)' : ''}${e ? ` — ${EVENTS[e.k].name.toLowerCase()} (${e.ttl}h left)` : ''}.`, fx: (st) => { const from = P(st).at; P(st).at = k; tick(st, cost(from, k)); return null; }, go: 'pt_map' });
          });
        list.push({ t: 'Stand here for an hour and watch.', fx: (st) => (tick(st), null), go: 'pt_map' });
        return list;
      },
    },
    pt_ev: {
      title: (s) => {
        const e = P(s).ev.find((x) => x.id === P(s).cur);
        return `${NODES[P(s).at].name} — ${e ? EVENTS[e.k].name.toLowerCase() : ''}`;
      },
      enter: (s) => {
        const p = P(s);
        const e = p.ev.find((x) => x.id === p.cur);
        if (!e) return 'pt_map';
        if (e.k === 'assign') p.assignKey = e.key;
        if (e.k === 'face' && !p.faceFile) p.faceFile = pick(Object.values(s.files || {}).filter((f) => f.face !== undefined && !f.amputated));
      },
      text: (s) => {
        const e = EVENTS[P(s).ev.find((x) => x.id === P(s).cur).k];
        if (typeof e.text !== 'function') return [e.text];
        const [a, b] = e.text(s).split('\n');
        return [a, b];
      },
      choices: (s) => {
        const p = P(s);
        const e = p.ev.find((x) => x.id === p.cur);
        const fin = (res) => (st) => {
          const q = P(st);
          q.res = res[0];
          q.ev = q.ev.filter((x) => x.id !== q.cur);
          q.faceFile = null;
          q.done++;
          const b = NODES[q.at].block;
          if (b && res[2] && D.id === 'd5') G.distFx(st, b, res[2][0], res[2][1]);
          tick(st);
          return res[1];
        };
        const launch = (o) => (st) => {
          fin(o.out)(st);
          const q = P(st);
          if (o.go === 'ss') st.mem.ssRet = 'pt_back';
          if (o.go === 'assign') {
            const k = q.assignKey;
            (q.takenKeys = q.takenKeys || []).push(k);
            st.duty.current = k;
            q.launch = (st.duty.done[k] ? G.duties[k].routine : G.duties[k].first);
            st.duty.done[k] = (st.duty.done[k] || 0) + 1;
          }
          if (o.go === 'raid') {
            st.raid = G.makeRaid(st, { addr: `${NODES[q.at].name}, ${pick(['cellar', 'flat 4C', 'flat 9A', 'the boiler room'])}` });
            st.raid.ret = 'pt_back';
          }
          return null;
        };
        return EVENTS[e.k].opts.map((o) =>
          o.go
            ? { t: o.t, tag: o.tag, tagCls: o.cls, fx: launch(o), go: o.go === 'assign' ? (st) => P(st).launch : { ss: 'ss_start', raid: 'raid_start', crowd: 'pt_crowd' }[o.go] }
            : o.check
            ? { t: o.t, check: { skill: o.check[0], diff: o.check[1], pass: 'pt_res', fail: 'pt_res', okFx: fin(o.ok), failFx: fin(o.bad) } }
            : { t: o.t, tag: o.tag, tagCls: o.cls, fx: fin(o.out), go: 'pt_res' }
        );
      },
    },
    pt_res: { text: (s) => [P(s).res], choices: [{ t: 'Back on the street.', go: 'pt_map' }] },
    pt_back: { safe: true, enter: (s) => (s.pt && s.pt.active ? ((s.mem.ssRet = null), tick(s, 1), 'pt_map') : 'u_evening'), text: [] },
    pt_crowd: {
      title: 'Plaza 5 — the frozen screen',
      text: ['@sys Crowd control. Keep the plaza under the boil until GRID gets the screen back.'],
      mini: { type: 'crowd', opts: (s) => G.crowdOpts(s, { block: 'plaza', title: 'Plaza 5 — the frozen screen', seconds: 30 }), pass: 'pt_crowd_ok', fail: 'pt_crowd_bad', skill: 'authority', diff: 10 },
    },
    pt_crowd_ok: { text: ['The screen flickers back. The crowd thins into the Stacks, slowly, in pieces.'], choices: [{ t: 'Back on the street.', fx: (s) => (G.distFx(s, 'plaza', 3, (s.lastMini && s.lastMini.force) ? 6 : -2), { merit: 3, xp: { authority: 1 } }), go: 'pt_back' }] },
    pt_crowd_bad: { text: ['The barrier goes over. Nobody is badly hurt. Everybody remembers.'], choices: [{ t: 'Back on the street.', fx: (s) => (G.distFx(s, 'plaza', -6, 8), { hp: -6, merit: -1 }), go: 'pt_back' }] },
    pt_end: {
      title: (s) => `${DISTRICTS[(s.pt && s.pt.d) || 'd5'].name} — end of shift`,
      enter: (s) => {
        const p = P(s);
        p.active = false;
        s.mem.ssRet = null;
        G.fx(s, { merit: 2 + Math.round(p.done * 1.5) - (p.missed >= 3 ? 1 : 0) });
      },
      text: (s) => {
        const p = P(s);
        P(s);
        return [`@doc PATROL REPORT — ${D.short}\nHANDLED: ${p.done}\nMISSED: ${p.missed}`, ...p.log.slice(-4), p.missed === 0 && p.done >= 3 ? `@say ${sup(s)}|Nothing got past you today. That will not last. Enjoy it.` : null];
      },
      choices: [{ t: 'End of shift.', go: 'u_duty_end' }],
    },
  };
  G.addScenes(scenes);
  G.addCodex({
    patrol: {
      title: 'Walking a patrol',
      body: '<p>A patrol shift runs from 08:00 to 18:00. Dispatch marks incidents on the district map with the hours they will wait: a queue, a runner, a Lantern alert, chalk. A unit cannot be everywhere. What it does not reach, the block remembers.</p>',
    },
  });
  G.CODEX_GROUPS.find((g) => g.title === 'Procedure').ids.push('patrol');
})();
