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

// Serve static files from the 'PassportImages' directory
router.use('/PassportImages', express.static('PassportImages'));

// Function to generate a 9-digit random number
function generateRandomNumber() {
  const randomNumber = Math.floor(100000000 + Math.random() * 900000000);
  return randomNumber.toString();
}

router.post('/', async (req, res) => {
  const { coverImageName, base64Image } = req.body;

  // Decode the base64 image data
  const base64Data = base64Image.replace(/^data:image\/png;base64,/, '');
  const decodedImage = Buffer.from(base64Data, 'base64');

  try {
    // Generate a 9-digit random number for the image name
    const randomNumber = generateRandomNumber();
    const imageExtension = '.png'; // You can change this to support other image formats

    // Create the new file name with the random number and extension
    const newFileName = `${randomNumber}${imageExtension}`;

    // Save the decoded image in the 'PassportImages' folder
    const imageDirectory = path.join(__dirname, '..', 'PassportImages');
    const imagePath = path.join(imageDirectory, newFileName);
    fs.writeFileSync(imagePath, decodedImage);

    // Store the image path in the database
    const query = 'INSERT INTO cover_design (name, imageurl) VALUES (?, ?)';
    pool.query(query, [coverImageName, `/PassportImages/${newFileName}`], (err, result) => {
      if (err) {
        console.error('Error storing image path in the database:', err);
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' });
      }

      // Respond with success
      res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Image uploaded and path stored successfully.',
      });
    });
  } catch (error) {
    console.error('Error uploading and storing image:', error);
    res.status(500).json({ status: 'error', error: 'Internal Server Error' });
  }
});

module.exports = router;
