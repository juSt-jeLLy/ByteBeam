# Bytebeam Fleet Operations Dashboard

A protected, map-first fleet operations dashboard built for the **Bytebeam Frontend Assignment**.

The product is designed for an internal operations team monitoring connected vehicles: where vehicles are, what they recently did, and which vehicle-health or usage issues need action.

This is intentionally **not a marketing page**. It is the product surface an operations user would actually open during a shift.

## Live Demo

- Deployed app: https://byte-beam-pied.vercel.app/
- Demo email: `ops@bytebeam.local`
- Demo password: `bytebeam-demo`

## Assignment Interpretation

Bytebeam works with connected devices and telemetry. The assignment asks for a lightweight fleet dashboard using realistic persisted data, Supabase backend/auth, a protected dashboard, and a map-centered experience.

I treated the brief as an internal operations problem:

- Operators need fast fleet awareness, not decorative landing content.
- The map should be central because location and route history are the most important connected-vehicle context.
- The UI should prioritize operational questions: vehicle location, route behavior, recent trips, driver/vehicle status, low fuel or battery, offline vehicles, overspeeding, idle time, and alert follow-up.
- The backend should model a real fleet domain instead of feeding static mock cards.
- The product should stay coherent and reviewable rather than becoming a large unfinished scaffold.

## What Was Built

### 1. Authenticated Operations Workspace

The app starts with a login page and protects the fleet dashboard behind Supabase Auth.

Why it exists:

- Internal fleet data should not be publicly visible.
- Reviewers can test a realistic login flow with the demo user.
- Any Supabase Auth user created in the project can sign in; the frontend is not hardcoded to only the demo email.

How it works:

- Supabase client is configured from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- `AuthProvider` reads the current Supabase session and listens for auth changes.
- `AppShell` redirects unauthenticated users to `/login`.
- The app uses Supabase Auth email/password sign-in.

Relevant files:

- `src/features/auth/AuthProvider.tsx`
- `src/features/fleet/pages/login-page.tsx`
- `src/features/fleet/page-models/use-login-page-model.ts`
- `src/features/layout/AppShell.tsx`

### 2. Fleet Dashboard

The dashboard gives the operations user a fleet-wide view.

It shows:

- Fleet size
- Active vehicles
- Open alerts
- Average energy level
- Fleet-wide map
- Vehicle queue
- Selected vehicle detail panel
- Trip utilization chart
- Fleet status chart
- Distance, idle time, and overspeed summary
- CSV export for trip efficiency review

Why it exists:

- A shift operator first needs broad situational awareness.
- KPI cards quickly answer whether the fleet is healthy.
- The map answers where vehicles are.
- The queue lets the user drill into a vehicle without leaving the dashboard.
- Charts summarize usage patterns without forcing the user to inspect every trip row.

How it works:

- The dashboard fetches a capped latest operational snapshot from Supabase.
- The snapshot is enough for an overview while avoiding unbounded full-table reads.
- Clicking a vehicle updates selected vehicle state in Zustand.
- The selected vehicle is also hydrated with a focused vehicle query so details stay accurate even if the selected vehicle is not part of the current dashboard sample.

Relevant files:

- `src/features/fleet/pages/fleet-dashboard-page.tsx`
- `src/features/fleet/page-models/use-fleet-dashboard-page-model.ts`
- `src/features/fleet/components/fleet-workspace.tsx`
- `src/features/fleet/components/vehicle-list.tsx`
- `src/features/fleet/components/vehicle-detail-panel.tsx`
- `src/features/fleet/services/fleet-repository.ts`

### 3. Central Map Experience

The app uses Leaflet with OpenStreetMap tiles.

Dashboard behavior:

- Shows fleet-wide vehicle markers.
- Selecting a vehicle highlights that vehicle and shows its latest route context.

Live Map behavior:

- Works like a focused vehicle inspection page.
- The vehicle queue is used to choose a vehicle.
- Once selected, the map shows only that vehicle, its route, and its current position.
- The side panel shows telemetry, driver, ignition, energy, odometer, coordinates, recent route, and open alerts.

