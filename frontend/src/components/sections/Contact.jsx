import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { CONTACT, SITE, buildWhatsAppLink } from "../../content/content";
import { submitLead } from "../../lib/api";
import { useReveal } from "../../hooks/use-reveal";

const initialState = {
    name: "",
    phone: "",
    email: "",
    product_interest: "",
    message: "",
    company: "" // honeypot
};

export const Contact = () => {
    const [form, setForm] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const r = useReveal();

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        setErrors((er) => ({ ...er, [name]: undefined }));
    };

    const validate = () => {
        const e = {};
        if (form.name.trim().length < 3) e.name = "Please enter your full name (min 3 chars).";
        const phone = form.phone.replace(/[\s\-()]/g, "");
        if (!/^(\+?92|0)?3\d{9}$/.test(phone))
            e.phone = "Enter a valid Pakistani mobile (e.g. 03XXXXXXXXX).";
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            e.email = "Enter a valid email address.";
        if (form.message.trim().length < 10) e.message = "Please describe your inquiry (min 10 chars).";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            const payload = { ...form };
            // empty -> null for optional fields
            if (!payload.email) delete payload.email;
            if (!payload.product_interest) delete payload.product_interest;
            await submitLead(payload);
            setSuccess(true);
            toast.success("Message sent! Redirecting to WhatsApp...");

            // Build prefilled WA message and open in new tab
            const msg = `Hello Punjab Transformer House,%0A%0AName: ${encodeURIComponent(form.name)}%0APhone: ${encodeURIComponent(form.phone)}${form.product_interest ? `%0AProduct: ${encodeURIComponent(form.product_interest)}` : ""}%0A%0A${encodeURIComponent(form.message)}`;
            const link = `${SITE.whatsappLink}?text=${msg}`;
            setTimeout(() => window.open(link, "_blank", "noopener"), 800);
            setForm(initialState);
            setTimeout(() => setSuccess(false), 6000);
        } catch (err) {
            const detail = err?.response?.data?.detail;
            const msg = typeof detail === "string" ? detail : Array.isArray(detail) ? detail[0]?.msg : "Submission failed. Please try again.";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section id="contact" data-testid="contact-section" className="relative py-20 sm:py-24 lg:py-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div ref={r.ref} initial={r.initial} animate={r.animate} transition={r.transition} className="text-center max-w-2xl mx-auto">
                    <span className="inline-flex rounded-full glass-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0066FF]">{CONTACT.eyebrow}</span>
                    <h2 className="mt-4 font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight">{CONTACT.heading}</h2>
                    <p className="mt-3 text-[15px] sm:text-base text-[var(--pth-muted)]">{CONTACT.subheading}</p>
                </motion.div>

                <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-7">
                        <form
                            onSubmit={onSubmit}
                            data-testid="contact-form"
                            className="rounded-3xl glass-card p-6 sm:p-8"
                            noValidate
                        >
                            {/* Honeypot - hidden from real users */}
                            <input type="text" name="company" value={form.company} onChange={onChange} className="hidden" tabIndex={-1} autoComplete="off" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Full Name *" htmlFor="name" error={errors.name}>
                                    <Input id="name" name="name" value={form.name} onChange={onChange} placeholder="Your full name" data-testid="contact-name-input" autoComplete="name" />
                                </Field>
                                <Field label="Phone Number *" htmlFor="phone" error={errors.phone}>
                                    <Input id="phone" name="phone" value={form.phone} onChange={onChange} placeholder="03XX XXXXXXX" data-testid="contact-phone-input" inputMode="tel" autoComplete="tel" />
                                </Field>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                <Field label="Email (Optional)" htmlFor="email" error={errors.email}>
                                    <Input id="email" name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" data-testid="contact-email-input" autoComplete="email" />
                                </Field>
                                <Field label="Product Interest" htmlFor="product_interest">
                                    <select
                                        id="product_interest"
                                        name="product_interest"
                                        value={form.product_interest}
                                        onChange={onChange}
                                        data-testid="contact-product-select"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <option value="">Choose a product (optional)</option>
                                        {CONTACT.productOptions.map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </Field>
                            </div>
                            <div className="mt-4">
                                <Field label="Your Message *" htmlFor="message" error={errors.message}>
                                    <Textarea id="message" name="message" value={form.message} onChange={onChange} placeholder="Tell us about your requirement, location, and any technical details..." rows={5} data-testid="contact-message-input" />
                                </Field>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                data-testid="contact-form-submit-button"
                                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#0066FF] text-white px-6 py-3.5 text-sm sm:text-base font-semibold shadow-[0_18px_40px_-10px_rgba(0,102,255,0.6)] hover:brightness-110 transition disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : success ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                                {submitting ? "Sending..." : success ? "Sent! Opening WhatsApp" : "Send & Continue on WhatsApp"}
                            </button>
                            <p className="mt-3 text-center text-xs text-[var(--pth-muted)]">We will redirect you to WhatsApp with your message ready.</p>
                        </form>
                    </div>

                    {/* Info */}
                    <aside className="lg:col-span-5 flex flex-col gap-4">
                        <InfoCard icon={Phone} label="Call us (Mobile)" value={SITE.phoneDisplay} href={`tel:+${SITE.phoneRaw}`} testId="info-card-phone" />
                        <InfoCard icon={Phone} label="Landline" value={SITE.landlineDisplay} href={`tel:${SITE.landlineRaw}`} testId="info-card-landline" />
                        <InfoCard icon={Mail} label="Email" value={SITE.email} href={`mailto:${SITE.email}`} testId="info-card-email" />
                        <InfoCard icon={MapPin} label="Showroom" value={SITE.location} testId="info-card-address" />
                        <InfoCard icon={Clock} label="Business Hours" value={SITE.businessHours} testId="info-card-hours" />
                        <a
                            href={buildWhatsAppLink(SITE.whatsappPrefill)}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid="contact-info-whatsapp-button"
                            className="mt-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#10B981] text-white px-5 py-4 text-sm font-semibold shadow-[0_18px_40px_-10px_rgba(16,185,129,0.6)] hover:brightness-110 transition"
                        >
                            <MessageCircle className="h-5 w-5" /> Quick chat on WhatsApp
                        </a>
                    </aside>
                </div>
            </div>
        </section>
    );
};

const Field = ({ label, htmlFor, error, children }) => (
    <div>
        <Label htmlFor={htmlFor} className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--pth-muted)]">{label}</Label>
        <div className="mt-1.5">{children}</div>
        {error && <p className="mt-1.5 text-[12px] text-red-500 font-medium" role="alert">{error}</p>}
    </div>
);

const InfoCard = ({ icon: Icon, label, value, href, testId }) => {
    const inner = (
        <div className="flex items-center gap-4 rounded-2xl glass-card p-4 hover:-translate-y-0.5 transition">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0066FF]/10 text-[#0066FF]">
                <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--pth-muted)]">{label}</div>
                <div className="text-sm font-semibold text-[var(--pth-fg)] truncate">{value}</div>
            </div>
        </div>
    );
    return href ? (
        <a href={href} data-testid={testId} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pth-ring)] rounded-2xl">
            {inner}
        </a>
    ) : (
        <div data-testid={testId}>{inner}</div>
    );
};
