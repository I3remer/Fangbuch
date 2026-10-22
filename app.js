(() => {
'use strict';

/* ---------- Hilfsfunktionen ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NF1 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });
const pad = n => String(n).padStart(2, '0');
const hhmm = d => pad(d.getHours()) + ':' + pad(d.getMinutes());
const isoDate = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const num = v => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v !== 'string') return null;
  const t = v.trim().replace(',', '.');
  return /^[+-]?\d+(\.\d+)?$/.test(t) ? parseFloat(t) : null;
};
const str = v => v == null ? '' : String(v);
const trim = v => String(v == null ? '' : v).trim();
const toMin = t => {
  if (typeof t !== 'string') return null;
  const m = /^(\d{1,2}):(\d{2})/.exec(t.trim());
  return m ? (+m[1]) * 60 + (+m[2]) : null;
};
const isTime = t => typeof t === 'string' && /^([01]?\d|2[0-3]):[0-5]\d$/.test(t.trim());
const fmtClock = m => { m = ((Math.round(m) % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
const normTime = t => { const m = toMin(t); return m == null ? '' : fmtClock(m); };
const fmtDur = min => {
  if (min == null || !Number.isFinite(min)) return '';
  const t = Math.max(0, Math.round(min));
  return Math.floor(t / 60) + ':' + pad(t % 60) + ' h';
};
const parseDate = s => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
const DF_WD = new Intl.DateTimeFormat('de-DE', { weekday: 'short' });
const DF_LONG = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const DF_MONTH = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });
const DF_SHORT = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
const DF_TS = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const plural = (n, one, many) => `${NF1.format(n)} ${n === 1 ? one : many}`;
const translit = s => s.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue').replace(/ß/g, 'ss');
const slugify = s => translit(String(s).toLowerCase()).normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
const initials = s => {
  const w = translit(String(s)).normalize('NFKD').replace(/[^A-Za-z0-9 ]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  let k = w.slice(0, 3).map(x => x[0]).join('').toUpperCase();
  if (k.length < 2 && w[0]) k = w[0].slice(0, 2).toUpperCase();
  return k.replace(/[^A-Z0-9]/g, '') || 'GW';
};
const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* egal */ } };
const clone = o => JSON.parse(JSON.stringify(o));
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const uniq = arr => Array.from(new Set(arr.filter(Boolean).map(String)));
const uuid = () => {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
  const h = Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};
const daysSince = datum => { const d = parseDate(datum); if (!d) return 0; const t = new Date(); t.setHours(0, 0, 0, 0); return Math.round((t - d) / 86400000); };
function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}
function setPath(obj, path, val) {
  const parts = path.split('.');
  let o = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (o[parts[i]] == null) o[parts[i]] = {};
    o = o[parts[i]];
  }
  o[parts[parts.length - 1]] = val;
}

function fmtAny(v) {
  if (v == null) return '';
  if (Array.isArray(v)) return v.map(fmtAny).filter(Boolean).join(', ');
  if (typeof v === 'object') return Object.entries(v).map(([k, x]) => `${k}: ${fmtAny(x)}`).join(', ');
  if (typeof v === 'boolean') return v ? 'ja' : 'nein';
  if (typeof v === 'number') return NF1.format(v);
  return String(v);
}

/* ---------- Konstanten ---------- */
const SCHEMA_VERSION = 4;
const TYP = { fang: 'Fang', fehlbiss: 'Fehlbiss', aussteiger: 'Aussteiger', nachlaeufer: 'Nachläufer' };
const BISS = ['fang', 'fehlbiss', 'aussteiger'];
const ZIELFISCHE = ['Barsch', 'Hecht', 'Zander', 'Meerforelle', 'Bachforelle'];
const ARTEN = ['Barsch', 'Hecht', 'Zander', 'Meerforelle', 'Bachforelle', 'Rotauge', 'Brasse'];
const KOEDERTYP = ['Gummifisch', 'Swimbait', 'Wobbler', 'Jerkbait', 'Glidebait', 'Spinner', 'Blinker', 'Spinnerbait', 'Dropshot', 'Creature'];
const FUEHRUNG = ['monoton eingekurbelt', 'Faulenzen', 'Jiggen', 'Twitchen', 'Stop and Go'];
const SCHICHT = ['grundnah', 'Mittelwasser', 'oberflächennah'];
const MONTAGE = ['Jigkopf', 'Swimbait-Haken mit Bauchblei', 'Offset-/Texas-Rig', 'Cheburashka', 'Dropshot', 'Carolina-Rig', 'Drillinge am Köder (Hardbait)'];
const AUSTRITT = ['vorderes Drittel', 'Körpermitte', 'hinteres Drittel'];
const SPITZE = ['frei', 'verdeckt'];
const STINGERPOS = ['hinteres Drittel Bauch', 'hinteres Drittel Rücken', 'Schwanzwurzel'];
const GWTYP = ['Talsperre', 'Hafenbecken', 'Fluss', 'Bach', 'See', 'Kanal'];
const VIEWS = ['sessions', 'gewaesser', 'uebertragen', 'daten', 'live'];
const KAT = { koeder: 'Köder', technik: 'Technik', montage: 'Montage', spot: 'Spot', zeitfenster: 'Zeitfenster', allgemein: 'Allgemein' };
const STATUS = { offen: 'Noch nicht getestet', im_test: 'Im Test', bestaetigt: 'Bestätigt', verworfen: 'Verworfen' };
const BED = { saison: 'Jahreszeit', monate: 'Monate', wassertemp: 'Wassertemperatur', licht: 'Licht', tageszeit: 'Tageszeit', wind: 'Wind', luftdruck: 'Luftdruck', wasserstand: 'Wasserstand', truebung: 'Trübung', tide: 'Tide', spot: 'Spot', tiefe: 'Tiefe' };
const EXPORT_INTRO = 'Übernimm diese Sessions aus der Fangbuch-App ins Fangbuch:';
const DEFAULT_SUN = { lat: 51.2, lon: 10.4 };
const STALE_DAYS = 7;
const EIGEN = '__eigen';
const NEU = '__neu';
const BILD_MAX = 1280;
const defaultSettings = () => ({ gps: false, sunPos: null, typen: [], montagen: [], setups: [], lastSetup: {} });

