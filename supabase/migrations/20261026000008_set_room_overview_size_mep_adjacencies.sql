-- ============================================================
-- Room Overview fields: size, adjacencies, MEP/Systems
-- ============================================================
-- Fills in the rest of the Overview tab's Fact grid and MEP/Systems
-- section (RoomDataSheet.tsx), sourced from each room's "Room Metrics",
-- "Adjacencies", and "Room Data" sidebar in the CommonSpirit Ambulatory
-- Design Guidelines (March 2026), text-layer extracted. Covers all 28
-- rooms from 20261026000007 plus 4 more that had no left-column
-- paragraph (and so no description) but do have this sidebar data:
-- Pause Corridor, Half-Height Lockers, EVS Closet, and the Schedulers
-- zone-conflict room (zone itself untouched pending that decision).
--
-- Not included: "Arrival, Patient Support" and "PAR Breakdown" (no
-- taxonomy row yet), and the Water Cooler Alcove sub-element (part of
-- the same unresolved Patient Support room).
UPDATE rooms SET
  adjacency_labels = ARRAY['Clinic Entry','Wheelchair Storage','Work Copy Room'],
  size_display = '11''-9" deep (clear minimum) x 23''-8" wide',
  size_notes = 'Size determined by MOR count; use the Block Schedule to calculate MOR count.',
  mep_lighting = '(1) Continuous LED Wall Grazer, length to fit pocket; specialty light fixture -- see Lighting Schedule.',
  mep_security = 'Panic button at each Check-in Desk.'
  WHERE taxonomy_id = 'AMB-CLINIC-ARR-001';

UPDATE rooms SET
  adjacency_labels = ARRAY['Check-in'],
  size_display = '3''-0" deep (minimum) x length varies',
  mep_lighting = '(1) Continuous LED Wall Grazer, length to fit pocket; (1) Wall Washer.'
  WHERE taxonomy_id = 'AMB-CLINIC-ARR-002';

UPDATE rooms SET
  adjacency_labels = ARRAY['Main Public Circulation Path of Travel'],
  size_display = '8''-0" wide, clear minimum (length varies)',
  ratio_note = 'Primary Care seating baseline: 1.2 seats per exam room (10% bariatric).',
  mep_lighting = '(1) Continuous LED Wall Grazer, length to fit pocket; square aperature downlights & wall washers (L117 & L118) when flex space is used as sub-waiting.'
  WHERE taxonomy_id = 'AMB-CLINIC-PAUSE-001';

UPDATE rooms SET
  adjacency_labels = ARRAY['Clinic Entry','Check-in','Work/Copy'],
  size_display = '11''-4" wide x 14''-3" (varies)',
  size_notes = 'Meet ADA requirements for accessibility, both sides of desk.',
  mep_lighting = '(1) Continuous LED Wall Grazer, length to fit pocket; L117 Pendant.',
  mep_security = 'Panic Button at each desk.'
  WHERE taxonomy_id = 'AMB-CLINIC-SCHED-001';

UPDATE rooms SET
  adjacency_labels = ARRAY['Pause Circulation'],
  size_display = '11''-9" deep x width varies',
  size_notes = 'Provide a minimum of (3) furnishing styles in this zone. Provide pediatric furnishings where appropriate.',
  mep_lighting = '(1) Continuous LED Wall Grazer, length to fit pocket; Linear LED; Pendant.'
  WHERE taxonomy_id = 'AMB-CLINIC-SUBWAIT-001';

UPDATE rooms SET
  adjacency_labels = ARRAY['Check-in (provides area of refuge for Staff)'],
  size_display = '7''-0" x 8''-0", minimum',
  mep_lighting = 'Direct/Indirect Basket.'
  WHERE taxonomy_id = 'AMB-CLINIC-WCOPY-001';

UPDATE rooms SET
  adjacency_labels = ARRAY['Care Team Zone - central location'],
  size_display = '11''-5" wide x 2''-3" deep (minimum depth)',
  size_notes = 'Quantity: 1 per pod.',
  mep_lighting = 'Recessed Linear LED.'
  WHERE taxonomy_id = 'AMB-SUPPORT-BH-001';

