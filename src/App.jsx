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
  
  const verdict = estimatedPrice <= brokerPrice * 1.06
    ? { text: 'Fair Deal',  color: 'var(--clr-moss-500)', icon: '✓' }
    : { text: 'Overpriced', color: '#d9534f', icon: '⚠' };

  return {
    accentColor: verdict.text === 'Fair Deal' ? 'var(--clr-moss-500)' : '#d9534f',
    reportTitle: 'Intelligence Report',
    reportSubtitle: 'Buyer-focused fair price & negotiation analysis',
    verdict,
    stats: [
      { 
        label: 'ML Fair Value',  
        value: formatINR(estimatedPrice), 
        color: 'var(--clr-text-main)'
      },
      { 
        label: 'Confidence',     
        value: `${confidenceScore}%`,     
        color: 'var(--clr-moss-500)'
      },
      { 
        label: 'Price Range',    
        value: `${formatINR(priceMin)} – ${formatINR(priceMax)}`, 
        color: 'var(--clr-text-main)'
      },
    ],
  };
}

function PropertyPill({ result }) {
  const { inputs } = result;
  const typeLabel = inputs.propertyType || 'Property';
  const parts = [
    inputs.bhk ? `${inputs.bhk} BHK` : null,
    typeLabel,
    inputs.area ? `${Number(inputs.area).toLocaleString()} sqft` : null,
    inputs.locality && inputs.city ? `${inputs.locality}, ${inputs.city}` : null,
  ].filter(Boolean);

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
      padding: '12px 24px', borderRadius: '8px',
      background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)',
      fontSize: '11px', color: 'var(--clr-text-main)', fontWeight: 800, marginBottom: '32px',
      textTransform: 'uppercase', letterSpacing: '1px'
    }}>
      🏢 {parts.map((p, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {i > 0 && <span style={{ opacity: 0.1 }}>|</span>}
          {p}
        </span>
      ))}
    </div>
  );
}

function ResultCTA({ onNewAnalysis }) {
  return (
    <div style={{
      display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center',
      padding: '60px', borderRadius: '12px', marginTop: '100px',
      background: '#fff', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--clr-text-main)',
    }}>
      <div style={{ flex: 1, minWidth: '280px' }}>
        <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
          Finalize & Export Analysis
        </div>
        <div style={{ fontSize: '16px', color: 'var(--clr-text-muted)', fontWeight: 500 }}>
          Secure this valuation in a portable PDF or start a fresh benchmark for a new property.
        </div>
      </div>
      <div style={{ display: 'flex', gap: '16px' }}>
        <button onClick={() => window.print()} className="btn-auth" style={{ background: 'transparent', border: '2px solid var(--clr-text-main)', color: 'var(--clr-text-main)' }}>Print PDF</button>
        <button onClick={onNewAnalysis} className="btn-auth">New Analysis</button>
      </div>
    </div>
  );
}

function ResultBadge({ label }) {
  return (
    <div className="badge-mini" style={{ background: 'rgba(45, 90, 39, 0.1)', color: 'var(--clr-moss-500)' }}>
      {label}
    </div>
  );
}

