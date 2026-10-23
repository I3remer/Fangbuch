// Kleine Bausteine im Stil des Designs für Formulare, die der Prototyp nicht vorgesehen hatte
// (Köder mit Montage, Session bearbeiten, Übertragen und Import).
import React, { useState } from 'react';
import { chip } from '../lib/fachwissen';

export const S = {
  label: { font: '700 12px Archivo,sans-serif', letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)' } as React.CSSProperties,
  input: { height: 52, borderRadius: 12, border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', padding: '0 14px', font: '500 16px Archivo,sans-serif', width: '100%', minWidth: 0 } as React.CSSProperties,
  card: { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 } as React.CSSProperties,
  h1: { margin: '-8px 0 0', font: '800 30px/1 Archivo,sans-serif', fontStretch: '125%' } as React.CSSProperties,
  h2: { margin: 0, font: '800 19px/1.1 Archivo,sans-serif', fontStretch: '118%' } as React.CSSProperties,
  cardTitle: { font: '800 18px Archivo,sans-serif', fontStretch: '115%' } as React.CSSProperties,
  hint: { font: '400 14px/1.45 Archivo,sans-serif', color: 'var(--muted)' } as React.CSSProperties,
  primary: { height: 56, borderRadius: 16, border: 0, background: 'var(--ink)', color: 'var(--bg)', font: '800 16px Archivo,sans-serif', cursor: 'pointer', padding: '0 16px' } as React.CSSProperties,
  outline: { minHeight: 52, borderRadius: 14, border: '1.5px solid var(--ink)', background: 'transparent', color: 'var(--ink)', font: '700 15px Archivo,sans-serif', cursor: 'pointer', padding: '0 14px' } as React.CSSProperties,
  ghost: { minHeight: 52, borderRadius: 14, border: '1px solid var(--line)', background: 'transparent', color: 'var(--ink)', font: '700 15px Archivo,sans-serif', cursor: 'pointer', padding: '0 14px' } as React.CSSProperties,
  dashed: { minHeight: 52, borderRadius: 14, border: '1.5px dashed var(--muted)', background: 'transparent', color: 'var(--ink)', font: '700 15px Archivo,sans-serif', cursor: 'pointer', padding: '0 14px' } as React.CSSProperties,
  danger: { minHeight: 52, borderRadius: 16, border: '1.5px solid var(--minus)', background: 'transparent', color: 'var(--minus)', font: '700 15px Archivo,sans-serif', cursor: 'pointer' } as React.CSSProperties,
  link: { border: 0, background: 'transparent', color: 'var(--reed)', font: '700 14px Archivo,sans-serif', cursor: 'pointer', padding: '6px 0', textAlign: 'left' } as React.CSSProperties,
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 } as React.CSSProperties,
};

