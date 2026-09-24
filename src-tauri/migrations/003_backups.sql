-- Kopie bezpieczenstwa przed zmiana danych - Blueprint sek. 12.
--
-- Migracje sa dopisywane, nigdy edytowane.

CREATE TABLE IF NOT EXISTS backups (
    id         TEXT PRIMARY KEY NOT NULL,
    created_at INTEGER NOT NULL,
    -- Po co powstala kopia, np. "przed importem". Pokazywane uzytkownikowi.
    reason     TEXT NOT NULL,
    attempts   INTEGER NOT NULL,
    missions   INTEGER NOT NULL,
    -- Pelna kopia w tym samym formacie co eksport JSON.
    snapshot   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_backups_created ON backups (created_at);
