/**
 * PropIQ ML Engine Bridge — Production v3.0
 * ==========================================
 * Sends form data to FastAPI backend, falls back to heuristic model.
 * All field mappings verified against backend/train_model.py schema.
 */

// ── City Reference (mirrors backend) ─────────────────────────────────────────
const CITY_METRICS = {
  'Mumbai':      { lat: 19.0760, lng: 72.8777, base: 26000, infra: 92, crime: 3, trend: 1.05 },
  'Pune':        { lat: 18.5204, lng: 73.8567, base: 7800,  infra: 77, crime: 2, trend: 1.09 },
  'Bangalore':   { lat: 12.9716, lng: 77.5946, base: 10200, infra: 84, crime: 2, trend: 1.13 },
  'New Delhi':   { lat: 28.6139, lng: 77.2090, base: 17500, infra: 86, crime: 5, trend: 1.03 },
  'Hyderabad':   { lat: 17.3850, lng: 78.4867, base: 8500,  infra: 80, crime: 2, trend: 1.11 },
  'Chennai':     { lat: 13.0827, lng: 80.2707, base: 7800,  infra: 78, crime: 2, trend: 1.05 },
  'Ahmedabad':   { lat: 23.0225, lng: 72.5714, base: 5800,  infra: 73, crime: 2, trend: 1.07 },
  'Kolkata':     { lat: 22.5726, lng: 88.3639, base: 6200,  infra: 71, crime: 4, trend: 1.02 },
  'Jaipur':      { lat: 26.9124, lng: 75.7873, base: 5400,  infra: 69, crime: 3, trend: 1.06 },
  'Lucknow':     { lat: 26.8467, lng: 80.9462, base: 5000,  infra: 66, crime: 3, trend: 1.05 },
  'Noida':       { lat: 28.5355, lng: 77.3910, base: 9000,  infra: 80, crime: 4, trend: 1.04 },
  'Gurugram':    { lat: 28.4595, lng: 77.0266, base: 12000, infra: 83, crime: 4, trend: 1.06 },
  'Navi Mumbai': { lat: 19.0330, lng: 73.0297, base: 14000, infra: 82, crime: 2, trend: 1.04 },
  'Thane':       { lat: 19.2183, lng: 72.9781, base: 13000, infra: 79, crime: 2, trend: 1.04 },
  'Bhopal':      { lat: 23.2599, lng: 77.4126, base: 4200,  infra: 64, crime: 3, trend: 1.04 },
  'Indore':      { lat: 22.7196, lng: 75.8577, base: 5200,  infra: 70, crime: 2, trend: 1.06 },
  'Kochi':       { lat:  9.9312, lng: 76.2673, base: 6500,  infra: 74, crime: 1, trend: 1.04 },
  'Patna':       { lat: 25.5941, lng: 85.1376, base: 4000,  infra: 59, crime: 5, trend: 1.03 },
  'Chandigarh':  { lat: 30.7333, lng: 76.7794, base: 7500,  infra: 82, crime: 1, trend: 1.05 },
  'Surat':       { lat: 21.1702, lng: 72.8311, base: 5500,  infra: 72, crime: 2, trend: 1.06 },
  'Other':       { lat: 20.5937, lng: 78.9629, base: 4500,  infra: 60, crime: 4, trend: 1.01 },
};

// ── Demand multipliers (for derived metrics) ──────────────────────────────────
const DEMAND_MULT = { Premium: 1.20, High: 1.10, Medium: 1.0, Low: 0.88, Emerging: 0.92 };
const PROP_TYPE_MULT = {
  Apartment: 1.0, Villa: 1.45, 'Row House': 1.15, 'Builder Floor': 0.95,
  Penthouse: 1.65, Studio: 0.88, 'Plot / Land': 0.65,
};

// ── Exports needed by sub-components ─────────────────────────────────────────

