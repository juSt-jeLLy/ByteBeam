import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Skeleton } from "@/components/dashboard/Skeleton";
import { PageHeader } from "@/features/shared/components";
import { ExportCsvButton } from "@/features/shared/export";
import { computeTripEfficiency, useFleetDataset } from "@/features/fleet";
import { TripTable } from "@/features/fleet/components/trip-table";
import { useTripDateFrom, useTripDateTo } from "@/store";

export function TripsPage() {
  const { data, isLoading } = useFleetDataset();
  const dateFrom = useTripDateFrom();
  const dateTo = useTripDateTo();

  if (isLoading || !data) return <Skeleton className="h-96 w-full" />;

  const filteredTrips = data.trips.filter((trip) => {
    const tripDate = trip.startedAt.slice(0, 10);
    if (dateFrom && tripDate < dateFrom) return false;
    if (dateTo && tripDate > dateTo) return false;
    return true;
  });
  const efficiency = computeTripEfficiency(filteredTrips, data.vehicles);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Trips"
          description="Trip history, speed behavior, route efficiency, and idle hotspots."
        />
        <ExportCsvButton fileName="bytebeam-trip-efficiency.csv" rows={efficiency} />
      </div>

      <ChartCard
        title="Trip Efficiency"
        description="Compare distance, idle minutes, and overspeed events"
      >
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={efficiency} margin={{ top: 8, right: 16, left: 0, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="vehicle" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="distanceKm" fill="#0f766e" name="Distance km" />
            <Bar dataKey="idleMinutes" fill="#f59e0b" name="Idle minutes" />
            <Bar dataKey="overspeedEvents" fill="#dc2626" name="Overspeed events" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Trip Log" description="Sortable trip records for operations review">
        <TripTable trips={data.trips} vehicles={data.vehicles} />
      </ChartCard>
    </div>
  );
}
