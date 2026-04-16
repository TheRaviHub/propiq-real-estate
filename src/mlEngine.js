/**
 * Core ML Intelligence Engine (simulated)
 * Production: POST /api/predict → structured intelligence output
 */

// ── City base prices (₹/sqft) ─────────────────────────────────────────────
const CITY_BASE_PRICES = {
  Mumbai: 25000, Pune: 7200, Nagpur: 4500, Nashik: 4000, Aurangabad: 3500,
  'New Delhi': 15000, Noida: 6000, Gurgaon: 11000, Faridabad: 5500, Ghaziabad: 5200,
  Bangalore: 9000, Mysuru: 5000, Mangalore: 4200, 'Hubli-Dharwad': 3800,
  Hyderabad: 7500, Warangal: 3200, Nizamabad: 2800,
  Visakhapatnam: 5500, Vijayawada: 4500, Guntur: 3500, Tirupati: 4000,
  Chennai: 7000, Coimbatore: 5000, Madurai: 3800, Salem: 3200,
  Ahmedabad: 5000, Surat: 5500, Vadodara: 4500, Rajkot: 4000,
  Kolkata: 5500, Howrah: 4500, Durgapur: 3200, Siliguri: 3000,
  Jaipur: 5000, Jodhpur: 3800, Udaipur: 4200, Kota: 3200,
  Lucknow: 4500, Kanpur: 3500, Agra: 3200, Varanasi: 3000,
  Bhopal: 4000, Indore: 5000, Gwalior: 3200, Jabalpur: 3000,
  Chandigarh: 6500, Ludhiana: 4500, Amritsar: 4000, Jalandhar: 3800,
  Kochi: 6500, Thiruvananthapuram: 5500, Kozhikode: 4500, Thrissur: 4800,
  Other: 4000,
};

// ── Infrastructure scores by city (0–1) ──────────────────────────────────
const INFRA_SCORES = {
  Mumbai: 0.87, 'New Delhi': 0.84, Gurgaon: 0.83, Bangalore: 0.79,
  Hyderabad: 0.76, Chennai: 0.74, Pune: 0.73, Kolkata: 0.70,
  Noida: 0.74, Ahmedabad: 0.72, Kochi: 0.74, Chandigarh: 0.78,
  Indore: 0.70, Jaipur: 0.70, Lucknow: 0.68, Surat: 0.72,
  Faridabad: 0.66, Ghaziabad: 0.65, Visakhapatnam: 0.70, Coimbatore: 0.69,
  Other: 0.60,
};

// ── Locality demand multipliers ───────────────────────────────────────────
const LOCALITY_DEMAND = {
  Premium: 1.45, High: 1.25, Medium: 1.0, Low: 0.78, Emerging: 0.9,
};

// ── Property type premium multipliers ────────────────────────────────────
const PROPERTY_TYPE_MULT = {
  'Apartment':     1.00,
  'Villa':         1.22,
  'Row House':     1.08,
  'Builder Floor': 0.94,
  'Penthouse':     1.30,
  'Studio':        0.90,
};

// ── Facing direction premiums ─────────────────────────────────────────────
const FACING_PREMIUM = {
  'North':      1.03,
  'North-East': 1.04,
  'East':       1.02,
  'North-West': 1.01,
  'West':       1.00,
  'South-East': 1.00,
  'South':      0.99,
  'South-West': 0.98,
};

// ── Land values per city (₹/sqft of land) — for construction breakdown ───
export const CITY_LAND_VALUES = {
  Mumbai: 28000, Gurgaon: 14000, 'New Delhi': 16000, Bangalore: 9500,
  Hyderabad: 6000, Chennai: 7500, Pune: 6000, Noida: 5500,
  Kolkata: 5000, Ahmedabad: 4500, Kochi: 6000, Chandigarh: 7000,
  Indore: 4000, Jaipur: 4500, Lucknow: 4000, Surat: 4800,
  Faridabad: 4500, Ghaziabad: 4200, Coimbatore: 4000, Visakhapatnam: 5000,
  Other: 3500,
};

