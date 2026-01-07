import { promises as fs } from 'fs';
import { PDFDocument } from 'pdf-lib';
import path from 'path';

/**
 * Saves the PDF document to the specified output path
 * @param pdfDoc The PDF document to save
 * @param outputPath Path where the PDF will be saved
 */
export async function savePdf(pdfDoc: PDFDocument, outputPath: string): Promise<void> {
  try {
    // Ensure the output directory exists
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();

    // Write to file system
    await fs.writeFile(outputPath, pdfBytes);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to save PDF: ${error.message}`);
    }
    throw new Error('Failed to save PDF: Unknown error');
  }
}

