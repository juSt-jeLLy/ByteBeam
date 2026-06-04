import { createFileRoute } from "@tanstack/react-router";
import { FleetDashboardPage } from "@/features/fleet/pages/fleet-dashboard-page";

export const Route = createFileRoute("/")({
  component: FleetDashboardPage,
});
