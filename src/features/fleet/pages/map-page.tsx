import { ChartCard } from "@/components/dashboard/ChartCard";
import { Skeleton } from "@/components/dashboard/Skeleton";
import { PageHeader } from "@/features/shared/components";
import { useFleetDataset } from "@/features/fleet";
import { FleetMap } from "@/features/fleet/components/fleet-map";
import { VehicleDetailPanel } from "@/features/fleet/components/vehicle-detail-panel";
import { VehicleList } from "@/features/fleet/components/vehicle-list";
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
        description="Central operations map for current positions and recent movement traces."
      />
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ChartCard
          title="Route Inspection"
          description="Selected route polyline with vehicle markers"
        >
          <FleetMap
            vehicles={data.vehicles}
            selectedVehicleId={selectedVehicleId}
            selectedTrip={selectedTrip}
            onVehicleSelect={setSelectedVehicleId}
            heightClassName={isMobile ? "h-[420px]" : "h-[620px]"}
          />
        </ChartCard>
        <div className="space-y-5">
          <ChartCard title="Vehicles" description="Operational status and last seen details">
            <VehicleList
              vehicles={data.vehicles}
              trips={data.trips}
              alerts={data.alerts}
              selectedVehicleId={selectedVehicleId}
              onSelect={setSelectedVehicleId}
            />
          </ChartCard>
          <ChartCard title="Vehicle Details" description="Current telemetry snapshot">
            <VehicleDetailPanel
              vehicle={selectedVehicle}
              trip={selectedTrip}
              alerts={data.alerts}
              telemetry={data.telemetry}
            />
          </ChartCard>
        </div>
      </section>
    </div>
  );
}
