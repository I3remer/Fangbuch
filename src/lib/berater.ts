// Der Ratgeber: Methoden-Index, Farbberater, „Bewährt“ und „Heute testen“, Box-Empfehlung, Wissensstand.
// Grundlage sind Faustregeln aus dem Fachwissen, die mit jeder eigenen Session stärker von deinen Daten abgelöst werden.
import { BASE, DET, FAM, FSHORT, METHODS, MN, SHORT, clamp, famGuess, methodGuess, pick as pickF } from './fachwissen';
import { BISS, evMin, events, isActiveV, isLive, spanOf, spotNames, spotObj, statsOf, vSort, KAT, STATUS, BED, trustN, vStatus } from './fangbuch';
import { cap, de, fmtAny, fmtClock, num, parseDate, sunTimes, toMin, trim } from './util';

export const FISHKEY: Record<string, string> = { Barsch: 'barsch', Hecht: 'hecht', Zander: 'zander', Meerforelle: 'mefo', Bachforelle: 'bafo' };
export const fishKey = (f: string) => FISHKEY[f] || null;
export const WORD = (v: number) => (v >= 80 ? 'sehr gut' : v >= 65 ? 'gut' : v >= 50 ? 'mittel' : v >= 35 ? 'mäßig' : 'schwach');
// Leichte Anpassung je Gewässertyp, aus Faustregeln.
const ADJ_TYP: Record<string, Record<string, number>> = { Hafenbecken: { faul: 2, drop: 2, sbait: -6 }, Talsperre: { jerk: 2, sbait: 2, texas: -2 }, Fluss: { faul: 2, drop: -4, sbait: -6, spin: 2 }, Bach: { spin: 6, wob: 4, faul: -8, drop: -8, sbait: -10 }, See: { jerk: 2, sbait: 2 }, Kanal: { faul: 2, drop: 2 } };
const DEFAULT_SUN = { lat: 51.2, lon: 10.4 };

/* ---------- Köder einordnen ---------- */
export function methodOf(k: any): string | null {
  if (!k) return null;
  const m = k.montage || {};
  const all = [k.typ, k.modell, k.label, m.art, k.fuehrung].filter(Boolean).join(' ').toLowerCase();
  if (/dropshot|no-action/.test(all)) return 'drop';
  if (/texas|carolina|offset/.test(all)) return 'texas';
  if (/spinnerbait/.test(all)) return 'sbait';
  if (/jerk|glide|twitch/.test(all)) return 'jerk';
  if (/wobbler|crank|hardbait/.test(all)) return 'wob';
  if (/spinner/.test(all)) return 'spin';
  if (/blinker/.test(all)) return 'blink';
  return methodGuess(String(k.typ || ''), String(k.modell || k.label || '')) || (/gummi|shad|swimbait|jig|faulenz|cheburashka|creature/.test(all) ? 'faul' : null);
}
export const famOf = (k: any) => (k ? famGuess(String(k.farbe || k.label || '')) : null);

/* ---------- Sonne und Licht ---------- */
export function posOf(s: any, gw: any, settings: any) {
  const ok = (p: any) => p && num(p.lat) != null && num(p.lon) != null;
  if (s && ok(s.koordinaten)) return s.koordinaten;
  if (gw && ok(gw.koordinaten)) return gw.koordinaten;
  if (ok(settings && settings.sunPos)) return settings.sunPos;
  return DEFAULT_SUN;
}
export function sunOn(date: Date, pos: any) { return sunTimes(date, num(pos.lat)!, num(pos.lon)!); }
export function sunsetOf(s: any, gw: any, settings: any) {
  const U = s.umwelt || {};
  const su = toMin(U.sonnenuntergang);
  if (su != null) return su;
  const d = parseDate(s.datum) || new Date();
  const t = sunOn(d, posOf(s, gw, settings));
  return t ? Math.round(t.su) : 18 * 60;
}
export const LIGHT = ['Tag', 'Dämmerung', 'Dunkelheit'];
export function phaseRanges(b: number, e: number, su: number) {
  return { Tag: [b, Math.min(e, su - 30)], Dämmerung: [Math.max(b, su - 30), Math.min(e, su + 40)], Dunkelheit: [Math.max(b, su + 40), e] } as Record<string, number[]>;
}
export function turbOf(sicht: any) {
  const v = num(sicht);
  if (v == null) return null;
  return v >= 150 ? 'klar' : v >= 80 ? 'leicht trüb' : v >= 40 ? 'trüb' : 'stark trüb';
}

