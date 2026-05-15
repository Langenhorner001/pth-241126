import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Trash2, Edit, Copy, Star, StarOff, Loader2, ExternalLink, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { adminProducts, buildMediaUrl } from "./api";

const CATEGORIES = ["", "Voltage Regulators", "Voltage Stabilizers", "UPS Systems", "Solar Instruments", "Other"];

export default function ProductsListPage() {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(new Set());
    const pageSize = 20;

    const load = async () => {
        setLoading(true);
        try {
            const params = { page, page_size: pageSize };
            if (search) params.search = search;
            if (category) params.category = category;
            const r = await adminProducts.list(params);
            setItems(r.data.items);
            setTotal(r.data.total);
            setSelected(new Set());
        } catch (e) {
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, category]);

    const toggle = (id) => {
        setSelected((s) => {
            const n = new Set(s);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    };
    const allSelected = items.length > 0 && selected.size === items.length;

    const onDelete = async (id) => {
        if (!window.confirm("Delete this product?")) return;
        try { await adminProducts.remove(id); toast.success("Deleted"); load(); } catch { toast.error("Delete failed"); }
    };

    const onDuplicate = async (id) => {
        try { await adminProducts.duplicate(id); toast.success("Duplicated"); load(); } catch { toast.error("Duplicate failed"); }
    };

    const onToggleFeatured = async (p) => {
        try { await adminProducts.update(p.id, { ...p, featured: !p.featured }); load(); } catch { toast.error("Update failed"); }
    };

    const onBulkDelete = async () => {
        if (selected.size === 0) return;
        if (!window.confirm(`Delete ${selected.size} products?`)) return;
        try {
            await adminProducts.bulkDelete(Array.from(selected));
            toast.success("Deleted");
            load();
        } catch { toast.error("Bulk delete failed"); }
    };
    const onBulkFeature = async (val) => {
        if (selected.size === 0) return;
        try {
            await adminProducts.bulkUpdate(Array.from(selected), { featured: val });
            toast.success("Updated");
            load();
        } catch { toast.error("Update failed"); }
    };

    return (
        <div className="space-y-4" data-testid="admin-products-page">
            {/* Toolbar */}
            <div className="rounded-2xl glass-card p-4 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--pth-muted)]" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (setPage(1), load())}
                        placeholder="Search products..."
                        data-testid="products-search"
                        className="w-full h-10 rounded-xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 pl-10 pr-3 text-sm"
                    />
                </div>
                <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="h-10 rounded-xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 text-sm">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c || "All categories"}</option>)}
                </select>
                <Link to="/admin/products/new" data-testid="products-add-button" className="inline-flex items-center gap-2 h-10 rounded-xl bg-[#0066FF] text-white px-4 text-sm font-semibold shadow-[0_10px_24px_-10px_rgba(0,102,255,0.6)]">
                    <Plus className="h-4 w-4" /> Add Product
                </Link>
            </div>

            {selected.size > 0 && (
                <div className="rounded-xl bg-[#0066FF]/10 border border-[#0066FF]/30 px-4 py-2.5 flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-medium">{selected.size} selected</span>
                    <button onClick={() => onBulkFeature(true)} className="text-[#0066FF] font-semibold">Mark featured</button>
                    <button onClick={() => onBulkFeature(false)} className="text-[#0066FF] font-semibold">Unfeature</button>
                    <button onClick={onBulkDelete} className="text-red-500 font-semibold">Delete</button>
                </div>
            )}

            {/* Table */}
            <div className="rounded-2xl glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-[11px] uppercase tracking-[0.15em] text-[var(--pth-muted)] border-b border-black/[0.05] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.02]">
                                <th className="py-3 px-3 w-8"><input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(items.map(i => i.id)))} /></th>
                                <th className="py-3 pr-3">Product</th>
                                <th className="py-3 pr-3">Category</th>
                                <th className="py-3 pr-3">Price</th>
                                <th className="py-3 pr-3">Stock</th>
                                <th className="py-3 pr-3">Featured</th>
                                <th className="py-3 pr-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}><td colSpan={7} className="py-3 px-3"><div className="h-10 rounded-md bg-[var(--pth-muted)]/10 animate-pulse" /></td></tr>
                            ))}
                            {!loading && items.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-[var(--pth-muted)]">No products yet. Click “Add Product”.</td></tr>}
                            {!loading && items.map((p) => {
                                const img = (p.images && p.images[0]?.url) ? buildMediaUrl(p.images[0].url) : (p.image_url || "");
                                return (
                                    <tr key={p.id} className="border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 hover:bg-black/[0.015] dark:hover:bg-white/[0.02]">
                                        <td className="py-3 px-3"><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} /></td>
                                        <td className="py-3 pr-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-lg overflow-hidden bg-[var(--pth-muted)]/10 flex items-center justify-center shrink-0">
                                                    {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-4 w-4 text-[var(--pth-muted)]" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium truncate max-w-[260px]">{p.name}</div>
                                                    <div className="text-[11px] text-[var(--pth-muted)] truncate max-w-[260px]">{p.short_description || (p.description || "").slice(0, 60)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 pr-3 text-[var(--pth-muted)]">{p.category}</td>
                                        <td className="py-3 pr-3">{p.show_price && p.price ? `PKR ${Number(p.price).toLocaleString()}` : "—"}</td>
                                        <td className="py-3 pr-3">
                                            <span className={`inline-flex rounded-full text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 ${p.in_stock ? "bg-[#10B981]/15 text-[#10B981]" : "bg-red-500/15 text-red-500"}`}>{p.in_stock ? "In stock" : "Out of stock"}</span>
                                        </td>
                                        <td className="py-3 pr-3">
                                            <button onClick={() => onToggleFeatured(p)} className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
                                                {p.featured ? <Star className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" /> : <StarOff className="h-4 w-4 text-[var(--pth-muted)]" />}
                                            </button>
                                        </td>
                                        <td className="py-3 pr-3">
                                            <div className="flex items-center gap-1">
                                                <Link to={`/admin/products/edit/${p.id}`} data-testid={`product-edit-${p.id}`} className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.04]" aria-label="Edit"><Edit className="h-4 w-4" /></Link>
                                                <button onClick={() => onDuplicate(p.id)} className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.04]" aria-label="Duplicate"><Copy className="h-4 w-4" /></button>
                                                <button onClick={() => onDelete(p.id)} data-testid={`product-delete-${p.id}`} className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-red-500/10 text-red-500" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                                                <a href={`/#products`} target="_blank" rel="noopener noreferrer" className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-[var(--pth-muted)]" aria-label="View"><ExternalLink className="h-3.5 w-3.5" /></a>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                {total > pageSize && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-black/[0.05] dark:border-white/[0.06] text-sm">
                        <span className="text-[var(--pth-muted)]">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}</span>
                        <div className="flex gap-1">
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="h-8 px-3 rounded-lg border border-black/10 dark:border-white/10 disabled:opacity-40">Prev</button>
                            <button disabled={page * pageSize >= total} onClick={() => setPage(p => p + 1)} className="h-8 px-3 rounded-lg border border-black/10 dark:border-white/10 disabled:opacity-40">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
