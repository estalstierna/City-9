/* DUTIES — each has a full first-time event and a shorter routine version */
(function () {
  const END = 'u_duty_end';

  G.duties = {
    ration: { name: 'Ration distribution', desc: 'Plaza 5 dispensary line. Crowd control.', first: 'd_ration_1', routine: 'd_ration_r' },
    checkpoint: { name: 'Checkpoint duty', desc: 'Canal Gate 3, the bridge into District 3.', first: 'd_check_1', routine: 'd_check_r' },
    market: { name: 'Foot patrol', desc: 'Bazaar Row and the alleys behind it.', first: 'd_market_1', routine: 'd_market_r' },
    inspection: { name: 'Block inspection', desc: 'Census sweep, Stack 22.', first: 'd_insp_1', routine: 'd_insp_r' },
    broadcast: { name: 'Loyalty hour supervision', desc: 'The noon broadcast at the Plaza 5 screens.', first: 'd_cast_1', routine: 'd_cast_r' },
    escort: { name: 'Detainee transfer', desc: 'Escort a prisoner from the D5 cells to the Nexus.', first: 'd_escort_1', routine: 'd_escort_r', if: (s) => s.day >= 2 },
    railyard: { name: 'Night sweep', desc: 'D4 Rail Yards after curfew. Guerrilla activity reported.', first: 'd_rail_1', routine: 'd_rail_r', if: (s) => s.day >= 3 },
  };

  /* generic routine outcome helper */
  const routineEnd = (fx) => [{ t: 'End of shift.', fx, go: END }];

  G.addScenes({
    /* =========================================================== RATION */
    d_ration_1: {
      title: 'Plaza 5 — ration dispensary',
      text: [
        '@img assets/img/env/e10-ration.jpg|Plaza 5, ration distribution',
        'The ration dispensary is a steel wall in the side of the old cinema with six hatches in it. When a citizen puts a card into the slot, a hatch opens and a grey packet slides out: nutrient bar, a can of sector water, a sachet of something that is supposed to be coffee.',
        '@img assets/img/portraits/rdt-worker.jpg|Behind hatch 4',
        'Behind the steel wall, CWU workers in ochre jackets feed the RDT hatches from pallets, never looking out through the slots.',
        'The queue goes around the plaza twice. Three hundred citizens, maybe more, silent except for coughing.',
        '@say Rook|Two rules for ration line. Keep it moving. Keep it quiet. A line that stops is a line that thinks.',
        'An hour in, a woman in a shawl reaches the hatch. She puts in a card. Packet. Then, quickly, she puts in a second card. Your lenses flag it automatically — a soft amber chime in your ear. **CARD HOLDER DECEASED: 9 DAYS.**',
        'She has two children holding onto her skirt. One of them is staring up at your mask.',
      ],
      choices: [
        { t: 'Confiscate both cards. Detain her for ration fraud.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 3, lp: 3, cons: -6 }, go: 'd_ration_1_detain' },
        { t: 'Take the dead man\'s card. Let her keep her own packet. Wave her on.', check: { skill: 'authority', diff: 0, pass: 'd_ration_1_middle', fail: 'd_ration_1_middle_bad' } },
        { t: 'Pretend the chime didn\'t sound. Let her take both.', check: { skill: 'deception', diff: 5, pass: 'd_ration_1_blind', fail: 'd_ration_1_blind_bad' } },
      ],
    },
    d_ration_1_detain: {
      text: [
        '@law THEFT (RATION FRAUD) · LEVEL 3 — 3 penalty points · 1 detainment cycle · re-education',
        'You take her arm. The children start crying in unison, a terrible high siren. The woman doesn\'t fight. She just keeps saying *he would have wanted them fed, he would have wanted them fed* while Rook cuffs her.',
        'The line watches without watching. It moves faster after that.',
        '@say Rook|Good. Fast, clean. The kids go to the block warden. She\'ll be out in a week, probably, and she\'ll never do it again.',
      ],
      choices: [{ t: 'Back to the line.', go: 'd_ration_2' }],
    },
    d_ration_1_middle: {
      text: [
        'You put your hand flat over the slot before the hatch can open, pluck the second card from the reader and snap it in half in front of her.',
        '@say You|One card. One citizen. Move along.',
        'She stares at you, then grabs her children and her single packet and goes. The line sees a unit enforce the rules. Rook sees something else — and decides not to mention it.',
      ],
      choices: [{ t: 'Back to the line.', fx: { merit: 2, cons: 2, xp: { authority: 1 } }, go: 'd_ration_2' }],
    },
    d_ration_1_middle_bad: {
      text: [
        'You take the dead man\'s card and tell her to move along — but your voice isn\'t hard enough. A man behind her in the queue sees it, and shouts: *"She gets two? I\'ve got three kids and I get one!"*',
        'The line ripples. Rook steps in and puts the man on the ground with his stick before it can become anything else.',
        '@say Rook|Next time, be harder. Soft is contagious.',
      ],
      choices: [{ t: 'Back to the line.', fx: { merit: 1, cons: 1 }, go: 'd_ration_2' }],
    },
    d_ration_1_blind: {
      text: [
        'You turn your head as if checking the plaza. The hatch opens twice. When you turn back she is gone into the crowd, children and both packets.',
        'Your lens logs it anyway. Later, in the precinct, you quietly overwrite the flag as *card reader fault — hatch 4*. Nobody checks. Nobody ever checks hatch 4.',
      ],
      choices: [{ t: 'Back to the line.', fx: { cons: 5, res: 3, susp: 2, xp: { deception: 1 } }, go: 'd_ration_2' }],
    },
    d_ration_1_blind_bad: {
      text: [
        'You turn your head. The hatch opens twice. And Rook, who was watching you instead of the crowd, steps past you and catches the woman by the shawl.',
        '@say Rook|Hatch chimed, five. You deaf?',
        'He detains her himself. On the way back to the line he says, too quietly for anyone else: *"I\'m logging that as you missing it. Once."*',
      ],
      choices: [{ t: 'Back to the line.', fx: { susp: 5, rel: { rook: -5 } }, go: 'd_ration_2' }],
    },
    d_ration_2: {
      text: [
        'At 11:40 hatch 2 jams. At 11:45 hatch 5 runs empty. At 11:50 the dispenser screen flashes **SUPPLY INTERRUPTION**, and the remaining hatches slam shut with a sound like a gun going off.',
        'There are still sixty citizens in line. They have been standing since dawn.',
        'Nobody shouts at first. That is the worst part. They just turn, all together, and look at you.',
      ],
      choices: [
        { t: 'Draw your stunstick and hold the line. Make the first one who steps forward regret it.', check: { skill: 'melee', diff: 5, pass: 'd_ration_2_stick', fail: 'd_ration_2_hurt' } },
        { t: 'Address them — loud, calm, final. Tell them the resupply is coming tomorrow at eight.', check: { skill: 'authority', diff: 10, pass: 'd_ration_2_voice', fail: 'd_ration_2_hurt' } },
        { t: 'Call it in: "Dispatch, 10-78, Plaza 5, crowd forming."', check: { skill: 'comms', diff: 0, pass: 'd_ration_2_call', fail: 'd_ration_2_hurt' } },
      ],
    },
    d_ration_2_stick: {
      text: [
        'A young man steps forward. You hit him before he finishes the step, once on the shoulder, once behind the knee, and he goes down. You stand over him with the stick humming.',
        'The crowd stops. Takes a breath. Disperses, slowly, like water draining from a basin.',
        '@say Rook|That\'s the job. One to save sixty. You\'ll stop feeling it eventually.',
      ],
      choices: [{ t: 'End of shift.', fx: { merit: 3, lp: 2, cons: -3 }, go: END }],
    },
    d_ration_2_voice: {
      text: [
        'You step up onto the dispenser ledge so they can all see you, and you speak through the mask\'s amplifier in the flat, enormous voice of a broadcast.',
        '@say You|Supply resumes at 08:00. Cards scanned today will be honoured first tomorrow. Disperse. Compliance will be remembered.',
        'It\'s a lie — you have no idea if the cards will be honoured — but it is a lie in the voice of the Union, and they believe it. They go.',
        'The next morning you check. They weren\'t honoured. You remember the faces anyway.',
      ],
      choices: [{ t: 'End of shift.', fx: { merit: 3, xp: { authority: 1 }, cons: -1 }, go: END }],
    },
    d_ration_2_call: {
      text: [
        '@radio 10-4, Plaza 5. Units en route. Hold position.',
        'Four units arrive in ninety seconds in an APC. They don\'t wait. They go through the crowd with sticks the way a plough goes through earth. In two minutes the plaza is empty except for a dropped shawl and a child\'s shoe.',
        '@say Rook|Fast response. Clean call. Granite will like that.',
      ],
      choices: [{ t: 'End of shift.', fx: { merit: 3, lp: 1, cons: -3, xp: { comms: 1 } }, go: END }],
    },
    d_ration_2_hurt: {
      text: [
        'It goes wrong. Someone throws a can of sector water; it catches you on the side of the helmet. Then there are hands on your vest and someone is pulling at your mask, and you\'re swinging the stick blind.',
        'Rook drags you out of it by the collar. Four more units arrive and clear the plaza. You have a cracked lens and a split eyebrow under the mask and you can\'t stop shaking.',
        '@say Rook|You\'re alive. That\'s a pass, today.',
      ],
      choices: [{ t: 'End of shift.', fx: { hp: -20, merit: 1 }, go: END }],
    },
    d_ration_r: {
      title: 'Plaza 5 — ration line',
      text: [
        '@img assets/img/env/e10-ration.jpg|Plaza 5',
        'The ration line again. Three hundred faces, one grey packet each.',
        G.pick([
          'A small boy tries to slip under the barrier rope to get to the front. His sister hisses at him to come back. He freezes when he sees you looking.',
          'An old man faints in the line from standing. The people around him step over him to keep their places.',
          'A woman offers you a handmade thing — a little bird folded from a ration wrapper — as she passes. *For your children, officer.* Units don\'t have children.',
        ]),
      ],
      choices: [
        { t: 'Keep it moving. That is the job.', fx: { merit: 2 }, go: END },
        { t: 'Stop and search a citizen from the crowd.', tag: 'SEARCH', tagCls: 'duty', go: 'ss_start' },
        { t: 'Do the small decent thing, whatever it is, quickly enough that no one notices.', check: { skill: 'deception', diff: -10, pass: END, fail: END, okFx: { merit: 2, cons: 2 }, failFx: { merit: 1, susp: 2 } } },
      ],
    },

    /* ======================================================= CHECKPOINT */
    d_check_1: {
      title: 'Canal Gate 3',
      text: [
        '@img assets/img/env/e11-gate.jpg|Canal Gate 3',
        'Canal Gate 3 is a steel cage built across the old stone bridge into the Canal Quarter. A scanner arch, a booth, a barrier, a Combine banner snapping in the wind. Citizens pass in single file, papers held up to the scanner.',
        'Mid-morning, a man of about sixty steps up to the arch. His hands are shaking. His papers are a relocation permit to D3 — the stamp is right, the photograph is him.',
        'But the paper is wrong. Too white. Fresh.',
      ],
      choices: [
        { t: 'Inspect his papers properly.', tag: 'INSPECT', tagCls: 'duty', go: 'd_check_docs' },
        { t: 'Wave him through. The scanner didn\'t flag it.', go: 'd_check_miss' },
      ],
    },
    d_check_spot: {
      text: [
        'Under your lens, the watermark is printed, not pressed. A good forgery. A very good one.',
        'The man sees you see it. He leans in, close to the booth\'s slot.',
        '@say Old man|My daughter is in D3. She is having a child. *A child*, officer. She is hiding — you know what they do. I only want to see her once. Please.',
        'He slides something through the slot: half a pack of pre-war cigarettes.',
        'A child. In a city under the suppression field, where children are not born. If it\'s true, it is the most dangerous secret in the Canal Quarter.',
        '@law NON-AUTHORISED ID (YELLOW) · LEVEL 4 for him. UNAUTHORISED PROCREATIVE ACTIVITY · LEVEL 6 for his daughter — 12 penalty points · 6 detainment cycles · 2 interrogation cycles.',
      ],
      choices: [
        { t: 'Detain him for forgery. Report the pregnancy claim.', tag: 'REPORT', tagCls: 'loyal', fx: { merit: 5, lp: 4, cons: -10, res: -5 }, go: 'd_check_ota' },
        { t: 'Take the cigarettes and wave him through.', tag: 'BRIBE', tagCls: 'risk', fx: { give: 'cigarettes', susp: 4, cons: -1 }, go: 'd_check_ota' },
        { t: 'Push the cigarettes back. Wave him through. "Go see your daughter."', fx: { cons: 8, res: 6, susp: 3 }, go: 'd_check_ota' },
        { t: 'Refuse him entry. Send him home without charges.', fx: { merit: 1, cons: 1 }, go: 'd_check_ota' },
      ],
    },
    d_check_miss: {
      text: [
        'You scan the paper. It looks fine to you. You wave him through.',
        'Rook, in the booth, watches him go with his head tilted.',
        '@say Rook|Good forgery, that. Better than most. Don\'t worry about it — someone in D3 will pick him up. Or they won\'t.',
      ],
      choices: [{ t: 'Continue the shift.', fx: { xp: { perception: 1 } }, go: 'd_check_ota' }],
    },
    d_check_ota: {
      enter: (s) => G.unlock(s, 'overwatch'),
      text: [
        'At 14:00, the queue goes completely silent.',
        '@img assets/img/ota-soldier.jpg|Overwatch infantry, C9 Garrison',
        'A squad of Overwatch soldiers comes up the bridge from the Canal Quarter: four of them, tall, armoured in dark plates, faces hidden behind single glowing lenses. Their radios speak in a dry clicking language that isn\'t meant for human ears. Citizens flatten against the railing.',
        'The squad leader stops at your booth. His voice is a synthesized rasp.',
        '@say Overwatch|Protection Unit. Surrender checkpoint log. Passage records, past seventy-two hours.',
        'Overwatch and Civil Protection do not give each other orders. Not unless sociostatus is declared — and it isn\'t. Rook has gone very still in the booth.',
      ],
      choices: [
        { t: 'Hand over the log. Overwatch is Overwatch.', fx: { lp: 1, rel: { rook: -3 } }, go: 'd_check_ota_comply' },
        { t: '"Negative. No sociostatus is active. Request the log through the Nexus."', check: { skill: 'authority', diff: 15, pass: 'd_check_ota_refuse', fail: 'd_check_ota_refuse_bad' } },
        { t: 'Stall. Call Dispatch to confirm the request through channels.', check: { skill: 'comms', diff: 5, pass: 'd_check_ota_call', fail: 'd_check_ota_comply' } },
      ],
    },
    d_check_ota_comply: {
      text: [
        'You pull the drive from the booth terminal and hold it out. The Overwatch soldier takes it without thanks, and the squad moves on toward the Nexus with a clatter of plated boots.',
        'Rook lets out a breath.',
        '@say Rook|You know they\'ll use that to crawl up somebody\'s file. Maybe ours. Next time — make them ask through the Nexus. They hate paperwork more than rebels.',
      ],
      choices: [{ t: 'End of shift.', fx: { merit: 2 }, go: END }],
    },
    d_check_ota_refuse: {
      text: [
        'The lens studies you for a long moment. The clicking on its radio stops.',
        '@say Overwatch|...Acknowledged. Request will be forwarded.',
        'The squad moves on. Rook stares at you through the booth glass.',
        '@say Rook|You just said no to Overwatch. Out loud. To its face. And you\'re still breathing.',
        'By evening the story is all over the precinct. Granite pauses beside you at the lockers and says one word — *"Regulation"* — and pats your shoulder once.',
      ],
      choices: [{ t: 'End of shift.', fx: { merit: 5, rel: { rook: 10, granite: 10 }, xp: { authority: 1 } }, go: END }],
    },
    d_check_ota_refuse_bad: {
      text: [
        'You say no. Your voice wavers. The Overwatch soldier steps forward and simply takes the drive out of the terminal himself, and when you reach to stop him, the butt of his rifle meets your chest plate and you sit down hard on the floor of the booth.',
        '@say Overwatch|Civil Protection will remember its function.',
        'They leave. Rook helps you up.',
        '@say Rook|Right in principle. Wrong in volume. Never pick a fight you can\'t make them lose.',
      ],
      choices: [{ t: 'End of shift.', fx: { hp: -12, merit: 1, rel: { rook: 5 } }, go: END }],
    },
    d_check_ota_call: {
      text: [
        '@say You|Dispatch, Gate 3. Overwatch squad requesting checkpoint log. Confirm authorisation.',
        '@radio ...Gate 3, stand by.',
        'Thirty seconds. Then a minute. The Overwatch soldier waits, its lens unblinking. Then:',
        '@radio Gate 3, request not on file. Overwatch to route through Nexus liaison. 10-4.',
        'The squad leader clicks something in its own language and the squad moves on. Rook makes a small, delighted sound.',
        '@say Rook|Procedure. Beautiful, boring procedure.',
      ],
      choices: [{ t: 'End of shift.', fx: { merit: 4, rel: { rook: 8 }, xp: { comms: 1 } }, go: END }],
    },
    d_check_r: {
      title: 'Canal Gate 3',
      text: (s) => [
        '@img assets/img/env/e11-gate.jpg|Canal Gate 3',
        'The gate again. The scanner hums, the queue shuffles, the river slides by black under the bridge.',
        G.pick([
          'A woman tries to bring a bag of river clams across without a permit. They are still alive, clicking against each other.',
          'Two boys try to cross on one card, pressed shoulder to shoulder through the arch as if you might not notice there are two of them.',
          'A man crosses without papers, simply walks through the arch as it shrieks, keeps walking, not looking back, not running. He looks like someone who has decided not to be afraid any more.',
        ]),
        s.flags.res_task && !s.flags.res_task_done ? '@sys Ilse\'s courier is supposed to cross today. A woman in a red headscarf.' : null,
      ],
      choices: (s) => [
        { t: 'Enforce it. Every rule, every time.', fx: { merit: 2, lp: 1, cons: -1 }, go: END },
        { t: 'Pull someone out of the queue for a full search.', tag: 'SEARCH', tagCls: 'duty', go: 'ss_start' },
        { t: 'Work the queue: inspect papers against the clock.', tag: 'INSPECT', tagCls: 'duty', go: 'd_check_queue' },
        { t: 'Look the other way, just this once.', fx: { merit: 1, cons: 2, susp: 2 }, go: END },
        {
          t: 'Watch for the red headscarf. Let her through with a forged log entry.',
          if: (s) => s.flags.res_task && !s.flags.res_task_done,
          check: { skill: 'deception', diff: 5, pass: 'd_check_res_ok', fail: 'd_check_res_bad' },
        },
      ],
    },
    d_check_res_ok: {
      text: [
        'She comes at 15:20, a woman in a red headscarf with a basket of laundry. Under the laundry, you know, is a box of HELIX coagulant stolen from the Nexus. The scanner flags the basket.',
        'You log it as *linen, cleared*, and wave her through without looking at her face.',
        'That night, there is a small chalk mark on the wall of the precinct latrine, low down, where only someone looking would see. **λ**. Then someone else scrubs it away.',
      ],
      choices: [{ t: 'End of shift.', fx: { res: 15, susp: 4, cons: 3, merit: 1, flag: { res_task_done: true } }, go: END }],
    },
    d_check_res_bad: {
      text: [
        'She comes at 15:20, red headscarf, basket of laundry. The scanner flags it. You start to log it as cleared — and Rook leans out of the booth.',
        '@say Rook|Flagged basket, five. Open it.',
        'You open it. You find the coagulant. You have no choice now: you detain her in front of Rook, and she looks at you the whole time with flat, perfect contempt, as if she knew exactly what you were and expected nothing more.',
      ],
      choices: [{ t: 'End of shift.', fx: { res: -10, merit: 3, susp: 3, flag: { res_task_done: true, res_task_failed: true } }, go: END }],
    },

    /* =========================================================== MARKET */
    d_market_1: {
      title: 'Bazaar Row — foot patrol',
      text: [
        '@img assets/img/env/e03-bazaar.jpg|Bazaar Row',
        'Bazaar Row at noon: rusting market stalls under tarpaulins, citizens bartering in murmurs, the smell of boiled bones and hot metal. Your boots clear a path in front of you without you having to do anything at all.',
        'Halfway down, Rook stops and points his stick up. On the wall above a shuttered shop, fresh blue paint is still dripping: half a lambda, unfinished. And on the roof gutter above it, a skinny kid with a paint tin is frozen like a cat.',
        'He sees you. He runs.',
      ],
      choices: [
        { t: 'Go after him — over the stalls, up the fire escape.', check: { skill: 'fitness', diff: 5, pass: 'd_market_catch', fail: 'd_market_lose' } },
        { t: 'Cut him off — guess where he\'ll come down.', check: { skill: 'perception', diff: 5, pass: 'd_market_catch', fail: 'd_market_lose' } },
        { t: 'Let him go. Paint over the mark. Not worth the chase.', fx: { cons: 2, merit: 1 }, go: 'd_market_tinker' },
      ],
    },
    d_market_catch: {
      text: [
        'You catch him three roofs over, where the gutter ends in nothing and he has to choose between you and a twelve-metre drop. He chooses you. Good.',
        '@law VANDALISM · LEVEL 4 — 5 penalty points · 2 detainment cycles. Spray can: GREEN contraband.',
        'He can\'t be older than twelve. Blue paint to the elbows. A bruise on his cheek that\'s older than today.',
        '@say Boy|I didn\'t — I wasn\'t — someone paid me a ration bar, I don\'t even know what it *means*.',
        'Rook arrives, breathing hard, and leans on a chimney.',
        '@say Rook|Your catch. Your call.',
      ],
      choices: [
        { t: 'Arrest him. JURY can find out who paid.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 4, lp: 3, cons: -6 }, go: 'd_market_tinker' },
        { t: 'Make him paint over it himself, then let him go with a warning he won\'t forget.', check: { skill: 'authority', diff: 0, pass: 'd_market_warn', fail: 'd_market_warn' } },
        { t: 'Ask him who paid him. Then let him go.', check: { skill: 'authority', diff: 5, pass: 'd_market_who', fail: 'd_market_warn' } },
      ],
    },
    d_market_warn: {
      text: [
        'You march him back down to the wall and make him paint over his own lambda with grey municipal paint, while half of Bazaar Row pretends not to watch. When he\'s done, you crouch to his height and tell him what happens on level 4 to people who paint walls.',
        'He runs like his life depends on it. Maybe it does.',
      ],
      choices: [{ t: 'Continue the patrol.', fx: { merit: 2, cons: 1 }, go: 'd_market_tinker' }],
    },
    d_market_who: {
      text: [
        '@say Boy|A man. I don\'t know his name. Bald, glasses. Burned fingers, like — like he\'s burned them on something. He sits at the end of the Row.',
        'Rook grunts.',
        '@say Rook|The radio man. Interesting.',
        'You let the boy go. He doesn\'t look back.',
      ],
      choices: [{ t: 'Continue the patrol.', fx: { merit: 2, flag: { know_tinker: true } }, go: 'd_market_tinker' }],
    },
    d_market_lose: {
      text: [
        'You go up the fire escape and the third rung gives under your weight. By the time you get your boot back on the ladder, the kid is gone — over the ridge and down into the maze of the Stacks.',
        'Rook watches you climb back down.',
        '@say Rook|Kids are faster than us. That\'s why we have scanners.',
      ],
      choices: [{ t: 'Continue the patrol.', fx: { hp: -5, merit: 1 }, go: 'd_market_tinker' }],
    },
    d_market_tinker: {
      text: (s) => [
        'At the end of the Row, a repairman\'s stall: radios, coils of copper, a lamp clamped to a shelf. A bald man with thick spectacles and burned fingertips solders something without looking up as you pass.',
        '@portrait assets/img/portraits/tinker.jpg|The repairman at the end of the Row',
        s.flags.know_tinker ? 'You know who this is. *The Tinker.* The name from level 4, from the boy with the paint.' : 'Rook\'s stick taps his thigh a little faster as you pass. He doesn\'t say anything.',
      ],
      choices: (s) => [
        { t: 'Search the stall.', if: (s) => s.flags.know_tinker && !s.flags.tinker_arrested, check: { skill: 'perception', diff: 10, pass: 'd_market_tinker_find', fail: 'd_market_tinker_clean' } },
        { t: 'Walk on.', fx: { merit: 1 }, go: END },
        { t: 'Walk on, and stop the first citizen who looks away from your mask.', tag: 'SEARCH', tagCls: 'duty', go: 'ss_start' },
      ],
    },
    d_market_tinker_find: {
      text: [
        'You tip over a crate of radio chassis. The Tinker doesn\'t move. Under the crate, under a loose board, you find three tins of blue paint and a sheaf of hand-printed leaflets.',
        'The Tinker sets down his iron and looks at you over his glasses with no fear at all.',
        '@say Tinker|Well. There it is.',
      ],
      choices: [
        { t: 'Arrest him.', tag: 'ARREST', tagCls: 'loyal', fx: { merit: 7, lp: 5, cons: -6, res: -40, flag: { tinker_arrested: true } }, go: 'd_market_tinker_arrest' },
        { t: 'Kick the board back over it. "Clean." Rook didn\'t see.', check: { skill: 'deception', diff: 5, pass: 'd_market_tinker_spare', fail: 'd_market_tinker_caught' } },
      ],
    },
    d_market_tinker_arrest: {
      text: [
        'He holds out his wrists before you ask. You cuff him. He doesn\'t say anything until the van comes, and then, as they push him into the back, he says one thing — quietly, to you alone:',
        '@say Tinker|The river remembers, officer. It remembers you too.',
      ],
      choices: [{ t: 'End of shift.', go: END }],
    },
    d_market_tinker_spare: {
      text: [
        'You kick the board back into place and set the crate on top of it. Rook is ten metres away, harassing a cigarette seller.',
        '@say You|Clean.',
        'The Tinker picks up his iron again. His hands are perfectly steady.',
        '@say Tinker|Thank you for your inspection, officer.',
      ],
      choices: [{ t: 'End of shift.', fx: { res: 15, susp: 4, cons: 4, rel: { tinker: 20 } }, go: END }],
    },
    d_market_tinker_caught: {
      text: [
        'You start to kick the board back. Rook is suddenly beside you.',
        '@say Rook|What\'s under there, five?',
        'He lifts it himself. Paint. Leaflets. He looks at you for a long time. Then he arrests the Tinker without a word, and on the way back to the precinct he says nothing at all, which is much worse than anything he could have said.',
      ],
      choices: [{ t: 'End of shift.', fx: { susp: 10, merit: 2, res: -20, rel: { rook: -15 }, flag: { tinker_arrested: true } }, go: END }],
    },
    d_market_tinker_clean: {
      text: ['You toss the stall. Radios, wires, a tin of tobacco. If there is anything here, it is hidden better than you can find in ten minutes with Rook watching. The Tinker sweeps up the pieces without complaint after you leave.'],
      choices: [{ t: 'End of shift.', fx: { merit: 1, rel: { tinker: -10 } }, go: END }],
    },
    d_market_r: {
      title: 'Bazaar Row',
      text: [
        'Bazaar Row again. Stalls, smoke, murmuring.',
        G.pick([
          'A stall-keeper sells you a hot potato for no tokens at all and won\'t look at you while he does it.',
          'Two men are arguing over a battery. They stop the moment your shadow falls on them, and both of them apologise to you instead of each other.',
          'Someone has painted a new lambda overnight, low on a wall, the size of a hand. It\'s already half scrubbed off. You can\'t tell who scrubbed it.',
        ]),
      ],
      choices: [
        { t: 'Patrol hard. Let them see the mask.', fx: { merit: 2, lp: 1 }, go: END },
        { t: 'Patrol light. Watch more than you\'re watched.', fx: { merit: 1, xp: { perception: 1 } }, go: END },
        { t: 'Stop and search a citizen from the crowd.', tag: 'SEARCH', tagCls: 'duty', go: 'ss_start' },
      ],
    },

    /* ======================================================= INSPECTION */
    d_insp_1: {
      title: 'Stack 22 — census inspection',
      text: [
        'Stack 22 is the oldest block in the district: water stains like maps on every ceiling, stairwells with no light. You go door to door with Rook and a scanner, matching faces to the census register. Sixteen apartments to a floor. Nine floors.',
        'On the seventh floor, apartment 22-71. Registered occupants: two. A married couple, sixties. Both present, both scanning green.',
        'But there are three cups drying on the rack. And a pair of small woman\'s shoes by the door that are far too small for the wife\'s feet.',
      ],
      choices: [
        { t: 'Search the apartment.', check: { skill: 'perception', diff: 0, pass: 'd_insp_find', fail: 'd_insp_nothing' } },
        { t: 'Scan them, log them, move on.', fx: { merit: 2 }, go: 'd_insp_nothing' },
      ],
    },
    d_insp_find: {
      text: [
        'Behind a false panel in the wardrobe — the oldest trick in the Stacks — a crawlspace. In the crawlspace, a woman of about ninety, wrapped in a blanket, holding a rosary in hands like roots.',
        '@say Wife|She\'s my mother. She was on the relocation list. Last spring. We know what relocation is, officer. Everyone knows. She\'s ninety-one. She\'ll be dead by winter anyway. Let her die *here*.',
        'Rook is in the doorway. He looks at the old woman. He looks at you.',
      ],
      choices: [
        { t: 'Register her and schedule relocation. Detain the couple for concealment.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 5, lp: 4, cons: -10 }, go: 'd_insp_end_report' },
        { t: 'Register her — but don\'t charge the couple. Rook, back me up.', check: { skill: 'authority', diff: 5, pass: 'd_insp_end_middle', fail: 'd_insp_end_report' } },
        { t: 'Close the panel. "Two occupants. Both green." Look at Rook.', go: 'd_insp_rook' },
      ],
    },
    d_insp_rook: {
      text: (s) => [
        'You close the panel. You log two occupants, both compliant. Then you turn and look at Rook.',
        s.rel.rook >= 15
          ? 'Rook holds your gaze for a long moment. Then he shrugs, the smallest motion of his armoured shoulders. "Two occupants," he says. "Both green. Next floor."'
          : 'Rook doesn\'t move. "Five," he says. "If I sign this and it comes back on us, it\'s my file too. You understand what you\'re asking?"',
      ],
      choices: (s) =>
        s.rel.rook >= 15
          ? [{ t: 'Next floor.', fx: { cons: 8, res: 4, susp: 2, rel: { rook: 8 }, flag: { rook_complicit: true } }, go: END }]
          : [
              { t: '"I understand. I\'m still asking."', check: { skill: 'authority', diff: 10, pass: 'd_insp_rook_yes', fail: 'd_insp_rook_no' } },
              { t: '"...No. You\'re right. Log her."', fx: { merit: 3, cons: -4 }, go: 'd_insp_end_report' },
            ],
    },
    d_insp_rook_yes: {
      text: ['Rook stands very still. Then he turns away. "I didn\'t see the wardrobe," he says. "I was on the landing. You checked it. Next floor."'],
      choices: [{ t: 'Next floor.', fx: { cons: 8, res: 4, susp: 3, rel: { rook: 10 }, flag: { rook_complicit: true } }, go: END }],
    },
    d_insp_rook_no: {
      text: ['Rook shakes his head. He opens the panel himself and calls it in. The couple do not look at either of you as they are led away. In the stairwell Rook says, "I\'m doing you a favour. You\'ll understand that one day."'],
      choices: [{ t: 'Continue.', fx: { merit: 2, susp: 4, rel: { rook: -5 } }, go: END }],
    },
    d_insp_end_report: {
      text: [
        '@law WITHHOLDING INFORMATION FROM CCA OFFICERS · LEVEL 3 — 3 penalty points each · 1 detainment cycle',
        'The old woman goes in a wheelchair, because she cannot walk down seven floors. The couple go in cuffs. On the landing, neighbours have opened their doors a crack to watch, and they close them all at once as you come out, like a row of eyelids.',
      ],
      choices: [{ t: 'End of shift.', go: END }],
    },
    d_insp_end_middle: {
      text: [
        'You register the old woman on the relocation list — the data entry is enough, a name in a queue. You do not charge the couple. Rook signs off on it without comment.',
        'Relocation lists in D5 are eight months long. She is ninety-one. You both know the arithmetic.',
      ],
      choices: [{ t: 'End of shift.', fx: { merit: 3, cons: 3 }, go: END }],
    },
    d_insp_nothing: {
      text: ['You log two occupants. Both green. On the stairs, Rook says, "Three cups on the rack, you notice?" and then, when you don\'t answer, "Doesn\'t matter. Ninth floor."'],
      choices: [{ t: 'End of shift.', fx: { merit: 2 }, go: END }],
    },
    d_insp_r: {
      title: 'Census sweep',
      text: [
        'Door after door. Faces, scanners, green lights. Two hundred citizens in a day, and the scanner says all of them exist.',
        G.pick([
          'One door is opened by a child who stares at you and then salutes, perfectly, the way they teach it in the block schools.',
          'An old man insists on showing you photographs of his grandchildren, who were relocated in the first year. He doesn\'t know where. He thinks you might.',
          'You find a cat in apartment 22-14. Pets are malcompliance. The cat looks at you like it knows.',
        ]),
      ],
      choices: [...routineEnd({ merit: 2 }), { t: 'Search a resident on the stairwell.', tag: 'SEARCH', tagCls: 'duty', go: 'ss_start' }],
    },

    /* ======================================================== BROADCAST */
    d_cast_1: {
      title: 'Plaza 5 — Loyalty Hour',
      text: [
        'At noon every screen in City 9 shows the Administrator. In Plaza 5 the big screen is mounted on the old cinema, three storeys tall, and attendance is mandatory for every citizen not on a shift.',
        '@dispatch Citizens of City 9. Your Administrator speaks to you today about gratitude. Consider: what would you be without the Union? Hungry. Afraid. Alone in the dark of the old world...',
        'Three hundred citizens stand facing the screen. Your job is to stand facing *them*.',
        'In the third row, a man has his back to the screen. He is staring at the pavement, his lips moving. Everyone around him has left a careful half-metre of space.',
      ],
      choices: [
        { t: 'March over and turn him around by force.', check: { skill: 'melee', diff: -10, pass: 'd_cast_force', fail: 'd_cast_force' } },
        { t: 'Watch him longer before acting.', check: { skill: 'perception', diff: 0, pass: 'd_cast_read', fail: 'd_cast_force' } },
      ],
    },
    d_cast_force: {
      text: [
        'You take him by the collar and spin him around to face the screen. He stumbles, catches himself, looks up at the Administrator\'s enormous face with total incomprehension — and then you understand.',
        'His eyes are milky white. He is blind. He was praying.',
        '@law GENERAL UNCIVIL BEHAVIOUR · LEVEL 1 — re-education. And, if anyone writes it down: PHYSICAL IMPERFECTION · LEVEL 7.',
        'The crowd doesn\'t move. Somewhere in it, someone laughs, very short, and stops.',
      ],
      choices: [
        { t: 'Leave him facing the screen. Rules are rules.', fx: { merit: 2, lp: 2, cons: -3 }, go: END },
        { t: 'Let go. Murmur an apology no one else can hear.', fx: { merit: 1, cons: 3 }, go: END },
      ],
    },
    d_cast_read: {
      text: [
        'You watch. He doesn\'t flinch when the screen flashes white. He doesn\'t turn his head toward the noise. His hand rests on the shoulder of the woman beside him, lightly, the way you guide yourself through a dark room.',
        'Blind. And his lips are moving in a rhythm — a prayer, a very old one.',
        'Rook leans in. "Turn him around or log it. Granite\'s watching the cameras."',
      ],
      choices: [
        { t: 'Log him as visually impaired, exempt. Move on.', check: { skill: 'comms', diff: -10, pass: 'd_cast_exempt', fail: 'd_cast_force' } },
        { t: 'Walk over and turn him gently toward the screen. Let him keep praying.', fx: { merit: 2, cons: 2, lp: 1 }, go: END },
      ],
    },
    d_cast_exempt: {
      text: [
        'You key a medical exemption into your slate: *visually impaired, broadcast attendance waived.* It takes thirty seconds. The man will never know it happened. Next week, no unit will bother him.',
        'Granite asks about it at the end of the shift. You show him the regulation. He reads it, grunts, and hands the slate back.',
      ],
      choices: [{ t: 'End of shift.', fx: { merit: 3, cons: 3, xp: { comms: 1 } }, go: END }],
    },
    d_cast_r: {
      title: 'Loyalty Hour',
      text: [
        '@dispatch ...those who remember the old world remember only its comforts and never its cruelties. The Union asks only that you remember correctly...',
        G.pick([
          'A woman in the front row weeps through the whole broadcast. Nobody can tell if it\'s devotion or grief. You can\'t either.',
          'Someone has hung a pair of trousers off the bottom of the screen frame. The wind makes them dance in front of the Administrator\'s face. It takes three units twenty minutes to get them down.',
          'The broadcast freezes for eleven seconds, the Administrator\'s mouth half open. Three hundred citizens stand perfectly still, waiting, afraid to be seen reacting.',
        ]),
      ],
      choices: [...routineEnd({ merit: 2 }), { t: 'Pull a citizen who was not watching the screen.', tag: 'SEARCH', tagCls: 'duty', go: 'ss_start' }],
    },

    /* =========================================================== ESCORT */
    d_escort_1: {
      title: 'Detainee transfer — D5 cells to the Nexus',
      text: [
        'The detainee is a mill worker in his thirties named in the file only as *D5-2291*. Picked up last night with a crowbar and a hand-drawn map of the ration warehouse in the Works. You and Rook march him in cuffs across the bridge toward the Nexus.',
        'Halfway across, he speaks without turning his head.',
        '@say Detainee|You\'re the new one, aren\'t you? From Stack 14. I knew your father.',
        '@say Detainee|Listen. In the Nexus they\'ll take me to level 4. I won\'t come back. I\'ve got a boy, eight years old, Stack 9, unit 9-40. Tell him — tell him the map was for food. Just that. Tell him it was for food.',
        'Rook is a few paces ahead, watching the bridge. He might not have heard.',
      ],
      choices: [
        { t: 'Hit him once. "Detainees don\'t speak."', fx: { lp: 1, cons: -4 }, go: 'd_escort_2' },
        { t: '"Nine-forty. I\'ll tell him." Say it under your breath.', fx: { cons: 5, res: 4, flag: { escort_promise: true } }, go: 'd_escort_2' },
        { t: '"What else was on the map? Talk now, maybe level 4 goes easier."', check: { skill: 'authority', diff: 5, pass: 'd_escort_intel', fail: 'd_escort_2' } },
      ],
    },
    d_escort_intel: {
      text: [
        'He hesitates. Then it comes out in a rush, the way it does when people have been afraid for a long time and see a door.',
        '@say Detainee|Thursday. The ration truck through the Canal Quarter. There\'s a cell — four men, maybe five — they\'ll hit it at the lock bridge. I was supposed to bring the crowbar. That\'s all. That\'s all I know, I swear on my boy.',
        'You hand him over at the Nexus. You put the intelligence in your report, exactly as he said it. It goes up the chain.',
      ],
      choices: [{ t: 'End of shift.', fx: { merit: 6, lp: 3, cons: -3, flag: { truck_intel: true } }, go: END }],
    },
    d_escort_2: {
      text: (s) => [
        'You hand him over at the Nexus gate. Two JURY units take him by the elbows. He looks back at you once over his shoulder, just before the doors close.',
        s.flags.escort_promise ? 'That evening, out of uniform, you climb the stairs of Stack 9 to unit 9-40. A small boy opens the door. You tell him. *It was for food.* He nods very seriously, as if you have given him something to keep, and closes the door.' : 'You don\'t see him again. You don\'t look up his file.',
      ],
      choices: (s) => [{ t: 'End of shift.', fx: s.flags.escort_promise ? { merit: 2, susp: 2, cons: 3 } : { merit: 3 }, go: END }],
    },
    d_escort_r: {
      title: 'Detainee transfer',
      text: [
        'Another detainee, another walk across the bridge. Cuffs, silence, the river below.',
        G.pick([
          'This one is a woman who laughs the whole way, softly, at nothing.',
          'This one is a boy who keeps asking if he\'ll be home for dinner.',
          'This one is a former unit. Mask removed, designation scratched off his chest plate. He walks perfectly in step with you out of habit.',
        ]),
      ],
      choices: routineEnd({ merit: 3, cons: -1 }),
    },

    /* ======================================================== RAIL YARD */
    d_rail_1: {
      title: 'D4 Rail Yards — 23:40',
      text: [
        '@img assets/img/env/e12-railyard.jpg|D4 Rail Yards, 23:40',
        'The rail yards after curfew are a forest of dead freight cars and rusting cranes, lit only by the green standby lamps of the transit line and the occasional sweep of a scanner. Rook takes point. Two 04s from the night squad flank you. Your torch beam makes everything look like it\'s moving.',
        'Night sweeps draw sidearms from the armoury whatever your grade: a USP-Match signed out against your designation, eighteen rounds counted out and counted back in at dawn.',
        '@radio D5 PT, Dispatch. Biosignal anomaly in the yard. Coagulate and examine. Sword is NOT authorised. 10-4.',
        'You pass a relocation car with its doors chained shut. Something inside it has been written on the walls with a fingernail.',
        'Then a sound, very small: a pebble skittering off steel, somewhere above you.',
      ],
      choices: [
        { t: 'Kill your torch and freeze. Listen.', check: { skill: 'perception', diff: 5, pass: 'd_rail_spot', fail: 'd_rail_ambush' } },
        { t: 'Sweep your torch up along the cars — find them before they find you.', check: { skill: 'firearms', diff: 10, pass: 'd_rail_spot', fail: 'd_rail_ambush' } },
      ],
    },
    d_rail_spot: {
      text: [
        '@radio ...Contact. Grain car, north row. Requesting contact confirm.',
        'There — on the roof of a grain car, a silhouette against the city glow. A rifle. Two more figures behind the next car, crouched, waiting for the sweep team to walk into the gap between them.',
        'You have maybe two seconds before they realise you\'ve seen them.',
      ],
      choices: [
        { t: 'Fire first. Drop the rifleman on the roof.', check: { skill: 'firearms', diff: 5, pass: 'd_rail_win', fail: 'd_rail_ambush' } },
        { t: 'Signal the team silently — flank and box them in.', check: { skill: 'comms', diff: 5, pass: 'd_rail_flank', fail: 'd_rail_ambush' } },
        { t: 'Shout a warning that gives the rebels a chance to run.', tag: 'MERCY', tagCls: 'mercy', fx: { res: 8, susp: 4, cons: 4 }, go: 'd_rail_scatter' },
      ],
    },
    d_rail_win: {
      text: [
        'You fire twice. The figure on the roof spins and slides off the far side of the grain car with a sound like a sack falling. The other two break and run, and the 04s chase them into the dark, and you hear shots, and then nothing.',
        'You walk around the grain car. The rifleman is a woman. Young. She\'s still breathing — a round through the shoulder, another through the side. Her rifle is a pre-war hunting gun held together with wire.',
        'Rook kneels and checks her. Then he looks at you.',
        '@say Rook|She\'ll bleed out in ten minutes without help. JURY will want to talk to her. Or we let the yard have her. Your shot. Your call.',
      ],
      choices: [
        { t: 'Patch her up for JURY.', check: { skill: 'medical', diff: 0, pass: 'd_rail_save', fail: 'd_rail_die' } },
        { t: 'Let the yard have her.', fx: { merit: 5, lp: 3, cons: -10 }, go: 'd_rail_die' },
      ],
    },
    d_rail_flank: {
      text: [
        'You touch Rook\'s shoulder, point, make the signs you learned on the parade floor. He understands instantly. The 04s peel off left and right. Thirty seconds later the rebels are caught between four torches and four muzzles.',
        'They drop their weapons. Three of them. A woman with a hunting rifle and two teenagers with pipes. Nobody fires a shot.',
        '@say Rook|...Huh. Clean. Not a scratch on anyone. Granite\'s going to think I wrote your report for you.',
      ],
      choices: [{ t: 'End of shift.', fx: { merit: 8, lp: 3, rel: { rook: 12 }, xp: { comms: 1 } }, go: END }],
    },
    d_rail_scatter: {
      text: [
        '@say You|*Contact! Grain car! Contact!*',
        'You shout it a beat too early and twice too loud. The figures on the cars freeze, then scatter like birds, over the couplings and down into the dark between the trains. The 04s fire into the night and hit nothing.',
        '@say Rook|...You saw them early. Good eyes. Bad mouth. Too loud, five. Way too loud.',
        'Something in his voice suggests he is not sure it was an accident.',
      ],
      choices: [{ t: 'End of shift.', fx: { merit: 2, rel: { rook: -3 } }, go: END }],
    },
    d_rail_ambush: {
      text: [
        'The first shot comes from above and takes one of the 04s in the neck. He falls without a sound. The second hits you in the chest plate like a hammer and you go down between the rails with no air in your lungs.',
        'Gunfire everywhere. Torchlight flailing. Rook\'s voice on the radio, flat and fast: *"11-99, 11-99, D4 yard, 10-78, all units—"*',
        '@radio 11-99, D4 yard. Deservicement confirmed. Sword, sword, sword.',
        'By the time the APC arrives the rebels are gone. The 04 is dead. You have two cracked ribs and a bruise the shape of a bullet over your heart.',
      ],
      choices: [{ t: 'End of shift.', fx: { hp: -30, merit: 2 }, go: END }],
    },
    d_rail_save: {
      text: [
        'You pack the wounds with gel and your fist and the coagulant, and you keep her talking — her name is Dace, she is from Stack 6, she is nineteen — until the APC comes. She lives.',
        'In the APC she looks at you through the lenses. *"Why?"* she asks. You don\'t answer. You don\'t know if you did it for JURY or for her.',
        '@say Rook|Living prisoner. JURY will be very, very pleased with you. Whether she will be is another question.',
      ],
      choices: [{ t: 'End of shift.', fx: { merit: 8, lp: 2, cons: 2, xp: { medical: 1 } }, go: END }],
    },
    d_rail_die: {
      text: [
        'She dies on the gravel between the rails, looking up at the Citadel\'s red warning lights. It takes less than ten minutes.',
        'You file the report. *Anticitizen, armed, neutralised.* One line.',
      ],
      choices: [{ t: 'End of shift.', fx: { merit: 3 }, go: END }],
    },
    d_rail_r: {
      title: 'Rail yard sweep',
      text: [
        '@img assets/img/env/e12-railyard.jpg|D4 Rail Yards',
        'The yards at night again. Rust, cold, green lamps.',
        G.pick([
          'You find a campfire, still warm, inside a boxcar. A child\'s shoe beside it. Nobody there.',
          'A relocation train comes through without stopping. Faces at the slatted windows. One of them waves.',
          'Somewhere in the dark, someone is whistling a pre-war song. It stops when your torch swings toward it.',
        ]),
      ],
      choices: [
        { t: 'Sweep thoroughly. Every car.', check: { skill: 'perception', diff: 5, pass: END, fail: END, okFx: { merit: 4 }, failFx: { merit: 2, hp: -5 } } },
        { t: 'Walk the route and call it clear.', fx: { merit: 2 }, go: END },
      ],
    },
  });
})();
