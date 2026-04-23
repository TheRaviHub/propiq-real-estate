// src/components/PropertyForm.jsx
import { useState, useEffect } from 'react';
import SearchableSelect from './SearchableSelect';
import { ArrowRight, Zap } from 'lucide-react';

// ── Data ──────────────────────────────────────────────────────────────────────
const STATE_CITIES = {
  'Andhra Pradesh':       ['Visakhapatnam','Vijayawada','Guntur','Tirupati','Kurnool','Nellore','Rajahmundry','Kadapa','Kakinada','Eluru','Anantapur','Ongole','Chittoor','Other'],
  'Arunachal Pradesh':    ['Itanagar','Naharlagun','Pasighat','Tawang','Other'],
  'Assam':                ['Guwahati','Dibrugarh','Silchar','Jorhat','Tinsukia','Nagaon','Other'],
  'Bihar':                ['Patna','Gaya','Muzaffarpur','Bhagalpur','Darbhanga','Purnia','Arrah','Begusarai','Other'],
  'Chhattisgarh':         ['Raipur','Bhilai','Bilaspur','Durg','Korba','Rajnandgaon','Other'],
  'Goa':                  ['Panaji','Margao','Vasco da Gama','Mapusa','Ponda','Other'],
  'Gujarat':              ['Ahmedabad','Surat','Vadodara','Rajkot','Bhavnagar','Jamnagar','Gandhinagar','Anand','Mehsana','Morbi','Navsari','Other'],
  'Haryana':              ['Gurugram','Faridabad','Panipat','Ambala','Yamunanagar','Rohtak','Hisar','Sonipat','Karnal','Other'],
  'Himachal Pradesh':     ['Shimla','Manali','Dharamsala','Solan','Kullu','Mandi','Other'],
  'Jharkhand':            ['Ranchi','Jamshedpur','Dhanbad','Bokaro','Hazaribagh','Other'],
  'Karnataka':            ['Bangalore','Mysuru','Mangalore','Hubli-Dharwad','Belagavi','Kalaburagi','Tumkur','Davanagere','Shivamogga','Udupi','Other'],
  'Kerala':               ['Kochi','Thiruvananthapuram','Kozhikode','Thrissur','Kannur','Kollam','Palakkad','Malappuram','Other'],
  'Madhya Pradesh':       ['Bhopal','Indore','Gwalior','Jabalpur','Ujjain','Sagar','Dewas','Satna','Ratlam','Other'],
  'Maharashtra':          ['Mumbai','Pune','Nagpur','Nashik','Thane','Aurangabad','Solapur','Kolhapur','Navi Mumbai','Amravati','Latur','Akola','Other'],
  'Manipur':              ['Imphal','Thoubal','Bishnupur','Other'],
  'Meghalaya':            ['Shillong','Tura','Jowai','Other'],
  'Mizoram':              ['Aizawl','Lunglei','Other'],
  'Nagaland':             ['Kohima','Dimapur','Mokokchung','Other'],
  'Odisha':               ['Bhubaneswar','Cuttack','Rourkela','Berhampur','Puri','Brahmapur','Sambalpur','Other'],
  'Punjab':               ['Ludhiana','Amritsar','Jalandhar','Patiala','Bathinda','Mohali','Pathankot','Other'],
  'Rajasthan':            ['Jaipur','Jodhpur','Udaipur','Kota','Bikaner','Ajmer','Alwar','Sikar','Bhilwara','Other'],
  'Sikkim':               ['Gangtok','Namchi','Other'],
  'Tamil Nadu':           ['Chennai','Coimbatore','Madurai','Salem','Tiruchirappalli','Tirunelveli','Erode','Vellore','Thanjavur','Tiruppur','Other'],
  'Telangana':            ['Hyderabad','Warangal','Nizamabad','Karimnagar','Khammam','Ramagundam','Other'],
  'Tripura':              ['Agartala','Dharmanagar','Other'],
  'Uttar Pradesh':        ['Lucknow','Kanpur','Agra','Varanasi','Prayagraj','Noida','Ghaziabad','Meerut','Mathura','Bareilly','Aligarh','Gorakhpur','Moradabad','Other'],
  'Uttarakhand':          ['Dehradun','Haridwar','Nainital','Roorkee','Haldwani','Mussoorie','Rishikesh','Other'],
  'West Bengal':          ['Kolkata','Howrah','Durgapur','Siliguri','Asansol','Bardhaman','Kharagpur','Haldia','Other'],
  'Delhi (NCT)':          ['New Delhi','Central Delhi','North Delhi','South Delhi','East Delhi','West Delhi','Dwarka','Rohini','Other'],
  'Chandigarh (UT)':      ['Chandigarh','Mohali','Panchkula','Other'],
  'Jammu & Kashmir':      ['Srinagar','Jammu','Anantnag','Sopore','Other'],
  'Ladakh':               ['Leh','Kargil','Other'],
  'Puducherry':           ['Puducherry','Karaikal','Mahe','Other'],
  'Andaman & Nicobar':    ['Port Blair','Other'],
  'Dadra & NH / D&D':     ['Daman','Silvassa','Other'],
  'Lakshadweep':          ['Kavaratti','Other'],
  'Other':                ['Other'],
};

