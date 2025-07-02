import type { CVReview } from "@/types/cv-review";
import type { ATSFriendlyCV } from "@/lib/cv-generator";
import { generateATSFriendlyCV as generateCV } from "@/lib/cv-generator";
import { commonJobRoles } from "@/data/job-roles";
import { useState } from "react";

function detectJobRole(cvText: string): string {
  // Convert text to lowercase for case-insensitive matching
  const text = cvText.toLowerCase();

  // First, try to find exact job titles in the CV
  const exactMatch = commonJobRoles.find((role) =>
    text.includes(role.toLowerCase())
  );
  if (exactMatch) return exactMatch;

  // Define some common job title keywords
  const titleKeywords = [
    "engineer",
    "developer",
    "manager",
    "specialist",
    "analyst",
    "designer",
    "architect",
    "administrator",
    "consultant",
  ];

  // Look for job title patterns in the first few lines (likely in the header/summary)
  const firstFewLines = text.split("\n").slice(0, 5).join(" ");
  for (const keyword of titleKeywords) {
    const pattern = new RegExp(`\\b\\w+\\s+${keyword}\\b`, "i");
    const match = firstFewLines.match(pattern);
    if (match) return match[0];
  }

  // Default fallback based on skills
  if (
    text.includes("javascript") ||
    text.includes("react") ||
    text.includes("html")
  ) {
    return "Frontend Developer";
  }
  if (
    text.includes("python") ||
    text.includes("java") ||
    text.includes("backend")
  ) {
    return "Backend Developer";
  }
  if (text.includes("manager") || text.includes("management")) {
    return "Project Manager";
  }

  // Ultimate fallback
  return "Professional";
}
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export const ATSPreviewDialog = ({
  open,
  onOpenChange,
  cvComparison,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cvComparison: ATSFriendlyCV | null;
}) => {
  if (!cvComparison) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>CV Comparison Preview</DialogTitle>
          <DialogDescription>
            Compare your original CV with the ATS-optimized version
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 h-full mt-4">
          <div>
            <h3 className="font-semibold mb-2">Original CV</h3>
            <ScrollArea className="h-[60vh] border rounded-md p-4">
              <div className="whitespace-pre-wrap">
                {cvComparison.originalCV}
              </div>
            </ScrollArea>
          </div>
          <div>
            <h3 className="font-semibold mb-2">ATS-Optimized CV</h3>
            <ScrollArea className="h-[60vh] border rounded-md p-4">
              <div className="whitespace-pre-wrap">
                {cvComparison.improvedCV}
              </div>
            </ScrollArea>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button
            onClick={() => {
              // Create a download link for the Word document
              const url = URL.createObjectURL(cvComparison.wordDocument);
              const link = document.createElement("a");
              link.href = url;
              link.download = `ATS-Friendly-CV-${Date.now()}.docx`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
          >
            Download ATS-Friendly CV
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const GenerateATSButton = ({
  onGenerateClick,
  isGenerating,
}: {
  onGenerateClick: () => void;
  isGenerating: boolean;
}) => {
  return (
    <Button
      onClick={onGenerateClick}
      disabled={isGenerating}
      className="w-full md:w-auto"
    >
      {isGenerating ? (
        <>
          <span className="animate-spin mr-2">⚙️</span>
          Generating ATS-Friendly CV...
        </>
      ) : (
        "Generate ATS-Friendly CV"
      )}
    </Button>
  );
};

export const CVComparisonSection = ({
  review,
  fileName,
  jobRole,
  originalCvText,
}: {
  review: CVReview;
  fileName: string;
  jobRole: string;
  originalCvText: string;
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [cvComparison, setCvComparison] = useState<ATSFriendlyCV | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerateCV = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Validate inputs before generating
      if (!originalCvText?.trim()) {
        throw new Error("No CV text found. Please upload a CV first.");
      }

      if (!review) {
        throw new Error(
          "CV review data is not available. Please wait for the review to complete."
        );
      }

      // Detect job role from CV content if not provided
      const roleToUse = jobRole?.trim() || detectJobRole(originalCvText);

      // Use the client-side generator directly
      const result = await generateCV(originalCvText, review, roleToUse);
      setCvComparison(result);
      setShowPreview(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to generate ATS-friendly CV. Please try again later.";
      setError(errorMessage);
      console.error("Error generating ATS CV:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>ATS-Friendly CV Generator</span>
              <GenerateATSButton
                onGenerateClick={handleGenerateCV}
                isGenerating={isGenerating}
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Alert variant="destructive">
              <AlertDescription>
                <strong>⚠️ Experimental Feature:</strong> For best results, we
                recommend downloading our pre-tested ATS-friendly template from
                the home page and customizing it manually. This automated
                generator is still under development and may not provide optimal
                results.
              </AlertDescription>
            </Alert>
            <div className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Generate an ATS-optimized version of your CV based on the review
                feedback. This process will enhance your CV's compatibility with
                Applicant Tracking Systems while maintaining its professional
                appearance.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-sm font-medium mb-2">
                    Current ATS Score
                  </div>
                  <Progress value={review.atsScore} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <ATSPreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        cvComparison={cvComparison}
      />
    </>
  );
};
