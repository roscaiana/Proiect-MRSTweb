type UserStatsCardProps = {
    totalCompletedTests: number;
    averageScore: number;
    passedTests: number;
};

export default function UserStatsCard({ totalCompletedTests, averageScore, passedTests }: UserStatsCardProps) {
    return (
        <div className="dashboard-card stats-card">
            <div className="card-header">
                <h2>Statistici</h2>
            </div>
            <div className="stats-grid">
                <div className="stat-item">
                    <div className="stat-value">{totalCompletedTests}</div>
                    <div className="stat-label">Teste completate</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">{averageScore}%</div>
                    <div className="stat-label">Scor mediu</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">{passedTests}</div>
                    <div className="stat-label">Teste promovate</div>
                </div>
            </div>
        </div>
    );
}