const CITY_LOCALITIES = {
  Mumbai: ['Bandra West','Bandra East','Andheri West','Andheri East','Powai','Juhu','Malad West','Malad East','Borivali West','Borivali East','Kandivali','Goregaon','Lokhandwala','Worli','Lower Parel','Prabhadevi','Dadar','Matunga','Chembur','Ghatkopar','Vikhroli','Mulund','Kurla','Bhandup','Thane West','Thane East','Navi Mumbai','Kharghar','Vashi','Panvel','Nerul','Belapur','Ulwe','Other'],
  Pune: ['Koregaon Park','Baner','Hinjewadi','Viman Nagar','Kharadi','Wakad','Hadapsar','Kalyani Nagar','Aundh','Kothrud','Bavdhan','Balewadi','Sus Road','Undri','Kondhwa','Mundhwa','Magarpatta','Wagholi','Ambegaon','Narhe','Pisoli','NIBM Road','Wanowrie','Other'],
  Bangalore: ['Koramangala','Indiranagar','Whitefield','Electronic City','HSR Layout','Marathahalli','Jayanagar','Bannerghatta Road','Sarjapur Road','Yelahanka','Hebbal','JP Nagar','BTM Layout','Rajajinagar','Malleshwaram','Bellandur','Varthur','KR Puram','Banaswadi','Kaggadasapura','Domlur','RT Nagar','Devanahalli','Other'],
  Hyderabad: ['Banjara Hills','Jubilee Hills','Gachibowli','Kondapur','Madhapur','HITEC City','Kukatpally','Miyapur','Begumpet','Ameerpet','SR Nagar','Kokapet','Nallagandla','Manikonda','Tolichowki','Uppal','L B Nagar','Attapur','Other'],
  'New Delhi': ['Connaught Place','Hauz Khas','Vasant Kunj','Dwarka','Rohini','Pitampura','South Extension','Lajpat Nagar','Defence Colony','Mayur Vihar','Saket','Green Park','Greater Kailash','Janakpuri','Paschim Vihar','Rajouri Garden','Other'],
  Chennai: ['Anna Nagar','T. Nagar','Adyar','Velachery','Perambur','OMR','Porur','Tambaram','Sholinganallur','Pallavaram','Ambattur','Mogappair','Chromepet','Guduvanchery','Pallikaranai','Mylapore','Nungambakkam','Kilpauk','Other'],
  Other: ['Other'],
};

const STATES = Object.keys(STATE_CITIES).filter(s => s !== 'Other').sort().concat('Other');
const DEMAND_LEVELS     = ['Premium', 'High', 'Medium', 'Low', 'Emerging'];
const PROPERTY_TYPES    = ['Apartment', 'Villa', 'Row House', 'Builder Floor', 'Penthouse', 'Studio', 'Plot / Land'];
const AMENITIES_LIST    = ['Swimming Pool', 'Gym', 'Clubhouse', 'Security', 'Garden', 'Power Backup', 'CCTV', 'Children Play Area'];

