/* THE NIGHT DESK — four Lantern feeds at once (GRID and JURY night duty).
   Each feed shows a window, a landing or a culvert, a few seconds at a time, and the scene moves on
   in three beats. Some people are doing something (a signal lamp, a parcel, a spliced wire), some
   only look as if they are (a child flashing a torch to a friend, a man crying, paper burned for
   warmth), most are living their evening. ZOOM shows the face and jumps the feed a beat ahead, at
   the cost of seconds. You have three FLAGS. Everyone you flag gets a file with their face, and
   JURY collects at 06:00 — so they can come back as echoes later. */
(function () {
  const pick = G.pick;
  const lvl = (k) => ((G.state().skills || {})[k] || 0);
  const SUBJECTS = {
    genuine: [
      ['Fourth floor, window 3. A man alone at a table.', 'He takes a lamp out from under the bed.', 'He flashes it towards the canal: three long, one short.', 'a signal lamp'],
      ['A landing. A woman with a laundry basket.', 'She stops at a door that is not hers and knocks twice.', 'The laundry goes in. A heavier basket comes out.', 'a swapped basket'],
      ['The culvert by Lock 3. Two figures in the dark.', 'One hands the other a parcel the size of a radio battery.', 'They split up in opposite directions, fast.', 'a hand-over at the culvert'],
      ['A rooftop. Someone kneeling by an antenna.', 'They are splicing a wire into its base.', 'The new wire runs down a drainpipe into a dark window.', 'a spliced antenna'],
      ['A kitchen window. A young man, very still.', 'He is copying something from a radio onto paper.', 'He folds the paper into a ration wrapper and seals it.', 'a copied broadcast'],
      ['A stairwell. Someone chalking at knee height.', 'A circle. Then a line through it.', 'A lambda, small and neat, where the Lantern only just sees it.', 'chalk on the stairwell'],
    ],
    odd: [
      ['A man pacing his room.', 'He stops and stares straight up at the Lantern.', 'He sits on the bed and cries into his hands.', 'a man crying'],
      ['A woman burning paper in a tin.', 'Ration wrappers, one at a time.', 'She holds her hands over the flame. It is cold in Stack 9.', 'paper burned for warmth'],
      ['A child at a window with a torch.', 'Flashing it on and off.', 'Across the courtyard another child flashes back. They are laughing.', 'two children with torches'],
      ['Two people on a landing after curfew.', 'One presses something small into the other’s hand.', 'A pill. The other one hugs them and goes back inside.', 'medicine between neighbours'],
      ['An old woman at an open window, at midnight.', 'She is calling softly into the dark.', 'A cat comes along the ledge. She lifts it in.', 'a woman calling her cat'],
    ],
    innocent: [
      ['A family eating in silence.', 'The youngest pushes his bowl to his mother.', 'She pushes it back.', 'a family at supper'],
      ['An old man asleep in a chair.', 'The radio beside him plays the Administrator.', 'He does not wake up.', 'an old man asleep'],
      ['A woman ironing a CWU tunic.', 'She checks the collar twice.', 'She hangs it on the door and turns out the light.', 'a woman ironing'],
      ['A man reading a ration bulletin to his son.', 'The boy is asleep.', 'He keeps reading anyway, very quietly.', 'a man reading'],
      ['Two teenagers on a landing.', 'Sitting too close together.', 'A door opens upstairs and they jump apart.', 'two teenagers'],
    ],
  };
  const PLACES = ['STACK 9 · N', 'STACK 9 · E', 'STACK 14 · S', 'STACK 14 · W', 'STACK 22 · E', 'STACK 22 · N', 'LOCK 3', 'BAZAAR ROW'];

  G.MINIGAMES = G.MINIGAMES || {};
  G.MINIGAMES.desk = (block, opts, done) => {
    const S = G.state();
    const secs = (opts.seconds || 80) + lvl('perception') * 2;
    const flagsMax = opts.flags || 3;
    /* one beat of a scene; Perception gives a little more time to read */
    const BEAT = 4500 + lvl('perception') * 200;
    let left = secs, flags = 0, over = false, zoomed = -1;
    const flagged = [];
    let missed = 0;
    const newSubject = () => {
      const r = Math.random();
      const kind = r < 0.36 ? 'genuine' : r < 0.64 ? 'odd' : 'innocent';
      const shown = (typeof feeds !== 'undefined' ? feeds : []).map((f) => f && f.frames[0]);
      const pool = SUBJECTS[kind].filter((x) => !shown.includes(x[0]));
      const t = pick(pool.length ? pool : SUBJECTS[kind]);
      const face = G.pickFace ? G.pickFace(kind === 'genuine' ? 'rebel' : false) : 0;
      return { kind, frames: t.slice(0, 3), what: t[3], face, beat: 0, next: Date.now() + BEAT, place: pick(PLACES), cid: String(10000 + Math.floor(Math.random() * 89999)), flagged: false, zoom: false };
    };
    const feeds = [];
    for (let i = 0; i < 4; i++) feeds.push(newSubject());
    /* the feeds are staggered so they never all change at once */
    feeds.forEach((f, i) => (f.next = Date.now() + BEAT + i * 1300));
    G._deskFeeds = feeds;
    const root = document.createElement('div');
    root.className = 'mini m3 desk';
    root.innerHTML = `<div class="cr-head"><span class="cr-title">${opts.title || 'Night desk'}</span><span class="cr-clock"></span></div>
      <div class="m3-log">Four Lantern feeds. ${flagsMax} flags. JURY collects at 06:00.</div><div class="dk-grid"></div>
      <div class="cr-help"><b>ZOOM</b> shows the face, moves the feed a beat ahead and holds it still while you read (costs 3 seconds). <b>FLAG</b> sends the person to JURY: they get a file. Some people only look guilty.</div>`;
    const grid = root.querySelector('.dk-grid');
    const log = root.querySelector('.m3-log');
    const clock = () => (root.querySelector('.cr-clock').textContent = `${flagsMax - flags} flags · ${Math.max(0, Math.ceil(left))}s`);
    const draw = () => {
      grid.innerHTML = '';
      feeds.forEach((f, i) => {
        const c = document.createElement('div');
        c.className = 'dk-feed' + (f.flagged ? ' flagged' : '') + (zoomed === i ? ' zoomed' : '');
        c.innerHTML = `<div class="dk-head"><span>LANTERN 01${14 + i * 7} · ${f.place}</span><i></i></div>
          <div class="dk-view">${zoomed === i && G.DOC_FACES ? `<img src="${G.DOC_FACES[f.face].img}" alt="">` : ''}<p>${f.frames.slice(0, f.beat + 1).map((x, j) => `<span class="${j === f.beat ? 'now' : ''}">${x}</span>`).join(' ')}</p></div>
          <div class="dk-btns"><button class="cr-btn" data-a="zoom" ${over || f.flagged ? 'disabled' : ''}>ZOOM</button><button class="cr-btn danger" data-a="flag" ${over || f.flagged || flags >= flagsMax ? 'disabled' : ''}>${f.flagged ? 'FLAGGED' : 'FLAG'}</button></div>`;
        c.querySelector('[data-a="zoom"]').onclick = () => {
          if (over) return;
          zoomed = i;
          f.zoom = true;
          if (f.beat < 2) (f.beat++, (f.next = Date.now() + BEAT));
          left -= 3;
          clock();
          draw();
        };
        c.querySelector('[data-a="flag"]').onclick = () => {
          if (over || f.flagged || flags >= flagsMax) return;
          f.flagged = true;
          flags++;
          flagged.push({ kind: f.kind, what: f.what, face: f.face, cid: f.cid, place: f.place, frame: f.frames[f.beat] });
          log.textContent = `Flagged: ${f.place}. ${flags < flagsMax ? `${flagsMax - flags} left.` : 'No flags left.'}`;
          clock();
          draw();
        };
        grid.append(c);
      });
    };
    const finish = () => {
      if (over) return;
      over = true;
      clearInterval(t);
      draw();
      const good = flagged.filter((x) => x.kind === 'genuine').length;
      const wrong = flagged.length - good;
      const ok = good >= 1 && good > wrong;
      root.classList.add(ok ? 'won' : 'lost');
      log.textContent = `End of shift. ${flagged.length} flagged.`;
      done(ok, { flagged, missed, good, wrong });
    };
    const t = setInterval(() => {
      if (!document.body.contains(root) || !root.closest('.block.current') || G.state() !== S) return clearInterval(t);
      if (document.hidden || over) return;
      left -= 0.25;
      const now = Date.now();
      let changed = false;
      feeds.forEach((f, i) => {
        /* the zoomed feed holds still while you read it */
        if (zoomed === i && !f.flagged) return void (f.next += 250);
        if (now < f.next) return;
        if (f.beat < 2) f.beat++;
        else {
          if (f.kind === 'genuine' && !f.flagged) missed++;
          feeds[i] = newSubject();
          if (zoomed === i) zoomed = -1;
        }
        feeds[i].next = now + BEAT;
        changed = true;
      });
      clock();
      if (changed) draw();
      if (left <= 0) finish();
    }, 250);
    clock();
    draw();
    block.append(root);
  };

  /* ============================================================ DUTIES */
  const start = (div) => ({
    title: div === 'GRID' ? 'The Lantern desk — 22:00' : 'Level 4 — surveillance review, 22:00',
    text: (s) => [
      div === 'GRID' ? 'Four screens, four Lanterns, eight hours. The desk is a GRID job because GRID keeps the feeds alive. What the feeds see is JURY’s.' : 'JURY reviews the Lantern feeds live at night: four screens, a mug, a stack of blank flag slips. Whoever you flag is collected at 06:00.',
      `@say ${G.superiorOf(s).name}|Three flags. Use them on people who are doing something, not on people who look like they might be. There is a difference. Some nights it is very small.`,
    ],
    choices: [{ t: 'Sit down at the desk.', tag: 'NIGHT DESK', tagCls: 'duty', go: 'desk_run' }],
  });
  G.divDuty({ key: 'gdesk', div: 'GRID', name: 'Lantern night desk', desc: 'Watch four drone feeds through the night. Three flags.', first: start('GRID'), routine: [start('GRID')] });
  G.divDuty({ key: 'jdesk', div: 'JURY', name: 'Surveillance review', desc: 'Review four Lantern feeds live. Whoever you flag is collected at dawn.', first: start('JURY'), routine: [start('JURY')] });

  G.addScenes({
    desk_run: {
      title: 'Night desk',
      text: ['@sys Four feeds. Watch, zoom, flag.'],
      mini: { type: 'desk', opts: { title: 'Lantern feeds — District 5', seconds: 80, flags: 3 }, pass: 'desk_res', fail: 'desk_res', skill: 'perception', diff: 10 },
    },
    desk_res: {
      title: '06:00 — collection',
      enter: (s) => {
        const r = s.lastMini || { flagged: [], missed: 0, good: 0, wrong: 0 };
        s.mem.desk = r;
        r.flagged.forEach((x) => {
          G.fileCitizen(s, { cid: x.cid, type: x.kind === 'genuine' ? 'watch' : 'standard', desc: G.faceDesc ? G.faceDesc(x.face) : 'a citizen', face: x.face, points: x.kind === 'genuine' ? 6 : 2 }, 4, 'FLAGGED (Lantern)');
          if (x.kind !== 'genuine' && G.homeBlock) G.distFx(s, G.homeBlock(x.cid), 2, 5);
        });
        G.fx(s, { merit: r.good * 3 - (r.missed >= 2 ? 2 : 0), cons: -4 * r.wrong + (r.flagged.length === 0 ? 2 : 0), xp: { perception: 1 } });
      },
      text: (s) => {
        const r = s.mem.desk;
        if (!r || !r.flagged) return ['@sys The shift ends with nothing flagged. The feeds go on without you.'];
        return [
          r.flagged.length ? `@doc COLLECTION LIST — 06:00\n${r.flagged.map((x) => `CID ${x.cid} · ${x.place} · “${x.frame}”`).join('\n')}` : '@sys You flagged nobody. The slips go back in the drawer, blank.',
          ...r.flagged.map((x) => `@portrait ${G.DOC_FACES[x.face].img}|CID ${x.cid} — ${x.kind === 'genuine' ? 'it was ' + x.what : 'it was only ' + x.what}`),
          r.good ? `JURY's morning report thanks the desk for ${r.good === 1 ? 'one genuine contact' : r.good + ' genuine contacts'}.` : null,
          r.wrong ? `${r.wrong === 1 ? 'One of the people' : r.wrong + ' of the people'} you flagged ${r.wrong === 1 ? 'was' : 'were'} doing nothing at all. JURY collects them anyway. JURY will let them go, eventually, probably.` : null,
          r.missed >= 2 ? `@sys ${r.missed} things happened on your screens that you did not flag.` : null,
        ];
      },
      choices: (s) => {
        const r = s.mem.desk || { wrong: 0 };
        const out = [];
        if (r.wrong) out.push({ t: 'Pull the wrong slips before 06:00. Say you misread the feed.', tag: 'MERCY', tagCls: 'mercy', fx: (st) => (st.mem.desk.flagged.filter((x) => x.kind !== 'genuine').forEach((x) => st.files[x.cid] && ((st.files[x.cid].lastVerdict = 'RELEASED'), (st.files[x.cid].points = 2))), { merit: -2, cons: 4, susp: 3 }), go: 'u_duty_end' });
        out.push({ t: 'Sign the list and go to bed.', go: 'u_duty_end' });
        return out;
      },
    },
  });

  G.addCodex({
    desk: {
      title: 'The night desk',
      body: `<p>Every Lantern in District 5 feeds a screen on the Nexus fourth floor. At night four screens share one officer, a stack of flag slips and eight hours. A flag is a request for collection. JURY collects at 06:00.</p>
      <p>The desk manual says to flag behaviour, not appearance. The desk manual was written in daylight.</p>`,
    },
  });
  G.CODEX_GROUPS.find((g) => g.title === 'Procedure').ids.push('desk');
  G.afterRender.push((sc, id) => {
    if (id === 'desk_run') G.unlock(G.state(), 'desk');
  });
})();
