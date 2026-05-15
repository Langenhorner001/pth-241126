// All copy lives here. i18n-ready: add an Urdu sibling in a future phase.

export const SITE = {
    name: "Punjab Transformer House",
    short: "PTH",
    fullLegalName: "Punjab Transformer & Voltage Stabilizer House",
    tagline: "Reliable Power Solutions for Homes & Businesses",
    secondaryTagline: "Powering Mirpur AJK with Premium Electrical Equipment",
    location: "Sec. E/2, Near Relax Cinema, Mirpur, Azad Kashmir, Pakistan",
    locationShort: "Mirpur, Azad Kashmir, Pakistan",
    email: "pnjbtr@gmail.com",
    phoneDisplay: "+92 345 2324460",
    phoneRaw: "923452324460",
    landlineDisplay: "05827-434266",
    landlineRaw: "+925827434266",
    whatsappLink: "https://wa.me/923452324460",
    whatsappPrefill: "Hello Punjab Transformer House, I'm interested in your products.",
    mapShareLink: "https://share.google/ywgGWcgOmUhtEOYTy",
    mapEmbedQuery: "Punjab Transformer & Voltage Stabilizer House, Sec E/2 Near Relax Cinema, Mirpur Azad Kashmir",
    businessHours: "Mon – Sat: 9:00 AM – 8:00 PM",
    yearsExperience: "10+",
    customersServed: "1000+",
    productVariants: "50+",
    genuineRate: "100%"
};

export const buildWhatsAppLink = (message) => {
    const text = encodeURIComponent(message || SITE.whatsappPrefill);
    return `${SITE.whatsappLink}?text=${text}`;
};

export const NAV_LINKS = [
    { id: "home", label: "Home", href: "#home" },
    { id: "about", label: "About", href: "#about" },
    { id: "products", label: "Products", href: "#products" },
    { id: "why-us", label: "Why Us", href: "#why-us" },
    { id: "testimonials", label: "Testimonials", href: "#testimonials" },
    { id: "contact", label: "Contact", href: "#contact" }
];

export const HERO = {
    badge: "Mirpur AJK's Most Trusted Power Solutions Provider",
    headline: ["Premium", "Voltage", "Stabilizers", "&", "Power", "Solutions", "in", "Mirpur", "AJK"],
    subheadline:
        "Your trusted supplier of UPS Systems, Voltage Regulators, Solar Equipment & Power Backup Solutions — serving homes, shops, offices & factories across Azad Kashmir.",
    trustBadges: [
        "10+ Years Experience",
        "1000+ Happy Customers",
        "Genuine Products",
        "Local Showroom"
    ],
    primaryCta: { label: "View Our Products", target: "#products" },
    secondaryCta: { label: "Chat on WhatsApp" }
};

export const TRUST_STRIP = [
    "Genuine Branded Products",
    "Warranty on All Items",
    "Expert Consultation",
    "Same-Day Availability",
    "Best Prices in Mirpur",
    "After-Sales Support"
];

export const ABOUT = {
    eyebrow: "About Us",
    heading: "About Punjab Transformer House",
    subheading: "Mirpur AJK's Most Trusted Power Solutions Provider",
    body:
        "Punjab Transformer House is a leading electrical equipment supplier in Mirpur Azad Kashmir, specializing in premium voltage stabilizers, UPS systems, solar instruments, voltage regulators, and complete power protection solutions. With over a decade of experience, we have built a reputation for delivering genuine, high-quality products backed by expert technical guidance.",
    body2:
        "Whether you're a homeowner protecting your appliances, a shop owner ensuring uninterrupted business, or a factory requiring industrial-grade power solutions — we are your trusted local partner.",
    stats: [
        { number: "10+", label: "Years of Experience" },
        { number: "1000+", label: "Satisfied Customers" },
        { number: "50+", label: "Product Variants" },
        { number: "100%", label: "Genuine Products" }
    ]
};

export const PRODUCTS_SECTION = {
    eyebrow: "Our Catalog",
    heading: "Our Premium Product Range",
    subheading: "Reliable power solutions for every need — from homes to heavy industries.",
    fallbackMessage:
        "Our product catalog is updating. Please contact us on WhatsApp for the latest stock and pricing."
};

export const WHY_US = {
    eyebrow: "Why Choose Us",
    heading: "Why Choose Punjab Transformer House?",
    subheading: "What makes us Mirpur's most trusted electrical brand.",
    items: [
        {
            icon: "ShieldCheck",
            title: "Trusted Local Supplier",
            description: "Serving Mirpur AJK community with reliability and integrity for over a decade."
        },
        {
            icon: "Gem",
            title: "High Quality Products",
            description: "Only genuine, branded electrical equipment from verified manufacturers."
        },
        {
            icon: "BadgePercent",
            title: "Competitive Pricing",
            description: "Best market rates with transparent pricing and bulk-order discounts."
        },
        {
            icon: "GraduationCap",
            title: "Professional Guidance",
            description: "Expert technical consultation to help you choose the right solution."
        },
        {
            icon: "Headphones",
            title: "Reliable Customer Support",
            description: "Responsive after-sales support and warranty assistance."
        },
        {
            icon: "Zap",
            title: "Fast Product Availability",
            description: "Same-day availability for most products at our Mirpur showroom."
        }
    ]
};

