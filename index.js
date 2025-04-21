const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = 3000;

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
});

const Tracking = mongoose.model("Tracking", trackingSchema);

app.post("/track", async (req, res) => {
  const data = new Tracking(req.body);
  await data.save();
  console.log("✅ Lokasi disimpan:", req.body);
  res.send("Lokasi diterima!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running di http://localhost:${PORT}`);
});
