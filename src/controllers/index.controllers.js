const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const User = require("../models/user.schema.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const crypto = require("crypto")
const bcrypt = require("bcryptjs")
const { sendtoken } = require("../utils/sendtoken.js");
const { oauth2Client } = require("../utils/googleConfig.js");
const axios = require("axios");
const { transporter } = require("../services/Email.js");

// home page tasting 
exports.testroute = catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "Welcome to falverra"
    })
})

// signup student
exports.signup = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password,contact } = req.body;
  

  if ([name, email, password,contact].some((field) => field?.trim() === "")) {
    return next(new ErrorHandler("User details required", 401));
  }

  const existedUser = await User.findOne({ email});

  if (existedUser) {
    return next(
      new ErrorHandler("User with this email or contact already exists", 409)
    );
  }

  const user = await User.create({
    name,
    email,
    contact,
    password,
  });

  sendtoken(user, 200, res);
});

// signin student
exports.signin = catchAsyncErrors(async (req, res, next) => {
  let user = await User.findOne({ email: req.body.email })
    .select("+password")
    .exec();

  if (!user)
    return next(
      new ErrorHandler("User not found with this email address", 404)
    );

  const isMatch = await user.comparepassword(req.body.password);
  if (!isMatch) return next(new ErrorHandler("Incorrect password", 400));

  sendtoken(user, 200, res);
});

// current student
exports.currentuser = catchAsyncErrors(async (req, res, next) => {
  let user = await User.findById(req.id).exec();


  if (!user) return next(new ErrorHandler("User not found", 404));
  res.json({ success: true, user: user });
});

// signout student
exports.signout = catchAsyncErrors(async (req, res, next) => {
   res.clearCookie("token", {
    httpOnly: true,
    secure: true, // because you're on HTTPS (Hostinger + Render)
    sameSite: "None",
    path: "/", // clear from entire site
  });

  return res.status(200).json({
    success: true,
    message: "Successfully signed out!",
  });
});

exports.deleteuser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id).exec();
  if (!user) return next(new ErrorHandler("User not found", 404));
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

exports.google_auth = catchAsyncErrors(async (req, res, next) => {
  const code = req.query.code;
  if (!code) return res.status(400).json({ message: "No code provided" });

  let googleRes;
  try {
    googleRes = await oauth2Client.getToken(code);
  } catch (error) {
    console.error("Google Token Error:", error.response?.data || error.message);
    return res.status(401).json({ message: "Failed to get token from Google API" });
  }

  oauth2Client.setCredentials(googleRes.tokens);

  let userRes;
  try {
    userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`);
  } catch (error) {
    console.error("User Info Fetch Error:", error.response?.data || error.message);
    return res.status(401).json({ message: "Failed to fetch user info from Google API" });
  }
  console.log("Google user response:", userRes.data);
  const { email, name, picture } = userRes.data;
  console.log("Google user info:", email, name);

  let user;
  try {
    user = await User.findOne({ email });
    if (!user) {
      user =await User.create({
        name,
        email,
        avatar: { url: picture || "" }
      });
      await user.save();
    } else {
      console.log("User already exists");
    }
  } catch (error) {
    console.error("User DB Error:", error);
    return res.status(500).json({ message: "Failed to find or create user", error: error.message });
  }

  try {
    sendtoken(user, 200, res);
  } catch (error) {
    console.error("Token Send Error:", error);
    return res.status(500).json({ message: "Failed to send token" });
  }
});

//Forget password
exports.forgotPassword = catchAsyncErrors( async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const token = crypto.randomBytes(32).toString("hex");
  const tokenExpires = Date.now() + 3600000; // 1 hour

  user.resetPasswordToken = token;
  user.resetPasswordExpires = tokenExpires;
  await user.save();

  const resetLink = `${process.env.HOST}/reset-password/${token}`;

  await transporter.sendMail({
    to: user.email,
    subject: "Password Reset Request",
    html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset it.</p>`,
  });

  res.json({ message: "Reset link sent to your email" });
});

//Reset password 
exports.resetPassword = catchAsyncErrors( async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: "Token invalid or expired" });

  // const hashedPassword = await bcrypt.hash(newPassword, 12);

  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.status(200).json({ message: "Password reset successfully" });
});

// GET /api/v1/user/progress-status
exports.getProgressStatus = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.id);

  if (!user) return next(new ErrorHandler("User not found", 404));
  res.status(200).json({
    success: true,
    day1SubmittedAt: user.quesAns.day1SubmittedAt,
    day2SubmittedAt: user.quesAns.day2SubmittedAt,
  });
});

// GET /api/v1/user/progress-status
exports.isPaymentDone = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.id);

  if (!user) return next(new ErrorHandler("User not found", 404));

  user.isPaymentDone = true; // Assuming you want to set this to true for the user
  await user.save();

  res.status(200).json({
    success: true,
    isPaymentDone: user.isPaymentDone,
  });
});

