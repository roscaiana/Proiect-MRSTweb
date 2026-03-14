import { Link } from "react-router-dom";

type ErrorActionButtonProps = {
    label: string;
    to?: string;
    onClick?: () => void;
    variant?: "primary" | "outline";
};

export default function ErrorActionButton({ label, to, onClick, variant }: ErrorActionButtonProps) {
    const className = `btn ${variant === "outline" ? "btn-outline" : "btn-primary"}`;

    if (to) {
        return (
            <Link to={to} className={className}>
                {label}
            </Link>
        );
    }

    return (
        <button type="button" className={className} onClick={onClick}>
            {label}
        </button>
    );
}
