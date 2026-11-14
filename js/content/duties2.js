/* MORE DUTIES — ten per division. Built with G.divDuty (divisions.js).
   Some duties need a grade (minRank): officers' work for the units who have earned it. */
(function () {
  const K = { L: { tag: 'BY THE BOOK', tagCls: 'loyal' }, M: { tag: 'MERCY', tagCls: 'mercy' }, R: { tag: 'RISK', tagCls: 'risk' }, B: { tag: 'BRUTAL', tagCls: 'risk' } };
  const c = (t, out, fx, k) => Object.assign({ t, out, fx }, K[k] || {});
  const x = (t, skill, diff, ok, okFx, bad, badFx, k) => Object.assign({ t, check: { skill, diff, ok, okFx, bad, badFx } }, K[k] || {});
  const r = (title, text, choices) => ({ title, text, choices });
  const img = (n) => `assets/img/env/${n}.webp`;
  const mate = (s) => G.partnerOf(s).name;
  const sup = (s) => G.superiorOf(s).name;
  const D = (d) => G.divDuty(d);
  const disc = (sev, why, fx) => (s) => (G.discipline(s, sev, why), fx || null);

  /* ================================================================ UNION (+2 → 10) */
  D({
    key: 'utrainee', div: 'UNION', minRank: '02', name: 'Field training', desc: 'Take a new 05 out on their first week.', block: 'bazaar',
    first: r('Bazaar Row — a new five', ['Your trainee is nineteen, wears the mask like a borrowed coat, and has never stopped anyone. At the batteries stall a man refuses to show his card. The five looks at you.'], [
      c('“Your stop. I am watching.”', ['The five does it badly and correctly. The man shows his card. The five’s hands shake for an hour afterwards. Yours did too, once.'], { merit: 3, xp: { authority: 1 } }, 'L'),
      c('Do it yourself, slowly, so the five can see how.', ['You do it the way Rook did it to you. The five takes notes in a tiny book.'], { merit: 2, cons: 1 }),
      x('Let the man go and explain to the five why.', 'authority', 5, ['“Because he has a card, and he is frightened, and frightened people with cards are not your job.” The five thinks about it all day.'], { cons: 3 }, ['The five does not understand, and repeats it to the squad in the mess.'], { lp: -1 }, 'M'),
    ]),
    routine: [r('Field training', ['A quiet week. The five learns the radio codes, the stairwells, the faces. By Friday they nod to stall holders.'], [c('Sign off the week.', ['A good trainee. You will hear about them, one way or the other.'], { merit: 2 })])],
  });
  D({
    key: 'unight', div: 'UNION', name: 'Night desk', desc: 'The precinct desk from 22:00. Radio, walk-ins, the cells.',
    first: r('D5 precinct — the night desk', (s) => ['At 02:10 a woman walks into the precinct, which citizens never do, and says her husband has been taken by men in masks. Not units. Men in masks. The cells list has no one by his name.'], [
      c('Log it and send her home.', ['She goes. The log goes up the chain. Nothing comes back down.'], { merit: 1 }, 'L'),
      x('Ring Level 4 and ask, unofficially.', 'comms', 10, ['A JURY clerk you know says: *not ours*. Which means the canal cells, or something worse. You give the woman the only true thing you have: “Not us.”'], { cons: 2, xp: { comms: 1 } }, ['Level 4 asks why you are asking.'], { susp: 2 }),
      c('Walk her home yourself.', ['At her door she asks you in for tea. You say no. You stand on the landing until her light goes out.'], { cons: 3 }, 'M'),
    ]),
    routine: [r('The night desk', ['Radio chatter, a drunk CWU worker in cell 2 singing, rain on the skylight.'], [c('Hold the desk till dawn.', ['Nothing happens. You drink four cups of sector water that claims to be coffee.'], { merit: 2 })])],
  });

  /* ================================================================ JURY (+5 → 10) */
  D({
    key: 'jtransit', div: 'JURY', name: 'Prisoner transport', desc: 'Level 4 to the relocation yards. Sealed van, four detainees.',
    first: r('The JURY van — the bridge', ['Four detainees in the back of a sealed van, bound for the D4 yards. Halfway across the bridge one of them starts to choke. The others bang on the partition.'], [
      c('Do not open the van. Procedure.', ['At the yards the van opens on three detainees and one who did not make it. Nobody at the yards is surprised.'], { merit: 2, cons: -6 }, 'L'),
      x('Stop, open, treat him.', 'medical', 5, ['A fit. He comes round. The others watch you through the door with an expression you will not forget.'], { cons: 4, xp: { medical: 1 } }, ['You open the door and the man is out and over the railing before you can grab him.'], disc('serious', 'Detainee lost in transit', { cons: -2 })),
    ]),
    routine: [r('Prisoner transport', ['Four detainees, one van, nobody speaks.'], [c('Deliver them.', ['Signed for at the yards at 06:12.'], { merit: 2 })])],
  });
  D({
    key: 'jwitness', div: 'JURY', name: 'Witness statements', desc: 'Take statements in the Stacks about a crime nobody saw.', block: 's14',
    first: r('Stack 14 — statements', ['A unit was knifed in the stairwell of Stack 14. Forty flats, forty statements, forty people who were asleep.', 'The old woman in 6A was not asleep. You can tell from her hands.'], [
      x('Press her, gently.', 'authority', 5, ['She gives you a description: a boy, a red jacket, a limp. She cries afterwards, because she knows the boy.'], { merit: 4, cons: -2 }, ['She gives you nothing, firmly.'], {}, 'L'),
      c('Write “asleep” like the rest.', ['Forty identical statements. The Magistrate sighs at the file.'], { cons: 2 }, 'M'),
    ]),
    routine: [r('Statements', ['A theft from a ration hatch. Six witnesses, six different men.'], [c('Write them all down.', ['The file thickens. The truth does not.'], { merit: 2 })])],
  });
  D({
    key: 'jwire', div: 'JURY', name: 'Listening post', desc: 'Headphones in a cupboard on Level 4. Stack 9’s radios, all night.', block: 's9',
    first: r('Level 4 — the listening post', ['Every unregistered receiver in Stack 9 leaks a little. JURY listens. Tonight, between two pirate songs, a man reads out a list of names, slowly, like a register. Some you know from case files.'], [
      c('Record it and send it up.', ['By morning the list is on the Magistrate’s desk. By evening some of the names have new files.'], { merit: 4, res: -4 }, 'L'),
      x('Record the music, not the list.', 'deception', 10, ['Twelve minutes of a pre-war song in the log. Nobody upstairs listens to music.'], { cons: 3, res: 4 }, ['The clerk checking your tape stops at minute six, frowns, and rewinds.'], disc('serious', 'Tampered surveillance recording'), 'M'),
    ]),
    routine: [r('Listening post', ['Static, coughing, a couple arguing about bread.'], [c('Log the arguments.', ['Nobody is arrested for bread, today.'], { merit: 2 })])],
  });
  D({
    key: 'jdeath', div: 'JURY', name: 'Death inquiry', desc: 'A unit is dead. JURY asks how, and whether it matters.',
    first: r('A D3 pump house — the body', ['A UNION 03 found face down in a pump house in D3. No wound you can see. His biosignal stopped at 03:12. His locker had a ration wrapper in it with a lambda drawn on the inside.'], [
      x('Examine the body properly.', 'perception', 10, ['Not murder. Fever, cold water, a bad fall. He went into the pump house to meet someone. The someone did not stay.'], { merit: 4, xp: { perception: 1 } }, ['You find nothing, which in JURY means you write *policide*.'], { cons: -3 }),
      c('Write policide. It closes faster.', ['Policide is Level 7. Somebody in D3 will answer for it. It does not much matter who.'], { merit: 3, lp: 2, cons: -8 }, 'B'),
    ]),
    routine: [r('Death inquiry', ['A 05 hit by a tram on a disused line that is apparently not disused.'], [c('Close the file.', ['Accident. The tram line is still not disused.'], { merit: 2 })])],
  });
  D({
    key: 'jreview', div: 'JURY', minRank: '01', name: 'Promotion review', desc: 'Read another unit’s file before their board. Your word counts.',
    first: r('Level 4 — a file', ['A UNION 02 is up for 01. Clean record, good arrests, and three reports that each omit exactly one thing. You can tell, because you have written reports like that.'], [
      c('Flag the omissions.', ['The 02 fails the board. They will not know why. JURY never says.'], { merit: 4, cons: -3 }, 'L'),
      c('Pass the file. Everybody omits something.', ['The 02 becomes an 01. Somewhere a version of you is being reviewed by someone kinder.'], { cons: 3 }, 'M'),
    ]),
    routine: [r('Promotion review', ['Three files. Nothing in them.'], [c('Pass them.', ['Your stamp, three times.'], { merit: 2 })])],
  });

  /* ================================================================ HELIX (+7 → 10) */
  D({
    key: 'hblood', div: 'HELIX', name: 'Blood drive', desc: 'Synthetic blood is short. Citizens donate, by order.', block: 'plaza',
    first: r('The Works — blood drive', ['Two hundred mill hands, one needle each, a ration bonus for a pint. A boy of about fifteen has lied about his age to get the bonus. He is already pale.'], [
      c('Send him home without the bonus.', ['He goes home without the bonus and without the pint. His mother will be angry about one of those.'], { merit: 1 }, 'L'),
      c('Send him home with the bonus.', ['You sign his slip. He runs.'], { cons: 3, susp: 1 }, 'M'),
      c('Take the pint. He signed.', ['He faints on the steps outside. The pint goes to a unit in the ward.'], { merit: 2, cons: -4 }),
    ]),
    routine: [r('Blood drive', ['Needles, cotton, bonus slips, a long quiet line.'], [c('Work the line.', ['Two hundred pints. The ward will last the month.'], { merit: 2, xp: { medical: 1 } })])],
  });
  D({
    key: 'hupa', div: 'HELIX', minRank: '02', name: 'Suppression clinic', desc: 'The field clinic that checks the suppression field is working.',
    first: r('The suppression clinic', ['Routine checks on women from the Works. The suppression field has worked for twenty years. On this woman, it has not. She is eleven weeks along, and she knows what that means: UPA, Level 6.'], [
      c('Report it. The field has failed; the Union must know.', ['VECTOR takes an interest in her, not JURY. That is not better.'], { merit: 5, lp: 3, cons: -15 }, 'L'),
      x('Write “clear” on her chart.', 'deception', 15, ['Clear. She leaves without a word. Somewhere in the Stacks, in seven months, something impossible will happen.'], { cons: 10, res: 6 }, ['The auditor re-runs your samples that evening.'], disc('serious', 'Falsified suppression-clinic result', { cons: 4 }), 'R'),
    ]),
    routine: [r('Suppression clinic', ['Sixty checks. Sixty clears. The field works. It always works.'], [c('Sign the sheets.', ['Clear, clear, clear.'], { merit: 2 })])],
  });
  D({
    key: 'hota', div: 'HELIX', name: 'Overwatch triage', desc: 'Assist Overwatch medics. Do not ask what you are stitching.',
    first: r('The Nexus roof — Overwatch triage', ['A transport lands with a wounded Overwatch soldier. Its medics work fast and do not talk. One of them hands you a clamp and points. Under the armour there is skin, and under the skin there is not quite what there should be.'], [
      c('Clamp where it points. Do not look.', ['The soldier lives. The medic nods once, which is more than Overwatch has ever said to you.'], { merit: 4 }, 'L'),
      x('Look. Learn.', 'perception', 10, ['You learn more about transhumans in four minutes than in four years. You will not be able to unlearn it.'], { xp: { medical: 2 }, cons: -2 }, ['The medic sees you looking and takes the clamp away.'], { susp: 2 }),
    ]),
    routine: [r('Overwatch triage', ['A soldier with a cracked visor slit. Nothing to stitch. They only wanted a unit to hold the light.'], [c('Hold the light.', ['Twenty minutes, absolutely still.'], { merit: 2 })])],
  });
  D({
    key: 'hmorgue', div: 'HELIX', name: 'Morgue', desc: 'The cold room under the ward. Tags, records, families who are not told.',
    first: r('The morgue', ['Eleven drawers, eleven tags. Drawer 7 has no tag: a citizen, young, brought in from Level 4 with no paperwork. A woman is at the gate asking for her son.'], [
      c('Tell her nothing. Drawer 7 has no tag.', ['She goes away. She will come back every week.'], { merit: 1 }, 'L'),
      x('Show her drawer 7.', 'deception', 10, ['It is him. She does not scream. She thanks you, which is worse.'], { cons: 5, susp: 2 }, ['Matron is at the door when you close the drawer.'], disc('minor', 'Unauthorised morgue access for a citizen'), 'M'),
    ]),
    routine: [r('Morgue', ['Tags, temperatures, a body bag zip that sticks.'], [c('Finish the log.', ['Eleven drawers. All correct.'], { merit: 2 })])],
  });
  D({
    key: 'hambulance', div: 'HELIX', name: 'Night ambulance', desc: 'After curfew. Anyone who calls is breaking curfew to do it.',
    first: r('Night ambulance — Stack 22', ['A call from Stack 22 at 01:30: a child with a burn. To call, the father had to cross the courtyard after curfew. A UNION patrol has him against the wall downstairs.'], [
      c('Treat the child. The father is UNION’s business.', ['The burn will heal. The father gets three points.'], { merit: 2 }),
      x('Treat the child, then tell the patrol he is your witness.', 'authority', 10, ['The patrol lets him go. He carries his daughter back upstairs himself.'], { cons: 4, merit: 1 }, ['The patrol leader tells you to stitch and shut up.'], {}, 'M'),
    ]),
    routine: [r('Night ambulance', ['A broken ankle, a fever, a man who just wanted someone to come.'], [c('Do the rounds.', ['Back at 05:00 with an empty kit.'], { merit: 2, xp: { medical: 1 } })])],
  });
  D({
    key: 'hpharm', div: 'HELIX', name: 'Pharmacy audit', desc: 'Count every vial in the HELIX stores.',
    first: r('HELIX stores — the count', (s) => [`The biogel count is short by thirty vials. Thirty vials is a stairwell full of people who did not die of infected cuts. ${mate(s)} signs the stores out every night.`], [
      c('Report the shortfall.', (s) => [`JURY interviews ${mate(s)} for a day. Nothing is proved. The vials do not come back.`], { merit: 4, rel: { lark: -10 } }, 'L'),
      c('Correct the count yourself.', ['Thirty vials become a rounding error in your hand.'], { susp: 3, res: 4, rel: { lark: 8 } }, 'M'),
    ]),
    routine: [r('Pharmacy audit', ['The count is right. It is always right after a bad month.'], [c('Sign it.', ['Correct to the vial.'], { merit: 2 })])],
  });
  D({
    key: 'hteach', div: 'HELIX', minRank: '01', name: 'Instruct recruits', desc: 'Teach field medicine to the training wing.',
    first: r('The training wing', ['Twelve recruits with shaved heads and no masks, the way you were. HELIX-02-77301 used to teach this course. Now you do. A recruit asks: “Who do we treat first?”'], [
      c('“Units. Then VIPs. Then citizens, if ordered.”', ['They write it down. They will remember it word for word.'], { merit: 3 }, 'L'),
      c('“The one who will die first.”', ['They write that down too. One of them looks at you for a long time.'], { cons: 3 }, 'M'),
    ]),
    routine: [r('Instruct recruits', ['Bandaging drills on each other. One faints at the sight of a fake wound.'], [c('Teach.', ['Twelve recruits who can stop a bleed. That is twelve more than yesterday.'], { merit: 2 })])],
  });

  /* ================================================================ RAZOR (+7 → 10) */
  D({
    key: 'rconvoy', div: 'RAZOR', name: 'Ration convoy', desc: 'Guard the trucks from the packing plant to the RDTs.',
    first: r('The ration convoy', ['Three trucks, six RAZOR units, the Canal Quarter road. At the lock bridge a cart has broken down across the road. An old man is trying to lift a wheel.'], [
      x('Clear the cart. Fast.', 'fitness', 5, ['The cart goes into the canal. The convoy goes through. The old man sits on the kerb.'], { merit: 3, cons: -3 }, ['The cart will not move and the convoy sits there for ten minutes, exposed.'], { merit: -1 }, 'L'),
      x('Hold the convoy and look at the rooftops first.', 'perception', 5, ['Nothing on the roofs. The old man was just an old man with a broken cart. You help him lift the wheel.'], { cons: 3, merit: 2 }, ['Nothing on the roofs that you see.'], {}),
    ]),
    routine: [r('Ration convoy', ['Three trucks, six units, no trouble.'], [c('Ride it out.', ['Delivered.'], { merit: 2 })])],
  });
  D({
    key: 'rlobby', div: 'RAZOR', name: 'Nexus screening', desc: 'The lobby of the Nexus. Every visitor, every bag.',
    first: r('The Nexus lobby', ['A CWU director arrives for a meeting upstairs with a leather case he does not want opened. He mentions his friends on the top floor. He mentions them twice.'], [
      c('Open the case.', ['Documents and a bottle of pre-war brandy. He will remember your designation. So will the top floor.'], { merit: 3, lp: -1 }, 'L'),
      c('Let him through. Friends on the top floor.', ['He pats your shoulder plate as he passes.'], { lp: 1, susp: 1 }),
    ]),
    routine: [r('Nexus screening', ['Clerks, couriers, an Overwatch soldier who does not stop and is not asked to.'], [c('Screen them.', ['Six hundred bags.'], { merit: 2 })])],
  });
  D({
    key: 'rresidence', div: 'RAZOR', minRank: '02', name: 'The Administrator’s residence', desc: 'Night watch at the residence above the Nexus.',
    first: r('The residence — 03:00', ['The Administrator does not sleep either. At 03:00 the door at the end of the corridor opens and a tired old man in a dressing gown asks you whether you think the city loves him.'], [
      c('“The city is grateful, Administrator.”', ['He nods, unconvinced, and closes the door.'], { lp: 3, merit: 2 }, 'L'),
      x('“I think the city is hungry, Administrator.”', 'authority', 15, ['He looks at you for a long time. “Yes,” he says. “I know.” The ration is not changed. But he knew.'], { cons: 5, rel: { bastion: 4 } }, ['He closes the door. In the morning you are on a different corridor.'], disc('minor', 'Inappropriate remark to the Administrator'), 'R'),
    ]),
    routine: [r('The residence', ['A long corridor, a red carpet, a clock that ticks too loudly.'], [c('Stand watch.', ['Nine hours. Not one movement.'], { merit: 3 })])],
  });
  D({
    key: 'rrange', div: 'RAZOR', name: 'Range qualification', desc: 'Every RAZOR unit requalifies every month.',
    first: r('The precinct range', ['Twenty rounds, five targets, a clock. Bastion watches from behind you with a slate.'], [
      x('Shoot clean.', 'firearms', 0, ['Nineteen of twenty. Bastion writes something and almost nods.'], { merit: 3, xp: { firearms: 1 }, rel: { bastion: 3 } }, ['Fourteen of twenty. Requalify next week.'], { merit: -1 }),
    ]),
    routine: [r('Range qualification', ['Twenty rounds.'], [x('Shoot.', 'firearms', 0, ['Pass.'], { merit: 2, xp: { firearms: 1 } }, ['Pass, barely.'], {})])],
  });
  D({
    key: 'rstrike', div: 'RAZOR', name: 'The Works gate', desc: 'Hold the Works gate. The shift is refusing to go in.', block: 'plaza',
    first: r('The Works gate — 05:40', ['The siren goes and the morning shift does not go in. Four hundred mill hands stand at the gate with their arms folded, silent. Nobody says the word *strike*; the word does not exist in City 9.'], [
      c('Order them in through the amplifier.', ['They go in, one by one, after ten minutes. Each one looks at you.'], { merit: 3, cons: -2 }, 'L'),
      x('Find out what they want.', 'authority', 10, ['The canteen. They cut the canteen. Bastion carries it up the chain; the canteen opens again for a month.'], { cons: 5, merit: 2 }, ['They do not talk to masks.'], {}, 'M'),
      c('Request Overwatch.', ['Overwatch walks along the line once. Everyone goes in.'], { lp: 3, cons: -10 }, 'B'),
    ]),
    routine: [r('The Works gate', ['The siren, the shift, the gate. Nobody stops.'], [c('Hold the gate.', ['Four hundred cards scanned.'], { merit: 2 })])],
  });
  D({
    key: 'rcourier', div: 'RAZOR', minRank: '01', name: 'Sealed courier', desc: 'Carry a sealed case from the Nexus to the dam. Do not open it.',
    first: r('The sealed case', ['A grey case chained to your wrist, from Vigil’s office to the dam control room. On the bridge the case starts to vibrate, softly, like a phone in another room.'], [
      c('Do not open it. Deliver.', ['The control room takes it without a word. The dam hums the same as always.'], { merit: 5, lp: 2 }, 'L'),
      c('Open it.', ['Inside: a small black box with a cyan light, ticking slowly. A clock. You close it. You will never know what it was counting down to.'], disc('serious', 'Opened a sealed courier case', { xp: { perception: 1 } }), 'R'),
    ]),
    routine: [r('Sealed courier', ['A case, a wrist, a bridge.'], [c('Deliver.', ['On time.'], { merit: 3 })])],
  });
  D({
    key: 'rdrill', div: 'RAZOR', name: 'Breach drill', desc: 'The hardpoint is attacked by your own squad. Hold it.',
    first: r('Hardpoint drill', (s) => [`${sup(s)} runs a drill: your hardpoint against a SPEAR team with paint rounds. The forcefield is down for the exercise.`], [
      x('Hold the line.', 'firearms', 5, ['Paint on six SPEAR units, none on you. SPEAR buys the beer.'], { merit: 4 }, ['Blue paint on your faceplate in the first minute.'], { merit: 1 }),
      x('Hold the line with your voice.', 'authority', 5, ['You run the hardpoint like a choir. Not one shot fired before SPEAR retreats.'], { merit: 4, xp: { authority: 1 } }, ['Nobody can hear you over the paint guns.'], {}),
    ]),
    routine: [r('Breach drill', ['Paint, noise, shouting.'], [c('Run the drill.', ['Paint in your collar all week.'], { merit: 2 })])],
  });

  /* ================================================================ SPEAR (+7 → 10) */
  D({
    key: 'sdrain', div: 'SPEAR', name: 'Drain sweep', desc: 'The storm drains under the canal. Things nest there.',
    first: r('Under the canal', ['Knee-deep water, lamp, shotgun. Halfway along the drain, chalk on the wall at knee height: a lambda with an arrow, and under it, smaller, *not this way*.'], [
      c('Follow the arrow.', ['A dead end and a sealed grate. Someone wanted you here.'], { xp: { perception: 1 } }),
      c('Go the other way.', ['A nest. You burn it. The chalk was a kindness.'], { merit: 4, res: 2 }),
      c('Photograph the chalk for JURY.', ['JURY adds it to the catalogue.'], { merit: 3 }, 'L'),
    ]),
    routine: [r('Drain sweep', ['Water, dark, something moving that turns out to be a rat the size of a cat.'], [c('Sweep it.', ['Clear.'], { merit: 2 })])],
  });
  D({
    key: 'sbridge', div: 'SPEAR', name: 'East bridge checkpoint', desc: 'The only crossing into 404. Nobody uses it, officially.',
    first: r('The east bridge', ['At dusk a CWU scavenger crew asks to cross into Old Town with a permit for *salvage of pre-war copper*. The permit is real. The crew leader has a pistol under his coat. You can see the shape of it.'], [
      c('Confiscate the pistol. Let them cross.', ['He gives it up without a word. They go into the dark unarmed. Maybe that was the point of the permit.'], { merit: 3 }, 'L'),
      c('Let them cross armed.', ['Two hours later you hear one shot from Old Town. Then nothing.'], { cons: 1 }),
      c('Turn them back.', ['They go. The copper stays in Old Town. So does whatever else they wanted there.'], { merit: 2 }),
    ]),
    routine: [r('East bridge checkpoint', ['Nobody crosses. Fog on the canal.'], [c('Hold the bridge.', ['Twelve hours of nothing.'], { merit: 2 })])],
  });
  D({
    key: 'sscav', div: 'SPEAR', name: 'Scavenger patrol', desc: 'Catch the people who climb the wall for tins.',
    first: r('The 404 wall — at dawn', ['Three teenagers coming back over the wire with sacks of tinned food from before the war. One of them has a bite on her forearm, wrapped in a rag.'], [
      c('Send the bitten girl to VECTOR. Process the others.', ['VECTOR takes her. You do not ask, later.'], { merit: 4, cons: -6 }, 'L'),
      x('Look at the bite yourself.', 'medical', 10, ['A dog bite, not the other kind. You let them go with half the tins.'], { cons: 4 }, ['You cannot tell. You send her to VECTOR anyway.'], { cons: -3 }),
    ]),
    routine: [r('Scavenger patrol', ['Footprints, a cut wire, an empty sack.'], [c('Repair the wire.', ['Patched.'], { merit: 2 })])],
  });
  D({
    key: 'srescue', div: 'SPEAR', name: 'Extraction', desc: 'A VECTOR team is pinned down in Old Town. Bring them out.',
    first: r('Old Town — extraction', ['A VECTOR team in sealed suits, pinned in a church by things that used to be parishioners. Two suits, one wounded, a specimen case they will not leave behind.'], [
      x('Go in hard.', 'firearms', 10, ['Out in six minutes with both suits and the case.'], { merit: 5, xp: { firearms: 1 } }, ['Out in twelve minutes. One suit, and the case.'], (s) => (s.squad && s.squad.formed && G.squadHit(s, true, 'the Old Town church'), { merit: 2, cons: -3 }), 'R'),
      c('Leave the case. Bring the people.', ['Both suits come out. The case does not. VECTOR files a complaint about you.'], { merit: 1, cons: 3 }, 'M'),
    ]),
    routine: [r('Extraction', ['A false alarm: a VECTOR radio on the wrong channel.'], [c('Stand down.', ['Back over the canal by noon.'], { merit: 2 })])],
  });
  D({
    key: 'sdrills', div: 'SPEAR', minRank: '02', name: 'Breach training', desc: 'Teach the new SPEAR intake how to take a room.',
    first: r('The training wing — the kill house', ['Six new SPEAR units, a plywood house, live rounds. On the second run one of them freezes in the doorway and the whole stack piles into him.'], [
      c('Run it again until nobody freezes.', ['Eleven runs. Nobody freezes on the eleventh. Some of them hate you.'], { merit: 3 }, 'L'),
      c('Take the frozen one aside.', ['He was in Old Town as a child, before. He knows what is in those rooms. You put him on the wall instead of the doors.'], { cons: 3, merit: 1 }, 'M'),
    ]),
    routine: [r('Breach training', ['Doors, shouts, plywood splinters.'], [c('Run the drills.', ['Another intake that can take a room.'], { merit: 2 })])],
  });
  D({
    key: 'swall', div: 'SPEAR', name: 'Wall night watch', desc: 'A tower on the 404 wall from dusk to dawn.',
    first: r('Tower 6 — night', ['From the tower you can see Old Town in the moonlight. At 02:00 a light comes on in a window in Block 11. Then another. Someone over there has electricity.'], [
      c('Report the lights.', ['A SPEAR team goes in at dawn. The lights are out when they get there. They are back on the next night.'], { merit: 3 }, 'L'),
      c('Watch them until dawn.', ['Someone over there is reading by that light. You can see their shadow turn the pages.'], { cons: 2 }),
    ]),
    routine: [r('Wall night watch', ['Cold. Fog. A dog barking somewhere in the zone, which should be impossible.'], [c('Watch.', ['Dawn.'], { merit: 2 })])],
  });
  D({
    key: 'sdepot', div: 'SPEAR', minRank: '01', name: 'Tram depot recon', desc: 'Lead a team to the old tram depot deep in 404.',
    first: r('Old Town — the tram depot', ['The depot where squad Thistle died. Inside, the trams are lined up as if waiting for the morning shift. On the side of one, painted carefully in white: a name list. Units’ names. Thistle, and others, and the dates.'], [
      c('Photograph it and bring the team out.', ['SPEAR files it. Somebody upstairs wants to know who painted it.'], { merit: 5 }, 'L'),
      c('Add the names you know.', ['You paint two names with a brush you find in the cab. Rasp watches and says nothing.'], { cons: 5, rel: { rasp: 6 } }, 'M'),
    ]),
    routine: [r('Tram depot recon', ['The depot is quiet. Someone has added a name since last time.'], [c('Read the names.', ['Forty-one now.'], { merit: 3 })])],
  });

  /* ================================================================ VECTOR (+7 → 10) */
  D({
    key: 'vburn', div: 'VECTOR', name: 'Incineration', desc: 'Everything that comes back from the zone is burned. Everything.',
    first: r('The incinerator', ['Bags from the 404 wall: clothes, a pram, a child’s drawing of a garden, a stuffed bear. Regulation says all of it.'], [
      c('All of it.', ['The furnace takes the bear last. You watch it go.'], { merit: 3, cons: -2 }, 'L'),
      c('Keep the drawing.', ['A garden with potatoes in it, and seven stick figures. It goes in your locker.'], { cons: 3, susp: 1 }, 'M'),
    ]),
    routine: [r('Incineration', ['Bags, furnace, ash.'], [c('Burn it.', ['Clean.'], { merit: 2 })])],
  });
  D({
    key: 'vquar', div: 'VECTOR', name: 'Stairwell quarantine', desc: 'Seal a stairwell with a suspected case. Nobody in, nobody out.', block: 's22',
    first: r('Stack 22 — quarantine', ['A suspected case on the fourth floor of Stack 22. You seal the stairwell with foam and tape. On the fifth floor, a family with a newborn — an impossible newborn — begs to be let down before the foam sets.'], [
      c('Seal it. Nobody out.', ['The foam sets. The case is negative, in the end. Forty-eight hours in a sealed stairwell with a newborn.'], { merit: 4, cons: -8 }, 'L'),
      x('Let them down, scanned.', 'medical', 5, ['The scan is green. They go down past you. The mother does not let you see the baby’s face.'], { cons: 5, res: 3 }, ['The scan is ambiguous, and you have let them out.'], disc('serious', 'Quarantine breach'), 'M'),
    ]),
    routine: [r('Stairwell quarantine', ['A false alarm in Stack 9: food poisoning, not infection.'], [c('Lift the seal.', ['The foam comes off in grey sheets.'], { merit: 2 })])],
  });
  D({
    key: 'vtest', div: 'VECTOR', name: 'Bite screening', desc: 'Every bite reported in the city is screened. Every one.',
    first: r('Bite screening', ['A CWU worker with a bite on his hand that he swears is from a dog. The scanner is inconclusive. Protocol says forty-eight hours in a cell to be sure. He has four children.'], [
      c('Forty-eight hours.', ['He comes out clean and two ration days short.'], { merit: 3, cons: -2 }, 'L'),
      x('Run a second test yourself.', 'medical', 10, ['Clean. He goes home today.'], { cons: 3, xp: { medical: 1 } }, ['Still inconclusive. Forty-eight hours.'], {}),
    ]),
    routine: [r('Bite screening', ['Three dog bites, one rat, one child who bit her brother.'], [c('Screen them.', ['All clean.'], { merit: 2 })])],
  });
  D({
    key: 'vtransit', div: 'VECTOR', name: 'Specimen transport', desc: 'Move sealed specimens from the zone to the floor without a number.',
    first: r('Specimen transport', ['A sealed tank on a trolley, through the Nexus service corridors at night. Behind the frosted glass, something taps. Three times. Then three again.'], [
      c('Do not answer. Deliver.', ['The Archivist signs for it. The tapping stops when the trolley is still.'], { merit: 3 }, 'L'),
      c('Tap back.', ['It stops. Then, very slowly, it taps once. You deliver it with your heart in your throat.'], { cons: 1, xp: { perception: 1 } }, 'R'),
    ]),
    routine: [r('Specimen transport', ['Three tanks, quiet ones.'], [c('Deliver.', ['Signed.'], { merit: 2 })])],
  });
  D({
    key: 'vwater', div: 'VECTOR', name: 'Ration water check', desc: 'Test the sector water at the RDTs. The Union says it is safe.', block: 'plaza',
    first: r('Plaza 5 — water samples', ['Ten cans from hatch 4. Your field kit shows something in the water that is not on the label: a sedative, mild, constant. You check the batch code. It is every batch.'], [
      c('Log it as within parameters.', ['It is within parameters. The parameters were written by someone who knew.'], { merit: 3, cons: -4 }, 'L'),
      c('Ask the Archivist.', ['“Yes,” the Archivist says. “It helps them sleep. Would you rather they did not?”'], { rel: { archivist: 4 }, cons: -1 }),
      c('Tell someone on Bazaar Row.', ['By the end of the week half the Stacks boil their sector water. It does nothing. It makes them feel better.'], { res: 6, susp: 3 }, 'R'),
    ]),
    routine: [r('Ration water check', ['Within parameters.'], [c('Log it.', ['Within parameters.'], { merit: 2 })])],
  });
  D({
    key: 'vdebrief', div: 'VECTOR', name: 'SPEAR debrief', desc: 'Interview SPEAR units back from the zone. Check them for more than wounds.',
    first: r('Decon tent — debrief', ['A SPEAR 03 back from Old Town, clean on the scanner, talking too fast. He says the zone was empty. His boots have potato soil on them.'], [
      c('Note the soil.', ['VECTOR adds a pin to a map. SPEAR adds you to a list.'], { merit: 3 }, 'L'),
      c('Note nothing. Clean is clean.', ['He looks at his boots, then at you, and says thank you without saying it.'], { cons: 2 }, 'M'),
    ]),
    routine: [r('SPEAR debrief', ['Tired units, clean scans, nothing to say.'], [c('Sign them out.', ['Clean.'], { merit: 2 })])],
  });
  D({
    key: 'varch', div: 'VECTOR', minRank: '01', name: 'The Archivist’s records', desc: 'Help catalogue twenty years of specimens.',
    first: r('The floor without a number — records', ['Twenty years of jars, catalogued in a tiny hand. Specimen 1 is labelled with a date: three years after the war. The night Old Town was closed. The label says: *source: the Spire*.'], [
      c('Catalogue it and say nothing.', ['The Archivist watches you file it, and nods.'], { merit: 4, rel: { archivist: 4 } }, 'L'),
      x('Ask the Archivist what it means.', 'authority', 15, ['“It means it came from above, three,” the Archivist says. “And that we are not allowed to know more.”'], { xp: { perception: 1 }, rel: { archivist: 6 } }, ['“It means you are cataloguing.”'], {}),
    ]),
    routine: [r('The Archivist’s records', ['Jars, labels, dust.'], [c('Catalogue.', ['Four hundred entries.'], { merit: 3 })])],
  });

  /* ================================================================ GRID (+7 → 10) */
  D({
    key: 'gjunction', div: 'GRID', name: 'Junction 7 inspection', desc: 'The conduit vault inside the dam. Weekly, by hand.',
    first: r('Junction 7', ['The conduit hums. Your meter reads a draw on the trunk that is not on any chart: a small, steady tap somewhere between the dam and the Spire, as if the Spire were feeding something else on the way.'], [
      c('Log it for Foreman.', ['Foreman reads the figure and says it is *within tolerance*. His hand shakes when he says it.'], { merit: 3, rel: { foreman: 3 } }, 'L'),
      x('Trace the tap.', 'comms', 15, ['It goes down, not up. Under the dam, under the river. Nothing on any map is down there.'], { xp: { comms: 1 }, cons: 1 }, ['The trace dies in the concrete.'], {}),
    ]),
    routine: [r('Junction 7 inspection', ['Hum, heat, the cyan seams of the conduit.'], [c('Inspect.', ['Nominal.'], { merit: 2 })])],
  });
  D({
    key: 'gscreen', div: 'GRID', name: 'Broadcast screen repair', desc: 'Keep the Administrator on every wall.', block: 'bazaar',
    first: r('Bazaar Row — the dead screen', ['The broadcast screen on Bazaar Row has been dead for a week, and the stall holders have started hanging washing in front of it. Inside the casing: a cut wire, cut neatly, and a little sign in chalk: a circle with a line.'], [
      c('Fix it and report the sabotage.', ['The Administrator returns to Bazaar Row. So does JURY.'], { merit: 4 }, 'L'),
      c('Fix it and say it wore out.', ['The Administrator returns. Nobody is questioned.'], { merit: 2, cons: 1 }),
      c('Report it as beyond repair.', ['Bazaar Row keeps its washing line for a month.'], { res: 4, susp: 2, cons: 2 }, 'M'),
    ]),
    routine: [r('Broadcast screen repair', ['A flickering screen in Plaza 5. A loose cable.'], [c('Fix it.', ['The Administrator is smooth again.'], { merit: 2 })])],
  });
  D({
    key: 'grdt', div: 'GRID', name: 'RDT repair', desc: 'A ration terminal is down. The queue is waiting.', block: 'plaza',
    first: r('Plaza 5 — hatch 2', ['Hatch 2 is dead and three hundred people are waiting for it. Inside, the card reader has a bypass: a tiny circuit that lets one card in ten draw twice. Somebody very hungry and very clever built it.'], [
      c('Remove the bypass. Report it.', ['The hatch works. Someone in the queue will eat less this month.'], { merit: 4 }, 'L'),
      c('Fix the hatch. Leave the bypass.', ['One in ten. Nobody will ever notice except the people it feeds.'], { res: 4, susp: 2, cons: 3 }, 'M'),
    ]),
    routine: [r('RDT repair', ['A jammed hatch. A ration packet wedged sideways.'], [c('Unjam it.', ['The queue moves.'], { merit: 2 })])],
  });
  D({
    key: 'gbio', div: 'GRID', name: 'Biosignal relay', desc: 'The relays that carry every unit’s heartbeat to Dispatch.',
    first: r('Biosignal relay 4', ['A relay on the precinct roof has been dropping signals for an hour a night. In the log you can see whose: the same three units, every night, from 23:00 to midnight. Three units who would rather not be heard for an hour.'], [
      c('Fix the relay. Report the pattern.', ['Three units go to Level 4. One of them is someone you drink with.'], { merit: 4, cons: -4 }, 'L'),
      c('Fix the relay and erase the log.', ['The relay works. The log forgets. Three units owe you something they will never name.'], { susp: 3, cons: 2 }, 'M'),
    ]),
    routine: [r('Biosignal relay', ['A corroded contact. A pigeon.'], [c('Clean it.', ['Every heartbeat clear.'], { merit: 2 })])],
  });
  D({
    key: 'gstacks', div: 'GRID', name: 'Stacks power', desc: 'Distribute what is left of the dam’s output across the Stacks.',
    first: r('The distribution board', ['Tonight you have power for four of the five blocks. Not five. Four.'], [
      c('Cut Stack 9.', ['Stack 9 goes dark at 20:00. Stack 9 always goes dark.'], (s) => (G.distFx && G.distFx(s, 's9', 0, 6), { merit: 2 }), 'L'),
      c('Cut Bazaar Row instead. The stalls can close early.', ['The Row goes dark. The Stacks keep their lights.'], (s) => (G.distFx && G.distFx(s, 'bazaar', 0, 6), { cons: 2 })),
      x('Rebalance so everyone gets ninety percent.', 'comms', 15, ['Every block flickers. No block goes dark.'], (s) => (Object.keys(s.dist || {}).forEach((k) => G.distFx(s, k, 0, -2)), { cons: 3, xp: { comms: 1 } }), ['The board trips, and all five go dark for an hour.'], (s) => (Object.keys(s.dist || {}).forEach((k) => G.distFx(s, k, 0, 4)), { merit: -2 }), 'M'),
    ]),
    routine: [r('Stacks power', ['Enough for all five tonight.'], [c('Balance it.', ['Every window lit.'], { merit: 2 })])],
  });
  D({
    key: 'gtram', div: 'GRID', name: 'Tram line salvage', desc: 'Strip copper from the old tram lines for the Spire.',
    first: r('The old tram line', ['Copper from the dead tram lines, by the kilometre. At the end of the line, a tram stop with a bench, and on the bench, an old woman waiting for a tram that stopped running twenty years ago. She comes every day, the CWU crew says.'], [
      c('Strip the line. She can wait elsewhere.', ['The copper goes to the Spire. The bench goes too.'], { merit: 3, cons: -3 }, 'L'),
      c('Leave the last hundred metres and the bench.', ['Foreman notices the shortfall in copper and not the reason.'], { cons: 4 }, 'M'),
    ]),
    routine: [r('Tram line salvage', ['Copper, sweat, rust.'], [c('Strip it.', ['Two tonnes.'], { merit: 2 })])],
  });
  D({
    key: 'gspire', div: 'GRID', minRank: '01', name: 'Spire base maintenance', desc: 'The foot of the Spire, where the conduits go in.',
    first: r('The foot of the Spire', ['Very few units come here. The Spire’s base is a wall of dark alloy that goes up forever, and the conduits from the dam disappear into it like roots. Your meter reads a heartbeat. Not yours.'], [
      c('Do the maintenance. Do not listen.', ['Three hours on the conduit seals. The heartbeat is still there when you leave.'], { merit: 5 }, 'L'),
      c('Put your glove on the wall.', ['It is warm. You take your glove away very quickly. You do not tell anyone, ever.'], { cons: 1, xp: { perception: 1 } }, 'R'),
    ]),
    routine: [r('Spire base maintenance', ['The seals, the roots, the warmth.'], [c('Maintain.', ['Nominal. Whatever nominal means here.'], { merit: 3 })])],
  });
})();