/* ---------- Abschnitte einer Session je Köder ---------- */
// Zerlegt eine Session in Zeitabschnitte je Köder, damit Bisse und Angelzeit der richtigen Methode und Farbe zugeordnet werden.
export function segments(s: any) {
  const sp = spanOf(s, isLive(s));
  if (!sp || sp.e == null) return [];
  const ks = (s.koeder || []).map((k: any) => ({ k, m: evMin(k, sp.b) })).filter((x: any) => x.m != null).sort((a: any, c: any) => a.m - c.m);
  const list = ks.length ? ks : (s.koeder || []).slice(0, 1).map((k: any) => ({ k, m: sp.b }));
  if (!list.length) return [];
  list[0].m = Math.min(list[0].m, sp.b);
  const evs = events(s).map((e) => ({ e, m: evMin(e, sp.b) })).filter((x) => x.m != null);
  return list.map((x: any, i: number) => {
    const a = Math.max(sp.b, x.m), z = i + 1 < list.length ? list[i + 1].m : sp.e!;
    const inSeg = evs.filter((y) => y.m! >= a && (i + 1 < list.length ? y.m! < z : true));
    return { method: methodOf(x.k), fam: famOf(x.k), min: Math.max(0, z - a), bites: inSeg.filter((y) => BISS.includes(y.e.typ)).length, nach: inSeg.filter((y) => y.e.typ === 'nachlaeufer').length };
  });
}
const segAgg = (sessions: any[], fn: (sg: any) => boolean) => {
  let min = 0, bites = 0; const ids = new Set<string>();
  sessions.forEach((s) => segments(s).forEach((sg) => { if (fn(sg)) { min += sg.min; bites += sg.bites; ids.add(s.appId); } }));
  return { min, bites, own: ids.size };
};

/* ---------- Tests ---------- */
// Testergebnisse liegen an den Sessions (Feld _tests) und fließen von dort in den Index.
export function testRuns(sessions: any[]) {
  const out: any[] = [];
  sessions.forEach((s) => (s._tests || []).forEach((t: any) => { if (t.done === 'ja' || t.done === 'nein') out.push({ key: t.key, ok: t.done === 'ja', datum: s.datum }); }));
  return out;
}
export const basisText = (own: number, n: number, ok: number) => (own === 0 ? 'Fachwissen' : own < 8 ? `Fachwissen und ${own} eigene ${own === 1 ? 'Session' : 'Sessions'}` : `${own} eigene Sessions`) + (n ? ` · ${n} ${n === 1 ? 'Test' : 'Tests'}, ${ok} mit Biss` : '');

/* ---------- Methoden-Index ---------- */
export function methodsFor(g: any, fish: string, sessions: any[], runs: any[]) {
  const fk = fishKey(fish);
  if (!fk || !g) return [];
  const ad = ADJ_TYP[g.typ] || {};
  const ss = sessions.filter((s) => s.gewaesser === g.slug && s.zielfisch === fish);
  return METHODS.map((m: any) => {
    const a = segAgg(ss, (sg) => sg.method === m.id);
    const pot = clamp(BASE[fk][m.id] + (ad[m.id] || 0));
    let sc = pot;
    if (a.own && a.min > 0) { const wt = a.own / (a.own + 4); sc = sc * (1 - wt) + Math.min(95, (a.bites / (a.min / 60)) / 2 * 100) * wt; }
    const r = runs.filter((x) => x.key === `${g.slug}|${fish}|m|${m.id}`);
    const ok = r.filter((x) => x.ok).length;
    sc += ok * 3 - (r.length - ok) * 4;
    return { ...m, score: clamp(sc), own: a.own, pot, runs: r.length, ok, bph: a.min ? a.bites / (a.min / 60) : 0, basis: basisText(a.own, r.length, ok) };
  }).sort((a: any, b: any) => b.score - a.score);
}

