import { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { toast } from 'react-toastify';
import { Radio, MapPin, AlertTriangle, Zap } from 'lucide-react';

const SOS = () => {
    const { createEmergency } = useEmergency();
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [emergency, setEmergency] = useState(null);
    const [name, setName] = useState('');
    const [type, setType] = useState('Medical');

    const handleSOS = async () => {
        if (!name) {
            toast.error('Please enter your name before triggering SOS');
            return;
        }
        setLoading(true);
        try {
            const position = await new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error('Geolocation not supported'));
                }
                navigator.geolocation.getCurrentPosition(resolve, () => {
                    resolve({ coords: { latitude: 12.9716, longitude: 77.5946 } });
                });
            });

            const { latitude, longitude } = position.coords;
            const data = {
                name: name || 'Anonymous',
                emergencyType: type,
                location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                description: `🚨 SOS ALERT - Immediate assistance required at coordinates ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                latitude,
                longitude,
                isSOS: true,
            };

            const result = await createEmergency(data);
            setEmergency(result);
            setSent(true);
            toast.success('🚨 SOS Alert sent! Help is on the way!', { autoClose: 5000 });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send SOS alert');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setSent(false);
        setEmergency(null);
    };

    return (
        <div className="page sos-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <Radio size={28} style={{ color: 'var(--red)' }} /> SOS Emergency Alert
                    </h1>
                    <p className="page-subtitle">Press the SOS button to instantly alert all responders</p>
                </div>
            </div>

            {!sent ? (
                <div className="sos-container">
                    <div className="sos-form-top">
                        <div className="form-group">
                            <label className="form-label">Your Name *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                className="form-input form-input--center"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Emergency Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="form-input form-input--center"
                            >
                                {['Accident', 'Fire', 'Medical', 'Crime'].map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="sos-warning">
                        <AlertTriangle size={18} />
                        <p>Your GPS location will be automatically captured and sent to all nearby responders</p>
                    </div>

                    <button
                        className={`sos-button ${loading ? 'sos-button--loading' : ''}`}
                        onClick={handleSOS}
                        disabled={loading}
                    >
                        <div className="sos-button-ring sos-ring-1"></div>
                        <div className="sos-button-ring sos-ring-2"></div>
                        <div className="sos-button-ring sos-ring-3"></div>
                        <div className="sos-button-inner">
                            {loading ? (
                                <div className="sos-loading">
                                    <Zap size={32} />
                                    <span>Sending...</span>
                                </div>
                            ) : (
                                <>
                                    <Radio size={40} />
                                    <span>SOS</span>
                                    <span className="sos-sub">PRESS FOR HELP</span>
                                </>
                            )}
                        </div>
                    </button>
                </div>
            ) : (
                <div className="sos-success">
                    <div className="success-icon">✅</div>
                    <h2>SOS Alert Sent!</h2>
                    <p>Your emergency has been broadcast to all available responders.</p>
                    {emergency && (
                        <div className="sent-details">
                            <div className="detail-row">
                                <MapPin size={16} /> <span>{emergency.location}</span>
                            </div>
                            <div className="detail-row">
                                <Radio size={16} /> <span>Type: {emergency.emergencyType}</span>
                            </div>
                            <div className="detail-row">
                                <span>Status: <strong>{emergency.status}</strong></span>
                            </div>
                        </div>
                    )}
                    <button className="btn btn-secondary" onClick={reset}>
                        Send Another Alert
                    </button>
                </div>
            )}
        </div>
    );
};

export default SOS;
