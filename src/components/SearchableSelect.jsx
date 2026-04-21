import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function SearchableSelect({ id, options, value, onChange, placeholder, disabled, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    // When value changes externally (e.g. state reset), update search term if not open
    // We check against null/undefined/empty string specifically so '0' works correctly
    if (!isOpen) {
      setSearchTerm(value !== undefined && value !== null && value !== '' ? String(value) : '');
    }
  }, [value, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm(value !== undefined && value !== null && value !== '' ? String(value) : '');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const filteredOptions = (options || []).filter(opt => {
    const searchIn = typeof opt === 'object' && opt !== null ? opt.label : opt;
    return String(searchIn).toLowerCase().includes(String(searchTerm).toLowerCase());
  });

  const handleSelect = (option) => {
    // Simulate a native event object so parent onChange doesn't break
    onChange({ target: { value: option } });
    setSearchTerm(option);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
    
    // Optional: if user completely clears the input, clear the value
    if (e.target.value === '') {
      onChange({ target: { value: '' } });
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    // When focusing, clear the input text so user can immediately type a fresh search,
    // but the actual `value` in parent state remains until they select something.
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} style={{ 
      position: 'relative', 
      width: '100%',
      zIndex: isOpen ? 9999 : 1 // Elevate the entire container when open
    }}>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type="text"
          className={`form-input ${error ? 'input-error' : ''}`}
          placeholder={isOpen ? placeholder : (value !== undefined && value !== null && value !== '' ? String(value) : placeholder)}
          value={isOpen ? searchTerm : (value !== undefined && value !== null && value !== '' ? String(value) : '')}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          disabled={disabled}
          autoComplete="off"
          style={{ 
            paddingRight: '40px', 
            cursor: disabled ? 'not-allowed' : 'text' 
          }}
        />
        <div style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: `translateY(-50%) ${isOpen ? 'rotate(180deg)' : ''}`,
          transition: 'transform 0.2s',
          pointerEvents: 'none',
          color: 'var(--text-muted)'
        }}>
          <ChevronDown size={18} />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="dropdown-menu-container" style={{
          position: 'absolute',
          top: 'calc(100% + 12px)',
          left: 0,
          right: 0,
          zIndex: 10000,
        }}>
          {/* The Blur Layer — Heavy frosted glass that obscures everything behind it */}
          <div className="glass dropdown-blur-layer" />
          
          {/* The Content Layer — Scrollable and sharp */}
          <div className="dropdown-content-layer">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, i) => {
                const isObj = typeof opt === 'object' && opt !== null;
                const label = isObj ? opt.label : opt;
                const val   = isObj ? opt.value : opt;
                return (
                  <div
                    key={i}
                    className={`dropdown-option ${String(value) === String(val) ? 'selected' : ''}`}
                    onClick={() => handleSelect(val)}
                  >
                    {label}
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' }}>
                No matches found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
