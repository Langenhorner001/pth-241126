import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { adminAuth, tokens } from "./api";

const AuthCtx = createContext({ user: null, loading: true, login: async () => {}, logout: () => {} });

export const AdminAuthProvider = ({ children }) => {
    const [user, setUser] = useState(tokens.getUser());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            if (tokens.get()) {
                try {
                    const res = await adminAuth.me();
                    setUser(res.data);
                    tokens.setUser(res.data);
                } catch {
                    tokens.clear();
                    setUser(null);
                }
            }
            setLoading(false);
        };
        init();
    }, []);

    const login = useCallback(async (password) => {
        const res = await adminAuth.login(password);
        tokens.set(res.data.access_token, res.data.refresh_token);
        tokens.setUser(res.data.user);
        setUser(res.data.user);
        return res.data;
    }, []);

    const logout = useCallback(() => {
        tokens.clear();
        setUser(null);
        if (typeof window !== "undefined") window.location.href = "/admin/login";
    }, []);

    const value = useMemo(() => ({ user, loading, login, logout, setUser }), [user, loading, login, logout]);
    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};

export const useAdminAuth = () => useContext(AuthCtx);
