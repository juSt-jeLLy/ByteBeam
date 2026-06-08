import { Moon, Sun, type LucideIcon } from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider";
import { useTheme, type Theme } from "@/features/theme/ThemeProvider";

export const THEME_OPTIONS: Array<{ value: Theme; label: string; icon: LucideIcon }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

export function useSettingsPageModel() {
  const { theme, setTheme } = useTheme();
  const { session, isSupabaseReady } = useAuth();
  const themeOptions = THEME_OPTIONS.map((option) => ({
    ...option,
    active: theme === option.value,
    select: () => setTheme(option.value),
  }));

  return {
    theme,
    setTheme,
    themeOptions,
    signedInAs: session?.user.email ?? "Not signed in",
    backendMode: isSupabaseReady ? "Supabase" : "Not configured",
    productName: "Fleet management dashboard",
  };
}
