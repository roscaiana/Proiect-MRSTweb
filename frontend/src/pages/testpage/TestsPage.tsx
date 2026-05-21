import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useStorageSync } from '../../hooks/useStorageSync';
import { getCategoryById, getQuestionsByCategory, getQuizCategories, hydrateQuizDataFromApi } from '../../data/quizData';
import { useAuth } from '../../hooks/useAuth';
import type { QuizMode, QuizResult, QuizSession } from '../../types/quiz';
import type { QuizHistoryRecord } from '../../features/admin/types';
import { readExamSettings, readQuizHistory, STORAGE_KEYS, writeQuizHistory } from '../../features/admin/storage';
import { notifyQuizCompleted } from '../../utils/appEventNotifications';
import { inferChapter, normalizeText } from './testsPageUtils';
import TestsHomeView from './components/TestsHomeView';
import TestsResultView from './components/TestsResultView';
import TestsSessionView from './components/TestsSessionView';
import { quizResultService } from '../../services';
import './TestsPage.css';

const TestsPage: React.FC = () => {
    const { user } = useAuth();
    const [quizMode, setQuizMode] = useState<QuizMode>('training');
    const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
    const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
    const [categories, setCategories] = useState(() => getQuizCategories());
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

    useStorageSync([STORAGE_KEYS.settings], () => {
        setCategories(getQuizCategories());
        setExamSettings(readExamSettings());
    });

    const startQuiz = (categoryId: string, mode: QuizMode = quizMode) => {
        quizUserRef.current = { email: user?.email, fullName: user?.fullName };
        const questions = getQuestionsByCategory(categoryId);
        if (questions.length === 0) return;

        const category = categories.find((item) => item.id === categoryId);
        const durationMinutes = category?.estimatedTime ?? examSettings.testDurationMinutes ?? 30;
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
            answerFeedback: new Array(questions.length).fill(null),
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

    const buildQuizResult = useCallback((
        session: QuizSession,
        evaluation: Awaited<ReturnType<typeof quizResultService.evaluate>>,
        reason: 'manual' | 'timeout',
    ) => {
        const categoryTitle = normalizeText(getCategoryById(session.categoryId)?.title || 'Test');
        const answers = evaluation.answers.map((answer, index) => {
            const question = session.questions.find((item) => Number(item.id) === answer.questionId);
            const chapter = inferChapter(question || {
                id: String(answer.questionId),
                text: answer.questionText,
                options: [],
            }, session.categoryId, categoryTitle);

            return {
                questionId: String(answer.questionId),
                questionText: normalizeText(answer.questionText),
                chapterId: chapter.chapterId,
                chapterTitle: chapter.chapterTitle,
                userAnswer: answer.userAnswerId ?? null,
                userAnswerText: answer.userAnswerText ? normalizeText(answer.userAnswerText) : null,
                correctAnswerText: session.mode === 'training' && answer.correctAnswerText
                    ? normalizeText(answer.correctAnswerText)
                    : null,
                isCorrect: answer.isCorrect,
                wasFlagged: false,
            };
        });

        const chapterMap = new Map<string, { chapterId: string; chapterTitle: string; total: number; correct: number }>();
        answers.forEach((answer) => {
            const entry = chapterMap.get(answer.chapterId) || {
                chapterId: answer.chapterId,
                chapterTitle: answer.chapterTitle,
                total: 0,
                correct: 0,
            };
            entry.total += 1;
            if (answer.isCorrect) {
                entry.correct += 1;
            }
            chapterMap.set(answer.chapterId, entry);
        });

        const chapterStats = Array.from(chapterMap.values())
            .map((item) => ({
                ...item,
                accuracy: item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0,
            }))
            .sort((a, b) => b.accuracy - a.accuracy);

        const result: QuizResult = {
            categoryId: session.categoryId,
            categoryTitle,
            mode: session.mode,
            totalQuestions: evaluation.totalQuestions,
            correctAnswers: evaluation.correctAnswers,
            wrongAnswers: evaluation.wrongAnswers,
            unanswered: evaluation.unanswered,
            score: evaluation.score,
            timeTaken: evaluation.timeTaken,
            durationSeconds: evaluation.durationSeconds,
            completedAt: evaluation.completedAt,
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
    }, [examSettings.passingThreshold]);

    const finalizeQuiz = useCallback(async (session: QuizSession, reason: 'manual' | 'timeout') => {
        const end = new Date();
        const elapsed = Math.max(0, Math.floor((end.getTime() - session.startTime.getTime()) / 1000));
        const timeTaken = session.mode === 'exam' ? Math.min(elapsed, session.durationSeconds) : elapsed;

        const evaluation = await quizResultService.evaluate({
            quizId: Number(session.categoryId),
            mode: session.mode,
            timeTaken,
            durationSeconds: session.durationSeconds,
            completedAt: end.toISOString(),
            answers: session.questions.map((question, index) => ({
                questionId: Number(question.id),
                answerOptionId: session.answers[index],
            })),
        });

        buildQuizResult(session, evaluation, reason);
    }, [buildQuizResult]);

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
            finalizeQuiz(quizSession, 'timeout').catch(() => {
                setSubmitWarning('Nu s-a putut evalua testul.');
            });
        }
    }, [quizSession, finalizeQuiz]);

    const unansweredIndexes = useMemo(
        () =>
            quizSession
                ? quizSession.answers
                    .map((answer, index) => ({ answer, index }))
                    .filter((item) => item.answer === null)
                    .map((item) => item.index)
                : [],
        [quizSession]
    );

    const goToQuestion = (index: number) => {
        if (!quizSession || index < 0 || index >= quizSession.questions.length) return;
        setQuizSession({ ...quizSession, currentQuestionIndex: index });
    };

    const setAnswer = async (answerOptionId: number) => {
        if (!quizSession) return;

        const currentQuestion = quizSession.questions[quizSession.currentQuestionIndex];
        const feedback =
            quizSession.mode === 'training'
                ? await quizResultService.checkAnswer({
                    questionId: Number(currentQuestion.id),
                    answerOptionId,
                })
                : null;

        setQuizSession((prev) => {
            if (!prev) return prev;
            const answers = [...prev.answers];
            const answerFeedback = [...prev.answerFeedback];
            answers[prev.currentQuestionIndex] = answerOptionId;
            answerFeedback[prev.currentQuestionIndex] = feedback
                ? {
                    isCorrect: feedback.isCorrect,
                    correctAnswerText: feedback.correctAnswerText,
                }
                : null;

            return { ...prev, answers, answerFeedback };
        });

        setSubmitWarning('');
        setCanForceSubmit(false);
    };

    const submitQuiz = async () => {
        if (!quizSession) return;
        if (unansweredIndexes.length > 0 && !canForceSubmit) {
            const preview = unansweredIndexes.slice(0, 6).map((index) => index + 1).join(', ');
            setSubmitWarning(`Ai ${unansweredIndexes.length} intrebari necompletate (${preview}${unansweredIndexes.length > 6 ? ', ...' : ''}). Completeaza-le sau apasa "Trimite oricum".`);
            setCanForceSubmit(true);
            goToQuestion(unansweredIndexes[0]);
            return;
        }

        try {
            await finalizeQuiz(quizSession, 'manual');
        } catch {
            setSubmitWarning('Nu s-a putut evalua testul.');
        }
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
                onSetAnswer={(answerOptionId) => { void setAnswer(answerOptionId); }}
                onSubmit={() => { void submitQuiz(); }}
            />
        );
    }

    return (
        <TestsHomeView
            quizMode={quizMode}
            onSelectMode={setQuizMode}
            examSettings={examSettings}
            categories={categories}
            durationByCategoryId={{}}
            onStartQuiz={startQuiz}
        />
    );
};

export default TestsPage;
