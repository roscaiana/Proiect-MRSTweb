import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import TopBar from "../components/TopBar/TopBar";
import Header from "../components/Header/Header";
import Sidebar from "../components/SideBar/SideBar";
import Footer from "../components/Footer/Footer";
import { useScrollLock } from "../hooks/useScrollLock";

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    useScrollLock(sidebarOpen);

    return (
        <>
            <TopBar />

            <Header onOpenSidebar={() => setSidebarOpen(true)} isSidebarOpen={sidebarOpen} />

            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main>
                <Outlet />
            </main>

            <Footer />
        </>
    );
}
