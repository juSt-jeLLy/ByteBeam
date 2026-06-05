import type { ReactNode } from "react";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { useVehicleSnapshot } from "@/features/fleet";
import type { FleetAlert, TelemetryPoint, Trip, Vehicle } from "@/features/fleet/types";
import { FleetMap } from "@/features/fleet/components/fleet-map";
import { VehicleDetailPanel } from "@/features/fleet/components/vehicle-detail-panel";
import { VehicleList } from "@/features/fleet/components/vehicle-list";

interface FleetWorkspaceProps {
  vehicles: Vehicle[];
  trips: Trip[];
  alerts: FleetAlert[];
  telemetry: TelemetryPoint[];
  selectedVehicleId: string;
  selectedVehicle?: Vehicle;
  selectedTrip?: Trip;
  onVehicleSelect: (vehicleId: string) => void;
  mapTitle: string;
  mapDescription: string;
  queueTitle: string;
  queueDescription: string;
  detailDescription: string;
  routeSummary?: ReactNode;
  mapHeightClassName?: string;
  listHeightClassName?: string;
}

export function FleetWorkspace({
  vehicles,
  trips,
  alerts,
  telemetry,
  selectedVehicleId,
  selectedVehicle,
  selectedTrip,
  onVehicleSelect,
  mapTitle,
  mapDescription,
  queueTitle,
  queueDescription,
  detailDescription,
  routeSummary,
  mapHeightClassName,
  listHeightClassName = "max-h-[480px]",
}: FleetWorkspaceProps) {
  const { data: selectedSnapshot } = useVehicleSnapshot(selectedVehicleId);
  const hydratedVehicle = selectedSnapshot?.vehicles[0] ?? selectedVehicle;
  const hydratedTrip = selectedSnapshot?.trips[0] ?? selectedTrip;
  const hydratedAlerts = selectedSnapshot?.alerts ?? alerts;
  const hydratedTelemetry = selectedSnapshot?.telemetry ?? telemetry;
  const mapVehicles =
    hydratedVehicle && !vehicles.some((vehicle) => vehicle.id === hydratedVehicle.id)
      ? [hydratedVehicle, ...vehicles]
      : vehicles;

  return (
    <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <ChartCard
        title={mapTitle}
        description={mapDescription}
        action={routeSummary}
        className="xl:sticky xl:top-20"
      >
        <FleetMap
          vehicles={mapVehicles}
          selectedVehicleId={selectedVehicleId}
          selectedTrip={hydratedTrip}
          onVehicleSelect={onVehicleSelect}
          heightClassName={mapHeightClassName}
        />
      </ChartCard>

      <div className="space-y-4">
        <ChartCard title={queueTitle} description={queueDescription} className="p-4">
          <VehicleList
            vehicles={vehicles}
            trips={trips}
            alerts={alerts}
            selectedVehicleId={selectedVehicleId}
            onSelect={onVehicleSelect}
            compact
            serverSearch
            className={`${listHeightClassName} overflow-y-auto pr-1`}
          />
        </ChartCard>

        <ChartCard title="Vehicle Details" description={detailDescription} className="p-4">
          <VehicleDetailPanel
            vehicle={hydratedVehicle}
            trip={hydratedTrip}
            alerts={hydratedAlerts}
            telemetry={hydratedTelemetry}
            compact
          />
        </ChartCard>
      </div>
    </section>
  );
}
