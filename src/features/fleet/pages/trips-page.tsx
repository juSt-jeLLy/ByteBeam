import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Skeleton } from "@/components/dashboard/Skeleton";
import { PageHeader } from "@/features/shared/components";
import { ExportCsvButton } from "@/features/shared/export";
import { computeTripEfficiency, useTripPage } from "@/features/fleet";
import { ChartLimitControl } from "@/features/fleet/components/chart-limit-control";
import { TripTable } from "@/features/fleet/components/trip-table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  useSetTripChartLimit,
  useTripChartLimit,
  useTripDateFrom,
  useTripDateTo,
  useTripSearch,
  useTripSortKey,
} from "@/store";

export function TripsPage() {
  const dateFrom = useTripDateFrom();
  const dateTo = useTripDateTo();
  const tripSearch = useTripSearch();
  const debouncedTripSearch = useDebouncedValue(tripSearch).trim();
  const tripSortKey = useTripSortKey();
  const tripChartLimit = useTripChartLimit();
  const setTripChartLimit = useSetTripChartLimit();
  const { data: chartTrips, isLoading: isChartLoading } = useTripPage({
    search: debouncedTripSearch,
    dateFrom,
    dateTo,
    sortKey: tripSortKey,
    page: 0,
    pageSize: tripChartLimit,
  });

  const chartEfficiency = computeTripEfficiency(
    chartTrips?.trips ?? [],
    chartTrips?.vehicles ?? [],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Trips"
          description="Trip history, speed behavior, route efficiency, and idle hotspots."
        />
        <ExportCsvButton fileName="bytebeam-trip-efficiency.csv" rows={chartEfficiency} />
      </div>

      <ChartCard
        title="Trip Efficiency"
        description="Latest matching trips, capped for chart readability"
        action={<ChartLimitControl value={tripChartLimit} onChange={setTripChartLimit} />}
      >
        {isChartLoading ? (
          <Skeleton className="h-[340px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={chartEfficiency} margin={{ top: 8, right: 16, left: 0, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vehicle" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="distanceKm" fill="#0f766e" name="Distance km" />
              <Bar dataKey="idleMinutes" fill="#f59e0b" name="Idle minutes" />
              <Bar dataKey="overspeedEvents" fill="#dc2626" name="Overspeed events" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Trip Log" description="Sortable trip records for operations review">
        <TripTable />
      </ChartCard>
    </div>
  );
}
