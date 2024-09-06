const { Router } = require("express");
const User = require("../models/user");
require('dotenv').config()

const router = Router();


router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const token = await User.matchPasswordAndGenrateToken(email, password);
        const user = await User.findOne({ email }); 
        res.cookie('token', token, {
            httpOnly: true, // Helps prevent XSS attacks
            secure: process.env.NODE_ENV === 'production', // Only set cookie over HTTPS
            maxAge: 24 * 60 * 60 * 1000 // Cookie expiration (1 day in milliseconds)
        });
        res.json({
            message: 'Login successful',
            user: {
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
        
    } catch (error) {
        return res.status(401).json({ error: 'Incorrect Email or Password' });
    }
});



router.get('/logout', (req, res) => {
    console.log("Logout request received");
    res.clearCookie('token', { path: '/', sameSite: 'None', secure: true }); // Adjust attributes as needed
    res.status(200).json({ message: 'You are logged out' });
    console.log("Logout response sent");
});


router.post("/signup", async (req, res) => {
    const { fullName, email, password, secretCode } = req.body;

    try {
        if (!fullName || !email || !password || !secretCode) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await User.signup(            
            fullName,
            email,
            password,
            secretCode
        );
        return res.json("User is created");
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).send("Server error || duplicate data || wrong code");
    }
});

module.exports = router;