/* ---------- Speicher (IndexedDB) ---------- */
const DB_NAME = 'fangbuch-app';
const STORES = { sessions: 'appId', gewaesser: 'slug', empfehlungen: 'id', meta: 'key', bilder: 'id' };
let idb = null;
function openDb() {
  return new Promise((res, rej) => {
    if (!('indexedDB' in window)) { rej(new Error('kein IndexedDB')); return; }
    const r = indexedDB.open(DB_NAME, 2);
    r.onupgradeneeded = () => {
      const d = r.result;
      Object.entries(STORES).forEach(([n, key]) => { if (!d.objectStoreNames.contains(n)) d.createObjectStore(n, { keyPath: key }); });
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
    r.onblocked = () => rej(new Error('blockiert'));
  });
}
function tx(stores, mode, fn) {
  return new Promise((res, rej) => {
    const t = idb.transaction(stores, mode);
    let out;
    t.oncomplete = () => res(out);
    t.onerror = () => rej(t.error);
    t.onabort = () => rej(t.error || new Error('abgebrochen'));
    out = fn(t);
  });
}
function req(store, fn) {
  return new Promise((res, rej) => {
    const r = fn(idb.transaction(store).objectStore(store));
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
const getAll = store => req(store, s => s.getAll()).then(x => x || []);
const getKeys = store => req(store, s => s.getAllKeys()).then(x => x || []);
const getOne = (store, key) => req(store, s => s.get(key));
const put = (store, obj) => tx([store], 'readwrite', t => { t.objectStore(store).put(clone(obj)); });
const del = (store, key) => tx([store], 'readwrite', t => { t.objectStore(store).delete(key); });
const putMeta = (key, value) => put('meta', { key, value });

let writeChain = Promise.resolve();
function persist(store, obj) {
  const p = writeChain.then(() => put(store, obj));
  writeChain = p.catch(() => {});
  p.catch(() => toast('Speichern fehlgeschlagen. Ist der Speicher des Handys voll?'));
  return p;
}
const saveSession = s => persist('sessions', s);

/* ---------- Zustand ---------- */
const state = {
  ready: false, failed: false,
  sessions: [], gewaesser: [], gwMap: {}, empfehlungen: [],
  settings: defaultSettings(),
  pending: null, lastBackup: null,
  view: 'sessions',
  f: { sOnlyOpen: false },
  form: null,
  live: null, lastEnded: null, evEdit: null, endConfirm: false,
  edit: null, setupEdit: null, open: null, delConfirm: false, tipsOpen: false, openDet: new Set(),
  exp: null, importMsg: null, importText: '', restore: null, listAdd: { typen: '', montagen: '' },
  bildCache: new Map(),
  timer: null, wakeLock: null, swWaiting: null
};
const emptyForm = () => ({ gw: '', gwNeu: '', spot: '', spotNeu: '', ziel: 'Barsch', art: 'Ufer', setup: '', vorfach: '', wt: '', sicht: '', k0: kDraft(null), kNeu: kDraft(null), note: '', evd: null });

let toastT;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ---------- Ableitungen ---------- */
function spanOf(s, nowFallback) {
  const b = toMin(s.beginn);
  if (b == null) return null;
  let e = toMin(s.ende);
  if (e == null && nowFallback) e = toMin(hhmm(new Date()));
  if (e != null && e < b) e += 1440;
  return { b, e };
}
function evMin(ev, b) {
  let m = toMin(ev && ev.zeit);
  if (m == null) return null;
  if (b != null && m < b - 90) m += 1440;
  return m;
}
const events = s => Array.isArray(s.ereignisse) ? s.ereignisse.filter(e => e && typeof e === 'object') : [];
const u = s => (s.umwelt && typeof s.umwelt === 'object') ? s.umwelt : {};
const isLive = s => s.live === true && !s.ende;
const isDone = s => !!s._uebertragenAm;
const isNewGw = g => g._quelle === 'app' && !g._uebertragenAm;
const openSessions = () => state.sessions.filter(s => !isDone(s) && !isLive(s));
const openGw = () => state.gewaesser.filter(isNewGw);
const spotGw = () => state.gewaesser.filter(g => !isNewGw(g) && (g._neueSpots || []).length);
function statsOf(s) {
  const ev = events(s);
  const bisse = ev.filter(e => BISS.includes(e.typ)).length;
  const faenge = ev.filter(e => e.typ === 'fang').length;
  const nach = ev.filter(e => e.typ === 'nachlaeufer').length;
  let min = num(s.angelzeitMin);
  if (min == null || isLive(s)) { const sp = spanOf(s, isLive(s)); if (sp && sp.e != null) min = sp.e - sp.b; }
  return { bisse, faenge, nach, min };
}
function kennzahlen(s) {
  const st = statsOf(s);
  const h = st.min ? st.min / 60 : 0;
  return {
    bisse: st.bisse, faenge: st.faenge, nachlaeufer: st.nach,
    bisseProStunde: h ? Math.round(st.bisse / h * 100) / 100 : 0,
    faengeProStunde: h ? Math.round(st.faenge / h * 100) / 100 : 0
  };
}
function finalize(s) {
  const sp = spanOf(s);
  s.angelzeitMin = sp && sp.e != null ? Math.max(1, sp.e - sp.b) : null;
  s.kennzahlen = kennzahlen(s);
  s.aktualisiert = new Date().toISOString();
}
function gwName(s) { const g = state.gwMap[s.gewaesser]; return (g && g.name) || s.gewaesserName || s.gewaesser || 'Unbekanntes Gewässer'; }
function koederText(k) {
  if (!k || typeof k !== 'object') return fmtAny(k);
  const lab = k.label ? String(k.label) : '';
  const det = [k.typ, k.modell, k.farbe,
    num(k.groesseCm) != null ? NF1.format(num(k.groesseCm)) + ' cm' : '',
    num(k.gewichtG) != null ? NF1.format(num(k.gewichtG)) + ' g' : '']
    .filter(Boolean).map(String).filter(p => !lab || !lab.toLowerCase().includes(p.toLowerCase())).join(', ');
  if (lab && det) return lab + ' (' + det + ')';
  return lab || det || '';
}
function montageText(m) {
  if (!m || typeof m !== 'object') return '';
  const st = [m.stingerArt, m.stingerPosition].filter(Boolean).join(', ');
  return [m.art, num(m.bleiG) != null ? NF1.format(num(m.bleiG)) + ' g' : '', m.haken,
    m.hakenAustritt ? 'Austritt ' + m.hakenAustritt : '', m.hakenspitze ? 'Spitze ' + m.hakenspitze : '',
    m.stinger ? 'Stinger' + (st ? ' ' + st : '') : '', m.notiz].filter(Boolean).join(', ');
}
function koederExtra(k) {
  return [k.fuehrung ? 'Führung: ' + k.fuehrung : '', k.schicht ? 'Schicht: ' + k.schicht : '',
    num(k.jigkopfG) != null ? 'Jigkopf ' + NF1.format(num(k.jigkopfG)) + ' g' : '',
    montageText(k.montage) ? 'Montage: ' + montageText(k.montage) : ''].filter(Boolean).join('; ');
}
function currentKoeder(s) {
  const k = Array.isArray(s.koeder) ? s.koeder : [];
  if (!k.length) return '';
  const last = k[k.length - 1];
  return (last && (last.label || koederText(last))) || '';
}
function lenText(ev) {
  const L = num(ev.laengeCm);
  return L != null ? NF1.format(L) + ' cm' : '';
}
function zielOptions(g) { return uniq(ZIELFISCHE.concat(g && Array.isArray(g.zielfische) ? g.zielfische : [])).concat('Andere'); }
function artOptions(g) { return uniq(ARTEN.concat(g && Array.isArray(g.zielfische) ? g.zielfische : [], g && Array.isArray(g.fischarten) ? g.fischarten : [])).concat('Andere'); }
function spotNames(g) { return g && Array.isArray(g.spots) ? g.spots.map(x => x && (typeof x === 'string' ? x : x.name)).filter(Boolean) : []; }
const typList = () => uniq(KOEDERTYP.concat(state.settings.typen || []));
const montageList = () => uniq(MONTAGE.concat(state.settings.montagen || []));
const setupById = id => (state.settings.setups || []).find(x => x.id === id) || null;

/* ---------- Sonnenzeiten (für die Dämmerung in der Zeitleiste) ---------- */
function sunTimes(date, lat, lon) {
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
  const loc = Jd => { const d = new Date((Jd - 2440587.5) * 86400000); return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60; };
  return { sa: loc(Jt - w / 360), su: loc(Jt + w / 360) };
}
function posFor(s) {
  const ok = p => p && num(p.lat) != null && num(p.lon) != null;
  if (ok(s.koordinaten)) return s.koordinaten;
  const g = state.gwMap[s.gewaesser];
  if (g && ok(g.koordinaten)) return g.koordinaten;
  if (ok(state.settings.sunPos)) return state.settings.sunPos;
  return DEFAULT_SUN;
}
function sunFor(s) {
  const U = u(s);
  let SA = toMin(U.sonnenaufgang), SU = toMin(U.sonnenuntergang);
  if (SA == null || SU == null) {
    const d = parseDate(s.datum);
    const p = posFor(s);
    const t = d && sunTimes(d, num(p.lat), num(p.lon));
    if (t) { if (SA == null) SA = Math.round(t.sa); if (SU == null) SU = Math.round(t.su); }
  }
  return { SA, SU };
}

/* ---------- Zeitleiste ---------- */
const SU_KEYS = [[-60, 'day'], [-10, 'gold'], [25, 'dusk'], [70, 'night']];
const SA_KEYS = [[-70, 'night'], [-25, 'dusk'], [10, 'gold'], [60, 'day']];
function mixKeys(d, keys) {
  if (d <= keys[0][0]) return `var(--sky-${keys[0][1]})`;
  const last = keys[keys.length - 1];
  if (d >= last[0]) return `var(--sky-${last[1]})`;
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, ca] = keys[i], [b, cb] = keys[i + 1];
    if (d >= a && d <= b) {
      const p = (d - a) / (b - a);
      return `color-mix(in oklab, var(--sky-${ca}) ${Math.round((1 - p) * 100)}%, var(--sky-${cb}))`;
    }
  }
  return 'var(--track)';
}
function skyAt(t, SA, SU) {
  const tod = ((t % 1440) + 1440) % 1440;
  if (SU != null && SA != null) { const noon = (SA + SU) / 2; return tod < noon ? mixKeys(tod - SA, SA_KEYS) : mixKeys(tod - SU, SU_KEYS); }
  if (SU != null) return mixKeys(tod - SU, SU_KEYS);
  if (SA != null) return mixKeys(tod - SA, SA_KEYS);
  return 'var(--track)';
}
function timeline(s, opts = {}) {
  const live = isLive(s);
  const sp = spanOf(s, live);
  if (!sp || sp.e == null) return '';
  const b = sp.b;
  const e = Math.max(sp.e, b + 1);
  const { SA, SU } = sunFor(s);
  const near = m => m != null && m >= b - 180 && m <= e + 180;
  const marks = [];
  // Sonnenzeiten auch am Folgetag prüfen, falls die Session über Mitternacht geht.
  [[SU, 'SU'], [SA, 'SA'], [SU != null ? SU + 1440 : null, 'SU'], [SA != null ? SA + 1440 : null, 'SA']].forEach(([m, l]) => { if (near(m)) marks.push({ m, l }); });
  const ws = Math.min(b, ...marks.map(x => x.m - 40)) - 10;
  const we = Math.max(e, ...marks.map(x => x.m + 40)) + 10;
  const W = we - ws;
  const P = m => (m - ws) / W * 100;
  let bg = 'var(--track)';
  if (SU != null || SA != null) {
    const N = 28, stops = [];
    for (let i = 0; i <= N; i++) stops.push(`${skyAt(ws + W * i / N, SA, SU)} ${(i / N * 100).toFixed(1)}%`);
    bg = `linear-gradient(90deg, ${stops.join(', ')})`;
  }
  let h = `<div class="tl${opts.lg ? ' lg' : ''}" aria-hidden="true"><div class="sky" style="background:${bg}"></div>`;
  marks.forEach(k => { h += `<div class="mark" style="left:${P(k.m).toFixed(2)}%"></div>`; });
  h += `<div class="span${live ? ' running' : ''}" style="left:${P(b).toFixed(2)}%;width:${(P(e) - P(b)).toFixed(2)}%"></div>`;
  events(s).forEach(ev => {
    const m = evMin(ev, b);
    if (m == null) return;
    const cls = TYP[ev.typ] ? ev.typ : 'fehlbiss';
    h += `<div class="ev ${cls}" style="left:${P(Math.min(Math.max(m, ws), we)).toFixed(2)}%"></div>`;
  });
  const pb = P(b), pe = P(e);
  if (pe - pb < 16) {
    // Kurze Session: Beginn und Ende als ein Label, am Rand nach innen ausgerichtet.
    const txt = live ? fmtClock(b) : fmtClock(b) + ' bis ' + fmtClock(e);
    h += pb > 60 ? `<span class="lab lab-end" style="left:${pe.toFixed(2)}%">${txt}</span>` : `<span class="lab" style="left:${pb.toFixed(2)}%">${txt}</span>`;
  } else {
    h += `<span class="lab" style="left:${pb.toFixed(2)}%">${fmtClock(b)}</span>`;
    if (!live) h += `<span class="lab lab-end" style="left:${pe.toFixed(2)}%">${fmtClock(e)}</span>`;
  }
  marks.forEach(k => {
    const pk = P(k.m);
    if (Math.abs(pk - pb) > 22 && (live || Math.abs(pk - pe) > 22)) h += `<span class="lab lab-mid" style="left:${pk.toFixed(2)}%">${k.l} ${fmtClock(k.m)}</span>`;
  });
  return h + '</div>';
}

/* ---------- Formular-Bausteine ---------- */
// Formularfelder schreiben über data-r (Ziel) und data-b (Pfad) direkt in einen Entwurf.
// data-r: f = state.form (Live), s = Setup-Entwurf, e = Entwurf im Bearbeiten-Formular.
function rootOf(r) {
  if (r === 'f') return state.form;
  if (r === 's') return state.setupEdit && state.setupEdit.d;
  return state.edit && state.edit.d;
}
const bind = (r, path) => `data-r="${r}" data-b="${path}"`;
const inp = (r, path, v, attrs = '') => `${bind(r, path)} value="${esc(v)}"${attrs}`;
function textFld(r, path, v, label, attrs = '') {
  return `<label class="fld"><span>${label}</span><input ${inp(r, path, v, ' autocomplete="off"' + attrs)}></label>`;
}
function selFld(r, path, v, label, opts, { empty = 'offen', rerender = false } = {}) {
  const list = opts.slice();
  if (v && !list.includes(v)) list.unshift(v);
  return `<label class="fld"><span>${label}</span><select ${bind(r, path)}${rerender ? ' data-rerender="1"' : ''}>${empty != null ? `<option value="">${empty}</option>` : ''}${list.map(o => `<option${o === v ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
}
// Auswahl mit „Eigene Eingabe …“: Der Entwurf hält EIGEN im Feld und den Text in <feld>Eigen.
function choiceFld(r, path, v, label, opts, eigenLabel, ph = '') {
  const isE = v === EIGEN;
  return `<label class="fld"><span>${label}</span><select ${bind(r, path)} data-rerender="1"><option value="">offen</option>${opts.map(o => `<option${o === v ? ' selected' : ''}>${esc(o)}</option>`).join('')}<option value="${EIGEN}"${isE ? ' selected' : ''}>${eigenLabel}</option></select></label>`
    + (isE ? textFld(r, path + 'Eigen', getPath(rootOf(r), path + 'Eigen') || '', label + ', eigene Eingabe', ph ? ` placeholder="${esc(ph)}"` : '') : '');
}
function detailsBox(key, title, body, hint) {
  const open = state.openDet.has(key);
  return `<details class="sub" data-det="${esc(key)}"${open ? ' open' : ''}><summary>${title}${hint ? `<span class="smeta sumhint">${esc(hint)}</span>` : ''}</summary>${body}</details>`;
}
function eigenSplit(v, opts) { return v && !opts.includes(v) ? [EIGEN, v] : [v || '', '']; }
function eigenValue(v, txt) { return v === EIGEN ? trim(txt) : trim(v); }

/* ---------- Köder ---------- */
function kDraft(k) {
  k = k ? clone(k) : {};
  const m = k.montage && typeof k.montage === 'object' ? k.montage : {};
  const d = { zeit: k.zeit || '', label: k.label || '', modell: k.modell || '', farbe: k.farbe || '', groesseCm: str(k.groesseCm), gewichtG: str(k.gewichtG), schicht: k.schicht || '' };
  [d.typ, d.typEigen] = eigenSplit(k.typ, typList());
  [d.fuehrung, d.fuehrungEigen] = eigenSplit(k.fuehrung, FUEHRUNG);
  d.montage = { bleiG: str(m.bleiG), haken: m.haken || '', hakenAustritt: m.hakenAustritt || '', hakenspitze: m.hakenspitze || '', stinger: !!m.stinger, stingerArt: m.stingerArt || '', notiz: m.notiz || '' };
  [d.montage.art, d.montage.artEigen] = eigenSplit(m.art, montageList());
  [d.montage.stingerPosition, d.montage.stingerPositionEigen] = eigenSplit(m.stingerPosition, STINGERPOS);
  if (k.jigkopfG != null) d.jigkopfG = k.jigkopfG;
  if (k._ts) d._ts = k._ts;
  return d;
}
function addCustom(key, val) {
  const list = key === 'typen' ? typList() : montageList();
  if (!val || list.includes(val)) return;
  state.settings[key] = uniq((state.settings[key] || []).concat(val));
  saveSettings();
}
function kClean(d) {
  const o = {};
  if (isTime(d.zeit)) o.zeit = normTime(d.zeit);
  const set = (k, v) => { if (v !== '' && v != null) o[k] = v; };
  set('label', trim(d.label));
  const typ = eigenValue(d.typ, d.typEigen);
  if (d.typ === EIGEN) addCustom('typen', typ);
  set('typ', typ);
  set('modell', trim(d.modell));
  set('farbe', trim(d.farbe));
  set('groesseCm', num(d.groesseCm));
  set('gewichtG', num(d.gewichtG));
  if (d.jigkopfG != null) set('jigkopfG', num(d.jigkopfG));
  set('fuehrung', eigenValue(d.fuehrung, d.fuehrungEigen));
  set('schicht', trim(d.schicht));
  const m = d.montage || {}, mo = {};
  const mset = (k, v) => { if (v !== '' && v != null) mo[k] = v; };
  const art = eigenValue(m.art, m.artEigen);
  if (m.art === EIGEN) addCustom('montagen', art);
  mset('art', art);
  mset('bleiG', num(m.bleiG));
  mset('haken', trim(m.haken));
  mset('hakenAustritt', trim(m.hakenAustritt));
  mset('hakenspitze', trim(m.hakenspitze));
  if (m.stinger) {
    mo.stinger = true;
    mset('stingerArt', trim(m.stingerArt));
    mset('stingerPosition', eigenValue(m.stingerPosition, m.stingerPositionEigen));
  }
  mset('notiz', trim(m.notiz));
  if (Object.keys(mo).length) { if (!mo.stinger) mo.stinger = false; o.montage = mo; }
  if (!o.label) o.label = o.modell || o.typ || '';
  if (!o.label) delete o.label;
  if (d._ts) o._ts = d._ts;
  return o;
}
const kHasContent = k => !!(k.label || k.typ || k.modell);
function knownLabels() {
  const all = [];
  state.sessions.forEach(s => (s.koeder || []).forEach(k => { if (k && k.label) all.push(k.label); }));
  return uniq(all).sort((a, b) => a.localeCompare(b, 'de'));
}
function lastKoeder(label) {
  const key = trim(label).toLowerCase();
  if (!key) return null;
  let best = null, bestKey = '';
  state.sessions.forEach(s => (s.koeder || []).forEach(k => {
    if (!k || trim(k.label).toLowerCase() !== key) return;
    const sk = `${s.datum || ''} ${normTime(k.zeit) || s.beginn || ''}`;
    if (!best || sk >= bestKey) { best = k; bestKey = sk; }
  }));
  return best;
}
// Füllt leere Felder eines Köder-Entwurfs mit den Angaben vom letzten Einsatz.
function prefillKoeder(d) {
  if (!d) return false;
  const k = lastKoeder(d.label);
  if (!k) return false;
  const p = kDraft(k);
  let changed = false;
  [['typ', 'typEigen'], ['modell'], ['farbe'], ['groesseCm'], ['gewichtG']].forEach(([f, f2]) => {
    if (!d[f] && p[f]) { d[f] = p[f]; if (f2) d[f2] = p[f2]; changed = true; }
  });
  const mEmpty = !kClean({ montage: d.montage }).montage;
  const pHas = !!kClean({ montage: p.montage }).montage;
  if (mEmpty && pHas) { d.montage = p.montage; changed = true; }
  return changed;
}
function koederForm(r, path, d, { withLabel = true, labelTitle = 'Köder' } = {}) {
  const m = d.montage || {};
  const mp = path + '.montage';
  const montageBody = choiceFld(r, mp + '.art', m.art, 'Montage', montageList(), 'Eigene Montage …', 'z. B. Ned-Rig')
    + `<div class="grid2">${textFld(r, mp + '.bleiG', m.bleiG, 'Kopf- bzw. Bleigewicht in g', ' inputmode="decimal"')}${textFld(r, mp + '.haken', m.haken, 'Haken (Modell, Größe)', ' placeholder="z. B. 5/0"')}</div>`
    + `<div class="grid2">${selFld(r, mp + '.hakenAustritt', m.hakenAustritt, 'Hakenaustritt', AUSTRITT)}${selFld(r, mp + '.hakenspitze', m.hakenspitze, 'Hakenspitze', SPITZE)}</div>`
    + `<label class="check"><input type="checkbox" ${bind(r, mp + '.stinger')} data-rerender="1"${m.stinger ? ' checked' : ''}> Stinger</label>`
    + (m.stinger ? textFld(r, mp + '.stingerArt', m.stingerArt, 'Stinger', ' placeholder="z. B. Drilling Gr. 4 an NiTi"')
      + choiceFld(r, mp + '.stingerPosition', m.stingerPosition, 'Stinger-Position', STINGERPOS, 'Eigene Eingabe …') : '')
    + textFld(r, mp + '.notiz', m.notiz, 'Notiz zur Montage');
  const mHint = montageText(kClean({ montage: m }).montage);
  return (withLabel ? `<label class="fld"><span>${labelTitle}</span><input ${inp(r, path + '.label', d.label, ' autocomplete="off" list="dl-klabels" data-prefill="1" placeholder="z. B. TT Shad 12 cm"')}></label>` : '')
    + choiceFld(r, path + '.typ', d.typ, 'Ködertyp', typList(), 'Eigener Typ …')
    + `<div class="grid2">${textFld(r, path + '.modell', d.modell, 'Modell')}${textFld(r, path + '.farbe', d.farbe, 'Farbe, Dekor')}</div>`
    + `<div class="grid2">${textFld(r, path + '.groesseCm', d.groesseCm, 'Länge in cm', ' inputmode="decimal"')}${textFld(r, path + '.gewichtG', d.gewichtG, 'Gewicht in g (ohne Montage)', ' inputmode="decimal"')}</div>`
    + `<div class="grid2"><div>${choiceFld(r, path + '.fuehrung', d.fuehrung, 'Führung', FUEHRUNG, 'Eigene Eingabe …')}</div>${selFld(r, path + '.schicht', d.schicht, 'Wasserschicht', SCHICHT)}</div>`
    + detailsBox(r + ':' + mp, 'Montage', montageBody, mHint);
}
const labelsDatalist = () => `<datalist id="dl-klabels">${knownLabels().map(x => `<option value="${esc(x)}"></option>`).join('')}</datalist>`;

/* ---------- Setups ---------- */
function setupOptions(sel) {
  const list = (state.settings.setups || []).filter(x => x.aktiv !== false || x.id === sel);
  return `<option value="">Ohne Setup</option>` + list.map(x => `<option value="${esc(x.id)}"${x.id === sel ? ' selected' : ''}>${esc(x.name || x.id)}</option>`).join('');
}
function setupSnapshot(id, vorfach) {
  const su = setupById(id);
  const o = {};
  if (su) {
    o.setupId = su.id;
    const kombo = [su.rute, su.rolle].map(trim).filter(Boolean).join(' + ');
    if (kombo) o.kombo = kombo;
    if (trim(su.hauptschnur)) o.hauptschnur = trim(su.hauptschnur);
  }
  if (trim(vorfach)) o.vorfach = trim(vorfach);
  return Object.keys(o).length ? o : null;
}

/* ---------- Spots ---------- */
function spotSelect(r, path, v, g, label, emptyLabel) {
  const list = spotNames(g);
  if (v && v !== NEU && !list.includes(v)) list.unshift(v);
  return `<label class="fld"><span>${label}</span><select ${bind(r, path)} data-rerender="1"><option value="">${emptyLabel}</option>${list.map(o => `<option${o === v ? ' selected' : ''}>${esc(o)}</option>`).join('')}<option value="${NEU}"${v === NEU ? ' selected' : ''}>+ Neuer Spot</option></select></label>`
    + (v === NEU ? textFld(r, path + 'Neu', getPath(rootOf(r), path + 'Neu') || '', 'Name des neuen Spots', ' placeholder="z. B. D Spundwand Ost"') : '');
}
async function addSpot(g, name) {
  if (!g || !name || spotNames(g).includes(name)) return;
  g.spots = (Array.isArray(g.spots) ? g.spots : []).concat({ name });
  // Spots an Gewässern, die es im Fangbuch schon gibt, gehen beim Übertragen gesondert mit.
  if (!isNewGw(g)) g._neueSpots = uniq((g._neueSpots || []).concat(name));
  g.aktualisiert = new Date().toISOString();
  await persist('gewaesser', g).catch(() => {});
}
async function resolveSpot(g, v, neu) {
  if (v !== NEU) return trim(v);
  const name = trim(neu);
  if (name) await addSpot(g, name);
  return name;
}

/* ---------- Position und Screenshots ---------- */
function getPos(force) {
  return new Promise(res => {
    if ((!force && !state.settings.gps) || !navigator.geolocation) { res(null); return; }
    navigator.geolocation.getCurrentPosition(
      p => res({ lat: Math.round(p.coords.latitude * 1e5) / 1e5, lon: Math.round(p.coords.longitude * 1e5) / 1e5 }),
      () => res(null),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 30000 }
    );
  });
}
function attachPos(target, s) {
  getPos(false).then(p => {
    if (!p) return;
    target.koordinaten = p;
    if (state.sessions.includes(s)) saveSession(s);
  });
}
function loadImage(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); res(img); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Bild')); };
    img.src = url;
  });
}
async function resizeImage(file) {
  let src;
  try { src = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
  catch (e) { src = await loadImage(file); }
  const w = src.width, h = src.height;
  const sc = Math.min(1, BILD_MAX / Math.max(w, h));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w * sc)); c.height = Math.max(1, Math.round(h * sc));
  c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
  if (src.close) src.close();
  return c.toDataURL('image/jpeg', 0.7);
}
async function storeImage(file) {
  const data = await resizeImage(file);
  const id = uuid();
  await put('bilder', { id, data, erstellt: new Date().toISOString() });
  state.bildCache.set(id, data);
  return id;
}
const bildId = ref => typeof ref === 'string' && ref.startsWith('bild:') ? ref.slice(5) : null;
async function bildData(id) {
  if (state.bildCache.has(id)) return state.bildCache.get(id);
  const r = await getOne('bilder', id).catch(() => null);
  const d = r && r.data;
  if (d) state.bildCache.set(id, d);
  return d || null;
}
function fillThumbs(root) {
  $$('img[data-bild]', root || document).forEach(async img => {
    if (img.getAttribute('src')) return;
    const d = await bildData(img.dataset.bild);
    if (d) img.src = d; else img.alt = 'Bild fehlt';
  });
}
const thumb = id => `<button class="thumbbtn" type="button" data-act="bild-show" data-id="${esc(id)}" aria-label="Screenshot ansehen"><img class="thumb" data-bild="${esc(id)}" alt="Screenshot"></button>`;
async function gcBilder() {
  const refs = new Set();
  const add = ev => { const id = ev && bildId(ev.bild); if (id) refs.add(id); };
  state.sessions.forEach(s => events(s).forEach(add));
  if (state.edit && state.edit.d && Array.isArray(state.edit.d.ereignisse)) state.edit.d.ereignisse.forEach(add);
  if (state.form) add(state.form.evd);
  try {
    const dead = (await getKeys('bilder')).filter(k => !refs.has(k));
    if (dead.length) await tx(['bilder'], 'readwrite', t => dead.forEach(k => t.objectStore('bilder').delete(k)));
    dead.forEach(k => state.bildCache.delete(k));
  } catch (e) { /* egal, nächster Versuch beim nächsten Start */ }
}
// Position und Bild landen im Entwurf und bei der Live-Session sofort auch im gespeicherten Ereignis.
function evTargets(r, p) {
  const out = [];
  const d = getPath(rootOf(r), p);
  if (d) out.push(d);
  if (r === 'f' && p === 'evd' && state.live && state.evEdit != null && state.live.ereignisse[state.evEdit]) out.push(state.live.ereignisse[state.evEdit]);
  return out;
}
function afterEvTargetChange(r) {
  if (r === 'f' && state.live) touch(state.live);
  renderView();
}
function evExtras(r, p, ev, g) {
  const id = bildId(ev.bild);
  const pos = ev.koordinaten && num(ev.koordinaten.lat) != null
    ? `<span class="smeta">Position ${esc(ev.koordinaten.lat)}, ${esc(ev.koordinaten.lon)}</span> <button class="linkbtn" type="button" data-act="pos-del" data-r="${r}" data-p="${p}">entfernen</button>`
    : `<button class="btn ghost small" type="button" data-act="pos" data-r="${r}" data-p="${p}">Position übernehmen</button>`;
  const pic = id
    ? `<div class="picrow">${thumb(id)}<button class="linkbtn" type="button" data-act="bild-del" data-r="${r}" data-p="${p}">Screenshot entfernen</button></div>`
    : `<label class="btn ghost small filelabel">Screenshot anhängen<input type="file" accept="image/*" data-bild-r="${r}" data-bild-p="${p}"></label>`;
  return `<div class="grid2"><div>${spotSelect(r, p + '.spot', ev.spot, g, 'Spot', 'ohne Spot')}</div>${textFld(r, p + '.tiefeM', ev.tiefeM, 'Wassertiefe in m', ' inputmode="decimal"')}</div>
    <div class="row evtools">${pos}</div><div class="row evtools">${pic}</div>`;
}

