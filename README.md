# Fangbuch

Ratgeber und Gedächtnis am Wasser: Sessions offline erfassen, aus den eigenen Daten lernen und ins Fangbuch im Projekt „Angeln“ übertragen. Installierbare Web-App (PWA) nach dem Design „Fangbuch App v3“ aus Claude Design. Die Bedienung steht in [ANLEITUNG.md](ANLEITUNG.md).

## Entwickeln

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # Typprüfung und Build nach dist/
npm run preview    # gebaute App mit Offline-Modus ansehen
```

Veröffentlicht wird automatisch: Jeder Push auf `main` baut die App per GitHub Action (`.github/workflows/pages.yml`) und stellt sie auf GitHub Pages. Einmalig muss unter Settings › Pages › Source „GitHub Actions“ eingestellt sein.

## Aufbau

- `src/FangbuchApp.tsx`: Zustand und alle Aktionen (Live-Session, Nachtragen, Bearbeiten, Formulare, Übertragen, Import, Sicherung).
- `src/vm.ts`: baut aus dem Zustand das View-Model, das die Screens anzeigen.
- `src/screens/`: ein Baustein je Screen. Die meisten sind aus dem Design übernommen (Struktur und Inline-Styles), `SessionDetail`, `SessionEdit`, `Daten` und `Sheets` sind neu im selben Stil.
- `src/lib/db.ts`: IndexedDB `fangbuch-app`, Version 2, dieselben Stores wie die bisherige App.
- `src/lib/fangbuch.ts`: Datenmodell der Sessions, Export (`fangbuch-app-export`, schemaVersion 4), Import und Sicherung (`fangbuch-app-backup`, Version 2), unverändert kompatibel zur bisherigen App.
- `src/lib/berater.ts` und `src/lib/fachwissen.ts`: Methoden-Index, Farbberater, Bewährt und Heute testen, Box-Empfehlung, Wissensstand.
- `src/lib/regeln.ts`: Lizenzen, Schonzeiten, Mindestmaße.

## Daten

Alles bleibt auf dem Gerät. Sessions, Gewässer, Vorschläge und Bilder liegen wie bisher in den Stores `sessions`, `gewaesser`, `empfehlungen` und `bilder`. Neu hinzugekommene Bereiche (Lizenzen, Ausrüstung, Köderboxen, Karten, Regeln je Fischart, vorgemerkte Tests) stehen im Store `meta` unter dem Schlüssel `v3`. Testergebnisse hängen als `_tests` an der Session und gehen als Notiz ins Fangbuch; Felder mit `_` werden nie exportiert.

Beim ersten Start werden die Setups der bisherigen App zu Kombos in der Ausrüstung. Lizenzfotos kommen nicht in die Sicherungsdatei.

## Umstieg von der bisherigen App

Die neue Version läuft unter derselben Adresse und benutzt dieselbe Datenbank. Die alte App erkennt das Update und zeigt „Eine neue Version der App ist da“. Ein Tipp auf „Jetzt laden“ startet die neue Version (dafür beantwortet `public/sw-compat.js` die alte Nachricht `skipWaiting`). Eine laufende Session wird fortgesetzt.

## Noch nicht enthalten

- Wetter, Wind, Luftdruck, Pegel und Tide holt die App nicht selbst; Claude ergänzt sie beim Übertragen im Fangbuch.
- Die Köder-Erkennung aus dem Box-Foto ist noch nicht gebaut (später über die Claude API mit einem kleinen Proxy).
- Kartentiefen werden noch nicht auf den aktuellen Wasserstand umgerechnet.
