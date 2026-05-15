import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { FAQ } from "../../content/content";
import { useReveal } from "../../hooks/use-reveal";

export const Faq = () => {
    const r = useReveal();
    return (
        <section id="faq" data-testid="faq" className="relative py-20 sm:py-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div ref={r.ref} initial={r.initial} animate={r.animate} transition={r.transition} className="text-center">
                    <span className="inline-flex rounded-full glass-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0066FF]">{FAQ.eyebrow}</span>
                    <h2 className="mt-4 font-display font-extrabold text-3xl sm:text-4xl tracking-tight">{FAQ.heading}</h2>
                    <p className="mt-3 text-[15px] sm:text-base text-[var(--pth-muted)]">{FAQ.subheading}</p>
                </motion.div>

                <div className="mt-10 rounded-3xl glass-card p-2 sm:p-3">
                    <Accordion type="single" collapsible className="w-full">
                        {FAQ.items.map((item, i) => (
                            <AccordionItem key={i} value={`q-${i}`} data-testid={`faq-item-${i}`} className="border-b last:border-b-0 border-black/5 dark:border-white/10 px-3">
                                <AccordionTrigger data-testid={`faq-trigger-${i}`} className="text-left font-semibold text-[15px] sm:text-base hover:no-underline">
                                    {item.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-[14px] sm:text-[15px] text-[var(--pth-muted)] leading-relaxed">
                                    {item.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
};
