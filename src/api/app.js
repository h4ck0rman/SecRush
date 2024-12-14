const express = require('express');
const cookieParser = require("cookie-parser");
const connectDB = require('./database');
const RateLimit = require('express-rate-limit');
require('dotenv').config(); 

// initialise the application
const app = express()

// connecting to the mongoDB 
connectDB();

// set up rate limiter: maximum of five requests per minute
const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs
});

// Middleware 
app.use(express.json());
app.use(cookieParser());
app.use(limiter);

// Routes 


// Start the server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});