import { useState } from "react";

import TopBar from "../HomePage/TopBar/TopBar";
import Header from "../HomePage/Header/Header";
import Sidebar from "../HomePage/SideBar/SideBar";
import Hero from "../HomePage/Hero/Hero";
import About from "../HomePage/About/About";
import Features from "../HomePage/Features/Features";
import Info from "../HomePage/Info/Info";
import Stats from "../HomePage/Stats/Stats";
import Footer from "../HomePage/Footer/Footer";
export default function HomePage() {
    const [open, setOpen] = useState(false);

    const openSidebar = () => {
        setOpen(true);
        document.body.style.overflow = "hidden";
    };

    const closeSidebar = () => {
        setOpen(false);
        document.body.style.overflow = "";
    };

    return (
        <>
            <TopBar />
            <Header onOpenSidebar={openSidebar} />
            <Sidebar open={open} onClose={closeSidebar} />

            <main>
                <Hero />
                <About />
                <Features />
                <Info />
                <Stats />
            </main>

            <Footer />
        </>
    );
}
