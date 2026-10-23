// Datenmodell der Sessions und der Austausch mit dem Fangbuch im Projekt „Angeln“.
// Export (fangbuch-app-export, schemaVersion 4), Import und Sicherung (fangbuch-app-backup, Version 2)
// sind aus der bisherigen App übernommen und bleiben dazu kompatibel.
import { getAll, getOne, put, tx, STORES } from './db';
import { clone, initials, isoDate, normTime, num, parseJsonLoose, slugify, spanOfTimes, toMin, trim, uniq } from './util';

export const SCHEMA_VERSION = 4;
export const EXPORT_INTRO = 'Übernimm diese Sessions aus der Fangbuch-App ins Fangbuch:';
export const TYP: Record<string, string> = { fang: 'Fang', fehlbiss: 'Fehlbiss', aussteiger: 'Aussteiger', nachlaeufer: 'Nachläufer' };
export const BISS = ['fang', 'fehlbiss', 'aussteiger'];
export const ZIELFISCHE = ['Barsch', 'Hecht', 'Zander', 'Meerforelle', 'Bachforelle'];
export const ARTEN = ['Barsch', 'Hecht', 'Zander', 'Meerforelle', 'Bachforelle', 'Rotauge', 'Brasse'];
export const KOEDERTYP = ['Gummifisch', 'Swimbait', 'Wobbler', 'Jerkbait', 'Glidebait', 'Spinner', 'Blinker', 'Spinnerbait', 'Dropshot', 'Creature'];
export const FUEHRUNG = ['monoton eingekurbelt', 'Faulenzen', 'Jiggen', 'Twitchen', 'Stop and Go'];
export const SCHICHT = ['grundnah', 'Mittelwasser', 'oberflächennah'];
export const MONTAGE = ['Jigkopf', 'Swimbait-Haken mit Bauchblei', 'Offset-/Texas-Rig', 'Cheburashka', 'Dropshot', 'Carolina-Rig', 'Drillinge am Köder (Hardbait)'];
export const AUSTRITT = ['vorderes Drittel', 'Körpermitte', 'hinteres Drittel'];
export const SPITZE = ['frei', 'verdeckt'];
export const STINGERPOS = ['hinteres Drittel Bauch', 'hinteres Drittel Rücken', 'Schwanzwurzel'];
export const GWTYP = ['Talsperre', 'Hafenbecken', 'Fluss', 'Bach', 'See', 'Kanal'];
export const KAT: Record<string, string> = { koeder: 'Köder', technik: 'Technik', montage: 'Montage', spot: 'Spot', zeitfenster: 'Zeitfenster', allgemein: 'Allgemein' };
export const STATUS: Record<string, string> = { offen: 'Noch nicht getestet', im_test: 'Im Test', bestaetigt: 'Bestätigt', verworfen: 'Verworfen' };
export const BED: Record<string, string> = { saison: 'Jahreszeit', monate: 'Monate', wassertemp: 'Wassertemperatur', licht: 'Licht', tageszeit: 'Tageszeit', wind: 'Wind', luftdruck: 'Luftdruck', wasserstand: 'Wasserstand', truebung: 'Trübung', tide: 'Tide', spot: 'Spot', tiefe: 'Tiefe' };
export const STALE_DAYS = 7;
export const defaultSettings = () => ({ gps: false, sunPos: null as null | { lat: number; lon: number }, typen: [] as string[], montagen: [] as string[], setups: [] as any[], lastSetup: {} as Record<string, string> });

/* ---------- Sessions ---------- */
export const events = (s: any): any[] => (Array.isArray(s.ereignisse) ? s.ereignisse.filter((e: any) => e && typeof e === 'object') : []);
export const isLive = (s: any) => s.live === true && !s.ende;
export const isDone = (s: any) => !!s._uebertragenAm;
export const isNewGw = (g: any) => g._quelle === 'app' && !g._uebertragenAm;

