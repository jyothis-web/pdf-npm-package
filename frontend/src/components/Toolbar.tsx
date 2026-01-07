import { PDFField, FieldData, PDFPage } from '../types';
import { downloadSchema, exportSchema } from '../utils/exportSchema';

interface ToolbarProps {
  fields: PDFField[];
  pages: PDFPage[];
  fieldData: FieldData;
  pdfFile: File | null;
  onGeneratePDF: (schema: any[], data: FieldData, pdfFile: File) => Promise<void>;
  generating?: boolean;
}

export function Toolbar({
  fields,
  pages,
  fieldData,
  pdfFile,
  onGeneratePDF,
  generating = false,
}: ToolbarProps) {
  const handleExportSchema = () => {
    if (fields.length === 0) {
      alert('No fields to export. Please add some fields first.');
      return;
    }
    downloadSchema(fields, pages);
  };

  const handleGeneratePDF = async () => {
    if (!pdfFile) {
      alert('Please upload a PDF first.');
      return;
    }

    if (fields.length === 0) {
      alert('Please add at least one field before generating.');
      return;
    }

    const schema = exportSchema(fields, pages);
    
    // Prepare data - only include fields that have sample data
    const data: FieldData = {};
    fields.forEach((field) => {
      if (fieldData[field.key] !== undefined && fieldData[field.key] !== '') {
        data[field.key] = fieldData[field.key];
      }
    });

    try {
      await onGeneratePDF(schema, data, pdfFile);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Check console for details.');
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <button onClick={handleExportSchema} className="toolbar-button" disabled={fields.length === 0}>
          📥 Export JSON Schema
        </button>
        <button
          onClick={handleGeneratePDF}
          className="toolbar-button primary"
          disabled={!pdfFile || fields.length === 0 || generating}
        >
          {generating ? '⏳ Generating...' : '🚀 Generate PDF'}
        </button>
      </div>
      <div className="toolbar-info">
        <span>{fields.length} field{fields.length !== 1 ? 's' : ''} defined</span>
      </div>
    </div>
  );
}

