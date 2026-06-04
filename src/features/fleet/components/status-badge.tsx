import { cn } from "@/lib/utils";
import type { AlertSeverity, AlertStatus, VehicleStatus } from "@/features/fleet/types";

const STATUS_STYLES: Record<VehicleStatus, string> = {
  active: "bg-success/15 text-success",
  idle: "bg-warning/20 text-warning",
  attention: "bg-destructive/15 text-destructive",
  offline: "bg-muted text-muted-foreground",
};

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
  critical: "bg-destructive/15 text-destructive",
  warning: "bg-warning/20 text-warning",
  info: "bg-info/15 text-info",
};

const ALERT_STATUS_STYLES: Record<AlertStatus, string> = {
  open: "bg-destructive/15 text-destructive",
  acknowledged: "bg-warning/20 text-warning",
  resolved: "bg-success/15 text-success",
};

export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  return <Badge className={STATUS_STYLES[status]} label={status} />;
}

export function AlertSeverityBadge({ severity }: { severity: AlertSeverity }) {
  return <Badge className={SEVERITY_STYLES[severity]} label={severity} />;
}

export function AlertStatusBadge({ status }: { status: AlertStatus }) {
  return <Badge className={ALERT_STATUS_STYLES[status]} label={status} />;
}

function Badge({ className, label }: { className: string; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
        className,
      )}
    >
      {label}
    </span>
  );
}
