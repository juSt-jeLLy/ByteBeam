import { useMemo } from "react";
import {
  computeFleetMetrics,
  computeStatusBreakdown,
  computeTripEfficiency,
  computeVehicleUtilization,
  useFleetDataset,
  useTripExport,
} from "@/features/fleet";
import {
  useSelectedVehicleId,
  useSetSelectedVehicleId,
  useSetVehicleChartLimit,
  useVehicleChartLimit,
} from "@/store";

export const FLEET_STATUS_COLORS = ["#16a34a", "#ca8a04", "#dc2626", "#64748b"];

export function useFleetDashboardPageModel() {
  const fleetDataset = useFleetDataset();
  const selectedVehicleId = useSelectedVehicleId();
  const setSelectedVehicleId = useSetSelectedVehicleId();
  const vehicleChartLimit = useVehicleChartLimit();
  const setVehicleChartLimit = useSetVehicleChartLimit();
  const tripExport = useTripExport();
  const data = fleetDataset.data;

  const selectedTrip = useMemo(
    () => data?.trips.find((trip) => trip.vehicleId === selectedVehicleId) ?? data?.trips[0],
    [data?.trips, selectedVehicleId],
  );
  const selectedVehicle = data?.vehicles.find((vehicle) => vehicle.id === selectedVehicleId);

  return {
    data,
    isLoading: fleetDataset.isLoading,
    isError: fleetDataset.isError,
    selectedVehicleId,
    selectedVehicle,
    selectedTrip,
    setSelectedVehicleId,
    vehicleChartLimit,
    setVehicleChartLimit,
    metrics: data ? computeFleetMetrics(data) : null,
    statusBreakdown: data ? computeStatusBreakdown(data.vehicles) : [],
    utilization: data
      ? computeVehicleUtilization(data.vehicles, data.trips, vehicleChartLimit)
      : [],
    exportAllTrips: async () => {
      const exportData = await tripExport.mutateAsync({
        search: "",
        dateFrom: "",
        dateTo: "",
        sortKey: "startedAt",
      });
      return computeTripEfficiency(exportData.trips, exportData.vehicles);
    },
  };
}
