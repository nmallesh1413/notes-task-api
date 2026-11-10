const express = require("express");
const { register, login } = require("../controllers/authController");
const { registerRules, loginRules } = require("../validators/authValidators");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.post("/register", registerRules, validateRequest, register);
router.post("/login", loginRules, validateRequest, login);

module.exports = router;
