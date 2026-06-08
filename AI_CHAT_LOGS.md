# AI Usage Log

This file documents how AI assistance was used while building the Bytebeam Fleet Operations Dashboard.

The purpose of this log is to show a thoughtful AI-assisted engineering process: clear prompts, reviewed outputs, product reasoning, architecture decisions, tradeoffs, bugs found, and improvements made. When I was asking for exploration, the prompts were intentionally open-ended so I could compare options and make the final decision. When I was asking for implementation, the prompts were precise and constraint-heavy: I specified TanStack Query, Zustand, Supabase Realtime, debouncing, throttling, indexing, server-side pagination/search, and the expected product behavior.

## AI Tools Used

- **OpenAI Codex / ChatGPT-style coding assistant** in the local development workspace.

## How I Used AI

I used AI as a pair-programming and architecture-review assistant. I did not use it as a one-shot generator.

My workflow was:

1. Provide the assignment requirements and product constraints.
2. Ask for product interpretation and feature prioritization.
3. Ask for backend schema options and tradeoffs.
4. Give precise implementation prompts for features such as TanStack Query, Zustand, Realtime, debouncing, throttling, indexing, and pagination.
5. Review generated code and ask follow-up questions about gaps, bugs, missing concepts, or product confusion.
6. Ask the assistant to audit whether key concepts were fully implemented.
7. Fix bugs and incomplete areas found during review.
8. Run formatting/build validation.
9. Document product, technical, and AI-usage decisions clearly for review.

## Prompt And Result Log

### 1. Product Scope And Feature Prioritization

**Prompt I gave:**

> I am building a Bytebeam fleet dashboard for an internal operations team. The assignment requires login, protected dashboard access, Supabase as backend, realistic persisted fleet data, and a map-centered experience. I want to first reason through the product, not code immediately. Tell me what product surface would actually help an operations user, what vehicle/trip parameters are worth showing, what should be prioritized on the dashboard, and what should be avoided so the app does not become a generic marketing page.

**AI-assisted output:**

- Recommended an internal operations workspace instead of a landing page.
- Suggested a map-first dashboard because location and movement history are central to the product.
- Prioritized the following user questions:
  - Where are vehicles now?
  - Which vehicles need attention?
  - What did a selected vehicle recently do?
  - Are there low fuel/battery, offline, idle, or overspeed issues?
  - Which trips look inefficient?

**Decision I made:**

- Build a compact but complete fleet operations product.
- Keep the main dashboard focused on fleet-wide awareness.
- Add a separate Live Map page for selected-vehicle inspection.
- Avoid decorative marketing sections entirely.

### 2. Backend Data Model And Supabase Schema

**Prompt I gave:**

> Design the Supabase backend for this connected-fleet prototype from scratch. I need table creation SQL, realistic persisted seed data, indexes, RLS policies, and realtime setup. Model vehicles, trips, alerts, and telemetry in a way that supports the dashboard, vehicle search, route inspection, trip log, and alert workflow. Be explicit about the columns: for vehicles include registration, model, driver, status, ignition, energy type/level, odometer, last seen, location name, and current lat/lng; for trips include vehicle id, start/end time, start/end location, distance, duration, average/max speed, idle minutes, halt count, overspeed events, and route points; for alerts include vehicle id, title, description, severity, workflow status, and created time; for telemetry include vehicle id, recorded time, lat/lng, speed, ignition, and energy. Also tell me what to index and why: vehicle status/last seen for dashboard, registration/model/driver/location trigram indexes for search, trip vehicle/start time for recent routes, alert vehicle/status/created time for queues, and telemetry vehicle/recorded time for selected-vehicle snapshots. Explain why each table exists and what tradeoffs we are making for a prototype versus a production telemetry system.

**AI-assisted output:**

- Proposed four core tables:
  - `vehicles`
  - `trips`
  - `fleet_alerts`
  - `telemetry_points`
- Generated realistic fleet seed data with Bengaluru vehicle registrations, drivers, status, fuel/battery levels, ignition state, coordinates, trip summaries, route points, alerts, and telemetry points.
- Added RLS policies for authenticated users.
- Added Supabase Realtime publication setup.
- Added indexes for vehicle status/last-seen dashboard queries, trip vehicle/start-time lookups, alert status/created-time queues, telemetry vehicle/recorded-time snapshots, and trigram search on vehicle/trip text fields.

