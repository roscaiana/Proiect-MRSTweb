import React, { useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AdminTest, AdminTestInput } from "../types";
import TestFormQuestionCard from "./TestFormQuestionCard";
import { testFormSchema, type TestFormValues } from "../../../schemas/adminSchemas";

type Props = {
    mode: "create" | "edit";
    initialValue?: AdminTest;
    onSubmit: (payload: AdminTestInput) => void;
    onCancel: () => void;
};

const createEmptyQuestion = (): TestFormValues["questions"][number] => ({
    id: "",
    text: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
});

const buildInitialState = (initialValue?: AdminTest): TestFormValues => {
    if (!initialValue) {
        return {
            title: "",
            description: "",
            durationMinutes: 30,
            passingScore: 70,
            questions: [createEmptyQuestion()],
        };
    }

    return {
        title: initialValue.title,
        description: initialValue.description,
        durationMinutes: initialValue.durationMinutes,
        passingScore: initialValue.passingScore,
        questions: initialValue.questions.length > 0 ? initialValue.questions : [createEmptyQuestion()],
    };
};

const TestForm: React.FC<Props> = ({ mode, initialValue, onSubmit, onCancel }) => {
    const {
        control,
        register,
        handleSubmit,
        reset,
        trigger,
        getValues,
        formState: { errors },
    } = useForm<TestFormValues>({
        resolver: zodResolver(testFormSchema),
        defaultValues: buildInitialState(initialValue),
        mode: "onSubmit",
    });

    useEffect(() => {
        reset(buildInitialState(initialValue));
    }, [initialValue, reset]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: "questions",
    });

    const submitLabel = useMemo(() => (mode === "create" ? "Creeaza test" : "Salveaza modificarile"), [mode]);

    const addQuestion = () => {
        append(createEmptyQuestion());
    };

    const buildPayload = (values: TestFormValues): AdminTestInput => ({
        title: values.title.trim(),
        description: values.description.trim(),
        durationMinutes: values.durationMinutes,
        passingScore: values.passingScore,
        questions: values.questions.map((question) => ({
            id: question.id || "",
            text: question.text.trim(),
            options: question.options.map((option) => option.trim()),
            correctAnswer: question.correctAnswer,
        })),
    });

    const handleFormSubmit = (values: TestFormValues) => {
        onSubmit(buildPayload(values));
    };

    const handleDurationBlur = async () => {
        if (mode !== "edit" || !initialValue) {
            return;
        }

        const currentDuration = getValues("durationMinutes");
        if (currentDuration === initialValue.durationMinutes) {
            return;
        }

        const isValid = await trigger();
        if (!isValid) {
            return;
        }

        onSubmit(buildPayload(getValues()));
    };

    type QuestionError = {
        text?: { message?: string };
        options?: Array<{ message?: string }>;
        correctAnswer?: { message?: string };
    };

    const questionsErrors = Array.isArray(errors.questions) ? (errors.questions as QuestionError[]) : [];
    const questionsErrorMessage =
        !Array.isArray(errors.questions) && errors.questions?.message
            ? String(errors.questions.message)
            : undefined;

    return (
        <form className="admin-form-block" onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="admin-form-grid">
                <label className="admin-field">
                    <span>Titlu test</span>
                    <input
                        type="text"
                        {...register("title")}
                        placeholder="Ex: Simulare legislatie"
                    />
                    {errors.title?.message && (
                        <span className="admin-field-error" role="alert">{errors.title.message}</span>
                    )}
                </label>

                <label className="admin-field">
                    <span>Durata (minute)</span>
                    <input
                        type="number"
                        min={1}
                        max={180}
                        {...register("durationMinutes", { valueAsNumber: true })}
                        onBlur={handleDurationBlur}
                    />
                    {errors.durationMinutes?.message && (
                        <span className="admin-field-error" role="alert">{errors.durationMinutes.message}</span>
                    )}
                </label>

                <label className="admin-field">
                    <span>Prag promovare (%)</span>
                    <input
                        type="number"
                        min={1}
                        max={100}
                        {...register("passingScore", { valueAsNumber: true })}
                    />
                    {errors.passingScore?.message && (
                        <span className="admin-field-error" role="alert">{errors.passingScore.message}</span>
                    )}
                </label>

                <label className="admin-field admin-field-full">
                    <span>Descriere</span>
                    <textarea
                        {...register("description")}
                        rows={3}
                        placeholder="Descriere scurta a testului"
                    />
                </label>
            </div>

            <div className="admin-questions-header">
                <h4>Intrebari</h4>
                <button type="button" className="admin-btn secondary" onClick={addQuestion}>
                    + Adauga intrebare
                </button>
            </div>
            {questionsErrorMessage && <p className="admin-field-error" role="alert">{questionsErrorMessage}</p>}

            <div className="admin-questions-list">
                {fields.map((field, questionIndex) => (
                    <TestFormQuestionCard
                        key={field.id}
                        questionIndex={questionIndex}
                        canRemove={fields.length > 1}
                        onRemove={remove}
                        register={register}
                        control={control}
                        questionError={questionsErrors[questionIndex]}
                    />
                ))}
            </div>

            <div className="admin-form-actions">
                <button type="button" className="admin-btn ghost" onClick={onCancel}>
                    Renunta
                </button>
                <button type="submit" className="admin-btn primary">
                    {submitLabel}
                </button>
            </div>
        </form>
    );
};

export default TestForm;
