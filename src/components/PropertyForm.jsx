// src/components/PropertyForm.jsx
import { useState } from 'react';

// ── Data ──────────────────────────────────────────────────────────────────────
const STATE_CITIES = {
  'Andhra Pradesh':  ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Other'],
  'Delhi (NCT)':     ['New Delhi', 'Noida', 'Gurgaon', 'Faridabad', 'Ghaziabad', 'Other'],
  'Gujarat':         ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Other'],
  'Karnataka':       ['Bangalore', 'Mysuru', 'Mangalore', 'Hubli-Dharwad', 'Other'],
  'Kerala':          ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Other'],
  'Madhya Pradesh':  ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Other'],
  'Maharashtra':     ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Other'],
  'Punjab':          ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Other'],
  'Rajasthan':       ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Other'],
  'Tamil Nadu':      ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Other'],
  'Telangana':       ['Hyderabad', 'Warangal', 'Nizamabad', 'Other'],
  'Uttar Pradesh':   ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Noida', 'Other'],
  'West Bengal':     ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Other'],
  'Other':           ['Other'],
};

const CITY_LOCALITIES = {
  Mumbai: ['Bandra West','Andheri West','Powai','Juhu','Malad West','Borivali','Thane','Navi Mumbai','Worli','Lower Parel','Chembur','Other'],
  Pune: ['Koregaon Park','Baner','Hinjewadi','Viman Nagar','Kharadi','Wakad','Hadapsar','Kalyani Nagar','Aundh','Other'],
  Nagpur: ['Dharampeth','Sadar','Civil Lines','Nagpur Airport Zone','Sitabuldi','Other'],
  Nashik: ['Gangapur Road','College Road','Nashik Road','Dwarka','Other'],
  Aurangabad: ['Cidco','Garkheda','Cantonment','Other'],
  'New Delhi': ['Connaught Place','Hauz Khas','Vasant Kunj','Dwarka','Rohini','Pitampura','South Extension','Lajpat Nagar','Defence Colony','Other'],
  Noida: ['Sector 62','Sector 137','Sector 150','Sector 18','Greater Noida','Sector 50','Other'],
  Gurgaon: ['DLF Phase 1','Sohna Road','Golf Course Road','Sector 56','MG Road','Sector 82','Other'],
  Faridabad: ['Sector 15','NIT','Sector 21C','Ballabhgarh','Other'],
  Ghaziabad: ['Indirapuram','Vaishali','Raj Nagar Extension','NH-24 Corridor','Other'],
  Bangalore: ['Koramangala','Indiranagar','Whitefield','Electronic City','HSR Layout','Marathahalli','Jayanagar','Bannerghatta Road','Sarjapur Road','Yelahanka','Other'],
  Mysuru: ['Gokulam','Vijayanagar','Saraswathipuram','Kuvempunagar','Other'],
  Mangalore: ['Hampankatta','Kadri','Bejai','Kankanady','Other'],
  'Hubli-Dharwad': ['Vidyanagar','Gokul','Deshpande Nagar','Other'],
  Hyderabad: ['Banjara Hills','Jubilee Hills','Gachibowli','Kondapur','Madhapur','HITEC City','Kukatpally','Miyapur','Begumpet','Other'],
  Warangal: ['Hanamkonda','Kazipet','Warangal Urban','Other'],
  Nizamabad: ['Nizamabad Urban','Other'],
  Visakhapatnam: ['MVP Colony','Gajuwaka','Rushikonda','Seethammadhara','Other'],
  Vijayawada: ['Benz Circle','Kanuru','MG Road','Other'],
  Guntur: ['Arundelpet','Brodipet','Other'],
  Tirupati: ['Balaji Nagar','Karakambadi Road','Other'],
  Chennai: ['Anna Nagar','T. Nagar','Adyar','Velachery','Perambur','OMR','Porur','Tambaram','Sholinganallur','Other'],
  Coimbatore: ['RS Puram','Gandhipuram','Saibaba Colony','Singanallur','Other'],
  Madurai: ['Anna Nagar','KK Nagar','Thirunagar','Other'],
  Salem: ['Fairlands','Swarnapuri','Other'],
  Ahmedabad: ['Prahlad Nagar','Satellite','Bodakdev','Vastrapur','Navrangpura','Science City','Maninagar','Other'],
  Surat: ['Adajan','Vesu','Piplod','Athwa','Other'],
  Vadodara: ['Alkapuri','Fatehgunj','Karelibaug','Other'],
  Rajkot: ['Kalawad Road','University Road','Other'],
  Kolkata: ['Salt Lake','New Town','Park Street','Alipore','Ballygunge','Dum Dum','Garia','Other'],
  Howrah: ['Shibpur','Bamangachi','Other'],
  Durgapur: ['Benachity','Bidhannagar','Other'],
  Siliguri: ['Sevoke Road','Pradhan Nagar','Other'],
  Jaipur: ['Vaishali Nagar','Malviya Nagar','C-Scheme','Jagatpura','Mansarovar','Other'],
  Jodhpur: ['Ratanada','Shastri Nagar','Other'],
  Udaipur: ['Fatehpura','Hiran Magri','Other'],
  Kota: ['Talwandi','Vigyan Nagar','Other'],
  Lucknow: ['Gomti Nagar','Hazratganj','Aliganj','Indira Nagar','Vibhuti Khand','Other'],
  Kanpur: ['Civil Lines','Swaroop Nagar','Kidwai Nagar','Other'],
  Agra: ['Kamla Nagar','Dayal Bagh','Other'],
  Varanasi: ['Sigra','Lanka','BHU Area','Other'],
  Bhopal: ['MP Nagar','Arera Colony','Bhopal Cantonment','Other'],
  Indore: ['Vijay Nagar','AB Road','Scheme 54','Palasia','Other'],
  Gwalior: ['Morar','Lashkar','City Centre','Other'],
  Jabalpur: ['Napier Town','Civil Lines','Other'],
  Chandigarh: ['Sector 17','Sector 35','Sector 22','Mohali','Panchkula','Other'],
  Ludhiana: ['Model Town','BRS Nagar','Other'],
  Amritsar: ['Ranjit Avenue','Lawrence Road','Other'],
  Jalandhar: ['Model Town','Patel Nagar','Other'],
  Kochi: ['Kakkanad','Edappally','Maradu','Thrippunithura','Aluva','Other'],
  Thiruvananthapuram: ['Kowdiar','Pattom','Vanchiyoor','Other'],
  Kozhikode: ['Calicut Beach','Nadakkavu','Other'],
  Thrissur: ['Thrissur Town','Punkunnam','Other'],
  Other: ['Other'],
};

const STATES            = Object.keys(STATE_CITIES).sort();
const DEMAND_LEVELS     = ['Premium', 'High', 'Medium', 'Low', 'Emerging'];
const PROPERTY_TYPES    = ['Apartment', 'Villa', 'Row House', 'Builder Floor', 'Penthouse', 'Studio', 'Plot / Land'];

// Zone & legal options for Plot / Land
const ZONE_TYPES     = ['Residential', 'Commercial', 'Mixed Use', 'Industrial'];
const LEGAL_STATUSES = ['NA Plot (Non-Agricultural)', 'RERA Approved Plot', 'Registered Open Plot', 'Agricultural (Conversion Pending)'];
const ROAD_TYPES     = ['Main Road / Highway Frontage', 'Wide Internal Road (30ft+)', 'Internal Road (20–30ft)', 'Narrow Lane (<20ft)'];
const PLOT_SHAPES    = ['Regular (Rectangle / Square)', 'Irregular', 'L-Shape / Odd Shape'];
const FACING_OPTIONS    = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
const FURNISHED_OPTIONS = ['Fully Furnished', 'Semi-Furnished', 'Unfurnished'];
const AMENITIES_LIST    = ['Swimming Pool', 'Gym', 'Clubhouse', 'Security', 'Garden', 'Power Backup', 'CCTV', 'Children Play Area'];
const KITCHEN_TYPES     = ['Open Kitchen', 'Kitchenette', 'Separate Kitchen'];

// BHK options per property type (Studio has no BHK)
const BHK_RANGES = {
  Apartment:      [1, 2, 3, 4, 5],
  Villa:          [2, 3, 4, 5, 6],
  'Row House':    [2, 3, 4],
  'Builder Floor':[2, 3, 4],
  Penthouse:      [3, 4, 5, 6],
  Studio:         [],  // no BHK
};

// Minimum built-up area per BHK per type (sqft) — realistic industry minimums
const MIN_AREA_BY_TYPE = {
  Apartment:      { 1: 350, 2: 600, 3: 900, 4: 1200, 5: 1800 },
  Villa:          { 2: 1500, 3: 2200, 4: 3000, 5: 4000, 6: 5000 },
  'Row House':    { 2: 900, 3: 1400, 4: 1800 },
  'Builder Floor':{ 2: 600, 3: 900, 4: 1200 },
  Penthouse:      { 3: 2000, 4: 3000, 5: 4000, 6: 5500 },
  Studio:         null,  // 200–700 sqft, no BHK
};

// For backward compat with parts of code using flat lookup
const MIN_AREA_FOR_BHK = { 1: 350, 2: 600, 3: 900, 4: 1200, 5: 1800 };

// Max bathrooms per type
const maxBath = (type, bhk) => {
  if (type === 'Studio') return 1;
  if (type === 'Villa' || type === 'Penthouse') return Math.min(Number(bhk) + 2, 7);
  return Math.min(Number(bhk) + 1, 4);
};

