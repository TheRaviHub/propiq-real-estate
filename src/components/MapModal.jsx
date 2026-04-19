import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, MapPin, Loader2, Search, Check, Navigation2, Info } from 'lucide-react';

const MapModal = ({ isOpen, onClose, onSelectLocation }) => {
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [addressData, setAddressData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);

  const mapRef      = useRef(null);
  const markerRef   = useRef(null);
  const leafletRef  = useRef(null);

  // ── Init map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const init = async () => {
      // Load Leaflet CSS + JS once
      if (!window.L) {
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(css);

        await new Promise((res) => {
          const js = document.createElement('script');
          js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          js.onload = res;
          document.body.appendChild(js);
        });
      }

      const L = window.L;
      leafletRef.current = L;
      if (mapRef.current) return; // already init

      const INDIA_BOUNDS = L.latLngBounds([6.4627, 68.1097], [37.5133, 97.3954]);

      const map = L.map('propiq-map', {
        maxBounds:          INDIA_BOUNDS,
        maxBoundsViscosity: 1.0,
        zoomControl:        false,
        attributionControl: false,
        minZoom:            4,
      }).setView([20.5937, 78.9629], 5);

      mapRef.current = map;

      // ── High-End Neural Dark Tiles ───────────────────────────────────
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd', maxZoom: 20,
      }).addTo(map);

      // Custom filter to achieve the neon-blue 'Road Map' look from reference
      map.getContainer().style.filter = 'hue-rotate(180deg) brightness(1.2) saturate(1.4) contrast(1.1)';

      // Custom zoom control — bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Custom minimal attribution
      L.control.attribution({ position: 'bottomleft', prefix: false })
        .addAttribution('© CartoDB · OSM')
        .addTo(map);

      // ── Neural India Precision Boundary ──────────────────────────────
      // More accurate India coordinates for a pro-level focus
      const indiaBoundary = [
        [35.5, 77.0], [37.0, 75.0], [36.0, 72.0], [34.0, 74.0], [31.5, 70.0],
        [24.0, 68.0], [22.0, 69.0], [20.0, 72.0], [15.0, 73.0], [10.0, 76.0], [8.0, 77.5],
        [8.5, 78.5], [13.0, 80.5], [17.0, 83.5], [20.0, 85.5], [22.0, 88.5], [22.5, 91.5],
        [25.0, 94.5], [28.0, 97.5], [29.5, 95.5], [28.5, 92.5], [27.5, 89.5], [30.5, 82.5], [35.5, 77.0]
      ];

      const worldCoords = [[-90, -180], [-90, 180], [90, 180], [90, -180], [-90, -180]];
      
      // Outside mask (Dimmer)
      L.polygon([worldCoords, indiaBoundary], {
        color: 'transparent',
        fillColor: '#000',
        fillOpacity: 0.6,
        interactive: false
      }).addTo(map);

      // Precision Neon Outline
      L.polygon(indiaBoundary, {
        color: '#22d3ee', // Cyan-Blue Neon
        weight: 2,
        fill: false,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: '3, 6',
      }).addTo(map);

      // Outer Pulse Glow
      L.polygon(indiaBoundary, {
        color: '#0891b2',
        weight: 15,
        fill: false,
        opacity: 0.2,
      }).addTo(map);

      map.on('click', (e) => {
        if (!INDIA_BOUNDS.contains(e.latlng)) {
          setError('Please tap inside India.');
          setTimeout(() => setError(null), 3000);
          return;
        }
        placeMarker(e.latlng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      // Try auto-locate
      map.locate({ setView: true, maxZoom: 15 });
      map.on('locationfound', (e) => {
        if (INDIA_BOUNDS.contains(e.latlng)) {
          placeMarker(e.latlng);
          reverseGeocode(e.latlng.lat, e.latlng.lng);
        }
      });
    };

    init();

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      markerRef.current = null;
    };
  }, [isOpen]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const placeMarker = useCallback((latlng) => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    if (markerRef.current) map.removeLayer(markerRef.current);

    // Custom SVG pin icon
    const icon = L.divIcon({
      className: '',
      html: `
        <div style="position:relative;width:36px;height:36px">
          <div style="
            position:absolute;inset:0;
            background:rgba(16,185,129,0.25);
            border-radius:50%;
            animation:ripple 1.5s ease-out infinite;
          "></div>
          <div style="
            position:absolute;top:50%;left:50%;
            transform:translate(-50%,-55%);
            width:20px;height:20px;
            background:#10b981;
            border:3px solid white;
            border-radius:50% 50% 50% 0;
            rotate:-45deg;
            box-shadow:0 4px 12px rgba(16,185,129,0.5);
          "></div>
        </div>`,
      iconSize:   [36, 36],
      iconAnchor: [18, 32],
    });

    markerRef.current = L.marker(latlng, { icon }).addTo(map);
    setHasSelected(true);
  }, []);

  const reverseGeocode = useCallback(async (lat, lng) => {
    setLoading(true);
    setError(null);
    setAddressData(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (!data.address) { setError('No address found here.'); return; }
      if (data.address.country_code !== 'in') {
        setError('Only Indian properties are supported.');
        return;
      }
      setAddressData(data.address);
    } catch {
      setError('Network error — please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', India')}&countrycodes=in&limit=1`
      );
      const data = await res.json();
      if (data?.length) {
        const { lat, lon } = data[0];
        const latlng = { lat: parseFloat(lat), lng: parseFloat(lon) };
        mapRef.current?.setView(latlng, 16);
        placeMarker(latlng);
        reverseGeocode(lat, lon);
      } else {
        setError('Location not found. Try a different name.');
        setTimeout(() => setError(null), 3000);
      }
    } catch {
      setError('Search failed. Check your connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const getLocationText = () => {
    if (!addressData) return null;
    const a = addressData;
    const parts = [
      a.suburb || a.neighbourhood || a.quarter || a.hamlet || a.road,
      a.city   || a.town          || a.district || a.state_district,
      a.state,
    ].filter(Boolean);
    return parts.slice(0, 3).join(', ');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* ── Overlay ─────────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 999999,
        background: 'rgba(5, 5, 10, 0.75)', backdropFilter: 'blur(32px) saturate(180%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}>
        {/* ── Modal shell ───────────────────────────────────────────────── */}
        <div style={{
          width: '100%', maxWidth: '1000px', height: '88vh',
          display: 'flex', flexDirection: 'column',
          borderRadius: '40px', overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'rgba(10, 10, 18, 0.9)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6), inset 0 0 40px rgba(255,255,255,0.03)',
          animation: 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
          zIndex: 1000,
        }}>

          {/* ── Top bar ─────────────────────────────────────────────────── */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            background: 'rgba(255,255,255,0.6)',
            zIndex: 10,
          }}>
            {/* Icon */}
            <div style={{
              width: 38, height: 38, borderRadius: '12px', flexShrink: 0,
              background: 'rgba(6, 182, 212, 0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.1)',
            }}>
              <MapPin size={18} color="#06b6d4" />
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, area or landmark…"
                style={{
                  width: '100%', padding: '11px 44px',
                  background: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '20px', color: '#1e293b', fontSize: '15px', fontWeight: 500,
                  outline: 'none', transition: 'all 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.07)';
                  e.target.style.borderColor = 'rgba(6, 182, 212, 0.4)';
                  e.target.style.boxShadow = '0 0 15px rgba(6, 182, 212, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.04)';
                  e.target.style.borderColor = 'rgba(6, 182, 212, 0.15)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <Search size={15} style={{
                position: 'absolute', left: 16, top: '50%',
                transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)',
                pointerEvents: 'none',
              }} />
              {isSearching && (
                <Loader2 size={15} style={{
                  position: 'absolute', right: 16, top: '50%',
                  transform: 'translateY(-50%)', color: '#06b6d4',
                  animation: 'spin 1s linear infinite',
                }} />
              )}
            </form>

            {/* Close */}
            <button
              onClick={onClose}
              style={{
                width: 38, height: 38, borderRadius: '12px', flexShrink: 0,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Neural Map Container ────────────────────────────────────────── */}
          <div style={{ flex: 1, position: 'relative', background: '#050508', overflow: 'hidden' }}>
            <div id="propiq-map" style={{ width: '100%', height: '100%' }} />

            {/* Precision SVG Mask for Border-Wise Blur */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 400, pointerEvents: 'none',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              // Sophisticated mask that keeps India clear but blurs everything else
              maskImage: `radial-gradient(circle at 50% 50%, transparent 25%, black 65%)`,
              WebkitMaskImage: `radial-gradient(circle at 50% 50%, transparent 25%, black 65%)`,
              opacity: 0.9,
            }} />

            {/* Neon Border Glow Overlay (Static SVG) */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 401, pointerEvents: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0.4
            }}>
              <svg width="80%" height="80%" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 10px #22d3ee)' }}>
                <path d="M50 5 L60 15 L75 20 L85 35 L80 50 L85 70 L75 85 L60 90 L40 95 L25 85 L15 70 L10 50 L15 30 L25 15 L40 5 Z" fill="none" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="2 4" />
              </svg>
            </div>

            {/* Hint pill */}
            {!hasSelected && !loading && (
              <div style={{
                position: 'absolute', top: 24, left: '50%',
                transform: 'translateX(-50%)', zIndex: 500,
                background: 'rgba(10,10,18,0.7)',
                border: '1px solid rgba(34, 211, 238, 0.3)',
                borderRadius: '40px', padding: '10px 24px',
                display: 'flex', alignItems: 'center', gap: '10px',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
              }}>
                <Info size={14} color="#22d3ee" />
                <span style={{ fontSize: '14px', color: 'white', fontWeight: 600 }}>
                  Pin your property within neon borders
                </span>
              </div>
            )}

            {/* Loading pill */}
            {loading && (
              <div style={{
                position: 'absolute', top: 24, left: '50%',
                transform: 'translateX(-50%)', zIndex: 600,
                background: 'rgba(10,10,18,0.85)',
                border: '1px solid #22d3ee',
                borderRadius: '40px', padding: '10px 28px',
                display: 'flex', alignItems: 'center', gap: '12px',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 0 40px rgba(34, 211, 238, 0.2)',
              }}>
                <Loader2 size={16} color="#22d3ee" style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '15px', color: 'white', fontWeight: 700 }}>
                  Analyzing region…
                </span>
              </div>
            )}

            {/* Error toast */}
            {error && (
              <div style={{
                position: 'absolute', bottom: 20, left: '50%',
                transform: 'translateX(-50%)', zIndex: 600,
                background: 'rgba(239,68,68,0.9)',
                backdropFilter: 'blur(12px)',
                borderRadius: '16px', padding: '12px 24px',
                fontSize: '13px', fontWeight: 700, color: 'white',
                boxShadow: '0 10px 30px rgba(239,68,68,0.4)',
              }}>
                {error}
              </div>
            )}
          </div>

          {/* ── Neural Footer ──────────────────────────────────────────────── */}
          <div style={{
            padding: '24px 32px', borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(10, 10, 20, 0.8)',
            display: 'flex', alignItems: 'center', gap: '24px', zIndex: 10,
          }}>
            <div style={{
              flex: 1, display: 'flex', gap: '20px', alignItems: 'center',
              padding: '16px 24px', borderRadius: '28px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 4px 30px rgba(0,0,0,0.2)',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '18px', flexShrink: 0,
                background: addressData ? 'rgba(34, 211, 238, 0.15)' : 'rgba(255,255,255,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: addressData ? '0 0 20px rgba(34, 211, 238, 0.1)' : 'none',
              }}>
                <Navigation2 size={24} color={addressData ? '#22d3ee' : 'rgba(255,255,255,0.2)'} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{
                  fontSize: '11px', fontWeight: 900, letterSpacing: '1.5px',
                  color: addressData ? '#22d3ee' : 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '2px',
                }}>
                  {addressData ? 'Intelligent Detection' : 'Awaiting Selection'}
                </p>
                <p style={{
                  fontSize: '17px', fontWeight: 700, color: addressData ? 'white' : 'rgba(255,255,255,0.25)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {addressData ? `${addressData.display_name.split(',')[0]}, ${addressData.address.state || ''}` : 'Tap within neon borders'}
                </p>
              </div>
            </div>

            <button
              disabled={!addressData || loading}
              onClick={() => { onSelectLocation(addressData); onClose(); }}
              style={{
                padding: '16px 40px', borderRadius: '22px',
                background: addressData ? 'linear-gradient(135deg, #0891b2, #22d3ee)' : 'rgba(255,255,255,0.05)',
                border: 'none', color: 'white',
                fontSize: '16px', fontWeight: 800,
                cursor: addressData ? 'pointer' : 'not-allowed',
                opacity: addressData && !loading ? 1 : 0.4,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: addressData ? '0 12px 35px rgba(34, 211, 238, 0.4)' : 'none',
              }}
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>

      {/* ── Global CSS for map controls & animations ─────────────────── */}
      <style>{`
        @keyframes ripple {
          0%   { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Map background */
        #propiq-map { cursor: crosshair !important; background: #08090d; }

        /* Zoom buttons */
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: none !important;
          margin: 0 20px 20px 0 !important;
        }
        .leaflet-control-zoom-in,
        .leaflet-control-zoom-out {
          background: rgba(15,18,25,0.8) !important;
          backdrop-filter: blur(8px) !important;
          color: white !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          width: 38px !important; height: 38px !important;
          line-height: 36px !important; font-size: 20px !important;
          transition: all 0.2s !important;
        }
        .leaflet-control-zoom-in  { margin-bottom: 6px !important; border-radius: 12px !important; }
        .leaflet-control-zoom-out { border-radius: 12px !important; }
        .leaflet-control-zoom-in:hover,
        .leaflet-control-zoom-out:hover {
          background: rgba(6, 182, 212, 0.25) !important;
          border-color: rgba(6, 182, 212, 0.5) !important;
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.2) !important;
        }

        /* Attribution */
        .leaflet-control-attribution {
          background: rgba(10,12,18,0.5) !important;
          backdrop-filter: blur(4px) !important;
          color: rgba(255,255,255,0.25) !important;
          font-size: 10px !important;
          border-radius: 8px 8px 0 0 !important;
          padding: 3px 10px !important;
          margin-left: 20px !important;
        }
        .leaflet-control-attribution a { color: rgba(6, 182, 212, 0.4) !important; text-decoration: none !important; }
      `}</style>
    </>
  );
};

export default MapModal;
