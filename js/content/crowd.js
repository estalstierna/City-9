/* CROWD CONTROL — a real-time minigame. Three sectors of a crowd, each with a tension bar that
   rises on its own and flares with events. You have a few units to post, a voice, and a baton.
   Survive the clock with every sector under 100 and the crowd goes home; let one boil and it is a
   riot. Every way of winning has a cost: force and arrests feed the block's resentment.
   Scene usage: mini: { type: 'crowd', opts: { sectors, seconds, units, rate, start, events, block }, pass, fail, skill: 'authority' } */
(function () {
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = G.pick;

  const DEFAULT_EVENTS = [
    'A woman screams that her card was refused',
    'Someone at the back starts a chant, low, wordless',
    'A packet bursts open on the stones and three people go for it',
    'An old man collapses and the people around him start shouting for help',
    'A bottle comes over the heads from nowhere and smashes at the barrier',
    'Somebody shouts the number of the last relocation train',
    'A child is crying and will not stop',
    'A rumour runs through the crowd that the hatches are closing early',
  ];

  G.MINIGAMES = G.MINIGAMES || {};
  G.MINIGAMES.crowd = (block, opts, done) => {
    const S = G.state();
    const secs = opts.seconds || 40;
    const units = opts.units || 3;
    const rate = opts.rate || 1;
    const names = opts.sectors || ['Left', 'The hatches', 'Right'];
    const start = [].concat(opts.start || [25, 35, 25]);
    const sec = names.map((n, i) => ({ name: n, t: start[i] !== undefined ? start[i] : 30, held: 0, pullCd: 0 }));
    const st = { left: secs, speakCd: 0, batonCd: 0, force: 0, pulled: 0, spoke: 0, peak: 0, over: false, flare: rint(3, 5), log: 'The crowd is waiting.' };

    const root = document.createElement('div');
    root.className = 'mini crowd';
    root.innerHTML = `<div class="cr-head"><span class="cr-title">${opts.title || 'Crowd control'}</span><span class="cr-clock"></span></div>
      <div class="cr-log"></div>
      <div class="cr-units"></div>
      <div class="cr-sectors"></div>
      <div class="cr-global">
        <button class="cr-btn cr-speak">Address the crowd</button>
        <button class="cr-btn cr-baton danger">Baton charge</button>
      </div>
      <div class="cr-help">Post units to slow a sector. Speak while it is under 75. Pull out an agitator for a big drop. The baton works instantly, and the block remembers it.</div>`;
    const $ = (q) => root.querySelector(q);
    const secBox = $('.cr-sectors');
    sec.forEach((x, i) => {
      const d = document.createElement('div');
      d.className = 'cr-sec';
      d.innerHTML = `<div class="cr-name">${x.name}</div><div class="cr-bar"><span></span></div><div class="cr-row"><button class="cr-btn cr-post">Post unit</button><button class="cr-btn cr-pull">Pull agitator</button></div>`;
      d.querySelector('.cr-post').onclick = () => {
        const used = sec.reduce((n, y) => n + y.held, 0);
        if (used < units) x.held++;
        else if (x.held > 0) x.held--;
        draw();
      };
      d.querySelector('.cr-pull').onclick = () => {
        if (x.pullCd > 0 || st.over) return;
        x.t = Math.max(0, x.t - 30);
        x.pullCd = 12;
        st.pulled++;
        st.log = `${x.name}: two units drag a man out of the crowd by his collar. The ones around him go quiet — for now.`;
        draw();
      };
      secBox.append(d);
      x.el = d;
    });
    $('.cr-speak').onclick = () => {
      if (st.speakCd > 0 || st.over) return;
      st.speakCd = 8;
      st.spoke++;
      const worst = sec.reduce((m, y) => (y.t > m.t ? y : m), sec[0]);
      sec.forEach((y) => {
        if (y.t < 75) y.t = Math.max(0, y.t - (y === worst ? 18 : 8));
        else y.t += 6;
      });
      st.log = worst.t >= 75 ? 'Your amplified voice goes out over the crowd, and the crowd shouts it down.' : 'Your amplified voice goes out over the crowd: flat, slow, certain. It works, a little.';
      draw();
    };
    $('.cr-baton').onclick = () => {
      if (st.batonCd > 0 || st.over) return;
      st.batonCd = 15;
      st.force++;
      const worst = sec.reduce((m, y) => (y.t > m.t ? y : m), sec[0]);
      sec.forEach((y) => (y.t = y === worst ? Math.max(0, y.t - 45) : y.t + 8));
      st.log = `${worst.name}: batons. The front of the crowd breaks back. Everyone behind it sees.`;
      draw();
    };

    function draw() {
      $('.cr-clock').textContent = `${Math.ceil(st.left)}s`;
      $('.cr-log').textContent = st.log;
      const used = sec.reduce((n, y) => n + y.held, 0);
      $('.cr-units').innerHTML = `Units: ${'■'.repeat(units - used)}${'□'.repeat(used)} <small>${units - used} free</small>`;
      sec.forEach((x) => {
        const v = Math.min(100, Math.round(x.t));
        const bar = x.el.querySelector('.cr-bar span');
        bar.style.width = v + '%';
        x.el.dataset.level = v >= 80 ? 'red' : v >= 55 ? 'amber' : 'green';
        x.el.querySelector('.cr-post').textContent = x.held ? `Units: ${x.held} ${used < units ? '(+1)' : '(tap to free one)'}` : used < units ? 'Post unit' : 'No free units';
        x.el.classList.toggle('held', x.held > 0);
        const p = x.el.querySelector('.cr-pull');
        p.disabled = x.pullCd > 0;
        p.textContent = x.pullCd > 0 ? `Pull agitator (${Math.ceil(x.pullCd)})` : 'Pull agitator';
      });
      const sp = $('.cr-speak');
      sp.disabled = st.speakCd > 0;
      sp.textContent = st.speakCd > 0 ? `Address the crowd (${Math.ceil(st.speakCd)})` : 'Address the crowd';
      const bt = $('.cr-baton');
      bt.disabled = st.batonCd > 0;
      bt.textContent = st.batonCd > 0 ? `Baton charge (${Math.ceil(st.batonCd)})` : 'Baton charge';
    }

    const finish = (ok) => {
      if (st.over) return;
      st.over = true;
      clearInterval(timer);
      root.querySelectorAll('button').forEach((b) => (b.disabled = true));
      st.log = ok ? 'The hatches close. The crowd goes home, slowly, in pieces. Nobody runs.' : 'One sector boils over. Then all of them.';
      $('.cr-log').textContent = st.log;
      root.classList.add(ok ? 'won' : 'lost');
      done(ok, { force: st.force, pulled: st.pulled, spoke: st.spoke, peak: Math.round(st.peak) });
    };

    const TICK = 0.25;
    const timer = setInterval(() => {
      if (!document.body.contains(root) || !root.closest('.block.current') || G.state() !== S) return clearInterval(timer);
      if (document.hidden || st.over) return;
      st.left -= TICK;
      st.speakCd = Math.max(0, st.speakCd - TICK);
      st.batonCd = Math.max(0, st.batonCd - TICK);
      st.flare -= TICK;
      sec.forEach((x) => {
        x.pullCd = Math.max(0, x.pullCd - TICK);
        const rise = (2.4 * rate + Math.random() * 1.2 - x.held * 2.2) * TICK;
        x.t = Math.max(0, x.t + rise);
        st.peak = Math.max(st.peak, x.t);
      });
      if (st.flare <= 0) {
        st.flare = rint(3, 6) / Math.max(0.7, rate);
        const x = pick(sec);
        const add = rint(9, 18);
        x.t += add;
        st.log = `${x.name}: ${pick(opts.events || DEFAULT_EVENTS)}. (+${add})`;
      }
      if (sec.some((x) => x.t >= 100)) return finish(false);
      if (st.left <= 0) return finish(true);
      draw();
    }, TICK * 1000);
    draw();
    block.append(root);
  };

  /* starting tension and pace from the block's stability */
  G.crowdOpts = (s, base) => {
    const k = (base && base.block) || 'plaza';
    const b = (s.dist && s.dist[k]) || { o: 55, r: 30 };
    const lift = Math.round(b.r * 0.35 + (50 - b.o) * 0.25);
    const team = s.squad && s.squad.formed ? G.squadActive(s).length : 0;
    const steady = s.squad && s.squad.formed && G.squadActive(s).some((m) => m.trait === 'steady');
    return Object.assign(
      {
        units: Math.max(2, Math.min(4, 1 + team)),
        seconds: 40,
        rate: 1 + Math.max(0, b.r - 50) / 100 - (steady ? 0.1 : 0),
        start: [15 + lift, 25 + lift, 15 + lift].map((v) => Math.max(5, Math.min(70, v))),
      },
      base || {}
    );
  };

  /* how a crowd shift ends, in stability and record */
  const crowdAfter = (k) => (s, ok) => {
    const d = s.lastMini || { force: 0, pulled: 0, spoke: 0 };
    G.distFx(s, k, ok ? 3 : -8, d.force * 6 + d.pulled * 3 - (ok && !d.force ? 4 : 0) + (ok ? 0 : 10));
    if (!ok && s.squad && s.squad.formed && Math.random() < 0.5) G.squadHit(s, false, 'the riot on ' + G.BLOCKS[k].name);
  };

  const crowdScenes = (id, k, title, events, okText, badText) => ({
    [id]: {
      title,
      text: ['@img assets/img/env/e10-ration.webp|Plaza 5', '@sys Crowd control. Keep every sector under the boil until the clock runs out.'],
      mini: { type: 'crowd', opts: (s) => G.crowdOpts(s, { block: k, title, events }), pass: id + '_ok', fail: id + '_bad', skill: 'authority', diff: 10 },
    },
    [id + '_ok']: {
      enter: (s) => crowdAfter(k)(s, true),
      text: (s) => {
        const d = s.lastMini || { force: 0, pulled: 0 };
        return [okText, d.force ? `You used the batons ${d.force} time${d.force > 1 ? 's' : ''}. ${G.BLOCKS[k].name} will remember the order, and the batons.` : d.pulled ? `You pulled ${d.pulled} out of the crowd. Their neighbours watched where they went.` : 'Nobody was hurt and nobody was taken. In this city, that is a kind of miracle.'];
      },
      choices: [{ t: 'End of shift.', fx: (s) => ({ merit: 3 + ((s.lastMini && s.lastMini.force) ? 1 : 0), xp: { authority: 1 } }), go: 'u_duty_end' }],
    },
    [id + '_bad']: {
      enter: (s) => {
        crowdAfter(k)(s, false);
        G.discipline(s, 'minor', `Crowd lost control on ${G.BLOCKS[k].name}`);
      },
      text: (s) => [badText, s.mem.squadHit ? `${s.mem.squadHit.name} is hurt in the crush.` : null, '@radio All D5 units, 10-78, Plaza 5. Code 3.'],
      choices: [{ t: 'End of shift.', fx: (s) => ((s.mem.squadHit = null), { hp: -10, merit: -2 }), go: 'u_duty_end' }],
    },
  });

  G.addScenes(
    Object.assign(
      {},
      crowdScenes('cr_ration', 'plaza', 'Plaza 5 — short rations', null, 'The last hatch closes at 14:10. The line breaks up into people again, carrying their packets home under their jackets as if somebody might take them.', 'It goes at hatch 3: a shove, a scream, and then the whole line is moving at once, over the barrier, over the people who fall. Units go down under it. So do citizens. By the time the Overwatch squad arrives it is over, and the plaza is covered in torn grey packets.'),
      crowdScenes('cr_cast', 'plaza', 'Plaza 5 — after the broadcast', ['A man throws his ration card at the screen', 'The front row sits down on the stones, all at once', 'Someone shouts the new ration figure back at the screen', 'A woman starts to sing the old anthem, the one from before', 'Somebody has unscrewed a broadcast speaker and it falls into the crowd'], 'The screens go dark at 12:40. The plaza stands for a long moment in silence, then turns and goes back to the Works, the mills, the Stacks.', 'The front row stands up, then the second, and then the plaza is a single shape moving toward the screens. Someone pulls a speaker down. Someone else goes under it.')
    )
  );

  G.addCodex({
    crowd: {
      title: 'Crowd control doctrine',
      body: `<p>A crowd is not a person and cannot be reasoned with as one. Doctrine divides it into sectors and manages each:</p>
      <table>
        <tr><td>Posting</td><td>A unit standing in front of a sector slows it. Units are always fewer than sectors.</td></tr>
        <tr><td>Address</td><td>The amplified voice works on a crowd that is still listening. Above a certain point it only gives them something to shout at.</td></tr>
        <tr><td>Removal</td><td>Taking an agitator out of a sector calms it at once. The neighbours remember where he went.</td></tr>
        <tr><td>Force</td><td>A baton charge empties the front of a sector. Every other sector sees it.</td></tr>
      </table>
      <p>A sector that reaches its boiling point takes the others with it. A block's mood on the day decides how hot the crowd starts.</p>`,
    },
  });
})();
