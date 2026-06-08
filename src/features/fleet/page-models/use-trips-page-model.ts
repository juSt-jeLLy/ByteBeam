import { computeTripEfficiency, useTripExport, useTripPage } from "@/features/fleet";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  useSetTripChartLimit,
  useTripChartLimit,
  useTripDateFrom,
  useTripDateTo,
  useTripSearch,
  useTripSortKey,
} from "@/store";

export function useTripsPageModel() {
  const dateFrom = useTripDateFrom();
  const dateTo = useTripDateTo();
  const tripSearch = useTripSearch();
  const debouncedTripSearch = useDebouncedValue(tripSearch).trim();
  const tripSortKey = useTripSortKey();
  const tripChartLimit = useTripChartLimit();
  const setTripChartLimit = useSetTripChartLimit();
  const tripExport = useTripExport();
  const chartTrips = useTripPage({
    search: debouncedTripSearch,
    dateFrom,
    dateTo,
    sortKey: tripSortKey,
    page: 0,
    pageSize: tripChartLimit,
  });

  return {
    tripChartLimit,
    setTripChartLimit,
    isChartLoading: chartTrips.isLoading,
    exportAllMatchingTrips: async () => {
      const exportData = await tripExport.mutateAsync({
        search: debouncedTripSearch,
        dateFrom,
        dateTo,
        sortKey: tripSortKey,
      });
      return computeTripEfficiency(exportData.trips, exportData.vehicles);
    },
    chartEfficiency: computeTripEfficiency(
      chartTrips.data?.trips ?? [],
      chartTrips.data?.vehicles ?? [],
    ),
  };
}
