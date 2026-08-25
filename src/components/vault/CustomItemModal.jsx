import React, { useState, useEffect, useRef } from 'react';
import Icon from '../ui/Icon';

export default function CustomItemModal({
    isOpen,
    onClose,
    onSave,
    initialType = 'symbol',
    initialFile = null,
    user
}) {
    const [itemType, setItemType] = useState(initialType); // 'symbol' | 'emoji'
    const [mode, setMode] = useState('image'); // 'image' | 'glyph'
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [char, setChar] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [isPublic, setIsPublic] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    
    const fileInputRef = useRef(null);

    // Reset or initialize on open
    useEffect(() => {
        if (isOpen) {
            setItemType(initialType);
            setError('');
            setSaving(false);
            if (initialFile) {
                processImageFile(initialFile);
            }
        } else {
            setName('');
            setCode('');
            setChar('');
            setImagePreview(null);
            setIsPublic(true);
            setMode('image');
        }
    }, [isOpen, initialType, initialFile]);

    if (!isOpen) return null;

    // Process and compress image file
    const processImageFile = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('Please upload a valid image file (PNG, JPG, SVG, GIF, WEBP).');
            return;
        }

        setError('');
        const reader = new FileReader();
        reader.onload = (e) => {
            const rawDataUrl = e.target.result;
            
            // Auto generate name if empty
            if (!name) {
                const cleanName = file.name.split('.')[0].replace(/[-_]/g, ' ');
                setName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
                setCode(`:${cleanName.toLowerCase().replace(/\s+/g, '_')}:`);
            }

            // Optimize & resize image using canvas to ensure lightweight Firestore storage
            if (file.type === 'image/svg+xml') {
                setImagePreview(rawDataUrl);
                setChar(rawDataUrl);
            } else {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxDim = 256;
                    let width = img.width;
                    let height = img.height;

                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        } else {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const optimizedDataUrl = canvas.toDataURL(file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', 0.88);
                    setImagePreview(optimizedDataUrl);
                    setChar(optimizedDataUrl);
                };
                img.src = rawDataUrl;
            }
        };
        reader.readAsDataURL(file);
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processImageFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            processImageFile(e.target.files[0]);
        }
    };

    const handleNameChange = (val) => {
        setName(val);
        if (!code || code.startsWith(':')) {
            const autoCode = `:${val.toLowerCase().replace(/[^a-z0-9]/g, '_')}:`;
            setCode(autoCode);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Please enter a name for your custom item.');
            return;
        }

        const isImageItem = mode === 'image';
        const finalChar = isImageItem ? imagePreview : char.trim();

        if (!finalChar) {
            setError(isImageItem ? 'Please upload or drop an image.' : 'Please enter a character or glyph.');
            return;
        }

        setSaving(true);
        setError('');

        const customItem = {
            id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            type: itemType, // 'symbol' | 'emoji'
            name: name.trim(),
            code: code.trim() || `:${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}:`,
            char: finalChar,
            isImage: isImageItem,
            isPublic: !!isPublic,
            creatorUid: user?.uid || 'anonymous',
            creatorName: user?.username || user?.displayName || 'Cyber Operative',
            createdAt: Date.now()
        };

        try {
            await onSave(customItem);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to save custom item.');
            setSaving(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(5, 5, 10, 0.82)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={onClose}
        >
            <div 
                className="glass-panel" 
                style={{
                    width: '100%',
                    maxWidth: '520px',
                    backgroundColor: 'rgba(13, 13, 22, 0.95)',
                    border: '1px solid rgba(6, 182, 212, 0.45)',
                    borderRadius: '16px',
                    boxShadow: '0 0 40px rgba(6, 182, 212, 0.25), 0 20px 40px rgba(0, 0, 0, 0.8)',
                    padding: '28px 32px',
                    position: 'relative',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            background: 'rgba(6, 182, 212, 0.15)',
                            border: '1px solid #06b6d4',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#06b6d4'
                        }}>
                            <Icon name="plus" size={18} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#ffffff', letterSpacing: '1px', fontWeight: 800 }}>
                                CREATE CUSTOM {itemType.toUpperCase()}
                            </h2>
                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Design & sync your custom symbols or emojis to the cloud
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            transition: 'color 0.15s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                        ✕
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div style={{
                        background: 'rgba(255, 68, 68, 0.12)',
                        border: '1px solid #ff4444',
                        color: '#ff6666',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Icon name="alert" size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Category Type & Mode Toggles */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>
                                VAULT DESTINATION
                            </label>
                            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', padding: '3px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <button
                                    type="button"
                                    onClick={() => setItemType('symbol')}
                                    style={{
                                        flex: 1,
                                        padding: '6px',
                                        background: itemType === 'symbol' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                                        border: itemType === 'symbol' ? '1px solid #06b6d4' : '1px solid transparent',
                                        borderRadius: '6px',
                                        color: itemType === 'symbol' ? '#06b6d4' : 'var(--text-muted)',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Symbol
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setItemType('emoji')}
                                    style={{
                                        flex: 1,
                                        padding: '6px',
                                        background: itemType === 'emoji' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                                        border: itemType === 'emoji' ? '1px solid #06b6d4' : '1px solid transparent',
                                        borderRadius: '6px',
                                        color: itemType === 'emoji' ? '#06b6d4' : 'var(--text-muted)',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Emoji
                                </button>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>
                                CONTENT SOURCE
                            </label>
                            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', padding: '3px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <button
                                    type="button"
                                    onClick={() => { setMode('image'); setError(''); }}
                                    style={{
                                        flex: 1,
                                        padding: '6px',
                                        background: mode === 'image' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                                        border: mode === 'image' ? '1px solid #a855f7' : '1px solid transparent',
                                        borderRadius: '6px',
                                        color: mode === 'image' ? '#c084fc' : 'var(--text-muted)',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Image File
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setMode('glyph'); setError(''); }}
                                    style={{
                                        flex: 1,
                                        padding: '6px',
                                        background: mode === 'glyph' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                                        border: mode === 'glyph' ? '1px solid #a855f7' : '1px solid transparent',
                                        borderRadius: '6px',
                                        color: mode === 'glyph' ? '#c084fc' : 'var(--text-muted)',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Text / Glyph
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Drag and Drop Zone for Image */}
                    {mode === 'image' ? (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>
                                UPLOAD ASSET (PNG, JPG, SVG, GIF, WEBP)
                            </label>
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleFileDrop}
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: isDragging ? '2px dashed #06b6d4' : '2px dashed rgba(255, 255, 255, 0.15)',
                                    borderRadius: '12px',
                                    padding: '24px 16px',
                                    textAlign: 'center',
                                    background: isDragging ? 'rgba(6, 182, 212, 0.1)' : 'rgba(0, 0, 0, 0.35)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                }}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/svg+xml,image/gif,image/webp"
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />

                                {imagePreview ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '72px',
                                            height: '72px',
                                            borderRadius: '12px',
                                            background: 'rgba(0,0,0,0.6)',
                                            border: '1px solid rgba(6,182,212,0.4)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '6px',
                                            boxShadow: '0 0 16px rgba(6,182,212,0.3)'
                                        }}>
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                            />
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 600 }}>
                                            Click or drop new file to replace
                                        </span>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '50%',
                                            background: 'rgba(255, 255, 255, 0.04)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#06b6d4'
                                        }}>
                                            <Icon name="upload" size={22} />
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>
                                            Drag & Drop image here or <span style={{ color: '#06b6d4' }}>browse</span>
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            Supports PNG, JPG, SVG, GIF, WEBP up to 5MB
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>
                                CHARACTER / UNICODE GLYPH
                            </label>
                            <input
                                type="text"
                                placeholder="Paste symbol or emoji glyph (e.g. ⚡, ✦, 𝕏, Ω)"
                                value={char}
                                onChange={e => {
                                    setChar(e.target.value);
                                    if (e.target.value && !name) {
                                        setName(`Custom Glyph ${e.target.value}`);
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    background: 'rgba(0,0,0,0.5)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '8px',
                                    color: '#ffffff',
                                    fontSize: '1.2rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    )}

                    {/* Name & Shortcode Fields */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>
                                NAME / TITLE
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Neon Dragon"
                                value={name}
                                onChange={e => handleNameChange(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'rgba(0,0,0,0.5)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '8px',
                                    color: '#ffffff',
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>
                                SHORTCODE / TAG
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. :neon_dragon:"
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'rgba(0,0,0,0.5)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '8px',
                                    color: '#06b6d4',
                                    fontFamily: 'monospace',
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    </div>

                    {/* Public vs Private Cloud Sharing */}
                    <div style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                    }}
                    onClick={() => setIsPublic(!isPublic)}
                    >
                        <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: isPublic ? '#00ff88' : '#888899',
                                    boxShadow: isPublic ? '0 0 8px #00ff88' : 'none'
                                }}></span>
                                {isPublic ? 'Make Public (Global Cloud)' : 'Private (Account Only)'}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {isPublic
                                    ? 'Visible to all signed-in Cyber-Hub operatives across all devices.'
                                    : 'Saved privately to your cloud profile only.'}
                            </div>
                        </div>

                        {/* Switch UI */}
                        <div style={{
                            width: '42px',
                            height: '22px',
                            borderRadius: '11px',
                            background: isPublic ? '#06b6d4' : 'rgba(255,255,255,0.15)',
                            padding: '2px',
                            transition: 'background 0.2s ease',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: '#ffffff',
                                transform: isPublic ? 'translateX(20px)' : 'translateX(0)',
                                transition: 'transform 0.2s ease'
                            }} />
                        </div>
                    </div>

                    {/* Save Button */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '12px',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: 'var(--text-muted)',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}
                        >
                            CANCEL
                        </button>

                        <button
                            type="submit"
                            className="cyber-button"
                            disabled={saving}
                            style={{
                                flex: 2,
                                padding: '12px',
                                fontSize: '0.88rem',
                                letterSpacing: '0.08em',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            {saving ? (
                                'SAVING TO CLOUD...'
                            ) : (
                                <>
                                    <Icon name="cloud" size={18} />
                                    SAVE TO VAULT CLOUD
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
