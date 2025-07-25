import jsPDF from "jspdf";
import type { CVReview } from "@/types/cv-review";

export function generatePDF(
  review: CVReview,
  fileName: string,
  jobRole: string
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPosition = margin;

  // Helper: Draw a horizontal line
  const drawLine = (y: number, color = "#e0e0e0") => {
    doc.setDrawColor(color);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
  };

  // Helper: Remove unsupported (non-ASCII) characters (including emojis)
  const sanitizeText = (text: string) => {
    // Remove all non-ASCII characters
    return text.replace(/[^\x00-\x7F]/g, "");
  };

  // Helper: Add section title (no emoji), with background highlight
  const addSectionTitle = (title: string, _icon: string, color: string) => {
    // Section background highlight
    doc.setFillColor(245, 245, 250);
    doc.roundedRect(
      margin - 2,
      yPosition - 5,
      pageWidth - 2 * (margin - 2),
      12,
      3,
      3,
      "F"
    );
    doc.setFontSize(14);
    doc.setTextColor(color);
    doc.setFont("helvetica", "bold");
    doc.text(sanitizeText(title), margin, yPosition + 4);
    yPosition += 13;
    doc.setTextColor(30, 30, 30);
  };

  // Helper: Add text with word wrapping
  // Helper: Add text with word wrapping and optional bullet
  const addText = (
    text: string,
    fontSize = 12,
    isBold = false,
    color: string | [number, number, number] = [30, 30, 30],
    bullet: boolean = false
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    if (typeof color === "string") {
      doc.setTextColor(color);
    } else {
      doc.setTextColor(...color);
    }
    const sanitized = sanitizeText(text);
    const lines = doc.splitTextToSize(
      sanitized,
      pageWidth - 2 * margin - (bullet ? 6 : 0)
    );
    // New page if needed
    if (yPosition + lines.length * 7 > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    if (bullet) {
      // Draw bullet point
      doc.circle(margin - 2, yPosition + 2, 1.2, "F");
      doc.text(lines, margin + 4, yPosition);
    } else {
      doc.text(lines, margin, yPosition);
    }
    yPosition += lines.length * 7 + 2;
    doc.setTextColor(30, 30, 30);
  };

  // Header Section - colored bar and title
  doc.setFillColor(99, 102, 241); // Indigo
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("CV Review Report", pageWidth / 2, 18, { align: "center" });
  yPosition = 34;
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  addText(`File: ${fileName}`);
  if (jobRole) {
    addText(`Target Role: ${jobRole}`);
  }
  addText(`Generated: ${new Date().toLocaleDateString()}`);
  addText(`Reviewed by: ${review.provider} AI`);
  yPosition += 2;
  drawLine(yPosition);
  yPosition += 6;

  // Overall Score Section
  addSectionTitle("Overall Score", "", "#f59e42");
  // Score box
  doc.setFillColor(234, 252, 237);
  doc.roundedRect(pageWidth / 2 - 25, yPosition, 50, 20, 5, 5, "F");
  doc.setFontSize(28);
  doc.setTextColor(34, 197, 94); // Green
  doc.setFont("helvetica", "bold");
  doc.text(`${review.score}/100`, pageWidth / 2, yPosition + 14, {
    align: "center",
  });
  yPosition += 28;
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "normal");

  // Strengths Section
  addSectionTitle("Strengths", "", "#22c55e");
  review.strengths.forEach((strength) => {
    addText(strength, 12, false, [30, 120, 30], true);
  });
  yPosition += 2;

  // Areas for Improvement Section
  addSectionTitle("Areas for Improvement", "", "#f59e42");
  review.weaknesses.forEach((weakness) => {
    addText(weakness, 12, false, [180, 90, 30], true);
  });
  yPosition += 2;

  // Structure & Format Feedback
  addSectionTitle("Structure & Format Feedback", "", "#6366f1");
  addText(review.structureFeedback, 12, false, [60, 60, 120]);
  yPosition += 2;

  // Grammar & Clarity Feedback
  addSectionTitle("Grammar & Clarity Feedback", "", "#6366f1");
  addText(review.grammarFeedback, 12, false, [60, 60, 120]);
  yPosition += 2;

  // ATS Compatibility Section
  addSectionTitle("ATS Compatibility", "", "#0ea5e9");
  doc.setFontSize(13);
  doc.setTextColor(14, 165, 233); // Blue
  doc.setFont("helvetica", "bold");
  doc.text(`ATS Score: ${review.atsScore}/100`, margin, yPosition);
  yPosition += 8;
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "normal");
  addText(review.atsFeedback, 12, false, [30, 90, 150]);
  yPosition += 2;

  // Suggestions Section
  addSectionTitle("Improvement Suggestions", "", "#fbbf24");
  review.suggestions.forEach((suggestion) => {
    const suggestionText = `From: "${suggestion.from}" To: "${suggestion.to}" ${suggestion.explanation ? `- ${suggestion.explanation}` : ''}`;
    addText(suggestionText, 12, false, [180, 140, 30], true);
  });

  // Footer
  yPosition = pageHeight - margin + 6;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.setFont("helvetica", "normal");
  doc.text(
    sanitizeText("Generated by CV Roaster - Your AI-Powered Career Assistant"),
    margin,
    yPosition
  );

  // Save the PDF
  doc.save(`CV-Review-${fileName.replace(/\.[^/.]+$/, "")}-${Date.now()}.pdf`);
}
