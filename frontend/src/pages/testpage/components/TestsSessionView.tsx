import React, { useMemo, useRef } from 'react';
import { getCategoryById } from '../../../data/quizData';
import type { QuizSession } from '../../../types/quiz';
import QuestionNavigationGrid from '../QuestionNavigationGrid';
import QuestionOptionButton from '../QuestionOptionButton';
import { fmt, modeLabel, normalizeText } from '../testsPageUtils';
import { useQuestionGridAutoScroll } from '../useQuestionGridAutoScroll';

type TestsSessionViewProps = {
    quizSession: QuizSession;
    submitWarning: string;
    canForceSubmit: boolean;
    unansweredIndexes: number[];
    onReset: () => void;
    onGoToQuestion: (index: number) => void;
    onSetAnswer: (answerOptionId: number) => void;
    onSubmit: () => void;
};

const TestsSessionView: React.FC<TestsSessionViewProps> = ({
    quizSession,
    submitWarning,
    canForceSubmit,
    unansweredIndexes,
    onReset,
    onGoToQuestion,
    onSetAnswer,
    onSubmit,
}) => {
    const mobileQuestionGridRef = useRef<HTMLDivElement | null>(null);
    const sidebarQuestionGridRef = useRef<HTMLDivElement | null>(null);
    const questionGridRefs = useMemo(() => [mobileQuestionGridRef, sidebarQuestionGridRef], []);

    const currentQuestion = quizSession.questions[quizSession.currentQuestionIndex] ?? null;
    const answeredCount = useMemo(
        () => quizSession.answers.filter((x) => x !== null).length,
        [quizSession.answers]
    );
    const progress = useMemo(
        () =>
            quizSession.questions.length > 0
                ? ((quizSession.currentQuestionIndex + 1) / quizSession.questions.length) * 100
                : 0,
        [quizSession.currentQuestionIndex, quizSession.questions.length]
    );

    useQuestionGridAutoScroll({
        enabled: true,
        currentQuestionIndex: quizSession.currentQuestionIndex,
        questionCount: quizSession.questions.length,
        refs: questionGridRefs,
    });

    if (!currentQuestion) {
        return null;
    }

    const currentAnswer = quizSession.answers[quizSession.currentQuestionIndex];
    const currentFeedback = quizSession.answerFeedback[quizSession.currentQuestionIndex];
    const isLast = quizSession.currentQuestionIndex === quizSession.questions.length - 1;
    const showEvaluation = quizSession.mode === 'training' && currentAnswer !== null && currentFeedback !== null;
    const correctCount = quizSession.answerFeedback.filter((item) => item?.isCorrect).length;
    const incorrectCount = quizSession.answerFeedback.filter((item) => item && !item.isCorrect).length;

    return (
        <div className="tests-page tests-page-session">
            <div className="container">
                <header className="quiz-sticky-header">
                    <div className="quiz-header-top">
                        <button className="back-btn" onClick={onReset}>Inapoi la categorii</button>
                        <div className={`mode-badge ${quizSession.mode}`}>{modeLabel(quizSession.mode)}</div>
                    </div>
                    <h2>{normalizeText(getCategoryById(quizSession.categoryId)?.title || 'Test')}</h2>
                    <div className="quiz-header-meta">
                        <span className={`timer-chip ${quizSession.remainingTimeSeconds <= 60 ? 'danger' : ''}`}>
                            Timp ramas: {fmt(quizSession.remainingTimeSeconds)}
                        </span>
                        <span className="meta-chip">Intrebarea {quizSession.currentQuestionIndex + 1}/{quizSession.questions.length}</span>
                        <span className="meta-chip">Raspunse: {answeredCount}</span>
                    </div>
                    <div className="quiz-progress">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                    <div className="mobile-quick-nav" aria-label="Navigare rapida">
                        <div className="mobile-quick-nav-header">
                            <span className="mobile-quick-nav-title">Navigare</span>
                            <span className="mobile-quick-nav-meta">
                                {quizSession.currentQuestionIndex + 1}/{quizSession.questions.length}
                                {quizSession.mode === 'training'
                                    ? ` • ${correctCount} corecte • ${incorrectCount} gresite`
                                    : ` • ${answeredCount} raspunse`}
                            </span>
                        </div>
                        <QuestionNavigationGrid
                            questions={quizSession.questions}
                            answers={quizSession.answers}
                            answerFeedback={quizSession.answerFeedback}
                            currentQuestionIndex={quizSession.currentQuestionIndex}
                            showEvaluation={quizSession.mode === 'training'}
                            onSelectQuestion={onGoToQuestion}
                            gridRef={mobileQuestionGridRef}
                            keyPrefix="mobile-nav"
                        />
                    </div>
                </header>

                {submitWarning && <div className="submit-warning">{submitWarning}</div>}

                <div className="quiz-layout">
                    <section className="quiz-question-card">
                        <div className="question-top-row">
                            <div className="question-number">Intrebarea {quizSession.currentQuestionIndex + 1}</div>
                        </div>

                        <h3 className="question-text">{normalizeText(currentQuestion.text)}</h3>

                        <div className="question-options">
                            {currentQuestion.options.map((option, index) => {
                                const selected = currentAnswer === option.id;
                                const state =
                                    showEvaluation && selected
                                        ? currentFeedback?.isCorrect ? 'correct' : 'incorrect'
                                        : '';

                                return (
                                    <QuestionOptionButton
                                        key={option.id}
                                        index={index}
                                        option={normalizeText(option.text)}
                                        selected={selected}
                                        stateClass={state}
                                        onSelect={() => onSetAnswer(option.id)}
                                    />
                                );
                            })}
                        </div>

                        {showEvaluation && currentFeedback && (
                            <div className={`instant-feedback ${currentFeedback.isCorrect ? 'correct' : 'incorrect'}`}>
                                <strong>{currentFeedback.isCorrect ? 'Raspuns corect.' : 'Raspuns gresit.'}</strong>
                                {!currentFeedback.isCorrect && currentFeedback.correctAnswerText && (
                                    <p>Corect: {normalizeText(currentFeedback.correctAnswerText)}</p>
                                )}
                            </div>
                        )}

                        <div className="quiz-navigation">
                            <button
                                className="btn-secondary"
                                type="button"
                                disabled={quizSession.currentQuestionIndex === 0}
                                onClick={() => onGoToQuestion(quizSession.currentQuestionIndex - 1)}
                            >
                                Inapoi
                            </button>
                            <button
                                className="btn-secondary"
                                type="button"
                                disabled={isLast}
                                onClick={() => onGoToQuestion(quizSession.currentQuestionIndex + 1)}
                            >
                                Urmatoarea
                            </button>
                            <button className="btn-submit" type="button" onClick={onSubmit}>Finalizeaza testul</button>
                            {canForceSubmit && unansweredIndexes.length > 0 && (
                                <button className="btn-warning" type="button" onClick={onSubmit}>Trimite oricum</button>
                            )}
                        </div>
                    </section>

                    <aside className="quiz-sidebar">
                        <div className="sidebar-header">
                            <h3>Navigare rapida</h3>
                            <p>Apasa pe un numar pentru salt direct la intrebare.</p>
                        </div>
                        <QuestionNavigationGrid
                            questions={quizSession.questions}
                            answers={quizSession.answers}
                            answerFeedback={quizSession.answerFeedback}
                            currentQuestionIndex={quizSession.currentQuestionIndex}
                            showEvaluation={quizSession.mode === 'training'}
                            onSelectQuestion={onGoToQuestion}
                            gridRef={sidebarQuestionGridRef}
                            keyPrefix="sidebar-nav"
                        />
                        <div className="legend">
                            {quizSession.mode === 'training' ? (
                                <>
                                    <span className="legend-item"><i className="dot correct" />Corecta</span>
                                    <span className="legend-item"><i className="dot incorrect" />Gresita</span>
                                </>
                            ) : (
                                <span className="legend-item"><i className="dot answered" />Raspunsa</span>
                            )}
                            <span className="legend-item"><i className="dot empty" />Necompletata</span>
                        </div>
                        {unansweredIndexes.length > 0 && (
                            <p className="sidebar-note">Mai sunt {unansweredIndexes.length} intrebari necompletate.</p>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default TestsSessionView;
