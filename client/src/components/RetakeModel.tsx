import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "./ui/input";

interface RetakeModalProps {
  open: boolean;
  onClose: () => void;
  onRetake: (difficulty: string, numQuestions: number, topic: string) => void;
  titles: string[];
}

const RetakeModal = ({
  open,
  onClose,
  onRetake,
  titles,
}: Omit<RetakeModalProps, "topics">) => {
  const [difficulty, setDifficulty] = useState("easy");
  const [numQuestions, setNumQuestions] = useState(5);
  const [topic,setTopic] = useState("")

  const handleRetake = () => {
    onRetake(difficulty, numQuestions, topic);
    console.log("Topic,difficulty,quesitons: ", {
      topic,
      difficulty,
      numQuestions,
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
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
          <Button onClick={handleRetake} className="mt-2 w-full">
            Start Quiz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RetakeModal;