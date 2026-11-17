-- ============================================================
-- Native project roles + Gate Review
-- ============================================================
-- Project roles were going to be sourced from Procore (procore_role,
-- a free-text field on project_members), but the Procore integration
-- is no longer a safe assumption to build on. This makes DIP's own
-- roles -- PDPM, Architect, Contractor -- first-class, independent of
-- Procore, and adds the Gate Review feature that needs them:
--
--   - PDPM: exactly one PRIMARY per project, but any number of backup
--     PDPMs (same permissions as primary) so the review can still be
--     run if the primary is out of office. Only CSH Project Delivery
--     staff (System Director, Market Director, Market Manager,
--     Project Manager, Project Coordinator -- tracked org-wide on
--     users.staff_role, independent of any project) can hold the role.
--   - CSH Design team admins (users.tier = 'administrative') already
--     have full access via is_admin() and need no project_members row.
--   - A Gate Review is a frozen checklist snapshot per project/room/
--     phase (SD/DD/CD), never overwritten -- re-running the same phase
--     creates DD_1, DD_2, etc. The PDPM (primary or backup) who starts
--     one can add specific people as collaborators able to check items
--     off on that one review, without granting them any broader role.

-- ── Project Delivery vertical (org-wide, not tied to any project) ──
ALTER TABLE users
  ADD COLUMN staff_role TEXT
    CHECK (staff_role IN (
      'system_director', 'market_director', 'market_manager',
      'project_manager', 'project_coordinator'
    ));
-- NULL for everyone outside Project Delivery: architects, contractors,
-- CSH Design team admins, etc.

-- ── Native project roles, replacing procore_role for permissions ──
ALTER TABLE project_members
  ADD COLUMN project_role TEXT NOT NULL DEFAULT 'architect'
    CHECK (project_role IN ('pdpm', 'architect', 'contractor')),
  ADD COLUMN is_primary_pdpm BOOLEAN NOT NULL DEFAULT FALSE;
-- procore_role stays as display metadata ('Architect of Record', etc.);
-- project_role is what every permission check below uses instead.

-- At most one PRIMARY pdpm per project. Backups share project_role =
-- 'pdpm' with no primary/backup distinction in what they're allowed to do.
CREATE UNIQUE INDEX one_primary_pdpm_per_project
  ON project_members (project_id) WHERE project_role = 'pdpm' AND is_primary_pdpm;

-- Only Project Delivery vertical staff can be assigned the pdpm role.
CREATE OR REPLACE FUNCTION enforce_pdpm_eligibility()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.project_role = 'pdpm' AND NOT EXISTS (
    SELECT 1 FROM users WHERE email = NEW.user_email AND staff_role IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Only Project Delivery staff (System Director, Market Director, '
      'Market Manager, Project Manager, Project Coordinator) can be assigned as PDPM';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_pdpm_eligibility
  BEFORE INSERT OR UPDATE ON project_members
  FOR EACH ROW EXECUTE FUNCTION enforce_pdpm_eligibility();

-- Helper: is current user a PDPM (primary or backup) on this project?
CREATE OR REPLACE FUNCTION is_pdpm(p_project_id INTEGER)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = p_project_id
      AND user_email = auth.jwt()->>'email'
      AND project_role = 'pdpm'
  );
$$;

-- ── Gate Review ──────────────────────────────────────────────
CREATE TABLE project_gate_reviews (
  id                  SERIAL PRIMARY KEY,
  project_id          INTEGER     NOT NULL REFERENCES projects(id),
  room_taxonomy_id    TEXT        NOT NULL REFERENCES rooms(taxonomy_id),
  phase               TEXT        NOT NULL CHECK (phase IN ('SD', 'DD', 'CD')),
  attempt_number      INTEGER     NOT NULL,            -- 1, 2, 3... per (project, room, phase)
  label               TEXT        NOT NULL,            -- 'DD_2' — set by trigger on insert
  initiated_by        TEXT        NOT NULL REFERENCES users(email),
  -- Full required list for this room at the time of the review, each item
  -- tagged with its checked/excluded state. A frozen record, never
  -- recomputed from room_furniture/room_equipment after the fact --
  -- exactly the "I didn't know that chair was required" proof this exists for.
  checklist_snapshot  JSONB       NOT NULL,
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, room_taxonomy_id, phase, attempt_number)
);

