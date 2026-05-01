import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useStorageSync } from '../../hooks/useStorageSync';
import { getCategoryById, getQuestionsByCategory, getQuizCategories, hydrateQuizDataFromApi } from '../../data/quizData';
import { useAuth } from '../../hooks/useAuth';
import type { QuizMode, QuizResult, QuizSession } from '../../types/quiz';
import type { QuizHistoryRecord } from '../../features/admin/types';
import { readAdminTests, readExamSettings, readQuizHistory, STORAGE_KEYS, writeQuizHistory } from '../../features/admin/storage';
import { notifyQuizCompleted } from '../../utils/appEventNotifications';
import { inferChapter, normalizeText } from './testsPageUtils';
import TestsHomeView from './components/TestsHomeView';
import TestsResultView from './components/TestsResultView';
import TestsSessionView from './components/TestsSessionView';
import './TestsPage.css';

const TestsPage: React.FC = () => {
    const { user } = useAuth();
    const [quizMode, setQuizMode] = useState<QuizMode>('training');
    const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
    const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
    const [categories, setCategories] = useState(() => getQuizCategories());
    const [adminTests, setAdminTests] = useState(() => readAdminTests());
    const [examSettings, setExamSettings] = useState(() => readExamSettings());
    const [submitWarning, setSubmitWarning] = useState('');
    const [canForceSubmit, setCanForceSubmit] = useState(false);
    const [completionReason, setCompletionReason] = useState<'manual' | 'timeout' | null>(null);
    const quizUserRef = React.useRef<{ email?: string; fullName?: string } | null>(null);
    const testsView = quizResult ? 'result' : quizSession ? 'session' : 'home';

    useEffect(() => {
        hydrateQuizDataFromApi().then((loaded) => {
            if (loaded) setCategories(getQuizCategories());
        });
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, [testsView]);

    useStorageSync([STORAGE_KEYS.tests, STORAGE_KEYS.settings], () => {
        setCategories(getQuizCategories());
        setAdminTests(readAdminTests());
        setExamSettings(readExamSettings());
    });

    const durationByCategoryId = useMemo(() => {
        return adminTests.reduce<Record<string, number>>((acc, test) => {
            const minutes = Number(test.durationMinutes);
            if (Number.isFinite(minutes) && minutes > 0) {
                acc[test.id] = minutes;
            }
            return acc;
        }, {});
    }, [adminTests]);

    const startQuiz = (categoryId: string, mode: QuizMode = quizMode) => {
        quizUserRef.current = { email: user?.email, fullName: user?.fullName };
        const questions = getQuestionsByCategory(categoryId);
        if (questions.length === 0) return;
        const category = categories.find((item) => item.id === categoryId);
        const durationMinutes =
            durationByCategoryId[categoryId] ??
            category?.estimatedTime ??
            examSettings.testDurationMinutes ??
            30;
        const durationSeconds = Math.max(1, durationMinutes) * 60;
        setQuizMode(mode);
        setSubmitWarning('');
        setCanForceSubmit(false);
        setCompletionReason(null);
        setQuizResult(null);
        setQuizSession({
            categoryId,
            mode,
            questions,
            currentQuestionIndex: 0,
            answers: new Array(questions.length).fill(null),
            flaggedQuestions: new Array(questions.length).fill(false),
            durationSeconds,
            remainingTimeSeconds: durationSeconds,
            startTime: new Date(),
        });
    };

    const resetQuiz = () => {
        setQuizSession(null);
        setQuizResult(null);
        setSubmitWarning('');
        setCanForceSubmit(false);
        setCompletionReason(null);
    };

    const finalizeQuiz = useCallback((session: QuizSession, reason: 'manual' | 'timeout') => {
        const end = new Date();
        const elapsed = Math.max(0, Math.floor((end.getTime() - session.startTime.getTime()) / 1000));
        const timeTaken = session.mode === 'exam' ? Math.min(elapsed, session.durationSeconds) : elapsed;
        const categoryTitle = normalizeText(getCategoryById(session.categoryId)?.title || 'Test');
        let correctAnswers = 0;
        let unanswered = 0;
        const answers = session.questions.map((q, i) => {
            const userAnswer = session.answers[i];
            const chapter = inferChapter(q, session.categoryId, categoryTitle);
            const isCorrect = userAnswer !== null && userAnswer === q.correctAnswer;
            if (isCorrect) correctAnswers += 1;
            if (userAnswer === null) unanswered += 1;
            return {
                questionId: q.id,
                questionText: normalizeText(q.text),
                chapterId: chapter.chapterId,
                chapterTitle: chapter.chapterTitle,
                userAnswer,
                userAnswerText: userAnswer === null ? null : normalizeText(q.options[userAnswer] || ''),
                correctAnswer: q.correctAnswer,
                correctAnswerText: normalizeText(q.options[q.correctAnswer] || ''),
                isCorrect,
                wasFlagged: Boolean(session.flaggedQuestions[i]),
            };
        });
        const chapterMap = new Map<string, { chapterId: string; chapterTitle: string; total: number; correct: number }>();
        answers.forEach((a) => {
            const entry = chapterMap.get(a.chapterId) || { chapterId: a.chapterId, chapterTitle: a.chapterTitle, total: 0, correct: 0 };
            entry.total += 1;
            if (a.isCorrect) entry.correct += 1;
            chapterMap.set(a.chapterId, entry);
        });
        const chapterStats = Array.from(chapterMap.values()).map((x) => ({
            ...x,
            accuracy: x.total > 0 ? Math.round((x.correct / x.total) * 100) : 0,
        })).sort((a, b) => b.accuracy - a.accuracy);
        const totalQuestions = session.questions.length;
        const wrongAnswers = totalQuestions - correctAnswers - unanswered;
        const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        const result: QuizResult = {
            categoryId: session.categoryId,
            categoryTitle,
            mode: session.mode,
            totalQuestions,
            correctAnswers,
            wrongAnswers,
            unanswered,
            score,
            timeTaken,
            durationSeconds: session.durationSeconds,
            completedAt: end.toISOString(),
            answers,
            chapterStats,
        };
        const historyEntry: QuizHistoryRecord = {
            categoryId: result.categoryId,
            categoryTitle: result.categoryTitle,
            score: result.score,
            completedAt: result.completedAt,
            mode: result.mode,
            totalQuestions: result.totalQuestions,
            correctAnswers: result.correctAnswers,
            wrongAnswers: result.wrongAnswers,
            unanswered: result.unanswered,
            timeTaken: result.timeTaken,
            durationSeconds: result.durationSeconds,
            chapterStats: result.chapterStats,
            userEmail: quizUserRef.current?.email,
            userName: quizUserRef.current?.fullName,
        };
        const nextHistory = [historyEntry, ...readQuizHistory()].slice(0, 100);
        writeQuizHistory(nextHistory);
        notifyQuizCompleted({
            userEmail: quizUserRef.current?.email,
            categoryTitle: result.categoryTitle,
            score: result.score,
            passed: result.score >= examSettings.passingThreshold,
        });
        setCompletionReason(reason);
        setQuizResult(result);
        setQuizSession(null);
        setSubmitWarning(reason === 'timeout' ? 'Timpul a expirat. Testul a fost trimis automat.' : '');
        setCanForceSubmit(false);
    }, []);

    useEffect(() => {
        if (!quizSession) return;
        const id = window.setInterval(() => {
            setQuizSession((prev) => {
                if (!prev || prev.remainingTimeSeconds <= 0) return prev;
                return { ...prev, remainingTimeSeconds: prev.remainingTimeSeconds - 1 };
            });
        }, 1000);
        return () => window.clearInterval(id);
    }, [Boolean(quizSession)]);

    useEffect(() => {
        if (quizSession && quizSession.mode === 'exam' && quizSession.remainingTimeSeconds === 0) {
            finalizeQuiz(quizSession, 'timeout');
        }
    }, [quizSession, finalizeQuiz]);

    const unansweredIndexes = useMemo(
        () =>
            quizSession
                ? quizSession.answers
                      .map((a, i) => ({ a, i }))
                      .filter((x) => x.a === null)
                      .map((x) => x.i)
                : [],
        [quizSession]
    );
    const goToQuestion = (index: number) => {
        if (!quizSession || index < 0 || index >= quizSession.questions.length) return;
        setQuizSession({ ...quizSession, currentQuestionIndex: index });
    };
    const setAnswer = (answer: number) => {
        if (!quizSession) return;
        setQuizSession((prev) => {
            if (!prev) return prev;
            const answers = [...prev.answers];
            answers[prev.currentQuestionIndex] = answer;
            return { ...prev, answers };
        });
        setSubmitWarning('');
        setCanForceSubmit(false);
    };
    const submitQuiz = () => {
        if (!quizSession) return;
        if (unansweredIndexes.length > 0 && !canForceSubmit) {
            const preview = unansweredIndexes.slice(0, 6).map((x) => x + 1).join(', ');
            setSubmitWarning(`Ai ${unansweredIndexes.length} întrebări necompletate (${preview}${unansweredIndexes.length > 6 ? ', ...' : ''}). Completează-le sau apasă "Trimite oricum".`);
            setCanForceSubmit(true);
            goToQuestion(unansweredIndexes[0]);
            return;
        }
        finalizeQuiz(quizSession, 'manual');
    };
    if (quizResult) {
        return (
            <TestsResultView
                quizResult={quizResult}
                completionReason={completionReason}
                passingThreshold={examSettings.passingThreshold}
                onReset={resetQuiz}
                onRetry={startQuiz}
            />
        );
    }

    if (quizSession) {
        return (
            <TestsSessionView
                quizSession={quizSession}
                submitWarning={submitWarning}
                canForceSubmit={canForceSubmit}
                unansweredIndexes={unansweredIndexes}
                onReset={resetQuiz}
                onGoToQuestion={goToQuestion}
                onSetAnswer={setAnswer}
                onSubmit={submitQuiz}
            />
        );
    }

    return (
        <TestsHomeView
            quizMode={quizMode}
            onSelectMode={setQuizMode}
            examSettings={examSettings}
            categories={categories}
            durationByCategoryId={durationByCategoryId}
            onStartQuiz={startQuiz}
        />
    );
};

export default TestsPage;




