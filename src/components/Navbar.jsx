// src/components/Navbar.jsx
export default function Navbar() {
  return (
    <nav className="navbar">
      <a className="nav-logo" href="/">
        <div className="nav-logo-icon">🏠</div>
        <span className="nav-logo-text">PropIQ</span>
        <span className="nav-badge">ML</span>
      </a>
      <div className="nav-status">
        <div className="status-dot" />
        <span>ML Engine Online</span>
        <span style={{ margin: '0 8px', color: 'var(--clr-border-bright)' }}>|</span>
        <span style={{ fontSize: '12px' }}>v2.4.1</span>
      </div>
    </nav>
  );
}
