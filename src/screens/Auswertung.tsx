// Aus dem Design „Fangbuch App v3“ übernommen. Struktur und Inline-Styles entsprechen dem Prototyp.
import React from 'react';
import type { VM } from '../types';

export function Auswertung({ vm }: { vm: VM }) {
  const { noStats, fF, fW, groups, is, statKpis } = vm;
  return (
    <>
    {is.stats ? (<>
      <div style={{ padding: "8px 0 120px", display: "flex", flexDirection: "column", gap: "14px", color: "var(--ink)" }}>
        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <h1 style={{ margin: "0", font: "800 34px/1 Archivo,sans-serif", fontStretch: "125%" }}>
            {"Auswertung"}
          </h1>
          <span style={{ font: "500 14px/1.4 Archivo,sans-serif", color: "var(--muted)" }}>
            {"Bisse pro Stunde. Schraffiert und blass: weniger als 3 Sessions."}
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", padding: "0 20px" }}>
          {(fW || []).map((c: any, i_c5: number) => (<React.Fragment key={i_c5}>
            <button onClick={c.pick} style={c.style}>
              {c.label}
            </button>
          </React.Fragment>))}
        </div>
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", padding: "0 20px" }}>
          {(fF || []).map((c: any, i_c5: number) => (<React.Fragment key={i_c5}>
            <button onClick={c.pick} style={c.style}>
              {c.label}
            </button>
          </React.Fragment>))}
        </div>
        <div style={{ margin: "0 20px", display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "8px" }}>
          {(statKpis || []).map((k: any, i_k5: number) => (<React.Fragment key={i_k5}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "14px", padding: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ font: "800 22px/1 Archivo,sans-serif", fontVariantNumeric: "tabular-nums" }}>
                {k.v}
              </span>
              <span style={{ font: "500 12px Archivo,sans-serif", color: "var(--muted)" }}>
                {k.k}
              </span>
            </div>
          </React.Fragment>))}
        </div>
        {noStats ? (<span style={{ margin: "0 20px", font: "400 15px/1.45 Archivo,sans-serif", color: "var(--muted)" }}>{"Noch keine abgeschlossenen Sessions für diesen Filter."}</span>) : null}
        {(groups || []).map((g: any, i_g4: number) => (<React.Fragment key={i_g4}>
          <div style={{ margin: "0 20px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "18px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <h2 style={{ margin: "0", font: "800 16px/1.1 Archivo,sans-serif", fontStretch: "115%" }}>
              {g.title}
            </h2>
            {(g.rows || []).map((r: any, i_r6: number) => (<React.Fragment key={i_r6}>
              <div style={r.wrap}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", font: "600 14px Archivo,sans-serif" }}>
                  <span>
                    {r.label}
                  </span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    {r.val}
                  </span>
                </div>
                <div style={{ height: "10px", borderRadius: "5px", background: "var(--track)", overflow: "hidden" }}>
                  <div style={r.bar} />
                </div>
                <span style={{ font: "500 12px Archivo,sans-serif", color: "var(--muted)" }}>
                  {r.n}
                </span>
              </div>
            </React.Fragment>))}
            {g.empty ? (<>
              <span style={{ font: "400 14px Archivo,sans-serif", color: "var(--muted)" }}>
                {"Noch keine Daten für diesen Filter."}
              </span>
            </>) : null}
          </div>
        </React.Fragment>))}
      </div>
    </>) : null}
    </>
  );
}
