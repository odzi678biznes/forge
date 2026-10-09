import { useEffect, useId, useState } from 'react';
import { adresNauczyciela, ustawAdresNauczyciela, ustawKodNauczyciela, statusNauczyciela, odswiezStatusNauczyciela } from '@/nauka/nauczyciel-klient';
import type { StatusNauczyciela } from '@/nauka/nauczyciel-kontekst';
import './ai.css';

/** Only the public endpoint persists. Credentials stay out of the repository. */
export function TeacherConnection({ onStatus }: { onStatus?: (status: StatusNauczyciela) => void }) {
  const [status, setStatus] = useState<StatusNauczyciela | null>(null);
  const [endpoint, setEndpoint] = useState(adresNauczyciela);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [providerKey, setProviderKey] = useState('');
  const [saved, setSaved] = useState('');
  const [localSetup, setLocalSetup] = useState<{ localSetupAvailable?: boolean; persisted?: boolean; storageError?: string | null } | null>(null);
  const [changeKey, setChangeKey] = useState(false);
  const id = useId();
  useEffect(() => { let active = true; void statusNauczyciela().then(s => { if (active) setStatus(s); }); return () => { active = false; }; }, []);
  useEffect(() => {
    if (!['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) return;
    let active = true;
    void fetch(`${import.meta.env.BASE_URL}api/nauczyciel/setup`, { cache: 'no-store', signal: AbortSignal.timeout(15000) })
      .then(async r => { if (!r.ok) return; const data = await r.json(); if (active && data.localSetupAvailable === true) setLocalSetup(data); }).catch(() => {});
    return () => { active = false; };
  }, []);
  const connect = async () => {
    setBusy(true); setError('');
    try {
      ustawAdresNauczyciela(endpoint);
      if (code.trim()) { ustawKodNauczyciela(code); setCode(''); }
      const next = await odswiezStatusNauczyciela(); setStatus(next); onStatus?.(next);
    } catch (e) { setError(e instanceof Error ? e.message : 'Nie udało się połączyć.'); }
    finally { setBusy(false); }
  };
  const saveClaudeKey = async () => {
    setBusy(true); setError(''); setSaved('');
    const key = providerKey.trim(); setProviderKey('');
    try {
      // Same-origin endpoint only; never send the provider key to a configurable host.
      const response = await fetch(`${import.meta.env.BASE_URL}api/nauczyciel/setup`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }), signal: AbortSignal.timeout(30000), cache: 'no-store',
      });
      const result = await response.json() as { saved?: boolean; blad?: string; message?: string };
      if (!response.ok || result.saved !== true) throw new Error(result.blad ?? 'Magazyn Windows nie potwierdził zapisu klucza.');
      ustawAdresNauczyciela(`${import.meta.env.BASE_URL}api/nauczyciel`);
      setEndpoint(adresNauczyciela());
      const next = await odswiezStatusNauczyciela(); setStatus(next); onStatus?.(next);
      setSaved(result.message ?? 'Klucz zapisany w magazynie Windows.');
      setLocalSetup({ localSetupAvailable: true, persisted: true, storageError: null });
      setChangeKey(false);
    } catch (e) { setError(e instanceof Error ? e.message : 'Nie udało się zapisać klucza.'); }
    finally { setBusy(false); }
  };
  const keyStored = localSetup?.persisted || status?.persisted;
  return <section className="teacher-connection" aria-label="Połączenie nauczyciela">
    <p role="status">{!status ? 'Sprawdzam nauczyciela…' : status.dostepny ? status.providerVerified === false ? 'Klucz skonfigurowany · połączenie z Claude jeszcze niesprawdzone' : `Nauczyciel AI połączony · ${status.model ?? 'serwer'}` : status.powod ?? 'Nauczyciel jest niepołączony.'}</p>
    {keyStored && <div>
      <p>Klucz jest zapisany w magazynie Windows. Nauczyciel odczytuje go automatycznie po uruchomieniu aplikacji.</p>
      <button type="button" className="btn btn--small" aria-expanded={changeKey} onClick={() => setChangeKey(v => !v)}>{changeKey ? 'Anuluj zmianę klucza' : 'Zmień zapisany klucz'}</button>
    </div>}
    {(localSetup?.localSetupAvailable || status?.localSetupAvailable) && (!keyStored || changeKey) && <form className="teacher-connection" onSubmit={e => { e.preventDefault(); void saveClaudeKey(); }}>
      <h3>Klucz API Claude</h3>
      <p>Wklej klucz Anthropic. Zapiszę go w magazynie poświadczeń Windows na tym komputerze. Nie trafi do repozytorium ani pamięci przeglądarki.</p>
      <label htmlFor={`${id}-claude`}>Klucz API Claude
        <input id={`${id}-claude`} type="password" autoComplete="off" spellCheck={false} value={providerKey} onChange={e => setProviderKey(e.target.value)} placeholder="sk-ant-…" maxLength={520} />
      </label>
      <button type="submit" className="btn btn--primary" disabled={busy || !providerKey.trim()}>{busy ? 'Zapisuję…' : 'Zapisz klucz Claude bezpiecznie'}</button>
      <p>Zapis nie wykonuje płatnego zapytania. Klucz służy lokalnemu nauczycielowi na tym komputerze.</p>
    </form>}
    {(localSetup?.storageError || status?.storageError) && <p role="alert">{localSetup?.storageError || status?.storageError}</p>}
    {saved && <p role="status">{saved}</p>}
    {(status || localSetup) && <details open={!keyStored}><summary>Połączenie z nauczycielem na innym serwerze</summary>
    <p>Adres serwera jest zapamiętywany na tym urządzeniu. Poniższy kod dostępu dotyczy nauczyciela zdalnego; nie wpisuj w nim klucza API.</p>
    <form className="teacher-connection" onSubmit={e => { e.preventDefault(); void connect(); }}>
      <label htmlFor={`${id}-code`}>Kod dostępu do nauczyciela
        <input id={`${id}-code`} type="password" autoComplete="current-password" value={code} onChange={e => setCode(e.target.value)} />
      </label>
      <p>Kod zostaje w tej sesji przeglądarki. Menedżer haseł może go uzupełniać przy kolejnym uruchomieniu.</p>
      <details><summary>Adres serwera</summary>
        <label htmlFor={`${id}-endpoint`}>Adres nauczyciela
          <input id={`${id}-endpoint`} type="text" inputMode="url" autoComplete="off" value={endpoint} onChange={e => setEndpoint(e.target.value)} />
        </label>
      </details>
      <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? 'Łączę…' : 'Zapisz i sprawdź połączenie'}</button>
    </form>
    </details>}
    {error && <p role="alert">{error}</p>}
  </section>;
}

/** A visible, non-blocking setup entry before the first lesson. */
export function TeacherStartup() {
  const [status, setStatus] = useState<StatusNauczyciela | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => { let active = true; void statusNauczyciela().then(s => { if (active) { setStatus(s); } }); return () => { active = false; }; }, []);
  return <aside className="teacher-companion" aria-label="Nauczyciel przed nauką">
    <div><strong>Twój nauczyciel</strong>
      <p role="status">{!status ? 'Sprawdzam połączenie…' : status.dostepny ? status.providerVerified === false ? 'Klucz zapisany · połączenie z Claude jeszcze niesprawdzone' : 'AI połączone · będzie dostępne w lekcjach' : 'Połącz AI, żeby pytać podczas każdej lekcji.'}</p>
    </div>
    <button type="button" className="btn btn--small" aria-expanded={open} onClick={() => setOpen(o => !o)}>{open ? 'Schowaj ustawienia' : status?.dostepny ? 'Ustawienia nauczyciela' : 'Połącz nauczyciela'}</button>
    {open && <TeacherConnection onStatus={setStatus} />}
  </aside>;
}
