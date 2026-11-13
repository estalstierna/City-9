/* Codex entries — unlocked through play, read from the Codex button. */
G.addCodex({
  city9: {
    title: 'City 09',
    body: `<img src="assets/img/env/e01-city.webp" alt="City 09 at dawn" loading="lazy"><img src="assets/img/flag-city09.webp" alt="City 09 flag" loading="lazy"><p>The civic flag: the river, the dam, the spire. Hung from every public building in the city.</p><p>A river city of the old east, rebuilt around the hydroelectric dam that now feeds the Citadel spire. The Union keeps it divided into numbered districts, each with its own Civil Protection precinct.</p>
    <table>
      <tr><td>D1</td><td>The Nexus — administration, Civil Protection headquarters, training wing, detention levels.</td></tr>
      <tr><td>D2</td><td>The Works — textile mills and the ration-packing plant. Shift sirens at 05:40 and 17:40.</td></tr>
      <tr><td>D3</td><td>Canal Quarter — locks, pump houses and drowned basements. Smugglers' country.</td></tr>
      <tr><td>D4</td><td>Rail Yards — the transit line to other cities. Freight, relocation trains, scrap. Unlit after curfew.</td></tr>
      <tr><td>D5</td><td>The Stacks — residential blocks, Bazaar Row, Plaza 5. Where most citizens live, and where you grew up.</td></tr>
      <tr><td>404</td><td>Old Town beyond the eastern canal. Officially quarantined. Unofficially, no one comes back to argue.</td></tr>
    </table>`,
  },
  citizens: {
    title: 'Citizen dress & identification',
    body: `<p>Every citizen is issued the same clothes: a faded blue work jacket with a stand collar, an undershirt, work trousers and shoes. A white cloth label on the right chest carries the <b>Citizen ID</b> — <b>CID</b> and five digits — above a barcode. The district is stencilled on the back.</p>
    <img src="assets/img/citizen-base.webp" alt="Base citizen uniform" loading="lazy">
    <p><b>Commended citizens</b> receive a gold-rimmed pin above the label, a gold line beneath the barcode, a new-issue jacket and a priority ration card. Their neighbours notice.</p>
    <img src="assets/img/citizen-commended.webp" alt="Commended citizen" loading="lazy">
    <p><b>Citizens under observation</b> have a red diagonal stripe and the mark <b>OBS</b> printed across their label, a red barred circle on the back and a monitoring band locked to the wrist. Report irregularities.</p>
    <img src="assets/img/citizen-watch.webp" alt="Citizen under watch" loading="lazy">
    <img src="assets/img/citizen-cwu.webp" alt="Civil Workers' Union" loading="lazy">
    <p><b>Civil Workers' Union (CWU)</b> members run the ration terminals, the licensed shops and the maintenance crews. Over the citizen jacket they wear an ochre work jacket with a reflective band and a union badge; their ID label carries an ochre stripe marked <b>CWU</b>. They eat better, are exempt from food and medical contraband rules, and are trusted by nobody — not by the Union, and not by their neighbours.</p>`,
  },
  spire: {
    title: 'The Spire',
    body: `<img src="assets/img/spire-ref.webp" alt="The Spire of City 09" loading="lazy">
    <p>Citizens call it the Citadel when no one is listening, and "the Spire" when someone is. Twenty-four hundred metres of dark alloy driven through the old cathedral square like a nail, its crown split into two prongs around a hovering black void. A cold cyan core glows two-thirds of the way up. Conduits as thick as trams run from its foot across the river to the dam, which has not stopped humming since the war.</p>
    <p>No citizen has been inside. Very few units have. The ones who come back do not discuss it.</p>`,
  },
  union: {
    title: 'The Universal Union',
    body: `<p>The authority that rules Earth since the Seven Hour War. The Union speaks to its cities through Administrators and broadcast screens, and acts through two branches: the <b>Combine Civil Authority</b> (local policing) and <b>Overwatch</b> (the military and intelligence apparatus).</p>
    <p>Citizens are told the Union is a benefactor. The suppression field that keeps the birth rate at zero is called a "kindness". Food is called "rations". Disappearance is called "relocation".</p>`,
  },
  cca: {
    title: 'Combine Civil Authority',
    body: `<img src="assets/img/master-a.webp" alt="Visual identity of the Civil Authority" loading="lazy"><img src="assets/img/flag-cca.webp" alt="CCA flag" loading="lazy"><p>The primary branch of the Universal Union alongside the Overwatch Executive Branch. The CCA acts as the local authority of each city, keeping the peace and standing on the front line against rebellion. Its units patrol the streets, staff checkpoints, distribute rations and punish rule-breaking citizens.</p>
    <img src="assets/img/helmet.webp" alt="Protection Unit helmet" loading="lazy">
    <p>Units are masked in public and addressed by designation, never by name. Every unit's full designation is stencilled in small off-white letters on the left shoulder panel, directly above the division armband. Service grants better rations, private quarters and the privilege of being feared.</p>`,
  },
  designation: {
    title: 'Reading a designation',
    body: `<p>Every Protection Unit carries a designation string. Example:</p>
    <div class="doc">CCA.C9.D5-JURY-DvL-02842</div>
    <table>
      <tr><td>CCA</td><td>Combine Civil Authority</td></tr>
      <tr><td>C9</td><td>City 09</td></tr>
      <tr><td>D5</td><td>District 5</td></tr>
      <tr><td>JURY</td><td>Division</td></tr>
      <tr><td>DvL</td><td>Rank — Division Leader</td></tr>
      <tr><td>02842</td><td>Unit ID number</td></tr>
    </table>`,
  },
  hierarchy: {
    title: 'CCA Hierarchy',
    body: `<img src="assets/img/ranks-enlisted.webp" alt="Ranks: recruit to elite" loading="lazy"><img src="assets/img/ranks-command.webp" alt="Ranks: officers and command" loading="lazy"><table>
      <tr><td>EA</td><td>Earth Administrator</td></tr>
      <tr><td>SeC</td><td>Sectorial Commander</td></tr>
      <tr><td>CmD</td><td>Field Commander</td></tr>
      <tr><td>AdC</td><td>Adjutant Commander</td></tr>
      <tr><td>DvL</td><td>Division Leader</td></tr>
      <tr><td>SqL</td><td>Squadron Leader</td></tr>
      <tr><td>OfC</td><td>Field Officer</td></tr>
      <tr><td>EpU</td><td>Elite Protection Unit</td></tr>
      <tr><td>01</td><td>01 Protection Unit</td></tr>
      <tr><td>02</td><td>02 Protection Unit</td></tr>
      <tr><td>03</td><td>03 Protection Unit</td></tr>
      <tr><td>04</td><td>04 Protection Unit</td></tr>
      <tr><td>05</td><td>05 Protection Unit</td></tr>
      <tr><td>RcT</td><td>Recruit</td></tr>
    </table>
    <p><b>Insignia</b> are worn on the armband. Protection grades carry thin silver bars — one for an 05, five for an 01. An EpU carries a single thick bar. Officers add silver stars: one for OfC, two for SqL, three for DvL. Command ranks from AdC upward wear black armbands trimmed in gold, with gold bars and stars, and graphite helmets with gold crests. The Earth Administrator wears no armband at all.</p>
    <p>Promotion through the 05–01 grades is earned by merit and field evaluation. Above 01, by selection — and by surviving the people who also want the post.</p>`,
  },
  divisions: {
    title: 'Field Divisions',
    body: `<img src="assets/img/emblems.webp" alt="Division emblems" loading="lazy"><img src="assets/img/emblems-new.webp" alt="VECTOR, GRID and VEIL emblems" loading="lazy"><table>
      <tr><td>UNION</td><td>The basic policing division, performing general patrol duties. Every graduate begins here.</td></tr>
      <tr><td>HELIX</td><td>Medical division. Treats injuries sustained by protection forces and VIPs. Requires field medicine aptitude.</td></tr>
      <tr><td>JURY</td><td>Military police. Detention of citizens, interrogation, forced confessions, internal discipline.</td></tr>
      <tr><td>RAZOR</td><td>Protection of VIPs and Hardpoints.</td></tr>
      <tr><td>SPEAR</td><td>Offensive division, cleared to enter 404 zones.</td></tr>
      <tr><td>VECTOR</td><td>Necrotic containment and research. Follows SPEAR into the 404 zones once the shooting stops: seals breaches, burns infestation, recovers specimens.</td></tr>
      <tr><td>GRID</td><td>Union infrastructure and engineering. Forcefields, hardpoints, scanners, biosignal relays, combine locks. CWU fixes the city; GRID fixes the cage.</td></tr>
      <tr><td>OA</td><td>Officer Academy — exclusive to 01 Protection Units of any division.</td></tr>
    </table>
    <p>Transfer applications open to units of grade 03 and above.</p>`,
  },
  colours: {
    title: 'Division colours & armbands',
    body: `<p>Every unit wears a cloth armband on the left upper arm stencilled with city and district — <b>C9:D5</b> — in the colour of their division. Silver bars on the armband show rank: one bar for an 05, five for an 01, a thick bar for an EpU, and a thick bar with stars for officers.</p>
    <table>
      <tr><td>UNION</td><td>Civil Protection blue · stun baton emblem</td></tr>
      <tr><td>HELIX</td><td>White with teal trim · double helix emblem</td></tr>
      <tr><td>JURY</td><td>Crimson · cracked skull emblem</td></tr>
      <tr><td>RAZOR</td><td>Gold · shield and blade emblem</td></tr>
      <tr><td>SPEAR</td><td>Hazard orange · spearhead emblem</td></tr>
      <tr><td>VECTOR</td><td>Chemical yellow-green · cracked cell held by a clamp</td></tr>
      <tr><td>GRID</td><td>Copper · lightning bolt through a hex nut</td></tr>
      <tr><td>OA</td><td>Violet · chevrons under a star</td></tr>
    </table>
    <img src="assets/img/armbands.webp" alt="Division armbands" loading="lazy"><img src="assets/img/armbands-new.webp" alt="VECTOR, GRID and VEIL armbands" loading="lazy">`,
  },
  uniforms: {
    title: 'Uniform reference — all divisions',
    body: `<p>Standard issue for every division shares the same helmet, jacket, vest and duty belts. The division shows in the armband, the crest stripe and the kit.</p>
    <p><b>UNION</b> — patrol.</p><img src="assets/img/uniform-union.webp" alt="UNION uniform" loading="lazy">
    <p><b>HELIX</b> — field medic.</p><img src="assets/img/uniform-helix.webp" alt="HELIX uniform" loading="lazy">
    <p><b>JURY</b> — detention & interrogation.</p><img src="assets/img/uniform-jury.webp" alt="JURY uniform" loading="lazy">
    <p><b>RAZOR</b> — hardpoint & VIP protection.</p><img src="assets/img/uniform-razor.webp" alt="RAZOR uniform" loading="lazy">
    <p><b>SPEAR</b> — 404 zone assault.</p><img src="assets/img/uniform-spear.webp" alt="SPEAR uniform" loading="lazy">
    <p><b>OA</b> — Officer Academy command uniform.</p><img src="assets/img/uniform-oa.webp" alt="OA uniform" loading="lazy">
    <p><b>VECTOR</b> — containment specialist.</p><img src="assets/img/uniform-vector.webp" alt="VECTOR uniform" loading="lazy">
    <p><b>GRID</b> — field engineer.</p><img src="assets/img/uniform-grid.webp" alt="GRID uniform" loading="lazy">`,
  },
  overwatch: {
    title: 'Overwatch',
    body: `<p>The Universal Union's military. The <b>Overwatch Transhuman Arm (OTA)</b> is the combative element, made of surgically altered soldiers in many specialised variants. <b>Overwatch Strategic Intelligence (OSI)</b> is the intelligence element.</p>
    <p>OTA operates side by side with the CCA. CCA personnel cannot issue orders to OTA and vice versa — unless a <b>sociostatus</b> is active, in which case Overwatch takes authority over most CCA personnel.</p>
    <img src="assets/img/ota-soldier.webp" alt="Overwatch infantry" loading="lazy">
    <img src="assets/img/ota-elite.webp" alt="Overwatch elite" loading="lazy">
    <img src="assets/img/ota-insignia.webp" alt="Overwatch insignia" loading="lazy">
    <p>Overwatch wears no cloth. Its markings are painted on armour: a hexagon cut by a glowing visor slit — cyan for infantry, red for elites, gold for command. Rank is counted in chevrons on the shoulder plate. Civil Protection units learn to read them from across a street, and to step aside.</p>
    <img src="assets/img/vehicle-ota.webp" alt="Overwatch assault transport" loading="lazy">
    <p>Overwatch moves in its own vehicles. The <b>OTA-T assault transport</b> is a Civil Protection PT-V hull rebuilt by the Union: composite armour grown over the old steel, a single visor slit across the cab, a remote pulse turret, six soldiers on a rear ramp. When one parks outside a precinct, the precinct is no longer in charge.</p>
    <p>The sky belongs to <b>Airwatch</b>, the airborne branch of the OTA: scanner drones, transports and gunships.</p>
    <p>OSI recruitment is classified. Units who ask about it tend to be transferred somewhere quiet.</p>`,
  },
  codes: {
    title: 'Radio codes (C9 standard)',
    body: `<table>
      <tr><td>10-4</td><td>Acknowledged</td></tr>
      <tr><td>10-7</td><td>Out of service</td></tr>
      <tr><td>10-8</td><td>In service / on patrol</td></tr>
      <tr><td>10-15</td><td>Detainee in custody</td></tr>
      <tr><td>10-20</td><td>Location</td></tr>
      <tr><td>10-33</td><td>Emergency traffic only — clear the channel</td></tr>
      <tr><td>10-78</td><td>Unit requests assistance</td></tr>
      <tr><td>10-91</td><td>Pick up / transport required</td></tr>
      <tr><td>11-99</td><td>Unit down</td></tr>
      <tr><td>CODE 3</td><td>Respond immediately</td></tr>
      <tr><td>10-78 AIR</td><td>Unit requests Airwatch support (through Dispatch; rarely answered outside sociostatus)</td></tr>
      <tr><td>LAMBDA</td><td>Anticitizen activity / resistance sign</td></tr>
    </table>`,
  },
  verdicts: {
    title: 'Verdict vocabulary',
    body: `<table>
      <tr><td>Compliance</td><td>Correct civic behaviour.</td></tr>
      <tr><td>Malcompliance</td><td>Any deviation. Graded minor, major, capital.</td></tr>
      <tr><td>Anticitizen</td><td>A person whose citizenship has been revoked. Not protected by any regulation.</td></tr>
      <tr><td>Apply</td><td>Use force to obtain compliance.</td></tr>
      <tr><td>Amputate</td><td>Terminate. Applied to anticitizens — and to units whose file turns red.</td></tr>
      <tr><td>Sociostability</td><td>The health of a district. When it falls, sociostatus is declared.</td></tr>
      <tr><td>Relocation</td><td>Transfer of citizens between cities. Some arrive.</td></tr>
    </table>`,
  },
  resistance: {
    title: 'The Resistance in City 9',
    body: `<p>Not an army. A scatter of cells in the canals and the rail yards: smugglers, deserters, mill workers with long memories. They paint the lambda, cut ration lines, steal medicine and, now and then, kill a unit who walks alone after curfew.</p>
    <p>Dispatch calls them "anticitizen elements". Citizens call them nothing, out loud.</p>`,
  },
  biosignal: {
    title: 'Biosignal implant',
    body: `<p>Every Protection Unit carries a subdermal biosignal transmitter at the base of the skull. It reports life signs and position to Dispatch. When a unit dies, the network knows within a second.</p>
    <p>Recruits are told it is for their safety. Veterans say the implant also listens to your heart rate during questioning, and that the file it feeds never closes.</p>`,
  },
  helix: {
    title: 'HELIX Division',
    body: `<img src="assets/img/uniform-helix.webp" alt="HELIX uniform" loading="lazy"><p>HELIX medics wear a white armband trimmed in teal and carry biogel, coagulant and a sidearm they are trained to use without hesitation. They treat Protection Units first, VIPs second, citizens when ordered. Their infirmary sits beneath the Nexus.</p>`,
  },
  jury: {
    title: 'JURY Division',
    body: `<img src="assets/img/uniform-jury.webp" alt="JURY uniform" loading="lazy"><p>Military police of the CCA. JURY handles detention, interrogation and forced confession, and polices other units for malcompliance. A JURY unit at your door is never good news, whatever uniform you wear.</p>`,
  },
});

