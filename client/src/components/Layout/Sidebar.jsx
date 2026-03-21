import { NavLink } from 'react-router-dom';
import {
    Home, AlertTriangle, Radio, Users, ShieldCheck, Bell, Map, Activity
} from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';

const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/create', label: 'Create Emergency', icon: AlertTriangle },
    { to: '/sos', label: 'SOS Alert', icon: Radio },
    { to: '/responders', label: 'Responders', icon: Users },
    { to: '/admin', label: 'Admin Panel', icon: ShieldCheck },
    { to: '/alerts', label: 'Alerts', icon: Bell },
    { to: '/map', label: 'Map Tracking', icon: Map },
];

const Sidebar = () => {
    const { stats, connected } = useEmergency();

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <Activity size={28} className="logo-icon" />
                    <span>EmergencyAI</span>
                </div>
                <div className={`connection-status ${connected ? 'online' : 'offline'}`}>
                    <span className="status-dot"></span>
                    {connected ? 'Live' : 'Offline'}
                </div>
            </div>

            <div className="sidebar-stats">
                <div className="stat-pill active">
                    <span>{stats.active}</span>
                    <span>Active</span>
                </div>
                <div className="stat-pill progress">
                    <span>{stats.inProgress}</span>
                    <span>In Progress</span>
                </div>
                <div className="stat-pill resolved">
                    <span>{stats.resolved}</span>
                    <span>Resolved</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Icon size={20} />
                        <span>{label}</span>
                        {label === 'Alerts' && stats.active > 0 && (
                            <span className="nav-badge">{stats.active}</span>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <p>AI Emergency Response</p>
                <p>v1.0.0</p>
            </div>
        </aside>
    );
};

export default Sidebar;
