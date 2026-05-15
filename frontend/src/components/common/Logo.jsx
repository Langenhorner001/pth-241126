import { Zap } from "lucide-react";

export const Logo = ({ compact = false, className = "" }) => {
    return (
        <a href="#home" className={`group flex items-center gap-2.5 select-none ${className}`} data-testid="site-logo">
            <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0066FF] to-[#1E3A8A] text-white shadow-[0_8px_24px_-6px_rgba(0,102,255,0.65)] logo-pulse">
                <Zap className="h-5 w-5" strokeWidth={2.3} />
                <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-[#D4AF37] ring-2 ring-[var(--pth-bg)]" />
            </span>
            {!compact && (
                <span className="flex flex-col leading-tight">
                    <span className="font-display font-extrabold text-[15px] tracking-tight text-[var(--pth-fg)]">
                        PUNJAB <span className="text-[#D4AF37]">TRANSFORMER</span>
                    </span>
                    <span className="text-[10px] font-semibold tracking-[0.25em] text-[var(--pth-muted)]">
                        HOUSE • MIRPUR AJK
                    </span>
                </span>
            )}
        </a>
    );
};
