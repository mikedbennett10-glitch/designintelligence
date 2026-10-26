-- ============================================================
-- Per-room override for which drawing types are "expected"
-- ============================================================
-- axon_type (WBS 3.2.1) buckets rooms into 3 fixed deliverable scopes, but
-- real rooms don't always fit: AMB-CLINIC-ARR-001 (Arrival / Check-in), for
-- example, has a floor plan, RCP, and 3 elevations (no north wall is drawn
-- -- the room is open on that side -- and no axon), which matches none of
-- axon_type's 3 buckets.
--
-- expected_drawing_types lets a room state its real view set explicitly.
-- When set, DrawingViewer uses it as-is instead of deriving from axon_type;
-- NULL keeps the existing axon_type-derived behavior (see
-- expectedDrawingTypes() in DrawingViewer.tsx). This is additive --
-- axon_type is untouched and still drives rooms that fit its 3 buckets.

ALTER TABLE rooms ADD COLUMN expected_drawing_types TEXT[]
  CHECK (expected_drawing_types <@ ARRAY['fp','rcp','elev-n','elev-s','elev-e','elev-w','axon','det']);

COMMENT ON COLUMN rooms.expected_drawing_types IS
  'Explicit override of this room''s expected drawing-type set, for rooms '
  'whose real documented views don''t fit one of axon_type''s 3 buckets. '
  'NULL falls back to the axon_type-derived set.';

UPDATE rooms
SET expected_drawing_types = ARRAY['fp','rcp','elev-s','elev-w','elev-e']
WHERE taxonomy_id = 'AMB-CLINIC-ARR-001';
