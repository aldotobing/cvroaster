import type { CVReview } from "@/types/cv-review";
import { generateDocxFromCV } from "./docx-generator";

// Import DocumentSection type from docx-generator
interface DocumentSection {
  type: "heading1" | "heading2" | "heading3" | "paragraph" | "bullet";
  text: string;
}

export interface StructuredCV {
  content: string;
  personalInfo: {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  professionalSummary: string;
  skills: {
    technical: string[];
    soft: string[];
    other: string[];
  };
  experience: {
    title: string;
    company: string;
    date: string;
    points: string[];
  }[];
  education: {
    degree: string;
    school: string;
    date: string;
    details?: string;
  }[];
  achievements: string[];
}

export interface ATSFriendlyCV {
  originalCV: string;
  improvedCV: string;
  wordDocument: Blob;
}

async function generateWordDocument(cv: StructuredCV): Promise<Blob> {
  try {
    const sections: DocumentSection[] = [];

    // Header with personal info
    sections.push({
      type: "heading1",
      text: cv.personalInfo.name,
    });

    if (
      cv.personalInfo.email ||
      cv.personalInfo.phone ||
      cv.personalInfo.location
    ) {
      sections.push({
        type: "paragraph",
        text: [
          cv.personalInfo.email,
          cv.personalInfo.phone,
          cv.personalInfo.location,
        ]
          .filter(Boolean)
          .join(" | "),
      });
    }

    // Professional Summary
    if (cv.professionalSummary) {
      sections.push({ type: "heading2", text: "PROFESSIONAL SUMMARY" });
      sections.push({ type: "paragraph", text: cv.professionalSummary });
    }

    // Skills Section
    sections.push({ type: "heading2", text: "SKILLS & COMPETENCIES" });
    if (cv.skills.technical.length) {
      sections.push({
        type: "paragraph",
        text: `Technical Skills: ${cv.skills.technical.join(", ")}`,
      });
    }
    if (cv.skills.soft.length) {
      sections.push({
        type: "paragraph",
        text: `Soft Skills: ${cv.skills.soft.join(", ")}`,
      });
    }
    if (cv.skills.other.length) {
      sections.push({
        type: "paragraph",
        text: `Additional Skills: ${cv.skills.other.join(", ")}`,
      });
    }

    // Experience Section
    if (cv.experience.length) {
      sections.push({ type: "heading2", text: "PROFESSIONAL EXPERIENCE" });
      cv.experience.forEach((exp) => {
        sections.push({ type: "heading3", text: exp.title });
        sections.push({
          type: "paragraph",
          text: `${exp.company}${exp.date ? ` - ${exp.date}` : ""}`,
        });
        exp.points.forEach((point) => {
          sections.push({ type: "bullet", text: point });
        });
      });
    }

    // Education Section
    if (cv.education.length) {
      sections.push({ type: "heading2", text: "EDUCATION" });
      cv.education.forEach((edu) => {
        sections.push({ type: "heading3", text: edu.degree });
        sections.push({
          type: "paragraph",
          text: `${edu.school}${edu.date ? ` - ${edu.date}` : ""}`,
        });
        if (edu.details)
          sections.push({ type: "paragraph", text: edu.details });
      });
    }

    // Achievements Section
    if (cv.achievements.length) {
      sections.push({ type: "heading2", text: "KEY ACHIEVEMENTS" });
      cv.achievements.forEach((achievement) => {
        sections.push({ type: "bullet", text: achievement });
      });
    }

    const cvData = {
      personalInfo: {
        name: cv.personalInfo.name,
        email: cv.personalInfo.email || "",
        phone: cv.personalInfo.phone || "",
        location: cv.personalInfo.location || "",
      },
      professionalSummary: cv.professionalSummary,
      skills: cv.skills,
      experience: cv.experience,
      education: cv.education,
      achievements: cv.achievements,
    };
    return await generateDocxFromCV(cvData);
  } catch (error) {
    console.error("Error generating Word document:", error);
    throw new Error("Failed to generate Word document");
  }
}

export async function generateATSFriendlyCV(
  cvText: string,
  review: CVReview,
  jobRole: string
): Promise<ATSFriendlyCV> {
  if (!cvText?.trim()) {
    throw new Error("CV text cannot be empty");
  }

  if (!review) {
    throw new Error("CV review data is required");
  }

  // Generate structured CV data
  const cvData = generateStructuredCV(cvText, review);

  // Generate Word document
  const wordDoc = await generateWordDocument(cvData);

  return {
    originalCV: cvText,
    improvedCV: cvData.content,
    wordDocument: wordDoc,
  };
}

function generateImprovedCV(originalCV: string, review: CVReview): string {
  // Extract missing keywords and skills from the review
  const missingKeywords = review.atsOptimization?.missingKeywords || [];
  const missingSkills = review.skillGapAnalysis?.missingSkills || [];
  const formattingTips = review.atsOptimization?.formattingTips || [];

  // Start with professional summary
  let improvedCV = "";

  // Add professional summary if available from dynamic content
  if (review.dynamicContent?.professionalSummary) {
    improvedCV += "PROFESSIONAL SUMMARY\n";
    improvedCV += review.dynamicContent.professionalSummary + "\n\n";
  }

  // Add optimized skills section
  improvedCV += "SKILLS & COMPETENCIES\n";

  // Try to extract existing skills section first
  const existingSkills = extractSection(originalCV, [
    "SKILLS",
    "COMPETENCIES",
    "TECHNICAL SKILLS",
  ]);
  const existingSkillsList = existingSkills
    ? existingSkills
        .split(/[,\n•]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // Combine with missing skills and keywords
  const allSkills = new Set([
    ...existingSkillsList,
    ...missingKeywords,
    ...missingSkills,
  ]);

  // Filter out common words and format skills
  const filteredSkills = Array.from(allSkills)
    .filter(
      (skill) =>
        skill.length > 2 && // Skip short words
        !/^(and|the|or|in|on|at|to|for|of|with|by)$/i.test(skill) && // Skip common words
        !/^\d+$/.test(skill) // Skip numbers
    )
    .sort();

  // Group skills by category if possible
  const technicalSkills = filteredSkills.filter((skill) =>
    /^(java|python|react|node|sql|aws|azure|docker|kubernetes|git|html|css|javascript|typescript)/i.test(
      skill
    )
  );

  const softSkills = filteredSkills.filter((skill) =>
    /^(leadership|communication|teamwork|project management|problem solving|analytical|organization|time management)/i.test(
      skill
    )
  );

  const otherSkills = filteredSkills.filter(
    (skill) => !technicalSkills.includes(skill) && !softSkills.includes(skill)
  );

  if (technicalSkills.length) {
    improvedCV += "Technical Skills: " + technicalSkills.join(", ") + "\n";
  }
  if (softSkills.length) {
    improvedCV += "Soft Skills: " + softSkills.join(", ") + "\n";
  }
  if (otherSkills.length) {
    improvedCV += "Additional Skills: " + otherSkills.join(", ") + "\n";
  }

  improvedCV += "\n";

  // Extract work experience section
  improvedCV += "PROFESSIONAL EXPERIENCE\n";
  const experienceContent = extractSection(originalCV, [
    "EXPERIENCE",
    "WORK EXPERIENCE",
    "PROFESSIONAL EXPERIENCE",
  ]);
  if (experienceContent) {
    improvedCV += enhanceSection(experienceContent, missingKeywords) + "\n\n";
  } else if (review.dynamicContent?.tailoredExperience?.length) {
    improvedCV += review.dynamicContent.tailoredExperience.join("\n") + "\n\n";
  }

  // Extract education section
  improvedCV += "EDUCATION\n";
  const educationContent = extractSection(originalCV, [
    "EDUCATION",
    "ACADEMIC BACKGROUND",
  ]);
  if (educationContent) {
    improvedCV += educationContent + "\n\n";
  }

  // Add achievements if available
  if (review.dynamicContent?.keyAchievements?.length) {
    improvedCV += "KEY ACHIEVEMENTS\n";
    review.dynamicContent.keyAchievements.forEach((achievement) => {
      improvedCV += "• " + achievement + "\n";
    });
    improvedCV += "\n";
  }

  return improvedCV.trim();
}

function enhanceSection(content: string, keywords: string[]): string {
  // Remove any extra whitespace
  let enhanced = content.trim();

  // Add bullet points if missing
  if (!enhanced.includes("•")) {
    enhanced = enhanced
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)
      .map((line) => "• " + line)
      .join("\n");
  }

  // Try to incorporate missing keywords naturally
  keywords.forEach((keyword) => {
    const keywordRegex = new RegExp(keyword, "i");
    if (!keywordRegex.test(enhanced)) {
      // Look for sentences that could be enhanced with this keyword
      const sentences = enhanced.split(/[.!?]\s+/);
      for (let i = 0; i < sentences.length; i++) {
        if (sentences[i].toLowerCase().includes(keyword.toLowerCase())) {
          continue;
        }
        // Try to add keyword in a natural way
        if (
          sentences[i].includes("developed") ||
          sentences[i].includes("managed") ||
          sentences[i].includes("created")
        ) {
          sentences[i] = sentences[i].replace(
            /(developed|managed|created)/i,
            `$1 ${keyword}-based`
          );
          break;
        }
      }
      enhanced = sentences.join(". ");
    }
  });

  return enhanced;
}

function extractSection(
  content: string,
  sectionNames: string[]
): string | null {
  if (!content) return null;

  // Create a regex pattern for all possible section names
  const sectionPattern = sectionNames
    .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  // Find the start of our target section
  const sectionMatch = new RegExp(
    `(${sectionPattern})[:\\s]*(.*?)(?=\\s*(EDUCATION|EXPERIENCE|SKILLS|CERTIFICATIONS|LANGUAGES|REFERENCES|$))`,
    "si"
  ).exec(content);

  if (sectionMatch) {
    return sectionMatch[2].trim();
  }

  return null;
}

function generateStructuredCV(cvText: string, review: CVReview): StructuredCV {
  if (!cvText) {
    throw new Error("CV text is required");
  }

  // Normalize line endings and clean up text
  const normalizedText = cvText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Extract personal info using regex with safer patterns
  const emailMatch = normalizedText.match(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/
  );
  const phoneMatch = normalizedText.match(
    /(?:\+?\d{1,3}[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}/
  );
  const nameMatch = normalizedText.match(
    /^[\s\n]*([A-Z][a-z]+(?:[\s-][A-Z][a-z]+)+)/m
  );

  // Start with empty CV structure
  const structuredCV: StructuredCV = {
    content: "",
    personalInfo: {
      name: nameMatch?.[1] || "",
      email: emailMatch?.[0] || "",
      phone: phoneMatch?.[0] || "",
      location: "", // Will try to extract later
    },
    professionalSummary: review.dynamicContent?.professionalSummary || "",
    skills: {
      technical: [],
      soft: [],
      other: [],
    },
    experience: [],
    education: [],
    achievements: (() => {
      // Extract achievements from CV
      const achievementsSection = extractSection(normalizedText, [
        "ACHIEVEMENTS",
        "KEY ACHIEVEMENTS",
        "ACCOMPLISHMENTS",
        "AWARDS",
        "HONORS",
        "RECOGNITION",
      ]);

      // Collect achievements from CV content
      const achievementsFromCV = achievementsSection
        ? achievementsSection
            .split(/\n/)
            .map((l) => l.trim())
            .filter((l) => l.length > 0)
            .map((l) => l.replace(/^[•\-\*]\s*|\d+\.\s*/, "").trim()) // Remove bullet points
            .filter(
              (l) =>
                l.length >= 10 && // Skip short lines
                !/^(?:ACHIEVEMENTS?|KEY ACHIEVEMENTS?|ACCOMPLISHMENTS?|AWARDS?|HONORS?|RECOGNITION)$/i.test(
                  l
                ) // Skip section headers
            )
        : [];

      // Combine achievements from CV and review
      const allAchievements = [
        ...achievementsFromCV,
        ...(review.dynamicContent?.keyAchievements || []),
      ];

      // Deduplicate and sort by significance (longer achievements first)
      return Array.from(new Set(allAchievements)).sort(
        (a, b) => b.length - a.length
      );
    })(),
  };

  // Extract location using common patterns
  const locationPattern =
    /(?:Location|Address|Based in):?\s*([^,\n]*(?:,[^,\n]*){0,2})/i;
  const locationMatch = normalizedText.match(locationPattern);
  if (locationMatch) {
    structuredCV.personalInfo.location = locationMatch[1].trim();
  }

  // Extract and categorize skills from CV
  const technicalSkillsSection = extractSection(cvText, [
    "TECHNICAL SKILLS",
    "PROGRAMMING SKILLS",
    "TECHNOLOGIES",
  ]);

  const softSkillsSection = extractSection(cvText, [
    "SOFT SKILLS",
    "INTERPERSONAL SKILLS",
    "PERSONAL SKILLS",
  ]);

  const otherSkillsSection = extractSection(cvText, [
    "OTHER SKILLS",
    "ADDITIONAL SKILLS",
    "CERTIFICATIONS",
    "LANGUAGES",
  ]);

  // General skills section as fallback
  const generalSkillsSection = extractSection(cvText, [
    "SKILLS",
    "COMPETENCIES",
    "QUALIFICATIONS",
  ]);

  // Comprehensive patterns for different skill types
  const technicalPattern =
    /(?:programming|software|development|engineering|database|cloud|devops|frontend|backend|fullstack|data|security|web|mobile|testing|automation)/i;
  const softSkillPattern =
    /(?:leadership|communication|teamwork|management|problem[- ]solving|analytical|organization|time[- ]management|interpersonal|collaboration|adaptability|creativity|critical[- ]thinking)/i;

  // Helper function to clean and deduplicate skills
  const cleanSkills = (skills: string[]) => {
    return Array.from(
      new Set(
        skills
          .map((s) => s.trim())
          .filter(
            (s) =>
              s.length > 2 && // Skip very short skills
              !/^(and|the|or|in|on|at|to|for|of|with|by)$/i.test(s) && // Skip common words
              !/^\d+$/.test(s) && // Skip numbers
              !s.startsWith("[") // Skip template placeholders
          )
      )
    );
  };

  // Extract skills from each section
  const extractSkillsFromSection = (section: string | null) => {
    if (!section) return [];
    return section
      .split(/[,\n•]/)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const allSkills = [
    ...extractSkillsFromSection(technicalSkillsSection),
    ...extractSkillsFromSection(softSkillsSection),
    ...extractSkillsFromSection(otherSkillsSection),
    ...extractSkillsFromSection(generalSkillsSection),
    ...(review.atsOptimization?.missingKeywords || []),
    ...(review.skillGapAnalysis?.missingSkills || []),
  ];

  const cleanedSkills = cleanSkills(allSkills);

  // Sort skills into categories
  cleanedSkills.forEach((skill) => {
    // If the skill is already in the section it belongs to, skip it
    const normalizedSkill = skill.toLowerCase();

    if (
      structuredCV.skills.technical.some(
        (s) => s.toLowerCase() === normalizedSkill
      ) ||
      structuredCV.skills.soft.some(
        (s) => s.toLowerCase() === normalizedSkill
      ) ||
      structuredCV.skills.other.some((s) => s.toLowerCase() === normalizedSkill)
    ) {
      return;
    }

    // Check explicit sections first
    if (
      technicalSkillsSection &&
      technicalSkillsSection.toLowerCase().includes(normalizedSkill)
    ) {
      structuredCV.skills.technical.push(skill);
    } else if (
      softSkillsSection &&
      softSkillsSection.toLowerCase().includes(normalizedSkill)
    ) {
      structuredCV.skills.soft.push(skill);
    } else if (
      otherSkillsSection &&
      otherSkillsSection.toLowerCase().includes(normalizedSkill)
    ) {
      structuredCV.skills.other.push(skill);
    }
    // Then try pattern matching
    else if (technicalPattern.test(skill)) {
      structuredCV.skills.technical.push(skill);
    } else if (softSkillPattern.test(skill)) {
      structuredCV.skills.soft.push(skill);
    }
    // Check for common programming languages and tools
    else if (
      /^(?:java|python|c\+\+|javascript|typescript|ruby|php|swift|kotlin|go|rust|sql|html|css|react|angular|vue|node|express|django|spring|docker|kubernetes|git|aws|azure|gcp)(?:\s|$)/i.test(
        skill
      )
    ) {
      structuredCV.skills.technical.push(skill);
    }
    // Default to other skills
    else {
      structuredCV.skills.other.push(skill);
    }
  });

  // Sort skills alphabetically within each category
  structuredCV.skills.technical.sort();
  structuredCV.skills.soft.sort();
  structuredCV.skills.other.sort();

  // Remove duplicates (case-insensitive)
  const removeDuplicates = (arr: string[]) => {
    const seen = new Set();
    return arr.filter((item) => {
      const normalized = item.toLowerCase();
      if (seen.has(normalized)) {
        return false;
      }
      seen.add(normalized);
      return true;
    });
  };

  structuredCV.skills.technical = removeDuplicates(
    structuredCV.skills.technical
  );
  structuredCV.skills.soft = removeDuplicates(structuredCV.skills.soft);
  structuredCV.skills.other = removeDuplicates(structuredCV.skills.other);

  // Extract experience with better pattern matching
  const expContent = extractSection(normalizedText, [
    "EXPERIENCE",
    "WORK EXPERIENCE",
    "PROFESSIONAL EXPERIENCE",
    "EMPLOYMENT",
  ]);

  if (expContent) {
    // Split by common date patterns or company patterns
    const expEntries = expContent.split(
      /\n(?=(?:\d{2}\/\d{2}|\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}|[A-Z][a-zA-Z\s&,.]+ (?:Inc\.|LLC|Ltd\.|Corporation|Corp\.|Company|Co\.|LLP)))/i
    );

    expEntries.forEach((entry) => {
      const lines = entry
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length >= 2) {
        // Extract date using more comprehensive patterns
        const datePattern =
          /(?:\d{2}\/\d{2}|\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4})[^,\n]*(?:\s*(?:-|to|–)\s*(?:Present|\d{2}\/\d{2}|\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4})?)?/i;
        const dateMatch = entry.match(datePattern);

        // Try to identify title and company
        // Look for title in the first line that's not a date
        const titlePattern =
          /([A-Z][A-Za-z\s&,.-]+?)(?=\s*(?:at|@|-|,|\d|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Inc\.|LLC|Ltd\.|Corporation|Corp\.|Company|Co\.|LLP))/i;
        const titleMatch = lines
          .find((l) => !datePattern.test(l))
          ?.match(titlePattern);

        // Look for company name after "at" or in business suffixes
        const companyPattern =
          /(?:(?:at|@)\s+|^)([A-Za-z0-9\s&,.-]+?(?:Inc\.|LLC|Ltd\.|Corporation|Corp\.|Company|Co\.|LLP)?)\s*(?=\d|$)/i;
        const companyMatch = lines
          .find((l) => !datePattern.test(l) && l !== titleMatch?.[0])
          ?.match(companyPattern);

        // Extract bullet points more comprehensively
        const points = lines
          .filter(
            (l) =>
              !datePattern.test(l) &&
              l !== titleMatch?.[0] &&
              l !== companyMatch?.[0] &&
              l.length > 10
          )
          .map((l) => l.replace(/^[•\-\*]\s*|\d+\.\s*/, "").trim()) // Remove bullet points or numbers
          .filter((l) => l.length > 0);

        // Clean up empty brackets that might have been in the template
        const cleanPoints = points.filter(
          (p) => !p.startsWith("[") || !p.endsWith("]")
        );

        if (titleMatch?.[1] || companyMatch?.[1]) {
          structuredCV.experience.push({
            title: titleMatch?.[1]?.trim() || "",
            company: companyMatch?.[1]?.trim() || "",
            date: dateMatch?.[0]?.trim() || "",
            points: cleanPoints.length > 0 ? cleanPoints : [],
          });
        }
      }
    });
  }

  // Extract education with better pattern matching
  const eduContent = extractSection(normalizedText, [
    "EDUCATION",
    "ACADEMIC BACKGROUND",
    "ACADEMIC QUALIFICATIONS",
  ]);

  if (eduContent) {
    // More comprehensive degree pattern
    const degreePattern =
      /(?:Bachelor|Master|PhD|BSc|MSc|MBA|MD|BA|BS|MS|B\.A\.|B\.S\.|M\.A\.|M\.S\.|M\.B\.A\.|Ph\.D\.|B\. A\.|B\. S\.|M\. A\.|M\. S\.|M\. B\. A\.|Ph\. D\.)[^,\n]*/i;

    // Split on either degree patterns or dates
    const educations = eduContent.split(
      /\n(?=(?:\d{4}|${degreePattern.source}))/i
    );

    educations.forEach((edu) => {
      const lines = edu
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length >= 2) {
        // Extract degree more comprehensively
        const degreeMatch = lines.find((l) => degreePattern.test(l));

        // Look for school name patterns (common university/college words)
        const schoolPattern =
          /(?:University|College|Institute|School) of [A-Z][A-Za-z\s&,.-]+|[A-Z][A-Za-z\s&,.-]+ (?:University|College|Institute|School)/i;
        const schoolMatch = lines.find(
          (l) => schoolPattern.test(l) && l !== degreeMatch
        );

        // Extract date with more formats
        const datePattern =
          /(?:\d{2}\/\d{2}|\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4})[^,\n]*(?:\s*(?:-|to|–)\s*(?:Present|\d{2}\/\d{2}|\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4})?)?/i;
        const dateMatch = lines.find((l) => datePattern.test(l));

        // Extract common education details
        const gpaPattern = /GPA:?\s*\d+\.\d+|\d+\.\d+\s*GPA/i;
        const gpaMatch = lines.find((l) => gpaPattern.test(l));

        const courseworkPattern =
          /(?:Course(?:s|work)|Major):\s*([^,\n]+(?:,\s*[^,\n]+)*)/i;
        const courseworkMatch = lines.find((l) => courseworkPattern.test(l));

        const honorsPattern =
          /(?:Honor(?:s|\'s)|Award(?:s|ed)|Achievement(?:s)|Dean\'s List|Cum Laude|Magna Cum Laude|Summa Cum Laude)/i;
        const honorsMatch = lines.find((l) => honorsPattern.test(l));

        // Combine details, but only if they exist
        const details = [gpaMatch, courseworkMatch, honorsMatch]
          .filter((line): line is string => typeof line === "string")
          .map((line) => line.trim());

        if (degreeMatch || schoolMatch) {
          structuredCV.education.push({
            degree: degreeMatch?.trim() || "",
            school: schoolMatch?.trim() || "",
            date: dateMatch?.trim() || "",
            details: details.length > 0 ? details.join(" | ") : undefined,
          });
        }
      }
    });
  }

  // Generate formatted content
  structuredCV.content = generateFormattedContent(structuredCV);

  return structuredCV;
}

