const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const email = "dharshananachimuthu@gmail.com"; // 👉 change this

    const result = await User.updateOne(
      { email: email },
      { $set: { isVerified: true } }
    );

    console.log("User activated:", result);

    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });