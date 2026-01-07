import { promises as fs } from 'fs';
import { PDFField, PDFData } from '../types';

/**
 * Validates that the template PDF file exists
 */
export async function validateTemplatePath(templatePath: string): Promise<void> {
  try {
    await fs.access(templatePath);
  } catch (error) {
    throw new Error(`Template PDF not found: ${templatePath}`);
  }
}

/**
 * Validates that all required field values are provided
 */
export function validateFieldValues(fields: PDFField[], data: PDFData): void {
  const missingFields: string[] = [];

  for (const field of fields) {
    if (!(field.key in data) || data[field.key] === null || data[field.key] === undefined) {
      missingFields.push(field.key);
    }
  }

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required field values: ${missingFields.join(', ')}`
    );
  }
}

/**
 * Validates field coordinates and page numbers
 */
export function validateFieldCoordinates(fields: PDFField[]): void {
  for (const field of fields) {
    if (typeof field.x !== 'number' || field.x < 0) {
      throw new Error(`Invalid x coordinate for field '${field.key}': ${field.x}`);
    }

    if (typeof field.y !== 'number' || field.y < 0) {
      throw new Error(`Invalid y coordinate for field '${field.key}': ${field.y}`);
    }

    if (field.page !== undefined && (typeof field.page !== 'number' || field.page < 1)) {
      throw new Error(`Invalid page number for field '${field.key}': ${field.page}`);
    }

    if (field.fontSize !== undefined && (typeof field.fontSize !== 'number' || field.fontSize <= 0)) {
      throw new Error(`Invalid fontSize for field '${field.key}': ${field.fontSize}`);
    }
  }
}

/**
 * Validates all input parameters
 */
export async function validateInput(
  templatePath: string,
  fields: PDFField[],
  data: PDFData
): Promise<void> {
  await validateTemplatePath(templatePath);
  validateFieldCoordinates(fields);
  validateFieldValues(fields, data);
}

