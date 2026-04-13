const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    holder: {   // ✅ changed from attendee
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ticketType: {
      type: String,
      required: true,
    },

    price: {   // ✅ added
      type: Number,
      required: true,
    },

    qrCode: {
      type: String,
      required: true,
    },

    qrData: {   // ✅ changed from qrPayload
      type: String,
      required: true,
    },

    status: {   // ✅ added
      type: String,
      enum: ["active", "used", "cancelled"],
      default: "active",
    },

    checkedIn: {
      type: Boolean,
      default: false,
    },

    checkInTime: {   // ✅ added
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);