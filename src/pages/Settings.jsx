import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setupRecaptcha, sendSMS, verifySMS } from '../services/auth-handler';
import Icon from '../components/ui/Icon';

export default function Settings() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Security');
    
    // SMS Verification State
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [verificationId, setVerificationId] = useState(null);

    useEffect(() => {
        if (activeTab === 'Security' && step === 1) {
            // Need a slight delay to ensure the DOM element is rendered
            setTimeout(() => {
                const container = document.getElementById('recaptcha-container');
                if (container && !container.innerHTML) {
                    setupRecaptcha('recaptcha-container');
                }
            }, 100);
        }
    }, [activeTab, step]);

    const handleSendSMS = async () => {
        if (!phone.trim()) return setError("Enter a valid phone number (+1...)");
        setLoading(true);
        setError('');
        try {
            const vid = await sendSMS(phone);
            setVerificationId(vid);
            setStep(2);
            setSuccess("SMS Verification Code Sent!");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!code.trim()) return setError("Enter the 6-digit code");
        setLoading(true);
        setError('');
        try {
            await verifySMS(verificationId, code);
            setStep(3);
            setSuccess("Phone Linked Successfully!");
        } catch (err) {
            setError("Verification Failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'My Account', label: 'My Account' },
        { id: 'Security', label: 'Security' },
        { id: 'Appearance', label: 'Appearance' },
        { id: 'Notifications', label: 'Notifications' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'Security':
                return (
                    <div className="animate-fade" style={{ maxWidth: '600px' }}>
                        <h2 style={{ color: 'var(--text-main)', marginBottom: '20px', fontSize: '1.5rem', fontWeight: '800' }}>SECURITY SETTINGS</h2>
                        <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-medium)', padding: '25px' }}>
                            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)' }}>
                                <Icon name="phone" size={20} />
                                Link Secure Device
                            </h3>

                            {error && (
                                <div style={{ background: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', padding: '12px', borderRadius: 'var(--radius-small)', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(255, 68, 68, 0.3)' }}>
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div style={{ background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', padding: '12px', borderRadius: 'var(--radius-small)', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(0, 255, 136, 0.3)' }}>
                                    {success}
                                </div>
                            )}

                            {step === 1 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '600' }}>PHONE NUMBER</label>
                                        <input 
                                            type="text" 
                                            className="input-field" 
                                            placeholder="Phone Number (+1...)" 
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>
                                    <div id="recaptcha-container" style={{ minHeight: '60px' }}></div>
                                    <button className="cyber-button" onClick={handleSendSMS} disabled={loading} style={{ alignSelf: 'flex-start' }}>
                                        {loading ? "SENDING..." : "SEND SECURE SMS"}
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '600' }}>VERIFICATION CODE</label>
                                        <input 
                                            type="text" 
                                            className="input-field" 
                                            placeholder="6-Digit Verification Code" 
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                        />
                                    </div>
                                    <button className="cyber-button" onClick={handleVerifyCode} disabled={loading} style={{ alignSelf: 'flex-start' }}>
                                        {loading ? "VERIFYING..." : "VERIFY SECURE LINK"}
                                    </button>
                                </div>
                            )}

                            {step === 3 && (
                                <div style={{ textAlign: 'center', color: '#00ff88', padding: '30px', border: '1px solid rgba(0, 255, 136, 0.5)', borderRadius: 'var(--radius-small)', background: 'rgba(0, 255, 136, 0.05)' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', letterSpacing: '2px' }}>SECURE DEVICE LINKED</h3>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'My Account':
                return (
                    <div className="animate-fade" style={{ maxWidth: '600px' }}>
                        <h2 style={{ color: 'var(--text-main)', marginBottom: '20px', fontSize: '1.5rem', fontWeight: '800' }}>MY ACCOUNT</h2>
                        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Operator profile settings will be deployed here.
                        </div>
                    </div>
                );
            case 'Appearance':
                return (
                    <div className="animate-fade" style={{ maxWidth: '600px' }}>
                        <h2 style={{ color: 'var(--text-main)', marginBottom: '20px', fontSize: '1.5rem', fontWeight: '800' }}>APPEARANCE</h2>
                        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Visual interface configurations will be available here.
                        </div>
                    </div>
                );
            case 'Notifications':
                return (
                    <div className="animate-fade" style={{ maxWidth: '600px' }}>
                        <h2 style={{ color: 'var(--text-main)', marginBottom: '20px', fontSize: '1.5rem', fontWeight: '800' }}>NOTIFICATIONS</h2>
                        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Alert and transmission settings will be configured here.
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--bg-base)',
            display: 'flex',
            zIndex: 9999, // Ensure it covers everything like Discord settings
            color: 'var(--text-main)'
        }}>
            {/* Sidebar */}
            <div style={{ 
                width: '35%', 
                maxWidth: '400px',
                minWidth: '250px',
                background: 'rgba(10, 10, 16, 0.5)',
                borderRight: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '60px 20px'
            }}>
                <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', padding: '0 10px', marginBottom: '5px', letterSpacing: '1px' }}>
                        USER SETTINGS
                    </div>
                    {tabs.map(tab => (
                        <div 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '10px 15px',
                                borderRadius: 'var(--radius-small)',
                                cursor: 'pointer',
                                background: activeTab === tab.id ? 'rgba(176, 0, 255, 0.15)' : 'transparent',
                                color: activeTab === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
                                fontWeight: activeTab === tab.id ? '600' : '400',
                                transition: 'all var(--transition-fast)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                            onMouseEnter={(e) => { if(activeTab !== tab.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                            onMouseLeave={(e) => { if(activeTab !== tab.id) e.currentTarget.style.background = 'transparent' }}
                        >
                            <span style={{ fontSize: '0.95rem' }}>{tab.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ 
                flex: 1, 
                background: 'var(--bg-base)',
                padding: '60px 40px',
                overflowY: 'auto',
                position: 'relative'
            }}>
                <div style={{ maxWidth: '800px' }}>
                    {renderContent()}
                </div>
                
                {/* Close Button */}
                <div 
                    onClick={() => navigate('/lobby')}
                    style={{
                        position: 'absolute',
                        top: '60px',
                        right: '40px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '5px',
                        cursor: 'pointer',
                        color: 'var(--text-muted)'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-main)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
                >
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        border: '2px solid currentColor',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        fontWeight: '300'
                    }}>
                        ✕
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>ESC</span>
                </div>
            </div>
        </div>
    );
}
