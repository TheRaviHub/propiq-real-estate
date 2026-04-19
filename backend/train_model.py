import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import joblib
import os

print("Generating high-dimensional synthetic real estate dataset with true LOCALITY pricing...")

np.random.seed(42)
n_samples = 20000  # Increased for locality depth

# Extracted from frontend CITY_LOCALITIES (partial representation for major hubs)
LOCALITY_BASE_PRICES = {
    # Mumbai
    'Bandra West': 45000, 'Andheri West': 22000, 'Powai': 24000, 'Juhu': 50000, 'Malad West': 16000, 'Borivali': 15000, 'Thane': 12000, 'Navi Mumbai': 10000, 'Worli': 55000, 'Lower Parel': 42000, 'Chembur': 19000,
    # Bangalore
    'Koramangala': 12000, 'Indiranagar': 14000, 'Whitefield': 9000, 'Electronic City': 6500, 'HSR Layout': 10000, 'Marathahalli': 8500, 'Jayanagar': 13000, 'Bannerghatta Road': 7500, 'Sarjapur Road': 8000, 'Yelahanka': 7000,
    # Pune
    'Koregaon Park': 15000, 'Baner': 9500, 'Hinjewadi': 7000, 'Viman Nagar': 11000, 'Kharadi': 8500, 'Wakad': 7500, 'Hadapsar': 7000, 'Kalyani Nagar': 13000, 'Aundh': 10500,
    # New Delhi
    'Connaught Place': 35000, 'Hauz Khas': 25000, 'Vasant Kunj': 20000, 'Dwarka': 12000, 'Rohini': 11000, 'Pitampura': 13000, 'South Extension': 28000, 'Lajpat Nagar': 18000, 'Defence Colony': 30000,
    # Hyderabad
    'Banjara Hills': 16000, 'Jubilee Hills': 18000, 'Gachibowli': 9500, 'Kondapur': 9000, 'Madhapur': 10000, 'HITEC City': 11000, 'Kukatpally': 7500, 'Miyapur': 6500, 'Begumpet': 8500,
    # Chennai
    'Anna Nagar': 14000, 'T. Nagar': 15000, 'Adyar': 16000, 'Velachery': 9500, 'Perambur': 7000, 'OMR': 6500, 'Porur': 7500, 'Tambaram': 6000, 'Sholinganallur': 7000,
}

CITY_LOCALITIES_MAP = {
    'Mumbai': ['Bandra West', 'Andheri West', 'Powai', 'Juhu', 'Malad West', 'Borivali', 'Thane', 'Navi Mumbai', 'Worli', 'Lower Parel', 'Chembur', 'Other'],
    'Bangalore': ['Koramangala', 'Indiranagar', 'Whitefield', 'Electronic City', 'HSR Layout', 'Marathahalli', 'Jayanagar', 'Bannerghatta Road', 'Sarjapur Road', 'Yelahanka', 'Other'],
    'Pune': ['Koregaon Park', 'Baner', 'Hinjewadi', 'Viman Nagar', 'Kharadi', 'Wakad', 'Hadapsar', 'Kalyani Nagar', 'Aundh', 'Other'],
    'New Delhi': ['Connaught Place', 'Hauz Khas', 'Vasant Kunj', 'Dwarka', 'Rohini', 'Pitampura', 'South Extension', 'Lajpat Nagar', 'Defence Colony', 'Other'],
    'Hyderabad': ['Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Kondapur', 'Madhapur', 'HITEC City', 'Kukatpally', 'Miyapur', 'Begumpet', 'Other'],
    'Chennai': ['Anna Nagar', 'T. Nagar', 'Adyar', 'Velachery', 'Perambur', 'OMR', 'Porur', 'Tambaram', 'Sholinganallur', 'Other'],
}

