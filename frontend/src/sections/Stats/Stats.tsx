import "./Stats.css";export default function Stats() {
    return (
        <section className="section-stats-dark">
            <div className="container flex-between stats-row">
                <div className="stat-block">
                    <div className="number">1500+</div>
                    <div className="label">Utilizatori Activi</div>
                </div>

                <div className="divider-vertical"></div>

                <div className="stat-block">
                    <div className="number">70%</div>
                    <div className="label">Rată de Promovare</div>
                </div>

                <div className="divider-vertical"></div>

                <div className="stat-block">
                    <div className="number">35</div>
                    <div className="label">Circumscripții</div>
                </div>

                <div className="divider-vertical"></div>

                <div className="stat-block">
                    <div className="number">24h</div>
                    <div className="label">Suport Online</div>
                </div>
            </div>
        </section>
    );
}