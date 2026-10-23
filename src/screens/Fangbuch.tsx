// Aus dem Design „Fangbuch App v3“ übernommen. Struktur und Inline-Styles entsprechen dem Prototyp.
import React from 'react';
import type { VM } from '../types';

export function Fangbuch({ vm }: { vm: VM }) {
  const { book, bookSummary, is, legend, openAdd } = vm;
  return (
    <>
    {is.book ? (<>
      <div style={{ padding: "8px 20px 120px", display: "flex", flexDirection: "column", gap: "14px", color: "var(--ink)" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <h1 style={{ margin: "0", font: "800 34px/1 Archivo,sans-serif", fontStretch: "125%" }}>
              {"Fangbuch"}
            </h1>
            <span style={{ font: "500 14px Archivo,sans-serif", color: "var(--muted)" }}>
              {bookSummary}
            </span>
          </div>
          <button onClick={openAdd} style={{ height: "48px", padding: "0 16px", borderRadius: "24px", border: "1.5px solid var(--ink)", background: "transparent", color: "var(--ink)", font: "700 14px Archivo,sans-serif", cursor: "pointer", flex: "none" }}>
            {"+ Nachtragen"}
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", font: "500 12px Archivo,sans-serif", color: "var(--muted)" }}>
          {(legend || []).map((l: any, i_l5: number) => (<React.Fragment key={i_l5}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={l.style} />
              {l.t}
            </span>
          </React.Fragment>))}
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "28px", height: "10px", borderRadius: "3px", background: "linear-gradient(90deg,var(--tlday),var(--tldusk),var(--tlnight))" }} />
            {"Tag, Dämmerung, Nacht"}
          </span>
        </div>
        {!(book || []).length ? (<div style={{ padding: "18px", borderRadius: "18px", border: "1.5px dashed var(--muted)", display: "flex", flexDirection: "column", gap: "8px" }}><span style={{ font: "800 18px Archivo,sans-serif", fontStretch: "115%" }}>{"Noch keine Sessions"}</span><span style={{ font: "400 15px/1.45 Archivo,sans-serif", color: "var(--muted)" }}>{"Starte am Wasser eine Session und tipp jeden Biss mit. Einen vergangenen Angeltag trägst du mit „+ Nachtragen“ nach. Nullrunden zählen."}</span></div>) : null}
        {(book || []).map((s: any, i_s4: number) => (<React.Fragment key={i_s4}>
          <button onClick={s.open} style={{ textAlign: "left", cursor: "pointer", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "16px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px", color: "var(--ink)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", width: "100%" }}>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px" }}>
                <span style={{ font: "800 16px/1.15 Archivo,sans-serif", fontStretch: "110%" }}>
                  {s.dl}
                  {" · "}
                  {s.waterShort}
                </span>
                <span style={{ font: "500 13px Archivo,sans-serif", color: "var(--muted)" }}>
                  {s.fish}
                  {" · "}
                  {s.st}
                  {" bis "}
                  {s.en}
                  {" · "}
                  {s.method}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                <span style={s.resStyle}>
                  {s.res}
                </span>
                {s.unsynced ? (<>
                  <span style={{ font: "600 11px Archivo,sans-serif", color: "var(--orange)" }}>
                    {"nicht übertragen"}
                  </span>
                </>) : null}
              </div>
            </div>
            <div style={s.track}>
              <div style={s.span} />
              {(s.marks || []).map((mk: any, i_mk7: number) => (<React.Fragment key={i_mk7}>
                <span style={mk.style} />
              </React.Fragment>))}
            </div>
          </button>
        </React.Fragment>))}
      </div>
    </>) : null}
    </>
  );
}
