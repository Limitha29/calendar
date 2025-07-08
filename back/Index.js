require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Holiday = require('./models/Holiday');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
console.log("MONGO_URI:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// Root Route
app.get("/", (req, res) => {
  res.send("🌍 Backend is working!");
});

// ✅ Add Multiple Holidays (Array of Events)
app.post('/add-holidays', async (req, res) => {
  const holidays = req.body;
  console.log("📥 Incoming holidays:", holidays);

  if (!Array.isArray(holidays)) {
    return res.status(400).json({ error: "Expected an array of holiday objects." });
  }

  const invalid = holidays.filter(h => !h.date || !h.name || typeof h.name !== 'string');

  if (invalid.length > 0) {
    return res.status(400).json({ error: "Each holiday must include 'date' and 'name'." });
  }

  try {
    for (const { date, name, type = "General", description = "" } of holidays) {
      const existing = await Holiday.findOne({ date });

      const newEvent = { name, type, description };

      if (existing) {
        const existsAlready = existing.events.some(
          e => e.name === name && e.type === type && e.description === description
        );
        if (!existsAlready) {
          existing.events.push(newEvent);
          await existing.save();
        }
      } else {
        await Holiday.create({
          date,
          events: [newEvent]
        });
      }
    }

    res.json({ message: "✅ Holidays added or updated successfully." });
  } catch (err) {
    console.error("❌ Error inserting holidays:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Weekday + Events for a Given Date
app.post('/get-day-event', async (req, res) => {
  const { day, month } = req.body;

  if (!day || !month || day < 1 || day > 31 || month < 1 || month > 12) {
    return res.status(400).json({ error: "Invalid date input" });
  }

  try {
    const dateStr = `2026-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const weekday = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });

    const holiday = await Holiday.findOne({ date: dateStr });

    res.json({
      date: dateStr,
      weekday,
      events: holiday ? holiday.events : []
    });
  } catch (err) {
    console.error("❌ Error in /get-day-event:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
