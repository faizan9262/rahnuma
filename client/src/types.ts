import type { UserDocument } from "./stores/documentStore";

export interface QuizMCQ {
  question: string;
  options: string[];
  doc_id?: number;
  context?: string;

  // New fields for answer checking
  studentAnswer?: string;
  verdict?: "correct" | "wrong";
  correctAnswer?: string;
  explanation?: string;
  documentReference?: string;
}


export interface DocumentListProps {
  document: UserDocument[];
}


export type SourceChunk = {
  content: string;
  doc_id: number;
  source: string;
  score: number;
};

export type ChatResponse = {
  answer: string;
  source_chunks: SourceChunk[];
};

export type Message = {
  sender: "user" | "ai";
  text: string;
  sources?: SourceChunk[]; // optional
};

export type AnswerState = "unchecked" | "correct" | "incorrect" | "evaluating";

export type CheckResponse = {
  verdict: "correct" | "partial" | "wrong";
  score: number;
  correct_answer: string;
  explanation: string;
  document_reference: string;
};

export type QuizResult = {
  answers: string[];
  answerStates: AnswerState[];
  responses: (CheckResponse | null)[];
  finalScore: number;
  finalResult: number;
  isSubmitted: boolean;
};