**Decision I made:**

- Keep current vehicle state in `vehicles` so the dashboard can render current positions quickly.
- Keep summarized trips in `trips` for readable operations review.
- Store compact route geometry in `trips.route_points` JSONB for prototype route rendering.
- Keep `telemetry_points` as a realistic domain table for latest telemetry context and future ingestion.
- Add targeted indexes based on actual access patterns instead of indexing randomly.
- Use RLS with authenticated access for assignment scope, while documenting that production would need organization and role scoping.

**Files created/updated:**

- `supabase-schema.sql`
- `src/features/fleet/types.ts`
- `src/features/fleet/services/fleet-repository.ts`

### 3. Authentication And Protected Routes

**Prompt I gave:**

> Implement real Supabase email/password authentication, not a fake demo-mode login. The app should have a minimal login page, protected dashboard routes, session loading, auth-state subscription, sign-out, and redirect behavior for unauthenticated users. Use the demo user for review credentials, but do not hardcode access to only that email. Also explain how wrong credentials behave and whether a newly created Supabase Auth user can use the app under the current RLS policy.

**AI-assisted output:**

- Implemented Supabase session loading and auth-state subscription.
- Added protected dashboard shell behavior.
- Added email/password sign-in and sign-out.
- Confirmed wrong credentials return Supabase auth errors.
- Confirmed the app is not hardcoded to one email; any Supabase Auth user can sign in under the current RLS policy.

**Decision I made:**

- Use real Supabase Auth instead of fake local login.
- Keep the login page minimal and product-focused.
- Use the demo user only as review credentials, not as a hardcoded authorization rule.

**Files created/updated:**

- `src/features/auth/AuthProvider.tsx`
- `src/features/fleet/pages/login-page.tsx`
- `src/features/fleet/page-models/use-login-page-model.ts`
- `src/features/layout/AppShell.tsx`

### 4. Dashboard Product Design

**Prompt I gave:**

> Build the main dashboard as the fleet-wide operations overview. It should help an operator quickly understand fleet size, active vehicles, open alerts, average fuel/battery, where vehicles are on the map, which vehicle is selected, what its recent route/details are, and whether usage patterns like idle time or overspeeding need attention. Keep the map central, add a vehicle queue for selecting vehicles, add useful charts, and include CSV export where it makes operational sense. Do not add decorative sections that do not help an internal operator.

**AI-assisted output:**

- Built KPI cards for fleet size, active vehicles, open alerts, and average energy.
- Added a central map with vehicle markers.
- Added a Vehicle Queue for selecting/searching vehicles.
- Added selected vehicle details.
- Added trip utilization and fleet status charts.
- Added summary metrics for distance, idle time, and overspeed events.
- Added CSV export for trip efficiency data.

**Decision I made:**

- Dashboard should answer fleet-wide questions first.
- Vehicle detail context should be available without leaving the dashboard.
- Charts should summarize patterns, not replace the map or trip table.

**Files created/updated:**

- `src/features/fleet/pages/fleet-dashboard-page.tsx`
- `src/features/fleet/page-models/use-fleet-dashboard-page-model.ts`
- `src/features/fleet/components/fleet-workspace.tsx`
- `src/features/fleet/components/vehicle-detail-panel.tsx`
- `src/features/fleet/services/fleet-analytics.ts`

### 5. Map And Route Inspection

**Prompt I gave:**

> Use a real map library, not a fake static map. On the dashboard, show the fleet-wide map with vehicle markers so operations can see where vehicles are. On the Live Map page, make it a focused vehicle-inspection workspace: when I select one vehicle, the map should show only that vehicle, its latest/current location, its route polyline, route playback if useful, and a details panel with telemetry, route, driver, location, fuel/battery, ignition, and open alerts. Alert actions should be available from this focused page.

**AI-assisted output:**

- Added Leaflet/OpenStreetMap map integration.
- Added markers for vehicle locations.
- Added selected route polyline.
- Added route playback controls.
- Added focused Live Map behavior for one selected vehicle.
- Added detail panel actions on Live Map.

