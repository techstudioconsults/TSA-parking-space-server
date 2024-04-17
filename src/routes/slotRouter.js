const express = require("express");
const {
  getAllSlots,
  updateSlot,
  getSingleSlot,
  getAllUsers,
  getSingleStudent,
  refreshAllSlots,
  refreshSingleSlot,
} = require("../controllers/slotController");
const methodNotAllowed = require("../utils/methodNotAllowed");

const router = express.Router();

router
.route("/").get(getAllSlots).all(methodNotAllowed);
router
.route("/users").get(getAllUsers).all(methodNotAllowed);
router
.route("/user/:studentId").get(getSingleStudent).all(methodNotAllowed);
router
.route("/refresh").post(refreshAllSlots).all(methodNotAllowed);
router
  .route("/:slotNumber")
  .get(getSingleSlot)
  .post(refreshSingleSlot)
  .patch(updateSlot)
  .all(methodNotAllowed);

module.exports = router;
