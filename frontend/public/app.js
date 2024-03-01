// URL of the node application
const apiUrl = 'http://localhost:3000';
let loginData; // Declare loginData in a broader scope

document.addEventListener('DOMContentLoaded', function () {
  const nationalityDropdown = document.getElementById('nationality');
  const countries = getAllCountries();
  
  countries.forEach(country => {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    nationalityDropdown.appendChild(option);
  });
});

function getAllCountries() {
  return ["Afghanistan","Albania","Algeria", /* ... rest of the countries ... */ "Zimbabwe"];
}

// This function is called on login().
function login() {
  // Replace the hardcoded URL with a relative URL
  var path = '/login';

  loginData = {
    username: document.getElementById('username').value,
    password: document.getElementById('password').value,
  };

  // Send req to relative URL
  fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData),
  }) 

    .then((response) => response.json())
    .then((data) => {
        console.log(data.status);
        if (data.status == 'Successful'){
          alert('Login successful. Welcome!');

          currentUser = {
            username: loginData.username,
            role: data.role, // Assuming the server provides the user role
          };

          document.getElementById('loginForm').style.display = 'none';
         
          // Show the appropriate UI based on the user role
        if (currentUser.role === 'csrusr') {
      document.getElementById('csrDashboard').style.display = 'block';
    } else if (currentUser.role === 'bmgr') {
      document.getElementById('branchManagerUI').style.display = 'block';
      loadApplications();
   }
          
        }else{
          alert('Login Failed.');
        }
      })
      .catch((error) => {
        console.error('Error submitting application:', error);
        alert('Error submitting application. Please try again.');
      });
    }

    function showElement(elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.style.display = 'block';
      }
    }
    
    function hideElement(elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.style.display = 'none';
      }
    }

    function submitForm() {
      const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        middleName: document.getElementById('middleName').value,
        dob: document.getElementById('dob').value,
        nationality: document.getElementById('nationality').value,
        idNumber: document.getElementById('idNumber').value,
        mobileNumber: document.getElementById('mobileNumber').value,
        addressLine1: document.getElementById('addressLine1').value,
        addressLine2: document.getElementById('addressLine2').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        pinCode: document.getElementById('pinCode').value,
      };
    
      // Validation error messages
      const validationErrors = {};
    
      // Validate all required fields
      for (const key in formData) {
        if (!formData[key]) {
          validationErrors[key] = `Please fill in the ${key} field.`;
        }
      }
    
      // Validate ID Number
      const isIdNumberValid = /^[a-zA-Z0-9]{12}$/.test(formData.idNumber);
      if (!isIdNumberValid) {
        validationErrors.idNumber = 'Please enter a valid Aadhaar or Passport number .';
      }
    
      // Validate Mobile Number
      const isMobileNumberValid = /^[0-9]{10}$/.test(formData.mobileNumber);
      if (!isMobileNumberValid) {
        validationErrors.mobileNumber = 'Please enter a valid 10-digit mobile number.';
      }
    
      // Display validation error messages
      for (const key in validationErrors) {
        const errorElement = document.getElementById(`${key}Error`);
        if (errorElement) {
          errorElement.textContent = validationErrors[key];
        }
      }
    
      // Check if there are validation errors
      if (Object.keys(validationErrors).length > 0) {
        return;
      }
    
      //with form submission
      fetch('/submit-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((data) => {
          alert(data.message);
        })
        .catch((error) => {
          console.error('Error submitting application:', error);
          alert('Error submitting application. Please try again.');
        });
    
      // Clear form fields
      clearForm();
    }
    


function openNewAccount() {
  
  document.getElementById('csrDashboard').style.display = 'none';
  document.getElementById('branchManagerUI').style.display = 'none';

  // Show the account opening form
  document.getElementById('accountFormContainer').style.display = 'block';
}


