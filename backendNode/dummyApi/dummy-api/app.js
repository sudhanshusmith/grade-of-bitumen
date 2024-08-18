const express = require('express');
const cors = require('cors'); // Allows cross-origin requests

const app = express();
const port = 3001; // You can use any port that is free

app.use(express.json()); // To parse JSON bodies
app.use(cors()); // Enable CORS for all origins

app.post('/api', (req, res) => {
//   const { lat, lon, altitude, elevation, accuracy, categories } = req.body;

  // Simulate a temperature calculation
  const temperature = 20 + Math.random() * 10; // Returns a temperature between 20 and 30

  res.json({ temperature });
});

app.listen(port, () => {
  console.log(`Dummy API server running at http://localhost:${port}`);
});
