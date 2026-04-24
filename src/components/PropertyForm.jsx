import { useState } from 'react';
import { ChevronRight, ChevronLeft, Zap } from 'lucide-react';
import SearchableSelect from './SearchableSelect';

const CITIES = [
  'Mumbai','Pune','Bangalore','New Delhi','Hyderabad','Chennai','Ahmedabad',
  'Kolkata','Jaipur','Lucknow','Noida','Gurugram','Navi Mumbai','Thane',
  'Chandigarh','Bhopal','Indore','Kochi','Surat','Patna','Other'
];

const PROPERTY_TYPES = ['Flat','Independent House','Plot','Villa','Commercial'];
const DIRECTIONS    = ['North','South','East','West','Corner'];
const FURNISHING    = ['Fully Furnished','Semi-Furnished','Unfurnished'];
const USAGE_TYPES   = ['Shop','Office','Showroom'];
const AMENITIES_LIST = ['Lift','Power Backup','Water Supply 24x7','Security Guard','CCTV','Gym','Club House','Swimming Pool','Garden'];
const NEARBY_LIST    = ['School','Hospital','Metro Station','Market / Mall','Park','Bus Stop'];

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ color: '#e53e3e', fontSize: '12px', fontWeight: 700, marginTop: '6px', display: 'flex', gap: '6px', alignItems: 'center' }}>
      <Zap size={11} /> {msg}
    </div>
  );
}

