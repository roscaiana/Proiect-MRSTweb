import React, { useState, useMemo } from 'react';
import { QuizSession, QuizResult } from '../types/quiz';
import { quizCategories, getQuestionsByCategory, getCategoryById } from '../data/quizData';

const TestsPage: React.FC = () => {
    const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
    const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

    // Start a quiz for a selected category
    const startQuiz = (categoryId: string) => {
        const questions = getQuestionsByCategory(categoryId);
        if (questions.length === 0) return;

        const session: QuizSession = {
            categoryId,
            questions,
            currentQuestionIndex: 0,
            answers: new Array(questions.length).fill(null),
            startTime: new Date()
        };

        setQuizSession(session);
    };

    // Handle answer selection
    const selectAnswer = (answerIndex: number) => {
        if (!quizSession) return;

        const newAnswers = [...quizSession.answers];
        newAnswers[quizSession.currentQuestionIndex] = answerIndex;

        setQuizSession({
            ...quizSession,
            answers: newAnswers
        });
    };

    // Navigate to next question
    const nextQuestion = () => {
        if (!quizSession) return;

        if (quizSession.currentQuestionIndex < quizSession.questions.length - 1) {
            setQuizSession({
                ...quizSession,
                currentQuestionIndex: quizSession.currentQuestionIndex + 1
            });
        }
    };

    // Navigate to previous question
    const previousQuestion = () => {
        if (!quizSession) return;

        if (quizSession.currentQuestionIndex > 0) {
            setQuizSession({
                ...quizSession,
                currentQuestionIndex: quizSession.currentQuestionIndex - 1
            });
        }
    };

    // Submit quiz and calculate results
    const submitQuiz = () => {
        if (!quizSession) return;

        const endTime = new Date();
        const timeTaken = Math.floor((endTime.getTime() - quizSession.startTime.getTime()) / 1000);

        let correctAnswers = 0;
        const answers = quizSession.questions.map((question, index) => {
            const userAnswer = quizSession.answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            if (isCorrect) correctAnswers++;

            return {
                questionId: question.id,
                userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect
            };
        });

        const category = getCategoryById(quizSession.categoryId);
        const result: QuizResult = {
            categoryId: quizSession.categoryId,
            categoryTitle: category?.title || '',
            totalQuestions: quizSession.questions.length,
            correctAnswers,
            score: Math.round((correctAnswers / quizSession.questions.length) * 100),
            timeTaken,
            answers
        };

        setQuizResult(result);
        setQuizSession(null);
    };

    // Reset and go back to category selection
    const resetQuiz = () => {
        setQuizSession(null);
        setQuizResult(null);
    };

    // Current question and progress
    const currentQuestion = useMemo(() => {
        if (!quizSession) return null;
        return quizSession.questions[quizSession.currentQuestionIndex];
    }, [quizSession]);

    const progress = useMemo(() => {
        if (!quizSession) return 0;
        return ((quizSession.currentQuestionIndex + 1) / quizSession.questions.length) * 100;
    }, [quizSession]);

    const isLastQuestion = useMemo(() => {
        if (!quizSession) return false;
        return quizSession.currentQuestionIndex === quizSession.questions.length - 1;
    }, [quizSession]);

    const canProceed = useMemo(() => {
        if (!quizSession) return false;
        return quizSession.answers[quizSession.currentQuestionIndex] !== null;
    }, [quizSession]);

    // Render results page
    if (quizResult) {
        const passThreshold = 70;
        const passed = quizResult.score >= passThreshold;

        return (
            <div className="tests-page">
                <div className="container">
                    <div className="quiz-result-card">
                        <div className={`result-icon ${passed ? 'success' : 'warning'}`}>
                            {passed ? (
                                <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                    <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ) : (
                                <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            )}
                        </div>
                        <h2>{passed ? 'Felicitări!' : 'Continuați să exersați!'}</h2>
                        <p className="result-message">
                            {passed
                                ? 'Ați trecut testul cu succes! Cunoștințele dumneavoastră sunt la un nivel bun.'
                                : 'Nu v-ați descurajat! Continuați să studiați și veți reuși.'}
                        </p>

                        <div className="result-stats">
                            <div className="stat-item">
                                <div className="stat-value">{quizResult.score}%</div>
                                <div className="stat-label">Scor Final</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">{quizResult.correctAnswers}/{quizResult.totalQuestions}</div>
                                <div className="stat-label">Răspunsuri Corecte</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">{Math.floor(quizResult.timeTaken / 60)}:{(quizResult.timeTaken % 60).toString().padStart(2, '0')}</div>
                                <div className="stat-label">Timp Total</div>
                            </div>
                        </div>

                        <div className="result-details">
                            <h3>Detalii Răspunsuri</h3>
                            <div className="answer-list">
                                {quizResult.answers.map((answer, index) => (
                                    <div key={index} className={`answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                                        <div className="answer-number">
                                            {answer.isCorrect ? '✓' : '✗'} Întrebarea {index + 1}
                                        </div>
                                        <div className="answer-status">
                                            {answer.isCorrect ? 'Corect' : 'Incorect'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="result-actions">
                            <button className="btn-primary" onClick={resetQuiz}>
                                Înapoi la Categorii
                            </button>
                            <button className="btn-secondary" onClick={() => {
                                setQuizResult(null);
                                startQuiz(quizResult.categoryId);
                            }}>
                                Reîncearcă Testul
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render quiz interface
    if (quizSession && currentQuestion) {
        return (
            <div className="tests-page">
                <div className="container">
                    <div className="quiz-header">
                        <button className="back-btn" onClick={resetQuiz}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="19" y1="12" x2="5" y2="12" />
                                <polyline points="12 19 5 12 12 5" />
                            </svg>
                            Înapoi
                        </button>
                        <h2>{getCategoryById(quizSession.categoryId)?.title}</h2>
                    </div>

                    <div className="quiz-progress">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="progress-text">
                            Întrebarea {quizSession.currentQuestionIndex + 1} din {quizSession.questions.length}
                        </div>
                    </div>

                    <div className="quiz-question-card">
                        <div className="question-number">Întrebarea {quizSession.currentQuestionIndex + 1}</div>
                        <h3 className="question-text">{currentQuestion.text}</h3>

                        <div className="question-options">
                            {currentQuestion.options.map((option, index) => (
                                <button
                                    key={index}
                                    className={`option-btn ${quizSession.answers[quizSession.currentQuestionIndex] === index ? 'selected' : ''}`}
                                    onClick={() => selectAnswer(index)}
                                >
                                    <div className="option-radio">
                                        {quizSession.answers[quizSession.currentQuestionIndex] === index && (
                                            <div className="option-radio-inner"></div>
                                        )}
                                    </div>
                                    <span className="option-text">{option}</span>
                                </button>
                            ))}
                        </div>

                        <div className="quiz-navigation">
                            <button
                                className="btn-secondary"
                                onClick={previousQuestion}
                                disabled={quizSession.currentQuestionIndex === 0}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="19" y1="12" x2="5" y2="12" />
                                    <polyline points="12 19 5 12 12 5" />
                                </svg>
                                Anterior
                            </button>

                            {isLastQuestion ? (
                                <button
                                    className="btn-submit"
                                    onClick={submitQuiz}
                                    disabled={!canProceed}
                                >
                                    Finalizează Testul
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </button>
                            ) : (
                                <button
                                    className="btn-primary"
                                    onClick={nextQuestion}
                                    disabled={!canProceed}
                                >
                                    Următoarea
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render category selection
    return (
        <div className="tests-page">
            <div className="container">
                <div className="page-header">
                    <h1>Teste de Pregătire</h1>
                    <p className="page-subtitle">
                        Exersați-vă cunoștințele pentru examenul de certificare electoral. Alegeți o categorie pentru a începe.
                    </p>
                </div>

                <div className="quiz-categories">
                    {quizCategories.map((category) => (
                        <div key={category.id} className="quiz-category-card">
                            <div className="category-icon">{category.icon}</div>
                            <h3>{category.title}</h3>
                            <p className="category-description">{category.description}</p>

                            <div className="category-meta">
                                <div className="meta-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    <span>{category.estimatedTime} min</span>
                                </div>
                                <div className="meta-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                    <span>{category.questionCount} întrebări</span>
                                </div>
                                <div className="meta-item">
                                    <span className={`difficulty-badge ${category.difficulty}`}>
                                        {category.difficulty === 'beginner' ? 'Începător' :
                                            category.difficulty === 'intermediate' ? 'Intermediar' : 'Avansat'}
                                    </span>
                                </div>
                            </div>

                            <button className="btn-start-quiz" onClick={() => startQuiz(category.id)}>
                                Începe Testul
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>

                <div className="info-box">
                    <div className="info-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                    </div>
                    <div className="info-content">
                        <h4>Informații despre Teste</h4>
                        <ul>
                            <li>Fiecare test conține întrebări cu variante multiple de răspuns</li>
                            <li>Puteți naviga înainte și înapoi între întrebări</li>
                            <li>Scorul minim de promovare este 70%</li>
                            <li>Puteți relua testul de câte ori doriți</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestsPage;
