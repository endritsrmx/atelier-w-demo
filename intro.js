(function () {
  if (window.__awIntro) return;
  window.__awIntro = true;

  // Timing in milliseconds from the moment the overlay is shown.
  // 0.15–1.75s  case fades in, rim draws (ease-out)
  // 1.05–2.20s  screws settle, staggered
  // 1.95–3.45s  engraving «Für Anna», then a short hold
  // 3.65–5.00s  date, then a short hold
  // 5.20–6.45s  flip to the dial (ease-in-out)
  // 5.85–6.70s  hands settle
  // 6.25–6.95s  tagline
  // 0.40–6.60s  progress, eased (not linear)
  // 6.60–7.95s  crossfade into the hero, logo travels to the header
  var OUT = 6600;
  var TOTAL = 7950;
  var EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
  var EASE_IO = 'cubic-bezier(0.65, 0, 0.35, 1)';

  var d = document;
  var root = d.documentElement;
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seen = false;
  try { seen = sessionStorage.getItem('aw-intro-seen') === '1'; } catch (e) {}
  try { sessionStorage.setItem('aw-intro-seen', '1'); } catch (e) {}

  var NS = 'http://www.w3.org/2000/svg';
  var C = { ink: '#101820', navy: '#14283f', ivory: '#f3f0e8', ice: '#c5d4e4', dim: 'rgba(197,212,228,0.22)' };
  var blockers = [];
  var mo = null;
  var finished = false;

  function el(tag, css, parent) {
    var e = d.createElement(tag);
    if (css) e.style.cssText = css;
    if (parent) parent.appendChild(e);
    return e;
  }
  function sv(tag, attrs, parent) {
    var e = d.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function lock() {
    var gap = window.innerWidth - root.clientWidth;
    root.classList.add('aw-intro-lock');
    if (gap > 0) d.body.style.paddingRight = gap + 'px';
    var block = function (e) { e.preventDefault(); };
    window.addEventListener('wheel', block, { passive: false });
    window.addEventListener('touchmove', block, { passive: false });
    blockers.push(['wheel', block], ['touchmove', block]);
    var pin = function () {
      var n = d.getElementById('dc-root');
      if (n) n.inert = true;
    };
    pin();
    mo = new MutationObserver(pin);
    mo.observe(d.body, { childList: true, subtree: true });
  }
  function unlock() {
    if (mo) mo.disconnect();
    blockers.forEach(function (pair) {
      window.removeEventListener(pair[0], pair[1], { passive: false });
    });
    var n = d.getElementById('dc-root');
    if (n) n.inert = false;
    d.body.style.paddingRight = '';
    root.classList.remove('aw-intro-lock', 'aw-intro-on', 'aw-intro-out');
    window.dispatchEvent(new Event('aw-intro-done'));
  }

  var sheet = el('style');
  sheet.textContent = [
    'html.aw-intro-lock,html.aw-intro-lock body{overflow:hidden!important;overscroll-behavior:none}',
    'html.aw-intro-lock body{touch-action:none}',
    'html.aw-intro-lock #dc-root{pointer-events:none!important}',
    'html.aw-intro-on .aw-hero-copy>*{opacity:0;transform:translate3d(0,18px,0)}',
    'html.aw-intro-on .aw-hero-figure{transform:translate3d(0,14px,0)}',
    'html.aw-intro-on header img{opacity:0}',
    'html.aw-intro-on.aw-intro-out .aw-hero-copy>*{opacity:1;transform:translate3d(0,0,0);transition:opacity 800ms ' + EASE_OUT + ',transform 900ms ' + EASE_OUT + '}',
    'html.aw-intro-on.aw-intro-out .aw-hero-copy>*:nth-child(1){transition-delay:80ms}',
    'html.aw-intro-on.aw-intro-out .aw-hero-copy>*:nth-child(2){transition-delay:180ms}',
    'html.aw-intro-on.aw-intro-out .aw-hero-copy>*:nth-child(3){transition-delay:280ms}',
    'html.aw-intro-on.aw-intro-out .aw-hero-copy>*:nth-child(4){transition-delay:380ms}',
    'html.aw-intro-on.aw-intro-out .aw-hero-figure{transform:translate3d(0,0,0);transition:transform 1200ms ' + EASE_OUT + '}',
    'html.aw-intro-on.aw-intro-out header img{opacity:1;transition:opacity 480ms ' + EASE_OUT + ' 700ms}',
    '#aw-intro-skip:focus-visible{outline:2px solid #f3f0e8;outline-offset:3px}',
    '@keyframes aw-in{to{opacity:1}}',
    '@keyframes aw-rim{to{stroke-dashoffset:0}}',
    '@keyframes aw-wipe{to{transform:scaleX(1)}}',
    '@keyframes aw-flip{0%{transform:rotateY(0deg) scale(1)}45%{transform:rotateY(86deg) scale(0.965)}55%{transform:rotateY(94deg) scale(0.965)}100%{transform:rotateY(180deg) scale(1)}}',
    '@keyframes aw-hm{to{transform:rotate(60deg)}}',
    '@keyframes aw-hh{to{transform:rotate(305deg)}}',
    '@keyframes aw-tag{to{opacity:1;transform:translate3d(0,0,0)}}',
    '@keyframes aw-fill{to{transform:scaleX(1)}}',
    '@keyframes aw-dot{to{transform:translate3d(calc(100cqw - 5px),-2px,0)}}',
    '@keyframes aw-stageout{to{opacity:0;transform:translate3d(0,-10px,0)}}',
    '@keyframes aw-fadeout{to{opacity:0}}',
    '.aw-disc{opacity:0;animation:aw-in 1400ms ' + EASE_OUT + ' 150ms forwards}',
    '.aw-rim{stroke-dasharray:var(--aw-len);stroke-dashoffset:var(--aw-len);animation:aw-rim 1550ms ' + EASE_OUT + ' 200ms forwards}',
    '.aw-screw{opacity:0;animation:aw-in 480ms ' + EASE_OUT + ' forwards}',
    '.aw-engrave{transform-box:fill-box;transform-origin:left center;transform:scaleX(0)}',
    '.aw-e1{animation:aw-wipe 1500ms ' + EASE_IO + ' 1950ms forwards}',
    '.aw-e2{animation:aw-wipe 1350ms ' + EASE_IO + ' 3650ms forwards}',
    '.aw-spin{transform-style:preserve-3d;-webkit-transform-style:preserve-3d;animation:aw-flip 1250ms ' + EASE_IO + ' 5200ms forwards}',
    '.aw-face{position:absolute;inset:0;-webkit-backface-visibility:hidden;backface-visibility:hidden}',
    '.aw-hand{transform-box:view-box;transform-origin:50% 50%}',
    '.aw-hm{transform:rotate(-120deg);animation:aw-hm 850ms ' + EASE_OUT + ' 5850ms forwards}',
    '.aw-hh{transform:rotate(240deg);animation:aw-hh 900ms ' + EASE_OUT + ' 6000ms forwards}',
    '.aw-tag{opacity:0;transform:translate3d(0,10px,0);animation:aw-tag 700ms ' + EASE_OUT + ' 6250ms forwards}',
    '.aw-fill{transform-origin:left center;transform:scaleX(0);animation:aw-fill 6200ms ' + EASE_IO + ' 400ms forwards}',
    '.aw-track{container-type:inline-size}',
    '.aw-dot{animation:aw-dot 6200ms ' + EASE_IO + ' 400ms forwards}',
    '.aw-stagewrap{animation:aw-stageout 1050ms ' + EASE_IO + ' 6600ms forwards}',
    '.aw-bg{animation:aw-fadeout 1350ms ' + EASE_IO + ' 6600ms forwards}',
    '.aw-chrome{animation:aw-fadeout 420ms ease 6600ms forwards}'
  ].join('');
  d.head.appendChild(sheet);

  function skipButton(parent) {
    var b = el('button', 'position:absolute;top:calc(16px + env(safe-area-inset-top,0px));right:clamp(16px,3vw,32px);z-index:2;min-height:44px;min-width:44px;padding:0 14px;background:none;border:1px solid ' + C.dim + ';color:' + C.ice + ';font:600 12px "Source Sans 3",sans-serif;letter-spacing:0.14em;text-transform:uppercase;cursor:pointer;border-radius:2px', parent);
    b.type = 'button';
    b.id = 'aw-intro-skip';
    b.textContent = 'Überspringen';
    b.setAttribute('aria-label', 'Intro überspringen');
    return b;
  }

  function finish(node, flyer) {
    if (finished) return;
    finished = true;
    if (d.activeElement && node && node.contains(d.activeElement)) d.activeElement.blur();
    if (node) node.remove();
    if (flyer) flyer.remove();
    unlock();
  }

  lock();

  if (reduced || seen) {
    var plain = el('div', 'position:fixed;inset:0;z-index:2147483000;background:radial-gradient(110% 85% at 50% 45%,' + C.navy + ' 0%,' + C.ink + ' 72%);touch-action:none');
    plain.id = 'aw-intro';
    var plainSkip = skipButton(plain);
    d.body.appendChild(plain);
    var endPlain = function () { finish(plain, null); };
    plainSkip.addEventListener('click', function (e) { e.stopPropagation(); endPlain(); });
    plain.addEventListener('pointerup', function (e) { if (e.target !== plainSkip) endPlain(); });
    var wait0 = performance.now();
    var wait = function () {
      if (d.getElementById('img-hero') || performance.now() - wait0 > 1400) {
        var t0 = performance.now();
        var step = function (now) {
          var k = Math.min(1, (now - t0) / 480);
          var e = 1 - Math.pow(1 - k, 3);
          plain.style.opacity = String(1 - e);
          if (k < 1 && !finished) requestAnimationFrame(step);
          else endPlain();
        };
        requestAnimationFrame(step);
      } else requestAnimationFrame(wait);
    };
    requestAnimationFrame(wait);
    return;
  }

  root.classList.add('aw-intro-on');

  var ov = el('div', 'position:fixed;inset:0;z-index:2147483000;color:' + C.ivory + ';display:flex;align-items:center;justify-content:center;font-family:"Source Sans 3",Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;touch-action:none');
  ov.id = 'aw-intro';
  var bg = el('div', 'position:absolute;inset:0;background:radial-gradient(110% 85% at 50% 45%,' + C.navy + ' 0%,' + C.ink + ' 72%)', ov);
  bg.className = 'aw-bg';
  bg.setAttribute('aria-hidden', 'true');

  var wrap = el('div', 'position:relative;width:min(54vmin,420px);aspect-ratio:1;margin-bottom:8vh;margin-bottom:8svh', ov);
  wrap.className = 'aw-stagewrap';
  var stage = el('div', 'position:absolute;inset:0;perspective:1400px;-webkit-perspective:1400px', wrap);
  stage.setAttribute('aria-hidden', 'true');
  var spin = el('div', 'position:absolute;inset:0', stage);
  spin.className = 'aw-spin';

  var back = el('div', 'transform:rotateY(0deg)', spin);
  back.className = 'aw-face';
  var bs = sv('svg', { viewBox: '0 0 400 400', width: '100%', height: '100%', style: 'display:block' }, back);
  var defs = sv('defs', {}, bs);
  var steel = sv('radialGradient', { id: 'awSteel', cx: '38%', cy: '32%', r: '80%' }, defs);
  [['0', '#f4f6f8'], ['0.55', '#c3ccd5'], ['1', '#7d8a97']].forEach(function (s) {
    sv('stop', { offset: s[0], 'stop-color': s[1] }, steel);
  });
  var disc = sv('g', {}, bs);
  disc.setAttribute('class', 'aw-disc');
  sv('circle', { cx: 200, cy: 200, r: 182, fill: 'url(#awSteel)' }, disc);
  for (var r = 18; r < 150; r += 3.2) {
    sv('circle', { cx: 200, cy: 200, r: r, fill: 'none', stroke: r % 2 < 1 ? '#ffffff' : '#5d6a77', 'stroke-width': 0.35, opacity: 0.32 }, disc);
  }
  sv('circle', { cx: 200, cy: 200, r: 150, fill: 'none', stroke: '#6f7c89', 'stroke-width': 1.2 }, disc);
  sv('circle', { cx: 200, cy: 200, r: 151.5, fill: 'none', stroke: '#ffffff', 'stroke-width': 0.8, opacity: 0.7 }, disc);
  for (var i = 0; i < 6; i++) {
    var a = (i * 60 + 30) * Math.PI / 180;
    var x = 200 + Math.sin(a) * 166;
    var y = 200 - Math.cos(a) * 166;
    var g = sv('g', {}, bs);
    g.setAttribute('class', 'aw-screw');
    g.style.animationDelay = (1050 + i * 110) + 'ms';
    sv('circle', { cx: x, cy: y, r: 6, fill: '#aab5c0', stroke: '#5d6a77', 'stroke-width': 0.8 }, g);
    sv('line', { x1: x - 4, y1: y, x2: x + 4, y2: y, stroke: '#4e5965', 'stroke-width': 1.3, transform: 'rotate(' + (i * 37) + ' ' + x + ' ' + y + ')' }, g);
  }
  var rimLen = (2 * Math.PI * 183).toFixed(2);
  var rim = sv('circle', { cx: 200, cy: 200, r: 183, fill: 'none', stroke: C.ice, 'stroke-width': 1, transform: 'rotate(-90 200 200)' }, bs);
  rim.setAttribute('class', 'aw-rim');
  rim.style.setProperty('--aw-len', rimLen);

  function engraving(txt, y, size, italic, which) {
    var g = sv('g', {}, bs);
    g.setAttribute('class', 'aw-engrave ' + which);
    var base = { x: 200, y: y, 'text-anchor': 'middle', 'font-family': '"Cormorant Garamond",Georgia,serif', 'font-size': size, 'font-weight': 500, 'letter-spacing': 1.5 };
    if (italic) base['font-style'] = 'italic';
    sv('text', Object.assign({}, base, { y: y + 1, fill: '#ffffff', opacity: 0.75 }), g).textContent = txt;
    var main = sv('text', Object.assign({}, base, { fill: '#3b4652' }), g);
    main.textContent = txt;
    return main;
  }
  var t1 = engraving('Für Anna', 196, 46, true, 'aw-e1');
  var t2 = engraving('14 · 06 · 2026', 244, 24, false, 'aw-e2');
  var tip = sv('g', { opacity: 0 }, bs);
  sv('circle', { cx: 0, cy: 0, r: 2.2, fill: '#ffffff' }, tip);

  var front = el('div', 'transform:rotateY(180deg)', spin);
  front.className = 'aw-face';
  var fs = sv('svg', { viewBox: '0 0 400 400', width: '100%', height: '100%', style: 'display:block' }, front);
  var fd = sv('defs', {}, fs);
  var sun = sv('radialGradient', { id: 'awSun', cx: '50%', cy: '42%', r: '65%' }, fd);
  [['0', '#3a6a9a'], ['0.6', '#1f3a5f'], ['1', '#101c2c']].forEach(function (s) {
    sv('stop', { offset: s[0], 'stop-color': s[1] }, sun);
  });
  sv('circle', { cx: 200, cy: 200, r: 183, fill: '#c3ccd5' }, fs);
  sv('circle', { cx: 200, cy: 200, r: 170, fill: 'url(#awSun)' }, fs);
  for (var n = 0; n < 60; n++) {
    var ang = n * 6 * Math.PI / 180;
    var hr = n % 5 === 0;
    var ra = hr ? 128 : 150;
    sv('line', {
      x1: 200 + Math.sin(ang) * ra, y1: 200 - Math.cos(ang) * ra,
      x2: 200 + Math.sin(ang) * 158, y2: 200 - Math.cos(ang) * 158,
      stroke: C.ivory, 'stroke-width': hr ? 3.4 : 0.9, opacity: hr ? 0.95 : 0.55
    }, fs);
  }
  var hH = sv('line', { x1: 200, y1: 212, x2: 200, y2: 128, stroke: C.ivory, 'stroke-width': 4, 'stroke-linecap': 'round' }, fs);
  hH.setAttribute('class', 'aw-hand aw-hh');
  var hM = sv('line', { x1: 200, y1: 216, x2: 200, y2: 72, stroke: C.ivory, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, fs);
  hM.setAttribute('class', 'aw-hand aw-hm');
  sv('circle', { cx: 200, cy: 200, r: 4.5, fill: C.ivory }, fs);
  var logo = el('img', 'position:absolute;left:50%;top:69%;width:26%;height:auto;transform:translate(-50%,-50%)', front);
  logo.src = 'assets/logo/atelier-w-logo-white.svg';
  logo.alt = '';

  var tag = el('div', 'position:absolute;left:0;right:0;top:calc(100% + 22px);text-align:center;font-family:"Cormorant Garamond",Georgia,serif;font-style:italic;font-size:clamp(19px,2.6vmin,26px);color:' + C.ice, wrap);
  tag.className = 'aw-tag';
  tag.textContent = 'Jede Uhr ein Unikat.';

  var bar = el('div', 'position:absolute;left:50%;bottom:clamp(36px,8svh,72px);width:min(360px,64vw);transform:translateX(-50%);display:flex;flex-direction:column;gap:12px', ov);
  bar.className = 'aw-chrome';
  bar.setAttribute('aria-hidden', 'true');
  var meta = el('div', 'display:flex;justify-content:space-between;font-size:11px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:' + C.ice, bar);
  var metaL = el('span', '', meta);
  var pct = el('span', 'font-variant-numeric:tabular-nums', meta);
  var track = el('div', 'position:relative;height:1px;background:' + C.dim, bar);
  track.className = 'aw-track';
  var fill = el('div', 'position:absolute;inset:0;background:' + C.ivory, track);
  fill.className = 'aw-fill';
  var dot = el('div', 'position:absolute;top:-2px;left:0;width:5px;height:5px;border-radius:50%;background:' + C.ivory + ';box-shadow:0 0 10px 2px rgba(197,212,228,0.7)', track);
  dot.className = 'aw-dot';

  var skip = skipButton(ov);
  skip.classList.add('aw-chrome');

  var flyer = el('img', 'position:fixed;left:0;top:0;z-index:2147483001;pointer-events:none;opacity:0;transform-origin:0 0;will-change:transform,opacity');
  flyer.src = logo.src;
  flyer.alt = '';
  flyer.setAttribute('aria-hidden', 'true');

  d.body.appendChild(ov);
  d.body.appendChild(flyer);

  var t0 = performance.now();
  var jump = 0;
  var exiting = false;
  var skipped = false;
  var label = '';
  var shown = -1;
  var boxes = null;

  function clock() { return (performance.now() - t0) / 1000 + jump; }

  function paintLabels(t) {
    var next = t < 1.95 ? 'Gehäuse wird vorbereitet' : t < 5.2 ? 'Gravur läuft' : t < 6.6 ? 'Endkontrolle' : 'Unikat fertig';
    if (next !== label) { label = next; metaL.textContent = next; }
    var p = Math.max(0, Math.min(1, (t - 0.4) / 6.2));
    var pe = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    var num = Math.round(pe * 100);
    if (num !== shown) { shown = num; pct.textContent = String(num).padStart(3, '0') + ' %'; }
  }

  function placeTip(t) {
    if (!boxes) {
      try { boxes = [t1.getBBox(), t2.getBBox()]; } catch (err) { return; }
    }
    var active = null;
    var k = 0;
    if (t >= 1.95 && t <= 3.45) { active = boxes[0]; k = (t - 1.95) / 1.5; }
    else if (t >= 3.65 && t <= 5.0) { active = boxes[1]; k = (t - 3.65) / 1.35; }
    if (!active) { tip.setAttribute('opacity', '0'); return; }
    k = Math.max(0, Math.min(1, k));
    k = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    var x = active.x + k * active.width;
    var y = active.y + active.height * 0.62;
    tip.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
    tip.setAttribute('opacity', k > 0.02 && k < 0.98 ? '1' : '0');
  }

  function flyLogo() {
    var a = logo.getBoundingClientRect();
    var hdr = d.querySelector('header img');
    var b = hdr ? hdr.getBoundingClientRect() : { left: 28, top: 16, width: a.width * 0.46, height: a.height * 0.46 };
    if (!a.width || !b.height) return;
    flyer.style.width = a.width + 'px';
    flyer.style.height = a.height + 'px';
    flyer.style.opacity = '1';
    flyer.style.transform = 'translate3d(' + a.left + 'px,' + a.top + 'px,0) scale(1)';
    logo.style.opacity = '0';
    var sc = b.height / a.height;
    flyer.animate([
      { transform: 'translate3d(' + a.left + 'px,' + a.top + 'px,0) scale(1)', opacity: 1 },
      { transform: 'translate3d(' + b.left + 'px,' + b.top + 'px,0) scale(' + sc + ')', opacity: 1, offset: 0.72 },
      { transform: 'translate3d(' + b.left + 'px,' + b.top + 'px,0) scale(' + sc + ')', opacity: 0 }
    ], { duration: 1250, easing: EASE_IO, fill: 'forwards' });
  }

  function beginExit() {
    if (exiting) return;
    exiting = true;
    root.classList.add('aw-intro-out');
    flyLogo();
  }

  function seek(ms) {
    d.getAnimations().forEach(function (anim) {
      var name = anim.animationName || '';
      if (name.indexOf('aw-') === 0 && anim.currentTime < ms) anim.currentTime = ms;
    });
  }

  function skipNow() {
    if (skipped || finished) return;
    skipped = true;
    var t = clock();
    if (t < OUT / 1000) {
      jump += OUT / 1000 - t;
      seek(OUT);
    }
    beginExit();
  }

  skip.addEventListener('click', function (e) { e.stopPropagation(); skipNow(); });
  ov.addEventListener('pointerup', function (e) { if (e.target !== skip) skipNow(); });
  d.addEventListener('keydown', function onKey(e) {
    if (finished) { d.removeEventListener('keydown', onKey); return; }
    if (e.key === 'Escape') skipNow();
    else if (e.key === 'Tab') { e.preventDefault(); skip.focus(); }
  });

  var raf = 0;
  var loop = function () {
    if (finished) return;
    var t = clock();
    paintLabels(t);
    if (t >= 1.9 && t <= 5.15) placeTip(t);
    else if (tip.getAttribute('opacity') !== '0') tip.setAttribute('opacity', '0');
    if (t >= OUT / 1000) beginExit();
    if (t >= TOTAL / 1000) finish(ov, flyer);
    else raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  paintLabels(0);
})();
