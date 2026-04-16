// src/components/ExplainabilityPanel.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS_POS = ['#3b82f6', '#60a5fa', '#818cf8', '#34d399', '#06b6d4', '#a78bfa'];
const COLORS_NEG = ['#f43f5e', '#fb923c'];

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(100,160,255,0.2)',
        padding: '10px 14px', borderRadius: '10px', fontSize: '13px',
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4, color: '#f0f6ff' }}>{d.name}</div>
        <div style={{ color: d.positive ? '#34d399' : '#fb7185' }}>
          Impact: {d.positive ? '+' : '-'}{d.value}
        </div>
      </div>
    );
  }
  return null;
}

export default function ExplainabilityPanel({ featureImportance }) {
  const data = featureImportance.map(f => ({ ...f, displayVal: f.value }));

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-title-icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>🧩</div>
          ML Explainability — Feature Importance
        </div>
        <span className="info-chip">SHAP values simulated</span>
      </div>

      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        These are the key factors driving the estimated market price. Green bars increase value; red bars decrease it.
      </div>

      <div className="chart-container" style={{ height: '240px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 30, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="displayVal" radius={[0, 6, 6, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.positive ? COLORS_POS[index % COLORS_POS.length] : COLORS_NEG[index % COLORS_NEG.length]}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="factor-list" style={{ marginTop: '20px' }}>
        {featureImportance.slice(0, 4).map((f, i) => (
          <div className="factor-row" key={i}>
            <div
              className="factor-icon"
              style={{
                background: f.positive ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                color: f.positive ? '#34d399' : '#fb7185',
              }}
            >
              {f.positive ? '↑' : '↓'}
            </div>
            <span className="factor-name">{f.name}</span>
            <div className="factor-impact">
              <div className="factor-bar-track">
                <div
                  className="factor-bar-fill"
                  style={{
                    width: `${Math.min(100, (f.value / 35) * 100)}%`,
                    background: f.positive
                      ? 'linear-gradient(90deg, #10b981, #34d399)'
                      : 'linear-gradient(90deg, #f43f5e, #fb7185)',
                  }}
                />
              </div>
              <span
                className="factor-pct"
                style={{ color: f.positive ? '#34d399' : '#fb7185' }}
              >
                {f.positive ? '+' : '-'}{f.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
