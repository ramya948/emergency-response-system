const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
        default: '',
    },
    emergencyType: {
        type: String,
        enum: ['Accident', 'Fire', 'Medical', 'Crime'],
        required: true,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    latitude: {
        type: Number,
        default: null,
    },
    longitude: {
        type: Number,
        default: null,
    },
    status: {
        type: String,
        enum: ['Active', 'In Progress', 'Resolved'],
        default: 'Active',
    },
    assignedResponder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Responder',
        default: null,
    },
    isSOS: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Emergency', emergencySchema);
