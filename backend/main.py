"""
PropIQ Intelligence API - v4.0
FastAPI backend — HGBR + RF ensemble with full 5-step form schema.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
import joblib, numpy as np, pandas as pd, os, logging
from typing import Optional

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("propiq")

app = FastAPI(title="PropIQ Intelligence API", version="4.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

CITY_METRICS = {
    "Mumbai":      {"lat": 19.076,  "lng": 72.878, "base": 26000, "infra": 92, "crime": 3, "trend": 1.05},
    "Pune":        {"lat": 18.520,  "lng": 73.857, "base": 7800,  "infra": 77, "crime": 2, "trend": 1.09},
    "Bangalore":   {"lat": 12.972,  "lng": 77.595, "base": 10200, "infra": 84, "crime": 2, "trend": 1.13},
    "New Delhi":   {"lat": 28.614,  "lng": 77.209, "base": 17500, "infra": 86, "crime": 5, "trend": 1.03},
    "Hyderabad":   {"lat": 17.385,  "lng": 78.487, "base": 8500,  "infra": 80, "crime": 2, "trend": 1.11},
    "Chennai":     {"lat": 13.083,  "lng": 80.271, "base": 7800,  "infra": 78, "crime": 2, "trend": 1.05},
    "Ahmedabad":   {"lat": 23.023,  "lng": 72.571, "base": 5800,  "infra": 73, "crime": 2, "trend": 1.07},
    "Kolkata":     {"lat": 22.573,  "lng": 88.364, "base": 6200,  "infra": 71, "crime": 4, "trend": 1.02},
    "Jaipur":      {"lat": 26.912,  "lng": 75.787, "base": 5400,  "infra": 69, "crime": 3, "trend": 1.06},
    "Lucknow":     {"lat": 26.847,  "lng": 80.946, "base": 5000,  "infra": 66, "crime": 3, "trend": 1.05},
    "Noida":       {"lat": 28.536,  "lng": 77.391, "base": 9000,  "infra": 80, "crime": 4, "trend": 1.04},
    "Gurugram":    {"lat": 28.460,  "lng": 77.027, "base": 12000, "infra": 83, "crime": 4, "trend": 1.06},
    "Navi Mumbai": {"lat": 19.033,  "lng": 73.030, "base": 14000, "infra": 82, "crime": 2, "trend": 1.04},
    "Thane":       {"lat": 19.218,  "lng": 72.978, "base": 13000, "infra": 79, "crime": 2, "trend": 1.04},
    "Chandigarh":  {"lat": 30.733,  "lng": 76.779, "base": 7500,  "infra": 82, "crime": 1, "trend": 1.05},
    "Bhopal":      {"lat": 23.260,  "lng": 77.413, "base": 4200,  "infra": 64, "crime": 3, "trend": 1.04},
    "Indore":      {"lat": 22.720,  "lng": 75.858, "base": 5200,  "infra": 70, "crime": 2, "trend": 1.06},
    "Kochi":       {"lat":  9.931,  "lng": 76.267, "base": 6500,  "infra": 74, "crime": 1, "trend": 1.04},
    "Surat":       {"lat": 21.170,  "lng": 72.831, "base": 5500,  "infra": 72, "crime": 2, "trend": 1.06},
    "Patna":       {"lat": 25.594,  "lng": 85.138, "base": 4000,  "infra": 59, "crime": 5, "trend": 1.03},
    "Other":       {"lat": 20.594,  "lng": 78.963, "base": 4500,  "infra": 60, "crime": 4, "trend": 1.01},
}

CAT_FEATS = ["city", "locality", "propertyType", "furnished", "facing"]
NUM_FEATS = [
    "latitude", "longitude", "area", "bhk", "age",
    "infrastructure_score", "crime_rate_index", "market_trend_index",
    "parking", "amenity_score", "nearby_score",
    "floor_ratio", "is_corner",
]

class PropertyInputs(BaseModel):
    city: str
    locality: str
    propertyType: str
    area: float
    age: int
    furnished: Optional[str] = "Unfurnished"
    facing: Optional[str] = "North"
    bhk: Optional[int] = 0
    parking: Optional[bool] = False
    amenityScore: Optional[float] = 0.0   # 0-1 ratio of amenities selected
    nearbySchool: Optional[bool] = False
    nearbyHospital: Optional[bool] = False
    nearbyMetro: Optional[bool] = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    floorNo: Optional[int] = 0
    totalFloors: Optional[int] = 1
    isCornerPlot: Optional[bool] = False

    @validator("area")
    def area_positive(cls, v):
        if v <= 0: raise ValueError("area must be > 0")
        return v

    @validator("age")
    def age_valid(cls, v):
        if not (0 <= v <= 100): raise ValueError("age must be 0-100")
        return v

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model.pkl")
model = None
try:
    model = joblib.load(MODEL_PATH)
    logger.info("Model bundle loaded OK")
except Exception as e:
    logger.error("Could not load model: %s", e)

@app.get("/")
def root():
    return {"status": "ok", "model_loaded": model is not None, "version": "4.0.0"}

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}

@app.post("/predict")
async def predict(inputs: PropertyInputs):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Run train_model.py first.")

    city_key = inputs.city if inputs.city in CITY_METRICS else "Other"
    m = CITY_METRICS[city_key]

    # Floor ratio — higher floors slightly premium
    floor_ratio = 0.0
    if inputs.totalFloors and inputs.totalFloors > 0:
        floor_ratio = (inputs.floorNo or 0) / inputs.totalFloors

    # Nearby score: 0-1
    nearby_score = (
        (0.35 if inputs.nearbyMetro else 0) +
        (0.25 if inputs.nearbyHospital else 0) +
        (0.25 if inputs.nearbySchool else 0)
    )

    row = {
        "city":                 inputs.city,
        "locality":             inputs.locality,
        "propertyType":         inputs.propertyType,
        "furnished":            inputs.furnished or "Unfurnished",
        "facing":               inputs.facing or "North",
        "latitude":             inputs.latitude if inputs.latitude is not None else m["lat"],
        "longitude":            inputs.longitude if inputs.longitude is not None else m["lng"],
        "area":                 float(inputs.area),
        "bhk":                  int(inputs.bhk or 0),
        "age":                  int(inputs.age),
        "infrastructure_score": float(m["infra"]),
        "crime_rate_index":     float(m["crime"]),
        "market_trend_index":   float(m["trend"]),
        "parking":              1 if inputs.parking else 0,
        "amenity_score":        float(inputs.amenityScore or 0),
        "nearby_score":         float(nearby_score),
        "floor_ratio":          float(floor_ratio),
        "is_corner":            1 if inputs.isCornerPlot else 0,
    }
    input_df = pd.DataFrame([row])

    try:
        p_hgbr = float(model["hgbr"].predict(input_df)[0])
        p_rf   = float(model["rf"].predict(input_df)[0])
        raw    = model["w_hgbr"] * p_hgbr + model["w_rf"] * p_rf
        prediction = max(raw, 100_000)

        # Price range: low / mid / high
        price_low  = int(round(prediction * 0.91))
        price_high = int(round(prediction * 1.10))

        # Confidence via RF tree variance
        confidence_score = 78.0
        try:
            rf_pipe = model["rf"]
            X_tr = rf_pipe.named_steps["preprocessor"].transform(input_df)
            rf_est = rf_pipe.named_steps["regressor"]
            tree_preds = np.array([t.predict(X_tr)[0] for t in rf_est.estimators_])
            cv = np.std(tree_preds) / np.mean(tree_preds) if np.mean(tree_preds) > 0 else 0.15
            confidence_score = float(np.clip(100.0 - cv * 180.0, 52.0, 97.0))
        except Exception as ce:
            logger.warning("Confidence fallback: %s", ce)

        # Feature importance groups
        importance_map = {
            "Location & Demand":      0.38,
            "Property Size (Area)":   0.26,
            "Infrastructure & Metro": 0.14,
            "Age & Condition":        0.11,
            "BHK & Configuration":   0.07,
            "Amenities & Safety":     0.04,
        }
        try:
            rf_pipe = model["rf"]
            prep = rf_pipe.named_steps["preprocessor"]
            rf_est = rf_pipe.named_steps["regressor"]
            cat_enc = prep.named_transformers_["cat"]
            cat_names = list(cat_enc.get_feature_names_out(CAT_FEATS))
            all_names = cat_names + NUM_FEATS
            imps = rf_est.feature_importances_
            if len(imps) == len(all_names):
                importance_map = {k: 0.0 for k in importance_map}
                for feat, val in zip(all_names, imps):
                    fl = feat.lower()
                    if any(k in fl for k in ["city", "locality", "latitude", "longitude"]):
                        importance_map["Location & Demand"] += val
                    elif "area" in fl:
                        importance_map["Property Size (Area)"] += val
                    elif any(k in fl for k in ["infra", "metro", "trend", "nearby"]):
                        importance_map["Infrastructure & Metro"] += val
                    elif any(k in fl for k in ["age", "furnished"]):
                        importance_map["Age & Condition"] += val
                    elif any(k in fl for k in ["bhk", "facing", "propertytype", "floor"]):
                        importance_map["BHK & Configuration"] += val
                    else:
                        importance_map["Amenities & Safety"] += val
        except Exception as ie:
            logger.warning("Importance fallback: %s", ie)

        top_features = [
            {"name": k, "value": round(v * 100, 1), "positive": True}
            for k, v in sorted(importance_map.items(), key=lambda x: x[1], reverse=True)
        ]

        logger.info("Predicted Rs%.1fL | Conf: %.1f%% | City: %s", prediction / 1e5, confidence_score, inputs.city)

        return {
            "estimatedPrice":    int(round(prediction)),
            "price_range_low":   price_low,
            "price_range_high":  price_high,
            "confidenceScore":   round(confidence_score, 1),
            "featureImportance": top_features,
            "metrics": {
                "infra_score": m["infra"],
                "crime_index": m["crime"],
                "trend_index": m["trend"],
            },
            "modelVersion": "4.0-ensemble",
        }

    except Exception as e:
        logger.error("Prediction error: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
