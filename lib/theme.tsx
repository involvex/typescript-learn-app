import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme as useSystemScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "system" | "light" | "dark";
export type Scheme = "light" | "dark";

export interface Palette {
  background: string;
  card: string;
  input: string;
  text: string;
  sub: string;
  border: string;
  primary: string;
  onPrimary: string;
  chip: string;
  chipText: string;
  quizBox: string;
  success: string;
  successBg: string;
  danger: string;
  dangerBg: string;
  tabBar: string;
}

const light: Palette = {
  background: "#f1f5f9",
  card: "#ffffff",
  input: "#ffffff",
  text: "#0f172a",
  sub: "#64748b",
  border: "#e2e8f0",
  primary: "#3178c6",
  onPrimary: "#ffffff",
  chip: "#e2e8f0",
  chipText: "#334155",
  quizBox: "#f8fafc",
  success: "#16a34a",
  successBg: "#f0fdf4",
  danger: "#ef4444",
  dangerBg: "#fef2f2",
  tabBar: "#ffffff",
};

const dark: Palette = {
  background: "#0b1220",
  card: "#151f32",
  input: "#151f32",
  text: "#e8eef7",
  sub: "#94a3b8",
  border: "#26334d",
  primary: "#5b9cf0",
  onPrimary: "#08111f",
  chip: "#26334d",
  chipText: "#cbd5e1",
  quizBox: "#151f32",
  success: "#4ade80",
  successBg: "#052e1b",
  danger: "#f87171",
  dangerBg: "#3b0f16",
  tabBar: "#0f172a",
};

const KEY = "ts-guide-theme-mode-v1";

interface ThemeCtx {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  cycle: () => void;
  scheme: Scheme;
  colors: Palette;
}

const Ctx = createContext<ThemeCtx>({
  mode: "system",
  setMode: () => {},
  cycle: () => {},
  scheme: "light",
  colors: light,
});

const ORDER: ThemeMode[] = ["system", "light", "dark"];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useSystemScheme() ?? "light";
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v === "light" || v === "dark" || v === "system") setModeState(v);
      })
      .catch(() => {});
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(KEY, m).catch(() => {});
  };

  const cycle = () => setMode(ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length]);
  const scheme: Scheme =
    mode === "system" ? (system === "dark" ? "dark" : "light") : mode;

  return (
    <Ctx.Provider
      value={{
        mode,
        setMode,
        cycle,
        scheme,
        colors: scheme === "dark" ? dark : light,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() {
  return useContext(Ctx);
}
