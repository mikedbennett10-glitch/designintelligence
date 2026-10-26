-- ============================================================
-- Room Overview descriptions, pulled from the guideline source
-- ============================================================
-- The "Overview" tab renders rooms.description verbatim (see
-- RoomDataSheet.tsx). These are the left-column intro paragraphs from
-- each room's page in the CommonSpirit Ambulatory Design Guidelines
-- (March 2026 edition), extracted from the PDFs' text layer rather than
-- retyped from the rendered image, to avoid transcription drift.
-- Source typos (e.g. "desiged", "biolophilic", "attibutes") are kept
-- verbatim rather than silently corrected.
--
-- Not included -- no left-column paragraph exists on that room's page,
-- only labeled drawings and a Room Data sidebar:
--   AMB-CLINIC-PAUSE-001 (Pause Corridor), AMB-SUPPORT-EV-001 (EVS Closet),
--   AMB-SUPPORT-IT-001 (IT/Comm Room), AMB-SUPPORT-LOCK-001 (Half-Height
--   Lockers).
--
-- Also not included -- rooms with no taxonomy row yet (see conversation):
--   "Arrival, Patient Support", "PAR Breakdown".
--
-- AMB-CLINIC-ARR-001 and AMB-ROOM-EX-001 previously held placeholder
-- "Example content." descriptions from 003_example_room_content.sql;
-- this replaces them with the real guideline text.

UPDATE rooms SET description =
  'As the first impression of the patient visit, the Arrival Zone is designed to communicate attibutes that refelect our Hello humankindness brand. A warm, welcoming aesthetic includes the use of rich materials, including natural wood and wool acoustic pendants. Free from the distraction of incoming calls, individual desks break down the scale of this otherwise imposing monument creating a more intimate interaction. Transaction tops are formed to fit the human body and create distinctive functional zones. Each desk is designed with a full complement of technology to serve its funtion and provide an expedited check-in process.'
  WHERE taxonomy_id = 'AMB-CLINIC-ARR-001';

UPDATE rooms SET description =
  'Located near or adjacent to the Check-in zone, the ''Hello Center'' offers a moment of hospitality with natural materials, a curation of accessories presented on a soild oak floating shelf. Built in trash/recycling and storage hides clutter while a pull up counter with built-in power access provides a touchdown experience for patients and their families. Beautiful art and engage the senses and enhance the impression of this amenity.'
  WHERE taxonomy_id = 'AMB-CLINIC-ARR-002';

UPDATE rooms SET description =
  'Some Clinics may require a stand-alone, patient-facing Scheduler function for complex scheduling of Diagnostics and Procedures. Scheduler(s) are typically located adjacent to Check-in desks, allowing shared use of the Work/Copy room. This location captures patients upon leaving the clinic to ensure convenience and a positive patient experience.'
  WHERE taxonomy_id = 'AMB-CLINIC-SCHED-001';

UPDATE rooms SET description =
  'A Subwait Zone is provided where overall square footage allows and/or modality requires. Commonly used in Pediatrics and Specialty Clinics as overflow and family pause amenity.'
  WHERE taxonomy_id = 'AMB-CLINIC-SUBWAIT-001';

UPDATE rooms SET description =
  'The Work Copy room is intended to function as both a space for off-line work, phone calls and a ''safe room'' in the event of an emergency. Place this room directly adjacent to Check-in. Locate door out of line-of-sight from patient check-in functions to create an uncluttered environment. Minimum size shown; Increase the room size to accommodate related functions or Staff touchdown.'
  WHERE taxonomy_id = 'AMB-CLINIC-WCOPY-001';

UPDATE rooms SET description =
  'The Business Hub is desiged to provide a central place for off-line work, printing, fax & copy and emergency supplies including AED and O2 tanks. Lowering the Care Team facing wall allows visibility across a longer length of the overall Care Team zone, while containing clutter.'
  WHERE taxonomy_id = 'AMB-SUPPORT-BH-001';

UPDATE rooms SET description =
  'The Clean | Meds Zone is designed to provide the par-level supply, medication and refrigeration needs for a thriving Primary Care or Specialty Care Clinic. Staff safety is enhanced by locating this functional space in a central location within the Care Team Zone and providing an eye washer at the clean sink. A half-height wall enhances visibility across the Care Team Zone.'
  WHERE taxonomy_id = 'AMB-SUPPORT-CM-001';

