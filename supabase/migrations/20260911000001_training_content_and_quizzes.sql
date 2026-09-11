-- ============================================================
-- Phase E: training module content + quiz authoring
-- ============================================================
-- training_modules/training_requirements/training_completions already
-- existed as infrastructure with no way to author content or actually
-- complete a module. This adds:
--   1. Reading content + a passing score threshold on the module itself.
--   2. A quiz_questions table (admin-authored, multiple choice).
-- Quiz questions are intentionally NOT readable via the authenticated
-- role's own RLS-scoped session — only admins can SELECT/write them
-- directly. The quiz-taking page and grading action instead go through
-- the service-role client server-side, so the correct answer is never
-- sent to a browser that isn't an admin's.

ALTER TABLE training_modules
  ADD COLUMN content_body  TEXT,
  ADD COLUMN passing_score NUMERIC(5,2) NOT NULL DEFAULT 80.00;

CREATE TABLE training_quiz_questions (
  id                SERIAL PRIMARY KEY,
  module_id         INTEGER     NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  sort_order        INTEGER     NOT NULL DEFAULT 0,
  question_text     TEXT        NOT NULL,
  -- [{"id": "a", "text": "..."}, {"id": "b", "text": "..."}, ...]
  choices           JSONB       NOT NULL,
  correct_choice_id TEXT        NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quiz_questions_module ON training_quiz_questions (module_id);

ALTER TABLE training_quiz_questions ENABLE ROW LEVEL SECURITY;

-- Admin-only in both directions — see note above on why there's no
-- authenticated_read policy here, unlike every other content table.
CREATE POLICY "admin_manage_quiz_questions" ON training_quiz_questions FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());
