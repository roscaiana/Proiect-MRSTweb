import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Layout from "./layouts/Layout";
import HomePage from "./pages/HomePage/HomePage";
import Support from "./pages/support/support";
import News from "./pages/news/News";
import Contact from "./pages/contacts/Contact";
import TestsPage from "./pages/testpage/TestsPage";
import AppointmentPage from "./pages/exam-regist/AppointmentPage";
import PrivacyPolicy from "./pages/privacy/PrivacyPolicy";
import TermsAndConditions from "./pages/terms/TermsAndConditions";
import LoginPage from "./pages/auth/LoginPage/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage/RegisterPage";
import UserDashboard from "./pages/auth/UserDashboard/UserDashboard";
import AdminDashboard from "./pages/auth/AdminDashboard/AdminDashboard";
import { AuthProvider } from "./context/AuthContext";
import { APP_ROUTES } from "./routes/appRoutes";
import { useAuth } from "./hooks/useAuth";

function ScrollToTop() {
    const { pathname, search } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, [pathname, search]);

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
                        <Route path={APP_ROUTES.home} element={<HomePage />} />
                        <Route path={APP_ROUTES.news} element={<News />} />
                        <Route path={APP_ROUTES.support} element={<Support />} />
                        <Route path={APP_ROUTES.contact} element={<Contact />} />
                        <Route path={APP_ROUTES.tests} element={<TestsPage />} />
                        <Route path={APP_ROUTES.privacy} element={<PrivacyPolicy />} />
                        <Route path={APP_ROUTES.terms} element={<TermsAndConditions />} />
                        <Route path={APP_ROUTES.termsAlt} element={<TermsAndConditions />} />
                        <Route path={APP_ROUTES.termsEn} element={<TermsAndConditions />} />
                        <Route path={APP_ROUTES.appointment} element={<AppointmentPage />} />
                        <Route path={APP_ROUTES.login} element={<LoginPage />} />
                        <Route path={APP_ROUTES.register} element={<RegisterPage />} />
                        <Route path={APP_ROUTES.dashboard} element={<UserDashboard />} />
                        <Route path={APP_ROUTES.admin} element={<AdminDashboard />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
