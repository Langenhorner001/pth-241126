import { useEffect, useState } from "react";
import { Search, Trash2, Phone, Mail, MessageCircle, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { adminLeads } from "./api";
import { StatusPill } from "./DashboardPage";

const STATUSES = ["", "new", "contacted", "converted", "closed"];

export default function LeadsPage() {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [active, setActive] = useState(null);
    const pageSize = 25;

    const load = async () => {
        setLoading(true);
        try {
            const params = { page, page_size: pageSize };
            if (status) params.status = status;
            if (search) params.search = search;
            const r = await adminLeads.list(params);
            setItems(r.data.items);
            setTotal(r.data.total);
        } catch { toast.error("Failed to load leads"); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, status]);

    const setLeadStatus = async (id, newStatus) => {
        try {
            await adminLeads.update(id, { status: newStatus });
            toast.success("Status updated");
            load();
            setActive((a) => a && a.id === id ? { ...a, status: newStatus } : a);
        } catch { toast.error("Update failed"); }
    };
    const saveNotes = async (id, notes) => {
        try {
            await adminLeads.update(id, { status: active.status, internal_notes: notes });
            toast.success("Notes saved");
        } catch { toast.error("Failed"); }
    };
    const remove = async (id) => {
        if (!window.confirm("Delete this lead?")) return;
        try { await adminLeads.remove(id); toast.success("Deleted"); setActive(null); load(); } catch { toast.error("Delete failed"); }
    };
    const waLink = (phone) => `https://wa.me/${phone.replace(/[^0-9]/g, "").replace(/^0/, "92")}`;

    return (
        <div className="space-y-4" data-testid="admin-leads-page">
            <div className="rounded-2xl glass-card p-4 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--pth-muted)]" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (setPage(1), load())} placeholder="Search by name, phone, email, message..." className="w-full h-10 rounded-xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 pl-10 pr-3 text-sm" />
                </div>
                <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="h-10 rounded-xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 text-sm">
                    {STATUSES.map((s) => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : "All statuses"}</option>)}
                </select>
                <div className="text-xs text-[var(--pth-muted)]">{total} total</div>
            </div>

            <div className="rounded-2xl glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-[11px] uppercase tracking-[0.15em] text-[var(--pth-muted)] border-b border-black/[0.05] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.02]">
                                <th className="py-3 pl-4 pr-3">Customer</th>
                                <th className="py-3 pr-3">Phone</th>
                                <th className="py-3 pr-3">Interest</th>
                                <th className="py-3 pr-3">Message</th>
                                <th className="py-3 pr-3">Status</th>
                                <th className="py-3 pr-3">Received</th>
                                <th className="py-3 pr-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={7} className="py-3 px-3"><div className="h-10 rounded-md bg-[var(--pth-muted)]/10 animate-pulse" /></td></tr>)}
                            {!loading && items.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-[var(--pth-muted)]">No leads yet.</td></tr>}
                            {!loading && items.map((l) => (
                                <tr key={l.id} onClick={() => setActive(l)} className="border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 hover:bg-black/[0.015] dark:hover:bg-white/[0.02] cursor-pointer" data-testid={`lead-row-${l.id}`}>
                                    <td className="py-3 pl-4 pr-3">
                                        <div className="font-medium">{l.name}</div>
                                        {l.email && <div className="text-[11px] text-[var(--pth-muted)]">{l.email}</div>}
                                    </td>
                                    <td className="py-3 pr-3">{l.phone}</td>
                                    <td className="py-3 pr-3 text-[var(--pth-muted)]">{l.product_interest || "—"}</td>
                                    <td className="py-3 pr-3 max-w-xs truncate text-[var(--pth-muted)]">{l.message}</td>
                                    <td className="py-3 pr-3"><StatusPill status={l.status} /></td>
                                    <td className="py-3 pr-3 text-[var(--pth-muted)] whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                                    <td className="py-3 pr-3" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center gap-1">
                                            <a href={`tel:${l.phone}`} className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-[#0066FF]/10 text-[#0066FF]" aria-label="Call"><Phone className="h-3.5 w-3.5" /></a>
                                            <a href={waLink(l.phone)} target="_blank" rel="noopener noreferrer" className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-[#10B981]/15 text-[#10B981]" aria-label="WhatsApp"><MessageCircle className="h-3.5 w-3.5" /></a>
                                            <button onClick={() => remove(l.id)} data-testid={`lead-delete-${l.id}`} className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-red-500/10 text-red-500" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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

            {/* Detail drawer */}
            {active && <LeadDetail lead={active} onClose={() => setActive(null)} onStatus={setLeadStatus} onSaveNotes={saveNotes} onDelete={remove} waLink={waLink} />}
        </div>
    );
}

const LeadDetail = ({ lead, onClose, onStatus, onSaveNotes, onDelete, waLink }) => {
    const [notes, setNotes] = useState(lead.internal_notes || "");
    useEffect(() => setNotes(lead.internal_notes || ""), [lead.id]); // eslint-disable-line
    return (
        <div className="fixed inset-0 z-50 flex" data-testid="lead-detail-drawer">
            <div className="flex-1 bg-black/50" onClick={onClose} />
            <div className="w-full sm:max-w-md bg-[var(--pth-bg)] h-full overflow-auto p-5 border-l border-black/10 dark:border-white/10">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h2 className="font-display font-bold text-xl">{lead.name}</h2>
                        <p className="text-xs text-[var(--pth-muted)]">{new Date(lead.created_at).toLocaleString()}</p>
                    </div>
                    <button onClick={onClose} className="h-9 w-9 rounded-full glass-card inline-flex items-center justify-center" aria-label="Close"><X className="h-4 w-4" /></button>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#0066FF]" /><a href={`tel:${lead.phone}`} className="font-medium">{lead.phone}</a></div>
                    {lead.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#0066FF]" /><a href={`mailto:${lead.email}`} className="font-medium">{lead.email}</a></div>}
                    {lead.product_interest && <div className="text-[var(--pth-muted)]">Product interest: <b className="text-[var(--pth-fg)]">{lead.product_interest}</b></div>}
                </div>
                <div className="mt-4 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] p-3">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--pth-muted)] mb-1">Message</div>
                    <p className="text-sm whitespace-pre-wrap">{lead.message}</p>
                </div>
                <div className="mt-4">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--pth-muted)] mb-2">Update status</div>
                    <div className="grid grid-cols-2 gap-2">
                        {["new", "contacted", "converted", "closed"].map((s) => (
                            <button key={s} onClick={() => onStatus(lead.id, s)} data-testid={`lead-status-${s}`} className={`h-9 rounded-xl text-xs font-semibold uppercase tracking-[0.08em] ${lead.status === s ? "bg-[#0066FF] text-white" : "glass-card"}`}>{s}</button>
                        ))}
                    </div>
                </div>
                <div className="mt-4">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--pth-muted)] mb-1">Internal notes</div>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="w-full rounded-xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 py-2 text-sm" placeholder="Private notes for your team..." />
                    <button onClick={() => onSaveNotes(lead.id, notes)} className="mt-2 inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#0066FF] text-white text-xs font-semibold"><FileText className="h-3.5 w-3.5" /> Save notes</button>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                    <a href={waLink(lead.phone)} target="_blank" rel="noopener noreferrer" className="h-10 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#10B981] text-white text-sm font-semibold"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
                    <button onClick={() => onDelete(lead.id)} className="h-10 inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-500/10 text-red-500 text-sm font-semibold"><Trash2 className="h-4 w-4" /> Delete lead</button>
                </div>
            </div>
        </div>
    );
};
