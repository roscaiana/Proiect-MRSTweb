import { useState } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { BookOpenText, CircleAlert, Gavel, ShieldCheck } from "lucide-react";
import TermsAccordionItem from "./TermsAccordionItem";
import TermsLegalChip from "./TermsLegalChip";
import TermsPrincipleCard from "./TermsPrincipleCard";
import { APP_ROUTES } from "../../routes/appRoutes";
import "./TermsAndConditions.css";

type TermsSection = {
    id: string;
    title: string;
    summary: string;
    points: string[];
    note?: string;
};

type TermsPrinciple = {
    title: string;
    description: string;
    icon: LucideIcon;
};

const LEGAL_REFERENCES = [
    "Codul electoral al Republicii Moldova",
    "Legea nr. 133/2011 privind protecția datelor cu caracter personal",
    "Actele normative și hotărârile CEC/CICDE aplicabile instruirii electorale",
];

const TERMS_PRINCIPLES: TermsPrinciple[] = [
    {
        title: "Utilizare responsabilă",
        description: "Platforma este destinată exclusiv instruirii și pregătirii în domeniul electoral.",
        icon: BookOpenText,
    },
    {
        title: "Protecția utilizatorilor",
        description: "Păstrăm un mediu sigur și interzicem comportamentele abuzive sau tentativele de fraudă.",
        icon: ShieldCheck,
    },
    {
        title: "Transparență",
        description: "Explicăm clar cum funcționează programările, conturile și limitele platformei.",
        icon: CircleAlert,
    },
];

const TERMS_SECTIONS: TermsSection[] = [
    {
        id: "scop",
        title: "Scopul platformei și aria de utilizare",
        summary: "Pentru ce este creat e-Electoral și ce tip de conținut oferă.",
        points: [
            "e-Electoral oferă materiale de studiu, teste de antrenament și funcționalități de programare pentru evaluări în domeniul electoral.",
            "Conținutul are caracter educațional și informativ; nu substituie consultanța juridică individuală.",
            "Informațiile publicate trebuie utilizate în acord cu legislația aplicabilă din Republica Moldova.",
        ],
    },
    {
        id: "cont",
        title: "Cont utilizator, autentificare și securitate",
        summary: "Reguli pentru crearea contului și folosirea în siguranță a accesului.",
        points: [
            "Datele introduse la autentificare trebuie să fie corecte, actuale și să aparțină persoanei care utilizează contul.",
            "Utilizatorul este responsabil de confidențialitatea credențialelor sale și de activitatea realizată prin cont.",
            "Este interzisă partajarea contului sau accesarea neautorizată a conturilor altor persoane.",
        ],
        note: "Dacă suspectezi acces neautorizat, schimbă imediat parola și contactează echipa de suport.",
    },
    {
        id: "programari",
        title: "Programări și utilizarea funcționalităților de înscriere",
        summary: "Cum se folosesc formularele și ce obligații are utilizatorul la programare.",
        points: [
            "Programările trebuie completate integral și corect înainte de confirmare.",
            "Datele de contact oferite la înscriere sunt folosite strict pentru comunicarea legată de programare.",
            "În cazul erorilor de completare, utilizatorul trebuie să reia procesul pentru a evita înregistrări incomplete.",
        ],
    },
    {
        id: "conduita",
        title: "Conduită și limitări de utilizare",
        summary: "Comportamente permise și interdicții în utilizarea serviciului.",
        points: [
            "Este interzisă copierea automată masivă a conținutului, atacarea platformei sau încercarea de a o destabiliza.",
            "Nu este permisă folosirea site-ului pentru activități ilegale, defăimătoare sau care afectează drepturile altor utilizatori.",
            "Ne rezervăm dreptul de a limita accesul în caz de utilizare abuzivă ori nerespectarea termenilor.",
        ],
    },
    {
        id: "date",
        title: "Confidențialitate și date personale",
        summary: "Principii aplicate pentru protejarea informațiilor utilizatorilor.",
        points: [
            "Tratăm datele personale conform principiilor de legalitate, minimizare și transparență.",
            "Datele furnizate prin formulare sunt utilizate doar în scopurile declarate în platformă.",
            "Pentru detalii suplimentare, se aplică și pagina dedicată Politicii de confidențialitate.",
        ],
    },
    {
        id: "proprietate",
        title: "Proprietate intelectuală",
        summary: "Drepturi asupra materialelor publicate în platformă.",
        points: [
            "Textele, grafica, identitatea vizuală și structura platformei sunt protejate de legislația privind proprietatea intelectuală.",
            "Reproducerea, distribuirea sau modificarea conținutului fără acord prealabil este interzisă.",
            "Utilizarea limitată în scop educațional este permisă doar cu menționarea sursei, atunci când legea permite expres.",
        ],
    },
    {
        id: "raspundere",
        title: "Disponibilitate tehnică și limitarea răspunderii",
        summary: "Ce se întâmplă în caz de indisponibilitate ori erori tehnice.",
        points: [
            "Serviciul este oferit în forma disponibilă la momentul utilizării, cu actualizări periodice pentru îmbunătățire.",
            "Pot exista întreruperi temporare pentru mentenanță, actualizări sau motive tehnice neprevăzute.",
            "Nu garantăm lipsa absolută a erorilor, dar depunem eforturi rezonabile pentru corectare rapidă.",
        ],
    },
    {
        id: "lege",
        title: "Legea aplicabilă și modificarea termenilor",
        summary: "Reguli privind actualizarea termenilor și cadrul legal.",
        points: [
            "Acești termeni sunt interpretați conform legislației Republicii Moldova.",
            "Putem actualiza conținutul termenilor pentru a reflecta modificări legislative sau funcționale ale platformei.",
            "Continuarea utilizării platformei după publicarea modificărilor reprezintă acceptarea noilor condiții.",
        ],
        note: "Recomandăm consultarea periodică a acestei pagini pentru cea mai recentă versiune.",
    },
];

