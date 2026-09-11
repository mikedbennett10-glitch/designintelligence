-- ============================================================
-- Seed: Training modules (Phase E)
-- ============================================================
-- Three modules grounded in DIP's actual built functionality (not
-- aspirational features): platform orientation, project mode/edition
-- locking, and the deviation workflow. Each has reading content, a
-- passing score, at least one requirement, and a short multiple-choice
-- quiz.

-- ------------------------------------------------------------
-- 1. New user orientation — required for everyone at provisioning.
-- ------------------------------------------------------------

INSERT INTO training_modules (module_code, module_type, title, description, content_body, passing_score)
VALUES (
  'NEW_USER_ORIENTATION',
  'new_user',
  'Welcome to the Design Intelligence Platform',
  'An introduction to DIP: what it replaces, how to find guideline content, and where to go for help.',
  'The Design Intelligence Platform (DIP) replaces the static PDF binders that used to hold CommonSpirit Health''s design standards. Room data sheets, finish schedules, equipment schedules, and furniture/FF&E schedules now live in one searchable, always-current place.

When you sign in, you land on your home page: a personalized dashboard showing the projects assigned to you, plus quick links into each guideline track (Ambulatory today; Acute and Building Performance are coming). Use the top nav to switch between them, or the "Home" link to get back to your dashboard at any time.

Every room data sheet page shows the room''s zone, size, MEP/systems notes, decision logic, drawings, and version history. If you''re working a project that has its edition locked, the room page shows that locked snapshot by default — the standard as it existed when your project locked in — with an option to compare against the current guideline.

If you think a standard needs to change, you have two options. If you''re working inside an active project (in Project mode), you can submit a formal deviation request tied to that project. If you''re just browsing and want to flag something more generally, you can suggest a change to the current standard without needing a project at all. Either way, an administrator reviews it.

Questions about access or anything you can''t find? Reach out to the Design & Architecture team.',
  80.00
);

INSERT INTO training_requirements (module_id, required_for_tier, required_within_days, trigger_event)
SELECT id, 'all', 14, 'provisioning' FROM training_modules WHERE module_code = 'NEW_USER_ORIENTATION';

INSERT INTO training_quiz_questions (module_id, sort_order, question_text, choices, correct_choice_id)
SELECT id, 1,
  'What does DIP replace as the primary source for design standards?',
  '[{"id":"a","text":"Static PDF binders"},{"id":"b","text":"Procore RFIs"},{"id":"c","text":"Email threads"},{"id":"d","text":"Nothing — it''s a brand-new requirement"}]'::jsonb,
  'a'
FROM training_modules WHERE module_code = 'NEW_USER_ORIENTATION';

INSERT INTO training_quiz_questions (module_id, sort_order, question_text, choices, correct_choice_id)
SELECT id, 2,
  'Where do you go to see the projects assigned to you?',
  '[{"id":"a","text":"The Finishes repository"},{"id":"b","text":"The home page"},{"id":"c","text":"The admin panel"},{"id":"d","text":"Version History"}]'::jsonb,
  'b'
FROM training_modules WHERE module_code = 'NEW_USER_ORIENTATION';

INSERT INTO training_quiz_questions (module_id, sort_order, question_text, choices, correct_choice_id)
SELECT id, 3,
  'If you disagree with a standard on a specific project, what should you do?',
  '[{"id":"a","text":"Ignore it"},{"id":"b","text":"Email the Design team informally"},{"id":"c","text":"Submit a deviation request from the room''s page"},{"id":"d","text":"Edit the room data sheet yourself"}]'::jsonb,
  'c'
FROM training_modules WHERE module_code = 'NEW_USER_ORIENTATION';

INSERT INTO training_quiz_questions (module_id, sort_order, question_text, choices, correct_choice_id)
SELECT id, 4,
  'True or false: any signed-in user can suggest a change to the current standard, not just someone with an active project.',
  '[{"id":"a","text":"True"},{"id":"b","text":"False"}]'::jsonb,
  'a'
FROM training_modules WHERE module_code = 'NEW_USER_ORIENTATION';

