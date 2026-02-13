import { useState } from "react";
import { Outlet } from "react-router-dom";

import TopBar from "../components/TopBar/TopBar";
import Header from "../components/Header/Header";
import Sidebar from "../components/SideBar/SideBar";
import Footer from "../components/Footer/Footer";

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            <TopBar />

            <Header onOpenSidebar={() => setSidebarOpen(true)} />

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