export default function TermsAndConditions() {
    const [openSectionId, setOpenSectionId] = useState<string | null>(null);

    const toggleSection = (sectionId: string) => {
        setOpenSectionId((current) => (current === sectionId ? null : sectionId));
    };

    return (
        <div className="terms-page">
            <section className="terms-hero">
                <div className="terms-overlay-1"></div>
                <div className="terms-overlay-2"></div>

                <div className="container terms-hero-content">
                    <div className="page-hero-badge">
                        <span className="page-hero-badge-icon" aria-hidden="true">
                            <Gavel />
                        </span>
                        <span>Termeni și condiții e-Electoral</span>
                    </div>
                    <h1>Termeni și condiții</h1>
                    <p>
                        Acest document stabilește regulile de utilizare a platformei e-Electoral pentru instruire,
                        testare și programări în domeniul electoral. Conținutul este adaptat specificului activităților
                        de educație electorală din Republica Moldova.
                    </p>
                    <p className="terms-updated">Ultima actualizare: 24 februarie 2026</p>
                </div>
            </section>

            <main className="container terms-main">
                <section className="terms-principles" aria-label="Principii esențiale">
                    {TERMS_PRINCIPLES.map((principle) => (
                        <TermsPrincipleCard
                            key={principle.title}
                            title={principle.title}
                            description={principle.description}
                            icon={principle.icon}
                        />
                    ))}
                </section>

                <section className="terms-legal-box" aria-label="Bază legală relevantă">
                    <h2>Bază legală relevantă în Republica Moldova</h2>
                    <div className="terms-legal-chips">
                        {LEGAL_REFERENCES.map((reference) => (
                            <TermsLegalChip key={reference} reference={reference} />
                        ))}
                    </div>
                </section>

                <section className="terms-accordion-wrapper" aria-label="Detalii termeni">
                    <h2 className="terms-accordion-heading">Detalii de utilizare</h2>
                    <div className="terms-accordion">
                        {TERMS_SECTIONS.map((section) => (
                            <TermsAccordionItem
                                key={section.id}
                                section={section}
                                isOpen={openSectionId === section.id}
                                onToggle={toggleSection}
                            />
                        ))}
                    </div>
                </section>

                <section className="terms-help-box" aria-label="Asistență">
                    <div className="terms-help-content">
                        <h2>Ai nevoie de clarificări?</h2>
                        <p>
                            Pentru întrebări despre termeni, funcționalități sau programări, folosește pagina de suport.
                            Dacă ai o solicitare specifică, ne poți contacta direct din pagina de contact.
                        </p>
                    </div>
                    <div className="terms-help-actions">
                        <Link to={APP_ROUTES.support} className="terms-btn terms-btn-primary">
                            Mergi la Suport
                        </Link>
                        <Link to={APP_ROUTES.contact} className="terms-btn terms-btn-primary">
                            Contactează-ne
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
