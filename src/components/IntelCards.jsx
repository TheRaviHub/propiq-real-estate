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
        glowColor="var(--clr-primary)"
      />
      <IntelCard
        label="ML Confidence Score"
        value={`${confidenceScore}%`}
        sub="Model certainty"
        trend={confidenceScore > 75 ? 'High confidence' : confidenceScore > 55 ? 'Moderate' : 'Low'}
        trendDir={confidenceScore > 75 ? 'up' : confidenceScore > 55 ? 'neutral' : 'down'}
        glowColor="#8b5cf6"
      />
      <IntelCard
        label="Market Demand Score"
        value={`${demandScore}/100`}
        sub="Buyer interest signal"
        trend={demandScore > 70 ? 'Hot market' : demandScore > 45 ? 'Active' : 'Slow'}
        trendDir={demandDir}
        glowColor="var(--clr-accent-cyan)"
      />
      <IntelCard
        label="Est. Time to Resell"
        value={`~${liquidityDays} days`}
        sub="If you decide to sell later"
        trend={liquidityDays < 30 ? 'Fast sell' : liquidityDays < 60 ? 'Moderate' : 'Slow market'}
        trendDir={liquidityDays < 30 ? 'up' : liquidityDays < 60 ? 'neutral' : 'down'}
        glowColor="var(--clr-accent-teal)"
      />
      <IntelCard
        label="Risk Score"
        value={`${riskScore}/100`}
        sub="Lower is safer"
        trend={riskScore < 30 ? 'Low risk' : riskScore < 60 ? 'Moderate risk' : 'High risk'}
        trendDir={riskDir}
        glowColor={riskScore < 30 ? '#10b981' : riskScore < 60 ? '#f59e0b' : '#f43f5e'}
      />
      <IntelCard
        label="5-Year ROI Projection"
        value={`+${projectedROI5Y}%`}
        sub="Capital appreciation"
        trend="vs FD 6.5%"
        trendDir={projectedROI5Y > 40 ? 'up' : 'neutral'}
        glowColor="var(--clr-accent-emerald)"
      />
      <IntelCard
        label="Rental Yield"
        value={`${rentalYield}%`}
        sub={`${formatINR(result.monthlyRent)}/month`}
        trend="Annual gross yield"
        trendDir="neutral"
        glowColor="var(--clr-accent-amber)"
      />
      <IntelCard
        label="Comparable Sales"
        value={result.comparableDensity}
        sub="Recent transactions nearby"
        trend="In last 90 days"
        trendDir="neutral"
        glowColor="#f97316"
      />
    </div>
  );
}
