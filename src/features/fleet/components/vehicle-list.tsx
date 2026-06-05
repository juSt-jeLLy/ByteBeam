import type { UIEvent } from "react";
import { Battery, Fuel, Gauge, Search } from "lucide-react";
import type { FleetAlert, Trip, Vehicle } from "@/features/fleet/types";
import { cn } from "@/lib/utils";
import { formatRelativeTime, getVehicleAlerts } from "@/features/fleet";
import { VehicleStatusBadge } from "./status-badge";
import { useGlobalSearch, useSetGlobalSearch } from "@/store";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useVehicleQueue } from "@/features/fleet/hooks/use-fleet-query";

interface VehicleListProps {
  vehicles: Vehicle[];
  trips: Trip[];
  alerts: FleetAlert[];
  selectedVehicleId: string;
  onSelect: (vehicleId: string) => void;
  compact?: boolean;
  className?: string;
  serverSearch?: boolean;
  limit?: number;
}

export function VehicleList({
  vehicles,
  trips,
  alerts,
  selectedVehicleId,
  onSelect,
  compact = false,
  className,
  serverSearch = false,
  limit = 25,
}: VehicleListProps) {
  const rawSearch = useGlobalSearch();
  const setGlobalSearch = useSetGlobalSearch();
  const debouncedSearch = useDebouncedValue(rawSearch).trim();
  const queueQuery = useVehicleQueue(debouncedSearch, limit, serverSearch);
  const queuePages = serverSearch ? (queueQuery.data?.pages ?? []) : [];
  const sourceVehicles = serverSearch ? queuePages.flatMap((page) => page.vehicles) : vehicles;
  const sourceTrips = serverSearch ? queuePages.flatMap((page) => page.trips) : trips;
  const sourceAlerts = serverSearch ? queuePages.flatMap((page) => page.alerts) : alerts;
  const normalizedSearch = debouncedSearch.toLowerCase();
  const filteredVehicles = serverSearch
    ? sourceVehicles
    : sourceVehicles.filter((vehicle) => {
        if (!normalizedSearch) return true;
        return `${vehicle.registration} ${vehicle.model} ${vehicle.driver} ${vehicle.locationName} ${vehicle.status}`
          .toLowerCase()
          .includes(normalizedSearch);
      });
  const totalCount = queuePages[0]?.totalCount ?? filteredVehicles.length;

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!serverSearch || !queueQuery.hasNextPage || queueQuery.isFetchingNextPage) return;

    const target = event.currentTarget;
    const remainingScroll = target.scrollHeight - target.scrollTop - target.clientHeight;
    if (remainingScroll < 160) void queueQuery.fetchNextPage();
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={rawSearch}
            onChange={(event) => setGlobalSearch(event.target.value)}
            placeholder="Search vehicle number…"
            className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none transition-smooth focus:ring-2 focus:ring-ring"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Showing {filteredVehicles.length} of {totalCount} vehicle{totalCount === 1 ? "" : "s"}
          {serverSearch ? " from indexed search" : ""}
        </p>
      </div>

      <div className={cn("space-y-2", className)} onScroll={handleScroll}>
        {queueQuery.isFetching && serverSearch && filteredVehicles.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">
            Searching indexed vehicle records…
          </div>
        )}
        {queueQuery.isError && serverSearch && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            Unable to search vehicles. Showing cached dashboard results.
          </div>
        )}
        {filteredVehicles.map((vehicle) => {
          const selected = vehicle.id === selectedVehicleId;
          const trip = sourceTrips.find((candidate) => candidate.vehicleId === vehicle.id);
          const vehicleAlerts = getVehicleAlerts(sourceAlerts, vehicle.id).filter(
            (alert) => alert.status !== "resolved",
          );
          const EnergyIcon = vehicle.energyType === "battery" ? Battery : Fuel;

          return (
            <button
              key={vehicle.id}
              type="button"
              onClick={() => onSelect(vehicle.id)}
              className={cn(
                "w-full rounded-lg border bg-card text-left transition-smooth hover:border-primary/50",
                compact ? "p-3" : "p-4",
                selected ? "border-primary ring-2 ring-primary/20" : "border-border",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={cn("truncate font-semibold", compact ? "text-sm" : "text-base")}>
                    {vehicle.registration}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {vehicle.model} · {vehicle.driver}
                  </p>
                </div>
                <VehicleStatusBadge status={vehicle.status} />
              </div>
              <div className={cn("grid grid-cols-3 gap-2 text-xs", compact ? "mt-2" : "mt-3")}>
                <Metric icon={EnergyIcon} label={`${vehicle.energyLevel}%`} />
                <Metric icon={Gauge} label={trip ? `${trip.averageSpeedKph} km/h` : "No trip"} />
                <Metric label={formatRelativeTime(vehicle.lastSeenAt)} />
              </div>
              {vehicleAlerts.length > 0 && (
                <p
                  className={cn("text-xs font-medium text-destructive", compact ? "mt-2" : "mt-3")}
                >
                  {vehicleAlerts.length} open alert{vehicleAlerts.length > 1 ? "s" : ""}
                </p>
              )}
            </button>
          );
        })}
        {filteredVehicles.length === 0 && !queueQuery.isFetching && (
          <div className="rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">
            No vehicles match the current search.
          </div>
        )}
        {queueQuery.isFetchingNextPage && (
          <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
            Loading more vehicles…
          </div>
        )}
        {serverSearch && !queueQuery.hasNextPage && filteredVehicles.length > 0 && (
          <div className="py-2 text-center text-xs text-muted-foreground">
            End of matching vehicles
          </div>
        )}
      </div>
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
    <span className="inline-flex min-h-7 items-center justify-center gap-1 rounded-md bg-muted px-2 text-muted-foreground">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}
