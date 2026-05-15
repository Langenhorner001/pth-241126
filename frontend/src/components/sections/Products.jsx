import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import * as Icons from "lucide-react";
import { MessageCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { listProducts } from "../../lib/api";
import { PRODUCTS_SECTION, SITE, buildWhatsAppLink } from "../../content/content";
import { categoryImage } from "../../content/images";
import { useReveal } from "../../hooks/use-reveal";

const Badge = ({ children }) => (
    <span className="absolute top-3 right-3 z-10 rounded-full bg-[#D4AF37] text-[#0A0E1A] text-[10px] font-bold px-2.5 py-1 shadow-md uppercase tracking-[0.1em]">
        {children}
    </span>
);

const ProductCard = ({ product, index }) => {
    const cardRef = useRef(null);
    const reduced = useReducedMotion();
    const reveal = useReveal({ threshold: 0.1 });

    const onMove = (e) => {
        if (reduced) return;
        const el = cardRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--rx", `${(-y * 6).toFixed(2)}deg`);
        el.style.setProperty("--ry", `${(x * 8).toFixed(2)}deg`);
        el.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(0)}%`);
        el.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(0)}%`);
    };
    const onLeave = () => {
        const el = cardRef.current;
        if (!el) return;
        el.style.setProperty("--rx", `0deg`);
        el.style.setProperty("--ry", `0deg`);
    };

    const Icon = (product.icon && Icons[product.icon]) || Icons.Zap;
    const img = product.image_url || categoryImage(product.category);

    return (
        <motion.div
            ref={reveal.ref}
            initial={reveal.initial}
            animate={reveal.animate}
            transition={{ ...reveal.transition, delay: index * 0.06 }}
            className="[perspective:900px]"
            data-testid={`product-category-card-${index}`}
        >
            <div
                ref={cardRef}
                onMouseMove={onMove}
                onMouseLeave={onLeave}
                style={{ transform: "rotateX(var(--rx,0)) rotateY(var(--ry,0))" }}
                className="group relative h-full rounded-3xl glass-card transition-transform duration-300 will-change-transform overflow-hidden"
            >
                {/* Animated gradient border */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl [background:conic-gradient(from_180deg,rgba(0,102,255,0.55),rgba(0,229,255,0.55),rgba(212,175,55,0.55),rgba(0,102,255,0.55))] opacity-0 group-hover:opacity-40 transition-opacity duration-500 [mask:linear-gradient(#000,#000)_content-box,linear-gradient(#000,#000)] [mask-composite:exclude] p-px" />
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                        src={img}
                        alt={product.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                            const fb = categoryImage(product.category);
                            if (e.currentTarget.src !== fb) e.currentTarget.src = fb;
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A]/80 via-[#0A0E1A]/15 to-transparent" />
                    {product.badge && <Badge>{product.badge}</Badge>}
                    <div className="absolute left-3 bottom-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-white">
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
                <div className="p-5">
                    <h3 className="font-display font-bold text-lg sm:text-xl tracking-tight">{product.name}</h3>
                    <p className="mt-2 text-sm text-[var(--pth-muted)] leading-relaxed line-clamp-3">
                        {product.description}
                    </p>
                    <ul className="mt-4 space-y-1.5">
                        {(product.features || []).slice(0, 3).map((f) => (
                            <li key={f} className="flex items-start gap-2 text-[13px] text-[var(--pth-fg)]">
                                <ShieldCheck className="mt-0.5 h-4 w-4 text-[#0066FF]" />
                                {f}
                            </li>
                        ))}
                    </ul>
                    <a
                        href={buildWhatsAppLink(`Hello PTH, I'm interested in ${product.name}. Please share details and pricing.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`product-card-whatsapp-${index}`}
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#10B981] text-white px-4 py-2.5 text-sm font-semibold hover:brightness-105 transition"
                    >
                        <MessageCircle className="h-4 w-4" /> Inquire on WhatsApp
                    </a>
                </div>
            </div>
        </motion.div>
    );
};

export const Products = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const heading = useReveal();

    useEffect(() => {
        let mounted = true;
        listProducts({ limit: 20 })
            .then((data) => {
                if (!mounted) return;
                setItems(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => {
                if (!mounted) return;
                setError(true);
                setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <section id="products" data-testid="products-section" className="relative py-20 sm:py-24 lg:py-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div ref={heading.ref} initial={heading.initial} animate={heading.animate} transition={heading.transition} className="text-center max-w-2xl mx-auto">
                    <span className="inline-flex rounded-full glass-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0066FF]">{PRODUCTS_SECTION.eyebrow}</span>
                    <h2 className="mt-4 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight">{PRODUCTS_SECTION.heading}</h2>
                    <p className="mt-3 text-[15px] sm:text-base text-[var(--pth-muted)]">{PRODUCTS_SECTION.subheading}</p>
                </motion.div>

                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="products-grid">
                    {loading && (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="rounded-3xl glass-card overflow-hidden">
                                <div className="aspect-[16/10] bg-[var(--pth-muted)]/10 animate-pulse" />
                                <div className="p-5">
                                    <div className="h-5 w-2/3 rounded-md bg-[var(--pth-muted)]/15 animate-pulse" />
                                    <div className="mt-3 h-3 w-full rounded bg-[var(--pth-muted)]/10 animate-pulse" />
                                    <div className="mt-2 h-3 w-4/5 rounded bg-[var(--pth-muted)]/10 animate-pulse" />
                                    <div className="mt-5 h-10 w-full rounded-full bg-[var(--pth-muted)]/10 animate-pulse" />
                                </div>
                            </div>
                        ))
                    )}
                    {!loading && error && (
                        <div className="col-span-full rounded-3xl glass-card p-8 text-center">
                            <p className="text-base text-[var(--pth-muted)]">{PRODUCTS_SECTION.fallbackMessage}</p>
                            <a
                                href={buildWhatsAppLink(SITE.whatsappPrefill)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#10B981] text-white px-5 py-2.5 text-sm font-semibold"
                            >
                                <MessageCircle className="h-4 w-4" /> Contact us on WhatsApp
                            </a>
                        </div>
                    )}
                    {!loading && !error && items.map((p, i) => <ProductCard key={p.id || i} product={p} index={i} />)}
                </div>

                <div className="mt-12 text-center">
                    <a
                        href={buildWhatsAppLink("Hello PTH, please share your full product catalog.")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37] text-[#a68224] dark:text-[#D4AF37] px-6 py-3 text-sm font-semibold hover:bg-[#D4AF37]/10 transition"
                    >
                        Request Full Catalog <ArrowRight className="h-4 w-4" />
                    </a>
                </div>
            </div>
        </section>
    );
};
