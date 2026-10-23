// Aus dem Design „Fangbuch App v3“ übernommen. Struktur und Inline-Styles entsprechen dem Prototyp.
import React from 'react';
import type { VM } from '../types';

export function LiveSession({ vm }: { vm: VM }) {
  const { back, evA, evC, evF, evN, is, liveBox, liveVm, openBait, openEnd, openNote, undo } = vm;
  return (
    <>
    {is.live ? (<>
      <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", gap: "12px", padding: "0 16px calc(24px + env(safe-area-inset-bottom))", color: "var(--ink)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={back} style={{ height: "48px", padding: "0 12px 0 0", border: "0", background: "transparent", color: "var(--ink)", font: "600 16px Archivo,sans-serif", cursor: "pointer" }}>
            {"‹ Minimieren"}
          </button>
          <span style={{ font: "700 14px Archivo,sans-serif", color: "var(--muted)" }}>
            {liveVm.waterName}
            {" · "}
            {liveVm.fish}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ font: "600 13px Archivo,sans-serif", color: "var(--muted)" }}>
              {"Laufzeit"}
            </span>
            <span style={{ font: "800 46px/1 Archivo,sans-serif", fontStretch: "105%", fontVariantNumeric: "tabular-nums", letterSpacing: "-.01em" }}>
              {liveVm.elapsed}
            </span>
          </div>
          <div style={{ display: "flex", gap: "16px", textAlign: "right" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ font: "600 13px Archivo,sans-serif", color: "var(--muted)" }}>
                {"Bisse"}
              </span>
              <span style={{ font: "800 32px/1 Archivo,sans-serif", fontVariantNumeric: "tabular-nums" }}>
                {liveVm.bites}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ font: "600 13px Archivo,sans-serif", color: "var(--muted)" }}>
                {"Fänge"}
              </span>
              <span style={{ font: "800 32px/1 Archivo,sans-serif", color: "var(--orange)", fontVariantNumeric: "tabular-nums" }}>
                {liveVm.catches}
              </span>
            </div>
          </div>
        </div>
        {liveBox.has ? (<>
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "16px", padding: "10px 14px 4px", display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ font: "700 12px Archivo,sans-serif", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--muted)", paddingBottom: "4px" }}>
              {"Aus deiner Box · "}
              {liveBox.boxName}
            </span>
            {(liveBox.items || []).map((r: any, i_r6: number) => (<React.Fragment key={i_r6}>
              <button onClick={r.use} style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "52px", border: "0", borderTop: "1px solid var(--line)", background: "transparent", color: "var(--ink)", cursor: "pointer", textAlign: "left", padding: "4px 0" }}>
                <span style={r.sw} />
                <span style={{ flex: "1", font: "700 15px/1.25 Archivo,sans-serif" }}>
                  {r.title}
                </span>
                <span style={{ font: "700 13px Archivo,sans-serif", color: "var(--muted)" }}>
                  {r.word}
                </span>
              </button>
            </React.Fragment>))}
          </div>
        </>) : null}
        <button onClick={openBait} style={{ textAlign: "left", cursor: "pointer", border: "1px solid var(--line)", background: "var(--surface)", borderRadius: "16px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "12px", color: "var(--ink)", minHeight: "64px" }}>
          <div style={{ display: "flex", flex: "none" }}>
            {(liveVm.sw || []).map((s: any, i_s6: number) => (<React.Fragment key={i_s6}>
              <span style={s.style} />
            </React.Fragment>))}
          </div>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px" }}>
            <span style={{ font: "800 16px/1.15 Archivo,sans-serif", fontStretch: "110%" }}>
              {liveVm.tip}
            </span>
            <span style={{ font: "500 13px/1.3 Archivo,sans-serif", color: "var(--muted)" }}>
              {liveVm.tip2}
            </span>
          </div>
          <span style={{ font: "700 14px Archivo,sans-serif", color: "var(--reed)" }}>
            {"Wechseln"}
          </span>
        </button>
        {liveVm.schon ? (<>
          <div style={{ padding: "12px 14px", borderRadius: "14px", background: "var(--minus)", color: "var(--surface)", font: "700 15px/1.35 Archivo,sans-serif" }}>
            {liveVm.schonText}
          </div>
        </>) : null}
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "16px", padding: "10px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ font: "700 12px Archivo,sans-serif", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--muted)" }}>
              {"Tests heute"}
            </span>
            <span style={{ font: "500 12px Archivo,sans-serif", color: "var(--muted)" }}>
              {"einer nach dem anderen"}
            </span>
          </div>
          {(liveVm.tests || []).map((t: any, i_t5: number) => (<React.Fragment key={i_t5}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "56px", borderTop: "1px solid var(--line)", paddingTop: "4px" }}>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px", minWidth: "0" }}>
                <span style={{ font: "700 15px/1.25 Archivo,sans-serif" }}>
                  {t.title}
                </span>
                <span style={{ font: "500 13px/1.3 Archivo,sans-serif", color: "var(--muted)" }}>
                  {t.status}
                </span>
              </div>
              <button onClick={t.act} style={t.btnStyle}>
                {t.btn}
              </button>
            </div>
          </React.Fragment>))}
          {liveVm.noTests ? (<>
            <span style={{ font: "400 14px/1.4 Archivo,sans-serif", color: "var(--muted)", padding: "6px 0" }}>
              {"Keine Tests vorgemerkt. Du wählst sie im Gewässer unter „Heute“."}
            </span>
          </>) : null}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "10px" }}>
          <button onClick={evC} style={{ minWidth: "0", height: "132px", borderRadius: "22px", border: "0", background: "var(--orange)", color: "var(--onorange)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between", padding: "16px" }}>
            <span style={{ font: "800 15px Archivo,sans-serif", opacity: ".85" }}>
              {liveVm.nC}
            </span>
            <span style={{ font: "800 30px/1 Archivo,sans-serif", fontStretch: "120%" }}>
              {"Fang"}
            </span>
          </button>
          <button onClick={evF} style={{ minWidth: "0", height: "132px", borderRadius: "22px", border: "2px solid var(--ink)", background: "var(--surface)", color: "var(--ink)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between", padding: "16px" }}>
            <span style={{ font: "800 15px Archivo,sans-serif", color: "var(--muted)" }}>
              {liveVm.nF}
            </span>
            <span style={{ font: "800 23px/1 Archivo,sans-serif", fontStretch: "105%" }}>
              {"Fehlbiss"}
            </span>
          </button>
          <button onClick={evA} style={{ minWidth: "0", height: "132px", borderRadius: "22px", border: "2px solid var(--orange)", background: "var(--surface)", color: "var(--ink)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between", padding: "16px" }}>
            <span style={{ font: "800 15px Archivo,sans-serif", color: "var(--muted)" }}>
              {liveVm.nA}
            </span>
            <span style={{ font: "800 23px/1 Archivo,sans-serif", fontStretch: "105%" }}>
              {"Aussteiger"}
            </span>
          </button>
          <button onClick={evN} style={{ minWidth: "0", height: "132px", borderRadius: "22px", border: "1px solid var(--line)", background: "var(--surface2)", color: "var(--ink)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between", padding: "16px" }}>
            <span style={{ font: "800 15px Archivo,sans-serif", color: "var(--muted)" }}>
              {liveVm.nN}
            </span>
            <span style={{ font: "800 23px/1 Archivo,sans-serif", fontStretch: "105%" }}>
              {"Nachläufer"}
            </span>
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "10px" }}>
          <button onClick={openBait} style={{ height: "60px", borderRadius: "16px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", font: "700 15px Archivo,sans-serif", cursor: "pointer" }}>
            {"Köder"}
          </button>
          <button onClick={openNote} style={{ height: "60px", borderRadius: "16px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", font: "700 14px Archivo,sans-serif", cursor: "pointer" }}>
            {"Beobachtung"}
          </button>
          <button onClick={undo} style={{ height: "60px", borderRadius: "16px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", font: "700 15px Archivo,sans-serif", cursor: "pointer" }}>
            {"Rückgängig"}
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0", borderTop: "1px solid var(--line)" }}>
          {(liveVm.log || []).map((l: any, i_l5: number) => (<React.Fragment key={i_l5}>
            <div onClick={l.edit} role={l.edit ? "button" : undefined} style={{ display: "flex", gap: "12px", alignItems: "center", padding: "9px 2px", borderBottom: "1px solid var(--line)", font: "500 14px Archivo,sans-serif", cursor: l.edit ? "pointer" : "default", minHeight: "44px" }}>
              <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--muted)", width: "44px" }}>
                {l.t}
              </span>
              <span style={l.dot} />
              <span style={{ flex: "1" }}>
                {l.label}
              </span>
              {l.edit ? (<span style={{ font: "700 13px Archivo,sans-serif", color: "var(--reed)" }}>{"ergänzen"}</span>) : null}
            </div>
          </React.Fragment>))}
          {liveVm.empty ? (<>
            <span style={{ padding: "10px 2px", font: "400 14px Archivo,sans-serif", color: "var(--muted)" }}>
              {"Noch keine Einträge. Jeder Tipp speichert die Uhrzeit."}
            </span>
          </>) : null}
        </div>
        <button onClick={openEnd} style={{ height: "56px", borderRadius: "16px", border: "2px solid var(--ink)", background: "transparent", color: "var(--ink)", font: "800 16px Archivo,sans-serif", cursor: "pointer", marginTop: "auto" }}>
          {"Session beenden"}
        </button>
      </div>
    </>) : null}
    </>
  );
}
