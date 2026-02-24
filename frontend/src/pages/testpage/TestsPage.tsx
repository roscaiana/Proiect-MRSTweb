import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getQuizCategories, getQuestionsByCategory, getCategoryById } from '../../data/quizData';
import { useAuth } from '../../hooks/useAuth';
import type { QuizMode, QuizResult, QuizSession } from '../../types/quiz';
import type { QuizHistoryRecord } from '../../features/admin/types';
import { readAdminTests, readExamSettings, readQuizHistory, STORAGE_KEYS, writeQuizHistory } from '../../features/admin/storage';
import QuestionNavigationGrid from './QuestionNavigationGrid';
import { difficultyLabel, fmt, inferChapter, modeLabel, normalizeText, renderCategoryIcon } from './testsPageUtils';
import { useQuestionGridAutoScroll } from './useQuestionGridAutoScroll';
import { notifyQuizCompleted } from '../../utils/appEventNotifications';
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
    const mobileQuestionGridRef = React.useRef<HTMLDivElement | null>(null);
    const sidebarQuestionGridRef = React.useRef<HTMLDivElement | null>(null);
    const questionGridRefs = useMemo(() => [mobileQuestionGridRef, sidebarQuestionGridRef], []);

    useEffect(() => {
        const refresh = () => {
            setCategories(getQuizCategories());
            setAdminTests(readAdminTests());
            setExamSettings(readExamSettings());
        };
        const onStorage = (event: StorageEvent) => {
            const changedKey = event.key;
            if (changedKey === STORAGE_KEYS.tests || changedKey === STORAGE_KEYS.settings) refresh();
        };
        const onAppStorage = (event: Event) => {
            const customEvent = event as CustomEvent<{ key?: string }>;
            const changedKey = customEvent.detail?.key;
            if (changedKey === STORAGE_KEYS.tests || changedKey === STORAGE_KEYS.settings) refresh();
        };
        window.addEventListener('storage', onStorage);
        window.addEventListener('app-storage-updated', onAppStorage as EventListener);
        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('app-storage-updated', onAppStorage as EventListener);
        };
    }, []);

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
            userEmail: user?.email,
            userName: user?.fullName,
        };
        const nextHistory = [historyEntry, ...readQuizHistory()].slice(0, 100);
        writeQuizHistory(nextHistory);
        notifyQuizCompleted({
            userEmail: user?.email,
            categoryTitle: result.categoryTitle,
            score: result.score,
            passed: result.score >= examSettings.passingThreshold,
        });
        setCompletionReason(reason);
        setQuizResult(result);
        setQuizSession(null);
        setSubmitWarning(reason === 'timeout' ? 'Timpul a expirat. Testul a fost trimis automat.' : '');
        setCanForceSubmit(false);
    }, [user?.email, user?.fullName]);

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

    useQuestionGridAutoScroll({
        enabled: Boolean(quizSession),
        currentQuestionIndex: quizSession?.currentQuestionIndex ?? null,
        questionCount: quizSession?.questions.length ?? 0,
        refs: questionGridRefs,
    });

    const currentQuestion = useMemo(() => quizSession ? quizSession.questions[quizSession.currentQuestionIndex] : null, [quizSession]);
    const answeredCount = useMemo(() => quizSession ? quizSession.answers.filter((x) => x !== null).length : 0, [quizSession]);
    const unansweredIndexes = useMemo(() => quizSession ? quizSession.answers.map((a, i) => ({ a, i })).filter((x) => x.a === null).map((x) => x.i) : [], [quizSession]);
    const progress = useMemo(() => quizSession ? ((quizSession.currentQuestionIndex + 1) / quizSession.questions.length) * 100 : 0, [quizSession]);
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
        const passed = quizResult.score >= examSettings.passingThreshold;
        const strongChapters = quizResult.chapterStats.filter((x) => x.accuracy >= 70);
        const weakChapters = quizResult.chapterStats.filter((x) => x.accuracy < 70);

        return (
            <div className="tests-page">
                <div className="container">
                    <div className="quiz-result-card">
                        <div className={`result-badge ${passed ? 'success' : 'warning'}`}>{passed ? 'Promovat' : 'Nepromovat'}</div>
                        <h2>{passed ? 'Rezultat bun' : 'Mai ai loc de îmbunătățire'}</h2>
                        <p className="result-message">
                            {completionReason === 'timeout'
                                ? 'Timpul a expirat și testul a fost finalizat automat.'
                                : `Ai finalizat testul în modul ${modeLabel(quizResult.mode)}.`}
                        </p>

                        <div className="result-actions result-actions-top">
                            <button className="btn-primary" onClick={resetQuiz}>Înapoi la categorii</button>
                            <button className="btn-secondary" onClick={() => startQuiz(quizResult.categoryId, quizResult.mode)}>Reîncearcă același mod</button>
                        </div>

                        <div className="result-stats">
                            <div className="stat-item"><div className="stat-value">{quizResult.score}%</div><div className="stat-label">Scor final</div></div>
                            <div className="stat-item"><div className="stat-value">{quizResult.correctAnswers}</div><div className="stat-label">Corecte</div></div>
                            <div className="stat-item"><div className="stat-value">{quizResult.wrongAnswers}</div><div className="stat-label">Greșite</div></div>
                            <div className="stat-item"><div className="stat-value">{quizResult.unanswered}</div><div className="stat-label">Nerăspunse</div></div>
                            <div className="stat-item"><div className="stat-value">{fmt(quizResult.timeTaken)}</div><div className="stat-label">Timp folosit</div></div>
                            <div className="stat-item"><div className="stat-value">{quizResult.totalQuestions}</div><div className="stat-label">Întrebări total</div></div>
                        </div>

                        <div className="chapter-feedback-grid">
                            <article className="chapter-feedback-card">
                                <h3>Capitole bune</h3>
                                {strongChapters.length === 0 ? (
                                    <p className="chapter-feedback-empty">Niciun capitol peste 70% în această încercare.</p>
                                ) : (
                                    <ul>{strongChapters.map((x) => <li key={x.chapterId}><span>{x.chapterTitle}</span><strong>{x.accuracy}%</strong></li>)}</ul>
                                )}
                            </article>
                            <article className="chapter-feedback-card weak">
                                <h3>Capitole de consolidat</h3>
                                {weakChapters.length === 0 ? (
                                    <p className="chapter-feedback-empty">Foarte bine, nu ai capitole sub 70%.</p>
                                ) : (
                                    <ul>{weakChapters.map((x) => <li key={x.chapterId}><span>{x.chapterTitle}</span><strong>{x.accuracy}%</strong></li>)}</ul>
                                )}
                            </article>
                        </div>

                        <div className="result-details">
                            <h3>Detalii răspunsuri</h3>
                            <div className="answer-list">
                                {quizResult.answers.map((answer, index) => (
                                    <div key={answer.questionId} className={`answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                                        <div className="answer-header"><strong>Întrebarea {index + 1}</strong><span>{answer.chapterTitle}</span></div>
                                        <p className="answer-question">{answer.questionText}</p>
                                        <p>Răspunsul tău: <strong>{answer.userAnswerText || 'Neselectat'}</strong></p>
                                        {!answer.isCorrect && <p>Corect: <strong>{answer.correctAnswerText}</strong></p>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="result-actions">
                            <button className="btn-primary" onClick={resetQuiz}>Înapoi la categorii</button>
                            <button className="btn-secondary" onClick={() => startQuiz(quizResult.categoryId, quizResult.mode)}>Reîncearcă același mod</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (quizSession && currentQuestion) {
        const currentAnswer = quizSession.answers[quizSession.currentQuestionIndex];
        const isLast = quizSession.currentQuestionIndex === quizSession.questions.length - 1;
        const showFeedback = quizSession.mode === 'training' && currentAnswer !== null;
        const isCorrect = currentAnswer !== null && currentAnswer === currentQuestion.correctAnswer;
        const correctCount = quizSession.answers.reduce<number>((acc, answer, index) => {
            if (answer === null) return acc;
            return acc + (answer === quizSession.questions[index].correctAnswer ? 1 : 0);
        }, 0);
        const incorrectCount = quizSession.answers.reduce<number>((acc, answer, index) => {
            if (answer === null) return acc;
            return acc + (answer !== quizSession.questions[index].correctAnswer ? 1 : 0);
        }, 0);

        return (
            <div className="tests-page tests-page-session">
                <div className="container">
                    <header className="quiz-sticky-header">
                        <div className="quiz-header-top">
                            <button className="back-btn" onClick={resetQuiz}>Înapoi la categorii</button>
                            <div className={`mode-badge ${quizSession.mode}`}>{modeLabel(quizSession.mode)}</div>
                        </div>
                        <h2>{normalizeText(getCategoryById(quizSession.categoryId)?.title || 'Test')}</h2>
                        <div className="quiz-header-meta">
                            <span className={`timer-chip ${quizSession.remainingTimeSeconds <= 60 ? 'danger' : ''}`}>Timp rămas: {fmt(quizSession.remainingTimeSeconds)}</span>
                            <span className="meta-chip">Întrebarea {quizSession.currentQuestionIndex + 1}/{quizSession.questions.length}</span>
                            <span className="meta-chip">Răspunse: {answeredCount}</span>
                        </div>
                        <div className="quiz-progress"><div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div></div>
                        <div className="mobile-quick-nav" aria-label="Navigare rapidă">
                            <div className="mobile-quick-nav-header">
                                <span className="mobile-quick-nav-title">Navigare</span>
                                <span className="mobile-quick-nav-meta">
                                    {quizSession.currentQuestionIndex + 1}/{quizSession.questions.length} • {correctCount} corecte • {incorrectCount} greșite
                                </span>
                            </div>
                            <QuestionNavigationGrid
                                questions={quizSession.questions}
                                answers={quizSession.answers}
                                currentQuestionIndex={quizSession.currentQuestionIndex}
                                onSelectQuestion={goToQuestion}
                                gridRef={mobileQuestionGridRef}
                                keyPrefix="mobile-nav"
                            />
                        </div>
                    </header>

                    {submitWarning && <div className="submit-warning">{submitWarning}</div>}

                    <div className="quiz-layout">
                        <section className="quiz-question-card">
                            <div className="question-top-row">
                                <div className="question-number">Întrebarea {quizSession.currentQuestionIndex + 1}</div>
                            </div>

                            <h3 className="question-text">{normalizeText(currentQuestion.text)}</h3>

                            <div className="question-options">
                                {currentQuestion.options.map((option, index) => {
                                    const selected = currentAnswer === index;
                                    const correctOption = index === currentQuestion.correctAnswer;
                                    const state = showFeedback ? (correctOption ? 'correct' : selected ? 'incorrect' : '') : '';
                                    return (
                                        <button key={index} className={`option-btn ${selected ? 'selected' : ''} ${state}`.trim()} onClick={() => setAnswer(index)} type="button">
                                            <span className="option-prefix">{String.fromCharCode(65 + index)}</span>
                                            <span className="option-text">{normalizeText(option)}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {showFeedback && (
                                <div className={`instant-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                                    <strong>{isCorrect ? 'Răspuns corect.' : 'Răspuns greșit.'}</strong>
                                    {currentQuestion.explanation && <p>{normalizeText(currentQuestion.explanation)}</p>}
                                </div>
                            )}

                            <div className="quiz-navigation">
                                <button className="btn-secondary" type="button" disabled={quizSession.currentQuestionIndex === 0} onClick={() => goToQuestion(quizSession.currentQuestionIndex - 1)}>Înapoi</button>
                                <button className="btn-secondary" type="button" disabled={isLast} onClick={() => goToQuestion(quizSession.currentQuestionIndex + 1)}>Următoarea</button>
                                <button className="btn-submit" type="button" onClick={submitQuiz}>Finalizează testul</button>
                                {canForceSubmit && unansweredIndexes.length > 0 && <button className="btn-warning" type="button" onClick={submitQuiz}>Trimite oricum</button>}
                            </div>
                        </section>

                        <aside className="quiz-sidebar">
                            <div className="sidebar-header"><h3>Navigare rapidă</h3><p>Apasă pe un număr pentru salt direct la întrebare.</p></div>
                            <QuestionNavigationGrid
                                questions={quizSession.questions}
                                answers={quizSession.answers}
                                currentQuestionIndex={quizSession.currentQuestionIndex}
                                onSelectQuestion={goToQuestion}
                                gridRef={sidebarQuestionGridRef}
                                keyPrefix="sidebar-nav"
                            />
                            <div className="legend">
                                <span className="legend-item"><i className="dot correct" />Corectă</span>
                                <span className="legend-item"><i className="dot incorrect" />Greșită</span>
                                <span className="legend-item"><i className="dot empty" />Necompletată</span>
                            </div>
                            {unansweredIndexes.length > 0 && <p className="sidebar-note">Mai sunt {unansweredIndexes.length} întrebări necompletate.</p>}
                        </aside>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="tests-page">
            <div className="container">
                <div className="page-header">
                    <h1>Teste de pregătire</h1>
                    <p className="page-subtitle">Alege modul de lucru, pornește un test și urmărește evoluția ta în timp.</p>
                </div>

                <div className="quiz-mode-switch" role="tablist" aria-label="Selecție mod test">
                    <button type="button" className={`mode-switch-btn ${quizMode === 'training' ? 'active' : ''}`} onClick={() => setQuizMode('training')}>
                        Antrenament
                        <small>Feedback imediat după fiecare răspuns</small>
                    </button>
                    <button type="button" className={`mode-switch-btn ${quizMode === 'exam' ? 'active' : ''}`} onClick={() => setQuizMode('exam')}>
                        Examen
                        <small>Fără feedback până la finalul testului</small>
                    </button>
                </div>

                <div className="quiz-categories">
                    {categories.map((category) => (
                        <article key={category.id} className="quiz-category-card">
                            <div className="category-icon" aria-hidden="true">{renderCategoryIcon(category.id)}</div>
                            <h3>{normalizeText(category.title)}</h3>
                            <p className="category-description">{normalizeText(category.description)}</p>

                            <div className="category-meta">
                                <div className="meta-item"><span>Durata test: {durationByCategoryId[category.id] ?? category.estimatedTime} min</span></div>
                                <div className="meta-item"><span>{category.questionCount} întrebări</span></div>
                                <div className="meta-item"><span className={`difficulty-badge ${category.difficulty}`}>{difficultyLabel(category.difficulty)}</span></div>
                            </div>

                            <button className="btn-start-quiz" onClick={() => startQuiz(category.id)}>Începe în modul {modeLabel(quizMode)}</button>
                        </article>
                    ))}
                </div>

                <section className="tests-info-box">
                    <div className="tests-info-content">
                        <h4>Reguli rapide</h4>
                        <ul>
                            <li>Scor minim de promovare: {examSettings.passingThreshold}%.</li>
                            <li>Durata fiecărui test vine din setarea testului din Admin (fallback global: {examSettings.testDurationMinutes} minute).</li>
                            <li>Înainte de submit primești validare pentru răspunsurile lipsă.</li>
                            <li>După finalizare primești analiza pe capitole și istoric.</li>
                        </ul>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default TestsPage;


