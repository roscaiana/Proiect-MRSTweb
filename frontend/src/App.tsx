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

function ScrollToTop() {
    const { pathname, search } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, [pathname, search]);

    return null;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <ScrollToTop />
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/news" element={<News />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/tests" element={<TestsPage />} />
                        <Route path="/politica-confidentialitate" element={<PrivacyPolicy />} />
                        <Route path="/termeni-conditii" element={<TermsAndConditions />} />
                        <Route path="/appointment" element={<AppointmentPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/dashboard" element={<UserDashboard />} />
                        <Route path="/admin/*" element={<AdminDashboard />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