Why it exists:

- The assignment explicitly says the map should be central.
- Fleet operators need to inspect where a vehicle is and what it recently did.
- Showing every vehicle on every page becomes noisy, so the dashboard is fleet-wide and Live Map is vehicle-focused.

Route playback:

- Route points are drawn as a polyline.
- Playback controls step through route points and show speed at the current playback point.
- This makes movement history understandable without real GPS ingestion.

Relevant files:

- `src/features/fleet/components/fleet-map.tsx`
- `src/features/fleet/pages/map-page.tsx`
- `src/features/fleet/page-models/use-map-page-model.ts`
- `src/features/fleet/components/fleet-workspace.tsx`

### 4. Vehicle Queue

The Vehicle Queue is the searchable vehicle selector/list.

It shows:

- Registration number
- Model
- Driver
- Status
- Fuel/battery level
- Recent speed or trip status
- Last seen time
- Open alert count

Why it exists:

- Operators need to find a vehicle quickly by registration number.
- With large fleets, a full rendered list would not scale.
- Infinite scrolling keeps the UI responsive while supporting many rows.

How it works:

- Search input is debounced.
- TanStack Query uses `useInfiniteQuery`.
- Supabase uses `.range(from, to)` pagination.
- Vehicle search is performed in Supabase using indexed text fields instead of fetching all vehicles and filtering in React.

Relevant files:

- `src/features/fleet/components/vehicle-list.tsx`
- `src/features/fleet/hooks/use-fleet-query.ts`
- `src/features/fleet/services/fleet-repository.ts`

### 5. Vehicle Details

The vehicle detail panel explains the selected vehicle.

It shows:

- Driver
- Location
- Fuel or battery level
- Ignition state
- Last speed
- Last seen time
- Odometer
- Current coordinates
- Recent route
- Open issues
- Alert actions on the Live Map page

Why it exists:

- A map marker alone is not enough for operations.
- The user needs vehicle context and actionability in the same place.
- Vehicle health and usage exceptions should be visible next to location/route context.

Relevant files:

- `src/features/fleet/components/vehicle-detail-panel.tsx`
- `src/features/fleet/components/fleet-workspace.tsx`

### 6. Trips Page

The Trips page is for route and usage review.

It includes:

- Trip efficiency chart
- Chart limit control: Top 12, Top 25, Top 50
- Trip log table
- Search
- Date range filters
- Sortable trip columns
- 10-row pagination
- CSV export

Why it exists:

- Operators need to review movement history and usage patterns.
- Distance, duration, idle time, halt count, and overspeed events are operationally meaningful.
- Server-side pagination keeps the table usable for large datasets.

How it works:

- Search and date filters are stored in Zustand.
- Search is debounced before querying Supabase.
- Trips are fetched from Supabase with `.range(...)` pagination.
- Sorting is pushed into the Supabase query.
- The chart uses a capped query so hundreds or thousands of vehicles do not make the chart unreadable.

Relevant files:

- `src/features/fleet/pages/trips-page.tsx`
- `src/features/fleet/page-models/use-trips-page-model.ts`
- `src/features/fleet/components/trip-table.tsx`
- `src/features/fleet/services/fleet-repository.ts`

### 7. Alerts Page

The Alerts page is for exception handling.

It includes:

- Open, acknowledged, and resolved count cards
- Alert queue
- Status filters: All, Open, Acknowledged, Resolved
- Search by vehicle number, driver, or location
- Pagination
- Acknowledge action
- Resolve action

Why it exists:

- A dashboard should not only display problems; it should let operators act.
- A small workflow is enough for this prototype: `open -> acknowledged -> resolved`.
- Resolved alerts are deprioritized so active issues remain visible.

How it works:

- Counts use count-only Supabase queries.
- Alert rows use server-side pagination.
- Search first finds matching vehicles and then queries related alerts.
- Mutations update Supabase and invalidate TanStack Query caches.
- Supabase Realtime also refreshes pages if data changes from another client or SQL update.

