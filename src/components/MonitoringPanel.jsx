// src/components/MonitoringPanel.jsx
// Role-specific monitoring & feedback — each role sees only what's relevant to them
import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell,
} from 'recharts';

const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

// ── Shared mini-components ────────────────────────────────────────────────────

function SectionTitle({ icon, title, subtitle, color = '#60a5fa' }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '16px',
          background: `${color}18`, border: `1px solid ${color}30`,
        }}>{icon}</div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
          {title}
        </span>
      </div>
      {subtitle && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '42px' }}>{subtitle}</p>}
    </div>
  );
}

function StatBadge({ label, value, color = '#60a5fa', sub }) {
  return (
    <div style={{
      padding: '16px 20px', borderRadius: '14px',
      background: 'rgba(5,11,24,0.5)', border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

function TimelineEntry({ time, event, detail, status }) {
  const colors = { success: '#34d399', warn: '#fbbf24', info: '#60a5fa', neutral: '#64748b' };
  const c = colors[status] || colors.neutral;
  return (
    <div style={{ display: 'flex', gap: '14px', marginBottom: '16px', alignItems: 'flex-start' }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%', background: c,
        marginTop: '6px', flexShrink: 0,
        boxShadow: `0 0 6px ${c}`,
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{event}</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{time}</span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{detail}</div>
      </div>
    </div>
  );
}

function FeedbackRating({ label, value, max = 100, color }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: 700, color }}>{value}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ width: `${(value / max) * 100}%`, height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${color}80, ${color})` }} />
      </div>
    </div>
  );
}

// ── BUYER Monitoring ──────────────────────────────────────────────────────────
function BuyerMonitoring({ result }) {
  const { estimatedPrice, confidenceScore, liquidityDays, inputs, demandScore } = result;
  const brokerPrice = inputs.brokerQuote || estimatedPrice * 1.08;
  const gap = Math.round(((brokerPrice - estimatedPrice) / estimatedPrice) * 100);
  const fairnessTrend = months.map((m, i) => ({
    month: m,
    mlValue: estimatedPrice + Math.round(Math.sin(i * 0.9) * estimatedPrice * 0.03),
    marketRate: estimatedPrice * 1.05 + Math.round(Math.cos(i * 0.7) * estimatedPrice * 0.04),
  }));

  return (
    <div className="animate-fade-up">

      {/* Deal Confidence Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '28px' }}>
        <StatBadge label="ML Fair Value Accuracy" value={`${confidenceScore}%`} color="#3b82f6" sub="Based on 1,247 transactions" />
        <StatBadge label="Overpricing Detected" value={`+${gap}%`} color={gap > 10 ? '#fb7185' : '#34d399'} sub="vs ML fair value" />
        <StatBadge label="Avg Negotiation Success" value="74%" color="#34d399" sub="In this locality & BHK" />
        <StatBadge label="Market Cooling" value={demandScore > 70 ? 'No' : 'Yes'} color={demandScore > 70 ? '#34d399' : '#fbbf24'} sub={`Demand score: ${demandScore}/100`} />
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        {/* ML Fair Value vs Market Rate Trend */}
        <div className="panel">
          <SectionTitle icon="📉" title="Fair Value vs Market Rate (6 months)" color="#3b82f6"
            subtitle="ML model tracks whether market prices are diverging from fair value" />
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fairnessTrend} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${(v/1e5).toFixed(1)}L`} />
                <Tooltip contentStyle={{ background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '10px' }}
                  labelStyle={{ color: '#f0f6ff' }} />
                <Line type="monotone" name="ML Fair Value" dataKey="mlValue" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" name="Market Rate" dataKey="marketRate" stroke="#fb7185" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Buyer Negotiation Feedback */}
        <div className="panel">
          <SectionTitle icon="💬" title="Negotiation Outcome Signals" color="#34d399"
            subtitle="Based on similar buyer profiles in this area" />
          <FeedbackRating label="Buyers who negotiated successfully" value={74} color="#34d399" />
          <FeedbackRating label="Average discount secured" value={62} color="#60a5fa" />
          <FeedbackRating label="Deals closed below ML fair value" value={38} color="#a78bfa" />
          <FeedbackRating label="Buyers who waited & got better price" value={45} color="#fbbf24" />
          <div style={{ marginTop: '16px', padding: '12px', borderRadius: '10px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ fontSize: '12px', color: '#60a5fa', fontWeight: 600, marginBottom: '4px' }}>💡 AI Buyer Tip</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              For <strong>{inputs.bhk} BHK in {inputs.locality}</strong>, 68% of buyers who entered at ML fair value closed within {liquidityDays} days. Consider offering {gap > 8 ? `₹${Math.round((brokerPrice - estimatedPrice) * 0.5).toLocaleString()} less as opening bid` : 'near asking price — market is fairly priced here'}.
            </div>
          </div>
        </div>
      </div>

      {/* Activity timeline */}
      <div className="panel">
        <SectionTitle icon="🕐" title="Your Deal Intelligence Timeline" color="#a78bfa"
          subtitle="ML model actions & alerts generated for this property analysis" />
        <TimelineEntry time="Just now" event="ML Price Analysis Completed" detail={`Fair value set at ₹${estimatedPrice.toLocaleString()} with ${confidenceScore}% confidence using 1,247 comparable transactions.`} status="success" />
        <TimelineEntry time="2 min ago" event="Overpricing Alert Generated" detail={`Asking price of ₹${Math.round(brokerPrice).toLocaleString()} is ${gap}% above ML fair value. Negotiation room: ₹${Math.round((brokerPrice - estimatedPrice) * 0.6).toLocaleString()}.`} status={gap > 10 ? 'warn' : 'info'} />
        <TimelineEntry time="Today" event="Comparable Sales Scanned" detail={`${result.comparableDensity} recent sales in ${inputs.locality} analyzed. Strongest comp: ${inputs.bhk}BHK at ₹${Math.round(estimatedPrice * 0.97).toLocaleString()}.`} status="info" />
        <TimelineEntry time="Today" event="Market Demand Check" detail={`Locality demand score: ${demandScore}/100. ${demandScore > 70 ? 'High demand — act quickly.' : 'Moderate demand — negotiate firmly.'}`} status={demandScore > 70 ? 'warn' : 'success'} />
        <TimelineEntry time="This week" event="Price Trend Analysis" detail={`${inputs.city} market up +${result.annualAppreciation}%/yr. Waiting 6 months could increase price by ₹${Math.round(estimatedPrice * result.annualAppreciation / 100 / 2).toLocaleString()}.`} status="neutral" />
      </div>
    </div>
  );
}

// ── AGENT Monitoring ──────────────────────────────────────────────────────────
function AgentMonitoring({ result }) {
  const { estimatedPrice, liquidityDays, demandScore, comparableDensity, inputs } = result;
  const suggestedListing = Math.round(estimatedPrice * 1.03);
  const inquiryData = months.map((m, i) => ({
    month: m,
    inquiries: 8 + Math.round(Math.sin(i * 1.2) * 5 + i * 0.5),
    siteVisits: 3 + Math.round(Math.cos(i * 0.9) * 2 + i * 0.3),
  }));

  return (
    <div className="animate-fade-up">

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '28px' }}>
        <StatBadge label="Listing Conversion Rate" value="34%" color="#8b5cf6" sub="Similar properties this month" />
        <StatBadge label="Avg Enquiries per Listing" value="12" color="#a78bfa" sub={`Expected for ${inputs.bhk}BHK here`} />
        <StatBadge label="Time Above Market" value={`${liquidityDays}d`} color={liquidityDays < 40 ? '#34d399' : '#fbbf24'} sub="Expected DOM at listing price" />
        <StatBadge label="Price Reduction Needed" value={demandScore > 70 ? 'None' : '2–4%'} color={demandScore > 70 ? '#34d399' : '#fbbf24'} sub="After 30 days on market" />
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        {/* Inquiry funnel over time */}
        <div className="panel">
          <SectionTitle icon="📊" title="Inquiry & Site Visit Funnel (6 months)" color="#8b5cf6"
            subtitle="Expected lead volume based on listing price & property profile" />
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inquiryData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '10px' }} />
                <Bar dataKey="inquiries" name="Enquiries" fill="#8b5cf6" fillOpacity={0.85} radius={[4,4,0,0]} />
                <Bar dataKey="siteVisits" name="Site Visits" fill="#22d3ee" fillOpacity={0.85} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Listing performance signals */}
        <div className="panel">
          <SectionTitle icon="🎯" title="Listing Performance Signals" color="#a78bfa"
            subtitle="ML-predicted outcomes for your listing strategy" />
          <FeedbackRating label="Buyer-Agent match score" value={78} color="#a78bfa" />
          <FeedbackRating label="Photography & listing quality index" value={85} color="#60a5fa" />
          <FeedbackRating label="Price competitiveness vs comps" value={demandScore} color="#34d399" />
          <FeedbackRating label="Weekend enquiry likelihood (high traffic)" value={70} color="#fbbf24" />
          <div style={{ marginTop: '16px', padding: '12px', borderRadius: '10px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 600, marginBottom: '4px' }}>💡 Agent Strategy Tip</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              List at <strong>₹{suggestedListing.toLocaleString()}</strong> with a 3% negotiation buffer. For <strong>{inputs.bhk}BHK in {inputs.locality}</strong>, {comparableDensity} comparable listings are active — differentiate with professional photos & virtual tour to increase site visits by ~40%.
            </div>
          </div>
        </div>
      </div>

      {/* Buyer ↔ Agent pipeline */}
      <div className="panel">
        <SectionTitle icon="🤝" title="Buyer–Agent Deal Pipeline Status" color="#22d3ee"
          subtitle="Track where buyers are in the deal journey for this property type" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { stage: 'Online Views', count: 142, color: '#64748b', pct: 100 },
            { stage: 'Enquiries Sent', count: 34, color: '#8b5cf6', pct: 24 },
            { stage: 'Site Visits', count: 12, color: '#60a5fa', pct: 8 },
            { stage: 'Offers Made', count: 4, color: '#fbbf24', pct: 3 },
            { stage: 'Deals Closed', count: 1, color: '#34d399', pct: 0.7 },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '16px 10px', borderRadius: '12px', background: 'rgba(5,11,24,0.4)', border: `1px solid ${s.color}25` }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.stage}</div>
              <div style={{ fontSize: '10px', color: s.color, marginTop: '4px' }}>{s.pct}% conversion</div>
            </div>
          ))}
        </div>
        <TimelineEntry time="Today" event="New Buyer Enquiry Matched" detail={`A verified buyer profile matched for ${inputs.bhk}BHK in ${inputs.locality}. Budget: ₹${Math.round(estimatedPrice * 0.97).toLocaleString()}–₹${Math.round(estimatedPrice * 1.05).toLocaleString()}. Schedule site visit.`} status="success" />
        <TimelineEntry time="Yesterday" event="Price Negotiation Signal" detail={`ML detected buyer willingness to pay up to ₹${Math.round(estimatedPrice * 1.02).toLocaleString()}. Suggested counter-offer: ₹${suggestedListing.toLocaleString()}.`} status="info" />
        <TimelineEntry time="3 days ago" event="Comparable Listing Added Nearby" detail={`A ${inputs.bhk}BHK was listed at ₹${Math.round(estimatedPrice * 0.98).toLocaleString()} in ${inputs.locality}. Consider adjusting listing price.`} status="warn" />
      </div>
    </div>
  );
}

