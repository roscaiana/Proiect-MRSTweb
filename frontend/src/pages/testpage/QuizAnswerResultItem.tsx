type QuizAnswerResultItemProps = {
    questionId: string;
    index: number;
    questionText: string;
    userAnswerText: string | null;
    correctAnswerText?: string | null;
    isCorrect?: boolean;
};

export default function QuizAnswerResultItem({
    questionId,
    index,
    questionText,
    userAnswerText,
    correctAnswerText,
    isCorrect,
}: QuizAnswerResultItemProps) {
    const statusText = isCorrect === undefined ? null : isCorrect ? "Corect" : "Greșit";

    return (
        <div key={questionId} className={`answer-item ${isCorrect === undefined ? "" : isCorrect ? "correct" : "incorrect"}`.trim()}>
            <div className="answer-header">
                <strong>Întrebarea {index + 1}</strong>
            </div>
            {statusText && <div className={`answer-status ${isCorrect ? "correct" : "incorrect"}`}>{statusText}</div>}
            <p className="answer-question">{questionText}</p>
            <p>Răspunsul tău: <strong>{userAnswerText || "Neselectat"}</strong></p>
            {correctAnswerText && <p>Răspuns corect: <strong>{correctAnswerText}</strong></p>}
        </div>
    );
}
