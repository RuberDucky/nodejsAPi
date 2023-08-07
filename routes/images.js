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
  const { usercustomerId } = req.body;
  console.log('Received usercustomerId:', usercustomerId);

  // Fetch the list of files in the 'PassportImages' directory
  const imageDirectory = path.join(__dirname, '..', 'PassportImages'); // Change this line
  fs.readdir(imageDirectory, (err, files) => {
    if (err) {
      console.error('Error reading images directory:', err);
      return res.status(500).json({ status: 'error', error: 'Internal Server Error' });
    }

    try {
      // Create a list of image objects with image data (cover_images_id, name, status, date_added) and URL
      const imagesList = files.map((fileName, index) => {
        const imageUrl = `/PassportImages/${fileName}`; // This will generate the URL for each image
        const imageId = (index + 1).toString(); // Generate sequential image IDs starting from 1
        const imageName = `Cover Design Image ${imageId}`;

        return {
          cover_images_id: imageId,
          name: imageName,
          url: imageUrl,
        };
      });

      // Respond with the list of images and their data
      res.status(200).json({
        code: 200,
        status: 'success',
        data: imagesList,
      });
    } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).json({ status: 'error', error: 'Internal Server Error' });
    }
  });
});

module.exports = router;