cities = list(CITY_LOCALITIES_MAP.keys())
prop_types = ['Apartment', 'Villa', 'Builder Floor', 'Studio', 'Penthouse', 'Row House', 'Plot / Land']
demands = ['Premium', 'High', 'Medium', 'Low', 'Emerging']
furnishings = ['Fully Furnished', 'Semi-Furnished', 'Unfurnished']
facings = ['North', 'East', 'South', 'West', 'North-East', 'South-East', 'South-West', 'North-West']

# Build initial dataframe
df_data = []
for _ in range(n_samples):
    city = np.random.choice(cities)
    locality = np.random.choice(CITY_LOCALITIES_MAP[city])
    df_data.append({
        'city': city,
        'locality': locality,
        'propertyType': np.random.choice(prop_types),
        'localityDemand': np.random.choice(demands),
        'furnished': np.random.choice(furnishings),
        'facing': np.random.choice(facings),
        'bhk': np.random.randint(1, 6),
        'bathrooms': np.random.randint(1, 6),
        'area': np.random.randint(400, 6000),
        'age': np.random.randint(0, 30),
        'floor': np.random.randint(0, 30),
        'totalFloors': np.random.randint(4, 40),
        'amenitiesCount': np.random.randint(0, 10),
        'gatedSociety': np.random.choice([True, False]),
        'parking': np.random.choice([True, False]),
        'plotArea': 0.0,
        'terraceArea': 0.0
    })

df = pd.DataFrame(df_data)

# Baseline city defaults if locality is 'Other'
base_prices_city = {
    'Mumbai': 25000, 'Bangalore': 9000, 'Pune': 7200, 
    'New Delhi': 15000, 'Hyderabad': 7500, 'Chennai': 7000
}

demand_mults = {'Premium': 1.45, 'High': 1.25, 'Medium': 1.0, 'Low': 0.78, 'Emerging': 0.9}
furnish_mults = {'Fully Furnished': 1.10, 'Semi-Furnished': 1.04, 'Unfurnished': 1.0}
facing_mults = {'North': 1.03, 'North-East': 1.04, 'East': 1.02, 'North-West': 1.01, 'West': 1.00, 'South-East': 1.00, 'South': 0.99, 'South-West': 0.98}
type_multipliers = {
    'Apartment': 1.0, 'Villa': 1.25, 'Builder Floor': 0.95, 
    'Studio': 0.9, 'Penthouse': 1.35, 'Row House': 1.15, 'Plot / Land': 0.7 
}

