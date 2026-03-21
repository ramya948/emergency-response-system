import { useEmergency } from '../context/EmergencyContext';
import { AlertTriangle, Users, CheckCircle, Activity, Radio, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmergencyCard from '../components/EmergencyCard';

const Home = () => {
    const { emergencies, stats, loading, connected } = useEmergency();
    const recent = emergencies.slice(0, 3);

    const statCards = [
        { label: 'Total Emergencies', value: stats.total, icon: AlertTriangle, color: 'var(--amber)', bg: 'rgba(245,158,11,0.1)' },
        { label: 'Active', value: stats.active, icon: Radio, color: 'var(--red)', bg: 'rgba(239,68,68,0.1)' },
        { label: 'In Progress', value: stats.inProgress, icon: Activity, color: 'var(--blue)', bg: 'rgba(59,130,246,0.1)' },
        { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'var(--green)', bg: 'rgba(34,197,94,0.1)' },
    ];

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Emergency Response Dashboard</h1>
                    <p className="page-subtitle">Real-time monitoring and response management</p>
                </div>
                <div className={`live-indicator ${connected ? 'live' : 'offline'}`}>
                    <span className="pulse-dot"></span>
                    {connected ? 'LIVE' : 'OFFLINE'}
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="stat-card" style={{ '--card-color': color, '--card-bg': bg }}>
                        <div className="stat-icon" style={{ background: bg }}>
                            <Icon size={24} style={{ color }} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{loading ? '...' : value}</span>
                            <span className="stat-label">{label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h2 className="section-title">Quick Actions</h2>
                <div className="action-buttons">
                    <Link to="/create" className="action-btn action-btn--primary">
                        <AlertTriangle size={20} />
                        <span>Report Emergency</span>
                        <ArrowRight size={16} />
                    </Link>
                    <Link to="/sos" className="action-btn action-btn--sos">
                        <Radio size={20} />
                        <span>SOS Alert</span>
                        <ArrowRight size={16} />
                    </Link>
                    <Link to="/responders" className="action-btn action-btn--secondary">
                        <Users size={20} />
                        <span>View Responders</span>
                        <ArrowRight size={16} />
                    </Link>
                    <Link to="/map" className="action-btn action-btn--map">
                        <Activity size={20} />
                        <span>Live Map</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>

            {/* Recent Emergencies */}
            <div className="recent-section">
                <div className="section-header">
                    <h2 className="section-title">
                        <Clock size={18} /> Recent Emergencies
                    </h2>
                    <Link to="/alerts" className="view-all-link">View All →</Link>
                </div>
                {loading ? (
                    <div className="loading-spinner">Loading...</div>
                ) : recent.length === 0 ? (
                    <div className="empty-state">
                        <CheckCircle size={48} />
                        <p>No emergencies reported. Stay safe!</p>
                    </div>
                ) : (
                    <div className="cards-grid">
                        {recent.map((e) => (
                            <EmergencyCard key={e._id} emergency={e} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
