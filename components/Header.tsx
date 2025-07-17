import { motion } from "framer-motion";
import { Flame, Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import GlassCard from "./GlassCard";

interface HeaderProps {
  isDarkMode: boolean;
  onThemeChange: (isDark: boolean) => void;
}

export const Header = ({ isDarkMode, onThemeChange }: HeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: -50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
    className="text-center mb-12"
  >
    <div className="flex items-center justify-between mb-6">
      <motion.div
        className="flex items-center gap-3"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Flame className="w-10 h-10 text-orange-500" />
        </motion.div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
          CV Roaster
        </h1>
      </motion.div>

      <button
        onClick={() => onThemeChange(!isDarkMode)}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-yellow-400" />
        ) : (
          <Moon className="w-5 h-5 text-indigo-600" />
        )}
      </button>
    </div>

    <motion.p
      className="text-xl text-gray-700 dark:text-gray-200 font-medium"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      Drop your CV here and let's roast it (constructively)
      <motion.span
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="inline-block ml-2"
      >
        🎯
      </motion.span>
    </motion.p>
  </motion.div>
);
