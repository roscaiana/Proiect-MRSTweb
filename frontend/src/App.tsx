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
import { useAuth } from "./hooks/useAuth";
import { APP_ROUTES } from "./routes/appRoutes";
import ErrorBoundary from "./components/ErrorBoundary";
import {
    ForbiddenPage,
    NotFoundPage,
    ServerErrorPage,
    UnauthorizedPage,
} from "./pages/errors/ErrorPage";

function ScrollToTop() {
    const { pathname, search } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, [pathname, search]);

    return null;
}

type ProtectedRouteProps = {
    children: JSX.Element;
    requireAdmin?: boolean;
};

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
    const { isAuthenticated, isAdmin, isAuthReady } = useAuth();
    const location = useLocation();

    if (!isAuthReady) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to={APP_ROUTES.unauthorized} replace state={{ from: location.pathname }} />;
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to={APP_ROUTES.forbidden} replace />;
    }

    return children;
};

const ErrorBoundaryShell = ({ children }: { children: ReactNode }) => {
    const location = useLocation();
    return <ErrorBoundary resetKey={`${location.pathname}${location.search}`} >{children}</ErrorBoundary>;
};

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <ScrollToTop />
                <ErrorBoundaryShell>
                    <Routes>
                        <Route element={<Layout />}>
                            <Route path={APP_ROUTES.home} element={<HomePage />} />
                            <Route path={APP_ROUTES.news} element={<News />} />
                            <Route path={APP_ROUTES.support} element={<Support />} />
                            <Route path={APP_ROUTES.contact} element={<Contact />} />
                            <Route
                                path={APP_ROUTES.tests}
                                element={
                                    <ProtectedRoute>
                                        <TestsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path={APP_ROUTES.privacy} element={<PrivacyPolicy />} />
                            <Route path={APP_ROUTES.terms} element={<TermsAndConditions />} />
                            <Route path={APP_ROUTES.termsAlt} element={<TermsAndConditions />} />
                            <Route path={APP_ROUTES.termsEn} element={<TermsAndConditions />} />
                            <Route
                                path={APP_ROUTES.appointment}
                                element={
                                    <ProtectedRoute>
                                        <AppointmentPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path={APP_ROUTES.login} element={<LoginPage />} />
                            <Route path={APP_ROUTES.register} element={<RegisterPage />} />
                            <Route
                                path={APP_ROUTES.dashboard}
                                element={
                                    <ProtectedRoute>
                                        <UserDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path={APP_ROUTES.admin}
                                element={
                                    <ProtectedRoute requireAdmin={true}>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path={APP_ROUTES.unauthorized} element={<UnauthorizedPage />} />
                            <Route path={APP_ROUTES.forbidden} element={<ForbiddenPage />} />
                            <Route path={APP_ROUTES.serverError} element={<ServerErrorPage />} />
                            <Route path={APP_ROUTES.notFound} element={<NotFoundPage />} />
                            <Route path="*" element={<Navigate to={APP_ROUTES.notFound} replace />} />
                        </Route>
                    </Routes>
                </ErrorBoundaryShell>
            </BrowserRouter>
        </AuthProvider>
    );
}
