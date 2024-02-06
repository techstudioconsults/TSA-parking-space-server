const Slot = require("../models/slot");
const User = require("../models/user");

const getAllSlots = async (req, res) => {
  const slots = await Slot.find({})
    .sort({ slotNumber: 1 })
    .populate("occupiedBy", "-__v -createdAt -updatedAt")
    .select("-__v -createdAt -updatedAt");
  res.status(200).json({ slots });
};

const getSingleSlot = async (req, res) => {
  const { slotNumber } = req.params;
  const slot = await Slot.findOne({ slotNumber });

  if (!slot) {
    return res
      .status(404)
      .json({ message: `Slot ${slotNumber} does not exist` });
  }

  res.status(200).json({ slot });
};

const updateSlot = async (req, res) => {
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ message: "Please provide studentId" });
  }

  const student = await User.findOne({ studentId });

  if (!student) {
    return res.status(400).json({ message: `No student with ID:${studentId}` });
  }

  const { slotNumber } = req.params;

  try {
    const slot = await Slot.findOneAndUpdate(
      { slotNumber },
      { isAvailable: false, occupiedBy: student._id }
    );

    if (!slot) {
      return res
        .status(404)
        .json({ message: `Slot ${slotNumber} does not exist` });
    }
    return res
      .status(200)
      .json({ message: "Parking Confirmed!", slotNumber: slot.slotNumber });
  } catch (error) {
    return res.status(500).json({ message: "ooppss", error: error });
  }
};

module.exports = { getAllSlots, updateSlot, getSingleSlot };
  