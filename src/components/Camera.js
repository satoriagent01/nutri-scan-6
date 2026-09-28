/**
 * Camera component for capturing photos of nutrition labels
 * Uses device camera or file picker
 */

import { h, Component } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';

export default class Camera extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: null,
      error: null,
      loading: false
    };
    this.videoRef = useRef(null);
    this.streamRef = null;
  }

  async startCamera() {
    try {
      this.setState({ loading: true, error: null });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      this.streamRef = stream;
      if (this.videoRef.current) {
        this.videoRef.current.srcObject = stream;
      }
      this.setState({ loading: false });
    } catch (err) {
      console.error('Camera error:', err);
      this.setState({ 
        error: 'No se pudo acceder a la cámara. Usa el selector de archivos.',
        loading: false 
      });
    }
  }

  capture() {
    if (!this.videoRef.current) return;
    
    const video = this.videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    this.setState({ image: imageData });
    
    // Stop camera stream
    if (this.streamRef) {
      this.streamRef.getTracks().forEach(track => track.stop());
      this.streamRef = null;
    }
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.setState({ image: e.target.result });
    };
    reader.readAsDataURL(file);
  }

  reset() {
    this.setState({ image: null, error: null });
    if (this.streamRef) {
      this.streamRef.getTracks().forEach(track => track.stop());
      this.streamRef = null;
    }
  }

  componentWillUnmount() {
    if (this.streamRef) {
      this.streamRef.getTracks().forEach(track => track.stop());
    }
  }

  render() {
    const { image, error, loading } = this.state;
    const { onImageCaptured } = this.props;

    if (image) {
      return (
        <div class="camera-result">
          <img src={image} alt="Captured nutrition label" class="captured-image" />
          <div class="camera-actions">
            <button class="btn-secondary" onClick={() => this.reset()}>
              🔄 Reintentar
            </button>
            <button class="btn-primary" onClick={() => onImageCaptured(image)}>
              ✅ Procesar Imagen
            </button>
          </div>
        </div>
      );
    }

    return (
      <div class="camera-container">
        <h2>📷 Capturar Foto</h2>
        <p>Toma una foto del cuadro nutricional del producto</p>
        
        {error && <div class="error-message">{error}</div>}
        
        <div class="camera-options">
          <button class="btn-primary" onClick={() => this.startCamera()}>
            📸 Usar Cámara
          </button>
          
          <label class="btn-secondary file-label">
            📁 Seleccionar Archivo
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => this.handleFileSelect(e)}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div class="camera-preview">
          <video 
            ref={this.videoRef} 
            autoPlay 
            playsInline 
            muted
            style={{ display: 'none' }}
          />
          {loading && <div class="loading">Cargando cámara...</div>}
        </div>

        <div class="camera-tips">
          <h3>💡 Consejos para una buena foto:</h3>
          <ul>
            <li>Asegúrate de que el cuadro nutricional esté bien iluminado</li>
            <li>Mantén el teléfono estable al tomar la foto</li>
            <li>Asegúrate de que todo el cuadro sea visible</li>
            <li>Evita reflejos y sombras sobre el texto</li>
          </ul>
        </div>
      </div>
    );
  }
}