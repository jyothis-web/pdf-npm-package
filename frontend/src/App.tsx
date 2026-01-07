import { useState, useCallback } from 'react';
import { PDFUploader } from './components/PDFUploader';
import { PDFViewer } from './components/PDFViewer';
import { FieldMapper } from './components/FieldMapper';
import { Toolbar } from './components/Toolbar';
import { usePDF } from './hooks/usePDF';
import { PDFField, FieldData } from './types';
import './App.css';

function App() {
  const { pages, loading, error, loadPDF, getCanvasRef } = usePDF();
  const [fields, setFields] = useState<PDFField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [fieldData, setFieldData] = useState<FieldData>({});
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    setPdfFile(file);
    setFields([]);
    setSelectedFieldId(null);
    setFieldData({});
    loadPDF(file);
  }, [loadPDF]);

  const handleFieldAdd = useCallback((pageNumber?: number, x?: number, y?: number) => {
    const targetPage = pageNumber !== undefined ? pageNumber : currentPage;
    console.log('handleFieldAdd called:', { pageNumber, x, y, targetPage, currentPage });
    const newField: PDFField = {
      id: `field-${Date.now()}`,
      key: `field${fields.length + 1}`,
      x: x !== undefined ? x : 50,
      y: y !== undefined ? y : 50,
      width: 200,
      height: 30,
      page: targetPage,
      fontSize: 12,
    };
    console.log('Creating new field:', newField);
    setFields((prev) => {
      const updated = [...prev, newField];
      console.log('Fields updated, total:', updated.length, 'on page', targetPage, ':', updated.filter(f => f.page === targetPage).length);
      return updated;
    });
    setSelectedFieldId(newField.id);
    // Switch to the page where field was added
    if (pageNumber !== undefined) {
      setCurrentPage(pageNumber);
    }
  }, [fields.length, currentPage]);

  const handleFieldUpdate = useCallback((fieldId: string, updates: Partial<PDFField>) => {
    setFields((prev) =>
      prev.map((field) => (field.id === fieldId ? { ...field, ...updates } : field))
    );
  }, []);

  const handleFieldDelete = useCallback((fieldId: string) => {
    const fieldToDelete = fields.find((f) => f.id === fieldId);
    setFields((prev) => prev.filter((field) => field.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
    if (fieldToDelete) {
      setFieldData((prev) => {
        const { [fieldToDelete.key]: _, ...rest } = prev;
        return rest;
      });
    }
  }, [selectedFieldId, fields]);

  const handleGeneratePDF = useCallback(async (schema: any[], data: FieldData, file: File) => {
    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('schema', JSON.stringify(schema));
      formData.append('data', JSON.stringify(data));

      const response = await fetch('http://localhost:3000/pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      // Download the generated PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setGenerating(false);
    }
  }, []);

  const handleFieldDataChange = useCallback((key: string, value: string) => {
    setFieldData((prev) => {
      const updated = { ...prev, [key]: value };
      // Remove empty values
      if (value === '') {
        const { [key]: _, ...rest } = updated;
        return rest;
      }
      return updated;
    });
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>PDF Template Playground</h1>
        <p>Upload a PDF, map fields, and generate templates</p>
      </header>

      <div className="app-content">
        <div className="sidebar">
          <div className="sidebar-section">
            <PDFUploader onFileSelect={handleFileSelect} loading={loading} />
            {error && <div className="error-message">{error}</div>}
          </div>

          {pages.length > 0 && (
            <>
              <div className="sidebar-section">
                <FieldMapper
                  fields={fields}
                  selectedFieldId={selectedFieldId}
                  onFieldAdd={handleFieldAdd}
                  onFieldUpdate={handleFieldUpdate}
                  onFieldDelete={handleFieldDelete}
                  onFieldSelect={setSelectedFieldId}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  pages={pages}
                  fieldData={fieldData}
                  onFieldDataChange={handleFieldDataChange}
                />
              </div>

              <div className="sidebar-section">
                <Toolbar
                  fields={fields}
                  pages={pages}
                  fieldData={fieldData}
                  pdfFile={pdfFile}
                  onGeneratePDF={handleGeneratePDF}
                  generating={generating}
                />
              </div>
            </>
          )}
        </div>

        <div className="main-content">
          {pages.length > 0 ? (
            <PDFViewer
              pages={pages}
              fields={fields}
              selectedFieldId={selectedFieldId}
              onFieldSelect={setSelectedFieldId}
              onFieldUpdate={handleFieldUpdate}
              onFieldDelete={handleFieldDelete}
              onFieldAdd={handleFieldAdd}
              getCanvasRef={getCanvasRef}
            />
          ) : (
            <div className="empty-state">
              <p>Upload a PDF file to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

