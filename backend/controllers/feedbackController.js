const Feedback = require("../models/Feedback");

exports.addFeedback = async (req, res, next) => {
  try {
    const { eventId, rating, comment } = req.body;

    const feedback = await Feedback.create({
      event: eventId,
      attendee: req.user.id,
      rating,
      comment,
    });

    res.status(201).json({ success: true, feedback });
  } catch (err) {
    next(err);
  }
};