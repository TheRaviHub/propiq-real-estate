// src/components/LoadingAnalysis.jsx
import { useEffect, useState } from 'react';

const STEPS = [
  { icon: '⚡', text: 'Vectorizing property features...' },
  { icon: '🗺️', text: 'Computing locality demand index...' },
  { icon: '📊', text: 'Running ensemble ML models...' },
  { icon: '🔍', text: 'Cross-referencing comparable sales...' },
  { icon: '🛡️', text: 'RERA fraud detection check...' },
  { icon: '📈', text: 'Projecting 5-year ROI metrics...' },
  { icon: '✅', text: 'Generating role-specific insights...' },
];

export default function LoadingAnalysis({ onComplete }) {
  const [activeStep, setActiveStep] = useState(0);
  const [doneSteps, setDoneSteps] = useState([]);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current < STEPS.length - 1) {
        setDoneSteps(prev => [...prev, current]);
        current++;
        setActiveStep(current);
      } else {
        setDoneSteps(prev => [...prev, current]);
        clearInterval(interval);
        setTimeout(onComplete, 400);
      }
    }, 380);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="loading-overlay">
      <div className="loading-card" style={{ animation: 'fadeIn 0.3s ease both' }}>
        <div className="loading-spinner" />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
          Running Intelligence Engine
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          XGBoost + Random Forest ensemble
        </div>
        <div className="loading-steps">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className={`loading-step ${i === activeStep ? 'active' : ''} ${doneSteps.includes(i) && i !== activeStep ? 'done' : ''}`}
            >
              <span>{doneSteps.includes(i) && i !== activeStep ? '✓' : step.icon}</span>
              <span>{step.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