/* ---------- Kopfbereich und Hinweise ---------- */
function renderLede() {
  const el = $('#lede');
  if (state.failed) { el.textContent = 'Speicher nicht verfügbar'; return; }
  if (!state.ready) { el.textContent = 'Wird geladen …'; return; }
  const n = state.sessions.length;
  const o = openSessions().length;
  const parts = [];
  if (state.live) parts.push('Session läuft');
  if (o) parts.push(o + ' noch nicht übertragen');
  else if (n > (state.live ? 1 : 0)) parts.push('alle übertragen');
  el.textContent = n
    ? `${plural(n, 'Session', 'Sessions')} auf diesem Handy, ${parts.join(', ')}`
    : 'Dein Notizblock fürs Wasser, auch ohne Netz';
}
function renderNav() {
  $$('.tab').forEach(b => b.setAttribute('aria-current', b.dataset.view === state.view ? 'page' : 'false'));
  $('.tab-live').classList.toggle('running', !!state.live);
  const c = openSessions().length + openGw().length + spotGw().length;
  $('#tab-count').textContent = c ? String(c) : '';
}
function staleSessions() { return openSessions().filter(s => daysSince(s.datum) > STALE_DAYS); }
function renderBanner() {
  let h = '';
  if (state.swWaiting) {
    h += `<div class="update-bar"><p>Eine neue Version der App ist da.</p><button class="btn small" data-act="sw-update">Jetzt laden</button></div>`;
  }
  $('#banner').innerHTML = h;
}
function staleCard() {
  const st = staleSessions();
  if (!st.length) return '';
  const oldest = st.reduce((a, s) => Math.max(a, daysSince(s.datum)), 0);
  return `<div class="note-card warn"><h2>${st.length === 1 ? 'Eine Session wartet' : st.length + ' Sessions warten'} seit über ${STALE_DAYS} Tagen</h2>
    <p>Die älteste ist ${oldest} Tage alt. Übertrag sie bald ins Fangbuch, damit Claude Wetter, Luftdruck und Tide noch sauber nachschlagen kann und nichts nur auf diesem Handy liegt.</p>
    <button class="btn" data-go="uebertragen">Jetzt übertragen</button></div>`;
}
function pendingCard() {
  const p = state.pending;
  if (!p) return '';
  return `<div class="note-card warn"><h2>Hat die Übertragung geklappt?</h2>
    <p>Am ${esc(DF_TS.format(new Date(p.at)))} hast du ${plural(p.sessions.length, 'Session', 'Sessions')}${p.gewaesser.length ? ' und Angaben zu ' + plural(p.gewaesser.length, 'Gewässer', 'Gewässern') : ''} exportiert. Bestätige erst, wenn Claude sie im Projekt „Angeln“ ins Fangbuch übernommen hat.</p>
    <div class="row"><button class="btn" data-act="pending-yes">Ja, ist im Fangbuch</button><button class="btn ghost" data-act="pending-no">Nein, nochmal versuchen</button></div></div>`;
}

/* ---------- Ansicht: Sessions ---------- */
function sessionRow(s) {
  const d = parseDate(s.datum);
  const st = statsOf(s);
  const live = isLive(s);
  let result;
  if (live && !st.bisse && !st.nach) result = 'Session läuft';
  else if (st.faenge) result = `<b class="catch">${plural(st.faenge, 'Fang', 'Fänge')}</b>`;
  else if (st.bisse) result = `${plural(st.bisse, 'Biss', 'Bisse')}, kein Fang`;
  else result = '<span class="zero">Nullrunde</span>';
  const parts = [];
  if (st.faenge && st.bisse > st.faenge) parts.push(plural(st.bisse, 'Biss', 'Bisse'));
  if (st.nach) parts.push(plural(st.nach, 'Nachläufer', 'Nachläufer'));
  if (st.min) parts.push(fmtDur(st.min));
  const sub = [s.spot, s.zielfisch ? 'auf ' + s.zielfisch : ''].filter(Boolean).join(', ');
  const badge = live ? '<span class="badge live">läuft</span>'
    : isDone(s) ? '<span class="badge ok">übertragen</span>'
    : '<span class="badge open">nicht übertragen</span>';
  return `<div class="srow" role="button" tabindex="0" data-sid="${esc(s.appId)}">
    <div class="date"><span class="d">${d ? d.getDate() : '?'}</span><span class="wd">${d ? esc(DF_WD.format(d)) : ''}</span></div>
    <div class="sbody">
      <span class="stitle">${esc(gwName(s))}${badge}</span>
      ${sub ? `<span class="smeta">${esc(sub)}</span>` : ''}
      <span class="sres">${result}${parts.length ? '<span class="smeta">, ' + esc(parts.join(', ')) + '</span>' : ''}</span>
      ${timeline(s)}
    </div>
  </div>`;
}
function sortSessions() {
  state.sessions.sort((a, b) => String(b.datum || '').localeCompare(String(a.datum || '')) || String(b.beginn || '').localeCompare(String(a.beginn || '')));
}
function renderSessions() {
  let h = pendingCard() + staleCard();
  if (!state.sessions.length) {
    h += `<div class="emptybox"><h2>Noch keine Sessions</h2><p>Starte am Wasser eine Live-Session und tipp jeden Biss mit. Einen vergangenen Angeltag kannst du auch nachtragen.</p><div class="row"><button class="btn" data-go="live">Live-Session starten</button><button class="btn ghost" data-act="new-session">Session nachtragen</button></div></div>`;
    $('#main').innerHTML = h;
    return;
  }
  let list = state.sessions.slice();
  if (state.f.sOnlyOpen) list = list.filter(s => !isDone(s));
  h += `<div class="toolbar">
      <button class="btn ghost small" data-act="new-session">Session nachtragen</button>
      <label class="check"><input type="checkbox" id="f-open"${state.f.sOnlyOpen ? ' checked' : ''}> Nur nicht übertragene</label>
    </div>
    <p class="legend"><span><i class="lg-fang"></i>Fang</span><span><i class="lg-miss"></i>Fehlbiss oder Aussteiger</span><span><i class="lg-follow"></i>Nachläufer</span><span><i class="lg-sky"></i>Tag, Dämmerung, Nacht (SU Sonnenuntergang, SA Sonnenaufgang)</span></p>`;
  if (!list.length) h += '<p class="empty">Alle Sessions sind übertragen.</p>';
  let cur = null;
  list.forEach(s => {
    const d = parseDate(s.datum);
    const mk = d ? DF_MONTH.format(d) : 'Ohne Datum';
    if (mk !== cur) { if (cur !== null) h += '</div>'; h += `<h2 class="month">${esc(mk)}</h2><div>`; cur = mk; }
    h += sessionRow(s);
  });
  if (cur !== null) h += '</div>';
  h += '<p class="footnote">Die Sessions liegen nur auf diesem Handy, bis du sie überträgst. Übertragene Sessions bleiben lesbar, lassen sich aber nicht mehr ändern. Die Dämmerung in der Zeitleiste ist berechnet; die genauen Werte ergänzt Claude im Fangbuch.</p>';
  $('#main').innerHTML = h;
}

/* ---------- Ansicht: Gewässer ---------- */
function gwStats(slug) {
  const list = state.sessions.filter(s => s.gewaesser === slug);
  let min = 0, b = 0, f = 0;
  list.forEach(s => { const st = statsOf(s); min += st.min || 0; b += st.bisse; f += st.faenge; });
  return { n: list.length, min, b, f, list };
}
function renderGewaesser() {
  let h = `<div class="toolbar"><button class="btn ghost small" data-act="new-gw">Neues Gewässer anlegen</button><button class="btn ghost small" data-go="daten">Aus dem Fangbuch importieren</button></div>`;
  if (!state.gewaesser.length) {
    h += `<div class="emptybox"><h2>Noch keine Gewässer</h2><p>Bitte Claude im Projekt „Angeln“ um einen Export deiner Gewässer und Vorschläge für die Fangbuch-App und importier ihn unter „Daten“. Neue Gewässer kannst du auch hier direkt anlegen.</p></div>`;
    $('#main').innerHTML = h;
    return;
  }
  h += '<div>';
  state.gewaesser.forEach(g => {
    const st = gwStats(g.slug);
    const vs = state.empfehlungen.filter(e => e.gewaesser === g.slug && isActiveV(e)).length;
    const meta = [g.typ, g.lage, spotNames(g).length ? plural(spotNames(g).length, 'Spot', 'Spots') : '', vs ? plural(vs, 'offener Vorschlag', 'offene Vorschläge') : ''].filter(Boolean).join(', ');
    const line = st.n ? `${plural(st.n, 'Session', 'Sessions')} in der App, ${plural(st.f, 'Fang', 'Fänge')}` : 'Noch keine Session in der App';
    const badge = isNewGw(g) ? '<span class="badge open">neu, nicht übertragen</span>'
      : (g._neueSpots || []).length ? `<span class="badge open">${plural(g._neueSpots.length, 'neuer Spot', 'neue Spots')}</span>` : '';
    h += `<div class="gwrow" role="button" tabindex="0" data-gid="${esc(g.slug)}"><span class="kz">${esc(g.kuerzel || initials(g.name || g.slug))}</span><div><h2 class="gwname">${esc(g.name || g.slug)}${badge}</h2>${meta ? `<p class="smeta">${esc(meta)}</p>` : ''}<p class="gwline">${esc(line)}</p></div></div>`;
  });
  $('#main').innerHTML = h + '</div>';
}

