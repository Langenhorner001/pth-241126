import { CheckCircle2 } from "lucide-react";
import { TRUST_STRIP } from "../../content/content";

export const TrustStrip = () => {
    const items = [...TRUST_STRIP, ...TRUST_STRIP];
    return (
        <section id="trust" data-testid="trust-strip" className="relative -mt-6 sm:-mt-8 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-2xl glass-card py-3.5 sm:py-4">
                    <div className="flex marquee-track gap-8 whitespace-nowrap will-change-transform">
                        {items.map((t, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 px-3 text-sm sm:text-[15px] font-medium text-[var(--pth-fg)]"
                            >
                                <CheckCircle2 className="h-4.5 w-4.5 text-[#10B981]" />
                                {t}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
