"use client";

import { motion } from "framer-motion";
import { Sparkles, Brain, FileText } from "lucide-react";
import { useState, useEffect } from "react";

export default function LoadingAnimation() {
  const messages = [
    "Analyzing your CV...",
    "Processing document structure...",
    "Extracting key information...",
    "Evaluating content...",
    "Preparing detailed review...",
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.7 }}
        className="bg-white/95 dark:bg-gray-800/95 rounded-3xl p-10 max-w-md mx-4 text-center shadow-2xl border border-gray-200 dark:border-gray-700"
      >
        <div className="mb-8">
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [0.97, 1.03, 0.97],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="w-20 h-20 mx-auto mb-6 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30"
          >
            <Brain className="w-full h-full text-indigo-600 dark:text-indigo-400" />
          </motion.div>
          <motion.h3
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="text-3xl font-bold text-gray-900 dark:text-white mb-3"
          >
            🤖 AI in Progress
          </motion.h3>
          <motion.p
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            className="text-lg text-gray-600 dark:text-gray-300 min-h-[28px] font-medium"
          >
            {messages[currentMessageIndex]}
          </motion.p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-3 bg-gradient-to-r from-indigo-100 via-indigo-200 to-indigo-100 dark:from-indigo-900/30 dark:via-indigo-800/30 dark:to-indigo-900/30 rounded-full overflow-hidden"
            >
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="h-full w-1/2 bg-gradient-to-r from-transparent via-indigo-600 to-transparent rounded-full"
              />
            </motion.div>
          </div>

          <div className="flex justify-center space-x-6">
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [0, -5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: 0,
              }}
            >
              <FileText className="w-7 h-7 text-indigo-500 dark:text-indigo-400" />
            </motion.div>
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: 0.2,
              }}
            >
              <Sparkles className="w-7 h-7 text-indigo-500 dark:text-indigo-400" />
            </motion.div>
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [0, -5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: 0.4,
              }}
            >
              <Brain className="w-7 h-7 text-indigo-500 dark:text-indigo-400" />
            </motion.div>
          </div>

          <motion.p
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="text-sm text-gray-500 dark:text-gray-400 font-medium"
          >
            Creating something special for you... ✨
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}
