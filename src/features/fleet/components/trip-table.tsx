import { ArrowUpDown } from "lucide-react";
import { useMemo } from "react";
import type { Trip, Vehicle } from "@/features/fleet/types";
import { getVehicleForTrip } from "@/features/fleet";
import {
  useSetTripDateFrom,
  useSetTripDateTo,
  useSetTripSearch,
  useSetTripSortKey,
  useTripDateFrom,
  useTripDateTo,
  useTripSearch,
  useTripSortKey,
} from "@/store";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export function TripTable({ trips, vehicles }: { trips: Trip[]; vehicles: Vehicle[] }) {
  const sortKey = useTripSortKey();
  const setSortKey = useSetTripSortKey();
  const query = useTripSearch();
  const debouncedQuery = useDebouncedValue(query);
  const setQuery = useSetTripSearch();
  const dateFrom = useTripDateFrom();
  const dateTo = useTripDateTo();
  const setDateFrom = useSetTripDateFrom();
  const setDateTo = useSetTripDateTo();

  const rows = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase();
    return [...trips]
      .filter((trip) => {
        const tripDate = trip.startedAt.slice(0, 10);
        if (dateFrom && tripDate < dateFrom) return false;
        if (dateTo && tripDate > dateTo) return false;

        const vehicle = getVehicleForTrip(vehicles, trip);
        const haystack =
          `${vehicle?.registration ?? ""} ${trip.startLocation} ${trip.endLocation}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (sortKey === "startedAt") return b.startedAt.localeCompare(a.startedAt);
        return Number(b[sortKey]) - Number(a[sortKey]);
      });
  }, [dateFrom, dateTo, debouncedQuery, sortKey, trips, vehicles]);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_170px_170px]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search vehicle or location"
          className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
          type="date"
          aria-label="Trip date from"
          className="h-10 rounded-md border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
          type="date"
          aria-label="Trip date to"
          className="h-10 rounded-md border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <Th label="Vehicle" />
              <Th label="Route" />
              <Th label="Started" onSort={() => setSortKey("startedAt")} />
              <Th label="Distance" onSort={() => setSortKey("distanceKm")} />
              <Th label="Avg / Max" />
              <Th label="Idle" onSort={() => setSortKey("idleMinutes")} />
              <Th label="Overspeed" onSort={() => setSortKey("overspeedEvents")} />
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {rows.map((trip) => {
              const vehicle = getVehicleForTrip(vehicles, trip);
              return (
                <tr key={trip.id}>
                  <td className="px-4 py-3 font-medium">
                    {vehicle?.registration ?? trip.vehicleId}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {trip.startLocation} to {trip.endLocation}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(trip.startedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">{trip.distanceKm} km</td>
                  <td className="px-4 py-3">
                    {trip.averageSpeedKph} / {trip.maxSpeedKph} km/h
                  </td>
                  <td className="px-4 py-3">{trip.idleMinutes} min</td>
                  <td className="px-4 py-3">{trip.overspeedEvents}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ label, onSort }: { label: string; onSort?: () => void }) {
  return (
    <th className="px-4 py-3">
      {onSort ? (
        <button
          type="button"
          onClick={onSort}
          className="inline-flex items-center gap-1 font-semibold"
        >
          {label}
          <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ) : (
        label
      )}
    </th>
  );
}
