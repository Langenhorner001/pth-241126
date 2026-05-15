import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_V1 = `${BACKEND_URL}/api/v1`;

const STORAGE = {
    ACCESS: "pth_admin_access",
    REFRESH: "pth_admin_refresh",
    USER: "pth_admin_user"
};

export const tokens = {
    get: () => localStorage.getItem(STORAGE.ACCESS),
    getRefresh: () => localStorage.getItem(STORAGE.REFRESH),
    set: (access, refresh) => {
        if (access) localStorage.setItem(STORAGE.ACCESS, access);
        if (refresh) localStorage.setItem(STORAGE.REFRESH, refresh);
    },
    clear: () => {
        localStorage.removeItem(STORAGE.ACCESS);
        localStorage.removeItem(STORAGE.REFRESH);
        localStorage.removeItem(STORAGE.USER);
    },
    setUser: (u) => localStorage.setItem(STORAGE.USER, JSON.stringify(u)),
    getUser: () => {
        try { return JSON.parse(localStorage.getItem(STORAGE.USER) || "null"); } catch { return null; }
    }
};

const api = axios.create({ baseURL: API_V1, headers: { "Content-Type": "application/json" }, timeout: 30000 });

api.interceptors.request.use((cfg) => {
    const t = tokens.get();
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
    return cfg;
});

let refreshing = null;
api.interceptors.response.use(
    (r) => r,
    async (err) => {
        const original = err.config || {};
        if (err.response?.status === 401 && !original._retry) {
            original._retry = true;
            const r = tokens.getRefresh();
            if (!r) {
                tokens.clear();
                if (typeof window !== "undefined" && !window.location.pathname.startsWith("/admin/login")) {
                    window.location.href = "/admin/login";
                }
                return Promise.reject(err);
            }
            try {
                refreshing = refreshing || axios.post(`${API_V1}/admin/auth/refresh`, { refresh_token: r });
                const res = await refreshing;
                refreshing = null;
                tokens.set(res.data.access_token, null);
                original.headers.Authorization = `Bearer ${res.data.access_token}`;
                return api(original);
            } catch (e) {
                tokens.clear();
                if (typeof window !== "undefined") window.location.href = "/admin/login";
                return Promise.reject(e);
            }
        }
        return Promise.reject(err);
    }
);

// ---- API helpers ----
export const adminAuth = {
    login: (password) => api.post("/admin/auth/login", { password }),
    me: () => api.get("/admin/auth/me"),
    changePassword: (current_password, new_password) => api.post("/admin/auth/change-password", { current_password, new_password }),
    updateProfile: (data) => api.put("/admin/auth/profile", data)
};

export const adminDashboard = {
    stats: () => api.get("/admin/dashboard/stats")
};

export const adminProducts = {
    list: (params) => api.get("/admin/products", { params }),
    create: (data) => api.post("/admin/products", data),
    update: (id, data) => api.put(`/admin/products/${id}`, data),
    remove: (id) => api.delete(`/admin/products/${id}`),
    duplicate: (id) => api.post(`/admin/products/${id}/duplicate`),
    bulkUpdate: (ids, update) => api.post("/admin/products/bulk-update", { ids, update }),
    bulkDelete: (ids) => api.post("/admin/products/bulk-delete", { ids })
};

export const adminLeads = {
    list: (params) => api.get("/admin/leads", { params }),
    update: (id, data) => api.put(`/admin/leads/${id}`, data),
    remove: (id) => api.delete(`/admin/leads/${id}`),
    bulkStatus: (ids, status) => api.post("/admin/leads/bulk-status", { ids, status })
};

export const adminTestimonials = {
    list: (params) => api.get("/admin/testimonials", { params }),
    create: (data) => api.post("/admin/testimonials", data),
    update: (id, data) => api.put(`/admin/testimonials/${id}`, data),
    remove: (id) => api.delete(`/admin/testimonials/${id}`),
    bulkApprove: (ids) => api.post("/admin/testimonials/bulk-approve", { ids })
};

export const adminMedia = {
    list: (params) => api.get("/admin/media", { params }),
    upload: (file, folder = "general", alt_text = "") => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", folder);
        fd.append("alt_text", alt_text);
        return api.post("/admin/media/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
    },
    update: (id, data) => api.put(`/admin/media/${id}`, data),
    remove: (id) => api.delete(`/admin/media/${id}`)
};

export const buildMediaUrl = (relativeUrl) => {
    if (!relativeUrl) return "";
    if (relativeUrl.startsWith("http")) return relativeUrl;
    return `${BACKEND_URL}${relativeUrl}`;
};

export default api;
