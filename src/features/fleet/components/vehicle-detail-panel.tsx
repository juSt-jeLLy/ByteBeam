import { Battery, Fuel, Gauge, MapPin, Power, Route, Timer, User } from "lucide-react";
import type { FleetAlert, TelemetryPoint, Trip, Vehicle } from "@/features/fleet/types";
import { formatRelativeTime, useUpdateAlertStatus } from "@/features/fleet";
import { AlertSeverityBadge, AlertStatusBadge, VehicleStatusBadge } from "./status-badge";

interface VehicleDetailPanelProps {
  vehicle?: Vehicle;
  trip?: Trip;
  alerts: FleetAlert[];
  telemetry: TelemetryPoint[];
  compact?: boolean;
  showAlertActions?: boolean;
}

export function VehicleDetailPanel({
  vehicle,
  trip,
  alerts,
  telemetry,
  compact = false,
  showAlertActions = false,
}: VehicleDetailPanelProps) {
  const updateAlertStatus = useUpdateAlertStatus();

  if (!vehicle) {
    return (
      <div className="rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">
        Select a vehicle to inspect details.
      </div>
    );
  }

  const EnergyIcon = vehicle.energyType === "battery" ? Battery : Fuel;
  const vehicleAlerts = alerts.filter(
    (alert) => alert.vehicleId === vehicle.id && alert.status !== "resolved",
  );
  const latestTelemetry = telemetry
    .filter((point) => point.vehicleId === vehicle.id)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0];

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold">{vehicle.registration}</p>
          <p className="text-xs text-muted-foreground">{vehicle.model}</p>
        </div>
        <VehicleStatusBadge status={vehicle.status} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <DetailItem icon={User} label="Driver" value={vehicle.driver} />
        <DetailItem icon={MapPin} label="Location" value={vehicle.locationName} />
        <DetailItem
          icon={EnergyIcon}
          label={vehicle.energyType}
          value={`${vehicle.energyLevel}%`}
        />
        <DetailItem icon={Power} label="Ignition" value={vehicle.ignition ? "On" : "Off"} />
        <DetailItem
          icon={Gauge}
          label="Last speed"
          value={`${latestTelemetry?.speedKph ?? 0} km/h`}
        />
        <DetailItem icon={Timer} label="Last seen" value={formatRelativeTime(vehicle.lastSeenAt)} />
        {!compact && (
          <DetailItem
            icon={Route}
            label="Odometer"
            value={`${vehicle.odometerKm.toLocaleString()} km`}
          />
        )}
        {!compact && (
          <DetailItem
            icon={MapPin}
            label="Coordinates"
            value={`${vehicle.currentLocation.lat.toFixed(4)}, ${vehicle.currentLocation.lng.toFixed(4)}`}
          />
        )}
      </div>

      {trip && (
        <div className="rounded-md bg-muted/45 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Route className="h-4 w-4 text-primary" />
            Recent route
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <span className="truncate">{trip.startLocation}</span>
            <span className="truncate">{trip.endLocation}</span>
            <span>{trip.distanceKm} km</span>
            <span>{trip.durationMinutes} min</span>
            {!compact && <span>{trip.haltCount} halts</span>}
            {!compact && <span>{trip.overspeedEvents} overspeed</span>}
          </div>
        </div>
      )}

      {vehicleAlerts.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Open issues</p>
          {vehicleAlerts.map((alert) => (
            <div key={alert.id} className="space-y-3 rounded-md bg-muted/45 p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{alert.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AlertSeverityBadge severity={alert.severity} />
                  <AlertStatusBadge status={alert.status} />
                </div>
              </div>
              {showAlertActions && (
                <div className="flex flex-wrap gap-2">
                  {alert.status === "open" && (
                    <button
                      type="button"
                      disabled={updateAlertStatus.isPending}
                      onClick={() =>
                        updateAlertStatus.mutate({ alertId: alert.id, status: "acknowledged" })
                      }
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold transition-smooth hover:bg-accent disabled:opacity-50"
                    >
                      Acknowledge
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={updateAlertStatus.isPending}
                    onClick={() =>
                      updateAlertStatus.mutate({ alertId: alert.id, status: "resolved" })
                    }
                    className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-smooth hover:opacity-90 disabled:opacity-50"
                  >
                    Resolve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-14 items-center gap-2 rounded-md bg-muted/45 p-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
