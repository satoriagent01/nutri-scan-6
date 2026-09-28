/**
 * Nutrition Table Parser
 * Deterministic parser that extracts nutrition data from OCR text
 * Handles tables in multiple languages (DE, NL, FR, IT, ES, EN)
 */

/**
 * Parse nutrition table from text
 * @param {string} text - OCR extracted text
 * @returns {Object} - Parsed nutrition data
 */
export function parseNutritionTable(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Find the nutrition table section
  const tableStart = findTableStart(lines);
  if (tableStart === -1) {
    return { nutrients: {}, servingSize: null, perServing: false };
  }
  
  // Extract table rows
  const rows = extractTableRows(lines, tableStart);
  if (rows.length < 2) {
    return { nutrients: {}, servingSize: null, perServing: false };
  }
  
  // Parse header to determine columns
  const header = rows[0];
  const hasServingColumn = header.some(cell => 
    cell.includes('100') || cell.includes('pro 100') || cell.includes('per 100')
  );
  
  // Parse nutrient rows
  const nutrients = {};
  let servingSize = null;
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const parsed = parseNutrientRow(row, hasServingColumn);
    if (parsed) {
      nutrients[parsed.name] = parsed.values;
    }
  }
  
  // Determine serving size from header or context
  servingSize = detectServingSize(text, rows);
  
  return {
    nutrients,
    servingSize,
    perServing: !hasServingColumn
  };
}

/**
 * Find the start of the nutrition table in lines
 */
