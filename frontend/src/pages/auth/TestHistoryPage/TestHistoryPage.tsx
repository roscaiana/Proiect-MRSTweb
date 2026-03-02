import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { readExamSettings, readQuizHistory, STORAGE_KEYS } from "../../../features/admin/storage";
import type { QuizHistoryRecord } from "../../../features/admin/types";
import { useAuth } from "../../../hooks/useAuth";
import { APP_ROUTES } from "../../../routes/appRoutes";
import "./TestHistoryPage.css";

const formatDateTime = (value: string): string => {
    const date = new Date(value);
    return date.toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getShortPackageName = (value: string): string => {
    if (value.length <= 44) {
        return value;
    }
    return `${value.slice(0, 42)}...`;
};

const TestHistoryPage: React.FC = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState<QuizHistoryRecord[]>(() => readQuizHistory());
    const [passThreshold, setPassThreshold] = useState<number>(() => readExamSettings().passingThreshold);

    useEffect(() => {
        const refreshData = (): void => {
            setHistory(readQuizHistory());
            setPassThreshold(readExamSettings().passingThreshold);
        };

        const handleStorage = (event: StorageEvent): void => {
            if (event.key === STORAGE_KEYS.quizHistory || event.key === STORAGE_KEYS.settings) {
                refreshData();
            }
        };

        const handleAppStorageUpdated = (event: Event): void => {
            const customEvent = event as CustomEvent<{ key?: string }>;
            if (customEvent.detail?.key === STORAGE_KEYS.quizHistory || customEvent.detail?.key === STORAGE_KEYS.settings) {
                refreshData();
            }
        };

        window.addEventListener("storage", handleStorage);
        window.addEventListener("app-storage-updated", handleAppStorageUpdated as EventListener);
        return () => {
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener("app-storage-updated", handleAppStorageUpdated as EventListener);
        };
    }, []);

    const userHistory = useMemo(() => {
        if (!user?.email) {
            return [];
        }
        return history
            .filter((entry) => entry.userEmail === user.email)
            .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    }, [history, user?.email]);

    const averageScore = useMemo(() => {
        if (userHistory.length === 0) {
            return 0;
        }
        const total = userHistory.reduce((acc, entry) => acc + entry.score, 0);
        return Math.round(total / userHistory.length);
    }, [userHistory]);

    const passedCount = useMemo(
        () => userHistory.filter((entry) => entry.score >= passThreshold).length,
        [userHistory, passThreshold],
    );

    const passRate = useMemo(() => {
        if (userHistory.length === 0) {
            return 0;
        }
        return Math.round((passedCount / userHistory.length) * 100);
    }, [passedCount, userHistory.length]);

    return (
        <section className="test-history-page">
            <div className="test-history-page__header">
                <div>
                    <h1>Istoric teste</h1>
                    <p>Toate încercările tale, cu detalii complete pe fiecare pachet de întrebări.</p>
                </div>
                <Link to={APP_ROUTES.dashboard} className="test-history-page__back-link">
                    Înapoi la profil
                </Link>
            </div>

            <div className="test-history-page__stats">
                <article className="test-history-page__stat-card">
                    <span>Total încercări</span>
                    <strong>{userHistory.length}</strong>
                </article>
                <article className="test-history-page__stat-card">
                    <span>Scor mediu</span>
                    <strong>{averageScore}%</strong>
                </article>
                <article className="test-history-page__stat-card">
                    <span>Rată promovare</span>
                    <strong>{passRate}%</strong>
                </article>
                <article className="test-history-page__stat-card">
                    <span>Prag curent</span>
                    <strong>{passThreshold}%</strong>
                </article>
            </div>

            {userHistory.length === 0 ? (
                <div className="test-history-page__empty">
                    <p>Nu ai încă teste finalizate.</p>
                    <Link to={APP_ROUTES.tests}>Începe un test</Link>
                </div>
            ) : (
                <div className="test-history-page__list">
                    {userHistory.map((entry, index) => {
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
                    })}
                </div>
            )}
        </section>
    );
};

export default TestHistoryPage;
