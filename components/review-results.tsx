"use client";

import React from "react";
import { CVComparisonSection } from "./cv-comparison";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { CVReview } from "@/types/cv-review";
import {
  Trophy,
  Heart,
  Lightbulb,
  CheckCircle,
  XCircle,
  Zap,
  TrendingUp,
  Sparkles,
} from "lucide-react";

// Helper function to process markdown content for better formatting
const processMarkdownContent = (content: string): string => {
  if (!content) return content;

  // First, normalize all line endings to \n
  // Handle markdown formatting
  let processed = content
    // Handle the specific case of *text*: by converting to **text**
    // This handles the case where an asterisk follows italic text
    .replace(/\*([^*]+)\*:/g, "**$1**:")

    // Fix common markdown formatting issues
    .replace(/\*\*\s*([^*]+?)\s*\*\*/g, "**$1**") // Ensure no spaces inside **bold**
    .replace(/\*\*\*/g, "**") // Handle triple asterisks

    // Fix numbered lists formatting
    .replace(/(\n|^)(\d+)\.\s*/g, "$1$2. ") // Ensure consistent spacing after numbers
    .replace(/(\n)(?=\d+\. )/g, "$1") // Ensure single newline before numbered lists

    // Fix bullet points formatting
    .replace(/(\n|^)([-*+])\s*/g, "$1$2 ") // Ensure consistent spacing after bullets
    .replace(/(\n)(?=[-*+] )/g, "$1") // Ensure single newline before bullets

    // Ensure there's a space after colons that follow markdown formatting
    .replace(/(\*\*[^*]+\*\*):(\S)/g, "$1: $2")
    .replace(/(\*[^*]+\*):(\S)/g, "$1: $2");

  return processed;
};

// Custom components for markdown rendering
const MarkdownComponents = {
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
    // Process the content for better formatting
    const processedChildren = React.Children.map(children, (child) => {
      if (typeof child === "string") {
        return processMarkdownContent(child);
      }
      return child;
    });

    return (
      <p className="mb-3 last:mb-0 whitespace-pre-line" {...props}>
        {processedChildren}
      </p>
    );
  },
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc pl-6 space-y-2 mb-4" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal pl-6 space-y-2 mb-4" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => {
    // Process the content for better formatting
    const processedChildren = React.Children.map(children, (child) => {
      if (typeof child === "string") {
        return processMarkdownContent(child);
      }
      return child;
    });

    return (
      <li className="mb-2" {...props}>
        {processedChildren}
      </li>
    );
  },
  strong: ({
    children,
    ...props
  }: { children: React.ReactNode } & React.HTMLAttributes<HTMLElement>) => {
    // If children is a string, clean it up before rendering
    const cleanChildren = React.Children.map(children, (child) => {
      if (typeof child === "string") {
        // Remove any remaining ** markers that weren't properly parsed
        return child.replace(/^\*\*|\*\*$/g, "").trim();
      }
      return child;
    });

    return (
      <strong className="font-semibold" {...props}>
        {cleanChildren}
      </strong>
    );
  },
  em: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-2xl font-bold my-4" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-xl font-bold my-3" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-lg font-semibold my-2" {...props}>
      {children}
    </h3>
  ),
  code: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 text-sm font-mono"
      {...props}
    >
      {children}
    </code>
  ),
  blockquote: ({
    children,
    ...props
  }: React.BlockquoteHTMLAttributes<HTMLElement>) => (
    <blockquote
      className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-1 my-3 text-gray-600 dark:text-gray-300"
      {...props}
    >
      {children}
    </blockquote>
  ),
  a: ({
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 hover:underline"
      {...props}
    >
      {children}
    </a>
  ),
};

