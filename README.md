# Elements Interactive — Admin Panel Upgrade

This package extends your existing admin login/dashboard into a full CMS-style
admin panel that matches your site's real branding (black `#030213` UI +
red `#910B08` brand accent, Poppins font, same shadcn/ui components).

## What's inside

```
backend/server.js        ← your full server.js with new routes added (drop-in replacement)
frontend-update/src/...  ← only new/changed frontend files, same folder layout as your src.zip
```

## 1. Backend — install

Replace your `backend/server.js` with the one in this package (it's your
original file with additions, nothing removed). New endpoints added:

- `GET /api/settings` (public) / `PUT /api/settings` (admin) / `POST /api/settings/reset` — site branding & theme colors
- `GET /api/admin/dashboard-summary` — stats, trends, activity feed for the dashboard
- `POST /api/users`, `DELETE /api/users/:id` — create/remove team accounts
- `PUT /api/announcements/:id`, `DELETE /api/announcements/:id`
- `DELETE /api/tags/:id`
- Activity logging on project/article create & delete, user creation, settings changes

No new npm packages are required — everything uses your existing `mongodb`,
`bcrypt`, and `jsonwebtoken` dependencies. Just restart your backend after
replacing the file.

## 2. Frontend — merge

Copy the folders from `frontend-update/src/` into your project's `src/`,
overwriting `App.tsx`, `AdminLogin.tsx`, `AdminSignup.tsx`, and
`styles/theme.css`, and adding the new `app/adminApi.ts`,
`app/contexts/SiteSettingsContext.tsx`, `app/components/admin/*`, and
`app/pages/admin/*` files.

Your project already has every npm package this needs (`recharts`, `sonner`,
`lucide-react`, `react-router-dom`, shadcn/ui) — nothing new to install.

Your old `src/app/pages/AdminDashboard.tsx` is no longer routed (replaced by
the new `pages/admin/*` set) — safe to delete once you've confirmed
everything works, or keep it as a reference.

## 3. What you get

**Admin shell** — collapsible sidebar (dark, brand-red active state), topbar
with user avatar, "View Live Site" and sign-out. Fully responsive.

**Dashboard** (`/admin/dashboard`) — stat cards for projects/articles/labs/
tags/users/applications, a 14-day applications trend chart, a status
breakdown pie chart, recent items, and a live activity feed.

**Applications** (`/admin/applications`) — your original leads/applicants
manager, rebuilt with a slide-over detail panel: status workflow, internal
notes, delete.

**Projects** (`/admin/projects`) — full CRUD: title, description, cover
image, video, status (draft/review/published), tags, lab assignment, lead
researcher, featured toggle.

**Articles & News** (`/admin/articles`) — full CRUD with slug, category,
content, cover image, publish date.

**Labs** (`/admin/labs`) — card-based CRUD for research labs.

**Tags** (`/admin/tags`) — add/remove tags used across projects & articles.

**Announcements** (`/admin/announcements`) — full CRUD.

**Users & Roles** (`/admin/users`) — create accounts, change roles
(admin/researcher/student), reset passwords, delete (can't delete yourself).

**Site & Theme Settings** (`/admin/settings`) — the big one:
- **Colors** — every theme color (primary, accent, background, text, muted,
  destructive) with a color picker + hex input, plus corner radius. Changes
  **preview live across the entire site** as you edit, and persist to the
  database on Save so they apply for every visitor.
- **Branding** — site name, tagline, logo text, favicon URL, maintenance
  flag.
- **Typography** — pick from several web-safe font families.
- **Social** — Twitter/Instagram/YouTube/LinkedIn links.
- A live preview panel on the right shows buttons/cards/text in your chosen
  palette before you save. "Reset" restores the shipped defaults.

**Sign-in** — `/admin/login` and `/admin/signup` restyled with your real
logo. Signup keeps your existing safeguard: only the first registered
account becomes admin; everyone after that needs an existing admin to
create their account (via Users & Roles → New User) or role gets set by an
admin.

## Notes / things to double check after merging

- The theme colors are applied via CSS custom properties
  (`--primary`, `--accent-brand`, etc.) set on `<html>` at runtime. If any
  component hard-codes a color instead of using these variables, it won't
  respond to the theme editor — worth a quick visual sweep after merging.
- `adminApi.ts` reads the JWT from `localStorage.getItem('token')`, matching
  your existing auth pattern.
- I couldn't run a full `npm run build` in this environment since only your
  `src/` and `backend/` folders were uploaded (no root `package.json` /
  `vite.config`), so please do a local build/typecheck pass after merging —
  I've double-checked imports and endpoint contracts by hand, but a real
  compile is the final word.
