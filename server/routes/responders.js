const express = require('express');
const router = express.Router();
const Responder = require('../models/Responder');

// @route GET /api/responders
router.get('/', async (req, res) => {
    try {
        const responders = await Responder.find().sort({ createdAt: -1 });
        res.json(responders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route POST /api/responders
router.post('/', async (req, res) => {
    const { name, phone, role, location, latitude, longitude } = req.body;
    try {
        const responder = new Responder({ name, phone, role, location, latitude, longitude });
        await responder.save();

        const io = req.app.get('io');
        if (io) io.emit('responder_added', responder);

        res.status(201).json(responder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route PATCH /api/responders/:id
router.patch('/:id', async (req, res) => {
    try {
        const responder = await Responder.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!responder) return res.status(404).json({ message: 'Responder not found' });

        const io = req.app.get('io');
        if (io) io.emit('responder_updated', responder);

        res.json(responder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route DELETE /api/responders/:id
router.delete('/:id', async (req, res) => {
    try {
        const responder = await Responder.findByIdAndDelete(req.params.id);
        if (!responder) return res.status(404).json({ message: 'Responder not found' });
        res.json({ message: 'Responder deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
