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
import AgentDashboard from './components/AgentDashboard';
import BankDashboard from './components/BankDashboard';
import InvestorDashboard from './components/InvestorDashboard';
import MonitoringPanel from './components/MonitoringPanel';
import { runMLEngine, formatINR } from './mlEngine';

// ── Role configs (buyer is primary, others are power-user views) ──────────────
const ROLES = [
  { id: 'buyer',    icon: '🏡', name: 'Home Buyer',          desc: 'Fair price, negotiation & market signals' },
  { id: 'agent',    icon: '🤝', name: 'Real Estate Agent',   desc: 'Listing strategy & days-on-market' },
  { id: 'bank',     icon: '🏦', name: 'Bank / Loan Officer', desc: 'Fraud detection, LTV & risk analysis' },
  { id: 'investor', icon: '📈', name: 'Property Investor',   desc: 'ROI, rental yield & capital growth' },
];

function getRoleConfig(role, result) {
  const { estimatedPrice, priceMin, priceMax, confidenceScore, demandScore,
          liquidityDays, riskScore, projectedROI5Y, rentalYield, monthlyRent, inputs } = result;
  const brokerPrice = inputs.brokerQuote || estimatedPrice * 1.08;
  const overvalPct  = Math.round(((brokerPrice - estimatedPrice) / estimatedPrice) * 100);
  const ltv75       = Math.round(estimatedPrice * 0.75);

  const configs = {
    buyer: {
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
    },
    agent: {
      accentColor: '#8b5cf6', accentGlow: 'rgba(139,92,246,0.18)', borderColor: 'rgba(139,92,246,0.35)',
      reportTitle: '🤝 Agent Strategy Report',
      reportSubtitle: 'Listing price · Days-on-market prediction · Buyer demand',
      verdict: { text: demandScore > 70 ? 'Hot Market' : demandScore > 45 ? 'Active Market' : 'Slow Market',
                 color: demandScore > 70 ? '#34d399' : demandScore > 45 ? '#fbbf24' : '#fb7185',
                 icon: demandScore > 70 ? '🔥' : '📊' },
      stats: [
        { label: 'Suggested Listing', value: formatINR(Math.round(estimatedPrice * 1.03)), color: '#a78bfa' },
        { label: 'Days on Market',    value: `~${liquidityDays} days`,   color: '#60a5fa' },
        { label: 'Demand Score',      value: `${demandScore}/100`,       color: '#34d399' },
        { label: 'Comparable Sales',  value: `${result.comparableDensity}`, color: '#fbbf24' },
      ],
    },
    bank: {
      accentColor: '#14b8a6', accentGlow: 'rgba(20,184,166,0.18)', borderColor: 'rgba(20,184,166,0.35)',
      reportTitle: '🏦 Loan Risk Assessment',
      reportSubtitle: 'Fraud detection · LTV analysis · Collateral health · Approval recommendation',
      verdict: riskScore < 30
        ? { text: 'LOW RISK — Approved',    color: '#34d399', icon: '✅' }
        : riskScore < 55
        ? { text: 'MODERATE — Conditional', color: '#fbbf24', icon: '⚠️' }
        : { text: 'HIGH RISK — Decline',    color: '#fb7185', icon: '❌' },
      stats: [
        { label: 'ML Property Value',  value: formatINR(estimatedPrice), color: '#2dd4bf' },
        { label: 'Safe Loan (LTV 75%)',value: formatINR(ltv75),          color: '#34d399' },
        { label: 'Overvaluation Gap',  value: `${overvalPct > 0 ? '+' : ''}${overvalPct}%`, color: overvalPct > 15 ? '#fb7185' : '#34d399' },
        { label: 'Risk Score',         value: `${riskScore}/100`, color: riskScore < 30 ? '#34d399' : riskScore < 55 ? '#fbbf24' : '#fb7185' },
      ],
    },
    investor: {
      accentColor: '#f59e0b', accentGlow: 'rgba(245,158,11,0.18)', borderColor: 'rgba(245,158,11,0.35)',
      reportTitle: '📈 Investment Analytics',
      reportSubtitle: 'ROI projection · Rental yield · Capital appreciation · Benchmark comparison',
      verdict: projectedROI5Y > 60
        ? { text: 'High Return Asset', color: '#34d399', icon: '🚀' }
        : projectedROI5Y > 35
        ? { text: 'Moderate Return',   color: '#fbbf24', icon: '📊' }
        : { text: 'Low Return Asset',  color: '#fb7185', icon: '⚠️' },
      stats: [
        { label: '5-Year ROI',          value: `+${projectedROI5Y}%`,              color: '#fbbf24' },
        { label: 'Annual Appreciation', value: `${result.annualAppreciation}%/yr`, color: '#34d399' },
        { label: 'Rental Yield',        value: `${rentalYield}%`,                  color: '#60a5fa' },
        { label: 'Monthly Rent Est.',   value: formatINR(monthlyRent),             color: '#a78bfa' },
      ],
    },
  };
  return configs[role];
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
  const [selectedRole,   setSelectedRole]   = useState('buyer');
  const [mlResult,       setMlResult]       = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [activeTab,      setActiveTab]      = useState('report');
  const [showRoleSwitch, setShowRoleSwitch] = useState(false);

  const handleAnalyze = useCallback((inputs) => {
    setLoading(true);
    setMlResult(null);
    setTimeout(() => { window.__pendingResult = runMLEngine(inputs); }, 50);
  }, []);

  const handleLoadingComplete = useCallback(() => {
    const result = window.__pendingResult;
    if (result) {
      setMlResult(result);
      setLoading(false);
      setActiveTab('report');
      setTimeout(() => {
        document.getElementById('results-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, []);

  const handleNewAnalysis = () => {
    setMlResult(null);
    setShowRoleSwitch(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const roleConfig = mlResult ? getRoleConfig(selectedRole, mlResult) : null;

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

                {/* Discreet role switcher for power users */}
                <div style={{ marginLeft: 'auto', position: 'relative', zIndex: 999 }}>
                  <button id="switch-role-btn"
                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '12px', padding: '4px 10px', cursor: 'pointer' }}
                    onClick={() => setShowRoleSwitch(v => !v)}>
                    Switch view ▾
                  </button>
                  {showRoleSwitch && (
                    <div style={{
                      position: 'absolute', right: 0, top: '32px', zIndex: 50,
                      background: 'var(--clr-surface)', border: '1px solid var(--clr-border)',
                      borderRadius: '12px', padding: '8px', minWidth: '200px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    }}>
                      {ROLES.map(r => (
                        <button key={r.id} id={`role-switch-${r.id}`}
                          style={{
                            display: 'flex', gap: '10px', alignItems: 'center', width: '100%',
                            padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left',
                            background: selectedRole === r.id ? 'rgba(59,130,246,0.12)' : 'transparent',
                            color: selectedRole === r.id ? '#60a5fa' : 'var(--text-secondary)',
                            fontSize: '13px', fontWeight: selectedRole === r.id ? 600 : 400,
                          }}
                          onClick={() => { setSelectedRole(r.id); setShowRoleSwitch(false); setActiveTab('report'); }}>
                          <span>{r.icon}</span>
                          <span>{r.name}</span>
                          {selectedRole === r.id && <span style={{ marginLeft: 'auto', fontSize: '10px' }}>✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
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

            {/* 📋 My Report — role dashboard */}
            {activeTab === 'report' && (
              <div key={selectedRole}>
                {selectedRole === 'buyer'    && <BuyerDashboard    result={mlResult} />}
                {selectedRole === 'agent'    && <AgentDashboard    result={mlResult} />}
                {selectedRole === 'bank'     && <BankDashboard     result={mlResult} />}
                {selectedRole === 'investor' && <InvestorDashboard result={mlResult} />}
              </div>
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
                <MonitoringPanel role={selectedRole} result={mlResult} />
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
