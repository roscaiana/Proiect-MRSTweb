import AdminSingleSelect from "./AdminSingleSelect";
import TestFormOptionField from "./TestFormOptionField";
import type { AdminQuestion } from "../types";

type TestFormQuestionCardProps = {
    question: AdminQuestion;
    questionIndex: number;
    canRemove: boolean;
    onRemove: (index: number) => void;
    onTextChange: (index: number, value: string) => void;
    onOptionChange: (questionIndex: number, optionIndex: number, value: string) => void;
    onCorrectAnswerChange: (questionIndex: number, value: number) => void;
};

export default function TestFormQuestionCard({
    question,
    questionIndex,
    canRemove,
    onRemove,
    onTextChange,
    onOptionChange,
    onCorrectAnswerChange,
}: TestFormQuestionCardProps) {
    return (
        <article className="admin-question-card">
            <div className="admin-question-card-header">
                <h5>Întrebarea {questionIndex + 1}</h5>
                {canRemove && (
                    <button type="button" className="admin-text-btn danger" onClick={() => onRemove(questionIndex)}>
                        Șterge
                    </button>
                )}
            </div>

            <label className="admin-field">
                <span>Text întrebare</span>
                <textarea
                    value={question.text}
                    onChange={(event) => onTextChange(questionIndex, event.target.value)}
                    rows={2}
                />
            </label>

            <div className="admin-options-grid">
                {question.options.map((option, optionIndex) => (
                    <TestFormOptionField
                        key={optionIndex}
                        optionIndex={optionIndex}
                        value={option}
                        onChange={(value) => onOptionChange(questionIndex, optionIndex, value)}
                    />
                ))}
            </div>

            <label className="admin-field">
                <span>Varianta corectă</span>
                <AdminSingleSelect
                    ariaLabel={`Selectare varianta corecta pentru intrebarea ${questionIndex + 1}`}
                    options={question.options.map((_, optionIndex) => ({
                        value: String(optionIndex),
                        label: `Opțiunea ${optionIndex + 1}`,
                    }))}
                    value={String(question.correctAnswer)}
                    onChange={(value) => onCorrectAnswerChange(questionIndex, Number(value))}
                />
            </label>
        </article>
    );
}
