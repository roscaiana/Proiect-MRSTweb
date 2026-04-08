import type { ReactNode } from "react";

type QuizCategoryCardProps = {
    id: string;
    title: string;
    description: string;
    questionCount: number;
    difficulty: string;
    durationMinutes: number;
    quizModeLabel: string;
    icon: ReactNode;
    difficultyLabel: string;
    onStart: (categoryId: string) => void;
};

export default function QuizCategoryCard({
    id,
    title,
    description,
    questionCount,
    difficulty,
    durationMinutes,
    quizModeLabel,
    icon,
    difficultyLabel,
    onStart,
}: QuizCategoryCardProps) {
    return (
        <article className="quiz-category-card">
            <div className="category-icon" aria-hidden="true">{icon}</div>
            <h3>{title}</h3>
            <p className="category-description">{description}</p>

            <div className="category-meta">
                <div className="meta-item"><span>Durata test: {durationMinutes} min</span></div>
                <div className="meta-item"><span>{questionCount} întrebări</span></div>
                <div className="meta-item"><span className={`difficulty-badge ${difficulty}`}>{difficultyLabel}</span></div>
            </div>

            <button className="btn-start-quiz" onClick={() => onStart(id)}>
                Începe în modul {quizModeLabel}
            </button>
        </article>
    );
}
