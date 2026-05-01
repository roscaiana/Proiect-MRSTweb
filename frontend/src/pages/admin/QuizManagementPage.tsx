import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { answerOptionService, questionService, quizService } from "../../services";
import type {
    AnswerOptionInfoDto,
    QuestionInfoDto,
    QuizInfoDto,
} from "../../services/types";
import { ROUTES } from "../../routes/paths";

type QuizFormState = {
    title: string;
    description: string;
};

type QuestionFormState = {
    text: string;
};

type AnswerOptionFormState = {
    text: string;
    isCorrect: boolean;
};

const emptyQuizForm: QuizFormState = { title: "", description: "" };
const emptyQuestionForm: QuestionFormState = { text: "" };
const emptyAnswerForm: AnswerOptionFormState = { text: "", isCorrect: false };

export default function QuizManagementPage() {
    const [quizzes, setQuizzes] = useState<QuizInfoDto[]>([]);
    const [questions, setQuestions] = useState<QuestionInfoDto[]>([]);
    const [answerOptions, setAnswerOptions] = useState<AnswerOptionInfoDto[]>([]);

    const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
    const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

    const [quizForm, setQuizForm] = useState<QuizFormState>(emptyQuizForm);
    const [editingQuizId, setEditingQuizId] = useState<number | null>(null);

    const [questionForm, setQuestionForm] = useState<QuestionFormState>(emptyQuestionForm);
    const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);

    const [answerForm, setAnswerForm] = useState<AnswerOptionFormState>(emptyAnswerForm);
    const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const showError = (err: unknown) => {
        const message = err instanceof Error ? err.message : "A apărut o eroare necunoscută.";
        setErrorMessage(message);
        setSuccessMessage(null);
    };

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setErrorMessage(null);
    };

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [quizList, questionList, answerList] = await Promise.all([
                quizService.getAll(),
                questionService.getAll(),
                answerOptionService.getAll(),
            ]);
            setQuizzes(quizList);
            setQuestions(questionList);
            setAnswerOptions(answerList);
            setErrorMessage(null);
        } catch (err) {
            showError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const filteredQuestions = selectedQuizId
        ? questions.filter((q) => q.quizId === selectedQuizId)
        : [];

    const filteredAnswers = selectedQuestionId
        ? answerOptions.filter((a) => a.questionId === selectedQuestionId)
        : [];

    // ------ Quiz CRUD ------
    const handleQuizSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!quizForm.title.trim()) {
            setErrorMessage("Titlul este obligatoriu.");
            return;
        }
        try {
            if (editingQuizId === null) {
                await quizService.create({
                    title: quizForm.title.trim(),
                    description: quizForm.description.trim() || null,
                });
                showSuccess("Quiz creat cu succes.");
            } else {
                await quizService.update(editingQuizId, {
                    title: quizForm.title.trim(),
                    description: quizForm.description.trim() || null,
                });
                showSuccess("Quiz actualizat cu succes.");
            }
            setQuizForm(emptyQuizForm);
            setEditingQuizId(null);
            await loadAll();
        } catch (err) {
            showError(err);
        }
    };

    const startEditQuiz = (quiz: QuizInfoDto) => {
        setEditingQuizId(quiz.id);
        setQuizForm({
            title: quiz.title,
            description: quiz.description ?? "",
        });
    };

    const cancelEditQuiz = () => {
        setEditingQuizId(null);
        setQuizForm(emptyQuizForm);
    };

    const deleteQuiz = async (id: number) => {
        if (!confirm("Ești sigur că vrei să ștergi acest quiz? Toate întrebările asociate vor fi șterse.")) {
            return;
        }
        try {
            await quizService.remove(id);
            if (selectedQuizId === id) {
                setSelectedQuizId(null);
                setSelectedQuestionId(null);
            }
            showSuccess("Quiz șters cu succes.");
            await loadAll();
        } catch (err) {
            showError(err);
        }
    };

    // ------ Question CRUD ------
    const handleQuestionSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!selectedQuizId) {
            setErrorMessage("Selectează mai întâi un quiz.");
            return;
        }
        if (!questionForm.text.trim()) {
            setErrorMessage("Textul întrebării este obligatoriu.");
            return;
        }
        try {
            if (editingQuestionId === null) {
                await questionService.create({
                    text: questionForm.text.trim(),
                    quizId: selectedQuizId,
                });
                showSuccess("Întrebare creată cu succes.");
            } else {
                await questionService.update(editingQuestionId, {
                    text: questionForm.text.trim(),
                });
                showSuccess("Întrebare actualizată cu succes.");
            }
            setQuestionForm(emptyQuestionForm);
            setEditingQuestionId(null);
            await loadAll();
        } catch (err) {
            showError(err);
        }
    };

    const startEditQuestion = (question: QuestionInfoDto) => {
        setEditingQuestionId(question.id);
        setQuestionForm({ text: question.text });
    };

    const cancelEditQuestion = () => {
        setEditingQuestionId(null);
        setQuestionForm(emptyQuestionForm);
    };

    const deleteQuestion = async (id: number) => {
        if (!confirm("Ești sigur că vrei să ștergi această întrebare?")) return;
        try {
            await questionService.remove(id);
            if (selectedQuestionId === id) setSelectedQuestionId(null);
            showSuccess("Întrebare ștearsă cu succes.");
            await loadAll();
        } catch (err) {
            showError(err);
        }
    };

    // ------ AnswerOption CRUD ------
    const handleAnswerSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!selectedQuestionId) {
            setErrorMessage("Selectează mai întâi o întrebare.");
            return;
        }
        if (!answerForm.text.trim()) {
            setErrorMessage("Textul răspunsului este obligatoriu.");
            return;
        }
        try {
            if (editingAnswerId === null) {
                await answerOptionService.create({
                    text: answerForm.text.trim(),
                    isCorrect: answerForm.isCorrect,
                    questionId: selectedQuestionId,
                });
                showSuccess("Răspuns creat cu succes.");
            } else {
                await answerOptionService.update(editingAnswerId, {
                    text: answerForm.text.trim(),
                    isCorrect: answerForm.isCorrect,
                });
                showSuccess("Răspuns actualizat cu succes.");
            }
            setAnswerForm(emptyAnswerForm);
            setEditingAnswerId(null);
            await loadAll();
        } catch (err) {
            showError(err);
        }
    };

    const startEditAnswer = (answer: AnswerOptionInfoDto) => {
        setEditingAnswerId(answer.id);
        setAnswerForm({ text: answer.text, isCorrect: answer.isCorrect });
    };

    const cancelEditAnswer = () => {
        setEditingAnswerId(null);
        setAnswerForm(emptyAnswerForm);
    };

    const deleteAnswer = async (id: number) => {
        if (!confirm("Ești sigur că vrei să ștergi acest răspuns?")) return;
        try {
            await answerOptionService.remove(id);
            showSuccess("Răspuns șters cu succes.");
            await loadAll();
        } catch (err) {
            showError(err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Administrare Quiz-uri (API)</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            CRUD complet prin API-ul backend — Lab 4.
                        </p>
                    </div>
                    <Link
                        to={ROUTES.ADMIN_DASHBOARD}
                        className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                    >
                        ← Înapoi la Admin
                    </Link>
                </div>

                {errorMessage && (
                    <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
                        {errorMessage}
                    </div>
                )}
                {successMessage && (
                    <div className="mb-4 rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-800">
                        {successMessage}
                    </div>
                )}
                {loading && (
                    <div className="mb-4 rounded-lg border border-blue-300 bg-blue-50 p-4 text-sm text-blue-800">
                        Se încarcă datele...
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* ---- Quizzes column ---- */}
                    <section className="rounded-lg bg-white p-5 shadow">
                        <h2 className="mb-4 text-xl font-semibold">Quiz-uri</h2>

                        <form onSubmit={handleQuizSubmit} className="mb-4 space-y-2">
                            <input
                                type="text"
                                placeholder="Titlu"
                                value={quizForm.title}
                                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                            />
                            <textarea
                                placeholder="Descriere (opțional)"
                                value={quizForm.description}
                                onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                                rows={2}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    {editingQuizId === null ? "Adaugă" : "Salvează"}
                                </button>
                                {editingQuizId !== null && (
                                    <button
                                        type="button"
                                        onClick={cancelEditQuiz}
                                        className="rounded bg-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-300"
                                    >
                                        Anulează
                                    </button>
                                )}
                            </div>
                        </form>

                        <ul className="space-y-2">
                            {quizzes.length === 0 && !loading && (
                                <li className="text-sm text-gray-500">Nu există quiz-uri încă.</li>
                            )}
                            {quizzes.map((quiz) => {
                                const isSelected = selectedQuizId === quiz.id;
                                return (
                                    <li
                                        key={quiz.id}
                                        className={`rounded border p-3 transition ${
                                            isSelected
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-200 bg-white"
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedQuizId(quiz.id);
                                                setSelectedQuestionId(null);
                                            }}
                                            className="w-full text-left"
                                        >
                                            <div className="font-medium text-gray-900">{quiz.title}</div>
                                            {quiz.description && (
                                                <div className="mt-1 text-xs text-gray-600">{quiz.description}</div>
                                            )}
                                        </button>
                                        <div className="mt-2 flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => startEditQuiz(quiz)}
                                                className="text-xs text-blue-600 hover:underline"
                                            >
                                                Editează
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteQuiz(quiz.id)}
                                                className="text-xs text-red-600 hover:underline"
                                            >
                                                Șterge
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    {/* ---- Questions column ---- */}
                    <section className="rounded-lg bg-white p-5 shadow">
                        <h2 className="mb-4 text-xl font-semibold">
                            Întrebări
                            {selectedQuizId && (
                                <span className="ml-2 text-sm font-normal text-gray-500">
                                    (Quiz #{selectedQuizId})
                                </span>
                            )}
                        </h2>

                        {!selectedQuizId ? (
                            <p className="text-sm text-gray-500">Selectează un quiz pentru a gestiona întrebările.</p>
                        ) : (
                            <>
                                <form onSubmit={handleQuestionSubmit} className="mb-4 space-y-2">
                                    <textarea
                                        placeholder="Textul întrebării"
                                        value={questionForm.text}
                                        onChange={(e) => setQuestionForm({ text: e.target.value })}
                                        rows={3}
                                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                        >
                                            {editingQuestionId === null ? "Adaugă" : "Salvează"}
                                        </button>
                                        {editingQuestionId !== null && (
                                            <button
                                                type="button"
                                                onClick={cancelEditQuestion}
                                                className="rounded bg-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-300"
                                            >
                                                Anulează
                                            </button>
                                        )}
                                    </div>
                                </form>

                                <ul className="space-y-2">
                                    {filteredQuestions.length === 0 && (
                                        <li className="text-sm text-gray-500">Nu există întrebări pentru acest quiz.</li>
                                    )}
                                    {filteredQuestions.map((question) => {
                                        const isSelected = selectedQuestionId === question.id;
                                        return (
                                            <li
                                                key={question.id}
                                                className={`rounded border p-3 transition ${
                                                    isSelected
                                                        ? "border-blue-500 bg-blue-50"
                                                        : "border-gray-200 bg-white"
                                                }`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedQuestionId(question.id)}
                                                    className="w-full text-left text-sm text-gray-900"
                                                >
                                                    {question.text}
                                                </button>
                                                <div className="mt-2 flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEditQuestion(question)}
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        Editează
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteQuestion(question.id)}
                                                        className="text-xs text-red-600 hover:underline"
                                                    >
                                                        Șterge
                                                    </button>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </>
                        )}
                    </section>

                    {/* ---- Answer Options column ---- */}
                    <section className="rounded-lg bg-white p-5 shadow">
                        <h2 className="mb-4 text-xl font-semibold">
                            Răspunsuri
                            {selectedQuestionId && (
                                <span className="ml-2 text-sm font-normal text-gray-500">
                                    (Întrebare #{selectedQuestionId})
                                </span>
                            )}
                        </h2>

                        {!selectedQuestionId ? (
                            <p className="text-sm text-gray-500">Selectează o întrebare pentru a gestiona răspunsurile.</p>
                        ) : (
                            <>
                                <form onSubmit={handleAnswerSubmit} className="mb-4 space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Textul răspunsului"
                                        value={answerForm.text}
                                        onChange={(e) => setAnswerForm({ ...answerForm, text: e.target.value })}
                                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                                    />
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={answerForm.isCorrect}
                                            onChange={(e) =>
                                                setAnswerForm({ ...answerForm, isCorrect: e.target.checked })
                                            }
                                        />
                                        Răspuns corect
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                        >
                                            {editingAnswerId === null ? "Adaugă" : "Salvează"}
                                        </button>
                                        {editingAnswerId !== null && (
                                            <button
                                                type="button"
                                                onClick={cancelEditAnswer}
                                                className="rounded bg-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-300"
                                            >
                                                Anulează
                                            </button>
                                        )}
                                    </div>
                                </form>

                                <ul className="space-y-2">
                                    {filteredAnswers.length === 0 && (
                                        <li className="text-sm text-gray-500">Nu există răspunsuri pentru această întrebare.</li>
                                    )}
                                    {filteredAnswers.map((answer) => (
                                        <li
                                            key={answer.id}
                                            className="rounded border border-gray-200 bg-white p-3"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="text-sm text-gray-900">
                                                    {answer.text}
                                                    {answer.isCorrect && (
                                                        <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">
                                                            corect
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-2 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => startEditAnswer(answer)}
                                                    className="text-xs text-blue-600 hover:underline"
                                                >
                                                    Editează
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteAnswer(answer.id)}
                                                    className="text-xs text-red-600 hover:underline"
                                                >
                                                    Șterge
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
