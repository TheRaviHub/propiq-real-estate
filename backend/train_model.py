"""
PropIQ ML Training Pipeline - v4.0
Enhanced features: amenity_score, nearby_score, floor_ratio, is_corner
Models: HGBR + RandomForest ensemble with 5-fold CV
"""
import sys, os
sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None

import pandas as pd, numpy as np
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score, KFold
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.impute import SimpleImputer
import joblib, warnings
warnings.filterwarnings('ignore')

print("=" * 60)
print("  PropIQ Intelligence Engine - Training Pipeline v4.0")
print("=" * 60)

np.random.seed(42)
N = 80_000   # Larger dataset for better generalization

CITY_METRICS = {
    'Mumbai':      {'lat': 19.076,  'lng': 72.878, 'base': 26000, 'infra': 92, 'crime': 3, 'trend': 1.05},
    'Pune':        {'lat': 18.520,  'lng': 73.857, 'base': 7800,  'infra': 77, 'crime': 2, 'trend': 1.09},
    'Bangalore':   {'lat': 12.972,  'lng': 77.595, 'base': 10200, 'infra': 84, 'crime': 2, 'trend': 1.13},
    'New Delhi':   {'lat': 28.614,  'lng': 77.209, 'base': 17500, 'infra': 86, 'crime': 5, 'trend': 1.03},
    'Hyderabad':   {'lat': 17.385,  'lng': 78.487, 'base': 8500,  'infra': 80, 'crime': 2, 'trend': 1.11},
    'Chennai':     {'lat': 13.083,  'lng': 80.271, 'base': 7800,  'infra': 78, 'crime': 2, 'trend': 1.05},
    'Ahmedabad':   {'lat': 23.023,  'lng': 72.571, 'base': 5800,  'infra': 73, 'crime': 2, 'trend': 1.07},
    'Kolkata':     {'lat': 22.573,  'lng': 88.364, 'base': 6200,  'infra': 71, 'crime': 4, 'trend': 1.02},
    'Jaipur':      {'lat': 26.912,  'lng': 75.787, 'base': 5400,  'infra': 69, 'crime': 3, 'trend': 1.06},
    'Lucknow':     {'lat': 26.847,  'lng': 80.946, 'base': 5000,  'infra': 66, 'crime': 3, 'trend': 1.05},
    'Noida':       {'lat': 28.536,  'lng': 77.391, 'base': 9000,  'infra': 80, 'crime': 4, 'trend': 1.04},
    'Gurugram':    {'lat': 28.460,  'lng': 77.027, 'base': 12000, 'infra': 83, 'crime': 4, 'trend': 1.06},
    'Navi Mumbai': {'lat': 19.033,  'lng': 73.030, 'base': 14000, 'infra': 82, 'crime': 2, 'trend': 1.04},
    'Thane':       {'lat': 19.218,  'lng': 72.978, 'base': 13000, 'infra': 79, 'crime': 2, 'trend': 1.04},
    'Chandigarh':  {'lat': 30.733,  'lng': 76.779, 'base': 7500,  'infra': 82, 'crime': 1, 'trend': 1.05},
    'Bhopal':      {'lat': 23.260,  'lng': 77.413, 'base': 4200,  'infra': 64, 'crime': 3, 'trend': 1.04},
    'Indore':      {'lat': 22.720,  'lng': 75.858, 'base': 5200,  'infra': 70, 'crime': 2, 'trend': 1.06},
    'Kochi':       {'lat':  9.931,  'lng': 76.267, 'base': 6500,  'infra': 74, 'crime': 1, 'trend': 1.04},
    'Surat':       {'lat': 21.170,  'lng': 72.831, 'base': 5500,  'infra': 72, 'crime': 2, 'trend': 1.06},
    'Patna':       {'lat': 25.594,  'lng': 85.138, 'base': 4000,  'infra': 59, 'crime': 5, 'trend': 1.03},
    'Other':       {'lat': 20.594,  'lng': 78.963, 'base': 4500,  'infra': 60, 'crime': 4, 'trend': 1.01},
}

LOCALITIES = [
    'Juhu', 'Worli', 'Bandra West', 'Powai', 'Andheri West', 'Lower Parel',
    'Prabhadevi', 'Dadar', 'Connaught Place', 'Hauz Khas', 'Vasant Kunj',
    'Defence Colony', 'Dwarka', 'Rohini', 'Koramangala', 'Indiranagar',
    'Whitefield', 'HSR Layout', 'Bellandur', 'Hebbal', 'Electronic City',
    'Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'HITEC City',
    'Kondapur', 'Madhapur', 'Anna Nagar', 'T. Nagar', 'Adyar', 'Velachery',
    'Koregaon Park', 'Baner', 'Hinjewadi', 'Viman Nagar',
    'Prahlad Nagar', 'Vastrapur', 'Satellite', 'Salt Lake', 'New Town',
    'Vaishali Nagar', 'Gomti Nagar', 'DLF Phase 1', 'DLF Phase 2',
    'Golf Course Road', 'Other',
]

