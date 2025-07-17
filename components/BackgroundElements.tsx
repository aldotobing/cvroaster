import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const floatingEmojis = ["🔥", "✨", "💎", "🚀", "⭐", "💫"];

const BackgroundElements = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl opacity-5 dark:opacity-10"
          initial={{
            x:
              Math.random() *
              (typeof window !== "undefined" ? window.innerWidth : 0),
            y:
              Math.random() *
              (typeof window !== "undefined" ? window.innerHeight : 0),
          }}
          animate={{
            x:
              Math.random() *
              (typeof window !== "undefined" ? window.innerWidth : 0),
            y:
              Math.random() *
              (typeof window !== "undefined" ? window.innerHeight : 0),
            rotate: 360,
          }}
          transition={{
            duration: 30 + Math.random() * 20,
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
