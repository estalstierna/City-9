/* BASIC TRAINING — choose 4 of 6 courses, a barracks night, the final live evaluation */
(function () {
  /* mark a course complete; returns extra fx */
  const done = (id, score, extra) => (s) => {
    if (!s.bt.done.includes(id)) {
      s.bt.done.push(id);
      s.bt.count++;
    }
    s.bt.score += score;
    return extra || null;
  };

  const COURSES = {
    range: { name: 'Firearms qualification', where: 'Firing range, sub-level 2', skill: 'firearms', go: 'bt_range' },
    melee: { name: 'Stunstick & restraint drills', where: 'Gymnasium', skill: 'melee', go: 'bt_melee' },
    medic: { name: 'Field medicine (HELIX instructor)', where: 'Infirmary annex', skill: 'medical', go: 'bt_medic' },
    comms: { name: 'Radio protocol & codes', where: 'Dispatch classroom', skill: 'comms', go: 'bt_comms' },
    run: { name: 'Conditioning — canal perimeter run', where: 'District 3', skill: 'fitness', go: 'bt_run' },
    jury: { name: 'Civil compliance & interrogation (JURY instructor)', where: 'Detention level 4', skill: 'authority', go: 'bt_jury' },
  };
  G.COURSES = COURSES;

  G.addScenes({
    bt_intro: {
      title: 'Training Wing — Parade Floor, 05:00',
      enter: (s) => {
        s.phase = 'training';
        G.unlock(s, 'hierarchy');
      },
      text: [
        'They wake you with a siren at 04:45 and a bucket of cold water for whoever is slowest. By 05:00 the forty recruits of Intake 9-114 stand on a painted grid in the parade hall, breath steaming, implant sites throbbing.',
        'The drill instructor walks the lines with his hands behind his back. His mask is scarred along the left lens, his UNION-blue armband crossed with an officer\'s thick silver bar. His designation is stencilled on his shoulder plate: **CCA.C9.D1-UNION-OfC-30117**. Before the week is out every recruit will call him *Thirty*, and never to his face.',
        '@portrait assets/img/portraits/thirty.jpg|CCA.C9.D1-UNION-OfC-30117 — "Thirty"',
        '@say Thirty|You are not citizens any more. You are not yet Protection Units. You are *recruits*, which is the lowest form of life inside these walls. A citizen at least knows what he is.',
        '@say Thirty|Four weeks. Each week you are assigned to one block of instruction. The blocks you choose will decide what kind of unit you become, and what kind of unit you become decides whether you come home at night. At the end there is an evaluation. It will be live. It will be in your own district. Some of you will fail it.',
        '@say Thirty|Above you is the ladder.',
        'He points up. Painted on the wall above the parade floor, ten metres high, is the CCA hierarchy, Recruit at the bottom and the Earth Administrator at the top, a long way up.',
        '@say Thirty|Every man and woman on that ladder started on this floor. Most died on the second rung. Dismissed to selection.',
      ],
      choices: [{ t: 'Go to the assignment board.', go: 'bt_hub' }],
    },

    bt_hub: {
      checkpoint: true,
      title: (s) => `Assignment board — Week ${s.bt.count + 1} of 4`,
      enter: (s) => {
        s.time = 'Morning';
      },
      text: (s) => [
        s.bt.count === 0
          ? 'A steel board by the mess hall lists six blocks of instruction. Recruits jostle in front of it, arguing in low voices about which instructors break bones and which only break spirits.'
          : `Week ${s.bt.count + 1}. ${['', 'Your body has started to hurt in a way that feels like it might eventually turn into strength.', 'Half the intake has learned to sleep standing up. Three recruits are gone — nobody says where.', 'One week left before the evaluation. The barracks has gone quiet in the evenings.'][s.bt.count]}`,
        '@sys Choose your block of instruction. Each block trains one skill and reveals a part of the CCA. You can only take four of the six.',
      ],
      choices: (s) =>
        Object.keys(COURSES)
          .filter((k) => !s.bt.done.includes(k))
          .map((k) => ({
            t: `**${COURSES[k].name}** — ${COURSES[k].where}`,
            tag: G.SKILLS[COURSES[k].skill].toUpperCase(),
            tagCls: 'duty',
            go: COURSES[k].go,
          })),
    },

    bt_after: {
      safe: true,
      enter: (s) => {
        if (s.bt.count === 2 && !s.flags.bt_night) return 'bt_night';
        if (s.bt.count >= 4) return 'bt_final';
        return 'bt_hub';
      },
      text: [],
    },

    /* ------------------------------------------------------------ RANGE */

    bt_range: {
      title: 'Firing range — sub-level 2',
      text: [
        'The range smells of cordite and wet concrete. The weapons on the rack are Union-issue 9mm sidearms — black, ugly, and lighter than you expected. The targets at the far end are silhouettes of citizens. Someone has drawn a lambda on one of them in chalk.',
        '@say Thirty|This is the only friend you will ever have in uniform. It does not lie to you. It does not inform on you. It does not ask why. Twelve rounds. Centre mass. Qualification is eight.',
        'You load the magazine with numb fingers, take your stance and look down the sights at a painted man with no face.',
      ],
      choices: [
        { t: 'Steady your breathing. Squeeze, don\'t pull.', check: { skill: 'firearms', diff: 0, pass: 'bt_range_ok', fail: 'bt_range_bad' } },
        { t: 'Ask Thirty to show you the stance again before you fire.', fx: { xp: { firearms: 1 } }, go: 'bt_range_ask' },
      ],
    },

    bt_range_ask: {
      text: [
        'Thirty stops behind you. For a moment you think he is going to hit you. Instead he kicks your back foot ten centimetres to the left and pushes your elbow down with two fingers.',
        '@say Thirty|Asking is weakness. Shooting badly is death. Weakness I can train out of you. Shoot.',
      ],
      choices: [{ t: 'Fire.', check: { skill: 'firearms', diff: -15, pass: 'bt_range_ok', fail: 'bt_range_bad' } }],
    },

    bt_range_ok: {
      text: [
        'The pistol bucks, and bucks, and bucks. When the slide locks back the target slides toward you on its wire. Ten holes, tight and ugly around the painted chest.',
        '@say Thirty|Ten. Acceptable.',
        'From Thirty, *acceptable* is a medal. The recruits on either side glance at your target.',
      ],
      choices: [{ t: 'Holster and step back from the line.', fx: (s) => ((s.mem.range = 2), { lp: 1 }), go: 'bt_range_2' }],
    },

    bt_range_bad: {
      text: [
        'The first round goes into the ceiling. The second takes the target in the knee. By the time the slide locks back you have six hits and a ringing in your ears that sounds like failure.',
        '@say Thirty|Six. A rebel would have killed you twice and gone home to dinner. Again. And again after that. You will stay on this line until you qualify.',
        'You stay on the line until your hands bleed through the gloves. On the fourth magazine you qualify. Barely.',
      ],
      choices: [{ t: 'Holster and step back from the line.', fx: (s) => ((s.mem.range = 0), { xp: { firearms: 2 }, hp: -5 }), go: 'bt_range_2' }],
    },

    bt_range_2: {
      text: [
        'Two lanes down, Tomas fires — and his pistol jams with a flat click. He swears, shakes it, turns half around to Thirty with the muzzle swinging across the line toward the other recruits.',
        'Somebody screams. Everybody drops.',
        'Thirty is three lanes away. You are closest.',
      ],
      choices: [
        {
          t: 'Step in, push the muzzle down range and clear the jam yourself — tap, rack, check.',
          check: {
            skill: 'firearms',
            diff: 5,
            pass: 'bt_range_save',
            fail: 'bt_range_savefail',
          },
        },
        { t: 'Shout "*Muzzle!*" and hit the floor with everyone else.', go: 'bt_range_floor' },
        {
          t: 'Tackle him. Hard. Weapons discipline is learned through pain.',
          check: { skill: 'melee', diff: 0, pass: 'bt_range_tackle', fail: 'bt_range_savefail' },
        },
      ],
    },

    bt_range_save: {
      text: [
        'You close the distance in two steps, grab his wrist and turn the muzzle back to the targets. Tap the magazine. Rack the slide. A bent casing tumbles out and clinks on the concrete.',
        '@say Tomas|I — sorry, I didn\'t —',
        'Thirty arrives and looks at the two of you for a long moment.',
        '@say Thirty|Vey. You will clean every weapon on this rack tonight. Recruit — you. Good hands. Wasted on someone who talks too much in the barracks.',
        'Tomas does not say anything for the rest of the day. That night, when he climbs into the bunk above yours, he reaches down and squeezes your shoulder once.',
      ],
      choices: [{ t: 'Week complete.', fx: done('range', 3, { skill: { firearms: 1 }, rel: { tomas: 20 }, merit: 1 }), go: 'bt_after' }],
    },

    bt_range_savefail: {
      text: [
        'You lunge for the weapon and your hands collide with his. The gun goes off — the round cracks into the floor between your boots and a chip of concrete opens your shin.',
        'Thirty is there a second later. He takes the pistol from Tomas, clears it, and strikes him across the mask with the grip. Then he turns to you.',
        '@say Thirty|Brave. Stupid. Brave and stupid is how units become 11-99. Both of you, infirmary, then the rack.',
      ],
      choices: [{ t: 'Week complete.', fx: done('range', 1, { skill: { firearms: 1 }, rel: { tomas: 10 }, hp: -10 }), go: 'bt_after' }],
    },

    bt_range_floor: {
      text: [
        'You hit the floor and shout the warning. It is the procedure. Thirty crosses the range in four strides and puts Tomas on the ground with a single blow to the back of the knee. The pistol skids away.',
        '@say Thirty|*That* recruit followed procedure. *This* recruit nearly killed four Protection Units before they ever wore a mask. Which do you think the Union prefers?',
        'Tomas spends three nights in the punishment cell. When he comes back he is thinner and quieter, and he doesn\'t meet your eyes for a while.',
      ],
      choices: [{ t: 'Week complete.', fx: done('range', 2, { skill: { firearms: 1 }, lp: 2, rel: { tomas: -5 } }), go: 'bt_after' }],
    },

    bt_range_tackle: {
      text: [
        'You hit him at the hip with your full weight. You both go down; the pistol goes skittering harmlessly toward the targets. Tomas lies there winded and wide-eyed.',
        '@say Thirty|Correct. Pain is a better teacher than I am. Vey, thank your instructor.',
        'Tomas looks at you. Then, slowly, he says it: "Thank you." There is something new in his face when he looks at you now. It might be respect. It might be fear.',
      ],
      choices: [{ t: 'Week complete.', fx: done('range', 3, { skill: { firearms: 1 }, lp: 3, cons: -2, rel: { tomas: -2 }, xp: { melee: 1 } }), go: 'bt_after' }],
    },

    /* ------------------------------------------------------------ MELEE */

    bt_melee: {
      title: 'Gymnasium — restraint drills',
      text: [
        'The gym was a basketball court once. The hoops are still there, netless, above padded mats stained brown in places nobody cleans.',
        'Stunsticks hum in a rack along the wall. Set low, they sting. Set high, they put a grown man on the floor twitching. Thirty sets them to *medium*.',
        '@say Thirty|The stick is not for pain. The stick is for *conversation*. When a citizen will not listen, the stick explains. Pairs. Restrain your partner. Partner, resist. Whoever ends up on the mat cleans it.',
        'You are paired with Ilse. She takes her stick from the rack, thumbs the switch, and settles into a stance that is not one Thirty has taught anyone.',
      ],
      choices: [
        { t: 'Go in fast and try to overpower her.', check: { skill: 'melee', diff: 5, pass: 'bt_melee_win', fail: 'bt_melee_lose' } },
        { t: 'Hold back. Watch her feet. Let her come to you.', check: { skill: 'perception', diff: 0, pass: 'bt_melee_read', fail: 'bt_melee_lose' } },
      ],
    },

    bt_melee_win: {
      text: [
        'You drive forward, take the sting of her stick across your forearm, and get your shoulder into her chest. You both go down — you on top. Her stick is pinned, yours is at her throat, humming.',
        'She goes still. Up close she smells of machine oil.',
        '@say Ilse|*Good.*',
        'She breathes it more than says it, and taps the mat.',
      ],
      choices: [{ t: 'Help her up.', fx: (s) => ((s.mem.melee = 2), { rel: { ilse: 8 } }), go: 'bt_melee_2' }],
    },

    bt_melee_read: {
      text: [
        'You wait. She feints left with her shoulders, but her weight never leaves her right foot. When she comes in from the right you are already turning; her stick hisses past your ear, and yours finds the back of her knee.',
        'She goes down, rolls, comes up — and finds your stick resting gently on her collarbone.',
        '@say Ilse|You were watching my feet.',
        '@say Ilse|Most people watch the stick. The stick is a liar.',
      ],
      choices: [{ t: 'Offer her a hand.', fx: (s) => ((s.mem.melee = 2), { rel: { ilse: 12 }, xp: { melee: 1 } }), go: 'bt_melee_2' }],
    },

    bt_melee_lose: {
      text: [
        'She moves like water down a drain. One moment she is in front of you; the next, her stick is crackling against the side of your neck and your legs are suddenly not your legs.',
        'You find yourself looking up at a netless basketball hoop.',
        '@say Ilse|Watch the feet. Not the stick.',
        'She says it quietly, so only you can hear. Then she leaves you to clean the mat.',
      ],
      choices: [{ t: 'Get up. Eventually.', fx: (s) => ((s.mem.melee = 0), { hp: -10, xp: { melee: 1, perception: 1 } }), go: 'bt_melee_2' }],
    },

    bt_melee_2: {
      text: [
        'At the end of the session Thirty calls the intake together around a single mat. On it, Tomas lies flat on his back after losing to a recruit twice his weight. He has tapped. He is holding up a hand in surrender.',
        '@say Thirty|The citizen has surrendered. Good. Now he will remember why. *You* —',
        'He points at you, and holds out his own stunstick. The dial is turned all the way up.',
        '@say Thirty|— finish the lesson.',
        'Tomas stares at you from the mat. Forty recruits wait.',
      ],
      choices: [
        { t: 'Take the stick. Strike him, once, across the thigh. Make it count.', tag: 'OBEY', tagCls: 'loyal', go: 'bt_melee_strike' },
        {
          t: 'Take the stick and land the strike *beside* him, close enough to scorch the mat — and stage it.',
          check: { skill: 'deception', diff: 10, pass: 'bt_melee_fake_ok', fail: 'bt_melee_fake_bad' },
        },
        {
          t: '"Regulation 4-C, sir. Force ends at compliance. He\'s compliant." ',
          check: { skill: 'authority', diff: 15, pass: 'bt_melee_reg_ok', fail: 'bt_melee_reg_bad' },
        },
      ],
    },

    bt_melee_strike: {
      text: [
        'The stick sings. Tomas makes a sound you have never heard a person make, and curls around his leg on the mat.',
        '@say Thirty|*That* is a lesson. Every one of you will remember it, and so will he. That is the purpose of force.',
        'In the barracks that night, Tomas limps to his bunk without a word. He doesn\'t blame you. He says so, later, in the dark. *"He would\'ve done it worse."* It doesn\'t help as much as it should.',
      ],
      choices: [{ t: 'Week complete.', fx: done('melee', 3, { skill: { melee: 1 }, lp: 4, cons: -8, rel: { tomas: -10 }, merit: 1 }), go: 'bt_after' }],
    },

    bt_melee_fake_ok: {
      text: [
        'You bring the stick down hard. It cracks against the mat a hand\'s breadth from Tomas\'s hip, throwing a shower of blue sparks — and Tomas, God bless him, *screams*, and thrashes, and clutches his leg like it\'s been broken.',
        'Thirty watches a long moment, lenses unreadable.',
        '@say Thirty|Adequate. Dismissed.',
        'Tomas catches your eye as he limps — theatrically — out of the gym. The corner of his mouth twitches.',
      ],
      choices: [{ t: 'Week complete.', fx: done('melee', 2, { skill: { melee: 1 }, lp: 1, cons: 3, rel: { tomas: 20 }, xp: { deception: 1 } }), go: 'bt_after' }],
    },

    bt_melee_fake_bad: {
      text: [
        'You bring the stick down beside him. Sparks fly from the mat. Tomas yells, but a beat too late.',
        'Thirty takes the stick back from you. Without a word he turns and strikes Tomas across both legs, then turns the dial back down and strikes *you*, once, across the ribs.',
        '@say Thirty|I do not need actors. Next time it will be you on the mat, and *he* will hold the stick.',
      ],
      choices: [{ t: 'Week complete.', fx: done('melee', 0, { skill: { melee: 1 }, hp: -15, lp: -2, susp: 4, rel: { tomas: 10 } }), go: 'bt_after' }],
    },

    bt_melee_reg_ok: {
      text: [
        'The gym goes very quiet. Thirty\'s mask turns toward you.',
        '@say Thirty|You read the manual.',
        '@say You|Yes, sir. Regulation 4-C. Force is a tool for compliance. Force beyond compliance is waste. Waste is malcompliance.',
        'A long, filtered breath. Then Thirty takes back the stick and turns the dial down.',
        '@say Thirty|Correct. Someone in this intake can read. That someone will now run twenty laps for showing off. Vey — get off my mat.',
      ],
      choices: [{ t: 'Week complete.', fx: done('melee', 3, { skill: { melee: 1 }, rel: { tomas: 20 }, cons: 3, xp: { authority: 1, fitness: 1 }, merit: 1 }), go: 'bt_after' }],
    },

    bt_melee_reg_bad: {
      text: [
        '@say You|Regulation four-something, sir. Force ends at — it ends when they comply.',
        'Thirty takes back the stick.',
        '@say Thirty|*Four-something.* The regulation you are trying to quote is 4-C, and it is for Protection Units, which you are not.',
        'He hands the stick to the recruit beside you, and the recruit does it instead. Tomas screams. Then Thirty points at the floor, and you do push-ups until you vomit.',
      ],
      choices: [{ t: 'Week complete.', fx: done('melee', 1, { skill: { melee: 1 }, hp: -10, lp: -2, cons: 3, rel: { tomas: 8 } }), go: 'bt_after' }],
    },

    /* ------------------------------------------------------------ MEDIC */

    bt_medic: {
      title: 'Infirmary annex — HELIX instruction',
      enter: (s) => G.unlock(s, 'helix'),
      text: [
        'The infirmary annex is the cleanest place you have ever been. White tile, steel trays, a hum of refrigeration. The HELIX instructor wears the white-banded sleeve and a mask with a green lens filter. Her designation reads **CCA.C9.D1-HELIX-02-77301**. Her voice, when she speaks, is unexpectedly tired.',
        '@portrait assets/img/portraits/helix-77301.jpg|CCA.C9.D1-HELIX-02-77301',
        '@say HELIX 02|Protection Units first. VIPs second. Citizens if there is time, supplies, and an order. Write that on the inside of your skull.',
        'She teaches you biogel — a blue paste that seals wounds and burns like ice. Coagulant injectors. How to pack a gunshot wound with your fist. How to tell a dying man from a man who only thinks he is dying.',
        'On the third day, the doors bang open. Two units drag in a citizen from the Works, a mill hand of about forty, his left hand crushed in a loom. He is grey, sweating, and trying very hard not to scream.',
        '@say HELIX 02|Ah. Practice material. Recruit — you have five minutes. Show me what you have learned. If you lose him, it does not matter. If you waste gel, it does.',
      ],
      choices: [
        { t: 'Treat him properly — clean, set, seal. Waste nothing.', check: { skill: 'medical', diff: 0, pass: 'bt_medic_ok', fail: 'bt_medic_bad' } },
        { t: 'Work fast and rough. It\'s practice. Don\'t waste gel on a citizen.', go: 'bt_medic_rough' },
        {
          t: 'Treat him — and while the instructor writes notes, slip a spare kit into your waistband. Tomas\'s mother needs it more.',
          tag: 'THEFT',
          tagCls: 'risk',
          check: { skill: 'deception', diff: 5, pass: 'bt_medic_steal_ok', fail: 'bt_medic_steal_bad' },
        },
      ],
    },

    bt_medic_ok: {
      text: [
        'You talk to him while you work. His name is Pavel. He has two daughters. You get the bones roughly aligned, seal the worst of the tears with a thumb of gel, splint the hand and inject coagulant into the meat of his forearm.',
        'He doesn\'t lose the hand. He might even work again.',
        '@say HELIX 02|Efficient. You talked to him. Why?',
        '@say You|Talking keeps them still, ma\'am.',
        '@say HELIX 02|Correct. It also makes it harder when you have to let one go. Remember that, too.',
        'She marks something on her slate. Later, you hear, she put in a request to see your file.',
      ],
      choices: [{ t: 'Week complete.', fx: done('medic', 3, { skill: { medical: 1 }, cons: 3, merit: 1, flag: { helix_noticed: true } }), go: 'bt_after' }],
    },

    bt_medic_bad: {
      text: [
        'Your hands shake. The gel goes on lumpy, the splint slips, and when you inject the coagulant you miss the vein the first time. Pavel passes out — which, the instructor notes drily, is at least quieter.',
        '@say HELIX 02|He will live. He will not use that hand again. That is not your fault. It is also not *not* your fault.',
      ],
      choices: [{ t: 'Week complete.', fx: done('medic', 1, { skill: { medical: 1 }, xp: { medical: 1 } }), go: 'bt_after' }],
    },

    bt_medic_rough: {
      text: [
        'You work fast. You set the hand without a word, splint it tight, use a third of the gel the manual says. Pavel bites through his lip. He will keep the hand, probably. It will be a claw.',
        '@say HELIX 02|Economical. HELIX can use economical. Remember that he is grateful anyway. They always are. It is the most frightening thing about them.',
      ],
      choices: [{ t: 'Week complete.', fx: done('medic', 2, { skill: { medical: 1 }, lp: 2, cons: -4 }), go: 'bt_after' }],
    },

    bt_medic_steal_ok: {
      text: [
        'You do good work on Pavel\'s hand — good enough that the instructor turns away to log it on her slate. In the space of that turn, a sealed field kit leaves the tray and slides into your waistband under your training shirt.',
        'Nobody sees. Or if the HELIX instructor sees, she decides not to.',
        'That night you press the kit into Tomas\'s hands in the dark. He doesn\'t say anything for a long time. Then: *"I owe you. I owe you forever, you hear me?"*',
      ],
      choices: [{ t: 'Week complete.', fx: done('medic', 2, { skill: { medical: 1 }, rel: { tomas: 30 }, cons: 5, susp: 3, flag: { stole_kit: true, tomas_debt: true } }), go: 'bt_after' }],
    },

    bt_medic_steal_bad: {
      text: [
        'You slip the kit into your waistband. When you straighten up the HELIX instructor is standing directly behind you.',
        '@say HELIX 02|Serial number 9-4471. Every kit has one. Every kit is counted at the end of every shift.',
        'She holds out her hand. You give it to her. She looks at it, then at you, for a very long moment.',
        '@say HELIX 02|I will log it as a counting error. Once. The next time, I will log it as theft, and JURY will collect you. Do you understand what I am doing for you?',
      ],
      choices: [{ t: '"Yes, ma\'am."', fx: done('medic', 1, { skill: { medical: 1 }, susp: 6, cons: 2 }), go: 'bt_after' }],
    },

    /* ------------------------------------------------------------ COMMS */

    bt_comms: {
      title: 'Dispatch classroom',
      enter: (s) => G.unlock(s, 'codes'),
      text: [
        'The classroom is a lecture theatre with a radio set bolted to every desk. On the wall: a code sheet in black letters a hand high. A UNION 02 with a hoarse voice teaches it, tapping each line with a pointer.',
        '@say Instructor|A unit who cannot speak to Dispatch is a unit nobody is coming for. You will learn the codes until you dream in them. Then you will be tested — *live*, on a real channel, with real units listening.',
        '@sys The radio codes have been added to your Codex. You may read them before the test.',
        'On Friday you sit at a desk with a headset on. A light turns green. A voice crackles in your ear — not the instructor. A real dispatcher, somewhere in the Nexus.',
        '@radio Recruit unit on channel nine. Dispatch requests your status.',
      ],
      choices: [
        { t: '"Dispatch, recruit unit, 10-8."', fx: (s) => ((s.mem.comms = 1), null), go: 'bt_comms_2' },
        { t: '"Dispatch, recruit unit, 10-4."', fx: (s) => ((s.mem.comms = 0), null), go: 'bt_comms_2' },
        { t: '"Uh — present. Recruit present."', fx: (s) => ((s.mem.comms = -1), null), go: 'bt_comms_2' },
      ],
    },

    bt_comms_2: {
      text: (s) => [
        s.mem.comms === 1 ? '@radio 10-4, recruit. Good copy.' : s.mem.comms === 0 ? '@radio Recruit, 10-4 is an acknowledgment. I asked for status. Try to keep up.' : '@radio ...Somebody teach this one to talk.',
        '@radio All units, all units, 10-33. Unit 11-99 at the Canal Gate 3 checkpoint. Repeat, 10-33.',
        'The channel erupts and then, instantly, goes silent. Your instructor is watching your hands.',
      ],
      choices: [
        { t: 'Key off and keep the channel clear.', fx: (s) => ((s.mem.comms += 1), null), go: 'bt_comms_3' },
        { t: 'Ask Dispatch to repeat the location.', fx: (s) => ((s.mem.comms -= 1), null), go: 'bt_comms_3' },
        { t: '"Recruit unit copies, en route!"', fx: (s) => ((s.mem.comms -= 1), null), go: 'bt_comms_3' },
      ],
    },

    bt_comms_3: {
      text: [
        'The instructor takes the channel back with a flick of a switch. You hear the real emergency unfold in clipped codes — a unit down at the canal, a rebel with a crowbar, a pursuit into the locks. Then it is over, and you never find out if the unit lived.',
        '@say Instructor|Last question. You have a citizen in restraints. You need a van to take him to the Nexus. Say it.',
      ],
      choices: [
        { t: '"Dispatch, 10-15, requesting 10-91 at my 10-20."', fx: (s) => ((s.mem.comms += 2), null), go: 'bt_comms_end' },
        { t: '"Dispatch, 10-78, prisoner secured."', go: 'bt_comms_end' },
        { t: 'You can\'t remember. Try to wing it with confident jargon.', check: { skill: 'comms', diff: 10, pass: 'bt_comms_wing', fail: 'bt_comms_end' } },
      ],
    },

    bt_comms_wing: {
      enter: (s) => {
        s.mem.comms += 1;
      },
      text: ['You rattle off something that sounds right — *custody, transport, my location* — in the clipped rhythm of a real unit. The instructor sighs, but nods. Close enough.'],
      choices: [{ t: 'Continue.', go: 'bt_comms_end' }],
    },

    bt_comms_end: {
      text: (s) => {
        const sc = s.mem.comms;
        return [
          `@doc RADIO EVALUATION — SCORE ${Math.max(0, sc)}/4`,
          sc >= 3
            ? 'The instructor taps your desk with his pointer. "Clean. Dispatch remembers clean voices. They send the van faster." You will learn later that this is literally true.'
            : sc >= 1
            ? '"Adequate," the instructor says. "You will learn the rest on the street, where mistakes are louder."'
            : '"If you ever have to call for help," the instructor says, "pray it is a slow day."',
          'In the corridor afterwards, a UNION unit stops you. *"You were on nine when the 10-33 went out? That was my partner at Gate 3. He made it."* He walks off before you can answer.',
        ];
      },
      choices: (s) => [{ t: 'Week complete.', fx: done('comms', Math.max(0, s.mem.comms), { skill: { comms: 1 }, xp: { comms: Math.max(0, s.mem.comms) } }), go: 'bt_after' }],
    },

    /* -------------------------------------------------------------- RUN */

    bt_run: {
      title: 'Canal perimeter — District 3',
      text: [
        'They run you in full kit: helmet, vest, a twenty-kilo pack of sand. Out the Nexus gate, across the bridge, along the cobbled towpaths of the Canal Quarter where the water is black and smells of rust and something sweeter underneath.',
        'Citizens step aside without looking up. A child watches you from a broken window. Behind you, Thirty rides in the back of an APC with the hatch open, shouting the pace.',
        '@say Thirty|Last ten recruits in run it again tonight. Last three run it again tomorrow. The last one, I find a use for.',
        'Kilometre four. Your lungs are on fire. The towpath narrows between a lock gate and a crumbling pump house.',
      ],
      choices: [
        { t: 'Push through the pain. Hold the front of the pack.', check: { skill: 'fitness', diff: 5, pass: 'bt_run_front', fail: 'bt_run_back' } },
        { t: 'Pace yourself. Middle of the pack is safe.', go: 'bt_run_mid' },
      ],
    },

    bt_run_front: {
      text: [
        'You find a rhythm under the pain — breath, step, breath — and pull ahead of the pack. For a stretch it is just you and the towpath and the black water.',
        'That is why you are alone when you see it.',
        'A drainage grate in the wall of the pump house, half-hidden by weeds. Someone has chalked a small sign beside it: the Greek letter lambda, λ, the size of a thumbnail. And behind the grate, wrapped in oilcloth, the corner of a parcel.',
      ],
      choices: [{ t: 'Slow down. Look closer.', fx: (s) => ((s.mem.run = 2), { xp: { fitness: 1 } }), go: 'bt_run_cache' }],
    },

    bt_run_mid: {
      text: [
        'You settle into the middle of the column, where the pace is bearable and Thirty\'s eyes slide over you. It is the smart way to run. Nobody remembers the middle.',
        'Ilse runs a few places ahead of you. As the column passes a pump house she glances, very briefly, at the wall beside the path — at a grate half-hidden by weeds and a small chalk mark beside it. Then she looks straight ahead again.',
        'You glance too. A lambda. And behind the grate, the corner of something wrapped in oilcloth.',
      ],
      choices: [{ t: 'Keep running. But remember.', fx: (s) => ((s.mem.run = 1), null), go: 'bt_run_cache' }],
    },

    bt_run_back: {
      text: [
        'Your legs go at kilometre five. You stumble, fall to your knees on the cobbles, and the column flows around you. Thirty\'s APC grinds to a halt beside you.',
        '@say Thirty|Up.',
        'You get up. You finish the run. You run it again that night in the dark, alone, along the black water, and that is how you come to be standing by the pump house at 23:00 when you notice the chalk mark beside the drainage grate. A lambda. And the corner of a parcel in oilcloth.',
      ],
      choices: [{ t: 'Look closer.', fx: (s) => ((s.mem.run = 0), { hp: -10, xp: { fitness: 2 } }), go: 'bt_run_cache' }],
    },

    bt_run_cache: {
      enter: (s) => G.unlock(s, 'resistance'),
      text: [
        'A rebel drop. Messages, maybe. Weapons, maybe. Everything you were told about in the barracks — the guerrillas in the canals, the cut throats in the rail yards — reduced to a parcel in a drain.',
        'You could report it. A find like this, during training, would put your name on Thirty\'s slate in a way that matters. Somebody would come and wait by this grate. Somebody would be caught.',
      ],
      choices: [
        { t: 'Report the cache to Thirty.', tag: 'REPORT', tagCls: 'loyal', go: 'bt_run_report' },
        { t: 'Leave it. You saw nothing.', go: 'bt_run_ignore' },
        { t: 'Reach through the grate and take something from the parcel.', tag: 'CONTRABAND', tagCls: 'risk', go: 'bt_run_take' },
      ],
    },

    bt_run_report: {
      text: (s) => [
        'You report it. Thirty listens without moving, then speaks into his radio in a low stream of codes.',
        '@say Thirty|Good eyes, recruit. The Union notices good eyes.',
        'Two days later there is a notice on the board: *anticitizen elements apprehended, District 3, following a recruit\'s report.* Your designation is on it.',
        s.rel.ilse !== undefined ? 'Ilse reads the notice for a long time. When she turns away her face is completely, carefully empty.' : 'Some recruits clap you on the back. Some don\'t.',
      ],
      choices: [{ t: 'Week complete.', fx: done('run', 4, { skill: { fitness: 1 }, merit: 3, lp: 5, cons: -6, res: -15, rel: { ilse: -15 }, flag: { reported_cache: true } }), go: 'bt_after' }],
    },

    bt_run_ignore: {
      text: (s) => [
        'You run on. The drain, the lambda, the parcel slide out of sight behind you.',
        s.mem.run === 1 ? 'Ilse doesn\'t look back. But at the next water stop she sets her canteen down beside yours, and for a moment her shoulder touches your shoulder. That\'s all.' : 'Nobody saw you look. You\'re almost sure.',
      ],
      choices: (s) => [{ t: 'Week complete.', fx: done('run', s.mem.run, { skill: { fitness: 1 }, res: 5, rel: s.mem.run === 1 ? { ilse: 10 } : {} }), go: 'bt_after' }],
    },

    bt_run_take: {
      text: [
        'You crouch as if retying your boot, reach through the bars, and tear the oilcloth. Leaflets — a stack of them, hand-printed on mill paper. You take one and fold it small inside your glove.',
        'Back in the barracks you read it in the toilet stall by the light of the corridor:',
        '@doc THEY TOLD YOU THE WAR WAS LOST IN SEVEN HOURS.\nIT IS NOT OVER UNTIL YOU STOP REMEMBERING.\nTHE RIVER REMEMBERS. λ',
        'You should flush it. You don\'t.',
      ],
      choices: [{ t: 'Week complete.', fx: done('run', 1, { skill: { fitness: 1 }, give: 'leaflet', res: 8, susp: 3, cons: 2 }), go: 'bt_after' }],
    },

    /* ------------------------------------------------------------- JURY */

    bt_jury: {
      title: 'Detention level 4 — JURY instruction',
      enter: (s) => G.unlock(s, 'jury'),
      text: [
        'Level 4 is below the river line. The walls sweat. The corridors are lit by single caged bulbs, and somewhere a ventilation fan ticks like a clock.',
        'The JURY instructor waits in an observation room with a one-way window. His armband is crimson. His designation reads **CCA.C9.D5-JURY-DvL-02842**. A Division Leader — four rungs above anyone who has ever spoken to you. The recruits call him *the Magistrate*.',
        '@portrait assets/img/portraits/magistrate.jpg|CCA.C9.D5-JURY-DvL-02842 — "the Magistrate"',
        '@say Magistrate|Everyone talks. Everyone. The only questions are how long, and whether what they say is true. JURY exists to shorten the first and guarantee the second.',
        'On the other side of the glass, a boy of perhaps sixteen sits chained to a steel table. His fingers are stained with blue paint. On the table in front of him is a photograph of a wall in D5 with a lambda painted across it two metres high.',
        '@say Magistrate|He painted it. He did not choose the place. Someone told him where, and gave him the paint. I want a name. You will go in and ask him for it.',
      ],
      choices: [
        { t: 'Go in hard. Slam the table. Make him more afraid of you than of anyone outside.', check: { skill: 'authority', diff: 5, pass: 'bt_jury_hard_ok', fail: 'bt_jury_hard_bad' } },
        { t: 'Go in quiet. Sit down. Lie to him — tell him his friend already gave *him* up.', check: { skill: 'deception', diff: 5, pass: 'bt_jury_trick_ok', fail: 'bt_jury_trick_bad' } },
        { t: 'Read him first. Look for what he\'s actually afraid of.', check: { skill: 'perception', diff: 0, pass: 'bt_jury_read', fail: 'bt_jury_trick_bad' } },
        { t: '"With respect, sir — he\'s a child with a paint can."', tag: 'RISK', tagCls: 'risk', go: 'bt_jury_refuse' },
      ],
    },

    bt_jury_hard_ok: {
      text: [
        'You walk in and bring both palms down on the table so hard the photograph jumps. The boy flinches back until his chains go tight.',
        '@say You|You know what happens to painters? We don\'t relocate them. We *keep* them. Down here. Name.',
        'It takes four minutes. He cries for two of them. Then he says it: *"The Tinker. On Bazaar Row. He fixes radios. He gave me the paint, I swear, I swear, that\'s all I know."*',
        'When you come out, the Magistrate is standing very close to the glass.',
        '@say Magistrate|Fear is a blunt instrument. You swung it accurately. JURY will remember your designation.',
      ],
      choices: [{ t: 'Week complete.', fx: done('jury', 4, { skill: { authority: 1 }, merit: 2, lp: 4, cons: -6, flag: { know_tinker: true, jury_noticed: true }, rel: { tinker: -10 } }), go: 'bt_after' }],
    },

    bt_jury_hard_bad: {
      text: [
        'You slam the table. The boy flinches — and then, unexpectedly, he spits at you. It lands on your cheek.',
        '@say Boy|You\'re not even a real one. You don\'t even have a mask.',
        'He laughs, a high, terrified sound, and he doesn\'t stop laughing until the Magistrate himself comes in and does something to the boy\'s hand that you will hear in your sleep for a week. Then the boy gives a name: *the Tinker, Bazaar Row.*',
        '@say Magistrate|Observe. That is the difference between a recruit and JURY.',
      ],
      choices: [{ t: 'Week complete.', fx: done('jury', 1, { skill: { authority: 1 }, cons: -3, flag: { know_tinker: true } }), go: 'bt_after' }],
    },

    bt_jury_trick_ok: {
      text: [
        'You sit down across from him. You keep your voice tired, bored, a clerk at the end of a long shift.',
        '@say You|Your friend\'s upstairs. He already told us you painted it on your own. Said it was your idea. He\'s going home tonight. You\'re not.',
        'You watch the lie land. His face crumples — not into fear, but into outrage.',
        '@say Boy|*My* idea? I don\'t even — it was the Tinker\'s paint! The Tinker on Bazaar Row, he said where, he said when, I just — I just painted it!',
        'Behind the glass, the Magistrate makes a small sound of approval.',
        '@say Magistrate|Elegant. You did not touch him and he will thank you for it. That is a rare gift. Do not waste it on UNION.',
      ],
      choices: [{ t: 'Week complete.', fx: done('jury', 4, { skill: { authority: 1 }, xp: { deception: 1 }, merit: 2, lp: 2, cons: -3, flag: { know_tinker: true, jury_noticed: true } }), go: 'bt_after' }],
    },

    bt_jury_trick_bad: {
      text: [
        'You sit and talk. You try the lie about his friend. The boy just stares at you.',
        '@say Boy|I don\'t have any friends.',
        'He says nothing else for twenty minutes. Eventually the Magistrate sends you out and goes in himself. You hear the boy scream once through the steel door. When the Magistrate comes out, he is wiping his gloves.',
        '@say Magistrate|*The Tinker.* Bazaar Row. Kindness is a key, recruit, but you must know which lock it fits.',
      ],
      choices: [{ t: 'Week complete.', fx: done('jury', 1, { skill: { authority: 1 }, flag: { know_tinker: true } }), go: 'bt_after' }],
    },

    bt_jury_read: {
      text: [
        'Through the glass you watch the boy. He isn\'t looking at the photograph of the lambda. He is looking at his own paint-stained fingers — and every few seconds, at the door. Not afraid of pain. Afraid of someone *coming*.',
        'You go in and sit down. You speak softly.',
        '@say You|Nobody knows you\'re here yet. The people who gave you the paint — they don\'t know. If you give me a name now, I can say you were never brought in. If you wait, they\'ll hear. And they\'ll think you talked anyway.',
        'He thinks about it for a long time. Then: *"The Tinker. On Bazaar Row. Please. Please don\'t tell him it was me."*',
        '@say Magistrate|You found the lever. Most recruits only find the hammer. Interesting.',
      ],
      choices: [
        { t: 'Week complete.', fx: done('jury', 4, { skill: { authority: 1 }, xp: { perception: 1 }, merit: 2, lp: 2, flag: { know_tinker: true, jury_noticed: true } }), go: 'bt_after' },
      ],
    },

    bt_jury_refuse: {
      text: [
        'The Magistrate turns his head toward you very slowly.',
        '@say Magistrate|A child with a paint can. Yes. And when he is grown, he will be a man with a rifle, and he will aim it at you, and he will think of this room and of the recruit who said *with respect, sir*. JURY does not interrogate children. JURY interrogates the future.',
        'He goes in himself. You watch through the glass. It takes nine minutes. You get the name anyway — *the Tinker, Bazaar Row* — and now you know what nine minutes looks like.',
        '@say Magistrate|Your file will mention this conversation. Not unfavourably. Not favourably either. Dismissed.',
      ],
      choices: [{ t: 'Week complete.', fx: done('jury', 0, { skill: { authority: 1 }, cons: 6, susp: 5, lp: -3, res: 5, flag: { know_tinker: true } }), go: 'bt_after' }],
    },

    /* ------------------------------------------------------ BARRACKS NIGHT */

    bt_night: {
      title: 'Barracks 3 — 01:40',
      enter: (s) => {
        s.flags.bt_night = true;
        s.time = 'Night';
      },
      text: (s) => [
        'Halfway through training, sleep becomes something that happens to other people. The implant itches. The radiator knocks. Down the row someone is crying very quietly into a pillow.',
        'The bunk above you creaks. Tomas leans over the edge, a pale shape in the dark.',
        '@say Tomas|You awake? ... My ma\'s worse. Got a letter through the mill foreman. She\'s coughing blood now. Two more weeks till we graduate and get family care. Two weeks is a long time with that cough.',
        s.flags.stole_kit ? '@say Tomas|The kit you got me — I got it to her. It helped. It\'s not enough. It\'s not medicine, it\'s a bandage.' : '@say Tomas|There\'s medicine in the infirmary annex. I saw it. Rows of it. Just sitting there.',
        'He goes quiet. You can hear him working up to it.',
        '@say Tomas|If I did something stupid. Would you tell?',
      ],
      choices: [
        { t: '"Don\'t. Two weeks. Then we get her real care. Don\'t throw it away now."', fx: { rel: { tomas: 5 }, flag: { tomas_warned: true } }, go: 'bt_night_ilse' },
        { t: '"I wouldn\'t tell. And if you need someone to watch the door, ask."', fx: { rel: { tomas: 15 }, cons: 4, susp: 2, flag: { tomas_ally: true } }, go: 'bt_night_ilse' },
        { t: '"Yes. I would. And so should you, if it were me."', tag: 'LOYAL', tagCls: 'loyal', fx: { rel: { tomas: -15 }, lp: 2, cons: -3, flag: { tomas_threat: true } }, go: 'bt_night_ilse' },
      ],
    },

    bt_night_ilse: {
      text: (s) => {
        if (s.flags.ilse_knows || (s.rel.ilse || 0) >= 20) {
          return [
            'Later, much later, you get up for the washroom. The corridor lights are on their night cycle, half of them dead.',
            'Ilse is at the sink, washing her hands with slow care, as if they were tools. She doesn\'t look up. She speaks to the mirror.',
            '@say Ilse|No cameras in here. The duct is too wet, they keep shorting. Three seconds of noise every forty. Talk in the noise.',
            'The ventilation shudders. In the roar, she says:',
            '@say Ilse|I\'m not here for the rations. You\'ve worked that out. I want to know if you\'re here for them.',
          ];
        }
        return [
          'Later you get up for the washroom. Ilse is at the sink. She looks at you in the mirror, the way she looks at everything — measuring.',
          '@say Ilse|Hypothetical question, Stacks. You\'re on patrol. You find a lambda painted on a wall. Fresh. Nobody around. What do you do?',
        ];
      },
      choices: (s) => {
        if (s.flags.ilse_knows || (s.rel.ilse || 0) >= 20) {
          return [
            { t: '"I\'m here because someone asked me to be. The same as you."', if: (s) => s.flags.sleeper, fx: { res: 15, rel: { ilse: 20 }, flag: { res_ally: true } }, go: 'bt_night_ally' },
            { t: '"I\'m here for my sister. But I\'m not blind. Tell me more."', fx: { res: 8, rel: { ilse: 10 }, flag: { res_curious: true } }, go: 'bt_night_curious' },
            { t: '"I\'m here for the Union. And you\'ve just said too much."', tag: 'THREAT', tagCls: 'loyal', fx: { rel: { ilse: -30 }, res: -20, flag: { ilse_threatened: true } }, go: 'bt_night_threat' },
          ];
        }
        return [
          { t: '"Paint over it. Log it. Move on."', fx: { rel: { ilse: 3 } }, go: 'bt_night_end' },
          { t: '"Report it and stake out the wall. Whoever painted it comes back to admire it."', fx: { lp: 1, rel: { ilse: -5 } }, go: 'bt_night_end' },
          { t: '"Depends who\'s watching."', fx: { rel: { ilse: 10 }, res: 4 }, go: 'bt_night_end' },
        ];
      },
    },

    bt_night_ally: {
      text: [
        'Ilse\'s hands stop moving under the water.',
        '@say Ilse|Wren.',
        'You nod. The duct roars again.',
        '@say Ilse|Then listen. You don\'t do anything. Not in training, not in your first weeks. You get your mask, you get your posting, you become the most boring unit in District 5. When we need you, the Tinker on Bazaar Row will fix your radio. Until then you\'re a good dog.',
        '@say Ilse|And if you ever sell me, Stacks, the river will remember that too.',
        'She turns off the tap and walks out, drying her hands on her shirt.',
      ],
      choices: [{ t: 'Go back to your bunk.', fx: { flag: { know_tinker_res: true } }, go: 'bt_night_end' }],
    },

    bt_night_curious: {
      text: [
        'Ilse dries her hands slowly.',
        '@say Ilse|More is dangerous. More is how people end up on level 4. But — keep your eyes open on the streets. Notice who gets hurt and who doesn\'t. Notice who decides. Then ask yourself if your sister is safer because of them, or in spite of them.',
        '@say Ilse|If you ever want to talk about the answer, there\'s a repairman on Bazaar Row. He fixes radios. Tell him the river remembers.',
      ],
      choices: [{ t: 'Go back to your bunk.', fx: { flag: { know_tinker_res: true } }, go: 'bt_night_end' }],
    },

    bt_night_threat: {
      text: [
        'Ilse turns off the tap. She dries her hands. When she finally turns to face you, her expression has not changed at all.',
        '@say Ilse|Said too much? I said I wasn\'t here for the rations. I\'m here because the Canal Quarter flooded and I need to eat. You\'re reading into it, Stacks. Be careful — that\'s what JURY does, and JURY eats its own.',
        'She walks out. You stand alone at the sink. You could report this conversation. You would have nothing but your word, and she would have hers.',
      ],
      choices: [{ t: 'Go back to your bunk.', go: 'bt_night_end' }],
    },

    bt_night_end: {
      text: ['You lie on your bunk until the siren. Two weeks left. Somewhere above the Nexus, a dropship passes low enough to rattle the window you can\'t see out of.'],
      choices: [{ t: 'Morning.', go: 'bt_hub' }],
    },

    /* -------------------------------------------------- FINAL EVALUATION */

    bt_final: {
      checkpoint: true,
      title: 'Final evaluation — briefing',
      enter: (s) => {
        s.time = 'Night';
      },
      text: (s) => [
        'They brief you at 21:00 in a garage that smells of diesel and gun oil. Six recruits in borrowed half-armour, no masks. You, Tomas, Ilse, and three others. Thirty stands in front of a projector screen showing a blurry floor plan.',
        '@say Thirty|This is not a drill. Signals intelligence reports an unregistered transmitter in District 5. Stack 14. Fourth floor. Unit 14-F.',
        'The floor tilts under your feet.',
        '14-F is Halloran.',
        s.flags.informed_halloran ? 'You told them about his bread. Nobody here knows that. You know it.' : 'Stack 14 is your block. Mira is asleep two doors down.',
        '@say Thirty|Occupant: Halloran, Edvard. Seventy-one. Low threat. If anyone in this squad has a personal connection to that address, now is the time to say so.',
        'His lenses pass over you. They don\'t stop. Or they do, for half a second.',
      ],
      choices: [
        { t: '"I live in Stack 14, sir. 14-C. I know the occupant."', tag: 'HONEST', go: 'bt_final_declare' },
        { t: 'Say nothing. Check your weapon.', go: 'bt_raid_1' },
      ],
    },

    bt_final_declare: {
      text: [
        'Thirty considers you.',
        '@say Thirty|I know. Your address is in your file. So is his. I was waiting to see if you would say it.',
        '@say Thirty|You will lead the stack up the stairs, because you know the stairs. You will not lead the search, because you know the man. Honesty has been noted. Do not make me regret noting it.',
      ],
      choices: [{ t: 'Move out.', fx: (s) => ((s.bt.score += 2), { lp: 2, flag: { declared: true } }), go: 'bt_raid_1' }],
    },

    bt_raid_1: {
      title: 'Stack 14 — 23:10',
      text: [
        'The APC drops you at the mouth of the block. You lead the stack into the stairwell you have climbed ten thousand times — past the broken broadcast screen on the second floor, past the place on the third-floor landing where you and Mira carved your initials before the war.',
        'On the fourth floor, a door cracks open. **14-C**. Mira\'s face in the gap, sleep-creased, eyes going wide as she recognises you in the armour.',
        'Behind you, Thirty\'s mask turns toward the door.',
      ],
      choices: [
        { t: 'Bark at her like a stranger: "*Back inside, citizen. Now.*"', check: { skill: 'authority', diff: -10, pass: 'bt_raid_mira_bark', fail: 'bt_raid_mira_bark_bad' } },
        { t: 'Catch her eye. The smallest shake of your head. Hope she understands.', go: 'bt_raid_mira_look' },
        { t: 'Ignore her completely and keep moving. Thirty is watching.', fx: { rel: { mira: -8 } }, go: 'bt_raid_2' },
      ],
    },

    bt_raid_mira_bark: {
      text: [
        'Your voice comes out flat and hard and not like your voice at all. Mira flinches as though you\'d struck her. The door closes. A bolt slides.',
        'Thirty says nothing. He doesn\'t have to.',
      ],
      choices: [{ t: 'Keep moving.', fx: (s) => ((s.bt.score += 1), { rel: { mira: -10 }, lp: 1 }), go: 'bt_raid_2' }],
    },

    bt_raid_mira_bark_bad: {
      text: [
        'You try. It comes out as her name.',
        '"*Mira* — back inside."',
        'She disappears. The door closes. On the landing, five recruits and a drill instructor heard you use a citizen\'s name like it was yours to use.',
        '@say Thirty|Later.',
      ],
      choices: [{ t: 'Keep moving.', fx: (s) => ((s.bt.score -= 1), { susp: 4, rel: { mira: 5 } }), go: 'bt_raid_2' }],
    },

    bt_raid_mira_look: {
      text: [
        'You meet her eyes for a single heartbeat. Barely move your head. *Not now. Go inside. I\'ll explain.*',
        'Mira understands. She always did. The door closes without a sound.',
      ],
      choices: [{ t: 'Keep moving.', fx: { rel: { mira: 5 } }, go: 'bt_raid_2' }],
    },

    bt_raid_2: {
      title: 'Unit 14-F',
      text: [
        'Tomas breaches the door with his shoulder. The lock was never very good.',
        'Halloran is sitting at his kitchen table in his coat, as though he has been waiting for you. A single candle. A cup of something that isn\'t sector water. He looks up at the six of you, and then at you, and something in his face folds closed.',
        '@say Halloran|Ah. Well. At least it\'s someone who knows to wipe their boots.',
        '@say Thirty|Search it.',
        'The others pull drawers and tip the mattress. You know this apartment. You know the radiator under the window has a loose panel, because Halloran used to hide sweets there for you and Mira when you were small.',
      ],
      choices: [
        { t: 'Go straight to the radiator. Pull the panel.', go: 'bt_raid_found' },
        { t: 'Search the room properly — let your eyes do the work.', check: { skill: 'perception', diff: 0, pass: 'bt_raid_found_more', fail: 'bt_raid_tomas_finds' } },
        { t: 'Search everywhere *except* the radiator. Make a show of it.', check: { skill: 'deception', diff: 10, pass: 'bt_raid_hidden', fail: 'bt_raid_ilse_finds' } },
      ],
    },

    bt_raid_found: {
      text: [
        'The panel comes away in your hand like it always did. Behind it, wrapped in a dish towel, is a radio: a pre-war set gutted and rebuilt around a transmitter coil, an antenna wire running up inside the wall.',
        'Thirty takes it from you without a word and turns it over in his gloves.',
        'Halloran doesn\'t look at the radio. He looks at you. *You knew where the sweets were*, his face says. That\'s all.',
      ],
      choices: [{ t: 'Stand by for orders.', fx: (s) => ((s.bt.score += 2), { merit: 1, rel: { halloran: -30 }, flag: { found_radio: true } }), go: 'bt_raid_apply' }],
    },

    bt_raid_found_more: {
      text: [
        'You let your eyes move. The radiator panel — yes. But also: a basin under the sink with water gone pink. A strip of torn bedsheet in the stove, half burned. Bloodstains, cleaned with care, on the floor by the window.',
        'Someone was here. Someone hurt. Recently. Halloran didn\'t just have a radio — he was hiding a person.',
        'You pull the radiator panel. The transmitter is there, wrapped in a dish towel. You hand it to Thirty.',
        'The blood is your knowledge alone, for the moment.',
      ],
      choices: [
        { t: 'Report the blood too. "Sir — someone was hiding here. Wounded. Recently."', tag: 'REPORT', tagCls: 'loyal', fx: (s) => ((s.bt.score += 3), { merit: 2, lp: 3, cons: -5, rel: { halloran: -40 }, flag: { found_radio: true, reported_blood: true } }), go: 'bt_raid_apply' },
        { t: 'Keep the blood to yourself.', fx: (s) => ((s.bt.score += 2), { cons: 3, res: 5, rel: { halloran: -10 }, flag: { found_radio: true, hid_blood: true } }), go: 'bt_raid_apply' },
      ],
    },

    bt_raid_tomas_finds: {
      text: [
        'You search and see nothing — a tired old man\'s things, made strange by armour and torchlight. Then Tomas knocks on the radiator with his knuckle, frowns, and pulls the panel.',
        '@say Tomas|Sir. Got something.',
        'A transmitter, wrapped in a dish towel. Thirty takes it. Then he looks at you — the recruit who lives two doors down and somehow didn\'t find it.',
      ],
      choices: [{ t: 'Stand by for orders.', fx: (s) => ((s.bt.score += 0), { flag: { found_radio: true } }), go: 'bt_raid_apply' }],
    },

    bt_raid_ilse_finds: {
      text: [
        'You make a show of searching the wardrobe, the bed, the cupboard. You make too much of a show. Ilse watches you from the doorway, and her eyes go to the radiator — the one place you haven\'t looked.',
        'For a second you think she will leave it. Then Thirty turns his head toward her, and she has no choice. She pulls the panel.',
        '@say Ilse|Transmitter, sir.',
        'She doesn\'t look at you. She doesn\'t need to. Thirty does.',
        '@say Thirty|Interesting. The recruit who knows this building searched everywhere but there.',
      ],
      choices: [{ t: 'Stand by for orders.', fx: (s) => ((s.bt.score -= 2), { susp: 10, flag: { found_radio: true } }), go: 'bt_raid_apply' }],
    },

    bt_raid_hidden: {
      text: [
        'You tear the bedding apart. You empty the cupboard. You take the wardrobe off its hinges. You are thorough, loud and convincing, and you never once look at the radiator.',
        'After twenty minutes, Thirty calls it.',
        '@say Thirty|Nothing. Either signals intelligence is wrong, or he moved it. Signals intelligence is not wrong.',
        'He looks at Halloran a long time. Then he looks at you.',
        '@say Thirty|We go. The occupant is placed on watch. Recruits, out.',
        'As you leave, Halloran catches your sleeve with two fingers, very lightly. He doesn\'t say anything. He doesn\'t need to.',
      ],
      choices: [{ t: 'Back to the APC.', fx: (s) => ((s.bt.score -= 1), { cons: 8, res: 12, susp: 5, rel: { halloran: 40 }, flag: { halloran_fate: 'spared', hid_radio: true } }), go: 'bt_grad' }],
    },

    bt_raid_apply: {
      text: [
        'Thirty sets the transmitter on the kitchen table beside the candle.',
        '@say Thirty|Edvard Halloran. Possession of an unregistered transmitter is major malcompliance. Before he goes to JURY, the Union will remind him of his obligations. Recruit.',
        'He is looking at you.',
        '@say Thirty|Apply.',
        'Halloran sets down his cup. He folds his hands on the table, the way he did when he used to listen to your homework. He nods to you — very slightly. *It\'s all right.*',
        'It is not all right.',
      ],
      choices: [
        { t: 'Do it properly. Stick to the shoulders and back until he is on the floor.', tag: 'OBEY', tagCls: 'loyal', go: 'bt_raid_beat' },
        { t: 'Make it look brutal and hurt him as little as possible.', check: { skill: 'melee', diff: 5, pass: 'bt_raid_stage_ok', fail: 'bt_raid_stage_bad' } },
        {
          t: '"Sir — it\'s a receiver, not a transmitter. Look at the coil. He listens to pre-war music." ',
          check: { skill: 'deception', diff: 25, pass: 'bt_raid_lie_ok', fail: 'bt_raid_lie_bad' },
        },
        { t: 'Lower your stick. "No."', tag: 'REFUSE', tagCls: 'risk', go: 'bt_raid_refuse' },
      ],
    },

    bt_raid_beat: {
      text: [
        'You do it.',
        'You will remember the sound of the stick on a coat older than the Union. You will remember that he didn\'t cry out until the third blow, and that when he did, it was your name.',
        'Afterwards he lies on the kitchen floor and Tomas cuffs him. Two units from the van carry him down the stairs past 14-C. You don\'t look at the door. You hear it open anyway, and then close.',
        '@say Thirty|That is what it costs. Now you know. Most never pay it to someone they know. You will be a good unit.',
      ],
      choices: [{ t: 'Back to the APC.', fx: (s) => ((s.bt.score += 3), { lp: 6, merit: 2, cons: -15, rel: { halloran: -100, mira: -25 }, flag: { halloran_fate: 'beaten' } }), go: 'bt_grad' }],
    },

    bt_raid_stage_ok: {
      text: [
        'You make it look worse than it is. Blows that land with the flat of the stick on the thick of his coat. A knee that buckles him gently to the floor. The sound is terrible. The damage is not.',
        'Halloran understands at the first strike. He goes down like he\'s been shot and lies still, breathing shallowly, and when Tomas cuffs him he winks at the floor where only you can see.',
        '@say Thirty|Enough. JURY will do the rest.',
        'They take him down the stairs. He walks most of the way himself.',
      ],
      choices: [{ t: 'Back to the APC.', fx: (s) => ((s.bt.score += 2), { lp: 2, cons: 2, xp: { melee: 1, deception: 1 }, rel: { halloran: 15 }, flag: { halloran_fate: 'detained' } }), go: 'bt_grad' }],
    },

    bt_raid_stage_bad: {
      text: [
        'You try to pull the blows. The second one goes wrong — he moves, you misjudge, and the stick catches him across the temple. He drops without a sound.',
        'For one horrible moment nobody moves. Then Ilse is on her knees beside him, two fingers on his neck.',
        '@say Ilse|He\'s breathing.',
        'Thirty looks down at the old man, then at you.',
        '@say Thirty|Force applied without control is worse than no force at all. It looks like cruelty and works like incompetence.',
      ],
      choices: [{ t: 'Back to the APC.', fx: (s) => ((s.bt.score -= 1), { cons: -5, rel: { halloran: -20, mira: -10 }, flag: { halloran_fate: 'detained' } }), go: 'bt_grad' }],
    },

    bt_raid_lie_ok: {
      text: [
        'You step forward, pick up the set, and turn it to the light like a technician.',
        '@say You|See the coil, sir? Single-wound. No oscillator. It\'s a receiver — pre-war shortwave, built up to pull in the old music stations from the Outlands. Major malcompliance would be a transmitter. This is minor. Listening.',
        'You have no idea if any of that is true. You say it like it is.',
        'Thirty takes the set and turns it in his hands for a long, long time.',
        '@say Thirty|...Minor malcompliance. Confiscation and a ration penalty. The occupant goes on watch.',
        'He sets the radio under his arm. On the way out he pauses beside you.',
        '@say Thirty|Signals intelligence says it transmitted. Twice. Last week. I wonder who is wrong — signals intelligence, or you.',
      ],
      choices: [{ t: 'Back to the APC.', fx: (s) => ((s.bt.score += 1), { cons: 6, res: 10, susp: 8, rel: { halloran: 50 }, xp: { deception: 2 }, flag: { halloran_fate: 'spared', lied_thirty: true } }), go: 'bt_grad' }],
    },

    bt_raid_lie_bad: {
      text: [
        '@say You|Sir, I think it\'s a receiver — the coil —',
        'Thirty doesn\'t even look at the radio.',
        '@say Thirty|It transmitted twice last week. Signals logged it. You are lying to protect a neighbour, in front of witnesses, during evaluation.',
        'He takes the stick out of your hand and does it himself. It is much worse than anything you would have done. When it is over he hands the stick back to you, grip first.',
        '@say Thirty|Your file will reflect this.',
      ],
      choices: [{ t: 'Back to the APC.', fx: (s) => ((s.bt.score -= 3), { susp: 15, lp: -5, cons: 4, rel: { halloran: 10, mira: -10 }, flag: { halloran_fate: 'beaten', lied_thirty: true } }), go: 'bt_grad' }],
    },

    bt_raid_refuse: {
      text: [
        'You lower the stick. The word comes out of you before you can stop it.',
        '@say You|No.',
        'The room is silent. Even the candle seems to stop moving. Then Thirty steps past you without a word and does it himself. Fast, professional, worse than anything you would have done. Halloran stops making noise after the fourth blow.',
        'Thirty straightens and turns to you.',
        '@say Thirty|I could fail you. I could send you down to level 4 to explain to the Magistrate why the Union\'s orders are optional. I will not. Do you know why?',
        '@say Thirty|Because the Union is short of bodies, and because you will learn. Everyone learns. The ones who learn slowly simply learn more.',
      ],
      choices: [{ t: 'Back to the APC.', fx: (s) => ((s.bt.score -= 4), { susp: 14, lp: -6, cons: 10, res: 8, rel: { halloran: 20, mira: 5 }, flag: { halloran_fate: 'beaten', refused_thirty: true } }), go: 'bt_grad' }],
    },

    /* --------------------------------------------------------- GRADUATION */

    bt_grad: {
      checkpoint: true,
      title: 'Graduation — Parade Floor',
      enter: (s) => {
        s.time = 'Morning';
        const sc = s.bt.score;
        s.mem.grade = sc >= 14 ? 'Distinction' : sc >= 9 ? 'Pass' : sc >= 4 ? 'Conditional pass' : 'Probationary';
        s.rank = '05';
        s.div = 'UNION';
        s.merit += sc >= 14 ? 6 : sc >= 9 ? 3 : 0;
        if (sc < 4) s.susp = Math.min(100, s.susp + 5);
        G.unlock(s, 'divisions');
        G.unlock(s, 'colours');
        G.unlock(s, 'uniforms');
        G.unlock(s, 'overwatch');
        G.unlock(s, 'verdicts');
        G.note('PROMOTED → 05 PROTECTION UNIT', 'promo');
      },
      text: (s) => [
        'Three days later, Intake 9-114 stands on the painted grid one last time. Thirty-one of the forty who started. Nobody mentions the other nine.',
        'They call you forward one at a time. A HELIX medic fits the mask over your face and seals it at the back of your skull. For a moment you cannot breathe — then the filter clicks, and the air comes in cold and tasting faintly of metal, and the world goes slightly blue through the lenses.',
        '@img assets/img/helmet.jpg|Standard-issue Protection Unit helmet',
        'You hear your own breath, amplified. It doesn\'t sound like you.',
        `@doc FINAL EVALUATION: ${s.mem.grade.toUpperCase()}\nASSIGNED: UNION DIVISION, DISTRICT 5 PRECINCT\nDESIGNATION: ${G.desig(s)}`,
        s.mem.grade === 'Distinction' ? '@say Thirty|Distinction. One of three in this intake. Don\'t let it go to your head. Heads are where they shoot.' : s.mem.grade === 'Probationary' ? '@say Thirty|Probationary. JURY will be watching your file. So will I. Give us both a reason to stop.' : '@say Thirty|Adequate. The street will finish what I started.',
        'Tomas is assigned to UNION, District 5 — the same squadron as you. He punches your shoulder hard enough to bruise, through two layers of armour. Ilse is posted to UNION, District 3: the canals. As the parade breaks up, she passes you without a glance.',
        s.flags.halloran_fate === 'spared'
          ? 'Halloran is still in 14-F, on a watch list. Mira writes you a note through the precinct mail: *He says to tell you he has run out of sweets.*'
          : s.flags.halloran_fate === 'detained'
          ? 'Halloran was transferred to JURY. A clerk tells you he was released after six days with a ration penalty. Old men are not worth the cell space.'
          : 'Nobody tells you where Halloran went. You look it up on the terminal. His file says *RELOCATED*.',
        '@dispatch Attention: Protection Unit graduates of intake 9-114. You are now the Union\'s eyes in the dark. Report to your precinct. Sociostability is your responsibility.',
      ],
      choices: [{ t: 'Report to the District 5 precinct.', go: 'u_start' }],
    },
  });
})();
