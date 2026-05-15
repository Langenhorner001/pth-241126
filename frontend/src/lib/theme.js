import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";

const STORAGE_KEY = "pth-theme";
const ThemeCtx = createContext({ theme: "light", setTheme: () => {}, toggle: () => {} });

const getSystemTheme = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

const applyTheme = (t) => {
    const root = document.documentElement;
    if (t === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    root.style.colorScheme = t;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState("light");

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        const initial = stored || getSystemTheme();
        setThemeState(initial);
        applyTheme(initial);
    }, []);

    const setTheme = useCallback((t) => {
        setThemeState(t);
        localStorage.setItem(STORAGE_KEY, t);
        applyTheme(t);
    }, []);

    const toggle = useCallback(() => {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
    }, [theme, setTheme]);

    const value = useMemo(() => ({ theme, setTheme, toggle }), [theme, setTheme, toggle]);
    return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
};

export const useTheme = () => useContext(ThemeCtx);
