import { Helmet } from "react-helmet-async";
import { SEO, SITE } from "../content/content";

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": ["LocalBusiness", "ElectricalContractor"],
            "@id": "https://punjabtransformerhouse.com#org",
            name: "Punjab Transformer House",
            description: SEO.description,
            url: "https://punjabtransformerhouse.com",
            telephone: `+${SITE.phoneRaw}`,
            email: SITE.email,
            image: "https://punjabtransformerhouse.com/og.jpg",
            address: {
                "@type": "PostalAddress",
                streetAddress: "Sec. E/2, Near Relax Cinema",
                addressLocality: "Mirpur",
                addressRegion: "Azad Kashmir",
                addressCountry: "PK"
            },
            geo: { "@type": "GeoCoordinates", latitude: 33.1478, longitude: 73.7516 },
            openingHours: "Mo-Sa 09:00-20:00",
            sameAs: ["https://wa.me/923452324460", "https://share.google/ywgGWcgOmUhtEOYTy"],
            areaServed: [
                "Mirpur",
                "Dadyal",
                "Islamgarh",
                "Chakswari",
                "Kotli",
                "Bhimber"
            ]
        },
        {
            "@type": "FAQPage",
            mainEntity: [
                {
                    "@type": "Question",
                    name: "Do you provide warranty on your products?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes, all our products come with manufacturer warranty. Duration varies by product type."
                    }
                },
                {
                    "@type": "Question",
                    name: "What areas do you serve?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "We serve Mirpur city and surrounding areas including Dadyal, Islamgarh, Chakswari, Kotli, and Bhimber."
                    }
                }
            ]
        }
    ]
};

export const Seo = () => (
    <Helmet>
        <title>{SEO.title}</title>
        <meta name="description" content={SEO.description} />
        <meta name="keywords" content={SEO.keywords.join(", ")} />
        <meta property="og:title" content={SEO.ogTitle} />
        <meta property="og:description" content={SEO.ogDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SEO.ogTitle} />
        <meta name="twitter:description" content={SEO.ogDescription} />
        <link rel="canonical" href="https://punjabtransformerhouse.com" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
);
