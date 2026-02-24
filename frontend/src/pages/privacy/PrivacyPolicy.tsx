import './PrivacyPolicy.css';

export default function PrivacyPolicy() {
    return (
        <div className="privacy-page">
            <section className="privacy-hero">
                <div className="container privacy-hero-content">
                    <h1>Politică și confidențialitate</h1>
                    <p>
                        Informații scurte despre modul în care sunt tratate datele în platforma e-Electoral.
                    </p>
                </div>
            </section>

            <main className="container privacy-main">
                <article className="privacy-card">
                    <h2>Date cu caracter personal</h2>
                    <h3>Prelucrarea datelor cu caracter personal</h3>
                    <p>
                        Conform Legii nr. 133 din 08.07.2011 privind protecția datelor cu caracter personal,
                        datele cu caracter personal constituie orice informație referitoare la o persoană
                        fizică identificată sau identificabilă (subiect al datelor cu caracter personal).
                        Persoana identificabilă este persoana care poate fi identificată, direct sau
                        indirect, prin referire la un număr de identificare sau la unul ori mai multe
                        elemente specifice identității sale fizice, fiziologice, psihice, economice,
                        culturale sau sociale.
                    </p>

                    <p className="privacy-highlight">
                        ACEST SITE NU COLECTEAZĂ INFORMAȚII PERSONALE DESPRE UTILIZATORI!
                    </p>
                </article>
            </main>
        </div>
    );
}

