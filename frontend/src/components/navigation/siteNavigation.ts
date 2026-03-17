export type SitePage = {
    label: string;
    path: string;
    icon: string;
    keywords: string[];
};

export const PUBLIC_PAGES: SitePage[] = [
    { label: "Acasă", path: "/", icon: "fas fa-home", keywords: ["acasă", "home", "început"] },
    { label: "Noutăți", path: "/noutati", icon: "fas fa-newspaper", keywords: ["noutăți", "știri", "news"] },
    { label: "Teste", path: "/tests", icon: "fas fa-clipboard-check", keywords: ["teste", "quiz", "grilă"] },
    { label: "Înscriere", path: "/appointment", icon: "fas fa-user-plus", keywords: ["înscriere", "programare", "appointment"] },
    { label: "Suport", path: "/support", icon: "fas fa-life-ring", keywords: ["suport", "ajutor", "help"] },
    { label: "Contact", path: "/contact", icon: "fas fa-address-book", keywords: ["contact", "telefon", "email"] },
];

export const HEADER_AUTH_PAGES: SitePage[] = PUBLIC_PAGES;

export const GUEST_PAGES: SitePage[] = [
    { label: "Autentificare", path: "/login", icon: "fas fa-right-to-bracket", keywords: ["login", "autentificare", "cont"] },
    { label: "Înregistrare", path: "/register", icon: "fas fa-user-plus", keywords: ["înregistrare", "register", "cont nou"] },
];

export const USER_PAGES: SitePage[] = [
    { label: "Profilul meu", path: "/dashboard", icon: "fas fa-gauge-high", keywords: ["dashboard", "profil", "cont"] },
    { label: "Istoric teste", path: "/test-history", icon: "fas fa-chart-column", keywords: ["istoric", "teste", "rezultate"] },
];

export const ADMIN_PANEL_PAGES: SitePage[] = [
    { label: "Admin Overview", path: "/admin/overview", icon: "fas fa-chart-line", keywords: ["admin", "overview", "rezumat"] },
    { label: "Admin Teste", path: "/admin/tests", icon: "fas fa-vial", keywords: ["admin", "teste", "gestionare"] },
    { label: "Admin Utilizatori", path: "/admin/users", icon: "fas fa-users-cog", keywords: ["admin", "utilizatori", "users"] },
    { label: "Admin Programări", path: "/admin/appointments", icon: "fas fa-calendar-days", keywords: ["admin", "programări", "appointments"] },
    { label: "Admin Notificări", path: "/admin/notifications", icon: "fas fa-bell", keywords: ["admin", "notificări", "alerts"] },
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
