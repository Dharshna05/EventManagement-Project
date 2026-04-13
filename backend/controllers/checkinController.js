const Ticket = require('../models/Ticket');

exports.checkInTicket = async (req, res) => {
  try {
    const { ticketId } = req.body;
    console.log('CheckIn - ticketId:', ticketId);
    console.log('CheckIn - user role:', req.user.role);

    if (!ticketId) {
      return res.status(400).json({ message: 'ticketId is required.' });
    }

    const ticket = await Ticket.findById(ticketId)
      .populate('event', 'title')
      .populate('holder', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found. Invalid QR code.' });
    }

    if (ticket.status === 'cancelled') {
      return res.status(400).json({ message: 'This ticket is cancelled.' });
    }

    if (ticket.checkedIn) {
      return res.status(400).json({
        message: 'Already checked in at ' + new Date(ticket.checkInTime).toLocaleTimeString(),
      });
    }

    ticket.checkedIn = true;
    ticket.checkInTime = new Date();
    ticket.status = 'used';
    await ticket.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('checkin_update', {
        attendeeName: ticket.holder.name,
        checkedInAt: ticket.checkInTime,
      });
    }

    res.json({
      success: true,
      message: 'Check-in successful!',
      attendee: {
        name: ticket.holder.name,
        email: ticket.holder.email,
      },
      event: ticket.event.title,
      ticketType: ticket.ticketType,
      checkedInAt: ticket.checkInTime,
    });

  } catch (err) {
    console.error('checkInTicket error:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

exports.getEventAnalytics = async (req, res) => {
  try {
    res.json({ success: true, message: 'Analytics working' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};