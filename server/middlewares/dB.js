const mongoose = require("mongoose");
const dbconnect = async () => {
  try {

    const db = await mongoose.connect(process.env.MONGO_URL, {
        socketTimeoutMS: 30000
    });
    console.log("Database connected");
  } catch (err) {
    console.log(err);
  }
};
module.exports = dbconnect;

