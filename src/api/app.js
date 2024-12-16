const express = require('express');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const RateLimit = require('express-rate-limit');
const serverless = require('serverless-http');

require('dotenv').config();

const gameSessionRoutes = require('./routes/sessions');
const connectDB = require('./database');

// Initialise the application
const app = express();

app.set('trust proxy', 2);
// Connect to MongoDB
connectDB();

// Set up rate limiter: maximum of 100 requests per 15 minutes
const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(limiter);
app.use(mongoSanitize({
  replaceWith: '_', // Replace prohibited characters instead of removing them (optional)
}));

// Routes
app.use('/gameSession', gameSessionRoutes);

// Export the app as a handler for serverless
module.exports.handler = serverless(app);
