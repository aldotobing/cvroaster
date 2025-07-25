"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { parseFile } from "@/lib/file-parser";
import { reviewCV } from "@/lib/ai-service";
import { generatePDF } from "@/lib/pdf-generator";
import type { CVReview } from "@/types/cv-review";
import LoadingAnimation from "@/components/loading-animation";
import BackgroundElements from "@/components/BackgroundElements";
import Confetti from "@/components/Confetti";
import CVUploadSection from "@/components/CVUploadSection";
import ReviewSection from "@/components/ReviewSection";
import ErrorDisplay from "@/components/ErrorDisplay";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import WelcomeScreen from "@/components/WelcomeScreen";

const motivationalQuotes = [
  "Your dream job is just one great CV away! ✨",
  "Every expert was once a beginner. Polish that CV! 💎",
  "Your skills deserve to shine brighter! 🌟",
  "Let's turn your CV from good to absolutely fire! 🔥",
  "Time to make your CV as impressive as you are! 💪"
];

export default function CVReviewer() {
  // State management
  const [file, _setFile] = useState<File | null>(null);
  const setFile = (newFile: File | null) => {
    // If file is being changed or removed, reset verification
    if (!newFile || (file && newFile.name !== file.name)) {
      setIsVerified(false);
      setShowTurnstile(false);
      
      // Reset the file input value to allow re-selecting the same file
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
    _setFile(newFile);
  };
  const [jobRole, setJobRole] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTurnstile, setShowTurnstile] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [review, setReview] = useState<CVReview | null>(null);
  const [error, _setError] = useState<string | null>(null);
  
  // Custom error setter that also resets the Turnstile state
  const setError = useCallback((error: string | null) => {
    if (error) {
      // Reset verification state when an error occurs
      setIsVerified(false);
      setShowTurnstile(false);
    }
    _setError(error);
  }, []);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [currentQuote, setCurrentQuote] = useState("");
  const [language, setLanguage] = useState<"english" | "indonesian">("english");
  const [showConfetti, setShowConfetti] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showWelcome, setShowWelcome] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Helper function to format error messages with proper line breaks and formatting
  const formatErrorMessage = (error: unknown): string => {
    if (!(error instanceof Error)) {
      return "An unknown error occurred. Please try again.";
    }
    
    // For DOCX parsing errors, we've already formatted them in file-parser.ts
    if (error.message.includes('DOCX') || 
        error.message.includes('valid DOCX file') || 
        error.message.includes('corrupted')) {
      return error.message;
    }
    
    // For other errors, add some basic formatting
    return error.message;
  };

  // Check localStorage only after component mounts on the client side
  useEffect(() => {
    setIsClient(true);
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (hasSeenWelcome !== 'true') {
      setShowWelcome(true);
    }
  }, []);

  const handleStart = useCallback(() => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  }, []);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);

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
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    // Always reset verification state when a new file is dropped
    setIsVerified(false);
    setShowTurnstile(false);

    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(
      (file) =>
        (file.type === "application/pdf" ||
          file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") &&
        file.size <= 5 * 1024 * 1024
    );

    if (validFile) {
      setFile(validFile);
      setError(null);
    } else {
      setError("Please upload a PDF or DOCX file under 5MB");
    }
  }, []);

  const [showImageWarning, setShowImageWarning] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    // Always reset verification state when a new file is selected
    setIsVerified(false);
    setShowTurnstile(false);
    
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be under 5MB");
        return;
      }
      
      const validFileTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "image/webp"
      ];
      
      if (!validFileTypes.includes(selectedFile.type)) {
        setError("Please upload a PDF, DOCX, JPG, or PNG file");
        return;
      }
      
      // Check if the selected file is an image
      const isImage = selectedFile.type.startsWith('image/');
      setShowImageWarning(isImage);
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please upload a CV file");
      return;
    }

    if (!jobRole.trim()) {
      setError("Please enter the job role you're applying for");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setReview(null);

    try {
      const text = await parseFile(file);
      const reviewResult = await reviewCV(text, jobRole, language);
      
      // Store the CV text with the review for cover letter generation
      setReview({
        ...reviewResult,
        cvText: text
      });
      
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
      
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      console.error("Error processing CV:", err);
      setError(formatErrorMessage(err));
    } finally {
      setIsProcessing(false);
    }
  }, [file, jobRole, language]);
  const handleDownloadPDF = () => {
    if (review && file) {
      generatePDF(review, file.name, jobRole);
    }
  };

  const handleTurnstileVerify = useCallback(async (token: string) => {
    try {
      setIsVerified(true);
      
      if (!file) {
        setError("Please upload a CV file first.");
        return;
      }

      setIsProcessing(true);
      setError(null);
      setReview(null);

      // Use a default job role if none provided
      const targetJobRole = jobRole.trim() || "the target position";

      const text = await parseFile(file);
      const reviewResult = await reviewCV(text, targetJobRole, language);
      
      // Store the CV text with the review for cover letter generation
      setReview({
        ...reviewResult,
        cvText: text
      });
      
      localStorage.setItem(
        "lastReview",
        JSON.stringify({
          fileName: file.name,
          jobRole: targetJobRole,
          review: reviewResult,
          parsedText: text,
          timestamp: Date.now(),
        })
      );
      
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      console.error("Error processing CV:", err);
      setError(formatErrorMessage(err));
    } finally {
      setIsProcessing(false);
    }
  }, [file, jobRole, language]);

  const resetApp = () => {
    // Reset all states including verification
    setFile(null);
    setJobRole("");
    setReview(null);
    setError(null);
    setShowTurnstile(false);
    setIsVerified(false);
    
    // Reset file input value to allow selecting the same file again
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  if (showWelcome) {
    return <WelcomeScreen onStart={() => setShowWelcome(false)} />;
  }

  return (
    <div
      className={`min-h-screen transition-all duration-500 relative overflow-hidden ${
        isDarkMode
          ? "dark bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50"
      }`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Animated background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, ${
            isDarkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)'
          } 0%, transparent 50%)`,
        }}
      />

      <BackgroundElements />
      <Confetti showConfetti={showConfetti} isDarkMode={isDarkMode} />

      {isClient && (
        <AnimatePresence>
          {showWelcome && (
            <WelcomeScreen onStart={handleStart} />
          )}
        </AnimatePresence>
      )}

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        <Header 
          isDarkMode={isDarkMode} 
          onThemeChange={setIsDarkMode} 
        />

        <AnimatePresence mode="wait">
          {!review ? (
            <CVUploadSection
              file={file}
              setFile={setFile}
              error={error}
              setError={setError}
              language={language}
              setLanguage={setLanguage}
              isProcessing={isProcessing}
              showTurnstile={showTurnstile}
              setShowTurnstile={setShowTurnstile}
              isVerified={isVerified}
              setIsVerified={setIsVerified}
              handleTurnstileVerify={handleTurnstileVerify}
              dragActive={dragActive}
              setDragActive={setDragActive}
              handleDrag={handleDrag}
              handleDrop={handleDrop}
              handleFileSelect={handleFileSelect}
              jobRole={jobRole}
              setJobRole={setJobRole}
              inputRef={inputRef as React.RefObject<HTMLInputElement>}
              currentQuote={currentQuote}
              showImageWarning={showImageWarning}
            />
          ) : (
            <ReviewSection
              review={review}
              file={file}
              jobRole={jobRole}
              language={language}
              handleDownloadPDF={handleDownloadPDF}
              resetApp={resetApp}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isProcessing && <LoadingAnimation />}
        </AnimatePresence>

        <Footer />
      </div>
    </div>
  );
}