Relevant files:

- `src/features/fleet/pages/alerts-page.tsx`
- `src/features/fleet/page-models/use-alerts-page-model.ts`
- `src/features/fleet/components/status-badge.tsx`
- `src/features/fleet/services/fleet-repository.ts`

### 8. Settings Page

The Settings page is intentionally small.

It shows:

- Theme selection
- Signed-in user
- Backend mode
- Product name

Why it exists:

- Internal tools often need simple workspace visibility.
- It confirms the app is using Supabase rather than local fallback data.
- Theme state demonstrates persisted UI preference.

Relevant files:

- `src/features/settings/pages/settings-page.tsx`
- `src/features/settings/page-models/use-settings-page-model.ts`
- `src/features/theme/ThemeProvider.tsx`

## How The App Works End To End

1. User opens the deployed app.
2. Supabase Auth checks whether a session exists.
3. If no session exists, the user is redirected to `/login`.
4. After sign-in, the authenticated dashboard shell mounts.
5. The app starts Supabase Realtime subscriptions for fleet tables.
6. TanStack Query fetches dashboard, queue, trips, alerts, counts, and selected vehicle data as needed.
7. Zustand stores UI state such as selected vehicle, searches, filters, pages, and chart limits.
8. Components render maps, charts, tables, queue cards, and detail panels from query results.
9. When a Supabase row changes, the realtime socket receives the event.
10. The app throttles query invalidation and refreshes the relevant cached views.

## Project Structure

The codebase is organized by product feature so the dashboard is easier to review and explain.

```text
.
├── AI_CHAT_LOGS.md
├── README.md
├── supabase-schema.sql
├── src
│   ├── components
│   │   ├── dashboard
│   │   │   ├── ChartCard.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── StatCard.tsx
│   │   └── ui
│   │       └── shared shadcn-style UI primitives
│   ├── features
│   │   ├── auth
│   │   │   └── AuthProvider.tsx
│   │   ├── fleet
│   │   │   ├── components
│   │   │   │   ├── chart-limit-control.tsx
│   │   │   │   ├── fleet-map.tsx
│   │   │   │   ├── fleet-workspace.tsx
│   │   │   │   ├── selected-route-summary.tsx
│   │   │   │   ├── status-badge.tsx
│   │   │   │   ├── trip-table.tsx
│   │   │   │   ├── vehicle-detail-panel.tsx
│   │   │   │   └── vehicle-list.tsx
│   │   │   ├── hooks
│   │   │   │   └── use-fleet-query.ts
│   │   │   ├── page-models
│   │   │   │   ├── use-alerts-page-model.ts
│   │   │   │   ├── use-fleet-dashboard-page-model.ts
│   │   │   │   ├── use-login-page-model.ts
│   │   │   │   ├── use-map-page-model.ts
│   │   │   │   └── use-trips-page-model.ts
│   │   │   ├── pages
│   │   │   │   ├── alerts-page.tsx
│   │   │   │   ├── fleet-dashboard-page.tsx
│   │   │   │   ├── login-page.tsx
│   │   │   │   ├── map-page.tsx
│   │   │   │   └── trips-page.tsx
│   │   │   ├── services
│   │   │   │   ├── fleet-analytics.ts
│   │   │   │   └── fleet-repository.ts
│   │   │   └── types.ts
│   │   ├── layout
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── navConfig.ts
│   │   ├── settings
│   │   │   ├── page-models
│   │   │   │   └── use-settings-page-model.ts
│   │   │   └── pages
│   │   │       └── settings-page.tsx
│   │   ├── shared
│   │   │   ├── components
│   │   │   └── export
│   │   └── theme
│   │       ├── ThemeProvider.tsx
│   │       └── ThemeToggle.tsx
│   ├── hooks
│   │   ├── use-debounced-value.ts
│   │   └── use-mobile.tsx
│   ├── lib
│   │   ├── supabase.ts
│   │   └── utils.ts
│   ├── routes
│   │   ├── __root.tsx
│   │   ├── alerts.tsx
│   │   ├── dashboard.tsx
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   ├── map.tsx
│   │   ├── settings.tsx
│   │   └── trips.tsx
│   ├── store
│   │   └── index.ts
│   ├── main.tsx
│   ├── router.tsx
│   └── styles.css
├── package.json
├── vite.config.ts
└── vercel.json
```

