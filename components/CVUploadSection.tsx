import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, FileText, File, Upload, Info, Sparkles, Wand2, Lock, UploadCloud } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import CVTemplatesList from "@/components/cv-templates-list";
import { Turnstile } from "@/components/Turnstile";
import LanguageSelector from "@/components/LanguageSelector";

interface CVUploadSectionProps {
  file: File | null;
  setFile: (file: File | null) => void;
  error: string | null;
  setError: (err: string | null) => void;
  language: "english" | "indonesian";
  setLanguage: (lang: "english" | "indonesian") => void;
  isProcessing: boolean;
  showTurnstile: boolean;
  setShowTurnstile: (show: boolean) => void;
  isVerified: boolean;
  setIsVerified: (v: boolean) => void;
  handleTurnstileVerify: (token: string) => void;
  dragActive: boolean;
  setDragActive: (v: boolean) => void;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  jobRole: string;
  setJobRole: (role: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  currentQuote: string;
  showImageWarning: boolean;
}

const CVUploadSection: React.FC<CVUploadSectionProps> = ({
  file,
  setFile,
  error,
  setError,
  language,
  setLanguage,
  isProcessing,
  showTurnstile,
  setShowTurnstile,
  isVerified,
  setIsVerified,
  handleTurnstileVerify,
  dragActive,
  setDragActive,
  handleDrag,
  handleDrop,
  handleFileSelect,
  jobRole,
  setJobRole,
  inputRef,
  currentQuote,
  showImageWarning,
}) => {
  const handleJobRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJobRole(e.target.value);
  };