/* ---------- Vorschläge ---------- */
const VST_ORDER = ['im_test', 'offen', 'bestaetigt', 'verworfen'];
const TRUST = { hoch: 3, mittel: 2, niedrig: 1 };
const trustN = v => TRUST[String(v || '').toLowerCase()] || 0;
const vStatus = e => STATUS[e.status] ? e.status : 'offen';
const isActiveV = e => vStatus(e) === 'offen' || vStatus(e) === 'im_test';
const katLabel = e => KAT[e.kategorie] || cap(String(e.kategorie || 'Vorschlag'));
function trustDots(v) {
  const n = trustN(v);
  if (!n) return '';
  return `<span class="trust" aria-hidden="true">${[1, 2, 3].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;
}
function vSort(a, b) {
  return VST_ORDER.indexOf(vStatus(a)) - VST_ORDER.indexOf(vStatus(b))
    || trustN(b.vertrauen) - trustN(a.vertrauen)
    || String(b.aktualisiert || '').localeCompare(String(a.aktualisiert || ''));
}
function vRow(e) {
  const st = vStatus(e);
  const meta = [e.zielfisch ? 'auf ' + fmtAny(e.zielfisch) : '', e.gewaesser ? '' : 'gewässerübergreifend'].filter(Boolean).join(', ');
  const bed = e.bedingungen && typeof e.bedingungen === 'object' && !Array.isArray(e.bedingungen)
    ? Object.entries(e.bedingungen).filter(([, v]) => v != null && v !== '').map(([k, v]) => [BED[k] || cap(k), fmtAny(v)]) : [];
  const more = [
    bed.length ? '<p><b>Wann es passt:</b> ' + esc(bed.map(([k, v]) => k + ': ' + v).join('; ')) + '</p>' : '',
    e.begruendung ? '<p><b>Warum:</b> ' + esc(fmtAny(e.begruendung)) + '</p>' : '',
    e.setup ? '<p><b>Mit deinem Material:</b> ' + esc(fmtAny(e.setup)) + '</p>' : '',
    e.erfolgskriterium ? '<p><b>Erfolgskriterium:</b> ' + esc(fmtAny(e.erfolgskriterium)) + '</p>' : ''
  ].join('');
  return `<div class="vrow">
    <div class="vhead"><span class="vkat">${esc(katLabel(e))}</span><span class="vtitle">${esc(e.titel || 'Vorschlag')}</span></div>
    ${e.empfehlung ? `<p class="vtext">${esc(fmtAny(e.empfehlung))}</p>` : ''}
    <p class="vmeta">${trustDots(e.vertrauen)}${e.vertrauen ? 'Vertrauen ' + esc(fmtAny(e.vertrauen)) + ', ' : ''}${esc(STATUS[st])}${meta ? ', ' + esc(meta) : ''}</p>
    ${more ? `<details class="vdet"><summary>Mehr dazu</summary>${more}</details>` : ''}
  </div>`;
}
function tipsFor(gw, ziel) {
  const zf = String(ziel || '').toLowerCase();
  return state.empfehlungen
    .filter(e => isActiveV(e) && (!e.gewaesser || e.gewaesser === gw) && (!e.zielfisch || !zf || zf === 'andere' || fmtAny(e.zielfisch).toLowerCase().includes(zf)))
    .sort((a, b) => (!a.gewaesser) - (!b.gewaesser) || vSort(a, b));
}
function liveTips(s) {
  const tips = tipsFor(s.gewaesser, s.zielfisch);
  if (!tips.length) return '';
  return `<details class="livetips" id="livetips"${state.tipsOpen ? ' open' : ''}><summary>Offene Vorschläge für diese Session (${tips.length})</summary>${tips.map(vRow).join('')}</details>`;
}

/* ---------- Kopf eines Session-Formulars (Live-Start und Bearbeiten) ---------- */
function gwSelectOptions(sel, withNew) {
  return state.gewaesser.map(g => `<option value="${esc(g.slug)}"${sel === g.slug ? ' selected' : ''}>${esc(g.name || g.slug)}</option>`).join('')
    + (withNew ? `<option value="${NEU}"${sel === NEU ? ' selected' : ''}>Neues Gewässer …</option>` : '');
}
function sessionHead(r, d) {
  const g = state.gwMap[d.gw];
  const zo = zielOptions(g);
  if (d.ziel && !zo.includes(d.ziel)) zo.unshift(d.ziel);
  return `<div class="gwsetup">
      <label class="fld"><span>Gewässer</span><select ${bind(r, 'gw')} data-rerender="1">${gwSelectOptions(d.gw, true)}</select></label>
      <label class="fld"><span>Setup (Rute, Rolle, Schnur)</span><select ${bind(r, 'setup')} data-rerender="1">${setupOptions(d.setup)}</select></label>
    </div>
    ${d.gw === NEU ? textFld(r, 'gwNeu', d.gwNeu, 'Name des Gewässers') : ''}
    ${textFld(r, 'vorfach', d.vorfach, 'Vorfach (Material, Tragkraft, Länge in cm)', ' placeholder="z. B. Fluoro 0,40 mm, 60 cm"')}
    ${spotSelect(r, 'spot', d.spot, g, 'Spot', 'kein Spot')}
    <div class="grid2">
      <label class="fld"><span>Zielfisch</span><select ${bind(r, 'ziel')}>${zo.map(z => `<option${z === d.ziel ? ' selected' : ''}>${esc(z)}</option>`).join('')}</select></label>
      <label class="fld"><span>Angelart</span><select ${bind(r, 'art')}>${['Ufer', 'Watend'].map(z => `<option${z === d.art ? ' selected' : ''}>${z}</option>`).join('')}</select></label>
    </div>`;
}
function applyGwDefaults(d) {
  const g = state.gwMap[d.gw];
  d.spot = ''; d.spotNeu = '';
  if (g && Array.isArray(g.zielfische) && g.zielfische[0]) d.ziel = g.zielfische[0];
  if (g) d.art = /watend/i.test(String(g.angelart || '')) ? 'Watend' : 'Ufer';
  const ls = (state.settings.lastSetup || {})[d.gw];
  if (ls && setupById(ls)) { d.setup = ls; d.vorfach = setupById(ls).vorfach || ''; }
}
function applySetupDefaults(d) {
  const su = setupById(d.setup);
  if (su) d.vorfach = su.vorfach || '';
}
function rememberSetup(gw, id) {
  if (!gw) return;
  state.settings.lastSetup = Object.assign({}, state.settings.lastSetup || {}, { [gw]: id || '' });
  saveSettings();
}

/* ---------- Ansicht: Live ---------- */
function startForm() {
  const F = state.form;
  return `<form class="startform" id="startform" novalidate>
    <h2>Session starten</h2>
    <p class="hint">Starte, wenn du am Wasser bist. Jeder Tipp auf Fang, Fehlbiss, Aussteiger oder Nachläufer speichert die genaue Uhrzeit, auch ohne Netz. Wetter, Luftdruck, Sonne, Mond und Tide ergänzt Claude später im Fangbuch.</p>
    ${sessionHead('f', F)}
    <section class="formsec"><h3>Startköder</h3>${koederForm('f', 'k0', F.k0)}</section>
    <div class="grid2">
      ${textFld('f', 'wt', F.wt, 'Wassertemperatur in °C', ' inputmode="decimal" placeholder="falls gemessen"')}
      ${textFld('f', 'sicht', F.sicht, 'Sichttiefe in cm', ' inputmode="numeric" placeholder="optional"')}
    </div>
    ${state.settings.gps ? '<p class="hint">GPS ist an: Beim Start und bei jedem Fang wird die Position gespeichert.</p>' : ''}
    <button class="btn big" type="submit">Session starten</button>
    ${labelsDatalist()}
  </form>`;
}
function evDraft(ev) {
  return {
    zeit: ev.zeit || '', typ: ev.typ, art: ev.art || '', laengeCm: str(ev.laengeCm), entnommen: !!ev.entnommen, notiz: ev.notiz || '',
    koeder: ev.koeder || '', spot: ev.spot || '', spotNeu: '', tiefeM: str(ev.tiefeM),
    koordinaten: ev.koordinaten ? clone(ev.koordinaten) : undefined, bild: ev.bild || undefined
  };
}
function evEditor() {
  const s = state.live;
  const ev = s && s.ereignisse[state.evEdit];
  const d = state.form.evd;
  if (!ev || !d) return '';
  const g = state.gwMap[s.gewaesser];
  let fang = '';
  if (ev.typ === 'fang') {
    const opts = artOptions(g);
    const sel = d.art || s.zielfisch;
    if (sel && !opts.includes(sel)) opts.unshift(sel);
    fang = `<div class="grid3">
      <label class="fld"><span>Art</span><select ${bind('f', 'evd.art')}>${opts.map(z => `<option${z === sel ? ' selected' : ''}>${esc(z)}</option>`).join('')}</select></label>
      ${textFld('f', 'evd.laengeCm', d.laengeCm, 'Länge in cm', ' inputmode="decimal"')}
      <label class="check"><input type="checkbox" ${bind('f', 'evd.entnommen')}${d.entnommen ? ' checked' : ''}> Entnommen</label>
    </div>`;
  }
  return `<div class="fangedit" id="evedit"><h3>${esc(TYP[ev.typ] || 'Eintrag')} um ${esc(ev.zeit)}</h3>
    ${fang}
    ${evExtras('f', 'evd', d, g)}
    ${textFld('f', 'evd.notiz', d.notiz, 'Notiz', ' placeholder="z. B. Biss in der Absinkphase"')}
    <div class="row"><button class="btn" data-act="ev-save">Speichern</button><button class="linkbtn" data-act="ev-close">Später ergänzen</button></div>
  </div>`;
}
function liveLog(s) {
  const items = [];
  events(s).forEach((ev, i) => {
    const det = [ev.art, lenText(ev), ev.entnommen ? 'entnommen' : '', ev.spot && ev.spot !== s.spot ? ev.spot : '', num(ev.tiefeM) != null ? NF1.format(num(ev.tiefeM)) + ' m' : '', ev.koordinaten ? 'GPS' : '', ev.bild ? 'Screenshot' : ''].filter(Boolean).join(', ');
    const edit = ` <button class="linkbtn" style="padding:0;min-height:0" data-act="ev-open" data-i="${i}">ergänzen</button>`;
    items.push({ z: ev.zeit, ts: ev._ts || 0, html: `<b class="ty ${TYP[ev.typ] ? ev.typ : ''}">${esc(TYP[ev.typ] || ev.typ)}</b>${det ? ' ' + esc(det) : ''}${ev.koeder ? '<span class="smeta"> auf ' + esc(ev.koeder) + '</span>' : ''}${edit}` });
  });
  (s.koeder || []).forEach(k => items.push({ z: k.zeit, ts: k._ts || 0, html: 'Köder: ' + esc(koederText(k)) + (koederExtra(k) ? '<span class="smeta">, ' + esc(koederExtra(k)) + '</span>' : '') }));
  (s.notizen || []).forEach(n => items.push({ z: n.zeit, ts: n._ts || 0, html: esc(n.text) }));
  const b = toMin(s.beginn);
  const key = z => { const m = evMin({ zeit: z }, b); return m == null ? -1 : m; };
  items.sort((a, c) => key(c.z) - key(a.z) || c.ts - a.ts);
  if (!items.length) return '<p class="hint">Noch keine Einträge.</p>';
  return '<ul class="log">' + items.map(x => `<li><span class="t">${esc(x.z || '')}</span><span>${x.html}</span></li>`).join('') + '</ul>';
}
function lastEntry(s) {
  let best = null;
  ['ereignisse', 'koeder', 'notizen'].forEach(k => {
    (s[k] || []).forEach((x, i) => { if (x && x._ts && (!best || x._ts > best.ts)) best = { k, i, ts: x._ts, x }; });
  });
  return best;
}
function liveRunning() {
  const s = state.live;
  const sp = spanOf(s, true);
  const el = sp && sp.e != null ? sp.e - sp.b : 0;
  const st = statsOf(s);
  const curK = (s.koeder || [])[s.koeder.length - 1];
  const last = lastEntry(s);
  const lastLabel = last ? (last.k === 'ereignisse' ? (TYP[last.x.typ] || 'Eintrag') : last.k === 'koeder' ? 'Köderwechsel' : 'Notiz') + ' von ' + last.x.zeit : '';
  return `<section class="live">
    <div class="live-head">
      <div><h2>${esc(gwName(s))}</h2><p class="smeta">${esc([s.spot, s.zielfisch ? 'auf ' + s.zielfisch : '', 'seit ' + s.beginn].filter(Boolean).join(', '))}</p></div>
      <div class="elapsed" id="elapsed">${fmtDur(el)}</div>
    </div>
    <p class="live-count">${plural(st.bisse, 'Biss', 'Bisse')}, ${plural(st.faenge, 'Fang', 'Fänge')}${st.nach ? ', ' + plural(st.nach, 'Nachläufer', 'Nachläufer') : ''}</p>
    <div class="bigbtns">
      <button class="bb fang" data-act="ev" data-typ="fang">Fang</button>
      <button class="bb" data-act="ev" data-typ="fehlbiss">Fehlbiss</button>
      <button class="bb" data-act="ev" data-typ="aussteiger">Aussteiger</button>
      <button class="bb" data-act="ev" data-typ="nachlaeufer">Nachläufer</button>
    </div>
    ${state.evEdit != null ? evEditor() : ''}
    ${liveTips(s)}
    <div class="live-block">
      <h3>Köder</h3>
      <p class="smeta" style="margin-bottom:10px">${curK ? 'Aktuell: ' + esc(koederText(curK)) + (koederExtra(curK) ? ', ' + esc(koederExtra(curK)) : '') : 'Noch kein Köder eingetragen.'}</p>
      ${detailsBox('live:kneu', 'Köder wechseln', koederForm('f', 'kNeu', state.form.kNeu, { labelTitle: 'Neuer Köder' }) + '<button class="btn" data-act="koeder">Köder wechseln</button>')}
      ${labelsDatalist()}
    </div>
    <div class="live-block">
      <h3>Notiz</h3>
      <textarea ${bind('f', 'note')} rows="2" placeholder="z. B. Kleinfisch springt am Westufer, Wind dreht auf West">${esc(state.form.note)}</textarea>
      <button class="btn ghost" data-act="note">Notiz speichern</button>
    </div>
    <div class="live-block">
      <h3>Verlauf</h3>
      ${liveLog(s)}
      ${last ? `<button class="linkbtn" data-act="undo">Rückgängig: ${esc(lastLabel)}</button>` : ''}
    </div>
    <div class="live-end">
      ${state.endConfirm
        ? '<p>Session jetzt beenden?</p><div class="row"><button class="btn" data-act="end-yes">Ja, beenden</button><button class="btn ghost" data-act="end-no">Weiter angeln</button></div>'
        : '<button class="btn ghost wide" data-act="end">Session beenden</button>'}
    </div>
  </section>`;
}
function renderLive() {
  if (state.live) { $('#main').innerHTML = liveRunning(); return; }
  let h = '';
  if (state.lastEnded) {
    const s = state.sessions.find(x => x.appId === state.lastEnded);
    if (s) {
      const st = statsOf(s);
      h += `<div class="note-card done"><h2>Session gespeichert</h2><p>${esc(gwName(s))}, ${esc(s.beginn)} bis ${esc(s.ende)} Uhr: ${plural(st.bisse, 'Biss', 'Bisse')}, ${plural(st.faenge, 'Fang', 'Fänge')}. Sie liegt auf diesem Handy, bis du sie überträgst.</p>
        <div class="row"><button class="btn" data-go="uebertragen">Jetzt übertragen</button><button class="btn ghost" data-sid="${esc(s.appId)}">Ansehen</button></div></div>`;
    }
  }
  h += startForm();
  $('#main').innerHTML = h;
}

/* ---------- Live-Aktionen ---------- */
function startTimer() {
  stopTimer();
  state.timer = setInterval(updateElapsed, 15000);
}
function updateElapsed() {
  const el = $('#elapsed');
  if (el && state.live) { const sp = spanOf(state.live, true); if (sp && sp.e != null) el.textContent = fmtDur(sp.e - sp.b); }
}
function stopTimer() { if (state.timer) clearInterval(state.timer); state.timer = null; }
async function wakeOn() {
  if (!state.live || !('wakeLock' in navigator) || document.visibilityState !== 'visible' || state.wakeLock) return;
  try {
    state.wakeLock = await navigator.wakeLock.request('screen');
    state.wakeLock.addEventListener('release', () => { state.wakeLock = null; });
  } catch (e) { state.wakeLock = null; }
}
function wakeOff() { if (state.wakeLock) { try { state.wakeLock.release(); } catch (e) { /* egal */ } state.wakeLock = null; } }

function newGwDoc(name, extra) {
  const ts = new Date().toISOString();
  return Object.assign({
    slug: slugify(name), name, kuerzel: initials(name), tide: 'prüfen',
    zielfische: [], fischarten: [], spots: [], regeln: [], erkenntnisse: [], hypothesen: [], referenzen: [],
    erstellt: ts, aktualisiert: ts, _quelle: 'app', _uebertragenAm: null
  }, extra || {});
}
async function ensureGw(slugOrNew, newName, ziel) {
  if (slugOrNew !== NEU && state.gwMap[slugOrNew]) return state.gwMap[slugOrNew];
  const name = trim(newName);
  if (!name) { toast('Trag einen Namen für das Gewässer ein.'); return null; }
  const slug = slugify(name);
  if (!slug) { toast('Der Name braucht mindestens einen Buchstaben oder eine Zahl.'); return null; }
  if (state.gwMap[slug]) return state.gwMap[slug];
  const g = newGwDoc(name, { zielfische: ziel && ziel !== 'Andere' ? [ziel] : [] });
  await persist('gewaesser', g);
  addGwLocal(g);
  return g;
}
function addGwLocal(g) {
  state.gewaesser = state.gewaesser.filter(x => x.slug !== g.slug).concat(g)
    .sort((a, b) => String(a.name || a.slug).localeCompare(String(b.name || b.slug), 'de'));
  state.gwMap[g.slug] = g;
}
async function startLive() {
  if (state.live) return;
  const F = state.form;
  if (F.spot === NEU && !trim(F.spotNeu)) { toast('Trag einen Namen für den neuen Spot ein.'); return; }
  let g;
  try { g = await ensureGw(F.gw, F.gwNeu, F.ziel); } catch (e) { return; }
  if (!g) return;
  const spot = await resolveSpot(g, F.spot, F.spotNeu);
  const now = new Date();
  const datum = isoDate(now), beginn = hhmm(now);
  const beo = {};
  const wt = num(F.wt), sicht = num(F.sicht);
  if (wt != null) beo.wassertemp = wt;
  if (sicht != null) beo.sichttiefe = sicht;
  const ts = now.toISOString();
  const k0 = kClean(Object.assign({}, F.k0, { zeit: beginn }));
  const setup = setupSnapshot(F.setup, F.vorfach);
  const s = {
    appId: uuid(), id: '', status: 'entwurf', live: true, quelle: 'app', datum, beginn,
    gewaesser: g.slug, gewaesserName: g.name || g.slug, spot, angelart: F.art || 'Ufer', zielfisch: F.ziel || '',
    koeder: kHasContent(k0) ? [k0] : [], ereignisse: [], beobachtungen: beo, notizen: [],
    erstellt: ts, aktualisiert: ts, _uebertragenAm: null
  };
  if (!spot) delete s.spot;
  if (setup) s.setup = setup;
  try { await saveSession(s); } catch (e) { return; }
  state.sessions.push(s); sortSessions();
  state.live = s;
  state.lastEnded = null; state.evEdit = null; state.endConfirm = false;
  F.kNeu = kDraft(null); F.note = ''; F.gwNeu = ''; F.gw = g.slug; F.spot = spot; F.spotNeu = ''; F.evd = null;
  lsSet('fangbuch-gw', g.slug);
  rememberSetup(g.slug, F.setup);
  attachPos(s, s);
  startTimer();
  wakeOn();
  renderAll();
  window.scrollTo(0, 0);
}
function resume(s) {
  ['ereignisse', 'koeder', 'notizen'].forEach(k => { if (!Array.isArray(s[k])) s[k] = []; });
  state.live = s; state.evEdit = null; state.endConfirm = false;
  startTimer();
  wakeOn();
}
function touch(s) { s.aktualisiert = new Date().toISOString(); return saveSession(s); }
function openEvEditor(i) {
  const ev = state.live && state.live.ereignisse[i];
  if (!ev) return;
  state.evEdit = i;
  state.form.evd = evDraft(ev);
}
function addEvent(typ) {
  const s = state.live;
  if (!s || !TYP[typ]) return;
  const ev = { zeit: hhmm(new Date()), typ, _ts: Date.now() };
  const k = currentKoeder(s);
  if (k) ev.koeder = k;
  if (s.spot) ev.spot = s.spot;
  if (typ === 'fang' && s.zielfisch && s.zielfisch !== 'Andere') ev.art = s.zielfisch;
  s.ereignisse.push(ev);
  openEvEditor(s.ereignisse.length - 1);
  if (typ === 'fang') attachPos(ev, s);
  touch(s);
  try { if (navigator.vibrate) navigator.vibrate(30); } catch (e) { /* egal */ }
  toast(`${TYP[typ]} um ${ev.zeit} erfasst`);
  renderAll();
}
async function saveEv() {
  const s = state.live;
  const ev = s && s.ereignisse[state.evEdit];
  const d = state.form.evd;
  if (!ev || !d) return;
  if (d.spot === NEU && !trim(d.spotNeu)) { toast('Trag einen Namen für den neuen Spot ein.'); return; }
  if (ev.typ === 'fang') {
    if (d.art) ev.art = d.art;
    const L = num(d.laengeCm);
    if (L != null) ev.laengeCm = L; else delete ev.laengeCm;
    ev.entnommen = !!d.entnommen;
  }
  const spot = await resolveSpot(state.gwMap[s.gewaesser], d.spot, d.spotNeu);
  if (spot) ev.spot = spot; else delete ev.spot;
  const t = num(d.tiefeM);
  if (t != null) ev.tiefeM = t; else delete ev.tiefeM;
  if (trim(d.notiz)) ev.notiz = trim(d.notiz); else delete ev.notiz;
  state.evEdit = null; state.form.evd = null;
  touch(s);
  toast('Gespeichert');
  renderView();
}
function undo() {
  const s = state.live;
  const last = s && lastEntry(s);
  if (!last) return;
  s[last.k].splice(last.i, 1);
  if (last.k === 'ereignisse' && state.evEdit != null) { state.evEdit = null; state.form.evd = null; }
  touch(s);
  toast(`${last.k === 'ereignisse' ? (TYP[last.x.typ] || 'Eintrag') : last.k === 'koeder' ? 'Köderwechsel' : 'Notiz'} von ${last.x.zeit} entfernt`);
  renderAll();
}
function changeKoeder() {
  const s = state.live;
  if (!s) return;
  const k = kClean(Object.assign({}, state.form.kNeu, { zeit: hhmm(new Date()), _ts: Date.now() }));
  if (!kHasContent(k)) { toast('Trag zuerst den neuen Köder ein.'); return; }
  s.koeder.push(k);
  state.form.kNeu = kDraft(null);
  state.openDet.delete('live:kneu');
  touch(s);
  toast('Köderwechsel erfasst');
  renderView();
}
function addNote() {
  const s = state.live;
  const val = trim(state.form.note);
  if (!s || !val) { toast('Die Notiz ist noch leer.'); return; }
  s.notizen.push({ zeit: hhmm(new Date()), text: val, _ts: Date.now() });
  state.form.note = '';
  touch(s);
  toast('Notiz gespeichert');
  renderView();
}
async function endLive() {
  const s = state.live;
  if (!s) return;
  s.ende = hhmm(new Date());
  s.live = false;
  finalize(s);
  try { await saveSession(s); } catch (e) { s.live = true; delete s.ende; return; }
  state.lastEnded = s.appId;
  state.live = null; state.endConfirm = false; state.evEdit = null; state.form.evd = null;
  stopTimer();
  wakeOff();
  renderAll();
  window.scrollTo(0, 0);
}

/* ---------- Nachtragen und Bearbeiten ---------- */
function newDraft() {
  const F = state.form;
  const d = { appId: null, datum: isoDate(new Date()), beginn: '', ende: '', gw: state.gwMap[F.gw] ? F.gw : (state.gewaesser[0] ? state.gewaesser[0].slug : NEU), gwNeu: '', spot: '', spotNeu: '', ziel: F.ziel || 'Barsch', art: F.art || 'Ufer', setup: '', vorfach: '', wt: '', sicht: '', koeder: [], ereignisse: [], notizen: [], eindruck: '', naechstesMal: '' };
  const ls = (state.settings.lastSetup || {})[d.gw];
  if (ls && setupById(ls)) { d.setup = ls; d.vorfach = setupById(ls).vorfach || ''; }
  return d;
}
function edEvDraft(ev, autoK) {
  return Object.assign(clone(ev), evDraft(ev), { _autoK: !!autoK });
}
function draftFrom(s) {
  const Bo = s.beobachtungen || {};
  const su = s.setup || {};
  return {
    appId: s.appId, datum: s.datum || '', beginn: s.beginn || '', ende: s.ende || '',
    gw: state.gwMap[s.gewaesser] ? s.gewaesser : NEU, gwNeu: state.gwMap[s.gewaesser] ? '' : (s.gewaesserName || s.gewaesser || ''),
    spot: s.spot || '', spotNeu: '', ziel: s.zielfisch || '', art: s.angelart || 'Ufer',
    setup: su.setupId || '', vorfach: su.vorfach || '',
    wt: str(Bo.wassertemp), sicht: str(Bo.sichttiefe),
    koeder: (s.koeder || []).map(kDraft), ereignisse: (s.ereignisse || []).map(ev => edEvDraft(ev, false)),
    notizen: clone(s.notizen || []), eindruck: s.eindruck || '', naechstesMal: s.naechstesMal || ''
  };
}
function openEditor(s) {
  if (s && (isDone(s) || isLive(s))) return;
  state.edit = { kind: 'session', d: s ? draftFrom(s) : newDraft(), err: '' };
  if ($('#sheet').open) $('#sheet').close();
  renderAll();
  window.scrollTo(0, 0);
}
// Köder, der zu einer Uhrzeit im Wasser war (letzter Wechsel vor oder zu dieser Zeit).
function koederAt(d, zeit) {
  const b = toMin(d.beginn);
  const ks = d.koeder.map(k => ({ label: trim(k.label) || trim(k.modell) || eigenValue(k.typ, k.typEigen), m: evMin(k, b) })).filter(x => x.label && x.m != null).sort((a, c) => a.m - c.m);
  if (!ks.length) return '';
  const t = evMin({ zeit }, b);
  if (t == null) return ks[ks.length - 1].label;
  let cur = ks[0].label;
  ks.forEach(x => { if (x.m <= t) cur = x.label; });
  return cur;
}
function koederRow(k, i) {
  const p = 'koeder.' + i;
  return `<div class="erow"><div class="erow-head">
      <label class="fld"><span>Ab</span><input type="time" ${inp('e', p + '.zeit', k.zeit)}></label>
      <label class="fld"><span>Köder</span><input ${inp('e', p + '.label', k.label, ' autocomplete="off" list="dl-klabels" data-prefill="1"')}></label>
      <button class="xbtn" type="button" data-act="row-del" data-list="koeder" data-i="${i}" aria-label="Köder entfernen">×</button>
    </div>
    <div class="erow-more">${koederForm('e', p, k, { withLabel: false })}</div></div>`;
}
function eventRow(ev, i, d) {
  const g = state.gwMap[d.gw];
  const p = 'ereignisse.' + i;
  const kl = uniq(d.koeder.map(k => trim(k.label)));
  const arts = artOptions(g);
  if (ev.art && !arts.includes(ev.art)) arts.unshift(ev.art);
  return `<div class="erow"><div class="erow-head">
      <label class="fld"><span>Uhrzeit</span><input type="time" ${inp('e', p + '.zeit', ev.zeit, ' data-rerender="1"')}></label>
      <label class="fld"><span>Art des Eintrags</span><select ${bind('e', p + '.typ')} data-rerender="1">${Object.entries(TYP).map(([k, l]) => `<option value="${k}"${ev.typ === k ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
      <button class="xbtn" type="button" data-act="row-del" data-list="ereignisse" data-i="${i}" aria-label="Eintrag entfernen">×</button>
    </div>
    <div class="erow-more">
    ${ev.typ === 'fang' ? `<div class="grid3">
      <label class="fld"><span>Fischart</span><select ${bind('e', p + '.art')}><option value="">offen</option>${arts.map(a => `<option${a === ev.art ? ' selected' : ''}>${esc(a)}</option>`).join('')}</select></label>
      ${textFld('e', p + '.laengeCm', ev.laengeCm, 'Länge in cm', ' inputmode="decimal"')}
      <label class="check"><input type="checkbox" ${bind('e', p + '.entnommen')}${ev.entnommen ? ' checked' : ''}> Entnommen</label>
    </div>` : ''}
    <div class="grid2">
      <label class="fld"><span>Köder</span><input list="dl-evkoeder" ${inp('e', p + '.koeder', ev.koeder, ' autocomplete="off" data-manualk="1"')}></label>
      ${textFld('e', p + '.notiz', ev.notiz, 'Notiz')}
    </div>
    ${evExtras('e', p, ev, g)}
    </div>
    ${i === 0 ? `<datalist id="dl-evkoeder">${kl.map(x => `<option value="${esc(x)}"></option>`).join('')}</datalist>` : ''}
  </div>`;
}
function noteRow(n, i) {
  return `<div class="erow"><div class="erow-head">
    <label class="fld"><span>Uhrzeit</span><input type="time" ${inp('e', 'notizen.' + i + '.zeit', n.zeit)}></label>
    <label class="fld"><span>Notiz</span><input ${inp('e', 'notizen.' + i + '.text', n.text, ' autocomplete="off"')}></label>
    <button class="xbtn" type="button" data-act="row-del" data-list="notizen" data-i="${i}" aria-label="Notiz entfernen">×</button>
  </div></div>`;
}
function sessionEditor() {
  const E = state.edit, d = E.d;
  d.ereignisse.forEach(ev => { if (ev._autoK) ev.koeder = koederAt(d, ev.zeit); });
  return `<div class="card">
    <h2>${d.appId ? 'Session bearbeiten' : 'Session nachtragen'}</h2>
    <p class="hint">${d.appId ? 'Änderungen sind möglich, bis die Session übertragen ist.' : 'Für Angeltage, die du nicht live erfasst hast. Auch Nullrunden zählen: einfach ohne Einträge speichern.'}</p>
    ${sessionHead('e', d)}
    <label class="fld"><span>Datum</span><input type="date" ${inp('e', 'datum', d.datum)}></label>
    <div class="grid2">
      <label class="fld"><span>Beginn</span><input type="time" ${inp('e', 'beginn', d.beginn)}></label>
      <label class="fld"><span>Ende</span><input type="time" ${inp('e', 'ende', d.ende)}></label>
    </div>
    <div class="grid2">
      ${textFld('e', 'wt', d.wt, 'Wassertemperatur in °C', ' inputmode="decimal" placeholder="falls gemessen"')}
      ${textFld('e', 'sicht', d.sicht, 'Sichttiefe in cm', ' inputmode="numeric" placeholder="optional"')}
    </div>
    <section><h3>Köder</h3>
      ${d.koeder.map(koederRow).join('') || '<p class="hint">Noch kein Köder.</p>'}
      <button class="btn ghost small" type="button" data-act="row-add" data-list="koeder">Köder hinzufügen</button>
      ${labelsDatalist()}
    </section>
    <section><h3>Bisse, Fänge und Nachläufer</h3>
      <p class="hint">Der Köder eines Eintrags richtet sich nach der Uhrzeit und deinen Köderwechseln, solange du ihn nicht selbst änderst.</p>
      ${d.ereignisse.map((ev, i) => eventRow(ev, i, d)).join('') || '<p class="hint">Keine Einträge. Ohne Einträge wird die Session als Nullrunde gespeichert.</p>'}
      <button class="btn ghost small" type="button" data-act="row-add" data-list="ereignisse">Eintrag hinzufügen</button>
    </section>
    <section><h3>Notizen</h3>
      ${d.notizen.map(noteRow).join('')}
      <button class="btn ghost small" type="button" data-act="row-add" data-list="notizen">Notiz hinzufügen</button>
    </section>
    <section>
      <label class="fld"><span>Eindruck</span><textarea rows="3" ${bind('e', 'eindruck')}>${esc(d.eindruck)}</textarea></label>
      <label class="fld"><span>Beim nächsten Mal testen</span><textarea rows="2" ${bind('e', 'naechstesMal')}>${esc(d.naechstesMal)}</textarea></label>
    </section>
    ${E.err ? `<div class="note-card warn" role="alert"><p>${esc(E.err)}</p></div>` : ''}
    <div class="formactions">
      <button class="btn big" data-act="edit-save">Speichern</button>
      <button class="btn ghost wide" data-act="edit-cancel">Abbrechen</button>
    </div>
    ${d.appId ? `<div class="danger-zone">${state.delConfirm
      ? `<p>Diese Session endgültig löschen?</p><div class="row"><button class="btn danger" data-act="del-yes" data-id="${esc(d.appId)}">Ja, löschen</button><button class="btn ghost" data-act="del-no">Abbrechen</button></div>`
      : '<button class="linkbtn" data-act="del">Session löschen</button>'}</div>` : ''}
  </div>`;
}
function addRow(list) {
  const d = state.edit.d;
  const lastT = arr => { const x = arr.filter(r => isTime(r.zeit)); return x.length ? x[x.length - 1].zeit : (d.beginn || ''); };
  if (list === 'koeder') {
    const k = kDraft(null);
    k.zeit = d.koeder.length ? lastT(d.koeder) : (d.beginn || '');
    d.koeder.push(k);
  } else if (list === 'ereignisse') {
    const zeit = lastT(d.ereignisse);
    d.ereignisse.push({ zeit, typ: 'fang', art: d.ziel && d.ziel !== 'Andere' ? d.ziel : '', koeder: koederAt(d, zeit), laengeCm: '', spot: d.spot !== NEU ? d.spot : '', spotNeu: '', tiefeM: '', _autoK: true });
  } else if (list === 'notizen') d.notizen.push({ zeit: lastT(d.notizen), text: '' });
  renderView();
}
function delRow(list, i) { state.edit.d[list].splice(i, 1); renderView(); }
async function saveEditor() {
  const E = state.edit, d = E.d;
  const fail = msg => { E.err = msg; renderView(); const el = $('[role="alert"]'); if (el) el.scrollIntoView({ block: 'center' }); };
  if (!parseDate(d.datum)) return fail('Trag ein Datum ein.');
  if (!isTime(d.beginn)) return fail('Trag die Uhrzeit ein, zu der du angefangen hast.');
  if (!isTime(d.ende)) return fail('Trag die Uhrzeit ein, zu der du aufgehört hast.');
  if (d.datum > isoDate(new Date())) return fail('Das Datum liegt in der Zukunft.');
  if (d.gw === NEU && !trim(d.gwNeu)) return fail('Trag einen Namen für das Gewässer ein.');
  if (d.spot === NEU && !trim(d.spotNeu)) return fail('Trag einen Namen für den neuen Spot ein.');
  if (d.ereignisse.some(ev => ev.spot === NEU && !trim(ev.spotNeu))) return fail('Bei einem Eintrag fehlt noch der Name des neuen Spots.');
  for (const [list, label] of [['koeder', 'Köder'], ['ereignisse', 'Eintrag'], ['notizen', 'Notiz-Eintrag']]) {
    if (d[list].some(r => !isTime(r.zeit))) return fail(`Bei jedem ${label} fehlt noch die Uhrzeit.`);
  }
  if (d.koeder.some(k => !kHasContent(kClean(k)))) return fail('Ein Köder hat noch keine Bezeichnung. Füll sie aus oder entferne die Zeile.');
  if (d.notizen.some(n => !trim(n.text))) return fail('Eine Notiz ist leer. Füll sie aus oder entferne die Zeile.');
  const sp = spanOf({ beginn: d.beginn, ende: d.ende });
  const outside = [].concat(d.ereignisse, d.koeder, d.notizen).some(r => { const m = evMin(r, sp.b); return m != null && (m < sp.b - 1 || m > sp.e + 1); });
  if (outside && !E.outsideOk) { E.outsideOk = true; return fail('Mindestens eine Uhrzeit liegt außerhalb von Beginn und Ende. Prüf das kurz; tippst du nochmal auf „Speichern“, wird trotzdem gespeichert.'); }
  let g;
  try { g = await ensureGw(d.gw, d.gwNeu, d.ziel); } catch (e) { return; }
  if (!g) return;
  const old = d.appId ? state.sessions.find(s => s.appId === d.appId) : null;
  if (old && (isDone(old) || isLive(old))) return fail('Diese Session ist gesperrt.');
  const ts = new Date().toISOString();
  const s = old ? clone(old) : { appId: uuid(), id: '', status: 'entwurf', live: false, quelle: 'app', erstellt: ts, _uebertragenAm: null };
  s.datum = d.datum; s.beginn = normTime(d.beginn); s.ende = normTime(d.ende);
  s.gewaesser = g.slug; s.gewaesserName = g.name || g.slug;
  s.spot = await resolveSpot(g, d.spot, d.spotNeu);
  if (!s.spot) delete s.spot;
  s.zielfisch = d.ziel; s.angelart = d.art;
  // Setup als Momentaufnahme: Bleibt das Setup gleich, bleibt auch die alte Aufnahme, nur das Vorfach wird übernommen.
  const oldSu = old && old.setup ? old.setup : null;
  let su;
  if (d.setup && oldSu && oldSu.setupId === d.setup) { su = Object.assign({}, oldSu); if (trim(d.vorfach)) su.vorfach = trim(d.vorfach); else delete su.vorfach; }
  else su = setupSnapshot(d.setup, d.vorfach);
  if (su && Object.keys(su).length) s.setup = su; else delete s.setup;
  const beo = Object.assign({}, s.beobachtungen || {});
  const wt = num(d.wt), si = num(d.sicht);
  if (wt != null) beo.wassertemp = wt; else delete beo.wassertemp;
  if (si != null) beo.sichttiefe = si; else delete beo.sichttiefe;
  s.beobachtungen = beo;
  s.koeder = d.koeder.map(kClean);
  const evs = [];
  for (const ev of d.ereignisse) {
    const o = {};
    Object.keys(ev).forEach(k => { if (!['laengeCm', 'tiefeM', 'spotNeu', '_autoK', 'entnommen'].includes(k)) o[k] = ev[k]; });
    o.zeit = normTime(ev.zeit);
    if (ev._autoK) o.koeder = koederAt(d, ev.zeit);
    const L = num(ev.laengeCm), T = num(ev.tiefeM);
    if (L != null && o.typ === 'fang') o.laengeCm = L;
    if (T != null) o.tiefeM = T;
    o.spot = await resolveSpot(g, ev.spot, ev.spotNeu);
    ['art', 'koeder', 'notiz', 'spot'].forEach(k => { o[k] = trim(o[k]); if (!o[k]) delete o[k]; });
    if (!o.koordinaten) delete o.koordinaten;
    if (!o.bild) delete o.bild;
    if (o.typ !== 'fang') delete o.art;
    else o.entnommen = !!ev.entnommen;
    evs.push(o);
  }
  s.ereignisse = evs.sort((a, b) => evMin(a, sp.b) - evMin(b, sp.b));
  s.notizen = d.notizen.map(n => Object.assign({}, n, { zeit: normTime(n.zeit), text: trim(n.text) }));
  ['eindruck', 'naechstesMal'].forEach(k => { const v = trim(d[k]); if (v) s[k] = v; else delete s[k]; });
  s.live = false;
  finalize(s);
  try { await saveSession(s); } catch (e) { return; }
  state.sessions = state.sessions.filter(x => x.appId !== s.appId).concat(s); sortSessions();
  rememberSetup(g.slug, d.setup);
  state.edit = null; state.delConfirm = false;
  gcBilder();
  toast(old ? 'Änderungen gespeichert' : 'Session gespeichert');
  state.view = 'sessions';
  renderAll();
  window.scrollTo(0, 0);
}
async function deleteSession(id) {
  const s = state.sessions.find(x => x.appId === id);
  if (!s || isDone(s) || isLive(s)) return;
  try { await del('sessions', id); } catch (e) { toast('Löschen fehlgeschlagen. Versuch es erneut.'); return; }
  state.sessions = state.sessions.filter(x => x.appId !== id);
  state.edit = null; state.delConfirm = false;
  if ($('#sheet').open) $('#sheet').close();
  gcBilder();
  toast('Session gelöscht');
  renderAll();
}

/* ---------- Gewässer anlegen und bearbeiten ---------- */
function openGwEditor(g) {
  if (g && !isNewGw(g)) return;
  state.edit = {
    kind: 'gw', orig: g ? g.slug : null, err: '',
    d: g ? { name: g.name || '', kuerzel: g.kuerzel || '', typ: g.typ || '', lage: g.lage || '', tide: g.tide || 'prüfen', zielfische: (g.zielfische || []).join(', '), spots: spotNames(g).join('\n'), beschreibung: g.beschreibung || '' }
      : { name: '', kuerzel: '', typ: '', lage: '', tide: 'prüfen', zielfische: '', spots: '', beschreibung: '' }
  };
  state.view = 'gewaesser';
  if ($('#sheet').open) $('#sheet').close();
  renderAll();
  window.scrollTo(0, 0);
}
function gwEditor() {
  const E = state.edit, d = E.d;
  return `<div class="card">
    <h2>${E.orig ? 'Gewässer bearbeiten' : 'Neues Gewässer'}</h2>
    <p class="hint">Neue Gewässer gehen beim nächsten Übertragen mit ins Fangbuch. Claude ergänzt dort den Steckbrief.</p>
    ${textFld('e', 'name', d.name, 'Name', ' placeholder="z. B. Stadtsee"')}
    <div class="grid2">
      ${textFld('e', 'kuerzel', d.kuerzel, 'Kürzel (2 bis 3 Buchstaben)', ` maxlength="3" autocapitalize="characters" placeholder="${esc(d.name ? initials(d.name) : 'z. B. HH')}"`)}
      ${selFld('e', 'typ', d.typ, 'Typ', GWTYP)}
    </div>
    ${textFld('e', 'lage', d.lage, 'Lage', ' placeholder="z. B. Ort oder Landkreis"')}
    ${selFld('e', 'tide', d.tide, 'Tide', ['prüfen', 'ja', 'nein'], { empty: null })}
    ${textFld('e', 'zielfische', d.zielfische, 'Zielfische (mit Komma getrennt)', ' placeholder="z. B. Barsch, Zander"')}
    <label class="fld"><span>Spots (einer pro Zeile)</span><textarea rows="3" ${bind('e', 'spots')}>${esc(d.spots)}</textarea></label>
    <label class="fld"><span>Beschreibung</span><textarea rows="3" ${bind('e', 'beschreibung')}>${esc(d.beschreibung)}</textarea></label>
    ${E.err ? `<div class="note-card warn" role="alert"><p>${esc(E.err)}</p></div>` : ''}
    <div class="formactions">
      <button class="btn big" data-act="gw-save">Speichern</button>
      <button class="btn ghost wide" data-act="edit-cancel">Abbrechen</button>
    </div>
  </div>`;
}
async function saveGwEditor() {
  const E = state.edit, d = E.d;
  const fail = msg => { E.err = msg; renderView(); };
  const name = trim(d.name);
  if (!name) return fail('Trag einen Namen ein.');
  const slug = E.orig || slugify(name);
  if (!slug) return fail('Der Name braucht mindestens einen Buchstaben oder eine Zahl.');
  if (!E.orig && state.gwMap[slug]) return fail('Dieses Gewässer gibt es schon.');
  const kz = String(d.kuerzel || '').toUpperCase().replace(/[^A-Z0-9]/g, '') || initials(name);
  if (kz.length < 2 || kz.length > 3) return fail('Das Kürzel braucht 2 bis 3 Buchstaben.');
  const old = E.orig ? state.gwMap[E.orig] : null;
  const g = old ? clone(old) : newGwDoc(name);
  g.slug = slug; g.name = name; g.kuerzel = kz; g.tide = d.tide || 'prüfen';
  ['typ', 'lage', 'beschreibung'].forEach(k => { const v = trim(d[k]); if (v) g[k] = v; else delete g[k]; });
  g.zielfische = uniq(String(d.zielfische || '').split(',').map(x => x.trim()));
  const oldSpots = new Map((old ? old.spots || [] : []).filter(x => x && typeof x === 'object').map(x => [x.name, x]));
  g.spots = uniq(String(d.spots || '').split('\n').map(x => x.trim())).map(n => oldSpots.get(n) || { name: n });
  g.aktualisiert = new Date().toISOString();
  try { await persist('gewaesser', g); } catch (e) { return; }
  addGwLocal(g);
  state.sessions.filter(s => s.gewaesser === slug && !isDone(s)).forEach(s => { if (s.gewaesserName !== name) { s.gewaesserName = name; saveSession(s); } });
  state.edit = null;
  toast('Gewässer gespeichert');
  renderAll();
}
async function deleteGw(slug) {
  const g = state.gwMap[slug];
  if (!g || !isNewGw(g) || state.sessions.some(s => s.gewaesser === slug)) return;
  try { await del('gewaesser', slug); } catch (e) { toast('Löschen fehlgeschlagen.'); return; }
  state.gewaesser = state.gewaesser.filter(x => x.slug !== slug);
  delete state.gwMap[slug];
  if ($('#sheet').open) $('#sheet').close();
  toast('Gewässer gelöscht');
  renderAll();
}

/* ---------- Export ins Fangbuch ---------- */
const SESSION_ORDER = ['id', 'status', 'live', 'quelle', 'datum', 'beginn', 'ende', 'angelzeitMin', 'gewaesser', 'gewaesserName', 'spot', 'angelart', 'zielfisch', 'setup', 'koeder', 'ereignisse', 'beobachtungen', 'umwelt', 'kennzahlen', 'notizen', 'eindruck', 'naechstesMal', 'offeneFragen', 'erstellt', 'aktualisiert', 'getesteteEmpfehlungen', 'appId', 'koordinaten'];
const SETUP_ORDER = ['setupId', 'kombo', 'hauptschnur', 'vorfach'];
const KOEDER_ORDER = ['zeit', 'label', 'typ', 'modell', 'farbe', 'groesseCm', 'gewichtG', 'jigkopfG', 'fuehrung', 'schicht'];
const MONTAGE_ORDER = ['art', 'bleiG', 'haken', 'hakenAustritt', 'hakenspitze', 'stinger', 'stingerArt', 'stingerPosition', 'notiz'];
const EVENT_ORDER = ['zeit', 'typ', 'koeder', 'spot', 'tiefeM', 'art', 'laengeCm', 'gewichtG', 'entnommen', 'notiz', 'koordinaten', 'bild'];
const GW_ORDER = ['name', 'kuerzel', 'typ', 'lage', 'verein', 'tide', 'angelart', 'zielfische', 'fischarten', 'beschreibung', 'regeln', 'spots', 'erkenntnisse', 'hypothesen', 'referenzen', 'aktualisiert'];
const SPOT_ORDER = ['name', 'beschreibung', 'struktur', 'tiefe', 'grund', 'notiz'];
const empty = v => v == null || v === '' || (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length);
function pick(obj, order, keepEmpty) {
  const o = {};
  order.forEach(k => {
    let v = obj[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) v = Object.fromEntries(Object.entries(v).filter(([kk, x]) => !kk.startsWith('_') && !empty(x)));
    if (keepEmpty && keepEmpty.includes(k) && v != null) { o[k] = v; return; }
    if (!empty(v)) o[k] = v;
  });
  return o;
}
function exportKoeder(k) {
  const o = pick(k, KOEDER_ORDER);
  if (k.montage && typeof k.montage === 'object') {
    const m = pick(k.montage, MONTAGE_ORDER);
    if (Object.keys(m).some(x => x !== 'stinger') || m.stinger) o.montage = m;
  }
  return o;
}
function exportSession(s, withBild) {
  const x = clone(s);
  x.id = '';
  x.status = 'entwurf'; x.live = false; x.quelle = 'app';
  const sp = spanOf(x);
  x.angelzeitMin = sp && sp.e != null ? Math.max(1, sp.e - sp.b) : undefined;
  x.kennzahlen = kennzahlen(x);
  if (x.setup) x.setup = pick(x.setup, SETUP_ORDER);
  x.koeder = (x.koeder || []).map(exportKoeder);
  x.ereignisse = (x.ereignisse || []).map(e => { const o = pick(e, EVENT_ORDER, ['entnommen']); if (!withBild || !bildId(o.bild)) delete o.bild; return o; });
  x.notizen = (x.notizen || []).map(n => pick(n, ['zeit', 'text']));
  return pick(x, SESSION_ORDER, ['id', 'live', 'koeder', 'ereignisse', 'notizen']);
}
function exportGw(g) {
  const x = clone(g);
  x.spots = (x.spots || []).map(sp => typeof sp === 'string' ? { name: sp } : pick(sp, SPOT_ORDER));
  return pick(x, GW_ORDER, ['zielfische', 'fischarten', 'regeln', 'spots', 'erkenntnisse', 'hypothesen', 'referenzen']);
}
function exportSpotsOnly(g) {
  const names = g._neueSpots || [];
  const spots = (g.spots || []).filter(sp => names.includes(typeof sp === 'string' ? sp : sp && sp.name)).map(sp => typeof sp === 'string' ? { name: sp } : pick(sp, SPOT_ORDER));
  return pick({ name: g.name, kuerzel: g.kuerzel, spots }, ['name', 'kuerzel', 'spots']);
}
async function buildExport() {
  const sessions = openSessions().slice().sort((a, b) => String(a.datum).localeCompare(String(b.datum)) || String(a.beginn).localeCompare(String(b.beginn)));
  const gws = openGw(), sgws = spotGw();
  const gewaesser = Object.fromEntries(gws.map(g => [g.slug, exportGw(g)]).concat(sgws.map(g => [g.slug, exportSpotsOnly(g)])));
  const base = { format: 'fangbuch-app-export', schemaVersion: SCHEMA_VERSION, exportiert: new Date().toISOString() };
  const textPayload = Object.assign({}, base, { sessions: sessions.map(s => exportSession(s, false)), gewaesser });
  const filePayload = Object.assign({}, base, { sessions: sessions.map(s => exportSession(s, true)), gewaesser });
  const ids = [];
  filePayload.sessions.forEach(s => s.ereignisse.forEach(e => { const id = bildId(e.bild); if (id) ids.push(id); }));
  if (ids.length) {
    filePayload.bilder = {};
    for (const id of ids) {
      const d = await bildData(id);
      if (d) filePayload.bilder[id] = d;
      else filePayload.sessions.forEach(s => s.ereignisse.forEach(e => { if (e.bild === 'bild:' + id) delete e.bild; }));
    }
    if (!Object.keys(filePayload.bilder).length) delete filePayload.bilder;
  }
  const json = JSON.stringify(textPayload, null, 1);
  return {
    json, text: EXPORT_INTRO + '\n\n' + json, fileJson: JSON.stringify(filePayload, null, 1), bilder: Object.keys(filePayload.bilder || {}).length,
    sessions: sessions.map(s => ({ appId: s.appId, aktualisiert: s.aktualisiert })),
    gewaesser: gws.map(g => ({ slug: g.slug, aktualisiert: g.aktualisiert })).concat(sgws.map(g => ({ slug: g.slug, neueSpots: (g._neueSpots || []).slice() })))
  };
}
async function markPending(exp) {
  state.pending = { at: new Date().toISOString(), sessions: exp.sessions, gewaesser: exp.gewaesser };
  try { await putMeta('pendingExport', state.pending); } catch (e) { /* bleibt im Speicher */ }
  renderAll();
}
async function shareExport(asFile) {
  const exp = state.exp;
  if (!exp) return;
  const fname = `fangbuch-export-${isoDate(new Date())}.json`;
  try {
    if (asFile) {
      const file = new File([exp.fileJson], fname, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], text: EXPORT_INTRO });
      else { download(exp.fileJson, fname); }
    } else if (navigator.share) {
      await navigator.share({ text: exp.text });
    } else { await copyText(exp.text); }
    await markPending(exp);
  } catch (e) {
    if (e && e.name === 'AbortError') return;
    toast('Teilen ging nicht. Nimm „Text kopieren“.');
  }
}
async function copyExport() {
  const exp = state.exp;
  if (!exp) return;
  // Auch wenn nur markiert statt kopiert wurde: Die Rückfrage klärt, ob es angekommen ist.
  const copied = await copyText(exp.text);
  await markPending(exp);
  if (!copied) { const ta = $('#exporttext'); if (ta) { ta.focus(); ta.select(); } }
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('Kopiert. Jetzt im Projekt „Angeln“ einfügen.'); return true; }
  catch (e) {
    const ta = $('#exporttext');
    if (ta) { ta.focus(); ta.select(); toast('Text ist markiert, jetzt kopieren.'); }
    return false;
  }
}
function download(text, fname) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url; a.download = fname;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
async function confirmPending(ok) {
  const p = state.pending;
  if (!p) return;
  if (ok) {
    const now = new Date().toISOString();
    let changed = 0;
    for (const x of p.sessions) {
      const s = state.sessions.find(y => y.appId === x.appId);
      if (!s) continue;
      if (s.aktualisiert !== x.aktualisiert) { changed++; continue; }
      s._uebertragenAm = now;
      await saveSession(s).catch(() => {});
    }
    for (const x of p.gewaesser) {
      const g = state.gwMap[x.slug];
      if (!g) continue;
      if (x.neueSpots) {
        g._neueSpots = (g._neueSpots || []).filter(n => !x.neueSpots.includes(n));
      } else {
        if (g.aktualisiert !== x.aktualisiert) continue;
        g._uebertragenAm = now;
        g._neueSpots = [];
      }
      await persist('gewaesser', g).catch(() => {});
    }
    toast(changed ? `Übertragen. ${plural(changed, 'Session wurde', 'Sessions wurden')} danach geändert und ${changed === 1 ? 'bleibt' : 'bleiben'} offen.` : 'Als übertragen markiert');
  } else {
    toast('Nichts markiert. Exportier einfach nochmal.');
  }
  state.pending = null;
  state.exp = null;
  try { await del('meta', 'pendingExport'); } catch (e) { /* egal */ }
  renderAll();
}
function renderUebertragen() {
  let h = pendingCard();
  const os = openSessions(), og = openGw(), sg = spotGw();
  h += staleCard();
  h += `<div class="card"><h2>An Fangbuch übertragen</h2>`;
  if (!os.length && !og.length && !sg.length) {
    h += `<p class="hint">Alles ist übertragen. Neue Sessions erscheinen hier, sobald du sie beendet oder nachgetragen hast.</p>`;
    if (state.live) h += '<p class="hint">Die laufende Live-Session kommt dazu, sobald du sie beendest.</p>';
    $('#main').innerHTML = h + '</div>';
    return;
  }
  const extra = [og.length ? plural(og.length, 'neues Gewässer', 'neue Gewässer') : '', sg.length ? 'neue Spots an ' + plural(sg.length, 'Gewässer', 'Gewässern') : ''].filter(Boolean).join(' und ');
  h += `<p class="summary">${plural(os.length, 'Session', 'Sessions')}${extra ? ' sowie ' + extra : ''} warten auf die Übertragung.</p>`;
  h += '<ul class="evlist">' + os.map(s => { const d = parseDate(s.datum); const st = statsOf(s); return `<li><span class="t">${d ? esc(DF_SHORT.format(d).slice(0, 6)) : ''}</span><span>${esc(gwName(s))}${s.spot ? ', ' + esc(s.spot) : ''}: ${st.faenge ? plural(st.faenge, 'Fang', 'Fänge') : st.bisse ? plural(st.bisse, 'Biss', 'Bisse') : 'Nullrunde'}</span></li>`; }).join('')
    + og.map(g => `<li><span class="t">neu</span><span>Gewässer ${esc(g.name)}</span></li>`).join('')
    + sg.map(g => `<li><span class="t">Spots</span><span>${esc(g.name)}: ${esc(g._neueSpots.join(', '))}</span></li>`).join('') + '</ul>';
  if (state.live) h += '<p class="hint" style="margin-top:10px">Die laufende Live-Session ist nicht dabei. Sie kommt beim nächsten Mal mit.</p>';
  if (!state.exp) {
    h += `<div class="stack"><button class="btn big" data-act="exp-build">Export erstellen</button></div>
      <p class="hint" style="margin-top:12px">Danach teilst du den Text in die Claude-App oder kopierst ihn ins Projekt „Angeln“. Claude übernimmt die Sessions dort ins Fangbuch und ergänzt Wetter, Luftdruck, Sonne, Mond und Tide.</p>`;
  } else {
    const nb = state.exp.bilder;
    h += `<div class="stack">
        ${nb ? '<button class="btn big" data-act="exp-file">Als Datei mit Screenshots teilen</button>' : ''}
        ${navigator.share ? `<button class="btn ${nb ? 'ghost wide' : 'big'}" data-act="exp-share">Als Text teilen</button>` : ''}
        <button class="btn ghost wide" data-act="exp-copy">Text kopieren</button>
        ${nb ? '' : '<button class="btn ghost wide" data-act="exp-file">Als Datei teilen</button>'}
      </div>
      ${nb ? `<p class="hint" style="margin-top:12px">${plural(nb, 'Screenshot geht', 'Screenshots gehen')} nur mit der Datei mit. Teil die Datei in die Claude-App ins Projekt „Angeln“ und schreib dazu: „${esc(EXPORT_INTRO)}“. Der Text enthält alles andere, aber keine Bilder.</p>`
        : '<p class="hint" style="margin-top:12px">So geht es: Im Teilen-Menü die Claude-App wählen, das Projekt „Angeln“ öffnen und senden. Oder kopieren und dort in einen Chat einfügen. Danach fragt die App, ob alles angekommen ist.</p>'}
      <label class="fld"><span>Vorschau (Text)</span><textarea class="exportbox" id="exporttext" readonly>${esc(state.exp.text)}</textarea></label>`;
  }
  $('#main').innerHTML = h + '</div>';
}

