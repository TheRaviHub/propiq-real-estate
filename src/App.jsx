import { useState, useCallback, useEffect } from 'react';
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
import Hero from './components/Hero';
import { runMLEngine, formatINR } from './mlEngine';

// ── Role config (Home Buyer focus) ──────────────────────────────────────────

function getBuyerConfig(result) {
  const { estimatedPrice, priceMin, priceMax, confidenceScore, inputs } = result;
  const brokerPrice = inputs.brokerQuote || estimatedPrice * 1.08;
  const isHighConf = confidenceScore >= 80;
  const isMidConf  = confidenceScore >= 60;
  
  const confColor = isHighConf ? 'var(--clr-aurora-5)' : (isMidConf ? 'var(--clr-aurora-1)' : '#fb7185');
  const verdict = estimatedPrice <= brokerPrice * 1.06
    ? { text: 'Fair Deal',  color: '#34d399', icon: '✅' }
    : { text: 'Overpriced', color: '#fb7185', icon: '⚠️' };

  return {
    accentColor: verdict.color === '#34d399' ? '#6366f1' : '#f43f5e',
    accentGlow: verdict.color === '#34d399' ? 'rgba(99,102,241,0.12)' : 'rgba(244,63,94,0.12)',
    borderColor: verdict.color === '#34d399' ? 'rgba(99,102,241,0.25)' : 'rgba(244,63,94,0.25)',
    reportTitle: 'Intelligence Report',
    reportSubtitle: 'Buyer-focused fair price & negotiation analysis',
    verdict,
    stats: [
      { 
        label: 'ML Fair Value',  
        value: formatINR(estimatedPrice), 
        color: '#38bdf8',
        gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)' 
      },
      { 
        label: 'Confidence',     
        value: `${confidenceScore}%`,     
        color: confColor,
        gradient: isHighConf ? 'linear-gradient(135deg, #10b981, #3b82f6)' : 'linear-gradient(135deg, #fbbf24, #f59e0b)'
      },
      { 
        label: 'Price Range',    
        value: `${formatINR(priceMin)} – ${formatINR(priceMax)}`, 
        color: '#c084fc',
        gradient: 'linear-gradient(135deg, #a855f7, #ec4899)'
      },
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
  const [animationDone,  setAnimationDone]  = useState(false);
  const [activeTab,      setActiveTab]      = useState('report');
  const [showHero,       setShowHero]       = useState(true);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setTimeout(() => {
      document.getElementById('tab-content-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleAnalyze = useCallback(async (inputs) => {
    setLoading(true);
    setMlResult(null);
    setAnimationDone(false);
    try {
      const result = await runMLEngine(inputs);
      setMlResult(result);
    } catch (error) {
      console.error("Analysis failed:", error);
      setLoading(false);
    }
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setAnimationDone(true);
  }, []);

  useEffect(() => {
    if (animationDone && mlResult) {
      setLoading(false);
      setAnimationDone(false);
      setActiveTab('report');
      setTimeout(() => {
        document.getElementById('results-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  }, [animationDone, mlResult]);

  const handleNewAnalysis = () => {
    setMlResult(null);
    setShowHero(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showHero) {
    return <Hero onStart={() => setShowHero(false)} />;
  }

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

        {/* ── Form ── */}
        {!mlResult && !loading && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            width: '100%',
            padding: '0 20px'
          }}>
            <div className="section-label glass-text" style={{ margin: '40px 0 16px', fontSize: '18px', letterSpacing: '2px' }}>
              PROPIQ INTELLIGENCE CORE
            </div>
            <div style={{ width: '100%', maxWidth: '1200px' }}>
              <PropertyForm onAnalyze={handleAnalyze} />
            </div>
          </div>
        )}

        {loading && <LoadingAnalysis onComplete={handleLoadingComplete} />}

        {/* ── Results ── */}
        {mlResult && !loading && roleConfig && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            width: '100%',
            padding: '0 20px'
          }}>
            <div className="section-label glass-text" style={{ margin: '48px 0 20px', fontSize: '18px', letterSpacing: '2px' }}>
              VALUATION INTELLIGENCE REPORT
            </div>
            
            <div style={{ width: '100%', maxWidth: '1200px', marginBottom: '64px' }}>
              <section className="form-card animate-fade-up" id="results-anchor" style={{ margin: 0 }}>
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                      {roleConfig.stats.map((stat, i) => (
                        <div key={i} className="glass" style={{ 
                          padding: '24px', 
                          borderRadius: '24px',
                          border: `1px solid ${stat.color}30`,
                          background: `${stat.color}08`,
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          minHeight: '140px',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          {/* Subtle Inner Glow */}
                          <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                            background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`,
                            opacity: 0.5
                          }} />
                          
                          <div style={{ 
                            fontSize: '12px', 
                            color: 'var(--text-secondary)', 
                            fontWeight: 900, 
                            textTransform: 'uppercase', 
                            letterSpacing: '1.5px', 
                            marginBottom: '12px',
                            opacity: 0.8
                          }}>
                            {stat.label}
                          </div>
                          <div style={{ 
                            fontSize: stat.label === 'Price Range' ? '20px' : '32px', 
                            fontWeight: 900, 
                            color: stat.color, 
                            fontFamily: 'var(--font-display)',
                            lineHeight: 1.2,
                            textShadow: `0 0 20px ${stat.color}40`
                          }}>
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
                  <div className="tabs" style={{ marginBottom: '0' }}>
                    {TABS.map(tab => (
                      <button key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab.id)}
                        style={activeTab === tab.id && tab.id === 'report'
                          ? { color: roleConfig.accentColor, background: `${roleConfig.accentColor}18` } : {}}>
                        {tab.icon} {tab.label}
                      </button>
                    ))}
                  </div>
                  {/* Scroll anchor — sits just above tab content */}
                  <div id="tab-content-anchor" style={{ height: '32px' }} />

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
                        <div style={{ marginBottom: '32px' }}>
                          <h3 className="gradient-text" style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px' }}>📊 Market Signals</h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 500 }}>Real-time demand metrics and infrastructure scores for this micro-market.</p>
                        </div>
                        <div style={{ marginBottom: '32px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                            {[
                              { label: 'Price / Sq Ft',    val: `₹${mlResult.pricePerSqft.toLocaleString()}`,  icon: '💹', color: '#06b6d4' },
                              { label: 'Demand Index',      val: `${mlResult.localityDemandIndex}/100`,          icon: '📡', color: '#6366f1' },
                              { label: 'Infrastructure',    val: `${mlResult.infraScore}/100`,                   icon: '🏗️', color: '#f59e0b' },
                              { label: 'Age Factor',        val: `${mlResult.ageFactor}%`,                       icon: '📅', color: '#ec4899' },
                              { label: 'Annual Growth',     val: `${mlResult.annualAppreciation}%`,              icon: '📈', color: '#10b981' },
                              { label: 'Rental Yield',      val: `${mlResult.rentalYield}%`,                     icon: '🔑', color: '#f97316' },
                            ].map((f, i) => (
                              <div key={i} className="aurora-card" style={{ padding: '24px' }}>
                                <div className="aurora-blob" style={{ background: f.color, top: '-30%', right: '-30%', opacity: 0.12 }} />
                                <div style={{ 
                                  width: '42px', height: '42px', borderRadius: '12px', background: `${f.color}18`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '22px', marginBottom: '16px', border: `1px solid ${f.color}33`,
                                  position: 'relative', zIndex: 1
                                }}>{f.icon}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1.2px', marginBottom: '6px', position: 'relative', zIndex: 1 }}>{f.label}</div>
                                <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)', position: 'relative', zIndex: 1 }}>{f.val}</div>
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
          </div>
        </div>
      )}

        {/* Footer — inside app-container */}
        {/* Premium Footer */}
        <footer style={{
          padding: '80px 5% 40px 5%',
          background: 'rgba(3, 3, 5, 0.6)',
          backdropFilter: 'blur(30px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            marginBottom: '60px',
            textAlign: 'left'
          }}>
            <div>
              <div className="logo" style={{ marginBottom: '20px' }}>Prop<span>IQ</span></div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, maxWidth: '240px' }}>
                Advanced ML valuation engine for Indian Real Estate. Empowering buyers with data-backed intelligence.
              </p>
            </div>
            <div>
              <h4 style={{ color: '#fff', marginBottom: '20px', fontSize: '16px', fontWeight: 700 }}>Platform</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.3s' }}>Features</a></li>
                <li><a href="#accuracy" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.3s' }}>Accuracy</a></li>
                <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.3s' }}>How it Works</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#fff', marginBottom: '20px', fontSize: '16px', fontWeight: 700 }}>Market Reports</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.3s' }}>Mumbai Intelligence</a></li>
                <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.3s' }}>Bangalore Trends</a></li>
                <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.3s' }}>Pune Growth</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#fff', marginBottom: '20px', fontSize: '16px', fontWeight: 700 }}>Legal</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.3s' }}>Privacy Policy</a></li>
                <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.3s' }}>Terms of Service</a></li>
                <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.3s' }}>Data Sources</a></li>
              </ul>
            </div>
          </div>
          
          <div style={{
            paddingTop: '40px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              PropIQ · Neural Valuation Core v2.4.1 · © 2026 DeepMind Real Estate Solutions
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              {/* X (Twitter) */}
              <a href="#" aria-label="X / Twitter" style={{ color: 'var(--text-muted)', transition: 'color 0.3s' }}
                onMouseOver={e => e.currentTarget.style.color = '#fff'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L2.18 2.25h6.97l4.255 5.623L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" aria-label="LinkedIn" style={{ color: 'var(--text-muted)', transition: 'color 0.3s' }}
                onMouseOver={e => e.currentTarget.style.color = '#0a66c2'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" aria-label="Instagram" style={{ color: 'var(--text-muted)', transition: 'color 0.3s' }}
                onMouseOver={e => e.currentTarget.style.color = '#e1306c'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
