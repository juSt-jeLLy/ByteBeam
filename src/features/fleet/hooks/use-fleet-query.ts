import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { fetchFleetDataset } from "@/features/fleet/services/fleet-repository";
import { updateFleetAlertStatus } from "@/features/fleet/services/fleet-repository";
import type { AlertStatus } from "@/features/fleet/types";
import { supabase } from "@/lib/supabase";

const QUERY_KEY = ["fleet-dataset"] as const;

export function useFleetDataset() {
  const queryClient = useQueryClient();
  const invalidateTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!supabase) return;

    const throttledInvalidate = () => {
      if (invalidateTimeoutRef.current !== null) return;

      invalidateTimeoutRef.current = window.setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        invalidateTimeoutRef.current = null;
      }, 750);
    };

    const channel = supabase
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
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchFleetDataset,
    staleTime: 60_000,
  });
}

export function useUpdateAlertStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, status }: { alertId: string; status: AlertStatus }) =>
      updateFleetAlertStatus(alertId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
