-- ============================================================
-- Profile fields: job title + region
-- ============================================================
-- The new Profile page (opened from the header user-icon menu) shows
-- full name, title, region, and email -- title/region didn't exist on
-- users before. Nullable: optional for both internal and external
-- users, shown as "--" on the Profile page until set.

ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS region TEXT;
