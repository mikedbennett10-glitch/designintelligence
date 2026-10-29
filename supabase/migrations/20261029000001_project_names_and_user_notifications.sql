-- ============================================================
-- Project names + self-service notification reads
-- ============================================================
-- Projects previously had no human-readable name, only the Procore
-- project number -- the Projects list needed one for its new
-- Project Number / Project Name / Project Type columns.
--
-- Also discovered mid-session that 20260915000001_notifications_infrastructure.sql
-- and 20261012000003_deviation_submitted_notifications.sql had never
-- actually landed in production (the `notifications` table didn't
-- exist at all) -- so this restates that full setup here, idempotently,
-- alongside the new self-service read/mark-read policies the header
-- notification bell needs. notifications was admin-only in both
-- directions before; this adds narrow, recipient-scoped policies
-- alongside the existing admin-only one rather than replacing it.
--
-- Written with IF NOT EXISTS / CREATE OR REPLACE / DROP ... IF EXISTS
-- throughout so it's safe to run more than once, and so one statement
-- erroring here doesn't take an already-landed statement down with it
-- if the SQL editor runs the whole paste as one transaction.

ALTER TABLE projects ADD COLUMN IF NOT EXISTS name TEXT;

CREATE TABLE IF NOT EXISTS notifications (
  id                 SERIAL PRIMARY KEY,
  notification_type  TEXT        NOT NULL CHECK (notification_type IN ('edition_change', 'deviation_decision', 'deviation_submitted')),
  project_id         INTEGER     REFERENCES projects(id),
  room_taxonomy_id   TEXT        REFERENCES rooms(taxonomy_id),
  snapshot_id        INTEGER     REFERENCES room_edition_snapshots(id),
  deviation_id       INTEGER     REFERENCES deviations(id),
  recipient_email    TEXT        NOT NULL,
  subject            TEXT        NOT NULL,
  body               TEXT        NOT NULL,
  status             TEXT        NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'sent', 'failed')),
  error_message      TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at            TIMESTAMPTZ,
  read_at            TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications (status);
CREATE INDEX IF NOT EXISTS idx_notifications_project ON notifications (project_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_manage_notifications" ON notifications;
CREATE POLICY "admin_manage_notifications" ON notifications FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "user_read_own_notifications" ON notifications;
CREATE POLICY "user_read_own_notifications" ON notifications FOR SELECT TO authenticated
  USING (recipient_email = auth.jwt()->>'email');

DROP POLICY IF EXISTS "user_mark_own_notifications_read" ON notifications;
CREATE POLICY "user_mark_own_notifications_read" ON notifications FOR UPDATE TO authenticated
  USING (recipient_email = auth.jwt()->>'email') WITH CHECK (recipient_email = auth.jwt()->>'email');

CREATE OR REPLACE FUNCTION enqueue_edition_change_notifications()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_room_name TEXT;
  v_new_edition_date DATE;
  r RECORD;
BEGIN
  IF NEW.changed_fields IS NULL OR array_length(NEW.changed_fields, 1) IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT name INTO v_room_name FROM rooms WHERE taxonomy_id = NEW.room_taxonomy_id;
  SELECT edition_date INTO v_new_edition_date FROM editions WHERE id = NEW.edition_id;

  FOR r IN
    SELECT p.id AS project_id, p.procore_project_number, pm.user_email
    FROM projects p
    JOIN editions locked_ed ON locked_ed.id = p.edition_lock_id
    JOIN project_members pm ON pm.project_id = p.id
    WHERE p.edition_lock_id IS NOT NULL
      AND p.room_types_in_scope @> ARRAY[NEW.room_taxonomy_id]
      AND v_new_edition_date > locked_ed.edition_date
  LOOP
    INSERT INTO notifications (notification_type, project_id, room_taxonomy_id, snapshot_id, recipient_email, subject, body)
    VALUES (
      'edition_change',
      r.project_id,
      NEW.room_taxonomy_id,
      NEW.id,
      r.user_email,
      format('%s changed — affects project %s', v_room_name, r.procore_project_number),
      format(
        E'The room "%s" changed in a newer edition than project %s''s locked edition.\n\nChanged fields: %s\n%s\n\nReview the change and decide whether to adopt it in your project.',
        v_room_name,
        r.procore_project_number,
        array_to_string(NEW.changed_fields, ', '),
        coalesce(NEW.change_summary, '')
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS edition_change_notify_trigger ON room_edition_snapshots;
CREATE TRIGGER edition_change_notify_trigger
  AFTER INSERT ON room_edition_snapshots
  FOR EACH ROW EXECUTE FUNCTION enqueue_edition_change_notifications();

CREATE OR REPLACE FUNCTION enqueue_deviation_submitted_notifications()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_room_name   TEXT;
  v_reference   TEXT;
  r             RECORD;
BEGIN
  SELECT name INTO v_room_name FROM rooms WHERE taxonomy_id = NEW.room_taxonomy_id;
  v_reference := 'DEV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEW.id::TEXT, 4, '0');

  FOR r IN SELECT email FROM users WHERE tier = 'administrative'
  LOOP
    INSERT INTO notifications (notification_type, project_id, room_taxonomy_id, deviation_id, recipient_email, subject, body)
    VALUES (
      'deviation_submitted',
      NEW.project_id,
      NEW.room_taxonomy_id,
      NEW.id,
      r.email,
      format('New deviation request %s — %s', v_reference, coalesce(v_room_name, NEW.room_taxonomy_id)),
      format(
        E'%s submitted a deviation request (%s) for %s (%s).\n\nStandard: %s\n\nProposed alternative: %s\n\nJustification: %s\n\nReview it at /admin/deviations.',
        NEW.submitted_by, v_reference, coalesce(v_room_name, NEW.room_taxonomy_id), NEW.room_taxonomy_id,
        NEW.standard_element, NEW.proposed_alternative, NEW.justification
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS deviation_submitted_notify_trigger ON deviations;
CREATE TRIGGER deviation_submitted_notify_trigger
  AFTER INSERT ON deviations
  FOR EACH ROW EXECUTE FUNCTION enqueue_deviation_submitted_notifications();
