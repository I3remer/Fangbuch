// Aus dem Design „Fangbuch App v3“ übernommen. Struktur und Inline-Styles entsprechen dem Prototyp.
import React from 'react';
import type { VM } from '../types';

export function Mehr({ vm }: { vm: VM }) {
  const { boxSub, dataDot, dataSub, gearSub, goBoxes, goData, goGear, is, themeOpts } = vm;
  return (
    <>
    {is.more ? (<>
      <div style={{ padding: "8px 20px 120px", display: "flex", flexDirection: "column", gap: "14px", color: "var(--ink)" }}>
        <h1 style={{ margin: "0", font: "800 34px/1 Archivo,sans-serif", fontStretch: "125%" }}>
          {"Mehr"}
        </h1>
        <button onClick={goGear} style={{ textAlign: "left", cursor: "pointer", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "16px", padding: "16px", display: "flex", alignItems: "center", gap: "12px", color: "var(--ink)", minHeight: "72px" }}>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px" }}>
            <span style={{ font: "800 18px Archivo,sans-serif", fontStretch: "115%" }}>
              {"Ausrüstung"}
            </span>
            <span style={{ font: "500 13px Archivo,sans-serif", color: "var(--muted)" }}>
              {gearSub}
            </span>
          </div>
          <span style={{ font: "600 20px Archivo,sans-serif", color: "var(--muted)" }}>
            {"›"}
          </span>
        </button>
        <button onClick={goBoxes} style={{ textAlign: "left", cursor: "pointer", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "16px", padding: "16px", display: "flex", alignItems: "center", gap: "12px", color: "var(--ink)", minHeight: "72px" }}>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px" }}>
            <span style={{ font: "800 18px Archivo,sans-serif", fontStretch: "115%" }}>
              {"Köderbox"}
            </span>
            <span style={{ font: "500 13px Archivo,sans-serif", color: "var(--muted)" }}>
              {boxSub}
            </span>
          </div>
          <span style={{ font: "600 20px Archivo,sans-serif", color: "var(--muted)" }}>
            {"›"}
          </span>
        </button>
        <button onClick={goData} style={{ textAlign: "left", cursor: "pointer", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "16px", padding: "16px", display: "flex", alignItems: "center", gap: "12px", color: "var(--ink)", minHeight: "72px" }}>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px" }}>
            <span style={{ font: "800 18px Archivo,sans-serif", fontStretch: "115%" }}>
              {"Daten"}
            </span>
            <span style={{ font: "500 13px Archivo,sans-serif", color: "var(--muted)" }}>
              {dataSub}
            </span>
          </div>
          <span style={dataDot} />
          <span style={{ font: "600 20px Archivo,sans-serif", color: "var(--muted)" }}>
            {"›"}
          </span>
        </button>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <span style={{ font: "800 18px Archivo,sans-serif", fontStretch: "115%" }}>
            {"Darstellung"}
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {(themeOpts || []).map((o: any, i_o6: number) => (<React.Fragment key={i_o6}>
              <button onClick={o.pick} style={o.style}>
                {o.label}
              </button>
            </React.Fragment>))}
          </div>
          <span style={{ font: "500 13px/1.4 Archivo,sans-serif", color: "var(--muted)" }}>
            {"Dunkel ist abends am Wasser blendfrei. Kein reines Weiß, gedämpfte Signalfarben."}
          </span>
        </div>
        <div style={{ border: "1.5px dashed var(--line)", borderRadius: "16px", padding: "14px 16px", font: "400 14px/1.45 Archivo,sans-serif", color: "var(--muted)" }}>
          {"Gewässer, Spots und Vorschläge kommen aus deinem Fangbuch. Index und Farbberater beginnen mit Faustregeln und lernen mit jeder Session. Regeln und Lizenzen gleichst du bitte mit der Gewässerordnung ab."}
        </div>
      </div>
    </>) : null}
    </>
  );
}
