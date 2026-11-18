/* LENS SCAN — the mask as a game view. A crowd walks across the yard towards the gate. Your lens
   reticle follows your finger or mouse; hold it over a figure and the lens SCANS them: a ring fills,
   then a card comes up with their number, their face and what they carry. Some carry bread, a toy,
   medicine. A few carry a handset, a flare, a list. Tap a scanned figure to mark it for a stop. The
   crowd does not wait: an organiser who reaches the far side unmarked is gone. Perception scans faster.
   Scene usage: mini: { type: 'scan', opts: { title, seconds, crowd, targets, bg }, pass, fail, skill, diff } */
(function () {
  G.MINIGAMES = G.MINIGAMES || {};
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = G.pick;
  const ORG = ['a handset taped under the jacket', 'a signal flare in the sleeve', 'a list of cell numbers in a boot', 'a whistle on a cord, and a hand on it'];
  const DECOY = ['a heel of bread', 'a child’s wooden toy', 'insulin vials in a sock', 'a folded letter', 'a tin cup and nothing else'];
  const JACKETS = ['#2b2e2f', '#33373a', '#272a2c', '#3a3d3f'];
  const SKINS = ['#b59a85', '#a38670', '#c3a994', '#8f745f', '#b8a08a'];

  G.MINIGAMES.scan = (block, opts, done) => {
    const S = G.state();
    const secs = opts.seconds || 34;
    const targets = opts.targets || 3;
    const total = opts.crowd || 34;
    const rate = 0.95 + ((S.skills || {}).perception || 0) * 0.14;
    const faces = (G.DOC_FACES || []).length;
    const root = document.createElement('div');
    root.className = 'mini scan';
    root.innerHTML = `<div class="cr-head"><span class="cr-title">${opts.title || 'Lens scan'}</span><span class="cr-clock"></span></div>
      <div class="sc-wrap"><div class="sc-bg" style="background-image:url('${opts.bg || 'assets/img/env/e58-np-yard-turns.webp'}')"></div><canvas width="800" height="420"></canvas>
      <div class="sc-card" hidden></div></div>
      <div class="m3-log"></div>
      <div class="cr-help">Hold the reticle on a figure to scan them. Tap a scanned figure to mark it for a stop. Find the ${targets} organisers before they cross to the gate. Innocents stopped cost you.</div>`;
    block.append(root);
    const cv = root.querySelector('canvas');
    const ctx = cv.getContext('2d');
    const card = root.querySelector('.sc-card');
    const log = root.querySelector('.m3-log');
    const W = cv.width, H = cv.height;
    const gateX = W * 0.86;
    const people = [];
    const orgAt = new Set();
    while (orgAt.size < targets) orgAt.add(rint(4, total - 3));
    const queue = [];
    for (let i = 0; i < total; i++) {
      const org = orgAt.has(i);
      const y = H * (0.6 + Math.random() * 0.32);
      queue.push({
        n: i,
        at: (i / total) * secs * 0.62 + Math.random() * 0.6,
        org,
        item: org ? pick(ORG) : Math.random() < 0.28 ? pick(DECOY) : null,
        decoy: false,
        id: 'NP-' + String(rint(1000, 9999)).padStart(5, '0'),
        face: faces ? rint(0, faces - 1) : 0,
        y,
        sc: 0.62 + ((y - H * 0.6) / (H * 0.32)) * 0.5,
        v: 22 + Math.random() * 18,
        ph: Math.random() * 6,
        jacket: pick(JACKETS),
        skin: pick(SKINS),
        prog: 0,
        scanned: false,
        marked: false,
        gone: false,
        x: -30,
      });
    }
    queue.forEach((q) => (q.decoy = !q.org && !!q.item));
    const pt = { x: W * 0.45, y: H * 0.7, down: false, in: false };
    let t0 = performance.now(), left = secs, over = false, last = t0, nextQ = 0, target = null;
    const rect = () => cv.getBoundingClientRect();
    const toLocal = (e) => {
      const r = rect();
      return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
    };
    const hit = (x, y) => {
      let best = null, bd = 1e9;
      people.forEach((p) => {
        if (p.gone) return;
        const h = 118 * p.sc;
        const d = Math.hypot(x - p.x, y - (p.y - h * 0.5));
        if (d < Math.max(34, h * 0.36) && d < bd) (best = p), (bd = d);
      });
      return best;
    };
    const showCard = (p) => {
      const face = G.DOC_FACES && G.DOC_FACES[p.face] ? `<img src="${G.DOC_FACES[p.face].img}" alt="">` : '';
      card.hidden = false;
      card.className = 'sc-card ' + (p.org ? 'org' : p.item ? 'item' : 'clear');
      card.innerHTML = `${face}<div><b>${p.id}</b><span>${p.org ? 'CARRIES: ' + p.item : p.item ? 'CARRIES: ' + p.item : 'NOTHING OF INTEREST'}</span><small>${p.marked ? 'MARKED FOR STOP' : 'tap the figure to mark'}</small></div>`;
    };
    cv.addEventListener('pointermove', (e) => ((Object.assign(pt, toLocal(e)).in = true), 0));
    cv.addEventListener('pointerleave', () => (pt.in = false));
    cv.addEventListener('pointerdown', (e) => {
      Object.assign(pt, toLocal(e));
      pt.in = true;
      const p = hit(pt.x, pt.y);
      if (p && p.scanned) {
        p.marked = !p.marked;
        showCard(p);
        status();
      }
    });
    const marks = () => people.filter((p) => p.marked).length + queue.filter((p) => p.marked).length;
    const status = () => {
      const all = people.concat(queue);
      log.textContent = `Marked ${all.filter((p) => p.marked).length} · scanned ${all.filter((p) => p.scanned).length} · crossed to the gate ${people.filter((p) => p.gone).length}/${total}`;
    };
    const finish = () => {
      if (over) return;
      over = true;
      clearInterval(timer);
      const all = people.concat(queue);
      const caught = all.filter((p) => p.org && p.marked).length;
      const wrong = all.filter((p) => !p.org && p.marked).length;
      const missed = targets - caught;
      const ok = caught >= Math.ceil(targets * 0.67) && wrong <= 2;
      root.classList.add(ok ? 'won' : 'lost');
      log.textContent = ok ? `${caught} of ${targets} organisers marked${wrong ? `, ${wrong} innocent${wrong > 1 ? 's' : ''} marked too` : ''}.` : `${caught} of ${targets} organisers marked, ${wrong} innocents marked. The rest are already at the gate.`;
      done(ok, { caught, wrong, missed });
    };
    const drawPerson = (p, t) => {
      const h = 118 * p.sc, w = h * 0.4;
      const swing = Math.sin(t * 6 + p.ph);
      const bob = Math.abs(swing) * 2 * p.sc;
      const x = p.x, y = p.y - bob;
      ctx.fillStyle = 'rgba(0,0,0,.3)';
      ctx.beginPath();
      ctx.ellipse(x, p.y + 2, w * 0.75, 4 * p.sc, 0, 0, 6.3);
      ctx.fill();
      /* legs, swinging */
      ctx.fillStyle = '#1a1c1e';
      ctx.beginPath();
      ctx.moveTo(x - w * 0.36, y - h * 0.44); ctx.lineTo(x - w * 0.04, y - h * 0.44); ctx.lineTo(x - w * 0.04 + swing * w * 0.16, y); ctx.lineTo(x - w * 0.34 + swing * w * 0.16, y); ctx.closePath();
      ctx.moveTo(x + w * 0.04, y - h * 0.44); ctx.lineTo(x + w * 0.36, y - h * 0.44); ctx.lineTo(x + w * 0.34 - swing * w * 0.16, y); ctx.lineTo(x + w * 0.04 - swing * w * 0.16, y); ctx.closePath();
      ctx.fill();
      /* the jacket: rounded shoulders, grey yoke */
      const g = ctx.createLinearGradient(x - w * 0.5, 0, x + w * 0.5, 0);
      g.addColorStop(0, p.jacket); g.addColorStop(0.5, '#3c4043'); g.addColorStop(1, p.jacket);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x - w * 0.52, y - h * 0.4);
      ctx.lineTo(x - w * 0.5, y - h * 0.76);
      ctx.quadraticCurveTo(x - w * 0.46, y - h * 0.86, x - w * 0.18, y - h * 0.86);
      ctx.lineTo(x + w * 0.18, y - h * 0.86);
      ctx.quadraticCurveTo(x + w * 0.46, y - h * 0.86, x + w * 0.5, y - h * 0.76);
      ctx.lineTo(x + w * 0.52, y - h * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(120,125,130,.55)';
      ctx.fillRect(x - w * 0.48, y - h * 0.84, w * 0.96, h * 0.09);
      ctx.fillStyle = '#cfcabb';
      ctx.fillRect(x - w * 0.34, y - h * 0.66, w * 0.22, h * 0.045);
      /* head */
      ctx.fillStyle = '#1f2123';
      ctx.fillRect(x - w * 0.1, y - h * 0.9, w * 0.2, h * 0.06);
      ctx.fillStyle = p.skin;
      ctx.beginPath();
      ctx.ellipse(x, y - h * 0.955, h * 0.078, h * 0.095, 0, 0, 6.3);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.35)';
      ctx.beginPath();
      ctx.ellipse(x, y - h * 1.0, h * 0.08, h * 0.05, 0, Math.PI, 0);
      ctx.fill();
    };
    const draw = (t) => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(95,200,221,.07)';
      ctx.fillRect(gateX, 0, W - gateX, H);
      ctx.strokeStyle = 'rgba(95,200,221,.5)';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(gateX, 0);
      ctx.lineTo(gateX, H);
      ctx.stroke();
      ctx.setLineDash([]);
      const sorted = people.filter((p) => !p.gone).sort((a, b) => a.y - b.y);
      sorted.forEach((p) => {
        drawPerson(p, t);
        if (p.scanned) {
          const h = 118 * p.sc;
          ctx.strokeStyle = p.marked ? '#ff7a45' : p.org || p.item ? 'rgba(255,190,90,.9)' : 'rgba(95,200,221,.6)';
          ctx.lineWidth = p.marked ? 2.4 : 1;
          ctx.strokeRect(p.x - h * 0.24, p.y - h * 1.02, h * 0.48, h * 1.04);
          ctx.fillStyle = ctx.strokeStyle;
          ctx.font = '10px monospace';
          ctx.fillText(p.marked ? 'STOP' : p.id, p.x - h * 0.22, p.y - h * 1.05);
        }
      });
      /* the reticle */
      if (pt.in || pt.down || true) {
        const r = 34;
        ctx.strokeStyle = target ? '#9ae8f5' : 'rgba(95,200,221,.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r, 0, 6.3);
        ctx.moveTo(pt.x - r - 8, pt.y); ctx.lineTo(pt.x - r + 8, pt.y);
        ctx.moveTo(pt.x + r - 8, pt.y); ctx.lineTo(pt.x + r + 8, pt.y);
        ctx.moveTo(pt.x, pt.y - r - 8); ctx.lineTo(pt.x, pt.y - r + 8);
        ctx.moveTo(pt.x, pt.y + r - 8); ctx.lineTo(pt.x, pt.y + r + 8);
        ctx.stroke();
        if (target && !target.scanned) {
          ctx.strokeStyle = '#ffd36a';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, r + 6, -1.57, -1.57 + 6.28 * Math.min(1, target.prog));
          ctx.stroke();
          ctx.fillStyle = '#ffd36a';
          ctx.font = '11px monospace';
          ctx.fillText('SCANNING ' + Math.round(target.prog * 100) + '%', pt.x + r + 12, pt.y - 4);
        }
      }
    };
    const step = () => {
      if (!document.body.contains(root) || !root.closest('.block.current') || G.state() !== S) return clearInterval(timer);
      if (over || document.hidden) return;
      const now = performance.now();
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      left -= dt;
      const el = secs - left;
      while (queue.length && queue[0].at <= el) people.push(queue.shift());
      people.forEach((p) => {
        if (p.gone) return;
        p.x += p.v * dt * 1.4;
        if (p.x > gateX) {
          p.gone = true;
          if (p.marked) p.marked = true;
        }
      });
      target = pt.in ? hit(pt.x, pt.y) : null;
      if (target && !target.scanned) {
        target.prog += rate * dt * 0.55;
        if (target.prog >= 1) {
          target.scanned = true;
          showCard(target);
          status();
        }
      }
      people.forEach((p) => p !== target && !p.scanned && (p.prog = Math.max(0, p.prog - dt * 0.4)));
      root.querySelector('.cr-clock').textContent = Math.max(0, Math.ceil(left)) + 's';
      draw(now / 1000);
      if (left <= 0 || (!queue.length && people.every((p) => p.gone))) finish();
    };
    const timer = setInterval(step, 33);
    status();
  };
})();
