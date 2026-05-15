import { useEffect, useRef, useState } from "react";
import { Upload, Trash2, Copy, Search, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { adminMedia, buildMediaUrl } from "./api";

const FOLDERS = ["general", "products", "testimonials"];

export default function MediaPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [folder, setFolder] = useState("");
    const [search, setSearch] = useState("");
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);
    const [destFolder, setDestFolder] = useState("general");

    const load = async () => {
        setLoading(true);
        try {
            const params = { page: 1, page_size: 100 };
            if (folder) params.folder = folder;
            if (search) params.search = search;
            const r = await adminMedia.list(params);
            setItems(r.data.items);
        } catch { toast.error("Failed to load media"); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); /* eslint-disable-next-line */ }, [folder]);

    const onUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setUploading(true);
        try {
            for (const f of files) {
                await adminMedia.upload(f, destFolder, f.name);
            }
            toast.success(`Uploaded ${files.length} file(s)`);
            load();
        } catch (err) { toast.error(err?.response?.data?.detail || "Upload failed"); }
        finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
    };
    const remove = async (id) => {
        if (!window.confirm("Delete this file?")) return;
        try { await adminMedia.remove(id); toast.success("Deleted"); load(); } catch { toast.error("Delete failed"); }
    };
    const copy = (url) => {
        const full = buildMediaUrl(url);
        navigator.clipboard.writeText(full);
        toast.success("URL copied");
    };

    return (
        <div className="space-y-4" data-testid="admin-media-page">
            <div className="rounded-2xl glass-card p-4 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--pth-muted)]" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder="Search media..." className="w-full h-10 rounded-xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 pl-10 pr-3 text-sm" />
                </div>
                <select value={folder} onChange={(e) => setFolder(e.target.value)} className="h-10 rounded-xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 text-sm">
                    <option value="">All folders</option>
                    {FOLDERS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <select value={destFolder} onChange={(e) => setDestFolder(e.target.value)} className="h-10 rounded-xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 text-sm">
                    {FOLDERS.map((f) => <option key={f} value={f}>Upload to: {f}</option>)}
                </select>
                <input ref={fileRef} type="file" multiple accept="image/*" onChange={onUpload} className="hidden" />
                <button onClick={() => fileRef.current?.click()} disabled={uploading} data-testid="media-upload-button" className="inline-flex items-center gap-2 h-10 rounded-xl bg-[#0066FF] text-white px-4 text-sm font-semibold disabled:opacity-70">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {loading && Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-square rounded-2xl bg-[var(--pth-muted)]/10 animate-pulse" />)}
                {!loading && items.length === 0 && <div className="col-span-full text-center text-[var(--pth-muted)] py-10"><ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-40" /> No media yet. Upload your first file.</div>}
                {!loading && items.map((m) => (
                    <div key={m.id} className="group relative rounded-2xl overflow-hidden glass-card" data-testid={`media-${m.id}`}>
                        <div className="aspect-square bg-black/[0.04] dark:bg-white/[0.04]">
                            <img src={buildMediaUrl(m.thumb_url || m.url)} alt={m.alt_text} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div className="px-3 py-2">
                            <div className="text-xs font-medium truncate">{m.original_filename}</div>
                            <div className="text-[10px] text-[var(--pth-muted)] truncate">{m.folder} • {m.width}×{m.height}</div>
                        </div>
                        <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => copy(m.url)} className="h-7 w-7 rounded-full bg-black/70 text-white inline-flex items-center justify-center" aria-label="Copy URL"><Copy className="h-3 w-3" /></button>
                            <button onClick={() => remove(m.id)} data-testid={`media-delete-${m.id}`} className="h-7 w-7 rounded-full bg-red-500/90 text-white inline-flex items-center justify-center" aria-label="Delete"><Trash2 className="h-3 w-3" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
