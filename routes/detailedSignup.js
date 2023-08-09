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
  const {
    usercustomerId,
    email,
    first_name,
    middle_name,
    last_name,
    phone_number,
    gender,
    nationality,
    dob,
    number_of_pages,
    currency,
  } = req.body;

  try {
    // Check if the user with the given usercustomerId exists
    const userExistsQuery = `
      SELECT * FROM users WHERE usercustomerId = ?
    `;

    pool.query(userExistsQuery, [usercustomerId], (err, results) => {
      if (err) {
        console.error('Error checking if user exists:', err);
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ status: 'error', error: 'User not found' });
      }

      // Update user data based on usercustomerId
      const updateUserQuery = `
        UPDATE users
        SET
          email = ?,
          first_name = ?,
          middle_name = ?,
          last_name = ?,
          phone_number = ?,
          gender = ?,
          nationality = ?,
          dob = ?,
          number_of_pages = ?,
          currency = ?
        WHERE usercustomerId = ?
      `;

      const values = [
        email,
        first_name,
        middle_name,
        last_name,
        phone_number,
        gender,
        nationality,
        dob,
        number_of_pages,
        currency,
        usercustomerId,
      ];

      pool.query(updateUserQuery, values, (err, result) => {
        if (err) {
          console.error('Error updating user data:', err);
          return res.status(500).json({ status: 'error', error: 'Internal Server Error' });
        }

        // Fetch the updated user data from the database
        const fetchUpdatedUserDataQuery = `
          SELECT * FROM users WHERE usercustomerId = ?
        `;

        pool.query(fetchUpdatedUserDataQuery, [usercustomerId], (fetchErr, fetchResults) => {
          if (fetchErr) {
            console.error('Error fetching updated user data:', fetchErr);
            return res.status(500).json({ status: 'error', error: 'Internal Server Error' });
          }

          // Respond with success and updated user data
          res.status(200).json({
            code: 200,
            status: 'success',
            message: 'User data updated successfully.',
            user: fetchResults[0] // Assuming usercustomerId is unique and fetchResults[0] is the updated user
          });
        });
      });
    });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ status: 'error', error: 'Internal Server Error' });
  }
});

module.exports = router;
