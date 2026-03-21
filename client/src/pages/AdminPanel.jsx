import { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { toast } from 'react-toastify';
import { ShieldCheck, Search, Filter, Settings, Trash2 } from 'lucide-react';

const AdminPanel = () => {
    const { emergencies, responders, stats, updateStatus, assignResponder, deleteEmergency } = useEmergency();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');

    const filteredEmergencies = emergencies.filter((e) => {
        const matchesSearch =
            e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.emergencyType.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' || e.status === filter;
        return matchesSearch && matchesFilter;
    });

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this emergency record? This cannot be undone.')) {
            try {
                await deleteEmergency(id);
                toast.success('Emergency record deleted');
            } catch (err) {
                toast.error('Failed to delete emergency record');
            }
        }
    };

    return (
        <div className="page admin-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <ShieldCheck size={28} style={{ color: 'var(--purple)' }} /> Admin Control Panel
                    </h1>
                    <p className="page-subtitle">Manage all emergencies, dispatch units, and system settings</p>
                </div>
            </div>

            <div className="admin-stats">
                <div className="admin-stat-card">
                    <div className="stat-name">Total Incidents</div>
                    <div className="stat-val">{stats.total}</div>
                </div>
                <div className="admin-stat-card">
                    <div className="stat-name">Active Alerts</div>
                    <div className="stat-val text-danger">{stats.active}</div>
                </div>
                <div className="admin-stat-card">
                    <div className="stat-name">Units Dispatched</div>
                    <div className="stat-val text-warning">{stats.inProgress}</div>
                </div>
                <div className="admin-stat-card">
                    <div className="stat-name">Resolved Cases</div>
                    <div className="stat-val text-success">{stats.resolved}</div>
                </div>
                <div className="admin-stat-card">
                    <div className="stat-name">Total Responders</div>
                    <div className="stat-val">{responders.length}</div>
                </div>
            </div>

            <div className="admin-content">
                <div className="admin-toolbar">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, location, or type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-dropdown">
                        <Filter size={18} />
                        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option value="All">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                    </div>
                    <button className="btn btn-secondary"><Settings size={18} /> Settings</button>
                </div>

                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Priority</th>
                                <th>Location</th>
                                <th>Reporter</th>
                                <th>Time</th>
                                <th>Status</th>
                                <th>Dispatcher/Unit</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmergencies.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="empty-row">No records found matching criteria</td>
                                </tr>
                            ) : (
                                filteredEmergencies.map((e) => (
                                    <tr key={e._id} className={e.isSOS ? 'sos-row' : ''}>
                                        <td>
                                            <span className={`type-dot type-dot--${e.emergencyType.toLowerCase()}`}></span>
                                            {e.emergencyType}
                                        </td>
                                        <td>{e.isSOS ? <span className="badge badge-critical">SOS / HIGH</span> : <span className="badge badge-normal">NORMAL</span>}</td>
                                        <td>{e.location}</td>
                                        <td>{e.name}</td>
                                        <td>{new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td>
                                            <select
                                                className={`status-select status-${e.status.replace(' ', '').toLowerCase()}`}
                                                value={e.status}
                                                onChange={(ev) => updateStatus(e._id, ev.target.value)}
                                            >
                                                <option value="Active">Active</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Resolved">Resolved</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select
                                                className="unit-select"
                                                value={e.assignedResponder?._id || ''}
                                                onChange={(ev) => assignResponder(e._id, ev.target.value)}
                                                disabled={e.status === 'Resolved'}
                                            >
                                                <option value="">Unassigned</option>
                                                {responders.map(r => (
                                                    <option key={r._id} value={r._id}>{r.name} ({r.role})</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <button className="btn-icon text-danger" onClick={() => handleDelete(e._id)} title="Delete Record">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
