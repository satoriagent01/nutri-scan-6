/**
 * Tests for storage module
 */

import { describe, it, assert, beforeEach } from 'node:test';
import { 
  getProducts, 
  saveProduct, 
  deleteProduct, 
  getMeals, 
  saveMeal, 
  deleteMeal, 
  getDailyTotals,
  clearAllData
} from '../../src/lib/storage.js';

describe('Storage Module', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('getProducts', () => {
    it('should return empty array when no products exist', () => {
      const products = getProducts();
      assert.ok(Array.isArray(products), 'Should return an array');
      assert.strictEqual(products.length, 0, 'Should be empty');
    });

    it('should return saved products', () => {
      const product = {
        id: 'test-1',
        name: 'Test Product',
        nutrition: { calories: 100, fat: 5, carbs: 20, protein: 3 },
        ingredients: ['ingredient1', 'ingredient2'],
        createdAt: new Date().toISOString()
      };

      saveProduct(product);
      const products = getProducts();
      
      assert.strictEqual(products.length, 1, 'Should have one product');
      assert.strictEqual(products[0].name, 'Test Product', 'Should have correct name');
    });
  });

  describe('saveProduct', () => {
    it('should save a product with all fields', () => {
      const product = {
        id: 'test-2',
        name: 'Chocolate Bar',
        nutrition: { 
          calories: 549, 
          fat: 33, 
          carbs: 55, 
          protein: 6.8,
          sugar: 45,
          fiber: 2.4,
          salt: 0.18
        },
        ingredients: ['chocolate', 'sugar', 'milk'],
        createdAt: new Date().toISOString()
      };

      saveProduct(product);
      const products = getProducts();
      
      assert.strictEqual(products.length, 1, 'Should have one product');
      assert.strictEqual(products[0].name, 'Chocolate Bar', 'Should save name');
      assert.strictEqual(products[0].nutrition.calories, 549, 'Should save calories');
      assert.strictEqual(products[0].nutrition.fat, 33, 'Should save fat');
      assert.ok(Array.isArray(products[0].ingredients), 'Should save ingredients array');
    });

    it('should update existing product', () => {
      const product1 = {
        id: 'test-3',
        name: 'Original Name',
        nutrition: { calories: 100 },
        ingredients: [],
        createdAt: new Date().toISOString()
      };

      saveProduct(product1);
      
      const product2 = {
        id: 'test-3',
        name: 'Updated Name',
        nutrition: { calories: 200 },
        ingredients: ['new ingredient'],
        createdAt: new Date().toISOString()
      };

      saveProduct(product2);
      const products = getProducts();
      
      assert.strictEqual(products.length, 1, 'Should still have one product');
      assert.strictEqual(products[0].name, 'Updated Name', 'Should update name');
      assert.strictEqual(products[0].nutrition.calories, 200, 'Should update calories');
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product by id', () => {
      const product = {
        id: 'test-4',
        name: 'To Delete',
        nutrition: { calories: 100 },
        ingredients: [],
        createdAt: new Date().toISOString()
      };

      saveProduct(product);
      assert.strictEqual(getProducts().length, 1, 'Should have one product');

      deleteProduct('test-4');
      assert.strictEqual(getProducts().length, 0, 'Should have no products');
    });

    it('should not throw when deleting non-existent product', () => {
      assert.doesNotThrow(() => deleteProduct('non-existent-id'), 'Should not throw');
    });
  });

  describe('getMeals', () => {
    it('should return empty array when no meals exist', () => {
      const meals = getMeals();
      assert.ok(Array.isArray(meals), 'Should return an array');
      assert.strictEqual(meals.length, 0, 'Should be empty');
    });

    it('should return saved meals', () => {
      const meal = {
        id: 'meal-1',
        name: 'Breakfast',
        date: new Date().toISOString(),
        ingredients: [
          { productId: 'test-1', amount: 100, unit: 'g' }
        ]
      };

      saveMeal(meal);
      const meals = getMeals();
      
      assert.strictEqual(meals.length, 1, 'Should have one meal');
      assert.strictEqual(meals[0].name, 'Breakfast', 'Should have correct name');
    });
  });

  describe('saveMeal', () => {
    it('should save a meal with ingredients', () => {
      const meal = {
        id: 'meal-2',
        name: 'Lunch',
        date: new Date().toISOString(),
        ingredients: [
          { productId: 'prod-1', amount: 150, unit: 'g' },
          { productId: 'prod-2', amount: 200, unit: 'g' }
        ]
      };

      saveMeal(meal);
      const meals = getMeals();
      
      assert.strictEqual(meals.length, 1, 'Should have one meal');
      assert.strictEqual(meals[0].ingredients.length, 2, 'Should have two ingredients');
      assert.strictEqual(meals[0].ingredients[0].amount, 150, 'Should save first ingredient amount');
    });
  });

  describe('deleteMeal', () => {
    it('should delete a meal by id', () => {
      const meal = {
        id: 'meal-3',
        name: 'Dinner',
        date: new Date().toISOString(),
        ingredients: []
      };

      saveMeal(meal);
      assert.strictEqual(getMeals().length, 1, 'Should have one meal');

      deleteMeal('meal-3');
      assert.strictEqual(getMeals().length, 0, 'Should have no meals');
    });
  });

  describe('getDailyTotals', () => {
    it('should calculate totals from meals', () => {
      // Save a product first
      const product = {
        id: 'daily-test-1',
        name: 'Test Food',
        nutrition: { 
          calories: 200, 
          fat: 10, 
          carbs: 30, 
          protein: 5,
          sugar: 15,
          fiber: 2,
          salt: 0.5
        },
        ingredients: [],
        createdAt: new Date().toISOString()
      };
      saveProduct(product);

      // Save a meal with 100g of the product
      const meal = {
        id: 'daily-meal-1',
        name: 'Test Meal',
        date: new Date().toISOString(),
        ingredients: [
          { productId: 'daily-test-1', amount: 100, unit: 'g' }
        ]
      };
      saveMeal(meal);

      const totals = getDailyTotals();
      
      assert.ok(totals !== null, 'Should return totals object');
      assert.strictEqual(totals.calories, 200, 'Should calculate calories');
      assert.strictEqual(totals.fat, 10, 'Should calculate fat');
      assert.strictEqual(totals.carbs, 30, 'Should calculate carbs');
      assert.strictEqual(totals.protein, 5, 'Should calculate protein');
    });

    it('should return zero totals when no meals exist', () => {
      const totals = getDailyTotals();
      
      assert.ok(totals !== null, 'Should return totals object');
      assert.strictEqual(totals.calories, 0, 'Should have zero calories');
      assert.strictEqual(totals.fat, 0, 'Should have zero fat');
      assert.strictEqual(totals.carbs, 0, 'Should have zero carbs');
      assert.strictEqual(totals.protein, 0, 'Should have zero protein');
    });

    it('should sum multiple meals', () => {
      // Save two products
      const product1 = {
        id: 'multi-test-1',
        name: 'Food A',
        nutrition: { calories: 100, fat: 5, carbs: 15, protein: 3 },
        ingredients: [],
        createdAt: new Date().toISOString()
      };
      const product2 = {
        id: 'multi-test-2',
        name: 'Food B',
        nutrition: { calories: 150, fat: 8, carbs: 20, protein: 4 },
        ingredients: [],
        createdAt: new Date().toISOString()
      };
      saveProduct(product1);
      saveProduct(product2);

      // Save two meals
      const meal1 = {
        id: 'multi-meal-1',
        name: 'Meal A',
        date: new Date().toISOString(),
        ingredients: [
          { productId: 'multi-test-1', amount: 100, unit: 'g' }
        ]
      };
      const meal2 = {
        id: 'multi-meal-2',
        name: 'Meal B',
        date: new Date().toISOString(),
        ingredients: [
          { productId: 'multi-test-2', amount: 100, unit: 'g' }
        ]
      };
      saveMeal(meal1);
      saveMeal(meal2);

      const totals = getDailyTotals();
      
      assert.strictEqual(totals.calories, 250, 'Should sum calories from both meals');
      assert.strictEqual(totals.fat, 13, 'Should sum fat from both meals');
      assert.strictEqual(totals.carbs, 35, 'Should sum carbs from both meals');
      assert.strictEqual(totals.protein, 7, 'Should sum protein from both meals');
    });
  });

  describe('clearAllData', () => {
    it('should clear all products and meals', () => {
      saveProduct({
        id: 'clear-test-1',
        name: 'Clear Me',
        nutrition: { calories: 100 },
        ingredients: [],
        createdAt: new Date().toISOString()
      });
      saveMeal({
        id: 'clear-meal-1',
        name: 'Clear Meal',
        date: new Date().toISOString(),
        ingredients: []
      });

      assert.strictEqual(getProducts().length, 1, 'Should have one product before clear');
      assert.strictEqual(getMeals().length, 1, 'Should have one meal before clear');

      clearAllData();

      assert.strictEqual(getProducts().length, 0, 'Should have no products after clear');
      assert.strictEqual(getMeals().length, 0, 'Should have no meals after clear');
    });
  });
});