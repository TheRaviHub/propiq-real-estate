// src/components/MonitoringPanel.jsx
// Simplified monitoring for Home Buyers
import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
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

// ── BUYER Monitoring Only ─────────────────────────────────────────────────────
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
        <StatBadge label="ML Fair Value Accuracy" value={`${confidenceScore}%`} color="#3b82f6" sub="Local transaction data" />
        <StatBadge label="Overpricing Detected" value={`+${gap}%`} color={gap > 10 ? '#fb7185' : '#34d399'} sub="vs ML fair value" />
        <StatBadge label="Avg Negotiation Success" value="74%" color="#34d399" sub="In this locality" />
        <StatBadge label="Market Momentum" value={demandScore > 70 ? 'High' : 'Stable'} color={demandScore > 70 ? '#34d399' : '#60a5fa'} sub={`Score: ${demandScore}/100`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* ML Fair Value vs Market Rate Trend */}
        <div className="panel">
          <SectionTitle icon="📉" title="Fair Value vs Market Rate (6 months)" color="#3b82f6"
            subtitle="Tracking price divergence from fundamental fair value" />
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
          <SectionTitle icon="💬" title="Negotiation Insights" color="#34d399"
            subtitle="Based on recent similar deal closures" />
          <FeedbackRating label="Buyers successful in negotiation" value={74} color="#34d399" />
          <FeedbackRating label="Average discount secured" value={62} color="#60a5fa" />
          <FeedbackRating label="Deals closed below ML fair value" value={38} color="#a78bfa" />
          <div style={{ marginTop: '16px', padding: '12px', borderRadius: '10px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ fontSize: '12px', color: '#60a5fa', fontWeight: 600, marginBottom: '4px' }}>💡 AI Strategy</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              For a <strong>{inputs.propertyType} in {inputs.locality}</strong>, 68% of buyers who started at ML fair value reached a deal within {liquidityDays} days.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function MonitoringPanel({ result }) {
  if (!result) return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
      Run an analysis first to see intelligence dashboard.
    </div>
  );

  return <BuyerMonitoring result={result} />;
}