UPDATE rooms SET description =
  'Conference Rooms are designed as multi-purpose spaces to accommodate a variety of functions including staff meetings, patient group exam, training and education classes. The space may be located in either on-stage of off-stage areas. When on-stage, the room will have a 2-door entry, allowing flow by staff from the off-stage Care Team Zone. The space will be provided with white boards, built-in monitor, a service credenza, and undercounter refrigerator.'
  WHERE taxonomy_id = 'AMB-ROOM-CO-001';

UPDATE rooms SET description =
  'Designed within the Standard Exam Room module, this room includes on-stage and off-stage doors for patient access and provider safety. Lounge seating accommodates one to three patients and family members. A 55” display monitor is provided for review of diagnostic results and education modules. Soft, dimmable lighting creates a calming atmosphere, and swing doors ensure acoustic privacy.'
  WHERE taxonomy_id = 'AMB-ROOM-CN-001';

UPDATE rooms SET description =
  'Designed within the Standard Exam Room module, this room includes on-stage and off-stage doors for patient access and provider safety. Lounge seating accommodates one to three patients and family members. A provider chair, workstation, and printer support clinical sessions. Soft, dimmable lighting creates a calming atmosphere, and swing doors ensure acoustic privacy.'
  WHERE taxonomy_id = 'AMB-ROOM-CN-002';

UPDATE rooms SET description =
  'The exam room is intended to inspire a consult-quality, clutter-free experience with a warm palette, adjustable light levels and biophilic art. Furnishings support eye to eye contact to remove barriers associated with charting. The 2-door model zones the room into patient and provider areas, supporting staff safety and allowing the clinical team to circulate in and out of the room without crossing patient or family personal space. The Provider Zone provides a hand wash sink, sequestered trash, a PAR level supply cabinet and mobile technology. The patient zone contains a scale/stadiometer for private vitals, and settee designed to accommodate side by side seating for the patient and a family member. All components of the room meet ADA requirements to accommodate both staff and patient accessibility.'
  WHERE taxonomy_id = 'AMB-ROOM-EX-001';

UPDATE rooms SET description =
  'The exam room is intended to inspire a consult-quality, clutter-free experience with a warm palette, adjustable light levels and biolophilic art. Furnishings support eye to eye contact to remove barriers associated with charting. The 1-door model locates the charting function adjacent to the door, supporting staff safety. The Provider Zone provides a hand wash sink, sequestered trash, and a PAR level supply cabinet. The patient zone contains a scale/stadiometer for private vitals, and settee designed to accommodate side by side seating for the patient and a family member. All components of the room meet ADA requirements to accommodate both staff and patient accessibility.'
  WHERE taxonomy_id IN ('AMB-ROOM-EX-002', 'AMB-ROOM-EX-003');

UPDATE rooms SET description =
  'To provide privacy and convenience for Staff, a nursing mothers room is an important amenity for each Clinic. The space is designed with a sink, integrated trash, locked cabinetry for personal items, and an undercounter refrigerator. The furnishing, art and lighting creates a warm, welcoming space that is intended to function as a flexible space for all Staff use as an area of respite.'
  WHERE taxonomy_id = 'AMB-SUPPORT-MOM-001';

UPDATE rooms SET description =
  'The Private Flow Station is intended to provide a flex space for use as a Single Provider Office, Telehealth Room, or Staff Quiet Space. Glazing is essential to the comfort of this space with a exterior window location preferred. Provide glazing in door to direct borrowed light into adjacent space.'
  WHERE taxonomy_id = 'AMB-ROOM-OF-001';

UPDATE rooms SET description =
  'The Shared Office design is intended to provide a comfortable space for 2 staff members to co-office. To enhance a sense of privacy and personalization, a tall acoustic panel between desks and individual wardrobe cabinets are provided. Sit/Stand tables with space for 2 desktop monitors, ergonomic seating and access to natural light bring comfort and a sense of wellness to this space.'
  WHERE taxonomy_id = 'AMB-ROOM-OF-002';

UPDATE rooms SET description =
  'The Type 3 office design is intended to support the workflow of a Medical Director, or related position, where space for private conversations is required. The space includes a sit/stand workstation, personal storage and 2 accent chairs. Ergonomic seating and access to natural light bring comfort and a sense of wellness to this space.'
  WHERE taxonomy_id = 'AMB-ROOM-OF-003';

UPDATE rooms SET description =
  'The Type 4 office design is intended to support the workflow of a Clinic Manager, Finacial Counselor or other position requiring privacy and interaction across a desktop. The space includes a sit/stand workstation, personal storage and 2 accent chairs. Ergonomic seating and access to natural light bring comfort and a sense of wellness to this space.'
  WHERE taxonomy_id = 'AMB-ROOM-OF-004';