export default function App() {
  const [showHero, setShowHero] = useState(true);
  const [loading, setLoading] = useState(false);
  const [mlResult, setMlResult] = useState(null);
  const [activeTab, setActiveTab] = useState('report');
  const [animationDone, setAnimationDone] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
    return (
      <div style={{ cursor: 'none' }}>
        <div className="custom-cursor" style={{ transform: `translate(${mousePos.x - 10}px, ${mousePos.y - 10}px)` }} />
        <div className="custom-cursor-follower" style={{ transform: `translate(${mousePos.x - 20}px, ${mousePos.y - 20}px)` }} />
        <Hero onStart={() => setShowHero(false)} />
      </div>
    );
  }

  const roleConfig = mlResult ? getBuyerConfig(mlResult) : null;

  const TABS = [
    { id: 'report',  label: 'EXECUTIVE SUMMARY' },
    { id: 'finance', label: 'FINANCIAL ANALYSIS' },
    { id: 'market',  label: 'MARKET DYNAMICS' },
    { id: 'why',     label: 'MODEL EXPLAINABILITY' },
  ];

  return (
    <div className="app-container" style={{ background: 'var(--clr-bg-page)', minHeight: '100vh', color: 'var(--clr-text-main)', cursor: 'none' }}>
      <div className="custom-cursor" style={{ transform: `translate(${mousePos.x - 10}px, ${mousePos.y - 10}px)` }} />
      <div className="custom-cursor-follower" style={{ transform: `translate(${mousePos.x - 20}px, ${mousePos.y - 20}px)` }} />
      
      <Navbar onAction={() => setShowHero(true)} />

      {!mlResult && !loading && (
        <div className="animate-fade-up" style={{ padding: '80px 0' }}>
          <PropertyForm onAnalyze={handleAnalyze} />
        </div>
      )}

      {loading && (
        <LoadingAnalysis onComplete={handleLoadingComplete} />
      )}

      {mlResult && !loading && roleConfig && (
        <section style={{ padding: '100px 5%', position: 'relative', zIndex: 5 }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div id="results-anchor" style={{ 
              background: '#fff', 
              borderRadius: '24px',
              border: '1px solid rgba(0,0,0,0.05)',
              padding: '80px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.02)'
            }}>
              
              <ResultBadge label="VALUATION COMPLETE" />
              
              <h3 style={{ fontSize: '64px', fontWeight: 800, color: 'var(--clr-text-main)', marginBottom: '48px', lineHeight: 1 }}>
                Intelligence <span style={{ color: 'var(--clr-moss-500)' }}>Report.</span>
              </h3>

              <div style={{ 
                padding: '48px', borderRadius: '12px', background: 'var(--clr-bg-page)', 
                border: '1px solid rgba(0,0,0,0.03)', marginBottom: '60px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '32px', marginBottom: '40px' }}>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>{roleConfig.reportTitle}</h2>
                    <p style={{ color: 'var(--clr-text-muted)', fontSize: '16px', fontWeight: 500 }}>{roleConfig.reportSubtitle}</p>
                  </div>
                  <div style={{ 
                    padding: '12px 24px', borderRadius: '4px', background: roleConfig.accentColor, 
                    color: '#fff', fontWeight: 800, fontSize: '13px'
                  }}>
                    {roleConfig.verdict.icon} {roleConfig.verdict.text.toUpperCase()}
                  </div>
                </div>

                <PropertyPill result={mlResult} />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                  {roleConfig.stats.map((stat, i) => (
                    <div key={i} style={{ 
                      padding: '32px', borderRadius: '12px', background: '#fff',
                      border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--clr-text-muted)', letterSpacing: '1px', marginBottom: '12px' }}>{stat.label.toUpperCase()}</div>
                      <div style={{ fontSize: stat.label === 'Price Range' ? '20px' : '32px', fontWeight: 800, color: 'var(--clr-text-main)' }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '40px', borderBottom: '1px solid rgba(0,0,0,0.05)', marginBottom: '60px' }}>
                {TABS.map(tab => (
                  <button key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '20px 0', border: 'none', background: 'transparent', cursor: 'pointer',
                      fontSize: '12px', fontWeight: 800, letterSpacing: '1px',
                      color: activeTab === tab.id ? 'var(--clr-text-main)' : 'var(--clr-text-muted)',
                      borderBottom: activeTab === tab.id ? '3px solid var(--clr-moss-500)' : '3px solid transparent',
                      transition: 'all 0.3s ease'
                    }}>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="animate-fade-up">
                {activeTab === 'report' && <BuyerDashboard result={mlResult} />}
                {activeTab === 'finance' && (
                  <div>
                    <IntelCards result={mlResult} />
                    <div style={{ marginTop: '32px' }}><ConstructionBreakdown result={mlResult} /></div>
                    <div style={{ marginTop: '32px' }}><TCOCalculator result={mlResult} /></div>
                  </div>
                )}
                {activeTab === 'market' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '60px' }}>
                      {[
                        { label: 'Price / Sq Ft',    val: `₹${mlResult.pricePerSqft.toLocaleString()}` },
                        { label: 'Demand Index',      val: `${mlResult.localityDemandIndex}/100` },
                        { label: 'Infrastructure',    val: `${mlResult.infraScore}/100` },
                        { label: 'Annual Growth',     val: `${mlResult.annualAppreciation}%` },
                      ].map((f, i) => (
                        <div key={i} style={{ padding: '32px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', background: '#fff' }}>
                          <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--clr-text-muted)', letterSpacing: '1px', marginBottom: '8px' }}>{f.label.toUpperCase()}</div>
                          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--clr-text-main)' }}>{f.val}</div>
                        </div>
                      ))}
                    </div>
                    <MonitoringPanel role="buyer" result={mlResult} />
                  </div>
                )}
                {activeTab === 'why' && <ExplainabilityPanel featureImportance={mlResult.featureImportance} />}
              </div>

              <ResultCTA onNewAnalysis={handleNewAnalysis} />
            </div>
          </div>
        </section>
      )}

      <footer style={{ padding: '120px 5%', background: '#fff', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--clr-text-main)', marginBottom: '32px' }}>PropIQ</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', fontSize: '13px', fontWeight: 600, color: 'var(--clr-text-muted)', marginBottom: '40px' }}>
            <span>Privacy</span> <span>Terms</span> <span>Research</span> <span>API</span>
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--clr-text-muted)', opacity: 0.5 }}>© 2026 PROPIQ INTELLIGENCE · PRODUCTION V3.1</div>
        </div>
      </footer>
    </div>
  );
}
