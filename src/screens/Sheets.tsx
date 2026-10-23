// Die Sheets aus dem Design (Session starten, Fang, Köderwechsel, Beobachtung, Test, Lücke, Beenden, Formulare),
// ergänzt um die Angaben, die das Fangbuch braucht.
import React from 'react';
import type { VM } from '../types';
import { ImageSlot } from '../components/ImageSlot';
import { KoederForm } from '../components/KoederForm';
import { Chips, Field, S } from '../components/ui';
import { bildData } from '../lib/fangbuch';

const title = { font: '800 24px/1.1 Archivo,sans-serif', fontStretch: '120%' } as React.CSSProperties;
const cap = S.label;
const stepBtn = { height: 56, borderRadius: 14, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--ink)', font: '700 16px Archivo,sans-serif', cursor: 'pointer' } as React.CSSProperties;
const done = { height: 60, borderRadius: 16, border: 0, background: 'var(--ink)', color: 'var(--bg)', font: '800 17px Archivo,sans-serif', cursor: 'pointer' } as React.CSSProperties;
const ghost = { height: 52, borderRadius: 16, border: '1px solid var(--line)', background: 'transparent', color: 'var(--ink)', font: '700 15px Archivo,sans-serif', cursor: 'pointer' } as React.CSSProperties;

function SmallThumb({ id }: { id: string }) {
  const [src, setSrc] = React.useState<string | null>(null);
  React.useEffect(() => { bildData(id).then(setSrc); }, [id]);
  return src ? <img src={src} alt="Screenshot" style={{ width: 72, height: 54, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }} /> : null;
}

