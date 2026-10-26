-- ============================================================
-- Placeholder drawings: PAR Storage, Lockers, POC Testing,
-- Procedure Rooms, Staff Lounge, Toilets, Zen Den
-- ============================================================
-- Raster crops from the CommonSpirit Ambulatory Design Guidelines
-- (March 2026 edition) -- "POC.pdf" (pp. 48-56), "Procedure.pdf"
-- (pp. 57-62), "Toilets.pdf" (pp. 63-69) -- wrapped in a thin SVG per
-- the dev-schematic convention (see 20261026000002).
--
-- "PAR Breakdown" (POC.pdf pp. 48-49) is NOT included here -- there's no
-- taxonomy row for it yet (same situation as Arrival/Patient Support and
-- Schedulers). Its crops are already filed under
-- public/schematics/amb-support-parbrk-001--*.svg (a proposed ID,
-- following the AMB-SUPPORT-PAR-001 naming convention) so they're ready
-- to wire up once the room exists -- see conversation.

UPDATE rooms SET expected_drawing_types = ARRAY['fp','rcp','elev-n','elev-s','elev-w']
  WHERE taxonomy_id = 'AMB-SUPPORT-PAR-001';
UPDATE rooms SET expected_drawing_types = ARRAY['fp','elev-n']
  WHERE taxonomy_id = 'AMB-SUPPORT-LOCK-001';
UPDATE rooms SET expected_drawing_types = ARRAY['fp','rcp','elev-n','elev-e','elev-s']
  WHERE taxonomy_id IN ('AMB-SUPPORT-POCT-001', 'AMB-SUPPORT-POCT-002');
UPDATE rooms SET expected_drawing_types = ARRAY['fp','rcp','elev-n','elev-e','elev-w']
  WHERE taxonomy_id IN ('AMB-ROOM-PROC-001', 'AMB-ROOM-PROC-002');
UPDATE rooms SET expected_drawing_types = ARRAY['fp','rcp','elev-n','elev-e','elev-s','elev-w']
  WHERE taxonomy_id IN ('AMB-SUPPORT-SL-001', 'AMB-TOILET-PT-001', 'AMB-TOILET-FT-001', 'AMB-TOILET-ST-001');
UPDATE rooms SET expected_drawing_types = ARRAY['fp','rcp']
  WHERE taxonomy_id = 'AMB-SUPPORT-ZEN-001';

INSERT INTO room_drawings
  (room_taxonomy_id, drawing_type, version, format, file_name, status, is_schematic)
