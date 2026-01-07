# Frontend Integration Guide

This guide shows how to integrate PDF rendering and field mapping in your frontend application.

## Overview

The `@your-scope/pdf-template-engine` package is **backend-only** (Node.js). For frontend, you need:

1. **PDF.js** - To render PDFs in the browser
2. **Your Backend API** - To generate PDFs using the npm package
3. **Field Mapping UI** - To visually place fields (optional)

## Step 1: Install PDF.js

### Option A: CDN (Recommended for Quick Start)

Add to your `index.html`:

<!-- PDF.js from CDN -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>### Option B: npm (For Bundlers)

npm install pdfjs-dist
## Step 2: Set Up PDF Rendering Hook

Create `hooks/usePDF.ts`:
script
import { useState, useRef } from 'react';

const PDFJS_VERSION = '3.11.174';
const WORKER_SRC = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

let getDocument: any;
let GlobalWorkerOptions: any;

const loadPdfJs = async () => {
  if (getDocument && GlobalWorkerOptions) {
    return { getDocument, GlobalWorkerOptions };
  }
  
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      const pdfjs = (window as any).pdfjsLib;
      getDocument = pdfjs.getDocument;
      GlobalWorkerOptions = pdfjs.GlobalWorkerOptions;
      GlobalWorkerOptions.workerSrc = WORKER_SRC;
      resolve({ getDocument, GlobalWorkerOptions });
      return;
    }
    
    const script = document.createElement('script');
    script.src = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
    script.async = true;
    
    script.onload = () => {
      const pdfjs = (window as any).pdfjsLib;
      getDocument = pdfjs.getDocument;
      GlobalWorkerOptions = pdfjs.GlobalWorkerOptions;
      GlobalWorkerOptions.workerSrc = WORKER_SRC;
      resolve({ getDocument, GlobalWorkerOptions });
    };
    
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export function usePDF() {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPDF = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const { getDocument: getDoc } = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = getDoc({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);

      // Render all pages
      const pagePromises = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        pagePromises.push({
          pageNumber: i - 1,
          canvas,
          width: viewport.width,
          height: viewport.height,
        });
      }

      setPages(pagePromises);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load PDF');
    } finally {
      setLoading(false);
    }
  };

  return { pdfDoc, pages, loading, error, loadPDF };
}## Step 3: Coordinate Conversion Utility

Create `utils/coordinateConverter.ts`:

/**
 * Converts frontend canvas coordinates to backend PDF coordinates
 * 
 * Frontend: Top-left origin, pixels (scaled by viewport)
 * Backend: Bottom-left origin, points (1/72 inch)
 */
export function convertToPDFCoordinates(
  canvasX: number,
  canvasY: number,
  canvasWidth: number,
  canvasHeight: number,
  pdfWidth: number,
  pdfHeight: number
) {
  // Calculate conversion factors
  const xConversionFactor = pdfWidth / canvasWidth;
  const yConversionFactor = pdfHeight / canvasHeight;
  
  // Convert X (direct conversion)
  const xPoints = canvasX * xConversionFactor;
  
  // Convert Y (top-left to bottom-left)
  // Backend expects Y from top, so we just convert pixels to points
  const yPoints = canvasY * yConversionFactor;
  
  return {
    x: Math.round(xPoints),
    y: Math.round(yPoints),
  };
}## Step 4: Backend API Integration

Create `services/pdfService.ts`:
ript
export async function generatePDF(
  pdfFile: File,
  fields: Array<{ key: string; x: number; y: number; fontSize?: number; page: number }>,
  data: Record<string, string>
) {
  const formData = new FormData();
  formData.append('pdf', pdfFile);
  formData.append('schema', JSON.stringify(fields));
  formData.append('data', JSON.stringify(data));

  const response = await fetch('http://your-backend.com/api/pdf', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to generate PDF');
  }

  return await response.blob();
}## Step 5: Complete Example Component
t
import { useState } from 'react';
import { usePDF } from './hooks/usePDF';
import { convertToPDFCoordinates } from './utils/coordinateConverter';
import { generatePDF } from './services/pdfService';

function PDFFormBuilder() {
  const { pages, loading, loadPDF } = usePDF();
  const [fields, setFields] = useState<any[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleFileUpload = (file: File) => {
    setPdfFile(file);
    loadPDF(file);
  };

  const handleAddField = (pageNumber: number, x: number, y: number) => {
    const page = pages[pageNumber];
    if (!page) return;

    // Convert canvas coordinates to PDF coordinates
    const pdfCoords = convertToPDFCoordinates(
      x, y,
      page.width, page.height,
      page.pdfWidth || page.width / 1.5, // Adjust based on your viewport scale
      page.pdfHeight || page.height / 1.5
    );

    const newField = {
      id: Date.now().toString(),
      key: `field${fields.length + 1}`,
      x: pdfCoords.x,
      y: pdfCoords.y,
      fontSize: 12,
      page: pageNumber + 1, // Convert to 1-indexed
    };

    setFields([...fields, newField]);
  };

  const handleGenerate = async () => {
    if (!pdfFile) return;

    const data = fields.reduce((acc, field) => {
      acc[field.key] = `Sample ${field.key}`;
      return acc;
    }, {} as Record<string, string>);

    const blob = await generatePDF(pdfFile, fields, data);
    
    // Download the PDF
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated.pdf';
    a.click();
  };

  return (
    <div>
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
      />
      
      {pages.map((page, idx) => (
        <div key={idx}>
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              handleAddField(idx, x, y);
            }}
          >
            {page.canvas && <img src={page.canvas.toDataURL()} alt={`Page ${idx + 1}`} />}
          </div>
        </div>
      ))}

      <button onClick={handleGenerate}>Generate PDF</button>
    </div>
  );
}
## Best Practices

1. **Use CDN for PDF.js** - More reliable than npm for browser environments
2. **Cache PDF.js** - Check if already loaded before loading again
3. **Handle Worker Errors** - Always set `GlobalWorkerOptions.workerSrc`
4. **Coordinate Conversion** - Always convert frontend coordinates to backend format
5. **Error Handling** - Wrap PDF operations in try-catch blocks