/* ---------- Farbberater ---------- */
export const ADVOPT: [string, string, string[]][] = [['sky', 'Himmel', ['Sonne', 'gemischt', 'bedeckt']], ['light', 'Licht', ['Tag', 'Dämmerung', 'Dunkelheit']], ['turb', 'Wassertrübung', ['klar', 'leicht trüb', 'trüb', 'stark trüb']], ['wcol', 'Wasserfarbe', ['klar', 'grünlich', 'bräunlich']], ['press', 'Angeldruck', ['gering', 'mittel', 'hoch']], ['prey', 'Hauptbeute (optional)', ['Rotauge', 'Ukelei', 'Barsch', 'Grundel']]];
// Vorbelegung aus Uhrzeit, Wochentag und der letzten eigenen Beobachtung am Gewässer.
export function defaultAdv(g: any, sessions: any[], settings: any) {
  const last = sessions.filter((s) => s.gewaesser === g.slug && s.beobachtungen && num(s.beobachtungen.sichttiefe) != null).sort((a, b) => String(b.datum).localeCompare(String(a.datum)))[0];
  const t = sunOn(new Date(), posOf(null, g, settings));
  const now = new Date().getHours() * 60 + new Date().getMinutes();
  const light = t ? (now > t.su + 40 || now < t.sa - 40 ? 'Dunkelheit' : now >= t.su - 30 ? 'Dämmerung' : 'Tag') : 'Dämmerung';
  const wd = new Date().getDay();
  return { sky: 'gemischt', light, turb: (last && turbOf(last.beobachtungen.sichttiefe)) || 'leicht trüb', wcol: 'grünlich', press: wd === 0 || wd === 6 ? 'mittel' : 'gering', prey: 'Rotauge' };
}
export function colorRank(a: any, g: any, fish: string, sessions: any[], runs: any[]) {
  const t = a.turb, l = a.light, s = a.sky;
  const sc: Record<string, number> = {
    nat: 55 + ({ klar: 20, 'leicht trüb': 8, trüb: -15, 'stark trüb': -30 } as any)[t] + (s === 'Sonne' ? 10 : 0) + ({ gering: 0, mittel: 4, hoch: 10 } as any)[a.press] + ({ Tag: 6, Dämmerung: -4, Dunkelheit: -22 } as any)[l] + (a.prey === 'Rotauge' ? 4 : 0),
    sig: 45 + ({ klar: -15, 'leicht trüb': 4, trüb: 18, 'stark trüb': 25 } as any)[t] + ({ Sonne: -8, gemischt: 0, bedeckt: 6 } as any)[s] + (a.wcol === 'bräunlich' ? 6 : 0) + ({ Tag: 0, Dämmerung: 3, Dunkelheit: -12 } as any)[l] + (a.press === 'hoch' ? -10 : 0),
    dark: 34 + ({ Tag: -4, Dämmerung: 20, Dunkelheit: 36 } as any)[l] + ({ klar: 0, 'leicht trüb': 3, trüb: 6, 'stark trüb': 14 } as any)[t] + (s === 'bedeckt' ? 4 : 0),
    kon: 40 + ({ Tag: 0, Dämmerung: 14, Dunkelheit: 8 } as any)[l] + ({ klar: -4, 'leicht trüb': 5, trüb: 10, 'stark trüb': 8 } as any)[t],
    perl: 42 + ({ Tag: 2, Dämmerung: 12, Dunkelheit: -6 } as any)[l] + ({ klar: 4, 'leicht trüb': 10, trüb: 4, 'stark trüb': -6 } as any)[t] + (a.prey === 'Ukelei' ? 10 : a.prey === 'Rotauge' ? 5 : 0),
  };
  const ss = g ? sessions.filter((x) => x.gewaesser === g.slug && x.zielfisch === fish) : [];
  const reason: Record<string, string> = {
    nat: t === 'klar' ? 'Klares Wasser: Fische schauen genau hin, natürliche Töne wirken echt.' : `Bei ${t}em Wasser sind natürliche Töne noch sichtbar und passen zur Beute ${a.prey}.`,
    sig: a.wcol === 'bräunlich' ? 'In bräunlichem Wasser sticht Chartreuse am stärksten heraus.' : 'Signalfarben bleiben bei Trübung und bedecktem Himmel länger sichtbar.',
    dark: 'In Dämmerung und Dunkelheit zeichnet sich eine dunkle Silhouette am besten gegen den helleren Himmel ab.',
    kon: 'Hell und dunkel kombiniert bleibt bei wechselndem Licht sichtbar.',
    perl: `Weiß und Perlmutt imitieren ${a.prey === 'Grundel' || a.prey === 'Barsch' ? 'Weißfisch' : a.prey} und fangen Restlicht ein.`,
  };
  return Object.keys(sc).map((k) => {
    const ag = segAgg(ss, (sg) => sg.fam === k);
    const own = ag.own;
    let v = sc[k]; let sup = 'Faustregel, noch ohne eigene Daten'; let good: boolean | null = null;
    if (own && ag.min > 0) {
      const bph = ag.bites / (ag.min / 60); const wt = own / (own + 4); v = v * (1 - wt) + Math.min(95, bph / 2 * 100) * wt;
      if (own >= 2 && bph >= 1) { sup = `Deine Daten stützen das: ${own} Sessions, ${de(bph)} Bisse pro Stunde`; good = true; }
      else if (own >= 2 && bph < 0.5) { sup = `Deine Daten sprechen eher dagegen: ${own} Sessions, ${de(bph)} Bisse pro Stunde`; good = false; }
      else sup = `Eigene Daten noch dünn: ${own} ${own === 1 ? 'Session' : 'Sessions'}`;
    }
    const rr = g ? runs.filter((x) => x.key === `${g.slug}|${fish}|c|${k}`) : [];
    const okk = rr.filter((x) => x.ok).length; v += okk * 3 - (rr.length - okk) * 4;
    return { k, score: clamp(v), pot: clamp(sc[k]), own, sup: sup + (rr.length ? ` · ${rr.length} ${rr.length === 1 ? 'Test' : 'Tests'}, ${okk} mit Biss` : ''), good, runs: rr.length, ok: okk };
  }).sort((x, y) => y.score - x.score).map((r, i) => ({
    ...r, rank: i + 1, name: FAM[r.k].name, ex: FAM[r.k].ex, reason: reason[r.k],
    sw: FAM[r.k].sw.map((c: string, j: number) => ({ style: { width: 26, height: 26, borderRadius: '50%', background: c, border: '2px solid var(--surface)', marginLeft: j ? -8 : 0, boxShadow: '0 0 0 1px var(--line)' } })),
    basis: (r.own ? `Faustregel und ${r.own} eigene ${r.own === 1 ? 'Session' : 'Sessions'}` : 'Faustregel') + (r.runs ? ` · ${r.runs} ${r.runs === 1 ? 'Test' : 'Tests'}, ${r.ok} mit Biss` : ''),
    support: r.sup, supStyle: { font: '600 13px/1.35 Archivo, sans-serif', color: r.good === true ? 'var(--plus)' : r.good === false ? 'var(--minus)' : 'var(--muted)', padding: '8px 10px', borderRadius: 10, background: 'var(--surface2)' },
  }));
}

