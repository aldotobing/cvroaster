"use client";

import type React from "react";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from 'react-dom';
import {
  Flame,
  Sun,
  Moon,
  Target,
  Upload,
  FileText,
  Sparkles,
  Download,
  Zap,
  Star,
  Heart,
  Coffee,
  Rocket,
  ChevronDown,
} from "lucide-react";
import { commonJobRoles } from "@/data/job-roles";
import { LanguageSelector } from "@/components/language-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { parseFile } from "@/lib/file-parser";
import { reviewCV } from "@/lib/ai-service";
import { generatePDF } from "@/lib/pdf-generator";
import type { CVReview } from "@/types/cv-review";
import ReviewResults from "@/components/review-results";
import LoadingAnimation from "@/components/loading-animation";

const motivationalQuotes = [
  "Your dream job is just one great CV away! ✨",
  "Every expert was once a beginner. Polish that CV! 💎",
  "Your skills deserve to shine brighter! 🌟",
  "The best time to improve your CV was yesterday. The second best time is now! ⏰",
  "Let's turn your CV from good to absolutely fire! 🔥",
  "Time to make your CV as impressive as you are! 💪",
  "Ready to make recruiters fall in love with your CV? 💝",
];

const floatingEmojis = ["🔥", "✨", "💎", "🚀", "⭐", "💫"];

// Floating background elements
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
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 0),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 0),
          }}
          animate={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 0),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 0),
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

// Glassmorphism card component
type MotionDivProps = React.ComponentProps<typeof motion.div>;
type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
} & Omit<MotionDivProps, 'className' | 'children'>;

const GlassCard = ({ children, className = "", ...props }: GlassCardProps) => (
  <motion.div
    className={`backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-700/70 rounded-xl shadow-lg dark:shadow-gray-900/20 ${className}`}
    whileHover={{ scale: 1.01, y: -2 }}
    transition={{ duration: 0.2 }}
    {...props}
  >
    {children}
  </motion.div>
);