export function spanOf(s: any, nowFallback?: boolean) { return spanOfTimes(s.beginn, s.ende, nowFallback); }
export function evMin(ev: any, b: number | null) {
  let m = toMin(ev && ev.zeit);
  if (m == null) return null;
  if (b != null && m < b - 90) m += 1440;
  return m;
}
export function statsOf(s: any) {
  const ev = events(s);
  const bisse = ev.filter((e) => BISS.includes(e.typ)).length;
  const faenge = ev.filter((e) => e.typ === 'fang').length;
  const nach = ev.filter((e) => e.typ === 'nachlaeufer').length;
  let min = num(s.angelzeitMin);
  if (min == null || isLive(s)) { const sp = spanOf(s, isLive(s)); if (sp && sp.e != null) min = sp.e - sp.b; }
  return { bisse, faenge, nach, min };
}
export function kennzahlen(s: any) {
  const st = statsOf(s);
  const h = st.min ? st.min / 60 : 0;
  return {
    bisse: st.bisse, faenge: st.faenge, nachlaeufer: st.nach,
    bisseProStunde: h ? Math.round((st.bisse / h) * 100) / 100 : 0,
    faengeProStunde: h ? Math.round((st.faenge / h) * 100) / 100 : 0,
  };
}
export function finalize(s: any) {
  const sp = spanOf(s);
  s.angelzeitMin = sp && sp.e != null ? Math.max(1, sp.e - sp.b) : null;
  s.kennzahlen = kennzahlen(s);
  s.aktualisiert = new Date().toISOString();
}
export const spotNames = (g: any): string[] => (g && Array.isArray(g.spots) ? g.spots.map((x: any) => x && (typeof x === 'string' ? x : x.name)).filter(Boolean) : []);
export const spotObj = (sp: any) => (typeof sp === 'string' ? { name: sp } : sp || {});

/* ---------- Köder ---------- */
export function koederText(k: any) {
  if (!k || typeof k !== 'object') return String(k ?? '');
  const lab = k.label ? String(k.label) : '';
  const det = [k.typ, k.modell, k.farbe, num(k.groesseCm) != null ? num(k.groesseCm) + ' cm' : '', num(k.gewichtG) != null ? num(k.gewichtG) + ' g' : '']
    .filter(Boolean).map(String).filter((p) => !lab || !lab.toLowerCase().includes(p.toLowerCase())).join(', ');
  if (lab && det) return lab + ' (' + det + ')';
  return lab || det || '';
}
export function montageText(m: any) {
  if (!m || typeof m !== 'object') return '';
  const st = [m.stingerArt, m.stingerPosition].filter(Boolean).join(', ');
  return [m.art, num(m.bleiG) != null ? num(m.bleiG) + ' g' : '', m.haken, m.hakenAustritt ? 'Austritt ' + m.hakenAustritt : '', m.hakenspitze ? 'Spitze ' + m.hakenspitze : '', m.stinger ? 'Stinger' + (st ? ' ' + st : '') : '', m.notiz].filter(Boolean).join(', ');
}
export function koederExtra(k: any) {
  return [k.fuehrung ? 'Führung: ' + k.fuehrung : '', k.schicht ? 'Schicht: ' + k.schicht : '', num(k.jigkopfG) != null ? 'Jigkopf ' + num(k.jigkopfG) + ' g' : '', montageText(k.montage) ? 'Montage: ' + montageText(k.montage) : ''].filter(Boolean).join('; ');
}
export const currentKoeder = (s: any) => { const k = Array.isArray(s.koeder) ? s.koeder : []; const last = k[k.length - 1]; return (last && (last.label || koederText(last))) || ''; };

