const express = require("express");
const useragent = require("express-useragent");
const geoip = require("geoip-lite");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;

// Middleware useragent
app.use(useragent.express());

// Koneksi MongoDB
mongoose
  .connect("mongodb://localhost:27017/trackDB")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// Schema untuk Data Tracking
const trackingSchema = new mongoose.Schema({
  id: String,
  ip: String,
  location: Object,
  browser: String,
  os: String,
  time: Date,
});

const TrackingData = mongoose.model("TrackingData", trackingSchema);

// Route tracking
app.get("/track/:id", (req, res) => {
  const id = req.params.id;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const geo = geoip.lookup(ip);
  const ua = req.useragent;

  const data = {
    id,
    ip,
    location: geo,
    browser: ua.browser,
    os: ua.os,
    time: new Date(),
  };

  // Simpan data ke MongoDB
  const newTrackingData = new TrackingData(data);

  newTrackingData
    .save()
    .then(() => {
      console.log("Data tracking berhasil disimpan ke MongoDB");
      res.redirect("https://example.com");
    })
    .catch((error) => {
      console.error("Gagal menyimpan data ke MongoDB:", error);
      res.status(500).send("Terjadi kesalahan saat menyimpan data.");
    });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
