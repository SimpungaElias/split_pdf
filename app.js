const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs').promises;

async function splitPDF(inputPDFPath, outputPath, pageRanges) {
  const pdfBytes = await fs.readFile(inputPDFPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  for (const [start, end] of pageRanges) {
    if (start < 1 || end > pdfDoc.getPageCount() || start > end) {
      console.error('Invalid page range:', start, '-', end);
      continue;
    }

    const newPdfDoc = await PDFDocument.create();
    for (let i = start; i <= end; i++) {
      const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i - 1]);
      newPdfDoc.addPage(copiedPage);
    }

    const newPdfBytes = await newPdfDoc.save();
    // const outputPath = `${outputDirectory}/output_${start}-${end}.pdf`;
    await fs.writeFile(outputPath, newPdfBytes);
    console.log(`Split pages ${start}-${end} to ${outputPath}`);
  }
}

// Retrieve command-line arguments
const args = process.argv.slice(2);

// Check if the correct number of arguments are provided
if (args.length < 3) {
  console.error('Usage: node app.js inputPDFPath outputDirectory pageRangeStart pageRangeEnd');
  process.exit(1);
}

const inputPDFPath = args[0];
const outputDirectory = args[1];
const pageRangeStart = parseInt(args[2]);
const pageRangeEnd = parseInt(args[3]);

const pageRanges = [[pageRangeStart, pageRangeEnd]];

splitPDF(inputPDFPath, outputDirectory, pageRanges);

// node app.js "/path/to/input.pdf" "output.pdf" 9 17
