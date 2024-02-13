const Slot = require("../models/slot");
const User = require("../models/user");
const asyncHandler = require('../middlewares/async');

const getAllSlots = asyncHandler (async (req, res) => {
    const slots = await Slot.find({})
      .sort({ slotNumber: 1 })
      .populate("occupiedBy", "-__v -createdAt -updatedAt")
      .select("-__v -createdAt -updatedAt");
    res.status(200).json({ slots });
});

const getSingleSlot =  asyncHandler (async (req, res) => {
    const { slotNumber } = req.body;
    const slot = await Slot.findOne({ slotNumber })
      .populate("occupiedBy", "-__v -createdAt -updatedAt")
      .select("-__v -createdAt -updatedAt");

    if (!slot) {
      return res
        .status(404)
        .json({ message: `Slot ${slotNumber} does not exist` });
    }
    res.status(200).json({ slot });
 
});

const updateSlot = asyncHandler(async (req, res) => {
  
    const { studentId } = req.body;
    const { slotNumber } = req.params;

    if (!studentId) {
      return res.status(400).json({ message: "Please provide studentId" });
    }

    const student = await User.findOne({ studentId }).select(
      "-__v -createdAt -updatedAt"
    );

    if (!student) {
      return res
        .status(400)
        .json({ message: `No student with ID:${studentId}` });
    }

    const slot = await Slot.findOneAndUpdate(
      { slotNumber },
      { isAvailable: false, occupiedBy: student._id }
    );

    if (slot) {
      student.slot = slotNumber;
      await student.save();

      // Schedule expiration after 10 hours
      setTimeout(async () => {
        student.slot = null;
        await student.save();
        await Slot.findOneAndUpdate(
          { slotNumber },
          { isAvailable: true, occupiedBy: null }
        );
        console.log(`Slot expired for student ${studentId}`);
      }, 60 * 60 * 1000); // 10 hours in milliseconds
    }

    if (!slot) {
      return res
        .status(404)
        .json({ message: `Slot ${slotNumber} does not exist` });
    }

    return res.json({
      message: "Parking Confirmed!",
      slotNumber: slot.slotNumber,
      student,
    });
 
});

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select("-__v -createdAt -updatedAt");
    res.status(200).json({ users });

});

const getSingleStudent = asyncHandler(async (req, res) => {
    const { studentId } = req.body;
    const student = await User.findOne({ studentId }).select(
      "-__v -createdAt -updatedAt"
    );

    if (!student) {
      return res
        .status(404)
        .json({success: false, message: `Student with ID ${studentId} not found` });
    }

    res.json({ student });
 
});

const refreshSlotAvailability = asyncHandler(async (req, res) => {
    await Slot.updateMany({}, { isAvailable: true, occupiedBy: null });
    res.json({ message: "Slot availability refreshed successfully." });
  
});

module.exports = {
  getAllSlots,
  updateSlot,
  getSingleSlot,
  getAllUsers,
  getSingleStudent,
  refreshSlotAvailability,
};
