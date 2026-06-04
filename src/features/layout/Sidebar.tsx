import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { APP_BRAND, NAV_ITEMS } from "./navConfig";
import { cn } from "@/lib/utils";

/** Persistent left sidebar navigation (desktop). */
export function Sidebar() {
  const { pathname } = useLocation();
  const Brand = APP_BRAND.icon;

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <Brand className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-sidebar-foreground leading-tight">
            {APP_BRAND.name}
          </p>
          <p className="text-[11px] text-muted-foreground">{APP_BRAND.tagline}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.to || (pathname === "/" && item.to === "/dashboard");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
                active
                  ? "text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="active-nav"
                  className="absolute inset-0 rounded-lg bg-gradient-primary shadow-elegant"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-xl bg-gradient-hero p-4 text-primary-foreground shadow-elegant">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Fleet Status</p>
        <p className="mt-1 text-sm font-medium">Telemetry sync ready</p>
        <div className="mt-3 flex items-center gap-2 text-xs opacity-90">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          Supabase realtime enabled
        </div>
      </div>
    </aside>
  );
}