function generateFormattedContent(cv: StructuredCV): string {
  const sections: string[] = [];

  // Personal Information
  sections.push(`${cv.personalInfo.name}`);
  if (cv.personalInfo.email) sections.push(`Email: ${cv.personalInfo.email}`);
  if (cv.personalInfo.phone) sections.push(`Phone: ${cv.personalInfo.phone}`);
  if (cv.personalInfo.location)
    sections.push(`Location: ${cv.personalInfo.location}`);
  sections.push("");

  // Professional Summary
  if (cv.professionalSummary) {
    sections.push("PROFESSIONAL SUMMARY");
    sections.push(cv.professionalSummary);
    sections.push("");
  }

  // Skills
  sections.push("SKILLS & COMPETENCIES");
  if (cv.skills.technical.length) {
    sections.push(`Technical Skills: ${cv.skills.technical.join(", ")}`);
  }
  if (cv.skills.soft.length) {
    sections.push(`Soft Skills: ${cv.skills.soft.join(", ")}`);
  }
  if (cv.skills.other.length) {
    sections.push(`Additional Skills: ${cv.skills.other.join(", ")}`);
  }
  sections.push("");

  // Professional Experience
  if (cv.experience.length) {
    sections.push("PROFESSIONAL EXPERIENCE");
    cv.experience.forEach((exp) => {
      sections.push(exp.title);
      sections.push(exp.company);
      if (exp.date) sections.push(exp.date);
      exp.points.forEach((point) => sections.push(`• ${point}`));
      sections.push("");
    });
  }

  // Education
  if (cv.education.length) {
    sections.push("EDUCATION");
    cv.education.forEach((edu) => {
      sections.push(edu.degree);
      sections.push(edu.school);
      if (edu.date) sections.push(edu.date);
      if (edu.details) sections.push(edu.details);
      sections.push("");
    });
  }

  // Achievements
  if (cv.achievements.length) {
    sections.push("KEY ACHIEVEMENTS");
    cv.achievements.forEach((achievement) => {
      sections.push(`• ${achievement}`);
    });
    sections.push("");
  }

  return sections.join("\n").trim();
}