const DEFAULT_FORM = {
  // Section 1: Location
  state: '', city: '', locality: '', localityDemand: '',
  // Section 2: Property Identifier
  societyName: '', propertyType: '', facing: '',
  // Common spec fields
  bhk: '', bathrooms: '', balconies: '',
  area: '', carpetArea: '', age: '', floor: '', totalFloors: '', furnished: '',
  // Villa / Row House
  plotArea: '', villaFloors: '2', privateGarden: null, privatePool: null,
  // Penthouse
  terraceArea: '', privateLift: null, doubleCeiling: null, smartHome: null,
  // Builder Floor
  independentEntry: null, terraceAccess: null, basementAccess: null,
  // Studio
  kitchenType: '', managedApartment: null, loftMezzanine: null,
  // Common advanced
  servantRooms: '0', parkingSpots: '',
  // Plot / Land specific
  zoneClassification: '', legalStatus: '', roadType: '', roadFrontageWidth: '', plotShape: '',
  waterAvailable: null, electricityAvailable: null, sewerAvailable: null,
  // Section 4 Optional
  parking: null, gatedSociety: null, cornerUnit: false, liftAvailable: null,
  amenities: [], brokerQuote: '',
};

// ── Sub-components ────────────────────────────────────────────────────────────
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      marginTop: '6px', fontSize: '12px', color: '#fb7185',
      background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)',
      padding: '5px 10px', borderRadius: '6px',
    }}>
      ⚠ {msg}
    </div>
  );
}

function StepBadge({ n, label, done }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', fontWeight: 700,
        background: done ? 'var(--clr-accent-emerald)' : 'rgba(59,130,246,0.15)',
        color: done ? '#fff' : 'var(--clr-primary-light)',
        border: done ? 'none' : '1px solid rgba(59,130,246,0.3)',
      }}>
        {done ? '✓' : n}
      </div>
      <span style={{ fontSize: '13px', fontWeight: 600, color: done ? '#34d399' : 'var(--text-secondary)' }}>
        {label}
      </span>
    </div>
  );
}

// Live Property Card Preview
function PropertyCardPreview({ form }) {
  const ready = form.locality && form.city && form.propertyType;
  if (!ready) return null;
  const facingEmoji = { North: '⬆', 'North-East': '↗', East: '➡', 'South-East': '↘', South: '⬇', 'South-West': '↙', West: '⬅', 'North-West': '↖' };
  return (
    <div style={{
      marginTop: '20px', padding: '18px 20px', borderRadius: '14px',
      border: '1px solid rgba(59,130,246,0.35)',
      background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.05))',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '1px' }}>
          🏠 Property Being Analysed
        </span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
        {form.societyName || `${form.propertyType} in ${form.locality}`}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
        {[form.locality, form.city, form.state].filter(Boolean).join(', ')}
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {form.propertyType && <span className="info-chip">{form.propertyType}</span>}
        {form.bhk && <span className="info-chip">{form.bhk} BHK</span>}
        {form.propertyType !== 'Plot / Land' && form.area && <span className="info-chip">{Number(form.area).toLocaleString()} sqft built-up</span>}
        {form.propertyType === 'Plot / Land' && form.plotArea && <span className="info-chip">🌍 {Number(form.plotArea).toLocaleString()} sqft plot</span>}
        {form.propertyType === 'Plot / Land' && form.zoneClassification && <span className="info-chip">{form.zoneClassification}</span>}
        {form.propertyType === 'Plot / Land' && form.legalStatus && <span className="info-chip">{form.legalStatus}</span>}
        {form.floor && form.totalFloors && <span className="info-chip">Floor {form.floor}/{form.totalFloors}</span>}
        {form.facing && <span className="info-chip">{facingEmoji[form.facing] || ''} {form.facing}</span>}
        {form.gatedSociety === true && <span className="info-chip">🔒 Gated</span>}
        {form.liftAvailable === true && <span className="info-chip">🛗 Lift</span>}
        {form.parking === true && <span className="info-chip">🅿 Parking</span>}
        {form.cornerUnit && <span className="info-chip">📐 Corner Plot</span>}
        {form.carpetArea && form.propertyType !== 'Plot / Land' && <span className="info-chip">Carpet: {Number(form.carpetArea).toLocaleString()} sqft</span>}
      </div>
    </div>
  );
}

