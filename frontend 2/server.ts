import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { generatePDF } from './src/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Enable CORS for frontend
app.use(cors());

// Configure multer for file uploads (store in memory)
const upload = multer({ storage: multer.memoryStorage() });

// Create temp directories if they don't exist
const tempDir = path.join(__dirname, 'temp');
const outputDir = path.join(__dirname, 'temp', 'output');

async function ensureDirectories() {
  try {
    await fs.mkdir(tempDir, { recursive: true });
    await fs.mkdir(outputDir, { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'PDF Template Engine API is running' });
});

// PDF generation endpoint
app.post('/pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    if (!req.body.schema) {
      return res.status(400).json({ error: 'No schema provided' });
    }

    if (!req.body.data) {
      return res.status(400).json({ error: 'No data provided' });
    }

    // Parse schema and data
    const schema = JSON.parse(req.body.schema);
    const data = JSON.parse(req.body.data);

    // Generate unique filenames
    const timestamp = Date.now();
    const templatePath = path.join(tempDir, `template-${timestamp}.pdf`);
    const outputPath = path.join(outputDir, `output-${timestamp}.pdf`);

    // Write uploaded PDF to temp file
    await fs.writeFile(templatePath, req.file.buffer);

    // Generate PDF using the backend package
    await generatePDF({
      templatePath,
      outputPath,
      fields: schema,
      data,
    });

    // Read the generated PDF
    const pdfBuffer = await fs.readFile(outputPath);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=generated.pdf');

    // Send the PDF
    res.send(pdfBuffer);

    // Cleanup temp files (don't wait for this to complete)
    fs.unlink(templatePath).catch(console.error);
    fs.unlink(outputPath).catch(console.error);
  } catch (error) {
    console.error('Error generating PDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// Start server
async function startServer() {
  await ensureDirectories();
  
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📄 PDF generation endpoint: http://localhost:${PORT}/pdf`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
  });
}

startServer().catch(console.error);

