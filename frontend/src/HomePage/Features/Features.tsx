import "./Features.css";

export default function Features() {
    const block = (e: React.MouseEvent) => e.preventDefault();

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
                        <a href="#" className="link-arrow" onClick={block}>Citește mai mult &rarr;</a>
                    </div>

                    <div className="feature-box">
                        <div className="icon-wrapper">
                            <i className="fas fa-laptop-code"></i>
                        </div>
                        <h3>Simulatoare Examen</h3>
                        <p>Teste cronometrate care reproduc fidel condițiile de examinare reală. Feedback instantaneu.</p>
                        <a href="#" className="link-arrow" onClick={block}>Începe Test &rarr;</a>
                    </div>

                    <div className="feature-box">
                        <div className="icon-wrapper">
                            <i className="fas fa-chart-line"></i>
                        </div>
                        <h3>Rapoarte de Progres</h3>
                        <p>Monitorizați evoluția cunoștințelor dumneavoastră prin grafice detaliate și istoric de testare.</p>
                        <a href="#" className="link-arrow" onClick={block}>Vezi Rapoarte &rarr;</a>
                    </div>

                    <div className="feature-box">
                        <div className="icon-wrapper">
                            <i className="fas fa-newspaper"></i>
                        </div>
                        <h3>Noutăți Electorale</h3>
                        <p>Cele mai recente informații despre desfășurarea alegerilor și actualizări legislative.</p>
                        <a href="#" className="link-arrow" onClick={block}>Vezi Noutăți &rarr;</a>
                    </div>
                </div>
            </div>
        </section>
    );
}