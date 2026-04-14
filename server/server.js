const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database removed from global space

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Built-in body parser
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/request', require('./routes/requestRoutes'));
app.use('/api/medicine', require('./routes/medicineRoutes'));

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Medicine Stock Inventory API is running');
});

// Connect to database and then listen
const startServer = async () => {
    try {
        await connectDB();
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error("Failed to start server:", error);
    }
};

startServer();
