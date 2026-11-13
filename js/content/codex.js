/* Codex entries — unlocked through play, read from the Codex button. */
G.addCodex({
  city9: {
    title: 'City 09',
    body: `<img src="assets/img/env/e01-city.jpg" alt="City 09 at dawn" loading="lazy"><img src="assets/img/flag-city09.jpg" alt="City 09 flag" loading="lazy"><p>The civic flag: the river, the dam, the spire. Hung from every public building in the city.</p><p>A river city of the old east, rebuilt around the hydroelectric dam that now feeds the Citadel spire. The Union keeps it divided into numbered districts, each with its own Civil Protection precinct.</p>
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
    <img src="assets/img/citizen-base.jpg" alt="Base citizen uniform" loading="lazy">
    <p><b>Commended citizens</b> receive a gold-rimmed pin above the label, a gold line beneath the barcode, a new-issue jacket and a priority ration card. Their neighbours notice.</p>
    <img src="assets/img/citizen-commended.jpg" alt="Commended citizen" loading="lazy">
    <p><b>Citizens under observation</b> have a red diagonal stripe and the mark <b>OBS</b> printed across their label, a red barred circle on the back and a monitoring band locked to the wrist. Report irregularities.</p>
    <img src="assets/img/citizen-watch.jpg" alt="Citizen under watch" loading="lazy">`,
  },
  spire: {
    title: 'The Spire',
    body: `<img src="assets/img/spire-ref.jpg" alt="The Spire of City 09" loading="lazy">
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
    body: `<img src="assets/img/master-a.jpg" alt="Visual identity of the Civil Authority" loading="lazy"><img src="assets/img/flag-cca.jpg" alt="CCA flag" loading="lazy"><p>The primary branch of the Universal Union alongside the Overwatch Executive Branch. The CCA acts as the local authority of each city, keeping the peace and standing on the front line against rebellion. Its units patrol the streets, staff checkpoints, distribute rations and punish rule-breaking citizens.</p>
    <img src="assets/img/helmet.jpg" alt="Protection Unit helmet" loading="lazy">
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
    body: `<img src="assets/img/ranks-enlisted.jpg" alt="Ranks: recruit to elite" loading="lazy"><img src="assets/img/ranks-command.jpg" alt="Ranks: officers and command" loading="lazy"><table>
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
    body: `<img src="assets/img/emblems.jpg" alt="Division emblems" loading="lazy"><table>
      <tr><td>UNION</td><td>The basic policing division, performing general patrol duties. Every graduate begins here.</td></tr>
      <tr><td>HELIX</td><td>Medical division. Treats injuries sustained by protection forces and VIPs. Requires field medicine aptitude.</td></tr>
      <tr><td>JURY</td><td>Military police. Detention of citizens, interrogation, forced confessions, internal discipline.</td></tr>
      <tr><td>RAZOR</td><td>Protection of VIPs and Hardpoints.</td></tr>
      <tr><td>SPEAR</td><td>Offensive division, cleared to enter 404 zones.</td></tr>
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
      <tr><td>OA</td><td>Violet · chevrons under a star</td></tr>
    </table>
    <img src="assets/img/armbands.jpg" alt="Division armbands" loading="lazy">`,
  },
  uniforms: {
    title: 'Uniform reference — all divisions',
    body: `<p>Standard issue for every division shares the same helmet, jacket, vest and duty belts. The division shows in the armband, the crest stripe and the kit.</p>
    <p><b>UNION</b> — patrol.</p><img src="assets/img/uniform-union.jpg" alt="UNION uniform" loading="lazy">
    <p><b>HELIX</b> — field medic.</p><img src="assets/img/uniform-helix.jpg" alt="HELIX uniform" loading="lazy">
    <p><b>JURY</b> — detention & interrogation.</p><img src="assets/img/uniform-jury.jpg" alt="JURY uniform" loading="lazy">
    <p><b>RAZOR</b> — hardpoint & VIP protection.</p><img src="assets/img/uniform-razor.jpg" alt="RAZOR uniform" loading="lazy">
    <p><b>SPEAR</b> — 404 zone assault.</p><img src="assets/img/uniform-spear.jpg" alt="SPEAR uniform" loading="lazy">
    <p><b>OA</b> — Officer Academy command uniform.</p><img src="assets/img/uniform-oa.jpg" alt="OA uniform" loading="lazy">`,
  },
  overwatch: {
    title: 'Overwatch',
    body: `<p>The Universal Union's military. The <b>Overwatch Transhuman Arm (OTA)</b> is the combative element, made of surgically altered soldiers in many specialised variants. <b>Overwatch Strategic Intelligence (OSI)</b> is the intelligence element.</p>
    <p>OTA operates side by side with the CCA. CCA personnel cannot issue orders to OTA and vice versa — unless a <b>sociostatus</b> is active, in which case Overwatch takes authority over most CCA personnel.</p>
    <img src="assets/img/ota-soldier.jpg" alt="Overwatch infantry" loading="lazy">
    <img src="assets/img/ota-insignia.jpg" alt="Overwatch insignia" loading="lazy">
    <p>Overwatch wears no cloth. Its markings are painted on armour: a hexagon cut by a glowing visor slit — cyan for infantry, red for elites, gold for command. Rank is counted in chevrons on the shoulder plate. Civil Protection units learn to read them from across a street, and to step aside.</p>
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
    body: `<img src="assets/img/uniform-helix.jpg" alt="HELIX uniform" loading="lazy"><p>HELIX medics wear a white armband trimmed in teal and carry biogel, coagulant and a sidearm they are trained to use without hesitation. They treat Protection Units first, VIPs second, citizens when ordered. Their infirmary sits beneath the Nexus.</p>`,
  },
  jury: {
    title: 'JURY Division',
    body: `<img src="assets/img/uniform-jury.jpg" alt="JURY uniform" loading="lazy"><p>Military police of the CCA. JURY handles detention, interrogation and forced confession, and polices other units for malcompliance. A JURY unit at your door is never good news, whatever uniform you wear.</p>`,
  },
});