-- ------------------------------------------------------------
-- 2. Project mode & edition locking — required for external project
--    partners and administrators when assigned to a project.
-- ------------------------------------------------------------

INSERT INTO training_modules (module_code, module_type, title, description, content_body, passing_score)
VALUES (
  'PROJECT_MODE_EDITION_LOCK',
  'topic',
  'Project Mode and Edition Locking',
  'How edition locking protects your project from standards changing underneath it, and how to work with pending changes.',
  'Design standards keep evolving — new editions publish periodically. To keep a project team working from a stable, known standard, every project locks to a specific edition, typically at Schematic Design.

Once locked, room pages viewed through that project (Project mode) show the room exactly as it existed at that edition — not whatever the live, current version says. This is edition-locked fidelity: your project''s standard doesn''t move under you.

If a room''s content changes in a later edition than your project''s lock, the platform flags it. You''ll see a banner on the affected room and a summary on the project''s detail page listing exactly what changed. Your team reviews the change and decides whether to incorporate it — nothing changes automatically.

Only an Administrator can lock a project to the current edition, or later re-lock ("adopt") it to a newer one if the team decides to catch up. To enter Project mode, go to the project''s detail page and click "Enter project mode." While in Project mode, a banner appears across the top of every page confirming which project you''re viewing through. If you ever need to double-check what the standard looks like today instead of your locked snapshot, use "Compare against current guideline" on the room page — it''s a one-way look, not a change to your lock.',
  80.00
);

INSERT INTO training_requirements (module_id, required_for_tier, required_within_days, trigger_event)
SELECT id, 'external_project', 7, 'project_assignment' FROM training_modules WHERE module_code = 'PROJECT_MODE_EDITION_LOCK';

INSERT INTO training_requirements (module_id, required_for_tier, required_within_days, trigger_event)
SELECT id, 'administrative', 7, 'project_assignment' FROM training_modules WHERE module_code = 'PROJECT_MODE_EDITION_LOCK';

INSERT INTO training_quiz_questions (module_id, sort_order, question_text, choices, correct_choice_id)
SELECT id, 1,
  'When is a project typically locked to an edition?',
  '[{"id":"a","text":"At Schematic Design"},{"id":"b","text":"At final occupancy"},{"id":"c","text":"Automatically at registration"},{"id":"d","text":"Never — it always tracks the current edition"}]'::jsonb,
  'a'
FROM training_modules WHERE module_code = 'PROJECT_MODE_EDITION_LOCK';

INSERT INTO training_quiz_questions (module_id, sort_order, question_text, choices, correct_choice_id)
SELECT id, 2,
  'If a room''s standard changes in a later edition than your project''s lock, what happens?',
  '[{"id":"a","text":"Nothing — you''ll never know"},{"id":"b","text":"The room is automatically deleted"},{"id":"c","text":"The platform flags the change for your project to review"},{"id":"d","text":"Your project is automatically re-locked"}]'::jsonb,
  'c'
FROM training_modules WHERE module_code = 'PROJECT_MODE_EDITION_LOCK';

INSERT INTO training_quiz_questions (module_id, sort_order, question_text, choices, correct_choice_id)
SELECT id, 3,
  'Who can lock or re-lock (adopt) a project to an edition?',
  '[{"id":"a","text":"Any signed-in user"},{"id":"b","text":"Only Administrators"},{"id":"c","text":"Only the original project submitter"},{"id":"d","text":"External Review partners"}]'::jsonb,
  'b'
FROM training_modules WHERE module_code = 'PROJECT_MODE_EDITION_LOCK';

INSERT INTO training_quiz_questions (module_id, sort_order, question_text, choices, correct_choice_id)
SELECT id, 4,
  'What does "Compare against current guideline" do on a room page?',
  '[{"id":"a","text":"Deletes the locked edition"},{"id":"b","text":"Lets you view the room as it stands today instead of your project''s locked snapshot"},{"id":"c","text":"Automatically submits a deviation"},{"id":"d","text":"Nothing — it isn''t a real feature"}]'::jsonb,
  'b'
