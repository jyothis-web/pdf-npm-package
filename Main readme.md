# @your-scope/pdf-template-engine

A production-ready TypeScript npm package for filling text fields in PDF templates using x/y coordinates.

## Installation

npm install @your-scope/pdf-template-engine## Quick Start

### Backend Usage
ript
import { generatePDF } from '@your-scope/pdf-template-engine';

await generatePDF({
  templatePath: './templates/invoice.pdf',
  outputPath: './output/invoice-filled.pdf',
  fields: [
    { key: 'customerName', x: 100, y: 700, fontSize: 14, page: 1 }
  ],
  data: {
    customerName: 'John Doe'
  }
});### Frontend Integration

For frontend PDF rendering and field mapping, see [Frontend Integration Guide](./docs/FRONTEND.md).

## Documentation

- [API Reference](./docs/API.md)
- [Frontend Integration Guide](./docs/FRONTEND.md)
- [Coordinate System Guide](./docs/COORDINATES.md)
- [Examples](./examples/)