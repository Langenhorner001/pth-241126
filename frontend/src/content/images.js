// Centralized image config. Easily replaceable with real product photos.
// All images use Unsplash with format/quality params (auto-compressed WebP).
// To swap with real product/showroom photos, just replace the URL strings below.

export const IMAGES = {
    hero: {
        product: "https://images.unsplash.com/photo-1620283085439-39620a1e21c4?auto=format&fit=crop&w=1400&q=80",
        bg: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1920&q=80"
    },
    about: {
        // Electrical circuit board macro - reads as "electrical infrastructure"
        showroom: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80"
    },
    products: {
        voltage_regulators: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
        voltage_stabilizers: "https://images.unsplash.com/photo-1620283085439-39620a1e21c4?auto=format&fit=crop&w=1200&q=80&sat=-25",
        ups_systems: "https://images.unsplash.com/photo-1620283085439-39620a1e21c4?auto=format&fit=crop&w=1200&q=80",
        solar_instruments: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
        fallback: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
    }
};

// Map a product category name to an image (used as a robust fallback when API
// products lack image_url or the provided URL fails to load).
export const categoryImage = (category) => {
    if (!category) return IMAGES.products.fallback;
    const c = category.toLowerCase();
    if (c.includes("regulator")) return IMAGES.products.voltage_regulators;
    if (c.includes("stabilizer")) return IMAGES.products.voltage_stabilizers;
    if (c.includes("ups")) return IMAGES.products.ups_systems;
    if (c.includes("solar")) return IMAGES.products.solar_instruments;
    return IMAGES.products.fallback;
};
