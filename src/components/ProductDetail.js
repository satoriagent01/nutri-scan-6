/**
 * ProductDetail component - detailed view of a single scanned product
 */

import { h, Component } from 'preact';
import { useState } from 'preact/hooks';
import { deleteProduct } from '../../lib/storage.js';

export default class ProductDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      product: props.product || null,
      servingMultiplier: 1,
      showIngredients: false
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.product !== this.props.product) {
      this.setState({ product: this.props.product, servingMultiplier: 1 });
    }
  }

  handleServingChange(multiplier) {
    this.setState({ servingMultiplier: multiplier });
  }

  handleDelete() {
    if (this.state.product && confirm('¿Eliminar este producto?')) {
      deleteProduct(this.state.product.id);
      this.props.onNavigate('products');
    }
  }

  handleAddToMeal() {
    if (this.state.product) {
      this.props.onNavigate('meal-planner', { 
        product: this.state.product,
        servingMultiplier: this.state.servingMultiplier
      });
    }
  }

  getNutritionValues() {
    const { product, servingMultiplier } = this.state;
    if (!product || !product.items || product.items.length === 0) return null;

    // Use the first item as base (usually per 100g or per serving)
    const baseItem = product.items[0];
    const multiplier = servingMultiplier;

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

  renderNutritionRow(label, value, unit, color) {
    return (
      <div class="nutrition-row">
        <span class="nutrition-label">{label}</span>
        <span class="nutrition-value" style={{ color }}>
          {value.toFixed(1)}{unit}
        </span>
      </div>
    );
  }

  render() {
    const { product } = this.state;
    if (!product) {
      return (
        <div class="product-detail">
          <h2>Producto no encontrado</h2>
          <button class="btn-secondary" onClick={() => this.props.onNavigate('products')}>
            Volver
          </button>
        </div>
      );
    }

    const nutrition = this.getNutritionValues();
    const servingText = product.servingSize 
      ? `${product.servingSize}${product.servingUnit || 'g'}` 
      : 'Porción';

    return (
      <div class="product-detail">
        <div class="detail-header">
          <button class="btn-back" onClick={() => this.props.onNavigate('products')}>
            ← Volver
          </button>
          <button class="btn-delete" onClick={() => this.handleDelete()}>
            🗑️
          </button>
        </div>

        <div class="product-info">
          <h2>{product.name || 'Producto sin nombre'}</h2>
          {product.brand && <p class="brand">{product.brand}</p>}
          
          {product.imageUrl && (
            <img src={product.imageUrl} alt={product.name} class="detail-image" />
          )}
        </div>

        <div class="serving-selector">
          <h3>Seleccionar porción</h3>
          <div class="serving-buttons">
            <button 
              class={this.state.servingMultiplier === 0.5 ? 'active' : ''}
              onClick={() => this.handleServingChange(0.5)}
            >
              ½ {servingText}
            </button>
            <button 
              class={this.state.servingMultiplier === 1 ? 'active' : ''}
              onClick={() => this.handleServingChange(1)}
            >
              1 {servingText}
            </button>
            <button 
              class={this.state.servingMultiplier === 2 ? 'active' : ''}
              onClick={() => this.handleServingChange(2)}
            >
              2 {servingText}
            </button>
          </div>
        </div>

        {nutrition && (
          <div class="nutrition-detail">
            <h3>Información Nutricional</h3>
            
            <div class="nutrition-main">
              {this.renderNutritionRow('Calorías', nutrition.calories, ' kcal', '#ff6b35')}
              {this.renderNutritionRow('Grasa', nutrition.fat, ' g', '#4ecdc4')}
              {this.renderNutritionRow('Grasa Saturada', nutrition.saturatedFat, ' g', '#45b7d1')}
              {this.renderNutritionRow('Carbohidratos', nutrition.carbs, ' g', '#96ceb4')}
              {this.renderNutritionRow('Azúcares', nutrition.sugars, ' g', '#ffeaa7')}
              {this.renderNutritionRow('Fibra', nutrition.fiber, ' g', '#a29bfe')}
              {this.renderNutritionRow('Proteína', nutrition.protein, ' g', '#fd79a8')}
              {this.renderNutritionRow('Sal', nutrition.salt, ' g', '#dfe6e9')}
              {this.renderNutritionRow('Sodio', nutrition.sodium, ' mg', '#b2bec3')}
            </div>
          </div>
        )}

        {product.ingredients && product.ingredients.length > 0 && (
          <div class="ingredients-section">
            <button 
              class="btn-toggle"
              onClick={() => this.setState(s => ({ showIngredients: !s.showIngredients }))}
            >
              {this.state.showIngredients ? '▲' : '▼'} Ingredientes
            </button>
            {this.state.showIngredients && (
              <div class="ingredients-list">
                {product.ingredients.map((ing, i) => (
                  <span key={i} class="ingredient-tag">{ing}</span>
                ))}
              </div>
            )}
          </div>
        )}

        <button class="btn-primary full-width" onClick={() => this.handleAddToMeal()}>
          ➕ Agregar a mi comida
        </button>

        <div class="scan-date">
          Escaneado el {new Date(product.scannedAt).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    );
  }
}