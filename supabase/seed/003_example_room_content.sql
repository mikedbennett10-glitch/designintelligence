-- ============================================================
-- Seed: example room content (WBS §2.1 field population, §2.2 decision
-- logic / omissions, §4.1–4.3 standards repositories)
-- ============================================================
-- EVERYTHING IN THIS FILE IS PLACEHOLDER CONTENT, not a transcription of
-- the real March 2026 Ambulatory Design Guidelines. It exists so the
-- room data sheet UI (description, MEP, Decision Logic, Specification,
-- Version History tabs) has something real to render instead of empty
-- states across the board, while the actual guideline content — which
-- only CSH's Design & Architecture team has — is authored separately.
--
-- Populates 3 rooms spanning different sections and drawing-scope needs:
--   AMB-ROOM-EX-001    Exam Room, Typical 2-Door   (primary room type)
--   AMB-CLINIC-ARR-001 Arrival / Check-in           (primary room type)
--   AMB-SUPPORT-CM-001 Clean / Meds Zone            (support space)
-- Per WBS 2.2: primary room types get >=3 decision logic entries and
-- >=2 intentional omissions; support spaces get >=1 decision logic entry.
--
-- Also seeds a handful of finishes/equipment/furniture repository
-- records to link to via the junction tables. Finish codes (RFT-1, P-1,
-- etc.) match the real code list named in WBS 4.1.1 — but the product
-- data attached to them here (manufacturer, product name, color) is
-- invented, not the real specification.

DO $$
DECLARE
  v_edition_id INTEGER;
