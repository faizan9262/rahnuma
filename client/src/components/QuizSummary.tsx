import { type Dispatch, type SetStateAction } from "react";
import { type QuizMCQ } from "@/stores/quizStore";
import { Button } from "./ui/button";

interface QuizSummaryProps{
    finalScore:number;
    questions:QuizMCQ[];
    answerStates: ("unchecked" | "correct" | "incorrect")[];
    setSelectedOptions:Dispatch<SetStateAction<string[]>>;
    setAnswerStates:Dispatch<SetStateAction<("unchecked" | "correct" | "incorrect")[]>>;
    setCheckingStates:Dispatch<SetStateAction<boolean[]>>;
    setCurrentIndex:Dispatch<SetStateAction<number>>;
    setFinalScore:Dispatch<SetStateAction<number>>;
    setIsSubmitted:Dispatch<SetStateAction<boolean>>;
}

const QuizSummary = ({
    finalScore,
    questions,
    answerStates,
    setSelectedOptions,
    setAnswerStates,
    setCheckingStates,
    setCurrentIndex,
    setFinalScore,
    setIsSubmitted
}:QuizSummaryProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 bg-background rounded-2xl shadow-2xl text-center animate-fadeIn">
      {/* Trophy / Celebration */}
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-primary">
          Quiz Completed!
        </h2>
      </div>

      {/* Score Circle */}
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            className="text-primary"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="48"
            cx="64"
            cy="64"
          />
          <circle
            className="text-primary"
            strokeWidth="8"
            strokeDasharray={301.44}
            strokeDashoffset={301.44 - (301.44 * finalScore) / questions.length}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="48"
            cx="64"
            cy="64"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-foreground">{finalScore}</p>
          <p className="text-sm text-foreground">/ {questions.length}</p>
          <p className="text-sm text-foreground mt-1">
            {((finalScore / questions.length) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="flex flex-row gap-6">
        <div className="flex flex-col items-center">
          <p className="text-lg font-semibold text-primary">Correct</p>
          <p className="text-xl font-bold text-primary">
            {answerStates.filter((s) => s === "correct").length}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-lg font-semibold text-red-600">Incorrect</p>
          <p className="text-xl font-bold text-red-700">
            {answerStates.filter((s) => s === "incorrect").length}
          </p>
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-primary/20 h-4 rounded-full overflow-hidden">
          <div
            className="bg-primary h-4 rounded-full transition-all duration-500"
            style={{
              width: `${(finalScore / questions.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      <Button
        className="mt-2 sm:mt-4 px-8 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all"
        onClick={() => {
          setSelectedOptions(Array(questions.length).fill(""));
          setAnswerStates(Array(questions.length).fill("unchecked"));
          setCheckingStates(Array(questions.length).fill(false));
          setCurrentIndex(0);
          setFinalScore(0);
          setIsSubmitted(false);
        }}
      >
        Retake Quiz
      </Button>
    </div>
  );
};

export default QuizSummary;