VALUES
  ('AMB-SUPPORT-PAR-001', 'fp',     'v0.1.0', 'svg', '/schematics/amb-support-par-001--fp--v0.1.0.svg',     'pending', TRUE),
  ('AMB-SUPPORT-PAR-001', 'rcp',    'v0.1.0', 'svg', '/schematics/amb-support-par-001--rcp--v0.1.0.svg',    'pending', TRUE),
  ('AMB-SUPPORT-PAR-001', 'elev-n', 'v0.1.0', 'svg', '/schematics/amb-support-par-001--elev-n--v0.1.0.svg', 'pending', TRUE),
  ('AMB-SUPPORT-PAR-001', 'elev-s', 'v0.1.0', 'svg', '/schematics/amb-support-par-001--elev-s--v0.1.0.svg', 'pending', TRUE),
  ('AMB-SUPPORT-PAR-001', 'elev-w', 'v0.1.0', 'svg', '/schematics/amb-support-par-001--elev-w--v0.1.0.svg', 'pending', TRUE),

  ('AMB-SUPPORT-LOCK-001', 'fp',     'v0.1.0', 'svg', '/schematics/amb-support-lock-001--fp--v0.1.0.svg',     'pending', TRUE),
  ('AMB-SUPPORT-LOCK-001', 'elev-n', 'v0.1.0', 'svg', '/schematics/amb-support-lock-001--elev-n--v0.1.0.svg', 'pending', TRUE),

  ('AMB-SUPPORT-POCT-002', 'fp',     'v0.1.0', 'svg', '/schematics/amb-support-poct-002--fp--v0.1.0.svg',     'pending', TRUE),
  ('AMB-SUPPORT-POCT-002', 'rcp',    'v0.1.0', 'svg', '/schematics/amb-support-poct-002--rcp--v0.1.0.svg',    'pending', TRUE),
  ('AMB-SUPPORT-POCT-002', 'elev-n', 'v0.1.0', 'svg', '/schematics/amb-support-poct-002--elev-n--v0.1.0.svg', 'pending', TRUE),
  ('AMB-SUPPORT-POCT-002', 'elev-e', 'v0.1.0', 'svg', '/schematics/amb-support-poct-002--elev-e--v0.1.0.svg', 'pending', TRUE),
  ('AMB-SUPPORT-POCT-002', 'elev-s', 'v0.1.0', 'svg', '/schematics/amb-support-poct-002--elev-s--v0.1.0.svg', 'pending', TRUE),

  ('AMB-SUPPORT-POCT-001', 'fp',     'v0.1.0', 'svg', '/schematics/amb-support-poct-001--fp--v0.1.0.svg',     'pending', TRUE),
  ('AMB-SUPPORT-POCT-001', 'rcp',    'v0.1.0', 'svg', '/schematics/amb-support-poct-001--rcp--v0.1.0.svg',    'pending', TRUE),
  ('AMB-SUPPORT-POCT-001', 'elev-n', 'v0.1.0', 'svg', '/schematics/amb-support-poct-001--elev-n--v0.1.0.svg', 'pending', TRUE),
  ('AMB-SUPPORT-POCT-001', 'elev-e', 'v0.1.0', 'svg', '/schematics/amb-support-poct-001--elev-e--v0.1.0.svg', 'pending', TRUE),
  ('AMB-SUPPORT-POCT-001', 'elev-s', 'v0.1.0', 'svg', '/schematics/amb-support-poct-001--elev-s--v0.1.0.svg', 'pending', TRUE),

  ('AMB-ROOM-PROC-001', 'fp',     'v0.1.0', 'svg', '/schematics/amb-room-proc-001--fp--v0.1.0.svg',     'pending', TRUE),
  ('AMB-ROOM-PROC-001', 'rcp',    'v0.1.0', 'svg', '/schematics/amb-room-proc-001--rcp--v0.1.0.svg',    'pending', TRUE),
  ('AMB-ROOM-PROC-001', 'elev-n', 'v0.1.0', 'svg', '/schematics/amb-room-proc-001--elev-n--v0.1.0.svg', 'pending', TRUE),
  ('AMB-ROOM-PROC-001', 'elev-e', 'v0.1.0', 'svg', '/schematics/amb-room-proc-001--elev-e--v0.1.0.svg', 'pending', TRUE),
  ('AMB-ROOM-PROC-001', 'elev-w', 'v0.1.0', 'svg', '/schematics/amb-room-proc-001--elev-w--v0.1.0.svg', 'pending', TRUE),

  ('AMB-ROOM-PROC-002', 'fp',     'v0.1.0', 'svg', '/schematics/amb-room-proc-002--fp--v0.1.0.svg',     'pending', TRUE),
  ('AMB-ROOM-PROC-002', 'rcp',    'v0.1.0', 'svg', '/schematics/amb-room-proc-002--rcp--v0.1.0.svg',    'pending', TRUE),
  ('AMB-ROOM-PROC-002', 'elev-n', 'v0.1.0', 'svg', '/schematics/amb-room-proc-002--elev-n--v0.1.0.svg', 'pending', TRUE),
  ('AMB-ROOM-PROC-002', 'elev-e', 'v0.1.0', 'svg', '/schematics/amb-room-proc-002--elev-e--v0.1.0.svg', 'pending', TRUE),
  ('AMB-ROOM-PROC-002', 'elev-w', 'v0.1.0', 'svg', '/schematics/amb-room-proc-002--elev-w--v0.1.0.svg', 'pending', TRUE),

  ('AMB-SUPPORT-SL-001', 'fp',     'v0.1.0', 'svg', '/schematics/amb-support-sl-001--fp--v0.1.0.svg',     'pending', TRUE),
  ('AMB-SUPPORT-SL-001', 'rcp',    'v0.1.0', 'svg', '/schematics/amb-support-sl-001--rcp--v0.1.0.svg',    'pending', TRUE),
  ('AMB-SUPPORT-SL-001', 'elev-n', 'v0.1.0', 'svg', '/schematics/amb-support-sl-001--elev-n--v0.1.0.svg', 'pending', TRUE),
  ('AMB-SUPPORT-SL-001', 'elev-e', 'v0.1.0', 'svg', '/schematics/amb-support-sl-001--elev-e--v0.1.0.svg', 'pending', TRUE),
  ('AMB-SUPPORT-SL-001', 'elev-s', 'v0.1.0', 'svg', '/schematics/amb-support-sl-001--elev-s--v0.1.0.svg', 'pending', TRUE),
  ('AMB-SUPPORT-SL-001', 'elev-w', 'v0.1.0', 'svg', '/schematics/amb-support-sl-001--elev-w--v0.1.0.svg', 'pending', TRUE),

  ('AMB-TOILET-PT-001', 'fp',     'v0.1.0', 'svg', '/schematics/amb-toilet-pt-001--fp--v0.1.0.svg',     'pending', TRUE),
  ('AMB-TOILET-PT-001', 'rcp',    'v0.1.0', 'svg', '/schematics/amb-toilet-pt-001--rcp--v0.1.0.svg',    'pending', TRUE),
  ('AMB-TOILET-PT-001', 'elev-n', 'v0.1.0', 'svg', '/schematics/amb-toilet-pt-001--elev-n--v0.1.0.svg', 'pending', TRUE),
  ('AMB-TOILET-PT-001', 'elev-e', 'v0.1.0', 'svg', '/schematics/amb-toilet-pt-001--elev-e--v0.1.0.svg', 'pending', TRUE),
  ('AMB-TOILET-PT-001', 'elev-s', 'v0.1.0', 'svg', '/schematics/amb-toilet-pt-001--elev-s--v0.1.0.svg', 'pending', TRUE),
  ('AMB-TOILET-PT-001', 'elev-w', 'v0.1.0', 'svg', '/schematics/amb-toilet-pt-001--elev-w--v0.1.0.svg', 'pending', TRUE),

  ('AMB-TOILET-FT-001', 'fp',     'v0.1.0', 'svg', '/schematics/amb-toilet-ft-001--fp--v0.1.0.svg',     'pending', TRUE),
  ('AMB-TOILET-FT-001', 'rcp',    'v0.1.0', 'svg', '/schematics/amb-toilet-ft-001--rcp--v0.1.0.svg',    'pending', TRUE),
  ('AMB-TOILET-FT-001', 'elev-n', 'v0.1.0', 'svg', '/schematics/amb-toilet-ft-001--elev-n--v0.1.0.svg', 'pending', TRUE),
  ('AMB-TOILET-FT-001', 'elev-e', 'v0.1.0', 'svg', '/schematics/amb-toilet-ft-001--elev-e--v0.1.0.svg', 'pending', TRUE),
  ('AMB-TOILET-FT-001', 'elev-s', 'v0.1.0', 'svg', '/schematics/amb-toilet-ft-001--elev-s--v0.1.0.svg', 'pending', TRUE),
  ('AMB-TOILET-FT-001', 'elev-w', 'v0.1.0', 'svg', '/schematics/amb-toilet-ft-001--elev-w--v0.1.0.svg', 'pending', TRUE),

  ('AMB-TOILET-ST-001', 'fp',     'v0.1.0', 'svg', '/schematics/amb-toilet-st-001--fp--v0.1.0.svg',     'pending', TRUE),
  ('AMB-TOILET-ST-001', 'rcp',    'v0.1.0', 'svg', '/schematics/amb-toilet-st-001--rcp--v0.1.0.svg',    'pending', TRUE),
  ('AMB-TOILET-ST-001', 'elev-n', 'v0.1.0', 'svg', '/schematics/amb-toilet-st-001--elev-n--v0.1.0.svg', 'pending', TRUE),
  ('AMB-TOILET-ST-001', 'elev-e', 'v0.1.0', 'svg', '/schematics/amb-toilet-st-001--elev-e--v0.1.0.svg', 'pending', TRUE),
  ('AMB-TOILET-ST-001', 'elev-s', 'v0.1.0', 'svg', '/schematics/amb-toilet-st-001--elev-s--v0.1.0.svg', 'pending', TRUE),
  ('AMB-TOILET-ST-001', 'elev-w', 'v0.1.0', 'svg', '/schematics/amb-toilet-st-001--elev-w--v0.1.0.svg', 'pending', TRUE),

  ('AMB-SUPPORT-ZEN-001', 'fp',  'v0.1.0', 'svg', '/schematics/amb-support-zen-001--fp--v0.1.0.svg',  'pending', TRUE),
  ('AMB-SUPPORT-ZEN-001', 'rcp', 'v0.1.0', 'svg', '/schematics/amb-support-zen-001--rcp--v0.1.0.svg', 'pending', TRUE);