BEGIN
  SELECT id INTO v_edition_id FROM editions WHERE guideline_type = 'AMBULATORY' AND edition_code = 'MAR-2026';

  -- ── Standards repositories (example records) ─────────────
  INSERT INTO finishes (code, guideline_scope, product_type, description, manufacturer, product_name, color, edition_id) VALUES
    ('RFT-1', 'AMBULATORY', 'Resilient Floor Tile', 'Primary flooring — exam rooms, corridors, clinic planning spaces.', 'Example Manufacturer Co.', 'Example LVT Collection', 'Warm Grey',       v_edition_id),
    ('RFT-2', 'AMBULATORY', 'Resilient Floor Tile', 'Accent / wayfinding flooring at arrival and transitions.',          'Example Manufacturer Co.', 'Example LVT Collection', 'CSH Blue Accent', v_edition_id),
    ('RSH-1', 'AMBULATORY', 'Resilient Sheet',      'Wet-area flooring — clean/meds zones, POC testing.',                'Example Manufacturer Co.', 'Example Sheet Series',   'Clinical Grey',    v_edition_id),
    ('WC-1',  'AMBULATORY', 'Wall Covering',        'Accent wall covering, exam rooms.',                                 'Example Wallcovering Co.', 'Example Texture Series', 'Pale Blue',        v_edition_id),
    ('P-1',   'SHARED',     'Paint',                'Standard wall paint, general use.',                                 'Example Paint Co.',        'Example Interior Line',  'Soft White',       v_edition_id),
    ('SS-1',  'SHARED',     'Solid Surface',        'Casework countertops.',                                             'Example Surfaces Co.',     'Example Solid Series',   'Arctic White',     v_edition_id),
    ('ACT-1', 'SHARED',     'Acoustic Ceiling Tile','Standard lay-in ceiling tile.',                                     'Example Ceilings Co.',     'Example ACT Line',       'White',            v_edition_id)
  ON CONFLICT (code) DO NOTHING;

  INSERT INTO equipment (taxonomy_id, guideline_scope, name, category, responsibility, edition_id) VALUES
    ('SHR-EQUIP-EXAMTABLE-01', 'AMBULATORY', 'Exam Table, Power',                     'Clinical',      'OFOI', v_edition_id),
    ('SHR-EQUIP-SCALE-01',     'SHARED',     'Scale, Adult w/Stadiometer',            'Clinical',      'OFOI', v_edition_id),
    ('SHR-EQUIP-OTOSCOPE-01',  'AMBULATORY', 'Otoscope / Ophthalmoscope Wall Set',    'Clinical',      'OFCI', v_edition_id),
    ('SHR-EQUIP-HANDHYG-01',   'SHARED',     'Hand Hygiene Dispenser, Wall-Mounted',  'Clinical',      'OFCI', v_edition_id),
    ('SHR-EQUIP-MEDREF-01',    'AMBULATORY', 'Medication Refrigerator',               'Clinical',      'OFOI', v_edition_id),
    ('SHR-EQUIP-SIGNIN-01',    'AMBULATORY', 'Self-Service Check-in Kiosk',           'IT',            'OFOI', v_edition_id)
  ON CONFLICT (taxonomy_id) DO NOTHING;

  INSERT INTO furniture (taxonomy_id, guideline_scope, name, category, responsibility, edition_id) VALUES
    ('SHR-FURN-EXAMCHAIR-01',   'AMBULATORY', 'Exam Room Guest Chair',                 'Seating - Clinical', 'OFOI', v_edition_id),
    ('SHR-FURN-STOOL-01',       'SHARED',     'Provider Stool, Height-Adjustable',     'Seating - Clinical', 'OFOI', v_edition_id),
    ('SHR-FURN-ARRIVALSEAT-01', 'AMBULATORY', 'Arrival Seating, Modular',              'Seating - Public',   'OFOI', v_edition_id),
    ('SHR-FURN-COUNTER-01',     'AMBULATORY', 'Check-in Counter, Standing-Height',     'Tables & Storage',   'OFCI', v_edition_id)
  ON CONFLICT (taxonomy_id) DO NOTHING;

  -- ── AMB-ROOM-EX-001 — Exam Room, Typical 2-Door ──────────
  UPDATE rooms SET
    subtitle = 'Two-door configuration, provider and patient circulation separated',
    ratio_note = 'Example ratio: 2.5 exam rooms per provider (primary care baseline)',
    size_display = '9''-0" × 12''-0" clear',
    size_width_ft = 9, size_depth_ft = 12, size_area_sf = 108,
    description = 'Example content. The typical exam room supports the full range of primary-care encounters with a same-handed layout repeated across the module, so providers and clinical staff build consistent muscle memory for equipment and supply locations regardless of which room they''re in.',
    mep_lighting = 'Example content. General LED downlight plus a dedicated exam-light fixture over the table; dimmable for patient comfort during exams requiring lower ambient light.',
    mep_hvac = 'Example content. Positive-pressure supply relative to the corridor; independently zoned from adjacent rooms.',
    mep_plumbing = 'Example content. Hand-hygiene sink at the provider entry, sized and positioned for hands-free operation.',
    mep_power_data = 'Example content. Duplex outlets at the workstation and exam table; one data drop at the mobile workstation dock.',
    mep_security = 'Example content. None required beyond building-standard access control at the suite entry.',
    mep_av = 'Example content. None.',
    mep_acoustic = 'Example content. STC-45 demising walls to adjacent exam rooms for speech privacy.',
    mep_nurse_call = 'Example content. Standard call station within reach of the exam table.',
    axon_type = 1,
    edition_id = v_edition_id
  WHERE taxonomy_id = 'AMB-ROOM-EX-001';

  INSERT INTO room_decision_logic (room_taxonomy_id, category, content, edition_id, sort_order) VALUES
    ('AMB-ROOM-EX-001', 'Layout',  'Example content. The two-door configuration separates provider and patient circulation, so a provider can move between rooms without re-entering the patient corridor, and a patient never has to wait in a room a provider is passing through.', v_edition_id, 10),
    ('AMB-ROOM-EX-001', 'Safety',  'Example content. The provider door is positioned nearest the corridor exit so staff always have a clear path out during a behavioral or medical emergency.', v_edition_id, 20),
    ('AMB-ROOM-EX-001', 'Clinical','Example content. The hand-hygiene sink sits within reach of the exam table, supporting hand hygiene immediately before and after patient contact without leaving the room.', v_edition_id, 30)
  ON CONFLICT DO NOTHING;

  INSERT INTO room_intentional_omissions (room_taxonomy_id, item, rationale, edition_id, sort_order) VALUES
    ('AMB-ROOM-EX-001', 'Wall-mounted television', 'Example content. Competes with provider-patient eye contact during the encounter, and adds a device that must be cleaned and maintained without a clear clinical benefit in a typical exam visit.', v_edition_id, 10),
    ('AMB-ROOM-EX-001', 'Built-in provider desk',  'Example content. A mobile workstation preserves flexibility to reconfigure the room for different visit types without a fixed millwork commitment.', v_edition_id, 20)
  ON CONFLICT DO NOTHING;

  INSERT INTO room_finishes (room_taxonomy_id, finish_code, location, notes, sort_order) VALUES
    ('AMB-ROOM-EX-001', 'RFT-1', 'Floor',  'Example content.', 10),
    ('AMB-ROOM-EX-001', 'WC-1',  'Walls',  'Example content. Accent wall behind exam table.', 20),
    ('AMB-ROOM-EX-001', 'P-1',   'Walls',  'Example content. All walls not otherwise noted.', 30),
    ('AMB-ROOM-EX-001', 'SS-1',  'Countertop', 'Example content.', 40),
    ('AMB-ROOM-EX-001', 'ACT-1', 'Ceiling','Example content.', 50)
  ON CONFLICT (room_taxonomy_id, finish_code, location) DO NOTHING;

  INSERT INTO room_equipment (room_taxonomy_id, equipment_id, quantity, notes, sort_order)
    SELECT 'AMB-ROOM-EX-001', id, 1, 'Example content.', 10 FROM equipment WHERE taxonomy_id = 'SHR-EQUIP-EXAMTABLE-01'
    UNION ALL
    SELECT 'AMB-ROOM-EX-001', id, 1, 'Example content.', 20 FROM equipment WHERE taxonomy_id = 'SHR-EQUIP-OTOSCOPE-01'
    UNION ALL
    SELECT 'AMB-ROOM-EX-001', id, 1, 'Example content.', 30 FROM equipment WHERE taxonomy_id = 'SHR-EQUIP-HANDHYG-01'
  ON CONFLICT (room_taxonomy_id, equipment_id) DO NOTHING;

  INSERT INTO room_furniture (room_taxonomy_id, furniture_id, quantity, notes, sort_order)
    SELECT 'AMB-ROOM-EX-001', id, 1, 'Example content.', 10 FROM furniture WHERE taxonomy_id = 'SHR-FURN-EXAMCHAIR-01'
    UNION ALL
    SELECT 'AMB-ROOM-EX-001', id, 1, 'Example content.', 20 FROM furniture WHERE taxonomy_id = 'SHR-FURN-STOOL-01'
  ON CONFLICT (room_taxonomy_id, furniture_id) DO NOTHING;

  INSERT INTO room_drawings (room_taxonomy_id, drawing_type, version, format, status, is_schematic) VALUES
    ('AMB-ROOM-EX-001', 'fp',  'v1.0.0', 'svg', 'pending', TRUE),
    ('AMB-ROOM-EX-001', 'rcp', 'v1.0.0', 'svg', 'pending', TRUE)
  ON CONFLICT (room_taxonomy_id, drawing_type, format, version) DO NOTHING;

  -- ── AMB-CLINIC-ARR-001 — Arrival / Check-in ──────────────
  UPDATE rooms SET
    subtitle = 'First patient touchpoint — self-service and assisted check-in',
    size_display = 'Sized per volume — see size_notes',
    size_notes = 'Example content. Calculate at approximately 15 SF per active check-in position plus circulation.',
    description = 'Example content. Arrival combines self-service kiosks and an assisted check-in counter so patients can choose the interaction level they''re comfortable with, while staff retain a clear sightline across the space for patients who need help.',
    mep_lighting = 'Example content. Higher ambient light level than clinical spaces to support a welcoming, retail-like first impression.',
    mep_power_data = 'Example content. Dedicated data and power for each kiosk position; counter positions wired for dual monitors.',
    mep_security = 'Example content. Panic button at the assisted check-in counter.',
    mep_acoustic = 'Example content. Sound-absorptive ceiling treatment to manage reverberation in a high-traffic, hard-surfaced space.',
    axon_type = 2,
    edition_id = v_edition_id
  WHERE taxonomy_id = 'AMB-CLINIC-ARR-001';

  INSERT INTO room_decision_logic (room_taxonomy_id, category, content, edition_id, sort_order) VALUES
    ('AMB-CLINIC-ARR-001', 'Layout',       'Example content. Self-service kiosks are positioned ahead of the assisted counter in the patient''s sightline, so kiosk use is the visually obvious default rather than the counter.', v_edition_id, 10),
    ('AMB-CLINIC-ARR-001', 'Clinical',     'Example content. The assisted counter keeps a clear sightline to the waiting area so staff can proactively check on patients who seem to need help.', v_edition_id, 20),
    ('AMB-CLINIC-ARR-001', 'Brand',        'Example content. Finish and lighting selections favor a warmer, retail-adjacent palette here specifically, distinct from the more clinical palette used past the arrival threshold.', v_edition_id, 30)
  ON CONFLICT DO NOTHING;

  INSERT INTO room_intentional_omissions (room_taxonomy_id, item, rationale, edition_id, sort_order) VALUES
    ('AMB-CLINIC-ARR-001', 'Enclosed reception windows', 'Example content. An open counter reads as more welcoming than a glazed partition, and CSH facilities are non-security-sensitive enough not to need the barrier.', v_edition_id, 10),
    ('AMB-CLINIC-ARR-001', 'Digital wayfinding displays', 'Example content. Evaluated and deferred — static signage was judged sufficient at typical clinic scale, and screens add a maintenance burden without a clear patient benefit at this scale.', v_edition_id, 20)
  ON CONFLICT DO NOTHING;

  INSERT INTO room_finishes (room_taxonomy_id, finish_code, location, notes, sort_order) VALUES
    ('AMB-CLINIC-ARR-001', 'RFT-2', 'Floor', 'Example content. Wayfinding accent at threshold.', 10),
    ('AMB-CLINIC-ARR-001', 'P-1',   'Walls', 'Example content.', 20),
    ('AMB-CLINIC-ARR-001', 'SS-1',  'Countertop', 'Example content. Check-in counter surface.', 30)
  ON CONFLICT (room_taxonomy_id, finish_code, location) DO NOTHING;

  INSERT INTO room_equipment (room_taxonomy_id, equipment_id, quantity, notes, sort_order)
    SELECT 'AMB-CLINIC-ARR-001', id, 2, 'Example content. Quantity varies by clinic volume.', 10 FROM equipment WHERE taxonomy_id = 'SHR-EQUIP-SIGNIN-01'
  ON CONFLICT (room_taxonomy_id, equipment_id) DO NOTHING;

  INSERT INTO room_furniture (room_taxonomy_id, furniture_id, quantity, notes, sort_order)
    SELECT 'AMB-CLINIC-ARR-001', id, 6, 'Example content. Quantity varies by clinic volume.', 10 FROM furniture WHERE taxonomy_id = 'SHR-FURN-ARRIVALSEAT-01'
    UNION ALL
    SELECT 'AMB-CLINIC-ARR-001', id, 1, 'Example content.', 20 FROM furniture WHERE taxonomy_id = 'SHR-FURN-COUNTER-01'
  ON CONFLICT (room_taxonomy_id, furniture_id) DO NOTHING;

  -- ── AMB-SUPPORT-CM-001 — Clean / Meds Zone ───────────────
  UPDATE rooms SET
    subtitle = 'Centralized clean supply and medication prep for the pod',
    description = 'Example content. Consolidates clean supply storage and medication preparation into one staff-only zone shared by the surrounding exam-room pod, reducing the walking distance from supply to point of care.',
    mep_lighting = 'Example content. Task lighting at the medication prep counter, in addition to general ambient lighting.',
    mep_hvac = 'Example content. Independently zoned; positive pressure relative to soiled areas.',
    mep_power_data = 'Example content. Dedicated circuit for the medication refrigerator.',
    mep_security = 'Example content. Card-reader access — medications and clean supply are staff-only.',
    axon_type = 3,
    edition_id = v_edition_id
  WHERE taxonomy_id = 'AMB-SUPPORT-CM-001';

  INSERT INTO room_decision_logic (room_taxonomy_id, category, content, edition_id, sort_order) VALUES
    ('AMB-SUPPORT-CM-001', 'Layout', 'Example content. Centralizing clean supply and medication prep for a whole pod, rather than duplicating small versions of each in every exam room, keeps the exam room footprint smaller without adding meaningful walking distance for staff.', v_edition_id, 10)
  ON CONFLICT DO NOTHING;

  INSERT INTO room_finishes (room_taxonomy_id, finish_code, location, notes, sort_order) VALUES
    ('AMB-SUPPORT-CM-001', 'RSH-1', 'Floor', 'Example content. Sheet flooring for cleanability.', 10),
    ('AMB-SUPPORT-CM-001', 'SS-1',  'Countertop', 'Example content. Medication prep counter.', 20)
  ON CONFLICT (room_taxonomy_id, finish_code, location) DO NOTHING;

  INSERT INTO room_equipment (room_taxonomy_id, equipment_id, quantity, notes, sort_order)
    SELECT 'AMB-SUPPORT-CM-001', id, 1, 'Example content.', 10 FROM equipment WHERE taxonomy_id = 'SHR-EQUIP-MEDREF-01'
    UNION ALL
    SELECT 'AMB-SUPPORT-CM-001', id, 1, 'Example content.', 20 FROM equipment WHERE taxonomy_id = 'SHR-EQUIP-HANDHYG-01'
  ON CONFLICT (room_taxonomy_id, equipment_id) DO NOTHING;

END $$;
