/**
 * Ingredient component - manual ingredient entry for meal planning
 */

import { h, Component } from 'preact';
import { useState } from 'preact/hooks';

export default class Ingredient extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      calories: 0,
      fat: 0,
      saturatedFat: 0,
      carbs: 0,
      sugars: 0,
      fiber: 0,
      protein: 0,
      salt: 0,
      sodium: 0,
      servingSize: 100,
      servingUnit: 'g'
    };
  }

  handleInputChange(field, value) {
    this.setState({ [field]: value });
  }

  handleSubmit() {
    const { name, servingSize, servingUnit, ...nutrition } = this.state;
    
    if (!name.trim()) {
      alert('Ingresa el nombre del ingrediente');
      return;
    }

    const ingredient = {
      id: Date.now().toString(),
      name: name.trim(),
      servingSize: parseFloat(servingSize) || 100,
      servingUnit,
      nutrition
    };

    this.props.onAdd(ingredient);
    this.handleReset();
  }

  handleReset() {
    this.setState({
      name: '',
      calories: 0,
      fat: 0,
      saturatedFat: 0,
      carbs: 0,
      sugars: 0,
      fiber: 0,
      protein: 0,
      salt: 0,
      sodium: 0,
      servingSize: 100,
      servingUnit: 'g'
    });
  }

  renderNutritionInput(label, field, unit) {
    return (
      <div class="nutrition-input">
        <label>{label}</label>
        <input
          type="number"
          value={this.state[field]}
          min="0"
          step="0.1"
          onInput={(e) => this.handleInputChange(field, parseFloat(e.target.value) || 0)}
          class="nutrition-value-input"
        />
        <span class="nutrition-unit">{unit}</span>
      </div>
    );
  }

  render() {
    return (
      <div class="ingredient-form">
        <h3>➕ Agregar Ingrediente Manual</h3>
        
        <div class="form-group">
          <label>Nombre del ingrediente:</label>
          <input
            type="text"
            value={this.state.name}
            onInput={(e) => this.handleInputChange('name', e.target.value)}
            placeholder="Ej: Arroz cocido"
            class="form-input"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Cantidad:</label>
            <input
              type="number"
              value={this.state.servingSize}
              min="1"
              onInput={(e) => this.handleInputChange('servingSize', parseFloat(e.target.value) || 0)}
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Unidad:</label>
            <select
              value={this.state.servingUnit}
              onChange={(e) => this.handleInputChange('servingUnit', e.target.value)}
              class="form-select"
            >
              <option value="g">gramos</option>
              <option value="ml">ml</option>
              <option value="unidades">unidades</option>
            </select>
          </div>
        </div>

        <div class="nutrition-grid">
          {this.renderNutritionInput('Calorías', 'calories', 'kcal')}
          {this.renderNutritionInput('Grasa', 'fat', 'g')}
          {this.renderNutritionInput('Grasa Sat.', 'saturatedFat', 'g')}
          {this.renderNutritionInput('Carbohidratos', 'carbs', 'g')}
          {this.renderNutritionInput('Azúcares', 'sugars', 'g')}
          {this.renderNutritionInput('Fibra', 'fiber', 'g')}
          {this.renderNutritionInput('Proteína', 'protein', 'g')}
          {this.renderNutritionInput('Sal', 'salt', 'g')}
          {this.renderNutritionInput('Sodio', 'sodium', 'mg')}
        </div>

        <div class="form-actions">
          <button 
            class="btn-primary"
            onClick={() => this.handleSubmit()}
          >
            Agregar
          </button>
          <button 
            class="btn-secondary"
            onClick={() => this.handleReset()}
          >
            Limpiar
          </button>
        </div>
      </div>
    );
  }
}