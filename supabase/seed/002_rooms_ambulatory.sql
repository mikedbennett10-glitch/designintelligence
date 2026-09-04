-- ============================================================
-- Seed: Ambulatory room stubs — real taxonomy per DIP_WBS_v1.0.docx §2.1
-- ============================================================
-- Supersedes the earlier placeholder 28-room seed (2 invented Prototype
-- Plan rooms + 4 invented Specialty/Ancillary rooms). WBS §2.1 "Room Data
-- Sheet Population" gives the authoritative 35-room Ambulatory taxonomy
-- across 5 work packages (2.1.1–2.1.5); every taxonomy_id and section
-- grouping below is transcribed directly from it.
--
-- Two things the WBS does NOT specify, flagged rather than assumed silently:
--   - zone (On-Stage / Off-Stage): inferred from each room's function —
--     please confirm against the ADG.
--   - axon_type: WBS §3.2.1 classifies rooms into 3 drawing-treatment
--     tiers via a "room type classification table" that isn't part of
--     this document, so axon_type is left NULL (unclassified) for all
--     rooms here rather than guessed.
--
-- Prototype Plans (Standard Flow, Convergent Flow — WBS §2.3) are NOT
-- seeded as rooms: they're whole-clinic plan-level content with their own
-- 6 drawing types (floorplan, adjacencies & flow, finish plan, RCP,
-- security plan, wall types), not individual room taxonomy entries. They
-- need a separate content model when that work package is built.

DO $$
DECLARE
  v_edition_id INTEGER;
