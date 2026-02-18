import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./paths";

// Page imports
import HomePage from "../pages/HomePage/HomePage";
import Contact from "../pages/contacts/Contact";
import Support from "../pages/support/support";
import LoginPage from "../pages/auth/LoginPage/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage/RegisterPage";
import UserDashboard from "../pages/auth/UserDashboard/UserDashboard";
import AdminDashboard from "../pages/auth/AdminDashboard/AdminDashboard";
import AppointmentPage from "../pages/exam-regist/AppointmentPage";
import TestsPage from "../pages/testpage/TestsPage";

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('authUser');

  if (!token || !userStr) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (requireAdmin && user.role !== 'admin') {
      return <Navigate to={ROUTES.USER_DASHBOARD} replace />;
    }
  } catch {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
};

export default function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.CONTACT} element={<Contact />} />
      <Route path={ROUTES.SUPPORT} element={<Support />} />

      {/* Authentication Routes */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

      {/* Protected User Routes */}
      <Route
        path={ROUTES.USER_DASHBOARD}
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.APPOINTMENT}
        element={
          <ProtectedRoute>
            <AppointmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TESTS}
        element={
          <ProtectedRoute>
            <TestsPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path={ROUTES.ADMIN_DASHBOARD}
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}
