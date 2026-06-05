import type {
  AlertStatus,
  AlertPageResult,
  FleetAlert,
  FleetDataset,
  TelemetryPoint,
  Trip,
  TripPageResult,
  Vehicle,
  VehicleQueueResult,
} from "@/features/fleet/types";
import type { AlertFilter } from "@/store";
import { supabase } from "@/lib/supabase";

const DASHBOARD_VEHICLE_LIMIT = 100;
const DASHBOARD_TRIP_LIMIT = 200;
const DASHBOARD_ALERT_LIMIT = 200;
const VEHICLE_QUEUE_LIMIT = 25;

interface VehicleRow {
  id: string;
  registration: string;
  model: string;
  driver: string;
  status: Vehicle["status"];
  ignition: boolean;
  energy_type: Vehicle["energyType"];
  energy_level: number;
  odometer_km: number;
  last_seen_at: string;
  location_name: string;
  current_lat: number;
  current_lng: number;
}

interface TripRow {
  id: string;
  vehicle_id: string;
  started_at: string;
  ended_at: string;
  start_location: string;
  end_location: string;
  distance_km: number;
  duration_minutes: number;
  average_speed_kph: number;
  max_speed_kph: number;
  idle_minutes: number;
  halt_count: number;
  overspeed_events: number;
  route_points: Trip["route"];
}

interface AlertRow {
  id: string;
  vehicle_id: string;
  title: string;
  description: string;
  severity: FleetAlert["severity"];
  status: FleetAlert["status"];
  created_at: string;
}

interface TelemetryRow {
  id: string;
  vehicle_id: string;
  recorded_at: string;
  lat: number;
  lng: number;
  speed_kph: number;
  ignition: boolean;
  energy_level: number;
}

const mapVehicle = (row: VehicleRow): Vehicle => ({
  id: row.id,
  registration: row.registration,
  model: row.model,
  driver: row.driver,
  status: row.status,
  ignition: row.ignition,
  energyType: row.energy_type,
  energyLevel: row.energy_level,
  odometerKm: row.odometer_km,
  lastSeenAt: row.last_seen_at,
  locationName: row.location_name,
  currentLocation: { lat: row.current_lat, lng: row.current_lng },
});

const mapTrip = (row: TripRow): Trip => ({
  id: row.id,
  vehicleId: row.vehicle_id,
  startedAt: row.started_at,
  endedAt: row.ended_at,
  startLocation: row.start_location,
  endLocation: row.end_location,
  distanceKm: row.distance_km,
  durationMinutes: row.duration_minutes,
  averageSpeedKph: row.average_speed_kph,
  maxSpeedKph: row.max_speed_kph,
  idleMinutes: row.idle_minutes,
  haltCount: row.halt_count,
  overspeedEvents: row.overspeed_events,
  route: row.route_points ?? [],
});

const mapAlert = (row: AlertRow): FleetAlert => ({
  id: row.id,
  vehicleId: row.vehicle_id,
  title: row.title,
  description: row.description,
  severity: row.severity,
  status: row.status,
  createdAt: row.created_at,
});

const mapTelemetry = (row: TelemetryRow): TelemetryPoint => ({
  id: row.id,
  vehicleId: row.vehicle_id,
  recordedAt: row.recorded_at,
  lat: row.lat,
  lng: row.lng,
  speedKph: row.speed_kph,
  ignition: row.ignition,
  energyLevel: row.energy_level,
});

export async function fetchFleetDataset(): Promise<FleetDataset> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const [vehicles, trips, alerts, telemetry] = await Promise.all([
    supabase
      .from("vehicles")
      .select("*")
      .order("last_seen_at", { ascending: false })
      .limit(DASHBOARD_VEHICLE_LIMIT),
    supabase
      .from("trips")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(DASHBOARD_TRIP_LIMIT),
    supabase
      .from("fleet_alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(DASHBOARD_ALERT_LIMIT),
    supabase
      .from("telemetry_points")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(200),
  ]);

  if (vehicles.error || trips.error || alerts.error || telemetry.error) {
    throw new Error(
      vehicles.error?.message ??
        trips.error?.message ??
        alerts.error?.message ??
        telemetry.error?.message ??
        "Unable to load fleet dataset",
    );
  }

  return {
    vehicles: ((vehicles.data ?? []) as VehicleRow[]).map(mapVehicle),
    trips: ((trips.data ?? []) as TripRow[]).map(mapTrip),
    alerts: ((alerts.data ?? []) as AlertRow[]).map(mapAlert),
    telemetry: ((telemetry.data ?? []) as TelemetryRow[]).map(mapTelemetry),
  };
}

