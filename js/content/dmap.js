/* THE LIVING MAP — District 5 drawn, in the Dossier. Five blocks along the river, the Spire behind.
   What you have done shows on it:
   - lit windows follow each block's order, and go dark the night GRID cuts its power;
   - chalk lambdas spread with resentment (and with the cells' strength);
   - smoke rises over a block in trouble, or where something happened last night;
   - Lantern drones drift over the roofs, cyan, or red when a block is in trouble;
   - the Plaza 5 screen shows the blurred figure while Anticitizen One is on the screens;
   - a canal-cell flag on Stack 14 after the night you let D5 have.
   Tap a block for its state in words, and the faces from your case files who live there. */
(function () {
  const BL = [
    { k: 's9', x: 10, w: 56, top: 52, cols: 4 },
    { k: 's14', x: 74, w: 62, top: 34, cols: 4 },
    { k: 's22', x: 144, w: 56, top: 46, cols: 4 },
    { k: 'bazaar', x: 210, w: 56, top: 108, cols: 0 },
    { k: 'plaza', x: 274, w: 58, top: 124, cols: 0 },
  ];
  const GROUND = 148;
  const COL = { green: '#6fbf73', amber: '#e2a83f', red: '#d9534a' };
  const rng = (seed) => () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const dist = (s, k) => (G.worldEnsure ? G.worldEnsure(s).dist[k] : { o: 55, r: 30 });
  const state = (s, k) => (G.distColour ? G.distColour(s, k) : 'green');
  const darkTonight = (s, k) => s.mem && s.mem.dark && s.mem.dark.block === k && s.mem.dark.day >= s.day - 1;
  const smokeOver = (s, k) => state(s, k) === 'red' || (s.mem && s.mem.smoke && s.mem.smoke.block === k && s.mem.smoke.day >= s.day - 1) || (k !== 'plaza' && s.c7 && s.c7.night === 'broken' && s.c7.endDay !== undefined && s.day <= s.c7.endDay + 2);

  /* GRID's power board and last night's district event leave marks on the map */
  G.onChoose.push((s, c, id) => {
    if (!/^dd_gstacks/.test(id)) return;
    const t = String(c.t || '');
    if (/^Cut Stack 9/.test(t)) s.mem.dark = { block: 's9', day: s.day };
    if (/^Cut Bazaar/.test(t)) s.mem.dark = { block: 'bazaar', day: s.day };
  });
  G.afterRender.push((sc, id) => {
    const s = G.state();
    if (id === 'w_event' && s.world && s.world.evNow) s.mem.smoke = { block: s.world.evNow.block, day: s.day };
  });

  function stack(s, b, i) {
    const d = dist(s, b.k);
    const col = COL[state(s, b.k)];
    const r = rng(s.day * 31 + i * 7 + 1);
    const h = GROUND - b.top;
    const rows = Math.floor((h - 10) / 11);
    const light = darkTonight(s, b.k) ? 0.03 : 0.12 + (d.o / 100) * 0.55;
    let g = `<rect x="${b.x}" y="${b.top}" width="${b.w}" height="${h}" class="dm-wall" stroke="${col}"/>`;
    g += `<rect x="${b.x + b.w * 0.3}" y="${b.top - 6}" width="${b.w * 0.18}" height="6" class="dm-wall" stroke="${col}"/>`;
    g += `<line x1="${b.x + b.w * 0.75}" y1="${b.top}" x2="${b.x + b.w * 0.75}" y2="${b.top - 10}" class="dm-ant"/>`;
    const cw = (b.w - 10) / b.cols;
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < b.cols; x++) {
        const lit = r() < light;
        g += `<rect x="${(b.x + 6 + x * cw).toFixed(1)}" y="${b.top + 7 + y * 11}" width="${(cw - 5).toFixed(1)}" height="6" class="${lit ? 'dm-lit' : 'dm-dark'}"/>`;
      }
    return g;
  }
  function bazaar(s, b) {
    const col = COL[state(s, b.k)];
    const lit = darkTonight(s, b.k) ? 0 : 1;
    let g = `<rect x="${b.x}" y="${b.top + 10}" width="${b.w}" height="${GROUND - b.top - 10}" class="dm-wall" stroke="${col}"/>`;
    for (let i = 0; i < 4; i++) {
      const x = b.x + 2 + i * 13.5;
      g += `<path d="M${x} ${b.top + 10} l6 -9 l6 9 z" class="dm-awning ${i % 2 ? 'b' : 'a'}"/>`;
      g += `<rect x="${x + 2}" y="${b.top + 16}" width="8" height="8" class="${lit && i !== 2 ? 'dm-lit' : 'dm-dark'}"/>`;
    }
    return g;
  }
  function plaza(s, b) {
    const col = COL[state(s, b.k)];
    const wanted = s.c7 && !s.c7.done && s.c7.stage >= 0;
    let g = `<rect x="${b.x}" y="${b.top}" width="${b.w}" height="${GROUND - b.top}" class="dm-wall" stroke="${col}"/>`;
    g += `<line x1="${b.x + b.w / 2}" y1="${b.top}" x2="${b.x + b.w / 2}" y2="${b.top - 20}" class="dm-ant"/>`;
    g += `<rect x="${b.x + 8}" y="${b.top - 46}" width="${b.w - 16}" height="26" class="dm-screen${wanted ? ' wanted' : ''}"/>`;
    if (wanted) g += `<ellipse cx="${b.x + b.w / 2}" cy="${b.top - 33}" rx="4" ry="9" class="dm-figure"/>`;
    for (let i = 0; i < 5; i++) g += `<rect x="${b.x + 5 + i * 10}" y="${b.top + 10}" width="6" height="12" class="dm-hatch"/>`;
    return g;
  }
  function marks(s, b, i) {
    const d = dist(s, b.k);
    const r = rng(s.day * 13 + i * 101 + 5);
    const n = Math.min(6, Math.floor(d.r / 22) + (s.res >= 25 ? 1 : 0));
    let g = '';
    for (let j = 0; j < n; j++) g += `<text x="${(b.x + 4 + r() * (b.w - 10)).toFixed(1)}" y="${(GROUND - 3 - r() * Math.min(26, GROUND - b.top - 6)).toFixed(1)}" class="dm-chalk">λ</text>`;
    if (smokeOver(s, b.k))
      for (let j = 0; j < 3; j++) g += `<circle cx="${b.x + b.w * (0.3 + j * 0.2)}" cy="${b.top - 4}" r="${4 + j}" class="dm-smoke" style="animation-delay:${j * 0.9}s"/>`;
    if (b.k === 's14' && s.c7 && s.c7.night === 'aside') g += `<line x1="${b.x + 10}" y1="${b.top}" x2="${b.x + 10}" y2="${b.top - 22}" class="dm-pole"/><path d="M${b.x + 10} ${b.top - 22} h16 l-3 5 l3 5 h-16 z" class="dm-flag"/><text x="${b.x + 14}" y="${b.top - 13.5}" class="dm-flagl">λ</text>`;
    return g;
  }
  function lanterns(s) {
    const alert = BL.some((b) => state(s, b.k) === 'red');
    const r = rng(s.day * 7 + 3);
    let g = '';
    for (let i = 0; i < 3; i++) {
      const y = 18 + r() * 20;
      const x0 = 20 + r() * 80;
      const x1 = x0 + 120 + r() * 80;
      const dur = 16 + r() * 10;
      g += `<g class="dm-lantern${alert ? ' alert' : ''}"><circle r="2.4" cx="0" cy="0"/><path d="M0 2 l-6 14 h12 z" class="dm-beam"/><animateTransform attributeName="transform" type="translate" values="${x0.toFixed(0)} ${y.toFixed(0)}; ${x1.toFixed(0)} ${(y + 6).toFixed(0)}; ${x0.toFixed(0)} ${y.toFixed(0)}" dur="${dur.toFixed(1)}s" repeatCount="indefinite"/></g>`;
    }
    return g;
  }

  G.districtSvg = (s) => {
    let g = '<svg viewBox="0 0 340 172" class="dmap-svg" role="img" aria-label="Map of District 5">';
    g += '<defs><linearGradient id="dmSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1418"/><stop offset="1" stop-color="#16222a"/></linearGradient></defs>';
    g += `<rect width="340" height="172" fill="url(#dmSky)"/>`;
    /* the Spire and the dam, far behind */
    g += '<path d="M318 4 L324 4 L329 150 L313 150 Z" class="dm-spire"/><line x1="321" y1="10" x2="321" y2="148" class="dm-spire-line"/>';
    g += '<path d="M0 150 Q170 140 340 150 L340 172 L0 172 Z" class="dm-river"/>';
    BL.forEach((b, i) => {
      g += `<g class="dm-b" data-dblock="${b.k}" tabindex="0" role="button" aria-label="${G.BLOCKS[b.k].name}">`;
      g += b.cols ? stack(s, b, i) : b.k === 'bazaar' ? bazaar(s, b) : plaza(s, b);
      g += marks(s, b, i);
      g += `<text x="${b.x + b.w / 2}" y="${GROUND + 12}" class="dm-label" fill="${COL[state(s, b.k)]}">${G.BLOCKS[b.k].short}</text>`;
      g += '</g>';
    });
    g += lanterns(s);
    return g + '</svg>';
  };

  const words = (d) => ({
    order: d.o >= 60 ? 'Firm' : d.o >= 45 ? 'Holding' : d.o >= 30 ? 'Slipping' : 'Broken',
    res: d.r < 40 ? 'Low' : d.r < 55 ? 'Simmering' : d.r < 75 ? 'High' : 'Boiling',
  });
  const STATE_LINE = {
    green: 'The block does what it is told. Doors open when units knock.',
    amber: 'Conversations stop when an armband turns the corner. Chalk comes back faster than it is scrubbed.',
    red: 'Units walk in pairs here, and not after dark. Something is going to happen, or already has.',
  };
  function blockInfo(k) {
    const s = G.state();
    const d = dist(s, k);
    const w = words(d);
    const st = state(s, k);
    const files = Object.values(s.files || {})
      .filter((f) => G.homeBlock && G.homeBlock(f.cid) === k && f.face !== undefined && G.DOC_FACES && G.DOC_FACES[f.face])
      .sort((a, b) => (b.last || 0) - (a.last || 0))
      .slice(0, 8);
    const residential = ['s9', 's14', 's22'].includes(k);
    return `<div class="dm-info"><p class="dm-state" style="color:${COL[st]}">${st === 'green' ? 'Calm' : st === 'amber' ? 'Tense' : 'Trouble'}</p>
      <div class="kv"><span>Order</span><b>${w.order}</b></div><div class="kv"><span>Resentment</span><b>${w.res}</b></div>
      ${darkTonight(s, k) ? '<div class="kv"><span>Power</span><b>Cut tonight</b></div>' : ''}
      <p>${STATE_LINE[st]}</p>
      ${residential ? `<h4>Your files in ${G.BLOCKS[k].name}</h4>${files.length ? `<div class="dm-faces">${files.map((f) => `<figure class="${f.amputated ? 'dead' : ''}"><img src="${G.DOC_FACES[f.face].img}" alt="" loading="lazy"><figcaption>CID ${f.cid}<small>${f.amputated ? 'AMPUTATED' : f.lastVerdict || ''}</small></figcaption></figure>`).join('')}</div>` : '<p class="sub">Nobody you have stopped lives here. Yet.</p>'}` : ''}
    </div>`;
  }
  const open = (k) => G.openModal(G.BLOCKS[k].name, blockInfo(k), 'modal');
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-dblock]');
    if (b) open(b.dataset.dblock);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const b = e.target.closest && e.target.closest('[data-dblock]');
    if (!b) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    open(b.dataset.dblock);
  });

  G.sideExtras = G.sideExtras || [];
  G.sideExtras.push((s) => {
    if (s.phase !== 'union' || !s.dist) return '';
    return `<section><h3>District 5</h3>${G.districtSvg(s)}<div class="sub">Lit windows: order. Chalk: resentment. Smoke: trouble. Tap a block.</div></section>`;
  });
})();