// Entwurf eines Köders: alles als Text, damit Formulare direkt darauf schreiben können.
export function kDraft(k?: any) {
  k = k ? clone(k) : {};
  const m = k.montage && typeof k.montage === 'object' ? k.montage : {};
  return {
    zeit: k.zeit || '', label: k.label || '', typ: k.typ || '', modell: k.modell || '', farbe: k.farbe || '',
    groesseCm: k.groesseCm != null ? String(k.groesseCm) : '', gewichtG: k.gewichtG != null ? String(k.gewichtG) : '',
    fuehrung: k.fuehrung || '', schicht: k.schicht || '', jigkopfG: k.jigkopfG,
    montage: { art: m.art || '', bleiG: m.bleiG != null ? String(m.bleiG) : '', haken: m.haken || '', hakenAustritt: m.hakenAustritt || '', hakenspitze: m.hakenspitze || '', stinger: !!m.stinger, stingerArt: m.stingerArt || '', stingerPosition: m.stingerPosition || '', notiz: m.notiz || '' },
    _ts: k._ts,
  };
}
export function kClean(d: any) {
  const o: any = {};
  if (toMin(d.zeit) != null) o.zeit = normTime(d.zeit);
  const set = (k: string, v: any) => { if (v !== '' && v != null) o[k] = v; };
  set('label', trim(d.label)); set('typ', trim(d.typ)); set('modell', trim(d.modell)); set('farbe', trim(d.farbe));
  set('groesseCm', num(d.groesseCm)); set('gewichtG', num(d.gewichtG));
  if (d.jigkopfG != null) set('jigkopfG', num(d.jigkopfG));
  set('fuehrung', trim(d.fuehrung)); set('schicht', trim(d.schicht));
  const m = d.montage || {}, mo: any = {};
  const mset = (k: string, v: any) => { if (v !== '' && v != null) mo[k] = v; };
  mset('art', trim(m.art)); mset('bleiG', num(m.bleiG)); mset('haken', trim(m.haken)); mset('hakenAustritt', trim(m.hakenAustritt)); mset('hakenspitze', trim(m.hakenspitze));
  if (m.stinger) { mo.stinger = true; mset('stingerArt', trim(m.stingerArt)); mset('stingerPosition', trim(m.stingerPosition)); }
  mset('notiz', trim(m.notiz));
  if (Object.keys(mo).length) { if (!mo.stinger) mo.stinger = false; o.montage = mo; }
  if (!o.label) o.label = o.modell || o.typ || '';
  if (!o.label) delete o.label;
  if (d._ts) o._ts = d._ts;
  return o;
}
export const kHasContent = (k: any) => !!(k.label || k.typ || k.modell);
export function lastKoeder(sessions: any[], label: string) {
  const key = trim(label).toLowerCase();
  if (!key) return null;
  let best: any = null, bestKey = '';
  sessions.forEach((s) => (s.koeder || []).forEach((k: any) => {
    if (!k || trim(k.label).toLowerCase() !== key) return;
    const sk = `${s.datum || ''} ${normTime(k.zeit) || s.beginn || ''}`;
    if (!best || sk >= bestKey) { best = k; bestKey = sk; }
  }));
  return best;
}
export function knownLabels(sessions: any[]) {
  const all: string[] = [];
  sessions.forEach((s) => (s.koeder || []).forEach((k: any) => { if (k && k.label) all.push(k.label); }));
  return uniq(all).sort((a, b) => a.localeCompare(b, 'de'));
}
// Köder, der zu einer Uhrzeit im Wasser war (letzter Wechsel vor oder zu dieser Zeit).
export function koederAt(koeder: any[], beginn: string, zeit: string) {
  const b = toMin(beginn);
  const ks = koeder.map((k) => ({ label: trim(k.label) || trim(k.modell) || trim(k.typ), m: evMin(k, b) })).filter((x) => x.label && x.m != null).sort((a, c) => a.m! - c.m!);
  if (!ks.length) return '';
  const t = evMin({ zeit }, b);
  if (t == null) return ks[ks.length - 1].label;
  let cur = ks[0].label;
  ks.forEach((x) => { if (x.m! <= t) cur = x.label; });
  return cur;
}

/* ---------- Gewässer ---------- */
export function newGwDoc(name: string, extra?: any) {
  const ts = new Date().toISOString();
  return Object.assign({ slug: slugify(name), name, kuerzel: initials(name), tide: 'prüfen', zielfische: [], fischarten: [], spots: [], regeln: [], erkenntnisse: [], hypothesen: [], referenzen: [], erstellt: ts, aktualisiert: ts, _quelle: 'app', _uebertragenAm: null }, extra || {});
}

