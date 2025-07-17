import { motion } from "framer-motion";
import { Languages } from "lucide-react";
import { Label } from "@/components/ui/label";
import ReactCountryFlag from "react-country-flag";
import { cn } from "@/lib/utils";
import React from "react";

interface LanguageSelectorProps {
  language: "english" | "indonesian";
  onLanguageChange: (lang: "english" | "indonesian") => void;
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  language,
  onLanguageChange,
  className = ""
}) => {
  return (
    <div className={cn(`w-full flex flex-col items-center`, className)}>
      <div className="flex items-center gap-3 mb-3 w-full justify-center">
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <Languages className="w-5 h-5 text-blue-500" />
        </motion.div>
        <Label className="text-md font-medium text-gray-800 dark:text-white">
          Review Language
        </Label>
      </div>
      
      <div className="flex justify-center w-full mb-4">
        <div className="inline-flex rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 p-1">
          {["english", "indonesian"].map((lang) => (
            <motion.button
              key={lang}
              type="button"
              onClick={() => onLanguageChange(lang as "english" | "indonesian")}
              className={cn(
                "px-4 py-2 text-sm font-medium flex items-center gap-2 relative rounded-md z-10",
                language === lang 
                  ? "text-white" 
                  : "text-gray-700 dark:text-gray-300"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {language === lang && (
                <motion.div 
                  layoutId="activeLang"
                  className="absolute inset-0 bg-blue-500 rounded-md z-0"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                  }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <ReactCountryFlag 
                  countryCode={lang === "english" ? "US" : "ID"}
                  svg 
                  className="w-4 h-4 rounded-sm overflow-hidden"
                  aria-label={lang === "english" ? "English" : "Bahasa Indonesia"}
                />
                <span>{lang === "english" ? "English" : "Indonesia"}</span>
              </span>
            </motion.button>
          ))}
        </div>
      </div>
      
      <motion.p 
        className="text-xs text-gray-500 dark:text-gray-400 text-center"
        key={language}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {language === 'english' 
          ? 'Your CV will be reviewed in English' 
          : 'CV Anda akan ditinjau dalam Bahasa Indonesia'}
      </motion.p>
    </div>
  );
};

export default LanguageSelector;
