// Aus dem Design „Fangbuch App v3“ übernommen. Struktur und Inline-Styles entsprechen dem Prototyp.
import React from 'react';
import { Indexbalken } from '../components/Indexbalken';
import type { VM } from '../types';

export function MethodenDetail({ vm }: { vm: VM }) {
  const { back, is, md, provMode, startWithMethod } = vm;
  return (
    <>
    {is.method ? (<>
      <div style={{ padding: "0 20px 120px", display: "flex", flexDirection: "column", gap: "18px", color: "var(--ink)" }}>
        <button onClick={back} style={{ alignSelf: "flex-start", height: "48px", padding: "0 12px 0 0", border: "0", background: "transparent", color: "var(--ink)", font: "600 16px Archivo,sans-serif", cursor: "pointer" }}>
          {"‹ "}
          {md.backLabel}
        </button>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "-8px" }}>
          <span style={{ font: "600 13px Archivo,sans-serif", color: "var(--muted)" }}>
            {md.ctx}
          </span>
          <h1 style={{ margin: "0", font: "800 28px/1.05 Archivo,sans-serif", fontStretch: "125%" }}>
            {md.name}
          </h1>
          <span style={{ font: "500 15px Archivo,sans-serif", color: "var(--muted)" }}>
            {md.tech}
          </span>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "18px", padding: "16px" }}>
          <Indexbalken value={md.score} own={md.own} basis={md.basis} size="l" mode={provMode} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h2 style={{ margin: "0", font: "800 19px/1.1 Archivo,sans-serif", fontStretch: "118%" }}>
            {"Warum"}
          </h2>
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "16px", padding: "6px 14px" }}>
            {(md.factors || []).map((f: any, i_f6: number) => (<React.Fragment key={i_f6}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                <span style={f.iconStyle}>
                  {f.icon}
                </span>
                <span style={{ font: "400 15px/1.4 Archivo,sans-serif", flex: "1" }}>
                  {f.t}
                </span>
              </div>
            </React.Fragment>))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h2 style={{ margin: "0", font: "800 19px/1.1 Archivo,sans-serif", fontStretch: "118%" }}>
            {"Köder konkret"}
          </h2>
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "16px", padding: "4px 14px" }}>
            {(md.bait || []).map((b: any, i_b6: number) => (<React.Fragment key={i_b6}>
              <div style={{ display: "flex", gap: "12px", padding: "11px 0", borderBottom: "1px solid var(--line)", font: "400 15px/1.35 Archivo,sans-serif" }}>
                <span style={{ width: "84px", flex: "none", color: "var(--muted)" }}>
                  {b.k}
                </span>
                <span style={{ flex: "1", fontWeight: "600" }}>
                  {b.v}
                </span>
              </div>
            </React.Fragment>))}
            <div style={{ display: "flex", gap: "12px", padding: "11px 0", alignItems: "center", font: "400 15px/1.35 Archivo,sans-serif" }}>
              <span style={{ width: "84px", flex: "none", color: "var(--muted)" }}>
                {"Farbe"}
              </span>
              <div style={{ display: "flex", flex: "none" }}>
                {(md.colSw || []).map((s: any, i_s8: number) => (<React.Fragment key={i_s8}>
                  <span style={s.style} />
                </React.Fragment>))}
              </div>
              <span style={{ flex: "1", fontWeight: "600" }}>
                {md.colName}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h2 style={{ margin: "0", font: "800 19px/1.1 Archivo,sans-serif", fontStretch: "118%" }}>
            {"So führst du ihn"}
          </h2>
          <div style={{ background: "var(--hdr)", color: "var(--hdrink)", borderRadius: "18px", padding: "14px 14px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <svg viewBox="0 0 320 80" style={{ width: "100%", height: "auto", display: "block" }}>
              <line x1="0" y1="70" x2="320" y2="70" style={{ stroke: "var(--hdrmuted)", strokeWidth: "1.5", strokeDasharray: "4 4" }} />
              <polyline points={md.rh.pts} style={{ fill: "none", stroke: "var(--hdrink)", strokeWidth: "2.5", strokeLinejoin: "round", strokeLinecap: "round" }} />
              <circle cx={md.rh.bx} cy={md.rh.by} r="7" style={{ fill: "var(--orange)", stroke: "var(--hdr)", strokeWidth: "2" }} />
            </svg>
            <div style={{ display: "flex", gap: "2px" }}>
              {(md.rh.labels || []).map((l: any, i_l7: number) => (<React.Fragment key={i_l7}>
                <span style={l.style}>
                  {l.t}
                </span>
              </React.Fragment>))}
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", borderTop: "1px solid rgba(255,255,255,.12)", paddingTop: "10px" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "var(--orange)", flex: "none", marginTop: "3px" }} />
              <span style={{ font: "500 14px/1.4 Archivo,sans-serif" }}>
                {md.biteNote}
              </span>
            </div>
          </div>
          {(md.steps || []).map((s: any, i_s5: number) => (<React.Fragment key={i_s5}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <span style={{ font: "800 14px/1 Archivo,sans-serif", width: "28px", height: "28px", borderRadius: "50%", background: "var(--ink)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                {s.n}
              </span>
              <span style={{ font: "400 15px/1.45 Archivo,sans-serif", paddingTop: "3px" }}>
                {s.t}
              </span>
            </div>
          </React.Fragment>))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h2 style={{ margin: "0", font: "800 19px/1.1 Archivo,sans-serif", fontStretch: "118%" }}>
            {"Deine Kombo"}
          </h2>
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "16px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ font: "800 16px/1.2 Archivo,sans-serif", fontStretch: "110%" }}>
                {md.combo.rod}
              </span>
              <span style={{ font: "500 14px Archivo,sans-serif", color: "var(--muted)" }}>
                {md.combo.reel}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", borderTop: "1px solid var(--line)", paddingTop: "10px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ font: "500 12px Archivo,sans-serif", color: "var(--muted)" }}>
                  {"Schnur"}
                </span>
                <span style={{ font: "600 14px Archivo,sans-serif" }}>
                  {md.combo.line}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ font: "500 12px Archivo,sans-serif", color: "var(--muted)" }}>
                  {"Vorfach"}
                </span>
                <span style={{ font: "600 14px Archivo,sans-serif" }}>
                  {md.leader}
                </span>
              </div>
            </div>
            {md.hasMissing ? (<>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", background: "var(--surface2)", borderRadius: "12px", padding: "10px 12px" }}>
                <span style={{ font: "800 14px/1 Archivo,sans-serif", width: "22px", height: "22px", borderRadius: "50%", background: "var(--orange)", color: "var(--onorange)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  {"!"}
                </span>
                <span style={{ font: "500 14px/1.4 Archivo,sans-serif" }}>
                  {md.missing}
                </span>
              </div>
            </>) : null}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "16px", padding: "14px", display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ font: "500 12px Archivo,sans-serif", color: "var(--muted)" }}>
              {"Bester Spot"}
            </span>
            <span style={{ font: "700 15px/1.3 Archivo,sans-serif" }}>
              {md.bestSpot}
            </span>
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "16px", padding: "14px", display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ font: "500 12px Archivo,sans-serif", color: "var(--muted)" }}>
              {"Bestes Zeitfenster"}
            </span>
            <span style={{ font: "700 15px/1.3 Archivo,sans-serif", fontVariantNumeric: "tabular-nums" }}>
              {md.win}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h2 style={{ margin: "0", font: "800 19px/1.1 Archivo,sans-serif", fontStretch: "118%" }}>
            {"Deine Ergebnisse"}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "8px" }}>
            {(md.results || []).map((k: any, i_k6: number) => (<React.Fragment key={i_k6}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "14px", padding: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ font: "800 22px/1 Archivo,sans-serif", fontStretch: "110%", fontVariantNumeric: "tabular-nums" }}>
                  {k.v}
                </span>
                <span style={{ font: "500 12px Archivo,sans-serif", color: "var(--muted)" }}>
                  {k.k}
                </span>
              </div>
            </React.Fragment>))}
          </div>
          <span style={{ font: "700 12px Archivo,sans-serif", letterSpacing: ".07em", textTransform: "uppercase", color: "var(--muted)", marginTop: "6px" }}>
            {"Quellen"}
          </span>
          {(md.sources || []).map((q: any, i_q5: number) => (<React.Fragment key={i_q5}>
            <span style={{ font: "400 14px/1.4 Archivo,sans-serif", color: "var(--muted)" }}>
              {q.t}
            </span>
          </React.Fragment>))}
        </div>
        <button onClick={startWithMethod} style={{ height: "60px", borderRadius: "16px", border: "0", background: "var(--ink)", color: "var(--bg)", font: "800 17px Archivo,sans-serif", fontStretch: "112%", cursor: "pointer" }}>
          {"Mit dieser Methode starten"}
        </button>
      </div>
    </>) : null}
    </>
  );
}
