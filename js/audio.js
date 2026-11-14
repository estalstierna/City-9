/* AUDIO — procedural, no sound files. Web Audio builds everything at runtime:
   - an ambient bed: the dam's hum under everything, wind/rain noise whose level follows the scene
     (outdoors at night louder, Level 4 and the labs a low drone);
   - small cues: a soft tick on choices, a radio squelch on dispatch/radio lines, a rising or
     falling tone on skill checks, a chime on promotions, a low sting when you are OBSERVED.
   Starts after the first tap (browsers require it). Toggled in the Menu; remembered per device. */
(function () {
  const G = window.G;
  let ctx = null, master = null, bed = null, noiseGain = null, humGain = null, droneGain = null;
  const pref = () => {
    try {
      const p = JSON.parse(localStorage.getItem('c9rp_prefs') || '{}');
      return p.sound !== false;
    } catch (e) {
      return true;
    }
  };
  const setPref = (on) => {
    try {
      const p = JSON.parse(localStorage.getItem('c9rp_prefs') || '{}');
      p.sound = on;
      localStorage.setItem('c9rp_prefs', JSON.stringify(p));
    } catch (e) {}
  };
  let enabled = pref();

  function start() {
    if (ctx || !enabled) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    bed = ctx.createGain();
    bed.gain.value = 0;
    bed.connect(master);
    /* the dam: two detuned low oscillators through a lowpass */
    humGain = ctx.createGain();
    humGain.gain.value = 0.05;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 140;
    [49, 51.5].forEach((f) => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f;
      o.connect(lp);
      o.start();
    });
    lp.connect(humGain).connect(bed);
    /* wind / rain: looped filtered noise */
    const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      last = 0.97 * last + 0.03 * (Math.random() * 2 - 1);
      d[i] = last * 4;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 500;
    bp.Q.value = 0.4;
    noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.02;
    src.connect(bp).connect(noiseGain).connect(bed);
    src.start();
    /* a slow drone for underground places */
    droneGain = ctx.createGain();
    droneGain.gain.value = 0;
    const dr = ctx.createOscillator();
    dr.type = 'sine';
    dr.frequency.value = 73;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 4;
    lfo.connect(lfoG).connect(dr.frequency);
    dr.connect(droneGain).connect(bed);
    dr.start();
    lfo.start();
    bed.gain.setTargetAtTime(1, ctx.currentTime, 2);
    mood();
  }

  /* the scene decides the mix */
  function mood() {
    if (!ctx) return;
    const s = G.state && G.state();
    const id = (s && s.scene) || '';
    const night = s && (s.time === 'Evening' || s.time === 'Night');
    const under = /level4|j_cells|iq_|vector|x2_vector|dd_v|dd_hmorgue|disc_tribunal|c2_j/.test(id);
    const outside = /rail|c3_4|c3_sweep|raid_start|dd_s|x2_spear|ev_roof|ev_canal|c4_3|cr_|w_event/.test(id);
    const t = ctx.currentTime;
    noiseGain.gain.setTargetAtTime(outside ? (night ? 0.06 : 0.04) : 0.012, t, 1.5);
    humGain.gain.setTargetAtTime(under ? 0.025 : 0.05, t, 1.5);
    droneGain.gain.setTargetAtTime(under ? 0.05 : 0, t, 2);
  }

  /* one-shot cues */
  function tone(f0, f1, dur, type, vol) {
    if (!ctx || !enabled) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.08, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  function squelch() {
    if (!ctx || !enabled) return;
    const t = ctx.currentTime;
    const len = 0.18;
    const b = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = ctx.createBufferSource();
    s.buffer = b;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 1800;
    f.Q.value = 1.2;
    const g = ctx.createGain();
    g.gain.value = 0.06;
    s.connect(f).connect(g).connect(master);
    s.start(t);
    tone(1400, 1400, 0.06, 'square', 0.02);
  }
  const CUES = {
    tick: () => tone(900, 600, 0.05, 'triangle', 0.035),
    ok: () => (tone(520, 780, 0.18, 'sine', 0.06), setTimeout(() => tone(780, 1040, 0.16, 'sine', 0.05), 90)),
    fail: () => tone(320, 160, 0.3, 'sawtooth', 0.04),
    radio: squelch,
    promo: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, f, 0.35, 'sine', 0.05), i * 110)),
    observed: () => tone(110, 70, 0.6, 'sawtooth', 0.05),
  };
  const cue = (n) => enabled && ctx && CUES[n] && CUES[n]();

  /* listen to what the page shows, rather than threading calls through every scene */
  function watch() {
    const story = document.getElementById('story');
    if (!story || !window.MutationObserver) return;
    new MutationObserver((muts) => {
      let radio = false, ok = false, fail = false, promo = false, obs = false, scene = false;
      muts.forEach((m) =>
        m.addedNodes.forEach((n) => {
          if (n.nodeType !== 1) return;
          if (n.classList.contains('block')) {
            scene = true;
            if (n.querySelector('.radio, .dispatch')) radio = true;
            if (n.querySelector('.note.promo')) promo = true;
            if (n.querySelector('.note.observed')) obs = true;
          }
          if (n.classList.contains('roll')) n.classList.contains('ok') ? (ok = true) : (fail = true);
        })
      );
      if (scene) mood();
      if (promo) cue('promo');
      else if (ok) cue('ok');
      else if (fail) cue('fail');
      if (obs) setTimeout(() => cue('observed'), 150);
      if (radio) setTimeout(() => cue('radio'), 250);
    }).observe(story, { childList: true, subtree: true });
  }

  const kick = () => {
    if (enabled) start();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  };
  document.addEventListener('pointerdown', kick, { passive: true });
  document.addEventListener('keydown', kick);
  document.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('.choice, .cr-btn, .ci-tile, .nav-btn')) cue('tick');
  });
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else if (enabled) ctx.resume();
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch);
  else watch();

  G.audio = {
    on: () => enabled,
    toggle: () => {
      enabled = !enabled;
      setPref(enabled);
      if (enabled) {
        start();
        if (ctx) ctx.resume();
        if (bed) bed.gain.setTargetAtTime(1, ctx.currentTime, 0.5);
      } else if (ctx && bed) bed.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
      return enabled;
    },
  };
})();
