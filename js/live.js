/* LIVING PAINTINGS — the hero pictures are not still. A canvas lies over the painting and animates what
   the painting already shows: real rain with ripples on the wet ground, a searchlight that sweeps,
   lamps that breathe and sometimes fail, dust in a shaft of light, fog drifting, a flash of lightning.
   Each picture has its own recipe in G.LIVE (positions are fractions of the picture). A picture with no
   recipe but with rain in the scene gets rain alone. Pref "live" turns it off; it also stands still under
   prefers-reduced-motion, pauses when the picture is off screen, and costs nothing when the tab is hidden. */
(function () {
  const on = (k) => G.prefs()[k] !== false;
  G.PREF_TOGGLES = (G.PREF_TOGGLES || []).concat([{ key: 'live', label: 'Living paintings' }]);
  const still = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const COL = { amber: '255,176,64', cyan: '95,200,221', green: '150,210,120', fire: '255,120,40', white: '235,240,245' };

  G.LIVE = {
    'e52-nova-prospekt': { rain: 1, wind: 0.25, search: { x: 0.67, y: 0.14, a: -0.3, sweep: 0.55, len: 0.5 }, lamps: [[0.62, 0.34, 'amber', 0.06], [0.68, 0.34, 'amber', 0.06], [0.13, 0.38, 'amber', 0.045], [0.35, 0.38, 'amber', 0.045], [0.95, 0.38, 'amber', 0.045]], pulse: [[0.69, 0.55, 'cyan', 0.1]], fog: 1, flash: 1 },
    'e53-np-intake': { rain: 1.3, wind: 0.2, lamps: [[0.915, 0.05, 'amber', 0.1], [0.13, 0.08, 'amber', 0.04], [0.26, 0.12, 'amber', 0.04]], fog: 0.6 },
    'e54-np-cell7c': { lamps: [[0.14, 0.05, 'amber', 0.07], [0.1, 0.21, 'amber', 0.05]], motes: { x: 0.52, y: 0.05, w: 0.4, h: 0.6, n: 70 } },
    'e55-np-records': { lamps: [[0.14, 0.37, 'green', 0.11]], pulse: [[0.88, 0.55, 'fire', 0.12]], search: { x: 0.73, y: 0.1, a: 0.35, sweep: 0.45, len: 0.3 }, motes: { x: 0.1, y: 0.1, w: 0.5, h: 0.6, n: 40 } },
    'e56-np-raildock': { rain: 1.2, wind: 0.35, lamps: [[0.71, 0.15, 'amber', 0.08], [0.58, 0.28, 'amber', 0.04], [0.93, 0.25, 'amber', 0.04]], fog: 1 },
    'e57-np-blackout': { lamps: [[0.15, 0.13, 'amber', 0.05], [0.28, 0.1, 'amber', 0.05], [0.4, 0.17, 'amber', 0.05], [0.9, 0.18, 'amber', 0.05], [0.6, 0.55, 'amber', 0.04]], motes: { x: 0.5, y: 0.0, w: 0.35, h: 0.8, n: 90 }, flicker: 1 },
    'e59-checkpoint-booth': { rain: 1.3, wind: 0.15, lamps: [[0.14, 0.24, 'amber', 0.1], [0.71, 0.14, 'amber', 0.05]], pulse: [[0.12, 0.37, 'cyan', 0.1], [0.65, 0.76, 'cyan', 0.03]], fog: 0.5 },
    'e60-checkpoint-gate': { rain: 1.3, wind: 0.2, lamps: [[0.55, 0.08, 'white', 0.1], [0.4, 0.36, 'amber', 0.06], [0.04, 0.06, 'amber', 0.04]], pulse: [[0.23, 0.12, 'cyan', 0.05]], fog: 0.8 },
    'e58-np-yard-turns': { rain: 1.2, wind: 0.3, search: { x: 0.66, y: 0.07, a: 0.2, sweep: 0.5, len: 0.55 }, pulse: [[0.7, 0.45, 'cyan', 0.14]], lamps: [[0.4, 0.3, 'amber', 0.05], [0.1, 0.3, 'amber', 0.04]], fog: 0.8, flash: 1 },
  };

  const keyOf = (src) => (src.split('/').pop() || '').replace(/\.\w+$/, '');

  function start(fig, cfg) {
    const cv = document.createElement('canvas');
    cv.className = 'live';
    fig.append(cv);
    fig.classList.add('live-on');
    const ctx = cv.getContext('2d');
    let W = 2, H = 2, vis = true, last = 0, flash = 0, nextFlash = 6 + Math.random() * 10;
    const drops = [], ripples = [], motes = [];
    const fit = () => {
      const r = fig.getBoundingClientRect();
      if (!r.width) return;
      W = cv.width = Math.min(1000, Math.round(r.width));
      H = cv.height = Math.round(W * (r.height / r.width));
      drops.length = 0;
      const n = Math.round((W * H) / 9000 * (cfg.rain || 0));
      for (let i = 0; i < n; i++) drops.push({ x: Math.random() * W, y: Math.random() * H, l: 8 + Math.random() * 16, v: 0.9 + Math.random() * 0.5, a: 0.12 + Math.random() * 0.22 });
      motes.length = 0;
      if (cfg.motes) for (let i = 0; i < cfg.motes.n; i++) motes.push({ x: cfg.motes.x + Math.random() * cfg.motes.w, y: cfg.motes.y + Math.random() * cfg.motes.h, v: 0.004 + Math.random() * 0.01, p: Math.random() * 6 });
    };
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(fig);
    if (window.IntersectionObserver) new IntersectionObserver((e) => (vis = e[0].isIntersecting), { threshold: 0.05 }).observe(fig);

    const glow = (x, y, rad, col, a) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, `rgba(${COL[col]},${a})`);
      g.addColorStop(1, `rgba(${COL[col]},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    };
    const draw = (t, dt) => {
      ctx.clearRect(0, 0, W, H);
      /* fog bands */
      if (cfg.fog) {
        for (let i = 0; i < 2; i++) {
          const x = ((t * (8 + i * 5) + i * W * 0.6) % (W * 1.6)) - W * 0.3;
          const g = ctx.createRadialGradient(x, H * (0.72 + i * 0.1), 0, x, H * (0.72 + i * 0.1), W * 0.45);
          g.addColorStop(0, `rgba(170,185,195,${0.1 * cfg.fog})`);
          g.addColorStop(1, 'rgba(170,185,195,0)');
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, W, H);
        }
      }
      ctx.globalCompositeOperation = 'lighter';
      /* the searchlight */
      if (cfg.search) {
        const s = cfg.search;
        const a = s.a + Math.sin(t * 0.45) * s.sweep;
        const sx = s.x * W, sy = s.y * H, L = s.len * W;
        const g = ctx.createLinearGradient(sx, sy, sx + Math.cos(a) * L, sy + Math.sin(a) * L);
        g.addColorStop(0, 'rgba(225,238,250,0.34)');
        g.addColorStop(1, 'rgba(225,238,250,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(a - 0.07) * L, sy + Math.sin(a - 0.07) * L);
        ctx.lineTo(sx + Math.cos(a + 0.07) * L, sy + Math.sin(a + 0.07) * L);
        ctx.closePath();
        ctx.fill();
        glow(sx, sy, W * 0.03, 'white', 0.5);
      }
      /* lamps breathe; one in a while goes out for a moment */
      (cfg.lamps || []).forEach(([x, y, c, r], i) => {
        let a = 0.3 + 0.07 * Math.sin(t * 2.1 + i * 1.7) + 0.04 * Math.sin(t * 7.3 + i);
        if (cfg.flicker && Math.sin(t * 1.3 + i * 2.2) > 0.93) a *= 0.2;
        glow(x * W, y * H, r * W, c, a);
      });
      (cfg.pulse || []).forEach(([x, y, c, r], i) => glow(x * W, y * H, r * W * (1 + 0.12 * Math.sin(t * 1.6 + i)), c, 0.22 + 0.12 * Math.sin(t * 2.4 + i)));
      ctx.globalCompositeOperation = 'source-over';
      /* dust in a shaft */
      motes.forEach((m) => {
        m.y -= m.v * dt;
        m.x += Math.sin(t * 0.6 + m.p) * 0.0006;
        if (cfg.motes && m.y < cfg.motes.y) m.y = cfg.motes.y + cfg.motes.h;
        ctx.fillStyle = `rgba(255,240,215,${0.15 + 0.2 * Math.abs(Math.sin(t + m.p))})`;
        ctx.fillRect(m.x * W, m.y * H, 1.6, 1.6);
      });
      /* rain and ripples */
      if (drops.length) {
        const wind = cfg.wind || 0.2;
        ctx.lineWidth = 1;
        drops.forEach((d) => {
          d.y += d.v * H * 1.1 * dt;
          d.x -= wind * d.v * H * 0.5 * dt;
          if (d.y > H) {
            d.y = -d.l;
            d.x = Math.random() * W * 1.2;
            if (ripples.length < 24 && Math.random() < 0.4) ripples.push({ x: Math.random() * W, y: H * (0.65 + Math.random() * 0.33), r: 1, max: 6 + Math.random() * 8 });
          }
          ctx.strokeStyle = `rgba(200,220,235,${d.a})`;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + wind * d.l, d.y - d.l);
          ctx.stroke();
        });
        for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          r.r += 14 * dt;
          if (r.r >= r.max) { ripples.splice(i, 1); continue; }
          ctx.strokeStyle = `rgba(200,220,235,${0.28 * (1 - r.r / r.max)})`;
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, r.r, r.r * 0.35, 0, 0, 6.3);
          ctx.stroke();
        }
      }
      /* lightning */
      if (cfg.flash) {
        nextFlash -= dt;
        if (nextFlash <= 0) { flash = 1; nextFlash = 9 + Math.random() * 16; }
        if (flash > 0) {
          ctx.fillStyle = `rgba(215,228,255,${0.22 * flash})`;
          ctx.fillRect(0, 0, W, H);
          flash -= dt * 2.6;
        }
      }
    };
    const frame = (now) => {
      if (!document.body.contains(cv)) return;
      requestAnimationFrame(frame);
      if (!vis || document.hidden || now - last < 33) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      draw(now / 1000, dt);
    };
    requestAnimationFrame(frame);
  }

  G.afterRender.push((sc, id, block) => {
    if (!on('live') || still()) return;
    const fig = block.querySelector('figure.pic.hero');
    if (!fig || fig.querySelector('canvas.live')) return;
    const src = fig.querySelector('img').getAttribute('src') || '';
    let cfg = G.LIVE[keyOf(src)];
    if (!cfg && fig.classList.contains('fx-rain')) cfg = { rain: 0.8, wind: 0.2 };
    if (cfg) start(fig, cfg);
  });
})();
