from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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
    raise FileNotFoundError(f"Model file not found at {MODEL_PATH}. Run train_model.py first.")

model = joblib.load(MODEL_PATH)

class PropertyInputs(BaseModel):
    city: str
    propertyType: str
    bhk: int
    bathrooms: int
    area: float
    age: int

@app.get("/")
async def root():
    return {"status": "online", "message": "PropIQ ML Engine API is running"}

@app.post("/predict")
async def predict(inputs: PropertyInputs):
    try:
        # Prepare data for prediction
        data_dict = inputs.model_dump()
        print(f"DEBUG: Processing prediction request: {data_dict}")
        
        input_df = pd.DataFrame([data_dict])
        
        # Predict using the pipeline
        prediction = model.predict(input_df)[0]
        
        return {
            "estimatedPrice": float(prediction),
            "currency": "INR",
            "model_type": "RandomForestRegressor",
            "status": "success"
        }
    except Exception as e:
        print(f"ERROR: Prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
