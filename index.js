const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Import CORS middleware

const app = express();
const PORT = 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Untuk menerima JSON

mongoose.connect(
  "mongodb+srv://ilhamrhmddni:110402@ilhamrhmddni.fqznp3q.mongodb.net/trackingDB"
);

const trackingSchema = new mongoose.Schema({
  id: String,
  latitude: Number,
  longitude: Number,
  accuracy: Number,
  time: { type: Date, default: Date.now },
  gmapsLink: String, // Add gmapsLink field
});

const Tracking = mongoose.model("Tracking", trackingSchema);

app.post("/track", async (req, res) => {
  const { latitude, longitude } = req.body;
  const gmapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`; // Generate Google Maps link
  const currentDate = new Date();
  const id = `${currentDate.getDate()}/${
    currentDate.getMonth() + 1
  }/${currentDate.getFullYear()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`; // Generate ID as DD/MM/YYYY HH:MM:SS
  const data = new Tracking({ ...req.body, id, gmapsLink }); // Include ID and gmapsLink in the document
  await data.save();
  console.log("✅ Lokasi disimpan:", req.body);
  res.send({ message: "Lokasi diterima!", gmapsLink }); // Include gmapsLink in the response
});

app.listen(PORT, () => {
  console.log(`🚀 Server running di http://localhost:${PORT}`);
});
