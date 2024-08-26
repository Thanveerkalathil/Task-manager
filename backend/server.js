const admin = require('firebase-admin');
const serviceAccount = require('./task-manager-931cc-firebase-adminsdk-4kta0-76ff7594d4.json');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize Firebase Admin SDK
const serviceAccount = path.resolve(__dirname, process.env.FIREBASE_ADMIN_SDK_KEY_PATH);


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Express setup (if you're using Express)
const app = express();
app.use(express.json());
app.use(cors());// Use the CORS middleware

// Endpoint to create a new user
app.post('/create-user', async (req, res) => {
  const { email, password, username } = req.body;
  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: username,
    });
    res.status(201).send({ uid: userRecord.uid });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
