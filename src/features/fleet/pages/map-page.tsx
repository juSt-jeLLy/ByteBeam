import { PageHeader } from "@/features/shared/components";
import { FleetWorkspace } from "@/features/fleet/components/fleet-workspace";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSelectedVehicleId, useSetSelectedVehicleId } from "@/store";

export function MapPage() {
  const selectedVehicleId = useSelectedVehicleId();
  const setSelectedVehicleId = useSetSelectedVehicleId();
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Map"
        description="Vehicle-level operations view for route inspection, telemetry, and alert actioning."
      />
      <FleetWorkspace
        vehicles={[]}
        trips={[]}
        alerts={[]}
        telemetry={[]}
        selectedVehicleId={selectedVehicleId}
        onVehicleSelect={setSelectedVehicleId}
        mapTitle="Route Inspection"
        mapDescription="Focused view of the selected vehicle and recent route"
        queueTitle="Vehicles"
        queueDescription="Search or scroll to choose a vehicle"
        detailDescription="Telemetry, route, and actionable alerts"
        mapHeightClassName={isMobile ? "h-[420px]" : "h-[620px]"}
        listHeightClassName="max-h-[520px]"
        focusedVehicleMode
        showAlertActions
        detailCompact={false}
      />
    </div>
  );
}