/* ---------- Import aus dem Fangbuch ---------- */
function parseJsonLoose(text) {
  const t = String(text || '').replace(/^﻿/, '');
  try { return JSON.parse(t); } catch (e) { /* weiter */ }
  const fence = /```(?:json)?\s*([\s\S]*?)```/.exec(t);
  if (fence) { try { return JSON.parse(fence[1]); } catch (e) { /* weiter */ } }
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a !== -1 && b > a) return JSON.parse(t.slice(a, b + 1));
  throw new Error('kein JSON');
}
function asMap(v, keyField) {
  if (!v) return {};
  if (Array.isArray(v)) {
    const m = {};
    v.forEach(x => { if (x && typeof x === 'object') { const k = x[keyField] || x.slug || x.id || x._id; if (k) m[k] = x; } });
    return m;
  }
  return typeof v === 'object' ? v : {};
}
// Gewässer aus dem Fangbuch mit dem lokalen Stand zusammenführen: Angaben aus dem Import gewinnen,
// in der App angelegte Spots bleiben erhalten und gehen beim nächsten Übertragen mit.
function mergeGw(local, incoming, slug, now) {
  const base = local ? Object.fromEntries(Object.entries(local).filter(([k]) => !k.startsWith('_'))) : {};
  const g = Object.assign(base, incoming, { slug, _quelle: 'import', _importiertAm: now, _uebertragenAm: null });
  delete g._id;
  if (!g.name) g.name = slug;
  if (local && Array.isArray(incoming.spots)) {
    const inNames = new Set(spotNames(incoming));
    const extra = (local.spots || []).filter(sp => { const n = typeof sp === 'string' ? sp : sp && sp.name; return n && !inNames.has(n); });
    g.spots = incoming.spots.concat(extra);
    const wasNew = isNewGw(local);
    g._neueSpots = extra.map(sp => typeof sp === 'string' ? sp : sp.name).filter(n => wasNew || (local._neueSpots || []).includes(n));
  } else if (local) {
    g._neueSpots = isNewGw(local) ? spotNames(local) : (local._neueSpots || []);
  }
  return g;
}
function cleanSetup(x) {
  const o = { id: x.id, name: trim(x.name) || x.id };
  ['rute', 'rolle', 'hauptschnur', 'vorfach'].forEach(k => { const v = trim(x[k]); if (v) o[k] = v; });
  o.aktiv = x.aktiv !== false;
  return o;
}
async function importData(text) {
  let data;
  try { data = parseJsonLoose(text); }
  catch (e) { state.importMsg = { err: true, text: 'Das ist kein gültiges JSON. Kopier den Export aus dem Projekt „Angeln“ vollständig, von der ersten bis zur letzten geschweiften Klammer.' }; renderView(); return; }
  if (data && data.format === 'fangbuch-app-backup') { state.importMsg = { err: true, text: 'Das ist eine Datensicherung der App. Nutze dafür „Sicherung wiederherstellen“.' }; renderView(); return; }
  if (data && data.format === 'fangbuch-app-export') { state.importMsg = { err: true, text: 'Das ist ein Export aus dieser App. Der gehört ins Projekt „Angeln“, nicht hierher.' }; renderView(); return; }
  const gws = asMap(data && data.gewaesser, 'slug');
  const emps = asMap(data && data.empfehlungen, 'id');
  const setups = Array.isArray(data && data.setups) ? data.setups.filter(x => x && typeof x === 'object' && (x.id || x.name)) : [];
  const gKeys = Object.keys(gws).filter(k => gws[k] && typeof gws[k] === 'object');
  const eKeys = Object.keys(emps).filter(k => emps[k] && typeof emps[k] === 'object');
  if (!gKeys.length && !eKeys.length && !setups.length) { state.importMsg = { err: true, text: 'Keine Gewässer, Vorschläge oder Setups gefunden. Erwartet wird {"gewaesser": {...}, "empfehlungen": {...}}.' }; renderView(); return; }
  const now = new Date().toISOString();
  const gDocs = gKeys.map(k => { const slug = slugify(k) || k; return mergeGw(state.gwMap[slug], gws[k], slug, now); });
  const eDocs = eKeys.map(k => Object.assign({}, emps[k], { id: k, _importiertAm: now }));
  eDocs.forEach(e => delete e._id);
  try {
    await tx(['gewaesser', 'empfehlungen'], 'readwrite', t => {
      gDocs.forEach(g => t.objectStore('gewaesser').put(g));
      eDocs.forEach(e => t.objectStore('empfehlungen').put(e));
    });
  } catch (e) { state.importMsg = { err: true, text: 'Speichern fehlgeschlagen. Versuch es erneut.' }; renderView(); return; }
  gDocs.forEach(addGwLocal);
  const em = new Map(state.empfehlungen.map(e => [e.id, e]));
  eDocs.forEach(e => em.set(e.id, e));
  state.empfehlungen = Array.from(em.values());
  if (setups.length) {
    const map = new Map((state.settings.setups || []).map(x => [x.id, x]));
    setups.forEach(x => { const id = x.id || slugify(x.name); map.set(id, cleanSetup(Object.assign({}, x, { id }))); });
    state.settings.setups = Array.from(map.values());
    await saveSettings();
  }
  state.importText = '';
  defaultForm();
  const open = eDocs.filter(isActiveV).length;
  const parts = [gDocs.length ? plural(gDocs.length, 'Gewässer', 'Gewässer') : '', eDocs.length ? plural(eDocs.length, 'Vorschlag', 'Vorschläge') + ', davon ' + open + ' offen oder im Test' : '', setups.length ? plural(setups.length, 'Setup', 'Setups') : ''].filter(Boolean);
  state.importMsg = { err: false, text: `Übernommen: ${parts.join(', ')}. Alles steht jetzt auch offline bereit.` };
  renderAll();
}
async function readFile(input) {
  const f = input.files && input.files[0];
  input.value = '';
  if (!f) return null;
  if (f.size > 200 * 1024 * 1024) { toast('Die Datei ist zu groß.'); return null; }
  try { return await f.text(); } catch (e) { toast('Datei konnte nicht gelesen werden.'); return null; }
}

