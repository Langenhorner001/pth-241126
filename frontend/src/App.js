import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./lib/theme";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

// Admin
import { AdminAuthProvider } from "./admin/AuthContext";
import { ProtectedRoute } from "./admin/ProtectedRoute";
import AdminLoginPage from "./admin/LoginPage";
import AdminLayout from "./admin/AdminLayout";
import DashboardPage from "./admin/DashboardPage";
import ProductsListPage from "./admin/ProductsListPage";
import ProductEditPage from "./admin/ProductEditPage";
import LeadsPage from "./admin/LeadsPage";
import TestimonialsPage from "./admin/TestimonialsPage";
import MediaPage from "./admin/MediaPage";
import ProfilePage from "./admin/ProfilePage";

import "./App.css";

function App() {
    return (
        <HelmetProvider>
            <ThemeProvider>
                <div className="App">
                    <BrowserRouter>
                        <AdminAuthProvider>
                            <Routes>
                                {/* Public */}
                                <Route path="/" element={<HomePage />} />

                                {/* Admin auth */}
                                <Route path="/admin/login" element={<AdminLoginPage />} />

                                {/* Admin protected */}
                                <Route
                                    path="/admin"
                                    element={
                                        <ProtectedRoute>
                                            <AdminLayout />
                                        </ProtectedRoute>
                                    }
                                >
                                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                                    <Route path="dashboard" element={<DashboardPage />} />
                                    <Route path="products" element={<ProductsListPage />} />
                                    <Route path="products/new" element={<ProductEditPage />} />
                                    <Route path="products/edit/:id" element={<ProductEditPage />} />
                                    <Route path="leads" element={<LeadsPage />} />
                                    <Route path="testimonials" element={<TestimonialsPage />} />
                                    <Route path="media" element={<MediaPage />} />
                                    <Route path="profile" element={<ProfilePage />} />
                                </Route>

                                {/* 404 */}
                                <Route path="*" element={<NotFoundPage />} />
                            </Routes>
                        </AdminAuthProvider>
                    </BrowserRouter>
                    <Toaster position="top-center" richColors closeButton />
                </div>
            </ThemeProvider>
        </HelmetProvider>
    );
}

export default App;
