/* MINIGAMES III — one for each division that did not have one.
   - triage (HELIX): patients bleed out in real time; you have two hands. Tap a patient to work on
     them; Field Medicine makes your hands faster.
   - watch (RAZOR): a crowd passes the hardpoint; one face at a time shows a tell. Tap the threat
     before it is gone; tapping an innocent costs. Perception widens the window.
   - breach (SPEAR): door after door; a figure is revealed for a heartbeat. FIRE at hostiles, HOLD
     on civilians. Firearms widens the window.
   - sample (VECTOR): press your luck. Each sample is worth more; each one risks the suit. The
     meter hints at the next risk. Seal out whenever you choose. Medicine lowers the risk.
   Scene usage: mini: { type, opts, pass, fail, skill } */
(function () {
  G.MINIGAMES = G.MINIGAMES || {};
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const lvl = (k) => ((G.state().skills || {})[k] || 0);
  const shell = (cls, title, help) => {
    const root = document.createElement('div');
    root.className = 'mini m3 ' + cls;
    root.innerHTML = `<div class="cr-head"><span class="cr-title">${title}</span><span class="cr-clock"></span></div><div class="m3-log"></div><div class="m3-body"></div><div class="cr-help">${help}</div>`;
    return root;
  };
  /* a guarded interval that stops when the block leaves the page or a new game starts */
  const loop = (root, S, ms, fn) => {
    const t = setInterval(() => {
      if (!document.body.contains(root) || !root.closest('.block.current') || G.state() !== S) return clearInterval(t);
      if (document.hidden) return;
      fn();
    }, ms);
    return t;
  };

  /* ================================================================ TRIAGE */
  const WOUNDS = ['stab wound, left side', 'crushed hand', 'burns to the arms', 'gunshot, thigh', 'head wound, conscious', 'glass in the face', 'broken ribs, struggling to breathe', 'bite on the forearm'];
  const WHO = ['UNION 05', 'citizen, mill hand', 'CWU worker', 'citizen, child', 'UNION 03', 'citizen, old woman', 'RAZOR 04', 'citizen, pregnant'];
  G.MINIGAMES.triage = (block, opts, done) => {
    const S = G.state();
    const secs = opts.seconds || 40;
    const speed = 1 + lvl('medical') * 0.15;
    const root = shell('triage', opts.title || 'Triage', 'Tap a patient to work on them (two hands, two patients). The worse they are, the faster they fade. A patient you stabilise is safe.');
    const body = root.querySelector('.m3-body');
    const pts = Array.from({ length: opts.count || 6 }, (_, i) => ({ id: i, who: pick(WHO), wound: pick(WOUNDS), life: rint(55, 95), rate: rint(10, 26) / 10, care: 0, state: 'wait' }));
    let left = secs, over = false;
    const draw = () => {
      root.querySelector('.cr-clock').textContent = Math.ceil(left) + 's';
      body.innerHTML = '';
      pts.forEach((p) => {
        const b = document.createElement('button');
        b.className = 'tri-pt ' + p.state;
        b.innerHTML = `<b>${p.who}</b><small>${p.wound}</small><div class="cr-bar"><span style="width:${Math.max(0, p.life)}%"></span></div><div class="tri-care"><span style="width:${p.care}%"></span></div>`;
        b.disabled = p.state === 'dead' || p.state === 'safe' || over;
        b.onclick = () => {
          if (p.state === 'work') p.state = 'wait';
          else if (pts.filter((x) => x.state === 'work').length < 2) p.state = 'work';
          else {
            const other = pts.find((x) => x.state === 'work');
            other.state = 'wait';
            p.state = 'work';
          }
          draw();
        };
        body.append(b);
      });
    };
    const finish = () => {
      over = true;
      clearInterval(t);
      const dead = pts.filter((p) => p.state === 'dead').length;
      const ok = dead <= (opts.allow === undefined ? 1 : opts.allow);
      root.classList.add(ok ? 'won' : 'lost');
      root.querySelector('.m3-log').textContent = ok ? `${pts.length - dead} of ${pts.length} alive at the end of the shift.` : `${dead} lost. You will remember which ones.`;
      draw();
      done(ok, { dead, saved: pts.length - dead });
    };
    const t = loop(root, S, 250, () => {
      if (over) return;
      left -= 0.25;
      pts.forEach((p) => {
        if (p.state === 'dead' || p.state === 'safe') return;
        if (p.state === 'work') {
          p.care += 4.5 * speed;
          p.life = Math.min(100, p.life + 0.6);
          if (p.care >= 100) p.state = 'safe';
        } else {
          p.life -= p.rate * 0.6;
          if (p.life <= 0) p.state = 'dead';
        }
      });
      root.querySelector('.m3-log').textContent = `${pts.filter((p) => p.state === 'safe').length} stable · ${pts.filter((p) => p.state === 'dead').length} lost`;
      if (left <= 0 || pts.every((p) => p.state === 'dead' || p.state === 'safe')) finish();
      else draw();
    });
    block.append(root);
    draw();
  };

  /* ================================================================ WATCH */
  const TELLS = ['a hand kept inside a coat', 'a card held face-down', 'eyes on the emitter pylon, not the queue', 'a bag held too carefully', 'sweat in the cold', 'a glance at the rooftops'];
  G.MINIGAMES.watch = (block, opts, done) => {
    const S = G.state();
    const N = 12;
    const need = opts.need || 4;
    const win = 1400 + lvl('perception') * 220;
    const root = shell('watch', opts.title || 'Hardpoint watch', `A threat shows a tell for a moment. Tap it before it passes. Tapping an innocent costs you. Catch ${need}.`);
    const body = root.querySelector('.m3-body');
    let caught = 0, missed = 0, wrong = 0, over = false, left = opts.seconds || 40, hot = -1, hotUntil = 0, nextAt = Date.now() + 1200;
    const cells = [];
    for (let i = 0; i < N; i++) {
      const b = document.createElement('button');
      b.className = 'wt-face';
      b.innerHTML = '<span>◉</span>';
      b.onclick = () => {
        if (over) return;
        if (i === hot) {
          caught++;
          hot = -1;
          b.classList.add('hit');
          setTimeout(() => b.classList.remove('hit'), 300);
        } else {
          wrong++;
          b.classList.add('miss');
          setTimeout(() => b.classList.remove('miss'), 300);
        }
        status();
      };
      body.append(b);
      cells.push(b);
    }
    const status = () => {
      root.querySelector('.m3-log').textContent = `Caught ${caught}/${need} · slipped through ${missed} · innocents stopped ${wrong}`;
      root.querySelector('.cr-clock').textContent = Math.ceil(left) + 's';
      if (caught >= need) finish(true);
      else if (missed >= 3 || wrong >= 4) finish(false);
    };
    const finish = (ok) => {
      if (over) return;
      over = true;
      clearInterval(t);
      cells.forEach((c) => (c.disabled = true, c.classList.remove('hot')));
      root.classList.add(ok ? 'won' : 'lost');
      root.querySelector('.m3-log').textContent = ok ? 'The queue passes. Nothing gets through that should not.' : missed >= 3 ? 'Something got through. You will find out what tomorrow.' : 'You have stopped half the street. The queue is backed up to the Stacks.';
      done(ok, { caught, missed, wrong });
    };
    const t = loop(root, S, 100, () => {
      if (over) return;
      left -= 0.1;
      const now = Date.now();
      if (hot >= 0 && now > hotUntil) {
        cells[hot].classList.remove('hot');
        hot = -1;
        missed++;
        status();
      }
      if (hot < 0 && now > nextAt) {
        hot = rint(0, N - 1);
        hotUntil = now + win;
        nextAt = now + win + rint(500, 1400);
        cells[hot].classList.add('hot');
        cells[hot].title = pick(TELLS);
      }
      cells.forEach((c, i) => c.classList.toggle('hot', i === hot));
      if (left <= 0) finish(caught >= need);
      root.querySelector('.cr-clock').textContent = Math.ceil(left) + 's';
    });
    block.append(root);
    status();
  };

  /* ================================================================ BREACH */
  const HOSTILE = ['a figure raising a pipe wrench', 'a man with a pistol', 'something that used to be a man, lunging', 'a scavenger with a crowbar, charging'];
  const CIVIL = ['a child behind a mattress', 'an old woman with her hands up', 'a man holding a ration tin', 'a girl with a candle', 'a dog'];
  G.MINIGAMES.breach = (block, opts, done) => {
    const S = G.state();
    const doors = opts.doors || 6;
    const win = 1300 + lvl('firearms') * 180;
    const root = shell('breach', opts.title || 'Room clearance', 'Each door opens on someone for a heartbeat. FIRE at a threat. HOLD on anyone else. Too slow on a threat costs you.');
    const body = root.querySelector('.m3-body');
    body.innerHTML = '<div class="br-door">Door 1</div><div class="br-fig"></div><div class="tl-btns br-btns"><button class="cr-btn danger" data-a="fire">FIRE</button><button class="cr-btn" data-a="hold">HOLD</button></div>';
    let i = 0, over = false, cur = null, until = 0, hits = 0, wounds = 0, shotCivil = 0, waiting = true, nextAt = Date.now() + 900;
    const fig = body.querySelector('.br-fig');
    const resolve = (act) => {
      if (over || !cur) return;
      const c = cur;
      cur = null;
      if (c.hostile && act === 'fire') hits++;
      else if (c.hostile) wounds++;
      else if (act === 'fire') shotCivil++;
      fig.className = 'br-fig ' + (c.hostile ? (act === 'fire' ? 'down' : 'hurt') : act === 'fire' ? 'bad' : 'safe');
      fig.textContent = c.hostile ? (act === 'fire' ? 'Down.' : 'It reaches you first.') : act === 'fire' ? 'You fired. It was ' + c.what + '.' : 'Held. ' + c.what.charAt(0).toUpperCase() + c.what.slice(1) + '.';
      i++;
      waiting = true;
      nextAt = Date.now() + 900;
      if (shotCivil >= 1 || wounds >= 2 || i >= doors) finish();
    };
    body.querySelectorAll('[data-a]').forEach((b) => (b.onclick = () => resolve(b.dataset.a)));
    const finish = () => {
      over = true;
      clearInterval(t);
      body.querySelectorAll('button').forEach((b) => (b.disabled = true));
      const ok = shotCivil === 0 && wounds < 2;
      root.classList.add(ok ? 'won' : 'lost');
      root.querySelector('.m3-log').textContent = ok ? `Block clear. ${hits} down, nobody else hurt.` : shotCivil ? 'You will see that doorway for the rest of your life.' : 'You go down in a doorway. Your squad drags you out.';
      done(ok, { hits, wounds, shotCivil });
    };
    const t = loop(root, S, 100, () => {
      if (over) return;
      const now = Date.now();
      if (waiting && now > nextAt) {
        waiting = false;
        const hostile = Math.random() < 0.55;
        cur = { hostile, what: hostile ? pick(HOSTILE) : pick(CIVIL) };
        until = now + win;
        fig.className = 'br-fig show';
        fig.textContent = cur.what.charAt(0).toUpperCase() + cur.what.slice(1) + '!';
        body.querySelector('.br-door').textContent = `Door ${i + 1} of ${doors}`;
      } else if (cur && now > until) resolve('hold');
      root.querySelector('.cr-clock').textContent = cur ? Math.max(0, (until - now) / 1000).toFixed(1) + 's' : '';
      root.querySelector('.m3-log').textContent = `Down ${hits} · hits taken ${wounds}`;
    });
    block.append(root);
  };

  /* ================================================================ SAMPLE */
  G.MINIGAMES.sample = (block, opts, done) => {
    const target = opts.target || 5;
    const root = shell('sample', opts.title || 'Specimen sampling', `Each sample is worth more. Each one strains the suit. The meter hints at the next risk. Seal out when you choose. ${target} samples is a full set.`);
    const body = root.querySelector('.m3-body');
    body.innerHTML = '<div class="sm-row"><span>Samples</span><b class="sm-n">0</b></div><div class="tl-bars"><div><span>Suit integrity</span><div class="cr-bar suit"><span style="width:100%"></span></div></div><div><span>Next reading</span><div class="cr-bar risk"><span></span></div></div></div><div class="tl-btns sm-btns"><button class="cr-btn" data-a="take">Take a sample</button><button class="cr-btn" data-a="out">Seal and get out</button></div>';
    let n = 0, suit = 100, over = false, risk = rint(10, 35);
    const soften = lvl('medical') * 3;
    const draw = () => {
      body.querySelector('.sm-n').textContent = n;
      body.querySelector('.suit span').style.width = Math.max(0, suit) + '%';
      const r = body.querySelector('.risk span');
      r.style.width = risk + '%';
      r.style.background = risk > 55 ? '#d9534a' : risk > 30 ? '#e2a83f' : '#6fbf73';
    };
    const finish = (ok, why) => {
      over = true;
      body.querySelectorAll('button').forEach((b) => (b.disabled = true));
      root.classList.add(ok ? 'won' : 'lost');
      root.querySelector('.m3-log').textContent = why;
      done(ok, { samples: n, suit: Math.max(0, Math.round(suit)) });
    };
    body.querySelector('[data-a="take"]').onclick = () => {
      if (over) return;
      const roll = rint(1, 100);
      if (roll <= risk - soften) {
        suit -= rint(35, 60);
        root.querySelector('.m3-log').textContent = 'A seal gives at the wrist. Cold air. You tape it with shaking hands.';
      } else {
        n++;
        root.querySelector('.m3-log').textContent = pick(['Clean draw. The jar fogs, then clears.', 'Tissue, grey, into the jar. Lid on.', 'Something in the culvert moves when you reach. You get the sample anyway.']);
      }
      risk = Math.min(90, risk + rint(4, 16));
      if (suit <= 0) return draw(), finish(false, 'The suit is breached. You come out through decon on a stretcher, and the jars go into the furnace with your gloves.');
      if (n >= target) return draw(), finish(true, 'A full set. You seal the case and back out the way you came.');
      draw();
    };
    body.querySelector('[data-a="out"]').onclick = () => {
      if (over) return;
      finish(n >= Math.ceil(target / 2), n >= Math.ceil(target / 2) ? `You seal out with ${n} samples. Enough for the Archivist.` : `You seal out with ${n}. Not enough. You will be sent back in tomorrow.`);
    };
    block.append(root);
    draw();
  };

  /* ================================================================ SCENES */
  const END = 'u_duty_end';
  const mg = (id, title, intro, type, opts, skill, okText, okFx, badText, badFx) => ({
    [id]: { title, text: [].concat(intro), mini: { type, opts, pass: id + '_ok', fail: id + '_bad', skill, diff: 10 } },
    [id + '_ok']: { text: [okText], choices: [{ t: 'End of shift.', fx: okFx, go: END }] },
    [id + '_bad']: { text: [badText], choices: [{ t: 'End of shift.', fx: badFx, go: END }] },
  });
  G.addScenes(
    Object.assign(
      {},
      mg('mg_triage', 'The HELIX ward — a bad night', ['@img assets/img/env/e26-helix-ward.webp|The HELIX ward', 'A ration hatch exploded at Plaza 5. Six stretchers come down the ramp at once. You have two hands.', '@sys Triage. Keep them alive until the shift ends.'], 'triage', { title: 'Triage — six stretchers', count: 6, seconds: 40 }, 'medical', 'By 06:00 the ward is quiet. Matron reads the board and nods once.', { merit: 5, xp: { medical: 1 }, cons: 2 }, 'You lose more than you can bear to count. Matron takes your gloves off for you.', { cons: -4, merit: 1 }),
      mg('mg_watch', 'Hardpoint D1-3 — the morning queue', ['@img assets/img/env/e29-hardpoint.webp|Hardpoint D1-3', 'Six hundred passes in two hours, and Dispatch says someone in today’s queue is carrying something across.', '@sys Watch the queue. Tap the threat when it shows.'], 'watch', { title: 'Hardpoint watch', need: 4, seconds: 40 }, 'perception', 'You pull the right people out of the queue. One had a pistol in a bread loaf. Bastion writes your number down, for once in a good way.', { merit: 5, xp: { perception: 1 }, rel: { bastion: 3 } }, 'Somebody got through. A forcefield emitter on the far side is found cut that night.', { merit: -1 }),
      mg('mg_breach', 'Old Town — Block 9', ['@img assets/img/env/e28-404-wall.webp|Beyond the wall', 'Six doors on the third floor of Block 9. Somebody in this block has been shooting at the wall. Somebody else lives here.', '@sys Clear the floor. FIRE at threats, HOLD on everyone else.'], 'breach', { title: 'Clearance — Block 9', doors: 6 }, 'firearms', 'The floor is clear. Behind the last door, an old woman with a kettle, who offers your squad tea.', { merit: 5, xp: { firearms: 1 } }, 'The squad carries someone down the stairs. You do not let yourself look at who.', (s) => (s.squad && s.squad.formed && G.squadHit(s, true, 'Block 9'), { hp: -15, cons: -4 })),
      mg('mg_sample', 'Culvert 4 — sampling', ['@img assets/img/env/e27-vector-lab.webp|The labs are waiting', 'The Archivist wants five tissue samples from a nest in culvert 4. The culvert is half-flooded and the nest is not empty.', '@sys Take samples. Get out before the suit gives.'], 'sample', { title: 'Sampling — culvert 4', target: 5 }, 'medical', 'Jars racked, suit intact, the Archivist almost pleased.', (s) => ({ merit: 3 + ((s.lastMini && s.lastMini.samples) || 0), xp: { medical: 1 }, rel: { archivist: 3 } }), 'You come out through decon on a stretcher. The labs will wait for someone else.', { hp: -20, merit: -1 })
    )
  );
  const offer = (ids, choice) => ids.forEach((id) => G.extend(id, { choices: (list) => [choice].concat(list) }));
  offer(['dd_hward', 'dd_hward_r0', 'dd_hambulance'], { t: 'The ramp doors bang open: six stretchers at once.', tag: 'TRIAGE', tagCls: 'duty', go: 'mg_triage' });
  offer(['dd_rgate', 'dd_rgate_r0', 'dd_rlobby'], { t: 'Work the queue yourself, face by face.', tag: 'WATCH', tagCls: 'duty', go: 'mg_watch' });
  offer(['dd_sclear', 'dd_sclear_r0', 'dd_sdrain'], { t: 'Take the point. Door by door.', tag: 'BREACH', tagCls: 'duty', go: 'mg_breach' });
  offer(['dd_vlab', 'dd_vsample', 'dd_vsample_r0'], { t: 'Go into culvert 4 for the Archivist’s samples.', tag: 'SAMPLE', tagCls: 'duty', go: 'mg_sample' });
})();
