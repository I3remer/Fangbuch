# Fangbuch-App: Anleitung

Die App ist dein Notizblock fürs Wasser. Sie läuft auch ohne Netz, alle Daten bleiben auf dem Handy. Das Fangbuch im Projekt „Angeln“ bleibt die einzige Datenbasis: Was du in der App erfasst, überträgst du dorthin.

## 1. Installation auf dem iPhone

1. Öffne die Adresse der App in **Safari** (nicht in Chrome oder einer anderen App).
2. Warte, bis die Seite ganz geladen ist.
3. Tippe auf das Teilen-Symbol (Quadrat mit Pfeil) und wähle „Zum Home-Bildschirm“. Lass „Als Web-App öffnen“ eingeschaltet und tippe auf „Hinzufügen“.
4. Öffne die App ab jetzt **immer über das Symbol auf dem Home-Bildschirm**. Safari und die Home-Bildschirm-App haben getrennte Speicher. Was du in Safari erfasst, sieht die App nicht.
5. Öffne die App einmal mit Netz und schau unter „Daten“, ob unten „offline bereit“ steht. Dann funktioniert sie am Wasser auch im Funkloch.

Tipp: Bildschirm-an während der Live-Session klappt ab iOS 18.4. Bei älteren Versionen stell die automatische Sperre unter Einstellungen > Anzeige & Helligkeit zum Angeln auf „Nie“.

Automatisches GPS ist ausgeschaltet. Unter „Daten“ > „Einstellungen“ schaltest du es ein. Unabhängig davon kannst du bei jedem Eintrag „Position übernehmen“ tippen, das funktioniert auch ohne Netz. Beim ersten Mal fragt das iPhone nach der Erlaubnis.

**Startdaten einmalig importieren:** Deine Setups und Startspots liegen in der Datei `startdaten.json` im Projektordner auf deinem Rechner, nicht im öffentlichen Code. Leg sie in iCloud Drive und importier sie in der App unter „Daten“ > „Import aus dem Fangbuch“ > „Datei wählen“. Später kannst du Setups unter „Daten“ > „Setups“ ändern, ergänzen oder auf inaktiv setzen.

## 2. Am Wasser

- **Live**: Gewässer, Setup, Vorfach, Spot, Zielfisch, Angelart und Startköder wählen, „Session starten“. Die App schlägt pro Gewässer das zuletzt genutzte Setup vor. Jeder Tipp auf Fang, Fehlbiss, Aussteiger oder Nachläufer speichert sofort die Uhrzeit.
- Nach jedem Tipp öffnet sich ein Kasten zum Ergänzen: bei Fängen Art, Länge und Entnommen, bei allen Einträgen Spot (auch „+ Neuer Spot“), Wassertiefe, „Position übernehmen“ und „Screenshot anhängen“ (z. B. vom Echolot, aus Galerie oder Kamera). Das geht auch später über „ergänzen“ im Verlauf.
- **Köder**: Bezeichnung, Ködertyp, Modell, Farbe, Länge, Gewicht ohne Montage, Führung und Wasserschicht. Darunter klappst du „Montage“ auf: Jigkopf, Swimbait-Haken, Texas-Rig usw., Blei- oder Kopfgewicht, Haken, Hakenaustritt, Hakenspitze und Stinger. Wählst du einen Köder, den du schon einmal benutzt hast, füllt die App Typ, Modell, Farbe, Größe, Gewicht und Montage vom letzten Einsatz vor.
- Eigene Ködertypen und Montagen („Eigener Typ …“) landen dauerhaft in der Auswahl. Unter „Daten“ > „Eigene Listen“ kannst du sie wieder entfernen.
- Köderwechsel und Notizen bekommen ebenfalls eine Uhrzeit. „Rückgängig“ entfernt den letzten Eintrag.
- Die Session übersteht Sperrbildschirm, App-Wechsel und Neustart des Handys. Beim nächsten Öffnen bist du wieder in der laufenden Session.
- **Nachtragen**: Unter „Sessions“ > „Session nachtragen“ erfasst du vergangene Angeltage mit Datum, Beginn, Ende, Ködern und Einträgen. Der Köder eines Eintrags richtet sich automatisch nach der Uhrzeit und deinen Köderwechseln, solange du ihn nicht selbst änderst. Nullrunden speicherst du einfach ohne Einträge.
- Solange eine Session nicht übertragen ist, kannst du sie bearbeiten oder löschen (Session antippen > „Bearbeiten“).

## 3. Übertragen ins Fangbuch

1. Tippe auf „Übertragen“ > „Export erstellen“.
2. **Ohne Screenshots:** „Text kopieren“ und im Projekt „Angeln“ in einen Chat einfügen, oder „Als Text teilen“. Der Text beginnt mit „Übernimm diese Sessions aus der Fangbuch-App ins Fangbuch:“.
   **Mit Screenshots:** „Als Datei mit Screenshots teilen“, die Datei im Projekt „Angeln“ an einen Chat anhängen und dazuschreiben: „Übernimm diese Sessions aus der Fangbuch-App ins Fangbuch:“. Nur die Datei enthält die Bilder.
