import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Zap } from "lucide-react";
import { SITE, buildWhatsAppLink } from "../content/content";
import { Navbar } from "../components/common/Navbar";
import { FloatingWhatsApp } from "../components/common/FloatingWhatsApp";

export default function NotFoundPage() {
    return (
        <div data-testid="not-found-page" className="min-h-screen relative overflow-hidden">
            <Navbar />
            <div className="absolute inset-0 hero-mesh-bg" aria-hidden />
            <div className="circuit-overlay" aria-hidden />
            <main className="relative flex min-h-screen items-center justify-center px-4 py-24">
                <div className="max-w-2xl text-center">
                    <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#1E3A8A] text-white glow-blue">
                        <Zap className="h-7 w-7" />
                    </div>
                    <h1 className="mt-6 font-display font-extrabold text-6xl sm:text-7xl tracking-tight text-gradient-brand">404</h1>
                    <p className="mt-3 text-xl sm:text-2xl font-semibold">Power line not found.</p>
                    <p className="mt-2 text-[15px] sm:text-base text-[var(--pth-muted)]">The page you're looking for doesn't exist or has been moved. Let's get you back to the action.</p>
                    <div className="mt-7 flex flex-wrap justify-center gap-3">
                        <Link to="/" className="inline-flex items-center gap-2 rounded-full gold-gradient px-5 py-3 text-sm font-semibold">
                            <ArrowLeft className="h-4 w-4" /> Back to home
                        </Link>
                        <a
                            href={buildWhatsAppLink(SITE.whatsappPrefill)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border-2 border-[#10B981] text-[#10B981] dark:bg-[#10B981] dark:text-white px-5 py-3 text-sm font-semibold"
                        >
                            <MessageCircle className="h-4 w-4" /> Talk to us
                        </a>
                    </div>
                </div>
            </main>
            <FloatingWhatsApp />
        </div>
    );
}
