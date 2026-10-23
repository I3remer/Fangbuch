// Die Fangbuch-App: Zustand und Aktionen. Die Darstellung entsteht in ./vm.ts (View-Model) und ./screens.
// Daten liegen in derselben IndexedDB wie bisher; Sessions, Gewässer und Vorschläge haben das Format v4.
import React from 'react';
import { AppShell } from './AppShell';
import { buildVm } from './vm';
import { del, getAll, getKeys, openDb, persist, putMeta, tx } from './lib/db';
import {
  TYP, ZIELFISCHE, bildData, buildBackup, buildExport, checkBackup, cleanSetup, clearBildCache, defaultSettings, events, finalize, importData,
  isDone, isLive, isNewGw, kClean, kDraft, kHasContent, koederAt, lastKoeder, newGwDoc, restoreBackup, setupSnapshot, spotNames, storeImage, evMin, spanOf, bildId,
  KOEDERTYP, MONTAGE,
} from './lib/fangbuch';
import { clone, download, hhmm, initials, isTime, isoDate, normTime, num, parseDate, pickFile, slugify, trim, uniq, uuid } from './lib/util';
import { defaultAdv } from './lib/berater';
import { famGuess, methodGuess } from './lib/fachwissen';
import { parseRegeln } from './lib/regeln';

type Props = { onUpdate?: (register: (fn: () => void) => void) => void };

export const NEU = '__neu';
const emptyV3 = () => ({ lics: [] as any[], vorlauf: 4, gear: null as any, boxes: [] as any[], todayBox: null as string | null, boxView: 'liste', gtab: 'combos', maps: {} as Record<string, any[]>, rules: {} as Record<string, any[]>, planned: {} as Record<string, string[]>, custom: {} as Record<string, any[]>, theme: null as null | string, anglers: {} as Record<string, any> });

export class FangbuchApp extends React.Component<Props, any> {
  state: any = {
    ready: false, failed: false,
    sessions: [] as any[], gewaesser: [] as any[], empfehlungen: [] as any[], settings: defaultSettings(), pending: null, lastBackup: null, v3: emptyV3(),
    stack: [{ s: 'heute' }], sheet: null, toast: null, w: null, f: 'Barsch', m: 'faul', sid: null,
    adv: {}, filtW: 'alle', filtF: 'alle', open: { plan: false, spots: false, karten: false, sessions: false, regeln: false, steckbrief: false, conds: false },
    mapEdit: null, mapSym: 'kante', mapSpot: null, zoom: {}, boxId: null,
    start: null, evIdx: null, bait: null, noteText: '', add: null, edit: null, editErr: '', editOutsideOk: false, delConfirm: false, form: null, trIdx: 0, gap: null,
    exp: null, importText: '', importMsg: null, restore: null, swUpdate: null, storage: '', offline: false,
  };
  scrollRef = React.createRef<HTMLDivElement>();
  timer: any; tt: any; wake: any = null; mq: MediaQueryList | null = null;

  /* ---------- Start ---------- */
  async componentDidMount() {
    this.mq = window.matchMedia('(prefers-color-scheme: dark)');
    this.mq.addEventListener('change', this.onScheme);
    this.props.onUpdate?.((fn) => this.setState({ swUpdate: fn }));
    try { await openDb(); await this.loadAll(); }
    catch { this.setState({ failed: true }); return; }
    this.timer = setInterval(() => { if (this.liveSession()) this.forceUpdate(); else if (new Date().getSeconds() === 0) this.forceUpdate(); }, 1000);
    document.addEventListener('visibilitychange', this.onVisible);
    this.gcBilder();
    this.storageInfo();
  }
  componentWillUnmount() { clearInterval(this.timer); clearTimeout(this.tt); this.mq?.removeEventListener('change', this.onScheme); document.removeEventListener('visibilitychange', this.onVisible); }
  onScheme = () => this.forceUpdate();
  onVisible = () => { if (document.visibilityState === 'visible') { this.wakeOn(); this.forceUpdate(); } };

