import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/features/fleet/pages/login-page";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});
