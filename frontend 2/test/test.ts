import { generatePDF } from '../src/index';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Creates a simple test PDF template if it doesn't exist
 */
async function createTestTemplate(): Promise<string> {
  const templatePath = path.join(__dirname, 'templates', 'test-template.pdf');
  const templateDir = path.dirname(templatePath);

  // Check if template already exists
  try {
    await fs.access(templatePath);
    console.log('✓ Test template already exists');
    return templatePath;
  } catch {
    // Template doesn't exist, create it
  }

  // Create template directory if it doesn't exist
  await fs.mkdir(templateDir, { recursive: true });

  // Create a simple PDF template with some placeholder areas
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // US Letter size (8.5 x 11 inches)

  // Add some background text to show where fields will be placed
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  page.drawText('Test Template', {
    x: 50,
    y: 750,
    size: 20,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Save the template
  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(templatePath, pdfBytes);
  
  console.log('✓ Created test template');
  return templatePath;
}

/**
 * Test 1: Basic PDF generation
 */
async function testBasicGeneration() {
  console.log('\n📝 Test 1: Basic PDF Generation');
  console.log('─'.repeat(50));
  
  const templatePath = await createTestTemplate();
  const outputPath = path.join(__dirname, 'output', 'test-basic.pdf');
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  try {
    await generatePDF({
      templatePath,
      outputPath,
      fields: [
        { key: 'title', x: 50, y: 700, fontSize: 18 },
        { key: 'name', x: 50, y: 650, fontSize: 14 },
        { key: 'date', x: 50, y: 600, fontSize: 12 },
        { key: 'amount', x: 50, y: 550, fontSize: 16 },
      ],
      data: {
        title: 'Invoice #001',
        name: 'John Doe',
        date: '2024-01-15',
        amount: '$1,234.56',
      },
    });

    console.log('✓ PDF generated successfully');
    console.log(`  Output: ${outputPath}`);
  } catch (error) {
    console.error('✗ Test failed:', error instanceof Error ? error.message : error);
    throw error;
  }
}

/**
 * Test 2: Multi-page PDF generation
 */
async function testMultiPageGeneration() {
  console.log('\n📄 Test 2: Multi-page PDF Generation');
  console.log('─'.repeat(50));

  // Create a multi-page template
  const templatePath = path.join(__dirname, 'templates', 'multi-page-template.pdf');
  const templateDir = path.dirname(templatePath);
  await fs.mkdir(templateDir, { recursive: true });

  const pdfDoc = await PDFDocument.create();
  const page1 = pdfDoc.addPage([612, 792]);
  const page2 = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page1.drawText('Page 1', {
    x: 50,
    y: 750,
    size: 20,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  page2.drawText('Page 2', {
    x: 50,
    y: 750,
    size: 20,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(templatePath, pdfBytes);

  const outputPath = path.join(__dirname, 'output', 'test-multipage.pdf');
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  try {
    await generatePDF({
      templatePath,
      outputPath,
      fields: [
        { key: 'page1Title', x: 50, y: 700, fontSize: 18, page: 1 },
        { key: 'page1Content', x: 50, y: 650, fontSize: 12, page: 1 },
        { key: 'page2Title', x: 50, y: 700, fontSize: 18, page: 2 },
        { key: 'page2Content', x: 50, y: 650, fontSize: 12, page: 2 },
      ],
      data: {
        page1Title: 'First Page',
        page1Content: 'This is content on page 1',
        page2Title: 'Second Page',
        page2Content: 'This is content on page 2',
      },
    });

    console.log('✓ Multi-page PDF generated successfully');
    console.log(`  Output: ${outputPath}`);
  } catch (error) {
    console.error('✗ Test failed:', error instanceof Error ? error.message : error);
    throw error;
  }
}

/**
 * Test 3: Error handling - Missing template
 */
async function testMissingTemplate() {
  console.log('\n❌ Test 3: Error Handling - Missing Template');
  console.log('─'.repeat(50));

  try {
    await generatePDF({
      templatePath: './non-existent-template.pdf',
      outputPath: './output/test-error.pdf',
      fields: [{ key: 'test', x: 100, y: 100 }],
      data: { test: 'value' },
    });
    console.error('✗ Test failed: Should have thrown an error');
    throw new Error('Expected error was not thrown');
  } catch (error) {
    if (error instanceof Error && error.message.includes('Template PDF not found')) {
      console.log('✓ Correctly caught missing template error');
    } else {
      console.error('✗ Unexpected error:', error);
      throw error;
    }
  }
}

/**
 * Test 4: Error handling - Missing field values
 */
async function testMissingFieldValues() {
  console.log('\n❌ Test 4: Error Handling - Missing Field Values');
  console.log('─'.repeat(50));

  const templatePath = await createTestTemplate();
  const outputPath = path.join(__dirname, 'output', 'test-error.pdf');
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  try {
    await generatePDF({
      templatePath,
      outputPath,
      fields: [
        { key: 'existing', x: 100, y: 100 },
        { key: 'missing', x: 100, y: 200 },
      ],
      data: {
        existing: 'value',
        // missing field intentionally omitted
      },
    });
    console.error('✗ Test failed: Should have thrown an error');
    throw new Error('Expected error was not thrown');
  } catch (error) {
    if (error instanceof Error && error.message.includes('Missing required field values')) {
      console.log('✓ Correctly caught missing field values error');
    } else {
      console.error('✗ Unexpected error:', error);
      throw error;
    }
  }
}

/**
 * Test 5: Error handling - Invalid coordinates
 */
async function testInvalidCoordinates() {
  console.log('\n❌ Test 5: Error Handling - Invalid Coordinates');
  console.log('─'.repeat(50));

  const templatePath = await createTestTemplate();
  const outputPath = path.join(__dirname, 'output', 'test-error.pdf');
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  try {
    await generatePDF({
      templatePath,
      outputPath,
      fields: [
        { key: 'test', x: -10, y: 100 }, // Invalid negative x
      ],
      data: {
        test: 'value',
      },
    });
    console.error('✗ Test failed: Should have thrown an error');
    throw new Error('Expected error was not thrown');
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid x coordinate')) {
      console.log('✓ Correctly caught invalid coordinate error');
    } else {
      console.error('✗ Unexpected error:', error);
      throw error;
    }
  }
}

/**
 * Test 6: Error handling - Invalid page number
 */
async function testInvalidPageNumber() {
  console.log('\n❌ Test 6: Error Handling - Invalid Page Number');
  console.log('─'.repeat(50));

  const templatePath = await createTestTemplate();
  const outputPath = path.join(__dirname, 'output', 'test-error.pdf');
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  try {
    await generatePDF({
      templatePath,
      outputPath,
      fields: [
        { key: 'test', x: 100, y: 100, page: 999 }, // Page doesn't exist
      ],
      data: {
        test: 'value',
      },
    });
    console.error('✗ Test failed: Should have thrown an error');
    throw new Error('Expected error was not thrown');
  } catch (error) {
    if (error instanceof Error && error.message.includes('does not exist in the PDF')) {
      console.log('✓ Correctly caught invalid page number error');
    } else {
      console.error('✗ Unexpected error:', error);
      throw error;
    }
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 PDF Template Engine - Test Suite');
  console.log('═'.repeat(50));

  const tests = [
    testBasicGeneration,
    testMultiPageGeneration,
    testMissingTemplate,
    testMissingFieldValues,
    testInvalidCoordinates,
    testInvalidPageNumber,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await test();
      passed++;
    } catch (error) {
      failed++;
      console.error(`\n✗ Test failed with error:`, error);
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log('═'.repeat(50));

  if (failed > 0) {
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

