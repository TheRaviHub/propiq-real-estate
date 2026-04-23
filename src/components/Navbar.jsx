// src/components/Navbar.jsx
import { Zap } from 'lucide-react';

export default function Navbar({ onAction }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If not on hero page, just go back to hero
      onAction();
    }
  };

  return (
    <nav className="navbar" style={{ 
      background: 'rgba(255, 255, 255, 0.8)', 
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
      padding: '0 8%',
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
        <a className="nav-logo" href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => { e.preventDefault(); onAction(); }}>
          <Zap size={22} fill="var(--clr-text-main)" />
          <span style={{ 
            fontSize: '22px', 
            fontWeight: 900, 
            color: 'var(--clr-text-main)',
            letterSpacing: '-1px'
          }}>
            PropIQ
          </span>
        </a>
        <div style={{ display: 'flex', gap: '40px', fontSize: '13px', fontWeight: 600, color: 'var(--clr-text-main)' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => scrollToSection('markets')}>Markets</span>
          <span style={{ cursor: 'pointer' }} onClick={() => scrollToSection('intelligence')}>Intelligence</span>
          <span style={{ cursor: 'pointer' }} onClick={() => scrollToSection('research')}>Research</span>
          <span style={{ cursor: 'pointer' }} onClick={() => scrollToSection('contact')}>Contact</span>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <button className="btn-auth" style={{ padding: '10px 24px' }} onClick={onAction}>Start Valuation</button>
      </div>
    </nav>
  );
}
