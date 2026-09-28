/**
 * Dashboard component - daily nutrition summary
 */

import { h, Component } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { getMeals, getMealTotal } from '../../lib/storage.js';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      meals: [],
      dailyTotals: {
        calories: 0,
        fat: 0,
        saturatedFat: 0,
        carbs: 0,
        sugars: 0,
        fiber: 0,
        protein: 0,
        salt: 0,
        sodium: 0
      },
      selectedDate: new Date().toISOString().split('T')[0]
    };
  }

  componentDidMount() {
    this.loadMeals();
  }

  loadMeals() {
    const meals = getMeals();
    this.calculateDailyTotals(meals);
    this.setState({ meals });
  }

  calculateDailyTotals(meals) {
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = meals.filter(m => m.date === today);
    
    const totals = {
      calories: 0,
      fat: 0,
      saturatedFat: 0,
      carbs: 0,
      sugars: 0,
      fiber: 0,
      protein: 0,
      salt: 0,
      sodium: 0
    };

    todayMeals.forEach(meal => {
      const mealTotal = getMealTotal(meal);
      Object.keys(totals).forEach(key => {
        totals[key] += mealTotal[key] || 0;
      });
    });

    this.setState({ dailyTotals: totals });
  }

  handleDateChange(date) {
    this.setState({ selectedDate: date });
  }

  renderNutritionBar(label, value, max, unit, color) {
    const percentage = Math.min((value / max) * 100, 100);
    
    return (
      <div class="nutrition-bar">
        <div class="bar-header">
          <span class="bar-label">{label}</span>
          <span class="bar-value">{value.toFixed(1)}{unit}</span>
        </div>
        <div class="bar-track">
          <div 
            class="bar-fill" 
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
        <div class="bar-max">Meta: {max}{unit}</div>
      </div>
    );
  }

  renderQuickStats() {
    const { dailyTotals } = this.state;
    const stats = [
      { label: 'Calorías', value: dailyTotals.calories.toFixed(0), unit: ' kcal', color: '#ff6b35' },
      { label: 'Proteína', value: dailyTotals.protein.toFixed(1), unit: ' g', color: '#fd79a8' },
      { label: 'Grasa', value: dailyTotals.fat.toFixed(1), unit: ' g', color: '#4ecdc4' },
      { label: 'Carbs', value: dailyTotals.carbs.toFixed(1), unit: ' g', color: '#96ceb4' }
    ];

    return (
      <div class="quick-stats">
        {stats.map((stat, i) => (
          <div key={i} class="stat-card">
            <div class="stat-value" style={{ color: stat.color }}>
              {stat.value}{stat.unit}
            </div>
            <div class="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    );
  }

  renderMealsList() {
    const { meals, selectedDate } = this.state;
    const filteredMeals = meals.filter(m => m.date === selectedDate);

    if (filteredMeals.length === 0) {
      return (
        <div class="empty-state">
          <p class="empty-icon">📅</p>
          <p>No hay comidas registradas para esta fecha</p>
        </div>
      );
    }

    return (
      <div class="meals-list">
        {filteredMeals.map(meal => {
          const total = getMealTotal(meal);
          return (
            <div key={meal.id} class="meal-card">
              <div class="meal-card-header">
                <strong>{meal.name || 'Comida sin nombre'}</strong>
                <span class="meal-card-calories">{total.calories?.toFixed(0)} kcal</span>
              </div>
              <div class="meal-card-items">
                {meal.items.map((item, i) => (
                  <div key={i} class="meal-card-item">
                    <span>{item.productName}</span>
                    <span class="meal-card-item-grams">{item.servingGrams}g</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    return (
      <div class="dashboard">
        <div class="dashboard-header">
          <h2>📊 Dashboard</h2>
          <input
            type="date"
            value={this.state.selectedDate}
            onChange={(e) => this.handleDateChange(e.target.value)}
            class="date-picker"
          />
        </div>

        {this.renderQuickStats()}

        <div class="nutrition-bars">
          <h3>Progreso Diario</h3>
          {this.renderNutritionBar('Calorías', this.state.dailyTotals.calories, 2000, ' kcal', '#ff6b35')}
          {this.renderNutritionBar('Grasa', this.state.dailyTotals.fat, 65, ' g', '#4ecdc4')}
          {this.renderNutritionBar('Grasa Sat.', this.state.dailyTotals.saturatedFat, 20, ' g', '#45b7d1')}
          {this.renderNutritionBar('Carbohidratos', this.state.dailyTotals.carbs, 275, ' g', '#96ceb4')}
          {this.renderNutritionBar('Azúcares', this.state.dailyTotals.sugars, 50, ' g', '#ffeaa7')}
          {this.renderNutritionBar('Fibra', this.state.dailyTotals.fiber, 25, ' g', '#a29bfe')}
          {this.renderNutritionBar('Proteína', this.state.dailyTotals.protein, 50, ' g', '#fd79a8')}
          {this.renderNutritionBar('Sal', this.state.dailyTotals.salt, 6, ' g', '#dfe6e9')}
        </div>

        {this.renderMealsList()}

        <div class="dashboard-actions">
          <button 
            class="btn-primary"
            onClick={() => this.props.onNavigate('meal-planner')}
          >
            ➕ Agregar Comida
          </button>
          <button 
            class="btn-secondary"
            onClick={() => this.props.onNavigate('scan')}
          >
            📷 Escanear Producto
          </button>
        </div>
      </div>
    );
  }
}