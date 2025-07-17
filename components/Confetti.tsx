import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const floatingEmojis = ["🔥", "✨", "💎", "🚀", "⭐", "💫"];

type ConfettiProps = {
  showConfetti: boolean;
  isDarkMode: boolean;
};

const Confetti = ({ showConfetti, isDarkMode }: ConfettiProps) => (
  <AnimatePresence>
    {showConfetti && (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl opacity-90"
            style={{
              filter: isDarkMode
                ? "drop-shadow(0 0 4px rgba(255, 255, 255, 0.7))"
                : "drop-shadow(0 0 4px rgba(0, 0, 0, 0.3))",
            }}
            initial={{
              x: Math.random() * window.innerWidth,
              y: -50,
              rotate: 0,
              scale: 0,
            }}
            animate={{
              y: window.innerHeight + 50,
              rotate: 360 * 3,
              scale: 1,
            }}
            exit={{ scale: 0 }}
            transition={{
              duration: 3 + Math.random() * 2,
              ease: "easeOut",
            }}
          >
            {floatingEmojis[Math.floor(Math.random() * floatingEmojis.length)]}
          </motion.div>
        ))}
      </div>
    )}
  </AnimatePresence>
);

export default Confetti;
