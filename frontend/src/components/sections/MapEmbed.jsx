import { Navigation, MapPin, ExternalLink } from "lucide-react";
import { SITE } from "../../content/content";

export const MapEmbed = () => {
    const src = `https://www.google.com/maps?q=${encodeURIComponent(SITE.mapEmbedQuery)}&output=embed`;
    return (
        <section id="map" data-testid="map-embed" className="relative pb-16 sm:pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative rounded-3xl glass-card overflow-hidden">
                    <div className="aspect-[16/9] sm:aspect-[21/9] w-full">
                        <iframe
                            title="Punjab Transformer House location on Google Maps"
                            src={src}
                            className="h-full w-full border-0"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                    <div className="absolute top-4 left-4 max-w-[80%] rounded-2xl glass-card px-4 py-3 shadow-[0_18px_60px_rgba(10,14,26,0.22)]">
                        <div className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#0066FF] text-white">
                                <MapPin className="h-4.5 w-4.5" />
                            </span>
                            <div>
                                <div className="font-display font-bold text-sm">Punjab Transformer House</div>
                                <div className="text-xs text-[var(--pth-muted)]">{SITE.location}</div>
                                <div className="text-xs text-[var(--pth-muted)]">{SITE.phoneDisplay}</div>
                            </div>
                        </div>
                    </div>
                    <a
                        href={SITE.mapShareLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="map-directions-button"
                        className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-[#0066FF] text-white px-4 py-2.5 text-sm font-semibold shadow-[0_18px_40px_-10px_rgba(0,102,255,0.6)] hover:brightness-110 transition"
                    >
                        <Navigation className="h-4 w-4" /> Get Directions <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                </div>
            </div>
        </section>
    );
};
