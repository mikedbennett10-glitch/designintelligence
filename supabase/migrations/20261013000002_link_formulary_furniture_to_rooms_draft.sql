-- ============================================================
-- DRAFT: link CommonSpirit+ formulary furniture to rooms
-- ============================================================
-- A first-pass room_furniture mapping for the 54 formulary items
-- (20261012000001), generated from each item's `location` field against
-- the real 35-room Ambulatory taxonomy (002_rooms_ambulatory.sql seed).
-- This is explicitly a DRAFT for review, not a confirmed assignment --
-- see the confidence notes below before running it. quantity is set to
-- 1 everywhere as a placeholder; real per-room quantities (e.g. how
-- many lobby chairs) depend on project/clinic size, which the formulary
-- doesn't specify.
--
-- Easy to undo: this only touches room_furniture (a simple join table
-- nothing else references), so rolling back is one statement:
--   DELETE FROM room_furniture WHERE notes IS NULL
--     AND furniture_id IN (SELECT id FROM furniture WHERE taxonomy_id LIKE 'AMB-FURN-%');
-- (safe as long as nothing else has since added a real room_furniture
-- row with notes IS NULL for a formulary item -- scope the DELETE more
-- tightly if that's no longer true by the time you'd roll back).
--
-- HIGH CONFIDENCE (33 items) -- location maps cleanly onto one or more
-- real rooms: all Exam/Procedure-room items (ER2-5, ER7) go to all 5
-- exam/procedure rooms (that's the point of a "typical" furniture
-- standard); Conference Room items go to AMB-ROOM-CO-001; Staff Lounge
-- items (SS10) go to AMB-SUPPORT-SL-001; Arrival Pause/Subwait items go
-- to AMB-CLINIC-PAUSE-001 / AMB-CLINIC-SUBWAIT-001; Consult Room items
-- go to both consult rooms; SS18 (Behavioral Health) and SS19 (Office
-- Manager) match an exact room by name.
--
-- MEDIUM CONFIDENCE / FLAGGED ASSUMPTIONS (19 items) -- the formulary's
-- location text doesn't map 1:1 onto a room name, so a judgment call
-- was made. Each is commented inline below at its INSERT. Summary:
--   - "Staff Breakroom" (SS4, SS5, SS6, SS12) mapped to Staff Lounge
--     (AMB-SUPPORT-SL-001), NOT Breakdown Room (AMB-SUPPORT-BRKDN-001)
--     -- different kind of space (cart/supply breakdown vs. staff
--     amenity). Worth confirming the terminology.
--   - "Care Team Zone" (SS15, AC2, AC3) and "Workstations" (SS16, SS17)
--     mapped to Business Hub (AMB-SUPPORT-BH-001) and/or Schedulers
--     (AMB-CLINIC-SCHED-001) -- no room by either exact name exists.
--   - "Offices, where applicable" (SS3, AC2, AC3) mapped to all 4
--     office types; may be narrower in practice (e.g. only Director/
--     Manager offices that receive guests).
--   - "Entry Vestibule" (WL1) has no matching room; Arrival/Check-in
--     (AMB-CLINIC-ARR-001) used as the closest proxy.
--   - "GME Admin/Huddle" (WL8, WL9), "Infusion Bays" (ER7), and "Staff
--     Multipurpose Rooms" (ER8) have no matching room in the current
--     taxonomy at all -- that part of each item's location is simply
--     dropped rather than guessed; the rest of each item's location
--     (Arrival Pause/Subwait, Exam/Procedure, Consult) is still linked.
--
-- NOT MAPPED (2 items) -- TC1, TC2 (task chair options): location is
-- just "General Use", too generic to assign to a specific room.

