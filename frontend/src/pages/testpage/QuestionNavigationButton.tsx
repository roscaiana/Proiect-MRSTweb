type QuestionNavigationButtonProps = {
    index: number;
    answer: number | null;
    status?: "correct" | "incorrect" | "answered" | "empty";
    isCurrent: boolean;
    keyPrefix: string;
    onSelectQuestion: (index: number) => void;
};

export default function QuestionNavigationButton({
    index,
    answer,
    status,
    isCurrent,
    keyPrefix,
    onSelectQuestion,
}: QuestionNavigationButtonProps) {
    const stateClass = status || (answer !== null ? "answered" : "empty");

    return (
        <button
            type="button"
            onClick={() => onSelectQuestion(index)}
            className={`grid-btn ${stateClass} ${isCurrent ? "current" : ""}`.trim()}
        >
            {index + 1}
        </button>
    );
}
