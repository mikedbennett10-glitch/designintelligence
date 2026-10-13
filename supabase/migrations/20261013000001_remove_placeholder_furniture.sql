-- ============================================================
-- Remove placeholder SHR-FURN-* furniture, keep only the formulary
-- ============================================================
-- The furniture table had two batches: 4 placeholder SHR-FURN-* rows
-- from supabase/seed/003_example_room_content.sql (one, EXAMCHAIR-01,
-- later got a real vendor spec in 20260917000003/4), and the 54 real
-- AMB-FURN-* rows from the CommonSpirit+ Steelcase/OFS formulary
-- (20261012000001). Per request: drop the placeholders, keep only the
-- formulary.
--
-- Two of the four were linked via room_furniture (AMB-ROOM-EX-001 ->
-- EXAMCHAIR-01/STOOL-01; AMB-CLINIC-ARR-001 -> ARRIVALSEAT-01/
-- COUNTER-01) and have no ON DELETE CASCADE on furniture_id, so those
-- links are removed first. Both rooms end up with no furniture links
-- until real formulary items are linked to them -- a pre-existing open
-- item (see 20261012000001's note on room_furniture not yet being
-- populated for the formulary), not something new here.
--
-- The schematic SVG (public/schematics/AMB-ROOM-EX-001--fp.svg) had two
-- interactive hotspots pointing at EXAMCHAIR-01/STOOL-01; those were
-- stripped back to plain (non-interactive) shapes in the same commit as
-- this migration, so nothing in the app references these rows anymore
-- once this runs.

DELETE FROM room_furniture
WHERE furniture_id IN (
  SELECT id FROM furniture WHERE taxonomy_id LIKE 'SHR-FURN-%'
);

DELETE FROM furniture WHERE taxonomy_id LIKE 'SHR-FURN-%';
