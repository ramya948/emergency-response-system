import { AlertTriangle, Clock, MapPin, User, CheckCircle, ArrowRight } from 'lucide-react';

const typeColors = {
    Accident: 'orange',
    Fire: 'red',
    Medical: 'blue',
    Crime: 'purple',
};

const statusColors = {
    Active: 'status-active',
    'In Progress': 'status-progress',
    Resolved: 'status-resolved',
};

const EmergencyCard = ({ emergency, onStatusChange, onAssign, onDelete, responders = [] }) => {
    const color = typeColors[emergency.emergencyType] || 'gray';
    const timeAgo = (date) => {
        const diff = Math.floor((Date.now() - new Date(date)) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return `${Math.floor(diff / 3600)}h ago`;
    };

    return (
        <div className={`emergency-card emergency-card--${color} ${emergency.isSOS ? 'emergency-card--sos' : ''}`}>
            {emergency.isSOS && <div className="sos-badge">🚨 SOS</div>}
            <div className="card-header">
                <div className="card-type-badge" style={{ '--type-color': `var(--${color})` }}>
                    <AlertTriangle size={14} />
                    {emergency.emergencyType}
                </div>
                <span className={`status-badge ${statusColors[emergency.status]}`}>
                    {emergency.status}
                </span>
            </div>

            <div className="card-body">
                <div className="card-info-row">
                    <User size={14} />
                    <strong>{emergency.name}</strong>
                </div>
                <div className="card-info-row">
                    <MapPin size={14} />
                    <span>{emergency.location}</span>
                </div>
                <p className="card-description">{emergency.description}</p>
                <div className="card-info-row">
                    <Clock size={14} />
                    <span>{timeAgo(emergency.createdAt)}</span>
                </div>
                {emergency.assignedResponder && (
                    <div className="card-info-row assigned-responder">
                        <CheckCircle size={14} />
                        <span>Assigned: {emergency.assignedResponder.name}</span>
                    </div>
                )}
            </div>

            {(onStatusChange || onAssign || onDelete) && (
                <div className="card-actions">
                    {onStatusChange && emergency.status !== 'Resolved' && (
                        <>
                            {emergency.status === 'Active' && (
                                <button
                                    className="btn btn-sm btn-warning"
                                    onClick={() => onStatusChange(emergency._id, 'In Progress')}
                                >
                                    <ArrowRight size={12} /> In Progress
                                </button>
                            )}
                            <button
                                className="btn btn-sm btn-success"
                                onClick={() => onStatusChange(emergency._id, 'Resolved')}
                            >
                                <CheckCircle size={12} /> Resolve
                            </button>
                        </>
                    )}
                    {onAssign && responders.length > 0 && emergency.status !== 'Resolved' && (
                        <select
                            className="btn btn-sm btn-assign"
                            onChange={(e) => e.target.value && onAssign(emergency._id, e.target.value)}
                            defaultValue=""
                        >
                            <option value="" disabled>Assign Responder</option>
                            {responders.filter(r => r.availability === 'Available').map(r => (
                                <option key={r._id} value={r._id}>{r.name} ({r.role})</option>
                            ))}
                        </select>
                    )}
                    {onDelete && (
                        <button className="btn btn-sm btn-danger" onClick={() => onDelete(emergency._id)}>
                            Delete
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmergencyCard;
