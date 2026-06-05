import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  fetchAlertPage,
  fetchFleetDataset,
  fetchTripPage,
  fetchVehicleQueue,
  fetchVehicleSnapshot,
} from "@/features/fleet/services/fleet-repository";
import { updateFleetAlertStatus } from "@/features/fleet/services/fleet-repository";
import type { AlertStatus } from "@/features/fleet/types";
import type { AlertFilter, TripSortKey } from "@/store";
import { supabase } from "@/lib/supabase";

const FLEET_DATASET_QUERY_KEY = ["fleet-dataset"] as const;
const VEHICLE_QUEUE_QUERY_KEY = ["vehicle-queue"] as const;
const VEHICLE_SNAPSHOT_QUERY_KEY = ["vehicle-snapshot"] as const;
const TRIP_PAGE_QUERY_KEY = ["trip-page"] as const;
const ALERT_PAGE_QUERY_KEY = ["alert-page"] as const;

export function useFleetDataset() {
  const queryClient = useQueryClient();
  const invalidateTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const throttledInvalidate = () => {
      if (invalidateTimeoutRef.current !== null) return;

      invalidateTimeoutRef.current = window.setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: FLEET_DATASET_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: VEHICLE_QUEUE_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: VEHICLE_SNAPSHOT_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: TRIP_PAGE_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: ALERT_PAGE_QUERY_KEY });
        invalidateTimeoutRef.current = null;
      }, 750);
    };

    const channel = client
      .channel("fleet_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vehicles" },
        throttledInvalidate,
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "trips" }, throttledInvalidate)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "fleet_alerts" },
        throttledInvalidate,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "telemetry_points" },
        throttledInvalidate,
      )
      .subscribe();

    return () => {
      if (invalidateTimeoutRef.current !== null) {
        window.clearTimeout(invalidateTimeoutRef.current);
        invalidateTimeoutRef.current = null;
      }
      client.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: FLEET_DATASET_QUERY_KEY,
    queryFn: fetchFleetDataset,
    staleTime: 60_000,
  });
}

export function useVehicleQueue(search: string, limit = 25, enabled = true) {
  return useInfiniteQuery({
    queryKey: [...VEHICLE_QUEUE_QUERY_KEY, search, limit],
    queryFn: ({ pageParam }) => fetchVehicleQueue({ search, limit, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled,
    staleTime: 30_000,
  });
}

export function useTripPage({
  search,
  dateFrom,
  dateTo,
  sortKey,
  page,
  pageSize = 10,
}: {
  search: string;
  dateFrom: string;
  dateTo: string;
  sortKey: TripSortKey;
  page: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: [...TRIP_PAGE_QUERY_KEY, search, dateFrom, dateTo, sortKey, page, pageSize],
    queryFn: () => fetchTripPage({ search, dateFrom, dateTo, sortKey, page, pageSize }),
    staleTime: 30_000,
  });
}

export function useAlertPage({
  search,
  status,
  page,
  pageSize = 10,
}: {
  search: string;
  status: AlertFilter;
  page: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: [...ALERT_PAGE_QUERY_KEY, search, status, page, pageSize],
    queryFn: () => fetchAlertPage({ search, status, page, pageSize }),
    staleTime: 30_000,
  });
}

export function useVehicleSnapshot(vehicleId: string) {
  return useQuery({
    queryKey: [...VEHICLE_SNAPSHOT_QUERY_KEY, vehicleId],
    queryFn: () => fetchVehicleSnapshot(vehicleId),
    enabled: Boolean(vehicleId),
    staleTime: 30_000,
  });
}

export function useUpdateAlertStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, status }: { alertId: string; status: AlertStatus }) =>
      updateFleetAlertStatus(alertId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FLEET_DATASET_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: VEHICLE_QUEUE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: VEHICLE_SNAPSHOT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ALERT_PAGE_QUERY_KEY });
    },
  });
}
