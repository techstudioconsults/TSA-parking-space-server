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
    const { slotNumber } = req.params;
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

  // Restrict student from taking more than one slot
  if (student.slot) {
    // console.log(student.slot);
    return res.status(400).json({
      message: `${student.name} is already assigned to slot ${student.slot}`,
    });
  }

  const slot = await Slot.findOneAndUpdate(
    { slotNumber, isAvailable: true, occupiedBy: null }, 
    { isAvailable: false, occupiedBy: student._id },
    { new: true } 
  );

  if (!slot) {
    return res.status(404).json({ message: `Slot ${slotNumber} does not exist or is occupied` });
  }

  student.slot = slotNumber;
  await student.save();

  // Schedule expiration after 10 hours
  if(student.slot){
    setTimeout(async () => {
      student.slot = null;
      await student.save();
      await Slot.findOneAndUpdate({ slotNumber }, { isAvailable: true, occupiedBy: null });
      await User.updateMany({}, { slot: null });
      console.log(`Slot expired for student ${studentId} in slot ${slotNumber}`);
    }, 10 * 60 * 60 * 1000); 
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
    const { studentId } = req.params;
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
    await User.updateMany({}, { slot: null });
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
