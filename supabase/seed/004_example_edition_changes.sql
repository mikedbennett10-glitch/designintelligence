-- ============================================================
-- Seed: example edition change log (WBS §8.1.2 UI support data)
-- ============================================================
-- EXAMPLE CONTENT — not a transcription of the real March 2026 change
-- log. WBS 8.1.1 describes migrating the actual change log (60+ entries
-- across 8 sections) from an existing HTML prototype; that source isn't
-- available here. January 2025 is the documented baseline edition and
-- deliberately gets zero change-log entries (WBS 8.1.1: "January 2025
-- baseline (no changes)"), which the Version History UI should render as
-- an empty state, not a bug.
--
-- These entries exist to exercise the Version History UI end-to-end:
-- grouping by section, filtering by change type, and linking a change
-- entry to the room it affects. A few are deliberately linked to the 3
-- rooms populated in 003_example_room_content.sql.

DO $$
DECLARE
  v_edition_id INTEGER;
BEGIN
  SELECT id INTO v_edition_id FROM editions WHERE guideline_type = 'AMBULATORY' AND edition_code = 'MAR-2026';

  INSERT INTO edition_changes (edition_id, page, section, title, change_type, description, room_taxonomy_id, sort_order) VALUES
    (v_edition_id, '42',    'Standard Rooms',   'Exam Room, Typical 2-Door', 'M', 'Example content. Hand-hygiene sink relocated within reach of the exam table per updated infection-control guidance.', 'AMB-ROOM-EX-001', 10),
    (v_edition_id, '44',    'Standard Rooms',   'Exam Room, Alt 2 1-Door',   'N', 'Example content. New single-door exam room variant added for compact clinic footprints.', 'AMB-ROOM-EX-003', 20),
    (v_edition_id, '51',    'Standard Rooms',   'Procedure Room, Type III',  'E', 'Example content. Type III procedure room eliminated — consolidated into Type II with an optional equipment package.', NULL, 30),
    (v_edition_id, '12',    'Clinic Planning',  'Arrival / Check-in',        'M', 'Example content. Self-service kiosk count increased from 1 to 2 minimum per clinic module.', 'AMB-CLINIC-ARR-001', 40),
    (v_edition_id, '15',    'Clinic Planning',  'Business Hub',              'N', 'Example content. Business Hub added as a new clinic planning space consolidating scheduling and referral staff.', NULL, 50),
    (v_edition_id, '70',    'Clinical Support Spaces', 'Clean / Meds Zone',   'M', 'Example content. Medication refrigerator now required in every Clean/Meds Zone, not just pods with infusion services.', 'AMB-SUPPORT-CM-001', 60),
    (v_edition_id, '81',    'Finishes',         'RFT-1 — Resilient Floor Tile', 'M', 'Example content. Primary flooring color updated from prior neutral to Warm Grey across all standard rooms.', NULL, 70),
    (v_edition_id, '85',    'Finishes',         'RSH-1 — Resilient Sheet',   'N', 'Example content. New sheet flooring code added for wet/clean areas, replacing ad-hoc use of RFT codes in those spaces.', NULL, 80),
    (v_edition_id, '92',    'Furniture & FF&E', 'Furniture Schedule',        'M', 'Example content. Furniture schedule revised in its entirety for this edition — see Furniture/FF&E Schedule for current items.', NULL, 90),
    (v_edition_id, '5',     'Governance',       'Deviation request SLA',     'M', 'Example content. Platform Owner response target tightened from 10 to 5 business days.', NULL, 100)
  ON CONFLICT DO NOTHING;
END $$;
