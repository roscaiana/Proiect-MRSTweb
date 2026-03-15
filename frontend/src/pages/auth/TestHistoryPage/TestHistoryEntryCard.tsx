import type { QuizHistoryRecord } from "../../../features/admin/types";

type TestHistoryEntryCardProps = {
    entry: QuizHistoryRecord;
    index: number;
    passThreshold: number;
    formatDateTime: (value: string) => string;
    getShortPackageName: (value: string) => string;
};

export default function TestHistoryEntryCard({
    entry,
    index,
    passThreshold,
    formatDateTime,
    getShortPackageName,
}: TestHistoryEntryCardProps) {
    const isPassed = entry.score >= passThreshold;

    return (
        <article key={`${entry.completedAt}-${entry.categoryId}-${index}`} className="test-history-page__item">
            <div className="test-history-page__item-main">
                <h3>{getShortPackageName(entry.categoryTitle || "Test general")}</h3>
                <p>{formatDateTime(entry.completedAt)}</p>
            </div>
            <div className="test-history-page__item-badges">
                <span className={`test-history-page__badge ${isPassed ? "passed" : "failed"}`}>
                    {isPassed ? "Promovat" : "Nepromovat"}
                </span>
                <span className="test-history-page__score">{entry.score}%</span>
            </div>
            <div className="test-history-page__item-meta">
                <span>Corecte: {entry.correctAnswers ?? "-"}</span>
                <span>Total: {entry.totalQuestions ?? "-"}</span>
                <span>Timp: {entry.timeTaken ?? entry.durationSeconds ?? "-"} sec</span>
            </div>
        </article>
    );
}
