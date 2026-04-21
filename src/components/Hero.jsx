import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, BarChart3, ShieldCheck, Zap, Target, Globe, Cpu, TrendingUp, Home, Brain } from 'lucide-react';

// Animated counter hook
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// Floating glass particle
function GlassParticle({ style }) {
  return (
    <div style={{
      position: 'absolute',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(4px)',
      ...style,
    }} />
  );
}

// Live analysis card that cycles through properties
const LIVE_PROPERTIES = [
  { city: 'Mumbai', area: 'Bandra West', price: '₹2.4 Cr', conf: 94, type: 'Apartment' },
  { city: 'Bengaluru', area: 'Whitefield', price: '₹1.1 Cr', conf: 91, type: 'Villa' },
  { city: 'Hyderabad', area: 'Gachibowli', price: '₹78L', conf: 88, type: 'Apartment' },
  { city: 'Delhi', area: 'Dwarka Sec 12', price: '₹1.6 Cr', conf: 93, type: 'Builder Floor' },
  { city: 'Pune', area: 'Hinjewadi', price: '₹92L', conf: 90, type: 'Apartment' },
];

function LiveAnalysisCard() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % LIVE_PROPERTIES.length);
        setVisible(true);
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const p = LIVE_PROPERTIES[idx];
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '20px',
      padding: '20px 24px',
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(8px)',
      transition: 'all 0.4s ease',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
      minWidth: '280px',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '12px',
        background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px', flexShrink: 0,
        boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
      }}>🏠</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '2px' }}>
          Live · {p.type}
        </div>
        <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {p.area}, {p.city}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '18px', fontWeight: 900, color: '#60a5fa' }}>{p.price}</span>
          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(16,185,129,0.15)', color: '#34d399', fontWeight: 700, border: '1px solid rgba(16,185,129,0.3)' }}>
            {p.conf}% Conf.
          </span>
        </div>
      </div>
      <div style={{
        width: 8, height: 8, borderRadius: '50%', background: '#34d399',
        animation: 'pulse-dot 1.5s ease-in-out infinite',
        boxShadow: '0 0 8px #34d399', flexShrink: 0,
      }} />
    </div>
  );
}

