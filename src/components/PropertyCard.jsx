// src/components/PropertyCard.jsx
// Displays exactly which property was analysed — shown in results header
export default function PropertyCard({ result }) {
  const { inputs } = result;
  const facingEmoji = {
    North: '⬆', 'North-East': '↗', East: '➡', 'South-East': '↘',
    South: '⬇', 'South-West': '↙', West: '⬅', 'North-West': '↖',
  };

  const chips = [
    inputs.propertyType && { label: inputs.propertyType, icon: '🏠' },
    inputs.bhk          && { label: `${inputs.bhk} BHK`, icon: '🛏' },
    inputs.area         && { label: `${inputs.area.toLocaleString()} sqft`, icon: '📐' },
    inputs.carpetArea   && { label: `Carpet: ${inputs.carpetArea.toLocaleString()} sqft`, icon: '🟦' },
    inputs.floor != null && inputs.totalFloors && { label: `Floor ${inputs.floor}/${inputs.totalFloors}`, icon: '🏢' },
    inputs.facing       && { label: `${facingEmoji[inputs.facing] || ''} ${inputs.facing}`, icon: null },
    inputs.bathrooms    && { label: `${inputs.bathrooms} Bath`, icon: '🚿' },
    inputs.balconies != null && { label: `${inputs.balconies} Balcon${inputs.balconies === 1 ? 'y' : 'ies'}`, icon: '🌿' },
    inputs.gatedSociety === true  && { label: 'Gated Society', icon: '🔒' },
    inputs.liftAvailable === true && { label: 'Lift', icon: '🛗' },
    inputs.cornerUnit === true    && { label: 'Corner Unit', icon: '📐' },
    inputs.parking === true       && { label: 'Parking', icon: '🅿' },
    inputs.furnished && { label: inputs.furnished, icon: '🛋' },
  ].filter(Boolean);

  return (
    <div style={{
      padding: '20px 24px', borderRadius: '16px', marginBottom: '24px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.07)',
    }}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
        🏠 Property Analysed
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
        {inputs.societyName || `${inputs.propertyType || 'Property'} in ${inputs.locality}`}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
        📍 {[inputs.locality, inputs.city, inputs.state].filter(Boolean).join(', ')}
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {chips.map((chip, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 500,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--text-secondary)',
          }}>
            {chip.icon && <span>{chip.icon}</span>}
            {chip.label}
          </span>
        ))}
        {inputs.amenities?.length > 0 && (
          <span style={{
            padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 500,
            background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
            color: '#34d399',
          }}>
            +{inputs.amenities.length} Amenities
          </span>
        )}
      </div>
    </div>
  );
}
