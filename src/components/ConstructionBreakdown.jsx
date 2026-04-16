// src/components/ConstructionBreakdown.jsx
// "Why This Price" — material cost breakdown using CPWD 2025-26 rates
import { getConstructionBreakdown, CITY_CONST_MULT, formatINR } from '../mlEngine';

const MATERIAL_LABELS = {
  cement:    { name: 'Cement (OPC 53 Grade)', icon: '🪨', color: '#94a3b8' },
  steel:     { name: 'Steel / TMT Bars',       icon: '🔧', color: '#60a5fa' },
  sand:      { name: 'River Sand',              icon: '🏖', color: '#fbbf24' },
  bricks:    { name: 'Red Bricks',              icon: '🧱', color: '#f97316' },
  labour:    { name: 'Labour & Mason',          icon: '👷', color: '#a78bfa' },
  finishing: { name: 'Finishing (Tiles, Paint, Plumbing, Electricals)', icon: '🎨', color: '#34d399' },
};

function Row({ icon, name, qty, unit, rate, total, color }) {
  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <td style={{ padding: '12px 14px' }}>
        <span style={{ marginRight: 8 }}>{icon}</span>
        <span style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{name}</span>
      </td>
      <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '13px' }}>
        {qty.toLocaleString()} {unit}
      </td>
      <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '13px' }}>
        ₹{rate.toLocaleString()}/{unit}
      </td>
      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color }}>{formatINR(total)}</span>
      </td>
    </tr>
  );
}

export default function ConstructionBreakdown({ result }) {
  const { estimatedPrice, inputs } = result;
  const { city, area, propertyType = 'Apartment', age, state } = inputs;
  const brokerPrice = inputs.brokerQuote || estimatedPrice * 1.08;

  const bd = getConstructionBreakdown(city, area, propertyType);
  const cityMult = CITY_CONST_MULT[city] || 1.0;
  const verdictGap = estimatedPrice - bd.totalReplacement;
  const verdictPct = Math.round((verdictGap / bd.totalReplacement) * 100);

  // 3-way comparison
  const threeWay = [
    { label: 'Replacement Cost (Floor)', value: bd.totalReplacement, color: '#60a5fa',
      note: 'Minimum — cost to rebuild this property from scratch' },
    { label: 'PropIQ ML Fair Value',     value: estimatedPrice,       color: '#34d399',
      note: `Includes location premium, demand & market signals` },
    { label: 'Broker Asking Price',       value: Math.round(brokerPrice), color: '#fb7185',
      note: 'What the agent is quoting — may include negotiation buffer' },
  ];

  return (
    <div className="panel" style={{ marginTop: '28px' }}>
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-title-icon" style={{ background: 'rgba(251,146,60,0.15)', color: '#fb923c' }}>🧱</div>
          Why This Price — Construction Cost Breakdown
        </div>
        <span className="info-chip">CPWD SoR 2025–26 · City adjusted</span>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
        The <strong>Replacement Cost Method</strong> calculates what it would cost to rebuild this property today — giving you a
        <strong style={{ color: '#34d399' }}> floor price</strong> below which no rational seller should go.
        Any price above replacement cost represents <strong>location value, brand premium, and market demand</strong>.
      </p>

      {/* 3-Way Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
        {threeWay.map((item, i) => (
          <div key={i} style={{
            padding: '16px 18px', borderRadius: '14px',
            background: `${item.color}08`,
            border: `1px solid ${item.color}30`,
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '8px' }}>
              {item.label}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: item.color, marginBottom: '6px' }}>
              {formatINR(item.value)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.note}</div>
          </div>
        ))}
      </div>

      {/* Location premium verdict */}
      <div style={{
        padding: '14px 18px', borderRadius: '12px', marginBottom: '24px',
        background: verdictGap > 0 ? 'rgba(52,211,153,0.06)' : 'rgba(251,113,133,0.06)',
        border: `1px solid ${verdictGap > 0 ? 'rgba(52,211,153,0.25)' : 'rgba(251,113,133,0.25)'}`,
        display: 'flex', alignItems: 'center', gap: '14px',
      }}>
        <span style={{ fontSize: '28px' }}>{verdictGap > 0 ? '📍' : '⚠️'}</span>
        <div>
          <div style={{ fontWeight: 700, color: verdictGap > 0 ? '#34d399' : '#fb7185', marginBottom: '3px', fontSize: '14px' }}>
            {verdictGap > 0
              ? `Location Premium: +${verdictPct}% above replacement cost`
              : `Below Replacement Cost: ${Math.abs(verdictPct)}% potential undervaluation`}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {verdictGap > 0
              ? `ML price is ${formatINR(verdictGap)} above replacement cost — justified by ${inputs.localityDemand} demand in ${inputs.locality}.`
              : `This property may be underpriced vs. its construction cost. Verify condition and legal status carefully.`}
          </div>
        </div>
      </div>

      {/* Material cost table */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
          📦 Material Cost Breakdown — {area.toLocaleString()} sq ft {propertyType} in {city}
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>
            (city multiplier: ×{cityMult.toFixed(2)})
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Material', 'Quantity', 'Rate', 'Cost'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Material' ? 'left' : 'right', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bd.items.map(item => {
                const meta = MATERIAL_LABELS[item.key];
                return meta ? <Row key={item.key} {...meta} qty={item.qty} unit={item.unit} rate={item.rate} total={item.total} /> : null;
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Construction Cost',  value: bd.constructionTotal, color: '#60a5fa' },
          { label: `Land (${bd.landArea} sqft × ₹${bd.landValuePerSqft.toLocaleString()})`, value: bd.landValue, color: '#fbbf24' },
          { label: 'Developer Margin (20%)', value: bd.devMargin, color: '#a78bfa' },
          { label: 'Replacement Value', value: bd.totalReplacement, color: '#34d399' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(5,11,24,0.5)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: s.color }}>{formatINR(s.value)}</div>
          </div>
        ))}
      </div>

      {/* Data source disclosure */}
      <div style={{
        padding: '10px 14px', borderRadius: '8px',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'flex-start',
      }}>
        <span>ℹ️</span>
        <span>
          <strong style={{ color: 'var(--text-secondary)' }}>Data Source:</strong> Construction rates based on{' '}
          <strong>CPWD Schedule of Rates 2025–26</strong> adjusted for {city} (+{Math.round((cityMult - 1) * 100)}% city premium).
          Land values from NHB Residex &amp; local market research. Material quantities use standard Indian construction norms (IS codes).
          {age > 0 && ` ${age}-year old property — replacement cost reflects current rebuild cost, not depreciated value.`}
        </span>
      </div>
    </div>
  );
}
