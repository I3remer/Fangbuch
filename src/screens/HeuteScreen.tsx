// Aus dem Design „Fangbuch App v3“ übernommen. Struktur und Inline-Styles entsprechen dem Prototyp.
import React from 'react';
import { Indexbalken } from '../components/Indexbalken';
import type { VM } from '../types';

export function HeuteScreen({ vm }: { vm: VM }) {
  const { noWaters, goData, newGw, todayLabel, hasLive, is, liveVm, openLive, provMode, todayWaters } = vm;
  return (
    <>
    {is.heute ? (<>
      <div style={{ padding: "8px 20px 120px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingBottom: "4px" }}>
          <span style={{ font: "600 14px Archivo,sans-serif", color: "var(--muted)" }}>
            {todayLabel}
          </span>
          <h1 style={{ margin: "0", font: "800 34px/1 Archivo,sans-serif", fontStretch: "125%", color: "var(--ink)" }}>
            {"Heute"}
          </h1>
        </div>
        {hasLive ? (<>
          <button onClick={openLive} style={{ textAlign: "left", border: "0", cursor: "pointer", background: "var(--hdr)", color: "var(--hdrink)", borderRadius: "18px", padding: "16px", display: "flex", alignItems: "center", gap: "14px", minHeight: "76px" }}>
            <span style={{ width: "14px", height: "14px", borderRadius: "50%", background: "var(--orange)", flex: "none", boxShadow: "0 0 0 5px rgba(236,138,69,.25)" }} />
            <span style={{ flex: "1", display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ font: "800 17px/1.1 Archivo,sans-serif", fontStretch: "115%" }}>
                {"Session läuft · "}
                {liveVm.waterShort}
              </span>
              <span style={{ font: "500 14px Archivo,sans-serif", color: "var(--hdrmuted)" }}>
                {liveVm.elapsed}
                {" · "}
                {liveVm.bites}
                {" Bisse · "}
                {liveVm.catches}
                {" Fänge"}
              </span>
            </span>
            <span style={{ font: "700 15px Archivo,sans-serif" }}>
              {"Öffnen ›"}
            </span>
          </button>
        </>) : null}
        {(todayWaters || []).map((w: any, i_w4: number) => (<React.Fragment key={i_w4}>
          <button onClick={w.open} style={{ textAlign: "left", cursor: "pointer", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "18px", padding: "16px 16px 14px", display: "flex", flexDirection: "column", gap: "12px", color: "var(--ink)" }}>
            <span style={{ font: "800 20px/1.1 Archivo,sans-serif", fontStretch: "118%" }}>
              {w.name}
            </span>
            <Indexbalken value={w.score} own={w.own} basis={w.basis} size="l" mode={provMode} />
            <span style={{ font: "500 13px Archivo,sans-serif", color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
              {"Bestes Zeitfenster "}
              {w.win}
            </span>
          </button>
        </React.Fragment>))}
        {noWaters ? (<div style={{ padding: "18px", borderRadius: "18px", border: "1.5px dashed var(--muted)", display: "flex", flexDirection: "column", gap: "10px", color: "var(--ink)" }}>
          <span style={{ font: "800 20px/1.1 Archivo,sans-serif", fontStretch: "118%" }}>{"Willkommen am Wasser"}</span>
          <span style={{ font: "400 15px/1.45 Archivo,sans-serif", color: "var(--muted)" }}>{"Hol dir deine Gewässer, Spots und Vorschläge aus dem Fangbuch: Schreib im Projekt „Angeln“: „Exportier meine Gewässer und Vorschläge für die Fangbuch-App.“ und importier die Antwort."}</span>
          <button onClick={goData} style={{ height: "52px", borderRadius: "14px", border: "0", background: "var(--ink)", color: "var(--bg)", font: "800 15px Archivo,sans-serif", cursor: "pointer" }}>{"Import aus dem Fangbuch"}</button>
          <button onClick={newGw} style={{ height: "52px", borderRadius: "14px", border: "1.5px solid var(--ink)", background: "transparent", color: "var(--ink)", font: "700 15px Archivo,sans-serif", cursor: "pointer" }}>{"Gewässer selbst anlegen"}</button>
        </div>) : null}
      </div>
    </>) : null}
    </>
  );
}
