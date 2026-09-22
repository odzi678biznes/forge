-- Plan nauki i preferencje - Blueprint sek. 15, Etap 3 i 5.
--
-- Migracje sa dopisywane, nigdy edytowane: uzytkownicy, ktorzy wykonali
-- juz migracje 001, dostana wylacznie ten przyrost.

CREATE TABLE IF NOT EXISTS plans (
    id                 TEXT PRIMARY KEY NOT NULL,
    variant            TEXT NOT NULL CHECK (variant IN ('minimum', 'realistic', 'ambitious')),
    created_at         INTEGER NOT NULL,
    deadline           INTEGER,
    -- Cele i migawka diagnozy jako JSON. Sa czytane i zapisywane zawsze
    -- w calosci, wiec osobne tabele nie dalyby tu nic poza zlozonoscia.
    targets            TEXT NOT NULL DEFAULT '[]',
    diagnosis_snapshot TEXT NOT NULL DEFAULT '[]',
    -- Aktywny plan jest dokladnie jeden; starsze zostaja jako historia.
    active             INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS preferences (
    key   TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_plans_active ON plans (active, created_at);
