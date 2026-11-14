/* ROUTINE VARIANTS — so a duty you have done before is not the same day twice.
   When a routine duty is chosen, there is a 75% chance it becomes one of these vignettes
   instead of the standard routine scene. Variants rotate: the last two of each duty are not
   repeated. Every choice ends the shift unless it says otherwise.
   Format: { duty, id, title, if?(s), text: [..] | fn(s), choices: [{ t, tag?, tagCls?, fx?, check?: { skill, diff, okFx?, failFx? }, go? }] } */
(function () {
  const END = 'u_duty_end';
  const pick = G.pick;


  const V = [
    /* --------------------------------------------------- RATION — Plaza 5 */
    {
      duty: 'ration',
      id: 'ration_short',
      title: 'Plaza 5 — the line is short today',
      text: ['The hatches open forty minutes late. Then hatch 3 runs empty after an hour. The line does not move and does not make a sound, and that is worse than shouting.', '@sys This shift can be played as a crowd-control exercise.'],
      choices: [
        { t: 'Work the line. Keep the crowd under the boil.', tag: 'CROWD', tagCls: 'duty', go: 'cr_ration' },
        { t: 'Stand at the hatches and let the line be the line.', fx: { merit: 1 } },
      ],
    },
    {
      duty: 'ration',
      id: 'ration_card',
      title: 'Plaza 5 — a refused card',
      text: ['Hatch 2 refuses a card with a flat red chime. The old man holding it tries again, and again. *CARD SUSPENDED — PENALTY REVIEW.* He has no idea what that means. Neither, honestly, do you.'],
      choices: [
        { t: 'Escort him out of the line. Procedure.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 2, cons: -3 } },
        { t: 'Key a unit override. One packet. Log it as a reader fault.', tag: 'MERCY', tagCls: 'mercy', check: { skill: 'comms', diff: 5, okFx: { cons: 4, res: 2 }, failFx: { susp: 4, cons: 2 } } },
        { t: 'Look up his file while he waits.', check: { skill: 'perception', diff: 0, okFx: { merit: 1, xp: { comms: 1 } }, failFx: {} } },
      ],
    },
    {
      duty: 'ration',
      id: 'ration_cwu',
      title: 'Plaza 5 — behind the wall',
      text: ['You are posted behind the RDT wall today, with the CWU crews feeding the hatches. A woman in an ochre jacket is slipping one packet in every forty into a sack under the pallets. She sees you see it.'],
      choices: [
        { t: 'Detain her. Theft of Union property.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 4, lp: 2, cons: -4 } },
        { t: 'Take the sack. Say nothing more about it.', fx: { give: 'ration', susp: 2 } },
        { t: 'Ask her who the packets are for.', check: { skill: 'authority', diff: 5, okFx: { cons: 2, xp: { authority: 1 } }, failFx: { merit: -1 } } },
      ],
    },
    {
      duty: 'ration',
      id: 'ration_rain',
      title: 'Plaza 5 — rain',
      text: ['It rains for the whole shift. Three hundred people stand in it without umbrellas, because umbrellas are non-approved items. The packets come out of the hatches wet and fall apart in their hands.'],
      choices: [
        { t: 'Keep it moving.', fx: { merit: 2 } },
        { t: 'Let the old and the children shelter in the cinema doorway. Against protocol.', tag: 'MERCY', tagCls: 'mercy', fx: { cons: 4, merit: -1 } },
      ],
    },

    /* --------------------------------------------------- CHECKPOINT — Canal Gate 3 */
    {
      duty: 'checkpoint',
      id: 'check_coffin',
      title: 'Canal Gate 3 — a coffin',
      text: ['Four men carry a plain pine coffin up to the barrier. Burial permit for D3, stamped, in order. The coffin is very heavy for one old woman, and one of the bearers is sweating more than the weight explains.'],
      choices: [
        { t: 'Open it.', tag: 'BY THE BOOK', tagCls: 'loyal', check: { skill: 'perception', diff: 5, okFx: { merit: 5, lp: 2, cons: -4 }, failFx: { merit: 1, cons: -6 } } },
        { t: 'Wave them through. The permit is in order.', tag: 'MERCY', tagCls: 'mercy', fx: { res: 3, susp: 2 } },
        { t: 'Put your hand on the lid and wait to see who flinches.', check: { skill: 'authority', diff: 10, okFx: { merit: 3, xp: { authority: 1 } }, failFx: { merit: 1 } } },
      ],
    },
    {
      duty: 'checkpoint',
      id: 'check_child',
      title: 'Canal Gate 3 — alone',
      text: ['A boy of about ten comes to the barrier alone with his mother’s ID card and a transit permit with her CID on it. He says she is sick and sent him to collect her ration in D3. The card photo is very clearly not him.'],
      choices: [
        { t: 'Hold him and send a unit to check the mother.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 3, cons: -2 } },
        { t: 'Let him through.', tag: 'MERCY', tagCls: 'mercy', fx: { cons: 3, susp: 2 } },
        { t: 'Inspect the papers properly, with the queue behind him.', tag: 'INSPECT', tagCls: 'duty', go: 'd_check_queue' },
      ],
    },
    {
      duty: 'checkpoint',
      id: 'check_ota',
      if: (s) => !!s.c3,
      title: 'Canal Gate 3 — Overwatch traffic',
      text: ['An Overwatch transport comes through the gate at speed without stopping, then another. The third stops. Its visor slit turns toward your booth for a long moment, then it goes on. Your scanner logged nothing. It was not allowed to.'],
      choices: [
        { t: 'Log the transports manually, by time and hull code.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 2, xp: { comms: 1 } } },
        { t: 'Log nothing. Overwatch traffic is not yours to record.', fx: { lp: 1 } },
      ],
    },
    {
      duty: 'checkpoint',
      id: 'check_queue',
      title: 'Canal Gate 3 — the morning queue',
      text: ['The shift change at the Works sends four hundred people through the gate in forty minutes. Your partner takes the left lane. You take the right, and the papers.'],
      choices: [{ t: 'Work the queue against the clock.', tag: 'INSPECT', tagCls: 'duty', go: 'd_check_queue' }, { t: 'Wave the regulars through and check only strangers.', fx: { merit: 1, susp: 1 } }],
    },

    /* --------------------------------------------------- MARKET — Bazaar Row */
    {
      duty: 'market',
      id: 'market_dog',
      title: 'Bazaar Row — a dog',
      text: ['There is a dog on Bazaar Row. A real one, thin, grey, with a rope collar. Dogs are non-sanctioned. Half the street is feeding it scraps and pretending not to. It sits down in front of you and looks at your mask.'],
      choices: [
        { t: 'Call it in for removal.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 1, cons: -4 } },
        { t: 'Walk on. You did not see a dog.', tag: 'MERCY', tagCls: 'mercy', fx: { cons: 3 } },
        { t: 'Ask the stall holders whose dog it is.', check: { skill: 'authority', diff: 0, okFx: { xp: { authority: 1 } }, failFx: {} } },
      ],
    },
    {
      duty: 'market',
      id: 'market_scale',
      title: 'Bazaar Row — the scales',
      text: ['The licensed CWU stall at the end of the row is selling ration supplements by weight. Your lens reads the scale as 92 grams. The label says 100. The queue is long and nobody is complaining out loud.'],
      choices: [
        { t: 'Shut the stall. Fraud against citizens is fraud against the Union.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 3, cons: 2 } },
        { t: 'Take a cut. Eight grams is worth something.', fx: { tokens: 6, susp: 3, cons: -3 } },
        { t: 'Make him fix the scale in front of the queue.', check: { skill: 'authority', diff: 5, okFx: { merit: 2, cons: 3 }, failFx: { merit: 1 } } },
      ],
    },
    {
      duty: 'market',
      id: 'market_chalk',
      title: 'Bazaar Row — fresh chalk',
      text: ['A fresh lambda on the shutter of the shoe-repair stall. The chalk dust is still on the pavement. Twenty metres away a girl in a too-big jacket is walking very carefully, not fast, with white on her fingertips.'],
      choices: [
        { t: 'Stop her.', go: 'ss_start' },
        { t: 'Scrub the shutter. Let her walk.', tag: 'MERCY', tagCls: 'mercy', fx: { cons: 2, res: 2 } },
        { t: 'Photograph the mark and follow her at a distance.', check: { skill: 'perception', diff: 10, okFx: { merit: 4, xp: { perception: 1 } }, failFx: { merit: 1 } } },
      ],
    },
    {
      duty: 'market',
      id: 'market_fight',
      title: 'Bazaar Row — a fight',
      text: ['Two men are fighting over a pair of boots in front of the batteries stall. Real fists. A crowd forms in a ring and goes quiet the moment your mask comes into view.'],
      choices: [
        { t: 'Baton both of them. Level 1, both files.', tag: 'BY THE BOOK', tagCls: 'loyal', check: { skill: 'melee', diff: 0, okFx: { merit: 3 }, failFx: { hp: -8, merit: 1 } } },
        { t: 'Separate them with your voice alone.', check: { skill: 'authority', diff: 10, okFx: { merit: 2, cons: 2, xp: { authority: 1 } }, failFx: { hp: -6 } } },
        { t: 'Confiscate the boots and let the street decide who is stupider.', fx: { merit: 1, give: 'ration' } },
      ],
    },

    /* --------------------------------------------------- INSPECTION — Stack 22 */
    {
      duty: 'inspection',
      id: 'insp_extra',
      title: 'Stack 22 — one too many',
      text: ['Flat 6B is registered to four. You count five toothbrushes, five pairs of shoes by the door, five plates drying. The family stands in a row and says four, together, like a choir.'],
      choices: [
        { t: 'Search until you find the fifth.', tag: 'BY THE BOOK', tagCls: 'loyal', check: { skill: 'perception', diff: 5, okFx: { merit: 4, cons: -5 }, failFx: { merit: 1 } } },
        { t: 'Write down four.', tag: 'MERCY', tagCls: 'mercy', fx: { cons: 4, susp: 2 } },
      ],
    },
    {
      duty: 'inspection',
      id: 'insp_dead',
      title: 'Stack 22 — no answer',
      text: ['Flat 11A does not answer. The warden’s key opens it on an old man in a chair by a cold stove, dead for at least a week. The ration card on the table has been used every day since.'],
      choices: [
        { t: 'Flag the card and trace who has been using it.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 3, cons: -2 } },
        { t: 'Report the death. Leave the card out of it.', tag: 'MERCY', tagCls: 'mercy', fx: { cons: 3, susp: 1 } },
      ],
    },
    {
      duty: 'inspection',
      id: 'insp_radio',
      title: 'Stack 22 — the radiator',
      text: ['Your scanner pings a faint signal behind a radiator in 3C: a receiver, not a transmitter. The couple in 3C are both over seventy. The old woman says it plays music from before. She asks if you would like to hear it.'],
      choices: [
        { t: 'Confiscate it. Yellow contraband.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 2, cons: -3 } },
        { t: 'Listen to one song. Then leave it.', tag: 'MERCY', tagCls: 'mercy', fx: { cons: 6, susp: 3 } },
      ],
    },
    {
      duty: 'inspection',
      id: 'insp_census',
      title: 'Stack 22 — the census',
      text: ['Six floors of doors, six floors of the same answers. On the fourth floor a woman asks you, quietly, whether the census is for relocation. Everyone on the landing waits for the answer.'],
      choices: [
        { t: '“It is a census.”', fx: { merit: 1 } },
        { t: '“I don’t know.” The truth.', tag: 'MERCY', tagCls: 'mercy', fx: { cons: 2, susp: 1 } },
        { t: '“If you have nothing to hide, it is a census.”', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { lp: 1, cons: -2 } },
      ],
    },

    /* --------------------------------------------------- BROADCAST — Plaza 5 */
    {
      duty: 'broadcast',
      id: 'cast_sing',
      title: 'Plaza 5 — loyalty hour',
      text: ['The broadcast ends with the Union anthem. The plaza is supposed to sing. The plaza mouths it. In the third row a young man is singing the words of a different song, very quietly, to the same tune.'],
      choices: [
        { t: 'Pull him out of the row.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 3, cons: -3 } },
        { t: 'Stand where the scanner cannot see his mouth.', tag: 'MERCY', tagCls: 'mercy', check: { skill: 'deception', diff: 5, okFx: { cons: 3, res: 3 }, failFx: { susp: 4 } } },
      ],
    },
    {
      duty: 'broadcast',
      id: 'cast_faint',
      title: 'Plaza 5 — standing',
      text: ['Forty minutes of standing for the Administrator. A pregnant woman in the fourth row sways, then sits down on the wet stone. Sitting is not permitted during loyalty hour. Pregnancy is not permitted at all.'],
      choices: [
        { t: 'Get her up. Then report the pregnancy.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 4, lp: 2, cons: -10 } },
        { t: 'Shield her from the scanner until the broadcast ends.', tag: 'MERCY', tagCls: 'mercy', check: { skill: 'deception', diff: 10, okFx: { cons: 6, res: 4 }, failFx: { susp: 6, cons: 2 } } },
        { t: 'Call HELIX quietly. Medical, no detail.', check: { skill: 'comms', diff: 5, okFx: { cons: 3 }, failFx: { merit: -1 } } },
      ],
    },
    {
      duty: 'broadcast',
      id: 'cast_crowd',
      title: 'Plaza 5 — a bad announcement',
      text: ['Today the broadcast announces a new curfew hour for D5 and a revised ration tier. The plaza goes still in a way you have learned to feel in your teeth.', '@sys This shift can be played as a crowd-control exercise.'],
      choices: [
        { t: 'Hold the plaza until the screens go dark.', tag: 'CROWD', tagCls: 'duty', go: 'cr_cast' },
        { t: 'Pull back to the cinema steps and watch.', fx: { merit: 1 } },
      ],
    },

    /* --------------------------------------------------- ESCORT — to the Nexus */
    {
      duty: 'escort',
      id: 'escort_talk',
      title: 'The bridge to the Nexus',
      text: ['Your detainee today is a schoolteacher, cuffed, calm, and talkative. Halfway across the bridge she asks you what you wanted to be before. Nobody has asked you that in years.'],
      choices: [
        { t: 'Answer her.', tag: 'MERCY', tagCls: 'mercy', fx: { cons: 4 } },
        { t: '“Silence.”', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 1 } },
      ],
    },
    {
      duty: 'escort',
      id: 'escort_run',
      title: 'The bridge to the Nexus — he runs',
      text: ['On the bridge your detainee shoulders you into the railing and runs. Cuffed hands, bare feet, straight for the far end where the canal stairs go down.'],
      choices: [
        { t: 'Run him down.', check: { skill: 'fitness', diff: 5, okFx: { merit: 3, xp: { fitness: 1 } }, failFx: { merit: -3, susp: 2 } } },
        { t: 'Draw and order him to stop.', tag: 'BY THE BOOK', tagCls: 'loyal', check: { skill: 'firearms', diff: 5, okFx: { merit: 2, cons: -3 }, failFx: { merit: -2 } } },
        { t: 'Radio ahead. Let the Nexus gate take him.', check: { skill: 'comms', diff: 0, okFx: { merit: 2 }, failFx: { merit: -2 } } },
      ],
    },
    {
      duty: 'escort',
      id: 'escort_jury',
      title: 'The Nexus — intake',
      text: ['At the Nexus intake desk the JURY clerk reads your detainee’s file and says, without looking up, that the charge on it is wrong. Someone wrote Level 5 where the evidence says Level 3. The someone was your precinct.'],
      choices: [
        { t: 'Correct it. Level 3.', tag: 'MERCY', tagCls: 'mercy', fx: { cons: 3, merit: 1 } },
        { t: '“The file is the file.” Sign the intake.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { lp: 1, cons: -3 } },
      ],
    },

    /* --------------------------------------------------- RAILYARD — D4 at night */
    {
      duty: 'railyard',
      id: 'rail_kids',
      title: 'D4 Rail Yards — 00:20',
      text: ['Your torch finds three children asleep in an empty freight car, under sacking. They have a tin can with three candle stubs in it and a map of the rail line drawn on the wall in charcoal, with a line going north.'],
      choices: [
        { t: 'Wake them and take them in.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 3, cons: -5 } },
        { t: 'Close the door quietly and log the car as empty.', tag: 'MERCY', tagCls: 'mercy', fx: { cons: 5, susp: 2 } },
        { t: 'Leave your ration bar by the candles.', tag: 'MERCY', tagCls: 'mercy', fx: { cons: 4, take: 'ration' } },
      ],
    },
    {
      duty: 'railyard',
      id: 'rail_wire',
      title: 'D4 Rail Yards — 01:10',
      text: ['A tripwire across the gap between two freight cars, at shin height, attached to a tin can of nails. Fresh. Whoever set it is close, and expected units to come this way.'],
      choices: [
        { t: 'Disarm it and trace the wire.', check: { skill: 'perception', diff: 10, okFx: { merit: 4, xp: { perception: 1 } }, failFx: { hp: -15, merit: 1 } } },
        { t: 'Pull back and call it in. 10-78.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: { merit: 2 } },
      ],
    },
    {
      duty: 'railyard',
      id: 'rail_air',
      if: (s) => !!s.c3,
      title: 'D4 Rail Yards — under the searchlight',
      text: ['A Shrike holds station over the yard tonight. Its searchlight finds a figure on a gantry, holds it, and the chin turret turns. Over your radio, in clicks: *Civil Protection, confirm anticitizen.* You can see the figure. It is a CWU signalman with a lamp.'],
      choices: [
        { t: '“Confirm.”', tag: 'AMPUTATE', tagCls: 'risk', fx: { lp: 4, cons: -15 } },
        { t: '“Negative. CWU signal crew. Stand down.”', check: { skill: 'authority', diff: 10, okFx: { cons: 6, merit: 1 }, failFx: { cons: -6, susp: 3 } } },
      ],
    },
  ];

  /* build scenes */
  const scenes = {};
  V.forEach((v) => {
    scenes['rv_' + v.duty + '_' + v.id] = {
      title: v.title,
      text: (s) => [].concat(typeof v.text === 'function' ? v.text(s) : v.text),
      choices: (s) =>
        v.choices.map((c) => {
          const o = { t: c.t, tag: c.tag, tagCls: c.tagCls, lock: c.lock };
          if (c.check) o.check = { skill: c.check.skill, diff: c.check.diff, pass: c.go || END, fail: c.go || END, okFx: c.check.okFx, failFx: c.check.failFx };
          else (o.fx = c.fx), (o.go = c.go || END);
          return o;
        }),
    };
  });
  G.addScenes(scenes);
  G.ROUTINE_VARIANTS = V;

  /* hook every routine scene: 75% of the time, a vignette instead */
  const routineOf = {};
  Object.keys(G.duties).forEach((k) => (routineOf[G.duties[k].routine] = k));
  Object.keys(routineOf).forEach((sid) =>
    G.extend(sid, {
      before: (s) => {
        const duty = routineOf[sid];
        const pool = V.filter((v) => v.duty === duty && (!v.if || v.if(s)));
        if (!pool.length || Math.random() > 0.75) return;
        s.mem.rvUsed = s.mem.rvUsed || {};
        const used = s.mem.rvUsed[duty] || [];
        const fresh = pool.filter((v) => !used.includes(v.id));
        const v = pick(fresh.length ? fresh : pool);
        s.mem.rvUsed[duty] = used.concat(v.id).slice(-2);
        return 'rv_' + duty + '_' + v.id;
      },
    })
  );
})();
