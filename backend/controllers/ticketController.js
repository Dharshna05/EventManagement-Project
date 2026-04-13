const Ticket = require("../models/Ticket");
const Event = require("../models/Event");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");

// ─────────────────────────────────────────────
// Helper: generate QR code as base64 image
// ─────────────────────────────────────────────
const generateQR = async (ticketId) => {
  const FRONTEND_URL =
    process.env.FRONTEND_URL || "http://localhost:5173";

  const verifyURL = `${FRONTEND_URL}/verify-ticket/${ticketId}`;
  console.log("QR will encode this URL:", verifyURL);

  const qrImage = await QRCode.toDataURL(verifyURL, {
    errorCorrectionLevel: "M",
    type: "image/png",
    width: 256,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  return { qrImage, verifyURL };
};

// ─────────────────────────────────────────────
// POST /api/tickets/book
// ─────────────────────────────────────────────
const bookTicket = async (req, res) => {
  try {
    const { eventId, ticketType } = req.body;
    const holderId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const bookedCount = await Ticket.countDocuments({
      event: eventId,
      status: { $ne: "cancelled" },
    });

    if (bookedCount >= event.capacity) {
      return res.status(400).json({ message: "Event is fully booked" });
    }

    const existing = await Ticket.findOne({
      event: eventId,
      holder: holderId,
      status: { $ne: "cancelled" },
    });
    if (existing) {
      return res.status(400).json({
        message: "You already have a ticket for this event",
      });
    }

    const price =
      ticketType === "vip"
        ? event.vipPrice
        : ticketType === "student"
        ? event.studentPrice
        : event.price;

    const ticket = new Ticket({
      event: eventId,
      holder: holderId,
      ticketType: ticketType || "general",
      price,
      qrCode: "pending",
      qrData: "pending",
    });

    const { qrImage, verifyURL } = await generateQR(ticket._id.toString());
    ticket.qrCode = qrImage;
    ticket.qrData = verifyURL;

    await ticket.save();

    const populated = await Ticket.findById(ticket._id)
      .populate("event", "title date venue")
      .populate("holder", "name email");

    res.status(201).json({
      message: "Ticket booked successfully",
      ticket: populated,
    });
  } catch (error) {
    console.error("bookTicket error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/tickets/my
// ─────────────────────────────────────────────
const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ holder: req.user._id })
      .populate("event", "title date venue image category")
      .sort({ createdAt: -1 });

    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/tickets/verify/:ticketId
// PUBLIC — called when QR is scanned
// ─────────────────────────────────────────────
const verifyTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId)
      .populate("event", "title date venue")
      .populate("holder", "name email");

    if (!ticket) {
      return res.status(404).json({ valid: false, message: "Ticket not found" });
    }

    if (ticket.status === "cancelled") {
      return res.status(400).json({
        valid: false,
        message: "Ticket has been cancelled",
      });
    }

    if (ticket.checkedIn) {
      return res.status(200).json({
        valid: false,
        alreadyUsed: true,
        message: "Ticket already used for check-in",
        ticket: {
          holder: ticket.holder.name,
          email: ticket.holder.email,
          event: ticket.event.title,
          date: ticket.event.date,
          venue: ticket.event.venue,
          ticketType: ticket.ticketType,
          price: ticket.price,
          status: ticket.status,
          checkedIn: ticket.checkedIn,
          checkInTime: ticket.checkInTime,
        },
      });
    }

    res.json({
      valid: true,
      message: "Valid ticket",
      ticket: {
        holder: ticket.holder.name,
        email: ticket.holder.email,
        event: ticket.event.title,
        date: ticket.event.date,
        venue: ticket.event.venue,
        ticketType: ticket.ticketType,
        price: ticket.price,
        status: ticket.status,
        checkedIn: ticket.checkedIn,
      },
    });
  } catch (error) {
    console.error("verifyTicket error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────
// POST /api/tickets/checkin/:ticketId
// ─────────────────────────────────────────────
const checkInTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId)
      .populate("event")
      .populate("holder", "name email");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.checkedIn) {
      return res.status(400).json({
        message: "Already checked in",
        checkInTime: ticket.checkInTime,
      });
    }

    ticket.checkedIn = true;
    ticket.checkInTime = new Date();
    ticket.status = "used";
    await ticket.save();

    res.json({
      message: "Check-in successful",
      holder: ticket.holder.name,
      event: ticket.event.title,
      checkInTime: ticket.checkInTime,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────
// POST /api/tickets/cancel/:ticketId
// ─────────────────────────────────────────────
const cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.ticketId,
      holder: req.user._id,
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.checkedIn) {
      return res.status(400).json({ message: "Cannot cancel a used ticket" });
    }

    ticket.status = "cancelled";
    await ticket.save();

    res.json({ message: "Ticket cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/tickets/epass/:ticketId
// Download E-Pass PDF
// ─────────────────────────────────────────────
const downloadEPass = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.ticketId,
      holder: req.user._id,
    })
      .populate("event", "title date venue category")
      .populate("holder", "name email");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const doc = new PDFDocument({ size: "A5", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=epass-${ticket._id}.pdf`
    );
    doc.pipe(res);

    // Header band
    doc.rect(0, 0, doc.page.width, 72).fill("#e91e8c");
    doc
      .fillColor("#ffffff")
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("EventSphere E-Pass", 40, 25);

    // Event title
    doc
      .moveDown(3.5)
      .fillColor("#111827")
      .fontSize(17)
      .font("Helvetica-Bold")
      .text(ticket.event.title, { align: "center" });

    doc
      .moveDown(0.4)
      .fontSize(10)
      .fillColor("#6B7280")
      .font("Helvetica")
      .text("Category: " + (ticket.event.category || "General"), {
        align: "center",
      });

    // Divider
    doc
      .moveDown(1)
      .moveTo(40, doc.y)
      .lineTo(doc.page.width - 40, doc.y)
      .strokeColor("#E5E7EB")
      .lineWidth(1)
      .stroke();
    doc.moveDown(1);

    // Ticket details
    const rows = [
      ["Holder",      ticket.holder.name],
      ["Email",       ticket.holder.email],
      ["Date",        new Date(ticket.event.date).toDateString()],
      ["Venue",       ticket.event.venue || "TBA"],
      ["Ticket Type", ticket.ticketType],
      ["Price",       ticket.price === 0 ? "FREE" : "Rs. " + ticket.price],
      ["Status",      ticket.status.toUpperCase()],
    ];

    rows.forEach((row) => {
      doc
        .fontSize(9)
        .fillColor("#6B7280")
        .font("Helvetica-Bold")
        .text(row[0] + ":", 40, doc.y, { continued: true, width: 90 });
      doc.fillColor("#111827").font("Helvetica").text("  " + row[1]);
      doc.moveDown(0.25);
    });

    // QR Code section
    doc
      .moveDown(0.8)
      .fontSize(9)
      .fillColor("#6B7280")
      .text("Scan QR code at entry", { align: "center" });
    doc.moveDown(0.4);

    if (ticket.qrCode && ticket.qrCode !== "pending") {
      const base64 = ticket.qrCode.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64, "base64");
      const x = (doc.page.width - 130) / 2;
      doc.image(buffer, x, doc.y, { width: 130, height: 130 });
      doc.y = doc.y + 135;
    }

    // Footer
    doc
      .moveDown(0.6)
      .fontSize(7.5)
      .fillColor("#9CA3AF")
      .text(
        "This e-pass is non-transferable. Present at event entry.",
        { align: "center" }
      );

    doc.end();
  } catch (error) {
    console.error("downloadEPass error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────
module.exports = {
  bookTicket,
  getMyTickets,
  verifyTicket,
  checkInTicket,
  cancelTicket,
  downloadEPass,
};