**Decision I made:**

- Dashboard map = fleet-wide awareness.
- Live Map = selected vehicle investigation.
- Route playback helps reviewers understand movement history without real GPS ingestion.

**Files created/updated:**

- `src/features/fleet/components/fleet-map.tsx`
- `src/features/fleet/pages/map-page.tsx`
- `src/features/fleet/page-models/use-map-page-model.ts`
- `src/features/fleet/components/fleet-workspace.tsx`

### 6. Vehicle Queue Search And Infinite Scrolling

**Prompt I gave:**

> The Vehicle Queue should be a scalable vehicle selector. Add search by vehicle registration/number and supporting fields, but do not fetch the whole vehicles table and filter in React. Use Supabase server-side search with indexes, debounce the search input, use TanStack Query `useInfiniteQuery`, use range pagination, and load more vehicles as the user scrolls. This should still work conceptually if the fleet has thousands or millions of rows.

**AI-assisted output:**

- Added debounced vehicle search.
- Added Supabase `.range(...)` pagination.
- Added TanStack Query `useInfiniteQuery`.
- Added indexed search against vehicle registration, model, driver, location, and status.
- Added infinite scroll loading.

**Decision I made:**

- Vehicle Queue should be a scalable vehicle selector, not a static local list.
- Search should query Supabase rather than filtering a full database result in React.

**Files created/updated:**

- `src/features/fleet/components/vehicle-list.tsx`
- `src/features/fleet/hooks/use-fleet-query.ts`
- `src/features/fleet/services/fleet-repository.ts`
- `src/hooks/use-debounced-value.ts`
- `supabase-schema.sql`

### 7. Trips Page: Server-Side Filtering And Pagination

**Prompt I gave:**

> The Trips page needs to be scalable and useful. Trip Log should show 10 records per page, support debounced search, date-from/date-to filters, sortable columns, and server-side pagination. Do not load all trips and then filter locally. Push search, date filtering, sorting, and pagination into Supabase queries. Also make the trip chart readable for large datasets by adding chart scope/limit controls instead of rendering every vehicle or trip.

**AI-assisted output:**

- Added trip search with debouncing.
- Added date range filters.
- Added sortable columns.
- Added server-side pagination with 10 rows per page.
- Added chart limit controls for Top 12, Top 25, Top 50.
- Added CSV export.

**Decision I made:**

- Trip table data should come from Supabase with search/filter/sort/page parameters.
- Charts should be scoped so they remain readable with larger datasets.

**Files created/updated:**

- `src/features/fleet/pages/trips-page.tsx`
- `src/features/fleet/page-models/use-trips-page-model.ts`
- `src/features/fleet/components/trip-table.tsx`
- `src/features/fleet/components/chart-limit-control.tsx`
- `src/features/fleet/services/fleet-repository.ts`

### 8. Alerts Page And Alert Workflow

**Prompt I gave:**

> Build the Alerts page as an operations workflow, not just a static list. Add status filters for All, Open, Acknowledged, and Resolved. Add search by vehicle registration/number and related vehicle fields. Use debounced search and server-side pagination with 10 rows per page. Add acknowledge and resolve actions backed by Supabase mutations. Keep active issues prioritized so resolved alerts do not dominate the queue.

**AI-assisted output:**

- Added alert status filters: All, Open, Acknowledged, Resolved.
- Added debounced alert search.
- Added server-side alert pagination.
- Added count-only queries for alert KPI cards.
- Added acknowledge and resolve mutations.
- Added alert actions in the Live Map vehicle detail panel.

**Decision I made:**

- Alert workflow should be small but real: `open -> acknowledged -> resolved`.
- Operators need to act from both the Alerts page and selected vehicle context.

**Files created/updated:**

- `src/features/fleet/pages/alerts-page.tsx`
- `src/features/fleet/page-models/use-alerts-page-model.ts`
- `src/features/fleet/components/vehicle-detail-panel.tsx`
- `src/features/fleet/hooks/use-fleet-query.ts`
- `src/features/fleet/services/fleet-repository.ts`

### 9. State Management And Query Architecture Audit

