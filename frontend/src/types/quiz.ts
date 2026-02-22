export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
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
  estimatedTime: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export type QuizMode = "training" | "exam";

export interface QuizSession {
  categoryId: string;
  mode: QuizMode;
  questions: Question[];
  currentQuestionIndex: number;
  answers: (number | null)[];
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
  score: number; // percentage
  timeTaken: number; // in seconds
  durationSeconds: number;
  completedAt: string;
  answers: {
    questionId: string;
    questionText: string;
    chapterId: string;
    chapterTitle: string;
    userAnswer: number | null;
    userAnswerText: string | null;
    correctAnswer: number;
    correctAnswerText: string;
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
