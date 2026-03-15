import { NavLink } from "react-router-dom";

type AdminPanelNavLinkProps = {
    to: string;
    label: string;
    iconClass?: string;
    onClick?: () => void;
    variant: "header" | "sidebar";
};

export default function AdminPanelNavLink({
    to,
    label,
    iconClass,
    onClick,
    variant,
}: AdminPanelNavLinkProps) {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) =>
                variant === "header"
                    ? `admin-app-header-link ${isActive ? "is-active" : ""}`
                    : `admin-nav-item ${isActive ? "is-active" : ""}`
            }
        >
            {variant === "sidebar" && iconClass ? <i className={iconClass}></i> : null}
            <span>{label}</span>
        </NavLink>
    );
}