function Label({ children }) {
  return <label className="form-label" style={{ display: 'block', marginBottom: '10px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.5px', color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase' }}>{children}</label>;
}

function GlassInput({ placeholder, value, onChange, type = 'text' }) {
  return (
    <input
      type={type}
      className="form-input"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{ width: '100%' }}
    />
  );
}

function CheckGroup({ items, selected, onChange }) {
  const toggle = (item) => {
    const next = selected.includes(item) ? selected.filter(i => i !== item) : [...selected, item];
    onChange(next);
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      {items.map(item => {
        const active = selected.includes(item);
        return (
          <button
            key={item}
            type="button"
            onClick={() => toggle(item)}
            style={{
              padding: '10px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.25s',
              background: active ? 'var(--clr-moss-500)' : 'rgba(255,255,255,0.5)',
              color: active ? '#fff' : '#333',
              border: active ? '1.5px solid var(--clr-moss-500)' : '1.5px solid rgba(0,0,0,0.08)',
              backdropFilter: 'blur(20px)',
            }}
          >{item}</button>
        );
      })}
    </div>
  );
}

const STEP_TITLES = [
  { n: '01', label: 'LOCATION' },
  { n: '02', label: 'ASSET' },
  { n: '03', label: 'SPECS' },
  { n: '04', label: 'FEATURES' },
  { n: '05', label: 'PREDICT' },
];

const EMPTY = {
  city: '', area_name: '',
  propertyType: '', facing: '', colony: '',
  bhk: '', floorNo: '', totalFloors: '', area: '', age: '', furnished: '', parking: false,
  plotArea: '', builtupArea: '', floors: '', garden: false,
  dimensions: '', cornerPlot: false,
  totalArea: '', usageType: '',
  amenities: [], nearby: [],
};

function validate(step, form) {
  const e = {};
  if (step === 1) {
    if (!form.city) e.city = 'Please select a city';
  }
  if (step === 2) {
    if (!form.propertyType) e.propertyType = 'Select property type';
    if (!form.facing) e.facing = 'Select facing direction';
    if (!form.colony.trim()) e.colony = 'Enter colony / locality name';
  }
  if (step === 3) {
    const t = form.propertyType;
    if (t === 'Flat') {
      if (!form.bhk) e.bhk = 'Required';
      if (!form.floorNo) e.floorNo = 'Required';
      if (!form.totalFloors) e.totalFloors = 'Required';
      if (!form.area) e.area = 'Required';
      if (!form.age) e.age = 'Required';
      if (!form.furnished) e.furnished = 'Required';
    }
    if (t === 'Independent House' || t === 'Villa') {
      if (!form.bhk) e.bhk = 'Required';
      if (!form.plotArea) e.plotArea = 'Required';
      if (!form.builtupArea) e.builtupArea = 'Required';
      if (!form.age) e.age = 'Required';
    }
    if (t === 'Plot') {
      if (!form.plotArea) e.plotArea = 'Required';
    }
    if (t === 'Commercial') {
      if (!form.totalArea) e.totalArea = 'Required';
      if (!form.usageType) e.usageType = 'Required';
    }
  }
  return e;
}

export default function PropertyForm({ onAnalyze }) {
  const [step, setStep]   = useState(1);
  const [form, setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const sanitizeNum = (v) => v.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');

  const next = () => {
    const e = validate(step, form);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    if (step < 5) setStep(s => s + 1);
  };

  const back = () => { setErrors({}); setStep(s => s - 1); };

  const submit = () => {
    const t = form.propertyType;
    const areaVal = t === 'Flat' ? form.area
      : (t === 'Independent House' || t === 'Villa') ? form.builtupArea
      : t === 'Plot' ? form.plotArea
      : form.totalArea;

    const amenityScore = (form.amenities.length / AMENITIES_LIST.length).toFixed(2);

    const payload = {
      city: form.city,
      locality: form.colony || 'Other',
      propertyType: t === 'Flat' ? 'Apartment'
        : t === 'Independent House' ? 'Builder Floor'
        : t === 'Villa' ? 'Villa'
        : t === 'Plot' ? 'Plot / Land'
        : 'Apartment',
      area: Number(areaVal) || 1000,
      bhk: Number(form.bhk) || 0,
      age: Number(form.age) || 0,
      furnished: form.furnished || 'Unfurnished',
      facing: form.facing || 'North',
      parking: form.parking,
      gatedSociety: form.amenities.includes('Security Guard'),
      amenityScore: Number(amenityScore),
      nearbySchool: form.nearby.includes('School'),
      nearbyHospital: form.nearby.includes('Hospital'),
      nearbyMetro: form.nearby.includes('Metro Station'),
      localityDemand: 'Medium',
    };
    onAnalyze(payload);
  };

  const pt = form.propertyType;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 5%' }}>
      {/* Wizard Shell */}
      <div style={{
        borderRadius: '32px',
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.04)',
        overflow: 'visible',
      }}>
        {/* Header */}
        <div style={{ padding: '60px 72px 40px' }}>
          <div className="badge-mini" style={{ background: 'rgba(45,90,39,0.04)', color: 'var(--clr-moss-500)', border: '1px solid rgba(45,90,39,0.08)' }}>Property Intelligence</div>
          <h3 style={{ fontSize: '44px', fontWeight: 900, color: '#111', letterSpacing: '-0.03em', margin: '16px 0 8px' }}>Valuation Wizard.</h3>
          <p style={{ fontSize: '16px', color: 'rgba(0,0,0,0.5)', fontWeight: 600 }}>Benchmark your property against verified market signals.</p>

          {/* Step pills */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '36px', flexWrap: 'wrap' }}>
            {STEP_TITLES.map((s, i) => {
              const n = i + 1;
              const done = step > n;
              const active = step === n;
              return (
                <div key={n} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 16px', borderRadius: '10px',
                  background: active ? '#111' : done ? 'var(--clr-moss-500)' : 'rgba(0,0,0,0.04)',
                  color: active || done ? '#fff' : 'rgba(0,0,0,0.3)',
                  fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px',
                  transition: 'all 0.3s',
                }}>
                  <span>{s.n}</span><span>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div style={{ padding: '0 72px 60px' }}>

          {/* ── STEP 1: Location ── */}
          {step === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <Label>City *</Label>
                <SearchableSelect
                  options={CITIES}
                  value={form.city}
                  onChange={e => set('city', e.target.value)}
                  placeholder="Search city..."
                  error={errors.city}
                />
                <FieldError msg={errors.city} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <Label>Area / Zone (optional)</Label>
                <GlassInput placeholder="e.g. Koramangala, Baner, Sector 62..." value={form.area_name} onChange={e => set('area_name', e.target.value)} />
              </div>
            </div>
          )}

          {/* ── STEP 2: Property Type + Direction + Colony ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div>
                <Label>Property Type *</Label>
                <CheckGroup items={PROPERTY_TYPES} selected={form.propertyType ? [form.propertyType] : []} onChange={arr => set('propertyType', arr[arr.length - 1] || '')} />
                <FieldError msg={errors.propertyType} />
              </div>
              <div>
                <Label>Facing Direction *</Label>
                <CheckGroup items={DIRECTIONS} selected={form.facing ? [form.facing] : []} onChange={arr => set('facing', arr[arr.length - 1] || '')} />
                <FieldError msg={errors.facing} />
              </div>
              <div>
                <Label>Colony / Locality Name *</Label>
                <GlassInput placeholder="e.g. Anand Nagar, DLF Phase 2..." value={form.colony} onChange={e => set('colony', e.target.value)} />
                <FieldError msg={errors.colony} />
              </div>
            </div>
          )}

          {/* ── STEP 3: Conditional Specs ── */}
          {step === 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>

              {/* FLAT */}
              {pt === 'Flat' && (<>
                <div>
                  <Label>BHK *</Label>
                  <SearchableSelect options={['1','2','3','4','5','6']} value={form.bhk} onChange={e => set('bhk', e.target.value)} placeholder="Select BHK" error={errors.bhk} />
                  <FieldError msg={errors.bhk} />
                </div>
                <div>
                  <Label>Floor Number *</Label>
                  <GlassInput placeholder="e.g. 5" value={form.floorNo} onChange={e => set('floorNo', sanitizeNum(e.target.value))} />
                  <FieldError msg={errors.floorNo} />
                </div>
                <div>
                  <Label>Total Floors *</Label>
                  <GlassInput placeholder="e.g. 20" value={form.totalFloors} onChange={e => set('totalFloors', sanitizeNum(e.target.value))} />
                  <FieldError msg={errors.totalFloors} />
                </div>
                <div>
                  <Label>Area (sq ft) *</Label>
                  <GlassInput placeholder="e.g. 1200" value={form.area} onChange={e => set('area', sanitizeNum(e.target.value))} />
                  <FieldError msg={errors.area} />
                </div>
                <div>
                  <Label>Age of Property (yrs) *</Label>
                  <GlassInput placeholder="e.g. 3" value={form.age} onChange={e => set('age', sanitizeNum(e.target.value))} />
                  <FieldError msg={errors.age} />
                </div>
                <div>
                  <Label>Furnishing Status *</Label>
                  <SearchableSelect options={FURNISHING} value={form.furnished} onChange={e => set('furnished', e.target.value)} placeholder="Select..." error={errors.furnished} />
                  <FieldError msg={errors.furnished} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <Label>Parking</Label>
                  <CheckGroup items={['Yes']} selected={form.parking ? ['Yes'] : []} onChange={arr => set('parking', arr.includes('Yes'))} />
                </div>
              </>)}

              {/* INDEPENDENT HOUSE / VILLA */}
              {(pt === 'Independent House' || pt === 'Villa') && (<>
                <div>
                  <Label>BHK *</Label>
                  <SearchableSelect options={['1','2','3','4','5','6']} value={form.bhk} onChange={e => set('bhk', e.target.value)} placeholder="Select BHK" error={errors.bhk} />
                  <FieldError msg={errors.bhk} />
                </div>
                <div>
                  <Label>Plot Area (sq ft) *</Label>
                  <GlassInput placeholder="e.g. 2400" value={form.plotArea} onChange={e => set('plotArea', sanitizeNum(e.target.value))} />
                  <FieldError msg={errors.plotArea} />
                </div>
                <div>
                  <Label>Built-up Area (sq ft) *</Label>
                  <GlassInput placeholder="e.g. 1800" value={form.builtupArea} onChange={e => set('builtupArea', sanitizeNum(e.target.value))} />
                  <FieldError msg={errors.builtupArea} />
                </div>
                <div>
                  <Label>Number of Floors</Label>
                  <GlassInput placeholder="e.g. 2" value={form.floors} onChange={e => set('floors', sanitizeNum(e.target.value))} />
                </div>
                <div>
                  <Label>Age of Property (yrs) *</Label>
                  <GlassInput placeholder="e.g. 5" value={form.age} onChange={e => set('age', sanitizeNum(e.target.value))} />
                  <FieldError msg={errors.age} />
                </div>
                <div style={{ gridColumn: '1/-1', display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <Label>Parking</Label>
                    <CheckGroup items={['Yes']} selected={form.parking ? ['Yes'] : []} onChange={arr => set('parking', arr.includes('Yes'))} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Label>Garden / Terrace</Label>
                    <CheckGroup items={['Yes']} selected={form.garden ? ['Yes'] : []} onChange={arr => set('garden', arr.includes('Yes'))} />
                  </div>
                </div>
              </>)}

              {/* PLOT */}
              {pt === 'Plot' && (<>
                <div>
                  <Label>Plot Area (sq ft) *</Label>
                  <GlassInput placeholder="e.g. 3000" value={form.plotArea} onChange={e => set('plotArea', sanitizeNum(e.target.value))} />
                  <FieldError msg={errors.plotArea} />
                </div>
                <div>
                  <Label>Dimensions (optional)</Label>
                  <GlassInput placeholder="e.g. 40×75 ft" value={form.dimensions} onChange={e => set('dimensions', e.target.value)} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <Label>Corner Plot?</Label>
                  <CheckGroup items={['Yes — Corner Plot']} selected={form.cornerPlot ? ['Yes — Corner Plot'] : []} onChange={arr => set('cornerPlot', arr.includes('Yes — Corner Plot'))} />
                </div>
              </>)}

              {/* COMMERCIAL */}
              {pt === 'Commercial' && (<>
                <div>
                  <Label>Total Area (sq ft) *</Label>
                  <GlassInput placeholder="e.g. 800" value={form.totalArea} onChange={e => set('totalArea', sanitizeNum(e.target.value))} />
                  <FieldError msg={errors.totalArea} />
                </div>
                <div>
                  <Label>Floor Number</Label>
                  <GlassInput placeholder="e.g. Ground, 1, 2..." value={form.floorNo} onChange={e => set('floorNo', e.target.value)} />
                </div>
                <div>
                  <Label>Usage Type *</Label>
                  <SearchableSelect options={USAGE_TYPES} value={form.usageType} onChange={e => set('usageType', e.target.value)} placeholder="Select..." error={errors.usageType} />
                  <FieldError msg={errors.usageType} />
                </div>
                <div>
                  <Label>Parking</Label>
                  <CheckGroup items={['Yes']} selected={form.parking ? ['Yes'] : []} onChange={arr => set('parking', arr.includes('Yes'))} />
                </div>
              </>)}
            </div>
          )}

          {/* ── STEP 4: Amenities + Nearby ── */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
              <div>
                <Label>Amenities Available</Label>
                <CheckGroup items={AMENITIES_LIST} selected={form.amenities} onChange={v => set('amenities', v)} />
              </div>
              <div>
                <Label>Nearby Facilities</Label>
                <CheckGroup items={NEARBY_LIST} selected={form.nearby} onChange={v => set('nearby', v)} />
              </div>
            </div>
          )}

          {/* ── STEP 5: Confirm & Predict ── */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ padding: '32px', borderRadius: '20px', background: 'rgba(45,90,39,0.04)', border: '1px solid rgba(45,90,39,0.08)' }}>
                <div style={{ fontSize: '12px', fontWeight: 900, color: 'var(--clr-moss-500)', letterSpacing: '2px', marginBottom: '20px' }}>PROPERTY SUMMARY</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  {[
                    ['City', form.city],
                    ['Type', form.propertyType],
                    ['Facing', form.facing],
                    ['Colony', form.colony],
                    ['BHK', form.bhk || '—'],
                    ['Area', `${form.area || form.plotArea || form.totalArea || form.builtupArea || '—'} sq ft`],
                    ['Age', form.age ? `${form.age} yrs` : '—'],
                    ['Amenities', `${form.amenities.length} selected`],
                    ['Nearby', `${form.nearby.length} selected`],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(0,0,0,0.35)', marginBottom: '4px' }}>{k.toUpperCase()}</div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#111' }}>{v || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.45)', fontWeight: 600, textAlign: 'center' }}>
                Our ML ensemble will predict your property's fair market price with confidence scoring.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '48px' }}>
            <button
              onClick={back}
              disabled={step === 1}
              className="btn-auth"
              style={{ opacity: step === 1 ? 0 : 1, pointerEvents: step === 1 ? 'none' : 'auto' }}
            >
              <ChevronLeft size={16} /> Back
            </button>

            {step < 5 ? (
              <button onClick={next} className="btn-auth" style={{ background: '#111', color: '#fff', border: 'none' }}>
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={submit} className="btn-auth" style={{ background: 'var(--clr-moss-500)', color: '#fff', border: 'none', padding: '18px 48px' }}>
                <Zap size={16} /> Run Valuation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