/* ---------- Datensicherung ---------- */
async function backup() {
  const data = {
    format: 'fangbuch-app-backup', version: 2, erstellt: new Date().toISOString(),
    sessions: await getAll('sessions'), gewaesser: await getAll('gewaesser'), empfehlungen: await getAll('empfehlungen'),
    meta: (await getAll('meta')).filter(m => m.key !== 'lastBackup'), bilder: await getAll('bilder')
  };
  const json = JSON.stringify(data);
  const fname = `fangbuch-sicherung-${isoDate(new Date())}.json`;
  try {
    const file = new File([json], fname, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file] });
    else download(json, fname);
  } catch (e) {
    if (e && e.name === 'AbortError') return;
    download(json, fname);
  }
  state.lastBackup = data.erstellt;
  putMeta('lastBackup', state.lastBackup).catch(() => {});
  toast('Sicherung erstellt. Leg sie z. B. in iCloud Drive ab.');
  renderView();
}
async function prepareRestore(text) {
  let data;
  try { data = parseJsonLoose(text); } catch (e) { toast('Die Datei ist keine Sicherung der Fangbuch-App.'); return; }
  if (!data || data.format !== 'fangbuch-app-backup' || !Array.isArray(data.sessions)) { toast('Die Datei ist keine Sicherung der Fangbuch-App.'); return; }
  state.restore = data;
  renderView();
}
async function doRestore() {
  const d = state.restore;
  if (!d) return;
  const okArr = (arr, key) => (Array.isArray(arr) ? arr : []).filter(x => x && typeof x === 'object' && x[key]);
  try {
    await tx(Object.keys(STORES), 'readwrite', t => {
      Object.keys(STORES).forEach(n => t.objectStore(n).clear());
      okArr(d.sessions, 'appId').forEach(x => t.objectStore('sessions').put(x));
      okArr(d.gewaesser, 'slug').forEach(x => t.objectStore('gewaesser').put(x));
      okArr(d.empfehlungen, 'id').forEach(x => t.objectStore('empfehlungen').put(x));
      okArr(d.meta, 'key').forEach(x => t.objectStore('meta').put(x));
      okArr(d.bilder, 'id').forEach(x => t.objectStore('bilder').put(x));
      if (d.erstellt) t.objectStore('meta').put({ key: 'lastBackup', value: d.erstellt });
    });
  } catch (e) { toast('Wiederherstellen fehlgeschlagen. Deine bisherigen Daten sind unverändert.'); return; }
  state.restore = null;
  stopTimer(); wakeOff();
  state.live = null; state.edit = null; state.exp = null; state.bildCache.clear();
  await loadAll();
  toast('Sicherung wiederhergestellt');
  renderAll();
}

