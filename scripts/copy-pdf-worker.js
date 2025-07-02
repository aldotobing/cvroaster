const fs = require('fs');
const path = require('path');

// Ensure public directory exists
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy PDF.js worker file
const workerSource = path.join(__dirname, '../node_modules/pdfjs-dist/build/pdf.worker.min.mjs');
const workerDest = path.join(publicDir, 'pdf.worker.min.js');

if (fs.existsSync(workerSource)) {
  fs.copyFileSync(workerSource, workerDest);
  console.log('PDF.js worker file copied successfully!');
} else {
  console.error('PDF.js worker file not found at:', workerSource);
}
