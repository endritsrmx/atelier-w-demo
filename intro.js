(function () {
  if (window.__awIntro) return; window.__awIntro = true;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const NS = 'http://www.w3.org/2000/svg', d = document, root = d.documentElement;
  const C = { ink: '#101820', navy: '#14283f', ivory: '#f3f0e8', ice: '#c5d4e4', dim: 'rgba(197,212,228,0.22)' };
  const L1 = 'Für Anna', L2 = '14 · 06 · 2026';
  // Same sequence as the design export, played faster so the hero is not
  // covered for eight seconds (usability and Largest Contentful Paint).
  const SPEED = 6.2;
  const T = { draw: [0, 1.4], e1: [1.3, 2.9], e2: [3.1, 4.6], flip: [4.9, 6.0], tag: [5.8, 6.3], load: [0.3, 6.0], out: [6.6, 7.9] };
  Object.keys(T).forEach(function (k) { T[k] = T[k].map(function (v) { return v / SPEED; }); });
  const el = (tag, css, parent) => { const e = d.createElement(tag); if (css) e.style.cssText = css; if (parent) parent.appendChild(e); return e; };
  const sv = (tag, attrs, parent) => { const e = d.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const seg = (t, r) => clamp((t - r[0]) / (r[1] - r[0]));
  const eo = (x) => 1 - Math.pow(1 - x, 3);
  const eio = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const lerp = (a, b, k) => a + (b - a) * k;

  const ov = el('div', `position:fixed;inset:0;z-index:2147483000;color:${C.ivory};display:flex;align-items:center;justify-content:center;overflow:hidden;font-family:"Source Sans 3",Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased`);
  const focusCss = el('style', '', ov);
  focusCss.textContent = '#aw-intro-skip:focus-visible{outline:2px solid #f3f0e8;outline-offset:3px}';
  const bg = el('div', `position:absolute;inset:0;background:radial-gradient(110% 85% at 50% 45%,${C.navy} 0%,${C.ink} 72%)`, ov);
  bg.setAttribute('aria-hidden', 'true');
  const stage = el('div', 'position:relative;width:min(54vmin,420px);aspect-ratio:1;margin-bottom:8vh;margin-bottom:8svh;perspective:1600px;will-change:transform,opacity', ov);
  stage.setAttribute('aria-hidden', 'true');
  const spin = el('div', 'position:absolute;inset:0;transform-style:preserve-3d;will-change:transform', stage);
  const face = (rot) => el('div', `position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:rotateY(${rot}deg)`, spin);

  // Caseback
  const back = face(0);
  const bs = sv('svg', { viewBox: '0 0 400 400', width: '100%', height: '100%', style: 'display:block;overflow:visible' }, back);
  const defs = sv('defs', {}, bs);
  const steel = sv('radialGradient', { id: 'awSteel', cx: '38%', cy: '32%', r: '80%' }, defs);
  [['0', '#f4f6f8'], ['0.55', '#c3ccd5'], ['1', '#7d8a97']].forEach(([o, c]) => sv('stop', { offset: o, 'stop-color': c }, steel));
  const clip1 = sv('clipPath', { id: 'awC1' }, defs), r1 = sv('rect', { x: 0, y: 0, width: 0, height: 400 }, clip1);
  const clip2 = sv('clipPath', { id: 'awC2' }, defs), r2 = sv('rect', { x: 0, y: 0, width: 0, height: 400 }, clip2);
  const disc = sv('g', { opacity: 0 }, bs);
  sv('circle', { cx: 200, cy: 200, r: 182, fill: 'url(#awSteel)' }, disc);
  for (let r = 18; r < 150; r += 3.2) sv('circle', { cx: 200, cy: 200, r, fill: 'none', stroke: r % 2 < 1 ? '#ffffff' : '#5d6a77', 'stroke-width': 0.35, opacity: 0.32 }, disc);
  sv('circle', { cx: 200, cy: 200, r: 150, fill: 'none', stroke: '#6f7c89', 'stroke-width': 1.2 }, disc);
  sv('circle', { cx: 200, cy: 200, r: 151.5, fill: 'none', stroke: '#ffffff', 'stroke-width': 0.8, opacity: 0.7 }, disc);
  const screws = [];
  for (let i = 0; i < 6; i++) {
    const a = (i * 60 + 30) * Math.PI / 180, x = 200 + Math.sin(a) * 166, y = 200 - Math.cos(a) * 166;
    const g = sv('g', { opacity: 0 }, bs);
    sv('circle', { cx: x, cy: y, r: 6, fill: '#aab5c0', stroke: '#5d6a77', 'stroke-width': 0.8 }, g);
    sv('line', { x1: x - 4, y1: y, x2: x + 4, y2: y, stroke: '#4e5965', 'stroke-width': 1.3, transform: `rotate(${i * 37} ${x} ${y})` }, g);
    screws.push(g);
  }
  const rim = sv('circle', { cx: 200, cy: 200, r: 183, fill: 'none', stroke: C.ice, 'stroke-width': 1, transform: 'rotate(-90 200 200)' }, bs);
  const RL = 2 * Math.PI * 183; rim.style.strokeDasharray = RL; rim.style.strokeDashoffset = RL;
  const engr = (txt, y, size, clip, italic) => {
    const g = sv('g', { 'clip-path': `url(#${clip})` }, bs);
    const base = { x: 200, y, 'text-anchor': 'middle', 'font-family': '"Cormorant Garamond",Georgia,serif', 'font-size': size, 'font-weight': 500, 'letter-spacing': 1.5 };
    if (italic) base['font-style'] = 'italic';
    sv('text', Object.assign({}, base, { y: y + 1, fill: '#ffffff', opacity: 0.75 }), g).textContent = txt;
    const main = sv('text', Object.assign({}, base, { fill: '#3b4652' }), g); main.textContent = txt;
    return main;
  };
  const t1 = engr(L1, 196, 46, 'awC1', true), t2 = engr(L2, 244, 24, 'awC2', false);
  const tip = sv('g', { opacity: 0 }, bs);
  sv('circle', { cx: 0, cy: 0, r: 9, fill: '#ffffff', opacity: 0.25 }, tip);
  sv('circle', { cx: 0, cy: 0, r: 2.4, fill: '#ffffff' }, tip);
  const sparks = [];
  for (let i = 0; i < 10; i++) sparks.push(sv('circle', { r: 0.9, fill: '#ffffff', opacity: 0 }, bs));

  // Dial
  const front = face(180);
  const fs = sv('svg', { viewBox: '0 0 400 400', width: '100%', height: '100%', style: 'display:block;overflow:visible' }, front);
  const fd = sv('defs', {}, fs);
  const sun = sv('radialGradient', { id: 'awSun', cx: '50%', cy: '42%', r: '65%' }, fd);
  [['0', '#3a6a9a'], ['0.6', '#1f3a5f'], ['1', '#101c2c']].forEach(([o, c]) => sv('stop', { offset: o, 'stop-color': c }, sun));
  sv('circle', { cx: 200, cy: 200, r: 183, fill: '#c3ccd5' }, fs);
  sv('circle', { cx: 200, cy: 200, r: 170, fill: 'url(#awSun)' }, fs);
  for (let i = 0; i < 60; i++) {
    const a = i * 6 * Math.PI / 180, hr = i % 5 === 0, ra = hr ? 128 : 150;
    sv('line', { x1: 200 + Math.sin(a) * ra, y1: 200 - Math.cos(a) * ra, x2: 200 + Math.sin(a) * 158, y2: 200 - Math.cos(a) * 158, stroke: C.ivory, 'stroke-width': hr ? 3.4 : 0.9, opacity: hr ? 0.95 : 0.55 }, fs);
  }
  const hands = sv('g', {}, fs);
  const hH = sv('line', { x1: 200, y1: 212, x2: 200, y2: 128, stroke: C.ivory, 'stroke-width': 4, 'stroke-linecap': 'round' }, hands);
  const hM = sv('line', { x1: 200, y1: 216, x2: 200, y2: 72, stroke: C.ivory, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, hands);
  sv('circle', { cx: 200, cy: 200, r: 4.5, fill: C.ivory }, hands);
  const logo = el('img', 'position:absolute;left:50%;top:69%;width:26%;height:auto;transform:translate(-50%,-50%)', front);
  logo.src = 'assets/logo/atelier-w-logo-white.svg'; logo.alt = '';

  const tag = el('div', `position:absolute;left:0;right:0;top:calc(100% + 22px);text-align:center;font-family:"Cormorant Garamond",Georgia,serif;font-style:italic;font-size:clamp(19px,2.6vmin,26px);color:${C.ice};opacity:0`, stage);
  tag.textContent = 'Jede Uhr ein Unikat.';

  const bar = el('div', 'position:absolute;left:50%;bottom:clamp(36px,8vh,72px);bottom:clamp(36px,8svh,72px);width:min(360px,64vw);transform:translateX(-50%);display:flex;flex-direction:column;gap:12px', ov);
  bar.setAttribute('aria-hidden', 'true');
  const meta = el('div', `display:flex;justify-content:space-between;font-size:11px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:${C.ice}`, bar);
  const metaL = el('span', '', meta);
  const pct = el('span', 'font-variant-numeric:tabular-nums', meta);
  const track = el('div', `position:relative;height:1px;background:${C.dim}`, bar);
  const fill = el('div', `position:absolute;inset:0;background:${C.ivory};transform-origin:left;transform:scaleX(0)`, track);
  const dot = el('div', `position:absolute;top:-2px;left:0;width:5px;height:5px;border-radius:50%;background:${C.ivory};box-shadow:0 0 10px 2px rgba(197,212,228,0.7);transform:translateX(-50%)`, track);

  const skip = el('button', `position:absolute;top:calc(clamp(16px,3vh,28px) + env(safe-area-inset-top,0px));top:calc(clamp(16px,3svh,28px) + env(safe-area-inset-top,0px));right:clamp(16px,3vw,32px);min-height:44px;min-width:44px;padding:0 14px;background:none;border:1px solid ${C.dim};color:${C.ice};font:600 12px "Source Sans 3",sans-serif;letter-spacing:0.14em;text-transform:uppercase;cursor:pointer;border-radius:2px`, ov);
  skip.type = 'button'; skip.id = 'aw-intro-skip'; skip.textContent = 'Überspringen';
  skip.setAttribute('aria-label', 'Intro überspringen');

  const flyer = el('img', 'position:fixed;left:0;top:0;z-index:2147483001;pointer-events:none;opacity:0;transform-origin:0 0;will-change:transform,opacity');
  flyer.src = logo.src; flyer.alt = ''; flyer.setAttribute('aria-hidden', 'true');

  const prevOverflow = root.style.overflow;
  root.style.overflow = 'hidden';
  const mount = () => { d.body.appendChild(ov); d.body.appendChild(flyer); };
  d.body ? mount() : d.addEventListener('DOMContentLoaded', mount);

  let t0 = null, offset = 0, done = false, b1 = null, b2 = null, fly = null;
  const onKey = (e) => {
    if (done) return;
    if (e.key === 'Escape') skipNow();
    else if (e.key === 'Tab') { e.preventDefault(); skip.focus(); }
  };
  const finish = () => {
    if (done) return; done = true;
    d.removeEventListener('keydown', onKey);
    ov.remove(); flyer.remove(); root.style.overflow = prevOverflow;
    window.dispatchEvent(new Event('aw-intro-done'));
  };
  // Skipping before the first frame (fonts still loading) used to be ignored.
  const skipNow = () => {
    if (t0 === null) { offset = Math.max(offset, T.out[0]); return; }
    const now = (performance.now() - t0) / 1000 + offset;
    if (now < T.out[0]) offset += T.out[0] - now;
  };
  skip.addEventListener('click', skipNow);
  d.addEventListener('keydown', onKey);

  const engrave = (k, b, rect, y) => {
    const x = b.x - 4 + k * (b.width + 8);
    rect.setAttribute('width', Math.max(0, x));
    return { x, y };
  };

  const frame = (now) => {
    if (done) return;
    if (t0 === null) t0 = now;
    const t = (now - t0) / 1000 + offset;
    if (!b1) { try { b1 = t1.getBBox(); b2 = t2.getBBox(); } catch (e) {} }

    const dp = eo(seg(t, T.draw));
    rim.style.strokeDashoffset = RL * (1 - dp);
    disc.setAttribute('opacity', eo(seg(t, [0.3, 1.4])));
    screws.forEach((s, i) => s.setAttribute('opacity', eo(seg(t, [0.8 + i * 0.09, 1.2 + i * 0.09]))));

    let pos = null;
    if (b1) {
      const k1 = seg(t, T.e1), k2 = seg(t, T.e2);
      const p1 = engrave(k1, b1, r1, b1.y + b1.height * 0.55), p2 = engrave(k2, b2, r2, b2.y + b2.height * 0.55);
      if (k1 > 0 && k1 < 1) pos = p1; else if (k2 > 0 && k2 < 1) pos = p2;
    }
    if (pos) {
      tip.setAttribute('transform', `translate(${pos.x} ${pos.y + Math.sin(t * 40) * 1.2})`);
      tip.setAttribute('opacity', 1);
      sparks.forEach((s, i) => {
        const ph = ((t * 3 + i / sparks.length) % 1), ang = (i * 137) % 360 * Math.PI / 180;
        s.setAttribute('cx', pos.x + Math.cos(ang) * ph * 16); s.setAttribute('cy', pos.y - Math.abs(Math.sin(ang)) * ph * 14 + ph * ph * 10);
        s.setAttribute('opacity', (1 - ph) * 0.9);
      });
    } else {
      tip.setAttribute('opacity', 0);
      sparks.forEach(s => s.setAttribute('opacity', 0));
    }

    const fp = eio(seg(t, T.flip));
    back.style.visibility = fp < 0.5 ? 'visible' : 'hidden'; front.style.visibility = fp >= 0.5 ? 'visible' : 'hidden';
    spin.style.transform = `rotateY(${fp * 180}deg) scale(${1 - Math.sin(fp * Math.PI) * 0.08})`;
    const hp = eo(seg(t, [5.3, 6.4]));
    hM.setAttribute('transform', `rotate(${lerp(-120, 60, hp)} 200 200)`);
    hH.setAttribute('transform', `rotate(${lerp(240, 305, hp)} 200 200)`);

    const tg = eo(seg(t, T.tag));
    tag.style.opacity = tg * (1 - seg(t, [T.out[0], T.out[0] + 0.35]));
    tag.style.transform = `translateY(${(1 - tg) * 8}px)`;

    const p = seg(t, T.load), pe = p < 1 ? p * (2 - p) * 0.5 + p * 0.5 : 1;
    fill.style.transform = `scaleX(${pe})`;
    dot.style.left = (pe * 100) + '%';
    pct.textContent = String(Math.round(pe * 100)).padStart(3, '0') + ' %';
    metaL.textContent = t < T.e1[0] ? 'Gehäuse wird vorbereitet' : t < T.flip[0] ? 'Gravur läuft' : pe < 1 ? 'Endkontrolle' : 'Unikat fertig';

    const op = seg(t, T.out);
    if (op > 0) {
      if (!fly) {
        const a = logo.getBoundingClientRect();
        const hdr = d.querySelector('header img');
        const b = hdr ? hdr.getBoundingClientRect() : { left: 24, top: 14, width: a.width * 0.5, height: a.height * 0.5 };
        fly = { a, b };
        flyer.style.width = a.width + 'px'; flyer.style.height = a.height + 'px';
        flyer.style.opacity = 1; logo.style.opacity = 0;
      }
      const k = eio(op), { a, b } = fly;
      const sc = lerp(1, b.height / a.height, k);
      flyer.style.transform = `translate(${lerp(a.left, b.left, k)}px, ${lerp(a.top, b.top, k)}px) scale(${sc})`;
      flyer.style.opacity = 1 - seg(t, [T.out[1] - 0.15, T.out[1]]);
      stage.style.transform = `scale(${1 + eo(op) * 0.12})`;
      stage.style.opacity = 1 - eo(seg(t, [T.out[0], T.out[0] + 0.6]));
      stage.style.filter = `blur(${eo(op) * 8}px)`;
      bg.style.opacity = 1 - eio(seg(t, [T.out[0] + 0.15, T.out[1] - 0.1]));
      bar.style.opacity = skip.style.opacity = 1 - seg(t, [T.out[0], T.out[0] + 0.3]);
    }
    if (t >= T.out[1]) return finish();
    requestAnimationFrame(frame);
  };
  const start = () => requestAnimationFrame(frame);
  // Do not wait on font loading: a late webfont used to hold the overlay
  // over the hero and pushed Largest Contentful Paint past several seconds.
  if (d.readyState === 'complete' || d.readyState === 'interactive') start();
  else d.addEventListener('DOMContentLoaded', start);
})();
