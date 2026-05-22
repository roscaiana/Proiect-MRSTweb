import { Link } from "react-router-dom";
import "./Footer.css";
import { APP_ROUTES } from "../../routes/appRoutes";

export default function Footer() {
    const stopSubmit = (e: React.FormEvent<HTMLFormElement>) => e.preventDefault();

    return (
        <footer className="main-footer">
            <div className="container footer-grid">
                <div className="footer-col branding">
                    <h3>e-Electoral</h3>
                    <p className="footer-text">
                        Platforma educațională pentru pregătirea
                        <br />
                        în vederea susținerii examenului de certificare
                        <br />
                        în domeniul electoral.
                    </p>
                    <p className="footer-address">
                        Chișinău, Republica Moldova
                    </p>
                    <div className="social-links">
                        <a
                            href="https://www.facebook.com/CICDE?locale=ro_RO"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Facebook"
                        >
                            <i className="fab fa-facebook-f" />
                        </a>
                        <a
                            href="https://www.linkedin.com/company/the-centre-for-continuous-electoral-training-moldova/"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="LinkedIn"
                        >
                            <i className="fab fa-linkedin-in" />
                        </a>
                        <a
                            href="https://www.youtube.com/@CentrulCICDE"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="YouTube"
                        >
                            <i className="fab fa-youtube" />
                        </a>
                    </div>
                </div>
                <div className="footer-col">
                    <h4>Linkuri Rapide</h4>
                    <ul className="footer-links">
                        <li>
                            <Link to={APP_ROUTES.terms}>
                                Termeni și Condiții
                            </Link>
                        </li>
                        <li>
                            <Link to={APP_ROUTES.privacy}>
                                Politică de confidențialitate
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className="footer-col">
                    <h4>Resurse</h4>
                    <ul className="footer-links">
                        <li>
                            <Link to={APP_ROUTES.support}>
                                Întrebări frecvente / Suport
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className="footer-col newsletter">
                    <h4>Abonare Noutăți</h4>
                    <p className="footer-text">
                        Primiți ultimele actualizări legislative direct pe email.
                    </p>
                    <form className="subscribe-form" onSubmit={stopSubmit}>
                        <input
                            type="email"
                            placeholder="Email-ul dumneavoastră"
                        />
                        <button type="submit" aria-label="Trimite">
                            <i className="fas fa-paper-plane" />
                        </button>
                    </form>
                </div>
            </div>
            <div className="footer-divider"></div>
            <div className="footer-bottom">
                <div className="container text-center">
                    <p>
                        &copy; 2026 e-Electoral. Toate drepturile rezervate. Dezvoltat pentru CICDE.
                    </p>
                </div>
            </div>
        </footer>
    );
}
