// Aus dem Design „Fangbuch App v3“ übernommen. Struktur und Inline-Styles entsprechen dem Prototyp.
import React from 'react';
import { Indexbalken } from '../components/Indexbalken';
import { ImageSlot } from '../components/ImageSlot';
import type { VM } from '../types';

export function GewaesserDetail({ vm }: { vm: VM }) {
  const { noSpots, newSpot, mapNew, ruleNew, noTestsHint, advRows, anglerOpts, back, bew, br, chev, colorRes, conds, condsLabel, fishChips, goRegeln, grids, hasOtherLic, is, licNew, maps, methods, open, otherLic, plan, provMode, restr, rulesSrc, rulesTab, sec, show, spotOpts, spotProf, spots, startHere, steck, sum, symOpts, testCount, tests, tg, toastSoon, wLic, wSessions, wStats, wv } = vm;
  return (
    <>
    {is.water ? (<>
      <div style={{ display: "flex", flexDirection: "column", paddingBottom: "120px" }}>
        <div style={{ background: "var(--hdr)", color: "var(--hdrink)", padding: "0 20px 18px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <button onClick={back} style={{ alignSelf: "flex-start", height: "48px", padding: "0 12px 0 0", border: "0", background: "transparent", color: "var(--hdrink)", font: "600 16px Archivo,sans-serif", cursor: "pointer" }}>
            {"‹ Zurück"}
          </button>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ font: "800 13px/1 Archivo,sans-serif", fontStretch: "120%", padding: "6px 8px", borderRadius: "8px", border: "1.5px solid var(--hdrink)" }}>
              {wv.short}
            </span>
            <span style={{ font: "500 14px Archivo,sans-serif", color: "var(--hdrmuted)" }}>
              {wv.sub}
            </span>
            {wv.canEdit ? (<button onClick={wv.edit} style={{ marginLeft: "auto", height: "36px", padding: "0 12px", borderRadius: "18px", border: "1px solid rgba(255,255,255,.28)", background: "transparent", color: "var(--hdrink)", font: "600 13px Archivo,sans-serif", cursor: "pointer" }}>{"Bearbeiten"}</button>) : null}
          </div>
          <h1 style={{ margin: "0", font: "800 30px/1.02 Archivo,sans-serif", fontStretch: "125%" }}>
            {wv.name}
          </h1>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "8px" }}>
            {(wv.state || []).map((s: any, i_s6: number) => (<React.Fragment key={i_s6}>
              <div style={{ background: "rgba(255,255,255,.07)", borderRadius: "12px", padding: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ font: "500 12px Archivo,sans-serif", color: "var(--hdrmuted)" }}>
                  {s.k}
                </span>
                <span style={{ font: "700 14px/1.2 Archivo,sans-serif" }}>
                  {s.v}
                </span>
              </div>
            </React.Fragment>))}
          </div>
          <span style={{ font: "500 12px Archivo,sans-serif", color: "var(--hdrmuted)" }}>
            {wv.obs}
          </span>
          <button onClick={tg.conds} style={{ alignSelf: "flex-start", height: "40px", padding: "0 14px", borderRadius: "20px", border: "1px solid rgba(255,255,255,.28)", background: "transparent", color: "var(--hdrink)", font: "600 13px Archivo,sans-serif", cursor: "pointer" }}>
            {condsLabel}
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "12px 0", position: "sticky", top: "0", background: "var(--bg)", zIndex: "3", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", padding: "0 20px" }}>
            {(fishChips || []).map((c: any, i_c6: number) => (<React.Fragment key={i_c6}>
              <button onClick={c.pick} style={c.style}>
                {c.label}
              </button>
            </React.Fragment>))}
          </div>
        </div>
        {(wv.hints || []).map((x: any, i_x4: number) => (<React.Fragment key={i_x4}>
          <button onClick={goRegeln} style={x.style}>
            <span style={x.dot}>
              {"!"}
            </span>
            <span style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ font: "800 15px/1.25 Archivo,sans-serif" }}>
                {x.title}
              </span>
              <span style={{ font: "500 13px/1.35 Archivo,sans-serif", color: "var(--muted)" }}>
                {x.text}
              </span>
            </span>
          </button>
        </React.Fragment>))}
        {open.conds ? (<>
          <div style={{ padding: "16px 20px 0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", color: "var(--ink)" }}>
              <h2 style={{ margin: "0", font: "800 19px/1.1 Archivo,sans-serif", fontStretch: "118%" }}>
                {"Bedingungen heute"}
              </h2>
              <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "16px", padding: "2px 14px" }}>
                {(conds || []).map((c: any, i_c8: number) => (<React.Fragment key={i_c8}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                    <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ font: "500 12px Archivo,sans-serif", color: "var(--muted)" }}>
                        {c.k}
                      </span>
                      <span style={{ font: "600 15px/1.3 Archivo,sans-serif" }}>
                        {c.v}
                      </span>
                      <span style={{ font: "400 12px/1.3 Archivo,sans-serif", color: "var(--muted)" }}>
                        {c.src}
                      </span>
                    </div>
                    <span style={c.tagStyle}>
                      {c.origin}
                    </span>
                  </div>
                </React.Fragment>))}
                <div style={{ padding: "12px 0", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ font: "500 12px Archivo,sans-serif", color: "var(--muted)" }}>
                    {"Andere Angler gesehen?"}
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "6px" }}>
                    {(anglerOpts || []).map((o: any, i_o10: number) => (<React.Fragment key={i_o10}>
                      <button onClick={o.pick} style={o.style}>
                        {o.label}
                      </button>
                    </React.Fragment>))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>) : null}
        {wv.absent ? (<>
          <div style={{ margin: "20px", padding: "18px", borderRadius: "18px", border: "1.5px dashed var(--muted)", display: "flex", flexDirection: "column", gap: "8px", color: "var(--ink)" }}>
            <span style={{ font: "800 18px Archivo,sans-serif", fontStretch: "115%" }}>
              {wv.absentTitle}
            </span>
            <span style={{ font: "400 15px/1.45 Archivo,sans-serif", color: "var(--muted)" }}>
              {wv.absentText}
            </span>
          </div>
        </>) : null}
        {show.plan ? (<>
          <div id="sec-plan" style={{ margin: "26px 20px 0", paddingTop: "14px", borderTop: "2px solid var(--ink)", display: "flex", flexDirection: "column", gap: "3px", color: "var(--ink)" }}>
            <span style={{ font: "800 22px/1.1 Archivo,sans-serif", fontStretch: "120%" }}>
              {"Heute"}
            </span>
            <span style={{ font: "500 13px Archivo,sans-serif", color: "var(--muted)" }}>
              {"Bewährt und Heute testen"}
            </span>
          </div>
          {sec.plan ? (<>
            <div style={{ padding: "18px 20px 0", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ background: "var(--hdr)", color: "var(--hdrink)", borderRadius: "18px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
                  <h2 style={{ margin: "0", font: "800 19px/1.1 Archivo,sans-serif", fontStretch: "118%" }}>
                    {"Bewährt"}
                  </h2>
                  <span style={{ font: "500 13px Archivo,sans-serif", color: "var(--hdrmuted)" }}>
                    {"Der sichere Start"}
                  </span>
                </div>
                {(bew.items || []).map((b: any, i_b8: number) => (<React.Fragment key={i_b8}>
                  <button onClick={b.open} style={{ textAlign: "left", cursor: "pointer", border: "0", background: "rgba(255,255,255,.08)", borderRadius: "14px", padding: "12px", color: "var(--hdrink)", display: "flex", alignItems: "center", gap: "12px", minHeight: "60px" }}>
                    <div style={{ display: "flex", flex: "none" }}>
                      {(b.sw || []).map((s: any, i_s11: number) => (<React.Fragment key={i_s11}>
                        <span style={s.style} />
                      </React.Fragment>))}
                    </div>
                    <span style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px" }}>
                      <span style={{ font: "700 11px Archivo,sans-serif", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--hdrmuted)" }}>
                        {b.kind}
                      </span>
                      <span style={{ font: "800 16px/1.2 Archivo,sans-serif" }}>
                        {b.name}
                      </span>
                      <span style={{ font: "500 12px/1.3 Archivo,sans-serif", color: "var(--hdrmuted)" }}>
                        {b.basis}
                      </span>
                    </span>
                    <span style={{ font: "800 14px Archivo,sans-serif", flex: "none" }}>
                      {b.word}
                    </span>
                  </button>
                </React.Fragment>))}
                {bew.hasPromo ? (<>
                  <span style={{ font: "600 13px/1.4 Archivo,sans-serif", padding: "9px 11px", borderRadius: "10px", border: "1px dashed var(--hdrmuted)" }}>
                    {bew.promo}
                  </span>
                </>) : null}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
                  <h2 style={{ margin: "0", font: "800 19px/1.1 Archivo,sans-serif", fontStretch: "118%", color: "var(--ink)" }}>
                    {"Heute testen"}
                  </h2>
                  <span style={{ font: "700 13px Archivo,sans-serif", color: "var(--orange)" }}>
                    {testCount}
                  </span>
                </div>
                <span style={{ font: "400 14px/1.4 Archivo,sans-serif", color: "var(--muted)" }}>
                  {"Hohes Potenzial bei dünner eigener Datenlage. Höchstens 2 Tests pro Session, damit sich die Bisse eindeutig zuordnen lassen."}
                </span>
                {noTestsHint ? (<span style={{ font: "400 14px/1.4 Archivo,sans-serif", color: "var(--muted)" }}>{"Gerade nichts zu testen. Vorschläge aus dem Fangbuch erscheinen hier nach dem Import."}</span>) : null}
                {(tests || []).map((t: any, i_t8: number) => (<React.Fragment key={i_t8}>
                  <div style={t.cardStyle}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px" }}>
                        <span style={{ font: "700 11px Archivo,sans-serif", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--orange)" }}>
                          {t.kindLabel}
                        </span>
                        <span style={{ font: "800 17px/1.15 Archivo,sans-serif", fontStretch: "112%", color: "var(--ink)" }}>
                          {t.title}
                        </span>
                      </div>
                      <div style={{ display: "flex", flex: "none" }}>
                        {(t.sw || []).map((s: any, i_s12: number) => (<React.Fragment key={i_s12}>
                          <span style={s.style} />
                        </React.Fragment>))}
                      </div>
                    </div>
                    <span style={{ font: "400 15px/1.4 Archivo,sans-serif", color: "var(--ink)" }}>
                      {t.why}
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", borderTop: "1px solid var(--line)", paddingTop: "10px" }}>
                      {(t.rows || []).map((r: any, i_r11: number) => (<React.Fragment key={i_r11}>
                        <div style={{ display: "flex", gap: "12px", font: "400 14px/1.35 Archivo,sans-serif", color: "var(--ink)" }}>
                          <span style={{ width: "64px", flex: "none", color: "var(--muted)" }}>
                            {r.k}
                          </span>
                          <span style={{ flex: "1", fontWeight: "600" }}>
                            {r.v}
                          </span>
                        </div>
                      </React.Fragment>))}
                    </div>
                    <span style={{ font: "600 12px Archivo,sans-serif", color: "var(--muted)" }}>
                      {t.basis}
                    </span>
                    <button onClick={t.toggle} style={t.btnStyle}>
                      {t.btnLabel}
                    </button>
                  </div>
                </React.Fragment>))}
              </div>
              <button onClick={tg.plan} style={{ minHeight: "52px", borderRadius: "14px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: "0 14px", font: "700 15px Archivo,sans-serif" }}>
                <span>
                  {"Ablauf für heute · "}
                  {plan.win}
                </span>
                <span style={{ fontSize: "20px" }}>
                  {chev.plan}
                </span>
              </button>
              {open.plan ? (<>
                <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "18px", padding: "16px", display: "flex", flexDirection: "column", gap: "14px", color: "var(--ink)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
                    <h2 style={{ margin: "0", font: "800 19px/1.1 Archivo,sans-serif", fontStretch: "118%" }}>
                      {"Plan für heute"}
                    </h2>
                    <span style={{ font: "500 13px Archivo,sans-serif", color: "var(--muted)" }}>
                      {plan.dur}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ font: "500 12px Archivo,sans-serif", color: "var(--muted)" }}>
                      {"Zeitfenster"}
                    </span>
                    <span style={{ font: "800 28px/1.05 Archivo,sans-serif", fontStretch: "112%", fontVariantNumeric: "tabular-nums" }}>
                      {plan.win}
                    </span>
                  </div>
                  <Indexbalken value={plan.score} own={plan.own} mode={provMode} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "0", borderTop: "1px solid var(--line)" }}>
                    {(plan.steps || []).map((p: any, i_p10: number) => (<React.Fragment key={i_p10}>
                      <div style={{ display: "flex", gap: "12px", padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
                        <span style={{ font: "800 14px/1 Archivo,sans-serif", width: "28px", height: "28px", borderRadius: "50%", border: "2px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                          {p.n}
                        </span>
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px", flex: "1" }}>
                          <span style={{ font: "700 15px Archivo,sans-serif" }}>
                            <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--muted)" }}>
                              {"ab "}
                              {p.t}
                            </span>
                            {" · "}
                            {p.spot}
                          </span>
                          <span style={{ font: "400 14px/1.4 Archivo,sans-serif", color: "var(--muted)" }}>
                            {p.what}
                          </span>
                        </div>
                      </div>
                    </React.Fragment>))}
                  </div>
                  <button onClick={plan.openStart} style={{ textAlign: "left", cursor: "pointer", border: "0", background: "var(--surface2)", borderRadius: "14px", padding: "12px 14px", color: "var(--ink)", display: "flex", flexDirection: "column", gap: "4px", minHeight: "56px" }}>
                    <span style={{ font: "700 12px Archivo,sans-serif", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--muted)" }}>
                      {"Starte mit"}
                    </span>
                    <span style={{ font: "700 15px/1.35 Archivo,sans-serif" }}>
                      {plan.start}
                      {" ›"}
                    </span>
                  </button>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ font: "700 12px Archivo,sans-serif", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--muted)" }}>
                      {"Plan B"}
                    </span>
                    <span style={{ font: "400 15px/1.4 Archivo,sans-serif" }}>
                      {plan.planB}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ font: "700 12px Archivo,sans-serif", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--muted)" }}>
                      {"Achte auf"}
                    </span>
                    {(plan.watch || []).map((x: any, i_x10: number) => (<React.Fragment key={i_x10}>
                      <div style={{ display: "flex", gap: "10px", font: "400 15px/1.4 Archivo,sans-serif" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "2px", transform: "rotate(45deg)", background: "var(--orange)", marginTop: "7px", flex: "none" }} />
                        <span>
                          {x.t}
                        </span>
                      </div>
                    </React.Fragment>))}
                  </div>
                </div>
              </>) : null}
              <button onClick={startHere} style={{ height: "60px", borderRadius: "16px", border: "0", background: "var(--ink)", color: "var(--bg)", font: "800 17px Archivo,sans-serif", fontStretch: "112%", cursor: "pointer" }}>
                {"Hier Session starten"}
              </button>
            </div>
          </>) : null}
        </>) : null}
        {show.methoden ? (<>
          <div id="sec-methoden" style={{ margin: "26px 20px 0", paddingTop: "14px", borderTop: "2px solid var(--ink)", display: "flex", flexDirection: "column", gap: "3px", color: "var(--ink)" }}>
            <span style={{ font: "800 22px/1.1 Archivo,sans-serif", fontStretch: "120%" }}>
              {"Methoden-Index"}
            </span>
            <span style={{ font: "500 13px Archivo,sans-serif", color: "var(--muted)" }}>
              {"Alle Techniken, die beste oben"}
            </span>
          </div>
          {sec.methoden ? (<>
            <div style={{ padding: "18px 20px 0", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ font: "500 14px/1.4 Archivo,sans-serif", color: "var(--muted)" }}>
                {"Alle Techniken für "}
                {wv.fishName}
                {" heute, die beste oben. Tippe für Köder, Führung und Kombo."}
              </span>
              {(methods || []).map((m: any, i_m7: number) => (<React.Fragment key={i_m7}>
                <button onClick={m.open} style={m.cardStyle}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", width: "100%" }}>
                    <span style={{ font: "800 17px/1.15 Archivo,sans-serif", fontStretch: "112%", flex: "1" }}>
                      {m.name}
                    </span>
                    {m.best ? (<>
                      <span style={{ font: "700 11px/1 Archivo,sans-serif", letterSpacing: ".05em", textTransform: "uppercase", padding: "5px 7px", borderRadius: "6px", background: "var(--orange)", color: "var(--onorange)" }}>
                        {"Beste Wahl"}
                      </span>
                    </>) : null}
                    <span style={{ font: "600 20px/1 Archivo,sans-serif", color: "var(--muted)" }}>
                      {"›"}
                    </span>
                  </div>
                  <span style={{ font: "500 13px Archivo,sans-serif", color: "var(--muted)" }}>
                    {m.tech}
                  </span>
                  <Indexbalken value={m.score} own={m.own} basis={m.basis} mode={provMode} />
                </button>
              </React.Fragment>))}
            </div>
          </>) : null}
        </>) : null}
        {show.farben ? (<>
          <div id="sec-farben" style={{ margin: "26px 20px 0", paddingTop: "14px", borderTop: "2px solid var(--ink)", display: "flex", flexDirection: "column", gap: "3px", color: "var(--ink)" }}>
            <span style={{ font: "800 22px/1.1 Archivo,sans-serif", fontStretch: "120%" }}>
              {"Köderfarben"}
            </span>
            <span style={{ font: "500 13px Archivo,sans-serif", color: "var(--muted)" }}>
              {"Berater und Empfehlung aus deiner Box"}
            </span>
          </div>
          {sec.farben ? (<>
            <div style={{ padding: "18px 20px 0", display: "flex", flexDirection: "column", gap: "16px", color: "var(--ink)" }}>
              <span style={{ font: "500 14px/1.4 Archivo,sans-serif", color: "var(--muted)" }}>
                {"Vorausgefüllt aus Wetter und letzter Beobachtung. Tippe zum Ändern."}
              </span>
              {(advRows || []).map((r: any, i_r7: number) => (<React.Fragment key={i_r7}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ font: "700 12px Archivo,sans-serif", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--muted)" }}>
                    {r.label}
                  </span>
                  <div style={r.gridStyle}>
                    {(r.opts || []).map((o: any, i_o10: number) => (<React.Fragment key={i_o10}>
                      <button onClick={o.pick} style={o.style}>
                        {o.label}
                      </button>
                    </React.Fragment>))}
                  </div>
                </div>
              </React.Fragment>))}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "6px" }}>
                <h2 style={{ margin: "0", font: "800 19px/1.1 Archivo,sans-serif", fontStretch: "118%" }}>
                  {"Empfehlung"}
                </h2>
                {(colorRes || []).map((c: any, i_c8: number) => (<React.Fragment key={i_c8}>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "18px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ display: "flex", flex: "none" }}>
                        {(c.sw || []).map((s: any, i_s12: number) => (<React.Fragment key={i_s12}>
                          <span style={s.style} />
                        </React.Fragment>))}
                      </div>
                      <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ font: "800 16px/1.15 Archivo,sans-serif", fontStretch: "112%" }}>
                          {c.rank}
                          {". "}
                          {c.name}
                        </span>
                        <span style={{ font: "500 13px Archivo,sans-serif", color: "var(--muted)" }}>
                          {c.ex}
                        </span>
                      </div>
                    </div>
                    <Indexbalken value={c.score} own={c.own} basis={c.basis} mode={provMode} />
                    <span style={{ font: "400 15px/1.4 Archivo,sans-serif" }}>
                      {c.reason}
                    </span>
                    <span style={c.supStyle}>
                      {c.support}
                    </span>
                  </div>
                </React.Fragment>))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
                  <h2 style={{ margin: "0", font: "800 19px/1.1 Archivo,sans-serif", fontStretch: "118%" }}>
                    {"Aus deiner Box"}
                  </h2>
                  <span style={{ font: "600 13px Archivo,sans-serif", color: "var(--muted)" }}>
                    {"Heute dabei"}
                  </span>
                </div>
                {br.noBox ? (<button onClick={br.goBoxes} style={{ minHeight: "52px", borderRadius: "14px", border: "1.5px dashed var(--muted)", background: "transparent", color: "var(--ink)", font: "600 14px/1.35 Archivo,sans-serif", cursor: "pointer", textAlign: "left", padding: "10px 14px" }}>{"Noch keine Köderbox. Leg unter „Mehr › Köderbox“ eine an, dann empfiehlt die App Köder daraus. ›"}</button>) : null}
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {(br.boxOpts || []).map((o: any, i_o9: number) => (<React.Fragment key={i_o9}>
                    <button onClick={o.pick} style={o.style}>
                      {o.label}
                    </button>
                  </React.Fragment>))}
                </div>
                {(br.items || []).map((r: any, i_r8: number) => (<React.Fragment key={i_r8}>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "18px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <span style={r.sw} />
                      <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ font: "800 16px/1.15 Archivo,sans-serif", fontStretch: "110%" }}>
                          {r.title}
                        </span>
                        <span style={{ font: "500 13px Archivo,sans-serif", color: "var(--muted)" }}>
                          {r.n}
                        </span>
                      </div>
                    </div>
                    <Indexbalken value={r.score} own={r.own} basis={r.basis} mode={provMode} />
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {(r.rows || []).map((x: any, i_x11: number) => (<React.Fragment key={i_x11}>
                        <div style={{ display: "flex", gap: "12px", font: "400 14px/1.35 Archivo,sans-serif" }}>
                          <span style={{ width: "64px", flex: "none", color: "var(--muted)" }}>
                            {x.k}
                          </span>
                          <span style={{ flex: "1", fontWeight: "600" }}>
                            {x.v}
                          </span>
                        </div>
                      </React.Fragment>))}
                    </div>
                    <span style={{ font: "400 14px/1.4 Archivo,sans-serif" }}>
                      {r.why}
                    </span>
                  </div>
                </React.Fragment>))}
                {br.hasMissing ? (<>
                  <span style={{ font: "500 13px/1.4 Archivo,sans-serif", color: "var(--muted)", padding: "10px 12px", border: "1px dashed var(--muted)", borderRadius: "12px" }}>
                    {br.missing}
                  </span>
                </>) : null}
              </div>
            </div>
          </>) : null}
        </>) : null}
        {show.spots ? (<>
          <button id="sec-spots" onClick={tg.spots} style={{ margin: "18px 20px 0", width: "calc(100% - 40px)", minHeight: "68px", padding: "12px 0 4px", border: "0", borderTop: "2px solid var(--ink)", background: "transparent", color: "var(--ink)", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}>
            <span style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={{ font: "800 22px/1.1 Archivo,sans-serif", fontStretch: "120%" }}>
                {"Spots"}
              </span>
              <span style={{ font: "500 13px Archivo,sans-serif", color: "var(--muted)" }}>
                {sum.spots}
              </span>
            </span>
            <span style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1.5px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", font: "700 22px/1 Archivo,sans-serif", flex: "none" }}>
              {chev.spots}
            </span>
          </button>
          {sec.spots ? (<>
            <div style={{ padding: "18px 20px 0", display: "flex", flexDirection: "column", gap: "12px", color: "var(--ink)" }}>
              {(spots || []).map((s: any, i_s7: number) => (<React.Fragment key={i_s7}>
                <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "18px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <span style={{ font: "800 16px/1 Archivo,sans-serif", width: "40px", height: "40px", borderRadius: "50%", background: "var(--hdr)", color: "var(--hdrink)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                      {s.id}
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ font: "800 17px/1.15 Archivo,sans-serif", fontStretch: "112%" }}>
                        {s.name}
                      </span>
                      <span style={{ font: "500 13px Archivo,sans-serif", color: "var(--muted)" }}>
                        {s.struct}
                      </span>
                    </div>
                  </div>
                  <Indexbalken value={s.score} own={s.own} mode={provMode} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 12px", borderTop: "1px solid var(--line)", paddingTop: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ font: "500 12px Archivo,sans-serif", color: "var(--muted)" }}>
                        {"Tiefe"}
                      </span>
                      <span style={{ font: "600 14px Archivo,sans-serif" }}>
                        {s.depth}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ font: "500 12px Archivo,sans-serif", color: "var(--muted)" }}>
                        {"Grund"}
                      </span>
                      <span style={{ font: "600 14px Archivo,sans-serif" }}>
                        {s.ground}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ font: "500 12px Archivo,sans-serif", color: "var(--muted)" }}>
                        {"Notiz"}
                      </span>
                      <span style={{ font: "600 14px Archivo,sans-serif" }}>
                        {s.best}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ font: "500 12px Archivo,sans-serif", color: "var(--muted)" }}>
                        {"Deine Bilanz"}
                      </span>
                      <span style={{ font: "600 14px Archivo,sans-serif" }}>
                        {s.bilanz}
                      </span>
                    </div>
                  </div>
                </div>
              </React.Fragment>))}
              {noSpots ? (<span style={{ font: "400 14px/1.4 Archivo,sans-serif", color: "var(--muted)" }}>{"Noch keine Spots. Importier sie aus dem Fangbuch oder leg sie hier an."}</span>) : null}
              <button onClick={newSpot} style={{ height: "52px", borderRadius: "14px", border: "1.5px dashed var(--muted)", background: "transparent", color: "var(--ink)", font: "700 15px Archivo,sans-serif", cursor: "pointer" }}>{"+ Spot hinzufügen"}</button>
            </div>
          </>) : null}
        </>) : null}
        {show.karten ? (<>
          <button id="sec-karten" onClick={tg.karten} style={{ margin: "18px 20px 0", width: "calc(100% - 40px)", minHeight: "68px", padding: "12px 0 4px", border: "0", borderTop: "2px solid var(--ink)", background: "transparent", color: "var(--ink)", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}>
            <span style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={{ font: "800 22px/1.1 Archivo,sans-serif", fontStretch: "120%" }}>
                {"Karten und Tiefen"}
              </span>
              <span style={{ font: "500 13px Archivo,sans-serif", color: "var(--muted)" }}>
                {sum.karten}
              </span>
            </span>
            <span style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1.5px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", font: "700 22px/1 Archivo,sans-serif", flex: "none" }}>
              {chev.karten}
            </span>
          </button>
          {sec.karten ? (<>
            <div style={{ padding: "18px 20px 0", display: "flex", flexDirection: "column", gap: "16px", color: "var(--ink)" }}>
              <span style={{ font: "500 14px/1.4 Archivo,sans-serif", color: "var(--muted)" }}>
                {"Tiefenkarten und eigene Fotos, offline auf dem Handy. Bild auf die Fläche ziehen oder antippen, um es zu ersetzen."}
              </span>
              {(maps || []).map((mp: any, i_mp7: number) => (<React.Fragment key={i_mp7}>
                <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "18px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ padding: "14px 14px 10px", display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                      <span style={{ font: "800 16px/1.15 Archivo,sans-serif", fontStretch: "112%" }}>
                        {mp.title}
                      </span>
                      <span style={{ font: "500 12px/1.35 Archivo,sans-serif", color: "var(--muted)" }}>
                        {mp.src}
                        {" · "}
                        {mp.date}
                      </span>
                    </div>
                    <button onClick={mp.edit} style={{ height: "36px", padding: "0 12px", borderRadius: "10px", border: "1px solid var(--line)", background: "var(--surface2)", color: "var(--ink)", font: "600 13px Archivo,sans-serif", cursor: "pointer", flex: "none" }}>{"Bearbeiten"}</button>
                  </div>
                  <div style={{ overflow: "auto", maxHeight: "300px", background: "var(--surface2)" }}>
                    <div style={mp.innerStyle}>
                      <ImageSlot id={mp.slotId} placeholder={mp.ph} shape="rect" style={{ position: "absolute", inset: "0", width: "100%", height: "100%" }} />
                      {(mp.marks || []).map((k: any, i_k11: number) => (<React.Fragment key={i_k11}>
                        <span style={k.style}>
                          {k.t}
                        </span>
                      </React.Fragment>))}
                      {mp.editing ? (<>
                        <div onClick={mp.tapAdd} style={{ position: "absolute", inset: "0", zIndex: "3", cursor: "crosshair", background: "rgba(0,0,0,.06)", outline: "3px dashed var(--orange)", outlineOffset: "-3px" }} />
                      </>) : null}
                    </div>
                  </div>
                  <div style={{ padding: "10px 14px", display: "flex", gap: "8px", alignItems: "center" }}>
                    <button onClick={mp.zoomOut} style={{ width: "48px", height: "48px", borderRadius: "14px", border: "1px solid var(--line)", background: "var(--surface2)", color: "var(--ink)", font: "800 20px Archivo,sans-serif", cursor: "pointer" }}>
                      {"−"}
                    </button>
                    <button onClick={mp.zoomIn} style={{ width: "48px", height: "48px", borderRadius: "14px", border: "1px solid var(--line)", background: "var(--surface2)", color: "var(--ink)", font: "800 20px Archivo,sans-serif", cursor: "pointer" }}>
                      {"+"}
                    </button>
                    <span style={{ flex: "1", font: "600 13px Archivo,sans-serif", color: "var(--muted)" }}>
                      {mp.zoomText}
                    </span>
                    <button onClick={mp.toggleEdit} style={mp.editBtn}>
                      {mp.editLabel}
                    </button>
                  </div>
                  {mp.editing ? (<>
                    <div style={{ padding: "0 14px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <span style={{ font: "700 12px Archivo,sans-serif", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--muted)" }}>
                        {"Symbol wählen, dann aufs Bild tippen"}
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {(symOpts || []).map((o: any, i_o12: number) => (<React.Fragment key={i_o12}>
                          <button onClick={o.pick} style={o.style}>
                            {o.label}
                          </button>
                        </React.Fragment>))}
                      </div>
                      <span style={{ font: "700 12px Archivo,sans-serif", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--muted)" }}>
                        {"Verknüpfen mit Spot"}
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {(spotOpts || []).map((o: any, i_o12: number) => (<React.Fragment key={i_o12}>
                          <button onClick={o.pick} style={o.style}>
                            {o.label}
                          </button>
                        </React.Fragment>))}
                      </div>
                    </div>
                  </>) : null}
                  <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {(mp.legend || []).map((l: any, i_l10: number) => (<React.Fragment key={i_l10}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", font: "500 13px Archivo,sans-serif" }}>
                        <span style={{ fontWeight: "700" }}>
                          {l.t}
                        </span>
                        <span style={{ color: "var(--muted)", textAlign: "right" }}>
                          {l.v}
                        </span>
                      </div>
                    </React.Fragment>))}
                    <div style={{ background: "var(--surface2)", borderRadius: "12px", padding: "10px 12px", display: "flex", flexDirection: "column", gap: "3px" }}>
                      <span style={{ font: "700 13px/1.35 Archivo,sans-serif" }}>
                        {mp.levelLine}
                      </span>
                      <span style={{ font: "500 13px/1.4 Archivo,sans-serif", color: "var(--muted)" }}>
                        {mp.convLine}
                      </span>
                    </div>
                  </div>
                </div>
              </React.Fragment>))}
              <button onClick={mapNew} style={{ height: "56px", borderRadius: "16px", border: "1.5px dashed var(--muted)", background: "transparent", color: "var(--ink)", font: "700 15px Archivo,sans-serif", cursor: "pointer" }}>
                {"+ Karte oder Foto hinzufügen"}
              </button>
              <h2 style={{ margin: "4px 0 0", font: "800 19px/1.1 Archivo,sans-serif", fontStretch: "118%" }}>
                {"Spot-Profile"}
              </h2>
              {(spotProf || []).map((sp: any, i_sp7: number) => (<React.Fragment key={i_sp7}>
                <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "16px", padding: "4px 14px 6px" }}>
                  <div style={{ font: "800 16px Archivo,sans-serif", fontStretch: "112%", padding: "10px 0 4px" }}>
                    {sp.title}
                  </div>
                  {(sp.rows || []).map((r: any, i_r9: number) => (<React.Fragment key={i_r9}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "8px 0", borderTop: "1px solid var(--line)" }}>
                      <span style={{ font: "500 12px Archivo,sans-serif", color: "var(--muted)" }}>
                        {r.k}
                      </span>
                      <span style={{ font: "600 14px/1.35 Archivo,sans-serif" }}>
                        {r.v}
                      </span>
                      <span style={{ font: "400 12px Archivo,sans-serif", color: "var(--muted)" }}>
                        {r.src}
                      </span>
                    </div>
                  </React.Fragment>))}
                </div>
              </React.Fragment>))}
            </div>
          </>) : null}
        </>) : null}
        {show.sessions ? (<>
          <button id="sec-sessions" onClick={tg.sessions} style={{ margin: "18px 20px 0", width: "calc(100% - 40px)", minHeight: "68px", padding: "12px 0 4px", border: "0", borderTop: "2px solid var(--ink)", background: "transparent", color: "var(--ink)", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}>
            <span style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={{ font: "800 22px/1.1 Archivo,sans-serif", fontStretch: "120%" }}>
                {"Sessions und Wissensstand"}
              </span>
              <span style={{ font: "500 13px Archivo,sans-serif", color: "var(--muted)" }}>
                {sum.sessions}
              </span>
            </span>
            <span style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1.5px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", font: "700 22px/1 Archivo,sans-serif", flex: "none" }}>
              {chev.sessions}
            </span>
          </button>
          {sec.sessions ? (<>
            <div style={{ padding: "18px 20px 0", display: "flex", flexDirection: "column", gap: "12px", color: "var(--ink)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "8px" }}>
                {(wStats || []).map((k: any, i_k8: number) => (<React.Fragment key={i_k8}>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "14px", padding: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ font: "800 20px/1 Archivo,sans-serif", fontStretch: "110%", fontVariantNumeric: "tabular-nums" }}>
                      {k.v}
                    </span>
                    <span style={{ font: "500 11px/1.2 Archivo,sans-serif", color: "var(--muted)" }}>
                      {k.k}
                    </span>
                  </div>
                </React.Fragment>))}
              </div>
              {(wSessions || []).map((s: any, i_s7: number) => (<React.Fragment key={i_s7}>
                <button onClick={s.open} style={{ textAlign: "left", cursor: "pointer", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "16px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px", color: "var(--ink)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", width: "100%" }}>
                    <span style={{ font: "700 15px Archivo,sans-serif" }}>
                      {s.dl}
                      {" · "}
                      {s.fish}
                    </span>
                    <span style={s.resStyle}>
                      {s.res}
                    </span>
                  </div>
                  <div style={s.track}>
                    <div style={s.span} />
                    {(s.marks || []).map((mk: any, i_mk10: number) => (<React.Fragment key={i_mk10}>
                      <span style={mk.style} />
                    </React.Fragment>))}
                  </div>
                </button>
              </React.Fragment>))}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", color: "var(--ink)" }}>
                <h2 style={{ margin: "0", font: "800 19px/1.1 Archivo,sans-serif", fontStretch: "118%" }}>
                  {"Wissensstand"}
                </h2>
                <span style={{ font: "400 14px/1.4 Archivo,sans-serif", color: "var(--muted)" }}>
                  {"Eigene Sessions je Feld. Tippe auf eine Lücke, dann schlage ich einen passenden Test vor."}
                </span>
                {(grids || []).map((g: any, i_g8: number) => (<React.Fragment key={i_g8}>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "16px", padding: "12px", display: "flex", flexDirection: "column", gap: "5px" }}>
                    <span style={{ font: "800 14px Archivo,sans-serif", marginBottom: "4px" }}>
                      {g.title}
                    </span>
                    <div style={g.headStyle}>
                      <span />
                      {(g.cols || []).map((c: any, i_c11: number) => (<React.Fragment key={i_c11}>
                        <span style={{ font: "600 11px/1.2 Archivo,sans-serif", color: "var(--muted)", textAlign: "center" }}>
                          {c.t}
                        </span>
                      </React.Fragment>))}
                    </div>
                    {(g.rows || []).map((r: any, i_r10: number) => (<React.Fragment key={i_r10}>
                      <div style={g.headStyle}>
                        <span style={{ font: "600 13px/1.15 Archivo,sans-serif", alignSelf: "center" }}>
                          {r.label}
                        </span>
                        {(r.cells || []).map((c: any, i_c12: number) => (<React.Fragment key={i_c12}>
                          <button onClick={c.tap} style={c.style}>
                            {c.n}
                          </button>
                        </React.Fragment>))}
                      </div>
                    </React.Fragment>))}
                  </div>
                </React.Fragment>))}
                <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", font: "500 12px Archivo,sans-serif", color: "var(--muted)" }}>
                  <span style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <span style={{ width: "16px", height: "12px", borderRadius: "3px", border: "1.5px dashed var(--muted)" }} />
                    {"Lücke"}
                  </span>
                  <span style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <span style={{ width: "16px", height: "12px", borderRadius: "3px", border: "1px solid var(--reed)", background: "repeating-linear-gradient(135deg, color-mix(in oklab, var(--reed) 45%, transparent) 0 3px, transparent 3px 6px)" }} />
                    {"1 bis 2 Sessions"}
                  </span>
                  <span style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <span style={{ width: "16px", height: "12px", borderRadius: "3px", background: "var(--reed)" }} />
                    {"ab 3 Sessions"}
                  </span>
                </div>
              </div>
            </div>
          </>) : null}
        </>) : null}
        {show.regeln ? (<>
          <button id="sec-regeln" onClick={tg.regeln} style={{ margin: "18px 20px 0", width: "calc(100% - 40px)", minHeight: "68px", padding: "12px 0 4px", border: "0", borderTop: "2px solid var(--ink)", background: "transparent", color: "var(--ink)", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}>
            <span style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={{ font: "800 22px/1.1 Archivo,sans-serif", fontStretch: "120%" }}>
                {"Lizenzen und Regeln"}
              </span>
              <span style={{ font: "500 13px Archivo,sans-serif", color: "var(--muted)" }}>
                {sum.regeln}
              </span>
            </span>
            <span style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1.5px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", font: "700 22px/1 Archivo,sans-serif", flex: "none" }}>
              {chev.regeln}
            </span>
          </button>
          {sec.regeln ? (<>
            <div style={{ padding: "18px 20px 0", display: "flex", flexDirection: "column", gap: "20px", color: "var(--ink)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <h2 style={{ margin: "0", font: "800 19px/1.1 Archivo,sans-serif", fontStretch: "118%" }}>
                  {"Lizenzen"}
                </h2>
                <span style={{ font: "400 13px/1.4 Archivo,sans-serif", color: "var(--muted)" }}>
                  {"Einmal gespeichert und mehreren Gewässern zugeordnet. Änderungen gelten überall."}
                </span>
                {(wLic || []).map((l: any, i_l8: number) => (<React.Fragment key={i_l8}>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "16px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <div style={{ width: "64px", height: "48px", flex: "none", position: "relative", borderRadius: "8px", overflow: "hidden" }}>
                        <ImageSlot id={l.slotId} placeholder="Foto" radius="8" style={{ position: "absolute", inset: "0", width: "100%", height: "100%" }} />
                      </div>
                      <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ font: "800 15px/1.2 Archivo,sans-serif" }}>
                          {l.type}
                        </span>
                        <span style={{ font: "500 13px Archivo,sans-serif", color: "var(--muted)" }}>
                          {l.issuer}
                        </span>
                      </div>
                      <span style={l.badge}>
                        {l.status}
                      </span>
                    </div>
                    {l.hasBar ? (<>
                      <div style={{ position: "relative", height: "10px", borderRadius: "5px", background: "var(--track)", marginTop: "4px" }}>
                        <div style={l.fill} />
                        <span style={l.tick} />
                        <span style={l.now} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "6px", font: "500 12px Archivo,sans-serif", color: "var(--muted)" }}>
                        <span>
                          {l.fromT}
                        </span>
                        <span>
                          {l.orderT}
                        </span>
                        <span>
                          {l.toT}
                        </span>
                      </div>
                    </>) : null}
                    <span style={{ font: "600 14px/1.35 Archivo,sans-serif" }}>
                      {l.line}
                    </span>
                    <span style={{ font: "400 13px/1.35 Archivo,sans-serif", color: "var(--muted)" }}>
                      {l.costOrder}
                    </span>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", borderTop: "1px solid var(--line)", paddingTop: "10px" }}>
                      <span style={{ font: "600 13px/1.35 Archivo,sans-serif", color: "var(--reed)" }}>
                        {l.watersT}
                      </span>
                      <button onClick={l.edit} style={{ height: "44px", padding: "0 14px", borderRadius: "12px", border: "1.5px solid var(--ink)", background: "transparent", color: "var(--ink)", font: "700 14px Archivo,sans-serif", cursor: "pointer", flex: "none" }}>
                        {"Bearbeiten"}
                      </button>
                    </div>
                  </div>
                </React.Fragment>))}
                {hasOtherLic ? (<>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "4px" }}>
                    <span style={{ font: "700 12px Archivo,sans-serif", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--muted)" }}>
                      {"Vorhandene Lizenz zuordnen"}
                    </span>
                    {(otherLic || []).map((o: any, i_o10: number) => (<React.Fragment key={i_o10}>
                      <button onClick={o.assign} style={{ minHeight: "52px", borderRadius: "14px", border: "1.5px dashed var(--muted)", background: "transparent", color: "var(--ink)", font: "600 14px Archivo,sans-serif", cursor: "pointer", textAlign: "left", padding: "0 14px" }}>
                        {"+ "}
                        {o.label}
                      </button>
                    </React.Fragment>))}
                  </div>
                </>) : null}
                <button onClick={licNew} style={{ height: "52px", borderRadius: "14px", border: "1.5px dashed var(--muted)", background: "transparent", color: "var(--ink)", font: "700 15px Archivo,sans-serif", cursor: "pointer" }}>
                  {"+ Neue Lizenz"}
                </button>
                <span style={{ font: "400 12px/1.4 Archivo,sans-serif", color: "var(--muted)" }}>
                  {"Lizenzfotos bleiben nur auf diesem Handy."}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <h2 style={{ margin: "0", font: "800 19px/1.1 Archivo,sans-serif", fontStretch: "118%" }}>
                  {"Regeln je Fischart"}
                </h2>
                <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "16px", overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1.1fr) minmax(0,1fr) 72px", gap: "8px", padding: "10px 12px", background: "var(--surface2)", font: "700 11px/1.2 Archivo,sans-serif", letterSpacing: ".05em", textTransform: "uppercase", color: "var(--muted)" }}>
                    <span>
                      {"Art"}
                    </span>
                    <span>
                      {"Schonzeit"}
                    </span>
                    <span>
                      {"Maß, Limit"}
                    </span>
                    <span>
                      {"Heute"}
                    </span>
                  </div>
                  {(rulesTab || []).map((r: any, i_r9: number) => (<React.Fragment key={i_r9}>
                    <div onClick={r.edit} role="button" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1.1fr) minmax(0,1fr) 72px", gap: "8px", padding: "11px 12px", borderTop: "1px solid var(--line)", font: "400 13px/1.35 Archivo,sans-serif", alignItems: "start", cursor: "pointer" }}>
                      <span style={{ fontWeight: "700" }}>
                        {r.art}
                      </span>
                      <span>
                        {r.schon}
                      </span>
                      <span>
                        {r.mass}
                      </span>
                      <span style={r.todayStyle}>
                        {r.today}
                      </span>
                    </div>
                  </React.Fragment>))}
                </div>
                <span style={{ font: "400 12px/1.4 Archivo,sans-serif", color: "var(--muted)" }}>
                  {rulesSrc}
                </span>
                <button onClick={ruleNew} style={{ height: "52px", borderRadius: "14px", border: "1.5px dashed var(--muted)", background: "transparent", color: "var(--ink)", font: "700 15px Archivo,sans-serif", cursor: "pointer" }}>{"+ Regel je Fischart"}</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <h2 style={{ margin: "0", font: "800 19px/1.1 Archivo,sans-serif", fontStretch: "118%" }}>
                  {"Weitere Beschränkungen"}
                </h2>
                <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "16px", padding: "2px 14px" }}>
                  {(restr || []).map((r: any, i_r9: number) => (<React.Fragment key={i_r9}>
                    <div style={{ padding: "11px 0", borderBottom: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: "3px" }}>
                      <span style={{ font: "500 12px Archivo,sans-serif", color: "var(--muted)" }}>
                        {r.k}
                      </span>
                      <span style={{ font: "600 15px/1.35 Archivo,sans-serif" }}>
                        {r.v}
                      </span>
                      <span style={{ font: "400 12px Archivo,sans-serif", color: "var(--muted)" }}>
                        {"Quelle: "}
                        {r.src}
                        {" · Stand "}
                        {r.stand}
                      </span>
                    </div>
                  </React.Fragment>))}
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", background: "var(--surface2)", borderRadius: "12px", padding: "12px" }}>
                <span style={{ font: "800 14px/1 Archivo,sans-serif", width: "22px", height: "22px", borderRadius: "50%", background: "var(--orange)", color: "var(--onorange)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  {"!"}
                </span>
                <span style={{ font: "500 14px/1.4 Archivo,sans-serif" }}>
                  {"Weichen Verein und Land voneinander ab, gilt immer die strengere Regel. Prüf die Angaben mit der aktuellen Gewässerordnung."}
                </span>
              </div>
            </div>
          </>) : null}
        </>) : null}
        {show.steckbrief ? (<>
          <button id="sec-steckbrief" onClick={tg.steckbrief} style={{ margin: "18px 20px 0", width: "calc(100% - 40px)", minHeight: "68px", padding: "12px 0 4px", border: "0", borderTop: "2px solid var(--ink)", background: "transparent", color: "var(--ink)", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}>
            <span style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={{ font: "800 22px/1.1 Archivo,sans-serif", fontStretch: "120%" }}>
                {"Steckbrief"}
              </span>
              <span style={{ font: "500 13px Archivo,sans-serif", color: "var(--muted)" }}>
                {sum.steckbrief}
              </span>
            </span>
            <span style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1.5px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", font: "700 22px/1 Archivo,sans-serif", flex: "none" }}>
              {chev.steckbrief}
            </span>
          </button>
          {sec.steckbrief ? (<>
            <div style={{ padding: "18px 20px 0", display: "flex", flexDirection: "column", gap: "20px", color: "var(--ink)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <h2 style={{ margin: "0", font: "800 19px/1.1 Archivo,sans-serif", fontStretch: "118%" }}>
                  {"Stammdaten"}
                </h2>
                {steck.noFacts ? (<span style={{ font: "400 14px/1.4 Archivo,sans-serif", color: "var(--muted)" }}>{"Noch keine Stammdaten. Sie kommen mit dem Import aus dem Fangbuch."}</span>) : null}
                <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "16px", padding: "4px 14px", display: steck.noFacts ? "none" : "block" }}>
                  {(steck.facts || []).map((f: any, i_f9: number) => (<React.Fragment key={i_f9}>
                    <div style={{ display: "flex", gap: "12px", padding: "11px 0", borderBottom: "1px solid var(--line)", font: "400 15px/1.35 Archivo,sans-serif" }}>
                      <span style={{ width: "96px", flex: "none", color: "var(--muted)" }}>
                        {f.k}
                      </span>
                      <span style={{ flex: "1" }}>
                        {f.v}
                      </span>
                    </div>
                  </React.Fragment>))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <h2 style={{ margin: "0", font: "800 19px/1.1 Archivo,sans-serif", fontStretch: "118%" }}>
                  {"Erkenntnisse"}
                </h2>
                {(steck.insights || []).map((i: any, i_i8: number) => (<React.Fragment key={i_i8}>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "14px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ font: "600 15px/1.4 Archivo,sans-serif" }}>
                      {i.t}
                    </span>
                    <span style={{ font: "500 12px Archivo,sans-serif", color: "var(--muted)" }}>
                      {i.n}
                    </span>
                  </div>
                </React.Fragment>))}
                {steck.noInsights ? (<>
                  <span style={{ font: "400 14px/1.4 Archivo,sans-serif", color: "var(--muted)" }}>
                    {"Noch keine Erkenntnisse. Claude ergänzt sie im Fangbuch, sie kommen mit dem nächsten Import."}
                  </span>
                </>) : null}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <h2 style={{ margin: "0", font: "800 19px/1.1 Archivo,sans-serif", fontStretch: "118%" }}>
                  {"Offene Hypothesen"}
                </h2>
                {(steck.hyp || []).map((i: any, i_i8: number) => (<React.Fragment key={i_i8}>
                  <div style={{ border: "1.5px dashed var(--line)", borderRadius: "14px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ font: "600 15px/1.4 Archivo,sans-serif" }}>
                      {i.t}
                    </span>
                    <span style={{ font: "500 12px Archivo,sans-serif", color: "var(--muted)" }}>
                      {i.n}
                    </span>
                  </div>
                </React.Fragment>))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <h2 style={{ margin: "0", font: "800 19px/1.1 Archivo,sans-serif", fontStretch: "118%" }}>{"Vorschläge aus dem Fangbuch"}</h2>
                {(steck.vors || []).map((v: any, i_v: number) => (<div key={i_v} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "14px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ font: "600 15px/1.4 Archivo,sans-serif" }}>{v.t}</span>
                  {v.text ? <span style={{ font: "400 14px/1.4 Archivo,sans-serif" }}>{v.text}</span> : null}
                  <span style={{ font: "500 12px Archivo,sans-serif", color: "var(--muted)" }}>{v.n}</span>
                </div>))}
                {!(steck.vors || []).length ? (<span style={{ font: "400 14px/1.4 Archivo,sans-serif", color: "var(--muted)" }}>{"Noch keine Vorschläge importiert."}</span>) : null}
              </div>
            </div>
          </>) : null}
        </>) : null}
      </div>
    </>) : null}
    </>
  );
}
