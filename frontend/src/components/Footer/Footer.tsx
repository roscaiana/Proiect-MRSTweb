import { useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import { APP_ROUTES } from "../../routes/appRoutes";
import { contactService } from "../../services";

export default function Footer() {
    const [subscriberEmail, setSubscriberEmail] = useState("");
    const [subscriptionStatus, setSubscriptionStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
    const [subscriptionMessage, setSubscriptionMessage] = useState("");

    const handleSubscribe = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const email = subscriberEmail.trim();

        if (!email) {
            setSubscriptionStatus("error");
            setSubscriptionMessage("Introduceți adresa de email.");
            return;
        }

        setSubscriptionStatus("sending");
        setSubscriptionMessage("");

        try {
            const result = await contactService.send({
                name: "Abonare noutăți",
                email,
                subject: "Abonare la noutăți e-Electoral",
                message: `Utilizatorul cu emailul ${email} dorește să se aboneze la noutățile e-Electoral.`,
            });

            if (!result.isSuccess) {
                throw new Error(result.message || "Abonarea nu a putut fi trimisă.");
            }

            setSubscriberEmail("");
            setSubscriptionStatus("success");
            setSubscriptionMessage("Cererea de abonare a fost trimisă.");
        } catch (error) {
            setSubscriptionStatus("error");
            setSubscriptionMessage(error instanceof Error ? error.message : "Abonarea nu a putut fi trimisă.");
        }
    };

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
                    <form className="subscribe-form" onSubmit={handleSubscribe}>
                        <input
                            type="email"
                            placeholder="Email-ul dumneavoastră"
                            value={subscriberEmail}
                            onChange={(event) => {
                                setSubscriberEmail(event.target.value);
                                if (subscriptionStatus !== "sending") {
                                    setSubscriptionStatus("idle");
                                    setSubscriptionMessage("");
                                }
                            }}
                            disabled={subscriptionStatus === "sending"}
                        />
                        <button type="submit" aria-label="Trimite" disabled={subscriptionStatus === "sending"}>
                            <i className={subscriptionStatus === "sending" ? "fas fa-spinner fa-spin" : "fas fa-paper-plane"} />
                        </button>
                    </form>
                    {subscriptionMessage && (
                        <p className={`subscribe-message ${subscriptionStatus === "error" ? "error" : "success"}`}>
                            {subscriptionMessage}
                        </p>
                    )}
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
