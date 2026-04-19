// src/components/IntelCards.jsx — Core intelligence signal cards
import { formatINR } from '../mlEngine';

function IntelCard({ label, value, sub, trend, trendDir, glowColor }) {
  return (
    <div className="intel-card">
      <div className="intel-card-glow" style={{ background: glowColor }} />
      <div className="intel-label">{label}</div>
      <div className="intel-value">{value}</div>
      {sub && <div className="intel-sub">{sub}</div>}
      {trend && (
        <div className={`intel-trend ${trendDir}`}>
          {trendDir === 'up' ? '↑' : trendDir === 'down' ? '↓' : '→'} {trend}
        </div>
      )}
    </div>
  );
}

export default function IntelCards({ result }) {
  const { estimatedPrice, priceMin, priceMax, confidenceScore, demandScore, liquidityDays, riskScore, projectedROI5Y, rentalYield } = result;

  const riskDir = riskScore < 30 ? 'up' : riskScore < 60 ? 'neutral' : 'down';
  const demandDir = demandScore > 70 ? 'up' : demandScore > 45 ? 'neutral' : 'down';

  return (
    <div className="intel-grid">
      <IntelCard
        label="Estimated Market Price"
        value={formatINR(estimatedPrice)}
        sub={`Range: ${formatINR(priceMin)} – ${formatINR(priceMax)}`}
        trend="Fair value"
        trendDir="up"
        glowColor="rgba(56, 189, 248, 0.4)"
      />
      <IntelCard
        label="ML Confidence Score"
        value={`${confidenceScore}%`}
        sub="Model certainty"
        trend={confidenceScore > 75 ? 'High confidence' : confidenceScore > 55 ? 'Moderate' : 'Low'}
        trendDir={confidenceScore > 75 ? 'up' : confidenceScore > 55 ? 'neutral' : 'down'}
        glowColor="rgba(167, 139, 250, 0.4)"
      />
      <IntelCard
        label="Market Demand Score"
        value={`${demandScore}/100`}
        sub="Buyer interest signal"
        trend={demandScore > 70 ? 'Hot market' : demandScore > 45 ? 'Active' : 'Slow'}
        trendDir={demandDir}
        glowColor="rgba(34, 211, 238, 0.4)"
      />
      <IntelCard
        label="Comparable Sales"
        value={result.comparableDensity}
        sub="Recent transactions nearby"
        trend="In last 90 days"
        trendDir="neutral"
        glowColor="rgba(249, 115, 22, 0.4)"
      />
    </div>
  );
}