UPDATE rooms SET
  adjacency_labels = ARRAY['Soiled Hold/Utility'],
  size_display = '8''-0" deep minimum x 8''-6" wide minimum',
  size_notes = 'Quantity: 1 per pod.',
  mep_lighting = 'Recessed Linear LED.',
  mep_plumbing = 'Integral sink -- see Plumbing Guideline.',
  mep_notes = 'Validate clinical refrigerator sizes with users based on patient mix & local jurisdiction requirements for vaccine storage.'
  WHERE taxonomy_id = 'AMB-SUPPORT-CM-001';

UPDATE rooms SET
  adjacency_labels = ARRAY['On-Stage; Arrival','Off-Stage; Care Team Zone'],
  size_display = '12''-2" x 18''-6" clear',
  size_notes = 'Quantity: varies.',
  mep_lighting = '2''-0" x 4''-0" recessed direct/indirect basket.',
  mep_security = 'Panic button.',
  mep_notes = 'FFE: Whiteboard(s) and Monitor(s).'
  WHERE taxonomy_id = 'AMB-ROOM-CO-001';

UPDATE rooms SET
  adjacency_labels = ARRAY['varies'],
  size_display = '9''-0" x 12''-0" (Exam Room module)',
  mep_lighting = '3''-0" surface mount, dimmable LED; see Lighting Schedule for options.',
  mep_security = 'Panic button.',
  mep_notes = 'FFE: Whiteboard(s) and Monitor(s).'
  WHERE taxonomy_id = 'AMB-ROOM-CN-001';

UPDATE rooms SET
  adjacency_labels = ARRAY['Care Team Zone'],
  size_display = '10''-6" x 12''-0" (10''-0" x 12''-0" minimum)',
  mep_lighting = '3''-0" surface mount, dimmable LED; see Lighting Schedule for options.',
  mep_security = 'Panic button.',
  mep_notes = 'FFE: Whiteboard(s) and Monitor(s).'
  WHERE taxonomy_id = 'AMB-ROOM-CN-002';

UPDATE rooms SET
  adjacency_labels = ARRAY['Care Team Zone','Patient Toilet','Patient Circulation Corridor'],
  size_display = '9''-0" x 12''-0" clear',
  same_handed = TRUE,
  ratio_note = 'Primary Care (baseline): 2.5 exam rooms per Provider.',
  mep_plumbing = 'Integral sink -- see Plumbing Schedule.'
  WHERE taxonomy_id = 'AMB-ROOM-EX-001';

UPDATE rooms SET
  adjacency_labels = ARRAY['Care Team Zone','Patient Toilet','Patient Circulation Corridor'],
  size_display = '9''-0" x 12''-0" clear',
  same_handed = TRUE,
  ratio_note = 'Primary Care: 2.5 exam rooms per Provider (baseline).',
  mep_plumbing = 'Integral sink -- see Plumbing Schedule.'
  WHERE taxonomy_id = 'AMB-ROOM-EX-002';

UPDATE rooms SET
  adjacency_labels = ARRAY['Care Team Zone','Patient Toilet','Patient Circulation Corridor'],
  size_display = '9''-0" x 12''-0" clear',
  same_handed = TRUE,
  ratio_note = 'Primary Care (baseline): 2.5 exam rooms per Provider.',
  mep_plumbing = 'Integral sink -- see Plumbing Schedule.'
  WHERE taxonomy_id = 'AMB-ROOM-EX-003';

UPDATE rooms SET
  adjacency_labels = ARRAY['Varies; locate close to centerline of clinic'],
  size_display = '10''-0" x 10''-0" (100 sf clear preferred; 8''-0" clear minimum)',
  size_notes = 'Used to accommodate IT Systems, Security Access Control, and Nurse Call.',
  mep_lighting = 'Strip, general purpose.',
  mep_power_data = 'Conduits: 2-4 inch conduits from service provider MPOE; 1" EMT with bushing to each voice/data outlet. Backboards: all MDF/IDF locations equipped with 3/4" plywood, fire-rated backboards. Fire rating approval stamps left visible.'
  WHERE taxonomy_id = 'AMB-SUPPORT-IT-001';

