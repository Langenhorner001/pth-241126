import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { WHY_US } from "../../content/content";
import { useReveal } from "../../hooks/use-reveal";

export const WhyUs = () => {
    const heading = useReveal();
    return (
        <section id="why-us" data-testid="why-choose-us" className="relative py-20 sm:py-24 lg:py-28 overflow-hidden">
            <div className="absolute inset-0 hero-mesh-bg opacity-50" aria-hidden />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div ref={heading.ref} initial={heading.initial} animate={heading.animate} transition={heading.transition} className="text-center max-w-2xl mx-auto">
                    <span className="inline-flex rounded-full glass-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0066FF]">{WHY_US.eyebrow}</span>
                    <h2 className="mt-4 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight">{WHY_US.heading}</h2>
                    <p className="mt-3 text-[15px] sm:text-base text-[var(--pth-muted)]">{WHY_US.subheading}</p>
                </motion.div>

                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {WHY_US.items.map((it, i) => <ItemCard key={it.title} item={it} index={i} />)}
                </div>
            </div>
        </section>
    );
};

const ItemCard = ({ item, index }) => {
    const r = useReveal({ threshold: 0.1 });
    const Icon = Icons[item.icon] || Icons.Sparkles;
    return (
        <motion.div
            ref={r.ref}
            initial={r.initial}
            animate={r.animate}
            transition={{ ...r.transition, delay: (index % 3) * 0.06 }}
            className="group rounded-3xl glass-card p-6 sm:p-7 hover:-translate-y-1 transition-transform duration-300"
            data-testid={`why-us-card-${index}`}
        >
            <div className="flex items-start gap-4">
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/15 group-hover:scale-110 transition">
                    <Icon className="h-6 w-6" strokeWidth={1.85} />
                </span>
                <div>
                    <h3 className="font-display font-bold text-lg tracking-tight">{item.title}</h3>
                    <p className="mt-1.5 text-[14px] text-[var(--pth-muted)] leading-relaxed">{item.description}</p>
                </div>
            </div>
        </motion.div>
    );
};
