import { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Search } from "lucide-react";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader } from "@/features/shared/components";
import {
  formatRelativeTime,
  useAlertPage,
  useAlertStatusCounts,
  useUpdateAlertStatus,
} from "@/features/fleet";
import { AlertSeverityBadge, AlertStatusBadge } from "@/features/fleet/components/status-badge";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";
import {
  type AlertFilter,
  useAlertFilter,
  useAlertPageIndex,
  useAlertSearch,
  useSetAlertPage,
  useSetAlertFilter,
  useSetAlertSearch,
} from "@/store";

const ALERT_PAGE_SIZE = 10;
const ALERT_FILTERS: Array<{ value: AlertFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "resolved", label: "Resolved" },
];

export function AlertsPage() {
  const page = useAlertPageIndex();
  const setPage = useSetAlertPage();
  const alertSearch = useAlertSearch();
  const setAlertSearch = useSetAlertSearch();
  const alertFilter = useAlertFilter();
  const setAlertFilter = useSetAlertFilter();
  const debouncedAlertSearch = useDebouncedValue(alertSearch).trim();
  const { data: alertPage, isFetching: isAlertPageFetching } = useAlertPage({
    search: debouncedAlertSearch,
    status: alertFilter,
    page,
    pageSize: ALERT_PAGE_SIZE,
  });
  const { data: alertCounts } = useAlertStatusCounts();
  const updateAlertStatus = useUpdateAlertStatus();

  useEffect(() => {
    setPage(0);
  }, [debouncedAlertSearch, alertFilter, setPage]);

  const open = alertCounts?.open ?? 0;
  const acknowledged = alertCounts?.acknowledged ?? 0;
  const resolved = alertCounts?.resolved ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts"
        description="Vehicle-health and usage exceptions that need operational follow-up."
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Open" value={`${open}`} icon={AlertTriangle} accent="destructive" />
        <StatCard label="Acknowledged" value={`${acknowledged}`} icon={Clock3} accent="warning" />
        <StatCard label="Resolved" value={`${resolved}`} icon={CheckCircle2} accent="success" />
      </section>

      <ChartCard title="Alert Queue" description="Prioritized by newest exception first">
        <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={alertSearch}
              onChange={(event) => setAlertSearch(event.target.value)}
              placeholder="Search by vehicle number, driver, or location…"
              className="h-10 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {ALERT_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setAlertFilter(filter.value)}
                className={cn(
                  "rounded-md border px-3 py-2 text-xs font-semibold transition-smooth",
                  alertFilter === filter.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-accent",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {(alertPage?.alerts ?? []).map((alert) => {
            const vehicle = alertPage?.vehicles.find(
              (candidate) => candidate.id === alert.vehicleId,
            );
            const isUpdating = updateAlertStatus.isPending;

            return (
              <article key={alert.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{alert.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{alert.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {vehicle?.registration ?? alert.vehicleId} ·{" "}
                      {formatRelativeTime(alert.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <AlertSeverityBadge severity={alert.severity} />
                    <AlertStatusBadge status={alert.status} />
                  </div>
                </div>
                {alert.status !== "resolved" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {alert.status === "open" && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          updateAlertStatus.mutate({
                            alertId: alert.id,
                            status: "acknowledged",
                          })
                        }
                        className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold transition-smooth hover:bg-accent disabled:opacity-50"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() =>
                        updateAlertStatus.mutate({
                          alertId: alert.id,
                          status: "resolved",
                        })
                      }
                      className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-smooth hover:opacity-90 disabled:opacity-50"
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </article>
            );
          })}
          {(alertPage?.alerts ?? []).length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              {isAlertPageFetching ? "Loading alerts…" : "No alerts found."}
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-muted-foreground">
            Showing page {page + 1} of{" "}
            {Math.max(1, Math.ceil((alertPage?.totalCount ?? 0) / ALERT_PAGE_SIZE))}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 0 || isAlertPageFetching}
              onClick={() => setPage(Math.max(0, page - 1))}
              className="rounded-md border border-border px-3 py-1.5 font-medium transition-smooth hover:bg-accent disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={
                page + 1 >= Math.ceil((alertPage?.totalCount ?? 0) / ALERT_PAGE_SIZE) ||
                isAlertPageFetching
              }
              onClick={() => setPage(page + 1)}
              className="rounded-md border border-border px-3 py-1.5 font-medium transition-smooth hover:bg-accent disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
