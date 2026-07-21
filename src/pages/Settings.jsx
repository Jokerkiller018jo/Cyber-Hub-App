import React, { useState, useEffect } from 'react';
import { setupRecaptcha, sendSMS, verifySMS } from '../services/auth-handler';
import Icon from '../components/ui/Icon';

export default function Settings() {
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [verificationId, setVerificationId] = useState(null);

    useEffect(() => {
        // Initialize recaptcha when component mounts
        setupRecaptcha('recaptcha-container');
    }, []);

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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '15px' }}>
                <h2 style={{ color: 'var(--accent-primary)', margin: 0, fontSize: '1.4rem' }}>SECURITY SETTINGS</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '5px 0 0 0' }}>Manage node connections.</p>
            </div>

            <div className="card" style={{ maxWidth: '500px', margin: '0 auto', width: '100%' }}>
                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon name="phone" size={20} />
                    Link Secure Device
                </h3>

                {error && (
                    <div style={{ background: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', padding: '10px', borderRadius: 'var(--radius-small)', marginBottom: '15px', fontSize: '0.85rem' }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{ background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', padding: '10px', borderRadius: 'var(--radius-small)', marginBottom: '15px', fontSize: '0.85rem' }}>
                        {success}
                    </div>
                )}

                {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Phone Number (+1...)" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        <div id="recaptcha-container" style={{ alignSelf: 'center', margin: '10px 0' }}></div>
                        <button className="cyber-button" onClick={handleSendSMS} disabled={loading}>
                            {loading ? "SENDING..." : "SEND SECURE SMS"}
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="6-Digit Verification Code" 
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                        <button className="cyber-button" onClick={handleVerifyCode} disabled={loading}>
                            {loading ? "VERIFYING..." : "VERIFY SECURE LINK"}
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div style={{ textAlign: 'center', color: '#00ff88', padding: '20px', border: '1px solid #00ff88', borderRadius: 'var(--radius-small)' }}>
                        SECURE DEVICE LINKED
                    </div>
                )}
            </div>
        </div>
    );
}
