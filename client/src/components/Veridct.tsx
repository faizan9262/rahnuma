import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "./ui/button";
import type { CheckResponse } from "@/types";

interface VerdictProps {
  responses: (CheckResponse | null)[];
  currentIndex: number;
}

const Verdict: React.FC<VerdictProps> = ({ responses, currentIndex }) => {
  const res = responses[currentIndex];
  if (!res) return null;

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="outline" className="hover:bg-primary/20">
          <Tooltip>
            <TooltipTrigger>
              <span
                className={`font-bold ${
                  res.verdict === "correct"
                    ? "text-green-600"
                    : res.verdict === "partial"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {res.verdict.toUpperCase()}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>See More Details</p>
            </TooltipContent>
          </Tooltip>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-secondary">
          <p><strong>Reference:</strong> {res.document_reference}</p>
      </PopoverContent>
    </Popover>
  );
};

export default Verdict;
