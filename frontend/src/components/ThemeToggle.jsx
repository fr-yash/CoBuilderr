import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("cobuilder-theme");
  if (savedTheme) return savedTheme;

  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState(getInitialTheme);
  const isLight = theme === "light";

  useEffect(() => {
    document.documentElement.classList.toggle("light-theme", isLight);
    document.documentElement.classList.toggle("dark-theme", !isLight);
    localStorage.setItem("cobuilder-theme", theme);
  }, [isLight, theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((currentTheme) => currentTheme === "light" ? "dark" : "light")}
      className="theme-toggle fixed bottom-4 right-4 z-[60] inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-lg transition-transform hover:scale-105"
      title={isLight ? "Switch to dark theme" : "Switch to light theme"}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
    >
      {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
};

export default ThemeToggle;
