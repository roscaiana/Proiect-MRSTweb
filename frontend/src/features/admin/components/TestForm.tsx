import React, { useMemo, useState } from "react";
import type { AdminQuestion, AdminTest, AdminTestInput } from "../types";

type Props = {
    mode: "create" | "edit";
    initialValue?: AdminTest;
    onSubmit: (payload: AdminTestInput) => void;
    onCancel: () => void;
};

const createEmptyQuestion = (): AdminQuestion => ({
    id: "",
    text: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
});

const buildInitialState = (initialValue?: AdminTest): AdminTestInput => {
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
    const [form, setForm] = useState<AdminTestInput>(() => buildInitialState(initialValue));
    const [error, setError] = useState("");

    const submitLabel = useMemo(
        () => (mode === "create" ? "Creează test" : "Salvează modificările"),
        [mode]
    );

    const addQuestion = () => {
        setForm((prev) => ({
            ...prev,
            questions: [...prev.questions, createEmptyQuestion()],
        }));
    };

    const removeQuestion = (index: number) => {
        setForm((prev) => ({
            ...prev,
            questions: prev.questions.filter((_, questionIndex) => questionIndex !== index),
        }));
    };

    const updateQuestionText = (index: number, value: string) => {
        setForm((prev) => ({
            ...prev,
            questions: prev.questions.map((question, questionIndex) =>
                questionIndex === index ? { ...question, text: value } : question
            ),
        }));
    };

    const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
        setForm((prev) => ({
            ...prev,
            questions: prev.questions.map((question, currentIndex) => {
                if (currentIndex !== questionIndex) {
                    return question;
                }

                const nextOptions = question.options.map((option, currentOptionIndex) =>
                    currentOptionIndex === optionIndex ? value : option
                );

                return {
                    ...question,
                    options: nextOptions,
                };
            }),
        }));
    };

    const updateQuestionCorrectAnswer = (questionIndex: number, value: number) => {
        setForm((prev) => ({
            ...prev,
            questions: prev.questions.map((question, index) =>
                index === questionIndex ? { ...question, correctAnswer: value } : question
            ),
        }));
    };

    const validateForm = (): string => {
        if (!form.title.trim()) {
            return "Titlul testului este obligatoriu.";
        }

        if (form.durationMinutes < 1 || form.durationMinutes > 180) {
            return "Durata testului trebuie să fie între 1 și 180 minute.";
        }

        if (form.passingScore < 1 || form.passingScore > 100) {
            return "Pragul de promovare trebuie să fie între 1 și 100.";
        }

        if (form.questions.length === 0) {
            return "Adaugă cel puțin o întrebare.";
        }

        for (let index = 0; index < form.questions.length; index += 1) {
            const question = form.questions[index];
            if (!question.text.trim()) {
                return `Întrebarea ${index + 1} nu are text completat.`;
            }

            if (question.options.some((option) => !option.trim())) {
                return `Întrebarea ${index + 1} trebuie să aibă toate opțiunile completate.`;
            }

            if (
                question.correctAnswer < 0 ||
                question.correctAnswer >= question.options.length
            ) {
                return `Selectează varianta corectă pentru întrebarea ${index + 1}.`;
            }
        }

        return "";
    };

    const buildPayload = (): AdminTestInput => ({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        questions: form.questions.map((question) => ({
            ...question,
            text: question.text.trim(),
            options: question.options.map((option) => option.trim()),
        })),
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError("");
        onSubmit(buildPayload());
    };

    const handleDurationBlur = () => {
        if (mode !== "edit" || !initialValue) {
            return;
        }

        if (form.durationMinutes === initialValue.durationMinutes) {
            return;
        }

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError("");
        onSubmit(buildPayload());
    };

    return (
        <form className="admin-form-block" onSubmit={handleSubmit}>
            <div className="admin-form-grid">
                <label className="admin-field">
                    <span>Titlu test</span>
                    <input
                        type="text"
                        value={form.title}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, title: event.target.value }))
                        }
                        placeholder="Ex: Simulare legislație"
                    />
                </label>

                <label className="admin-field">
                    <span>Durata (minute)</span>
                    <input
                        type="number"
                        min={1}
                        max={180}
                        value={form.durationMinutes}
                        onChange={(event) =>
                            setForm((prev) => ({
                                ...prev,
                                durationMinutes: Number(event.target.value) || 0,
                            }))
                        }
                        onBlur={handleDurationBlur}
                    />
                </label>

                <label className="admin-field">
                    <span>Prag promovare (%)</span>
                    <input
                        type="number"
                        min={1}
                        max={100}
                        value={form.passingScore}
                        onChange={(event) =>
                            setForm((prev) => ({
                                ...prev,
                                passingScore: Number(event.target.value) || 0,
                            }))
                        }
                    />
                </label>

                <label className="admin-field admin-field-full">
                    <span>Descriere</span>
                    <textarea
                        value={form.description}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, description: event.target.value }))
                        }
                        rows={3}
                        placeholder="Descriere scurtă a testului"
                    />
                </label>
            </div>

            <div className="admin-questions-header">
                <h4>Întrebări</h4>
                <button type="button" className="admin-btn secondary" onClick={addQuestion}>
                    + Adaugă întrebare
                </button>
            </div>

            <div className="admin-questions-list">
                {form.questions.map((question, questionIndex) => (
                    <article className="admin-question-card" key={`${question.id}-${questionIndex}`}>
                        <div className="admin-question-card-header">
                            <h5>Întrebarea {questionIndex + 1}</h5>
                            {form.questions.length > 1 && (
                                <button
                                    type="button"
                                    className="admin-text-btn danger"
                                    onClick={() => removeQuestion(questionIndex)}
                                >
                                    Șterge
                                </button>
                            )}
                        </div>

                        <label className="admin-field">
                            <span>Text întrebare</span>
                            <textarea
                                value={question.text}
                                onChange={(event) =>
                                    updateQuestionText(questionIndex, event.target.value)
                                }
                                rows={2}
                            />
                        </label>

                        <div className="admin-options-grid">
                            {question.options.map((option, optionIndex) => (
                                <label className="admin-field" key={optionIndex}>
                                    <span>Opțiunea {optionIndex + 1}</span>
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(event) =>
                                            updateQuestionOption(
                                                questionIndex,
                                                optionIndex,
                                                event.target.value
                                            )
                                        }
                                    />
                                </label>
                            ))}
                        </div>

                        <label className="admin-field">
                            <span>Varianta corectă</span>
                            <select
                                value={question.correctAnswer}
                                onChange={(event) =>
                                    updateQuestionCorrectAnswer(
                                        questionIndex,
                                        Number(event.target.value)
                                    )
                                }
                            >
                                {question.options.map((_, optionIndex) => (
                                    <option key={optionIndex} value={optionIndex}>
                                        Opțiunea {optionIndex + 1}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </article>
                ))}
            </div>

            {error && <p className="admin-form-error">{error}</p>}

            <div className="admin-form-actions">
                <button type="button" className="admin-btn ghost" onClick={onCancel}>
                    Renunță
                </button>
                <button type="submit" className="admin-btn primary">
                    {submitLabel}
                </button>
            </div>
        </form>
    );
};

export default TestForm;
