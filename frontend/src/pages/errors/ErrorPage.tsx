import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearSimulatedServerError } from "../../utils/serverErrorSimulation";
import "./ErrorPage.css";

type ErrorAction = {
    label: string;
    to?: string;
    onClick?: () => void;
    variant?: "primary" | "outline";
};

type ErrorPageProps = {
    code: string;
    title: string;
    description: string;
    hint?: string;
    actions: ErrorAction[];
};

const ErrorPage: React.FC<ErrorPageProps> = ({ code, title, description, hint, actions }) => {
    return (
        <section className="error-page">
            <div className="container">
                <div className="error-card">
                    <div className="error-code">{code}</div>
                    <h1 className="error-title">{title}</h1>
                    <p className="error-description">{description}</p>
                    {hint && <p className="error-hint">{hint}</p>}
                    <div className="error-actions">
                        {actions.map((action) => {
                            const className = `btn ${action.variant === "outline" ? "btn-outline" : "btn-primary"}`;
                            if (action.to) {
                                return (
                                    <Link key={action.label} to={action.to} className={className}>
                                        {action.label}
                                    </Link>
                                );
                            }
                            return (
                                <button key={action.label} type="button" className={className} onClick={action.onClick}>
                                    {action.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export const UnauthorizedPage: React.FC = () => (
    <ErrorPage
        code="401"
        title="Autentificare necesară"
        description="Trebuie să fii autentificat pentru a accesa această pagină."
        actions={[
            { label: "Autentificare", to: "/login", variant: "primary" },
            { label: "Acasă", to: "/", variant: "outline" },
        ]}
    />
);

export const ForbiddenPage: React.FC = () => (
    <ErrorPage
        code="403"
        title="Acces interzis"
        description="Nu ai permisiuni suficiente pentru această acțiune."
        actions={[
            { label: "Profilul meu", to: "/dashboard", variant: "primary" },
            { label: "Acasă", to: "/", variant: "outline" },
        ]}
    />
);

export const NotFoundPage: React.FC = () => (
    <ErrorPage
        code="404"
        title="Pagina nu a fost găsită"
        description="Linkul nu mai există sau pagina a fost mutată."
        actions={[{ label: "Înapoi acasă", to: "/", variant: "primary" }]}
    />
);

export const ServerErrorPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <ErrorPage
            code="500"
            title="Eroare internă"
            description="A apărut o problemă neașteptată. Încearcă din nou sau revino mai târziu."
            hint="Dacă ai activat simularea, resetează eroarea și încearcă din nou."
            actions={[
                { label: "Înapoi acasă", to: "/", variant: "primary" },
                {
                    label: "Resetează simularea",
                    variant: "outline",
                    onClick: () => {
                        clearSimulatedServerError();
                        navigate("/", { replace: true });
                    },
                },
            ]}
        />
    );
};

export default ErrorPage;
