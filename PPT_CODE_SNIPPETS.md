# 🚀 Emergency Response System - Key Code

---

### 1. Multi-Channel Alert Logic
```javascript
if (process.env.RESEND_API_KEY) {
    fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
            from: 'EmergencyAI <onboarding@resend.dev>',
            to: [process.env.ADMIN_EMAIL],
            subject: `🚨 New Emergency Report`,
            html: htmlBody
        })
    });
} else {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    transporter.sendMail(mailOptions);
}

if (hasTwilio) {
    const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    client.messages.create({
        body: `🚨 New Emergency reported at ${location}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.ADMIN_PHONE
    });
}
```

### 2. Live Map Tracking
```javascript
<MapContainer center={[20.5937, 78.9629]} zoom={5}>
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    
    {emergencies.map(emergency => (
        <Marker key={emergency._id} position={[emergency.latitude, emergency.longitude]}>
            <Popup>
                <strong>{emergency.emergencyType}</strong>
                <p>Status: {emergency.status}</p>
            </Popup>
        </Marker>
    ))}
    
    {activeResponders.map(res => (
        <Marker key={res._id} position={[res.latitude, res.longitude]} icon={icons.responder}>
            <Popup>🚑 {res.name} - {res.role}</Popup>
        </Marker>
    ))}
</MapContainer>
```

### 3. Real-Time Server Setup
```javascript
const io = require('socket.io')(server, {
    cors: { origin: process.env.CLIENT_URL }
});

app.set('io', io);

io.on('connection', (socket) => {
    console.log('User connected');
});

// Broadcast the event
io.emit('new_emergency', emergency);
```

### 4. Responsive Layout
```css
@media (max-width: 768px) {
    .map-tracking-container {
        flex-direction: column;
    }
    .map-container-wrapper {
        height: 400px;
        width: 100%;
    }
    .map-alerts-sidebar {
        width: 100%;
        order: 2;
    }
}
```