/* ---------- Setups ---------- */
export function setupSnapshot(su: any, vorfach: string) {
  const o: any = {};
  if (su) {
    o.setupId = su.id;
    const kombo = [su.rute, su.rolle].map(trim).filter(Boolean).join(' + ');
    if (kombo) o.kombo = kombo;
    if (trim(su.hauptschnur)) o.hauptschnur = trim(su.hauptschnur);
  }
  if (trim(vorfach)) o.vorfach = trim(vorfach);
  return Object.keys(o).length ? o : null;
}
export function cleanSetup(x: any) {
  const o: any = { id: x.id, name: trim(x.name) || x.id };
  ['rute', 'rolle', 'hauptschnur', 'vorfach'].forEach((k) => { const v = trim(x[k]); if (v) o[k] = v; });
  o.aktiv = x.aktiv !== false;
  return o;
}

/* ---------- Vorschläge ---------- */
const VST_ORDER = ['im_test', 'offen', 'bestaetigt', 'verworfen'];
const TRUST: Record<string, number> = { hoch: 3, mittel: 2, niedrig: 1 };
export const trustN = (v: any) => TRUST[String(v || '').toLowerCase()] || 0;
export const vStatus = (e: any) => (STATUS[e.status] ? e.status : 'offen');
export const isActiveV = (e: any) => vStatus(e) === 'offen' || vStatus(e) === 'im_test';
export function vSort(a: any, b: any) {
  return VST_ORDER.indexOf(vStatus(a)) - VST_ORDER.indexOf(vStatus(b)) || trustN(b.vertrauen) - trustN(a.vertrauen) || String(b.aktualisiert || '').localeCompare(String(a.aktualisiert || ''));
}

