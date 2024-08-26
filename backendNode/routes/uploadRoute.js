const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Dynamic import of fetch
let fetch;
(async () => {
  fetch = (await import("node-fetch")).default;
})();

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userData = await mongoose.model("User").findById(user._id);
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", async () => {
        const requiredCredits = userData.role !== "ADMIN" ? results.length : 0;

        if (userData.role !== "ADMIN" && userData.creditleft < requiredCredits) {
          return res.status(400).json({ error: "Insufficient credits" });
        }

        const processedData = [];
        let creditChanges = 0;

        for (const row of results) {
          // Convert values to numbers
          const {
            latitude = '0',
            longitude = '0',
            altitude = '0',
            elevation = '0',
            accuracy = '50',
            category = 'normal',
          } = row;

          try {
            const backendResponse = await fetch(`http://127.0.0.1:9001/predict`, {
              method: "POST",
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'your_secret_token',
              },
              body: JSON.stringify({
                lat: parseFloat(latitude),
                lon: parseFloat(longitude),
                altitude: parseFloat(altitude),
                elevation: parseFloat(elevation),
                accuracy: parseFloat(accuracy),
                category
              }),
            });

            if (!backendResponse.ok) {
              const errorText = await backendResponse.text();
              console.error(`API responded with status ${backendResponse.status}: ${errorText}`);
              throw new Error(`API responded with status ${backendResponse.status}`);
            }

            const data = await backendResponse.json();
            const { predicted_temp } = data;

            if (userData.role !== "ADMIN") {
              userData.creditleft -= 1;
              userData.creditused += 1;
              creditChanges += 1;

              if (userData.creditleft < 0) {
                return res.status(400).json({ error: "Credits went below zero" });
              }
            } else {
              userData.creditused += 1;
            }

            processedData.push({
              ...row,
              predicted_temp,
              accuracy: accuracy || 50,
            });
          } catch (error) {
            console.error(`Error fetching data for row: ${JSON.stringify(row)}`, error);
            return res.status(500).json({ error: "Error processing row" });
          }
        }

        if (creditChanges > 0) {
          await userData.save();
        }

        const csvData = [
          "latitude,longitude,altitude,elevation,category,accuracy,predicted_temp",
          ...processedData.map(
            (row) =>
              `${row.latitude},${row.longitude},${row.altitude},${row.elevation},${row.category || "normal"},${row.accuracy || 50},${row.predicted_temp}`
          ),
        ].join("\n");

        res.header("Content-Type", "text/csv");
        res.attachment("processed_data.csv");
        res.send(csvData);

        // Clean up the uploaded file
        fs.unlink(req.file.path, (err) => {
          if (err) console.error(`Failed to delete temp file: ${err}`);
        });
      });
  } catch (error) {
    console.error("Error processing /upload:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