3. Claude übernimmt die Sessions, vergibt die endgültigen Session-IDs und ergänzt Wetter, Luftdruck, Sonne, Mond und Tide.
4. Zurück in der App: Bei „Hat die Übertragung geklappt?“ erst dann „Ja, ist im Fangbuch“ tippen, wenn Claude die Übernahme bestätigt hat. Danach sind die Sessions in der App gesperrt und als „übertragen“ markiert.

Hat etwas nicht geklappt, tippe „Nein, nochmal versuchen“ und exportiere erneut. Doppelte Übertragungen sind kein Problem: Jede Session hat eine feste App-ID, an der Claude Dubletten erkennt.

Liegen Sessions länger als 7 Tage unübertragen auf dem Handy, zeigt die App einen deutlichen Hinweis.

## 4. Import aus dem Fangbuch

Damit Gewässer, Spots und Vorschläge offline in der App stehen:

1. Schreib im Projekt „Angeln“: „Exportier meine Gewässer und Vorschläge für die Fangbuch-App.“
2. Kopier das JSON aus Claudes Antwort (oder lade die Datei).
3. In der App: „Daten“ > „Import aus dem Fangbuch“, Text einfügen und „Importieren“ (oder „Datei wählen“).

Danach stehen Gewässer und Spots im Startformular zur Auswahl. Während einer Session siehst du die offenen Vorschläge für Gewässer und Zielfisch. Wiederhol den Import, wenn Claude neue Vorschläge erstellt hat. Bestehende Einträge werden dabei aktualisiert.

Neue Gewässer kannst du auch direkt in der App anlegen („Gewässer“ > „Neues Gewässer anlegen“ oder im Startformular „Neues Gewässer …“). Sie gehen beim nächsten Übertragen mit ins Fangbuch. Dasselbe gilt für neue Spots an bekannten Gewässern („+ Neuer Spot“): Sie bleiben auch bei einem neuen Import aus dem Fangbuch erhalten, bis sie übertragen sind.

## 5. Datensicherung

- „Daten“ > „Sicherung erstellen“ speichert alles in eine Datei, auch Screenshots, Setups und eigene Listen. Leg sie in iCloud Drive oder „Dateien“ ab.
- „Sicherung wiederherstellen“ ersetzt alle Daten auf dem Handy durch die Sicherung, etwa nach einem Handywechsel.
- Was übertragen ist, liegt sicher im Fangbuch. Die Sicherung schützt vor allem Sessions, die noch nicht übertragen sind.
- Wichtig: Wenn du die App vom Home-Bildschirm löschst, löscht iOS auch ihre Daten.

## 6. Für die Projektanweisungen in „Angeln“

Damit Claude im Projekt weiß, was zu tun ist, kannst du diesen Absatz in die Projektanweisungen übernehmen:

> **Fangbuch-App.** Texte oder Dateien, die mit „Übernimm diese Sessions aus der Fangbuch-App ins Fangbuch:“ kommen, enthalten JSON mit `format` "fangbuch-app-export" und `schemaVersion` 3 oder 4 (Felder siehe schema-v4.json): `sessions` (Liste), `gewaesser` (Objekt slug zu Steckbrief) und bei Dateien mit Screenshots `bilder` (uuid zu Bild). Gibt es einen Gewässer-Slug noch nicht, lege das Gewässer an. Gibt es ihn schon, ergänze nur die mitgeschickten neuen `spots`. Prüfe jede Session per `appId` auf Dubletten, vergib die Session-ID nach dem üblichen Format JJJJ-MM-TT_KUERZEL_NN, übernimm alle Felder einschließlich `setup` (Momentaufnahme mit `setupId`), `koeder[].montage`, `ereignisse[].spot`, `tiefeM`, `koordinaten` und `bild`, und vervollständige Umweltdaten wie bei anderen Sessions. Werte Screenshots aus, wenn sie etwas zur Session sagen (z. B. Tiefe oder Struktur auf dem Echolot). Bestätige am Ende, welche Sessions übernommen wurden.
> Auf „Exportier meine Gewässer und Vorschläge für die Fangbuch-App“ antworte mit einem JSON-Codeblock im Format `{"gewaesser": {slug: {...Steckbrief}}, "empfehlungen": {id: {...Vorschlag}}}` mit allen Gewässern und allen Vorschlägen, Felder wie im Fangbuch.

## 7. Updates der App

Neue Versionen lädt die App automatisch, sobald sie Netz hat. Erscheint oben „Eine neue Version der App ist da“, tippe auf „Jetzt laden“. Deine Daten bleiben dabei erhalten.

Für Änderungen am Code: Nach jeder Änderung in `sw.js` die Zeile `const VERSION = 'fangbuch-app-v2'` hochzählen (v3, v4 …), sonst bekommt das Handy die neue Fassung nicht. Exporte lassen sich mit `python tools/pruefe_export.py export.json schema-v4.json` gegen das Schema prüfen (Skript und Schema liegen im Projektordner, nicht im öffentlichen Repository).