const Hero = ({ onStart }) => {
  const [started, setStarted] = useState(false);
  const heroRef = useRef(null);

  const val1 = useCounter(98, 1800, started);
  const val2 = useCounter(25000, 2200, started);
  const val3 = useCounter(12, 1500, started);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.2 });
    if (heroRef.current) obs.observe(heroRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="hero-page-wrapper" ref={heroRef}>

      {/* ── HERO ── */}
      <div className="hero-container animate-fade-in">

        {/* Animated aurora orbs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '60%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(181,26,43,0.22) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'drift1 12s ease-in-out infinite alternate' }} />
          <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,165,134,0.15) 0%, transparent 70%)', filter: 'blur(100px)', animation: 'drift2 16s ease-in-out infinite alternate' }} />
          <div style={{ position: 'absolute', top: '40%', left: '40%', width: '30%', height: '30%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(132,26,37,0.15) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'drift1 10s ease-in-out infinite alternate-reverse' }} />
          {/* Glass particles */}
          <GlassParticle style={{ width: 120, height: 120, top: '15%', right: '18%', animation: 'float-asset 8s ease-in-out infinite' }} />
          <GlassParticle style={{ width: 60, height: 60, top: '60%', left: '8%', animation: 'float-asset 6s ease-in-out infinite 1s' }} />
          <GlassParticle style={{ width: 80, height: 80, bottom: '20%', right: '30%', animation: 'float-asset 10s ease-in-out infinite 2s' }} />
          <GlassParticle style={{ width: 40, height: 40, top: '30%', left: '20%', animation: 'float-asset 7s ease-in-out infinite 0.5s' }} />
        </div>

        {/* Nav */}
        <nav className="hero-nav" style={{ position: 'relative', zIndex: 10 }}>
          <div className="logo">Prop<span>IQ</span></div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">Process</a>
            <button 
              className="nav-link-btn" 
              onClick={() => document.getElementById('accuracy')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600, cursor: 'pointer', fontSize: '16px' }}
            >
              Accuracy
            </button>
          </div>
          <button className="btn-glass-nav" onClick={onStart}>
            Analyze Now
          </button>
        </nav>

        {/* Hero content */}
        <div className="hero-content" style={{ position: 'relative', zIndex: 5, textAlign: 'center', gridTemplateColumns: '1fr' }}>
          <div className="hero-text" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="badge-new">
              <span className="pulse"></span>
              PropIQ v2.0 · Aurora Intelligence
            </div>
            <h1>
              Predict Property Value<br />
              with <span>AI Precision</span>
            </h1>
            <p className="glass-text" style={{ maxWidth: '620px', margin: '0 auto 40px auto' }}>
              The most advanced ML engine for Indian real estate. Get instant, transparent 
              property valuations powered by 25+ market signals and RERA-verified data.
            </p>

            <div className="hero-cta" style={{ justifyContent: 'center', marginBottom: '60px' }}>
              <button className="btn-primary-hero" onClick={onStart}>
                Get Started <ArrowRight size={20} />
              </button>
              <button className="btn-secondary-hero" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                See How It Works
              </button>
            </div>

            {/* Animated stats */}
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-icon"><ShieldCheck size={20} /></div>
                <div className="stat-info">
                  <span className="stat-value">{started ? val1 : 0}%</span>
                  <span className="stat-label">Accuracy Rate</span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon"><TrendingUp size={20} /></div>
                <div className="stat-info">
                  <span className="stat-value">{started ? val2.toLocaleString() : '0'}+</span>
                  <span className="stat-label">Properties Analysed</span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon"><Zap size={20} /></div>
                <div className="stat-info">
                  <span className="stat-value">{started ? val3 : 0}s</span>
                  <span className="stat-label">Avg Analysis Time</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side — glass cards */}
          <div className="hero-visual">
            <div className="visual-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'stretch' }}>

              {/* Live analysis card */}
              <LiveAnalysisCard />

              {/* Glass info cards row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { icon: '🏗️', label: 'Infra Score', val: '87/100', color: '#f59e0b' },
                  { icon: '📈', label: 'Appreciation', val: '+11.4%', color: '#10b981' },
                  { icon: '💹', label: 'Rental Yield', val: '3.8% PA', color: '#6366f1' },
                  { icon: '📡', label: 'Demand Index', val: 'Very High', color: '#ec4899' },
                ].map((card, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
                    animation: `float-asset ${6 + i}s ease-in-out infinite ${i * 0.5}s`,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.3), 0 0 20px ${card.color}20, inset 0 1px 0 rgba(255,255,255,0.12)`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)'; }}
                  >
                    <div style={{ fontSize: '20px', marginBottom: '8px' }}>{card.icon}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700, marginBottom: '4px' }}>{card.label}</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: card.color, textShadow: `0 0 12px ${card.color}60` }}>{card.val}</div>
                  </div>
                ))}
              </div>

              {/* AI confidence bar */}
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '18px 20px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>🧠 ML Confidence Score</span>
                  <span style={{ fontSize: '14px', fontWeight: 900, color: '#34d399' }}>94%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: '94%', borderRadius: '99px',
                    background: 'linear-gradient(90deg, #10b981, #3b82f6, #6366f1)',
                    boxShadow: '0 0 10px rgba(16,185,129,0.5)',
                    animation: 'shimmer 3s ease-in-out infinite',
                  }} />
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {['RERA Data', 'CPWD Rates', 'Locality AI', 'Age Model'].map(t => (
                    <span key={t} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc', fontWeight: 700 }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-footer">
          <div className="scroll-indicator" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
            <div className="mouse"><div className="wheel"></div></div>
            <span>Explore PropIQ</span>
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="hero-section features-section">
        <div className="section-header">
          <h2 className="gradient-text">Engineered for Accuracy</h2>
          <p>The most advanced real estate intelligence toolkit ever built for India.</p>
        </div>
        <div className="features-grid">
          {[
            { icon: <Target size={32} />, title: 'Micro-Market Precision', desc: 'We analyze data down to the street level, capturing nuances that generic models miss completely.', color: '#6366f1' },
            { icon: <Brain size={32} />, title: 'ML Brain Architecture', desc: 'Our Neural network processes 25+ parameters including infra-growth, age-factors and locality demand.', color: '#3b82f6' },
            { icon: <Globe size={32} />, title: 'RERA Verified Data', desc: 'All valuations are cross-referenced with government RERA filings and CPWD construction rates.', color: '#10b981' },
            { icon: <TrendingUp size={32} />, title: 'Appreciation Forecast', desc: 'Get a 3-year projection of your property value based on infrastructure growth signals.', color: '#f59e0b' },
            { icon: <ShieldCheck size={32} />, title: 'Negotiation Shield', desc: 'Compare the broker quote vs ML fair value to know if you\'re overpaying — in seconds.', color: '#ec4899' },
            { icon: <Zap size={32} />, title: 'Instant Analysis', desc: 'Get a comprehensive intelligence report with ROI, TCO, and market signals in under 15 seconds.', color: '#a855f7' },
          ].map((f, i) => (
            <div key={i} className="feature-card" style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
              border: `1px solid rgba(255,255,255,0.08)`,
              borderRadius: '24px',
              padding: '32px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.4s ease',
              boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.border = `1px solid ${f.color}40`;
                e.currentTarget.style.boxShadow = `0 20px 50px rgba(0,0,0,0.3), 0 0 30px ${f.color}15, inset 0 1px 0 rgba(255,255,255,0.1)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)';
              }}
            >
              {/* Glow spot */}
              <div style={{ position: 'absolute', top: '-40%', right: '-20%', width: '200px', height: '200px', borderRadius: '50%', background: `radial-gradient(circle, ${f.color}18 0%, transparent 70%)`, pointerEvents: 'none' }} />
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${f.color}15`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: '20px', position: 'relative', zIndex: 1 }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '10px', position: 'relative', zIndex: 1 }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, position: 'relative', zIndex: 1, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ACCURACY STATS ── */}
      <section id="accuracy" className="hero-section" style={{ paddingTop: '60px', paddingBottom: '100px' }}>
        <div className="section-header" style={{ marginBottom: '60px' }}>
          <h2 className="gradient-text">Trusted Numbers</h2>
          <p>Real performance metrics from our ML valuation engine.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
          {[
            { val: '98.4%', label: 'Valuation Accuracy', icon: '🎯', color: '#10b981', desc: 'vs. actual sale prices' },
            { val: '25K+',  label: 'Properties Analysed', icon: '🏠', color: '#3b82f6', desc: 'across 80+ Indian cities' },
            { val: '500+',  label: 'Localities Mapped',   icon: '📍', color: '#6366f1', desc: 'with micro-market data' },
            { val: '25+',   label: 'ML Parameters',       icon: '🧠', color: '#a855f7', desc: 'per valuation model' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(24px)',
              border: `1px solid ${s.color}25`,
              borderRadius: '24px',
              padding: '36px 28px',
              textAlign: 'center',
              boxShadow: `0 4px 30px rgba(0,0,0,0.2), 0 0 40px ${s.color}08, inset 0 1px 0 rgba(255,255,255,0.07)`,
              transition: 'all 0.35s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 20px 50px rgba(0,0,0,0.3), 0 0 40px ${s.color}20`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 4px 30px rgba(0,0,0,0.2), 0 0 40px ${s.color}08, inset 0 1px 0 rgba(255,255,255,0.07)`; }}
            >
              <div style={{ position: 'absolute', top: '-40%', right: '-20%', width: '180px', height: '180px', borderRadius: '50%', background: `radial-gradient(circle, ${s.color}15 0%, transparent 70%)`, pointerEvents: 'none' }} />
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>{s.icon}</div>
              <div style={{ fontSize: '42px', fontWeight: 900, background: `linear-gradient(135deg, #fff, ${s.color})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '8px', letterSpacing: '-1px' }}>{s.val}</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="hero-section process-section">
        <div className="section-header">
          <h2 className="gradient-text">How it Works</h2>
          <p>From data entry to deep intelligence in 3 simple steps.</p>
        </div>
        <div className="process-steps">
          {[
            { num: '01', title: 'Enter Details', desc: 'Provide property specifics — location, area, type and configuration.', icon: '📍', color: '#3b82f6' },
            { num: '02', title: 'ML Processing', desc: 'Our engine compares your data against 25,000+ historical transactions.', icon: '🧠', color: '#6366f1' },
            { num: '03', title: 'Get Insights', desc: 'Receive a comprehensive report with fair value, TCO, and ROI analysis.', icon: '📊', color: '#10b981' },
          ].map((step, i) => (
            <React.Fragment key={i}>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${step.color}25`,
                borderRadius: '24px',
                padding: '36px 28px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: `0 4px 24px rgba(0,0,0,0.2), 0 0 40px ${step.color}08, inset 0 1px 0 rgba(255,255,255,0.06)`,
                transition: 'all 0.4s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 20px 50px rgba(0,0,0,0.3), 0 0 40px ${step.color}20, inset 0 1px 0 rgba(255,255,255,0.1)`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,0.2), 0 0 40px ${step.color}08, inset 0 1px 0 rgba(255,255,255,0.06)`; }}
              >
                <div style={{ position: 'absolute', top: '-30%', left: '-20%', width: '200px', height: '200px', borderRadius: '50%', background: `radial-gradient(circle, ${step.color}12 0%, transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{step.icon}</div>
                <div style={{ fontSize: '11px', color: step.color, fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Step {step.num}</div>
                <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>{step.title}</h4>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
              </div>
              {i < 2 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '24px' }}>→</div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="process-cta">
          <button className="btn-primary-hero big" onClick={onStart}>
            Start Your Free Analysis <ArrowRight size={24} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="logo">Prop<span>IQ</span></div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>© 2026 PropIQ Intelligence Systems. Built for Indian Home Buyers.</p>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Hero;
