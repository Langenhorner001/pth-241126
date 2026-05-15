import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import { SERVICE_AREA, SITE } from "../../content/content";
import { useReveal } from "../../hooks/use-reveal";

export const ServiceArea = () => {
    const r = useReveal();
    return (
        <section id="service-area" data-testid="services-area" className="relative py-20 sm:py-24 overflow-hidden">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    <motion.div ref={r.ref} initial={r.initial} animate={r.animate} transition={r.transition} className="lg:col-span-6">
                        <span className="inline-flex rounded-full glass-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0066FF]">{SERVICE_AREA.eyebrow}</span>
                        <h2 className="mt-4 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight">{SERVICE_AREA.heading}</h2>
                        <p className="mt-3 text-base text-[var(--pth-fg)]/80">{SERVICE_AREA.subheading}</p>
                        <p className="mt-3 text-[15px] text-[var(--pth-muted)] leading-relaxed">{SERVICE_AREA.description}</p>

                        <div className="mt-6 flex flex-wrap gap-2">
                            {SERVICE_AREA.areas.map((a) => (
                                <span
                                    key={a.name}
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium ${
                                        a.primary
                                            ? "bg-[#0066FF] text-white"
                                            : "glass-card text-[var(--pth-fg)]"
                                    }`}
                                >
                                    <MapPin className="h-3.5 w-3.5" /> {a.name}
                                </span>
                            ))}
                        </div>

                        <a
                            href="#map"
                            data-testid="visit-showroom-button"
                            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#0066FF] text-white px-5 py-2.5 text-sm font-semibold hover:brightness-110 transition"
                        >
                            <Navigation className="h-4 w-4" /> Visit Our Showroom
                        </a>
                    </motion.div>

                    {/* Stylized map */}
                    <div className="lg:col-span-6">
                        <div className="relative aspect-square sm:aspect-[5/4] rounded-3xl glass-card overflow-hidden">
                            <div className="absolute inset-0 hero-mesh-bg" aria-hidden />
                            <svg viewBox="0 0 400 320" className="absolute inset-0 h-full w-full">
                                <defs>
                                    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.5" />
                                        <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
                                    </radialGradient>
                                </defs>
                                {/* Stylized AJK shape */}
                                <path
                                    d="M70 140 C 80 80, 160 60, 200 90 C 245 60, 320 80, 330 150 C 345 190, 300 250, 240 240 C 200 290, 110 280, 90 230 C 50 200, 55 165, 70 140 Z"
                                    fill="none"
                                    stroke="#0066FF"
                                    strokeWidth="1.5"
                                    strokeDasharray="4 4"
                                    opacity="0.45"
                                />
                                <circle cx="195" cy="170" r="60" fill="url(#glow)" />
                            </svg>
                            {/* Pins */}
                            {[
                                { name: "Mirpur", x: "48%", y: "52%", primary: true },
                                { name: "Dadyal", x: "30%", y: "40%" },
                                { name: "Islamgarh", x: "62%", y: "42%" },
                                { name: "Chakswari", x: "72%", y: "60%" },
                                { name: "Kotli", x: "58%", y: "75%" },
                                { name: "Bhimber", x: "30%", y: "68%" }
                            ].map((p) => (
                                <div
                                    key={p.name}
                                    className="absolute"
                                    style={{ left: p.x, top: p.y, transform: "translate(-50%,-100%)" }}
                                >
                                    <div className={`relative flex items-center gap-1.5`}>
                                        <span
                                            className={`relative inline-flex h-3.5 w-3.5 rounded-full ${p.primary ? "bg-[#0066FF] text-[#0066FF] pin-ping" : "bg-[#D4AF37]"}`}
                                        />
                                        <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.primary ? "bg-[#0066FF] text-white" : "bg-white/85 dark:bg-white/10 text-[var(--pth-fg)] border border-black/5 dark:border-white/10"}`}>{p.name}</span>
                                    </div>
                                </div>
                            ))}
                            <div className="absolute bottom-4 left-4 right-4 rounded-2xl glass-card px-4 py-3 flex items-center justify-between">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--pth-muted)]">Coverage</div>
                                    <div className="text-sm font-semibold">80 km around Mirpur</div>
                                </div>
                                <div className="text-xs text-[var(--pth-muted)]">{SITE.businessHours}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
