import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';

export default function CustomSelect({ 
    options, 
    value, 
    onChange, 
    placeholder = "Select...", 
    style = {},
    maxHeight = "250px",
    disabled = false
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    return (
        <div 
            ref={containerRef}
            style={{ 
                position: 'relative', 
                minWidth: '150px',
                opacity: disabled ? 0.5 : 1,
                pointerEvents: disabled ? 'none' : 'auto',
                ...style 
            }}
        >
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: `1px solid ${isOpen ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-small)',
                    padding: '8px 12px',
                    color: 'var(--text-main)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.9rem',
                    boxShadow: isOpen ? '0 0 10px rgba(176,0,255,0.2)' : 'none'
                }}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayLabel}
                </span>
                <span style={{ 
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', 
                    transition: 'transform 0.2s',
                    color: 'var(--text-muted)'
                }}>
                    ▼
                </span>
            </div>

            {isOpen && (
                <div 
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '4px',
                        background: 'rgba(10, 10, 15, 0.95)',
                        border: '1px solid var(--accent-primary)',
                        borderRadius: 'var(--radius-small)',
                        maxHeight: maxHeight,
                        overflowY: 'auto',
                        zIndex: 100,
                        boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(10px)'
                    }}
                    className="custom-scrollbar"
                >
                    {options.map((opt, i) => (
                        <div
                            key={opt.value}
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                            style={{
                                padding: '10px 12px',
                                cursor: 'pointer',
                                borderBottom: i < options.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                background: value === opt.value ? 'rgba(176,0,255,0.2)' : 'transparent',
                                color: value === opt.value ? 'var(--accent-primary)' : 'var(--text-main)',
                                transition: 'background 0.1s',
                                fontSize: '0.9rem'
                            }}
                            onMouseEnter={e => {
                                if (value !== opt.value) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            }}
                            onMouseLeave={e => {
                                if (value !== opt.value) e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