// ── TypeSpecFields: Type-aware property specification renderer ───────────────
function TypeSpecFields({ form, errors, setField }) {
  const pt   = form.propertyType;
  const bhk  = Number(form.bhk);
  const area = Number(form.area);
  const isVillaRH   = pt === 'Villa' || pt === 'Row House';
  const isStudio    = pt === 'Studio';
  const isPH        = pt === 'Penthouse';
  const isBF        = pt === 'Builder Floor';
  const isLand      = pt === 'Plot / Land';
  const hasFloors   = !isVillaRH && !isLand;
  const hasBHK      = !isStudio && !isLand;
  const hasBalcony  = ['Apartment', 'Builder Floor', 'Penthouse'].includes(pt);

  const bhkOptions  = BHK_RANGES[pt] || [];
  const minArea     = MIN_AREA_BY_TYPE[pt];
  const minForBHK   = (minArea && bhk) ? (minArea[bhk] || 0) : 0;

  const ToggleBtn = ({ id, active, onClick, label }) => (
    <button type="button" id={id}
      className={`toggle-btn ${active ? 'active' : ''}`}
      onClick={onClick}>{label}</button>
  );

  const carpetField = (
    <div className="form-field">
      <label className="form-label" htmlFor="carpetArea">
        Carpet Area (sq ft)
        <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', fontSize: '11px', whiteSpace: 'nowrap' }}>
          {area > 0 ? `(max: ${area.toLocaleString()})` : '(optional)'}
        </span>
      </label>
      <input id="carpetArea" type="number" onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
        className={`form-input ${errors.carpetArea ? 'input-error' : ''}`}
        placeholder={area > 0 ? `e.g. ${Math.round(area * 0.75)}` : 'Enter built-up area first'}
        disabled={!form.area}
        max={area > 0 ? area - 1 : undefined}
        value={form.carpetArea} onChange={e => setField('carpetArea', e.target.value)} />
      <FieldError msg={errors.carpetArea} />
    </div>
  );

  if (!pt) return <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '12px 0' }}>← Select a Property Type in Step 2 to see relevant fields</div>;

  // ── PLOT / LAND ──────────────────────────────────────────────────────────────
  if (isLand) return (
    <div className="form-grid">
      {/* Row 1: Plot Area | Zone Classification */}
      <div className="form-field">
        <label className="form-label" htmlFor="plotAreaLand">
          Plot / Land Area (sq ft) *
          <span style={{ color:'#f59e0b', fontWeight:600, marginLeft:'6px', fontSize:'11px' }}>🔑 Primary ML signal</span>
        </label>
        <input id="plotAreaLand" type="number" onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} min={100}
          className={`form-input ${errors.plotArea ? 'input-error' : ''}`}
          placeholder="e.g. 2400"
          value={form.plotArea} onChange={e => setField('plotArea', e.target.value)} />
        <FieldError msg={errors.plotArea} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="zoneClassification">Zone Classification *</label>
        <select id="zoneClassification"
          className={`form-select ${errors.zoneClassification ? 'input-error' : ''}`}
          value={form.zoneClassification} onChange={e => setField('zoneClassification', e.target.value)}>
          <option value="">— Select Zone —</option>
          {ZONE_TYPES.map(z => <option key={z} value={z}>{z}</option>)}
        </select>
        <FieldError msg={errors.zoneClassification} />
      </div>
      {/* Row 2: Legal Status | Road Type */}
      <div className="form-field">
        <label className="form-label" htmlFor="legalStatus">
          Legal Status *
          <span style={{ color:'#f59e0b', fontWeight:600, marginLeft:'6px', fontSize:'11px' }}>🔑 Key ML factor</span>
        </label>
        <select id="legalStatus"
          className={`form-select ${errors.legalStatus ? 'input-error' : ''}`}
          value={form.legalStatus} onChange={e => setField('legalStatus', e.target.value)}>
          <option value="">— Select Status —</option>
          {LEGAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <FieldError msg={errors.legalStatus} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="roadType">Road / Access Type
          <span style={{ color:'var(--text-muted)', fontWeight:400, marginLeft:'6px', fontSize:'11px' }}>(affects price ±12%)</span>
        </label>
        <select id="roadType" className="form-select"
          value={form.roadType} onChange={e => setField('roadType', e.target.value)}>
          <option value="">— Select Road Type —</option>
          {ROAD_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      {/* Row 3: Road Frontage | Plot Shape */}
      <div className="form-field">
        <label className="form-label" htmlFor="roadFrontageWidth">
          Road Frontage Width (ft)
          <span style={{ color:'var(--text-muted)', fontWeight:400, marginLeft:'6px', fontSize:'11px' }}>(optional · wider = higher value)</span>
        </label>
        <input id="roadFrontageWidth" type="number" onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} min={10} max={500}
          className={`form-input ${errors.roadFrontageWidth ? 'input-error' : ''}`}
          placeholder="e.g. 30"
          value={form.roadFrontageWidth} onChange={e => setField('roadFrontageWidth', e.target.value)} />
        <FieldError msg={errors.roadFrontageWidth} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="plotShape">Plot Shape
          <span style={{ color:'var(--text-muted)', fontWeight:400, marginLeft:'6px', fontSize:'11px' }}>(irregular = price discount)</span>
        </label>
        <select id="plotShape" className="form-select"
          value={form.plotShape} onChange={e => setField('plotShape', e.target.value)}>
          <option value="">— Select Shape —</option>
          {PLOT_SHAPES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );

  // ── STUDIO ──────────────────────────────────────────────────────────────────
  if (isStudio) return (
    <div className="form-grid">
      <div className="form-field">
        <label className="form-label" htmlFor="area">Built-up Area (sq ft) * <span style={{ color:'var(--text-muted)', fontWeight:400, fontSize:'11px' }}>(200–700 sqft typical)</span></label>
        <input id="area" type="number" onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} min={150} max={800}
          className={`form-input ${errors.area ? 'input-error' : ''}`}
          placeholder="e.g. 450"
          value={form.area} onChange={e => setField('area', e.target.value)} />
        <FieldError msg={errors.area} />
      </div>
      {carpetField}
      <div className="form-field">
        <label className="form-label" htmlFor="kitchenType">Kitchen Type * <span style={{ color:'#fbbf24', marginLeft:'6px', fontSize:'10px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>🔑 KEY ML FACTOR</span></label>
        <select id="kitchenType" className={`form-select ${errors.kitchenType ? 'input-error' : ''}`}
          value={form.kitchenType} onChange={e => setField('kitchenType', e.target.value)}>
          <option value="">— Select Kitchen —</option>
          {KITCHEN_TYPES.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <FieldError msg={errors.kitchenType} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="floor">Floor Number *</label>
        <input id="floor" type="number" onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} min={0} max={form.totalFloors || 100}
          className={`form-input ${errors.floor ? 'input-error' : ''}`}
          placeholder="e.g. 3  (0 = Ground)"
          value={form.floor} onChange={e => setField('floor', e.target.value)} />
        <FieldError msg={errors.floor} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="totalFloors">Total Floors *</label>
        <input id="totalFloors" type="number" onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} min={1} max={100}
          className={`form-input ${errors.totalFloors ? 'input-error' : ''}`}
          placeholder="e.g. 12"
          value={form.totalFloors} onChange={e => setField('totalFloors', e.target.value)} />
        <FieldError msg={errors.totalFloors} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="age">Building Age (years) *</label>
        <input id="age" type="number" onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} min={0} max={100}
          className={`form-input ${errors.age ? 'input-error' : ''}`}
          placeholder="e.g. 3"
          value={form.age} onChange={e => setField('age', e.target.value)} />
        <FieldError msg={errors.age} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="furnished">Furnishing Status *</label>
        <select id="furnished" className={`form-select ${errors.furnished ? 'input-error' : ''}`}
          value={form.furnished} onChange={e => setField('furnished', e.target.value)}>
          <option value="">— Select —</option>
          {FURNISHED_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <FieldError msg={errors.furnished} />
      </div>
      <div className="form-field" style={{ gridColumn: 'span 3' }}>
        <label className="form-label">Studio Features</label>
        <div className="form-toggle-group">
          <ToggleBtn id="managed-apt" active={form.managedApartment === true}
            onClick={() => setField('managedApartment', form.managedApartment === true ? null : true)}
            label="🏨 Managed/Service Apt (+18% value)" />
          <ToggleBtn id="loft-mez" active={form.loftMezzanine === true}
            onClick={() => setField('loftMezzanine', form.loftMezzanine === true ? null : true)}
            label="🪜 Loft/Mezzanine" />
        </div>
      </div>
    </div>
  );

  // ── VILLA / ROW HOUSE ────────────────────────────────────────────────────────
  if (isVillaRH) return (
    <div className="form-grid">
      {/* Row 1: BHK | Bathrooms | Villa Floors */}
      <div className="form-field">
        <label className="form-label" htmlFor="bhk">Bedrooms (BHK) *</label>
        <select id="bhk" className={`form-select ${errors.bhk ? 'input-error' : ''}`}
          value={form.bhk} onChange={e => setField('bhk', e.target.value)}>
          <option value="">— Select BHK —</option>
          {bhkOptions.map(n => (
            <option key={n} value={n}>{n} BHK {minArea && minArea[n] ? `(min ${minArea[n].toLocaleString()} sqft)` : ''}</option>
          ))}
        </select>
        <FieldError msg={errors.bhk} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="bathrooms">Bathrooms *
          {form.bhk && <span style={{ color:'var(--text-muted)', fontWeight:400, marginLeft:'6px', fontSize:'11px', whiteSpace:'nowrap' }}>(max {maxBath(pt, bhk)})</span>}
        </label>
        <select id="bathrooms" className={`form-select ${errors.bathrooms ? 'input-error' : ''}`}
          value={form.bathrooms} onChange={e => setField('bathrooms', e.target.value)} disabled={!form.bhk}>
          <option value="">{form.bhk ? '— Select —' : '— Select BHK first —'}</option>
          {Array.from({ length: maxBath(pt, bhk) }, (_, i) => i + 1).map(n => (
            <option key={n} value={n}>{n} Bathroom{n > 1 ? 's' : ''}</option>
          ))}
        </select>
        <FieldError msg={errors.bathrooms} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="villaFloors">No. of Floors in {pt} *</label>
        <select id="villaFloors" className={`form-select ${errors.villaFloors ? 'input-error' : ''}`}
          value={form.villaFloors} onChange={e => setField('villaFloors', e.target.value)}>
          <option value="1">G (Ground only — Single Storey)</option>
          <option value="2">G+1 (Two Storey)</option>
          <option value="3">G+2 (Three Storey)</option>
          {pt === 'Villa' && <option value="4">G+3 (Four Storey)</option>}
        </select>
        <FieldError msg={errors.villaFloors} />
      </div>
      {/* Row 2: Built-up | Plot Area | Carpet */}
      <div className="form-field">
        <label className="form-label" htmlFor="area">Built-up Area (sq ft) *
          {form.bhk && <span style={{ color:'var(--text-muted)', fontWeight:400, marginLeft:'6px' }}>min {(minArea && minArea[bhk] || 0).toLocaleString()} sqft</span>}
        </label>
        <input id="area" type="number" onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} min={minForBHK || 500} max={50000}
          className={`form-input ${errors.area ? 'input-error' : ''}`}
          placeholder={pt === 'Villa' ? 'e.g. 2800' : 'e.g. 1400'}
          value={form.area} onChange={e => setField('area', e.target.value)} />
        <FieldError msg={errors.area} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="plotArea">Plot / Land Area (sq ft) *
          <span style={{ color:'#f59e0b', fontWeight:600, marginLeft:'6px', fontSize:'11px' }}>🔑 Key ML factor</span>
        </label>
        <input id="plotArea" type="number" onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} min={200} max={50000}
          className={`form-input ${errors.plotArea ? 'input-error' : ''}`}
          placeholder={pt === 'Villa' ? 'e.g. 4000' : 'e.g. 1200'}
          value={form.plotArea} onChange={e => setField('plotArea', e.target.value)} />
        <FieldError msg={errors.plotArea} />
      </div>
      {carpetField}
      {/* Row 3: Age | Furnishing | Parking Spots */}
      <div className="form-field">
        <label className="form-label" htmlFor="age">Building Age (years) *</label>
        <input id="age" type="number" onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} min={0} max={100}
          className={`form-input ${errors.age ? 'input-error' : ''}`}
          placeholder="e.g. 5  (0 = new)"
          value={form.age} onChange={e => setField('age', e.target.value)} />
        <FieldError msg={errors.age} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="furnished">Furnishing Status *</label>
        <select id="furnished" className={`form-select ${errors.furnished ? 'input-error' : ''}`}
          value={form.furnished} onChange={e => setField('furnished', e.target.value)}>
          <option value="">— Select —</option>
          {FURNISHED_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <FieldError msg={errors.furnished} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="parkingSpots">Parking Spots</label>
        <select id="parkingSpots" className="form-select"
          value={form.parkingSpots} onChange={e => setField('parkingSpots', e.target.value)}>
          <option value="">— Select —</option>
          {['1', '2', '3', '4+'].map(n => <option key={n} value={n}>{n} Car{n !== '1' ? 's' : ''}</option>)}
        </select>
      </div>
      {/* Row 4: Servant Rooms (Villa only) */}
      {pt === 'Villa' && (
        <div className="form-field">
          <label className="form-label" htmlFor="servantRooms">Servant Rooms</label>
          <select id="servantRooms" className="form-select"
            value={form.servantRooms} onChange={e => setField('servantRooms', e.target.value)}>
            {[0, 1, 2].map(n => <option key={n} value={n}>{n} {n === 0 ? '(None)' : ''}</option>)}
          </select>
        </div>
      )}
      {/* Toggles */}
      <div className="form-field" style={{ gridColumn: 'span 3' }}>
        <label className="form-label">{pt} Features</label>
        <div className="form-toggle-group" style={{ flexWrap: 'wrap' }}>
          <ToggleBtn id="pvt-garden" active={form.privateGarden === true}
            onClick={() => setField('privateGarden', form.privateGarden === true ? null : true)}
            label="🌿 Private Garden (+6%)" />
          {pt === 'Villa' && <ToggleBtn id="pvt-pool" active={form.privatePool === true}
            onClick={() => setField('privatePool', form.privatePool === true ? null : true)}
            label="🏊 Private Pool (+12%)" />}
          {pt === 'Villa' && <ToggleBtn id="dbl-ceil" active={form.doubleCeiling === true}
            onClick={() => setField('doubleCeiling', form.doubleCeiling === true ? null : true)}
            label="⬆ Double Height Ceiling (+5%)" />}
          {pt === 'Row House' && <ToggleBtn id="corner-rh" active={form.cornerUnit === true}
            onClick={() => setField('cornerUnit', !form.cornerUnit)}
            label="📐 Corner / End Unit (+3%)" />}
          <ToggleBtn id="terrace-vh" active={form.terraceAccess === true}
            onClick={() => setField('terraceAccess', form.terraceAccess === true ? null : true)}
            label="🌇 Rooftop / Terrace (+5%)" />
        </div>
      </div>
    </div>
  );

  // ── PENTHOUSE ────────────────────────────────────────────────────────────────
  if (isPH) return (
    <div className="form-grid">
      {/* Row 1: BHK | Bathrooms | Private Terrace Area */}
      <div className="form-field">
        <label className="form-label" htmlFor="bhk">Bedrooms (BHK) *</label>
        <select id="bhk" className={`form-select ${errors.bhk ? 'input-error' : ''}`}
          value={form.bhk} onChange={e => setField('bhk', e.target.value)}>
          <option value="">— Select BHK —</option>
          {bhkOptions.map(n => (
            <option key={n} value={n}>{n} BHK {minArea && minArea[n] ? `(min ${minArea[n].toLocaleString()} sqft)` : ''}</option>
          ))}
        </select>
        <FieldError msg={errors.bhk} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="bathrooms">Bathrooms *
          {form.bhk && <span style={{ color:'var(--text-muted)', fontWeight:400, marginLeft:'6px', fontSize:'11px', whiteSpace:'nowrap' }}>(max {maxBath(pt, bhk)})</span>}
        </label>
        <select id="bathrooms" className={`form-select ${errors.bathrooms ? 'input-error' : ''}`}
          value={form.bathrooms} onChange={e => setField('bathrooms', e.target.value)} disabled={!form.bhk}>
          <option value="">{form.bhk ? '— Select —' : '— Select BHK first —'}</option>
          {Array.from({ length: maxBath(pt, bhk) }, (_, i) => i + 1).map(n => (
            <option key={n} value={n}>{n} Bathroom{n > 1 ? 's' : ''}</option>
          ))}
        </select>
        <FieldError msg={errors.bathrooms} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="terraceArea">Private Terrace Area (sq ft) *
          <span style={{ color:'#f59e0b', fontWeight:600, marginLeft:'6px', fontSize:'11px' }}>🔑 Key ML factor</span>
        </label>
        <input id="terraceArea" type="number" onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} min={100}
          className={`form-input ${errors.terraceArea ? 'input-error' : ''}`}
          placeholder="e.g. 800"
          value={form.terraceArea} onChange={e => setField('terraceArea', e.target.value)} />
        <FieldError msg={errors.terraceArea} />
      </div>
      {/* Row 2: Built-up | Carpet | Age */}
      <div className="form-field">
        <label className="form-label" htmlFor="area">Built-up Area (sq ft) *
          {form.bhk && <span style={{ color:'var(--text-muted)', fontWeight:400, marginLeft:'6px' }}>min {(minArea && minArea[bhk] || 0).toLocaleString()} sqft</span>}
        </label>
        <input id="area" type="number" onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} min={minForBHK || 1500} max={30000}
          className={`form-input ${errors.area ? 'input-error' : ''}`}
          placeholder="e.g. 3500"
          value={form.area} onChange={e => setField('area', e.target.value)} />
        <FieldError msg={errors.area} />
      </div>
      {carpetField}
      <div className="form-field">
        <label className="form-label" htmlFor="age">Building Age (years) *</label>
        <input id="age" type="number" onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} min={0} max={100}
          className={`form-input ${errors.age ? 'input-error' : ''}`}
          placeholder="e.g. 3"
          value={form.age} onChange={e => setField('age', e.target.value)} />
        <FieldError msg={errors.age} />
      </div>
      {/* Row 3: Floor | Total Floors | Furnishing */}
      <div className="form-field">
        <label className="form-label" htmlFor="floor">Floor Number * <span style={{ color:'var(--text-muted)', fontWeight:400, fontSize:'11px' }}>(should be top floor)</span></label>
        <input id="floor" type="number" onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} min={1} max={form.totalFloors || 100}
          className={`form-input ${errors.floor ? 'input-error' : ''}`}
          placeholder="e.g. 32"
          value={form.floor} onChange={e => setField('floor', e.target.value)} />
        <FieldError msg={errors.floor} />
        {form.floor && form.totalFloors && Number(form.floor) < Number(form.totalFloors) && (
          <div style={{ marginTop: '6px', fontSize: '11px', color: '#fbbf24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', padding: '5px 8px', borderRadius: '6px' }}>
            ⚠ Penthouses are typically on the top floor. Is this correct?
          </div>
        )}
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="totalFloors">Total Floors in Building *</label>
        <input id="totalFloors" type="number" onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} min={1} max={100}
          className={`form-input ${errors.totalFloors ? 'input-error' : ''}`}
          placeholder="e.g. 32"
          value={form.totalFloors} onChange={e => setField('totalFloors', e.target.value)} />
        <FieldError msg={errors.totalFloors} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="furnished">Furnishing Status *</label>
        <select id="furnished" className={`form-select ${errors.furnished ? 'input-error' : ''}`}
          value={form.furnished} onChange={e => setField('furnished', e.target.value)}>
          <option value="">— Select —</option>
          {FURNISHED_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <FieldError msg={errors.furnished} />
      </div>
      {/* Row 4: Servant Rooms | Parking Spots */}
      <div className="form-field">
        <label className="form-label" htmlFor="servantRooms">Servant Rooms</label>
        <select id="servantRooms" className="form-select"
          value={form.servantRooms} onChange={e => setField('servantRooms', e.target.value)}>
          {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n} {n === 0 ? '(None)' : ''}</option>)}
        </select>
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="parkingSpots">Parking Spots</label>
        <select id="parkingSpots" className="form-select"
          value={form.parkingSpots} onChange={e => setField('parkingSpots', e.target.value)}>
          <option value="">— Select —</option>
          {['1', '2', '3'].map(n => <option key={n} value={n}>{n} Car{n !== '1' ? 's' : ''}</option>)}
        </select>
      </div>
      {/* Penthouse luxury toggles */}
      <div className="form-field" style={{ gridColumn: 'span 3' }}>
        <label className="form-label">Penthouse Luxury Features</label>
        <div className="form-toggle-group" style={{ flexWrap: 'wrap' }}>
          <ToggleBtn id="pvt-pool-ph" active={form.privatePool === true}
            onClick={() => setField('privatePool', form.privatePool === true ? null : true)}
            label="🏊 Private Pool (+12%)" />
          <ToggleBtn id="pvt-lift" active={form.privateLift === true}
            onClick={() => setField('privateLift', form.privateLift === true ? null : true)}
            label="🛗 Private Elevator (+9%)" />
          <ToggleBtn id="dbl-ceil-ph" active={form.doubleCeiling === true}
            onClick={() => setField('doubleCeiling', form.doubleCeiling === true ? null : true)}
            label="⬆ Double Height Ceiling (+5%)" />
          <ToggleBtn id="smart-home" active={form.smartHome === true}
            onClick={() => setField('smartHome', form.smartHome === true ? null : true)}
            label="🤖 Smart Home (+6%)" />
        </div>
      </div>
    </div>
  );

  // ── BUILDER FLOOR ────────────────────────────────────────────────────────────
  if (isBF) return (
    <div className="form-grid">
      {/* Row 1: BHK | Bathrooms | Balconies */}
      <div className="form-field">
        <label className="form-label" htmlFor="bhk">Bedrooms (BHK) *</label>
        <select id="bhk" className={`form-select ${errors.bhk ? 'input-error' : ''}`}
          value={form.bhk} onChange={e => setField('bhk', e.target.value)}>
          <option value="">— Select BHK —</option>
          {bhkOptions.map(n => (
            <option key={n} value={n}>{n} BHK {minArea && minArea[n] ? `(min ${minArea[n].toLocaleString()} sqft)` : ''}</option>
          ))}
        </select>
        <FieldError msg={errors.bhk} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="bathrooms">Bathrooms *
          {form.bhk && <span style={{ color:'var(--text-muted)', fontWeight:400, marginLeft:'6px', fontSize:'11px', whiteSpace:'nowrap' }}>(max {maxBath(pt, bhk)})</span>}
        </label>
        <select id="bathrooms" className={`form-select ${errors.bathrooms ? 'input-error' : ''}`}
          value={form.bathrooms} onChange={e => setField('bathrooms', e.target.value)} disabled={!form.bhk}>
          <option value="">{form.bhk ? '— Select —' : '— Select BHK first —'}</option>
          {Array.from({ length: maxBath(pt, bhk) }, (_, i) => i + 1).map(n => (
            <option key={n} value={n}>{n} Bathroom{n > 1 ? 's' : ''}</option>
          ))}
        </select>
        <FieldError msg={errors.bathrooms} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="balconies">Balconies
          {form.bhk && <span style={{ color:'var(--text-muted)', fontWeight:400, marginLeft:'6px', fontSize:'11px' }}>(max {bhk + 1})</span>}
        </label>
        <select id="balconies" className={`form-select ${errors.balconies ? 'input-error' : ''}`}
          value={form.balconies} onChange={e => setField('balconies', e.target.value)} disabled={!form.bhk}>
          <option value="">{form.bhk ? '— Select —' : '— Select BHK first —'}</option>
          {Array.from({ length: Math.min(bhk + 2, 5) }, (_, i) => i).map(n => <option key={n} value={n}>{n} {n === 0 ? '(None)' : `Balcon${n === 1 ? 'y' : 'ies'}`}</option>)}
        </select>
      </div>
      {/* Row 2: Built-up | Carpet | Age */}
      <div className="form-field">
        <label className="form-label" htmlFor="area">Built-up Area (sq ft) *
          {form.bhk && <span style={{ color:'var(--text-muted)', fontWeight:400, marginLeft:'6px' }}>min {(minArea && minArea[bhk] || 0).toLocaleString()} sqft</span>}
        </label>
        <input id="area" type="number" onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} min={minForBHK || 400} max={8000}
          className={`form-input ${errors.area ? 'input-error' : ''}`}
          placeholder="e.g. 1100"
          value={form.area} onChange={e => setField('area', e.target.value)} />
        <FieldError msg={errors.area} />
      </div>
      {carpetField}
      <div className="form-field">
        <label className="form-label" htmlFor="age">Building Age (years) *</label>
        <input id="age" type="number" onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} min={0} max={100}
          className={`form-input ${errors.age ? 'input-error' : ''}`}
          placeholder="e.g. 8"
          value={form.age} onChange={e => setField('age', e.target.value)} />
        <FieldError msg={errors.age} />
      </div>
      {/* Row 3: Floor | Total Floors | Furnishing */}
      <div className="form-field">
        <label className="form-label" htmlFor="floor">Floor in Building *</label>
        <select id="floor" className={`form-select ${errors.floor ? 'input-error' : ''}`}
          value={form.floor} onChange={e => setField('floor', e.target.value)}>
          <option value="">— Select Floor —</option>
          <option value="0">Ground Floor</option>
          <option value="1">1st Floor</option>
          <option value="2">2nd Floor</option>
          <option value="3">3rd Floor</option>
          <option value="4">4th Floor</option>
        </select>
        <FieldError msg={errors.floor} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="totalFloors">Total Floors in Building *</label>
        <select id="totalFloors" className={`form-select ${errors.totalFloors ? 'input-error' : ''}`}
          value={form.totalFloors} onChange={e => setField('totalFloors', e.target.value)}>
          <option value="">— Select —</option>
          {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>G+{n-1} ({n} floors)</option>)}
        </select>
        <FieldError msg={errors.totalFloors} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="furnished">Furnishing Status *</label>
        <select id="furnished" className={`form-select ${errors.furnished ? 'input-error' : ''}`}
          value={form.furnished} onChange={e => setField('furnished', e.target.value)}>
          <option value="">— Select —</option>
          {FURNISHED_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <FieldError msg={errors.furnished} />
      </div>
      {/* Builder Floor critical toggles */}
      <div className="form-field" style={{ gridColumn: 'span 3' }}>
        <label className="form-label">Builder Floor Features <span style={{ color:'#f59e0b', fontSize:'11px' }}>(critical for accurate valuation)</span></label>
        <div className="form-toggle-group" style={{ flexWrap: 'wrap' }}>
          <ToggleBtn id="indep-entry" active={form.independentEntry === true}
            onClick={() => setField('independentEntry', form.independentEntry === true ? null : true)}
            label="🚪 Independent Entry (+10%) — defining feature" />
          <ToggleBtn id="terrace-acc" active={form.terraceAccess === true}
            onClick={() => setField('terraceAccess', form.terraceAccess === true ? null : true)}
            label="🌇 Terrace Access (+5%)" />
          <ToggleBtn id="basement-acc" active={form.basementAccess === true}
            onClick={() => setField('basementAccess', form.basementAccess === true ? null : true)}
            label="🅿 Stilt/Basement Parking (+3%)" />
        </div>
      </div>
    </div>
  );

  // ── APARTMENT (default / fallback) ───────────────────────────────────────────
  return (
    <div className="form-grid">
      {/* Row 1: BHK | Bathrooms | Balconies */}
      <div className="form-field">
        <label className="form-label" htmlFor="bhk">Bedrooms (BHK) *</label>
        <select id="bhk" className={`form-select ${errors.bhk ? 'input-error' : ''}`}
          value={form.bhk} onChange={e => setField('bhk', e.target.value)}>
          <option value="">— Select BHK —</option>
          {bhkOptions.map(n => (
            <option key={n} value={n}>{n} BHK {minArea && minArea[n] ? `(min ${minArea[n].toLocaleString()} sqft)` : ''}</option>
          ))}
        </select>
        <FieldError msg={errors.bhk} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="bathrooms">Bathrooms *
          {form.bhk && <span style={{ color:'var(--text-muted)', fontWeight:400, marginLeft:'6px', fontSize:'11px', whiteSpace:'nowrap' }}>(max {maxBath(pt, bhk)})</span>}
        </label>
        <select id="bathrooms" className={`form-select ${errors.bathrooms ? 'input-error' : ''}`}
          value={form.bathrooms} onChange={e => setField('bathrooms', e.target.value)} disabled={!form.bhk}>
          <option value="">{form.bhk ? '— Select —' : '— Select BHK first —'}</option>
          {Array.from({ length: maxBath(pt, bhk) }, (_, i) => i + 1).map(n => (
            <option key={n} value={n}>{n} Bathroom{n > 1 ? 's' : ''}</option>
          ))}
        </select>
        <FieldError msg={errors.bathrooms} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="balconies">Balconies *
          {form.bhk && <span style={{ color:'var(--text-muted)', fontWeight:400, marginLeft:'6px', fontSize:'11px' }}>(max {bhk + 1})</span>}
        </label>
        <select id="balconies" className={`form-select ${errors.balconies ? 'input-error' : ''}`}
          value={form.balconies} onChange={e => setField('balconies', e.target.value)} disabled={!form.bhk}>
          <option value="">{form.bhk ? '— Select —' : '— Select BHK first —'}</option>
          {Array.from({ length: Math.min(bhk + 2, 6) }, (_, i) => i).map(n => <option key={n} value={n}>{n} {n === 0 ? '(No balcony)' : `Balcon${n === 1 ? 'y' : 'ies'}`}</option>)}
        </select>
        <FieldError msg={errors.balconies} />
      </div>
      {/* Row 2: Built-up | Carpet | Age */}
      <div className="form-field">
        <label className="form-label" htmlFor="area">Built-up Area (sq ft) *
          {form.bhk && <span style={{ color:'var(--text-muted)', fontWeight:400, marginLeft:'6px' }}>min {(minArea && minArea[bhk] || 0).toLocaleString()} sqft</span>}
        </label>
        <input id="area" type="number" onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} min={minForBHK || 150} max={10000}
          className={`form-input ${errors.area ? 'input-error' : ''}`}
          placeholder="e.g. 1200"
          value={form.area} onChange={e => setField('area', e.target.value)} />
        <FieldError msg={errors.area} />
      </div>
      {carpetField}
      <div className="form-field">
        <label className="form-label" htmlFor="age">Building Age (years) *</label>
        <input id="age" type="number" onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} min={0} max={100}
          className={`form-input ${errors.age ? 'input-error' : ''}`}
          placeholder="e.g. 5  (0 = new)"
          value={form.age} onChange={e => setField('age', e.target.value)} />
        <FieldError msg={errors.age} />
      </div>
      {/* Row 3: Total Floors | Floor | Furnishing */}
      <div className="form-field">
        <label className="form-label" htmlFor="totalFloors">Total Floors in Building *</label>
        <input id="totalFloors" type="number" onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} min={1} max={100}
          className={`form-input ${errors.totalFloors ? 'input-error' : ''}`}
          placeholder="e.g. 18"
          value={form.totalFloors} onChange={e => setField('totalFloors', e.target.value)} />
        <FieldError msg={errors.totalFloors} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="floor">Your Floor Number *
          {form.totalFloors && <span style={{ color:'var(--text-muted)', fontWeight:400, marginLeft:'6px' }}>max {form.totalFloors}</span>}
        </label>
        <input id="floor" type="number" onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} min={0} max={form.totalFloors || 100}
          className={`form-input ${errors.floor ? 'input-error' : ''}`}
          placeholder="e.g. 7  (0 = Ground)"
          value={form.floor} onChange={e => setField('floor', e.target.value)} />
        <FieldError msg={errors.floor} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="furnished">Furnishing Status *</label>
        <select id="furnished" className={`form-select ${errors.furnished ? 'input-error' : ''}`}
          value={form.furnished} onChange={e => setField('furnished', e.target.value)}>
          <option value="">— Select —</option>
          {FURNISHED_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <FieldError msg={errors.furnished} />
      </div>
    </div>
  );
}

