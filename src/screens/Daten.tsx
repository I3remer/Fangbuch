// Daten: Übertragen ins Fangbuch, Import aus dem Fangbuch, Datensicherung und Einstellungen.
import type { VM } from '../types';
import { Note, S, Toggle } from '../components/ui';

export function Daten({ vm }: { vm: VM }) {
  const { back, is, data: D } = vm;
  if (!is.data) return null;
  return (
    <div style={{ padding: '0 20px 120px', display: 'flex', flexDirection: 'column', gap: 16, color: 'var(--ink)' }}>
      <button onClick={back} style={{ alignSelf: 'flex-start', height: 48, padding: '0 12px 0 0', border: 0, background: 'transparent', color: 'var(--ink)', font: '600 16px Archivo,sans-serif', cursor: 'pointer' }}>‹ Zurück</button>
      <h1 style={S.h1}>Daten</h1>
      <div style={{ background: 'var(--hdr)', color: 'var(--hdrink)', borderRadius: 18, padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, font: '800 17px Archivo,sans-serif', fontStretch: '112%' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: D.offline ? '#8fbf6a' : '#e0895a' }} />{D.offline ? 'Offline bereit' : 'Noch nicht offline bereit'}</span>
        <span style={{ font: '400 14px/1.45 Archivo,sans-serif', color: 'var(--hdrmuted)' }}>Alle Sessions, Gewässer und Fotos liegen nur auf diesem Handy. Nichts verlässt es außer über „Übertragen“ und „Sicherung“. Nutze immer die App vom Home-Bildschirm: Safari hat einen eigenen Speicher.</span>
        {D.storage && <span style={{ font: '500 12px Archivo,sans-serif', color: 'var(--hdrmuted)' }}>{D.storage}</span>}
      </div>

      {D.pending && (
        <Note tone="warn">
          <b style={{ font: '800 16px Archivo,sans-serif' }}>Hat die Übertragung geklappt?</b>
          <span>{D.pending}</span>
          <div style={S.grid2}><button onClick={D.pendingYes} style={{ ...S.primary, height: 52 }}>Ja, ist im Fangbuch</button><button onClick={D.pendingNo} style={S.ghost}>Nein, nochmal</button></div>
        </Note>
      )}
      {D.stale && <Note tone="warn">{D.stale}</Note>}

      <div style={S.card}>
        <span style={S.cardTitle}>Ans Fangbuch übertragen</span>
        {D.nothing ? <span style={S.hint}>Alles übertragen. Neue Sessions erscheinen hier, sobald du sie beendet oder nachgetragen hast.</span> : (
          <>
            {D.list.map((p: any, i: number) => <div key={i} style={{ display: 'flex', gap: 12, font: '500 15px/1.35 Archivo,sans-serif', padding: '6px 0', borderBottom: '1px solid var(--line)' }}><span style={{ width: 76, flex: 'none', color: 'var(--muted)' }}>{p.a}</span><span style={{ flex: 1 }}>{p.b}</span></div>)}
            {D.liveRunning && <span style={S.hint}>Die laufende Live-Session ist nicht dabei. Sie kommt beim nächsten Mal mit.</span>}
            {!D.exp ? (
              <>
                <button onClick={D.makeExport} style={S.primary}>Export erstellen</button>
                <span style={S.hint}>Danach teilst du den Text in die Claude-App oder kopierst ihn ins Projekt „Angeln“. Claude übernimmt die Sessions ins Fangbuch und ergänzt Wetter, Luftdruck, Sonne, Mond und Tide.</span>
              </>
            ) : (
              <>
                {D.exp.bilder > 0 && <button onClick={D.shareFile} style={S.primary}>Als Datei mit Screenshots teilen</button>}
                {D.canShare && <button onClick={D.shareText} style={D.exp.bilder ? S.ghost : S.primary}>Als Text teilen</button>}
                <button onClick={D.copy} style={S.ghost}>Text kopieren</button>
                {!D.exp.bilder && <button onClick={D.shareFile} style={S.ghost}>Als Datei teilen</button>}
                <span style={S.hint}>{D.exp.bilder ? `${D.exp.bilder} ${D.exp.bilder === 1 ? 'Screenshot geht' : 'Screenshots gehen'} nur mit der Datei mit. Teil die Datei ins Projekt „Angeln“ und schreib dazu: „Übernimm diese Sessions aus der Fangbuch-App ins Fangbuch:“.` : 'Im Teilen-Menü die Claude-App wählen, das Projekt „Angeln“ öffnen und senden. Danach fragt die App, ob alles angekommen ist.'}</span>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={S.label}>Vorschau</span><textarea id="exporttext" readOnly value={D.exp.text} style={{ ...S.input, height: 160, padding: 12, font: '400 12px/1.4 ui-monospace, monospace', resize: 'vertical' }} /></label>
              </>
            )}
          </>
        )}
      </div>

      <div style={S.card}>
        <span style={S.cardTitle}>Import aus dem Fangbuch</span>
        <span style={S.hint}>Schreib im Projekt „Angeln“: „Exportier meine Gewässer und Vorschläge für die Fangbuch-App.“ Füg die Antwort hier ein oder wähl die Datei. Auf demselben Weg kommen deine Startdaten mit Setups und Spots.</span>
        <textarea value={D.importText} onChange={(e) => D.setImportText(e.target.value)} placeholder='{"gewaesser": {...}, "empfehlungen": {...}}' style={{ ...S.input, height: 120, padding: 12, font: '400 13px/1.4 ui-monospace, monospace', resize: 'vertical' }} />
        <div style={S.grid2}><button onClick={D.doImport} style={{ ...S.primary, height: 52 }}>Importieren</button><button onClick={D.importFile} style={S.outline}>Datei wählen</button></div>
        {D.importMsg && <Note tone={D.importMsg.err ? 'warn' : 'ok'}>{D.importMsg.text}</Note>}
        <span style={{ font: '400 13px/1.4 Archivo,sans-serif', color: 'var(--muted)' }}>{D.counts}</span>
      </div>

      <div style={S.card}>
        <span style={S.cardTitle}>Datensicherung</span>
        <span style={S.hint}>Sichert alles in eine Datei: Sessions, Screenshots, Gewässer, Vorschläge, Ausrüstung, Köderboxen und Karten. Lizenzfotos bleiben nur auf diesem Handy. Leg die Datei in iCloud Drive oder „Dateien“. Sicherungen der bisherigen App lassen sich ebenfalls einspielen.</span>
        <span style={{ font: '500 14px Archivo,sans-serif' }}>{D.backupText}</span>
        <div style={S.grid2}><button onClick={D.doBackup} style={S.outline}>Sichern</button><button onClick={D.pickRestore} style={S.ghost}>Wiederherstellen</button></div>
        {D.restore && (
          <Note tone="warn">
            <b style={{ font: '800 16px Archivo,sans-serif' }}>Sicherung wiederherstellen?</b>
            <span>{D.restore}</span>
            <b>Alle Daten auf diesem Handy werden dabei ersetzt.{D.liveRunning ? ' Die laufende Live-Session geht verloren.' : ''}</b>
            <div style={S.grid2}><button onClick={D.restoreYes} style={{ ...S.primary, height: 52, background: 'var(--minus)', color: 'var(--surface)' }}>Ja, ersetzen</button><button onClick={D.restoreNo} style={S.ghost}>Abbrechen</button></div>
          </Note>
        )}
      </div>

      <div style={S.card}>
        <span style={S.cardTitle}>Einstellungen</span>
        <Toggle title="GPS-Position automatisch speichern" sub="Beim Start einer Session und bei jedem Fang. Unabhängig davon kannst du bei jedem Eintrag „Position übernehmen“ tippen." value={D.gps} onChange={D.setGps} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
          <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}><span style={{ font: '700 15px Archivo,sans-serif' }}>Ort für Sonnenzeiten</span><span style={{ font: '400 13px/1.4 Archivo,sans-serif', color: 'var(--muted)' }}>{D.sunPosText}</span></span>
          <button onClick={D.setSunPos} style={{ ...S.ghost, minHeight: 44, flex: 'none' }}>{D.sunPosLabel}</button>
        </div>
      </div>
    </div>
  );
}
