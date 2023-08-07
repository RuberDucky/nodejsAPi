const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2'); // Use mysql2 instead of pg for MySQL connection

const app = express();
const port = 3000; // You can change the port if needed

// Middleware
app.use(express.json()); // Replace bodyParser with express.json()
app.use(cors());

// Database configuration using environment variables
require('dotenv').config();

const pool = mysql.createPool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Route files
const signupRoute = require('./routes/signup');
const getCoverDesignsRoute = require('./routes/getCoverDesigns');
const verifyOtpRoute = require('./routes/verifyOtp');
const loginRoute = require('./routes/login');
const imageRoute =  require('./routes/images')
const uploadCoverDesign = require('./routes/uploadCoverDesign')
const coverIdupload = require('./routes/coverIdupload')
const uploadProfile = require('./routes/profileUpload')

// Use the route files
app.use('/signup', signupRoute);
app.use('/getCoverDesigns', getCoverDesignsRoute);
app.use('/verifyOtp', verifyOtpRoute);
app.use('/login', loginRoute);
app.use('/images', imageRoute);
app.use('/uploadCoverDesign', uploadCoverDesign);
app.use('/coveridupload', coverIdupload);
app.use('/uploadProfile', uploadProfile);

// Error handling middleware (optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
