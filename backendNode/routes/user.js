const { Router } = require("express");
const User = require("../models/user");
require('dotenv').config()

const router = Router();


router.post('/signin',async(req, res) =>{
    const { email, password }  = req.body;
    try{
        const token = await User.matchPasswordAndGenrateToken(email, password); 
        return res.cookie('token', token).redirect("/");
    } catch (error){    
        return res.send("Incorrect Email or Password");
    }
});


router.get('/logout', (req, res) => {
    res.clearCookie('token').json("You are logout");
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
        return res.json("User is created"); // Ensure a response is sent to avoid hanging
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).send("Server error || duplicate data || wrong code"); // Provide feedback for errors
    }
});

module.exports = router;

