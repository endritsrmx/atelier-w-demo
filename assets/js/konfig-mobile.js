/* Mobile Schritt-Ansicht für den Konfigurator; app.js bleibt die Quelle des Zustands. */
(function () {
  'use strict';
  var cfg = document.getElementById('cfg');
  if (!cfg) return;
  var mq = matchMedia('(max-width: 767px)');
  var preview = cfg.children[0], options = cfg.children[1];
  preview.classList.add('km-preview'); options.classList.add('km-options');
  var names = ['Modell', 'Gehäuse', 'Zifferblatt', 'Armband', 'Boden & Rotor', 'Gravur'], N = names.length;
  var panels = Array.from(options.querySelectorAll('[data-km-step]'));
  panels.forEach(function (p) { p.classList.add('km-panel'); });
  var actions = options.querySelector('.km-actions-wrap');
  actions.classList.add('km-actions');
  var tabs = document.createElement('div'); tabs.className = 'km-tabs'; tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', 'Gestaltungsschritte');
  var current = 0;
  var buttons = names.map(function (name, i) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = name; b.setAttribute('role', 'tab'); b.id = 'km-tab-' + i;
    b.addEventListener('click', function () { show(i); });
    b.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); var n = (current + (e.key === 'ArrowRight' ? 1 : N - 1)) % N; show(n); buttons[n].focus(); } });
    tabs.appendChild(b); return b;
  });
  options.prepend(tabs);
  var meta = document.createElement('p'); meta.className = 'km-meta'; options.insertBefore(meta, panels[0]);
  var next = document.createElement('button'); next.type = 'button'; next.className = 'km-next'; options.insertBefore(next, actions);
  next.addEventListener('click', function () { show(Math.min(N - 1, current + 1)); });
  var note = document.createElement('p'); note.className = 'km-note'; note.textContent = 'Skizze, kein Produktfoto: Farbe und Proportion angenähert. Richtpreis pro Uhr, Personalisierung und Stückzahl auf Anfrage.'; options.appendChild(note);
  function show(i) {
    current = i; cfg.dataset.kmCurrent = i; cfg.dataset.kmLast = i === N - 1 ? '1' : '0';
    panels.forEach(function (p) { p.classList.toggle('km-active', +p.dataset.kmStep === i); });
    buttons.forEach(function (b, j) { b.setAttribute('aria-selected', String(i === j)); b.tabIndex = i === j ? 0 : -1; });
    meta.textContent = '0' + (i + 1) + ' / 0' + N + ' · ' + names[i];
    next.textContent = 'Weiter: ' + names[Math.min(i + 1, N - 1)] + ' →';
    if (mq.matches) {
      if (i === 4) document.getElementById('view-back').click(); else if (i !== 5) document.getElementById('view-front').click();
      var b = buttons[i]; tabs.scrollTo({ left: Math.max(0, b.offsetLeft - tabs.offsetLeft - 14), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }
  document.getElementById('cfg-engraving').addEventListener('focus', function () { if (mq.matches) document.getElementById('view-back').click(); });
  document.getElementById('cfg-dialtext').addEventListener('focus', function () { if (mq.matches) document.getElementById('view-front').click(); });
  document.querySelectorAll('[data-js="to-colors"]').forEach(function (a) { a.addEventListener('click', function () { if (mq.matches) show(2); }); });
  document.querySelectorAll('a[data-model]').forEach(function (a) { a.addEventListener('click', function () { show(0); }); });
  show(0);
})();
