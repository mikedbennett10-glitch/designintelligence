-- ============================================================
-- Deviation requests: notify admins on submission (WBS 7.2.1 / 7.2.3)
-- ============================================================
-- The submission confirmation message in DeviationRequestForm already
-- promises "The Platform Owner has been notified" (see
-- src/app/(guidelines)/projects/[id]/deviations/new/actions.ts), but
-- nothing actually enqueued that notification -- only the *decision*
-- outcome notified the requester (enqueueDeviationDecisionNotification).
-- A new pending request only ever surfaced if an admin happened to
-- check /admin/deviations. This closes that gap.
--
-- 1. Adds 'deviation_submitted' to the notifications type list.
-- 2. Adds a trigger that, on every new deviations row, notifies every
--    tier='administrative' user.
--
-- Unlike enqueue_edition_change_notifications (which fires from an
-- admin-only insert path and so doesn't need elevated rights), a
-- deviation INSERT happens from an ordinary signed-in user's own
-- session via the member_submit_deviation policy -- that caller can't
-- read other users' rows (read_own_user) or insert into notifications
-- (admin-only) under their own RLS. So this trigger DOES need
-- SECURITY DEFINER to look up admin emails and enqueue on the
-- submitter's behalf. Kept narrow on purpose: fixed search_path, no
-- caller-supplied SQL, reads only tier/email off `users`, writes only
-- `notifications`.

ALTER TABLE notifications DROP CONSTRAINT notifications_notification_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_notification_type_check
  CHECK (notification_type IN ('edition_change', 'deviation_decision', 'deviation_submitted'));

CREATE OR REPLACE FUNCTION enqueue_deviation_submitted_notifications()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_room_name   TEXT;
  v_reference   TEXT;
  r             RECORD;
BEGIN
  SELECT name INTO v_room_name FROM rooms WHERE taxonomy_id = NEW.room_taxonomy_id;
  -- NEW.reference_number is still NULL here -- set_deviation_reference()
  -- is a sibling AFTER INSERT trigger that UPDATEs the row rather than
  -- mutating NEW, so this computes the same value independently.
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

CREATE TRIGGER deviation_submitted_notify_trigger
  AFTER INSERT ON deviations
  FOR EACH ROW EXECUTE FUNCTION enqueue_deviation_submitted_notifications();
