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
import { ChartLimitControl } from "@/features/fleet/components/chart-limit-control";
import { FleetWorkspace } from "@/features/fleet/components/fleet-workspace";
import { SelectedRouteSummary } from "@/features/fleet/components/selected-route-summary";
import {
  FLEET_STATUS_COLORS,
  useFleetDashboardPageModel,
} from "@/features/fleet/page-models/use-fleet-dashboard-page-model";

export function FleetDashboardPage() {
  const model = useFleetDashboardPageModel();

  if (model.isLoading) return <Skeleton className="h-96 w-full" />;

  if (model.isError || !model.data || !model.metrics) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        Unable to load fleet telemetry.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Fleet Dashboard"
          description="Live vehicle status, route history, and operating exceptions for the Bengaluru fleet."
        />
        <ExportCsvButton fileName="bytebeam-fleet-trips.csv" rows={model.tripEfficiency} />
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Fleet Size" value={`${model.metrics.totalVehicles}`} icon={Truck} />
        <StatCard
          label="Active Vehicles"
          value={`${model.metrics.activeVehicles}`}
          icon={MapPin}
          accent="success"
        />
        <StatCard
          label="Open Alerts"
          value={`${model.metrics.openAlerts}`}
          icon={AlertTriangle}
          accent={model.metrics.openAlerts > 0 ? "destructive" : "success"}
        />
        <StatCard
          label="Avg Energy"
          value={`${model.metrics.averageEnergy}%`}
          icon={BatteryCharging}
          accent="info"
        />
      </section>

      <FleetWorkspace
        vehicles={model.data.vehicles}
        trips={model.data.trips}
        alerts={model.data.alerts}
        telemetry={model.data.telemetry}
        selectedVehicleId={model.selectedVehicleId}
        selectedVehicle={model.selectedVehicle}
        selectedTrip={model.selectedTrip}
        onVehicleSelect={model.setSelectedVehicleId}
        mapTitle="Vehicle Map"
        mapDescription="Inspect current position and selected vehicle movement history"
        queueTitle="Vehicle Queue"
        queueDescription="Click a vehicle to inspect its route"
        detailDescription="Selected vehicle health and route context"
        routeSummary={<SelectedRouteSummary trip={model.selectedTrip} />}
        listHeightClassName="max-h-[420px]"
      />

      <section className="grid gap-5 lg:grid-cols-2">
        <ChartCard
          title="Trip Utilization"
          description="Top vehicle utilization for the selected chart scope"
          action={
            <ChartLimitControl
              value={model.vehicleChartLimit}
              onChange={model.setVehicleChartLimit}
            />
          }
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={model.utilization} margin={{ top: 8, right: 16, left: 0, bottom: 24 }}>
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
                data={model.statusBreakdown}
                dataKey="count"
                nameKey="status"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
              >
                {model.statusBreakdown.map((entry, index) => (
                  <Cell key={entry.status} fill={FLEET_STATUS_COLORS[index]} />
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
          value={`${model.metrics.distanceToday.toFixed(1)} km`}
          icon={Route}
          accent="success"
        />
        <StatCard
          label="Idle Time"
          value={`${model.metrics.idleMinutes} min`}
          icon={Clock3}
          accent="warning"
        />
        <StatCard
          label="Overspeed Events"
          value={`${model.metrics.overspeedEvents}`}
          icon={Gauge}
          accent={model.metrics.overspeedEvents > 0 ? "destructive" : "success"}
        />
      </section>
    </div>
  );
}
