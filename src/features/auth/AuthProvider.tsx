import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface DemoSession {
  user: {
    email: string;
    user_metadata: {
      full_name: string;
      role: string;
    };
  };
}

type FleetSession = Session | DemoSession;

interface AuthContextValue {
  session: FleetSession | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const DEMO_SESSION_KEY = "bytebeam-demo-session";

const createDemoSession = (email: string): DemoSession => ({
  user: {
    email,
    user_metadata: {
      full_name: "Ops Manager",
      role: "Fleet Operations",
    },
  },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<FleetSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isDemoMode = !supabase;

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      if (!supabase) {
        const stored = window.localStorage.getItem(DEMO_SESSION_KEY);
        if (mounted && stored) setSession(createDemoSession(stored));
        if (mounted) setIsLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setSession(data.session);
        setIsLoading(false);
      }
    }

    void loadSession();

    if (!supabase) return () => void (mounted = false);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isLoading,
      isDemoMode,
      signIn: async (email, password) => {
        if (!supabase) {
          window.localStorage.setItem(DEMO_SESSION_KEY, email);
          setSession(createDemoSession(email));
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);
      },
      signOut: async () => {
        if (!supabase) {
          window.localStorage.removeItem(DEMO_SESSION_KEY);
          setSession(null);
          return;
        }

        const { error } = await supabase.auth.signOut();
        if (error) throw new Error(error.message);
      },
    }),
    [isDemoMode, isLoading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
