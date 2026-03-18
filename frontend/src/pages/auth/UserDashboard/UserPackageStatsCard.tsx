import { Link } from "react-router-dom";
import type { PackagePerformanceItem } from "./useUserDashboardController";
import UserPackagePerformanceColumn from "./UserPackagePerformanceColumn";

type UserPackageStatsCardProps = {
    packagePerformance: PackagePerformanceItem[];
    overallPassRate: number;
    bestPackage: PackagePerformanceItem | null;
};

export default function UserPackageStatsCard({ packagePerformance, overallPassRate, bestPackage }: UserPackageStatsCardProps) {
    return (
        <div className="dashboard-card history-card">
            <div className="card-header">
                <h2>Statistică pe pachete</h2>
                <Link to="/test-history" className="card-action">Vezi toate -&gt;</Link>
            </div>

            {packagePerformance.length > 0 ? (
                <div className="dashboard-history-trend">
                    <div className="dashboard-history-trend-header">
                        <div>
                            <h3>Performanță pe pachete</h3>
                            <p className="dashboard-history-trend-subtitle">Media scorurilor pe fiecare pachet de întrebări</p>
                        </div>
                        <div className="dashboard-trend-summary">
                            <span className="dashboard-trend-chip">Pachete {packagePerformance.length}</span>
                            <span className="dashboard-trend-chip">Promovare {overallPassRate}%</span>
                            {bestPackage && <span className="dashboard-trend-chip package-best">Top: {bestPackage.shortName} ({bestPackage.averageScore}%)</span>}
                        </div>
                    </div>
                    <div className="dashboard-package-chart" role="img" aria-label="Performanță pe pachete de întrebări">
                        <div className="dashboard-package-grid">
                            {packagePerformance.map((pack) => (
                                <UserPackagePerformanceColumn
                                    key={pack.name}
                                    name={pack.name}
                                    shortName={pack.shortName}
                                    averageScore={pack.averageScore}
                                    passRate={pack.passRate}
                                    attempts={pack.attempts}
                                    isGood={pack.isGood}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="empty-state">
                    <p>Nu ai încă rezultate pentru statistică.</p>
                    <Link to="/tests" className="btn-primary">Începe un test</Link>
                </div>
            )}
        </div>
    );
}
