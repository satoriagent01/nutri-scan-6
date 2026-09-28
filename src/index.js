import { Dashboard } from './components/Dashboard.js';
import { Camera } from './components/Camera.js';
import { NutritionScan } from './components/NutritionScan.js';
import { ProductList } from './components/ProductList.js';
import { ProductDetail } from './components/ProductDetail.js';
import { MealPlanner } from './components/MealPlanner.js';
import { Storage } from './lib/storage.js';

const storage = new Storage();

function renderView(view) {
  const main = document.getElementById('main-content');
  main.innerHTML = view;
}

function initNavigation() {
  const navButtons = document.querySelectorAll('[data-nav]');
  const views = {
    dashboard: () => {
      const dashboard = new Dashboard(storage);
      renderView(dashboard.render());
      dashboard.bindEvents();
    },
    scan: () => {
      const camera = new Camera(storage);
      renderView(camera.render());
      camera.bindEvents();
    },
    products: () => {
      const productList = new ProductList(storage);
      renderView(productList.render());
      productList.bindEvents();
    },
    meals: () => {
      const mealPlanner = new MealPlanner(storage);
      renderView(mealPlanner.render());
      mealPlanner.bindEvents();
    }
  };

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const viewName = btn.dataset.nav;
      if (views[viewName]) views[viewName]();
    });
  });
}

function initProductDetail() {
  const main = document.getElementById('main-content');
  main.addEventListener('click', (e) => {
    if (e.target.classList.contains('view-product')) {
      const productId = e.target.dataset.id;
      const product = storage.getProduct(productId);
      if (product) {
        const detail = new ProductDetail(storage);
        renderView(detail.render(product));
        detail.bindEvents(product);
      }
    }
  });
}

function initScanResult() {
  const main = document.getElementById('main-content');
  main.addEventListener('click', (e) => {
    if (e.target.classList.contains('save-scan')) {
      const productId = e.target.dataset.id;
      const product = storage.getProduct(productId);
      if (product) {
        const scan = new NutritionScan(storage);
        renderView(scan.render(product));
        scan.bindEvents(product);
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initProductDetail();
  initScanResult();
  // Default view
  const dashboard = new Dashboard(storage);
  renderView(dashboard.render());
  dashboard.bindEvents();
});