import { promises as fs } from 'fs';
import { PDFDocument } from 'pdf-lib';

/**
 * Loads a PDF file from the file system
 * @param templatePath Path to the PDF template file
 * @returns Promise resolving to a PDFDocument instance
 */
export async function loadPdf(templatePath: string): Promise<PDFDocument> {
  try {
    const pdfBytes = await fs.readFile(templatePath);
    return await PDFDocument.load(pdfBytes);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load PDF template: ${error.message}`);
    }
    throw new Error('Failed to load PDF template: Unknown error');
  }
}