### Structure Decisions

- `features/fleet/services` contains Supabase repository functions and analytics helpers.
- `features/fleet/hooks` contains TanStack Query hooks and Supabase Realtime subscription logic.
- `features/fleet/page-models` contains page-level state composition, derived values, and handlers.
- `features/fleet/pages` stays mostly presentational so screens are easier to explain.
- `store/index.ts` owns Zustand UI state shared across pages.
- `supabase-schema.sql` owns the database schema, indexes, RLS policies, realtime setup, and seed data.

## Supabase Backend Structure

The full schema and seed data are in:

- `supabase-schema.sql`

### `vehicles`

Represents the current known state of each vehicle.

Important columns:

- `id`: stable vehicle identifier
- `registration`: vehicle number shown to operators
- `model`: vehicle model
- `driver`: assigned driver
- `status`: `active`, `idle`, `offline`, or `attention`
- `ignition`: whether the vehicle is currently on
- `energy_type`: `fuel` or `battery`
- `energy_level`: current fuel/battery percentage
- `odometer_km`: odometer reading
- `last_seen_at`: last telemetry/contact time
- `location_name`: human-readable current location
- `current_lat`, `current_lng`: current map position

Why this table exists:

- The dashboard needs fast access to current fleet state.
- Keeping current location on `vehicles` makes the map and queue efficient.
- It avoids scanning telemetry history just to show current vehicle markers.

### `trips`

Represents summarized route history.

Important columns:

- `vehicle_id`: vehicle that made the trip
- `started_at`, `ended_at`: trip timing
- `start_location`, `end_location`: route endpoints
- `distance_km`: trip distance
- `duration_minutes`: trip duration
- `average_speed_kph`, `max_speed_kph`: speed behavior
- `idle_minutes`: idle time during the trip
- `halt_count`: number of stops/halts
- `overspeed_events`: safety/usage signal
- `route_points`: JSONB route path used for map rendering and playback

Why this table exists:

- Operations users need trip summaries more often than raw telemetry.
- Summarized trips make tables and charts fast.
- `route_points` JSONB is a practical prototype tradeoff: enough to render movement history without building a full telemetry ingestion pipeline.

### `fleet_alerts`

Represents operational exceptions.

Important columns:

- `vehicle_id`: affected vehicle
- `title`: short alert label
- `description`: operational explanation
- `severity`: `critical`, `warning`, or `info`
- `status`: `open`, `acknowledged`, or `resolved`
- `created_at`: alert time

Why this table exists:

- Fleet dashboards need actionability.
- Alerts connect raw vehicle/trip signals to human follow-up.
- The status workflow lets users acknowledge and resolve issues.

### `telemetry_points`

Represents recent persisted telemetry samples.

Important columns:

- `vehicle_id`: source vehicle
- `recorded_at`: sample time
- `lat`, `lng`: sample location
- `speed_kph`: speed at that point
- `ignition`: ignition state at that point
- `energy_level`: fuel/battery level at that point

Why this table exists:

- It models the connected-device domain more realistically.
- It supports latest telemetry context in the detail panel.
- It leaves room for future real telemetry ingestion.

## Supabase Security And Realtime

### Row Level Security

RLS is enabled on all fleet tables.

Current prototype policies:

- Authenticated users can read vehicles, trips, alerts, and telemetry.
- Authenticated users can update fleet alert status.

Why this choice:

- The assignment needs a working prototype, not a full multi-tenant RBAC system.
- Authenticated-only access is appropriate for the assignment scope.
- In production, policies would be scoped by organization/team and user role.

### Realtime

The schema adds these tables to `supabase_realtime`:

- `vehicles`
- `trips`
- `fleet_alerts`
- `telemetry_points`

Frontend behavior:

- The authenticated shell subscribes once.
- Any insert/update/delete event invalidates relevant TanStack Query caches.
- Invalidation is throttled to avoid excessive refetching during bursts.

Why this matters:

- If a vehicle location changes in Supabase, the map can refresh.
- If an alert is resolved from another browser/client, the alert queue updates.
- If telemetry changes, selected vehicle context can refresh.

Relevant file:

- `src/features/fleet/hooks/use-fleet-query.ts`

## Indexing And Scale Decisions

The app was designed to avoid unnecessary full database reads.

Implemented backend indexes:

- Vehicle status index
- Vehicle last-seen index
- Vehicle status + last-seen compound index
- Trip vehicle + started-at index
- Trip started-at index
- Alert vehicle + status index
- Alert created-at index
- Alert status + created-at compound index
- Telemetry vehicle + recorded-at index
- Trigram indexes for vehicle registration/model/driver/location search
- Trigram indexes for trip start/end location search

Why these indexes exist:

- Vehicle queue search should stay fast with many vehicles.
- Trip and alert pages need pagination and sorting.
- Selected vehicle snapshots should quickly fetch recent trips, alerts, and telemetry.
- Text search should happen in Postgres, not by loading everything into React.

## Frontend Technical Design

### React + TypeScript

Used for the main UI.

Why:

- Strong component model for dashboard cards, maps, tables, and panels.
- TypeScript keeps vehicle/trip/alert shapes explicit.
- Easier to explain and review architecture.

Relevant files:

- `src/features/fleet/types.ts`
- `src/features/fleet/components/*`
- `src/features/fleet/pages/*`

### Vite

Used as the frontend build tool.

Why:

- Fast local development.
- Simple deployment to Vercel.
- Good fit for a React assignment prototype.

### TanStack Router

Used for app routing.

Why:

- Typed route structure.
- Clean route files.
- Works well with protected app shell pattern.

Relevant files:

- `src/routes/*`
- `src/router.tsx`

### TanStack Query

Used for server/cache state.

Why:

- Supabase data is remote server state, not local UI state.
- Query caching avoids duplicate fetches.
- Query invalidation works cleanly with Supabase Realtime.
- `useInfiniteQuery` is useful for the vehicle queue.
- Mutations can update alerts and then refresh affected views.

Used for:

- Fleet dashboard dataset
- Vehicle queue infinite pagination
- Trip pages
- Alert pages
- Alert counts
- Selected vehicle snapshot
- Alert status mutation

Relevant files:

- `src/features/fleet/hooks/use-fleet-query.ts`
- `src/features/fleet/services/fleet-repository.ts`

### Zustand

Used for shared UI state.

Why:

- Selected vehicle needs to be shared between dashboard, map, queue, and detail panels.
- Search/filter/page/chart state should persist across navigation.
- Zustand keeps UI state separate from TanStack Query server state.

Stored state:

- Selected vehicle ID
- Global vehicle search
- Trip search
- Trip sort key
- Trip date filters
- Trip page index
- Alert search
- Alert status filter
- Alert page index
- Chart limits
- Mobile drawer open state

Relevant file:

- `src/store/index.ts`

### Supabase

Used for:

- Auth
- Postgres database
- Row Level Security
- Realtime subscriptions

Why:

- Assignment explicitly requires Supabase.
- It gives a realistic backend without writing a separate API server.
- Realtime fits connected-vehicle telemetry use cases.

Relevant files:

- `src/lib/supabase.ts`
- `src/features/auth/AuthProvider.tsx`
- `src/features/fleet/services/fleet-repository.ts`
- `supabase-schema.sql`

### Leaflet + React Leaflet

Used for maps.

Why:

- Real map library, not a fake static visual.
- OpenStreetMap tiles are easy to review locally and in deployment.
- Supports markers, popups, route polylines, viewport fitting, and playback marker.

Relevant file:

- `src/features/fleet/components/fleet-map.tsx`

### Recharts

Used for dashboard charts.

Why:

