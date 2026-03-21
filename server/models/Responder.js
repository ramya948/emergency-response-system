const mongoose = require('mongoose');

const responderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ['Paramedic', 'Firefighter', 'Police', 'General'],
        default: 'General',
    },
    location: {
        type: String,
        default: 'Unknown',
    },
    latitude: {
        type: Number,
        default: null,
    },
    longitude: {
        type: Number,
        default: null,
    },
    availability: {
        type: String,
        enum: ['Available', 'Busy', 'Off Duty'],
        default: 'Available',
    },
    currentEmergency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Emergency',
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Responder', responderSchema);
