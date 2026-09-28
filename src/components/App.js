/**
 * Main App component with navigation
 * Handles routing between different views
 */

import { h, Component, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Camera from './Camera.js';
import NutritionScan from './NutritionScan.js';
import ProductList from './ProductList.js';
import ProductDetail from './ProductDetail.js';
import MealPlanner from './MealPlanner.js';
import Dashboard from './Dashboard.js';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentView: 'dashboard',
      selectedProduct: null,
      selectedMeal: null
    };
  }

  navigate(view, data = null) {
    this.setState({ currentView: view, selectedProduct: data?.product || null, selectedMeal: data?.meal || null });
  }

  render() {
    const { currentView, selectedProduct, selectedMeal } = this.state;

    return (
      <div class="app">
        <header class="app-header">
          <h1>🥗 NutriScan</h1>
          <nav class="nav-tabs">
            <button 
              class={`nav-tab ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => this.navigate('dashboard')}
            >
              📊 Dashboard
            </button>
            <button 
              class={`nav-tab ${currentView === 'scan' ? 'active' : ''}`}
              onClick={() => this.navigate('scan')}
            >
              📷 Scan
            </button>
            <button 
              class={`nav-tab ${currentView === 'products' ? 'active' : ''}`}
              onClick={() => this.navigate('products')}
            >
              📦 Products
            </button>
            <button 
              class={`nav-tab ${currentView === 'meals' ? 'active' : ''}`}
              onClick={() => this.navigate('meals')}
            >
              🍽️ Meals
            </button>
          </nav>
        </header>

        <main class="app-content">
          {currentView === 'dashboard' && <Dashboard onNavigate={this.navigate.bind(this)} />}
          {currentView === 'scan' && <NutritionScan onNavigate={this.navigate.bind(this)} />}
          {currentView === 'products' && (
            selectedProduct ? (
              <ProductDetail 
                product={selectedProduct} 
                onBack={() => this.navigate('products')}
                onNavigate={this.navigate.bind(this)}
              />
            ) : (
              <ProductList onNavigate={this.navigate.bind(this)} />
            )
          )}
          {currentView === 'meals' && (
            selectedMeal ? (
              <MealPlanner meal={selectedMeal} onBack={() => this.navigate('meals')} />
            ) : (
              <MealPlanner onNavigate={this.navigate.bind(this)} />
            )
          )}
        </main>
      </div>
    );
  }
}