UPDATE rooms SET
  adjacency_labels = ARRAY['Care Team Zone'],
  size_display = '7''-0" wide x 10''-0" deep',
  size_area_sf = 70,
  size_notes = '70 square feet clear, minimum.',
  mep_lighting = '(1) Surface Mount Dimmable LED; see Lighting Schedule for options.'
  WHERE taxonomy_id = 'AMB-SUPPORT-MOM-001';

UPDATE rooms SET
  adjacency_labels = ARRAY['Care Team Zone'],
  size_display = '6''-0" wide x 10''-0" deep',
  size_area_sf = 60,
  size_notes = '60 sf. Minimum size: as noted.',
  mep_notes = 'Swing door with full lite glazing: utilize full lite if office is on exterior wall and borrowed daylight is possible; omit if not.'
  WHERE taxonomy_id = 'AMB-ROOM-OF-001';

UPDATE rooms SET
  adjacency_labels = ARRAY['Care Team Zone'],
  size_display = '8''-0" wide x 10''-0" deep',
  size_area_sf = 80,
  size_notes = '80 square feet clear, minimum. Typical occupants: Provider Office, Referral Coordinators, Care Coordinators.',
  mep_lighting = '(1) 2''-0" x 4''-0" direct/indirect basket.',
  mep_notes = 'Swing door with full lite glazing: utilize full lite if office is on exterior wall and borrowed daylight is possible; omit if not.'
  WHERE taxonomy_id = 'AMB-ROOM-OF-002';

UPDATE rooms SET
  adjacency_labels = ARRAY['Care Team Zone'],
  size_display = '8''-0" wide x 10''-0" deep',
  size_area_sf = 80,
  size_notes = '80 square feet clear, minimum. Typical occupant: Medical Director.',
  mep_lighting = '(1) 2''-0" x 4''-0" direct/indirect basket.',
  mep_notes = 'Swing door with full lite glazing: utilize full lite if office is on exterior wall and borrowed daylight is possible; omit if not.'
  WHERE taxonomy_id = 'AMB-ROOM-OF-003';

UPDATE rooms SET
  adjacency_labels = ARRAY['Arrival','Check-In'],
  size_display = '8''-0" wide x 12''-0" deep',
  size_area_sf = 96,
  size_notes = '96 square feet clear, minimum. Typical occupants: Clinic Manager, Financial Counselor.',
  mep_lighting = '(1) 2''-0" x 4''-0" direct/indirect basket.',
  mep_notes = 'Swing door with full lite glazing: utilize full lite if office is on exterior wall and borrowed daylight is possible; omit if not.'
  WHERE taxonomy_id = 'AMB-ROOM-OF-004';

UPDATE rooms SET
  adjacency_labels = ARRAY['Staff/Material Entry','Care Team Zone(s)'],
  size_display = 'Size varies; calculate at 7 sf/Exam Room (Primary Care)',
  size_notes = 'On/off prototype size: 20 exam rooms x 7 sf = 140 sf (8''-2" deep x 18''-0" wide).',
  mep_lighting = '2''-0" x 4''-0" direct/indirect basket.'
  WHERE taxonomy_id = 'AMB-SUPPORT-PAR-001';

UPDATE rooms SET
  adjacency_labels = ARRAY['Staff/Material Entry','Par Storage'],
  size_display = 'Varies depending on clinic size and modalities'
  WHERE taxonomy_id = 'AMB-SUPPORT-LOCK-001';

UPDATE rooms SET
  adjacency_labels = ARRAY['Care Team Zone','POC Testing, Urine'],
  size_display = '3''-0" wide x 11''-5" wide (no smaller than 8''-0" wide)',
  mep_lighting = 'Recessed Linear LED.',
  mep_plumbing = 'Integral sink -- see Plumbing Schedule.',
  mep_power_data = 'Mount below counter w/countertop grommets, typical UNO.'
  WHERE taxonomy_id = 'AMB-SUPPORT-POCT-002';

UPDATE rooms SET
  adjacency_labels = ARRAY['Patient Toilet','Care Team Zone','POC Test, Blood'],
  size_display = '3''-6" deep x 7''-6" wide, critical',
  size_notes = 'Quantity: 2 per pod.',
  mep_lighting = 'Recessed Linear LED.',
  mep_plumbing = 'Integral sink -- see Plumbing Schedule.',
  mep_power_data = 'Mount below counter w/countertop grommets, typical UNO.'
  WHERE taxonomy_id = 'AMB-SUPPORT-POCT-001';

