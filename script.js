/* =========================================================
   For Falak. Behaviour only: all words live in content.js.
   Sections: helpers, engine (stars + particles), sound,
   scenes (memories, cake, letter, finale), navigation, start
   ========================================================= */
(() => {
  'use strict';

  const D = window.CONTENT;
  if (!D) return;

  /* ---------- Helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  /* ---------- Fill the page with the words from content.js ---------- */
  const get = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  $$('[data-c]').forEach(n => {
    const v = get(D, n.dataset.c);
    if (typeof v === 'string') n.textContent = v;
  });
  $('#sealLetter').textContent = (D.name || 'F').charAt(0);

  // Split a line into letters so they can appear one by one
  $$('[data-split]').forEach(n => {
    const txt = n.textContent.trim();
    n.setAttribute('aria-label', txt);
    n.textContent = '';
    Array.from(txt).forEach((c, i) => {
      const s = el('span', c === ' ' ? 'sp' : 'ch', c === ' ' ? '' : c);
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', i);
      n.appendChild(s);
    });
  });

  /* =========================================================
     Engine: night sky, warp, shooting stars, dust, petals, confetti
     ========================================================= */
  const Engine = (() => {
    const sky = $('#sky'), sc = sky.getContext('2d');
    const fxc = $('#fx'), fc = fxc.getContext('2d');
    const small = Math.min(window.innerWidth, window.innerHeight) < 520;
    const MAXCONF = small ? 170 : 300;
    const COLORS = ['#f3c4ce', '#e39aae', '#e6c992', '#faf1e8', '#ffd79a', '#b9a7ee'];

    let W = 0, H = 0, DPR = 1, lastW = 0;
    let stars = [], shoots = [], amb = [], conf = [], sparks = [];
    let level = 0, levelT = 0.95, ambOn = false, ambLevel = 0;
    let warpS = null, warpStars = [], raf = 0, last = 0;

    function makeStars() {
      const n = Math.min(260, Math.round((W * H) / 8500));
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.3 + Math.random() * 1.1,
        p: Math.random() * 6.283,
        s: 0.4 + Math.random() * 1.3,
        z: Math.random()
      }));
    }

    function makeAmbient() {
      amb = [];
      const dust = small ? 26 : 46, petals = small ? 5 : 10;
      for (let i = 0; i < dust; i++) {
        amb.push({ k: 'd', x: rand(0, W), y: rand(0, H), vx: rand(-0.12, 0.12), vy: -rand(0.08, 0.28), r: rand(0.6, 1.9), p: rand(0, 6.28), s: rand(0.6, 1.6), col: Math.random() < 0.7 ? '#ffe3ad' : '#f3c4ce' });
      }
      for (let i = 0; i < petals; i++) {
        amb.push({ k: 'p', x: rand(0, W), y: rand(-H, H), vx: rand(0.1, 0.3), vy: rand(0.25, 0.6), w: rand(7, 14), h: rand(4, 8), rot: rand(0, 6.28), vr: rand(-0.03, 0.03), p: rand(0, 6.28), col: Math.random() < 0.6 ? '#f3c4ce' : '#e39aae' });
      }
    }

    function size() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      for (const c of [sky, fxc]) {
        c.width = Math.round(W * DPR);
        c.height = Math.round(H * DPR);
      }
      sc.setTransform(DPR, 0, 0, DPR, 0, 0);
      fc.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (W !== lastW || !stars.length) {
        lastW = W;
        makeStars();
        makeAmbient();
      }
      if (reduce) drawStatic();
    }

    function drawStatic() {
      level = levelT;
      sc.clearRect(0, 0, W, H);
      sc.fillStyle = '#fff';
      for (const s of stars) {
        sc.globalAlpha = (0.2 + 0.7 * s.z) * 0.85;
        sc.beginPath();
        sc.arc(s.x, s.y, s.r, 0, 6.283);
        sc.fill();
      }
      sc.globalAlpha = 1;
    }

    function drawSky(t, dt) {
      sc.clearRect(0, 0, W, H);
      level += (levelT - level) * Math.min(1, 0.025 * dt);

      if (warpS) {
        const p = clamp((t - warpS.t0) / warpS.dur, 0, 1);
        const cx = W / 2, cy = H * 0.46;
        const e1 = Math.pow(p, 2.1) * 10;
        const e0 = Math.pow(Math.max(0, p - 0.08), 2.1) * 10;
        // the old sky fades away while a rushing field of stars streams past
        const old = 1 - Math.min(1, p * 4);
        if (old > 0) {
          sc.fillStyle = '#fff';
          for (const s of stars) {
            sc.globalAlpha = (0.2 + 0.8 * s.z) * level * old;
            sc.beginPath();
            sc.arc(s.x, s.y, s.r, 0, 6.283);
            sc.fill();
          }
        }
        sc.strokeStyle = '#fff6e0';
        sc.lineCap = 'round';
        const fadeIn = Math.min(1, p * 5);
        for (const w of warpStars) {
          const ca = Math.cos(w.a), sa = Math.sin(w.a);
          const r1 = w.d * (1 + e1), r0 = w.d * (1 + e0);
          const x1 = cx + ca * r1, y1 = cy + sa * r1;
          const x0 = cx + ca * r0, y0 = cy + sa * r0;
          if ((x1 < -40 || x1 > W + 40 || y1 < -40 || y1 > H + 40) && (x0 < -40 || x0 > W + 40 || y0 < -40 || y0 > H + 40)) continue;
          sc.globalAlpha = Math.min(1, (0.35 + 0.65 * w.z) * (0.4 + 0.6 * p)) * fadeIn;
          sc.lineWidth = w.r * (0.8 + p * 2);
          sc.beginPath();
          sc.moveTo(x0, y0);
          sc.lineTo(x1, y1);
          sc.stroke();
        }
        if (!warpS.fired && p > 0.68) {
          warpS.fired = true;
          if (warpS.cb) warpS.cb();
        }
        if (p >= 1) {
          const done = warpS.resolve;
          warpS = null;
          level = 0; // the next sky fades in softly
          done();
        }
      } else {
        sc.fillStyle = '#fff';
        for (const s of stars) {
          const tw = 0.55 + 0.45 * Math.sin(t * 0.001 * s.s + s.p);
          sc.globalAlpha = (0.2 + 0.8 * s.z) * tw * level;
          sc.beginPath();
          sc.arc(s.x, s.y, s.r, 0, 6.283);
          sc.fill();
        }
      }

      for (let i = shoots.length - 1; i >= 0; i--) {
        const o = shoots[i];
        o.x += o.vx * dt;
        o.y += o.vy * dt;
        o.life -= dt;
        const a = clamp(o.life / o.max, 0, 1);
        const sp = Math.hypot(o.vx, o.vy);
        const tx = o.x - (o.vx / sp) * o.len, ty = o.y - (o.vy / sp) * o.len;
        const g = sc.createLinearGradient(o.x, o.y, tx, ty);
        g.addColorStop(0, 'rgba(255,240,208,' + 0.95 * a + ')');
        g.addColorStop(1, 'rgba(255,240,208,0)');
        sc.globalAlpha = 1;
        sc.strokeStyle = g;
        sc.lineWidth = 1.6;
        sc.lineCap = 'round';
        sc.beginPath();
        sc.moveTo(o.x, o.y);
        sc.lineTo(tx, ty);
        sc.stroke();
        if (o.life <= 0) shoots.splice(i, 1);
      }
      sc.globalAlpha = 1;
    }

    function drawFx(t, dt) {
      fc.clearRect(0, 0, W, H);
      ambLevel += ((ambOn ? 1 : 0) - ambLevel) * Math.min(1, 0.03 * dt);

      if (ambLevel > 0.01) {
        for (const a of amb) {
          if (a.k === 'd') {
            a.x += a.vx * dt;
            a.y += a.vy * dt;
            a.p += 0.02 * dt;
            if (a.y < -6) { a.y = H + 6; a.x = rand(0, W); }
            if (a.x < -6) a.x = W + 6;
            if (a.x > W + 6) a.x = -6;
            const tw = 0.5 + 0.5 * Math.sin(a.p * a.s * 3);
            fc.globalAlpha = ambLevel * (0.22 + 0.6 * tw);
            fc.fillStyle = a.col;
            fc.beginPath();
            fc.arc(a.x, a.y, a.r, 0, 6.283);
            fc.fill();
          } else {
            a.p += 0.02 * dt;
            a.rot += a.vr * dt;
            a.y += a.vy * dt;
            a.x += (a.vx + Math.sin(a.p) * 0.35) * dt;
            if (a.y > H + 20) { a.y = -20; a.x = rand(-20, W); }
            if (a.x > W + 20) a.x = -20;
            fc.globalAlpha = ambLevel * 0.55;
            fc.fillStyle = a.col;
            fc.save();
            fc.translate(a.x, a.y);
            fc.rotate(a.rot);
            fc.beginPath();
            fc.ellipse(0, 0, a.w / 2, (a.h / 2) * (0.6 + 0.4 * Math.abs(Math.sin(a.p * 1.4))), 0, 0, 6.283);
            fc.fill();
            fc.restore();
          }
        }
      }

      for (let i = conf.length - 1; i >= 0; i--) {
        const c = conf[i];
        c.vx *= 0.985;
        c.vy = c.vy * 0.985 + c.g * dt;
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.rot += c.vr * dt;
        c.p += 0.2 * dt;
        c.life -= dt;
        if (c.life <= 0 || c.y > H + 30) { conf.splice(i, 1); continue; }
        fc.globalAlpha = Math.min(1, c.life / 40);
        fc.fillStyle = c.col;
        fc.save();
        fc.translate(c.x, c.y);
        fc.rotate(c.rot);
        if (c.shape === 'c') {
          fc.beginPath();
          fc.arc(0, 0, c.w * 0.42, 0, 6.283);
          fc.fill();
        } else {
          fc.fillRect(-c.w / 2, (-c.h / 2) * Math.cos(c.p), c.w, c.h * Math.cos(c.p));
        }
        fc.restore();
      }

      fc.strokeStyle = '#fff3d6';
      fc.lineWidth = 1;
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.vx *= 0.975;
        p.vy = p.vy * 0.975 + 0.03 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) { sparks.splice(i, 1); continue; }
        fc.globalAlpha = clamp(p.life / p.max, 0, 1);
        fc.fillStyle = p.col;
        fc.beginPath();
        fc.moveTo(p.x - p.r * 1.8, p.y);
        fc.lineTo(p.x + p.r * 1.8, p.y);
        fc.moveTo(p.x, p.y - p.r * 1.8);
        fc.lineTo(p.x, p.y + p.r * 1.8);
        fc.stroke();
        fc.beginPath();
        fc.arc(p.x, p.y, p.r * 0.55, 0, 6.283);
        fc.fill();
      }
      fc.globalAlpha = 1;
    }

    function loop(t) {
      const dt = clamp((t - last) / 16.67, 0, 3);
      last = t;
      drawSky(t, dt);
      drawFx(t, dt);
      raf = requestAnimationFrame(loop);
    }
    function start() {
      if (reduce || raf) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
    function stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    }

    function shoot() {
      if (reduce || !W) return;
      const a = Math.PI * rand(0.73, 0.84);
      const v = rand(9, 13);
      shoots.push({ x: W * rand(0.3, 1), y: rand(0, H * 0.45), vx: Math.cos(a) * v, vy: Math.sin(a) * v, len: rand(90, 170), life: 55, max: 55 });
    }
    (function schedule() {
      setTimeout(() => { if (!document.hidden && ambOn) shoot(); schedule(); }, rand(5500, 11000));
    })();

    function warp(ms, cb) {
      return new Promise(resolve => {
        if (reduce) {
          if (cb) cb();
          resolve();
          return;
        }
        const R = Math.hypot(W, H) / 2;
        warpStars = Array.from({ length: small ? 150 : 260 }, () => ({
          a: rand(0, 6.283),
          d: 8 + R * 0.5 * Math.pow(Math.random(), 1.6),
          z: Math.random(),
          r: rand(0.5, 1.4)
        }));
        warpS = { t0: performance.now(), dur: ms, cb, fired: false, resolve };
      });
    }

    function confetti(x, y, n, o = {}) {
      if (reduce) return;
      const spread = o.spread == null ? Math.PI * 2 : o.spread;
      const angle = o.angle == null ? -Math.PI / 2 : o.angle;
      const power = o.power || 11;
      n = Math.min(n, MAXCONF - conf.length);
      for (let i = 0; i < n; i++) {
        const a = angle + (Math.random() - 0.5) * spread;
        const v = power * (0.4 + Math.random() * 0.7);
        conf.push({
          x, y,
          vx: Math.cos(a) * v, vy: Math.sin(a) * v,
          w: rand(5, 10), h: rand(8, 15),
          rot: rand(0, 6.28), vr: rand(-0.3, 0.3), p: rand(0, 6.28),
          col: pick(COLORS), shape: Math.random() < 0.25 ? 'c' : 'r',
          g: 0.2 + Math.random() * 0.08, life: rand(140, 230)
        });
      }
    }

    function sparkBurst(x, y, n) {
      if (reduce) return;
      for (let i = 0; i < n; i++) {
        const a = rand(0, 6.283), v = rand(1.2, 6.5), life = rand(60, 120);
        sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.8, r: rand(1, 2.8), life, max: life, col: pick(['#fff3d6', '#e6c992', '#f3c4ce']) });
      }
    }

    function celebrate(x, y) {
      if (reduce) return;
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          confetti(x, y, small ? 26 : 40, { spread: Math.PI * 1.1, power: 13 });
          confetti(W * 0.04, H * 0.86, small ? 14 : 22, { angle: -Math.PI * 0.32, spread: 0.7, power: 15 });
          confetti(W * 0.96, H * 0.86, small ? 14 : 22, { angle: -Math.PI * 0.68, spread: 0.7, power: 15 });
        }, i * 360);
      }
    }

    size();
    window.addEventListener('resize', () => { clearTimeout(size.t); size.t = setTimeout(size, 120); });
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    start();

    return {
      warp, shoot, celebrate, sparkBurst,
      ambient: on => { ambOn = !!on; },
      sky: v => { levelT = v; }
    };
  })();

  /* =========================================================
     Sound: your music.mp3 if it exists, otherwise a soft
     generated melody. Nothing plays until the first tap.
     ========================================================= */
  const Sound = (() => {
    const btn = $('#sound');
    let ctx = null, master = null, started = false, muted = false;
    let audioEl = null, genOn = false, nbuf = null;

    function ui() {
      const on = started && !muted;
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', on ? 'Mute music' : 'Turn music on');
    }

    function ensure() {
      if (ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      try {
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0;
        master.connect(ctx.destination);
        return true;
      } catch (e) {
        ctx = null;
        return false;
      }
    }

    function applyMute() {
      if (master) master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.12);
      if (audioEl) audioEl.muted = muted;
    }

    function fadeEl(to) {
      if (!audioEl) return;
      const el0 = audioEl;
      let i = 0;
      const from = el0.volume;
      const t = setInterval(() => {
        i++;
        el0.volume = clamp(from + ((to - from) * i) / 25, 0, 1);
        if (i >= 25) clearInterval(t);
      }, 100);
    }

    function generative() {
      if (genOn || !ctx) return;
      genOn = true;
      const t0 = ctx.currentTime;
      const out = ctx.createGain();
      out.gain.setValueAtTime(0, t0);
      out.gain.linearRampToValueAtTime(0.9, t0 + 4);
      out.connect(master);

      const dly = ctx.createDelay(1);
      dly.delayTime.value = 0.38;
      const fb = ctx.createGain();
      fb.gain.value = 0.38;
      dly.connect(fb);
      fb.connect(dly);
      const wet = ctx.createGain();
      wet.gain.value = 0.55;
      dly.connect(wet);
      wet.connect(out);

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 900;
      lp.Q.value = 0.4;
      lp.connect(out);
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07;
      const lg = ctx.createGain();
      lg.gain.value = 320;
      lfo.connect(lg);
      lg.connect(lp.frequency);
      lfo.start();

      const chords = [
        [146.83, 220, 293.66, 369.99],
        [123.47, 185, 246.94, 369.99],
        [98, 196, 246.94, 293.66],
        [110, 164.81, 220, 277.18]
      ];
      const voices = [0, 1, 2, 3].map(i => {
        const o = ctx.createOscillator();
        o.type = i % 2 ? 'triangle' : 'sine';
        o.detune.value = (i - 1.5) * 5;
        const g = ctx.createGain();
        g.gain.value = 0.05;
        o.connect(g);
        g.connect(lp);
        o.start();
        return o;
      });
      let ci = 0;
      const setChord = () => {
        chords[ci].forEach((f, i) => voices[i].frequency.setTargetAtTime(f, ctx.currentTime, 1.6));
        ci = (ci + 1) % chords.length;
      };
      setChord();
      setInterval(setChord, 8000);

      const scale = [587.33, 659.25, 739.99, 880, 987.77, 1174.66];
      const bell = () => {
        if (!document.hidden) {
          const t = ctx.currentTime;
          const o = ctx.createOscillator();
          o.type = 'sine';
          o.frequency.value = pick(scale);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.07, t + 0.012);
          g.gain.exponentialRampToValueAtTime(0.0008, t + 2.4);
          o.connect(g);
          g.connect(dly);
          g.connect(out);
          o.start(t);
          o.stop(t + 2.6);
        }
        setTimeout(bell, rand(1500, 4000));
      };
      setTimeout(bell, 1200);
    }

    // Called from a tap, so the browser allows audio to begin.
    function start() {
      if (started) return;
      started = true;
      if (ensure()) {
        if (ctx.resume) ctx.resume();
        master.gain.setValueAtTime(0, ctx.currentTime);
        master.gain.linearRampToValueAtTime(muted ? 0 : 1, ctx.currentTime + 0.4);
      }
      const file = D.music && D.music.file;
      if (file) {
        try {
          audioEl = new Audio(file);
          audioEl.loop = true;
          audioEl.volume = 0;
          const fail = () => { audioEl = null; generative(); };
          const p = audioEl.play();
          if (p && p.then) p.then(() => fadeEl(0.7)).catch(fail);
          audioEl.addEventListener('error', fail, { once: true });
        } catch (e) {
          generative();
        }
      } else {
        generative();
      }
      ui();
    }

    function toggle() {
      if (!started) { start(); return; }
      muted = !muted;
      applyMute();
      ui();
    }
    btn.addEventListener('click', toggle);

    document.addEventListener('visibilitychange', () => {
      if (!ctx || !started) return;
      if (document.hidden) ctx.suspend && ctx.suspend();
      else ctx.resume && ctx.resume();
    });

    /* ---- small sound effects ---- */
    const ok = () => ctx && started && !muted;
    function noise() {
      if (!nbuf) {
        nbuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const d = nbuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      const s = ctx.createBufferSource();
      s.buffer = nbuf;
      return s;
    }
    function tone(freq, t, dur, vol, type) {
      const o = ctx.createOscillator();
      o.type = type || 'sine';
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      o.connect(g);
      g.connect(master);
      o.start(t);
      o.stop(t + dur + 0.05);
    }
    return {
      start,
      chime() {
        if (!ensure()) return;
        const t = ctx.currentTime + 0.02;
        tone(880, t, 1.6, 0.12);
        tone(1318.5, t + 0.14, 1.8, 0.09);
      },
      whoosh() {
        if (!ok()) return;
        const t = ctx.currentTime;
        const n = noise();
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass';
        f.Q.value = 0.8;
        f.frequency.setValueAtTime(260, t);
        f.frequency.exponentialRampToValueAtTime(3200, t + 2.1);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.32, t + 1.7);
        g.gain.linearRampToValueAtTime(0, t + 2.5);
        n.connect(f);
        f.connect(g);
        g.connect(master);
        n.start(t);
        n.stop(t + 2.6);
      },
      puff() {
        if (!ok()) return;
        const t = ctx.currentTime;
        const n = noise();
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.value = 800;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.28, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
        n.connect(f);
        f.connect(g);
        g.connect(master);
        n.start(t);
        n.stop(t + 0.4);
      },
      pop() {
        if (!ok()) return;
        const t = ctx.currentTime;
        const n = noise();
        const f = ctx.createBiquadFilter();
        f.type = 'highpass';
        f.frequency.value = 1400;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.35, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
        n.connect(f);
        f.connect(g);
        g.connect(master);
        n.start(t);
        n.stop(t + 0.2);
        tone(190, t, 0.2, 0.2);
      },
      sparkle() {
        if (!ok()) return;
        const t = ctx.currentTime;
        for (let i = 0; i < 5; i++) tone(rand(1500, 3300), t + i * 0.09, 0.7, 0.05);
      }
    };
  })();

  /* =========================================================
     Scene: memories (swipe, flip, previous / next)
     ========================================================= */
  const Memories = (() => {
    const deck = $('#deck'), prevB = $('#mPrev'), nextB = $('#mNext');
    const count = $('#mCount'), done = $('#mDone');
    let cards = [], cur = 0, n = 0, drag = null;
    const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1c.7 6 2.700 8.300 9 11-6.300 2.700-8.300 5-9 11-.7-6-2.700-8.300-9-11 6.300-2.700 8.300-5 9-11z"/></svg>';

    function build() {
      deck.innerHTML = '';
      done.classList.add('is-hidden');
      const list = (D.memories && D.memories.cards) || [];
      n = list.length;
      cur = 0;
      cards = list.map((m, i) => {
        const card = el('article', 'mcard');
        card.style.setProperty('--rot', (i % 2 ? 1 : -1) * rand(0.6, 2.2) + 'deg');
        card.setAttribute('aria-label', m.title || 'Memory');
        const flip = el('div', 'mflip');

        const front = el('div', 'mface front');
        const photo = el('div', 'photo');
        const ph = el('div', 'ph');
        ph.style.setProperty('--h', (i * 47 + 320) % 360);
        ph.innerHTML = STAR;
        ph.appendChild(el('span', '', 'Your photo here'));
        photo.appendChild(ph);
        if (m.photo) {
          const img = new Image();
          img.alt = '';
          img.decoding = 'async';
          img.onload = () => img.classList.add('ok');
          img.onerror = () => img.remove();
          img.src = (D.photoFolder || '') + m.photo;
          photo.appendChild(img);
        }
        const cap = el('div', 'cap');
        cap.append(el('span', 'place', m.place || ''), el('h3', '', m.title || ''), el('span', 'tap', 'Tap to read'));
        front.append(photo, cap);

        const back = el('div', 'mface back');
        back.append(el('span', 'place', m.place || ''), el('h3', '', m.title || ''), el('span', 'rule'), el('p', 'text', m.text || ''));

        flip.append(front, back);
        card.appendChild(flip);
        deck.appendChild(card);
        return card;
      });
      layout();
    }

    function layout() {
      cards.forEach((c, i) => {
        c.classList.remove('gone-l', 'gone-r');
        if (i < cur) {
          c.removeAttribute('data-o');
          c.classList.add(c.dataset.dir === 'r' ? 'gone-r' : 'gone-l');
        } else {
          c.dataset.o = Math.min(i - cur, 3);
        }
      });
      count.textContent = n ? (cur + 1) + ' / ' + n : '';
      prevB.setAttribute('aria-disabled', String(cur === 0));
      nextB.setAttribute('aria-disabled', String(cur >= n - 1));
      if (n && cur >= n - 1) done.classList.remove('is-hidden');
    }

    function next(dir) {
      if (cur >= n - 1) return;
      const c = cards[cur];
      c.dataset.dir = dir || 'l';
      setTimeout(() => c.classList.remove('flipped'), 700);
      cur++;
      layout();
    }
    function prev() {
      if (cur <= 0) return;
      cur--;
      cards[cur].classList.remove('flipped');
      layout();
    }
    function flipTop() {
      if (cards[cur]) cards[cur].classList.toggle('flipped');
    }

    deck.addEventListener('pointerdown', e => {
      const c = e.target.closest('.mcard');
      if (!c || c.dataset.o !== '0') return;
      drag = { c, x: e.clientX, y: e.clientY, dx: 0, moved: false, id: e.pointerId };
      try { c.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      c.style.transition = 'none';
    });
    deck.addEventListener('pointermove', e => {
      if (!drag) return;
      drag.dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (Math.abs(drag.dx) > 6 || Math.abs(dy) > 6) drag.moved = true;
      drag.c.style.transform = 'translate(' + drag.dx + 'px,' + dy * 0.15 + 'px) rotate(' + drag.dx * 0.06 + 'deg)';
    });
    const end = () => {
      if (!drag) return;
      const { c, dx, moved } = drag;
      drag = null;
      c.style.transition = '';
      c.style.transform = '';
      if (!moved) { flipTop(); return; }
      if (Math.abs(dx) > 80) next(dx < 0 ? 'l' : 'r');
    };
    deck.addEventListener('pointerup', end);
    deck.addEventListener('pointercancel', end);
    deck.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next('l'); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flipTop(); }
    });
    nextB.addEventListener('click', () => next('l'));
    prevB.addEventListener('click', prev);

    return { build };
  })();

  /* =========================================================
     Scene: cake (tap every candle to blow it out)
     ========================================================= */
  const Cake = (() => {
    const host = $('#cake'), wrap = $('#cakeWrap'), hint = $('#cakeHint');
    const done = $('#cakeDone'), next = $('#cakeNext');
    let lit = 0, total = 0, timers = [];

    function scallop(x0, x1, y, r) {
      const k = Math.round((x1 - x0) / (2 * r));
      const rr = (x1 - x0) / (2 * k);
      let d = 'M' + x0 + ' ' + y + ' H' + x1 + ' V' + (y + 8);
      for (let i = 0; i < k; i++) d += ' A' + rr + ' ' + rr + ' 0 0 1 ' + (x1 - 2 * rr * (i + 1)) + ' ' + (y + 8);
      return d + ' Z';
    }

    function svg(N, initial) {
      let pearls = '';
      for (let x = 66; x <= 294; x += 19) pearls += '<circle cx="' + x + '" cy="274" r="4.2" fill="url(#gGold)"/>';
      let candles = '';
      for (let i = 0; i < N; i++) {
        const x = N === 1 ? 180 : 118 + i * (124 / (N - 1));
        const fd = (i * 0.37 % 1).toFixed(2);
        candles +=
          '<g class="candle" role="button" tabindex="0" aria-label="Candle ' + (i + 1) + ' of ' + N + '. Tap to blow it out.">' +
            '<rect class="hit" x="' + (x - 17) + '" y="44" width="34" height="94" rx="10"/>' +
            '<rect x="' + (x - 4.5) + '" y="88" width="9" height="46" rx="2" fill="#fbe9d7"/>' +
            '<rect x="' + (x - 4.5) + '" y="88" width="9" height="46" rx="2" fill="url(#gStripe)"/>' +
            '<line x1="' + x + '" y1="88" x2="' + x + '" y2="82.5" stroke="#5a3a2a" stroke-width="1.4" stroke-linecap="round"/>' +
            '<g transform="translate(' + x + ' 83)">' +
              '<circle class="fglow" cx="0" cy="-13" r="30" fill="url(#gGlow)"/>' +
              '<path class="smoke" d="M0 0C-5 -8 5 -14 0 -22C-4 -30 4 -34 0 -42" fill="none" stroke="rgba(250,241,232,.75)" stroke-width="2" stroke-linecap="round"/>' +
              '<g class="flame" style="--fd:-' + fd + 's">' +
                '<path d="M0 0C-7 -5 -7.5 -14 0 -25C7.5 -14 7 -5 0 0Z" fill="url(#gFlame)"/>' +
                '<path d="M0 -1C-3 -3.500 -3.200 -8 0 -13C3.200 -8 3 -3.500 0 -1Z" fill="#fff7da"/>' +
              '</g>' +
            '</g>' +
          '</g>';
      }
      return '<svg viewBox="0 20 360 300" role="group" aria-label="Birthday cake with ' + N + ' candles">' +
        '<defs>' +
          '<linearGradient id="gGold" x1="0" x2="1"><stop offset="0" stop-color="#b8924f"/><stop offset=".5" stop-color="#f6e3bd"/><stop offset="1" stop-color="#b8924f"/></linearGradient>' +
          '<linearGradient id="gBottom" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2adbd"/><stop offset="1" stop-color="#d68aa2"/></linearGradient>' +
          '<linearGradient id="gMid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdeee6"/><stop offset="1" stop-color="#f4cdd2"/></linearGradient>' +
          '<linearGradient id="gFlame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff9d4d"/><stop offset=".55" stop-color="#ffcf6b"/><stop offset="1" stop-color="#fff0b8"/></linearGradient>' +
          '<radialGradient id="gGlow"><stop offset="0" stop-color="#ffd79a" stop-opacity=".8"/><stop offset="1" stop-color="#ffd79a" stop-opacity="0"/></radialGradient>' +
          '<pattern id="gStripe" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="4.5" height="9" fill="#e39aae" opacity=".6"/></pattern>' +
        '</defs>' +
        '<ellipse cx="180" cy="302" rx="140" ry="9" fill="rgba(0,0,0,.35)"/>' +
        '<ellipse cx="180" cy="293" rx="160" ry="17" fill="url(#gGold)"/>' +
        '<ellipse cx="180" cy="289" rx="152" ry="12" fill="#f7ead2"/>' +
        '<rect x="48" y="196" width="264" height="92" rx="20" fill="url(#gBottom)"/>' +
        '<path d="' + scallop(48, 312, 196, 13.2) + '" fill="#fdf3ed"/>' +
        pearls +
        '<rect x="82" y="132" width="196" height="68" rx="16" fill="url(#gMid)"/>' +
        '<path d="' + scallop(82, 278, 132, 14) + '" fill="#fffaf5"/>' +
        '<rect x="82" y="188" width="196" height="7" fill="url(#gGold)"/>' +
        '<text x="180" y="252" text-anchor="middle" font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="46" fill="#fff6e4">' + initial + '</text>' +
        '<path transform="translate(116 238)" d="M0 -7C.6 -2 2 -.6 7 0 2 .6 .6 2 0 7-.6 2-2 .6-7 0-2-.6-.6-2 0-7Z" fill="#fff0cf"/>' +
        '<path transform="translate(244 238)" d="M0 -7C.6 -2 2 -.6 7 0 2 .6 .6 2 0 7-.6 2-2 .6-7 0-2-.6-.6-2 0-7Z" fill="#fff0cf"/>' +
        candles +
      '</svg>';
    }

    function build() {
      timers.forEach(clearTimeout);
      timers = [];
      const N = clamp(parseInt(D.cake && D.cake.candles, 10) || 5, 1, 9);
      total = lit = N;
      host.innerHTML = svg(N, (D.name || 'F').charAt(0));
      wrap.style.setProperty('--lit', '1');
      hint.textContent = D.cake.hint;
      hint.style.visibility = '';
      done.classList.remove('show');
      next.classList.add('is-hidden');
      $$('.candle', host).forEach(c => {
        const go = () => blow(c);
        c.addEventListener('click', go);
        c.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
        });
      });
    }

    function blow(c) {
      if (c.classList.contains('out')) return;
      c.classList.add('out');
      c.setAttribute('aria-label', 'Candle blown out');
      c.setAttribute('tabindex', '-1');
      lit--;
      wrap.style.setProperty('--lit', (lit / total).toFixed(2));
      Sound.puff();
      if (lit > 0) {
        hint.textContent = (D.cake.progress || '{n} more to go…').replace('{n}', lit);
      } else {
        finish();
      }
    }

    function finish() {
      hint.style.visibility = 'hidden';
      timers.push(setTimeout(() => {
        const r = wrap.getBoundingClientRect();
        Engine.celebrate(r.left + r.width / 2, r.top + r.height * 0.3);
        Sound.pop();
        Sound.sparkle();
        done.classList.add('show');
        timers.push(setTimeout(() => next.classList.remove('is-hidden'), reduce ? 0 : 1900));
      }, reduce ? 0 : 700));
    }

    return { build };
  })();

  /* =========================================================
     Scene: letter (seal, envelope, typewriter)
     ========================================================= */
  const Letter = (() => {
    const env = $('#env'), seal = $('#seal'), hint = $('#sealHint');
    const paper = $('#paper'), body = $('#paperBody'), sign = $('#paperSign');
    const skipH = $('#skipHint'), next = $('#letterNext');
    let run = 0, opened = false, finished = false;

    function reset() {
      run++;
      opened = false;
      finished = false;
      env.classList.remove('open', 'gone');
      env.hidden = false;
      hint.hidden = false;
      hint.style.opacity = '';
      paper.hidden = true;
      paper.classList.remove('appear');
      body.innerHTML = '';
      sign.classList.remove('show');
      skipH.classList.add('is-hidden');
      next.classList.add('is-hidden');
    }

    function renderAll() {
      body.innerHTML = '';
      (D.letter.paragraphs || []).forEach(t => body.appendChild(el('p', '', t)));
    }

    function finish() {
      finished = true;
      skipH.classList.add('is-hidden');
      sign.classList.add('show');
      setTimeout(() => next.classList.remove('is-hidden'), reduce ? 0 : 1300);
    }

    async function open() {
      if (opened) return;
      opened = true;
      const my = ++run;
      Sound.chime();
      hint.style.opacity = '0';
      env.classList.add('open');
      await wait(reduce ? 0 : 1900);
      if (my !== run) return;
      env.classList.add('gone');
      await wait(reduce ? 0 : 800);
      if (my !== run) return;
      env.hidden = true;
      hint.hidden = true;
      paper.hidden = false;
      paper.classList.add('appear');
      skipH.classList.remove('is-hidden');
      await wait(reduce ? 0 : 900);
      if (my !== run) return;
      await type(my);
    }

    async function type(my) {
      if (reduce) { renderAll(); finish(); return; }
      body.innerHTML = '';
      const caret = el('span', 'caret');
      for (const text of D.letter.paragraphs || []) {
        const p = el('p');
        const tn = document.createTextNode('');
        p.append(tn, caret);
        body.appendChild(p);
        for (let i = 0; i < text.length; i++) {
          if (my !== run) return;
          const ch = text[i];
          tn.data += ch;
          paper.scrollTop = paper.scrollHeight;
          let d = rand(18, 34);
          if ('.!?'.includes(ch)) d += 260;
          else if (',;:—'.includes(ch)) d += 110;
          await wait(d);
        }
        await wait(380);
      }
      if (my !== run) return;
      setTimeout(() => caret.remove(), 1500);
      finish();
    }

    // Tap the letter to show everything at once
    paper.addEventListener('click', () => {
      if (!opened || finished || paper.hidden) return;
      run++;
      renderAll();
      paper.scrollTop = 0;
      finish();
    });
    seal.addEventListener('click', open);

    return { reset };
  })();

  /* =========================================================
     Scene: finale (touch the star, hidden message, replay)
     ========================================================= */
  const Finale = (() => {
    const star = $('#wishStar'), prompt = $('#starPrompt');
    const secret = $('#secret'), replayB = $('#replay');
    let used = false, run = 0;

    function reset() {
      run++;
      used = false;
      star.hidden = false;
      prompt.hidden = false;
      star.classList.remove('used');
      prompt.classList.remove('used');
      secret.innerHTML = '';
      replayB.classList.add('is-hidden');
    }

    async function touch() {
      if (used) return;
      used = true;
      const my = run;
      star.classList.add('used');
      prompt.classList.add('used');
      const r = star.getBoundingClientRect();
      Engine.sparkBurst(r.left + r.width / 2, r.top + r.height / 2, 110);
      Sound.sparkle();
      for (let i = 0; i < 6; i++) setTimeout(Engine.shoot, i * 280);
      await wait(reduce ? 0 : 1200);
      if (my !== run) return;
      star.hidden = true;
      prompt.hidden = true;

      const f = D.finale;
      const items = [];
      (f.lines || []).forEach(t => items.push({ t, c: '' }));
      items.push({ t: f.big, c: 'big' });
      const days = D.nikkahDate ? Math.floor((Date.now() - new Date(D.nikkahDate + 'T00:00:00+05:00').getTime()) / 864e5) : 0;
      if (days > 0 && f.days) items.push({ t: f.days.replace('{days}', days).replace('{date}', D.nikkahLabel || ''), c: 'soft' });
      if (f.end) items.push({ t: f.end, c: 'end' });
      if (f.sign) items.push({ t: f.sign, c: 'sign' });

      for (const it of items) {
        if (my !== run) return;
        const line = el('p', 'sline ' + it.c, it.t);
        secret.appendChild(line);
        void line.offsetWidth;
        line.classList.add('show');
        if (it.c === 'big') {
          Engine.sparkBurst(window.innerWidth / 2, window.innerHeight * 0.45, 70);
          Sound.sparkle();
        }
        await wait(reduce ? 0 : it.c === 'big' ? 2600 : 1900);
      }
      if (my !== run) return;
      replayB.classList.remove('is-hidden');
    }

    star.addEventListener('click', touch);
    return { reset };
  })();

  /* =========================================================
     Navigation between scenes
     ========================================================= */
  const ORDER = ['intro', 'greeting', 'memories', 'cake', 'letter', 'finale'];
  const MOOD = { intro: 'night', greeting: 'dusk', memories: 'dusk', cake: 'night', letter: 'dusk', finale: 'night' };
  const AMBIENT = { intro: false, greeting: true, memories: true, cake: true, letter: true, finale: true };

  const dotsEl = $('#dots');
  ORDER.forEach(() => dotsEl.appendChild(el('li')));

  function buildIntro() {
    const box = $('#mystery');
    box.innerHTML = '';
    const lines = (D.intro && D.intro.lines) || [];
    lines.forEach((t, i) => {
      const p = el('p', 'mline', t);
      p.style.setProperty('--i', i);
      box.appendChild(p);
    });
    $('#s-intro').style.setProperty('--n', lines.length);
  }

  const ENTER = {
    intro() { buildIntro(); },
    greeting() { setTimeout(Sound.sparkle, reduce ? 0 : 2800); },
    memories() { Memories.build(); },
    cake() { Cake.build(); },
    letter() { Letter.reset(); },
    finale() { Finale.reset(); }
  };

  let current = null;
  function go(name) {
    const next = $('#s-' + name);
    if (!next || next === current) return;
    const prev = current;
    current = next;
    if (prev) {
      prev.classList.remove('is-active');
      setTimeout(() => {
        if (prev !== current) prev.classList.remove('in', 'departing');
      }, 1400);
    }
    if (ENTER[name]) ENTER[name]();
    next.scrollTop = 0;
    next.classList.add('in');
    void next.offsetWidth;
    next.classList.add('is-active');
    document.body.dataset.mood = MOOD[name];
    Engine.ambient(AMBIENT[name]);
    $$('#dots li').forEach((li, i) => li.classList.toggle('on', i === ORDER.indexOf(name)));
  }

  // Every "continue" button
  let lockNav = false;
  $$('[data-next]').forEach(b => b.addEventListener('click', () => {
    if (lockNav) return;
    lockNav = true;
    setTimeout(() => { lockNav = false; }, 1300);
    go(b.dataset.next);
  }));

  // Open Your Surprise: stars rush past, then the greeting appears
  let opening = false;
  const openBtn = $('#openBtn');
  openBtn.addEventListener('click', async () => {
    if (opening) return;
    opening = true;
    Sound.start();
    Sound.chime();
    $('#s-intro').classList.add('departing');
    if (reduce) { go('greeting'); return; }
    await wait(800);
    Sound.whoosh();
    await Engine.warp(2400, () => $('#flash').classList.add('on'));
    go('greeting');
    await wait(450);
    $('#flash').classList.remove('on');
  });
  openBtn.addEventListener('pointermove', e => {
    const r = openBtn.getBoundingClientRect();
    openBtn.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(0) + '%');
    openBtn.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(0) + '%');
  });

  // Replay from the beginning
  $('#replay').addEventListener('click', () => {
    opening = false;
    $('#flash').classList.remove('on');
    go('intro');
  });

  go('intro');
})();
