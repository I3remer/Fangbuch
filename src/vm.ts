// Baut aus dem Zustand der App das View-Model für die Screens. Alle Werte stammen aus deinen Daten
// (Sessions, Gewässer und Vorschläge aus dem Fangbuch); wo Daten fehlen, sagt die App das, statt Beispielwerte zu zeigen.
import { DET, FAM, FSHORT, METHODS, MN, SHORT, SYM, OBS, chip, clamp, dot, mark, optBtn, pick as pickF, rhythm } from './lib/fachwissen';
import { ADVOPT, LIGHT, WORD, basisText, bestWindow, boxRec, colorRank, fishKey, methodsFor, phaseRanges, plan as mkPlan, posOf, seasonOf, segments, spotStats, sunOn, sunsetOf, testRuns, testsFor, turbOf } from './lib/berater';
import { ARTEN, BISS, GWTYP, STALE_DAYS, STATUS, TYP, ZIELFISCHE, bildId, events, evMin, isDone, isLive, isNewGw, koederExtra, koederText, montageText, spanOf, spotNames, spotObj, statsOf, vStatus, vSort } from './lib/fangbuch';
import { inSchon, licVm, parseRegeln } from './lib/regeln';
import { DF_LONG, DF_TS, de, dayLabel, daysSince, fmtAny, fmtClock, fmtDur, isoDate, num, parseDate, toMin, trim, uniq, uuid } from './lib/util';
import { NEU, swatchFor } from './FangbuchApp';

const TABS = [['heute', 'Heute'], ['waters', 'Gewässer'], ['book', 'Fangbuch'], ['stats', 'Auswertung'], ['more', 'Mehr']];
const swStyle = (c: string, i: number, s = 26) => ({ width: s, height: s, borderRadius: '50%', background: c, border: '2px solid var(--surface)', marginLeft: i ? -8 : 0, boxShadow: '0 0 0 1px var(--line)' });
const n = (c: number, one: string, many: string) => `${c} ${c === 1 ? one : many}`;
const card = { textAlign: 'left', cursor: 'pointer', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, padding: 16, display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--ink)' };

