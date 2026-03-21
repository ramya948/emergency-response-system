import { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { Users, UserPlus, Phone, MapPin, CheckCircle, Shield, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

const Responders = () => {
    const { responders, createResponder, updateResponder } = useEmergency();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: '',
        phone: '',
        role: 'Paramedic',
        location: '',
    });

    const roles = ['Paramedic', 'Firefighter', 'Police', 'General'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createResponder(form);
            toast.success('Responder added successfully');
            setForm({ name: '', phone: '', role: 'Paramedic', location: '' });
            setShowForm(false);
        } catch (err) {
            toast.error('Failed to add responder');
        }
    };

    const toggleAvailability = async (id, currentObj) => {
        const states = ['Available', 'Busy', 'Off Duty'];
        const nextIdx = (states.indexOf(currentObj.availability) + 1) % states.length;
        const newAvailability = states[nextIdx];

        try {
            await updateResponder(id, { availability: newAvailability });
            toast.success(`Status updated to ${newAvailability}`);
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const statusIcons = {
        'Available': <CheckCircle size={16} className="text-success" />,
        'Busy': <Shield size={16} className="text-warning" />,
        'Off Duty': <EyeOff size={16} className="text-gray" />
    };

    return (
        <div className="page responders-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <Users size={28} style={{ color: 'var(--blue)' }} /> Emergency Responders
                    </h1>
                    <p className="page-subtitle">Manage rescue teams, medics, police, and firefighters</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    <UserPlus size={18} /> {showForm ? 'Cancel' : 'Add Responder'}
                </button>
            </div>

            {showForm && (
                <div className="responder-form-card">
                    <h3>Add New Responder Unit</h3>
                    <form onSubmit={handleSubmit} className="responder-form">
                        <div className="form-group row">
                            <div className="col">
                                <label>Name / Unit ID</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="col">
                                <label>Contact Phone</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group row">
                            <div className="col">
                                <label>Role</label>
                                <select
                                    className="form-input"
                                    value={form.role}
                                    onChange={e => setForm({ ...form, role: e.target.value })}
                                >
                                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="col">
                                <label>Base Location</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={form.location}
                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary">Save Responder</button>
                    </form>
                </div>
            )}

            <div className="responders-grid">
                {responders.length === 0 ? (
                    <div className="empty-state">
                        <Users size={48} />
                        <p>No responders registered yet in the system.</p>
                    </div>
                ) : (
                    responders.map(r => (
                        <div key={r._id} className="responder-card">
                            <div className="responder-header">
                                <div className="responder-avatar">
                                    {r.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="responder-info">
                                    <h4>{r.name}</h4>
                                    <span className={`role-badge role-${r.role.toLowerCase()}`}>{r.role}</span>
                                </div>
                            </div>
                            <div className="responder-body">
                                <div className="info-row"><Phone size={14} /> {r.phone}</div>
                                <div className="info-row"><MapPin size={14} /> {r.location}</div>
                                <div className="info-row availability-row">
                                    <span>Status:</span>
                                    <button
                                        className={`btn-availability btn-${r.availability.replace(' ', '').toLowerCase()}`}
                                        onClick={() => toggleAvailability(r._id, r)}
                                    >
                                        {statusIcons[r.availability]} {r.availability}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Responders;
