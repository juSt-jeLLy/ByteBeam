import { Navigate } from "@tanstack/react-router";
import { Activity, Loader2, Lock, Mail } from "lucide-react";
import { useLoginPageModel } from "@/features/fleet/page-models/use-login-page-model";

export function LoginPage() {
  const model = useLoginPageModel();

  if (model.session) return <Navigate to="/dashboard" replace />;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <form
        onSubmit={model.handleSubmit}
        className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-card"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              {model.isSupabaseReady
                ? "Use your Supabase credentials."
                : "Configure Supabase environment variables before signing in."}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="email"
                value={model.email}
                onChange={(event) => model.setEmail(event.target.value)}
                type="email"
                className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="password"
                value={model.password}
                onChange={(event) => model.setPassword(event.target.value)}
                type="password"
                className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={model.isSubmitting || !model.isSupabaseReady}
          className="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 disabled:opacity-60"
        >
          {model.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Open dashboard
        </button>
      </form>
    </main>
  );
}
