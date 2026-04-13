const mongoose = require("mongoose");

const checkInSchema = new mongoose.Schema(
  {
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    attendee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    checkedInAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CheckIn", checkInSchema);