// src/components/ExplainabilityPanel.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Info, Zap, MapPin, Building, Layout, Maximize, Clock, Compass, Shield, Sofa, Layers, Star } from 'lucide-react';

const COLORS_POS = ['#4f46e5', '#6366f1', '#818cf8', '#34d399', '#06b6d4', '#a78bfa'];
const COLORS_NEG = ['#f43f5e', '#fb923c'];

const FEATURE_META = {
  'Location & Demand': { icon: <MapPin size={14} />, desc: 'High desirability in this micro-market' },
  'City Base Price': { icon: <Building size={14} />, desc: 'Baseline value for this city and zone' },
  'Built-up Area': { icon: <Maximize size={14} />, desc: 'Large footprint boosts the overall value' },
  'Property Type': { icon: <Layout size={14} />, desc: 'Premium property configuration' },
  'Building Age': { icon: <Clock size={14} />, desc: 'Newer construction attracts a premium' },
  'Facing Direction': { icon: <Compass size={14} />, desc: 'Vastu-compliant/Preferred facing' },
  'Gated Society': { icon: <Shield size={14} />, desc: 'Added security and community benefits' },
  'Furnishing': { icon: <Sofa size={14} />, desc: 'Interior finish level impact' },
  'Floor Position': { icon: <Layers size={14} />, desc: 'Strategic floor level premium' },
  'Amenities': { icon: <Star size={14} />, desc: 'Impact of lifestyle facilities' },
  'Plot/Land Area': { icon: <Maximize size={14} />, desc: 'High land value component' },
  'Private Terrace': { icon: <Zap size={14} />, desc: 'Exclusive outdoor space premium' },
  'Independent Entry': { icon: <Shield size={14} />, desc: 'Privacy and accessibility boost' },
  'Managed Apartment': { icon: <Zap size={14} />, desc: 'Professional management premium' },
  'Private Pool': { icon: <Star size={14} />, desc: 'Luxury amenity high impact' },
  'Private Lift': { icon: <Layers size={14} />, desc: 'Exclusive vertical access premium' },
};

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    const meta = FEATURE_META[d.name] || { icon: <Zap size={14} />, desc: '' };
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(16px) saturate(180%)',
        padding: '20px',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.6)',
        minWidth: '240px',
        borderTop: '1px solid rgba(255, 255, 255, 0.3)', // Specular highlight
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ color: '#818cf8', filter: 'drop-shadow(0 0 4px rgba(129,140,248,0.4))' }}>{meta.icon}</span>
          <span style={{ fontWeight: '900', color: '#fff', fontSize: '15px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{d.name}</span>
        </div>
        <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '12px', lineHeight: '1.4', fontWeight: '500' }}>{meta.desc}</div>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '900', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          color: d.positive ? '#10b981' : '#fb7185',
          padding: '10px 14px',
          background: d.positive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
          borderRadius: '12px',
          border: `1px solid ${d.positive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
          boxShadow: `0 4px 12px ${d.positive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)'}`,
          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }}>
          {d.positive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {d.positive ? 'Price Boost: ' : 'Price Adjustment: '}{d.value}%
        </div>
      </div>
    );
  }
  return null;
}

export default function ExplainabilityPanel({ featureImportance }) {
  const data = featureImportance.map(f => ({ ...f, displayVal: f.value }));
  
  // Get top 3 most influential factors for the summary
  const topFactors = [...featureImportance].sort((a, b) => b.value - a.value).slice(0, 3);

  return (
    <div className="glass" style={{
      padding: '32px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', fontSize: '16px' }}>
          <div style={{ padding: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
            <Zap size={16} />
          </div>
          Price Confidence Engine
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ fontSize: '11px', padding: '4px 10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', color: '#94a3b8' }}>AI Verified</span>
          <span style={{ fontSize: '11px', padding: '4px 10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', color: '#94a3b8' }}>Real-time Data</span>
        </div>
      </div>

      {/* Top 3 Factors */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {topFactors.map((f, i) => {
          const meta = FEATURE_META[f.name] || { icon: <Zap size={14} />, desc: 'General property feature' };
          return (
            <div key={i} className="glass" style={{
              padding: '20px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'flex-start' }}>
                <div style={{ color: '#818cf8', padding: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                  {meta.icon}
                </div>
                <div style={{ 
                  fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px',
                  color: f.positive ? '#10b981' : '#f43f5e'
                }}>
                  {f.positive ? 'MAJOR BOOST' : 'REDUCTION'}
                </div>
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', color: '#fff' }}>{f.name}</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.4' }}>{meta.desc}</div>
              
              {/* Background Glow Effect */}
              <div style={{
                position: 'absolute', bottom: '-20px', right: '-20px', width: '60px', height: '60px',
                background: f.positive ? '#10b981' : '#f43f5e',
                filter: 'blur(30px)', opacity: 0.15, pointerEvents: 'none'
              }} />
            </div>
          );
        })}
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />

      {/* Chart */}
      <div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold', color: '#e2e8f0' }}>
            <Info size={14} color="#818cf8" />
            Detailed Value Breakdown
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
            RELATIVE IMPACT ANALYSIS
          </div>
        </div>

        <div style={{ height: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
              <XAxis
                type="number"
                hide
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="displayVal" radius={[0, 4, 4, 0]} barSize={16}>
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.positive ? COLORS_POS[index % COLORS_POS.length] : COLORS_NEG[index % COLORS_NEG.length]}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Footer Note */}
      <div className="glass" style={{ 
        padding: '20px',
        display: 'flex',
        gap: '12px',
        fontSize: '13px',
        color: '#94a3b8',
        lineHeight: '1.5'
      }}>
        <div style={{ color: '#818cf8', marginTop: '2px' }}><Info size={16} /></div>
        <div>
          <strong style={{ color: '#fff' }}>How to read this:</strong> Our AI Trust Engine analyzes millions of data points across your city. The values above represent how much each feature deviates from a "baseline" average property. High-demand areas and premium floor positions typically drive the largest gains.
        </div>
      </div>
    </div>
  );
}