const BHK_RANGES = {
  Apartment:      [1, 2, 3, 4, 5],
  Villa:          [2, 3, 4, 5, 6],
  'Row House':    [2, 3, 4],
  'Builder Floor':[2, 3, 4],
  Penthouse:      [3, 4, 5, 6],
  Studio:         [],
};

const MIN_AREA_BY_TYPE = {
  Apartment:      { 1: 350, 2: 600, 3: 900, 4: 1200, 5: 1800 },
  Villa:          { 2: 1500, 3: 2200, 4: 3000, 5: 4000, 6: 5000 },
  'Row House':    { 2: 900, 3: 1400, 4: 1800 },
  'Builder Floor':{ 2: 600, 3: 900, 4: 1200 },
  Penthouse:      { 3: 2000, 4: 3000, 5: 4000, 6: 5500 },
  Studio:         null,
};

const maxBath = (type, bhk) => {
  if (type === 'Studio') return 1;
  return Math.min(Number(bhk || 1) + 1, 5);
};

const DEFAULT_FORM = {
  state: '', city: '', locality: '', localityDemand: '',
  societyName: '', propertyType: '', bhk: '', area: '', age: '', floor: '', totalFloors: '', 
  furnished: '', amenities: [], gatedSociety: null, brokerQuote: ''
};

// ── Sub-components ────────────────────────────────────────────────────────────
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      marginTop: '8px', fontSize: '11px', fontWeight: 700, color: '#d9534f',
      padding: '8px 12px', borderRadius: '4px', background: 'rgba(217, 83, 79, 0.05)',
      border: '1px solid rgba(217, 83, 79, 0.1)'
    }}>
      ⚠ {msg}
    </div>
  );
}

function StepBadge({ n, label, active, done }) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px', 
      opacity: done ? 1 : (active ? 1 : 0.4),
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: '4px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: 900,
        background: done ? 'var(--clr-moss-500)' : (active ? 'var(--clr-text-main)' : 'transparent'),
        color: (done || active) ? '#fff' : 'var(--clr-text-main)',
        border: (done || active) ? 'none' : '1px solid rgba(0,0,0,0.1)'
      }}>
        {done ? '✓' : n}
      </div>
      <span style={{ 
        fontSize: '11px', 
        fontWeight: 800, 
        color: 'var(--clr-text-main)', 
        letterSpacing: '1px'
      }}>{label}</span>
    </div>
  );
}

