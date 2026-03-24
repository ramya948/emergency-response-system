import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEmergency } from '../context/EmergencyContext';
import { Map as MapIcon, AlertTriangle } from 'lucide-react';

// Fix for default Leaflet marker icons not loading in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Symbol Icons
const createSymbolIcon = (color, symbol) => new L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3); font-size: 16px;">${symbol}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
});

const icons = {
    sos:       createSymbolIcon('#ef4444', '🚨'),
    fire:      createSymbolIcon('#f97316', '🔥'),
    medical:   createSymbolIcon('#22c55e', '➕'),
    crime:     createSymbolIcon('#8b5cf6', '🛡️'),
    accident:  createSymbolIcon('#eab308', '⚠️'),
    default:   createSymbolIcon('#6b7280', '📍'),
    responder: createSymbolIcon('#3b82f6', '🚑'),
};

const getMarkerIcon = (type, isSOS) => {
    if (isSOS) return icons.sos;
    switch (type) {
        case 'Fire':      return icons.fire;
        case 'Medical':   return icons.medical;
        case 'Crime':     return icons.crime;
        case 'Accident':  return icons.accident;
        case 'Responder': return icons.responder;
        default:          return icons.default;
    }
};

const statusColor = (status) => {
    switch (status) {
        case 'Pending':     return '#ef4444';
        case 'In Progress': return '#f97316';
        case 'Resolved':    return '#22c55e';
        default:            return '#6b7280';
    }
};

const typeEmoji = (type, isSOS) => {
    if (isSOS) return '🚨';
    switch (type) {
        case 'Fire':     return '🔥';
        case 'Medical':  return '➕';
        case 'Crime':    return '🛡️';
        case 'Accident': return '⚠️';
        default:         return '📍';
    }
};

const defaultCenter = [12.9716, 77.5946];

