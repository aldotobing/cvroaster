import { motion } from "framer-motion";
import { Coffee, Heart } from "lucide-react";

export const Footer = () => (
  <motion.footer
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.2 }}
    className="text-center mt-16"
  >
    <p className="text-gray-500 dark:text-gray-400 text-base">
      Powered by caffeine
      <motion.span
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="inline-block mx-1"
      >
        <Coffee className="w-4 h-4 inline text-amber-600" />
      </motion.span>
      and code • Made with
      <motion.span
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="inline-block mx-1"
      >
        <Heart className="w-4 h-4 inline text-red-500" />
      </motion.span>
      for job seekers
    </p>
    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
      © {new Date().getFullYear()} CV Roaster •
      <a
        href="https://twitter.com/aldo_tobing"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-blue-500 hover:underline hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="inline mx-1"
        >
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
        </svg>
        @aldo_tobing
      </a>
    </p>
  </motion.footer>
);
