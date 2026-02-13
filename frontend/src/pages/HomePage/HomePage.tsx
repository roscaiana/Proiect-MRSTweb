import Hero from "../../sections/Hero/Hero";
import Features from "../../sections/Features/Features";
import Stats from "../../sections/Stats/Stats";
import Container from "./container/container";
import Info from "./Info/Info";

export default function HomePage() {
    return (
        <>
            <Hero />
            <Container />
            <Features />
            <Info />
            <Stats />
        </>
    );
}