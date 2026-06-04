import { fleetSeed } from "@/features/fleet/data/fleet-seed";
import type {
  AlertStatus,
  FleetAlert,
  FleetDataset,
  TelemetryPoint,
  Trip,
  Vehicle,
} from "@/features/fleet/types";
import { supabase } from "@/lib/supabase";

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
  if (!supabase) return fleetSeed;

  const [vehicles, trips, alerts, telemetry] = await Promise.all([
    supabase.from("vehicles").select("*").order("registration"),
    supabase.from("trips").select("*").order("started_at", { ascending: false }),
    supabase.from("fleet_alerts").select("*").order("created_at", { ascending: false }),
    supabase
      .from("telemetry_points")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(200),
  ]);

  if (vehicles.error || trips.error || alerts.error || telemetry.error) {
    return fleetSeed;
  }

  return {
    vehicles: ((vehicles.data ?? []) as VehicleRow[]).map(mapVehicle),
    trips: ((trips.data ?? []) as TripRow[]).map(mapTrip),
    alerts: ((alerts.data ?? []) as AlertRow[]).map(mapAlert),
    telemetry: ((telemetry.data ?? []) as TelemetryRow[]).map(mapTelemetry),
  };
}

export async function updateFleetAlertStatus(alertId: string, status: AlertStatus) {
  if (!supabase) {
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    return;
  }

  const { error } = await supabase.from("fleet_alerts").update({ status }).eq("id", alertId);

  if (error) throw new Error(error.message);
}
