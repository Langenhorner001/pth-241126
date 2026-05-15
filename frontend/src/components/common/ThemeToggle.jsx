import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../lib/theme";

export const ThemeToggle = () => {
    const { theme, toggle } = useTheme();
    const dark = theme === "dark";
    return (
        <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            data-testid="theme-toggle-button"
            className="relative h-10 w-10 rounded-full glass-card flex items-center justify-center transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pth-ring)]"
        >
            <Sun className={`absolute h-4.5 w-4.5 transition-all ${dark ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`} />
            <Moon className={`absolute h-4.5 w-4.5 transition-all ${dark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"}`} />
        </button>
    );
};
