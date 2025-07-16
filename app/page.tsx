"use client";

import React from "react";

import { useState, useRef, useEffect, useCallback } from "react";
import { Turnstile } from "@/components/Turnstile";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
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
  Mail,
  Twitter,
  Clipboard,
  MessageCircle,
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
import CVTemplatesList from "@/components/cv-templates-list";
import { useRef as useShareRef } from "react";

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

// Glassmorphism card component
type MotionDivProps = React.ComponentProps<typeof motion.div>;
type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
} & Omit<MotionDivProps, "className" | "children">;

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
  const [suggestionsPosition, setSuggestionsPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [filteredRoles, setFilteredRoles] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTurnstile, setShowTurnstile] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [review, setReview] = useState<CVReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [currentQuote, setCurrentQuote] = useState("");
  const [language, setLanguage] = useState<"english" | "indonesian">("english");
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
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
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

  const handleReview = useCallback(async () => {
    if (!file) return;
    
    // Show Turnstile verification
    setShowTurnstile(true);
  }, [file]);

  const handleTurnstileVerify = useCallback(async (token: string) => {
    // Show verified state
    setIsVerified(true);
    
    // Wait for 1.5 seconds to show the verified state
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setShowTurnstile(false);
    
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
          parsedText: text,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again!"
      );
    } finally {
      setIsProcessing(false);
      setIsVerified(false);
    }
  }, [file, jobRole, language]);

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
              {
                floatingEmojis[
                  Math.floor(Math.random() * floatingEmojis.length)
                ]
              }
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
              {/* CV Templates & Examples */}
              <CVTemplatesList />
              {/* Job Role Input */}
              <GlassCard className="mb-8 p-8 relative">
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Target className="w-6 h-6 text-indigo-500" />
                  </motion.div>
                  <Label
                    htmlFor="jobRole"
                    className="text-xl font-bold text-gray-800 dark:text-white"
                  >
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
                          width: rect.width,
                        });
                      }

                      // Filter roles based on input
                      if (value.length > 0) {
                        const filtered = commonJobRoles.filter((role) =>
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
                            width: rect.width,
                          });
                        }
                      }
                    }}
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 200)
                    }
                    className="w-full pl-4 pr-4 py-3 text-base text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                  {showSuggestions &&
                    filteredRoles.length > 0 &&
                    createPortal(
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 10 }}
                        exit={{ opacity: 0, y: 5 }}
                        style={{
                          position: "absolute",
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
              <GlassCard
                className="mb-8 p-4 sm:p-6 md:p-8"
                style={{ position: "relative", zIndex: 1 }}
              >
                <motion.div
                  className={`border-3 border-dashed rounded-2xl p-4 sm:p-8 md:p-12 text-center transition-all duration-500 ${
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
                    animate={
                      dragActive
                        ? { scale: 1.1, rotate: 5 }
                        : { scale: 1, rotate: 0 }
                    }
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    {file ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="w-full"
                      >
                        <Star className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3 sm:mb-4" />
                        <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 mb-2 break-words px-2">
                          Ready to roast! 🎉
                        </p>
                        <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 break-all px-2">
                          {file.name}
                        </p>
                      </motion.div>
                    ) : (
                      <div className="w-full">
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-400 mx-auto mb-4 sm:mb-6" />
                        </motion.div>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2 sm:mb-3 px-2">
                          {dragActive
                            ? "Drop it like it's hot! 🔥"
                            : "Drop your CV here or click to browse"}
                        </p>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
                          PDF or DOCX • Max 5MB
                        </p>
                      </div>
                    )}

                    <div className="mt-4 sm:mt-6">
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button
                        asChild
                        className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-8 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                      >
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer flex items-center justify-center"
                        >
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          {file ? "Choose Different File" : "Choose File"}
                        </label>
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 pt-6 border-t border-white/20">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="w-full sm:w-auto"
                  >
                    <LanguageSelector
                      language={language}
                      onLanguageChange={setLanguage}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xs text-gray-500 dark:text-gray-400 w-full sm:max-w-[280px]"
                  >
                    <div className="flex items-start">
                      <span className="mr-2 mt-0.5 flex-shrink-0">🔒</span>
                      <span className="break-words">
                        <span className="font-medium">
                          Your privacy is protected
                        </span>
                        : Your CV is processed entirely in your browser. Nothing
                        is sent to any server, and no data is stored or
                        collected.
                      </span>
                    </div>
                  </motion.div>
                </div>
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
              <div className="text-center mb-8 sm:mb-12 px-4 sm:px-0">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto"
                >
                  <div className="w-full flex flex-col items-center gap-4">
                    {!showTurnstile ? (
                      <Button
                        onClick={() => setShowTurnstile(true)}
                        disabled={!file || isProcessing}
                        className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg shadow-lg hover:shadow-orange-500/25 transition-all duration-300 rounded-full"
                      >
                        {isProcessing ? (
                          <div className="flex items-center justify-center">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="mr-2"
                            >
                              <Zap className="w-5 h-5" />
                            </motion.div>
                            <span>Roasting your CV...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            <span>Roast My CV</span>
                          </div>
                        )}
                      </Button>
                    ) : (
                      <div className="w-full flex flex-col items-center gap-4 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">Verify You're Human</h3>
                          <p className="text-sm text-gray-500">Complete this security check to help us prevent spam</p>
                        </div>
                        
                        <div className="w-full max-w-xs">
                          <Turnstile 
                            key={showTurnstile ? 'turnstile-visible' : 'turnstile-hidden'}
                            onVerify={handleTurnstileVerify}
                            onError={() => {
                              setError('Verification failed. Please try again.');
                              setShowTurnstile(false);
                            }}
                            onExpire={() => {
                              setError('Verification expired. Please try again.');
                              setShowTurnstile(false);
                            }}
                            isVerified={isVerified}
                            className="w-full flex justify-center"
                          />
                        </div>
                        
                        <p className="text-xs text-gray-500 text-center mt-2">
                          This helps us keep the service safe and secure for everyone.
                        </p>
                        
                        <Button
                          variant="outline"
                          onClick={() => setShowTurnstile(false)}
                          className="mt-2 text-sm text-gray-600 hover:text-gray-900"
                          type="button"
                        >
                          Cancel Verification
                        </Button>
                      </div>
                    )}
                  </div>
                  {!file && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                      Upload your CV to get started
                    </p>
                  )}
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
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={resetApp}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-full shadow-lg"
                    >
                      <Rocket className="w-5 h-5" />
                      Review Another CV
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
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
                  {/* Shareable Review Section */}
                  {/* Shareable Review Section */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                    <div className="font-semibold text-lg text-indigo-700 dark:text-indigo-300">
                      Share your review:
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        asChild
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center"
                        title="Share on Twitter"
                      >
                        <a
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                            `Check out my CV review for ${
                              file?.name || "my CV"
                            } targeting ${jobRole}! 🚀\n\nScore: ${
                              review?.score
                            }/100\n${window?.location?.href}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="flex items-center justify-center">
                            <Twitter size={20} className="w-5 h-5" />
                          </span>
                        </a>
                      </Button>
                      <Button
                        asChild
                        className="bg-green-500 hover:bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center"
                        title="Share on WhatsApp"
                      >
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(
                            `Check out my CV review for ${
                              file?.name || "my CV"
                            } targeting ${jobRole}! 🚀\n\nScore: ${
                              review?.score
                            }/100\n${window?.location?.href}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="flex items-center justify-center">
                            <MessageCircle size={20} className="w-5 h-5" />
                          </span>
                        </a>
                      </Button>
                      <Button
                        asChild
                        className="bg-green-600 hover:bg-green-700 text-white rounded-full w-10 h-10 flex items-center justify-center"
                        title="Share via Email"
                      >
                        <a
                          href={`mailto:?subject=My CV Review Results&body=${encodeURIComponent(
                            `Check out my CV review for ${
                              file?.name || "my CV"
                            } targeting ${jobRole}!\n\nScore: ${
                              review?.score
                            }/100\n${window?.location?.href}`
                          )}`}
                        >
                          <Mail size={20} className="w-5 h-5" />
                        </a>
                      </Button>
                      <Button
                        className="bg-gray-600 hover:bg-gray-700 text-white rounded-full w-10 h-10 flex items-center justify-center"
                        title="Copy summary to clipboard"
                        onClick={() => {
                          const summary = `CV Review for ${
                            file?.name || "my CV"
                          } targeting ${jobRole}\nScore: ${review?.score}/100`;
                          navigator.clipboard.writeText(summary);
                        }}
                      >
                        <Clipboard size={20} className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  <ReviewResults
                    review={review}
                    fileName={file?.name || ""}
                    jobRole={jobRole}
                    originalCvText={
                      JSON.parse(localStorage.getItem("lastReview") || "{}")
                        .parsedText || ""
                    }
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
      </div>
    </div>
  );
}
