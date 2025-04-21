const express = require("express");
const mongoose = require("mongoose");
const useragent = require("express-useragent");
const geoip = require("geoip-lite");

const app = express();
const PORT = 3000;
const MONGO_URI =
  "mongodb+srv://ilhamrhmddni:110402@ilhamrhmddni.fqznp3q.mongodb.net/trackingDB"; // URL MongoDB lokal

// Middleware useragent
app.use(useragent.express());

// Koneksi ke MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Terhubung ke MongoDB"))
  .catch((err) => {
    console.error("❌ Gagal konek MongoDB:", err);
    process.exit(1); // Exit if connection fails
  });

// Skema dan model untuk tracking
const trackingSchema = new mongoose.Schema({
  id: String,
  ip: String,
  location: Object,
  browser: String,
  os: String,
  time: Date,
});
const Tracking = mongoose.model("Tracking", trackingSchema);

// Route untuk tracking
app.get("/track/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const geo = geoip.lookup(ip);
    const ua = req.useragent;

    const data = new Tracking({
      id,
      ip,
      location: geo,
      browser: ua.browser,
      os: ua.os,
      time: new Date(),
    });

    await data.save();
    console.log("✅ Data berhasil disimpan:", data);

    res.redirect("https://example.com"); // Ganti dengan URL tujuan
  } catch (error) {
    console.error("❌ Error saat menyimpan data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Mulai server
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
