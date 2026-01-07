# PDF Template Engine

A production-ready, TypeScript-based npm package for filling text fields in PDF templates using x/y coordinates. Built for Node.js with no browser dependencies.

## Features

- ✅ Load existing PDF files
- ✅ Fill dynamic text fields using precise x/y coordinates
- ✅ Support for multiple pages
- ✅ Customizable font sizes
- ✅ Type-safe with TypeScript
- ✅ Clear error messages
- ✅ Zero browser dependencies

## Installation

```bash
npm install @your-scope/pdf-template-engine
```

## Requirements

- Node.js >= 16
- TypeScript (for TypeScript projects)

## Usage

### Basic Example

```typescript
import { generatePDF } from '@your-scope/pdf-template-engine';

await generatePDF({
  templatePath: './templates/invoice.pdf',
  outputPath: './output/invoice-filled.pdf',
  fields: [
    { key: 'customerName', x: 100, y: 700, fontSize: 14 },
    { key: 'invoiceNumber', x: 100, y: 650, fontSize: 12 },
    { key: 'amount', x: 100, y: 600, fontSize: 16 }
  ],
  data: {
    customerName: 'John Doe',
    invoiceNumber: 'INV-2024-001',
    amount: '$1,234.56'
  }
});
```

### Multi-page Example

```typescript
import { generatePDF } from '@your-scope/pdf-template-engine';

await generatePDF({
  templatePath: './templates/multi-page.pdf',
  outputPath: './output/filled.pdf',
  fields: [
    // Page 1 fields
    { key: 'title', x: 50, y: 750, fontSize: 18, page: 1 },
    { key: 'subtitle', x: 50, y: 720, fontSize: 12, page: 1 },
    
    // Page 2 fields
    { key: 'footer', x: 50, y: 50, fontSize: 10, page: 2 }
  ],
  data: {
    title: 'Document Title',
    subtitle: 'Document Subtitle',
    footer: 'Page 2 Footer'
  }
});
```

### Error Handling

```typescript
import { generatePDF } from '@your-scope/pdf-template-engine';

try {
  await generatePDF({
    templatePath: './templates/invoice.pdf',
    outputPath: './output/invoice-filled.pdf',
    fields: [
      { key: 'customerName', x: 100, y: 700 }
    ],
    data: {
      customerName: 'John Doe'
    }
  });
  console.log('PDF generated successfully!');
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
    // Possible errors:
    // - "Template PDF not found: ..."
    // - "Missing required field values: ..."
    // - "Invalid x coordinate for field '...': ..."
    // - "Page X does not exist in the PDF for field '...'"
  }
}
```

## API Reference

### `generatePDF(options: GeneratePDFOptions): Promise<void>`

Generates a PDF by filling text fields on a template PDF.

#### Parameters

- `templatePath` (string): Path to the template PDF file
- `outputPath` (string): Path where the generated PDF will be saved
- `fields` (PDFField[]): Array of field definitions
- `data` (PDFData): Object mapping field keys to their values

#### Field Definition (`PDFField`)

- `key` (string): Unique identifier for the field (must match a key in `data`)
- `x` (number): X coordinate in points (1 point = 1/72 inch)
- `y` (number): Y coordinate in points (measured from bottom of page)
- `fontSize` (number, optional): Font size in points (default: 12)
- `page` (number, optional): Page number, 1-indexed (default: 1)

#### Data Object (`PDFData`)

An object where keys match field `key` values and values are strings or numbers that will be rendered as text.

## Coordinate System

- Origin (0, 0) is at the **bottom-left** corner of the page
- X increases to the right
- Y increases upward
- Units are in **points** (1 point = 1/72 inch)

To find coordinates, you can:
1. Use a PDF editor to inspect element positions
2. Use tools like `pdf-lib`'s measurement utilities
3. Experiment with values and adjust

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Type check
npm run typecheck

# Watch mode for development
npm run dev
```

## Running the Backend Server (for Frontend Playground)

To test the PDF template engine with the React playground frontend:

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start the backend server**:
   ```bash
   npm run server
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run server:dev
   ```

3. The server will start on `http://localhost:3000` with the following endpoints:
   - `POST /pdf` - Generate PDF from template, schema, and data
   - `GET /health` - Health check endpoint

4. **Start the frontend** (in a separate terminal):
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

5. The frontend will be available at `http://localhost:5173` (or the next available port)

The backend server accepts:
- **PDF file** (multipart/form-data)
- **Schema** (JSON string of field definitions)
- **Data** (JSON string of field values)

And returns the generated PDF file.

## License

MIT

