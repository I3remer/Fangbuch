// Köder mit allen Angaben fürs Fangbuch: Typ, Modell, Farbe, Größe, Gewicht, Führung, Wasserschicht und Montage.
import { AUSTRITT, FUEHRUNG, KOEDERTYP, MONTAGE, SCHICHT, SPITZE, STINGERPOS, montageText, kClean } from '../lib/fangbuch';
import { Check, ChoiceText, Chips, Collapse, Field, S } from './ui';

type Props = { d: any; set: (path: string, v: any) => void; typen: string[]; montagen: string[]; labels?: string[]; withLabel?: boolean; labelTitle?: string; onLabelDone?: () => void };

export function KoederForm({ d, set, typen, montagen, labels = [], withLabel = true, labelTitle = 'Köder', onLabelDone }: Props) {
  const m = d.montage || {};
  const mHint = montageText(kClean({ montage: m }).montage);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {withLabel && <Field label={labelTitle} value={d.label} placeholder="z. B. TT Shad 12 cm" list="dl-klabels" onChange={(v) => set('label', v)} onBlur={onLabelDone} />}
      {withLabel && <datalist id="dl-klabels">{labels.map((x) => <option key={x} value={x} />)}</datalist>}
      <ChoiceText label="Ködertyp" list={[...new Set([...KOEDERTYP, ...typen])]} value={d.typ} onChange={(v) => set('typ', v)} placeholder="Eigener Typ" />
      <div style={S.grid2}><Field label="Modell" value={d.modell} onChange={(v) => set('modell', v)} /><Field label="Farbe, Dekor" value={d.farbe} onChange={(v) => set('farbe', v)} /></div>
      <div style={S.grid2}><Field label="Länge in cm" inputMode="decimal" value={d.groesseCm} onChange={(v) => set('groesseCm', v)} /><Field label="Gewicht in g" inputMode="decimal" placeholder="ohne Montage" value={d.gewichtG} onChange={(v) => set('gewichtG', v)} /></div>
      <ChoiceText label="Führung" list={FUEHRUNG} value={d.fuehrung} onChange={(v) => set('fuehrung', v)} />
      <Chips label="Wasserschicht" small opts={SCHICHT.map((x) => ({ label: x, on: d.schicht === x, pick: () => set('schicht', d.schicht === x ? '' : x) }))} />
      <Collapse title="Montage" hint={mHint || 'Jigkopf, Haken, Stinger …'}>
        <ChoiceText label="Montage" list={[...new Set([...MONTAGE, ...montagen])]} value={m.art} onChange={(v) => set('montage.art', v)} placeholder="z. B. Ned-Rig" />
        <div style={S.grid2}><Field label="Kopf- bzw. Blei in g" inputMode="decimal" value={m.bleiG} onChange={(v) => set('montage.bleiG', v)} /><Field label="Haken" placeholder="z. B. 5/0" value={m.haken} onChange={(v) => set('montage.haken', v)} /></div>
        <Chips label="Hakenaustritt" small opts={AUSTRITT.map((x) => ({ label: x, on: m.hakenAustritt === x, pick: () => set('montage.hakenAustritt', m.hakenAustritt === x ? '' : x) }))} />
        <Chips label="Hakenspitze" small opts={SPITZE.map((x) => ({ label: x, on: m.hakenspitze === x, pick: () => set('montage.hakenspitze', m.hakenspitze === x ? '' : x) }))} />
        <Check label="Stinger" value={!!m.stinger} onChange={(v) => set('montage.stinger', v)} />
        {m.stinger && <Field label="Stinger" placeholder="z. B. Drilling Gr. 4 an NiTi" value={m.stingerArt} onChange={(v) => set('montage.stingerArt', v)} />}
        {m.stinger && <ChoiceText label="Stinger-Position" list={STINGERPOS} value={m.stingerPosition} onChange={(v) => set('montage.stingerPosition', v)} />}
        <Field label="Notiz zur Montage" value={m.notiz} onChange={(v) => set('montage.notiz', v)} />
      </Collapse>
    </div>
  );
}
