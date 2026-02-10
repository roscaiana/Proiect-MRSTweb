import "./Info.css";
import { useMemo, useState } from "react";

export default function Info() {
    const steps = useMemo(
        () => [
            { nr: "01", title: "Înregistrare", desc: "Crearea contului de candidat" },
            { nr: "02", title: "Instruire", desc: "Parcurgerea modulelor" },
            { nr: "03", title: "Certificare", desc: "Susținerea examenului final" },
        ],
        []
    );

    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const onMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const w = rect.width;

        let idx = Math.floor((x / w) * steps.length);
        idx = Math.max(0, Math.min(idx, steps.length - 1));
        setActiveIndex(idx);
    };

    const onLeave = () => setActiveIndex(null);

    return (
        <section className="section-info">
            <div className="container split-layout">
                <div className="process-visual-card" onMouseMove={onMove} onMouseLeave={onLeave}>
                    <div className="timeline-inner">
                        {steps.map((s, i) => (
                            <div className={`step-item ${activeIndex === i ? "active-step" : ""}`} key={s.nr}>
                                <div className="step-number">{s.nr}</div>
                                <div className="step-details">
                                    <h5>{s.title}</h5>
                                    <p>{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="info-content">
                    <h2>Procesul de Certificare</h2>
                    <div className="separator-small"></div>

                    <p>
                        Certificarea funcționarilor electorali este un pas esențial în asigurarea
                        unor alegeri libere și corecte. Platforma e-Electoral oferă cadrul necesar pentru:
                        <br /><br />
                    </p>

                    <ul className="styled-list">
                        <li><i className="fas fa-check-circle"></i> Însușirea procedurilor de votare</li>
                        <li><i className="fas fa-check-circle"></i> Gestionarea situațiilor de criză</li>
                        <li><i className="fas fa-check-circle"></i> Numărarea corectă a voturilor</li>
                        <li><i className="fas fa-check-circle"></i> Utilizarea SIAS Alegeri</li>
                    </ul>

                    <button className="btn btn-primary mt-4" type="button">
                        Descarcă Metodologia
                    </button>
                </div>
            </div>
        </section>
    );
}