// Session nachtragen oder bearbeiten, mit allen Feldern fürs Fangbuch.
import type { VM } from '../types';
import { TYP } from '../lib/fangbuch';
import { KoederForm } from '../components/KoederForm';
import { Area, Check, Chips, Collapse, Field, Note, S } from '../components/ui';

const row = { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 } as React.CSSProperties;
const x = { width: 44, height: 44, borderRadius: 12, border: '1px solid var(--line)', background: 'transparent', color: 'var(--muted)', font: '700 20px Archivo,sans-serif', cursor: 'pointer', flex: 'none', alignSelf: 'flex-end' } as React.CSSProperties;

export function SessionEdit({ vm }: { vm: VM }) {
  const { is, ed } = vm;
  if (!is.edit || !ed) return null;
  const d = ed.d;
  return (
    <div style={{ padding: '0 20px calc(40px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 16, color: 'var(--ink)' }}>
      <button onClick={ed.cancel} style={{ alignSelf: 'flex-start', height: 48, padding: '0 12px 0 0', border: 0, background: 'transparent', color: 'var(--ink)', font: '600 16px Archivo,sans-serif', cursor: 'pointer' }}>‹ Abbrechen</button>
      <h1 style={S.h1}>{ed.title}</h1>
      <span style={S.hint}>{d.appId ? 'Änderungen sind möglich, bis die Session übertragen ist.' : 'Für Angeltage, die du nicht live erfasst hast. Auch Nullrunden zählen: einfach ohne Einträge speichern.'}</span>

      <Chips label="Gewässer" opts={ed.waters} />
      {ed.isNew && <Field label="Name des neuen Gewässers" value={d.gwNeu} onChange={(v) => ed.set('gwNeu', v)} />}
      <Chips label="Zielfisch" small opts={ed.fish} />
      {!ed.isNew && <Chips label="Spot" small opts={[...ed.spots, { label: '+ Neuer Spot', on: false, pick: ed.newSpot }]} />}
      <Chips label="Angelart" small opts={ed.art} />
      <Chips label="Setup" small opts={ed.setups} />
      <Field label="Vorfach" placeholder="z. B. Fluoro 0,40 mm, 60 cm" value={d.vorfach} onChange={(v) => ed.set('vorfach', v)} />
      <Field label="Datum" type="date" value={d.datum} onChange={(v) => ed.set('datum', v)} />
      <div style={S.grid2}><Field label="Beginn" type="time" value={d.beginn} onChange={(v) => ed.set('beginn', v)} /><Field label="Ende" type="time" value={d.ende} onChange={(v) => ed.set('ende', v)} /></div>
      <div style={S.grid2}><Field label="Wasser in °C" inputMode="decimal" placeholder="falls gemessen" value={d.wt} onChange={(v) => ed.set('wt', v)} /><Field label="Sichttiefe in cm" inputMode="numeric" placeholder="optional" value={d.sicht} onChange={(v) => ed.set('sicht', v)} /></div>

      <h2 style={{ ...S.h2, marginTop: 8 }}>Köder</h2>
      {d.koeder.map((k: any, i: number) => (
        <div key={i} style={row}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 110, flex: 'none' }}><Field label="Ab" type="time" value={k.zeit} onChange={(v) => ed.set(`koeder.${i}.zeit`, v)} /></div>
            <div style={{ flex: 1, minWidth: 0 }}><Field label="Köder" list="dl-klabels" value={k.label} onChange={(v) => ed.set(`koeder.${i}.label`, v)} /></div>
            <button onClick={() => ed.delRow('koeder', i)} style={x} aria-label="Köder entfernen">×</button>
          </div>
          <Collapse title="Details und Montage" hint={[k.typ, k.farbe, k.groesseCm && k.groesseCm + ' cm'].filter(Boolean).join(', ')}>
            <KoederForm d={k} set={(p, v) => ed.set(`koeder.${i}.${p}`, v)} typen={ed.typen} montagen={ed.montagen} withLabel={false} />
          </Collapse>
        </div>
      ))}
      <datalist id="dl-klabels">{ed.labels.map((l: string) => <option key={l} value={l} />)}</datalist>
      {!d.koeder.length && <span style={S.hint}>Noch kein Köder.</span>}
      <button onClick={() => ed.add('koeder')} style={S.dashed}>+ Köder hinzufügen</button>

      <h2 style={{ ...S.h2, marginTop: 8 }}>Bisse, Fänge, Nachläufer</h2>
      <span style={S.hint}>Der Köder eines Eintrags richtet sich nach der Uhrzeit und deinen Köderwechseln, solange du ihn nicht selbst änderst.</span>
      {d.ereignisse.map((e: any, i: number) => (
        <div key={i} style={row}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 110, flex: 'none' }}><Field label="Uhrzeit" type="time" value={e.zeit} onChange={(v) => ed.set(`ereignisse.${i}.zeit`, v)} /></div>
            <div style={{ flex: 1 }} />
            <button onClick={() => ed.delRow('ereignisse', i)} style={x} aria-label="Eintrag entfernen">×</button>
          </div>
          <Chips small opts={Object.entries(TYP).map(([k, l]) => ({ label: l as string, on: e.typ === k, pick: () => ed.set(`ereignisse.${i}.typ`, k) }))} />
          {e.typ === 'fang' && (
            <>
              <Chips label="Fischart" small opts={ed.arts(e).map((a: string) => ({ label: a, on: e.art === a, pick: () => ed.set(`ereignisse.${i}.art`, a) }))} />
              <div style={S.grid2}><Field label="Länge in cm" inputMode="decimal" value={e.laengeCm} onChange={(v) => ed.set(`ereignisse.${i}.laengeCm`, v)} /><div style={{ alignSelf: 'flex-end' }}><Check label="Entnommen" value={!!e.entnommen} onChange={(v) => ed.set(`ereignisse.${i}.entnommen`, v)} /></div></div>
            </>
          )}
          <Chips label="Köder" small opts={ed.koederLabels.map((l: string) => ({ label: l, on: e.koeder === l, pick: () => ed.set(`ereignisse.${i}.koeder`, l) }))} />
          {!ed.isNew && <Chips label="Spot" small opts={[{ label: 'ohne', on: !e.spot, pick: () => ed.set(`ereignisse.${i}.spot`, '') }, ...ed.spotNames.map((s: string) => ({ label: s, on: e.spot === s, pick: () => ed.set(`ereignisse.${i}.spot`, s) }))]} />}
          <div style={S.grid2}><Field label="Tiefe in m" inputMode="decimal" value={e.tiefeM} onChange={(v) => ed.set(`ereignisse.${i}.tiefeM`, v)} /><Field label="Notiz" value={e.notiz} onChange={(v) => ed.set(`ereignisse.${i}.notiz`, v)} /></div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {e.koordinaten ? <button onClick={() => ed.set(`ereignisse.${i}.koordinaten`, null)} style={S.link}>Position {e.koordinaten.lat}, {e.koordinaten.lon} entfernen</button> : <button onClick={() => ed.evPos(i)} style={S.link}>Position übernehmen</button>}
            {e.bild ? <button onClick={() => ed.set(`ereignisse.${i}.bild`, null)} style={S.link}>Screenshot entfernen</button> : <button onClick={() => ed.evBild(i)} style={S.link}>Screenshot anhängen</button>}
          </div>
        </div>
      ))}
      {!d.ereignisse.length && <span style={S.hint}>Keine Einträge. Ohne Einträge wird die Session als Nullrunde gespeichert.</span>}
      <button onClick={() => ed.add('ereignisse')} style={S.dashed}>+ Eintrag hinzufügen</button>

      <h2 style={{ ...S.h2, marginTop: 8 }}>Notizen</h2>
      {d.notizen.map((n: any, i: number) => (
        <div key={i} style={{ display: 'flex', gap: 10 }}>
          <div style={{ width: 110, flex: 'none' }}><Field label="Uhrzeit" type="time" value={n.zeit} onChange={(v) => ed.set(`notizen.${i}.zeit`, v)} /></div>
          <div style={{ flex: 1, minWidth: 0 }}><Field label="Notiz" value={n.text} onChange={(v) => ed.set(`notizen.${i}.text`, v)} /></div>
          <button onClick={() => ed.delRow('notizen', i)} style={x} aria-label="Notiz entfernen">×</button>
        </div>
      ))}
      <button onClick={() => ed.add('notizen')} style={S.dashed}>+ Notiz hinzufügen</button>
      <Area label="Eindruck" value={d.eindruck} onChange={(v) => ed.set('eindruck', v)} />
      <Area label="Beim nächsten Mal testen" rows={2} value={d.naechstesMal} onChange={(v) => ed.set('naechstesMal', v)} />

      {ed.err && <div role="alert"><Note tone="warn">{ed.err}</Note></div>}
      <button onClick={ed.save} style={{ ...S.primary, height: 60, font: '800 17px Archivo,sans-serif' }}>Speichern</button>
      <button onClick={ed.cancel} style={S.ghost}>Abbrechen</button>
      {d.appId && (ed.delConfirm ? (
        <Note tone="warn"><b>Diese Session endgültig löschen?</b><div style={S.grid2}><button onClick={ed.delYes} style={{ ...S.primary, height: 52, background: 'var(--minus)', color: 'var(--surface)' }}>Ja, löschen</button><button onClick={ed.delNo} style={S.ghost}>Abbrechen</button></div></Note>
      ) : <button onClick={ed.askDel} style={S.danger}>Session löschen</button>)}
    </div>
  );
}
