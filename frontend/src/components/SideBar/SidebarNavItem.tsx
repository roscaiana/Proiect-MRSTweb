import { NavLink } from "react-router-dom";
import type { SitePage } from "../navigation/siteNavigation";

type SidebarNavItemProps = {
    page: SitePage;
    onClose: () => void;
};

export default function SidebarNavItem({ page, onClose }: SidebarNavItemProps) {
    return (
        <li>
            <NavLink
                to={page.path}
                end={page.path === "/"}
                onClick={onClose}
                className={({ isActive }) => (isActive ? "active" : "")}
            >
                <i className={page.icon}></i>
                {page.label}
            </NavLink>
        </li>
    );
}
