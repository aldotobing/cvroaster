import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  IDocumentOptions,
} from "docx";
import { readCVTemplate, CVTemplate } from "./template-reader";

export interface CVData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  professionalSummary: string;
  skills: {
    technical: string[];
    soft: string[];
    other: string[];
  };
  experience: Array<{
    title: string;
    company: string;
    date: string;
    points: string[];
  }>;
  education: Array<{
    degree: string;
    school: string;
    date: string;
    details?: string;
  }>;
  achievements: string[];
}

export async function generateDocxFromCV(
  data: Partial<CVData> = {}
): Promise<Blob> {
  try {
    // Get template structure
    const template = await readCVTemplate();

    // Default empty data
    const defaultData: CVData = {
      personalInfo: {
        name: "[Your Full Name]",
        email: "[your.email@example.com]",
        phone: "[+1 (123) 456-7890]",
        location: "[City, State, Country]",
      },
      professionalSummary: "",
      skills: {
        technical: [],
        soft: [],
        other: [],
      },
      experience: [],
      education: [],
      achievements: [],
    };

    // Merge provided data with defaults
    const mergedData: CVData = {
      ...defaultData,
      ...data,
      personalInfo: {
        ...defaultData.personalInfo,
        ...data.personalInfo,
      },
      skills: {
        ...defaultData.skills,
        ...data.skills,
      },
    };

    // Create document with template styling
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1000,
                bottom: 1000,
                left: 1000,
                right: 1000,
              },
            },
          },
          children: [
            // Contact Information
            createContactSection(mergedData.personalInfo),

            // Professional Summary
            ...createSection(
              "PROFESSIONAL SUMMARY",
              mergedData.professionalSummary ||
                "[Write a brief summary of your professional background and key qualifications]"
            ),

            // Skills
            ...createSkillsSection(mergedData.skills),

            // Experience
            ...createExperienceSection(mergedData.experience),

            // Education
            ...createEducationSection(mergedData.education),

            // Achievements
            ...createSection(
              "ACHIEVEMENTS",
              mergedData.achievements?.length > 0
                ? mergedData.achievements.map((a) => `• ${a}`).join("\n")
                : "• [List your key professional achievements]\n• [Describe significant accomplishments and results]\n• [Include measurable impacts and outcomes]"
            ),
          ],
        },
      ],
    });

    // Convert to Blob
    return await Packer.toBlob(doc);
  } catch (error) {
    console.error("Error generating document:", error);
    throw error;
  }
}

function createContactSection(info: CVData["personalInfo"]): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: info?.name || "[Your Full Name]",
        bold: true,
        size: 32, // 16pt
      }),
      new TextRun({ text: "\n" }),
      new TextRun({ text: info?.location || "[Location]" }),
      new TextRun({ text: " | " }),
      new TextRun({ text: info?.phone || "[Phone]" }),
      new TextRun({ text: " | " }),
      new TextRun({ text: info?.email || "[Email]" }),
    ],
    spacing: { before: 200, after: 200 },
    alignment: AlignmentType.CENTER,
  });
}

function createSection(title: string, content: string): Paragraph[] {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 28, // 14pt
          color: "2F5496", // Dark blue
        }),
      ],
      spacing: { before: 400, after: 200 },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 10,
          color: "2F5496",
        },
      },
    }),
    new Paragraph({
      text: content,
      spacing: { before: 100, after: 100 },
    }),
  ];
}

function createSkillsSection(
  skills: CVData["skills"] = { technical: [], soft: [], other: [] }
): Paragraph[] {
  const sections = [
    new Paragraph({
      children: [
        new TextRun({
          text: "SKILLS",
          bold: true,
          size: 28,
          color: "2F5496",
        }),
      ],
      spacing: { before: 400, after: 200 },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 10,
          color: "2F5496",
        },
      },
    }),
  ];

  const technical = skills?.technical || [];
  const soft = skills?.soft || [];
  const other = skills?.other || [];

  // Always show categories, even if empty
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Technical: ", bold: true }),
        new TextRun({
          text:
            technical.length > 0
              ? technical.join(", ")
              : "[List your technical skills]",
        }),
      ],
      spacing: { before: 100, after: 100 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Soft Skills: ", bold: true }),
        new TextRun({
          text: soft.length > 0 ? soft.join(", ") : "[List your soft skills]",
        }),
      ],
      spacing: { before: 100, after: 100 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Other: ", bold: true }),
        new TextRun({
          text:
            other.length > 0
              ? other.join(", ")
              : "[List any other relevant skills]",
        }),
      ],
      spacing: { before: 100, after: 100 },
    })
  );

  return sections;
}

function createExperienceSection(
  experience: CVData["experience"] = []
): Paragraph[] {
  const sections = [
    new Paragraph({
      children: [
        new TextRun({
          text: "PROFESSIONAL EXPERIENCE",
          bold: true,
          size: 28,
          color: "2F5496",
        }),
      ],
      spacing: { before: 400, after: 200 },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 10,
          color: "2F5496",
        },
      },
    }),
  ];

  if (experience.length === 0) {
    // Add placeholder experience
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: "[Job Title]", bold: true }),
          new TextRun({ text: " at " }),
          new TextRun({ text: "[Company Name]", bold: true }),
        ],
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "[MM/YYYY - Present]",
            italics: true,
          }),
        ],
        spacing: { before: 0, after: 100 },
      }),
      new Paragraph({
        text: "• [Describe key responsibility or achievement]",
        bullet: { level: 0 },
        spacing: { before: 100, after: 100 },
        indent: { left: 720 },
      }),
      new Paragraph({
        text: "• [Highlight specific accomplishments with measurable results]",
        bullet: { level: 0 },
        spacing: { before: 100, after: 100 },
        indent: { left: 720 },
      })
    );
  } else {
    experience.forEach((job) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: job.title, bold: true }),
            new TextRun({ text: " at " }),
            new TextRun({ text: job.company, bold: true }),
          ],
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: job.date,
              italics: true,
            }),
          ],
          spacing: { before: 0, after: 100 },
        })
      );

      job.points.forEach((point) => {
        sections.push(
          new Paragraph({
            text: point,
            bullet: { level: 0 },
            spacing: { before: 100, after: 100 },
            indent: { left: 720 }, // 0.5 inch
          })
        );
      });
    });
  }

  return sections;
}

function createEducationSection(
  education: CVData["education"] = []
): Paragraph[] {
  const sections = [
    new Paragraph({
      children: [
        new TextRun({
          text: "EDUCATION",
          bold: true,
          size: 28,
          color: "2F5496",
        }),
      ],
      spacing: { before: 400, after: 200 },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 10,
          color: "2F5496",
        },
      },
    }),
  ];

  if (education.length === 0) {
    // Add placeholder education
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: "[Degree Name]", bold: true }),
          new TextRun({ text: ` - [University Name]` }),
        ],
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "[YYYY]",
            italics: true,
          }),
        ],
        spacing: { before: 0, after: 100 },
      }),
      new Paragraph({
        text: "[GPA: X.XX - Relevant Coursework: Course 1, Course 2]",
        spacing: { before: 0, after: 200 },
      })
    );
  } else {
    education.forEach((edu) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree, bold: true }),
            new TextRun({ text: ` - ${edu.school}` }),
          ],
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: edu.date,
              italics: true,
            }),
          ],
          spacing: { before: 0, after: edu.details ? 100 : 200 },
        })
      );

      if (edu.details) {
        sections.push(
          new Paragraph({
            text: edu.details,
            spacing: { before: 0, after: 200 },
          })
        );
      }
    });
  }

  return sections;
}