UPDATE rooms SET description =
  'The PAR Storage space is sized to support supply storage for a 10,000 sf Primary Care Clinic. Supplies are stored on open storage shelves and wall-mounted kan ban bins. Clean Linen storage, when required, is stored in cabinetry at the back of each pod in the Equipment Alcoves.'
  WHERE taxonomy_id = 'AMB-SUPPORT-PAR-001';

UPDATE rooms SET description =
  'The POC (Point of Care) Testing for Blood Zone is designed to provide ''just in time'' processing and ''preparation for transport'' of blood samples. Alignment with POCT, Urine co-locates soiled processing functions and reduces travel distances for staff.'
  WHERE taxonomy_id = 'AMB-SUPPORT-POCT-002';

UPDATE rooms SET description =
  'The POC (Point of Care) Testing for Urine Zone designed to provide ''just in time'' processing and ''preparation for transport'' of urine specimens. Alignment with POC Testing, Blood co-located soiled functions and reduces travel distances for staff. Urine specimens are pushed through a specimen pass thru by the patient and ''received'' on the off-stage side by staff. Quick dips can be done on the counter or prepped and stored for transport. Separate sinks are provided for Urine and Blood disposal.'
  WHERE taxonomy_id = 'AMB-SUPPORT-POCT-001';

UPDATE rooms SET description =
  'The Type 1 Procedure Room provides the function of a high-use treatment space for primary care and specialties. The Provider zone provides a hand wash sink, space for sequestered soiled linen and trash, PAR level supplies, an ultrasound machine, procedure cart and mobile technology for charting.'
  WHERE taxonomy_id = 'AMB-ROOM-PROC-001';

UPDATE rooms SET description =
  'The Type 2 Procedure Room provides the flexibility of an exam room, as well as a procedure and treatment space for primary care and specialties. The 2-door model zones the room into patient and provider areas, supporting safety, allowing the clinical team to circulate in and out of the room without crossing patient or family personal space. The patient exam chair provides a similar posture to a typical exam room to enhance the patient/provider interaction. The Provider zone provides a hand wash sink, sequestered trash, PAR level supplies, an ultrasound machine, procedure cart and mobile technology for charting.'
  WHERE taxonomy_id = 'AMB-ROOM-PROC-002';

UPDATE rooms SET description =
  'The Staff Lounge is designed and furnished for flexibility of use. The intention of the design is to function as both a space for meals and out of flow respite, as well as a ''3rd place'' for relaxed, out of flow work. The space contains a kitchen zone with full size refrigerator and storage for food and supplies. An island accommodates a discreet location for trash and recycling, and bar height seating. Additional furnishings will provide cafe seating and lounge seating with laptop side table(s) adjacent to power supplies.'
  WHERE taxonomy_id = 'AMB-SUPPORT-SL-001';

UPDATE rooms SET description =
  'Patient Toilets are located back to back with the POCT, Urine zones in the off-stage core. Specimens are pushed through a specimen pass thru by the patient and ''received'' on the off-stage side by staff. This toilet is located as the first stop in the Patient Circulation corridor to capture a specimen before the start of the visit. In Convergent Flow clinic models, the Patient Toilet is located at the back of the Patient Corridor to provide a pass thru into the Care Team Core located at the back of the Clinic.'
  WHERE taxonomy_id = 'AMB-TOILET-PT-001';

UPDATE rooms SET description =
  'Public (Family) Toilets are generously sized to accommodate accessibility for wheelchairs, walkers and strollers. The space is appointed with enhanced finishes and lighting to create a modern and clean impression.'
  WHERE taxonomy_id = 'AMB-TOILET-FT-001';

UPDATE rooms SET description =
  'Staff Toilets are sized and finished to provide accessible, clean and maintainance friendly functionality. The preferred quantity is (1) per pod, co-located with back-to-back plumbing and waste lines in a central location in the out-of-flow zone between pods. A convenience bottle filler is located in this zone.'
  WHERE taxonomy_id = 'AMB-TOILET-ST-001';

UPDATE rooms SET description =
  'The Zen Den provides a flex space for use by Staff who do not have an office. The space is provided a comfortable recliner, warm palette, biophilic art and access to natural light to provide a space for privacy and respite.'
  WHERE taxonomy_id = 'AMB-SUPPORT-ZEN-001';