/* ---------- Export ins Fangbuch ---------- */
const SESSION_ORDER = ['id', 'status', 'live', 'quelle', 'datum', 'beginn', 'ende', 'angelzeitMin', 'gewaesser', 'gewaesserName', 'spot', 'angelart', 'zielfisch', 'setup', 'koeder', 'ereignisse', 'beobachtungen', 'umwelt', 'kennzahlen', 'notizen', 'eindruck', 'naechstesMal', 'offeneFragen', 'erstellt', 'aktualisiert', 'getesteteEmpfehlungen', 'appId', 'koordinaten'];
const SETUP_ORDER = ['setupId', 'kombo', 'hauptschnur', 'vorfach'];
const KOEDER_ORDER = ['zeit', 'label', 'typ', 'modell', 'farbe', 'groesseCm', 'gewichtG', 'jigkopfG', 'fuehrung', 'schicht'];
const MONTAGE_ORDER = ['art', 'bleiG', 'haken', 'hakenAustritt', 'hakenspitze', 'stinger', 'stingerArt', 'stingerPosition', 'notiz'];
const EVENT_ORDER = ['zeit', 'typ', 'koeder', 'spot', 'tiefeM', 'art', 'laengeCm', 'gewichtG', 'entnommen', 'notiz', 'koordinaten', 'bild'];
const GW_ORDER = ['name', 'kuerzel', 'typ', 'lage', 'verein', 'tide', 'angelart', 'zielfische', 'fischarten', 'beschreibung', 'regeln', 'spots', 'erkenntnisse', 'hypothesen', 'referenzen', 'aktualisiert'];
const SPOT_ORDER = ['name', 'beschreibung', 'struktur', 'tiefe', 'grund', 'notiz'];
const empty = (v: any) => v == null || v === '' || (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length);
function pick(obj: any, order: string[], keepEmpty?: string[]) {
  const o: any = {};
  order.forEach((k) => {
    let v = obj[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) v = Object.fromEntries(Object.entries(v).filter(([kk, x]) => !kk.startsWith('_') && !empty(x)));
    if (keepEmpty && keepEmpty.includes(k) && v != null) { o[k] = v; return; }
    if (!empty(v)) o[k] = v;
  });
  return o;
}
export const bildId = (ref: any) => (typeof ref === 'string' && ref.startsWith('bild:') ? ref.slice(5) : null);
function exportKoeder(k: any) {
  const o = pick(k, KOEDER_ORDER);
  if (k.montage && typeof k.montage === 'object') {
    const m = pick(k.montage, MONTAGE_ORDER);
    if (Object.keys(m).some((x) => x !== 'stinger') || m.stinger) o.montage = m;
  }
  return o;
}
function exportSession(s: any, withBild: boolean) {
  const x = clone(s);
  x.id = ''; x.status = 'entwurf'; x.live = false; x.quelle = 'app';
  const sp = spanOf(x);
  x.angelzeitMin = sp && sp.e != null ? Math.max(1, sp.e - sp.b) : undefined;
  x.kennzahlen = kennzahlen(x);
  if (x.setup) x.setup = pick(x.setup, SETUP_ORDER);
  x.koeder = (x.koeder || []).map(exportKoeder);
  x.ereignisse = (x.ereignisse || []).map((e: any) => { const o = pick(e, EVENT_ORDER, ['entnommen']); if (!withBild || !bildId(o.bild)) delete o.bild; return o; });
  x.notizen = (x.notizen || []).map((n: any) => pick(n, ['zeit', 'text']));
  return pick(x, SESSION_ORDER, ['id', 'live', 'koeder', 'ereignisse', 'notizen']);
}
function exportGw(g: any) {
  const x = clone(g);
  x.spots = (x.spots || []).map((sp: any) => (typeof sp === 'string' ? { name: sp } : pick(sp, SPOT_ORDER)));
  return pick(x, GW_ORDER, ['zielfische', 'fischarten', 'regeln', 'spots', 'erkenntnisse', 'hypothesen', 'referenzen']);
}
function exportSpotsOnly(g: any) {
  const names = g._neueSpots || [];
  const spots = (g.spots || []).filter((sp: any) => names.includes(typeof sp === 'string' ? sp : sp && sp.name)).map((sp: any) => (typeof sp === 'string' ? { name: sp } : pick(sp, SPOT_ORDER)));
  return pick({ name: g.name, kuerzel: g.kuerzel, spots }, ['name', 'kuerzel', 'spots']);
}
export async function buildExport(sessions: any[], openGw: any[], spotGw: any[], bildData: (id: string) => Promise<string | null>) {
  sessions = sessions.slice().sort((a, b) => String(a.datum).localeCompare(String(b.datum)) || String(a.beginn).localeCompare(String(b.beginn)));
  const gewaesser = Object.fromEntries(openGw.map((g) => [g.slug, exportGw(g)]).concat(spotGw.map((g) => [g.slug, exportSpotsOnly(g)])));
  const base = { format: 'fangbuch-app-export', schemaVersion: SCHEMA_VERSION, exportiert: new Date().toISOString() };
  const textPayload = Object.assign({}, base, { sessions: sessions.map((s) => exportSession(s, false)), gewaesser });
  const filePayload: any = Object.assign({}, base, { sessions: sessions.map((s) => exportSession(s, true)), gewaesser });
  const ids: string[] = [];
  filePayload.sessions.forEach((s: any) => s.ereignisse.forEach((e: any) => { const id = bildId(e.bild); if (id) ids.push(id); }));
  if (ids.length) {
    filePayload.bilder = {};
    for (const id of ids) {
      const d = await bildData(id);
      if (d) filePayload.bilder[id] = d;
      else filePayload.sessions.forEach((s: any) => s.ereignisse.forEach((e: any) => { if (e.bild === 'bild:' + id) delete e.bild; }));
    }
    if (!Object.keys(filePayload.bilder).length) delete filePayload.bilder;
  }
  const json = JSON.stringify(textPayload, null, 1);
  return {
    json, text: EXPORT_INTRO + '\n\n' + json, fileJson: JSON.stringify(filePayload, null, 1), bilder: Object.keys(filePayload.bilder || {}).length,
    sessions: sessions.map((s) => ({ appId: s.appId, aktualisiert: s.aktualisiert })),
    gewaesser: (openGw.map((g) => ({ slug: g.slug, aktualisiert: g.aktualisiert })) as any[]).concat(spotGw.map((g) => ({ slug: g.slug, neueSpots: (g._neueSpots || []).slice() }))),
  };
}

