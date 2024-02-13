const Slot = require("../models/slot");
const User = require("../models/user");

const getAllSlots = async (req, res) => {
  try {
    const slots = await Slot.find({})
      .sort({ slotNumber: 1 })
      .populate("occupiedBy", "-__v -createdAt -updatedAt")
      .select("-__v -createdAt -updatedAt");
    res.status(200).json({ slots });
  } catch (error) {
    console.error("Error fetching slots", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getSingleSlot = async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Error fetching single slot", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateSlot = async (req, res) => {
  try {
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
      }, 60 * 1000); // 10 hours in milliseconds
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
  } catch (error) {
    console.error("Error updating slot", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-__v -createdAt -updatedAt");
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getSingleStudent = async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Error fetching single student", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const refreshSlotAvailability = async (req, res) => {
  try {
    await Slot.updateMany({}, { isAvailable: true, occupiedBy: null });
    res.json({ message: "Slot availability refreshed successfully." });
  } catch (error) {
    console.error("Error refreshing slot availability:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getAllSlots,
  updateSlot,
  getSingleSlot,
  getAllUsers,
  getSingleStudent,
  refreshSlotAvailability,
};
