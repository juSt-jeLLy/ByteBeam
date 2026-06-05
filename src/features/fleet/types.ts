export type VehicleStatus = "active" | "idle" | "offline" | "attention";
export type EnergyType = "fuel" | "battery";
export type AlertSeverity = "critical" | "warning" | "info";
export type AlertStatus = "open" | "acknowledged" | "resolved";

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Vehicle {
  id: string;
  registration: string;
  model: string;
  driver: string;
  status: VehicleStatus;
  ignition: boolean;
  energyType: EnergyType;
  energyLevel: number;
  odometerKm: number;
  lastSeenAt: string;
  locationName: string;
  currentLocation: Coordinate;
}

export interface RoutePoint extends Coordinate {
  recordedAt: string;
  speedKph: number;
}

export interface Trip {
  id: string;
  vehicleId: string;
  startedAt: string;
  endedAt: string;
  startLocation: string;
  endLocation: string;
  distanceKm: number;
  durationMinutes: number;
  averageSpeedKph: number;
  maxSpeedKph: number;
  idleMinutes: number;
  haltCount: number;
  overspeedEvents: number;
  route: RoutePoint[];
}

export interface FleetAlert {
  id: string;
  vehicleId: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: string;
}

export interface TelemetryPoint extends RoutePoint {
  id: string;
  vehicleId: string;
  ignition: boolean;
  energyLevel: number;
}

export interface FleetDataset {
  vehicles: Vehicle[];
  trips: Trip[];
  alerts: FleetAlert[];
  telemetry: TelemetryPoint[];
}

export interface VehicleQueueResult {
  vehicles: Vehicle[];
  trips: Trip[];
  alerts: FleetAlert[];
  totalCount: number;
  limit: number;
  nextPage: number | null;
}

export interface TripPageResult {
  trips: Trip[];
  vehicles: Vehicle[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface AlertPageResult {
  alerts: FleetAlert[];
  vehicles: Vehicle[];
  totalCount: number;
  page: number;
  pageSize: number;
}