/* ---------- Zeitfenster, Spots, Plan ---------- */
export function bestWindow(g: any, settings: any, date = new Date()) {
  const t = sunOn(date, posOf(null, g, settings));
  if (!t) return { a: 17 * 60, b: 18 * 60 + 30, text: '' };
  const a = Math.round(t.su) - 40, b = Math.round(t.su) + 40;
  return { a, b, su: Math.round(t.su), text: `${fmtClock(a)} bis ${fmtClock(b)}` };
}
export function spotStats(g: any, sessions: any[]) {
  return (g && Array.isArray(g.spots) ? g.spots : []).filter(Boolean).map((sp: any, i: number) => {
    const o = spotObj(sp);
    const mine = sessions.filter((s) => s.gewaesser === g.slug && (s.spot === o.name || events(s).some((e) => e.spot === o.name)));
    let min = 0, bites = 0;
    mine.forEach((s) => { const st = statsOf(s); min += st.min || 0; bites += s.spot === o.name ? st.bisse : events(s).filter((e) => e.spot === o.name && BISS.includes(e.typ)).length; });
    const bph = min ? bites / (min / 60) : 0;
    const base = 58;
    const score = mine.length ? clamp(base * (4 / (mine.length + 4)) + Math.min(95, bph / 2 * 100) * (mine.length / (mine.length + 4))) : base;
    return { ...o, idx: i, short: shortSpot(o.name, i), own: mine.length, bph, bites, score };
  });
}
export const shortSpot = (name: string, i: number) => { const m = /^([A-Z][A-Za-z]?)\s/.exec(String(name)); return m ? m[1] : String.fromCharCode(65 + (i % 26)); };

