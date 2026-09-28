/**
 * NutritionScan component - orchestrates camera capture and OCR parsing
 */

import { h, Component } from 'preact';
import { useState } from 'preact/hooks';
import Camera from './Camera.js';
import { scanImage } from '../../lib/ocr.js';
import { parseNutritionText } from '../../lib/nutrition-parser.js';
import { saveProduct } from '../../lib/storage.js';

export default class NutritionScan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      processing: false,
      result: null,
      error: null
    };
  }

  async handleImageCaptured(imageData) {
    this.setState({ processing: true, error: null, result: null });

    try {
      // Step 1: OCR to extract text from image
      const ocrText = await scanImage(imageData);
      
      // Step 2: Parse nutrition table from extracted text
      const parsedData = parseNutritionText(ocrText);

      if (!parsedData || parsedData.items.length === 0) {
        this.setState({ 
          processing: false, 
          error: 'No se pudo detectar una tabla nutricional. Intenta con otra foto.',
          result: { text: ocrText, parsed: null }
        });
        return;
      }

      // Step 3: Save the product
      const product = {
        id: Date.now().toString(),
        name: parsedData.productName || 'Producto escaneado',
        brand: parsedData.brand || '',
        servingSize: parsedData.servingSize,
        servingUnit: parsedData.servingUnit,
        items: parsedData.items,
        ingredients: parsedData.ingredients || [],
        imageUrl: imageData,
        ocrText: ocrText,
        scannedAt: new Date().toISOString()
      };

      saveProduct(product);

      this.setState({ 
        processing: false, 
        result: product,
        error: null
      });

      // Navigate to product detail after a short delay
      setTimeout(() => {
        this.props.onNavigate('products', { product });
      }, 1500);

    } catch (err) {
      console.error('Scan error:', err);
      this.setState({ 
        processing: false, 
        error: 'Error al procesar la imagen: ' + err.message 
      });
    }
  }

  render() {
    const { processing, result, error } = this.state;

    if (processing) {
      return (
        <div class="scan-processing">
          <div class="spinner"></div>
          <h3>Procesando imagen...</h3>
          <p>Extrayendo información nutricional</p>
        </div>
      );
    }

    if (result) {
      return (
        <div class="scan-success">
          <div class="success-icon">✅</div>
          <h3>¡Nutrición detectada!</h3>
          <p>Redirigiendo al detalle del producto...</p>
        </div>
      );
    }

    return (
      <div class="scan-container">
        <h2>📷 Escanear Nutrición</h2>
        <p>Toma una foto del cuadro nutricional</p>
        
        {error && (
          <div class="error-message">
            <strong>Error:</strong> {error}
            <button class="btn-secondary" onClick={() => this.setState({ error: null })}>
              Reintentar
            </button>
          </div>
        )}

        <Camera onImageCaptured={(image) => this.handleImageCaptured(image)} />
      </div>
    );
  }
}