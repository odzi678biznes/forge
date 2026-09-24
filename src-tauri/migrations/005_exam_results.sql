-- Wyniki oficjalnych arkuszy CKE wpisane przez ucznia.
--
-- Migracje sa dopisywane, nigdy edytowane.

CREATE TABLE IF NOT EXISTS exam_results (
    id         TEXT PRIMARY KEY NOT NULL,
    -- Arkusz z katalogu aplikacji, np. "mat-2505-pr".
    exam_id    TEXT NOT NULL,
    -- Usuniecie przedmiotu usuwa tez jego arkusze.
    subject_id TEXT NOT NULL,
    taken_at   INTEGER NOT NULL,
    -- JSON: numer zadania -> punkty.
    scores     TEXT NOT NULL,
    minutes    INTEGER
);

CREATE INDEX IF NOT EXISTS idx_exam_results_exam ON exam_results (exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_subject ON exam_results (subject_id);
