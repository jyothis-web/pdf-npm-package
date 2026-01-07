/**
 * Type definitions for the PDF template engine
 */

/**
 * Field definition for text placement on PDF
 */
export interface PDFField {
  /** Unique key to identify the field */
  key: string;
  /** X coordinate in points (1 point = 1/72 inch) */
  x: number;
  /** Y coordinate in points (1 point = 1/72 inch) */
  y: number;
  /** Font size in points (optional, defaults to 12) */
  fontSize?: number;
  /** Page number (1-indexed, optional, defaults to 1) */
  page?: number;
}

/**
 * Data object mapping field keys to their values
 */
export interface PDFData {
  [key: string]: string | number | null | undefined;
}

/**
 * Options for generating PDF
 */
export interface GeneratePDFOptions {
  /** Path to the template PDF file */
  templatePath: string;
  /** Path where the output PDF will be saved */
  outputPath: string;
  /** Array of field definitions */
  fields: PDFField[];
  /** Data object with key-value pairs for field values */
  data: PDFData;
}

