import "./Footer.css";

export default function Footer() {
    const block = (e: React.MouseEvent) => e.preventDefault();

    return (
        <footer className="main-footer">
            <div className="container footer-grid">
                <div className="footer-col branding">
                    <h3>e-Electoral</h3>
                    <p>
                        Platforma educațională pentru pregătirea<br />
                        în vederea susținerii examenului de certificare<br />
                        în domeniul electoral.<br /><br />
                    </p>
                    <p className="address">Chișinău, Republica Moldova</p>

                    <div className="social-links">
                        
                        
                    </div>
                </div>

               
                <div className="footer-col newsletter">
                    <h4>Abonare Noutăți</h4>
                    <p>Primiți ultimele actualizări legislative direct pe email.</p>

                    <form className="subscribe-form" onSubmit={(e) => e.preventDefault()}>
                        <input type="email" placeholder="Email-ul dumneavoastră" />
                        <button type="submit"><i className="fas fa-paper-plane"></i></button>
                    </form>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container text-center">
                    <p>&copy; 2026 e-Electoral. Toate drepturile rezervate. Dezvoltat pentru CICDE.</p>
                </div>
            </div>
        </footer>
    );
}