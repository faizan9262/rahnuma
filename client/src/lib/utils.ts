import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatAiText = (text: string) => {
  if (!text) return "";

  // Normalize line endings
  let formatted = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Ensure double line breaks for paragraphs
  formatted = formatted.replace(/\n{2,}/g, "\n\n");

  // Convert single line breaks into markdown line breaks
  formatted = formatted.replace(/([^\n])\n([^\n])/g, "$1  \n$2");

  return formatted;
};


