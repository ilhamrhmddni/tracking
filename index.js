const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios"); // Untuk kirim request ke Telegram

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(
  "mongodb+srv://ilhamrhmddni:110402@ilhamrhmddni.fqznp3q.mongodb.net/trackingDB"
);

// Schema dan model MongoDB
const trackingSchema = new mongoose.Schema({
  id: String,
  latitude: Number,
  longitude: Number,
  accuracy: Number,
  time: { type: Date, default: Date.now },
  gmapsLink: String,
});

const Tracking = mongoose.model("Tracking", trackingSchema);

// Telegram Config
const TELEGRAM_BOT_TOKEN = "7636945599:AAHX_WVq-xzTkpR9mCPpSY2op1-OTGZoW5o"; // <- Ganti dengan token bot kamu
const TELEGRAM_CHAT_ID = "1069381947"; // <- Ganti dengan chat ID kamu

// Fungsi kirim notifikasi Telegram
async function sendTelegramNotification(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "Markdown", // biar bisa bold dan link
      disable_web_page_preview: true,
    });
  } catch (error) {
    console.error("❌ Gagal kirim notifikasi Telegram:", error.message);
  }
}

// Endpoint POST /track
app.post("/track", async (req, res) => {
  const { latitude, longitude, accuracy } = req.body;

  const gmapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

  // Buat ID dan waktu lokal (UTC+8)
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 8); // WITA (UTC+8)

  const id = `${currentDate.getDate()}/${
    currentDate.getMonth() + 1
  }/${currentDate.getFullYear()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;

  // Simpan ke MongoDB
  const data = new Tracking({ ...req.body, id, gmapsLink });
  await data.save();

  console.log("✅ Lokasi disimpan:", req.body);

  // Kirim notifikasi ke Telegram
  const notifMessage = `📍 *Lokasi Baru Diterima!*\n🆔 *ID:* ${id}\n🌐 *Link Maps:* [Klik di sini](${gmapsLink})\n📌 *Koordinat:* ${latitude}, ${longitude}\n📶 *Akurasi:* ${accuracy} meter`;
  await sendTelegramNotification(notifMessage);

  res.send({ message: "Lokasi diterima!", gmapsLink });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`🚀 Server running di http://localhost:${PORT}`);
});
