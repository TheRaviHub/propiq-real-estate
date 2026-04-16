// src/components/BankDashboard.jsx
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { formatINR } from '../mlEngine';

function FraudCheckItem({ status, title, detail }) {
  const cls = status === 'pass' ? 'pass' : status === 'warn' ? 'warn' : 'fail';
  const icon = status === 'pass' ? '✓' : status === 'warn' ? '⚠' : '✕';
  return (
    <div className={`fraud-check-item ${cls}`}>
      <div className="fraud-check-icon">{icon}</div>
      <div className="fraud-check-content">
        <h5>{title}</h5>
        <p>{detail}</p>
      </div>
    </div>
  );
}

export default function BankDashboard({ result }) {
  const {
    estimatedPrice, priceMin, priceMax, riskScore, confidenceScore,
    comparableDensity, inputs, infraScore, liquidityDays,
  } = result;

  const brokerPrice = inputs.brokerQuote || estimatedPrice * 1.08;
  const overvaluationGap = Math.round(((brokerPrice - estimatedPrice) / estimatedPrice) * 100);
  const ltv75 = Math.round(estimatedPrice * 0.75);
  const ltv80 = Math.round(estimatedPrice * 0.80);

  const isFrequentFraud = overvaluationGap > 20;
  const fraudStatus = isFrequentFraud ? 'fail' : overvaluationGap > 10 ? 'warn' : 'pass';

  const riskClass = riskScore < 30 ? 'Low Risk' : riskScore < 55 ? 'Moderate Risk' : 'High Risk';
  const approvalType = riskScore < 30 ? 'approved' : riskScore < 55 ? 'conditional' : 'rejected';

  const fraudChecks = [
    {
      status: fraudStatus,
      title: 'Overvaluation Detection',
      detail: `Asking price is ${overvaluationGap > 0 ? overvaluationGap + '% above' : 'within'} ML fair value. ${isFrequentFraud ? 'Possible fraud — manual review required.' : 'Within acceptable range.'}`,
    },
    {
      status: comparableDensity > 20 ? 'pass' : 'warn',
      title: 'Comparable Sales Support',
      detail: `${comparableDensity} comparable transactions found in the last 90 days. ${comparableDensity > 20 ? 'Good data support.' : 'Limited comp data — proceed with caution.'}`,
    },
    {
      status: inputs.age < 10 ? 'pass' : inputs.age < 25 ? 'warn' : 'fail',
      title: 'RERA & Title Verification',
      detail: `Property age: ${inputs.age} years. ${inputs.age < 10 ? 'Recent construction — RERA registration likely valid.' : inputs.age < 25 ? 'Verify title chain and encumbrances.' : 'Old property — thorough title search mandatory.'}`,
    },
    {
      status: infraScore > 70 ? 'pass' : 'warn',
      title: 'Collateral Health Analysis',
      detail: `Infrastructure score: ${infraScore}/100. ${infraScore > 70 ? 'Strong collateral quality.' : 'Below-average area infrastructure impacting collateral value.'}`,
    },
    {
      status: liquidityDays < 60 ? 'pass' : liquidityDays < 120 ? 'warn' : 'fail',
      title: 'Liquidation Risk',
      detail: `Estimated time to sell in a forced sale: ${Math.round(liquidityDays * 1.6)} days. ${liquidityDays < 60 ? 'High liquidity — low recovery risk.' : 'Moderate to high liquidation time.'}`,
    },
    {
      status: riskScore < 40 ? 'pass' : riskScore < 65 ? 'warn' : 'fail',
      title: 'Stress Test — Market Decline',
      detail: `In a 20% market decline, property value drops to ${formatINR(Math.round(estimatedPrice * 0.8))}. ${riskScore < 40 ? 'Collateral remains above LTV-75 threshold.' : 'LTV threshold breached under stress.'}`,
    },
  ];

  const radarData = [
    { subject: 'Collateral', value: infraScore },
    { subject: 'Liquidity', value: Math.max(0, 100 - liquidityDays) },
    { subject: 'Confidence', value: confidenceScore },
    { subject: 'Comp Support', value: Math.min(100, comparableDensity * 2) },
    { subject: 'Risk', value: Math.max(0, 100 - riskScore) },
    { subject: 'Market', value: result.demandScore },
  ];

  return (
    <div className="animate-fade-up">

      {/* LTV Display */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px',
        marginBottom: '24px',
      }}>
        {[
          { label: 'ML Property Value', val: formatINR(estimatedPrice), color: '#60a5fa' },
          { label: 'Safe Loan (LTV 75%)', val: formatINR(ltv75), color: '#34d399' },
          { label: 'Max Loan (LTV 80%)', val: formatINR(ltv80), color: '#fbbf24' },
          { label: 'Overvaluation Gap', val: `${overvaluationGap > 0 ? '+' : ''}${overvaluationGap}%`, color: isFrequentFraud ? '#fb7185' : '#34d399' },
        ].map((m, i) => (
          <div key={i} style={{
            padding: '20px', borderRadius: '14px',
            border: '1px solid var(--clr-border)',
            background: 'rgba(10,22,40,0.7)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{m.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)', color: m.color }}>{m.val}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Fraud & Verification Checks */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-title-icon" style={{ background: 'rgba(244,63,94,0.1)', color: '#fb7185' }}>🛡️</div>
              Fraud Detection & RERA Verification
            </div>
          </div>
          <div className="fraud-check-list">
            {fraudChecks.map((c, i) => (
              <FraudCheckItem key={i} {...c} />
            ))}
          </div>
        </div>

        {/* Collateral Radar */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-title-icon" style={{ background: 'rgba(20,184,166,0.15)', color: '#2dd4bf' }}>📊</div>
              Collateral Quality Radar
            </div>
          </div>
          <div style={{ flex: 1, minHeight: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10,22,40,0.95)',
                    border: '1px solid rgba(20,184,166,0.3)',
                    borderRadius: '10px',
                  }}
                />
                <Radar dataKey="value" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="divider" />

          {/* Approval Recommendation */}
          <div className={`approval-box ${approvalType}`}>
            <div className="approval-status">
              {approvalType === 'approved' ? '✅ Loan Recommended' :
               approvalType === 'conditional' ? '⚠️ Conditional Approval' : '❌ Decline — High Risk'}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {approvalType === 'approved'
                ? `Safe to disburse up to ${formatINR(ltv75)} at LTV 75%. Risk score: ${riskScore}/100.`
                : approvalType === 'conditional'
                ? `Proceed with enhanced due diligence. Cap at ${formatINR(ltv75)}. Additional collateral recommended.`
                : `Risk score ${riskScore}/100 exceeds threshold. Significant overvaluation or market risk detected.`}
            </div>
          </div>
        </div>
      </div>

      {/* Stress Test */}
      <div className="panel" style={{ marginTop: '24px' }}>
        <div className="panel-header">
          <div className="panel-title">
            <div className="panel-title-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>⚡</div>
            Stress Test — Downside Scenarios
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
          {[10, 20, 30, 40].map(drop => {
            const stressVal = Math.round(estimatedPrice * (1 - drop / 100));
            const ltv75Breach = stressVal < ltv75;
            return (
              <div key={drop} style={{
                padding: '16px', borderRadius: '12px',
                border: `1px solid ${ltv75Breach ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)'}`,
                background: ltv75Breach ? 'rgba(244,63,94,0.05)' : 'rgba(16,185,129,0.05)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>Market drops {drop}%</div>
                <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-display)', color: ltv75Breach ? '#fb7185' : '#34d399', marginBottom: '6px' }}>
                  {formatINR(stressVal)}
                </div>
                <div style={{ fontSize: '11px', color: ltv75Breach ? '#fb7185' : '#34d399' }}>
                  {ltv75Breach ? '⚠ LTV-75 Breached' : '✓ LTV-75 Safe'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
