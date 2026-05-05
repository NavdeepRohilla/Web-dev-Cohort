import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const THEME_KEY = "authflow-pro-theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_KEY) || getPreferredTheme();
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="fixed right-4 top-4 z-40 inline-flex h-11 items-center gap-2 rounded-lg border border-zinc-200 bg-white/90 px-3 text-sm font-black text-zinc-900 shadow-sm backdrop-blur transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-zinc-900/90 dark:text-zinc-50"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}

function getPreferredTheme() {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
