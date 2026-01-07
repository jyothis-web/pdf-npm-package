import { useEffect, useRef } from 'react';
import { PDFPage } from '../types';
import { PDFField } from '../types';

interface PDFViewerProps {
  pages: PDFPage[];
  fields: PDFField[];
  selectedFieldId: string | null;
  onFieldSelect: (fieldId: string | null) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<PDFField>) => void;
  onFieldDelete: (fieldId: string) => void;
  onFieldAdd?: (pageNumber: number, x: number, y: number) => void;
  getCanvasRef: (pageNumber: number) => (element: HTMLCanvasElement | null) => void;
}

export function PDFViewer({
  pages,
  fields,
  selectedFieldId,
  onFieldSelect,
  onFieldUpdate,
  onFieldDelete,
  onFieldAdd,
  getCanvasRef,
}: PDFViewerProps) {
  const containerRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    // Attach canvas elements to DOM and ensure they're clickable
    pages.forEach((page) => {
      const container = containerRefs.current.get(page.pageNumber);
      if (container && page.canvas && !container.contains(page.canvas)) {
        // Ensure canvas is clickable
        page.canvas.style.pointerEvents = 'auto';
        page.canvas.style.cursor = 'crosshair';
        container.appendChild(page.canvas);
      }
    });
  }, [pages]);
  const handleFieldDragStart = (fieldId: string, e: React.MouseEvent, pageNumber: number) => {
    e.stopPropagation();
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;

    // Get the canvas container for this page to calculate relative coordinates
    const container = containerRefs.current.get(pageNumber);
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const startX = e.clientX - containerRect.left - field.x;
    const startY = e.clientY - containerRect.top - field.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const containerRect = container.getBoundingClientRect();
      const newX = moveEvent.clientX - containerRect.left - startX;
      const newY = moveEvent.clientY - containerRect.top - startY;
      onFieldUpdate(fieldId, { 
        x: Math.max(0, Math.min(newX, containerRect.width - field.width)),
        y: Math.max(0, Math.min(newY, containerRect.height - field.height))
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeStart = (fieldId: string, e: React.MouseEvent, corner: string, pageNumber: number) => {
    e.stopPropagation();
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;

    const container = containerRefs.current.get(pageNumber);
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const startX = e.clientX - containerRect.left;
    const startY = e.clientY - containerRect.top;
    const startWidth = field.width;
    const startHeight = field.height;
    const startFieldX = field.x;
    const startFieldY = field.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const containerRect = container.getBoundingClientRect();
      const currentX = moveEvent.clientX - containerRect.left;
      const currentY = moveEvent.clientY - containerRect.top;
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startFieldX;
      let newY = startFieldY;

      if (corner.includes('e')) {
        newWidth = Math.max(50, Math.min(startWidth + deltaX, containerRect.width - startFieldX));
      }
      if (corner.includes('w')) {
        newWidth = Math.max(50, startWidth - deltaX);
        newX = Math.max(0, startFieldX + deltaX);
      }
      if (corner.includes('s')) {
        newHeight = Math.max(20, Math.min(startHeight + deltaY, containerRect.height - startFieldY));
      }
      if (corner.includes('n')) {
        newHeight = Math.max(20, startHeight - deltaY);
        newY = Math.max(0, startFieldY + deltaY);
      }

      onFieldUpdate(fieldId, {
        width: newWidth,
        height: newHeight,
        x: newX,
        y: newY,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="pdf-viewer">
      {pages.map((page) => {
        const pageFields = fields.filter((f) => f.page === page.pageNumber);
        return (
          <div key={page.pageNumber} className="pdf-page-container">
            <div className="page-label">Page {page.pageNumber + 1}</div>
            <div
              ref={(el) => {
                if (el) {
                  containerRefs.current.set(page.pageNumber, el);
                  // Attach canvas if not already attached
                  if (page.canvas && !el.contains(page.canvas)) {
                    el.appendChild(page.canvas);
                  }
                }
              }}
              className="canvas-wrapper"
              style={{ position: 'relative', display: 'inline-block' }}
              onClick={(e) => {
                // Allow adding fields by clicking on canvas (if onFieldAdd is provided)
                // Check if click is on canvas or wrapper (not on a field)
                const target = e.target as HTMLElement;
                const isCanvas = target === page.canvas || target.tagName === 'CANVAS';
                const isWrapper = target === e.currentTarget;
                const isField = target.closest('.field-box') !== null;
                
                if (onFieldAdd && (isCanvas || isWrapper) && !isField) {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  console.log(`Adding field to page ${page.pageNumber} at (${x}, ${y})`);
                  onFieldAdd(page.pageNumber, x, y);
                }
              }}
            >
              {pageFields.map((field) => (
                <div
                  key={field.id}
                  className={`field-box ${selectedFieldId === field.id ? 'selected' : ''}`}
                  style={{
                    position: 'absolute',
                    left: `${field.x}px`,
                    top: `${field.y}px`,
                    width: `${field.width}px`,
                    height: `${field.height}px`,
                    border: '2px dashed #007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    cursor: 'move',
                    boxSizing: 'border-box',
                    pointerEvents: 'auto', // Ensure fields are clickable
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFieldSelect(field.id);
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleFieldDragStart(field.id, e, page.pageNumber);
                  }}
                >
                  <div className="field-label">{field.key || 'Unnamed'}</div>
                  {/* Resize handles */}
                  <div
                    className="resize-handle resize-nw"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleResizeStart(field.id, e, 'nw', page.pageNumber);
                    }}
                  />
                  <div
                    className="resize-handle resize-ne"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleResizeStart(field.id, e, 'ne', page.pageNumber);
                    }}
                  />
                  <div
                    className="resize-handle resize-sw"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleResizeStart(field.id, e, 'sw', page.pageNumber);
                    }}
                  />
                  <div
                    className="resize-handle resize-se"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleResizeStart(field.id, e, 'se', page.pageNumber);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