**Prompt I gave:**

> Audit the whole app architecture. I want TanStack Query to own Supabase server/cache state and Zustand to own shared UI state. Check every page and component for consistency: selected vehicle, global vehicle search, trip filters, alert filters, pagination, chart limits, mobile drawer, realtime subscriptions, debounced inputs, throttled invalidation, and mutation refreshes. Tell me if anything is half-applied or incorrectly mixed, then fix the code so the concepts are applied consistently across the dashboard.

**AI-assisted output:**

- Verified TanStack Query usage for:
  - Fleet dataset
  - Vehicle queue
  - Trip pages
  - Alert pages
  - Alert counts
  - Selected vehicle snapshot
  - Alert mutations
- Verified Zustand usage for:
  - Selected vehicle
  - Global vehicle search
  - Trip search/sort/date/page
  - Alert search/filter/page
  - Chart limits
  - Mobile drawer state
- Confirmed debouncing for vehicle, trip, and alert search.
- Confirmed throttled realtime invalidation.

**Decision I made:**

- Keep server state and UI state separate.
- TanStack Query owns remote data and caching.
- Zustand owns user selections and controls.

**Files reviewed/updated:**

- `src/features/fleet/hooks/use-fleet-query.ts`
- `src/store/index.ts`
- `src/hooks/use-debounced-value.ts`
- `src/features/layout/AppShell.tsx`

### 10. Supabase Realtime Behavior

**Prompt I gave:**

> Verify Supabase Realtime end to end. I want vehicles, trips, fleet alerts, and telemetry changes to refresh the app. If I update a vehicle location or energy value in Supabase SQL editor, the map/details should update through query invalidation. Check the code, explain how the realtime WebSocket works, explain why `101 Switching Protocols` is expected, add throttling so many realtime events do not spam refetches, and give me SQL queries to test realtime updates.

**AI-assisted output:**

- Added/verified Realtime subscription for:
  - `vehicles`
  - `trips`
  - `fleet_alerts`
  - `telemetry_points`
- Explained that the browser WebSocket status `101 Switching Protocols` is expected.
- Added throttled invalidation of TanStack Query caches.
- Added SQL examples in README for testing realtime changes.

**Decision I made:**

- Use query invalidation instead of manually mutating every cache shape because multiple screens depend on the same tables.
- Throttle invalidation to avoid noisy refetching during bursts.

**Files created/updated:**

- `src/features/fleet/hooks/use-fleet-query.ts`
- `src/features/layout/AppShell.tsx`
- `README.md`

### 11. UI Bugs And Improvements During Build

**Prompt I gave:**

> Review the UI like a product reviewer. I see map/header overlap while scrolling, too much empty space in some layouts, vehicle cards that feel too tall, and repeated behavior between Dashboard and Live Map. Fix the layout and product structure: Dashboard should be a fleet overview, Live Map should be vehicle inspection, map controls should not overlap the sticky header, and Vehicle Queue should be compact enough for operations use.

**AI-assisted output:**

- Fixed map stacking/scroll overlap behavior.
- Improved Vehicle Queue density.
- Reduced redundant Live Map behavior by making it vehicle-focused.
- Kept Dashboard fleet-wide.

**Bugs found and solved:**

- **Map/header overlap:** Leaflet controls and map container could visually overlap the sticky header. The fix adjusted stacking and container behavior so the header stays above page content.
- **Dashboard/Live Map redundancy:** Both pages initially felt too similar. The fix made Dashboard fleet-wide and Live Map selected-vehicle-focused.
- **Vehicle card spacing:** Vehicle cards consumed too much vertical space. The fix made queue cards more compact while preserving key status fields.

**Files created/updated:**

- `src/features/fleet/components/fleet-map.tsx`
- `src/features/fleet/components/fleet-workspace.tsx`
- `src/features/fleet/components/vehicle-list.tsx`
- `src/features/layout/TopBar.tsx`

### 12. Bug-Finding Pass Before Submission

**Prompt I gave:**

