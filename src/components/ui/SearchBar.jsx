import React, { useRef, useState } from 'react';
import Icon from './Icon';

/**
 * SearchBar – theme-compatible search input.
 * Props:
 *   value, onChange, placeholder, onClear, style (object), id
 * Style variant comes from localStorage key "cyberhub_searchbar_style"
 *   "pill"      – fully rounded, slightly elevated
 *   "underline" – flat with only a bottom border
 *   "glass"     – default frosted-glass box
 */
export function getSearchBarStyle() {
    try { return localStorage.getItem('cyberhub_searchbar_style') || 'glass'; }
    catch { return 'glass'; }
}

export function setSearchBarStyle(v) {
    try {
        localStorage.setItem('cyberhub_searchbar_style', v);
        window.dispatchEvent(new Event('cyberhub_searchbar_style_change'));
    } catch {}
}

export default function SearchBar({
    value = '',
    onChange,
    placeholder = 'Search…',
    onClear,
    style: extraStyle = {},
    id,
    autoFocus = false,
}) {
    const inputRef = useRef(null);
    const [focused, setFocused] = useState(false);
    const [variant, setVariant] = useState(() => getSearchBarStyle());

    React.useEffect(() => {
        const update = () => setVariant(getSearchBarStyle());
        window.addEventListener('cyberhub_searchbar_style_change', update);
        window.addEventListener('storage', update);
        return () => {
            window.removeEventListener('cyberhub_searchbar_style_change', update);
            window.removeEventListener('storage', update);
        };
    }, []);

    /* ── Base style per variant ── */
    const baseStyles = {
        glass: {
            wrapper: {
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(0, 0, 0, 0.25)',
                border: focused
                    ? '1px solid var(--accent-primary)'
                    : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-small)',
                padding: '0 14px',
                height: '42px',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                boxShadow: focused
                    ? '0 0 0 1px var(--accent-primary), inset 0 2px 4px rgba(0,0,0,0.2)'
                    : 'inset 0 2px 4px rgba(0,0,0,0.15)',
            },
        },
        pill: {
            wrapper: {
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: focused
                    ? 'rgba(6, 182, 212, 0.08)'
                    : 'rgba(255, 255, 255, 0.04)',
                border: focused
                    ? '1px solid var(--accent-primary)'
                    : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '999px',
                padding: '0 18px',
                height: '42px',
                transition: 'all 0.2s ease',
                boxShadow: focused
                    ? '0 0 0 2px rgba(6,182,212,0.18), 0 4px 16px rgba(0,0,0,0.2)'
                    : '0 2px 8px rgba(0,0,0,0.15)',
            },
        },
        underline: {
            wrapper: {
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'transparent',
                border: 'none',
                borderBottom: focused
                    ? '2px solid var(--accent-primary)'
                    : '2px solid var(--border-color)',
                borderRadius: '0',
                padding: '0 4px',
                height: '42px',
                transition: 'border-color 0.15s ease',
            },
        },
        neumorphic: {
            wrapper: {
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'var(--bg-primary)',
                border: 'none',
                borderRadius: '12px',
                padding: '0 16px',
                height: '46px',
                transition: 'all 0.2s ease',
                boxShadow: focused
                    ? 'inset 4px 4px 8px rgba(0,0,0,0.4), inset -4px -4px 8px rgba(255,255,255,0.02), 0 0 0 1px var(--accent-primary)'
                    : '4px 4px 8px rgba(0,0,0,0.4), -4px -4px 8px rgba(255,255,255,0.02)',
            },
        },
        terminal: {
            wrapper: {
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: '#000',
                border: focused
                    ? '2px solid var(--accent-primary)'
                    : '2px solid #333',
                borderRadius: '0',
                padding: '0 14px',
                height: '42px',
                fontFamily: 'monospace',
                transition: 'border-color 0.1s',
            },
        },
        cyber: {
            wrapper: {
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: focused ? 'rgba(6,182,212,0.1)' : 'rgba(0,0,0,0.4)',
                border: 'none',
                borderLeft: `4px solid ${focused ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                borderRight: `1px solid ${focused ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                borderTop: `1px solid ${focused ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                borderBottom: `1px solid ${focused ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                borderRadius: '0',
                clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)',
                padding: '0 16px',
                height: '44px',
                transition: 'all 0.15s ease',
            },
        },
    };

    const wrapperStyle = {
        ...(baseStyles[variant]?.wrapper || baseStyles.glass.wrapper),
        ...extraStyle,
    };

    const inputStyle = {
        flex: 1,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        color: 'var(--text-main)',
        fontSize: '0.9rem',
        fontFamily: 'inherit',
        minWidth: 0,
    };

    return (
        <div style={wrapperStyle} onClick={() => inputRef.current?.focus()}>
            {/* Search icon */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width={16}
                height={16}
                fill="currentColor"
                style={{ color: focused ? 'var(--accent-primary)' : 'var(--text-muted)', flexShrink: 0, transition: 'color 0.15s' }}
            >
                <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>

            <input
                ref={inputRef}
                id={id}
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={inputStyle}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                autoFocus={autoFocus}
            />

            {/* Clear button */}
            {value && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClear?.();
                        inputRef.current?.focus();
                    }}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '2px',
                        flexShrink: 0,
                        borderRadius: '50%',
                        transition: 'color 0.12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    aria-label="Clear search"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={15} height={15} fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                </button>
            )}
        </div>
    );
}
