import React, { useState } from 'react';
import Icon from '../components/ui/Icon';

export default function HexEditor() {
    const [fileBuffer, setFileBuffer] = useState(null);
    const [hexLines, setHexLines] = useState([]);
    const [fileName, setFileName] = useState('');

    const handleDrop = async (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file) return;
        
        setFileName(file.name);
        const buffer = await file.arrayBuffer();
        setFileBuffer(new Uint8Array(buffer));
        
        // Render first 50 lines for demo
        const lines = [];
        const view = new Uint8Array(buffer);
        for (let i = 0; i < Math.min(view.length, 16 * 50); i += 16) {
            const chunk = Array.from(view.slice(i, i + 16));
            lines.push({
                offset: i.toString(16).padStart(8, '0').toUpperCase(),
                hex: chunk.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' '),
                ascii: chunk.map(b => (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.').join('')
            });
        }
        setHexLines(lines);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '15px' }}>
                <h2 style={{ color: 'var(--accent-primary)', margin: 0, fontSize: '1.4rem' }}>HEX EDITOR</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '5px 0 0 0' }}>Reverse engineering toolkit.</p>
            </div>

            {!fileBuffer ? (
                <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px dashed var(--border-color)',
                        borderRadius: 'var(--radius-large)',
                        background: 'rgba(0,0,0,0.3)',
                        color: 'var(--text-muted)',
                        gap: '20px'
                    }}
                >
                    <Icon name="microscope" size={48} className="animate-fade" />
                    <div>Drag & Drop target file here (.exe, .dll, .bin)</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                    <div style={{ marginBottom: '10px', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                        ANALYZING: {fileName}
                    </div>
                    
                    <div className="card" style={{ flex: 1, overflowY: 'auto', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', color: 'var(--text-muted)', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)', marginBottom: '10px' }}>
                            <div style={{ width: '100px' }}>OFFSET</div>
                            <div style={{ flex: 1 }}>00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F</div>
                            <div style={{ width: '150px', textAlign: 'right' }}>ASCII</div>
                        </div>
                        
                        {hexLines.map((line, idx) => (
                            <div key={idx} style={{ display: 'flex', marginBottom: '4px' }}>
                                <div style={{ width: '100px', color: 'var(--accent-dark)' }}>{line.offset}</div>
                                <div style={{ flex: 1, color: 'var(--text-main)', letterSpacing: '1px' }}>{line.hex}</div>
                                <div style={{ width: '150px', textAlign: 'right', color: 'var(--text-muted)' }}>{line.ascii}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
