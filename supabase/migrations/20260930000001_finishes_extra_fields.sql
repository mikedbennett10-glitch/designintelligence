-- ============================================================
-- Finishes: legacy code, location, vendor contact
-- ============================================================
-- Extracting the real Ambulatory Design Guidelines finish schedule
-- (WBS 4.1) surfaced three fields on every vendor spec sheet that have
-- no home in the finishes table yet -- same situation as furniture's
-- dimensions/weight_capacity/location (20260917000004).
--
--   legacy_code    the "(formally LVT-1)" reference some finish codes
--                   carry from a prior edition's numbering
--   location       the sheet's general-applicability note (e.g. "Care
--                   team zone and out-of-flow corridors") -- distinct
--                   from the room_finishes junction table, which tracks
--                   actual per-room assignments within seeded rooms
--   vendor_contact  the manufacturer rep's email, when the sheet lists one

ALTER TABLE finishes
  ADD COLUMN legacy_code TEXT,
  ADD COLUMN location TEXT,
  ADD COLUMN vendor_contact TEXT;