/* ---------- Import aus dem Fangbuch ---------- */
function asMap(v: any, keyField: string) {
  if (!v) return {};
  if (Array.isArray(v)) {
    const m: any = {};
    v.forEach((x) => { if (x && typeof x === 'object') { const k = x[keyField] || x.slug || x.id || x._id; if (k) m[k] = x; } });
    return m;
  }
  return typeof v === 'object' ? v : {};
}
// Angaben aus dem Import gewinnen, in der App angelegte Spots bleiben erhalten und gehen beim nächsten Übertragen mit.
function mergeGw(local: any, incoming: any, slug: string, now: string) {
  const base = local ? Object.fromEntries(Object.entries(local).filter(([k]) => !k.startsWith('_'))) : {};
  const g: any = Object.assign(base, incoming, { slug, _quelle: 'import', _importiertAm: now, _uebertragenAm: null });
  delete g._id;
  if (!g.name) g.name = slug;
  if (local && Array.isArray(incoming.spots)) {
    const inNames = new Set(spotNames(incoming));
    const extra = (local.spots || []).filter((sp: any) => { const n = typeof sp === 'string' ? sp : sp && sp.name; return n && !inNames.has(n); });
    g.spots = incoming.spots.concat(extra);
    const wasNew = isNewGw(local);
    g._neueSpots = extra.map((sp: any) => (typeof sp === 'string' ? sp : sp.name)).filter((n: string) => wasNew || (local._neueSpots || []).includes(n));
  } else if (local) {
    g._neueSpots = isNewGw(local) ? spotNames(local) : local._neueSpots || [];
  }
  return g;
}
export type ImportResult = { err: boolean; text: string; gDocs?: any[]; eDocs?: any[]; setups?: any[] };
export async function importData(text: string, gwMap: Record<string, any>): Promise<ImportResult> {
  let data: any;
  try { data = parseJsonLoose(text); }
  catch { return { err: true, text: 'Das ist kein gültiges JSON. Kopier den Export aus dem Projekt „Angeln“ vollständig, von der ersten bis zur letzten geschweiften Klammer.' }; }
  if (data && data.format === 'fangbuch-app-backup') return { err: true, text: 'Das ist eine Datensicherung der App. Nutze dafür „Wiederherstellen“.' };
  if (data && data.format === 'fangbuch-app-export') return { err: true, text: 'Das ist ein Export aus dieser App. Der gehört ins Projekt „Angeln“, nicht hierher.' };
  const gws = asMap(data && data.gewaesser, 'slug');
  const emps = asMap(data && data.empfehlungen, 'id');
  const setups = Array.isArray(data && data.setups) ? data.setups.filter((x: any) => x && typeof x === 'object' && (x.id || x.name)) : [];
  const gKeys = Object.keys(gws).filter((k) => gws[k] && typeof gws[k] === 'object');
  const eKeys = Object.keys(emps).filter((k) => emps[k] && typeof emps[k] === 'object');
  if (!gKeys.length && !eKeys.length && !setups.length) return { err: true, text: 'Keine Gewässer, Vorschläge oder Setups gefunden. Erwartet wird {"gewaesser": {...}, "empfehlungen": {...}}.' };
  const now = new Date().toISOString();
  const gDocs = gKeys.map((k) => { const slug = slugify(k) || k; return mergeGw(gwMap[slug], gws[k], slug, now); });
  const eDocs = eKeys.map((k) => { const e = Object.assign({}, emps[k], { id: k, _importiertAm: now }); delete e._id; return e; });
  try {
    await tx(['gewaesser', 'empfehlungen'], 'readwrite', (t) => {
      gDocs.forEach((g) => t.objectStore('gewaesser').put(g));
      eDocs.forEach((e) => t.objectStore('empfehlungen').put(e));
    });
  } catch { return { err: true, text: 'Speichern fehlgeschlagen. Versuch es erneut.' }; }
  const open = eDocs.filter(isActiveV).length;
  const n = (c: number, one: string, many: string) => `${c} ${c === 1 ? one : many}`;
  const parts = [gDocs.length ? n(gDocs.length, 'Gewässer', 'Gewässer') : '', eDocs.length ? n(eDocs.length, 'Vorschlag', 'Vorschläge') + ', davon ' + open + ' offen oder im Test' : '', setups.length ? n(setups.length, 'Setup', 'Setups') : ''].filter(Boolean);
  return { err: false, text: `Übernommen: ${parts.join(', ')}. Alles steht jetzt auch offline bereit.`, gDocs, eDocs, setups };
}