- Simple, readable charting for utilization and trip behavior.
- Good fit for prototype analytics.
- Chart data can be capped to keep visuals useful with larger datasets.

Relevant pages:

- Dashboard
- Trips

### Tailwind CSS

Used for styling.

Why:

- Fast consistent UI composition.
- Responsive layout is easier to control.
- Dark/light theming can be handled through design tokens.

### Page Models

Page logic was extracted into `.ts` page-model hooks.

Why:

- TSX files stay focused on rendering UI.
- Data fetching, derived values, filters, and handlers are easier to explain.
- This keeps the codebase scalable as screens grow.

Examples:

- `src/features/fleet/page-models/use-fleet-dashboard-page-model.ts`
- `src/features/fleet/page-models/use-trips-page-model.ts`
- `src/features/fleet/page-models/use-alerts-page-model.ts`
- `src/features/fleet/page-models/use-map-page-model.ts`
- `src/features/fleet/page-models/use-login-page-model.ts`
- `src/features/settings/page-models/use-settings-page-model.ts`

## Data Fetching Strategy

The app avoids fetching entire tables for high-volume screens.

### Dashboard

- Fetches capped latest vehicles, trips, alerts, and telemetry.
- Used for overview, not exhaustive reporting.
- Selected vehicle is hydrated separately when needed.

### Vehicle Queue

- Uses server-side pagination.
- Uses debounced search.
- Uses indexed Supabase queries.
- Uses infinite scroll.

### Trips

- Uses server-side search.
- Uses server-side date filtering.
- Uses server-side sorting.
- Uses 10-row pagination.

### Alerts

- Uses server-side status filtering.
- Uses server-side search by matching vehicles.
- Uses 10-row pagination.
- Uses count-only queries for KPI cards.

### Selected Vehicle Snapshot

- Fetches only one vehicle and its recent related records.
- Used by Live Map and detail panel.
- Keeps focused inspection cheap even with a large fleet.

## Product Decisions And Why They Help Operations

### Map-first layout

Why:

- Location is the core connected-vehicle question.
- Operators can visually inspect where vehicles are before reading tables.

### Fleet-wide dashboard, focused Live Map

Why:

- Dashboard answers “what is happening across the fleet?”
- Live Map answers “what is happening with this vehicle?”
- This avoids repeating the same experience on both pages.

### Vehicle queue instead of a huge table

Why:

- Operators usually search by registration or scan a small set of active vehicles.
- Queue cards give status and alert context faster than a dense table.
- Infinite scroll makes it scalable.

### Alert workflow

Why:

- Fleet issues need follow-up.
- Acknowledge means “someone saw it.”
- Resolve means “this is no longer active.”
- The flow is small but operationally meaningful.

### Trip efficiency charts

Why:

- Distance, idle time, and overspeed events reveal usage patterns.
- Chart limits prevent hundreds of vehicles from making charts unreadable.

### CSV export

Why:

- Operations users often need to share or review trip efficiency outside the app.
- CSV export gives a lightweight reporting path.

### Realtime refresh

Why:

- Vehicle and alert data can change while the operator is viewing the app.
- Realtime keeps the dashboard closer to live operations behavior.

## Tradeoffs

This is a working prototype, not a production telemetry platform.

Chosen tradeoffs:

- `route_points` are stored in `trips` as JSONB for simple route rendering.
- Dashboard summary uses capped operational snapshots instead of heavy database aggregation views.
- Authenticated users share the same fleet access for assignment simplicity.
- There is no real GPS ingestion pipeline.
- There are no user roles yet.
- Map queries are not viewport-bounded yet.

Why these tradeoffs are acceptable for the assignment:

- The brief says real devices and real GPS ingestion are not required.
- The product remains coherent and reviewable.
- The backend still contains persisted realistic fleet data.
- The architecture leaves clear extension points for production scale.

## Production Improvements

If this became a real Bytebeam product, I would add:

