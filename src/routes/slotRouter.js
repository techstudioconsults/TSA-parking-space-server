const express = require("express");
const {
  getAllSlots,
  updateSlot,
  getSingleSlot,
} = require("../controllers/slotController");
const methodNotAllowed = require("../utils/methodNotAllowed");

const router = express.Router();

router.route("/").get(getAllSlots).all(methodNotAllowed);
router
  .route("/:slotNumber")
  .get(getSingleSlot)
  .patch(updateSlot)
  .all(methodNotAllowed);

module.exports = router;
