import { useEffect, useState } from 'react';
import type { KontekstNauczyciela, Prosba, StatusNauczyciela } from '@/nauka/nauczyciel-kontekst';
import { statusNauczyciela, type Odpowiedz } from '@/nauka/nauczyciel-klient';
import { NauczycielPanel } from '@/nauka/NauczycielPanel';
import './ai.css';
import '@/nauka/nauka.css';

export function TeacherCompanion({ context, onHelp, conversationId, onUseNotation, compact = false }: {
  context: KontekstNauczyciela;
  onHelp?: (response: Odpowiedz, request: Prosba) => void;
  conversationId?: string;
  onUseNotation?: (text: string, expression?: string) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<StatusNauczyciela | null>(null);
  useEffect(() => {
    let active = true;
    void statusNauczyciela().then(s => { if (active) setStatus(s); });
    return () => { active = false; };
  }, [open]);
  return <>
    <aside className={`teacher-companion${compact ? ' teacher-companion--compact' : ''}`} aria-label="Nauczyciel przy zadaniu">
      <div>{!compact && <strong>Nauczyciel przy Tobie</strong>}
        <p role="status" className={compact && (!status || (status.dostepny && status.providerVerified !== false)) ? 'sr-only' : undefined}>{!status ? 'Sprawdzam połączenie…' : status.dostepny ? status.providerVerified === false ? 'Klucz zapisany · połączenie jeszcze niesprawdzone' : compact ? 'AI połączone' : 'AI połączone · pomoc w jednym kroku' : status.wymagaKodu ? 'Połącz nauczyciela swoim kodem dostępu' : 'Pomoc lokalna · AI niepołączone'}</p>
      </div>
      <button type="button" className="btn btn--small" aria-label={compact ? 'Zapytaj nauczyciela' : undefined} title={compact ? 'Zapytaj nauczyciela' : undefined} onClick={() => setOpen(true)}>
        {compact ? 'Zapytaj' : status?.dostepny ? 'Zapytaj nauczyciela' : 'Nauczyciel i połączenie'}
      </button>
    </aside>
    {open && <NauczycielPanel kontekst={context} onZamknij={() => setOpen(false)}
      {...(onHelp ? { onOdpowiedz: onHelp } : {})}
      {...(conversationId ? { conversationId } : {})}
      {...(onUseNotation ? { onUseNotation } : {})}
      wstep="Widzę treść zadania i Twój brudnopis. Pomogę Ci przejść jeden krok. Możesz też opisać działanie słowami i wybrać zapis matematyczny."
    />}
  </>;
}
