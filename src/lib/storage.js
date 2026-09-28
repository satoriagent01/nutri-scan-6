/**
 * LocalStorage wrapper for persistent data storage
 * Handles products, meals, and user preferences
 */

const STORAGE_KEYS = {
  PRODUCTS: 'nutriscan_products',
  MEALS: 'nutriscan_meals',
  PREFERENCES: 'nutriscan_preferences'
};

/**
 * Get all products from storage
 * @returns {Array} - Array of product objects
 */
export function getProducts() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading products:', e);
    return [];
  }
}

/**
 * Save a product to storage
 * @param {Object} product - Product object
 * @returns {boolean} - Success status
 */
export function saveProduct(product) {
  try {
    const products = getProducts();
    // Check if product already exists (by name)
    const existingIndex = products.findIndex(p => p.name === product.name);
    if (existingIndex >= 0) {
      products[existingIndex] = { ...products[existingIndex], ...product, updatedAt: new Date().toISOString() };
    } else {
      products.push({ ...product, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return true;
  } catch (e) {
    console.error('Error saving product:', e);
    return false;
  }
}

/**
 * Delete a product from storage
 * @param {string} productId - Product ID
 * @returns {boolean} - Success status
 */
export function deleteProduct(productId) {
  try {
    const products = getProducts().filter(p => p.id !== productId);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return true;
  } catch (e) {
    console.error('Error deleting product:', e);
    return false;
  }
}

/**
 * Get all meals from storage
 * @returns {Array} - Array of meal objects
 */
export function getMeals() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MEALS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading meals:', e);
    return [];
  }
}

/**
 * Save a meal to storage
 * @param {Object} meal - Meal object
 * @returns {boolean} - Success status
 */
export function saveMeal(meal) {
  try {
    const meals = getMeals();
    const existingIndex = meals.findIndex(m => m.id === meal.id);
    if (existingIndex >= 0) {
      meals[existingIndex] = { ...meal, updatedAt: new Date().toISOString() };
    } else {
      meals.push({ ...meal, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
    return true;
  } catch (e) {
    console.error('Error saving meal:', e);
    return false;
  }
}

/**
 * Delete a meal from storage
 * @param {string} mealId - Meal ID
 * @returns {boolean} - Success status
 */
export function deleteMeal(mealId) {
  try {
    const meals = getMeals().filter(m => m.id !== mealId);
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
    return true;
  } catch (e) {
    console.error('Error deleting meal:', e);
    return false;
  }
}

/**
 * Get user preferences
 * @returns {Object} - Preferences object
 */
export function getPreferences() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return data ? JSON.parse(data) : getDefaultPreferences();
  } catch (e) {
    console.error('Error reading preferences:', e);
    return getDefaultPreferences();
  }
}

/**
 * Save user preferences
 * @param {Object} preferences - Preferences object
 * @returns {boolean} - Success status
 */
export function savePreferences(preferences) {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
    return true;
  } catch (e) {
    console.error('Error saving preferences:', e);
    return false;
  }
}

/**
 * Get default preferences
 * @returns {Object} - Default preferences
 */
function getDefaultPreferences() {
  return {
    dailyCalorieTarget: 2000,
    dailyProteinTarget: 50,
    dailyFatTarget: 65,
    dailyCarbsTarget: 275,
    dailyFiberTarget: 25,
    dailySugarTarget: 50,
    dailySaltTarget: 6,
    preferredLanguage: 'de'
  };
}

/**
 * Clear all storage data
 * @returns {boolean} - Success status
 */
export function clearAll() {
  try {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.MEALS);
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    return true;
  } catch (e) {
    console.error('Error clearing storage:', e);
    return false;
  }
}

/**
 * Export all data as JSON
 * @returns {string} - JSON string of all data
 */
export function exportData() {
  return JSON.stringify({
    products: getProducts(),
    meals: getMeals(),
    preferences: getPreferences()
  }, null, 2);
}

/**
 * Import data from JSON string
 * @param {string} data - JSON string
 * @returns {boolean} - Success status
 */
export function importData(data) {
  try {
    const parsed = JSON.parse(data);
    if (parsed.products) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(parsed.products));
    }
    if (parsed.meals) {
      localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(parsed.meals));
    }
    if (parsed.preferences) {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(parsed.preferences));
    }
    return true;
  } catch (e) {
    console.error('Error importing data:', e);
    return false;
  }
}