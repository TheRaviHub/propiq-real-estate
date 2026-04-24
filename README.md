# 🏠 PropIQ — Real Estate Intelligence Platform

<div align="center">

**AI-powered property valuation for the Indian real estate market**  
*From raw property data to institutional-grade intelligence in seconds*

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.6-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-DC143C?style=for-the-badge)](LICENSE)

</div>

---

## 🧠 What is PropIQ?

PropIQ is a **production-grade real estate intelligence engine** that combines a **machine learning ensemble** (HistGradientBoosting + RandomForest) with a premium React frontend to deliver:

- **Instant property valuations** for 20+ Indian cities
- **Confidence-calibrated predictions** via Random Forest tree variance
- **Feature importance breakdowns** (Location, Area, Infra, Age, Config, Amenities)
- **Full investment analysis** — ROI, rental yield, risk score, liquidity days, 5-year forecast
- **TCO (Total Cost of Ownership)** with state-wise stamp duty, registration, and maintenance
- **Construction replacement cost** using CPWD 2025-26 SoR rates

---

## 🎯 Live Demo

```
Frontend  →  http://localhost:5174
Backend   →  http://localhost:8000
API Docs  →  http://localhost:8000/docs
```

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                         │
│                                                         │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │   Hero   │──▶│ PropertyForm │───▶│ Results Panel │  │
│  │  (CTA)   │    │ (4-Step Wiz) │    │ (Dashboards)  │  │
│  └──────────┘    └──────┬───────┘    └───────────────┘  │
│                         │                               │
└─────────────────────────┼───────────────────────────────┘
                          │ POST /predict (JSON)
                          ▼
┌─────────────────────────────────────────────────────────┐
│              FastAPI BACKEND  :8000                     │
│                                                         │
│           Input Validation (Pydantic)                   │
│                        │                                │
│  City Enrichment (lat/lng, infra, crime, trend)         │
│                        │                                │
│  Feature Engineering (20 features → DataFrame)          │
│                        │                                │
│  ┌──────▼──────────────────────────────────────────┐    │
│  │          PropIQ Ensemble Model                  │    │
│  │                                                 │    │
│  │  HistGradientBoosting (60%) + RandomForest (40%)│    │
│  │   Preprocessor: OneHotEncoder + StandardScaler  │    │
│  └─────────────────────┬───────────────────────────┘    │
│                        │                                │
│  Confidence Score (RF Tree Variance → CV → %)           │
│                        │                                │
│  Feature Importance (RF importances → grouped)          │
│                        │                                │
│  JSON Response: price, conf, importance, metrics        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              mlEngine.js (Frontend Bridge)              │
│                                                         │
│  • Maps form fields → backend payload                   │
│  • 12s timeout with graceful fallback                   │
│  • Derives: ROI, rental yield, risk, comparables        │
│  • Formats for all dashboard components                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🤖 ML Pipeline — Deep Dive

### Dataset Generation
```
60,000 synthetic Indian property records
├── 20 cities with real lat/lng, base prices, infra scores
├── 35+ named localities with market premium multipliers
├── Property types: Apartment, Villa, Penthouse, Studio,
│   Row House, Builder Floor, Plot/Land
├── Features: area, BHK, bathrooms, age, floor, furnishing,
│   facing, metro proximity, school/hospital distance,
│   gated society, parking, crime index, trend index
└── Price formula: base × type × demand × furnish × facing ×
    age_depreciation × floor_premium × metro_bonus ×
    infra_factor × crime_discount × market_trend × amenity
```

### Training Pipeline
```python
Pipeline([
    ColumnTransformer([
        ('cat', OneHotEncoder(handle_unknown='ignore'), cat_features),
        ('num', Pipeline([SimpleImputer, StandardScaler]), num_features)
    ]),
    Ensemble: 60% HistGradientBoosting + 40% RandomForest
])
```

### Model Performance
| Metric | Score |
|---|---|
| **Cross-Validation R²** | **0.9604 ± 0.0053** |
| **Ensemble Train R²** | **0.9707** |
| **CV MAE** | **₹50.83L ± ₹0.64L** |
| **Train MAE** | **₹44.98L** |
| **Samples** | 60,000 |
| **CV Folds** | 5-fold KFold |

### Why This Algorithm Stack?

