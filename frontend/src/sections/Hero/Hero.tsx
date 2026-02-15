import { useNavigate } from 'react-router-dom';
import "./Hero.css";

export default function Hero() {
    const navigate = useNavigate();
    return (
        <section className="hero-complex">
            <div className="hero-bg-pattern"></div>

            <div className="container hero-grid">
                <div className="hero-text-content hero-pad-left">
                    <div className="badge-new">
                        <i className="fas fa-star"></i> Sesiunea Oficială 2026
                    </div>

                    <h1 className="hero-title-main">
                        Excelență în <br />Procesul Electoral
                    </h1>

                    <p className="lead">
                        Accesați platforma unică acreditată pentru pregătirea și certificarea funcționarilor electorali.
                        Transparență totală și acces gratuit la resurse educaționale.
                    </p>

                    <div className="hero-buttons">
                        <button className="btn btn-lg btn-warning" type="button" onClick={() => navigate('/tests')}>
                            Începe Simularea <i className="fas fa-arrow-right"></i>
                        </button>
                    </div>

                    <div className="hero-stats-row">
                        <div className="mini-stat">
                            <strong>12+</strong>
                            <span>Module</span>
                        </div>
                        <div className="mini-stat">
                            <strong>99+</strong>
                            <span>Întrebări</span>
                        </div>
                        <div className="mini-stat">
                            <strong>100%</strong>
                            <span>Gratuit</span>
                        </div>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="glass-certification-card">
                        <div className="glass-body">
                            <div className="card-logo-wrap">
                                <svg viewBox="0 0 100 100" className="svg-logo-card">
                                    <defs>
                                        <linearGradient id="goldGradientCard" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: "#f1c40f", stopOpacity: 1 }} />
                                            <stop offset="100%" style={{ stopColor: "#b7950b", stopOpacity: 1 }} />
                                        </linearGradient>
                                    </defs>
                                    <path d="M50 5 L90 25 V75 L50 95 L10 75 V25 L50 5 Z" fill="#003366" stroke="white" strokeWidth="2" />
                                    <path d="M50 20 L80 35 V65 L50 80 L20 65 V35 L50 20 Z" fill="none" stroke="url(#goldGradientCard)" strokeWidth="3" />
                                    <text x="50" y="62" textAnchor="middle" fill="white" fontSize="34" fontFamily="Inter, sans-serif" fontWeight="bold">
                                        E
                                    </text>
                                </svg>
                            </div>

                            <h3>Certificare Oficială</h3>
                            <p>Standarde de examinare aliniate la normele 2026</p>

                            <div className="approval-badge">
                                <i className="fas fa-check-circle"></i> Aprobat CICDE
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}