function submitForm() {
  const newApplication = {
    id: generateApplicationId(),
    firstName: document.getElementById('firstName').value,
    middleName: document.getElementById('middleName').value,
    lastName: document.getElementById('lastName').value,
    dob: document.getElementById('dob').value,
    nationality: document.getElementById('nationality').value,
    idNumber: document.getElementById('idNumber').value,
    mobileNumber: document.getElementById('mobileNumber').value,
    addressLine1: document.getElementById('addressLine1').value,
    addressLine2: document.getElementById('addressLine2').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    pinCode: document.getElementById('pinCode').value,
    status: 'Pending Approval',
  };

  // Check if any field is empty
  for (const key in newApplication) {
    if (newApplication[key] === '') {
      alert(`Please fill in all fields.`);
      return;
    }
  }

  // Send the application data to the server
  fetch('/submit-application', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newApplication),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);

      // Clear form fields if the submission was successful
      clearForm();

      // Reload applications for the Branch Manager
      loadApplications();
    })
    .catch((error) => {
      console.error('Error submitting application:', error);
      alert('Error submitting application. Please try again.');
    });
}


  // Clear form fields
  clearForm();

  // Reload applications for the Branch Manager
  loadApplications();

  function loadApplications() {
    const applicationsList = document.getElementById('applicationsList');
    applicationsList.innerHTML = ''; // Clear the list before loading
  
    // Fetch existing applications
    fetch('/load-applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: currentUser.role }), // Assuming currentUser is defined
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load applications. Please try again.');
        }
        return response.json();
      })
      .then((data) => {
        const applications = data.applications || [];
  
        // Display applications in the list
        applications.forEach((application) => {
          const listItem = document.createElement('li');
          listItem.innerHTML = `<button type="button" class="btn btn-link" onclick="viewDetails(${application.id})">${application.firstName} ${application.lastName} - ${application.status}</button>`;
          applicationsList.appendChild(listItem);
        });
      })
      .catch((error) => {
        console.error('Error loading applications:', error);
        alert('Error loading applications. Please try again.');
      });
  }
  
  function viewDetails(applicationId) {
    const path = '/load-application-details';
  
    // Send a request to the server to load application details
    fetch(apiUrl + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ applicationId }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load application details. Please try again.');
        }
        return response.json();
      })
      .then((data) => {
        const selectedApplication = data.application;
  
        const detailsMessage = `Details for Application #${applicationId}:
          First Name: ${selectedApplication.firstName}
          Last Name: ${selectedApplication.middleName || 'N/A'}
          Date of Birth: ${selectedApplication.dob || 'N/A'}
          Nationality: ${selectedApplication.nationality || 'N/A'}
          ID Number: ${selectedApplication.idNumber || 'N/A'}
          Mobile Number: ${selectedApplication.mobileNumber || 'N/A'}
          Address Line 1: ${selectedApplication.addressLine1 || 'N/A'}
          Address Line 2: ${selectedApplication.addressLine2 || 'N/A'}
          City: ${selectedApplication.city || 'N/A'}
          State: ${selectedApplication.state || 'N/A'}
          Pin Code: ${selectedApplication.pinCode || 'N/A'}
          Status: ${selectedApplication.status}
          Account Number: ${selectedApplication.accountNumber || 'Not Generated yet'}`;
  
        // Display details
        alert(detailsMessage);
  
        // Display approve/reject buttons
        const approveButton = document.createElement('button');
        approveButton.textContent = 'Approve';
        approveButton.className = 'btn btn-success';
        approveButton.onclick = () => approveApplication(selectedApplication.id);
  
        const rejectButton = document.createElement('button');
        rejectButton.textContent = 'Reject';
        rejectButton.className = 'btn btn-danger';
        rejectButton.onclick = () => rejectApplication(selectedApplication.id);
  
        // Clear previous buttons
        const actionsContainer = document.getElementById('actionsContainer');
        actionsContainer.innerHTML = '';
  
        actionsContainer.appendChild(approveButton);
        actionsContainer.appendChild(rejectButton);
      })
      .catch((error) => {
        console.error('Error loading application details:', error);
        alert('Error loading application details. Please try again.');
      });
  }
  



