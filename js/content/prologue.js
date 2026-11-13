/* PROLOGUE — title, character creation, enlistment */
(function () {
  const N = (s) => s.name;

  G.addScenes({
    title: {
      safe: true,
      nosave: true,
      text: () => [
        '@img assets/img/env/e01-city.jpg|City 09 at dawn',
        '@big CITY 09',
        '@sys CIVIL PROTECTION // RECRUITMENT TERMINAL // DISTRICT 5',
        'The river still runs through City 9. It runs past the dam that hums day and night, past the Citadel spire driven into the old cathedral square like a nail, past the Stacks where forty thousand citizens sleep in shifts.',
        'Every morning the screens tell them they are safe. Every night someone in a mask proves it.',
        'Recruitment is open. The ration bonus is generous. Your sister has been hungry for a long time.',
        '@sys A text roleplay in the Half-Life universe. Some choices are tested against your skills, and the percentage is shown on the choice. Some consequences are not shown at all.',
      ],
      choices: () => [
        { t: 'Continue your record', if: () => G.hasSave(), act: () => G.continueGame() },
        { t: 'Begin a new life', act: () => G.newGame() },
      ],
    },

    /* ---------------------------------------------------------- creation */

    cc_name: {
      safe: true,
      enter: (s) => {
        s.phase = 'creation';
      },
      title: 'Citizen registration',
      text: [
        '@sys IDENTITY VERIFICATION REQUIRED',
        'The terminal in the Stack 14 lobby has a cracked screen and smells of burnt dust. Its scanner light rolls over your face twice before it asks you the question every form in the Union begins with.',
        '@doc STATE YOUR REGISTERED NAME.',
      ],
      input: { key: 'name', placeholder: 'Your name', go: 'cc_bg', fallback: 'Anton', button: 'Register' },
    },

    cc_bg: {
      safe: true,
      title: 'Prior labour assignment',
      text: (s) => [
        `@doc REGISTERED: ${N(s).toUpperCase()}\nAGE CLASS: ADULT\nDISTRICT: 5 // STACK 14 // UNIT 14-C\nDEPENDANTS: 1 (SISTER, MIRA)\n\nSTATE PRIOR LABOUR ASSIGNMENT.`,
        'You were somebody before you decided to stand in this lobby. The Union keeps a record of what.',
      ],
      choices: [
        {
          t: '**Mill hand at the Works.** Twelve-hour shifts on the looms. You can carry a bale up four flights and you have broken up fights with your hands.',
          fx: (s) => {
            s.bg = 'mill';
            return { skill: { fitness: 1, melee: 1 } };
          },
          go: 'cc_motive',
        },
        {
          t: '**Ward assistant at the D5 clinic.** You learned to stitch a wound with a shaking lamp and no anaesthetic.',
          fx: (s) => {
            s.bg = 'nurse';
            return { skill: { medical: 2 }, cons: 5 };
          },
          go: 'cc_motive',
        },
        {
          t: '**Ration clerk at Plaza 5.** You know every face in the queue, every forged card, every way a line turns into a riot.',
          fx: (s) => {
            s.bg = 'clerk';
            return { skill: { comms: 1, perception: 1 }, lp: 2 };
          },
          go: 'cc_motive',
        },
        {
          t: '**Militia survivor.** You were sixteen during the Seven Hour War and held a rifle on a bridge that no longer exists. Your file says *pardoned*.',
          fx: (s) => {
            s.bg = 'militia';
            return { skill: { firearms: 2 }, susp: 4 };
          },
          go: 'cc_motive',
        },
        {
          t: '**Stack runner.** No official labour. You move things — cigarettes, batteries, messages — between blocks for whoever pays.',
          fx: (s) => {
            s.bg = 'street';
            return { skill: { perception: 1, deception: 1 }, tokens: 10 };
          },
          go: 'cc_motive',
        },
      ],
    },

    cc_motive: {
      safe: true,
      title: 'Motive',
      text: [
        'The form does not ask why. The Union does not care why. But you know, and it will shape every choice you make in the mask.',
        '*Why are you enlisting?*',
      ],
      choices: [
        {
          t: '**For Mira.** Officer rations, a better block, and nobody in a mask will touch the sister of one of their own.',
          fx: (s) => {
            s.motive = 'family';
            return { cons: 5, rel: { mira: 10 } };
          },
          go: 'cc_confirm',
        },
        {
          t: '**Because order is the only thing that ever kept you alive.** You have seen what the city looked like before the Union. You will not see it again.',
          fx: (s) => {
            s.motive = 'order';
            return { lp: 5, cons: -5, skill: { authority: 1 } };
          },
          go: 'cc_confirm',
        },
        {
          t: '**Because you are tired of being the one who gets beaten.** Better to hold the stick.',
          fx: (s) => {
            s.motive = 'power';
            return { cons: -10, skill: { authority: 1 } };
          },
          go: 'cc_confirm',
        },
        {
          t: '**Because someone in the canals asked you to.** A woman named Wren, a burn scar on her wrist. *"Get inside. Keep your head down. When someone says the river remembers, you listen."*',
          fx: (s) => {
            s.motive = 'asked';
            return { res: 15, susp: 3, skill: { deception: 1 }, flag: { sleeper: true } };
          },
          go: 'cc_confirm',
        },
      ],
    },

    cc_confirm: {
      safe: true,
      title: 'Registration complete',
      text: (s) => {
        const bgs = { mill: 'mill hand', nurse: 'ward assistant', clerk: 'ration clerk', militia: 'pardoned militia', street: 'stack runner' };
        const ms = {
          family: 'You are doing this for Mira.',
          order: 'You are doing this because the alternative is chaos.',
          power: 'You are doing this because fear only flows one way.',
          asked: 'You are doing this because Wren asked. Nobody can know that. Not even Mira.',
        };
        return [
          `@doc CITIZEN ${N(s).toUpperCase()} — ${bgs[s.bg].toUpperCase()}\nAPPLICATION: CIVIL PROTECTION, INTAKE 9-114\nREPORT: NEXUS RECRUITMENT HALL, 08:00`,
          ms[s.motive],
          'The terminal prints a grey slip with a barcode. You fold it into your breast pocket and climb the stairs home one last time as a citizen.',
        ];
      },
      choices: [{ t: 'Begin', go: 'p_morning' }],
    },

    /* ----------------------------------------------------------- morning */

    p_morning: {
      checkpoint: true,
      enter: (s) => {
        s.phase = 'prologue';
        s.time = 'Morning';
        G.unlock(s, 'city9');
        G.unlock(s, 'citizens');
        G.unlock(s, 'spire');
      },
      title: 'Stack 14, Unit 14-C — 06:10',
      text: (s) => [
        '@img assets/img/env/e02-apartment.jpg|Stack 14, Unit 14-C',
        'The broadcast screen in the stairwell wakes the block before the light does.',
        '@dispatch Attention, residents of District 5. Your Administrator reminds you: compliance is a gift you give your neighbours. Report irregular behaviour. Today\'s ration window opens at nine.',
        'Unit 14-C is two rooms and a window taped over with plastic. The radiator knocks like someone trying to get in. Mira is already up, sitting on the sill in her mill overalls, knees to her chest, drawing on the back of a ration wrapper with a pencil stub worn down to the width of a fingernail.',
        '@portrait assets/img/portraits/mira.jpg|Mira — CID 51420',
        '@say Mira|You\'re really going.',
        'It isn\'t a question. She saw the slip in your pocket last night. She doesn\'t look up from the drawing.',
        '@say Mira|They take the face off you, you know. Old Halloran says they put something in your head and after a while you stop being sad about anything.',
      ],
      choices: [
        {
          t: '"They don\'t take anything. I\'ll still be me. I\'ll just be eating better — and so will you."',
          fx: { rel: { mira: 5 }, cons: 2 },
          go: 'p_morning_2',
        },
        {
          t: '"Maybe not being sad would be an improvement."',
          fx: { rel: { mira: -5 }, cons: -2 },
          go: 'p_morning_2',
        },
        {
          t: '"Halloran should keep his voice down. Words like that get people relocated."',
          fx: { rel: { mira: -3 }, lp: 1 },
          go: 'p_morning_2',
        },
        {
          t: 'Sit beside her on the sill and say nothing. Watch what she draws.',
          fx: { rel: { mira: 8 } },
          go: 'p_morning_draw',
        },
      ],
    },

    p_morning_draw: {
      text: [
        'You sit. The plastic over the window breathes in and out with the wind. Below, the Stacks stretch away in grey rows to the river, and past the river the Citadel rises out of the old town like a blade someone forgot to pull out.',
        'Mira\'s drawing is of a rooftop. Two kids sit on the edge of it with their legs hanging over. The sky above them is empty — no spire, no scanners, just a sun she has scribbled in with the side of the pencil.',
        '@say Mira|That\'s us. Before. You used to take me up on the roof of the old post office to watch the trains.',
        'You remember. There were trains that went *somewhere* back then.',
        'She tears the wrapper carefully along the fold and holds it out.',
        '@say Mira|Keep it. In case they do take your face off. So you remember whose brother you are.',
      ],
      choices: [
        { t: 'Take the drawing and put it in your pocket, next to the recruitment slip.', fx: { give: 'drawing', rel: { mira: 5 }, cons: 3 }, go: 'p_morning_2' },
        { t: '"You know they search recruits. Keep it here. I\'ll come back for it."', fx: { rel: { mira: -2 } }, go: 'p_morning_2' },
      ],
    },

    p_morning_2: {
      text: (s) => [
        'There is a knock on the door — three soft taps, the neighbourly kind. Old Halloran from 14-F stands in the hall in a coat older than the Union, holding half a loaf of real bread wrapped in newspaper.',
        '@portrait assets/img/portraits/halloran.jpg|Edvard Halloran — CID 10388',
        '@say Halloran|For the road. Don\'t ask where I got it, and I won\'t ask where you\'re going.',
        `He looks at you a moment too long. He was the one who carried you and Mira out of the old apartment the night the sky opened, during the war. He used to call you *${N(s)} the stubborn*.`,
        '@say Halloran|Your father would have had opinions. But your father isn\'t here, and the girl needs feeding. Go on.',
      ],
      choices: [
        { t: 'Take the bread and thank him. Leave it for Mira.', fx: { rel: { halloran: 30, mira: 3 }, cons: 2 }, go: 'p_street' },
        { t: '"You shouldn\'t have real bread, Halloran. Be careful who sees you with it."', fx: { rel: { halloran: 10 }, lp: 1 }, go: 'p_street' },
        { t: 'Ask him what he thinks your father would have said.', go: 'p_halloran_father' },
      ],
    },

    p_halloran_father: {
      text: [
        'Halloran\'s mouth works for a moment under his grey stubble.',
        '@say Halloran|He\'d have said a mask is a mask. That it doesn\'t matter what\'s behind it, only what it does. And he\'d have said — this is the part he\'d shout — that the ones who do the worst things in a mask always think they\'re the exception.',
        '@say Halloran|Then he\'d have hugged you and told you to bring home tinned peaches. He was a contradictory man. Go. You\'ll be late, and they don\'t like late.',
      ],
      choices: [{ t: 'Take the bread. Go down into the street.', fx: { rel: { halloran: 35 }, cons: 4 }, go: 'p_street' }],
    },

    /* ------------------------------------------------------------ street */

    p_street: {
      title: 'Bazaar Row — 07:20',
      text: [
        '@img assets/img/env/e03-bazaar.jpg|Bazaar Row, the canal bridge checkpoint',
        'The street is all elbows and steam. Citizens move in the same direction — toward the mills, the ration lines, the transit gates — with the same blue overalls and the same downward look. A scanner drone glides above the crowd at the height of the second-floor windows, its lens clicking as it photographs faces.',
        'At the checkpoint where Bazaar Row meets the canal bridge, two Protection Units have a man down on the wet cobbles. He is maybe fifty. His papers are scattered in the gutter. One unit holds him with a boot between the shoulder blades while the other works a stunstick in short, bored strokes across his back.',
        '@say Protection Unit|Pick it up. Pick up your card. I said *pick it up*.',
        'Every time the man reaches for the card, the stick comes down on his hand. The crowd parts around them like water around a stone. Nobody looks. Nobody stops.',
        'In an hour you will be one of them.',
      ],
      choices: [
        { t: 'Keep walking. Eyes down, like everyone else.', fx: { cons: -2 }, go: 'p_street_walk' },
        { t: 'Slow down and study how the units work — their stance, their signals, who gives orders.', check: { skill: 'perception', diff: 0, pass: 'p_street_study', fail: 'p_street_study_fail' } },
        {
          t: 'Pick the card out of the gutter and hold it out to the unit. "Here. He\'s trying."',
          tag: 'RISK',
          tagCls: 'risk',
          check: { skill: 'authority', diff: 10, pass: 'p_street_card_ok', fail: 'p_street_card_bad' },
        },
      ],
    },

    p_street_walk: {
      text: [
        'You walk. The sound of the stick follows you for a dozen steps and then the crowd swallows it.',
        'This is how the city works, you tell yourself. You put your head down and you survive. You will learn to be on the other side of it, and then it will be different. Then you will be the one deciding.',
        'The thought sits in your stomach like a stone all the way to the Nexus.',
      ],
      choices: [{ t: 'Cross the bridge into District 1.', go: 'p_nexus' }],
    },

    p_street_study: {
      text: [
        'You let the crowd carry you past slowly, watching from the corner of your eye.',
        'The one with the stick isn\'t in charge. The one with the boot is — he carries his weapon lower, keeps his head turned toward the bridge, and touches the side of his mask twice when a third unit appears down the street. A hand signal. *Clear*, maybe, or *wait*.',
        'Most importantly: the beating isn\'t about the man. Every few strikes the one in charge glances at the crowd. It\'s theatre. The audience is the point.',
        'You file that away. It will matter.',
      ],
      choices: [{ t: 'Cross the bridge into District 1.', fx: { xp: { perception: 1, authority: 1 }, flag: { saw_theatre: true } }, go: 'p_nexus' }],
    },

    p_street_study_fail: {
      text: [
        'You slow down a fraction too much. The unit with the boot turns his mask toward you — a dead black lens, a filter that hisses.',
        '@say Protection Unit|Move along, citizen. Unless you want to help him pick it up.',
        'You move along. Your heart is hammering by the time you reach the bridge. You have learned nothing except how it feels to be looked at by one of them.',
      ],
      choices: [{ t: 'Cross the bridge into District 1.', go: 'p_nexus' }],
    },

    p_street_card_ok: {
      text: [
        'You bend, pluck the card from the gutter and hold it out — not to the man on the ground but to the unit with the boot, arm straight, eyes level with his lenses.',
        'Something in the way you hold it makes him pause. Maybe it\'s the recruitment slip poking out of your pocket. Maybe he\'s just bored.',
        '@say Protection Unit|...Recruit?',
        '@say You|Intake 9-114. Reporting at eight.',
        'He takes the card, drops it on the man\'s back and lifts his boot.',
        '@say Protection Unit|Get up. Get to work. *You* — don\'t make a habit of this. Inside, we don\'t help citizens. We correct them.',
        'The man scrambles up and is gone into the crowd without looking at you. But a woman selling batteries from a crate by the bridge has seen everything. She gives you the smallest nod.',
      ],
      choices: [{ t: 'Cross the bridge into District 1.', fx: { cons: 5, susp: 2, xp: { authority: 1 }, flag: { helped_card: true } }, go: 'p_nexus' }],
    },

    p_street_card_bad: {
      text: [
        'You bend for the card. The stick catches you across the forearm before you straighten up, a hot white crack that runs all the way to your teeth.',
        '@say Protection Unit|Did I ask for help? Did anyone here ask for help?',
        'The second blow takes you in the ribs. You go down on one knee next to the man you were trying to help. For a moment you are eye to eye. He looks at you with something like pity.',
        'Then a hand checks your pocket, finds the recruitment slip, and the beating stops as abruptly as it started.',
        '@say Protection Unit|Intake 9-114. Huh. Then you\'ll learn. Go on — you\'re late, *recruit*.',
      ],
      choices: [{ t: 'Limp across the bridge into District 1.', fx: { hp: -15, cons: 5, susp: 3, flag: { helped_card: true, beaten_street: true } }, go: 'p_nexus' }],
    },

    /* ------------------------------------------------------------- nexus */

    p_nexus: {
      title: 'The Nexus — Recruitment Hall',
      enter: (s) => {
        G.unlock(s, 'union');
        G.unlock(s, 'cca');
      },
      text: [
        'The Nexus was a courthouse once. The Union kept the columns and the wide stone steps and bolted everything else over with plates of dark alloy that sweat in the cold. Banners of the Universal Union hang the full height of the facade. Above the doors, a screen loops the face of City 9\'s Administrator — Halvard Lenz, silver-haired, gentle-voiced, endlessly reasonable.',
        '@img assets/img/flag-cca.jpg|Banner of the Combine Civil Authority, Nexus steps',
        '@dispatch ...and those who serve the Union serve themselves. A Civil Protection officer never queues for bread. A Civil Protection officer never fears the night. Will you be afraid, or will you be the reason others feel safe?',
        'Inside, the hall is cold enough to see your breath. Thirty-odd citizens stand in a line painted on the floor. You recognise a few faces from the Stacks. Most stare at the floor.',
        'At the head of the line, behind a steel desk, sits a Protection Unit with a blue UNION armband and an officer\'s thick silver bar. A terminal light washes his lenses blue.',
        '@say Officer|Next. Slip. Hand. Mouth shut until spoken to.',
      ],
      choices: [{ t: 'Step forward and hand over your slip.', go: 'p_interview' }],
    },

    p_interview: {
      text: (s) => [
        'He scans the barcode. Your whole life scrolls up the screen in green text — the apartment, the ration history, the labour assignment, something flagged in amber that he reads twice.',
        s.bg === 'militia' ? '@say Officer|Militia. Pardoned. The Union is merciful. The Union also remembers. Mark that, citizen.' : '@say Officer|Unremarkable. Good. Unremarkable is trainable.',
        '@say Officer|Question one. Why do you wish to serve the Universal Union?',
      ],
      choices: [
        { t: '"To protect the people of District 5."', fx: { lp: 1, cons: 1 }, go: 'p_interview_2' },
        { t: '"To bring order. Whatever it takes."', fx: { lp: 3, cons: -2 }, go: 'p_interview_2' },
        { t: '"For the rations, sir. I won\'t lie to you."', fx: { lp: -1 }, go: 'p_interview_honest' },
        { t: 'Say what he wants to hear, word for word from the broadcasts.', check: { skill: 'deception', diff: -10, pass: 'p_interview_parrot', fail: 'p_interview_parrot_bad' } },
      ],
    },

    p_interview_honest: {
      text: [
        'The officer is silent for a moment. Then a short, filtered sound comes out of the mask that might be a laugh.',
        '@say Officer|Honesty. Rare. Dangerous. Hungry people are loyal for as long as they are fed. We will see if you can be more than hungry.',
      ],
      choices: [{ t: 'Wait for the next question.', fx: { xp: { authority: 1 } }, go: 'p_interview_2' }],
    },

    p_interview_parrot: {
      text: [
        '@say You|Because those who serve the Union serve themselves, sir. Because compliance is a gift I give my neighbours.',
        'You deliver it flat and earnest, the way the Administrator does. The officer nods once and types something.',
        '@say Officer|You listen to the broadcasts. Good. Most of them claim to.',
      ],
      choices: [{ t: 'Wait for the next question.', fx: { lp: 2 }, go: 'p_interview_2' }],
    },

    p_interview_parrot_bad: {
      text: [
        'The words come out a beat too fast, too polished — a child reciting a lesson. The officer leans back.',
        '@say Officer|You think that is what we want? Parrots? Parrots are easy to make and easier to replace.',
        'He types for a long time.',
      ],
      choices: [{ t: 'Wait for the next question.', fx: { lp: -1, susp: 2 }, go: 'p_interview_2' }],
    },

    p_interview_2: {
      text: [
        '@say Officer|Question two. Your neighbour in 14-F. Halloran, Edvard. Seventy-one years. He received an unregistered food item this week. Bread. Do you know its source?',
        'The air goes out of the room. He says it the way you would ask the time. Somewhere behind the desk a printer chatters.',
        'This is a test. It might also be the truth. Halloran\'s bread is still warm in your memory.',
      ],
      choices: [
        { t: '"No, sir. I don\'t know anything about that."', check: { skill: 'deception', diff: 0, pass: 'p_interview_lie_ok', fail: 'p_interview_lie_bad' } },
        { t: '"He gave me some this morning. I didn\'t ask where it came from." (The truth, nothing more.)', fx: { lp: 1, rel: { halloran: -5 } }, go: 'p_interview_truth' },
        {
          t: '"He trades with someone on Bazaar Row. The battery seller by the canal bridge, I think. He\'s old. He gets confused about the rules."',
          tag: 'INFORM',
          tagCls: 'loyal',
          fx: { lp: 5, cons: -8, merit: 2, flag: { informed_halloran: true } },
          go: 'p_interview_inform',
        },
      ],
    },

    p_interview_lie_ok: {
      text: [
        'You keep your face still and your breathing slow. You think of nothing at all, the way you learned as a kid when the units came through the Stacks doing census.',
        '@say You|No, sir.',
        'He watches you for a long count of five. Then he moves on. You will never know whether he believed you or whether he simply didn\'t care.',
      ],
      choices: [{ t: 'Wait for the next question.', fx: { rel: { halloran: 5 }, cons: 2 }, go: 'p_interview_3' }],
    },

    p_interview_lie_bad: {
      text: [
        '@say You|No, sir.',
        'Your voice cracks on *sir*. The officer turns the terminal a few degrees so you can see it. On the screen is a grainy still from the stairwell camera: you, Halloran, a parcel in newspaper.',
        '@say Officer|The Union does not ask questions it does not know the answers to, citizen. It asks to see who you are. Now I have seen.',
        'He types. A small amber icon appears next to your name.',
      ],
      choices: [{ t: 'Wait for the next question.', fx: { susp: 6, lp: -3 }, go: 'p_interview_3' }],
    },

    p_interview_truth: {
      text: [
        '@say Officer|Correct. He did. Thank you for not insulting me.',
        'He makes a note. You cannot tell whether that note is about Halloran or about you.',
      ],
      choices: [{ t: 'Wait for the next question.', go: 'p_interview_3' }],
    },

    p_interview_inform: {
      text: [
        'The words come easily. That is the worst part.',
        '@say Officer|Useful. The Union rewards the useful.',
        'He taps a key and somewhere in the building a printer prints a name. You think of the battery seller\'s crate. You think of Halloran\'s coat. You do not think about anything else.',
      ],
      choices: [{ t: 'Wait for the next question.', go: 'p_interview_3' }],
    },

    p_interview_3: {
      text: [
        '@say Officer|Final question. A Protection Unit is ordered to apply force to a citizen. The citizen is a child. What does the unit do?',
      ],
      choices: [
        { t: '"The unit obeys."', fx: { lp: 3, cons: -4 }, go: 'p_implant' },
        { t: '"The unit applies the minimum force needed for compliance."', fx: { lp: 1, xp: { authority: 1 } }, go: 'p_implant' },
        { t: '"The unit asks for the order to be confirmed."', fx: { xp: { comms: 1 } }, go: 'p_implant' },
        { t: '"Nothing. A child isn\'t a threat."', tag: 'RISK', tagCls: 'risk', fx: { lp: -3, cons: 5, susp: 4 }, go: 'p_implant_defiant' },
      ],
    },

    p_implant_defiant: {
      text: [
        'The officer stops typing.',
        '@say Officer|Everyone is a threat, recruit. That is the first lesson, and you have just failed it in front of me. Fortunately for you, the Union is short of bodies this season.',
        'He stamps your slip anyway. The stamp is red instead of black.',
      ],
      choices: [{ t: 'Follow the floor line to processing.', go: 'p_implant' }],
    },

    p_implant: {
      title: 'Processing',
      enter: (s) => G.unlock(s, 'biosignal'),
      text: (s) => [
        'Processing is a white-tiled room that used to be a holding cell. You strip. Your clothes go into a bag with a number. A HELIX medic with a white-banded sleeve shaves a square at the base of your skull and presses something cold there.',
        '@say HELIX medic|Breathe out.',
        'The pain is very small and very deep, like a splinter going into the bone. Then a warmth spreads down your spine, and somewhere far away a machine learns the rhythm of your heart.',
        '@sys BIOSIGNAL REGISTERED.',
        s.items.includes('drawing')
          ? 'Your clothes are searched before they are bagged. A gloved hand finds Mira\'s drawing, unfolds it, looks at the empty sky she drew. The medic glances at the door — then folds it and slips it back among your things without a word.'
          : 'They search your clothes before they bag them. There is nothing to find.',
        `@doc DESIGNATION ISSUED: ${G.desig(s)}\nSTATUS: RECRUIT\nASSIGNMENT: BASIC TRAINING, NEXUS TRAINING WING, INTAKE 9-114`,
        'They hand you a grey training uniform without a mask. That comes later, the medic says. The mask is earned.',
      ],
      choices: [{ t: 'Report to the barracks.', fx: { codex: 'designation' }, go: 'p_barracks' }],
    },

    p_barracks: {
      title: 'Training Wing — Barracks 3',
      checkpoint: true,
      text: [
        'Barracks 3 is a long concrete room with forty bunks and one window too high to see out of. The heating works. There is a toilet that flushes. Half the intake simply sits on their bunks and stares at the radiator as if it might be a trick.',
        'The bunk above yours belongs to a broad young man with a mill-worker\'s shoulders and a crooked nose. He is already unwrapping the bar from his welcome ration, and he grins at you with a mouth full of nutrient paste.',
        '@portrait assets/img/portraits/tomas.jpg|Tomas Vey — CID 27716, D2 dye floor',
        '@say Tomas|Tomas. Tomas Vey. D2, the Works — dye floor. You?',
        '@portrait assets/img/portraits/ilse.jpg|Ilse Marek — CID 83305, D3 pump works',
        'Across the aisle, a narrow-faced woman sits cross-legged on her bunk, lacing her boots with careful, practised loops. She hasn\'t touched her ration. Her eyes move over every new arrival, counting.',
        '@say Tomas|That\'s Ilse. Don\'t bother. I tried. She looked at me like I was a census form.',
      ],
      choices: [
        { t: 'Introduce yourself to Tomas and ask why he joined.', fx: { rel: { tomas: 15 } }, go: 'p_barracks_tomas' },
        { t: 'Cross the aisle and introduce yourself to Ilse.', fx: { rel: { ilse: 10 } }, go: 'p_barracks_ilse' },
        { t: 'Ignore them both. Unpack, eat, sleep. Friends are a liability in a uniform.', fx: { rel: { tomas: 0, ilse: 0 }, xp: { authority: 1 } }, go: 'bt_intro' },
      ],
    },

    p_barracks_tomas: {
      text: [
        'Tomas talks the way some people eat — fast, as if someone might take it away.',
        '@say Tomas|My ma. She\'s got the cough from the dye floor. Clinic says the medicine exists, it\'s just not *for* citizens. Civil Protection family gets HELIX care. So.',
        'He shrugs, enormous and embarrassed.',
        '@say Tomas|Plus I hear the mask comes with a stick, and there\'s a foreman at the Works I would very much like to say hello to. Kidding. Mostly. You?',
      ],
      choices: [
        { t: 'Tell him about Mira.', fx: { rel: { tomas: 10 } }, go: 'p_barracks_tomas_2' },
        { t: '"Same as everyone. Food."', go: 'p_barracks_tomas_2' },
      ],
    },

    p_barracks_tomas_2: {
      text: [
        '@say Tomas|Well. We look out for each other, then. Two Stack rats with sticks. The city won\'t know what hit it.',
        'He holds out a hand the size of a shovel. Across the aisle, Ilse has stopped lacing her boots and is watching you both without expression.',
      ],
      choices: [{ t: 'Shake his hand. Then lights out.', fx: { rel: { tomas: 5 } }, go: 'bt_intro' }],
    },

    p_barracks_ilse: {
      text: (s) => [
        'Ilse lets you finish your introduction before she looks up. Up close she has a thin white scar through one eyebrow and very steady hands.',
        '@say Ilse|D3. The Canal Quarter. I fixed pumps.',
        'That is apparently all you get. Then her eyes flick — briefly, precisely — to the base of your skull, where the implant site is still red.',
        '@say Ilse|Does it hurt yet? It will tonight. Like a tooth that\'s listening.',
        s.flags.sleeper
          ? 'She says it quietly. Then, almost too low to hear, as if to herself: *"Funny. They say the river remembers everything that goes into it."*'
          : 'She goes back to her boots.',
      ],
      choices: (s) =>
        s.flags.sleeper
          ? [
              { t: 'Hold her gaze. Answer, just as quietly: "So does the canal."', fx: { rel: { ilse: 25 }, res: 10, flag: { ilse_knows: true } }, go: 'p_barracks_ilse_sign' },
              { t: 'Pretend you didn\'t hear. Not here. Not yet.', fx: { rel: { ilse: -5 } }, go: 'bt_intro' },
            ]
          : [
              { t: '"Pumps. So you know the canals."', fx: { rel: { ilse: 5 } }, go: 'p_barracks_ilse_2' },
              { t: 'Leave her to it.', go: 'bt_intro' },
            ],
    },

    p_barracks_ilse_sign: {
      text: [
        'For half a second something in Ilse\'s face unlocks. Then it is gone, and she is just a recruit lacing her boots again.',
        '@say Ilse|Get some sleep, Stacks. Thirty doesn\'t like tired.',
        'She doesn\'t look at you again that night. But when the lights go off, you hear her say, very softly, from across the aisle: *"Not in the barracks. Never in the barracks."*',
      ],
      choices: [{ t: 'Lie back and listen to the implant hum.', go: 'bt_intro' }],
    },

    p_barracks_ilse_2: {
      text: [
        '@say Ilse|I know the canals. I know which locks leak and which basements flood when the dam opens. That\'s why they took me. Somebody has to know where people hide.',
        'She says it without any expression at all, and you can\'t decide if it\'s a confession or a joke.',
      ],
      choices: [{ t: 'Lights out.', go: 'bt_intro' }],
    },
  });
})();