  async loadAll() {
    const [ss, gs, es, ms] = await Promise.all([getAll('sessions'), getAll('gewaesser'), getAll('empfehlungen'), getAll('meta')]);
    const meta = Object.fromEntries(ms.map((m) => [m.key, m.value]));
    const settings = Object.assign(defaultSettings(), meta.settings || {});
    const v3 = Object.assign(emptyV3(), meta.v3 || {});
    // Beim ersten Start der neuen Version: Setups der bisherigen App werden zu Kombos in der Ausrüstung.
    if (!v3.gear) { v3.gear = gearFromSetups(settings.setups || []); await putMeta('v3', v3).catch(() => {}); }
    const sessions = sortSessions(ss.map((s) => { ['ereignisse', 'koeder', 'notizen'].forEach((k) => { if (!Array.isArray(s[k])) s[k] = []; }); return s; }));
    const gewaesser = sortGw(gs);
    const live = sessions.filter(isLive).sort((a, b) => String(b.erstellt).localeCompare(String(a.erstellt)))[0];
    const first = gewaesser[0];
    this.setState({
      ready: true, sessions, gewaesser, empfehlungen: es, settings, v3, pending: meta.pendingExport || null, lastBackup: meta.lastBackup || null,
      w: this.state.w && gewaesser.some((g) => g.slug === this.state.w) ? this.state.w : first ? first.slug : null,
      stack: live ? [{ s: 'heute' }, { s: 'live' }] : [{ s: 'heute' }], boxId: v3.boxes[0]?.id || null,
    });
    if (live) this.wakeOn();
  }
  async storageInfo() {
    const parts = ['Datenformat 4'];
    try { if (navigator.storage?.persisted) parts.push((await navigator.storage.persisted()) ? 'Speicher dauerhaft geschützt' : 'Speicher nicht dauerhaft geschützt'); } catch { /* egal */ }
    try { const e = await navigator.storage?.estimate?.(); if (e?.usage != null) parts.push((e.usage / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB belegt'); } catch { /* egal */ }
    this.setState({ storage: parts.join(', '), offline: !!navigator.serviceWorker?.controller });
  }
  // Nicht mehr verwendete Screenshots aufräumen. Fotos der Foto-Felder (slot:) bleiben.
  async gcBilder() {
    const refs = new Set<string>();
    this.state.sessions.forEach((s: any) => events(s).forEach((ev) => { const id = bildId(ev.bild); if (id) refs.add(id); }));
    if (this.state.edit) this.state.edit.ereignisse.forEach((ev: any) => { const id = bildId(ev.bild); if (id) refs.add(id); });
    try {
      const dead = (await getKeys('bilder')).map(String).filter((k) => !k.startsWith('slot:') && !refs.has(k));
      if (dead.length) await tx(['bilder'], 'readwrite', (t) => dead.forEach((k) => t.objectStore('bilder').delete(k)));
    } catch { /* nächster Versuch beim nächsten Start */ }
  }

  /* ---------- Speichern ---------- */
  fail = () => this.toastMsg('Speichern fehlgeschlagen. Ist der Speicher des Handys voll?');
  saveSession(s: any) {
    persist('sessions', s, this.fail);
    this.setState((st: any) => ({ sessions: sortSessions(st.sessions.filter((x: any) => x.appId !== s.appId).concat(s)) }));
  }
  touch(s: any) { s.aktualisiert = new Date().toISOString(); this.saveSession(s); }
  saveGw(g: any) {
    persist('gewaesser', g, this.fail);
    this.setState((st: any) => ({ gewaesser: sortGw(st.gewaesser.filter((x: any) => x.slug !== g.slug).concat(g)) }));
  }
  setV3(patch: any) {
    this.setState((st: any) => {
      const v3 = { ...st.v3, ...patch };
      putMeta('v3', v3).catch(this.fail);
      return { v3 };
    });
  }
  setSettings(patch: any) {
    this.setState((st: any) => {
      const settings = { ...st.settings, ...patch };
      putMeta('settings', settings).catch(this.fail);
      return { settings };
    });
  }

  /* ---------- Navigation ---------- */
  top() { requestAnimationFrame(() => { if (this.scrollRef.current) this.scrollRef.current.scrollTop = 0; }); }
  nav(s: string, extra: any = {}) { this.setState((st: any) => ({ ...extra, sheet: null, stack: [...st.stack, { s }] })); this.top(); }
  back = () => { this.setState((st: any) => ({ sheet: null, stack: st.stack.length > 1 ? st.stack.slice(0, -1) : st.stack })); this.top(); };
  tabTo(t: string) { this.setState({ sheet: null, stack: [{ s: t }], exp: null, importMsg: null, restore: null }); this.top(); }
  toastMsg(t: string) { this.setState({ toast: t }); clearTimeout(this.tt); this.tt = setTimeout(() => this.setState({ toast: null }), 2600); }
  goSec(k: string) {
    this.setState((s: any) => ({ open: { ...s.open, [k]: true } }));
    setTimeout(() => { const el = document.getElementById('sec-' + k); const sc = this.scrollRef.current; if (el && sc) sc.scrollTop = Math.max(0, el.offsetTop - 120); }, 120);
  }
  gw(slug: string | null) { return this.state.gewaesser.find((g: any) => g.slug === slug) || null; }
  mainFish(g: any) {
    if (!g) return 'Barsch';
    if (Array.isArray(g.zielfische) && g.zielfische[0]) return g.zielfische[0];
    const counts: Record<string, number> = {};
    this.state.sessions.filter((s: any) => s.gewaesser === g.slug && s.zielfisch).forEach((s: any) => { counts[s.zielfisch] = (counts[s.zielfisch] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Barsch';
  }
  openWater(slug: string) { this.nav('water', { w: slug, f: this.mainFish(this.gw(slug)) }); }
  adv(slug: string) { return this.state.adv[slug] || defaultAdv(this.gw(slug) || { slug }, this.state.sessions, this.state.settings); }
  liveSession() { return this.state.sessions.find(isLive) || null; }
  combos(activeOnly = true) {
    const G = this.state.v3.gear || { combos: [] };
    const gi = (arr: string, id: string) => (G[arr] || []).find((x: any) => x.id === id);
    return (G.combos || []).filter((c: any) => !activeOnly || (c.status !== 'aussortiert' && [gi('rods', c.rod), gi('reels', c.reel)].every((x) => !x || x.status !== 'aussortiert')));
  }
  comboSetup(id: string) {
    const G = this.state.v3.gear || {};
    const c = (G.combos || []).find((x: any) => x.id === id);
    if (!c) return null;
    const gi = (arr: string, x: string) => (G[arr] || []).find((y: any) => y.id === x);
    const r = gi('rods', c.rod), re = gi('reels', c.reel), l = gi('lines', c.line), v = gi('leaders', c.leader);
    return { id: c.id, name: c.name || (r && r.modell) || 'Kombo', rute: r ? [r.modell, r.laenge].filter(Boolean).join(' ') : '', rolle: re ? re.modell : '', hauptschnur: l ? [l.typ, l.tragkraft].filter(Boolean).join(', ') : '', vorfach: v ? [v.material, v.staerke].filter(Boolean).join(' ') : '' };
  }

  /* ---------- Gewässer ---------- */
  ensureGw(slugOrNew: string, newName: string, ziel: string) {
    if (slugOrNew !== NEU && this.gw(slugOrNew)) return this.gw(slugOrNew);
    const name = trim(newName);
    if (!name) { this.toastMsg('Trag einen Namen für das Gewässer ein.'); return null; }
    const slug = slugify(name);
    if (!slug) { this.toastMsg('Der Name braucht mindestens einen Buchstaben oder eine Zahl.'); return null; }
    if (this.gw(slug)) return this.gw(slug);
    const g = newGwDoc(name, { zielfische: ziel && ziel !== 'Andere' ? [ziel] : [] });
    this.saveGw(g);
    return g;
  }
  addSpot(g: any, name: string, extra: any = {}) {
    if (!g || !name || spotNames(g).includes(name)) return;
    const ng = { ...g, spots: (Array.isArray(g.spots) ? g.spots : []).concat({ name, ...extra }), aktualisiert: new Date().toISOString() };
    if (!isNewGw(g)) ng._neueSpots = uniq((g._neueSpots || []).concat(name));
    this.saveGw(ng);
  }

  /* ---------- Live-Session ---------- */
  openStart(w?: string | null, f?: string) {
    const g = this.gw(w || this.state.w) || this.state.gewaesser[0];
    const slug = g ? g.slug : NEU;
    const fish = f || this.mainFish(g);
    const ls = (this.state.settings.lastSetup || {})[slug];
    const setup = ls && this.combos().some((c: any) => c.id === ls) ? ls : '';
    this.setState({ sheet: 'start', start: { w: slug, gwNeu: '', f: fish, spot: '', art: /watend/i.test(String(g?.angelart || '')) ? 'Watend' : 'Ufer', setup, vorfach: setup ? this.comboSetup(setup)?.vorfach || '' : '', wt: '', sicht: '', k0: null } });
  }
  setStart(patch: any) { this.setState((s: any) => ({ start: { ...s.start, ...patch } })); }
  doStart = () => {
    const F = this.state.start;
    if (this.liveSession() || !F) return;
    const g = this.ensureGw(F.w, F.gwNeu, F.f);
    if (!g) return;
    const now = new Date();
    const beginn = hhmm(now), ts = now.toISOString();
    const beo: any = {};
    const wt = num(F.wt), sicht = num(F.sicht);
    if (wt != null) beo.wassertemp = wt;
    if (sicht != null) beo.sichttiefe = sicht;
    const k0 = F.k0 ? kClean({ ...F.k0, zeit: beginn, _ts: Date.now() }) : null;
    const s: any = {
      appId: uuid(), id: '', status: 'entwurf', live: true, quelle: 'app', datum: isoDate(now), beginn, gewaesser: g.slug, gewaesserName: g.name || g.slug,
      spot: F.spot || undefined, angelart: F.art || 'Ufer', zielfisch: F.f || '', koeder: k0 && kHasContent(k0) ? [k0] : [], ereignisse: [], beobachtungen: beo, notizen: [],
      erstellt: ts, aktualisiert: ts, _uebertragenAm: null, _startTs: Date.now(), _tests: this.liveTests(g.slug, F.f),
    };
    if (!s.spot) delete s.spot;
    const su = setupSnapshot(this.comboSetup(F.setup), F.vorfach);
    if (su) s.setup = su;
    this.setSettings({ lastSetup: { ...(this.state.settings.lastSetup || {}), [g.slug]: F.setup || '' } });
    this.saveSession(s);
    this.attachPos(s, null);
    this.setState((st: any) => ({ sheet: null, start: null, w: g.slug, stack: [...st.stack, { s: 'live' }] }));
    this.top();
    this.wakeOn();
  };
  liveTests(slug: string, fish: string) {
    const t = buildVm(this, { only: 'tests', w: slug, f: fish });
    return (t.tf?.cands || []).filter((c: any) => t.plannedKeys.includes(c.key)).slice(0, 2).map((c: any) => ({ key: c.key, title: c.title, crit: c.crit, empId: c.empId || null, start: null, end: null, done: null }));
  }
  async wakeOn() {
    if (!this.liveSession() || !('wakeLock' in navigator) || document.visibilityState !== 'visible' || this.wake) return;
    try { this.wake = await (navigator as any).wakeLock.request('screen'); this.wake.addEventListener('release', () => { this.wake = null; }); } catch { this.wake = null; }
  }
  wakeOff() { try { this.wake?.release(); } catch { /* egal */ } this.wake = null; }
  getPos(force: boolean) {
    return new Promise<any>((res) => {
      if ((!force && !this.state.settings.gps) || !navigator.geolocation) { res(null); return; }
      navigator.geolocation.getCurrentPosition((p) => res({ lat: Math.round(p.coords.latitude * 1e5) / 1e5, lon: Math.round(p.coords.longitude * 1e5) / 1e5 }), () => res(null), { enableHighAccuracy: true, timeout: 20000, maximumAge: 30000 });
    });
  }
  attachPos(s: any, evIdx: number | null) {
    this.getPos(false).then((p) => {
      if (!p) return;
      const cur = this.state.sessions.find((x: any) => x.appId === s.appId);
      if (!cur) return;
      const n = clone(cur);
      if (evIdx == null) n.koordinaten = p; else if (n.ereignisse[evIdx]) n.ereignisse[evIdx].koordinaten = p;
      this.saveSession(n);
    });
  }
  addEv(typ: string) {
    const s0 = this.liveSession();
    if (!s0 || !TYP[typ]) return;
    const s = clone(s0);
    const ev: any = { zeit: hhmm(new Date()), typ, _ts: Date.now() };
    const k = (s.koeder || [])[s.koeder.length - 1];
    if (k && k.label) ev.koeder = k.label;
    if (s.spot) ev.spot = s.spot;
    if (typ === 'fang') { if (s.zielfisch && s.zielfisch !== 'Andere') ev.art = s.zielfisch; ev.entnommen = false; }
    s.ereignisse.push(ev);
    this.touch(s);
    try { navigator.vibrate?.(30); } catch { /* egal */ }
    if (typ === 'fang') { this.setState({ sheet: 'ev', evIdx: s.ereignisse.length - 1 }); this.attachPos(s, s.ereignisse.length - 1); }
    else this.toastMsg(`${ev.zeit} ${TYP[typ]} gespeichert. Im Verlauf antippen zum Ergänzen.`);
  }
  // Änderung am gerade geöffneten Eintrag der Live-Session, sofort gespeichert.
  evSet(patch: any) {
    const s0 = this.liveSession();
    const i = this.state.evIdx;
    if (!s0 || i == null || !s0.ereignisse[i]) return;
    const s = clone(s0);
    const ev = s.ereignisse[i];
    Object.entries(patch).forEach(([k, v]) => { if (v === undefined || v === '' || v === null) delete ev[k]; else ev[k] = v; });
    this.touch(s);
  }
  async evPos() {
    if (!navigator.geolocation) { this.toastMsg('Standort ist auf diesem Gerät nicht verfügbar.'); return; }
    this.toastMsg('Position wird bestimmt …');
    const p = await this.getPos(true);
    if (!p) { this.toastMsg('Keine Position. Erlaube den Standortzugriff in den Einstellungen des Handys.'); return; }
    this.evSet({ koordinaten: p });
    this.toastMsg('Position übernommen');
  }
  async evBild() {
    const f = await pickFile('image/*');
    if (!f) return;
    this.toastMsg('Screenshot wird gespeichert …');
    try { const id = await storeImage(f, uuid()); this.evSet({ bild: 'bild:' + id }); this.toastMsg('Screenshot angehängt'); }
    catch { this.toastMsg('Das Bild konnte nicht gelesen werden.'); }
  }
  evSpotNew() {
    const s = this.liveSession();
    const name = trim(window.prompt('Name des neuen Spots', '') || '');
    if (!s || !name) return;
    this.addSpot(this.gw(s.gewaesser), name);
    this.evSet({ spot: name });
  }
  openBait() { this.setState({ sheet: 'bait', bait: { d: kDraft(null), mode: this.state.v3.boxes.length ? 'box' : 'frei' } }); }
  setBait(path: string, v: any) {
    this.setState((st: any) => { const d = clone(st.bait.d); setPath(d, path, v); return { bait: { ...st.bait, d } }; });
  }
  baitPrefill() {
    const d = this.state.bait?.d;
    const k = d && lastKoeder(this.state.sessions, d.label);
    if (!k) return;
    const p = kDraft(k);
    const n = clone(d);
    let changed = false;
    ['typ', 'modell', 'farbe', 'groesseCm', 'gewichtG', 'fuehrung', 'schicht'].forEach((f) => { if (!n[f] && p[f]) { n[f] = p[f]; changed = true; } });
    if (!kClean({ montage: n.montage }).montage && kClean({ montage: p.montage }).montage) { n.montage = p.montage; changed = true; }
    if (changed) { this.setState((st: any) => ({ bait: { ...st.bait, d: n } })); this.toastMsg('Angaben vom letzten Einsatz übernommen'); }
  }
  changeKoeder(draft: any) {
    const s0 = this.liveSession();
    if (!s0) return;
    const k = kClean({ ...draft, zeit: hhmm(new Date()), _ts: Date.now() });
    if (!kHasContent(k)) { this.toastMsg('Trag zuerst den Köder ein.'); return; }
    const s = clone(s0);
    s.koeder.push(k);
    this.rememberCustom(k);
    this.touch(s);
    this.setState({ sheet: null, bait: null });
    this.toastMsg(`${k.zeit} Köder: ${k.label}`);
  }
  // Eigene Ködertypen und Montagen landen dauerhaft in der Auswahl, wie bisher.
  rememberCustom(k: any) {
    const S0 = this.state.settings;
    const t = k.typ && !KOEDERTYP.includes(k.typ) && !(S0.typen || []).includes(k.typ);
    const m = k.montage?.art && !MONTAGE.includes(k.montage.art) && !(S0.montagen || []).includes(k.montage.art);
    if (t || m) this.setSettings({ typen: t ? uniq([...(S0.typen || []), k.typ]) : S0.typen, montagen: m ? uniq([...(S0.montagen || []), k.montage.art]) : S0.montagen });
  }
  addNote(text: string) {
    const s0 = this.liveSession();
    const val = trim(text);
    if (!s0 || !val) { this.toastMsg('Die Notiz ist noch leer.'); return; }
    const s = clone(s0);
    const zeit = hhmm(new Date());
    s.notizen.push({ zeit, text: val, _ts: Date.now() });
    this.touch(s);
    this.setState({ sheet: null, noteText: '' });
    this.toastMsg(`${zeit} Notiz gespeichert`);
  }
  undo() {
    const s0 = this.liveSession();
    if (!s0) return;
    let best: any = null;
    ['ereignisse', 'koeder', 'notizen'].forEach((k) => (s0[k] || []).forEach((x: any, i: number) => { if (x && x._ts && (!best || x._ts > best.ts)) best = { k, i, ts: x._ts, x }; }));
    if (!best) { this.toastMsg('Nichts zum Rückgängigmachen'); return; }
    const s = clone(s0);
    s[best.k].splice(best.i, 1);
    this.touch(s);
    this.setState({ evIdx: null });
    this.toastMsg(`${best.k === 'ereignisse' ? TYP[best.x.typ] || 'Eintrag' : best.k === 'koeder' ? 'Köderwechsel' : 'Notiz'} von ${best.x.zeit} entfernt`);
  }
  testAct(i: number) {
    const s0 = this.liveSession();
    if (!s0) return;
    const t = s0._tests[i];
    if (!t || t.done) return;
    const now = hhmm(new Date());
    const s = clone(s0);
    if (!t.start) {
      if (s0._tests.some((x: any) => x.start && !x.end)) { this.toastMsg('Erst den laufenden Test beenden'); return; }
      s._tests[i].start = now;
      this.touch(s);
      this.toastMsg(`${now} Test gestartet: ${t.title}`);
      return;
    }
    if (!t.end) { s._tests[i].end = now; this.touch(s); }
    this.setState({ sheet: 'testres', trIdx: i });
  }
  // Das Ergebnis eines Tests geht als Notiz mit ins Fangbuch und fließt hier in den Index ein.
  finTest(res: string, b: number, n: number) {
    const s0 = this.liveSession();
    if (!s0) return;
    const s = clone(s0);
    const t = s._tests[this.state.trIdx];
    t.done = res;
    if (res !== 'unklar') s.notizen.push({ zeit: t.end || hhmm(new Date()), text: `Test „${t.title}“ von ${t.start} bis ${t.end}: ${b} ${b === 1 ? 'Biss' : 'Bisse'}, ${n} Nachläufer. Ergebnis: ${res === 'ja' ? 'hat etwas gebracht' : 'hat nichts gebracht'}.`, _ts: Date.now() });
    this.touch(s);
    this.setState({ sheet: null });
    const all = [...this.state.sessions.filter((x: any) => x.appId !== s.appId), s].flatMap((x: any) => (x._tests || []).filter((y: any) => y.key === t.key && (y.done === 'ja' || y.done === 'nein')));
    this.toastMsg(res === 'unklar' ? 'Nicht gewertet' : `Gespeichert. Datenbasis: ${all.length} ${all.length === 1 ? 'Test' : 'Tests'}, ${all.filter((r: any) => r.done === 'ja').length} mit Biss`);
  }
  endLive = () => {
    const s0 = this.liveSession();
    if (!s0) return;
    const s = clone(s0);
    s.ende = hhmm(new Date());
    s.live = false;
    finalize(s);
    this.saveSession(s);
    this.wakeOff();
    this.setState({ sheet: null, sid: s.appId, stack: [{ s: 'book' }, { s: 'session' }] });
    this.top();
    this.toastMsg('Session gespeichert. Noch nicht übertragen.');
  };

  /* ---------- Nachtragen und Bearbeiten ---------- */
  openAdd() {
    const g = this.gw(this.state.w) || this.state.gewaesser[0];
    const d = new Date(); d.setDate(d.getDate() - 1);
    this.setState({ sheet: 'add', add: { w: g ? g.slug : NEU, gwNeu: '', f: this.mainFish(g), datum: isoDate(d), beginn: '17:00', ende: '19:00', spot: '', c: 0, b: 0 } });
  }
  setAdd(patch: any) { this.setState((s: any) => ({ add: { ...s.add, ...patch } })); }
  doAdd = () => {
    const A = this.state.add;
    if (!parseDate(A.datum) || A.datum > isoDate(new Date())) { this.toastMsg('Prüf das Datum.'); return; }
    if (!isTime(A.beginn) || !isTime(A.ende)) { this.toastMsg('Trag Beginn und Ende ein.'); return; }
    const g = this.ensureGw(A.w, A.gwNeu, A.f);
    if (!g) return;
    const sp = spanOf({ beginn: A.beginn, ende: A.ende })!;
    const n = A.c + A.b;
    const ev = [];
    for (let i = 0; i < n; i++) {
      const e: any = { zeit: fmtM(sp.b + ((sp.e! - sp.b) * (i + 1)) / (n + 1)), typ: i < A.c ? 'fang' : 'fehlbiss' };
      if (i < A.c) { if (A.f && A.f !== 'Andere') e.art = A.f; e.entnommen = false; }
      if (A.spot) e.spot = A.spot;
      ev.push(e);
    }
    const ts = new Date().toISOString();
    const s: any = { appId: uuid(), id: '', status: 'entwurf', live: false, quelle: 'app', erstellt: ts, _uebertragenAm: null, datum: A.datum, beginn: normTime(A.beginn), ende: normTime(A.ende), gewaesser: g.slug, gewaesserName: g.name || g.slug, spot: A.spot || undefined, angelart: 'Ufer', zielfisch: A.f, koeder: [], ereignisse: ev, beobachtungen: {}, notizen: [] };
    if (!s.spot) delete s.spot;
    finalize(s);
    this.saveSession(s);
    this.setState({ sheet: null, add: null });
    this.toastMsg(n ? 'Session nachgetragen. Details ergänzt du unter „Bearbeiten“.' : 'Nullrunde nachgetragen. Danke, die zählt!');
  };
  openEditor(s: any) {
    if (s && (isDone(s) || isLive(s))) return;
    const ls = this.state.settings.lastSetup || {};
    const g = s ? this.gw(s.gewaesser) : this.gw(this.state.w) || this.state.gewaesser[0];
    const d: any = s ? {
      appId: s.appId, datum: s.datum || '', beginn: s.beginn || '', ende: s.ende || '', gw: g ? s.gewaesser : NEU, gwNeu: g ? '' : s.gewaesserName || s.gewaesser || '',
      spot: s.spot || '', ziel: s.zielfisch || '', art: s.angelart || 'Ufer', setup: s.setup?.setupId || '', vorfach: s.setup?.vorfach || '',
      wt: num(s.beobachtungen?.wassertemp) != null ? String(s.beobachtungen.wassertemp) : '', sicht: num(s.beobachtungen?.sichttiefe) != null ? String(s.beobachtungen.sichttiefe) : '',
      koeder: (s.koeder || []).map(kDraft), ereignisse: (s.ereignisse || []).map((ev: any) => ({ ...clone(ev), laengeCm: ev.laengeCm != null ? String(ev.laengeCm) : '', tiefeM: ev.tiefeM != null ? String(ev.tiefeM) : '', _autoK: false })),
      notizen: clone(s.notizen || []), eindruck: s.eindruck || '', naechstesMal: s.naechstesMal || '',
    } : { appId: null, datum: isoDate(new Date()), beginn: '', ende: '', gw: g ? g.slug : NEU, gwNeu: '', spot: '', ziel: this.mainFish(g), art: 'Ufer', setup: g && ls[g.slug] ? ls[g.slug] : '', vorfach: '', wt: '', sicht: '', koeder: [], ereignisse: [], notizen: [], eindruck: '', naechstesMal: '' };
    if (!s && d.setup) d.vorfach = this.comboSetup(d.setup)?.vorfach || '';
    this.setState((st: any) => ({ edit: d, editErr: '', editOutsideOk: false, delConfirm: false, sheet: null, stack: [...st.stack, { s: 'edit' }] }));
    this.top();
  }
  setEd(path: string, v: any) {
    this.setState((st: any) => {
      const d = clone(st.edit);
      setPath(d, path, v);
      if (path === 'setup') d.vorfach = this.comboSetup(v)?.vorfach || '';
      if (path === 'gw') d.spot = '';
      if (/^ereignisse\.\d+\.koeder$/.test(path)) getPath(d, path.replace(/\.koeder$/, ''))._autoK = false;
      d.ereignisse.forEach((ev: any) => { if (ev._autoK) ev.koeder = koederAt(d.koeder.map(kClean), d.beginn, ev.zeit); });
      return { edit: d };
    });
  }
  edAddRow(list: string) {
    const d = clone(this.state.edit);
    const lastT = (arr: any[]) => { const x = arr.filter((r) => isTime(r.zeit)); return x.length ? x[x.length - 1].zeit : d.beginn || ''; };
    if (list === 'koeder') { const k = kDraft(null); k.zeit = d.koeder.length ? lastT(d.koeder) : d.beginn || ''; d.koeder.push(k); }
    else if (list === 'ereignisse') { const zeit = lastT(d.ereignisse); d.ereignisse.push({ zeit, typ: 'fang', art: d.ziel && d.ziel !== 'Andere' ? d.ziel : '', koeder: koederAt(d.koeder.map(kClean), d.beginn, zeit), laengeCm: '', spot: d.spot || '', tiefeM: '', entnommen: false, _autoK: true }); }
    else d.notizen.push({ zeit: lastT(d.notizen), text: '' });
    this.setState({ edit: d });
  }
  edDelRow(list: string, i: number) { const d = clone(this.state.edit); d[list].splice(i, 1); this.setState({ edit: d }); }
  async edEvBild(i: number) {
    const f = await pickFile('image/*');
    if (!f) return;
    try { const id = await storeImage(f, uuid()); this.setEd(`ereignisse.${i}.bild`, 'bild:' + id); this.toastMsg('Screenshot angehängt'); }
    catch { this.toastMsg('Das Bild konnte nicht gelesen werden.'); }
  }
  async edEvPos(i: number) {
    const p = await this.getPos(true);
    if (!p) { this.toastMsg('Keine Position. Erlaube den Standortzugriff in den Einstellungen des Handys.'); return; }
    this.setEd(`ereignisse.${i}.koordinaten`, p);
  }
  saveEditor = () => {
    const d = this.state.edit;
    const failE = (msg: string) => { this.setState({ editErr: msg }); setTimeout(() => document.querySelector('[role="alert"]')?.scrollIntoView({ block: 'center' }), 50); };
    if (!parseDate(d.datum)) return failE('Trag ein Datum ein.');
    if (!isTime(d.beginn)) return failE('Trag die Uhrzeit ein, zu der du angefangen hast.');
    if (!isTime(d.ende)) return failE('Trag die Uhrzeit ein, zu der du aufgehört hast.');
    if (d.datum > isoDate(new Date())) return failE('Das Datum liegt in der Zukunft.');
    if (d.gw === NEU && !trim(d.gwNeu)) return failE('Trag einen Namen für das Gewässer ein.');
    for (const [list, label] of [['koeder', 'Köder'], ['ereignisse', 'Eintrag'], ['notizen', 'Notiz-Eintrag']]) if (d[list].some((r: any) => !isTime(r.zeit))) return failE(`Bei jedem ${label} fehlt noch die Uhrzeit.`);
    if (d.koeder.some((k: any) => !kHasContent(kClean(k)))) return failE('Ein Köder hat noch keine Bezeichnung. Füll sie aus oder entferne die Zeile.');
    if (d.notizen.some((n: any) => !trim(n.text))) return failE('Eine Notiz ist leer. Füll sie aus oder entferne die Zeile.');
    const sp = spanOf({ beginn: d.beginn, ende: d.ende })!;
    const outside = [].concat(d.ereignisse, d.koeder, d.notizen).some((r: any) => { const m = evMin(r, sp.b); return m != null && (m < sp.b - 1 || m > sp.e! + 1); });
    if (outside && !this.state.editOutsideOk) { this.setState({ editOutsideOk: true }); return failE('Mindestens eine Uhrzeit liegt außerhalb von Beginn und Ende. Prüf das kurz; tippst du nochmal auf „Speichern“, wird trotzdem gespeichert.'); }
    const g = this.ensureGw(d.gw, d.gwNeu, d.ziel);
    if (!g) return;
    const old = d.appId ? this.state.sessions.find((s: any) => s.appId === d.appId) : null;
    if (old && (isDone(old) || isLive(old))) return failE('Diese Session ist gesperrt.');
    const ts = new Date().toISOString();
    const s: any = old ? clone(old) : { appId: uuid(), id: '', status: 'entwurf', live: false, quelle: 'app', erstellt: ts, _uebertragenAm: null };
    s.datum = d.datum; s.beginn = normTime(d.beginn); s.ende = normTime(d.ende);
    s.gewaesser = g.slug; s.gewaesserName = g.name || g.slug;
    if (trim(d.spot)) s.spot = trim(d.spot); else delete s.spot;
    s.zielfisch = d.ziel; s.angelart = d.art;
    // Setup als Momentaufnahme: Bleibt das Setup gleich, bleibt auch die alte Aufnahme, nur das Vorfach wird übernommen.
    const oldSu = old && old.setup ? old.setup : null;
    let su: any;
    if (d.setup && oldSu && oldSu.setupId === d.setup) { su = { ...oldSu }; if (trim(d.vorfach)) su.vorfach = trim(d.vorfach); else delete su.vorfach; }
    else su = setupSnapshot(this.comboSetup(d.setup), d.vorfach);
    if (su && Object.keys(su).length) s.setup = su; else delete s.setup;
    const beo = { ...(s.beobachtungen || {}) };
    const wt = num(d.wt), si = num(d.sicht);
    if (wt != null) beo.wassertemp = wt; else delete beo.wassertemp;
    if (si != null) beo.sichttiefe = si; else delete beo.sichttiefe;
    s.beobachtungen = beo;
    s.koeder = d.koeder.map(kClean);
    s.koeder.forEach((k: any) => this.rememberCustom(k));
    s.ereignisse = d.ereignisse.map((ev: any) => {
      const o: any = {};
      Object.keys(ev).forEach((k) => { if (!['laengeCm', 'tiefeM', '_autoK', 'entnommen'].includes(k)) o[k] = ev[k]; });
      o.zeit = normTime(ev.zeit);
      const L = num(ev.laengeCm), T = num(ev.tiefeM);
      if (L != null && o.typ === 'fang') o.laengeCm = L;
      if (T != null) o.tiefeM = T;
      ['art', 'koeder', 'notiz', 'spot'].forEach((k) => { o[k] = trim(o[k]); if (!o[k]) delete o[k]; });
      if (!o.koordinaten) delete o.koordinaten;
      if (!o.bild) delete o.bild;
      if (o.typ !== 'fang') delete o.art; else o.entnommen = !!ev.entnommen;
      return o;
    }).sort((a: any, b: any) => evMin(a, sp.b)! - evMin(b, sp.b)!);
    s.notizen = d.notizen.map((n: any) => ({ ...n, zeit: normTime(n.zeit), text: trim(n.text) }));
    ['eindruck', 'naechstesMal'].forEach((k) => { const v = trim(d[k]); if (v) s[k] = v; else delete s[k]; });
    s.live = false;
    finalize(s);
    this.saveSession(s);
    this.setSettings({ lastSetup: { ...(this.state.settings.lastSetup || {}), [g.slug]: d.setup || '' } });
    this.setState({ edit: null, sid: s.appId, stack: [{ s: 'book' }, { s: 'session' }] });
    this.top();
    this.gcBilder();
    this.toastMsg(old ? 'Änderungen gespeichert' : 'Session gespeichert');
  };
  async deleteSession(id: string) {
    const s = this.state.sessions.find((x: any) => x.appId === id);
    if (!s || isDone(s) || isLive(s)) return;
    try { await del('sessions', id); } catch { this.toastMsg('Löschen fehlgeschlagen. Versuch es erneut.'); return; }
    this.setState((st: any) => ({ sessions: st.sessions.filter((x: any) => x.appId !== id), edit: null, delConfirm: false, stack: [{ s: 'book' }] }));
    setTimeout(() => this.gcBilder(), 100);
    this.toastMsg('Session gelöscht');
  }

  /* ---------- Formulare (Gewässer, Spots, Regeln, Karten, Lizenzen, Ausrüstung, Köderbox) ---------- */
  openForm(kind: string, obj: any, isNew: boolean) { this.setState({ form: { kind, id: obj.id ?? obj.slug, data: clone(obj), isNew }, sheet: 'form' }); }
  setForm(k: string, v: any) { this.setState((s: any) => ({ form: { ...s.form, data: { ...s.form.data, [k]: v } } })); }
  saveForm = () => {
    const { kind, id, data, isNew } = this.state.form;
    const d: any = { ...data };
    const V = this.state.v3;
    const up = (arr: any[]) => (isNew ? [...arr, d] : arr.map((x) => (x.id === id ? d : x)));
    if (kind === 'gw') { if (!this.saveGwForm(d, isNew)) return; }
    else if (kind === 'spot') {
      const g = this.gw(this.state.w);
      const name = trim(d.name);
      if (!name) { this.toastMsg('Trag einen Namen ein.'); return; }
      if (spotNames(g).includes(name)) { this.toastMsg('Diesen Spot gibt es schon.'); return; }
      const extra: any = {}; ['struktur', 'tiefe', 'grund', 'beschreibung'].forEach((k) => { if (trim(d[k])) extra[k] = trim(d[k]); });
      this.addSpot(g, name, extra);
    }
    else if (kind === 'rule') {
      if (!trim(d.art)) { this.toastMsg('Wähl eine Fischart.'); return; }
      for (const k of ['von', 'bis']) if (trim(d[k]) && !/^\d{1,2}\.\d{1,2}\.$/.test(trim(d[k]))) { this.toastMsg('Schonzeit bitte als TT.MM. eintragen, z. B. 15.02.'); return; }
      const cur = this.rulesOf(this.state.w);
      this.setV3({ rules: { ...V.rules, [this.state.w]: isNew ? [...cur, d] : cur.map((x: any) => (x.id === id ? d : x)) } });
    }
    else if (kind === 'map') {
      if (!trim(d.title)) { this.toastMsg('Gib der Karte einen Titel.'); return; }
      const cur = V.maps[this.state.w] || [];
      this.setV3({ maps: { ...V.maps, [this.state.w]: isNew ? [...cur, { ...d, marks: [] }] : cur.map((x: any) => (x.id === id ? { ...x, ...d } : x)) } });
    }
    else if (kind === 'lic') {
      if (!trim(d.type)) { this.toastMsg('Trag eine Bezeichnung ein.'); return; }
      if (d.to && !parseDate(d.to)) { this.toastMsg('„Gültig bis“ bitte als JJJJ-MM-TT oder leer lassen.'); return; }
      if (!d.to) d.to = null;
      this.setV3({ lics: up(V.lics) });
    }
    else if (kind === 'item') {
      d.n = parseInt(d.n) || 1; d.fam = famGuess(d.col || ''); d.m = methodGuess(d.type || '', d.model || '') || null;
      if (isNew || !d.sw) d.sw = swatchFor(d.fam);
      this.setV3({ boxes: V.boxes.map((b: any) => (b.id === this.state.boxId ? { ...b, items: up(b.items) } : b)) });
    }
    else if (kind === 'box') {
      const boxes = isNew ? [...V.boxes, { id: d.id, name: trim(d.name) || 'Neue Box', items: [] }] : V.boxes.map((b: any) => (b.id === id ? { ...b, name: trim(d.name) || b.name } : b));
      this.setV3({ boxes, todayBox: V.todayBox || d.id });
      if (isNew) this.setState({ boxId: d.id });
    }
    else {
      if (kind === 'combos' && !d.rod) { this.toastMsg('Wähl mindestens eine Rute.'); return; }
      this.setV3({ gear: { ...V.gear, [kind]: up(V.gear[kind] || []) } });
    }
    this.setState({ sheet: null, form: null });
    this.toastMsg(isNew ? 'Angelegt' : 'Gespeichert');
  };
  saveGwForm(d: any, isNew: boolean) {
    const name = trim(d.name);
    if (!name) { this.toastMsg('Trag einen Namen ein.'); return false; }
    const slug = isNew ? slugify(name) : d.slug;
    if (!slug) { this.toastMsg('Der Name braucht mindestens einen Buchstaben oder eine Zahl.'); return false; }
    if (isNew && this.gw(slug)) { this.toastMsg('Dieses Gewässer gibt es schon.'); return false; }
    const kz = String(d.kuerzel || '').toUpperCase().replace(/[^A-Z0-9]/g, '') || initials(name);
    if (kz.length < 2 || kz.length > 3) { this.toastMsg('Das Kürzel braucht 2 bis 3 Buchstaben.'); return false; }
    const old = isNew ? null : this.gw(slug);
    const g: any = old ? clone(old) : newGwDoc(name);
    g.slug = slug; g.name = name; g.kuerzel = kz; g.tide = d.tide || 'prüfen';
    ['typ', 'lage', 'beschreibung'].forEach((k) => { const v = trim(d[k]); if (v) g[k] = v; else delete g[k]; });
    g.zielfische = uniq(String(d.zielfische || '').split(',').map((x) => x.trim()));
    const oldSpots = new Map((old ? old.spots || [] : []).filter((x: any) => x && typeof x === 'object').map((x: any) => [x.name, x]));
    g.spots = uniq(String(d.spots || '').split('\n').map((x) => x.trim())).map((n) => oldSpots.get(n) || { name: n });
    g.aktualisiert = new Date().toISOString();
    this.saveGw(g);
    this.state.sessions.filter((s: any) => s.gewaesser === slug && !isDone(s) && s.gewaesserName !== name).forEach((s: any) => this.saveSession({ ...s, gewaesserName: name }));
    if (isNew) this.setState((st: any) => ({ w: slug, f: g.zielfische[0] || 'Barsch', stack: [...st.stack, { s: 'water' }] }));
    return true;
  }
  rulesOf(slug: string) {
    const V = this.state.v3;
    if (V.rules[slug]) return V.rules[slug];
    const g = this.gw(slug);
    return parseRegeln(g?.regeln || [], uniq([...ZIELFISCHE, ...(g?.zielfische || []), ...(g?.fischarten || [])])).rows.map((r: any, i: number) => ({ ...r, id: 'p' + i }));
  }
  deleteForm = () => {
    const { kind, id } = this.state.form;
    const V = this.state.v3;
    if (kind === 'lic') this.setV3({ lics: V.lics.filter((x: any) => x.id !== id) });
    else if (kind === 'item') this.setV3({ boxes: V.boxes.map((b: any) => (b.id === this.state.boxId ? { ...b, items: b.items.filter((x: any) => x.id !== id) } : b)) });
    else if (kind === 'box') { const rest = V.boxes.filter((b: any) => b.id !== id); this.setV3({ boxes: rest, todayBox: V.todayBox === id ? rest[0]?.id || null : V.todayBox }); this.setState((s: any) => ({ boxId: rest[0]?.id || null, stack: s.stack.filter((x: any) => x.s !== 'box') })); }
    else if (kind === 'rule') this.setV3({ rules: { ...V.rules, [this.state.w]: this.rulesOf(this.state.w).filter((x: any) => x.id !== id) } });
    else if (kind === 'map') this.setV3({ maps: { ...V.maps, [this.state.w]: (V.maps[this.state.w] || []).filter((x: any) => x.id !== id) } });
    else if (kind === 'gw') this.deleteGw(id);
    else if (kind === 'combos') this.setV3({ gear: { ...V.gear, combos: V.gear.combos.filter((c: any) => c.id !== id) } });
    else this.setV3({ gear: { ...V.gear, [kind]: V.gear[kind].filter((x: any) => x.id !== id), combos: V.gear.combos.filter((c: any) => ![c.rod, c.reel, c.line, c.leader].includes(id)) } });
    this.setState({ sheet: null, form: null });
    this.toastMsg(kind === 'combos' ? 'Kombo getrennt' : 'Gelöscht');
  };
  async deleteGw(slug: string) {
    const g = this.gw(slug);
    if (!g || !isNewGw(g) || this.state.sessions.some((s: any) => s.gewaesser === slug)) return;
    try { await del('gewaesser', slug); } catch { this.toastMsg('Löschen fehlgeschlagen.'); return; }
    this.setState((st: any) => ({ gewaesser: st.gewaesser.filter((x: any) => x.slug !== slug), w: st.gewaesser.find((x: any) => x.slug !== slug)?.slug || null, stack: [{ s: 'waters' }] }));
  }

  /* ---------- Übertragen ---------- */
  openSessions() { return this.state.sessions.filter((s: any) => !isDone(s) && !isLive(s)); }
  openGw() { return this.state.gewaesser.filter(isNewGw); }
  spotGw() { return this.state.gewaesser.filter((g: any) => !isNewGw(g) && (g._neueSpots || []).length); }
  async makeExport() {
    try { this.setState({ exp: await buildExport(this.openSessions(), this.openGw(), this.spotGw(), bildData) }); }
    catch { this.toastMsg('Export fehlgeschlagen.'); }
  }
  markPending() {
    const exp = this.state.exp;
    const pending = { at: new Date().toISOString(), sessions: exp.sessions, gewaesser: exp.gewaesser };
    this.setState({ pending });
    putMeta('pendingExport', pending).catch(() => {});
  }
  async shareExport(asFile: boolean) {
    const exp = this.state.exp;
    if (!exp) return;
    const fname = `fangbuch-export-${isoDate(new Date())}.json`;
    try {
      if (asFile) {
        const file = new File([exp.fileJson], fname, { type: 'application/json' });
        if ((navigator as any).canShare?.({ files: [file] })) await navigator.share({ files: [file], text: 'Übernimm diese Sessions aus der Fangbuch-App ins Fangbuch:' } as any);
        else download(exp.fileJson, fname);
      } else if (navigator.share) await navigator.share({ text: exp.text });
      else await this.copyText(exp.text);
      this.markPending();
    } catch (e: any) {
      if (e && e.name === 'AbortError') return;
      this.toastMsg('Teilen ging nicht. Nimm „Text kopieren“.');
    }
  }
  async copyText(text: string) {
    try { await navigator.clipboard.writeText(text); this.toastMsg('Kopiert. Jetzt im Projekt „Angeln“ einfügen.'); return true; }
    catch { const ta = document.getElementById('exporttext') as HTMLTextAreaElement | null; if (ta) { ta.focus(); ta.select(); this.toastMsg('Text ist markiert, jetzt kopieren.'); } return false; }
  }
  async copyExport() { if (!this.state.exp) return; await this.copyText(this.state.exp.text); this.markPending(); }
  confirmPending(ok: boolean) {
    const p = this.state.pending;
    if (!p) return;
    if (ok) {
      const now = new Date().toISOString();
      let changed = 0;
      for (const x of p.sessions) {
        const s = this.state.sessions.find((y: any) => y.appId === x.appId);
        if (!s) continue;
        if (s.aktualisiert !== x.aktualisiert) { changed++; continue; }
        this.saveSession({ ...s, _uebertragenAm: now });
      }
      for (const x of p.gewaesser) {
        const g = this.gw(x.slug);
        if (!g) continue;
        if (x.neueSpots) this.saveGw({ ...g, _neueSpots: (g._neueSpots || []).filter((n: string) => !x.neueSpots.includes(n)) });
        else if (g.aktualisiert === x.aktualisiert) this.saveGw({ ...g, _uebertragenAm: now, _neueSpots: [] });
      }
      this.toastMsg(changed ? `Übertragen. ${changed} ${changed === 1 ? 'Session wurde' : 'Sessions wurden'} danach geändert und ${changed === 1 ? 'bleibt' : 'bleiben'} offen.` : 'Als übertragen markiert');
    } else this.toastMsg('Nichts markiert. Exportier einfach nochmal.');
    this.setState({ pending: null, exp: null });
    del('meta', 'pendingExport').catch(() => {});
  }

  /* ---------- Import, Sicherung, Einstellungen ---------- */
  async doImport(text: string) {
    const gwMap = Object.fromEntries(this.state.gewaesser.map((g: any) => [g.slug, g]));
    const r = await importData(text, gwMap);
    if (r.err) { this.setState({ importMsg: r }); return; }
    this.setState((st: any) => {
      const gs = new Map(st.gewaesser.map((g: any) => [g.slug, g]));
      r.gDocs!.forEach((g) => gs.set(g.slug, g));
      const es = new Map(st.empfehlungen.map((e: any) => [e.id, e]));
      r.eDocs!.forEach((e) => es.set(e.id, e));
      return { gewaesser: sortGw(Array.from(gs.values())), empfehlungen: Array.from(es.values()), importMsg: r, importText: '', w: st.w || r.gDocs![0]?.slug || null };
    });
    if (r.setups!.length) {
      const cleaned = r.setups!.map((x: any) => cleanSetup({ ...x, id: x.id || slugify(x.name) }));
      const map = new Map((this.state.settings.setups || []).map((x: any) => [x.id, x]));
      cleaned.forEach((x: any) => map.set(x.id, x));
      this.setSettings({ setups: Array.from(map.values()) });
      this.setV3({ gear: mergeSetupsIntoGear(this.state.v3.gear, cleaned) });
    }
  }
  async importFile() {
    const f = await pickFile('.json,.txt,application/json,text/plain');
    if (!f) return;
    this.doImport(await f.text());
  }
  async doBackup() {
    try {
      const data = await buildBackup();
      const json = JSON.stringify(data);
      const fname = `fangbuch-sicherung-${isoDate(new Date())}.json`;
      try {
        const file = new File([json], fname, { type: 'application/json' });
        if ((navigator as any).canShare?.({ files: [file] })) await navigator.share({ files: [file] } as any);
        else download(json, fname);
      } catch (e: any) { if (e && e.name === 'AbortError') return; download(json, fname); }
      this.setState({ lastBackup: data.erstellt });
      putMeta('lastBackup', data.erstellt).catch(() => {});
      this.toastMsg('Sicherung erstellt. Leg sie z. B. in iCloud Drive ab.');
    } catch { this.toastMsg('Sicherung fehlgeschlagen.'); }
  }
  async pickRestore() {
    const f = await pickFile('.json,application/json');
    if (!f) return;
    const data = checkBackup(await f.text());
    if (!data) { this.toastMsg('Die Datei ist keine Sicherung der Fangbuch-App.'); return; }
    this.setState({ restore: data });
  }
  async doRestore() {
    const d = this.state.restore;
    if (!d) return;
    try { await restoreBackup(d); } catch { this.toastMsg('Wiederherstellen fehlgeschlagen. Deine bisherigen Daten sind unverändert.'); return; }
    this.wakeOff();
    clearBildCache();
    this.setState({ restore: null, edit: null, exp: null, sheet: null });
    await this.loadAll();
    this.setState({ stack: [{ s: 'more' }, { s: 'data' }] });
    this.toastMsg('Sicherung wiederhergestellt');
  }
  setGps(on: boolean) {
    this.setSettings({ gps: on });
    if (on && navigator.geolocation) navigator.geolocation.getCurrentPosition(() => {}, () => this.toastMsg('Ohne Erlaubnis für den Standort speichert die App keine Position.'), { timeout: 15000 });
    this.toastMsg(on ? 'GPS an' : 'GPS aus');
  }
  setSunPos() {
    if (!navigator.geolocation) { this.toastMsg('Standort ist auf diesem Gerät nicht verfügbar.'); return; }
    this.toastMsg('Standort wird bestimmt …');
    navigator.geolocation.getCurrentPosition((p) => { this.setSettings({ sunPos: { lat: Math.round(p.coords.latitude * 100) / 100, lon: Math.round(p.coords.longitude * 100) / 100 } }); this.toastMsg('Ort für die Dämmerung gespeichert'); }, () => this.toastMsg('Standort nicht verfügbar. Erlaube den Zugriff in den Einstellungen des Handys.'), { timeout: 20000, maximumAge: 600000 });
  }

  render() {
    if (this.state.failed) return <Message title="Speicher nicht verfügbar" text="Die App kann auf diesem Gerät keine Daten speichern. Im privaten Modus von Safari geht das nicht. Öffne die App vom Home-Bildschirm." />;
    if (!this.state.ready) return <Message title="" text="Wird geladen …" />;
    return <AppShell vm={buildVm(this)} />;
  }
}

function Message({ title, text }: { title: string; text: string }) {
  return (
    <div className="app" style={{ justifyContent: 'center', padding: 28, gap: 10, color: 'var(--ink)' }}>
      {title && <h1 style={{ margin: 0, font: '800 26px/1.1 Archivo,sans-serif', fontStretch: '120%' }}>{title}</h1>}
      <p style={{ margin: 0, font: '400 16px/1.5 Archivo,sans-serif', color: 'var(--muted)' }}>{text}</p>
    </div>
  );
}

/* ---------- Hilfen ---------- */
export function sortSessions(arr: any[]) { return arr.slice().sort((a, b) => String(b.datum || '').localeCompare(String(a.datum || '')) || String(b.beginn || '').localeCompare(String(a.beginn || ''))); }
function sortGw(arr: any[]) { return arr.slice().sort((a, b) => String(a.name || a.slug).localeCompare(String(b.name || b.slug), 'de')); }
const fmtM = (m: number) => { m = Math.round(m) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
export function getPath(obj: any, path: string) { return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj); }
export function setPath(obj: any, path: string, val: any) {
  const parts = path.split('.');
  let o = obj;
  for (let i = 0; i < parts.length - 1; i++) { if (o[parts[i]] == null) o[parts[i]] = {}; o = o[parts[i]]; }
  o[parts[parts.length - 1]] = val;
}
const SWATCH: Record<string, string> = { nat: '#8c9a7a', sig: '#c8e03a', dark: '#1c1c22', kon: '#f07a1e', perl: '#d6dbde' };
export const swatchFor = (fam: string | null) => (fam ? SWATCH[fam] : '#7a7f7c');
// Setups der bisherigen App (Rute, Rolle, Hauptschnur, Vorfach als Text) werden zu Teilen und Kombos.
export function gearFromSetups(setups: any[]) {
  return mergeSetupsIntoGear({ rods: [], reels: [], lines: [], leaders: [], combos: [] }, setups);
}
function mergeSetupsIntoGear(gear: any, setups: any[]) {
  const G = clone(gear || { rods: [], reels: [], lines: [], leaders: [], combos: [] });
  const part = (arr: string, field: string, text: string) => {
    if (!trim(text)) return null;
    const ex = G[arr].find((x: any) => trim(x[field]).toLowerCase() === trim(text).toLowerCase());
    if (ex) return ex.id;
    const id = arr[0] + uuid().slice(0, 8);
    G[arr].push({ id, [field]: trim(text), status: 'aktiv', notiz: '' });
    return id;
  };
  setups.forEach((su: any) => {
    const c = { id: su.id, name: su.name || su.id, rod: part('rods', 'modell', su.rute), reel: part('reels', 'modell', su.rolle), line: part('lines', 'typ', su.hauptschnur), leader: part('leaders', 'material', su.vorfach), use: '', status: su.aktiv === false ? 'aussortiert' : 'aktiv' };
    const i = G.combos.findIndex((x: any) => x.id === c.id);
    if (i >= 0) G.combos[i] = { ...G.combos[i], ...c }; else G.combos.push(c);
  });
  return G;
}
