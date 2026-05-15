import { motion } from "framer-motion";
import { ABOUT } from "../../content/content";
import { IMAGES } from "../../content/images";
import { useReveal } from "../../hooks/use-reveal";
import { ArrowRight, Building2 } from "lucide-react";

export const About = () => {
    const left = useReveal();
    const right = useReveal({ threshold: 0.2 });

    return (
        <section id="about" data-testid="about-section" className="relative py-20 sm:py-24 lg:py-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                    <motion.div ref={left.ref} initial={left.initial} animate={left.animate} transition={left.transition} className="lg:col-span-6 relative">
                        <div className="relative aspect-[5/6] rounded-3xl overflow-hidden glass-card">
                            <img
                                src={IMAGES.about.showroom}
                                alt="Punjab Transformer House showroom in Mirpur"
                                className="absolute inset-0 h-full w-full object-cover"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0E1A]/70 via-[#0A0E1A]/10 to-transparent" />
                            <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1.5 text-white text-xs font-semibold">
                                <Building2 className="h-3.5 w-3.5" /> Mirpur, Azad Kashmir
                            </div>
                            <div className="absolute left-5 bottom-5 right-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 text-white">
                                <div className="text-xs uppercase tracking-[0.18em] opacity-80">Authorised Local Supplier</div>
                                <div className="mt-1 font-display font-bold text-lg">Premium Power, Trusted Service.</div>
                            </div>
                        </div>
                        {/* Decorative ring */}
                        <div className="hidden lg:block absolute -bottom-6 -left-6 h-32 w-32 rounded-3xl border-2 border-[#D4AF37]/40" />
                    </motion.div>

                    <motion.div ref={right.ref} initial={right.initial} animate={right.animate} transition={right.transition} className="lg:col-span-6">
                        <span className="inline-flex items-center gap-2 rounded-full glass-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0066FF]">{ABOUT.eyebrow}</span>
                        <h2 className="mt-4 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight" data-testid="about-heading">
                            {ABOUT.heading}
                        </h2>
                        <p className="mt-3 text-base sm:text-lg text-[var(--pth-fg)]/80 font-medium">{ABOUT.subheading}</p>
                        <p className="mt-5 text-[15px] sm:text-base text-[var(--pth-muted)] leading-relaxed">{ABOUT.body}</p>
                        <p className="mt-3 text-[15px] sm:text-base text-[var(--pth-muted)] leading-relaxed">{ABOUT.body2}</p>

                        <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="about-stats">
                            {ABOUT.stats.map((s) => (
                                <div key={s.label} className="rounded-2xl glass-card p-4 text-center">
                                    <div className="font-display font-extrabold text-2xl sm:text-3xl text-gradient-brand">{s.number}</div>
                                    <div className="mt-1 text-[11px] sm:text-xs font-medium text-[var(--pth-muted)] uppercase tracking-[0.12em]">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        <a href="#products" className="mt-7 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border border-[#0066FF]/30 text-[#0066FF] hover:bg-[#0066FF]/10 transition">
                            Explore our products <ArrowRight className="h-4 w-4" />
                        </a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
