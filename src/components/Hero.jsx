import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Shield, Globe, Database, Zap, Cpu, Mail, Github, TrendingUp, Search, BarChart, MapPin, Plus, Layers, Network, Terminal, Settings, CheckCircle, Linkedin } from 'lucide-react';

const ServicePill = ({ icon: Icon, label, delay }) => (
  <div className="service-pill" style={{ 
    animation: `riseUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards`,
    animationDelay: `${delay}s`,
    opacity: 0,
    transform: 'translateY(30px)'
  }}>
    <Icon size={16} color="var(--clr-moss-500)" />
    <span>{label}</span>
  </div>
);

const SignalSphere = ({ scrollY }) => (
  <div style={{ 
    position: 'absolute', 
    top: '150px', 
    left: '50%', 
    transform: `translateX(-50%) translateY(${scrollY * 0.2}px)`, 
    zIndex: 2,
    opacity: 0.15,
    pointerEvents: 'none'
  }}>
    <div style={{
      width: '600px', height: '600px', borderRadius: '50%',
      background: 'radial-gradient(circle at center, rgba(0, 255, 0, 0.15) 0%, transparent 70%)',
      display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridTemplateRows: 'repeat(12, 1fr)',
      padding: '40px', gap: '12px'
    }}>
      {Array.from({ length: 144 }).map((_, i) => (
        <div key={i} style={{ 
          width: '4px', height: '4px', borderRadius: '50%', 
          background: i % 7 === 0 ? 'var(--clr-moss-500)' : '#ddd',
          boxShadow: i % 7 === 0 ? '0 0 10px var(--clr-moss-500)' : 'none'
        }} />
      ))}
    </div>
  </div>
);

const CityCard = ({ name, desc, isMore, onClick }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{ 
        padding: '48px', 
        borderRadius: '24px', 
        background: hovered ? 'linear-gradient(135deg, #f9fbf8 0%, #e8f0e6 100%)' : '#fff',
        border: hovered ? '2px solid var(--clr-moss-500)' : '1px solid rgba(0,0,0,0.06)',
        textAlign: 'left',
        transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: hovered ? '0 20px 40px rgba(45, 90, 39, 0.1)' : 'none',
        transform: hovered ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isMore ? 'center' : 'flex-start',
        alignItems: isMore ? 'center' : 'flex-start'
      }}
    >
      <div style={{ 
        width: '40px', 
        height: '40px', 
        borderRadius: '10px', 
        background: hovered ? 'var(--clr-moss-500)' : 'rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: isMore ? '16px' : '24px',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)'
      }}>
        {isMore ? <Plus size={20} color={hovered ? '#fff' : 'var(--clr-moss-500)'} /> : <MapPin size={20} color={hovered ? '#fff' : 'var(--clr-moss-500)'} />}
      </div>
      
      <h3 style={{ 
        fontSize: isMore ? '22px' : '26px', 
        fontWeight: 900, 
        marginBottom: isMore ? '0' : '12px',
        color: hovered ? 'var(--clr-moss-500)' : '#000',
        transition: 'all 0.3s ease',
        textAlign: isMore ? 'center' : 'left',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)'
      }}>
        {name}
      </h3>
      
      {!isMore && (
        <p style={{ 
          fontSize: '15px', 
          color: 'rgba(0,0,0,0.5)', 
          fontWeight: 600,
          lineHeight: 1.4
        }}>
          {desc}
        </p>
      )}

      {/* Subtle Glow Effect */}
      {hovered && (
        <div style={{
          position: 'absolute',
          bottom: '-20px',
          right: '-20px',
          width: '100px',
          height: '100px',
          background: 'var(--clr-moss-500)',
          filter: 'blur(40px)',
          opacity: 0.15,
          zIndex: -1
        }} />
      )}
    </div>
  );
};