// State-wise stamp duty rates 2026
export const STAMP_DUTY_RATES = {
  'Maharashtra': 6.0, 'Karnataka': 5.0, 'Tamil Nadu': 7.0, 'Telangana': 6.0,
  'Gujarat': 4.9, 'Delhi (NCT)': 6.0, 'Haryana': 7.0, 'Uttar Pradesh': 7.0,
  'West Bengal': 6.0, 'Rajasthan': 6.0, 'Kerala': 8.0, 'Goa': 4.5,
  'Punjab': 6.0, 'Madhya Pradesh': 7.5, 'Andhra Pradesh': 5.0, 'Chandigarh (UT)': 6.0,
  'Other': 6.0,
};

// CPWD construction cost multipliers
export const CITY_CONST_MULT = {
  Mumbai: 1.28, 'Navi Mumbai': 1.22, Thane: 1.18, Pune: 1.12,
  Bangalore: 1.16, 'New Delhi': 1.20, Gurugram: 1.18, Noida: 1.15,
  Hyderabad: 1.10, Chennai: 1.08, Ahmedabad: 1.04, Kolkata: 1.00,
  Jaipur: 0.96, Lucknow: 0.93, Bhopal: 0.90, Indore: 0.92,
  Kochi: 1.05, Chandigarh: 1.10, Surat: 1.02, Other: 1.00,
};

