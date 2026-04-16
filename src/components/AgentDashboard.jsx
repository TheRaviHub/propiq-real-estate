// src/components/AgentDashboard.jsx
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import { formatINR, generatePriceTimeCurve } from '../mlEngine';

const PriceDot = ({ active, payload }) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(139,92,246,0.3)',
        padding: '10px 14px', borderRadius: '10px', fontSize: '13px',
      }}>
        <div style={{ fontWeight: 700, color: '#a78bfa' }}>{d.price}</div>
        <div style={{ color: '#64748b' }}>{d.days} days to sell</div>
      </div>
    );
  }
  return null;
};

export default function AgentDashboard({ result }) {
  const {
    estimatedPrice, liquidityDays, demandScore, confidenceScore,
    comparableDensity, inputs, annualAppreciation,
  } = result;

  const curveData = generatePriceTimeCurve(estimatedPrice, liquidityDays);
  const optimalPoint = curveData.find(d => d.priceFactor === 100) || curveData[3];

  const suggestedListingPrice = Math.round(estimatedPrice * 1.03); // 3% buffer above ML fair value
  const buyerPoolData = [
    { segment: 'First-time Buyers', score: 65 },
    { segment: 'Upgrade Buyers', score: 82 },
    { segment: 'Investors', score: 74 },
    { segment: 'NRI Buyers', score: 48 },
  ];

  return (
    <div className="animate-fade-up">

      {/* Strategy Header */}
      <div style={{
        padding: '20px 24px',
        borderRadius: '16px',
        marginBottom: '24px',
        border: '1px solid rgba(139,92,246,0.3)',
        background: 'rgba(139,92,246,0.05)',
        display: 'flex', gap: '32px', flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Suggested Listing Price</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: '#a78bfa' }}>
            {formatINR(suggestedListingPrice)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Expected Days on Market</div>
            <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#60a5fa' }}>{liquidityDays}d</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Demand Score</div>
            <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#34d399' }}>{demandScore}/100</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Nearby Listings</div>
            <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#fbbf24' }}>{comparableDensity}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Price vs Time to Sell Curve */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-title-icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>⚡</div>
              Price vs. Days-on-Market
            </div>
            <span className="info-chip">Optimal at 100%</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Pricing above market value significantly increases sell time. The curve shows the trade-off.
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curveData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="priceFactor"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `${v}%`}
                />
                <YAxis
                  dataKey="days"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `${v}d`}
                />
                <Tooltip content={<PriceDot />} />
                <Line
                  type="monotone"
                  dataKey="days"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={(props) => {
                    const isOptimal = props.payload.priceFactor === 100;
                    return isOptimal ? (
                      <circle cx={props.cx} cy={props.cy} r={7} fill="#8b5cf6" stroke="#fff" strokeWidth={2} />
                    ) : (
                      <circle cx={props.cx} cy={props.cy} r={3} fill="#8b5cf6" />
                    );
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Buyer Pool Analysis */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-title-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#22d3ee' }}>👥</div>
              Buyer Demand Segments
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buyerPoolData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                <XAxis
                  dataKey="segment"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10,22,40,0.95)',
                    border: '1px solid rgba(100,160,255,0.2)',
                    borderRadius: '10px',
                  }}
                  labelStyle={{ color: '#f0f6ff', fontWeight: 600 }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {buyerPoolData.map((_, i) => (
                    <Cell key={i} fill={['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'][i]} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pricing Strategy Tips */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <div className="panel-title-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>💡</div>
            AI Listing Strategy Recommendations
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
          {[
            {
              icon: '🎯',
              title: 'Optimal Listing Price',
              value: formatINR(suggestedListingPrice),
              desc: 'Priced 3% above ML fair value to allow negotiation room without deterring buyers.',
            },
            {
              icon: '⏱️',
              title: 'Expected Time on Market',
              value: `${liquidityDays} days`,
              desc: `At this price point, expect ${liquidityDays} days. Pricing 10% higher could extend to ${Math.round(liquidityDays * 2.8)} days.`,
            },
            {
              icon: '📣',
              title: 'Target Marketing',
              value: 'Upgrade Buyers',
              desc: `Upgrade buyers show ${buyerPoolData[1].score}% demand signal — highest in this locality for ${inputs.bhk} BHK.`,
            },
          ].map((tip, i) => (
            <div key={i} style={{
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid var(--clr-border)',
              background: 'rgba(5,11,24,0.4)',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{tip.icon}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tip.title}</div>
              <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#a78bfa', marginBottom: '8px' }}>{tip.value}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{tip.desc}</div>
            </div>
          ))}
        </div>
      </div>
      {/* ── Agent Intelligence: What Your Buyer Knows ── */}
      <div className="panel" style={{ marginTop: '8px' }}>
        <div className="panel-header">
          <div className="panel-title">
            <div className="panel-title-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>🏡</div>
            Buyer Intelligence — What Your Client Already Knows
          </div>
          <span className="info-chip">Real-life negotiation dynamics</span>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Today's buyers use ML tools to benchmark your listing. Here's exactly what a data-savvy buyer sees — and how you can stay ahead.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          {/* Buyer's view */}
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#60a5fa', marginBottom: '10px' }}>
              📱 What the Buyer's App Shows Them
            </div>
            {[
              `ML Fair Value: ${formatINR(estimatedPrice)} (unbiased, data-driven)`,
              `Your listing of ${formatINR(suggestedListingPrice)} looks ${Math.round(((suggestedListingPrice - estimatedPrice) / estimatedPrice) * 100)}% above fair value`,
              `Buyer's suggested opening bid: ${formatINR(Math.round(estimatedPrice * 0.97))}`,
              `Their walk-away threshold: ${formatINR(Math.round(estimatedPrice * 1.07))}`,
              `Market liquidity: ${liquidityDays} days — they know you may wait this long`,
            ].map((pt, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span style={{ color: '#60a5fa', flexShrink: 0 }}>›</span> {pt}
              </div>
            ))}
          </div>

          {/* Agent counter-strategy */}
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#a78bfa', marginBottom: '10px' }}>
              🤝 Your Counter-Intelligence Playbook
            </div>
            {[
              `Accept opening bids ≥ ${formatINR(Math.round(estimatedPrice * 0.98))} — within 2% of ML value`,
              `Use ${result.comparableDensity} recent sales to justify your price point`,
              `Offer staging / minor repairs to push perceived value above ML`,
              `Create urgency: share that ${Math.round(result.comparableDensity * 0.3)} buyers enquired this week`,
              `Counter at ${formatINR(Math.round(estimatedPrice * 1.015))} — 1.5% above ML is reasonable`,
            ].map((pt, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span style={{ color: '#a78bfa', flexShrink: 0 }}>›</span> {pt}
              </div>
            ))}
          </div>
        </div>

        {/* Shared deal zone */}
        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '28px' }}>✅</div>
          <div>
            <div style={{ fontWeight: 700, color: '#34d399', fontSize: '14px', marginBottom: '4px' }}>
              Win-Win Zone: {formatINR(Math.round(estimatedPrice * 1.0))} – {formatINR(Math.round(estimatedPrice * 1.03))}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Deals closing in this range satisfy both parties — buyer pays within ML fair value, you earn a clean commission at {formatINR(Math.round(estimatedPrice * 1.02))}.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
