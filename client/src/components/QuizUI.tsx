import { useState, useEffect } from "react";
import type { QuizMCQ } from "@/stores/quizStore";
import { useQuizStore } from "@/stores/quizStore";
import { SiKashflow } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { checkAnswer, fetchQuizFromAPI } from "@/libs/apis/search";
import Quiz from "./skeletons/Quiz";
import { useDocumentStore } from "@/stores/documentStore";
import QuizDialog from "./QuizDialog";
import QuizSummary from "./QuizSummary";

interface QuizUIProps {
  docId: number;
}

const QuizUI = ({ docId }: QuizUIProps) => {
  const { getQuiz, setQuiz, fetchStatus, setFetchStatus, quizzes } =
    useQuizStore();
  const { selectedDoc } = useDocumentStore();
  const [questions, setQuestions] = useState<QuizMCQ[]>([]);
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("easy");
  const [topic, setTopic] = useState("");
  const [retakeOpen, setRetakeOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(5);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [answerStates, setAnswerStates] = useState<
    ("unchecked" | "correct" | "incorrect")[]
  >([]);
  const [finalScore, setFinalScore] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [checkingStates, setCheckingStates] = useState<boolean[]>([]);

  const progressValue = ((currentIndex + 1) / questions.length) * 100;
  const currentAnswerState = answerStates[currentIndex];
  const selectedOption = selectedOptions[currentIndex];

  console.log("Quizzes: ", quizzes);

  console.log("Selected Topic: ", topic);

  // Load quiz questions
  const loadQuestions = async (docId: number, diff: string, topic: string) => {
    setFetchStatus(docId, "loading");
    try {
      const data: QuizMCQ[] | undefined = await fetchQuizFromAPI(
        docId,
        diff,
        topic,
        numQuestions
      );
      console.log("Loaded Questions: ", data);

      if (data?.length) {
        setQuestions(data);
        setQuiz(docId, data);
      }
      setFetchStatus(docId, "loaded");
    } catch (err) {
      console.error(err);
      setFetchStatus(docId, "error");
    }
  };

  useEffect(() => {
    const stored = getQuiz(docId);
    if (stored?.length) {
      setQuestions(stored);
      console.log("Stored Questions: ", stored);
    } else {
      loadQuestions(docId, difficulty, topic);
    }
  }, [docId]);
  useEffect(() => {
    if (questions?.length) {
      setSelectedOptions(Array(questions.length).fill(""));
      setAnswerStates(Array(questions.length).fill("unchecked"));
      setCheckingStates(Array(questions.length).fill(false));
      setCurrentIndex(0);
      setIsSubmitted(false);
      setFinalScore(0);
    }
  }, [questions]);

  const handleSelectOption = (option: string) => {
    const newSelected = [...selectedOptions];
    newSelected[currentIndex] = option;
    setSelectedOptions(newSelected);
  };

  console.log("Selected option: ", selectedOptions);

  const handleCheck = async () => {
    const selected = selectedOptions[currentIndex];
    if (!selected) return;

    const newChecking = [...checkingStates];
    newChecking[currentIndex] = true;
    setCheckingStates(newChecking);

    try {
      const res = await checkAnswer(
        questions[currentIndex].question,
        selected,
        selectedDoc?.id ?? null
      );

      useQuizStore
        .getState()
        .setAnswer(
          docId,
          currentIndex,
          selected,
          res.verdict as "correct" | "wrong",
          res.correct_answer,
          res.explanation,
          res.document_reference
        );

      const newAnswerStates = [...answerStates];
      newAnswerStates[currentIndex] =
        res.verdict === "correct" ? "correct" : "incorrect";
      setAnswerStates(newAnswerStates);
    } catch (err) {
      console.error("Answer check failed:", err);
    } finally {
      const updatedChecking = [...checkingStates];
      updatedChecking[currentIndex] = false;
      setCheckingStates(updatedChecking);
    }
  };

  const handleDone = () => {
    const totalCorrect = answerStates.filter((s) => s === "correct").length;
    setFinalScore(totalCorrect);
    setIsSubmitted(true);
  };

  console.log("Quize: ", answerStates[currentIndex] === "unchecked");

  if (fetchStatus[docId] === "loading" || !questions?.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <Quiz />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 md:p-8 lg:p-10 overflow-auto">
      {/* Retake Quiz Modal */}
      <QuizDialog
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        numQuestions={numQuestions}
        setNumQuestions={setNumQuestions}
        topic={topic}
        setTopic={setTopic}
        loadQuestions={loadQuestions}
        docId={docId}
        retakeOpen={retakeOpen}
        setRetakeOpen={setRetakeOpen}
      />

      <div className="flex items-center gap-4 justify-between mb-4">
        <Button
          variant="outline"
          className="hover:bg-primary/20"
          onClick={() => setRetakeOpen(true)}
        >
          Retake Quiz
        </Button>
        <div className="w-1/3">
          <p className="text-center text-sm sm:text-base md:text-base font-medium text-muted-foreground mb-2">
            Question {currentIndex + 1} of {questions.length}
          </p>
          <Progress value={progressValue} className="h-3 w-full rounded-lg" />
        </div>
      </div>

      {isSubmitted ? (
        <QuizSummary
          finalScore={finalScore}
          questions={questions}
          answerStates={answerStates}
          setSelectedOptions={setSelectedOptions}
          setAnswerStates={setAnswerStates}
          setCheckingStates={setCheckingStates}
          setCurrentIndex={setCurrentIndex}
          setFinalScore={setFinalScore}
          setIsSubmitted={setIsSubmitted}
        />
      ) : (
        <>
          <div className="flex-1 mb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4"
              >
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
                  {questions[currentIndex]?.question}
                </h2>
                <div className="flex flex-col gap-4 mt-4">
                  {questions[currentIndex]?.options.map((opt, idx) => {
                    const isSelected = selectedOption === opt;
                    return (
                      <label
                        key={idx}
                        className="flex items-center space-x-3 cursor-pointer p-2 sm:p-3"
                      >
                        <input
                          type="radio"
                          name={`question-${currentIndex}`}
                          value={opt}
                          checked={isSelected}
                          onChange={() => handleSelectOption(opt)}
                          disabled={currentAnswerState !== "unchecked"}
                          className="w-5 h-5 accent-primary"
                        />
                        <span className="text-sm sm:text-base md:text-base lg:text-lg">
                          {opt}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {answerStates[currentIndex] !== "unchecked" && (
                  <>
                    <p className="bg-primary text-secondary p-2 rounded-lg">
                      <strong>Correct Answer:</strong>{" "}
                      {quizzes[docId][currentIndex]?.correctAnswer}
                    </p>
                    <div className="p-2 bg-primary/20 rounded-lg text-sm sm:text-base">
                      {quizzes[docId] && quizzes[docId][currentIndex] && (
                        <p>
                          <strong>Explanation:</strong>{" "}
                          {quizzes[docId][currentIndex]?.explanation}
                        </p>
                      )}
                    </div>
                    <p className="bg-primary/20 p-2 rounded-lg">
                      <strong>Reference:</strong>{" "}
                      {quizzes[docId][currentIndex]?.documentReference}
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="sticky bottom-0 z-50 flex flex-row items-center justify-between gap-2 sm:gap-4 bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-t-xl shadow-md">
            {/* Previous Button */}
            <Button
              size="icon"
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Check Button */}
            <Button
              onClick={handleCheck}
              disabled={
                currentAnswerState !== "unchecked" ||
                checkingStates[currentIndex]
              }
            >
              {checkingStates[currentIndex] ? (
                <span>Checking...</span>
              ) : currentAnswerState === "unchecked" ? (
                <>
                  <SiKashflow className="h-5 w-5 mr-2" /> Check
                </>
              ) : currentAnswerState === "correct" ? (
                "Correct!"
              ) : (
                "Incorrect"
              )}
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button
                size="icon"
                onClick={() =>
                  setCurrentIndex((prev) =>
                    Math.min(prev + 1, questions.length - 1)
                  )
                }
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            ) : (
              currentAnswerState !== "unchecked" && (
                <Button size="icon" variant="default" onClick={handleDone}>
                  <Check className="h-5 w-5" />
                </Button>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default QuizUI;