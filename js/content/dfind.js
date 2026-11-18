/* RADIO DIRECTION FINDING — three listening posts on the city map, one hidden transmitter.
   At each post you turn the dial: the signal peaks in the direction of the transmitter, but only in
   bursts, and with noise (Radio & Protocol cuts the noise). Lock the bearing where it is strongest and a
   line is drawn across the map. When all three are locked the lines nearly meet; tap the place where they
   cross. Scene usage: mini: { type: 'dfind', opts: { site: 'd3' }, pass, fail, skill: 'comms' }.
   The result is in lastMini: { picked, truth, err }. */
(function () {
  G.MINIGAMES = G.MINIGAMES || {};
  const POSTS = [
    { n: 1, name: 'Hydro dam crest', x: 300, y: 200 },
    { n: 2, name: 'Upper Town roof', x: 1400, y: 230 },
    { n: 3, name: 'Nexus roof', x: 899, y: 720 },
  ];
  G.DF_SITES = [
    { id: 'd4', name: 'the signal box, Rail Yards', short: 'Signal box · D4', x: 120, y: 650 },
    { id: 'd3', name: 'Pump House 4, Canal Quarter', short: 'Pump House 4 · D3', x: 383, y: 650 },
    { id: 'd2', name: 'the dye floor, the Works', short: 'Dye floor · D2', x: 641, y: 615 },
    { id: 'd5', name: 'the roof of Stack 22', short: 'Stack 22 · D5', x: 1260, y: 600 },
    { id: 'd6', name: 'a chapel in Cathedral Ward', short: 'Chapel · D6', x: 1000, y: 300 },
    { id: 'q4', name: 'the cellars of Old Town', short: 'Old Town · 404', x: 1480, y: 640 },
  ];
  const brg = (p, q) => ((Math.atan2(q.x - p.x, -(q.y - p.y)) * 180) / Math.PI + 360) % 360;
  const diff = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
  const RAD = (d) => ((d - 90) * Math.PI) / 180;

  G.MINIGAMES.dfind = (block, opts, done) => {
    const S = G.state();
    const site = G.DF_SITES.find((x) => x.id === opts.site) || G.pick(G.DF_SITES);
    const noise = Math.max(0.05, 0.22 - ((S.skills || {}).comms || 0) * 0.03);
    const img = G.CITY_MAP_IMG || 'assets/img/city-map.webp';
    let at = 0, left = 90, over = false, shown = 0, burst = true, bt = 0, dial = Math.floor(Math.random() * 360);
    const lock = [];
    const root = document.createElement('div');
    root.className = 'mini dfind';
    root.innerHTML = `<div class="cr-head"><span class="cr-title">${opts.title || 'Direction finding'}</span><span class="cr-clock"></span></div>
      <div class="df-map"></div>
      <div class="df-panel"><div class="df-where"></div><input type="range" min="0" max="359" step="1" aria-label="Bearing in degrees"><div class="df-meter"><span></span></div><div class="df-deg"></div><button type="button" class="df-lock">Lock bearing</button></div>
      <div class="m3-log"></div>
      <div class="cr-help">The signal comes in bursts and the noise shifts. Turn the dial until the meter peaks, then lock the bearing. After three posts, tap the place where the lines cross.</div>`;
    block.append(root);
    const $ = (q) => root.querySelector(q);
    const rng = $('input');
    rng.value = dial;
    const draw = () => {
      let g = `<svg viewBox="0 0 1600 900" class="df-svg" role="img" aria-label="City map with listening posts"><image href="${img}" x="0" y="0" width="1600" height="900" preserveAspectRatio="xMidYMid slice"/><rect width="1600" height="900" fill="rgba(4,8,10,.45)"/>`;
      G.DF_SITES.forEach((s) => {
        const on = lock.length >= 3 && !over;
        g += `<g class="df-site${on ? ' pick' : ''}" data-site="${s.id}" ${on ? 'tabindex="0" role="button"' : ''}><path d="M${s.x} ${s.y - 16} l14 16 -14 16 -14 -16z"/><text x="${s.x}" y="${s.y + 36}">${s.short.toUpperCase()}</text></g>`;
      });
      lock.forEach((a, i) => {
        const p = POSTS[i];
        g += `<line x1="${p.x}" y1="${p.y}" x2="${p.x + Math.cos(RAD(a)) * 1800}" y2="${p.y + Math.sin(RAD(a)) * 1800}" class="df-line"/>`;
      });
      if (at < 3 && !over) {
        const p = POSTS[at];
        g += `<line x1="${p.x}" y1="${p.y}" x2="${p.x + Math.cos(RAD(dial)) * 1800}" y2="${p.y + Math.sin(RAD(dial)) * 1800}" class="df-ray"/>`;
      }
      POSTS.forEach((p, i) => (g += `<g class="df-post${i === at ? ' on' : ''}${i < lock.length ? ' done' : ''}"><circle cx="${p.x}" cy="${p.y}" r="16"/><text x="${p.x}" y="${p.y + 6}">${p.n}</text></g>`));
      $('.df-map').innerHTML = g + '</svg>';
      if (at < 3 && !over) $('.df-where').textContent = `Post ${POSTS[at].n} of 3 — ${POSTS[at].name}`;
      else $('.df-where').textContent = over ? '' : 'All three bearings are locked. Tap the place where the lines cross.';
      $('.df-panel').classList.toggle('closed', at >= 3 || over);
      $('.df-deg').textContent = String(dial).padStart(3, '0') + '°';
    };
    const finish = (picked) => {
      if (over) return;
      over = true;
      clearInterval(timer);
      const ok = picked === site.id;
      root.classList.add(ok ? 'won' : 'lost');
      $('.m3-log').textContent = ok ? `The transmitter is in ${site.name}.` : `The lines pointed at ${picked ? (G.DF_SITES.find((x) => x.id === picked) || {}).name : 'nothing'}. The transmitter was in ${site.name}.`;
      draw();
      done(ok, { picked, truth: site.id });
    };
    const doLock = () => {
      if (at >= 3 || over) return;
      lock.push(dial);
      at++;
      if (at < 3) {
        dial = Math.floor(Math.random() * 360);
        rng.value = dial;
      }
      draw();
    };
    rng.oninput = () => {
      dial = +rng.value;
      draw();
    };
    $('.df-lock').onclick = doLock;
    $('.df-map').onclick = (e) => {
      const s = e.target.closest('[data-site]');
      if (s && lock.length >= 3 && !over) finish(s.dataset.site);
    };
    const meter = () => {
      if (at >= 3) return;
      const d = diff(dial, brg(POSTS[at], site));
      const sig = Math.exp(-Math.pow(d / 14, 2)) * 100;
      shown = burst ? Math.max(0, Math.min(100, sig + (Math.random() - 0.5) * 200 * noise)) : shown * 0.7;
      $('.df-meter span').style.width = shown + '%';
    };
    const timer = setInterval(() => {
      if (!document.body.contains(root) || !root.closest('.block.current') || G.state() !== S) return clearInterval(timer);
      if (over || document.hidden) return;
      left -= 0.1;
      bt += 0.1;
      if (bt > (burst ? 0.55 : 0.3)) ((burst = !burst), (bt = 0));
      meter();
      $('.cr-clock').textContent = Math.max(0, Math.ceil(left)) + 's';
      if (left <= 0) {
        while (lock.length < 3) lock.push(dial);
        at = 3;
        draw();
        finish(null);
      }
    }, 100);
    draw();
  };
})();
