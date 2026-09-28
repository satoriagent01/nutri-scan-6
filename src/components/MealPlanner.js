/**
 * MealPlanner component - build meals from scanned products
 */

import { h, Component } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { getProducts, getMeals, addMeal, deleteMeal, getMealTotal } from '../../lib/storage.js';

export default class MealPlanner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      meals: [],
      currentMeal: {
        name: '',
        items: [],
        date: new Date().toISOString().split('T')[0]
      },
      selectedProduct: null,
      servingAmount: 100,
      showProductPicker: false
    };
  }

  componentDidMount() {
    this.loadProducts();
    this.loadMeals();
    
    // Check if a product was passed from navigation
    if (this.props.product) {
      this.setState({ selectedProduct: this.props.product });
    }
  }

  loadProducts() {
    const products = getProducts();
    this.setState({ products });
  }

  loadMeals() {
    const meals = getMeals();
    this.setState({ meals });
  }

  handleProductSelect(product) {
    this.setState({ selectedProduct: product, showProductPicker: false });
  }

  handleAddToMeal() {
    const { selectedProduct, servingAmount } = this.state;
    if (!selectedProduct) return;

    const newItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      servingGrams: servingAmount,
      nutrition: this.calculateItemNutrition(selectedProduct, servingAmount)
    };

    const updatedMeal = {
      ...this.state.currentMeal,
      items: [...this.state.currentMeal.items, newItem]
    };

    this.setState({ 
      currentMeal: updatedMeal,
      selectedProduct: null,
      servingAmount: 100
    });
  }

  calculateItemNutrition(product, grams) {
    if (!product.items || product.items.length === 0) return {};
    
    const baseItem = product.items[0];
    const baseGrams = parseFloat(baseItem.servingSize) || 100;
    const multiplier = grams / baseGrams;

    return {
      calories: (baseItem.calories || 0) * multiplier,
      fat: (baseItem.fat || 0) * multiplier,
      saturatedFat: (baseItem.saturatedFat || 0) * multiplier,
      carbs: (baseItem.carbs || 0) * multiplier,
      sugars: (baseItem.sugars || 0) * multiplier,
      fiber: (baseItem.fiber || 0) * multiplier,
      protein: (baseItem.protein || 0) * multiplier,
      salt: (baseItem.salt || 0) * multiplier,
      sodium: (baseItem.sodium || 0) * multiplier
    };
  }

  handleRemoveItem(index) {
    const updatedItems = [...this.state.currentMeal.items];
    updatedItems.splice(index, 1);
    this.setState({
      currentMeal: { ...this.state.currentMeal, items: updatedItems }
    });
  }

  handleSaveMeal() {
    const { currentMeal } = this.state;
    if (currentMeal.items.length === 0) {
      alert('Agrega al menos un producto a la comida');
      return;
    }

    addMeal(currentMeal);
    this.setState({
      currentMeal: {
        name: '',
        items: [],
        date: new Date().toISOString().split('T')[0]
      }
    });
    this.loadMeals();
  }

  handleDeleteMeal(mealId) {
    if (confirm('¿Eliminar esta comida?')) {
      deleteMeal(mealId);
      this.loadMeals();
    }
  }

  getTotalNutrition() {
    return getMealTotal(this.state.currentMeal);
  }

  renderProductPicker() {
    const { products, selectedProduct } = this.state;

    return (
      <div class="product-picker">
        <h3>Seleccionar Producto</h3>
        <input
          type="text"
          placeholder="Buscar..."
          class="search-input"
          onInput={(e) => this.setState({ searchQuery: e.target.value })}
        />
        <div class="product-grid">
          {products.map(product => (
            <div 
              key={product.id}
              class={`product-option ${selectedProduct?.id === product.id ? 'selected' : ''}`}
              onClick={() => this.handleProductSelect(product)}
            >
              <div class="product-option-name">{product.name || 'Sin nombre'}</div>
              {product.brand && <div class="product-option-brand">{product.brand}</div>}
              {product.items && product.items[0] && (
                <div class="product-option-nutrition">
                  {product.items[0].calories} kcal/100g
                </div>
              )}
            </div>
          ))}
        </div>
        <button 
          class="btn-secondary" 
          onClick={() => this.setState({ showProductPicker: false })}
        >
          Cancelar
        </button>
      </div>
    );
  }

  renderMealItems() {
    const { currentMeal } = this.state;

    if (currentMeal.items.length === 0) {
      return (
        <div class="empty-state">
          <p class="empty-icon">🍽️</p>
          <p>Agrega productos a tu comida</p>
        </div>
      );
    }

    return (
      <div class="meal-items">
        {currentMeal.items.map((item, index) => (
          <div key={index} class="meal-item">
            <div class="meal-item-info">
              <strong>{item.productName}</strong>
              <span class="meal-item-grams">{item.servingGrams}g</span>
            </div>
            <div class="meal-item-nutrition">
              {item.nutrition.calories?.toFixed(0)} kcal
            </div>
            <button 
              class="btn-remove"
              onClick={() => this.handleRemoveItem(index)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    );
  }

  renderMealTotals() {
    const totals = this.getTotalNutrition();

    return (
      <div class="meal-totals">
        <h3>Total de la Comida</h3>
        <div class="totals-grid">
          <div class="total-item">
            <span class="total-value">{totals.calories?.toFixed(0)}</span>
            <span class="total-label">kcal</span>
          </div>
          <div class="total-item">
            <span class="total-value">{totals.fat?.toFixed(1)}</span>
            <span class="total-label">g grasa</span>
          </div>
          <div class="total-item">
            <span class="total-value">{totals.carbs?.toFixed(1)}</span>
            <span class="total-label">g carb</span>
          </div>
          <div class="total-item">
            <span class="total-value">{totals.protein?.toFixed(1)}</span>
            <span class="total-label">g prot</span>
          </div>
        </div>
      </div>
    );
  }

  renderSavedMeals() {
    const { meals } = this.state;

    if (meals.length === 0) return null;

    return (
      <div class="saved-meals">
        <h3>Comidas Guardadas</h3>
        {meals.map(meal => (
          <div key={meal.id} class="saved-meal">
            <div class="saved-meal-info">
              <strong>{meal.name || 'Comida sin nombre'}</strong>
              <span class="saved-meal-date">{new Date(meal.date).toLocaleDateString('es-ES')}</span>
            </div>
            <div class="saved-meal-items">
              {meal.items.map((item, i) => (
                <span key={i} class="saved-meal-item">
                  {item.productName} ({item.servingGrams}g)
                </span>
              ))}
            </div>
            <button 
              class="btn-delete-small"
              onClick={() => this.handleDeleteMeal(meal.id)}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    );
  }

  render() {
    const { currentMeal, selectedProduct, servingAmount } = this.state;

    return (
      <div class="meal-planner">
        <div class="planner-header">
          <button class="btn-back" onClick={() => this.props.onNavigate('dashboard')}>
            ← Volver
          </button>
          <h2>🍽️ Planificador de Comidas</h2>
        </div>

        <div class="meal-name-input">
          <input
            type="text"
            placeholder="Nombre de la comida (ej: Almuerzo)"
            value={currentMeal.name}
            onInput={(e) => this.setState({
              currentMeal: { ...currentMeal, name: e.target.value }
            })}
            class="meal-name-field"
          />
        </div>

        <div class="add-product-section">
          {!selectedProduct ? (
            <button 
              class="btn-primary"
              onClick={() => this.setState({ showProductPicker: true })}
            >
              ➕ Agregar Producto
            </button>
          ) : (
            <div class="selected-product">
              <div class="product-info">
                <strong>{selectedProduct.name}</strong>
                {selectedProduct.brand && <span> - {selectedProduct.brand}</span>}
              </div>
              <div class="serving-control">
                <label>Cantidad (g):</label>
                <input
                  type="number"
                  value={servingAmount}
                  min="1"
                  step="10"
                  onInput={(e) => this.setState({ servingAmount: parseInt(e.target.value) || 0 })}
                  class="serving-input"
                />
              </div>
              <div class="selected-actions">
                <button 
                  class="btn-add"
                  onClick={() => this.handleAddToMeal()}
                >
                  Agregar
                </button>
                <button 
                  class="btn-cancel"
                  onClick={() => this.setState({ selectedProduct: null })}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {this.renderMealItems()}
        {this.renderMealTotals()}

        {currentMeal.items.length > 0 && (
          <button 
            class="btn-primary full-width"
            onClick={() => this.handleSaveMeal()}
          >
            💾 Guardar Comida
          </button>
        )}

        {this.renderSavedMeals()}
      </div>
    );
  }
}