  return (
    <motion.div
      key="upload"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-3xl mx-auto space-y-6 md:space-y-8 px-4 sm:px-6"
    >
      <CVTemplatesList />

      <GlassCard className="p-4 sm:p-6 md:p-8 relative">
        <div className="space-y-6 md:space-y-8">
          {/* Target Job Role Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Briefcase className="w-6 h-6 text-indigo-500" />
              </motion.div>
              <Label className="text-xl font-bold text-gray-800 dark:text-white">
                Target Job Role? 🎯
              </Label>
            </div>
            <div className="relative">
              <Input
                id="jobRole"
                type="text"
                value={jobRole}
                onChange={handleJobRoleChange}
                placeholder="e.g., Frontend Developer, Data Scientist, Financial Analyst, Marketing Manager"
                className="pl-10 text-sm sm:text-base h-11 sm:h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-600 dark:focus:border-indigo-600"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Briefcase className="h-5 w-5 text-gray-400 dark:text-gray-300" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-1 ml-1">
              <Info className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-300">
                This helps us personalize your CV feedback and recommendations.
              </span>
            </div>
          </div>



          {/* File Upload Section */}
          <div className="space-y-4">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="inline-block"
              >
              </motion.div>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <FileText className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                  </motion.div>
                  <Label className="text-xl font-bold text-gray-800 dark:text-white">
                    Upload Your CV
                  </Label>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-300 mb-4 ml-9">
                  We'll analyze your CV and provide personalized feedback
                </p>
              </div>

              <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 dark:border-indigo-600'
                    : 'border-gray-200 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white/50 dark:bg-gray-800/70'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {file ? (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center"
                  >
                    <div 
                      className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 ${
                        file.type.includes('pdf')
                          ? 'bg-red-50 dark:bg-red-900/20'
                          : file.type.startsWith('image/')
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : 'bg-blue-50 dark:bg-blue-900/20'
                      }`}
                    >
                      {file.type.includes('pdf') ? (
                        <div className="relative">
                          <FileText className="w-10 h-10 text-red-500 dark:text-red-400" strokeWidth={1.5} />
                          <span className="absolute -top-1 -right-1 text-[8px] font-bold text-white bg-red-500 dark:bg-red-600 rounded px-1">PDF</span>
                        </div>
                      ) : file.type.startsWith('image/') ? (
                        <div className="relative">
                          <svg className="w-10 h-10 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          <span className="absolute -top-1 -right-1 text-[8px] font-bold text-white bg-green-500 dark:bg-green-600 rounded px-1">IMG</span>
                        </div>
                      ) : file.type.includes('word') || file.type.endsWith('vnd.openxmlformats-officedocument.wordprocessingml.document') || file.name.toLowerCase().endsWith('.docx') ? (
                        <div className="relative">
                          <FileText className="w-10 h-10 text-blue-500 dark:text-blue-400" strokeWidth={1.5} />
                          <span className="absolute -top-1 -right-1 text-xs font-bold text-white bg-blue-500 dark:bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center">W</span>
                        </div>
                      ) : (
                        <File className="w-10 h-10 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
                      )}
                    </div>
                    
                    <div className="w-full text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-xs mx-auto">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                        {file.size < 1024 * 100
                          ? `${Math.round(file.size / 1024)} KB`
                          : `${(file.size / 1024 / 1024).toFixed(1)} MB`} • {
                          file.type.endsWith('vnd.openxmlformats-officedocument.wordprocessingml.document')
                            ? 'DOCX'
                            : file.type.split('/')[1]?.toUpperCase() || 'DOCX'
                        }
                      </p>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => inputRef.current?.click()}
                        className="text-xs h-8 px-3 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        Change
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFile(null)}
                        className="text-xs h-8 px-3 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
                      >
                        Remove
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center cursor-pointer group"
                  >
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
                      <UploadCloud className="w-7 h-7 text-indigo-500 dark:text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors" />
                    </div>
                    
                    <div className="space-y-3 text-center">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                          Click to upload
                        </span>{' '}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PDF, DOCX, JPG, or PNG (max. 5MB)
                      </p>
                    </div>
                    
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp"
                      onChange={handleFileSelect}
                      ref={inputRef}
                    />
                  </label>
                )}
                {showImageWarning && (
                  <div className="mt-2 px-2">
                    <div className="inline-flex items-start max-w-full mx-auto bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2">
                      <Info className="h-3.5 w-3.5 text-yellow-500 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span className="ml-1.5 text-xs text-yellow-600 dark:text-yellow-400 text-left">
                        For best results, use PDF or DOCX (images may be less accurate)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Privacy Notice */}
              <div className="w-full mt-8 px-2">
                <div className="flex items-start gap-2 text-emerald-500 text-sm">
                  <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 dark:text-gray-300 font-medium leading-snug">
                  Your privacy matters. All processing happens locally in your browser — your data stays with you.
                  </span>
                </div>
              </div>

              {/* Language Selector */}
              <div className="w-full pt-8 pb-10">
                <LanguageSelector
                  language={language}
                  onLanguageChange={setLanguage}
                  className="w-full"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm text-center p-2 bg-red-50 dark:bg-red-900/30 rounded-md"
                >
                  {error}
                </motion.div>
              )}

              <div className="w-full flex flex-col items-center gap-4">
                {!showTurnstile ? (
                  <Button
                    onClick={() => setShowTurnstile(true)}
                    disabled={!file || isProcessing}
                    className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg shadow-lg transition-all duration-300 rounded-full"
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
                          <Wand2 className="w-5 h-5" />
                        </motion.div>
                        <span>Roasting your CV...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Sparkles className="w-5 h-5 mr-2" />
                        <span>Roast My CV</span>
                      </div>
                    )}
                  </Button>
                ) : (
                  <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                        Verify You're Human
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Complete this security check to help us prevent spam
                      </p>
                    </div>

                    <div className="w-full flex justify-center">
                      <div className="w-full">
                        {showTurnstile && (
                          <div className="w-full flex justify-center">
                            <Turnstile
                              key="turnstile-widget"
                              onVerify={handleTurnstileVerify}
                              onError={() => {
                                setError("Verification failed. Please try again.");
                                setShowTurnstile(false);
                              }}
                              onExpire={() => {
                                setError("Verification expired. Please try again.");
                                setShowTurnstile(false);
                              }}
                              isVerified={isVerified}
                              className="w-full"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                      This helps us keep the service safe and secure for everyone.
                    </p>

                    <Button
                      variant="outline"
                      onClick={() => setShowTurnstile(false)}
                      className="mt-2 text-sm text-gray-600 dark:text-gray-300"
                      type="button"
                    >
                      Cancel Verification
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {!file && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-gray-500 dark:text-gray-400 italic mt-4"
        >
          {currentQuote}
        </motion.div>
      )}
    </motion.div>
  );
};

export default CVUploadSection;
