const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const { authenticate } = require("../middlewares/authMiddleware");

router.get("/profile", authenticate, UserController.getProfile);
router.put("/profile", authenticate, UserController.updateProfile);
router.delete("/profile", authenticate, UserController.deleteProfile);

module.exports = router;