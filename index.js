const express = require("express");
const mongoose = require("mongoose");
const useragent = require("express-useragent");
const geoip = require("geoip-lite");

const app = express();
const PORT = 3000;
const MONGO_URI = "mongodb://localhost:27017/trackingDB";

// Middleware user-agent
app.use(useragent.express());

// Koneksi ke MongoDB
mongoose
  .connect(MONGO_URI, {
    dbName: "trackingDB",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }) // Added options for compatibility
  .then(() => console.log("✅ Terhubung ke MongoDB"))
  .catch((err) => {
    console.error("❌ Gagal konek MongoDB:", err);
    process.exit(1); // Exit process if connection fails
  });

// Skema dan model
const trackingSchema = new mongoose.Schema({
  id: String,
  ip: String,
  location: Object,
  browser: String,
  os: String,
  time: Date,
});
const Tracking = mongoose.model("Tracking", trackingSchema);

// Route utama
app.get("/track/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const geo = geoip.lookup(ip);
    const ua = req.useragent;

    console.log("📥 Data yang akan disimpan:", {
      id,
      ip,
      location: geo,
      browser: ua.browser,
      os: ua.os,
      time: new Date(),
    });

    const data = new Tracking({
      id,
      ip,
      location: geo,
      browser: ua.browser,
      os: ua.os,
      time: new Date(),
    });

    await data
      .save()
      .then(() => {
        console.log("✅ Data berhasil disimpan ke database:", data);
      })
      .catch((saveError) => {
        console.error("❌ Gagal menyimpan data ke database:", saveError);
      });

    res.redirect("https://example.com"); // Ganti sesuai kebutuhan
  } catch (error) {
    console.error("❌ Error saat menyimpan data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
