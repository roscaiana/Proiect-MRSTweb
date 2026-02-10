import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';


import HomePage from './Pages/HomePage';
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/RegisterPage';
import UserDashboard from './Pages/UserDashboard';
import AdminDashboard from './Pages/AdminDashboard';
import AppointmentPage from './Pages/AppointmentPage';
import TestsPage from './Pages/TestsPage';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Homepage existent */}
                    <Route path="/" element={<HomePage />} />

                    {/* Autentificare */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Rute protejate pentru utilizatori */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <UserDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/appointment"
                        element={
                            <ProtectedRoute>
                                <AppointmentPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/tests"
                        element={
                            <ProtectedRoute>
                                <TestsPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Rută pentru admin */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute adminOnly>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;