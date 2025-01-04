const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const connectDB = require('./database');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const RateLimit = require('express-rate-limit');

require('dotenv').config(); 

const allowedOrigins = ['https://sec-rush.vercel.app'];

const gameSessionRoutes = require('./routes/sessions');
// initialise the application
const app = express()

// connecting to the mongoDB 
connectDB();

// set up rate limiter: maximum of five requests per minute
const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs
});


mongoose.set('sanitizeFilter', true);

// Middleware 
app.use(express.json());
app.use(cookieParser());
app.use(limiter);
app.use(mongoSanitize());
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests from allowed origins only
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'],   // Allowed headers
    credentials: true                                    // Allow cookies or credentials
  }));
// Replace prohibited characters instead of removing them (optional)
app.use(
    mongoSanitize({
        replaceWith: '_',
    })
);


// Routes 
app.use('/gameSession', gameSessionRoutes);

// Start the server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log('Server running on http://localhost:${PORT}');
});