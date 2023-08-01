const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2'); // Use mysql2 instead of pg for MySQL connection

const app = express();
const port = 3000; // You can change the port if needed

// Database configuration using environment variables
require('dotenv').config();

// Database configuration using environment variables
const pool = mysql.createPool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.use(express.json()); // Replace bodyParser with express.json()
app.use(cors());

// Generate a 4-digit OTP
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000);
}

// Signup Endpoint
app.post('/signup', async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  // Check if the password and confirm password match
  if (password !== confirmPassword) {
    return res.status(400).json({ code: 400, status: 'error', error: 'Passwords do not match' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a 4-digit OTP
    const otp = generateOTP();

    // Check if the email already exists in the database
    const emailExistsResult = await pool.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (emailExistsResult[0].length > 0) {
      // Email already exists, send the response
      return res.status(409).json({ code: 409, status: 'error', error: 'Email already exists' });
    }

    // Insert the new user data into the database
    const insertResult = await pool.promise().query(
      'INSERT INTO users (email, password, otp) VALUES (?, ?, ?)',
      [email, hashedPassword, otp]
    );

    const userId = insertResult[0].insertId;

    // Send OTP to the user's email (same as before)
    // ...

    // Respond with the desired format
    res.status(200).json({
      code: 200,
      status: 'success',
      data: {
        usercustomerId: userId,
        email: email,
        otp: otp,
      },
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ code: 500, status: 'error', error: 'Internal Server Error' });
  }
});

app.post('/verify-otp', async (req, res) => {
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



// Function to convert an image to Base64 URL
function imageToBase64Url(imagePath) {
  try {
    const image = fs.readFileSync(imagePath);
    const mimeType = `data:image/${path.extname(imagePath).substring(1)};base64,`;
    return mimeType + image.toString('base64');
  } catch (error) {
    console.error('Error converting image to Base64:', error);
    return null;
  }
}

// API endpoint to fetch images and their names
app.post('/images', async (req, res) => {
  const { usercustomerId } = req.body;
  console.log('Received usercustomerId:', usercustomerId);
  try {
    // Fetch the user data from the database based on the provided usercustomerId
    const [userQueryResult] = await pool.promise().query('SELECT * FROM users WHERE usercustomerId = ?', [usercustomerId]);

    if (userQueryResult.length === 0) {
      // User not found, return an error response
      return res.status(404).json({ code: 404, status: 'error', error: 'User not found' });
    }

    // Assuming you have a list of image names in an array called 'imageNames'
    const imageNames = ['images1.jpg', 'images2.jpg', 'images3.jpg', 'images4.jpg', 'images5.jpg'];

    // Create a list of image objects with image name and Base64 URL
    const imagesList = imageNames.map((imageName) => {
      const imagePath = path.join(__dirname, 'PassportImages', imageName);
      const imageUrl = imageToBase64Url(imagePath);

      return {
        name: imageName,
        url: imageUrl,
      };
    });

    // Respond with the list of images and their names
    res.status(200).json({
      code: 200,
      status: 'success',
      data: imagesList,
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ code: 500, status: 'error', error: 'Internal Server Error' });
  }
});

// Login Endpoint
app.post('/login', async (req, res) => {
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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
