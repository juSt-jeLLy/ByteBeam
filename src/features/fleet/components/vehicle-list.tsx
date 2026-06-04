import { Battery, Fuel, Gauge } from "lucide-react";
import type { FleetAlert, Trip, Vehicle } from "@/features/fleet/types";
import { cn } from "@/lib/utils";
import { formatRelativeTime, getVehicleAlerts } from "@/features/fleet";
import { VehicleStatusBadge } from "./status-badge";
import { useGlobalSearch } from "@/store";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

interface VehicleListProps {
  vehicles: Vehicle[];
  trips: Trip[];
  alerts: FleetAlert[];
  selectedVehicleId: string;
  onSelect: (vehicleId: string) => void;
}

export function VehicleList({
  vehicles,
  trips,
  alerts,
  selectedVehicleId,
  onSelect,
}: VehicleListProps) {
  const globalSearch = useDebouncedValue(useGlobalSearch()).trim().toLowerCase();
  const filteredVehicles = vehicles.filter((vehicle) => {
    if (!globalSearch) return true;
    return `${vehicle.registration} ${vehicle.model} ${vehicle.driver} ${vehicle.locationName} ${vehicle.status}`
      .toLowerCase()
      .includes(globalSearch);
  });

  return (
    <div className="space-y-3">
      {filteredVehicles.map((vehicle) => {
        const selected = vehicle.id === selectedVehicleId;
        const trip = trips.find((candidate) => candidate.vehicleId === vehicle.id);
        const vehicleAlerts = getVehicleAlerts(alerts, vehicle.id).filter(
          (alert) => alert.status !== "resolved",
        );
        const EnergyIcon = vehicle.energyType === "battery" ? Battery : Fuel;

        return (
          <button
            key={vehicle.id}
            type="button"
            onClick={() => onSelect(vehicle.id)}
            className={cn(
              "w-full rounded-lg border bg-card p-4 text-left transition-smooth hover:border-primary/50",
              selected ? "border-primary ring-2 ring-primary/20" : "border-border",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{vehicle.registration}</p>
                <p className="text-xs text-muted-foreground">
                  {vehicle.model} · {vehicle.driver}
                </p>
              </div>
              <VehicleStatusBadge status={vehicle.status} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <Metric icon={EnergyIcon} label={`${vehicle.energyLevel}%`} />
              <Metric icon={Gauge} label={trip ? `${trip.averageSpeedKph} km/h` : "No trip"} />
              <Metric label={formatRelativeTime(vehicle.lastSeenAt)} />
            </div>
            {vehicleAlerts.length > 0 && (
              <p className="mt-3 text-xs font-medium text-destructive">
                {vehicleAlerts.length} open alert{vehicleAlerts.length > 1 ? "s" : ""}
              </p>
            )}
          </button>
        );
      })}
      {filteredVehicles.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">
          No vehicles match the current search.
        </div>
      )}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="inline-flex min-h-8 items-center justify-center gap-1 rounded-md bg-muted px-2 text-muted-foreground">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}
