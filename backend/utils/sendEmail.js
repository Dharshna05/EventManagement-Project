const nodemailer = require("nodemailer");

// Generic send function
const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    tls: {
      rejectUnauthorized: false,
    },
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: '"EventSphere" <' + process.env.EMAIL_USER + '>',
    to,
    subject,
    html,
  });
};

// Activation email — sent after registration
const sendActivationEmail = async (email, name, token) => {
  const link = process.env.CLIENT_URL + '/activate/' + token;
  await sendEmail({
    to: email,
    subject: 'Activate Your EventSphere Account',
    html:
      '<div style="font-family:Arial;max-width:600px;margin:auto;padding:30px;border:1px solid #eee;border-radius:8px">' +
      '<h2 style="color:#e91e8c">Welcome to EventSphere, ' + name + '!</h2>' +
      '<p>Thank you for registering! Please click the button below to activate your account.</p>' +
      '<p>This link expires in <strong>24 hours</strong>.</p>' +
      '<a href="' + link + '" style="display:inline-block;margin:20px 0;padding:12px 28px;background:#e91e8c;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold">Activate Account</a>' +
      '<p style="color:#888;font-size:12px">If you did not register, ignore this email.</p>' +
      '</div>',
  });
};

// Booking confirmation email — sent after ticket booking
const sendBookingEmail = async (email, name, event, bookingRef, ticketType) => {
  await sendEmail({
    to: email,
    subject: 'Booking Confirmed - ' + event.title,
    html:
      '<div style="font-family:Arial;max-width:600px;margin:auto;padding:30px;border:1px solid #eee;border-radius:8px">' +
      '<h2 style="color:#e91e8c">Booking Confirmed!</h2>' +
      '<p>Hi <strong>' + name + '</strong>, your ticket is booked.</p>' +
      '<p><strong>Event:</strong> ' + event.title + '</p>' +
      '<p><strong>Date:</strong> ' + new Date(event.date).toDateString() + '</p>' +
      '<p><strong>Ticket Type:</strong> ' + ticketType + '</p>' +
      '<p><strong>Booking Ref:</strong> <span style="color:#e91e8c">' + bookingRef + '</span></p>' +
      '<a href="' + process.env.CLIENT_URL + '/my-tickets" style="display:inline-block;padding:12px 28px;background:#e91e8c;color:#fff;text-decoration:none;border-radius:6px">Download E-Pass</a>' +
      '</div>',
  });
};

// Welcome email — sent after successful login
const sendWelcomeEmail = async (email, name) => {
  await sendEmail({
    to: email,
    subject: 'Welcome back to EventSphere!',
    html:
      '<div style="font-family:Arial;max-width:600px;margin:auto;padding:30px;border:1px solid #eee;border-radius:8px">' +
      '<h2 style="color:#e91e8c">Welcome back, ' + name + '!</h2>' +
      '<p>You have successfully logged in to <strong>EventSphere</strong>.</p>' +
      '<p>Here is what you can do:</p>' +
      '<ul>' +
      '<li>Browse and book tickets for exciting events</li>' +
      '<li>Download your e-pass with QR code</li>' +
      '<li>Rate and review events you attended</li>' +
      '</ul>' +
      '<a href="' + process.env.CLIENT_URL + '/events" style="display:inline-block;margin:20px 0;padding:12px 28px;background:#e91e8c;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold">Browse Events</a>' +
      '<p style="color:#888;font-size:12px">If this was not you, please contact support.</p>' +
      '</div>',
  });
};

module.exports = {
  sendEmail,
  sendActivationEmail,
  sendBookingEmail,
  sendWelcomeEmail,
};