/* ------------------------------------------------------------------
   CCA reference material: terminology, law, contraband, equipment
   ------------------------------------------------------------------ */
(function () {
  const row = (a, b) => `<tr><td>${a}</td><td>${b}</td></tr>`;
  const table = (pairs) => `<table>${pairs.map((p) => row(p[0], p[1])).join('')}</table>`;

  const TERMS = [
    ['Administer', 'To apply a given action or verdict.'],
    ['Airwatch', 'Airborne branch of the Overwatch Arm.'],
    ['Amputate', 'Execute. Kill.'],
    ['Anti-Citizen', 'An unruly citizen demonstrating active endangerment to sociostability.'],
    ['Audcon', 'Audio confirmation — the unit can hear the person or object.'],
    ['Biotic', 'Any xenian creature or figure.'],
    ['Bio-Signal', 'Stabilisation readouts given by the trackers implanted in units.'],
    ['Bug', 'Burrowing insectoid species from the Outlands.'],
    ['Cauterize', 'To permanently sever access to a location.'],
    ['Clamp', 'To temporarily block access to a location.'],
    ['Coagulate', 'Spread out across an area to cover more ground.'],
    ['Contact', 'Hostiles spotted; prepare to confirm and engage.'],
    ['Contact Confirm', 'Contact is confirmed hostile; engage immediately.'],
    ['Contain', 'Clamp off entrances and confine a situation to certain areas.'],
    ['Converge', 'Move to a location, usually with haste.'],
    ['Deploy', 'Deployment of equipment or a squad.'],
    ['Deservicement', 'Death of a Union agent.'],
    ['Dismount', 'Exit or leave a manned hardpoint.'],
    ['Document', 'Take note of a situation by updating the APB.'],
    ['Evasion', 'Evasive activity to avoid stabilisation teams or prosecution.'],
    ['Examine', 'Investigate. Look into.'],
    ['Expired', 'Death of a subject.'],
    ['Harden', 'Maintain a defensive position.'],
    ['Hardpoint', 'Forcefield or checkpoint at a key location.'],
    ['Individual', 'A specific person of interest.'],
    ['Infested', 'Parasitic or necrotic influence within a given area.'],
    ['Inject', 'Breach into a room.'],
    ['Inquire', 'Interrogate through questioning.'],
    ['Interlock', 'Group together into a protection team.'],
    ['Isolate', 'Disband a large group of citizens.'],
    ['Lock', 'Hold your assigned position.'],
    ['Malcompliance', 'Failure to co-operate.'],
    ['Malignant', 'A dangerous or threatening individual.'],
    ['Midnight', 'Surprise attack: enter quietly, then ambush.'],
    ['Necrotic', 'A human under parasitic influence.'],
    ['Non-Sanctioned', 'Not approved or allocated.'],
    ['Pacify', 'Render incapable of performing typical functions; re-educate.'],
    ['Perimeter', 'A defensive line or area.'],
    ['Policide', 'The killing of an officer or unit.'],
    ['Preserve', 'Preserve sociostability in a given area.'],
    ['Protection Team / PT', 'A patrol group of at least two Civil Authority officers.'],
    ['PT-V', 'A protection team in an APC.'],
    ['RDT', 'Ration Distribution Terminal.'],
    ['Respond', 'Respond to a request or given edict.'],
    ['Restrict', 'Deny access through a checkpoint or area.'],
    ['Search', 'Search an individual or group for contraband or items of interest.'],
    ['Serve', 'Follow.'],
    ['Service Cycle', 'One day/night cycle of on-duty service.'],
    ['Shield', 'Defend a given checkpoint or area.'],
    ['Stabilize', 'Restore order by any means necessary. Lethal or non-lethal is decided by the commanding authority.'],
    ['Stand-by', 'Awaiting orders.'],
    ['Sterilize', 'To remove.'],
    ['Suspend', 'Cease a given action.'],
    ['Sword', 'Action call: weapons may be freely used.'],
    ['Tag', 'Assign a code to a subject (10-96P, etc.).'],
    ['Verdict', 'An imposed punishment for a given transgression.'],
    ['Violation', 'A crime or transgression committed by an individual.'],
    ['Violator', 'Anyone committing, or who has committed, a crime.'],
    ['Virome', 'A human under toxic parasitic influence.'],
    ['Viscerator', 'An airborne bladed drone.'],
    ['Viscon', 'Visual confirmation — the unit can see the person or object.'],
  ];
  const ABBR = [
    ['ADW', 'Assault with a deadly weapon'],
    ['APB', 'All-points bulletin'],
    ['BOLO', 'Be on lookout'],
    ['DB', 'Dead body'],
    ['GOA', 'Gone on arrival'],
    ['PT', 'Protection team'],
    ['UPA', 'Unauthorised procreative activity'],
    ['UPI', 'Unidentified person of interest'],
    ['UTL', 'Unable to locate'],
  ];

  const LEVELS = [
    ['Level 1', 'Re-education', ['Running', 'Yelling', 'Jumping', 'General uncivil behaviour', 'Loitering']],
    ['Level 2', '2 penalty points · re-education', ['Minor citizen harassment (verbal)', 'Trespassing', 'Throwing objects', 'Wasting an officer’s time', 'Possession of GREEN contraband']],
    ['Level 3', '3 penalty points · 1 detainment cycle · re-education', ['Threatening or assaulting a citizen', 'Failure to apply', 'Fleeing from an officer or crime scene', 'Theft / burglary', 'Withholding information from CCA officers', 'Disobeying an officer’s orders']],
    ['Level 4', '5 penalty points · 2 detainment cycles · re-education', ['Public display of affection', 'Trespassing into a deserviced sector (404 zone)', 'Major citizen harassment (physical)', 'Threatening a unit', 'Vandalism', 'Resisting arrest or questioning', 'Possession of YELLOW contraband']],
    ['Level 5', '7 penalty points · 3 detainment cycles · re-education', ['Vandalism of Union property', 'Assaulting a CCA unit', 'Assaulting a high-priority citizen', 'Kidnapping', 'Citizen homicide', 'Possession of RED contraband']],
    ['Level 6', '12 penalty points · 6 detainment cycles · 2 interrogation cycles · re-education', ['Arson', 'Unauthorised procreative activity', 'Trespassing into the Nexus', 'Rebel conspiracy']],
    ['Level 7', 'Amputation', ['Policide', 'Politically motivated terrorism', 'Participating in a riot', 'Assassination of an Administrator', 'Mental imperfection', 'Physical imperfection', 'Possession of BLACK contraband']],
  ];

  const CONTRA = [
    ['GREEN', '#6fbf73', ['Non-approved food (incl. ration tiers above the holder’s grade)', 'Non-approved clothing', 'Non-approved alcohol', 'Spray cans', 'Small amounts of biogel (one vial)', 'Small amounts of pharmaceuticals', 'Unregistered tobacco']],
    ['YELLOW', '#e2a83f', ['Large amounts of biogel', 'Large amounts of pharmaceuticals', 'Narcotics (personal quantity)', 'Antidepressants', 'Non-authorised ID and access cards', 'Non-approved backpacks', 'Zip-ties', 'Unregistered radio receivers']],
    ['RED', '#d9534a', ['Lethal melee weapons', 'Narcotics (distribution quantity)', 'Ammunition of any kind', 'Door breaches', 'ALPHA-grade armour', 'Stun batons', 'Handheld radios and transmitters', 'Seditious print (leaflets, lambda material)', 'Union locks (unless CWU or high-level loyalist)']],
    ['BLACK', '#a58ad8', ['BETA / GAMMA-grade armour', 'Firearms', 'Union command locks', 'Explosives of any kind']],
  ];

  /* The law as the game computes it — one source for stop & search, raids and anything later.
     A charge is { name, lvl }. */
  G.LAW = {
    LEVEL_POINTS: { 1: 0, 2: 2, 3: 3, 4: 5, 5: 7, 6: 12, 7: 99 },
    GRADE_LEVEL: { green: 2, yellow: 4, red: 5, black: 7 },
    AMPUTATE_AT: 20,
    points: (charges) => charges.reduce((n, c) => n + G.LAW.LEVEL_POINTS[c.lvl], 0),
    top: (charges) => charges.reduce((m, c) => (c.lvl > m.lvl ? c : m), { lvl: 0, name: '' }),
    lethal: (filePoints, charges) => charges.some((c) => c.lvl >= 7) || filePoints + G.LAW.points(charges) >= G.LAW.AMPUTATE_AT,
  };

  G.CONTRA_GRADES = { green: { label: 'GREEN', colour: '#6fbf73', susp: 5 }, yellow: { label: 'YELLOW', colour: '#e2a83f', susp: 12 }, red: { label: 'RED', colour: '#d9534a', susp: 25 }, black: { label: 'BLACK', colour: '#a58ad8', susp: 45 } };

  /* Issued kit, by rank. `from` = lowest rank that holds it, `until` = rank at which it is replaced. */
  G.EQUIPMENT = [
    { id: 'training', name: 'Grey training uniform', from: 'RcT', until: '05', desc: 'High-collared recruit fatigues. No mask — the mask is earned.' },
    { id: 'jacket', name: 'Polycarbonate fabric jacket', from: '05', desc: 'Slash-resistant, polycarbonate-infused fabric. Keeps out rain and cold. Not spike-resistant.' },
    { id: 'slacks', name: 'Dark grey polycarbonate slacks', from: '05', desc: 'Cut for mobility. Moisture- and temperature-resistant.' },
    { id: 'mask', name: 'Ceramic-polymer gas mask', from: '05', until: 'EpU', desc: 'Hardened ceramic-polymer shell, acrylic lenses, smoke and gas filtration. A voice encoder hides the wearer’s gender and identity.' },
    { id: 'mask_ins', name: 'Gas mask with plasteel inserts', from: 'EpU', until: 'DvL', desc: 'The standard mask reinforced with rare plasteel inserts. Issued to EpU and above.' },
    { id: 'mask_full', name: 'Full plasteel gas mask', from: 'DvL', desc: 'Solid plasteel construction. Issued to Division Leaders and above, and to Overwatch.' },
    { id: 'baton', name: 'Standard-issue stun baton', from: '05', desc: 'Black steel rod, rubberised grip, static emulator. LOW: pain. MEDIUM: puts a citizen on the ground. HIGH: unconsciousness. MAXIMUM is locked — it drains the battery and has killed citizens with one strike.' },
    { id: 'cuffs', name: 'Hinged steel restraint cuffs', from: '05', desc: 'Rigid-hinge steel cuffs with a double lock and a serial number logged against your designation. Heavy enough to hurt when applied fast. The key ring stays on your belt; lose it and you sign for a new set in front of the duty officer.' },
    { id: 'zipties', name: 'Polymer zip-ties (bundle of 10)', from: '05', desc: 'Single-use flex restraints for crowds, raids and multiple detainees. Issued by the bundle and counted back at the armoury. In a citizen\u2019s pocket they are YELLOW contraband; on your belt they are procedure. Cut them off with your service knife, never with your teeth.' },
    { id: 'knife', name: 'Folding service knife', from: '05', desc: 'Pocket or belt clip. Mostly for cutting zip-ties. Capable of personal defence.' },
    { id: 'vest_a', name: 'Alpha-grade kevlar vest', from: '05', until: '03', desc: 'Level II-A. Stops most handgun rounds. Stab- and slash-proof against conventional blades.' },
    { id: 'vest_b', name: 'Beta-grade kevlar vest', from: '03', desc: 'Level III-A. Reliable up to .44 Magnum, more layers against blades. EpU and above may add ballistic inserts.' },
    { id: 'boots', name: 'Jet-black jackboots', from: '05', desc: 'Heavy, steel-toed, water-resistant, brief protection against hot surfaces.' },
    { id: 'radio', name: 'Handheld radio', from: '05', desc: 'Belt-clipped, linked to the microphone in your mask. Lose the radio and the mask goes silent.' },
    { id: 'gloves', name: 'Vulcanised rubber gloves', from: '05', desc: 'High-traction black gloves. Nothing slips.' },
    { id: 'belts', name: 'Nylon utility belts and slings (3)', from: '05', desc: 'Magazine holsters, pouches, weapon slings.' },
    { id: 'hygiene', name: 'Hygiene kit', from: 'RcT', desc: 'Comb, straight razor, toothbrush, toothpaste, shaving cream.' },
    { id: 'usp', name: 'USP-Match 9mm handgun', from: '04', desc: '18-round magazine, 9mm hollow-point, under-mounted flashlight. Issued at grade 04. Before that, sidearms are signed out from the armoury for a single shift.' },
    { id: 'mp7', name: 'MP7A1 submachine gun', from: '01', desc: '45-round magazine, 4.6mm armour-piercing, folding foregrip, holographic sight, under-barrel grenade launcher. Issued at grade 01; may later be exchanged for another primary for sterilised credits.' },
  ];

  G.kitFor = (s) => {
    const r = G.rankIdx(s.rank);
    return G.EQUIPMENT.filter((e) => r >= G.rankIdx(e.from) && (!e.until || r < G.rankIdx(e.until)));
  };

  G.addCodex({
    terms: {
      title: 'CCA terminology',
      body: `<p><i>All recruits are responsible for learning these terms on their own.</i></p>${table(TERMS)}<p><b>Abbreviations</b></p>${table(ABBR)}`,
    },
    crimes: {
      title: 'Crimes & verdicts',
      body: `<p>Every violation carries a level. Penalty points accumulate on the citizen's file and never expire. <b>At 20 penalty points the citizen is amputated as a threat to sociostability.</b></p>
      ${LEVELS.map((l) => `<p><b>${l[0]}</b> — <i>${l[1]}</i></p><ul>${l[2].map((x) => `<li>${x}</li>`).join('')}</ul>`).join('')}`,
    },
    contraband: {
      title: 'Contraband grades',
      body: `<p>Contraband is graded by colour. Possession of each grade is its own violation: GREEN is Level 2, YELLOW Level 4, RED Level 5, BLACK Level 7. Food and medical contraband rules do not apply to members of the Civil Workers' Union (CWU).</p>
      ${CONTRA.map((c) => `<p><b style="color:${c[1]}">${c[0]}</b></p><ul>${c[2].map((x) => `<li>${x}</li>`).join('')}</ul>`).join('')}`,
    },
    equipment: {
      title: 'Civil Authority equipment',
      body: `<p><b>Standard issue (05 and above)</b></p>${table(G.EQUIPMENT.filter((e) => e.from === '05' && !['vest_b'].includes(e.id)).map((e) => [e.name, e.desc]))}
      <p><b>Special issue</b></p>${table([
        ['USP-Match (04+)', G.EQUIPMENT.find((e) => e.id === 'usp').desc],
        ['Beta-grade vest (03–01)', G.EQUIPMENT.find((e) => e.id === 'vest_b').desc],
        ['MP7A1 (01+)', G.EQUIPMENT.find((e) => e.id === 'mp7').desc],
        ['Plasteel masks', 'Inserts for EpU and above. Full plasteel for DvL and above, and for Overwatch.'],
      ])}
      <p><b>Priority command equipment</b></p>${table([
        ['OSIAR (Overwatch)', 'Overwatch Standard Issue Assault Rifle. A very large pulse rifle built by the Union after the Seven Hour War. Fires dense pulse rounds from a detachable 30-round energy cell, accurate and fully automatic. Its recoil is too violent for an un-augmented human to control.'],
        ['Gamma armour system', '&lt;:: CLASSIFIED BY SeC ::&gt;'],
      ])}`,
    },
  });
})();

