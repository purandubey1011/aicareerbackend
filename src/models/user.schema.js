let mongoose = require("mongoose");
let bcrypt = require("bcryptjs");
let jwt = require("jsonwebtoken");

let userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // required: true,
      trim: true,
      maxlength: 32,
      minlength: 2,
      lowercase: true,
    },
    email: {
      type: String,
      // required: true,
      lowercase: true,
      match:
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    },
    contact: {
      type: String,
      // required: [true,"Contact number is required."],
      trim: true,
      maxlength: 10,
      minlength: 10,
      unique: true,
      match: /^[6-9]\d{9}$/,
    },
    password: {
      type: String,
      // required: true,
      trim: true,
      // maxlength: 32,
      minlength: [6, "password must be 6 character."],
      select: false,
    },
    avatar: {
      type: Object,
      default: {
        fileId: "",
        url: "https://imgs.search.brave.com/sHfS5WDNtJlI9C_CT2YL2723HttEALNRtpekulPAD9Q/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA2LzMzLzU0Lzc4/LzM2MF9GXzYzMzU0/Nzg0Ml9BdWdZemV4/VHBNSjl6MVljcFRL/VUJvcUJGMENVQ2sx/MC5qcGc",
      },
    },
    // Questions and answers grouped by day
    quesAns: {
      day1: {
        type: [
          {
            question: { type: String, required: true },
            answer: { type: String, required: true },
          },
        ],
        default: [],
      },
      day1SubmittedAt: { type: Date },

      day2: {
        type: [
          {
            question: { type: String, required: true },
            answer: { type: String, required: true },
          },
        ],
        default: [],
      },
      day2SubmittedAt: { type: Date },

      day3: {
        type: [
          {
            question: { type: String, required: true },
            answer: { type: String, required: true },
          },
        ],
        default: [],
      },
      day3SubmittedAt: { type: Date },
    },

    careerResponse: {
      type: [],
      default: [],
    },
    selectedCareer: {
      type: [],
      default: [],
    },
    day1response: {
      type: [],
      default: [],
    },
    day2response: {
      type: [],
      default: [],
    },
    resetPasswordToken: {
      type: String,
      default: "0",
    },
    resetPasswordExpires: {
      type: Date,
    },
    carrerPdfUrl: {
      type: String,
      default: "",
    },
    isPaymentDone: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  let salt = await bcrypt.genSaltSync(10);
  this.password = await bcrypt.hashSync(this.password, salt);
});

userSchema.methods.comparepassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getjwttoken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model("User", userSchema);
