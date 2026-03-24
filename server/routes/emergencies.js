const express = require('express');
const router = express.Router();
const Emergency = require('../models/Emergency');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// @route GET /api/emergencies
router.get('/', async (req, res) => {
    try {
        const emergencies = await Emergency.find()
            .populate('assignedResponder', 'name phone role')
            .sort({ createdAt: -1 });
        res.json(emergencies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route POST /api/emergencies
router.post('/', async (req, res) => {
    const { name, phone, emergencyType, location, description, latitude, longitude, isSOS } = req.body;
    try {
        const emergency = new Emergency({
            name,
            phone,
            emergencyType,
            location,
            description,
            latitude,
            longitude,
            isSOS: isSOS || false,
        });
        await emergency.save();

        // Emit socket event - io is attached to app
        const io = req.app.get('io');
        if (io) {
            io.emit('new_emergency', emergency);
        }

        // Try to send Email notification (non-blocking)
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.ADMIN_EMAIL) {
            const dns = require('dns');
            // Use Brevo SMTP relay if configured (works on Render), else fall back to Gmail (works locally)
            const useBrevo = process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_PASS;
            const transporter = nodemailer.createTransport(useBrevo ? {
                host: 'smtp-relay.brevo.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.BREVO_SMTP_USER,
                    pass: process.env.BREVO_SMTP_PASS
                }
            } : {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                requireTLS: true,
                lookup: (hostname, options, callback) => {
                    dns.lookup(hostname, { ...options, family: 4 }, callback);
                },
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const createdTime = new Date(emergency.createdAt).toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                dateStyle: 'full',
                timeStyle: 'medium'
            });

            const sosLabel = emergency.isSOS
                ? '<span style="background:#ef4444;color:#fff;padding:4px 12px;border-radius:20px;font-weight:700;font-size:13px;">🚨 SOS ALERT</span>'
                : '';

            const htmlBody = `
            <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                <!-- Header -->
                <div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:24px 28px;color:#fff;">
                    <h1 style="margin:0;font-size:22px;">🚨 New Emergency Report</h1>
                    <p style="margin:6px 0 0;opacity:0.9;font-size:14px;">A new emergency has been reported and requires attention</p>
                </div>

                <!-- Body -->
                <div style="padding:24px 28px;background:#ffffff;">
                    ${sosLabel ? '<div style="margin-bottom:16px;">' + sosLabel + '</div>' : ''}

                    <table style="width:100%;border-collapse:collapse;font-size:14px;">
                        <tr style="border-bottom:1px solid #f3f4f6;">
                            <td style="padding:10px 0;color:#6b7280;width:140px;vertical-align:top;">📋 Emergency Type</td>
                            <td style="padding:10px 0;font-weight:600;color:#111827;">${emergencyType}</td>
                        </tr>
                        <tr style="border-bottom:1px solid #f3f4f6;">
                            <td style="padding:10px 0;color:#6b7280;vertical-align:top;">👤 Reporter Name</td>
                            <td style="padding:10px 0;font-weight:600;color:#111827;">${name}</td>
                        </tr>
                        <tr style="border-bottom:1px solid #f3f4f6;">
                            <td style="padding:10px 0;color:#6b7280;vertical-align:top;">📞 Phone</td>
                            <td style="padding:10px 0;font-weight:600;color:#111827;">${phone || 'Not provided'}</td>
                        </tr>
                        <tr style="border-bottom:1px solid #f3f4f6;">
                            <td style="padding:10px 0;color:#6b7280;vertical-align:top;">📍 Location</td>
                            <td style="padding:10px 0;font-weight:600;color:#111827;">${location}</td>
                        </tr>
                        ${latitude && longitude ? `
                        <tr style="border-bottom:1px solid #f3f4f6;">
                            <td style="padding:10px 0;color:#6b7280;vertical-align:top;">🌐 GPS Coordinates</td>
                            <td style="padding:10px 0;font-weight:600;color:#111827;">${latitude}, ${longitude}</td>
                        </tr>` : ''}
                        <tr style="border-bottom:1px solid #f3f4f6;">
                            <td style="padding:10px 0;color:#6b7280;vertical-align:top;">📝 Description</td>
                            <td style="padding:10px 0;color:#111827;">${description}</td>
                        </tr>
                        <tr style="border-bottom:1px solid #f3f4f6;">
                            <td style="padding:10px 0;color:#6b7280;vertical-align:top;">🔴 Status</td>
                            <td style="padding:10px 0;">
                                <span style="background:#fef2f2;color:#dc2626;padding:3px 10px;border-radius:8px;font-weight:600;font-size:13px;">${emergency.status}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:10px 0;color:#6b7280;vertical-align:top;">🕐 Created At</td>
                            <td style="padding:10px 0;font-weight:600;color:#111827;">${createdTime}</td>
                        </tr>
                    </table>
                </div>

                <!-- Footer -->
                <div style="padding:16px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
                    <p style="margin:0;font-size:13px;color:#6b7280;">
                        Please check the <strong>Emergency Response Dashboard</strong> for more details and actions.
                    </p>
                </div>
            </div>`;

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.ADMIN_EMAIL,
                subject: `🚨 New Emergency Report: ${emergencyType}${emergency.isSOS ? ' [SOS]' : ''} — ${name}`,
                html: htmlBody
            };
            console.log(`📧 Attempting to send email to ${process.env.ADMIN_EMAIL}...`);
            transporter.sendMail(mailOptions)
                .then(info => console.log(`✅ Email sent successfully! ID: ${info.messageId}`))
                .catch(err => console.error('❌ Failed to send email:', err.message));
        }

        // Try to send SMS notification via Twilio (non-blocking)
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER && process.env.ADMIN_PHONE) {
            const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            client.messages.create({
                body: `🚨 New Emergency (${emergencyType}) reported by ${name} at ${location}. Details: ${description}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: process.env.ADMIN_PHONE
            }).catch(err => console.error('Failed to send SMS:', err.message));
        }

        res.status(201).json(emergency);
    } catch (error) {
        console.error('Error creating emergency:', error);
        res.status(500).json({ message: error.message });
    }
});

// @route PATCH /api/emergencies/:id/status
router.patch('/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        const emergency = await Emergency.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('assignedResponder', 'name phone role');

        if (!emergency) return res.status(404).json({ message: 'Emergency not found' });

        const io = req.app.get('io');
        if (io) {
            io.emit('emergency_updated', emergency);
        }

        res.json(emergency);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route PATCH /api/emergencies/:id/assign
router.patch('/:id/assign', async (req, res) => {
    const { responderId } = req.body;
    try {
        const emergency = await Emergency.findByIdAndUpdate(
            req.params.id,
            { assignedResponder: responderId, status: 'In Progress' },
            { new: true }
        ).populate('assignedResponder', 'name phone role');

        if (!emergency) return res.status(404).json({ message: 'Emergency not found' });

        const io = req.app.get('io');
        if (io) {
            io.emit('emergency_updated', emergency);
        }

        res.json(emergency);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route DELETE /api/emergencies/:id
router.delete('/:id', async (req, res) => {
    try {
        const emergency = await Emergency.findByIdAndDelete(req.params.id);
        if (!emergency) return res.status(404).json({ message: 'Emergency not found' });

        const io = req.app.get('io');
        if (io) {
            io.emit('emergency_deleted', { id: req.params.id });
        }

        res.json({ message: 'Emergency deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route GET /api/emergencies/stats
router.get('/stats', async (req, res) => {
    try {
        const total = await Emergency.countDocuments();
        const active = await Emergency.countDocuments({ status: 'Active' });
        const inProgress = await Emergency.countDocuments({ status: 'In Progress' });
        const resolved = await Emergency.countDocuments({ status: 'Resolved' });
        res.json({ total, active, inProgress, resolved });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
