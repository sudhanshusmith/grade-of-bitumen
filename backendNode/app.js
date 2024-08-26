require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const { checkForAuthenticationCookie } = require("./middleware/auth");
const userRoute = require("./routes/user");
const uploadRoute = require("./routes/uploadRoute");

// Initialize express app
const app = express();
const port = process.env.PORT || 8000;

// Setup CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware setup
app.use(express.static(path.resolve("./public")));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());
app.use(checkForAuthenticationCookie("token"));

// Dashboard route
app.get("/dashboard", async (req, res) => {
  try {
    const user = req.user;

    const userData = await mongoose
      .model("User")
      .findById(user._id, "creditleft creditused role");
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userData.role === "ADMIN") {
      res.json({
        creditused: userData.creditused,
      });
    } else {
      res.json({
        creditleft: userData.creditleft,
        creditused: userData.creditused,
      });
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Find route
app.post("/dashboard/find", async (req, res) => {
  try {
    const user = req.user;

    const userData = await mongoose.model("User").findById(user._id);
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userData.role !== "ADMIN" && userData.creditleft <= 0) {
      return res.status(400).json({ error: "Insufficient credits" });
    }

    if (userData.role !== "ADMIN") {
      userData.creditleft -= 1;
      userData.creditused += 1;
    } else {
      userData.creditused += 1;
    }

    await userData.save();

    const { lat, lon, altitude, elevation, accuracy, category } = req.body;

    // Use dynamic import for fetch
    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

    const backendResponse = await fetch(`http://127.0.0.1:9001/predict`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'your_secret_token', 
      },
      body: JSON.stringify({
        lat,
        lon,
        altitude,
        elevation,
        accuracy,
        category
      }),
    });
    console.log({lat, lon, altitude, elevation, accuracy, category})

    const contentType = backendResponse.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await backendResponse.json();
      const { predicted_temp } = data;
      console.log(predicted_temp);

      
      res.json({
        success: true,
        message: "Data processed successfully",
        creditleft: userData.role !== "ADMIN" ? userData.creditleft : undefined,
        creditused: userData.creditused,
        temperature: predicted_temp,
      });
    } else {
      const responseText = await backendResponse.text();
      console.error("Unexpected response format:", responseText);
      res.status(500).json({ error: "Failed to process data" });
    }
  } catch (error) {
    console.error("Error processing /dashboard/find:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Root route
app.get("/", async (req, res) => {
  res.json("You are ready to start");
});

// Routes setup
app.use("/users", userRoute);
app.use("/findCsv", uploadRoute);

// Start the server
app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});
