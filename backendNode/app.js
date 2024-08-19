require("dotenv").config();
const cors = require("cors");
const express = require("express");
const userRoute = require("./routes/user");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { checkForAuthenticationCookie } = require("./middleware/auth");
const path = require("path");

const app = express();
const port = process.env.PORT || 8000;

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.static(path.resolve("./public")));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());

app.use(checkForAuthenticationCookie("token"));

// /dashboard route
app.get("/dashboard", async (req, res) => {
  try {
    const user = req.user;

    // Find the user data including their role
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
    }
    else{
        userData.creditused += 1;
    }

    await userData.save();

    const { lat, lon, altitude, elevation, accuracy, categories } = req.body;

    const backendResponse = await fetch("http://localhost:3003/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lat,
        lon,
        altitude,
        elevation,
        accuracy,
        categories,
      }),
    });

    // Log the entire response to see its structure

    const data = await backendResponse.json();
    const { temperature } = data;
    console.log(temperature)
    res.json({
      success: true,
      message: "Data processed successfully",
      creditleft: userData.role !== "ADMIN" ? userData.creditleft : undefined,
      creditused: userData.creditused,
      temperature,
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
