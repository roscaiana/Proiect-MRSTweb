import "./container.css";
import aboutVisual from "../../../assets/about-visual.png";

export default function About() {
    return (
        <section className="section-about">
            <div className="container about-grid">
                <div className="about-content">
                    <h2>Despre Noi</h2>
                    <div className="separator-small"></div>
                    <p>
                        Platforma e-Electoral este soluția oficială dedicată profesionalizării procesului electoral.
                        Oferim funcționarilor electorali și părților interesate acces gratuit la resurse de instruire,
                        actualizări legislative și certificare digitală.
                    </p>

                    <p>
                        Platforma e-Electoral este soluția digitală dedicată organizării procesului de formare și certificare
                        a funcționarilor electorali, în conformitate cu cadrul normativ în vigoare. Activitatea noastră se
                        desfășoară în baza Regulamentului privind certificarea formării/specializării în domeniul electoral,
                        aprobat prin Hotărârea Comisiei Electorale Centrale nr. 3413/2025, precum și a prevederilor noului Cod
                        Electoral, care stabilește obligativitatea certificării tuturor funcționarilor electorali. Prin această
                        platformă, susținem profesionalizarea continuă și consolidarea integrității procesului electoral.
                    </p>
                </div>

                <img src={aboutVisual} alt="Despre Noi" className="about-visual" />
            </div>
        </section>
    );
}
