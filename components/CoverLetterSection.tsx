"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download, Copy, RefreshCw, AlertCircle, ExternalLink, ArrowLeft, ArrowUpRight, Eye, Edit, Wand2, Save } from "lucide-react";
import { ContentFormatter, formatContentForExport, formatContentForPlainText } from "./content-formatter";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { CoverLetter, Tone, LetterLength } from "@/types/cv-review";
import ReactMarkdown from "react-markdown";
import GlassCard from "@/components/GlassCard";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

interface CoverLetterSectionProps {
  cvText: string;
  jobRole: string;
  language: "english" | "indonesian";
  onBack: () => void;
  onGenerate: (options: {
    tone: Tone;
    length: LetterLength;
    highlightSkills: boolean;
    includePersonalTouch: boolean;
    companyName?: string;
    jobDescription?: string;
    jobRole: string;
    language: "english" | "indonesian";
  }) => Promise<CoverLetter>;
}

export default function CoverLetterSection({
  cvText,
  jobRole,
  language,
  onBack,
}: CoverLetterSectionProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const initialFormData = {
    tone: "professional" as Tone,
    length: "medium" as LetterLength,
    highlightSkills: true,
    includePersonalTouch: true,
    companyName: "",
    jobDescription: "",
    jobRole: jobRole || "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [editedContent, setEditedContent] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<{
    message: string;
    canRetry: boolean;
    title?: string;
    actionText?: string;
    action?: () => void;
  } | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const validateForm = () => {
    if (!formData.jobRole.trim()) {
      toast({
        title: "Job Role Required",
        description: "Please enter a job role to generate a cover letter.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    setStreamingContent("");
    setCoverLetter(null);
    setError(null);
    setShowPreview(true);
    
    // Force a small delay to ensure the skeleton shows up
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText,
          ...formData,
          language,
        }),
      });

      // Check for HTTP errors before processing the response
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `HTTP error! status: ${response.status} ${response.statusText}`
        }));
        
        const error = new Error(errorData.error || `HTTP error! status: ${response.status}`);
        (error as any).status = response.status;
        throw error;
      }

      if (!response.body) {
        throw new Error("No response body received from the server");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let hasError = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.trim()) continue;

          if (line.startsWith("data: ")) {
            const jsonStr = line.substring(6).trim();
            if (jsonStr === "[DONE]") continue;

            try {
              const data = JSON.parse(jsonStr);

              // Handle error from server
              if (data.error || data.isError) {
                hasError = true;
                throw new Error(data.error || "An error occurred while generating the cover letter");
              }

              // Handle successful data
              if (data.chunk) {
                fullContent += data.chunk;
                setStreamingContent(fullContent);
              } else if (data.complete && data.coverLetter) {
                const finalContent = data.coverLetter;
                setCoverLetter({
                  content: finalContent,
                  jobRole: formData.jobRole,
                  companyName: formData.companyName,
                  jobDescription: formData.jobDescription,
                  options: { ...formData, language },
                  generatedAt: new Date().toISOString(),
                });
                setEditedContent(finalContent);
              }
            } catch (e) {
              console.error("Error parsing stream data:", e);
              if (hasError) {
                throw e; // Only re-throw if it's an error from the server
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Error generating cover letter:", err);
      const errorObj = err as Error & { 
        type?: string; 
        originalError?: any;
        status?: number;
        response?: {
          status?: number;
          statusText?: string;
        };
      };
      
      // Extract the original error if it exists
      const originalError = errorObj.originalError || errorObj;
      const errorMessage = originalError?.message || "An unknown error occurred";
      const statusCode = errorObj.status || originalError.status || originalError.response?.status;
      
      // Determine error type based on status code and message
      let errorType = 'GENERIC_ERROR';
      
      if (statusCode === 429) {
        errorType = 'RATE_LIMIT_ERROR';
      } else if (errorMessage.includes('API key') || errorObj.type === 'API_KEY_ERROR') {
        errorType = 'API_KEY_ERROR';
      } else if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        errorType = 'RATE_LIMIT_ERROR';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch failed')) {
        errorType = 'NETWORK_ERROR';
      }

      switch (errorType) {
        case 'API_KEY_ERROR':
          setError({
            title: "Invalid API Key",
            message: "The API key for the AI service is not valid. Please check your configuration.",
            canRetry: true,
            // actionText: "Check Configuration",
            // action: () => {
            //   window.open("https://console.cloud.google.com/apis/credentials", "_blank");
            // }
          });
          break;
          
        case 'RATE_LIMIT_ERROR':
          setError({
            title: "Too Many Requests",
            message: "You've reached the rate limit of 2 requests per minute. Please wait a moment before trying again.",
            canRetry: true,
            actionText: "Got it",
            action: () => {
              setError(null);
              setIsGenerating(false);
            }
          });
          break;
          
        case 'NETWORK_ERROR':
          setError({
            title: "Connection Error",
            message: "Unable to connect to the AI service. Please check your internet connection and try again.",
            canRetry: true
          });
          break;
          
        default:
          // For generic errors, include more details if available
          const detailedMessage = originalError?.response?.data?.error?.message || 
                                originalError?.response?.message || 
                                errorMessage;
                                  
          setError({
            title: "Something Went Wrong",
            message: detailedMessage.length > 150 
              ? "An error occurred while generating your cover letter. Please try again." 
              : detailedMessage,
            canRetry: true
          });
      }
      
      // Show toast for the error
      const toastTitle = error?.title || "Error";
      const toastMessage = error?.message || "An error occurred while generating your cover letter.";
      
      toast({
        title: toastTitle,
        description: toastMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!coverLetter) return;
    const contentToCopy = formatContentForPlainText(editedContent || coverLetter.content);
    await navigator.clipboard.writeText(contentToCopy);
    setIsCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "The formatted cover letter has been copied to your clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = async (format: "docx" | "rtf") => {
    if (!coverLetter) return;

    const content = editedContent || coverLetter.content;
    const baseFileName = `cover-letter-${coverLetter.jobRole.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}`;
    const fileName = `${baseFileName}.${format}`;

    if (format === "docx") {
      try {
        // Convert markdown to docx format
        const paragraphs = [];
        const lines = content.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('## ')) {
            // Heading 2
            paragraphs.push(
              new Paragraph({
                text: line.replace('## ', ''),
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 200 },
              })
            );
          } else if (line.startsWith('### ')) {
            // Heading 3
            paragraphs.push(
              new Paragraph({
                text: line.replace('### ', ''),
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 200, after: 100 },
              })
            );
          } else if (line.startsWith('- ')) {
            // List item
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: '• ' + line.substring(2),
                    size: 24,
                  })
                ],
                indent: { left: 400 },
                spacing: { before: 50, after: 50 },
              })
            );
          } else if (line.trim() === '') {
            // Empty line (add some spacing)
            paragraphs.push(
              new Paragraph({
                text: '',
                spacing: { before: 100, after: 100 },
              })
            );
          } else {
            // Regular paragraph
            paragraphs.push(
              new Paragraph({
                text: line,
                spacing: { before: 100, after: 100 },
              })
            );
          }
        }

        // Create the document
        const doc = new Document({
          sections: [
            {
              properties: {},
              children: [
                new Paragraph({
                  text: `Cover Letter for ${coverLetter.jobRole}`,
                  heading: HeadingLevel.HEADING_1,
                  spacing: { after: 400 },
                }),
                ...paragraphs,
                new Paragraph({
                  text: 'Sincerely,',
                  spacing: { before: 400 },
                }),
                new Paragraph({
                  text: 'Your Name',
                  spacing: { before: 400 },
                }),
              ],
            },
          ],
        });

        // Generate the document and trigger download
        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

      } catch (error) {
        console.error('Error generating DOCX:', error);
        toast({
          title: "Error",
          description: "Failed to generate DOCX file. Please try again.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // For RTF, we'll create a simple formatted document
      const formattedContent = formatContentForExport(content);
      const rtfContent = `{\\rtf1\\ansi\\ansicpg1252\\deff0\\deflang1033
{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}}\
\viewkind4\\uc1\\pard\\f0\\fs24
${formattedContent.replace(/\n/g, '\\\\par ')}
\\par
}`;
      
      const blob = new Blob([rtfContent], { type: "application/rtf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: "Download Started",
      description: `Your cover letter is downloading as a ${format.toUpperCase()} file.`,
    });
  };

  const resetForm = () => {
    setCoverLetter(null);
    setStreamingContent("");
    setIsEditing(false);
    setShowPreview(true);
  };

  const hasGeneratedContent = coverLetter || streamingContent;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6"
      >
        <Button variant="ghost" onClick={onBack} className="text-sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Review
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Cover Letter Studio
        </h1>
        <div className="w-24" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-4"
        >
          <GlassCard className="p-6 sticky top-24">
            <div className="flex items-center mb-4">
              <Wand2 className="mr-3 h-6 w-6 text-purple-500" />
              <h2 className="text-xl font-semibold">Customization</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="jobRole">
                  Job Role <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="jobRole"
                  name="jobRole"
                  value={formData.jobRole}
                  onChange={handleInputChange}
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Select
                    value={formData.tone}
                    onValueChange={(v) =>
                      setFormData({ ...formData, tone: v as Tone })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="length">Length</Label>
                  <Select
                    value={formData.length}
                    onValueChange={(v) =>
                      setFormData({ ...formData, length: v as LetterLength })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="companyName">Company (Optional)</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="e.g., Acme Inc."
                />
              </div>
              <div>
                <Label htmlFor="jobDescription">
                  Job Description (Optional)
                </Label>
                <Textarea
                  id="jobDescription"
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleInputChange}
                  placeholder="Paste job description for better results..."
                  rows={4}
                  className="text-xs"
                />
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="highlightSkills" className="text-sm">
                    Highlight Relevant Skills
                  </Label>
                  <Switch
                    id="highlightSkills"
                    checked={formData.highlightSkills}
                    onCheckedChange={(c) =>
                      handleSwitchChange("highlightSkills", c)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="includePersonalTouch" className="text-sm">
                    Include Personal Touch
                  </Label>
                  <Switch
                    id="includePersonalTouch"
                    checked={formData.includePersonalTouch}
                    onCheckedChange={(c) =>
                      handleSwitchChange("includePersonalTouch", c)
                    }
                  />
                </div>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                {isGenerating ? "Generating..." : "Generate Cover Letter"}
              </Button>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-8"
        >
          <AnimatePresence mode="wait">
            {!hasGeneratedContent && !error ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="flex items-center justify-center min-h-[400px] bg-muted/50 rounded-lg">
                  <div className="text-center space-y-4 p-6">
                    <Wand2 className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-medium">Your Cover Letter Awaits</h3>
                    <p className="text-sm text-muted-foreground">
                      Generate a personalized cover letter based on your CV and job details.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-muted/50 rounded-lg p-6 text-center border border-destructive/20">
                  <div className="bg-destructive/10 p-4 rounded-full mb-4">
                    <Wand2 className="h-10 w-10 text-destructive" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">{error.title || "Something went wrong"}</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {error.message}
                  </p>
                  <div className="flex gap-3">
                    {error.canRetry && (
                      <Button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="gap-2"
                        variant="outline"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Retrying...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                          </>
                        )}
                      </Button>
                    )}
                    {error.action && (
                      <Button 
                        onClick={error.action}
                        variant="outline"
                        className="gap-2"
                      >
                        {error.actionText || "Learn More"}
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >  
                <Card className="shadow-xl dark:shadow-gray-800/20 rounded-2xl overflow-hidden h-full flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Generated Cover Letter</CardTitle>
                        <CardDescription>
                          For: {formData.jobRole}
                          {formData.companyName && ` at ${formData.companyName}`}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {coverLetter && (
                          <>
                            <Button
                              variant={showPreview ? "secondary" : "ghost"}
                              size="sm"
                              onClick={() => setShowPreview(!showPreview)}
                              aria-label="Toggle preview"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <AnimatePresence mode="wait">
                              {isEditing ? (
                                <motion.div
                                  key="save"
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -10 }}
                                >
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => {
                                      setIsEditing(false);
                                      toast({
                                        title: "Changes saved",
                                        description: "Your changes have been saved.",
                                      });
                                    }}
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                                  >
                                    <Save className="h-4 w-4 mr-1" />
                                    Save
                                  </Button>
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="edit"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 10 }}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsEditing(true)}
                                    aria-label="Edit mode"
                                    className="hover:bg-gray-100 dark:hover:bg-gray-800"
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                            <motion.div
                              initial={false}
                              animate={{ scale: isCopied ? 1.1 : 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopyToClipboard}
                                aria-label="Copy to clipboard"
                                className="relative overflow-hidden"
                              >
                                <AnimatePresence mode="wait">
                                  {isCopied ? (
                                    <motion.span
                                      key="check"
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      className="text-green-600 flex items-center gap-1"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </motion.span>
                                  ) : (
                                    <motion.span
                                      key="copy"
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      className="flex items-center gap-1"
                                    >
                                      <Copy className="h-4 w-4" />
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              </Button>
                            </motion.div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload("docx")}
                              aria-label="Download as DOCX"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow p-0">
                    {isEditing ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                      >
                        <Textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="h-full min-h-[500px] font-sans text-base border-0 focus-visible:ring-2 focus-visible:ring-blue-200 rounded-none p-6"
                          style={{ lineHeight: '1.7' }}
                        />
                      </motion.div>
                    ) : isGenerating && !coverLetter ? (
                      <div className="p-6 h-full">
                        {!streamingContent ? (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4 h-full"
                          >
                            <div className="space-y-3">
                              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                            </div>
                            <div className="space-y-3 pt-2">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                            </div>
                            <div className="space-y-3 pt-2">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 h-full">
                            <ContentFormatter content={streamingContent} />
                            <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse"></span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                        <div className="prose prose-sm max-w-none p-6 h-full min-h-[500px] overflow-y-auto">
                          <ContentFormatter content={editedContent} />
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                  <div className="px-6 pb-6 flex justify-end">
                    <Button variant="outline" onClick={resetForm}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Start Over
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}