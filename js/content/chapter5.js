/* CHAPTER FIVE — "The Academy". All divisions. The road to Field Officer.
   Vigil sends you to the Officer Academy: doctrine, a command exercise, a graduation board.
   At the same time VEIL begins to watch you. An envelope with an empty circle; a dead drop; a test.
   You can join VEIL in the shadow of your own division (you keep your armband, VEIL keeps you),
   refuse it, or report it. City 17 comes closer: a unit comes back from it, and will not say
   whose description they were given every morning.
   The man from City 17 is still never named. */
(function () {
  const pick = G.pick;
  const C = (s) => s.c5;
  const { adv, set } = G.chapter({ n: 5, stages: [[1, 'evening', 'c5_1'], [2, 'morning', 'c5_2'], [3, 'evening', 'c5_3'], [4, 'morning', 'c5_4']] });

  G.PEOPLE.censor = { name: '"Censor"', role: 'OA SqL · Academy instructor', img: 'censor' };
  G.PEOPLE.veilc = { name: 'The man with no patch', role: 'VEIL · no designation', img: 'veil-ofc' };

  /* Academy days replace the duty board's first line while you are a candidate */
  G.extend('u_board', {
    text: (lines, s) => {
      if (s.c5 && !s.c5.done && s.c5.stage >= 1) lines.splice(1, 0, '@sys OFFICER CANDIDATE: mornings at the Academy, afternoons with your division. Your team is led by your partner until you graduate.');
      return lines;
    },
  });

  const returned = (s) => {
    const m = s.squad && s.squad.members.find((x) => x.status === 'transferred' && x.lost === 'City 17');
    return m ? m.name : s.c4 && s.c4.sentName ? s.c4.sentName : '"Salt"';
  };

  G.addScenes({
    c5_start: {
      checkpoint: true,
      safe: true,
      title: 'Chapter Five',
      enter: (s) => {
        s.chapter = 5;
        s.c5 = { stage: 0, next: s.day, score: 0, veil: null, drop: null, ex: null, done: false };
        G.unlock(s, 'academy');
      },
      text: (s) => [
        '@big CHAPTER FIVE',
        '@sys ALL DIVISIONS · THE ACADEMY',
        `The transport from City 17 lands on the Nexus roof at dawn with eleven units on it. One of them is ${returned(s)}.`,
        `${returned(s).replace(/"/g, '')} walks into the muster hall thinner than you remember, and sits down, and does not take off the mask for the whole briefing. Afterwards, in the locker room, they say only one thing about City 17:`,
        `@say ${returned(s).replace(/"/g, '')}|Every morning they gave us a description and a sector. Every morning the same description. Male. Thirties. They never said a name. After a while you stop needing one.`,
        '@portrait assets/img/portraits/vigil.webp|Field Commander Vigil',
        '@say Vigil|The Union is short of officers. City 17 is spending them faster than cities can make them. I am sending three units from this precinct to the Officer Academy. You are one.',
      ],
      choices: [
        { t: '“Thank you, Commander.”', tag: 'BY THE BOOK', tagCls: 'loyal', fx: (s) => ({ lp: 2, rel: { vigil: 4 } }), go: 'c5_0' },
        { t: '“Why me?”', check: { skill: 'authority', diff: 5, pass: 'c5_start_why', fail: 'c5_start_why_bad' } },
      ],
    },
    c5_start_why: {
      text: ['@say Vigil|Because you have done things your file does not show, and your file is still clean. Either you are very good, or very careful. The Academy will find out which. So will others.', 'You do not ask who the others are.'],
      choices: [{ t: 'To the Academy.', fx: (s) => ({ rel: { vigil: 6 } }), go: 'c5_0' }],
    },
    c5_start_why_bad: {
      text: ['@say Vigil|Because I said so. That is the first lesson of command. You can stop taking notes.'],
      choices: [{ t: 'To the Academy.', fx: (s) => (null), go: 'c5_0' }],
    },

    /* ============================================ the Academy: doctrine */
    c5_0: {
      title: 'The Officer Academy — Nexus, sixth floor',
      text: [
        '@img assets/img/env/e34-academy.webp|The Officer Academy, sixth floor of the Nexus',
        'The Academy is a single long room with violet carpet and windows that look at the Spire. Twelve candidates from every division sit at steel desks. At the front stands an instructor in a long greatcoat with a violet armband: two stars, a crest stripe of violet edged in silver. The Academy calls the instructor *Censor*.',
        '@portrait assets/img/portraits/censor.webp|CCA.C9.D1-OA-SqL-00733 — "Censor"',
        '@say Censor|Units obey. Officers decide what obedience is for. Your first lesson. A district is starving. The ration is cut. A crowd forms at an RDT. You have three teams and Overwatch on the roof. Doctrine, candidate?',
      ],
      choices: [
        { t: '“Preserve the RDT. Disperse the crowd before Overwatch must.”', tag: 'BY THE BOOK', tagCls: 'loyal', fx: (s) => ((s.c5.score += 1), null), go: 'c5_0b' },
        { t: '“Feed the front of the queue first. Hungry crowds follow full ones home.”', check: { skill: 'authority', diff: 10, pass: 'c5_0_good', fail: 'c5_0b' } },
        { t: '“Remove the agitators the night before. There is no crowd without a voice.”', tag: 'BRUTAL', tagCls: 'risk', fx: (s) => ((s.c5.score += 1), { cons: -3 }), go: 'c5_0b' },
      ],
    },
    c5_0_good: {
      text: ['@say Censor|Unorthodox. Effective. And the only answer today that would still work tomorrow. Sit down.'],
      choices: [{ t: 'Continue.', fx: (s) => ((s.c5.score += 2), { xp: { authority: 1 } }), go: 'c5_0b' }],
    },
    c5_0b: {
      text: (s) => [
        'The afternoon is maps, logistics, radio nets, and the Academy’s favourite exercise: rewriting a real report from the city so that it says what a superior wants to hear, without a single false word.',
        s.squad && s.squad.formed ? `When you get back to the precinct, ${G.partnerOf(s).name} has run your team for the day. Nothing went wrong. You find you are almost disappointed.` : 'When you get back to the precinct, nobody asks how it went.',
      ],
      choices: [{ t: 'To the duty board.', fx: adv(1), go: 'u_board' }],
    },

    /* ============================================ VEIL: the envelope */
    c5_1: {
      title: (s) => `Evening — Day ${s.day}`,
      enter: (s) => G.unlock(s, 'veil'),
      text: (s) => [
        'There is an envelope on your bunk. Your door was locked. The envelope is heavy grey paper, sealed with black wax, and pressed into the wax there is nothing — a perfect empty circle.',
        'Inside, a single typed line: *Stack 22, the stairwell, 23:00. Come out of uniform. Come alone. You were never invited.*',
        s.res >= 30 ? 'You think of the canal cells, and of every chalk circle you have ever seen with a line through it. This one has no line.' : 'You think of every rumour about officers who vanished overnight from their squads.',
      ],
      choices: [
        { t: 'Go.', tag: 'VEIL', tagCls: 'duty', go: 'c5_1_meet' },
        { t: 'Burn it. Go to bed.', fx: adv(1, (st) => ((st.c5.veil = 'ignored'), null)), go: 'u_night' },
        { t: 'Take it to Vigil’s duty officer tonight.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: adv(1, (st) => ((st.c5.veil = 'reported'), { lp: 3, merit: 3 })), go: 'c5_1_report' },
      ],
    },
    c5_1_report: {
      text: ['The duty officer looks at the empty circle in the wax for a long time. Then he hands the envelope back to you.', '@say Duty officer|I did not see this. Neither did you. Go to bed, candidate, and do not do this again. Some doors are not Vigil’s either.'],
      choices: [{ t: 'Go to bed.', go: 'u_night' }],
    },
    c5_1_meet: {
      title: 'Stack 22 — the stairwell, 23:00',
      text: (s) => [
        '@img assets/img/env/e35-veil-stairwell.webp|Stack 22, the fourth landing',
        'The stairwell light is out on every floor. On the fourth landing someone is standing very still against the wall in a black jacket with a black armband: a dull grey bar, a dull grey star, an empty circle. Where the designation patch should be there is a strip of black tape.',
        '@portrait assets/img/portraits/veil-ofc.webp|No designation',
        '@say VEIL|You are going to be an officer. That makes you interesting. Before it makes you useful, we would like to know what you are.',
        s.res >= 40 ? '@say VEIL|We know about the canals. All of it. Do not insult me by asking how. The question is not what you did. The question is whether you can do it for us instead.' : s.susp >= 50 ? '@say VEIL|JURY thinks you are dirty. JURY thinks everyone is dirty. We think you are careful. Careful is rarer.' : '@say VEIL|Your file is clean. Clean files are either very good or very well kept. We would like to know which.',
        '@say VEIL|In three days, a dead drop. A citizen will leave something behind a broken tile in the Plaza 5 cinema. Follow whoever collects it. Tell us where they go. Tell nobody that you did.',
      ],
      choices: [
        { t: '“I will be there.”', tag: 'VEIL', tagCls: 'duty', fx: adv(1, (st) => ((st.c5.veil = 'accepted'), G.fx(st, { rel: { veilc: 10 } }), { susp: -5 })), go: 'u_night' },
        { t: '“I serve my division and the Commander. Not a strip of tape.”', fx: adv(1, (st) => ((st.c5.veil = 'refused'), { lp: 2 })), go: 'c5_1_refuse' },
      ],
    },
    c5_1_refuse: {
      text: ['@say VEIL|Good answer. Wrong, but good. We will ask once more, later, when you have something to lose.', 'When you look up from the stairs, the landing is empty.'],
      choices: [{ t: 'Go home.', go: 'u_night' }],
    },

    /* ============================================ command exercise */
    c5_2: {
      checkpoint: true,
      title: 'Academy command exercise — Stack 22',
      text: (s) => [
        '@say Censor|Today you command. A live drill: Stack 22 is evacuated for a gas-main inspection. Six hundred citizens, three exits, and every team in the precinct answering to you. It is not a real emergency. Nobody in Stack 22 knows that.',
        'Censor stands behind you with a slate. Two other candidates watch from the courtyard wall, waiting for their turn, hoping you fail.',
      ],
      choices: [
        { t: 'Take command of the evacuation.', tag: 'COMMAND', tagCls: 'duty', go: 'c5_2_drill' },
        { t: '“Tell them it is a drill, Instructor. Frightened crowds kill people.”', check: { skill: 'authority', diff: 15, pass: 'c5_2_told', fail: 'c5_2_drill' } },
      ],
    },
    c5_2_told: {
      text: ['@say Censor|Denied. But noted. — Fine. We tell the first floor. The rest will learn it from the first floor, which is how a city really works.'],
      choices: [{ t: 'Take command.', fx: (s) => ((s.c5.told = true), (s.c5.score += 1), null), go: 'c5_2_drill' }],
    },
    c5_2_drill: {
      title: 'Stack 22 — the courtyard',
      text: ['@sys Crowd control, in command. Your teams are your units. Keep every exit under the boil until the stack is empty.'],
      mini: {
        type: 'crowd',
        opts: (s) => {
          const o = G.crowdOpts(s, { block: 's22', title: 'Command exercise — Stack 22', seconds: 45, sectors: ['North stairwell', 'Main gate', 'Courtyard'], events: ['Someone shouts that it is a gas leak', 'An old man refuses to leave without his radio', 'A child is lost on the fourth floor', 'Two families fight over a bundle of blankets', 'Someone recognises one of your units and says his name'] });
          o.units = Math.max(o.units, 4);
          if (s.c5.told) o.start = o.start.map((v) => Math.max(5, v - 10));
          return o;
        },
        pass: 'c5_2_ok',
        fail: 'c5_2_bad',
        skill: 'authority',
        diff: 15,
      },
    },
    c5_2_ok: {
      text: (s) => ['Stack 22 empties in nineteen minutes. Censor writes for a long time.', s.lastMini && s.lastMini.force ? '@say Censor|Batons in a drill. Effective. Remembered. You will learn that an officer’s force lasts longer than a unit’s.' : '@say Censor|No force. No losses. Good. The other candidates will hate you for it.'],
      choices: [{ t: 'Continue.', fx: adv(1, (st) => ((st.c5.ex = 'ok'), (st.c5.score += st.lastMini && st.lastMini.force ? 1 : 2), { merit: 5, xp: { authority: 1 } })), go: 'u_duty_end' }],
    },
    c5_2_bad: {
      text: ['The north stairwell jams. Somebody falls. By the time your teams clear it, the drill has stopped being a drill for an old woman on the third landing, who is carried down by HELIX.', '@say Censor|That is the lesson, candidate. Write it down.'],
      choices: [{ t: 'Continue.', fx: adv(1, (st) => ((st.c5.ex = 'bad'), { cons: -3 })), go: 'u_duty_end' }],
    },

    /* ============================================ VEIL's test, or VEIL's warning */
    c5_3: {
      title: (s) => `Evening — Day ${s.day}`,
      enter: (s) => {
        if (s.c5.veil !== 'accepted') return 'c5_3_other';
      },
      text: ['Plaza 5 at dusk. The cinema is closed. Behind the third broken tile left of the door, something has been left: a ration tin, sealed. You stand in a doorway across the square in a citizen jacket and wait.', 'At 20:40 a woman in a CWU jacket kneels, takes the tin, and walks away toward Bazaar Row.'],
      choices: [
        { t: 'Follow her.', tag: 'TAIL', tagCls: 'duty', go: 'c5_3_tail' },
        { t: 'Let her go. Tell VEIL you lost her.', fx: adv(1, (st) => ((st.c5.drop = 'let'), { cons: 2, rel: { veilc: -10 } })), go: 'u_night' },
      ],
    },
    c5_3_tail: {
      text: ['@sys Follow without being seen.'],
      mini: { type: 'tail', opts: { title: 'VEIL — the dead drop', steps: 8, success: 'She stops at a pump-house door in the Canal Quarter and knocks: twice, then once. You know that knock.' }, pass: 'c5_3_tail_ok', fail: 'c5_3_tail_bad', skill: 'perception', diff: 15 },
    },
    c5_3_tail_ok: {
      text: (s) => ['Pump house 4. A canal cell door. You knew it would be, as soon as you saw the knock.', s.res >= 30 ? 'You know some of the people behind that door. They know you.' : 'Behind that door, people are planning something. VEIL wants to know what.'],
      choices: [
        { t: 'Report pump house 4 to VEIL.', tag: 'VEIL', tagCls: 'duty', fx: adv(1, (st) => ((st.c5.drop = 'reported'), G.fx(st, { rel: { veilc: 15 } }), { res: -15, cons: -6 })), go: 'u_night' },
        { t: 'Report a different pump house.', tag: 'RISK', tagCls: 'risk', check: { skill: 'deception', diff: 15, pass: 'c5_3_lie_ok', fail: 'c5_3_lie_bad' } },
      ],
    },
    c5_3_lie_ok: { text: ['You give them pump house 2. VEIL thanks you in no words at all. Somewhere a door is watched that nobody uses.'], choices: [{ t: 'Go home.', fx: adv(1, (st) => ((st.c5.drop = 'lied'), { res: 8, cons: 4 })), go: 'u_night' }] },
    c5_3_lie_bad: { text: ['A second envelope is on your bunk when you get home. Inside, a photograph of you, in a citizen jacket, outside pump house 4. Nothing else.'], choices: [{ t: 'Go to bed. Do not sleep.', fx: adv(1, (st) => ((st.c5.drop = 'caught'), { susp: 10, rel: { veilc: -20 } })), go: 'u_night' }] },
    c5_3_tail_bad: { text: ['You lose her in the crowd on Bazaar Row, or she loses you. When you get home there is an empty circle chalked on your locker, very neatly.'], choices: [{ t: 'Go to bed.', fx: adv(1, (st) => ((st.c5.drop = 'lost'), { rel: { veilc: -5 } })), go: 'u_night' }] },
    c5_3_other: {
      text: (s) => [
        s.c5.veil === 'reported' ? 'One of the other Academy candidates is not at his desk this evening. His bunk in the officer wing has been stripped. His file, a clerk says, reads *Transferred: Officer Academy*. He was already at the Officer Academy.' : 'One of the other Academy candidates is not at her desk this evening. Her bunk has been stripped, the mattress rolled. Nobody says where she went. On her locker, a perfect empty circle in chalk.',
        'You understand that somebody else said yes.',
      ],
      choices: [{ t: 'Go home.', fx: adv(1), go: 'u_night' }],
    },

    /* ============================================ graduation */
    c5_4: {
      checkpoint: true,
      title: 'The Academy — graduation board',
      text: (s) => [
        'The graduation board is Censor, Vigil, and a third chair with nobody in it. The third chair has a black armband folded on its seat.',
        `@doc CANDIDATE ASSESSMENT — ${G.short(s)}\nDOCTRINE: ${s.c5.score >= 3 ? 'DISTINCTION' : s.c5.score >= 2 ? 'PASS' : 'MARGINAL'}\nCOMMAND EXERCISE: ${s.c5.ex === 'ok' ? 'PASS' : 'FAIL'}\nDISCIPLINE: ${s.disc && s.disc.w ? s.disc.w + ' active strike(s)' : 'clean'}`,
        '@say Censor|One question, candidate. An order reaches you that you believe is wrong. Lawful, but wrong. What do you do?',
      ],
      choices: [
        { t: '“Carry it out, and report my objection in writing.”', tag: 'BY THE BOOK', tagCls: 'loyal', fx: (s) => ((s.c5.score += 1), null), go: 'c5_4_result' },
        { t: '“Carry it out in the way that does the least harm.”', check: { skill: 'deception', diff: 5, pass: 'c5_4_wise', fail: 'c5_4_result' } },
        { t: '“Refuse it.”', tag: 'RISK', tagCls: 'risk', fx: (s) => ((s.c5.refused = true), null), go: 'c5_4_result' },
      ],
    },
    c5_4_wise: { text: ['Vigil, for the first time in your hearing, almost laughs.'], choices: [{ t: 'Continue.', fx: (s) => ((s.c5.score += 2), null), go: 'c5_4_result' }] },
    c5_4_result: {
      enter: (s) => {
        const c = s.c5;
        const pts = c.score + (c.ex === 'ok' ? 2 : 0) - (s.disc && s.disc.w ? 1 : 0) - (c.refused ? 1 : 0);
        c.grad = pts >= 3 && s.susp < 75;
        if (c.grad) {
          const target = G.rankIdx(s.rank) >= G.rankIdx('EpU') ? 'OfC' : G.RANKS[G.rankIdx(s.rank) + 1];
          G.promote(s, target);
          G.fx(s, { merit: 10, lp: 3 });
        } else G.fx(s, { merit: -5 });
        c.done = true;
        c.stage = 9;
      },
      text: (s) => {
        const c = s.c5;
        const L = [];
        if (c.grad && s.rank === 'OfC') L.push('@say Vigil|Field Officer. The crest stripe will be painted tonight. You will lead units now, and units will die because of what you decide. Some of them would have died anyway. Learn the difference, quickly.');
        else if (c.grad) L.push('@say Vigil|You graduate, and you will be an officer — when your grade allows it. Until then you are the best-trained unit in this precinct. Behave accordingly.');
        else L.push('@say Censor|Not this cycle. The Academy will take you again when your file is ready. Most candidates come twice.');
        if (c.veil === 'accepted' && c.drop !== 'caught' && c.grad) {
          L.push('When the board stands, Vigil and Censor leave first. The third chair stays where it is. After a moment you pick up the black armband from its seat. There is a note pinned to it: *Not yet. Keep your own colours. We will find you when we need you. — V.*');
          s.flags.veil_shadow = true;
          G.fx(s, { rel: { veilc: 10 } });
        }
        if (c.grad) L.push(`@doc PROMOTION: ${G.desig(s)}`);
        return L;
      },
      choices: [{ t: 'Continue.', go: 'c5_end' }],
    },

    c5_end: {
      checkpoint: true,
      title: 'End of Chapter Five',
      text: (s) => [
        s.flags.veil_shadow ? 'You keep your division’s armband. In your locker, wrapped in a ration sack, a black one. You do not know what it obliges you to do. You suspect that is the point.' : s.c5.veil === 'refused' ? 'VEIL said it would ask again. You find yourself checking your bunk for envelopes every night.' : s.c5.veil === 'reported' ? 'The duty officer who did not see your envelope is transferred to City 4 the following week.' : 'You never learn who left the envelope. That is the kind of thing you never learn.',
        `${returned(s).replace(/"/g, '')} asks to go back to City 17. The request is granted within the hour. On their last night they leave you a single line on a ration wrapper: *if they give you the description, do not look for him. look for the people helping him.*`,
        '@radio …all cities, all divisions: Civil Protection reserves will be drawn by quota from each city on a weekly basis. Officers will select. Overwatch will collect.',
        `@doc ${G.desig(s)}\nDIVISION: ${s.div}\nRANK: ${G.RANK_NAMES[s.rank].toUpperCase()}\nDAYS IN SERVICE: ${s.day}`,
        '@sys CHAPTER FIVE COMPLETE. You can keep serving on the duty board. Chapter Six is coming.',
      ],
      choices: [{ t: 'Return to duty.', go: 'u_duty_end' }],
    },
  });

  /* ================================================ VEIL in the shadow: two duties */
  if (G.divDuty) {
    const c = (t, out, fx, tag, tagCls) => ({ t, out, fx, tag, tagCls });
    const rv = (title, text, choices) => ({ title, text, choices });
    const veilOk = (s) => !!s.flags.veil_shadow;
    ['UNION', 'JURY', 'HELIX', 'RAZOR', 'SPEAR', 'VECTOR', 'GRID'].forEach((div) => {
      G.divDuty({
        key: 'veil_drop_' + div.toLowerCase(),
        div,
        if: veilOk,
        name: '◯ Unlisted assignment',
        desc: 'An envelope with an empty circle. Nobody else sees this line on the board.',
        first: rv('Unlisted — a dead drop', ['A ration tin behind a loose brick in the Stacks. Inside: a list of three designations from your own precinct, and one word typed beneath them: *observe*.'], [
          c('Observe them. Report to VEIL.', ['Three units, three days, three short reports under no designation at all.'], { susp: -4, cons: -3 }, 'VEIL', 'duty'),
          c('Warn the one you trust.', ['You say nothing, exactly; you just stand next to them in the mess and mention the weather in Stack 22. They understand.'], { cons: 4, susp: 3 }, 'RISK', 'risk'),
        ]),
        routine: [rv('Unlisted', ['A blank envelope. A time. A place. A face to remember.'], [c('Remember it.', ['You remember it.'], { susp: -2 })])],
      });
    });
  }

  G.addCodex({
    academy: {
      title: 'The Officer Academy',
      body: `<img src="assets/img/env/e34-academy.webp" alt="Officer Academy" loading="lazy"><p>The sixth floor of the Nexus. Candidates are selected by the Field Commander from units of grade 01 and above, and from Elite Protection Units. Doctrine in the mornings, their own divisions in the afternoons, and a command exercise in a live district.</p>
      <p>Instructors wear violet armbands and the crest stripe of the OA. Graduates are made Field Officers when their grade allows. Most candidates are sent back once before they graduate. Some candidates do not come back at all; their files read <i>Transferred: Officer Academy</i>.</p>`,
    },
  });
  const grp = G.CODEX_GROUPS.find((g) => g.title === 'Civil Protection');
  if (grp) grp.ids.push('academy');
  G.extend('c5_0', { after: (s) => s.rel.censor === undefined && G.fx(s, { rel: { censor: 0 } }) });
})();