G.addCodex({
  vector: {
    title: 'VECTOR Division',
    body: '<img src="assets/img/uniform-vector.webp" alt="VECTOR uniform" loading="lazy"><p><i>"What comes out of the quarantine does not go back in. It goes into a jar."</i></p><p>VECTOR follows SPEAR into the 404 zones once the shooting stops. Its units seal breaches, burn infestation, recover specimens and run the containment laboratories beneath the Nexus. They wear sealed suits over their uniforms and are decontaminated twice a shift. Other units do not share mess tables with VECTOR. Officially, this is for hygiene.</p>',
  },
  grid: {
    title: 'GRID Division',
    body: '<img src="assets/img/uniform-grid.webp" alt="GRID uniform" loading="lazy"><p><i>"Every light in City 9 is a promise. GRID keeps the promises."</i></p><p>When a forcefield flickers, a scanner goes dark or a hardpoint loses power, GRID is sent — usually under fire, because resistance cells cut the power before they move. GRID maintains everything the Union built: biosignal relays, combine locks, broadcast masts, the conduits from the dam to the Spire. No citizen, not even CWU, may touch Union technology.</p>',
  },
  veil: {
    title: '[NO RECORD]',
    body: '<img src="assets/img/uniform-veil.webp" alt="[NO RECORD]" loading="lazy"><p><i>"There is no VEIL division. If there were, you would not be reading this."</i></p><p>This entry should not exist. VEIL has no Protection Units — no recruits, no 05s, no ladder to climb. Every operative was first a Field Officer or higher in another division, and disappeared from it overnight. Their old files say <i>Transferred: Officer Academy</i>, or simply <i>Deserviced</i>. Their old squads hold a wake.</p><p>Rank inside VEIL is worn but almost invisible: officer insignia in dull grey on a black band, a crest stripe of gloss black lacquer that shows only when the light catches it. Diversion. Reconnaissance. Removal. Nobody applies. VEIL chooses — and it only chooses officers.</p><p>If you are reading this, someone wanted you to.</p>',
  },
});

