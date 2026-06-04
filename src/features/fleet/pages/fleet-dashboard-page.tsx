import { useMemo } from "react";
import { AlertTriangle, BatteryCharging, Clock3, Gauge, MapPin, Route, Truck } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Skeleton } from "@/components/dashboard/Skeleton";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader } from "@/features/shared/components";
import { ExportCsvButton } from "@/features/shared/export";
import {
  computeFleetMetrics,
  computeStatusBreakdown,
  computeTripEfficiency,
  computeVehicleUtilization,
  useFleetDataset,
} from "@/features/fleet";
import { FleetMap } from "@/features/fleet/components/fleet-map";
import { VehicleDetailPanel } from "@/features/fleet/components/vehicle-detail-panel";
import { VehicleList } from "@/features/fleet/components/vehicle-list";
import { useSelectedVehicleId, useSetSelectedVehicleId } from "@/store";

const STATUS_COLORS = ["#16a34a", "#ca8a04", "#dc2626", "#64748b"];

export function FleetDashboardPage() {
  const { data, isLoading, isError } = useFleetDataset();
  const selectedVehicleId = useSelectedVehicleId();
  const setSelectedVehicleId = useSetSelectedVehicleId();

  const selectedTrip = useMemo(
    () => data?.trips.find((trip) => trip.vehicleId === selectedVehicleId) ?? data?.trips[0],
    [data?.trips, selectedVehicleId],
  );
  const selectedVehicle = data?.vehicles.find((vehicle) => vehicle.id === selectedVehicleId);

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        Unable to load fleet telemetry.
      </div>
    );
  }

  const metrics = computeFleetMetrics(data);
  const statusBreakdown = computeStatusBreakdown(data.vehicles);
  const utilization = computeVehicleUtilization(data.vehicles, data.trips);
  const tripEfficiency = computeTripEfficiency(data.trips, data.vehicles);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Fleet Dashboard"
          description="Live vehicle status, route history, and operating exceptions for the Bengaluru fleet."
        />
        <ExportCsvButton fileName="bytebeam-fleet-trips.csv" rows={tripEfficiency} />
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Fleet Size" value={`${metrics.totalVehicles}`} icon={Truck} />
        <StatCard
          label="Active Vehicles"
          value={`${metrics.activeVehicles}`}
          icon={MapPin}
          accent="success"
        />
        <StatCard
          label="Open Alerts"
          value={`${metrics.openAlerts}`}
          icon={AlertTriangle}
          accent={metrics.openAlerts > 0 ? "destructive" : "success"}
        />
        <StatCard
          label="Avg Energy"
          value={`${metrics.averageEnergy}%`}
          icon={BatteryCharging}
          accent="info"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ChartCard
          title="Vehicle Map"
          description="Inspect current position and selected vehicle movement history"
          action={<SelectedRouteSummary trip={selectedTrip} />}
        >
          <FleetMap
            vehicles={data.vehicles}
            selectedVehicleId={selectedVehicleId}
            selectedTrip={selectedTrip}
            onVehicleSelect={setSelectedVehicleId}
          />
        </ChartCard>

        <div className="space-y-5">
          <ChartCard title="Vehicle Queue" description="Click a vehicle to inspect its route">
            <VehicleList
              vehicles={data.vehicles}
              trips={data.trips}
              alerts={data.alerts}
              selectedVehicleId={selectedVehicleId}
              onSelect={setSelectedVehicleId}
            />
          </ChartCard>
          <ChartCard
            title="Vehicle Details"
            description="Selected vehicle health and route context"
          >
            <VehicleDetailPanel
              vehicle={selectedVehicle}
              trip={selectedTrip}
              alerts={data.alerts}
              telemetry={data.telemetry}
            />
          </ChartCard>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <ChartCard
          title="Trip Utilization"
          description="Distance, driving time, and idle time by vehicle"
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={utilization} margin={{ top: 8, right: 16, left: 0, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vehicle" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="distanceKm" name="Distance km" fill="#0f766e" />
              <Bar dataKey="idleMinutes" name="Idle min" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fleet Status" description="Current operating state across vehicles">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={statusBreakdown}
                dataKey="count"
                nameKey="status"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
              >
                {statusBreakdown.map((entry, index) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Distance Today"
          value={`${metrics.distanceToday.toFixed(1)} km`}
          icon={Route}
          accent="success"
        />
        <StatCard
          label="Idle Time"
          value={`${metrics.idleMinutes} min`}
          icon={Clock3}
          accent="warning"
        />
        <StatCard
          label="Overspeed Events"
          value={`${metrics.overspeedEvents}`}
          icon={Gauge}
          accent={metrics.overspeedEvents > 0 ? "destructive" : "success"}
        />
      </section>
    </div>
  );
}

function SelectedRouteSummary({
  trip,
}: {
  trip?: { distanceKm: number; durationMinutes: number; overspeedEvents: number };
}) {
  if (!trip) return null;

  return (
    <div className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
      <span>{trip.distanceKm} km</span>
      <span>{trip.durationMinutes} min</span>
      <span>{trip.overspeedEvents} overspeed</span>
    </div>
  );
}
