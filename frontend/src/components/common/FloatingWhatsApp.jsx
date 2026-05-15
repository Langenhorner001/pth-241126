import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { SITE, buildWhatsAppLink } from "../../content/content";

export const FloatingWhatsApp = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 200);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <a
            href={buildWhatsAppLink(SITE.whatsappPrefill)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            data-testid="floating-whatsapp-button"
            className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981] text-white shadow-[0_18px_40px_-10px_rgba(16,185,129,0.65)] transition-all duration-300 hover:scale-105 pulse-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pth-ring)] ${visible ? "opacity-100 translate-y-0" : "opacity-0 pointer-events-none translate-y-2"}`}
        >
            <MessageCircle className="h-6 w-6" strokeWidth={2.2} />
            <span className="sr-only">Chat on WhatsApp</span>
        </a>
    );
};