FROM training_modules WHERE module_code = 'PROJECT_MODE_EDITION_LOCK';

-- ------------------------------------------------------------
-- 3. Submitting deviations — required for external project partners.
-- ------------------------------------------------------------

INSERT INTO training_modules (module_code, module_type, title, description, content_body, passing_score)
VALUES (
  'SUBMITTING_DEVIATIONS',
  'topic',
  'Submitting Deviation Requests',
  'The difference between a project deviation and a general suggestion, and what happens after you submit one.',
  'DIP gives you two ways to challenge a standard, depending on context.

If you''re working inside a specific project (in Project mode), use "Submit a deviation request for this room." This ties the request to your project and its locked edition, and it''s what shows up on your project''s dashboard and in the admin review queue as project-specific.

If you''re just browsing guidelines and see something you think should change platform-wide — not specific to one project — use "Suggest a change to the current standard" instead. This works from any room page, doesn''t require an active project, and is reviewed the same way, just labeled as a general suggestion rather than tied to a project.

Either way, fill in which standard you''re deviating from, your proposed alternative, and a clinical or operational justification. An administrator reviews it and responds with one of three outcomes: Approved, Approved with conditions, or Denied — with a target response time of 5 business days.

One more thing worth knowing: if the same standard racks up 3 or more approved deviations within an edition cycle, it gets flagged internally as a CPI signal — a pattern worth reviewing for whether the standard itself should change. Your deviation requests aren''t just one-off exceptions; they''re one of the main ways the standard actually improves over time.',
  80.00
);

INSERT INTO training_requirements (module_id, required_for_tier, required_within_days, trigger_event)
SELECT id, 'external_project', 14, 'project_assignment' FROM training_modules WHERE module_code = 'SUBMITTING_DEVIATIONS';

INSERT INTO training_quiz_questions (module_id, sort_order, question_text, choices, correct_choice_id)
SELECT id, 1,
  'What''s the difference between "Submit a deviation request" and "Suggest a change to the current standard"?',
  '[{"id":"a","text":"There is no difference"},{"id":"b","text":"One is tied to your active project''s locked edition; the other is a general suggestion not tied to any project"},{"id":"c","text":"Only administrators can suggest changes"},{"id":"d","text":"Deviations are always approved automatically"}]'::jsonb,
  'b'
FROM training_modules WHERE module_code = 'SUBMITTING_DEVIATIONS';

INSERT INTO training_quiz_questions (module_id, sort_order, question_text, choices, correct_choice_id)
SELECT id, 2,
  'What is the target response time for a deviation request?',
  '[{"id":"a","text":"24 hours"},{"id":"b","text":"5 business days"},{"id":"c","text":"30 days"},{"id":"d","text":"There is no target"}]'::jsonb,
  'b'
FROM training_modules WHERE module_code = 'SUBMITTING_DEVIATIONS';

INSERT INTO training_quiz_questions (module_id, sort_order, question_text, choices, correct_choice_id)
SELECT id, 3,
  'What are the possible outcomes of a deviation review?',
  '[{"id":"a","text":"Approved, Approved with conditions, or Denied"},{"id":"b","text":"Approved or Denied only"},{"id":"c","text":"Pending forever"},{"id":"d","text":"Escalated to Procore automatically"}]'::jsonb,
  'a'
FROM training_modules WHERE module_code = 'SUBMITTING_DEVIATIONS';

INSERT INTO training_quiz_questions (module_id, sort_order, question_text, choices, correct_choice_id)
SELECT id, 4,
  'If the same standard gets 3 or more approved deviations in a cycle, what happens?',
  '[{"id":"a","text":"Nothing special"},{"id":"b","text":"It''s automatically deleted from the guideline"},{"id":"c","text":"It''s flagged as a CPI signal — a candidate for reviewing the standard itself"},{"id":"d","text":"The submitter is banned from submitting more"}]'::jsonb,
  'c'
FROM training_modules WHERE module_code = 'SUBMITTING_DEVIATIONS';
