-- ============================================================
-- Seed: Ambulatory room stubs (28 room types)
-- ============================================================
-- Stub records only — taxonomy_id, name, zone, section, guideline_type,
-- edition_id (March 2026), is_published=FALSE. All other fields are
-- populated as content development proceeds.
--
-- NOTE (flagged, not assumed silently): the source prompt named 22 rooms
-- across "Clinic Planning" (8) and "Standard Rooms" (14) plus 2 Prototype
-- Plans and 2 Guidelines & Standards items (not rooms), but asked for stubs
-- covering "all 28 Ambulatory room types." To reach 28 distinct room
-- records this seed adds a 4-room "Specialty / Ancillary Rooms" section
-- (lab draw, x-ray, behavioral health consult, telehealth) alongside the 2
-- Prototype Plan rooms. Please confirm this room list against the actual
-- Ambulatory Design Guidelines room count — it's a reasonable placeholder
-- set, not a transcription of source content.

DO $$
DECLARE
  v_edition_id INTEGER;
BEGIN
  SELECT id INTO v_edition_id FROM editions WHERE guideline_type = 'AMBULATORY' AND edition_code = 'MAR-2026';

  -- ── Prototype Plans (2) ──────────────────────────────────
  INSERT INTO rooms (taxonomy_id, guideline_type, section, sort_order, name, zone, edition_id, is_published) VALUES
    ('AMB-PROTO-STDFLOW-001',  'AMBULATORY', 'Prototype Plans', 10, 'Standard Flow Prototype Plan',     'On-Stage / Off-Stage', v_edition_id, FALSE),
    ('AMB-PROTO-CONVFLOW-001', 'AMBULATORY', 'Prototype Plans', 20, 'Convergent Flow Prototype Plan',   'On-Stage / Off-Stage', v_edition_id, FALSE)
  ON CONFLICT (taxonomy_id) DO NOTHING;

  -- ── Clinic Planning rooms (8) ────────────────────────────
  INSERT INTO rooms (taxonomy_id, guideline_type, section, sort_order, name, zone, edition_id, is_published) VALUES
    ('AMB-CP-CHECKIN-001',     'AMBULATORY', 'Clinic Planning', 10, 'Check-In / Registration',   'On-Stage',              v_edition_id, FALSE),
    ('AMB-CP-WAITING-001',     'AMBULATORY', 'Clinic Planning', 20, 'Waiting Area',               'On-Stage',              v_edition_id, FALSE),
    ('AMB-CP-SUBWAIT-001',     'AMBULATORY', 'Clinic Planning', 30, 'Sub-Waiting',                'On-Stage',              v_edition_id, FALSE),
    ('AMB-CP-INTAKE-001',      'AMBULATORY', 'Clinic Planning', 40, 'Intake / Rooming',           'On-Stage / Off-Stage',  v_edition_id, FALSE),
    ('AMB-CP-TEAMSTATION-001', 'AMBULATORY', 'Clinic Planning', 50, 'Team Station',               'Off-Stage',             v_edition_id, FALSE),
    ('AMB-CP-CONSULT-001',     'AMBULATORY', 'Clinic Planning', 60, 'Consult Room',               'On-Stage',              v_edition_id, FALSE),
    ('AMB-CP-CHECKOUT-001',    'AMBULATORY', 'Clinic Planning', 70, 'Check-Out',                  'On-Stage',              v_edition_id, FALSE),
    ('AMB-CP-HUDDLE-001',      'AMBULATORY', 'Clinic Planning', 80, 'Huddle / Touchdown Space',   'Off-Stage',             v_edition_id, FALSE)
  ON CONFLICT (taxonomy_id) DO NOTHING;

  -- ── Standard Rooms (14) ───────────────────────────────────
  INSERT INTO rooms (taxonomy_id, guideline_type, section, sort_order, name, zone, edition_id, is_published) VALUES
    ('AMB-ROOM-EX-001',            'AMBULATORY', 'Standard Rooms', 10,  'Exam Room, Typical (2-Door)',      'On-Stage',   v_edition_id, FALSE),
    ('AMB-ROOM-EX-002',            'AMBULATORY', 'Standard Rooms', 20,  'Exam Room, Procedure-Capable',     'On-Stage',   v_edition_id, FALSE),
    ('AMB-ROOM-EXPD-001',          'AMBULATORY', 'Standard Rooms', 30,  'Exam Room, Pediatric',             'On-Stage',   v_edition_id, FALSE),
    ('AMB-ROOM-PROC-001',          'AMBULATORY', 'Standard Rooms', 40,  'Procedure Room',                   'On-Stage',   v_edition_id, FALSE),
    ('AMB-ROOM-CONSULT-001',       'AMBULATORY', 'Standard Rooms', 50,  'Provider Office / Consult',        'On-Stage',   v_edition_id, FALSE),
    ('AMB-ROOM-NURSE-001',         'AMBULATORY', 'Standard Rooms', 60,  'Nurse Station',                    'Off-Stage',  v_edition_id, FALSE),
    ('AMB-ROOM-MEDPREP-001',       'AMBULATORY', 'Standard Rooms', 70,  'Medication Prep / Pyxis',          'Off-Stage',  v_edition_id, FALSE),
    ('AMB-ROOM-SOIL-001',          'AMBULATORY', 'Standard Rooms', 80,  'Soiled Utility',                   'Off-Stage',  v_edition_id, FALSE),
    ('AMB-ROOM-CLEAN-001',         'AMBULATORY', 'Standard Rooms', 90,  'Clean Utility / Supply',           'Off-Stage',  v_edition_id, FALSE),
    ('AMB-ROOM-TOILET-001',        'AMBULATORY', 'Standard Rooms', 100, 'Patient Toilet',                   'On-Stage',   v_edition_id, FALSE),
    ('AMB-ROOM-STAFFTOILET-001',   'AMBULATORY', 'Standard Rooms', 110, 'Staff Toilet',                     'Off-Stage',  v_edition_id, FALSE),
    ('AMB-ROOM-STAFFLOUNGE-001',   'AMBULATORY', 'Standard Rooms', 120, 'Staff Lounge',                     'Off-Stage',  v_edition_id, FALSE),
    ('AMB-ROOM-STORAGE-001',       'AMBULATORY', 'Standard Rooms', 130, 'Equipment / Supply Storage',       'Off-Stage',  v_edition_id, FALSE),
    ('AMB-ROOM-IT-001',            'AMBULATORY', 'Standard Rooms', 140, 'IT / Telecom Closet',              'Off-Stage',  v_edition_id, FALSE)
  ON CONFLICT (taxonomy_id) DO NOTHING;

  -- ── Specialty / Ancillary Rooms (4) ──────────────────────
  INSERT INTO rooms (taxonomy_id, guideline_type, section, sort_order, name, zone, edition_id, is_published) VALUES
    ('AMB-ROOM-LAB-001',        'AMBULATORY', 'Specialty / Ancillary Rooms', 10, 'Lab Draw Station',                  'On-Stage',  v_edition_id, FALSE),
    ('AMB-ROOM-XRAY-001',       'AMBULATORY', 'Specialty / Ancillary Rooms', 20, 'X-Ray Room',                        'On-Stage',  v_edition_id, FALSE),
    ('AMB-ROOM-BEHAV-001',      'AMBULATORY', 'Specialty / Ancillary Rooms', 30, 'Behavioral Health Consult Room',    'On-Stage',  v_edition_id, FALSE),
    ('AMB-ROOM-TELEHEALTH-001', 'AMBULATORY', 'Specialty / Ancillary Rooms', 40, 'Telehealth Room',                   'On-Stage',  v_edition_id, FALSE)
  ON CONFLICT (taxonomy_id) DO NOTHING;
END $$;
