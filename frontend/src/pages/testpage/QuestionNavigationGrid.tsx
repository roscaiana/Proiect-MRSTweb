import React from "react";
import type { Question } from "../../types/quiz";
import QuestionNavigationButton from "./QuestionNavigationButton";

type Props = {
    questions: Question[];
    answers: Array<number | null>;
    answerFeedback?: Array<{ isCorrect: boolean } | null>;
    currentQuestionIndex: number;
    showEvaluation?: boolean;
    onSelectQuestion: (index: number) => void;
    gridRef?: React.Ref<HTMLDivElement>;
    keyPrefix?: string;
};

const QuestionNavigationGrid: React.FC<Props> = ({
    questions,
    answers,
    answerFeedback = [],
    currentQuestionIndex,
    showEvaluation = false,
    onSelectQuestion,
    gridRef,
    keyPrefix = "nav",
}) => {
    return (
        <div className="question-grid" ref={gridRef}>
            {questions.map((question, index) => {
                const answer = answers[index];
                const feedback = answerFeedback[index];
                const status = answer === null
                    ? "empty"
                    : !showEvaluation
                      ? "answered"
                      : feedback?.isCorrect
                        ? "correct"
                        : "incorrect";

                return (
                    <QuestionNavigationButton
                        key={`${keyPrefix}-${question.id || index}`}
                        index={index}
                        answer={answer}
                        status={status}
                        isCurrent={index === currentQuestionIndex}
                        keyPrefix={keyPrefix}
                        onSelectQuestion={onSelectQuestion}
                    />
                );
            })}
        </div>
    );
};

export default QuestionNavigationGrid;