export const SERVICE_AREA = {
    eyebrow: "Service Areas",
    heading: "Proudly Serving Mirpur Azad Kashmir",
    subheading: "Local presence, premium service.",
    description:
        "Punjab Transformer House provides reliable electrical and power solutions across Mirpur city and surrounding areas. Visit our showroom or contact us via WhatsApp for personalized consultation.",
    areas: [
        { name: "Mirpur City", primary: true },
        { name: "Dadyal" },
        { name: "Islamgarh" },
        { name: "Chakswari" },
        { name: "Kotli" },
        { name: "Bhimber" }
    ]
};

export const TESTIMONIALS_SECTION = {
    eyebrow: "Testimonials",
    heading: "What Our Customers Say",
    subheading: "Real reviews from satisfied clients across Mirpur AJK."
};

export const FAQ = {
    eyebrow: "FAQ",
    heading: "Frequently Asked Questions",
    subheading: "Quick answers to the questions we hear most often.",
    items: [
        {
            q: "Do you provide warranty on your products?",
            a: "Yes, all our products come with manufacturer warranty. Duration varies by product type — please ask us for specifics."
        },
        {
            q: "Can I get bulk discounts for my business?",
            a: "Absolutely. We offer special pricing for bulk orders. Contact us via WhatsApp for a custom quote."
        },
        {
            q: "Do you offer installation services?",
            a: "We provide technical guidance and can recommend trusted installation professionals in Mirpur."
        },
        {
            q: "What areas do you serve?",
            a: "We serve Mirpur city and surrounding areas including Dadyal, Islamgarh, Chakswari, Kotli, and Bhimber."
        },
        {
            q: "How can I place an order?",
            a: "You can visit our showroom in Mirpur or contact us on WhatsApp at +92 345 2324460 for orders and inquiries."
        }
    ]
};

export const CTA_BANNER = {
    headline: "Need Reliable Power Solutions?",
    sub:
        "Contact Punjab Transformer House today for voltage stabilizers, UPS systems, solar equipment, and expert advice tailored to your needs.",
    button: "Chat on WhatsApp Now"
};

export const CONTACT = {
    eyebrow: "Get in Touch",
    heading: "Get In Touch",
    subheading: "Reach out for quotes, consultations, or product inquiries.",
    productOptions: [
        "Voltage Stabilizer",
        "UPS System",
        "Voltage Regulator",
        "Solar Equipment",
        "Inverters & Charge Controllers",
        "Other / Bulk Inquiry"
    ]
};

export const FOOTER = {
    columns: {
        brand: {
            title: "Punjab Transformer House",
            blurb:
                "Mirpur AJK's trusted premium power solutions provider since over a decade."
        },
        links: {
            title: "Quick Links",
            items: [
                { label: "Home", href: "#home" },
                { label: "About", href: "#about" },
                { label: "Products", href: "#products" },
                { label: "Why Choose Us", href: "#why-us" },
                { label: "Testimonials", href: "#testimonials" },
                { label: "Contact", href: "#contact" }
            ]
        },
        catalog: {
            title: "Our Products",
            items: [
                "Voltage Stabilizers",
                "UPS Systems",
                "Voltage Regulators",
                "Solar Instruments"
            ]
        }
    },
    socials: [
        { name: "Facebook", href: "#", icon: "Facebook" },
        { name: "Instagram", href: "#", icon: "Instagram" },
        { name: "WhatsApp", href: "https://wa.me/923452324460", icon: "MessageCircle" },
        { name: "YouTube", href: "#", icon: "Youtube" }
    ],
    copyright: `\u00a9 ${new Date().getFullYear()} Punjab Transformer House — All Rights Reserved. Mirpur AJK, Pakistan.`,
    designedBy: "Crafted with precision for premium power solutions."
};

export const SEO = {
    title:
        "Punjab Transformer House Mirpur AJK | Voltage Stabilizers, UPS & Solar Solutions",
    description:
        "Punjab Transformer House — Mirpur Azad Kashmir's trusted supplier of voltage stabilizers, UPS systems, voltage regulators, solar instruments & power backup solutions. Visit our showroom or WhatsApp us today.",
    ogTitle: "Premium Power Solutions in Mirpur AJK — Punjab Transformer House",
    ogDescription:
        "Trusted electrical equipment supplier offering voltage stabilizers, UPS, solar instruments & more across Mirpur Azad Kashmir.",
    keywords: [
        "Voltage stabilizer Mirpur",
        "UPS supplier Mirpur AJK",
        "Solar instruments Mirpur",
        "Voltage regulator Pakistan",
        "Punjab Transformer House",
        "Power solutions Mirpur",
        "Transformer house Mirpur",
        "Servo stabilizer Azad Kashmir",
        "Online UPS Mirpur",
        "Solar inverter Mirpur AJK",
        "Electrical shop Mirpur",
        "Best stabilizer brand Pakistan"
    ]
};
