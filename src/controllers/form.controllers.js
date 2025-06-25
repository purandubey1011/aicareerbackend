const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const User = require("../models/user.schema.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const { transporter } = require("../services/Email.js");

exports.day1form = catchAsyncErrors(async (req, res, next) => {
  const { qnaArray } = req.body;

  if (
    !Array.isArray(qnaArray) ||
    qnaArray.length === 0 ||
    qnaArray.some((q) => !q.question || !q.answer || q.answer.trim() === "")
  ) {
    return next(
      new ErrorHandler("All questions must be answered properly", 400)
    );
  }

  const user = await User.findById(req.id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  user.quesAns.day1 = qnaArray;
  user.quesAns.day1SubmittedAt = new Date();
  await user.save();

  await transporter.sendMail({
    to: user.email,
    subject: "✅ Day 1 Form Submitted Successfully!",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
      <div style="text-align: center; padding-bottom: 20px;">
        <h2 style="color: #4CAF50;">🎉 Day 1 Form Submitted!</h2>
      </div>
      <p style="font-size: 16px; color: #333;">Hi <strong>${
        user.name
      }</strong>,</p>
      <p style="font-size: 15px; color: #333; line-height: 1.6;">
        We’re happy to let you know that your <strong>Day 1 Career Discovery Form</strong> has been successfully submitted on <strong>${new Date().toLocaleDateString()}</strong>.
      </p>
      <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
      <h4 style="color: #4CAF50;">What’s Next?</h4>
      <ul style="font-size: 15px; line-height: 1.6; color: #444; padding-left: 20px;">
        <li>✅ Your answers have been saved securely.</li>
        <li>🕒 Please wait 24 hours before accessing Day 2 (or 1 minute if in testing).</li>
        <li>🚀 You’ll unlock personalized career insights based on your input.</li>
      </ul>
      <p style="font-size: 15px; margin-top: 20px;">You can always return to your dashboard and continue from where you left off.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:5173/" style="background-color: #4CAF50; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">
          Go to Dashboard
        </a>
      </div>
      <p style="font-size: 13px; color: #999;">If you did not submit this form or have questions, please contact our support team.</p>
      <div style="text-align: center; font-size: 12px; color: #bbb; margin-top: 30px;">
        &copy; ${new Date().getFullYear()} Career AI Assistant. All rights reserved.
      </div>
    </div>
  `,
  });

  res.status(200).json({
    success: true,
    message: "Day 1 form submitted successfully",
    day1: user.quesAns.day1,
  });
});

// Save Day 2 form
exports.day2form = catchAsyncErrors(async (req, res, next) => {
  const { qnaArray } = req.body;

  if (
    !Array.isArray(qnaArray) ||
    qnaArray.length === 0 ||
    qnaArray.some((q) => !q.question || !q.answer || q.answer.trim() === "")
  ) {
    return next(
      new ErrorHandler("All questions must be answered properly", 400)
    );
  }

  const user = await User.findById(req.id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  user.quesAns.day2 = qnaArray;
  user.quesAns.day2SubmittedAt = new Date();
  await user.save();

  await transporter.sendMail({
    to: user.email,
    subject: "✅ Day 2 Form Submitted Successfully!",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
      <div style="text-align: center; padding-bottom: 20px;">
        <h2 style="color: #2196F3;">👏 Day 2 Form Submitted!</h2>
      </div>
      <p style="font-size: 16px; color: #333;">Hi <strong>${
        user.name
      }</strong>,</p>
      <p style="font-size: 15px; color: #333; line-height: 1.6;">
        Great job completing your <strong>Day 2 Career Exploration Form</strong>! Your submission was received successfully on <strong>${new Date().toLocaleDateString()}</strong>.
      </p>
      <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
      <h4 style="color: #2196F3;">What’s Next?</h4>
      <ul style="font-size: 15px; line-height: 1.6; color: #444; padding-left: 20px;">
        <li>📥 Your answers have been saved and stored securely.</li>
        <li>🕒 Please wait 24 hours before accessing Day 3 (or 1 minute if in testing).</li>
        <li>🌟 Day 3 will unlock a personalized roadmap based on your answers so far.</li>
      </ul>
      <p style="font-size: 15px; margin-top: 20px;">You're getting closer to discovering a career that truly fits you.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:5173/" style="background-color: #2196F3; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">
          View Your Progress
        </a>
      </div>
      <p style="font-size: 13px; color: #999;">If you didn’t submit this or need support, contact our team anytime.</p>
      <div style="text-align: center; font-size: 12px; color: #bbb; margin-top: 30px;">
        &copy; ${new Date().getFullYear()} Career AI Assistant. All rights reserved.
      </div>
    </div>
  `,
  });

  res.status(200).json({
    success: true,
    message: "Day 2 form submitted successfully",
    day2: user.quesAns.day2,
  });
});

// save day3 form data

// Save Day 3 form
exports.day3form = catchAsyncErrors(async (req, res, next) => {
  const { qnaArray } = req.body;

  if (
    !Array.isArray(qnaArray) ||
    qnaArray.length === 0 ||
    qnaArray.some((q) => !q.question || !q.answer || q.answer.trim() === "")
  ) {
    return next(
      new ErrorHandler("All questions must be answered properly", 400)
    );
  }

  const user = await User.findById(req.id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  user.quesAns.day3 = qnaArray;
  user.quesAns.day3SubmittedAt = new Date();
  await user.save();

  await transporter.sendMail({
    to: user.email,
    subject: "🎯 Congratulations! Your Career Journey is Complete",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background-color: #ffffff;">
      <div style="text-align: center; padding-bottom: 20px;">
        <h2 style="color: #4CAF50;">🎉 Day 3 Completed Successfully!</h2>
        <p style="font-size: 16px; color: #444;">You've reached the final step of your career discovery journey.</p>
      </div>

      <p style="font-size: 15px; color: #333;">Hi <strong>${
        user.name
      }</strong>,</p>

      <p style="font-size: 15px; line-height: 1.6; color: #333;">
        Congratulations on completing <strong>Day 3</strong> of your career discovery journey! You’ve taken the time to deeply reflect on your interests, strengths, and aspirations over the past few days. 🌟
      </p>

      <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />

      <h4 style="color: #4CAF50;">✅ What's Next?</h4>
      <ul style="font-size: 15px; color: #444; line-height: 1.6; padding-left: 20px;">
        <li>📊 Your personalized <strong>Career Roadmap</strong> is now ready.</li>
        <li>🧠 Based on your Day 1, Day 2, and Day 3 answers, we’ve generated a tailored path for your career growth.</li>
        <li>🚀 This roadmap includes recommended roles, action steps, and learning resources.</li>
      </ul>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://your-app-url.com/user/day3home" style="background-color: #4CAF50; color: white; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-size: 16px;">
          View Your Career Roadmap
        </a>
      </div>

      <p style="font-size: 15px; color: #333;">
        Remember, this is just the beginning. You’ve done the self-work — now it’s time to turn insights into action. 💪
      </p>

      <p style="font-size: 15px; color: #333;">Wishing you all the best for your bright future. The world is waiting for your spark. ✨</p>

      <p style="font-size: 15px; color: #4CAF50; font-weight: bold;">– Career AI Assistant Team</p>

      <div style="text-align: center; font-size: 12px; color: #bbb; margin-top: 30px;">
        &copy; ${new Date().getFullYear()} Career AI Assistant. All rights reserved.
      </div>
    </div>
  `,
  });

  res.status(200).json({
    success: true,
    message: "Day 3 form submitted successfully",
    day3: user.quesAns.day3,
  });
});