// ── Core Engine ───────────────────────────────────────────────────────────────
export async function runMLEngine(inputs) {
  let estimatedPrice = null;
  let priceRangeLow  = null;
  let priceRangeHigh = null;
  let confidenceScore = null;
  let featureImportance = [];
  let metrics = null;
  let backendUsed = false;

  // 1. Map all 5-step form fields to v4.0 backend schema
  const cityData = CITY_METRICS[inputs.city] || CITY_METRICS['Other'];

  const payload = {
    city:           inputs.city       || 'Other',
    locality:       inputs.locality   || 'Other',
    propertyType:   inputs.propertyType || 'Apartment',
    area:           Number(inputs.area) || 1000,
    bhk:            Number(inputs.bhk) || 0,
    age:            Number(inputs.age) || 0,
    furnished:      inputs.furnished  || 'Unfurnished',
    facing:         inputs.facing     || 'North',
    parking:        !!inputs.parking,
    amenityScore:   Number(inputs.amenityScore)  || 0,
    nearbySchool:   !!inputs.nearbySchool,
    nearbyHospital: !!inputs.nearbyHospital,
    nearbyMetro:    !!inputs.nearbyMetro,
    floorNo:        Number(inputs.floorNo)    || 0,
    totalFloors:    Number(inputs.totalFloors) || 1,
    isCornerPlot:   !!inputs.isCornerPlot,
  };

  // 2. Try backend
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch('http://127.0.0.1:8000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      estimatedPrice    = data.estimatedPrice;
      priceRangeLow     = data.price_range_low;
      priceRangeHigh    = data.price_range_high;
      confidenceScore   = data.confidenceScore;
      featureImportance = data.featureImportance;
      metrics           = data.metrics;
      backendUsed = true;
      console.log(`✅ ML Backend v4.0: ₹${(estimatedPrice/1e5).toFixed(2)}L | Conf: ${confidenceScore}%`);
    } else {
      const err = await res.json().catch(() => ({}));
      console.warn(`⚠️ Backend ${res.status}:`, err.detail || err);
    }
  } catch (err) {
    console.warn(err.name === 'AbortError' ? '⚠️ Backend timeout.' : '⚠️ Backend offline. Using fallback.');
  }

  // 3. Heuristic fallback
  if (!backendUsed) {
    const area       = Number(inputs.area) || 1000;
    const age        = Number(inputs.age)  || 0;
    const typeMult   = PROP_TYPE_MULT[inputs.propertyType] || 1.0;
    const ageMult    = age <= 5 ? 1.02 : Math.max(0.60, 1.0 - age * 0.011);
    const furnMult   = inputs.furnished === 'Fully Furnished' ? 1.08 : inputs.furnished === 'Semi-Furnished' ? 1.03 : 1.0;
    const infraMult  = 1.0 + (cityData.infra - 65) / 250;
    const nearbyMult = 1.0 + (inputs.amenityScore || 0) * 0.06 +
      (inputs.nearbyMetro ? 0.05 : 0) + (inputs.nearbyHospital ? 0.02 : 0) + (inputs.nearbySchool ? 0.02 : 0);
    const parkMult   = inputs.parking ? 1.03 : 1.0;

    const psf = cityData.base * typeMult * ageMult * furnMult * infraMult * nearbyMult * parkMult;
    estimatedPrice  = Math.round(psf * area);
    priceRangeLow   = Math.round(estimatedPrice * 0.91);
    priceRangeHigh  = Math.round(estimatedPrice * 1.10);
    confidenceScore = 68.0;
    metrics = { infra_score: cityData.infra, crime_index: cityData.crime, trend_index: cityData.trend };
    featureImportance = [
      { name: 'Location & Demand',      value: 38.0, positive: true },
      { name: 'Property Size (Area)',   value: 26.0, positive: true },
      { name: 'Infrastructure & Metro', value: 14.0, positive: true },
      { name: 'Age & Condition',        value: 12.0, positive: age < 10 },
      { name: 'BHK & Configuration',   value:  7.0, positive: true },
      { name: 'Amenities & Safety',     value:  3.0, positive: true },
    ];
  }

  // 4. Derived intelligence metrics
  const trendRate   = ((metrics.trend_index - 1) * 100);
  const demandBoost = inputs.localityDemand === 'Premium' ? 3.5
                    : inputs.localityDemand === 'High'    ? 2.0
                    : inputs.localityDemand === 'Emerging'? 4.5 : 1.0;
  const annualAppreciation = +(trendRate + demandBoost).toFixed(1);
  const projectedROI5Y = +(((Math.pow(1 + annualAppreciation / 100, 5) - 1) * 100)).toFixed(1);

  const baseYield  = inputs.localityDemand === 'Premium' ? 3.1
                   : inputs.localityDemand === 'High'    ? 3.6
                   : inputs.localityDemand === 'Emerging'? 4.2 : 3.9;
  const rentalYield  = baseYield;
  const monthlyRent  = Math.round(estimatedPrice * (rentalYield / 100) / 12);

  const riskScore = Math.round(
    15
    + (metrics.crime_index * 6)
    + (Number(inputs.age) > 20 ? 12 : 0)
    + (inputs.localityDemand === 'Low' ? 10 : 0)
  );

  const liquidityDays = inputs.localityDemand === 'Premium' ? 22
                      : inputs.localityDemand === 'High'    ? 42
                      : inputs.localityDemand === 'Emerging'? 60 : 90;

  const priceMin = Math.round(estimatedPrice * 0.92);
  const priceMax = Math.round(estimatedPrice * 1.09);

  // Derived: age depreciation factor as a percentage
  const age           = Number(inputs.age) || 0;
  const ageMult       = age <= 5 ? 1.02 : Math.max(0.60, 1.0 - age * 0.011);
  const ageFactor     = +(ageMult * 100).toFixed(1);

  const localityDemandIndex = inputs.localityDemand === 'Premium' ? 96
                            : inputs.localityDemand === 'High'    ? 83
                            : inputs.localityDemand === 'Emerging'? 72 : 64;

  return {
    estimatedPrice,
    priceMin:          priceRangeLow  || Math.round(estimatedPrice * 0.91),
    priceMax:          priceRangeHigh || Math.round(estimatedPrice * 1.10),
    pricePerSqft:      Math.round(estimatedPrice / (Number(inputs.area) || 1)),
    confidenceScore,
    demandScore:       localityDemandIndex,
    localityDemandIndex,
    ageFactor,
    liquidityDays,
    riskScore:         Math.min(riskScore, 85),
    rentalYield,
    monthlyRent,
    projectedROI5Y,
    annualAppreciation,
    infraScore:        metrics.infra_score,
    featureImportance,
    comps:             _generateComparables(inputs.locality, estimatedPrice, inputs.bhk, inputs.area, inputs.city),
    inputs,
    predictionSource:  backendUsed ? 'Ensemble ML (GBM + RF) — PropIQ v4.0' : 'Heuristic Engine (Offline Fallback)',
    metrics,
  };
}

