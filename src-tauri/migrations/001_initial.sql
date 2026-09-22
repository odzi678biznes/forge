-- Schemat poczatkowy FORGE - Blueprint sek. 10.
--
-- Tresc (przedmioty, dzialy, kompetencje, pytania) NIE jest tu przechowywana:
-- zyje w repozytorium jako kod i wersjonuje sie razem z aplikacja. Baza trzyma
-- wylacznie to, czego nie da sie odtworzyc - dowody opanowania konkretnego
-- uzytkownika.

CREATE TABLE IF NOT EXISTS skill_states (
    skill_id           TEXT PRIMARY KEY NOT NULL,
    level              INTEGER NOT NULL CHECK (level BETWEEN 0 AND 5),
    independent_streak INTEGER NOT NULL DEFAULT 0,
    level_reached_at   INTEGER,
    review_due_at      INTEGER,
    review_step        INTEGER NOT NULL DEFAULT 0,
    -- Lista identyfikatorow bledow jako JSON. Okno jest krotkie i zawsze
    -- czytane w calosci, wiec osobna tabela nic by tu nie dala.
    recent_errors      TEXT NOT NULL DEFAULT '[]',
    last_attempt_at    INTEGER,
    total_attempts     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS missions (
    id           TEXT PRIMARY KEY NOT NULL,
    kind         TEXT NOT NULL,
    title        TEXT NOT NULL,
    rationale    TEXT NOT NULL,
    question_ids TEXT NOT NULL DEFAULT '[]',
    started_at   INTEGER NOT NULL,
    finished_at  INTEGER
);

CREATE TABLE IF NOT EXISTS attempts (
    id              TEXT PRIMARY KEY NOT NULL,
    question_id     TEXT NOT NULL,
    skill_id        TEXT NOT NULL,
    mission_id      TEXT NOT NULL,
    started_at      INTEGER NOT NULL,
    answered_at     INTEGER NOT NULL,
    user_answer     TEXT NOT NULL,
    correctness     TEXT NOT NULL CHECK (correctness IN ('correct', 'partial', 'incorrect')),
    confidence      TEXT NOT NULL CHECK (confidence IN ('guess', 'partial', 'sure')),
    -- 0 = samodzielnie. Bez tego pola nie da sie odroznic rozwiazania
    -- samodzielnego od wspomaganego, czyli runie caly model opanowania.
    hint_level      INTEGER NOT NULL DEFAULT 0 CHECK (hint_level BETWEEN 0 AND 6),
    error_id        TEXT,
    -- Wersja zasad oceniania obowiazujaca w chwili proby (sek. 10).
    grading_version TEXT NOT NULL,
    graded_by       TEXT NOT NULL CHECK (graded_by IN ('auto', 'user', 'ai'))
);

-- Dziennik bledow filtruje po error_id, kolejka powtorek po kompetencji
-- i czasie. Te dwa indeksy pokrywaja oba zapytania.
CREATE INDEX IF NOT EXISTS idx_attempts_skill_time ON attempts (skill_id, answered_at);
CREATE INDEX IF NOT EXISTS idx_attempts_error ON attempts (error_id) WHERE error_id IS NOT NULL;