LOC_PREMIUM = {
    'Juhu': 2.1, 'Worli': 2.3, 'Bandra West': 1.9, 'Powai': 1.35, 'Andheri West': 1.2,
    'Lower Parel': 1.7, 'Prabhadevi': 1.65, 'Dadar': 1.4,
    'Connaught Place': 2.6, 'Hauz Khas': 1.65, 'Vasant Kunj': 1.55,
    'Defence Colony': 2.0, 'Dwarka': 1.05, 'Rohini': 0.95,
    'Koramangala': 1.45, 'Indiranagar': 1.5, 'Whitefield': 1.15, 'HSR Layout': 1.25,
    'Bellandur': 1.2, 'Hebbal': 1.3, 'Electronic City': 0.95,
    'Banjara Hills': 1.85, 'Jubilee Hills': 2.05, 'Gachibowli': 1.25, 'HITEC City': 1.3,
    'Kondapur': 1.2, 'Madhapur': 1.2, 'Anna Nagar': 1.4, 'T. Nagar': 1.5,
    'Adyar': 1.55, 'Velachery': 1.15, 'Koregaon Park': 1.55, 'Baner': 1.3,
    'Hinjewadi': 1.2, 'Viman Nagar': 1.35, 'Prahlad Nagar': 1.3, 'Vastrapur': 1.2,
    'Satellite': 1.25, 'Salt Lake': 1.4, 'New Town': 1.2,
    'Vaishali Nagar': 1.15, 'Gomti Nagar': 1.2, 'DLF Phase 1': 1.7,
    'DLF Phase 2': 1.65, 'Golf Course Road': 1.8, 'Other': 1.0,
}

PTYPE_MULT   = {'Apartment': 1.0, 'Villa': 1.45, 'Builder Floor': 0.95, 'Penthouse': 1.65, 'Studio': 0.88, 'Plot / Land': 0.65}
FURNISH_MULT = {'Fully Furnished': 1.08, 'Semi-Furnished': 1.03, 'Unfurnished': 1.0}
FACING_MULT  = {'North': 1.04, 'North-East': 1.06, 'East': 1.03, 'South-East': 0.98, 'South': 1.0, 'South-West': 0.96, 'West': 0.99, 'North-West': 1.02, 'Corner': 1.05}

city_list   = list(CITY_METRICS.keys())
p_types     = list(PTYPE_MULT.keys())
furnishings = list(FURNISH_MULT.keys())
facings     = list(FACING_MULT.keys())
city_probs  = [0.11,0.08,0.10,0.08,0.08,0.06,0.05,0.04,0.04,0.04,0.04,0.04,0.04,0.03,0.03,0.02,0.02,0.02,0.02,0.02,0.04]

print(f"\n[1/4] Generating {N:,} property records...")

records = []
for _ in range(N):
    city   = np.random.choice(city_list, p=city_probs)
    m      = CITY_METRICS[city]
    loc    = np.random.choice(LOCALITIES) if np.random.rand() < 0.65 else 'Other'
    loc_p  = LOC_PREMIUM.get(loc, 1.0)
    p_type = np.random.choice(p_types, p=[0.50, 0.12, 0.10, 0.07, 0.10, 0.11])
    furnish = np.random.choice(furnishings, p=[0.30, 0.45, 0.25])
    facing  = np.random.choice(facings)

    if p_type == 'Studio':
        area, bhk = int(np.random.uniform(250,750)), 0
    elif p_type == 'Plot / Land':
        area, bhk = int(np.random.uniform(800,10000)), 0
    elif p_type == 'Penthouse':
        bhk  = np.random.choice([3,4,5])
        area = int(np.random.uniform(2500,8000))
    elif p_type == 'Villa':
        bhk  = np.random.choice([3,4,5])
        area = int(np.random.uniform(1800,6000))
    elif p_type == 'Builder Floor':
        bhk  = np.random.choice([2,3,4], p=[0.35,0.45,0.20])
        area = int(np.random.uniform(700,2500))
    else:  # Apartment
        bhk  = np.random.choice([1,2,3,4,5], p=[0.15,0.35,0.35,0.12,0.03])
        base_a = {1:400,2:650,3:950,4:1300,5:1900}[bhk]
        area = int(np.random.uniform(base_a, base_a * 2.5))

    age = int(min(np.random.exponential(7), 45))

    # NEW: amenity & nearby scores (0-1)
    amenity_score = float(np.random.beta(2, 3))  # realistic distribution
    nearby_score  = float(np.random.beta(2, 2))

    # Floor ratio
    if p_type in ['Villa', 'Plot / Land', 'Builder Floor']:
        floor_ratio = 0.0
        is_corner   = int(np.random.rand() < 0.15)
    else:
        floor_no    = np.random.randint(0, 30)
        total_fl    = max(floor_no + 1, np.random.randint(1, 35))
        floor_ratio = floor_no / total_fl
        is_corner   = 0

    park  = int(np.random.rand() < 0.70)

    lat = m['lat'] + np.random.normal(0, 0.06)
    lng = m['lng'] + np.random.normal(0, 0.06)

    # Price formula
    age_m   = 1.02 if age <= 5 else max(0.60, 1.0 - age * 0.011)
    floor_m = 1.0 + floor_ratio * 0.06  # higher floors slight premium
    corner_m = 1.04 if is_corner else 1.0
    nearby_m = 1.0 + nearby_score * 0.08
    amenity_m = 1.0 + amenity_score * 0.06
    infra_m = 1.0 + (m['infra'] - 65) / 250
    crime_m = 1.0 - (m['crime'] - 2) / 60

    psf = (m['base'] * loc_p
           * PTYPE_MULT[p_type]
           * FURNISH_MULT[furnish]
           * FACING_MULT.get(facing, 1.0)
           * age_m * floor_m * corner_m * nearby_m * amenity_m
           * infra_m * crime_m * m['trend']
           * (1.0 + park * 0.03)
           * (1.0 + np.random.normal(0, 0.05)))
    psf = max(psf, 1500)

    records.append({
        'city': city, 'locality': loc, 'propertyType': p_type,
        'furnished': furnish, 'facing': facing,
        'latitude': round(lat, 6), 'longitude': round(lng, 6),
        'area': area, 'bhk': bhk, 'age': age,
        'infrastructure_score': m['infra'],
        'crime_rate_index': m['crime'],
        'market_trend_index': m['trend'],
        'parking': park,
        'amenity_score': round(amenity_score, 3),
        'nearby_score': round(nearby_score, 3),
        'floor_ratio': round(floor_ratio, 3),
        'is_corner': is_corner,
        'price': round(psf * area),
    })

