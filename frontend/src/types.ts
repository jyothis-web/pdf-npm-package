export interface PDFField {
  id: string;
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  fontSize?: number;
}

export interface PDFPage {
  pageNumber: number;
  canvas: HTMLCanvasElement;
  width: number; // Canvas width in pixels (scaled)
  height: number; // Canvas height in pixels (scaled)
  pdfWidth?: number; // Actual PDF width in points
  pdfHeight?: number; // Actual PDF height in points
}

export interface FieldData {
  [key: string]: string | number;
}

