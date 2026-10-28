-- ============================================================
-- Content editor role
-- ============================================================
-- Lets an admin flag specific users (independent of their access tier,
-- which governs guideline *visibility*, not editing rights) to edit
-- room Overview fields, Decision Logic, and Intentional Omissions
-- directly in the app -- so content updates no longer have to go
-- through an admin running SQL by hand.
--
-- Deliberately a separate boolean rather than a 5th tier value: tier
-- decides what guideline content a user can see (internal/external/
-- admin); is_content_editor decides whether they can write to it.
-- An internal_standard staffer can be a content editor; an
-- external_review partner should not be, even though both are
-- plausible tier values independent of this flag.

ALTER TABLE users ADD COLUMN is_content_editor BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN users.is_content_editor IS
  'Grants write access to room Overview/Decision Logic/Intentional '
  'Omissions content, independent of tier. Administrative-tier users '
  'can always edit regardless of this flag.';

CREATE OR REPLACE FUNCTION is_content_editor()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE(
    (SELECT is_content_editor FROM users
       WHERE email = auth.jwt()->>'email' AND is_active = TRUE),
    FALSE
  );
$$;

-- Additive (permissive) policies alongside the existing admin-only ones --
-- a content editor who isn't an admin can update rooms' content fields
-- and manage Decision Logic / Intentional Omissions rows. Row-level only;
-- the server actions that call these as the signed-in user are the
-- column-level gate (they only ever write the specific Overview fields
-- the edit UI exposes, never e.g. taxonomy_id, zone, or is_published).
CREATE POLICY "content_editor_update_rooms" ON rooms FOR UPDATE TO authenticated
  USING (is_content_editor()) WITH CHECK (is_content_editor());

CREATE POLICY "content_editor_manage_decision_logic" ON room_decision_logic FOR ALL TO authenticated
  USING (is_content_editor()) WITH CHECK (is_content_editor());

CREATE POLICY "content_editor_manage_omissions" ON room_intentional_omissions FOR ALL TO authenticated
  USING (is_content_editor()) WITH CHECK (is_content_editor());