BEGIN
  SELECT id INTO v_edition_id FROM editions WHERE guideline_type = 'AMBULATORY' AND edition_code = 'MAR-2026';

  -- ── WBS 2.1.1 — Clinic Planning spaces (8) ───────────────
  INSERT INTO rooms (taxonomy_id, guideline_type, section, sort_order, name, zone, edition_id, is_published) VALUES
    ('AMB-CLINIC-ARR-001',     'AMBULATORY', 'Clinic Planning', 10, 'Arrival / Check-in',           'On-Stage',             v_edition_id, FALSE),
    ('AMB-CLINIC-ARR-002',     'AMBULATORY', 'Clinic Planning', 20, 'Arrival, Hello Center',         'On-Stage',             v_edition_id, FALSE),
    ('AMB-CLINIC-PAUSE-001',   'AMBULATORY', 'Clinic Planning', 30, 'Arrival, Pause Corridor',       'On-Stage',             v_edition_id, FALSE),
    ('AMB-CLINIC-SUBWAIT-001', 'AMBULATORY', 'Clinic Planning', 40, 'Arrival, Subwait Zone',         'On-Stage',             v_edition_id, FALSE),
    ('AMB-CLINIC-WCOPY-001',   'AMBULATORY', 'Clinic Planning', 50, 'Arrival, Work / Copy',          'On-Stage / Off-Stage', v_edition_id, FALSE),
    ('AMB-SUPPORT-BH-001',     'AMBULATORY', 'Clinic Planning', 60, 'Business Hub',                  'Off-Stage',            v_edition_id, FALSE),
    ('AMB-CLINIC-SCHED-001',   'AMBULATORY', 'Clinic Planning', 70, 'Schedulers',                    'Off-Stage',            v_edition_id, FALSE),
    ('AMB-ROOM-CO-001',        'AMBULATORY', 'Clinic Planning', 80, 'Conference Room',                'Off-Stage',            v_edition_id, FALSE)
  ON CONFLICT (taxonomy_id) DO NOTHING;

  -- ── WBS 2.1.2 — Standard Rooms: Exam and Procedure (5) ───
  INSERT INTO rooms (taxonomy_id, guideline_type, section, sort_order, name, zone, edition_id, is_published) VALUES
    ('AMB-ROOM-EX-001',   'AMBULATORY', 'Standard Rooms — Exam and Procedure', 10, 'Exam Room, Typical 2-Door', 'On-Stage', v_edition_id, FALSE),
    ('AMB-ROOM-EX-002',   'AMBULATORY', 'Standard Rooms — Exam and Procedure', 20, 'Exam Room, Alt 1 1-Door',   'On-Stage', v_edition_id, FALSE),
    ('AMB-ROOM-EX-003',   'AMBULATORY', 'Standard Rooms — Exam and Procedure', 30, 'Exam Room, Alt 2 1-Door',   'On-Stage', v_edition_id, FALSE),
    ('AMB-ROOM-PROC-001', 'AMBULATORY', 'Standard Rooms — Exam and Procedure', 40, 'Procedure Room, Type I',    'On-Stage', v_edition_id, FALSE),
    ('AMB-ROOM-PROC-002', 'AMBULATORY', 'Standard Rooms — Exam and Procedure', 50, 'Procedure Room, Type II',   'On-Stage', v_edition_id, FALSE)
  ON CONFLICT (taxonomy_id) DO NOTHING;

  -- ── WBS 2.1.3 — Standard Rooms: Consult and Office (6) ───
  INSERT INTO rooms (taxonomy_id, guideline_type, section, sort_order, name, zone, edition_id, is_published) VALUES
    ('AMB-ROOM-CN-001', 'AMBULATORY', 'Standard Rooms — Consult and Office', 10, 'Consult Room, Type 1',            'On-Stage',  v_edition_id, FALSE),
    ('AMB-ROOM-CN-002', 'AMBULATORY', 'Standard Rooms — Consult and Office', 20, 'Consult Room, Behavioral Health', 'On-Stage',  v_edition_id, FALSE),
    ('AMB-ROOM-OF-001', 'AMBULATORY', 'Standard Rooms — Consult and Office', 30, 'Office, Type 1 Private',          'Off-Stage', v_edition_id, FALSE),
    ('AMB-ROOM-OF-002', 'AMBULATORY', 'Standard Rooms — Consult and Office', 40, 'Office, Type 2 Shared',           'Off-Stage', v_edition_id, FALSE),
    ('AMB-ROOM-OF-003', 'AMBULATORY', 'Standard Rooms — Consult and Office', 50, 'Office, Type 3 Director',         'Off-Stage', v_edition_id, FALSE),
    ('AMB-ROOM-OF-004', 'AMBULATORY', 'Standard Rooms — Consult and Office', 60, 'Office, Type 4 Manager',          'Off-Stage', v_edition_id, FALSE)
  ON CONFLICT (taxonomy_id) DO NOTHING;

  -- ── WBS 2.1.4 — Clinical Support Spaces (7) ──────────────
  INSERT INTO rooms (taxonomy_id, guideline_type, section, sort_order, name, zone, edition_id, is_published) VALUES
    ('AMB-SUPPORT-CM-001',    'AMBULATORY', 'Clinical Support Spaces', 10, 'Clean / Meds Zone',        'Off-Stage', v_edition_id, FALSE),
    ('AMB-SUPPORT-POCT-001',  'AMBULATORY', 'Clinical Support Spaces', 20, 'POC Testing, Urine',       'Off-Stage', v_edition_id, FALSE),
    ('AMB-SUPPORT-POCT-002',  'AMBULATORY', 'Clinical Support Spaces', 30, 'POC Testing, Blood',       'Off-Stage', v_edition_id, FALSE),
    ('AMB-SUPPORT-PAR-001',   'AMBULATORY', 'Clinical Support Spaces', 40, 'PAR Storage',              'Off-Stage', v_edition_id, FALSE),
    ('AMB-SUPPORT-IT-001',    'AMBULATORY', 'Clinical Support Spaces', 50, 'IT / Comm Room',           'Off-Stage', v_edition_id, FALSE),
    ('AMB-SUPPORT-BIO-001',   'AMBULATORY', 'Clinical Support Spaces', 60, 'Bio-Waste / Soiled Hold',  'Off-Stage', v_edition_id, FALSE),
    ('AMB-SUPPORT-EQUIP-001', 'AMBULATORY', 'Clinical Support Spaces', 70, 'Equipment Charging',       'Off-Stage', v_edition_id, FALSE)
  ON CONFLICT (taxonomy_id) DO NOTHING;

  -- ── WBS 2.1.5 — Staff Support Spaces (9) ─────────────────
  INSERT INTO rooms (taxonomy_id, guideline_type, section, sort_order, name, zone, edition_id, is_published) VALUES
    ('AMB-SUPPORT-SL-001',    'AMBULATORY', 'Staff Support Spaces', 10, 'Staff Lounge',                'Off-Stage', v_edition_id, FALSE),
    ('AMB-TOILET-PT-001',     'AMBULATORY', 'Staff Support Spaces', 20, 'Toilet, Patient',              'On-Stage',  v_edition_id, FALSE),
    ('AMB-TOILET-FT-001',     'AMBULATORY', 'Staff Support Spaces', 30, 'Toilet, Public / Family',      'On-Stage',  v_edition_id, FALSE),
    ('AMB-TOILET-ST-001',     'AMBULATORY', 'Staff Support Spaces', 40, 'Toilet, Staff',                'Off-Stage', v_edition_id, FALSE),
    ('AMB-SUPPORT-EV-001',    'AMBULATORY', 'Staff Support Spaces', 50, 'EVS Closet',                   'Off-Stage', v_edition_id, FALSE),
    ('AMB-SUPPORT-BRKDN-001', 'AMBULATORY', 'Staff Support Spaces', 60, 'Breakdown Room',               'Off-Stage', v_edition_id, FALSE),
    ('AMB-SUPPORT-MOM-001',   'AMBULATORY', 'Staff Support Spaces', 70, 'Mother''s Room',               'Off-Stage', v_edition_id, FALSE),
    ('AMB-SUPPORT-ZEN-001',   'AMBULATORY', 'Staff Support Spaces', 80, 'Zen Den',                      'Off-Stage', v_edition_id, FALSE),
    ('AMB-SUPPORT-LOCK-001',  'AMBULATORY', 'Staff Support Spaces', 90, 'Half-Height Lockers',          'Off-Stage', v_edition_id, FALSE)
  ON CONFLICT (taxonomy_id) DO NOTHING;
END $$;
