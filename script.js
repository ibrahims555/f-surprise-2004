(() => {
  'use strict';

  const C = Object.assign({
    nikkahDate: '2026-09-11',
    music: 'music.mp3',
    photoFolder: '',
    photoMax: 24,
    photoFiles: [],
    photoExts: ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG'],
    captions: {}
  }, window.CONFIG || {});

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const now = () => Date.now();

  /* ---------- Split text into letters ---------- */
  $$('[data-split]').forEach(el => {
    const txt = el.textContent.trim();
    el.setAttribute('aria-label', txt);
    el.textContent = '';
    Array.from(txt).forEach((c, i) => {
      const s = document.createElement('span');
      s.setAttribute('aria-hidden', 'true');
      if (c === ' ') {
        s.className = 'sp';
      } else {
        s.className = 'ch';
        s.textContent = c;
        s.style.setProperty('--i', i);
      }
      el.appendChild(s);
    });
  });

  /* ---------- Night sky ---------- */
  const canvas = $('#sky');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, lastW = 0, stars = [], shooters = [], sparks = [];
  let level = 0.5, targetLevel = 0.5, last = 0, raf = 0;

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (W !== lastW) {
      lastW = W;
      const n = Math.min(380, Math.round(W * H / 7000));
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.25 + Math.random() * 1.05,
        p: Math.random() * 6.283,
        s: 0.4 + Math.random() * 1.2,
        z: Math.random()
      }));
    }
    if (reduce) paint(0, 0);
  }

  function paint(t, dt) {
    level += (targetLevel - level) * Math.min(1, 0.03 * dt);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    const sy = window.scrollY || 0;

    for (const s of stars) {
      const tw = reduce ? 1 : 0.55 + 0.45 * Math.sin(t * 0.001 * s.s + s.p);
      let y = (s.y - sy * (0.015 + 0.05 * s.z)) % H;
      if (y < 0) y += H;
      ctx.globalAlpha = (0.22 + 0.78 * s.z) * tw * (reduce ? 0.8 : level);
      ctx.beginPath();
      ctx.arc(s.x, y, s.r, 0, 6.283);
      ctx.fill();
    }

    for (let i = shooters.length - 1; i >= 0; i--) {
      const o = shooters[i];
      o.x += o.vx * dt;
      o.y += o.vy * dt;
      o.life -= dt;
      const a = clamp(o.life / o.max, 0, 1);
      const sp = Math.hypot(o.vx, o.vy);
      const tx = o.x - (o.vx / sp) * o.len;
      const ty = o.y - (o.vy / sp) * o.len;
      const g = ctx.createLinearGradient(o.x, o.y, tx, ty);
      g.addColorStop(0, 'rgba(255,255,255,' + (0.9 * a) + ')');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = 1;
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(o.x, o.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      if (o.life <= 0) shooters.splice(i, 1);
    }

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.vx *= 0.985;
      p.vy = p.vy * 0.985 + 0.025 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
      ctx.beginPath();
      ctx.moveTo(p.x - p.r * 1.6, p.y);
      ctx.lineTo(p.x + p.r * 1.6, p.y);
      ctx.moveTo(p.x, p.y - p.r * 1.6);
      ctx.lineTo(p.x, p.y + p.r * 1.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 0.6, 0, 6.283);
      ctx.fill();
      if (p.life <= 0) sparks.splice(i, 1);
    }
    ctx.globalAlpha = 1;
  }

  function loop(t) {
    const dt = clamp((t - last) / 16.67, 0, 3);
    last = t;
    paint(t, dt);
    raf = requestAnimationFrame(loop);
  }
  function startSky() {
    if (reduce || raf) return;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }
  function stopSky() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  function shoot() {
    if (reduce) return;
    const a = Math.PI * (0.74 + Math.random() * 0.1);
    const v = 9 + Math.random() * 4;
    shooters.push({
      x: W * (0.35 + 0.65 * Math.random()),
      y: Math.random() * H * 0.45,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      len: 90 + Math.random() * 80,
      life: 55,
      max: 55
    });
  }
  function scheduleShoot() {
    setTimeout(() => {
      if (!document.hidden) shoot();
      scheduleShoot();
    }, 5500 + Math.random() * 6500);
  }
  function burst(x, y, n) {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283;
      const v = 1.2 + Math.random() * 5;
      const life = 70 + Math.random() * 60;
      sparks.push({
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 1,
        r: 1 + Math.random() * 2.4,
        life, max: life
      });
    }
  }

  let resizeT = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { size(); onScroll(); }, 120);
  });
  document.addEventListener('visibilitychange', () => (document.hidden ? stopSky() : startSky()));
  size();
  startSky();
  scheduleShoot();

  /* ---------- Open screen ---------- */
  const gate = $('#gate');
  const story = $('#story');
  const openBtn = $('#openBtn');
  targetLevel = 0.75;

  /* ---------- Open ---------- */
  let opened = false;
  openBtn.addEventListener('click', () => {
    if (opened) return;
    opened = true;
    startMusic();
    loadPhotos();
    gate.classList.add('leaving');
    targetLevel = 1;
    setTimeout(() => {
      gate.hidden = true;
      story.hidden = false;
      document.body.classList.remove('is-locked');
      document.body.classList.add('play');
      window.scrollTo(0, 0);
      onScroll();
    }, reduce ? 0 : 1000);
  });

  /* ---------- Scroll: reading-paced lines + timeline ---------- */
  const lines = $$('.ln');
  const tl = $('.tl');
  const tlItems = $$('.tl li');
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  function update() {
    ticking = false;
    if (story.hidden) return;
    const vh = window.innerHeight;

    if (!reduce) {
      for (const el of lines) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) continue;
        const d = Math.abs((r.top + r.bottom) / 2 - vh * 0.5) / vh;
        el.style.opacity = (1 - clamp((d - 0.16) / 0.3, 0, 1) * 0.82).toFixed(2);
      }
    }

    const tr = tl.getBoundingClientRect();
    tl.style.setProperty('--p', clamp((vh * 0.65 - tr.top) / tr.height, 0, 1).toFixed(3));
    tlItems.forEach(li => li.classList.toggle('on', li.getBoundingClientRect().top < vh * 0.65));
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Photos ---------- */
  const lamhe = $('#lamhe');
  const grid = $('#grid');
  const lb = $('#lb');
  const lbImg = $('#lbImg');
  const lbCap = $('#lbCap');
  const lbPrev = $('#lbPrev');
  const lbNext = $('#lbNext');
  let photos = [];
  let cur = 0;
  let lastFocus = null;
  let colorT = 0;

  function probe(n) {
    return new Promise(resolve => {
      let i = 0;
      const next = () => {
        if (i >= C.photoExts.length) return resolve(null);
        const src = C.photoFolder + n + '.' + C.photoExts[i++];
        const im = new Image();
        im.onload = () => resolve({ n, src });
        im.onerror = next;
        im.src = src;
      };
      next();
    });
  }

  async function loadPhotos() {
    let found;
    if (C.photoFiles && C.photoFiles.length) {
      const check = (name, k) => new Promise(resolve => {
        const im = new Image();
        im.onload = () => resolve({ n: k + 1, src: C.photoFolder + name });
        im.onerror = () => resolve(null);
        im.src = C.photoFolder + name;
      });
      found = (await Promise.all(C.photoFiles.map(check))).filter(Boolean);
    } else {
      const tries = Array.from({ length: C.photoMax }, (_, k) => probe(k + 1));
      found = (await Promise.all(tries)).filter(Boolean);
    }
    if (!found.length) return;
    photos = found.map(f => ({ src: f.src, cap: C.captions[f.n] || '', alt: C.captions[f.n] || 'Our photo' }));
    photos.forEach((p, i) => {
      const fig = document.createElement('figure');
      fig.style.setProperty('--r', ((i % 2 ? 1 : -1) * (0.6 + Math.random() * 1.1)).toFixed(2) + 'deg');
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Open photo');
      const im = new Image();
      im.alt = p.alt;
      im.decoding = 'async';
      im.onload = () => im.classList.add('in');
      im.src = p.src;
      b.appendChild(im);
      b.addEventListener('click', () => openLb(i));
      fig.appendChild(b);
      grid.appendChild(fig);
    });
    lamhe.hidden = false;
    onScroll();
  }

  function showPhoto(i) {
    cur = (i + photos.length) % photos.length;
    const p = photos[cur];
    lbImg.classList.remove('color');
    lbImg.src = p.src;
    lbImg.alt = p.alt;
    lbCap.textContent = p.cap;
    clearTimeout(colorT);
    colorT = setTimeout(() => lbImg.classList.add('color'), 180);
  }
  function openLb(i) {
    lastFocus = document.activeElement;
    lbPrev.hidden = lbNext.hidden = photos.length < 2;
    showPhoto(i);
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('#lbClose').focus({ preventScroll: true });
  }
  function closeLb() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  $('#lbClose').addEventListener('click', closeLb);
  lbPrev.addEventListener('click', () => showPhoto(cur - 1));
  lbNext.addEventListener('click', () => showPhoto(cur + 1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') showPhoto(cur - 1);
    if (e.key === 'ArrowRight') showPhoto(cur + 1);
  });
  let sx = 0;
  lb.addEventListener('touchstart', e => { sx = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50 && photos.length > 1) showPhoto(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ---------- Music ---------- */
  const snd = $('#snd');
  let audio = null;
  let fadeT = 0;

  function fade(to, ms) {
    clearInterval(fadeT);
    if (!audio) return;
    const from = audio.volume;
    const steps = 20;
    let i = 0;
    fadeT = setInterval(() => {
      i++;
      audio.volume = clamp(from + ((to - from) * i) / steps, 0, 1);
      if (i >= steps) {
        clearInterval(fadeT);
        if (to === 0) audio.pause();
      }
    }, ms / steps);
  }

  function startMusic() {
    if (!C.music) return;
    audio = new Audio(C.music);
    audio.loop = true;
    audio.volume = 0;
    const p = audio.play();
    if (p && p.then) {
      p.then(() => {
        snd.hidden = false;
        snd.classList.remove('off');
        fade(0.7, 2500);
      }).catch(() => { audio = null; });
    }
  }
  snd.addEventListener('click', () => {
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      snd.classList.remove('off');
      fade(0.7, 800);
    } else {
      snd.classList.add('off');
      fade(0, 500);
    }
  });

  /* ---------- Finale ---------- */
  const daysEl = $('#days');
  const daysLine = $('#daysLine');
  const nikkah = new Date(C.nikkahDate + 'T00:00:00+05:00').getTime();
  const totalDays = Math.floor((now() - nikkah) / 864e5);

  if (!(totalDays > 0)) {
    daysLine.hidden = true;
  } else if (reduce || !('IntersectionObserver' in window)) {
    daysEl.textContent = totalDays;
  } else {
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const dur = 2200;
      const step = t => {
        const k = clamp((t - t0) / dur, 0, 1);
        daysEl.textContent = Math.round(totalDays * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    io.observe($('#finale'));
  }

  const wishBtn = $('#wishBtn');
  const after = $('#after');
  wishBtn.addEventListener('click', () => {
    wishBtn.disabled = true;
    const r = wishBtn.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 110);
    for (let i = 0; i < 7; i++) setTimeout(shoot, i * 260);
    if (navigator.vibrate) navigator.vibrate(20);
    after.classList.add('show');
    after.removeAttribute('aria-hidden');
  });
})();
