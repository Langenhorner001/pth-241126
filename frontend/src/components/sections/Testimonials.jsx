import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { listTestimonials } from "../../lib/api";
import { TESTIMONIALS_SECTION } from "../../content/content";
import { useReveal } from "../../hooks/use-reveal";

const Stars = ({ rating = 5 }) => (
    <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[var(--pth-muted)]/40"}`}
                strokeWidth={1.5}
            />
        ))}
    </div>
);

const initials = (name) =>
    name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

const Card = ({ t, index }) => {
    const r = useReveal({ threshold: 0.1 });
    return (
        <motion.div
            ref={r.ref}
            initial={r.initial}
            animate={r.animate}
            transition={{ ...r.transition, delay: (index % 3) * 0.06 }}
            className="relative rounded-3xl glass-card p-6 sm:p-7 flex flex-col"
            data-testid={`testimonial-card-${index}`}
        >
            <Quote className="absolute top-5 right-5 h-7 w-7 text-[#0066FF]/15" />
            <Stars rating={t.rating} />
            <p className="mt-4 text-[15px] text-[var(--pth-fg)]/85 leading-relaxed">“{t.review_text}”</p>
            <div className="mt-6 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#0066FF] to-[#1E3A8A] text-white font-display font-bold">
                    {initials(t.customer_name)}
                </span>
                <div className="flex-1">
                    <div className="font-semibold text-sm">{t.customer_name}</div>
                    <div className="text-xs text-[var(--pth-muted)]">{t.location}</div>
                </div>
                {t.customer_type && (
                    <span className="rounded-full bg-[#D4AF37]/15 text-[#a68224] dark:text-[#D4AF37] text-[10px] font-bold px-2.5 py-1 uppercase tracking-[0.1em]">
                        {t.customer_type}
                    </span>
                )}
            </div>
        </motion.div>
    );
};

export const Testimonials = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const heading = useReveal();

    useEffect(() => {
        let mounted = true;
        listTestimonials({ approved: true, limit: 12 })
            .then((d) => {
                if (!mounted) return;
                setItems(Array.isArray(d) ? d : []);
                setLoading(false);
            })
            .catch(() => mounted && setLoading(false));
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <section id="testimonials" data-testid="testimonials" className="relative py-20 sm:py-24 lg:py-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div ref={heading.ref} initial={heading.initial} animate={heading.animate} transition={heading.transition} className="text-center max-w-2xl mx-auto">
                    <span className="inline-flex rounded-full glass-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0066FF]">{TESTIMONIALS_SECTION.eyebrow}</span>
                    <h2 className="mt-4 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight">{TESTIMONIALS_SECTION.heading}</h2>
                    <p className="mt-3 text-[15px] sm:text-base text-[var(--pth-muted)]">{TESTIMONIALS_SECTION.subheading}</p>
                </motion.div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading && Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-3xl glass-card p-7">
                            <div className="h-4 w-24 rounded bg-[var(--pth-muted)]/10 animate-pulse" />
                            <div className="mt-4 h-3 w-full rounded bg-[var(--pth-muted)]/10 animate-pulse" />
                            <div className="mt-2 h-3 w-4/5 rounded bg-[var(--pth-muted)]/10 animate-pulse" />
                            <div className="mt-6 h-10 w-2/3 rounded bg-[var(--pth-muted)]/10 animate-pulse" />
                        </div>
                    ))}
                    {!loading && items.map((t, i) => <Card key={t.id || i} t={t} index={i} />)}
                </div>
            </div>
        </section>
    );
};
