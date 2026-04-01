import React from 'react';
import { ClipboardList } from 'lucide-react';
import type { ExamSettings } from '../../../features/admin/types';
import type { QuizCategory, QuizMode } from '../../../types/quiz';
import QuizCategoryCard from '../QuizCategoryCard';
import { difficultyLabel, modeLabel, normalizeText, renderCategoryIcon } from '../testsPageUtils';

type TestsHomeViewProps = {
    quizMode: QuizMode;
    onSelectMode: (mode: QuizMode) => void;
    examSettings: ExamSettings;
    categories: QuizCategory[];
    durationByCategoryId: Record<string, number>;
    onStartQuiz: (categoryId: string) => void;
};

const TestsHomeView: React.FC<TestsHomeViewProps> = ({
    quizMode,
    onSelectMode,
    examSettings,
    categories,
    durationByCategoryId,
    onStartQuiz,
}) => (
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
                        Teste de <span>pregătire</span>
                    </h1>
                    <p className="tests-hero-subtitle">
                        Alege modul de lucru, pornește un test și primește feedback clar despre progresul tău pe capitole.
                    </p>
                    <div className="tests-hero-stats" aria-label="Sumar setări test">
                        <div className="tests-hero-stat">
                            <strong>{examSettings.passingThreshold}%</strong>
                            <span>Prag promovare</span>
                        </div>
                        <div className="tests-hero-stat">
                            <strong>{examSettings.testDurationMinutes} min</strong>
                            <span>Durată implicită</span>
                        </div>
                        <div className="tests-hero-stat">
                            <strong>2 moduri</strong>
                            <span>Antrenament / Examen</span>
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
                            <p className="page-subtitle">Poți exersa cu feedback instant sau simula un examen complet cu cronometru.</p>
                        </div>

                        <div className="quiz-mode-switch" role="tablist" aria-label="Selecție mod test">
                            <button
                                type="button"
                                className={`mode-switch-btn ${quizMode === 'training' ? 'active' : ''}`}
                                onClick={() => onSelectMode('training')}
                            >
                                Antrenament
                                <small>Feedback imediat după fiecare răspuns</small>
                            </button>
                            <button
                                type="button"
                                className={`mode-switch-btn ${quizMode === 'exam' ? 'active' : ''}`}
                                onClick={() => onSelectMode('exam')}
                            >
                                Examen
                                <small>Fără feedback până la finalul testului</small>
                            </button>
                        </div>
                    </section>

                    <section className="tests-info-box tests-rules-card" aria-labelledby="tests-rules-title">
                        <div className="tests-info-content">
                            <h4 id="tests-rules-title">Reguli rapide</h4>
                            <ul>
                                <li>Scor minim de promovare: {examSettings.passingThreshold}%.</li>
                                <li>Durata fiecărui test vine din setarea testului din Admin (fallback global: {examSettings.testDurationMinutes} minute).</li>
                                <li>Înainte de submit primești validare pentru răspunsurile lipsă.</li>
                                <li>După finalizare primești analiza pe capitole și istoric.</li>
                            </ul>
                        </div>
                    </section>
                </div>

                <section className="tests-categories-section" aria-labelledby="tests-categories-title">
                    <div className="tests-section-header">
                        <h2 id="tests-categories-title">Categorii de test</h2>
                        <p>Alege testul care corespunde zonei în care vrei să exersezi mai mult.</p>
                    </div>

                    <div className="quiz-categories">
                        {categories.map((category) => (
                            <QuizCategoryCard
                                key={category.id}
                                id={category.id}
                                title={normalizeText(category.title)}
                                description={normalizeText(category.description)}
                                questionCount={category.questionCount}
                                difficulty={category.difficulty}
                                durationMinutes={durationByCategoryId[category.id] ?? category.estimatedTime}
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

export default TestsHomeView;
