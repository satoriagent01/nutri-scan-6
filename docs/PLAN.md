# NutriScan - Project Plan

## Requirements

Build a free, ad-free nutrition label scanner and meal planner app that:

1. **Scans nutrition labels** from photos taken in supermarkets
2. **Extracts nutrition data** using OCR + deterministic parsing
3. **Tracks custom nutrition metrics** (calories, sodium, saturated fats, etc.)
4. **Plans meals** by specifying grams of each product
5. **Shows a dashboard** with daily nutrition summaries

## Shared Images Analysis

### Image 1 (Chocolate bar - German/Italian/French)
- Multi-language nutrition table (Nährwertdeklaration / Déclaration nutritionnelle / Voedingswaarde / Dichiarazione nutrizionale)
- Columns: per 100g and per serving (30g = 1 Melto)
- Fields: Energie (kJ/kcal), Fett (fats), davon gesättigte Fettsäuren (saturated fats), Kohlenhydrate (carbs), davon Zucker (sugars), Ballaststoffe (fiber), Eiweiß (protein), Salz (salt)
- Values in grams, energy in kJ and kcal

### Image 2 (Apple-orange-mango juice - Dutch)
- Nutrition per 100ml and per glass (200ml)
- Fields: energie, vetten (fats), waarvan verzadigde vetzuren (saturated), koolhydraten (carbs), waarvan suikers (sugars), waarvan zoetstoffen (sweeteners), eiwitten (protein), zout (salt)
- Also shows percentage of daily reference intake
- Ingredients list and allergen info

### Image 3 (Olive oil spray - Dutch)
- Nutrition per 100ml
- Fields: energie, waarvan verzadigde vetten, koolhydraten, waarvan suikers, vezels (fiber), eiwitten, zout
- Also shows vitamin E percentage
- Hazard symbols and storage instructions

## Key Observations

- Nutrition tables vary by language (German, Dutch, French, Italian, English, Spanish)
- Common fields: energy, fats, saturated fats, carbs, sugars, fiber, protein, salt/sodium
- Values can be per 100g/ml or per serving
- Energy shown in both kJ and kcal
- Some labels include vitamins and minerals
- Need to handle multi-language labels

## Architecture

### Frontend (Vanilla JS)
- Single-page application with hash-based routing
- Components: App, Camera, NutritionScan, ProductList, ProductDetail, MealPlanner, Dashboard, Ingredient
- CSS Grid/Flexbox for responsive layout
- LocalStorage for persistence

### OCR (Tesseract.js)
- Runs in-browser, no API key needed
- Supports multiple languages
- Extracts raw text from images

### Nutrition Parser (Deterministic)
- Regex-based parsing of nutrition tables
- Language detection for field names
- Handles both per-100g and per-serving columns
- Normalizes values to a standard format

### Storage
- LocalStorage wrapper
- Products library
- Meal plans
- Daily nutrition history

## Decisions

1. **No backend** - Everything runs client-side with LocalStorage
2. **Tesseract.js** - Free, open-source OCR that runs in-browser
3. **Vanilla JS** - No framework dependencies, simple and fast
4. **Multi-language support** - Handle German, Dutch, French, Italian, English, Spanish
5. **Custom metrics** - Users can track any nutrition field, not just calories

## What Comes Next

- [ ] Add barcode scanning (EAN/UPC)
- [ ] Integrate with Open Food Facts API
- [ ] Export data as CSV
- [ ] Dark mode
- [ ] PWA support
- [ ] Cloud sync