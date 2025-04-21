const express = require("express");
const mongoose = require("mongoose");
const useragent = require("express-useragent");
const geoip = require("geoip-lite");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(useragent.express());

mongoose
  .connect("mongodb://localhost:27017/trackingDB", {
    dbName: "trackingDB",
  })
  .then(() => console.log("✅ Terhubung ke MongoDB"))
  .catch((err) => console.error("❌ MongoDB error:", err));

const trackingSchema = new mongoose.Schema({
  id: String,
  ip: String,
  location: Object,
  browser: String,
  os: String,
  time: Date,
});
const Tracking = mongoose.model("Tracking", trackingSchema);

app.get("/track/:id", async (req, res) => {
  const id = req.params.id;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
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
  console.log("✅ Data disimpan:", data);

  res.redirect("https://example.com");
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
