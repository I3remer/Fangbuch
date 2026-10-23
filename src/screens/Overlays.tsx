// Aus dem Design „Fangbuch App v3“ übernommen. Struktur und Inline-Styles entsprechen dem Prototyp.
import React from 'react';
import type { VM } from '../types';

export function Overlays({ vm }: { vm: VM }) {
  const { fabClick, fabLabel, showFab, showTabs, tabs, toast, swUpdate } = vm;
  return (
    <>
    {showFab ? (<>
      <button onClick={fabClick} style={{ position: "absolute", right: "16px", bottom: "calc(78px + max(env(safe-area-inset-bottom), 10px))", height: "60px", padding: "0 22px 0 18px", borderRadius: "30px", border: "0", background: "var(--orange)", color: "var(--onorange)", font: "800 16px Archivo,sans-serif", fontStretch: "110%", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 8px 22px rgba(0,0,0,.28)", zIndex: "5", cursor: "pointer" }}>
        <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "var(--onorange)" }} />
        {fabLabel}
      </button>
    </>) : null}
    {showTabs ? (<>
      <div style={{ height: "calc(62px + max(env(safe-area-inset-bottom), 10px))", flex: "none", display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", borderTop: "1px solid var(--line)", background: "var(--surface)", padding: "0 4px max(env(safe-area-inset-bottom), 10px)" }}>
        {(tabs || []).map((t: any, i_t4: number) => (<React.Fragment key={i_t4}>
          <button onClick={t.go} style={t.style}>
            <span style={t.bar} />
            {t.label}
            <span style={t.dot} />
          </button>
        </React.Fragment>))}
      </div>
    </>) : null}
    {swUpdate ? (
      <div style={{ position: "absolute", left: "20px", right: "20px", top: "calc(max(env(safe-area-inset-top), 20px) + 10px)", zIndex: 29, background: "var(--hdr)", color: "var(--hdrink)", borderRadius: "14px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 8px 24px rgba(0,0,0,.25)" }}>
        <span style={{ flex: "1", font: "600 15px/1.35 Archivo,sans-serif" }}>{"Eine neue Version der App ist da."}</span>
        <button onClick={swUpdate} style={{ height: "44px", padding: "0 14px", borderRadius: "12px", border: "0", background: "var(--orange)", color: "var(--onorange)", font: "800 14px Archivo,sans-serif", cursor: "pointer", flex: "none" }}>{"Jetzt laden"}</button>
      </div>
    ) : null}
    {toast ? (<>
      <div style={{ position: "absolute", left: "20px", right: "20px", top: "calc(max(env(safe-area-inset-top), 20px) + 10px)", zIndex: "30", background: "var(--ink)", color: "var(--bg)", borderRadius: "14px", padding: "14px 16px", font: "600 15px/1.35 Archivo,sans-serif", boxShadow: "0 8px 24px rgba(0,0,0,.25)" }}>
        {toast}
      </div>
    </>) : null}
    </>
  );
}
