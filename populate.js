/** @format */

require("dotenv").config({ path: ".env" });

const Slot = require("./src/models/slot");
const User = require("./src/models/user");
const slotData = require("./slotsData.json");
const userData = require("./userData.json");
const connectDB = require("./src/db/connect");

const start = async () => {
  try {
    await connectDB(`${process.env.MONGO_URI}`);
    console.log("DB connected!");
    console.log("Uploading...");
    
    // To populate slots
    // await Slot.deleteMany();
    // await Slot.create(slotData);

    // To populate users
    await User.deleteMany();
    await User.create(userData);
    console.log("Data Uploaded successfully");
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