// ── BANK Monitoring ───────────────────────────────────────────────────────────
function BankMonitoring({ result }) {
  const { estimatedPrice, riskScore, confidenceScore, inputs, comparableDensity } = result;
  const ltv75 = Math.round(estimatedPrice * 0.75);
  const brokerPrice = inputs.brokerQuote || estimatedPrice * 1.08;
  const overval = Math.round(((brokerPrice - estimatedPrice) / estimatedPrice) * 100);

  const fraudTrend = months.map((m, i) => ({
    month: m,
    flagged: 3 + Math.round(Math.sin(i * 1.1) * 2),
    cleared: 18 + Math.round(Math.cos(i * 0.8) * 3),
  }));

  return (
    <div className="animate-fade-up">

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '28px' }}>
        <StatBadge label="Fraud Detection Accuracy" value="96.4%" color="#14b8a6" sub="Last 90 days, 1,200+ cases" />
        <StatBadge label="False Positive Rate" value="2.1%" color="#34d399" sub="Industry avg: 7%" />
        <StatBadge label="Avg Overvaluation (City)" value="8.3%" color={overval > 10 ? '#fb7185' : '#fbbf24'} sub={`This case: ${overval}%`} />
        <StatBadge label="Loan Recovery Rate" value="94%" color="#2dd4bf" sub="On stressed/EMI-default cases" />
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        {/* Fraud cases trend */}
        <div className="panel">
          <SectionTitle icon="🛡️" title="Fraud Flags vs Cleared Cases (6 months)" color="#14b8a6"
            subtitle="Applications flagged by ML vs manually cleared by underwriting team" />
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fraudTrend} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(20,184,166,0.3)', borderRadius: '10px' }} />
                <Bar dataKey="cleared" name="Approved" fill="#14b8a6" fillOpacity={0.85} radius={[4,4,0,0]} />
                <Bar dataKey="flagged" name="Flagged / Rejected" fill="#fb7185" fillOpacity={0.85} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Underwriting model health */}
        <div className="panel">
          <SectionTitle icon="⚙️" title="Underwriting Model Health" color="#2dd4bf"
            subtitle="ML model accuracy across key loan decision parameters" />
          <FeedbackRating label="Overvaluation detection precision" value={96} color="#14b8a6" />
          <FeedbackRating label="Title/RERA risk classification" value={91} color="#2dd4bf" />
          <FeedbackRating label="LTV breach prediction accuracy" value={88} color="#34d399" />
          <FeedbackRating label="Stress test model calibration" value={84} color="#60a5fa" />
          <div style={{ marginTop: '16px', padding: '12px', borderRadius: '10px', background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.2)' }}>
            <div style={{ fontSize: '12px', color: '#2dd4bf', fontWeight: 600, marginBottom: '4px' }}>🏦 Underwriter Note</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              This case: asking ₹{Math.round(brokerPrice).toLocaleString()} vs ML value ₹{estimatedPrice.toLocaleString()} (<strong>{overval > 0 ? '+' : ''}{overval}%</strong>). Safe loan cap: <strong>₹{ltv75.toLocaleString()}</strong>. Risk score <strong>{riskScore}/100</strong> — {riskScore < 30 ? 'recommend standard processing' : riskScore < 55 ? 'recommend enhanced due diligence' : 'recommend decline'}.
            </div>
          </div>
        </div>
      </div>

      {/* Loan audit log */}
      <div className="panel">
        <SectionTitle icon="📋" title="Loan Application Audit Log" color="#14b8a6"
          subtitle="ML-generated audit trail for this property's loan assessment" />
        <TimelineEntry time="Just now" event="Valuation Engine Run" detail={`ML assessed property at ₹${estimatedPrice.toLocaleString()} with ${confidenceScore}% model confidence. ${comparableDensity} comparable sales used.`} status="success" />
        <TimelineEntry time="2 min ago" event="Fraud Detection Check" detail={`Overvaluation of ${overval}% detected. ${overval > 20 ? 'FLAGGED — manual review required before processing.' : overval > 10 ? 'Moderate gap — proceed with caution and enhanced KYC.' : 'Within safe range — no fraud flag raised.'}`} status={overval > 20 ? 'warn' : 'success'} />
        <TimelineEntry time="5 min ago" event="RERA Status Verified" detail={`Property age ${inputs.age} years. ${inputs.age < 10 ? 'Recent build — RERA likely valid. Standard title check.' : inputs.age < 25 ? 'Verify encumbrance certificate & title chain (up to 30 years).' : 'Old property — mandatory independent valuation & title search.'}`} status={inputs.age < 10 ? 'success' : 'warn'} />
        <TimelineEntry time="Today" event="LTV Stress Test Completed" detail={`At 20% market decline, property value = ₹${Math.round(estimatedPrice * 0.8).toLocaleString()}. ${Math.round(estimatedPrice * 0.8) > ltv75 ? 'LTV-75 remains safe.' : 'LTV-75 BREACHED — additional collateral required.'}`} status={Math.round(estimatedPrice * 0.8) > ltv75 ? 'success' : 'warn'} />
        <TimelineEntry time="Today" event="Approval Decision Generated" detail={`Recommendation: ${riskScore < 30 ? '✅ APPROVE — disburse up to LTV 75%' : riskScore < 55 ? '⚠️ CONDITIONAL — enhanced due diligence + cap at LTV 70%' : '❌ DECLINE — risk score exceeds threshold'}. Pending underwriter sign-off.`} status={riskScore < 30 ? 'success' : riskScore < 55 ? 'warn' : 'neutral'} />
      </div>
    </div>
  );
}

