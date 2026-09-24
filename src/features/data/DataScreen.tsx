import { useCallback, useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import { MAX_BACKUPS, type BackupInfo, type SnapshotV1, type StoragePort } from '@/data/storage-port';
import type { MissionKind, Question, Skill } from '@/data/types';
import {
  attemptsToCsv,
  exportFileName,
  listSessions,
  planDeletion,
  type DeletionPlan,
} from '@/learning-engine/data-control';
import {
  MAX_IMPORT_BYTES,
  deleteBackups,
  deleteEverything,
  deleteSelection,
  downloadText,
  importSnapshot,
  parseImportFile,
  restoreBackup,
  toDataSnapshot,
} from './operations';
import { ATTEMPTS, MISSIONS, SKILLS, count } from '@/learning-engine/polish';
import './data.css';

/**
 * Twoje dane — Blueprint sek. 12.
 *
 * Eksport do jawnego JSON/CSV, import z walidacją i kopią przed zmianą,
 * usuwanie sesji, przedmiotu albo wszystkiego. Każda zmiana najpierw pokazuje
 * skutek w liczbach i czeka na drugie kliknięcie.
 */

export interface SubjectInfo {
  id: string;
  label: string;
  skillIds: string[];
}

interface Props {
  storage: () => StoragePort;
  subjects: SubjectInfo[];
  /** Wszystkie przedmioty — CSV podaje nazwy kompetencji zamiast identyfikatorów. */
  skills: Skill[];
  questions: Question[];
  /** Przeładowanie profilu w aplikacji po zmianie danych. */
  onChanged: () => Promise<void>;
  onBack: () => void;
}

const KIND_LABELS: Record<MissionKind, string> = {
  warmup: 'rozgrzewka',
  training: 'trening',
  'mixed-patrol': 'patrol mieszany',
  repair: 'naprawa',
  boss: 'sprawdzian',
  'time-trial': 'próba czasowa',
  comeback: 'powrót',
  diagnostic: 'diagnoza',
};

type Pending =
  | { key: string; kind: 'delete'; plan: DeletionPlan; reason: string; everything: boolean }
  | { key: string; kind: 'restore'; backup: BackupInfo }
  | { key: 'import'; kind: 'import'; snapshot: SnapshotV1; fileName: string }
  | { key: 'backups'; kind: 'delete-backups' };

type Message = { tone: 'ok' | 'error'; text: string };

const dateTime = (ts: number) =>
  new Date(ts).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' });

export function DataScreen({ storage, subjects, skills, questions, onChanged, onBack }: Props) {
  const [snapshot, setSnapshot] = useState<SnapshotV1 | null>(null);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [pending, setPending] = useState<Pending | null>(null);
  const [keepBackup, setKeepBackup] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const refresh = useCallback(async () => {
    const port = storage();
    setSnapshot(await port.exportAll());
    setBackups(await port.listBackups());
  }, [storage]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /** Wspólny przebieg każdej zmiany: blokada, zmiana, przeładowanie, komunikat. */
  const change = async (work: () => Promise<string>) => {
    setBusy(true);
    setMessage(null);
    try {
      const text = await work();
      await onChanged();
      await refresh();
      setMessage({ tone: 'ok', text });
    } catch (err) {
      setMessage({ tone: 'error', text: err instanceof Error ? err.message : 'Operacja się nie udała.' });
    } finally {
      setPending(null);
      setBusy(false);
    }
  };

  const exportJson = async () => {
    const data = await storage().exportAll();
    const name = exportFileName('json', Date.now());
    downloadText(name, JSON.stringify(data, null, 2), 'application/json');
    setMessage({ tone: 'ok', text: `Zapisano ${name} w folderze pobranych plików.` });
  };

  const exportCsv = () => {
    if (!snapshot) return;
    const name = exportFileName('csv', Date.now());
    downloadText(name, attemptsToCsv(snapshot.attempts, skills, questions), 'text/csv;charset=utf-8');
    setMessage({ tone: 'ok', text: `Zapisano ${name} w folderze pobranych plików.` });
  };

  const pickImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    // Czyszczenie pola pozwala wybrać ten sam plik jeszcze raz po poprawce.
    input.value = '';
    if (!file) return;
    setMessage(null);
    if (file.size > MAX_IMPORT_BYTES) {
      setMessage({ tone: 'error', text: 'Plik jest za duży jak na kopię FORGE.' });
      return;
    }
    try {
      const parsed = parseImportFile(await file.text());
      setPending({ key: 'import', kind: 'import', snapshot: parsed, fileName: file.name });
    } catch (err) {
      setMessage({ tone: 'error', text: err instanceof Error ? err.message : 'Nie udało się odczytać pliku.' });
    }
  };

  const askDelete = (key: string, plan: DeletionPlan, reason: string, everything = false) => {
    setMessage(null);
    setKeepBackup(true);
    setPending({ key, kind: 'delete', plan, reason, everything });
  };

  const confirm = () => {
    if (!pending) return;
    const port = storage();
    switch (pending.kind) {
      case 'import':
        void change(async () => {
          await importSnapshot(port, pending.snapshot);
          return 'Dane zastąpione kopią z pliku. Poprzedni stan jest w kopiach bezpieczeństwa.';
        });
        return;
      case 'restore':
        void change(async () => {
          await restoreBackup(port, pending.backup.id);
          return 'Kopia przywrócona. Stan sprzed przywrócenia też trafił do kopii.';
        });
        return;
      case 'delete-backups':
        void change(async () => {
          await deleteBackups(port);
          return 'Kopie bezpieczeństwa usunięte.';
        });
        return;
      case 'delete':
        void change(async () => {
          if (pending.everything) {
            await deleteEverything(port);
            return 'Wszystkie dane usunięte, łącznie z kopiami bezpieczeństwa.';
          }
          await deleteSelection(port, pending.plan, keepBackup, pending.reason);
          return keepBackup ? 'Usunięte. Kopia do cofnięcia jest w kopiach bezpieczeństwa.' : 'Usunięte.';
        });
    }
  };

  const confirmBox = (key: string): ReactNode => {
    if (!pending || pending.key !== key) return null;
    return (
      <ConfirmBox
        pending={pending}
        current={snapshot}
        backups={backups.length}
        keepBackup={keepBackup}
        onKeepBackup={setKeepBackup}
        busy={busy}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    );
  };

  const data = snapshot ? toDataSnapshot(snapshot) : null;
  const sessions = data ? listSessions(data) : [];

  return (
    <main className="data">
      <header>
        <button type="button" className="data__back" onClick={onBack}>
          &larr; Centrum dowodzenia
        </button>
        <p className="data__eyebrow">Tylko na tym komputerze</p>
        <h1 className="data__title">Twoje dane</h1>
        <p className="data__lead">
          Wszystko jest zapisane lokalnie. Aplikacja niczego nie wysyła w tle i nie ma konta w
          chmurze. Tutaj możesz dane zabrać, wczytać albo usunąć.
        </p>
        {snapshot && (
          <p className="data__counts">
            Teraz: {count(snapshot.missions.length, MISSIONS)},{' '}
            {count(snapshot.attempts.length, ATTEMPTS)}, {count(snapshot.skillStates.length, SKILLS)}{' '}
            ze stanem
            {snapshot.plan ? ', aktywny plan nauki' : ''}.
          </p>
        )}
      </header>

      {message && (
        <p className={`data__message data__message--${message.tone}`} role="status">
          {message.text}
        </p>
      )}

      <section className="data__box">
        <h2>Eksport</h2>
        <p>
          JSON to pełna kopia, którą można potem wczytać z powrotem. CSV to same próby — do
          obejrzenia w arkuszu (separator: średnik).
        </p>
        <div className="data__row">
          <button type="button" className="data__primary" onClick={() => void exportJson()} disabled={busy}>
            Pobierz kopię JSON
          </button>
          <button type="button" className="data__secondary" onClick={exportCsv} disabled={busy || !snapshot}>
            Pobierz próby jako CSV
          </button>
        </div>
      </section>

      <section className="data__box">
        <h2>Import</h2>
        <p>
          Wczytanie kopii zastępuje wszystkie obecne dane. Plik jest najpierw sprawdzany — uszkodzony
          niczego nie zmieni. Przed zastąpieniem zapisujemy kopię bezpieczeństwa obecnego stanu.
        </p>
        <label className="data__file">
          <span>Wybierz plik kopii (.json)</span>
          <input
            type="file"
            accept="application/json,.json"
            onChange={(e) => void pickImport(e)}
            disabled={busy}
          />
        </label>
        {confirmBox('import')}
      </section>

      <section className="data__box">
        <h2>Kopie bezpieczeństwa</h2>
        <p>
          Powstają automatycznie przed importem, przywróceniem i — jeśli tego chcesz — przed
          usunięciem. Trzymamy ostatnie {MAX_BACKUPS}. Są w tej samej lokalnej bazie co dane.
        </p>
        {backups.length === 0 ? (
          <p className="data__empty">Nie ma jeszcze żadnej kopii.</p>
        ) : (
          <ul className="data__list">
            {backups.map((b) => (
              <li key={b.id}>
                <div className="data__item">
                  <span className="data__item-main">
                    {dateTime(b.createdAt)} — {b.reason}
                  </span>
                  <span className="data__item-meta">
                    {count(b.missions, MISSIONS)}, {count(b.attempts, ATTEMPTS)}
                  </span>
                  <button
                    type="button"
                    className="data__secondary"
                    disabled={busy}
                    onClick={() => setPending({ key: `restore:${b.id}`, kind: 'restore', backup: b })}
                  >
                    Przywróć
                  </button>
                </div>
                {confirmBox(`restore:${b.id}`)}
              </li>
            ))}
          </ul>
        )}
        {backups.length > 0 && (
          <>
            <button
              type="button"
              className="data__danger"
              disabled={busy}
              onClick={() => setPending({ key: 'backups', kind: 'delete-backups' })}
            >
              Usuń wszystkie kopie
            </button>
            {confirmBox('backups')}
          </>
        )}
      </section>

      <section className="data__box">
        <h2>Usuwanie</h2>

        <h3>Pojedyncza sesja</h3>
        {sessions.length === 0 ? (
          <p className="data__empty">Nie ma zapisanych sesji.</p>
        ) : (
          <ul className="data__list data__list--scroll">
            {sessions.map((m) => (
              <li key={m.id}>
                <div className="data__item">
                  <span className="data__item-main">
                    {dateTime(m.startedAt)} — {m.title}
                  </span>
                  <span className="data__item-meta">
                    {m.kind ? (KIND_LABELS[m.kind] ?? m.kind) : 'nieukończona'}, {count(m.attempts, ATTEMPTS)}
                  </span>
                  <button
                    type="button"
                    className="data__secondary"
                    disabled={busy || !data}
                    onClick={() =>
                      data &&
                      askDelete(
                        `mission:${m.id}`,
                        planDeletion({ kind: 'mission', missionId: m.id }, data),
                        'przed usunięciem sesji',
                      )
                    }
                  >
                    Usuń
                  </button>
                </div>
                {confirmBox(`mission:${m.id}`)}
              </li>
            ))}
          </ul>
        )}

        <h3>Cały przedmiot</h3>
        <div className="data__row">
          {subjects.map((s) => (
            <button
              key={s.id}
              type="button"
              className="data__secondary"
              disabled={busy || !data}
              onClick={() =>
                data &&
                askDelete(
                  `subject:${s.id}`,
                  planDeletion({ kind: 'subject', skillIds: s.skillIds, label: s.label }, data),
                  `przed usunięciem przedmiotu ${s.label}`,
                )
              }
            >
              Usuń dane: {s.label}
            </button>
          ))}
        </div>
        {subjects.map((s) => (
          <div key={s.id}>{confirmBox(`subject:${s.id}`)}</div>
        ))}

        <h3>Wszystko</h3>
        <button
          type="button"
          className="data__danger"
          disabled={busy || !data}
          onClick={() => data && askDelete('all', planDeletion({ kind: 'all' }, data), '', true)}
        >
          Usuń wszystkie dane
        </button>
        {confirmBox('all')}
      </section>
    </main>
  );
}

interface ConfirmProps {
  pending: Pending;
  current: SnapshotV1 | null;
  backups: number;
  keepBackup: boolean;
  onKeepBackup: (value: boolean) => void;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmBox({ pending, current, backups, keepBackup, onKeepBackup, busy, onConfirm, onCancel }: ConfirmProps) {
  let body: ReactNode;
  let action: string;
  let danger = true;

  switch (pending.kind) {
    case 'import':
      body = (
        <>
          <p>
            Plik <strong>{pending.fileName}</strong> z {dateTime(pending.snapshot.exportedAt)}:{' '}
            {count(pending.snapshot.missions.length, MISSIONS)},{' '}
            {count(pending.snapshot.attempts.length, ATTEMPTS)}.
          </p>
          <p>
            Zastąpi obecne dane ({count(current?.missions.length ?? 0, MISSIONS)},{' '}
            {count(current?.attempts.length ?? 0, ATTEMPTS)}). Obecny stan trafi najpierw do kopii
            bezpieczeństwa.
          </p>
        </>
      );
      action = 'Zastąp dane tą kopią';
      danger = false;
      break;
    case 'restore':
      body = (
        <p>
          Przywrócenie kopii z {dateTime(pending.backup.createdAt)} ({count(pending.backup.missions, MISSIONS)},{' '}
          {count(pending.backup.attempts, ATTEMPTS)}) zastąpi obecne dane. Obecny stan trafi najpierw do kopii.
        </p>
      );
      action = 'Przywróć tę kopię';
      danger = false;
      break;
    case 'delete-backups':
      body = (
        <p>
          Usunięte zostaną wszystkie kopie bezpieczeństwa ({backups}). Twoje obecne dane zostają.
          Tego nie da się cofnąć.
        </p>
      );
      action = 'Tak, usuń kopie';
      break;
    case 'delete':
      body = (
        <>
          <p>{pending.plan.summary}</p>
          {pending.everything ? (
            <p>
              Razem z danymi znikną kopie bezpieczeństwa ({backups}) — inaczej usunięcie byłoby
              pozorne. Tego nie da się cofnąć. Jeśli chcesz coś zachować, najpierw pobierz kopię
              JSON.
            </p>
          ) : (
            <label className="data__check">
              <input
                type="checkbox"
                checked={keepBackup}
                onChange={(e) => onKeepBackup(e.target.checked)}
              />
              <span>
                Zachowaj kopię do cofnięcia. Kopia zawiera usuwane dane — jeśli mają zniknąć na
                dobre, odznacz albo usuń potem kopie.
              </span>
            </label>
          )}
        </>
      );
      action = pending.everything ? 'Tak, usuń wszystko' : 'Tak, usuń';
      break;
  }

  return (
    <div className="data__confirm" role="alertdialog" aria-label="Potwierdzenie">
      {body}
      <div className="data__row">
        <button
          type="button"
          className={danger ? 'data__danger' : 'data__primary'}
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? 'Pracuję…' : action}
        </button>
        <button type="button" className="data__secondary" onClick={onCancel} disabled={busy}>
          Anuluj
        </button>
      </div>
    </div>
  );
}
