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
  

// Signup Endpoint
router.post('/', async (req, res) => {
  // Implementation of the /signup endpoint
  const { email, password, confirmPassword } = req.body;

  // Check if the password and confirm password match
  if (password !== confirmPassword) {
    return res.status(400).json({ code: 400, status: 'error', error: 'Passwords do not match' });
  }

// ... (Your existing signup code)

// ... (Your existing signup code)

try {
    // Check if the email already exists in the database
    const emailExistsResult = await pool.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (emailExistsResult[0].length > 0) {
      // Email already exists, send the response
      return res.status(409).json({ code: 409, status: 'error', error: 'Email already exists' });
    }
  
    // Generate a 4-digit OTP
    const otp = generateOTP();
  
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
  
    // Insert the new user data into the database
    const insertResult = await pool.promise().query(
      'INSERT INTO users (email, password, otp) VALUES (?, ?, ?)',
      [email, hashedPassword, otp]
    );
  
    const userId = insertResult[0].insertId;
  
    // Fetch the newly inserted user data from the database
    const [userQueryResult] = await pool.promise().query('SELECT * FROM users WHERE usercustomerId = ?', [userId]);
  
    if (userQueryResult.length === 0) {
      // User not found, return an error response
      return res.status(404).json({ code: 404, status: 'error', error: 'User not found' });
    }
  
    const user = userQueryResult[0];
  
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
  
    res.status(200).json({
      code: 200,
      status: 'success',
      data: responseData,
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ code: 500, status: 'error', error: 'Internal Server Error' });
  }
  
  
});

module.exports = router;
