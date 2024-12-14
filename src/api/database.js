const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {

        await mongoose.connect(process.env.MONGODB_URL, {dbName: 'secRush'});
        console.log('MongoDB connected successfully to SecRush');

    } catch (error) {
        // print the failure message
        console.log('Error Connecting to MongoDB');
        // exit the process
        process.exit(1);
    }
}

module.exports = connectDB;