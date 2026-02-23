import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { AdminPanelProvider } from "../../../features/admin/context/AdminPanelContext";
import AdminPanelLayout from "../../../features/admin/components/AdminPanelLayout";
import AdminOverviewPage from "../../../features/admin/pages/AdminOverviewPage";
import AdminTestsPage from "../../../features/admin/pages/AdminTestsPage";
import AdminUsersPage from "../../../features/admin/pages/AdminUsersPage";
import AdminAppointmentsPage from "../../../features/admin/pages/AdminAppointmentsPage";
import AdminNotificationsPage from "../../../features/admin/pages/AdminNotificationsPage";

const AdminDashboard: React.FC = () => {
    const { isAuthenticated, isAdmin } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <AdminPanelProvider>
            <Routes>
                <Route element={<AdminPanelLayout />}>
                    <Route index element={<Navigate to="/admin/overview" replace />} />
                    <Route path="overview" element={<AdminOverviewPage />} />
                    <Route path="tests" element={<AdminTestsPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="appointments" element={<AdminAppointmentsPage />} />
                    <Route path="notifications" element={<AdminNotificationsPage />} />
                    <Route path="*" element={<Navigate to="/admin/overview" replace />} />
                </Route>
            </Routes>
        </AdminPanelProvider>
    );
};

export default AdminDashboard;
