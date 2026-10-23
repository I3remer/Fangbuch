// Der Index-Balken aus „Indexbalken.dc.html“. Unter 5 eigenen Sessions ist er vorläufig:
// schraffiert und/oder gestrichelt umrandet, je nach Darstellungsmodus.
type Props = { value?: number; own?: number; size?: 'm' | 'l' | string; mode?: string; basis?: string | null; hideBasis?: boolean };

const WORDS = ['', 'schwach', 'mäßig', 'mittel', 'gut', 'sehr gut'];

export function Indexbalken({ value = 50, own = 0, size = 'm', mode = 'beides', basis, hideBasis = false }: Props) {
  const v = Math.max(0, Math.min(100, Number(value ?? 50)));
  const n = Number(own ?? 0);
  const prov = n < 5;
  const lvl = v >= 80 ? 5 : v >= 65 ? 4 : v >= 50 ? 3 : v >= 35 ? 2 : 1;
  const c = `var(--s${lvl})`;
  const big = size === 'l';
  const h = big ? 14 : 10;
  const hatch = prov && mode !== 'kontur';
  const dash = prov && mode !== 'schraffur';
  const basisText = basis ?? (n === 0 ? 'Fachwissen' : n < 8 ? `Fachwissen und ${n} eigene ${n === 1 ? 'Session' : 'Sessions'}` : `${n} eigene Sessions`);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: h, borderRadius: h / 2, background: 'var(--track)', position: 'relative', overflow: 'hidden', outline: dash ? '1.5px dashed var(--muted)' : 'none', outlineOffset: 2 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: v + '%', borderRadius: h / 2, background: hatch ? `repeating-linear-gradient(135deg, ${c} 0 5px, color-mix(in oklab, ${c} 35%, transparent) 5px 9px)` : c }} />
        </div>
        <span style={{ font: `700 ${big ? 15 : 13}px/1 Archivo, sans-serif`, color: 'var(--ink)', minWidth: big ? 66 : 58, textAlign: 'right', whiteSpace: 'nowrap' }}>{WORDS[lvl]}</span>
      </div>
      {!hideBasis && <span style={{ font: '500 12px/1.3 Archivo,sans-serif', color: 'var(--muted)', textAlign: 'left' }}>{(prov ? 'Vorläufig · ' : '') + basisText}</span>}
    </div>
  );
}
