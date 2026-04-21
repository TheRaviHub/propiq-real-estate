// src/components/TCOCalculator.jsx
// Total Cost of Ownership — the real cost of buying + owning a property
import { useState } from 'react';
import { formatINR, STAMP_DUTY_RATES } from '../mlEngine';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const RBI_REPO_RATE = 6.50; // April 2026
const HOME_LOAN_RATE = RBI_REPO_RATE + 2.15; // Typical spread = 8.65%

function Stat({ label, value, sub, color = '#60a5fa', warn = false }) {
  return (
    <div style={{
      padding: '16px 18px', borderRadius: '14px',
      background: warn ? 'rgba(244,63,94,0.05)' : 'rgba(5,11,24,0.5)',
      border: `1px solid ${warn ? 'rgba(244,63,94,0.2)' : 'rgba(255,255,255,0.06)'}`,
    }}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color, lineHeight: 1, marginBottom: sub ? '4px' : 0 }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{sub}</div>}
    </div>
  );
}

function SliderRow({ label, value, min, max, step, onChange, format, id, color = '#3b82f6' }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: 700, color }}>{format(value)}</span>
      </div>
      <input type="range" id={id} min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ accentColor: color, width: '100%' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

export default function TCOCalculator({ result }) {
  const { estimatedPrice, monthlyRent, inputs } = result;
  const brokerPrice = inputs.brokerQuote || estimatedPrice * 1.08;
  const propertyValue = Math.round(brokerPrice); // Use actual asking price for TCO

  // State-wise stamp duty
  const stampDutyRate = STAMP_DUTY_RATES[inputs.state] || 6.0;
  const isUnderConstruction = inputs.age === 0;

  // Interactive state
  const [loanPct,     setLoanPct]     = useState(75);
  const [interestRate, setInterestRate] = useState(+HOME_LOAN_RATE.toFixed(2));
  const [tenure,       setTenure]      = useState(20);
  const [brokeragePct, setBrokeragePct] = useState(2);
  const [maintenance,  setMaintenance]  = useState(Math.round(monthlyRent * 0.12));
  const [underConst,   setUnderConst]   = useState(isUnderConstruction);

  // ── Computed values ──────────────────────────────────────────────────
  const loanAmount    = Math.round(propertyValue * loanPct / 100);
  const downPayment   = propertyValue - loanAmount;

  // Stamp Duty & Registration
  const stampDuty     = Math.round(propertyValue * stampDutyRate / 100);
  const registration  = Math.min(Math.round(propertyValue * 0.01), 30000); // 1%, capped at ₹30K in most states
  const gst           = underConst ? Math.round(propertyValue * 0.05) : 0;
  const brokerage     = Math.round(propertyValue * brokeragePct / 100);
  const loanProcessing = Math.round(Math.min(loanAmount * 0.005, 15000)); // 0.5% or ₹15K max
  const interiorSetup  = Math.round(inputs.area * 600); // ₹600/sqft average interior

  // Total move-in cost
  const moveInCost = propertyValue + stampDuty + registration + gst + brokerage + loanProcessing + interiorSetup;

  // EMI calculation
  const monthlyRate = interestRate / 100 / 12;
  const n           = tenure * 12;
  const emi         = monthlyRate > 0
    ? Math.round(loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n) / (Math.pow(1 + monthlyRate, n) - 1))
    : Math.round(loanAmount / n);

  const propertyTax    = Math.round(propertyValue * 0.0007); // ~0.07% of value annually
  const totalMonthlyCost = emi + maintenance + Math.round(propertyTax / 12);
  const totalInterestPaid = emi * n - loanAmount;

  // 10-year total cost
  const tenYearEMI          = emi * 12 * Math.min(tenure, 10);
  const tenYearMaintenance  = maintenance * 12 * 10 * 1.06 ** 5; // 6% annual increase
  const tenYearPropertyTax  = propertyTax * 10;
  const tenYearTotalCost    = downPayment + stampDuty + registration + gst + brokerage +
                              loanProcessing + interiorSetup + tenYearEMI + tenYearMaintenance + tenYearPropertyTax;

  // Rent vs Buy comparison
  const tenYearRent = monthlyRent * 12 * ((1.08 ** 10 - 1) / 0.08); // 8% annual rent increase
  const propertyValueIn10Y = Math.round(propertyValue * (1 + result.annualAppreciation / 100) ** 10);
  const netCostOfBuying    = tenYearTotalCost - propertyValueIn10Y; // after selling

  // Bar chart data
  const barData = [
    { name: 'Property Price', value: propertyValue, color: '#60a5fa' },
    { name: 'Stamp Duty & Reg', value: stampDuty + registration, color: '#f97316' },
    ...(gst > 0 ? [{ name: 'GST (5%)', value: gst, color: '#8b5cf6' }] : []),
    { name: 'Brokerage', value: brokerage, color: '#fbbf24' },
    { name: 'Interior Setup', value: interiorSetup, color: '#34d399' },
    { name: 'Loan Processing', value: loanProcessing, color: '#94a3b8' },
  ];

  return (
    <div className="panel" style={{ marginTop: '28px' }}>
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-title-icon" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>🏦</div>
          Total Cost of Ownership Calculator
        </div>
        <span className="info-chip">Interactive · {inputs.state}</span>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
        {inputs.brokerQuote ? (
          <>The broker says <strong style={{ color: '#fb7185' }}>{formatINR(propertyValue)}</strong> — but that's just the start.</>
        ) : (
          <>The ML Fair Value is <strong style={{ color: '#60a5fa' }}>{formatINR(propertyValue)}</strong> — but that's just the start.</>
        )}
        <br />Here's <strong>every rupee you'll actually spend</strong> to buy and own this property.
      </p>

      {/* Under construction toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => setUnderConst(!underConst)}
          style={{
            padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            background: underConst ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${underConst ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.1)'}`,
            color: underConst ? '#a78bfa' : 'var(--text-secondary)',
          }}
        >
          🏗 Under Construction (GST 5% applies)
        </button>
        {underConst && <span style={{ fontSize: '12px', color: '#a78bfa' }}>GST of {formatINR(gst)} will be added</span>}
      </div>

      {/* Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div>
          <SliderRow id="sl-loan"     label="Loan Amount (% of property)" value={loanPct}     min={0}   max={90}  step={5}    onChange={setLoanPct}     format={v => `${v}%`}        color="#3b82f6" />
          <SliderRow id="sl-rate"     label="Home Loan Interest Rate"      value={interestRate} min={7.5} max={12}  step={0.05} onChange={setInterestRate} format={v => `${v.toFixed(2)}%`} color="#8b5cf6" />
          <SliderRow id="sl-tenure"   label="Loan Tenure"                  value={tenure}      min={5}   max={30}  step={1}    onChange={setTenure}      format={v => `${v} yrs`}     color="#60a5fa" />
        </div>
        <div>
          <SliderRow id="sl-broker"   label="Brokerage / Agent Fee"        value={brokeragePct} min={0} max={3}   step={0.5}  onChange={setBrokeragePct} format={v => `${v}%`}        color="#fbbf24" />
          <SliderRow id="sl-maint"    label="Monthly Maintenance"          value={maintenance}  min={0} max={Math.round(monthlyRent * 0.3)} step={500}  onChange={setMaintenance}  format={v => `₹${v.toLocaleString()}`} color="#34d399" />
        </div>
      </div>

      {/* Move-in cost bar chart */}
      <div className="panel" style={{ marginBottom: '24px', background: 'rgba(5,11,24,0.3)' }}>
        <div className="panel-header">
          <div className="panel-title" style={{ fontSize: '14px' }}>💸 Move-In Cost Breakdown</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: '#fb7185' }}>
            {formatINR(moveInCost)}
          </span>
        </div>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 4, right: 60, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v/1e5).toFixed(0)}L`} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={130} />
              <Tooltip 
                contentStyle={{ background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(100,160,255,0.2)', borderRadius: '10px' }}
                itemStyle={{ color: '#f8fafc', fontWeight: 600 }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                formatter={v => [formatINR(v), 'Cost']} 
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {barData.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly cost snapshot */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '24px' }}>
        <Stat label="Monthly EMI" value={formatINR(emi)} sub={`₹${loanAmount.toLocaleString()} loan × ${tenure}yr`} color="#60a5fa" />
        <Stat label="Maintenance" value={`₹${maintenance.toLocaleString()}`} sub="Society + upkeep" color="#34d399" />
        <Stat label="Property Tax" value={formatINR(Math.round(propertyTax / 12))} sub="Per month (annual ÷12)" color="#fbbf24" />
        <Stat label="Total Monthly Out" value={formatINR(totalMonthlyCost)} sub="EMI + maintenance + tax" color="#fb7185" warn />
      </div>

      {/* Full cost summary table */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '14px' }}>
          📋 Complete Cost Summary
        </div>
        <div style={{ background: 'rgba(5,11,24,0.4)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
          {[
            { label: 'Property Price (Broker Asking)', value: propertyValue, color: 'var(--text-primary)', bold: false },
            { label: `Stamp Duty (${stampDutyRate}% — ${inputs.state})`, value: stampDuty, color: '#f97316', bold: false },
            { label: 'Registration Charges (1%)', value: registration, color: '#f97316', bold: false },
            ...(gst > 0 ? [{ label: 'GST (5% — Under Construction)', value: gst, color: '#8b5cf6', bold: false }] : []),
            { label: `Brokerage / Agent Fee (${brokeragePct}%)`, value: brokerage, color: '#fbbf24', bold: false },
            { label: 'Loan Processing Fee', value: loanProcessing, color: '#94a3b8', bold: false },
            { label: `Interior Setup (₹600 × ${inputs.area.toLocaleString()} sqft est.)`, value: interiorSetup, color: '#34d399', bold: false },
            { label: '✅ Total to Move In', value: moveInCost, color: '#60a5fa', bold: true },
            { label: `Total Interest Over ${tenure} Years`, value: totalInterestPaid, color: '#fb7185', bold: false },
            { label: `10-Year Total Cost of Ownership`, value: Math.round(tenYearTotalCost), color: '#a78bfa', bold: true },
          ].map((row, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '11px 16px',
              borderBottom: i < 9 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              background: row.bold ? 'rgba(255,255,255,0.03)' : 'transparent',
            }}>
              <span style={{ fontSize: '13px', color: row.bold ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: row.bold ? 700 : 400 }}>
                {row.label}
              </span>
              <span style={{ fontFamily: row.bold ? 'var(--font-display)' : 'inherit', fontSize: row.bold ? '16px' : '14px', fontWeight: row.bold ? 800 : 600, color: row.color }}>
                {formatINR(row.value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rent vs Buy */}
      <div style={{
        padding: '18px 20px', borderRadius: '14px', marginBottom: '16px',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.05))',
        border: '1px solid rgba(59,130,246,0.2)',
      }}>
        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '12px' }}>
          🤔 Rent vs Buy — 10-Year Reality Check
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Total 10-yr Rent Cost</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: '#fbbf24' }}>{formatINR(Math.round(tenYearRent))}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>At ₹{monthlyRent.toLocaleString()}/mo + 8% annual rise</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Property Value in 10yr</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: '#34d399' }}>{formatINR(propertyValueIn10Y)}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>At +{result.annualAppreciation}%/yr appreciation</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Net Cost of Buying</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: netCostOfBuying < tenYearRent ? '#34d399' : '#fb7185' }}>
              {netCostOfBuying < 0 ? 'Profit!' : formatINR(Math.round(netCostOfBuying))}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>All costs minus resale value</div>
          </div>
        </div>
        <div style={{ marginTop: '14px', fontSize: '12px', color: netCostOfBuying < tenYearRent ? '#34d399' : '#fbbf24',
          padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {netCostOfBuying < tenYearRent
            ? `✅ Buying is better: net cost of owning (${formatINR(Math.round(netCostOfBuying))}) is lower than 10-year rent (${formatINR(Math.round(tenYearRent))}). You also build equity.`
            : `⚠️ High cost market: renting saves ~${formatINR(Math.round(netCostOfBuying - tenYearRent))} over 10 years here. But buying builds equity — consider your long-term plans.`}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        ℹ️ <strong style={{ color: 'var(--text-secondary)' }}>Data Sources:</strong> Stamp duty rate from {inputs.state} government schedule.
        RBI repo rate: {RBI_REPO_RATE}% (April 2026). Home loan rate: repo + 2.15% = {HOME_LOAN_RATE.toFixed(2)}%.
        Property tax: ~0.07% of value annually (varies by municipality). Interior cost: ₹600/sqft standard estimate.
        Maintenance: user-adjustable. This is an estimate — consult a CA/lawyer before finalising.
      </div>
    </div>
  );
}
