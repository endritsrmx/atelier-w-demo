# Atelier W – Website-Demonstration

Statische Website, ohne Build-Schritt lauffähig. Drei Seiten: `index.html` (Onepage mit Konfigurator und Anfrageformular), `impressum.html`, `datenschutz.html`.

## Auf GitHub Pages veröffentlichen

1. Auf GitHub ein neues Repository anlegen, z. B. `atelier-w-demo` (öffentlich – GitHub Pages für private Repositories braucht ein kostenpflichtiges Konto).
2. Im Repository **Add file → Upload files** wählen und den **Inhalt dieses Ordners** hineinziehen (`index.html`, `impressum.html`, `datenschutz.html`, die JS-Dateien sowie die Ordner `assets` und `vendor`). `index.html` muss ganz oben im Repository liegen. **Commit changes**.
3. **Settings → Pages**: Source «Deploy from a branch», Branch `main`, Ordner `/ (root)` → **Save**.
4. Nach ein bis zwei Minuten ist die Seite erreichbar unter `https://BENUTZERNAME.github.io/atelier-w-demo/`.

Alle Pfade sind relativ – die Seite funktioniert auch in einem Unterordner oder unter einem Repository-Unterpfad.
Die versteckte Datei `.nojekyll` ist optional; sie sorgt nur dafür, dass GitHub die Dateien unverändert ausliefert.

## Lokal testen

Im Ordner ein Terminal öffnen und einen kleinen Webserver starten:

```
python3 -m http.server 8000
```

Dann `http://localhost:8000` im Browser öffnen. (Ein lokaler Server entspricht dem Verhalten auf GitHub Pages besser als ein Doppelklick auf die HTML-Datei.)

## Struktur

```
index.html            Hauptseite
impressum.html        Impressum (mit Platzhaltern)
datenschutz.html      Datenschutz (mit Platzhaltern)
support.js            Lokale Laufzeit, die die Seitenvorlage mit React rendert
intro.js              Intro-Animation (entfällt bei «Bewegung reduzieren»)
vendor/               React 18.3.1 und React DOM 18.3.1, lokal
assets/fonts/         Cormorant Garamond und Source Sans 3 (lateinisch, lokal)
assets/img/           Beispielbilder (WebP)
assets/logo/          Original-Logo, schwarz und weiss
assets/site.css       Anpassungen für Veröffentlichung (Scrollen, Fokus, Safe Area)
```

Die Seitenvorlage steht in `index.html` in `<template id="dc-src">`, die Logik im `<script type="text/x-dc">` danach. Fotos sind normale `<img>`-Elemente auf die Dateien in `assets/img`. Das Hero-Bild hat zusätzlich eine kleinere Variante für schmale Viewports. Schriften und die wenigen Zusatzregeln sind im HTML eingebunden, dieselben Dateien liegen unter `assets/fonts` und `assets/site.css`. Es gibt keine Verbindung zu einem CDN und kein Editor-Element für Bilder.

## Grenzen der Demo

- Das Anfrageformular sendet nichts; Konfiguration und Eingaben bleiben nur im geöffneten Fenster. Kein Backend, keine Cookies, kein localStorage. Nach dem Abschluss erscheint eine Bestätigung auf der Seite.
- Die Logo-Datei im Formular wird weder gelesen noch hochgeladen; nur der Dateiname wird angezeigt.
- Die Schriften werden von derselben Website geladen.
- `noindex, nofollow` ist gesetzt – vor einem Livegang bewusst ändern.

## Offene Angaben (Platzhalter)

`[[RECHTSFORM]]`, `[[INHABER / VERTRETUNGSBERECHTIGTE PERSON]]`, `[[STRASSE UND HAUSNUMMER]]`, `[[PLZ UND ORT]]`, `[[E-MAIL]]`, `[[TELEFON]]`, `[[UID / MWST-STATUS]]`, `[[HANDELSREGISTER / FALLS ZUTREFFEND]]`, `[[DATENSCHUTZKONTAKT]]`, `[[HOSTINGANBIETER UND LAND]]`, `[[HOSTING-LOGS: ZWECK UND AUFBEWAHRUNG]]`, `[[STAND DER DATENSCHUTZERKLÄRUNG]]`

Alle Fotografien sind Beispielbilder und keine Kundenaufträge. Impressum und Datenschutz vor einem Livebetrieb rechtlich prüfen lassen.