/* Codex chapters, in reading order. Any entry not listed here is shown under "Other records".
   Add new entries to the group they belong to. */
G.addCodex({
  vehicles: {
    title: 'Civil Protection vehicles',
    body: `<img src="assets/img/vehicle-ptv.webp" alt="PT-V protection team vehicle" loading="lazy">
    <p>The <b>PT-V</b> — Protection Team, Vehicle — is the workhorse of every precinct: a six-wheeled armoured transport built from flat welded steel on a pre-war truck chassis, with a crowd ram on the nose, vision slits instead of windows, a roof cupola with a mounted gun and searchlight, and a scanner mast that reads every biosignal and label in the street it drives down.</p>
    <table>
      <tr><td>Crew</td><td>Driver, gunner in the cupola, and a protection team of up to eight on the rear benches.</td></tr>
      <tr><td>Use</td><td>Raids, transfers to the Nexus, crowd control at ration lines, relocation days.</td></tr>
      <tr><td>Numbering</td><td>District and hull: <b>PT-V D5-07</b> is the seventh vehicle of District 5. The number is stencilled on the nose, the sides and the rear doors.</td></tr>
      <tr><td>Doctrine</td><td>A PT-V is not built to fight. It is built to arrive. Most of the work is done by the sound of it in the street.</td></tr>
    </table>`,
  },
});

