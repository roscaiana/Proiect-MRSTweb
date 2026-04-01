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
    onSetAnswer: (answer: number) => void;
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
                        <button className="back-btn" onClick={onReset}>Înapoi la categorii</button>
                        <div className={`mode-badge ${quizSession.mode}`}>{modeLabel(quizSession.mode)}</div>
                    </div>
                    <h2>{normalizeText(getCategoryById(quizSession.categoryId)?.title || 'Test')}</h2>
                    <div className="quiz-header-meta">
                        <span className={`timer-chip ${quizSession.remainingTimeSeconds <= 60 ? 'danger' : ''}`}>
                            Timp rămas: {fmt(quizSession.remainingTimeSeconds)}
                        </span>
                        <span className="meta-chip">Întrebarea {quizSession.currentQuestionIndex + 1}/{quizSession.questions.length}</span>
                        <span className="meta-chip">Răspunse: {answeredCount}</span>
                    </div>
                    <div className="quiz-progress">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
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
                            <div className="question-number">Întrebarea {quizSession.currentQuestionIndex + 1}</div>
                        </div>

                        <h3 className="question-text">{normalizeText(currentQuestion.text)}</h3>

                        <div className="question-options">
                            {currentQuestion.options.map((option, index) => {
                                const selected = currentAnswer === index;
                                const correctOption = index === currentQuestion.correctAnswer;
                                const state = showFeedback ? (correctOption ? 'correct' : selected ? 'incorrect' : '') : '';
                                return (
                                    <QuestionOptionButton
                                        key={index}
                                        index={index}
                                        option={normalizeText(option)}
                                        selected={selected}
                                        stateClass={state}
                                        onSelect={onSetAnswer}
                                    />
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
                            <button
                                className="btn-secondary"
                                type="button"
                                disabled={quizSession.currentQuestionIndex === 0}
                                onClick={() => onGoToQuestion(quizSession.currentQuestionIndex - 1)}
                            >
                                Înapoi
                            </button>
                            <button
                                className="btn-secondary"
                                type="button"
                                disabled={isLast}
                                onClick={() => onGoToQuestion(quizSession.currentQuestionIndex + 1)}
                            >
                                Următoarea
                            </button>
                            <button className="btn-submit" type="button" onClick={onSubmit}>Finalizează testul</button>
                            {canForceSubmit && unansweredIndexes.length > 0 && (
                                <button className="btn-warning" type="button" onClick={onSubmit}>Trimite oricum</button>
                            )}
                        </div>
                    </section>

                    <aside className="quiz-sidebar">
                        <div className="sidebar-header">
                            <h3>Navigare rapidă</h3>
                            <p>Apasă pe un număr pentru salt direct la întrebare.</p>
                        </div>
                        <QuestionNavigationGrid
                            questions={quizSession.questions}
                            answers={quizSession.answers}
                            currentQuestionIndex={quizSession.currentQuestionIndex}
                            onSelectQuestion={onGoToQuestion}
                            gridRef={sidebarQuestionGridRef}
                            keyPrefix="sidebar-nav"
                        />
                        <div className="legend">
                            <span className="legend-item"><i className="dot correct" />Corectă</span>
                            <span className="legend-item"><i className="dot incorrect" />Greșită</span>
                            <span className="legend-item"><i className="dot empty" />Necompletată</span>
                        </div>
                        {unansweredIndexes.length > 0 && (
                            <p className="sidebar-note">Mai sunt {unansweredIndexes.length} întrebări necompletate.</p>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default TestsSessionView;
