/* AUDIO — procedural, no sound files. Web Audio builds everything at runtime.
   Three channels, each with its own volume in the Menu (remembered per device), under one master
   switch:
   - AMBIENCE: the dam's hum, wind/rain noise that follows the scene (outdoors at night louder),
     a low drone in Level 4 and the labs;
   - EFFECTS: a soft tick on choices, rising/falling tones on skill checks, a chime on promotions,
     a low sting when you are OBSERVED;
   - RADIO: a handset transmission when a RADIO or DISPATCH line appears. Key-up click, squelch
     opening, a burst of band-limited, clipped "voice" (syllable-shaped noise and buzz through a
     300–3000 Hz radio band), crackle, and the squelch tail when the carrier drops. Dispatch lines
     are the city's broadcast net: a short alert tone first, a cleaner and longer transmission.
   Starts after the first tap (browsers require it). */
(function () {
  const G = window.G;
  const DEFAULTS = { amb: 0.35, fx: 0.8, radio: 0.8 };
  const readPrefs = () => {
    try {
      return JSON.parse(localStorage.getItem('c9rp_prefs') || '{}');
    } catch (e) {
      return {};
    }
  };
  const writePrefs = (fn) => {
    try {
      const p = readPrefs();
      fn(p);
      localStorage.setItem('c9rp_prefs', JSON.stringify(p));
    } catch (e) {}
  };
  let enabled = readPrefs().sound !== false;
  const vols = Object.assign({}, DEFAULTS, readPrefs().vol || {});

  let ctx = null, master = null, bus = {}, noiseGain = null, humGain = null, droneGain = null, noiseBuf = null;

  /* ----------------------------------------------------------- set-up */
  function start() {
    if (ctx || !enabled) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
    ['amb', 'fx', 'radio'].forEach((k) => {
      bus[k] = ctx.createGain();
      bus[k].gain.value = k === 'amb' ? 0 : vols[k];
      bus[k].connect(master);
    });

    /* white noise, shared by wind, squelch, crackle and voice */
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

    /* the dam: two detuned low triangles through a lowpass (softer than a raw saw) */
    humGain = ctx.createGain();
    humGain.gain.value = 0.06;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 110;
    [49, 51.5].forEach((f) => {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.value = f;
      o.connect(lp);
      o.start();
    });
    lp.connect(humGain).connect(bus.amb);

    /* wind / rain: brown-ish noise, slowly breathing */
    const wb = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const d = wb.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      last = 0.97 * last + 0.03 * (Math.random() * 2 - 1);
      d[i] = last * 4;
    }
    const src = ctx.createBufferSource();
    src.buffer = wb;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 500;
    bp.Q.value = 0.4;
    noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.02;
    const gust = ctx.createOscillator();
    gust.frequency.value = 0.05;
    const gustG = ctx.createGain();
    gustG.gain.value = 160;
    gust.connect(gustG).connect(bp.frequency);
    gust.start();
    src.connect(bp).connect(noiseGain).connect(bus.amb);
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
    dr.connect(droneGain).connect(bus.amb);
    dr.start();
    lfo.start();

    bus.amb.gain.setTargetAtTime(vols.amb, ctx.currentTime, 2);
    mood();
  }

  /* the scene decides the ambience mix */
  function mood() {
    if (!ctx) return;
    const s = G.state && G.state();
    const id = (s && s.scene) || '';
    const night = s && (s.time === 'Evening' || s.time === 'Night');
    const under = /level4|j_cells|iq_|vector|x2_vector|dd_v|dd_hmorgue|disc_tribunal|c2_j/.test(id);
    const outside = /rail|c3_4|c3_sweep|raid_start|dd_s|x2_spear|ev_roof|ev_canal|c4_3|cr_|w_event|c7_2|c7_3/.test(id);
    const t = ctx.currentTime;
    noiseGain.gain.setTargetAtTime(outside ? (night ? 0.06 : 0.04) : 0.012, t, 1.5);
    humGain.gain.setTargetAtTime(under ? 0.03 : 0.06, t, 1.5);
    droneGain.gain.setTargetAtTime(under ? 0.05 : 0, t, 2);
  }

  /* ----------------------------------------------------------- effects */
  function tone(f0, f1, dur, type, vol, at, out) {
    if (!ctx || !enabled) return;
    const t = at || ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.08, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(out || bus.fx);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  function noise(at, dur, out, env) {
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    s.loop = true;
    const g = ctx.createGain();
    env(g.gain, at, dur);
    s.connect(g).connect(out);
    s.start(at, Math.random());
    s.stop(at + dur + 0.05);
    return g;
  }

  /* ------------------------------------------------------------- radio
     A handset transmission. Everything passes through a radio band (highpass 300, lowpass 3000)
     and a soft clipper, so it sounds like a small speaker on a shoulder strap. */
  function radioChain() {
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 320;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2900;
    const peak = ctx.createBiquadFilter();
    peak.type = 'peaking';
    peak.frequency.value = 1500;
    peak.gain.value = 6;
    const clip = ctx.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) {
      const x = (i / (curve.length - 1)) * 2 - 1;
      curve[i] = Math.tanh(x * 3.5);
    }
    clip.curve = curve;
    hp.connect(lp).connect(peak).connect(clip).connect(bus.radio);
    return hp;
  }

  function transmission(kind, chars) {
    if (!ctx || !enabled || vols.radio <= 0) return;
    const dispatch = kind === 'dispatch';
    const out = radioChain();
    let t = ctx.currentTime + 0.02;

    /* dispatch: the city net opens with a short two-step alert tone */
    if (dispatch) {
      tone(988, 988, 0.12, 'sine', 0.3, t, out);
      tone(740, 740, 0.18, 'sine', 0.3, t + 0.14, out);
      t += 0.42;
    }

    /* key-up: a hard click, then the squelch opening */
    tone(2200, 300, 0.012, 'square', 0.25, t, out);
    noise(t + 0.01, 0.13, out, (g, a, d) => {
      g.setValueAtTime(0.0001, a);
      g.exponentialRampToValueAtTime(0.35, a + 0.008);
      g.exponentialRampToValueAtTime(0.06, a + d);
    });

    /* the voice: syllables of shaped noise plus a buzzing glottal tone, about 4–6 a second */
    const talk = Math.min(dispatch ? 2.6 : 1.9, 0.7 + (chars || 60) / 90);
    const v0 = t + 0.16;
    const carrier = noise(v0, talk + 0.1, out, (g, a, d) => {
      g.setValueAtTime(0.03, a);
      g.setValueAtTime(0.03, a + d);
    });
    const voiceN = ctx.createBufferSource();
    voiceN.buffer = noiseBuf;
    voiceN.loop = true;
    const buzz = ctx.createOscillator();
    buzz.type = 'sawtooth';
    const pitch = dispatch ? 105 : 125 + Math.random() * 30;
    buzz.frequency.value = pitch;
    const form1 = ctx.createBiquadFilter();
    form1.type = 'bandpass';
    form1.Q.value = 5;
    const form2 = ctx.createBiquadFilter();
    form2.type = 'bandpass';
    form2.Q.value = 7;
    const mixN = ctx.createGain();
    mixN.gain.value = 0.5;
    const mixB = ctx.createGain();
    mixB.gain.value = 0.35;
    const env = ctx.createGain();
    env.gain.value = 0;
    voiceN.connect(mixN);
    buzz.connect(mixB);
    mixN.connect(form1);
    mixB.connect(form1);
    mixN.connect(form2);
    mixB.connect(form2);
    form1.connect(env);
    form2.connect(env);
    env.connect(out);
    let s = v0;
    while (s < v0 + talk) {
      const len = 0.09 + Math.random() * 0.14;
      const gap = Math.random() < 0.18 ? 0.12 + Math.random() * 0.12 : 0.02 + Math.random() * 0.04;
      const peakV = 0.5 + Math.random() * 0.5;
      env.gain.setTargetAtTime(peakV, s, 0.015);
      env.gain.setTargetAtTime(0.0, s + len, 0.025);
      form1.frequency.setTargetAtTime(400 + Math.random() * 500, s, 0.02);
      form2.frequency.setTargetAtTime(1100 + Math.random() * 1300, s, 0.02);
      buzz.frequency.setTargetAtTime(pitch * (0.9 + Math.random() * 0.25), s, 0.03);
      s += len + gap;
    }
    const end = v0 + talk;
    voiceN.start(v0, Math.random());
    buzz.start(v0);
    voiceN.stop(end + 0.1);
    buzz.stop(end + 0.1);

    /* crackle: a few pops riding the carrier */
    const pops = Math.round(talk * (dispatch ? 2 : 5));
    for (let i = 0; i < pops; i++) {
      const at = v0 + Math.random() * talk;
      noise(at, 0.012, out, (g, a, d) => {
        g.setValueAtTime(0.0001, a);
        g.exponentialRampToValueAtTime(0.4, a + 0.002);
        g.exponentialRampToValueAtTime(0.0001, a + d);
      });
    }

    /* carrier drops: the squelch tail */
    noise(end + 0.02, 0.22, out, (g, a, d) => {
      g.setValueAtTime(0.0001, a);
      g.exponentialRampToValueAtTime(0.3, a + 0.01);
      g.exponentialRampToValueAtTime(0.0001, a + d);
    });
    tone(1800, 1800, 0.03, 'square', 0.03, end + 0.25, out);
    return carrier;
  }

  const CUES = {
    tick: () => tone(900, 600, 0.05, 'triangle', 0.035),
    ok: () => (tone(520, 780, 0.18, 'sine', 0.06), setTimeout(() => tone(780, 1040, 0.16, 'sine', 0.05), 90)),
    fail: () => tone(320, 160, 0.3, 'sawtooth', 0.04),
    promo: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, f, 0.35, 'sine', 0.05), i * 110)),
    observed: () => tone(110, 70, 0.6, 'sawtooth', 0.05),
  };
  const cue = (n) => enabled && ctx && vols.fx > 0 && CUES[n] && CUES[n]();

  /* one transmission at a time; a second line in the same scene waits for the first */
  let radioFree = 0;
  function radio(kind, chars) {
    if (!ctx) return;
    const now = ctx.currentTime;
    const wait = Math.max(0, radioFree - now);
    setTimeout(() => transmission(kind, chars), wait * 1000);
    radioFree = now + wait + (kind === 'dispatch' ? 3.4 : 2.6);
  }

  /* -------------------------------------------- listen to what the page shows */
  function watch() {
    const story = document.getElementById('story');
    if (!story || !window.MutationObserver) return;
    new MutationObserver((muts) => {
      let ok = false, fail = false, promo = false, obs = false, scene = false;
      const tx = [];
      muts.forEach((m) =>
        m.addedNodes.forEach((n) => {
          if (n.nodeType !== 1) return;
          if (n.classList.contains('block')) {
            scene = true;
            n.querySelectorAll('.radio, .dispatch').forEach((r) => tx.push({ kind: r.classList.contains('dispatch') ? 'dispatch' : 'radio', chars: r.textContent.length }));
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
      tx.slice(0, 2).forEach((r, i) => setTimeout(() => radio(r.kind, r.chars), 250 + i * 10));
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

  const CH = { amb: 'Ambience', fx: 'Effects', radio: 'Radio' };
  G.audio = {
    on: () => enabled,
    toggle: () => {
      enabled = !enabled;
      writePrefs((p) => (p.sound = enabled));
      if (enabled) {
        start();
        if (ctx) ctx.resume();
        if (master) master.gain.setTargetAtTime(0.55, ctx.currentTime, 0.3);
      } else if (ctx && master) master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      return enabled;
    },
    vol: (ch) => vols[ch],
    setVol: (ch, v) => {
      if (!(ch in CH)) return;
      vols[ch] = Math.max(0, Math.min(1, v));
      writePrefs((p) => (p.vol = Object.assign({}, p.vol || {}, { [ch]: vols[ch] })));
      if (ctx && bus[ch]) bus[ch].gain.setTargetAtTime(vols[ch], ctx.currentTime, 0.15);
    },
    /* a sample of a channel, for the menu */
    test: (ch) => {
      kick();
      if (!ctx) return;
      if (ch === 'radio') radio(Math.random() < 0.5 ? 'radio' : 'dispatch', 70);
      if (ch === 'fx') cue('ok');
    },
    /* render one transmission offline (for checking levels and listening outside the game) */
    renderRadio: (kind, chars) => {
      const saved = { ctx, master, bus, noiseBuf, enabled, vols: Object.assign({}, vols) };
      const off = new OfflineAudioContext(1, 44100 * 5, 44100);
      ctx = off;
      enabled = true;
      vols.radio = 1;
      master = off.createGain();
      master.gain.value = 0.55;
      master.connect(off.destination);
      bus = { radio: off.createGain(), fx: off.createGain(), amb: off.createGain() };
      Object.values(bus).forEach((b) => b.connect(master));
      noiseBuf = off.createBuffer(1, off.sampleRate * 2, off.sampleRate);
      const nd = noiseBuf.getChannelData(0);
      for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      transmission(kind, chars);
      ({ ctx, master, bus, noiseBuf, enabled } = saved);
      Object.assign(vols, saved.vols);
      return off.startRendering().then((b) => Array.from(b.getChannelData(0)));
    },
    /* rows for the Menu: one slider per channel */
    menuHtml: () =>
      Object.keys(CH)
        .map(
          (k) => `<div class="menu textsize vol"><span>${CH[k]}</span><input type="range" min="0" max="100" step="5" value="${Math.round(vols[k] * 100)}" data-vol="${k}" aria-label="${CH[k]} volume"><b class="vol-v">${vols[k] > 0 ? Math.round(vols[k] * 100) + '%' : 'Off'}</b>${k === 'amb' ? '<i></i>' : `<button data-a="sndtest" data-ch="${k}" aria-label="Test ${CH[k]}">▶</button>`}</div>`
        )
        .join(''),
  };
})();
