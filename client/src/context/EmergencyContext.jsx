import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../api/axios';

const EmergencyContext = createContext(null);

export const useEmergency = () => useContext(EmergencyContext);

export const EmergencyProvider = ({ children }) => {
    const [emergencies, setEmergencies] = useState([]);
    const [responders, setResponders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ total: 0, active: 0, inProgress: 0, resolved: 0 });
    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);

    const fetchEmergencies = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/emergencies');
            setEmergencies(res.data);
        } catch (err) {
            console.error('Failed to fetch emergencies', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchResponders = useCallback(async () => {
        try {
            const res = await api.get('/api/responders');
            setResponders(res.data);
        } catch (err) {
            console.error('Failed to fetch responders', err);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const res = await api.get('/api/emergencies/stats');
            setStats(res.data);
        } catch (err) {
            console.error('Failed to fetch stats', err);
        }
    }, []);

    useEffect(() => {
        fetchEmergencies();
        fetchResponders();
        fetchStats();
    }, [fetchEmergencies, fetchResponders, fetchStats]);

    useEffect(() => {
        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
            transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));

        socket.on('new_emergency', (emergency) => {
            setEmergencies((prev) => [emergency, ...prev]);
            setStats((prev) => ({
                ...prev,
                total: prev.total + 1,
                active: prev.active + 1,
            }));
        });

        socket.on('emergency_updated', (updated) => {
            setEmergencies((prev) =>
                prev.map((e) => (e._id === updated._id ? updated : e))
            );
            fetchStats();
        });

        socket.on('emergency_deleted', ({ id }) => {
            setEmergencies((prev) => prev.filter((e) => e._id !== id));
            fetchStats();
        });

        socket.on('responder_added', (responder) => {
            setResponders((prev) => [responder, ...prev]);
        });

        socket.on('responder_updated', (updated) => {
            setResponders((prev) =>
                prev.map((r) => (r._id === updated._id ? updated : r))
            );
        });

        return () => socket.disconnect();
    }, [fetchStats]);

    const createEmergency = async (data) => {
        const res = await api.post('/api/emergencies', data);
        return res.data;
    };

    const updateStatus = async (id, status) => {
        const res = await api.patch(`/api/emergencies/${id}/status`, { status });
        return res.data;
    };

    const assignResponder = async (id, responderId) => {
        const res = await api.patch(`/api/emergencies/${id}/assign`, { responderId });
        return res.data;
    };

    const deleteEmergency = async (id) => {
        await api.delete(`/api/emergencies/${id}`);
    };

    const createResponder = async (data) => {
        const res = await api.post('/api/responders', data);
        return res.data;
    };

    const updateResponder = async (id, data) => {
        const res = await api.patch(`/api/responders/${id}`, data);
        return res.data;
    };

    return (
        <EmergencyContext.Provider
            value={{
                emergencies,
                responders,
                loading,
                stats,
                connected,
                socket: socketRef.current,
                fetchEmergencies,
                fetchResponders,
                createEmergency,
                updateStatus,
                assignResponder,
                deleteEmergency,
                createResponder,
                updateResponder,
            }}
        >
            {children}
        </EmergencyContext.Provider>
    );
};
