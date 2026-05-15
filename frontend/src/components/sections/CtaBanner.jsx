import { MessageCircle, Phone } from "lucide-react";
import { CTA_BANNER, SITE, buildWhatsAppLink } from "../../content/content";

export const CtaBanner = () => {
    return (
        <section data-testid="cta-banner" className="relative py-14 sm:py-18">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-[28px] cta-banner-gradient p-8 sm:p-10 lg:p-14 text-white shadow-[0_30px_70px_-20px_rgba(0,102,255,0.6)]">
                    <div
                        className="absolute inset-0 opacity-25 pointer-events-none"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.10) 1px, transparent 1px)",
                            backgroundSize: "40px 40px"
                        }}
                        aria-hidden
                    />
                    <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        <div className="lg:col-span-7">
                            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
                                {CTA_BANNER.headline}
                            </h2>
                            <p className="mt-3 max-w-xl text-white/85 text-[15px] sm:text-base leading-relaxed">
                                {CTA_BANNER.sub}
                            </p>
                            <div className="mt-3 inline-flex items-center gap-3 text-white/85 text-sm">
                                <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4" /> {SITE.phoneDisplay}</span>
                                <span className="hidden sm:inline opacity-60">•</span>
                                <span className="hidden sm:inline">📍 Mirpur, AJK</span>
                            </div>
                        </div>
                        <div className="lg:col-span-5 flex lg:justify-end">
                            <a
                                href={buildWhatsAppLink(SITE.whatsappPrefill)}
                                target="_blank"
                                rel="noopener noreferrer"
                                data-testid="cta-banner-whatsapp-button"
                                className="inline-flex items-center gap-2 rounded-full bg-white text-[#0A0E1A] px-6 py-3.5 text-sm sm:text-base font-bold shadow-[0_18px_40px_-10px_rgba(255,255,255,0.6)] hover:-translate-y-0.5 transition glow-green"
                            >
                                <MessageCircle className="h-5 w-5 text-[#10B981]" /> {CTA_BANNER.button}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
