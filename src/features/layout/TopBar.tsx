import { LogOut, Menu, Search } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { APP_BRAND, NAV_ITEMS } from "./navConfig";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/AuthProvider";
import {
  useMobileDrawerOpen,
  useSetMobileDrawerOpen,
  useGlobalSearch,
  useSetGlobalSearch,
} from "@/store";

export function TopBar() {
  const { pathname } = useLocation();
  const { signOut, session, isDemoMode } = useAuth();

  const mobileDrawerOpen = useMobileDrawerOpen();
  const setMobileDrawerOpen = useSetMobileDrawerOpen();
  const globalSearch = useGlobalSearch();
  const setGlobalSearch = useSetGlobalSearch();

  const current = NAV_ITEMS.find(
    (n) => n.to === pathname || (pathname === "/" && n.to === "/dashboard"),
  );
  const Brand = APP_BRAND.icon;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur-md sm:px-6">
      <button
        className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border"
        onClick={() => setMobileDrawerOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="flex flex-col">
        <h1 className="text-base font-semibold leading-tight">{current?.label ?? "Dashboard"}</h1>
        <p className="text-xs text-muted-foreground hidden sm:block">
          {current?.description ?? "Overview"}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="relative hidden md:flex">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search fleet…"
            className="h-9 w-64 rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="hidden text-right sm:block">
          <p className="text-xs font-medium">{session?.user.email}</p>
          <p className="text-[10px] text-muted-foreground">
            {isDemoMode ? "Demo mode" : "Supabase"}
          </p>
        </div>

        <ThemeToggle />
        <button
          type="button"
          aria-label="Sign out"
          onClick={() => void signOut()}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-smooth hover:bg-accent"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-3 top-3 z-50 isolate w-72 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-2xl border border-border p-4 shadow-elegant lg:hidden"
            >
              <div className="absolute inset-0 bg-sidebar" aria-hidden="true" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 px-2 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
                    <Brand className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{APP_BRAND.name}</p>
                    <p className="text-[11px] text-muted-foreground">{APP_BRAND.tagline}</p>
                  </div>
                </div>
                <nav className="mt-2 space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active =
                      pathname === item.to || (pathname === "/" && item.to === "/dashboard");
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileDrawerOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
                          active
                            ? "bg-gradient-primary text-primary-foreground"
                            : "hover:bg-sidebar-accent",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
