import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Users, Star, TrendingUp, AlertCircle, MessageCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";
import { adminDashboard } from "./api";

const StatCard = ({ icon: Icon, label, value, trend, color = "#0066FF", testId }) => (
    <div data-testid={testId} className="rounded-2xl glass-card p-5 sm:p-6">
        <div className="flex items-start justify-between">
            <div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--pth-muted)]">{label}</div>
                <div className="mt-1.5 font-display font-extrabold text-3xl sm:text-4xl tracking-tight">{value}</div>
                {trend !== undefined && trend !== null && (
                    <div className={`mt-1 text-xs font-medium inline-flex items-center gap-1 ${trend >= 0 ? "text-[#10B981]" : "text-red-500"}`}>
                        <TrendingUp className="h-3 w-3" /> {trend >= 0 ? "+" : ""}{trend}% vs prior 30d
                    </div>
                )}
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${color}1A`, color }}>
                <Icon className="h-5 w-5" />
            </span>
        </div>
    </div>
);

export default function DashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminDashboard.stats().then((r) => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-28 rounded-2xl bg-[var(--pth-muted)]/10 animate-pulse" />
                ))}
            </div>
        );
    }
    if (!data) return <div className="text-[var(--pth-muted)]">Failed to load stats.</div>;

    const c = data.counts;
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard testId="stat-products" icon={Package} label="Total Products" value={c.products} color="#0066FF" />
                <StatCard testId="stat-leads" icon={Users} label="Leads (30d)" value={c.leads_30d} trend={data.growth_30d_percent} color="#D4AF37" />
                <StatCard testId="stat-new-leads" icon={AlertCircle} label="New Leads (unread)" value={c.leads_new} color="#EF4444" />
                <StatCard testId="stat-testimonials" icon={Star} label="Testimonials" value={c.testimonials_total} color="#10B981" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 rounded-2xl glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-display font-bold text-base">Leads — Last 30 Days</h3>
                        <span className="text-xs text-[var(--pth-muted)]">{c.leads_30d} total</span>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.leads_daily_30d} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,127,127,0.18)" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="currentColor" />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="currentColor" />
                                <Tooltip contentStyle={{ background: "rgba(10,14,26,0.92)", border: "none", borderRadius: 12, color: "#fff" }} />
                                <Line type="monotone" dataKey="count" stroke="#0066FF" strokeWidth={2.5} dot={{ r: 3, fill: "#0066FF" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="rounded-2xl glass-card p-5">
                    <h3 className="font-display font-bold text-base mb-3">Top Product Interest</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.product_interest_top} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,127,127,0.18)" />
                                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="currentColor" />
                                <YAxis dataKey="label" type="category" tick={{ fontSize: 11 }} stroke="currentColor" width={110} />
                                <Tooltip contentStyle={{ background: "rgba(10,14,26,0.92)", border: "none", borderRadius: 12, color: "#fff" }} />
                                <Bar dataKey="count" fill="#D4AF37" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-bold text-base">Recent Leads</h3>
                    <Link to="/admin/leads" className="text-xs font-semibold text-[#0066FF] hover:underline">View all →</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-[11px] uppercase tracking-[0.15em] text-[var(--pth-muted)] border-b border-black/[0.05] dark:border-white/[0.06]">
                                <th className="py-2 pr-3">Name</th>
                                <th className="py-2 pr-3">Phone</th>
                                <th className="py-2 pr-3">Interest</th>
                                <th className="py-2 pr-3">Status</th>
                                <th className="py-2 pr-3">Received</th>
                                <th className="py-2 pr-3">WA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recent_leads.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-[var(--pth-muted)]">No leads yet.</td></tr>}
                            {data.recent_leads.map((l) => (
                                <tr key={l.id} className="border-b border-black/[0.04] dark:border-white/[0.04] last:border-0">
                                    <td className="py-2.5 pr-3 font-medium">{l.name}</td>
                                    <td className="py-2.5 pr-3">{l.phone}</td>
                                    <td className="py-2.5 pr-3 text-[var(--pth-muted)]">{l.product_interest || "—"}</td>
                                    <td className="py-2.5 pr-3"><StatusPill status={l.status} /></td>
                                    <td className="py-2.5 pr-3 text-[var(--pth-muted)]">{new Date(l.created_at).toLocaleDateString()}</td>
                                    <td className="py-2.5 pr-3">
                                        <a href={`https://wa.me/${l.phone.replace(/[^0-9]/g, "").replace(/^0/, "92")}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#10B981] text-white">
                                            <MessageCircle className="h-3.5 w-3.5" />
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export const StatusPill = ({ status }) => {
    const map = {
        new: { bg: "bg-[#0066FF]/15", fg: "text-[#0066FF]", label: "New" },
        contacted: { bg: "bg-[#D4AF37]/15", fg: "text-[#a68224] dark:text-[#D4AF37]", label: "Contacted" },
        converted: { bg: "bg-[#10B981]/15", fg: "text-[#10B981]", label: "Converted" },
        closed: { bg: "bg-zinc-500/15", fg: "text-zinc-500", label: "Closed" }
    };
    const s = map[status] || map.new;
    return <span className={`inline-flex items-center rounded-full ${s.bg} ${s.fg} text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-0.5`}>{s.label}</span>;
};
