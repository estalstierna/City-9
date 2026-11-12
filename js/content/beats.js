/* STORY BEATS, PROMOTION EVALUATIONS, DIVISION SELECTION */
(function () {
  /* time: 'morning' fires before the duty board, 'evening' before evening choices. First match wins. */
  G.beats = [
    { id: 'audit', time: 'morning', when: (s) => s.susp >= 50, scene: 'b_audit' },
    { id: 'granite_warn', time: 'morning', when: (s) => s.susp >= 28 && s.day >= 2, scene: 'b_granite_warn' },
    { id: 'sociostatus', time: 'morning', when: (s) => s.day >= 5, scene: 'b_socio' },
    { id: 'offer', time: 'evening', when: (s) => s.res >= 50 && s.flags.res_task_done && !s.flags.res_task_failed && !s.flags.tinker_arrested && !s.flags.ilse_arrested, scene: 'b_offer' },
    { id: 'ilse', time: 'evening', when: (s) => s.day >= 2 && !s.flags.reported_cache && (s.flags.res_ally || s.flags.res_curious || s.flags.ilse_knows || s.flags.tinker_contact), scene: 'b_ilse' },
    { id: 'tomas', time: 'evening', when: (s) => s.day >= 3 && s.rel.tomas !== undefined, scene: 'b_tomas' },
    { id: 'rook', time: 'evening', when: (s) => s.day >= 4 && (s.rel.rook || 0) >= 15, scene: 'b_rook' },
  ];

  const contraband = (s) => s.items.filter((i) => G.ITEMS[i].contraband);

  G.addScenes({
    /* ------------------------------------------------- Granite's warning */
    b_granite_warn: {
      title: 'Squadron Leader\'s office',
      text: [
        'Before muster, Granite calls you into his office: a glass booth on the loading platform, a desk, a slate, a mug of something steaming through the mouth-grille of his mask.',
        '@say Granite|Sit. JURY sent a query about you. Routine, they said. JURY does not send routine queries to squadron leaders.',
        '@say Granite|I don\'t care what\'s in your head, five. I care that my squad works, and that the Magistrate doesn\'t come into my precinct. Tell me why he would.',
      ],
      choices: [
        { t: 'Give him a clean, confident explanation — training irregularities, nothing more.', check: { skill: 'deception', diff: 5, pass: 'b_granite_ok', fail: 'b_granite_bad' } },
        { t: '"I don\'t know, sir. But I\'ll give them nothing to find."', fx: { rel: { granite: 3 } }, go: 'b_granite_mid' },
        { t: 'Ask him what exactly they asked.', check: { skill: 'perception', diff: 10, pass: 'b_granite_read', fail: 'b_granite_mid' } },
      ],
    },
    b_granite_ok: {
      text: [
        'You lay it out: a nervous evaluation, a neighbour in the target block, a drill instructor who hates soft voices. By the time you finish, Granite is nodding slowly.',
        '@say Granite|Thirty writes everyone up. I\'ll tell JURY your squadron leader has no concerns. Make me right.',
      ],
      choices: [{ t: 'Muster.', fx: { susp: -10, rel: { granite: 8 } }, go: 'u_board' }],
    },
    b_granite_bad: {
      text: [
        'You start to explain. Granite holds up a hand after three sentences.',
        '@say Granite|Stop. You\'re rehearsed. Innocent people aren\'t rehearsed. I\'ll tell JURY I\'m watching you. That\'s the best you get.',
      ],
      choices: [{ t: 'Muster.', fx: { susp: 3, rel: { granite: -5 } }, go: 'u_board' }],
    },
    b_granite_mid: {
      text: ['Granite looks at you for a while through the steam.', '@say Granite|Then give them nothing. Dismissed.'],
      choices: [{ t: 'Muster.', fx: { susp: -3 }, go: 'u_board' }],
    },
    b_granite_read: {
      text: [
        'You watch how Granite holds the slate — tilted away, thumb over the text, but not quite. You catch three words upside down: *contacts*, *Canal*, *sister*.',
        '@say Granite|They asked who you talk to. That\'s all I\'ll say.',
        'It\'s enough. Now you know what they\'re watching.',
      ],
      choices: [{ t: 'Muster.', fx: { susp: -6, xp: { perception: 1 } }, go: 'u_board' }],
    },

    /* --------------------------------------------------------- JURY audit */
    b_audit: {
      title: 'Locker room — 05:50',
      text: (s) => [
        'You open your locker and the Magistrate is standing behind you. You didn\'t hear him come in. Two JURY units block the door.',
        '@say Magistrate|Protection Unit. Random audit. Stand by your locker. Hands where I can see them.',
        'One of the JURY units begins to search your locker. The other holds a scanner to the base of your skull — reading your biosignal as you breathe.',
        contraband(s).length ? `You are carrying contraband: **${contraband(s).map((i) => G.ITEMS[i].name).join(', ')}**. It is in your coat. Your coat is on the hook, eighty centimetres from the JURY unit\'s hand.` : 'There is nothing in your locker. You are almost sure there is nothing in your locker.',
        '@say Magistrate|Your file has been warming. I want to know why. Tell me about your week.',
      ],
      choices: (s) => [
        {
          t: 'Get rid of the contraband while the JURY unit searches the top shelf.',
          if: (s) => contraband(s).length > 0,
          check: { skill: 'deception', diff: 20, pass: 'b_audit_ditch', fail: 'b_audit_found' },
        },
        { t: 'Talk. Calm, plausible, boring.', check: { skill: 'deception', diff: 10, pass: 'b_audit_ok', fail: 'b_audit_bad' } },
        { t: 'Recite your duties and your merits. Let the record speak.', check: { skill: 'authority', diff: 0, pass: 'b_audit_ok', fail: 'b_audit_bad' } },
        { t: 'Give him something. A name. Anyone\'s.', tag: 'INFORM', tagCls: 'loyal', go: 'b_audit_inform' },
      ],
    },
    b_audit_ditch: {
      text: (s) => [
        'You shift your weight as the JURY unit reaches up, and your shoulder brushes your coat on its hook. When the coat settles, the pocket is empty. What was in it is now inside the drain grille under the bench, where the shower water runs.',
        'The scanner on your skull doesn\'t chirp. Your heart rate stays flat. Thank whatever you believe in for training.',
      ],
      choices: [{ t: 'Answer his questions.', fx: (s) => ({ take: contraband(s), susp: -5 }), go: 'b_audit_ok' }],
    },
    b_audit_found: {
      text: (s) => [
        'You shift your weight toward your coat. The JURY unit\'s hand is already there. He pulls the coat off the hook and turns out the pocket.',
        `**${contraband(s).map((i) => G.ITEMS[i].name).join(', ')}.**`,
        'The Magistrate takes it from him between two fingers and looks at it for a long time.',
        '@say Magistrate|Well. Now we have something to talk about.',
      ],
      choices: [{ t: 'Say nothing.', fx: (s) => ({ take: contraband(s), susp: 30, lp: -10, merit: -5 }), go: 'b_audit_bad' }],
    },
    b_audit_ok: {
      text: [
        'You tell him about your week. Ration lines. Checkpoints. A blind man at Loyalty Hour. You tell it dull. Dull is safety.',
        'The Magistrate listens without moving. When you finish, he nods to the units. They step back from the door.',
        '@say Magistrate|Your biosignal is very steady. Steady is either innocence or training. I will come back to find out which.',
        'He leaves. You stand at your locker for a long time before you can trust your hands to put on the mask.',
      ],
      choices: [{ t: 'Muster.', fx: { susp: -20, xp: { deception: 1 } }, go: 'u_board' }],
    },
    b_audit_bad: {
      text: [
        'You talk. Your voice is fine. Your heart is not. The scanner at the base of your skull chirps once, twice, and the Magistrate tilts his head at each chirp the way a bird does at a sound in the grass.',
        '@say Magistrate|Thank you. Your file has been updated.',
        'He leaves. Granite watches you come out onto the muster floor and doesn\'t say anything. Nobody on the squad sits next to you at lunch.',
      ],
      choices: [{ t: 'Muster.', fx: { susp: 10, lp: -4 }, go: 'u_board' }],
    },
    b_audit_inform: {
      text: (s) => {
        const target = s.flags.tomas_ally || s.flags.tomas_debt ? 'Tomas' : !s.flags.tinker_arrested && (s.flags.know_tinker || s.flags.tinker_contact) ? 'the Tinker' : 'Rook';
        s.mem.informTarget = target;
        return [
          `You give him ${target}. You do it in a calm voice, with details, the way the manual says a report should be made.`,
          '@say Magistrate|Ah. A cooperative unit. How refreshing.',
          'He makes a note. He leaves. You will find out later what that note cost.',
        ];
      },
      choices: [
        {
          t: 'Muster.',
          fx: (s) => {
            const t = s.mem.informTarget;
            const e = { susp: -25, lp: 6, merit: 3, cons: -15 };
            if (t === 'Tomas') Object.assign(e, { flag: { tomas_gone: true }, rel: { tomas: -100 } });
            if (t === 'the Tinker') Object.assign(e, { flag: { tinker_arrested: true }, res: -40 });
            if (t === 'Rook') Object.assign(e, { rel: { rook: -40 }, flag: { rook_audited: true } });
            return e;
          },
          go: 'u_board',
        },
      ],
    },

    /* --------------------------------------------------------- sociostatus */
    b_socio: {
      title: 'Sociostatus — District 2',
      enter: (s) => G.unlock(s, 'overwatch'),
      text: [
        'The siren starts at 04:12. Not the shift siren. The long, rising, two-tone wail you have only heard on recordings.',
        '@dispatch Attention, all units. Sociostatus declared, District 2. Anticitizen detonation at the ration-packing plant. Overwatch assumes command. All Civil Protection units in D2 and D5 will comply with Overwatch directives. Repeat: Overwatch assumes command.',
        'By 05:00 you are standing in the rubble-strewn yard of the Works with the rest of the squad. The packing plant is a black shell. Fire crews spray water on something that is still burning. Somewhere under the steel there are bodies.',
        'An Overwatch squad leader — a tall soldier with a white-painted shoulder plate — addresses Granite as though Granite were a junior private.',
        '@say Overwatch|Civil Protection will clear residential block 2-11. All occupants to the yard for processing. Resistance will be met with full force. Execute.',
        'Block 2-11 is where the mill workers live. Tomas grew up there. Mira\'s friend Katya lives there.',
      ],
      choices: [
        { t: 'Execute the order. Kick doors. Fast and hard.', tag: 'COMPLY', tagCls: 'loyal', fx: { merit: 5, lp: 4, cons: -8 }, go: 'b_socio_hard' },
        { t: 'Execute the order — but be the unit who takes the stairs slowly and says *please*.', check: { skill: 'authority', diff: 5, pass: 'b_socio_soft', fail: 'b_socio_hard' } },
        { t: 'Warn the block through the stairwell before Overwatch moves in.', tag: 'RISK', tagCls: 'risk', check: { skill: 'deception', diff: 15, pass: 'b_socio_warn', fail: 'b_socio_warn_bad' } },
      ],
    },
    b_socio_hard: {
      text: [
        'You go through block 2-11 floor by floor. Doors splinter. Citizens come out with their hands on their heads in nightclothes and bare feet. An old man won\'t stand up, so you lift him, and he weighs nothing at all.',
        'In the yard, Overwatch sorts them into two lines. You don\'t know what the lines mean. One of them goes onto a truck.',
        '@say Granite|Good work. Don\'t think about the lines. The lines are not our department.',
      ],
      choices: [{ t: 'Back to the precinct.', fx: { hp: -5 }, go: 'u_board' }],
    },
    b_socio_soft: {
      text: [
        'You take the third floor. You knock first — once, loud — and say the words: *Civil Protection. Open the door. Hands where I can see them. No one gets hurt.* Most of them open. Those who don\'t, you open gently.',
        'In the yard, Overwatch sorts them into two lines. Everyone from your floor walks there on their own feet.',
        'An Overwatch soldier watches you work and clicks something into its radio. You don\'t know if it is approval.',
      ],
      choices: [{ t: 'Back to the precinct.', fx: { merit: 4, cons: 2, xp: { authority: 1 } }, go: 'u_board' }],
    },
    b_socio_warn: {
      text: [
        'You go in ahead of the squad on the pretext of checking the stairwell. On every landing you bang on the walls and say, low and fast through the mask: *They\'re coming. Back stairs. Now.*',
        'By the time the squad reaches the fourth floor, half the apartments are empty, back windows open onto the fire escapes. Overwatch finds forty fewer citizens than the register says.',
        '@say Granite|Forty missing. Somebody tipped them. *Somebody.*',
        'He looks at every unit in the squad the same way. Including you.',
      ],
      choices: [{ t: 'Back to the precinct.', fx: { merit: 1, cons: 8, res: 15, susp: 8 }, go: 'u_board' }],
    },
    b_socio_warn_bad: {
      text: [
        'You start up the stairwell to warn them. On the second landing you turn a corner and there is an Overwatch soldier there already, its lens glowing, watching you bang on a door.',
        '@say Overwatch|Civil Protection unit. Explain action.',
        'You explain. Badly. It records everything you say.',
      ],
      choices: [{ t: 'Back to the precinct.', fx: { susp: 20, lp: -5, merit: -2 }, go: 'u_board' }],
    },

    /* ----------------------------------------------------------- Ilse */
    b_ilse: {
      title: 'Canal Quarter — the old pump house',
      text: (s) => [
        'A note in your locker, no signature, in neat block letters: *PUMP HOUSE 4. 20:00. COME AS A CITIZEN.*',
        'Pump House 4 stands at the end of a towpath in D3, half its windows boarded, its great iron wheel rusted solid. Inside it is dark and smells of river. Ilse is sitting on the wheel housing, out of uniform, her boots dangling.',
        s.flags.ilse_threatened ? '@say Ilse|You threatened me in training. I know. I\'m giving you a second chance. People don\'t usually get one.' : '@say Ilse|You came. Good. I thought you might be the type who doesn\'t.',
        '@say Ilse|Here\'s the thing. Next time you\'re on Canal Gate 3, a woman will come through. Red headscarf. Basket of laundry. Under the laundry is coagulant for a man who got shot in your old neighbour\'s apartment. The scanner will flag the basket. You won\'t.',
        '@say Ilse|That\'s it. That\'s all. One basket.',
      ],
      choices: [
        { t: '"One basket. I\'ll do it."', fx: { res: 10, rel: { ilse: 15 }, flag: { res_task: true } }, go: 'b_ilse_yes' },
        { t: '"Not yet. Not while JURY is watching me."', fx: { rel: { ilse: -5 }, flag: { res_declined: true } }, go: 'b_ilse_no' },
        { t: 'Arrest her. Right here. She\'s unarmed and alone.', tag: 'BETRAY', tagCls: 'loyal', check: { skill: 'melee', diff: 15, pass: 'b_ilse_arrest', fail: 'b_ilse_arrest_bad' } },
      ],
    },
    b_ilse_yes: {
      text: [
        'Ilse nods once, slides off the wheel housing and walks past you to the door.',
        '@say Ilse|The man who was shot. He was hiding at Halloran\'s for two days. Halloran stitched him with fishing line. You should know that. In case you were wondering what kind of man you were sent to apply.',
        'She goes. You stand in the dark with the river talking under the floor.',
        '@sys Take Checkpoint duty when it appears on the board to complete Ilse\'s request.',
      ],
      choices: [{ t: 'Walk home.', go: 'u_night' }],
    },
    b_ilse_no: {
      text: [
        '@say Ilse|Fair. Smart, even. They don\'t come to the ones who wait.',
        '@say Ilse|But don\'t wait too long, Stacks. Waiting is a choice too. It just doesn\'t feel like one.',
      ],
      choices: [{ t: 'Walk home.', go: 'u_night' }],
    },
    b_ilse_arrest: {
      text: [
        'You move. She\'s fast — faster than you — but she\'s sitting, and you are already on her. You pull her off the wheel housing and pin her face-down on the wet concrete with your knee in her back, and she doesn\'t fight after that. She just laughs into the floor, very quietly.',
        '@say Ilse|Watch the feet. Not the stick. You learned that, at least.',
        'JURY takes her that night. The Tinker\'s stall is empty by morning. Granite puts your designation forward for a commendation.',
      ],
      choices: [{ t: 'Continue.', fx: { merit: 12, lp: 10, cons: -20, res: -100, rel: { ilse: -100 }, flag: { ilse_arrested: true, tinker_arrested: true } }, go: 'u_night' }],
    },
    b_ilse_arrest_bad: {
      text: [
        'You lunge. She isn\'t there. Something hits the back of your knee and the floor comes up very fast, and when you roll over Ilse is in the doorway with a length of pipe in her hand.',
        '@say Ilse|Pity.',
        'She\'s gone into the dark of the towpath. You report it. JURY searches D3 for a week. They never find her. The next day, her designation is listed as *DESERTED*.',
      ],
      choices: [{ t: 'Continue.', fx: { hp: -15, merit: 4, res: -100, rel: { ilse: -100 }, flag: { ilse_gone: true } }, go: 'u_night' }],
    },

    /* ----------------------------------------------------------- Tomas */
    b_tomas: {
      title: 'Precinct stores — 23:30',
      text: (s) => [
        'Tomas finds you in the corridor after lights-out. He is out of uniform and sweating.',
        '@say Tomas|HELIX dropped my ma. "Deprioritised." One visit, then nothing. There\'s half the dye floor coughing like her now. And there\'s a crate of respiratory serum in our stores that nobody\'s counted since winter. I checked.',
        '@say Tomas|I\'m taking it. Tonight. Ten minutes. I just need someone at the end of the corridor who can say "all clear" if the duty officer comes by.',
        s.flags.tomas_ally ? '@say Tomas|You said. In training. You said if I needed someone to watch the door.' : '@say Tomas|I know I\'ve got no right to ask.',
      ],
      choices: [
        { t: 'Watch the corridor for him.', check: { skill: 'deception', diff: 5, pass: 'b_tomas_ok', fail: 'b_tomas_caught' } },
        { t: '"No. And you\'re not doing it either. Go to bed, Tomas."', check: { skill: 'authority', diff: 5, pass: 'b_tomas_talked', fail: 'b_tomas_alone' } },
        { t: 'Report him to the duty officer.', tag: 'REPORT', tagCls: 'loyal', go: 'b_tomas_report' },
      ],
    },
    b_tomas_ok: {
      text: [
        'You stand at the end of the corridor with a cup of sector water, the picture of a unit who can\'t sleep. At 23:41 the duty officer comes round the corner. You ask him about the shift roster for Thursday. He talks for four minutes about how nobody ever reads the roster.',
        'Behind him, Tomas slips out of the stores with a crate under his coat.',
        'A week later, the dye floor stops coughing quite so much. Tomas never mentions it. He doesn\'t have to.',
      ],
      choices: [{ t: 'Bed.', fx: { rel: { tomas: 30 }, cons: 6, susp: 4, flag: { tomas_debt: true } }, go: 'u_night' }],
    },
    b_tomas_caught: {
      text: [
        'The duty officer comes from the other end of the corridor — the end you weren\'t watching. He finds Tomas with the crate. He finds you thirty metres away, *keeping watch*.',
        'Tomas takes all of it. He tells them you were just there, that you didn\'t know, that you were asleep on your feet. They half believe him.',
        'Tomas is transferred out of D5 the next morning to a labour detail in the Outlands. He doesn\'t get to say goodbye.',
      ],
      choices: [{ t: 'Continue.', fx: { susp: 10, merit: -3, cons: 3, rel: { tomas: 10 }, flag: { tomas_gone: true } }, go: 'u_night' }],
    },
    b_tomas_talked: {
      text: [
        'You put your hand flat on his chest. You tell him what level 4 looks like. You tell him what happens to his mother if he goes there. You tell him you\'ll find another way — HELIX, an appeal, anything.',
        'He sags. He goes to bed. You aren\'t sure whether you saved him or just postponed it.',
      ],
      choices: [{ t: 'Bed.', fx: { rel: { tomas: -5 }, lp: 1 }, go: 'u_night' }],
    },
    b_tomas_alone: {
      text: [
        'He looks at you for a long moment, and then he goes anyway.',
        'Nobody catches him. In the morning the crate is gone and the inventory clerk logs it as *spoilage, water damage*. Tomas won\'t meet your eyes for a week.',
      ],
      choices: [{ t: 'Continue.', fx: { rel: { tomas: -15 } }, go: 'u_night' }],
    },
    b_tomas_report: {
      text: [
        'You walk to the duty officer\'s desk and tell him. Your voice doesn\'t shake at all, which frightens you more than anything else that has happened since you put on the mask.',
        'They catch Tomas with the crate in his arms. He looks past the duty officer straight at you. He doesn\'t say anything.',
        'He is transferred to an Outlands labour detail by morning. His mother dies three weeks later. You find out from a mill notice. Nobody tells you directly.',
      ],
      choices: [{ t: 'Continue.', fx: { merit: 6, lp: 6, cons: -18, rel: { tomas: -100 }, flag: { tomas_gone: true } }, go: 'u_night' }],
    },

    /* ------------------------------------------------------------ Rook */
    b_rook: {
      title: 'Precinct roof',
      text: [
        'Rook is on the precinct roof with his mask pushed up on his forehead, smoking a real cigarette. It\'s the first time you have seen his face: older than you expected, a long jaw, a scar through one eyebrow that matches the crack in his lens.',
        '@say Rook|Don\'t tell anyone you saw this. Sit.',
        '@say Rook|First week, I had a partner. Kid called Feliks. Good kid. Soft. A citizen stabbed him with a screwdriver in a ration line because Feliks turned his back to help an old woman pick up her packet. I keep thinking: if he\'d been harder, he\'d be alive. And then I think: if he\'d been harder, would it have mattered whether he was alive?',
        'He offers you the cigarette.',
        '@say Rook|You remind me of him a bit. That\'s not a compliment. Look after yourself, five.',
      ],
      choices: [
        { t: 'Take the cigarette. Tell him something true about yourself.', fx: { rel: { rook: 15 }, cons: 2, xp: { perception: 1 } }, go: 'u_night' },
        { t: '"Feliks was weak. I won\'t be."', fx: { rel: { rook: -5 }, cons: -3, xp: { authority: 1 } }, go: 'u_night' },
      ],
    },

    /* ---------------------------------------------- resistance's offer */
    b_offer: {
      title: 'The Tinker\'s back room',
      checkpoint: true,
      text: (s) => [
        'A radio at the Tinker\'s stall that you never brought in for repair has your name on its tag. You pick it up in plain clothes. The Tinker leads you behind the stall, through a curtain, into a room the size of a wardrobe stacked to the ceiling with radio parts. Ilse is there.',
        '@say Tinker|JURY has your name on a list. Not the bad list. Not yet. The list before the bad list. We think you have a month.',
        '@say Ilse|So. Choices. You can come out with us. Tonight, through the spillway tunnels. We cut your biosignal and you vanish. Or you stay — you keep the mask on, you keep being boring, you become the best thing we have inside the precinct. Until they find you.',
        s.rel.mira >= 50 || s.flags.mira_rebel ? '@say Ilse|And your sister can come. If she wants. She\'s been asking about you.' : null,
        'The Tinker sets a pair of side-cutters on the table between you. For the implant, you realise.',
      ],
      choices: (s) => [
        { t: 'Go. Tonight. Take Mira.', if: (s) => s.rel.mira >= 50 || s.flags.mira_rebel, fx: { flag: { mira_with_you: true } }, go: 'end_defect' },
        { t: 'Go. Tonight. Alone.', go: 'end_defect' },
        { t: 'Stay inside. Become their eyes in the precinct.', fx: { res: 15, flag: { mole: true } }, go: 'b_offer_stay' },
        { t: 'Excuse yourself. Walk to the precinct. Call JURY.', tag: 'BETRAY', tagCls: 'loyal', fx: { merit: 20, lp: 15, cons: -30, res: -100, flag: { betrayed_cell: true, tinker_arrested: true, ilse_arrested: true } }, go: 'b_offer_betray' },
      ],
    },
    b_offer_stay: {
      text: [
        'Ilse looks at you for a long moment. Then she does something you have never seen her do: she smiles.',
        '@say Ilse|Then we\'re both mad. Good. The Tinker will fix your radio when we need you.',
        '@say Tinker|Stay boring. Stay alive. And when they promote you — let them. A higher mask sees more.',
        '@sys You are now an inside agent for the City 9 resistance. Keep your suspicion low and rise through the ranks.',
      ],
      choices: [{ t: 'Walk back to the precinct as if nothing happened.', go: 'u_night' }],
    },
    b_offer_betray: {
      text: [
        'You tell them you need to think. You walk out through the curtain, past the stall, down Bazaar Row. You walk straight into the precinct and up to the duty officer and you say it.',
        'JURY moves within the hour. They take the Tinker at his bench. They take Ilse on the towpath. They find the spillway tunnels and fill them with gas.',
        'At muster the next morning Granite reads your designation aloud before the whole squadron. There is a commendation. There is applause, filtered through twenty masks.',
        'In the locker room, afterwards, you take out Mira\'s drawing, if you still have it, and look at the empty sky she drew for a long time.',
      ],
      choices: [{ t: 'Continue.', go: 'u_night' }],
    },

    /* ======================================================= 04 EXAM */
    exam_04: {
      checkpoint: true,
      title: 'Field evaluation — grade 04',
      enter: (s) => {
        s.mem.ex = 0;
      },
      text: (s) => [
        '@say Granite|You want your 04. Fine. Thursday\'s ration truck through the Canal Quarter. Intelligence says a cell is going to hit it at the lock bridge.',
        s.flags.truck_intel ? 'Intelligence, you realise, is *you* — the detainee on the bridge, the crowbar, the map. Your report made it all the way up.' : 'He doesn\'t say where the intelligence came from. He never does.',
        '@say Granite|You\'re on the truck. Four units, one driver, three hundred ration packs. You command the escort. If the truck arrives, you get your stripe. If it doesn\'t — then we\'ll talk about whether you get another chance.',
      ],
      choices: [
        { t: 'Plan the route. Study the lock bridge on the district map.', check: { skill: 'perception', diff: 0, pass: 'exam_04_b', fail: 'exam_04_b', okFx: (s) => ((s.mem.ex += 1), null) } },
        { t: 'Arrange a relay with Dispatch so backup can be there in ninety seconds.', check: { skill: 'comms', diff: 0, pass: 'exam_04_b', fail: 'exam_04_b', okFx: (s) => ((s.mem.ex += 1), { flag: { ex_backup: true } }) } },
      ],
    },
    exam_04_b: {
      title: 'The lock bridge',
      text: (s) => [
        'Thursday. 06:30. Fog on the canals, thick as wet wool. The truck grinds through the Canal Quarter at walking pace with you on the running board and three units in the back with the ration crates.',
        'At the lock bridge the fog is so heavy you can\'t see the far side. The lock gates are closed. They shouldn\'t be closed.',
        s.mem.ex > 0 ? 'You studied this. There\'s a pump house on the left bank with a clear line of sight to the bridge, and the lock-keeper\'s hut on the right. If you were going to ambush a truck, you would use both.' : 'You stop the truck. You don\'t like it, but you can\'t say why.',
      ],
      choices: [
        { t: 'Push through. Ram the gate if you have to.', check: { skill: 'fitness', diff: 10, pass: 'exam_04_c', fail: 'exam_04_c_hurt', okFx: (s) => ((s.mem.ex += 1), null) } },
        { t: 'Deploy the units. Clear the pump house and hut before the truck moves.', check: { skill: 'firearms', diff: 5, pass: 'exam_04_c', fail: 'exam_04_c_hurt', okFx: (s) => ((s.mem.ex += 2), null) } },
        { t: 'Call it in and hold position until backup arrives.', if: (s) => s.flags.ex_backup, fx: (s) => ((s.mem.ex += 1), null), go: 'exam_04_c' },
      ],
    },
    exam_04_c_hurt: {
      text: [
        'The first shot comes out of the fog and shatters the truck\'s windscreen. The driver slumps. You return fire at muzzle flashes you can\'t see, and something hot rips across your upper arm.',
        'It lasts ninety seconds. When it\'s over, the cell is gone into the fog, the driver is wounded and half the crates are gone. But the truck is still yours.',
      ],
      choices: [{ t: 'Check the bodies.', fx: { hp: -20 }, go: 'exam_04_d' }],
    },
    exam_04_c: {
      text: [
        'It works. The ambushers are caught in the open between the pump house and the bridge. There are five of them, armed with pipe guns and one real rifle. Two surrender. Two run. One goes down and doesn\'t get up.',
        'The truck crosses the lock bridge intact. Not a single crate lost.',
      ],
      choices: [{ t: 'Check the wounded.', go: 'exam_04_d' }],
    },
    exam_04_d: {
      text: (s) => [
        'One of the rebels lies against the lock wall, holding her stomach. A girl. Mill overalls. Seventeen, eighteen.',
        'You know her. **Katya**, from Stack 9. Mira\'s friend. She used to sleep over on your floor in the winter when her block\'s heating failed. She recognises your voice through the mask before you recognise her face.',
        '@say Katya|...It\'s you. Oh, God. Mira said you\'d gone over. I didn\'t believe her.',
        'Your three units are watching. Granite is going to read the report.',
      ],
      choices: [
        { t: 'Treat her wound and take her into custody. By the book, but alive.', check: { skill: 'medical', diff: 5, pass: 'exam_04_save', fail: 'exam_04_lose' } },
        { t: 'Cuff her. She\'s JURY\'s problem now.', fx: (s) => ((s.mem.ex += 1), { lp: 3, cons: -6, rel: { mira: -15 } }), go: 'exam_04_end' },
        { t: 'Send your units after the runners. Then tell Katya to crawl into the lock culvert and stay there.', tag: 'MERCY', tagCls: 'mercy', check: { skill: 'deception', diff: 15, pass: 'exam_04_free', fail: 'exam_04_free_bad' } },
      ],
    },
    exam_04_save: {
      text: [
        'You pack her wound with gel and keep pressure on it while the van comes. She holds your wrist the whole time. When they load her in she\'s still conscious.',
        'Later — much later — you hear JURY released her to a labour detail instead of level 4, because a unit\'s report said she had surrendered and cooperated. You wrote that report.',
      ],
      choices: [{ t: 'Return to the precinct.', fx: (s) => ((s.mem.ex += 1), { cons: 4, xp: { medical: 1 }, rel: { mira: 5 } }), go: 'exam_04_end' }],
    },
    exam_04_lose: {
      text: ['You do everything you know. It isn\'t enough. Katya dies against the lock wall with your hands on her stomach, looking at your lenses as though trying to find your eyes behind them.'],
      choices: [{ t: 'Return to the precinct.', fx: { cons: -4, rel: { mira: -20 } }, go: 'exam_04_end' }],
    },
    exam_04_free: {
      text: [
        'You send the units after the runners with a sharp order and a pointed arm. The moment they\'re gone into the fog you crouch beside Katya.',
        '@say You|Culvert. Under the lock. Stay there till dark. Then go to the Tinker on Bazaar Row and tell him the river remembers.',
        'She stares at you. Then she crawls, leaving a smear on the stones, and disappears into the black mouth of the culvert.',
        'In your report she is listed as *fled, presumed drowned*.',
      ],
      choices: [{ t: 'Return to the precinct.', fx: { cons: 10, res: 15, susp: 6, rel: { mira: 15 } }, go: 'exam_04_end' }],
    },
    exam_04_free_bad: {
      text: [
        'You send the units away. One of them doesn\'t go. He stands in the fog and watches you crouch beside the wounded rebel and point at the culvert.',
        '@say 04 unit|...Sir?',
        'You order him to cuff her. He does. He also writes his own report.',
      ],
      choices: [{ t: 'Return to the precinct.', fx: { susp: 15, rel: { mira: -5 } }, go: 'exam_04_end' }],
    },
    exam_04_end: {
      enter: (s) => {
        s.mem.exPassed = s.mem.ex >= 2;
        if (s.mem.exPassed) {
          G.promote(s, '04');
          s.flags.passed_04 = true;
          G.fx(s, { merit: 5, lp: 2 });
        } else {
          s.merit = Math.max(0, s.merit - 10);
          G.note('EVALUATION FAILED — MERIT −10', 'neg');
        }
      },
      title: 'Granite\'s office',
      text: (s) =>
        s.mem.exPassed
          ? [
              'Granite reads your report twice. Then he takes a stencil and a can of white paint from his drawer, and paints a second stripe on the shoulder plate of your armour himself, with surprising care.',
              '@say Granite|04. The truck arrived. That\'s all the Union will remember. You\'ll remember the rest. Everybody does.',
              `@doc PROMOTION: ${G.desig(s)}`,
              '@sys Next evaluation: grade 03, which unlocks transfer to the other divisions.',
            ]
          : [
              'Granite reads your report and sets it down.',
              '@say Granite|The truck arrived. Barely. I\'ve seen better from fives with a week on the street. Earn it again. Then ask me again.',
            ],
      choices: [{ t: 'Evening.', go: 'u_duty_end' }],
    },

    /* ======================================================= 03 EXAM */
    exam_03: {
      checkpoint: true,
      title: 'Field evaluation — grade 03',
      enter: (s) => {
        s.mem.ex = 0;
      },
      text: [
        '@say Granite|03. The last rung before you get to choose your own life. The relay antenna on top of Stack 1 feeds every broadcast screen in District 5. Dispatch has intercepted chatter — tonight, someone means to bring it down.',
        '@say Granite|You command the hardpoint. Six units. Overwatch has been informed and has declined to assist, because Overwatch considers a broadcast antenna beneath its notice. Prove them right.',
        'The roof of Stack 1 is a forest of steel: the antenna mast, cable trunks, a single stairwell door, and the gulf of the Stacks on every side. Wind like knives.',
      ],
      choices: [
        { t: 'Lock the stairwell and put your best shots on the parapet.', check: { skill: 'firearms', diff: 10, pass: 'exam_03_b', fail: 'exam_03_b', okFx: (s) => ((s.mem.ex += 1), null) } },
        { t: 'Read the rooftops around you. Where would *you* come from?', check: { skill: 'perception', diff: 10, pass: 'exam_03_b', fail: 'exam_03_b', okFx: (s) => ((s.mem.ex += 1), { flag: { ex_read: true } }) } },
        { t: 'Rehearse the squad on signals until every unit knows their sector cold.', check: { skill: 'authority', diff: 10, pass: 'exam_03_b', fail: 'exam_03_b', okFx: (s) => ((s.mem.ex += 1), null) } },
      ],
    },
    exam_03_b: {
      text: (s) => [
        'They come at 02:20, not up the stairwell but across a plank laid from the roof of Stack 2, six metres of darkness and nothing beneath. Four figures with satchels.',
        s.flags.ex_read ? 'You saw this coming. A unit is already waiting at the parapet where the plank lands.' : 'The first one is across before anybody sees him.',
        s.flags.mole ? 'And you realise — with a cold drop in your stomach — that one of the figures moves like Ilse. Watch the feet.' : 'Satchel charges. If one reaches the mast, the district goes dark.',
      ],
      choices: (s) => [
        { t: 'Shoot the plank out from under them.', check: { skill: 'firearms', diff: 10, pass: 'exam_03_win', fail: 'exam_03_fight', okFx: (s) => ((s.mem.ex += 2), { cons: -4 }) } },
        { t: 'Close and take them hand to hand before the charges are set.', check: { skill: 'melee', diff: 10, pass: 'exam_03_win', fail: 'exam_03_fight', okFx: (s) => ((s.mem.ex += 2), null) } },
        {
          t: 'Order your units to the wrong parapet. Let the cell set the charges and get away. You\'ll take the failure.',
          if: (s) => s.flags.mole,
          tag: 'RESISTANCE',
          tagCls: 'mercy',
          fx: { res: 20, susp: 12 },
          go: 'exam_03_sabotage',
        },
      ],
    },
    exam_03_fight: {
      text: [
        'It turns into a brawl in the dark among the cable trunks. Someone sets a charge; one of your units tears it off the mast and throws it into the void, where it goes off with a bang that rattles every window in the Stacks. Someone stabs you through the gap under your arm plate.',
        'When it\'s over, the antenna stands. Barely. Two units hurt, one rebel dead, three gone.',
      ],
      choices: [{ t: 'Report.', fx: (s) => ((s.mem.ex += 1), { hp: -25 }), go: 'exam_03_end' }],
    },
    exam_03_win: {
      text: [
        'It\'s over in under a minute. The cell never reaches the mast. The satchel charges are recovered intact, labelled with mill dye. In the morning the broadcast screens of District 5 light up at 06:00 exactly, and the Administrator tells forty thousand citizens that the night was peaceful.',
      ],
      choices: [{ t: 'Report.', go: 'exam_03_end' }],
    },
    exam_03_sabotage: {
      text: [
        'You send your squad to the eastern parapet with a sharp, confident order. The cell crosses on the west. Thirty seconds later the satchels go off against the mast and the antenna folds over like a dead flower, and District 5\'s screens go black for the first time since the Seven Hour War.',
        'From the Stacks below comes a sound you have never heard in this city: people cheering, from open windows, in the dark.',
        'Granite will never be able to prove anything. He will also never forget it.',
      ],
      choices: [{ t: 'Report.', go: 'exam_03_end' }],
    },
    exam_03_end: {
      enter: (s) => {
        s.mem.exPassed = s.mem.ex >= 2;
        if (s.mem.exPassed) {
          G.promote(s, '03');
          s.flags.passed_03 = true;
          G.fx(s, { merit: 8, lp: 3 });
        } else {
          s.merit = Math.max(0, s.merit - 15);
          G.note('EVALUATION FAILED — MERIT −15', 'neg');
        }
      },
      title: 'Granite\'s office',
      text: (s) =>
        s.mem.exPassed
          ? [
              '@say Granite|03. You\'re past the point where the street can kill you by accident. From here it will have to do it on purpose.',
              '@say Granite|Transfer applications are open to you. HELIX, JURY, RAZOR, SPEAR. Or you stay with me. I won\'t pretend I don\'t want you to stay.',
              `@doc PROMOTION: ${G.desig(s)}`,
            ]
          : ['@say Granite|The antenna is a smoking stick of metal and you want a stripe? Earn it again. Then ask.'],
      choices: (s) => [{ t: s.mem.exPassed ? 'Consider your future.' : 'Evening.', go: s.mem.exPassed ? 'div_select' : 'u_duty_end' }],
    },

    /* ================================================== DIVISION SELECT */
    div_select: {
      title: 'Transfer application',
      enter: (s) => G.unlock(s, 'divisions'),
      text: [
        'The transfer application is a single sheet on Granite\'s desk. Five boxes. One signature line.',
        '@img assets/img/emblems.jpg|Division emblems of the Combine Civil Authority',
        '@sys Choose your division. Each has requirements, built from the skills and record you earned. (Each division\'s storyline continues in the next chapter.)',
      ],
      choices: [
        { t: '**UNION** — stay with Granite and the D5 squadron. The street is what you know.', fx: (s) => ((s.div = 'UNION'), null), go: 'ch1_end' },
        { t: '**HELIX** — the white band. Keep units alive. See the Nexus from beneath.', lock: (s) => (s.skills.medical < 3 ? 'Requires Field Medicine 3' : null), fx: (s) => ((s.div = 'HELIX'), null), go: 'ch1_end' },
        { t: '**JURY** — the crimson band. Detention, interrogation, and the policing of your own.', lock: (s) => (s.skills.authority < 3 ? 'Requires Authority 3' : s.lp < 10 ? 'Requires Loyalty rating +10' : null), fx: (s) => ((s.div = 'JURY'), null), go: 'ch1_end' },
        { t: '**RAZOR** — protect the VIPs and the Hardpoints. Stand beside the Administrator.', lock: (s) => (s.skills.firearms < 3 ? 'Requires Firearms 3' : s.lp < 15 ? 'Requires Loyalty rating +15' : null), fx: (s) => ((s.div = 'RAZOR'), null), go: 'ch1_end' },
        { t: '**SPEAR** — the offensive division. Cleared for the 404 zones beyond the canal.', lock: (s) => (s.skills.firearms < 3 ? 'Requires Firearms 3' : s.skills.fitness < 3 ? 'Requires Conditioning 3' : null), fx: (s) => ((s.div = 'SPEAR'), null), go: 'ch1_end' },
      ],
    },
    ch1_end: {
      checkpoint: true,
      title: 'End of Chapter One',
      text: (s) => {
        const lines = {
          UNION: 'You stay. Granite paints your third stripe and says nothing, which is how you know he is pleased.',
          HELIX: 'The HELIX instructor — 02-77301 — signs your transfer herself. "I asked for your file in training," she says. "I hoped I would see it again."',
          JURY: 'The Magistrate receives your application personally. "I wondered when," he says. "Welcome to the division that watches the watchers."',
          RAZOR: 'RAZOR issues you a gold armband and a mask with a gold-banded lens. Your first assignment is a hardpoint beneath the Citadel spire.',
          SPEAR: 'SPEAR\'s Division Leader looks you over and says only: "Beyond the canal, nothing is quarantined. Everything is just *waiting*."',
        };
        return [
          `@img assets/img/uniform-${s.div.toLowerCase()}.jpg|${s.div} — your new uniform`,
          lines[s.div],
          `@doc ${G.desig(s)}\nDIVISION: ${s.div}\nRANK: ${G.RANK_NAMES[s.rank].toUpperCase()}\nDAYS IN SERVICE: ${s.day}`,
          s.flags.mole ? 'And somewhere on Bazaar Row, a repairman with burned fingertips hears that a certain 03 has a new posting, and smiles over his soldering iron.' : null,
          s.flags.betrayed_cell ? 'The spillway tunnels are sealed with concrete now. Mira does not come to the door any more.' : null,
          '@sys CHAPTER ONE COMPLETE. You can keep serving on the duty board. The division storylines, the OA and higher ranks are coming in the next chapter.',
        ];
      },
      choices: [{ t: 'Return to duty.', go: 'u_duty_end' }],
    },
  });
})();
