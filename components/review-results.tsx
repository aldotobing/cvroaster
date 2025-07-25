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
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";
import {
  Trophy,
  Heart,
  Lightbulb,
  CheckCircle,
  XCircle,
  Zap,
  TrendingUp,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Check,
  FileText,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import ScoringGuide from "@/components/ScoringGuide";

type ScoreFeedback = {
  emoji: string;
  title: string;
  message: string;
  className: string;
  progress: string;
  bg: string;
  border: string;
};

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
    if (score >= 85) return { 
      text: 'text-green-700', 
      bg: 'bg-green-100', 
      border: 'border-green-200', 
      fill: 'text-green-500',
      chart: '#10B981', // green-500
      chartBg: '#ECFDF5' // green-100
    };
    if (score >= 70) return { 
      text: 'text-blue-700', 
      bg: 'bg-blue-100', 
      border: 'border-blue-200', 
      fill: 'text-blue-500',
      chart: '#3B82F6', // blue-500
      chartBg: '#EFF6FF' // blue-100
    };
    if (score >= 50) return { 
      text: 'text-amber-700', 
      bg: 'bg-amber-100', 
      border: 'border-amber-200', 
      fill: 'text-amber-500',
      chart: '#F59E0B', // amber-500
      chartBg: '#FFFBEB' // amber-100
    };
    return { 
      text: 'text-red-700', 
      bg: 'bg-red-100', 
      border: 'border-red-200', 
      fill: 'text-red-500',
      chart: '#EF4444', // red-500
      chartBg: '#FEF2F2' // red-100
    };
  };
  
  const getScoreFeedback = (score: number): ScoreFeedback => {
    if (score >= 85) return { 
      emoji: '🏆', 
      title: 'Outstanding!',
      message: 'Your CV demonstrates exceptional alignment with the target role.',
      className: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
      progress: 'bg-green-500',
      bg: 'bg-green-100',
      border: 'border-green-200'
    };
    if (score >= 70) return { 
      emoji: '🎯', 
      title: 'Great Job!',
      message: 'Your CV shows strong potential with some room for refinement.',
      className: 'from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20',
      progress: 'bg-blue-500',
      bg: 'bg-blue-100',
      border: 'border-blue-200'
    };
    if (score >= 50) return { 
      emoji: '👍', 
      title: 'Good Effort!',
      message: 'Your CV has potential but could benefit from some improvements.',
      className: 'from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20',
      progress: 'bg-amber-500',
      bg: 'bg-amber-100',
      border: 'border-amber-200'
    };
    return { 
      emoji: '💪', 
      title: 'Needs Work',
      message: 'Your CV requires significant improvements to be competitive.',
      className: 'from-red-50 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20',
      progress: 'bg-red-500',
      bg: 'bg-red-100',
      border: 'border-red-200'
    };
  };

  const [isScoringGuideOpen, setIsScoringGuideOpen] = React.useState(false);



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

      {/* Error Notice - Only shown when there's an error or empty response */}
      {(review.error || !review || Object.keys(review).length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                {review?.error ? 'Error Processing Your CV' : 'Incomplete Results Received'}
              </h3>
              <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                <p>
                  {review?.error || 'We encountered an issue processing your CV. The results may be incomplete.'}
                </p>
                <p className="mt-2">
                  <button 
                    onClick={() => window.location.reload()} 
                    className="font-medium underline hover:text-red-900 dark:hover:text-red-100"
                  >
                    Click here to try again
                  </button>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="bg-white dark:bg-gray-900 border-0 shadow-sm overflow-hidden">
          <div className="relative">
            <div className={`absolute inset-0 ${getScoreFeedback(review.score).bg} opacity-10`}></div>
            <CardContent className="relative p-6 sm:p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Left Column - Radial Chart */}
                <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col items-center">
                  <div className="relative w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart 
                        innerRadius="80%" 
                        outerRadius="100%"
                        barSize={10}
                        data={[{
                          name: 'score',
                          value: review.score,
                          fill: getScoreColor(review.score).chart,
                          background: getScoreColor(review.score).chartBg
                        }]}
                        startAngle={90}
                        endAngle={-270}
                      >
                        <PolarAngleAxis 
                          type="number" 
                          domain={[0, 100]} 
                          angleAxisId={0} 
                          tick={false}
                        />
                        <RadialBar
                          dataKey="value"
                          cornerRadius={5}
                          className="animate-in fade-in duration-1000"
                          background={{ fill: getScoreColor(review.score).chartBg }}
                        />
                        <text
                          x="50%"
                          y="50%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className={`text-4xl font-bold ${getScoreColor(review.score).text}`}
                        >
                          {review.score}
                        </text>
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="text-center mt-2 text-sm text-gray-500">
                      out of 100
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Score Details */}
                <div className="w-full md:w-2/3 lg:w-3/4 text-center md:text-left">
                  <div className="flex flex-col items-center md:items-start mb-4">
                    <span className={`text-5xl mb-2 ${getScoreColor(review.score).text}`}>
                      {getScoreFeedback(review.score).emoji}
                    </span>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                      {getScoreFeedback(review.score).title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 max-w-lg">
                      {getScoreFeedback(review.score).message}
                    </p>
                  </div>
                  
                  <div className="w-full max-w-md mx-auto md:mx-0">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>0</span>
                      <span>100</span>
                    </div>
                    <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getScoreFeedback(review.score).progress} rounded-full transition-all duration-1000`}
                        style={{ width: `${review.score}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Needs Work</span>
                      <span>Perfect Match</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-sm text-gray-600 dark:text-gray-300">
                    <p className="mb-2">
                      <span className="font-medium">How is this score calculated?</span> We analyze your CV against the job description and industry standards.
                    </p>
                    <p>
                      <button 
                        onClick={() => setIsScoringGuideOpen(!isScoringGuideOpen)}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                                   bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300
                                   focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700"
                        aria-expanded={isScoringGuideOpen}
                      >
                        <FileText className="w-4 h-4 mr-2" /> 
                        {isScoringGuideOpen ? 'Hide' : 'View'} detailed scoring guide
                        <ChevronDown className={`ml-2 w-4 h-4 transition-transform duration-200 ${isScoringGuideOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
          <Collapsible open={isScoringGuideOpen} onOpenChange={setIsScoringGuideOpen}>
            <CollapsibleContent>
              <ScoringGuide className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm" />
            </CollapsibleContent>
          </Collapsible>
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
            <div className="space-y-4">
              {review.suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 + index * 0.1 }}
                  className="group relative"
                >
                  <div className="relative z-10 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 shadow-xs hover:shadow-sm transition-shadow">
                    <div className="space-y-3">
                      <div className="flex-1 min-w-0">
                        <div className="relative group">
                          <div className="relative px-3 py-2 -mx-2 -mt-1 bg-amber-50 dark:bg-amber-900/20 rounded-md border-l-4 border-amber-400">
                            <div className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">Original Text</div>
                            <div className="text-gray-800 dark:text-gray-200">
                              {suggestion.from}
                            </div>
                            <div className="absolute -top-2 -right-2 bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs font-medium px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-700">
                              Before
                            </div>
                          </div>
                        </div>
                        
                        <div className="relative group mt-4">
                          <div className="px-3 py-2 -mx-2 bg-green-50 dark:bg-green-900/10 rounded-md border-l-4 border-green-400">
                            <div className="text-xs font-medium text-green-800 dark:text-green-200 mb-1">Suggestion</div>
                            <div className="text-gray-800 dark:text-gray-200">
                              <MarkdownContent content={suggestion.to} />
                            </div>
                            <div className="absolute -top-2 -right-2 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 p-1 rounded-full border border-green-200 dark:border-green-700">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                        {suggestion.explanation && (
                          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Why this works better:</span> {suggestion.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 blur-sm transition-opacity -z-10"></div>
                </motion.div>
              ))}
            </div>
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

      {/* Cover Letter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8"
      >
        <Card className="border-2 border-dashed border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-blue-700 dark:text-blue-300">
              <FileText className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              <span>Professional Cover Letter</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5"></div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Stand out from other applicants with a personalized cover letter that highlights your unique qualifications for <span className="font-medium text-blue-700 dark:text-blue-300">{jobRole || 'this position'}</span>.
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5"></div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Our AI will analyze your CV and craft a compelling narrative that aligns with the job requirements.
                  </p>
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  onClick={() => {
                    const event = new CustomEvent('generateCoverLetter');
                    window.dispatchEvent(event);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Cover Letter
                </Button>
                
                <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
                  Takes about 30 seconds to generate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Fun Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="text-center pt-4 pb-8"
      >
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Remember: Every rejection is just redirection to something better! 🌟
        </p>
      </motion.div>
    </div>
  );
}
