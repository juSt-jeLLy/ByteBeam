import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getRouter } from "./router";
import { ThemeProvider } from "./features/theme/ThemeProvider";
import { AuthProvider } from "./features/auth/AuthProvider";
import { Toaster } from "./components/ui/sonner";
import "./styles.css";
import "leaflet/dist/leaflet.css";

const queryClient = new QueryClient();
const router = getRouter(queryClient);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
