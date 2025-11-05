import { type Dispatch, type SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useDocumentStore } from "@/stores/documentStore";

interface QuizDialogProps{
    difficulty:string;
    setDifficulty:Dispatch<SetStateAction<string>>;
    numQuestions:number;
    setNumQuestions:Dispatch<SetStateAction<number>>;
    topic:string;
    setTopic: Dispatch<SetStateAction<string>>;
    loadQuestions: (docId:number, difficulty:string, topic:string) => void;
    docId:number;
    retakeOpen:boolean;
    setRetakeOpen:Dispatch<SetStateAction<boolean>>;
}

const QuizDialog = ({difficulty,setDifficulty,numQuestions,setNumQuestions,topic,setTopic,loadQuestions,docId,retakeOpen,setRetakeOpen}:QuizDialogProps) => {
   const { selectedDoc } = useDocumentStore();
//   const [retakeOpen, setRetakeOpen] = useState(false);

  const titles =
    selectedDoc?.key_topics_json.map((t) => {
      const match = t.match(/\*\*(.*?)\*\*/);
      return match ? match[1] : t;
    }) || [];

  return (
    <Dialog open={retakeOpen} onOpenChange={() => setRetakeOpen(false)}>
      <DialogContent className="w-lg m-auto">
        <DialogHeader>
          <DialogTitle>Retake Quiz</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Difficulty */}
          <div>
            <p className="font-medium mb-1">Select Difficulty</p>
            <RadioGroup
              value={difficulty}
              onValueChange={setDifficulty}
              className="flex gap-4 items-center"
            >
              <RadioGroupItem value="easy" /> Easy
              <RadioGroupItem value="medium" /> Medium
              <RadioGroupItem value="hard" /> Hard
            </RadioGroup>
          </div>

          {/* Number of Questions */}
          <div>
            <p className="font-medium mb-1">Number of Questions</p>
            <Input
              type="number"
              min={1}
              max={50}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full border-2 focus:border-primary rounded-md p-2"
            />
          </div>

          {/* Topic */}
          <div>
            <p className="font-medium mb-1">Select Topic</p>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger className="w-full bg-muted border rounded-md">
                <SelectValue placeholder="Select Topic" />
              </SelectTrigger>
              <SelectContent className="bg-secondary">
                {titles.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              setRetakeOpen(false);
              loadQuestions(docId, difficulty, topic);
            }}
            className="mt-2 w-full"
          >
            Start Quiz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuizDialog;