INSERT INTO room_furniture (room_taxonomy_id, furniture_id, quantity, notes, sort_order)
  SELECT 'AMB-ROOM-CO-001', id, 1, NULL, 10 FROM furniture WHERE taxonomy_id = 'AMB-FURN-AC1'
  UNION ALL
  SELECT 'AMB-ROOM-EX-001', id, 1, NULL, 10 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER2'
  UNION ALL
  SELECT 'AMB-ROOM-EX-002', id, 1, NULL, 10 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER2'
  UNION ALL
  SELECT 'AMB-ROOM-EX-003', id, 1, NULL, 10 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER2'
  UNION ALL
  SELECT 'AMB-ROOM-PROC-001', id, 1, NULL, 10 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER2'
  UNION ALL
  SELECT 'AMB-ROOM-PROC-002', id, 1, NULL, 10 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER2'
  UNION ALL
  SELECT 'AMB-ROOM-EX-001', id, 1, NULL, 20 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER3'
  UNION ALL
  SELECT 'AMB-ROOM-EX-002', id, 1, NULL, 20 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER3'
  UNION ALL
  SELECT 'AMB-ROOM-EX-003', id, 1, NULL, 20 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER3'
  UNION ALL
  SELECT 'AMB-ROOM-PROC-001', id, 1, NULL, 20 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER3'
  UNION ALL
  SELECT 'AMB-ROOM-PROC-002', id, 1, NULL, 20 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER3'
  UNION ALL
  SELECT 'AMB-ROOM-EX-001', id, 1, NULL, 30 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER4'
  UNION ALL
  SELECT 'AMB-ROOM-EX-002', id, 1, NULL, 30 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER4'
  UNION ALL
  SELECT 'AMB-ROOM-EX-003', id, 1, NULL, 30 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER4'
  UNION ALL
  SELECT 'AMB-ROOM-PROC-001', id, 1, NULL, 30 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER4'
  UNION ALL
  SELECT 'AMB-ROOM-PROC-002', id, 1, NULL, 30 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER4'
  UNION ALL
  SELECT 'AMB-ROOM-EX-001', id, 1, NULL, 40 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER5'
  UNION ALL
  SELECT 'AMB-ROOM-EX-002', id, 1, NULL, 40 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER5'
  UNION ALL
  SELECT 'AMB-ROOM-EX-003', id, 1, NULL, 40 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER5'
  UNION ALL
  SELECT 'AMB-ROOM-PROC-001', id, 1, NULL, 40 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER5'
  UNION ALL
  SELECT 'AMB-ROOM-PROC-002', id, 1, NULL, 40 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER5'
  UNION ALL
  -- ER7: "Infusion Bays" part dropped (no such room exists)
  SELECT 'AMB-ROOM-EX-001', id, 1, NULL, 50 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER7'
  UNION ALL
  SELECT 'AMB-ROOM-EX-002', id, 1, NULL, 50 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER7'
  UNION ALL
  SELECT 'AMB-ROOM-EX-003', id, 1, NULL, 50 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER7'
  UNION ALL
  SELECT 'AMB-ROOM-PROC-001', id, 1, NULL, 50 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER7'
  UNION ALL
  SELECT 'AMB-ROOM-PROC-002', id, 1, NULL, 50 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER7'
  UNION ALL
  -- ER8: "Staff Multipurpose Rooms" part dropped (no such room exists)
  SELECT 'AMB-ROOM-EX-001', id, 1, NULL, 60 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER8'
  UNION ALL
  SELECT 'AMB-ROOM-EX-002', id, 1, NULL, 60 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER8'
  UNION ALL
  SELECT 'AMB-ROOM-EX-003', id, 1, NULL, 60 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER8'
  UNION ALL
  SELECT 'AMB-ROOM-PROC-001', id, 1, NULL, 60 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER8'
  UNION ALL
  SELECT 'AMB-ROOM-PROC-002', id, 1, NULL, 60 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER8'
  UNION ALL
  SELECT 'AMB-ROOM-CN-001', id, 1, NULL, 10 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER8'
  UNION ALL
  SELECT 'AMB-ROOM-CN-002', id, 1, NULL, 10 FROM furniture WHERE taxonomy_id = 'AMB-FURN-ER8'
  UNION ALL
  -- SS3: "Offices, where applicable" mapped to all 4 office types
  SELECT 'AMB-ROOM-OF-001', id, 1, NULL, 10 FROM furniture WHERE taxonomy_id = 'AMB-FURN-SS3'
  UNION ALL
  SELECT 'AMB-ROOM-OF-002', id, 1, NULL, 10 FROM furniture WHERE taxonomy_id = 'AMB-FURN-SS3'
  UNION ALL
  SELECT 'AMB-ROOM-OF-003', id, 1, NULL, 10 FROM furniture WHERE taxonomy_id = 'AMB-FURN-SS3'
  UNION ALL
  SELECT 'AMB-ROOM-OF-004', id, 1, NULL, 10 FROM furniture WHERE taxonomy_id = 'AMB-FURN-SS3'
  UNION ALL
  -- SS4: "Staff Breakroom" mapped to Staff Lounge, not Breakdown Room
  SELECT 'AMB-SUPPORT-SL-001', id, 1, NULL, 10 FROM furniture WHERE taxonomy_id = 'AMB-FURN-SS4'
  UNION ALL
  SELECT 'AMB-CLINIC-PAUSE-001', id, 1, NULL, 10 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL21'
  UNION ALL
  SELECT 'AMB-CLINIC-SUBWAIT-001', id, 1, NULL, 10 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL21'
  UNION ALL
  SELECT 'AMB-ROOM-CO-001', id, 1, NULL, 20 FROM furniture WHERE taxonomy_id = 'AMB-FURN-SS7'
  UNION ALL
  SELECT 'AMB-ROOM-CO-001', id, 1, NULL, 30 FROM furniture WHERE taxonomy_id = 'AMB-FURN-SS8'
  UNION ALL
  SELECT 'AMB-ROOM-CO-001', id, 1, NULL, 40 FROM furniture WHERE taxonomy_id = 'AMB-FURN-SS9'
  UNION ALL
  SELECT 'AMB-SUPPORT-SL-001', id, 1, NULL, 20 FROM furniture WHERE taxonomy_id = 'AMB-FURN-SS10'
  UNION ALL
  -- WL23: "Consult, Admin Office" mapped to Consult rooms + Director/Manager offices
  SELECT 'AMB-ROOM-CN-001', id, 1, NULL, 20 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL23'
  UNION ALL
  SELECT 'AMB-ROOM-CN-002', id, 1, NULL, 20 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL23'
  UNION ALL
  SELECT 'AMB-ROOM-OF-003', id, 1, NULL, 20 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL23'
  UNION ALL
  SELECT 'AMB-ROOM-OF-004', id, 1, NULL, 20 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL23'
  UNION ALL
  -- SS11: "Staff Admin" part mapped to Business Hub
  SELECT 'AMB-SUPPORT-SL-001', id, 1, NULL, 30 FROM furniture WHERE taxonomy_id = 'AMB-FURN-SS11'
  UNION ALL
  SELECT 'AMB-SUPPORT-BH-001', id, 1, NULL, 10 FROM furniture WHERE taxonomy_id = 'AMB-FURN-SS11'
  UNION ALL
  SELECT 'AMB-ROOM-CO-001', id, 1, NULL, 50 FROM furniture WHERE taxonomy_id = 'AMB-FURN-SS11'
  UNION ALL
  SELECT 'AMB-ROOM-CO-001', id, 1, NULL, 60 FROM furniture WHERE taxonomy_id = 'AMB-FURN-SS14'
  UNION ALL
  SELECT 'AMB-CLINIC-PAUSE-001', id, 1, NULL, 20 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL24'
  UNION ALL
  SELECT 'AMB-CLINIC-SUBWAIT-001', id, 1, NULL, 20 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL24'
  UNION ALL
  SELECT 'AMB-CLINIC-PAUSE-001', id, 1, NULL, 30 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL25'
  UNION ALL
  SELECT 'AMB-CLINIC-SUBWAIT-001', id, 1, NULL, 30 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL25'
  UNION ALL
  SELECT 'AMB-ROOM-CN-001', id, 1, NULL, 30 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL25'
  UNION ALL
  SELECT 'AMB-ROOM-CN-002', id, 1, NULL, 30 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL25'
  UNION ALL
  -- WL26: "Waiting/Lobby" (no room by that exact name) mapped to Arrival/Subwait + Consult
  SELECT 'AMB-CLINIC-PAUSE-001', id, 1, NULL, 40 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL26'
  UNION ALL
  SELECT 'AMB-CLINIC-SUBWAIT-001', id, 1, NULL, 40 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL26'
  UNION ALL
  SELECT 'AMB-ROOM-CN-001', id, 1, NULL, 40 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL26'
  UNION ALL
  SELECT 'AMB-ROOM-CN-002', id, 1, NULL, 40 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL26'
  UNION ALL
  -- SS15: "Care Team Zone" (no exact room) mapped to Business Hub
  SELECT 'AMB-SUPPORT-BH-001', id, 1, NULL, 20 FROM furniture WHERE taxonomy_id = 'AMB-FURN-SS15'
  UNION ALL
  -- SS16/SS17: "Workstations" mapped to Business Hub + Schedulers
  SELECT 'AMB-SUPPORT-BH-001', id, 1, NULL, 30 FROM furniture WHERE taxonomy_id = 'AMB-FURN-SS16'
  UNION ALL
  SELECT 'AMB-CLINIC-SCHED-001', id, 1, NULL, 10 FROM furniture WHERE taxonomy_id = 'AMB-FURN-SS16'
  UNION ALL
  SELECT 'AMB-SUPPORT-BH-001', id, 1, NULL, 40 FROM furniture WHERE taxonomy_id = 'AMB-FURN-SS17'
  UNION ALL
  SELECT 'AMB-CLINIC-SCHED-001', id, 1, NULL, 20 FROM furniture WHERE taxonomy_id = 'AMB-FURN-SS17'
  UNION ALL
  SELECT 'AMB-ROOM-CN-002', id, 1, NULL, 50 FROM furniture WHERE taxonomy_id = 'AMB-FURN-SS18'
  UNION ALL
  SELECT 'AMB-ROOM-OF-004', id, 1, NULL, 30 FROM furniture WHERE taxonomy_id = 'AMB-FURN-SS19'
  UNION ALL
  -- AC2/AC3: "Care Team Zone" -> Business Hub, "Offices" -> all 4 office types
  SELECT 'AMB-ROOM-CO-001', id, 1, NULL, 70 FROM furniture WHERE taxonomy_id = 'AMB-FURN-AC2'
  UNION ALL
  SELECT 'AMB-SUPPORT-BH-001', id, 1, NULL, 50 FROM furniture WHERE taxonomy_id = 'AMB-FURN-AC2'
  UNION ALL
  SELECT 'AMB-ROOM-OF-001', id, 1, NULL, 20 FROM furniture WHERE taxonomy_id = 'AMB-FURN-AC2'
  UNION ALL
  SELECT 'AMB-ROOM-OF-002', id, 1, NULL, 20 FROM furniture WHERE taxonomy_id = 'AMB-FURN-AC2'
  UNION ALL
  SELECT 'AMB-ROOM-OF-003', id, 1, NULL, 30 FROM furniture WHERE taxonomy_id = 'AMB-FURN-AC2'
  UNION ALL
  SELECT 'AMB-ROOM-OF-004', id, 1, NULL, 40 FROM furniture WHERE taxonomy_id = 'AMB-FURN-AC2'
  UNION ALL
  SELECT 'AMB-ROOM-CO-001', id, 1, NULL, 80 FROM furniture WHERE taxonomy_id = 'AMB-FURN-AC3'
  UNION ALL
  SELECT 'AMB-SUPPORT-BH-001', id, 1, NULL, 60 FROM furniture WHERE taxonomy_id = 'AMB-FURN-AC3'
  UNION ALL
  SELECT 'AMB-ROOM-OF-001', id, 1, NULL, 30 FROM furniture WHERE taxonomy_id = 'AMB-FURN-AC3'
  UNION ALL
  SELECT 'AMB-ROOM-OF-002', id, 1, NULL, 30 FROM furniture WHERE taxonomy_id = 'AMB-FURN-AC3'
  UNION ALL
  SELECT 'AMB-ROOM-OF-003', id, 1, NULL, 40 FROM furniture WHERE taxonomy_id = 'AMB-FURN-AC3'
  UNION ALL
  SELECT 'AMB-ROOM-OF-004', id, 1, NULL, 50 FROM furniture WHERE taxonomy_id = 'AMB-FURN-AC3'
  UNION ALL
  -- WL1: "Entry Vestibule" (no exact room) mapped to Arrival/Check-in
  SELECT 'AMB-CLINIC-ARR-001', id, 1, NULL, 10 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL1'
  UNION ALL
  SELECT 'AMB-CLINIC-PAUSE-001', id, 1, NULL, 50 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL1'
  UNION ALL
  SELECT 'AMB-CLINIC-SUBWAIT-001', id, 1, NULL, 50 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL1'
  UNION ALL
  SELECT 'AMB-CLINIC-PAUSE-001', id, 1, NULL, 60 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL2'
  UNION ALL
  SELECT 'AMB-CLINIC-SUBWAIT-001', id, 1, NULL, 60 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL2'
  UNION ALL
  SELECT 'AMB-ROOM-CN-001', id, 1, NULL, 50 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL2'
  UNION ALL
  SELECT 'AMB-ROOM-CN-002', id, 1, NULL, 60 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL2'
  UNION ALL
  SELECT 'AMB-CLINIC-PAUSE-001', id, 1, NULL, 70 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL3'
  UNION ALL
  SELECT 'AMB-CLINIC-SUBWAIT-001', id, 1, NULL, 70 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL3'
  UNION ALL
  SELECT 'AMB-ROOM-CN-001', id, 1, NULL, 60 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL3'
  UNION ALL
  SELECT 'AMB-ROOM-CN-002', id, 1, NULL, 70 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL3'
  UNION ALL
  SELECT 'AMB-ROOM-CN-001', id, 1, NULL, 70 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL4'
  UNION ALL
  SELECT 'AMB-ROOM-CN-002', id, 1, NULL, 80 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL4'
  UNION ALL
  SELECT 'AMB-ROOM-CN-001', id, 1, NULL, 80 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL5'
  UNION ALL
  SELECT 'AMB-ROOM-CN-002', id, 1, NULL, 90 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL5'
  UNION ALL
  SELECT 'AMB-ROOM-CN-001', id, 1, NULL, 90 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL6'
  UNION ALL
  SELECT 'AMB-ROOM-CN-002', id, 1, NULL, 100 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL6'
  UNION ALL
  SELECT 'AMB-ROOM-CN-001', id, 1, NULL, 100 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL7'
  UNION ALL
  SELECT 'AMB-ROOM-CN-002', id, 1, NULL, 110 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL7'
  UNION ALL
  -- WL8/WL9: "GME Admin/Huddle" part dropped (no such room exists)
  SELECT 'AMB-CLINIC-PAUSE-001', id, 1, NULL, 80 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL8'
  UNION ALL
  SELECT 'AMB-CLINIC-SUBWAIT-001', id, 1, NULL, 80 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL8'
  UNION ALL
  SELECT 'AMB-CLINIC-PAUSE-001', id, 1, NULL, 90 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL9'
  UNION ALL
  SELECT 'AMB-CLINIC-SUBWAIT-001', id, 1, NULL, 90 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL9'
  UNION ALL
  SELECT 'AMB-CLINIC-PAUSE-001', id, 1, NULL, 100 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL10'
  UNION ALL
  SELECT 'AMB-CLINIC-SUBWAIT-001', id, 1, NULL, 100 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL10'
  UNION ALL
  SELECT 'AMB-CLINIC-PAUSE-001', id, 1, NULL, 110 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL11'
  UNION ALL
  SELECT 'AMB-CLINIC-SUBWAIT-001', id, 1, NULL, 110 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL11'
  UNION ALL
  SELECT 'AMB-CLINIC-PAUSE-001', id, 1, NULL, 120 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL12'
  UNION ALL
  SELECT 'AMB-CLINIC-SUBWAIT-001', id, 1, NULL, 120 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL12'
  UNION ALL
  -- WL13: accessory table/lamp for the Rowan Modular run (WL10-12) -- follows the same rooms
  SELECT 'AMB-CLINIC-PAUSE-001', id, 1, NULL, 130 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL13'
  UNION ALL
  SELECT 'AMB-CLINIC-SUBWAIT-001', id, 1, NULL, 130 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL13'
  UNION ALL
  SELECT 'AMB-CLINIC-PAUSE-001', id, 1, NULL, 140 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL14'
  UNION ALL
  SELECT 'AMB-CLINIC-SUBWAIT-001', id, 1, NULL, 140 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL14'
  UNION ALL
  SELECT 'AMB-CLINIC-PAUSE-001', id, 1, NULL, 150 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL15'
  UNION ALL
  SELECT 'AMB-CLINIC-SUBWAIT-001', id, 1, NULL, 150 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL15'
  UNION ALL
  SELECT 'AMB-CLINIC-PAUSE-001', id, 1, NULL, 160 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL16'
  UNION ALL
  SELECT 'AMB-CLINIC-SUBWAIT-001', id, 1, NULL, 160 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL16'
  UNION ALL
  SELECT 'AMB-CLINIC-PAUSE-001', id, 1, NULL, 170 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL17'
  UNION ALL
  SELECT 'AMB-CLINIC-SUBWAIT-001', id, 1, NULL, 170 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL17'
  UNION ALL
  SELECT 'AMB-CLINIC-PAUSE-001', id, 1, NULL, 180 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL18'
  UNION ALL
  SELECT 'AMB-CLINIC-SUBWAIT-001', id, 1, NULL, 180 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL18'
  UNION ALL
  -- SS5/SS6: "Staff Breakroom" mapped to Staff Lounge, same as SS4
  SELECT 'AMB-SUPPORT-SL-001', id, 1, NULL, 40 FROM furniture WHERE taxonomy_id = 'AMB-FURN-SS5'
  UNION ALL
  SELECT 'AMB-SUPPORT-SL-001', id, 1, NULL, 50 FROM furniture WHERE taxonomy_id = 'AMB-FURN-SS6'
  UNION ALL
  SELECT 'AMB-CLINIC-PAUSE-001', id, 1, NULL, 190 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL19'
  UNION ALL
  SELECT 'AMB-CLINIC-SUBWAIT-001', id, 1, NULL, 190 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL19'
  UNION ALL
  SELECT 'AMB-CLINIC-PAUSE-001', id, 1, NULL, 200 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL20'
  UNION ALL
  SELECT 'AMB-CLINIC-SUBWAIT-001', id, 1, NULL, 200 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL20'
  UNION ALL
  SELECT 'AMB-CLINIC-PAUSE-001', id, 1, NULL, 210 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL22'
  UNION ALL
  SELECT 'AMB-CLINIC-SUBWAIT-001', id, 1, NULL, 210 FROM furniture WHERE taxonomy_id = 'AMB-FURN-WL22'
  UNION ALL
  -- SS12: "Staff Breakroom" mapped to Staff Lounge, same as SS4
  SELECT 'AMB-SUPPORT-SL-001', id, 1, NULL, 60 FROM furniture WHERE taxonomy_id = 'AMB-FURN-SS12'
  UNION ALL
  SELECT 'AMB-ROOM-CO-001', id, 1, NULL, 90 FROM furniture WHERE taxonomy_id = 'AMB-FURN-SS13'
ON CONFLICT (room_taxonomy_id, furniture_id) DO NOTHING;