function findTableStart(lines) {
  const nutritionKeywords = [
    'nährwert', 'nutrition', 'voedingswaarde', 'valore nutrizionale',
    'valor nutricional', 'valeur nutritionnelle', 'nutrition facts',
    'nährwertdeklaration', 'voedingswaarden', 'valore nutrizionale'
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();
    for (const keyword of nutritionKeywords) {
      if (lower.includes(keyword)) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * Extract table rows from lines starting at tableStart
 */
function extractTableRows(lines, tableStart) {
  const rows = [];
  let i = tableStart + 1;
  
  // Skip empty lines and header separators
  while (i < lines.length && (lines[i].includes('---') || lines[i].includes('___') || lines[i].includes('|||'))) {
    i++;
  }
  
  // Extract rows until we hit a non-table line
  while (i < lines.length) {
    const line = lines[i];
    
    // Stop if we hit a line that doesn't look like a table row
    if (line.includes('---') || line.includes('___') || line.includes('|||')) {
      i++;
      continue;
    }
    
    // Try to parse as a table row
    const cells = parseTableRow(line);
    if (cells.length >= 2) {
      rows.push(cells);
    } else if (line.length > 30 && !line.includes('www.') && !line.includes('@')) {
      // Might be a row with spaces instead of separators
      const spaceCells = parseSpaceSeparatedRow(line);
      if (spaceCells.length >= 2) {
        rows.push(spaceCells);
      }
    }
    
    i++;
  }
  
  return rows;
}

/**
 * Parse a table row with pipe separators
 */
function parseTableRow(line) {
  if (line.includes('|')) {
    return line.split('|').map(c => c.trim()).filter(c => c.length > 0);
  }
  return [];
}

/**
 * Parse a space-separated row (common in nutrition labels)
 */
function parseSpaceSeparatedRow(line) {
  // Match patterns like "Energie 2292 kJ 549 kcal" or "Fett 33 g 10 g"
  const pattern = /^([a-zA-ZÀ-ÿ\s]+?)\s+(\d+[.,]?\d*)\s*(g|kJ|kcal|mg|µg)?\s*(\d+[.,]?\d*)\s*(g|kJ|kcal|mg|µg)?/;
  const match = line.match(pattern);
  
  if (match) {
    const cells = [match[1].trim()];
    if (match[2]) cells.push(match[2]);
    if (match[4]) cells.push(match[4]);
    return cells;
  }
  
  return [];
}

/**
 * Parse a single nutrient row
 */
function parseNutrientRow(row, hasServingColumn) {
  // Clean up the row
  const cleaned = row.map(cell => cell.replace(/[*]/g, '').trim());
  
  // Try to match known nutrient patterns
  const nutrientPatterns = [
    { name: 'energy', keywords: ['energ', 'calor'], unit: 'kcal' },
    { name: 'fat', keywords: ['fett', 'vet', 'gras', 'grass', 'grasa'], unit: 'g' },
    { name: 'saturatedFat', keywords: ['gesättigte', 'verzadigde', 'saturadas', 'saturi', 'gras satur'], unit: 'g' },
    { name: 'carbohydrates', keywords: ['kohlenhydrat', 'koolhydrat', 'carboidrati', 'hidratos', 'glucides', 'carbo'], unit: 'g' },
    { name: 'sugars', keywords: ['zucker', 'suiker', 'zucch', 'azúcar', 'sucres', 'zucker', 'sugar'], unit: 'g' },
    { name: 'fiber', keywords: ['ballaststoff', 'vezel', 'fibra', 'fibres', 'fibre'], unit: 'g' },
    { name: 'protein', keywords: ['eiweiß', 'eiwit', 'prote', 'proteína', 'protéine', 'protein'], unit: 'g' },
    { name: 'salt', keywords: ['salz', 'zout', 'sale', 'salt', 'sel'], unit: 'g' }
  ];
  
  const rowText = cleaned[0].toLowerCase();
  
  for (const pattern of nutrientPatterns) {
    if (pattern.keywords.some(kw => rowText.includes(kw))) {
      const values = {};
      
      if (cleaned.length >= 2) {
        values['per100g'] = parseValue(cleaned[1]);
      }
      if (cleaned.length >= 3 && hasServingColumn) {
        values['perServing'] = parseValue(cleaned[2]);
      }
      
      return { name: pattern.name, values };
    }
  }
  
  return null;
}

/**
 * Parse a numeric value from a string
 */
function parseValue(str) {
  if (!str) return null;
  // Remove any non-numeric characters except . and ,
  const cleaned = str.replace(/[^0-9.,]/g, '').trim();
  if (cleaned === '') return null;
  // Convert comma to dot for decimal
  return parseFloat(cleaned.replace(',', '.'));
}

/**
 * Detect serving size from text or table context
 */
function detectServingSize(text, rows) {
  // Look for serving size indicators
  const servingPatterns = [
    /(\d+)\s*(g|ml|stuck|stück|stuks|porción|portion)/i,
    /(\d+)\s*=\s*(\d+)\s*(g|ml)/i,
    /pro\s*(\d+)\s*(g|ml)/i
  ];
  
  for (const pattern of servingPatterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        amount: parseFloat(match[1]),
        unit: match[2] || 'g'
      };
    }
  }
  
  // Check rows for serving column header
  if (rows.length > 0) {
    const header = rows[0];
    for (const cell of header) {
      const match = cell.match(/(\d+)\s*(g|ml)/i);
      if (match) {
        return {
          amount: parseFloat(match[1]),
          unit: match[2]
        };
      }
    }
  }
  
  return { amount: 100, unit: 'g' }; // Default
}

/**
 * Get a specific nutrient value
 * @param {Object} nutritionData - Parsed nutrition data
 * @param {string} nutrient - Nutrient name
 * @param {string} basis - 'per100g' or 'perServing'
 * @returns {number|null}
 */
export function getNutrientValue(nutritionData, nutrient, basis = 'per100g') {
  if (!nutritionData || !nutritionData.nutrients) return null;
  const nutrientData = nutritionData.nutrients[nutrient];
  if (!nutrientData) return null;
  return nutrientData[basis] || null;
}

/**
 * Calculate nutrition for a given weight
 * @param {Object} nutritionData - Parsed nutrition data
 * @param {number} weight - Weight in grams
 * @returns {Object} - Nutrition values for the given weight
 */
export function calculateForWeight(nutritionData, weight) {
  if (!nutritionData || !nutritionData.nutrients) return {};
  
  const result = {};
  const factor = weight / 100;
  
  for (const [name, data] of Object.entries(nutritionData.nutrients)) {
    if (data['per100g']) {
      result[name] = data['per100g'] * factor;
    }
  }
  
  return result;
}

/**
 * Get all available nutrients
 */
export function getAvailableNutrients() {
  return [
    { key: 'energy', label: 'Energy (kcal)', icon: '🔥' },
    { key: 'fat', label: 'Fat (g)', icon: '🧈' },
    { key: 'saturatedFat', label: 'Saturated Fat (g)', icon: '🥓' },
    { key: 'carbohydrates', label: 'Carbohydrates (g)', icon: '🍞' },
    { key: 'sugars', label: 'Sugars (g)', icon: '🍬' },
    { key: 'fiber', label: 'Fiber (g)', icon: '🌾' },
    { key: 'protein', label: 'Protein (g)', icon: '🥩' },
    { key: 'salt', label: 'Salt (g)', icon: '🧂' }
  ];
}