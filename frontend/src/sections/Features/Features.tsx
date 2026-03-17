import { Link } from "react-router-dom";
import "./Features.css";

export default function Features() {
    return (
        <section className="section-features">
            <div className="container">
                <div className="section-header text-center">
                    <h2>Resurse pentru Candidați</h2>
                    <div className="separator"></div>
                    <p>Instrumente moderne pentru o pregătire eficientă și riguroasă.</p>
                </div>

                <div className="features-grid">
                    <div className="feature-box">
                        <div className="icon-wrapper">
                            <i className="fas fa-book-reader"></i>
                        </div>
                        <h3>Materiale Legislative</h3>
                        <p>Acces direct la Codul Electoral și regulamentele conexe, actualizate la zi pentru sesiunea curentă.</p>
                        <Link to="/materiale-legislative" className="link-arrow">Citește mai mult &rarr;</Link>
                    </div>

                    <div className="feature-box">
                        <div className="icon-wrapper">
                            <i className="fas fa-laptop-code"></i>
                        </div>
                        <h3>Simulare Examen</h3>
                        <p>Teste cronometrate care reproduc fidel condițiile de examinare reală. Feedback instantaneu.</p>
                        <Link to="/tests" className="link-arrow">Începe Test &rarr;</Link>
                    </div>

                    <div className="feature-box">
                        <div className="icon-wrapper">
                            <i className="fas fa-chart-line"></i>
                        </div>
                        <h3>Rapoarte de Progres</h3>
                        <p>Monitorizați evoluția cunoștințelor dumneavoastră prin grafice detaliate și istoric de testare.</p>
                        <Link to="/dashboard" className="link-arrow">Vezi Rapoarte &rarr;</Link>
                    </div>

                    <div className="feature-box">
                        <div className="icon-wrapper">
                            <i className="fas fa-newspaper"></i>
                        </div>
                        <h3>Noutăți Electorale</h3>
                        <p>Cele mai recente informații despre desfășurarea alegerilor și actualizări legislative.</p>
                            <Link to="/noutati" className="link-arrow">Vezi Noutăți &rarr;</Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