// ── State stamp duty rates (%) ────────────────────────────────────────────
export const STAMP_DUTY_RATES = {
  'Maharashtra':    6.0,
  'Karnataka':      5.6,
  'Delhi (NCT)':    6.0,
  'Tamil Nadu':     7.0,
  'Telangana':      6.0,
  'Andhra Pradesh': 5.0,
  'Gujarat':        4.9,
  'West Bengal':    7.0,
  'Rajasthan':      6.0,
  'Uttar Pradesh':  7.0,
  'Madhya Pradesh': 7.5,
  'Punjab':         6.0,
  'Kerala':         8.0,
  'Other':          6.0,
};

// ── CPWD 2025-26 material rates (national base) ───────────────────────────
export const MATERIAL_RATES = {
  // per 50kg bag
  cement:  { rate: 380, unit: '50kg bag', perSqft: 0.40 },
  // per kg
  steel:   { rate: 62,  unit: 'kg',       perSqft: 3.80 },
  // per cubic metre  
  sand:    { rate: 2200, unit: 'cu.m',    perSqft: 0.055 },
  // per brick
  bricks:  { rate: 7.5, unit: 'brick',   perSqft: 9.5 },
  // per sqft
  labour:  { rate: 450, unit: 'sqft',    perSqft: 1 },
  // per sqft
  finishing: { rate: 750, unit: 'sqft',  perSqft: 1 },
};

// City construction cost multipliers (vs national base)
export const CITY_CONST_MULT = {
  Mumbai: 1.30, Gurgaon: 1.20, 'New Delhi': 1.18, Bangalore: 1.14,
  Hyderabad: 1.10, Chennai: 1.08, Pune: 1.10, Noida: 1.12,
  Kolkata: 1.05, Ahmedabad: 1.05, Kochi: 1.08, Chandigarh: 1.10,
  Other: 1.00,
};

// Property type construction complexity multiplier
const PROP_CONST_MULT = {
  'Apartment': 1.0, 'Villa': 1.20, 'Row House': 1.10,
  'Builder Floor': 0.95, 'Penthouse': 1.25, 'Studio': 0.90,
};

// ── Helper: Compute full construction cost breakdown ──────────────────────
export function getConstructionBreakdown(city, area, propertyType = 'Apartment') {
  const cityMult = CITY_CONST_MULT[city] || 1.0;
  const propMult = PROP_CONST_MULT[propertyType] || 1.0;

  const items = Object.entries(MATERIAL_RATES).map(([key, m]) => {
    const qty     = +(m.perSqft * area).toFixed(2);
    const rate    = Math.round(m.rate * cityMult * propMult);
    const total   = Math.round(qty * rate);
    return { key, qty, rate, total, unit: m.unit };
  });

  const constructionTotal = items.reduce((s, i) => s + i.total, 0);
  const landValuePerSqft  = CITY_LAND_VALUES[city] || 4000;
  // Assume land = 30% of built-up footprint (typical FAR ratio)
  const landArea    = Math.round(area * 0.30);
  const landValue   = landArea * landValuePerSqft;
  const devMargin   = Math.round(constructionTotal * 0.20);
  const totalReplacement = constructionTotal + landValue + devMargin;

  return { items, constructionTotal, landValue, landArea, landValuePerSqft, devMargin, totalReplacement };
}

// ── Age depreciation ─────────────────────────────────────────────────────
function ageDepreciation(years) {
  if (years <= 2)  return 1.00;
  if (years <= 5)  return 0.97;
  if (years <= 10) return 0.93;
  if (years <= 20) return 0.85;
  if (years <= 30) return 0.75;
  return 0.65;
}

/**
 * Core ML Intelligence Engine (Async Bridge to Python Backend)
 * Falls back to simulation if backend is unreachable.
 */
