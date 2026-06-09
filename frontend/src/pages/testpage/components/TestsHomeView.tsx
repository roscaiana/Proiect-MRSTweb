import React from "react";
import { ClipboardList } from "lucide-react";
import type { ExamSettings } from "../../../features/admin/types";
import type { QuizCategory, QuizMode } from "../../../types/quiz";
import QuizCategoryCard from "../QuizCategoryCard";
import { difficultyLabel, modeLabel, normalizeText, renderCategoryIcon } from "../testsPageUtils";

type TestsHomeViewProps = {
    quizMode: QuizMode;
    onSelectMode: (mode: QuizMode) => void;
    modeWarning?: string;
    examSettings: ExamSettings;
    categories: QuizCategory[];
    durationByCategoryId: Record<string, number>;
    onStartQuiz: (categoryId: string) => void;
};

const TestsHomeView: React.FC<TestsHomeViewProps> = ({
    quizMode,
    onSelectMode,
    modeWarning,
    examSettings,
    categories,
    durationByCategoryId,
    onStartQuiz,
}) => {
    const minimumCorrectAnswers = Math.ceil(
        (examSettings.testQuestionCount * examSettings.passingThreshold) / 100,
    );

    return (
        <div className="tests-page tests-page-home">
            <section className="tests-hero">
                <div className="tests-hero-overlay tests-hero-overlay-right" />
                <div className="tests-hero-overlay tests-hero-overlay-left" />
                <div className="container">
                    <div className="tests-hero-content">
                        <div className="page-hero-badge">
                            <span className="page-hero-badge-icon" aria-hidden="true">
                                <ClipboardList />
                            </span>
                            <span className="uppercase">Simulare examen</span>
                        </div>
                        <h1 className="tests-hero-title">
                            Test de <span>pregătire</span>
                        </h1>
                        <p className="tests-hero-subtitle">
                            Fiecare sesiune extrage aleatoriu {examSettings.testQuestionCount} întrebări din banca oficială și te evaluează în formatul real al testului.
                        </p>
                        <div className="tests-hero-stats" aria-label="Sumar setări test">
                            <div className="tests-hero-stat">
                                <strong>{examSettings.passingThreshold}%</strong>
                                <span>Prag promovare</span>
                            </div>
                            <div className="tests-hero-stat">
                                <strong>{examSettings.testDurationMinutes} min</strong>
                                <span>Durată fixă</span>
                            </div>
                            <div className="tests-hero-stat">
                                <strong>{examSettings.testQuestionCount} întrebări</strong>
                                <span>Selectate aleatoriu</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container tests-home-content">
                <div className="tests-home-panel">
                    <div className="tests-prep-grid">
                        <section className="tests-prep-card" aria-labelledby="tests-mode-title">
                            <div className="page-header">
                                <h2 id="tests-mode-title">Alege modul de lucru</h2>
                                <p className="page-subtitle">Poți exersa cu feedback instant sau simula examenul în condiții reale.</p>
                            </div>

                            <div className="quiz-mode-switch" role="tablist" aria-label="Selecție mod test">
                                <button
                                    type="button"
                                    className={`mode-switch-btn ${quizMode === "training" ? "active" : ""}`}
                                    onClick={() => onSelectMode("training")}
                                >
                                    Antrenament
                                    <small>Vezi imediat dacă răspunsul este corect sau greșit</small>
                                </button>
                                <button
                                    type="button"
                                    className={`mode-switch-btn ${quizMode === "exam" ? "active" : ""}`}
                                    onClick={() => onSelectMode("exam")}
                                >
                                    Examen
                                    <small>Vezi rezultatul doar la finalul celor {examSettings.testQuestionCount} întrebări</small>
                                </button>
                            </div>

                            {modeWarning && (
                                <div className="mode-warning" role="alert">
                                    {modeWarning}
                                </div>
                            )}
                        </section>

                        <section className="tests-info-box tests-rules-card" aria-labelledby="tests-rules-title">
                            <div className="tests-info-content">
                                <h4 id="tests-rules-title">Reguli rapide</h4>
                                <ul>
                                    <li>Fiecare test conține exact {examSettings.testQuestionCount} întrebări random.</li>
                                    <li>Durata fiecărei sesiuni este fixă: {examSettings.testDurationMinutes} minute.</li>
                                    <li>Promovarea se obține la minimum {minimumCorrectAnswers} răspunsuri corecte din {examSettings.testQuestionCount}.</li>
                                    <li>Înainte de trimitere primești validare pentru răspunsurile lipsă.</li>
                                </ul>
                            </div>
                        </section>
                    </div>

                    <section className="tests-categories-section" aria-labelledby="tests-categories-title">
                        <div className="tests-section-header">
                            <h2 id="tests-categories-title">Banca de test</h2>
                            <p>Pornești o sesiune nouă de fiecare dată, cu întrebări extrase aleatoriu din banca oficială.</p>
                        </div>

                        <div className="quiz-categories">
                            {categories.map((category) => (
                                <QuizCategoryCard
                                    key={category.id}
                                    id={category.id}
                                    title={normalizeText(category.title)}
                                    description={normalizeText(category.description)}
                                    questionCount={examSettings.testQuestionCount}
                                    difficulty={category.difficulty}
                                    durationMinutes={durationByCategoryId[category.id] ?? examSettings.testDurationMinutes}
                                    quizModeLabel={modeLabel(quizMode)}
                                    icon={renderCategoryIcon(category.id)}
                                    difficultyLabel={difficultyLabel(category.difficulty)}
                                    onStart={onStartQuiz}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TestsHomeView;
