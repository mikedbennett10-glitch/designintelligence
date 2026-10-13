-- ============================================================
-- Clear the draft formulary room_furniture links
-- ============================================================
-- Removes all 132 room_furniture rows inserted by the draft mapping in
-- 20261013000002 (and nothing else -- AMB-FURN-* items were only ever
-- linked by that migration, so this scopes cleanly by that fact rather
-- than needing to track exactly which rows came from it).
--
-- Replacing the automated first pass with a spreadsheet-based review:
-- see the companion workbook (CommonSpirit+ Furniture-Room Assignment)
-- for the actual room-by-room assignment, to be turned into a new
-- migration once filled in.

DELETE FROM room_furniture
WHERE furniture_id IN (
  SELECT id FROM furniture WHERE taxonomy_id LIKE 'AMB-FURN-%'
);