> Before submission, verify the implementation in the specific files that carry the core architecture. Check `src/features/auth/AuthProvider.tsx` and `src/features/layout/AppShell.tsx` for login/protected-route behavior. Check `src/features/fleet/hooks/use-fleet-query.ts` for TanStack Query, Supabase Realtime, and throttled invalidation. Check `src/store/index.ts` for Zustand state used by selected vehicle, filters, pagination, and chart limits. Check `src/features/fleet/services/fleet-repository.ts` for server-side Supabase search, pagination, sorting, and selected-vehicle queries. Check `src/features/fleet/components/vehicle-list.tsx` and `src/features/fleet/components/trip-table.tsx` for debounced search and pagination behavior. Check the page files under `src/features/fleet/pages` to make sure they are mostly UI and not holding business logic. If any bug or incomplete concept is found, explain the issue, fix it, and validate the result.

**AI-assisted output:**

Found and fixed multiple issues:

- A dashboard chart variable used `statusBreakdown` instead of `model.statusBreakdown`.
- Page TSX files still had too much page logic; extracted page-model hooks.
- Vehicle Queue needed infinite scrolling rather than only a fixed page.
- Trips and alerts needed server-backed search and pagination.
- Realtime WebSocket `101` needed to be documented as expected behavior.
- Browser extension console warnings were identified as unrelated to the app.

**Decision I made:**

- Treat the audit as a quality gate before submission.
- Fix small structure or implementation bugs because they hurt reviewer confidence.
- Document expected realtime behavior to avoid confusion during review.

**Files created/updated:**

- `src/features/fleet/page-models/*`
- `src/features/settings/page-models/use-settings-page-model.ts`
- `src/features/fleet/pages/*`
- `src/features/settings/pages/settings-page.tsx`
- `README.md`

### 13. Scalable Codebase Structure From The Start

**Prompt I gave:**

> While building the dashboard, keep the codebase scalable from the start instead of putting everything directly inside page TSX files. Use a feature-based structure with `components`, `hooks`, `services`, `page-models`, `pages`, and `types`. Put Supabase access in repository/service files, TanStack Query hooks in hook files, derived page state and handlers in page-model `.ts` files, shared UI state in Zustand, and visual rendering in TSX components/pages. I want the final code to be easy to explain in an interview: pages should mostly consume a model and render UI, while business logic, data composition, search/filter/page state, mutation handlers, and row shaping live in typed `.ts` files.

**AI-assisted output:**

Created a scalable feature structure and page-model hooks:

- `use-fleet-dashboard-page-model.ts`
- `use-trips-page-model.ts`
- `use-alerts-page-model.ts`
- `use-map-page-model.ts`
- `use-login-page-model.ts`
- `use-settings-page-model.ts`

**Decision I made:**

- Build with a feature/service/hook/component structure from the beginning rather than leaving a late cleanup for the end.
- Keep TSX files presentation-focused.
- Put Supabase access, data composition, derived state, and interaction handlers in typed `.ts` files.
- Make the architecture easier to discuss during review.

**Files created/updated:**

- `src/features/fleet/page-models/*`
- `src/features/settings/page-models/use-settings-page-model.ts`
- `src/features/fleet/pages/*`
- `src/features/settings/pages/settings-page.tsx`

### 14. README And Submission Documentation

**Prompt I gave:**

> Write a detailed reviewer-facing README for a job application submission. It should explain what product we built, why every feature exists, how each feature helps the operations team, how the app works end to end, the full Supabase structure, RLS/realtime/indexing decisions, frontend technical decisions, TanStack Query/Zustand split, debouncing/throttling/search/pagination strategy, tradeoffs, production improvements, setup steps, realtime test SQL, project file structure, AI usage, and submission checklist.

**AI-assisted output:**

Expanded the README with:

- Product scenario interpretation
- Feature-by-feature explanation
- End-to-end app flow
- Project structure
- Supabase schema explanation
- RLS and realtime explanation
- Indexing and scale decisions
- Frontend technical design
- Data fetching strategy
- Product decisions and tradeoffs
- Production improvements
- Setup instructions
- Realtime test SQL
- AI usage
- Submission checklist

**Decision I made:**

- Make the README reviewer-facing and interview-friendly.
- Include enough detail to explain both product and engineering choices without a live walkthrough.

**Files created/updated:**

- `README.md`
- `AI_CHAT_LOGS.md`

