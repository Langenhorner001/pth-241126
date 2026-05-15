import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MessageCircle, ChevronDown, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { HERO, SITE, buildWhatsAppLink } from "../../content/content";
import { IMAGES } from "../../content/images";

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.055, delayChildren: 0.15 } }
};
const word = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } }
};

export const Hero = () => {
    const reduced = useReducedMotion();
    return (
        <section
            id="home"
            data-testid="hero-section"
            className="relative overflow-hidden hero-mesh-bg pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24"
        >
            <div className="circuit-overlay" aria-hidden />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                    {/* Copy */}
                    <div className="lg:col-span-7 relative z-10">
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 rounded-full glass-card px-3.5 py-1.5 text-xs font-semibold text-[var(--pth-fg)]"
                            data-testid="hero-eyebrow"
                        >
                            <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" /> {HERO.badge}
                        </motion.span>

                        <motion.h1
                            variants={container}
                            initial={reduced ? "show" : "hidden"}
                            animate="show"
                            data-testid="hero-headline"
                            className="mt-5 font-display font-extrabold text-[40px] leading-[1.05] sm:text-5xl lg:text-6xl tracking-tight"
                        >
                            {HERO.headline.map((w, i) => (
                                <motion.span
                                    key={i}
                                    variants={word}
                                    className={`inline-block mr-2.5 ${
                                        ["Voltage", "Stabilizers", "Power", "Solutions"].includes(w)
                                            ? "text-gradient-brand"
                                            : ""
                                    }`}
                                >
                                    {w}
                                </motion.span>
                            ))}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            data-testid="hero-subheadline"
                            className="mt-5 max-w-2xl text-base sm:text-lg text-[var(--pth-muted)] leading-relaxed"
                        >
                            {HERO.subheadline}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.55 }}
                            className="mt-7 flex flex-wrap gap-3"
                        >
                            <a
                                href={HERO.primaryCta.target}
                                data-testid="hero-primary-cta-button"
                                className="group inline-flex items-center gap-2 rounded-full gold-gradient px-6 py-3 text-sm sm:text-base font-semibold shadow-[0_14px_40px_-10px_rgba(212,175,55,0.7)] hover:shadow-[0_18px_50px_-10px_rgba(212,175,55,0.9)] hover:-translate-y-[1px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pth-ring)]"
                            >
                                {HERO.primaryCta.label}
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </a>
                            <a
                                href={buildWhatsAppLink(SITE.whatsappPrefill)}
                                target="_blank"
                                rel="noopener noreferrer"
                                data-testid="hero-whatsapp-cta-button"
                                className="inline-flex items-center gap-2 rounded-full border-2 border-[#10B981] text-[#10B981] dark:bg-[#10B981] dark:text-white px-6 py-3 text-sm sm:text-base font-semibold hover:bg-[#10B981]/10 dark:hover:brightness-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pth-ring)]"
                            >
                                <MessageCircle className="h-4 w-4" /> {HERO.secondaryCta.label}
                            </a>
                        </motion.div>

                        <motion.ul
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.75 }}
                            className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5"
                            data-testid="hero-trust-badges"
                        >
                            {HERO.trustBadges.map((b) => (
                                <li key={b} className="flex items-center gap-2 text-xs sm:text-[13px] text-[var(--pth-fg)]">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0066FF]/10 text-[#0066FF]">
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                    </span>
                                    {b}
                                </li>
                            ))}
                        </motion.ul>
                    </div>

                    {/* Visual */}
                    <div className="lg:col-span-5 relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            className="relative aspect-[4/5] rounded-3xl overflow-hidden glass-card glow-blue float-y"
                        >
                            <img
                                src={IMAGES.hero.product}
                                alt="Premium power solutions and industrial transformer"
                                className="absolute inset-0 h-full w-full object-cover"
                                loading="eager"
                                fetchpriority="high"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A]/85 via-[#0A0E1A]/20 to-transparent" />
                            <div className="absolute inset-x-5 bottom-5 flex items-center justify-between">
                                <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 px-3 py-2.5">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0066FF] text-white">
                                        <Zap className="h-4.5 w-4.5" />
                                    </span>
                                    <div className="text-white">
                                        <div className="text-[11px] uppercase tracking-[0.18em] opacity-80">Premium</div>
                                        <div className="text-sm font-semibold">Power Solutions</div>
                                    </div>
                                </div>
                                <div className="rounded-2xl bg-[#D4AF37]/95 text-[#0A0E1A] px-3 py-2 text-xs font-bold shadow-lg">
                                    10+ Years
                                </div>
                            </div>
                        </motion.div>

                        {/* floating spec cards */}
                        <motion.div
                            initial={{ opacity: 0, x: -20, y: 10 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            className="hidden md:flex absolute -left-6 top-12 items-center gap-3 rounded-2xl glass-card px-4 py-3 shadow-[0_18px_60px_rgba(10,14,26,0.22)]"
                            data-testid="hero-spec-card-1"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10B981]/15 text-[#10B981]">
                                <ShieldCheck className="h-4.5 w-4.5" />
                            </span>
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--pth-muted)]">Warranty</div>
                                <div className="text-sm font-semibold">On Every Product</div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20, y: -10 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.45 }}
                            className="hidden md:flex absolute -right-6 bottom-16 items-center gap-3 rounded-2xl glass-card px-4 py-3"
                            data-testid="hero-spec-card-2"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4AF37]/20 text-[#a68224]">
                                <Sparkles className="h-4.5 w-4.5" />
                            </span>
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--pth-muted)]">Trusted by</div>
                                <div className="text-sm font-semibold">1000+ Customers</div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <a
                    href="#trust"
                    aria-label="Scroll to next section"
                    className="hidden md:flex absolute left-1/2 -translate-x-1/2 bottom-3 items-center justify-center h-10 w-10 rounded-full glass-card animate-bounce"
                >
                    <ChevronDown className="h-4 w-4" />
                </a>
            </div>
        </section>
    );
};
