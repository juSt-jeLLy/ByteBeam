# Bytebeam Fleet Operations Dashboard

A protected, map-first fleet management prototype built for the Bytebeam Frontend Intern Assignment. The product is designed for an internal operations user who needs to monitor vehicle location, inspect recent movement, review trip behavior, and act on vehicle-health or usage exceptions.

## Live Demo

- Deployment URL: add the deployed Vercel/Netlify/Render URL before submission
- Demo login: `ops@bytebeam.local`
- Demo password: `bytebeam-demo`

## Product Summary

This is not a marketing page. It is an authenticated operations workspace for a connected-vehicle fleet.

The app helps answer:

- Where are vehicles right now?
- Which vehicles need attention?
- What did a selected vehicle recently do?
- Are there fuel/battery, offline, idle, or overspeed issues?
- Which routes and trips are operationally inefficient?

## Core Features

- Supabase Auth login with protected dashboard routes.
- Fleet dashboard with KPIs, central map, vehicle queue, selected-vehicle context, and trip charts.
- Live Map page that behaves as a focused vehicle inspection page.
- Fleet-wide dashboard map and selected-vehicle-only Live Map behavior.
- Leaflet/OpenStreetMap integration with vehicle markers, selected route polyline, and route playback.
- Vehicle detail panel with driver, location, coordinates, odometer, ignition, energy, latest telemetry, recent route, and open issues.
- Alert workflow with acknowledge and resolve actions.
- Alerts page with server-side status filters, debounced search, pagination, and server-side counts.
- Trips page with server-side search, date filters, sorting, pagination, and chart scope controls.
- Vehicle queue with debounced server-side search and infinite scrolling.
- Supabase Realtime subscription for vehicles, trips, alerts, and telemetry.
- TanStack Query cache invalidation throttled during realtime bursts.
- Zustand store for shared UI state such as selected vehicle, search text, filters, pagination, and chart limits.
- CSV export for trip efficiency review.
- Responsive dark/light UI.

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- TanStack Router
- TanStack Query
- Zustand
- Supabase Auth, Postgres, RLS, and Realtime
- Leaflet + React Leaflet
- Recharts
- shadcn-style local UI primitives

## Local Setup

Install dependencies:

```bash
npm install
```

Create `.env`:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
```

Run the app:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Supabase Setup

1. Create a Supabase project.
2. Open the Supabase SQL editor.
3. Run `supabase-schema.sql`.
4. Enable Realtime for the included tables if it is not already enabled by the SQL script.
5. Create the demo auth user in Supabase Auth:

- Email: `ops@bytebeam.local`
- Password: `bytebeam-demo`

The app requires Supabase configuration. It does not silently fall back to local mock fleet data.

## Backend Model

The database schema is included in `supabase-schema.sql`.

Tables:

- `vehicles`: current fleet entities, driver assignment, operating status, current position, fuel/battery, ignition, odometer, and last-seen time.
- `trips`: route summaries with distance, duration, speed, idle time, halts, overspeed events, and `route_points` JSONB for route rendering.
- `fleet_alerts`: vehicle-health and usage exceptions with severity and workflow status.
- `telemetry_points`: raw-ish telemetry samples for latest snapshot and route context.

RLS policies allow authenticated users to read fleet data and update alert workflow status.

## Data And Query Decisions

The app avoids fetching the whole database for high-volume screens.

- Dashboard uses capped latest operational snapshots for fleet overview.
- Vehicle Queue uses Supabase range pagination, debounced server-side search, and TanStack `useInfiniteQuery`.
- Trips use server-side search, date filters, sorting, and 10-row pagination.
- Alerts use server-side status filters, debounced search, 10-row pagination, and count-only queries for KPI cards.
- Live Map hydrates the selected vehicle separately instead of loading the full dashboard dataset.
- Search indexes use Postgres trigram indexes for vehicle and trip text fields.

Remaining client-side filtering is only applied to already-limited query results or selected-vehicle snapshots, not unbounded database tables.

## Realtime Behavior

Supabase Realtime subscribes to:

- `vehicles`
- `trips`
- `fleet_alerts`
- `telemetry_points`

The subscription is mounted once inside the authenticated app shell. On database events, the app throttles TanStack Query invalidation and refreshes:

- dashboard fleet snapshot
- vehicle queue pages
- selected vehicle snapshot
- trip pages
- alert pages
- alert counts

In DevTools, a `101 Pending` WebSocket request is expected. That means the realtime socket is open.

## Product Decisions

- The dashboard remains fleet-wide because operations users need broad situational awareness.
- The Live Map page is vehicle-focused: selecting a vehicle shows only that vehicle on the map, its route, telemetry, and actionable alerts.
- Route points are stored in `trips.route_points` JSONB for simple prototype rendering.
- `telemetry_points` still exists to model persisted telemetry history.
- Charts use selectable scopes such as Top 12, Top 25, and Top 50 to stay readable with large datasets.
- Alert workflow is intentionally small: open → acknowledged → resolved.

## Tradeoffs And Production Next Steps

This is a credible prototype, not a production telemetry platform.

If this became production, I would add:

- viewport-based map queries instead of loading a fixed latest snapshot
- database views or RPC functions for aggregated dashboard KPIs
- partitioned/time-series telemetry storage
- role-based access control for dispatchers, admins, and viewers
- organization/team scoping in RLS policies
- stronger audit history for alert workflow actions
- route playback backed by telemetry ranges instead of compact JSONB trip paths

## AI Usage

AI-assisted development was used thoughtfully for:

- interpreting the assignment scope
- turning the brief into a fleet operations product plan
- designing the Supabase schema and plausible seed records
- identifying old-assignment leftovers
- reviewing gaps around realtime, search, pagination, and scale
- improving README and submission clarity

AI notes are included in `AI_CHAT_LOGS.md`.

## Scripts

- `npm run dev`: start the local Vite server
- `npm run build`: create a production build
- `npm run preview`: preview the production build
- `npm run lint`: run ESLint
- `npm run format`: run Prettier

## Submission Checklist

- Add the deployed app URL in this README.
- Include source code, `README.md`, `supabase-schema.sql`, and `AI_CHAT_LOGS.md`.
- Do not include `node_modules`, `dist`, `.tanstack`, caches, screenshots, or bulky generated files.
- Keep the ZIP under 100 MB.
- Upload the ZIP through the Bytebeam assignment form.
