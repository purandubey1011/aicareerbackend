const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const User = require("../models/user.schema.js");
const ErrorHandler = require("./ErrorHandler.js");
const OpenAI = require("openai");

exports.getAIResultAndSave = async ({ user, messages, field }) => {
  try {
    // Validate basic inputs
    if (!user || !messages || !field) {
      throw new ErrorHandler("Missing required parameters", 400);
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.2,
      messages,
    });

    const content = response?.choices?.[0]?.message?.content;
    if (!content) {
      throw new ErrorHandler("No response content from OpenAI", 500);
    }

    // Clean and parse JSON
    let parsed;
    try {
      const cleaned = content.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ JSON parse error:", err.message);
      throw new ErrorHandler(`AI response is not valid JSON: ${err.message}`, 500);
    }

    // Store result in user
    user[field] = user[field] || []; // ensure it's an array
    user[field].push({ ...parsed, createdAt: new Date() });

    await user.save();

    return parsed;
  } catch (error) {
    // Optional: log the full error for debugging
    console.error("❌ Error in getAIResultAndSave:", error);
    // Re-throw for global error handler
    throw error instanceof ErrorHandler
      ? error
      : new ErrorHandler("Something went wrong while getting AI result", 500);
  }
};
