type QuestionOptionButtonProps = {
    index: number;
    option: string;
    selected: boolean;
    stateClass: string;
    disabled?: boolean;
    onSelect: (index: number) => void;
};

export default function QuestionOptionButton({
    index,
    option,
    selected,
    stateClass,
    disabled = false,
    onSelect,
}: QuestionOptionButtonProps) {
    return (
        <button
            className={`option-btn ${selected ? "selected" : ""} ${stateClass}`.trim()}
            disabled={disabled}
            onClick={() => onSelect(index)}
            type="button"
        >
            <span className="option-prefix">{String.fromCharCode(65 + index)}</span>
            <span className="option-text">{option}</span>
        </button>
    );
}
