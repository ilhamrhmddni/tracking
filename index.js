const express = require("express");
const useragent = require("express-useragent");
const geoip = require("geoip-lite");

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

  console.log({
    id,
    ip,
    location: geo,
    browser: ua.browser,
    os: ua.os,
    time: new Date(),
  });

  // Redirect ke URL tujuan
  res.redirect("https://example.com");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
