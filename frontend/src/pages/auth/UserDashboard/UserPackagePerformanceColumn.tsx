import type { CSSProperties } from "react";

type UserPackagePerformanceColumnProps = {
    name: string;
    shortName: string;
    averageScore: number;
    passRate: number;
    attempts: number;
    isGood: boolean;
};

export default function UserPackagePerformanceColumn({
    name,
    shortName,
    averageScore,
    passRate,
    attempts,
    isGood,
}: UserPackagePerformanceColumnProps) {
    return (
        <div
            className="dashboard-package-column"
            title={`${name}: medie ${averageScore}%, promovare ${passRate}% (${attempts} încercări)`}
            style={{ "--package-bar-color": "#f1c40f" } as CSSProperties}
        >
            <span className={`dashboard-package-value ${isGood ? "good" : "needs-work"}`}>{averageScore}%</span>
            <div className="dashboard-package-rail" aria-hidden="true">
                <div
                    className={`dashboard-package-fill ${isGood ? "good" : "needs-work"}`}
                    style={{ height: `${Math.max(8, Math.min(100, averageScore))}%` }}
                />
            </div>
            <span className="dashboard-package-name">{shortName}</span>
            <span className="dashboard-package-meta">{passRate}% | {attempts} înc.</span>
        </div>
    );
}
