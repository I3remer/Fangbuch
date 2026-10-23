// Lizenzen und Regeln je Fischart. Lizenzen werden einmal gespeichert und mehreren Gewässern zugeordnet.
import { days, fd, fds, parseDate, today } from './util';

const dnum = (s: string) => { const [d, m] = s.split('.').map(Number); return m * 100 + d; };
// Liegt heute in der Schonzeit von „TT.MM.“ bis „TT.MM.“ (auch über den Jahreswechsel)?
export function inSchon(a?: string, b?: string, d = new Date()) {
  if (!a || !b) return false;
  const t = (d.getMonth() + 1) * 100 + d.getDate(), x = dnum(a), y = dnum(b);
  return x <= y ? t >= x && t <= y : t >= x || t <= y;
}

const bdg = (bg: string, c: string, b: string) => ({ font: '700 12px/1 Archivo, sans-serif', padding: '7px 9px', borderRadius: 8, flex: 'none', background: bg, color: c, border: b });
export function licVm(l: any, vl0: number, short: (slug: string) => string) {
  const vl = l.vl || vl0;
  const base = { ...l, watersT: 'gilt für ' + ((l.waters || []).map(short).join(', ') || 'kein Gewässer'), slotId: 'lic-' + l.id, costOrder: [l.cost, l.order ? `Bestellen: ${l.order}` : ''].filter(Boolean).join(' · ') };
  const t = parseDate(l.to);
  if (!t) return { ...base, state: 'ok', hasBar: false, status: 'unbefristet', badge: bdg('transparent', 'var(--plus)', '1.5px solid var(--plus)'), line: 'Unbefristet gültig', toT: '', fromT: '', orderT: '' };
  const f = parseDate(l.from) || t;
  const now = today();
  const left = days(now, t), ord = new Date(t.getTime() - vl * 7 * 86400000), tot = Math.max(1, days(f, t));
  const state = left < 0 ? 'expired' : days(now, ord) <= 0 ? 'due' : 'ok';
  const pc = (x: number) => Math.max(0, Math.min(100, (x / tot) * 100));
  const nowP = pc(days(f, now)), ordP = pc(days(f, ord));
  const col = state === 'expired' ? 'var(--minus)' : state === 'due' ? 'var(--orange)' : 'var(--reed)';
  return {
    ...base, state, hasBar: true, status: state === 'expired' ? 'abgelaufen' : state === 'due' ? 'bestellen' : 'gültig',
    badge: state === 'ok' ? bdg('transparent', 'var(--plus)', '1.5px solid var(--plus)') : bdg(col, 'var(--surface)', '0'),
    fill: state === 'expired' ? { position: 'absolute', inset: 0, borderRadius: 5, background: 'repeating-linear-gradient(135deg, var(--minus) 0 5px, transparent 5px 9px)' } : { position: 'absolute', left: nowP + '%', right: 0, top: 0, bottom: 0, borderRadius: 5, background: col },
    tick: { position: 'absolute', left: ordP + '%', top: -4, bottom: -4, width: 2, marginLeft: -1, background: 'var(--ink)' },
    now: { position: 'absolute', left: nowP + '%', top: -6, width: 4, height: 22, marginLeft: -2, borderRadius: 2, background: 'var(--ink)', display: state === 'expired' ? 'none' : 'block' },
    fromT: fds(f), toT: fd(t), orderT: `bestellen ab ${fds(ord)}`,
    line: state === 'expired' ? `Abgelaufen seit ${fd(t)}, vor ${-left} Tagen. Neu bestellen.` : state === 'due' ? `Noch ${left} Tage gültig. Neu bestellen ist fällig.` : `Noch ${left} Tage gültig. Neu bestellen ab ${fds(ord)}.`,
  };
}

// Regeln aus dem Fangbuch sind Freitext. Wo eine Zeile nach „Art: Schonzeit TT.MM. bis TT.MM., Mindestmaß N cm“ aussieht,
// entsteht daraus ein Tabelleneintrag; die übrigen Zeilen erscheinen als weitere Beschränkungen.
export function parseRegeln(regeln: any[], fishes: string[]) {
  const rows: any[] = [], rest: string[] = [];
  (Array.isArray(regeln) ? regeln : []).forEach((r) => {
    const t = typeof r === 'string' ? r : r && (r.text || r.regel || JSON.stringify(r));
    if (!t) return;
    const art = fishes.find((f) => new RegExp('^\\s*' + f + '\\b', 'i').test(t));
    const sz = /(\d{1,2}\.\d{1,2}\.)\s*(?:bis|-|–)\s*(\d{1,2}\.\d{1,2}\.)/.exec(t);
    const mm = /Mindestma(?:ß|ss)\s*(\d+)\s*cm/i.exec(t);
    const hm = /Höchstma(?:ß|ss)\s*(\d+)\s*cm/i.exec(t);
    const lim = /(\d+)\s*(?:Stück\s*)?(?:pro|je)\s*Tag/i.exec(t);
    if (art && (sz || mm || hm)) rows.push({ art, von: sz ? sz[1] : '', bis: sz ? sz[2] : '', min: mm ? mm[1] : '', max: hm ? hm[1] : '', limit: lim ? lim[1] : '', quelle: 'Fangbuch', stand: '' });
    else rest.push(t);
  });
  return { rows, rest };
}
