import type { ChartLimit } from "@/store";
import { cn } from "@/lib/utils";

const CHART_LIMITS: ChartLimit[] = [12, 25, 50];

interface ChartLimitControlProps {
  value: ChartLimit;
  onChange: (value: ChartLimit) => void;
}

export function ChartLimitControl({ value, onChange }: ChartLimitControlProps) {
  return (
    <div className="hidden items-center gap-1 rounded-md border border-border bg-card p-1 sm:flex">
      {CHART_LIMITS.map((limit) => (
        <button
          key={limit}
          type="button"
          onClick={() => onChange(limit)}
          className={cn(
            "rounded px-2 py-1 text-xs font-medium transition-smooth",
            value === limit
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          Top {limit}
        </button>
      ))}
    </div>
  );
}
