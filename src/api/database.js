const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

let isConnected;
const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing MongoDB connection');
        return;
    }
      
    try {
        const conn = await mongoose.connect(MONGODB_URI, {dbName: 'secRush'});
        isConnected = conn.connections[0].readyState;
        console.log('MongoDB connected successfully to SecRush');

    } catch (error) {
        // print the failure message
        console.log('Error Connecting to MongoDB');
        // exit the process
        process.exit(1);
    }
}

module.exports = connectDB;