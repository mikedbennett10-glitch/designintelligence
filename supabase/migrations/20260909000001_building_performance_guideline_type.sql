-- ============================================================
-- Add BUILDING_PERFORMANCE as a third guideline_type
-- ============================================================
-- Widens the two guideline_type CHECK constraints (editions, rooms) to
-- accept 'BUILDING_PERFORMANCE' alongside 'AMBULATORY' and 'ACUTE', so
-- the platform's third guideline track has the same table structure to
-- publish into. Infrastructure only — no editions, rooms, or seed data
-- are added for this type here; it starts empty, same as Acute did.

ALTER TABLE editions DROP CONSTRAINT editions_guideline_type_check;
ALTER TABLE editions ADD CONSTRAINT editions_guideline_type_check
  CHECK (guideline_type IN ('AMBULATORY','ACUTE','BUILDING_PERFORMANCE'));

ALTER TABLE rooms DROP CONSTRAINT rooms_guideline_type_check;
ALTER TABLE rooms ADD CONSTRAINT rooms_guideline_type_check
  CHECK (guideline_type IN ('AMBULATORY','ACUTE','BUILDING_PERFORMANCE'));
