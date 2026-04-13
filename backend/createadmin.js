require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  
  // Delete existing admin if any
  await mongoose.connection.collection('users').deleteOne(
    { email: 'admin@eventsphere.com' }
  );
  console.log('Old admin deleted');

  // Create fresh admin
  const hash = await bcrypt.hash('Admin1234', 12);
  
  await mongoose.connection.collection('users').insertOne({
    name: 'Admin',
    email: 'admin@eventsphere.com',
    password: hash,
    role: 'Admin',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('Admin created successfully!');
  console.log('Email: admin@eventsphere.com');
  console.log('Password: Admin1234');
  process.exit();
});