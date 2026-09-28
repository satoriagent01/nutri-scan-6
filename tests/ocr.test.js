/**
 * Tests for OCR module
 */

import { describe, it, assert, before, after } from 'node:test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('OCR Module', () => {
  let OCRModule;

  before(async () => {
    // We can't actually load Tesseract.js in Node without the full setup,
    // but we can test the module structure and exported functions exist
    OCRModule = await import('../../src/lib/ocr.js');
  });

  it('should export extractNutritionFromImage function', () => {
    assert.ok(typeof OCRModule.extractNutritionFromImage === 'function', 
      'extractNutritionFromImage should be exported');
  });

  it('should export extractTextFromImage function', () => {
    assert.ok(typeof OCRModule.extractTextFromImage === 'function',
      'extractTextFromImage should be exported');
  });

  it('should export isSupported function', () => {
    assert.ok(typeof OCRModule.isSupported === 'function',
      'isSupported should be exported');
  });

  it('should return supported status', () => {
    const supported = OCRModule.isSupported();
    assert.ok(typeof supported === 'boolean',
      'isSupported should return a boolean');
  });

  it('extractNutritionFromImage should handle empty image', async () => {
    // Create a minimal valid image buffer (1x1 white pixel PNG)
    const pngHeader = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk length + type
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // bit depth, color type, etc.
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
      0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
      0x00, 0x05, 0xFE, 0x02, 0xFE, 0xA7, 0x9A, 0x9A,
      0x52, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, // IEND chunk
      0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    const result = await OCRModule.extractNutritionFromImage(pngHeader);
    assert.ok(result !== null, 'Should return null or object for empty image');
  });

  it('extractTextFromImage should handle empty image', async () => {
    const pngHeader = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
      0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
      0x00, 0x05, 0xFE, 0x02, 0xFE, 0xA7, 0x9A, 0x9A,
      0x52, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
      0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    const result = await OCRModule.extractTextFromImage(pngHeader);
    assert.ok(typeof result === 'string', 'Should return a string');
  });
});