import { Link } from "react-router-dom";

type SidebarAccountItemProps = {
    to: string;
    icon: string;
    label: string;
    onClose: () => void;
};

export default function SidebarAccountItem({ to, icon, label, onClose }: SidebarAccountItemProps) {
    return (
        <li>
            <Link to={to} onClick={onClose}>
                <i className={icon}></i> {label}
            </Link>
        </li>
    );
}
