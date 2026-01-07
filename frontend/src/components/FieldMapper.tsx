import { PDFField, FieldData } from '../types';

interface FieldMapperProps {
  fields: PDFField[];
  selectedFieldId: string | null;
  onFieldAdd: () => void;
  onFieldUpdate: (fieldId: string, updates: Partial<PDFField>) => void;
  onFieldDelete: (fieldId: string) => void;
  onFieldSelect: (fieldId: string | null) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  pages: Array<{ pageNumber: number }>;
  fieldData: FieldData;
  onFieldDataChange: (key: string, value: string) => void;
}

export function FieldMapper({
  fields,
  selectedFieldId,
  onFieldAdd,
  onFieldUpdate,
  onFieldDelete,
  onFieldSelect,
  currentPage,
  onPageChange,
  pages,
  fieldData,
  onFieldDataChange,
}: FieldMapperProps) {
  const currentPageFields = fields.filter((f) => f.page === currentPage);

  const handleKeyChange = (fieldId: string, key: string) => {
    const oldField = fields.find((f) => f.id === fieldId);
    if (oldField && oldField.key !== key) {
      // Update field data key if it exists
      if (fieldData[oldField.key] !== undefined) {
        const value = fieldData[oldField.key];
        onFieldDataChange(key, String(value));
        // Remove old key (handled by parent)
      }
    }
    onFieldUpdate(fieldId, { key });
  };

  const handleFontSizeChange = (fieldId: string, fontSize: number) => {
    onFieldUpdate(fieldId, { fontSize: fontSize > 0 ? fontSize : 12 });
  };

  return (
    <div className="field-mapper">
      <div className="field-mapper-header">
        <h3>Field Mapper</h3>
        <div className="page-selector">
          <label>Page: </label>
          <select
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              onPageChange(page);
              onFieldSelect(null);
            }}
          >
            {pages.map((page) => (
              <option key={page.pageNumber} value={page.pageNumber}>
                {page.pageNumber + 1}
              </option>
            ))}
          </select>
        </div>
        <button onClick={onFieldAdd} className="add-field-button">
          + Add Field
        </button>
      </div>

      <div className="fields-list">
        {currentPageFields.length === 0 ? (
          <p className="no-fields">No fields on this page. Click "Add Field" to create one.</p>
        ) : (
          currentPageFields.map((field) => (
            <div
              key={field.id}
              className={`field-item ${selectedFieldId === field.id ? 'selected' : ''}`}
              onClick={() => onFieldSelect(field.id)}
            >
              <div className="field-item-header">
                <input
                  type="text"
                  value={field.key}
                  onChange={(e) => handleKeyChange(field.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Field key"
                  className="field-key-input"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFieldDelete(field.id);
                  }}
                  className="delete-button"
                >
                  ×
                </button>
              </div>
              <div className="field-item-details">
                <div className="field-coords">
                  <span>X: {Math.round(field.x)}</span>
                  <span>Y: {Math.round(field.y)}</span>
                  <span>W: {Math.round(field.width)}</span>
                  <span>H: {Math.round(field.height)}</span>
                </div>
                <div className="field-font-size">
                  <label>
                    Font Size:
                    <input
                      type="number"
                      value={field.fontSize || 12}
                      onChange={(e) =>
                        handleFontSizeChange(field.id, parseInt(e.target.value) || 12)
                      }
                      onClick={(e) => e.stopPropagation()}
                      min="8"
                      max="72"
                      className="font-size-input"
                    />
                  </label>
                </div>
                <div className="field-sample-data">
                  <label>
                    Sample Data:
                    <input
                      type="text"
                      value={fieldData[field.key] || ''}
                      onChange={(e) => onFieldDataChange(field.key, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Test value"
                      className="sample-data-input"
                    />
                  </label>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

