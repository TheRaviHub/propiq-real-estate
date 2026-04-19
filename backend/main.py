from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Any
import joblib
import os
import numpy as np
import pandas as pd

app = FastAPI(title="PropIQ ML Backend")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')
if not os.path.exists(MODEL_PATH):
    print(f"Warning: Model file not found at {MODEL_PATH}. Prediction endpoints will fail until train_model.py is run.")
else:
    model = joblib.load(MODEL_PATH)

class PropertyInputs(BaseModel):
    # Base fields
    city: str
    propertyType: str
    localityDemand: Optional[str] = "Medium"
    furnished: Optional[str] = "Unfurnished"
    facing: Optional[str] = "North"
    
    # Numerics
    bhk: Optional[Any] = 0
    bathrooms: Optional[Any] = 0
    area: Optional[Any] = 0
    age: Optional[Any] = 0
    floor: Optional[Any] = 0
    totalFloors: Optional[Any] = 0
    
    # Specifics
    amenities: Optional[List[str]] = []
    gatedSociety: Optional[bool] = False
    parking: Optional[bool] = False
    plotArea: Optional[Any] = 0
    terraceArea: Optional[Any] = 0
    
    # Additional fields that frontend might send but we might not use directly in the model yet,
    # but we accept them to prevent validation errors
    locality: Optional[str] = None
    state: Optional[str] = None
    societyName: Optional[str] = None
    kitchenType: Optional[str] = None
    managedApartment: Optional[bool] = None
    loftMezzanine: Optional[bool] = None
    independentEntry: Optional[bool] = None
    privateGarden: Optional[bool] = None
    privatePool: Optional[bool] = None
    doubleCeiling: Optional[bool] = None
    smartHome: Optional[bool] = None
    zoneClassification: Optional[str] = None
    legalStatus: Optional[str] = None
    roadType: Optional[str] = None

@app.get("/")
async def root():
    return {"status": "online", "message": "PropIQ ML Engine API is running"}

@app.post("/predict")
async def predict(inputs: PropertyInputs):
    try:
        data_dict = inputs.model_dump()
        print(f"DEBUG: Processing prediction request: {data_dict['city']} - {data_dict['propertyType']}")
        
        # Preprocess fields for the model
        def safe_float(val):
            try:
                if val is None or str(val).strip() == '': return 0.0
                return float(val)
            except:
                return 0.0
                
        def safe_int(val):
            try:
                if val is None or str(val).strip() == '': return 0
                return int(val)
            except:
                return 0

        processed_data = {
            'city': data_dict['city'] if data_dict['city'] else 'Other',
            'locality': data_dict.get('locality') or 'Other',
            'propertyType': data_dict['propertyType'] if data_dict['propertyType'] else 'Apartment',
            'localityDemand': data_dict.get('localityDemand') or 'Medium',
            'furnished': data_dict.get('furnished') or 'Unfurnished',
            'facing': data_dict.get('facing') or 'North',
            'bhk': safe_int(data_dict.get('bhk')),
            'bathrooms': safe_int(data_dict.get('bathrooms')),
            'area': safe_float(data_dict.get('area')),
            'age': safe_int(data_dict.get('age')),
            'floor': safe_int(data_dict.get('floor')),
            'totalFloors': safe_int(data_dict.get('totalFloors')),
            'amenitiesCount': len(data_dict.get('amenities', [])),
            'gatedSociety': bool(data_dict.get('gatedSociety')),
            'parking': bool(data_dict.get('parking')),
            'plotArea': safe_float(data_dict.get('plotArea')),
            'terraceArea': safe_float(data_dict.get('terraceArea'))
        }
        
        # Enforce type constraints matching training logic
        if processed_data['propertyType'] == 'Plot / Land':
            processed_data['bhk'] = 0
            processed_data['bathrooms'] = 0
            processed_data['age'] = 0
            processed_data['floor'] = 0
            processed_data['totalFloors'] = 0
        elif processed_data['propertyType'] == 'Studio':
            processed_data['bhk'] = 0
            if processed_data['bathrooms'] == 0:
                processed_data['bathrooms'] = 1
                
        input_df = pd.DataFrame([processed_data])
        
        # Predict using the pipeline
        if 'model' not in globals():
            raise Exception("Model is not loaded. Ensure train_model.py was run.")
            
        prediction = float(model.predict(input_df)[0])
        
        # 🌟 NEW: Calculate real mathematical confidence score from Random Forest Variance
        # Extract predictions from all trees in the Random Forest
        rf_regressor = model.named_steps['regressor']
        X_transformed = model.named_steps['preprocessor'].transform(input_df)
        
        tree_predictions = [tree.predict(X_transformed)[0] for tree in rf_regressor.estimators_]
        
        mean_pred = np.mean(tree_predictions)
        std_dev = np.std(tree_predictions)
        
        # Calculate Coefficient of Variation (CV) = (Standard Deviation / Mean)
        # If CV is high (trees wildly disagree), confidence is low.
        # If CV is 0 (all trees agree), confidence is 100%.
        cv = std_dev / mean_pred if mean_pred > 0 else 0
        
        # We scale CV. A CV of 0.20 (20% variance) might drop confidence to ~80%
        # Bound it between 0 and 100.
        confidence = max(0, min(100, 100 - (cv * 150)))
        
        return {
            "estimatedPrice": prediction,
            "confidenceScore": float(round(confidence, 1)),
            "currency": "INR",
            "model_type": "High-Dimensional RandomForestRegressor",
            "status": "success",
            "processed_features": processed_data
        }
    except Exception as e:
        import traceback
        print(f"ERROR: Prediction failed: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
