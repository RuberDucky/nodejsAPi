const express = require('express');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const pool = mysql.createPool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

router.use('/UsersProfile', express.static('UsersProfile'));


// Function to generate a 9-digit random number
function generateRandomNumber() {
  const randomNumber = Math.floor(100000000 + Math.random() * 900000000);
  return randomNumber.toString();
}

router.post('/', async (req, res) => {
  const { usercustomerId, profile_pic } = req.body;

  // Decode the base64 image data
  const base64Data = profile_pic.replace(/^data:image\/png;base64,/, '');
  const decodedImage = Buffer.from(base64Data, 'base64');

  try {
    // Generate a 9-digit random number for the image name
    const randomNumber = generateRandomNumber();
    const imageExtension = '.png'; // You can change this to support other image formats

    // Create the new file name with the random number and extension
    const newFileName = `${randomNumber}${imageExtension}`;

    // Save the decoded image in the 'UserProfile' directory
    const imageDirectory = path.join(__dirname, '..', 'UsersProfile');
    const imagePath = path.join(imageDirectory, newFileName);
    fs.writeFileSync(imagePath, decodedImage);

    // Update the 'profile_picture' column for the specific user in the 'users' table
    const query = `
      UPDATE users
      SET profile_picture = ?
      WHERE usercustomerId = ?
    `;

    pool.query(query, [`/UsersProfile/${newFileName}`, usercustomerId], (err, result) => {
      if (err) {
        console.error('Error updating profile picture:', err);
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' });
      }

      // Respond with success
      res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Profile picture uploaded and path stored successfully.',
      });
    });
  } catch (error) {
    console.error('Error uploading and storing profile picture:', error);
    res.status(500).json({ status: 'error', error: 'Internal Server Error' });
  }
});

module.exports = router;
