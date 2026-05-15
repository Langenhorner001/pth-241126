import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { ArrowLeft, Save, Trash2, Plus, X, Upload, Loader2, Bold, Italic, List, ListOrdered, LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { adminProducts, adminMedia, buildMediaUrl } from "./api";

const CATEGORIES = ["Voltage Regulators", "Voltage Stabilizers", "UPS Systems", "Solar Instruments", "Other"];
const BADGES = ["", "Most Popular", "Best Seller", "Premium", "Eco-Friendly", "New Arrival"];
const ICONS = ["Zap", "ShieldCheck", "GaugeCircle", "BatteryCharging", "Sun", "Cpu"];
const BLANK = {
    name: "", slug: "", category: "Voltage Stabilizers", short_description: "",
    description: "", full_description_html: "", features: [], specifications: {},
    image_url: "", images: [], badge: "", icon: "Zap",
    price: null, discount_price: null, show_price: false,
    in_stock: true, stock_quantity: null, bulk_pricing_available: true, featured: true,
    warranty_period: "", sort_order: 0,
    seo_meta_title: "", seo_meta_description: "", seo_keywords: [],
    whatsapp_inquiry_prefill: ""
};

export default function ProductEditPage() {
    const { id } = useParams();
    const isNew = !id;
    const nav = useNavigate();
    const [form, setForm] = useState(BLANK);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [featureInput, setFeatureInput] = useState("");
    const [keywordInput, setKeywordInput] = useState("");
    const [specKey, setSpecKey] = useState("");
    const [specVal, setSpecVal] = useState("");
    const fileRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const editor = useEditor({
        extensions: [StarterKit, LinkExt.configure({ openOnClick: false }), Placeholder.configure({ placeholder: "Full product description, applications, tech notes..." })],
        content: form.full_description_html || "",
        onUpdate: ({ editor }) => setForm((f) => ({ ...f, full_description_html: editor.getHTML() }))
    });

    useEffect(() => {
        if (isNew) return;
        (async () => {
            try {
                const r = await adminProducts.list({ page: 1, page_size: 200 });
                const found = r.data.items.find((p) => p.id === id);
                if (!found) { toast.error("Product not found"); nav("/admin/products"); return; }
                setForm({ ...BLANK, ...found });
                if (editor) editor.commands.setContent(found.full_description_html || "");
            } catch { toast.error("Failed to load product"); }
            finally { setLoading(false); }
        })();
        // eslint-disable-next-line
    }, [id, editor]);

    const update = (patch) => setForm((f) => ({ ...f, ...patch }));

    const addFeature = () => { if (featureInput.trim()) { update({ features: [...form.features, featureInput.trim()] }); setFeatureInput(""); } };
    const rmFeature = (i) => update({ features: form.features.filter((_, idx) => idx !== i) });
    const addKeyword = () => { if (keywordInput.trim()) { update({ seo_keywords: [...(form.seo_keywords || []), keywordInput.trim()] }); setKeywordInput(""); } };
    const rmKeyword = (i) => update({ seo_keywords: form.seo_keywords.filter((_, idx) => idx !== i) });
    const addSpec = () => { if (specKey.trim() && specVal.trim()) { update({ specifications: { ...form.specifications, [specKey.trim()]: specVal.trim() } }); setSpecKey(""); setSpecVal(""); } };
    const rmSpec = (k) => { const s = { ...form.specifications }; delete s[k]; update({ specifications: s }); };

    const onUpload = async (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setUploading(true);
        try {
            const r = await adminMedia.upload(f, "products", form.name || f.name);
            const newImg = { id: r.data.id, url: r.data.url, alt: form.name };
            update({
                images: [...form.images, newImg],
                image_url: form.image_url || buildMediaUrl(r.data.url)
            });
            toast.success("Uploaded");
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Upload failed");
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    const rmImage = (idx) => {
        const ni = form.images.filter((_, i) => i !== idx);
        update({ images: ni, image_url: ni[0] ? buildMediaUrl(ni[0].url) : "" });
    };

    const onSave = async (e) => {
        e?.preventDefault();
        if (!form.name || form.name.length < 2) return toast.error("Name is required");
        if (!form.description || form.description.length < 10) return toast.error("Description must be at least 10 chars");
        setSaving(true);
        try {
            const payload = { ...form };
            if (payload.price === "" || payload.price === null) payload.price = null;
            if (payload.discount_price === "" || payload.discount_price === null) payload.discount_price = null;
            // Ensure image_url full URL for first image
            if (!payload.image_url && payload.images[0]?.url) payload.image_url = buildMediaUrl(payload.images[0].url);
            const r = isNew ? await adminProducts.create(payload) : await adminProducts.update(id, payload);
            toast.success(isNew ? "Product created" : "Saved");
            nav("/admin/products");
        } catch (err) {
            const d = err?.response?.data?.detail;
            toast.error(typeof d === "string" ? d : Array.isArray(d) ? d[0]?.msg : "Save failed");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-[var(--pth-muted)]">Loading...</div>;

    return (
        <form onSubmit={onSave} className="space-y-5" data-testid="product-edit-page">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <Link to="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-[var(--pth-muted)] hover:text-[var(--pth-fg)]"><ArrowLeft className="h-4 w-4" /> Back to products</Link>
                <button type="submit" disabled={saving} data-testid="product-save-button" className="inline-flex items-center gap-2 h-10 rounded-xl bg-[#0066FF] text-white px-5 text-sm font-semibold disabled:opacity-70">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {isNew ? "Create product" : "Save changes"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                    {/* Basic info */}
                    <Section title="Basic Information">
                        <Field label="Product name *">
                            <Input value={form.name} onChange={(v) => update({ name: v })} testId="product-name-input" placeholder="e.g. Servo Voltage Stabilizer 5KVA" />
                        </Field>
                        <Field label="Slug (URL)">
                            <Input value={form.slug} onChange={(v) => update({ slug: v })} placeholder="auto-generated from name" />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Category *">
                                <Select value={form.category} onChange={(v) => update({ category: v })} options={CATEGORIES} testId="product-category-select" />
                            </Field>
                            <Field label="Badge">
                                <Select value={form.badge} onChange={(v) => update({ badge: v })} options={BADGES} />
                            </Field>
                        </div>
                        <Field label="Short description">
                            <Textarea rows={2} value={form.short_description} onChange={(v) => update({ short_description: v })} placeholder="One-liner shown in cards" />
                        </Field>
                        <Field label="Description *">
                            <Textarea rows={4} value={form.description} onChange={(v) => update({ description: v })} testId="product-description-input" placeholder="Plain text description shown on the product card." />
                        </Field>
                        <Field label="Full description (rich text)">
                            <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5">
                                <div className="flex items-center gap-1 border-b border-black/10 dark:border-white/10 px-2 py-1.5">
                                    <ToolBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")} icon={Bold} />
                                    <ToolBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")} icon={Italic} />
                                    <ToolBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")} icon={List} />
                                    <ToolBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")} icon={ListOrdered} />
                                    <ToolBtn onClick={() => {
                                        const u = window.prompt("URL");
                                        if (u) editor?.chain().focus().setLink({ href: u }).run();
                                    }} active={editor?.isActive("link")} icon={LinkIcon} />
                                </div>
                                <EditorContent editor={editor} className="prose max-w-none prose-sm dark:prose-invert px-3 py-2 min-h-[160px] focus:outline-none" />
                            </div>
                        </Field>
                    </Section>

                    {/* Images */}
                    <Section title="Product Images">
                        <input ref={fileRef} type="file" accept="image/*" onChange={onUpload} className="hidden" />
                        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 h-10 rounded-xl border-2 border-dashed border-[#0066FF]/40 text-[#0066FF] px-4 text-sm font-medium hover:bg-[#0066FF]/5 disabled:opacity-50">
                            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload image
                        </button>
                        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {form.images.map((im, i) => (
                                <div key={i} className="relative group rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
                                    <img src={buildMediaUrl(im.url)} alt="" className="w-full aspect-square object-cover" />
                                    <button type="button" onClick={() => rmImage(i)} className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-black/70 text-white inline-flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                                    {i === 0 && <span className="absolute bottom-1.5 left-1.5 rounded-full bg-[#0066FF] text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-[0.08em]">Primary</span>}
                                </div>
                            ))}
                            {form.images.length === 0 && <div className="col-span-full text-xs text-[var(--pth-muted)]">No images yet — upload at least one for best display.</div>}
                        </div>
                    </Section>

                    {/* Features + Specs */}
                    <Section title="Features & Specifications">
                        <Field label="Key features">
                            <div className="flex gap-2">
                                <Input value={featureInput} onChange={setFeatureInput} placeholder="e.g. Auto Cut-off Protection" onEnter={addFeature} />
                                <button type="button" onClick={addFeature} className="h-10 px-3 rounded-xl bg-[#0066FF] text-white text-sm"><Plus className="h-4 w-4" /></button>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {form.features.map((f, i) => (
                                    <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-[#0066FF]/10 text-[#0066FF] text-xs font-medium px-2.5 py-1">{f}<button type="button" onClick={() => rmFeature(i)}><X className="h-3 w-3" /></button></span>
                                ))}
                            </div>
                        </Field>
                        <Field label="Technical specifications">
                            <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                                <Input value={specKey} onChange={setSpecKey} placeholder="Key (e.g. Power)" />
                                <Input value={specVal} onChange={setSpecVal} placeholder="Value (e.g. 5KVA)" />
                                <button type="button" onClick={addSpec} className="h-10 px-3 rounded-xl bg-[#0066FF] text-white text-sm"><Plus className="h-4 w-4" /></button>
                            </div>
                            <div className="mt-2 space-y-1.5">
                                {Object.entries(form.specifications).map(([k, v]) => (
                                    <div key={k} className="flex items-center justify-between rounded-lg bg-black/[0.04] dark:bg-white/[0.04] px-3 py-1.5 text-sm">
                                        <span><b>{k}:</b> {v}</span>
                                        <button type="button" onClick={() => rmSpec(k)}><X className="h-3.5 w-3.5 text-[var(--pth-muted)]" /></button>
                                    </div>
                                ))}
                            </div>
                        </Field>
                    </Section>

                    {/* SEO */}
                    <Section title="SEO">
                        <Field label="Meta title" helper="60 characters recommended">
                            <Input value={form.seo_meta_title} onChange={(v) => update({ seo_meta_title: v })} maxLength={70} />
                        </Field>
                        <Field label="Meta description" helper="160 characters recommended">
                            <Textarea rows={2} value={form.seo_meta_description} onChange={(v) => update({ seo_meta_description: v })} maxLength={180} />
                        </Field>
                        <Field label="Keywords">
                            <div className="flex gap-2">
                                <Input value={keywordInput} onChange={setKeywordInput} placeholder="e.g. voltage stabilizer mirpur" onEnter={addKeyword} />
                                <button type="button" onClick={addKeyword} className="h-10 px-3 rounded-xl bg-[#0066FF] text-white text-sm"><Plus className="h-4 w-4" /></button>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {(form.seo_keywords || []).map((k, i) => (
                                    <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/20 text-[#a68224] dark:text-[#D4AF37] text-xs font-medium px-2.5 py-1">{k}<button type="button" onClick={() => rmKeyword(i)}><X className="h-3 w-3" /></button></span>
                                ))}
                            </div>
                        </Field>
                    </Section>
                </div>

                <div className="space-y-5">
                    <Section title="Visibility & Inventory">
                        <Toggle label="In stock" value={form.in_stock} onChange={(v) => update({ in_stock: v })} testId="toggle-in-stock" />
                        <Toggle label="Featured on homepage" value={form.featured} onChange={(v) => update({ featured: v })} />
                        <Toggle label="Bulk pricing available" value={form.bulk_pricing_available} onChange={(v) => update({ bulk_pricing_available: v })} />
                        <Field label="Sort order" helper="Lower numbers appear first">
                            <Input type="number" value={form.sort_order ?? 0} onChange={(v) => update({ sort_order: Number(v) || 0 })} />
                        </Field>
                        <Field label="Stock quantity (optional)">
                            <Input type="number" value={form.stock_quantity ?? ""} onChange={(v) => update({ stock_quantity: v === "" ? null : Number(v) })} />
                        </Field>
                    </Section>

                    <Section title="Pricing">
                        <Toggle label="Show price publicly" value={form.show_price} onChange={(v) => update({ show_price: v })} />
                        <Field label="Price (PKR)">
                            <Input type="number" value={form.price ?? ""} onChange={(v) => update({ price: v === "" ? null : Number(v) })} placeholder="e.g. 18500" />
                        </Field>
                        <Field label="Discount price (PKR)">
                            <Input type="number" value={form.discount_price ?? ""} onChange={(v) => update({ discount_price: v === "" ? null : Number(v) })} />
                        </Field>
                        <Field label="Warranty period">
                            <Input value={form.warranty_period} onChange={(v) => update({ warranty_period: v })} placeholder="e.g. 1 Year" />
                        </Field>
                    </Section>

                    <Section title="Appearance">
                        <Field label="Icon (lucide-react)">
                            <Select value={form.icon} onChange={(v) => update({ icon: v })} options={ICONS} />
                        </Field>
                        <Field label="Hero image URL (fallback)">
                            <Input value={form.image_url} onChange={(v) => update({ image_url: v })} placeholder="https://..." />
                        </Field>
                    </Section>

                    <Section title="WhatsApp Inquiry">
                        <Field label="Custom prefilled message">
                            <Textarea rows={3} value={form.whatsapp_inquiry_prefill} onChange={(v) => update({ whatsapp_inquiry_prefill: v })} placeholder="Hello, I'm interested in this product..." />
                        </Field>
                    </Section>
                </div>
            </div>
        </form>
    );
}

// ----- Reusable form atoms -----
const Section = ({ title, children }) => (
    <div className="rounded-2xl glass-card p-5 sm:p-6">
        <h3 className="font-display font-bold text-base mb-3">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);
const Field = ({ label, helper, children }) => (
    <div>
        <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--pth-muted)]">{label}</label>
        <div className="mt-1">{children}</div>
        {helper && <p className="mt-1 text-[11px] text-[var(--pth-muted)]">{helper}</p>}
    </div>
);
const Input = ({ value, onChange, placeholder, type = "text", maxLength, onEnter, testId }) => (
    <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        data-testid={testId}
        onKeyDown={(e) => { if (e.key === "Enter" && onEnter) { e.preventDefault(); onEnter(); } }}
        className="w-full h-10 rounded-xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pth-ring)]"
    />
);
const Textarea = ({ value, onChange, placeholder, rows = 3, maxLength, testId }) => (
    <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        data-testid={testId}
        className="w-full rounded-xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pth-ring)]"
    />
);
const Select = ({ value, onChange, options, testId }) => (
    <select value={value || ""} onChange={(e) => onChange(e.target.value)} data-testid={testId} className="w-full h-10 rounded-xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 text-sm">
        {options.map((o) => <option key={o} value={o}>{o || "— None —"}</option>)}
    </select>
);
const Toggle = ({ label, value, onChange, testId }) => (
    <label className="flex items-center justify-between gap-3 cursor-pointer">
        <span className="text-sm font-medium">{label}</span>
        <button type="button" role="switch" aria-checked={value} data-testid={testId} onClick={() => onChange(!value)} className={`relative h-6 w-11 rounded-full transition ${value ? "bg-[#0066FF]" : "bg-zinc-300 dark:bg-zinc-700"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${value ? "left-[22px]" : "left-0.5"}`} />
        </button>
    </label>
);
const ToolBtn = ({ icon: Icon, active, onClick }) => (
    <button type="button" onClick={onClick} className={`h-8 w-8 inline-flex items-center justify-center rounded-md ${active ? "bg-[#0066FF] text-white" : "hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-[var(--pth-muted)]"}`}>
        <Icon className="h-4 w-4" />
    </button>
);
