/* GRID DUTY — "Lantern dock". The SC-9 Lantern scanner drones, from the inside.
   First shift: Lantern 0114 has come down on the roof of Stack 22. Get it back (a boy has its
   memory core), bring it back to life (circuit), decide what happens to the last thing it filmed,
   then fly it (the new LANTERN minigame).
   Routine shifts: a search flight over a block, dock maintenance, the footage backlog.

   LANTERN minigame: a block facade as a grid of windows. One of them holds the biosignal you are
   looking for. Each scan costs a charge and reads HOT (next to it), WARM (two away) or COLD.
   Find it before the charges or the battery run out. Radio & Protocol gives more charges. */
(function () {
  const END = 'u_duty_end';
  const pick = G.pick;
  const lvl = (k) => ((G.state().skills || {})[k] || 0);
  const sup = (s) => G.superiorOf(s).name;
  const mate = (s) => G.partnerOf(s).name;
  const IMG = '@img assets/img/drone-scanner.webp|SC-9 Lantern — GRID dock sheet';

  /* ============================================================ MINIGAME */
  G.MINIGAMES = G.MINIGAMES || {};
  const ROOMS = ['a kitchen, a pot on the ring', 'two children asleep in one bed', 'an old man at a window, looking straight at the lens', 'an empty room, a mattress on the floor', 'a woman ironing a CWU tunic', 'a curtain, drawn', 'a family eating in silence', 'a man pretending to sleep', 'a broken window taped with ration wrappers', 'someone praying', 'a radio, unplugged, on the table', 'three people around one candle'];
  G.MINIGAMES.lantern = (block, opts, done) => {
    const S = G.state();
    const cols = opts.cols || 6;
    const rows = opts.rows || 4;
    const charges0 = (opts.charges || 3) + Math.floor(lvl('comms') / 2);
    const secs = opts.seconds || 45;
    const target = { r: Math.floor(Math.random() * rows), c: Math.floor(Math.random() * cols) };
    G._lanternTarget = target;
    let charges = charges0, left = secs, over = false;
    const root = document.createElement('div');
    root.className = 'mini m3 lantern';
    root.innerHTML = `<div class="cr-head"><span class="cr-title">${opts.title || 'Lantern feed'}</span><span class="cr-clock"></span></div>
      <div class="m3-log">Signal: ${opts.who || 'one biosignal'}. Scan a window.</div>
      <div class="ln-grid" style="grid-template-columns:repeat(${cols},1fr)"></div>
      <div class="cr-help">Each scan costs a charge. <b>HOT</b>: the signal is in a window next to this one (sideways or diagonal). <b>WARM</b>: two windows away. <b>COLD</b>: further. Find the window before charges or battery run out.</div>`;
    const grid = root.querySelector('.ln-grid');
    const log = root.querySelector('.m3-log');
    const clock = () => (root.querySelector('.cr-clock').textContent = `${charges} scans · ${Math.ceil(left)}s`);
    const finish = (ok, msg) => {
      if (over) return;
      over = true;
      clearInterval(t);
      grid.querySelectorAll('button').forEach((b) => (b.disabled = true));
      const tb = grid.querySelector(`[data-r="${target.r}"][data-c="${target.c}"]`);
      if (tb) tb.classList.add('target');
      root.classList.add(ok ? 'won' : 'lost');
      log.textContent = msg;
      done(ok, { left: Math.ceil(left), used: charges0 - charges });
    };
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const b = document.createElement('button');
        b.className = 'ln-win';
        b.dataset.r = r;
        b.dataset.c = c;
        b.setAttribute('aria-label', `Window ${r + 1}-${c + 1}`);
        b.onclick = () => {
          if (over || b.classList.contains('scanned')) return;
          charges--;
          b.classList.add('scanned');
          const d = Math.max(Math.abs(r - target.r), Math.abs(c - target.c));
          if (d === 0) {
            b.classList.add('hit');
            b.textContent = 'MATCH';
            return finish(true, `Match. Biosignal confirmed, ${Math.ceil(left)}s of battery left. The flash fires once, and the face in the window goes white.`);
          }
          const read = d === 1 ? 'hot' : d === 2 ? 'warm' : 'cold';
          b.classList.add(read);
          b.textContent = read.toUpperCase();
          log.textContent = `${read.toUpperCase()} — ${pick(ROOMS)}.`;
          clock();
          if (charges <= 0) finish(false, 'Out of charges. The Lantern hangs there, collar turning, seeing everything except what it was sent for.');
        };
        grid.append(b);
      }
    clock();
    const t = setInterval(() => {
      if (!document.body.contains(root) || !root.closest('.block.current') || G.state() !== S) return clearInterval(t);
      if (document.hidden || over) return;
      left -= 0.25;
      clock();
      if (left <= 0) finish(false, 'Battery low. The Lantern turns for home on its own, and the signal goes back to being a rumour.');
    }, 250);
    block.append(root);
  };

  /* ============================================================ THE DUTY */
  G.divDuty({
    key: 'glantern',
    div: 'GRID',
    name: 'Lantern dock',
    desc: 'The scanner drones: recover, repair, review, fly.',
    block: 's22',
    first: {
      title: 'The Lantern dock — 06:40',
      text: (s) => [
        IMG,
        'Thirty wall cradles on the Nexus east wall, thirty SC-9 Lanterns charging in rows, collars turning slowly cyan in their sleep. Cradle 14 is empty.',
        `@say ${sup(s)}|Lantern 0114. Lost signal at 02:12 over Stack 22, came down on the roof. It was watching the stairwells. I want it back, I want it flying, and I want to know what it saw. In that order.`,
      ],
      choices: [{ t: 'Take a cable kit and go to Stack 22.', go: 'glan_roof' }],
    },
    routine: [
      {
        title: 'The Lantern dock — search flight',
        text: (s) => [IMG, `@say ${sup(s)}|JURY wants a biosignal located in Stack ${pick(['9', '14', '22'])}. One person, one window. Take a Lantern up and find it.`],
        choices: [
          { t: 'Fly it yourself.', tag: 'LANTERN', tagCls: 'duty', go: 'glan_fly_r' },
          { t: 'Put it on auto-search and do the paperwork.', check: { skill: 'comms', diff: 10, ok: ['The auto-search finds the window in forty minutes. JURY collects at noon.'], okFx: { merit: 3, xp: { comms: 1 } }, bad: ['The auto-search flags the wrong window. A family is taken to the Nexus and returned at 18:00 without an apology.'], badFx: { merit: -1, cons: -3 } } },
        ],
      },
      {
        title: 'The Lantern dock — maintenance',
        text: ['Six Lanterns in for service. Cracked collar lenses, a fan full of pigeon feathers, one with a chalk lambda drawn very carefully on the underside of its flash bar.'],
        choices: [
          { t: 'Service them and report the chalk.', tag: 'BY THE BOOK', tagCls: 'loyal', out: ['Six Lanterns back in their cradles. JURY photographs the lambda and asks which stairwell 0207 flies.'], fx: { merit: 3 } },
          { t: 'Service them and wipe the chalk off.', out: ['Six Lanterns, clean. Whoever drew it had to stand on something to reach.'], fx: { merit: 2, cons: 1 } },
        ],
      },
      {
        title: 'The Lantern dock — footage backlog',
        text: ['Nine hundred hours of Lantern footage waiting for review. JURY reviews it. Before JURY, GRID checks it plays. That is you, with a coffee, at 05:00.'],
        choices: [
          { t: 'Check every hour properly.', check: { skill: 'perception', diff: 10, ok: ['In hour 612 a man walks into the frame, looks up at the Lantern, and holds up a hand-lettered card: a CID number and the word SORRY. You flag it. JURY knows what to do with apologies.'], okFx: { merit: 4, xp: { perception: 1 } }, bad: ['Nine hundred hours. You fall asleep at hour 300 and wake with the screen still running.'], badFx: { merit: 1 } } },
          { t: 'Spot-check and sign it off.', out: ['Signed. Somewhere in nine hundred hours is something you will never know about.'], fx: { merit: 2 } },
        ],
      },
    ],
  });

  G.addScenes({
    glan_roof: {
      title: 'Stack 22 — the roof',
      enter: (s) => {
        G.unlock(s, 'scanners');
        s.mem.glan = { core: null, film: null };
      },
      text: [
        'Lantern 0114 lies on its side among the satellite stubs and the drying lines, one fan cowling crushed, the collar dark. Beside it, a slingshot made from a ration-tin lid and a strip of inner tube.',
        'The access panel is open. The memory core is gone.',
        'Across the roof, a boy of about twelve is sitting on the parapet with something small and copper-coloured in both hands, watching you the way you watch a dog that might bite.',
      ],
      choices: [
        { t: '“That belongs to the Union. Bring it here.”', tag: 'BY THE BOOK', tagCls: 'loyal', check: { skill: 'authority', diff: 5, pass: 'glan_core_given', fail: 'glan_core_thrown' } },
        { t: 'Sit down on the parapet, not too close. Offer him two tokens for it.', tag: 'MERCY', tagCls: 'mercy', lock: (s) => (s.tokens < 2 ? 'Not enough tokens' : null), fx: (s) => ((s.mem.glan.core = 'bought'), { tokens: -2, cons: 2 }), go: 'glan_core_bought' },
        { t: 'Ask him why he shot it down.', go: 'glan_why' },
      ],
    },
    glan_why: {
      text: [
        '@say The boy|It sits outside our window. Every night. My sister can’t sleep with the light going round. My mother says if it sees us talking it tells someone.',
        'He holds up the core. It is the size of a matchbox and still warm.',
        '@say The boy|Is it true? That it tells someone?',
      ],
      choices: [
        { t: '“Yes.” Hold out your hand.', fx: (s) => ((s.mem.glan.core = 'given'), { cons: 1 }), go: 'glan_core_given' },
        { t: '“No. It just watches.” Hold out your hand.', fx: (s) => ((s.mem.glan.core = 'given'), { cons: -1 }), go: 'glan_core_given' },
      ],
    },
    glan_core_given: {
      enter: (s) => {
        s.mem.glan.core = s.mem.glan.core || 'given';
      },
      text: ['He puts the core in your glove and goes back down through the roof hatch without looking at you. The slingshot stays on the parapet. You decide not to see it.'],
      choices: [{ t: 'Carry 0114 back to the dock.', go: 'glan_repair' }],
    },
    glan_core_bought: {
      text: ['He looks at the tokens for a long time, then at you, then takes them and puts the core in your glove. *“Don’t let it sit outside our window,”* he says. It is not a request you can grant, and both of you know it.'],
      choices: [{ t: 'Carry 0114 back to the dock.', go: 'glan_repair' }],
    },
    glan_core_thrown: {
      enter: (s) => {
        s.mem.glan.core = 'lost';
      },
      text: ['He looks at you, and then he throws the core as far as he can, out over the edge, and is gone down the hatch before it hits the street eleven floors below.', 'You find it in a puddle by the bins, cracked. Some of what 0114 saw is still in there. Some of it is in the puddle.'],
      choices: [{ t: 'Carry 0114 back to the dock.', fx: { merit: -1 }, go: 'glan_repair' }],
    },

    glan_repair: {
      title: 'The Lantern dock — bench 3',
      text: (s) => [`0114 on the bench, cowling off, the collar motor seized and the power loom chewed through where it hit the roof. ${mate(s)} hands you the iron without being asked.`, '@sys Rewire the power loom from the cell to the collar motor.'],
      mini: { type: 'circuit', opts: { title: 'Lantern 0114 — power loom', rows: 4, cols: 5, seconds: 45 }, pass: 'glan_repair_ok', fail: 'glan_repair_bad', skill: 'comms', diff: 10 },
    },
    glan_repair_ok: {
      text: ['The collar shivers and starts to turn. One lens, then six, cyan. 0114 lifts a centimetre off the bench on its good fan and settles back, as if it is surprised to be alive.'],
      choices: [{ t: 'Load the core.', fx: { xp: { comms: 1 } }, go: 'glan_film' }],
    },
    glan_repair_bad: {
      text: (s) => [`A spark, a smell of hot copper, and the collar stays dead. ${mate(s)} finishes it for you in ten minutes and does not mention it, which is worse.`],
      choices: [{ t: 'Load the core.', fx: { merit: -1 }, go: 'glan_film' }],
    },

    glan_film: {
      title: 'Lantern 0114 — last recording',
      text: (s) => {
        const lost = s.mem.glan.core === 'lost';
        return [
          lost ? 'The core is cracked. The last hour plays back in blocks and stutters, but it plays.' : 'The core is clean. The last hour plays back sharp and silent.',
          '01:58. Stack 22, the fourth-floor landing. Two units in UNION blue walk a citizen into the stairwell. The camera cannot see their designations. It can see what they do to him, and for how long.',
          '02:09. One of them looks up, straight into the lens, and takes off his mask to wipe his face. You know him. You have drunk with him.',
          '02:12. A shape on the roof edge. A slingshot. The image spins and goes black.',
          `@say ${mate(s)}|That goes to JURY. Doesn’t it.`,
        ];
      },
      choices: [
        { t: 'Send it to JURY. All of it.', tag: 'BY THE BOOK', tagCls: 'loyal', fx: (s) => ((s.mem.glan.film = 'jury'), { merit: 5, lp: 3, cons: 3 }), go: 'glan_fly' },
        { t: 'Cut 01:58 to 02:11. Log the gap as impact damage.', tag: 'COVER', tagCls: 'risk', fx: (s) => ((s.mem.glan.film = 'cut'), G.discipline && Math.random() < 0.3 && G.discipline(s, 'minor', 'Lantern 0114: gap in recording not consistent with impact'), { susp: 3, cons: -5 }), go: 'glan_fly' },
        { t: 'Send it to JURY, and keep a copy of your own.', tag: 'RISK', tagCls: 'risk', fx: (s) => ((s.mem.glan.film = 'copy'), (s.flags.lantern_copy = true), { merit: 3, susp: 4, res: 3 }), go: 'glan_fly' },
      ],
    },

    glan_fly: {
      title: 'Stack 22 — test flight',
      text: (s) => [
        '0114 has to prove itself before it goes back on the roster: a live search, one biosignal, one block.',
        s.mem.glan.film === 'jury' ? `@say ${sup(s)}|JURY has the recording. They want the citizen from the stairwell found: they want his statement. He is somewhere in Stack 22. Find his window.` : `@say ${sup(s)}|Test target: a citizen with an open file in Stack 22. Find his window.`,
      ],
      mini: { type: 'lantern', opts: { title: 'Lantern 0114 — Stack 22, east face', who: 'citizen, male, bruised ribs, elevated heart rate', charges: 3, seconds: 50 }, pass: 'glan_fly_ok', fail: 'glan_fly_bad', skill: 'comms', diff: 10 },
    },
    glan_fly_ok: {
      text: (s) => [
        'Fourth floor, third window. The flash fires once. On the feed a man with a swollen face looks up into the light and does not look away.',
        s.mem.glan.film === 'jury' ? 'JURY takes his statement at noon. Two UNION units are called to Level 4 at 14:00. One of them passes you in the corridor and does not look at you, which is how you know he knows.' : s.mem.glan.film === 'cut' ? 'His file stays open. Nobody asks him how he got the ribs, because nobody has a recording of how he got them.' : 'His file goes to JURY. Your copy goes into a ration tin under a loose floorboard, where it will either save someone or hang you.',
        '0114 goes back into cradle 14. The collar turns, cyan, all night.',
      ],
      choices: [{ t: 'End of shift.', fx: { merit: 5, xp: { comms: 1 }, rel: { foreman: 4 } }, go: END }],
    },
    glan_fly_bad: {
      text: ['0114 comes home on a dying battery with nothing on the feed but forty strangers’ windows. Foreman signs it off as *serviceable* anyway. The Union needs every eye it has.'],
      choices: [{ t: 'End of shift.', fx: { merit: 1 }, go: END }],
    },

    glan_fly_r: {
      title: 'The Lantern dock — search flight',
      text: ['@sys Take the Lantern up over the block and find the window.'],
      mini: { type: 'lantern', opts: (s) => ({ title: 'Lantern feed — search', who: pick(['citizen, female, CID flagged by JURY', 'citizen, male, missed relocation', 'CWU worker, absent from shift', 'citizen, child, reported missing']), charges: 3, seconds: 45 }), pass: 'glan_fly_r_ok', fail: 'glan_fly_r_bad', skill: 'comms', diff: 10 },
    },
    glan_fly_r_ok: {
      text: (s) => [`Found. ${s.lastMini ? `${s.lastMini.used} scans, ${s.lastMini.left}s of battery left.` : ''} JURY collects within the hour.`],
      choices: [{ t: 'End of shift.', fx: { merit: 4, xp: { comms: 1 } }, go: END }],
    },
    glan_fly_r_bad: {
      text: ['The Lantern comes home empty. JURY sends two units door to door instead, which takes all day and frightens everyone.'],
      choices: [{ t: 'End of shift.', fx: { merit: -1 }, go: END }],
    },
  });
})();
