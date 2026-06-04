import { createFileRoute } from "@tanstack/react-router";
import { MapPage } from "@/features/fleet/pages/map-page";

export const Route = createFileRoute("/map")({
  component: MapPage,
});
