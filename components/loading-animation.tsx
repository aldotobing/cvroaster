"use client";

import { motion } from "framer-motion";
import { Sparkles, Brain, FileText } from "lucide-react";
import { useState, useEffect } from "react";

export default function LoadingAnimation() {
  const messages = [
    { text: "Analyzing your CV...", icon: "🔍" },
    { text: "Processing document structure...", icon: "📄" },
    { text: "Extracting key information...", icon: "💡" },
    { text: "Evaluating content...", icon: "📊" },
    { text: "Finalizing your review...", icon: "✨" },
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      // Wait for the fade out animation to complete before changing the message
      setTimeout(() => {
        setCurrentMessageIndex((prevIndex) => {
          if (prevIndex < messages.length - 1) {
            return prevIndex + 1;
          } else {
            // Clear interval when we reach the last message
            clearInterval(interval);
            return prevIndex;
          }
        });
        setIsAnimating(false);
      }, 300); // Matches the transition duration below
      
    }, 2500); // Total time per message (including animation)

    return () => clearInterval(interval);
  }, [messages.length]);

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
              scale: [0.95, 1.05, 0.95],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="w-24 h-24 mx-auto mb-6 p-5 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              className="w-full h-full"
            >
              <Brain className="w-full h-full text-indigo-600 dark:text-indigo-400" />
            </motion.div>
          </motion.div>
          
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-4"
          >
            Crafting Your Review
          </motion.h3>
          
          <div className="min-h-[32px] flex items-center justify-center">
            <motion.div
              key={currentMessageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isAnimating ? 0 : 1, y: isAnimating ? -10 : 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <span className="text-2xl">{messages[currentMessageIndex].icon}</span>
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {messages[currentMessageIndex].text}
              </span>
            </motion.div>
          </div>
          
          <div className="mt-6 flex justify-center gap-1">
            {messages.map((_, index) => (
              <motion.div
                key={index}
                initial={{ width: '8px', opacity: 0.3 }}
                animate={{
                  width: index === currentMessageIndex ? '24px' : '8px',
                  opacity: index === currentMessageIndex ? 1 : 0.3,
                  backgroundColor: index === currentMessageIndex 
                    ? 'hsl(263, 70%, 50%)' 
                    : 'hsl(263, 30%, 80%)',
                }}
                transition={{
                  duration: 0.4,
                  type: 'spring',
                  stiffness: 100,
                  damping: 15
                }}
                className="h-2 rounded-full"
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ 
                  x: ["-100%", "100%", "-100%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  times: [0, 0.5, 1],
                }}
                className="h-full w-1/2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full"
              >
                <motion.div 
                  className="h-full w-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  animate={{
                    opacity: [0.8, 1, 0.8],
                    scaleX: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </div>
          </div>

          <div className="flex justify-center gap-8 pt-2">
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, -8, 0],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20"
            >
              <FileText className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
            </motion.div>
            <motion.div
              animate={{
                y: [0, -15, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: 0.2
              }}
              className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20"
            >
              <Sparkles className="w-6 h-6 text-purple-500 dark:text-purple-400" />
            </motion.div>
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 8, 0],
              }}
              transition={{
                duration: 3.2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: 0.1
              }}
              className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20"
            >
              <Brain className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center justify-center gap-2"
          >
            <motion.span
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut"
              }}
            >
              ✨
            </motion.span>
            Crafting your personalized review
            <motion.span
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              ✨
            </motion.span>
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}
