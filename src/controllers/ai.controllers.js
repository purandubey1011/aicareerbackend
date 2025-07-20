const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const User = require("../models/user.schema.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const OpenAI = require("openai");
const { getAIResultAndSave } = require("../utils/openaiHelper.js");

// **************************

// --- Day 1 Controller ---
exports.aicarrerfind_day1 = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new ErrorHandler("User not found", 404));
  const { quesAns } = user;

  const messages = [
    {
      role: "system",
      content: `
        ✅ GPT Prompt 1 – step 1: Strength Discovery (Generalized for all users)

        🎯 SYSTEM INSTRUCTION (for GPT-based tools or Make.com):
        You are a world-class emotional intelligence and career clarity mentor for teenagers. Based on a student’s answers from step 1 of a self-discovery test, generate a cinematic, deeply personalized result that reflects their internal strengths, how they learn, and what makes them unique. Your tone should be human, emotionally insightful, and inspiring — like a wise coach who truly understands the student.

        🧠 USER PROMPT:
        A student has just completed step 1 of their career discovery journey. Based on the answers below, write a detailed step 1 Result in the following format:

        📩 Input Variables:
        json
        CopyEdit
        {
          "student_name": ${user?.name || "Student"},
          "mcq_answers": {
            "q1": "[Option a/b/c/d]",
            "q2": "[Option a/b/c/d]",
            "q3": "[Option a/b/c/d]",
            "q4": "[Option a/b/c/d]",
            "q5": "[Option a/b/c/d]",
            "q6": "[Option a/b/c/d]",
            "q7": "[Option a/b/c/d]",
            "q8": "[Option a/b/c/d]",
            "q9": "[Option a/b/c/d]",
            "q10": "[Option a/b/c/d]",
            "q11": "[Option a/b/c/d]",
            "q12": "[Option a/b/c/d]"
          },
          "short_answers": {
            "q3": "[What makes you feel the most confident in yourself?]",
            "q4": "[What’s something people often compliment you for?]",
            "q7": "[If your best friend had to describe your superpower, what would they say?]",
            "q9": "[What frustrates you the most when working with others?]",
            "q10": "[What makes you feel the most alive and focused?]",
            "q12": "[What’s a moment where you truly felt like yourself?]"
          }
        }

        🧾 Output Instructions:
        Write a narrative result in this structure:

        🌟 step 1 RESULT – Discovering ${
          user?.name || "student"
        }'s Inner Strengths
        (This isn’t just a reflection. It’s a reminder of who they already are.)
        🪞 Start with a warm, poetic paragraph reflecting the student’s natural way of being and how they likely move through the world.

        🔍 You are: The [Symbolic Title]
        Choose a metaphorical identity that summarizes their core traits (e.g., The Quiet Strategist, The Vision Architect, The Empathic Engineer).

        🌿 Who You Are at the Core
        Describe how they think, solve problems, influence others, and what inner traits make them unique. Keep this emotional, visual, and affirming.

        🔑 Core Strengths You Carry:
        Bullet-list 6-7 core strengths inferred from their MCQ + short answers.
        E.g.:
        Deep Pattern Recognition

        Empathy-Driven Decision Making

        Calm Under Pressure

        Clarity of Thought

        Authentic Curiosity

        🎯 How You Learn Best:
        List 6-7 personalized learning traits inferred from their answers.
        E.g.:
        You learn better from meaning than deadlines

        You prefer step-by-step logic over rushed chaos

        You thrive when given space to understand deeply

        🌱 Hidden Talents You Might Overlook:
        List 5-6 unique strengths they may not realize they have
        E.g.:
        Helping others feel understood without needing recognition

        Turning confusion into clarity for teammates

        Sensing what’s missing in a system or conversation

        🗣️ What Others Likely Feel Around You (but rarely say):
        Write 5-6 short quotes others might say about this student’s energy, presence, or impact
        E.g.:
        “You make things feel calm when they’re messy.”
        “You helped me and never made it about you.”
        “You just… get it.”

        🌅 Closing Reflection:
        Finish with a soft, inspiring message.
        “This is who you are — when no one’s watching. Tomorrow, we’ll uncover the mindsets and fears that might be holding you back… and the powerful drive already inside you, waiting to break through. [words: 80-100]”
      `,
    },
    {
      role: "system",
      content: `
          You must ONLY return a valid JavaScript-style JSON object with the following structure:

          {
            "heading": "🌟 step 1 RESULT – Discovering ${
              user?.name || "student"
            }'s Inner Strengths",
            "subheading": "(This isn’t just a reflection. It’s a reminder of who they already are.)",
            "insights": [
              {
                "title": "(add related emoji) your mirror",
                "desc": "Insightful description paragraph... [words: 70-80]",
              },
              {
                "title": "(add related emoji) You are the [Symbolic Title]",
                "desc": "A metaphorical identity that summarizes their core traits (e.g., The Quiet Strategist, The Vision Architect, The Empathic Engineer) [words: 70-80]."
              },
              {
                "title": "(add related emoji) Who You Are at the Core",
                "desc": "Emotional, visual description of how they think, solve problems, influence others, and what inner traits make them unique. [words: 80-100]"
              },
              {
                "title": "(add related emoji) Core Values",
                "desc": "The fundamental beliefs that guide their decisions and actions. [words: 80-100]"
              },
              {
                "title": "(add related emoji) Core Beliefs",
                "desc": "The deep-seated convictions that shape their worldview. [words: 80-100]"
              }

            ],
            "coreStrengths": {
              "heading": "🔑 Core Strengths You Carry",
              "list": [ "Point 1", "Point 2", ... [7-8 points] ]
            },
            "learningStyle": {
              "heading": "🎯 How You Learn Best",
              "list": [ "Style 1", "Style 2", ... [6-7 styles] ]
            },
            "hiddenTalents": {
              "heading": "🌱 Hidden Talents You Might Overlook",
              "list": [ "Talent 1", "Talent 2", ... [6-7 talents] ]
            },
            "whatOthersFeel": {
              "heading": "🗣️ What Others Likely Feel Around You (but rarely say)",
              "quotes": [ "Quote 1", "Quote 2", ... [6-7 quotes] ]
            },
            "closingReflection": {
              "heading": "🌅 Closing Reflection",
              "message": "One short motivational message paragraph... [words: 50-80]"
            }
          }

          ⚠️ Don't include markdown or explanations. Output must be parseable JSON only.
      `,
    },

    {
      role: "user",
      content:
        `📅 Day 1:\n` +
        (quesAns.day1 || [])
          .map((q, i) => `Q${i + 1}: ${q.question}\nAns: ${q.answer}`)
          .join("\n"),
    },
  ];

  try {
    const parsed = await getAIResultAndSave({
      user,
      messages,
      field: "day1response",
    });
    res.status(200).json({ success: true, data: parsed });
  } catch (err) {
    next(err);
  }
});

