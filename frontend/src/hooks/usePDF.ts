import { useState, useRef } from 'react';
import { PDFPage } from '../types';

// For pdfjs-dist 3.x with Vite, we'll use CDN script tag approach
// The ES module imports don't work well with Vite's bundling
let getDocument: any;
let GlobalWorkerOptions: any;

// Load PDF.js from CDN - pdfjs-dist 3.x has ES module issues with Vite
// Using CDN script tag is the most reliable approach
const PDFJS_VERSION = '3.11.174';
// Use .js extension for CDN worker (not .mjs)
const WORKER_SRC = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

const loadPdfJs = async (): Promise<{ getDocument: any; GlobalWorkerOptions: any }> => {
  if (getDocument && GlobalWorkerOptions) {
    return { getDocument, GlobalWorkerOptions };
  }
  
  return new Promise((resolve, reject) => {
    // Check if PDF.js is already loaded
    if ((window as any).pdfjsLib) {
      const pdfjs = (window as any).pdfjsLib;
      getDocument = pdfjs.getDocument;
      GlobalWorkerOptions = pdfjs.GlobalWorkerOptions;
      if (GlobalWorkerOptions) {
        GlobalWorkerOptions.workerSrc = WORKER_SRC;
      }
      console.log('PDF.js already loaded');
      resolve({ getDocument, GlobalWorkerOptions });
      return;
    }
    
    // Load PDF.js from CDN
    const script = document.createElement('script');
    script.src = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
    script.async = true;
    
    script.onload = () => {
      // PDF.js 3.x exposes itself as pdfjsLib on window
      const pdfjs = (window as any).pdfjsLib;
      
      if (pdfjs && pdfjs.getDocument) {
        getDocument = pdfjs.getDocument;
        GlobalWorkerOptions = pdfjs.GlobalWorkerOptions;
        
        // Configure worker
        if (GlobalWorkerOptions) {
          GlobalWorkerOptions.workerSrc = WORKER_SRC;
        }
        
        console.log('✅ PDF.js loaded from CDN');
        resolve({ getDocument, GlobalWorkerOptions });
      } else {
        // Try alternative global names
        const altPdfjs = (window as any).pdfjs || (window as any).PDFJS;
        if (altPdfjs && altPdfjs.getDocument) {
          getDocument = altPdfjs.getDocument;
          GlobalWorkerOptions = altPdfjs.GlobalWorkerOptions;
          if (GlobalWorkerOptions) {
            GlobalWorkerOptions.workerSrc = WORKER_SRC;
          }
          console.log('✅ PDF.js loaded from CDN (alternative)');
          resolve({ getDocument, GlobalWorkerOptions });
        } else {
          console.error('PDF.js loaded but functions not found. Available:', Object.keys(window).filter(k => k.toLowerCase().includes('pdf')));
          reject(new Error('PDF.js getDocument function not found'));
        }
      }
    };
    
    script.onerror = (error) => {
      console.error('Failed to load PDF.js script:', error);
      reject(new Error('Failed to load PDF.js from CDN'));
    };
    
    document.head.appendChild(script);
  });
};

// Initialize PDF.js on module load (will load from CDN)
if (typeof window !== 'undefined') {
  loadPdfJs().catch((error) => {
    console.error('Failed to initialize PDF.js:', error);
  });
}

export function usePDF() {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pages, setPages] = useState<PDFPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());

  const loadPDF = async (file: File) => {
    setLoading(true);
    setError(null);
    canvasRefs.current.clear();

    try {
      // Ensure PDF.js is loaded
      const { getDocument: getDoc } = await loadPdfJs();
      
      if (!getDoc) {
        throw new Error('getDocument is not available. PDF.js may not be loaded correctly. Please check the console for errors.');
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = getDoc({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);

      // Render all pages
      const pagePromises: Promise<PDFPage>[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        pagePromises.push(renderPage(pdf, i));
      }

      const renderedPages = await Promise.all(pagePromises);
      setPages(renderedPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load PDF');
      setPdfDoc(null);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const renderPage = async (
    pdf: any,
    pageNum: number
  ): Promise<PDFPage> => {
    const page = await pdf.getPage(pageNum);
    
    // Get viewport at scale 1.5 for rendering
    const viewport = page.getViewport({ scale: 1.5 });
    
    // Get viewport at scale 1.0 to get actual PDF dimensions in points
    const viewport1x = page.getViewport({ scale: 1.0 });
    const pdfWidth = viewport1x.width;
    const pdfHeight = viewport1x.height;

    // Create canvas
    const canvas = document.createElement('canvas');
    canvasRefs.current.set(pageNum - 1, canvas); // Store as 0-indexed

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get canvas context');
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    return {
      pageNumber: pageNum - 1, // 0-indexed
      canvas,
      width: viewport.width, // Canvas width in pixels (scaled)
      height: viewport.height, // Canvas height in pixels (scaled)
      pdfWidth: pdfWidth, // Actual PDF width in points
      pdfHeight: pdfHeight, // Actual PDF height in points
    };
  };

  const getCanvasRef = (pageNumber: number) => {
    return (element: HTMLCanvasElement | null) => {
      if (element) {
        canvasRefs.current.set(pageNumber, element);
      }
    };
  };

  return {
    pdfDoc,
    pages,
    loading,
    error,
    loadPDF,
    getCanvasRef,
  };
}

