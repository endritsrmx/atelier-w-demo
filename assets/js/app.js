/* Atelier AW – Seitenlogik (ohne Framework)
 * Menü, aktive Navigation, Ablauf-Linien, Konfigurator, Anfrageformular (Demo, kein Versand) und FAQ.
 * Alle Eingaben bleiben im Arbeitsspeicher der geöffneten Seite.
 */
(function () {
  'use strict';
  var d = document;
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function mq(q) { return window.matchMedia ? window.matchMedia(q) : { matches: false }; }
  function onMq(m, fn) { if (!m.addEventListener && !m.addListener) return; if (m.addEventListener) m.addEventListener('change', fn); else m.addListener(fn); }
  var reduced = mq('(prefers-reduced-motion: reduce)').matches;
  var fine = mq('(hover: hover) and (pointer: fine)').matches;

  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });


  /* ───────────── Daten (laut Datenblättern Atelier AW) ───────────── */
  var MODELS = {
    classico: { label: 'Classico Titanio', metal: 'Titan', sizes: [{ id: '36', label: '36 mm', sub: 'Zifferblatt 28,5 mm', r: 135, dr: 107 }, { id: '39', label: '39 mm', sub: 'Zifferblatt 33,5 mm', r: 146, dr: 126 }],
      dials: [{ id: 'eisblau', label: 'Eisblau', c: '#a8d4ec', light: true }, { id: 'nachtblau', label: 'Nachtblau', c: '#1c2f6e' }, { id: 'violett', label: 'Violett', c: '#7a2a9e' }, { id: 'gruen', label: 'Tannengrün', c: '#1d6a46' }, { id: 'braun', label: 'Mokka', c: '#6a4a36' }, { id: 'schwarz', label: 'Schwarz', c: '#1a1b1e' }],
      straps: ['kautschuk', 'leder', 'stoff'], back: 'Titan' },
    wsport: { label: 'W-Sport', metal: 'Stahl', sizes: [{ id: '40', label: '40 mm', sub: 'Zifferblatt 28,5 mm', r: 150, dr: 104 }],
      dials: [{ id: 'schwarz', label: 'Schwarz', c: '#17181b' }, { id: 'silber', label: 'Silber', c: '#c9ccd0', light: true }, { id: 'azur', label: 'Azurblau', c: '#1d8cc6' }, { id: 'koenigsblau', label: 'Königsblau', c: '#2343a6' }, { id: 'smaragd', label: 'Smaragd', c: '#0f6b54' }, { id: 'rot', label: 'Rot', c: '#b0241d' }],
      straps: ['stahl', 'kautschuk'], back: 'Stahl' }
  };
  var MODEL_OPTS = [{ id: 'classico', label: 'Classico Titanio', sub: 'Titan T2 · 36 / 39 mm' }, { id: 'wsport', label: 'W-Sport', sub: 'Stahl · 40 mm · Lünette' }];
  var BEZEL = [{ id: 'alu', label: 'Aluminium', sub: 'matt' }, { id: 'keramik', label: 'Keramik', sub: 'glänzend' }];
  var STRAPS = { kautschuk: { label: 'Kautschuk', c: '#1f2429' }, leder: { label: 'Leder', c: '#6b4630' }, stoff: { label: 'Stoff', c: '#33445a' }, stahl: { label: 'Stahl', c: '#b8c2ca' } };
  var BACK = [{ id: 'glas', label: 'Glasboden', sub: 'Werk sichtbar' }, { id: 'zu', label: 'Geschlossen', sub: 'Platz für Gravur' }];
  var ROTOR = [{ id: 'standard', label: 'Standard', sub: 'inklusive' }, { id: 'farbig', label: 'Farbig', sub: '+CHF 35.–' }];
  var RCOL = [{ id: 'blau', label: 'Blau', c: '#2d5e92' }, { id: 'gold', label: 'Gold', c: '#cfa65a' }, { id: 'rose', label: 'Roségold', c: '#d9a48a' }, { id: 'schwarz', label: 'Schwarz', c: '#2a2c30' }];
  var BASE = 395, ROTOR_ADD = 35;
  var DEFAULT = { model: 'classico', size: '39', bezel: 'keramik', dial: 'eisblau', strap: 'kautschuk', back: 'glas', rotor: 'standard', rcol: 'blau', view: 'front', dialText: '', engraving: '' };
  var STEPS = ['Euer Anlass', 'Gestaltung & Wünsche', 'Kontakt', 'Prüfen'];
  var NAV = ['modelle', 'anlaesse', 'konfigurator', 'sofort', 'projekte', 'zubehoer', 'ablauf', 'atelier', 'materialien', 'beispiele'];
  function byId(arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return arr[0]; }
  function assign(a, b) { var o = {}, k; for (k in a) o[k] = a[k]; for (k in b) o[k] = b[k]; return o; }
  function chf(n) { return 'CHF ' + n + '.–'; }

  /* ───────────── Hilfen ───────────── */
  function setT(key, text) { $$('[data-t="' + key + '"]').forEach(function (el) { el.textContent = text; }); }
  function setIf(key, on) { $$('[data-if="' + key + '"]').forEach(function (el) { el.hidden = !on; }); }
  function focusLater(id, delay) {
    setTimeout(function () { var el = d.getElementById(id); if (el) { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } } }, delay == null ? 450 : delay);
  }
  function scrollToId(id) {
    var el = d.getElementById(id); if (!el) return;
    var hh = (d.querySelector('header') || {}).offsetHeight || 76;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - hh - 8, behavior: reduced ? 'auto' : 'smooth' });
  }

  /* ───────────── Menü ───────────── */
  var menuBtn = $('#menu-btn'), menu = $('#aw-menu'), menuIcon = $('#menu-icon'), menuLabel = $('#menu-label');
  var menuOpen = false;
  function lockPage(on) {
    d.body.style.overflow = on ? 'hidden' : '';
    ['aw-main', 'aw-footer'].forEach(function (id) {
      var el = d.getElementById(id); if (!el) return;
      el.inert = on; if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert');
    });
  }
  function openMenu() {
    menuOpen = true; menu.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true'); menuLabel.textContent = 'Schliessen';
    menuIcon.setAttribute('d', 'M4 1l14 12M18 1L4 13');
    lockPage(true);
    var first = $('a', menu); if (first) first.focus();
  }
  function closeMenu(refocus) {
    if (!menuOpen) return;
    menuOpen = false; menu.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false'); menuLabel.textContent = 'Menü';
    menuIcon.setAttribute('d', 'M0 2h22M0 7h22M0 12h22');
    lockPage(false);
    if (refocus) menuBtn.focus();
  }
  menuBtn.addEventListener('click', function () { if (menuOpen) closeMenu(true); else openMenu(); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { closeMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) closeMenu(true); });
  var mqWide = mq('(min-width: 1120px)');
  onMq(mqWide, function () { if (mqWide.matches) closeMenu(false); });

  /* ───────────── aktiver Bereich in der Navigation ───────────── */
  var navLinks = $$('[data-nav]');
  function setActive(id) {
    navLinks.forEach(function (a) { if (a.getAttribute('data-nav') === id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); }); }, { rootMargin: '-40% 0px -55% 0px' });
    NAV.concat(['inhalt', 'fragen', 'anfrage']).forEach(function (id) { var el = d.getElementById(id); if (el) io.observe(el); });
  }

  /* ───────────── Ablauf-Linien ───────────── */
  var proc = d.getElementById('process');
  if (proc) {
    if ('IntersectionObserver' in window) {
      var pio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { proc.classList.add('is-on'); pio.disconnect(); } }, { threshold: 0.3 });
      pio.observe(proc);
    } else proc.classList.add('is-on');
  }

  /* ───────────── Konfigurator (konfigurator.html) ───────────── */
  function initCfg() {
  var cfg = assign(DEFAULT, {}), engFocused = false;
  var annT = null, noticeT = null;
  var dialInput = d.getElementById('cfg-dialtext'), engInput = d.getElementById('cfg-engraving');
  var watchImg = d.getElementById('watch-img');
  var svgF = d.getElementById('svg-front'), svgB = d.getElementById('svg-back');
  var CX = 210, CY = 300;

  function M() { return MODELS[cfg.model]; }
  function size() { return byId(M().sizes, cfg.size); }
  function dial() { return byId(M().dials, cfg.dial); }
  function price() { return BASE + (cfg.rotor === 'farbig' ? ROTOR_ADD : 0); }
  function caseLabel() { return M().metal + ' ' + size().label + (cfg.model === 'wsport' ? ', Lünette ' + byId(BEZEL, cfg.bezel).label : ''); }
  function rotorLabel() { return cfg.rotor === 'farbig' ? 'Farbig, ' + byId(RCOL, cfg.rcol).label + ' (+CHF 35.–)' : 'Standard'; }
  function backLabel() { return cfg.back === 'glas' ? 'Glasboden' : 'Geschlossen (' + M().back + ')'; }
  function cfgSentence() {
    return M().label + ', ' + caseLabel() + ', Zifferblatt ' + dial().label + ', Armband ' + STRAPS[cfg.strap].label + ', ' + backLabel() + ', Rotor ' + rotorLabel();
  }
  function cfgRows() {
    return [
      { k: 'Modell', v: M().label }, { k: 'Gehäuse', v: caseLabel() }, { k: 'Zifferblatt', v: dial().label + ' (' + size().sub.replace('Zifferblatt ', '') + ')' },
      { k: 'Armband', v: STRAPS[cfg.strap].label + ', 20 mm' }, { k: 'Boden', v: backLabel() }, { k: 'Rotor', v: rotorLabel() },
      { k: 'Zifferblatt-Text', v: cfg.dialText.trim() ? cfg.dialText : 'kein Text' },
      { k: 'Gravur Boden', v: cfg.engraving.trim() ? cfg.engraving : 'keine Gravur' },
      { k: 'Richtpreis', v: chf(price()) + ' pro Uhr' }
    ];
  }

  /* Optionen (abhängig vom Modell) */
  function sw(bg) { return '<span aria-hidden="true" style="flex:none;width:22px;height:22px;border-radius:50%;background:' + bg + ';box-shadow:inset 0 0 0 1px rgba(28,30,34,0.25)"></span>'; }
  function optHtml(name, o, swatch) {
    return '<label class="opt" style="position:relative;flex:1 1 128px;min-width:0;display:flex;align-items:center;gap:10px;min-height:52px;padding:10px 14px;border-width:1px;border-style:solid;border-radius:2px;cursor:pointer;transition:border-color 200ms,background 200ms" data-hv="4">' +
      '<input type="radio" id="opt-' + name + '-' + o.id + '" name="' + name + '" value="' + o.id + '" style="position:absolute;inset:0;width:100%;height:100%;margin:0;appearance:none;-webkit-appearance:none;background:transparent;border:0;border-radius:2px;cursor:pointer">' +
      (swatch || '') + '<span class="opt-t" style="font-size:15px;line-height:1.25;color:#1c1e22">' + o.label + (o.sub ? '<span class="opt-sub">' + o.sub + '</span>' : '') + '</span>' +
      '<svg class="opt-ck" aria-hidden="true" width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="#1f3a5f" stroke-width="1.5" style="margin-left:auto;flex:none"><path d="M1 5l4 4 8-8"></path></svg></label>';
  }
  function dialSw(c) { return 'radial-gradient(circle at 35% 30%,' + shade(c, 0.45) + ',' + c + ' 55%,' + shade(c, -0.45) + ')'; }
  var lastModel = null;
  function renderOptions() {
    var m = M();
    function fill(key, list, swf) { $('[data-opts="' + key + '"]', cfgEl).innerHTML = list.map(function (o) { return optHtml(key, o, swf ? swf(o) : ''); }).join(''); }
    if (lastModel !== cfg.model) {
      fill('model', MODEL_OPTS, function (o) { return sw(o.id === 'classico' ? 'linear-gradient(135deg,#c9c6c0,#8d8a85 55%,#b9b6b0)' : 'linear-gradient(135deg,#eef2f5,#9aa6b0 50%,#d8dee3)'); });
      fill('size', m.sizes.map(function (s) { return { id: s.id, label: m.metal + ' ' + s.label, sub: s.sub }; }), function () { return sw(cfg.model === 'classico' ? 'linear-gradient(135deg,#c9c6c0,#8d8a85)' : 'linear-gradient(135deg,#eef2f5,#9aa6b0)'); });
      fill('bezel', BEZEL, function (o) { return sw(o.id === 'alu' ? 'linear-gradient(135deg,#3a4350,#1d232b)' : 'radial-gradient(circle at 30% 25%,#5d6670,#0d0f12 60%)'); });
      fill('dial', m.dials, function (o) { return sw(dialSw(o.c)); });
      fill('strap', m.straps.map(function (id) { return { id: id, label: STRAPS[id].label }; }), function (o) { return sw(o.id === 'stahl' ? 'linear-gradient(135deg,#eef2f5,#9aa6b0 50%,#d8dee3)' : STRAPS[o.id].c); });
      fill('back', BACK.map(function (o) { return o.id === 'zu' ? { id: 'zu', label: 'Geschlossen', sub: m.metal + ', Platz für Gravur' } : o; }), function (o) { return sw(o.id === 'glas' ? 'radial-gradient(circle,#b9c7d4 0 30%,#2d5e92 31% 60%,#c5ced6 61%)' : 'linear-gradient(135deg,#eef2f5,#9aa6b0)'); });
      fill('rotor', ROTOR, function (o) { return sw(o.id === 'standard' ? 'linear-gradient(135deg,#eef2f5,#aab4bd)' : 'conic-gradient(#2d5e92 0 25%,#cfa65a 0 50%,#d9a48a 0 75%,#2a2c30 0)'); });
      fill('rcol', RCOL, function (o) { return sw('linear-gradient(135deg,' + shade(o.c, 0.3) + ',' + o.c + ' 60%,' + shade(o.c, -0.3) + ')'); });
      lastModel = cfg.model;
    }
    ['model', 'size', 'bezel', 'dial', 'strap', 'back', 'rotor', 'rcol'].forEach(function (name) {
      $$('input[name="' + name + '"]', cfgEl).forEach(function (inp) {
        var on = inp.value === cfg[name]; inp.checked = on; inp.parentNode.classList.toggle('is-checked', on);
      });
    });
    d.getElementById('grp-bezel').hidden = cfg.model !== 'wsport';
    d.getElementById('grp-rcol').hidden = cfg.rotor !== 'farbig';
    setIf('rotorHint', cfg.back !== 'glas');
  }
  cfgEl.addEventListener('change', function (e) {
    var t = e.target; if (!t || t.type !== 'radio' || !t.checked) return;
    var p = {}; p[t.name] = t.value;
    if (t.name === 'model') p = modelPatch(t.value);
    if (t.name === 'rotor' && t.value === 'farbig' && cfg.back !== 'glas') p.back = 'glas';
    if (t.name === 'rotor' || t.name === 'rcol') p.view = 'back';
    setCfg(p);
  });
  function modelPatch(id) {
    var m = MODELS[id], p = { model: id };
    if (!m.sizes.some(function (s) { return s.id === cfg.size; })) p.size = m.sizes[m.sizes.length - 1].id;
    if (!m.dials.some(function (x) { return x.id === cfg.dial; })) p.dial = m.dials[0].id;
    if (m.straps.indexOf(cfg.strap) < 0) p.strap = m.straps[0];
    return p;
  }

  /* SVG-Hilfen */
  var NS = 'http://www.w3.org/2000/svg';
  function shade(hex, f) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function m(c) { return Math.round(f >= 0 ? c + (255 - c) * f : c * (1 + f)); }
    return '#' + ((1 << 24) + (m(r) << 16) + (m(g) << 8) + m(b)).toString(16).slice(1);
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function polar(r, deg) { var a = (deg - 90) * Math.PI / 180; return [CX + r * Math.cos(a), CY + r * Math.sin(a)]; }
  function f1(n) { return n.toFixed(1); }

  function metalDefs(id, ti) {
    var s = ti ? ['#d4d1cb', '#8f8b85', '#c3bfb8', '#6f6c67', '#b5b1aa'] : ['#f4f7f9', '#a7b2bc', '#eef2f5', '#7d8995', '#dfe5ea'];
    return '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' + s.map(function (c, i) { return '<stop offset="' + (i / 4) + '" stop-color="' + c + '"/>'; }).join('') + '</linearGradient>';
  }
  function strapSvg(back) {
    var w = Math.round(size().r * 0.98), x = CX - w / 2, top = [-20, CY - size().r + 18], bot = [CY + size().r - 18, 620], o = '';
    var s = cfg.strap, col = STRAPS[s].c;
    [top, bot].forEach(function (seg, i) {
      var y0 = seg[0], y1 = seg[1];
      if (s === 'stahl') {
        for (var y = y0; y < y1; y += 24) {
          o += '<rect x="' + (x - 2) + '" y="' + y + '" width="' + (w * 0.3) + '" height="22" rx="2" fill="url(#g-steel)" stroke="#6f7b86" stroke-width="0.6"/>';
          o += '<rect x="' + (x + w * 0.3) + '" y="' + y + '" width="' + (w * 0.4 + 0) + '" height="22" rx="2" fill="url(#g-steel2)" stroke="#6f7b86" stroke-width="0.6"/>';
          o += '<rect x="' + (x + w * 0.7 + 2) + '" y="' + y + '" width="' + (w * 0.3) + '" height="22" rx="2" fill="url(#g-steel)" stroke="#6f7b86" stroke-width="0.6"/>';
        }
      } else {
        o += '<rect x="' + x + '" y="' + y0 + '" width="' + w + '" height="' + (y1 - y0) + '" rx="' + (s === 'kautschuk' ? 10 : 6) + '" fill="' + col + '"/>';
        o += '<rect x="' + x + '" y="' + y0 + '" width="' + w + '" height="' + (y1 - y0) + '" rx="6" fill="url(#g-strapsheen)"/>';
        if (s === 'leder') o += '<rect x="' + (x + 6) + '" y="' + (y0 + 4) + '" width="' + (w - 12) + '" height="' + (y1 - y0 - 8) + '" rx="4" fill="none" stroke="#e8d8c4" stroke-width="1" stroke-dasharray="4 3" opacity="0.7"/>';
        if (s === 'stoff') o += '<rect x="' + x + '" y="' + y0 + '" width="' + w + '" height="' + (y1 - y0) + '" fill="url(#g-weave)" rx="6"/>';
        if (s === 'kautschuk') { o += '<path d="M' + (x + w * 0.3) + ' ' + y0 + 'V' + y1 + 'M' + (x + w * 0.7) + ' ' + y0 + 'V' + y1 + '" stroke="rgba(255,255,255,0.08)" stroke-width="3"/>'; }
        if (i === 1 && !back) for (var k = 0; k < 3; k++) o += '<ellipse cx="' + CX + '" cy="' + (y0 + 70 + k * 30) + '" rx="3.2" ry="4.4" fill="rgba(0,0,0,0.45)"/>';
      }
    });
    return o;
  }
  function caseSvg(back) {
    var r = size().r, ti = cfg.model === 'classico', o = '';
    // Hörner
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) {
      var lx = CX + q[0] * (size().r * 0.49 + 8), ly = CY + q[1] * (r * 0.78);
      o += '<path d="M' + f1(lx - 15) + ' ' + f1(CY + q[1] * r * 0.45) + ' L' + f1(lx - 13) + ' ' + f1(ly + q[1] * 30) + ' Q' + f1(lx) + ' ' + f1(ly + q[1] * 40) + ' ' + f1(lx + 13) + ' ' + f1(ly + q[1] * 30) + ' L' + f1(lx + 15) + ' ' + f1(CY + q[1] * r * 0.45) + 'Z" fill="url(#g-case)" stroke="rgba(0,0,0,0.3)" stroke-width="0.8"/>';
    });
    var crownX = back ? CX - r - 16 : CX + r - 2;
    o += '<rect x="' + crownX + '" y="' + (CY - 15) + '" width="18" height="30" rx="4" fill="url(#g-case)" stroke="rgba(0,0,0,0.35)" stroke-width="0.8"/>';
    o += '<path d="M' + (crownX + 4) + ' ' + (CY - 13) + 'V' + (CY + 13) + 'M' + (crownX + 8) + ' ' + (CY - 13) + 'V' + (CY + 13) + 'M' + (crownX + 12) + ' ' + (CY - 13) + 'V' + (CY + 13) + '" stroke="rgba(0,0,0,0.3)" stroke-width="0.8"/>';
    if (cfg.model === 'wsport' && !back) o += '<rect x="' + (CX + r - 4) + '" y="' + (CY - 30) + '" width="10" height="60" rx="5" fill="url(#g-case)" opacity="0.9"/>';
    o += '<circle cx="' + CX + '" cy="' + CY + '" r="' + r + '" fill="url(#g-case)" stroke="rgba(0,0,0,0.35)" stroke-width="1"/>';
    o += '<circle cx="' + CX + '" cy="' + CY + '" r="' + (r - 2) + '" fill="none" stroke="rgba(255,255,255,' + (ti ? 0.25 : 0.55) + ')" stroke-width="1.2"/>';
    return o;
  }
  function bezelSvg() {
    var r = size().r, o = '';
    if (cfg.model === 'wsport') {
      var ro = r - 3, ri = 112, cer = cfg.bezel === 'keramik';
      // geriffelte Kante
      for (var k = 0; k < 120; k++) { var a = polar(r + 1.5, k * 3), b = polar(r - 3, k * 3); o += '<line x1="' + f1(a[0]) + '" y1="' + f1(a[1]) + '" x2="' + f1(b[0]) + '" y2="' + f1(b[1]) + '" stroke="rgba(0,0,0,0.25)" stroke-width="1"/>'; }
      o += '<circle cx="' + CX + '" cy="' + CY + '" r="' + f1((ro + ri) / 2) + '" fill="none" stroke="url(#g-bezel)" stroke-width="' + (ro - ri) + '"/>';
      if (cer) o += '<path d="M' + f1(polar(ro - 2, -60)[0]) + ' ' + f1(polar(ro - 2, -60)[1]) + ' A' + (ro - 2) + ' ' + (ro - 2) + ' 0 0 1 ' + f1(polar(ro - 2, 20)[0]) + ' ' + f1(polar(ro - 2, 20)[1]) + '" stroke="rgba(255,255,255,0.35)" stroke-width="2" fill="none"/>';
      var ink = cer ? '#e8ecef' : '#d9e0e6';
      for (var m = 0; m < 60; m++) {
        if (m === 0) { var p1 = polar(ro - 4, 0), p2 = polar(ri + 10, -5), p3 = polar(ri + 10, 5); o += '<path d="M' + f1(p1[0]) + ' ' + f1(p1[1]) + ' L' + f1(p2[0]) + ' ' + f1(p2[1]) + ' L' + f1(p3[0]) + ' ' + f1(p3[1]) + 'Z" fill="' + ink + '"/>'; continue; }
        if (m % 10 === 0) { var t = polar((ro + ri) / 2, m * 6); o += '<text x="' + f1(t[0]) + '" y="' + f1(t[1]) + '" transform="rotate(' + (m * 6) + ' ' + f1(t[0]) + ' ' + f1(t[1]) + ')" text-anchor="middle" dominant-baseline="central" font-family="\'Source Sans 3\',sans-serif" font-weight="600" font-size="17" fill="' + ink + '">' + m + '</text>'; continue; }
        if (m < 15 || m % 5 === 0) { var a1 = polar(ro - 5, m * 6), a2 = polar(m % 5 === 0 ? ri + 12 : ro - 12, m * 6); o += '<line x1="' + f1(a1[0]) + '" y1="' + f1(a1[1]) + '" x2="' + f1(a2[0]) + '" y2="' + f1(a2[1]) + '" stroke="' + ink + '" stroke-width="' + (m % 5 === 0 ? 4 : 1.6) + '"/>'; }
      }
      o += '<circle cx="' + CX + '" cy="' + CY + '" r="' + ri + '" fill="none" stroke="url(#g-case)" stroke-width="5"/>';
    } else {
      var dr = size().dr;
      o += '<circle cx="' + CX + '" cy="' + CY + '" r="' + f1((r + dr) / 2) + '" fill="none" stroke="url(#g-case2)" stroke-width="' + (r - dr - 2) + '"/>';
      o += '<circle cx="' + CX + '" cy="' + CY + '" r="' + (dr + 1) + '" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="1.5"/>';
    }
    return o;
  }
  function dialSvg() {
    var dr = size().dr, dl = dial(), light = !!dl.light, o = '';
    var ink = light ? '#24303c' : '#f2f5f7', idx = cfg.model === 'classico' ? 'url(#g-steel)' : '#f2f5f7';
    o += '<circle cx="' + CX + '" cy="' + CY + '" r="' + dr + '" fill="url(#g-dial)"/>';
    if (cfg.model === 'classico') {
      // gehämmerte Struktur
      var seed = 7; function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
      for (var i = 0; i < 150; i++) {
        var rr = Math.sqrt(rnd()) * (dr - 6), aa = rnd() * 360, p = polar(rr, aa), sz = 7 + rnd() * 7;
        o += '<ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" rx="' + f1(sz) + '" ry="' + f1(sz * 0.8) + '" transform="rotate(' + f1(aa) + ' ' + f1(p[0]) + ' ' + f1(p[1]) + ')" fill="url(#g-cell)" opacity="0.55"/>';
      }
    } else {
      for (var j = 0; j < 90; j++) { var q = polar(dr, j * 4); o += '<line x1="' + CX + '" y1="' + CY + '" x2="' + f1(q[0]) + '" y2="' + f1(q[1]) + '" stroke="' + (light ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.05)') + '" stroke-width="1"/>'; }
    }
    o += '<circle cx="' + CX + '" cy="' + CY + '" r="' + dr + '" fill="url(#g-dialshine)"/>';
    // Minuterie
    for (var mm = 0; mm < 60; mm++) { if (mm % 5 === 0) continue; var a = polar(dr - 3, mm * 6), b = polar(dr - 8, mm * 6); o += '<line x1="' + f1(a[0]) + '" y1="' + f1(a[1]) + '" x2="' + f1(b[0]) + '" y2="' + f1(b[1]) + '" stroke="' + ink + '" stroke-opacity="0.55" stroke-width="1"/>'; }
    // Indexe
    var len = dr * 0.17;
    for (var h = 0; h < 12; h++) {
      if (h === 3) continue;
      var ang = h * 30, w = h === 0 ? 4.5 : 3.2;
      if (cfg.model === 'wsport' && h % 3 !== 0) { var c = polar(dr - 18, ang); o += '<circle cx="' + f1(c[0]) + '" cy="' + f1(c[1]) + '" r="6.5" fill="#eef3ea" stroke="#9aa6b0" stroke-width="1.4"/>'; continue; }
      var g = '<rect x="' + f1(CX - w) + '" y="' + f1(CY - dr + 10) + '" width="' + (w * 2) + '" height="' + f1(len) + '" rx="1" fill="' + idx + '" stroke="rgba(0,0,0,0.35)" stroke-width="0.6" transform="rotate(' + ang + ' ' + CX + ' ' + CY + ')"/>';
      if (h === 0) g = '<rect x="' + f1(CX - 9) + '" y="' + f1(CY - dr + 10) + '" width="7" height="' + f1(len) + '" rx="1" fill="' + idx + '" stroke="rgba(0,0,0,0.35)" stroke-width="0.6"/><rect x="' + f1(CX + 2) + '" y="' + f1(CY - dr + 10) + '" width="7" height="' + f1(len) + '" rx="1" fill="' + idx + '" stroke="rgba(0,0,0,0.35)" stroke-width="0.6"/>';
      o += g;
    }
    // Datum bei 3
    var dx = CX + dr - 10 - 30;
    o += '<rect x="' + f1(dx) + '" y="' + (CY - 11) + '" width="30" height="22" rx="1.5" fill="#f7f7f5" stroke="url(#g-steel)" stroke-width="2.5"/><text x="' + f1(dx + 15) + '" y="' + (CY + 1) + '" text-anchor="middle" dominant-baseline="central" font-family="\'Source Sans 3\',sans-serif" font-weight="600" font-size="15" fill="#1c1e22">14</text>';
    // Zifferblatt-Text auf Bogen über der Sechs
    var tr = dr * 0.52;
    o += '<path id="dt-arc" d="M' + f1(CX - tr) + ' ' + CY + ' A' + f1(tr) + ' ' + f1(tr) + ' 0 0 0 ' + f1(CX + tr) + ' ' + CY + '" fill="none"/>';
    var up = cfg.dialText.toLocaleUpperCase('de-CH');
    if (up) o += '<text font-family="\'Source Sans 3\',sans-serif" font-weight="600" letter-spacing="1.5" font-size="' + f1(Math.max(8, Math.min(13, (tr * 2.2) / Math.max(1, up.length) / 0.7))) + '" fill="' + ink + '"><textPath href="#dt-arc" startOffset="50%" text-anchor="middle">' + esc(up) + '</textPath></text>';
    // Signet
    o += '<text x="' + CX + '" y="' + f1(CY - dr * 0.42) + '" text-anchor="middle" font-family="\'Cormorant Garamond\',Georgia,serif" font-weight="600" font-size="' + f1(dr * 0.2) + '" fill="' + ink + '" opacity="0.9">W</text>';
    o += '<text x="' + CX + '" y="' + f1(CY - dr * 0.28) + '" text-anchor="middle" font-family="\'Source Sans 3\',sans-serif" font-weight="600" letter-spacing="2" font-size="' + f1(dr * 0.06) + '" fill="' + ink + '" opacity="0.75">AUTOMATIC</text>';
    // Zeiger 10:09
    var hc = light ? '#2b3540' : '#f1f4f6', hs = 'rgba(0,0,0,0.45)';
    function hand(ang, L, W, tail) { return '<path d="M' + (CX - W) + ' ' + (CY + tail) + ' L' + (CX - W * 0.8) + ' ' + (CY - L + 8) + ' L' + CX + ' ' + (CY - L) + ' L' + (CX + W * 0.8) + ' ' + (CY - L + 8) + ' L' + (CX + W) + ' ' + (CY + tail) + 'Z" fill="' + hc + '" stroke="' + hs + '" stroke-width="0.7" transform="rotate(' + ang + ' ' + CX + ' ' + CY + ')"/><path d="M' + CX + ' ' + (CY - 14) + 'V' + (CY - L + 12) + '" stroke="' + (light ? '#6c7a88' : '#c9d3dc') + '" stroke-width="' + (W * 0.7) + '" transform="rotate(' + ang + ' ' + CX + ' ' + CY + ')" opacity="0.6"/>'; }
    o += hand(304.5, dr * 0.56, 5, 12) + hand(54, dr * 0.84, 3.8, 14);
    o += '<g class="w-sec"><line x1="' + CX + '" y1="' + (CY + 24) + '" x2="' + CX + '" y2="' + f1(CY - dr + 8) + '" stroke="' + (cfg.model === 'wsport' ? '#c8102e' : hc) + '" stroke-width="1.4"/></g>';
    o += '<circle cx="' + CX + '" cy="' + CY + '" r="5" fill="url(#g-steel)" stroke="rgba(0,0,0,0.4)" stroke-width="0.6"/>';
    // Glas
    o += '<ellipse cx="' + (CX - 40) + '" cy="' + (CY - 60) + '" rx="' + f1(dr * 0.95) + '" ry="' + f1(dr * 0.5) + '" fill="url(#g-glass)" transform="rotate(-28 ' + (CX - 40) + ' ' + (CY - 60) + ')" clip-path="url(#c-dial)"/>';
    o += '<circle id="glow" cx="' + CX + '" cy="' + CY + '" r="90" fill="url(#g-glow)" clip-path="url(#c-dial)"/>';
    return o;
  }
  function defs() {
    var dl = dial(), ti = cfg.model === 'classico', cer = cfg.bezel === 'keramik';
    var rc = cfg.rotor === 'farbig' ? byId(RCOL, cfg.rcol).c : '#c3cbd2';
    return '<defs>' + metalDefs('g-case', ti) +
      '<linearGradient id="g-case2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + (ti ? '#8d8a85' : '#7d8995') + '"/><stop offset="0.35" stop-color="' + (ti ? '#e0ddd7' : '#f7f9fa') + '"/><stop offset="1" stop-color="' + (ti ? '#9b978f' : '#b9c3cc') + '"/></linearGradient>' +
      metalDefs('g-steel', false) + '<linearGradient id="g-steel2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9aa6b0"/><stop offset="0.5" stop-color="#f4f7f9"/><stop offset="1" stop-color="#9aa6b0"/></linearGradient>' +
      '<linearGradient id="g-bezel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + (cer ? '#3d4550' : '#2f3945') + '"/><stop offset="0.5" stop-color="' + (cer ? '#0b0d10' : '#1b222b') + '"/><stop offset="1" stop-color="' + (cer ? '#2a3038' : '#27303b') + '"/></linearGradient>' +
      '<radialGradient id="g-dial" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stop-color="' + shade(dl.c, 0.28) + '"/><stop offset="0.6" stop-color="' + dl.c + '"/><stop offset="1" stop-color="' + shade(dl.c, -0.4) + '"/></radialGradient>' +
      '<radialGradient id="g-cell" cx="0.35" cy="0.3" r="0.7"><stop offset="0" stop-color="#ffffff" stop-opacity="0.45"/><stop offset="0.6" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity="0.25"/></radialGradient>' +
      '<linearGradient id="g-dialshine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="0.5" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity="0.25"/></linearGradient>' +
      '<radialGradient id="g-glass" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffffff" stop-opacity="0.2"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="g-glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffffff" stop-opacity="0.2"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="g-shadow" cx="0.5" cy="0.5" r="0.5"><stop offset="0.6" stop-color="#000" stop-opacity="0.35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="g-strapsheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.35"/><stop offset="0.3" stop-color="#fff" stop-opacity="0.08"/><stop offset="0.7" stop-color="#fff" stop-opacity="0.02"/><stop offset="1" stop-color="#000" stop-opacity="0.35"/></linearGradient>' +
      '<pattern id="g-weave" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 3h6" stroke="rgba(255,255,255,0.12)" stroke-width="1.4"/><path d="M3 0v6" stroke="rgba(0,0,0,0.12)" stroke-width="1"/></pattern>' +
      '<linearGradient id="g-rotor" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + shade(rc, 0.35) + '"/><stop offset="0.5" stop-color="' + rc + '"/><stop offset="1" stop-color="' + shade(rc, -0.35) + '"/></linearGradient>' +
      '<radialGradient id="g-mvt" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#9aa4ad"/><stop offset="1" stop-color="#5d6770"/></radialGradient>' +
      '<clipPath id="c-dial"><circle cx="' + CX + '" cy="' + CY + '" r="' + size().dr + '"/></clipPath>' +
      '</defs>';
  }
  function backSvg() {
    var r = size().r, o = '', glas = cfg.back === 'glas', ir = glas ? Math.round(r * 0.66) : 0;
    o += '<circle cx="' + CX + '" cy="' + CY + '" r="' + (r - 8) + '" fill="url(#g-case2)" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>';
    for (var k = 0; k < 6; k++) { var a = polar(r - 13, k * 60 + 30); o += '<rect x="' + f1(a[0] - 6) + '" y="' + f1(a[1] - 3) + '" width="12" height="6" rx="1" fill="rgba(0,0,0,0.28)" transform="rotate(' + (k * 60 + 30) + ' ' + f1(a[0]) + ' ' + f1(a[1]) + ')"/>'; }
    var eng = cfg.engraving.trim();
    if (glas) {
      o += '<circle cx="' + CX + '" cy="' + CY + '" r="' + (ir + 3) + '" fill="#2a3138" stroke="rgba(255,255,255,0.4)" stroke-width="1.2"/>';
      o += '<circle cx="' + CX + '" cy="' + CY + '" r="' + ir + '" fill="url(#g-mvt)"/>';
      for (var s = 0; s < 18; s++) { var p = polar(ir, s * 20), q = polar(ir * 0.2, s * 20); o += '<line x1="' + f1(q[0]) + '" y1="' + f1(q[1]) + '" x2="' + f1(p[0]) + '" y2="' + f1(p[1]) + '" stroke="rgba(255,255,255,0.08)" stroke-width="5"/>'; }
      [[-0.55, 0.45], [0.5, 0.55], [0.15, -0.6], [-0.35, -0.5]].forEach(function (j) { o += '<circle cx="' + f1(CX + j[0] * ir) + '" cy="' + f1(CY + j[1] * ir) + '" r="3.2" fill="#a3122b" stroke="#e8c7cc" stroke-width="1"/>'; });
      o += '<circle cx="' + f1(CX - ir * 0.45) + '" cy="' + f1(CY + ir * 0.35) + '" r="' + f1(ir * 0.24) + '" fill="none" stroke="#c9a35a" stroke-width="2.4"/>';
      // Rotor (halbe Scheibe mit Rippen)
      var R = ir - 4, ro = '<path d="M' + f1(CX - R) + ' ' + CY + ' A' + R + ' ' + R + ' 0 0 1 ' + f1(CX + R) + ' ' + CY + ' L' + (CX + 14) + ' ' + CY + ' A14 14 0 0 0 ' + (CX - 14) + ' ' + CY + 'Z" fill="url(#g-rotor)" stroke="rgba(0,0,0,0.35)" stroke-width="0.8"/>';
      for (var f = 1; f < 12; f++) { var ang = -90 + f * 15, p1 = polar(18, ang), p2 = polar(R - 10, ang); ro += '<line x1="' + f1(p1[0]) + '" y1="' + f1(p1[1]) + '" x2="' + f1(p2[0]) + '" y2="' + f1(p2[1]) + '" stroke="rgba(0,0,0,0.22)" stroke-width="1"/><line x1="' + f1(p1[0] + 1.2) + '" y1="' + f1(p1[1]) + '" x2="' + f1(p2[0] + 1.2) + '" y2="' + f1(p2[1]) + '" stroke="rgba(255,255,255,0.25)" stroke-width="0.8"/>'; }
      ro += '<path d="M' + f1(CX - R + 8) + ' ' + CY + ' A' + (R - 8) + ' ' + (R - 8) + ' 0 0 1 ' + f1(CX + R - 8) + ' ' + CY + '" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>';
      o += '<g class="w-rotor">' + ro + '</g>';
      o += '<circle cx="' + CX + '" cy="' + CY + '" r="12" fill="url(#g-steel)" stroke="rgba(0,0,0,0.45)" stroke-width="0.8"/><circle cx="' + CX + '" cy="' + CY + '" r="4" fill="#4b5560"/>';
      o += '<ellipse cx="' + (CX - 30) + '" cy="' + (CY - 40) + '" rx="' + f1(ir * 0.9) + '" ry="' + f1(ir * 0.45) + '" fill="url(#g-glass)" transform="rotate(-28 ' + (CX - 30) + ' ' + (CY - 40) + ')"/>';
      // Gravur auf dem Rand
      var gr = (r - 8 + ir + 3) / 2;
      o += '<path id="eng-arc" d="M' + f1(CX - gr) + ' ' + CY + ' A' + f1(gr) + ' ' + f1(gr) + ' 0 0 1 ' + f1(CX + gr) + ' ' + CY + '" fill="none"/>';
      o += '<path id="eng-arc2" d="M' + f1(CX - gr) + ' ' + CY + ' A' + f1(gr) + ' ' + f1(gr) + ' 0 0 0 ' + f1(CX + gr) + ' ' + CY + '" fill="none"/>';
      var meta = (cfg.model === 'wsport' ? 'STAHL' : 'TITAN') + ' · SAPHIRGLAS · NH35 AUTOMATIC';
      o += '<text font-family="\'Source Sans 3\',sans-serif" font-weight="600" font-size="9.5" letter-spacing="1.6" fill="#3b444d" opacity="0.8" dominant-baseline="central"><textPath href="#eng-arc2" startOffset="50%" text-anchor="middle">' + meta + '</textPath></text>';
      o += '<text font-family="\'Source Sans 3\',sans-serif" font-weight="600" font-size="' + f1(Math.max(9, Math.min(14, (gr * 2.6) / Math.max(1, eng.length) / 0.62))) + '" letter-spacing="1.2" fill="' + (eng ? '#29323a' : 'rgba(41,50,58,0.45)') + '" dominant-baseline="central"><textPath href="#eng-arc" startOffset="50%" text-anchor="middle">' + esc(eng ? eng.toLocaleUpperCase('de-CH') : 'EURE GRAVUR') + '</textPath></text>';
    } else {
      for (var c = 1; c < 5; c++) o += '<circle cx="' + CX + '" cy="' + CY + '" r="' + f1((r - 8) * (0.4 + c * 0.13)) + '" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.8"/>';
      var lines = wrapEngraving(cfg.engraving), longest = Math.max.apply(null, [1].concat(lines.map(function (l) { return l.length; })));
      var fs = Math.max(10, Math.min(20, 150 / (longest * 0.6))), lh = fs * 1.4, y0 = CY - (lines.length - 1) * lh / 2 + fs * 0.35;
      if (!lines.length) o += '<text x="' + CX + '" y="' + (CY + 5) + '" text-anchor="middle" font-family="\'Source Sans 3\',sans-serif" font-weight="500" font-size="15" letter-spacing="1" fill="#29323a" opacity="0.45">Eure Gravur</text>';
      lines.forEach(function (t, i) {
        var base = ' text-anchor="middle" font-family="\'Source Sans 3\',sans-serif" font-weight="500" font-size="' + f1(fs) + '" letter-spacing="1"';
        o += '<text x="' + (CX + 0.7) + '" y="' + f1(y0 + i * lh + 0.8) + '"' + base + ' fill="rgba(255,255,255,0.75)">' + esc(t) + '</text><text x="' + CX + '" y="' + f1(y0 + i * lh) + '"' + base + ' fill="#29323a">' + esc(t) + '</text>';
      });
      o += '<text x="' + CX + '" y="' + f1(CY + r * 0.62) + '" text-anchor="middle" font-family="\'Source Sans 3\',sans-serif" font-weight="600" font-size="9.5" letter-spacing="1.6" fill="#3b444d" opacity="0.75">' + (cfg.model === 'wsport' ? 'STAHL' : 'TITAN') + ' · NH35 AUTOMATIC</text>';
    }
    return o;
  }
  function wrapEngraving(text) {
    var t = text.trim(); if (!t) return [];
    for (var max = 14; max <= 42; max++) {
      var lines = [], cur = '', words = t.split(/\s+/);
      for (var i = 0; i < words.length; i++) {
        var word = words[i];
        while (word.length > max) { if (cur) { lines.push(cur); cur = ''; } lines.push(word.slice(0, max)); word = word.slice(max); }
        if (!word) continue;
        if (!cur) cur = word; else if ((cur + ' ' + word).length <= max) cur += ' ' + word; else { lines.push(cur); cur = word; }
      }
      if (cur) lines.push(cur);
      if (lines.length <= 3) return lines;
    }
    return [t];
  }
  function drawWatch() {
    var shadow = '<ellipse cx="' + (CX - 4) + '" cy="' + (CY + 12) + '" rx="' + (size().r + 26) + '" ry="' + (size().r + 26) + '" fill="url(#g-shadow)"/>';
    svgF.innerHTML = defs() + shadow + strapSvg(false) + caseSvg(false) + bezelSvg() + dialSvg();
    svgB.innerHTML = defs().replace(/id="(g-[a-z0-9]+|c-dial)"/g, 'id="b$1"').replace(/url\(#(g-[a-z0-9]+|c-dial)\)/g, 'url(#b$1)') +
      (shadow + strapSvg(true) + caseSvg(true) + backSvg()).replace(/url\(#(g-[a-z0-9]+|c-dial)\)/g, 'url(#b$1)');
  }

  function renderCfg() {
    cfgEl.setAttribute('data-model', cfg.model); cfgEl.setAttribute('data-view', cfg.view);
    renderOptions(); drawWatch();
    var front = cfg.view === 'front';
    d.getElementById('view-front').setAttribute('aria-pressed', String(front));
    d.getElementById('view-back').setAttribute('aria-pressed', String(!front));
    setT('dialCount', cfg.dialText.length + ' / 20');
    setT('engCount', cfg.engraving.length + ' / 42');
    setIf('offerBack', engFocused && front);
    setT('modelName', M().label);
    setT('price', chf(price()));
    setT('priceDetail', cfg.rotor === 'farbig' ? 'Grundpreis CHF 395.– und farbiger Rotor +CHF 35.–' : 'Grundpreis CHF 395.–, Standard-Rotor');
    watchImg.setAttribute('aria-label', 'Skizze der Uhr, Ansicht ' + (front ? 'Zifferblatt' : 'Gehäuseboden') + ': ' + cfgSentence() + '. Zifferblatt-Text: ' + (cfg.dialText.trim() || 'kein Text') + '. Gravur: ' + (cfg.engraving.trim() || 'keine Gravur') + '. Richtpreis ' + chf(price()) + '.');
    setT('cfgLine', [M().label, size().label, dial().label, STRAPS[cfg.strap].label, cfg.back === 'glas' ? 'Glasboden' : 'Boden geschlossen', cfg.rotor === 'farbig' ? 'Rotor ' + byId(RCOL, cfg.rcol).label : 'Rotor Standard'].join(' · '));
  }
  var lastPrice = null;
  function setCfg(patch) {
    var viewOnly = Object.keys(patch).length === 1 && 'view' in patch;
    cfg = assign(cfg, patch);
    renderCfg();
    var p = price();
    if (lastPrice !== null && p !== lastPrice) $$('.cfg-price-v').forEach(function (el) { el.classList.add('bump'); setTimeout(function () { el.classList.remove('bump'); }, 180); });
    lastPrice = p;
    clearTimeout(annT);
    annT = setTimeout(function () {
      setT('announce', viewOnly ? 'Ansicht: ' + (cfg.view === 'back' ? 'Gehäuseboden' : 'Zifferblatt') : 'Vorschau aktualisiert: ' + cfgSentence() + '. Richtpreis ' + chf(price()) + '.');
    }, viewOnly ? 400 : 800);
  }
  function showNotice(text) {
    clearTimeout(noticeT); setT('cfgNotice', text);
    noticeT = setTimeout(function () { setT('cfgNotice', ''); }, 2600);
  }
  window.awSetModel = function (id) { setCfg(assign(modelPatch(id), { view: 'front' })); };

  d.getElementById('view-front').addEventListener('click', function () { setCfg({ view: 'front' }); });
  d.getElementById('view-back').addEventListener('click', function () { setCfg({ view: 'back' }); });
  dialInput.addEventListener('input', function () { setCfg({ dialText: dialInput.value.slice(0, 20) }); });
  engInput.addEventListener('input', function () { setCfg({ engraving: engInput.value.slice(0, 42) }); });
  engInput.addEventListener('focus', function () { engFocused = true; renderCfg(); });
  d.getElementById('offer-back').addEventListener('click', function () { setCfg({ view: 'back' }); focusLater('cfg-engraving', 30); });

  var resetBtn = d.getElementById('reset-btn');
  function doReset() { engFocused = false; dialInput.value = ''; engInput.value = ''; setCfg(assign(DEFAULT, { model: cfg.model, size: modelPatch(cfg.model).size || cfg.size, dial: MODELS[cfg.model].dials[0].id, strap: MODELS[cfg.model].straps[0] })); }
  resetBtn.addEventListener('click', function () {
    if (cfg.dialText || cfg.engraving) { setIf('confirmReset', true); d.getElementById('reset-yes').focus(); }
    else doReset();
  });
  d.getElementById('reset-yes').addEventListener('click', function () { setIf('confirmReset', false); doReset(); resetBtn.focus(); });
  d.getElementById('reset-no').addEventListener('click', function () { setIf('confirmReset', false); resetBtn.focus(); });

  var watchBox = $('.watch-box', cfgEl);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { watchBox.classList.toggle('is-paused', !es[0].isIntersecting); }).observe(watchBox);
  }
  var faceFront = d.getElementById('face-front'), rect = null, raf = null;
  if (fine && !reduced) {
    faceFront.addEventListener('mouseenter', function () { rect = faceFront.getBoundingClientRect(); var g = d.getElementById('glow'); if (g) g.style.opacity = '1'; });
    faceFront.addEventListener('mousemove', function (e) {
      if (!rect) return;
      var x = (e.clientX - rect.left) / rect.width * 420, y = (e.clientY - rect.top) / rect.height * 600;
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = null; var g = d.getElementById('glow'); if (g) g.style.transform = 'translate(' + (x - 210) + 'px, ' + (y - 300) + 'px)'; });
    });
    faceFront.addEventListener('mouseleave', function () { rect = null; var g = d.getElementById('glow'); if (g) g.style.opacity = '0'; });
  }

  // Zustand der Sitzung wiederherstellen, Modell aus ?modell= vorwählen
  try { var saved = JSON.parse(sessionStorage.getItem('aw-cfg-state') || 'null'); if (saved && MODELS[saved.model]) { cfg = assign(cfg, saved); cfg.view = 'front'; dialInput.value = cfg.dialText || ''; engInput.value = cfg.engraving || ''; } } catch (e) {}
  var qm = new URLSearchParams(location.search).get('modell');
  if (qm && MODELS[qm]) cfg = assign(cfg, modelPatch(qm));
  function persist() { try { sessionStorage.setItem('aw-cfg-state', JSON.stringify(cfg)); } catch (e) {} }
  cfgEl.addEventListener('change', persist); dialInput.addEventListener('input', persist); engInput.addEventListener('input', persist);
  // Übergabe an kontakt.html
  d.getElementById('adopt').addEventListener('click', function () {
    persist();
    var data = { rows: cfgRows(), mini: { strap: STRAPS[cfg.strap].c, kase: cfg.model === 'classico' ? '#a9a6a0' : '#c5ced6', bezel: cfg.model === 'wsport' ? (cfg.bezel === 'keramik' ? '#0e1013' : '#26303b') : '#b9b6b0', dial: dial().c, light: !!dial().light } };
    try { sessionStorage.setItem('aw-cfg', JSON.stringify(data)); } catch (e) {}
    showNotice('Konfiguration übernommen');
    location.href = 'kontakt.html?konfig=1#anfrage';
  });
  $$('a[data-model]').forEach(function (a) { a.addEventListener('click', function (ev) { ev.preventDefault(); window.awSetModel(a.getAttribute('data-model')); scrollToId('cfg'); }); });
  if (location.hash === '#grp-dial') setTimeout(function () { scrollToId('grp-dial'); }, 300);
  renderCfg();
  }

  /* ───────────── Anfrageformular (kontakt.html) ───────────── */
  function initForm() {
  var stored = null, adopted = false;
  try { stored = JSON.parse(sessionStorage.getItem('aw-cfg') || 'null'); adopted = !!(stored && stored.rows); } catch (e) {}
  function cfgRows() { return stored.rows; }
  var noticeT = null;
  function showNotice(text) { clearTimeout(noticeT); setT('cfgNotice', text); noticeT = setTimeout(function () { setT('cfgNotice', ''); }, 2600); }
  var F = {};
  ['anlass', 'kundentyp', 'stueck', 'termin', 'nachricht', 'name', 'email', 'tel'].forEach(function (k) { F[k] = d.getElementById('f-' + k); });
  var REQ = ['anlass', 'kundentyp', 'stueck', 'name', 'email'];
  var st = { step: 1, done: false, errors: {}, showErr: false, file: null, fileErr: '' };
  var fileInput = d.getElementById('f-logo-input');

  function formLive(text) { setT('formLive', text); }
  function validate(step) {
    var e = {};
    if (step === 1) {
      if (!F.anlass.value) e.anlass = 'Bitte einen Anlass wählen.';
      if (!F.kundentyp.value) e.kundentyp = 'Bitte einen Kundentyp wählen.';
      var n = String(F.stueck.value).trim();
      if (!/^\d+$/.test(n) || +n < 1 || +n > 9999) e.stueck = 'Bitte eine ganze Zahl zwischen 1 und 9999 eingeben.';
    }
    if (step === 3) {
      if (!F.name.value.trim()) e.name = 'Bitte euren Namen angeben.';
      if (!F.email.value.trim()) e.email = 'Bitte eine E-Mail-Adresse angeben.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(F.email.value.trim())) e.email = 'Bitte eine gültige E-Mail-Adresse angeben, z. B. name@beispiel.ch.';
    }
    return e;
  }
  function dash(v) { return (v && String(v).trim()) ? v : 'keine Angabe'; }
  function reviewData() {
    return [
      { title: 'Euer Anlass', step: 1, rows: [{ k: 'Anlass', v: dash(F.anlass.value) }, { k: 'Kundentyp', v: dash(F.kundentyp.value) }, { k: 'Stückzahl', v: dash(F.stueck.value) }, { k: 'Wunschtermin', v: dash(F.termin.value) }] },
      { title: 'Gestaltung & Wünsche', step: 2, rows: (adopted ? cfgRows() : [{ k: 'Konfiguration', v: 'Keine Konfiguration übernommen' }]).concat([
        { k: 'Logo-Datei', v: st.file ? st.file.name + ' (nicht übertragen)' : 'Keine Datei gewählt' }, { k: 'Nachricht', v: dash(F.nachricht.value) }]) },
      { title: 'Kontakt', step: 3, rows: [{ k: 'Name', v: dash(F.name.value) }, { k: 'E-Mail', v: dash(F.email.value) }, { k: 'Telefon', v: dash(F.tel.value) }] }
    ];
  }
  function mk(tag, css, text) { var e = d.createElement(tag); if (css) e.style.cssText = css; if (text != null) e.textContent = text; return e; }
  function renderReview(container, withEdit) {
    while (container.firstChild) container.removeChild(container.firstChild);
    reviewData().forEach(function (r) {
      var box = mk('div', 'border-top:1px solid rgba(28,30,34,0.25);padding-top:' + (withEdit ? 16 : 14) + 'px;display:flex;flex-direction:column;gap:' + (withEdit ? 12 : 10) + 'px');
      var h4 = mk('h4', 'margin:0;font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#28496f', r.title);
      if (withEdit) {
        var head = mk('div', 'display:flex;justify-content:space-between;align-items:center;gap:12px');
        var btn = mk('button', 'min-height:44px;padding:0 6px;background:none;border:0;color:#1f3a5f;font:600 14px \'Source Sans 3\',sans-serif;text-decoration:underline;text-underline-offset:3px;cursor:pointer', 'Bearbeiten');
        btn.type = 'button'; btn.setAttribute('aria-label', r.title + ' bearbeiten');
        btn.addEventListener('click', function () { goStep(r.step); });
        head.appendChild(h4); head.appendChild(btn); box.appendChild(head);
      } else box.appendChild(h4);
      var dl = mk('dl', 'margin:0;display:grid;grid-template-columns:minmax(0,10em) minmax(0,1fr);gap:8px 20px');
      r.rows.forEach(function (w) {
        dl.appendChild(mk('dt', 'font-size:15px;color:#5c6570', w.k));
        dl.appendChild(mk('dd', 'margin:0;font-size:15px;overflow-wrap:anywhere;white-space:pre-wrap', w.v));
      });
      box.appendChild(dl); container.appendChild(box);
    });
  }
  function renderSummary() {
    setIf('adopted', adopted); setIf('notAdopted', !adopted);
    if (!adopted) return;
    setT('cfgFull', cfgRows().map(function (r) { return r.k + ': ' + r.v; }).join(' · '));
    var mi = stored.mini || {};
    d.getElementById('mini-strap').setAttribute('fill', mi.strap || '#1f2429');
    d.getElementById('mini-case').setAttribute('fill', mi.kase || '#c5ced6');
    d.getElementById('mini-bezel').setAttribute('stroke', mi.bezel || '#b9b6b0');
    d.getElementById('mini-dial').setAttribute('fill', mi.dial || '#2e5a88');
    $$('.mini-hand').forEach(function (l) { l.setAttribute('stroke', mi.light ? '#1c1e22' : '#f3f0e8'); });
    var dl = d.getElementById('cfg-rows');
    while (dl.firstChild) dl.removeChild(dl.firstChild);
    cfgRows().forEach(function (w) {
      dl.appendChild(mk('dt', 'font-size:14px;color:#5c6570', w.k));
      dl.appendChild(mk('dd', 'margin:0;font-size:14px;overflow-wrap:anywhere', w.v));
    });
    if (st.step === 4 || st.done) renderForm();
  }
  function renderForm() {
    var s = st.step;
    $$('[data-step]').forEach(function (el) { el.hidden = +el.getAttribute('data-step') !== s; });
    d.getElementById('progress-bar').style.transform = 'scaleX(' + (s / 4) + ')';
    setT('stepOf', 'Schritt ' + s + ' von 4');
    $$('.step-li').forEach(function (li) { if (+li.getAttribute('data-stepnum') === s) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
    d.getElementById('aw-form').setAttribute('aria-labelledby', 'step-h-' + s);
    setIf('canBack', s > 1); setIf('notLast', s < 4); setIf('isLast', s === 4);
    REQ.forEach(function (k) {
      var msg = st.errors[k] || '';
      F[k].setAttribute('aria-invalid', msg ? 'true' : 'false');
      var db = [k === 'stueck' ? 'h-stueck' : '', msg ? 'e-' + k : ''].filter(Boolean).join(' ');
      if (db) F[k].setAttribute('aria-describedby', db); else F[k].removeAttribute('aria-describedby');
      setT('er.' + k, msg); setIf('er.' + k, !!msg);
    });
    setIf('showErrSummary', st.showErr);
    setIf('notDone', !st.done); setIf('done', st.done);
    setT('msgCount', F.nachricht.value.length + ' / 2000');
    setT('fileStatus', st.file ? st.file.name + ' (' + st.file.type + ')' : 'Keine Datei gewählt');
    setIf('hasFile', !!st.file); setT('fileErr', st.fileErr); setIf('fileErr', !!st.fileErr);
    if (s === 4) renderReview($('[data-review="step"]'), true);
    if (st.done) renderReview($('[data-review="done"]'), false);
  }
  function goStep(n, focus) {
    st.step = n; st.errors = {}; st.showErr = false; st.done = false;
    formLive('Schritt ' + n + ' von 4: ' + STEPS[n - 1]);
    renderForm();
    if (focus !== false) focusLater('step-h-' + n, 60);
  }
  function failWith(step, e) {
    if (step !== st.step) formLive('Schritt ' + step + ' von 4: ' + STEPS[step - 1]);
    st.step = step; st.errors = e; st.showErr = true; st.done = false;
    renderForm();
    focusLater('f-' + Object.keys(e)[0], 30);
  }
  function formFocus() { scrollToId('anfrage'); focusLater('anfrage-h'); }
  function clearErr(k) {
    if (!st.errors[k]) return;
    delete st.errors[k];
    renderForm();
  }
  Object.keys(F).forEach(function (k) {
    var ev = F[k].tagName === 'SELECT' ? 'change' : 'input';
    F[k].addEventListener(ev, function () { clearErr(k); if (k === 'nachricht') setT('msgCount', F.nachricht.value.length + ' / 2000'); });
  });
  d.getElementById('aw-form').addEventListener('submit', function (e) { e.preventDefault(); });
  d.getElementById('btn-back').addEventListener('click', function () { goStep(Math.max(1, st.step - 1)); });
  d.getElementById('btn-next').addEventListener('click', function () {
    var e = validate(st.step);
    if (Object.keys(e).length) return failWith(st.step, e);
    goStep(st.step + 1);
  });
  d.getElementById('btn-finish').addEventListener('click', function () {
    var steps = [1, 3];
    for (var i = 0; i < steps.length; i++) { var e = validate(steps[i]); if (Object.keys(e).length) return failWith(steps[i], e); }
    st.done = true;
    formLive('Demo-Anfrage abgeschlossen. Es wurde nichts gesendet.');
    renderForm();
    focusLater('done-h', 60);
  });
  d.getElementById('btn-edit-all').addEventListener('click', function () { goStep(4); });

  // Logo-Datei: nur Name und Typ werden angezeigt, die Datei wird weder gelesen noch übertragen
  d.getElementById('f-logo').addEventListener('click', function () { fileInput.click(); });
  fileInput.addEventListener('change', function () {
    var file = fileInput.files && fileInput.files[0]; if (!file) return;
    var ext = (file.name.split('.').pop() || '').toLowerCase();
    if (['svg', 'pdf', 'png'].indexOf(ext) < 0) { fileInput.value = ''; st.fileErr = 'Bitte eine SVG-, PDF- oder PNG-Datei wählen.'; return renderForm(); }
    if (file.size > 10 * 1024 * 1024) { fileInput.value = ''; st.fileErr = 'Die Datei ist grösser als 10 MB (Demo-Grenze).'; return renderForm(); }
    st.file = { name: file.name, type: ext.toUpperCase() }; st.fileErr = '';
    renderForm();
  });
  d.getElementById('f-logo-remove').addEventListener('click', function () {
    fileInput.value = ''; st.file = null; st.fileErr = ''; renderForm(); focusLater('f-logo', 30);
  });

  // Übergaben vom Konfigurator und aus den Geschichten
  $$('[data-cta]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      ev.preventDefault();
      F.kundentyp.value = a.getAttribute('data-cta'); clearErr('kundentyp');
      if (st.done) { st.done = false; st.step = 1; renderForm(); }
      formFocus();
    });
  });
  $$('[data-js="to-logo"]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      ev.preventDefault();
      goStep(2, false); scrollToId('anfrage'); focusLater('f-logo');
    });
  });
  // Vorbefüllung über URL (?anlass=, ?kundentyp=, ?nachricht=, ?konfig=1)
  var q = new URLSearchParams(location.search);
  if (q.get('anlass')) { var an = q.get('anlass'); if (!$$('option', F.anlass).some(function (o) { return o.value === an || o.textContent === an; })) { var op = d.createElement('option'); op.textContent = an; F.anlass.appendChild(op); } F.anlass.value = an; }
  if (q.get('kundentyp')) F.kundentyp.value = q.get('kundentyp');
  if (q.get('nachricht')) F.nachricht.value = q.get('nachricht').slice(0, 2000);
  if (q.get('logo')) { st.step = 2; }
  if (q.get('konfig') && adopted) { formLive('Konfiguration in die Anfrage übernommen.'); setTimeout(function () { showNotice('Konfiguration übernommen'); }, 400); }
  if ([].some.call(['anlass', 'kundentyp', 'nachricht', 'konfig'], function (k) { return q.get(k); })) setTimeout(function () { scrollToId('anfrage'); focusLater('anfrage-h', 500); }, 150);
  renderSummary();
  renderForm();
  }

  /* ───────────── FAQ ───────────── */
  $$('.faq-btn').forEach(function (btn) {
    var panel = d.getElementById(btn.getAttribute('aria-controls')), t = null;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      clearTimeout(t);
      if (open) {
        panel.classList.add('is-shown');
        requestAnimationFrame(function () { requestAnimationFrame(function () { panel.classList.add('is-open'); }); });
      } else {
        panel.classList.remove('is-open');
        t = setTimeout(function () { if (btn.getAttribute('aria-expanded') !== 'true') panel.classList.remove('is-shown'); }, reduced ? 0 : 240);
      }
    });
  });

  if (d.getElementById('cfg')) { var cfgEl = d.getElementById('cfg'); initCfg(); }
  if (d.getElementById('aw-form')) initForm();
})();
