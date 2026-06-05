import type {
  FleetAlert,
  FleetDataset,
  Trip,
  Vehicle,
  VehicleStatus,
} from "@/features/fleet/types";

export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function getVehicleForTrip(vehicles: Vehicle[], trip: Trip): Vehicle | undefined {
  return vehicles.find((vehicle) => vehicle.id === trip.vehicleId);
}

export function getVehicleAlerts(alerts: FleetAlert[], vehicleId: string): FleetAlert[] {
  return alerts.filter((alert) => alert.vehicleId === vehicleId);
}

export function computeFleetMetrics({ vehicles, trips, alerts }: FleetDataset) {
  const activeVehicles = vehicles.filter((vehicle) => vehicle.status === "active").length;
  const attentionVehicles = vehicles.filter((vehicle) => vehicle.status === "attention").length;
  const openAlerts = alerts.filter((alert) => alert.status !== "resolved").length;
  const distanceToday = trips.reduce((sum, trip) => sum + trip.distanceKm, 0);
  const idleMinutes = trips.reduce((sum, trip) => sum + trip.idleMinutes, 0);
  const overspeedEvents = trips.reduce((sum, trip) => sum + trip.overspeedEvents, 0);
  const averageEnergy = Math.round(
    vehicles.reduce((sum, vehicle) => sum + vehicle.energyLevel, 0) / Math.max(1, vehicles.length),
  );

  return {
    totalVehicles: vehicles.length,
    activeVehicles,
    attentionVehicles,
    openAlerts,
    distanceToday,
    idleMinutes,
    overspeedEvents,
    averageEnergy,
  };
}

export function computeStatusBreakdown(vehicles: Vehicle[]) {
  const statuses: VehicleStatus[] = ["active", "idle", "attention", "offline"];
  return statuses.map((status) => ({
    status,
    count: vehicles.filter((vehicle) => vehicle.status === status).length,
  }));
}

export function computeTripEfficiency(trips: Trip[], vehicles: Vehicle[]) {
  return trips.map((trip) => {
    const vehicle = getVehicleForTrip(vehicles, trip);
    return {
      id: trip.id,
      vehicle: vehicle?.registration ?? trip.vehicleId,
      distanceKm: trip.distanceKm,
      averageSpeedKph: trip.averageSpeedKph,
      idleMinutes: trip.idleMinutes,
      haltCount: trip.haltCount,
      overspeedEvents: trip.overspeedEvents,
    };
  });
}

export function computeVehicleUtilization(vehicles: Vehicle[], trips: Trip[], limit = 12) {
  const rows = vehicles
    .map((vehicle) => {
      const vehicleTrips = trips.filter((trip) => trip.vehicleId === vehicle.id);
      return {
        vehicle: vehicle.registration,
        distanceKm: vehicleTrips.reduce((sum, trip) => sum + trip.distanceKm, 0),
        durationMinutes: vehicleTrips.reduce((sum, trip) => sum + trip.durationMinutes, 0),
        idleMinutes: vehicleTrips.reduce((sum, trip) => sum + trip.idleMinutes, 0),
      };
    })
    .sort((left, right) => right.distanceKm - left.distanceKm);

  return rows.slice(0, limit);
}
