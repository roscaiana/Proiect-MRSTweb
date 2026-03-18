import React from "react";
import type { Question } from "../../types/quiz";
import QuestionNavigationButton from "./QuestionNavigationButton";

type Props = {
    questions: Question[];
    answers: Array<number | null>;
    currentQuestionIndex: number;
    onSelectQuestion: (index: number) => void;
    currentButtonRef?: React.RefObject<HTMLButtonElement | null>;
    keyPrefix?: string;
};

const QuestionNavigationGrid: React.FC<Props> = ({
    questions,
    answers,
    currentQuestionIndex,
    onSelectQuestion,
    currentButtonRef,
    keyPrefix = "nav",
}) => {
    return (
        <div className="question-grid">
            {questions.map((question, index) => (
                <QuestionNavigationButton
                    key={`${keyPrefix}-${question.id || index}`}
                    question={question}
                    index={index}
                    answer={answers[index]}
                    isCurrent={index === currentQuestionIndex}
                    keyPrefix={keyPrefix}
                    onSelectQuestion={onSelectQuestion}
                    currentButtonRef={currentButtonRef}
                />
            ))}
        </div>
    );
};

export default QuestionNavigationGrid;
