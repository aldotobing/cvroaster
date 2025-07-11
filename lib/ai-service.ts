import type { CVReview } from "@/types/cv-review"

const AI_PROXY_ENDPOINT = process.env.NEXT_PUBLIC_AI_PROXY_ENDPOINT || 'https://deepseek-proxy.aldo-tobing.workers.dev'

export async function reviewCV(cvText: string, jobRole: string, language: 'english' | 'indonesian' = 'english'): Promise<CVReview> {
  const prompt = createPrompt(cvText, jobRole, language)

  try {
    // Try Gemini first
    const geminiResult = await callGeminiAPI(prompt)
    return { ...geminiResult, provider: "Gemini" }
  } catch (error) {
    console.warn("Gemini API failed, falling back to DeepSeek:", error)

    try {
      // Fallback to DeepSeek
      const deepseekResult = await callDeepSeekAPI(prompt)
      return { ...deepseekResult, provider: "DeepSeek" }
    } catch (fallbackError) {
      throw new Error("Both AI services are currently unavailable. Please try again later.")
    }
  }
}

function createPrompt(cvText: string, jobRole: string, language: 'english' | 'indonesian' = 'english'): string {
  const isIndonesian = language === 'indonesian';
  const languageInstruction = isIndonesian 
    ? 'Provide the response in proper Bahasa Indonesia.' 
    : 'Provide the response in proper English.';

  return `You are an expert CV reviewer and career coach. Please provide a comprehensive review of the following CV for the job application. ${languageInstruction}

**CV:**
${cvText}

**Job Position:** ${jobRole}

**Response Format (JSON):**
{
  "score": 0-100, 
  "strengths": ["Strength 1", "Strength 2", ...], 
  "weaknesses": ["Weakness 1", "Weakness 2", ...], 
  "structureFeedback": "Feedback about CV structure and organization",
  "grammarFeedback": "Feedback about grammar and clarity",
  "suggestions": ["Suggestion 1", "Suggestion 2", ...], 
  
  "atsScore": 0-100, 
  "atsFeedback": "Detailed feedback about ATS compatibility",
  
  "skillGapAnalysis": {
    "missingSkills": ["Skill 1", "Skill 2", ...], 
    "trendingSkills": ["Trending Skill 1", ...], 
    "skillMatchScore": 0-100, 
    "recommendations": ["Recommendation 1", ...] 
  },
  
  "atsOptimization": {
    "compatibilityScore": 0-100,
    "missingKeywords": ["Keyword 1", ...], 
    "contentOptimization": "Detailed suggestions for ATS optimization",
    "formattingTips": ["Tip 1", ...], 
    "atsFriendlyFormat": true/false 
  },
  
  "dynamicContent": {
    "professionalSummary": "A strong professional summary for this role",
    "keyAchievements": ["Achievement 1", ...], 
    "skillsSection": "Optimized skills section for this role",
    "tailoredExperience": ["Tailored experience 1", ...] 
  }
}

IMPORTANT NOTES:
1. Return ONLY valid JSON without any additional text or markdown formatting
2. All scores should be between 0-100
3. Provide specific, actionable feedback
4. For arrays, provide at least 3 items where applicable
5. For missingKeywords, include both technical and soft skills from the job description
6. For trendingSkills, consider the latest industry trends for this role
7. For dynamicContent, tailor all suggestions specifically to the target job role`;
}

async function callGeminiAPI(prompt: string): Promise<Omit<CVReview, "provider">> {
  if (!AI_PROXY_ENDPOINT) {
    throw new Error("AI Proxy endpoint is not configured")
  }

  const response = await fetch(
    AI_PROXY_ENDPOINT,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        model: 'gemini-2.5-flash'
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`AI Service error: ${response.status}`)
  }

  const data = await response.json();
  if (!data.ok || !data.text) {
    throw new Error('Failed to get valid response from AI service');
  }

  return parseAIResponse(data.text)
}

