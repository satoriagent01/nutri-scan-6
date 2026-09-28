/**
 * ProductList component - displays list of scanned products
 */

import { h, Component } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { getProducts, deleteProduct } from '../../lib/storage.js';

export default class ProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      searchQuery: '',
      selectedProduct: null
    };
  }

  componentDidMount() {
    this.loadProducts();
  }

  loadProducts() {
    const products = getProducts();
    this.setState({ products });
  }

  handleSearch(query) {
    this.setState({ searchQuery: query });
  }

  handleProductClick(product) {
    this.props.onNavigate('product-detail', { product });
  }

  handleDelete(productId, event) {
    event.stopPropagation();
    if (confirm('¿Eliminar este producto?')) {
      deleteProduct(productId);
      this.loadProducts();
    }
  }

  getFilteredProducts() {
    const { products, searchQuery } = this.state;
    if (!searchQuery) return products;
    
    const query = searchQuery.toLowerCase();
    return products.filter(p => 
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.brand && p.brand.toLowerCase().includes(query))
    );
  }

  renderNutritionSummary(items) {
    if (!items || items.length === 0) return null;
    
    // Find the first item (usually per 100g or per serving)
    const firstItem = items[0];
    return (
      <div class="nutrition-mini">
        <span class="nutrition-item">
          <strong>{firstItem.calories || 0}</strong> kcal
        </span>
        <span class="nutrition-item">
          {firstItem.fat || 0}g grasa
        </span>
        <span class="nutrition-item">
          {firstItem.carbs || 0}g carb
        </span>
        <span class="nutrition-item">
          {firstItem.protein || 0}g prot
        </span>
      </div>
    );
  }

  render() {
    const { products, searchQuery } = this.state;
    const filtered = this.getFilteredProducts();

    return (
      <div class="product-list">
        <div class="product-list-header">
          <h2>📦 Productos Escaneados</h2>
          <span class="product-count">{products.length} productos</span>
        </div>

        <div class="search-bar">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchQuery}
            onInput={(e) => this.handleSearch(e.target.value)}
            class="search-input"
          />
        </div>

        {filtered.length === 0 ? (
          <div class="empty-state">
            <p class="empty-icon">📷</p>
            <p>No hay productos escaneados</p>
            <p class="empty-hint">
              {products.length === 0 
                ? 'Escanea tu primera etiqueta nutricional' 
                : 'No se encontraron resultados'}
            </p>
          </div>
        ) : (
          <div class="products-grid">
            {filtered.map(product => (
              <div 
                key={product.id} 
                class="product-card"
                onClick={() => this.handleProductClick(product)}
              >
                <div class="product-card-header">
                  <h3 class="product-name">{product.name || 'Producto sin nombre'}</h3>
                  {product.brand && <span class="product-brand">{product.brand}</span>}
                </div>
                
                {product.imageUrl && (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    class="product-image"
                  />
                )}

                {this.renderNutritionSummary(product.items)}

                {product.servingSize && (
                  <div class="serving-info">
                    Porción: {product.servingSize}{product.servingUnit || 'g'}
                  </div>
                )}

                <div class="product-date">
                  {new Date(product.scannedAt).toLocaleDateString('es-ES')}
                </div>

                <button 
                  class="btn-delete"
                  onClick={(e) => this.handleDelete(product.id, e)}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}