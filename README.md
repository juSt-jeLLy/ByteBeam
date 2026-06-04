# Bytebeam Fleet Management Dashboard

Map-first fleet operations prototype for the Bytebeam Frontend Intern Assignment. The app helps an internal operations user monitor vehicles, inspect recent routes, compare trip efficiency, and triage obvious vehicle-health or usage alerts.

## Live Demo

- Deployment URL: Add deployed Vercel/Netlify URL before submission.
- Demo login: `ops@bytebeam.local` / `bytebeam-demo`

## Product Scope

- Protected login experience with Supabase Auth when configured.
- Review-friendly local demo mode when Supabase environment variables are missing.
- Central fleet map using Leaflet and OpenStreetMap tiles.
- Vehicle status queue with driver, energy, last seen, speed, and alert context.
- Vehicle detail panel with current telemetry, ignition, route, and open issue context.
- Route-history inspection with trip polylines.
- Route playback controls for inspecting the selected vehicle movement trace.
- Fleet KPIs for active vehicles, open alerts, distance, idle time, overspeed events, and average energy.
- Trip analytics with sortable/searchable/date-filtered trip log and CSV export.
- Alert queue for fuel, overspeed, offline, and operational improvement events with acknowledge/resolve actions.
- Dark mode and responsive desktop/tablet/mobile layout.

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- TanStack Router
- TanStack Query
- Zustand
- Supabase Auth + Postgres + Realtime
- Leaflet + React Leaflet
- Recharts
- shadcn-style local UI primitives

## Local Setup

```bash
npm install
npm run dev
```

The app runs without Supabase by falling back to seeded fleet data and demo login. To test Supabase Auth and persisted backend data, create a `.env` file:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then create a Supabase user matching the credentials you want to use, or update the README demo credentials before submitting.

## Supabase Backend Notes

Schema and seed SQL are included in `supabase-schema.sql`.

Tables:

- `vehicles`: current vehicle profile, driver, status, location, energy, odometer, and last-seen telemetry.
- `trips`: route summary metrics plus `route_points` JSONB for map polylines.
- `fleet_alerts`: vehicle-health and usage exceptions with severity and workflow status.
- `telemetry_points`: persisted telemetry events for route traces and latest vehicle snapshots.

Main tradeoff: route points are stored as JSONB inside each trip for compact route rendering, while `telemetry_points` models how raw telemetry would be persisted. In production, high-volume telemetry would likely move to a dedicated time-series pipeline or partitioned table, while trips would retain aggregate fields for fast dashboard queries.

Realtime is enabled for fleet tables. Supabase database events invalidate the TanStack Query fleet cache, with throttling to avoid refetch storms during bursty updates.

Client-side search uses debouncing, and shared UI state such as selected vehicle, trip filters, and sorting is held in Zustand.

The frontend queries Supabase first and falls back to local seed data if tables are not available, so reviewers can still evaluate the UI quickly.

## AI Usage

AI-assisted development was used to interpret the assignment brief, plan the fleet-management prototype, generate fleet-domain seed data, and review implementation gaps against the PDF. Exported notes are included in `AI_CHAT_LOGS.md`.

## Scripts

- `npm run dev`: start local dev server
- `npm run build`: production build
- `npm run preview`: preview production build
- `npm run lint`: run ESLint
- `npm run format`: run Prettier

## Submission Checklist

- Add the deployed app URL above.
- Include source code, this README, `supabase-schema.sql`, and `AI_CHAT_LOGS.md`.
- Do not include `node_modules`, `dist`, caches, or bulky generated files.
- ZIP size must stay under 100 MB.
- Upload only through the Bytebeam submission form, not GitHub.
