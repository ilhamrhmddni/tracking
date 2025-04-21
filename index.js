const express = require("express");
const useragent = require("express-useragent");
const geoip = require("geoip-lite");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Middleware useragent
app.use(useragent.express());

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

  // Ambil data lama dari file, lalu tambahkan data baru
  const filePath = "./log.json";

  // Cek kalau file belum ada, buat kosong dulu
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]");
  }

  // Baca file
  const fileData = JSON.parse(fs.readFileSync(filePath));
  fileData.push(data);

  // Tulis kembali ke file
  fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));

  res.redirect("https://example.com");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
