-- Kurs: ukonczone lekcje i stan fiszek.
--
-- Migracje sa dopisywane, nigdy edytowane.

CREATE TABLE IF NOT EXISTS lesson_progress (
    skill_id     TEXT PRIMARY KEY NOT NULL,
    completed_at INTEGER NOT NULL
);

-- System pudelek: wyzsze pudelko = dluzszy odstep do kolejnej powtorki.
CREATE TABLE IF NOT EXISTS card_states (
    card_id          TEXT PRIMARY KEY NOT NULL,
    -- Umiejetnosc fiszki: usuniecie przedmiotu usuwa tez jego fiszki.
    skill_id         TEXT NOT NULL,
    box              INTEGER NOT NULL DEFAULT 0,
    due_at           INTEGER NOT NULL,
    introduced_at    INTEGER NOT NULL,
    last_reviewed_at INTEGER,
    reviews          INTEGER NOT NULL DEFAULT 0,
    lapses           INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_card_states_due ON card_states (due_at);
CREATE INDEX IF NOT EXISTS idx_card_states_skill ON card_states (skill_id);
