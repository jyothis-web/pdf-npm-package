import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import { PDFField, PDFData } from '../types';

/**
 * Draws text fields on the PDF document
 * @param pdfDoc The PDF document to modify
 * @param fields Array of field definitions
 * @param data Data object with field values
 */
export function drawText(
  pdfDoc: PDFDocument,
  fields: PDFField[],
  data: PDFData
): void {
  const pages = pdfDoc.getPages();

  for (const field of fields) {
    // Get the page (default to first page if not specified)
    const pageIndex = (field.page ?? 1) - 1;

    if (pageIndex < 0 || pageIndex >= pages.length) {
      throw new Error(
        `Page ${field.page ?? 1} does not exist in the PDF for field '${field.key}'`
      );
    }

    const page = pages[pageIndex];
    const value = data[field.key];

    // Convert value to string (handle null/undefined as empty string)
    const text = value !== null && value !== undefined ? String(value) : '';

    // Get font size (default to 12 if not specified)
    const fontSize = field.fontSize ?? 12;

    // Draw the text on the page
    // Note: PDF coordinates start from bottom-left, so we need to account for page height
    const { height } = page.getSize();
    const yPosition = height - field.y;

    page.drawText(text, {
      x: field.x,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0), // Black text
    });
  }
}