/* ---------- Ansicht: Daten ---------- */
function setupsCard() {
  const S = state.settings;
  const E = state.setupEdit;
  let h = `<div class="card"><h2>Setups</h2><p class="hint">Rute, Rolle und Schnur. Beim Start einer Session wählst du ein Setup, die App merkt sich pro Gewässer das zuletzt genutzte. Inaktive Setups erscheinen nicht mehr in der Auswahl.</p>`;
  if (E) {
    const d = E.d;
    h += `<div class="erow">${textFld('s', 'name', d.name, 'Name', ' placeholder="z. B. Spinnrute leicht"')}
      ${textFld('s', 'rute', d.rute, 'Rute')}${textFld('s', 'rolle', d.rolle, 'Rolle')}
      ${textFld('s', 'hauptschnur', d.hauptschnur, 'Hauptschnur', ' placeholder="z. B. geflochten, 9 kg"')}
      ${textFld('s', 'vorfach', d.vorfach, 'Vorfach (Vorbelegung)', ' placeholder="z. B. Fluoro 0,40 mm, 60 cm"')}
      <label class="check"><input type="checkbox" ${bind('s', 'aktiv')}${d.aktiv !== false ? ' checked' : ''}> Aktiv</label>
      ${E.err ? `<p class="catch">${esc(E.err)}</p>` : ''}
      <div class="row"><button class="btn" data-act="setup-save">Speichern</button><button class="btn ghost" data-act="setup-cancel">Abbrechen</button>${E.orig ? '<button class="linkbtn" data-act="setup-del">Löschen</button>' : ''}</div></div>`;
  }
  const list = S.setups || [];
  h += list.length ? list.map(x => `<div class="settingrow"><div><b>${esc(x.name)}</b>${x.aktiv === false ? ' <span class="badge">inaktiv</span>' : ''}<p class="smeta">${esc([[x.rute, x.rolle].filter(Boolean).join(' + '), x.hauptschnur, x.vorfach ? 'Vorfach ' + x.vorfach : ''].filter(Boolean).join(', '))}</p></div><button class="btn ghost small" data-act="setup-edit" data-id="${esc(x.id)}">Bearbeiten</button></div>`).join('')
    : '<p class="hint">Noch keine Setups. Leg sie hier an oder importier deine Startdaten.</p>';
  if (!E) h += '<div class="row" style="margin-top:12px"><button class="btn ghost small" data-act="setup-new">Setup hinzufügen</button></div>';
  return h + '</div>';
}
function chipList(key, title, hint) {
  const vals = state.settings[key] || [];
  return `<div class="settingblock"><b>${title}</b><p class="smeta">${hint}</p>
    <div class="chips">${vals.length ? vals.map(v => `<span class="chip">${esc(v)}<button type="button" data-act="list-del" data-key="${key}" data-v="${esc(v)}" aria-label="${esc(v)} entfernen">×</button></span>`).join('') : '<span class="smeta">Keine eigenen Einträge.</span>'}</div>
    <div class="row"><input id="add-${key}" value="${esc(state.listAdd[key])}" placeholder="Neuer Eintrag" autocomplete="off"><button class="btn ghost small" data-act="list-add" data-key="${key}">Hinzufügen</button></div></div>`;
}
function renderDaten() {
  const S = state.settings;
  const M = state.importMsg;
  let h = `<div class="card"><h2>Import aus dem Fangbuch</h2>
    <p class="hint">Schreib im Projekt „Angeln“: „Exportier meine Gewässer und Vorschläge für die Fangbuch-App.“ Claude liefert ein JSON. Füg es hier ein oder wähl die Datei. Danach stehen Gewässer und Spots im Startformular und die offenen Vorschläge während der Session bereit, auch offline. Auf demselben Weg importierst du deine Startdaten mit Setups und Spots.</p>
    <label class="fld"><span>JSON einfügen</span><textarea class="exportbox" id="imp-text" rows="6" placeholder='{"gewaesser": {...}, "empfehlungen": {...}}'>${esc(state.importText)}</textarea></label>
    <div class="row"><button class="btn" data-act="imp-text">Importieren</button><label class="btn ghost filelabel">Datei wählen<input type="file" id="imp-file" accept=".json,.txt,application/json,text/plain"></label></div>
    ${M ? `<div class="note-card ${M.err ? 'warn' : 'done'}" role="status"><p>${esc(M.text)}</p></div>` : ''}
    <p class="hint" style="margin-top:12px">Auf dem Handy: ${plural(state.gewaesser.length, 'Gewässer', 'Gewässer')}, ${plural(state.empfehlungen.length, 'Vorschlag', 'Vorschläge')}, ${plural((S.setups || []).length, 'Setup', 'Setups')}.</p>
  </div>`;
  h += setupsCard();
  h += `<div class="card"><h2>Eigene Listen</h2>
    ${chipList('typen', 'Eigene Ködertypen', 'Kommen dazu, wenn du beim Ködertyp „Eigener Typ …“ wählst.')}
    ${chipList('montagen', 'Eigene Montagen', 'Kommen dazu, wenn du bei der Montage „Eigene Montage …“ wählst.')}
  </div>`;
  const lb = state.lastBackup ? new Date(state.lastBackup) : null;
  h += `<div class="card"><h2>Datensicherung</h2>
    <p class="hint">Sichert alle Daten der App in eine Datei: Sessions, Screenshots, Gewässer, Vorschläge und Einstellungen. Speicher sie in iCloud Drive oder „Dateien“. Mit der Datei holst du alles zurück, etwa auf einem neuen Handy.</p>
    <p>${lb ? 'Letzte Sicherung: ' + esc(DF_TS.format(lb)) : 'Noch keine Sicherung erstellt.'}</p>
    <div class="row"><button class="btn" data-act="backup">Sicherung erstellen</button><label class="btn ghost filelabel">Sicherung wiederherstellen<input type="file" id="restore-file" accept=".json,application/json"></label></div>`;
  if (state.restore) {
    const r = state.restore;
    h += `<div class="note-card warn"><h2>Sicherung wiederherstellen?</h2>
      <p>Sicherung vom ${esc(r.erstellt ? DF_TS.format(new Date(r.erstellt)) : 'unbekannten Datum')}: ${plural(r.sessions.length, 'Session', 'Sessions')}, ${plural((r.gewaesser || []).length, 'Gewässer', 'Gewässer')}, ${plural((r.empfehlungen || []).length, 'Vorschlag', 'Vorschläge')}, ${plural((r.bilder || []).length, 'Screenshot', 'Screenshots')}.</p>
      <p><b>Alle Daten auf diesem Handy werden dabei ersetzt.</b>${state.live ? ' Die laufende Live-Session geht verloren.' : ''}</p>
      <div class="row"><button class="btn danger" data-act="restore-yes">Ja, ersetzen</button><button class="btn ghost" data-act="restore-no">Abbrechen</button></div></div>`;
  }
  h += '</div>';
  const sp = S.sunPos;
  h += `<div class="card"><h2>Einstellungen</h2>
    <div class="settingrow"><div><b>GPS-Position automatisch speichern</b><p class="smeta">Beim Start einer Live-Session und bei jedem Fang. Unabhängig davon kannst du bei jedem Eintrag „Position übernehmen“ tippen. Die Position geht nur über den Export ins Fangbuch.</p></div><input type="checkbox" class="switch" id="set-gps" aria-label="GPS-Position automatisch speichern"${S.gps ? ' checked' : ''}></div>
    <div class="settingrow"><div><b>Ort für die Dämmerung</b><p class="smeta">${sp ? 'Gespeichert: ' + esc(NF1.format(sp.lat)) + ', ' + esc(NF1.format(sp.lon)) : 'Nicht gesetzt. Die App rechnet mit der Mitte Deutschlands, außer eine Session hat GPS-Daten.'}</p></div><button class="btn ghost small" data-act="sunpos">${sp ? 'Neu bestimmen' : 'Festlegen'}</button></div>
  </div>`;
  h += `<div class="card"><h2>Über die App</h2><p class="hint">Alle Daten liegen nur auf diesem Handy, im Speicher dieser Web-App. Nichts verlässt das Handy außer über „Übertragen“ und „Sicherung“. Auf dem iPhone haben Safari und die App auf dem Home-Bildschirm getrennte Speicher: Nutze immer die App vom Home-Bildschirm.</p>
    <p class="smeta" id="storage-info"></p></div>`;
  $('#main').innerHTML = h;
  storageInfo();
}
async function storageInfo() {
  const el = $('#storage-info');
  if (!el || !navigator.storage) return;
  const parts = ['Datenformat ' + SCHEMA_VERSION];
  try { if (navigator.storage.persisted) parts.push(await navigator.storage.persisted() ? 'Speicher dauerhaft geschützt' : 'Speicher nicht dauerhaft geschützt'); } catch (e) { /* egal */ }
  try { if (navigator.storage.estimate) { const e = await navigator.storage.estimate(); if (e.usage != null) parts.push(NF1.format(e.usage / 1024 / 1024) + ' MB belegt'); } } catch (e) { /* egal */ }
  parts.push(navigator.serviceWorker && navigator.serviceWorker.controller ? 'offline bereit' : 'noch nicht offline bereit');
  if ($('#storage-info')) $('#storage-info').textContent = parts.join(', ');
}
async function saveSettings() { try { await putMeta('settings', state.settings); } catch (e) { toast('Einstellung nicht gespeichert.'); } }
function setSunPos() {
  if (!navigator.geolocation) { toast('Standort ist auf diesem Gerät nicht verfügbar.'); return; }
  toast('Standort wird bestimmt …');
  navigator.geolocation.getCurrentPosition(p => {
    state.settings.sunPos = { lat: Math.round(p.coords.latitude * 100) / 100, lon: Math.round(p.coords.longitude * 100) / 100 };
    saveSettings();
    toast('Ort für die Dämmerung gespeichert');
    renderView();
  }, () => toast('Standort nicht verfügbar. Erlaube den Zugriff in den Einstellungen des Handys.'), { timeout: 20000, maximumAge: 600000 });
}
function openSetupEditor(id) {
  const x = id ? setupById(id) : null;
  state.setupEdit = { orig: x ? x.id : null, err: '', d: x ? Object.assign({ rute: '', rolle: '', hauptschnur: '', vorfach: '' }, clone(x)) : { name: '', rute: '', rolle: '', hauptschnur: '', vorfach: '', aktiv: true } };
  renderView();
}
async function saveSetupEditor() {
  const E = state.setupEdit, d = E.d;
  if (!trim(d.name)) { E.err = 'Trag einen Namen ein.'; renderView(); return; }
  let id = E.orig;
  if (!id) {
    const base = slugify(d.name) || 'setup';
    id = base;
    for (let i = 2; setupById(id); i++) id = base + '-' + i;
  }
  const x = cleanSetup(Object.assign({}, d, { id }));
  const all = state.settings.setups || [];
  const idx = all.findIndex(s => s.id === id);
  state.settings.setups = idx >= 0 ? all.map(s => s.id === id ? x : s) : all.concat(x);
  await saveSettings();
  state.setupEdit = null;
  toast('Setup gespeichert');
  renderView();
}
async function deleteSetup() {
  const E = state.setupEdit;
  if (!E || !E.orig) return;
  state.settings.setups = (state.settings.setups || []).filter(s => s.id !== E.orig);
  await saveSettings();
  state.setupEdit = null;
  toast('Setup gelöscht. Gespeicherte Sessions behalten ihre Angaben.');
  renderView();
}

