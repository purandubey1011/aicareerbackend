let express = require("express");
let router = express.Router();
const { isAuthenticated } = require("../middlewares/auth.js");
const { day1form,day2form,day3form} = require("../controllers/form.controllers.js");

// ✅ Day 1 form route
router.route("/day1form").post(isAuthenticated, day1form);

// ✅ Day 2 form route
router.route("/day2form").post(isAuthenticated, day2form);

// ✅ Day 2 form route
router.route("/day3form").post(isAuthenticated, day3form);

module.exports = router;