export default function CVReviewer() {
  const [file, setFile] = useState<File | null>(null);
  const [jobRole, setJobRole] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsPosition, setSuggestionsPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const [filteredRoles, setFilteredRoles] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [review, setReview] = useState<CVReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [currentQuote, setCurrentQuote] = useState("");
  const [language, setLanguage] = useState<'english' | 'indonesian'>('english');
  const [showConfetti, setShowConfetti] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setCurrentQuote(
      motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
    );
  }, []);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(
      (file) =>
        (file.type === "application/pdf" ||
          file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document") &&
        file.size <= 5 * 1024 * 1024
    );

    if (validFile) {
      setFile(validFile);
      setError(null);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    } else {
      setError("Please upload a PDF or DOCX file under 5MB");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be under 5MB");
        return;
      }
      if (
        ![
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(selectedFile.type)
      ) {
        setError("Please upload a PDF or DOCX file");
        return;
      }
      setFile(selectedFile);
      setError(null);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  const handleReview = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const text = await parseFile(file);
      const reviewResult = await reviewCV(text, jobRole, language);
      setReview(reviewResult);

      // Save to localStorage
      localStorage.setItem(
        "lastReview",
        JSON.stringify({
          fileName: file.name,
          jobRole,
          review: reviewResult,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again!"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = () => {
    if (review && file) {
      generatePDF(review, file.name, jobRole);
    }
  };

  const resetApp = () => {
    setFile(null);
    setJobRole("");
    setReview(null);
    setError(null);
  };

  // Confetti component
  const Confetti = () => (
    <AnimatePresence>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl opacity-90"
              style={{
                filter: isDarkMode ? 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.7))' : 'drop-shadow(0 0 4px rgba(0, 0, 0, 0.3))'
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

  return (
    <div
      className={`min-h-screen transition-all duration-500 relative overflow-hidden ${
        isDarkMode
          ? "dark bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50"
      }`}
    >
      {/* Animated background gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: isDarkMode
            ? `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.1) 0%, transparent 50%)`
            : `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.1) 0%, transparent 50%)`,
        }}
      />
      
      <BackgroundElements />
      <Confetti />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
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
                  rotate: [0, 5, 0, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Flame className="w-10 h-10 text-orange-500" />
              </motion.div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                CV Roaster
              </h1>
            </motion.div>
            
            <GlassCard className="p-2">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-yellow-500" />
                <Switch 
                  checked={isDarkMode} 
                  onCheckedChange={setIsDarkMode}
                  className="data-[state=checked]:bg-indigo-600"
                />
                <Moon className="w-4 h-4 text-indigo-400" />
              </div>
            </GlassCard>
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

        <AnimatePresence mode="wait">
          {!review ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              {/* Job Role Input */}
              <GlassCard className="mb-8 p-8 relative">
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Target className="w-6 h-6 text-indigo-500" />
                  </motion.div>
                  <Label htmlFor="jobRole" className="text-xl font-bold text-gray-800 dark:text-white">
                    Target Job Role? 🎯
                  </Label>
                </div>
                <div className="relative z-[100]">
                  <Input
                    ref={inputRef}
                    id="jobRole"
                    placeholder="e.g., Software Developer, Product Manager, Finance, Marketing, Sales, Customer Support, HR..."
                    value={jobRole}
                    onChange={(e) => {
                      const value = e.target.value;
                      setJobRole(value);
                      setShowSuggestions(value.length > 0);
                      
                      // Update position based on input element
                      if (inputRef.current) {
                        const rect = inputRef.current.getBoundingClientRect();
                        setSuggestionsPosition({
                          top: rect.bottom + window.scrollY + 4,
                          left: rect.left + window.scrollX,
                          width: rect.width
                        });
                      }
                      
                      // Filter roles based on input
                      if (value.length > 0) {
                        const filtered = commonJobRoles.filter(role =>
                          role.toLowerCase().includes(value.toLowerCase())
                        );
                        setFilteredRoles(filtered.slice(0, 5));
                      } else {
                        setFilteredRoles([]);
                      }
                    }}
                    onFocus={() => {
                      if (jobRole.length > 0) {
                        setShowSuggestions(true);
                        if (inputRef.current) {
                          const rect = inputRef.current.getBoundingClientRect();
                          setSuggestionsPosition({
                            top: rect.bottom + window.scrollY + 4,
                            left: rect.left + window.scrollX,
                            width: rect.width
                          });
                        }
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="w-full pl-4 pr-4 py-3 text-base text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                  {showSuggestions && filteredRoles.length > 0 && createPortal(
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 10 }}
                      exit={{ opacity: 0, y: 5 }}
                      style={{
                        position: 'absolute',
                        top: `${suggestionsPosition.top}px`,
                        left: `${suggestionsPosition.left}px`,
                        width: `${suggestionsPosition.width}px`,
                        zIndex: 9999,
                      }}
                      className="bg-white dark:backdrop-blur-sm dark:bg-gray-800/95 border border-gray-200 dark:border-gray-700/70 rounded-lg shadow-lg overflow-hidden"
                    >
                      {filteredRoles.map((role, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/80 cursor-pointer text-base transition-colors duration-150 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setJobRole(role);
                            setShowSuggestions(false);
                          }}
                        >
                          {role}
                        </div>
                      ))}
                    </motion.div>,
                    document.body
                  )}
                </div>
                <motion.p 
                  className="text-sm text-gray-600 dark:text-gray-300 mt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  This helps me give you laser-focused feedback! ⚡
                </motion.p>
              </GlassCard>

              {/* File Upload */}
              <GlassCard className="mb-8 p-8" style={{ position: 'relative', zIndex: 1 }}>
                <motion.div
                  className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-500 ${
                    dragActive
                      ? "border-indigo-400 bg-indigo-100/50 dark:bg-indigo-500/20 scale-105"
                      : file
                      ? "border-green-400 bg-green-100/50 dark:bg-green-500/20"
                      : "border-gray-400/50 hover:border-indigo-400/70 hover:bg-white/20"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    animate={dragActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {file ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                      >
                        <Star className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                          Perfect! 🎉
                        </p>
                        <p className="text-lg text-gray-700 dark:text-gray-300">
                          {file.name}
                        </p>
                      </motion.div>
                    ) : (
                      <>
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Upload className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
                        </motion.div>
                        <p className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-3">
                          {dragActive ? "Drop it like it's hot! 🔥" : "Drop your CV here or click to browse"}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">
                          PDF or DOCX • Max 5MB
                        </p>
                      </>
                    )}
                    
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button 
                      asChild 
                      className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold py-3 px-8 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <FileText className="w-5 h-5 mr-2" />
                        {file ? "Choose Different File" : "Choose File"}
                      </label>
                    </Button>
                  </motion.div>
                </motion.div>
                
                <motion.div 
                  className="mt-8 pt-6 border-t border-white/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <LanguageSelector 
                    language={language} 
                    onLanguageChange={setLanguage}
                  />
                </motion.div>
              </GlassCard>

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  className="mb-8"
                >
                  <GlassCard className="p-6 border-red-300 bg-red-100/30 dark:bg-red-900/30">
                    <p className="text-red-700 dark:text-red-300 text-lg font-medium">
                      ⚠️ {error}
                    </p>
                  </GlassCard>
                </motion.div>
              )}

              {/* Review Button */}
              <div className="text-center mb-12">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleReview}
                    disabled={!file || isProcessing}
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-10 py-3 text-lg shadow-lg hover:shadow-orange-500/25 transition-all duration-300 rounded-full"
                  >
                    {isProcessing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Zap className="w-6 h-6 mr-3" />
                        </motion.div>
                        Roasting your CV...
                      </>
                    ) : (
                      <>
                        <Flame className="w-6 h-6 mr-3" />
                        Let's Roast This CV! 🔥
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>

              {/* Motivational Quote */}
              {!file && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-center"
                >
                  <motion.p 
                    className="text-lg text-gray-600 dark:text-gray-300 italic font-medium max-w-2xl mx-auto"
                    animate={{ scale: [1, 1.01, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    {currentQuote}
                  </motion.p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6 }}
            >
              <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={resetApp}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-full shadow-lg"
                    >
                      <Rocket className="w-5 h-5" />
                      Review Another CV
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-full shadow-lg"
                    >
                      <Download className="w-5 h-5" />
                      Download PDF Report
                    </Button>
                  </motion.div>
                </div>
                
                <GlassCard className="p-8">
                  <ReviewResults
                    review={review}
                    fileName={file?.name || ""}
                    jobRole={jobRole}
                  />
                </GlassCard>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Animation */}
        <AnimatePresence>
          {isProcessing && <LoadingAnimation />}
        </AnimatePresence>

        {/* Footer */}
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
        </motion.footer>
      </div>
    </div>
  );
}