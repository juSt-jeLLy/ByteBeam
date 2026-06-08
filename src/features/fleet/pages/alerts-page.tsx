import { AlertTriangle, CheckCircle2, Clock3, Search } from "lucide-react";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader } from "@/features/shared/components";
import { AlertSeverityBadge, AlertStatusBadge } from "@/features/fleet/components/status-badge";
import { useAlertsPageModel } from "@/features/fleet/page-models/use-alerts-page-model";
import { cn } from "@/lib/utils";

export function AlertsPage() {
  const model = useAlertsPageModel();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts"
        description="Vehicle-health and usage exceptions that need operational follow-up."
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Open" value={`${model.open}`} icon={AlertTriangle} accent="destructive" />
        <StatCard
          label="Acknowledged"
          value={`${model.acknowledged}`}
          icon={Clock3}
          accent="warning"
        />
        <StatCard
          label="Resolved"
          value={`${model.resolved}`}
          icon={CheckCircle2}
          accent="success"
        />
      </section>

      <ChartCard title="Alert Queue" description="Prioritized by newest exception first">
        <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={model.alertSearch}
              onChange={(event) => model.setAlertSearch(event.target.value)}
              placeholder="Search by vehicle number, driver, or location…"
              className="h-10 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {model.filterOptions.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => model.setAlertFilter(filter.value)}
                className={cn(
                  "rounded-md border px-3 py-2 text-xs font-semibold transition-smooth",
                  filter.active
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
          {model.alertRows.map(
            ({ alert, vehicle, relativeCreatedAt, canAcknowledge, canResolve }) => (
              <article key={alert.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{alert.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{alert.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {vehicle?.registration ?? alert.vehicleId} · {relativeCreatedAt}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <AlertSeverityBadge severity={alert.severity} />
                    <AlertStatusBadge status={alert.status} />
                  </div>
                </div>
                {canResolve && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {canAcknowledge && (
                      <button
                        type="button"
                        disabled={model.isUpdatingAlert}
                        onClick={() => model.updateAlert(alert.id, "acknowledged")}
                        className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold transition-smooth hover:bg-accent disabled:opacity-50"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={model.isUpdatingAlert}
                      onClick={() => model.updateAlert(alert.id, "resolved")}
                      className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-smooth hover:opacity-90 disabled:opacity-50"
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </article>
            ),
          )}
          {model.alertRows.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              {model.isAlertPageFetching ? "Loading alerts…" : "No alerts found."}
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-muted-foreground">
            Showing page {model.page + 1} of {model.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={model.page === 0 || model.isAlertPageFetching}
              onClick={model.goToPreviousPage}
              className="rounded-md border border-border px-3 py-1.5 font-medium transition-smooth hover:bg-accent disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={model.page + 1 >= model.totalPages || model.isAlertPageFetching}
              onClick={model.goToNextPage}
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