/* ---------- Datensicherung ---------- */
// Lizenzfotos bleiben nur auf diesem Handy und kommen nicht in die Sicherungsdatei.
const isLicensePhoto = (id: string) => id.startsWith('slot:lic-') || id.startsWith('slot:photo-lic-');
export async function buildBackup() {
  const data = {
    format: 'fangbuch-app-backup', version: 2, erstellt: new Date().toISOString(),
    sessions: await getAll('sessions'), gewaesser: await getAll('gewaesser'), empfehlungen: await getAll('empfehlungen'),
    meta: (await getAll('meta')).filter((m) => m.key !== 'lastBackup'), bilder: (await getAll('bilder')).filter((b) => !isLicensePhoto(b.id)),
  };
  return data;
}
export function checkBackup(text: string) {
  let data: any;
  try { data = JSON.parse(String(text).replace(/^﻿/, '')); } catch { return null; }
  return data && data.format === 'fangbuch-app-backup' && Array.isArray(data.sessions) ? data : null;
}
export async function restoreBackup(d: any) {
  const okArr = (arr: any, key: string) => (Array.isArray(arr) ? arr : []).filter((x) => x && typeof x === 'object' && x[key]);
  // Lizenzfotos sind nie in der Sicherung, deshalb bleiben die vorhandenen erhalten.
  const keepLic = (await getAll('bilder')).filter((b) => isLicensePhoto(b.id));
  await tx(Object.keys(STORES), 'readwrite', (t) => {
    Object.keys(STORES).forEach((n) => t.objectStore(n).clear());
    okArr(d.sessions, 'appId').forEach((x) => t.objectStore('sessions').put(x));
    okArr(d.gewaesser, 'slug').forEach((x) => t.objectStore('gewaesser').put(x));
    okArr(d.empfehlungen, 'id').forEach((x) => t.objectStore('empfehlungen').put(x));
    okArr(d.meta, 'key').forEach((x) => t.objectStore('meta').put(x));
    okArr(d.bilder, 'id').concat(keepLic).forEach((x) => t.objectStore('bilder').put(x));
    if (d.erstellt) t.objectStore('meta').put({ key: 'lastBackup', value: d.erstellt });
  });
}

/* ---------- Bilder ---------- */
const BILD_MAX = 1280;
async function resize(file: Blob, max: number, q: number) {
  let src: any;
  try { src = await createImageBitmap(file, { imageOrientation: 'from-image' } as any); }
  catch {
    src = await new Promise<HTMLImageElement>((res, rej) => { const url = URL.createObjectURL(file); const img = new Image(); img.onload = () => { URL.revokeObjectURL(url); res(img); }; img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Bild')); }; img.src = url; });
  }
  const w = src.width, h = src.height;
  const sc = Math.min(1, max / Math.max(w, h));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w * sc)); c.height = Math.max(1, Math.round(h * sc));
  c.getContext('2d')!.drawImage(src, 0, 0, c.width, c.height);
  if (src.close) src.close();
  return c.toDataURL('image/jpeg', q);
}
const bildCache = new Map<string, string>();
// Screenshots zu Ereignissen: wie bisher als „bild:<uuid>“ referenziert.
export async function storeImage(file: Blob, id: string, max = BILD_MAX, q = 0.7) {
  const data = await resize(file, max, q);
  await put('bilder', { id, data, erstellt: new Date().toISOString() });
  bildCache.set(id, data);
  return id;
}
export async function bildData(id: string): Promise<string | null> {
  if (bildCache.has(id)) return bildCache.get(id)!;
  const r = await getOne('bilder', id).catch(() => null);
  const d = r && r.data;
  if (d) bildCache.set(id, d);
  return d || null;
}
export function forgetBild(id: string) { bildCache.delete(id); }
export function clearBildCache() { bildCache.clear(); }
export { isoDate };
