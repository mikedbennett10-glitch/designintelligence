-- ============================================================
-- Notification infrastructure (Google Workspace / Gmail API)
-- ============================================================
-- Outbound notification queue + auto-enqueue triggers. Sending itself
-- happens app-side via the Gmail API (a Google Cloud service account
-- with domain-wide delegation, sending as a shared Workspace mailbox),
-- which requires IT approval and isn't configured yet — this migration
-- only builds the queue and the enqueue triggers, which work regardless
-- of whether sending is wired up. Until Gmail credentials exist, rows
-- just accumulate with status='pending' and an admin can see them at
-- /admin/notifications; nothing is lost waiting on approval.

CREATE TABLE notifications (
  id                 SERIAL PRIMARY KEY,
  notification_type  TEXT        NOT NULL CHECK (notification_type IN ('edition_change', 'deviation_decision')),
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
  sent_at            TIMESTAMPTZ
);

CREATE INDEX idx_notifications_status ON notifications (status);
CREATE INDEX idx_notifications_project ON notifications (project_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Admin-only in both directions: this holds recipient emails and
-- internal operational detail, not published content.
CREATE POLICY "admin_manage_notifications" ON notifications FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- Auto-enqueue: when a room change is captured (room_edition_snapshots
-- gets a row with a non-empty diff — see capture_room_edition_snapshot()
-- in the initial schema), notify every member of every project that (a)
-- has that room in scope, (b) is locked to an edition, and (c) whose
-- lock predates this change. Same non-DEFINER style as the existing
-- rooms_snapshot_trigger: room_edition_snapshots' own admin_write policy
-- already requires is_admin() to reach this trigger, so the same admin
-- role can always insert into notifications (also admin-only) without
-- needing SECURITY DEFINER.
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

CREATE TRIGGER edition_change_notify_trigger
  AFTER INSERT ON room_edition_snapshots
  FOR EACH ROW EXECUTE FUNCTION enqueue_edition_change_notifications();
