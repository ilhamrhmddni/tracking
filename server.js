const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Gunakan body-parser untuk menangani data JSON
app.use(bodyParser.json());

// Koneksi ke MongoDB

mongoose
  .connect("mongodb://localhost:27017/trackingDB")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// Schema dan model untuk data klik
const clickSchema = new mongoose.Schema({
  ip: String,
  browser: String,
  location: String,
  time: Date,
});

const Click = mongoose.model("Click", clickSchema);

// Endpoint untuk menerima data klik
app.post("/track", async (req, res) => {
  const { ip, browser, location } = req.body;

  const newClick = new Click({
    ip,
    browser,
    location,
    time: new Date(),
  });

  try {
    await newClick.save();
    res.status(200).send("Data klik disimpan");
  } catch (err) {
    res.status(500).send("Error menyimpan data klik");
  }
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
