const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    isAvailable: {
      type: Boolean,
      required: true,
    },
    slotNumber: {
      type: Number,
      required: true,
    },
    occupiedBy: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Slot", slotSchema);
