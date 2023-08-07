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
    const { usercustomerId } = req.body;
  
    try {
      // Check if the user exists in the users table
      const [userQueryResult] = await pool.promise().query('SELECT * FROM users WHERE usercustomerId = ?', [usercustomerId]);
  
      if (userQueryResult.length === 0) {
        // User not found, return an error response
        console.log('User not found');
        return res.status(404).json({ status: 'error', error: 'User not found' });
      }
  
      console.log('Fetching cover designs from the cover_design table...');
      // Fetch the cover designs associated with the provided user ID using a join
      const [coverDesignQueryResult] = await pool.promise().query('SELECT * FROM cover_design',);
  
      console.log('coverDesignQueryResult:', coverDesignQueryResult);
  
      // Construct the response data array
      const responseData = coverDesignQueryResult.map((coverDesign) => {
        return {
          cover_images_id: coverDesign.cover_images_id,
          name: coverDesign.name,
          image: coverDesign.imageurl,
        };
      });
  
      console.log('Sending response with cover designs data...');
      res.status(200).json({
        code: 200,
        status: 'success',
        data: responseData,
      });
    } catch (error) {
      console.error('Error while fetching cover designs:', error);
      res.status(500).json({ status: 'error', error: 'Internal Server Error' });
    }
  });
  
  
  

module.exports = router;