export async function fetchVehicleQueue({
  search,
  page = 0,
  limit = VEHICLE_QUEUE_LIMIT,
}: {
  search: string;
  page?: number;
  limit?: number;
}): Promise<VehicleQueueResult> {
  const normalizedSearch = search.trim();
  const from = page * limit;
  const to = from + limit - 1;

  if (!supabase) throw new Error("Supabase is not configured.");

  let vehicleQuery = supabase
    .from("vehicles")
    .select("*", { count: "exact" })
    .order("registration")
    .range(from, to);

  if (normalizedSearch) {
    const escapedSearch = normalizedSearch.replaceAll("%", "\\%").replaceAll("_", "\\_");
    const pattern = `%${escapedSearch}%`;
    vehicleQuery = vehicleQuery.or(
      [
        `registration.ilike.${pattern}`,
        `model.ilike.${pattern}`,
        `driver.ilike.${pattern}`,
        `location_name.ilike.${pattern}`,
        `status.ilike.${pattern}`,
      ].join(","),
    );
  }

  const vehicles = await vehicleQuery;

  if (vehicles.error) {
    throw new Error(vehicles.error.message);
  }

  const vehicleRows = ((vehicles.data ?? []) as VehicleRow[]).map(mapVehicle);
  const vehicleIds = vehicleRows.map((vehicle) => vehicle.id);

  if (vehicleIds.length === 0) {
    return {
      vehicles: [],
      trips: [],
      alerts: [],
      totalCount: vehicles.count ?? 0,
      limit,
      nextPage: null,
    };
  }

  const [trips, alerts] = await Promise.all([
    supabase
      .from("trips")
      .select("*")
      .in("vehicle_id", vehicleIds)
      .order("started_at", { ascending: false })
      .limit(limit * 3),
    supabase
      .from("fleet_alerts")
      .select("*")
      .in("vehicle_id", vehicleIds)
      .neq("status", "resolved")
      .order("created_at", { ascending: false })
      .limit(limit * 3),
  ]);

  if (trips.error || alerts.error) {
    throw new Error(
      trips.error?.message ?? alerts.error?.message ?? "Unable to load vehicle queue",
    );
  }

  return {
    vehicles: vehicleRows,
    trips: ((trips.data ?? []) as TripRow[]).map(mapTrip),
    alerts: ((alerts.data ?? []) as AlertRow[]).map(mapAlert),
    totalCount: vehicles.count ?? vehicleRows.length,
    limit,
    nextPage: vehicles.count && to + 1 < vehicles.count ? page + 1 : null,
  };
}

export async function fetchTripPage({
  search,
  dateFrom,
  dateTo,
  sortKey,
  page,
  pageSize,
}: {
  search: string;
  dateFrom: string;
  dateTo: string;
  sortKey: "startedAt" | "distanceKm" | "idleMinutes" | "overspeedEvents";
  page: number;
  pageSize: number;
}): Promise<TripPageResult> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const normalizedSearch = search.trim();
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const sortColumnMap = {
    startedAt: "started_at",
    distanceKm: "distance_km",
    idleMinutes: "idle_minutes",
    overspeedEvents: "overspeed_events",
  } as const;

  let vehicleIds: string[] = [];
  if (normalizedSearch) {
    const escapedSearch = normalizedSearch.replaceAll("%", "\\%").replaceAll("_", "\\_");
    const pattern = `%${escapedSearch}%`;
    const matchedVehicles = await supabase
      .from("vehicles")
      .select("id")
      .or(
        [
          `registration.ilike.${pattern}`,
          `model.ilike.${pattern}`,
          `driver.ilike.${pattern}`,
          `location_name.ilike.${pattern}`,
        ].join(","),
      )
      .limit(200);

    if (matchedVehicles.error) throw new Error(matchedVehicles.error.message);
    vehicleIds = (matchedVehicles.data ?? []).map((vehicle) => vehicle.id);
  }

  let tripQuery = supabase
    .from("trips")
    .select("*", { count: "exact" })
    .order(sortColumnMap[sortKey], { ascending: false })
    .range(from, to);

  if (dateFrom) tripQuery = tripQuery.gte("started_at", `${dateFrom}T00:00:00`);
  if (dateTo) tripQuery = tripQuery.lte("started_at", `${dateTo}T23:59:59`);

  if (normalizedSearch) {
    const escapedSearch = normalizedSearch.replaceAll("%", "\\%").replaceAll("_", "\\_");
    const pattern = `%${escapedSearch}%`;
    const filters = [`start_location.ilike.${pattern}`, `end_location.ilike.${pattern}`];
    if (vehicleIds.length > 0) filters.push(`vehicle_id.in.(${vehicleIds.join(",")})`);
    tripQuery = tripQuery.or(filters.join(","));
  }

  const trips = await tripQuery;
  if (trips.error) throw new Error(trips.error.message);

  const tripRows = ((trips.data ?? []) as TripRow[]).map(mapTrip);
  const tripVehicleIds = [...new Set(tripRows.map((trip) => trip.vehicleId))];
  const vehicles =
    tripVehicleIds.length > 0
      ? await supabase.from("vehicles").select("*").in("id", tripVehicleIds)
      : { data: [], error: null };

  if (vehicles.error) throw new Error(vehicles.error.message);

  return {
    trips: tripRows,
    vehicles: ((vehicles.data ?? []) as VehicleRow[]).map(mapVehicle),
    totalCount: trips.count ?? tripRows.length,
    page,
    pageSize,
  };
}