G.addCodex({
  airwatch: {
    title: 'Airwatch',
    body: `<img src="assets/img/airwatch-insignia.webp" alt="Airwatch insignia" loading="lazy"><p><b>Airwatch</b> is the airborne branch of the Overwatch Transhuman Arm. It owns the sky over every Union city: the scanner drones that photograph balconies, the transports that came down on the Nexus roof, and the gunships.</p>
    <p>Its emblem is the Overwatch hexagon cut by a cyan visor slit, flanked by two swept rotor blades. It is painted on hulls and on the shoulder plates of aircrew, never sewn: Airwatch, like the rest of Overwatch, wears no cloth.</p>
    <table>
      <tr><td>Base</td><td>The Nexus roof pads, District 1. Two gunships and a transport flight have been stationed in City 9 since the transports arrived.</td></tr>
      <tr><td>Gunship</td><td><img src="assets/img/airwatch-shrike.webp" alt="Shrike gunship" loading="lazy">The <b>Shrike</b>: a tandem two-seat armoured helicopter, pilot behind and above the gunner, with a chin turret, stub-wing rocket pods and a small rear bay that carries cargo, or six soldiers dropped onto a roof in under a minute.</td></tr>
      <tr><td>Hull codes</td><td>AW-S 09-1 and AW-S 09-2. Citizens can tell them apart by sound. Units are not supposed to try.</td></tr>
      <tr><td>Aircrew</td><td><img src="assets/img/airwatch-crew.webp" alt="Airwatch aircrew" loading="lazy">Transhuman, sealed into flight armour, plugged into the airframe through the back of the helmet. Rank is painted on the left shoulder plate under the emblem: two cyan chevrons for the pilot, one for the gunner. No Civil Protection unit has seen one outside a cockpit.</td></tr>
      <tr><td>Requests</td><td>Civil Protection cannot task Airwatch. A unit may request air support through Dispatch with code 10-78 AIR. Outside a sociostatus, the request is logged and almost never answered.</td></tr>
    </table>
    <img src="assets/img/env/e23-shrike-stacks.webp" alt="A Shrike over the Stacks at curfew" loading="lazy">
    <p>Under sociostatus Airwatch flies the curfew. A Shrike's searchlight can read a CID label from two hundred metres. Citizens in the Stacks call the sound of its rotors <i>the knock</i>, because it always comes before one.</p>`,
  },
});

G.CODEX_GROUPS = [
  { title: 'City 9', ids: ['city9', 'spire', 'citizens', 'resistance'] },
  { title: 'The Universal Union', ids: ['union', 'overwatch', 'airwatch', 'sociostatus', 'biosignal'] },
  { title: 'Civil Protection', ids: ['cca', 'designation', 'hierarchy', 'divisions', 'colours', 'uniforms', 'equipment', 'vehicles'] },
  { title: 'Divisions', ids: ['helix', 'jury', 'vector', 'grid', 'veil'] },
  { title: 'Law', ids: ['crimes', 'contraband', 'verdicts'] },
  { title: 'Language & codes', ids: ['terms', 'codes'] },
  { title: 'Procedure', ids: ['stopsearch', 'docs', 'raids', 'reports', 'informants', 'interrogation', 'screening'] },
  { title: 'Service record', ids: ['discipline', 'board'] },
];

