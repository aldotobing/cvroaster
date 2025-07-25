import mammoth from "mammoth";
import { createWorker } from 'tesseract.js';

// Import PDF.js with types
declare const pdfjsLib: any;

// Initialize PDF.js with worker
if (typeof window !== "undefined" && !window.pdfjsLib) {
  import("pdfjs-dist")
    .then((pdfjs) => {
      window.pdfjsLib = pdfjs;
      // Use local worker file
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
      console.log(`PDF.js ${pdfjs.version} loaded`);
    })
    .catch((error) => {
      console.error("Failed to load PDF.js:", error);
    });
}

export async function parseFile(file: File): Promise<string> {
  const fileType = file.type;

  if (fileType === "application/pdf") {
    return await parsePDF(file);
  } else if (
    fileType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return await parseDOCX(file);
  } else if (fileType.startsWith("image/")) {
    return await parseImage(file);
  } else {
    throw new Error("Unsupported file type. Please upload a PDF, DOCX, or image file.");
  }
}

async function parsePDF(file: File): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("PDF parsing is only available in the browser");
  }

  if (file.size === 0) {
    throw new Error("The PDF file is empty. Please upload a valid PDF file.");
  }

  try {
    // Use the globally available pdfjsLib or import it
    let pdfjs = window.pdfjsLib;

    if (!pdfjs) {
      console.log("PDF.js not loaded yet, importing dynamically...");
      pdfjs = await import("pdfjs-dist");
      window.pdfjsLib = pdfjs;
    }

    // Ensure worker is properly configured
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
      console.log(
        "PDF.js worker configured at:",
        pdfjs.GlobalWorkerOptions.workerSrc
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
      throw new Error(
        "The PDF file appears to be corrupted. Please try uploading it again."
      );
    }

    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    return cleanText(fullText);
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error(
      "Failed to parse PDF. Please make sure the file is not corrupted."
    );
  }
}

async function parseDOCX(file: File): Promise<string> {
  if (file.size === 0) {
    throw new Error("The DOCX file is empty. Please upload a valid DOCX file.");
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
      throw new Error(
        "The DOCX file appears to be corrupted. Please try uploading it again."
      );
    }

    const result = await mammoth.extractRawText({ arrayBuffer });
    return cleanText(result.value);
  } catch (error) {
    console.error("DOCX parsing error:", error);
    
    // Handle specific ZIP-related errors
    if (error instanceof Error && 
        (error.message.includes('zip') || 
         error.message.includes('end of central directory') ||
         error.message.includes('corrupt') ||
         error.message.toLowerCase().includes('invalid file'))) {
      throw new Error(
        "The file doesn't appear to be a valid DOCX file. " +
        "This can happen if the file is corrupted or was saved with an incorrect extension. " +
        "Please try these steps:\n\n" +
        "1. Open the file in Microsoft Word or a compatible word processor\n" +
        "2. Go to 'File' > 'Save As'\n" +
        "3. Choose 'Word Document (*.docx)' as the file type\n" +
        "4. Save the file and upload it again"
      );
    }
    
    // Generic error for other cases
    throw new Error(
      "We couldn't process your DOCX file. The file might be corrupted or in an unsupported format. " +
      "Please try converting it to PDF or contact support if the issue persists."
    );
  }
}

async function parseImage(file: File): Promise<string> {
  try {
    const worker = await createWorker();
    
    try {
      // Use the correct Tesseract.js API
      const { data: { text } } = await worker.recognize(file);
      return cleanText(text);
    } finally {
      await worker.terminate();
    }
  } catch (error) {
    console.error("Image OCR error:", error);
    throw new Error("Failed to process image. Please make sure the image is clear and readable.");
  }
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
