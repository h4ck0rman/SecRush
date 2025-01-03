const express = require('express');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const RateLimit = require('express-rate-limit');
const serverless = require('serverless-http');
const cors = require('cors');

require('dotenv').config();

const gameSessionRoutes = require('./routes/sessions');
const connectDB = require('./database');

const allowedOrigins = ['https://sec-rush.vercel.app'];

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

// Routes
app.use('/gameSession', gameSessionRoutes);

// Export the app as a handler for serverless
module.exports.handler = serverless(app);
