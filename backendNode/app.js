require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const { checkForAuthenticationCookie } = require("./middleware/auth");
const userRoute = require("./routes/user");
const uploadRoute = require("./routes/uploadRoute");
const dashboardRoute = require("./routes/dashboardRoute"); // Import the new dashboard route

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

app.use("/dashboard", dashboardRoute);

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