export async function runMLEngine(inputs) {
  const {
    city = 'Bangalore', locality = 'Koramangala',
    localityDemand = 'High',
    area = 1200, bhk = 3, age = 5,
    parking = true, furnished = 'Semi-Furnished',
    floor = 5, totalFloors = 12, amenities = [],
    propertyType  = 'Apartment',
    facing        = '',
    bathrooms     = bhk,
    balconies     = 1,
    gatedSociety  = null,
    cornerUnit    = false,
    liftAvailable = null,
    // ── Villa / Row House ───────────────────────────────────────────────
    plotArea      = 0,     // land area sqft — CRITICAL for land-based types
    villaFloors   = 1,     // number of storeys in villa
    privateGarden = null,
    privatePool   = null,
    servantRooms  = 0,
    parkingSpots  = 0,
    // ── Penthouse ───────────────────────────────────────────────────────
    terraceArea   = 0,     // private terrace sqft — CRITICAL for penthouse
    privateLift   = null,
    doubleCeiling = null,
    smartHome     = null,
    // ── Builder Floor ───────────────────────────────────────────────────
    independentEntry = null,
    terraceAccess    = null,
    basementAccess   = null,
    // ── Studio ──────────────────────────────────────────────────────────
    kitchenType      = '',
    managedApartment = null,
    loftMezzanine    = null,
    // ── Plot / Land ─────────────────────────────────────────────────────
    zoneClassification = '',
    legalStatus        = '',
    sewerAvailable     = null,
  } = inputs;

  let estimatedPrice = null;
  let backendUsed = false;

  // 1. Try to fetch from the newly created Python Backend (Phase 2)
  try {
    const response = await fetch('http://127.0.0.1:8000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city: city || 'Bangalore',
        propertyType: propertyType || 'Apartment',
        bhk: parseInt(bhk) || 0,
        bathrooms: parseInt(bathrooms) || 0,
        area: parseFloat(area || plotArea || 0),
        age: parseInt(age) || 0
      })
    });

    if (response.ok) {
      const data = await response.json();
      estimatedPrice = data.estimatedPrice;
      backendUsed = true;
      console.log("✅ ML Prediction from Backend:", estimatedPrice);
    }
  } catch (err) {
    console.warn("⚠️ Python Backend offline. Falling back to local JS simulation.");
  }

  // 1.1 Local results will now carry the source flag
  const predictionSource = backendUsed ? 'Real-time Machine Learning' : 'Heuristic Simulation (Fallback)';


  // ══ PLOT / LAND — entirely different pricing model ════════════════════
  if (propertyType === 'Plot / Land') {
    const BASE_LAND_PSF = { Premium: 9000, High: 5500, Medium: 3000, Low: 1400, Emerging: 1800 };
    const baseLandRate  = BASE_LAND_PSF[localityDemand] || 3000;
    const cityLandAdj   = Math.min((CITY_BASE_PRICES[city] || 4000) / 4000, 3.5);
    const infraS        = INFRA_SCORES[city] || 0.65;

    const zoneMult = { Residential: 1.00, Commercial: 1.65, 'Mixed Use': 1.30, Industrial: 1.18 }[zoneClassification] || 1.0;
    const legalMult = {
      'NA Plot (Non-Agricultural)':        1.15,
      'RERA Approved Plot':                1.22,
      'Registered Open Plot':              1.00,
      'Agricultural (Conversion Pending)': 0.55,
    }[legalStatus] || 1.0;
    const roadMult = {
      'Main Road / Highway Frontage':  1.12,
      'Wide Internal Road (30ft+)':    1.06,
      'Internal Road (20–30ft)':       1.00,
      'Narrow Lane (<20ft)':           0.91,
    }[roadType] || 1.0;
    const shapeMult    = plotShape === 'Irregular' ? 0.93 : plotShape === 'L-Shape / Odd Shape' ? 0.88 : 1.0;
    const frontageMult = Number(roadFrontageWidth) >= 40 ? 1.05 : Number(roadFrontageWidth) >= 20 ? 1.0 : 0.97;
    const cornerMult   = cornerUnit === true ? 1.10 : 1.0;
    const gatedMult    = gatedSociety === true ? 1.08 : 1.0;
    let utilMult       = 1.0;
    if (waterAvailable)       utilMult += 0.04;
    if (electricityAvailable) utilMult += 0.03;
    if (sewerAvailable)       utilMult += 0.03;
    const amenityLandBonus = 1 + amenities.length * 0.008;

    const pArea        = Number(plotArea) || 500;
    const pricePerSqft = Math.round(baseLandRate * cityLandAdj * zoneMult * legalMult * roadMult * shapeMult * frontageMult * cornerMult * gatedMult * utilMult * amenityLandBonus);
    if (estimatedPrice === null) {
      estimatedPrice = Math.round(pArea * pricePerSqft);
    }

    const confBase     = 62 + Math.round(infraS * 18);
    const confScore    = Math.min(confBase + (legalStatus ? 6 : 0) + (zoneClassification ? 4 : 0) + (roadType ? 3 : 0), 95);
    const demandScore  = Math.round((LOCALITY_DEMAND[localityDemand] || 1.0) * 55 + infraS * 20);
    const riskScore    = legalStatus === 'Agricultural (Conversion Pending)' ? 68 : legalStatus === 'Registered Open Plot' ? 38 : 22;
    const rentalYield  = 0; // land has no rental yield
    const monthlyRent  = 0;
    const projectedROI5Y = Math.round(zoneMult * legalMult * 35 + demandScore * 0.25);
    const annualAppreciation = +(zoneMult * legalMult * 7 + (LOCALITY_DEMAND[localityDemand] || 1) * 2).toFixed(1);
    const liquidityDays = legalStatus === 'RERA Approved Plot' ? 45 : legalStatus === 'NA Plot (Non-Agricultural)' ? 60 : 90;

    return {
      estimatedPrice,
      priceMin: Math.round(estimatedPrice * 0.90),
      priceMax: Math.round(estimatedPrice * 1.12),
      pricePerSqft,
      confidenceScore: confScore,
      demandScore,
      riskScore,
      liquidityDays,
      rentalYield,
      monthlyRent,
      projectedROI5Y,
      annualAppreciation,
      localityDemandIndex: Math.round((LOCALITY_DEMAND[localityDemand] || 1) * 80),
      infraScore: Math.round(infraS * 100),
      ageFactor: 100, // N/A for land
      comparableDensity: demandScore > 70 ? 'High' : demandScore > 45 ? 'Moderate' : 'Low',
      featureImportance: [
        { feature: 'Plot Area',           importance: 38, direction: 'positive' },
        { feature: 'Zone Classification', importance: 22, direction: 'positive' },
        { feature: 'Legal Status',        importance: 18, direction: legalStatus === 'Agricultural (Conversion Pending)' ? 'negative' : 'positive' },
        { feature: 'Locality Demand',     importance: 10, direction: 'positive' },
        { feature: 'Road Access Type',    importance: 6,  direction: 'positive' },
        { feature: 'Infrastructure',      importance: 4,  direction: 'positive' },
        { feature: 'Plot Shape',          importance: 2,  direction: plotShape === 'Regular (Rectangle / Square)' ? 'positive' : 'negative' },
      ],
      inputs,
      predictionSource
    };
  }

  // ── Standard Feature Engineering ────────────────────────────────────
  const basePrice           = CITY_BASE_PRICES[city] || 5000;
  const demandMultiplier    = LOCALITY_DEMAND[localityDemand] || 1.0;
  const infraScore          = INFRA_SCORES[city] || 0.65;
  const ageFactor           = ageDepreciation(age);
  const parkingBonus        = parking ? 1.04 : 1.0;
  const furnishedMultiplier = furnished === 'Fully Furnished' ? 1.10 : furnished === 'Semi-Furnished' ? 1.04 : 1.0;
  const floorFactor         = floor > 3 && floor < totalFloors ? 1.03 : floor === totalFloors ? 1.05 : 0.98;
  const amenityBonus        = 1 + amenities.length * 0.012;
  const bhkDensityFactor    = bhk <= 1 ? 0.95 : bhk === 2 ? 1.0 : bhk === 3 ? 1.02 : 0.99;
  const propertyTypeFactor  = PROPERTY_TYPE_MULT[propertyType] || 1.0;
  const facingFactor        = FACING_PREMIUM[facing] || 1.0;
  const bathroomFactor      = Number(bathrooms) > bhk ? 1.03 : Number(bathrooms) === bhk ? 1.0 : 0.97;
  const balconyFactor       = 1 + (Number(balconies) || 0) * 0.015;
  const gatedFactor         = gatedSociety === true ? 1.05 : 1.0;
  const cornerFactor        = cornerUnit === true ? 1.03 : 1.0;
  const liftFactor          = liftAvailable === false ? (floor > 2 ? 0.96 : 1.0) : 1.02;

  // ── Type-Specific ML Factors ─────────────────────────────────────────
  // VILLA / ROW HOUSE — land area drives 50–70% of value
  const plotAreaFactor = (Number(plotArea) > 0 && ['Villa', 'Row House'].includes(propertyType))
    ? Math.min(1 + (Number(plotArea) / Math.max(area, 1) - 0.5) * 0.35, 1.40)
    : 1.0;
  // Multi-storey villa: +5% per floor above ground
  const villaFloorsFactor = ['Villa', 'Row House'].includes(propertyType)
    ? 1 + (Math.max(Number(villaFloors), 1) - 1) * 0.05 : 1.0;

  // PENTHOUSE — private terrace area can add up to +30%
  const terraceAreaFactor = (Number(terraceArea) > 0 && propertyType === 'Penthouse')
    ? Math.min(1 + Number(terraceArea) / Math.max(area, 1) * 0.28, 1.30) : 1.0;

  // Shared luxury premiums (Villa, Penthouse, Row House)
  const privateGardenFactor = privateGarden ? 1.06 : 1.0;
  const privatePoolFactor   = privatePool   ? 1.12 : 1.0;
  const doubleCeilingFactor = doubleCeiling ? 1.05 : 1.0;
  const smartHomeFactor     = smartHome     ? 1.06 : 1.0;

  // PENTHOUSE specific luxuries
  const privateLiftFactor = (privateLift && propertyType === 'Penthouse') ? 1.09 : 1.0;

  // BUILDER FLOOR — independent entry is the segment-defining feature (+10%)
  const independentEntryFactor = (independentEntry && propertyType === 'Builder Floor') ? 1.10 : 1.0;
  const terraceAccessFactor    = terraceAccess ? 1.05 : 1.0;
  const basementFactor         = basementAccess ? 1.03 : 1.0;

  // STUDIO — managed apartment = yield-based model, completely different pricing (+18%)
  const managedAptFactor = (managedApartment && propertyType === 'Studio') ? 1.18 : 1.0;
  const loftFactor       = (loftMezzanine && propertyType === 'Studio')    ? 1.05 : 1.0;

  // Servant rooms — luxury indicator (+2.5% each, max 3)
  const servantRoomFactor  = 1 + Math.min(Number(servantRooms) || 0, 3) * 0.025;
  // Multiple parking spots (+2.5% per spot beyond first)
  const parkingSpotsFactor = Number(parkingSpots) > 0
    ? 1 + (Number(parkingSpots) - 0.5) * 0.025 : parkingBonus;
  // Studio kitchen type drives rental value
  const kitchenFactor = kitchenType === 'Open Kitchen' ? 1.05
    : kitchenType === 'Separate Kitchen' ? 1.02 : 1.0;

  // ── Final Price per SqFt ─────────────────────────────────────────────
  const pricePerSqft = basePrice * demandMultiplier * ageFactor *
    furnishedMultiplier * amenityBonus * bhkDensityFactor *
    propertyTypeFactor * facingFactor * bathroomFactor * balconyFactor *
    gatedFactor * cornerFactor * liftFactor * floorFactor *
    // Type-specific
    plotAreaFactor * villaFloorsFactor *
    terraceAreaFactor *
    privateGardenFactor * privatePoolFactor * privateLiftFactor *
    doubleCeilingFactor * smartHomeFactor *
    independentEntryFactor * terraceAccessFactor * basementFactor *
    managedAptFactor * loftFactor *
    servantRoomFactor * kitchenFactor *
    (Number(parkingSpots) > 0 ? parkingSpotsFactor : parkingBonus);

  if (estimatedPrice === null) {
    estimatedPrice = Math.round(pricePerSqft * area);
  }

  // Price range
  const spreadFactor = localityDemand === 'Premium' ? 0.10 : localityDemand === 'High' ? 0.13 : 0.17;
  const priceMin = Math.round(estimatedPrice * (1 - spreadFactor));
  const priceMax = Math.round(estimatedPrice * (1 + spreadFactor));

  // Confidence — more specific inputs = higher confidence
  const typeDetailBonus = (propertyType !== 'Apartment' ? 3 : 0)
    + (facing ? 2 : 0) + (gatedSociety !== null ? 1 : 0)
    + (Number(plotArea) > 0 ? 3 : 0) + (Number(terraceArea) > 0 ? 3 : 0)
    + (independentEntry !== null ? 2 : 0) + (managedApartment !== null ? 2 : 0);
  const confidenceScore = Math.min(100, Math.round(
    58 + infraScore * 25 + (localityDemand === 'Premium' || localityDemand === 'High' ? 8 : 0)
    - (age > 20 ? 5 : 0) + typeDetailBonus
  ));

  const demandScore   = Math.round(demandMultiplier * 65 + infraScore * 20);
  const liquidityDays = Math.round(
    (localityDemand === 'Premium' ? 18 : localityDemand === 'High' ? 28 :
     localityDemand === 'Medium' ? 55 : localityDemand === 'Emerging' ? 80 : 120)
    * (age > 10 ? 1.2 : 1.0)
  );
  const riskScore = Math.round(
    15 + (age > 15 ? 20 : age > 8 ? 10 : 0) +
    (localityDemand === 'Low' ? 25 : localityDemand === 'Emerging' ? 15 : 0) +
    (city === 'Other' ? 20 : 0) + (amenities.length < 2 ? 10 : 0)
  );

  const annualAppreciation = localityDemand === 'Premium' ? 0.11 : localityDemand === 'High' ? 0.09 :
    localityDemand === 'Medium' ? 0.07 : localityDemand === 'Emerging' ? 0.12 : 0.05;
  const projectedROI5Y = Math.round(((Math.pow(1 + annualAppreciation, 5) - 1) * 100) * 10) / 10;

  const rentalYield = localityDemand === 'Premium' ? 3.2 : localityDemand === 'High' ? 3.6 :
    localityDemand === 'Medium' ? 3.9 : 4.2;
  const monthlyRent = Math.round(estimatedPrice * (rentalYield / 100) / 12);
  const comparableDensity = Math.round(demandMultiplier * 40 + Math.random() * 20);

  // Feature importance — type-aware
  const featureImportance = [
    { name: 'Location & Demand',      value: Math.round(demandMultiplier * 28),            positive: demandMultiplier > 1 },
    { name: 'City Base Price',        value: Math.round(infraScore * 24),                  positive: true },
    { name: 'Built-up Area',          value: Math.round((area / 2000) * 18),               positive: area > 800 },
    { name: 'Property Type',          value: Math.round((propertyTypeFactor - 1) * 60 + 8), positive: propertyTypeFactor >= 1 },
    { name: 'Building Age',           value: Math.round((1 - ageFactor) * 20),             positive: ageFactor > 0.9 },
    { name: 'Facing Direction',       value: Math.round((facingFactor - 0.97) * 80 + 4),   positive: facingFactor >= 1 },
    { name: 'Gated Society',          value: gatedSociety ? 8 : 3,                         positive: !!gatedSociety },
    { name: 'Furnishing',             value: Math.round((furnishedMultiplier - 1) * 30),   positive: furnishedMultiplier > 1 },
    { name: 'Floor Position',         value: Math.round((floorFactor - 0.95) * 40),        positive: floorFactor > 1 },
    { name: 'Amenities',              value: Math.round(amenities.length * 3),              positive: true },
    ...(Number(plotArea) > 0 ? [{ name: 'Plot/Land Area', value: Math.round((plotAreaFactor - 1) * 80 + 5), positive: plotAreaFactor > 1 }] : []),
    ...(Number(terraceArea) > 0 ? [{ name: 'Private Terrace', value: Math.round((terraceAreaFactor - 1) * 80 + 5), positive: true }] : []),
    ...(independentEntry ? [{ name: 'Independent Entry', value: 14, positive: true }] : []),
    ...(managedApartment ? [{ name: 'Managed Apartment', value: 16, positive: true }] : []),
    ...(privatePool ? [{ name: 'Private Pool', value: 12, positive: true }] : []),
    ...(privateLift ? [{ name: 'Private Lift', value: 10, positive: true }] : []),
  ].sort((a, b) => b.value - a.value).slice(0, 10);

  const comps = generateComparables(locality, estimatedPrice, bhk, area, city);

  return {
    estimatedPrice, priceMin, priceMax,
    pricePerSqft: Math.round(pricePerSqft),
    confidenceScore, demandScore, liquidityDays, riskScore,
    fraudFlag: false,
    projectedROI5Y, rentalYield: +rentalYield.toFixed(1), monthlyRent,
    comparableDensity,
    annualAppreciation: +(annualAppreciation * 100).toFixed(1),
    infraScore: Math.round(infraScore * 100),
    localityDemandIndex: Math.round(demandMultiplier * 100),
    ageFactor: Math.round(ageFactor * 100),
    featureImportance, comps,
    inputs,
    predictionSource
  };
}


