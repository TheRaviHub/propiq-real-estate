// src/App.jsx — PropIQ · Buyer-first flow
import { useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import PropertyForm from './components/PropertyForm';
import LoadingAnalysis from './components/LoadingAnalysis';
import IntelCards from './components/IntelCards';
import PropertyCard from './components/PropertyCard';
import ExplainabilityPanel from './components/ExplainabilityPanel';
import BuyerDashboard from './components/BuyerDashboard';
import ConstructionBreakdown from './components/ConstructionBreakdown';
import TCOCalculator from './components/TCOCalculator';
import MonitoringPanel from './components/MonitoringPanel';
import { runMLEngine, formatINR } from './mlEngine';

// ── Role config (Home Buyer focus) ──────────────────────────────────────────

function getBuyerConfig(result) {
  const { estimatedPrice, priceMin, priceMax, confidenceScore, inputs } = result;
  const brokerPrice = inputs.brokerQuote || estimatedPrice * 1.08;

  return {
    accentColor: '#3b82f6', accentGlow: 'rgba(59,130,246,0.18)', borderColor: 'rgba(59,130,246,0.35)',
    reportTitle: '🏡 Your Property Report',
    reportSubtitle: 'Fair price analysis · Negotiation insights · Market signals',
    verdict: estimatedPrice <= brokerPrice * 1.06
      ? { text: 'Fair Deal',  color: '#34d399', icon: '✅' }
      : { text: 'Overpriced', color: '#fb7185', icon: '⚠️' },
    stats: [
      { label: 'ML Fair Value',  value: formatINR(estimatedPrice), color: '#60a5fa' },
      { label: 'Confidence',     value: `${confidenceScore}%`,     color: '#a78bfa' },
      { label: 'Price Range',    value: `${formatINR(priceMin)} – ${formatINR(priceMax)}`, color: '#94a3b8' },
    ],
  };
}

// ── Property summary pill — handles all types gracefully ──────────────────────
function PropertyPill({ result }) {
  const { inputs } = result;
  const typeLabel = inputs.propertyType || 'Property';
  const isStudio  = typeLabel === 'Studio';
  const isVillaRH = typeLabel === 'Villa' || typeLabel === 'Row House';

  const parts = [
    !isStudio && inputs.bhk ? `${inputs.bhk} BHK` : null,
    typeLabel,
    inputs.area ? `${Number(inputs.area).toLocaleString()} sqft` : null,
    isVillaRH && inputs.plotArea ? `Plot: ${Number(inputs.plotArea).toLocaleString()} sqft` : null,
    inputs.locality && inputs.city ? `${inputs.locality}, ${inputs.city}` : null,
    inputs.age !== undefined && inputs.age !== '' ? `${inputs.age} yr old` : null,
  ].filter(Boolean);

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
      padding: '8px 16px', borderRadius: '999px',
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px',
    }}>
      🏠
      {parts.map((p, i) => (
        <span key={i} style={{ color: i === 0 || i === parts.length - 2 ? 'var(--text-primary)' : undefined, fontWeight: i === 0 || i === parts.length - 2 ? 600 : undefined }}>
          {i > 0 && <span style={{ opacity: 0.4, marginRight: '8px' }}>·</span>}{p}
        </span>
      ))}
    </div>
  );
}

