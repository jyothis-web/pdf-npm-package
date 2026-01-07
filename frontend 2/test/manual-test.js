/**
 * Simple manual test script using the built package
 * Run this after building: npm run build && node test/manual-test.js
 */

import { generatePDF } from '../dist/index.js';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createSimpleTemplate() {
  const templatePath = path.join(__dirname, 'templates', 'simple-template.pdf');
  const templateDir = path.dirname(templatePath);
  
  await fs.mkdir(templateDir, { recursive: true });
  
  // Check if template exists
  try {
    await fs.access(templatePath);
    console.log('✓ Template already exists');
    return templatePath;
  } catch {
    // Create new template
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // US Letter size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Add some background text
  page.drawText('Invoice Template', {
    x: 50,
    y: 750,
    size: 20,
    font,
    color: rgb(0.7, 0.7, 0.7),
  });

  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(templatePath, pdfBytes);
  console.log('✓ Created template');
  
  return templatePath;
}

async function runManualTest() {
  console.log('🧪 Manual Test - PDF Template Engine\n');
  console.log('═'.repeat(50));

  try {
    // Create template
    const templatePath = await createSimpleTemplate();
    
    // Prepare output
    const outputPath = path.join(__dirname, 'output', 'manual-test-output.pdf');
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Generate PDF
    console.log('\n📝 Generating PDF...');
    await generatePDF({
      templatePath,
      outputPath,
      fields: [
        { key: 'invoiceNumber', x: 50, y: 700, fontSize: 18 },
        { key: 'customerName', x: 50, y: 650, fontSize: 14 },
        { key: 'date', x: 50, y: 600, fontSize: 12 },
        { key: 'amount', x: 50, y: 550, fontSize: 16 },
        { key: 'status', x: 50, y: 500, fontSize: 12 },
      ],
      data: {
        invoiceNumber: 'INV-2024-001',
        customerName: 'John Doe',
        date: '2024-01-15',
        amount: '$1,234.56',
        status: 'Paid',
      },
    });

    console.log('✅ Success! PDF generated at:', outputPath);
    console.log('\n💡 Open the PDF file to verify the text was placed correctly.');
    console.log('   The text should appear at the specified coordinates.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

runManualTest();