function PropertyCardPreview({ form }) {
  return (
    <div style={{
      marginTop: '60px', padding: '40px', borderRadius: '12px', background: '#fff',
      border: '1px solid rgba(0,0,0,0.05)', color: 'var(--clr-text-main)',
      display: 'flex', flexDirection: 'column', gap: '24px', 
      boxShadow: '0 20px 60px rgba(0,0,0,0.02)',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--clr-moss-500)', letterSpacing: '2px' }}>DATA PREVIEW</div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--clr-text-muted)' }}>{form.propertyType || 'Asset Structure'}</div>
      </div>
      
      <div style={{ fontSize: '28px', fontWeight: 800 }}>
        {form.societyName || 'Subject Property'}
      </div>
      
      <div style={{ fontSize: '15px', color: 'var(--clr-text-muted)', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span>{form.locality || 'Location'}</span>
        <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(0,0,0,0.1)' }}></span>
        <span>{form.city || 'Region'}</span>
      </div>
      
      <div style={{ display: 'flex', gap: '32px' }}>
        {form.bhk && (
          <div>
            <div style={{ fontSize: '10px', color: 'var(--clr-text-muted)', fontWeight: 800, marginBottom: '4px' }}>BHK</div>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>{form.bhk}</div>
          </div>
        )}
        {form.area && (
          <div>
            <div style={{ fontSize: '10px', color: 'var(--clr-text-muted)', fontWeight: 800, marginBottom: '4px' }}>SQFT</div>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>{form.area}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function TypeSpecFields({ form, errors, setField }) {
  const pt = form.propertyType;
  if (!pt) return null;
  
  return (
    <div className="form-grid" style={{ gap: '32px' }}>
      <div className="form-field">
        <label className="form-label" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--clr-text-main)', marginBottom: '12px', display: 'block' }}>Bedrooms (BHK) *</label>
        <SearchableSelect
          options={BHK_RANGES[pt] || []}
          value={form.bhk}
          onChange={e => setField('bhk', e.target.value)}
          placeholder="Select BHK..."
          error={errors.bhk}
        />
        <FieldError msg={errors.bhk} />
      </div>
      <div className="form-field">
        <label className="form-label" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--clr-text-main)', marginBottom: '12px', display: 'block' }}>Built-up Area (sq ft) *</label>
        <input type="number" 
          className="form-input"
          style={{ padding: '14px 18px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', width: '100%', fontSize: '14px' }}
          placeholder="e.g. 1200"
          value={form.area} onChange={e => setField('area', e.target.value)} />
        <FieldError msg={errors.area} />
      </div>
      <div className="form-field">
        <label className="form-label" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--clr-text-main)', marginBottom: '12px', display: 'block' }}>Interior Status *</label>
        <SearchableSelect
          options={['Fully Furnished', 'Semi-Furnished', 'Unfurnished']}
          value={form.furnished}
          onChange={e => setField('furnished', e.target.value)}
          placeholder="Select status..."
          error={errors.furnished}
        />
        <FieldError msg={errors.furnished} />
      </div>
      <div className="form-field">
        <label className="form-label" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--clr-text-main)', marginBottom: '12px', display: 'block' }}>Asset Age (Years) *</label>
        <input type="number" 
          className="form-input"
          style={{ padding: '14px 18px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', width: '100%', fontSize: '14px' }}
          placeholder="e.g. 2"
          value={form.age} onChange={e => setField('age', e.target.value)} />
      </div>
    </div>
  );
}

function validate(f) {
  const e = {};
  if (!f.state) e.state = 'State is required.';
  if (!f.city) e.city = 'City is required.';
  if (!f.locality) e.locality = 'Locality is required.';
  if (!f.propertyType) e.propertyType = 'Property type is required.';
  return e;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PropertyForm({ onAnalyze }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm]       = useState(DEFAULT_FORM);
  const [errors, setErrors]   = useState({});
  const [lockButtons, setLockButtons] = useState(false);

  const STEP_FIELDS = {
    1: ['state', 'city', 'locality', 'localityDemand'],
    2: ['propertyType', 'societyName'],
    3: ['bhk', 'area', 'furnished', 'age'],
    4: ['brokerQuote']
  };

  const citiesRaw = form.state ? (STATE_CITIES[form.state] || []) : [];
  const cities = [...new Set([...citiesRaw, form.city].filter(Boolean))].filter(c => c !== 'Other').sort().concat('Other');
  const localitiesRaw = form.city ? (CITY_LOCALITIES[form.city] || ['Other']) : [];
  const localities = [...new Set([...localitiesRaw, form.locality].filter(Boolean))].filter(l => l !== 'Other').sort().concat('Other');

  function setField(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
    const errs = validate({ ...form, [key]: val });
    setErrors(errs);
  }

  const handleNextStep = () => {
    const fields = STEP_FIELDS[currentStep] || [];
    const allErrors = validate(form);
    const hasErrors = fields.some(k => allErrors[k]);
    if (!hasErrors) {
      setCurrentStep(prev => prev + 1);
    } else {
      setErrors(allErrors);
    }
  };

  const handlePrevStep = () => setCurrentStep(prev => prev - 1);

  const handleSubmit = e => {
    if (e && e.preventDefault) e.preventDefault();
    if (currentStep < 4) return handleNextStep();
    onAnalyze({ ...form, area: Number(form.area), bhk: Number(form.bhk), age: Number(form.age) });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 5%' }}>
      <div style={{ 
        background: '#fff', 
        borderRadius: '24px',
        border: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.02)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '60px 80px 40px' }}>
          <div className="badge-mini" style={{ background: 'rgba(45, 90, 39, 0.1)', color: 'var(--clr-moss-500)' }}>Property Intelligence</div>
          <h3 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '16px', color: 'var(--clr-text-main)' }}>Valuation Wizard.</h3>
          <p style={{ fontSize: '16px', color: 'var(--clr-text-muted)', maxWidth: '500px', lineHeight: 1.6 }}>
            Benchmark your property against verified market signals for a trust-first decision.
          </p>
        </div>

        <div style={{ padding: '0 80px 80px' }}>
          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', marginBottom: '60px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '30px' }}>
            <StepBadge n="01" label="LOCATION" active={currentStep === 1} done={currentStep > 1} />
            <StepBadge n="02" label="ASSET" active={currentStep === 2} done={currentStep > 2} />
            <StepBadge n="03" label="SPECS" active={currentStep === 3} done={currentStep > 3} />
            <StepBadge n="04" label="FINALIZE" active={currentStep === 4} done={currentStep > 4} />
          </div>

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div className="form-field">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--clr-text-main)', marginBottom: '12px', display: 'block' }}>State *</label>
                  <SearchableSelect options={STATES} value={form.state} onChange={e => setField('state', e.target.value)} placeholder="Search state..." error={errors.state} />
                  <FieldError msg={errors.state} />
                </div>
                <div className="form-field">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--clr-text-main)', marginBottom: '12px', display: 'block' }}>City *</label>
                  <SearchableSelect options={cities} value={form.city} onChange={e => setField('city', e.target.value)} placeholder="Search city..." disabled={!form.state} error={errors.city} />
                  <FieldError msg={errors.city} />
                </div>
                <div className="form-field">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--clr-text-main)', marginBottom: '12px', display: 'block' }}>Locality *</label>
                  <SearchableSelect options={localities} value={form.locality} onChange={e => setField('locality', e.target.value)} placeholder="Search locality..." disabled={!form.city} error={errors.locality} />
                  <FieldError msg={errors.locality} />
                </div>
                <div className="form-field">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--clr-text-main)', marginBottom: '12px', display: 'block' }}>Locality Demand *</label>
                  <SearchableSelect options={DEMAND_LEVELS} value={form.localityDemand} onChange={e => setField('localityDemand', e.target.value)} placeholder="Select demand level..." />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div className="form-field" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--clr-text-main)', marginBottom: '12px', display: 'block' }}>Society / Project Name *</label>
                  <input type="text" className="form-input" style={{ padding: '14px 18px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', width: '100%', fontSize: '14px' }} placeholder="e.g. Prestige Heights" value={form.societyName} onChange={e => setField('societyName', e.target.value)} />
                </div>
                <div className="form-field">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--clr-text-main)', marginBottom: '12px', display: 'block' }}>Property Type *</label>
                  <SearchableSelect options={PROPERTY_TYPES} value={form.propertyType} onChange={e => setField('propertyType', e.target.value)} placeholder="Select type..." error={errors.propertyType} />
                  <FieldError msg={errors.propertyType} />
                </div>
              </div>
            )}

            {currentStep === 3 && <TypeSpecFields form={form} errors={errors} setField={setField} />}

            {currentStep === 4 && (
              <div className="form-field">
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--clr-text-main)', marginBottom: '12px', display: 'block' }}>Broker Quote (₹)</label>
                <input type="number" className="form-input" style={{ padding: '14px 18px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', width: '100%', fontSize: '14px' }} placeholder="e.g. 15000000" value={form.brokerQuote} onChange={e => setField('brokerQuote', e.target.value)} />
              </div>
            )}

            <PropertyCardPreview form={form} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '40px' }}>
              {currentStep > 1 ? (
                <button type="button" onClick={handlePrevStep} style={{ padding: '12px 24px', border: 'none', background: 'transparent', fontWeight: 800, cursor: 'pointer', fontSize: '13px' }}>Back</button>
              ) : (
                <button type="button" onClick={() => setForm(DEFAULT_FORM)} style={{ padding: '12px 24px', border: 'none', background: 'transparent', color: 'var(--clr-text-muted)', fontWeight: 800, cursor: 'pointer', fontSize: '13px' }}>Reset</button>
              )}
              
              <button type="submit" className="btn-auth">
                {currentStep < 4 ? 'Next Step' : 'Run Intelligence Engine'} <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
