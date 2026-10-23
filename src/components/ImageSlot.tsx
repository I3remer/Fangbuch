// Foto-Feld: antippen öffnet Kamera oder Galerie, am Rechner geht auch Hineinziehen.
// Das Bild wird unter der id dauerhaft und offline auf dem Gerät gespeichert.
import React, { useEffect, useRef, useState } from 'react';
import { getPhoto, onPhotoChange, removePhoto, setPhoto } from '../storage';

type Props = { id: string; placeholder?: string; shape?: string; radius?: string | number; style?: React.CSSProperties; small?: boolean };

export function ImageSlot({ id, placeholder = 'Foto hinzufügen', shape = 'rounded', radius = 12, style, small }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    const load = () => getPhoto(id).then((d) => { if (alive) setUrl(d); });
    load();
    const off = onPhotoChange(id, load);
    return () => { alive = false; off(); };
  }, [id]);

  const store = async (file?: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    setBusy(true);
    try { await setPhoto(id, file); } catch { window.alert('Das Bild konnte nicht gespeichert werden.'); }
    setBusy(false);
  };

  const br = shape === 'circle' ? '50%' : shape === 'pill' ? 9999 : shape === 'rect' ? 0 : Number(radius);

  return (
    <div
      onClick={() => input.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); store(e.dataTransfer.files?.[0]); }}
      style={{ display: 'block', position: 'relative', overflow: 'hidden', borderRadius: br, background: over ? 'rgba(201,100,66,.10)' : 'rgba(127,127,127,.08)', color: 'var(--muted)', cursor: 'pointer', outline: over ? '2px solid var(--orange)' : 'none', outlineOffset: -2, ...style }}
    >
      <input ref={input} type="file" accept="image/*" hidden onClick={(e) => e.stopPropagation()} onChange={(e) => { store(e.target.files?.[0]); e.target.value = ''; }} />
      {url ? (
        <>
          <img src={url} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          {!small && (
            <button
              aria-label="Foto entfernen"
              onClick={(e) => { e.stopPropagation(); if (window.confirm('Foto entfernen?')) removePhoto(id); }}
              style={{ position: 'absolute', top: 4, right: 4, width: 30, height: 30, borderRadius: '50%', border: 0, background: 'rgba(5,10,8,.55)', color: '#fff', font: '700 16px/1 Archivo, sans-serif', cursor: 'pointer', zIndex: 4 }}
            >×</button>
          )}
        </>
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, textAlign: 'center', padding: 8, font: '500 13px/1.3 Archivo, sans-serif', border: '1.5px dashed color-mix(in oklab, currentColor 35%, transparent)', borderRadius: br }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
            <path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" />
          </svg>
          {!small && <span style={{ maxWidth: '90%' }}>{busy ? 'Wird gespeichert …' : placeholder}</span>}
        </div>
      )}
    </div>
  );
}
