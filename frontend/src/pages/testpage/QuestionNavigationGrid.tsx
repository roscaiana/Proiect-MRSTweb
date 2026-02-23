import React from 'react';
import type { Question } from '../../types/quiz';

type Props = {
    questions: Question[];
    answers: Array<number | null>;
    currentQuestionIndex: number;
    onSelectQuestion: (index: number) => void;
    gridRef?: React.Ref<HTMLDivElement>;
    keyPrefix?: string;
};

const QuestionNavigationGrid: React.FC<Props> = ({
    questions,
    answers,
    currentQuestionIndex,
    onSelectQuestion,
    gridRef,
    keyPrefix = 'nav',
}) => {
    return (
        <div className="question-grid" ref={gridRef}>
            {questions.map((question, index) => {
                const isCurrent = index === currentQuestionIndex;
                const userAnswer = answers[index];
                const isAnswered = userAnswer !== null;
                const isCorrectAnswer = isAnswered && userAnswer === question.correctAnswer;
                const stateClass = !isAnswered ? 'empty' : isCorrectAnswer ? 'correct' : 'incorrect';
                return (
                    <button
                        key={`${keyPrefix}-${question.id || index}`}
                        type="button"
                        onClick={() => onSelectQuestion(index)}
                        className={`grid-btn ${stateClass} ${isCurrent ? 'current' : ''}`.trim()}
                    >
                        {index + 1}
                    </button>
                );
            })}
        </div>
    );
};

export default QuestionNavigationGrid;
