import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ChartCardProps {
  title: string;
  description?: string;
  className?: string;
  delay?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}

/** Container with consistent header used by every chart on the dashboard. */
export function ChartCard({
  title,
  description,
  className,
  delay = 0,
  action,
  children,
}: ChartCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={cn("rounded-2xl border border-border bg-card p-5 shadow-card", className)}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="relative">
          <motion.h3
            initial={{ opacity: 0.7, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: delay + 0.08 }}
            className="text-heading-gradient text-xl font-semibold tracking-tight"
          >
            {title}
          </motion.h3>
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: 52 }}
            transition={{ duration: 0.4, delay: delay + 0.14 }}
            className="mt-1 block h-0.5 rounded-full bg-gradient-to-r from-primary to-info"
          />
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </header>
      <div>{children}</div>
    </motion.section>
  );
}
