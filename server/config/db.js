const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    try {
        if (process.env.MONGO_URI) {
            console.log('--- Database Connection Attempt ---');
            console.log('Connecting to real MongoDB instance...');
            // Add options for more robust connection debugging
            const conn = await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 8000 // 8 seconds timeout
            });
            console.log(`✅ MongoDB Connected (Real DB): ${conn.connection.host}`);
            console.log('-----------------------------------');
        } else {
            throw new Error('No MONGO_URI found in environment variables.');
        }
    } catch (error) {
        console.error(`❌ Database Connection Error: ${error.message}`);
        
        if (error.message.includes('ETIMEDOUT') || error.message.includes('Could not connect to any servers')) {
            console.warn('⚠️  TIP: This error usually means your IP Address is not whitelisted in MongoDB Atlas.');
        } else if (error.message.includes('Authentication failed')) {
            console.warn('⚠️  TIP: Check your MongoDB Username and Password in the .env file.');
        }

        console.log('Falling back to local in-memory DB due to connection failure...');
        console.log('⚠️  WARNING: Data will NOT be saved permanently in fallback mode.');
        
        try {
            const mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            const conn = await mongoose.connect(mongoUri);
            console.log(`✅ MongoDB Connected (Fallback-Memory DB): ${conn.connection.host}`);
        } catch (innerError) {
            console.error('🛑 Fatal Error: Could not connect to even a local database.');
            process.exit(1);
        }
    }
};

module.exports = connectDB;
