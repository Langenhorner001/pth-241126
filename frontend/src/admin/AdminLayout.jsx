import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Users, Star, Image as ImageIcon, Settings, User, LogOut, Menu, X, ChevronLeft, Sun, Moon, Search, Zap, ExternalLink } from "lucide-react";
import { useAdminAuth } from "./AuthContext";
import { useTheme } from "../lib/theme";

const NAV = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/leads", label: "Leads & Inquiries", icon: Users },
    { to: "/admin/testimonials", label: "Testimonials", icon: Star },
    { to: "/admin/media", label: "Media Library", icon: ImageIcon },
    { to: "/admin/profile", label: "Profile", icon: User }
];

export default function AdminLayout() {
    const { user, logout } = useAdminAuth();
    const { theme, toggle } = useTheme();
    const [open, setOpen] = useState(false);
    const loc = useLocation();

    return (
        <div className="min-h-screen flex bg-[var(--pth-bg)] text-[var(--pth-fg)]">
            {/* Sidebar */}
            <aside
                data-testid="admin-sidebar"
                className={`fixed lg:sticky top-0 z-40 h-screen w-72 shrink-0 flex flex-col bg-[var(--pth-bg)] border-r border-black/[0.06] dark:border-white/[0.06] transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >
                <div className="px-5 py-5 flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06]">
                    <Link to="/admin/dashboard" className="flex items-center gap-2.5">
                        <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0066FF] to-[#1E3A8A] text-white">
                            <Zap className="h-5 w-5" strokeWidth={2.3} />
                            <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-[#D4AF37] ring-2 ring-[var(--pth-bg)]" />
                        </span>
                        <span className="flex flex-col leading-tight">
                            <span className="font-display font-extrabold text-[13px] tracking-tight">PTH ADMIN</span>
                            <span className="text-[10px] font-semibold tracking-[0.22em] text-[var(--pth-muted)]">CONTROL PANEL</span>
                        </span>
                    </Link>
                    <button onClick={() => setOpen(false)} className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-full glass-card" aria-label="Close menu">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <nav className="flex-1 overflow-auto px-3 py-4 flex flex-col gap-0.5">
                    {NAV.map((n) => {
                        const Icon = n.icon;
                        return (
                            <NavLink
                                key={n.to}
                                to={n.to}
                                onClick={() => setOpen(false)}
                                data-testid={`admin-nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                        isActive
                                            ? "bg-[#0066FF] text-white shadow-[0_10px_28px_-12px_rgba(0,102,255,0.7)]"
                                            : "text-[var(--pth-fg)]/80 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                                    }`
                                }
                            >
                                <Icon className="h-4.5 w-4.5" />
                                <span>{n.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="px-3 py-3 border-t border-black/[0.06] dark:border-white/[0.06]">
                    <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[var(--pth-muted)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
                        <ExternalLink className="h-3.5 w-3.5" /> View Public Site
                    </a>
                    <button onClick={logout} data-testid="admin-logout-button" className="mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-500/[0.08]">
                        <LogOut className="h-3.5 w-3.5" /> Sign out
                    </button>
                </div>
            </aside>

            {/* Backdrop mobile */}
            {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

            {/* Main */}
            <div className="flex-1 min-w-0 flex flex-col">
                <header className="sticky top-0 z-30 glass-nav border-b border-black/[0.04] dark:border-white/[0.06]">
                    <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-3">
                        <button onClick={() => setOpen(true)} className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-full glass-card" aria-label="Open menu">
                            <Menu className="h-5 w-5" />
                        </button>
                        <div className="flex-1 min-w-0">
                            <h1 className="font-display font-bold text-lg sm:text-xl tracking-tight truncate">
                                {NAV.find((n) => loc.pathname.startsWith(n.to))?.label || "Admin"}
                            </h1>
                            <p className="text-[11px] text-[var(--pth-muted)] hidden sm:block">Welcome back, {user?.name || user?.email}</p>
                        </div>
                        <button onClick={toggle} aria-label="Toggle theme" data-testid="admin-theme-toggle" className="h-10 w-10 rounded-full glass-card inline-flex items-center justify-center">
                            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>
                    </div>
                </header>
                <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
