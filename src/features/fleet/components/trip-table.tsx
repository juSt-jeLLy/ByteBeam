import { ArrowUpDown } from "lucide-react";
import { useEffect } from "react";
import { getVehicleForTrip } from "@/features/fleet";
import { useTripPage } from "@/features/fleet/hooks/use-fleet-query";
import {
  useSetTripPage,
  useSetTripDateFrom,
  useSetTripDateTo,
  useSetTripSearch,
  useSetTripSortKey,
  useTripDateFrom,
  useTripPageIndex,
  useTripDateTo,
  useTripSearch,
  useTripSortKey,
} from "@/store";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const TRIP_PAGE_SIZE = 10;

export function TripTable() {
  const sortKey = useTripSortKey();
  const setSortKey = useSetTripSortKey();
  const query = useTripSearch();
  const debouncedQuery = useDebouncedValue(query);
  const setQuery = useSetTripSearch();
  const dateFrom = useTripDateFrom();
  const dateTo = useTripDateTo();
  const setDateFrom = useSetTripDateFrom();
  const setDateTo = useSetTripDateTo();
  const page = useTripPageIndex();
  const setPage = useSetTripPage();

  useEffect(() => {
    setPage(0);
  }, [dateFrom, dateTo, debouncedQuery, setPage, sortKey]);

  const { data, isFetching, isError } = useTripPage({
    search: debouncedQuery,
    dateFrom,
    dateTo,
    sortKey,
    page,
    pageSize: TRIP_PAGE_SIZE,
  });
  const rows = data?.trips ?? [];
  const vehicles = data?.vehicles ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / TRIP_PAGE_SIZE));

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
            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>
                  {isFetching ? "Loading trips…" : "No trips match the current filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {isError && <p className="text-sm text-destructive">Unable to load trips from Supabase.</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-muted-foreground">
          Showing page {page + 1} of {totalPages} · {totalCount} matching trips
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page === 0 || isFetching}
            onClick={() => setPage(Math.max(0, page - 1))}
            className="rounded-md border border-border px-3 py-1.5 font-medium transition-smooth hover:bg-accent disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page + 1 >= totalPages || isFetching}
            onClick={() => setPage(page + 1)}
            className="rounded-md border border-border px-3 py-1.5 font-medium transition-smooth hover:bg-accent disabled:opacity-50"
          >
            Next
          </button>
        </div>
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
