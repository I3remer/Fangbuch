// Aus dem Design „Fangbuch App v3“ übernommen. Struktur und Inline-Styles entsprechen dem Prototyp.
import React from 'react';
import type { VM } from '../types';

export function Ausruestung({ vm }: { vm: VM }) {
  const { back, gearHint, gearList, gearNew, gearNewLabel, gearTabs, is } = vm;
  return (
    <>
    {is.gear ? (<>
      <div style={{ padding: "0 20px 120px", display: "flex", flexDirection: "column", gap: "14px", color: "var(--ink)" }}>
        <button onClick={back} style={{ alignSelf: "flex-start", height: "48px", padding: "0 12px 0 0", border: "0", background: "transparent", color: "var(--ink)", font: "600 16px Archivo,sans-serif", cursor: "pointer" }}>
          {"‹ Mehr"}
        </button>
        <h1 style={{ margin: "-8px 0 0", font: "800 30px/1 Archivo,sans-serif", fontStretch: "125%" }}>
          {"Ausrüstung"}
        </h1>
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", margin: "0 -20px", padding: "0 20px" }}>
          {(gearTabs || []).map((c: any, i_c5: number) => (<React.Fragment key={i_c5}>
            <button onClick={c.pick} style={c.style}>
              {c.label}
            </button>
          </React.Fragment>))}
        </div>
        <span style={{ font: "400 14px/1.4 Archivo,sans-serif", color: "var(--muted)" }}>
          {gearHint}
        </span>
        {(gearList || []).map((g: any, i_g4: number) => (<React.Fragment key={i_g4}>
          <button onClick={g.open} style={g.cardStyle}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", width: "100%" }}>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px" }}>
                <span style={{ font: "800 16px/1.2 Archivo,sans-serif", fontStretch: "110%" }}>
                  {g.title}
                </span>
                <span style={{ font: "500 13px/1.35 Archivo,sans-serif", color: "var(--muted)" }}>
                  {g.sub}
                </span>
              </div>
              <span style={g.badge}>
                {g.status}
              </span>
            </div>
            {g.hasExtra ? (<>
              <span style={{ font: "600 13px/1.35 Archivo,sans-serif", color: "var(--reed)" }}>
                {g.extra}
              </span>
            </>) : null}
            {g.hasBil ? (<>
              <div style={{ display: "flex", gap: "20px", borderTop: "1px solid var(--line)", paddingTop: "10px", width: "100%" }}>
                {(g.bil || []).map((k: any, i_k8: number) => (<React.Fragment key={i_k8}>
                  <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ font: "800 18px/1 Archivo,sans-serif", fontVariantNumeric: "tabular-nums" }}>
                      {k.v}
                    </span>
                    <span style={{ font: "500 12px Archivo,sans-serif", color: "var(--muted)" }}>
                      {k.k}
                    </span>
                  </span>
                </React.Fragment>))}
              </div>
            </>) : null}
          </button>
        </React.Fragment>))}
        <button onClick={gearNew} style={{ height: "56px", borderRadius: "16px", border: "1.5px dashed var(--muted)", background: "transparent", color: "var(--ink)", font: "700 15px Archivo,sans-serif", cursor: "pointer" }}>
          {gearNewLabel}
        </button>
      </div>
    </>) : null}
    </>
  );
}
