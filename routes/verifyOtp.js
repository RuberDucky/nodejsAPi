// routes/signup.js
const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const router = express.Router();

const pool = mysql.createPool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
  
  // Generate a 4-digit OTP
  
  router.post('/', async (req, res) => {
    const { usercustomerId, otp } = req.body;
    console.log('Received usercustomerId:', usercustomerId);
    console.log('Received otp:', otp);
  
    try {
      // Fetch the user data from the database based on the provided usercustomerId
      const [userQueryResult] = await pool.promise().query('SELECT * FROM users WHERE usercustomerId = ?', [usercustomerId]);
  
      if (userQueryResult.length === 0) {
        // User not found, return an error response
        console.log('User not found for usercustomerId:', usercustomerId);
        return res.status(404).json({ code: 404, status: 'error', error: 'User not found' });
      }
  
      const user = userQueryResult[0];
      console.log('Fetched user:', user);
  
  
      // Check the data type of user.otp and otp
      console.log('Data type of user.otp:', typeof user.otp);
      console.log('Data type of otp:', typeof otp);
  
  
      // Perform a strict comparison to ensure the data types match
      if (user.otp !== otp) {
        // Incorrect OTP, return an error response
        console.log('Incorrect OTP for usercustomerId:', usercustomerId);
        
        return res.status(401).json({ code: 401, status: 'error', error: 'Incorrect OTP' });
      }
  
      // OTP matched, return the success response with user data
      console.log('OTP verification successful for usercustomerId:', usercustomerId);
      res.status(200).json({
        code: 200,
        status: 'success',
        data: {
          usercustomerId: user.usercustomerId,
          email: user.email,
          // You can include other user data here if needed
        },
      });
    } catch (error) {
      console.error('Error during OTP verification:', error);
      res.status(500).json({ code: 500, status: 'error', error: 'Internal Server Error' });
    }
  });

  module.exports = router;
