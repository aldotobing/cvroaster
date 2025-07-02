import mammoth from "mammoth"

// Import PDF.js with types
declare const pdfjsLib: any;

// Initialize PDF.js with worker
if (typeof window !== 'undefined' && !window.pdfjsLib) {
  import('pdfjs-dist').then((pdfjs) => {
    window.pdfjsLib = pdfjs;
    // Use local worker file
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    console.log(`PDF.js ${pdfjs.version} loaded`);
  }).catch((error) => {
    console.error('Failed to load PDF.js:', error);
  });
}

export async function parseFile(file: File): Promise<string> {
  const fileType = file.type

  if (fileType === "application/pdf") {
    return await parsePDF(file)
  } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return await parseDOCX(file)
  } else {
    throw new Error("Unsupported file type. Please upload a PDF or DOCX file.")
  }
}

async function parsePDF(file: File): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('PDF parsing is only available in the browser');
  }

  try {
    // Use the globally available pdfjsLib or import it
    let pdfjs = window.pdfjsLib;
    
    if (!pdfjs) {
      console.log('PDF.js not loaded yet, importing dynamically...');
      pdfjs = await import('pdfjs-dist');
      window.pdfjsLib = pdfjs;
    }
    
    // Ensure worker is properly configured
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      console.log('PDF.js worker configured at:', pdfjs.GlobalWorkerOptions.workerSrc);
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return cleanText(fullText);
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to parse PDF. Please make sure the file is not corrupted.");
  }
}

async function parseDOCX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return cleanText(result.value)
  } catch (error) {
    console.error("DOCX parsing error:", error)
    throw new Error("Failed to parse DOCX. Please make sure the file is not corrupted.")
  }
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, "\n") // Remove empty lines
    .trim()
}