/* ---------- Detailansichten ---------- */
function kv(rows) {
  const r = rows.filter(([, v]) => v != null && v !== '' && !(Array.isArray(v) && !v.length));
  if (!r.length) return '';
  return '<dl class="kv">' + r.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(typeof v === 'string' ? v : fmtAny(v))}</dd>`).join('') + '</dl>';
}
const sec = (title, body) => body ? `<section><h3>${esc(title)}</h3>${body}</section>` : '';
const sheetHead = (title, sub) => `<div class="sheet-head"><div><h2 id="sheet-title">${title}</h2>${sub ? `<p class="smeta">${sub}</p>` : ''}</div><button class="btn ghost small" data-act="close">Schließen</button></div>`;
function list(items, fmt) {
  const arr = (Array.isArray(items) ? items : []).filter(x => x != null && x !== '');
  if (!arr.length) return '';
  return '<ul class="plain">' + arr.map(x => `<li>${fmt ? fmt(x) : esc(fmtAny(x))}</li>`).join('') + '</ul>';
}
function sessionSheet(s) {
  const d = parseDate(s.datum);
  const st = statsOf(s);
  const live = isLive(s);
  const Bo = s.beobachtungen || {};
  const sub = `${d ? esc(DF_LONG.format(d)) : esc(s.datum || '')}${s.beginn ? ', ' + esc(s.beginn) + (s.ende ? ' bis ' + esc(s.ende) : '') + ' Uhr' : ''}`;
  let h = sheetHead(esc(gwName(s)), sub) + '<div class="sheet-body">';
  const stat = live ? 'läuft' : isDone(s) ? 'übertragen am ' + DF_SHORT.format(new Date(s._uebertragenAm)) : 'nicht übertragen';
  h += `<p class="smeta" style="margin-top:10px">${esc([s.spot, s.angelart, s.zielfisch ? 'auf ' + s.zielfisch : '', stat].filter(Boolean).join(', '))}</p>`;
  h += timeline(s, { lg: true });
  h += `<p class="figures">${plural(st.bisse, 'Biss', 'Bisse')}, ${plural(st.faenge, 'Fang', 'Fänge')}${st.nach ? ', ' + plural(st.nach, 'Nachläufer', 'Nachläufer') : ''}${st.min ? ', ' + fmtDur(st.min) + ', ' + NF1.format(st.bisse / (st.min / 60)) + ' Bisse pro Stunde' : ''}</p>`;
  if (live) h += `<div class="row" style="margin-top:14px"><button class="btn" data-go="live">Zur laufenden Session</button></div>`;
  else if (!isDone(s)) h += `<div class="row" style="margin-top:14px"><button class="btn" data-act="edit" data-id="${esc(s.appId)}">Bearbeiten</button><button class="btn ghost" data-go="uebertragen">Übertragen</button></div>`;
  else h += '<p class="hint" style="margin-top:12px">Diese Session ist im Fangbuch und hier gesperrt. Änderungen machst du jetzt im Projekt „Angeln“.</p>';
  const evs = events(s).map(ev => ({ ev, m: evMin(ev, toMin(s.beginn)) })).sort((a, b) => (a.m ?? 0) - (b.m ?? 0));
  if (evs.length) {
    h += sec('Bisse und Fänge', '<ul class="evlist">' + evs.map(({ ev }) => {
      const det = [ev.art, lenText(ev),
        ev.typ === 'fang' && ev.entnommen === true ? 'entnommen' : ev.typ === 'fang' && ev.entnommen === false ? 'zurückgesetzt' : '',
        ev.koeder ? 'Köder: ' + ev.koeder : '', ev.spot && ev.spot !== s.spot ? 'Spot: ' + ev.spot : '',
        num(ev.tiefeM) != null ? 'Tiefe ' + NF1.format(num(ev.tiefeM)) + ' m' : '', ev.notiz,
        ev.koordinaten ? 'Position ' + ev.koordinaten.lat + ', ' + ev.koordinaten.lon : ''].filter(Boolean).join(', ');
      const id = bildId(ev.bild);
      return `<li><span class="t">${esc(ev.zeit || '')}</span><span><b class="ty ${TYP[ev.typ] ? ev.typ : ''}">${esc(TYP[ev.typ] || ev.typ || 'Ereignis')}</b>${det ? ' ' + esc(det) : ''}${id ? '<br>' + thumb(id) : ''}</span></li>`;
    }).join('') + '</ul>');
  }
  const ks = Array.isArray(s.koeder) ? s.koeder : [];
  if (ks.length) h += sec('Köder', '<ul class="evlist">' + ks.map(k => `<li><span class="t">${esc((k && k.zeit) || '')}</span><span>${esc(koederText(k))}${koederExtra(k) ? '<span class="smeta">, ' + esc(koederExtra(k)) + '</span>' : ''}</span></li>`).join('') + '</ul>');
  const su = s.setup || {};
  h += sec('Setup', kv([['Setup', su.setupId && setupById(su.setupId) ? setupById(su.setupId).name : su.setupId], ['Kombo', su.kombo], ['Hauptschnur', su.hauptschnur], ['Vorfach', su.vorfach]]));
  h += sec('Beobachtungen am Wasser', kv([['Wassertemperatur', Bo.wassertemp != null ? NF1.format(Bo.wassertemp) + ' °C' : null], ['Sichttiefe', Bo.sichttiefe != null ? NF1.format(Bo.sichttiefe) + ' cm' : null]]));
  h += sec('Eindruck', s.eindruck ? `<p>${esc(s.eindruck)}</p>` : '');
  h += sec('Beim nächsten Mal testen', s.naechstesMal ? `<p>${esc(s.naechstesMal)}</p>` : '');
  const ns = Array.isArray(s.notizen) ? s.notizen : [];
  if (ns.length) h += sec('Notizen vom Wasser', '<ul class="evlist">' + ns.map(n => `<li><span class="t">${esc((n && n.zeit) || '')}</span><span>${esc(n && n.text)}</span></li>`).join('') + '</ul>');
  if (s.koordinaten) h += sec('Position beim Start', `<p>${esc(s.koordinaten.lat)}, ${esc(s.koordinaten.lon)}</p>`);
  return h + `<p class="smeta" style="margin-top:22px">App-ID ${esc(s.appId)}</p></div>`;
}
function gwSheet(g) {
  const st = gwStats(g.slug);
  let h = sheetHead(esc(g.name || g.slug), esc([g.typ, g.lage].filter(Boolean).join(', '))) + '<div class="sheet-body">';
  if (isNewGw(g)) {
    h += `<p class="hint" style="margin-top:12px">In der App angelegt, noch nicht im Fangbuch.</p><div class="row"><button class="btn" data-act="gw-edit" data-id="${esc(g.slug)}">Bearbeiten</button>${st.n ? '' : `<button class="btn ghost" data-act="gw-del" data-id="${esc(g.slug)}">Löschen</button>`}</div>`;
  } else if ((g._neueSpots || []).length) {
    h += `<p class="hint" style="margin-top:12px">Neue Spots aus der App, noch nicht im Fangbuch: ${esc(g._neueSpots.join(', '))}.</p>`;
  }
  h += sec('Stammdaten', kv([['Kürzel', g.kuerzel], ['Typ', g.typ], ['Lage', g.lage], ['Erlaubnis', g.verein], ['Tide', g.tide], ['Angelart', g.angelart], ['Zielfische', g.zielfische], ['Fischarten', g.fischarten]]));
  if (g.beschreibung) h += sec('Beschreibung', `<p>${esc(fmtAny(g.beschreibung))}</p>`);
  h += sec('Regeln', list(g.regeln));
  const spots = (Array.isArray(g.spots) ? g.spots : []).filter(Boolean);
  if (spots.length) {
    h += sec('Spots', spots.map(sp => {
      const o = typeof sp === 'string' ? { name: sp } : sp;
      const det = [o.struktur ? 'Struktur: ' + fmtAny(o.struktur) : '', o.tiefe ? 'Tiefe: ' + fmtAny(o.tiefe) : '', o.grund ? 'Grund: ' + fmtAny(o.grund) : ''].filter(Boolean).join(', ');
      return `<div class="spot"><b>${esc(o.name || 'Spot')}</b>${o.beschreibung ? `<p class="smeta">${esc(fmtAny(o.beschreibung))}</p>` : ''}${det ? `<p class="smeta">${esc(det)}</p>` : ''}${o.notiz ? `<p class="smeta">${esc(fmtAny(o.notiz))}</p>` : ''}</div>`;
    }).join(''));
  }
  h += sec('Erkenntnisse', list(g.erkenntnisse, x => {
    if (typeof x !== 'object') return esc(fmtAny(x));
    const d = parseDate(x.stand);
    const meta = [num(x.sessions) != null ? plural(num(x.sessions), 'Session', 'Sessions') : '', d ? 'Stand ' + DF_SHORT.format(d) : ''].filter(Boolean).join(', ');
    return esc(x.text || fmtAny(x)) + (meta ? ` <span class="smeta">(${esc(meta)})</span>` : '');
  }));
  const vs = state.empfehlungen.filter(e => e.gewaesser === g.slug && isActiveV(e)).sort(vSort);
  h += sec('Offene Vorschläge', vs.length ? vs.map(vRow).join('') : '<p class="hint">Keine offenen Vorschläge importiert.</p>');
  h += sec('Offene Hypothesen', list(g.hypothesen));
  if (st.list.length) {
    h += sec('Sessions in der App', st.list.map(s => {
      const d = parseDate(s.datum);
      const x = statsOf(s);
      const res = x.faenge ? plural(x.faenge, 'Fang', 'Fänge') : x.bisse ? plural(x.bisse, 'Biss', 'Bisse') : (isLive(s) ? 'läuft' : 'Nullrunde');
      return `<div class="mini" role="button" tabindex="0" data-sid="${esc(s.appId)}"><span class="t">${d ? esc(DF_SHORT.format(d)) : ''}</span><span>${esc(s.spot || 'ohne Spot')}</span><span>${esc(res)}</span></div>`;
    }).join(''));
  }
  return h + '</div>';
}
function refreshSheet() {
  const o = state.open;
  if (!o) return;
  let html;
  if (o.kind === 'session') {
    const s = state.sessions.find(x => x.appId === o.id);
    html = s ? sessionSheet(s) : sheetHead('Nicht gefunden', '') + '<div class="sheet-body"><p>Diese Session gibt es nicht mehr.</p></div>';
  } else if (o.kind === 'bild') {
    html = sheetHead('Screenshot', '') + `<div class="sheet-body"><img class="bigimg" data-bild="${esc(o.id)}" alt="Screenshot"></div>`;
  } else {
    const g = state.gwMap[o.id];
    html = g ? gwSheet(g) : sheetHead('Nicht gefunden', '') + '<div class="sheet-body"><p>Dieses Gewässer gibt es nicht mehr.</p></div>';
  }
  const dlg = $('#sheet');
  const top = dlg.scrollTop;
  $('#sheet-inner').innerHTML = html;
  dlg.scrollTop = top;
  fillThumbs($('#sheet-inner'));
}
function openSheet(kind, id) {
  const switching = !state.open || state.open.kind !== kind || state.open.id !== id;
  state.open = { kind, id };
  refreshSheet();
  const dlg = $('#sheet');
  if (!dlg.open) { try { dlg.showModal(); } catch (e) { dlg.setAttribute('open', ''); } }
  if (switching) dlg.scrollTop = 0;
}

/* ---------- Rendering und Navigation ---------- */
function renderView() {
  const m = $('#main');
  if (state.failed) {
    m.innerHTML = '<div class="emptybox"><h2>Speicher nicht verfügbar</h2><p>Die App kann auf diesem Gerät keine Daten speichern. Im privaten Modus von Safari geht das nicht. Öffne die App vom Home-Bildschirm.</p></div>';
    return;
  }
  if (!state.ready) { m.innerHTML = '<p class="loading">Wird geladen …</p>'; return; }
  if (state.edit && state.edit.kind === 'session' && state.view === 'sessions') m.innerHTML = sessionEditor();
  else if (state.edit && state.edit.kind === 'gw' && state.view === 'gewaesser') m.innerHTML = gwEditor();
  else ({ sessions: renderSessions, gewaesser: renderGewaesser, uebertragen: renderUebertragen, daten: renderDaten, live: renderLive })[state.view]();
  fillThumbs(m);
}
function renderAll() {
  renderLede();
  renderNav();
  renderBanner();
  renderView();
  if (state.open && $('#sheet').open) refreshSheet();
}
function go(v) {
  if (!VIEWS.includes(v)) v = 'sessions';
  if (state.edit && !((state.edit.kind === 'session' && v === 'sessions') || (state.edit.kind === 'gw' && v === 'gewaesser'))) state.edit = null;
  else if (state.edit && v === state.view) state.edit = null;
  state.view = v;
  if (v !== 'daten') { state.importMsg = null; state.restore = null; state.setupEdit = null; }
  if (v !== 'uebertragen') state.exp = null;
  if ($('#sheet').open) $('#sheet').close();
  try { history.replaceState(null, '', '#' + v); } catch (e) { /* egal */ }
  renderAll();
  window.scrollTo(0, 0);
}
function defaultForm() {
  const F = state.form;
  if (F.gw === NEU && F.gwNeu) return;
  if (state.gwMap[F.gw]) return;
  const last = lsGet('fangbuch-gw');
  F.gw = last && state.gwMap[last] ? last : (state.gewaesser[0] ? state.gewaesser[0].slug : NEU);
  applyGwDefaults(F);
}

/* ---------- Ereignisse ---------- */
async function onPos(r, p) {
  if (!navigator.geolocation) { toast('Standort ist auf diesem Gerät nicht verfügbar.'); return; }
  toast('Position wird bestimmt …');
  const pos = await getPos(true);
  if (!pos) { toast('Keine Position. Erlaube den Standortzugriff in den Einstellungen des Handys.'); return; }
  evTargets(r, p).forEach(o => { o.koordinaten = pos; });
  toast('Position übernommen');
  afterEvTargetChange(r);
}
async function onBild(input) {
  const f = input.files && input.files[0];
  const r = input.dataset.bildR, p = input.dataset.bildP;
  input.value = '';
  if (!f) return;
  toast('Screenshot wird gespeichert …');
  let id;
  try { id = await storeImage(f); } catch (e) { toast('Das Bild konnte nicht gelesen werden.'); return; }
  evTargets(r, p).forEach(o => { o.bild = 'bild:' + id; });
  toast('Screenshot angehängt');
  afterEvTargetChange(r);
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-view],[data-go],[data-act],[data-sid],[data-gid]');
  if (!t) return;
  if (t.dataset.view) { go(t.dataset.view); return; }
  if (t.dataset.go) { go(t.dataset.go); return; }
  if (t.dataset.act) {
    const a = t.dataset.act;
    if (a === 'ev') addEvent(t.dataset.typ);
    else if (a === 'ev-save') saveEv();
    else if (a === 'ev-close') { state.evEdit = null; state.form.evd = null; renderView(); }
    else if (a === 'ev-open') { openEvEditor(+t.dataset.i); renderView(); const fe = $('#evedit'); if (fe) fe.scrollIntoView({ block: 'center' }); }
    else if (a === 'pos') onPos(t.dataset.r, t.dataset.p);
    else if (a === 'pos-del') { evTargets(t.dataset.r, t.dataset.p).forEach(o => { delete o.koordinaten; }); afterEvTargetChange(t.dataset.r); }
    else if (a === 'bild-del') { evTargets(t.dataset.r, t.dataset.p).forEach(o => { delete o.bild; }); afterEvTargetChange(t.dataset.r); }
    else if (a === 'bild-show') openSheet('bild', t.dataset.id);
    else if (a === 'undo') undo();
    else if (a === 'koeder') changeKoeder();
    else if (a === 'note') addNote();
    else if (a === 'end') { state.endConfirm = true; renderView(); }
    else if (a === 'end-no') { state.endConfirm = false; renderView(); }
    else if (a === 'end-yes') endLive();
    else if (a === 'close') $('#sheet').close();
    else if (a === 'new-session') { state.view = 'sessions'; openEditor(null); }
    else if (a === 'edit') { state.view = 'sessions'; openEditor(state.sessions.find(s => s.appId === t.dataset.id)); }
    else if (a === 'edit-save') saveEditor();
    else if (a === 'edit-cancel') { state.edit = null; state.delConfirm = false; renderAll(); window.scrollTo(0, 0); }
    else if (a === 'row-add') addRow(t.dataset.list);
    else if (a === 'row-del') delRow(t.dataset.list, +t.dataset.i);
    else if (a === 'del') { state.delConfirm = true; renderView(); }
    else if (a === 'del-no') { state.delConfirm = false; renderView(); }
    else if (a === 'del-yes') deleteSession(t.dataset.id);
    else if (a === 'new-gw') openGwEditor(null);
    else if (a === 'gw-edit') openGwEditor(state.gwMap[t.dataset.id]);
    else if (a === 'gw-save') saveGwEditor();
    else if (a === 'gw-del') deleteGw(t.dataset.id);
    else if (a === 'exp-build') { buildExport().then(x => { state.exp = x; renderView(); }).catch(() => toast('Export fehlgeschlagen.')); }
    else if (a === 'exp-share') shareExport(false);
    else if (a === 'exp-file') shareExport(true);
    else if (a === 'exp-copy') copyExport();
    else if (a === 'pending-yes') confirmPending(true);
    else if (a === 'pending-no') confirmPending(false);
    else if (a === 'imp-text') importData(state.importText);
    else if (a === 'backup') backup().catch(() => toast('Sicherung fehlgeschlagen.'));
    else if (a === 'restore-yes') doRestore();
    else if (a === 'restore-no') { state.restore = null; renderView(); }
    else if (a === 'sunpos') setSunPos();
    else if (a === 'setup-new') openSetupEditor(null);
    else if (a === 'setup-edit') openSetupEditor(t.dataset.id);
    else if (a === 'setup-save') saveSetupEditor();
    else if (a === 'setup-cancel') { state.setupEdit = null; renderView(); }
    else if (a === 'setup-del') deleteSetup();
    else if (a === 'list-add') {
      const k = t.dataset.key, v = trim(state.listAdd[k]);
      if (v) { addCustom(k, v); state.listAdd[k] = ''; renderView(); }
    }
    else if (a === 'list-del') { const k = t.dataset.key; state.settings[k] = (state.settings[k] || []).filter(x => x !== t.dataset.v); saveSettings(); renderView(); }
    else if (a === 'sw-update') { if (state.swWaiting) state.swWaiting.postMessage('skipWaiting'); }
    return;
  }
  if (t.dataset.sid) { openSheet('session', t.dataset.sid); return; }
  if (t.dataset.gid) openSheet('gw', t.dataset.gid);
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[role="button"]')) { e.preventDefault(); e.target.click(); }
});
function bindValue(el) {
  const root = rootOf(el.dataset.r);
  if (!root || !el.dataset.b) return null;
  setPath(root, el.dataset.b, el.type === 'checkbox' ? el.checked : el.value);
  return root;
}
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset && el.dataset.b && el.tagName !== 'SELECT' && el.type !== 'checkbox') {
    const root = bindValue(el);
    if (root && el.dataset.manualk) { const ev = getPath(root, el.dataset.b.replace(/\.koeder$/, '')); if (ev) ev._autoK = false; }
    return;
  }
  if (el.id === 'imp-text') state.importText = el.value;
  if (el.id && el.id.startsWith('add-')) state.listAdd[el.id.slice(4)] = el.value;
});
document.addEventListener('change', async e => {
  const el = e.target;
  if (el.dataset && el.dataset.bildR) { onBild(el); return; }
  if (el.dataset && el.dataset.b) {
    const root = bindValue(el);
    if (!root) return;
    const b = el.dataset.b;
    let rerender = !!el.dataset.rerender;
    if (b === 'gw') applyGwDefaults(root);
    if (b === 'setup') applySetupDefaults(root);
    if (el.dataset.prefill && prefillKoeder(getPath(root, b.replace(/\.label$/, '')))) { toast('Angaben vom letzten Einsatz übernommen'); rerender = true; }
    if (rerender) renderView();
    return;
  }
  if (el.id === 'f-open') { state.f.sOnlyOpen = el.checked; renderView(); }
  else if (el.id === 'set-gps') {
    state.settings.gps = el.checked;
    await saveSettings();
    if (el.checked && navigator.geolocation) navigator.geolocation.getCurrentPosition(() => {}, () => toast('Ohne Erlaubnis für den Standort speichert die App keine Position.'), { timeout: 15000 });
    toast(el.checked ? 'GPS an' : 'GPS aus');
  }
  else if (el.id === 'imp-file') { const t = await readFile(el); if (t != null) importData(t); }
  else if (el.id === 'restore-file') { const t = await readFile(el); if (t != null) prepareRestore(t); }
});
document.addEventListener('submit', e => { if (e.target.id === 'startform') { e.preventDefault(); startLive(); } });
document.addEventListener('toggle', e => {
  const t = e.target;
  if (!t) return;
  if (t.id === 'livetips') state.tipsOpen = t.open;
  if (t.dataset && t.dataset.det) { if (t.open) state.openDet.add(t.dataset.det); else state.openDet.delete(t.dataset.det); }
}, true);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') { updateElapsed(); wakeOn(); renderNav(); }
});
const dlg = $('#sheet');
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
dlg.addEventListener('close', () => { state.open = null; });

/* ---------- Service Worker ---------- */
function setupSw() {
  if (!('serviceWorker' in navigator)) return;
  if (!(location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) return;
  let reloading = false;
  const hadController = !!navigator.serviceWorker.controller;
  // Nur nach einem Update neu laden, nicht beim allerersten Installieren.
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloading || !hadController) return; reloading = true; location.reload(); });
  navigator.serviceWorker.register('sw.js').then(reg => {
    const watch = w => {
      if (!w) return;
      w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) { state.swWaiting = w; renderBanner(); } });
    };
    if (reg.waiting && navigator.serviceWorker.controller) { state.swWaiting = reg.waiting; renderBanner(); }
    watch(reg.installing);
    reg.addEventListener('updatefound', () => watch(reg.installing));
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
  }).catch(() => {});
}

/* ---------- Start ---------- */
async function loadAll() {
  const [ss, gs, es, ms] = await Promise.all([getAll('sessions'), getAll('gewaesser'), getAll('empfehlungen'), getAll('meta')]);
  state.sessions = ss; sortSessions();
  state.gewaesser = []; state.gwMap = {};
  gs.forEach(addGwLocal);
  state.empfehlungen = es;
  const meta = Object.fromEntries(ms.map(m => [m.key, m.value]));
  state.settings = Object.assign(defaultSettings(), meta.settings || {});
  state.pending = meta.pendingExport || null;
  state.lastBackup = meta.lastBackup || null;
  state.form = emptyForm();
  const lives = state.sessions.filter(isLive).sort((a, b) => String(b.erstellt).localeCompare(String(a.erstellt)));
  if (lives[0]) resume(lives[0]);
  defaultForm();
}
async function init() {
  state.form = emptyForm();
  const h = (location.hash || '').slice(1);
  state.view = VIEWS.includes(h) ? h : 'sessions';
  renderAll();
  setupSw();
  try { idb = await openDb(); await loadAll(); state.ready = true; }
  catch (e) { state.failed = true; renderAll(); return; }
  if (state.live && state.view !== 'live') { state.view = 'live'; try { history.replaceState(null, '', '#live'); } catch (e) { /* egal */ } }
  renderAll();
  gcBilder();
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { /* egal */ }
}
init();
})();
