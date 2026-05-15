import { Facebook, Instagram, MessageCircle, Youtube, MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react";
import { FOOTER, SITE, buildWhatsAppLink } from "../../content/content";
import { Logo } from "../common/Logo";

const iconMap = { Facebook, Instagram, MessageCircle, Youtube };

export const Footer = () => {
    return (
        <footer data-testid="site-footer" className="relative bg-[#070b14] text-white pt-14 mt-6">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#0066FF]/80 to-transparent" />
            {/* WhatsApp strip */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 mb-10">
                <a
                    href={buildWhatsAppLink(SITE.whatsappPrefill)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="footer-whatsapp-strip"
                    className="flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#0b6e44] via-[#10B981] to-[#0b6e44] px-5 py-4 text-white shadow-[0_18px_40px_-10px_rgba(16,185,129,0.6)]"
                >
                    <div className="flex items-center gap-3">
                        <MessageCircle className="h-6 w-6" />
                        <div>
                            <div className="font-semibold text-sm sm:text-base">Need help? Chat with us on WhatsApp</div>
                            <div className="text-xs text-white/85">Quick replies during business hours</div>
                        </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold">
                        Open chat <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                </a>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                <div>
                    <Logo />
                    <p className="mt-4 text-sm text-white/75 leading-relaxed">{FOOTER.columns.brand.blurb}</p>
                    <div className="mt-4 flex gap-2">
                        {FOOTER.socials.map((s) => {
                            const Icon = iconMap[s.icon] || MessageCircle;
                            return (
                                <a
                                    key={s.name}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.name}
                                    data-testid={`footer-social-${s.name.toLowerCase()}`}
                                    className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition"
                                >
                                    <Icon className="h-4.5 w-4.5" />
                                </a>
                            );
                        })}
                    </div>
                </div>
                <div>
                    <h4 className="font-display font-bold text-sm uppercase tracking-[0.15em] text-white">{FOOTER.columns.links.title}</h4>
                    <ul className="mt-4 space-y-2">
                        {FOOTER.columns.links.items.map((l) => (
                            <li key={l.label}>
                                <a href={l.href} className="text-sm text-white/75 hover:text-[#D4AF37] transition-colors">
                                    {l.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="font-display font-bold text-sm uppercase tracking-[0.15em] text-white">{FOOTER.columns.catalog.title}</h4>
                    <ul className="mt-4 space-y-2">
                        {FOOTER.columns.catalog.items.map((i) => (
                            <li key={i}>
                                <a href="#products" className="text-sm text-white/75 hover:text-[#D4AF37] transition-colors">{i}</a>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="font-display font-bold text-sm uppercase tracking-[0.15em] text-white">Contact</h4>
                    <ul className="mt-4 space-y-2.5 text-sm text-white/75">
                        <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-[#D4AF37]" /> {SITE.location}</li>
                        <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 text-[#D4AF37]" /> <a href={`tel:+${SITE.phoneRaw}`} className="hover:text-white">{SITE.phoneDisplay}</a></li>
                        <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 text-[#D4AF37]" /> <a href={`tel:${SITE.landlineRaw}`} className="hover:text-white">{SITE.landlineDisplay}</a></li>
                        <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 text-[#D4AF37]" /> <a href={`mailto:${SITE.email}`} className="hover:text-white break-all">{SITE.email}</a></li>
                        <li className="flex items-start gap-2"><Clock className="mt-0.5 h-4 w-4 text-[#D4AF37]" /> {SITE.businessHours}</li>
                    </ul>
                </div>
            </div>

            <div className="mt-12 border-t border-white/10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/55">
                    <p>{FOOTER.copyright}</p>
                    <p>{FOOTER.designedBy}</p>
                </div>
            </div>
        </footer>
    );
};
