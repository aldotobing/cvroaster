import * as pdfjs from 'pdfjs-dist';

declare global {
  interface Window {
    pdfjsLib: typeof pdfjs;
  }
}

export {};
