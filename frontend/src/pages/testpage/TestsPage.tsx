import React, { useState, useMemo, useEffect } from 'react';
import { QuizSession, QuizResult } from '../../types/quiz';
import { getQuizCategories, getQuestionsByCategory, getCategoryById } from '../../data/quizData';
import { useAuth } from '../../hooks/useAuth';
import { readExamSettings, readQuizHistory, STORAGE_KEYS, writeQuizHistory } from '../../features/admin/storage';
import './TestsPage.css';

const normalizeText = (value: string): string => {
    if (!value) return '';
    return value
        .replace(/È™|È˜/g, 's')
        .replace(/È›|Èš/g, 't')
        .replace(/Äƒ|Ä‚/g, 'a')
        .replace(/Ã¢|Ã‚/g, 'a')
        .replace(/Ã®|ÃŽ/g, 'i')
        .replace(/Â/g, '')
        .replace(/\uFFFD/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

const renderCategoryIcon = (categoryId: string) => {
    if (categoryId === 'legislative-basics') {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
        );
    }
    if (categoryId === 'procedures') {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="7" y="3" width="10" height="4" rx="1" />
                <path d="M9 3.5h6" />
                <path d="M6 6h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
                <path d="M9 11h6M9 15h6" />
            </svg>
        );
    }
    if (categoryId === 'ethics') {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18" />
                <path d="M5 7h14" />
                <path d="M7 7l-3 5a3 3 0 0 0 6 0L7 7z" />
                <path d="M17 7l-3 5a3 3 0 0 0 6 0l-3-5z" />
                <path d="M8 21h8" />
            </svg>
        );
    }
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="12" rx="2" />
            <path d="M8 21h8" />
            <path d="M10 17v4M14 17v4" />
        </svg>
    );
};

const difficultyLabel = (difficulty: string): string => {
    if (difficulty === 'beginner') return 'Începator';
    if (difficulty === 'intermediate') return 'Intermediar';
    return 'Avansat';
};