prices = []
for idx, row in df.iterrows():
    city = row['city']
    locality = row['locality']
    ptype = row['propertyType']
    demand = row['localityDemand']
    
    # 🌟 NEW: Use exact LOCALITY base price instead of broad city price
    base_rate = LOCALITY_BASE_PRICES.get(locality, base_prices_city.get(city, 5000))
    base = base_rate * row['area']
    
    mult = type_multipliers.get(ptype, 1.0)
    dem_mult = demand_mults.get(demand, 1.0)
    furn_mult = furnish_mults.get(row['furnished'], 1.0)
    face_mult = facing_mults.get(row['facing'], 1.0)
    
    if ptype == 'Plot / Land':
        df.at[idx, 'bhk'] = 0
        df.at[idx, 'bathrooms'] = 0
        df.at[idx, 'age'] = 0
        df.at[idx, 'floor'] = 0
        df.at[idx, 'totalFloors'] = 0
        df.at[idx, 'furnished'] = 'Unfurnished'
        df.at[idx, 'plotArea'] = max(row['area'], np.random.randint(1000, 10000))
        furn_mult = 1.0
        
        age_mult = 1.0 
        bath_premium = 1.0
        bhk_premium = 1.0
        amenity_premium = 1.0 + (row['amenitiesCount'] * 0.008)
        
        base = base_rate * df.at[idx, 'plotArea'] * 0.5
        
    elif ptype == 'Studio':
        df.at[idx, 'bhk'] = 0
        df.at[idx, 'bathrooms'] = 1
        bhk_premium = 1.0
        bath_premium = 1.0
        age_mult = max(0.6, 1 - (row['age'] * 0.012))
        amenity_premium = 1.0 + (row['amenitiesCount'] * 0.012)
        
    elif ptype in ['Villa', 'Row House']:
        df.at[idx, 'plotArea'] = max(row['area'] * 0.8, np.random.randint(1500, 5000))
        df.at[idx, 'floor'] = 0
        df.at[idx, 'totalFloors'] = np.random.randint(1, 4)
        
        plot_premium = min(1 + (df.at[idx, 'plotArea'] / df.at[idx, 'area']) * 0.35, 1.40) if df.at[idx, 'area'] > 0 else 1.0
        mult *= plot_premium
        
        age_mult = max(0.6, 1 - (row['age'] * 0.012))
        bath_premium = 1 + (row['bathrooms'] * 0.02)
        bhk_premium = 1 + (row['bhk'] * 0.03)
        amenity_premium = 1.0 + (row['amenitiesCount'] * 0.012)
        
    elif ptype == 'Penthouse':
        df.at[idx, 'floor'] = df.at[idx, 'totalFloors'] 
        df.at[idx, 'terraceArea'] = np.random.randint(200, 1500)
        
        terrace_premium = min(1 + (df.at[idx, 'terraceArea'] / df.at[idx, 'area']) * 0.28, 1.30) if df.at[idx, 'area'] > 0 else 1.0
        mult *= terrace_premium
        
        age_mult = max(0.6, 1 - (row['age'] * 0.012))
        bath_premium = 1 + (row['bathrooms'] * 0.02)
        bhk_premium = 1 + (row['bhk'] * 0.03)
        amenity_premium = 1.0 + (row['amenitiesCount'] * 0.012)
        
    else:
        df.at[idx, 'floor'] = min(row['floor'], row['totalFloors'])
        floor_premium = 1.03 if df.at[idx, 'floor'] > 3 else 1.0
        
        age_mult = max(0.6, 1 - (row['age'] * 0.012))
        if demand in ['Premium', 'High'] and row['age'] > 10:
            age_mult += 0.1 
            
        bath_premium = 1 + (row['bathrooms'] * 0.02)
        bhk_premium = 1 + (row['bhk'] * 0.03)
        amenity_premium = 1.0 + (row['amenitiesCount'] * 0.012)
        mult *= floor_premium

    gated_premium = 1.05 if row['gatedSociety'] else 1.0
    parking_premium = 1.04 if row['parking'] else 1.0
    
    noise_range = 0.08 if demand == 'Premium' else 0.15 
    noise = np.random.uniform(1.0 - noise_range, 1.0 + noise_range)
    
    final_price = base * mult * dem_mult * furn_mult * face_mult * age_mult * bath_premium * bhk_premium * amenity_premium * gated_premium * parking_premium * noise
    prices.append(final_price)

df['price'] = prices

X = df.drop('price', axis=1)
y = df['price']

# 🌟 NEW: Added `locality` as a categorical feature so the Random Forest learns Whitefield vs Indiranagar
categorical_features = ['city', 'locality', 'propertyType', 'localityDemand', 'furnished', 'facing']
numerical_features = ['bhk', 'bathrooms', 'area', 'age', 'floor', 'totalFloors', 'amenitiesCount', 'plotArea', 'terraceArea']
boolean_features = ['gatedSociety', 'parking']

for col in boolean_features:
    X[col] = X[col].astype(int)

numerical_features.extend(boolean_features)

preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
        ('num', Pipeline([
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ]), numerical_features)
    ]
)

pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=100, max_depth=25, min_samples_split=5, random_state=42, n_jobs=-1))
])

pipeline.fit(X, y)

model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
joblib.dump(pipeline, model_path)

print(f"Enhanced Locality-Aware Model saved to {model_path}")
print("New Train score R^2:", pipeline.score(X, y))