export function plan(g: any, fish: string, methods: any[], spots: any[], win: any) {
  const top = methods[0], b = methods[1];
  const ord = [...spots].sort((x, y) => y.score - x.score).slice(0, 3);
  const steps = ord.map((s, i) => ({ n: i + 1, t: fmtClock(win.a + i * 25), spot: s.name, what: [fmtAny(s.struktur), fmtAny(s.tiefe), s.beschreibung ? fmtAny(s.beschreibung) : ''].filter(Boolean).join(', ') || (i === 0 ? 'Solange es hell ist, Fläche absuchen.' : i === 1 ? 'Rund um Sonnenuntergang: hier verdichten.' : 'In der Dunkelheit langsamer werden.') }));
  if (!steps.length) steps.push({ n: 1, t: fmtClock(win.a), spot: 'Dein bester Platz', what: 'Lege Spots an, dann plant die App die Reihenfolge.' });
  const D = top && DET[top.id];
  const fk = fishKey(fish) || '_';
  return {
    win: win.text, dur: `${Math.round((win.b - win.a))} Minuten`, steps,
    start: top ? `${top.tech}: ${D ? `${D.type}, ${pickF(D.size, fk)}, ${pickF(D.wt, fk)}` : top.name}` : '',
    planB: b ? `Nach 30 Minuten ohne Kontakt: ${b.name}, ${b.tech.toLowerCase()}.` : '',
    watch: [{ t: 'Erste 20 Minuten Fläche absuchen, dann verdichten' }, { t: win.su ? `Ab Sonnenuntergang (${fmtClock(win.su)}) Farbe laut Berater wechseln` : 'Ab Sonnenuntergang Farbe laut Berater wechseln' }, { t: 'Nachläufer notieren, sie zeigen aktive Fische' }],
  };
}

