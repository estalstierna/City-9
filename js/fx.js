/* PRESENTATION — the game as more than text. Two layers, each with a switch in the Menu:
   CINEMATIC SCENES (pref "cine"):
   - the scene's picture becomes a wide "hero" frame that slowly pans and zooms, with weather over
     it chosen from the scene (rain, smoke, screen flicker, drifting dust);
   - the same picture, blurred and dark, fills the page behind the story;
   - dialogue lines get the speaker's face when the game knows it.
   MASK HUD (pref "hud"): from the day you wear the mask —
   - a lens vignette and corner brackets round the screen;
   - a biosignal trace in the corner that beats faster when you are hurt or watched;
   - a radio waveform that moves when Dispatch or a radio line comes in;
   - stopping a citizen SCANS their face: brackets, a sweep line, the CID read out.
   Everything is CSS and SVG; it all stands still under prefers-reduced-motion. */
(function () {
  const on = (k) => G.prefs()[k] !== false;
  G.PREF_TOGGLES = (G.PREF_TOGGLES || []).concat([
    { key: 'cine', label: 'Cinematic scenes' },
    { key: 'hud', label: 'Mask HUD' },
  ]);

  /* ------------------------------------------------------------ stage */
  const stage = document.createElement('div');
  stage.id = 'stage';
  stage.innerHTML = '<div class="st-a"></div><div class="st-b"></div>';
  const hud = document.createElement('div');
  hud.id = 'hud';
  hud.setAttribute('aria-hidden', 'true');
  hud.innerHTML = `<i class="hud-c tl"></i><i class="hud-c tr"></i><i class="hud-c bl"></i><i class="hud-c br"></i>
    <div class="hud-bio"><svg viewBox="0 0 120 24" preserveAspectRatio="none"><path d="M0 12 H38 L44 4 L50 20 L56 8 L60 12 H120"/></svg><span>BIOSIGNAL</span></div>
    <div class="hud-radio"><span>RX</span>${'<b></b>'.repeat(9)}</div>`;
  const mount = () => {
    document.body.prepend(stage);
    document.body.append(hud);
    apply();
  };
  let flip = false;
  let lastSrc = '';
  const setStage = (src) => {
    if (src === lastSrc) return;
    lastSrc = src;
    const [a, b] = [stage.querySelector('.st-a'), stage.querySelector('.st-b')];
    const [show, hide] = flip ? [a, b] : [b, a];
    flip = !flip;
    show.style.backgroundImage = src ? `url("${src}")` : 'none';
    show.classList.add('on');
    hide.classList.remove('on');
  };
  const WEATHER = [
    [/rain|flood|storm|drowned|wet |canal quarter|coast road/i, 'rain'],
    [/smoke|burn|fire|siege|ambush|cutting|riot/i, 'smoke'],
    [/screen|broadcast|plaza 5/i, 'flicker'],
  ];
  const faceOf = (who) => {
    const n = who.replace(/["“”]/g, '').trim().toLowerCase();
    const k = Object.keys(G.PEOPLE).find((key) => {
      const pn = G.PEOPLE[key].name.replace(/["“”]/g, '').toLowerCase();
      return G.PEOPLE[key].img && (pn === n || pn.endsWith(' ' + n) || pn === 'the ' + n);
    });
    return k ? `assets/img/portraits/${G.PEOPLE[k].img}-thumb.webp` : null;
  };

  function apply() {
    const s = G.state && G.state();
    const masked = !!s && (s.phase === 'union' || (s.phase === 'training' && false)) && s.scene !== 'title';
    document.body.classList.toggle('cine', on('cine'));
    document.body.classList.toggle('hud-on', on('hud') && masked);
    if (!s) return;
    const beat = s.hp < 40 || s.susp >= 60 ? 0.55 : s.susp >= 30 ? 0.8 : 1.15;
    hud.style.setProperty('--beat', beat + 's');
    hud.classList.toggle('warn', s.hp < 40 || s.susp >= 60);
  }
  (G.onPref = G.onPref || []).push(() => {
    apply();
    if (!on('cine')) setStage('');
  });

  G.afterRender.push((sc, id, block) => {
    apply();
    /* radio traffic: the waveform moves for a few seconds */
    if (block.querySelector('.radio, .dispatch')) {
      hud.classList.add('rx');
      clearTimeout(hud._t);
      hud._t = setTimeout(() => hud.classList.remove('rx'), 4200);
    }
    if (block.querySelector('.note.observed')) {
      hud.classList.add('flash');
      setTimeout(() => hud.classList.remove('flash'), 900);
    }
    /* scanning a citizen's face */
    block.querySelectorAll('figure.pic.portrait').forEach((f) => {
      const cap = (f.querySelector('figcaption') || {}).textContent || '';
      if (!/subject|CID \d/i.test(cap) || !on('hud')) return;
      f.classList.add('scan');
      const s = G.state();
      const cid = (s.ss && s.ss.cid) || (cap.match(/CID (\d+)/) || [])[1] || '';
      f.insertAdjacentHTML('beforeend', `<span class="scan-line"></span><span class="scan-tag">SCANNING${cid ? ' · CID ' + cid : ''}</span>`);
    });
    if (!on('cine')) return;
    /* the hero frame and the backdrop */
    const fig = block.querySelector('figure.pic:not(.portrait)');
    if (fig) {
      const txt = block.textContent + ' ' + id;
      const w = (WEATHER.find(([re]) => re.test(txt)) || [null, 'dust'])[1];
      fig.classList.add('hero', 'fx-' + w);
      fig.insertAdjacentHTML('beforeend', '<span class="fx"></span>');
      setStage(fig.querySelector('img').getAttribute('src'));
    }
    /* faces on dialogue */
    block.querySelectorAll('.say').forEach((d) => {
      const who = d.querySelector('.speaker');
      const src = who && faceOf(who.textContent);
      if (!src || who.textContent.trim().toLowerCase() === 'you') return;
      d.classList.add('faced');
      d.insertAdjacentHTML('afterbegin', `<img class="say-face" src="${src}" alt="" loading="lazy">`);
    });
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
