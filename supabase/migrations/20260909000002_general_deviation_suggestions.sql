-- ============================================================
-- Allow deviation suggestions outside of a specific project
-- ============================================================
-- Until now, every deviation request was tied to a project
-- (project_id NOT NULL) — appropriate for a formal project deviation,
-- but there was no way to suggest a change to a standard while just
-- browsing the current edition of a guideline. This widens the same
-- table/workflow to support that: project_id becomes nullable, and a
-- NULL project_id means "a general suggestion against the current
-- edition," reviewed by admins the same way as a project deviation.

ALTER TABLE deviations ALTER COLUMN project_id DROP NOT NULL;

DROP POLICY "member_submit_deviation" ON deviations;
CREATE POLICY "member_submit_deviation" ON deviations FOR INSERT TO authenticated
  WITH CHECK (
    (project_id IS NULL OR is_project_member(project_id))
    AND submitted_by = auth.jwt()->>'email'
  );

DROP POLICY "member_read_deviations" ON deviations;
CREATE POLICY "member_read_deviations" ON deviations FOR SELECT TO authenticated
  USING (
    is_admin()
    OR is_project_member(project_id)
    OR submitted_by = auth.jwt()->>'email'
  );
