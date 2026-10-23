// Rahmen der App: Scrollbereich mit allen Screens, darüber Tab-Leiste, „Session starten“, Toast und Sheets.
import { useEffect } from 'react';
import type { VM } from './types';
import { HeuteScreen } from './screens/HeuteScreen';
import { GewaesserListe } from './screens/GewaesserListe';
import { GewaesserDetail } from './screens/GewaesserDetail';
import { MethodenDetail } from './screens/MethodenDetail';
import { LiveSession } from './screens/LiveSession';
import { Fangbuch } from './screens/Fangbuch';
import { SessionDetail } from './screens/SessionDetail';
import { Auswertung } from './screens/Auswertung';
import { Mehr } from './screens/Mehr';
import { Ausruestung } from './screens/Ausruestung';
import { Koederbox } from './screens/Koederbox';
import { Daten } from './screens/Daten';
import { SessionEdit } from './screens/SessionEdit';
import { Overlays } from './screens/Overlays';
import { Sheets } from './screens/Sheets';

const THEME_COLOR = { light: '#f2f0e8', dark: '#0e1613' } as const;

export function AppShell({ vm }: { vm: VM }) {
  const theme: 'light' | 'dark' = vm.theme;
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
  }, [theme]);

  return (
    <div className="app" data-theme={theme}>
      <div className="statusbar" />
      <div ref={vm.scrollRef} className="scroller">
        <HeuteScreen vm={vm} />
        <GewaesserListe vm={vm} />
        <GewaesserDetail vm={vm} />
        <MethodenDetail vm={vm} />
        <LiveSession vm={vm} />
        <Fangbuch vm={vm} />
        <SessionDetail vm={vm} />
        <Auswertung vm={vm} />
        <Mehr vm={vm} />
        <Ausruestung vm={vm} />
        <Koederbox vm={vm} />
        <Daten vm={vm} />
        <SessionEdit vm={vm} />
      </div>
      <Overlays vm={vm} />
      <Sheets vm={vm} />
    </div>
  );
}
