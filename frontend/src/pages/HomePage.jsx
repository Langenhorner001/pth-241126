import { Suspense, lazy, useEffect, useState } from "react";
import { Navbar } from "../components/common/Navbar";
import { FloatingWhatsApp } from "../components/common/FloatingWhatsApp";
import { ScrollToTopButton } from "../components/common/ScrollToTop";
import { Seo } from "../components/Seo";
import { PageLoader } from "../components/common/Loader";
import { Hero } from "../components/sections/Hero";
import { TrustStrip } from "../components/sections/TrustStrip";
import { About } from "../components/sections/About";
import { Products } from "../components/sections/Products";
import { WhyUs } from "../components/sections/WhyUs";
import { ServiceArea } from "../components/sections/ServiceArea";

// Lazy-load below-the-fold heavy sections
const Testimonials = lazy(() => import("../components/sections/Testimonials").then(m => ({ default: m.Testimonials })));
const Faq = lazy(() => import("../components/sections/Faq").then(m => ({ default: m.Faq })));
const CtaBanner = lazy(() => import("../components/sections/CtaBanner").then(m => ({ default: m.CtaBanner })));
const Contact = lazy(() => import("../components/sections/Contact").then(m => ({ default: m.Contact })));
const MapEmbed = lazy(() => import("../components/sections/MapEmbed").then(m => ({ default: m.MapEmbed })));
const Footer = lazy(() => import("../components/sections/Footer").then(m => ({ default: m.Footer })));

export default function HomePage() {
    const [ready, setReady] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setReady(true), 600);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="min-h-screen">
            <Seo />
            {!ready && <PageLoader />}
            <Navbar />
            <main>
                <Hero />
                <TrustStrip />
                <About />
                <Products />
                <WhyUs />
                <ServiceArea />
                <Suspense fallback={<SectionSkeleton />}>
                    <Testimonials />
                    <Faq />
                    <CtaBanner />
                    <Contact />
                    <MapEmbed />
                    <Footer />
                </Suspense>
            </main>
            <FloatingWhatsApp />
            <ScrollToTopButton />
        </div>
    );
}

const SectionSkeleton = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="h-8 w-1/3 rounded-md bg-[var(--pth-muted)]/10 animate-pulse" />
        <div className="mt-4 h-4 w-2/3 rounded bg-[var(--pth-muted)]/10 animate-pulse" />
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-44 rounded-3xl bg-[var(--pth-muted)]/10 animate-pulse" />
            ))}
        </div>
    </div>
);