| Model | Why Used |
|---|---|
| **HistGradientBoostingRegressor** | Fastest sklearn booster (LightGBM-class), handles missing natively, superior on tabular data |
| **RandomForestRegressor** | Tree variance → genuine confidence score, provides interpretable feature importances |
| **60/40 Weighted Ensemble** | Reduces variance (RF) while preserving GBM accuracy — best of both worlds |
| **OneHotEncoder** | Handles 35+ locality categories cleanly, unknown categories → zero vector |
| **StandardScaler** | Normalises numeric features for stable gradient computation |

---

## 📊 Feature Engineering

### Price Multipliers Applied During Training

```
Base Rate      ← City market base price per sqft
× Locality     ← Premium locality multiplier (0.88 – 2.6×)
× Demand       ← Premium/High/Medium/Low/Emerging (0.88–1.20×)
× Property Type← Apartment/Villa/Penthouse etc (0.65–1.65×)
× Furnishing   ← Fully/Semi/Unfurnished (1.00–1.08×)
× Facing       ← North-East best (0.96–1.06×)
× Age          ← Depreciation 1.1%/yr (0.60–1.02×)
× Floor        ← Ground dip, high-floor premium (0.97–1.06×)
× Metro        ← <0.5km: +12%, <1.5km: +8% (1.00–1.12×)
× Infrastructure← City infra score 59–92 (0.94–1.11×)
× Crime        ← Crime rate discount (0.93–1.03×)
× Market Trend ← Annual appreciation index (1.01–1.13×)
× Amenity      ← Gated +4%, Parking +3% (1.00–1.07×)
× Noise        ← ±6% Gaussian market noise
```

### 20 Input Features (Exact Model Schema)

```
Categorical (OneHotEncoded):
  city, locality, propertyType, furnished, facing

Numerical (StandardScaled):
  latitude, longitude, area, bhk, bathrooms, age,
  metro_dist, school_dist, hospital_dist,
  infrastructure_score, crime_rate_index,
  market_trend_index, gatedSociety, parking
```

---

## 🗺️ End-to-End Data Flow

```
USER fills 4-step wizard
        │
        ▼
Step 1: Location Context
  state → city → locality → demand level

Step 2: Property Identifier
  property type → society name → facing

Step 3: Property Specifications
  BHK → bathrooms → area → age → floor → furnished
  (type-specific fields: plot area, terrace, kitchen type)

Step 4: Amenities & Features
  gated society → parking → amenities checklist → broker quote
        │
        ▼
handleSubmit() → validate() → onAnalyze()
        │
        ▼
mlEngine.js → runMLEngine(inputs)
  ├── Map form fields to API schema
  ├── POST http://127.0.0.1:8000/predict (timeout: 12s)
  │     │
  │     ▼
  │   FastAPI → Pydantic validation → city enrichment
  │   → pd.DataFrame → HGBR predict + RF predict
  │   → weighted average → confidence via RF variance
  │   → feature importances via RF importances
  │   → return JSON
  │
  └── (fallback) Heuristic formula if backend offline
        │
        ▼
Result → 6 dashboard panels:
  ┌─────────────────────┬───────────────────────────┐
  │ BuyerDashboard      │ InvestorDashboard         │
  │ IntelCards          │ ExplainabilityPanel       │
  │ TCOCalculator       │ ConstructionBreakdown     │
  └─────────────────────┴───────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
| Tool | Version | Role |
|---|---|---|
| **Python** | 3.12 | Runtime |
| **FastAPI** | 0.115 | REST API framework |
| **Uvicorn** | 0.34 | ASGI server |
| **scikit-learn** | 1.6 | ML pipeline (HGBR, RF, preprocessing) |
| **pandas** | 2.2 | DataFrame feature engineering |
| **NumPy** | 2.x | Matrix ops, confidence score computation |
| **joblib** | 1.4 | Model serialization (compress=3) |
| **Pydantic** | 2.x | Input validation & schema |

### Frontend
| Tool | Version | Role |
|---|---|---|
| **React** | 18 | UI component library |
| **Vite** | 6.4 | Build tool & dev server |
| **Recharts** | 2.x | Price forecast & importance charts |
| **Vanilla CSS** | — | Premium glassmorphic design system |
| **Google Fonts** | Inter | Typography |

### Data & Intelligence
| Component | Description |
|---|---|
| **City Metrics** | 20 Indian cities with real lat/lng, base prices (₹4,000–₹26,000/sqft), infra scores (59–92), crime indices, trend multipliers |
| **Locality Premiums** | 35+ premium localities with market multipliers (Worli 2.3×, Connaught Place 2.6×, Koramangala 1.45×, etc.) |
| **CPWD SoR 2025-26** | Construction cost breakdown: cement, steel, sand, bricks, labour, finishing — city-multiplied |
| **Stamp Duty Rates** | State-wise 2026 rates (Kerala 8%, Gujarat 4.9%, etc.) for TCO calculation |
| **Demand Levels** | Premium / High / Medium / Low / Emerging → price & ROI modifiers |

---

## 📂 Project Structure

```
real-estate-intelligence/
├── backend/
│   ├── main.py              # FastAPI app + /predict endpoint
│   ├── train_model.py       # ML training pipeline v3.1
│   ├── model.pkl            # Trained ensemble (26MB, compress=3)
│   ├── test_api.py          # Live end-to-end API tests
│   └── env2/                # Python virtual environment
│
├── src/
│   ├── App.jsx              # Main app state & results renderer
│   ├── mlEngine.js          # Frontend ML bridge + fallback + utils
│   ├── index.css            # Global design system (CSS vars, animations)
│   └── components/
│       ├── Hero.jsx                # Landing page with animated CTA
│       ├── Navbar.jsx              # Top navigation
│       ├── PropertyForm.jsx        # 4-step property input wizard
│       ├── SearchableSelect.jsx    # Fuzzy-searchable dropdown
│       ├── LoadingAnalysis.jsx     # Analysis animation overlay
│       ├── IntelCards.jsx          # KPI signal cards (price, conf, ROI)
│       ├── BuyerDashboard.jsx      # Buyer-focused analysis panel
│       ├── ExplainabilityPanel.jsx # Feature importance bar chart
│       ├── TCOCalculator.jsx       # Total cost of ownership
│       ├── MonitoringPanel.jsx     # Market monitoring signals
│       └── ConstructionBreakdown.jsx # CPWD replacement cost panel
│
├── public/                  # Static assets & preview images
├── index.html               # App shell
├── vite.config.js           # Vite configuration
├── package.json             # Frontend dependencies
└── README.md                # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+

