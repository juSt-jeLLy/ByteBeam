import { createFileRoute } from "@tanstack/react-router";
import { TripsPage } from "@/features/fleet/pages/trips-page";

export const Route = createFileRoute("/trips")({
  component: TripsPage,
});
