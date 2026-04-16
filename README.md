# PropIQ — Real Estate Decision Intelligence 🏠🧠

PropIQ is an advanced **Real Estate Intelligence Engine** designed to bring machine learning precision to property valuation, negotiation, and Total Cost of Ownership (TCO) analytics. 

Built initially as a high-performance React application, PropIQ replaces arbitrary broker estimates with data-backed, algorithmically sound valuations based on CPWD construction indices, state-level stamp duties, and granular property logic.

---

## 🚀 Key Features

### 1. Robust Predictive Form Engine
A responsive, multi-step React property form tailored differently depending on the chosen property type (Apartment, Plot / Land, Penthouse, Builder Floor, Studio, or Villa). 
- **Logical Validation Constraints**: Built-in guardrails ensure extreme edge-case boundaries are caught (e.g. maxing out inputs like broker-quotes at 1000 Crores, total floor bounds, or physical constraints like 3 balconies maximum for a 1-BHK).
- **Global State Sanitization**: Component-level memory wipe explicitly prevents "data contamination". Switching from "Apartment" with *6000 sq ft* to "Row House" rigorously flushes state so validations fire realistically upon touch.

### 2. Contextual UX & ML Highlights
- Dynamic **Anchor Context Tracking**: The form consistently reminds you of your selection (e.g., `📍 Analysing: 2 BHK Apartment in Powai, Mumbai`) eliminating "form blindness" across steps.
- **ML Signaling**: Highlights specific inputs with `🔑 KEY ML FACTOR` or `🔑 PRIMARY ML SIGNAL` so the user knows exactly what dictates the ML engine's output (like "Kitchen Type" in a Studio).

### 3. Comprehensive Dashboard Architecture
- **Buyer Dashboard**: Summarizes insights.
- **Bank Dashboard**: Views collateral risks.
- **Investor Dashboard**: Calculates cap rates and ROI.
- **TCO Calculator**: Total Cost of Ownership splits breaking down raw construction costs, registry, and GST.

---

## 🛠️ Architecture & Tech Stack
Currently, PropIQ operates as a **Frontend-Simulation Model** with static mathematical heuristics running inside the user's browser. 

*   **Frontend**: React, Vite, Vanilla CSS.
*   *Upcoming Backend*: FastAPI (Python) & XGBoost data-science models.

---

## ⚙️ Running Locally

1. Clone the repository:
```bash
git clone https://github.com/TheRaviHub/propiq-real-estate.git
```
2. Navigate into the directory and install dependencies:
```bash
cd propiq-real-estate
npm install
```
3. Boot the local Vite development server:
```bash
npm run dev
```

---

## 🗺️ Roadmap (Phase 2)
The next evolution of PropIQ involves stripping the client-side `mlEngine.js` heuristic math and connecting to an authentic ML API:
1. **Data Scrubbing Engine**: Python/BeautifulSoup scripts scraping `MagicBricks`, `99acres`, etc.
2. **Python FastAPI Backend**: A RESTful microservice replacing the frontend's algorithmic simulation.
3. **Model Training**: A `scikit-learn` or `XGBoost` pipeline discovering dynamic pricing based purely on regional regression formulas.
