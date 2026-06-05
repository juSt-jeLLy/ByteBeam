import { Skeleton } from "@/components/dashboard/Skeleton";
import { PageHeader } from "@/features/shared/components";
import { useFleetDataset } from "@/features/fleet";
import { FleetWorkspace } from "@/features/fleet/components/fleet-workspace";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSelectedVehicleId, useSetSelectedVehicleId } from "@/store";

export function MapPage() {
  const { data, isLoading } = useFleetDataset();
  const selectedVehicleId = useSelectedVehicleId();
  const setSelectedVehicleId = useSetSelectedVehicleId();
  const isMobile = useIsMobile();

  if (isLoading || !data) return <Skeleton className="h-96 w-full" />;

  const selectedTrip = data.trips.find((trip) => trip.vehicleId === selectedVehicleId);
  const selectedVehicle = data.vehicles.find((vehicle) => vehicle.id === selectedVehicleId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Map"
        description="Focused route inspection for current positions and recent movement traces."
      />
      <FleetWorkspace
        vehicles={data.vehicles}
        trips={data.trips}
        alerts={data.alerts}
        telemetry={data.telemetry}
        selectedVehicleId={selectedVehicleId}
        selectedVehicle={selectedVehicle}
        selectedTrip={selectedTrip}
        onVehicleSelect={setSelectedVehicleId}
        mapTitle="Route Inspection"
        mapDescription="Selected route polyline with vehicle markers"
        queueTitle="Vehicles"
        queueDescription="Operational status and last seen details"
        detailDescription="Current telemetry snapshot"
        mapHeightClassName={isMobile ? "h-[420px]" : "h-[620px]"}
        listHeightClassName="max-h-[520px]"
      />
    </div>
  );
}
