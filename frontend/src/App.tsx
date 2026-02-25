import { ReactNode, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Layout from "./layouts/Layout";
import HomePage from "./pages/HomePage/HomePage";
import Support from "./pages/support/support";
import News from "./pages/news/News";
import Contact from "./pages/contacts/Contact";
import TestsPage from "./pages/testpage/TestsPage";
import AppointmentPage from "./pages/exam-regist/AppointmentPage";
import LoginPage from "./pages/auth/LoginPage/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage/RegisterPage";
import UserDashboard from "./pages/auth/UserDashboard/UserDashboard";
import AdminDashboard from "./pages/auth/AdminDashboard/AdminDashboard";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }, [pathname]);

    return null;
}

type GuardProps = {
    children: ReactNode;
};

function RequireGuest({ children }: GuardProps) {
    const { isAuthenticated, isAdmin } = useAuth();

    if (!isAuthenticated) {
        return <>{children}</>;
    }

    return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
}

function RequireUser({ children }: GuardProps) {
    const { isAuthenticated, isAdmin } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
}

function RequireAdmin({ children }: GuardProps) {
    const { isAuthenticated, isAdmin } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <ScrollToTop />
                <Routes>
                    <Route
                        path="/admin/*"
                        element={
                            <RequireAdmin>
                                <AdminDashboard />
                            </RequireAdmin>
                        }
                    />

                    <Route element={<Layout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/news" element={<News />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route
                            path="/tests"
                            element={
                                <RequireUser>
                                    <TestsPage />
                                </RequireUser>
                            }
                        />
                        <Route
                            path="/appointment"
                            element={
                                <RequireUser>
                                    <AppointmentPage />
                                </RequireUser>
                            }
                        />
                        <Route
                            path="/login"
                            element={
                                <RequireGuest>
                                    <LoginPage />
                                </RequireGuest>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <RequireGuest>
                                    <RegisterPage />
                                </RequireGuest>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <RequireUser>
                                    <UserDashboard />
                                </RequireUser>
                            }
                        />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
