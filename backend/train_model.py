import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
import os

print("Generating enhanced synthetic real estate dataset...")

np.random.seed(42)
n_samples = 7000  # Increased sample size for more types

cities = ['Mumbai', 'Bangalore', 'Pune', 'New Delhi', 'Hyderabad']
# Now including all 7 types supported by the frontend
prop_types = ['Apartment', 'Villa', 'Builder Floor', 'Studio', 'Penthouse', 'Row House', 'Plot / Land']

data = {
    'city': np.random.choice(cities, n_samples),
    'propertyType': np.random.choice(prop_types, n_samples),
    'bhk': np.random.randint(1, 6, n_samples),
    'bathrooms': np.random.randint(1, 6, n_samples),
    'area': np.random.randint(400, 6000, n_samples),
    'age': np.random.randint(0, 30, n_samples),
}

df = pd.DataFrame(data)

# Baseline mathematical constants
base_prices = {
    'Mumbai': 25000, 
    'Bangalore': 9000, 
    'Pune': 7200, 
    'New Delhi': 15000, 
    'Hyderabad': 7500
}

type_multipliers = {
    'Apartment': 1.0, 
    'Villa': 1.25, 
    'Builder Floor': 0.95, 
    'Studio': 0.9, 
    'Penthouse': 1.35, 
    'Row House': 1.15,
    'Plot / Land': 0.7  # Land base is lower but has no depreciation
}

prices = []
for idx, row in df.iterrows():
    base = base_prices.get(row['city'], 5000) * row['area']
    mult = type_multipliers.get(row['propertyType'], 1.0)
    
    if row['propertyType'] == 'Plot / Land':
        # Land doesn't care about BHK or age (appreciates instead)
        # We simulate land at a base rate with slight bonus for bigger area
        age_mult = 1.0 
        bath_premium = 1.0
        bhk_premium = 1.0
    else:
        # Building logic
        age_mult = max(0.6, 1 - (row['age'] * 0.012))
        bath_premium = 1 + (row['bathrooms'] * 0.02)
        bhk_premium = 1 + (row['bhk'] * 0.03)
    
    # Noise for realism
    noise = np.random.uniform(0.92, 1.08)
    
    final_price = base * mult * age_mult * bath_premium * bhk_premium * noise
    prices.append(final_price)

df['price'] = prices

print(f"Generated {n_samples} samples. Training RandomForestRegressor Pipeline...")

X = df.drop('price', axis=1)
y = df['price']

categorical_features = ['city', 'propertyType']
numerical_features = ['bhk', 'bathrooms', 'area', 'age']

preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
        ('num', 'passthrough', numerical_features)
    ]
)

pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
])

pipeline.fit(X, y)

model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
joblib.dump(pipeline, model_path)

print(f"Enhanced Model successfully saved to {model_path}")
print("New Train score R^2:", pipeline.score(X, y))
