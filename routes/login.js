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
  function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);
  }
  
  router.post('/', async (req, res) => {
    const { email, password } = req.body;

    try {
      // Fetch user data from the database based on the provided email
      const [result] = await pool.promise().query('SELECT * FROM users WHERE email = ?', [email]);
  
      if (result.length === 0) {
        res.status(401).json({ code: 401, status: 'error', error: 'Invalid email or password' });
      } else {
        const user = result[0];
        const match = await bcrypt.compare(password, user.password);
  
        if (match) {
          res.status(200).json({
            code: 200,
            status: 'success',
            data: {
              usercustomerId: user.usercustomerId,
              email: user.email,
              // You can include other user data here if needed
            },
          });
        } else {
          res.status(401).json({ code: 401, status: 'error', error: 'Invalid email or password' });
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ code: 500, status: 'error', error: 'Internal Server Error' });
    }

  });

  module.exports = router;