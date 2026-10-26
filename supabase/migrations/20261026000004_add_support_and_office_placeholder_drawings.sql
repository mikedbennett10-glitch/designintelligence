-- ============================================================
-- Placeholder drawings: Business Hub, Clean/Meds, Conference Room,
-- Consult Rooms, EVS Closet
-- ============================================================
-- Raster crops from the CommonSpirit Ambulatory Design Guidelines
-- (March 2026 edition), "Other.pdf" (pp. 27-35), wrapped in a thin SVG
-- per the dev-schematic convention (see 20261026000002). All 6 rooms
-- matched existing taxonomy rows directly -- no new rooms or zone
-- conflicts this batch.
--
-- AMB-ROOM-CO-001 (Conference Room) is the first room whose documented
-- view set actually matches an axon_type bucket exactly (1: FP+RCP+4
-- elevations+axon) -- expected_drawing_types is still set explicitly here
-- for consistency with how every other room in this series is handled,
-- rather than relying on axon_type (which remains NULL/unclassified).

UPDATE rooms SET expected_drawing_types = ARRAY['fp','elev-s']
  WHERE taxonomy_id = 'AMB-SUPPORT-BH-001';
UPDATE rooms SET expected_drawing_types = ARRAY['fp','rcp','elev-n','elev-e','elev-s','elev-w']
  WHERE taxonomy_id = 'AMB-SUPPORT-CM-001';
UPDATE rooms SET expected_drawing_types = ARRAY['fp','rcp','elev-n','elev-e','elev-s','elev-w','axon']
  WHERE taxonomy_id = 'AMB-ROOM-CO-001';
UPDATE rooms SET expected_drawing_types = ARRAY['fp','rcp']
  WHERE taxonomy_id = 'AMB-ROOM-CN-001';
UPDATE rooms SET expected_drawing_types = ARRAY['fp','rcp']
  WHERE taxonomy_id = 'AMB-ROOM-CN-002';
UPDATE rooms SET expected_drawing_types = ARRAY['fp','rcp','elev-n','elev-e','elev-s','elev-w']
  WHERE taxonomy_id = 'AMB-SUPPORT-EV-001';

INSERT INTO room_drawings
  (room_taxonomy_id, drawing_type, version, format, file_name, status, is_schematic)
VALUES
  ('AMB-SUPPORT-BH-001', 'fp',     'v0.1.0', 'svg', '/schematics/amb-support-bh-001--fp--v0.1.0.svg',     'pending', TRUE),
  ('AMB-SUPPORT-BH-001', 'elev-s', 'v0.1.0', 'svg', '/schematics/amb-support-bh-001--elev-s--v0.1.0.svg', 'pending', TRUE),

  ('AMB-SUPPORT-CM-001', 'fp',     'v0.1.0', 'svg', '/schematics/amb-support-cm-001--fp--v0.1.0.svg',     'pending', TRUE),
  ('AMB-SUPPORT-CM-001', 'rcp',    'v0.1.0', 'svg', '/schematics/amb-support-cm-001--rcp--v0.1.0.svg',    'pending', TRUE),
  ('AMB-SUPPORT-CM-001', 'elev-n', 'v0.1.0', 'svg', '/schematics/amb-support-cm-001--elev-n--v0.1.0.svg', 'pending', TRUE),
  ('AMB-SUPPORT-CM-001', 'elev-e', 'v0.1.0', 'svg', '/schematics/amb-support-cm-001--elev-e--v0.1.0.svg', 'pending', TRUE),
  ('AMB-SUPPORT-CM-001', 'elev-s', 'v0.1.0', 'svg', '/schematics/amb-support-cm-001--elev-s--v0.1.0.svg', 'pending', TRUE),
  ('AMB-SUPPORT-CM-001', 'elev-w', 'v0.1.0', 'svg', '/schematics/amb-support-cm-001--elev-w--v0.1.0.svg', 'pending', TRUE),

  ('AMB-ROOM-CO-001', 'fp',     'v0.1.0', 'svg', '/schematics/amb-room-co-001--fp--v0.1.0.svg',     'pending', TRUE),
  ('AMB-ROOM-CO-001', 'rcp',    'v0.1.0', 'svg', '/schematics/amb-room-co-001--rcp--v0.1.0.svg',    'pending', TRUE),
  ('AMB-ROOM-CO-001', 'axon',   'v0.1.0', 'svg', '/schematics/amb-room-co-001--axon--v0.1.0.svg',   'pending', TRUE),
  ('AMB-ROOM-CO-001', 'elev-n', 'v0.1.0', 'svg', '/schematics/amb-room-co-001--elev-n--v0.1.0.svg', 'pending', TRUE),
  ('AMB-ROOM-CO-001', 'elev-e', 'v0.1.0', 'svg', '/schematics/amb-room-co-001--elev-e--v0.1.0.svg', 'pending', TRUE),
  ('AMB-ROOM-CO-001', 'elev-s', 'v0.1.0', 'svg', '/schematics/amb-room-co-001--elev-s--v0.1.0.svg', 'pending', TRUE),
  ('AMB-ROOM-CO-001', 'elev-w', 'v0.1.0', 'svg', '/schematics/amb-room-co-001--elev-w--v0.1.0.svg', 'pending', TRUE),

  ('AMB-ROOM-CN-001', 'fp',  'v0.1.0', 'svg', '/schematics/amb-room-cn-001--fp--v0.1.0.svg',  'pending', TRUE),
  ('AMB-ROOM-CN-001', 'rcp', 'v0.1.0', 'svg', '/schematics/amb-room-cn-001--rcp--v0.1.0.svg', 'pending', TRUE),

  ('AMB-ROOM-CN-002', 'fp',  'v0.1.0', 'svg', '/schematics/amb-room-cn-002--fp--v0.1.0.svg',  'pending', TRUE),
  ('AMB-ROOM-CN-002', 'rcp', 'v0.1.0', 'svg', '/schematics/amb-room-cn-002--rcp--v0.1.0.svg', 'pending', TRUE),

  ('AMB-SUPPORT-EV-001', 'fp',     'v0.1.0', 'svg', '/schematics/amb-support-ev-001--fp--v0.1.0.svg',     'pending', TRUE),
  ('AMB-SUPPORT-EV-001', 'rcp',    'v0.1.0', 'svg', '/schematics/amb-support-ev-001--rcp--v0.1.0.svg',    'pending', TRUE),
  ('AMB-SUPPORT-EV-001', 'elev-n', 'v0.1.0', 'svg', '/schematics/amb-support-ev-001--elev-n--v0.1.0.svg', 'pending', TRUE),
  ('AMB-SUPPORT-EV-001', 'elev-e', 'v0.1.0', 'svg', '/schematics/amb-support-ev-001--elev-e--v0.1.0.svg', 'pending', TRUE),
  ('AMB-SUPPORT-EV-001', 'elev-s', 'v0.1.0', 'svg', '/schematics/amb-support-ev-001--elev-s--v0.1.0.svg', 'pending', TRUE),
  ('AMB-SUPPORT-EV-001', 'elev-w', 'v0.1.0', 'svg', '/schematics/amb-support-ev-001--elev-w--v0.1.0.svg', 'pending', TRUE);
