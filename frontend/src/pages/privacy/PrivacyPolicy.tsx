import { Link } from "react-router-dom";
import "./PrivacyPolicy.css";

export default function PrivacyPolicy() {
    return (
        <div className="privacy-page">
            <section className="privacy-hero">
                <div className="container privacy-hero-content">
                    <h1>Politică de confidențialitate</h1>
                    <p>
                        Informații esențiale despre date cu caracter personal și utilizarea platformei e-Electoral.
                    </p>
                </div>
            </section>

            <main className="container privacy-main">
                <article className="privacy-card">
                    <section className="privacy-section">
                        <h2>Date cu caracter personal</h2>
                        <h3>Prelucrarea datelor cu caracter personal</h3>
                        <p>
                            Conform Legii nr. 133 din 08.07.2011 privind protecția datelor cu caracter personal,
                            date cu caracter personal constituie orice informație referitoare la o persoană fizică
                            identificată sau identificabilă (subiect al datelor cu caracter personal). Persoana
                            identificabilă este persoana care poate fi identificată, direct sau indirect, prin
                            referire la un număr de identificare sau la unul ori mai multe elemente specifice
                            identității sale fizice, fiziologice, psihice, economice, culturale sau sociale.
                        </p>
                    </section>

                    <p className="privacy-highlight">
                        ACEST SITE NU COLECTEAZĂ INFORMAȚII PERSONALE DESPRE UTILIZATORI!
                    </p>

                    <section className="privacy-section">
                        <h3>Principii de confidențialitate</h3>
                        <ul className="privacy-list">
                            <li><strong>Transparență:</strong> explicăm clar ce informații sunt afișate și în ce scop.</li>
                            <li><strong>Minimizare:</strong> evităm solicitarea de date care nu sunt necesare.</li>
                            <li><strong>Securitate:</strong> aplicăm măsuri tehnice pentru protejarea conținutului platformei.</li>
                            <li><strong>Limitarea scopului:</strong> informațiile publice sunt folosite doar pentru funcționarea site-ului.</li>
                        </ul>
                    </section>

                    <section className="privacy-section">
                        <h3>Drepturile utilizatorilor</h3>
                        <ul className="privacy-list">
                            <li>Dreptul la informare privind modul de utilizare a conținutului din platformă.</li>
                            <li>Dreptul la clarificări atunci când apar neconcordanțe sau nelămuriri.</li>
                            <li>Dreptul de a solicita îndrumare prin canalele de suport disponibile.</li>
                        </ul>
                        <p>
                            Dacă observi conținut neclar sau ai nevoie de clarificări privind protecția datelor,
                            echipa noastră te poate ghida prin pagina de suport.
                        </p>
                    </section>

                    <div className="privacy-support-box">
                        <p>
                            Dacă ai nevoie de ajutor, mergi pe pagina de suport pentru asistență rapidă.
                        </p>
                        <Link to="/support" className="privacy-support-link">
                            Mergi la Suport
                        </Link>
                    </div>
                </article>
            </main>
        </div>
    );
}
