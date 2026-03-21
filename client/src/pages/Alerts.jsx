import { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { toast } from 'react-toastify';
import EmergencyCard from '../components/EmergencyCard';
import { Bell, Filter, RefreshCw } from 'lucide-react';

const Alerts = () => {
    const { emergencies, loading, updateStatus, assignResponder, deleteEmergency, responders, fetchEmergencies } = useEmergency();
    const [filter, setFilter] = useState('All');

    const filters = ['All', 'Active', 'In Progress', 'Resolved'];

    const filtered = filter === 'All'
        ? emergencies
        : emergencies.filter((e) => e.status === filter);

    const handleStatusChange = async (id, status) => {
        try {
            await updateStatus(id, status);
            toast.success(`Status updated to ${status}`);
        } catch {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this emergency?')) return;
        try {
            await deleteEmergency(id);
            toast.success('Emergency deleted');
        } catch {
            toast.error('Failed to delete emergency');
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <Bell size={28} style={{ color: 'var(--amber)' }} /> Active Alerts
                    </h1>
                    <p className="page-subtitle">
                        {emergencies.filter(e => e.status === 'Active').length} active •{' '}
                        {emergencies.length} total emergencies
                    </p>
                </div>
                <button className="btn btn-secondary" onClick={fetchEmergencies}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <Filter size={16} />
                {filters.map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`filter-btn ${filter === f ? 'filter-btn--active' : ''}`}
                    >
                        {f}
                        <span className="filter-count">
                            {f === 'All' ? emergencies.length : emergencies.filter(e => e.status === f).length}
                        </span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading-spinner">Loading alerts...</div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <Bell size={48} />
                    <p>No {filter === 'All' ? '' : filter.toLowerCase()} emergencies</p>
                </div>
            ) : (
                <div className="cards-grid">
                    {filtered.map((e) => (
                        <EmergencyCard
                            key={e._id}
                            emergency={e}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDelete}
                            responders={responders}
                            onAssign={assignResponder}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Alerts;
