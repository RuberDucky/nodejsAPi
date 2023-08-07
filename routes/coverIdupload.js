const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

const pool = mysql.createPool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

router.post('/', async (req, res) => {
  const { usercustomerId, cover_images_id } = req.body;

  try {
    // Update the 'cover_images_id' for the specific user in the 'users' table
    const query = `
      UPDATE users
      SET cover_images_id = ?
      WHERE usercustomerId = ?
    `;

    pool.query(query, [cover_images_id, usercustomerId], (err, result) => {
      if (err) {
        console.error('Error updating cover image ID:', err);
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' });
      }

      // Respond with success
      res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Cover image ID updated successfully for the user.',
      });
    });
  } catch (error) {
    console.error('Error updating cover image ID:', error);
    res.status(500).json({ status: 'error', error: 'Internal Server Error' });
  }
});

module.exports = router;
