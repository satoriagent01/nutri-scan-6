/**
 * Tests for nutrition parser module
 */

import { describe, it, assert } from 'node:test';
import { parseNutritionTable, parseIngredients, normalizeNutritionValues } from '../../src/lib/nutrition-parser.js';

describe('Nutrition Parser', () => {
  describe('parseNutritionTable', () => {
    it('should parse a simple nutrition table with per 100g', () => {
      const text = `
        Tabla nutricional
        Porción: 100g
        Energía: 2292 kJ / 549 kcal
        Grasas: 33 g
        de las cuales saturadas: 13 g
        Carbohidratos: 55 g
        de los cuales azúcares: 45 g
        Fibra: 2,4 g
        Proteínas: 6,8 g
        Sal: 0,18 g
      `;

      const result = parseNutritionTable(text);
      
      assert.ok(result !== null, 'Should parse the nutrition table');
      assert.strictEqual(result.calories, 549, 'Should extract calories');
      assert.strictEqual(result.fat, 33, 'Should extract fat');
      assert.strictEqual(result.saturatedFat, 13, 'Should extract saturated fat');
      assert.strictEqual(result.carbs, 55, 'Should extract carbs');
      assert.strictEqual(result.sugars, 45, 'Should extract sugars');
      assert.strictEqual(result.fiber, 2.4, 'Should extract fiber');
      assert.strictEqual(result.protein, 6.8, 'Should extract protein');
      assert.strictEqual(result.salt, 0.18, 'Should extract salt');
    });

    it('should parse a table with multiple columns (per 100g and per serving)', () => {
      const text = `
        Valores nutricionales
        Por 100 ml | Por vaso (200 ml)
        Energía 199 kJ / 47 kcal | 399 kJ / 94 kcal
        Grasas 0 g | 0 g
        de las cuales saturadas 0 g | 0 g
        Carbohidratos 11 g | 22 g
        de los cuales azúcares 10 g | 20 g
        Fibra 0,7 g | 1,4 g
        Proteínas 0,4 g | 0,8 g
        Sal 0 g | 0 g
      `;

      const result = parseNutritionTable(text);
      
      assert.ok(result !== null, 'Should parse multi-column table');
      assert.strictEqual(result.calories, 47, 'Should extract calories from first column');
      assert.strictEqual(result.fat, 0, 'Should extract fat');
      assert.strictEqual(result.carbs, 11, 'Should extract carbs');
      assert.strictEqual(result.sugars, 10, 'Should extract sugars');
      assert.strictEqual(result.protein, 0.4, 'Should extract protein');
    });

    it('should parse a table with per serving column', () => {
      const text = `
        Información nutricional
        Por 30g (1 barrita)
        Energía: 688 kJ / 165 kcal
        Grasas: 10 g
        Carbohidratos: 16 g
        Azúcares: 14 g
        Proteínas: 2,0 g
        Sal: 0,05 g
      `;

      const result = parseNutritionTable(text);
      
      assert.ok(result !== null, 'Should parse per serving table');
      assert.strictEqual(result.calories, 165, 'Should extract calories');
      assert.strictEqual(result.fat, 10, 'Should extract fat');
      assert.strictEqual(result.carbs, 16, 'Should extract carbs');
      assert.strictEqual(result.sugars, 14, 'Should extract sugars');
      assert.strictEqual(result.protein, 2.0, 'Should extract protein');
      assert.strictEqual(result.salt, 0.05, 'Should extract salt');
    });

    it('should handle missing values gracefully', () => {
      const text = `
        Tabla nutricional
        Energía: 2292 kJ / 549 kcal
        Grasas: 33 g
        Carbohidratos: 55 g
      `;

      const result = parseNutritionTable(text);
      
      assert.ok(result !== null, 'Should parse partial table');
      assert.strictEqual(result.calories, 549, 'Should extract calories');
      assert.strictEqual(result.fat, 33, 'Should extract fat');
      assert.strictEqual(result.carbs, 55, 'Should extract carbs');
      assert.strictEqual(result.saturatedFat, 0, 'Missing saturated fat should be 0');
      assert.strictEqual(result.sugars, 0, 'Missing sugars should be 0');
      assert.strictEqual(result.fiber, 0, 'Missing fiber should be 0');
      assert.strictEqual(result.protein, 0, 'Missing protein should be 0');
      assert.strictEqual(result.salt, 0, 'Missing salt should be 0');
    });

    it('should handle European language variants', () => {
      const text = `
        Nährwertdeklaration
        Energie: 2292 kJ / 549 kcal
        Fett: 33 g
        davon gesättigte Fettsäuren: 13 g
        Kohlenhydrate: 55 g
        davon Zucker: 45 g
        Ballaststoffe: 2,4 g
        Eiweiß: 6,8 g
        Salz: 0,18 g
      `;

      const result = parseNutritionTable(text);
      
      assert.ok(result !== null, 'Should parse German nutrition table');
      assert.strictEqual(result.calories, 549, 'Should extract calories');
      assert.strictEqual(result.fat, 33, 'Should extract fat');
      assert.strictEqual(result.saturatedFat, 13, 'Should extract saturated fat');
      assert.strictEqual(result.carbs, 55, 'Should extract carbs');
      assert.strictEqual(result.sugars, 45, 'Should extract sugars');
      assert.strictEqual(result.fiber, 2.4, 'Should extract fiber');
      assert.strictEqual(result.protein, 6.8, 'Should extract protein');
      assert.strictEqual(result.salt, 0.18, 'Should extract salt');
    });

    it('should handle Dutch language variants', () => {
      const text = `
        Voedingswaarde per 100 ml
        energie: 199 kJ / 47 kcal
        vetten: 0 g
        waarvan verzadigde vetzuren: 0 g
        koolhydraten: 11 g
        waarvan suikers: 10 g
        vezels: 0,7 g
        eiwitten: 0,4 g
        zout: 0 g
      `;

      const result = parseNutritionTable(text);
      
      assert.ok(result !== null, 'Should parse Dutch nutrition table');
      assert.strictEqual(result.calories, 47, 'Should extract calories');
      assert.strictEqual(result.fat, 0, 'Should extract fat');
      assert.strictEqual(result.saturatedFat, 0, 'Should extract saturated fat');
      assert.strictEqual(result.carbs, 11, 'Should extract carbs');
      assert.strictEqual(result.sugars, 10, 'Should extract sugars');
      assert.strictEqual(result.fiber, 0.7, 'Should extract fiber');
      assert.strictEqual(result.protein, 0.4, 'Should extract protein');
      assert.strictEqual(result.salt, 0, 'Should extract salt');
    });

    it('should return null for non-nutrition text', () => {
      const text = `
        Esta es una lista de ingredientes
        No tiene información nutricional
        Solo texto normal
      `;

      const result = parseNutritionTable(text);
      
      assert.strictEqual(result, null, 'Should return null for non-nutrition text');
    });

    it('should handle comma as decimal separator', () => {
      const text = `
        Tabla nutricional
        Energía: 2292 kJ / 549 kcal
        Grasas: 33,5 g
        Carbohidratos: 55,25 g
        Proteínas: 6,8 g
      `;

      const result = parseNutritionTable(text);
      
      assert.ok(result !== null, 'Should parse table with comma decimals');
      assert.strictEqual(result.fat, 33.5, 'Should handle comma decimal for fat');
      assert.strictEqual(result.carbs, 55.25, 'Should handle comma decimal for carbs');
      assert.strictEqual(result.protein, 6.8, 'Should handle comma decimal for protein');
    });

    it('should handle both kJ and kcal', () => {
      const text = `
        Tabla nutricional
        Energía: 2292 kJ / 549 kcal
      `;

      const result = parseNutritionTable(text);
      
      assert.ok(result !== null, 'Should parse both kJ and kcal');
      assert.strictEqual(result.calories, 549, 'Should prefer kcal');
      assert.strictEqual(result.kilojoules, 2292, 'Should also store kJ');
    });
  });

  describe('parseIngredients', () => {
    it('should parse a simple ingredient list', () => {
      const text = `
        Ingredientes: agua, azúcar, jugo de naranja concentrado, ácido cítrico
      `;

      const result = parseIngredients(text);
      
      assert.ok(Array.isArray(result), 'Should return an array');
      assert.strictEqual(result.length, 4, 'Should parse 4 ingredients');
      assert.strictEqual(result[0], 'agua', 'First ingredient should be agua');
      assert.strictEqual(result[1], 'azúcar', 'Second ingredient should be azúcar');
    });

    it('should parse ingredients with percentages', () => {
      const text = `
        Ingredientes: 45% manzana, 35% naranja, 20% mango, antioxidante (ácido ascórbico)
      `;

      const result = parseIngredients(text);
      
      assert.ok(Array.isArray(result), 'Should return an array');
      assert.ok(result.length >= 4, 'Should parse at least 4 ingredients');
      assert.ok(result.some(i => i.includes('manzana')), 'Should include manzana');
      assert.ok(result.some(i => i.includes('naranja')), 'Should include naranja');
    });

    it('should handle empty ingredient list', () => {
      const text = 'Sin ingredientes listados';

      const result = parseIngredients(text);
      
      assert.ok(Array.isArray(result), 'Should return an array');
      assert.strictEqual(result.length, 0, 'Should return empty array');
    });

    it('should handle ingredients with parentheses', () => {
      const text = `
        Ingredientes: harina de trigo (harina de trigo, hierro), levadura, sal yodada
      `;

      const result = parseIngredients(text);
      
      assert.ok(Array.isArray(result), 'Should return an array');
      assert.ok(result.length >= 3, 'Should parse multiple ingredients');
    });
  });

  describe('normalizeNutritionValues', () => {
    it('should normalize values to per 100g', () => {
      const nutrition = {
        calories: 100,
        fat: 5,
        carbs: 20,
        protein: 3,
        servingSize: 50,
        servingUnit: 'g'
      };

      const normalized = normalizeNutritionValues(nutrition);
      
      assert.strictEqual(normalized.calories, 200, 'Should double calories for 100g');
      assert.strictEqual(normalized.fat, 10, 'Should double fat for 100g');
      assert.strictEqual(normalized.carbs, 40, 'Should double carbs for 100g');
      assert.strictEqual(normalized.protein, 6, 'Should double protein for 100g');
    });

    it('should not normalize if already per 100g', () => {
      const nutrition = {
        calories: 549,
        fat: 33,
        carbs: 55,
        protein: 6.8,
        servingSize: 100,
        servingUnit: 'g'
      };

      const normalized = normalizeNutritionValues(nutrition);
      
      assert.strictEqual(normalized.calories, 549, 'Should keep calories');
      assert.strictEqual(normalized.fat, 33, 'Should keep fat');
      assert.strictEqual(normalized.carbs, 55, 'Should keep carbs');
      assert.strictEqual(normalized.protein, 6.8, 'Should keep protein');
    });

    it('should handle serving size of 0', () => {
      const nutrition = {
        calories: 100,
        fat: 5,
        carbs: 20,
        protein: 3,
        servingSize: 0,
        servingUnit: 'g'
      };

      const normalized = normalizeNutritionValues(nutrition);
      
      assert.strictEqual(normalized.calories, 100, 'Should keep calories when serving is 0');
    });
  });
});