function generateComparables(locality, basePrice, bhk, area, city) {
  const variations = [
    { suffix: 'Block A', priceMod: 0.96, areaMod: 0.92, daysAgo: 12 },
    { suffix: 'Sector 2', priceMod: 1.05, areaMod: 1.08, daysAgo: 28 },
    { suffix: 'Phase 1', priceMod: 0.91, areaMod: 0.95, daysAgo: 45 },
    { suffix: 'Tower C', priceMod: 1.12, areaMod: 1.15, daysAgo: 7 },
    { suffix: 'East Wing', priceMod: 0.98, areaMod: 1.02, daysAgo: 35 },
  ];
  return variations.map(v => ({
    address: `${locality} ${v.suffix}, ${city}`,
    price: Math.round(basePrice * v.priceMod),
    area: Math.round(area * v.areaMod),
    bhk,
    pricePerSqft: Math.round((basePrice * v.priceMod) / (area * v.areaMod)),
    daysAgo: v.daysAgo,
    source: v.daysAgo < 15 ? 'MagicBricks' : v.daysAgo < 30 ? '99acres' : 'Housing.com',
  }));
}

export function formatINR(amount) {
  if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(2)} Cr`;
  if (amount >= 1e5) return `₹${(amount / 1e5).toFixed(2)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function generateForecastSeries(basePrice, annualRate, years = 5) {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: years + 1 }, (_, i) => ({
    year: `${currentYear + i}`,
    value: Math.round(basePrice * Math.pow(1 + annualRate / 100, i)),
  }));
}

export function generatePriceTimeCurve(basePrice, baseTime) {
  return [0.85, 0.90, 0.95, 1.0, 1.05, 1.10, 1.15, 1.20].map(factor => ({
    price: formatINR(Math.round(basePrice * factor)),
    priceFactor: Math.round(factor * 100),
    days: Math.round(baseTime * Math.pow(factor / 1.0, 2.8)),
  }));
}
