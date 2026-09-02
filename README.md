# Design Intelligence Platform (DIP)

Interactive web-based reference platform for CommonSpirit Health NRES PDC
ambulatory and acute care facility design guidelines.

## Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Backend:** Supabase (GoTrue auth, PostgREST API, Storage)
- **Database:** PostgreSQL via Supabase (Cloud SQL on GCP in production)
- **Hosting:** Google Cloud Platform — Cloud Run, Cloud Storage, Cloud SQL, Artifact Registry
- **CI/CD:** GitHub Actions → Artifact Registry → Cloud Run
- **Auth:** Google Workspace SSO (internal CSH users) + magic-link email (external architects/contractors) via Supabase GoTrue

## Project structure

```
src/
  app/                      Next.js App Router routes
    (guidelines)/           Guidelines shell (sidebar + header layout)
      ambulatory/           Ambulatory guideline pages
      acute/                Acute guideline placeholder
    api/
      procore/              Server-side Procore API proxy
      anthropic/            Server-side Anthropic API proxy
  components/
    layout/                 Sidebar, Header, ModeToggle
    guidelines/              RoomDataSheet, DrawingViewer, SpecPanel, VersionHistory
    wizard/                 ConsultantWizard
    ui/                     Shared primitives
  lib/
    supabase/               Browser + server Supabase clients
    types/                  Generated + hand-written types
    taxonomy.ts             Taxonomy ID helpers
  styles/
    globals.css             CSH brand tokens

supabase/
  migrations/                Schema migrations
  seed/                       Seed data
```

## Local development

```bash
npm install
cp .env.local.example .env.local   # fill in real values
npm run dev
```

## Key architectural decisions

1. **Edition-locked fidelity.** Rooms are updated in-place across editions, but every
   material change is captured as a full JSONB snapshot in `room_edition_snapshots`.
   A project locked to a given edition always resolves room content via
   `room_as_of_edition()`, which returns the latest snapshot at or before the locked
   edition's date — not the live, possibly newer, row. Rooms changed in a later
   edition than a project's lock are flagged in the UI so teams can review the diff
   and decide whether to incorporate it.
2. **Procore is the system of record** for all project data. DIP stores only
   `procore_project_number` (shared key), `edition_lock_id`, `lock_date`, `lock_event`,
   and `room_types_in_scope`. Everything else is read from the Procore API via
   server-side Next.js API routes only — Procore credentials never reach the browser.
3. **Edition lock triggers at Schematic Design (SD).**
4. **The Anthropic API is called server-side only** (`api/anthropic/route.ts`).
5. **GCP Cloud Storage serves SVG/PNG drawing assets**; `room_drawings.gcs_path`
   stores the full Cloud Storage path.
6. **Furniture, finishes, and equipment are modeled via junction tables**
   (`room_finishes`, `room_equipment`, `room_furniture`) rather than array codes on
   `rooms`, enabling reverse lookups (e.g. "which rooms use RFT-1?") and quantities.
7. **RLS is implemented via Supabase**, using the `current_dip_tier()` and
   `is_admin()` helper functions defined in the schema.