const MarkdownContent = ({ content }: { content: string }) => {
  // Process the content for better formatting
  const processedContent = processMarkdownContent(content);

  // Type assertion for MarkdownComponents to match ReactMarkdown's expected type
  const components = MarkdownComponents as unknown as React.ComponentProps<
    typeof ReactMarkdown
  >["components"];

  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown
        components={components}
        skipHtml={true}
        remarkPlugins={[remarkGfm]}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

interface ReviewResultsProps {
  review: CVReview;
  fileName: string;
  jobRole: string;
  originalCvText: string;
}

export default function ReviewResults({
  review,
  fileName,
  jobRole,
  originalCvText,
}: ReviewResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return "🏆";
    if (score >= 80) return "🎯";
    if (score >= 70) return "👍";
    if (score >= 60) return "👌";
    return "💪";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          CV Review Results 📊
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          For <span className="font-semibold">{fileName}</span>
          {jobRole && (
            <span>
              {" "}
              • Targeting: <span className="font-semibold">{jobRole}</span>
            </span>
          )}
        </p>
        <Badge variant="secondary" className="mt-2">
          Reviewed by {review.provider} AI
        </Badge>
      </motion.div>

      {/* Score Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <span className="text-6xl">{getScoreEmoji(review.score)}</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Overall Score</h3>
            <div
              className={`text-6xl font-bold mb-4 ${getScoreColor(
                review.score
              )}`}
            >
              {review.score}/100
            </div>
            <Progress
              value={review.score}
              className="w-full max-w-md mx-auto mb-4"
            />
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {review.score >= 80 && "You nailed it! 🎯"}
              {review.score >= 60 &&
                review.score < 80 &&
                "Pretty solid work! 👍"}
              {review.score < 60 &&
                "Room for improvement, but you've got this! 💪"}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Strengths */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              What's Working Great! ✅
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {review.strengths.map((strength, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                >
                  <span className="text-green-500 text-xl flex-shrink-0 mt-1">
                    💚
                  </span>
                  <div className="text-gray-700 dark:text-gray-300">
                    <MarkdownContent content={strength} />
                  </div>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Areas for Improvement */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Heart className="w-6 h-6" />
              This Part Could Use Some Love 💔
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {review.weaknesses.map((weakness, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
                >
                  <span className="text-orange-500 text-xl flex-shrink-0 mt-1">
                    🧡
                  </span>
                  <div className="text-gray-700 dark:text-gray-300">
                    <MarkdownContent content={weakness} />
                  </div>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Lightbulb className="w-6 h-6" />
              The Deep Dive 🔍
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Structure Feedback */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  Structure & Formatting
                </h4>
                <MarkdownContent content={review.structureFeedback} />
              </div>

              {/* Grammar Feedback */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  Grammar & Clarity
                </h4>
                <MarkdownContent content={review.grammarFeedback} />
              </div>

              {/* ATS Optimization */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-700 dark:text-purple-300">
                    ATS Optimization
                  </h4>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-3xl font-bold">
                    {review.atsScore}/100
                  </div>
                  <div className="flex-1">
                    <Progress value={review.atsScore} className="h-2" />
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {review.atsScore >= 70
                        ? "Great ATS compatibility!"
                        : review.atsScore >= 40
                        ? "Good, but could be better"
                        : "Needs improvement for better ATS parsing"}
                    </div>
                  </div>
                </div>
                <MarkdownContent content={review.atsFeedback} />

                {/* Enhanced ATS Feedback */}
                {review.atsOptimization && (
                  <div className="mt-4 space-y-3">
                    {review.atsOptimization.missingKeywords?.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm text-purple-800 dark:text-purple-200">
                          Missing Keywords:
                        </h5>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {review.atsOptimization.missingKeywords.map(
                            (keyword, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-purple-100 dark:bg-purple-800/50 text-purple-800 dark:text-purple-100 text-xs rounded-full"
                              >
                                {keyword}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {review.atsOptimization.formattingTips?.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm text-purple-800 dark:text-purple-200 mt-3">
                          Formatting Tips:
                        </h5>
                        <ul className="list-disc pl-5 space-y-1 mt-1">
                          {review.atsOptimization.formattingTips.map(
                            (tip, i) => (
                              <li
                                key={i}
                                className="text-sm text-gray-700 dark:text-gray-300"
                              >
                                {tip}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Skill Gap Analysis */}
              {review.skillGapAnalysis && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-700 dark:text-green-300">
                      Skill Gap Analysis
                    </h4>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Skill Match</span>
                      <span className="text-sm font-bold">
                        {review.skillGapAnalysis.skillMatchScore}%
                      </span>
                    </div>
                    <Progress
                      value={review.skillGapAnalysis.skillMatchScore}
                      className="h-2"
                    />
                  </div>

                  {review.skillGapAnalysis.missingSkills?.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-sm text-green-800 dark:text-green-200 mb-2">
                        Skills to Add:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {review.skillGapAnalysis.missingSkills.map(
                          (skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-100 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {review.skillGapAnalysis.trendingSkills?.length > 0 && (
                    <div className="mb-3">
                      <h5 className="font-medium text-sm text-green-800 dark:text-green-200 mb-2">
                        Trending in This Field:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {review.skillGapAnalysis.trendingSkills.map(
                          (skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-green-50 dark:bg-green-800/30 text-green-700 dark:text-green-200 text-xs rounded-full border border-green-200 dark:border-green-700"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {review.skillGapAnalysis.recommendations?.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm text-green-800 dark:text-green-200 mb-2">
                        Recommendations:
                      </h5>
                      <ul className="space-y-2">
                        {review.skillGapAnalysis.recommendations.map(
                          (rec, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Sparkles className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {rec}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Dynamic Content Generation */}
              {review.dynamicContent && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-semibold text-indigo-700 dark:text-indigo-300">
                      Content Suggestions
                    </h4>
                  </div>

                  {review.dynamicContent.professionalSummary && (
                    <div className="mb-4">
                      <h5 className="font-medium text-sm text-indigo-800 dark:text-indigo-200 mb-2">
                        Professional Summary:
                      </h5>
                      <div className="p-3 bg-white dark:bg-indigo-900/40 rounded border border-indigo-100 dark:border-indigo-800">
                        <MarkdownContent
                          content={review.dynamicContent.professionalSummary}
                        />
                      </div>
                    </div>
                  )}

                  {review.dynamicContent.keyAchievements?.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-sm text-indigo-800 dark:text-indigo-200 mb-2">
                        Key Achievements:
                      </h5>
                      <ul className="space-y-2">
                        {review.dynamicContent.keyAchievements.map(
                          (achievement, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-indigo-500">•</span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {achievement}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {review.dynamicContent.skillsSection && (
                    <div className="mb-4">
                      <h5 className="font-medium text-sm text-indigo-800 dark:text-indigo-200 mb-2">
                        Skills Section:
                      </h5>
                      <div className="p-3 bg-white dark:bg-indigo-900/40 rounded border border-indigo-100 dark:border-indigo-800">
                        <MarkdownContent
                          content={review.dynamicContent.skillsSection}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-600">
              <Lightbulb className="w-6 h-6" />
              Pro Tips to Level Up 🚀
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {review.suggestions.map((suggestion, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"
                >
                  <span className="text-indigo-500 text-xl flex-shrink-0 mt-1">
                    💡
                  </span>
                  <div className="text-gray-700 dark:text-gray-300">
                    <MarkdownContent content={suggestion} />
                  </div>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* ATS CV Generation */}
      <CVComparisonSection
        review={review}
        fileName={fileName}
        jobRole={jobRole}
        originalCvText={originalCvText}
      />

      {/* Fun Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="text-center py-8"
      >
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Remember: Every rejection is just redirection to something better! 🌟
        </p>
      </motion.div>
    </div>
  );
}
