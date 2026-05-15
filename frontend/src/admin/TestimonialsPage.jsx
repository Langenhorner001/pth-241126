import { useEffect, useState } from "react";
import { Plus, Trash2, Edit, Check, X, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adminTestimonials } from "./api";

const BLANK = { customer_name: "", location: "", rating: 5, review_text: "", customer_type: "Home Owner", approved: true, featured: false, sort_order: 0 };
const TYPES = ["Home Owner", "Shop Owner", "Office", "Factory Owner", "Industrial Client", "Clinic Owner", "Other"];

export default function TestimonialsPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [filter, setFilter] = useState("");

    const load = async () => {
        setLoading(true);
        try {
            const params = { page: 1, page_size: 100 };
            if (filter === "approved") params.approved = true;
            if (filter === "pending") params.approved = false;
            const r = await adminTestimonials.list(params);
            setItems(r.data.items);
        } catch { toast.error("Failed to load"); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

    const save = async () => {
        if (!editing) return;
        try {
            if (editing.id) await adminTestimonials.update(editing.id, editing);
            else await adminTestimonials.create(editing);
            toast.success("Saved");
            setEditing(null);
            load();
        } catch (err) { toast.error("Save failed"); }
    };
    const remove = async (id) => { if (!window.confirm("Delete?")) return; try { await adminTestimonials.remove(id); toast.success("Deleted"); load(); } catch { toast.error("Failed"); } };
    const toggleApproved = async (t) => { try { await adminTestimonials.update(t.id, { ...t, approved: !t.approved }); load(); } catch { toast.error("Failed"); } };

    return (
        <div className="space-y-4" data-testid="admin-testimonials-page">
            <div className="rounded-2xl glass-card p-4 flex flex-wrap items-center gap-3">
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-10 rounded-xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 text-sm">
                    <option value="">All testimonials</option>
                    <option value="approved">Approved only</option>
                    <option value="pending">Pending approval</option>
                </select>
                <button onClick={() => setEditing({ ...BLANK })} data-testid="testimonial-add-button" className="inline-flex items-center gap-2 h-10 rounded-xl bg-[#0066FF] text-white px-4 text-sm font-semibold ml-auto"><Plus className="h-4 w-4" /> Add Testimonial</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading && Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-44 rounded-2xl bg-[var(--pth-muted)]/10 animate-pulse" />)}
                {!loading && items.length === 0 && <div className="col-span-full text-center text-[var(--pth-muted)] py-10">No testimonials.</div>}
                {!loading && items.map((t) => (
                    <div key={t.id} className="rounded-2xl glass-card p-5" data-testid={`testimonial-${t.id}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < t.rating ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[var(--pth-muted)]/40"}`} />)}
                            </div>
                            <span className={`inline-flex rounded-full text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 ${t.approved ? "bg-[#10B981]/15 text-[#10B981]" : "bg-[#D4AF37]/20 text-[#a68224] dark:text-[#D4AF37]"}`}>{t.approved ? "Approved" : "Pending"}</span>
                        </div>
                        <p className="mt-3 text-sm text-[var(--pth-fg)]/85 leading-relaxed line-clamp-4">“{t.review_text}”</p>
                        <div className="mt-4 flex items-center justify-between">
                            <div>
                                <div className="text-sm font-semibold">{t.customer_name}</div>
                                <div className="text-[11px] text-[var(--pth-muted)]">{t.location} • {t.customer_type}</div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => toggleApproved(t)} className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.06]" aria-label="Toggle approved">{t.approved ? <X className="h-4 w-4 text-red-500" /> : <Check className="h-4 w-4 text-[#10B981]" />}</button>
                                <button onClick={() => setEditing(t)} data-testid={`testimonial-edit-${t.id}`} className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.06]" aria-label="Edit"><Edit className="h-4 w-4" /></button>
                                <button onClick={() => remove(t.id)} className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-red-500/10 text-red-500" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setEditing(null)}>
                    <div className="w-full max-w-lg rounded-3xl bg-[var(--pth-bg)] p-6" onClick={(e) => e.stopPropagation()} data-testid="testimonial-edit-modal">
                        <div className="flex items-center justify-between">
                            <h3 className="font-display font-bold text-lg">{editing.id ? "Edit Testimonial" : "Add Testimonial"}</h3>
                            <button onClick={() => setEditing(null)} className="h-9 w-9 rounded-full glass-card inline-flex items-center justify-center"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="mt-4 space-y-3">
                            <Row label="Customer name"><input value={editing.customer_name} onChange={(e) => setEditing({ ...editing, customer_name: e.target.value })} className="input" data-testid="testimonial-name-input" /></Row>
                            <Row label="Location"><input value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} className="input" placeholder="e.g. Mirpur City" /></Row>
                            <Row label="Customer type">
                                <select value={editing.customer_type || ""} onChange={(e) => setEditing({ ...editing, customer_type: e.target.value })} className="input">
                                    {TYPES.map((t) => <option key={t}>{t}</option>)}
                                </select>
                            </Row>
                            <Row label="Rating">
                                <div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} onClick={() => setEditing({ ...editing, rating: n })}><Star className={`h-6 w-6 ${n <= editing.rating ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[var(--pth-muted)]/40"}`} /></button>)}</div>
                            </Row>
                            <Row label="Review text"><textarea value={editing.review_text} onChange={(e) => setEditing({ ...editing, review_text: e.target.value })} rows={4} className="input" data-testid="testimonial-review-input" /></Row>
                            <Row label="Approved"><input type="checkbox" checked={editing.approved} onChange={(e) => setEditing({ ...editing, approved: e.target.checked })} /></Row>
                        </div>
                        <div className="mt-5 flex justify-end gap-2">
                            <button onClick={() => setEditing(null)} className="h-10 px-4 rounded-xl border border-black/10 dark:border-white/10 text-sm">Cancel</button>
                            <button onClick={save} data-testid="testimonial-save-button" className="h-10 px-4 rounded-xl bg-[#0066FF] text-white text-sm font-semibold">Save</button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`.input{width:100%;height:40px;border-radius:12px;background:rgba(255,255,255,0.7);border:1px solid rgba(0,0,0,0.1);padding:0 12px;font-size:14px;} .dark .input{background:rgba(255,255,255,0.05);border-color:rgba(255,255,255,0.1);color:#fff} textarea.input{height:auto;padding:8px 12px}`}</style>
        </div>
    );
}

const Row = ({ label, children }) => (
    <div>
        <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--pth-muted)]">{label}</label>
        <div className="mt-1">{children}</div>
    </div>
);
