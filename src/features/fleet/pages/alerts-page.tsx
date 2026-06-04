import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Skeleton } from "@/components/dashboard/Skeleton";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader } from "@/features/shared/components";
import { formatRelativeTime, useFleetDataset, useUpdateAlertStatus } from "@/features/fleet";
import { AlertSeverityBadge, AlertStatusBadge } from "@/features/fleet/components/status-badge";

export function AlertsPage() {
  const { data, isLoading } = useFleetDataset();
  const updateAlertStatus = useUpdateAlertStatus();

  if (isLoading || !data) return <Skeleton className="h-96 w-full" />;

  const open = data.alerts.filter((alert) => alert.status === "open").length;
  const acknowledged = data.alerts.filter((alert) => alert.status === "acknowledged").length;
  const resolved = data.alerts.filter((alert) => alert.status === "resolved").length;

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
        <div className="space-y-3">
          {data.alerts.map((alert) => {
            const vehicle = data.vehicles.find((candidate) => candidate.id === alert.vehicleId);
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
        </div>
      </ChartCard>
    </div>
  );
}
