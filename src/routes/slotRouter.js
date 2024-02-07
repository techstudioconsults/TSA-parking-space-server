const express = require("express");
const {
  getAllSlots,
  updateSlot,
  getSingleSlot,
  getAllUsers,
  getSingleStudent,
  refreshSlotAvailability,
} = require("../controllers/slotController");
const methodNotAllowed = require("../utils/methodNotAllowed");

const router = express.Router();

router
.route("/").get(getAllSlots).all(methodNotAllowed);
router
.route("/users").get(getAllUsers).all(methodNotAllowed);
router
.route("/user").get(getSingleStudent).all(methodNotAllowed);
router
.route("/refresh").post(refreshSlotAvailability).all(methodNotAllowed);
router
  .route("/:slotNumber")
  .get(getSingleSlot)
  .patch(updateSlot)
  .all(methodNotAllowed);

module.exports = router;
