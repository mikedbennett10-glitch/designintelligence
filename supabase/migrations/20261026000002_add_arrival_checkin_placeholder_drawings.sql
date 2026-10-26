-- ============================================================
-- Placeholder drawings for AMB-CLINIC-ARR-001 (Arrival / Check-in)
-- ============================================================
-- Raster crops from the CommonSpirit Ambulatory Design Guidelines
-- (March 2026 edition), pp. 16-17, wrapped in a thin SVG so they match
-- the existing dev-schematic convention (public/schematics/*.svg,
-- referenced by file_name on a room_drawings row with is_schematic=TRUE --
-- see DrawingViewer.tsx). These are placeholders standing in for real
-- consultant-delivered drawings, not production artwork -- hence
-- status='pending' and version='v0.1.0'. No north elevation or axon:
-- the room isn't documented with either (see the companion
-- expected_drawing_types override in 20261026000001).

INSERT INTO room_drawings
  (room_taxonomy_id, drawing_type, version, format, file_name, status, is_schematic)
VALUES
  ('AMB-CLINIC-ARR-001', 'fp',     'v0.1.0', 'svg', '/schematics/amb-clinic-arr-001--fp--v0.1.0.svg',     'pending', TRUE),
  ('AMB-CLINIC-ARR-001', 'rcp',    'v0.1.0', 'svg', '/schematics/amb-clinic-arr-001--rcp--v0.1.0.svg',    'pending', TRUE),
  ('AMB-CLINIC-ARR-001', 'elev-s', 'v0.1.0', 'svg', '/schematics/amb-clinic-arr-001--elev-s--v0.1.0.svg', 'pending', TRUE),
  ('AMB-CLINIC-ARR-001', 'elev-w', 'v0.1.0', 'svg', '/schematics/amb-clinic-arr-001--elev-w--v0.1.0.svg', 'pending', TRUE),
  ('AMB-CLINIC-ARR-001', 'elev-e', 'v0.1.0', 'svg', '/schematics/amb-clinic-arr-001--elev-e--v0.1.0.svg', 'pending', TRUE);
