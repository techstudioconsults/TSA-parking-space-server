const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
    },
    name: {
      type: String,
    },
    cohort: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
