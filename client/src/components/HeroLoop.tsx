"use client";
import { motion } from "framer-motion";
import {
  BookOpen,
  Image,
  FileText,
  Search,
  MessageCircle,
  Lightbulb,
  BarChart3,
  PenTool,
  Rocket,
} from "lucide-react";

export default function HeroRightLoop() {
  // Inputs: notes, images, files, research, chats
  const inputs = [BookOpen, Image, FileText, Search, MessageCircle];
  // Outputs: answers, analysis, quizzes, insights
  const outputs = [Lightbulb, BarChart3, PenTool, Rocket];

  // Random vertical offset for natural movement
  const randomY = (range: number = 60) =>
    Math.floor(Math.random() * range - range / 2);

  return (
    <div className="flex-1 hidden md:flex items-center justify-center relative overflow-hidden">
      {/* AI Brain */}
      {/* <div className="w-32 h-32 rounded-full flex items-center justify-center text-background text-5xl relative z-10">
        🤖
      </div> */}

      <div className="w-40 h-40 rounded-full flex items-center justify-center relative z-10">
        <motion.div
          initial={{ scale: 0.9, rotate: -5 }}
          animate={{ scale: [0.95, 1.05, 0.95], rotate: [-3, 3, -3] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="font-bold text-2xl text-white bg-gradient-to-r from-primary to-secondary py-4 rounded-full px-10 border-2 border-primary shadow-xl flex items-center justify-center relative"
        >
          راہنما
          {/* Subtle glowing ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary opacity-40"
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
        </motion.div>
      </div>

      {/* Inputs (entering from left) */}
      {inputs.map((Icon, i) => {
        const yOffset = randomY(80);
        return (
          <motion.div
            key={`in-${i}`}
            initial={{ x: -250, y: yOffset, opacity: 0, scale: 0.7 }}
            animate={{ x: 0, y: 0, opacity: [0, 1, 0], scale: [0.7, 1, 0.5] }}
            transition={{
              repeat: Infinity,
              duration: 5,
              delay: i * 0.8,
              ease: "easeInOut",
            }}
            className="absolute p-3 rounded-full bg-background border border-secondary shadow-md z-0"
          >
            <Icon className="w-6 h-6 text-primary" />
          </motion.div>
        );
      })}

      {/* Outputs (exiting to right) */}
      {outputs.map((Icon, i) => {
        const yOffset = randomY(80);
        return (
          <motion.div
            key={`out-${i}`}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
            animate={{
              x: 250,
              y: yOffset,
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.7],
            }}
            transition={{
              repeat: Infinity,
              duration: 5,
              delay: i * 0.8 + 0.5,
              ease: "easeInOut",
            }}
            className="absolute p-3 rounded-full bg-background border border-secondary shadow-md z-0"
          >
            <Icon className="w-6 h-6 text-primary" />
          </motion.div>
        );
      })}
    </div>
  );
}
