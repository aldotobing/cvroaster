"use client"

import { motion } from "framer-motion"
import { Sparkles, Brain, FileText } from "lucide-react"

export default function LoadingAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl"
      >
        <div className="mb-6">
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <Brain className="w-full h-full text-indigo-600" />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🤖 AI is thinking...</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Analyzing your CV with the power of artificial intelligence
          </p>
        </div>

        <div className="space-y-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-2 bg-indigo-200 dark:bg-indigo-800 rounded-full overflow-hidden"
          >
            <motion.div
              animate={{ x: ["0%", "100%", "0%"] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="h-full w-1/3 bg-indigo-600 rounded-full"
            />
          </motion.div>

          <div className="flex justify-center space-x-4">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0 }}
            >
              <FileText className="w-6 h-6 text-gray-400" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
            >
              <Sparkles className="w-6 h-6 text-gray-400" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
            >
              <Brain className="w-6 h-6 text-gray-400" />
            </motion.div>
          </div>

          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            This might take a moment... Good things take time! ⏰
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  )
}