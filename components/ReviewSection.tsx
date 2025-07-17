import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import GlassCard from "@/components/GlassCard";
import ReviewResults from "@/components/review-results";
import {
  Rocket,
  Download,
  Twitter,
  MessageCircle,
  Mail,
  Clipboard,
  Check,
  Loader2,
} from "lucide-react";

interface ReviewSectionProps {
  review: any;
  file: File | null;
  jobRole: string;
  handleDownloadPDF: () => void;
  resetApp: () => void;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  review,
  file,
  jobRole,
  handleDownloadPDF,
  resetApp,
}) => {
  const [isLoading, setIsLoading] = useState({
    twitter: false,
    whatsapp: false,
    email: false,
    clipboard: false,
  });
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = async (platform: string) => {
    try {
      setIsLoading(prev => ({ ...prev, [platform]: true }));
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to prepare ${platform} share. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [platform]: false }));
    }
  };

  const copyToClipboard = async () => {
    try {
      setIsLoading(prev => ({ ...prev, clipboard: true }));
      const summary = `CV Review for ${file?.name || "my CV"} targeting ${jobRole}\nScore: ${review?.score}/100\n${window?.location?.href}`;
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Summary copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, clipboard: false }));
    }
  };

  const getOriginalCvText = () => {
    try {
      const lastReview = localStorage?.getItem("lastReview");
      return lastReview ? JSON.parse(lastReview).parsedText || "" : "";
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return "";
    }
  };
  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.6 }}
      className="space-y-6 md:space-y-8 w-full"
    >
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center mb-6 sm:mb-8">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={resetApp}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-full shadow-lg text-sm sm:text-base"
            >
              <Rocket className="w-5 h-5" />
              Review Another CV
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleDownloadPDF}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-full shadow-lg text-sm sm:text-base"
            >
              <Download className="w-5 h-5" />
              Download PDF Report
            </Button>
          </motion.div>
        </div>

        <GlassCard className="p-4 sm:p-6 md:p-8">
          {/* Shareable Review Section */}
          <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center mb-6 sm:mb-8">
            <div className="font-semibold text-lg text-indigo-700 dark:text-indigo-300">
              Share your review:
            </div>
            <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
              <Button
                asChild
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0"
                title="Share on Twitter"
                onClick={() => handleShare("twitter")}
                disabled={isLoading.twitter}
                aria-label="Share on Twitter"
              >
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `🚀 Just reviewed my CV for ${jobRole} position! Scored ${
                      review?.score
                    }/100\n\n${file?.name ? `CV: ${file.name}\n` : ""}Check it out: ${window?.location?.href}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex items-center justify-center"
                >
                  <AnimatePresence mode="wait">
                    {isLoading.twitter ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Twitter className="w-5 h-5" />
                    )}
                  </AnimatePresence>
                </a>
              </Button>
              <Button
                asChild
                className="bg-green-500 hover:bg-green-600 text-white rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0"
                title="Share on WhatsApp"
                onClick={() => handleShare("whatsapp")}
                disabled={isLoading.whatsapp}
                aria-label="Share on WhatsApp"
              >
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `📄 CV Review Results for ${jobRole}\n\n📊 Score: ${review?.score}/100\n${
                      file?.name ? `📂 File: ${file.name}\n` : ""
                    }🔗 View full report: ${window?.location?.href}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex items-center justify-center"
                >
                  <AnimatePresence mode="wait">
                    {isLoading.whatsapp ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <MessageCircle className="w-5 h-5" />
                    )}
                  </AnimatePresence>
                </a>
              </Button>
              <Button
                asChild
                className="bg-green-600 hover:bg-green-700 text-white rounded-full w-10 h-10 flex items-center justify-center"
                title="Share via Email"
                onClick={() => handleShare("email")}
                disabled={isLoading.email}
                aria-label="Share via Email"
              >
                <a
                  href={`mailto:?subject=CV Review Results for ${encodeURIComponent(
                    jobRole
                  )}&body=${encodeURIComponent(
                    `Hi!\n\nI just reviewed my CV for the ${jobRole} position and scored ${
                      review?.score
                    }/100.\n\n${
                      file?.name ? `📄 CV File: ${file.name}\n` : ""
                    }🔗 View full report: ${window?.location?.href}\n\nWould love to hear your thoughts!`
                  )}`}
                  className="flex items-center justify-center"
                >
                  <AnimatePresence mode="wait">
                    {isLoading.email ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Mail className="w-5 h-5" />
                    )}
                  </AnimatePresence>
                </a>
              </Button>
              <Button
                className={`${copied ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"} text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors`}
                title={copied ? "Copied!" : "Copy summary to clipboard"}
                onClick={copyToClipboard}
                disabled={isLoading.clipboard}
                aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
              >
                <AnimatePresence mode="wait">
                  {isLoading.clipboard ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : copied ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Clipboard className="w-5 h-5" />
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
          <ReviewResults
            review={review}
            fileName={file?.name || ""}
            jobRole={jobRole}
            originalCvText={getOriginalCvText()}
          />
        </GlassCard>
      </div>
    </motion.div>
  );
};

export default ReviewSection;
