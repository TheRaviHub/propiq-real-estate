// src/components/PropertyForm.jsx
import { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import SearchableSelect from './SearchableSelect';
import MapModal from './MapModal';

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
  // Union Territories
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
  // ── Maharashtra ──────────────────────────────────────────────────────────
  Mumbai: ['Bandra West','Bandra East','Andheri West','Andheri East','Powai','Juhu','Malad West','Malad East','Borivali West','Borivali East','Kandivali','Goregaon','Lokhandwala','Worli','Lower Parel','Prabhadevi','Dadar','Matunga','Chembur','Ghatkopar','Vikhroli','Mulund','Kurla','Bhandup','Thane West','Thane East','Navi Mumbai','Kharghar','Vashi','Panvel','Nerul','Belapur','Ulwe','Other'],
  Pune: ['Koregaon Park','Baner','Hinjewadi','Viman Nagar','Kharadi','Wakad','Hadapsar','Kalyani Nagar','Aundh','Kothrud','Bavdhan','Balewadi','Sus Road','Undri','Kondhwa','Mundhwa','Magarpatta','Wagholi','Ambegaon','Narhe','Pisoli','NIBM Road','Wanowrie','Other'],
  Nagpur: ['Dharampeth','Sadar','Civil Lines','Sitabuldi','Ramdaspeth','Pratap Nagar','Trimurti Nagar','Manewada','Hingna Road','Wardha Road','Other'],
  Nashik: ['Gangapur Road','College Road','Nashik Road','Dwarka','Satpur','Ambad','Indira Nagar','Other'],
  Thane: ['Ghodbunder Road','Manpada','Balkum','Majiwada','Wagle Estate','Hiranandani Estate','Kavesar','Other'],
  'Navi Mumbai': ['Kharghar','Vashi','Nerul','Belapur','Ulwe','Panvel','Taloja','Airoli','Ghansoli','Kopar Khairane','Other'],
  Aurangabad: ['Cidco','Garkheda','Cantonment','Beed Bypass','Other'],
  Solapur: ['Hotgi Road','Akkalkot Road','Other'],
  Kolhapur: ['Tarabai Park','Shivaji Park','Other'],
  // ── Delhi NCT ────────────────────────────────────────────────────────────
  'New Delhi': ['Connaught Place','Hauz Khas','Vasant Kunj','Dwarka','Rohini','Pitampura','South Extension','Lajpat Nagar','Defence Colony','Mayur Vihar','Saket','Green Park','Greater Kailash','Janakpuri','Paschim Vihar','Rajouri Garden','Other'],
  'South Delhi': ['Saket','Vasant Kunj','Malviya Nagar','Hauz Khas','Greater Kailash I','Greater Kailash II','Kalkaji','Chirag Delhi','Other'],
  'North Delhi': ['Model Town','Pitampura','Rohini Sector 1–4','Shalimar Bagh','Ashok Vihar','Civil Lines','Other'],
  Dwarka: ['Dwarka Sector 6','Dwarka Sector 7','Dwarka Sector 10','Dwarka Sector 12','Dwarka Sector 21','Dwarka Mor','Other'],
  Rohini: ['Rohini Sector 1','Rohini Sector 9','Rohini Sector 11','Rohini Sector 24','Prashant Vihar','Other'],
  Noida: ['Sector 18','Sector 22','Sector 44','Sector 50','Sector 62','Sector 76','Sector 78','Sector 100','Sector 137','Sector 150','Greater Noida West','Greater Noida Knowledge Park','Other'],
  Ghaziabad: ['Indirapuram','Vaishali','Raj Nagar Extension','NH-24 Corridor','Crossing Republik','Kaushambi','Vasundhara','Other'],
  // ── Haryana ──────────────────────────────────────────────────────────────
  Gurugram: ['DLF Phase 1','DLF Phase 2','DLF Phase 4','DLF Phase 5','Sohna Road','Golf Course Road','Golf Course Extension','Sector 56','Sector 57','Sector 82','MG Road','Dwarka Expressway','Palam Vihar','South City','Vatika City','Other'],
  Faridabad: ['Sector 15','NIT','Sector 21C','Ballabhgarh','Sector 29','Greater Faridabad','BPTP Park','Other'],
  Panipat: ['Model Town','Sector 11','GT Road Area','Other'],
  // ── Karnataka ────────────────────────────────────────────────────────────
  Bangalore: ['Koramangala','Indiranagar','Whitefield','Electronic City','HSR Layout','Marathahalli','Jayanagar','Bannerghatta Road','Sarjapur Road','Yelahanka','Hebbal','JP Nagar','BTM Layout','Rajajinagar','Malleshwaram','Bellandur','Varthur','KR Puram','Banaswadi','Kaggadasapura','Domlur','RT Nagar','Devanahalli','Other'],
  Mysuru: ['Gokulam','Vijayanagar','Saraswathipuram','Kuvempunagar','Hebbal','Chamundipuram','Other'],
  Mangalore: ['Hampankatta','Kadri','Bejai','Kankanady','Falnir','Balmatta','Other'],
  'Hubli-Dharwad': ['Vidyanagar','Gokul','Deshpande Nagar','Keshwapur','Other'],
  Belagavi: ['Camp','Tilakwadi','Shahpur','Other'],
  // ── Telangana ────────────────────────────────────────────────────────────
  Hyderabad: ['Banjara Hills','Jubilee Hills','Gachibowli','Kondapur','Madhapur','HITEC City','Kukatpally','Miyapur','Begumpet','Ameerpet','SR Nagar','Kokapet','Nallagandla','Manikonda','Tolichowki','Uppal','L B Nagar','Attapur','Other'],
  Warangal: ['Hanamkonda','Kazipet','Warangal Urban','Balasamudram','Other'],
  Nizamabad: ['Nizamabad Urban','Armoor','Other'],
  Karimnagar: ['Karimnagar Urban','Other'],
  // ── Andhra Pradesh ────────────────────────────────────────────────────────
  Visakhapatnam: ['MVP Colony','Gajuwaka','Rushikonda','Seethammadhara','Madhurawada','Dwaraka Nagar','Murali Nagar','Other'],
  Vijayawada: ['Benz Circle','Kanuru','MG Road','Governorpet','Moghalrajpuram','Suryaraopet','Other'],
  Guntur: ['Arundelpet','Brodipet','Old Town','Other'],
  Tirupati: ['Balaji Nagar','Karakambadi Road','RC Road','Other'],
  Kurnool: ['Old Town','New Town','Other'],
  Nellore: ['Magunta Layout','Grand Trunk Road','Other'],
  // ── Tamil Nadu ───────────────────────────────────────────────────────────
  Chennai: ['Anna Nagar','T. Nagar','Adyar','Velachery','Perambur','OMR','Porur','Tambaram','Sholinganallur','Pallavaram','Ambattur','Mogappair','Chromepet','Guduvanchery','Pallikaranai','Mylapore','Nungambakkam','Kilpauk','Other'],
  Coimbatore: ['RS Puram','Gandhipuram','Saibaba Colony','Singanallur','Peelamedu','Tidel Park','Saravanampatti','Other'],
  Madurai: ['Anna Nagar','KK Nagar','Thirunagar','Alagar Kovil Road','Iyer Bungalow','Other'],
  Salem: ['Fairlands','Swarnapuri','Alagapuram','Other'],
  Tiruchirappalli: ['Thillai Nagar','Srirangam','KK Nagar Trichy','Other'],
  Tirunelveli: ['Palayamkottai','Melapalayam','Other'],
  Vellore: ['Sathuvachari','Gandhinagar Vellore','Other'],
  // ── Kerala ───────────────────────────────────────────────────────────────
  Kochi: ['Kakkanad','Edappally','Maradu','Thrippunithura','Aluva','Kaloor','Panampilly Nagar','Elamakkara','Kadavanthra','Vyttila','Other'],
  Thiruvananthapuram: ['Kowdiar','Pattom','Vanchiyoor','Kazhakuttam','Sreekaryam','Technopark','Kesavadasapuram','Other'],
  Kozhikode: ['Calicut Beach','Nadakkavu','Palayam','Medical College Road','Mavoor Road','Other'],
  Thrissur: ['Thrissur Town','Punkunnam','Ollur','Ayyanthole','Other'],
  Kannur: ['Kannur Town','Thalassery','Other'],
  // ── Gujarat ──────────────────────────────────────────────────────────────
  Ahmedabad: ['Prahlad Nagar','Satellite','Bodakdev','Vastrapur','Navrangpura','Science City','Maninagar','Bopal','South Bopal','Shela','Thaltej','Motera','Chandkheda','Gota','Naranpura','Paldi','Other'],
  Surat: ['Adajan','Vesu','Piplod','Athwa','Pal','Althan','City Light','Katargam','Other'],
  Vadodara: ['Alkapuri','Fatehgunj','Karelibaug','Akota','Sayajigunj','Productivity Road','Other'],
  Rajkot: ['Kalawad Road','University Road','150 Feet Ring Road','Mavdi','Amin Marg','Other'],
  Gandhinagar: ['Sector 1','Sector 6','Sector 16','Infocity','Other'],
  Bhavnagar: ['Waghawadi Road','Crescent Circle Area','Other'],
  // ── Rajasthan ────────────────────────────────────────────────────────────
  Jaipur: ['Vaishali Nagar','Malviya Nagar','C-Scheme','Jagatpura','Mansarovar','Tonk Road','Ajmer Road','Chitrakoot','Sirsi Road','Bani Park','Johari Bazaar Area','Other'],
  Jodhpur: ['Ratanada','Shastri Nagar','Pal Road','Chopasni Housing Board','Other'],
  Udaipur: ['Fatehpura','Hiran Magri','Shobhagpura','Bhuwana','Other'],
  Kota: ['Talwandi','Vigyan Nagar','Rangbari','Other'],
  Bikaner: ['Rani Bazar','Sadul Colony','Other'],
  Ajmer: ['Vaishali Nagar Ajmer','Makrana Road','Other'],
  // ── Madhya Pradesh ───────────────────────────────────────────────────────
  Bhopal: ['MP Nagar','Arera Colony','Bhopal Cantonment','Kolar Road','Ayodhya Bypass','Hoshangabad Road','Other'],
  Indore: ['Vijay Nagar','AB Road','Scheme 54','Palasia','MR-10 Corridor','Bhawarkuan','Super Corridor','Other'],
  Gwalior: ['Morar','Lashkar','City Centre','Gwalior Thatipur','Other'],
  Jabalpur: ['Napier Town','Civil Lines','Adhartal','Other'],
  Ujjain: ['Freeganj','Nanakheda','Other'],
  // ── Uttar Pradesh ────────────────────────────────────────────────────────
  Lucknow: ['Gomti Nagar','Gomti Nagar Extension','Hazratganj','Aliganj','Indira Nagar','Vibhuti Khand','Mahanagar','Sushant Golf City','Sultanpur Road','Faizabad Road','Raebareli Road','Other'],
  Kanpur: ['Civil Lines','Swaroop Nagar','Kidwai Nagar','Kakadeo','Armapur','Other'],
  Agra: ['Kamla Nagar','Dayal Bagh','Fatehabad Road','Sikandra','Other'],
  Varanasi: ['Sigra','Lanka','BHU Area','Bhelupur','Nadesar','Other'],
  Prayagraj: ['Civil Lines','George Town','Naini','Jhusi','Other'],
  Meerut: ['Shastri Nagar Meerut','Kanker Khera','Lisari Gate','Other'],
  Mathura: ['Vrindavan Road','Krishna Nagar Mathura','Other'],
  // ── West Bengal ──────────────────────────────────────────────────────────
  Kolkata: ['Salt Lake Sector I–V','New Town','Park Street','Alipore','Ballygunge','Dum Dum','Garia','Tollygunge','Behala','Lake Town','Kasba','Kankurgachi','Phool Bagan','Ultadanga','Rajarhat','Other'],
  Howrah: ['Shibpur','Bamangachi','Santragachi','Other'],
  Durgapur: ['Benachity','Bidhannagar','City Centre Durgapur','Other'],
  Siliguri: ['Sevoke Road','Pradhan Nagar','Hakimpara','Other'],
  Asansol: ['Burnpur','Senraleigh','Other'],
  // ── Punjab ───────────────────────────────────────────────────────────────
  Ludhiana: ['Model Town','BRS Nagar','Dugri','Pakhowal Road','Other'],
  Amritsar: ['Ranjit Avenue','Lawrence Road','Alpha International City','MBM Offshore Road','Other'],
  Jalandhar: ['Model Town','Patel Nagar','Lajpat Nagar','Guru Nanak Dev Nagar','Other'],
  Mohali: ['Phase 5','Phase 7','Phase 10','Phase 11','Aerocity Mohali','Other'],
  Chandigarh: ['Sector 17','Sector 22','Sector 35','Sector 43','Sector 46','Manimajra','Other'],
  Panchkula: ['Sector 7','Sector 9','Sector 20','Kalka Road','Other'],
  // ── Bihar & Jharkhand ────────────────────────────────────────────────────
  Patna: ['Boring Road','Bailey Road','Rajendra Nagar','Kankarbagh','Patliputra Colony','Gandhi Maidan Area','Other'],
  Gaya: ['Bodh Gaya','Station Road Gaya','Other'],
  Ranchi: ['Harmu','Kanke Road','Lalpur','HEC Colony','Bariatu','Other'],
  Jamshedpur: ['Bistupur','Sakchi','Telco Colony','Adityapur','Other'],
  Dhanbad: ['Saraidhela','Bank More','Other'],
  // ── Odisha ───────────────────────────────────────────────────────────────
  Bhubaneswar: ['Patia','Nayapalli','Saheed Nagar','Jaydev Vihar','Chandrasekharpur','Dumduma','IRC Village','Other'],
  Cuttack: ['Cuttack City','Bidanasi','Other'],
  Rourkela: ['Rourkela Steel City','Chhend','Other'],
  // ── Assam ────────────────────────────────────────────────────────────────
  Guwahati: ['Guwahati City','Paltan Bazar','Dispur','Beltola','VIP Road Guwahati','Zoo Road Area','Other'],
  // ── Uttarakhand ──────────────────────────────────────────────────────────
  Dehradun: ['Rajpur Road','Sahastradhara Road','Clement Town','Dharampur','Patel Nagar Dehradun','Other'],
  Haridwar: ['SIDCUL Haridwar','Jwalapur','Ranipur More','Other'],
  Nainital: ['Mallital','Tallital','Other'],
  // ── Himachal Pradesh ─────────────────────────────────────────────────────
  Shimla: ['The Mall','Chhota Shimla','Kufri','Sanjauli','Other'],
  Dharamsala: ['McLeod Ganj','Dharamsala Town','Khanyara','Other'],
  // ── Goa ──────────────────────────────────────────────────────────────────
  Panaji: ['Miramar','Dona Paula','Porvorim','Other'],
  Margao: ['Fatorda','Gogol','Other'],
  // ── Chhattisgarh ─────────────────────────────────────────────────────────
  Raipur: ['Shankar Nagar','Avanti Vihar','Tatibandh','Devendra Nagar','Other'],
  Bhilai: ['Supela','Durg City','Bhilai Steel City','Other'],
  // ── Jammu & Kashmir ──────────────────────────────────────────────────────
  Srinagar: ['Jawahar Nagar','Raj Bagh','Gogji Bagh','Parimpora','Bemina','Other'],
  Jammu: ['Bakshi Nagar','Gandhi Nagar','Trikuta Nagar','Shastri Nagar Jammu','Other'],
  // ── Fallback ─────────────────────────────────────────────────────────────
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
      marginTop: '6px', fontSize: '11px', fontWeight: 500, color: '#ff7e93',
      background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.2)',
      padding: '6px 12px', borderRadius: '8px',
      backdropFilter: 'blur(10px)',
    }}>
      ⚠ {msg}
    </div>
  );
}