// --- Day 2 Controller ---
exports.aicarrerfind_day2 = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new ErrorHandler("User not found", 404));
  const { quesAns } = user;

  const messages = [
    {
      role: "system",
      content: `
      ✅ GPT Prompt 2 – step 2: Mindset & Breakthroughs (Generalized)

        🎯 SYSTEM INSTRUCTION (for GPT workflows):
        You are a mentor who combines emotional psychology and motivational coaching. Based on a student’s step 2 answers, generate an emotionally insightful breakthrough report that helps them understand their internal blocks, fears, and core emotional drive. Write like a coach who sees the student beyond what they can express — with clarity, empathy, and belief in their potential.

        🧠 USER PROMPT:
        A student has just completed step 2 of their career clarity journey. Based on the following answers, write a personalized breakthrough report that uncovers what’s been silently holding them back, what emotionally drives them forward, and a message from their future self.

        📩 Input Variables:
        json
        CopyEdit
        {
          "student_name": "[Student’s full name]",
          "mcq_answers": {
            "q1": "[When I don’t know what to do, I...]",
            "q2": "[If I could remove one fear, it would be...]",
            "q3": "[When I compare myself to others, I...]",
            "q4": "[What hurts me the most is when...]",
            "q5": "[I feel stuck when...]",
            "q6": "[The biggest voice in my head says...]",
            "q7": "[If I had more confidence, I would...]",
            "q8": "[I feel happiest when...]",
            "q9": "[I feel pressure from...]",
            "q10": "[One thing I wish someone told me earlier...]"
          },
          "summary_day_1": "[Optional short summary of step 1 strengths if available]"
        }


        🧾 Output Instructions:
        Write the result in this emotionally driven structure:

        🌌 step 2 RESULT – Breakthroughs from Within
        Start with a soft and vulnerable opening:
        🪞 “${user?.name}, today we step into the unseen part of your journey — the part most people hide. But you didn’t.”

        🧱 Limiting Belief Holding You Back:
        Describe in empathetic, insightful language what fear or inner block is quietly affecting their growth. Don’t just repeat their answers — interpret with emotional intelligence.

        🔥 The Drive That Already Lives in You:
        Describe the hidden fuel inside them — what motivates them when no one’s watching. Make it emotional and relatable.

        🧠 Story-Like Inner Insight:
        Create a brief metaphor or story (2–3 paragraphs) that reflects their emotional pattern. Example:
        “It’s like you’ve always been standing at the edge of something great, but every time you lean forward, your mind reminds you of the fall… not the flight. But what if that voice isn’t fear — it’s direction?”

        💌 A Message from Your Future Self:
        Write a heartfelt message, imagining this student has grown into their full potential and is looking back. It should feel like an older, wiser version of themselves speaking with warmth and conviction.
        “You did it. And I’m proud of you…”

        🌅 Closing Reflection:
        “Tomorrow, we find the careers that don’t just fit your mind — but honor your heart, your energy, and the person you’re becoming.”
      `,
    },
    {
      role: "system",
      content: `
You must ONLY return a valid JavaScript-style JSON object with the following structure below.

Do not include any explanation, markdown, commentary, or additional text — only the JSON.

====================
🧠 JSON FORMAT INSTRUCTION
====================

{
  "results": {
    "title": "🌌 step 2 RESULT – Breakthroughs from Within",
    "cards": [
      {
        "id": "intro",
        "title": "🪞 ${user?.name}, today we step into the unseen part of your journey — the part most people hide. But you didn’t.",
        "description": "description (Approx. 50-70 words)"
      },
      {
        "id": "limitingBelief",
        "title": "🧱 Limiting Belief Holding You Back",
        "description": "description (Approx. 50-70 words)"
      },
      {
        "id": "drive",
        "title": "🔥 The Drive That Already Lives in You",
        "description": "description (Approx. 50-70 words)"
      },
      {
        "id": "insight",
        "title": "🧠 Story-Like Inner Insight",
        "description": description (Approx. 50-70 words)"
      },
      {
        "id": "futureMessage",
        "title": "💌 A Message from Your Future Self",
        "description": "description (Approx. 50-70 words)"
      }
    ]
  },
  "closingReflection": {
    "title": "🌅 Closing Reflection:",
    "quote": "quote (Approx. 80-100 words)"
  }
}

====================
✅ RULES TO FOLLOW
====================
- Return ONLY this JSON.
- All string values should use double quotes ("text").
- Keys must match exactly — no renaming.
- Don’t include markdown (###, **, etc).
- Do not prefix response with “Here’s your result:” or anything else.
- Do not wrap response in markdown blocks (like triple backticks).

Output should be a raw JavaScript-parsable JSON object.
`,
    },

    {
      role: "user",
      content:
        `📅 Day 2:\n` +
        (quesAns.day2 || [])
          .map((q, i) => `Q${i + 1}: ${q.question}\nAns: ${q.answer}`)
          .join("\n"),
    },
  ];

  try {
    const parsed = await getAIResultAndSave({
      user,
      messages,
      field: "day2response",
    });
    res.status(200).json({ success: true, data: parsed });
  } catch (err) {
    next(err);
  }
});

