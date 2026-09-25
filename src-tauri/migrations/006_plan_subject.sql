-- Plan nauki na przedmiot: kazdy przedmiot ma wlasna diagnoze i wlasny
-- aktywny plan. Dotychczasowe plany pochodzily z diagnozy matematyki.
--
-- Migracje sa dopisywane, nigdy edytowane.

ALTER TABLE plans ADD COLUMN subject_id TEXT NOT NULL DEFAULT 'math';

CREATE INDEX IF NOT EXISTS idx_plans_subject ON plans (subject_id, active);
