import { Zap } from "lucide-react";

export const PageLoader = () => {
    return (
        <div
            data-testid="page-loader"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--pth-bg)]"
        >
            <div className="flex flex-col items-center gap-4">
                <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#1E3A8A] text-white logo-pulse glow-blue">
                    <Zap className="h-8 w-8" strokeWidth={2.4} />
                </span>
                <div className="text-center">
                    <div className="font-display text-base font-extrabold tracking-tight">PUNJAB TRANSFORMER HOUSE</div>
                    <div className="text-xs text-[var(--pth-muted)] mt-1 tracking-[0.3em]">LOADING POWER • MIRPUR AJK</div>
                </div>
            </div>
        </div>
    );
};
