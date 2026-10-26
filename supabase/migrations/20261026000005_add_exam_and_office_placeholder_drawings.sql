-- ============================================================
-- Placeholder drawings: Exam Rooms, IT/Comm, Mother's Room, Offices
-- ============================================================
-- Raster crops from the CommonSpirit Ambulatory Design Guidelines
-- (March 2026 edition), "Exam_Rooms.pdf" (pp. 36-47), wrapped in a thin
-- SVG per the dev-schematic convention (see 20261026000002).
--
-- AMB-ROOM-EX-001 (Exam Room, Typical 2-Door) already has a real
-- hand-built interactive fp schematic (see 20261012000002) and an empty
-- placeholder rcp row from the original seed (003_example_room_content) --
-- this migration adds only its rcp placeholder content and its 4
-- elevations, leaving the existing fp row untouched.
--
-- AMB-SUPPORT-MOM-001 (Mother's Room) gets only fp + rcp -- its page
-- shows one unlabeled "Elevation" with no compass direction, same
-- situation as AMB-CLINIC-WCOPY-001 in 20261026000003. Held back
-- pending that decision.

UPDATE rooms SET expected_drawing_types = ARRAY['fp','rcp','elev-n','elev-e','elev-s','elev-w']
  WHERE taxonomy_id IN ('AMB-ROOM-EX-001', 'AMB-ROOM-EX-002', 'AMB-ROOM-EX-003');
UPDATE rooms SET expected_drawing_types = ARRAY['fp','rcp']
  WHERE taxonomy_id IN ('AMB-SUPPORT-IT-001', 'AMB-SUPPORT-MOM-001',
                         'AMB-ROOM-OF-001', 'AMB-ROOM-OF-002', 'AMB-ROOM-OF-003', 'AMB-ROOM-OF-004');

INSERT INTO room_drawings
  (room_taxonomy_id, drawing_type, version, format, file_name, status, is_schematic)
VALUES
  ('AMB-ROOM-EX-001', 'rcp',    'v0.1.0', 'svg', '/schematics/amb-room-ex-001--rcp--v0.1.0.svg',    'pending', TRUE),
  ('AMB-ROOM-EX-001', 'elev-n', 'v0.1.0', 'svg', '/schematics/amb-room-ex-001--elev-n--v0.1.0.svg', 'pending', TRUE),
  ('AMB-ROOM-EX-001', 'elev-e', 'v0.1.0', 'svg', '/schematics/amb-room-ex-001--elev-e--v0.1.0.svg', 'pending', TRUE),
  ('AMB-ROOM-EX-001', 'elev-s', 'v0.1.0', 'svg', '/schematics/amb-room-ex-001--elev-s--v0.1.0.svg', 'pending', TRUE),
  ('AMB-ROOM-EX-001', 'elev-w', 'v0.1.0', 'svg', '/schematics/amb-room-ex-001--elev-w--v0.1.0.svg', 'pending', TRUE),

  ('AMB-ROOM-EX-002', 'fp',     'v0.1.0', 'svg', '/schematics/amb-room-ex-002--fp--v0.1.0.svg',     'pending', TRUE),
  ('AMB-ROOM-EX-002', 'rcp',    'v0.1.0', 'svg', '/schematics/amb-room-ex-002--rcp--v0.1.0.svg',    'pending', TRUE),
  ('AMB-ROOM-EX-002', 'elev-n', 'v0.1.0', 'svg', '/schematics/amb-room-ex-002--elev-n--v0.1.0.svg', 'pending', TRUE),
  ('AMB-ROOM-EX-002', 'elev-e', 'v0.1.0', 'svg', '/schematics/amb-room-ex-002--elev-e--v0.1.0.svg', 'pending', TRUE),
  ('AMB-ROOM-EX-002', 'elev-s', 'v0.1.0', 'svg', '/schematics/amb-room-ex-002--elev-s--v0.1.0.svg', 'pending', TRUE),
  ('AMB-ROOM-EX-002', 'elev-w', 'v0.1.0', 'svg', '/schematics/amb-room-ex-002--elev-w--v0.1.0.svg', 'pending', TRUE),

  ('AMB-ROOM-EX-003', 'fp',     'v0.1.0', 'svg', '/schematics/amb-room-ex-003--fp--v0.1.0.svg',     'pending', TRUE),
  ('AMB-ROOM-EX-003', 'rcp',    'v0.1.0', 'svg', '/schematics/amb-room-ex-003--rcp--v0.1.0.svg',    'pending', TRUE),
  ('AMB-ROOM-EX-003', 'elev-n', 'v0.1.0', 'svg', '/schematics/amb-room-ex-003--elev-n--v0.1.0.svg', 'pending', TRUE),
  ('AMB-ROOM-EX-003', 'elev-e', 'v0.1.0', 'svg', '/schematics/amb-room-ex-003--elev-e--v0.1.0.svg', 'pending', TRUE),
  ('AMB-ROOM-EX-003', 'elev-s', 'v0.1.0', 'svg', '/schematics/amb-room-ex-003--elev-s--v0.1.0.svg', 'pending', TRUE),
  ('AMB-ROOM-EX-003', 'elev-w', 'v0.1.0', 'svg', '/schematics/amb-room-ex-003--elev-w--v0.1.0.svg', 'pending', TRUE),

  ('AMB-SUPPORT-IT-001', 'fp',  'v0.1.0', 'svg', '/schematics/amb-support-it-001--fp--v0.1.0.svg',  'pending', TRUE),
  ('AMB-SUPPORT-IT-001', 'rcp', 'v0.1.0', 'svg', '/schematics/amb-support-it-001--rcp--v0.1.0.svg', 'pending', TRUE),

  ('AMB-SUPPORT-MOM-001', 'fp',  'v0.1.0', 'svg', '/schematics/amb-support-mom-001--fp--v0.1.0.svg',  'pending', TRUE),
  ('AMB-SUPPORT-MOM-001', 'rcp', 'v0.1.0', 'svg', '/schematics/amb-support-mom-001--rcp--v0.1.0.svg', 'pending', TRUE),

  ('AMB-ROOM-OF-001', 'fp',  'v0.1.0', 'svg', '/schematics/amb-room-of-001--fp--v0.1.0.svg',  'pending', TRUE),
  ('AMB-ROOM-OF-001', 'rcp', 'v0.1.0', 'svg', '/schematics/amb-room-of-001--rcp--v0.1.0.svg', 'pending', TRUE),

  ('AMB-ROOM-OF-002', 'fp',  'v0.1.0', 'svg', '/schematics/amb-room-of-002--fp--v0.1.0.svg',  'pending', TRUE),
  ('AMB-ROOM-OF-002', 'rcp', 'v0.1.0', 'svg', '/schematics/amb-room-of-002--rcp--v0.1.0.svg', 'pending', TRUE),

  ('AMB-ROOM-OF-003', 'fp',  'v0.1.0', 'svg', '/schematics/amb-room-of-003--fp--v0.1.0.svg',  'pending', TRUE),
  ('AMB-ROOM-OF-003', 'rcp', 'v0.1.0', 'svg', '/schematics/amb-room-of-003--rcp--v0.1.0.svg', 'pending', TRUE),

  ('AMB-ROOM-OF-004', 'fp',  'v0.1.0', 'svg', '/schematics/amb-room-of-004--fp--v0.1.0.svg',  'pending', TRUE),
  ('AMB-ROOM-OF-004', 'rcp', 'v0.1.0', 'svg', '/schematics/amb-room-of-004--rcp--v0.1.0.svg', 'pending', TRUE);