### 1. Clone the Repository

```bash
git clone https://github.com/TheRaviHub/propiq-real-estate.git
cd propiq-real-estate
```

### 2. Set Up Backend

```bash
cd backend
python -m venv env2
env2\Scripts\activate          # Windows
# source env2/bin/activate     # macOS/Linux

pip install fastapi uvicorn scikit-learn pandas numpy joblib pydantic requests
```

### 3. Train the ML Model

```bash
# From the project root
python backend/train_model.py
```

Expected output:
```
HGBR CV R2 : 0.9604 ± 0.0053
Ensemble Train R2 : 0.9707
Ensemble Train MAE: ₹44.98L
Saved: backend/model.pkl (26.1 MB)
```

### 4. Start the Backend

```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
# API docs at http://127.0.0.1:8000/docs
```

### 5. Start the Frontend

```bash
npm install
npm run dev
# Opens at http://localhost:5173 (or 5174)
```

### 6. Run API Tests (Optional)

```bash
python backend/test_api.py
```

Expected:
```
PASS | Bangalore Apartment 1200sqft => ₹266.8L | Conf:79.0% | 3.1-ensemble
PASS | Mumbai Penthouse 4500sqft => ₹4548.0L | Conf:69.8% | 3.1-ensemble
...
ALL TESTS PASSED
```

---

## 🔌 API Reference

### `POST /predict`

**Request Body:**

```json
{
  "city": "Bangalore",
  "locality": "Koramangala",
  "propertyType": "Apartment",
  "area": 1200,
  "bhk": 3,
  "bathrooms": 2,
  "age": 5,
  "furnished": "Semi-Furnished",
  "facing": "North-East",
  "gatedSociety": true,
  "parking": true
}
```

**Response:**

```json
{
  "estimatedPrice": 26680000,
  "confidenceScore": 79.0,
  "featureImportance": [
    { "name": "Location & Demand", "value": 38.4, "positive": true },
    { "name": "Property Size (Area)", "value": 26.1, "positive": true },
    { "name": "Infrastructure & Metro", "value": 14.2, "positive": true },
    { "name": "Age & Condition", "value": 11.0, "positive": true },
    { "name": "BHK & Configuration", "value": 6.9, "positive": true },
    { "name": "Amenities & Safety", "value": 3.4, "positive": true }
  ],
  "metrics": {
    "infra_score": 84,
    "crime_index": 2,
    "trend_index": 1.13
  },
  "modelVersion": "3.1-ensemble"
}
```

