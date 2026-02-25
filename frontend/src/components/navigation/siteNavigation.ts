export type SitePage = {
    label: string;
    path: string;
    icon: string;
    keywords: string[];
};

export const PUBLIC_PAGES: SitePage[] = [
    { label: "Acas\u0103", path: "/", icon: "fas fa-home", keywords: ["acas\u0103", "home", "\u00EEnceput"] },
    { label: "Teste", path: "/tests", icon: "fas fa-clipboard-check", keywords: ["teste", "quiz", "gril\u0103"] },
    { label: "\u00CEnscriere", path: "/appointment", icon: "fas fa-user-plus", keywords: ["\u00EEnscriere", "programare", "appointment"] },
    { label: "Nout\u0103\u021Bi", path: "/news", icon: "fas fa-newspaper", keywords: ["nout\u0103\u021Bi", "\u0219tiri", "news"] },
    { label: "Suport", path: "/support", icon: "fas fa-life-ring", keywords: ["suport", "ajutor", "help"] },
    { label: "Contact", path: "/contact", icon: "fas fa-address-book", keywords: ["contact", "telefon", "email"] },
];

export const GUEST_PAGES: SitePage[] = [
    { label: "Autentificare", path: "/login", icon: "fas fa-right-to-bracket", keywords: ["login", "autentificare", "cont"] },
    { label: "\u00CEnregistrare", path: "/register", icon: "fas fa-user-plus", keywords: ["\u00EEnregistrare", "register", "cont nou"] },
];

export const USER_PAGES: SitePage[] = [
    { label: "Dashboard", path: "/dashboard", icon: "fas fa-gauge-high", keywords: ["dashboard", "profil", "cont"] },
];

export const ADMIN_PANEL_PAGES: SitePage[] = [
    { label: "Admin Overview", path: "/admin/overview", icon: "fas fa-chart-line", keywords: ["admin", "overview", "rezumat"] },
    { label: "Admin Teste", path: "/admin/tests", icon: "fas fa-vial", keywords: ["admin", "teste", "gestionare"] },
    { label: "Admin Utilizatori", path: "/admin/users", icon: "fas fa-users-cog", keywords: ["admin", "utilizatori", "users"] },
    { label: "Admin Program\u0103ri", path: "/admin/appointments", icon: "fas fa-calendar-days", keywords: ["admin", "program\u0103ri", "appointments"] },
    { label: "Admin Notific\u0103ri", path: "/admin/notifications", icon: "fas fa-bell", keywords: ["admin", "notific\u0103ri", "alerts"] },
];

export function getSearchPages(isAuthenticated: boolean, isAdmin: boolean): SitePage[] {
    if (!isAuthenticated) {
        return [...PUBLIC_PAGES, ...GUEST_PAGES];
    }

    if (isAdmin) {
        return [...PUBLIC_PAGES, ...ADMIN_PANEL_PAGES];
    }

    return [...PUBLIC_PAGES, ...USER_PAGES];
}
