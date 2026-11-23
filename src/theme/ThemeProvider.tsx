import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { type ColourPreference, readPreference, resolve, writePreference } from "./cookie";

interface ThemeContextValue {
  preference: ColourPreference;
  resolved: "light" | "dark";
  setPreference: (p: ColourPreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const DARK_QUERY = "(prefers-color-scheme: dark)";

export interface ThemeProviderProps {
  children: ReactNode;
  /** Force a starting preference without saving it (for screenshots and tests). */
  forcePreference?: ColourPreference;
}

export function ThemeProvider({ children, forcePreference }: ThemeProviderProps) {
  const [preference, setPref] = useState<ColourPreference>(() => forcePreference ?? readPreference());
  const [systemDark, setSystemDark] = useState(() => window.matchMedia?.(DARK_QUERY).matches ?? false);

  useEffect(() => {
    const mq = window.matchMedia?.(DARK_QUERY);
    if (!mq) return;
    const on = () => setSystemDark(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const resolved = resolve(preference, systemDark);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolved);
  }, [resolved]);

  const setPreference = useCallback((p: ColourPreference) => {
    setPref(p);
    writePreference(p);
  }, []);

  const value = useMemo(() => ({ preference, resolved, setPreference }), [preference, resolved, setPreference]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