**Optional fields** (auto-enriched from city data if omitted):
`latitude`, `longitude`, `metro_dist`, `school_dist`, `hospital_dist`,
`infrastructure_score`, `crime_rate_index`, `market_trend_index`

---

## 📈 Derived Intelligence (Frontend)

Once the ML price is returned, `mlEngine.js` computes:

| Signal | Formula |
|---|---|
| **5Y ROI** | `((1 + appreciation)^5 - 1) × 100` |
| **Annual Appreciation** | `(trend_index - 1) × 100 + demand_bonus` |
| **Rental Yield** | 3.1% (Premium) → 4.2% (Emerging) |
| **Monthly Rent** | `price × yield / 12` |
| **Risk Score** | `15 + crime×6 + (age>20?12:0) + (demand=Low?10:0)` |
| **Liquidity Days** | Premium: 22d → Low: 90d |
| **Price Range** | `[price × 0.92, price × 1.09]` |
| **Comparables** | 3 synthetic nearby sales with source attribution |

---

## 🎨 Design System

PropIQ uses a **Warm Crimson / Deep Slate** design language:

```css
--accent-primary:    #DC143C   /* Crimson — primary CTA */
--accent-secondary:  #FF6B6B   /* Warm rose — hover states */
--accent-gold:       #FFD700   /* Gold — premium signals */
--surface-glass:     rgba(255,255,255,0.04)  /* Glassmorphic panels */
--text-primary:      #F8F4F0   /* Warm white */
--text-secondary:    #C4B8B0   /* Muted warm */
```

**Key Design Features:**
- 🌑 Dark glassmorphism with backdrop blur
- ✨ Micro-animations (fade-up, scale-in, shimmer)
- 📱 Fully responsive layout
- 🎯 Premium typography with Inter font
- 🔴 Crimson accent glow on interactive elements

---

## 🏙️ Supported Cities

| City | Base Price/sqft | Infra Score | Annual Trend |
|---|---|---|---|
| Mumbai | ₹26,000 | 92 | +5.0% |
| Gurugram | ₹12,000 | 83 | +6.0% |
| Bangalore | ₹10,200 | 84 | +13.0% |
| Noida | ₹9,000 | 80 | +4.0% |
| Hyderabad | ₹8,500 | 80 | +11.0% |
| Chennai | ₹7,800 | 78 | +5.0% |
| Pune | ₹7,800 | 77 | +9.0% |
| Chandigarh | ₹7,500 | 82 | +5.0% |
| Kolkata | ₹6,200 | 71 | +2.0% |
| Kochi | ₹6,500 | 74 | +4.0% |
| Jaipur | ₹5,400 | 69 | +6.0% |
| Surat | ₹5,500 | 72 | +6.0% |
| Indore | ₹5,200 | 70 | +6.0% |
| Lucknow | ₹5,000 | 66 | +5.0% |
| Ahmedabad | ₹5,800 | 73 | +7.0% |
| + 5 more | — | — | — |

---

## 📋 Roadmap

- [x] ML ensemble model (HGBR + RF)
- [x] 5-fold cross-validation
- [x] Confidence score via tree variance
- [x] Feature importance panel
- [x] TCO calculator with stamp duty
- [x] CPWD construction cost breakdown
- [x] 4-step property input wizard
- [x] All 28 Indian states + UTs
- [ ] Redesign User Interface
- [ ] Deployment using Vercel
- [ ] Real transaction data integration (MahaRERA / NIC)
- [ ] Geospatial heatmap (Leaflet/Mapbox)
- [ ] Docker Compose deployment
- [ ] Mortgage EMI calculator
- [ ] Property comparison tool (side-by-side)
- [ ] User auth + saved searches

---

## 🤝 Contributing

```bash
git checkout -b feature/your-feature
# make changes
git commit -m "feat: your feature description"
git push origin feature/your-feature
# open a pull request
```

---

## 👨‍💻 Author

**Ravi Kumar Singh**  
AI & ML Student @ SRM University AP  
[GitHub](https://github.com/TheRaviHub) · [Email](mailto:onlyravi4321@gmail.com)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with 🧠 intelligence, ❤️ passion, and ☕ a lot of coffee**

*PropIQ — Because every property decision deserves institutional-grade intelligence*

</div>
