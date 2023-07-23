const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = 'YOUR_MONGODB_CONNECTION_STRING';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Mongoose schema and model for User
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Add other user fields as needed
});

const User = mongoose.model('User', userSchema);

// POST /api/register
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Create a new user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      // Add other user fields as needed
    });

    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error during user registration:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate and return a JWT token
    const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });

    return res.status(200).json({ token, userId: user._id });
  } catch (err) {
    console.error('Error during user login:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/users/:userId
app.put('/api/users/:userId', async (req, res) => {
  const { userId } = req.params;
  const { email /* Add other user fields */ } = req.body;

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user profile
    user.email = email;
    // Update other fields as needed
    // ...

    await user.save();

    return res.status(200).json({ message: 'User profile updated successfully' });
  } catch (error) {
    console.error('Error during user profile update:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/reset-password
app.post('/api/reset-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a temporary code (e.g., random 6-digit number)
    const tempCode = Math.floor(100000 + Math.random() * 900000);

    // Store the temporary code in the database along with its expiration time
    // Implement this part according to your database schema and requirements

    // Send the temporary code to the user's email or phone (via Twilio)
    // Implement this part using your preferred email or SMS service

    return res.status(200).json({ message: 'Temporary code sent successfully' });
  } catch (error) {
    console.error('Error in password reset:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Mongoose schema and model for Chat
const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true }, // 'user' or 'agent'
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  messages: [messageSchema],
  // Add other relevant fields for the chat here
});

const Chat = mongoose.model('Chat', chatSchema);

// POST /api/chats
app.post('/api/chats', async (req, res) => {
  const { userId, agentId, messages } = req.body;

  try {
    // Create a new chat instance
    const newChat = new Chat({
      userId,
      agentId,
      messages,
      // Add other relevant fields here
    });

    // Save the chat to the database
    await newChat.save();

    return res.status(201).json({ message: 'Chat created successfully' });
  } catch (error) {
    console.error('Error in creating chat:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
