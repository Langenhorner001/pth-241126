import { useState } from "react";
import { Loader2, KeyRound, User, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "./AuthContext";
import { adminAuth } from "./api";

export default function ProfilePage() {
    const { user, setUser } = useAdminAuth();
    const [name, setName] = useState(user?.name || "");
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [busyProfile, setBusyProfile] = useState(false);
    const [busyPw, setBusyPw] = useState(false);

    const saveProfile = async (e) => {
        e.preventDefault();
        setBusyProfile(true);
        try {
            const r = await adminAuth.updateProfile({ name });
            setUser(r.data);
            toast.success("Profile updated");
        } catch { toast.error("Failed"); }
        finally { setBusyProfile(false); }
    };
    const changePassword = async (e) => {
        e.preventDefault();
        if (newPw.length < 8) return toast.error("New password must be at least 8 characters");
        if (newPw !== confirmPw) return toast.error("Passwords do not match");
        setBusyPw(true);
        try {
            await adminAuth.changePassword(currentPw, newPw);
            toast.success("Password changed");
            setCurrentPw(""); setNewPw(""); setConfirmPw("");
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Change failed");
        } finally { setBusyPw(false); }
    };

    return (
        <div className="max-w-2xl space-y-5" data-testid="admin-profile-page">
            <div className="rounded-2xl glass-card p-6">
                <div className="flex items-center gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#1E3A8A] text-white text-lg font-display font-bold">
                        {(user?.name || user?.email || "A").charAt(0).toUpperCase()}
                    </span>
                    <div>
                        <h2 className="font-display font-bold text-xl">{user?.name}</h2>
                        <p className="text-sm text-[var(--pth-muted)]"><Mail className="inline h-3.5 w-3.5 mr-1" /> {user?.email}</p>
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#D4AF37]/20 text-[#a68224] dark:text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-0.5"><ShieldCheck className="h-3 w-3" /> {user?.role}</span>
                    </div>
                </div>
            </div>

            <form onSubmit={saveProfile} className="rounded-2xl glass-card p-6">
                <h3 className="font-display font-bold text-base mb-4 inline-flex items-center gap-2"><User className="h-4 w-4" /> Profile</h3>
                <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--pth-muted)]">Display name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full h-10 rounded-xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 text-sm" />
                <button disabled={busyProfile} className="mt-4 inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#0066FF] text-white text-sm font-semibold disabled:opacity-70">
                    {busyProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save profile
                </button>
            </form>

            <form onSubmit={changePassword} className="rounded-2xl glass-card p-6 space-y-3">
                <h3 className="font-display font-bold text-base mb-1 inline-flex items-center gap-2"><KeyRound className="h-4 w-4" /> Change password</h3>
                <Field label="Current password"><input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required className="input2" /></Field>
                <Field label="New password (min 8 chars)"><input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={8} className="input2" data-testid="new-password-input" /></Field>
                <Field label="Confirm new password"><input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required className="input2" /></Field>
                <button disabled={busyPw} className="mt-2 inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#0066FF] text-white text-sm font-semibold disabled:opacity-70">
                    {busyPw ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Change password
                </button>
            </form>
            <style>{`.input2{width:100%;height:40px;border-radius:12px;background:rgba(255,255,255,0.7);border:1px solid rgba(0,0,0,0.1);padding:0 12px;font-size:14px;} .dark .input2{background:rgba(255,255,255,0.05);border-color:rgba(255,255,255,0.1);color:#fff}`}</style>
        </div>
    );
}

const Field = ({ label, children }) => (
    <div>
        <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--pth-muted)]">{label}</label>
        <div className="mt-1">{children}</div>
    </div>
);
