/* Local mobile preview; app.js remains the source of configuration state. */
(function () {
  'use strict';
  var cfg = document.getElementById('cfg');
  if (!cfg) return;
  var mq = matchMedia('(max-width: 767px)');
  var preview = cfg.children[0], options = cfg.children[1];
  preview.classList.add('km-preview'); options.classList.add('km-options');
  var names = ['Gehäuse', 'Zifferblatt', 'Zeiger', 'Band', 'Gravur'];
  var panels = Array.from(options.querySelectorAll('fieldset'));
  panels.push(document.getElementById('cfg-dialtext').parentElement, document.getElementById('cfg-engraving').parentElement);
  panels.forEach(function (p, i) { p.classList.add('km-panel'); p.dataset.kmStep = Math.min(i, 4); });
  var actions = document.getElementById('adopt').parentElement;
  actions.classList.add('km-actions');
  var tabs = document.createElement('div'); tabs.className = 'km-tabs'; tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', 'Gestaltungsschritte');
  var buttons = names.map(function (name, i) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = name; b.setAttribute('role', 'tab'); b.id = 'km-tab-' + i;
    b.addEventListener('click', function () { show(i); });
    b.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); var n = (current + (e.key === 'ArrowRight' ? 1 : 4)) % 5; show(n); buttons[n].focus(); } });
    tabs.appendChild(b); return b;
  });
  options.prepend(tabs);
  var meta = document.createElement('p'); meta.className = 'km-meta'; options.insertBefore(meta, panels[0]);
  var next = document.createElement('button'); next.type = 'button'; next.className = 'km-next'; options.insertBefore(next, actions);
  next.addEventListener('click', function () { show(Math.min(4, current + 1)); });
  var note = document.createElement('p'); note.className = 'km-note'; note.textContent = 'Skizze, kein Produktfoto: Farbe und Proportion angenähert. Gestaltungsstudie – Materialien, technische Ausführung, Mindestmenge und Termin klären wir mit euch im Atelier.'; options.appendChild(note);
  var current = 0;
  function show(i) {
    current = i; cfg.dataset.kmCurrent = i;
    panels.forEach(function (p) { p.classList.toggle('km-active', +p.dataset.kmStep === i); });
    buttons.forEach(function (b, j) { b.setAttribute('aria-selected', String(i === j)); b.tabIndex = i === j ? 0 : -1; });
    meta.textContent = '0' + (i + 1) + ' / 05 · ' + names[i];
    next.textContent = 'Weiter: ' + names[Math.min(i + 1, 4)] + ' →';
    if (mq.matches) {
      if (i !== 4) document.getElementById('view-front').click();
      var b = buttons[i]; tabs.scrollTo({left: Math.max(0, b.offsetLeft - tabs.offsetLeft - 14), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    }
  }
  document.getElementById('cfg-engraving').addEventListener('focus', function () { if (mq.matches) document.getElementById('view-back').click(); });
  document.getElementById('cfg-dialtext').addEventListener('focus', function () { if (mq.matches) document.getElementById('view-front').click(); });
  document.querySelectorAll('[data-js="to-colors"]').forEach(function (a) { a.addEventListener('click', function () { if (mq.matches) show(1); }); });
  show(0);
})();