export function Sheets({ vm }: { vm: VM }) {
  const { hasSheet, closeSheet, sh, start: st, doStart, startBtn, cd, bs, obsGroups, noteText, setNoteText, saveNote, tr, gp, liveVm, endHint, doEnd, fm, cf, add, doAdd } = vm;
  if (!hasSheet) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={closeSheet} style={{ position: 'absolute', inset: 0, background: 'rgba(5,10,8,.55)' }} />
      <div className="sheet" style={{ position: 'relative', background: 'var(--surface)', color: 'var(--ink)', borderRadius: '26px 26px 0 0', padding: '10px 20px calc(32px + env(safe-area-inset-bottom))', maxHeight: '90%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <span style={{ alignSelf: 'center', width: 44, height: 5, borderRadius: 3, background: 'var(--line)' }} />

        {sh.start && (
          <>
            <span style={title}>Session starten</span>
            <span style={cap}>Gewässer</span>
            {st.waters.map((w: any, i: number) => <button key={i} onClick={w.pick} style={w.style}><span style={{ font: '800 16px Archivo,sans-serif', flex: 1, textAlign: 'left' }}>{w.name}</span><span style={{ font: '600 14px Archivo,sans-serif', opacity: 0.8 }}>{w.word}</span></button>)}
            {st.isNew && <Field label="Name des neuen Gewässers" value={st.gwNeu} onChange={st.setGwNeu} />}
            <span style={cap}>Zielfisch</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{st.fish.map((c: any, i: number) => <button key={i} onClick={c.pick} style={c.style}>{c.label}</button>)}</div>
            {!st.isNew && <Chips label="Spot" small opts={st.spots} />}
            <Chips label="Kombo" small opts={st.setups} />
            <Field label="Vorfach" placeholder="z. B. Fluoro 0,40 mm, 60 cm" value={st.vorfach} onChange={st.setVorfach} />
            <Chips label="Angelart" small opts={st.art} />
            {st.k0.length > 0 && <Chips label="Startköder aus deiner Box" small opts={st.k0} />}
            <div style={S.grid2}><Field label="Wasser in °C" inputMode="decimal" placeholder="falls gemessen" value={st.wt} onChange={st.setWt} /><Field label="Sichttiefe in cm" inputMode="numeric" placeholder="optional" value={st.sicht} onChange={st.setSicht} /></div>
            <span style={{ font: '500 14px/1.4 Archivo,sans-serif', color: 'var(--muted)' }}>{st.tip}{st.gps ? ' GPS ist an: Beim Start und bei jedem Fang wird die Position gespeichert.' : ''}</span>
            {st.warn.map((x: any, i: number) => <div key={i} style={{ padding: '12px 14px', borderRadius: 14, border: '2px solid var(--minus)', color: 'var(--ink)', font: '600 14px/1.4 Archivo,sans-serif' }}>{x.t}</div>)}
            <button onClick={doStart} style={{ height: 64, borderRadius: 18, border: 0, background: 'var(--orange)', color: 'var(--onorange)', font: '800 19px Archivo,sans-serif', fontStretch: '115%', cursor: 'pointer' }}>{startBtn}</button>
          </>
        )}

        {sh.catch && (
          <>
            <span style={title}>{cd.title}</span>
            {cd.isFang && (
              <>
                <span style={cap}>Art</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{cd.arts.map((c: any, i: number) => <button key={i} onClick={c.pick} style={c.style}>{c.label}</button>)}</div>
                <span style={cap}>Länge</span>
                <div style={{ display: 'grid', gridTemplateColumns: '56px 56px 1fr 56px 56px', gap: 8, alignItems: 'center' }}>
                  <button onClick={cd.m5} style={stepBtn}>−5</button><button onClick={cd.m1} style={stepBtn}>−1</button>
                  <span style={{ textAlign: 'center', font: '800 28px/1 Archivo,sans-serif', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{cd.len}</span>
                  <button onClick={cd.p1} style={stepBtn}>+1</button><button onClick={cd.p5} style={stepBtn}>+5</button>
                </div>
                <div style={S.grid2}>{cd.keep.map((c: any, i: number) => <button key={i} onClick={c.pick} style={c.style}>{c.label}</button>)}</div>
                <span style={cd.legalStyle}>{cd.legal}</span>
                {cd.warn && <span style={{ font: '600 14px/1.4 Archivo,sans-serif', color: 'var(--minus)' }}>{cd.warn}</span>}
              </>
            )}
            {cd.koeder && <span style={{ font: '500 14px Archivo,sans-serif', color: 'var(--muted)' }}>Köder: {cd.koeder}</span>}
            <Chips label="Spot" small opts={cd.spots} />
            <div style={S.grid2}><Field label="Wassertiefe in m" inputMode="decimal" value={cd.tiefe} onChange={cd.setTiefe} /><Field label="Notiz" placeholder="z. B. Biss beim Absinken" value={cd.notiz} onChange={cd.setNotiz} /></div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              {cd.pos ? <><span style={{ font: '500 13px Archivo,sans-serif', color: 'var(--muted)' }}>{cd.pos}</span><button onClick={cd.delPos} style={S.link}>entfernen</button></> : <button onClick={cd.getPos} style={S.link}>Position übernehmen</button>}
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              {cd.bild ? <><SmallThumb id={cd.bild} /><button onClick={cd.delBild} style={S.link}>Screenshot entfernen</button></> : <button onClick={cd.addBild} style={S.link}>Screenshot anhängen, z. B. vom Echolot</button>}
            </div>
            <button onClick={closeSheet} style={done}>Fertig</button>
          </>
        )}

        {sh.bait && (
          <>
            <span style={title}>Köderwechsel</span>
            <Chips small opts={bs.modes} />
            {bs.mode === 'box' ? (
              <>
                {bs.noBox && <button onClick={bs.goBoxes} style={S.dashed}>Noch keine Köderbox „Heute dabei“. Zur Köderbox ›</button>}
                {bs.box.map((r: any, i: number) => (
                  <button key={i} onClick={r.use} style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 56, border: 0, borderTop: '1px solid var(--line)', background: 'transparent', color: 'var(--ink)', cursor: 'pointer', textAlign: 'left', padding: '6px 0' }}>
                    <span style={r.sw} /><span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ font: '700 15px/1.25 Archivo,sans-serif' }}>{r.title}</span>{r.sub && <span style={{ font: '500 13px Archivo,sans-serif', color: 'var(--muted)' }}>{r.sub}</span>}</span><span style={{ font: '700 14px Archivo,sans-serif', color: 'var(--reed)' }}>Nehmen</span>
                  </button>
                ))}
                {!bs.noBox && !bs.box.length && <span style={S.hint}>In der Box sind noch keine Köder mit Typ und Farbe.</span>}
              </>
            ) : (
              <>
                {bs.recent.length > 0 && <Chips label="Zuletzt benutzt" small opts={bs.recent} />}
                <KoederForm d={bs.d} set={bs.set} typen={bs.typen} montagen={bs.montagen} labels={bs.labels} labelTitle="Bezeichnung" onLabelDone={bs.prefill} />
                <button onClick={bs.apply} style={done}>Köder wechseln</button>
              </>
            )}
          </>
        )}

        {sh.note && (
          <>
            <span style={title}>Beobachtung</span>
            {obsGroups.map((g: any, i: number) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={cap}>{g.label}</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{g.opts.map((o: any, j: number) => <button key={j} onClick={o.pick} style={o.style}>{o.label}</button>)}</div>
              </div>
            ))}
            <span style={{ font: '500 13px Archivo,sans-serif', color: 'var(--muted)' }}>Ein Tipp speichert die Beobachtung mit Uhrzeit.</span>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={cap}>Eigene Notiz</span><textarea value={noteText} rows={2} placeholder="z. B. Kleinfisch springt am Westufer" onChange={(e) => setNoteText(e.target.value)} style={{ ...S.input, height: 'auto', minHeight: 72, padding: '12px 14px', resize: 'vertical' }} /></label>
            <button onClick={saveNote} style={done}>Notiz speichern</button>
          </>
        )}

        {sh.testres && (
          <>
            <span style={title}>Hat der Test etwas gebracht?</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}><span style={{ font: '700 16px/1.3 Archivo,sans-serif' }}>{tr.title}</span><span style={{ font: '500 14px Archivo,sans-serif', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{tr.span}</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 8 }}>{tr.kpis.map((k: any) => <div key={k.k} style={{ background: 'var(--surface2)', borderRadius: 14, padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ font: '800 26px/1 Archivo,sans-serif', fontVariantNumeric: 'tabular-nums' }}>{k.v}</span><span style={{ font: '500 12px Archivo,sans-serif', color: 'var(--muted)' }}>{k.k}</span></div>)}</div>
            <span style={{ font: '500 14px/1.4 Archivo,sans-serif' }}>{tr.crit}</span>
            <div style={S.grid2}><button onClick={tr.yes} style={{ height: 64, borderRadius: 16, border: 0, background: 'var(--reed)', color: 'var(--onreed)', font: '800 16px/1.2 Archivo,sans-serif', cursor: 'pointer' }}>Ja, hat was gebracht</button><button onClick={tr.no} style={{ height: 64, borderRadius: 16, border: '2px solid var(--ink)', background: 'transparent', color: 'var(--ink)', font: '800 16px Archivo,sans-serif', cursor: 'pointer' }}>Nein</button></div>
            <button onClick={tr.unclear} style={ghost}>Unklar, nicht werten</button>
          </>
        )}

        {sh.gap && (
          <>
            <span style={{ ...cap, color: 'var(--orange)' }}>Lücke im Wissensstand</span>
            <span style={title}>{gp.title}</span>
            <span style={{ font: '400 15px/1.45 Archivo,sans-serif' }}>{gp.text}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--line)', paddingTop: 10 }}>{gp.rows.map((r: any) => <div key={r.k} style={{ display: 'flex', gap: 12, font: '400 14px/1.35 Archivo,sans-serif' }}><span style={{ width: 64, flex: 'none', color: 'var(--muted)' }}>{r.k}</span><span style={{ flex: 1, fontWeight: 600 }}>{r.v}</span></div>)}</div>
            <button onClick={gp.plan} style={done}>{gp.btn}</button>
          </>
        )}

        {sh.end && (
          <>
            <span style={title}>Session beenden?</span>
            <span style={{ font: '500 16px/1.45 Archivo,sans-serif' }}>{liveVm.waterName} · {liveVm.elapsed} · {liveVm.bites} Bisse · {liveVm.catches} Fänge</span>
            <span style={{ font: '400 14px/1.45 Archivo,sans-serif', color: 'var(--muted)' }}>{endHint}</span>
            <button onClick={doEnd} style={done}>Speichern und beenden</button>
            <button onClick={closeSheet} style={ghost}>Weiter angeln</button>
          </>
        )}

        {sh.form && (
          <>
            <span style={title}>{fm.title}</span>
            {fm.hasPhoto && <div style={{ position: 'relative', height: 120, borderRadius: 14, overflow: 'hidden' }}><ImageSlot id={fm.slotId} placeholder="Foto, optional" shape="rect" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} /></div>}
            {fm.pickers.map((p: any, i: number) => <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><span style={cap}>{p.label}</span><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{p.opts.map((o: any, j: number) => <button key={j} onClick={o.pick} style={o.style}>{o.label}</button>)}</div></div>)}
            {fm.fields.map((f: any, i: number) => (
              <label key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={cap}>{f.label}</span>
                {f.type === 'area'
                  ? <textarea value={f.value} onChange={f.onChange} rows={3} style={{ ...S.input, height: 'auto', minHeight: 80, padding: '12px 14px', font: '500 16px/1.4 Archivo,sans-serif', resize: 'vertical' }} />
                  : <input type={f.type === 'number' ? 'text' : f.type} inputMode={f.type === 'number' ? 'decimal' : undefined} value={f.value} onChange={f.onChange} style={S.input} />}
              </label>
            ))}
            {fm.hasWaters && (
              <>
                <span style={cap}>Gilt für</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{fm.waterOpts.map((o: any, i: number) => <button key={i} onClick={o.pick} style={o.style}>{o.label}</button>)}</div>
                <span style={cap}>Erinnern vor Ablauf</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 6 }}>{fm.vlOpts.map((o: any, i: number) => <button key={i} onClick={o.pick} style={o.style}>{o.label}</button>)}</div>
                <span style={{ font: '400 13px/1.4 Archivo,sans-serif', color: 'var(--muted)' }}>Lizenzfotos bleiben nur auf diesem Handy und kommen nicht in die Sicherung.</span>
              </>
            )}
            {fm.hasStatus && (
              <>
                <span style={cap}>Status</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 6 }}>{fm.statusOpts.map((o: any, i: number) => <button key={i} onClick={o.pick} style={o.style}>{o.label}</button>)}</div>
                <span style={{ font: '400 13px/1.4 Archivo,sans-serif', color: 'var(--muted)' }}>Aussortiertes bleibt in der Statistik, wird aber nicht mehr empfohlen.</span>
              </>
            )}
            {fm.hasNote && <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={cap}>Notiz</span><textarea value={fm.note} onChange={fm.onNote} style={{ ...S.input, height: 'auto', minHeight: 80, padding: '12px 14px', font: '500 16px/1.4 Archivo,sans-serif', resize: 'vertical' }} /></label>}
            <button onClick={fm.save} style={done}>Speichern</button>
            {fm.canDel && <button onClick={fm.del} style={{ ...ghost, border: '1.5px solid var(--minus)', color: 'var(--minus)' }}>{fm.delLabel}</button>}
          </>
        )}

        {sh.confirm && (
          <>
            <span style={title}>{cf.title}</span>
            <span style={{ font: '400 15px/1.45 Archivo,sans-serif' }}>{cf.text}</span>
            <button onClick={cf.yes} style={{ ...done, background: 'var(--minus)', color: 'var(--surface)' }}>{cf.yesLabel}</button>
            <button onClick={cf.no} style={ghost}>Abbrechen</button>
          </>
        )}

        {sh.add && (
          <>
            <span style={title}>Session nachtragen</span>
            <Chips label="Gewässer" small opts={add.waters} />
            {add.isNew && <Field label="Name des neuen Gewässers" value={add.gwNeu} onChange={add.setGwNeu} />}
            <Chips label="Zielfisch" small opts={add.fish} />
            {add.spots.length > 0 && <Chips label="Spot" small opts={add.spots} />}
            <Field label="Datum" type="date" value={add.datum} onChange={add.set('datum')} />
            <div style={S.grid2}><Field label="Beginn" type="time" value={add.beginn} onChange={add.set('beginn')} /><Field label="Ende" type="time" value={add.ende} onChange={add.set('ende')} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {add.steppers.map((s: any) => (
                <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={cap}>{s.label}</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 48px', alignItems: 'center', gap: 6 }}>
                    <button onClick={s.dec} style={{ ...stepBtn, height: 48, borderRadius: 12, fontSize: 20 }}>−</button>
                    <span style={{ textAlign: 'center', font: '800 24px Archivo,sans-serif' }}>{s.v}</span>
                    <button onClick={s.inc} style={{ ...stepBtn, height: 48, borderRadius: 12, fontSize: 20 }}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <span style={{ font: '500 14px/1.4 Archivo,sans-serif', color: 'var(--muted)' }}>{add.hint}</span>
            <button onClick={doAdd} style={done}>Speichern</button>
            <button onClick={add.full} style={ghost}>Ausführlich erfassen</button>
          </>
        )}
      </div>
    </div>
  );
}
