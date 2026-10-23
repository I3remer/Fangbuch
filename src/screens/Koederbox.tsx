// Aus dem Design „Fangbuch App v3“ übernommen. Struktur und Inline-Styles entsprechen dem Prototyp.
import React from 'react';
import { ImageSlot } from '../components/ImageSlot';
import type { VM } from '../types';

export function Koederbox({ vm }: { vm: VM }) {
  const { back, boxList, boxNew, bx, goDetect, is, itemNew, viewOpts } = vm;
  return (
    <>
    {is.boxes ? (<>
      <div style={{ padding: "0 20px 120px", display: "flex", flexDirection: "column", gap: "14px", color: "var(--ink)" }}>
        <button onClick={back} style={{ alignSelf: "flex-start", height: "48px", padding: "0 12px 0 0", border: "0", background: "transparent", color: "var(--ink)", font: "600 16px Archivo,sans-serif", cursor: "pointer" }}>
          {"‹ Mehr"}
        </button>
        <h1 style={{ margin: "-8px 0 0", font: "800 30px/1 Archivo,sans-serif", fontStretch: "125%" }}>
          {"Köderbox"}
        </h1>
        <span style={{ font: "400 14px/1.4 Archivo,sans-serif", color: "var(--muted)" }}>
          {"Wähle mit „Heute dabei“, welche Box du am Wasser hast. Die Empfehlungen nutzen nur diese Box."}
        </span>
        {!(boxList || []).length ? (<span style={{ font: "400 14px/1.4 Archivo,sans-serif", color: "var(--muted)" }}>{"Noch keine Box. Leg zum Beispiel eine Barsch-Box und eine Hecht-Box an."}</span>) : null}
        {(boxList || []).map((b: any, i_b4: number) => (<React.Fragment key={i_b4}>
          <div style={b.cardStyle}>
            <div style={{ position: "relative", height: "150px" }}>
              <ImageSlot id={b.slotId} placeholder="Foto der Box" shape="rect" style={{ position: "absolute", inset: "0", width: "100%", height: "100%" }} />
            </div>
            <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
                <span style={{ font: "800 18px Archivo,sans-serif", fontStretch: "115%" }}>
                  {b.name}
                </span>
                <span style={{ font: "500 13px Archivo,sans-serif", color: "var(--muted)" }}>
                  {b.count}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {(b.sw || []).map((s: any, i_s8: number) => (<React.Fragment key={i_s8}>
                  <span style={s.style} />
                </React.Fragment>))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "8px" }}>
                <button onClick={b.pickToday} style={b.todayStyle}>
                  {b.todayLabel}
                </button>
                <button onClick={b.open} style={{ height: "48px", borderRadius: "14px", border: "1px solid var(--line)", background: "var(--surface2)", color: "var(--ink)", font: "700 15px Archivo,sans-serif", cursor: "pointer" }}>
                  {"Öffnen ›"}
                </button>
              </div>
            </div>
          </div>
        </React.Fragment>))}
        <button onClick={boxNew} style={{ height: "56px", borderRadius: "16px", border: "1.5px dashed var(--muted)", background: "transparent", color: "var(--ink)", font: "700 15px Archivo,sans-serif", cursor: "pointer" }}>
          {"+ Box anlegen"}
        </button>
      </div>
    </>) : null}
    {is.box ? (<>
      <div style={{ padding: "0 20px 120px", display: "flex", flexDirection: "column", gap: "14px", color: "var(--ink)" }}>
        <button onClick={back} style={{ alignSelf: "flex-start", height: "48px", padding: "0 12px 0 0", border: "0", background: "transparent", color: "var(--ink)", font: "600 16px Archivo,sans-serif", cursor: "pointer" }}>
          {"‹ Köderbox"}
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "10px", marginTop: "-8px" }}>
          <h1 style={{ margin: "0", font: "800 30px/1 Archivo,sans-serif", fontStretch: "125%" }}>
            {bx.name}
          </h1>
          <button onClick={bx.rename} style={{ height: "44px", padding: "0 14px", borderRadius: "12px", border: "1px solid var(--line)", background: "transparent", color: "var(--ink)", font: "600 14px Archivo,sans-serif", cursor: "pointer", flex: "none" }}>
            {"Bearbeiten"}
          </button>
        </div>
        <div style={{ position: "relative", aspectRatio: "4 / 3", borderRadius: "16px", overflow: "hidden" }}>
          <ImageSlot id={bx.slotId} placeholder="Foto der offenen Box" shape="rect" style={{ position: "absolute", inset: "0", width: "100%", height: "100%" }} />
        </div>
        <button onClick={goDetect} style={{ height: "56px", borderRadius: "16px", border: "0", background: "var(--ink)", color: "var(--bg)", font: "800 16px Archivo,sans-serif", cursor: "pointer" }}>
          {"Inhalt aus Foto erkennen"}
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
          <span style={{ font: "800 18px Archivo,sans-serif" }}>
            {bx.count}
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "6px", width: "190px" }}>
            {(viewOpts || []).map((o: any, i_o6: number) => (<React.Fragment key={i_o6}>
              <button onClick={o.pick} style={o.style}>
                {o.label}
              </button>
            </React.Fragment>))}
          </div>
        </div>
        {bx.empty ? (<span style={{ font: "400 14px/1.4 Archivo,sans-serif", color: "var(--muted)" }}>{"Die Box ist noch leer. Trag deine Köder mit „+ Köder hinzufügen“ ein."}</span>) : null}
        {bx.list ? (<>
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "16px", padding: "2px 14px" }}>
            {(bx.items || []).map((i: any, i_i6: number) => (<React.Fragment key={i_i6}>
              <button onClick={i.open} style={{ width: "100%", textAlign: "left", cursor: "pointer", background: "transparent", border: "0", borderBottom: "1px solid var(--line)", padding: "10px 0", display: "flex", gap: "12px", alignItems: "center", color: "var(--ink)", minHeight: "58px" }}>
                <span style={i.sw} />
                <span style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ font: "700 15px Archivo,sans-serif" }}>
                    {i.title}
                  </span>
                  <span style={{ font: "500 13px Archivo,sans-serif", color: "var(--muted)" }}>
                    {i.spec}
                  </span>
                </span>
                <span style={{ font: "700 15px Archivo,sans-serif", fontVariantNumeric: "tabular-nums" }}>
                  {i.n}
                  {"×"}
                </span>
              </button>
            </React.Fragment>))}
          </div>
        </>) : null}
        {bx.tiles ? (<>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "10px" }}>
            {(bx.items || []).map((i: any, i_i6: number) => (<React.Fragment key={i_i6}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "14px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ position: "relative", height: "96px" }}>
                  <ImageSlot id={i.slotId} placeholder={i.col} shape="rect" style={{ position: "absolute", inset: "0", width: "100%", height: "100%" }} />
                </div>
                <button onClick={i.open} style={{ textAlign: "left", cursor: "pointer", background: "transparent", border: "0", padding: "10px", color: "var(--ink)", display: "flex", flexDirection: "column", gap: "2px", minHeight: "60px" }}>
                  <span style={{ font: "700 14px/1.25 Archivo,sans-serif" }}>
                    {i.title}
                  </span>
                  <span style={{ font: "500 12px/1.3 Archivo,sans-serif", color: "var(--muted)" }}>
                    {i.spec}
                    {" · "}
                    {i.n}
                    {"×"}
                  </span>
                </button>
              </div>
            </React.Fragment>))}
          </div>
        </>) : null}
        <button onClick={itemNew} style={{ height: "56px", borderRadius: "16px", border: "1.5px dashed var(--muted)", background: "transparent", color: "var(--ink)", font: "700 15px Archivo,sans-serif", cursor: "pointer" }}>
          {"+ Köder hinzufügen"}
        </button>
      </div>
    </>) : null}

    </>
  );
}
