-- ============================================================
-- WBS 3.5.1 — SVG element ID → room data lookup engine, first wiring
-- ============================================================
-- Points the existing AMB-ROOM-EX-001 floor-plan room_drawings row (seeded
-- pending/schematic in 003_example_room_content.sql) at a hand-built dev
-- schematic SVG, so the new hover/click lookup engine (src/lib/svgLookup.ts
-- + SvgHotspotViewer) has something real to resolve against.
--
-- file_name here holds a /public-relative path to a static SVG, not a
-- bare filename — there's no storage bucket wired up for room drawings
-- yet (unlike product-images/product-models), so for is_schematic rows
-- this is the interim convention: the app fetches file_name directly as
-- a same-origin static asset. Swap this out once real consultant-delivered
-- SVGs move to proper storage with versioned gcs_path values.
--
-- The schematic's data-taxonomy-id tags (SHR-EQUIP-EXAMTABLE-01,
-- SHR-EQUIP-OTOSCOPE-01, SHR-EQUIP-HANDHYG-01, SHR-FURN-EXAMCHAIR-01,
-- SHR-FURN-STOOL-01) match this room's real room_equipment/room_furniture
-- links already seeded — nothing invented here, just making the existing
-- links visible inside a drawing instead of only in the FFE tab.

UPDATE room_drawings
SET file_name = '/schematics/AMB-ROOM-EX-001--fp.svg',
    status = 'ready'
WHERE room_taxonomy_id = 'AMB-ROOM-EX-001'
  AND drawing_type = 'fp'
  AND format = 'svg'
  AND is_schematic = TRUE;
