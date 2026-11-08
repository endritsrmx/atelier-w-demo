/* Atelier W – Seitenlogik (ohne Framework)
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
  if (!d.getElementById('cfg')) return; // Unterseiten brauchen nur das Jahr

  /* ───────────── Daten ───────────── */
  var FINISH = [{ id: 'poliert', label: 'Poliert' }, { id: 'gebuerstet', label: 'Gebürstet' }, { id: 'pvd', label: 'Schwarz PVD' }];
  var DIAL = [{ id: 'blau', label: 'Metallblau', mini: '#2e5a88' }, { id: 'smaragd', label: 'Smaragd', mini: '#1fa585' }, { id: 'silber', label: 'Silber', mini: '#d0d7dd' }, { id: 'graphit', label: 'Graphit', mini: '#3d4248' }, { id: 'elfenbein', label: 'Elfenbein', mini: '#efe9da' }];
  var HANDS = [{ id: 'pfeil', label: 'Pfeil' }, { id: 'dauphine', label: 'Dauphine' }, { id: 'baton', label: 'Baton' }, { id: 'feuille', label: 'Feuille' }];
  var STRAP = [{ id: 'stahl', label: 'Stahl', mini: '#b8c2ca' }, { id: 'leder-braun', label: 'Leder braun', mini: '#6b4a32' }, { id: 'leder-schwarz', label: 'Leder schwarz', mini: '#232325' }, { id: 'kautschuk', label: 'Kautschuk blau', mini: '#23405f' }];
  var DEFAULT = { finish: 'gebuerstet', dial: 'blau', hands: 'dauphine', strap: 'stahl', view: 'front', dialText: '', engraving: '' };
  var STEPS = ['Euer Anlass', 'Gestaltung & Wünsche', 'Kontakt', 'Prüfen'];
  var NAV = ['anlaesse', 'ablauf', 'konfigurator', 'atelier', 'materialien', 'beispiele'];
  function byId(arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return arr[0]; }
  function assign(a, b) { var o = {}, k; for (k in a) o[k] = a[k]; for (k in b) o[k] = b[k]; return o; }

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

  /* ───────────── Konfigurator ───────────── */
  var cfgEl = d.getElementById('cfg');
  var cfg = assign(DEFAULT, {}), adopted = false, engFocused = false;
  var annT = null, noticeT = null;
  var dialTextEl = d.getElementById('dial-text'), dialPathEl = d.getElementById('dial-text-path'), engLinesEl = d.getElementById('eng-lines'), engEmptyEl = d.getElementById('eng-empty');
  var dialInput = d.getElementById('cfg-dialtext'), engInput = d.getElementById('cfg-engraving');
  var watchImg = d.getElementById('watch-img');

  function isLight() { return cfg.dial === 'silber' || cfg.dial === 'elfenbein'; }
  function cfgSentence() {
    return 'Gehäuse ' + byId(FINISH, cfg.finish).label + ', Zifferblatt ' + byId(DIAL, cfg.dial).label + ', Zeiger ' + byId(HANDS, cfg.hands).label + ', Band ' + byId(STRAP, cfg.strap).label;
  }
  function cfgRows() {
    return [
      { k: 'Gehäuse', v: byId(FINISH, cfg.finish).label }, { k: 'Zifferblatt', v: byId(DIAL, cfg.dial).label },
      { k: 'Zeiger', v: byId(HANDS, cfg.hands).label }, { k: 'Band', v: byId(STRAP, cfg.strap).label },
      { k: 'Zifferblatt-Text', v: cfg.dialText.trim() ? cfg.dialText : 'kein Text' },
      { k: 'Gravur Boden', v: cfg.engraving.trim() ? cfg.engraving : 'keine Gravur' }
    ];
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
  function svgText(attrs, text) {
    var e = d.createElementNS('http://www.w3.org/2000/svg', 'text');
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    e.textContent = text; return e;
  }

  function renderCfg() {
    cfgEl.setAttribute('data-finish', cfg.finish); cfgEl.setAttribute('data-dial', cfg.dial);
    cfgEl.setAttribute('data-hands', cfg.hands); cfgEl.setAttribute('data-strap', cfg.strap);
    cfgEl.setAttribute('data-view', cfg.view);
    if (isLight()) cfgEl.setAttribute('data-light', ''); else cfgEl.removeAttribute('data-light');
    ['finish', 'dial', 'hands', 'strap'].forEach(function (name) {
      $$('input[name="' + name + '"]', cfgEl).forEach(function (inp) {
        var on = inp.value === cfg[name]; inp.checked = on;
        inp.parentNode.classList.toggle('is-checked', on);
      });
    });
    var front = cfg.view === 'front';
    d.getElementById('view-front').setAttribute('aria-pressed', String(front));
    d.getElementById('view-back').setAttribute('aria-pressed', String(!front));
    setT('viewLabel', front ? 'Zifferblatt' : 'Gehäuseboden');
    // Zifferblatt-Text (Grossschreibung nur in der Vorschau)
    var upper = cfg.dialText.toLocaleUpperCase('de-CH');
    dialPathEl.textContent = upper; // läuft auf einem Bogen unter dem Tourbillon
    dialTextEl.setAttribute('font-size', Math.max(8, Math.min(12, (160 / Math.max(1, upper.length) - 1.2) / 0.62)).toFixed(1));
    // Gravur in bis zu drei Zeilen
    var lines = wrapEngraving(cfg.engraving);
    var longest = Math.max.apply(null, [1].concat(lines.map(function (l) { return l.length; })));
    var fs = Math.max(10, Math.min(20, 150 / (longest * 0.6))), lh = fs * 1.4, y0 = 300 - (lines.length - 1) * lh / 2 + fs * 0.35;
    while (engLinesEl.firstChild) engLinesEl.removeChild(engLinesEl.firstChild);
    lines.forEach(function (t, i) {
      var base = { 'text-anchor': 'middle', 'font-family': "'Source Sans 3',sans-serif", 'font-weight': '500', 'font-size': fs.toFixed(1), 'letter-spacing': '1' };
      engLinesEl.appendChild(svgText(assign(base, { x: '210.7', y: (y0 + i * lh + 0.8).toFixed(1), 'class': 'eng-hi' }), t));
      engLinesEl.appendChild(svgText(assign(base, { x: '210', y: (y0 + i * lh).toFixed(1), 'class': 'eng-main' }), t));
    });
    engEmptyEl.style.display = lines.length ? 'none' : '';
    setT('dialCount', cfg.dialText.length + ' / 20');
    setT('engCount', cfg.engraving.length + ' / 42');
    setIf('offerBack', engFocused && front);
    watchImg.setAttribute('aria-label', 'Skizze der Uhr, Ansicht ' + (front ? 'Zifferblatt' : 'Gehäuseboden') + ': ' + cfgSentence() + '. Zifferblatt-Text: ' + (cfg.dialText.trim() || 'kein Text') + '. Gravur: ' + (cfg.engraving.trim() || 'keine Gravur') + '.');
    setT('cfgLine', byId(FINISH, cfg.finish).label + ' · ' + byId(DIAL, cfg.dial).label + ' · ' + byId(HANDS, cfg.hands).label + ' · ' + byId(STRAP, cfg.strap).label);
    renderSummary();
  }

  function setCfg(patch) {
    var viewOnly = Object.keys(patch).length === 1 && 'view' in patch;
    cfg = assign(cfg, patch);
    renderCfg();
    clearTimeout(annT);
    annT = setTimeout(function () {
      setT('announce', viewOnly ? 'Ansicht: ' + (cfg.view === 'back' ? 'Gehäuseboden' : 'Zifferblatt') : 'Vorschau aktualisiert: ' + cfgSentence());
    }, viewOnly ? 400 : 800);
    if (adopted && !('view' in patch)) showNotice('Konfiguration aktualisiert');
  }
  function showNotice(text) {
    clearTimeout(noticeT); setT('cfgNotice', text);
    noticeT = setTimeout(function () { setT('cfgNotice', ''); }, 2600);
  }

  ['finish', 'dial', 'hands', 'strap'].forEach(function (name) {
    $$('input[name="' + name + '"]', cfgEl).forEach(function (inp) {
      inp.addEventListener('change', function () { if (inp.checked) { var p = {}; p[name] = inp.value; setCfg(p); } });
    });
  });
  d.getElementById('view-front').addEventListener('click', function () { setCfg({ view: 'front' }); });
  d.getElementById('view-back').addEventListener('click', function () { setCfg({ view: 'back' }); });
  dialInput.addEventListener('input', function () { setCfg({ dialText: dialInput.value.slice(0, 20) }); });
  engInput.addEventListener('input', function () { setCfg({ engraving: engInput.value.slice(0, 42) }); });
  engInput.addEventListener('focus', function () { engFocused = true; renderCfg(); });
  d.getElementById('offer-back').addEventListener('click', function () { setCfg({ view: 'back' }); focusLater('cfg-engraving', 30); });

  // Zurücksetzen (mit Rückfrage, wenn Text eingegeben wurde)
  var resetBtn = d.getElementById('reset-btn');
  function doReset() {
    engFocused = false; dialInput.value = ''; engInput.value = '';
    setCfg(assign(DEFAULT, {}));
  }
  resetBtn.addEventListener('click', function () {
    if (cfg.dialText || cfg.engraving) { setIf('confirmReset', true); d.getElementById('reset-yes').focus(); }
    else doReset();
  });
  d.getElementById('reset-yes').addEventListener('click', function () { setIf('confirmReset', false); doReset(); resetBtn.focus(); });
  d.getElementById('reset-no').addEventListener('click', function () { setIf('confirmReset', false); resetBtn.focus(); });

  // Tourbillon: Käfig und Unruh laufen per CSS-Animation; ausserhalb des Sichtfelds pausieren
  var watchBox = $('.watch-box', cfgEl);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { watchBox.classList.toggle('is-paused', !es[0].isIntersecting); }).observe(watchBox);
  }

  // Lichtschein über dem Zifferblatt (nur Maus/Trackpad)
  var faceFront = d.getElementById('face-front'), glow = d.getElementById('glow'), rect = null, raf = null;
  if (fine && !reduced) {
    faceFront.addEventListener('mouseenter', function () { rect = faceFront.getBoundingClientRect(); glow.style.opacity = '1'; });
    faceFront.addEventListener('mousemove', function (e) {
      if (!rect) return;
      var x = (e.clientX - rect.left) / rect.width * 420, y = (e.clientY - rect.top) / rect.height * 600;
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = null; glow.style.transform = 'translate(' + (x - 210) + 'px, ' + (y - 300) + 'px)'; });
    });
    faceFront.addEventListener('mouseleave', function () { rect = null; glow.style.opacity = '0'; });
  }

  /* ───────────── Anfrageformular ───────────── */
  var F = {};
  ['anlass', 'kundentyp', 'stueck', 'termin', 'budget', 'nachricht', 'name', 'email', 'tel'].forEach(function (k) { F[k] = d.getElementById('f-' + k); });
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
        { k: 'Budgetrahmen', v: F.budget.value }, { k: 'Logo-Datei', v: st.file ? st.file.name + ' (nicht übertragen)' : 'Keine Datei gewählt' }, { k: 'Nachricht', v: dash(F.nachricht.value) }]) },
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
    d.getElementById('mini-strap').setAttribute('fill', byId(STRAP, cfg.strap).mini);
    d.getElementById('mini-case').setAttribute('fill', cfg.finish === 'pvd' ? '#2a2d31' : (cfg.finish === 'poliert' ? '#dfe5ea' : '#c5ced6'));
    d.getElementById('mini-dial').setAttribute('fill', byId(DIAL, cfg.dial).mini);
    $$('.mini-hand').forEach(function (l) { l.setAttribute('stroke', isLight() ? '#1c1e22' : '#f3f0e8'); });
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
  d.getElementById('adopt').addEventListener('click', function () {
    adopted = true;
    renderSummary();
    showNotice('Konfiguration übernommen');
    formLive('Konfiguration in die Anfrage übernommen.');
    formFocus();
  });
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
  $$('[data-js="to-colors"]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      ev.preventDefault();
      scrollToId('grp-dial'); focusLater('opt-dial-' + cfg.dial);
    });
  });

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

  renderCfg();
  renderForm();
})();
