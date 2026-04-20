require('dotenv').config(); // Load environment variables immediately
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [process.env.ALLOWED_ORIGIN, 'http://localhost:3000', 'https://medi-cine.vercel.app'];
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Request Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/request', require('./routes/requestRoutes'));
app.use('/api/medicine', require('./routes/medicineRoutes'));

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Medicine Stock Inventory API is running');
});

// Seed admin function
const seedAdmin = async () => {
    try {
        const User = require('./models/User');
        const adminEmail = 'ambrosiagaming90@gmail.com';
        const adminExists = await User.findOne({ email: adminEmail });
        
        if (!adminExists) {
            await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: 'admin123', // Initial password
                role: 'admin',
                isVerified: true
            });
            console.log('✅ Admin account seeded: ambrosiagaming90@gmail.com / admin123');
        }
    } catch (error) {
        console.error('❌ Failed to seed admin:', error.message);
    }
};

// Start server
const startServer = async () => {
    try {
        console.log('🚀 Starting Medicine Stock Server...');
        await connectDB();
        await seedAdmin();
        
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`📡 Server listening on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Critical server failure:", error);
    }
};

startServer();