// Placeholder function to update application status to 'Approved' and generate an account number
function approveApplication(applicationId) {
  const query = 'UPDATE applications SET status = ?, accountNumber = ? WHERE id = ?';
  const accountNumber = generateAccountNumber();

  connection.query(query, ['Approved', accountNumber, applicationId], (err, result) => {
    if (err) {
      console.error('Error approving application:', err);
      // Handle the error, such as sending an error response to the client
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.affectedRows > 0) {
      // Application updated successfully
      alert(`Application approved. Account number generated: ${accountNumber}`);
      // Send a success response to the client if needed
      return res.json({ success: true });
    } else {
      // Application not found or already processed
      alert('Application not found or has already been processed.');
      // Send an appropriate response to the client
      return res.status(404).json({ error: 'Application not found or already processed' });
    }

    // Reload applications for the Branch Manager
    loadApplications();
  });
}
function generateAccountNumber(existingAccountNumbers) {
  const maxAttempts = 1000; // Maximum attempts to generate a unique account number
  let attempts = 0;

  while (attempts < maxAttempts) {
    const newAccountNumber = Math.floor(Math.random() * 10000000000) + 10000000000;

    // Check if the generated account number already exists
    if (!existingAccountNumbers.includes(newAccountNumber)) {
      return newAccountNumber; // Unique account number found
    }

    attempts += 1;
  }

  // Handle the case where a unique account number couldn't be generated after max attempts
  throw new Error('Unable to generate a unique account number.');
}



function rejectApplication(applicationId) {
  const updateStatusQuery = 'UPDATE applications SET status = ? WHERE id = ?';

  // Check if the application is pending approval
  connection.query('SELECT * FROM applications WHERE id = ?', [applicationId], (selectErr, result) => {
    if (selectErr) {
      console.error('Error checking application status:', selectErr);
      return;
    }

    if (result.length === 0) {
      console.error('Application not found');
      return;
    }

    const applicationStatus = result[0].status;

    if (applicationStatus === 'Pending Approval') {
      // Update the status to 'Rejected'
      connection.query(updateStatusQuery, ['Rejected', applicationId], (updateErr, updateResult) => {
        if (updateErr) {
          console.error('Error updating application status:', updateErr);
        } else {
          console.log('Application rejected successfully.');
          // Reload applications for the Branch Manager
          loadApplications();
        }
      });
    } else {
      console.log('Application has already been processed.');
    }
  });
}




// Your generateApplicationId function
function generateApplicationId() {
  const timestamp = Date.now();
  const randomComponent = Math.floor(Math.random() * 1000);
  const uniqueId = `${timestamp}_${randomComponent}_${applicationCounter}`;
  
  applicationCounter += 1;

  return uniqueId;
}


const clearApplications = () => {
  // Assuming you have a MySQL connection pool named 'pool' established

  // Ensure the pool is properly configured and connected
  if (!pool || pool._closed) {
    console.error('MySQL connection pool is not properly configured or connected.');
    // Handle the error appropriately, e.g., send an error response to the client
    return;
  }

  // Clear applications in the MySQL database
  const clearQuery = 'DELETE FROM applications';
  pool.query(clearQuery, (error, results) => {
    if (error) {
      console.error('Error clearing applications:', error);
      // Handle the error appropriately, e.g., send an error response to the client
    } else {
      console.log('Applications cleared successfully');
      // Clear the applications list on the UI
      document.getElementById('applicationsList').innerHTML = '';

      const actionsContainer = document.getElementById('actionsContainer');
      actionsContainer.innerHTML = '';
    }
  });
};


function goBack() {
  const hideElements = ['csrDashboard', 'branchManagerUI', 'accountFormContainer'];
  
  // Hide elements with a smooth transition
  hideElements.forEach(elementId => {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.transition = 'opacity 0.5s'; // Adjust the duration as needed
      element.style.opacity = 0;
    }
  });

  // Show the login form after a delay
  setTimeout(() => {
    document.getElementById('loginForm').style.display = 'block';
  }, 500); // Adjust the delay to match the transition duration
}




  