// ── Validator ─────────────────────────────────────────────────────────────────
function validate(f) {
  const e = {};
  const pt       = f.propertyType;
  const isStudio = pt === 'Studio';
  const isVillaRH= pt === 'Villa' || pt === 'Row House';
  const isPH     = pt === 'Penthouse';
  const isLand   = pt === 'Plot / Land';
  const hasFloors= !isVillaRH && !isLand;

  if (!f.state)          e.state          = 'Please select a state.';
  if (!f.city)           e.city           = 'Please select a city.';
  if (!f.locality)       e.locality       = 'Please select a locality.';
  if (!f.localityDemand) e.localityDemand = 'Please select locality demand level.';
  if (!f.propertyType)   e.propertyType   = 'Please select property type.';

  // ── LAND early-return validation (completely different fields) ──
  if (isLand) {
    const plotArea = Number(f.plotArea);
    if (!f.plotArea || plotArea <= 0)  e.plotArea          = 'Plot / land area is required.';
    else if (plotArea < 100)           e.plotArea          = 'Plot area too small (min 100 sqft).';
    else if (plotArea > 500000)        e.plotArea          = 'Plot area seems too large — please verify.';
    if (!f.zoneClassification)         e.zoneClassification = 'Please select zone classification.';
    if (!f.legalStatus)                e.legalStatus       = 'Please select legal status.';
    if (f.brokerQuote && Number(f.brokerQuote) < 100000)
      e.brokerQuote = 'Asking price must be above ₹1,00,000.';
    if (f.roadFrontageWidth) {
      const rw = Number(f.roadFrontageWidth);
      if (rw < 5) e.roadFrontageWidth = 'Frontage seems unusually narrow (<5 ft).';
      else if (rw > 1000) e.roadFrontageWidth = 'Frontage seems unrealistic (>1000 ft).';
    }
    return e; // skip all building-specific checks
  }

  // BHK (all except Studio)
  if (!isStudio && !f.bhk) e.bhk = 'Please select number of bedrooms.';
  // Bathrooms (all except Studio)
  if (!isStudio && !f.bathrooms) e.bathrooms = 'Please select bathrooms.';

  // Area validation — type-aware minimums
  const area = Number(f.area);
  const bhk  = Number(f.bhk);
  const minByType = MIN_AREA_BY_TYPE[pt];
  const minNeeded = (minByType && bhk) ? (minByType[bhk] || 0) : (isStudio ? 150 : 0);
  if (f.area === '')          e.area = 'Please enter the built-up area.';
  else if (area <= 0)         e.area = 'Area must be greater than 0.';
  else if (minNeeded && area < minNeeded)
    e.area = `${bhk ? `${bhk} BHK ` : ''}${pt} needs at least ${minNeeded.toLocaleString()} sq ft.`;
  else if (area > 50000)      e.area = 'Area seems too large — please verify.';

  if (f.carpetArea && Number(f.carpetArea) >= area)
    e.carpetArea = 'Carpet area must be less than built-up area.';

  // Plot area required for Villa / Row House + cross-field area check
  if (isVillaRH) {
    const plotArea   = Number(f.plotArea);
    const floors     = Number(f.villaFloors) || 1;
    const maxBuiltUp = Math.round(plotArea * floors);
    if (!f.plotArea || plotArea <= 0)
      e.plotArea = 'Plot/land area is required for this property type.';
    else if (plotArea < 200)
      e.plotArea = 'Plot area seems too small (min 200 sqft).';
    // Cross-field: built-up area cannot exceed plot × floors (FAR = 1.0 per floor)
    if (f.area && f.plotArea && plotArea > 0 && area > maxBuiltUp)
      e.area = `Built-up area (${area.toLocaleString()} sqft) exceeds max possible for this plot — plot ${plotArea.toLocaleString()} sqft × ${floors} floor${floors > 1 ? 's' : ''} = ${maxBuiltUp.toLocaleString()} sqft max.`;
    if (!f.villaFloors) e.villaFloors = 'Please select number of floors in the property.';
  }


  // Private terrace area required for Penthouse
  if (isPH) {
    const ta = Number(f.terraceArea);
    if (!f.terraceArea || ta <= 0) e.terraceArea = 'Private terrace area is required for penthouse valuation.';
    else if (ta > 50000)           e.terraceArea = 'Terrace area seems impossibly large (>50,000 sqft).';
  }

  // Kitchen type required for Studio
  if (isStudio && !f.kitchenType) e.kitchenType = 'Please select kitchen type.';

  const age = Number(f.age);
  if (f.age === '')   e.age = 'Please enter building age (0 = new / under-construction).';
  else if (age < 0)   e.age = 'Age cannot be negative.';
  else if (age > 100) e.age = 'Age cannot exceed 100 years.';

  // Floor / Total Floors (not for Villa / Row House — they don't have a floor number in a building)
  if (hasFloors) {
    const tf = Number(f.totalFloors), fl = Number(f.floor);
    if (f.totalFloors === '') e.totalFloors = 'Please enter total number of floors.';
    else if (tf < 1)          e.totalFloors = 'Building must have at least 1 floor.';
    else if (tf > 200)        e.totalFloors = 'Building height unrealistic (>200 floors).';
    if (f.floor === '')       e.floor = 'Please enter the floor number.';
    else if (fl < 0)          e.floor = 'Floor number cannot be negative.';
    else if (fl > 200)        e.floor = 'Floor number unrealistic.';
    else if (f.totalFloors !== '' && fl > tf) e.floor = `Floor ${fl} exceeds total floors (${tf}).`;
  }

  if (!f.furnished) e.furnished = 'Please select furnishing status.';
  if (f.brokerQuote) {
    const quote = Number(f.brokerQuote);
    if (quote < 100000)           e.brokerQuote = 'Asking price must be above ₹1,00,000.';
    else if (quote > 10000000000) e.brokerQuote = 'Price exceeds realistic max (₹1000 Cr).';
  }

  return e;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PropertyForm({ onAnalyze }) {
  const [form, setForm]       = useState(DEFAULT_FORM);
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});

  const cities     = form.state ? (STATE_CITIES[form.state] || [])       : [];
  const localities = form.city  ? (CITY_LOCALITIES[form.city] || ['Other']) : [];

  function setField(key, val) {
    let nextFormState;
    setForm(prev => {
      const next = { ...prev, [key]: val };
      if (key === 'state') { next.city = ''; next.locality = ''; }
      if (key === 'city')  { next.locality = ''; }
      if (key === 'totalFloors' && next.floor !== '' && Number(next.floor) > Number(val))
        next.floor = val;
      // Reset bathrooms if BHK changes and bathrooms now exceeds type-adjusted max
      if (key === 'bhk' && next.bathrooms !== '') {
        const cap = maxBath(next.propertyType, Number(val));
        if (Number(next.bathrooms) > cap) next.bathrooms = '';
      }
      if (key === 'propertyType') {
        Object.assign(next, {
          bhk: '', bathrooms: '', balconies: '', area: '', carpetArea: '', age: '',
          floor: '', totalFloors: '', furnished: '', plotArea: '', villaFloors: '2',
          privateGarden: null, privatePool: null, terraceArea: '', privateLift: null,
          doubleCeiling: null, smartHome: null, independentEntry: null, terraceAccess: null,
          basementAccess: null, kitchenType: '', managedApartment: null, loftMezzanine: null,
          servantRooms: '0', parkingSpots: '', zoneClassification: '', legalStatus: '',
          roadType: '', roadFrontageWidth: '', plotShape: '', waterAvailable: null,
          electricityAvailable: null, sewerAvailable: null, parking: null,
          gatedSociety: null, cornerUnit: false, liftAvailable: null, amenities: []
        });
      }
      nextFormState = next;
      return next;
    });

    let nextTouchedState;
    setTouched(t => {
      let nextT = { ...t, [key]: true };
      if (key === 'propertyType') {
        const keysToClear = ['bhk', 'bathrooms', 'balconies', 'area', 'carpetArea', 'age', 'floor', 'totalFloors', 'furnished', 'plotArea', 'villaFloors', 'terraceArea', 'kitchenType', 'servantRooms', 'parkingSpots', 'zoneClassification', 'legalStatus', 'roadType', 'roadFrontageWidth'];
        keysToClear.forEach(k => delete nextT[k]);
      }
      nextTouchedState = nextT;
      return nextT;
    });

    setErrors(prev => {
      const all = validate(nextFormState || { ...form, [key]: val });
      const out = {};
      const currentTouched = nextTouchedState || touched;
      Object.keys(all).forEach(k => { if (currentTouched[k] || k === key) out[k] = all[k]; });
      return out;
    });
  }

  const toggleAmenity = a => setField('amenities',
    form.amenities.includes(a) ? form.amenities.filter(x => x !== a) : [...form.amenities, a]
  );

  const handleSubmit = e => {
    e.preventDefault();
    setTouched(Object.keys(DEFAULT_FORM).reduce((o, k) => ({ ...o, [k]: true }), {}));
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onAnalyze({
      ...form,
      area: Number(form.area), bhk: Number(form.bhk), age: Number(form.age),
      floor: Number(form.floor), totalFloors: Number(form.totalFloors),
      bathrooms: Number(form.bathrooms), balconies: Number(form.balconies),
      carpetArea: form.carpetArea ? Number(form.carpetArea) : null,
      parking: form.parking ?? false,
      gatedSociety: form.gatedSociety,
      liftAvailable: form.liftAvailable,
      brokerQuote: form.brokerQuote ? Number(form.brokerQuote) : null,
    });
  };

  const locDone   = !!(form.state && form.city && form.locality && form.localityDemand);
  const pt_f      = form.propertyType;
  const isStudio_f  = pt_f === 'Studio';
  const isVillaRH_f = pt_f === 'Villa' || pt_f === 'Row House';
  const isPH_f      = pt_f === 'Penthouse';
  // identDone = Step 2 complete: only propertyType is required in Section 2
  // bhk/bathrooms are Section 3 spec fields
  const identDone = !!pt_f;
  const isLand_f    = pt_f === 'Plot / Land';
  const areaOkForPlot = !isVillaRH_f || !form.plotArea || !form.villaFloors ||
    Number(form.area) <= Number(form.plotArea) * Number(form.villaFloors);
  const propDone = isLand_f
    ? !!(form.plotArea && form.zoneClassification && form.legalStatus)
    : !!(
        form.area && form.age !== '' && form.furnished && areaOkForPlot &&
        (isVillaRH_f ? (form.plotArea && form.villaFloors) : (form.totalFloors && form.floor !== '')) &&
        (isPH_f ? form.terraceArea : true) &&
        (isStudio_f ? form.kitchenType : true)
      );

  const totalErrors = Object.keys(errors).length;

  return (
    <div className="form-section animate-fade-up animate-fade-up-2">
      <form className="form-card" onSubmit={handleSubmit}>

        <div className="form-header">
          <div className="form-header-icon">⚡</div>
          <div className="form-header-text">
            <h3>Property Intelligence Input</h3>
            <p>Fill all details — each field improves ML precision and differentiates your property</p>
          </div>
        </div>

        <div className="form-body">

          {/* ══ SECTION 1: Location ══ */}
          <StepBadge n="1" label="Location Details" done={locDone} />
          <div className="form-grid">

            <div className="form-field">
              <label className="form-label" htmlFor="state">State *</label>
              <select id="state" className={`form-select ${errors.state ? 'input-error' : ''}`}
                value={form.state} onChange={e => setField('state', e.target.value)}>
                <option value="">— Select State —</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <FieldError msg={errors.state} />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="city">City *</label>
              <select id="city" className={`form-select ${errors.city ? 'input-error' : ''}`}
                value={form.city} onChange={e => setField('city', e.target.value)} disabled={!form.state}>
                <option value="">{form.state ? '— Select City —' : '— Select State first —'}</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <FieldError msg={errors.city} />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="locality">Locality / Area *</label>
              <select id="locality" className={`form-select ${errors.locality ? 'input-error' : ''}`}
                value={form.locality} onChange={e => setField('locality', e.target.value)} disabled={!form.city}>
                <option value="">{form.city ? '— Select Locality —' : '— Select City first —'}</option>
                {localities.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <FieldError msg={errors.locality} />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="localityDemand">Locality Demand Level *</label>
              <select id="localityDemand" className={`form-select ${errors.localityDemand ? 'input-error' : ''}`}
                value={form.localityDemand} onChange={e => setField('localityDemand', e.target.value)}>
                <option value="">— Select Demand Level —</option>
                {DEMAND_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <FieldError msg={errors.localityDemand} />
            </div>
          </div>

          <div className="divider" />

          {/* ══ SECTION 2: Property Identifier ══ */}
          <StepBadge n="2" label="Property Identifier — Distinguish Your Property" done={identDone} />

          {/* ── GATE: lock section 2 until step 1 is complete ── */}
          {!locDone ? (
            <div style={{
              padding: '24px 20px', borderRadius: '14px', marginBottom: '20px',
              background: 'rgba(15,20,35,0.5)',
              border: '1px dashed rgba(255,255,255,0.10)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '28px' }}>🔒</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Complete the required steps first
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{
                  fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'var(--text-muted)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  ○ Step 1 · Location
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                This section unlocks once Step 1 is filled
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
                💡 In the same locality there can be 10+ properties. These fields help the ML engine identify <strong style={{ color: '#60a5fa' }}>your specific property</strong> — not just an area average.
              </div>

              <div className="form-grid">

                {/* Row 1: Society Name (full span) + Property Type */}
                <div className="form-field" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" htmlFor="societyName">
                    Society / Project / Building Name
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', fontSize: '11px' }}>
                      (optional but recommended — e.g. "Prestige Shantiniketan")
                    </span>
                  </label>
                  <input id="societyName" type="text" className="form-input"
                    placeholder="e.g. Prestige Shantiniketan, Godrej Meridien, Brigade Gateway..."
                    value={form.societyName} onChange={e => setField('societyName', e.target.value)} />
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor="propertyType">Property Type *</label>
                  <select id="propertyType" className={`form-select ${errors.propertyType ? 'input-error' : ''}`}
                    value={form.propertyType} onChange={e => setField('propertyType', e.target.value)}>
                    <option value="">— Select Type —</option>
                    {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <FieldError msg={errors.propertyType} />
                </div>

                {/* Row 2: Facing only */}
                <div className="form-field">
                  <label className="form-label" htmlFor="facing">
                    Facing Direction
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', fontSize: '11px' }}>(optional · affects price ±4%)</span>
                  </label>
                  <select id="facing" className="form-select"
                    value={form.facing} onChange={e => setField('facing', e.target.value)}>
                    <option value="">— Select Facing —</option>
                    {FACING_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

              </div>
            </>
          )}


          <div className="divider" />

          {/* ══ SECTION 3: Property Specifications (type-specific) ══ */}
          <StepBadge n="3" label="Property Specifications" done={propDone} />

          {/* ── GATE: lock section 3 until steps 1 & 2 are complete ── */}
          {!(locDone && identDone) ? (
            <div style={{
              padding: '24px 20px', borderRadius: '14px', marginBottom: '20px',
              background: 'rgba(15,20,35,0.5)',
              border: '1px dashed rgba(255,255,255,0.10)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '28px' }}>🔒</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Complete the required steps first
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {[
                  { label: 'Step 1 · Location', done: locDone },
                  { label: 'Step 2 · Property Identifier', done: identDone },
                ].map(s => (
                  <span key={s.label} style={{
                    fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px',
                    background: s.done ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.05)',
                    color: s.done ? '#34d399' : 'var(--text-muted)',
                    border: `1px solid ${s.done ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                    {s.done ? '✓' : '○'} {s.label}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                This section unlocks once Steps 1 &amp; 2 are filled
              </div>
            </div>
          ) : (
            <>
              {form.propertyType && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    📍 Analysing: {form.bhk ? form.bhk + ' BHK ' : ''}{form.propertyType} in {form.locality || 'Unknown Locality'}, {form.city || 'Unknown City'}
                  </div>
                  <div>🧠 Showing <strong style={{ color: '#fbbf24' }}>{form.propertyType}-specific</strong> fields — each field is a distinct ML signal for accurate valuation</div>
                </div>
              )}
              <TypeSpecFields form={form} errors={errors} setField={setField} />
            </>
          )}


          <div className="divider" />

          {/* ══ SECTION 4: Optional Enhancements (type-specific) ══ */}
          <StepBadge n="4" label="Optional Enhancements" done={false} />

          {/* ── GATE: lock section 4 until prerequisites are met ── */}
          {!propDone ? (
            <div style={{
              padding: '24px 20px', borderRadius: '14px', marginBottom: '20px',
              background: 'rgba(15,20,35,0.5)',
              border: '1px dashed rgba(255,255,255,0.10)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '28px' }}>🔒</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Complete the required steps first
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {[
                  { label: 'Step 1 · Location', done: locDone },
                  { label: 'Step 2 · Property Identifier', done: identDone },
                  { label: 'Step 3 · Specifications', done: propDone },
                ].map(s => (
                  <span key={s.label} style={{
                    fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px',
                    background: s.done ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.05)',
                    color: s.done ? '#34d399' : 'var(--text-muted)',
                    border: `1px solid ${s.done ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                    {s.done ? '✓' : '○'} {s.label}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                This section unlocks once all required fields in Steps 1–3 are filled
              </div>
            </div>
          ) : (
            <>
              {form.propertyType && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', padding: '8px 14px', borderRadius: '8px', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' }}>
                  ✨ Optional fields — each one improves ML accuracy and narrows the price estimate
                </div>
              )}

          {/* ── type-based Section 4 content ── */}
          {(() => {
            const pt = form.propertyType;
            const isVillaRH  = pt === 'Villa' || pt === 'Row House';
            const isPH       = pt === 'Penthouse';
            const isBF       = pt === 'Builder Floor';
            const isStudio   = pt === 'Studio';
            const isLand     = pt === 'Plot / Land';

            const Tog = ({ id, active, onClick, label }) => (
              <button type="button" id={id}
                className={`toggle-btn ${active ? 'active' : ''}`}
                onClick={onClick}>{label}</button>
            );

            // ── PLOT / LAND ────────────────────────────────────────────────
            if (isLand) return (
              <>
                <div className="form-field" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Plot Features &amp; Connectivity</label>
                  <div className="form-toggle-group" style={{ flexWrap: 'wrap' }}>
                    <Tog id="corner-land" active={form.cornerUnit === true}
                      onClick={() => setField('cornerUnit', !form.cornerUnit)}
                      label="📐 Corner Plot (+10%)" />
                    <Tog id="gated-land" active={form.gatedSociety === true}
                      onClick={() => setField('gatedSociety', form.gatedSociety === true ? null : true)}
                      label="🔒 Gated Plotted Colony (+8%)" />
                    <Tog id="water-conn" active={form.waterAvailable === true}
                      onClick={() => setField('waterAvailable', form.waterAvailable === true ? null : true)}
                      label="💧 Water Connection Available (+4%)" />
                    <Tog id="elec-conn" active={form.electricityAvailable === true}
                      onClick={() => setField('electricityAvailable', form.electricityAvailable === true ? null : true)}
                      label="⚡ Electricity Connected (+3%)" />
                    <Tog id="sewer-conn" active={form.sewerAvailable === true}
                      onClick={() => setField('sewerAvailable', form.sewerAvailable === true ? null : true)}
                      label="🚰 Sewage / Drainage (+3%)" />
                  </div>
                </div>
                <div className="form-field" style={{ marginBottom: '20px' }}>
                  <label className="form-label">
                    Colony / Development Amenities
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', fontSize: '11px' }}>(select all that apply)</span>
                  </label>
                  <div className="form-toggle-group" style={{ flexWrap: 'wrap' }}>
                    {['Compound Wall / Fencing', 'Street Lights', 'Paved Approach Road', 'Underground Utilities'].map(a => (
                      <button key={a} type="button"
                        className={`toggle-btn ${form.amenities.includes(a) ? 'active' : ''}`}
                        onClick={() => toggleAmenity(a)}
                        id={`amenity-${a.replace(/[\s/]+/g, '-').toLowerCase()}`}>{a}</button>
                    ))}
                  </div>
                </div>
              </>
            );

            // ── VILLA / ROW HOUSE ──────────────────────────────────────────
            if (isVillaRH) return (
              <>
                <div className="form-field" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Community / Colony Features</label>
                  <div className="form-toggle-group" style={{ flexWrap: 'wrap' }}>
                    <Tog id="gated-community" active={form.gatedSociety === true}
                      onClick={() => setField('gatedSociety', form.gatedSociety === true ? null : true)}
                      label="🔒 Gated Community (+5%)" />
                    <Tog id="sec-guard" active={form.liftAvailable === true}
                      onClick={() => setField('liftAvailable', form.liftAvailable === true ? null : true)}
                      label="👮 24/7 Security Guard" />
                  </div>
                </div>
                <div className="form-field" style={{ marginBottom: '20px' }}>
                  <label className="form-label">
                    Community Amenities
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', fontSize: '11px' }}>(select all that apply)</span>
                  </label>
                  <div className="form-toggle-group" style={{ flexWrap: 'wrap' }}>
                    {['Clubhouse', 'Swimming Pool', 'Tennis / Sports Court', 'Jogging Track',
                      'Children Play Area', 'Piped Gas', 'Water Harvesting', 'Garbage Collection'].map(a => (
                      <button key={a} type="button"
                        className={`toggle-btn ${form.amenities.includes(a) ? 'active' : ''}`}
                        onClick={() => toggleAmenity(a)}
                        id={`amenity-${a.replace(/[\s/]+/g, '-').toLowerCase()}`}>{a}</button>
                    ))}
                  </div>
                </div>
              </>
            );

            // ── PENTHOUSE ──────────────────────────────────────────────────
            if (isPH) return (
              <>
                <div className="form-field" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Building Luxury Features</label>
                  <div className="form-toggle-group" style={{ flexWrap: 'wrap' }}>
                    <Tog id="gated-ph" active={form.gatedSociety === true}
                      onClick={() => setField('gatedSociety', form.gatedSociety === true ? null : true)}
                      label="🔒 Secured / Gated Premises (+5%)" />
                    <Tog id="concierge" active={form.liftAvailable === true}
                      onClick={() => setField('liftAvailable', form.liftAvailable === true ? null : true)}
                      label="🛎 24/7 Concierge Service (+5%)" />
                    <Tog id="valet" active={form.parking === true}
                      onClick={() => setField('parking', form.parking === true ? null : true)}
                      label="🚗 Valet / Reserved Parking (+3%)" />

                  </div>
                </div>
                <div className="form-field" style={{ marginBottom: '20px' }}>
                  <label className="form-label">
                    Premium Building Amenities
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', fontSize: '11px' }}>(select all that apply)</span>
                  </label>
                  <div className="form-toggle-group" style={{ flexWrap: 'wrap' }}>
                    {['Gym / Fitness Center', 'Spa / Wellness', 'Swimming Pool', 'Rooftop Garden',
                      'Business Center', 'Clubhouse', 'EV Charging', 'Helipad Access'].map(a => (
                      <button key={a} type="button"
                        className={`toggle-btn ${form.amenities.includes(a) ? 'active' : ''}`}
                        onClick={() => toggleAmenity(a)}
                        id={`amenity-${a.replace(/[\s/]+/g, '-').toLowerCase()}`}>{a}</button>
                    ))}
                  </div>
                </div>
              </>
            );

            // ── BUILDER FLOOR ──────────────────────────────────────────────
            if (isBF) return (
              <>
                <div className="form-field" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Colony / Building Features</label>
                  <div className="form-toggle-group" style={{ flexWrap: 'wrap' }}>
                    <Tog id="gated-col" active={form.gatedSociety === true}
                      onClick={() => setField('gatedSociety', form.gatedSociety === true ? null : true)}
                      label="🔒 Gated Colony / Park (+4%)" />
                    <Tog id="lift-bf" active={form.liftAvailable === true}
                      onClick={() => setField('liftAvailable', form.liftAvailable === true ? null : true)}
                      label="🛗 Lift in Building (+2%)" />
                    <Tog id="no-lift-bf" active={form.liftAvailable === false}
                      onClick={() => setField('liftAvailable', form.liftAvailable === false ? null : false)}
                      label="🚶 No Lift (affects high floors)" />
                    <Tog id="corner-bf" active={form.cornerUnit === true}
                      onClick={() => setField('cornerUnit', !form.cornerUnit)}
                      label="📐 Corner Plot / Wing (+3%)" />
                  </div>
                </div>
                <div className="form-field" style={{ marginBottom: '20px' }}>
                  <label className="form-label">
                    Building / Colony Amenities
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', fontSize: '11px' }}>(select all that apply)</span>
                  </label>
                  <div className="form-toggle-group" style={{ flexWrap: 'wrap' }}>
                    {['Power Backup', 'Security / Watchman', 'CCTV', 'Water Tank / Borewell',
                      'Piped Gas', 'Intercom / Video Bell', 'Visitor Parking', 'Park Nearby'].map(a => (
                      <button key={a} type="button"
                        className={`toggle-btn ${form.amenities.includes(a) ? 'active' : ''}`}
                        onClick={() => toggleAmenity(a)}
                        id={`amenity-${a.replace(/[\s/]+/g, '-').toLowerCase()}`}>{a}</button>
                    ))}
                  </div>
                </div>
                <div className="form-field" style={{ marginBottom: '20px' }}>
                  <label className="form-label">
                    Parking
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', fontSize: '11px' }}>(optional — improves estimate)</span>
                  </label>
                  <div className="form-toggle-group">
                    <Tog id="parking-yes-bf" active={form.parking === true}
                      onClick={() => setField('parking', form.parking === true ? null : true)}
                      label="✓ Dedicated Parking" />
                    <Tog id="parking-no-bf" active={form.parking === false}
                      onClick={() => setField('parking', form.parking === false ? null : false)}
                      label="✕ Street / No Parking" />
                  </div>
                </div>
              </>
            );

            // ── STUDIO ─────────────────────────────────────────────────────
            if (isStudio) return (
              <>
                <div className="form-field" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Building Features</label>
                  <div className="form-toggle-group" style={{ flexWrap: 'wrap' }}>
                    <Tog id="gated-st" active={form.gatedSociety === true}
                      onClick={() => setField('gatedSociety', form.gatedSociety === true ? null : true)}
                      label="🔒 Secured Building (+3%)" />
                    <Tog id="lift-st" active={form.liftAvailable === true}
                      onClick={() => setField('liftAvailable', form.liftAvailable === true ? null : true)}
                      label="🛗 Lift / Elevator (+2%)" />
                    <Tog id="parking-st" active={form.parking === true}
                      onClick={() => setField('parking', form.parking === true ? null : true)}
                      label="🅿 Parking Available" />
                  </div>
                </div>
                <div className="form-field" style={{ marginBottom: '20px' }}>
                  <label className="form-label">
                    Building Amenities
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', fontSize: '11px' }}>(select all that apply)</span>
                  </label>
                  <div className="form-toggle-group" style={{ flexWrap: 'wrap' }}>
                    {['Security', 'Power Backup', 'CCTV', 'Laundry / Washing Area',
                      'Co-working Space', 'Cafeteria / Canteen', 'Gym', 'High-Speed Internet'].map(a => (
                      <button key={a} type="button"
                        className={`toggle-btn ${form.amenities.includes(a) ? 'active' : ''}`}
                        onClick={() => toggleAmenity(a)}
                        id={`amenity-${a.replace(/[\s/]+/g, '-').toLowerCase()}`}>{a}</button>
                    ))}
                  </div>
                </div>
              </>
            );

            // ── APARTMENT (default) ────────────────────────────────────────
            return (
              <>
                <div className="form-field" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Society / Building Features</label>
                  <div className="form-toggle-group" style={{ flexWrap: 'wrap' }}>
                    <Tog id="gated-yes" active={form.gatedSociety === true}
                      onClick={() => setField('gatedSociety', form.gatedSociety === true ? null : true)}
                      label="🔒 Gated Society (+5%)" />
                    <Tog id="corner-unit" active={form.cornerUnit === true}
                      onClick={() => setField('cornerUnit', !form.cornerUnit)}
                      label="📐 Corner / End Unit (+3%)" />
                    <Tog id="lift-yes" active={form.liftAvailable === true}
                      onClick={() => setField('liftAvailable', form.liftAvailable === true ? null : true)}
                      label="🛗 Lift / Elevator (+2%)" />
                    <Tog id="lift-no" active={form.liftAvailable === false}
                      onClick={() => setField('liftAvailable', form.liftAvailable === false ? null : false)}
                      label="🚶 No Lift" />
                  </div>
                </div>
                <div className="form-field" style={{ marginBottom: '20px' }}>
                  <label className="form-label">
                    Parking Availability
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', fontSize: '11px' }}>(optional — improves estimate)</span>
                  </label>
                  <div className="form-toggle-group">
                    <Tog id="parking-yes" active={form.parking === true}
                      onClick={() => setField('parking', form.parking === true ? null : true)}
                      label="✓ Yes, Covered Parking (+4%)" />
                    <Tog id="parking-no" active={form.parking === false}
                      onClick={() => setField('parking', form.parking === false ? null : false)}
                      label="✕ No Parking" />
                  </div>
                </div>
                <div className="form-field" style={{ marginBottom: '20px' }}>
                  <label className="form-label">
                    Society Amenities
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', fontSize: '11px' }}>(select all that apply)</span>
                  </label>
                  <div className="form-toggle-group" style={{ flexWrap: 'wrap' }}>
                    {['Swimming Pool', 'Gym', 'Clubhouse', 'Security', 'Garden', 'Power Backup',
                      'CCTV', 'Children Play Area', 'Intercom', 'Visitor Parking'].map(a => (
                      <button key={a} type="button"
                        className={`toggle-btn ${form.amenities.includes(a) ? 'active' : ''}`}
                        onClick={() => toggleAmenity(a)}
                        id={`amenity-${a.replace(/\s+/g, '-').toLowerCase()}`}>{a}</button>
                    ))}
                  </div>
                </div>
              </>
            );
          })()}

          {/* Broker Quote — inside unlocked gate */}
          <div className="form-field" style={{ marginBottom: '8px' }}>
            <label className="form-label" htmlFor="brokerQuote">
              Broker / Seller Asking Price (₹)
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', fontSize: '11px' }}>
                (enables negotiation analysis)
              </span>
            </label>
            <input id="brokerQuote" type="number" onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
              className={`form-input ${errors.brokerQuote ? 'input-error' : ''}`}
              style={{ maxWidth: '380px' }}
              placeholder="e.g. 85,00,000"
              value={form.brokerQuote} onChange={e => setField('brokerQuote', e.target.value)} />
            <FieldError msg={errors.brokerQuote} />
          </div>
            </>
          )}

          {/* Live Property Card Preview */}
          <PropertyCardPreview form={form} />

          {/* Error banner */}
          {totalErrors > 0 && (
            <div style={{
              padding: '12px 16px', borderRadius: '10px', marginTop: '20px', marginBottom: '8px',
              background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.3)',
              fontSize: '13px', color: '#fb7185',
            }}>
              ⚠ {totalErrors} field{totalErrors > 1 ? 's need' : ' needs'} attention before running the analysis.
            </div>
          )}

          {/* Actions */}
          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button type="submit" className="btn-primary" id="analyze-btn"
              style={{ opacity: totalErrors > 0 ? 0.55 : 1 }}>
              <span>🧠</span> Run Intelligence Engine
            </button>
            <button type="button" className="btn-secondary" id="reset-btn"
              onClick={() => { setForm(DEFAULT_FORM); setErrors({}); setTouched({}); }}>
              Reset
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
