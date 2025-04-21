const express = require("express");
const mongoose = require("mongoose");
const useragent = require("express-useragent");
const geoip = require("geoip-lite");

const app = express();
const PORT = 3000;
const MONGO_URI = "mongodb://localhost:27017/trackingDB";

// Middleware user-agent
app.use(useragent.express());

// Koneksi ke MongoDB dengan retry logic
const connectWithRetry = async (retries = 5, delay = 5000) => {
  while (retries > 0) {
    try {
      await mongoose.connect(MONGO_URI, {
        dbName: "trackingDB",
      });
      console.log("✅ Terhubung ke MongoDB");
      return;
    } catch (err) {
      console.error(
        `❌ Gagal konek MongoDB (sisa percobaan: ${retries}):`,
        err
      );
      retries -= 1;
      if (retries === 0) {
        console.error(
          "❌ Tidak dapat terhubung ke MongoDB setelah beberapa percobaan. Keluar."
        );
        process.exit(1);
      }
      console.log(`🔄 Mencoba kembali dalam ${delay / 1000} detik...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Call the retry function to connect to MongoDB
connectWithRetry();

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
  const startTime = Date.now(); // Start timing the request
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

    // Add a timeout for the save operation
    const savePromise = data.save();
    const timeoutPromise = new Promise(
      (_, reject) =>
        setTimeout(() => reject(new Error("Database save timeout")), 5000) // 5-second timeout
    );

    await Promise.race([savePromise, timeoutPromise])
      .then(() => {
        console.log("✅ Data berhasil disimpan ke database:", data);
      })
      .catch((saveError) => {
        console.error("❌ Gagal menyimpan data ke database:", saveError);
        throw saveError; // Re-throw to handle in the catch block
      });

    res.redirect("https://example.com"); // Ganti sesuai kebutuhan
  } catch (error) {
    console.error("❌ Error saat menyimpan data:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    const endTime = Date.now();
    console.log(`⏱️ Waktu pemrosesan: ${endTime - startTime}ms`);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