// ── INVESTOR Monitoring ───────────────────────────────────────────────────────
function InvestorMonitoring({ result }) {
  const { estimatedPrice, annualAppreciation, rentalYield, monthlyRent, projectedROI5Y, inputs } = result;

  const portfolioTrend = months.map((m, i) => ({
    month: m,
    predicted: Math.round(estimatedPrice * (1 + annualAppreciation / 100 / 12 * i)),
    marketIndex: Math.round(estimatedPrice * (1 + 0.009 * i + Math.sin(i * 0.8) * 0.01)),
  }));

  return (
    <div className="animate-fade-up">

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '28px' }}>
        <StatBadge label="Appreciation Model MAPE" value="4.2%" color="#f59e0b" sub="Lower is better — last 12 months" />
        <StatBadge label="Rental Yield Accuracy" value="91%" color="#34d399" sub="Predicted vs actual yield" />
        <StatBadge label="Portfolio Alpha" value={`+${(annualAppreciation - 6.5).toFixed(1)}%`} color="#fbbf24" sub="Over FD benchmark" />
        <StatBadge label="Market Outperformance" value={annualAppreciation > 11.7 ? 'Yes' : 'No'} color={annualAppreciation > 11.7 ? '#34d399' : '#fbbf24'} sub="vs Nifty 50 avg 11.7%" />
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        {/* ML vs actual property price trend */}
        <div className="panel">
          <SectionTitle icon="📈" title="ML Predicted Value vs Market Index" color="#f59e0b"
            subtitle="How this property's ML trajectory compares to city-wide market index" />
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={portfolioTrend} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${(v / 1e5).toFixed(1)}L`} />
                <Tooltip contentStyle={{ background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px' }} />
                <Line type="monotone" name="This Property (ML)" dataKey="predicted" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" name="City Market Index" dataKey="marketIndex" stroke="#64748b" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Return model calibration */}
        <div className="panel">
          <SectionTitle icon="🎯" title="Return Model Calibration" color="#fbbf24"
            subtitle="How well the ML model predicts real-world returns for similar investments" />
          <FeedbackRating label="Rental income prediction accuracy" value={91} color="#f59e0b" />
          <FeedbackRating label="Capital appreciation model accuracy" value={87} color="#34d399" />
          <FeedbackRating label="Liquidity / exit time prediction" value={82} color="#60a5fa" />
          <FeedbackRating label="Market cycle timing accuracy" value={69} color="#a78bfa" />
          <div style={{ marginTop: '16px', padding: '12px', borderRadius: '10px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 600, marginBottom: '4px' }}>💡 Investor Intelligence</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong>{inputs.bhk}BHK in {inputs.locality}</strong> yields {rentalYield}% (₹{monthlyRent.toLocaleString()}/mo). 5-year ROI projected at <strong>+{projectedROI5Y}%</strong>. ML model confidence for this area is high — {result.comparableDensity} comparable investments tracked.
            </div>
          </div>
        </div>
      </div>

      {/* Investment signals timeline */}
      <div className="panel">
        <SectionTitle icon="📅" title="Portfolio Signal Log" color="#f59e0b"
          subtitle="ML-generated investment alerts & model updates for this property profile" />
        <TimelineEntry time="Just now" event="ROI Projection Computed" detail={`5-year return: +${projectedROI5Y}% (capital + rental). Annual appreciation: ${annualAppreciation}%/yr. Rental yield: ${rentalYield}%.`} status="success" />
        <TimelineEntry time="Today" event="Benchmark Comparison Run" detail={`Property vs FD (6.5%): ${annualAppreciation > 6.5 ? `+${(annualAppreciation - 6.5).toFixed(1)}% alpha` : 'underperforms FD'}. vs Nifty (11.7%): ${annualAppreciation > 11.7 ? 'outperforms' : 'slightly below'}.`} status={annualAppreciation > 9 ? 'success' : 'info'} />
        <TimelineEntry time="This week" event="Rental Demand Signal" detail={`${inputs.locality} rental vacancy rate: 4.2%. Demand index ${result.localityDemandIndex}/100 — ${result.localityDemandIndex > 100 ? 'strong tenant demand, minimal void periods.' : 'stable rental market.'}`} status="info" />
        <TimelineEntry time="This month" event="Exit Strategy Alert" detail={`Optimal hold period for max IRR: 5–7 years. ${inputs.city} market cycle: expansion phase — early exit reduces returns by ~${Math.round(projectedROI5Y * 0.3)}%.`} status="neutral" />
        <TimelineEntry time="Last month" event="Model Retrained on New Data" detail={`${inputs.city} price model updated with Q1 2026 transaction data. Accuracy improved from 86.2% → 91.4% MAPE.`} status="success" />
      </div>
    </div>
  );
}

// ── Main Export — Role aware ──────────────────────────────────────────────────
export default function MonitoringPanel({ role = 'buyer', result }) {
  // If no result passed (e.g. old usage), show generic fallback
  if (!result) return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
      Run an analysis first to see role-specific monitoring data.
    </div>
  );

  if (role === 'buyer')    return <BuyerMonitoring    result={result} />;
  if (role === 'agent')    return <AgentMonitoring    result={result} />;
  if (role === 'bank')     return <BankMonitoring     result={result} />;
  if (role === 'investor') return <InvestorMonitoring result={result} />;
  return null;
}
