const Slot = require("../models/slot");
const User = require("../models/user");
const asyncHandler = require('../middlewares/async');
const axios = require("axios");

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

  try {
    if (!studentId) {
      return res.status(400).json({ message: "Please provide studentId" });
    }

    const url = `https://tsa-database-server.onrender.com/api/v1/student/check`;
    const { data : student } = await axios.post(url, {studentId});

    // console.log(student);

    if (!student._id) {
      return res.status(400).json({ message: `No student found with ID: ${studentId}` });
    }

    const existingSlot = await Slot.findOne({ "occupiedBy._id": student._id });
    if (existingSlot) {
      return res.status(400).json({ message: `You've already parked on slot '${existingSlot.slotNumber}'` });
    }

    const slot = await Slot.findOneAndUpdate(
      { slotNumber, isAvailable: true, occupiedBy: null },
      { isAvailable: false, occupiedBy: student },
      { new: true }
    );
    
    if (!slot) {
      return res.status(404).json({ message: `Slot ${slotNumber} is not available or occupied` });
    } 

    setTimeout(async () => {
      try {
        const updatedSlot = await Slot.findOneAndUpdate(
          { slotNumber },
          { isAvailable: true, occupiedBy: null },
          { new: true }
        );
        if (updatedSlot) {
          console.log(`Slot expired for student ${studentId} in slot ${slotNumber}`);
        } else {
          console.log(`Failed to update slot for student ${studentId} in slot ${slotNumber}`);
        }
      } catch (error) {
        console.error("Error updating slot:", error);
      }
    }, 5 * 60 * 1000);
    

    return res.json({ message: "Parking Confirmed!", slot });
  } catch (error) {
    console.error("Error updating slot:", error);
    return res.status(500).json({ message: "Internal server error" });
  } 
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

const refreshAllSlots = asyncHandler(async (req, res) => {
    await Slot.updateMany({}, { isAvailable: true, occupiedBy: null });
    await User.updateMany({}, { slot: null });
    res.json({ message: "All Slots refreshed successfully." });  
});

const refreshSingleSlot = asyncHandler(async (req, res) => {
  const { slotNumber } = req.params;

  try {
    const slot = await Slot.findOne({ slotNumber });

    if (!slot) {
      return res.status(404).json({ message: `Slot ${slotNumber} not found` });
    }

    if (!slot.occupiedBy) {
      return res.status(400).json({ message: `Slot ${slotNumber} is not occupied` });
    }

    // Refresh the slot availability
    const updatedSlot = await Slot.findOneAndUpdate(
      { slotNumber },
      { isAvailable: true, occupiedBy: null },
      { new: true }
    );

    if (!updatedSlot) {
      return res.status(500).json({ message: `Failed to refresh slot ${slotNumber}` });
    }

    return res.json({ message: `Slot ${slotNumber} refreshed successfully`, slot: updatedSlot });
  } catch (error) {
    console.error("Error refreshing slot availability:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});



module.exports = {
  getAllSlots,
  updateSlot,
  getSingleSlot,
  getAllUsers,
  getSingleStudent,
  refreshAllSlots,
  refreshSingleSlot,
};