async function callDeepSeekAPI(prompt: string): Promise<Omit<CVReview, "provider">> {
  if (!AI_PROXY_ENDPOINT) {
    throw new Error("AI Proxy endpoint is not configured")
  }

  const response = await fetch(AI_PROXY_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt,
      model: 'deepseek-chat'
    }),
  })

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`)
  }

  const data = await response.json();
  if (!data.ok || !data.text) {
    throw new Error('Failed to get valid response from AI service');
  }
  return parseAIResponse(data.text)
}

function parseAIResponse(text: string): Omit<CVReview, "provider"> {
  try {
    // Extract JSON from the response (in case there's extra text)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No JSON found in response")
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Validate the response structure
    if (
      typeof parsed.score !== "number" ||
      !Array.isArray(parsed.strengths) ||
      !Array.isArray(parsed.weaknesses) ||
      !Array.isArray(parsed.suggestions)
    ) {
      throw new Error("Invalid response structure")
    }

    // Base response with fallbacks
    const response: Omit<CVReview, 'provider'> = {
      score: Math.max(0, Math.min(100, parsed.score)),
      strengths: parsed.strengths?.slice(0, 5) || [],
      weaknesses: parsed.weaknesses?.slice(0, 5) || [],
      structureFeedback: parsed.structureFeedback || "No specific feedback provided.",
      grammarFeedback: parsed.grammarFeedback || "No specific feedback provided.",
      atsScore: Math.max(0, Math.min(100, parsed.atsScore || 50)),
      atsFeedback: parsed.atsFeedback || "No specific ATS feedback provided.",
      suggestions: parsed.suggestions?.slice(0, 7) || [],
    };

    // Add enhanced feedback sections if available
    if (parsed.skillGapAnalysis) {
      response.skillGapAnalysis = {
        missingSkills: parsed.skillGapAnalysis.missingSkills || [],
        trendingSkills: parsed.skillGapAnalysis.trendingSkills || [],
        skillMatchScore: Math.max(0, Math.min(100, parsed.skillGapAnalysis.skillMatchScore || 0)),
        recommendations: parsed.skillGapAnalysis.recommendations || []
      };
    }

    if (parsed.atsOptimization) {
      response.atsOptimization = {
        compatibilityScore: Math.max(0, Math.min(100, parsed.atsOptimization.compatibilityScore || 0)),
        missingKeywords: parsed.atsOptimization.missingKeywords || [],
        contentOptimization: parsed.atsOptimization.contentOptimization || "No specific content optimization suggestions.",
        formattingTips: parsed.atsOptimization.formattingTips || [],
        atsFriendlyFormat: parsed.atsOptimization.atsFriendlyFormat || false
      };
    }

    if (parsed.dynamicContent) {
      response.dynamicContent = {
        professionalSummary: parsed.dynamicContent.professionalSummary || "",
        keyAchievements: parsed.dynamicContent.keyAchievements || [],
        skillsSection: parsed.dynamicContent.skillsSection || "",
        tailoredExperience: parsed.dynamicContent.tailoredExperience || []
      };
    }

    return response;
  } catch (error) {
    // Fallback response if parsing fails
    return {
      score: 70,
      strengths: ["CV successfully uploaded and processed"],
      weaknesses: ["Unable to provide detailed analysis at this time"],
      structureFeedback: "Please try again for detailed feedback.",
      grammarFeedback: "Please try again for detailed feedback.",
      atsScore: 60,
      atsFeedback: "Please try again for detailed ATS analysis.",
      suggestions: ["Try uploading your CV again for detailed suggestions"],
      // Include empty enhanced feedback sections
      skillGapAnalysis: {
        missingSkills: [],
        trendingSkills: [],
        skillMatchScore: 0,
        recommendations: ["Skill gap analysis will be available after processing"]
      },
      atsOptimization: {
        compatibilityScore: 0,
        missingKeywords: [],
        contentOptimization: "ATS optimization details will be available after processing",
        formattingTips: [],
        atsFriendlyFormat: false
      },
      dynamicContent: {
        professionalSummary: "",
        keyAchievements: [],
        skillsSection: "",
        tailoredExperience: []
      }
    }
  }
}
