const mongoose = require('mongoose');

const HolidaySchema = new mongoose.Schema({
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
    unique: true
  },
  events: [
    {
      name: { type: String, required: true },
      type: { type: String, default: "General" },
      description: { type: String, default: "" }
    }
  ]
});

module.exports = mongoose.model('Holiday', HolidaySchema);
