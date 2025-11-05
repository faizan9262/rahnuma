import { create } from "zustand";

// Updated type to include user's answer and evaluation
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

interface QuizState {
  quizzes: { [docId: number]: QuizMCQ[] }; // store quiz per document
  fetchStatus: { [docId: number]: "idle" | "loading" | "loaded" | "error" };
  setQuiz: (docId: number, questions: QuizMCQ[]) => void;
  getQuiz: (docId: number) => QuizMCQ[] | undefined;
  setFetchStatus: (docId: number, status: "idle" | "loading" | "loaded" | "error") => void;

  setAnswer: (
    docId: number,
    questionIndex: number,
    studentAnswer: string,
    verdict: "correct" | "wrong",
    correctAnswer: string,
    explanation: string,
    documentReference: string
  ) => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  quizzes: {},
  fetchStatus: {},

  setQuiz: (docId, questions) =>
    set((state) => ({
      quizzes: { ...state.quizzes, [docId]: questions },
      fetchStatus: { ...state.fetchStatus, [docId]: "loaded" },
    })),

  getQuiz: (docId) => get().quizzes[docId],

  setFetchStatus: (docId, status) =>
    set((state) => ({
      fetchStatus: { ...state.fetchStatus, [docId]: status },
    })),

  setAnswer: (docId, questionIndex, studentAnswer, verdict, correctAnswer, explanation, documentReference) => {
    set((state) => {
      const docQuizzes = state.quizzes[docId];
      if (!docQuizzes || !docQuizzes[questionIndex]) return state;

      const updatedQuestion = {
        ...docQuizzes[questionIndex],
        studentAnswer,
        verdict,
        correctAnswer,
        explanation,
        documentReference,
      };

      const updatedQuizzes = [...docQuizzes];
      updatedQuizzes[questionIndex] = updatedQuestion;

      return {
        quizzes: { ...state.quizzes, [docId]: updatedQuizzes },
      };
    });
  },
}));
