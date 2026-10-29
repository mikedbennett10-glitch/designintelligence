-- ============================================================
-- Project names + self-service notification reads
-- ============================================================
-- Projects previously had no human-readable name, only the Procore
-- project number -- the Projects list needed one for its new
-- Project Number / Project Name / Project Type columns.
--
-- notifications was admin-only in both directions (it holds Gmail send
-- detail). The new header bell icon needs each signed-in user to read
-- (and mark read) just their own rows, so this adds narrow,
-- recipient-scoped policies alongside the existing admin-only one
-- rather than replacing it.

ALTER TABLE projects ADD COLUMN name TEXT;

ALTER TABLE notifications ADD COLUMN read_at TIMESTAMPTZ;

CREATE POLICY "user_read_own_notifications" ON notifications FOR SELECT TO authenticated
  USING (recipient_email = auth.jwt()->>'email');

CREATE POLICY "user_mark_own_notifications_read" ON notifications FOR UPDATE TO authenticated
  USING (recipient_email = auth.jwt()->>'email') WITH CHECK (recipient_email = auth.jwt()->>'email');
