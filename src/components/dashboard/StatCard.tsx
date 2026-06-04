import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: number | null;
  trendLabel?: string;
  trendUnavailableLabel?: string;
  accent?: "primary" | "success" | "warning" | "destructive" | "info";
  delay?: number;
}

const ACCENTS: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "from-primary/15 to-primary/0 text-primary",
  success: "from-success/15 to-success/0 text-success",
  warning: "from-warning/20 to-warning/0 text-warning",
  destructive: "from-destructive/15 to-destructive/0 text-destructive",
  info: "from-info/15 to-info/0 text-info",
};

/** Animated KPI card with optional trend indicator. */
export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel = "vs last period",
  trendUnavailableLabel = "No previous-period data",
  accent = "primary",
  delay = 0,
}: StatCardProps) {
  const positive = (trend ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition-smooth"
    >
      <div
        className={cn(
          "absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-60 blur-2xl transition-opacity group-hover:opacity-100",
          ACCENTS[accent],
        )}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-ui-label text-xs font-semibold uppercase tracking-[0.08em]">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl bg-background/60 ring-1 ring-border",
            accent === "primary" && "text-primary",
            accent === "success" && "text-success",
            accent === "warning" && "text-warning",
            accent === "destructive" && "text-destructive",
            accent === "info" && "text-info",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend != null && (
        <div className="relative mt-4 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
              positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(trend).toFixed(1)}%
          </span>
          <span className="text-muted-foreground">{trendLabel}</span>
        </div>
      )}
      {trend === null && (
        <div className="relative mt-4 text-xs text-muted-foreground">{trendUnavailableLabel}</div>
      )}
    </motion.div>
  );
}
