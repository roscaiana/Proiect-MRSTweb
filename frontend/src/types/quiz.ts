export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  explanation?: string;
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

export interface QuizSession {
  categoryId: string;
  questions: Question[];
  currentQuestionIndex: number;
  answers: (number | null)[];
  startTime: Date;
  endTime?: Date;
}

export interface QuizResult {
  categoryId: string;
  categoryTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number; // percentage
  timeTaken: number; // in seconds
  answers: {
    questionId: string;
    userAnswer: number | null;
    correctAnswer: number;
    isCorrect: boolean;
  }[];
}
