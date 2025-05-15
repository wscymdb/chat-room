import React, { createContext, useContext, useState, useEffect } from "react";
import { GradientType } from "@/components/BackgroundSelector";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDarkMode: boolean;
  background: GradientType;
  setBackground: (background: GradientType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem("theme");
    return (savedTheme as ThemeMode) || "system";
  });

  const [background, setBackground] = useState<GradientType>(() => {
    const savedBackground = localStorage.getItem("background");
    return (savedBackground as GradientType) || "default";
  });

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        setIsDarkMode(systemTheme === "dark");
        document.documentElement.setAttribute("data-theme", systemTheme);
      } else {
        setIsDarkMode(theme === "dark");
        document.documentElement.setAttribute("data-theme", theme);
      }
    };

    updateTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        updateTheme();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("background", background);
  }, [background]);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, isDarkMode, background, setBackground }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
