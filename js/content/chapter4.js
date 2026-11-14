/* CHAPTER FOUR — "Sixty Grams". All divisions, one grade up.
   City 17 is draining the Union's cities: units, rations, attention. City 9 gets a
   "productivity adjustment": sixty grams less per citizen per day. Vigil must send reserves to
   City 17 and every team lead names one of their own. The canal cells plan to empty the D2
   packing-plant warehouse on ration day, while Plaza 5 is full. District stability decides how
   hot the plaza is; the crowd-control minigame is the day itself; your team is who stands with you.
   (Still no name and no face from City 17. Only the requests, and a letter.) */
(function () {
  const pick = G.pick;
  const C = (s) => s.c4;
  const sup = (s) => (G.superiorOf ? G.superiorOf(s).name : 'Granite');
  const team = (s) => (s.squad && s.squad.formed ? G.squadActive(s) : []);
  const nm = (m) => m.name.replace(/"/g, '');

  const contact = (s) => {
    if (s.flags.ilse_arrested || s.flags.betrayed_cell) return s.flags.tinker_arrested ? { key: 'katya', name: 'Katya', img: 'katya' } : { key: 'tinker', name: 'The Tinker', img: 'tinker' };
    if (s.rel.ilse !== undefined && !s.flags.ilse_gone) return { key: 'ilse', name: 'Ilse', img: 'ilse' };
    if (!s.flags.tinker_arrested && s.rel.tinker !== undefined) return { key: 'tinker', name: 'The Tinker', img: 'tinker' };
    return { key: 'katya', name: 'Katya', img: 'katya' };
  };
  const { adv, set } = G.chapter({ n: 4, stages: [[1, 'evening', 'c4_1'], [2, 'morning', 'c4_2'], [3, 'morning', 'c4_3']] });

  /* the ration cut on every hatch notice while it lasts */
  G.extend('u_board', {
    text: (lines, s) => {
      if (s.c4 && !s.c4.done && s.c4.stage >= 1) lines.splice(1, 0, '@dispatch PRODUCTIVITY ADJUSTMENT IN EFFECT: daily ration reduced by 60 g per citizen. Ration day at Plaza 5 is under Task Force LOCK authority.');
      return lines;
    },
  });

  G.addScenes({
    /* ================================================== OPENING */
    c4_start: {
      checkpoint: true,
      safe: true,
      title: 'Chapter Four',
      enter: (s) => {
        s.chapter = 4;
        s.c4 = { stage: 0, next: s.day, sent: null, volunteered: false, who: contact(s), approach: false, promise: false, betray: false, knows: false, prep: null, ow: 'roof', result: null, warehouse: null, done: false };
        if (G.formSquad) G.formSquad(s);
      },
      text: [
        '@big CHAPTER FOUR',
        '@sys ALL DIVISIONS · SIXTY GRAMS',
        'The broadcast at 06:00 is the shortest anyone can remember. The Administrator’s face, the dam behind it, and a single sentence read in a warm, patient voice:',
        '@doc PRODUCTIVITY ADJUSTMENT — CITY 09\nIn solidarity with cities in difficulty, the daily ration is adjusted by sixty grams per citizen, effective immediately. The Union thanks you for your contribution.',
        'Sixty grams is a slice of bread. Across District 5, three hundred thousand people do the arithmetic at the same time.',
      ],
      choices: [{ t: 'Muster.', go: 'c4_0' }],
    },

    c4_0: {
      title: 'Muster hall — the transfer order',
      text: (s) => [
        '@portrait assets/img/portraits/vigil.webp|Field Commander Vigil',
        'Vigil comes down to the precinct in person, which has never happened. The muster hall smells of wet wool and fear.',
        '@say Vigil|City 17 has requested Civil Protection reserves. City 9 will provide them. Every team lead in this precinct names one unit from their team for transfer by tonight. The transport leaves at dawn.',
        '@say Vigil|I will not tell you what is happening in City 17, because I do not know, and because it does not matter. What matters is that it is not happening here.',
        `@sys Your team: ${team(s).map((m) => `${m.name} (${G.SQUAD_TRAITS[m.trait].label}, ${m.loyal >= 55 ? 'loyal' : m.loyal >= 35 ? 'steady' : 'doubtful'})`).join(' · ')}.`,
      ],
      choices: (s) => [
        ...team(s).map((m) => ({ t: `Name ${m.name}.`, fx: (st) => ((st.c4.sent = m.id), null), go: 'c4_0_named' })),
        !s.c4.volunteered ? { t: '“Send me instead, Commander.”', tag: 'VOLUNTEER', tagCls: 'mercy', fx: (st) => ((st.c4.volunteered = true), team(st).forEach((m) => (m.loyal = Math.min(100, m.loyal + 8))), null), go: 'c4_0_vol' } : null,
        { t: '“I will not choose, Commander.”', tag: 'REFUSE', tagCls: 'risk', check: { skill: 'authority', diff: 15, pass: 'c4_0_refuse', fail: 'c4_0_refuse_bad' } },
      ].filter(Boolean),
    },
    c4_0_vol: {
      text: ['The hall turns to look at you. Vigil does not.', '@say Vigil|Denied. You are needed for what comes. Name a unit.', 'Your team heard it. You can feel them having heard it.'],
      choices: (s) => G.scenes.c4_0.choices(s).filter((c) => c.tag !== 'VOLUNTEER'),
    },
    c4_0_refuse: {
      enter: (s) => {
        const m = team(s).slice().sort((a, b) => a.loyal - b.loyal)[0];
        s.c4.sent = m.id;
        s.c4.vigilChose = true;
      },
      text: (s) => {
        const m = s.squad.members.find((x) => x.id === s.c4.sent);
        return ['Vigil looks at you for a long time.', `@say Vigil|Then I will. ${m.name}.`, `${m.name} does not look at you. You did not choose. It feels exactly the same.`];
      },
      choices: [{ t: 'Continue.', fx: (s) => (team(s).forEach((m) => (m.loyal = Math.min(100, m.loyal + 4))), { merit: -1 }), go: 'c4_0_named' }],
    },
    c4_0_refuse_bad: {
      enter: (s) => {
        const m = team(s).slice().sort((a, b) => b.loyal - a.loyal)[0];
        s.c4.sent = m.id;
        s.c4.vigilChose = true;
        G.discipline(s, 'minor', 'Refused a transfer order under sociostatus');
      },
      text: (s) => {
        const m = s.squad.members.find((x) => x.id === s.c4.sent);
        return ['@say Vigil|Noted. Then I will choose, and I will choose the one you would least like to lose.', `@say Vigil|${m.name}.`];
      },
      choices: [{ t: 'Continue.', go: 'c4_0_named' }],
    },
    c4_0_named: {
      enter: (s) => {
        const m = s.squad.members.find((x) => x.id === s.c4.sent);
        m.status = 'transferred';
        m.lost = 'City 17';
        if (!s.c4.vigilChose) team(s).forEach((x) => (x.loyal = G.clamp(x.loyal + (m.loyal >= 55 ? -6 : -2), 0, 100)));
        s.c4.sentName = m.name;
        s.c4.sentKey = m.key || null;
      },
      text: (s) => [
        `${s.c4.sentName} packs a kit bag at the end of the barracks corridor that evening: two shirts, the hygiene kit, a photograph face down.`,
        s.c4.sentKey === 'rook' ? '@say Rook|City 17. Huh. I always wanted to see the big city. Don’t let them give my bunk to a five who snores.' : s.c4.sentKey === 'tomas' ? '@say Tomas|We were going to get out of this together, remember? Training. The canal run. I’ll write. They won’t let me, but I’ll write.' : s.c4.sentKey === 'vesna' ? '@say Vesna|Keep my desk. Don’t read the drawer. Or read it. Then burn it.' : s.c4.sentKey === 'wick' ? '@say Wick|Tell Ander. Tell him I’m being *productive*.' : `@say ${nm({ name: s.c4.sentName })}|Don’t look at me like that. Somebody had to go. Better someone who doesn’t have anyone here.`,
        'A replacement will be assigned to your team. Nobody will replace the empty locker for a while.',
      ],
      choices: [{ t: 'To the duty board.', fx: adv(0), go: 'u_board' }],
    },

    /* ================================================== STAGE 1 — the evening */
    c4_1: {
      title: (s) => `Evening — Day ${s.day}`,
      enter: (s) => {
        s.c4.approach = s.res >= 20 && !s.flags.betrayed_cell && !(s.c3 && s.c3.betray);
        const a = (s.inf ? s.inf.list : []).find((x) => x.status === 'active');
        s.c4.asset = a ? a.name : null;
        if (a) s.c4.knows = true;
      },
      text: (s) => {
        const w = s.c4.who;
        const mira = s.rel.mira !== undefined && !s.flags.mira_relocated;
        if (!s.c4.approach)
          return [
            'The ration line at Plaza 5 at dusk is the longest you have ever seen it, and the packets are visibly thinner. A boy holds his up to the light to see through it.',
            mira ? 'Mira catches you outside Stack 14. She is thinner too. “They cut the mill canteen as well,” she says. “Two meals to one. People are fainting at the looms.” She does not ask you to do anything. That is worse.' : null,
            `@say ${sup(s)}|Overwatch has told the Commander what happens if Plaza 5 riots on ration day. I am not going to tell you what they said. I am going to tell you to make sure it doesn’t.`,
            s.c4.asset ? `@sys Your asset ${s.c4.asset} leaves a note in your locker grille: *ration day — they are going for the warehouse at the packing plant, D2 — while you are all at the plaza.*` : null,
          ];
        return [
          `@portrait assets/img/portraits/${w.img}.webp|${w.name}`,
          `${w.name} is waiting in the stairwell of your barracks, the way they always seem to be when they want something.`,
          `@say ${w.name}|The packing plant in D2 has six weeks of stock in the warehouse behind it. Six weeks, while the Stacks lose sixty grams a day. On ration day, every unit in the city will be at Plaza 5 holding the line.`,
          `@say ${w.name}|That’s when we open the warehouse. Not to keep. To give out. Every family in D5 gets a sack before Overwatch can get across the bridge.`,
          `@say ${w.name}|We don’t need you to do anything. We need you not to send your team to D2 when the call comes.`,
          s.c4.asset ? `@sys Separately, your asset ${s.c4.asset} has heard the same thing.` : null,
        ];
      },
      choices: (s) =>
        !s.c4.approach
          ? [{ t: 'Go home.', fx: adv(1), go: 'u_night' }]
          : [
              { t: '“When the call comes, my team will be busy.”', tag: 'RESISTANCE', tagCls: 'mercy', fx: adv(1, (st) => ((st.c4.promise = true), (st.c4.knows = true), { res: 10, cons: 4, susp: 2 })), go: 'u_night' },
              { t: '“I heard nothing.”', fx: adv(1, (st) => ((st.c4.knows = true), { res: 2 })), go: 'u_night' },
              { t: 'Report it to the Commander’s duty officer tonight.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: adv(1, (st) => ((st.c4.betray = true), (st.c4.knows = true), { merit: 6, lp: 4, res: -50, cons: -8, rel: { [st.c4.who.key]: -100 } })), go: 'u_night' },
            ],
    },

    /* ================================================== STAGE 2 — the day before */
    c4_2: {
      title: 'The day before ration day',
      text: (s) => [
        `@say ${sup(s)}|Tomorrow is ration day. You have today to make tomorrow survivable. One thing. Choose it well; you do not get two.`,
        `@sys Plaza 5 is currently **${(G.blockColour && G.blockColour(s, 'plaza')) || 'amber'}** on the precinct board. That is how hot the crowd will start.`,
      ],
      choices: (s) => [
        { t: 'Request an emergency release from the precinct stores: biscuits for the old and the children, handed out tonight.', tag: 'MERCY', tagCls: 'mercy', check: { skill: 'comms', diff: 10, pass: 'c4_2_release', fail: 'c4_2_release_bad' } },
        { t: 'Raid the agitators’ list in Stack 9 tonight. Take the loud ones off the plaza before it starts.', tag: 'BY THE BOOK', tagCls: 'loyal', go: 'c4_2_list' },
        { t: 'Walk the blocks with the wardens. Talk to people.', check: { skill: 'authority', diff: 5, pass: 'c4_2_wardens', fail: 'c4_2_wardens_bad' } },
        (s.inf && s.inf.list.some((x) => x.status === 'active')) || s.c4.knows ? { t: 'Work your sources on the warehouse plan.', go: 'c4_2_sources' } : null,
      ].filter(Boolean),
    },
    c4_2_release: {
      enter: (s) => {
        s.c4.prep = 'release';
        G.distFx(s, 'plaza', 0, -15);
        G.distFx(s, 's14', 0, -6);
      },
      text: ['The quartermaster swears at you for ten minutes and then signs. By midnight your team has handed out four hundred packets of hard biscuit in the stairwells of the Stacks. Nobody says thank you. Several people cry.', 'Vigil’s office sends down a single line: *Noted.*'],
      choices: [{ t: 'Sleep, if you can.', fx: adv(1, { cons: 6, susp: 3, merit: -1 }), go: 'c4_2_done' }],
    },
    c4_2_release_bad: {
      enter: (s) => {
        s.c4.prep = 'none';
      },
      text: ['The quartermaster reads your request, stamps it DENIED — SOCIOSTATUS, and hands it back without a word. You have spent the day on a form.'],
      choices: [{ t: 'Sleep, if you can.', fx: adv(1), go: 'c4_2_done' }],
    },
    c4_2_list: {
      enter: (s) => {
        s.c4.prep = 'list';
        G.distFx(s, 'plaza', 10, 12);
        G.distFx(s, 's9', 8, 14);
      },
      text: ['Eleven doors in Stack 9 between 23:00 and 03:00. Eleven people who have shouted at the plaza before, in the back of the PT-V in zip-ties. Their families watch from the landings. Stack 9 does not sleep that night either.'],
      choices: [{ t: 'Back to the precinct.', fx: adv(1, { merit: 5, lp: 3, cons: -8 }), go: 'c4_2_done' }],
    },
    c4_2_wardens: {
      enter: (s) => {
        s.c4.prep = 'wardens';
        G.distFx(s, 'plaza', 4, -8);
        G.distFx(s, 's22', 3, -4);
      },
      text: ['You walk the Stacks with the block wardens all afternoon, mask on, voice low. You do not promise anything you cannot keep. You tell people what tomorrow will look like, so that it does not surprise them. Some of them listen.'],
      choices: [{ t: 'Back to the precinct.', fx: adv(1, { merit: 2, cons: 3, xp: { authority: 1 } }), go: 'c4_2_done' }],
    },
    c4_2_wardens_bad: {
      enter: (s) => {
        s.c4.prep = 'none';
        G.distFx(s, 'plaza', 0, 4);
      },
      text: ['A warden in Stack 14 spits at your boots in front of the whole landing. After that nobody else will talk to you.'],
      choices: [{ t: 'Back to the precinct.', fx: adv(1), go: 'c4_2_done' }],
    },
    c4_2_sources: {
      enter: (s) => {
        s.c4.prep = 'sources';
        s.c4.knows = true;
      },
      text: ['By evening you know the shape of it: the warehouse behind the packing plant, the loading door on the canal side, the hour when the D2 bridge has the fewest units on it — which will be tomorrow, during the plaza.', 'What you do with it is tomorrow’s problem.'],
      choices: [{ t: 'Back to the precinct.', fx: adv(1, { merit: 1, xp: { perception: 1 } }), go: 'c4_2_done' }],
    },
    c4_2_done: { safe: true, enter: () => 'u_duty_end', text: [] },

    /* ================================================== STAGE 3 — ration day */
    c4_3: {
      checkpoint: true,
      title: 'Ration day — Plaza 5',
      text: (s) => [
        '@img assets/img/env/e24-ration-day.webp|Plaza 5, ration day',
        'Plaza 5 is full by 05:00. Not the usual line: the whole of District 5, standing in the cold, waiting to be given less. The screens show the dam. Nobody watches.',
        'Every division of Task Force LOCK is here: UNION on the barriers, HELIX in the cinema doorway, JURY vans in the side street, RAZOR on the steps around Vigil, GRID on the RDT panels, SPEAR in reserve, VECTOR’s suits by the drains as if they expected something to come up them.',
        'An Overwatch squad stands on the cinema roof with its rifles across its chests. Above them, a Shrike holds station with its searchlight off, which is somehow worse.',
        `@say ${sup(s)}|Your team has the hatch line. Overwatch has the roof. If the plaza goes, Overwatch has everything.`,
      ],
      choices: (s) => [
        { t: 'Ask the Commander to pull Overwatch off the roof. The crowd can see them, and it knows what they are for.', check: { skill: 'authority', diff: s.flags.vigil_noticed ? 5 : 15, pass: 'c4_3_off', fail: 'c4_3_go' } },
        { t: 'Ask for Overwatch on the barrier with you. Let the crowd see what is waiting.', tag: 'BRUTAL', tagCls: 'risk', fx: (st) => ((st.c4.ow = 'barrier'), null), go: 'c4_3_go' },
        { t: 'Take your post. Leave Overwatch where it is.', go: 'c4_3_go' },
      ],
    },
    c4_3_off: {
      enter: (s) => {
        s.c4.ow = 'off';
      },
      text: ['Vigil listens, turns, and says one word into a radio. On the cinema roof the Overwatch squad steps back from the parapet, out of sight. The crowd notices. Something in it loosens, a little.', '@say Vigil|If you are wrong, Protection Unit, they come back down. And so do I.'],
      choices: [{ t: 'To the hatches.', go: 'c4_3_go' }],
    },
    c4_3_go: {
      title: 'Ration day — the hatches open',
      text: (s) => [
        '@sys Crowd control. Hold Plaza 5 until the last hatch closes. Your team are your units.',
        s.c4.ow === 'barrier' ? 'The Overwatch soldiers stand at the barrier beside you. The crowd in front of them is very still, and very close to boiling.' : s.c4.ow === 'off' ? 'The roof is empty. The crowd keeps looking up at it anyway.' : null,
      ],
      mini: {
        type: 'crowd',
        opts: (s) => {
          const o = G.crowdOpts(s, {
            block: 'plaza',
            title: 'Ration day — Plaza 5',
            seconds: 50,
            sectors: ['Stack 9 side', 'The hatches', 'Bazaar Row side'],
            events: ['A woman holds up a packet and shouts the weight', 'Someone shouts that the warehouse in D2 is full', 'The front row sits down on the stones, all at once', 'A child faints in the crush by hatch 4', 'A ration card is thrown at the screen and then a hundred more', 'Someone starts reading the names of the relocated', 'The Shrike’s rotors change pitch overhead and a ripple of panic goes through the crowd'],
          });
          const lift = s.c4.ow === 'barrier' ? -12 : s.c4.ow === 'off' ? -6 : 4;
          o.start = o.start.map((v) => Math.max(5, Math.min(75, v + lift)));
          o.rate = Math.max(0.7, o.rate + (s.c4.ow === 'barrier' ? 0.12 : s.c4.ow === 'off' ? -0.1 : 0) + (s.c4.prep === 'release' ? -0.12 : s.c4.prep === 'list' ? -0.05 : 0));
          return o;
        },
        pass: 'c4_held',
        fail: 'c4_riot',
        skill: 'authority',
        diff: 15,
      },
    },

    c4_held: {
      enter: (s) => {
        s.c4.result = 'held';
        G.distFx(s, 'plaza', 6, (s.lastMini && s.lastMini.force ? 6 : -6) + (s.lastMini ? s.lastMini.pulled * 2 : 0));
      },
      text: (s) => [
        'The last hatch closes at 13:20. Plaza 5 empties slowly, people walking home with thin packets under their coats, and nobody runs, and nobody falls, and the Overwatch squad on the roof never moves.',
        s.lastMini && s.lastMini.force ? 'It cost batons. The plaza will remember whose.' : 'It cost nothing you can see. You will find out later what it cost.',
        '@radio …LOCK, Dispatch. Report of a break-in at the D2 packing plant warehouse, canal side. Crowd forming. All available units—',
        s.c4.knows ? 'There it is.' : 'D2. The packing plant. While everyone was here.',
      ],
      choices: (s) => [
        { t: 'Take your team across the D2 bridge. Now.', tag: 'BY THE BOOK', tagCls: 'loyal', go: 'c4_wh_stop' },
        { t: '“LOCK, Dispatch: my team is still clearing the plaza. No units available.”', tag: 'RESISTANCE', tagCls: 'mercy', check: { skill: 'deception', diff: s.c4.promise ? 5 : 15, pass: 'c4_wh_let', fail: 'c4_wh_let_bad' } },
        { t: 'Request 10-78 AIR on the warehouse.', tag: 'BRUTAL', tagCls: 'risk', go: 'c4_wh_air' },
      ],
    },
    c4_riot: {
      checkpoint: true,
      enter: (s) => {
        s.c4.result = 'riot';
        G.distFx(s, 'plaza', -15, 20);
        G.distFx(s, 's9', -6, 10);
        if (s.squad && s.squad.formed) G.squadHit(s, true, 'the Plaza 5 riot');
      },
      text: (s) => [
        'It goes at the hatches. A shove, a scream, and then the plaza is one moving thing, over the barriers and through them.',
        s.c4.ow === 'off' ? 'The Overwatch squad comes back to the cinema roof at a run.' : 'The Overwatch squad on the roof raises its rifles in a single movement.',
        'The Shrike’s searchlight snaps on and pins the centre of the crowd like a nail.',
        s.mem.squadHit ? (s.mem.squadHit.out === 'dead' ? `${s.mem.squadHit.name} goes down under the barrier and does not get up.` : `${s.mem.squadHit.name} goes down under the barrier.`) : null,
        '@radio Overwatch to all Civil Protection: clear the line of fire.',
      ],
      choices: [
        { t: 'Get people out of the line of fire — into the cinema, down the side street, anywhere.', tag: 'MERCY', tagCls: 'mercy', check: { skill: 'authority', diff: 10, pass: 'c4_riot_save', fail: 'c4_riot_lose' } },
        { t: 'Clear the line of fire as ordered. Batons out, push the crowd into the open.', tag: 'BRUTAL', tagCls: 'risk', go: 'c4_riot_clear' },
        { t: 'Walk into the open between the crowd and the roof, arms up, and keep walking.', tag: 'RISK', tagCls: 'risk', check: { skill: 'authority', diff: 25, pass: 'c4_riot_stand', fail: 'c4_riot_shot' } },
      ],
    },
    c4_riot_save: {
      text: ['You and your team drag people into the cinema by their collars, their sleeves, their hair. HELIX is in the doorway pulling them through. When the shooting starts it is short, and there are fewer people in the open than there would have been.', 'Fewer is not none.'],
      choices: [{ t: 'Afterwards.', fx: { cons: 6, merit: 2, susp: 3 }, go: 'c4_after_riot' }],
    },
    c4_riot_lose: {
      text: ['You pull at sleeves and shout into your amplifier and nobody can hear you. When the shooting starts it is short. You are standing in the middle of the plaza when it stops.'],
      choices: [{ t: 'Afterwards.', fx: { cons: -4, hp: -10 }, go: 'c4_after_riot' }],
    },
    c4_riot_clear: {
      text: ['You do what the radio says. Your team goes in with batons and pushes the crowd off the barriers and into the open centre of the plaza, where the roof can see it.', 'It is efficient. You will remember exactly how efficient for the rest of your life.'],
      choices: [{ t: 'Afterwards.', fx: { merit: 6, lp: 5, cons: -25 }, go: 'c4_after_riot' }],
    },
    c4_riot_stand: {
      text: ['You walk out between the crowd and the roof with your arms up and your armband facing the rifles. You do not stop walking. Behind you, slowly, the crowd stops moving.', '@radio Vigil to Overwatch. Hold. Hold. Civil Protection has the plaza.', 'For a long moment nothing happens. Then the rifles on the roof come down, one by one.'],
      choices: [{ t: 'Afterwards.', fx: { cons: 12, merit: 4, susp: 6, rel: { vigil: 15 } }, go: 'c4_after_riot' }],
    },
    c4_riot_shot: {
      text: ['You walk out into the open with your arms up. The first round takes you in the shoulder plate and spins you round. You never hear the second.', 'You wake up in the HELIX ward under the Nexus two days later. Nobody will tell you how many.'],
      choices: [{ t: 'Afterwards.', fx: (s) => ((s.day += 2), { hp: -60, cons: 8 }), go: 'c4_after_riot' }],
    },
    c4_after_riot: {
      text: ['By evening Plaza 5 has been hosed down. The ration hatches are sealed for three days “for maintenance”. Across the river, in D2, nobody went to the warehouse: everyone was here.'],
      choices: [{ t: 'Report to the Commander.', fx: (s) => ((s.c4.warehouse = 'untouched'), null), go: 'c4_5' }],
    },

    /* the warehouse */
    c4_wh_stop: {
      enter: (s) => {
        s.c4.warehouse = 'stopped';
        G.distFx(s, 's14', 6, 10);
      },
      text: (s) => [
        'You take the D2 bridge at a run with your team behind you. The warehouse door is open on the canal side, and the loading dock is full of people with sacks: mill hands, grandmothers, children dragging bags twice their size.',
        s.c4.approach && s.c4.who ? `${s.c4.who.name} is on the dock, handing out sacks. They see your armband and freeze. Then they keep handing out sacks, faster.` : 'Somebody on the dock sees your armband and shouts. Half of them run. Half of them keep filling sacks, faster.',
        'You close the door. It takes four minutes and the batons. By the time Overwatch arrives, the warehouse is sealed and the dock is empty except for split grain on the concrete.',
      ],
      choices: [{ t: 'Report to the Commander.', fx: { merit: 8, lp: 5, cons: -10, res: -20 }, go: 'c4_5' }],
    },
    c4_wh_let: {
      enter: (s) => {
        s.c4.warehouse = 'emptied';
        G.distFx(s, 'plaza', -4, -12);
        G.distFx(s, 's9', -4, -10);
        G.distFx(s, 's14', -4, -10);
      },
      text: ['You keep your team on the plaza, picking up torn packets and stacking barriers, slowly, thoroughly, while the radio calls for units that never come.', 'By the time Overwatch gets across the D2 bridge, six weeks of stock are in the stairwells and under the beds and inside the mattresses of District 5. There is not a sack left to find.'],
      choices: [{ t: 'Report to the Commander.', fx: { res: 20, cons: 10, susp: 6 }, go: 'c4_5' }],
    },
    c4_wh_let_bad: {
      enter: (s) => {
        s.c4.warehouse = 'stopped';
        G.discipline(s, 'serious', 'False availability report during sociostatus');
      },
      text: ['@radio LOCK, Vigil. Your team is listed on the plaza at zero tasks. Move. Now.', 'You move. You are too late to stop it and too early to miss it, which is the worst of both.'],
      choices: [{ t: 'Report to the Commander.', fx: { susp: 8, merit: -2 }, go: 'c4_5' }],
    },
    c4_wh_air: {
      enter: (s) => {
        s.c4.warehouse = 'air';
        G.distFx(s, 's14', 12, 18);
        G.distFx(s, 's9', 8, 12);
        G.unlock(s, 'airwatch');
      },
      text: ['You key 10-78 AIR. For once, Airwatch answers.', 'The Shrike crosses the river in nine seconds. You hear the chin turret from Plaza 5, one long burst, then another. Then nothing.', 'The warehouse is intact. Nobody in D5 will ever say your designation out loud again without lowering their voice.'],
      choices: [{ t: 'Report to the Commander.', fx: { merit: 10, lp: 8, cons: -30, res: -40 }, go: 'c4_5' }],
    },

    /* ================================================== STAGE 5 — after */
    c4_5: {
      title: 'The Commander’s office',
      enter: (s) => {
        const ok = s.susp < 75 && !(s.c4.warehouse === 'emptied' && s.c3 && s.c3.flagged);
        s.c4.pass = ok;
        if (ok) {
          const i = G.rankIdx(s.rank);
          if (i < G.rankIdx('EpU')) {
            G.promote(s, G.RANKS[i + 1]);
            G.fx(s, { merit: 8, lp: 3 });
          }
        }
        s.c4.done = true;
        s.c4.stage = 9;
      },
      text: (s) => {
        const w = s.c4.warehouse;
        return [
          '@portrait assets/img/portraits/vigil.webp|Field Commander Vigil',
          s.c4.result === 'held' && w === 'stopped' ? '@say Vigil|The plaza held and the warehouse is sealed. Overwatch is satisfied. The ration will remain where it is, because the city has proven it can bear it. You understand that is what success means here.' : s.c4.result === 'held' && w === 'emptied' ? '@say Vigil|The plaza held, and the warehouse is empty, and nobody on the plaza was available. Overwatch has restored twenty grams to the D5 ration “as a gesture of confidence”. I would like you to think very carefully about who you are making confident.' : w === 'air' ? '@say Vigil|You called Airwatch on a loading dock. Overwatch was impressed. I am filing it under a heading you will not like.' : '@say Vigil|The plaza did not hold. You know what happened afterwards. You were there. I am not going to describe it back to you.',
          s.c4.pass ? `@doc PROMOTION: ${G.desig(s)}` : '@sys Promotion withheld.',
        ];
      },
      choices: [{ t: 'Continue.', go: 'c4_end' }],
    },

    c4_end: {
      checkpoint: true,
      title: 'End of Chapter Four',
      text: (s) => {
        const w = s.c4.warehouse;
        return [
          w === 'emptied' ? 'For a week, District 5 eats. You can tell from the stairwells: the smell of real porridge, children with colour in their faces. JURY can tell too. The searches start on the eighth day.' : w === 'air' ? 'The loading dock is hosed down by CWU crews who do not look at the stains. The packing plant opens again on schedule.' : s.c4.result === 'riot' ? 'There is a new tally on the wall above the urn in the precinct mess. It is not for units.' : 'The ration stays at sixty grams less. People get thinner, quietly, in the way the Union prefers.',
          `Three weeks later, a letter arrives for you, opened and resealed by the Nexus censor. It is from ${s.c4.sentName}, in City 17.`,
          `@doc …the canals here are full of something, I can’t write what. Overwatch is everywhere and Civil Protection is everywhere else. Everyone is looking for someone. They don’t tell us who. They just give us the description and the sector, every morning, and every morning it’s a different sector. I am all right. Eat my share. — ${s.c4.sentName.replace(/"/g, '')}`,
          'The censor has blacked out one line near the bottom. Only the last word of it survives: *…railway.*',
          `@doc ${G.desig(s)}\nDIVISION: ${s.div}\nRANK: ${G.RANK_NAMES[s.rank].toUpperCase()}\nDAYS IN SERVICE: ${s.day}`,
          '@sys CHAPTER FOUR COMPLETE. You can keep serving on the duty board. Chapter Five is coming.',
        ];
      },
      choices: [{ t: 'Return to duty.', go: 'u_duty_end' }],
    },
  });
})();
