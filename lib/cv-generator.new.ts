import type { CVReview } from "@/types/cv-review";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

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

export async function generateATSFriendlyCV(
  cvText: string,
  review: CVReview,
  jobRole: string
): Promise<ATSFriendlyCV> {
  // Generate structured CV data
  const cvData = generateStructuredCV(cvText, review);

  // Generate Word document using the template
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
  } else {
    // If no experience section found, use review's dynamic content if available
    if (review.dynamicContent?.tailoredExperience?.length) {
      improvedCV +=
        review.dynamicContent.tailoredExperience.join("\n") + "\n\n";
    }
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

  // Start building structured CV
  const structuredCV: StructuredCV = {
    content: "",
    personalInfo: {
      name: nameMatch?.[1] || "Your Name",
      email: emailMatch?.[0],
      phone: phoneMatch?.[0],
    },
    professionalSummary: review.dynamicContent?.professionalSummary || "",
    skills: {
      technical: [],
      soft: [],
      other: [],
    },
    experience: [],
    education: [],
    achievements: review.dynamicContent?.keyAchievements || [],
  };

  // Extract and categorize skills
  const existingSkills = extractSection(cvText, [
    "SKILLS",
    "COMPETENCIES",
    "TECHNICAL SKILLS",
  ]);
  const skillsList = [
    ...(existingSkills
      ?.split(/[,\n•]/)
      .map((s) => s.trim())
      .filter(Boolean) || []),
    ...(review.atsOptimization?.missingKeywords || []),
    ...(review.skillGapAnalysis?.missingSkills || []),
  ];

  // Categorize skills
  skillsList.forEach((skill) => {
    if (
      /^(java|python|react|node|sql|aws|azure|docker|kubernetes|git|html|css|javascript|typescript)/i.test(
        skill
      )
    ) {
      structuredCV.skills.technical.push(skill);
    } else if (
      /^(leadership|communication|teamwork|project management|problem solving|analytical|organization|time management)/i.test(
        skill
      )
    ) {
      structuredCV.skills.soft.push(skill);
    } else {
      structuredCV.skills.other.push(skill);
    }
  });

  // Extract experience with better pattern matching
  const expContent = extractSection(normalizedText, [
    "EXPERIENCE",
    "WORK EXPERIENCE",
    "PROFESSIONAL EXPERIENCE",
    "EMPLOYMENT",
  ]);

  if (expContent) {
    // Split by date patterns or all-caps lines
    const experiences = expContent.split(/\n(?=(?:\d{4}|[A-Z][A-Z\s]+[A-Z]))/);

    experiences.forEach((exp) => {
      const lines = exp
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length >= 2) {
        // Try to identify components
        const titleLine = lines[0];
        const companyLine = lines[1];
        const dateLine = lines.find((l) => /\d{4}/.test(l)) || "";

        // Get bullet points, handling different bullet styles
        const points = lines
          .slice(2)
          .filter((l) => /^[•\-\*]\s/.test(l) || /^\d+\.\s/.test(l))
          .map((l) =>
            l
              .replace(/^[•\-\*]\s*/, "")
              .replace(/^\d+\.\s*/, "")
              .trim()
          );

        // If no bullet points found, try to extract sentences as points
        if (points.length === 0) {
          const description = lines.slice(2).join(" ");
          const sentences = description.match(/[^.!?]+[.!?]+/g) || [];
          points.push(...sentences.map((s) => s.trim()));
        }

        structuredCV.experience.push({
          title: titleLine,
          company: companyLine,
          date: dateLine,
          points:
            points.length > 0 ? points : ["Position details not provided"],
        });
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
    // Split by date patterns or degree indicators
    const educations = eduContent.split(
      /\n(?=(?:\d{4}|(?:Bachelor|Master|PhD|BSc|MSc|MBA|MD|BA|BS|MS)))/i
    );

    educations.forEach((edu) => {
      const lines = edu
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length >= 2) {
        // Try to identify degree and school
        const degreeLine = lines[0];
        const schoolLine = lines[1];
        const dateLine = lines.find((l) => /\d{4}/.test(l)) || "";

        // Combine remaining lines as details
        const details = lines
          .slice(2)
          .filter((l) => !l.includes(dateLine))
          .join("\n");

        structuredCV.education.push({
          degree: degreeLine,
          school: schoolLine,
          date: dateLine,
          details: details || undefined,
        });
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

async function generateWordDocument(cv: StructuredCV): Promise<Blob> {
  try {
    // Load the template
    const response = await fetch("/cv-templates/ats-friendly-template.docx");
    if (!response.ok) {
      throw new Error("Failed to load CV template");
    }

    const templateContent = await response.arrayBuffer();
    const zip = new PizZip(templateContent);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Prepare data for template
    const templateData = {
      name: cv.personalInfo.name,
      email: cv.personalInfo.email || "",
      phone: cv.personalInfo.phone || "",
      location: cv.personalInfo.location || "",
      summary: cv.professionalSummary || "",
      technicalSkills: cv.skills.technical.join(", "),
      softSkills: cv.skills.soft.join(", "),
      otherSkills: cv.skills.other.join(", "),
      experience: cv.experience.map((exp) => ({
        title: exp.title,
        company: exp.company,
        date: exp.date,
        points: exp.points,
      })),
      education: cv.education.map((edu) => ({
        degree: edu.degree,
        school: edu.school,
        date: edu.date,
        details: edu.details || "",
      })),
      achievements: cv.achievements,
      generatedDate: new Date().toLocaleDateString(),
    };

    // Render the document
    doc.render(templateData);

    // Generate output
    return doc.getZip().generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
  } catch (error) {
    console.error("Error generating Word document:", error);
    throw new Error("Failed to generate Word document");
  }
}
