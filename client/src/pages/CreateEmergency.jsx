import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmergency } from '../context/EmergencyContext';
import { toast } from 'react-toastify';
import { AlertTriangle, MapPin, User, FileText, Send, Loader } from 'lucide-react';

const EMERGENCY_TYPES = ['Accident', 'Fire', 'Medical', 'Crime'];

const typeIcons = {
    Accident: '🚗',
    Fire: '🔥',
    Medical: '🏥',
    Crime: '🚔',
};

const CreateEmergency = () => {
    const navigate = useNavigate();
    const { createEmergency } = useEmergency();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        emergencyType: '',
        location: '',
        description: '',
        latitude: null,
        longitude: null,
    });

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation not supported by your browser');
            return;
        }
        toast.info('Detecting your location...');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setForm((prev) => ({
                    ...prev,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    location: prev.location || `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
                }));
                toast.success('Location detected!');
            },
            () => toast.error('Unable to detect location')
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.emergencyType || !form.location || !form.description) {
            toast.error('Please fill in all required fields');
            return;
        }
        try {
            setLoading(true);
            await createEmergency(form);
            toast.success('🚨 Emergency reported successfully! Responders have been alerted.');
            navigate('/alerts');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create emergency');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <AlertTriangle size={28} style={{ color: 'var(--red)' }} /> Report Emergency
                    </h1>
                    <p className="page-subtitle">Fill in the details to alert responders immediately</p>
                </div>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit} className="emergency-form">
                    {/* Reporter Name */}
                    <div className="form-group">
                        <label className="form-label">
                            <User size={16} /> Reporter Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            className="form-input"
                            required
                        />
                    </div>

                    {/* Emergency Type */}
                    <div className="form-group">
                        <label className="form-label">
                            <AlertTriangle size={16} /> Emergency Type *
                        </label>
                        <div className="type-grid">
                            {EMERGENCY_TYPES.map((type) => (
                                <label
                                    key={type}
                                    className={`type-option ${form.emergencyType === type ? 'type-option--selected' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="emergencyType"
                                        value={type}
                                        checked={form.emergencyType === type}
                                        onChange={handleChange}
                                        style={{ display: 'none' }}
                                    />
                                    <span className="type-icon">{typeIcons[type]}</span>
                                    <span className="type-label">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Location */}
                    <div className="form-group">
                        <label className="form-label">
                            <MapPin size={16} /> Emergency Location *
                        </label>
                        <div className="input-with-btn">
                            <input
                                type="text"
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                placeholder="Enter location or use GPS"
                                className="form-input"
                                required
                            />
                            <button type="button" className="btn btn-secondary" onClick={detectLocation}>
                                <MapPin size={16} /> GPS
                            </button>
                        </div>
                        {form.latitude && (
                            <p className="form-hint">
                                📍 Coordinates: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">
                            <FileText size={16} /> Description *
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Describe the emergency in detail..."
                            className="form-textarea"
                            rows={4}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-danger btn-large" disabled={loading}>
                        {loading ? (
                            <><Loader size={18} className="spin" /> Sending Alert...</>
                        ) : (
                            <><Send size={18} /> Send Emergency Alert</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateEmergency;
