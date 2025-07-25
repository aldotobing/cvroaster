import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  CoverLetter,
  CoverLetterOptions,
  CVReview,
  Tone,
  LetterLength,
} from "@/types/cv-review";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

type CoverLetterGenerationParams = {
  cvText: string;
  jobRole: string;
  cvReview: CVReview;
  options: CoverLetterOptions;
  companyName?: string;
  jobDescription?: string;
  language?: "english" | "indonesian";
};

export async function generateCoverLetterStream(
  params: CoverLetterGenerationParams
): Promise<ReadableStream<string>> {
  const {
    cvText,
    jobRole,
    cvReview,
    options,
    companyName = '',
    jobDescription = '',
    language = 'english'
  } = params;

  const prompt = createCoverLetterPrompt({
    cvText,
    jobRole,
    cvReview,
    options,
    companyName,
    jobDescription,
    language
  });

  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    const model = new GoogleGenerativeAI(GEMINI_API_KEY).getGenerativeModel({
      model: 'gemini-2.0-flash',
    });

    const chat = model.startChat({
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    return new ReadableStream({
      async start(controller) {
        try {
          const result = await chat.sendMessageStream(prompt);
          for await (const chunk of result.stream) {
            controller.enqueue(chunk.text());
          }
          controller.close();
        } catch (error: any) {
          console.error('Error in generateCoverLetterStream:', error);
          
          // Create an error object with additional details
          const enhancedError = new Error(error?.message || 'An error occurred while generating the cover letter. Please try again.');
          
          // Add additional properties to the error object
          Object.defineProperty(enhancedError, 'originalError', {
            value: error,
            enumerable: false
          });
          
          // Add error type information
          if (error?.message?.includes('API key not valid') || 
              error?.message?.includes('API_KEY_INVALID') ||
              error?.errorDetails?.some((detail: any) => 
                detail['@type'] === 'type.googleapis.com/google.rpc.ErrorInfo' && 
                detail.reason === 'API_KEY_INVALID'
              )) {
            Object.defineProperty(enhancedError, 'type', { value: 'API_KEY_ERROR' });
          } else if (error?.status === 429 || 
                    error?.message?.includes('quota') || 
                    error?.message?.includes('rate limit')) {
            Object.defineProperty(enhancedError, 'type', { value: 'RATE_LIMIT_ERROR' });
          } else if (error?.message?.includes('network') || 
                    error?.message?.includes('fetch failed')) {
            Object.defineProperty(enhancedError, 'type', { value: 'NETWORK_ERROR' });
          }
          
          throw enhancedError;
        }
      }
    });
  } catch (error: any) {
    console.error('Error initializing GoogleGenerativeAI:', error);
    
    // Re-throw with more user-friendly messages
    if (error.message.includes('API key not valid') || 
        error.message.includes('API_KEY_INVALID')) {
      throw new Error(
        'Invalid API key. Please check your Google Generative AI API key in the environment variables. "GEMINI_API_KEY" must be a valid API key.'
      );
    }
    
    if (error.message.includes('quota') || error.message.includes('rate limit')) {
      throw new Error(
        'API rate limit or quota exceeded. Please check your Google Cloud quota or try again later.'
      );
    }
    
    throw error;
  }
}

type PromptParams = Omit<CoverLetterGenerationParams, 'cvReview'> & {
  cvReview: CVReview;
};

export function createCoverLetterPrompt({
  cvText = '',
  jobRole,
  cvReview,
  options = {
    tone: 'professional',
    length: 'medium',
    highlightSkills: true,
    includePersonalTouch: true,
    language: 'english'
  },
  companyName = '',
  jobDescription = '',
  language = 'english'
}: Partial<PromptParams> & { cvText?: string; jobRole: string; cvReview: CVReview }): string {
  const isIndonesian = language === "indonesian";
  const today = new Date();
  const formattedDate = formatDate(today, 'long', language);

  // Extract key information from CV review with proper null checks
  const strengths = (cvReview?.strengths || []).join("\n- ") || "No specific strengths mentioned";
  const keyAchievements = (cvReview?.dynamicContent?.keyAchievements || []).join("\n- ") || "No key achievements mentioned";
  const relevantSkills = (cvReview?.atsOptimization?.missingKeywords || [])
    .filter(kw => {
      if (!kw) return false;
      const lowerKw = kw.toLowerCase();
      return !["communication", "teamwork", "leadership"].some(common => 
        lowerKw.includes(common)
      );
    })
    .join(", ") || "No specific skills mentioned";

  // Ensure options has required properties with defaults
  const defaultOptions = {
    tone: 'professional' as const,
    length: 'medium' as const,
    highlightSkills: true,
    includePersonalTouch: true,
    language: language || 'english',
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    language: options?.language || language || 'english'
  };

  const instructions = [
    "# COVER LETTER GENERATION INSTRUCTIONS",
    "## CONTEXT",
    `- Position: ${jobRole || 'the position'}`,
    companyName && `- Company: ${companyName}`,
    `- Date: ${formattedDate}`,
    `- Language: ${isIndonesian ? 'Indonesian' : 'English'}`,
    "",
    "## CANDIDATE INFORMATION (Extract from CV text below)",
    "- Name: [Extract full name from CV text]",
    "- Email: [Extract email address from CV text]",
    "- Phone: [Extract phone number from CV text]",
    "- Location: [Extract city/country from CV text]",
    "- LinkedIn: [Extract LinkedIn profile URL if available]",
    "- Portfolio/Website: [Extract portfolio or personal website if available]",
    "",
    "CV TEXT TO EXTRACT INFORMATION FROM:",
    cvText ? cvText.substring(0, 2000) + (cvText.length > 2000 ? "..." : "") : "No CV text provided",
    "",
    "## CV STRENGTHS TO HIGHLIGHT",
    strengths ? `- ${strengths}` : "Not specified",
    "",
    keyAchievements && "## KEY ACHIEVEMENTS",
    keyAchievements ? `- ${keyAchievements}` : "",
    "",
    "## RELEVANT SKILLS (From ATS Optimization)",
    relevantSkills,
    "",
    "## INSTRUCTIONS FOR SKILL INCORPORATION",
    "- Highlight the most relevant skills from the 'Relevant Skills' section in your cover letter",
    "- Match these skills to the job requirements mentioned in the job description",
    "- Provide specific examples of how you've used these skills in your professional experience",
    "",
    "## JOB DESCRIPTION",
    jobDescription || "Not provided",
    "",
    "## WRITING INSTRUCTIONS",
    `1. Tone: ${getToneInstruction(mergedOptions.tone, isIndonesian)}`,
    `2. Length: ${getLengthInstruction(mergedOptions.length, isIndonesian).split('\n')[0]}`,
    `3. Language: ${isIndonesian ? 'Formal Indonesian' : 'Professional English'}`,
    "4. Structure:",
    "   - Professional header with extracted contact information (name, email, phone, location)",
    "   - Date and company address (if available)",
    "   - Professional salutation (e.g., 'Dear Hiring Manager' or specific name if available in job description)",
    "   - Strong opening paragraph that mentions the position and company",
    "   - 1-2 body paragraphs highlighting relevant experience and achievements from the CV",
    "   - Closing paragraph expressing enthusiasm and next steps",
    "   - Professional closing with your name and contact information"
  ].filter(Boolean).join("\n");

  const promptLines = [
    "IMPORTANT: Only generate the cover letter content. Do not include any comments, explanations, or notes before or after the letter",
    "",
    instructions,
    "",
    isIndonesian 
      ? "TOLONG BUATKAN SURAT LAMARAN YANG MENARIK DENGAN INFORMASI DI ATAS. PASTIKAN UNTUK:"
      : "PLEASE CREATE A COMPELLING COVER LETTER USING THE ABOVE INFORMATION. MAKE SURE TO:",
    "",
    `1. ${isIndonesian 
      ? "Ekstrak informasi kontak (nama, email, telepon, lokasi) dari teks CV yang disediakan" 
      : "Extract contact information (name, email, phone, location) from the provided CV text"}`,
    `2. ${isIndonesian 
      ? "Sebutkan posisi yang dilamar di paragraf pertama" 
      : "Mention the position you're applying for in the first paragraph"}`,
    `3. ${isIndonesian 
      ? "Sertukan 2-3 poin kunci dari pengalaman dan pencapaian yang relevan, fokus pada keterampilan yang disebutkan di bagian 'Relevant Skills'" 
      : "Include 2-3 key points about relevant experience and achievements, focusing on the skills mentioned in the 'Relevant Skills' section"}`,
    `4. ${isIndonesian 
      ? "Sesuaikan dengan kebutuhan perusahaan dan deskripsi pekerjaan" 
      : "Tailor the content to the company's needs and job description"}`,
    `5. ${isIndonesian 
      ? "Gunakan bahasa yang profesional dan percaya diri" 
      : "Use professional and confident language"}`,
    `6. ${isIndonesian 
      ? "Panjang surat harus sesuai dengan preferensi yang diminta" 
      : "The letter length should match the requested preference"}`,
    "",
    isIndonesian 
      ? "TOLONG HASILKAN HANYA ISI SURAT LAMARAN TANPA KOMENTAR TAMBAHAN. LANGSUNG MULAI DARI SALAM PEMBUKA SAMPAI DENGAN TANDA TANGAN. JANGAN MEMBERIKAN KOMENTAR APAPUN SEBELUM ATAU SESUDAH SURAT."
      : "PLEASE GENERATE ONLY THE COVER LETTER CONTENT WITHOUT ANY EXTRA COMMENTS. START DIRECTLY WITH THE SALUTATION AND END WITH THE SIGNATURE. DO NOT INCLUDE ANY COMMENTS BEFORE OR AFTER THE LETTER.",
    ""
  ];

  return promptLines.join("\n");
}

function getToneInstruction(tone: Tone, isIndonesian: boolean): string {
  const tones = {
    professional: isIndonesian
      ? "Formal dan profesional, cocok untuk perusahaan korporat dan posisi eksekutif"
      : "Formal and professional, suitable for corporate environments and executive positions",
    friendly: isIndonesian
      ? "Ramah namun tetap profesional, cocok untuk budaya perusahaan yang santai"
      : "Friendly yet professional, good for company cultures that value approachability",
    technical: isIndonesian
      ? "Teknis dan spesifik, fokus pada keterampilan dan pencapaian teknis"
      : "Technical and specific, focusing on skills and technical achievements",
    creative: isIndonesian
      ? "Kreatif dan menarik, cocok untuk industri kreatif seperti pemasaran atau desain"
      : "Creative and engaging, ideal for creative industries like marketing or design",
  };
  return tones[tone];
}

function getLengthInstruction(length: LetterLength, isIndonesian: boolean): string {
  const lengths = {
    short: isIndonesian
      ? "Ringkas (150-200 kata) - Fokus pada poin-poin kunci dan hindari kalimat yang bertele-tele."
      : "Concise (150-200 words) - Focus on key points and avoid unnecessary details.",
    medium: isIndonesian
      ? "Sedang (300-400 kata) - Sertakan pengantar yang kuat, 1-2 paragraf tentang kualifikasi, dan penutup yang profesional."
      : "Moderate (300-400 words) - Include a strong introduction, 1-2 paragraphs about qualifications, and a professional closing.",
    detailed: isIndonesian
      ? "Panjang (500+ kata) - Rincian mendalam tentang pengalaman, pencapaian, dan bagaimana Anda dapat memberikan nilai tambah."
      : "Detailed (500+ words) - In-depth coverage of experience, achievements, and how you can add value.",
  };
  return lengths[length];
}

function formatDate(date: Date, format: 'long' | 'short' | 'numeric' = 'long', language: string = 'en-US'): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'long' ? 'long' : format === 'short' ? 'short' : 'numeric',
    day: 'numeric'
  };
  
  try {
    return new Intl.DateTimeFormat(
      language === 'indonesian' ? 'id-ID' : 'en-US',
      {
        ...options,
        timeZone: 'UTC' // Use UTC to avoid timezone issues
      }
    ).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    // Fallback to a simple date string
    return date.toLocaleDateString(language === 'indonesian' ? 'id-ID' : 'en-US');
  }
}

