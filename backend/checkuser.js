require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const users = await mongoose.connection.collection('users').find({}).toArray();
  console.log('Total users:', users.length);
  users.forEach(function(u) {
    console.log('Email:', u.email, '| Verified:', u.isVerified);
  });
  process.exit();
});