df = pd.DataFrame(records)
print(f"    Raw: {len(df):,} rows | Median: Rs{df.price.median()/1e5:.1f}L")

# Outlier removal via IQR
Q1, Q3 = df.price.quantile(0.01), df.price.quantile(0.99)
df = df[(df.price >= Q1) & (df.price <= Q3)].reset_index(drop=True)
print(f"    After IQR clip: {len(df):,} rows")

print("\n[2/4] Building pipeline...")
CAT_FEATS = ['city', 'locality', 'propertyType', 'furnished', 'facing']
NUM_FEATS  = [
    'latitude', 'longitude', 'area', 'bhk', 'age',
    'infrastructure_score', 'crime_rate_index', 'market_trend_index',
    'parking', 'amenity_score', 'nearby_score', 'floor_ratio', 'is_corner',
]

X = df[CAT_FEATS + NUM_FEATS]
y = df['price']

preprocessor = ColumnTransformer([
    ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), CAT_FEATS),
    ('num', Pipeline([
        ('imp', SimpleImputer(strategy='median')),
        ('scl', StandardScaler()),
    ]), NUM_FEATS),
], remainder='drop')

hgbr = HistGradientBoostingRegressor(
    max_iter=400, learning_rate=0.04, max_depth=9,
    min_samples_leaf=15, l2_regularization=0.08, random_state=42
)
rf = RandomForestRegressor(
    n_estimators=200, max_depth=22, min_samples_leaf=6,
    n_jobs=-1, random_state=42
)

pipe_hgbr = Pipeline([('preprocessor', preprocessor), ('regressor', hgbr)])
pipe_rf   = Pipeline([
    ('preprocessor', ColumnTransformer([
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), CAT_FEATS),
        ('num', Pipeline([('imp', SimpleImputer(strategy='median')), ('scl', StandardScaler())]), NUM_FEATS),
    ], remainder='drop')),
    ('regressor', rf)
])

print("\n[3/4] Cross-validating (5-fold)...")
kf = KFold(n_splits=5, shuffle=True, random_state=42)
cv_r2 = cross_val_score(pipe_hgbr, X, y, cv=kf, scoring='r2', n_jobs=-1)
print(f"    HGBR CV R²: {cv_r2.mean():.4f} ± {cv_r2.std():.4f}")

print("\n    Fitting final ensemble on full data...")
pipe_hgbr.fit(X, y)
pipe_rf.fit(X, y)

model_bundle = {'hgbr': pipe_hgbr, 'rf': pipe_rf, 'w_hgbr': 0.60, 'w_rf': 0.40}

y_pred   = model_bundle['hgbr'].predict(X) * 0.60 + model_bundle['rf'].predict(X) * 0.40
final_r2 = r2_score(y, y_pred)
final_mae = mean_absolute_error(y, y_pred)
print(f"    Ensemble Train R²: {final_r2:.4f} | MAE: Rs{final_mae/1e5:.2f}L")

if final_r2 < 0.82:
    print("    ⚠️  R² below 0.82 threshold — check data distribution")
else:
    print("    ✅  Quality bar passed (R² ≥ 0.82)")

print("\n[4/4] Saving model...")
model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'model.pkl')
joblib.dump(model_bundle, model_path, compress=3)
size_mb = os.path.getsize(model_path) / 1e6
print(f"    Saved: {model_path} ({size_mb:.1f} MB)")

print("\n" + "=" * 60)
print(f"  TRAINING COMPLETE — R²={final_r2:.4f} | MAE=Rs{final_mae/1e5:.2f}L")
print("=" * 60)
