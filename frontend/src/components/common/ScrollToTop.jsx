import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export const ScrollToTopButton = () => {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 500);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    return (
        <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
            data-testid="scroll-to-top-button"
            className={`fixed bottom-24 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full glass-card transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pth-ring)] ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
            <ArrowUp className="h-4.5 w-4.5" />
        </button>
    );
};
