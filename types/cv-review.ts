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

export interface CVReview {
  // Basic review
  score: number
  strengths: string[]
  weaknesses: string[]
  structureFeedback: string
  grammarFeedback: string
  suggestions: string[]
  provider: "Gemini" | "DeepSeek"
  
  // ATS feedback
  atsScore: number
  atsFeedback: string
  
  // Enhanced feedback (optional fields)
  skillGapAnalysis?: SkillGapAnalysis
  atsOptimization?: ATSOptimization
  dynamicContent?: DynamicContent
}