## Key Product Decisions

- **Map-first dashboard:** Location and route history are central to connected fleet operations.
- **Fleet Dashboard vs Live Map split:** Dashboard is fleet-wide; Live Map is vehicle-focused.
- **Vehicle Queue:** A searchable selector is more useful for operations than a giant static list.
- **Alert workflow:** Operators need to acknowledge and resolve issues, not just view cards.
- **Trip analysis:** Distance, idle time, speed, halts, and overspeed events provide useful operational signals.
- **Chart limits:** Capped chart scopes keep analytics readable with large datasets.
- **CSV export:** Provides a lightweight way to review/share trip efficiency data.

## Key Technical Decisions

- **Supabase Auth:** Real authentication for protected dashboard access.
- **Supabase Postgres:** Persisted backend data instead of frontend-only mock state.
- **RLS:** Authenticated-only table access for assignment scope.
- **Supabase Realtime:** Keeps dashboard data fresh after database changes.
- **TanStack Query:** Handles remote data fetching, caching, pagination, mutations, and invalidation.
- **Zustand:** Handles shared UI state such as selected vehicle, filters, pages, and chart limits.
- **Leaflet:** Real map library for markers, routes, popups, and playback.
- **Recharts:** Lightweight charts for fleet/trip insights.
- **Page-model hooks:** Keep TSX pages clean and explainable.
- **Debouncing:** Prevents search inputs from sending a query on every keystroke.
- **Throttling:** Prevents realtime bursts from causing too many refetches.
- **Indexes/trigram indexes:** Support scalable search and pagination in Supabase.

## Tradeoffs Documented With AI Help

- `route_points` JSONB is enough for prototype route playback but a production system would use telemetry ranges or geospatial/time-series storage.
- Dashboard uses capped operational snapshots for responsiveness; production could add aggregate database views/RPC functions.
- RLS allows authenticated access for the prototype; production would add org/team scoping and roles.
- Realtime uses cache invalidation instead of manually patching every query cache; simpler and safer for this prototype.
- Charts use capped scopes because hundreds of bars would be unreadable.

## Bugs Found Or Prevented During The AI-Assisted Process

- Dashboard chart variable bug: `statusBreakdown` needed to be `model.statusBreakdown`.
- Map/header overlap while scrolling was fixed by adjusting map/container stacking.
- Vehicle Queue was improved from fixed-list behavior to infinite pagination.
- Trip and alert filtering were moved to Supabase queries instead of unbounded client filtering.
- Search inputs were debounced to avoid excessive queries.
- Realtime invalidation was throttled to avoid refetch bursts.
- Dashboard and Live Map were separated into distinct product purposes.
- Browser extension console warnings were identified as unrelated to the app.
- Supabase WebSocket `101 Switching Protocols` was identified as expected realtime behavior.
- Page TSX files were refactored so business logic did not stay buried in render files.

## Validation Performed

- Ran codebase searches for stale/non-product terminology.
- Reviewed data fetching to ensure high-volume screens do not fetch the full database.
- Reviewed TanStack Query usage across server data.
- Reviewed Zustand usage across shared UI state.
- Reviewed Supabase Realtime subscription and cache invalidation.
- Reviewed debouncing and throttling usage.
- Ran `npm run format`.
- Ran `npm run build`.
- Committed and pushed reviewed milestones to GitHub.

## Limitations Acknowledged

The prototype intentionally does not include:

- Real device ingestion.
- Production telemetry stream processing.
- Organization/team-based permissions.
- User roles.
- PostGIS/viewport-based map querying.
- Alert audit history table.
- Production monitoring/error tracking.

These were documented as future production improvements because the assignment asked for a coherent working prototype, not a full telemetry platform.

## Final Reviewer Summary

AI was used efficiently by giving it clear constraints and asking for targeted output: schema design, feature implementation, architecture audits, bug-finding, tradeoff analysis, refactoring, and documentation.

The final app is not a one-shot generated scaffold. It is a reviewed and iterated product prototype with clear product reasoning, a Supabase-backed data model, real map interaction, scalable search/pagination patterns, realtime refresh, state management separation, documented tradeoffs, and validation steps.
