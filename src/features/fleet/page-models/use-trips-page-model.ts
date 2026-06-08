import { computeTripEfficiency, useTripPage } from "@/features/fleet";
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
    chartEfficiency: computeTripEfficiency(
      chartTrips.data?.trips ?? [],
      chartTrips.data?.vehicles ?? [],
    ),
  };
}
