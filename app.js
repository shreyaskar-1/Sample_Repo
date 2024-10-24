const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');  // Create this model in a moment
const app = express();
const PORT = 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/backendlogin', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));  // For serving static files like CSS
app.set('view engine', 'hbs');

// Routes

// Display login form
app.get('/login', (req, res) => {
    res.render('login');
});

// Handle login form submission
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.send('User not found! Please sign up first.');
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            res.send('Login successful!');
        } else {
            res.send('Incorrect password!');
        }
    } catch (error) {
        res.send('Error during login');
    }
});

// Display signup form
app.get('/signup', (req, res) => {
    res.render('signup');
});

// Handle signup form submission
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.send('User already exists. Please log in.');
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user and save to database
        const newUser = new User({
            username,
            password: hashedPassword,
        });

        await newUser.save();
        res.send('Signup successful! You can now log in.');
    } catch (error) {
        res.send('Error during signup');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
