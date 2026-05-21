type QuizAnswerResultItemProps = {
    questionId: string;
    index: number;
    chapterTitle: string;
    questionText: string;
    userAnswerText: string | null;
    correctAnswerText?: string | null;
    isCorrect?: boolean;
};

export default function QuizAnswerResultItem({
    questionId,
    index,
    chapterTitle,
    questionText,
    userAnswerText,
    correctAnswerText,
    isCorrect,
}: QuizAnswerResultItemProps) {
    return (
        <div key={questionId} className={`answer-item ${isCorrect === undefined ? "" : isCorrect ? "correct" : "incorrect"}`.trim()}>
            <div className="answer-header">
                <strong>Intrebarea {index + 1}</strong>
                <span>{chapterTitle}</span>
            </div>
            <p className="answer-question">{questionText}</p>
            <p>Raspunsul tau: <strong>{userAnswerText || "Neselectat"}</strong></p>
            {isCorrect === false && correctAnswerText && <p>Corect: <strong>{correctAnswerText}</strong></p>}
        </div>
    );
}