const IntelCard = ({ icon: Icon, title, desc, delay }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ 
        textAlign: 'left', 
        padding: '40px', 
        background: hovered ? 'linear-gradient(135deg, #f9fbf8 0%, #e8f0e6 100%)' : '#fff', 
        borderRadius: '24px', 
        border: hovered ? '2px solid var(--clr-moss-500)' : '1px solid rgba(0,0,0,0.05)',
        transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
        transform: hovered ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hovered ? '0 20px 40px rgba(45, 90, 39, 0.1)' : 'none',
        opacity: 0,
        animation: `riseUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards`,
        animationDelay: `${delay}s`,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
    >
      <div style={{ 
        width: 48, height: 48, borderRadius: '12px', 
        background: hovered ? 'var(--clr-moss-500)' : 'rgba(45, 90, 39, 0.1)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        marginBottom: '24px',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)'
      }}>
        <Icon color={hovered ? '#fff' : 'var(--clr-moss-500)'} size={24} />
      </div>
      <h4 style={{ 
        fontSize: '22px', 
        fontWeight: 900, 
        marginBottom: '16px', 
        color: hovered ? 'var(--clr-moss-500)' : '#000', 
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)'
      }}>{title}</h4>
      <p style={{ fontSize: '16px', color: 'rgba(0,0,0,0.5)', fontWeight: 500, lineHeight: 1.6 }}>{desc}</p>
      
      {/* Subtle Glow Effect */}
      {hovered && (
        <div style={{
          position: 'absolute',
          bottom: '-20px',
          right: '-20px',
          width: '100px',
          height: '100px',
          background: 'var(--clr-moss-500)',
          filter: 'blur(40px)',
          opacity: 0.15,
          zIndex: -1
        }} />
      )}
    </div>
  );
};

const PipelineStep = ({ icon: Icon, title, desc, stepNum, delay }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ 
        flex: 1, 
        minWidth: '250px', 
        position: 'relative',
        opacity: 0,
        animation: `riseUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards`,
        animationDelay: `${delay}s`,
        padding: '32px',
        background: hovered ? 'linear-gradient(135deg, #f9fbf8 0%, #e8f0e6 100%)' : '#fff',
        borderRadius: '24px',
        border: hovered ? '2px solid var(--clr-moss-500)' : '1px solid rgba(0,0,0,0.04)',
        textAlign: 'center',
        boxShadow: hovered ? '0 20px 40px rgba(45, 90, 39, 0.1)' : '0 4px 20px rgba(0,0,0,0.02)',
        transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
        transform: hovered ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)',
        cursor: 'pointer',
        overflow: 'hidden'
      }}
    >
      <div style={{ 
        width: '32px', height: '32px', borderRadius: '50%', background: hovered ? '#111' : 'var(--clr-moss-500)', 
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '12px', fontWeight: 900, margin: '0 auto 20px',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)'
      }}>
        {stepNum}
      </div>
      <div style={{ 
        marginBottom: '16px', 
        color: hovered ? '#000' : 'var(--clr-moss-500)', 
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)'
      }}>
        <Icon size={32} />
      </div>
      <h5 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '8px', color: hovered ? 'var(--clr-moss-500)' : '#000', transition: 'all 0.3s ease' }}>{title}</h5>
      <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.5)', fontWeight: 600 }}>{desc}</p>
      
      {/* Subtle Glow Effect */}
      {hovered && (
        <div style={{
          position: 'absolute',
          bottom: '-20px',
          right: '-20px',
          width: '100px',
          height: '100px',
          background: 'var(--clr-moss-500)',
          filter: 'blur(40px)',
          opacity: 0.15,
          zIndex: -1
        }} />
      )}
    </div>
  );
};

const IntegrityPill = ({ icon: Icon, label }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        padding: '16px 32px', 
        borderRadius: '100px', 
        background: hovered ? 'var(--clr-moss-500)' : '#f9fbf8', 
        border: hovered ? '2px solid var(--clr-moss-500)' : '1px solid rgba(0,0,0,0.05)', 
        color: hovered ? '#fff' : '#000',
        fontWeight: 800,
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-12px) scale(1.05)' : 'translateY(0) scale(1)',
        cursor: 'pointer',
        boxShadow: hovered ? '0 15px 30px rgba(45, 90, 39, 0.2)' : 'none'
      }}
    >
      <Icon size={18} color={hovered ? '#fff' : 'var(--clr-moss-500)'} /> {label}
    </div>
  );
};

