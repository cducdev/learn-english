export interface Question {
  id: string;
  type: "fill_blank" | "multiple_choice" | "sentence_rearrangement";
  question: string;
  options?: string[];
  answer: string | string[];
  explanation?: string;
}

export interface WrongQuestion extends Question {
  timestamp?: number;
}

export interface Answer {
  question_id: string;
  answer: string | string[];
}

export interface CheckResult {
  correct: boolean;
  explanation?: string;
  correct_answer: string | string[];
}

export interface ExamRequest {
  num_questions: number;
  question_types?: string[];
  topic?: string;
}