/* ---------- Bewährt und Heute testen ---------- */
const promoted = (runs: any[], k: string) => { const r = runs.filter((x) => x.key === k); return r.length >= 3 && r.filter((x) => x.ok).length / r.length >= 0.6; };
const katLabel = (e: any) => KAT[e.kategorie] || cap(String(e.kategorie || 'Vorschlag'));
// Vorschläge aus dem Fangbuch kommen zuerst, dann ergänzt die App Tests nach Potenzial und Wissenslücke.
export function testsFor(g: any, fish: string, methods: any[], colors: any[], spots: any[], win: any, empfehlungen: any[], runs: any[], custom: any[]) {
  const key = g ? `${g.slug}|${fish}` : '';
  if (!g || !methods.length) return { key, bm: null as any, bc: null as any, promo: null as any, cands: [] as any[] };
  const fk = fishKey(fish) || '_';
  const bm = methods.filter((m) => m.own >= 3 || promoted(runs, `${key}|m|${m.id}`))[0] || methods[0];
  const bc = colors.filter((c) => c.own >= 3 || promoted(runs, `${key}|c|${c.k}`))[0] || colors[0];
  const pr = [...methods.map((m) => ({ k: `${key}|m|${m.id}`, name: m.name, c: null })), ...colors.map((c) => ({ k: `${key}|c|${c.k}`, name: c.name, c }))].find((x) => promoted(runs, x.k));
  const bestSpot = [...spots].sort((x, y) => y.score - x.score)[0];
  const spotName = bestSpot ? bestSpot.name : 'dein bester Spot';
  const zf = fish.toLowerCase();
  const emps = empfehlungen.filter((e) => isActiveV(e) && (!e.gewaesser || e.gewaesser === g.slug) && (!e.zielfisch || fmtAny(e.zielfisch).toLowerCase().includes(zf))).sort((a, b) => (!a.gewaesser as any) - (!b.gewaesser as any) || vSort(a, b));
  const fromFangbuch = emps.map((e) => {
    const r = runs.filter((x) => x.key === `${key}|e|${e.id}`); const ok = r.filter((x) => x.ok).length;
    const bed = e.bedingungen && typeof e.bedingungen === 'object' && !Array.isArray(e.bedingungen) ? Object.entries(e.bedingungen).filter(([, v]) => v != null && v !== '').map(([k, v]) => [BED[k] || cap(k), fmtAny(v)]) : [];
    return {
      key: `${key}|e|${e.id}`, empId: e.id, kindLabel: `Aus dem Fangbuch · ${katLabel(e)}`, title: e.titel || 'Vorschlag', sw: [],
      rows: [e.empfehlung ? ['Was', fmtAny(e.empfehlung)] : null, ...bed.map(([k, v]) => [k, v]), e.setup ? ['Material', fmtAny(e.setup)] : null, ['Erfolg', e.erfolgskriterium ? fmtAny(e.erfolgskriterium) : 'Mindestens ein Biss oder Nachläufer']].filter(Boolean),
      why: e.begruendung ? `Warum: ${fmtAny(e.begruendung)}` : `${STATUS[vStatus(e)]}${e.vertrauen ? ', Vertrauen ' + fmtAny(e.vertrauen) : ''}.`,
      basis: [`${STATUS[vStatus(e)]}`, trustN(e.vertrauen) ? `Vertrauen ${fmtAny(e.vertrauen)}` : '', r.length ? `${r.length} ${r.length === 1 ? 'Test' : 'Tests'} in der App, ${ok} mit Biss` : ''].filter(Boolean).join(' · '),
      crit: e.erfolgskriterium ? fmtAny(e.erfolgskriterium) : 'Mindestens ein Biss oder Nachläufer',
    };
  });
  const mc = methods.filter((m) => m.id !== bm.id && !promoted(runs, `${key}|m|${m.id}`) && m.pot >= 40).map((m) => ({ m, pri: m.pot * (1 - Math.min(m.own, 4) / 5) - (m.runs - m.ok) * 6 })).sort((a, b) => b.pri - a.pri).slice(0, Math.max(0, 2 - fromFangbuch.length));
  const own = mc.map(({ m }, i) => {
    const D = DET[m.id]; const a = win.a + 10 + i * 30;
    return {
      key: `${key}|m|${m.id}`, kindLabel: 'Methode testen', title: `${m.name}, ${m.tech}`, sw: [],
      rows: [['Köder', `${D.type}, ${pickF(D.size, fk)}, ${pickF(D.wt, fk)}`], ['Farbe', FAM[bc.k].ex.split(',')[0]], ['Führung', D.steps[1]], ['Spot', spotName], ['Zeit', `${fmtClock(a)} bis ${fmtClock(a + 20)}, 20 Minuten am selben Spot`], ['Erfolg', 'Mindestens ein Biss oder Nachläufer']],
      why: `Warum heute: ${D.plus[0]}. ${m.own ? `Eigene Daten: erst ${m.own} ${m.own === 1 ? 'Session' : 'Sessions'}.` : 'Eigene Daten: noch keine.'}`,
      basis: m.runs ? `${SHORT[m.id]} hier: ${m.runs} ${m.runs === 1 ? 'Test' : 'Tests'}, ${m.ok} mit Biss` : `${SHORT[m.id]} hier: noch nie getestet`, crit: 'Mindestens ein Biss oder Nachläufer',
    };
  });
  const cc = colors.filter((c) => c.k !== bc.k && !promoted(runs, `${key}|c|${c.k}`)).map((c) => ({ c, pri: c.pot * (1 - Math.min(c.own, 4) / 5) - (c.runs - c.ok) * 6 })).sort((a, b) => b.pri - a.pri)[0];
  if (cc) {
    const c = cc.c; const D = DET[bm.id]; const a = Math.max(win.su || win.a, win.a + 20);
    own.push({
      key: `${key}|c|${c.k}`, kindLabel: 'Farbe testen', title: c.name, sw: c.sw,
      rows: [['Köder', `${D.type}, ${pickF(D.size, fk)} in ${FAM[c.k].ex.split(',')[0]}`], ['Führung', `${MN[bm.id].tech} wie gewohnt, nur die Farbe wechselt`], ['Spot', spotName], ['Zeit', `${fmtClock(a)} bis ${fmtClock(a + 20)}, 20 Minuten am selben Spot`], ['Erfolg', 'Mindestens ein Biss oder Nachläufer']],
      why: `Warum heute: ${c.reason}`, basis: c.runs ? `${FSHORT[c.k]} hier: ${c.runs} ${c.runs === 1 ? 'Test' : 'Tests'}, ${c.ok} mit Biss` : `${FSHORT[c.k]} hier: noch nie getestet`, crit: 'Mindestens ein Biss oder Nachläufer',
    } as any);
  }
  return { key, bm, bc, promo: pr ? { name: pr.name, c: pr.c, r: runs.filter((x) => x.key === pr.k) } : null, cands: [...fromFangbuch, ...own, ...custom] };
}

