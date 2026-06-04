create table if not exists public.vehicles (
  id text primary key,
  registration text not null,
  model text not null,
  driver text not null,
  status text not null check (status in ('active', 'idle', 'offline', 'attention')),
  ignition boolean not null default false,
  energy_type text not null check (energy_type in ('fuel', 'battery')),
  energy_level integer not null check (energy_level between 0 and 100),
  odometer_km numeric not null,
  last_seen_at timestamptz not null,
  location_name text not null,
  current_lat numeric not null,
  current_lng numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists public.trips (
  id text primary key,
  vehicle_id text not null references public.vehicles(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  start_location text not null,
  end_location text not null,
  distance_km numeric not null,
  duration_minutes integer not null,
  average_speed_kph integer not null,
  max_speed_kph integer not null,
  idle_minutes integer not null,
  halt_count integer not null,
  overspeed_events integer not null,
  route_points jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.fleet_alerts (
  id text primary key,
  vehicle_id text not null references public.vehicles(id) on delete cascade,
  title text not null,
  description text not null,
  severity text not null check (severity in ('critical', 'warning', 'info')),
  status text not null check (status in ('open', 'acknowledged', 'resolved')),
  created_at timestamptz not null default now()
);

create table if not exists public.telemetry_points (
  id text primary key,
  vehicle_id text not null references public.vehicles(id) on delete cascade,
  recorded_at timestamptz not null,
  lat numeric not null,
  lng numeric not null,
  speed_kph integer not null,
  ignition boolean not null,
  energy_level integer not null check (energy_level between 0 and 100),
  created_at timestamptz not null default now()
);

create index if not exists idx_vehicles_status on public.vehicles(status);
create index if not exists idx_vehicles_last_seen_at on public.vehicles(last_seen_at desc);
create index if not exists idx_trips_vehicle_id_started_at on public.trips(vehicle_id, started_at desc);
create index if not exists idx_fleet_alerts_vehicle_id_status on public.fleet_alerts(vehicle_id, status);
create index if not exists idx_fleet_alerts_created_at on public.fleet_alerts(created_at desc);
create index if not exists idx_telemetry_points_vehicle_recorded_at on public.telemetry_points(vehicle_id, recorded_at desc);

alter table public.vehicles enable row level security;
alter table public.trips enable row level security;
alter table public.fleet_alerts enable row level security;
alter table public.telemetry_points enable row level security;

drop policy if exists "authenticated users can read vehicles" on public.vehicles;
create policy "authenticated users can read vehicles"
  on public.vehicles for select
  to authenticated
  using (true);

drop policy if exists "authenticated users can read trips" on public.trips;
create policy "authenticated users can read trips"
  on public.trips for select
  to authenticated
  using (true);

drop policy if exists "authenticated users can read fleet alerts" on public.fleet_alerts;
create policy "authenticated users can read fleet alerts"
  on public.fleet_alerts for select
  to authenticated
  using (true);

drop policy if exists "authenticated users can update fleet alerts" on public.fleet_alerts;
create policy "authenticated users can update fleet alerts"
  on public.fleet_alerts for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated users can read telemetry points" on public.telemetry_points;
create policy "authenticated users can read telemetry points"
  on public.telemetry_points for select
  to authenticated
  using (true);

do $$
begin
  begin
    alter publication supabase_realtime add table public.vehicles;
  exception
    when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.trips;
  exception
    when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.fleet_alerts;
  exception
    when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.telemetry_points;
  exception
    when duplicate_object then null;
  end;
end $$;

insert into public.vehicles (
  id, registration, model, driver, status, ignition, energy_type, energy_level,
  odometer_km, last_seen_at, location_name, current_lat, current_lng
) values
  ('veh-001', 'KA 03 BT 1842', 'Tata Ace EV', 'Nikhil Rao', 'active', true, 'battery', 72, 18420, '2026-06-04T12:18:00+05:30', 'Indiranagar', 12.9719, 77.6412),
  ('veh-002', 'KA 05 MX 2719', 'Mahindra Jeeto', 'Farah Khan', 'attention', true, 'fuel', 18, 32770, '2026-06-04T12:11:00+05:30', 'Koramangala', 12.9352, 77.6245),
  ('veh-003', 'KA 01 AD 9032', 'Ashok Leyland Dost', 'Manoj Iyer', 'idle', false, 'fuel', 54, 45212, '2026-06-04T11:58:00+05:30', 'Whitefield', 12.9698, 77.7500),
  ('veh-004', 'KA 51 EC 4110', 'Eicher Pro 2049', 'Sanjana Mehta', 'active', true, 'fuel', 67, 61530, '2026-06-04T12:20:00+05:30', 'Electronic City', 12.8452, 77.6602),
  ('veh-005', 'KA 04 NB 7721', 'Euler HiLoad', 'Priya Menon', 'offline', false, 'battery', 36, 12640, '2026-06-04T08:44:00+05:30', 'Peenya Depot', 13.0285, 77.5197),
  ('veh-006', 'KA 02 HV 6204', 'Tata 407', 'Arjun Nair', 'active', true, 'fuel', 49, 74802, '2026-06-04T12:16:00+05:30', 'Hebbal', 13.0358, 77.5970)
on conflict (id) do update set
  status = excluded.status,
  ignition = excluded.ignition,
  energy_level = excluded.energy_level,
  last_seen_at = excluded.last_seen_at,
  location_name = excluded.location_name,
  current_lat = excluded.current_lat,
  current_lng = excluded.current_lng;

insert into public.trips (
  id, vehicle_id, started_at, ended_at, start_location, end_location, distance_km,
  duration_minutes, average_speed_kph, max_speed_kph, idle_minutes, halt_count,
  overspeed_events, route_points
) values
  ('trip-1001', 'veh-001', '2026-06-04T09:05:00+05:30', '2026-06-04T10:02:00+05:30', 'CV Raman Nagar Hub', 'Indiranagar Dispatch', 18.4, 57, 26, 54, 7, 3, 0,
    '[{"lat":12.9854,"lng":77.6639,"recordedAt":"2026-06-04T09:05:00+05:30","speedKph":0},{"lat":12.9787,"lng":77.6571,"recordedAt":"2026-06-04T09:18:00+05:30","speedKph":22},{"lat":12.9738,"lng":77.6502,"recordedAt":"2026-06-04T09:34:00+05:30","speedKph":31},{"lat":12.9699,"lng":77.6446,"recordedAt":"2026-06-04T09:47:00+05:30","speedKph":27},{"lat":12.9719,"lng":77.6412,"recordedAt":"2026-06-04T10:02:00+05:30","speedKph":8}]'::jsonb),
  ('trip-1002', 'veh-002', '2026-06-04T08:30:00+05:30', '2026-06-04T09:38:00+05:30', 'Jayanagar Loading Point', 'Koramangala 5th Block', 21.8, 68, 24, 72, 16, 6, 3,
    '[{"lat":12.925,"lng":77.5938,"recordedAt":"2026-06-04T08:30:00+05:30","speedKph":0},{"lat":12.9289,"lng":77.6042,"recordedAt":"2026-06-04T08:44:00+05:30","speedKph":35},{"lat":12.9326,"lng":77.6151,"recordedAt":"2026-06-04T09:01:00+05:30","speedKph":68},{"lat":12.9344,"lng":77.6204,"recordedAt":"2026-06-04T09:22:00+05:30","speedKph":18},{"lat":12.9352,"lng":77.6245,"recordedAt":"2026-06-04T09:38:00+05:30","speedKph":11}]'::jsonb),
  ('trip-1003', 'veh-004', '2026-06-04T07:45:00+05:30', '2026-06-04T09:25:00+05:30', 'Bommasandra', 'Electronic City Phase 1', 33.6, 100, 29, 61, 11, 4, 1,
    '[{"lat":12.8167,"lng":77.6974,"recordedAt":"2026-06-04T07:45:00+05:30","speedKph":0},{"lat":12.8246,"lng":77.685,"recordedAt":"2026-06-04T08:05:00+05:30","speedKph":33},{"lat":12.8344,"lng":77.6747,"recordedAt":"2026-06-04T08:31:00+05:30","speedKph":44},{"lat":12.8411,"lng":77.6664,"recordedAt":"2026-06-04T09:01:00+05:30","speedKph":29},{"lat":12.8452,"lng":77.6602,"recordedAt":"2026-06-04T09:25:00+05:30","speedKph":15}]'::jsonb),
  ('trip-1004', 'veh-006', '2026-06-04T10:00:00+05:30', '2026-06-04T11:12:00+05:30', 'Yeshwanthpur Yard', 'Hebbal Flyover', 24.1, 72, 31, 58, 8, 2, 0,
    '[{"lat":13.025,"lng":77.5438,"recordedAt":"2026-06-04T10:00:00+05:30","speedKph":0},{"lat":13.0312,"lng":77.5601,"recordedAt":"2026-06-04T10:16:00+05:30","speedKph":34},{"lat":13.0385,"lng":77.5762,"recordedAt":"2026-06-04T10:35:00+05:30","speedKph":41},{"lat":13.039,"lng":77.5881,"recordedAt":"2026-06-04T10:54:00+05:30","speedKph":30},{"lat":13.0358,"lng":77.597,"recordedAt":"2026-06-04T11:12:00+05:30","speedKph":12}]'::jsonb)
on conflict (id) do nothing;

insert into public.fleet_alerts (id, vehicle_id, title, description, severity, status, created_at) values
  ('alert-001', 'veh-002', 'Fuel below operating threshold', 'KA 05 MX 2719 is at 18% fuel while still assigned to an active route.', 'critical', 'open', '2026-06-04T12:08:00+05:30'),
  ('alert-002', 'veh-002', 'Repeated overspeeding', 'Three overspeed events were recorded on the Jayanagar to Koramangala trip.', 'warning', 'acknowledged', '2026-06-04T09:40:00+05:30'),
  ('alert-003', 'veh-005', 'Vehicle has not reported recently', 'KA 04 NB 7721 last reported from Peenya Depot over three hours ago.', 'warning', 'open', '2026-06-04T11:50:00+05:30'),
  ('alert-004', 'veh-004', 'Idle time improving', 'Electronic City route idle time is 22% lower than yesterday average.', 'info', 'resolved', '2026-06-04T09:30:00+05:30')
on conflict (id) do nothing;

insert into public.telemetry_points (
  id, vehicle_id, recorded_at, lat, lng, speed_kph, ignition, energy_level
) values
  ('tp-001', 'veh-001', '2026-06-04T09:05:00+05:30', 12.9854, 77.6639, 0, false, 76),
  ('tp-002', 'veh-001', '2026-06-04T09:18:00+05:30', 12.9787, 77.6571, 22, true, 75),
  ('tp-003', 'veh-001', '2026-06-04T09:34:00+05:30', 12.9738, 77.6502, 31, true, 74),
  ('tp-004', 'veh-001', '2026-06-04T09:47:00+05:30', 12.9699, 77.6446, 27, true, 73),
  ('tp-005', 'veh-001', '2026-06-04T10:02:00+05:30', 12.9719, 77.6412, 8, true, 72),
  ('tp-006', 'veh-002', '2026-06-04T08:30:00+05:30', 12.9250, 77.5938, 0, false, 23),
  ('tp-007', 'veh-002', '2026-06-04T08:44:00+05:30', 12.9289, 77.6042, 35, true, 22),
  ('tp-008', 'veh-002', '2026-06-04T09:01:00+05:30', 12.9326, 77.6151, 68, true, 20),
  ('tp-009', 'veh-002', '2026-06-04T09:22:00+05:30', 12.9344, 77.6204, 18, true, 19),
  ('tp-010', 'veh-002', '2026-06-04T09:38:00+05:30', 12.9352, 77.6245, 11, true, 18),
  ('tp-011', 'veh-004', '2026-06-04T07:45:00+05:30', 12.8167, 77.6974, 0, false, 71),
  ('tp-012', 'veh-004', '2026-06-04T08:05:00+05:30', 12.8246, 77.6850, 33, true, 70),
  ('tp-013', 'veh-004', '2026-06-04T08:31:00+05:30', 12.8344, 77.6747, 44, true, 69),
  ('tp-014', 'veh-004', '2026-06-04T09:01:00+05:30', 12.8411, 77.6664, 29, true, 68),
  ('tp-015', 'veh-004', '2026-06-04T09:25:00+05:30', 12.8452, 77.6602, 15, true, 67),
  ('tp-016', 'veh-006', '2026-06-04T10:00:00+05:30', 13.0250, 77.5438, 0, false, 53),
  ('tp-017', 'veh-006', '2026-06-04T10:16:00+05:30', 13.0312, 77.5601, 34, true, 52),
  ('tp-018', 'veh-006', '2026-06-04T10:35:00+05:30', 13.0385, 77.5762, 41, true, 51),
  ('tp-019', 'veh-006', '2026-06-04T10:54:00+05:30', 13.0390, 77.5881, 30, true, 50),
  ('tp-020', 'veh-006', '2026-06-04T11:12:00+05:30', 13.0358, 77.5970, 12, true, 49)
on conflict (id) do update set
  recorded_at = excluded.recorded_at,
  lat = excluded.lat,
  lng = excluded.lng,
  speed_kph = excluded.speed_kph,
  ignition = excluded.ignition,
  energy_level = excluded.energy_level;