const TestsPage: React.FC = () => {
    const { user } = useAuth();
    const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
    const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
    const [categories, setCategories] = useState(() => getQuizCategories());
    const [passThreshold, setPassThreshold] = useState(() => readExamSettings().passingThreshold);

    useEffect(() => {
        const refreshPageData = () => {
            setCategories(getQuizCategories());
            setPassThreshold(readExamSettings().passingThreshold);
        };

        const handleStorage = (event: StorageEvent) => {
            if (event.key === STORAGE_KEYS.tests || event.key === STORAGE_KEYS.settings) {
                refreshPageData();
            }
        };

        const handleAppStorageUpdated = (event: Event) => {
            const customEvent = event as CustomEvent<{ key?: string }>;
            const key = customEvent.detail?.key;
            if (key === STORAGE_KEYS.tests || key === STORAGE_KEYS.settings) {
                refreshPageData();
            }
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener('app-storage-updated', handleAppStorageUpdated as EventListener);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('app-storage-updated', handleAppStorageUpdated as EventListener);
        };
    }, []);

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

    const selectAnswer = (answerIndex: number) => {
        if (!quizSession) return;
        const newAnswers = [...quizSession.answers];
        newAnswers[quizSession.currentQuestionIndex] = answerIndex;
        setQuizSession({ ...quizSession, answers: newAnswers });
    };

    const nextQuestion = () => {
        if (!quizSession) return;
        if (quizSession.currentQuestionIndex < quizSession.questions.length - 1) {
            setQuizSession({ ...quizSession, currentQuestionIndex: quizSession.currentQuestionIndex + 1 });
        }
    };

    const previousQuestion = () => {
        if (!quizSession) return;
        if (quizSession.currentQuestionIndex > 0) {
            setQuizSession({ ...quizSession, currentQuestionIndex: quizSession.currentQuestionIndex - 1 });
        }
    };

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
            categoryTitle: normalizeText(category?.title || ''),
            totalQuestions: quizSession.questions.length,
            correctAnswers,
            score: Math.round((correctAnswers / quizSession.questions.length) * 100),
            timeTaken,
            answers
        };

        const historyEntry = {
            ...result,
            completedAt: endTime.toISOString(),
            userEmail: user?.email,
            userName: user?.fullName
        };

        const history = readQuizHistory();
        writeQuizHistory([historyEntry, ...history]);

        setQuizResult(result);
        setQuizSession(null);
    };

    const resetQuiz = () => {
        setQuizSession(null);
        setQuizResult(null);
    };

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

    if (quizResult) {
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
                        <h2>{passed ? 'Felicitari!' : 'Continua sa exersezi!'}</h2>
                        <p className="result-message">
                            {passed
                                ? 'Ai trecut testul cu succes! Cuno?tin?ele tale sunt la un nivel bun.'
                                : 'Nu te descuraja! Continua sa studiezi ?i vei reu?i.'}
                        </p>

                        <div className="result-stats">
                            <div className="stat-item">
                                <div className="stat-value">{quizResult.score}%</div>
                                <div className="stat-label">Scor Final</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">{quizResult.correctAnswers}/{quizResult.totalQuestions}</div>
                                <div className="stat-label">Raspunsuri Corecte</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">{Math.floor(quizResult.timeTaken / 60)}:{(quizResult.timeTaken % 60).toString().padStart(2, '0')}</div>
                                <div className="stat-label">Timp Total</div>
                            </div>
                        </div>

                        <div className="result-details">
                            <h3>Detalii Raspunsuri</h3>
                            <div className="answer-list">
                                {quizResult.answers.map((answer, index) => (
                                    <div key={index} className={`answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                                        <div className="answer-number">{answer.isCorrect ? 'OK' : 'X'} Întrebarea {index + 1}</div>
                                        <div className="answer-status">{answer.isCorrect ? 'Corect' : 'Incorect'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="result-actions">
                            <button className="btn-primary" onClick={resetQuiz}>Înapoi la Categorii</button>
                            <button className="btn-secondary" onClick={() => { setQuizResult(null); startQuiz(quizResult.categoryId); }}>
                                Reîncearca Testul
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                            Inapoi
                        </button>
                        <h2>{normalizeText(getCategoryById(quizSession.categoryId)?.title || '')}</h2>
                    </div>

                    <div className="quiz-progress">
                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }}></div></div>
                        <div className="progress-text">Întrebarea {quizSession.currentQuestionIndex + 1} din {quizSession.questions.length}</div>
                    </div>

                    <div className="quiz-question-card">
                        <div className="question-number">Întrebarea {quizSession.currentQuestionIndex + 1}</div>
                        <h3 className="question-text">{normalizeText(currentQuestion.text)}</h3>

                        <div className="question-options">
                            {currentQuestion.options.map((option, index) => (
                                <button
                                    key={index}
                                    className={`option-btn ${quizSession.answers[quizSession.currentQuestionIndex] === index ? 'selected' : ''}`}
                                    onClick={() => selectAnswer(index)}
                                >
                                    <div className="option-radio">
                                        {quizSession.answers[quizSession.currentQuestionIndex] === index && <div className="option-radio-inner"></div>}
                                    </div>
                                    <span className="option-text">{normalizeText(option)}</span>
                                </button>
                            ))}
                        </div>

                        <div className="quiz-navigation">
                            <button className="btn-secondary" onClick={previousQuestion} disabled={quizSession.currentQuestionIndex === 0}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="19" y1="12" x2="5" y2="12" />
                                    <polyline points="12 19 5 12 12 5" />
                                </svg>
                                Anterior
                            </button>

                            {isLastQuestion ? (
                                <button className="btn-submit" onClick={submitQuiz} disabled={!canProceed}>
                                    Finalizeaza Testul
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </button>
                            ) : (
                                <button className="btn-primary" onClick={nextQuestion} disabled={!canProceed}>
                                    Urmatoarea
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

    return (
        <div className="tests-page">
            <div className="container">
                <div className="page-header">
                    <h1>Teste de Pregatire</h1>
                    <p className="page-subtitle">Exerseaza-?i cuno?tin?ele pentru examenul de certificare electorala. Alege o categorie pentru a începe.</p>
                </div>

                <div className="quiz-categories">
                    {categories.map((category) => {
                        const categoryTitle = normalizeText(category.title);
                        const categoryDescription = normalizeText(category.description);
                        return (
                            <div key={category.id} className="quiz-category-card">
                                <div className="category-icon" aria-hidden="true">{renderCategoryIcon(category.id)}</div>
                                <h3>{categoryTitle}</h3>
                                <p className="category-description">{categoryDescription}</p>

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
                                        <span>{category.questionCount} întrebari</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className={`difficulty-badge ${category.difficulty}`}>{difficultyLabel(category.difficulty)}</span>
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
                        );
                    })}
                </div>

                <div className="tests-info-box">
                    <div className="tests-info-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                    </div>
                    <div className="tests-info-content">
                        <h4>Informa?ii despre Teste</h4>
                        <ul>
                            <li>Fiecare test contine întrebari cu variante multiple de raspuns.</li>
                            <li>Po?i naviga înainte ?i înapoi între întrebari.</li>
                            <li>Scorul minim de promovare este {passThreshold}%.</li>
                            <li>Po?i relua testul de câte ori dore?ti.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestsPage;






