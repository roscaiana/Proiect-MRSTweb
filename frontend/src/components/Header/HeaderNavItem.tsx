import { NavLink } from "react-router-dom";
import type { SitePage } from "../navigation/siteNavigation";

type HeaderNavItemProps = {
    page: SitePage;
};

export default function HeaderNavItem({ page }: HeaderNavItemProps) {
    return (
        <li>
            <NavLink
                to={page.path}
                end={page.path === "/"}
                className={({ isActive }) =>
                    [isActive ? "active" : "", page.path === "/" ? "home-link" : ""].filter(Boolean).join(" ")
                }
            >
                {page.label}
            </NavLink>
        </li>
    );
}
