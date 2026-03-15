type QuizAnswerResultItemProps = {
    questionId: string;
    index: number;
    chapterTitle: string;
    questionText: string;
    userAnswerText: string | null;
    correctAnswerText: string;
    isCorrect: boolean;
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
        <div key={questionId} className={`answer-item ${isCorrect ? "correct" : "incorrect"}`}>
            <div className="answer-header">
                <strong>Întrebarea {index + 1}</strong>
                <span>{chapterTitle}</span>
            </div>
            <p className="answer-question">{questionText}</p>
            <p>Răspunsul tău: <strong>{userAnswerText || "Neselectat"}</strong></p>
            {!isCorrect && <p>Corect: <strong>{correctAnswerText}</strong></p>}
        </div>
    );
}
