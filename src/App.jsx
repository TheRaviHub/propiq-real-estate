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
  const isHighConf = confidenceScore >= 80;
  const isMidConf  = confidenceScore >= 60;
  
  const confColor = isHighConf ? '#34d399' : (isMidConf ? '#fbbf24' : '#fb7185');
  const verdict = estimatedPrice <= brokerPrice * 1.06
    ? { text: 'Fair Deal',  color: '#34d399', icon: '✅' }
    : { text: 'Overpriced', color: '#fb7185', icon: '⚠️' };

  return {
    accentColor: verdict.color === '#34d399' ? '#3b82f6' : '#f43f5e',
    accentGlow: verdict.color === '#34d399' ? 'rgba(59,130,246,0.12)' : 'rgba(244,63,94,0.12)',
    borderColor: verdict.color === '#34d399' ? 'rgba(59,130,246,0.25)' : 'rgba(244,63,94,0.25)',
    reportTitle: 'Your Property Report',
    reportSubtitle: 'Fair price analysis · Negotiation insights · Market signals',
    verdict,
    stats: [
      { label: 'ML Fair Value',  value: formatINR(estimatedPrice), color: '#38bdf8' },
      { label: 'Confidence',     value: `${confidenceScore}%`,     color: confColor },
      { label: 'Price Range',    value: `${formatINR(priceMin)} – ${formatINR(priceMax)}`, color: '#c084fc' },
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

  const handleDownload = () => window.print();

  return (
    <div style={{
      display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center',
      padding: '24px', borderRadius: '16px', marginTop: '32px',
      background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
    }}>
      <div style={{ flex: 1, minWidth: '200px' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Finalize & Share
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Save your analysis or start a fresh valuation for a different property
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button className="btn-secondary" onClick={handleDownload} style={{ padding: '12px 20px', fontSize: '14px' }}>
          ⬇ Save PDF
        </button>
        <button className="btn-primary" onClick={onNewAnalysis} style={{ padding: '12px 20px', fontSize: '14px' }}>
          ＋ New Analysis
        </button>
      </div>
    </div>
  );
}

function ResultBadge({ n, label, done }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '14px', fontWeight: 700,
        background: 'var(--clr-accent-emerald)',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(16,185,129,0.3)',
      }}>
        ✓
      </div>
      <span style={{ fontSize: '14px', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </span>
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
      const result = await runMLEngine(inputs);
      // Wait for animation to finish (7 steps * 380ms + buffer)
      setTimeout(() => {
        setMlResult(result);
      }, 2000); 
    } catch (error) {
      console.error("Analysis failed:", error);
      setLoading(false);
    }
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setLoading(false);
    setActiveTab('report');
    setTimeout(() => {
      document.getElementById('results-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
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
        {!mlResult && !loading && (
          <>
            <div className="section-label" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px 12px' }}>
              Enter property details
            </div>
            <PropertyForm onAnalyze={handleAnalyze} />
          </>
        )}

        {loading && <LoadingAnalysis onComplete={handleLoadingComplete} />}

        {/* ── Results ── */}
        {mlResult && !loading && roleConfig && (
          <>
            <div className="section-label" style={{ maxWidth: '1200px', margin: '48px auto 16px', padding: '0 32px' }}>
              Intelligence Analysis complete
            </div>
            
            <section className="form-card animate-fade-up" id="results-anchor" style={{ maxWidth: '1200px', margin: '0 auto' }}>
              {/* Header mimics wizard steps */}
              <div className="form-header">
                <div className="form-header-icon" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>📊</div>
                <div className="form-header-text">
                  <h3>Intelligence Report</h3>
                  <p>Comprehensive ML Valuation & Market Breakdown</p>
                </div>
              </div>

              <div className="form-body">
                <div className="wizard-step">
                  <ResultBadge label="Step 5: Analysis Complete" />

                  {/* Property Identity Card */}
                  <PropertyCard result={mlResult} />

                  {/* Main Result Panel */}
                  <div style={{
                    borderRadius: '24px',
                    border: `1px solid ${roleConfig.borderColor}`,
                    background: `linear-gradient(135deg, ${roleConfig.accentGlow}, rgba(5,11,24,0.3))`,
                    padding: '32px', marginBottom: '32px',
                    position: 'relative', overflow: 'hidden'
                  }}>
                    {/* Glow blob */}
                    <div style={{
                      position: 'absolute', top: -100, right: -100,
                      width: 300, height: 300, borderRadius: '50%',
                      background: roleConfig.accentColor, opacity: 0.1, filter: 'blur(80px)',
                      pointerEvents: 'none',
                    }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
                      <div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                          {roleConfig.reportTitle}
                        </h2>
                        <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
                          {roleConfig.reportSubtitle}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{
                          padding: '10px 22px', borderRadius: '999px', fontSize: '15px', fontWeight: 700,
                          background: `${roleConfig.verdict.color}18`, border: `1px solid ${roleConfig.verdict.color}55`,
                          color: roleConfig.verdict.color, display: 'flex', alignItems: 'center', gap: '8px',
                        }}>
                          {roleConfig.verdict.icon} {roleConfig.verdict.text}
                        </div>
                      </div>
                    </div>

                    <PropertyPill result={mlResult} />

                    {/* KPI Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                      {roleConfig.stats.map((stat, i) => (
                        <div key={i} className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-xl)' }}>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                            {stat.label}
                          </div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: stat.color }}>
                            {stat.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="meta-badge confidence">✓ {mlResult.confidenceScore}% ML Confidence</span>
                      <span className="info-chip">🏙️ {mlResult.inputs.city}, {mlResult.inputs.state}</span>
                    </div>
                  </div>

                  {/* ── Tabs ── */}
                  <div className="tabs" style={{ marginBottom: '32px' }}>
                    {TABS.map(tab => (
                      <button key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        style={activeTab === tab.id && tab.id === 'report'
                          ? { color: roleConfig.accentColor, background: `${roleConfig.accentColor}18` } : {}}>
                        {tab.icon} {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* ── Tab Content ── */}
                  <div style={{ minHeight: '400px' }}>
                    {activeTab === 'report' && <BuyerDashboard result={mlResult} />}
                    {activeTab === 'finance' && (
                      <div className="animate-fade-up">
                        <div style={{ marginBottom: '28px' }}>
                          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>💰 Financial Breakdown</h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Rental yield, ROI potential, and total cost of ownership analysis.</p>
                        </div>
                        <IntelCards result={mlResult} />
                        <div style={{ marginTop: '32px' }}><ConstructionBreakdown result={mlResult} /></div>
                        <div style={{ marginTop: '32px' }}><TCOCalculator result={mlResult} /></div>
                      </div>
                    )}
                    {activeTab === 'market' && (
                      <div className="animate-fade-up">
                        <div style={{ marginBottom: '28px' }}>
                          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>📊 Market Signals</h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Real-time demand metrics and infrastructure scores for this micro-market.</p>
                        </div>
                        <div className="panel glass">
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
                            {[
                              { label: 'Price / Sq Ft',    val: `₹${mlResult.pricePerSqft.toLocaleString()}`,  icon: '💹' },
                              { label: 'Demand Index',      val: `${mlResult.localityDemandIndex}/100`,          icon: '📡' },
                              { label: 'Infrastructure',    val: `${mlResult.infraScore}/100`,                   icon: '🏗️' },
                              { label: 'Age Factor',        val: `${mlResult.ageFactor}%`,                       icon: '📅' },
                              { label: 'Annual Growth',     val: `${mlResult.annualAppreciation}%`,              icon: '📈' },
                              { label: 'Rental Yield',      val: `${mlResult.rentalYield}%`,                     icon: '🔑' },
                            ].map((f, i) => (
                              <div key={i} className="glass" style={{ padding: '16px', borderRadius: '16px' }}>
                                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{f.icon}</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{f.label}</div>
                                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{f.val}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <MonitoringPanel role="buyer" result={mlResult} />
                      </div>
                    )}
                    {activeTab === 'why' && (
                      <div className="animate-fade-up">
                        <div style={{ marginBottom: '28px' }}>
                          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>🧩 Model Explainability</h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>The technical "why" behind this price — every input factor weighted by the ML model.</p>
                        </div>
                        <ExplainabilityPanel featureImportance={mlResult.featureImportance} />
                      </div>
                    )}
                  </div>

                  <ResultCTA onNewAnalysis={handleNewAnalysis} />
                </div>
              </div>
            </section>
          </>
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
