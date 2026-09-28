/**
 * OCR Module using Tesseract.js for image text extraction
 * Handles multilingual nutrition labels (DE, NL, FR, IT, ES, EN)
 */

let TesseractInstance = null;

/**
 * Initialize Tesseract.js worker
 */
async function initTesseract() {
  if (TesseractInstance) return TesseractInstance;
  
  const { createWorker } = await import('https://cdn.jsdelivr.net/npm/tesseract.js@5/+esm');
  
  TesseractInstance = await createWorker('deu+eng+nld+fra+ita+spa', {
    logger: m => {
      if (m.status === 'recognizing text') {
        window.dispatchEvent(new CustomEvent('ocr-progress', {
          detail: { progress: m.progress }
        }));
      }
    }
  });
  
  return TesseractInstance;
}

/**
 * Extract text from an image file
 * @param {File|Blob} imageFile - The image file to process
 * @returns {Promise<string>} - The extracted text
 */
async function extractText(imageFile) {
  const worker = await initTesseract();
  const result = await worker.recognize(imageFile);
  return result.data.text;
}

/**
 * Clean and normalize extracted text for parsing
 * @param {string} text - Raw OCR text
 * @returns {string} - Cleaned text
 */
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\|/g, '|')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Detect the language of the nutrition label from text content
 * @param {string} text - Extracted text
 * @returns {string} - Detected language code
 */
function detectLanguage(text) {
  const lowerText = text.toLowerCase();
  
  // Check for common nutrition terms in each language
  const languages = {
    deu: ['nährwert', 'energ', 'fett', 'kohlenhydrat', 'eiweiß'],
    nld: ['voedingswaarde', 'energ', 'vet', 'koolhydrat', 'eiwitten'],
    fra: ['valeur', 'énerg', 'matières grasses', 'glucides', 'protéines'],
    ita: ['valore', 'energie', 'grassi', 'carboidrati', 'proteine'],
    spa: ['valor', 'energ', 'grasa', 'hidratos', 'proteínas'],
    eng: ['energy', 'fat', 'carbohydrate', 'protein', 'sugar']
  };
  
  let scores = {};
  for (const [lang, terms] of Object.entries(languages)) {
    scores[lang] = terms.reduce((score, term) => {
      return score + (lowerText.includes(term) ? 1 : 0);
    }, 0);
  }
  
  let bestLang = 'deu';
  let bestScore = 0;
  for (const [lang, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestLang = lang;
    }
  }
  
  return bestLang;
}

/**
 * Process an image and return extracted text
 * @param {File|Blob} imageFile - The image file
 * @returns {Promise<{text: string, language: string}>}
 */
async function processImage(imageFile) {
  const rawText = await extractText(imageFile);
  const cleaned = cleanText(rawText);
  const language = detectLanguage(cleaned);
  
  return { text: cleaned, language };
}

/**
 * Destroy the Tesseract worker to free memory
 */
async function destroyWorker() {
  if (TesseractInstance) {
    await TesseractInstance.terminate();
    TesseractInstance = null;
  }
}

export { extractText, cleanText, detectLanguage, processImage, destroyWorker };