UPDATE rooms SET
  adjacency_labels = ARRAY['Care Team Zone','Patient Toilet (direct connection, only if required by specialty)','Patient Circulation Corridor','Bio-Waste Holding'],
  size_display = '12''-0" x 12''-0"',
  size_notes = 'Primary Care: 1 per clinic in clinics requiring a dedicated Procedure Room, minimum. Specialty Care: varies.',
  mep_lighting = 'Direct/Indirect Basket.',
  mep_plumbing = 'Integral sink -- see Plumbing Schedule.'
  WHERE taxonomy_id = 'AMB-ROOM-PROC-001';

UPDATE rooms SET
  adjacency_labels = ARRAY['Care Team Zone','Patient Toilet','Patient Circulation Corridor','Bio-Waste Holding'],
  size_display = '12''-0" x 12''-0"',
  size_notes = 'Primary Care: 1 per clinic in clinics not requiring a dedicated Procedure Room, minimum. Specialty Care: varies.',
  mep_lighting = 'Direct/Indirect Basket.',
  mep_plumbing = 'Integral sink -- see Plumbing Schedule.'
  WHERE taxonomy_id = 'AMB-ROOM-PROC-002';

UPDATE rooms SET
  adjacency_labels = ARRAY['Staff/Material Circulation','Care Team Zone(s)'],
  size_notes = 'Calculate square footage @ 8 sq ft per person.',
  mep_lighting = '2'' x 4'' Direct/Indirect Basket.',
  mep_hvac = 'Independent exhaust, as shown.',
  mep_plumbing = 'Integral sink -- see Plumbing Schedule.',
  mep_security = 'Panic Button.'
  WHERE taxonomy_id = 'AMB-SUPPORT-SL-001';

UPDATE rooms SET
  adjacency_labels = ARRAY['Care Team Zone; POC Testing','Patient Circulation Corridor'],
  size_display = '6''-0" wide x 7''-6" deep; clear minimum',
  size_notes = 'Quantity: 1 per single-loaded patient corridor. Provide pass-thru to POC Testing.',
  mep_lighting = '(1) Recessed Downlight and (1) Vanity Light with Occupancy Sensors.',
  mep_plumbing = 'See Plumbing Schedule.'
  WHERE taxonomy_id = 'AMB-TOILET-PT-001';

UPDATE rooms SET
  adjacency_labels = ARRAY['Patient Entry','Arrival Zone','Water Fountain'],
  size_display = 'ADA Compliant for Region',
  size_notes = 'Quantity: 1:12 exam rooms.',
  mep_lighting = '(2) Recessed Downlights and (1) Vanity Light with Occupancy Sensors.',
  mep_plumbing = 'See Plumbing Schedule.'
  WHERE taxonomy_id = 'AMB-TOILET-FT-001';

UPDATE rooms SET
  adjacency_labels = ARRAY['Care Team Zone'],
  size_display = '6''-8" wide x 8''-0" deep',
  size_notes = 'Quantity: (1) per pod.',
  mep_lighting = '(1) Recessed Downlight and (1) Vanity Light on Occupancy Sensors.',
  mep_plumbing = 'See Plumbing Schedule.'
  WHERE taxonomy_id = 'AMB-TOILET-ST-001';

UPDATE rooms SET
  adjacency_labels = ARRAY['Staff/Supply Entry'],
  size_display = '6''-0" x 8''-0" deep, clear minimum',
  mep_lighting = '(1) Recessed Linear.'
  WHERE taxonomy_id = 'AMB-SUPPORT-EV-001';

UPDATE rooms SET
  adjacency_labels = ARRAY['Care Team Zone'],
  size_display = '6''-0" wide x 10''-0" deep, 60 sf (6''-0" wide x 8''-0" deep, 48 sf minimum)',
  mep_lighting = '(1) square aperature LED downlight, (1) square aperature LED wall washer.'
  WHERE taxonomy_id = 'AMB-SUPPORT-ZEN-001';
