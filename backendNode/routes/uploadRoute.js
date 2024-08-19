const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const fs = require("fs");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Dynamic import of fetch
let fetch;
(async () => {
  fetch = (await import('node-fetch')).default;
})();

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const user = req.user;

    const userData = await mongoose.model("User").findById(user._id);
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check for sufficient credits before processing the file
    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", async () => {
        // Calculate required credits
        const requiredCredits = userData.role !== "ADMIN" ? results.length : 0;

        if (userData.role !== "ADMIN" && userData.creditleft < requiredCredits) {
          return res.status(400).json({ error: "Insufficient credits" });
        }

        const processedData = [];
        let creditChanges = 0;

        // Process each row
        for (const row of results) {
          const { latitude, longitude, altitude, elevation, accuracy, category } = row;

          const backendResponse = await fetch("http://localhost:3003/api", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              lat: latitude,
              lon: longitude,
              altitude,
              elevation,
              accuracy: accuracy || 50, // Default accuracy
              categories: category || "normal", // Default category
            }),
          });

          const data = await backendResponse.json();
          const { temperature } = data;

          if (userData.role !== "ADMIN") {
            userData.creditleft -= 1;
            userData.creditused += 1;
            creditChanges += 1;

            // Stop processing if credits go below zero
            if (userData.creditleft < 0) {
              return res.status(400).json({ error: "Credits went below zero" });
            }
          } else {
            userData.creditused += 1;
          }

          processedData.push({
            ...row,
            temperature,
            accuracy: accuracy || 50, // Ensure accuracy is included
          });
        }

        // Save the user data only once after processing all rows
        if (creditChanges > 0) {
          await userData.save();
        }

        // Create CSV data with headers
        const csvData = [
          "latitude,longitude,altitude,elevation,category,accuracy,temperature", // Header row
          ...processedData.map(
            (row) =>
              `${row.latitude},${row.longitude},${row.altitude},${row.elevation},${row.category || "normal"},${row.accuracy || 50},${row.temperature}`
          ),
        ].join("\n");

        res.header("Content-Type", "text/csv");
        res.attachment("processed_data.csv");
        res.send(csvData);
      });
  } catch (error) {
    console.error("Error processing /upload:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
