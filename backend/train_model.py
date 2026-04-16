import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
import os

print("Generating synthetic real estate dataset for MVP...")

np.random.seed(42)
n_samples = 5000

cities = ['Mumbai', 'Bangalore', 'Pune', 'New Delhi', 'Hyderabad']
prop_types = ['Apartment', 'Villa', 'Builder Floor', 'Studio', 'Penthouse']

data = {
    'city': np.random.choice(cities, n_samples),
    'propertyType': np.random.choice(prop_types, n_samples),
    'bhk': np.random.randint(1, 6, n_samples),
    'bathrooms': np.random.randint(1, 6, n_samples),
    'area': np.random.randint(400, 5000, n_samples),
    'age': np.random.randint(0, 30, n_samples),
}

df = pd.DataFrame(data)

# Baseline mathematical generation to give the model logical patterns to learn
base_prices = {'Mumbai': 25000, 'Bangalore': 9000, 'Pune': 7200, 'New Delhi': 15000, 'Hyderabad': 7500}
type_multipliers = {'Apartment': 1.0, 'Villa': 1.25, 'Builder Floor': 0.95, 'Studio': 0.9, 'Penthouse': 1.3}

prices = []
for idx, row in df.iterrows():
    base = base_prices[row['city']] * row['area']
    mult = type_multipliers[row['propertyType']]
    # Age depreciation (1% per year)
    age_mult = max(0.6, 1 - (row['age'] * 0.01))
    # Bathroom premium
    bath_premium = 1 + (row['bathrooms'] * 0.02)
    
    # Introduce 10% random noise
    noise = np.random.uniform(0.9, 1.1)
    
    final_price = base * mult * age_mult * bath_premium * noise
    prices.append(final_price)

df['price'] = prices

print(f"Generated {n_samples} samples. Training RandomForestRegressor...")

X = df.drop('price', axis=1)
y = df['price']

# Pipeline: One-hot encode categorical features, pass through numerical ones
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

print(f"Model successfully saved to {model_path}")
print("Train score R^2:", pipeline.score(X, y))
