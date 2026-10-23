// Session-Detail im Stil des Designs, mit allen Angaben, die ins Fangbuch gehen.
import React, { useEffect, useState } from 'react';
import type { VM } from '../types';
import { bildData } from '../lib/fangbuch';
import { S } from '../components/ui';

function Thumb({ id }: { id: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [big, setBig] = useState(false);
  useEffect(() => { bildData(id).then(setSrc); }, [id]);
  if (!src) return null;
  return (
    <>
      <button onClick={() => setBig(true)} style={{ border: 0, padding: 0, background: 'transparent', cursor: 'pointer', alignSelf: 'flex-start' }} aria-label="Screenshot ansehen">
        <img src={src} alt="Screenshot" style={{ width: 96, height: 72, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--line)' }} />
      </button>
      {big && <div onClick={() => setBig(false)} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(5,10,8,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}><img src={src} alt="Screenshot" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12 }} /></div>}
    </>
  );
}

const h2 = { margin: 0, font: '800 19px/1.1 Archivo,sans-serif', fontStretch: '118%' } as React.CSSProperties;
const box = { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, padding: '4px 14px' } as React.CSSProperties;

export function SessionDetail({ vm }: { vm: VM }) {
  const { tlLabels, back, is, sd } = vm;
  if (!is.session || !sd.dl) return null;
  return (
    <div style={{ padding: '0 20px 120px', display: 'flex', flexDirection: 'column', gap: 18, color: 'var(--ink)' }}>
      <button onClick={back} style={{ alignSelf: 'flex-start', height: 48, padding: '0 12px 0 0', border: 0, background: 'transparent', color: 'var(--ink)', font: '600 16px Archivo,sans-serif', cursor: 'pointer' }}>‹ Zurück</button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: -8 }}>
        <span style={{ font: '600 13px Archivo,sans-serif', color: 'var(--muted)' }}>{sd.long} · {sd.st} bis {sd.en}</span>
        <h1 style={{ margin: 0, font: '800 28px/1.05 Archivo,sans-serif', fontStretch: '125%' }}>{sd.waterName}</h1>
        <span style={{ font: '500 15px Archivo,sans-serif', color: 'var(--muted)' }}>{[sd.fish, sd.spot, sd.angelart].filter(Boolean).join(' · ')}</span>
        <span style={{ alignSelf: 'flex-start', font: '700 12px/1 Archivo,sans-serif', padding: '6px 8px', borderRadius: 7, border: sd.status === 'nicht übertragen' ? '1.5px solid var(--orange)' : '1.5px solid var(--plus)', color: sd.status === 'nicht übertragen' ? 'var(--orange)' : 'var(--plus)', marginTop: 4 }}>{sd.status}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={sd.track}><div style={sd.span} />{(sd.marks || []).map((mk: any, i: number) => <span key={i} style={mk.style} />)}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', font: '500 12px Archivo,sans-serif', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{tlLabels.map((t: string) => <span key={t}>{t}</span>)}</div>
        <span style={{ font: '500 12px Archivo,sans-serif', color: 'var(--muted)' }}>Sonnenuntergang {sd.ss}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 8 }}>
        {sd.kpis.map((k: any) => <div key={k.k} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 10, display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ font: '800 20px/1 Archivo,sans-serif', fontVariantNumeric: 'tabular-nums' }}>{k.v}</span><span style={{ font: '500 11px Archivo,sans-serif', color: 'var(--muted)' }}>{k.k}</span></div>)}
      </div>
      {sd.isLive && <button onClick={sd.openLive} style={S.primary}>Zur laufenden Session</button>}
      {sd.canEdit && <div style={S.grid2}><button onClick={sd.edit} style={S.outline}>Bearbeiten</button><button onClick={sd.goTransfer} style={S.ghost}>Übertragen</button></div>}
      {!sd.canEdit && !sd.isLive && <span style={S.hint}>Diese Session ist im Fangbuch und hier gesperrt. Änderungen machst du jetzt im Projekt „Angeln“.</span>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h2 style={h2}>Ereignisse</h2>
        <div style={box}>
          {sd.events.map((e: any, i: number) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '11px 0', borderBottom: '1px solid var(--line)' }}>
              <span style={{ font: '500 15px Archivo,sans-serif', fontVariantNumeric: 'tabular-nums', color: 'var(--muted)', width: 44, flex: 'none' }}>{e.t}</span>
              <span style={{ ...e.dot, marginTop: 4 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                <span style={{ font: '600 15px/1.35 Archivo,sans-serif' }}>{e.label}</span>
                {e.sub && <span style={{ font: '400 13px/1.4 Archivo,sans-serif', color: 'var(--muted)' }}>{e.sub}</span>}
                {e.bild && <Thumb id={e.bild} />}
              </div>
            </div>
          ))}
          {sd.zero && <div style={{ padding: '12px 0', font: '500 15px/1.4 Archivo,sans-serif' }}>Nullrunde. Zählt genauso: sie zeigt, wann es nicht läuft.</div>}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h2 style={h2}>Köder</h2>
        {sd.noKoeder ? <span style={S.hint}>Kein Köder eingetragen.</span> : (
          <div style={box}>
            {sd.koeder.map((k: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <span style={{ font: '500 14px Archivo,sans-serif', fontVariantNumeric: 'tabular-nums', color: 'var(--muted)', width: 44, flex: 'none' }}>{k.t}</span>
                <span style={k.sw} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}><span style={{ font: '700 15px/1.3 Archivo,sans-serif' }}>{k.title}</span>{k.sub && <span style={{ font: '400 13px/1.4 Archivo,sans-serif', color: 'var(--muted)' }}>{k.sub}</span>}</div>
              </div>
            ))}
          </div>
        )}
        {sd.setup && <span style={{ font: '500 14px/1.4 Archivo,sans-serif', color: 'var(--muted)' }}>Setup: {sd.setup}</span>}
      </div>

      {(sd.hasNotes || sd.eindruck || sd.naechstesMal) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={h2}>Beobachtungen</h2>
          {sd.hasNotes && <div style={box}>{sd.notes.map((x: any, i: number) => <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--line)', font: '400 15px/1.4 Archivo,sans-serif' }}><span style={{ color: 'var(--muted)', width: 44, flex: 'none', fontVariantNumeric: 'tabular-nums' }}>{x.t}</span><span style={{ flex: 1 }}>{x.text}</span></div>)}</div>}
          {sd.eindruck && <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={S.label}>Eindruck</span><span style={{ font: '400 15px/1.45 Archivo,sans-serif' }}>{sd.eindruck}</span></div>}
          {sd.naechstesMal && <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={S.label}>Beim nächsten Mal testen</span><span style={{ font: '400 15px/1.45 Archivo,sans-serif' }}>{sd.naechstesMal}</span></div>}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h2 style={h2}>Umweltdaten</h2>
        <div style={{ ...box, padding: '2px 14px' }}>
          {sd.env.map((r: any, i: number) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ font: '500 12px Archivo,sans-serif', color: 'var(--muted)' }}>{r.k}</span><span style={{ font: '600 15px/1.3 Archivo,sans-serif' }}>{r.v}</span><span style={{ font: '400 12px/1.35 Archivo,sans-serif', color: 'var(--muted)' }}>{r.origin} · {r.src} · {r.stamp}</span></div>
              <span style={r.tagStyle}>{r.kind}</span>
            </div>
          ))}
          <div style={{ padding: '12px 0', font: '400 13px/1.45 Archivo,sans-serif', color: 'var(--muted)' }}>Wetter, Luftdruck, Wind, Mond und Tide ergänzt Claude beim Übertragen im Fangbuch.</div>
        </div>
      </div>
      <span style={{ font: '400 12px Archivo,sans-serif', color: 'var(--muted)' }}>App-ID {sd.appId}</span>
    </div>
  );
}
