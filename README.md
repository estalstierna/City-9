# City 9 // Civil Protection

A text roleplaying game set in the Half-Life universe, shortly before the events of Half-Life 2. You play an ordinary citizen of **City 09** who enlists in the **Combine Civil Authority (CCA)**, survives Basic Training and climbs the ranks, deciding along the way what kind of officer, and what kind of person, you become.

## Play

Open `index.html` in a browser. It needs no build step or server and works from `file://`.

- Click a choice or press **1–9**.
- **Dossier** shows your identity, rank, merit, skills, contacts and items. On mobile it's a drawer.
- **Codex** holds lore you've unlocked: the hierarchy, divisions, Overwatch, radio codes and more.
- **Menu** has the manual save slot, last checkpoint, export/import save codes and new game. The game autosaves after every scene.

### Install as an app

The game is a Progressive Web App. On Android in Chrome: menu ⋮ → **Install app** / **Add to Home screen**. On iPhone in Safari: Share → **Add to Home Screen**. Once installed it runs full-screen and works offline. The service worker (`sw.js`) loads code from the network first, so updates arrive automatically. Bump `VERSION` in `sw.js` when you change files to clear old caches.

## Systems

| System | How it works |
|---|---|
| Skills | Firearms, Melee & Restraint, Field Medicine, Conditioning, Perception, Radio & Protocol, Authority, Deception. Levels 0–6. Training sets them, and using them in checks raises them. |
| Skill checks | Some choices show `SKILL NN%`. The game rolls d100 against that chance: `40 + 12×level − difficulty`, with −10 when badly hurt. |
| Merit | Earned on duty. It unlocks field evaluations (05 → 04 at 25, 04 → 03 at 60). A failed evaluation costs merit. |
| Loyalty rating | How the Union sees you. Some divisions require it. |
| Hidden: Suspicion | Your file at JURY. At 100 you are *amputated*. Choices that raise it show `[ OBSERVED ]`. |
| Hidden: Conscience / Resistance | Track the kind of person you're becoming and how much the City 9 resistance trusts you. |
| Issued kit | Standard CCA equipment shown in the Dossier, growing with rank: CP-9 at 04, Beta vest at 03, CP-7 at 01, plasteel mask inserts at EpU. |
| Contraband | Carried items can be graded GREEN / YELLOW / RED / BLACK. Higher grades weigh more heavily if JURY finds them in an audit. |
| Law | Verdict boxes in scenes cite the crime level and penalty (points, detainment cycles). At 20 penalty points a citizen is amputated. Full tables are in the Codex. |
| Stop & search | Routine duties offer a search. A random citizen (standard, OBS, CWU or commended) is scanned, searched and questioned with skill checks, then you pass a verdict by the crime table. Penalty points are saved per CID in **Case files** in the Dossier; citizens can turn up again, and at 20 points or any Level 7 violation the verdict is amputation. |
| Document inspection | A minigame that replaces the dice roll at Canal Gate 3. Compare an ID card and transit permit against the cycle's bulletin (valid stamp, OBS and CWU rules). Tap the faulty field and deny, or approve. Perception adds time and, from level 3, a hint. Routine checkpoint shifts have a timed three-citizen queue. "Let instinct decide" falls back to a skill roll. Engine: any scene can declare `mini: { type, opts, pass, fail, skill }`. |
| Discipline | Mistakes put strikes on your service record: MINOR (1) or SERIOUS (2). One strike is a verbal warning, two a written reprimand, three a demotion by one grade with probation and a **final warning**. Three more after that, or a single GRAVE act (helping an anticitizen escape and getting caught), go to a JURY tribunal: *Deserviced*, stripped back to an OBS citizen, or executed for collaboration. A clean first offence can plead once. Strikes expire after eight clean days. Hearings happen at morning muster. |
| Promotion board | Required before the 03 field evaluation, for 02 → 01 and 01 → EpU, and to win back a grade lost to demotion. Five written questions on codes, law and ranks, then three oral questions built from your own file (discipline, amputations, report audits, unregistered assets). Merit surplus helps; strikes, final warnings, demotions and a hidden JURY annotation (high suspicion) hurt. Pass at 5. A failed board can be retaken after three days. |
| Apartment raids | A duty from day 2, and the result of informant tips. Enter by procedure (the occupant may flush evidence), breach (fast and loud), or quietly with the warden's key (tips only). Limited minutes on site: search spots (perception), question the occupant for a hunch, or toss the flat (finds everything, costs conscience). Complications: children, a bedridden elder, a watching neighbour. A concealed person can be detained, amputated, or let out of the window, which is a GRAVE risk if your partner sees it. |
| Incident reports | After raids and after stops with findings. The slate pre-fills the report from your lens log; strike lines, add embellishments ("subject resisted": +5 points to the citizen and merit for you) or confess. JURY audits reports later against the footage, your partner (who protects you more the better you get on) and the citizen. You are never told which report was checked; a discrepancy turns up days later at a hearing. |
| Informants | Turn a citizen with a chargeable violation into an asset, during a stop or a raid. Registered assets earn merit but their names leak; off-book assets are against regulation. Meet them in the evening: pay, lean on them, or ask what the street says about you. Their tips appear on the duty board as raids. Reliability is hidden, and you only see a ✓/✗ record. Some assets are resistance plants: their tips are traps, or, if the resistance trusts you, messages. Assets can be burned or killed after raids. |
| Subtle signs | Suspicion stays hidden. As it rises, the morning and evening text starts to notice things: a turned locker latch, a partner going quiet, a JURY unit facing your table, a footage upload that doesn't go to Dispatch. |
| Protection team | From grade 03 (formally in chapter 4) you lead three units: people from your history (Rook, Wick, Tomas, Vesna) and assigned units. Each has a trait (steady, hothead, medic, by the book, eyes, soft) that adds to one skill and shapes how they react to your choices. The most loyal member is your partner and the witness on your reports. Members can be hurt, transferred, file statements against you, cover for you once, and in scenes marked RISK, die; replacements arrive the next morning. Evenings with the team are vignettes per trait. |
| District stability | Stack 9, Stack 14, Stack 22, Bazaar Row and Plaza 5 each have hidden order and resentment. Choices tagged BY THE BOOK raise both, MERCY lowers both, AMPUTATE/BRUTAL raise both a lot. High resentment boils over into attacks; low order lets the canal cells in. Both become morning events. The Dossier shows a colour map (green, amber, red), never numbers. Plaza 5's state sets how hot a crowd starts. |
| Crowd control | A real-time minigame on ration and broadcast duties, and the climax of chapter 4: three sectors with rising tension, a few units to post, a voice that works below 75, agitators to pull out, a shield wall that holds the worst sector still and hurts nobody, a baton that works instantly and is remembered, and from grade 03 one stun canister per shift that knocks the whole crowd back and is remembered longer. Any sector at 100 is a riot. |
| Variety | Routine duties become one of 25+ vignettes three times in four (rotating, never the same twice in a row). Each morning has a line of the city that follows the world state, and sometimes an encounter on the way to muster. Evenings offer two rotating places (cards, the roof, the canal, a letter, the night broadcast, Halloran, a case-file follow-up) and sometimes a knock at the door first. People from your case files come back. |
| Division duties | Every division has its own duty board. UNION keeps the street duties; HELIX (infirmary night shift, field medic, fitness certification), RAZOR (hardpoint watch, VIP escort, armoury audit), SPEAR (404 perimeter, building clearance, tag recovery), VECTOR (decontamination, containment labs, canal sampling), GRID (forcefield repair, scanner masts, lock calibration) and JURY (interrogation, unit audit, surveillance, tribunal clerk, the archive) each have their own, with rotating routine variants. All divisions can also be sent on apartment raids. Duties are built from data with `G.divDuty` in `js/content/divisions.js`. |
| Ten duties per division | Every division now has ten duties of its own (UNION's street duties plus field training and the night desk; JURY adds prisoner transport, witness statements, a listening post, death inquiries and promotion reviews; HELIX, RAZOR, SPEAR, VECTOR and GRID seven more each). Some are rank-gated: officers' work such as instructing recruits, the Administrator's residence, the tram depot recon, the Archivist's records or the foot of the Spire (02 or 01 and above). `js/content/duties2.js`. |
| Career and roster | Every grade unlocks something real (pay per shift, a sidearm that improves Firearms checks, Authority bonuses, a bigger protection team, private quarters, more health). A promotion opens a ceremony card with the new insignia, what it unlocks and your new roster position. The **Roster** tab (bottom bar and top bar) lists every unit in your division by rank with you among them, your next rank, its requirements and perks. Officer grades are slow on purpose: OfC after chapter four, SqL after chapter six, DvL after chapter eight, each through a stricter board. `js/content/career.js`. |
| Lore | New records: the Seven Hour War, the Sevrin Dam, the Nexus by level, the Works, ration tiers, Old Town, and the canal cells' chalk language, each unlocked where you first meet it. Rumours from the other divisions' stories reach you in the mess; your own chapter-two choices echo in chapters three and four; chalk signs appear on the morning walk. `js/content/lore.js`. |
| Interface | Text size (Menu), foldable Dossier sections that remember their state, tap feedback on choices, images that fade in with a placeholder, and reduced motion when the device asks for it. |
| More minigames | **Circuit** (GRID): rotate conduit tiles to bring power from source to load before the clock runs out; Radio & Protocol buys time. Offered on forcefield repair and at junction 7. **Tail** (JURY, VEIL): follow a subject block by block, reading each street to choose your distance; crowds hide you but lose them, quiet streets punish being close. `js/content/minigames2.js`. |
| Division minigames | Every division has its own: UNION document inspection and crowd control, JURY interrogation and tailing, GRID circuit repair, **HELIX triage** (patients fade in real time, two hands, tap to work on them), **RAZOR hardpoint watch** (one face at a time shows a tell; catch the threats, spare the innocent), **SPEAR breach** (door by door, FIRE or HOLD in a heartbeat), **VECTOR sampling** (press your luck against the suit's integrity). Each is offered inside its division's duties and can be skipped with a skill roll. `js/content/minigames3.js`. |
| Field notes | The first time each system appears (skill checks, tags, the duty board, Dossier, OBSERVED, Codex, stop & search, minigames, raids, reports, informants, discipline, boards, the district map, your team, crowd control, the Roster, sociostatus), a short note explains it, one per scene. Tips can be turned off in the Menu. `js/content/onboarding.js`. |
| Sound | Procedural Web Audio, no files, on three channels with their own volume in the Menu. **Ambience** is the dam's hum, wind and rain outdoors, and a drone underground; it can be turned off on its own. **Effects** are cues for choices, skill checks, promotions and being OBSERVED. **Radio** is a handset transmission on RADIO and DISPATCH lines: key-up click, squelch, band-limited clipped voice, crackle and the squelch tail. Dispatch opens with an alert tone. A master switch turns everything off. `js/audio.js`. |
| Balance | Promotion-board penalties together cost at most 2 points (a board can no longer become impossible), regaining a grade lost to demotion passes at 4, a failed board costs 4 merit and can be retaken after two days, and strikes expire after six clean days. |
| Save records | Four records side by side. The title screen lists each record (name, rank, division, day, chapter) to continue, starts a new life in an empty record, or erases one you choose. Each record has its own autosave, checkpoint and manual save; saves from before records existed are record 1. The in-game menu leads back to the records. |
| Contacts | Mira (your sister), Tomas, Ilse, Rook, Granite, Halloran, the Tinker. Relationships change their scenes. |

## Structure (Chapter 1)

1. **Prologue**: character creation (background and motive), the last morning at home, the street, the recruitment interview and the implant.
2. **Basic Training**: pick 4 of 6 courses (range, melee, HELIX medicine, radio, canal run, JURY interrogation), a barracks night, and a final live raid on your own block.
3. **UNION service**: a daily duty board with 7 duties, each with a full first event and a routine version. Evenings are for Mira, Tomas, training or Bazaar Row. Story beats include Granite's warning, a JURY audit, sociostatus with Overwatch in command, Ilse's request, Tomas's theft, Rook's story and the resistance's offer.
4. **Promotions**: the 04 evaluation (ration truck ambush) and the 03 evaluation (antenna hardpoint), then **division selection** (UNION / HELIX / JURY / RAZOR / SPEAR, each with requirements).

5. **Chapter 2** (grade 03 → 02), one arc per division:
   - **UNION, "The Quota"**: you lead a protection team and train a new 05, Wick. A relocation quota hits District 5 and you must compile six names for Stacks 9 and 14 (Mira's exemption has been withdrawn). The arc ends on relocation day at the D4 rail yards. The resistance can use your information, and the people on your list board the train or don't.
   - **JURY, "The Leak"**: under the Magistrate and with 02 Vesna, you hunt the precinct leak. Interrogations run three cycles (press, lie, listen, apply), and innocents can give false confessions. You search records, interrogate Rook and present a name at a tribunal. A case board in the Dossier tracks evidence. If *you* are the leak, you can wipe logs, frame someone or confess.
   - New JURY duties (interrogation cycle, unit audit) replace street duties for JURY. UNION gets a protection team patrol.

6. **Chapter 3, "The Long Night"** (all divisions, one grade up): City 17 goes quiet on the relay and Overwatch declares sociostatus in City 9 under Field Commander *Vigil* and Task Force LOCK. The canal cells plan one night without the dam conduit, to drop the forcefields at the D4 yards and stop a relocation train. Stages: the briefing; an evening approach by your canal contact (Ilse, the Tinker or Katya, depending on your history), whom you can help, ignore or report; a division assignment (UNION raid under an Overwatch lens, JURY courier interrogation, HELIX triage at a bombed RDT, RAZOR forged card on the dam crest, SPEAR chalk route in the drains, VECTOR family in an infested culvert, GRID device on the Spire conduit); a biosignal screening that can put an Overwatch soldier at your shoulder; the night itself (hold, look away, fire a false flare, or leave your post for Mira); and the morning after, which can include a one-in-ten reprisal at Plaza 5. Under sociostatus there is a curfew-sweep duty with Overwatch. The intel you gather across the chapter decides how ready Overwatch is on the night.

7. **Airwatch** (the airborne branch of Overwatch) runs through the whole game: a gunship over the first sociostatus, a searchlight over the rail-yard sweeps, a Shrike holding station over relocation day, transports and gunships on the Nexus roof in chapter 3 and the Shrike over the spillway on the long night. Codex entry *Airwatch*; radio code 10-78 AIR. Hooks live in `js/content/airwatch.js`.

8. **Chapter 4, "Sixty Grams"** (all divisions, one grade up): City 17 drains the Union's cities, and City 9's ration is cut by sixty grams. Vigil orders every team lead to name one of their own for transfer to City 17. Your canal contact plans to empty the D2 packing-plant warehouse on ration day while every unit holds Plaza 5. You get one day to prepare the district (release emergency stores, raid the agitators, walk the blocks, or work your sources), then ration day itself is played as a crowd-control set piece. If the plaza holds, you decide what happens at the warehouse; if it riots, Overwatch on the roof decides, unless you stand in front of it. A letter from City 17 closes the chapter.

   - **HELIX, RAZOR, SPEAR, VECTOR and GRID** each have their own chapter-two arc (grade 03 → 02), with their own officer and partner: HELIX *The Ward* (Matron, Lark: a canal courier kept alive for JURY), RAZOR *The Guest* (Bastion, Brace: an auditor from City 1 and a leak in the squad), SPEAR *Beyond the Canal* (Kiln, Rasp: a lost squad and a settlement inside the quarantine zone), VECTOR *Specimen Nine* (the Archivist, Gauze: a woman the infection does not take), GRID *The Blackout List* (Foreman, Solder: whose block goes dark this winter). `js/content/arcs.js`.

9. **Chapter 5, "The Academy"** (all divisions): a unit comes back from City 17 with a description they were given every morning and no name. Vigil sends you to the Officer Academy (doctrine with instructor *Censor*, a live command exercise played as crowd control, a graduation board) — the main road to Field Officer. In parallel VEIL leaves an envelope sealed with an empty circle: meet them, refuse, or report it; if you accept, follow a dead-drop courier (tail minigame) and decide what VEIL is told. Graduating with VEIL's trust puts you in VEIL's shadow: you keep your division's armband, a black one waits in your locker, and an unlisted assignment can appear on your board.

10. **Chapter 6, "Collection"** (all divisions, officer's work): Overwatch collects Civil Protection reserves every week as *candidates for conversion*, and you choose who from your team goes. A "railway" moves people north on the D4 coal line toward City 17; you track it down (tail a signalman, lean on informants, read the manifests, or raid a flat) and find someone you love on the passenger list. On Thursday night you are the officer on scene: stop the train, let it run, call Airwatch, shield it from the Shrike yourself, or — in VEIL's shadow — tag the last wagon so VEIL can follow it north. Squadron Leader becomes reachable through an officer board after this chapter.

11. **Chapter 7, "Anticitizen One"** (all divisions): the Union gives the man from City 17 a designation and puts a blurred figure on every screen. Still no name, still no face. Overwatch pulls two thirds of the City 9 garrison north, and Civil Protection holds the city alone. You place your teams (Nexus, Stacks or armoury). The canal cells, or VEIL, tell you when D5 will rise. Plaza 5 starts to chant under the screens (crowd control, or cut the screens). On the night the screens go dark you hold, open the armoury, order a stand-down, negotiate a truce on a landing, or walk among them for VEIL. The chapter ends with Nova Prospekt on the radio.

11b. **Chapter 8, "The Inspection"** (all divisions, the road to Squadron Leader): after the night D5 rose, Sector Administrator Morow arrives by train to grade City 9 over ten days. A city that cannot keep itself is *consolidated*: its worst block goes north.
   - **The command map:** you hold the district board. Every morning, three teams get a district and an order on the city map (patrol, raid, protect, rest). Every evening a report and the inspection assessment follow. Uncovered districts drift into incidents, teams tire, and the Upper Town counts double.
   - **Story scenes between the command days:**
     - the reception in the Upper Town, where Morow wants the names of the night;
     - the consolidation list: accept it, argue it down, or warn the block;
     - the winter allocation with GRID's Division Leader: which district goes dark;
     - City 17 on the radio, Overwatch gone, and one of your teams cut off;
     - your own Division Leader;
     - the verdict: pass, probation or partial consolidation.
   - **Promotion:** a pass promotes you up to Squadron Leader, the highest rank open to a player: every division already has its named Division Leader.

11c. **Chapter 9, "Drowned Basements"** (all divisions): eight days of rain flood the basements of the Canal Quarter, and the necrotic comes through the tunnels under the 404 wall.
   - **Outbreak mode on the command map:** every district has an infection figure. A new order, CONTAIN, is VECTOR procedure: it brings infection down quickly, at the cost of resentment and fatigue. Uncovered districts grow, districts at 40 spread to their neighbours, and at 60 there are blooms.
   - **Story scenes:**
     - Block Warden Ostrova hides a bitten family;
     - bite screening at Plaza 5 (the watch minigame);
     - District Prefect Sallow wants Stack 9 welded shut;
     - a voice you know calling from the drowned basement (the breach minigame);
     - Formalin wants a live specimen;
     - the source under Pump House 4: flood the quarter from the dam, burn it, empty it first with the cells' boats, or seal the tunnels.
   - **Ending:** City 9's story stays open; the radio from City 17 goes silent.

11e. **Chapter 10, "The Coast Road"** (all divisions): for the first time you leave the city, leading a task force up the old coast road north of City 9.
   - **The road:** eight sectors of ruins where refugees, deserters from Civil Protection and armed fighters of the Lambda Resistance live.
   - **The sector map, with fog of war:** each field day you choose one sector and one action: scout (reveal who is there), negotiate (everyone moves on; fighters withdraw down the road), raid (cleared, but people get hurt), or burn. Fighters left standing raid the camp at night.
   - **Story scenes:**
     - a deserter you know (Rook or Wick);
     - the refugee column at the toll plaza (papers minigame);
     - a captured Lambda medic who, for the first time in the game, says the name *Gordon Freeman*;
     - an ambush in the rail cutting (breach minigame);
     - the church where refugees and fighters shelter together.
   - **The report:** counts the cleared sectors, the people moved on, detained and harmed, and the sectors burned.
   - **The name:** the Union still says Anticitizen One. You stay Civil Protection.
   - **In the field:** the city's duty board, evenings and events step aside. Camp duties replace them: the sentry line (watch minigame, fewer night raids), the water detail, the detainee pen, the radio truck (reveals a sector), and convoy escort. Evenings are in the camp.

11f. **Chapter 11, "The Siege"** (all divisions, two acts).
   - **Act I:** City 17 has fallen. A driverless train comes south full of empty Overwatch armour, the Spire flickers, and FREEMAN is chalked on every Stack.
     - **Preparation:** you prepare the Nexus (ammunition, fortifications, medical stores, flooding the canal tunnel, shelter for Stack 9, the gas). Each preparation becomes a resource on the night.
     - **Old acquaintances come back:** Mira (or Halloran), Brask and Warden Ostrova, the deserter from the coast road (or your canal contact), Sector Administrator Morow and Ledger.
   - **Act II, the siege of the Nexus:** twelve hours, 21:00 to 09:00.
     - **Positions:** four (main gate, forecourt, canal tunnel, roof and mast), each with an integrity bar.
     - **Each hour:** you post four teams and choose one action: hold, resupply, treat the wounded, sally, radio the Sector, or release the gas if you allowed it.
     - **Losing:** wounded teams and empty magazines hold half as well. The forecourt falling, or any two positions, and the Nexus is lost.
     - **Between hours:** Mira at the gate, Ostrova's families at the side door, the Administrator who wants to flee by the roof, the deserter in the tunnel offering a way out, and Morow ordering the gas.
     - **Balance:** by simulation, planned play holds about 93%; leaving the teams where they stand with random actions holds about 10%.
   - **Epilogue:** dawn; the Union's own radio says the name for the first time; your service record.

11g. **Service record**: your whole career on one sheet. It shows citizens stopped, files kept, let go and amputated, merit, loyalty and your JURY file; a line for every chapter's night; the people who trust or hate you; and an assessment. You can open it from the Roster.

11h. **More than text.** Two presentation layers, each with a switch in the Menu, and a way to play a shift on the map.
   - **Cinematic scenes:** a scene's picture becomes a wide frame that slowly pans and zooms, with weather over it chosen from the scene (rain, smoke, screen flicker, dust). The same picture, blurred, fills the page behind the story. Dialogue shows the speaker's face when the game knows it.
   - **Mask HUD** (once you wear the mask):
     - a lens vignette and corner brackets;
     - a biosignal trace that beats faster and turns red when you are hurt or watched;
     - a radio waveform that moves on RADIO and DISPATCH lines;
     - a scan sweep with the CID over the face of a citizen you stop.
   - **Patrol on the map** (*Walk the city* on the duty board): a shift from 08:00 to 18:00 on the painted map of a district you choose: District 5 (home), the Nexus, the Works, Canal Quarter, Rail Yards, Hydro, and Upper Town from rank 02. Each has its own map, local incidents and start point; only District 5 has blocks that remember what you missed. The siege board of chapter 11 sits on the Nexus map.
     - Eight places, an hour a move. Tap a place to walk there.
     - Incidents appear with timers: a queue turning, a runner, a Lantern alert, chalk, a collapse, a cart at the gate, a whisper, a quarrel.
     - Each is a small choice or check. What you do not reach lapses, and the block remembers.
     - Far places take two hours to reach. Your partner walks with you and comments.
     - Some incidents open the game's bigger systems and return to the map afterwards: a stop and search, a raid on a cellar with a new padlock, crowd control under a frozen screen. A face from your case files can turn up on a corner.
     - **The map is the day.** The duty board lists *Walk the city* first. Your division's assignments from the board appear on the map as incidents (an assignment, at a place that fits your division: UNION on Plaza 5, SPEAR at Canal Gate 3, GRID in the Bazaar and so on). Take one and the duty plays, then you are back on the map. The old board duties stay below it as the other way to spend a day.
     - **Night patrol** (grade 04 and up): the curfew shift from 20:00 to 02:00 on a darkened map, with its own incidents: curfew breakers, a Shrike searchlight, lights in an empty flat, something in the canal.

11d. **New district duties** (one per division): the Upper Town beat (UNION), the Cathedral Ward checkpoint (RAZOR), the Hydro turbine hall (GRID), the Upper Town clinic (HELIX), the Prefect's ledger (JURY), the culvert sweep under the wall (SPEAR) and the Upper Town screening (VECTOR). District Prefect Sallow and Block Warden Ostrova become people with relations.

12. **Division transfer** (grade 01): once a day the duty board offers *Apply for a transfer*. The target division sets the exam: a written doctrine question (1 point), a practical in that division's own minigame (2 points) and an interview (1 point). Three of four points pass, and you keep your grade and file but get a new officer, partner and team. Fail, and that division will not read your name for 14 days. `js/content/transfer.js`.

13. **GRID: Lantern dock** (a GRID duty): the SC-9 Lantern scanner drones.
   - **First shift:** Lantern 0114 has come down on the roof of Stack 22.
     1. Get the memory core back from the boy with the slingshot: order him, pay him, or ask why.
     2. Rewire the drone (circuit).
     3. Decide what happens to its last recording, two UNION units in a stairwell: send it to JURY, cut it, or keep a copy.
     4. Fly the search with the new **Lantern** minigame.
   - **Lantern minigame:** a block facade of windows. Each scan reads HOT, WARM or COLD, and you find the window before the scans or the battery run out. Radio & Protocol gives more scans.
   - **Routine shifts:** search flights, dock maintenance, the footage backlog.

14. **The faces come back.** Everyone you stop, search, raid or flag keeps a file with their ID photo. Some evenings one of them comes back, shaped by what you did. Each echo opens with their photo and a memory line: CID, day and verdict.
   - **Let go:** they are at the canal culvert with the cells, they calm a crowd that turns on you, or a child slides a drawing under your door.
   - **Given points:** they are on the relocation train, back from Level 4, or their CID is chalked on your locker.
   - **Amputated:** a stairwell shrine, or a child asking at the gate if you knew them.
   - **Bribed:** they come back for more, or they trade your designation to JURY.

15. **Your JURY file.** Every act that raises suspicion by 3 or more writes a page: the day, the place, the exact words of your choice, and the evidence (Lantern footage, witness statement, informant report, access log).
   - **Strength:** the file's strength is your suspicion. When suspicion falls, the oldest pages go cold.
   - **Ledger:** JURY's internal-files officer quotes a page back to you in a corridor, and interviews you at 60 suspicion. You can deny it, admit a smaller version, or give her your partner.
   - **Access:** you see the file through resistance 20+, VEIL's shadow, or JURY at Elite rank. With access you can make pages disappear every few days, each kind its own way. Getting caught writes a new page.

16. **The living map.** District 5 is drawn in the Dossier.
   - **What shows:** lit windows follow order, and go dark when GRID cuts a block's power. Chalk lambdas spread with resentment, smoke rises where there is trouble, and Lantern drones drift over the roofs (red on alert). The Plaza 5 screen shows Anticitizen One, and the canal-cell flag flies on Stack 14 after chapter 7.
   - **Tap a block:** see its state in words and the faces from your files who live there.

17. **The night desk** (GRID and JURY duties): four Lantern feeds at once, each playing a scene in three beats.
   - **Who you see:** some people are doing something, some only look as if they are, and most are living their evening.
   - **Controls:** ZOOM shows the face and jumps a beat ahead, at the cost of seconds. You have three FLAGS.
   - **Consequences:** everyone you flag gets a file with their face, so they can come back as echoes. You can pull wrong slips before 06:00.

18. **The city map** (a *Map* button in the top bar and the mobile nav): City 09 from above.
   - **Zones:** D1–D5 on the south bank, D6 Cathedral Ward, D7 Upper Town and D8 Hydro on the north bank, the 404 quarantine and the Spire, each with a live status colour (calm, tense, trouble, no access).
   - **Status from the game:**
     - D1: your standing and your JURY file;
     - D2: the ration cut;
     - D3: the strength of the canal cells, and your informants;
     - D4: the railway and the trains;
     - D5: the five blocks, with the District 5 block map to tap into;
     - the dam: GRID's power cuts.
   - **Base:** the painted map `assets/img/city-map.jpg` (a schematic if `G.CITY_MAP_IMG` is null). Zones are rectangles in a 1600 × 900 space, laid over it.

19. **Quality of life**:
   - **Undo:** undo the last choice (U, or in the menu). It is not offered across skill checks or minigames, so dice cannot be re-rolled.
   - **Keys:** 1–9 choose, Space continues when there is one choice, D opens the dossier, C the codex and M the menu.
   - **Odds:** hover a check's % to see what the chance is made of. The roll line shows the same breakdown.
   - **Current orders** at the top of the dossier: where the open chapter stands, the next grade and what blocks it, board retries, strikes and when they expire, and transfer refusals.
   - **Evening summary:** a one-line summary of the day (merit, loyalty, tokens, health, and which contacts changed). The dossier shows ▲▼ next to contacts.
   - **Menu:**
     - text animation (Normal / Fast / Instant);
     - when each save was made;
     - a confirmation before loading an older save.
   - **Jump button:** "↓ Current scene" when you have scrolled away from it.

Endings in this chapter: *Amputated*, *The River Remembers* (defect to the resistance), or reaching 03 and choosing a division, after which you can keep serving.

## Art

Reference art (helmet, division uniforms, armbands, emblems, flags) lives in `assets/img/`. It appears in scenes, in the Codex and as your division emblem in the Dossier. The prompts that produced it are in `docs/style-sheet.md`. In scene text, add an image with `'@img assets/img/file.jpg|Caption'`.

### Image pipeline

The game loads `.webp` files. Each `.jpg` beside them is the source, and the file to attach to image prompts (`docs/style-sheet.md` names them). After adding or replacing art:

```
python3 tools/optimize-images.py   # writes .webp for new/changed .jpg, palettises PNG emblems and icons
```

`assets/img/ref/` holds prompt references only and is never loaded by the game. The test suite fails if code points at a `.jpg` or at an image that does not exist.

## Mobile navigation

On phones the actions sit in a bottom bar (Story, Dossier, Codex, Menu) and the top bar shows only your designation and the time. The bar is built from `G.NAV` in `js/engine.js`. To add a tab for a future feature (map, inventory, orders…), push an entry from any content file:

```js
G.NAV.splice(2, 0, {
  id: 'map', label: 'Map', icon: '<svg viewBox="0 0 24 24">…</svg>',
  if: (s) => s.phase === 'union',          // optional: when to show it
  badge: (s) => s.flags.newOrders ? '!' : '', // optional
  act: (s, G) => { /* open your view */ },
});
```

## Code

```
index.html            layout
css/style.css         terminal styling, responsive
js/engine.js          state, rendering, checks, effects, saves, sidebar
js/content/codex.js   lore entries
js/content/prologue.js
js/content/training.js
js/content/union.js   duty loop, evenings, Mira, infirmary, endings
js/content/duties.js  the seven duties
js/content/beats.js   story beats, evaluations, division select, G.chapter scaffold
js/content/search.js  stop & search, case files
js/content/docs-game.js  document inspection minigame
js/content/chapter2.js   UNION and JURY arcs, interrogation
js/content/systems.js discipline, promotion boards, subtle signs (hooks into existing scenes)
js/content/raids.js   apartment raids, incident reports, informants
js/content/squad.js   protection team
js/content/world.js   district stability, mornings, evenings, echoes
js/content/routines.js routine duty variants
js/content/crowd.js   crowd-control minigame
js/content/chapter3.js, chapter4.js
js/content/divisions.js division cast, duty builder, division duties
js/content/arcs.js    chapter-two arcs for HELIX, RAZOR, SPEAR, VECTOR, GRID
js/content/duties2.js more division duties (ten per division)
js/content/lore.js    lore records, rumours, echoes, chalk
js/content/career.js  rank perks, promotion ceremony, officer gates, roster tab
js/content/minigames2.js circuit and tail minigames
js/content/minigames3.js triage, watch, breach, sample minigames
js/content/chapter5.js The Academy, VEIL
js/content/chapter6.js Collection, the railway
js/content/transfer.js division transfer exam (grade 01)
js/content/chapter7.js Anticitizen One, the night the screens go dark
js/content/qol.js     current orders, day summary, contact trends
js/content/lantern.js GRID duty: Lantern dock, drone search minigame
js/content/echoes.js  the faces come back (case-file echoes)
js/content/jfile.js   your JURY file: pages, Ledger, burning pages
js/content/dmap.js    the living District 5 map in the Dossier
js/content/desk.js    night desk: four Lantern feeds (GRID, JURY)
js/content/citymap.js the City 09 map: districts, status, drill-down
js/content/command.js the command map: teams, orders, evening reports
js/content/chapter8.js The Inspection
js/content/chapter9.js Drowned Basements (necrotic outbreak)
js/content/districts.js duties in D6-D8 and the Upper Town; the Prefect and the wardens
js/content/chapter10.js The Coast Road: the sector map (fog of war)
js/content/chapter11.js The Siege of the Nexus; the service record
js/content/patrol.js   patrol shift on the District 5 map
js/fx.js              cinematic scenes and the mask HUD
js/content/onboarding.js field notes
js/audio.js           procedural sound
```

Writing a new chapter: start the file with `const { adv, set } = G.chapter({ n: 8, stages: [[1, 'evening', 'c8_1'], …] })`. That records when chapter 7 ended, starts `c8_start` two days later and plays each stage scene on its beat. Scene hooks (`enter`, `before`, `after`) redirect only by returning a scene id. Write them with braces, `(s) => { s.c8.x = 'held'; }`, so an assignment is not returned by mistake. The engine reports a stray string as a console error, and the tests fail on it.

Tests (Playwright with Chromium):

```
npm install && npx playwright install chromium
npm test              # full suite, a few minutes
npm run test:quick    # about a minute
node tests/run.js --only=saves   # one suite by name
```

The suite checks that every scene, check and duty target exists, every image the code names is on disk, the service worker caches every script, and then plays the game at random: a new character through chapter 1, the service loop with raids, reports, informants, boards and discipline, both chapter 2 arcs, the document minigame on phone and desktop, and save export/import plus loading an older save. Run it before every push.

Scenes are plain objects:

```js
G.addScenes({
  my_scene: {
    title: 'Somewhere',
    enter: (s) => { /* runs once on arrival; may return another scene id to redirect */ },
    text: (s) => ['Paragraph', '@say Name|Dialogue', '@dispatch Broadcast', '@radio Chatter', '@sys Note', '@doc Printout'],
    choices: [
      { t: 'Do a thing', fx: { merit: 2, cons: -3, rel: { mira: 5 } }, go: 'next_scene' },
      { t: 'Risky thing', check: { skill: 'deception', diff: 10, pass: 'ok_scene', fail: 'bad_scene' } },
      { t: 'Only if…', if: (s) => s.flags.something, lock: (s) => (s.tokens < 5 ? 'Not enough tokens' : null), go: 'x' },
    ],
  },
});
```

### Conventions that keep the code maintainable

- **Extending a scene from another file:** use `G.extend(id, { before, after, text, choices })` instead of overwriting `G.scenes[id]`. `before` and `after` run around the scene's own `enter` and may redirect; `text` and `choices` receive the resolved lists and return new ones. `G.ext` shows every extension per scene.
- **Law:** penalty points, contraband levels and the amputation threshold live in `G.LAW` (`js/content/codex.js`), next to the tables the player reads.
- **Saves:** when the state changes shape, raise `G.SAVE_VERSION` in `js/engine.js` and push a migration onto `G.MIGRATIONS`. New fields that have a default in `G.fresh()` need no migration: loading merges each saved object over its default.
- **Service worker:** `python3 tools/bump-sw.py` sets `VERSION` from a hash of the cached files. The tests fail if it is stale.
- **Images:** `python3 tools/optimize-images.py` after adding art (see *Image pipeline*).
- **Before pushing:** `npm test`.

*Half-Life is a trademark of Valve Corporation. This is a non-commercial fan work with original writing and characters; it contains no assets from the games.*