export async function fetchAlertPage({
  search,
  status,
  page,
  pageSize,
}: {
  search: string;
  status: AlertFilter;
  page: number;
  pageSize: number;
}): Promise<AlertPageResult> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const normalizedSearch = search.trim();
  const from = page * pageSize;
  const to = from + pageSize - 1;
  let vehicleIds: string[] = [];

  if (normalizedSearch) {
    const escapedSearch = normalizedSearch.replaceAll("%", "\\%").replaceAll("_", "\\_");
    const pattern = `%${escapedSearch}%`;
    const matchedVehicles = await supabase
      .from("vehicles")
      .select("id")
      .or(
        [
          `registration.ilike.${pattern}`,
          `model.ilike.${pattern}`,
          `driver.ilike.${pattern}`,
          `location_name.ilike.${pattern}`,
        ].join(","),
      )
      .limit(500);

    if (matchedVehicles.error) throw new Error(matchedVehicles.error.message);
    vehicleIds = (matchedVehicles.data ?? []).map((vehicle) => vehicle.id);

    if (vehicleIds.length === 0) {
      return { alerts: [], vehicles: [], totalCount: 0, page, pageSize };
    }
  }

  let alertQuery = supabase
    .from("fleet_alerts")
    .select("*", { count: "exact" })
    .order("status", { ascending: true })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status !== "all") alertQuery = alertQuery.eq("status", status);
  if (vehicleIds.length > 0) alertQuery = alertQuery.in("vehicle_id", vehicleIds);

  const alerts = await alertQuery;

  if (alerts.error) throw new Error(alerts.error.message);

  const alertRows = ((alerts.data ?? []) as AlertRow[]).map(mapAlert);
  const alertVehicleIds = [...new Set(alertRows.map((alert) => alert.vehicleId))];
  const vehicles =
    alertVehicleIds.length > 0
      ? await supabase.from("vehicles").select("*").in("id", alertVehicleIds)
      : { data: [], error: null };

  if (vehicles.error) throw new Error(vehicles.error.message);

  return {
    alerts: alertRows,
    vehicles: ((vehicles.data ?? []) as VehicleRow[]).map(mapVehicle),
    totalCount: alerts.count ?? alertRows.length,
    page,
    pageSize,
  };
}

export async function fetchVehicleSnapshot(vehicleId: string): Promise<FleetDataset> {
  if (!vehicleId) {
    return { vehicles: [], trips: [], alerts: [], telemetry: [] };
  }

  if (!supabase) throw new Error("Supabase is not configured.");

  const [vehicle, trips, alerts, telemetry] = await Promise.all([
    supabase.from("vehicles").select("*").eq("id", vehicleId).maybeSingle(),
    supabase
      .from("trips")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .order("started_at", { ascending: false })
      .limit(5),
    supabase
      .from("fleet_alerts")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .neq("status", "resolved")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("telemetry_points")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .order("recorded_at", { ascending: false })
      .limit(50),
  ]);

  if (vehicle.error || trips.error || alerts.error || telemetry.error) {
    throw new Error(
      vehicle.error?.message ??
        trips.error?.message ??
        alerts.error?.message ??
        telemetry.error?.message ??
        "Unable to load vehicle snapshot",
    );
  }

  return {
    vehicles: vehicle.data ? [mapVehicle(vehicle.data as VehicleRow)] : [],
    trips: ((trips.data ?? []) as TripRow[]).map(mapTrip),
    alerts: ((alerts.data ?? []) as AlertRow[]).map(mapAlert),
    telemetry: ((telemetry.data ?? []) as TelemetryRow[]).map(mapTelemetry),
  };
}

export async function updateFleetAlertStatus(alertId: string, status: AlertStatus) {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("fleet_alerts").update({ status }).eq("id", alertId);

  if (error) throw new Error(error.message);
}