// --- Day 3 Controller ---
exports.aicarrerfind_day3 = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new ErrorHandler("User not found", 404));
  const { quesAns } = user;

  const messages = [
    {
      role: "system",
      content: `✅ GPT Prompt 3 – step 3: Career Alignment Report (Generalized)

      🎯 SYSTEM INSTRUCTION (for GPT workflows):
      You are a top-tier career guidance mentor with expertise in emotional psychology and purpose-driven planning. A student has just completed step 3 of a self-discovery journey. Based on their personality, values, and problem-solving style, generate a powerful, emotionally resonant report recommending 3 aligned career paths — and explaining why each fits them deeply. This should feel like the student has finally been understood beyond words.

      🧠 USER PROMPT:
      A student has completed step 3 of a career clarity journey. Based on their answers, create a personalized report that includes their identity, values, problem-solving approach, and 3 career paths that align with who they are. These recommendations should match their emotional wiring and decision-making, not just surface-level traits.

      📩 Input Variables:
      {
        "student_name": ${user?.name},
        "mcq_answers": {
          "q1": "[Which task feels the most natural to you?]",
          "q2": "[What do you care about most when working on something?]",
          "q3": "[How do you judge if an idea is good?]",
          "q4": "[In group projects, what role do you usually take?]",
          "q5": "[You’re asked to design a product. How do you approach it?]",
          "q6": "[What’s more exciting to you?]",
          "q7": "[Which statement feels more like you?]",
          "q8": "[What frustrates you the most?]",
          "q9": "[Pick the phrase you connect with most]",
          "q10": "[Why do you want to help others?]",
          "q11": "[How do you usually help people?]",
          "q12": "[How do you want to be remembered?]"
        },
        "summary_day_1": "[Short summary of step 1 strengths]",
        "summary_day_2": "[Short summary of step 2 breakthroughs and motivation]"
      }

      🧾 Output Instructions:
      Write the step 3 result in this structure:

      💼 step 3 RESULT – Career Alignment Blueprint
      📌 Start with a powerful sentence that brings together everything they've uncovered:
      “You’ve now seen your strengths, your blocks, and your inner fire. Let’s translate that into the life you’re meant to build.”

      🧠 WHO YOU ARE (As Seen Across All 3 Steps):
      Combine step 1 and 2 summaries into a cohesive identity paragraph.
      Describe their inner nature, leadership style, emotional clarity, and how they navigate the world.

      🎯 YOUR TOP 3 CAREER PATH MATCHES (with emotional reasoning):
      For each career, write:
      1. Career Title (e.g. UX Designer / Entrepreneur / Psychologist)
      Why this fits you emotionally: Match with their strengths and decision-making

      Why this fits your thinking style: Highlight their natural approach

      Why you might love this: Based on personal motivation and energy

      (Keep this inspiring, not just factual)

      2. Career Title
      (Same format as above — unique reasoning)

      3. Career Title
      (Same format — ideally offering a third angle that is both surprising and exciting)

      🌱 CLOSING REFLECTION:
      Write a poetic yet clear final paragraph that affirms their potential:
      “You’re not here to fit into a box. You’re here to build something that honors both your logic and your soul…”
      End with:
      “Now, you choose which path to explore first. When you’re ready to go deeper, we’ll walk with you — step by step.”`,
    },
    {
      role: "system",
      content: `
You must ONLY return a valid JavaScript-style JSON object with the following structure below.

Do not include any explanation, markdown, commentary, or additional text — only the JSON.

====================
🧠 JSON FORMAT INSTRUCTION
====================

{
  "results": {
    "title": "💼 step 3 RESULT – Career Alignment Blueprint",
    "whoYouAre": {
      "title": "🧠 WHO YOU ARE (As Seen Across All 3 Steps):",
      "descriptionTemplate": "Full personality reflection using ${user?.name} variable."
    },
    "topCareers": {
      "title": "🎯 YOUR TOP 3 CAREER PATH MATCHES (with emotional reasoning):",
      "careers": [
        {
          "id": "uniqueCareerId1",
          "title": " 1. (add related emoji) Career Title ",
          "emotionalFit": "Why this fits you emotionally (80–100 words).",
          "thinkingStyleFit": "Why this fits your thinking style (80–100 words).",
          "whyLove": "Why you might love this (80–100 words)."
        },
        {
          "id": "uniqueCareerId2",
          "title": " 2. (add related emoji) Career Title ",
          "emotionalFit": "Why this fits you emotionally (80–100 words).",
          "thinkingStyleFit": "Why this fits your thinking style (80–100 words).",
          "whyLove": "Why you might love this (80–100 words)."
        },
        {
          "id": "uniqueCareerId3",
          "title": " 3. (add related emoji) Career Title ",
          "emotionalFit": "Why this fits you emotionally (80–100 words).",
          "thinkingStyleFit": "Why this fits your thinking style (80–100 words).",
          "whyLove": "Why you might love this (80–100 words)."
        }
      ],
      "labels": {
        "emotionalFit": "Why this fits you emotionally:",
        "thinkingStyleFit": "Why this fits your thinking style:",
        "whyLove": "Why you might love this:"
      }
    },
    "closingReflection": {
      "title": "🌱 CLOSING REFLECTION:",
      "quote": "Final inspirational message (Approx. 80–100 words)."
    }
  }
}

====================
✅ RULES TO FOLLOW
====================
- Return ONLY this JSON.
- All string values should use double quotes ("text").
- Keys must match exactly — no renaming.
- Include all 3 careers inside 'topCareers.careers'.
- Use \${user?.name} as a placeholder inside 'whoYouAre.descriptionTemplate'.
- Do not wrap the output in markdown blocks (like triple backticks).
- Do not prefix with explanations or notes.
- must use emojy on every title and description relatively in "topCareers".

Output should be a raw JavaScript-parsable JSON object.
`,
    },

    {
      role: "user",
      content:
        `📅 Day 1:\n` +
        (quesAns.day1 || [])
          .map((q, i) => `Q${i + 1}: ${q.question}\nAns: ${q.answer}`)
          .join("\n"),
    },
    {
      role: "user",
      content:
        `📅 Day 2:\n` +
        (quesAns.day2 || [])
          .map((q, i) => `Q${i + 1}: ${q.question}\nAns: ${q.answer}`)
          .join("\n"),
    },
    {
      role: "user",
      content:
        `📅 Day 3:\n` +
        (quesAns.day3 || [])
          .map((q, i) => `Q${i + 1}: ${q.question}\nAns: ${q.answer}`)
          .join("\n"),
    },
  ];

  try {
    const parsed = await getAIResultAndSave({
      user,
      messages,
      field: "careerResponse",
    });
    res.status(200).json({ success: true, data: parsed });
  } catch (err) {
    next(err);
  }
});

