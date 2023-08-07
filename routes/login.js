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
  
        // Construct the response data object
        const responseData = {
          usercustomerId: user.usercustomerId,
          email: user.email,
          otp: user.otp,
          one_signal_id: user.one_signal_id,
          cover_images_id: user.cover_images_id,
          full_name: user.full_name || null,
          username: user.username || null,
          account_type: user.account_type || null,
          profile_picture: user.profile_picture || null,
          social_acc_type: user.social_acc_type || null,
          google_access_token: user.google_access_token || null,
          facebook_id: user.facebook_id || null,
          date_added: user.date_added || null,
          status: user.status || null,
          notifications: user.notifications || null,
          be_seen: user.be_seen || null,
          first_name: user.first_name || null,
          middle_name: user.middle_name || null,
          last_name: user.last_name || null,
          phone_number: user.phone_number || null,
          gender: user.gender || null,
          nationality: user.nationality || null,
          dob: user.dob || null,
          number_of_pages: user.number_of_pages || null,
          currency: user.currency || null,
        };
  
        if (match) {
          res.status(200).json({
            code: 200,
            status: 'success',
            data: responseData,
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