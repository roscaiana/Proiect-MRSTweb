import { Controller, type Control, type FieldPath, type UseFormRegister } from "react-hook-form";
import AdminSingleSelect from "./AdminSingleSelect";
import TestFormOptionField from "./TestFormOptionField";
import type { TestFormValues } from "../../../schemas/adminSchemas";

type TestFormQuestionError = {
    text?: { message?: string };
    options?: Array<{ message?: string }>;
    correctAnswer?: { message?: string };
};

type TestFormQuestionCardProps = {
    questionIndex: number;
    canRemove: boolean;
    onRemove: (index: number) => void;
    register: UseFormRegister<TestFormValues>;
    control: Control<TestFormValues>;
    questionError?: TestFormQuestionError;
};

const OPTION_COUNT = 4;

export default function TestFormQuestionCard({
    questionIndex,
    canRemove,
    onRemove,
    register,
    control,
    questionError,
}: TestFormQuestionCardProps) {
    const optionIndices = Array.from({ length: OPTION_COUNT }, (_, index) => index);

    return (
        <article className="admin-question-card">
            <div className="admin-question-card-header">
                <h5>Intrebarea {questionIndex + 1}</h5>
                {canRemove && (
                    <button type="button" className="admin-text-btn danger" onClick={() => onRemove(questionIndex)}>
                        Sterge
                    </button>
                )}
            </div>

            <input type="hidden" {...register(`questions.${questionIndex}.id` as const)} />

            <label className="admin-field">
                <span>Text intrebare</span>
                <textarea
                    {...register(`questions.${questionIndex}.text` as const)}
                    rows={2}
                />
                {questionError?.text?.message && (
                    <span className="admin-field-error" role="alert">{questionError.text.message}</span>
                )}
            </label>

            <div className="admin-options-grid">
                {optionIndices.map((optionIndex) => (
                    <TestFormOptionField
                        key={optionIndex}
                        optionIndex={optionIndex}
                        name={`questions.${questionIndex}.options.${optionIndex}` as FieldPath<TestFormValues>}
                        register={register}
                        errorMessage={questionError?.options?.[optionIndex]?.message}
                    />
                ))}
            </div>

            <label className="admin-field">
                <span>Varianta corecta</span>
                <Controller
                    control={control}
                    name={`questions.${questionIndex}.correctAnswer` as const}
                    render={({ field }) => (
                        <AdminSingleSelect
                            ariaLabel={`Selectare varianta corecta pentru intrebarea ${questionIndex + 1}`}
                            options={optionIndices.map((_, optionIndex) => ({
                                value: String(optionIndex),
                                label: `Optiunea ${optionIndex + 1}`,
                            }))}
                            value={String(field.value ?? 0)}
                            onChange={(value) => field.onChange(Number(value))}
                        />
                    )}
                />
                {questionError?.correctAnswer?.message && (
                    <span className="admin-field-error" role="alert">{questionError.correctAnswer.message}</span>
                )}
            </label>
        </article>
    );
}
