const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// API endpoint to submit an application
app.post('/submitApplication', async (req, res) => {
  const { firstName, lastName, dob } = req.body;

  try {
    const [rows, fields] = await db.execute('INSERT INTO applications (firstName, lastName, dob) VALUES (?, ?, ?)', [firstName, lastName, dob]);
    res.status(200).json({ message: 'Application submitted successfully', applicationId: rows.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error submitting application' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});