# Testing Guide

This guide explains how to test the PDF Template Engine after building it.

## Quick Start

### Option 1: Run Automated Test Suite (Recommended)

1. **Install dependencies** (if you haven't already):
   ```bash
   npm install
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Run the test suite**:
   ```bash
   npm test
   ```

   This will run a comprehensive test suite that includes:
   - ✅ Basic PDF generation
   - ✅ Multi-page PDF generation
   - ✅ Error handling (missing template, missing fields, invalid coordinates, invalid page numbers)

   Test outputs will be saved in `test/output/` directory.

### Option 2: Manual Test (Using Built Package)

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Run the manual test script**:
   ```bash
   node test/manual-test.js
   ```

   This creates a simple PDF and generates an output file at `test/output/manual-test-output.pdf`.

## Test Structure

```
test/
├── test.ts              # Comprehensive automated test suite
├── manual-test.js       # Simple manual test using built package
├── templates/           # Generated test templates (auto-created)
└── output/              # Generated test PDFs (auto-created)
```

## What Gets Tested

### ✅ Functional Tests
- **Basic Generation**: Creates a PDF with multiple text fields
- **Multi-page Support**: Tests filling fields across multiple pages
- **Default Values**: Tests default font size and page number

### ❌ Error Handling Tests
- **Missing Template**: Verifies error when template PDF doesn't exist
- **Missing Field Values**: Verifies error when required data is missing
- **Invalid Coordinates**: Verifies error when coordinates are negative
- **Invalid Page Number**: Verifies error when page doesn't exist

## Manual Testing with Your Own PDF

To test with your own PDF template:

1. **Create a test script** (`test/custom-test.js`):
   ```javascript
   const { generatePDF } = require('../dist/index.js');
   const path = require('path');

   async function test() {
     await generatePDF({
       templatePath: './path/to/your/template.pdf',
       outputPath: './output/my-test.pdf',
       fields: [
         { key: 'field1', x: 100, y: 700, fontSize: 14 },
         { key: 'field2', x: 100, y: 650, fontSize: 12 },
       ],
       data: {
         field1: 'Value 1',
         field2: 'Value 2',
       },
     });
     console.log('PDF generated successfully!');
   }

   test().catch(console.error);
   ```

2. **Run it**:
   ```bash
   node test/custom-test.js
   ```

## Finding Coordinates

To find the correct x/y coordinates for your PDF:

1. **Use a PDF editor** (like Adobe Acrobat, PDF Expert, or Preview on Mac):
   - Open your template PDF
   - Use measurement tools to find positions
   - Note: Y coordinate is measured from the **bottom** of the page

2. **Use pdf-lib's measurement utilities**:
   ```javascript
   const { PDFDocument } = require('pdf-lib');
   const fs = require('fs').promises;

   async function measurePDF() {
     const pdfBytes = await fs.readFile('./template.pdf');
     const pdfDoc = await PDFDocument.load(pdfBytes);
     const page = pdfDoc.getPages()[0];
     const { width, height } = page.getSize();
     console.log(`Page size: ${width} x ${height} points`);
     // 1 point = 1/72 inch
   }
   ```

3. **Trial and error**: Start with approximate values and adjust

## Verifying Test Results

After running tests:

1. **Check the output directory**: `test/output/`
2. **Open the generated PDFs** in a PDF viewer
3. **Verify**:
   - Text appears at the correct positions
   - Text size matches the specified fontSize
   - Multi-page PDFs have text on correct pages
   - Text is readable and properly formatted

## Troubleshooting

### Test fails with "Template PDF not found"
- Make sure the template path is correct
- Check that the template file exists
- Use absolute paths if relative paths don't work

### Text appears in wrong position
- Remember: Y coordinate is measured from the **bottom** of the page
- PDF coordinates: (0,0) is bottom-left corner
- Adjust coordinates and re-test

### Text is too small or too large
- Adjust the `fontSize` parameter
- Default is 12 points if not specified

### Page number errors
- Page numbers are 1-indexed (first page is 1, not 0)
- Make sure the page number exists in your PDF

## Next Steps

After testing, you can:
- Use the library in your own projects
- Publish to npm (if ready)
- Add more test cases for edge cases
- Set up CI/CD with automated testing