export function buildVm(app: any, opts: any = {}): any {
  const st = app.state;
  const sessions: any[] = st.sessions;
  const gws: any[] = st.gewaesser;
  const settings = st.settings;
  const V = st.v3;
  const runs = testRuns(sessions);
  const gwBy = (slug: string) => gws.find((g) => g.slug === slug) || null;
  const short = (slug: string) => { const g = gwBy(slug); return g ? g.kuerzel || g.name : slug; };
  const gwName = (s: any) => gwBy(s.gewaesser)?.name || s.gewaesserName || s.gewaesser || 'Unbekanntes Gewässer';
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

  // Berater-Werte für ein Gewässer und einen Zielfisch.
  const advise = (slug: string, fish: string) => {
    const g = gwBy(slug);
    const methods = methodsFor(g, fish, sessions, runs);
    const adv = app.adv(slug);
    const colors = g ? colorRank(adv, g, fish, sessions, runs) : [];
    const spots = spotStats(g, sessions);
    const win = bestWindow(g, settings);
    const key = `${slug}|${fish}`;
    const tf = testsFor(g, fish, methods, colors, spots, win, st.empfehlungen, runs, (V.custom || {})[key] || []);
    const planned = (V.planned || {})[key];
    const plannedKeys = planned ? planned.filter((k: string) => tf.cands.some((c: any) => c.key === k)) : tf.cands.slice(0, 2).map((c: any) => c.key);
    return { g, methods, adv, colors, spots, win, tf, plannedKeys };
  };
  if (opts.only === 'tests') return advise(opts.w, opts.f);

  const cur = st.stack[st.stack.length - 1].s;
  const is: any = {};
  ['heute', 'waters', 'water', 'method', 'live', 'book', 'session', 'edit', 'stats', 'more', 'gear', 'data', 'boxes', 'box'].forEach((k) => (is[k] = cur === k));
  const tabOf: any = { heute: 'heute', waters: 'waters', water: 'waters', method: 'waters', book: 'book', session: 'book', edit: 'book', stats: 'stats', more: 'more', gear: 'more', boxes: 'more', box: 'more', data: 'more' };
  const activeTab = tabOf[cur] || st.stack[0].s;
  const theme = V.theme ?? (app.mq?.matches ? 'dark' : 'light');
  const provMode = 'beides';
  const live = app.liveSession();
  const openS = app.openSessions();
  const pend = openS.length + app.openGw().length + app.spotGw().length;
  const stale = openS.filter((s: any) => daysSince(s.datum) > STALE_DAYS);
  const lv = V.lics.map((l: any) => licVm(l, V.vorlauf || 4, short));
  const licW = (slug: string) => lv.filter((l: any) => (l.waters || []).includes(slug));
  const rulesOf = (slug: string) => app.rulesOf(slug);
  const schonOf = (slug: string, fish: string) => rulesOf(slug).find((r: any) => r.art === fish && inSchon(r.von, r.bis));

  /* ---------- Zeitleiste ---------- */
  let TL0 = 15 * 60, TL1 = 21 * 60;
  sessions.forEach((s) => { const sp = spanOf(s, isLive(s)); if (sp && sp.e != null) { TL0 = Math.min(TL0, Math.floor(sp.b / 60) * 60); TL1 = Math.max(TL1, Math.ceil(sp.e / 60) * 60); } });
  while ((TL1 - TL0) % 180) TL1 < 24 * 60 ? (TL1 += 60) : (TL0 -= 60);
  const P = (m: number) => Math.max(0, Math.min(100, ((m - TL0) / (TL1 - TL0)) * 100));
  const timeline = (s: any, big: boolean) => {
    const g = gwBy(s.gewaesser);
    const d = parseDate(s.datum) || new Date();
    const t = sunOn(d, posOf(s, g, settings));
    const su = sunsetOf(s, g, settings), sa = t ? Math.round(t.sa) : 7 * 60;
    const stops = [`var(--tlnight) 0%`, `var(--tlnight) ${P(sa - 55)}%`, `var(--tldusk) ${P(sa)}%`, `var(--tlday) ${P(sa + 50)}%`, `var(--tlday) ${P(su - 50)}%`, `var(--tldusk) ${P(su)}%`, `var(--tlnight) ${P(su + 55)}%`, `var(--tlnight) 100%`];
    const sp = spanOf(s, isLive(s)) || { b: TL0, e: TL0 };
    return {
      track: { position: 'relative', height: big ? 34 : 22, borderRadius: big ? 10 : 7, background: `linear-gradient(90deg, ${stops.join(', ')})`, width: '100%' },
      span: { position: 'absolute', top: -3, bottom: -3, left: P(sp.b) + '%', width: Math.max(0.8, P(sp.e ?? sp.b) - P(sp.b)) + '%', border: '2px solid var(--ink)', borderRadius: big ? 10 : 7 },
      marks: events(s).map((e) => ({ style: mark(typChar(e.typ), P(evMin(e, sp.b) ?? sp.b), big) })),
      ss: fmtClock(su),
    };
  };
  const tlLabels = [0, 1, 2, 3].map((i) => fmtClock(TL0 + ((TL1 - TL0) / 3) * i));
  const resOf = (s: any) => { const x = statsOf(s); return isLive(s) && !x.bisse ? 'läuft' : x.bisse === 0 ? 'Nullrunde' : `${n(x.faenge, 'Fang', 'Fänge')} · ${n(x.bisse, 'Biss', 'Bisse')}`; };
  const resStyle = (s: any) => ({ font: '700 13px Archivo, sans-serif', color: statsOf(s).bisse === 0 ? 'var(--muted)' : 'var(--ink)', whiteSpace: 'nowrap' });
  const sv = (s: any) => {
    const k = (s.koeder || [])[0];
    return { ...timeline(s, false), dl: dayLabel(parseDate(s.datum)), fish: s.zielfisch || 'ohne Zielfisch', waterShort: gwName(s), st: s.beginn || '?', en: s.ende || 'jetzt', method: k ? k.label || koederText(k) : 'ohne Köder', res: resOf(s), resStyle: resStyle(s), unsynced: !isDone(s) && !isLive(s), open: () => (isLive(s) ? app.nav('live') : app.nav('session', { sid: s.appId })) };
  };
  const agg = (list: any[]) => { let h = 0, b = 0, c = 0; list.forEach((s) => { const x = statsOf(s); h += (x.min || 0) / 60; b += x.bisse; c += x.faenge; }); return { h, b, c, bph: h ? b / h : 0, zero: list.filter((s) => statsOf(s).bisse === 0 && !isLive(s)).length }; };

  /* ---------- Live ---------- */
  let liveVm: any = {};
  if (live) {
    const t0 = live._startTs || (() => { const d = parseDate(live.datum) || new Date(); return d.getTime() + (toMin(live.beginn) || 0) * 60000; })();
    const el = Math.max(0, Math.floor((Date.now() - t0) / 1000));
    const cnt = (t: string) => events(live).filter((e) => e.typ === t).length;
    const k = (live.koeder || [])[live.koeder.length - 1];
    const fam = k ? (FAM as any)[famKey(k)] : null;
    const items: any[] = [];
    events(live).forEach((e, i) => items.push({ ts: e._ts || 0, t: e.zeit, label: TYP[e.typ] + [e.art && e.laengeCm ? ` · ${e.art} ${e.laengeCm} cm${e.entnommen ? ', entnommen' : ''}` : e.art ? ` · ${e.art}` : '', e.spot && e.spot !== live.spot ? ` · ${e.spot}` : '', num(e.tiefeM) != null ? ` · ${de(num(e.tiefeM)!)} m` : '', e.bild ? ' · Screenshot' : '', e.notiz ? ` · ${e.notiz}` : ''].join(''), dot: dot(typChar(e.typ)), edit: () => app.setState({ sheet: 'ev', evIdx: i }) }));
    (live.koeder || []).forEach((x: any) => items.push({ ts: x._ts || 0, t: x.zeit, label: 'Köder · ' + (x.label || koederText(x)), dot: { width: 10, height: 10, borderRadius: 2, background: 'var(--muted)', flex: 'none' } }));
    (live.notizen || []).forEach((x: any) => items.push({ ts: x._ts || 0, t: x.zeit, label: x.text, dot: { width: 10, height: 10, borderRadius: 2, background: 'var(--muted)', flex: 'none' } }));
    items.sort((a, b) => b.ts - a.ts || String(b.t).localeCompare(String(a.t)));
    const rr = schonOf(live.gewaesser, live.zielfisch);
    liveVm = {
      waterName: gwName(live), waterShort: short(live.gewaesser), fish: live.zielfisch || 'ohne Zielfisch',
      elapsed: `${Math.floor(el / 3600)}:${String(Math.floor((el % 3600) / 60)).padStart(2, '0')}:${String(el % 60).padStart(2, '0')}`,
      bites: cnt('fang') + cnt('fehlbiss') + cnt('aussteiger'), catches: cnt('fang'), nC: cnt('fang'), nF: cnt('fehlbiss'), nA: cnt('aussteiger'), nN: cnt('nachlaeufer'),
      tip: k ? k.label || koederText(k) : 'Noch kein Köder', tip2: k ? koederExtra(k) || [k.typ, k.farbe].filter(Boolean).join(', ') || 'Tippe, um zu wechseln' : 'Tippe und wähl deinen Köder',
      sw: (fam ? fam.sw : ['#7a7f7c']).map((c: string, j: number) => ({ style: swStyle(c, j, 30) })),
      log: items.slice(0, 6), empty: items.length === 0, schon: !!rr, schonText: rr ? `${live.zielfisch} hat hier Schonzeit bis ${rr.bis}. Nicht gezielt beangeln.` : '',
      tests: (live._tests || []).map((t: any, i: number) => {
        const endT = t.end || fmtClock(nowMin);
        const inT = t.start ? events(live).filter((e) => toMin(e.zeit)! >= toMin(t.start)! && toMin(e.zeit)! <= toMin(endT)!) : [];
        const b = inT.filter((e) => BISS.includes(e.typ)).length, nn = inT.filter((e) => e.typ === 'nachlaeufer').length;
        const min = t.start ? Math.max(0, toMin(endT)! - toMin(t.start)!) : 0;
        const status = t.done ? (t.done === 'ja' ? `Gewertet: hat was gebracht, ${b} Bisse` : t.done === 'nein' ? 'Gewertet: nichts gebracht' : 'Nicht gewertet') : t.end ? `Beendet, ${b} Bisse, ${nn} Nachläufer` : t.start ? `läuft seit ${min} min · ${b} Bisse, ${nn} Nachläufer` : 'bereit · 20 Minuten am selben Spot';
        const run = t.start && !t.end;
        return { title: t.title, status, btn: t.done ? 'Erledigt' : t.end ? 'Werten' : run ? 'Beenden' : 'Starten', act: () => app.testAct(i), btnStyle: { height: 48, minWidth: 96, padding: '0 14px', borderRadius: 14, border: run ? '0' : '1.5px solid var(--ink)', background: run ? 'var(--orange)' : 'transparent', color: run ? 'var(--onorange)' : 'var(--ink)', font: '700 15px Archivo, sans-serif', cursor: 'pointer', flex: 'none', opacity: t.done ? 0.5 : 1 } };
      }),
      noTests: !(live._tests || []).length,
    };
  }
  const todayBox = V.boxes.find((b: any) => b.id === V.todayBox) || null;
  let liveBox: any = { has: false, items: [] };
  if (live && fishKey(live.zielfisch)) {
    const A = advise(live.gewaesser, live.zielfisch);
    const lb = boxRec(todayBox, A.g, live.zielfisch, A.methods, A.colors, A.spots);
    liveBox = { ...lb, items: lb.items.slice(0, 2).map((r: any) => ({ ...r, sw: { ...r.sw, width: 28, height: 28, borderRadius: 8 }, use: () => app.changeKoeder(itemDraft(r.item)) })) };
  }

  /* ---------- Heute und Gewässerliste ---------- */
  const lastObs = (slug: string) => sessions.filter((s) => s.gewaesser === slug && !isLive(s) && s.beobachtungen && (num(s.beobachtungen.wassertemp) != null || num(s.beobachtungen.sichttiefe) != null))[0];
  const todayWaters = gws.map((g) => {
    const fish = app.mainFish(g);
    const ms = methodsFor(g, fish, sessions, runs);
    const own = sessions.filter((s) => s.gewaesser === g.slug && s.zielfisch === fish).length;
    const win = bestWindow(g, settings);
    return { name: g.name || g.slug, score: ms[0]?.score ?? 50, own, basis: ms.length ? null : `Für ${fish} hat die App noch kein Fachwissen`, win: `${win.text} · ${fish}`, open: () => app.openWater(g.slug) };
  }).sort((a, b) => b.score - a.score);
  const waterList = gws.map((g) => {
    const ss = sessions.filter((s) => s.gewaesser === g.slug);
    const o = lastObs(g.slug);
    const obs = o ? [num(o.beobachtungen.wassertemp) != null ? `Wasser ${de(num(o.beobachtungen.wassertemp)!)} °C` : '', num(o.beobachtungen.sichttiefe) != null ? `Sicht ${o.beobachtungen.sichttiefe} cm` : '', `zuletzt ${dayLabel(parseDate(o.datum))}`].filter(Boolean).join(' · ') : 'Noch keine eigene Beobachtung';
    return { name: g.name || g.slug, short: g.kuerzel || g.slug.slice(0, 2).toUpperCase(), sub: [g.typ, g.lage].filter(Boolean).join(' · ') || 'Gewässer', badge: isNewGw(g) ? 'neu, nicht übertragen' : (g._neueSpots || []).length ? n(g._neueSpots.length, 'neuer Spot', 'neue Spots') : '', stateLine: obs, statLine: `${n(ss.length, 'Session', 'Sessions')}${(g.zielfische || []).length ? ' · Zielfische ' + g.zielfische.join(', ') : ''}`, open: () => app.openWater(g.slug) };
  });

  /* ---------- Gewässer ---------- */
  const W = gwBy(st.w);
  const fish = st.f;
  const A = W ? advise(W.slug, fish) : null;
  const noFach = !fishKey(fish);
  const absent = !!W && (W.zielfische || []).length > 0 && !W.zielfische.includes(fish) && !sessions.some((s) => s.gewaesser === W.slug && s.zielfisch === fish);
  const methods = A ? A.methods.map((m: any, i: number) => ({ ...m, best: i === 0, open: () => app.nav('method', { m: m.id }), cardStyle: { ...card, border: i === 0 ? '2px solid var(--ink)' : '1px solid var(--line)' } })) : [];
  const wv: any = {};
  let conds: any[] = [];
  if (W) {
    const o = lastObs(W.slug);
    const rr = schonOf(W.slug, fish);
    const nl = licW(W.slug).find((l: any) => l.state === 'expired');
    const due = licW(W.slug).find((l: any) => l.state === 'due');
    const hintSt = (c: string) => ({ margin: '12px 20px 0', textAlign: 'left', cursor: 'pointer', background: 'var(--surface)', border: `2px solid ${c}`, borderRadius: 14, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, minHeight: 56, color: 'var(--ink)', width: 'calc(100% - 40px)' });
    const hdot = (c: string) => ({ font: '800 14px/1 Archivo, sans-serif', width: 26, height: 26, borderRadius: '50%', background: c, color: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' });
    Object.assign(wv, {
      short: W.kuerzel || W.slug.slice(0, 2).toUpperCase(), sub: [W.typ, W.lage].filter(Boolean).join(' · ') || 'Gewässer', name: W.name || W.slug, fishName: fish,
      state: [{ k: 'Wasser', v: o && num(o.beobachtungen.wassertemp) != null ? `${de(num(o.beobachtungen.wassertemp)!)} °C` : '–' }, { k: 'Sichttiefe', v: o && num(o.beobachtungen.sichttiefe) != null ? `${o.beobachtungen.sichttiefe} cm, ${turbOf(o.beobachtungen.sichttiefe)}` : '–' }, { k: 'Tide', v: W.tide || 'prüfen' }],
      obs: o ? `Letzte Beobachtung ${dayLabel(parseDate(o.datum))}, ${o.ende || o.beginn}` : 'Noch keine eigene Beobachtung. Miss Wassertemperatur und Sichttiefe beim nächsten Start.',
      absent: absent || noFach, absentTitle: absent ? `${fish} ist hier kein Zielfisch` : `Für ${fish} fehlt noch Fachwissen`,
      absentText: absent ? `Im Steckbrief steht ${fish} nicht als Zielfisch. Fängst du doch einen, trag ihn ein: dann lernt die App dazu.` : `Index, Farbberater und Tests gibt es bisher für Barsch, Hecht, Zander, Meerforelle und Bachforelle. Sessions mit ${fish} zählen trotzdem in Fangbuch und Auswertung.`,
      canEdit: isNewGw(W), edit: () => app.openForm('gw', { slug: W.slug, name: W.name, kuerzel: W.kuerzel, typ: W.typ || '', lage: W.lage || '', tide: W.tide || 'prüfen', zielfische: (W.zielfische || []).join(', '), spots: spotNames(W).join('\n'), beschreibung: W.beschreibung || '' }, false),
      hints: [
        ...(rr ? [{ title: `${fish}: Schonzeit bis ${rr.bis}`, text: 'Gezielt beangeln verboten, Beifang schonend zurücksetzen.', style: hintSt('var(--minus)'), dot: hdot('var(--minus)') }] : []),
        ...(nl ? [{ title: 'Lizenz abgelaufen', text: `${nl.type} seit ${nl.toT}. Ohne gültige Erlaubnis kein Angeln.`, style: hintSt('var(--minus)'), dot: hdot('var(--minus)') }] : []),
        ...(due ? [{ title: 'Bestellung fällig', text: `${due.type}: ${due.line}`, style: hintSt('var(--orange)'), dot: hdot('var(--orange)') }] : []),
      ],
    });
    const otag = (k: string) => ({ font: '700 11px/1 Archivo, sans-serif', padding: '6px 8px', borderRadius: 7, whiteSpace: 'nowrap', flex: 'none', ...(k === 'automatisch' ? { background: 'var(--reed)', color: 'var(--onreed)', border: '1.5px solid var(--reed)' } : k === 'recherchiert' ? { background: 'transparent', color: 'var(--ink)', border: '1.5px solid var(--ink)' } : { background: 'transparent', color: 'var(--muted)', border: '1.5px dashed var(--muted)' }) });
    const wd = new Date().getDay();
    const pos = posOf(null, W, settings);
    const posSrc = W.koordinaten ? 'Position des Gewässers' : settings.sunPos ? 'dein gespeicherter Ort' : 'Mitte Deutschlands, Ort unter „Daten“ festlegen';
    const ang = (V.anglers || {})[W.slug];
    const angToday = ang && ang.d === isoDate(new Date()) ? ang : null;
    const t = sunOn(new Date(), pos);
    conds = [
      ['Sonnenuntergang', t ? fmtClock(t.su) : 'nicht berechenbar', `berechnet für ${posSrc}`, 'automatisch', 'heute'],
      ['Bestes Zeitfenster', A!.win.text, 'rund um Sonnenuntergang, Faustregel für Raubfisch', 'automatisch', 'heute'],
      ['Saisonphase', seasonOf(fish) || 'keine Angabe', 'Fachliteratur, Faustregel', 'recherchiert', 'Monat'],
      ['Angeldruck', wd === 0 || wd === 6 ? 'eher höher: Wochenende' : 'eher gering: Werktag', 'Kalender', 'automatisch', 'heute'],
      ...(o ? [['Wasser zuletzt', [num(o.beobachtungen.wassertemp) != null ? `${de(num(o.beobachtungen.wassertemp)!)} °C` : '', num(o.beobachtungen.sichttiefe) != null ? `Sicht ${o.beobachtungen.sichttiefe} cm` : ''].filter(Boolean).join(', '), 'eigene Messung', 'beobachtet', dayLabel(parseDate(o.datum))]] : []),
      ['Wetter, Wind, Luftdruck, Pegel', 'noch nicht in der App', 'Claude ergänzt diese Werte im Fangbuch', 'offen', ''],
      ...(angToday ? [['Andere Angler', angToday.v, 'eigene Beobachtung', 'beobachtet', `heute ${angToday.t}`]] : []),
    ].map(([k, v, src, o2, ts]) => ({ k, v, src: [src, ts].filter(Boolean).join(' · '), origin: o2, tagStyle: otag(o2 as string) }));
  }
  const anglerOpts = W ? ['keine', '1 bis 2', '3 und mehr'].map((l) => { const a = (V.anglers || {})[W.slug]; const on = a && a.d === isoDate(new Date()) && a.v === l; return { label: l, pick: () => app.setV3({ anglers: { ...V.anglers, [W.slug]: { v: l, t: fmtClock(nowMin), d: isoDate(new Date()) } } }), style: { ...optBtn(on), minHeight: 48 } }; }) : [];
  const fishList = W ? uniq([...(W.zielfische || []), ...ZIELFISCHE, ...sessions.filter((s) => s.gewaesser === W.slug).map((s) => s.zielfisch)]) : [];
  const fishChips = fishList.map((f) => ({ label: f, pick: () => app.setState({ f }), style: { ...chip(fish === f), opacity: !W || !(W.zielfische || []).length || W.zielfische.includes(f) ? 1 : 0.55 } }));

  // Heute: Bewährt und Heute testen
  const tf = A ? A.tf : { cands: [] as any[], bm: null as any, bc: null as any, promo: null as any, key: '' };
  const pk = A ? A.plannedKeys : [];
  const togglePlan = (k: string) => {
    if (pk.includes(k)) app.setV3({ planned: { ...V.planned, [tf.key]: pk.filter((x: string) => x !== k) } });
    else if (pk.length >= 2) app.toastMsg('Höchstens 2 Tests pro Session. Nimm erst einen heraus.');
    else app.setV3({ planned: { ...V.planned, [tf.key]: [...pk, k] } });
  };
  const tests = tf.cands.map((c: any) => { const on = pk.includes(c.key); return { ...c, sw: (c.sw || []).map((s: any) => (s.style ? s : { style: s })), rows: c.rows.map(([k, v]: any) => ({ k, v })), toggle: () => togglePlan(c.key), btnLabel: on ? 'Vorgemerkt ✓' : 'Für Session vormerken', btnStyle: { height: 48, borderRadius: 14, border: on ? '0' : '1.5px solid var(--ink)', background: on ? 'var(--orange)' : 'transparent', color: on ? 'var(--onorange)' : 'var(--ink)', font: '700 15px Archivo, sans-serif', cursor: 'pointer' }, cardStyle: { background: 'var(--surface)', border: on ? '2px solid var(--orange)' : '1.5px dashed var(--muted)', borderRadius: 18, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 } }; });
  const bewItems: any[] = tf.bm ? [{ kind: 'Methode', name: `${tf.bm.name}, ${tf.bm.tech}`, basis: tf.bm.basis, word: WORD(tf.bm.score), sw: [], open: () => app.nav('method', { m: tf.bm.id }) }, { kind: 'Köderfarbe', name: tf.bc.name, basis: tf.bc.basis, word: WORD(tf.bc.score), sw: tf.bc.sw, open: () => app.goSec('farben') }] : [];
  if (tf.promo && tf.promo.c && tf.promo.c.k !== tf.bc?.k) bewItems.push({ kind: 'Neu bewährt', name: tf.promo.name, basis: tf.promo.c.basis, word: WORD(tf.promo.c.score), sw: tf.promo.c.sw, open: () => app.goSec('farben') });
  const bew = { items: bewItems, hasPromo: !!tf.promo, promo: tf.promo ? `${tf.promo.name}: ${tf.promo.r.length} Tests, ${tf.promo.r.filter((x: any) => x.ok).length} mit Biss. Wandert aus „Heute testen“ zu „Bewährt“.` : '' };
  const mainOwn = W ? sessions.filter((s) => s.gewaesser === W.slug && s.zielfisch === fish).length : 0;
  const pl = A && A.methods.length ? mkPlan(W, fish, A.methods, A.spots, A.win) : { win: '', dur: '', steps: [], watch: [], start: '', planB: '' };
  const plan = { ...pl, score: A?.methods[0]?.score ?? 50, own: mainOwn, openStart: () => app.nav('method', { m: A?.methods[0]?.id || 'faul' }) };
  const advRows = W ? ADVOPT.map(([k, label, os]) => ({ label, gridStyle: { display: 'grid', gridTemplateColumns: `repeat(${os.length},minmax(0,1fr))`, gap: 6 }, opts: os.map((o) => ({ label: o, pick: () => app.setState((s: any) => ({ adv: { ...s.adv, [W.slug]: { ...app.adv(W.slug), [k]: o } } })), style: optBtn(A!.adv[k] === o) })) })) : [];
  const colorRes = A ? A.colors.slice(0, 3) : [];
  const br = { ...(W && A && A.methods.length ? boxRec(todayBox, W, fish, A.methods, A.colors, A.spots) : { items: [], hasMissing: false }), boxOpts: V.boxes.map((b: any) => ({ label: b.name, pick: () => app.setV3({ todayBox: b.id }), style: { ...chip(V.todayBox === b.id), height: 44 } })), noBox: !V.boxes.length, goBoxes: () => app.nav('boxes') };

  // Spots, Karten, Sessions, Wissensstand
  const spots = (A ? A.spots : []).map((s: any) => ({ id: s.short, name: s.name, struct: fmtAny(s.struktur) || (s.beschreibung ? fmtAny(s.beschreibung) : 'Spot'), score: s.score, own: s.own, depth: fmtAny(s.tiefe) || '–', ground: fmtAny(s.grund) || '–', best: fmtAny(s.notiz) || fmtAny(s.beschreibung) || '–', bilanz: s.own ? `${n(s.own, 'Session', 'Sessions')}, ${de(s.bph)} Bisse/h` : 'noch nicht beangelt' }));
  const spotsW = A ? A.spots : [];
  const mapSpot = st.mapSpot && spotsW.some((s: any) => s.name === st.mapSpot) ? st.mapSpot : spotsW[0]?.name || null;
  const maps = W ? (V.maps[W.slug] || []).map((mp: any) => {
    const z = st.zoom[mp.id] || 1; const editing = st.mapEdit === mp.id;
    return {
      ...mp, src: mp.src || 'eigenes Bild', date: mp.date || 'ohne Datum', slotId: 'map-' + mp.id, ph: 'Karte oder Foto antippen', innerStyle: { position: 'relative', width: z * 100 + '%', aspectRatio: '4 / 3' }, zoomText: `Zoom ${Math.round(z * 100)} %`,
      zoomIn: () => app.setState((s: any) => ({ zoom: { ...s.zoom, [mp.id]: Math.min(3, (s.zoom[mp.id] || 1) + 0.5) } })), zoomOut: () => app.setState((s: any) => ({ zoom: { ...s.zoom, [mp.id]: Math.max(1, (s.zoom[mp.id] || 1) - 0.5) } })),
      editing, toggleEdit: () => app.setState({ mapEdit: editing ? null : mp.id }), editLabel: editing ? 'Fertig' : 'Spot markieren', editBtn: { height: 48, padding: '0 14px', borderRadius: 14, border: editing ? '0' : '1.5px solid var(--ink)', background: editing ? 'var(--orange)' : 'transparent', color: editing ? 'var(--onorange)' : 'var(--ink)', font: '700 14px Archivo, sans-serif', cursor: 'pointer' },
      tapAdd: (e: any) => { const r = e.currentTarget.getBoundingClientRect(); const x = ((e.clientX - r.left) / r.width) * 100, y = ((e.clientY - r.top) / r.height) * 100; const sym = st.mapSym; app.setV3({ maps: { ...V.maps, [W.slug]: V.maps[W.slug].map((q: any) => (q.id === mp.id ? { ...q, marks: [...(q.marks || []), { x, y, t: sym, spot: mapSpot }] } : q)) } }); app.toastMsg(`${SYM[sym][0]} markiert${mapSpot ? `, verknüpft mit ${mapSpot}` : ''}`); },
      undoMark: () => app.setV3({ maps: { ...V.maps, [W.slug]: V.maps[W.slug].map((q: any) => (q.id === mp.id ? { ...q, marks: (q.marks || []).slice(0, -1) } : q)) } }),
      marks: (mp.marks || []).map((k: any) => ({ t: SYM[k.t][1], style: { position: 'absolute', left: k.x + '%', top: k.y + '%', width: 30, height: 30, marginLeft: -15, marginTop: -15, borderRadius: '50%', background: SYM[k.t][2], color: '#fff', border: '2px solid #fff', font: '800 11px/26px Archivo, sans-serif', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.45)', pointerEvents: 'none', zIndex: 2 } })),
      legend: (mp.marks || []).map((k: any) => ({ t: `${SYM[k.t][1]} · ${SYM[k.t][0]}`, v: k.spot ? `Spot ${k.spot}` : 'ohne Spot' })),
      levelLine: mp.level ? `Wasserstand bei Aufnahme: ${mp.level}` : 'Wasserstand bei Aufnahme nicht notiert',
      convLine: [mp.note, 'Umrechnung auf heute folgt, sobald die App einen aktuellen Pegelwert hat.'].filter(Boolean).join(' '),
      edit: () => app.openForm('map', { id: mp.id, title: mp.title, src: mp.src || '', date: mp.date || '', level: mp.level || '', note: mp.note || '' }, false),
    };
  }) : [];
  const symOpts = Object.entries(SYM).map(([k, v]: any) => ({ label: v[0], pick: () => app.setState({ mapSym: k }), style: { ...chip(st.mapSym === k), height: 44 } }));
  const spotOpts = spotsW.map((s: any) => ({ label: s.name, pick: () => app.setState({ mapSpot: s.name }), style: { ...chip(mapSpot === s.name), height: 44 } }));
  const spotProf = spotsW.map((s: any) => {
    const depths = sessions.filter((x) => W && x.gewaesser === W.slug).flatMap((x) => events(x).filter((e) => e.spot === s.name && num(e.tiefeM) != null).map((e) => num(e.tiefeM)!));
    return { title: s.name, rows: [
      { k: 'Struktur', v: fmtAny(s.struktur) || 'nicht beschrieben', src: 'Steckbrief aus dem Fangbuch' },
      { k: 'Tiefe', v: [fmtAny(s.tiefe) ? `laut Steckbrief ${fmtAny(s.tiefe)}` : '', depths.length ? `gemessen ${de(depths.reduce((a, b) => a + b, 0) / depths.length)} m (${n(depths.length, 'Eintrag', 'Einträge')})` : ''].filter(Boolean).join(' · ') || 'noch keine Angabe', src: 'Steckbrief und deine Einträge' },
      { k: 'Grund', v: fmtAny(s.grund) || 'nicht beschrieben', src: 'Steckbrief aus dem Fangbuch' },
    ] };
  });
  const wsAll = W ? sessions.filter((s) => s.gewaesser === W.slug) : [];
  const wa = agg(wsAll);
  const wStats = [{ k: 'Sessions', v: wsAll.length }, { k: 'Nullrunden', v: wa.zero }, { k: 'Bisse/h', v: de(wa.bph) }, { k: 'Fänge', v: wa.c }];
  const wSessions = wsAll.map(sv);
  const wf = W ? sessions.filter((s) => s.gewaesser === W.slug && s.zielfisch === fish) : [];
  const phaseOn = (s: any, ph: string) => { const sp = spanOf(s); if (!sp || sp.e == null) return false; const r = phaseRanges(sp.b, sp.e, sunsetOf(s, W, settings))[ph]; return r[1] > r[0]; };
  const cell = (c: number, tap: () => void) => ({ n: c === 0 ? '+' : String(c), tap, style: { height: 40, borderRadius: 8, cursor: 'pointer', font: '700 13px Archivo, sans-serif', minWidth: 0, ...(c === 0 ? { border: '1.5px dashed var(--muted)', background: 'transparent', color: 'var(--muted)' } : c < 3 ? { border: '1px solid var(--reed)', background: 'repeating-linear-gradient(135deg, color-mix(in oklab, var(--reed) 45%, transparent) 0 4px, transparent 4px 8px)', color: 'var(--ink)' } : { border: '1px solid var(--reed)', background: 'var(--reed)', color: 'var(--onreed)' }) } });
  const gapTap = (kind: string, row: string, col: string, c: number) => () => (c >= 3 ? app.toastMsg(`Hier weißt du schon einiges: ${c} Sessions`) : app.setState({ sheet: 'gap', gap: { kind, row, col, n: c } }));
  const TB = ['klar', 'leicht trüb', 'trüb', 'stark trüb'];
  const gcols = (c: number) => ({ display: 'grid', gridTemplateColumns: `84px repeat(${c},minmax(0,1fr))`, gap: 4 });
  const grids = W && A && A.methods.length && !absent ? [
    { title: 'Methode und Licht', headStyle: gcols(3), cols: LIGHT.map((t) => ({ t })), rows: A.methods.slice(0, 6).map((m: any) => ({ label: SHORT[m.id], cells: LIGHT.map((ph) => { const c = wf.filter((s) => segments(s).some((sg) => sg.method === m.id) && phaseOn(s, ph)).length; return cell(c, gapTap('m', m.id, ph, c)); }) })) },
    { title: 'Köderfarbe und Trübung', headStyle: gcols(4), cols: TB.map((t) => ({ t })), rows: Object.keys(FAM).map((k) => ({ label: FSHORT[k], cells: TB.map((tb) => { const c = wf.filter((s) => segments(s).some((sg) => sg.fam === k) && turbOf(s.beobachtungen?.sichttiefe) === tb).length; return cell(c, gapTap('c', k, tb, c)); }) })) },
  ] : [];

  // Lizenzen, Regeln, Steckbrief
  const wLic = W ? licW(W.slug).map((l: any) => ({ ...l, edit: () => app.openForm('lic', V.lics.find((x: any) => x.id === l.id), false) })) : [];
  const otherLic = W ? V.lics.filter((l: any) => !(l.waters || []).includes(W.slug)).map((l: any) => ({ label: `${l.type} (${(l.waters || []).map(short).join(', ') || 'ohne Gewässer'})`, assign: () => { app.setV3({ lics: V.lics.map((x: any) => (x.id === l.id ? { ...x, waters: [...(x.waters || []), W.slug] } : x)) }); app.toastMsg(`${l.type} jetzt auch für ${short(W.slug)}`); } })) : [];
  const rulesW = W ? rulesOf(W.slug) : [];
  const rulesTab = rulesW.map((r: any) => { const on = inSchon(r.von, r.bis); return { art: r.max ? `${r.art} · Höchstmaß ${r.max} cm` : r.art, schon: r.von ? `${r.von} bis ${r.bis}` : 'keine', mass: [r.min ? `${r.min} cm` : 'kein Mindestmaß', r.limit ? `${r.limit} pro Tag` : ''].filter(Boolean).join(', '), today: on ? 'Schonzeit' : 'frei', todayStyle: { font: '800 12px/1 Archivo, sans-serif', padding: '6px 4px', borderRadius: 7, textAlign: 'center', background: on ? 'var(--minus)' : 'transparent', color: on ? 'var(--surface)' : 'var(--plus)', border: on ? '1.5px solid var(--minus)' : '1.5px solid var(--plus)' }, edit: () => app.openForm('rule', r, false) }; });
  const parsed = W ? parseRegeln(W.regeln || [], uniq([...ZIELFISCHE, ...(W.zielfische || []), ...(W.fischarten || [])])) : { rest: [] };
  const restr = (W ? (V.rules[W.slug] ? (W.regeln || []).map((x: any) => (typeof x === 'string' ? x : fmtAny(x))) : parsed.rest) : []).map((t: string) => ({ k: 'Regel laut Fangbuch', v: t, src: 'Steckbrief aus dem Fangbuch', stand: W && W.aktualisiert ? dayLabel(parseDate(W.aktualisiert)) : 'unbekannt' }));
  const rulesSrc = rulesW.length ? `Quellen: ${uniq(rulesW.map((r: any) => [r.quelle, r.stand].filter(Boolean).join(', '))).join('; ') || 'eigene Eingabe'}.` : 'Noch keine Regeln je Fischart. Leg sie an, dann warnt die App bei Schonzeit und prüft beim Fang das Mindestmaß.';
  const steck = W ? {
    facts: [['Typ', W.typ], ['Lage', W.lage], ['Erlaubnis', W.verein], ['Tide', W.tide], ['Angelart', W.angelart], ['Zielfische', (W.zielfische || []).join(', ')], ['Fischarten', (W.fischarten || []).join(', ')], ['Beschreibung', fmtAny(W.beschreibung)]].filter(([, v]) => v).map(([k, v]) => ({ k, v })),
    insights: (W.erkenntnisse || []).map((x: any) => typeof x === 'object' ? { t: x.text || fmtAny(x), n: [num(x.sessions) != null ? `Aus ${n(num(x.sessions)!, 'Session', 'Sessions')}` : '', x.stand ? `Stand ${dayLabel(parseDate(x.stand))}` : ''].filter(Boolean).join(', ') || 'aus dem Fangbuch' } : { t: String(x), n: 'aus dem Fangbuch' }),
    hyp: (W.hypothesen || []).map((x: any) => typeof x === 'object' ? { t: x.text || x.titel || fmtAny(x), n: x.status ? `Status: ${x.status}` : 'Offen' } : { t: String(x), n: 'Offen' }),
    vors: st.empfehlungen.filter((e: any) => e.gewaesser === W.slug).sort(vSort).map((e: any) => ({ t: e.titel || 'Vorschlag', n: [STATUS[vStatus(e)], e.zielfisch ? `auf ${fmtAny(e.zielfisch)}` : '', e.vertrauen ? `Vertrauen ${fmtAny(e.vertrauen)}` : ''].filter(Boolean).join(' · '), text: fmtAny(e.empfehlung) })),
  } : { facts: [], insights: [], hyp: [], vors: [] };
  (steck as any).noInsights = !steck.insights.length;
  (steck as any).noFacts = !steck.facts.length;

  const show: any = {}, sec2: any = {};
  const ALW = ['plan', 'methoden', 'farben'], OKA = ['spots', 'karten', 'sessions', 'regeln', 'steckbrief'];
  ['plan', 'methoden', 'farben', 'spots', 'karten', 'sessions', 'regeln', 'steckbrief'].forEach((k) => { show[k] = cur === 'water' && !!W && (!(absent || noFach) || OKA.includes(k)); sec2[k] = show[k] && (ALW.includes(k) || !!st.open[k]); });
  const tg: any = {}, chev: any = {};
  ['plan', 'spots', 'karten', 'sessions', 'regeln', 'steckbrief', 'conds'].forEach((k) => { tg[k] = () => app.setState((s: any) => ({ open: { ...s.open, [k]: !s.open[k] } })); chev[k] = st.open[k] ? '−' : '+'; });
  const nMaps = W ? (V.maps[W.slug] || []).length : 0;
  const sum = { spots: `${n(spotsW.length, 'Spot', 'Spots')}${spotsW.length ? ' mit Bilanz' : ''}`, karten: nMaps ? `${n(nMaps, 'Karte', 'Karten')}, offline gespeichert` : 'Noch keine Karte', sessions: `${n(wsAll.length, 'Session', 'Sessions')} · ${de(wa.bph)} Bisse/h · Wissensstand`, regeln: `${n(W ? licW(W.slug).length : 0, 'Lizenz', 'Lizenzen')} · ${rulesW.length ? 'Schonzeiten, Maße' : 'Regeln anlegen'}`, steckbrief: 'Stammdaten, Erkenntnisse, Vorschläge' };

  /* ---------- Methoden-Detail ---------- */
  let md: any = {};
  if (is.method && W && A) {
    const fk = fishKey(fish) || '_';
    const D = DET[st.m];
    const mm = A.methods.find((x: any) => x.id === st.m) || { score: 30, own: 0, basis: 'Fachwissen' };
    const cr = A.colors[0];
    const mine = sessions.filter((s) => s.gewaesser === W.slug && segments(s).some((sg) => sg.method === st.m));
    let mMin = 0, mB = 0, mC = 0;
    mine.forEach((s) => segments(s).filter((sg) => sg.method === st.m).forEach((sg) => { mMin += sg.min; mB += sg.bites; }));
    mine.forEach((s) => { mC += events(s).filter((e) => e.typ === 'fang' && methodOfLabel(s, e) === st.m).length; });
    const actives = app.combos();
    const words: Record<string, RegExp> = { faul: /faulenz|gummi|jig|shad/i, drop: /drop|finesse/i, texas: /texas|carolina|rig/i, wob: /wobbler|crank/i, jerk: /jerk|glide|twitch/i, spin: /spinner(?!bait)/i, blink: /blinker/i, sbait: /spinnerbait/i };
    const cmb = actives.find((c: any) => words[st.m].test(c.use || '') || words[st.m].test(c.name || '')) || actives[0];
    const su = cmb ? app.comboSetup(cmb.id) : null;
    const combo = su ? { rod: su.name + (su.rute && su.rute !== su.name ? ` · ${su.rute}` : ''), reel: su.rolle || 'Rolle nicht eingetragen', line: su.hauptschnur || 'nicht eingetragen', leader: su.vorfach || 'nicht eingetragen' } : { rod: 'Keine Kombo im Einsatz', reel: 'Stell unter „Mehr › Ausrüstung“ eine zusammen.', line: '–', leader: '–' };
    const missing = [D.missing?.[fk], !cmb ? '' : !actives.some((c: any) => words[st.m].test(c.use || '') || words[st.m].test(c.name || '')) ? `Keine Kombo ist für ${SHORT[st.m]} vermerkt. Trag unter Ausrüstung bei „Einsatz“ ein, wofür eine Kombo gedacht ist.` : ''].filter(Boolean).join(' ');
    const bestSpot = [...A.spots].sort((a: any, b: any) => b.score - a.score)[0];
    md = {
      ctx: `${W.name} · ${fish}`, backLabel: 'Zurück', name: MN[st.m].name, tech: MN[st.m].tech, score: mm.score, own: mm.own, basis: mm.basis,
      factors: [...D.plus.map((t: string) => ({ t, icon: '+', iconStyle: icon('var(--plus)') })), ...D.minus.map((t: string) => ({ t, icon: '−', iconStyle: icon('var(--minus)') }))],
      bait: [{ k: 'Typ', v: D.type }, { k: 'Größe', v: pickF(D.size, fk) }, { k: 'Gewicht', v: pickF(D.wt, fk) }, { k: 'Haken', v: fk === 'hecht' && st.m === 'faul' ? 'Jigkopf 5/0, Stahlvorfach' : D.head }],
      colName: cr ? `${cr.name} (${cr.ex.split(',')[0]})` : '', colSw: cr ? cr.sw : [], rh: rhythm(D), biteNote: D.biteNote, steps: D.steps.map((t: string, i: number) => ({ n: i + 1, t })),
      combo, leader: fk === 'hecht' && !/stahl|titan/i.test(combo.leader) ? 'Stahl oder Titan, 30 cm' : combo.leader, missing, hasMissing: !!missing,
      bestSpot: bestSpot ? bestSpot.name : 'Noch keine Spots', win: A.win.text,
      results: [{ k: 'Sessions', v: mine.length }, { k: 'Bisse/h', v: mMin ? de(mB / (mMin / 60)) : '–' }, { k: 'Fänge', v: mC }],
      sources: [{ t: `Fachwissen: Grundwert für ${fish}${W.typ ? ', ' + W.typ : ''}` }, { t: mine.length ? `Eigene Sessions: ${mine.map((s) => dayLabel(parseDate(s.datum))).join(', ')}` : 'Eigene Sessions: noch keine mit dieser Methode' }, { t: 'Zeitfenster: berechnet aus dem Sonnenuntergang' }],
    };
  }

  /* ---------- Fangbuch und Session-Detail ---------- */
  const legend = [['c', 'Fang'], ['f', 'Fehlbiss'], ['a', 'Aussteiger'], ['n', 'Nachläufer']].map(([t, l]) => ({ t: l, style: dot(t) }));
  const book = sessions.map(sv);
  const ba = agg(sessions);
  const bookSummary = sessions.length ? `${n(sessions.length, 'Session', 'Sessions')} · ${n(ba.zero, 'Nullrunde', 'Nullrunden')}${openS.length ? ` · ${openS.length} nicht übertragen` : ''}` : 'Noch keine Sessions';
  let sd: any = {};
  const S = sessions.find((s) => s.appId === st.sid);
  if (is.session && S) {
    const sa = statsOf(S);
    const Bo = S.beobachtungen || {};
    const tl = timeline(S, true);
    const kindStyle = (k: string) => ({ font: '700 11px/1 Archivo, sans-serif', padding: '6px 8px', borderRadius: 7, whiteSpace: 'nowrap', flex: 'none', ...(k === 'gemessen' ? { background: 'var(--reed)', color: 'var(--onreed)', border: '1.5px solid var(--reed)' } : k === 'berechnet' ? { background: 'transparent', color: 'var(--ink)', border: '1.5px solid var(--ink)' } : { background: 'transparent', color: 'var(--muted)', border: '1.5px dashed var(--muted)' }) });
    const U = S.umwelt || {};
    const env = [
      ['Wassertemperatur', num(Bo.wassertemp) != null ? `${de(num(Bo.wassertemp)!)} °C` : '', 'eigene Messung', 'gemessen', 'selbst beobachtet'],
      ['Sichttiefe', num(Bo.sichttiefe) != null ? `${Bo.sichttiefe} cm, ${turbOf(Bo.sichttiefe)}` : '', 'eigene Messung', 'gemessen', 'selbst beobachtet'],
      ['Sonnenuntergang', tl.ss, toMin(U.sonnenuntergang) != null ? 'aus dem Fangbuch' : 'Sonnenstand für den Ort', 'berechnet', 'automatisch'],
      ['Position beim Start', S.koordinaten ? `${S.koordinaten.lat}, ${S.koordinaten.lon}` : '', 'GPS', 'gemessen', 'automatisch'],
      ...Object.entries(U).filter(([k, v]) => k !== 'sonnenuntergang' && v != null && v !== '').map(([k, v]) => [labelOf(k), fmtAny(v), 'aus dem Fangbuch', 'recherchiert', 'Fangbuch']),
    ].filter((r) => r[1]).map(([k, v, src, kind, origin]) => ({ k, v, src, kind, origin, stamp: dayLabel(parseDate(S.datum)), tagStyle: kindStyle(kind as string) }));
    const su = S.setup || {};
    sd = {
      ...tl, dl: dayLabel(parseDate(S.datum)), long: parseDate(S.datum) ? DF_LONG.format(parseDate(S.datum)!) : S.datum, st: S.beginn, en: S.ende || 'läuft', waterName: gwName(S), fish: S.zielfisch || 'ohne Zielfisch', spot: S.spot || 'ohne Spot', angelart: S.angelart || '',
      status: isLive(S) ? 'läuft' : isDone(S) ? `übertragen am ${dayLabel(new Date(S._uebertragenAm))}` : 'nicht übertragen',
      kpis: [{ k: 'Stunden', v: de((sa.min || 0) / 60) }, { k: 'Bisse', v: sa.bisse }, { k: 'Fänge', v: sa.faenge }, { k: 'Bisse/h', v: sa.min ? de(sa.bisse / (sa.min / 60)) : '–' }],
      koeder: (S.koeder || []).map((k: any) => ({ t: k.zeit || '', title: k.label || koederText(k), sub: [koederText(k) !== (k.label || '') ? koederText(k) : '', koederExtra(k)].filter(Boolean).join(' · '), sw: { width: 28, height: 28, borderRadius: 8, background: swatchFor(famKey(k)), border: '1px solid var(--line)', flex: 'none' } })),
      noKoeder: !(S.koeder || []).length,
      setup: [su.kombo, su.hauptschnur, su.vorfach ? `Vorfach ${su.vorfach}` : ''].filter(Boolean).join(' · '),
      events: events(S).map((e) => ({ t: e.zeit, label: (TYP[e.typ] || e.typ) + [e.art ? ` · ${e.art}` : '', e.laengeCm ? ` ${e.laengeCm} cm` : '', e.typ === 'fang' ? (e.entnommen ? ', entnommen' : ', zurückgesetzt') : ''].join(''), sub: [e.koeder ? `Köder: ${e.koeder}` : '', e.spot && e.spot !== S.spot ? `Spot: ${e.spot}` : '', num(e.tiefeM) != null ? `Tiefe ${de(num(e.tiefeM)!)} m` : '', e.notiz, e.koordinaten ? `Position ${e.koordinaten.lat}, ${e.koordinaten.lon}` : ''].filter(Boolean).join(' · '), bild: bildId(e.bild), dot: dot(typChar(e.typ)) })),
      zero: sa.bisse === 0 && !isLive(S),
      notes: (S.notizen || []).map((x: any) => ({ t: x.zeit, text: x.text })), hasNotes: !!(S.notizen || []).length,
      eindruck: S.eindruck || '', naechstesMal: S.naechstesMal || '',
      env, canEdit: !isDone(S) && !isLive(S), isLive: isLive(S), edit: () => app.openEditor(S), openLive: () => app.nav('live'), appId: S.appId,
      goTransfer: () => app.nav('data'),
    };
  }

  /* ---------- Auswertung ---------- */
  const fl = sessions.filter((s) => !isLive(s) && (st.filtW === 'alle' || s.gewaesser === st.filtW) && (st.filtF === 'alle' || s.zielfisch === st.filtF));
  const fW = [['alle', 'Alle Gewässer'], ...uniq(sessions.map((s) => s.gewaesser)).map((g) => [g, short(g)])].map(([k, l]) => ({ label: l, pick: () => app.setState({ filtW: k }), style: chip(st.filtW === k) }));
  const fF = [['alle', 'Alle Fische'], ...uniq(sessions.map((s) => s.zielfisch)).map((f) => [f, f])].map(([k, l]) => ({ label: l, pick: () => app.setState({ filtF: k }), style: chip(st.filtF === k) }));
  const fa = agg(fl);
  const statKpis = [{ k: 'Sessions', v: fl.length }, { k: 'Stunden', v: de(fa.h) }, { k: 'Bisse/h', v: de(fa.bph) }];
  const row = (label: string, h: number, b: number, c: number) => { const bph = h ? b / h : 0; const thin = c < 3; const w = Math.min(100, (bph / 3) * 100); return { label, val: `${de(bph)} /h`, n: `${n(c, 'Session', 'Sessions')}, ${de(h)} h${thin ? ' · dünne Basis' : ''}`, wrap: { display: 'flex', flexDirection: 'column', gap: 5, opacity: thin ? 0.55 : 1 }, bar: { height: '100%', width: Math.max(w, 2) + '%', borderRadius: 5, background: thin ? 'repeating-linear-gradient(135deg, var(--reed) 0 5px, transparent 5px 9px)' : 'var(--reed)' } }; };
  const byKey = (fn: (s: any) => any) => { const m: Record<string, any[]> = {}; fl.forEach((s) => { const k = fn(s); if (k == null || k === '') return; (m[k] = m[k] || []).push(s); }); return Object.entries(m).map(([k, l]) => ({ k, ...agg(l), c: l.length })).sort((a, b) => b.bph - a.bph).map((r) => row(r.k, r.h, r.b, r.c)); };
  const bySeg = (fn: (sg: any) => string | null) => { const m: Record<string, { min: number; b: number; ids: Set<string> }> = {}; fl.forEach((s) => segments(s).forEach((sg) => { const k = fn(sg); if (!k) return; const e = (m[k] = m[k] || { min: 0, b: 0, ids: new Set() }); e.min += sg.min; e.b += sg.bites; e.ids.add(s.appId); })); return Object.entries(m).map(([k, v]) => ({ k, h: v.min / 60, b: v.b, c: v.ids.size, bph: v.min ? v.b / (v.min / 60) : 0 })).sort((a, b) => b.bph - a.bph).map((r) => row(r.k, r.h, r.b, r.c)); };
  const lightRows = (() => { const ph: Record<string, any> = { Tag: { h: 0, b: 0, c: 0 }, Dämmerung: { h: 0, b: 0, c: 0 }, Dunkelheit: { h: 0, b: 0, c: 0 } }; fl.forEach((s) => { const sp = spanOf(s); if (!sp || sp.e == null) return; const R = phaseRanges(sp.b, sp.e, sunsetOf(s, gwBy(s.gewaesser), settings)); Object.entries(R).forEach(([k, [x, y]]) => { if (y > x) { ph[k].h += (y - x) / 60; ph[k].c++; ph[k].b += events(s).filter((ev) => BISS.includes(ev.typ) && evMin(ev, sp.b)! >= x && evMin(ev, sp.b)! < y).length; } }); }); return Object.entries(ph).filter(([, v]) => v.c).map(([k, v]) => row(k, v.h, v.b, v.c)); })();
  const wtB = (v: number) => (v < 8 ? 'unter 8 °C' : v < 12 ? '8 bis 12 °C' : v <= 16 ? '12 bis 16 °C' : 'über 16 °C');
  const groups = [
    ['Licht', lightRows], ['Methode', bySeg((sg) => sg.method && MN[sg.method].tech)], ['Köderfarbe', bySeg((sg) => sg.fam && FAM[sg.fam].name)],
    ['Spot', byKey((s) => s.spot ? `${short(s.gewaesser)} ${s.spot}` : null)], ['Wassertemperatur', byKey((s) => (num(s.beobachtungen?.wassertemp) != null ? wtB(num(s.beobachtungen.wassertemp)!) : null))],
    ['Trübung', byKey((s) => turbOf(s.beobachtungen?.sichttiefe))], ['Angelart', byKey((s) => s.angelart)], ['Setup', byKey((s) => s.setup?.kombo || null)],
    ['Wochentag', byKey((s) => { const d = parseDate(s.datum); return d ? (d.getDay() === 0 || d.getDay() === 6 ? 'Wochenende' : 'Werktag') : null; })],
    ['Monat', byKey((s) => { const d = parseDate(s.datum); return d ? d.toLocaleDateString('de-DE', { month: 'long' }) : null; })],
    ...['luftdruck', 'wind', 'bewoelkung', 'mond', 'tide', 'wasserstand'].map((k) => [labelOf(k), byKey((s) => (s.umwelt && s.umwelt[k] != null ? String(fmtAny(s.umwelt[k])).split(',')[0] : null))]),
  ].map(([title, rows]: any) => ({ title, rows, empty: rows.length === 0 })).filter((g, i) => i < 10 || !g.empty);

  /* ---------- Mehr, Ausrüstung, Köderbox ---------- */
  const G2 = V.gear || { rods: [], reels: [], lines: [], leaders: [], combos: [] };
  const gi = (arr: string, id: string) => (G2[arr] || []).find((x: any) => x.id === id);
  const stBadge = (a: boolean) => ({ font: '700 11px/1 Archivo, sans-serif', padding: '6px 8px', borderRadius: 7, flex: 'none', whiteSpace: 'nowrap', ...(a ? { color: 'var(--plus)', border: '1.5px solid var(--plus)' } : { color: 'var(--muted)', border: '1.5px dashed var(--muted)' }) });
  const gcard = (a: boolean) => ({ textAlign: 'left', cursor: 'pointer', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--ink)', opacity: a ? 1 : 0.6, width: '100%' });
  const gt = V.gtab || 'combos';
  let gearList: any[] = [];
  if (gt === 'combos') gearList = G2.combos.map((c: any) => {
    const r = gi('rods', c.rod), re = gi('reels', c.reel), l = gi('lines', c.line), v = gi('leaders', c.leader);
    const a = c.status !== 'aussortiert' && (!r || r.status !== 'aussortiert') && (!re || re.status !== 'aussortiert');
    const ss = sessions.filter((s) => s.setup?.setupId === c.id);
    const ag = agg(ss);
    return { title: c.name || (r ? r.modell : 'Kombo'), sub: [r ? [r.modell, r.laenge].filter(Boolean).join(' ') : 'Rute fehlt', re ? re.modell : null, l ? [l.typ, l.tragkraft].filter(Boolean).join(', ') : null, v ? [v.material, v.staerke].filter(Boolean).join(' ') : null].filter(Boolean).join(' · '), status: a ? 'im Einsatz' : 'aussortiert', badge: stBadge(a), hasExtra: !!c.use, extra: `Für: ${c.use}`, hasBil: true, bil: [{ k: 'Sessions', v: ss.length }, { k: 'Fänge', v: ag.c }, { k: 'Bisse/h', v: ss.length ? de(ag.bph) : '–' }], cardStyle: gcard(a), open: () => app.openForm('combos', c, false) };
  });
  else gearList = (G2[gt] || []).map((x: any) => {
    const a = x.status !== 'aussortiert';
    const c = G2.combos.filter((k: any) => [k.rod, k.reel, k.line, k.leader].includes(x.id)).length;
    const title = gt === 'lines' ? x.typ : gt === 'leaders' ? x.material : x.modell;
    const sub = gt === 'rods' ? [x.laenge, x.wg, x.aktion, x.spitze ? `Spitze ${x.spitze}` : ''].filter(Boolean).join(', ') : gt === 'reels' ? [x.groesse ? `Größe ${x.groesse}` : '', x.uebers ? `Übersetzung ${x.uebers}` : ''].filter(Boolean).join(', ') : gt === 'lines' ? [x.tragkraft, x.farbe].filter(Boolean).join(', ') : x.staerke;
    return { title: title || 'ohne Namen', sub: sub || 'Noch keine Details', status: a ? 'im Einsatz' : 'aussortiert', badge: stBadge(a), hasExtra: c > 0 || !!x.notiz, extra: [c ? `In ${c === 1 ? 'einer Kombo' : c + ' Kombos'}` : null, x.notiz || null].filter(Boolean).join(' · '), hasBil: false, bil: [], cardStyle: gcard(a), open: () => app.openForm(gt, x, false) };
  });
  const KL: any = { combos: 'Kombo', rods: 'Rute', reels: 'Rolle', lines: 'Schnur', leaders: 'Vorfach' };
  const gearTabs = [['combos', 'Kombos'], ['rods', 'Ruten'], ['reels', 'Rollen'], ['lines', 'Schnüre'], ['leaders', 'Vorfächer']].map(([k, l]) => ({ label: l, pick: () => app.setV3({ gtab: k }), style: chip(gt === k) }));
  const gearNew = () => { const id = gt[0] + uuid().slice(0, 8); app.openForm(gt, gt === 'combos' ? { id, name: '', rod: null, reel: null, line: null, leader: null, use: '', status: 'aktiv' } : { id, status: 'aktiv', notiz: '' }, true); };
  const swS = (c: string) => ({ width: 34, height: 34, borderRadius: 10, background: c, border: '1px solid var(--line)', flex: 'none' });
  const BX = V.boxes.find((b: any) => b.id === st.boxId) || V.boxes[0];
  const boxList = V.boxes.map((b: any) => { const on = V.todayBox === b.id; return { name: b.name, slotId: 'box-' + b.id, count: `${b.items.reduce((q: number, i: any) => q + (i.n || 0), 0)} Köder, ${n(b.items.length, 'Sorte', 'Sorten')}`, sw: b.items.slice(0, 12).map((i: any) => ({ style: { width: 22, height: 22, borderRadius: 6, background: i.sw, border: '1px solid var(--line)' } })), todayLabel: on ? 'Heute dabei ✓' : 'Heute dabei', todayStyle: { height: 48, borderRadius: 14, border: on ? '0' : '1.5px solid var(--ink)', background: on ? 'var(--orange)' : 'transparent', color: on ? 'var(--onorange)' : 'var(--ink)', font: '700 15px Archivo, sans-serif', cursor: 'pointer' }, pickToday: () => app.setV3({ todayBox: b.id }), open: () => app.nav('box', { boxId: b.id }), cardStyle: { background: 'var(--surface)', border: on ? '2px solid var(--orange)' : '1px solid var(--line)', borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column' } }; });
  const bx = BX ? { name: BX.name, slotId: 'box-' + BX.id, count: n(BX.items.length, 'Sorte', 'Sorten'), list: (V.boxView || 'liste') === 'liste', tiles: V.boxView === 'kacheln', items: BX.items.map((i: any) => ({ title: [i.type, i.model].filter(Boolean).join(' ') || 'Köder', col: i.col || 'Foto', spec: [i.size, i.wt, i.col].filter(Boolean).join(', ') || 'ohne Angaben', n: i.n, sw: swS(i.sw), slotId: 'item-' + i.id, open: () => app.openForm('item', i, false) })), rename: () => app.openForm('box', BX, false), empty: !BX.items.length } : { items: [], name: '' };
  const viewOpts = [['liste', 'Liste'], ['kacheln', 'Kacheln']].map(([k, l]) => ({ label: l, pick: () => app.setV3({ boxView: k }), style: { ...chip((V.boxView || 'liste') === k, true), height: 44 } }));
  const themeOpts = [['light', 'Hell'], ['dark', 'Dunkel']].map(([k, l]) => ({ label: l, pick: () => app.setV3({ theme: k }), style: { ...chip(theme === k, true) } }));
  const actCombos = app.combos().length;

  /* ---------- Daten ---------- */
  const lb = st.lastBackup ? new Date(st.lastBackup) : null;
  const dataVm = {
    offline: st.offline, storage: st.storage,
    stale: stale.length ? `${stale.length === 1 ? 'Eine Session wartet' : stale.length + ' Sessions warten'} seit über ${STALE_DAYS} Tagen. Übertrag sie bald, damit Claude Wetter, Luftdruck und Tide noch sauber nachschlagen kann.` : '',
    pending: st.pending ? `Am ${DF_TS.format(new Date(st.pending.at))} hast du ${n(st.pending.sessions.length, 'Session', 'Sessions')}${st.pending.gewaesser.length ? ' und Angaben zu ' + n(st.pending.gewaesser.length, 'Gewässer', 'Gewässern') : ''} exportiert. Bestätige erst, wenn Claude sie im Projekt „Angeln“ ins Fangbuch übernommen hat.` : '',
    pendingYes: () => app.confirmPending(true), pendingNo: () => app.confirmPending(false),
    list: [...openS.map((s: any) => ({ a: dayLabel(parseDate(s.datum)), b: `${gwName(s)}${s.spot ? ', ' + s.spot : ''}: ${resOf(s)}` })), ...app.openGw().map((g: any) => ({ a: 'neu', b: `Gewässer ${g.name}` })), ...app.spotGw().map((g: any) => ({ a: 'Spots', b: `${g.name}: ${g._neueSpots.join(', ')}` }))],
    nothing: !pend, liveRunning: !!live, exp: st.exp, canShare: !!navigator.share,
    makeExport: () => app.makeExport(), shareFile: () => app.shareExport(true), shareText: () => app.shareExport(false), copy: () => app.copyExport(),
    importText: st.importText, setImportText: (v: string) => app.setState({ importText: v }), doImport: () => app.doImport(st.importText), importFile: () => app.importFile(), importMsg: st.importMsg,
    counts: `Auf dem Handy: ${n(gws.length, 'Gewässer', 'Gewässer')}, ${n(st.empfehlungen.length, 'Vorschlag', 'Vorschläge')}, ${n(actCombos, 'Kombo', 'Kombos')} im Einsatz.`,
    backupText: lb ? `Letzte Sicherung: ${DF_TS.format(lb)}` : 'Noch keine Sicherung erstellt.', doBackup: () => app.doBackup(), pickRestore: () => app.pickRestore(),
    restore: st.restore ? `Sicherung vom ${st.restore.erstellt ? DF_TS.format(new Date(st.restore.erstellt)) : 'unbekannten Datum'}: ${n(st.restore.sessions.length, 'Session', 'Sessions')}, ${n((st.restore.gewaesser || []).length, 'Gewässer', 'Gewässer')}, ${n((st.restore.empfehlungen || []).length, 'Vorschlag', 'Vorschläge')}, ${n((st.restore.bilder || []).length, 'Bild', 'Bilder')}.` : '',
    restoreYes: () => app.doRestore(), restoreNo: () => app.setState({ restore: null }),
    gps: !!settings.gps, setGps: (v: boolean) => app.setGps(v), sunPosText: settings.sunPos ? `Gespeichert: ${de(settings.sunPos.lat, 2)}, ${de(settings.sunPos.lon, 2)}` : 'Nicht gesetzt. Die App rechnet mit der Mitte Deutschlands, außer ein Gewässer oder eine Session hat eine Position.', setSunPos: () => app.setSunPos(), sunPosLabel: settings.sunPos ? 'Neu bestimmen' : 'Festlegen',
  };

  /* ---------- Sheets ---------- */
  const sheet = st.sheet;
  const lastEv = live && st.evIdx != null ? live.ereignisse[st.evIdx] : null;
  const sh = { form: sheet === 'form' && !!st.form, confirm: sheet === 'confirm' && !!st.form, start: sheet === 'start' && !!st.start, catch: sheet === 'ev' && !!lastEv, bait: sheet === 'bait' && !!st.bait && !!live, note: sheet === 'note', end: sheet === 'end', add: sheet === 'add' && !!st.add, testres: sheet === 'testres' && !!(live && live._tests && live._tests[st.trIdx]), gap: sheet === 'gap' && !!st.gap };

  // Start
  let startVm: any = {};
  if (sh.start) {
    const F = st.start;
    const g = gwBy(F.w);
    const fishes = uniq([...(g?.zielfische || []), ...ZIELFISCHE]).concat('Andere');
    const ms = g ? methodsFor(g, F.f, sessions, runs) : [];
    const nl = g && licW(g.slug).find((l: any) => l.state === 'expired');
    const rr = g && schonOf(g.slug, F.f);
    const recBox = g && ms.length ? boxRec(todayBox, g, F.f, ms, colorRank(app.adv(g.slug), g, F.f, sessions, runs), spotStats(g, sessions)) : { items: [] };
    startVm = {
      waters: [...gws.map((X) => ({ name: X.name || X.slug, word: licW(X.slug).some((l: any) => l.state === 'expired') ? 'keine Lizenz' : WORD(methodsFor(X, app.mainFish(X), sessions, runs)[0]?.score ?? 50), pick: () => app.setStart({ w: X.slug, f: app.mainFish(X), spot: '', setup: (settings.lastSetup || {})[X.slug] || F.setup }), on: F.w === X.slug })), { name: 'Neues Gewässer …', word: '', pick: () => app.setStart({ w: NEU, spot: '' }), on: F.w === NEU }].map((x) => ({ ...x, style: { height: 60, borderRadius: 16, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', border: x.on ? '2px solid var(--ink)' : '1px solid var(--line)', background: x.on ? 'var(--ink)' : 'var(--surface)', color: x.on ? 'var(--bg)' : 'var(--ink)', width: '100%' } })),
      isNew: F.w === NEU, gwNeu: F.gwNeu, setGwNeu: (v: string) => app.setStart({ gwNeu: v }),
      fish: fishes.map((f) => ({ label: f, pick: () => app.setStart({ f }), style: chip(F.f === f) })),
      spots: g ? [{ label: 'kein Spot', on: !F.spot, pick: () => app.setStart({ spot: '' }) }, ...spotNames(g).map((x) => ({ label: x, on: F.spot === x, pick: () => app.setStart({ spot: x }) })), { label: '+ Neuer Spot', on: false, pick: () => { const name = trim(window.prompt('Name des neuen Spots', '') || ''); if (name) { app.addSpot(g, name); app.setStart({ spot: name }); } } }] : [],
      setups: [{ label: 'Ohne Kombo', on: !F.setup, pick: () => app.setStart({ setup: '', vorfach: '' }) }, ...app.combos().map((c: any) => ({ label: app.comboSetup(c.id).name, on: F.setup === c.id, pick: () => app.setStart({ setup: c.id, vorfach: app.comboSetup(c.id).vorfach }) }))],
      vorfach: F.vorfach, setVorfach: (v: string) => app.setStart({ vorfach: v }),
      art: ['Ufer', 'Watend'].map((a) => ({ label: a, on: F.art === a, pick: () => app.setStart({ art: a }) })),
      wt: F.wt, sicht: F.sicht, setWt: (v: string) => app.setStart({ wt: v }), setSicht: (v: string) => app.setStart({ sicht: v }),
      k0: recBox.items.slice(0, 3).map((r: any) => ({ label: r.title, on: F.k0 && F.k0.label === itemDraft(r.item).label, pick: () => app.setStart({ k0: F.k0 && F.k0.label === itemDraft(r.item).label ? null : itemDraft(r.item) }) })),
      tip: ms[0] ? `Laut Index heute vorn: ${ms[0].tech}. Köder wählst du hier aus deiner Box oder nach dem Start unter „Köder“.` : 'Köder wählst du nach dem Start unter „Köder“.',
      warn: [...(nl ? [{ t: `Keine gültige Lizenz für ${g.name}: ${nl.type} ist seit ${nl.toT} abgelaufen. Angeln ohne Erlaubnis ist verboten.` }] : []), ...(rr ? [{ t: `${F.f} hat hier Schonzeit bis ${rr.bis}.` }] : [])],
      gps: settings.gps,
    };
  }
  // Fang und andere Einträge ergänzen
  let cd: any = { arts: [], keep: [] };
  if (sh.catch) {
    const e = lastEv;
    const g = gwBy(live.gewaesser);
    const isF = e.typ === 'fang';
    const L = num(e.laengeCm);
    const typical = fishKey(e.art || '') === 'hecht' ? 65 : fishKey(e.art || '') === 'zander' ? 50 : /forelle/i.test(e.art || '') ? 40 : 25;
    const step = (d: number) => () => app.evSet({ laengeCm: Math.max(5, (L ?? typical) + (L == null ? 0 : d)) });
    let legal = 'Länge eintragen, dann prüft die App das Mindestmaß', ok: boolean | null = null;
    const r = rulesOf(live.gewaesser).find((x: any) => x.art === e.art);
    if (isF && L != null) {
      if (!r) legal = 'Für diese Art ist noch keine Regel hinterlegt';
      else if (inSchon(r.von, r.bis)) { legal = `Schonzeit bis ${r.bis}: sofort zurücksetzen`; ok = false; }
      else { const mn = parseInt(r.min), mx = parseInt(r.max); if (isNaN(mn)) { legal = 'kein Mindestmaß'; ok = true; } else if (L < mn) { legal = `untermaßig · Mindestmaß ${mn} cm`; ok = false; } else if (mx && L > mx) { legal = `über Höchstmaß ${mx} cm: zurücksetzen`; ok = false; } else { legal = `maßig · Mindestmaß ${mn} cm`; ok = true; } }
    }
    cd = {
      title: `${TYP[e.typ]} um ${e.zeit}`, isFang: isF, t: e.zeit, len: L != null ? `${L} cm` : '– cm',
      arts: uniq([...ARTEN, ...(g?.zielfische || []), ...(g?.fischarten || [])]).map((a) => ({ label: a, pick: () => app.evSet({ art: a }), style: chip(e.art === a) })),
      m5: step(-5), m1: step(-1), p1: step(1), p5: step(5),
      keep: [[false, 'Zurückgesetzt'], [true, 'Entnommen']].map(([k, l]: any) => ({ label: l, pick: () => app.evSet({ entnommen: k }), style: chip(!!e.entnommen === k, true) })),
      legal, legalStyle: { alignSelf: 'flex-start', font: '800 15px/1.2 Archivo, sans-serif', padding: '10px 14px', borderRadius: 12, background: ok === false ? 'var(--minus)' : ok ? 'var(--plus)' : 'var(--surface2)', color: ok === null ? 'var(--ink)' : 'var(--surface)' },
      warn: ok === false && e.entnommen ? 'Bitte zurücksetzen. Entnahme ist hier nicht erlaubt.' : '',
      spots: g ? [{ label: 'ohne Spot', on: !e.spot, pick: () => app.evSet({ spot: undefined }) }, ...spotNames(g).map((x) => ({ label: x, on: e.spot === x, pick: () => app.evSet({ spot: x }) })), { label: '+ Neuer Spot', on: false, pick: () => app.evSpotNew() }] : [],
      tiefe: e.tiefeM != null ? String(e.tiefeM).replace('.', ',') : '', setTiefe: (v: string) => app.evSet({ tiefeM: num(v) ?? undefined }),
      notiz: e.notiz || '', setNotiz: (v: string) => app.evSet({ notiz: v || undefined }),
      pos: e.koordinaten ? `Position ${e.koordinaten.lat}, ${e.koordinaten.lon}` : '', getPos: () => app.evPos(), delPos: () => app.evSet({ koordinaten: undefined }),
      bild: bildId(e.bild), addBild: () => app.evBild(), delBild: () => app.evSet({ bild: undefined }),
      koeder: e.koeder || '',
    };
  }
  // Köderwechsel
  let bs: any = {};
  if (sh.bait) {
    const B = st.bait;
    const recent = uniq(sessions.flatMap((s) => (s.koeder || []).map((k: any) => k.label)).filter(Boolean)).slice(0, 8);
    bs = {
      mode: B.mode, modes: [['box', `Aus der Box${todayBox ? ' · ' + todayBox.name : ''}`], ['frei', 'Eingeben']].map(([k, l]) => ({ label: l, on: B.mode === k, pick: () => app.setState((s: any) => ({ bait: { ...s.bait, mode: k } })) })),
      box: todayBox ? todayBox.items.filter((i: any) => i.n > 0 && i.m).map((i: any) => ({ title: [i.type, i.size, i.col].filter(Boolean).join(' '), sub: [i.model, i.wt].filter(Boolean).join(', '), sw: swS(i.sw), use: () => app.changeKoeder(itemDraft(i)) })) : [],
      noBox: !todayBox, goBoxes: () => app.nav('boxes'),
      recent: recent.map((l) => ({ label: l, on: B.d.label === l, pick: () => { app.setBait('label', l); setTimeout(() => app.baitPrefill(), 0); } })),
      d: B.d, set: (p: string, v: any) => app.setBait(p, v), prefill: () => app.baitPrefill(), labels: recent, typen: settings.typen || [], montagen: settings.montagen || [],
      apply: () => app.changeKoeder(B.d),
    };
  }
  const obsGroups = OBS.map(([g, os]) => ({ label: g, opts: os.map((l) => ({ label: l, style: chip(false), pick: () => app.addNote(`${g}: ${l}`) })) }));
  // Test werten
  let tr: any = { kpis: [] };
  if (sh.testres) {
    const t = live._tests[st.trIdx];
    const inT = events(live).filter((e) => toMin(e.zeit)! >= toMin(t.start)! && toMin(e.zeit)! <= toMin(t.end || fmtClock(nowMin))!);
    const b = inT.filter((e) => BISS.includes(e.typ)).length, nn = inT.filter((e) => e.typ === 'nachlaeufer').length;
    tr = { title: t.title, span: `${t.start} bis ${t.end || fmtClock(nowMin)}`, kpis: [{ k: 'Bisse', v: b }, { k: 'Nachläufer', v: nn }, { k: 'Fänge', v: inT.filter((e) => e.typ === 'fang').length }], crit: b > 0 || nn > 0 ? `Kriterium „${t.crit}“: erfüllt.` : `Kriterium „${t.crit}“: nicht erfüllt.`, yes: () => app.finTest('ja', b, nn), no: () => app.finTest('nein', b, nn), unclear: () => app.finTest('unklar', b, nn) };
  }
  // Lücke im Wissensstand
  let gp: any = { rows: [] };
  if (sh.gap && W && tf.bm) {
    const Gp = st.gap;
    const todayTurb = A!.adv.turb;
    const isM = Gp.kind === 'm';
    const name = isM ? SHORT[Gp.row] : FAM[Gp.row].name;
    const su = A!.win.su || 18 * 60;
    const when: any = { Tag: `vor ${fmtClock(su - 40)}, solange es hell ist`, Dämmerung: `${fmtClock(su - 25)} bis ${fmtClock(su + 20)}, rund um Sonnenuntergang`, Dunkelheit: `ab ${fmtClock(su + 40)} in der Dunkelheit` };
    const possible = isM || Gp.col === todayTurb;
    const D = DET[isM ? Gp.row : tf.bm.id];
    const fk = fishKey(fish) || '_';
    const text = isM ? `Dazu hast du ${Gp.n ? `erst ${n(Gp.n, 'Session', 'Sessions')}` : 'noch keine Daten'}. Vorschlag: 20 Minuten ${name} ${when[Gp.col]}, am selben Spot.` : possible ? `Heute ist das Wasser ${todayTurb}: passt genau. Vorschlag: 20 Minuten ${MN[tf.bm.id].tech} in ${FAM[Gp.row].ex.split(',')[0]}.` : `Heute ist das Wasser ${todayTurb}, nicht ${Gp.col}. Ich merke mir die Lücke und schlage den Test vor, sobald die Bedingungen passen.`;
    const ck = `${tf.key}|g|${Gp.kind}|${Gp.row}|${Gp.col}`;
    const obj = { key: ck, kindLabel: 'Lücke füllen', title: `${name} bei ${Gp.col}`, sw: isM ? [] : FAM[Gp.row].sw.map((c: string, j: number) => ({ style: swStyle(c, j) })), rows: [['Köder', `${D.type}, ${pickF(D.size, fk)}, ${pickF(D.wt, fk)}`], ['Führung', D.steps[1]], ['Zeit', isM ? when[Gp.col] : 'heute im besten Zeitfenster'], ['Dauer', '20 Minuten am selben Spot'], ['Erfolg', 'Mindestens ein Biss oder Nachläufer']], why: `Warum: Lücke im Wissensstand, ${Gp.n ? `erst ${n(Gp.n, 'Session', 'Sessions')}` : 'noch keine Session'} unter diesen Bedingungen.`, basis: 'Neu aus dem Wissensstand', crit: 'Mindestens ein Biss oder Nachläufer' };
    gp = { title: obj.title, text, rows: obj.rows.map(([k, v]) => ({ k, v })), btn: possible ? 'Für Session vormerken' : 'Erinnern, wenn es passt', plan: () => {
      if (!possible) { app.setState({ sheet: null }); return app.toastMsg('Gemerkt. Der Vorschlag kommt bei passender Trübung.'); }
      if (pk.includes(ck)) { app.setState({ sheet: null }); return; }
      if (pk.length >= 2) { app.setState({ sheet: null }); return app.toastMsg('Schon 2 Tests vorgemerkt. Nimm erst einen heraus.'); }
      app.setV3({ custom: { ...V.custom, [tf.key]: [...((V.custom || {})[tf.key] || []).filter((x: any) => x.key !== ck), obj] }, planned: { ...V.planned, [tf.key]: [...pk, ck] } });
      app.setState({ sheet: null }); app.toastMsg('Test vorgemerkt. Du findest ihn unter „Heute testen“.');
    } };
  }
  // Nachtragen (schnell)
  let addVm: any = {};
  if (sh.add) {
    const Ad = st.add;
    const g = gwBy(Ad.w);
    addVm = {
      waters: [...gws.map((x) => ({ label: x.kuerzel || x.name, on: Ad.w === x.slug, pick: () => app.setAdd({ w: x.slug, f: app.mainFish(x), spot: '' }) })), { label: 'Neues …', on: Ad.w === NEU, pick: () => app.setAdd({ w: NEU, spot: '' }) }],
      isNew: Ad.w === NEU, gwNeu: Ad.gwNeu, setGwNeu: (v: string) => app.setAdd({ gwNeu: v }),
      fish: uniq([...(g?.zielfische || []), ...ZIELFISCHE]).map((f) => ({ label: f, on: Ad.f === f, pick: () => app.setAdd({ f }) })),
      spots: g ? [{ label: 'kein Spot', on: !Ad.spot, pick: () => app.setAdd({ spot: '' }) }, ...spotNames(g).map((x) => ({ label: x, on: Ad.spot === x, pick: () => app.setAdd({ spot: x }) }))] : [],
      datum: Ad.datum, beginn: Ad.beginn, ende: Ad.ende, set: (k: string) => (v: string) => app.setAdd({ [k]: v }), max: isoDate(new Date()),
      steppers: [['Fänge', 'c'], ['Fehlbisse', 'b']].map(([label, k]) => ({ label, v: Ad[k], dec: () => app.setAdd({ [k]: Math.max(0, Ad[k] - 1) }), inc: () => app.setAdd({ [k]: Ad[k] + 1 }) })),
      hint: Ad.c + Ad.b === 0 ? 'Ohne Bisse wird es eine Nullrunde. Ausdrücklich erwünscht.' : 'Die Uhrzeiten der Bisse werden gleichmäßig verteilt. Köder, Längen und genaue Zeiten ergänzt du danach unter „Bearbeiten“.',
      full: () => app.setState({ sheet: null }, () => app.openEditor(null)),
    };
  }
  // Allgemeines Formular
  const FM = st.form;
  let fm: any = { fields: [], pickers: [], waterOpts: [], vlOpts: [], statusOpts: [] };
  if (FM) {
    const d = FM.data;
    const set = (k: string, v: any) => app.setForm(k, v);
    const isGear = ['rods', 'reels', 'lines', 'leaders', 'combos'].includes(FM.kind);
    const titleOf = (arr: string, x: any) => (arr === 'rods' || arr === 'reels' ? x.modell : arr === 'lines' ? [x.typ, x.tragkraft].filter(Boolean).join(', ') : [x.material, x.staerke].filter(Boolean).join(' ')) || 'ohne Namen';
    const FIELDS: Record<string, any[]> = {
      rods: [['modell', 'Modell'], ['laenge', 'Länge'], ['wg', 'Wurfgewicht'], ['aktion', 'Aktion'], ['spitze', 'Spitze']], reels: [['modell', 'Modell'], ['groesse', 'Größe'], ['uebers', 'Übersetzung']], lines: [['typ', 'Typ und Stärke'], ['tragkraft', 'Tragkraft'], ['farbe', 'Farbe']], leaders: [['material', 'Material'], ['staerke', 'Stärke, Länge']], combos: [['name', 'Name, z. B. Spinnrute leicht'], ['use', 'Einsatz, z. B. Faulenzen, Dropshot']],
      item: [['type', 'Typ'], ['model', 'Modell'], ['size', 'Größe'], ['wt', 'Gewicht'], ['col', 'Farbe'], ['n', 'Anzahl', 'number']],
      lic: [['type', 'Bezeichnung'], ['issuer', 'Aussteller'], ['from', 'Gültig von', 'date'], ['to', 'Gültig bis (leer = unbefristet)', 'date'], ['cost', 'Kosten'], ['order', 'Bestellweg: Link, Telefon oder Ausgabestelle']],
      box: [['name', 'Name der Box']],
      gw: [['name', 'Name'], ['kuerzel', 'Kürzel (2 bis 3 Buchstaben)'], ['lage', 'Lage, z. B. Ort oder Landkreis'], ['zielfische', 'Zielfische, mit Komma getrennt'], ['spots', 'Spots, einer pro Zeile', 'area'], ['beschreibung', 'Beschreibung', 'area']],
      spot: [['name', 'Name, z. B. D Spundwand Ost'], ['struktur', 'Struktur'], ['tiefe', 'Tiefe'], ['grund', 'Grund'], ['beschreibung', 'Beschreibung', 'area']],
      rule: [['von', 'Schonzeit von (TT.MM.)'], ['bis', 'Schonzeit bis (TT.MM.)'], ['min', 'Mindestmaß in cm', 'number'], ['max', 'Höchstmaß in cm', 'number'], ['limit', 'Fangbegrenzung pro Tag', 'number'], ['quelle', 'Quelle, z. B. Gewässerordnung'], ['stand', 'Stand, z. B. 01/2026']],
      map: [['title', 'Titel'], ['src', 'Quelle, z. B. Screenshot Tiefenkarten-App'], ['date', 'Datum der Aufnahme'], ['level', 'Wasserstand bei Aufnahme'], ['note', 'Notiz', 'area']],
    };
    const KL2: any = { ...KL, item: 'Köder', lic: 'Lizenz', box: 'Box', gw: 'Gewässer', spot: 'Spot', rule: 'Regel', map: 'Karte oder Foto' };
    const pickers: any[] = [];
    if (FM.kind === 'combos') [['rod', 'Rute', 'rods'], ['reel', 'Rolle', 'reels'], ['line', 'Schnur', 'lines'], ['leader', 'Vorfach', 'leaders']].forEach(([k, l, arr]) => pickers.push({ label: l, opts: (G2[arr] || []).filter((x: any) => x.status !== 'aussortiert' || x.id === d[k]).map((x: any) => ({ label: titleOf(arr, x), pick: () => set(k, d[k] === x.id ? null : x.id), style: { ...chip(d[k] === x.id), height: 44 } })).concat((G2[arr] || []).length ? [] : [{ label: `Erst unter „${({ rods: 'Ruten', reels: 'Rollen', lines: 'Schnüre', leaders: 'Vorfächer' } as any)[arr]}“ anlegen`, pick: () => {}, style: { ...chip(false), height: 44, opacity: 0.6 } }]) }));
    if (FM.kind === 'gw') { pickers.push({ label: 'Typ', opts: GWTYP.map((x) => ({ label: x, pick: () => set('typ', d.typ === x ? '' : x), style: { ...chip(d.typ === x), height: 44 } })) }); pickers.push({ label: 'Tide', opts: ['prüfen', 'ja', 'nein'].map((x) => ({ label: x, pick: () => set('tide', x), style: { ...chip(d.tide === x), height: 44 } })) }); }
    if (FM.kind === 'rule' && W) pickers.push({ label: 'Fischart', opts: uniq([...(W.zielfische || []), ...ZIELFISCHE, ...(W.fischarten || [])]).map((x) => ({ label: x, pick: () => set('art', x), style: { ...chip(d.art === x), height: 44 } })) });
    fm = {
      title: `${KL2[FM.kind]} ${FM.isNew ? 'anlegen' : 'bearbeiten'}`,
      fields: (FIELDS[FM.kind] || []).map(([k, l, type]) => ({ label: l, value: d[k] ?? '', type: type || 'text', onChange: (e: any) => set(k, e.target.value) })),
      pickers,
      hasPhoto: !['combos', 'box', 'gw', 'spot', 'rule', 'map'].includes(FM.kind), slotId: FM.kind === 'lic' ? `lic-${FM.id}` : FM.kind === 'item' ? `item-${FM.id}` : `photo-${FM.kind}-${FM.id}`,
      hasStatus: isGear, statusOpts: [['aktiv', 'Im Einsatz'], ['aussortiert', 'Aussortiert']].map(([v, l]) => ({ label: l, pick: () => set('status', v), style: chip((d.status || 'aktiv') === v, true) })),
      hasNote: (isGear && FM.kind !== 'combos') || FM.kind === 'item', note: d.notiz || '', onNote: (e: any) => set('notiz', e.target.value),
      hasWaters: FM.kind === 'lic', waterOpts: gws.map((X) => ({ label: X.name, pick: () => set('waters', (d.waters || []).includes(X.slug) ? d.waters.filter((w: string) => w !== X.slug) : [...(d.waters || []), X.slug]), style: { ...chip((d.waters || []).includes(X.slug)), height: 44 } })),
      vlOpts: [2, 4, 8].map((x) => ({ label: `${x} Wochen`, pick: () => set('vl', x), style: chip((d.vl || 4) === x, true) })),
      licHint: FM.kind === 'lic', save: () => app.saveForm(),
      canDel: !FM.isNew && (FM.kind !== 'gw' || (isNewGw(gwBy(FM.id) || {}) && !sessions.some((s) => s.gewaesser === FM.id))), delLabel: FM.kind === 'combos' ? 'Kombo trennen' : 'Löschen', del: () => app.setState({ sheet: 'confirm' }),
    };
  }
  let cf: any = {};
  if (FM && sheet === 'confirm') {
    const d = FM.data;
    let text = 'Das lässt sich nicht rückgängig machen.';
    if (['rods', 'reels', 'lines', 'leaders'].includes(FM.kind)) { const used = G2.combos.filter((c: any) => [c.rod, c.reel, c.line, c.leader].includes(FM.id)); text = (used.length ? `Steckt in ${used.length === 1 ? 'einer Kombo' : used.length + ' Kombos'}, die dabei getrennt ${used.length === 1 ? 'wird' : 'werden'}. ` : '') + 'Tipp: Aussortieren statt löschen, dann bleibt es in der Statistik.'; }
    if (FM.kind === 'combos') text = 'Rute, Rolle, Schnur und Vorfach bleiben einzeln erhalten. Sessions behalten ihre Angaben.';
    if (FM.kind === 'lic') text = `Die Lizenz wird bei allen zugeordneten Gewässern entfernt: ${(d.waters || []).map(short).join(', ') || 'keine'}.`;
    if (FM.kind === 'box') text = `Die Box und ihre ${(d.items || []).length} Einträge werden gelöscht.`;
    cf = { title: FM.kind === 'combos' ? 'Kombo trennen?' : 'Wirklich löschen?', text, yesLabel: FM.kind === 'combos' ? 'Trennen' : 'Endgültig löschen', yes: () => app.deleteForm(), no: () => app.setState({ sheet: 'form' }) };
  }

  /* ---------- Session bearbeiten ---------- */
  let ed: any = null;
  if (is.edit && st.edit) {
    const d = st.edit;
    const g = gwBy(d.gw);
    ed = {
      d, title: d.appId ? 'Session bearbeiten' : 'Session nachtragen', err: st.editErr, set: (p: string, v: any) => app.setEd(p, v),
      waters: [...gws.map((x) => ({ label: x.kuerzel || x.name, on: d.gw === x.slug, pick: () => app.setEd('gw', x.slug) })), { label: 'Neues …', on: d.gw === NEU, pick: () => app.setEd('gw', NEU) }], isNew: d.gw === NEU,
      fish: uniq([...(g?.zielfische || []), ...ZIELFISCHE, d.ziel]).concat('Andere').map((f) => ({ label: f, on: d.ziel === f, pick: () => app.setEd('ziel', f) })),
      spots: g ? [{ label: 'kein Spot', on: !d.spot, pick: () => app.setEd('spot', '') }, ...uniq([...spotNames(g), d.spot]).map((x) => ({ label: x, on: d.spot === x, pick: () => app.setEd('spot', x) }))] : [],
      spotNames: g ? spotNames(g) : [],
      art: ['Ufer', 'Watend'].map((a) => ({ label: a, on: d.art === a, pick: () => app.setEd('art', a) })),
      setups: [{ label: 'Ohne Kombo', on: !d.setup, pick: () => app.setEd('setup', '') }, ...app.combos(false).filter((c: any) => c.status !== 'aussortiert' || c.id === d.setup).map((c: any) => ({ label: app.comboSetup(c.id).name, on: d.setup === c.id, pick: () => app.setEd('setup', c.id) }))],
      arts: (ev: any) => uniq([...ARTEN, ...(g?.zielfische || []), ev.art]), typen: settings.typen || [], montagen: settings.montagen || [], labels: uniq(sessions.flatMap((s) => (s.koeder || []).map((k: any) => k.label))),
      koederLabels: uniq(d.koeder.map((k: any) => trim(k.label))),
      add: (l: string) => app.edAddRow(l), delRow: (l: string, i: number) => app.edDelRow(l, i), evBild: (i: number) => app.edEvBild(i), evPos: (i: number) => app.edEvPos(i),
      save: () => app.saveEditor(), cancel: () => { app.setState({ edit: null }); app.back(); },
      delConfirm: st.delConfirm, askDel: () => app.setState({ delConfirm: true }), delNo: () => app.setState({ delConfirm: false }), delYes: () => app.deleteSession(d.appId),
      newSpot: () => { const name = trim(window.prompt('Name des neuen Spots', '') || ''); if (name && g) { app.addSpot(g, name); app.setEd('spot', name); } },
    };
  }

  /* ---------- Rückgabe ---------- */
  const tabs = TABS.map(([k, l]) => ({ label: l, go: () => app.tabTo(k), style: { border: 0, background: 'transparent', color: activeTab === k ? 'var(--ink)' : 'var(--muted)', font: `${activeTab === k ? 800 : 600} 13px/1 Archivo, sans-serif`, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 0, minHeight: 62, position: 'relative' }, bar: { width: 28, height: 4, borderRadius: 2, background: activeTab === k ? 'var(--orange)' : 'transparent' }, dot: { position: 'absolute', top: 12, left: 'calc(50% + 14px)', width: 9, height: 9, borderRadius: '50%', background: 'var(--orange)', display: k === 'more' && (pend || st.pending) ? 'block' : 'none' } }));
  return {
    theme, provMode, is, sec: sec2, show, tg, chev, sum, open: st.open, scrollRef: app.scrollRef, back: app.back, tlLabels, todayLabel: DF_LONG.format(new Date()),
    hasLive: !!live, liveVm, openLive: () => app.nav('live'), liveBox,
    noWaters: !gws.length, goData: () => app.nav('data'), newGw: () => app.openForm('gw', { slug: '', name: '', kuerzel: '', typ: '', lage: '', tide: 'prüfen', zielfische: '', spots: '', beschreibung: '' }, true),
    todayWaters, waterList, toastSoon: () => app.toastMsg('Kommt in einer späteren Version'),
    wv, fishChips, conds, condsLabel: st.open.conds ? 'Bedingungen ausblenden' : 'Alle Bedingungen ›', anglerOpts, goRegeln: () => app.goSec('regeln'),
    bew, tests, testCount: `${pk.length} von 2 vorgemerkt`, noTestsHint: !tests.length, plan, startHere: () => app.openStart(W?.slug, absent || noFach ? app.mainFish(W) : fish),
    methods, advRows, colorRes, br, spots, newSpot: () => app.openForm('spot', { id: 'sp', name: '', struktur: '', tiefe: '', grund: '', beschreibung: '' }, true), noSpots: !spots.length,
    maps, mapNew: () => app.openForm('map', { id: 'm' + uuid().slice(0, 8), title: '', src: '', date: '', level: '', note: '' }, true), symOpts, spotOpts, spotProf,
    wStats, wSessions, grids, wLic, otherLic, hasOtherLic: otherLic.length > 0, licNew: () => app.openForm('lic', { id: 'l' + uuid().slice(0, 8), type: '', issuer: '', from: isoDate(new Date()), to: '', cost: '', order: '', waters: W ? [W.slug] : [], vl: 4 }, true),
    rulesTab, ruleNew: () => app.openForm('rule', { id: 'r' + uuid().slice(0, 8), art: fish, von: '', bis: '', min: '', max: '', limit: '', quelle: '', stand: '' }, true), restr, rulesSrc, steck,
    md, startWithMethod: () => app.openStart(W?.slug, fish),
    evC: () => app.addEv('fang'), evF: () => app.addEv('fehlbiss'), evA: () => app.addEv('aussteiger'), evN: () => app.addEv('nachlaeufer'),
    openBait: () => app.openBait(), openNote: () => app.setState({ sheet: 'note' }), undo: () => app.undo(), openEnd: () => app.setState({ sheet: 'end' }), doEnd: app.endLive,
    endHint: liveVm.bites === 0 ? 'Nullrunde? Unbedingt speichern: sie macht die Vorhersage genauer.' : 'Die Session landet im Fangbuch der App und fließt sofort in Index und Auswertung ein.',
    book, bookSummary, legend, openAdd: () => app.openAdd(), openEditorNew: () => app.openEditor(null), sd,
    fW, fF, statKpis, groups, noStats: !fl.length,
    goGear: () => app.nav('gear'), goBoxes: () => app.nav('boxes'), gearSub: `${n(actCombos, 'Kombo', 'Kombos')} im Einsatz · Ruten, Rollen, Schnüre, Vorfächer`, boxSub: V.boxes.length ? `${n(V.boxes.length, 'Box', 'Boxen')} · heute dabei: ${todayBox ? todayBox.name : 'keine'}` : 'Noch keine Box angelegt',
    dataSub: st.pending ? 'Übertragung bestätigen' : pend ? `${pend} ${pend === 1 ? 'Eintrag wartet' : 'Einträge warten'} aufs Übertragen` : 'Alles übertragen · Import · Sicherung', dataDot: { width: 10, height: 10, borderRadius: '50%', background: 'var(--orange)', display: pend || st.pending ? 'block' : 'none', flex: 'none' },
    themeOpts, gearList, gearTabs, gearNew, gearNewLabel: gt === 'combos' ? '+ Kombo zusammenstellen' : `+ ${KL[gt]} anlegen`, gearHint: gt === 'combos' ? 'Kombos sind deine Setups: Beim Start einer Session wählst du eine. Empfehlungen nutzen nur Kombos, deren Teile im Einsatz sind.' : 'Tippe zum Ändern. Aussortiertes bleibt in der Statistik.',
    boxList, bx, viewOpts, boxNew: () => app.openForm('box', { id: 'b' + uuid().slice(0, 8), name: '' }, true), itemNew: () => app.openForm('item', { id: 'i' + uuid().slice(0, 8), type: '', model: '', size: '', wt: '', col: '', n: 1 }, true),
    goDetect: () => app.toastMsg('Die Erkennung per Foto kommt in einer späteren Version. Trag die Köder bis dahin mit „+ Köder hinzufügen“ ein.'),
    data: dataVm, swUpdate: st.swUpdate,
    showFab: !is.live && !is.edit && !sheet, fabLabel: live ? `Session · ${liveVm.elapsed}` : 'Session starten', fabClick: () => (live ? app.nav('live') : app.openStart(is.water ? W?.slug : (todayWaters[0] && gws.find((g) => g.name === todayWaters[0].name)?.slug) || null)),
    showTabs: !is.live && !is.edit, tabs, toast: st.toast, hasSheet: !!sheet && Object.values(sh).some(Boolean), closeSheet: () => app.setState({ sheet: null }), sh,
    start: startVm, doStart: app.doStart, startBtn: startVm.warn && startVm.warn.length ? 'Trotzdem starten' : 'Los geht’s',
    cd, bs, obsGroups, noteText: st.noteText, setNoteText: (v: string) => app.setState({ noteText: v }), saveNote: () => app.addNote(st.noteText),
    tr, gp, add: addVm, doAdd: app.doAdd, fm, cf, ed,
  };
}

/* ---------- kleine Hilfen ---------- */
const typChar = (t: string) => ({ fang: 'c', fehlbiss: 'f', aussteiger: 'a', nachlaeufer: 'n' } as any)[t] || 'f';
const icon = (bg: string) => ({ font: '800 16px/1 Archivo, sans-serif', width: 24, height: 24, borderRadius: '50%', background: bg, color: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' });
function famKey(k: any) { const f = String(k.farbe || k.label || ''); return /chartreuse|orange|pink|gelb/i.test(f) ? 'sig' : /schwarz|violett|dunkel/i.test(f) ? 'dark' : /weiß|weiss|perl|silber/i.test(f) ? 'perl' : /tiger|kontrast/i.test(f) ? 'kon' : 'nat'; }
function methodOfLabel(s: any, e: any) { const k = (s.koeder || []).find((x: any) => x.label === e.koeder) || (s.koeder || [])[0]; return k ? segments({ ...s, koeder: [k] })[0]?.method : null; }
const LABELS: Record<string, string> = { luftdruck: 'Luftdruck', wind: 'Wind', bewoelkung: 'Bewölkung', mond: 'Mond', tide: 'Tide', wasserstand: 'Wasserstand', lufttemp: 'Lufttemperatur', wetter: 'Wetter', niederschlag: 'Niederschlag', sonnenaufgang: 'Sonnenaufgang' };
const labelOf = (k: string) => LABELS[k] || k.charAt(0).toUpperCase() + k.slice(1);
// Ein Eintrag aus der Köderbox als Köder fürs Fangbuch.
export function itemDraft(i: any) {
  const size = num(String(i.size || '').replace(/\s*cm.*$/, '').replace(',', '.'));
  const wt = num(String(i.wt || '').replace(/\s*g.*$/, '').replace(',', '.'));
  return { label: [i.type, i.model, i.size, i.col].filter(Boolean).join(' '), typ: i.type || '', modell: i.model || '', farbe: i.col || '', groesseCm: size != null && /cm/.test(i.size || '') ? String(size) : '', gewichtG: wt != null ? String(wt) : '', fuehrung: '', schicht: '', montage: { art: '', bleiG: '', haken: '', hakenAustritt: '', hakenspitze: '', stinger: false, stingerArt: '', stingerPosition: '', notiz: '' } };
}
export { clamp, fmtDur, montageText, spotObj, METHODS };