export function parseCoverLetterResponse(
  response: any,
  jobRole: string,
  options: CoverLetterOptions,
  companyName?: string,
  jobDescription?: string,
  cvText?: string
): CoverLetter {
  // Extract content safely
  let content = '';
  if (typeof response === 'string') {
    content = response;
  } else if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
    content = response.candidates[0].content.parts[0].text;
  } else if (response?.text) {
    content = response.text;
  } else if (response?.content) {
    content = typeof response.content === 'string' 
      ? response.content 
      : response.content.text || '';
  }

  // If content is still empty, log a warning and provide a fallback
  if (!content) {
    console.warn('Unexpected response format:', JSON.stringify(response, null, 2));
    content = 'Unable to generate cover letter. Please try again.';
  }

  // Clean up markdown formatting if present
  content = content
    .replace(/```(?:markdown)?\n?/g, '') // Remove markdown code block markers
    .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with 2
    .trim();

  // Ensure the letter ends with a proper closing
  const closingRegex = /(sincerely|regards|best regards|yours truly|hormat saya|salam|terima kasih),?\s*\n*\s*[A-Z][a-z]+(?: [A-Z][a-z]+)*/i;
  if (!closingRegex.test(content)) {
    const signOff = options.language === 'indonesian' 
      ? '\n\nHormat saya,'
      : '\n\nSincerely,';
    content += signOff;
  }

  // Create and return the cover letter object
  return {
    content,
    options: {
      ...options,
      tone: options.tone || 'professional',
      length: options.length || 'medium',
      highlightSkills: options.highlightSkills ?? true,
      includePersonalTouch: options.includePersonalTouch ?? true,
      language: options.language || 'english'
    },
    generatedAt: new Date().toISOString(),
    jobRole,
    companyName: companyName || '',
    jobDescription,
    formattedDate: formatDate(new Date(), 'long', options.language || 'en-US')
  };
}