// ── CTA row after results ──────────────────────────────────────────────────────
function ResultCTA({ onNewAnalysis }) {
  const handleShare = () => {
    const text = `🏠 PropIQ Analysis complete! Check out this property intelligence report.`;
    if (navigator.share) {
      navigator.share({ title: 'PropIQ Report', text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div style={{
      display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center',
      padding: '20px 24px', borderRadius: '14px', marginTop: '28px',
      background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)',
    }}>
      <div style={{ flex: 1, minWidth: '200px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
          What would you like to do next?
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Save your report, share it with your family, or analyse a different property
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button id="cta-download" className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontSize: '13px' }}
          onClick={handleDownload}>
          ⬇ Save / Print Report
        </button>
        <button id="cta-share" className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontSize: '13px' }}
          onClick={handleShare}>
          🔗 Share Analysis
        </button>
        <button id="cta-new" className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontSize: '13px' }}
          onClick={onNewAnalysis}>
          ＋ Analyse Another Property
        </button>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [mlResult,       setMlResult]       = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [activeTab,      setActiveTab]      = useState('report');

  const handleAnalyze = useCallback(async (inputs) => {
    setLoading(true);
    setMlResult(null);
    try {
      // Call the async ML engine
      const result = await runMLEngine(inputs);
      
      // We still simulate a small loading animation delay for UX feel
      setTimeout(() => {
        setMlResult(result);
        setLoading(false);
        setActiveTab('report');
        
        // Scroll to results
        setTimeout(() => {
          document.getElementById('results-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }, 1500); 
    } catch (error) {
      console.error("Analysis failed:", error);
      setLoading(false);
      // Fallback: simple alert or toast could go here
    }
  }, []);

  // handleLoadingComplete is no longer used for data retrieval
  const handleLoadingComplete = useCallback(() => {
    // keeping signature for potential transition effects if needed, 
    // but logic moved into handleAnalyze
  }, []);

  const handleNewAnalysis = () => {
    setMlResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const roleConfig = mlResult ? getBuyerConfig(mlResult) : null;

  // Buyer-friendly tab names
  const TABS = [
    { id: 'report',  label: 'My Report',       icon: '📋' },
    { id: 'finance', label: 'Financials',       icon: '💰' },
    { id: 'market',  label: 'Market Data',      icon: '📊' },
    { id: 'why',     label: 'Why this price?',  icon: '🧩' },
  ];

  return (
    <>
      <div className="bg-mesh" />
      <div className="app-container">
        <Navbar />

        {/* ── Hero ── */}
        <section className="hero animate-fade-up">
          <div className="hero-eyebrow">
            <span>⚡</span>
            <span>India's most transparent property valuation engine</span>
          </div>
          <h1 className="hero-title">
            <span className="gradient-text">Is this property worth</span>
            <br />the asking price?
          </h1>
          <p className="hero-subtitle">
            Enter your property details and get an ML-powered fair value estimate in seconds —
            with a full breakdown of <strong>why</strong>, so you can negotiate with confidence.
          </p>
        </section>

        {/* ── Form ── */}
        <div className="section-label" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px 12px' }}>
          Enter property details
        </div>
        <PropertyForm onAnalyze={handleAnalyze} />

        {loading && <LoadingAnalysis onComplete={handleLoadingComplete} />}

        {/* ── Results ── */}
        {mlResult && roleConfig && (
          <section className="results-section" id="results-anchor">

            {/* Property Card */}
            <PropertyCard result={mlResult} />

            {/* Report Banner */}
            <div className="animate-fade-up" style={{
              borderRadius: '20px',
              border: `1px solid ${roleConfig.borderColor}`,
              background: `linear-gradient(135deg, ${roleConfig.accentGlow}, rgba(5,11,24,0.5))`,
              padding: '28px 32px', marginBottom: '28px',
              position: 'relative', zIndex: 100,
            }}>
              {/* Glow blob */}
              <div style={{
                position: 'absolute', top: -40, right: -40,
                width: 200, height: 200, borderRadius: '50%',
                background: roleConfig.accentColor, opacity: 0.07, filter: 'blur(40px)',
                pointerEvents: 'none',
              }} />

              {/* Title + verdict + actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    {roleConfig.reportTitle}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {roleConfig.reportSubtitle}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Verdict badge */}
                  <div style={{
                    padding: '8px 18px', borderRadius: '999px', fontSize: '14px', fontWeight: 700,
                    background: `${roleConfig.verdict.color}18`, border: `1px solid ${roleConfig.verdict.color}55`,
                    color: roleConfig.verdict.color, display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    {roleConfig.verdict.icon} {roleConfig.verdict.text}
                  </div>
                  <button className="btn-secondary" id="new-analysis-btn"
                    style={{ padding: '8px 18px', fontSize: '13px' }}
                    onClick={handleNewAnalysis}>
                    ↺ New Analysis
                  </button>
                </div>
              </div>

              {/* Property summary pill */}
              <PropertyPill result={mlResult} />

              {/* KPI strip */}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${roleConfig.stats.length}, 1fr)`, gap: '12px' }}>
                {roleConfig.stats.map((stat, i) => (
                  <div key={i} style={{ padding: '16px 18px', borderRadius: '14px', background: 'rgba(5,11,24,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
                      {stat.label}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Badges + role switch */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="meta-badge confidence">✓ {mlResult.confidenceScore}% ML Confidence</span>
                <span className="info-chip">🏙️ {mlResult.inputs.city}, {mlResult.inputs.state}</span>

                <div style={{ marginLeft: 'auto' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Viewing as Home Buyer 🏡</span>
                </div>
              </div>
            </div>

            {/* ── Tabs ── */}
            <div className="tabs animate-fade-up animate-fade-up-1">
              {TABS.map(tab => (
                <button key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  style={activeTab === tab.id && tab.id === 'report'
                    ? { color: roleConfig.accentColor, background: `${roleConfig.accentColor}18` } : {}}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* ── Tab Content ── */}

            {activeTab === 'report' && (
              <BuyerDashboard result={mlResult} />
            )}

            {/* 💰 Financials — Intel Cards */}
            {activeTab === 'finance' && (
              <div className="animate-fade-up">
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                    💰 Financial Breakdown
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Key financial metrics — rental income potential, ROI, appreciation forecast &amp; market liquidity.
                  </div>
                </div>
                <IntelCards result={mlResult} />
                <div style={{ marginTop: '32px' }}>
                  <ConstructionBreakdown result={mlResult} />
                </div>
                <div style={{ marginTop: '32px' }}>
                  <TCOCalculator result={mlResult} />
                </div>
              </div>
            )}

            {/* 📊 Market Data — engineered signals */}
            {activeTab === 'market' && (
              <div className="animate-fade-up">
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                    📊 Market Signals
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Demand index, infrastructure score, price per sqft &amp; comparable data for this micro-market.
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <div className="panel-title-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>⚙️</div>
                      Market Intelligence Signals
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
                    {[
                      { label: 'Price per Sq Ft',    val: `₹${mlResult.pricePerSqft.toLocaleString()}`,  icon: '💹' },
                      { label: 'Demand Index',        val: `${mlResult.localityDemandIndex}/100`,          icon: '📡' },
                      { label: 'Infrastructure',      val: `${mlResult.infraScore}/100`,                   icon: '🏗️' },
                      { label: 'Building Age Factor', val: `${mlResult.ageFactor}%`,                       icon: '📅' },
                      { label: 'Annual Growth',       val: `${mlResult.annualAppreciation}% / yr`,         icon: '📈' },
                      { label: 'Rental Yield',        val: `${mlResult.rentalYield}%`,                     icon: '🔑' },
                    ].map((f, i) => (
                      <div key={i} style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--clr-border)', background: 'rgba(5,11,24,0.4)' }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>{f.icon}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{f.label}</div>
                        <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{f.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <MonitoringPanel role="buyer" result={mlResult} />
              </div>
            )}

            {/* 🧩 Why this price? — explainability */}
            {activeTab === 'why' && (
              <div className="animate-fade-up">
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
                    🧩 Why is this property valued here?
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Every factor that pushes the price up or down — so you can negotiate with precise data.
                  </div>
                </div>
                <ExplainabilityPanel featureImportance={mlResult.featureImportance} />
                <div className="panel" style={{ marginTop: '24px' }}>
                  <div className="panel-header">
                    <div className="panel-title">
                      <div className="panel-title-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>📋</div>
                      All inputs used for valuation
                    </div>
                    <span className="info-chip">Passed to ML model</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
                    {[
                      { k: 'State',         v: mlResult.inputs.state || '—' },
                      { k: 'City',          v: mlResult.inputs.city },
                      { k: 'Locality',      v: mlResult.inputs.locality },
                      { k: 'Market Demand', v: mlResult.inputs.localityDemand },
                      { k: 'Property Type', v: mlResult.inputs.propertyType || '—' },
                      { k: 'Built-up Area', v: `${Number(mlResult.inputs.area).toLocaleString()} sqft` },
                      { k: 'BHK',           v: mlResult.inputs.bhk ? `${mlResult.inputs.bhk} BHK` : 'Studio' },
                      { k: 'Building Age',  v: `${mlResult.inputs.age} years` },
                      { k: 'Floor',         v: mlResult.inputs.floor !== undefined ? `${mlResult.inputs.floor} / ${mlResult.inputs.totalFloors}` : 'N/A' },
                      { k: 'Parking',       v: mlResult.inputs.parking ? 'Yes' : 'No' },
                      { k: 'Furnishing',    v: mlResult.inputs.furnished },
                      { k: 'Amenities',     v: `${mlResult.inputs.amenities.length} selected` },
                    ].map((item, i) => (
                      <div key={i} style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(5,11,24,0.5)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{item.k}</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── CTA ── */}
            <ResultCTA onNewAnalysis={handleNewAnalysis} />

          </section>
        )}

        {/* Footer */}
        <footer style={{ padding: '32px', textAlign: 'center', borderTop: '1px solid var(--clr-border)', color: 'var(--text-muted)', fontSize: '13px' }}>
          <div style={{ marginBottom: '8px', fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            PropIQ — Property Intelligence Engine
          </div>
          <div>Powered by ML Valuation · RERA Data · CPWD Cost Rates · Market Comparables</div>
          <div style={{ marginTop: '8px', color: '#1e293b' }}>
            © 2026 PropIQ Intelligence Systems · Built for Indian Home Buyers
          </div>
        </footer>
      </div>
    </>
  );
}
