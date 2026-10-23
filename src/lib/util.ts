// Hilfsfunktionen. Zeit-, Zahl- und Namenslogik stammt unverändert aus der bisherigen App,
// damit IDs, Kürzel und Uhrzeiten genau wie vorher entstehen.

export const pad = (n: number) => String(n).padStart(2, '0');
export const hhmm = (d: Date) => pad(d.getHours()) + ':' + pad(d.getMinutes());
export const isoDate = (d: Date) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
export const NF1 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });
export const de = (n: number, d = 1) => n.toFixed(d).replace('.', ',');

export const num = (v: any): number | null => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v !== 'string') return null;
  const t = v.trim().replace(',', '.');
  return /^[+-]?\d+(\.\d+)?$/.test(t) ? parseFloat(t) : null;
};
export const str = (v: any) => (v == null ? '' : String(v));
export const trim = (v: any) => String(v == null ? '' : v).trim();
export const toMin = (t: any): number | null => {
  if (typeof t !== 'string') return null;
  const m = /^(\d{1,2}):(\d{2})/.exec(t.trim());
  return m ? +m[1] * 60 + +m[2] : null;
};
export const isTime = (t: any) => typeof t === 'string' && /^([01]?\d|2[0-3]):[0-5]\d$/.test(t.trim());
export const fmtClock = (m: number) => { m = ((Math.round(m) % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
export const normTime = (t: any) => { const m = toMin(t); return m == null ? '' : fmtClock(m); };
export const fmtDur = (min: number | null) => {
  if (min == null || !Number.isFinite(min)) return '';
  const t = Math.max(0, Math.round(min));
  return Math.floor(t / 60) + ':' + pad(t % 60) + ' h';
};
export const parseDate = (s: any) => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
export const plural = (n: number, one: string, many: string) => `${NF1.format(n)} ${n === 1 ? one : many}`;
const translit = (s: string) => s.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue').replace(/ß/g, 'ss');
export const slugify = (s: string) => translit(String(s).toLowerCase()).normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
export const initials = (s: string) => {
  const w = translit(String(s)).normalize('NFKD').replace(/[^A-Za-z0-9 ]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  let k = w.slice(0, 3).map((x) => x[0]).join('').toUpperCase();
  if (k.length < 2 && w[0]) k = w[0].slice(0, 2).toUpperCase();
  return k.replace(/[^A-Z0-9]/g, '') || 'GW';
};
export const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));
export const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
export const uniq = (arr: any[]) => Array.from(new Set(arr.filter(Boolean).map(String)));
export const uuid = () => {
  if (crypto.randomUUID) return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};
export const daysSince = (datum: string) => { const d = parseDate(datum); if (!d) return 0; const t = new Date(); t.setHours(0, 0, 0, 0); return Math.round((+t - +d) / 86400000); };
export const today = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
export const days = (a: Date, b: Date) => Math.round((+b - +a) / 86400000);
export const fd = (d: Date) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
export const fds = (d: Date) => fd(d).slice(0, 6);
export const DF_WD = new Intl.DateTimeFormat('de-DE', { weekday: 'short' });
export const DF_LONG = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
export const DF_TS = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
export const dayLabel = (d: Date | null) => (d ? `${DF_WD.format(d).replace('.', '')} ${fds(d)}` : '');

export function fmtAny(v: any): string {
  if (v == null) return '';
  if (Array.isArray(v)) return v.map(fmtAny).filter(Boolean).join(', ');
  if (typeof v === 'object') return Object.entries(v).map(([k, x]) => `${k}: ${fmtAny(x)}`).join(', ');
  if (typeof v === 'boolean') return v ? 'ja' : 'nein';
  if (typeof v === 'number') return NF1.format(v);
  return String(v);
}

// Sonnenauf- und -untergang in Minuten nach Mitternacht (Ortszeit), wie in der bisherigen App.
export function sunTimes(date: Date, lat: number, lon: number) {
  const rad = Math.PI / 180;
  const J = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12) / 86400000 + 2440587.5;
  const n = Math.round(J - 2451545.0 + 0.0008);
  const Js = n - lon / 360;
  const M = ((357.5291 + 0.98560028 * Js) % 360 + 360) % 360;
  const C = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad);
  const L = (M + C + 180 + 102.9372) % 360;
  const Jt = 2451545.0 + Js + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * L * rad);
  const dec = Math.asin(Math.sin(L * rad) * Math.sin(23.44 * rad));
  const cw = (Math.sin(-0.833 * rad) - Math.sin(lat * rad) * Math.sin(dec)) / (Math.cos(lat * rad) * Math.cos(dec));
  if (cw < -1 || cw > 1) return null;
  const w = Math.acos(cw) / rad;
  const loc = (Jd: number) => { const d = new Date((Jd - 2440587.5) * 86400000); return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60; };
  return { sa: loc(Jt - w / 360), su: loc(Jt + w / 360) };
}

export function parseJsonLoose(text: string) {
  const t = String(text || '').replace(/^﻿/, '');
  try { return JSON.parse(t); } catch { /* weiter */ }
  const fence = /```(?:json)?\s*([\s\S]*?)```/.exec(t);
  if (fence) { try { return JSON.parse(fence[1]); } catch { /* weiter */ } }
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a !== -1 && b > a) return JSON.parse(t.slice(a, b + 1));
  throw new Error('kein JSON');
}

export function download(text: string, fname: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url; a.download = fname;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function pickFile(accept: string) {
  return new Promise<File | null>((res) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = () => res(input.files?.[0] ?? null);
    input.click();
  });
}

export function spanOfTimes(beginn: any, ende: any, nowFallback?: boolean) {
  const b = toMin(beginn);
  if (b == null) return null;
  let e = toMin(ende);
  if (e == null && nowFallback) e = toMin(hhmm(new Date()));
  if (e != null && e < b) e += 1440;
  return { b, e };
}
