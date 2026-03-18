import type { RefObject } from "react";
import type { Question } from "../../types/quiz";

type QuestionNavigationButtonProps = {
    question: Question;
    index: number;
    answer: number | null;
    isCurrent: boolean;
    keyPrefix: string;
    onSelectQuestion: (index: number) => void;
    currentButtonRef?: RefObject<HTMLButtonElement | null>;
};

export default function QuestionNavigationButton({
    question,
    index,
    answer,
    isCurrent,
    keyPrefix,
    onSelectQuestion,
}: QuestionNavigationButtonProps) {
    const isAnswered = answer !== null;
    const isCorrectAnswer = isAnswered && answer === question.correctAnswer;
    const stateClass = !isAnswered ? "empty" : isCorrectAnswer ? "correct" : "incorrect";

    return (
        <button
            ref={isCurrent ? currentButtonRef : undefined}
            type="button"
            onClick={() => onSelectQuestion(index)}
            className={`grid-btn ${stateClass} ${isCurrent ? "current" : ""}`.trim()}
        >
            {index + 1}
        </button>
    );
}
