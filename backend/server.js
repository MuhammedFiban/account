const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');

let applicationCounter = 0;

dotenv.config();

const dbConfig = {
  connectionLimit: 10, // Set the connection pool limit according to your needs
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};



const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL');
});

process.on('SIGINT', () => {
  connection.end((err) => {
    if (err) {
      console.error('Error closing MySQL connection:', err);
    }
    console.log('MySQL connection closed gracefully');
    process.exit();
  });
});

// Create a connection pool
const pool = mysql.createPool(dbConfig);
const app = express();

app.use(express.json());

// Supress CORS Error
const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            
   optionSuccessStatus:200,
}
app.use(cors(corsOptions)) // Use this after the variable declaration

// /login endpoint
app.post('/login',(req,res)=>{
  var username = req.body.username
  var password = req.body.password
  console.log(username, 'is trying to login!')
  data = {
    status : 'Failed',
    role: null,
  }
  q = 'Select * from '+ dbConfig.database + '.user_auth where username = ' + mysql.escape(username) + 'and password = ' + mysql.escape(password);
  pool.query(q, (err, result) => {
    if (err) {
      console.log('Error during Auth query: ', err);
      res.send(data);
      return;
    }
  if (result && result.length == 1){
    data.status = "Successful";
    data.role = result[0].role;
    console.log(username, 'is logged in successfully')
  }
  console.log('data: ', data)
  res.send(data)
  return
  });
});


// Middleware to parse JSON requests
app.use(express.json());

// Endpoint to submit a new application
app.post('/submit-application', (req, res) => {
  const newApplication = req.body;

  // Validate and process the submitted application data
  const insertQuery = 'INSERT INTO applications SET ?';

  pool.query(insertQuery, newApplication, (error, results) => {
    if (error) {
      console.error('Error submitting application:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // Send a success response to the client
    res.json({ message: 'Application submitted successfully.' });
  });
});

// /load-applications endpoint
app.post('/load-applications', (req, res) => {
  const role = req.body.role;

  // Placeholder functions to retrieve applications based on role
  let applications;

  if (role === 'CSR') {
    applications = retrieveApplicationsByCSR(req.body.username); // Replace with actual logic
  } else if (role === 'BranchManager') {
    applications = retrieveAllApplications(); // Replace with actual logic
  } else {
    // Handle other roles if needed
  }

  // Send the list of applications in the response
  res.json({ applications });
});

// Add this code after the /submit-application and /login endpoints
// Endpoint to load application details
app.post('/load-application-details', (req, res) => {
  const applicationId = req.body.applicationId;

  // Fetch application details from the MySQL database
  const selectQuery = 'SELECT * FROM applications WHERE id = ?';

  pool.query(selectQuery, [applicationId], (error, results) => {
    if (error) {
      console.error('Error loading application details:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 0) {
      // Application not found
      return res.status(404).json({ error: 'Application not found' });
    }

    const selectedApplication = results[0];

    // Send application details to the client
    res.json({ application: selectedApplication });
  });
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


console.log('Starting the server...');