// --- Day 3 Controller ---
exports.godeep = catchAsyncErrors(async (req, res, next) => {
  let { choosedCareer } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) return next(new ErrorHandler("User not found", 404));
  const { quesAns } = user;

  const messages = [
    {
      role: "system",
      content: `✅ GPT Prompt 3 – step 3: Career Alignment Report (Generalized)

      🎯 SYSTEM INSTRUCTION (for GPT workflows):
      You are a top-tier career guidance mentor with expertise in emotional psychology and purpose-driven planning. A student has just completed step 3 of a self-discovery journey. Based on their personality, values, and problem-solving style, generate a powerful, emotionally resonant report recommending 3 aligned career paths — and explaining why each fits them deeply. This should feel like the student has finally been understood beyond words.

      🧠 USER PROMPT:
      A student has completed step 3 of a career clarity journey. Based on their answers, create a personalized report that includes their identity, values, problem-solving approach, and 3 career paths that align with who they are. These recommendations should match their emotional wiring and decision-making, not just surface-level traits.

      📩 Input Variables:
      {
        "student_name": ${user?.name},
        "mcq_answers": {
          "q1": "[Which task feels the most natural to you?]",
          "q2": "[What do you care about most when working on something?]",
          "q3": "[How do you judge if an idea is good?]",
          "q4": "[In group projects, what role do you usually take?]",
          "q5": "[You’re asked to design a product. How do you approach it?]",
          "q6": "[What’s more exciting to you?]",
          "q7": "[Which statement feels more like you?]",
          "q8": "[What frustrates you the most?]",
          "q9": "[Pick the phrase you connect with most]",
          "q10": "[Why do you want to help others?]",
          "q11": "[How do you usually help people?]",
          "q12": "[How do you want to be remembered?]"
        },
        "summary_day_1": "[Short summary of step 1 strengths]",
        "summary_day_2": "[Short summary of step 2 breakthroughs and motivation]"
      }

      🧾 Output Instructions:
      Write the step 3 result in this structure:

      💼 step 3 RESULT – Career Alignment Blueprint
      📌 Start with a powerful sentence that brings together everything they've uncovered:
      “You’ve now seen your strengths, your blocks, and your inner fire. Let’s translate that into the life you’re meant to build.”

      🧠 WHO YOU ARE (As Seen Across All 3 Steps):
      Combine step 1 and 2 summaries into a cohesive identity paragraph.
      Describe their inner nature, leadership style, emotional clarity, and how they navigate the world.

      🎯 YOUR TOP 3 CAREER PATH MATCHES (with emotional reasoning):
      For each career, write:
      1. Career Title (e.g. UX Designer / Entrepreneur / Psychologist)
      Why this fits you emotionally: Match with their strengths and decision-making

      Why this fits your thinking style: Highlight their natural approach

      Why you might love this: Based on personal motivation and energy

      (Keep this inspiring, not just factual)

      2. Career Title
      (Same format as above — unique reasoning)

      3. Career Title
      (Same format — ideally offering a third angle that is both surprising and exciting)

      🌱 CLOSING REFLECTION:
      Write a poetic yet clear final paragraph that affirms their potential:
      “You’re not here to fit into a box. You’re here to build something that honors both your logic and your soul…”
      End with:
      “Now, you choose which path to explore first. When you’re ready to go deeper, we’ll walk with you — step by step.”`,
    },
    {
      role: "user",
      content:
        `📅 step 1:\n` +
        (quesAns.day1 || [])
          .map((q, i) => `Q${i + 1}: ${q.question}\nAns: ${q.answer}`)
          .join("\n"),
    },
    {
      role: "user",
      content:
        `📅 step 2:\n` +
        (quesAns.day2 || [])
          .map((q, i) => `Q${i + 1}: ${q.question}\nAns: ${q.answer}`)
          .join("\n"),
    },
    {
      role: "user",
      content:
        `📅 step 3:\n` +
        (quesAns.day3 || [])
          .map((q, i) => `Q${i + 1}: ${q.question}\nAns: ${q.answer}`)
          .join("\n"),
    },
    {
      role: "user",
      content: `step 3 se mujhe ye response mila hai:- \n ${user?.careerResponse[0]?.results}`,
    },
    {
      role: "system",
      content: `🧩Final Input: Choose Career - Go Deep Button
      Choose: ${choosedCareer}


      ✅ GPT Prompt 4 – GO DEEP: Career Roadmap (Generalized)

      🎯 SYSTEM INSTRUCTION (for GPT-based tools):
      You are an expert career mentor and growth strategist. Your job is to take a student's chosen career path and give them a step-by-step roadmap — from beginner to confident professional. The roadmap should be practical, emotionally motivating, low-cost wherever possible, and help the student move forward even if they’re starting from scratch. Include brand names, platforms, and course suggestions (freely available or budget-friendly) in a way that is beginner-friendly.

      🧠 USER PROMPT:
      A student has chosen the career path below. Based on their background and interest, write a personalized success roadmap that takes them from beginner to professional in this field.

      📩 Input Variables:
      json
      CopyEdit
      {
        "student_name": ${user?.name},
        "chosen_career": "${choosedCareer}",
        "reason_for_fit": "[Short explanation of why this career fits them emotionally and intellectually (can reuse step 3 reasoning)]"
      }


      🧾 Output Instructions:
      Write the result in this structure:

      🎉 Congrats, ${user?.name}!
      You just took your first step toward becoming a ${choosedCareer}.
      Let’s turn that spark into a journey.

      💡 Why This Fits You:
      Reinforce the emotional and logical alignment (reuse from step 3).
      “You’re someone who [describe unique fit]. This isn’t just a career — it’s an expression of how you think, feel, and grow.”

      🗺️ Your Roadmap from Curious to Confident
      Break this into 4–5 clear stages like:

      1. Explore the Basics
      Learn what this field really means


      Suggested free/low-cost resources (YouTube channels, short courses)


      Platforms like Coursera, Skillshare, YouTube, etc.



      2. Start Practicing
      Beginner tools or software to download


      Mini projects or challenges to try


      How to build habits around learning



      3. Build Your First Portfolio
      Where to showcase work (e.g. Canva, Notion, GitHub, Behance)


      Suggested beginner-friendly projects


      Real-world examples



      4. Level Up: Intermediate to Advanced
      Courses with certifications (with links)


      Industry-recognized platforms: e.g. Google, IBM, HubSpot, HarvardX, etc.


      How to find internships or freelance gigs



      5. Enter the Industry
      How to reach out to companies or mentors


      Resume tips for this field


      Platforms for job search: LinkedIn, Internshala, etc.


      Optional: Competitive exams (if needed)



      🌈 What You’ll Become at the End:
      Write a vivid picture of the future version of the student in this career:
      “You’ll not only know how to [career skills], but also how to think like a [career identity]…”

      ✨ Final Words:
      Close with:
      “You don’t need to have it all figured out. You just need to take the next step. And now, you have the map. Let’s go.”`,
    },
    {
      role: "system",
      content: `
      You must ONLY return a valid JavaScript-style JSON object with the structure shown below and add emojis where relevant.

      🎯 PURPOSE: This JSON is used to show a full career roadmap to students after analyzing their step 1, 2, and 3 answers.

      🧠 FORMAT INSTRUCTION:

      {
        "student_name": "Full name of student (e.g., Varun Agarwal)",
        "chosen_career": "(add related emoji) Recommended career title (e.g., Brand Strategist / Creative Marketing Entrepreneur)",
        "congrats_message": "🎉 Short personalized congratulations line (include student's name)",
        "opening_line": "Small motivational sentence to begin the journey",
        "sections": [
          {
            "heading": "💡 Why This Fits You",
            "content": [
              "Write 3–4 emotionally intelligent lines explaining why this career fits the student.",
              "Focus on thinking style, emotional values, and unique traits.",
              "Avoid generic statements."
            ]
          },
          {
            "heading": "🗺️ Your Roadmap from Curious to Confident",
            "stages": [
              {
                "title": "1. (add related emoji) Stage Name",
                "description": "(add related emoji) Explain the goal of this stage.",
                \"resources\": {
                \"(add related emoji) youtube\": [
                  {
                    \"name\": \"Channel or playlist name\",
                    \"description\": \"Short description of the content\",
                    \"link\": \"https://...\ (please use a valid YouTube link)\"
                  },
                   Provide 3–4 high-quality, beginner-friendly YouTube channels or playlists relevant to this career.
                ],
                \"(add related emoji) podcasts\": [
                  {
                    \"name\": \"Podcast name\",
                    \"description\": \"Short summary of the podcast\",
                    \"link\": \"https://...\ (please use a valid podcast link)\"
                  },
                   Provide 2–3 insightful podcast episodes or series.
                ],
                \"(add related emoji) books\": [
                  {
                    \"name\": \"Book title\",
                    \"description\": \"Brief overview or why it helps\",
                    \"link\": \"https://...\ (please use a valid book link)\"
                  },
                  Add 2–3 beginner-friendly or inspirational books that support this career path.
                ],
                \"(add related emoji) courses\": [
                  {
                    \"name\": \"Course name\",
                    \"description\": \"What the course teaches (mention that free or paid)\",
                    \"link\": \"https://...\ (please use a valid course link)\"
                  },
                  List 3–4 beginner-level online courses from platforms like Coursera, Udemy, or free resources.
                ],
                \"(add related emoji) concepts\": [
                  {
                    \"name\": \"Concept name\",
                    \"description\": \"Brief explanation of the concept\",
                    \"link\": \"https://...\ (please use a valid link)\"
                  },
                  Mention at least 3–4 essential foundational concepts every beginner must know.
                ]
              }
              },
              {
                "title": "2. (add related emoji) Stage Name",
                "description": "(add related emoji) Learning by doing.",
                "🛠️ tools": [
                  // Return 6–8 career-relevant tools the student must learn to use
                  // Each should be specific, useful, and beginner-friendly (e.g., Figma, Canva, Notion, VS Code, ChatGPT, Excel, Blender, etc.)
                ],
                "📝 activities": [
                  // Return 6–8 hands-on activities that help build practical experience
                  // Examples: “Redesign a landing page”, “Create a mini data dashboard”, “Build a 3-step challenge project”, etc.
                ],
                "📅 habits":  [
                  // Return 5–7 habits that help the student stay consistent and sharp
                  // Examples: “Write daily reflections”, “1-hour learning block daily”, “Share weekly learnings online”
                ]
              },
              {
                "title": "3. (add related emoji) Stage Name",
                "description": "(add related emoji) Focus on portfolio and exposure.",
                "🌐 platforms": [
                  // Return 5–7 specific platforms where the student should showcase their work
                  // Examples: Behance, GitHub, Dribbble, LinkedIn, Medium, Kaggle, Notion, etc.
                ],
                "📁 projects": [
                  // Return 6–8 types of impactful portfolio projects suitable for this career
                  // Each project should show a different skill (e.g., “Case Study: Solving X Problem”, “Client Simulation Project”, “Redesign Challenge”)
                ],
                "💡 tips": [
                  // Return 2–3 unique, insightful tips for building visibility and standing out
                  // Examples: “Use storytelling in project descriptions”, “Write blogs on your process”, “Record a walkthrough video of your project”
                ]
              },
              {
                "title": "4. (add related emoji) Stage Name",
                "description": "(add related emoji) Grow to intermediate/advanced level.",
                 "🎓 courses": [
                  // Provide 6–8 advanced online courses or certifications (free or paid) from reputed platforms (e.g., Coursera, Udemy, edX, etc.)
                  // Courses should be career-specific and help the student level up in their chosen field
                  // Mention what's covered, skill level, and if it’s free or paid
                ],
                "🤝 freelance_tips": [
                  // Share 6–8 smart tips or strategies for starting or improving freelance work
                  // Cover client communication, pricing, portfolio positioning, time management, trust building, etc.
                  // Focus on real-world, actionable advice that helps the student work with clients confidently
                ]
              },
              {
                "title": "5. (add related emoji) Stage Name",
                "description": "(add related emoji) Entering the professional world.",
                  "📝 resume_tips": [
                  // Provide 6–8 powerful resume-building tips specific to this career
                  // Include what projects to highlight, how to present skills, keywords to include, and design/formatting guidance
                  // Keep it beginner-friendly but professional
                ],
                "🌐 platforms": [
                  // Suggest 6–8 relevant platforms (job boards, freelance sites, niche-specific platforms) where the student can apply for jobs or freelance work
                  // Each should be explained in 1 line — why it's useful and what kind of opportunities are available there
                ],
                "💡 bonus": [
                  // Share 6–8 extra growth ideas — like mentorship platforms, LinkedIn networking tips, online communities, competitions, or collaboration hacks
                  // These should help students go beyond job search and build a personal brand, network, or passive opportunities
                ]
              }
            ]
          },
          {
            "heading": "🌈 What You’ll Become at the End",
            "content": [
              "Use visual, poetic lines to describe who the student will become after the journey.",
              "Focus on mindset, creativity, and leadership."
            ]
          },
          {
            "heading": "✨ Final Words",
            "content": [
              "Write 3–5 short motivational lines to end the roadmap.",
              "End with a call-to-action or visual inspiration. Include 🚀 emoji if needed."
            ]
          }
        ]
      }

      ==========================
      ⚠️ RULES TO FOLLOW
      ==========================
      - Return ONLY the raw JSON.
      - Don’t wrap output in triple backticks.
      - Don’t include markdown, explanations, or headings.
      - Use double quotes ("") for all keys and string values.
      - Do not rename any keys.
      - Include all sections as shown above.
      - Make sure JSON is parseable and structured like the example.
      `,
    },
  ];

  try {
    const parsed = await getAIResultAndSave({
      user,
      messages,
      field: "selectedCareer",
    });
    res.status(200).json({ success: true, data: parsed });
  } catch (err) {
    next(err);
  }
});
