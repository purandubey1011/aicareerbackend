let express = require("express");
let router = express.Router();
const { isAuthenticated } = require("../middlewares/auth.js");
const { testroute, signup,signin,currentuser,signout,deleteuser, google_auth, forgotPassword, resetPassword, getProgressStatus,isPaymentDone} = require("../controllers/index.controllers.js");


// home route
router.route("/").get(testroute)

// signup
router.route("/signup").post(signup);

// signin
router.route("/signin").post(signin);

// current user route
router.route("/user").post(isAuthenticated, currentuser);

// signout
router.route("/signout").post(isAuthenticated, signout);

// route for delete user
router.route("/deleteuser/:id").post(isAuthenticated, deleteuser);

// route for google auth
router.route("/google-auth").get(google_auth)

router.route("/forget-password").post(forgotPassword)

router.route("/reset-password/:token").post(resetPassword)

router.route('/progress-status').get(isAuthenticated,getProgressStatus)

router.route('/payment').post(isAuthenticated,isPaymentDone)


module.exports = router;