CREATE INDEX idx_gate_reviews_project ON project_gate_reviews (project_id);
CREATE INDEX idx_gate_reviews_room    ON project_gate_reviews (room_taxonomy_id);

-- Auto-number attempts and label them per (project, room, phase)
CREATE OR REPLACE FUNCTION set_gate_review_attempt()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_attempt INTEGER;
BEGIN
  SELECT COALESCE(MAX(attempt_number), 0) + 1 INTO v_attempt
  FROM project_gate_reviews
  WHERE project_id = NEW.project_id
    AND room_taxonomy_id = NEW.room_taxonomy_id
    AND phase = NEW.phase;

  NEW.attempt_number := v_attempt;
  NEW.label := NEW.phase || '_' || v_attempt;
  RETURN NEW;
END;
$$;

CREATE TRIGGER gate_review_attempt_trigger
  BEFORE INSERT ON project_gate_reviews
  FOR EACH ROW EXECUTE FUNCTION set_gate_review_attempt();

-- People the PDPM adds to one specific review, able to check items off
-- on that review only -- not a project-wide role.
CREATE TABLE gate_review_collaborators (
  id             SERIAL PRIMARY KEY,
  gate_review_id INTEGER     NOT NULL REFERENCES project_gate_reviews(id) ON DELETE CASCADE,
  user_email     TEXT        NOT NULL REFERENCES users(email),
  added_by       TEXT        NOT NULL REFERENCES users(email),
  added_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (gate_review_id, user_email)
);

CREATE INDEX idx_gate_review_collaborators_review ON gate_review_collaborators (gate_review_id);

-- Helper: can current user check items off on this specific review?
CREATE OR REPLACE FUNCTION can_edit_gate_review(p_gate_review_id INTEGER)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT is_admin()
    OR EXISTS (
      SELECT 1 FROM project_gate_reviews
      WHERE id = p_gate_review_id AND initiated_by = auth.jwt()->>'email'
    )
    OR EXISTS (
      SELECT 1 FROM gate_review_collaborators
      WHERE gate_review_id = p_gate_review_id AND user_email = auth.jwt()->>'email'
    );
$$;

ALTER TABLE project_gate_reviews    ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_review_collaborators ENABLE ROW LEVEL SECURITY;

-- GATE REVIEWS — project members read; only a PDPM (primary or backup) or admin initiates;
-- initiator, collaborators, or admin can update the checklist/complete it.
CREATE POLICY "member_read_gate_reviews" ON project_gate_reviews FOR SELECT TO authenticated
  USING (is_admin() OR is_project_member(project_id));
CREATE POLICY "pdpm_initiate_gate_review" ON project_gate_reviews FOR INSERT TO authenticated
  WITH CHECK ((is_admin() OR is_pdpm(project_id)) AND initiated_by = auth.jwt()->>'email');
CREATE POLICY "editors_update_gate_review" ON project_gate_reviews FOR UPDATE TO authenticated
  USING (can_edit_gate_review(id)) WITH CHECK (can_edit_gate_review(id));

-- GATE REVIEW COLLABORATORS — read by project members; only the review's own
-- initiator (or admin) can add collaborators to it.
CREATE POLICY "member_read_gate_review_collaborators" ON gate_review_collaborators FOR SELECT TO authenticated
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM project_gate_reviews gr
      WHERE gr.id = gate_review_id AND is_project_member(gr.project_id)
    )
  );
CREATE POLICY "initiator_add_gate_review_collaborator" ON gate_review_collaborators FOR INSERT TO authenticated
  WITH CHECK (
    added_by = auth.jwt()->>'email'
    AND (
      is_admin()
      OR EXISTS (
        SELECT 1 FROM project_gate_reviews gr
        WHERE gr.id = gate_review_id AND gr.initiated_by = auth.jwt()->>'email'
      )
    )
  );
