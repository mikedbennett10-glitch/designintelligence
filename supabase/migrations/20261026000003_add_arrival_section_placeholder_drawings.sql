-- ============================================================
-- Placeholder drawings for the rest of the Arrival section
-- ============================================================
-- Raster crops from the CommonSpirit Ambulatory Design Guidelines
-- (March 2026 edition), pp. 18-26 ("Arrival_Section.pdf"), wrapped in a
-- thin SVG per the dev-schematic convention (see 20261026000002).
--
-- AMB-CLINIC-WCOPY-001 (Arrival, Work/Copy) gets only fp + rcp here --
-- its page shows a single unlabeled "Elevation" with no compass direction
-- and no north arrow on its floorplan, and it isn't part of the Pause
-- Corridor's long N/S elevation strip (unlike Hello Center, which is
-- labeled "HELLO CENTER" on that strip's South Elevation, confirming
-- elev-s below). Direction TBD -- see conversation.

-- expected_drawing_types overrides, same rationale as 20261026000001:
-- none of these rooms' real documented view sets match axon_type's 3 buckets.
UPDATE rooms SET expected_drawing_types = ARRAY['fp','rcp','elev-s']
  WHERE taxonomy_id = 'AMB-CLINIC-ARR-002';
UPDATE rooms SET expected_drawing_types = ARRAY['fp','rcp','elev-n','elev-s']
  WHERE taxonomy_id = 'AMB-CLINIC-PAUSE-001';
UPDATE rooms SET expected_drawing_types = ARRAY['fp','rcp','elev-e','elev-s','elev-w']
  WHERE taxonomy_id = 'AMB-CLINIC-SUBWAIT-001';
-- AMB-CLINIC-WCOPY-001 left unset until its elevation direction is resolved.

INSERT INTO room_drawings
  (room_taxonomy_id, drawing_type, version, format, file_name, status, is_schematic)
VALUES
  ('AMB-CLINIC-ARR-002', 'fp',     'v0.1.0', 'svg', '/schematics/amb-clinic-arr-002--fp--v0.1.0.svg',     'pending', TRUE),
  ('AMB-CLINIC-ARR-002', 'rcp',    'v0.1.0', 'svg', '/schematics/amb-clinic-arr-002--rcp--v0.1.0.svg',    'pending', TRUE),
  ('AMB-CLINIC-ARR-002', 'elev-s', 'v0.1.0', 'svg', '/schematics/amb-clinic-arr-002--elev-s--v0.1.0.svg', 'pending', TRUE),

  ('AMB-CLINIC-PAUSE-001', 'fp',     'v0.1.0', 'svg', '/schematics/amb-clinic-pause-001--fp--v0.1.0.svg',     'pending', TRUE),
  ('AMB-CLINIC-PAUSE-001', 'rcp',    'v0.1.0', 'svg', '/schematics/amb-clinic-pause-001--rcp--v0.1.0.svg',    'pending', TRUE),
  ('AMB-CLINIC-PAUSE-001', 'elev-n', 'v0.1.0', 'svg', '/schematics/amb-clinic-pause-001--elev-n--v0.1.0.svg', 'pending', TRUE),
  ('AMB-CLINIC-PAUSE-001', 'elev-s', 'v0.1.0', 'svg', '/schematics/amb-clinic-pause-001--elev-s--v0.1.0.svg', 'pending', TRUE),

  ('AMB-CLINIC-SUBWAIT-001', 'fp',     'v0.1.0', 'svg', '/schematics/amb-clinic-subwait-001--fp--v0.1.0.svg',     'pending', TRUE),
  ('AMB-CLINIC-SUBWAIT-001', 'rcp',    'v0.1.0', 'svg', '/schematics/amb-clinic-subwait-001--rcp--v0.1.0.svg',    'pending', TRUE),
  ('AMB-CLINIC-SUBWAIT-001', 'elev-e', 'v0.1.0', 'svg', '/schematics/amb-clinic-subwait-001--elev-e--v0.1.0.svg', 'pending', TRUE),
  ('AMB-CLINIC-SUBWAIT-001', 'elev-s', 'v0.1.0', 'svg', '/schematics/amb-clinic-subwait-001--elev-s--v0.1.0.svg', 'pending', TRUE),
  ('AMB-CLINIC-SUBWAIT-001', 'elev-w', 'v0.1.0', 'svg', '/schematics/amb-clinic-subwait-001--elev-w--v0.1.0.svg', 'pending', TRUE),

  ('AMB-CLINIC-WCOPY-001', 'fp',  'v0.1.0', 'svg', '/schematics/amb-clinic-wcopy-001--fp--v0.1.0.svg',  'pending', TRUE),
  ('AMB-CLINIC-WCOPY-001', 'rcp', 'v0.1.0', 'svg', '/schematics/amb-clinic-wcopy-001--rcp--v0.1.0.svg', 'pending', TRUE);
