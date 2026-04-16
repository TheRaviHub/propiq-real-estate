// src/components/BuyerDashboard.jsx
import { formatINR } from '../mlEngine';

export default function BuyerDashboard({ result }) {
  const { estimatedPrice, confidenceScore, inputs } = result;

  const hasBrokerQuote = !!inputs.brokerQuote;
  const brokerPrice = inputs.brokerQuote ? Number(inputs.brokerQuote) : 0;
  
  // If no broker quote, use estimatedPrice to build the logical buckets
  const fairValue = estimatedPrice;
  const overpriceThreshold = fairValue * 1.06;
  const underpriceThreshold = fairValue * 0.94;

  const isFairDeal = hasBrokerQuote ? (brokerPrice <= overpriceThreshold) : true;
  const overpricingGap = hasBrokerQuote ? brokerPrice - fairValue : 0;
  const gapPct = hasBrokerQuote ? Math.round((overpricingGap / fairValue) * 100) : 0;

  // 1. VERDICT STRINGS
  let verdictTitle = '';
  let verdictSub   = '';
  let verdictIcon  = '';
  let verdictColor = '';
  let verdictBg    = '';

  if (hasBrokerQuote) {
    if (isFairDeal) {
      verdictTitle = '✅ Fair Deal — Good Time to Buy';
      verdictSub   = `The asking price is well within the acceptable ML range.`;
      verdictIcon  = '✅';
      verdictColor = '#34d399';
      verdictBg    = 'rgba(52, 211, 153, 0.08)';
    } else {
      verdictTitle = '⚠️ Overpriced — Negotiate Before Signing';
      verdictSub   = `The broker asking price is ${gapPct}% above our ML fair value estimate.`;
      verdictIcon  = '⚠️';
      verdictColor = '#fb7185';
      verdictBg    = 'rgba(251, 113, 133, 0.08)';
    }
  } else {
    verdictTitle = '🎯 ML Fair Value Estimate Calculated';
    verdictSub   = `Use this baseline to negotiate confidently with brokers or sellers.`;
    verdictIcon  = '🎯';
    verdictColor = '#60a5fa';
    verdictBg    = 'rgba(96, 165, 250, 0.08)';
  }

  // 2. THREE NUMBERS
  let numLeftTitle = '';
  let numLeftValue = '';
  let numLeftSub   = '';
  let numCenterTitle = '';
  let numCenterValue = '';
  let numCenterSub   = '';
  let numRightTitle = '';
  let numRightValue = '';
  let numRightSub   = '';

  if (hasBrokerQuote) {
    numLeftTitle   = 'Your Bid Target';
    numLeftValue   = formatINR(Math.round(fairValue * 0.98));
    numLeftSub     = 'Open strong here (2% below fair)';
    
    numCenterTitle = 'ML Fair Value';
    numCenterValue = formatINR(fairValue);
    numCenterSub   = `Data backed (${confidenceScore}% conf.)`;

    numRightTitle  = 'Walk Away Point';
    numRightValue  = formatINR(Math.round(overpriceThreshold));
    numRightSub    = 'Overpaying if higher';
  } else {
    numLeftTitle   = 'Good Deal Price';
    numLeftValue   = formatINR(Math.round(underpriceThreshold));
    numLeftSub     = 'Excellent value capture';

    numCenterTitle = 'ML Fair Value';
    numCenterValue = formatINR(fairValue);
    numCenterSub   = `Data backed (${confidenceScore}% conf.)`;

    numRightTitle  = 'Overpriced Threshold';
    numRightValue  = formatINR(Math.round(overpriceThreshold));
    numRightSub    = 'Walk away if higher';
  }

  // 3. NEXT STEPS (Bullets)
  let nextSteps = [];
  if (hasBrokerQuote) {
    if (isFairDeal) {
      nextSteps = [
        `Offer exactly ₹${Math.round(fairValue * 0.98).toLocaleString()} to start the conversation.`,
        `You have room to go up to the asking price if necessary.`,
        `Ask for token amount time: 48hrs to review legal docs.`,
      ];
    } else {
      nextSteps = [
        `Open with ₹${Math.round(fairValue * 0.95).toLocaleString()} — they expect you to negotiate down.`,
        `Print this report and show the ML Fair Value as data leverage.`,
        `If they refuse to drop below ₹${Math.round(overpriceThreshold).toLocaleString()}, seriously consider walking away.`,
      ];
    }
  } else {
    nextSteps = [
      `When the agent gives a price, check it against the MLS Fair Value of ${formatINR(fairValue)}.`,
      `Always start your counter-offer 3-5% lower than Fair Value.`,
      `If their final price exceeds ₹${Math.round(overpriceThreshold).toLocaleString()}, it's an overpriced property.`,
    ];
  }

  return (
    <div className="animate-fade-up">

      {/* 1. THE VERDICT */}
      <div style={{
        padding: '24px',
        borderRadius: '16px',
        marginBottom: '24px',
        border: `1px solid ${verdictColor}40`,
        background: verdictBg,
        display: 'flex', alignItems: 'flex-start', gap: '20px',
      }}>
         <div style={{ fontSize: '42px', lineHeight: 1 }}>{verdictIcon}</div>
         <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: verdictColor, marginBottom: '6px' }}>
              {verdictTitle}
            </div>
            <div style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
              {verdictSub}
            </div>
         </div>
      </div>

      {/* 2. THE THREE NUMBERS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        
        {/* Left Box */}
        <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52,211,153, 0.25)', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
            {numLeftTitle}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: '#34d399', marginBottom: '6px' }}>
            {numLeftValue}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {numLeftSub}
          </div>
        </div>

        {/* Center Box (Fair Value) */}
        <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59,130,246, 0.25)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
            {numCenterTitle}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: '#60a5fa', marginBottom: '4px' }}>
            {numCenterValue}
          </div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: result.predictionSource?.includes('Real-time') ? '#34d399' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
             {result.predictionSource?.includes('Real-time') ? '● ' : '○ '}{result.predictionSource}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {numCenterSub}
          </div>
        </div>

        {/* Right Box  */}
        <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(251, 113, 133, 0.08)', border: '1px solid rgba(251,113,133, 0.25)', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
            {numRightTitle}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: '#fb7185', marginBottom: '6px' }}>
            {numRightValue}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {numRightSub}
          </div>
        </div>

      </div>

      {/* 3. YOUR POWER MOVES */}
      <div className="panel" style={{ padding: '24px' }}>
         <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', marginBottom: '16px', display:'flex', alignItems:'center', gap:'10px' }}>
           <span style={{ fontSize: '22px' }}>🏡</span> Your Buyer Power Moves
         </div>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
           {nextSteps.map((step, idx) => (
             <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, flexShrink: 0 }}>
                 {idx + 1}
               </div>
               <div style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                 {step}
               </div>
             </div>
           ))}
         </div>
      </div>

    </div>
  );
}