const Hero = ({ onStart }) => {
  const [loaded, setLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);
  
  useEffect(() => {
    setLoaded(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    });
  };

  return (
    <div className="hero-minimal-wrapper" ref={heroRef} style={{ 
      minHeight: '100vh', 
      position: 'relative', 
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      
      {/* Parallax Background Layer */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url('/hero-bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        transform: `translateY(${scrollY * 0.4}px)`,
        opacity: 0.5,
        zIndex: 0
      }} />
      
      {/* Signal Sphere */}
      <SignalSphere scrollY={scrollY} />

      {/* Gradient Overlays for Readability */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.98) 80%)',
        zIndex: 1
      }} />

      {/* Navigation */}
      <nav style={{ 
        height: '100px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 8%', 
        position: 'relative', 
        zIndex: 10
      }}>
        <div style={{ fontSize: '24px', fontWeight: 900, color: '#111', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={24} fill="#111" /> PropIQ
        </div>
        
        {/* Cylinder Shaped Nav Pod */}
        <div style={{ 
          display: 'flex', 
          gap: '40px', 
          fontSize: '13px', 
          fontWeight: 700, 
          color: '#111',
          background: 'rgba(0,0,0,0.03)',
          padding: '12px 40px',
          borderRadius: '100px',
          border: '1px solid rgba(0,0,0,0.04)',
          backdropFilter: 'blur(10px)'
        }}>
          <span style={{ cursor: 'pointer' }} onClick={() => scrollToSection('markets')}>Markets</span>
          <span style={{ cursor: 'pointer' }} onClick={() => scrollToSection('research')}>Research</span>
          <span style={{ cursor: 'pointer' }} onClick={() => scrollToSection('intelligence')}>Intelligence</span>
          <span style={{ cursor: 'pointer' }} onClick={() => scrollToSection('contact')}>Contact</span>
        </div>
        <div>
          <button className="btn-auth" style={{ 
            padding: '12px 24px', 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            color: '#000',
            border: '1px solid rgba(0,0,0,0.05)'
          }} onClick={onStart}>Get Started</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="hero-main" style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        textAlign: 'center', 
        padding: '60px 10% 100px',
        position: 'relative', 
        zIndex: 5,
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 1s cubic-bezier(0.23, 1, 0.32, 1)'
      }}>
        <div className="badge-mini" style={{ background: 'rgba(0,0,0,0.05)', color: '#111', border: '1px solid rgba(0,0,0,0.1)' }}>Institutional-Grade Property Valuations</div>
        
        <h1 style={{ 
          fontSize: 'clamp(48px, 8vw, 92px)', 
          maxWidth: '1000px', 
          marginBottom: '24px',
          color: '#000',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 0.95
        }}>
          Precision Valuations.<br />
          Street-Level Intelligence.
        </h1>
        
        <p style={{ 
          fontSize: 'clamp(18px, 2vw, 22px)', 
          color: 'rgba(0,0,0,0.7)', 
          maxWidth: '750px', 
          marginBottom: '48px',
          fontWeight: 600,
          lineHeight: 1.5
        }}>
          Eliminate guesswork with AI-driven property benchmarks. 
          We provide RERA-verified, street-level insights powered by ensemble machine learning.
        </p>

        <button className="btn-auth" style={{ 
          marginBottom: '40px', 
          padding: '20px 48px', 
          fontSize: '18px',
          background: 'rgba(45, 90, 39, 0.1)', 
          backdropFilter: 'blur(25px)',
          border: '1px solid rgba(45, 90, 39, 0.2)',
          color: 'var(--clr-moss-500)'
        }} onClick={onStart}>
          Start Free Valuation <ArrowRight size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', fontWeight: 700, color: 'rgba(0,0,0,0.6)' }}>
          <div style={{ display: 'flex', marginLeft: '12px' }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ 
                width: 32, height: 32, borderRadius: '50%', background: '#eee', 
                border: '3px solid #fff', marginLeft: '-12px',
                backgroundImage: `url('https://i.pravatar.cc/100?img=${i+15}')`,
                backgroundSize: 'cover'
              }} />
            ))}
          </div>
          <span>VALUED 1,200+ PROPERTIES THIS MONTH</span>
        </div>

        {/* Floating Service Cards with Rise Animation */}
        <div style={{ 
          marginTop: '80px', 
          display: 'flex', 
          gap: '24px', 
          flexWrap: 'wrap', 
          justifyContent: 'center' 
        }}>
          <ServicePill icon={Cpu} label="ML ENSEMBLE" delay={0.2} />
          <ServicePill icon={Globe} label="25+ CITIES" delay={0.4} />
          <ServicePill icon={Shield} label="RERA VERIFIED" delay={0.6} />
          <ServicePill icon={Database} label="STREET-LEVEL DATA" delay={0.8} />
        </div>
      </div>

      {/* ── SECTIONS ── */}
      
      {/* Markets Section */}
      <section id="markets" style={{ padding: '150px 10%', background: '#fff', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div className="badge-mini" style={{ background: 'rgba(45, 90, 39, 0.05)', color: 'var(--clr-moss-500)', border: '1px solid rgba(45, 90, 39, 0.1)' }}>Coverage</div>
        <h2 style={{ fontSize: '64px', marginBottom: '32px', color: '#000', fontWeight: 900 }}>Micro-Market Mastery.</h2>
        <p style={{ fontSize: '20px', color: 'rgba(0,0,0,0.6)', maxWidth: '850px', margin: '0 auto 80px', fontWeight: 600, lineHeight: 1.6 }}>
          PropIQ covers 25+ major Indian cities. We track over 25,000+ unique micro-market signals to capture the hyper-local price dynamics that generic models miss.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
           {[
             { name: 'Mumbai', desc: 'Financial capital density' },
             { name: 'Bengaluru', desc: 'IT corridor appreciation' },
             { name: 'Delhi NCR', desc: 'Regional growth nodes' },
             { name: 'Hyderabad', desc: 'Pharma & Tech hub' },
             { name: 'Pune', desc: 'Automotive industrial value' },
             { name: 'Chennai', desc: 'Manufacturing coastal premium' },
             { name: 'Kolkata', desc: 'Cultural & Heritage premium' },
             { name: 'Ahmedabad', desc: 'Manufacturing & Textile hub' },
             { name: 'Jaipur', desc: 'Tourism & Gemstone growth' }
           ].map((city) => (
             <CityCard key={city.name} name={city.name} desc={city.desc} />
           ))}
           <CityCard name="EXPLORE MORE" isMore onClick={() => window.open('https://propiq.ai/markets', '_blank')} />
        </div>
      </section>

      {/* Intelligence Section */}
      <section id="intelligence" style={{ padding: '150px 10%', background: '#f9fbf8', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div className="badge-mini" style={{ background: 'rgba(0,0,0,0.05)', color: '#111' }}>Technology</div>
        <h2 style={{ fontSize: '64px', marginBottom: '32px', color: '#000', fontWeight: 900 }}>Neural Valuations.</h2>
        <p style={{ fontSize: '20px', color: 'rgba(0,0,0,0.6)', maxWidth: '850px', margin: '0 auto 100px', fontWeight: 600, lineHeight: 1.6 }}>
          Our engine utilizes an ensemble architecture, blending HistGradientBoosting and Random Forest models for institutional-grade accuracy.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
           <IntelCard icon={TrendingUp} title="Real-time Inference" desc="Valuations generated in under 2 seconds. Our optimized pipelines handle massive data ingestion to provide instant feedback." delay={0.1} />
           <IntelCard icon={BarChart} title="Feature Explainability" desc="Transparent results. We show exactly how variables like floor height, age, and local demand affect the final valuation score." delay={0.2} />
           <IntelCard icon={Layers} title="Ensemble Precision" desc="Our model blends HGBR and Random Forest architectures to eliminate bias and achieve 98%+ precision against actual records." delay={0.3} />
           <IntelCard icon={Network} title="Geo-Spatial Context" desc="Every valuation accounts for hyper-local signals: infra proximity, transit nodes, and micro-market absorption rates." delay={0.4} />
        </div>
      </section>

      {/* Merged Deep Research & Pipeline Section */}
      <section id="research" style={{ padding: '150px 10%', background: '#fff', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div className="badge-mini" style={{ background: 'rgba(45, 90, 39, 0.05)', color: 'var(--clr-moss-500)' }}>Deep Research & Process</div>
        <h2 style={{ fontSize: '64px', marginBottom: '32px', color: '#000', fontWeight: 900 }}>High-Fidelity Intelligence.</h2>
        <p style={{ fontSize: '20px', color: 'rgba(0,0,0,0.6)', maxWidth: '850px', margin: '0 auto 80px', fontWeight: 600, lineHeight: 1.6 }}>
          A transparent look at our institutional-grade research and the proprietary pipeline that transforms raw signals into street-level decisions.
        </p>
        
        {/* Step Flow Part */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', position: 'relative', justifyContent: 'center', marginBottom: '100px' }}>
          <PipelineStep stepNum="01" icon={Database} title="Multi-Source Ingestion" desc="Daily ingestion of RERA filings, registry records, and local brokerage signals." delay={0.1} />
          <PipelineStep stepNum="02" icon={Settings} title="Neural Cleaning" desc="Automated noise reduction and feature normalization across 25+ city schemas." delay={0.2} />
          <PipelineStep stepNum="03" icon={Terminal} title="Fast Inference API" desc="Our REST API computes the ensemble valuation in <200ms using optimized weights." delay={0.3} />
          <PipelineStep stepNum="04" icon={CheckCircle} title="Verified Output" desc="Final report generated with explainability scores and market confidence metrics." delay={0.4} />
        </div>

        {/* Integrity Pills Part */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
           {[
             { icon: Shield, label: 'CPWD Verified' },
             { icon: Search, label: 'Manual Audits' },
             { icon: Database, label: '25K+ Data Points' }
           ].map((item, i) => (
             <IntegrityPill key={i} icon={item.icon} label={item.label} />
           ))}
        </div>
      </section>

      {/* Contact & Partnership Section */}
      <section id="contact" style={{ padding: '150px 10% 100px', background: '#f9fbf8', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div className="badge-mini" style={{ background: 'rgba(0,0,0,0.05)', color: '#111' }}>Get in Touch</div>
        <h2 style={{ fontSize: '64px', marginBottom: '32px', color: '#000', fontWeight: 900 }}>Connect with Intelligence.</h2>
        <p style={{ fontSize: '20px', color: 'rgba(0,0,0,0.6)', maxWidth: '800px', margin: '0 auto 80px', fontWeight: 600, lineHeight: 1.6 }}>
          Whether you're looking for institutional data access, API integration, or to join our network of data partners, our team is ready to scale with you.
        </p>
        
        {/* Contact Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '100px' }}>
          <button className="btn-auth contact-btn-glow" style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            color: '#000', 
            border: '1px solid rgba(0,0,0,0.1)', 
            padding: '18px 40px',
            backdropFilter: 'blur(20px)'
          }} onClick={() => window.location.href = 'mailto:onlyravi4321@gmail.com'}>
            <Mail size={22} /> Gmail
          </button>
          <button className="btn-auth contact-btn-glow" style={{ 
            padding: '18px 40px',
            background: 'rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0,0,0,0.1)',
            backdropFilter: 'blur(20px)',
            color: '#000'
          }} onClick={() => window.open('https://github.com/TheRaviHub', '_blank')}>
            <Github size={22} /> GitHub
          </button>
          <button className="btn-auth contact-btn-glow" style={{ 
            background: 'rgba(0, 119, 181, 0.1)', 
            border: '1px solid rgba(0, 119, 181, 0.2)', 
            padding: '18px 40px',
            backdropFilter: 'blur(20px)',
            color: '#0077b5'
          }} onClick={() => window.open('https://www.linkedin.com/in/ravi-kumar-singh-3a0157397/', '_blank')}>
            <Linkedin size={22} /> LinkedIn
          </button>
        </div>

        {/* Additional Technical Footer Details */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          gap: '40px', 
          textAlign: 'left',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          paddingTop: '80px',
          marginTop: '80px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <h6 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Core Capabilities</h6>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px', color: 'rgba(0,0,0,0.5)', fontWeight: 600, lineHeight: 2.2 }}>
              <li>Neural Market Mapping</li>
              <li>Registry Data Hygiene</li>
              <li>ML Model Explainer</li>
              <li>Real-time Valuation API</li>
            </ul>
          </div>
          <div style={{ flex: '1', minWidth: '200px', textAlign: 'center' }}>
            <h6 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Data Network</h6>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px', color: 'rgba(0,0,0,0.5)', fontWeight: 600, lineHeight: 2.2 }}>
              <li>RERA Filings</li>
              <li>CPWD Cost Indices</li>
              <li>LHS Brokerage signals</li>
              <li>Micro-Market Sentiment</li>
            </ul>
          </div>
          <div style={{ flex: '1', minWidth: '200px', textAlign: 'right' }}>
            <h6 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Institutional</h6>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px', color: 'rgba(0,0,0,0.5)', fontWeight: 600, lineHeight: 2.2 }}>
              <li>Partner Program</li>
              <li>Enterprise API</li>
              <li>Data Research Hub</li>
              <li>Compliance & Privacy</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Final Copyright Footer */}
      <footer style={{ padding: '40px 10%', background: '#fff', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.04)', fontSize: '13px', fontWeight: 700, color: 'rgba(0,0,0,0.4)' }}>
        © 2024 PropIQ Neural Valuations. All rights reserved. Precision from data to decision.
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes riseUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .contact-btn-glow {
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1) !important;
        }
        .contact-btn-glow:hover {
          transform: translateY(-12px) scale(1.02) !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
        }
      `}} />

    </div>
  );
};

export default Hero;
