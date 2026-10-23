// Aus dem Design „Fangbuch App v3“ übernommen. Struktur und Inline-Styles entsprechen dem Prototyp.
import React from 'react';
import type { VM } from '../types';

export function GewaesserListe({ vm }: { vm: VM }) {
  const { is, newGw, waterList, noWaters, goData } = vm;
  return (
    <>
    {is.waters ? (<>
      <div style={{ padding: "8px 20px 120px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <h1 style={{ margin: "0", font: "800 34px/1 Archivo,sans-serif", fontStretch: "125%", color: "var(--ink)" }}>
          {"Gewässer"}
        </h1>
        {(waterList || []).map((w: any, i_w4: number) => (<React.Fragment key={i_w4}>
          <button onClick={w.open} style={{ textAlign: "left", cursor: "pointer", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "18px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", color: "var(--ink)" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", width: "100%" }}>
              <span style={{ font: "800 14px/1 Archivo,sans-serif", fontStretch: "120%", width: "44px", height: "44px", borderRadius: "12px", background: "var(--hdr)", color: "var(--hdrink)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                {w.short}
              </span>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px" }}>
                <span style={{ font: "800 18px/1.1 Archivo,sans-serif", fontStretch: "115%" }}>
                  {w.name}
                </span>
                <span style={{ font: "500 13px Archivo,sans-serif", color: "var(--muted)" }}>
                  {w.sub}
                </span>
                {w.badge ? (<span style={{ alignSelf: "flex-start", font: "700 11px/1 Archivo,sans-serif", padding: "5px 7px", borderRadius: "6px", border: "1.5px solid var(--orange)", color: "var(--orange)" }}>{w.badge}</span>) : null}
              </div>
              <span style={{ font: "600 20px Archivo,sans-serif", color: "var(--muted)" }}>
                {"›"}
              </span>
            </div>
            <span style={{ font: "500 14px/1.4 Archivo,sans-serif" }}>
              {w.stateLine}
            </span>
            <span style={{ font: "500 13px Archivo,sans-serif", color: "var(--muted)" }}>
              {w.statLine}
            </span>
          </button>
        </React.Fragment>))}
        {noWaters ? (<div style={{ padding: "18px", borderRadius: "18px", border: "1.5px dashed var(--muted)", display: "flex", flexDirection: "column", gap: "10px", color: "var(--ink)" }}>
          <span style={{ font: "800 18px Archivo,sans-serif", fontStretch: "115%" }}>{"Noch keine Gewässer"}</span>
          <span style={{ font: "400 15px/1.45 Archivo,sans-serif", color: "var(--muted)" }}>{"Bitte Claude im Projekt „Angeln“ um einen Export deiner Gewässer und Vorschläge für die Fangbuch-App und importier ihn unter „Mehr › Daten“. Oder leg ein Gewässer direkt an."}</span>
          <button onClick={goData} style={{ height: "52px", borderRadius: "14px", border: "1.5px solid var(--ink)", background: "transparent", color: "var(--ink)", font: "700 15px Archivo,sans-serif", cursor: "pointer" }}>{"Aus dem Fangbuch importieren"}</button>
        </div>) : null}
        <button onClick={newGw} style={{ height: "56px", borderRadius: "16px", border: "1.5px dashed var(--muted)", background: "transparent", color: "var(--ink)", font: "700 15px Archivo,sans-serif", cursor: "pointer" }}>
          {"+ Gewässer anlegen"}
        </button>
      </div>
    </>) : null}
    </>
  );
}
