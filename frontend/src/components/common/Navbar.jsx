import { useEffect, useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import { NAV_LINKS, SITE, buildWhatsAppLink } from "../../content/content";
import { Logo } from "../common/Logo";
import { ThemeToggle } from "../common/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "../ui/sheet";

export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [active, setActive] = useState("home");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 8);
            // Active section
            const sections = NAV_LINKS.map((n) => document.getElementById(n.id)).filter(Boolean);
            const fromTop = window.scrollY + 120;
            for (let i = sections.length - 1; i >= 0; i--) {
                if (sections[i].offsetTop <= fromTop) {
                    setActive(sections[i].id);
                    return;
                }
            }
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            data-testid="site-navbar"
            className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${scrolled ? "glass-nav py-2" : "py-3.5 bg-transparent"}`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <Logo />

                <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
                    {NAV_LINKS.map((link) => {
                        const isActive = active === link.id;
                        return (
                            <a
                                key={link.id}
                                href={link.href}
                                data-testid={`nav-link-${link.id}`}
                                className={`relative px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? "text-[var(--pth-fg)]" : "text-[var(--pth-muted)] hover:text-[var(--pth-fg)]"}`}
                            >
                                {link.label}
                                {isActive && (
                                    <span className="pointer-events-none absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-[#0066FF] via-[#00E5FF] to-[#D4AF37]" />
                                )}
                            </a>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <a
                        href={buildWhatsAppLink(SITE.whatsappPrefill)}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="navbar-whatsapp-button"
                        className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[#10B981] text-white px-4 py-2 text-sm font-semibold shadow-[0_10px_28px_-10px_rgba(16,185,129,0.7)] hover:shadow-[0_14px_34px_-10px_rgba(16,185,129,0.9)] hover:-translate-y-[1px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pth-ring)]"
                    >
                        <MessageCircle className="h-4 w-4" /> WhatsApp
                    </a>

                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <button
                                type="button"
                                aria-label="Open menu"
                                data-testid="mobile-menu-open-button"
                                className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-full glass-card"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[85%] sm:w-[420px] p-0 bg-[var(--pth-bg)]">
                            <div className="flex flex-col h-full">
                                <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/10">
                                    <Logo />
                                    <SheetClose asChild>
                                        <button
                                            aria-label="Close menu"
                                            data-testid="mobile-menu-close-button"
                                            className="h-10 w-10 inline-flex items-center justify-center rounded-full glass-card"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </SheetClose>
                                </div>
                                <nav className="flex-1 overflow-auto px-4 py-6 flex flex-col gap-1">
                                    {NAV_LINKS.map((link) => (
                                        <a
                                            key={link.id}
                                            href={link.href}
                                            onClick={() => setOpen(false)}
                                            data-testid={`mobile-nav-link-${link.id}`}
                                            className="px-4 py-3 rounded-xl text-base font-semibold text-[var(--pth-fg)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                                        >
                                            {link.label}
                                        </a>
                                    ))}
                                </nav>
                                <div className="p-5 border-t border-black/5 dark:border-white/10">
                                    <a
                                        href={buildWhatsAppLink(SITE.whatsappPrefill)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setOpen(false)}
                                        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#10B981] text-white px-5 py-3 text-base font-semibold shadow-[0_10px_28px_-10px_rgba(16,185,129,0.7)]"
                                    >
                                        <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
                                    </a>
                                    <p className="mt-3 text-center text-xs text-[var(--pth-muted)]">{SITE.phoneDisplay} • {SITE.businessHours}</p>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
};
