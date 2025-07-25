export interface SkillGapAnalysis {
  missingSkills: string[]
  trendingSkills: string[]
  skillMatchScore: number
  recommendations: string[]
}

export interface ATSOptimization {
  compatibilityScore: number
  missingKeywords: string[]
  contentOptimization: string
  formattingTips: string[]
  atsFriendlyFormat: boolean
}

export interface DynamicContent {
  professionalSummary: string
  keyAchievements: string[]
  skillsSection: string
  tailoredExperience: string[]
}

export interface Suggestion {
  from: string;
  to: string;
  explanation?: string;
}

export interface CVReview {
  // Basic review
  score: number
  strengths: string[]
  weaknesses: string[]
  structureFeedback: string
  grammarFeedback: string
  suggestions: Suggestion[]
  provider: "Gemini" | "DeepSeek"
  
  // ATS feedback
  atsScore: number
  atsFeedback: string
  
  // Original CV text for reference
  cvText?: string
  
  // Error state
  error?: string
  
  // Enhanced feedback (optional fields)
  skillGapAnalysis?: SkillGapAnalysis
  atsOptimization?: ATSOptimization
  dynamicContent?: DynamicContent
}

export type Tone = 'professional' | 'friendly' | 'technical' | 'creative';
export type LetterLength = 'short' | 'medium' | 'detailed';

export interface CoverLetterOptions {
  tone: Tone;
  length: LetterLength;
  highlightSkills: boolean;
  includePersonalTouch: boolean;
  customInstructions?: string;
  language?: 'english' | 'indonesian';
}

export interface CoverLetter {
  content: string;
  options: CoverLetterOptions;
  generatedAt: string;
  jobRole: string;
  companyName?: string;
  jobDescription?: string;
  formattedDate?: string;
}
