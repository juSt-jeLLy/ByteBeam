import { useIsMobile } from "@/hooks/use-mobile";
import { useSelectedVehicleId, useSetSelectedVehicleId } from "@/store";

export function useMapPageModel() {
  return {
    selectedVehicleId: useSelectedVehicleId(),
    setSelectedVehicleId: useSetSelectedVehicleId(),
    mapHeightClassName: useIsMobile() ? "h-[420px]" : "h-[620px]",
  };
}