type FieldProps = { label: string; value: any; onChange: (v: string) => void; type?: string; placeholder?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']; list?: string; onBlur?: () => void };
export function Field({ label, value, onChange, type = 'text', placeholder, inputMode, list, onBlur }: FieldProps) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      <span style={S.label}>{label}</span>
      <input type={type} value={value ?? ''} placeholder={placeholder} inputMode={inputMode} list={list} autoComplete="off" onBlur={onBlur} onChange={(e) => onChange(e.target.value)} style={S.input} />
    </label>
  );
}
export function Area({ label, value, onChange, placeholder, rows = 3 }: { label: string; value: any; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={S.label}>{label}</span>
      <textarea value={value ?? ''} rows={rows} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={{ ...S.input, height: 'auto', minHeight: 80, padding: '12px 14px', font: '500 16px/1.4 Archivo,sans-serif', resize: 'vertical' }} />
    </label>
  );
}
export type Opt = { label: string; on: boolean; pick: () => void };
export function Chips({ label, opts, small }: { label?: string; opts: Opt[]; small?: boolean }) {
  if (!opts.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && <span style={S.label}>{label}</span>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {opts.map((o, i) => <button key={i} type="button" onClick={o.pick} style={{ ...chip(o.on), height: small ? 40 : 44, padding: small ? '0 12px' : '0 14px', fontSize: small ? 14 : 15 }}>{o.label}</button>)}
      </div>
    </div>
  );
}
// Auswahl aus einer Liste plus „Eigene Eingabe“ als Textfeld.
export function ChoiceText({ label, list, value, onChange, placeholder }: { label: string; list: string[]; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const custom = !!value && !list.includes(value);
  const [own, setOwn] = useState(custom);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Chips label={label} small opts={[...list.map((x) => ({ label: x, on: !own && value === x, pick: () => { setOwn(false); onChange(value === x ? '' : x); } })), { label: 'Eigene …', on: own, pick: () => { setOwn(true); if (list.includes(value)) onChange(''); } }]} />
      {own && <input value={value} placeholder={placeholder || 'Eigene Eingabe'} autoComplete="off" onChange={(e) => onChange(e.target.value)} style={S.input} />}
    </div>
  );
}
export function Check({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 48, border: 0, background: 'transparent', color: 'var(--ink)', font: '600 15px Archivo,sans-serif', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
      <span style={{ width: 26, height: 26, borderRadius: 8, border: value ? '0' : '1.5px solid var(--muted)', background: value ? 'var(--reed)' : 'transparent', color: 'var(--onreed)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '800 15px Archivo,sans-serif', flex: 'none' }}>{value ? '✓' : ''}</span>
      {label}
    </button>
  );
}
export function Toggle({ title, sub, value, onChange }: { title: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} style={{ display: 'flex', alignItems: 'center', gap: 12, border: 0, background: 'transparent', color: 'var(--ink)', cursor: 'pointer', padding: 0, textAlign: 'left', width: '100%' }}>
      <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}><span style={{ font: '700 15px Archivo,sans-serif' }}>{title}</span>{sub && <span style={{ font: '400 13px/1.4 Archivo,sans-serif', color: 'var(--muted)' }}>{sub}</span>}</span>
      <span style={{ width: 52, height: 32, borderRadius: 16, background: value ? 'var(--reed)' : 'var(--track)', position: 'relative', flex: 'none', transition: 'background .15s' }}><span style={{ position: 'absolute', top: 3, left: value ? 23 : 3, width: 26, height: 26, borderRadius: '50%', background: 'var(--surface)', boxShadow: '0 1px 3px rgba(0,0,0,.3)', transition: 'left .15s' }} /></span>
    </button>
  );
}
export function Collapse({ title, hint, children, start = false }: { title: string; hint?: string; children: React.ReactNode; start?: boolean }) {
  const [open, setOpen] = useState(start);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button type="button" onClick={() => setOpen(!open)} style={{ minHeight: 52, borderRadius: 14, border: '1px solid var(--line)', background: 'var(--surface2)', color: 'var(--ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 14px', font: '700 15px Archivo,sans-serif', textAlign: 'left' }}>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}><span>{title}</span>{hint && !open && <span style={{ font: '500 12px/1.3 Archivo,sans-serif', color: 'var(--muted)' }}>{hint}</span>}</span>
        <span style={{ fontSize: 20 }}>{open ? '−' : '+'}</span>
      </button>
      {open && children}
    </div>
  );
}
export function Note({ tone, children }: { tone?: 'warn' | 'ok'; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'var(--surface2)', borderRadius: 12, padding: 12, border: tone === 'warn' ? '2px solid var(--orange)' : tone === 'ok' ? '1.5px solid var(--plus)' : '0' }}>
      <span style={{ font: '800 14px/1 Archivo,sans-serif', width: 22, height: 22, borderRadius: '50%', background: tone === 'ok' ? 'var(--plus)' : 'var(--orange)', color: 'var(--onorange)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{tone === 'ok' ? '✓' : '!'}</span>
      <div style={{ font: '500 14px/1.45 Archivo,sans-serif', display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}
