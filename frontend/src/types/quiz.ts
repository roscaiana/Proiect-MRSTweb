export interface QuestionOption {
  id: number;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  explanation?: string;
  chapterId?: string;
  chapterTitle?: string;
}

export interface QuizCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  questionCount: number;
  estimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export type QuizMode = "training" | "exam";

export interface QuizSession {
  categoryId: string;
  mode: QuizMode;
  questions: Question[];
  currentQuestionIndex: number;
  answers: (number | null)[];
  answerFeedback: Array<{
    isCorrect: boolean;
    correctAnswerText: string;
  } | null>;
  flaggedQuestions: boolean[];
  durationSeconds: number;
  remainingTimeSeconds: number;
  startTime: Date;
  endTime?: Date;
}

export interface QuizResult {
  categoryId: string;
  categoryTitle: string;
  mode: QuizMode;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  score: number;
  timeTaken: number;
  durationSeconds: number;
  completedAt: string;
  answers: {
    questionId: string;
    questionText: string;
    chapterId: string;
    chapterTitle: string;
    userAnswer: number | null;
    userAnswerText: string | null;
    correctAnswerText?: string | null;
    isCorrect: boolean;
    wasFlagged: boolean;
  }[];
  chapterStats: {
    chapterId: string;
    chapterTitle: string;
    total: number;
    correct: number;
    accuracy: number;
  }[];
}
