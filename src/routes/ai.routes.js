let express = require("express");
let router = express.Router();
const { isAuthenticated } = require("../middlewares/auth.js");
const { aicarrerfind_day1,aicarrerfind_day2,aicarrerfind_day3,godeep} = require("../controllers/ai.controllers.js");

// ✅ Day 1 form route
router.route("/aicarrerfind-day1").post(isAuthenticated, aicarrerfind_day1);

// ✅ Day 2 form route
router.route("/aicarrerfind-day2").post(isAuthenticated, aicarrerfind_day2);

// ✅ Day 3 form route
router.route("/aicarrerfind-day3").post(isAuthenticated, aicarrerfind_day3);

// ✅ Day 3 form route
router.route("/godeep").post(isAuthenticated, godeep);


module.exports = router;