const MapTracking = () => {
    const { emergencies, responders } = useEmergency();
    const [selectedAlert, setSelectedAlert] = useState(null);

    const activeEmergencies = useMemo(
        () => emergencies.filter((e) => e.status !== 'Resolved' && e.latitude && e.longitude),
        [emergencies]
    );

    // All active alerts (including those without coordinates) for the sidebar
    const allActiveAlerts = useMemo(
        () => emergencies.filter((e) => e.status !== 'Resolved'),
        [emergencies]
    );

    const activeResponders = useMemo(
        () => responders.filter((r) => r.latitude && r.longitude),
        [responders]
    );

    const initialCenter = activeEmergencies.length > 0
        ? [activeEmergencies[0].latitude, activeEmergencies[0].longitude]
        : defaultCenter;

    return (
        <div className="page map-page">
            {/* Header */}
            <div className="page-header" style={{ flexShrink: 0 }}>
                <div>
                    <h1 className="page-title">
                        <MapIcon size={28} style={{ color: 'var(--green)' }} /> Live Tracking Map
                    </h1>
                    <p className="page-subtitle">Real-time geographic visualization of all incidents and operational units</p>
                </div>
                <div className="map-legend">
                    <span className="legend-item"><span style={{ fontSize: '18px' }}>🚨</span> SOS</span>
                    <span className="legend-item"><span style={{ fontSize: '18px' }}>🔥</span> Fire</span>
                    <span className="legend-item"><span style={{ fontSize: '18px' }}>➕</span> Medical</span>
                    <span className="legend-item"><span style={{ fontSize: '18px' }}>⚠️</span> Accident</span>
                    <span className="legend-item"><span style={{ fontSize: '18px' }}>🛡️</span> Crime</span>
                    <span className="legend-item"><span style={{ fontSize: '18px' }}>🚑</span> Responder</span>
                </div>
            </div>

            {/* Map + Sidebar */}
            <div className="map-layout-wrapper">

                {/* Map */}
                <div className="map-view-container">
                    <MapContainer center={initialCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
                        {/* ✅ White / Light tile layer */}
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        />

                        {/* Emergency Markers */}
                        {activeEmergencies.map((inc) => (
                            <Marker
                                key={`em-${inc._id}`}
                                position={[inc.latitude, inc.longitude]}
                                icon={getMarkerIcon(inc.emergencyType, inc.isSOS)}
                                eventHandlers={{ click: () => setSelectedAlert(inc) }}
                            >
                                <Popup>
                                    <div className="info-window-content">
                                        <h4 style={{ margin: '0 0 6px', fontSize: '14px' }}>
                                            {inc.isSOS ? '🚨 SOS · ' : typeEmoji(inc.emergencyType) + ' '}
                                            {inc.emergencyType} Emergency
                                        </h4>
                                        <p style={{ margin: '2px 0', fontSize: '12px' }}><strong>Reporter:</strong> {inc.name}</p>
                                        <p style={{ margin: '2px 0', fontSize: '12px' }}><strong>Location:</strong> {inc.location}</p>
                                        <p style={{ margin: '2px 0', fontSize: '12px' }}>
                                            <strong>Status:</strong>{' '}
                                            <span style={{ color: statusColor(inc.status), fontWeight: 600 }}>{inc.status}</span>
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        {/* Responder Markers */}
                        {activeResponders.map((res) => (
                            <Marker
                                key={`res-${res._id}`}
                                position={[res.latitude, res.longitude]}
                                icon={icons.responder}
                            >
                                <Popup>
                                    <div className="info-window-content">
                                        <h4 style={{ margin: '0 0 6px', fontSize: '14px' }}>🚑 {res.name}</h4>
                                        <p style={{ margin: '2px 0', fontSize: '12px' }}><strong>Role:</strong> {res.role}</p>
                                        <p style={{ margin: '2px 0', fontSize: '12px' }}><strong>Status:</strong> {res.availability}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                {/* Active Alerts Sidebar */}
                <div className="map-alerts-sidebar">
                    <div style={{
                        background: 'var(--card)',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        border: '1px solid var(--border)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                        <AlertTriangle size={18} color="#ef4444" />
                        <span style={{ fontWeight: 700, fontSize: '14px' }}>
                            Active Alerts
                        </span>
                        <span style={{
                            marginLeft: 'auto',
                            background: '#ef4444',
                            color: '#fff',
                            borderRadius: '20px',
                            padding: '2px 10px',
                            fontSize: '12px',
                            fontWeight: 700,
                        }}>
                            {allActiveAlerts.length}
                        </span>
                    </div>

                    {allActiveAlerts.length === 0 ? (
                        <div style={{
                            background: 'var(--card)',
                            borderRadius: '12px',
                            padding: '24px 16px',
                            textAlign: 'center',
                            border: '1px solid var(--border)',
                            color: 'var(--text-secondary)',
                            fontSize: '13px',
                        }}>
                            ✅ No active alerts
                        </div>
                    ) : (
                        allActiveAlerts.map((alert) => (
                            <div
                                key={alert._id}
                                onClick={() => setSelectedAlert(alert)}
                                style={{
                                    background: selectedAlert?._id === alert._id ? 'var(--bg-hover, rgba(99,102,241,0.08))' : 'var(--card)',
                                    borderRadius: '12px',
                                    padding: '12px 14px',
                                    border: `1px solid ${selectedAlert?._id === alert._id ? '#6366f1' : 'var(--border)'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '20px' }}>{typeEmoji(alert.emergencyType, alert.isSOS)}</span>
                                    <span style={{ fontWeight: 600, fontSize: '13px', flex: 1 }}>
                                        {alert.isSOS ? 'SOS · ' : ''}{alert.emergencyType}
                                    </span>
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: statusColor(alert.status),
                                        background: statusColor(alert.status) + '22',
                                        borderRadius: '8px',
                                        padding: '2px 8px',
                                    }}>
                                        {alert.status}
                                    </span>
                                </div>
                                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                    👤 {alert.name}
                                </p>
                                <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                    📍 {alert.location || 'No location info'}
                                </p>
                                {!alert.latitude && (
                                    <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#f97316', fontStyle: 'italic' }}>
                                        ⚠️ No GPS coordinates — not shown on map
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MapTracking;
