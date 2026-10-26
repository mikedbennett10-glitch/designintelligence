-- ============================================================
-- Clear stale "Example content." MEP fields
-- ============================================================
-- AMB-CLINIC-ARR-001, AMB-SUPPORT-CM-001, and AMB-ROOM-EX-001 had
-- placeholder "Example content." text seeded across several MEP fields
-- each in 003_example_room_content.sql. 20261026000008 only overwrote
-- the MEP fields the guideline source actually covers for each room,
-- leaving the rest holding stale placeholder text that still rendered
-- in the MEP/Systems section. The source doesn't give real content for
-- these specific fields on these rooms, so they're cleared to NULL
-- instead of invented.

UPDATE rooms SET
  mep_power_data = NULL,
  mep_acoustic = NULL
  WHERE taxonomy_id = 'AMB-CLINIC-ARR-001';

UPDATE rooms SET
  mep_hvac = NULL,
  mep_power_data = NULL,
  mep_security = NULL
  WHERE taxonomy_id = 'AMB-SUPPORT-CM-001';

UPDATE rooms SET
  mep_lighting = NULL,
  mep_hvac = NULL,
  mep_power_data = NULL,
  mep_security = NULL,
  mep_av = NULL,
  mep_acoustic = NULL,
  mep_nurse_call = NULL
  WHERE taxonomy_id = 'AMB-ROOM-EX-001';
