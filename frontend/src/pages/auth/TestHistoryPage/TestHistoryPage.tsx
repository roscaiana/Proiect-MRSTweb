import React, { useEffect, useMemo, useState } from "react";
import { useStorageSync } from "../../../hooks/useStorageSync";
import { Link } from "react-router-dom";
import { readExamSettings, readQuizHistory, STORAGE_KEYS } from "../../../features/admin/storage";
import { formatDateTimeLong } from "../../../utils/dateUtils";
import type { QuizHistoryRecord } from "../../../features/admin/types";
import { useAuth } from "../../../hooks/useAuth";
import { APP_ROUTES } from "../../../routes/appRoutes";
import TestHistoryEntryCard from "./TestHistoryEntryCard";
import { quizResultService } from "../../../services/quizResultService";
import type { QuizResultDto } from "../../../services/types";
import "./TestHistoryPage.css";


const getShortPackageName = (value: string): string => {
    if (value.length <= 44) {
        return value;
    }
    return `${value.slice(0, 42)}...`;
};

const mapQuizResultDto = (dto: QuizResultDto, userEmail?: string): QuizHistoryRecord => ({
    categoryId: String(dto.quizId),
    categoryTitle: dto.quizTitle,
    score: dto.score,
    completedAt: dto.completedAt,
    mode: dto.mode as "training" | "exam",
    totalQuestions: dto.totalQuestions,
    correctAnswers: dto.correctAnswers,
    wrongAnswers: dto.wrongAnswers,
    unanswered: dto.unanswered,
    timeTaken: dto.timeTaken,
    userEmail,
});

const TestHistoryPage: React.FC = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState<QuizHistoryRecord[]>(() => readQuizHistory());
    const [passThreshold, setPassThreshold] = useState<number>(() => readExamSettings().passingThreshold);

    useStorageSync([STORAGE_KEYS.settings], () => {
        setPassThreshold(readExamSettings().passingThreshold);
    });

    useEffect(() => {
        const userId = user?.id ? parseInt(user.id, 10) : null;
        if (!userId || isNaN(userId)) return;
        quizResultService.getByUser(userId)
            .then((items) => setHistory(items.map((dto) => mapQuizResultDto(dto, user?.email))))
            .catch(() => { /* keep localStorage-seeded state on API failure */ });
    }, [user?.id, user?.email]);

    const userHistory = useMemo(() => {
        if (!user?.email) {
            return [];
        }

        return history
            .filter((entry) => !entry.userEmail || entry.userEmail === user.email)
            .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    }, [history, user?.email]);

    const averageScore = useMemo(() => {
        if (userHistory.length === 0) {
            return 0;
        }
        const total = userHistory.reduce((acc, entry) => acc + entry.score, 0);
        return Math.round(total / userHistory.length);
    }, [userHistory]);

    const passedCount = useMemo(() => userHistory.filter((entry) => entry.score >= passThreshold).length, [passThreshold, userHistory]);

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
                    {userHistory.map((entry, index) => (
                        <TestHistoryEntryCard
                            key={`${entry.completedAt}-${entry.categoryId}-${index}`}
                            entry={entry}
                            index={index}
                            passThreshold={passThreshold}
                            formatDateTime={formatDateTimeLong}
                            getShortPackageName={getShortPackageName}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default TestHistoryPage;