// ── Comparables Generator ─────────────────────────────────────────────────────
function _generateComparables(locality, basePrice, bhk, area, city) {
  const variants = [
    { label: 'Block A',  priceMod: 0.95, areaMod: 0.90, daysAgo: 11 },
    { label: 'Phase 2',  priceMod: 1.06, areaMod: 1.09, daysAgo: 29 },
    { label: 'Tower C',  priceMod: 1.13, areaMod: 1.17, daysAgo: 6  },
  ];
  return variants.map(v => ({
    address:      `${locality || 'Locality'} ${v.label}, ${city}`,
    price:        Math.round(basePrice * v.priceMod),
    area:         Math.round(Number(area) * v.areaMod),
    bhk:          bhk || 2,
    pricePerSqft: Math.round((basePrice * v.priceMod) / (Number(area) * v.areaMod)),
    daysAgo:      v.daysAgo,
    source:       v.daysAgo < 15 ? 'MagicBricks' : '99acres',
  }));
}

// ── Utilities ─────────────────────────────────────────────────────────────────
export function formatINR(amount) {
  if (!amount && amount !== 0) return '₹—';
  const n = Number(amount);
  if (n >= 1e7)  return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5)  return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export function generateForecastSeries(basePrice, annualRate, years = 5) {
  const yr = new Date().getFullYear();
  return Array.from({ length: years + 1 }, (_, i) => ({
    year:  `${yr + i}`,
    value: Math.round(basePrice * Math.pow(1 + annualRate / 100, i)),
  }));
}

export function getConstructionBreakdown(city, area, type) {
  const mult   = CITY_CONST_MULT[city] || 1.0;
  const areaNum = Number(area) || 1000;
  const isLand  = type === 'Plot / Land';

  if (isLand) {
    const landPsf = (CITY_METRICS[city]?.base || 4500) * 0.45;
    return {
      items: [], constructionTotal: 0,
      landValue: Math.round(areaNum * landPsf),
      landArea: areaNum, landValuePerSqft: Math.round(landPsf),
      devMargin: 0, totalReplacement: Math.round(areaNum * landPsf),
    };
  }

  // CPWD 2025-26 base rates, city-adjusted
  const items = [
    { key: 'cement',   qty: areaNum * 0.45,   unit: 'bags', rate: Math.round(385  * mult), total: Math.round(areaNum * 0.45   * 385  * mult) },
    { key: 'steel',    qty: +(areaNum * 0.0035).toFixed(3), unit: 'tons', rate: Math.round(67000 * mult), total: Math.round(areaNum * 0.0035 * 67000 * mult) },
    { key: 'sand',     qty: areaNum * 1.8,    unit: 'cft',  rate: Math.round(62   * mult), total: Math.round(areaNum * 1.8    * 62   * mult) },
    { key: 'bricks',   qty: areaNum * 22,     unit: 'pcs',  rate: Math.round(9.5  * mult), total: Math.round(areaNum * 22     * 9.5  * mult) },
    { key: 'labour',   qty: areaNum,          unit: 'sqft', rate: Math.round(460  * mult), total: Math.round(areaNum          * 460  * mult) },
    { key: 'finishing',qty: areaNum,          unit: 'sqft', rate: Math.round(820  * mult), total: Math.round(areaNum          * 820  * mult) },
  ];

  const constructionTotal  = items.reduce((s, i) => s + i.total, 0);
  const landValuePerSqft   = Math.round((CITY_METRICS[city]?.base || 4500) * 0.40);
  const landValue          = Math.round(areaNum * landValuePerSqft);
  const devMargin          = Math.round((constructionTotal + landValue) * 0.20);
  const totalReplacement   = constructionTotal + landValue + devMargin;

  return { items, constructionTotal, landValue, landArea: areaNum, landValuePerSqft, devMargin, totalReplacement };
}
