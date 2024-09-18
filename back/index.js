const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const port = 3002;
const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/navyProject1', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Profile Schema
const profileSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password
  unit: { type: String, required: true },
  eAdmin: { type: Boolean, default: false } // True if admin
});
const ProfileModel = mongoose.model('profile', profileSchema);

// Complaint Schema
const complaintSchema = mongoose.Schema({
  name: { type: String, required: true },
  unit: { type: String, required: true },
  item: { type: String, required: true },
  poweronpassword: { type: String, required: true },
  user_name: { type: String, required: true },
  defect: { type: String, required: true },
  status: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  deadline: { type: Date, required: true },
  currentStatus: { type: String, required: true },
  takenForRepairDateTime: { type: Date, default: Date.now },
  delivery_status: { type: String },
  dummyField2: { type: String }
});
const ComplaintModel = mongoose.model('complaints', complaintSchema);

// Bin Schema
const binSchema = mongoose.Schema({
  name: { type: String },
  unit: { type: String },
  item: { type: String },
  poweronpassword: { type: String },
  user_name: { type: String },
  defect: { type: String },
  status: { type: String },
  phoneNumber: { type: String },
  deadline: { type: Date },
  currentStatus: { type: String },
  takenForRepairDateTime: { type: Date },
  delivery_status: { type: String },
  dummyField2: { type: String },
  deletedAt: { type: Date, default: Date.now } // Track when it was moved to the bin
});
const BinModel = mongoose.model('bin', binSchema);

// Register Profile
app.post('/register', async (req, res) => {
  try {
    const { username, password, unit, eAdmin } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newProfile = new ProfileModel({ username, password: hashedPassword, unit, eAdmin });
    await newProfile.save();
    res.status(201).send('Profile created');
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).send('Error creating profile');
  }
});

// Login Endpoint// Login Endpoint with detailed error messages
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username
    const profile = await ProfileModel.findOne({ username });
    
    // Check if the username exists
    if (!profile) {
      return res.status(404).json({ error: 'No account found with this username' });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, profile.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Token expires in 1 day
    const token = jwt.sign(
      { username: profile.username, unit: profile.unit, eAdmin: profile.eAdmin },
      'your_jwt_secret', 
      { expiresIn: '1d' }  // Token is valid for 1 day
    );
    
    // Fetch complaints for the user's unit
    const complaints = await ComplaintModel.find({ unit: profile.unit });

    // Send the token and complaints if the login is successful
    res.json({ token, complaints });
    
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'An error occurred during login. Please try again.' });
  }
});





// Middleware to Verify JWT Token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Unauthorized');

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) return res.status(403).send('Forbidden');
    req.user = user;
    next();
  });
};


app.get('/verify_token', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});
app.get('/all_complaints', async (req, res) => {
  const { unit } = req.query; // Fetch unit from query params
  try {
    const complaints = await ComplaintModel.find({ unit });
    res.json(complaints);
  } catch (error) {
    res.status(500).send("Error fetching complaints.");
  }
});


// Fetch Complaints by Unit
app.get('/complaints', authenticateToken, async (req, res) => {
  try {
    const complaints = await ComplaintModel.find({ unit: req.user.unit });
    res.json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).send('Error fetching complaints');
  }
});

// Create Complaint
app.post('/save_complaint', async (req, res) => {
    try {
      const data = req.body;
      const profile = await ProfileModel.findOne({ unit: data.unit });
  
      if (!profile) {
        return res.status(404).send('No unit found with this unit name');
      }
  
      data.deadline = new Date(data.deadline);
      const newComplaint = new ComplaintModel(data);
      await newComplaint.save();
      res.status(201).send(newComplaint);
    } catch (error) {
      console.error('Error saving complaint:', error);
      res.status(500).send('Error saving complaint');
    }
  });
  app.put('/update_complaint/:id', async (req, res) => {
    try {
      const updatedComplaint = await ComplaintModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (updatedComplaint) {
        res.send(updatedComplaint);
      } else {
        res.status(404).send('Complaint not found');
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
      res.status(500).send('Error updating complaint');
    }
  });
  
  
// Delete Complaint (Soft Delete)
app.delete('/delete_complaint/:id', authenticateToken, async (req, res) => {
  try {
    const complaint = await ComplaintModel.findById(req.params.id);
    if (complaint) {
      const binEntry = new BinModel(complaint.toObject());
      await binEntry.save();
      await ComplaintModel.findByIdAndDelete(req.params.id);
      res.send('Complaint moved to bin');
    } else {
      res.status(404).send('Complaint not found');
    }
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).send('Error deleting complaint');
  }
});

// Restore Complaint from Bin
app.put('/restore_bin_entry/:id', authenticateToken, async (req, res) => {
  try {
    const binEntry = await BinModel.findById(req.params.id);
    if (binEntry) {
      const newComplaint = new ComplaintModel(binEntry.toObject());
      await newComplaint.save();
      await BinModel.findByIdAndDelete(req.params.id);
      res.send('Bin entry restored to complaints');
    } else {
      res.status(404).send('Bin entry not found');
    }
  } catch (error) {
    console.error('Error restoring bin entry:', error);
    res.status(500).send('Error restoring bin entry');
  }
});


app.get('/complaint/:id', async (req, res) => {
  try {
    const complaint = await ComplaintModel.findById(req.params.id);
    if (complaint) {
      res.send(complaint);
    } else {
      res.status(404).send('Complaint not found');
    }
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).send('Error fetching complaint');
  }
});



// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});





