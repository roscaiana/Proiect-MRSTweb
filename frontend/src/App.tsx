import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./layouts/Layout";
import HomePage from "./pages/HomePage/HomePage";
import Support from "./pages/support/support";
import News from "./pages/news/News";
import Contact from "./pages/contacts/Contact";
import TestsPage from "./pages/testpage/TestsPage";
import LegislativeMaterialsPage from "./pages/legislative-materials/LegislativeMaterialsPage";
import AppointmentPage from "./pages/exam-regist/AppointmentPage";
import AppointmentConfirmationPage from "./pages/exam-regist/AppointmentConfirmationPage";
import PrivacyPolicy from "./pages/privacy/PrivacyPolicy";
import TermsAndConditions from "./pages/terms/TermsAndConditions";
import LoginPage from "./pages/auth/LoginPage/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage/RegisterPage";
import UserDashboard from "./pages/auth/UserDashboard/UserDashboard";
import UserAppointmentsPage from "./pages/auth/UserAppointmentsPage/UserAppointmentsPage";
import TestHistoryPage from "./pages/auth/TestHistoryPage/TestHistoryPage";
import AdminDashboard from "./pages/auth/AdminDashboard/AdminDashboard";
import { AuthProvider } from "./context/AuthContext";
import { ScrollLockProvider, useScrollLockContext } from "./context/ScrollLockContext";
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
    children: ReactElement;
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

const AppShell = ({ children }: { children: ReactNode }) => {
    const { locked } = useScrollLockContext();
    const scrollOffsetRef = useRef(0);
    const [scrollOffset, setScrollOffset] = useState(0);

    useLayoutEffect(() => {
        if (locked) {
            const currentOffset = window.scrollY || 0;
            scrollOffsetRef.current = currentOffset;
            setScrollOffset(currentOffset);
            return;
        }

        if (scrollOffsetRef.current === 0) {
            return;
        }

        window.scrollTo({ top: scrollOffsetRef.current, left: 0, behavior: "auto" });
        scrollOffsetRef.current = 0;
        setScrollOffset(0);
    }, [locked]);

    const shellStyle: CSSProperties | undefined = locked
        ? { position: "fixed", top: `-${scrollOffset}px`, left: 0, right: 0, width: "100%" }
        : undefined;

    return (
        <div className={`app-shell ${locked ? "scroll-locked" : ""}`} style={shellStyle}>
            {children}
        </div>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <ScrollLockProvider>
                <BrowserRouter>
                    <AppShell>
                        <Toaster position="top-right" />
                        <ScrollToTop />
                        <ErrorBoundaryShell>
                            <Routes>
                                <Route
                                    path={APP_ROUTES.admin}
                                    element={
                                        <ProtectedRoute requireAdmin={true}>
                                            <AdminDashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route element={<Layout />}>
                                    <Route path={APP_ROUTES.home} element={<HomePage />} />
                                    <Route path={APP_ROUTES.news} element={<News />} />
                                    <Route path={APP_ROUTES.newsAlias} element={<Navigate to={APP_ROUTES.news} replace />} />
                                    <Route path={APP_ROUTES.support} element={<Support />} />
                                    <Route path={APP_ROUTES.contact} element={<Contact />} />
                                    <Route
                                        path={APP_ROUTES.tests}
                                        element={<TestsPage />}
                                    />
                                    <Route path={APP_ROUTES.legislativeMaterials} element={<LegislativeMaterialsPage />} />
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
                            <Route
                                path={APP_ROUTES.appointmentConfirmation}
                                element={
                                    <ProtectedRoute>
                                        <AppointmentConfirmationPage />
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
                                        path={APP_ROUTES.userAppointments}
                                        element={
                                            <ProtectedRoute>
                                                <UserAppointmentsPage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path={APP_ROUTES.testHistory}
                                        element={
                                            <ProtectedRoute>
                                                <TestHistoryPage />
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
                    </AppShell>
                </BrowserRouter>
            </ScrollLockProvider>
        </AuthProvider>
    );
}
