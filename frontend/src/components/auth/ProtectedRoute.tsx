import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactElement;
    adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
    const { isAuthenticated, isAdmin } = useAuth();

    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin) {
        // Redirect to user dashboard if trying to access admin-only route
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