function StepBadge({ n, label, done }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', fontWeight: 800,
        background: done 
          ? 'linear-gradient(135deg, #10b981, #059669)' 
          : 'linear-gradient(135deg, rgba(79, 70, 229, 0.4), rgba(59, 130, 246, 0.2))',
        color: '#fff',
        border: done ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: done ? '0 4px 12px rgba(16, 185, 129, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.2)',
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
    <div className="glass" style={{
      marginTop: '24px', padding: '20px', borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(124, 58, 237, 0.08))',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
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
        <span>
          {area > 0 ? `(max ${area.toLocaleString()})` : '(optional)'}
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
          <span className="ml-badge">🔑 Primary ML signal</span>
        </label>
        <input id="plotAreaLand" type="number" onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} min={100}
          className={`form-input ${errors.plotArea ? 'input-error' : ''}`}
          placeholder="e.g. 2400"
          value={form.plotArea} onChange={e => setField('plotArea', e.target.value)} />
        <FieldError msg={errors.plotArea} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="zoneClassification">Zone Classification *</label>
        <SearchableSelect
          id="zoneClassification"
          options={ZONE_TYPES}
          value={form.zoneClassification}
          onChange={e => setField('zoneClassification', e.target.value)}
          placeholder="Select zone..."
          error={errors.zoneClassification}
        />
        <FieldError msg={errors.zoneClassification} />
      </div>
      {/* Row 2: Legal Status | Road Type */}
      <div className="form-field">
        <label className="form-label" htmlFor="legalStatus">
          Legal Status *
          <span className="ml-badge">🔑 Key ML factor</span>
        </label>
        <SearchableSelect
          id="legalStatus"
          options={LEGAL_STATUSES}
          value={form.legalStatus}
          onChange={e => setField('legalStatus', e.target.value)}
          placeholder="Select status..."
          error={errors.legalStatus}
        />
        <FieldError msg={errors.legalStatus} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="roadType">Road / Access Type
          <span style={{ color:'var(--text-muted)', fontWeight:400, marginLeft:'6px', fontSize:'11px' }}>(affects price ±12%)</span>
        </label>
        <SearchableSelect
          id="roadType"
          options={ROAD_TYPES}
          value={form.roadType}
          onChange={e => setField('roadType', e.target.value)}
          placeholder="Select road..."
        />
      </div>
      {/* Row 3: Road Frontage | Plot Shape */}
      <div className="form-field">
        <label className="form-label" htmlFor="roadFrontageWidth">
          Road Frontage Width (ft)
          <span>(optional)</span>
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
        <SearchableSelect
          id="plotShape"
          options={PLOT_SHAPES}
          value={form.plotShape}
          onChange={e => setField('plotShape', e.target.value)}
          placeholder="Select shape..."
        />
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
        <label className="form-label" htmlFor="kitchenType">Kitchen Type * <span className="ml-badge">🔑 KEY ML FACTOR</span></label>
        <SearchableSelect
          id="kitchenType"
          options={KITCHEN_TYPES}
          value={form.kitchenType}
          onChange={e => setField('kitchenType', e.target.value)}
          placeholder="Select kitchen..."
          error={errors.kitchenType}
        />
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
        <SearchableSelect
          id="furnished"
          options={FURNISHED_OPTIONS}
          value={form.furnished}
          onChange={e => setField('furnished', e.target.value)}
          placeholder="Select status..."
          error={errors.furnished}
        />
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
        <SearchableSelect
          id="bhk"
          options={bhkOptions.map(n => ({
            label: `${n} BHK ${minArea && minArea[n] ? `(min ${minArea[n].toLocaleString()} sqft)` : ''}`,
            value: n
          }))}
          value={form.bhk}
          onChange={e => setField('bhk', e.target.value)}
          placeholder="Select BHK..."
          error={errors.bhk}
        />
        <FieldError msg={errors.bhk} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="bathrooms">Bathrooms *
          {form.bhk && <span>(max {maxBath(pt, bhk)})</span>}
        </label>
        <SearchableSelect
          id="bathrooms"
          options={Array.from({ length: maxBath(pt, bhk) }, (_, i) => i + 1).map(n => ({
            label: `${n} Bathroom${n > 1 ? 's' : ''}`,
            value: n
          }))}
          value={form.bathrooms}
          onChange={e => setField('bathrooms', e.target.value)}
          placeholder={form.bhk ? "Select bathrooms..." : "Select BHK first"}
          disabled={!form.bhk}
          error={errors.bathrooms}
        />
        <FieldError msg={errors.bathrooms} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="villaFloors">No. of Floors in {pt} *</label>
        <SearchableSelect
          id="villaFloors"
          options={[
            { label: 'G (Ground only — Single Storey)', value: '1' },
            { label: 'G+1 (Two Storey)', value: '2' },
            { label: 'G+2 (Three Storey)', value: '3' },
            ...(pt === 'Villa' ? [{ label: 'G+3 (Four Storey)', value: '4' }] : [])
          ]}
          value={form.villaFloors}
          onChange={e => setField('villaFloors', e.target.value)}
          placeholder="Select floors..."
          error={errors.villaFloors}
        />
        <FieldError msg={errors.villaFloors} />
      </div>
      {/* Row 2: Built-up | Plot Area | Carpet */}
      <div className="form-field">
        <label className="form-label" htmlFor="area">Built-up Area (sq ft) *
          {form.bhk && <span>(min {(minArea && minArea[bhk] || 0).toLocaleString()})</span>}
        </label>
        <input id="area" type="number" onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} min={minForBHK || 500} max={50000}
          className={`form-input ${errors.area ? 'input-error' : ''}`}
          placeholder={pt === 'Villa' ? 'e.g. 2800' : 'e.g. 1400'}
          value={form.area} onChange={e => setField('area', e.target.value)} />
        <FieldError msg={errors.area} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="plotArea">Plot / Land Area (sq ft) *
          <span className="ml-badge">🔑 Key ML factor</span>
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
        <SearchableSelect
          id="furnished"
          options={FURNISHED_OPTIONS}
          value={form.furnished}
          onChange={e => setField('furnished', e.target.value)}
          placeholder="Select status..."
          error={errors.furnished}
        />
        <FieldError msg={errors.furnished} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="parkingSpots">Parking Spots</label>
        <SearchableSelect
          id="parkingSpots"
          options={['1', '2', '3', '4+'].map(n => ({
            label: `${n} Car${n !== '1' ? 's' : ''}`,
            value: n
          }))}
          value={form.parkingSpots}
          onChange={e => setField('parkingSpots', e.target.value)}
          placeholder="Select parking..."
        />
      </div>
      {/* Row 4: Servant Rooms (Villa only) */}
      {pt === 'Villa' && (
        <div className="form-field">
          <label className="form-label" htmlFor="servantRooms">Servant Rooms</label>
            <SearchableSelect
              id="servantRooms"
              options={[0, 1, 2].map(n => ({
                label: `${n} ${n === 0 ? '(None)' : n === 1 ? 'Servant Room' : 'Servant Rooms'}`,
                value: n
              }))}
              value={form.servantRooms}
              onChange={e => setField('servantRooms', e.target.value)}
              placeholder="Select rooms..."
            />
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
        <SearchableSelect
          id="bhk"
          options={bhkOptions.map(n => ({
            label: `${n} BHK ${minArea && minArea[n] ? `(min ${minArea[n].toLocaleString()} sqft)` : ''}`,
            value: n
          }))}
          value={form.bhk}
          onChange={e => setField('bhk', e.target.value)}
          placeholder="Select BHK..."
          error={errors.bhk}
        />
        <FieldError msg={errors.bhk} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="bathrooms">Bathrooms *
          {form.bhk && <span>(max {maxBath(pt, bhk)})</span>}
        </label>
        <SearchableSelect
          id="bathrooms"
          options={Array.from({ length: maxBath(pt, bhk) }, (_, i) => i + 1).map(n => ({
            label: `${n} Bathroom${n > 1 ? 's' : ''}`,
            value: n
          }))}
          value={form.bathrooms}
          onChange={e => setField('bathrooms', e.target.value)}
          placeholder={form.bhk ? "Select bathrooms..." : "Select BHK first"}
          disabled={!form.bhk}
          error={errors.bathrooms}
        />
        <FieldError msg={errors.bathrooms} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="terraceArea">Private Terrace Area (sq ft) *
          <span className="ml-badge">🔑 Key ML factor</span>
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
          {form.bhk && <span>(min {(minArea && minArea[bhk] || 0).toLocaleString()})</span>}
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
        <SearchableSelect
          id="furnished"
          options={FURNISHED_OPTIONS}
          value={form.furnished}
          onChange={e => setField('furnished', e.target.value)}
          placeholder="Select status..."
          error={errors.furnished}
        />
        <FieldError msg={errors.furnished} />
      </div>
      {/* Row 4: Servant Rooms | Parking Spots */}
      <div className="form-field">
        <label className="form-label" htmlFor="servantRooms">Servant Rooms</label>
        <SearchableSelect
          id="servantRooms"
          options={[0, 1, 2, 3].map(n => ({
            label: `${n} ${n === 0 ? '(None)' : n === 1 ? 'Servant Room' : 'Servant Rooms'}`,
            value: n
          }))}
          value={form.servantRooms}
          onChange={e => setField('servantRooms', e.target.value)}
          placeholder="Select rooms..."
        />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="parkingSpots">Parking Spots</label>
        <SearchableSelect
          id="parkingSpots"
          options={['1', '2', '3'].map(n => ({
            label: `${n} Car${n !== '1' ? 's' : ''}`,
            value: n
          }))}
          value={form.parkingSpots}
          onChange={e => setField('parkingSpots', e.target.value)}
          placeholder="Select parking..."
        />
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
        <SearchableSelect
          id="bhk"
          options={bhkOptions.map(n => ({
            label: `${n} BHK ${minArea && minArea[n] ? `(min ${minArea[n].toLocaleString()} sqft)` : ''}`,
            value: n
          }))}
          value={form.bhk}
          onChange={e => setField('bhk', e.target.value)}
          placeholder="Select BHK..."
          error={errors.bhk}
        />
        <FieldError msg={errors.bhk} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="bathrooms">Bathrooms *
          {form.bhk && <span>(max {maxBath(pt, bhk)})</span>}
        </label>
        <SearchableSelect
          id="bathrooms"
          options={Array.from({ length: maxBath(pt, bhk) }, (_, i) => i + 1).map(n => ({
            label: `${n} Bathroom${n > 1 ? 's' : ''}`,
            value: n
          }))}
          value={form.bathrooms}
          onChange={e => setField('bathrooms', e.target.value)}
          placeholder={form.bhk ? "Select bathrooms..." : "Select BHK first"}
          disabled={!form.bhk}
          error={errors.bathrooms}
        />
        <FieldError msg={errors.bathrooms} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="balconies">Balconies
          {form.bhk && <span style={{ color:'var(--text-muted)', fontWeight:400, marginLeft:'6px', fontSize:'11px' }}>(max {bhk + 1})</span>}
        </label>
        <SearchableSelect
          id="balconies"
          options={Array.from({ length: Math.min(bhk + 2, 5) }, (_, i) => i).map(n => ({
            label: `${n} ${n === 0 ? '(None)' : `Balcon${n === 1 ? 'y' : 'ies'}`}`,
            value: n
          }))}
          value={form.balconies}
          onChange={e => setField('balconies', e.target.value)}
          placeholder={form.bhk ? "Select balconies..." : "Select BHK first"}
          disabled={!form.bhk}
          error={errors.balconies}
        />
      </div>
      {/* Row 2: Built-up | Carpet | Age */}
      <div className="form-field">
        <label className="form-label" htmlFor="area">Built-up Area (sq ft) *
          {form.bhk && <span>(min {(minArea && minArea[bhk] || 0).toLocaleString()})</span>}
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
        <SearchableSelect
          id="floor"
          options={[
            { label: 'Ground Floor', value: '0' },
            { label: '1st Floor', value: '1' },
            { label: '2nd Floor', value: '2' },
            { label: '3rd Floor', value: '3' },
            { label: '4th Floor', value: '4' }
          ]}
          value={form.floor}
          onChange={e => setField('floor', e.target.value)}
          placeholder="Select floor..."
          error={errors.floor}
        />
        <FieldError msg={errors.floor} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="totalFloors">Total Floors in Building *</label>
        <SearchableSelect
          id="totalFloors"
          options={[2, 3, 4, 5, 6].map(n => ({ label: `G+${n-1} (${n} floors)`, value: String(n) }))}
          value={form.totalFloors}
          onChange={e => setField('totalFloors', e.target.value)}
          placeholder="Select floors..."
          error={errors.totalFloors}
        />
        <FieldError msg={errors.totalFloors} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="furnished">Furnishing Status *</label>
        <SearchableSelect
          id="furnished"
          options={FURNISHED_OPTIONS}
          value={form.furnished}
          onChange={e => setField('furnished', e.target.value)}
          placeholder="Select status..."
          error={errors.furnished}
        />
        <FieldError msg={errors.furnished} />
      </div>
      {/* Builder Floor critical toggles */}
      <div className="form-field" style={{ gridColumn: 'span 3' }}>
        <label className="form-label">Builder Floor Features <span>(critical for valuation)</span></label>
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
        <SearchableSelect
          id="bhk"
          options={bhkOptions.map(n => ({
            label: `${n} BHK ${minArea && minArea[n] ? `(min ${minArea[n].toLocaleString()} sqft)` : ''}`,
            value: n
          }))}
          value={form.bhk}
          onChange={e => setField('bhk', e.target.value)}
          placeholder="Search BHK..."
          error={errors.bhk}
        />
        <FieldError msg={errors.bhk} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="bathrooms">Bathrooms *
          {form.bhk && <span>(max {maxBath(pt, bhk)})</span>}
        </label>
        <SearchableSelect
          id="bathrooms"
          options={Array.from({ length: maxBath(pt, bhk) }, (_, i) => i + 1).map(n => ({
            label: `${n} Bathroom${n > 1 ? 's' : ''}`,
            value: n
          }))}
          value={form.bathrooms}
          onChange={e => setField('bathrooms', e.target.value)}
          placeholder={form.bhk ? "Select bathrooms..." : "Select BHK first"}
          disabled={!form.bhk}
          error={errors.bathrooms}
        />
        <FieldError msg={errors.bathrooms} />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="balconies">Balconies * <span>(max {bhk + 1})</span></label>
        <SearchableSelect
          id="balconies"
          options={Array.from({ length: Math.min(bhk + 2, 6) }, (_, i) => i).map(n => ({
            label: `${n} ${n === 0 ? '(No balcony)' : `Balcon${n === 1 ? 'y' : 'ies'}`}`,
            value: n
          }))}
          value={form.balconies}
          onChange={e => setField('balconies', e.target.value)}
          placeholder={form.bhk ? "Select balconies..." : "Select BHK first"}
          disabled={!form.bhk}
          error={errors.balconies}
        />
        <FieldError msg={errors.balconies} />
      </div>
      {/* Row 2: Built-up | Carpet | Age */}
      <div className="form-field">
        <label className="form-label" htmlFor="area">Built-up Area (sq ft) *
          {form.bhk && <span>(min {(minArea && minArea[bhk] || 0).toLocaleString()})</span>}
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
        <SearchableSelect
          id="furnished"
          options={FURNISHED_OPTIONS}
          value={form.furnished}
          onChange={e => setField('furnished', e.target.value)}
          placeholder="Select status..."
          error={errors.furnished}
        />
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
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm]       = useState(DEFAULT_FORM);
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});
  const [didTryNext, setDidTryNext] = useState(false);
  const [lockButtons, setLockButtons] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const handleMapLocationSelect = (address) => {
    const detectedState = address.state;
    const detectedCity = address.city || address.town || address.village || address.district || address.county;
    const detectedLocality = address.suburb || address.neighbourhood || address.road || address.hamlet || address.village;

    // Find closest state match
    const stateMatch = STATES.find(s => 
      detectedState && (s.toLowerCase().includes(detectedState.toLowerCase()) || detectedState.toLowerCase().includes(s.toLowerCase()))
    );

    if (stateMatch) {
      setField('state', stateMatch);
      const stateCitiesList = STATE_CITIES[stateMatch] || [];
      const cityMatch = stateCitiesList.find(c => 
        detectedCity && (c.toLowerCase().includes(detectedCity.toLowerCase()) || detectedCity.toLowerCase().includes(c.toLowerCase()))
      );

      if (cityMatch) {
        setField('city', cityMatch);
        const cityLocalitiesList = CITY_LOCALITIES[cityMatch] || [];
        const locMatch = cityLocalitiesList.find(l => 
          detectedLocality && (l.toLowerCase().includes(detectedLocality.toLowerCase()) || detectedLocality.toLowerCase().includes(l.toLowerCase()))
        );
        if (locMatch) setField('locality', locMatch);
        else if (detectedLocality) setField('locality', detectedLocality);
      } else if (detectedCity) {
        setField('city', detectedCity);
        if (detectedLocality) setField('locality', detectedLocality);
      }
    } else {
      if (detectedState) setField('state', detectedState);
      if (detectedCity) setField('city', detectedCity);
      if (detectedLocality) setField('locality', detectedLocality);
    }
  };

  // Prevent double-click skipping from Step 3 -> 4 -> Analyze
  useEffect(() => {
    setLockButtons(true);
    const t = setTimeout(() => setLockButtons(false), 150);
    return () => clearTimeout(t);
  }, [currentStep]);

  // Define which fields belong to which step for scoped validation
  const STEP_FIELDS = {
    1: ['state', 'city', 'locality', 'localityDemand'],
    2: ['propertyType'],
    3: ['bhk', 'bathrooms', 'balconies', 'area', 'carpetArea', 'age', 'floor', 'totalFloors', 'plotArea', 'villaFloors', 'terraceArea', 'kitchenType', 'zoneClassification', 'legalStatus', 'roadType', 'roadFrontageWidth', 'plotShape', 'furnished'],
    4: ['amenities', 'parking', 'gatedSociety', 'brokerQuote']
  };


  const citiesRaw  = form.state ? (STATE_CITIES[form.state] || []) : [];
  const cities     = [...new Set([...citiesRaw, form.city].filter(Boolean))];

  const localitiesRaw = form.city ? (CITY_LOCALITIES[form.city] || ['Other']) : [];
  const localities = [...new Set([...localitiesRaw, form.locality].filter(Boolean))];

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
      
      // Only show errors for fields in current or previous steps that are touched
      const relevantFields = [];
      for(let i=1; i<=currentStep; i++) relevantFields.push(...STEP_FIELDS[i]);
      
      Object.keys(all).forEach(k => { 
        if ((currentTouched[k] || k === key) && relevantFields.includes(k)) {
          out[k] = all[k]; 
        }
      });
      return out;
    });
  }


  const toggleAmenity = a => setField('amenities',
    form.amenities.includes(a) ? form.amenities.filter(x => x !== a) : [...form.amenities, a]
  );

  const handleSubmit = e => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (currentStep < 4) {
      handleNextStep();
      return;
    }
    setTouched(Object.keys(DEFAULT_FORM).reduce((o, k) => ({ ...o, [k]: true }), {}));
    const errs = validate(form);
    setErrors(errs);
    setDidTryNext(true); // Enable error banners on submission attempt
    
    if (Object.keys(errs).length > 0) {
      for (let i = 1; i <= 4; i++) {
        const stepFields = STEP_FIELDS[i] || [];
        if (stepFields.some(k => errs[k])) {
          if (currentStep !== i) setCurrentStep(i);
          return;
        }
      }
      return;
    }
    
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

  // Calculate errors only for the current step to show in the bottom banner
  const stepErrors = Object.keys(errors).filter(k => STEP_FIELDS[currentStep]?.includes(k));
  const totalStepErrors = stepErrors.length;

  const handleNextStep = () => {
    setDidTryNext(true);
    // Only mark fields in the CURRENT step as touched
    const currentStepFields = STEP_FIELDS[currentStep] || [];
    const newTouched = { ...touched };
    currentStepFields.forEach(k => newTouched[k] = true);
    setTouched(newTouched);

    const allErrors = validate(form);
    const stepHasErrors = currentStepFields.some(k => allErrors[k]);
    
    // Update errors state with current step's errors
    const nextErrors = {};
    Object.keys(allErrors).forEach(k => {
      if (newTouched[k]) nextErrors[k] = allErrors[k];
    });
    setErrors(nextErrors);
    
    if (!stepHasErrors) {
      setCurrentStep(prev => prev + 1);
      setTouched({}); // Reset touched for the new step to keep it clean
      setDidTryNext(false);
    }
  };


  const handlePrevStep = () => setCurrentStep(prev => prev - 1);

  return (
    <div className="form-section animate-fade-up animate-fade-up-2">
      <div className="form-card" onKeyDown={e => {
        if (e.key === 'Enter' && currentStep === 4) handleSubmit(e);
      }}>

        <div className="form-header">
          <div className="form-header-icon">⚡</div>
          <div className="form-header-text">
            <h3>Property Intelligence Input</h3>
            <p>Step {currentStep} of 4 — {
              currentStep === 1 ? "Location Context" :
              currentStep === 2 ? "Property Identifier" :
              currentStep === 3 ? "Specifications" : "Enhancements & Finalize"
            }</p>
          </div>
        </div>

        <div className="form-body">
          {/* Progress Indicator */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {[1, 2, 3, 4].map(step => (
              <div key={step} style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background: step < currentStep ? 'var(--clr-accent-emerald)' : step === currentStep ? 'var(--clr-primary)' : 'rgba(255,255,255,0.1)',
                transition: 'all var(--transition-base)'
              }} />
            ))}
          </div>

          {/* ══ SECTION 1: Location ══ */}
          {currentStep === 1 && (
            <div className="wizard-step animate-fade-up" style={{ position: 'relative', zIndex: 10 }}>
              <StepBadge n="1" label="Location Details" done={locDone} />
              <div className="form-grid">

                <div className="form-field">
                  <label className="form-label" htmlFor="state">State *</label>
                  <SearchableSelect
                    id="state"
                    options={STATES}
                    value={form.state}
                    onChange={e => setField('state', e.target.value)}
                    placeholder="Search state..."
                    error={errors.state}
                  />
                  <FieldError msg={errors.state} />
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor="city">City *</label>
                  <SearchableSelect
                    id="city"
                    options={cities}
                    value={form.city}
                    onChange={e => setField('city', e.target.value)}
                    placeholder={form.state ? "Search city..." : "Select State first"}
                    disabled={!form.state}
                    error={errors.city}
                  />
                  <FieldError msg={errors.city} />
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor="locality">Locality / Area *</label>
                  <SearchableSelect
                    id="locality"
                    options={localities}
                    value={form.locality}
                    onChange={e => setField('locality', e.target.value)}
                    placeholder={form.city ? "Search locality..." : "Select City first"}
                    disabled={!form.city}
                    error={errors.locality}
                  />
                  <FieldError msg={errors.locality} />
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor="localityDemand">Locality Demand Level *</label>
                  <SearchableSelect
                    id="localityDemand"
                    options={DEMAND_LEVELS}
                    value={form.localityDemand}
                    onChange={e => setField('localityDemand', e.target.value)}
                    placeholder="Select demand level..."
                    error={errors.localityDemand}
                  />
                  <FieldError msg={errors.localityDemand} />
                </div>
              </div>

              {/* ── Refined Location Divider ── */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                margin: '28px 0 20px'
              }}>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.2), rgba(255,255,255,0.2))' }}></div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 900,
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  background: 'rgba(255,255,255,0.08)',
                  padding: '4px 14px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>OR</div>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.2), rgba(255,255,255,0.2))' }}></div>
              </div>

              {/* ── Premium Map Picker Button ── */}
              <button 
                type="button" 
                onClick={() => setIsMapOpen(true)}
                style={{ 
                  width: '100%', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '16px', 
                  background: 'rgba(6, 182, 212, 0.08)', 
                  border: '1px solid rgba(6, 182, 212, 0.2)',
                  padding: '16px 24px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(6, 182, 212, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px -10px rgba(6, 182, 212, 0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(6, 182, 212, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.2)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ 
                  background: 'linear-gradient(135deg, #06b6d4, #2dd4bf)', 
                  borderRadius: '14px', 
                  width: '40px', 
                  height: '40px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)',
                  position: 'relative'
                }}>
                  <MapPin size={20} />
                  <div style={{
                    position: 'absolute',
                    inset: '-5px',
                    border: '2px solid #06b6d4',
                    borderRadius: '18px',
                    opacity: 0.5,
                    animation: 'pulse 2s infinite'
                  }} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', letterSpacing: '0.3px' }}>Pick Location from Map</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Faster pinpointing for State, City & Locality</div>
                </div>
              </button>

              <MapModal 
                isOpen={isMapOpen} 
                onClose={() => setIsMapOpen(false)} 
                onSelectLocation={handleMapLocationSelect} 
              />
            </div>
          )}

          {/* ══ SECTION 2: Property Identifier ══ */}
          {currentStep === 2 && (
            <div className="wizard-step animate-fade-up" style={{ position: 'relative', zIndex: 10 }}>
              <StepBadge n="2" label="Property Identifier — Distinguish Your Property" done={identDone} />
              
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
                  <SearchableSelect
                    id="propertyType"
                    options={PROPERTY_TYPES}
                    value={form.propertyType}
                    onChange={e => setField('propertyType', e.target.value)}
                    placeholder="Search type..."
                    error={errors.propertyType}
                  />
                  <FieldError msg={errors.propertyType} />
                </div>

                {/* Row 2: Facing only */}
                <div className="form-field">
                  <label className="form-label" htmlFor="facing">
                    Facing Direction
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', fontSize: '11px' }}>(optional · affects price ±4%)</span>
                  </label>
                  <SearchableSelect
                    id="facing"
                    options={FACING_OPTIONS}
                    value={form.facing}
                    onChange={e => setField('facing', e.target.value)}
                    placeholder="Search facing..."
                  />
                </div>

              </div>
            </div>
          )}

          {/* ══ SECTION 3: Property Specifications (type-specific) ══ */}
          {currentStep === 3 && (
            <div className="wizard-step animate-fade-up" style={{ position: 'relative', zIndex: 10 }}>
              <StepBadge n="3" label="Property Specifications" done={propDone} />
              
              {form.propertyType && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    📍 Analysing: {form.bhk ? form.bhk + ' BHK ' : ''}{form.propertyType} in {form.locality || 'Unknown Locality'}, {form.city || 'Unknown City'}
                  </div>
                  <div>🧠 Showing <strong style={{ color: '#fbbf24' }}>{form.propertyType}-specific</strong> fields — each field is a distinct ML signal for accurate valuation</div>
                </div>
              )}
              <TypeSpecFields form={form} errors={errors} setField={setField} />
            </div>
          )}

          {/* ══ SECTION 4: Optional Enhancements (type-specific) ══ */}
          {currentStep === 4 && (
            <div className="wizard-step animate-fade-up" style={{ position: 'relative', zIndex: 10 }}>
              <StepBadge n="4" label="Optional Enhancements" done={false} />
              
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
                        <Tog id="corner-land" active={form.cornerUnit === true} onClick={() => setField('cornerUnit', !form.cornerUnit)} label="📐 Corner Plot (+10%)" />
                        <Tog id="gated-land" active={form.gatedSociety === true} onClick={() => setField('gatedSociety', form.gatedSociety === true ? null : true)} label="🔒 Gated Plotted Colony (+8%)" />
                        <Tog id="water-conn" active={form.waterAvailable === true} onClick={() => setField('waterAvailable', form.waterAvailable === true ? null : true)} label="💧 Water Connection Available (+4%)" />
                        <Tog id="elec-conn" active={form.electricityAvailable === true} onClick={() => setField('electricityAvailable', form.electricityAvailable === true ? null : true)} label="⚡ Electricity Connected (+3%)" />
                        <Tog id="sewer-conn" active={form.sewerAvailable === true} onClick={() => setField('sewerAvailable', form.sewerAvailable === true ? null : true)} label="🚰 Sewage / Drainage (+3%)" />
                      </div>
                    </div>
                    <div className="form-field" style={{ marginBottom: '20px' }}>
                      <label className="form-label">
                        Colony / Development Amenities
                        <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', fontSize: '11px' }}>(select all that apply)</span>
                      </label>
                      <div className="form-toggle-group" style={{ flexWrap: 'wrap' }}>
                        {['Compound Wall / Fencing', 'Street Lights', 'Paved Approach Road', 'Underground Utilities'].map(a => (
                          <button key={a} type="button" className={`toggle-btn ${form.amenities.includes(a) ? 'active' : ''}`} onClick={() => toggleAmenity(a)} id={`amenity-${a.replace(/[\s/]+/g, '-').toLowerCase()}`}>{a}</button>
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
                        <Tog id="gated-community" active={form.gatedSociety === true} onClick={() => setField('gatedSociety', form.gatedSociety === true ? null : true)} label="🔒 Gated Community (+5%)" />
                        <Tog id="sec-guard" active={form.liftAvailable === true} onClick={() => setField('liftAvailable', form.liftAvailable === true ? null : true)} label="👮 24/7 Security Guard" />
                      </div>
                    </div>
                    <div className="form-field" style={{ marginBottom: '20px' }}>
                      <label className="form-label">
                        Community Amenities
                        <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', fontSize: '11px' }}>(select all that apply)</span>
                      </label>
                      <div className="form-toggle-group" style={{ flexWrap: 'wrap' }}>
                        {['Clubhouse', 'Swimming Pool', 'Tennis / Sports Court', 'Jogging Track', 'Children Play Area', 'Piped Gas', 'Water Harvesting', 'Garbage Collection'].map(a => (
                          <button key={a} type="button" className={`toggle-btn ${form.amenities.includes(a) ? 'active' : ''}`} onClick={() => toggleAmenity(a)} id={`amenity-${a.replace(/[\s/]+/g, '-').toLowerCase()}`}>{a}</button>
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
                        <Tog id="gated-ph" active={form.gatedSociety === true} onClick={() => setField('gatedSociety', form.gatedSociety === true ? null : true)} label="🔒 Secured / Gated Premises (+5%)" />
                        <Tog id="concierge" active={form.liftAvailable === true} onClick={() => setField('liftAvailable', form.liftAvailable === true ? null : true)} label="🛎 24/7 Concierge Service (+5%)" />
                        <Tog id="valet" active={form.parking === true} onClick={() => setField('parking', form.parking === true ? null : true)} label="🚗 Valet / Reserved Parking (+3%)" />
                      </div>
                    </div>
                    <div className="form-field" style={{ marginBottom: '20px' }}>
                      <label className="form-label">
                        Premium Building Amenities
                        <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', fontSize: '11px' }}>(select all that apply)</span>
                      </label>
                      <div className="form-toggle-group" style={{ flexWrap: 'wrap' }}>
                        {['Gym / Fitness Center', 'Spa / Wellness', 'Swimming Pool', 'Rooftop Garden', 'Business Center', 'Clubhouse', 'EV Charging', 'Helipad Access'].map(a => (
                          <button key={a} type="button" className={`toggle-btn ${form.amenities.includes(a) ? 'active' : ''}`} onClick={() => toggleAmenity(a)} id={`amenity-${a.replace(/[\s/]+/g, '-').toLowerCase()}`}>{a}</button>
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
                        <Tog id="gated-col" active={form.gatedSociety === true} onClick={() => setField('gatedSociety', form.gatedSociety === true ? null : true)} label="🔒 Gated Colony / Park (+4%)" />
                        <Tog id="lift-bf" active={form.liftAvailable === true} onClick={() => setField('liftAvailable', form.liftAvailable === true ? null : true)} label="🛗 Lift in Building (+2%)" />
                        <Tog id="no-lift-bf" active={form.liftAvailable === false} onClick={() => setField('liftAvailable', form.liftAvailable === false ? null : false)} label="🚶 No Lift (affects high floors)" />
                        <Tog id="corner-bf" active={form.cornerUnit === true} onClick={() => setField('cornerUnit', !form.cornerUnit)} label="📐 Corner Plot / Wing (+3%)" />
                      </div>
                    </div>
                    <div className="form-field" style={{ marginBottom: '20px' }}>
                      <label className="form-label">
                        Building / Colony Amenities
                        <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', fontSize: '11px' }}>(select all that apply)</span>
                      </label>
                      <div className="form-toggle-group" style={{ flexWrap: 'wrap' }}>
                        {['Power Backup', 'Security / Watchman', 'CCTV', 'Water Tank / Borewell', 'Piped Gas', 'Intercom / Video Bell', 'Visitor Parking', 'Park Nearby'].map(a => (
                          <button key={a} type="button" className={`toggle-btn ${form.amenities.includes(a) ? 'active' : ''}`} onClick={() => toggleAmenity(a)} id={`amenity-${a.replace(/[\s/]+/g, '-').toLowerCase()}`}>{a}</button>
                        ))}
                      </div>
                    </div>
                    <div className="form-field" style={{ marginBottom: '20px' }}>
                      <label className="form-label">
                        Parking
                        <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', fontSize: '11px' }}>(optional — improves estimate)</span>
                      </label>
                      <div className="form-toggle-group">
                        <Tog id="parking-yes-bf" active={form.parking === true} onClick={() => setField('parking', form.parking === true ? null : true)} label="✓ Dedicated Parking" />
                        <Tog id="parking-no-bf" active={form.parking === false} onClick={() => setField('parking', form.parking === false ? null : false)} label="✕ Street / No Parking" />
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
                        <Tog id="gated-st" active={form.gatedSociety === true} onClick={() => setField('gatedSociety', form.gatedSociety === true ? null : true)} label="🔒 Secured Building (+3%)" />
                        <Tog id="lift-st" active={form.liftAvailable === true} onClick={() => setField('liftAvailable', form.liftAvailable === true ? null : true)} label="🛗 Lift / Elevator (+2%)" />
                        <Tog id="parking-st" active={form.parking === true} onClick={() => setField('parking', form.parking === true ? null : true)} label="🅿 Parking Available" />
                      </div>
                    </div>
                    <div className="form-field" style={{ marginBottom: '20px' }}>
                      <label className="form-label">
                        Building Amenities
                        <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', fontSize: '11px' }}>(select all that apply)</span>
                      </label>
                      <div className="form-toggle-group" style={{ flexWrap: 'wrap' }}>
                        {['Security', 'Power Backup', 'CCTV', 'Laundry / Washing Area', 'Co-working Space', 'Cafeteria / Canteen', 'Gym', 'High-Speed Internet'].map(a => (
                          <button key={a} type="button" className={`toggle-btn ${form.amenities.includes(a) ? 'active' : ''}`} onClick={() => toggleAmenity(a)} id={`amenity-${a.replace(/[\s/]+/g, '-').toLowerCase()}`}>{a}</button>
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
                        <Tog id="gated-yes" active={form.gatedSociety === true} onClick={() => setField('gatedSociety', form.gatedSociety === true ? null : true)} label="🔒 Gated Society (+5%)" />
                        <Tog id="corner-unit" active={form.cornerUnit === true} onClick={() => setField('cornerUnit', !form.cornerUnit)} label="📐 Corner / End Unit (+3%)" />
                        <Tog id="lift-yes" active={form.liftAvailable === true} onClick={() => setField('liftAvailable', form.liftAvailable === true ? null : true)} label="🛗 Lift / Elevator (+2%)" />
                        <Tog id="lift-no" active={form.liftAvailable === false} onClick={() => setField('liftAvailable', form.liftAvailable === false ? null : false)} label="🚶 No Lift" />
                      </div>
                    </div>
                    <div className="form-field" style={{ marginBottom: '20px' }}>
                      <label className="form-label">
                        Parking Availability
                        <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', fontSize: '11px' }}>(optional — improves estimate)</span>
                      </label>
                      <div className="form-toggle-group">
                        <Tog id="parking-yes" active={form.parking === true} onClick={() => setField('parking', form.parking === true ? null : true)} label="✓ Yes, Covered Parking (+4%)" />
                        <Tog id="parking-no" active={form.parking === false} onClick={() => setField('parking', form.parking === false ? null : false)} label="✕ No Parking" />
                      </div>
                    </div>
                    <div className="form-field" style={{ marginBottom: '20px' }}>
                      <label className="form-label">
                        Society Amenities
                        <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', fontSize: '11px' }}>(select all that apply)</span>
                      </label>
                      <div className="form-toggle-group" style={{ flexWrap: 'wrap' }}>
                        {['Swimming Pool', 'Gym', 'Clubhouse', 'Security', 'Garden', 'Power Backup', 'CCTV', 'Children Play Area', 'Intercom', 'Visitor Parking'].map(a => (
                          <button key={a} type="button" className={`toggle-btn ${form.amenities.includes(a) ? 'active' : ''}`} onClick={() => toggleAmenity(a)} id={`amenity-${a.replace(/\s+/g, '-').toLowerCase()}`}>{a}</button>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Broker Quote */}
              <div className="form-field" style={{ marginBottom: '8px', marginTop: '20px' }}>
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
            </div>
          )}

          {/* Live Property Card Preview */}
          <PropertyCardPreview form={form} />

          {/* Error banner */}
          {/* Error banner - only show for current step if user tried to move forward */}
          {didTryNext && totalStepErrors > 0 && (
            <div style={{
              padding: '12px 16px', borderRadius: '10px', marginTop: '20px', marginBottom: '8px',
              background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.3)',
              fontSize: '13px', color: '#fb7185',
            }}>
              ⚠ {totalStepErrors} field{totalStepErrors > 1 ? 's in this step need' : ' in this step needs'} attention before continuing.
            </div>
          )}


          {/* Actions */}
          <div className="form-actions" style={{ marginTop: '30px', borderTop: '1px solid var(--clr-border)', paddingTop: '24px', justifyContent: 'space-between' }}>
            {currentStep > 1 ? (
              <button type="button" className="btn-secondary" onClick={handlePrevStep}>
                ← Back
              </button>
            ) : (
              <button type="button" className="btn-secondary" onClick={() => { setForm(DEFAULT_FORM); setErrors({}); setTouched({}); }}>
                Reset Form
              </button>
            )}

            {currentStep < 4 ? (
              <button type="button" className="btn-primary" onClick={handleNextStep} disabled={lockButtons}>
                Next Step →
              </button>
            ) : (
              <button type="button" className="btn-primary" id="analyze-btn" 
                onClick={handleSubmit}
                disabled={lockButtons}
                style={{ 
                  opacity: lockButtons ? 0.6 : 1,
                  cursor: lockButtons ? 'not-allowed' : 'pointer'
                }}>
                <span>🧠</span> Run Intelligence Engine
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
