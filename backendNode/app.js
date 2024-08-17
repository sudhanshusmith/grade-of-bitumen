require('dotenv').config();
const cors = require('cors');
const express = require('express');
const userRoute = require("./routes/user");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middleware/auth');
const path = require("path");

const app = express();
const port = process.env.PORT || 8000;

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
};

app.use(cors(corsOptions));

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(express.static(path.resolve('./public')));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());

app.use(checkForAuthenticationCookie("token"));

// /dashboard route
app.get("/dashboard", async (req, res) => {
    try {
        const user = req.user;

        const userData = await mongoose.model('User').findById(user._id, 'creditleft creditused');
        if (!userData) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            creditleft: userData.creditleft,
            creditused: userData.creditused
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/dashboard/find", async (req, res) => {
    try {
        const user = req.user;

        // Find the user by ID and get their current credit info
        const userData = await mongoose.model('User').findById(user._id);
        if (!userData) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the user has enough credits left
        if (userData.creditleft <= 0) {
            return res.status(400).json({ error: "Insufficient credits" });
        }

        userData.creditleft -= 1;
        userData.creditused += 1;

        await userData.save(); 

        const { lat, lon, altitude, elevation, accuracy, categories } = req.body;

        const backendResponse = await fetch('http://other-backend-url.com/api', {
            lat,
            lon,
            altitude,
            elevation,
            accuracy,
            categories
        });

        const { temperature } = backendResponse.data;

        res.json({
            success: true,
            message: "Data processed successfully",
            creditleft: userData.creditleft,  // Updated creditleft
            creditused: userData.creditused,  // Updated creditused
            temperature 
        });
    } catch (error) {
        console.error("Error processing /dashboard/find:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



app.get("/", async (req, res) => {
    res.json("You are ready to start");
});

app.use("/users", userRoute);

app.listen(port, () => console.log(`App listening on port ${port}!`));
