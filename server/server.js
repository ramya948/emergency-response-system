require('dotenv').config({ path: require('path').join(__dirname, '.env') });
// Force IPv4 DNS resolution globally — fixes ENETUNREACH on Render Free Tier
require('dns').setDefaultResultOrder('ipv4first');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const emergencyRoutes = require('./routes/emergencies');
const responderRoutes = require('./routes/responders');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Allow any localhost port (so Vite port changes never break CORS)
const isAllowedOrigin = (origin) => {
    if (!origin) return true;
    if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return true;
    if (origin === 'https://emergency-response-system-five.vercel.app') return true;
    if (origin === 'https://emergency-response-system.onrender.com') return true;
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL.replace(/\/$/, '')) return true;
    return false;
};

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (isAllowedOrigin(origin)) callback(null, true);
            else callback(new Error('CORS blocked: ' + origin));
        },
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        credentials: true,
    },
});

// Store io on app for use in routes
app.set('io', io);

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) callback(null, true);
        else callback(new Error('CORS blocked: ' + origin));
    },
    credentials: true,
}));
app.use(express.json());

// Socket.io connection
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('responder_location_update', (data) => {
        io.emit('responder_location', data);
    });

    socket.on('emergency_accepted', (data) => {
        io.emit('emergency_accepted_broadcast', data);
    });

    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });
});
app.get('/', (req, res) => {
    res.send('🚑 AI Emergency Response System Backend Running');
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/responders', responderRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Emergency Response Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
