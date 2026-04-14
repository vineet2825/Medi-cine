const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    try {
        if (process.env.MONGO_URI) {
            console.log('Connecting to real MongoDB instance...');
            const conn = await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 5000 // 5 seconds timeout
            });
            console.log(`MongoDB Connected (Real DB): ${conn.connection.host}`);
        } else {
            console.log('No MONGO_URI found. Connecting to Auto-Memory DB...');
            const mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            const conn = await mongoose.connect(mongoUri);
            console.log(`MongoDB Connected (Auto-Memory DB): ${conn.connection.host}`);
        }
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        console.log('Falling back to local in-memory DB due to connection failure...');
        try {
            const mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            const conn = await mongoose.connect(mongoUri);
            console.log(`MongoDB Connected (Fallback-Memory DB): ${conn.connection.host}`);
        } catch (innerError) {
            console.error('Fatal Error: Could not connect to any database.');
            process.exit(1);
        }
    }
};

module.exports = connectDB;
