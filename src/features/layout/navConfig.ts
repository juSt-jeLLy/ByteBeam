import { AlertTriangle, Map, LayoutDashboard, Route, Settings, Truck } from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    description: "Fleet health and utilization",
  },
  {
    label: "Live Map",
    to: "/map",
    icon: Map,
    description: "Vehicle locations and routes",
  },
  {
    label: "Trips",
    to: "/trips",
    icon: Route,
    description: "Movement history and efficiency",
  },
  {
    label: "Alerts",
    to: "/alerts",
    icon: AlertTriangle,
    description: "Vehicle issues needing attention",
  },
  {
    label: "Settings",
    to: "/settings",
    icon: Settings,
    description: "Preferences and theme",
  },
];

export const APP_BRAND = {
  name: "Bytebeam Fleet",
  tagline: "Operations Command",
  icon: Truck,
};
