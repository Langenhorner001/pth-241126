import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Zap, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "./AuthContext";

export default function AdminLoginPage() {
    const { user, login } = useAdminAuth();
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [busy, setBusy] = useState(false);
    const nav = useNavigate();

    if (user) return <Navigate to="/admin/dashboard" replace />;

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!password) return;
        setBusy(true);
        try {
            await login(password);
            toast.success("Welcome back, Administrator");
            nav("/admin/dashboard");
        } catch (err) {
            const msg = err?.response?.data?.detail || "Login failed. Please try again.";
            toast.error(typeof msg === "string" ? msg : "Login failed");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-10 bg-[var(--pth-bg)]">
            <div className="absolute inset-0 hero-mesh-bg" aria-hidden />
            <div className="circuit-overlay" aria-hidden />

            <div data-testid="admin-login-card" className="relative w-full max-w-md rounded-3xl glass-card p-7 sm:p-9">
                <div className="flex items-center justify-center">
                    <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#1E3A8A] text-white glow-blue logo-pulse">
                        <Zap className="h-7 w-7" strokeWidth={2.3} />
                    </span>
                </div>
                <h1 className="mt-5 text-center font-display font-extrabold text-2xl sm:text-3xl tracking-tight">Admin Sign In</h1>
                <p className="mt-2 text-center text-sm text-[var(--pth-muted)]">Punjab Transformer House Control Panel</p>

                <form onSubmit={onSubmit} className="mt-7 space-y-4" data-testid="admin-login-form">
                    <div>
                        <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pth-muted)]">Password</label>
                        <div className="mt-1.5 relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--pth-muted)]" />
                            <input
                                type={show ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                data-testid="admin-login-password"
                                placeholder="Enter admin password"
                                required
                                autoFocus
                                autoComplete="current-password"
                                className="w-full h-11 rounded-xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 pl-10 pr-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pth-ring)]"
                            />
                            <button
                                type="button"
                                onClick={() => setShow((s) => !s)}
                                aria-label={show ? "Hide password" : "Show password"}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--pth-muted)] hover:text-[var(--pth-fg)]"
                            >
                                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={busy}
                        data-testid="admin-login-submit"
                        className="w-full h-11 rounded-xl bg-[#0066FF] text-white font-semibold shadow-[0_18px_40px_-10px_rgba(0,102,255,0.6)] hover:brightness-110 transition disabled:opacity-70 inline-flex items-center justify-center gap-2"
                    >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                        {busy ? "Signing in..." : "Sign in securely"}
                    </button>
                </form>

                <p className="mt-6 text-center text-[11px] text-[var(--pth-muted)]">
                    Protected area • All access attempts are logged
                </p>
            </div>
        </div>
    );
}