/* ---------- Box-Empfehlung ---------- */
export function boxRec(box: any, g: any, fish: string, methods: any[], colors: any[], spots: any[]) {
  if (!box || !g || !methods.length) return { has: false, items: [], boxName: box ? box.name : 'keine Box', hasMissing: false, missing: '' };
  const fk = fishKey(fish) || '_';
  const swS = (c: string) => ({ width: 34, height: 34, borderRadius: 10, background: c, border: '1px solid var(--line)', flex: 'none' });
  const bestSpot = [...spots].sort((x, y) => y.score - x.score)[0];
  const its = box.items.filter((i: any) => i.m && i.fam && i.n > 0).map((i: any) => { const m = methods.find((x) => x.id === i.m), c = colors.find((x) => x.k === i.fam); return m && c ? { i, m, c, score: Math.round(m.score * 0.6 + c.score * 0.4) } : null; }).filter(Boolean).sort((a: any, b: any) => b.score - a.score).slice(0, 3);
  const best = methods[0], bc = colors[0];
  const hasBest = box.items.some((i: any) => i.m === best.id && i.fam === bc.k && i.n > 0);
  return {
    has: its.length > 0, boxName: box.name,
    items: its.map(({ i, m, c, score }: any) => ({ item: i, title: [i.type, i.size, i.col].filter(Boolean).join(' '), n: `${i.n}× in der Box · ${m.tech}`, score, own: m.own, basis: `${SHORT[m.id]}: ${m.basis}`, sw: swS(i.sw), word: WORD(score), rows: [{ k: 'Führung', v: DET[m.id].steps[1] }, { k: 'Spot', v: bestSpot ? bestSpot.name : 'dein bester Spot' }], why: `${m.tech} ${WORD(m.score)}, Farbe ${FSHORT[c.k]} ${WORD(c.score)}. ${c.reason}`, mId: m.id, fam: c.k })),
    hasMissing: !hasBest, missing: hasBest ? '' : `Nicht in deiner Box: ${DET[best.id].type}, ${pickF(DET[best.id].size, fk)} in ${FAM[bc.k].ex.split(',')[0]}. Laut Index heute die beste Kombination.`,
  };
}

/* ---------- Saison ---------- */
const SEASONS: Record<string, [number[], string][]> = {
  barsch: [[[3, 4], 'Laichzeit: Barsche ziehen ins Flache'], [[5, 6], 'Frühsommer: aktiv nach dem Laichen'], [[7, 8], 'Sommer: Jagd im Freiwasser, früh und spät'], [[9, 10, 11], 'Herbstfressphase: frisst aktiv, Schwärme an Kanten'], [[12, 1, 2], 'Winterlager: tief und träge, langsam führen']],
  hecht: [[[2, 3, 4], 'Laichzeit: Schonzeit beachten'], [[5, 6], 'Frühsommer: Kraut wächst, Hecht steht flach'], [[7, 8], 'Sommer: früh und spät an Krautkanten'], [[9, 10, 11], 'Herbstfressphase: große Köder lohnen'], [[12, 1], 'Winter: tief und langsam']],
  zander: [[[4, 5], 'Laichzeit: Schonzeit beachten'], [[6, 7, 8], 'Sommer: nachts und in der Dämmerung'], [[9, 10, 11], 'Herbst: zieht an tiefere Kanten'], [[12, 1, 2, 3], 'Winter: tief, sehr langsam führen']],
  mefo: [[[10, 11, 12], 'Laichzeit: Aufstieg, Schonzeit beachten'], [[1, 2, 3, 4, 5, 6, 7, 8, 9], 'Fressphase']],
  bafo: [[[10, 11, 12], 'Laichzeit: Schonzeit beachten'], [[1, 2, 3, 4, 5, 6, 7, 8, 9], 'Fressphase']],
};
export function seasonOf(fish: string, d = new Date()) {
  const fk = fishKey(fish); const mo = d.getMonth() + 1;
  const e = fk && SEASONS[fk].find(([ms]) => ms.includes(mo));
  return e ? e[1] : '';
}
export { KAT, STATUS, BED };
