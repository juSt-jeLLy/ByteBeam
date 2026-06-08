import { PageHeader } from "@/features/shared/components";
import { FleetWorkspace } from "@/features/fleet/components/fleet-workspace";
import { useMapPageModel } from "@/features/fleet/page-models/use-map-page-model";

export function MapPage() {
  const model = useMapPageModel();

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
        selectedVehicleId={model.selectedVehicleId}
        onVehicleSelect={model.setSelectedVehicleId}
        mapTitle="Route Inspection"
        mapDescription="Focused view of the selected vehicle and recent route"
        queueTitle="Vehicles"
        queueDescription="Search or scroll to choose a vehicle"
        detailDescription="Telemetry, route, and actionable alerts"
        mapHeightClassName={model.mapHeightClassName}
        listHeightClassName="max-h-[520px]"
        focusedVehicleMode
        showAlertActions
        detailCompact={false}
      />
    </div>
  );
}
