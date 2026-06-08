import { useEffect } from "react";
import {
  formatRelativeTime,
  useAlertPage,
  useAlertStatusCounts,
  useUpdateAlertStatus,
} from "@/features/fleet";
import type { AlertStatus } from "@/features/fleet/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  type AlertFilter,
  useAlertFilter,
  useAlertPageIndex,
  useAlertSearch,
  useSetAlertFilter,
  useSetAlertPage,
  useSetAlertSearch,
} from "@/store";

export const ALERT_PAGE_SIZE = 10;
export const ALERT_FILTERS: Array<{ value: AlertFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "resolved", label: "Resolved" },
];

export function useAlertsPageModel() {
  const page = useAlertPageIndex();
  const setPage = useSetAlertPage();
  const alertSearch = useAlertSearch();
  const setAlertSearch = useSetAlertSearch();
  const alertFilter = useAlertFilter();
  const setAlertFilter = useSetAlertFilter();
  const debouncedAlertSearch = useDebouncedValue(alertSearch).trim();
  const alertPage = useAlertPage({
    search: debouncedAlertSearch,
    status: alertFilter,
    page,
    pageSize: ALERT_PAGE_SIZE,
  });
  const alertCounts = useAlertStatusCounts();
  const updateAlertStatus = useUpdateAlertStatus();

  useEffect(() => {
    setPage(0);
  }, [debouncedAlertSearch, alertFilter, setPage]);

  const totalPages = Math.max(1, Math.ceil((alertPage.data?.totalCount ?? 0) / ALERT_PAGE_SIZE));
  const alertRows =
    alertPage.data?.alerts.map((alert) => ({
      alert,
      vehicle: alertPage.data.vehicles.find((candidate) => candidate.id === alert.vehicleId),
      relativeCreatedAt: formatRelativeTime(alert.createdAt),
      canAcknowledge: alert.status === "open",
      canResolve: alert.status !== "resolved",
    })) ?? [];
  const isUpdatingAlert = updateAlertStatus.isPending;
  const updateAlert = (alertId: string, status: AlertStatus) => {
    updateAlertStatus.mutate({ alertId, status });
  };
  const goToPreviousPage = () => setPage(Math.max(0, page - 1));
  const goToNextPage = () => setPage(page + 1);
  const filterOptions = ALERT_FILTERS.map((filter) => ({
    ...filter,
    active: alertFilter === filter.value,
  }));

  return {
    page,
    totalPages,
    setPage,
    goToPreviousPage,
    goToNextPage,
    alertSearch,
    setAlertSearch,
    alertFilter,
    setAlertFilter,
    filterOptions,
    alertPage: alertPage.data,
    alertRows,
    isAlertPageFetching: alertPage.isFetching,
    updateAlertStatus,
    updateAlert,
    isUpdatingAlert,
    open: alertCounts.data?.open ?? 0,
    acknowledged: alertCounts.data?.acknowledged ?? 0,
    resolved: alertCounts.data?.resolved ?? 0,
  };
}
