# PDF Template Playground

A React + Vite frontend playground for testing and visualizing the `@your-scope/pdf-template-engine` npm package. This tool allows you to upload PDFs, visually map text fields, and generate PDF templates with custom data.

## Features

- 📄 **PDF Upload & Preview**: Upload PDF files and preview them in the browser
- 🎯 **Visual Field Mapping**: Drag and drop text fields on any page of the PDF
- ✏️ **Field Configuration**: Name fields, set font sizes, and add sample data
- 📥 **Export JSON Schema**: Export field definitions as JSON for backend consumption
- 🚀 **Generate PDF**: Send PDF + schema + data to backend API to generate filled PDFs
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js >= 16
- npm or yarn
- Backend API running on `http://localhost:3000` (optional, for PDF generation)

## Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd pdf-template-playground
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start on `http://localhost:5173` (or the next available port).

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage Guide

### 1. Upload a PDF

- Click the "Upload PDF" button
- Select a PDF file from your computer
- The PDF will be loaded and displayed in the viewer

### 2. Add Fields

- Click the "+ Add Field" button in the sidebar
- A new field will appear on the current page (default: Page 1)
- Fields are displayed as dashed blue boxes

### 3. Position Fields

- **Drag**: Click and drag a field to move it around the PDF
- **Resize**: Click and drag the corner handles to resize the field
- **Select**: Click on a field to select it (selected fields have a darker border)

### 4. Configure Fields

- **Name**: Click on the field key input to rename the field
- **Font Size**: Adjust the font size (8-72 points)
- **Sample Data**: Enter test data that will be used when generating the PDF

### 5. Switch Pages

- Use the page selector dropdown in the Field Mapper section
- Fields are page-specific - each page can have its own set of fields

### 6. Export JSON Schema

- Click "📥 Export JSON Schema" to download the field definitions as JSON
- The schema format is compatible with `@your-scope/pdf-template-engine`:
  ```json
  [
    {
      "key": "customerName",
      "x": 100,
      "y": 700,
      "fontSize": 14,
      "page": 1
    }
  ]
  ```

### 7. Generate PDF

- Fill in sample data for your fields
- Click "🚀 Generate PDF"
- The app will send the PDF, schema, and data to the backend API
- The generated PDF will be automatically downloaded

## Backend API Integration

The playground expects a backend API at `http://localhost:3000/pdf` that accepts:

**Endpoint**: `POST /pdf`

**Request Format**:
- `pdf`: PDF file (multipart/form-data)
- `schema`: JSON string of field definitions
- `data`: JSON string of field values

**Expected Response**:
- PDF file (binary)

### Example Backend Implementation (Express.js)

```javascript
const express = require('express');
const multer = require('multer');
const { generatePDF } = require('@your-scope/pdf-template-engine');
const fs = require('fs').promises;

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/pdf', upload.single('pdf'), async (req, res) => {
  try {
    const schema = JSON.parse(req.body.schema);
    const data = JSON.parse(req.body.data);
    const templatePath = req.file.path;
    const outputPath = `output/${Date.now()}.pdf`;

    await generatePDF({
      templatePath,
      outputPath,
      fields: schema,
      data,
    });

    const pdfBuffer = await fs.readFile(outputPath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=generated.pdf');
    res.send(pdfBuffer);

    // Cleanup
    await fs.unlink(templatePath);
    await fs.unlink(outputPath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Backend server running on http://localhost:3000');
});
```

## Project Structure

```
pdf-template-playground/
├── src/
│   ├── components/
│   │   ├── PDFUploader.tsx    # File upload component
│   │   ├── PDFViewer.tsx      # PDF display and field overlay
│   │   ├── FieldMapper.tsx    # Field management sidebar
│   │   └── Toolbar.tsx         # Export and generate buttons
│   ├── hooks/
│   │   └── usePDF.ts           # PDF loading and rendering logic
│   ├── utils/
│   │   └── exportSchema.ts     # JSON schema export utilities
│   ├── types.ts                # TypeScript type definitions
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # Application entry point
│   ├── App.css                 # Component styles
│   └── index.css               # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Coordinate System

The playground uses the same coordinate system as `pdfjs-dist`:
- **Origin (0, 0)**: Top-left corner of the page
- **X-axis**: Increases to the right
- **Y-axis**: Increases downward
- **Units**: Pixels (scaled by 1.5x for better visibility)

**Note**: The `@your-scope/pdf-template-engine` uses bottom-left origin. The playground automatically converts coordinates when exporting the schema.

## Troubleshooting

### PDF doesn't load
- Ensure the file is a valid PDF
- Check browser console for errors
- Try a different PDF file

### Fields don't appear
- Make sure you've clicked "Add Field"
- Check that you're on the correct page
- Refresh the page and try again

### Backend connection fails
- Verify the backend is running on `http://localhost:3000`
- Check CORS settings if running on different ports
- Check browser console for detailed error messages

### Generated PDF is empty or incorrect
- Verify field coordinates are within page bounds
- Check that sample data is provided for all fields
- Ensure backend is using the correct coordinate system conversion

## Development

### Adding New Features

1. Components are in `src/components/`
2. Shared logic is in `src/hooks/` and `src/utils/`
3. Types are defined in `src/types.ts`

### Styling

- Global styles: `src/index.css`
- Component styles: `src/App.css`
- Uses CSS classes (no CSS-in-JS)

## License

MIT

## Contributing

This is a playground project for testing the PDF template engine. Feel free to modify and extend as needed for your use case.

