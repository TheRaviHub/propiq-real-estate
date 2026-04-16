// src/components/InvestorDashboard.jsx
import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend,
} from 'recharts';
import { formatINR, generateForecastSeries } from '../mlEngine';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(245,158,11,0.3)',
        padding: '10px 14px', borderRadius: '10px', fontSize: '13px',
      }}>
        <div style={{ fontWeight: 700, color: '#fbbf24', marginBottom: '4px' }}>{payload[0].payload.year}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color }}>
            {p.name}: {formatINR(p.value)}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function InvestorDashboard({ result }) {
  const {
    estimatedPrice, rentalYield, monthlyRent, projectedROI5Y,
    annualAppreciation, inputs,
  } = result;

  const [buyPrice, setBuyPrice] = useState(estimatedPrice);
  const [holdYears, setHoldYears] = useState(5);
  const [monthlyRentAdj, setMonthlyRentAdj] = useState(monthlyRent);

  // ROI Calculator
  const exitValue = Math.round(buyPrice * Math.pow(1 + annualAppreciation / 100, holdYears));
  const totalRentalIncome = monthlyRentAdj * 12 * holdYears;
  const totalReturn = exitValue - buyPrice + totalRentalIncome;
  const totalROI = Math.round((totalReturn / buyPrice) * 100);
  const annualROI = +(totalROI / holdYears).toFixed(1);
  const capRate = +((monthlyRentAdj * 12) / buyPrice * 100).toFixed(2);

  // Benchmark comparison
  const fdReturn = Math.round(buyPrice * (Math.pow(1.065, holdYears) - 1));
  const niftyReturn = Math.round(buyPrice * (Math.pow(1.117, holdYears) - 1));

  // Forecast comparison chart
  const currentYear = new Date().getFullYear();
  const compChart = Array.from({ length: holdYears + 1 }, (_, i) => ({
    year: `${currentYear + i}`,
    'Property': Math.round(buyPrice * Math.pow(1 + annualAppreciation / 100, i) + monthlyRentAdj * 12 * i),
    'FD (6.5%)': Math.round(buyPrice * Math.pow(1.065, i)),
    'Nifty 50 (11.7%)': Math.round(buyPrice * Math.pow(1.117, i)),
  }));

  // Year-wise rental yield growth
  const rentalGrowthChart = Array.from({ length: holdYears }, (_, i) => ({
    year: `Yr ${i + 1}`,
    rent: Math.round(monthlyRentAdj * 12 * Math.pow(1.06, i)),
    appreciation: Math.round(buyPrice * (Math.pow(1 + annualAppreciation / 100, i + 1) - Math.pow(1 + annualAppreciation / 100, i))),
  }));

  return (
    <div className="animate-fade-up">

      {/* ROI Calculator */}
      <div className="panel" style={{ marginBottom: '24px' }}>
        <div className="panel-header">
          <div className="panel-title">
            <div className="panel-title-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>🧮</div>
            Interactive ROI Calculator
          </div>
          <span className="info-chip">Adjust sliders to model scenarios</span>
        </div>

        <div className="roi-calc-grid">
          {/* Sliders */}
          <div className="slider-group">
            <div className="slider-row">
              <div className="slider-label-row">
                <span className="slider-label">Buy Price</span>
                <span className="slider-val">{formatINR(buyPrice)}</span>
              </div>
              <input
                type="range"
                id="slider-buy-price"
                min={Math.round(estimatedPrice * 0.7)}
                max={Math.round(estimatedPrice * 1.4)}
                step={100000}
                value={buyPrice}
                onChange={e => setBuyPrice(Number(e.target.value))}
                style={{ accentColor: '#f59e0b' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>{formatINR(Math.round(estimatedPrice * 0.7))}</span>
                <span>{formatINR(Math.round(estimatedPrice * 1.4))}</span>
              </div>
            </div>

            <div className="slider-row">
              <div className="slider-label-row">
                <span className="slider-label">Hold Period</span>
                <span className="slider-val">{holdYears} years</span>
              </div>
              <input
                type="range"
                id="slider-hold-years"
                min={1}
                max={15}
                step={1}
                value={holdYears}
                onChange={e => setHoldYears(Number(e.target.value))}
                style={{ accentColor: '#f59e0b' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>1 year</span>
                <span>15 years</span>
              </div>
            </div>

            <div className="slider-row">
              <div className="slider-label-row">
                <span className="slider-label">Monthly Rental Income</span>
                <span className="slider-val">{formatINR(monthlyRentAdj)}</span>
              </div>
              <input
                type="range"
                id="slider-monthly-rent"
                min={0}
                max={Math.round(monthlyRent * 2)}
                step={1000}
                value={monthlyRentAdj}
                onChange={e => setMonthlyRentAdj(Number(e.target.value))}
                style={{ accentColor: '#f59e0b' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>₹0</span>
                <span>{formatINR(Math.round(monthlyRent * 2))}</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="roi-results">
            {[
              { label: '🏷️ Exit Value', val: formatINR(exitValue), cls: '' },
              { label: '🏠 Total Rental Income', val: formatINR(totalRentalIncome), cls: '' },
              { label: '💰 Total Return', val: formatINR(totalReturn), cls: 'positive' },
              { label: '📈 Total ROI', val: `${totalROI}%`, cls: totalROI > 40 ? 'positive' : 'neutral' },
              { label: '📅 Annualized ROI', val: `${annualROI}%/yr`, cls: annualROI > 10 ? 'positive' : '' },
              { label: '🔑 Gross Cap Rate', val: `${capRate}%`, cls: capRate > 4 ? 'positive' : '' },
            ].map((m, i) => (
              <div className="roi-metric" key={i}>
                <span className="roi-metric-label">{m.label}</span>
                <span className={`roi-metric-val ${m.cls}`}>{m.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benchmark Comparison Chart */}
      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-title-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>⚖️</div>
              vs. Benchmarks
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={compChart} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
                <defs>
                  <linearGradient id="propGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="niftyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `₹${(v / 1e5).toFixed(0)}L`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                <Area type="monotone" dataKey="Property" stroke="#f59e0b" strokeWidth={2.5} fill="url(#propGrad)" />
                <Area type="monotone" dataKey="FD (6.5%)" stroke="#64748b" strokeWidth={1.5} fill="url(#fdGrad)" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="Nifty 50 (11.7%)" stroke="#3b82f6" strokeWidth={1.5} fill="url(#niftyGrad)" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Annual Breakdown Chart */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-title-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>📅</div>
              Annual Income Breakdown
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rentalGrowthChart} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `₹${(v / 1e3).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{ background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                <Bar dataKey="rent" name="Rental Income" fill="#f59e0b" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
                <Bar dataKey="appreciation" name="Capital Gain" fill="#10b981" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Benchmark Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginTop: '8px' }}>
        {[
          {
            label: '🏠 Property Return',
            val: formatINR(totalReturn),
            roi: `${totalROI}%`,
            color: '#f59e0b',
            border: 'rgba(245,158,11,0.3)',
            bg: 'rgba(245,158,11,0.05)',
            winner: totalReturn > Math.max(fdReturn, niftyReturn),
          },
          {
            label: '🏦 FD (6.5%/yr)',
            val: formatINR(fdReturn),
            roi: `${Math.round((fdReturn / buyPrice) * 100)}%`,
            color: '#64748b',
            border: 'rgba(100,116,139,0.3)',
            bg: 'rgba(100,116,139,0.05)',
            winner: false,
          },
          {
            label: '📈 Nifty 50 (11.7%/yr)',
            val: formatINR(niftyReturn),
            roi: `${Math.round((niftyReturn / buyPrice) * 100)}%`,
            color: '#3b82f6',
            border: 'rgba(59,130,246,0.3)',
            bg: 'rgba(59,130,246,0.05)',
            winner: niftyReturn > Math.max(fdReturn, totalReturn),
          },
        ].map((b, i) => (
          <div key={i} style={{
            padding: '20px', borderRadius: '14px',
            border: `1px solid ${b.border}`,
            background: b.bg,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {b.winner && (
              <div style={{
                position: 'absolute', top: '12px', right: '12px',
                background: '#f59e0b', color: '#000', fontSize: '10px',
                fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
              }}>
                WINNER
              </div>
            )}
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{b.label}</div>
            <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-display)', color: b.color, marginBottom: '4px' }}>{b.val}</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: b.color }}>{b.roi} total over {holdYears}yr</div>
          </div>
        ))}
      </div>
    </div>
  );
}