- Organization/team scoping in RLS policies
- Role-based access control for admin, dispatcher, and viewer roles
- Audit history for alert status changes
- Database views or RPC functions for fleet-wide aggregate KPIs
- Time-series partitioning for telemetry
- Viewport-based map queries for very large fleets
- Geospatial indexes/PostGIS for location search
- Streaming telemetry ingestion from actual devices
- Alert rules engine for automatic exception creation
- Route playback from telemetry ranges instead of compact trip JSONB
- Optimistic UI updates for alert actions
- Monitoring and error tracking

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

Run locally:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Supabase Setup Instructions

1. Create a Supabase project.
2. Open the SQL editor.
3. Run `supabase-schema.sql`.
4. Confirm these tables exist:
   - `vehicles`
   - `trips`
   - `fleet_alerts`
   - `telemetry_points`
5. Confirm RLS is enabled on all four tables.
6. Confirm Realtime is enabled for all four tables.
7. Create the demo auth user in Supabase Auth:
   - Email: `ops@bytebeam.local`
   - Password: `bytebeam-demo`
8. Copy the project URL and publishable/anon key into `.env` locally or Vercel environment variables.
9. Run the app and sign in.

The app requires Supabase configuration. It does not silently fall back to local mock fleet data.

## Useful SQL For Testing Realtime

Update a vehicle location/energy level:

```sql
update public.vehicles
set
  energy_level = 76,
  current_lat = 12.9352,
  current_lng = 77.6245,
  last_seen_at = now()
where id = 'veh-002'
returning id, registration, energy_level, last_seen_at;
```

Create an alert:

```sql
insert into public.fleet_alerts (
  id,
  vehicle_id,
  title,
  description,
  severity,
  status,
  created_at
) values (
  'alert-test-' || extract(epoch from now())::bigint,
  'veh-002',
  'Realtime test alert',
  'Inserted from Supabase SQL editor to verify realtime refresh.',
  'warning',
  'open',
  now()
);
```

Expected result:

- Alert counts update.
- Alert queue refreshes.
- Vehicle detail panel refreshes if that vehicle is selected.
- Dashboard/Live Map data refreshes through TanStack Query invalidation.

## AI Usage

AI-assisted development was used intentionally.

Tools used:

- ChatGPT / Codex-style AI pair programming
- AI help for product interpretation, schema planning, code review, README drafting, and gap analysis

Where AI helped:

- Interpreting the ambiguous product brief
- Converting the brief into a coherent fleet operations product
- Designing the Supabase schema
- Choosing realistic sample fleet parameters
- Reviewing whether old-assignment code remained
- Checking whether realtime, pagination, search, debouncing, and state management were consistently applied
- Refactoring page logic into page-model `.ts` files
- Writing reviewer-facing documentation

How AI was reviewed:

- Generated suggestions were checked against the assignment scope.
- Code was run through formatting and production build.
- Feature decisions were narrowed to a coherent operations product instead of adding unrelated features.
- Architecture choices were explained and connected to product needs.

AI notes are included in:

- `AI_CHAT_LOGS.md`

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run format
```

## Submission Checklist

Before uploading the ZIP:

- Include source code.
- Include this single `README.md`.
- Include `supabase-schema.sql`.
- Include `AI_CHAT_LOGS.md`.
- Include the deployed demo URL.
- Include demo credentials.
- Remove `node_modules`.
- Remove `dist`.
- Remove `.tanstack` cache if not needed for review.
- Remove screenshots/videos that are not needed.
- Remove `.env` and any secrets.
- Keep the ZIP under 100 MB.

## Review Notes

What reviewers should look at first:

1. Login with the demo user.
2. Open the Dashboard for fleet-wide context.
3. Search/select a vehicle in Vehicle Queue.
4. Open Live Map and inspect the selected vehicle.
5. Use route playback.
6. Open Alerts and acknowledge/resolve an alert.
7. Open Trips and test search, date filtering, sorting, and pagination.
8. Run a Supabase SQL update to verify realtime refresh.

This should show the intended product slice: a realistic internal fleet dashboard with authentication, persisted backend data, map-centered vehicle inspection, server-backed search/pagination, realtime refresh, and a small but useful alert workflow.
