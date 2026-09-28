# NutriScan

**Free nutrition label scanner and meal planner.** No ads, no paywalls.

## What it does

- 📸 Take a photo of a nutrition label (or upload one)
- 🔍 OCR extracts the text from the image
- 📊 Parses the nutrition table into structured data (calories, fats, carbs, protein, sodium, etc.)
- 🍽️ Build custom meals by specifying grams of each product
- 📈 Track your daily nutrition with a dashboard

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), CSS3
- **OCR**: Tesseract.js (runs in-browser, no API key needed)
- **Storage**: LocalStorage (all data stays on your device)
- **Testing**: Node.js built-in test runner

## Getting Started

### Prerequisites

- Node.js 24+
- npm

### Installation

```bash
npm install
```

### Running the App

Since this is a static frontend app, you can serve it with any HTTP server:

```bash
npx serve .
```

Or open `public/index.html` directly in your browser (some features like camera may require HTTPS).

### Running Tests

```bash
npm test
```

## Features

### Nutrition Label Scanning

1. Click "Scan Label" to open your camera or upload an image
2. The app uses Tesseract.js to extract text from the image
3. The nutrition parser identifies the nutrition table and extracts values
4. Save the product to your library

### Meal Planning

1. Go to "Meal Planner"
2. Add products from your library or create custom ingredients
3. Specify the grams of each product
4. See the total nutrition for the meal

### Dashboard

1. View your daily nutrition summary
2. Track calories, macronutrients, and custom metrics
3. See trends over time

## What's Not Done Yet

- [ ] Cloud sync across devices
- [ ] Barcode scanning (EAN/UPC)
- [ ] Integration with Open Food Facts database
- [ ] Export data as CSV
- [ ] Dark mode
- [ ] Mobile app (PWA support in progress)

## License

MIT