"use client";

import { motion } from "framer-motion";

const floatingEmojis = ["🚀", "💼", "📊", "🎯", "💡", "📈", "🏆", "✨"];

export const BackgroundElements = () => {
  if (typeof window === 'undefined') {
    return null; // Don't render on server
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl opacity-10 dark:opacity-20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            rotate: 360,
          }}
          transition={{
            duration: 20 + Math.random() * 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {floatingEmojis[Math.floor(Math.random() * floatingEmojis.length)]}
        </motion.div>
      ))}
    </div>
  );
};

export default BackgroundElements;
