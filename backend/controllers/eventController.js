const Event = require("../models/Event");

exports.createEvent = async (req, res, next) => {
  try {
    const { title, category, ticketTypes, capacity, venue, date, price } = req.body;

    const event = await Event.create({
      title,
      category,
      ticketTypes,
      capacity,
      venue,
      date,
      price,
      organizer: req.user.id,
    });

    res.status(201).json({ success: true, event });
  } catch (err) {
    next(err);
  }
};

exports.getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find().populate("organizer", "name email");
    res.json({ success: true, events });
  } catch (err) {
    next(err);
  }
};