import React from 'react';
import type { QuizMode, QuizResult } from '../../../types/quiz';
import QuizAnswerResultItem from '../QuizAnswerResultItem';
import { fmt, modeLabel } from '../testsPageUtils';

type TestsResultViewProps = {
    quizResult: QuizResult;
    completionReason: 'manual' | 'timeout' | null;
    passingThreshold: number;
    onReset: () => void;
    onRetry: (categoryId: string, mode: QuizMode) => void;
};

const TestsResultView: React.FC<TestsResultViewProps> = ({
    quizResult,
    completionReason,
    passingThreshold,
    onReset,
    onRetry,
}) => {
    const passed = quizResult.score >= passingThreshold;

    return (
        <div className="tests-page">
            <div className="container">
                <div className="quiz-result-card">
                    <div className={`result-badge ${passed ? 'success' : 'warning'}`}>
                        {passed ? 'Promovat' : 'Nepromovat'}
                    </div>
                    <h2>{passed ? 'Rezultat bun' : 'Mai ai loc de îmbunătățire'}</h2>
                    <p className="result-message">
                        {completionReason === 'timeout'
                            ? 'Timpul a expirat și testul a fost finalizat automat.'
                            : `Ai finalizat testul în modul ${modeLabel(quizResult.mode)}.`}
                    </p>

                    <div className="result-actions result-actions-top">
                        <button className="btn-primary" onClick={onReset}>Înapoi la teste</button>
                        <button className="btn-secondary" onClick={() => onRetry(quizResult.categoryId, quizResult.mode)}>
                            Reîncearcă același mod
                        </button>
                    </div>

                    <div className="result-stats">
                        <div className="stat-item"><div className="stat-value">{quizResult.score}%</div><div className="stat-label">Scor final</div></div>
                        <div className="stat-item"><div className="stat-value">{quizResult.correctAnswers}</div><div className="stat-label">Corecte</div></div>
                        <div className="stat-item"><div className="stat-value">{quizResult.wrongAnswers}</div><div className="stat-label">Greșite</div></div>
                        <div className="stat-item"><div className="stat-value">{quizResult.unanswered}</div><div className="stat-label">Nerăspunse</div></div>
                        <div className="stat-item"><div className="stat-value">{fmt(quizResult.timeTaken)}</div><div className="stat-label">Timp folosit</div></div>
                        <div className="stat-item"><div className="stat-value">{quizResult.totalQuestions}</div><div className="stat-label">Întrebări total</div></div>
                    </div>

                    <div className="result-details">
                        <h3>Detalii răspunsuri</h3>
                        <div className="answer-list">
                            {quizResult.answers.map((answer, index) => (
                                <QuizAnswerResultItem
                                    key={answer.questionId}
                                    questionId={answer.questionId}
                                    index={index}
                                    questionText={answer.questionText}
                                    userAnswerText={answer.userAnswerText}
                                    correctAnswerText={answer.correctAnswerText}
                                    isCorrect={answer.isCorrect}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="result-actions">
                        <button className="btn-primary" onClick={onReset}>Înapoi la teste</button>
                        <button className="btn-secondary" onClick={() => onRetry(quizResult.categoryId, quizResult.mode)}>
                            Reîncearcă același mod
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestsResultView;
